/**
 * Prova que a RLS da cadeia de vendas (db/007, 008, 009) faz o que a spec diz.
 *
 * Mesmo molde de `scripts/testar-rls.mjs`: autentica de verdade com as duas contas de QA do
 * .env — QA_EMAIL/QA_SENHA (perfil 1) e QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA (perfil 4) — e
 * compara o que o banco devolve com o que `specs/02-modelo-de-dados-proposto.md` §7 promete.
 * As duas contas têm a página `vendas` (concessão nominal em permissoes_pagina).
 *
 * O que se prova, além de "anon não lê":
 *   - SIGILO POR VENDEDOR (02 §7.3, vendas.md §7.2): o Operador (hierarquia 4) só enxerga e só
 *     grava o que é dele; não lê a cotação, o orçamento (onde estão comissão e valores), o
 *     pedido nem a entrega do outro vendedor; não grava cotação em nome de outro.
 *   - SUBSTITUTO DE FÉRIAS (009): lê a entrega que cobre, a cotação e o pedido dela, grava na
 *     entrega, mas NÃO grava na cotação.
 *   - FILA DE E-MAIL (008 D7): authenticated não enfileira (42501), só lê o que é seu.
 *   - DINHEIRO (CLAUDE.md regra 10): as colunas geradas e a view reproduzem bTPFh em numeric,
 *     e a proposta enviada é snapshot imutável.
 *
 * Os dados de teste são criados com service_role (SUPABASE_SERVICE_ROLE_KEY), que aqui só
 * PREPARA e LIMPA — nunca afirma nada, porque ignora RLS. Tudo tem nome exato `__teste_rls_vendas__*`
 * e é apagado no fim, com `in` (nunca `like`: `_` é curinga). As férias/substituto da conta de
 * QA perfil 1 são alteradas para o caso do substituto e RESTAURADAS no fim.
 * Fica para trás só a trilha em `auditoria` (append-only por GRANT, nem service_role apaga).
 *
 *   node scripts/testar-rls-vendas.mjs
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
  'cotacoes',
  'cotacao_itens',
  'orcamentos_fornecedor',
  'propostas',
  'proposta_itens',
  'pedidos',
  'pedido_prazos',
  'email_outbox',
  'email_anexos',
  'entregas',
  'entrega_arquivos',
]
const VIEWS = ['v_orcamento_valores', 'v_kanban_entregas', 'v_kanban_cotacoes', 'v_kanban_pedidos']

const NOME = '__teste_rls_vendas__'
const NOME_CLIENTE = `${NOME}cliente`
const NOME_FORNECEDOR = `${NOME}fornecedor`

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

async function ler(cliente, tabela) {
  const { error } = await cliente.from(tabela).select('*').limit(1)
  return error ? 'negado' : 'permitido'
}

/** Enxerga UMA linha específica? RLS de leitura filtra sem erro, então conta linhas. */
async function enxerga(cliente, tabela, id) {
  const { data, error } = await cliente.from(tabela).select('id').eq('id', id)
  if (error) return `erro ${error.code}`
  return data.length === 1 ? 'permitido' : 'negado'
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
let feriasOriginais = null
let idPerfil1 = null

async function preparar(idDiretor, idOperador) {
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

  // Destino Lucro Real em GO, origem Simples em SP: as alíquotas do caso de dinheiro vão
  // explícitas, e o caso "origem fora do Lucro Real → 0 e 0" (007 D4) usa este par.
  const enderecos = await exigir(
    admin
      .from('enderecos_clifor')
      .insert([
        { grupo_id: cliente, nome_endereco: NOME, tipo_pessoa: 'cnpj', regime_tributario_id: 1, uf: 'GO' },
        { grupo_id: fornecedor, nome_endereco: NOME, tipo_pessoa: 'cnpj', regime_tributario_id: 2, uf: 'SP' },
      ])
      .select('id, grupo_id'),
    'enderecos',
  )
  const destino = enderecos.find((e) => e.grupo_id === cliente).id
  const origem = enderecos.find((e) => e.grupo_id === fornecedor).id

  const [produto] = await exigir(admin.from('produtos').insert({ nome: NOME }).select('id'), 'produto')

  // Férias do perfil 1 cobrindo a data prevista, com o Operador de substituto.
  const [u] = await exigir(
    admin.from('usuarios').select('ferias_inicio, ferias_fim, substituto_id').eq('id', idDiretor),
    'ler férias',
  )
  feriasOriginais = u
  idPerfil1 = idDiretor
  await exigir(
    admin
      .from('usuarios')
      .update({ ferias_inicio: '2030-01-01', ferias_fim: '2030-01-31', substituto_id: idOperador })
      .eq('id', idDiretor)
      .select('id'),
    'gravar férias',
  )

  // A cadeia inteira do perfil 1.
  const [cot] = await exigir(
    admin
      .from('cotacoes')
      .insert({ cliente_id: cliente, vendedor_id: idDiretor, empresa_emissora_id: 1 })
      .select('id'),
    'cotação',
  )
  const [item] = await exigir(
    admin
      .from('cotacao_itens')
      .insert({ cotacao_id: cot.id, produto_id: produto.id, qtd: 3, endereco_destino_id: destino })
      .select('id'),
    'item',
  )
  const [orc] = await exigir(
    admin
      .from('orcamentos_fornecedor')
      .insert({
        cotacao_item_id: item.id,
        cotacao_id: cot.id,
        fornecedor_id: fornecedor,
        endereco_origem_id: origem,
        endereco_destino_id: destino,
        produto_id: produto.id,
        vendedor_id: idDiretor,
        qtd_venda: 3,
        valor_venda_unit: '10.00',
        valor_comissao_unit: '1.50',
        valor_frete: '50.00',
        tipo_frete_id: 2, // CIF Informado: o frete entra no bruto
        aliquota_icms: '0.1200',
        aliquota_pis_cofins: '0.0925',
        vencedor: true,
      })
      .select('id'),
    'orçamento',
  )
  const [prop] = await exigir(
    admin
      .from('propostas')
      .insert({ cotacao_id: cot.id, numero: 1, vendedor_id: idDiretor, data_prev_entrega: '2030-01-10' })
      .select('id'),
    'proposta',
  )
  await exigir(
    admin.from('proposta_itens').insert({ proposta_id: prop.id, orcamento_fornecedor_id: orc.id }).select('id'),
    'item da proposta',
  )
  await exigir(admin.from('propostas').update({ enviada: true }).eq('id', prop.id).select('id'), 'enviar proposta')
  const [ped] = await exigir(
    admin
      .from('pedidos')
      .insert({ proposta_id: prop.id, cotacao_id: cot.id, vendedor_id: idDiretor })
      .select('id'),
    'pedido',
  )
  const [ent] = await exigir(
    admin
      .from('entregas')
      .insert({ pedido_id: ped.id, orcamento_fornecedor_id: orc.id, qtd: 1 })
      .select('id, vendedor_substituto_id'),
    'entrega',
  )
  const [mail] = await exigir(
    admin
      .from('email_outbox')
      .insert({ para: 'qa@example.invalid', assunto: NOME, corpo: NOME, criado_por: idDiretor })
      .select('id'),
    'e-mail',
  )

  return { cliente, fornecedor, origem, destino, produto: produto.id, cot: cot.id, item: item.id, orc: orc.id, prop: prop.id, ped: ped.id, ent, mail: mail.id }
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
  registrar('email_outbox', await admin.from('email_outbox').delete().eq('assunto', NOME).select('id'))

  const { data: grupos } = await admin
    .from('grupos_clifor')
    .select('id')
    .in('nome', [NOME_CLIENTE, NOME_FORNECEDOR])
  const ids = (grupos ?? []).map((g) => g.id)
  if (ids.length) {
    // Ordem das FKs `restrict`: entregas → pedidos → cotações (itens, orçamentos e propostas
    // vão em cascade) → produto, endereços, grupos.
    registrar('entregas', await admin.from('entregas').delete().in('cliente_id', ids).select('id'))
    registrar('pedidos', await admin.from('pedidos').delete().in('cliente_id', ids).select('id'))
    registrar('cotacoes', await admin.from('cotacoes').delete().in('cliente_id', ids).select('id'))
    registrar('enderecos_clifor', await admin.from('enderecos_clifor').delete().in('grupo_id', ids).select('id'))
    registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  registrar('produtos', await admin.from('produtos').delete().in('nome', [NOME]).select('id'))

  if (feriasOriginais && idPerfil1) {
    registrar(
      'férias do perfil 1 (restauradas)',
      await admin.from('usuarios').update(feriasOriginais).eq('id', idPerfil1).select('id'),
    )
  }
  console.log(`\nLimpeza: ${passos.join(' · ')}`)
}

// ------------------------------------------------------------------------------- casos
async function main() {
  // Se uma execução anterior morreu no meio, começa limpo.
  await limpar()

  console.log('\nSem sessão (papel anon) — nenhuma policy é `to anon` e o GRANT foi revogado:')
  const anonimo = createClient(URL, ANON, { auth: { persistSession: false } })
  for (const t of [...TABELAS, ...VIEWS]) caso(`anon lê ${t}`, 'negado', await ler(anonimo, t))
  const rpcAnon = await anonimo.rpc('fn_aliquota_icms', { p_uf_origem: 'SP', p_uf_destino: 'GO' })
  caso('anon executa fn_aliquota_icms', 'negado', rpcAnon.error?.code === RECUSADO ? 'negado' : 'permitido')
  const vencAnon = await anonimo.rpc('fn_definir_vencedor', { p_orcamento: '00000000-0000-0000-0000-000000000000' })
  caso('anon executa fn_definir_vencedor', 'negado', vencAnon.error?.code === RECUSADO ? 'negado' : 'permitido')

  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const d = await preparar(dir.id, op.id)

  // ------------------------------------------------------------------------ perfil 1
  console.log('\nCom sessão (conta de QA, perfil 1):')
  for (const t of [...TABELAS, ...VIEWS]) caso(`perfil 1 lê ${t}`, 'permitido', await ler(dir.cliente, t))

  // Dinheiro: 3 × 10,00 + frete 50,00 (CIF Informado) = 80,00; ICMS 12% de 30,00 = 3,60;
  // PIS/COFINS 9,25% de 30,00 = 2,775 → 2,78; líquido 73,62; unitário líquido 24,54.
  const { data: val } = await dir.cliente
    .from('v_orcamento_valores')
    .select('valor_venda_bruto, valor_comissao_bruto, valor_icms, valor_pis_cofins, valor_venda_liquido, valor_unit_liquido')
    .eq('id', d.orc)
    .single()
  caso('bTPFh: bruto = qtd × unit + frete CIF', '80.00', val ? Number(val.valor_venda_bruto).toFixed(2) : null)
  caso('bTPFh: comissão bruta = qtd × comissão unit', '4.50', val ? Number(val.valor_comissao_bruto).toFixed(2) : null)
  caso('bTPFh: ICMS sem frete', '3.60', val ? Number(val.valor_icms).toFixed(2) : null)
  caso('bTPFh: PIS/COFINS 2,775 arredonda para 2,78', '2.78', val ? Number(val.valor_pis_cofins).toFixed(2) : null)
  caso('bTPFh: líquido = bruto − tributos', '73.62', val ? Number(val.valor_venda_liquido).toFixed(2) : null)
  caso('bTeYL: unitário líquido', '24.540000', val ? Number(val.valor_unit_liquido).toFixed(6) : null)

  // Frete com FOB não entra (007 D1).
  const fob = await dir.cliente
    .from('orcamentos_fornecedor')
    .update({ tipo_frete_id: 1 })
    .eq('id', d.orc)
    .select('valor_venda_bruto')
  caso('frete FOB não entra no bruto', '30.00', fob.data?.[0] ? Number(fob.data[0].valor_venda_bruto).toFixed(2) : fob.error?.message)
  await dir.cliente.from('orcamentos_fornecedor').update({ tipo_frete_id: 2 }).eq('id', d.orc)

  // Origem Simples → alíquotas 0 e 0 quando não informadas (007 D4).
  const semAliq = await dir.cliente
    .from('orcamentos_fornecedor')
    .insert({
      cotacao_item_id: d.item,
      cotacao_id: d.cot,
      fornecedor_id: d.fornecedor,
      endereco_origem_id: d.origem,
      endereco_destino_id: d.destino,
      produto_id: d.produto,
      vendedor_id: dir.id,
      qtd_venda: 3,
      valor_venda_unit: '10.00',
    })
    .select('id, aliquota_icms, aliquota_pis_cofins')
  caso(
    'origem fora do Lucro Real: alíquotas nascem 0 e 0',
    '0/0',
    semAliq.data?.[0] ? `${Number(semAliq.data[0].aliquota_icms)}/${Number(semAliq.data[0].aliquota_pis_cofins)}` : semAliq.error?.message,
  )

  // Par sem alíquota: erro explícito, não zero silencioso (vendas-reusables §5.5 item 3).
  // Com `icms_aliquotas` carregada, os 27 × 27 pares REAIS existem; a ausência é provocada com
  // uma sigla que não é UF ('XX'), sem apagar nem mexer em dado real.
  const semPar = await dir.cliente.rpc('fn_aliquota_icms', { p_uf_origem: 'XX', p_uf_destino: 'XX' })
  caso('fn_aliquota_icms de par inexistente dá erro P0002', 'P0002', semPar.error?.code ?? 'sem erro')

  // Proposta enviada é snapshot imutável (008 D2) e não acompanha o orçamento (D1).
  const { data: pi } = await dir.cliente.from('proposta_itens').select('id, valor_venda_unit').eq('proposta_id', d.prop).single()
  caso('proposta_itens guardou o unitário do momento', '10.00', pi ? Number(pi.valor_venda_unit).toFixed(2) : null)
  const mexeu = await dir.cliente.from('proposta_itens').update({ qtd: 2 }).eq('id', pi?.id).select('id')
  caso('item de proposta enviada não muda', '55000', mexeu.error?.code ?? 'mudou')

  // Entrega: snapshot e substituto de férias (009 D5, D7).
  caso('entrega recebe o substituto de férias', op.id, d.ent.vendedor_substituto_id)

  // Views do kanban (015). Cadeia do perfil 1: 1 item, 1 vencedor (80,00), 1 proposta; o
  // orçamento sem alíquota acima é do mesmo item e NÃO é vencedor.
  const { data: kc } = await dir.cliente
    .from('v_kanban_cotacoes')
    .select('qtd_itens, qtd_vencedores, qtd_propostas, total_bruto_vencedores::text, pode_propor')
    .eq('id', d.cot)
    .maybeSingle()
  caso(
    'v_kanban_cotacoes: itens/vencedores/propostas/total/pode_propor',
    '1/1/1/80.00/true',
    kc ? `${kc.qtd_itens}/${kc.qtd_vencedores}/${kc.qtd_propostas}/${kc.total_bruto_vencedores}/${kc.pode_propor}` : null,
  )
  // Snapshot da proposta: 3 × 10,00 + frete CIF 50,00 = 80,00. Entrega em "Pedir": não concluída.
  const { data: kp } = await dir.cliente
    .from('v_kanban_pedidos')
    .select('valor_total::text, qtd_entregas, qtd_concluidas, todas_concluidas')
    .eq('id', d.ped)
    .maybeSingle()
  caso(
    'v_kanban_pedidos: valor do snapshot, entregas, todas_concluidas',
    '80.00/1/0/false',
    kp ? `${kp.valor_total}/${kp.qtd_entregas}/${kp.qtd_concluidas}/${kp.todas_concluidas}` : null,
  )
  const { data: ke } = await dir.cliente.from('v_kanban_entregas').select('vendedor_nome').eq('id', d.ent.id).maybeSingle()
  caso('v_kanban_entregas traz o nome do vendedor', 'sim', ke?.vendedor_nome ? 'sim' : 'não')

  // fn_definir_vencedor (015): troca atômica e regra bTOUP0.
  const [orc2] = await exigir(
    admin
      .from('orcamentos_fornecedor')
      .insert({
        cotacao_item_id: d.item,
        cotacao_id: d.cot,
        fornecedor_id: d.fornecedor,
        endereco_origem_id: d.origem,
        endereco_destino_id: d.destino,
        produto_id: d.produto,
        vendedor_id: dir.id,
        qtd_venda: 3,
        valor_venda_unit: '12.00',
        valor_comissao_unit: '1.00',
        aliquota_icms: '0',
        aliquota_pis_cofins: '0',
      })
      .select('id'),
    'segundo orçamento',
  )
  d.orc2 = orc2.id
  d.orcSemComissao = semAliq.data?.[0]?.id
  const vencedores = async () => {
    const { data } = await admin
      .from('orcamentos_fornecedor')
      .select('id')
      .eq('cotacao_item_id', d.item)
      .eq('vencedor', true)
    return (data ?? []).map((x) => (x.id === d.orc ? 'orc1' : x.id === d.orc2 ? 'orc2' : 'outro')).join(',')
  }
  const troca = await dir.cliente.rpc('fn_definir_vencedor', { p_orcamento: d.orc2 })
  caso('fn_definir_vencedor troca o vencedor do item', 'orc2', troca.error ? `erro ${troca.error.code}` : await vencedores())
  const semComissao = await dir.cliente.rpc('fn_definir_vencedor', { p_orcamento: d.orcSemComissao })
  caso('bTOUP0: comissão 0 não vence (23514)', '23514', semComissao.error?.code ?? 'sem erro')
  caso('bTOUP0: recusa não mexe no vencedor atual', 'orc2', await vencedores())
  await exigir(admin.from('cotacoes').update({ amostra: true }).eq('id', d.cot).select('id'), 'amostra on')
  const amostra = await dir.cliente.rpc('fn_definir_vencedor', { p_orcamento: d.orcSemComissao })
  caso('bTOUP0: em amostra, comissão 0 vence', 'outro', amostra.error ? `erro ${amostra.error.code}` : await vencedores())
  await exigir(admin.from('cotacoes').update({ amostra: false }).eq('id', d.cot).select('id'), 'amostra off')
  const volta = await dir.cliente.rpc('fn_definir_vencedor', { p_orcamento: d.orc })
  caso('fn_definir_vencedor devolve o troféu ao original', 'orc1', volta.error ? `erro ${volta.error.code}` : await vencedores())

  // Hierarquia ≤ 2 grava em nome de outro vendedor.
  const cotParaOp = await dir.cliente
    .from('cotacoes')
    .insert({ cliente_id: d.cliente, vendedor_id: op.id, empresa_emissora_id: 1 })
    .select('id')
  caso('perfil 1 cria cotação para o Operador', 'permitido', escrita(cotParaOp), cotParaOp.error?.message)

  // Fila de e-mail: lê o que é seu; não enfileira.
  caso('perfil 1 lê o próprio e-mail na fila', 'permitido', await enxerga(dir.cliente, 'email_outbox', d.mail))
  const enfileira = await dir.cliente
    .from('email_outbox')
    .insert({ para: 'x@example.invalid', assunto: NOME, corpo: NOME })
    .select('id')
  caso('authenticated enfileira e-mail (relay)', 'negado', escrita(enfileira), enfileira.error?.message)

  // ------------------------------------------------------------------------ Operador
  console.log('\nCom sessão (conta de Operador, perfil 4):')
  const o = op.cliente

  const minha = await o
    .from('cotacoes')
    .insert({ cliente_id: d.cliente, vendedor_id: op.id, empresa_emissora_id: 1 })
    .select('id')
  caso('Operador cria cotação própria', 'permitido', escrita(minha), minha.error?.message)

  const alheia = await o
    .from('cotacoes')
    .insert({ cliente_id: d.cliente, vendedor_id: dir.id, empresa_emissora_id: 1 })
    .select('id')
  caso('Operador cria cotação em nome de outro vendedor', 'negado', escrita(alheia), alheia.error?.message)

  caso('Operador lê a cotação criada para ele', 'permitido', await enxerga(o, 'cotacoes', cotParaOp.data?.[0]?.id))

  // O substituto enxerga a cotação e o pedido da entrega que cobre — por isso, para o
  // SIGILO, uma segunda cadeia do perfil 1 SEM entrega do Operador.
  const [cotSigilo] = await exigir(
    admin.from('cotacoes').insert({ cliente_id: d.cliente, vendedor_id: dir.id, empresa_emissora_id: 1 }).select('id'),
    'cotação sigilo',
  )
  const [itemSigilo] = await exigir(
    admin
      .from('cotacao_itens')
      .insert({ cotacao_id: cotSigilo.id, produto_id: d.produto, qtd: 1, endereco_destino_id: d.destino })
      .select('id'),
    'item sigilo',
  )
  const [orcSigilo] = await exigir(
    admin
      .from('orcamentos_fornecedor')
      .insert({
        cotacao_item_id: itemSigilo.id,
        cotacao_id: cotSigilo.id,
        fornecedor_id: d.fornecedor,
        endereco_origem_id: d.origem,
        endereco_destino_id: d.destino,
        produto_id: d.produto,
        vendedor_id: dir.id,
        qtd_venda: 1,
        valor_comissao_unit: '99.00',
      })
      .select('id'),
    'orçamento sigilo',
  )
  caso('SIGILO: Operador lê cotação de outro vendedor', 'negado', await enxerga(o, 'cotacoes', cotSigilo.id))
  caso('SIGILO: Operador lê orçamento (comissão) de outro vendedor', 'negado', await enxerga(o, 'orcamentos_fornecedor', orcSigilo.id))
  caso('SIGILO: Operador lê o orçamento pela view de valores', 'negado', await enxerga(o, 'v_orcamento_valores', orcSigilo.id))
  const mudaAlheia = await o.from('cotacoes').update({ amostra: true }).eq('id', cotSigilo.id).select('id')
  caso('SIGILO: Operador altera cotação de outro vendedor', 'negado', escrita(mudaAlheia), mudaAlheia.error?.message)
  const itemAlheio = await o
    .from('cotacao_itens')
    .insert({ cotacao_id: cotSigilo.id, produto_id: d.produto, qtd: 1, endereco_destino_id: d.destino })
    .select('id')
  caso('SIGILO: Operador põe item na cotação de outro', 'negado', escrita(itemAlheio), itemAlheio.error?.message)
  caso('Operador lê o e-mail que outro enfileirou', 'negado', await enxerga(o, 'email_outbox', d.mail))

  // Substituto de férias (009): lê a entrega, a cotação e o pedido; grava só na entrega.
  caso('substituto lê a entrega que cobre', 'permitido', await enxerga(o, 'entregas', d.ent.id))
  caso('substituto lê o pedido da entrega', 'permitido', await enxerga(o, 'pedidos', d.ped))
  caso('substituto lê a cotação da entrega', 'permitido', await enxerga(o, 'cotacoes', d.cot))
  caso('substituto lê o orçamento da entrega', 'permitido', await enxerga(o, 'orcamentos_fornecedor', d.orc))
  const { data: card } = await o.from('v_kanban_entregas').select('papel').eq('id', d.ent.id).maybeSingle()
  caso('v_kanban_entregas marca o papel de substituto', 'substituto', card?.papel ?? null)
  const saiu = await o.from('entregas').update({ saiu_entrega: true }).eq('id', d.ent.id).select('id')
  caso('substituto grava na entrega (saiu para entrega)', 'permitido', escrita(saiu), saiu.error?.message)
  const mexeCot = await o.from('cotacoes').update({ amostra: true }).eq('id', d.cot).select('id')
  caso('substituto altera a cotação do titular', 'negado', escrita(mexeCot), mexeCot.error?.message)
  const mexeOrc = await o.from('orcamentos_fornecedor').update({ valor_comissao_unit: '9.99' }).eq('id', d.orc).select('id')
  caso('substituto altera a comissão do orçamento', 'negado', escrita(mexeOrc), mexeOrc.error?.message)

  // 015: views e troca de vencedor pelo Operador.
  caso('SIGILO: Operador lê o total da cotação de outro (v_kanban_cotacoes)', 'negado', await enxerga(o, 'v_kanban_cotacoes', cotSigilo.id))
  const vencAlheio = await o.rpc('fn_definir_vencedor', { p_orcamento: orcSigilo.id })
  caso('SIGILO: Operador define vencedor em cotação de outro (P0002)', 'P0002', vencAlheio.error?.code ?? 'sem erro')
  // O substituto LÊ o orçamento da entrega que cobre, mas não grava: a troca recusa inteira.
  const vencSub = await o.rpc('fn_definir_vencedor', { p_orcamento: d.orc2 })
  caso('substituto define vencedor (42501)', RECUSADO, vencSub.error?.code ?? 'sem erro')
  const { data: aindaOrc1 } = await admin.from('orcamentos_fornecedor').select('vencedor').eq('id', d.orc).single()
  caso('recusa do substituto é atômica (o vencedor não foi desmarcado)', true, aindaOrc1?.vencedor)

  // Perfil 1 enxerga o que é do Operador (hierarquia ≤ 2).
  caso('perfil 1 lê a cotação do Operador', 'permitido', await enxerga(dir.cliente, 'cotacoes', minha.data?.[0]?.id))

  await dir.cliente.auth.signOut()
  await o.auth.signOut()

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
