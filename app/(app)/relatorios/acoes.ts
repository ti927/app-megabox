'use server'

import { exigirAcesso } from '@/lib/autorizacao'
import { hojeSaoPaulo, lerFiltros, montarMatriz, paraCsv, rotuloMes, valorDaMedida } from '@/lib/relatorios'
import { lerExtras, mesesDoPeriodo } from '@/lib/relatorios-paineis'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { LinhaDetalhe, LinhaMes, LinhaProdutoGrupo } from './tipos'

export type ResultadoCsv = { ok: true; nome: string; conteudo: string } | { ok: false; erro: string }
export type ResultadoDetalhe = { ok: true; linhas: LinhaDetalhe[] } | { ok: false; erro: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MES = /^\d{4}-\d{2}-01$/

/** Relê a query string da tela como se fosse a URL: nada do navegador é confiado. */
async function contexto(query: string) {
  const usuario = await exigirAcesso('relatorios')
  const params = Object.fromEntries(new URLSearchParams(query))
  const { filtros, aviso } = lerFiltros(params, hojeSaoPaulo())
  if (!usuario.ehGerenciaOuAcima) filtros.vendedor = null
  return { filtros, aviso, extras: lerExtras(params), supabase: await clienteServidor() }
}

/**
 * CSV de "Outros relatórios", gerado NO SERVIDOR a partir das MESMAS funções da tela (021) e com
 * os mesmos filtros de coluna: o arquivo é o que está na tela. Colunas do HTML B (produto) e do
 * HTML A (uma coluna por mês), separador `;` e BOM, como o Bubble exportava.
 */
export async function exportarCsv(query: string): Promise<ResultadoCsv> {
  const { filtros, aviso, extras, supabase } = await contexto(query)
  if (aviso) return { ok: false, erro: aviso }
  if (filtros.aba !== 'outros') return { ok: false, erro: 'Exportação existe só em "Outros relatórios".' }
  const periodo = { p_inicio: filtros.inicio, p_fim: filtros.fim, p_vendedor: filtros.vendedor }
  const sufixo = `${filtros.inicio}_${filtros.fim}`

  if (filtros.modelo === 'produtos') {
    const { data, error } = await supabase.rpc('fn_rel_entregas_produtos', {
      ...periodo,
      p_produto: extras.produto || null,
      p_fornecedor: extras.fornecedor || null,
      p_uf: extras.uf || null,
      p_cliente: extras.cliente || null,
    })
    if (error) return { ok: false, erro: 'Não foi possível gerar o arquivo.' }
    const linhas = ((data ?? []) as LinhaProdutoGrupo[]).map((l) => [
      l.nivel === 1 ? 'TOTAL' : l.produto,
      String(l.qtd),
      l.fornecedores.join(', '),
      l.ufs.join(', '),
      l.clientes.join(', '),
      String(l.valor_venda_bruto),
      String(l.valor_comissao),
    ])
    const cab = ['PRODUTO', 'QTD', 'FORNECEDORES', 'UF', 'CLIENTES', 'TOTAL VENDA', 'TOTAL COMISSAO']
    return { ok: true, nome: `relatorio-produtos_${sufixo}.csv`, conteudo: paraCsv(cab, linhas) }
  }

  const clientes = filtros.modelo === 'clientes'
  const { data, error } = await supabase.rpc('fn_rel_entregas_mes', {
    p_eixo: clientes ? 'cliente' : 'fornecedor',
    ...periodo,
    p_nome: (clientes ? extras.cliente : extras.fornecedor) || null,
    p_uf: extras.uf || null,
  })
  if (error) return { ok: false, erro: 'Não foi possível gerar o arquivo.' }
  const matriz = montarMatriz((data ?? []) as LinhaMes[])
  const meses = mesesDoPeriodo(filtros.inicio, filtros.fim)
  const m = filtros.medida
  const celula = (l: LinhaMes | null | undefined) => {
    const v = valorDaMedida(l, m)
    return v === null ? null : String(v)
  }
  const linhas = [
    ...matriz.linhas.map((l) => [l.nome, l.uf, ...meses.map((mes) => celula(l.celulas[mes])), celula(l.total)]),
    ['TOTAL GERAL', null, ...meses.map((mes) => celula(matriz.totaisMes[mes])), celula(matriz.totalGeral)],
  ]
  const cab = [clientes ? 'CLIENTE' : 'FORNECEDOR', 'UF', ...meses.map((x) => rotuloMes(x).toUpperCase()), 'TOTAL']
  return { ok: true, nome: `relatorio-${filtros.modelo}-mes_${sufixo}.csv`, conteudo: paraCsv(cab, linhas) }
}

/** O que foi clicado: a linha de um produto (HTML B) ou uma célula da matriz (HTML A). */
export type AlvoDetalhe =
  | { tipo: 'produto'; produtoId: string }
  | { tipo: 'celula'; enderecoId: string; mes: string | null }

/**
 * Detalhamento ao clicar (021 O3). As entregas vêm da mesma base e dos mesmos filtros; os
 * totais mostrados no diálogo são os da célula (do banco), não uma soma destas linhas.
 */
export async function detalhar(query: string, alvo: AlvoDetalhe): Promise<ResultadoDetalhe> {
  const { filtros, aviso, extras, supabase } = await contexto(query)
  if (aviso || filtros.aba !== 'outros') return { ok: false, erro: 'Filtros inválidos.' }

  const base = { p_inicio: filtros.inicio, p_fim: filtros.fim, p_vendedor: filtros.vendedor }
  let args: Record<string, unknown>
  if (alvo.tipo === 'produto') {
    if (filtros.modelo !== 'produtos' || !UUID.test(alvo.produtoId)) return { ok: false, erro: 'Pedido inválido.' }
    args = {
      ...base,
      p_produto_id: alvo.produtoId,
      p_fornecedor: extras.fornecedor || null,
      p_uf: extras.uf || null,
      p_cliente: extras.cliente || null,
    }
  } else {
    if (filtros.modelo === 'produtos' || !UUID.test(alvo.enderecoId) || (alvo.mes !== null && !MES.test(alvo.mes))) {
      return { ok: false, erro: 'Pedido inválido.' }
    }
    args = {
      ...base,
      p_eixo: filtros.modelo === 'clientes' ? 'cliente' : 'fornecedor',
      p_endereco_id: alvo.enderecoId,
      p_mes: alvo.mes,
    }
  }
  const { data, error } = await supabase.rpc('fn_rel_entregas_detalhe', args)
  if (error) {
    console.error('relatorios: detalhe', error)
    return { ok: false, erro: 'Não foi possível carregar o detalhamento.' }
  }
  return { ok: true, linhas: (data ?? []) as LinhaDetalhe[] }
}
