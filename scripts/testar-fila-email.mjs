/**
 * Prova o processador da fila de e-mail (db/019 + app/api/fila-email) de ponta a ponta, em
 * modo `registro` — NENHUM e-mail sai. Precisa do `next dev` em http://localhost:3000 (ou
 * FILA_EMAIL_URL) com o .env carregado.
 *
 * TRAVA DE SEGURANÇA: antes de enfileirar qualquer coisa, pergunta à rota o modo (POST {ids: []})
 * e ABORTA se não for `registro`. Destinatário só `teste@example.com` (domínio reservado, RFC 2606).
 *
 * O que se prova:
 *   - a rota recusa sem segredo / com segredo errado (401), e o middleware não a desvia para /entrar;
 *   - anon e authenticated não executam fn_email_pegar_lote nem fn_email_enfileirar, e não inserem
 *     na fila (o relay aberto continua fechado);
 *   - duas chamadas SIMULTÂNEAS da rota com os mesmos ids processam cada linha UMA vez;
 *   - duas chamadas SIMULTÂNEAS de fn_email_pegar_lote devolvem lotes disjuntos;
 *   - registro → status `registrado`, enviado_em nulo, provedor `registro`; anexo real baixado;
 *     anexo inexistente → `pendente` com backoff e erro;
 *   - terceira chamada não reprocessa (idempotência);
 *   - trigger: `enviado` não volta; conteúdo congelado depois da 1ª tentativa; `registrado` volta.
 *
 * Limpeza: linhas com assunto EXATO `__teste_fila_email__` (eq, nunca like) e o objeto de Storage
 * `anexos/__teste_fila_email__/anexo.pdf`.
 *
 *   node scripts/testar-fila-email.mjs
 */

