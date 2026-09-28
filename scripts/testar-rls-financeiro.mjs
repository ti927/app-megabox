/**
 * Prova que o financeiro (db/010) e as metas (db/011) fazem o que a spec diz — RLS e dinheiro.
 *
 * Mesmo molde de `scripts/testar-rls-vendas.mjs`: autentica de verdade com as duas contas de QA
 * do .env — QA_EMAIL/QA_SENHA (perfil 1, com as páginas vendas, financeiro e metas) e
 * QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA (perfil 4, só vendas) — e compara o que o banco devolve
 * com o que as specs prometem.
 *
 * O que se prova:
 *   - anon não lê nenhuma tabela nem view nova e não executa as funções.
 *   - QUEM NÃO TEM A PÁGINA não lê nem escreve (Operador sem financeiro/metas).
 *   - SIGILO (02 §7.3, 010 D11, 011 D10): com as páginas concedidas, o Operador continua sem
 *     ler a comissão e a meta do outro vendedor, lê a própria meta, e não grava comissão/meta.
 *   - DINHEIRO AO CENTAVO (CLAUDE.md regra 10): rateio com a sobra na última, vencimentos,
 *     os 3% (B4), baixa parcial, baixa acima do saldo, estorno, recibo = soma das baixas,
 *     redistribuição sem apagar parcelas, realizado/faixa/fator/comissão da meta (B3),
 *     exatamente 100% = meta batida, fechamento recalculado no servidor.
 *   - AS DUAS ORIGENS (010 D1): a entrega paga pela CP de entrega não entra numa CP de meta do
 *     mesmo vendedor, e vice-versa — o BANCO recusa (23505).
 *
 * Preparo e limpeza com service_role (SUPABASE_SERVICE_ROLE_KEY), que nunca afirma nada. Tudo
 * tem nome exato `__teste_rls_financeiro__*` e é apagado no fim, com `in`/`eq` (nunca `like`).
 * As páginas concedidas ao Operador para o teste de sigilo são REMOVIDAS no fim (pelo id da
 * linha criada). Fica para trás só a trilha em `auditoria` (append-only por GRANT).
 *
 *   node scripts/testar-rls-financeiro.mjs
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

const TABELAS = [
  'contas_receber',
  'contas_pagar',
  'conta_pagar_entregas',
  'baixas',
  'estornos',
  'cobrancas',
  'cobranca_contas',
  'recibos',
  'niveis_vendedor',
  'vendedor_nivel_historico',
  'metas_mensais',
  'metas_fechadas',
  'meta_fechada_entregas',
]
const VIEWS = ['v_contas_receber', 'v_contas_pagar', 'v_conferencia_comissao_entrega', 'v_meta_atingimento', 'v_ranking_metas']

const NOME = '__teste_rls_financeiro__'
const NOME_CLIENTE = `${NOME}cliente`
const NOME_FORNECEDOR = `${NOME}fornecedor`
const ORDEM_NIVEL = 32001 // nível de teste; ordem é unique

// prazos_recebimento semeados na 003: 30dd, 60dd, 90dd
const PRAZOS = { d30: 11, d60: 18, d90: 20 }

/** 42501 = insufficient_privilege: recusa de GRANT ou de policy. */
const RECUSADO = '42501'

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const casos = []
function caso(nome, esperado, obtido, detalhe = '') {
  const ok = esperado === obtido
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
  if (!ok && detalhe) console.log(`        ${detalhe}`)
}

const reais = (v) => (v === null || v === undefined ? String(v) : Number(v).toFixed(2))
const codigo = (r) => r.error?.code ?? 'sem erro'

async function ler(cliente, tabela) {
  const { error } = await cliente.from(tabela).select('*').limit(1)
  return error ? 'negado' : 'permitido'
}

/** Enxerga UMA linha? RLS de leitura filtra sem erro, então conta linhas. */
async function enxerga(cliente, tabela, coluna, id) {
  const { data, error } = await cliente.from(tabela).select(coluna).eq(coluna, id)
  if (error) return error.code === RECUSADO ? 'negado' : `erro ${error.code}`
  return data.length >= 1 ? 'permitido' : 'negado'
}

/** Escrita só é 'negado' com 42501 ou zero linhas; erro de dado vira 'erro' e acusa o teste. */
function escrita({ error, data }) {
  if (error) return error.code === RECUSADO ? 'negado' : `erro ${error.code}`
  return Array.isArray(data) && data.length === 0 ? 'negado' : 'permitido'
}

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

// ------------------------------------------------------------------ preparo e limpeza
let permissoesCriadas = []
let departamentoOriginalOp = null

