import type { Metadata } from 'next'

import { exigirAcesso } from '@/lib/autorizacao'
import { escaparLike } from '@/lib/clifor'
import {
  colunaData,
  faixa,
  type FiltrosFinanceiro,
  lerFiltros,
  STATUS,
  somarReais,
} from '@/lib/financeiro'
import { clienteServidor } from '@/lib/supabase/servidor'

import { TelaFinanceiro } from './tela'
import type {
  Baixa,
  ContaPagar,
  ContaReceber,
  EntregaPendente,
  FichaConta,
  ListaContas,
  Opcoes,
  Totais,
} from './tipos'

import './financeiro.css'

export const metadata: Metadata = { title: 'Fluxo Financeiro — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>
type Nomes = Record<string, string>

/** Colunas de `v_contas_receber` (010 §8); dinheiro e quantidade como texto. */
const COLUNAS_CR =
  'id, entrega_id, pedido_id, pedido_numero, cliente_id, fornecedor_id, vendedor_id, ' +
  'endereco_origem_id, endereco_destino_id, produto_id, qtd::text, valor_unit::text, parcela, ' +
  'parcelas_total, valor_total::text, valor_comissao::text, valor_baixado::text, saldo::text, ' +
  'ultima_dt_baixa, ultima_dt_credito, ultima_nf_megabox, dt_vencimento, dt_pedido, dt_entrega, ' +
  'nf_fornecedor_numero, status_id, vencida, arquivado'

/** Colunas de `v_contas_pagar` (010 §8). */
const COLUNAS_CP =
  'id, origem, entrega_id, pedido_numero, cliente_id, fornecedor_id, vendedor_id, qtd::text, ' +
  'dt_entrega, nf_fornecedor_numero, valor_base::text, percentual::text, valor_comissao::text, ' +
  'valor_pago::text, saldo::text, ultima_dt_baixa, dt_vencimento, status_id, vencida'

/** Teto da soma dos cartões: 50 lotes de 1.000 (o max-rows do PostgREST). */
const LOTE = 1000
const MAX_LOTES = 50

const TOTAIS_VAZIOS: Totais = { qtd: 0, comissao: '0.00', saldo: '0.00', falhou: false }

/**
 * Cliente/fornecedor digitado → ids dos grupos (o autocomplete do Bubble, financeiro.md §2.1).
 * null = sem filtro; [] = ninguém casa, e a lista sai vazia sem ir ao banco.
 */
async function idsDeGrupos(supabase: Supabase, tipo: 'cliente' | 'fornecedor', texto: string) {
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

type Filtro = { cliente: string[] | null; fornecedor: string[] | null }

/**
 * A busca-base parametrizada: UMA consulta no lugar das 12 variações por tipo de data do
 * `pop oculto` (financeiro.md §3.1, §8.1). Cancelada nunca aparece (D8).
 */
function consulta(supabase: Supabase, f: FiltrosFinanceiro, ids: Filtro, colunas: string, contar: boolean) {
  const aba = f.aba === 'pagar' ? 'pagar' : 'receber'
  const status = STATUS[aba]
  let q = supabase
    .from(aba === 'pagar' ? 'v_contas_pagar' : 'v_contas_receber')
    .select(colunas, contar ? { count: 'exact' } : undefined)
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
  return q
}

/**
 * Totais do filtro inteiro, não só da página: somados em STRING EXATA (lib/financeiro, BigInt).
 * O PostgREST deste projeto não tem agregados ligados e não há função de resumo na 010, então
 * a soma percorre o recorte em lotes. No Bubble o "listado" soma a tabela com os selecionados
 * unidos e a contagem não bate com a soma (§3.4) — aqui os dois saem do mesmo recorte.
 */
async function somar(supabase: Supabase, f: FiltrosFinanceiro, ids: Filtro, total: number): Promise<Totais> {
  const comissoes: string[] = []
  const saldos: string[] = []
  for (let lote = 0; lote * LOTE < total && lote < MAX_LOTES; lote++) {
    const { data, error } = await consulta(supabase, f, ids, 'valor_comissao::text, saldo::text', false)
      .order('id')
      .range(lote * LOTE, lote * LOTE + LOTE - 1)
    if (error) {
      console.error('financeiro: totais', error)
      return { ...TOTAIS_VAZIOS, falhou: true }
    }
    for (const r of (data ?? []) as unknown as { valor_comissao: string; saldo: string }[]) {
      comissoes.push(r.valor_comissao)
      saldos.push(r.saldo)
    }
  }
  return {
    qtd: comissoes.length,
    comissao: somarReais(comissoes),
    saldo: somarReais(saldos),
    falhou: comissoes.length < total,
  }
}

async function nomesPorId(supabase: Supabase, tabela: string, coluna: string, ids: (string | null)[]) {
  const unicos = [...new Set(ids.filter((x): x is string => Boolean(x)))]
  const nomes: Nomes = {}
  if (unicos.length === 0) return nomes
  const { data, error } = await supabase.from(tabela).select(`id, ${coluna}`).in('id', unicos)
  if (error) console.error(`financeiro: nomes de ${tabela}`, error)
  for (const r of (data ?? []) as unknown as Record<string, string>[]) nomes[r.id!] = r[coluna] ?? '—'
  return nomes
}

/** As views trazem ids; os nomes vêm numa busca por tabela, só para as linhas da página. */
async function comNomesReceber(supabase: Supabase, linhas: Omit<ContaReceber, 'cliente_nome'>[]) {
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

async function comNomesPagar(supabase: Supabase, linhas: Omit<ContaPagar, 'cliente_nome'>[]) {
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

async function buscarContas(
  supabase: Supabase,
  f: FiltrosFinanceiro,
): Promise<ListaContas<ContaReceber> | ListaContas<ContaPagar>> {
  const [cliente, fornecedor] = await Promise.all([
    idsDeGrupos(supabase, 'cliente', f.cliente),
    idsDeGrupos(supabase, 'fornecedor', f.fornecedor),
  ])
  const vazia = { linhas: [], total: 0, falhou: false, totais: TOTAIS_VAZIOS }
  if (cliente?.length === 0 || fornecedor?.length === 0) return vazia
  const ids = { cliente, fornecedor }

  const { de, ate } = faixa(f.pagina)
  const pagar = f.aba === 'pagar'
  const { data, count, error } = await consulta(supabase, f, ids, pagar ? COLUNAS_CP : COLUNAS_CR, true)
    .order('dt_vencimento')
    .order('id')
    .range(de, ate)
  if (error) {
    console.error('financeiro: lista', error)
    return { ...vazia, falhou: true }
  }
  const total = count ?? 0
  const [linhas, totais] = await Promise.all([
    pagar
      ? comNomesPagar(supabase, (data ?? []) as unknown as ContaPagar[])
      : comNomesReceber(supabase, (data ?? []) as unknown as ContaReceber[]),
    somar(supabase, f, ids, total),
  ])
  return { linhas, total, falhou: false, totais } as ListaContas<ContaReceber> | ListaContas<ContaPagar>
}

/**
 * Card "A receber vencidos" (§3.4): ignora todos os filtros, como no Bubble — mas NÃO conta
 * arquivada nem cancelada, e soma o SALDO (o que falta receber), não a comissão cheia.
 */
async function buscarVencidos(supabase: Supabase, aba: 'receber' | 'pagar'): Promise<Totais> {
  let q = supabase
    .from(aba === 'pagar' ? 'v_contas_pagar' : 'v_contas_receber')
    .select('saldo::text', { count: 'exact' })
    .eq('vencida', true)
    .is('cancelada_em', null)
  if (aba === 'receber') q = q.eq('arquivado', false)
  const { data, count, error } = await q.order('id').range(0, LOTE - 1)
  if (error) {
    console.error('financeiro: vencidos', error)
    return { ...TOTAIS_VAZIOS, falhou: true }
  }
  const saldos = ((data ?? []) as unknown as { saldo: string }[]).map((r) => r.saldo)
  return { qtd: count ?? 0, comissao: '0.00', saldo: somarReais(saldos), falhou: (count ?? 0) > saldos.length }
}

const COLUNAS_BAIXA =
  'id, valor::text, dt_baixa, dt_credito, nf_megabox_numero, dt_nf_megabox, observacao, criado_em, ' +
  'usuario:usuarios!usuario_id(nome), recibo:recibos(numero), ' +
  'estorno:estornos(motivo, em, usuario:usuarios!usuario_id(nome))'

async function buscarFicha(supabase: Supabase, f: FiltrosFinanceiro, id: string): Promise<FichaConta | null> {
  if (f.aba === 'pagar') {
    const [conta, baixas] = await Promise.all([
      supabase.from('v_contas_pagar').select(COLUNAS_CP).eq('id', id).maybeSingle(),
      supabase.from('baixas').select(COLUNAS_BAIXA).eq('conta_pagar_id', id).order('criado_em'),
    ])
    if (conta.error || baixas.error) console.error('financeiro: ficha CP', conta.error ?? baixas.error)
    // Sem linha = não existe OU a RLS não deixa ver (comissão de outro vendedor). Mesma resposta.
    if (!conta.data) return null
    const [linha] = await comNomesPagar(supabase, [conta.data as unknown as ContaPagar])
    return { tipo: 'pagar', conta: linha!, baixas: (baixas.data ?? []) as unknown as Baixa[], cobrancas: [] }
  }
  const [conta, baixas, cobrancas] = await Promise.all([
    supabase.from('v_contas_receber').select(COLUNAS_CR).eq('id', id).maybeSingle(),
    supabase.from('baixas').select(COLUNAS_BAIXA).eq('conta_receber_id', id).order('criado_em'),
    supabase.from('cobranca_contas').select('cobranca:cobrancas(numero, criado_em)').eq('conta_receber_id', id),
  ])
  if (conta.error || baixas.error) console.error('financeiro: ficha CR', conta.error ?? baixas.error)
  if (!conta.data) return null
  const [linha] = await comNomesReceber(supabase, [conta.data as unknown as ContaReceber])
  type Cob = { cobranca: { numero: number; criado_em: string } | null }
  return {
    tipo: 'receber',
    conta: linha!,
    baixas: (baixas.data ?? []) as unknown as Baixa[],
    cobrancas: ((cobrancas.data ?? []) as unknown as Cob[])
      .map((c) => c.cobranca)
      .filter((c): c is { numero: number; criado_em: string } => c !== null)
      .sort((a, b) => a.numero - b.numero),
  }
}

/**
 * Entregas que saíram e esperam a confirmação (status < Financeiro), para gerar as contas por
 * `fn_confirmar_entrega` (bTcXd/bTcXj). A RLS decide quais o usuário enxerga (010 D11, 016).
 */
async function buscarEntregas(supabase: Supabase, f: FiltrosFinanceiro) {
  const [cliente, fornecedor] = await Promise.all([
    idsDeGrupos(supabase, 'cliente', f.cliente),
    idsDeGrupos(supabase, 'fornecedor', f.fornecedor),
  ])
  if (cliente?.length === 0 || fornecedor?.length === 0) return { linhas: [], total: 0, falhou: false }
  let q = supabase
    .from('entregas')
    .select(
      'id, numero_entrega, status_id, qtd::text, dt_prev_entrega, valor_venda_bruto::text, ' +
        'valor_comissao::text, nf_fornecedor_numero, pedido:pedidos(numero, prazos:pedido_prazos(prazo_id)), ' +
        'cliente:grupos_clifor!cliente_id(nome), fornecedor:grupos_clifor!fornecedor_id(nome), ' +
        'vendedor:usuarios!vendedor_id(nome), orcamento:orcamentos_fornecedor(produto:produtos(nome))',
      { count: 'exact' },
    )
    .eq('saiu_entrega', true)
    .in('status_id', [2, 3, 4])
  if (cliente) q = q.in('cliente_id', cliente)
  if (fornecedor) q = q.in('fornecedor_id', fornecedor)
  if (f.vendedor) q = q.eq('vendedor_id', f.vendedor)
  const { de, ate } = faixa(f.pagina)
  const { data, count, error } = await q
    .order('dt_prev_entrega', { ascending: true, nullsFirst: false })
    .order('id')
    .range(de, ate)
  if (error) {
    console.error('financeiro: entregas', error)
    return { linhas: [], total: 0, falhou: true }
  }
  return { linhas: (data ?? []) as unknown as EntregaPendente[], total: count ?? 0, falhou: false }
}

async function buscarOpcoes(supabase: Supabase, comPrazos: boolean): Promise<Opcoes> {
  const [vendedores, prazos] = await Promise.all([
    supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome'),
    comPrazos
      ? supabase.from('prazos_recebimento').select('id, nome, dias_prazo').eq('ativo', true).order('dias_prazo')
      : Promise.resolve({ data: [] }),
  ])
  return {
    vendedores: (vendedores.data ?? []) as Opcoes['vendedores'],
    prazos: (prazos.data ?? []) as Opcoes['prazos'],
  }
}

export default async function PaginaFinanceiro({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor, antes de qualquer consulta. No Bubble quem digitava /financeiro
  // entrava (financeiro.md §1, §7.2).
  const usuario = await exigirAcesso('financeiro')
  const filtros = lerFiltros(await searchParams)

  // Cliente da SESSÃO: a RLS decide quem vê o quê (010 D11 + 016). Nunca service_role aqui.
  const supabase = await clienteServidor()
  const entregas = filtros.aba === 'entregas'
  const [lista, pendentes, vencidos, opcoes, ficha] = await Promise.all([
    entregas ? Promise.resolve(null) : buscarContas(supabase, filtros),
    entregas ? buscarEntregas(supabase, filtros) : Promise.resolve(null),
    entregas ? Promise.resolve(null) : buscarVencidos(supabase, filtros.aba === 'pagar' ? 'pagar' : 'receber'),
    buscarOpcoes(supabase, entregas),
    filtros.sel && !entregas ? buscarFicha(supabase, filtros, filtros.sel) : Promise.resolve(null),
  ])

  return (
    <TelaFinanceiro
      filtros={filtros}
      lista={lista}
      pendentes={pendentes}
      vencidos={vencidos}
      opcoes={opcoes}
      ficha={ficha}
      permissoes={{ estornar: usuario.perfilId === 1 }}
    />
  )
}
