import type { Metadata } from 'next'

import { exigirAcesso } from '@/lib/autorizacao'
import { faixa, type FiltrosFinanceiro, lerFiltros, lerResumo, parametrosVencidos } from '@/lib/financeiro'
import { fotosDeGrupos } from '@/lib/fotos-lote'
import { clienteServidor } from '@/lib/supabase/servidor'

import {
  comNomesPagar,
  comNomesReceber,
  consulta,
  type IdsGrupos,
  type ListaAba,
  recorteVazio,
  resolverGrupos,
  resumirRecorte,
  type Supabase,
  TOTAIS_VAZIOS,
} from './consulta'
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

/**
 * Card "vencidos" (§3.4): ignora todos os filtros, como no Bubble — mas NÃO conta arquivada nem
 * cancelada, e soma o SALDO (o que falta receber). Mesma função de resumo (db/020).
 */
async function resumirVencidos(supabase: Supabase): Promise<Totais> {
  const { data, error } = await supabase.rpc('fn_resumo_financeiro', parametrosVencidos('receber')).maybeSingle()
  const resumo = error ? null : lerResumo(data)
  if (!resumo) {
    console.error('financeiro: vencidos', error ?? data)
    return { ...TOTAIS_VAZIOS, falhou: true }
  }
  return { ...resumo, comissao: '0.00', falhou: false }
}

async function buscarContas(
  supabase: Supabase,
  f: FiltrosFinanceiro,
  aba: ListaAba,
  ids: IdsGrupos,
): Promise<ListaContas<ContaReceber> | ListaContas<ContaPagar>> {
  const vazia = { linhas: [], total: 0, falhou: false, totais: TOTAIS_VAZIOS }
  if (recorteVazio(f, aba, ids)) return vazia

  const { de, ate } = faixa(f.pagina)
  const pagar = aba === 'pagar'
  // Lista da página e resumo do recorte em paralelo. A lista não pede contagem: o total da
  // paginação é a `qtd` do resumo (mesmo recorte).
  const [{ data, error }, totais] = await Promise.all([
    consulta(supabase, f, aba, ids, pagar ? COLUNAS_CP : COLUNAS_CR)
      .order('dt_vencimento')
      .order('id')
      .range(de, ate),
    resumirRecorte(supabase, f, aba, ids),
  ])
  if (error) {
    console.error('financeiro: lista', error)
    return { ...vazia, falhou: true }
  }
  const brutas = (data ?? []) as unknown as (ContaPagar & ContaReceber)[]
  // Logo do cliente (Bubble bTpPb/bTpLm) só das linhas desta página, junto com os nomes.
  const [comNomes, fotos] = await Promise.all([
    pagar ? comNomesPagar(supabase, brutas) : comNomesReceber(supabase, brutas),
    fotosDeGrupos(brutas.map((l) => l.cliente_id)),
  ])
  const linhas = comNomes.map((l) => ({ ...l, cliente_foto: l.cliente_id ? (fotos.get(l.cliente_id) ?? null) : null }))
  // Sem resumo, a paginação conta só o que se sabe que existe (até esta página).
  const total = totais.falhou ? de + linhas.length : totais.qtd
  return { linhas, total, falhou: false, totais } as ListaContas<ContaReceber> | ListaContas<ContaPagar>
}

/**
 * Filiais do fornecedor para o filtro "Filial Fornecedor" (§2.1: exibe "Nome (CNPJ)"). No
 * Bubble eram as origens das CRs listadas; aqui, as filiais ativas dos grupos fornecedores (dos
 * que casam com "Grupo Fornecedor", quando preenchido) — e a escolhida, mesmo inativa.
 */