import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const env = lerEnv()
const BASE = process.env.FILA_EMAIL_URL ?? 'http://localhost:3000'
const ROTA = `${BASE}/api/fila-email`
const SEGREDO = env.FILA_EMAIL_SEGREDO
const MARCADOR = '__teste_fila_email__'
const PARA = 'teste@example.com'
const BUCKET = 'anexos'
const OBJETO = `${MARCADOR}/anexo.pdf`

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const casos = []
function caso(nome, ok, detalhe = '') {
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok || !detalhe ? '' : `  (${detalhe})`}`)
}

async function chamar(corpo, segredo = SEGREDO, metodo = 'POST') {
  const r = await fetch(ROTA, {
    method: metodo,
    redirect: 'manual',
    headers: {
      ...(segredo ? { Authorization: `Bearer ${segredo}` } : {}),
      'Content-Type': 'application/json',
    },
    body: metodo === 'POST' ? JSON.stringify(corpo) : undefined,
  })
  return { status: r.status, json: await r.json().catch(() => null) }
}

async function enfileirar(n, anexos = []) {
  const { data, error } = await admin.rpc('fn_email_enfileirar', {
    p_email: {
      para: PARA,
      assunto: MARCADOR,
      corpo: `<p>mensagem de teste ${n}</p>`,
      remetente_nome: 'Teste Fila',
      criado_por: CRIADOR,
    },
    p_anexos: anexos,
  })
  if (error) throw new Error(`enfileirar: ${error.message}`)
  return data
}

async function linhas(ids) {
  const { data, error } = await admin
    .from('email_outbox')
    .select('id, status, tentativas, enviado_em, provedor, provedor_id, erro, proximo_envio_em, lote_id')
    .in('id', ids)
  if (error) throw new Error(error.message)
  return new Map(data.map((l) => [l.id, l]))
}

async function limpar() {
  await admin.from('email_outbox').delete().eq('assunto', MARCADOR)
  await admin.storage.from(BUCKET).remove([OBJETO])
}

let CRIADOR

async function main() {
  if (!SEGREDO || SEGREDO.length < 32) throw new Error('FILA_EMAIL_SEGREDO ausente/curto no .env')

  // ------------------------------------------------------------ 0. trava: só em registro
  console.log('\n0. Rota e modo')
  const semAuth = await chamar({ ids: [] }, null)
  caso('POST sem segredo → 401 (e não redireciona para /entrar)', semAuth.status === 401, `veio ${semAuth.status}`)
  const errado = await chamar({ ids: [] }, 'x'.repeat(43))
  caso('POST com segredo errado → 401', errado.status === 401, `veio ${errado.status}`)
  const getSem = await chamar(null, null, 'GET')
  caso('GET (cron) sem segredo → 401', getSem.status === 401, `veio ${getSem.status}`)
  const ruim = await chamar({ ids: ['nao-e-uuid'] })
  caso('POST com id inválido → 400', ruim.status === 400, `veio ${ruim.status}`)

  const modo = await chamar({ ids: [] })
  if (modo.status !== 200 || modo.json?.modo !== 'registro') {
    console.error(`\nABORTADO: a rota não está em modo registro (${modo.status} ${JSON.stringify(modo.json)}).`)
    console.error('Nada foi enfileirado. Confira EMAIL_MODO=registro no .env do next dev.')
    process.exit(1)
  }
  caso('rota em modo registro (trava para não enviar e-mail real)', true)

  await limpar() // resto de execução anterior interrompida

  const { data: usuario } = await admin.from('usuarios').select('id').order('criado_em').limit(1).single()
  CRIADOR = usuario.id

  // --------------------------------------------------------- 1. sem escrita pelo cliente
  console.log('\n1. Relay fechado (anon e authenticated)')
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const oper = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error: eLogin } = await oper.auth.signInWithPassword({
    email: env.QA_OPERADOR_EMAIL, password: env.QA_OPERADOR_SENHA,
  })
  if (eLogin) throw new Error(`login QA operador: ${eLogin.message}`)

  for (const [quem, c] of [['anon', anon], ['authenticated', oper]]) {
    const lote = await c.rpc('fn_email_pegar_lote', { p_limite: 1 })
    caso(`${quem} não executa fn_email_pegar_lote`, lote.error?.code === '42501', lote.error?.code ?? 'executou')
    const enf = await c.rpc('fn_email_enfileirar', {
      p_email: { para: PARA, assunto: MARCADOR, corpo: 'x', criado_por: CRIADOR },
    })
    caso(`${quem} não executa fn_email_enfileirar`, enf.error?.code === '42501', enf.error?.code ?? 'executou')
    const ins = await c.from('email_outbox').insert({ para: PARA, assunto: MARCADOR, corpo: 'x' })
    caso(`${quem} não insere em email_outbox`, ins.error?.code === '42501', ins.error?.code ?? 'inseriu')
  }

  // --------------------------------------------- 2. rota: duas chamadas simultâneas
  console.log('\n2. Processador pela rota (registro), duas chamadas simultâneas')
  const up = await admin.storage.from(BUCKET).upload(OBJETO, new Blob(['%PDF-1.4 teste'], { type: 'application/pdf' }), {
    contentType: 'application/pdf', upsert: true,
  })
  if (up.error) throw new Error(`upload do anexo de teste: ${up.error.message}`)

  const ids = []
  for (let i = 0; i < 5; i++) ids.push(await enfileirar(i))
  const comAnexo = await enfileirar('anexo', [{ nome_arquivo: 'anexo.pdf', path: `${BUCKET}/${OBJETO}` }])
  const anexoFaltando = await enfileirar('anexo-faltando', [
    { nome_arquivo: 'nao-existe.pdf', path: `${BUCKET}/${MARCADOR}/nao-existe.pdf` },
  ])
  const todos = [...ids, comAnexo, anexoFaltando]

  const [r1, r2] = await Promise.all([chamar({ ids: todos }), chamar({ ids: todos })])
  caso('as duas chamadas respondem 200', r1.status === 200 && r2.status === 200, `${r1.status}/${r2.status}`)
  const soma = (k) => (r1.json?.resumo?.[k] ?? 0) + (r2.json?.resumo?.[k] ?? 0)
  caso('pegos somados = 7 (nenhuma linha em dois lotes)', soma('pegos') === 7, `pegos ${soma('pegos')}`)
  caso('registrados = 6, reagendados = 1, enviados = 0', soma('registrados') === 6 && soma('reagendados') === 1 && soma('enviados') === 0,
    JSON.stringify([r1.json?.resumo, r2.json?.resumo]))
  caso('modo informado = registro', r1.json?.modo === 'registro' && r2.json?.modo === 'registro')

  let estado = await linhas(todos)
  const ok6 = [...ids, comAnexo].every((id) => {
    const l = estado.get(id)
    return l.status === 'registrado' && l.tentativas === 1 && l.enviado_em === null &&
      l.provedor === 'registro' && l.provedor_id === `registro:${id}` && l.lote_id === null
  })
  caso('6 linhas registradas, 1 tentativa cada, enviado_em nulo, sem trava', ok6)
  const falt = estado.get(anexoFaltando)
  caso('anexo inexistente → pendente, erro gravado, próxima tentativa no futuro',
    falt.status === 'pendente' && falt.tentativas === 1 && /Anexo não baixou/.test(falt.erro ?? '') &&
    new Date(falt.proximo_envio_em) > new Date(), JSON.stringify(falt))

  // ------------------------------------------------------------ 3. idempotência
  console.log('\n3. Idempotência')
  const r3 = await chamar({ ids: todos })
  caso('terceira chamada não pega nada (já processadas; a pendente ainda não venceu)', r3.json?.resumo?.pegos === 0, JSON.stringify(r3.json))
  estado = await linhas(todos)
  caso('nenhuma tentativa a mais', [...estado.values()].every((l) => l.tentativas === 1))

  // --------------------------------------- 4. fn_email_pegar_lote concorrente (direto)
  console.log('\n4. fn_email_pegar_lote simultâneas')
  const lote2 = []
  for (let i = 0; i < 8; i++) lote2.push(await enfileirar(`sql-${i}`))
  const [a, b] = await Promise.all([
    admin.rpc('fn_email_pegar_lote', { p_limite: 8, p_ids: lote2 }),
    admin.rpc('fn_email_pegar_lote', { p_limite: 8, p_ids: lote2 }),
  ])
  if (a.error || b.error) throw new Error(a.error?.message ?? b.error?.message)
  const idsA = a.data.map((l) => l.id)
  const idsB = b.data.map((l) => l.id)
  caso('lotes disjuntos', idsA.every((id) => !idsB.includes(id)), `${idsA.length}/${idsB.length}`)
  caso('juntos cobrem as 8 linhas', new Set([...idsA, ...idsB]).size === 8, `${idsA.length}+${idsB.length}`)
  caso('cada lote com um lote_id só', new Set(a.data.map((l) => l.lote_id)).size <= 1 && new Set(b.data.map((l) => l.lote_id)).size <= 1)
  const de3 = await admin.rpc('fn_email_pegar_lote', { p_limite: 8, p_ids: lote2 })
  caso('linhas com trava ativa não são pegas de novo', de3.data?.length === 0, `${de3.data?.length}`)

  // ------------------------------------------------------------------ 5. trigger guarda
  console.log('\n5. Guarda do trigger')
  const alvo = ids[0]
  const congelado = await admin.from('email_outbox').update({ corpo: '<p>outro</p>' }).eq('id', alvo)
  caso('conteúdo congelado após a 1ª tentativa', congelado.error?.code === '55000', congelado.error?.code ?? 'mudou')
  const volta = await admin.from('email_outbox').update({ status: 'pendente' }).eq('id', ids[1]).select('status')
  caso('registrado pode voltar a pendente', !volta.error && volta.data?.[0]?.status === 'pendente', volta.error?.message)
  const env1 = await admin.from('email_outbox')
    .update({ status: 'enviado', enviado_em: new Date().toISOString(), provedor: 'resend', provedor_id: `${MARCADOR}${alvo}` })
    .eq('id', alvo)
  caso('marcar enviado (simulação, sem provedor)', !env1.error, env1.error?.message)
  const desfaz = await admin.from('email_outbox').update({ status: 'pendente', enviado_em: null }).eq('id', alvo)
  caso('enviado NÃO volta a pendente (trigger)', desfaz.error?.code === '55000' || desfaz.error?.code === '23514', desfaz.error?.code ?? 'voltou')
  const reprocessa = await chamar({ ids: [alvo] })
  caso('rota não reprocessa linha enviada', reprocessa.json?.resumo?.pegos === 0, JSON.stringify(reprocessa.json))
  const incoerente = await admin.from('email_outbox').update({ status: 'falhou' }).eq('id', ids[2])
  caso('registrado → falhou é aceito (transição válida)', !incoerente.error, incoerente.error?.message)
  const semEnviadoEm = await admin.from('email_outbox').update({ status: 'enviado' }).eq('id', ids[3])
  caso('CHECK: enviado sem enviado_em é recusado', semEnviadoEm.error?.code === '23514', semEnviadoEm.error?.code ?? 'aceitou')
}

try {
  await main()
} catch (e) {
  caso(`execução: ${e.message}`, false)
} finally {
  await limpar()
  const { count } = await admin.from('email_outbox').select('id', { count: 'exact', head: true }).eq('assunto', MARCADOR)
  caso('limpeza: 0 linhas com o marcador', count === 0, `${count}`)
  const falhas = casos.filter((c) => !c.ok).length
  console.log(`\n${casos.length - falhas}/${casos.length} ok`)
  process.exitCode = falhas ? 1 : 0
}
