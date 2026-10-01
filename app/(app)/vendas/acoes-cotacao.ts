'use server'

import { revalidatePath } from 'next/cache'

import {
  validarCabecalho,
  validarEdicaoOrcamento,
  validarProdutoCarrinho,
  validarQtdItem,
} from '@/lib/cotacao-tela'
import { exigirAcesso } from '@/lib/autorizacao'
import { clienteServidor } from '@/lib/supabase/servidor'
import { ehUuid, hojeSP, validarCotacao } from '@/lib/vendas'

import { adicionarItem } from './acoes'
import { buscarOpcoesFicha } from './consultas'
import { cotacaoEditavel, traduzirErro } from './regras-servidor'
import type { Destino, EstadoAcao, OpcoesFicha } from './tipos'

/*
 * Escrita da cotação em TELA CHEIA (`pop add edita cotacao`, spec vendas §2.6, §4.2, §4.3):
 * cabeçalho, carrinho em rascunho e edição inline dos orçamentos.
 *
 * Mesmas regras de acoes.ts: cada action repete `exigirAcesso('vendas')`, valida de novo e grava
 * com o cliente da SESSÃO (a RLS da 007 é a última palavra); etapa e arquivamento passam por
 * `cotacaoEditavel`. NENHUMA calcula dinheiro: bruto, comissão, ICMS e PIS/COFINS são colunas
 * geradas e as alíquotas vêm do trigger fn_orcamento_derivados.
 *
 * O carrinho da cotação nova é uma cotação com `rascunho = true` (db/007, substitui
 * User.TempOrcamentoProdutos): nasce no primeiro "adicionar ao carrinho", fica fora do kanban
 * (`rascunho = false` no filtro) e "Cancela" a apaga com itens e orçamentos em cascata — no
 * Bubble os orçamentos ficavam órfãos (vendas §8.3).
 */

const MSG_PROPOSTA = 'Este orçamento já está numa proposta. Descarte a proposta antes de apagar.'

// ------------------------------------------------------------------ abrir

/** Listas do carrinho para a cotação NOVA, que abre antes de existir ficha na URL. */
export async function opcoesDaCotacaoNova(): Promise<OpcoesFicha> {
  await exigirAcesso('vendas')
  return buscarOpcoesFicha(await clienteServidor())
}

/** "Endereço de entrega": endereços ATIVOS do cliente escolhido (select do cabeçalho). */
export async function enderecosDoCliente(clienteId: string): Promise<Destino[] | { erro: string }> {
  await exigirAcesso('vendas')
  if (!ehUuid(clienteId)) return { erro: 'Cliente inválido.' }
  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from('enderecos_clifor')
    .select('id, nome_endereco, uf, municipio')
    .eq('grupo_id', clienteId)
    .eq('ativo', true)
    .order('principal', { ascending: false })
    .order('nome_endereco')
  if (error) {
    console.error('vendas: endereços do cliente', error)
    return { erro: 'Não foi possível carregar os endereços agora.' }
  }
  return (data ?? []) as Destino[]
}

// --------------------------------------------------------------- carrinho

/**
 * Carrinho (WF bTNjj na nova, bTOir0 na edição): na cotação nova SEM rascunho, cria o rascunho
 * com o cabeçalho (cliente, empresa, validade, amostra — bTOTX0) e põe o produto nele; com
 * rascunho ou na edição, é o `adicionarItem` de sempre. O destino é o "Endereço de entrega" do
 * cabeçalho (bTNjp: destino = endereço de entrega escolhido).
 */
