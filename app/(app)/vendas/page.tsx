import type { Metadata } from 'next'

import { exigirAcesso, type UsuarioAtual } from '@/lib/autorizacao'
import { clienteServidor } from '@/lib/supabase/servidor'
import {
  escaparLike,
  type FiltrosVendas,
  intervaloCriacao,
  lerFiltros,
  podeFiltrarVendedor,
  POR_COLUNA,
  regrasColunas,
} from '@/lib/vendas'

import { TelaVendas } from './tela'
import type {
  CartaoCotacao,
  CartaoEntrega,
  CartaoPedido,
  ColunaDados,
  Cotacao,
  Ficha,
  Item,
  Kanban,
  Opcoes,
  OpcoesFicha,
  Orcamento,
  Pedido,
  Proposta,
} from './tipos'

import './vendas.css'

export const metadata: Metadata = { title: 'Fluxo de Vendas — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/** Colunas de `v_kanban_entregas` que o cartão usa; dinheiro e quantidade como texto. */
const COLUNAS_ENTREGA =
  'id, pedido_id, cotacao_id, numero_entrega, status_id, qtd::text, dt_pedido, dt_prev_entrega, ' +
  'dt_entrega, saiu_entrega, nf_fornecedor_numero, valor_venda_bruto::text, cliente_nome, ' +
  'produto_nome, vendedor_id, vendedor_substituto_id, papel'

function coluna<T>(
  nome: string,
  r: { data: unknown; count: number | null; error: { message: string } | null },
): ColunaDados<T> {
  if (r.error) {
    console.error(`vendas: coluna ${nome}`, r.error)
    return { cartoes: [], total: 0, falhou: true }
  }
  return { cartoes: (r.data ?? []) as T[], total: r.count ?? 0, falhou: false }
}

/**
 * As 4 colunas do quadro, em paralelo, filtradas e LIMITADAS no servidor (spec §3.1–3.4).
 *
 * No Bubble são 4 RepeatingGroups que trazem a coluna inteira, mais uma busca repetida só
 * para o contador. Aqui cada coluna é UMA consulta com `count: 'exact'` e `range`: o contador
 * sai da mesma busca (o do Bubble para pedidos filtrava por Created By e divergia da lista,
 * spec §3.2), e "Mostrar mais" amplia o range pela URL.
 *
 * Quem enxerga o quê é a RLS (db/007–009): Analista/Operador só leem o que é seu. O filtro de
 * vendedor daqui só repete a regra do Bubble para as colunas mostrarem o mesmo recorte.
 */
async function buscarKanban(supabase: Supabase, f: FiltrosVendas, u: UsuarioAtual): Promise<Kanban> {
  const r = regrasColunas(f, u)
  const { desde, antes } = intervaloCriacao(f.de, f.ate)
  const cliente = f.cliente ? `%${escaparLike(f.cliente)}%` : null

  // ------------------------------------------------------------------- Cotação
  let cot = supabase
    .from('cotacoes')
    .select(
      'id, numero, criado_em, arquivado, etapa_id, cliente:grupos_clifor!inner(nome), ' +
        'vendedor:usuarios!vendedor_id(nome), motivo:motivos_arquivamento(nome), ' +
        'itens:cotacao_itens(count), propostas(count), ' +
        'vencedores:orcamentos_fornecedor(valor_venda_bruto::text)',
      { count: 'exact' },
    )
    .eq('vencedores.vencedor', true)
    .eq('rascunho', false)
    .eq('arquivado', r.cotacao.arquivado)
    .gte('criado_em', desde)
    .lt('criado_em', antes)
  cot = 'eq' in r.cotacao.etapa ? cot.eq('etapa_id', r.cotacao.etapa.eq) : cot.neq('etapa_id', r.cotacao.etapa.neq)
  if (r.vendedor) cot = cot.eq('vendedor_id', r.vendedor)
  if (f.numero) cot = cot.eq('numero', Number(f.numero))
  if (cliente) cot = cot.ilike('cliente.nome', cliente)

  // -------------------------------------------------------------------- Pedido
  let ped = supabase
    .from('pedidos')
    .select(
      'id, numero, cotacao_id, criado_em, etapa_id, finalizado, motivo_cancelamento, ' +
        'cliente:grupos_clifor!inner(nome), cotacao:cotacoes(numero, vendedor:usuarios!vendedor_id(nome)), ' +
        'entregas(id, qtd::text, dt_prev_entrega, status_id, nf_fornecedor_numero, saiu_entrega, ' +
          'orcamento:orcamentos_fornecedor(produto:produtos(nome)))',
      { count: 'exact' },
    )
    .eq('finalizado', r.pedido.finalizado)
    .eq('etapa_id', r.pedido.etapa)
    .gte('criado_em', desde)
    .lt('criado_em', antes)
  if (r.vendedor) ped = ped.eq('vendedor_id', r.vendedor)
  if (f.numero) ped = ped.eq('numero', f.numero)
  if (cliente) ped = ped.ilike('cliente.nome', cliente)

  // ------------------------------------------------------- Entregas Próprias
  let ent = supabase
    .from('v_kanban_entregas')
    .select(COLUNAS_ENTREGA, { count: 'exact' })
    .eq('saiu_entrega', true)
    .eq('status_id', r.entrega.status)
    .gte(r.entrega.dataPeriodo, f.de)
    .lte(r.entrega.dataPeriodo, f.ate)
  if (r.vendedor) ent = ent.eq('vendedor_id', r.vendedor)
  if (f.numero) ent = ent.eq('numero_entrega', f.numero)
  if (cliente) ent = ent.ilike('cliente_nome', cliente)

  // ----------------------------------------------------- Entregas Substituto
  // Sem vendedor (gerência vendo tudo), "entregas em que o vendedor filtrado é o substituto"
  // vira "entregas que TÊM substituto" — com o `ignore empty` do Bubble a coluna listaria
  // toda entrega aberta, o que não é entrega de substituto nenhum.
  let sub = supabase
    .from('v_kanban_entregas')
    .select(COLUNAS_ENTREGA, { count: 'exact' })
    .not('status_id', 'in', `(${r.substitutoExcluiStatus.join(',')})`)
    .gte('dt_pedido', f.de)
    .lte('dt_pedido', f.ate)
  sub = r.vendedor ? sub.eq('vendedor_substituto_id', r.vendedor) : sub.not('vendedor_substituto_id', 'is', null)
  if (f.numero) sub = sub.eq('numero_entrega', f.numero)
  if (cliente) sub = sub.ilike('cliente_nome', cliente)

  const ate = (n: number) => n * POR_COLUNA - 1
  const [c, p, e, s] = await Promise.all([
    cot.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.cot)),
    ped.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.ped)),
    ent.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.ent)),
    sub.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.sub)),
  ])

  const entregas = coluna<CartaoEntrega>('entregas', e)
  const substituto = coluna<CartaoEntrega>('substituto', s)

  // v_kanban_entregas traz o id do vendedor, não o nome: uma busca só para os cartões da tela.
  const ids = [...new Set([...entregas.cartoes, ...substituto.cartoes].map((x) => x.vendedor_id))]
  const nomes: Record<string, string> = {}
  if (ids.length > 0) {
    const { data } = await supabase.from('usuarios').select('id, nome').in('id', ids)
    for (const n of data ?? []) nomes[n.id as string] = n.nome as string
  }

  return {
    cotacoes: coluna<CartaoCotacao>('cotação', c),
    pedidos: coluna<CartaoPedido>('pedido', p),
    entregas,
    substituto,
    nomes,
  }
}

