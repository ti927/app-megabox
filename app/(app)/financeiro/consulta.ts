import 'server-only'

import { escaparLike } from '@/lib/clifor'
import {
  colunaData,
  type FiltrosFinanceiro,
  lerResumo,
  parametrosResumo,
  STATUS,
  somarReais,
  temFiltroExtra,
} from '@/lib/financeiro'
import type { clienteServidor } from '@/lib/supabase/servidor'

import type { ContaPagar, ContaReceber, Totais } from './tipos'

/*
 * A busca-base do financeiro, usada pela página (lista e totais do rodapé) e pelo relatório CSV:
 * o arquivo e a barra de totais saem do MESMO recorte que a tabela mostra.
 * Tudo com o cliente da SESSÃO — a RLS da 010/016 decide o que cada um enxerga.
 */

export type Supabase = Awaited<ReturnType<typeof clienteServidor>>
export type ListaAba = 'receber' | 'pagar'
export type IdsGrupos = { cliente: string[] | null; fornecedor: string[] | null }

type Nomes = Record<string, string>

export const TOTAIS_VAZIOS: Totais = { qtd: 0, comissao: '0.00', saldo: '0.00', falhou: false }

/**
 * Cliente/fornecedor digitado → ids dos grupos (o autocomplete do Bubble, financeiro.md §2.1).
 * null = sem filtro; [] = ninguém casa, e a lista sai vazia sem ir ao banco.
 */
export async function idsDeGrupos(supabase: Supabase, tipo: 'cliente' | 'fornecedor', texto: string) {
  if (!texto) return null
  const { data, error } = await supabase
    .from('grupos_clifor')
    .select('id')
    .eq('tipo', tipo)
    .ilike('nome', `%${escaparLike(texto)}%`)
    .limit(200)
  if (error) console.error(`financeiro: grupos ${tipo}`, error)
  return (data ?? []).map((g) => g.id as string)
}

export async function resolverGrupos(supabase: Supabase, f: FiltrosFinanceiro): Promise<IdsGrupos> {
  const [cliente, fornecedor] = await Promise.all([
    idsDeGrupos(supabase, 'cliente', f.cliente),
    idsDeGrupos(supabase, 'fornecedor', f.fornecedor),
  ])
  return { cliente, fornecedor }
}

/** Nenhuma linha pode casar: grupo digitado sem correspondente, ou nº de cobrança em CP. */
export function recorteVazio(f: FiltrosFinanceiro, aba: ListaAba, ids: IdsGrupos): boolean {
  if (ids.cliente?.length === 0 || ids.fornecedor?.length === 0) return true
  // Cobrança é só de conta a receber (010: cobranca_contas → contas_receber).
  return aba === 'pagar' && f.cobranca !== ''
}

/**
 * Relações embutidas que os filtros novos precisam (§3.1). `!inner` faz o filtro do embutido
 * cortar a linha-mãe; a view herda as FKs da tabela-base (conferido no PostgREST).
 */
function embutidos(f: FiltrosFinanceiro, aba: ListaAba): string {
  const e: string[] = []
  if (f.nfMegabox) e.push('fbx:baixas!inner(nf_megabox_numero)')
  if (aba === 'receber' && f.cobranca) e.push('fcc:cobranca_contas!inner(fcob:cobrancas!inner(numero))')
  // A CP não tem a filial na view: vem da entrega → orçamento (a mesma origem da CR).
  if (aba === 'pagar' && f.filial) e.push('fen:entregas!inner(forc:orcamentos_fornecedor!inner(endereco_origem_id))')
  return e.length ? `, ${e.join(', ')}` : ''
}

/**
 * A busca-base parametrizada: UMA consulta no lugar das 12 variações por tipo de data do
 * `pop oculto` (financeiro.md §3.1, §8.1). Cancelada nunca aparece (D8).
 */