export async function adicionarAoCarrinho(anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  if (ehUuid(form.get('cotacao_id'))) return adicionarItem(anterior, form)

  // Valida o produto ANTES de criar o rascunho: erro de digitação não deixa cotação vazia.
  const cab = validarCotacao(form, hojeSP())
  if (!cab.ok) return { erro: cab.erro }
  const prod = validarProdutoCarrinho(form)
  if (!prod.ok) return { erro: prod.erro }
  const destino = form.get('endereco_destino_id')
  if (!ehUuid(destino)) return { erro: 'Escolha o endereço de entrega.' }

  const supabase = await clienteServidor()
  const [cliente, endereco] = await Promise.all([
    supabase
      .from('grupos_clifor')
      .select('id')
      .eq('id', cab.dados.cliente_id)
      .eq('tipo', 'cliente')
      .eq('ativo', true)
      .maybeSingle(),
    supabase
      .from('enderecos_clifor')
      .select('id')
      .eq('id', destino)
      .eq('grupo_id', cab.dados.cliente_id)
      .eq('ativo', true)
      .maybeSingle(),
  ])
  if (!cliente.data) return { erro: 'Cliente inativo ou inexistente. Escolha outro na lista.' }
  if (!endereco.data) return { erro: 'O endereço de entrega não é deste cliente, ou está inativo.' }

  const { data: nova, error } = await supabase
    .from('cotacoes')
    .insert({ ...cab.dados, rascunho: true, vendedor_id: usuario.id, criado_por: usuario.id })
    .select('id')
    .single()
  if (error) return { erro: traduzirErro('criar rascunho', error, 'Número de cotação repetido. Avise o suporte.') }

  const comCotacao = new FormData()
  for (const [k, v] of form.entries()) comCotacao.append(k, v)
  comCotacao.set('cotacao_id', nova.id as string)
  const r = await adicionarItem(anterior, comCotacao)
  if (r.erro) {
    // Produto recusado (condição/linha fora do produto, inativo…): o rascunho não fica vazio.
    await supabase.from('cotacoes').delete().eq('id', nova.id).eq('rascunho', true)
    return { erro: r.erro }
  }
  revalidatePath('/vendas')
  return { ok: 'Produto adicionado ao carrinho.', id: nova.id as string }
}

async function itemEditavel(supabase: Awaited<ReturnType<typeof clienteServidor>>, itemId: string) {
  const { data } = await supabase
    .from('cotacao_itens')
    .select('id, cotacao_id, produto_id')
    .eq('id', itemId)
    .maybeSingle()
  return data as { id: string; cotacao_id: string; produto_id: string } | null
}

/**
 * Qtd na linha do carrinho (WF bTOYp0): grava a qtd do item (bTOYv0) e a copia para `qtd_venda`
 * de todos os orçamentos dele (bTOZB0). O recálculo (bTPGL) é das colunas geradas.
 */
export async function alterarQtdItem(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const v = validarQtdItem(form)
  if (!v.ok) return { erro: v.erro }
  const supabase = await clienteServidor()
  const item = await itemEditavel(supabase, v.dados.item_id)
  if (!item) return { erro: 'Este item não existe mais. Recarregue a página.' }
  const r = await cotacaoEditavel(supabase, usuario, item.cotacao_id)
  if ('erro' in r) return { erro: r.erro }

  // Item + orçamentos numa transação só (db/022 fn_alterar_qtd_item): antes eram dois UPDATEs,
  // e uma falha no segundo deixava item e orçamentos com quantidades diferentes.
  const { error } = await supabase.rpc('fn_alterar_qtd_item', { p_item: item.id, p_qtd: v.dados.qtd })
  if (error) {
    if (error.code === 'P0002') return { erro: 'Este item não existe mais. Recarregue a página.' }
    if (error.code === '22003') {
      console.error('vendas: qtd do item', error)
      return { erro: 'Quantidade grande demais: o valor do orçamento passaria do limite.' }
    }
    return { erro: traduzirErro('qtd do item', error) }
  }
  revalidatePath('/vendas')
  return { ok: 'Quantidade alterada.', id: item.cotacao_id }
}

/**
 * Lápis do item → disquete (WF bTOiR0): atualiza o produto do carrinho (bTOiX0) e copia qtd,
 * medida, linha e condição para os orçamentos (bTOip0). Trocar o PRODUTO de um item que já tem
 * orçamento não é aceito: os fornecedores orçaram o produto antigo.
 */