async function buscarOpcoes(supabase: Supabase, filtrarVendedor: boolean): Promise<Opcoes> {
  const [etapas, vendedores, empresas, motivos] = await Promise.all([
    supabase.from('etapas').select('id, nome').order('id'),
    filtrarVendedor
      ? supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome')
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
    supabase.from('empresas_emissoras').select('id, nome').order('id'),
    supabase.from('motivos_arquivamento').select('id, nome').order('nome'),
  ])
  return {
    etapas: etapas.data ?? [],
    vendedores: vendedores.data ?? [],
    empresas: empresas.data ?? [],
    motivos: motivos.data ?? [],
  }
}

/** Colunas de `v_orcamento_valores` (db/007): os derivados já calculados pelo banco. */
const COLUNAS_VALORES =
  'id, cotacao_item_id, valor_venda_unit::text, valor_comissao_unit::text, valor_frete::text, ' +
  'tipo_frete_id, aliquota_icms::text, aliquota_pis_cofins::text, valor_venda_bruto::text, ' +
  'valor_comissao_bruto::text, valor_icms::text, valor_pis_cofins::text, valor_tributos::text, ' +
  'valor_venda_liquido::text, valor_unit_liquido::text, vencedor'

/** A ficha da cotação aberta: cabeçalho, itens, orçamentos, propostas, pedidos e entregas. */
async function buscarFicha(supabase: Supabase, id: string): Promise<Ficha | null> {
  const { data: cotacao, error } = await supabase
    .from('cotacoes')
    .select(
      'id, numero, criado_em, data_validade, amostra, arquivado, etapa_id, vendedor_id, cliente_id, ' +
        'cliente:grupos_clifor(nome), vendedor:usuarios!vendedor_id(nome), ' +
        'empresa:empresas_emissoras(nome), status:cotacao_status(nome), etapa:etapas(nome), ' +
        'motivo:motivos_arquivamento(nome)',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) console.error('vendas: ficha', error)
  // Sem linha = não existe OU a RLS não deixa ver (cotação de outro vendedor). Mesma resposta.
  if (!cotacao) return null
  const c = cotacao as unknown as Cotacao

  const [itens, valores, nomes, propostas, pedidos, entregas, destinos] = await Promise.all([
    supabase
      .from('cotacao_itens')
      .select(
        'id, qtd::text, medida, produto_id, produto:produtos(nome), condicao:condicoes_produto(nome), ' +
          'linha:linhas_produto(nome), destino:enderecos_clifor(nome_endereco, uf, municipio)',
      )
      .eq('cotacao_id', id)
      .order('criado_em')
      .order('id'),
    supabase.from('v_orcamento_valores').select(COLUNAS_VALORES).eq('cotacao_id', id).order('id'),
    supabase
      .from('orcamentos_fornecedor')
      .select(
        'id, criado_em, fornecedor:grupos_clifor(nome), frete:tipos_frete(nome), ' +
          'origem:enderecos_clifor!endereco_origem_id(nome_endereco, uf, regime:regimes_tributarios(nome))',
      )
      .eq('cotacao_id', id),
    supabase
      .from('propostas')
      .select(
        'id, numero, enviada, enviada_em, criado_em, data_prev_entrega, condicao_pagamento, ' +
          'vendedor:usuarios!vendedor_id(nome), itens:proposta_itens(count)',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false }),
    supabase
      .from('pedidos')
      .select(
        'id, numero, criado_em, etapa_id, formalizado, finalizado, motivo_cancelamento, ' +
          'ordem_compra_numero, proposta:propostas(numero), forma:formas_pagamento(nome), etapa:etapas(nome)',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false }),
    supabase
      .from('v_kanban_entregas')
      .select(COLUNAS_ENTREGA)
      .eq('cotacao_id', id)
      .order('dt_prev_entrega', { ascending: true, nullsFirst: false }),
    supabase
      .from('enderecos_clifor')
      .select('id, nome_endereco, uf, municipio')
      .eq('grupo_id', c.cliente_id)
      .eq('ativo', true)
      .order('principal', { ascending: false })
      .order('nome_endereco'),
  ])

  type Nomes = {
    id: string
    criado_em: string
    fornecedor: { nome: string } | null
    frete: { nome: string } | null
    origem: Orcamento['origem']
  }
  const porId = new Map(((nomes.data ?? []) as unknown as Nomes[]).map((n) => [n.id, n]))
  const chegada = (id: string) => porId.get(id)?.criado_em ?? ''
  const orcamentos: Orcamento[] = ((valores.data ?? []) as unknown as Omit<Orcamento, 'fornecedor_nome' | 'origem' | 'frete_nome'>[])
    // ordem de chegada, como a lista do Bubble (QuaisOrcamentosForncededores)
    .sort((a, b) => chegada(a.id).localeCompare(chegada(b.id)))
    .map((v) => {
      const n = porId.get(v.id)
      return {
        ...v,
        fornecedor_nome: n?.fornecedor?.nome ?? '—',
        origem: n?.origem ?? null,
        frete_nome: n?.frete?.nome ?? '—',
      }
    })

  return {
    cotacao: c,
    itens: (itens.data ?? []) as unknown as Item[],
    orcamentos,
    propostas: (propostas.data ?? []) as unknown as Proposta[],
    pedidos: (pedidos.data ?? []) as unknown as Pedido[],
    entregas: (entregas.data ?? []) as unknown as CartaoEntrega[],
    destinos: (destinos.data ?? []) as Ficha['destinos'],
  }
}