async function buscarFiliais(supabase: Supabase, f: FiltrosFinanceiro, fornecedores: string[] | null) {
  if (fornecedores?.length === 0) return []
  let q = supabase
    .from('enderecos_clifor')
    .select('id, nome_endereco, documento, grupo:grupos_clifor!inner(tipo)')
    .eq('grupo.tipo', 'fornecedor')
    .eq('ativo', true)
    .order('nome_endereco')
    .limit(1000)
  if (fornecedores) q = q.in('grupo_id', fornecedores)
  const { data, error } = await q
  if (error) console.error('financeiro: filiais', error)
  const lista = ((data ?? []) as unknown as { id: string; nome_endereco: string; documento: string | null }[]).map(
    ({ id, nome_endereco, documento }) => ({ id, nome_endereco, documento }),
  )
  if (f.filial && !lista.some((e) => e.id === f.filial)) {
    const { data: atual } = await supabase
      .from('enderecos_clifor')
      .select('id, nome_endereco, documento')
      .eq('id', f.filial)
      .maybeSingle()
    if (atual) lista.unshift(atual as Opcoes['filiais'][number])
  }
  return lista
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
async function buscarEntregas(supabase: Supabase, f: FiltrosFinanceiro, ids: IdsGrupos) {
  const { cliente, fornecedor } = ids
  if (cliente?.length === 0 || fornecedor?.length === 0) return { linhas: [], total: 0, falhou: false }
  let q = supabase
    .from('entregas')
    .select(
      'id, numero_entrega, status_id, qtd::text, dt_prev_entrega, valor_venda_bruto::text, cliente_id, ' +
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
  const linhas = (data ?? []) as unknown as EntregaPendente[]
  const fotos = await fotosDeGrupos(linhas.map((l) => l.cliente_id))
  return {
    linhas: linhas.map((l) => ({ ...l, cliente_foto: fotos.get(l.cliente_id) ?? null })),
    total: count ?? 0,
    falhou: false,
  }
}

async function buscarOpcoes(
  supabase: Supabase,
  f: FiltrosFinanceiro,
  ids: IdsGrupos,
  entregas: boolean,
): Promise<Opcoes> {
  const [vendedores, prazos, filiais] = await Promise.all([
    supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome'),
    entregas
      ? supabase.from('prazos_recebimento').select('id, nome, dias_prazo').eq('ativo', true).order('dias_prazo')
      : Promise.resolve({ data: [] }),
    entregas ? Promise.resolve([]) : buscarFiliais(supabase, f, ids.fornecedor),
  ])
  return {
    vendedores: (vendedores.data ?? []) as Opcoes['vendedores'],
    prazos: (prazos.data ?? []) as Opcoes['prazos'],
    filiais,
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
  const ids = await resolverGrupos(supabase, filtros)
  // A barra do rodapé mostra as DUAS listas (Bubble `Group XZZZ`): a da aba aberta vem com a
  // lista; a outra, só o resumo, com os mesmos filtros.
  const outra: ListaAba = filtros.aba === 'pagar' ? 'receber' : 'pagar'
  const [lista, pendentes, vencidos, totaisOutra, opcoes, ficha] = await Promise.all([
    entregas ? Promise.resolve(null) : buscarContas(supabase, filtros, filtros.aba === 'pagar' ? 'pagar' : 'receber', ids),
    entregas ? buscarEntregas(supabase, filtros, ids) : Promise.resolve(null),
    entregas ? Promise.resolve(null) : resumirVencidos(supabase),
    entregas ? Promise.resolve(null) : resumirRecorte(supabase, filtros, outra, ids),
    buscarOpcoes(supabase, filtros, ids, entregas),
    filtros.sel && !entregas ? buscarFicha(supabase, filtros, filtros.sel) : Promise.resolve(null),
  ])

  const rodape =
    lista && vencidos && totaisOutra
      ? {
          vencidos,
          receber: filtros.aba === 'pagar' ? totaisOutra : lista.totais,
          pagar: filtros.aba === 'pagar' ? lista.totais : totaisOutra,
        }
      : null

  return (
    <TelaFinanceiro
      filtros={filtros}
      lista={lista}
      pendentes={pendentes}
      rodape={rodape}
      opcoes={opcoes}
      ficha={ficha}
      permissoes={{ estornar: usuario.perfilId === 1 }}
    />
  )
}
