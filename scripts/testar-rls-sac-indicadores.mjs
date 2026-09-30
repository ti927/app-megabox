/**
 * Prova que os indicadores da aba Relatórios do SAC (db/026, `fn_sac_indicadores`) contam certo
 * e respeitam a RLS de quem consulta.
 *
 * Contas de QA do .env: QA_EMAIL/QA_SENHA (perfil 1) e QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA
 * (perfil 4). O Operador não tem a página `sac`; o teste a concede por uma linha nominal em
 * permissoes_pagina marcada com `bubble_id = '__teste_rls_sac_ind__'`, apagada no fim.
 *
 * O que se prova:
 *   - anon não executa a função;
 *   - perfil 1 vê todos os chamados do período; o Operador só os dele (responsável ou quem abriu,
 *     013 D4) — mesma chamada, a RLS decide (026 D7);
 *   - excluídos e fora do período não entram; o mês é o de São Paulo (23h30 de 30/04 é abril);
 *   - tempo médio/mediano de resolução em dias com 1 casa; tipos sem chamado aparecem com zero;
 *     série mensal sem buraco (026 D1–D5);
 *   - período obrigatório, não invertido, ≤ 24 meses (026 D6).
 *
 * Dados em mar–mai/2033, criados e apagados com service_role (que só PREPARA e LIMPA — sem
 * auth.uid() o trigger preserva aberto_em/fechado_em informados). Nomes exatos com o prefixo.
 *
 *   node scripts/testar-rls-sac-indicadores.mjs
 */

import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const env = lerEnv()
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY

const NOME = '__teste_rls_sac_ind__'
const FN = 'fn_sac_indicadores'
const PERIODO = { p_de: '2033-03-01', p_ate: '2033-04-30' }
const RECUSADO = '42501'

const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })

const casos = []
function caso(nome, esperado, obtido) {
  const ok = esperado === obtido
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
}
const umaCasa = (v) => (v === null || v === undefined ? null : Number(v).toFixed(1))

async function entrar(email, senha) {
  const cliente = createClient(URL, ANON, { auth: { persistSession: false } })
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(`não autenticou ${email}: ${error.message}`)
  return { cliente, id: data.user.id }
}

async function exigir(promessa, oque) {
  const { data, error } = await promessa
  if (error) throw new Error(`preparo (${oque}): ${error.message}`)
  return data
}

async function rpc(cliente, args = PERIODO) {
  const { data, error } = await cliente.rpc(FN, args)
  if (error) throw new Error(`${FN}: ${error.code} ${error.message}`)
  return data
}

async function preparar(idDir, idOp) {
  await exigir(
    admin.from('permissoes_pagina').insert({ pagina_slug: 'sac', usuario_id: idOp, bubble_id: NOME }).select('id'),
    'página sac para o Operador',
  )
  const [grupo] = await exigir(admin.from('grupos_clifor').insert({ tipo: 'cliente', nome: NOME }).select('id'), 'grupo')
  const prot = (x) => ({ grupo_clifor_id: grupo.id, descricao: NOME, prioridade_id: 1, ...x })
  await exigir(
    admin
      .from('sac_protocolos')
      .insert([
        // P1 perfil 1, Atraso, resolvido em 2,5 dias
        prot({ criado_por: idDir, responsavel_id: idDir, tipo_ocorrencia_id: 1, prioridade_id: 3, status_id: 4,
          aberto_em: '2033-03-01T10:00:00-03:00', fechado_em: '2033-03-03T22:00:00-03:00' }),
        // P2 do Operador (responsável), Atraso, resolvido em 1 dia
        prot({ criado_por: idDir, responsavel_id: idOp, tipo_ocorrencia_id: 1, status_id: 4,
          aberto_em: '2033-03-10T08:00:00-03:00', fechado_em: '2033-03-11T08:00:00-03:00' }),
        // P3 do Operador, Pedido incompleto, em aberto; 23h30 de 30/04 em SP (já é maio em UTC)
        prot({ criado_por: idOp, responsavel_id: idOp, tipo_ocorrencia_id: 3, status_id: 1,
          aberto_em: '2033-04-30T23:30:00-03:00' }),
        // P4 excluído — não entra
        prot({ criado_por: idDir, responsavel_id: idDir, tipo_ocorrencia_id: 2, status_id: 1,
          aberto_em: '2033-03-05T10:00:00-03:00', excluido_em: '2033-03-06T10:00:00-03:00', excluido_motivo: NOME }),
        // P5 fora do período (00h30 de 01/05 em SP) — não entra
        prot({ criado_por: idDir, responsavel_id: idDir, tipo_ocorrencia_id: 1, status_id: 1,
          aberto_em: '2033-05-01T00:30:00-03:00' }),
      ])
      .select('id'),
    'protocolos',
  )
}

