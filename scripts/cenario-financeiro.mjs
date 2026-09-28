/**
 * Cenário de QA da tela /financeiro — e a limpeza dele.
 *
 * Hoje o banco não tem conta nenhuma (as entregas não carregaram). Para fotografar e exercitar
 * a tela, este script monta UM pedido com duas entregas que já saíram (status Em Entrega), no
 * mesmo molde de scripts/testar-rls-financeiro.mjs, e confirma a primeira PELA FUNÇÃO DO BANCO
 * (`fn_confirmar_entrega`, 010) com a sessão da conta de QA — que gera as 3 parcelas (rateio
 * exato, D3) e a comissão do vendedor. A segunda fica pendente, para ser confirmada pela tela.
 *
 * Tudo tem o nome exato `__qa_financeiro__*`. Baixa e estorno não se apagam pelo usuário (D8),
 * então a limpeza é com service_role, com `in`/`eq` (nunca `like`). Fica para trás só a trilha
 * em `auditoria` (append-only por GRANT).
 *
 *   node scripts/cenario-financeiro.mjs preparar
 *   node scripts/cenario-financeiro.mjs limpar
 */

import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

const env = {}
for (const linha of readFileSync('.env', 'utf8').split('\n')) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}

const NOME = '__qa_financeiro__'
const NOME_CLIENTE = `${NOME}cliente`
const NOME_FORNECEDOR = `${NOME}fornecedor`
const PRAZOS = [11, 18, 20] // 30dd, 60dd, 90dd (seed da 003)

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function exigir(promessa, oque) {
  const { data, error } = await promessa
  if (error) throw new Error(`${oque}: ${error.message}`)
  return data
}

const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())

async function preparar() {
  const sessao = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
  const { data: login, error } = await sessao.auth.signInWithPassword({ email: env.QA_EMAIL, password: env.QA_SENHA })
  if (error) throw new Error(`login QA: ${error.message}`)
  const vendedor = login.user.id

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
        { grupo_id: cliente, nome_endereco: `${NOME}filial cliente`, tipo_pessoa: 'cnpj', regime_tributario_id: 1, uf: 'GO' },
        {
          grupo_id: fornecedor,
          nome_endereco: `${NOME}filial fornecedor`,
          razao: `${NOME}fornecedor ltda`,
          tipo_pessoa: 'cnpj',
          regime_tributario_id: 1,
          uf: 'SP',
        },
      ])
      .select('id, grupo_id'),
    'endereços',
  )
  const destino = enderecos.find((e) => e.grupo_id === cliente).id
  const origem = enderecos.find((e) => e.grupo_id === fornecedor).id
  await exigir(
    admin.from('contatos_clifor').insert({ grupo_id: fornecedor, nome: `${NOME}contato`, email: 'qa@example.invalid' }).select('id'),
    'contato',
  )
  const [produto] = await exigir(admin.from('produtos').insert({ nome: NOME }).select('id'), 'produto')
  const [cot] = await exigir(
    admin.from('cotacoes').insert({ cliente_id: cliente, vendedor_id: vendedor, empresa_emissora_id: 1 }).select('id'),
    'cotação',
  )
  const itens = await exigir(
    admin
      .from('cotacao_itens')
      .insert([1, 2].map(() => ({ cotacao_id: cot.id, produto_id: produto.id, qtd: 1, endereco_destino_id: destino })))
      .select('id'),
    'itens',
  )
  const base = {
    cotacao_id: cot.id,
    fornecedor_id: fornecedor,
    endereco_origem_id: origem,
    endereco_destino_id: destino,
    produto_id: produto.id,
    vendedor_id: vendedor,
    qtd_venda: 1,
    tipo_frete_id: 1,
    aliquota_icms: '0.1200',
    aliquota_pis_cofins: '0.0925',
    vencedor: true,
  }
  // 123,46 em 3 parcelas = 41,15 + 41,15 + 41,16 (sobra na última, D3)
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
  const [prop] = await exigir(
    admin.from('propostas').insert({ cotacao_id: cot.id, numero: 1, vendedor_id: vendedor, data_prev_entrega: hoje }).select('id'),
    'proposta',
  )
  await exigir(
    admin.from('proposta_itens').insert(orcs.map((o) => ({ proposta_id: prop.id, orcamento_fornecedor_id: o.id }))).select('id'),
    'itens da proposta',
  )
  const [ped] = await exigir(
    admin.from('pedidos').insert({ proposta_id: prop.id, cotacao_id: cot.id, vendedor_id: vendedor }).select('id, numero'),
    'pedido',
  )
  await exigir(
    admin.from('pedido_prazos').insert(PRAZOS.map((p) => ({ pedido_id: ped.id, prazo_id: p }))).select('prazo_id'),
    'prazos',
  )
  const entregas = await exigir(
    admin
      .from('entregas')
      .insert(orcs.map((o) => ({ pedido_id: ped.id, orcamento_fornecedor_id: o.id, qtd: 1 })))
      .select('id, orcamento_fornecedor_id'),
    'entregas',
  )
  await exigir(
    admin.from('entregas').update({ status_id: 4, saiu_entrega: true }).in('id', entregas.map((e) => e.id)).select('id'),
    'saiu para entrega',
  )
  const orcA = orcs.find((o) => String(o.valor_comissao_unit).startsWith('123.46')).id
  const primeira = entregas.find((e) => e.orcamento_fornecedor_id === orcA)

  // Confirmação PELA FUNÇÃO DO BANCO, com a sessão (RLS de verdade), não com service_role.
  const { error: e2 } = await sessao.rpc('fn_confirmar_entrega', { p_entrega: primeira.id, p_dt_entrega: hoje })
  if (e2) throw new Error(`fn_confirmar_entrega: ${e2.message}`)

  const { data: crs } = await admin
    .from('contas_receber')
    .select('parcela, valor_comissao, dt_vencimento')
    .eq('entrega_id', primeira.id)
    .order('parcela')
  console.log(`Pedido ${ped.numero}: entrega confirmada, parcelas:`, crs)
  console.log('Segunda entrega pendente (aba "Confirmar entregas").')
}