export async function editarItem(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const itemId = form.get('item_id')
  if (!ehUuid(itemId)) return { erro: 'Item inválido. Recarregue a página.' }
  const v = validarProdutoCarrinho(form)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados

  const supabase = await clienteServidor()
  const item = await itemEditavel(supabase, itemId)
  if (!item) return { erro: 'Este item não existe mais. Recarregue a página.' }
  const r = await cotacaoEditavel(supabase, usuario, item.cotacao_id)
  if ('erro' in r) return { erro: r.erro }

  const [produto, condicao, linha, orcs] = await Promise.all([
    supabase.from('produtos').select('id, grupo_id').eq('id', d.produto_id).eq('ativo', true).maybeSingle(),
    d.condicao_id === null
      ? Promise.resolve({ data: true })
      : supabase
          .from('produto_condicoes')
          .select('produto_id')
          .eq('produto_id', d.produto_id)
          .eq('condicao_id', d.condicao_id)
          .maybeSingle(),
    d.linha_id === null
      ? Promise.resolve({ data: true })
      : supabase
          .from('produto_linhas')
          .select('produto_id')
          .eq('produto_id', d.produto_id)
          .eq('linha_id', d.linha_id)
          .maybeSingle(),
    supabase.from('orcamentos_fornecedor').select('id', { count: 'exact', head: true }).eq('cotacao_item_id', item.id),
  ])
  if (!produto.data) return { erro: 'Produto inativo ou inexistente.' }
  if (!condicao.data) return { erro: 'Esta condição não existe para o produto escolhido.' }
  if (!linha.data) return { erro: 'Esta linha não existe para o produto escolhido.' }
  if (d.produto_id !== item.produto_id && (orcs.count ?? 0) > 0) {
    return { erro: 'Este produto já tem fornecedores orçados. Apague os orçamentos para trocar o produto.' }
  }

  const orc = await supabase
    .from('orcamentos_fornecedor')
    .update({ qtd_venda: d.qtd, medida: d.medida, linha_id: d.linha_id, condicao_id: d.condicao_id })
    .eq('cotacao_item_id', item.id)
  if (orc.error) return { erro: traduzirErro('editar orçamentos do item', orc.error) }
  const { error } = await supabase
    .from('cotacao_itens')
    .update({ ...d, grupo_produto_id: (produto.data as { grupo_id: string | null }).grupo_id })
    .eq('id', item.id)
  if (error) return { erro: traduzirErro('editar item', error) }
  revalidatePath('/vendas')
  return { ok: 'Produto alterado.', id: item.cotacao_id }
}

/** Lixeira do item (WF bTOSp0): apaga o item e, em cascata, os orçamentos dele (bTOSz0). */
export async function excluirItem(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const itemId = form.get('item_id')
  if (!ehUuid(itemId)) return { erro: 'Item inválido. Recarregue a página.' }
  const supabase = await clienteServidor()
  const item = await itemEditavel(supabase, itemId)
  if (!item) return { erro: 'Este item não existe mais. Recarregue a página.' }
  const r = await cotacaoEditavel(supabase, usuario, item.cotacao_id)
  if ('erro' in r) return { erro: r.erro }
  const { data, error } = await supabase.from('cotacao_itens').delete().eq('id', item.id).select('id')
  if (error) {
    if (error.code === '23503') return { erro: MSG_PROPOSTA }
    return { erro: traduzirErro('apagar item', error) }
  }
  if (!data || data.length === 0) return { erro: 'Não foi possível apagar este produto.' }
  revalidatePath('/vendas')
  return { ok: 'Produto removido do carrinho.', id: item.cotacao_id }
}

// -------------------------------------------------------------- orçamento

async function orcamentoDaCotacao(supabase: Awaited<ReturnType<typeof clienteServidor>>, id: string) {
  const { data } = await supabase.from('orcamentos_fornecedor').select('id, cotacao_id').eq('id', id).maybeSingle()
  return data as { id: string; cotacao_id: string } | null
}

/**
 * Edição inline do orçamento (auto-binding: bTOXZ0, bTOXg0, bTPGv, bTOSi0 → bTOSo0). Grava só
 * o que a pessoa digita; bruto, comissão, ICMS e PIS/COFINS se refazem nas colunas geradas.
 */