async function limpar() {
  if (!SERVICE) {
    console.error('  FALHA  sem SUPABASE_SERVICE_ROLE_KEY: não consegui garantir a limpeza')
    process.exitCode = 1
    return
  }
  const passos = []
  const registrar = (oque, r) => {
    if (r.error) {
      console.error(`  FALHA  limpeza de ${oque}: ${r.error.message}`)
      process.exitCode = 1
    } else passos.push(`${oque}: ${r.data?.length ?? 0}`)
  }
  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', [NOME])
  const ids = (grupos ?? []).map((x) => x.id)
  if (ids.length) {
    registrar('sac_protocolos', await admin.from('sac_protocolos').delete().in('grupo_clifor_id', ids).select('id'))
    registrar('grupos', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  registrar('permissoes_pagina', await admin.from('permissoes_pagina').delete().in('bubble_id', [NOME]).select('id'))
  console.log(`\nlimpeza — ${passos.join(', ')}`)
}

async function main() {
  for (const chave of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'QA_EMAIL', 'QA_SENHA', 'QA_OPERADOR_EMAIL', 'QA_OPERADOR_SENHA']) {
    if (!env[chave]) throw new Error(`${chave} não está no .env`)
  }
  await limpar()
  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  await preparar(dir.id, op.id)

  console.log('anon:')
  const anon = createClient(URL, ANON, { auth: { persistSession: false } })
  const r = await anon.rpc(FN, PERIODO)
  caso('anon não executa a função', RECUSADO, r.error?.code ?? 'sem erro')

  console.log('\nperfil 1 (todos os chamados):')
  const d = await rpc(dir.cliente)
  caso('total do período (sem o excluído e sem o de maio)', 3, d.total)
  caso('não resolvidos', 1, d.abertos)
  caso('resolvidos', 2, d.resolvidos)
  caso('tempo médio (2,5 e 1,0 dia → 1,75 → 1,8)', '1.8', umaCasa(d.media_dias))
  caso('tempo mediano', '1.8', umaCasa(d.mediana_dias))
  const tipo = (id) => d.por_tipo.find((t) => t.id === id)?.total
  caso('por tipo: as seis opções, com zero', 6, d.por_tipo.length)
  caso('por tipo: Atraso = 2', 2, tipo(1))
  caso('por tipo: Divergência = 0 (o único é o excluído)', 0, tipo(2))
  caso('por tipo: Pedido incompleto = 1', 1, tipo(3))
  caso('por prioridade: Alta = 1', 1, d.por_prioridade.find((p) => p.id === 3)?.total)
  caso('por status: Resolvido = 2', 2, d.por_status.find((s) => s.id === 4)?.total)
  caso('série mensal: março e abril, sem buraco', '2033-03-01,2033-04-01', d.mensal.map((m) => m.mes).join(','))
  caso('março: 2 abertos, 2 resolvidos', '2/2', `${d.mensal[0]?.abertos}/${d.mensal[0]?.resolvidos}`)
  caso('março: média de dias', '1.8', umaCasa(d.mensal[0]?.media_dias))
  caso('abril (fuso de SP): 1 aberto, sem média', '1/null', `${d.mensal[1]?.abertos}/${d.mensal[1]?.media_dias}`)
  const soOp = await rpc(dir.cliente, { ...PERIODO, p_responsavel: op.id })
  caso('filtro por responsável (D2)', 2, soOp.total)

  console.log('\nOperador (só os dele):')
  const o = await rpc(op.cliente)
  caso('total do Operador', 2, o.total)
  caso('tempo médio do Operador (só o P2)', '1.0', umaCasa(o.media_dias))
  const opDir = await rpc(op.cliente, { ...PERIODO, p_responsavel: dir.id })
  caso('SIGILO: filtrar pelo perfil 1 não revela nada', 0, opDir.total)

  console.log('\nPeríodo (026 D6):')
  const inv = await dir.cliente.rpc(FN, { p_de: '2033-04-30', p_ate: '2033-03-01' })
  caso('invertido é recusado (22023)', '22023', inv.error?.code ?? 'sem erro')
  const longo = await dir.cliente.rpc(FN, { p_de: '2030-01-01', p_ate: '2033-01-01' })
  caso('maior que 24 meses é recusado (22023)', '22023', longo.error?.code ?? 'sem erro')

  await dir.cliente.auth.signOut()
  await op.cliente.auth.signOut()
  const falhas = casos.filter((c) => !c.ok)
  console.log(`\n${casos.length - falhas.length}/${casos.length} casos como a spec promete.`)
  if (falhas.length > 0) process.exitCode = 1
}

try {
  await main()
} catch (erro) {
  console.error(`\nFALHA  ${erro.message}`)
  process.exitCode = 1
} finally {
  await limpar()
}