export function consulta(supabase: Supabase, f: FiltrosFinanceiro, aba: ListaAba, ids: IdsGrupos, colunas: string) {
  const status = STATUS[aba]
  let q = supabase
    .from(aba === 'pagar' ? 'v_contas_pagar' : 'v_contas_receber')
    .select(colunas + embutidos(f, aba))
    .is('cancelada_em', null)

  // Vencidas (card bTpVD) independem do período; o resto filtra pela data escolhida.
  if (f.situacao === 'vencidas') {
    q = q.eq('vencida', true)
  } else {
    const col = colunaData(f.data, aba)
    q = q.gte(col, f.de).lte(col, f.ate)
    if (f.situacao === 'aberto') q = q.eq('status_id', status.aberto)
    if (f.situacao === 'quitado') q = q.eq('status_id', status.quitado)
  }
  // "Arquivados = Sim" lista os arquivados (§3.1); o padrão esconde. CP não arquiva na 010.
  if (aba === 'receber') q = q.eq('arquivado', f.arquivados)
  if (ids.cliente) q = q.in('cliente_id', ids.cliente)
  if (ids.fornecedor) q = q.in('fornecedor_id', ids.fornecedor)
  if (f.vendedor) q = q.eq('vendedor_id', f.vendedor)
  if (f.pedido) q = q.eq('pedido_numero', f.pedido)
  // Filtros novos (§3.1): NF fornecedor CONTÉM; NF MegaBox e cobrança por igualdade.
  if (f.nfFornecedor) q = q.ilike('nf_fornecedor_numero', `%${escaparLike(f.nfFornecedor)}%`)
  if (f.nfMegabox) q = q.eq('fbx.nf_megabox_numero', f.nfMegabox)
  if (aba === 'receber' && f.cobranca) q = q.eq('fcc.fcob.numero', Number(f.cobranca))
  if (f.filial) {
    q = aba === 'receber' ? q.eq('endereco_origem_id', f.filial) : q.eq('fen.forc.endereco_origem_id', f.filial)
  }
  return q
}

const LOTE = 1000
/** Teto da soma na aplicação: acima disso o total aparece como falha, nunca pela metade. */
const MAX_LOTES = 20

/**
 * Soma na aplicação, só quando há filtro que `fn_resumo_financeiro` não recebe (temFiltroExtra).
 * Percorre o recorte em lotes, soma em CENTAVOS (somarReais) — nunca float.
 */
async function somarNaAplicacao(supabase: Supabase, f: FiltrosFinanceiro, aba: ListaAba, ids: IdsGrupos): Promise<Totais> {
  const comissoes: string[] = []
  const saldos: string[] = []
  for (let lote = 0; lote < MAX_LOTES; lote++) {
    const { data, error } = await consulta(supabase, f, aba, ids, 'id, valor_comissao::text, saldo::text')
      .order('id')
      .range(lote * LOTE, lote * LOTE + LOTE - 1)
    if (error) {
      console.error(`financeiro: soma ${aba}`, error)
      return { ...TOTAIS_VAZIOS, falhou: true }
    }
    const linhas = (data ?? []) as unknown as { valor_comissao: string; saldo: string }[]
    for (const l of linhas) {
      comissoes.push(l.valor_comissao)
      saldos.push(l.saldo)
    }
    if (linhas.length < LOTE) {
      return { qtd: comissoes.length, comissao: somarReais(comissoes), saldo: somarReais(saldos), falhou: false }
    }
  }
  console.error(`financeiro: soma ${aba} passou de ${MAX_LOTES * LOTE} linhas`)
  return { ...TOTAIS_VAZIOS, falhou: true }
}

/**
 * Totais do recorte inteiro, não só da página. Sem filtro novo: `fn_resumo_financeiro` (db/020)
 * conta e soma no banco, em numeric, com a RLS de quem lê e o MESMO recorte de `consulta()`.
 */