async function preparar(idDiretor) {
  const grupos = await exigir(
    admin
      .from('grupos_clifor')
      .insert([
        { tipo: 'cliente', nome: NOME_CLIENTE },
        { tipo: 'fornecedor', nome: NOME_FORNECEDOR },
      ])
      .select('id, tipo'),
    'grupos',
  )
  const cliente = grupos.find((g) => g.tipo === 'cliente').id
  const fornecedor = grupos.find((g) => g.tipo === 'fornecedor').id

  const enderecos = await exigir(
    admin
      .from('enderecos_clifor')
      .insert([
        { grupo_id: cliente, nome_endereco: NOME, tipo_pessoa: 'cnpj', regime_tributario_id: 1, uf: 'GO' },
        { grupo_id: fornecedor, nome_endereco: NOME, tipo_pessoa: 'cnpj', regime_tributario_id: 1, uf: 'SP' },
      ])
      .select('id, grupo_id'),
    'enderecos',
  )
  const destino = enderecos.find((e) => e.grupo_id === cliente).id
  const origem = enderecos.find((e) => e.grupo_id === fornecedor).id

  const [produto] = await exigir(admin.from('produtos').insert({ nome: NOME }).select('id'), 'produto')

  const [cot] = await exigir(
    admin.from('cotacoes').insert({ cliente_id: cliente, vendedor_id: idDiretor, empresa_emissora_id: 1 }).select('id'),
    'cotação',
  )
  const itens = await exigir(
    admin
      .from('cotacao_itens')
      .insert([
        { cotacao_id: cot.id, produto_id: produto.id, qtd: 2, endereco_destino_id: destino },
        { cotacao_id: cot.id, produto_id: produto.id, qtd: 2, endereco_destino_id: destino },
      ])
      .select('id'),
    'itens',
  )
  // FOB (tipo 1): o frete não entra, o bruto é qtd × unit. Comissões escolhidas para o rateio
  // e os 3% arredondarem: 123,46 ÷ 3 = 41,1533…; 3% de 123,46 = 3,7038.
  const base = {
    cotacao_id: cot.id,
    fornecedor_id: fornecedor,
    endereco_origem_id: origem,
    endereco_destino_id: destino,
    produto_id: produto.id,
    vendedor_id: idDiretor,
    qtd_venda: 2,
    tipo_frete_id: 1,
    aliquota_icms: '0.1200',
    aliquota_pis_cofins: '0.0925',
    vencedor: true,
  }
  const orcs = await exigir(
    admin
      .from('orcamentos_fornecedor')
      .insert([
        { ...base, cotacao_item_id: itens[0].id, valor_venda_unit: '1000.00', valor_comissao_unit: '123.46' },
        { ...base, cotacao_item_id: itens[1].id, valor_venda_unit: '500.00', valor_comissao_unit: '76.55' },
      ])
      .select('id, valor_comissao_unit'),
    'orçamentos',
  )
  const orcA = orcs.find((o) => Number(o.valor_comissao_unit) === 123.46).id
  const orcB = orcs.find((o) => Number(o.valor_comissao_unit) === 76.55).id

  const [prop] = await exigir(
    admin
      .from('propostas')
      .insert({ cotacao_id: cot.id, numero: 1, vendedor_id: idDiretor, data_prev_entrega: '2030-01-15' })
      .select('id'),
    'proposta',
  )
  await exigir(
    admin
      .from('proposta_itens')
      .insert([
        { proposta_id: prop.id, orcamento_fornecedor_id: orcA },
        { proposta_id: prop.id, orcamento_fornecedor_id: orcB },
      ])
      .select('id'),
    'itens da proposta',
  )
  const [ped] = await exigir(
    admin.from('pedidos').insert({ proposta_id: prop.id, cotacao_id: cot.id, vendedor_id: idDiretor }).select('id'),
    'pedido',
  )
  // condição negociada: 30, 60 e 90 dias — é daí que saem as parcelas (bTryZ1)
  await exigir(
    admin
      .from('pedido_prazos')
      .insert(Object.values(PRAZOS).map((p) => ({ pedido_id: ped.id, prazo_id: p })))
      .select('prazo_id'),
    'prazos do pedido',
  )
  const entregas = await exigir(
    admin
      .from('entregas')
      .insert([
        { pedido_id: ped.id, orcamento_fornecedor_id: orcA, qtd: 1 },
        { pedido_id: ped.id, orcamento_fornecedor_id: orcB, qtd: 1 },
      ])
      .select('id, orcamento_fornecedor_id, vendedor_substituto_id, valor_comissao, valor_venda_bruto'),
    'entregas',
  )
  const entA = entregas.find((e) => e.orcamento_fornecedor_id === orcA)
  const entB = entregas.find((e) => e.orcamento_fornecedor_id === orcB)

  const [nivel] = await exigir(
    admin
      .from('niveis_vendedor')
      .insert({
        nome: NOME,
        ordem: ORDEM_NIVEL,
        meta_venda: '200.00',
        comissao_padrao: '0.0333',
        comissao_meta_batida: '0.0725',
        qtd_meta_batida: 3,
      })
      .select('id'),
    'nível',
  )

  return { cliente, fornecedor, origem, destino, ped: ped.id, entA, entB, nivel: nivel.id }
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

  // 0. O departamento do Operador, que o caso da equipe financeira mudou.
  if (departamentoOriginalOp) {
    registrar('departamento do Operador (restaurado)', await admin.from('usuarios').update({ departamento_id: departamentoOriginalOp.departamento_id }).eq('id', departamentoOriginalOp.id).select('id'))
    departamentoOriginalOp = null
  }

  // 1. As páginas concedidas ao Operador (pelo id da linha que ESTE teste criou).
  if (permissoesCriadas.length) {
    registrar('permissões do Operador (removidas)', await admin.from('permissoes_pagina').delete().in('id', permissoesCriadas).select('id'))
    permissoesCriadas = []
  }

  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', [NOME_CLIENTE, NOME_FORNECEDOR])
  const ids = (grupos ?? []).map((g) => g.id)
  const { data: niveis } = await admin.from('niveis_vendedor').select('id').eq('nome', NOME)
  const nivelIds = (niveis ?? []).map((n) => n.id)

  const { data: metas } = nivelIds.length
    ? await admin.from('metas_mensais').select('id').in('nivel_id', nivelIds)
    : { data: [] }
  const metaIds = (metas ?? []).map((m) => m.id)
  const { data: fechadas } = metaIds.length
    ? await admin.from('metas_fechadas').select('id').in('meta_mensal_id', metaIds)
    : { data: [] }
  const fechadaIds = (fechadas ?? []).map((f) => f.id)

  const { data: crs } = ids.length ? await admin.from('contas_receber').select('id').in('cliente_id', ids) : { data: [] }
  const crIds = (crs ?? []).map((c) => c.id)
  const cps = []
  if (ids.length) cps.push(...((await admin.from('contas_pagar').select('id').in('cliente_id', ids)).data ?? []))
  if (fechadaIds.length) cps.push(...((await admin.from('contas_pagar').select('id').in('meta_fechada_id', fechadaIds)).data ?? []))
  cps.push(...((await admin.from('contas_pagar').select('id').eq('motivo_cancelamento', NOME)).data ?? []))
  const cpIds = [...new Set(cps.map((c) => c.id))]

  const baixas = []
  if (crIds.length) baixas.push(...((await admin.from('baixas').select('id').in('conta_receber_id', crIds)).data ?? []))
  if (cpIds.length) baixas.push(...((await admin.from('baixas').select('id').in('conta_pagar_id', cpIds)).data ?? []))
  const baixaIds = baixas.map((b) => b.id)

  if (baixaIds.length) {
    registrar('estornos', await admin.from('estornos').delete().in('baixa_id', baixaIds).select('id'))
    registrar('baixas', await admin.from('baixas').delete().in('id', baixaIds).select('id'))
  }
  if (ids.length) {
    registrar('cobrancas', await admin.from('cobrancas').delete().in('fornecedor_id', ids).select('id'))
    registrar('recibos', await admin.from('recibos').delete().in('fornecedor_id', ids).select('id'))
  }
  if (cpIds.length) registrar('contas_pagar', await admin.from('contas_pagar').delete().in('id', cpIds).select('id'))
  if (fechadaIds.length) registrar('metas_fechadas', await admin.from('metas_fechadas').delete().in('id', fechadaIds).select('id'))
  if (metaIds.length) registrar('metas_mensais', await admin.from('metas_mensais').delete().in('id', metaIds).select('id'))
  if (nivelIds.length) registrar('niveis_vendedor', await admin.from('niveis_vendedor').delete().in('id', nivelIds).select('id'))

  if (ids.length) {
    registrar('contas_receber', await admin.from('contas_receber').delete().in('cliente_id', ids).select('id'))
    registrar('entregas', await admin.from('entregas').delete().in('cliente_id', ids).select('id'))
    registrar('pedidos', await admin.from('pedidos').delete().in('cliente_id', ids).select('id'))
    registrar('cotacoes', await admin.from('cotacoes').delete().in('cliente_id', ids).select('id'))
    registrar('enderecos_clifor', await admin.from('enderecos_clifor').delete().in('grupo_id', ids).select('id'))
    registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  registrar('produtos', await admin.from('produtos').delete().in('nome', [NOME]).select('id'))
  console.log(`\nLimpeza: ${passos.join(' · ')}`)
}

// ------------------------------------------------------------------------------- casos
async function main() {
  await limpar() // se uma execução anterior morreu no meio, começa limpo

  console.log('\nSem sessão (papel anon):')
  const anonimo = createClient(URL, ANON, { auth: { persistSession: false } })
  for (const t of [...TABELAS, ...VIEWS]) caso(`anon lê ${t}`, 'negado', await ler(anonimo, t))
  const rpcAnon = await anonimo.rpc('fn_valor_parcela', { p_total: 100, p_n: 3, p_i: 1 })
  caso('anon executa fn_valor_parcela', RECUSADO, codigo(rpcAnon))
  const rpcAnon2 = await anonimo.rpc('fn_fechar_meta', { p_meta: '00000000-0000-0000-0000-000000000000' })
  caso('anon executa fn_fechar_meta', RECUSADO, codigo(rpcAnon2))

  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const d = await preparar(dir.id)
  const D = dir.cliente
  const O = op.cliente

  // ------------------------------------------------------------ funções puras (dinheiro)
  console.log('\nCálculo puro (perfil 1):')
  const parcelas = []
  for (const i of [1, 2, 3]) parcelas.push(reais((await D.rpc('fn_valor_parcela', { p_total: 1000, p_n: 3, p_i: i })).data))
  caso('rateio 1000,00 em 3: sobra na última', '333.33|333.33|333.34', parcelas.join('|'))
  const nove = []
  for (let i = 1; i <= 9; i++) nove.push(Number((await D.rpc('fn_valor_parcela', { p_total: 0.07, p_n: 9, p_i: i })).data))
  caso('rateio 0,07 em 9: soma exata e nenhuma negativa', '0.07/true', `${nove.reduce((a, b) => a + b, 0).toFixed(2)}/${nove.every((v) => v >= 0)}`)
  const venc = []
  for (const dt of ['2030-01-31', '2030-12-15', '2032-02-29']) venc.push((await D.rpc('fn_vencimento_conta_pagar', { p_data: dt })).data)
  caso('CP vence dia 5 do mês seguinte (31/01, virada de ano, bissexto)', '2030-02-05|2031-01-05|2032-03-05', venc.join('|'))
  const pct = await D.rpc('fn_percentual_comissao_vendedor', { p_vendedor: dir.id, p_data: '2030-01-20' })
  caso('B4: percentual do vendedor = 0,0300', '0.0300', Number(pct.data).toFixed(4))

  // ------------------------------------------------------------------- confirmação (bTcXd)
  console.log('\nConfirmação de entrega → contas (perfil 1):')
  caso('entrega de teste sem substituto de férias', null, d.entA.vendedor_substituto_id)
  const conf = await D.rpc('fn_confirmar_entrega', { p_entrega: d.entA.id, p_dt_entrega: '2030-01-20' })
  caso('fn_confirmar_entrega', 'sem erro', codigo(conf), conf.error?.message)

  const { data: crA } = await D.from('contas_receber')
    .select('id, parcela, parcelas_total, valor_comissao, valor_total, dt_vencimento, status_id, fornecedor_id')
    .eq('entrega_id', d.entA.id)
    .order('parcela')
  caso('3 parcelas (prazos do pedido)', 3, crA?.length)
  caso('comissão rateada 123,46 → 41,15 + 41,15 + 41,16', '41.15|41.15|41.16', (crA ?? []).map((c) => reais(c.valor_comissao)).join('|'))
  caso('venda rateada 1000,00 → 333,33 + 333,33 + 333,34', '333.33|333.33|333.34', (crA ?? []).map((c) => reais(c.valor_total)).join('|'))
  caso('vencimento = data real + 30/60/90 (não cumulativo)', '2030-02-19|2030-03-21|2030-04-20', (crA ?? []).map((c) => c.dt_vencimento).join('|'))
  caso('parcelas nascem "A receber" (status 1, não vazio)', '1|1|1', (crA ?? []).map((c) => c.status_id).join('|'))

  const { data: cpA } = await D.from('contas_pagar')
    .select('id, origem, valor_base, percentual, valor_comissao, dt_vencimento, status_id')
    .eq('entrega_id', d.entA.id)
  caso('1 conta a pagar de origem entrega', 'entrega', cpA?.length === 1 ? cpA[0].origem : `${cpA?.length} contas`)
  caso('CP: 3% de 123,46 = 3,7038 → 3,70', '123.46×0.0300=3.70', cpA?.[0] ? `${reais(cpA[0].valor_base)}×${Number(cpA[0].percentual).toFixed(4)}=${reais(cpA[0].valor_comissao)}` : null)
  caso('CP vence 05/02/2030 (data real 20/01)', '2030-02-05', cpA?.[0]?.dt_vencimento)
  caso('CP nasce "A pagar" (3)', 3, cpA?.[0]?.status_id)

  const reconf = await D.rpc('fn_confirmar_entrega', { p_entrega: d.entA.id, p_dt_entrega: '2030-01-20' })
  const { count: nCr } = await D.from('contas_receber').select('id', { count: 'exact', head: true }).eq('entrega_id', d.entA.id)
  const { count: nCp } = await D.from('contas_pagar').select('id', { count: 'exact', head: true }).eq('entrega_id', d.entA.id)
  caso('regravar a confirmação não duplica (vendas [DÚVIDA 9])', 'sem erro 3/1', `${codigo(reconf)} ${nCr}/${nCp}`)
  caso('gerar parcelas de novo é recusado', '23505', codigo(await D.rpc('fn_gerar_contas_receber', { p_entrega: d.entA.id })))
  caso('gerar outra CP da mesma entrega é recusado', '23505', codigo(await D.rpc('fn_gerar_conta_pagar', { p_entrega: d.entA.id })))

  const [p1, p2, p3] = crA ?? []
  const desfecha = await D.from('contas_receber').update({ valor_comissao: '41.16', motivo_altera_comissao: NOME }).eq('id', p1?.id).select('id')
  caso('mexer em UMA parcela desfecha o rateio: recusado no commit', '23514', codigo(desfecha), desfecha.error?.message)
  const semMotivo = await D.from('contas_receber').update({ valor_comissao: '41.16' }).eq('id', p1?.id).select('id')
  caso('mudar comissão sem motivo é recusado', '23514', codigo(semMotivo))
  const apaga = await D.from('contas_receber').delete().eq('id', p1?.id).select('id')
  caso('apagar parcela (exclusão física de dinheiro)', 'negado', escrita(apaga), apaga.error?.message)

  // ------------------------------------------------------------ baixa parcial e estorno
  console.log('\nBaixa e estorno (perfil 1):')
  const b1 = await D.from('baixas')
    .insert({ conta_receber_id: p1?.id, valor: '20.00', dt_credito: '2030-02-20', nf_megabox_numero: `${NOME}nf` })
    .select('id, usuario_id')
  caso('baixa parcial de 20,00', 'permitido', escrita(b1), b1.error?.message)
  caso('autor da baixa = auth.uid()', dir.id, b1.data?.[0]?.usuario_id)
  let { data: v1 } = await D.from('v_contas_receber').select('status_id, valor_baixado, saldo').eq('id', p1?.id).single()
  caso('parcial: continua "A receber" com saldo 21,15', '1/20.00/21.15', v1 ? `${v1.status_id}/${reais(v1.valor_baixado)}/${reais(v1.saldo)}` : null)
  const demais = await D.from('baixas').insert({ conta_receber_id: p1?.id, valor: '21.16', dt_credito: '2030-02-20' }).select('id')
  caso('baixa de 21,16 passa do saldo em 1 centavo: recusada', '23514', codigo(demais))
  const b2 = await D.from('baixas').insert({ conta_receber_id: p1?.id, valor: '21.15', dt_credito: '2030-02-21' }).select('id')
  caso('baixa do saldo exato 21,15', 'permitido', escrita(b2), b2.error?.message)
  ;({ data: v1 } = await D.from('v_contas_receber').select('status_id, saldo').eq('id', p1?.id).single())
  caso('quitada: "Recebido" (2), saldo 0,00', '2/0.00', v1 ? `${v1.status_id}/${reais(v1.saldo)}` : null)
  const statusManual = await D.from('contas_receber').update({ status_id: 1 }).eq('id', p1?.id).select('status_id')
  caso('status é espelho: gravar 1 à mão não reabre', 2, statusManual.data?.[0]?.status_id)
  caso('parcela com baixa não muda de valor', '55000', codigo(await D.from('contas_receber').update({ valor_comissao: '41.14', motivo_altera_comissao: NOME }).eq('id', p1?.id).select('id')))
  caso('parcela com baixa não se cancela', '55000', codigo(await D.from('contas_receber').update({ cancelada_em: new Date().toISOString(), motivo_cancelamento: NOME }).eq('id', p1?.id).select('id')))
  const mudaBaixa = await D.from('baixas').update({ valor: '1.00' }).eq('id', b2.data?.[0]?.id).select('id')
  caso('baixa é imutável (UPDATE)', 'negado', escrita(mudaBaixa))

  const est = await D.from('estornos').insert({ baixa_id: b2.data?.[0]?.id, motivo: NOME }).select('id, usuario_id')
  caso('estorno da 2ª baixa (perfil 1)', 'permitido', escrita(est), est.error?.message)
  ;({ data: v1 } = await D.from('v_contas_receber').select('status_id, saldo').eq('id', p1?.id).single())
  caso('estornada: volta a "A receber" com saldo 21,15', '1/21.15', v1 ? `${v1.status_id}/${reais(v1.saldo)}` : null)
  caso('a baixa estornada continua existindo (fato, não UPDATE)', 'permitido', await enxerga(D, 'baixas', 'id', b2.data?.[0]?.id))
  caso('estornar a mesma baixa de novo', '23505', codigo(await D.from('estornos').insert({ baixa_id: b2.data?.[0]?.id, motivo: NOME }).select('id')))

  // --------------------------------------------------------------------------- recibo
  const rec = await D.rpc('fn_baixar_contas_receber', {
    p_contas: [p2?.id, p3?.id],
    p_dt_credito: '2030-03-01',
    p_dt_nf: '2030-03-01',
    p_gerar_recibo: true,
    p_recibo_endereco: d.origem,
  })
  caso('baixa em lote gerando recibo', 'sem erro', codigo(rec), rec.error?.message)
  const { data: recibo } = await D.from('recibos').select('numero, valor_total').eq('id', rec.data).maybeSingle()
  caso('recibo declara a soma das COMISSÕES: 41,15 + 41,16 = 82,31', '82.31', reais(recibo?.valor_total))
  const { data: bxRec } = await D.from('baixas').select('nf_megabox_numero').eq('recibo_id', rec.data)
  caso('número do recibo carimbado nas baixas (bTrPO)', `${recibo?.numero}|${recibo?.numero}`, (bxRec ?? []).map((b) => b.nf_megabox_numero).join('|'))
  const { data: st23 } = await D.from('contas_receber').select('status_id').in('id', [p2?.id, p3?.id])
  caso('parcelas 2 e 3 recebidas', '2|2', (st23 ?? []).map((c) => c.status_id).join('|'))
  const reciboFalso = await D.from('recibos').insert({ fornecedor_id: d.fornecedor, valor_total: '10.00' }).select('id')
  caso('recibo sem baixas que somem o valor: recusado no commit', '23514', codigo(reciboFalso))

  const cob = await D.rpc('fn_registrar_cobranca', { p_contas: [p1?.id], p_endereco_fornecedor: d.origem })
  caso('cobrança: número por sequence, fornecedor da filial', `true/${d.fornecedor}`, `${Number.isInteger(cob.data?.numero)}/${cob.data?.fornecedor_id}`, cob.error?.message)

  // --------------------------------------------------------------------------- metas
  console.log('\nMetas (perfil 1):')
  // entrega B confirmada SEM conta a pagar (a regra das duas origens é parâmetro)
  const confB = await D.rpc('fn_confirmar_entrega', { p_entrega: d.entB.id, p_dt_entrega: '2030-01-25', p_gerar_conta_pagar: false })
  caso('confirmação com p_gerar_conta_pagar = false', 'sem erro', codigo(confB), confB.error?.message)
  const { count: nCpB } = await D.from('contas_pagar').select('id', { count: 'exact', head: true }).eq('entrega_id', d.entB.id)
  caso('… não cria conta a pagar', 0, nCpB)

  const meta = await D.from('metas_mensais')
    .insert({ vendedor_id: dir.id, tipo_meta_id: 1, valor_meta: '200.01', periodo_inicio: '2030-01-01', periodo_fim: '2030-01-31', nivel_id: d.nivel })
    .select('id, competencia')
  caso('perfil 1 cria meta mensal', 'permitido', escrita(meta), meta.error?.message)
  const metaId = meta.data?.[0]?.id
  caso('competência derivada = dia 1', '2030-01-01', meta.data?.[0]?.competencia)

  let { data: at } = await D.from('v_meta_atingimento').select('*').eq('meta_mensal_id', metaId).single()
  caso('realizado = 123,46 + 76,55 = 200,01', '200.01', reais(at?.realizado))
  caso('exatamente 100% = meta batida (o ≥ de bTvqD)', 'true/1.0000', `${at?.meta_batida}/${Number(at?.percentual).toFixed(4)}`)
  caso('batida: fator 0,0725 → 200,01 × 0,0725 = 14,500725 → 14,50', '0.0725/14.50', `${Number(at?.fator_comissao).toFixed(4)}/${reais(at?.comissao_vendedor)}`)

  await D.from('metas_mensais').update({ valor_meta: '250.00' }).eq('id', metaId)
  ;({ data: at } = await D.from('v_meta_atingimento').select('*').eq('meta_mensal_id', metaId).single())
  caso('não batida: 80%, fator padrão 0,0333 → 6,660333 → 6,66', 'false/0.8000/0.0333/6.66', `${at?.meta_batida}/${Number(at?.percentual).toFixed(4)}/${Number(at?.fator_comissao).toFixed(4)}/${reais(at?.comissao_vendedor)}`)
  const { data: rk } = await D.from('v_ranking_metas').select('posicao').eq('meta_mensal_id', metaId).single()
  caso('ranking calculado, sem gravar (B2)', 1, rk?.posicao)
  await D.from('metas_mensais').update({ valor_meta: '200.01' }).eq('id', metaId)

  // AS DUAS ORIGENS: a entrega A já é paga pela CP de entrega → o fechamento é recusado
  const fechaDup = await D.rpc('fn_fechar_meta', { p_meta: metaId })
  caso('DUAS ORIGENS: fechar meta com entrega já paga ao vendedor → recusado', '23505', codigo(fechaDup), fechaDup.error?.message)
  const { count: nFech } = await D.from('metas_fechadas').select('id', { count: 'exact', head: true }).eq('meta_mensal_id', metaId)
  caso('… e nada ficou gravado (transação)', 0, nFech)

  // cancela a CP de entrega (sem baixa) → a entrega volta a poder ser paga
  const cancelaCp = await D.from('contas_pagar').update({ cancelada_em: new Date().toISOString(), motivo_cancelamento: NOME }).eq('id', cpA?.[0]?.id).select('id')
  caso('cancelar CP de entrega (lógico) solta a entrega', 'permitido', escrita(cancelaCp), cancelaCp.error?.message)

  const fecha = await D.rpc('fn_fechar_meta', { p_meta: metaId })
  caso('fechar a meta', 'sem erro', codigo(fecha), fecha.error?.message)
  const { data: mf } = await D.from('metas_fechadas')
    .select('total_comissao_megabox, fator_comissao, total_comissao_vendedor, fechada_por')
    .eq('id', fecha.data)
    .maybeSingle()
  caso('retrato: 200,01 × 0,0725 = 14,50, por quem fechou', `200.01/0.0725/14.50/${dir.id}`, mf ? `${reais(mf.total_comissao_megabox)}/${Number(mf.fator_comissao).toFixed(4)}/${reais(mf.total_comissao_vendedor)}/${mf.fechada_por}` : null)
  const { count: nMfe } = await D.from('meta_fechada_entregas').select('entrega_id', { count: 'exact', head: true }).eq('meta_fechada_id', fecha.data)
  caso('as 2 entregas que produziram o valor ficam vinculadas', 2, nMfe)
  const { data: cpMeta } = await D.from('contas_pagar').select('id, valor_comissao, dt_vencimento, status_id').eq('meta_fechada_id', fecha.data)
  const hoje10 = new Date(Date.now() + 10 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
  caso('CP de meta = 14,50, vence hoje + 10, A pagar', `14.50/${hoje10}/3`, cpMeta?.[0] ? `${reais(cpMeta[0].valor_comissao)}/${cpMeta[0].dt_vencimento}/${cpMeta[0].status_id}` : null)
  caso('DUAS ORIGENS (inverso): CP de entrega para entrega já paga pela meta', '23505', codigo(await D.rpc('fn_gerar_conta_pagar', { p_entrega: d.entA.id })))
  caso('meta fechada não muda de valor', '55000', codigo(await D.from('metas_mensais').update({ valor_meta: '1.00' }).eq('id', metaId).select('id')))
  caso('fechar de novo', '23505', codigo(await D.rpc('fn_fechar_meta', { p_meta: metaId })))
  ;({ data: at } = await D.from('v_meta_atingimento').select('fechada, comissao_vendedor').eq('meta_mensal_id', metaId).single())
  caso('view usa o retrato congelado', 'true/14.50', `${at?.fechada}/${reais(at?.comissao_vendedor)}`)

  const cancMeta = await D.rpc('fn_cancelar_fechamento_meta', { p_meta_fechada: fecha.data, p_motivo: NOME })
  caso('cancelar o fechamento (perfil 1)', 'sem erro', codigo(cancMeta), cancMeta.error?.message)
  ;({ data: at } = await D.from('v_meta_atingimento').select('fechada').eq('meta_mensal_id', metaId).single())
  caso('… a meta volta a aberta', false, at?.fechada)
  const { data: cpCanc } = await D.from('contas_pagar').select('cancelada_em').eq('id', cpMeta?.[0]?.id).maybeSingle()
  caso('… e a CP da meta fica cancelada, não apagada', true, Boolean(cpCanc?.cancelada_em))

  // --------------------------------------------------- redistribuição sem apagar (bTlqO)
  console.log('\nRedistribuição (perfil 1):')
  const { data: crB0 } = await D.from('contas_receber').select('id').eq('entrega_id', d.entB.id).order('parcela')
  await D.from('entregas').update({ qtd: 2 }).eq('id', d.entB.id)
  const { data: conf1 } = await D.from('v_conferencia_comissao_entrega').select('diferenca_comissao').eq('entrega_id', d.entB.id).single()
  caso('entrega mudou: a conferência acusa 76,55 de diferença', '76.55', reais(conf1?.diferenca_comissao))
  const reeq = await D.rpc('fn_reequilibrar_parcelas', { p_entrega: d.entB.id, p_motivo: NOME })
  caso('reequilibrar', 'sem erro', codigo(reeq), reeq.error?.message)
  const { data: crB } = await D.from('contas_receber').select('id, valor_comissao, valor_total').eq('entrega_id', d.entB.id).order('parcela')
  caso('153,10 em 3 → 51,03 + 51,03 + 51,04', '51.03|51.03|51.04', (crB ?? []).map((c) => reais(c.valor_comissao)).join('|'))
  caso('venda 1000,00 → 333,33 + 333,33 + 333,34', '333.33|333.33|333.34', (crB ?? []).map((c) => reais(c.valor_total)).join('|'))
  caso('as MESMAS parcelas (ids preservados)', (crB0 ?? []).map((c) => c.id).join(), (crB ?? []).map((c) => c.id).join())
  caso('reequilibrar com parcela baixada é recusado', '55000', codigo(await D.rpc('fn_reequilibrar_parcelas', { p_entrega: d.entA.id, p_motivo: NOME })))

  // ----------------------------------------------------------- Operador SEM as páginas
  console.log('\nCom sessão (Operador, perfil 4, SEM financeiro e SEM metas):')
  caso('lê parcela de outro', 'negado', await enxerga(O, 'contas_receber', 'id', p1?.id))
  caso('lê meta de outro', 'negado', await enxerga(O, 'metas_mensais', 'id', metaId))
  caso('grava baixa', 'negado', escrita(await O.from('baixas').insert({ conta_receber_id: p1?.id, valor: '1.00' }).select('id')))
  caso('grava meta mensal própria', 'negado', escrita(await O.from('metas_mensais').insert({ vendedor_id: op.id, tipo_meta_id: 1, valor_meta: '1.00', periodo_inicio: '2030-02-01', periodo_fim: '2030-02-28', nivel_id: d.nivel }).select('id')))
  caso('fecha meta de outro', 'P0002', codigo(await O.rpc('fn_fechar_meta', { p_meta: metaId })))
  caso('gera parcelas de entrega de outro', 'P0002', codigo(await O.rpc('fn_gerar_contas_receber', { p_entrega: d.entB.id })))

  // ------------------------------------------ Operador COM as páginas: o sigilo por vendedor
  const concedidas = await exigir(
    admin
      .from('permissoes_pagina')
      .insert([
        { pagina_slug: 'financeiro', usuario_id: op.id },
        { pagina_slug: 'metas', usuario_id: op.id },
      ])
      .select('id'),
    'conceder páginas ao Operador',
  )
  permissoesCriadas = concedidas.map((p) => p.id)
  const metaOp = await D.from('metas_mensais')
    .insert({ vendedor_id: op.id, tipo_meta_id: 1, valor_meta: '100.00', periodo_inicio: '2030-01-01', periodo_fim: '2030-01-31', nivel_id: d.nivel })
    .select('id')
  caso('perfil 1 cria meta para o Operador', 'permitido', escrita(metaOp), metaOp.error?.message)

  console.log('\nCom sessão (Operador, perfil 4, COM financeiro e metas — sigilo):')
  caso('SIGILO: lê a comissão (CP) de outro vendedor', 'negado', await enxerga(O, 'contas_pagar', 'id', cpA?.[0]?.id))
  caso('SIGILO: lê a CP pela view', 'negado', await enxerga(O, 'v_contas_pagar', 'id', cpA?.[0]?.id))
  caso('SIGILO: lê parcela a receber de entrega de outro', 'negado', await enxerga(O, 'contas_receber', 'id', p1?.id))
  caso('SIGILO: lê a meta de outro', 'negado', await enxerga(O, 'metas_mensais', 'id', metaId))
  caso('SIGILO: lê o atingimento de outro pela view', 'negado', await enxerga(O, 'v_meta_atingimento', 'meta_mensal_id', metaId))
  caso('lê a própria meta', 'permitido', await enxerga(O, 'metas_mensais', 'id', metaOp.data?.[0]?.id))
  caso('lê o próprio atingimento', 'permitido', await enxerga(O, 'v_meta_atingimento', 'meta_mensal_id', metaOp.data?.[0]?.id))
  caso('cria meta (só hierarquia ≤ 2)', 'negado', escrita(await O.from('metas_mensais').insert({ vendedor_id: op.id, tipo_meta_id: 2, valor_meta: '1.00', periodo_inicio: '2030-01-01', periodo_fim: '2030-01-31', nivel_id: d.nivel }).select('id')))
  caso('cria a própria comissão (CP)', 'negado', escrita(await O.from('contas_pagar').insert({ origem: 'entrega', entrega_id: d.entB.id, vendedor_id: op.id, valor_base: '999.00', percentual: '1.0000', dt_vencimento: '2030-02-05' }).select('id')))
  // a meta própria é legível, mas o `for update` passa pela policy de escrita (hierarquia ≤ 2):
  // a linha some para ele (P0002) ou o GRANT recusa (42501) — os dois são recusa
  const fechaOp = await O.rpc('fn_fechar_meta', { p_meta: metaOp.data?.[0]?.id })
  caso('fecha a própria meta', 'negado', [RECUSADO, 'P0002'].includes(fechaOp.error?.code) ? 'negado' : `permitido (${codigo(fechaOp)})`)
  caso('estorna baixa', 'negado', escrita(await O.from('estornos').insert({ baixa_id: b1.data?.[0]?.id, motivo: NOME }).select('id')))
  caso('altera nível de vendedor', 'negado', escrita(await O.from('niveis_vendedor').update({ comissao_meta_batida: '1.0000' }).eq('id', d.nivel).select('id')))

  // --------------------------------- Operador na EQUIPE FINANCEIRA (016): departamento Financeiro
  // Sem isto um Analista do Financeiro abria a página e não via conta de vendedor nenhum. A equipe
  // passa a ver e operar o dinheiro de todos; meta e estorno continuam fora do alcance dela.
  const { data: linhaOp } = await admin.from('usuarios').select('departamento_id').eq('id', op.id).single()
  departamentoOriginalOp = { id: op.id, departamento_id: linhaOp?.departamento_id ?? null }
  await exigir(admin.from('usuarios').update({ departamento_id: 2 }).eq('id', op.id).select('id'), 'mover Operador para o Financeiro')

  console.log('\nCom sessão (Operador no departamento Financeiro, COM a página — equipe financeira):')
  caso('equipe lê a comissão (CP) de outro vendedor', 'permitido', await enxerga(O, 'contas_pagar', 'id', cpA?.[0]?.id))
  caso('equipe lê parcela a receber de outro vendedor', 'permitido', await enxerga(O, 'contas_receber', 'id', p1?.id))
  caso('equipe lê a entrega de outro vendedor', 'permitido', await enxerga(O, 'entregas', 'id', d.entA.id))
  caso('equipe NÃO lê a meta de outro (metas não mudou)', 'negado', await enxerga(O, 'metas_mensais', 'id', metaId))
  caso('equipe NÃO estorna (só perfil 1)', 'negado', escrita(await O.from('estornos').insert({ baixa_id: b1.data?.[0]?.id, motivo: NOME }).select('id')))

  // E a página sozinha, sem o departamento, não basta: é o caso do Analista do Comercial.
  await exigir(admin.from('usuarios').update({ departamento_id: 3 }).eq('id', op.id).select('id'), 'mover Operador para o Comercial')
  caso('página financeiro SEM departamento não lê CP de outro', 'negado', await enxerga(O, 'contas_pagar', 'id', cpA?.[0]?.id))

  await D.auth.signOut()
  await O.auth.signOut()

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
