/**
 * Mede, contra o banco de verdade e com a RLS de verdade, o custo de abrir/regravar a ficha da
 * cotação (vendas). Só LÊ: nenhuma escrita, nenhum service_role.
 *
 * Entra com a conta de QA do .env (QA_EMAIL/QA_SENHA, ou QA_OPERADOR_* com `--operador`), acha
 * a cotação mais recente visível com proposta e pedido e mede:
 *   1. cada parte da ficha sozinha (mediana de N rodadas);
 *   2. "antes": o que um clique no carrinho custava — revalidatePath re-renderizava a página
 *      inteira: cabeçalho → 9 consultas → contatos, mais as 7 listas dos selects e as 4 do
 *      quadro de opções, tudo junto;
 *   3. "depois": o que o clique custa agora — só o carrinho relido (itens + orçamentos).
 *
 *   node scripts/medir-ficha-vendas.mjs [--operador] [--rodadas 5] [--cotacao <uuid>]
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

const args = process.argv.slice(2)
const arg = (nome, padrao) => {
  const i = args.indexOf(nome)
  return i >= 0 ? args[i + 1] : padrao
}
const operador = args.includes('--operador')
const RODADAS = Number(arg('--rodadas', '5'))

const env = lerEnv()
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const { error: eLogin } = await s.auth.signInWithPassword({
  email: operador ? env.QA_OPERADOR_EMAIL : env.QA_EMAIL,
  password: operador ? env.QA_OPERADOR_SENHA : env.QA_SENHA,
})
if (eLogin) throw new Error(`login: ${eLogin.message}`)

let id = arg('--cotacao', null)
if (!id) {
  const { data, error } = await s
    .from('pedidos')
    .select('cotacao_id')
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) throw new Error(`nenhuma cotação com pedido visível: ${error?.message ?? ''}`)
  id = data.cotacao_id
}

const COLUNAS_VALORES =
  'id, cotacao_item_id, valor_venda_unit::text, valor_comissao_unit::text, valor_frete::text, ' +
  'tipo_frete_id, aliquota_icms::text, aliquota_pis_cofins::text, valor_venda_bruto::text, ' +
  'valor_comissao_bruto::text, valor_icms::text, valor_pis_cofins::text, valor_tributos::text, ' +
  'valor_venda_liquido::text, valor_unit_liquido::text, vencedor'

const PARTES = {
  cabecalho: () =>
    s
      .from('cotacoes')
      .select(
        'id, numero, criado_em, data_validade, amostra, arquivado, etapa_id, vendedor_id, cliente_id, empresa_emissora_id, rascunho, ' +
          'cliente:grupos_clifor(nome), vendedor:usuarios!vendedor_id(nome), empresa:empresas_emissoras(nome), ' +
          'status:cotacao_status(nome), etapa:etapas(nome), motivo:motivos_arquivamento(nome)',
      )
      .eq('id', id)
      .maybeSingle(),
  itens: () =>
    s
      .from('cotacao_itens')
      .select(
        'id, qtd::text, medida, produto_id, condicao_id, linha_id, endereco_destino_id, produto:produtos(nome, grupo_id), ' +
          'condicao:condicoes_produto(nome), linha:linhas_produto(nome), destino:enderecos_clifor(nome_endereco, uf, municipio)',
      )
      .eq('cotacao_id', id)
      .order('criado_em')
      .order('id'),
  valores: () => s.from('v_orcamento_valores').select(COLUNAS_VALORES).eq('cotacao_id', id).order('id'),
  nomes: () =>
    s
      .from('orcamentos_fornecedor')
      .select(
        'id, criado_em, fornecedor_id, fornecedor:grupos_clifor(nome), frete:tipos_frete(nome), ' +
          'origem:enderecos_clifor!endereco_origem_id(nome_endereco, uf, regime:regimes_tributarios(nome))',
      )
      .eq('cotacao_id', id),
  propostas: () =>
    s
      .from('propostas')
      .select(
        'id, numero, enviada, enviada_em, criado_em, data_prev_entrega, condicao_pagamento, info_adicional, emails_copia, ' +
          'corpo_email, enviar_para_contato_id, faturar_para_endereco_id, vendedor:usuarios!vendedor_id(nome), ' +
          'itens:proposta_itens(id, qtd::text, valor_venda_unit::text, valor_frete::text, ' +
          'orcamento:orcamentos_fornecedor(id, fornecedor_id, produto:produtos(nome), fornecedor:grupos_clifor(nome))), ' +
          'faturar:enderecos_clifor!faturar_para_endereco_id(documento, municipio, uf, grupo:grupos_clifor(nome)), ' +
          'contato:contatos_clifor!enviar_para_contato_id(nome, telefone), ' +
          'fornecedor_cnpj:enderecos_clifor!cnpj_fornecedor_endereco_id(documento, razao)',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false }),
  pedidos: () =>
    s
      .from('pedidos')
      .select(
        'id, numero, criado_em, etapa_id, formalizado, formalizado_em, finalizado, motivo_cancelamento, ordem_compra_numero, ' +
          'info_adicional, proposta_id, forma_pagamento_id, contato_cliente_id, contato_fornecedor_id, emails_copia_cliente, ' +
          'emails_copia_fornecedor, corpo_email_cliente, corpo_email_fornecedor, proposta:propostas(numero), ' +
          'forma:formas_pagamento(nome), etapa:etapas(nome), prazos:pedido_prazos(prazo_id)',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false }),
  entregas: () =>
    s
      .from('entregas')
      .select(
        'id, pedido_id, orcamento_fornecedor_id, status_id, qtd::text, dt_prev_entrega, dt_entrega, saiu_entrega, nao_emite_nf, ' +
          'nf_fornecedor_numero, dt_emissao_nf, nota_boleto_enviada, motivo_cancelamento, valor_venda_bruto::text, ' +
          'valor_comissao::text, valor_venda_liquido::text, vendedor_substituto_id, ' +
          'arquivos:entrega_arquivos(id, tipo, nome_arquivo, path, enviado_em)',
      )
      .eq('cotacao_id', id)
      .order('dt_prev_entrega', { ascending: true, nullsFirst: false })
      .order('criado_em'),
  documento: () =>
    s
      .from('v_proposta_documento_itens')
      .select(
        'id, proposta_id, qtd::text, valor_venda_unit::text, valor_frete::text, aliquota_icms::text, aliquota_pis_cofins::text, ' +
          'medida, produto_nome, condicao_nome, linha_nome, frete_nome, fornecedor_nome, destino_municipio, destino_uf, ' +
          'valor_total_bruto::text, valor_unit_liquido::text, total_proposta::text',
      )
      .eq('cotacao_id', id)
      .order('criado_em')
      .order('id'),
}

const OPCOES_FICHA = [
  () => s.from('produto_grupos').select('id, nome').order('nome'),
  () =>
    s
      .from('produtos')
      .select('id, nome, grupo_id, grupo:produto_grupos(nome), condicoes:produto_condicoes(condicao_id), linhas:produto_linhas(linha_id)')
      .eq('ativo', true)
      .order('nome'),
  () => s.from('condicoes_produto').select('id, nome').order('id'),
  () => s.from('linhas_produto').select('id, nome').order('id'),
  () => s.from('tipos_frete').select('id, nome').order('id'),
  () => s.from('prazos_recebimento').select('id, nome').eq('ativo', true).order('dias_prazo').order('id'),
  () => s.from('formas_pagamento').select('id, nome').order('id'),
]
const OPCOES = [
  () => s.from('etapas').select('id, nome').order('id'),
  () => s.from('usuarios').select('id, nome').eq('ativo', true).order('nome'),
  () => s.from('empresas_emissoras').select('id, nome').order('id'),
  () => s.from('motivos_arquivamento').select('id, nome').order('nome'),
]

async function cronometrar(f) {
  const t0 = performance.now()
  const r = await f()
  const erros = (Array.isArray(r) ? r : [r]).filter((x) => x?.error).map((x) => x.error.code ?? x.error.message)
  return { ms: performance.now() - t0, erros }
}
const mediana = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const fmt = (ms) => `${ms.toFixed(0).padStart(6)} ms`

async function medir(nome, f) {
  const tempos = []
  const erros = new Set()
  for (let i = 0; i < RODADAS; i++) {
    const r = await cronometrar(f)
    tempos.push(r.ms)
    r.erros.forEach((e) => erros.add(e))
    await new Promise((ok) => setTimeout(ok, 300))
  }
  console.log(`  ${nome.padEnd(34)} mediana ${fmt(mediana(tempos))}  máx ${fmt(Math.max(...tempos))}${erros.size ? `  ERROS ${[...erros].join(',')}` : ''}`)
}

console.log(`Conta: ${operador ? 'QA operador (perfil 4)' : 'QA (perfil 1)'} · cotação ${id} · ${RODADAS} rodadas\n`)
console.log('Partes da ficha, uma a uma:')
for (const [nome, f] of Object.entries(PARTES)) await medir(nome, f)

console.log('\nClique no carrinho / troféu:')
await medir('ANTES  (revalidatePath: ficha+listas)', async () => {
  const lado = Promise.all([...OPCOES, ...OPCOES_FICHA].map((f) => f()))
  const cab = await PARTES.cabecalho()
  const nove = await Promise.all(Object.entries(PARTES).filter(([n]) => n !== 'cabecalho').map(([, f]) => f()))
  const contatos = await s.from('contatos_clifor').select('id, grupo_id, nome, email').eq('grupo_id', cab.data.cliente_id).eq('ativo', true).limit(500)
  return [cab, ...nove, contatos, ...(await lado)]
})
await medir('DEPOIS (carrinho relido)', () => Promise.all([PARTES.itens(), PARTES.valores(), PARTES.nomes()]))