export async function resumirRecorte(
  supabase: Supabase,
  f: FiltrosFinanceiro,
  aba: ListaAba,
  ids: IdsGrupos,
): Promise<Totais> {
  if (recorteVazio(f, aba, ids)) return TOTAIS_VAZIOS
  if (temFiltroExtra(f)) return somarNaAplicacao(supabase, f, aba, ids)
  const args = parametrosResumo({ ...f, aba }, ids)
  const { data, error } = await supabase.rpc('fn_resumo_financeiro', args).maybeSingle()
  const resumo = error ? null : lerResumo(data)
  if (!resumo) {
    console.error(`financeiro: totais ${aba}`, error ?? data)
    return { ...TOTAIS_VAZIOS, falhou: true }
  }
  return { ...resumo, falhou: false }
}

// ------------------------------------------------------------------------- nomes

/** Ids → nomes, em blocos (o relatório passa de mil linhas; a URL do `in` tem limite). */
async function nomesPorId(supabase: Supabase, tabela: string, coluna: string, ids: (string | null)[]) {
  const unicos = [...new Set(ids.filter((x): x is string => Boolean(x)))]
  const nomes: Nomes = {}
  for (let i = 0; i < unicos.length; i += 150) {
    const { data, error } = await supabase.from(tabela).select(`id, ${coluna}`).in('id', unicos.slice(i, i + 150))
    if (error) console.error(`financeiro: nomes de ${tabela}`, error)
    for (const r of (data ?? []) as unknown as Record<string, string>[]) nomes[r.id!] = r[coluna] ?? '—'
  }
  return nomes
}

/** As views trazem ids; os nomes vêm numa busca por tabela, só para as linhas da página. */
export async function comNomesReceber(supabase: Supabase, linhas: Omit<ContaReceber, 'cliente_nome'>[]) {
  const [grupos, usuarios, produtos, enderecos] = await Promise.all([
    nomesPorId(supabase, 'grupos_clifor', 'nome', linhas.flatMap((l) => [l.cliente_id, l.fornecedor_id])),
    nomesPorId(supabase, 'usuarios', 'nome', linhas.map((l) => l.vendedor_id)),
    nomesPorId(supabase, 'produtos', 'nome', linhas.map((l) => l.produto_id)),
    nomesPorId(
      supabase,
      'enderecos_clifor',
      'nome_endereco',
      linhas.flatMap((l) => [l.endereco_origem_id, l.endereco_destino_id]),
    ),
  ])
  return linhas.map(
    (l): ContaReceber => ({
      ...l,
      cliente_nome: grupos[l.cliente_id] ?? '—',
      fornecedor_nome: grupos[l.fornecedor_id] ?? '—',
      vendedor_nome: usuarios[l.vendedor_id] ?? '—',
      produto_nome: l.produto_id ? (produtos[l.produto_id] ?? '—') : '—',
      filial_origem: l.endereco_origem_id ? (enderecos[l.endereco_origem_id] ?? '—') : '—',
      filial_destino: l.endereco_destino_id ? (enderecos[l.endereco_destino_id] ?? '—') : '—',
    }),
  )
}

export async function comNomesPagar(supabase: Supabase, linhas: Omit<ContaPagar, 'cliente_nome'>[]) {
  const [grupos, usuarios] = await Promise.all([
    nomesPorId(supabase, 'grupos_clifor', 'nome', linhas.flatMap((l) => [l.cliente_id, l.fornecedor_id])),
    nomesPorId(supabase, 'usuarios', 'nome', linhas.map((l) => l.vendedor_id)),
  ])
  return linhas.map(
    (l): ContaPagar => ({
      ...l,
      cliente_nome: l.cliente_id ? (grupos[l.cliente_id] ?? '—') : '—',
      fornecedor_nome: l.fornecedor_id ? (grupos[l.fornecedor_id] ?? '—') : '—',
      vendedor_nome: usuarios[l.vendedor_id] ?? '—',
    }),
  )
}