async function limpar() {
  const passos = []
  const apagar = async (oque, promessa) => {
    const { data, error } = await promessa
    if (error) {
      console.error(`FALHA ao limpar ${oque}: ${error.message}`)
      process.exitCode = 1
    } else passos.push(`${oque}: ${data?.length ?? 0}`)
  }
  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', [NOME_CLIENTE, NOME_FORNECEDOR])
  const ids = (grupos ?? []).map((g) => g.id)
  if (ids.length) {
    const crIds = ((await admin.from('contas_receber').select('id').in('cliente_id', ids)).data ?? []).map((c) => c.id)
    const cpIds = ((await admin.from('contas_pagar').select('id').in('cliente_id', ids)).data ?? []).map((c) => c.id)
    const baixas = []
    if (crIds.length) baixas.push(...((await admin.from('baixas').select('id').in('conta_receber_id', crIds)).data ?? []))
    if (cpIds.length) baixas.push(...((await admin.from('baixas').select('id').in('conta_pagar_id', cpIds)).data ?? []))
    const baixaIds = baixas.map((b) => b.id)
    if (baixaIds.length) {
      await apagar('estornos', admin.from('estornos').delete().in('baixa_id', baixaIds).select('id'))
      await apagar('baixas', admin.from('baixas').delete().in('id', baixaIds).select('id'))
    }
    await apagar('cobrancas', admin.from('cobrancas').delete().in('fornecedor_id', ids).select('id'))
    await apagar('recibos', admin.from('recibos').delete().in('fornecedor_id', ids).select('id'))
    if (cpIds.length) await apagar('contas_pagar', admin.from('contas_pagar').delete().in('id', cpIds).select('id'))
    await apagar('contas_receber', admin.from('contas_receber').delete().in('cliente_id', ids).select('id'))
    await apagar('entregas', admin.from('entregas').delete().in('cliente_id', ids).select('id'))
    await apagar('pedidos', admin.from('pedidos').delete().in('cliente_id', ids).select('id'))
    await apagar('cotacoes', admin.from('cotacoes').delete().in('cliente_id', ids).select('id'))
    await apagar('contatos_clifor', admin.from('contatos_clifor').delete().in('grupo_id', ids).select('id'))
    await apagar('enderecos_clifor', admin.from('enderecos_clifor').delete().in('grupo_id', ids).select('id'))
    await apagar('grupos_clifor', admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  await apagar('produtos', admin.from('produtos').delete().eq('nome', NOME).select('id'))
  console.log(`Limpeza: ${passos.join(' · ') || 'nada a limpar'}`)
}

const modo = process.argv[2]
if (modo === 'preparar') {
  await limpar()
  await preparar()
} else if (modo === 'limpar') {
  await limpar()
} else {
  console.error('uso: node scripts/cenario-financeiro.mjs preparar|limpar')
  process.exitCode = 1
}
