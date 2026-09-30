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
import { lerCrescente } from '@/lib/vendas-ordem'

import { PARTES_CARRINHO, PARTES_FICHA } from '@/lib/vendas-ficha'

import { buscarFicha } from './consultas'
import { comFotosKanban } from './fotos'
import { TelaVendas } from './tela'
import type { CartaoCotacao, CartaoEntrega, CartaoPedido, ColunaDados, Kanban, Opcoes } from './tipos'

import './vendas.css'

export const metadata: Metadata = { title: 'Fluxo de Vendas — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/** Colunas de `v_kanban_entregas` que o cartão usa; dinheiro e quantidade como texto. */
const COLUNAS_ENTREGA =
  'id, pedido_id, cotacao_id, numero_entrega, status_id, qtd::text, dt_pedido, dt_prev_entrega, ' +
  'dt_entrega, saiu_entrega, nf_fornecedor_numero, valor_venda_bruto::text, cliente_nome, ' +
  'produto_nome, vendedor_id, vendedor_substituto_id, papel, vendedor_nome, cliente_id'

/** Ver `buscarKanban`: exato em recorte pequeno, estimativa do planejador acima do max-rows. */
const CONTAGEM = 'estimated' as const

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
 * para o contador. Aqui cada coluna é UMA consulta com contagem e `range`: o contador sai da
 * mesma busca (o do Bubble para pedidos filtrava por Created By e divergia da lista, spec
 * §3.2), e "Mostrar mais" amplia o range pela URL.
 *
 * Contagem `estimated` (db/020): o PostgREST conta EXATO até o max-rows do projeto (1.000) e,
 * acima disso, usa a estimativa do planejador. Um mês de kanban fica bem abaixo — o número
 * mostrado é o exato de antes —, e um recorte enorme não paga mais uma contagem inteira a cada
 * abertura (era parte das rajadas de 57014 com a base cheia).
 *
 * Quem enxerga o quê é a RLS (db/007–009): Analista/Operador só leem o que é seu. O filtro de
 * vendedor daqui só repete a regra do Bubble para as colunas mostrarem o mesmo recorte.
 */
async function buscarKanban(
  supabase: Supabase,
  f: FiltrosVendas,
  u: UsuarioAtual,
  crescente: boolean,
): Promise<Kanban> {
  const r = regrasColunas(f, u)
  const { desde, antes } = intervaloCriacao(f.de, f.ate)
  const cliente = f.cliente ? `%${escaparLike(f.cliente)}%` : null

  // ------------------------------------------------------------------- Cotação
  // v_kanban_cotacoes (db/015): contadores e total dos vencedores já somados no banco.
  let cot = supabase
    .from('v_kanban_cotacoes')
    .select(
      'id, numero, criado_em, arquivado, etapa_id, cliente_nome, vendedor_nome, motivo_nome, ' +
        'qtd_itens, qtd_vencedores, qtd_propostas, total_bruto_vencedores::text, pode_propor, cliente_id',
      { count: CONTAGEM },
    )
    .eq('rascunho', false)
    .eq('arquivado', r.cotacao.arquivado)
    .gte('criado_em', desde)
    .lt('criado_em', antes)
  cot = 'eq' in r.cotacao.etapa ? cot.eq('etapa_id', r.cotacao.etapa.eq) : cot.neq('etapa_id', r.cotacao.etapa.neq)
  if (r.vendedor) cot = cot.eq('vendedor_id', r.vendedor)
  if (f.numero) cot = cot.eq('numero', Number(f.numero))
  if (cliente) cot = cot.ilike('cliente_nome', cliente)

  // -------------------------------------------------------------------- Pedido
  // v_kanban_pedidos (db/015): valor do pedido (snapshot da proposta) e "todas concluídas". As
  // entregas vêm por embed (o PostgREST segue a FK de entregas.pedido_id até a view) só para
  // o detalhe do cartão.
  let ped = supabase
    .from('v_kanban_pedidos')
    .select(
      'id, numero, cotacao_id, criado_em, etapa_id, finalizado, motivo_cancelamento, cliente_nome, ' +
        'vendedor_nome, valor_total::text, todas_concluidas, cliente_id, ' +
        'entregas(id, qtd::text, dt_prev_entrega, status_id, nf_fornecedor_numero, saiu_entrega, ' +
          'orcamento:orcamentos_fornecedor(produto:produtos(nome)))',
      { count: CONTAGEM },
    )
    .eq('finalizado', r.pedido.finalizado)
    .eq('etapa_id', r.pedido.etapa)
    .gte('criado_em', desde)
    .lt('criado_em', antes)
  if (r.vendedor) ped = ped.eq('vendedor_id', r.vendedor)
  if (f.numero) ped = ped.eq('numero', f.numero)
  if (cliente) ped = ped.ilike('cliente_nome', cliente)

  // ------------------------------------------------------- Entregas Próprias
  let ent = supabase
    .from('v_kanban_entregas')
    .select(COLUNAS_ENTREGA, { count: CONTAGEM })
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
    .select(COLUNAS_ENTREGA, { count: CONTAGEM })
    .not('status_id', 'in', `(${r.substitutoExcluiStatus.join(',')})`)
    .gte('dt_pedido', f.de)
    .lte('dt_pedido', f.ate)
  sub = r.vendedor ? sub.eq('vendedor_substituto_id', r.vendedor) : sub.not('vendedor_substituto_id', 'is', null)
  if (f.numero) sub = sub.eq('numero_entrega', f.numero)
  if (cliente) sub = sub.ilike('cliente_nome', cliente)

  const ate = (n: number) => n * POR_COLUNA - 1
  const [c, p, e, s] = await Promise.all([
    cot.order('criado_em', { ascending: crescente }).order('id').range(0, ate(f.lim.cot)),
    ped.order('criado_em', { ascending: crescente }).order('id').range(0, ate(f.lim.ped)),
    ent.order('criado_em', { ascending: crescente }).order('id').range(0, ate(f.lim.ent)),
    sub.order('criado_em', { ascending: crescente }).order('id').range(0, ate(f.lim.sub)),
  ])

  return {
    cotacoes: coluna<CartaoCotacao>('cotação', c),
    pedidos: coluna<CartaoPedido>('pedido', p),
    entregas: coluna<CartaoEntrega>('entregas', e),
    substituto: coluna<CartaoEntrega>('substituto', s),
  }
}

async function buscarOpcoes(supabase: Supabase, filtrarVendedor: boolean, eu: string): Promise<Opcoes> {
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
    eu,
  }
}

