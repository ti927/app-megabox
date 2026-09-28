/**
 * Ponta a ponta do formulário público de pesquisa (`/formulario/<token>`).
 *
 * Prepara com service_role (SUPABASE_SERVICE_ROLE_KEY, só neste script de servidor) um
 * cliente, duas campanhas (NPS e pós-venda) e quatro convites — aberto NPS, aberto
 * pós-venda, expirado e cancelado — emitindo os tokens por `fn_pesquisa_emitir_token`,
 * como a server action de envio fará. Depois abre o formulário num navegador de verdade
 * (Playwright), responde, e confere:
 *   - NPS: abre, responde, agradece; resposta gravada com ip_hash (HMAC, não sha256 puro) e
 *     user_agent; reabrir mostra "já respondida"; um SEGUNDO envio pela aba que ficou
 *     aberta recebe "respondido" do banco;
 *   - pós-venda: sem as duas notas o navegador barra; com as duas, grava as duas;
 *   - expirado → "expirou"; cancelado, inexistente e malformado → o MESMO "link inválido",
 *     com 404;
 *   - meta referrer no-referrer e robots noindex na página.
 * Capturas (claro, escuro, 390 px) em qa/formulario-*.png.
 *
 * Tudo com nome exato `__qa_form__*` e apagado no fim, com `in`/`eq` (nunca `like`).
 * O token nunca é impresso: aparece só na URL que o navegador abre.
 *
 *   node scripts/testar-formulario-publico.mjs     (com `next dev` em BASE, padrão :3000)
 */

import { createHash } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const SAIDA = resolve('qa')