async function buscarOpcoesFicha(supabase: Supabase): Promise<OpcoesFicha> {
  const [produtos, condicoes, linhas, fretes] = await Promise.all([
    supabase
      .from('produtos')
      .select('id, nome, grupo:produto_grupos(nome), condicoes:produto_condicoes(condicao_id), linhas:produto_linhas(linha_id)')
      .eq('ativo', true)
      .order('nome'),
    supabase.from('condicoes_produto').select('id, nome').order('id'),
    supabase.from('linhas_produto').select('id, nome').order('id'),
    supabase.from('tipos_frete').select('id, nome').order('id'),
  ])
  return {
    produtos: (produtos.data ?? []) as unknown as OpcoesFicha['produtos'],
    condicoes: condicoes.data ?? [],
    linhas: linhas.data ?? [],
    fretes: fretes.data ?? [],
  }
}

export default async function PaginaVendas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor, antes de qualquer consulta. No Bubble a página não tinha checagem
  // própria: quem digitava a URL entrava (spec §1).
  const usuario = await exigirAcesso('vendas')
  const filtros = lerFiltros(await searchParams)
  const filtrarVendedor = podeFiltrarVendedor(usuario)
  // Analista/Operador: o vendedor da URL é ignorado (spec §2.2, bTiYV).
  if (!filtrarVendedor) filtros.vendedor = null

  // Cliente da SESSÃO: quem lê é o usuário, e a RLS decide. Nunca service_role aqui.
  const supabase = await clienteServidor()
  const [kanban, opcoes, ficha, opcoesFicha] = await Promise.all([
    buscarKanban(supabase, filtros, usuario),
    buscarOpcoes(supabase, filtrarVendedor),
    filtros.sel ? buscarFicha(supabase, filtros.sel) : Promise.resolve(null),
    filtros.sel ? buscarOpcoesFicha(supabase) : Promise.resolve(null),
  ])

  return (
    <TelaVendas
      filtros={filtros}
      kanban={kanban}
      opcoes={opcoes}
      ficha={ficha}
      opcoesFicha={opcoesFicha}
      usuario={{ id: usuario.id, perfilId: usuario.perfilId }}
      permissoes={{ filtrarVendedor, ehDiretor: usuario.perfilId === 1 }}
    />
  )
}