/** WF bTcal (db/022). Erro só vai para o log: a limpeza é faxina, não pode derrubar o quadro. */
async function limparRascunhos(supabase: Supabase): Promise<void> {
  const { error } = await supabase.rpc('fn_limpar_rascunhos')
  if (error) console.error('vendas: limpar rascunhos', error)
}

export default async function PaginaVendas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor, antes de qualquer consulta. No Bubble a página não tinha checagem
  // própria: quem digitava a URL entrava (spec §1).
  const usuario = await exigirAcesso('vendas')
  const params = await searchParams
  const filtros = lerFiltros(params)
  // Pílula "data crescente" (lib/vendas-ordem): só ordem, fora dos filtros.
  const crescente = lerCrescente(params)
  const filtrarVendedor = podeFiltrarVendedor(usuario)
  // Analista/Operador: o vendedor da URL é ignorado (spec §2.2, bTiYV).
  if (!filtrarVendedor) filtros.vendedor = null

  // Cliente da SESSÃO: quem lê é o usuário, e a RLS decide. Nunca service_role aqui.
  const supabase = await clienteServidor()
  // Com a cotação aberta em TELA CHEIA o quadro fica coberto: não se consulta. Cada gravação na
  // ficha (revalidatePath) refazia as 4 colunas — no banco Micro isso gerava rajadas de 57014.
  // A tela mantém o último quadro recebido e o refaz ao fechar a ficha.
  //
  // Da ficha, na aba Cotação só vão carrinho e orçamentos: propostas/pedidos/documento (as
  // consultas mais pesadas, que caíam em 57014) a tela pede depois, sem travar a abertura
  // (lib/vendas-ficha). As listas dos selects (produtos etc.) a tela pede UMA vez e guarda.
  const partes = filtros.aba === 'cotacao' ? PARTES_CARRINHO : PARTES_FICHA
  const [kanban, , opcoes, ficha] = await Promise.all([
    filtros.sel ? Promise.resolve(null) : buscarKanban(supabase, filtros, usuario, crescente).then(comFotosKanban),
    // WF bTcal: ao abrir, apaga os carrinhos (rascunhos) do PRÓPRIO usuário parados há 24 h
    // (db/022 fn_limpar_rascunhos). Só com o quadro à vista — não a cada gravação na ficha — e
    // em paralelo; falha aqui não impede a tela.
    filtros.sel ? null : limparRascunhos(supabase),
    buscarOpcoes(supabase, filtrarVendedor, usuario.nome),
    filtros.sel ? buscarFicha(supabase, filtros.sel, partes) : Promise.resolve(null),
  ])

  return (
    <TelaVendas
      filtros={filtros}
      crescente={crescente}
      kanban={kanban}
      opcoes={opcoes}
      ficha={ficha === 'erro' ? null : ficha}
      fichaFalhou={ficha === 'erro'}
      usuario={{ id: usuario.id, perfilId: usuario.perfilId }}
      permissoes={{ filtrarVendedor, ehDiretor: usuario.perfilId === 1 }}
    />
  )
}