async function lerEnv() {
  const env = {}
  for (const linha of (await readFile('.env', 'utf8')).split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const env = await lerEnv()
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const NOME = '__qa_form__'
const NOME_CLIENTE = `${NOME}cliente`
const NOME_NPS = `${NOME}nps`
const NOME_POS = `${NOME}pos_venda`

const casos = []
function caso(nome, ok, detalhe = '') {
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok || !detalhe ? '' : `  (${detalhe})`}`)
}

async function exigir(promessa, oque) {
  const { data, error } = await promessa
  if (error) throw new Error(`preparo (${oque}): ${error.message}`)
  return data
}

async function emitir(conviteId) {
  return exigir(admin.rpc('fn_pesquisa_emitir_token', { p_convite_id: conviteId }), 'emitir token')
}

// ------------------------------------------------------------------ preparo e limpeza
async function preparar() {
  const [grupo] = await exigir(
    admin.from('grupos_clifor').insert({ tipo: 'cliente', nome: NOME_CLIENTE }).select('id'),
    'grupo',
  )
  const pesquisas = await exigir(
    admin
      .from('pesquisas')
      .insert([
        { nome: NOME_NPS, tipo_id: 2 },
        { nome: NOME_POS, tipo_id: 3 },
      ])
      .select('id, nome'),
    'pesquisas',
  )
  const pesq = Object.fromEntries(pesquisas.map((p) => [p.nome, p.id]))
  const convites = await exigir(
    admin
      .from('pesquisa_convites')
      .insert([
        { pesquisa_id: pesq[NOME_NPS], cliente_id: grupo.id },
        { pesquisa_id: pesq[NOME_POS], cliente_id: grupo.id },
        { pesquisa_id: pesq[NOME_NPS], cliente_id: grupo.id },
        { pesquisa_id: pesq[NOME_NPS], cliente_id: grupo.id },
      ])
      .select('id'),
    'convites',
  )
  const [nps, pos, exp, canc] = convites.map((c) => c.id)
  const tokens = {
    nps: await emitir(nps),
    pos: await emitir(pos),
    exp: await emitir(exp),
    canc: await emitir(canc),
  }
  await exigir(
    admin.from('pesquisa_convites').update({ expira_em: '2020-01-01T00:00:00Z' }).eq('id', exp).select('id'),
    'expirar',
  )
  await exigir(
    admin
      .from('pesquisa_convites')
      .update({ cancelado_em: new Date().toISOString(), cancelado_motivo: NOME })
      .eq('id', canc)
      .select('id'),
    'cancelar',
  )
  return { ids: { nps, pos, exp, canc }, tokens }
}

async function limpar() {
  const passos = []
  const registrar = (oque, r) => {
    if (r.error) {
      console.error(`  FALHA  limpeza de ${oque}: ${r.error.message}`)
      process.exitCode = 1
    } else passos.push(`${oque}: ${r.data?.length ?? 0}`)
  }
  const { data: pesqs } = await admin.from('pesquisas').select('id').in('nome', [NOME_NPS, NOME_POS])
  const idsPesq = (pesqs ?? []).map((p) => p.id)
  if (idsPesq.length) {
    const { data: convs } = await admin.from('pesquisa_convites').select('id').in('pesquisa_id', idsPesq)
    const idsConv = (convs ?? []).map((c) => c.id)
    if (idsConv.length) {
      registrar('pesquisa_respostas', await admin.from('pesquisa_respostas').delete().in('convite_id', idsConv).select('id'))
    }
    // convites vão em cascade com a pesquisa
    registrar('pesquisas', await admin.from('pesquisas').delete().in('id', idsPesq).select('id'))
  }
  const { data: grupos } = await admin.from('grupos_clifor').select('id').eq('nome', NOME_CLIENTE)
  const ids = (grupos ?? []).map((g) => g.id)
  if (ids.length) registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  console.log(`\nLimpeza: ${passos.join(' · ') || 'nada a apagar'}`)
}

// ------------------------------------------------------------------------------ casos
const VARIANTES = [
  { nome: 'claro', largura: 1440, altura: 900, escuro: false },
  { nome: 'escuro', largura: 1440, altura: 900, escuro: true },
  { nome: 'celular-390', largura: 390, altura: 844, escuro: false },
]

async function contexto(navegador, v = VARIANTES[0]) {
  return navegador.newContext({
    viewport: { width: v.largura, height: v.altura },
    colorScheme: v.escuro ? 'dark' : 'light',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  })
}

const PRONTO = '[data-teste="pesq-enviar"]:not([disabled])'

const capturas = []
async function fotografar(pagina, nome) {
  const caminho = join(SAIDA, `formulario-${nome}.png`)
  // O `next dev` é compartilhado: um recompilar de outra rota recarrega a página no meio da
  // captura. Tenta de novo depois de a página assentar.
  for (let tentativa = 1; ; tentativa++) {
    try {
      await pagina.waitForLoadState('load')
      await pagina.screenshot({ path: caminho, fullPage: true })
      break
    } catch (erro) {
      if (tentativa >= 3) throw erro
      await pagina.waitForTimeout(1500)
    }
  }
  capturas.push(caminho)
}

async function textoAviso(pagina) {
  try {
    await pagina.waitForSelector('[data-teste="pesq-aviso"]', { state: 'visible', timeout: 20_000 })
  } catch (erro) {
    const erroTela = await pagina.textContent('[data-teste="pesq-erro"], .aviso').catch(() => null)
    await fotografar(pagina, 'falha')
    throw new Error(`sem aviso final; na tela: ${erroTela ?? '(nada)'}`, { cause: erro })
  }
  return (await pagina.textContent('[data-teste="pesq-aviso"] h1'))?.trim()
}

async function resposta(conviteId) {
  const { data } = await admin
    .from('pesquisa_respostas')
    .select('nota_nps, nota_atendimento, nota_produto, criticas_sugestoes, ip_hash, user_agent')
    .eq('convite_id', conviteId)
  return data ?? []
}

async function main() {
  await mkdir(SAIDA, { recursive: true })
  const { ids, tokens } = await preparar()
  const url = (t) => `${BASE}/formulario/${t}`
  const navegador = await chromium.launch()

  try {
    // 1. Capturas do formulário aberto (NPS e pós-venda) nas três variantes.
    for (const v of VARIANTES) {
      const c = await contexto(navegador, v)
      const p = await c.newPage()
      for (const [tipo, t] of [['nps', tokens.nps], ['pos-venda', tokens.pos]]) {
        await p.goto(url(t), { waitUntil: 'domcontentloaded' })
        await p.waitForSelector(PRONTO, { state: 'visible', timeout: 30_000 })
        await fotografar(p, `${tipo}-${v.nome}`)
      }
      await c.close()
    }

    // 2. Cabeçalhos de privacidade na página.
    {
      const c = await contexto(navegador)
      const p = await c.newPage()
      const r = await p.goto(url(tokens.nps), { waitUntil: 'domcontentloaded' })
      caso('formulário aberto responde 200', r?.status() === 200, String(r?.status()))
      const referrer = await p.getAttribute('meta[name="referrer"]', 'content')
      caso('meta referrer = no-referrer', referrer === 'no-referrer', String(referrer))
      const robots = await p.$$eval('meta[name="robots"]', (ms) => ms.map((m) => m.getAttribute('content')).join('|'))
      caso('meta robots noindex', robots.includes('noindex'), robots)
      const html = await p.content()
      caso('página não mostra o nome do cliente', !html.includes(NOME_CLIENTE))
      caso('NPS mostra 1 pergunta', (await p.$$('fieldset.pesq-pergunta')).length === 1)
      await c.close()
    }

    // 3. NPS: abre em duas abas; responde na primeira; a segunda tenta depois.
    {
      const c = await contexto(navegador)
      const aba1 = await c.newPage()
      const aba2 = await c.newPage()
      await aba1.goto(url(tokens.nps), { waitUntil: 'domcontentloaded' })
      await aba2.goto(url(tokens.nps), { waitUntil: 'domcontentloaded' })
      // "Enviar" só liga depois de hidratar (ver tela.tsx): espera por ele, não pelo esqueleto.
      await aba1.waitForSelector(PRONTO, { state: 'visible', timeout: 30_000 })
      await aba2.waitForSelector(PRONTO, { state: 'visible', timeout: 30_000 })

      await aba1.check('input[name="nota_nps"][value="9"]', { force: true })
      await aba1.fill('textarea[name="comentario"]', `${NOME} comentário de teste`)
      await aba1.click('[data-teste="pesq-enviar"]')
      const t1 = await textoAviso(aba1)
      caso('NPS: envio mostra agradecimento', t1?.startsWith('Obrigado'), t1)
      await fotografar(aba1, 'obrigado')

      const [r] = await resposta(ids.nps)
      caso('NPS: resposta gravada com nota 9', r?.nota_nps === 9, JSON.stringify(r?.nota_nps))
      caso('NPS: nota de produto não entra', r?.nota_produto === null)
      caso('NPS: comentário gravado', r?.criticas_sugestoes === `${NOME} comentário de teste`)
      const ipHex = String(r?.ip_hash ?? '').replace(/^\\x/, '')
      caso('ip_hash gravado com 32 bytes', /^[0-9a-f]{64}$/.test(ipHex), ipHex.length)
      const puros = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'desconhecido'].map((ip) =>
        createHash('sha256').update(ip).digest('hex'),
      )
      caso('ip_hash não é sha256 puro de IP local', !puros.includes(ipHex))
      caso('user_agent gravado', typeof r?.user_agent === 'string' && r.user_agent.length > 0)

      await aba2.check('input[name="nota_nps"][value="0"]', { force: true })
      await aba2.click('[data-teste="pesq-enviar"]')
      const t2 = await textoAviso(aba2)
      caso('NPS: 2º envio (aba antiga) recebe "já respondida"', t2?.includes('já foi respondida'), t2)
      const depois = await resposta(ids.nps)
      caso('NPS: 2º envio não sobrescreve', depois.length === 1 && depois[0].nota_nps === 9)

      await aba1.goto(url(tokens.nps), { waitUntil: 'domcontentloaded' })
      const t3 = await textoAviso(aba1)
      caso('NPS: reabrir o link mostra "já respondida"', t3?.includes('já foi respondida'), t3)
      await fotografar(aba1, 'ja-respondida')
      await c.close()
    }

    // 4. Pós-venda: validação no navegador e envio das duas notas.
    {
      const c = await contexto(navegador, VARIANTES[2])
      const p = await c.newPage()
      await p.goto(url(tokens.pos), { waitUntil: 'domcontentloaded' })
      await p.waitForSelector(PRONTO, { state: 'visible', timeout: 30_000 })
      caso('pós-venda mostra 2 perguntas', (await p.$$('fieldset.pesq-pergunta')).length === 2)
      await p.check('input[name="nota_atendimento"][value="10"]', { force: true })
      await p.click('[data-teste="pesq-enviar"]')
      await p.waitForSelector('.pesq-pergunta[data-erro]', { timeout: 10_000 })
      const comErro = await p.$$eval('.pesq-pergunta[data-erro] input', (is) => [...new Set(is.map((i) => i.name))])
      caso('pós-venda sem nota de produto: navegador barra e aponta a pergunta', comErro.join() === 'nota_produto', comErro.join())
      await fotografar(p, 'validacao-celular-390')
      caso('pós-venda barrado não gravou', (await resposta(ids.pos)).length === 0)

      await p.check('input[name="nota_produto"][value="6"]', { force: true })
      await p.click('[data-teste="pesq-enviar"]')
      const t = await textoAviso(p)
      caso('pós-venda: envio completo agradece', t?.startsWith('Obrigado'), t)
      const [r] = await resposta(ids.pos)
      caso('pós-venda: atendimento 10 e produto 6', r?.nota_atendimento === 10 && r?.nota_produto === 6, JSON.stringify(r))
      caso('pós-venda: sem comentário = null', r?.criticas_sugestoes === null)
      await c.close()
    }

    // 5. Expirado, cancelado, inexistente, malformado.
    {
      const c = await contexto(navegador)
      const p = await c.newPage()
      let r = await p.goto(url(tokens.exp), { waitUntil: 'domcontentloaded' })
      const tExp = await textoAviso(p)
      caso('expirado mostra "expirou"', tExp?.includes('expirou'), tExp)
      await fotografar(p, 'expirado')

      const invalidos = [
        ['cancelado', tokens.canc],
        ['inexistente', 'A'.repeat(43)],
        ['malformado', 'abc'],
        ['sem token', ''],
      ]
      const textos = new Set()
      for (const [nome, t] of invalidos) {
        r = await p.goto(url(t), { waitUntil: 'domcontentloaded' })
        const texto = await textoAviso(p)
        textos.add(texto)
        caso(`${nome}: "Link inválido" com 404`, texto === 'Link inválido' && r?.status() === 404, `${texto} ${r?.status()}`)
        const referrer = await p.getAttribute('meta[name="referrer"]', 'content')
        if (nome === 'cancelado') caso('link inválido também com referrer no-referrer', referrer === 'no-referrer')
      }
      caso('cancelado/inexistente/malformado são indistinguíveis', textos.size === 1)
      await fotografar(p, 'invalido')

      // 6. O banco contou as tentativas recusadas? (2º envio NPS = 1)
      const { data: conv } = await admin.from('pesquisa_convites').select('tentativas, usado_em').eq('id', ids.nps)
      caso('convite NPS: usado_em marcado e 1 tentativa recusada', conv?.[0]?.usado_em && conv[0].tentativas === 1, JSON.stringify(conv))
      const { data: canc } = await admin.from('pesquisa_respostas').select('id').eq('convite_id', ids.canc)
      caso('cancelado não tem resposta', (canc ?? []).length === 0)
      await c.close()
    }
  } finally {
    await navegador.close()
  }
}

try {
  await main()
} catch (erro) {
  // A mensagem do Playwright traz a URL navegada: mascara o token antes de imprimir.
  const mensagem = String(erro.message).replace(/\/formulario\/[A-Za-z0-9_-]{43}/g, '/formulario/<token>')
  console.error(`\nERRO: ${mensagem}`)
  process.exitCode = 1
} finally {
  await limpar()
}

const falhas = casos.filter((c) => !c.ok)
console.log(`\n${casos.length - falhas.length}/${casos.length} casos ok`)
console.log(`\n${capturas.length} captura(s):`)
for (const c of capturas) console.log(`  ${c}`)
if (falhas.length) process.exitCode = 1