export async function editarOrcamento(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const v = validarEdicaoOrcamento(form)
  if (!v.ok) return { erro: v.erro }
  const { orcamento_id, ...valores } = v.dados
  const supabase = await clienteServidor()
  const orc = await orcamentoDaCotacao(supabase, orcamento_id)
  if (!orc) return { erro: 'Este orçamento não existe mais. Recarregue a página.' }
  const r = await cotacaoEditavel(supabase, usuario, orc.cotacao_id)
  if ('erro' in r) return { erro: r.erro }
  const { data, error } = await supabase
    .from('orcamentos_fornecedor')
    .update(valores)
    .eq('id', orcamento_id)
    .select('id')
  if (error) return { erro: traduzirErro('editar orçamento', error) }
  if (!data || data.length === 0) return { erro: 'Não foi possível gravar este orçamento.' }
  revalidatePath('/vendas')
  return { ok: 'Orçamento gravado.', id: orc.cotacao_id }
}

/** Lixeira do orçamento (WF bTOTH0). Orçamento já numa proposta não sai (FK da 008). */
export async function excluirOrcamento(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const id = form.get('orcamento_id')
  if (!ehUuid(id)) return { erro: 'Orçamento inválido. Recarregue a página.' }
  const supabase = await clienteServidor()
  const orc = await orcamentoDaCotacao(supabase, id)
  if (!orc) return { erro: 'Este orçamento não existe mais. Recarregue a página.' }
  const r = await cotacaoEditavel(supabase, usuario, orc.cotacao_id)
  if ('erro' in r) return { erro: r.erro }
  const { data, error } = await supabase.from('orcamentos_fornecedor').delete().eq('id', id).select('id')
  if (error) {
    if (error.code === '23503') return { erro: MSG_PROPOSTA }
    return { erro: traduzirErro('apagar orçamento', error) }
  }
  if (!data || data.length === 0) return { erro: 'Não foi possível apagar este orçamento.' }
  revalidatePath('/vendas')
  return { ok: 'Orçamento apagado.', id: orc.cotacao_id }
}

// --------------------------------------------------------------- cabeçalho

/**
 * Cabeçalho da cotação: empresa, validade e amostra (bTOTX0 na nova, bTOjb0 na edição).
 * `finalizar=true` é o "Gravar/Salvar Cotação": o rascunho vira cotação de verdade e entra no
 * kanban. Sem `finalizar` (troca do "Pedido de Amostra"), grava na hora: a regra do troféu
 * (bTOUP0, fn_definir_vencedor) lê `amostra` do banco.
 */
export async function gravarCabecalho(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const id = form.get('cotacao_id')
  if (!ehUuid(id)) return { erro: 'Cotação inválida. Recarregue a página.' }
  const supabase = await clienteServidor()
  const r = await cotacaoEditavel(supabase, usuario, id)
  if ('erro' in r) return { erro: r.erro }
  const { data: atual } = await supabase.from('cotacoes').select('data_validade, rascunho').eq('id', id).maybeSingle()
  const v = validarCabecalho(form, hojeSP(), (atual?.data_validade as string | null) ?? null)
  if (!v.ok) return { erro: v.erro }
  const { cotacao_id, ...dados } = v.dados
  const finalizar = form.get('finalizar') === 'true'

  const { data, error } = await supabase
    .from('cotacoes')
    .update(finalizar ? { ...dados, rascunho: false } : dados)
    .eq('id', cotacao_id)
    .select('numero')
  if (error) return { erro: traduzirErro('gravar cabeçalho', error) }
  if (!data || data.length === 0) return { erro: 'Não foi possível gravar esta cotação.' }
  revalidatePath('/vendas')
  if (!finalizar) return { ok: dados.amostra ? 'Marcada como Pedido de Amostra.' : 'Desmarcado Pedido de Amostra.', id: cotacao_id }
  return {
    ok: atual?.rascunho ? `Cotação nº ${data[0]!.numero} gravada.` : `Cotação nº ${data[0]!.numero} salva.`,
    id: cotacao_id,
  }
}

/** "Cancela" da cotação nova (WF bTOOP → bTOjt0): apaga o rascunho, com itens e orçamentos. */
export async function descartarRascunho(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('vendas')
  const id = form.get('cotacao_id')
  if (!ehUuid(id)) return { erro: 'Cotação inválida. Recarregue a página.' }
  const supabase = await clienteServidor()
  const { error } = await supabase.from('cotacoes').delete().eq('id', id).eq('rascunho', true)
  if (error) return { erro: traduzirErro('descartar rascunho', error) }
  revalidatePath('/vendas')
  return { ok: 'Cotação descartada.' }
}
