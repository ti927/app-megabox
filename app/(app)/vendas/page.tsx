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

import { buscarOpcoesFicha } from './consultas'
import { comFotoFicha, comFotosKanban } from './fotos'
import { TelaVendas } from './tela'
import type {
  CartaoCotacao,
  CartaoEntrega,
  CartaoPedido,
  ColunaDados,
  Cotacao,
  EntregaFicha,
  Ficha,
  Item,
  Kanban,
  Opcoes,
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
async function buscarKanban(supabase: Supabase, f: FiltrosVendas, u: UsuarioAtual): Promise<Kanban> {
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
    cot.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.cot)),
    ped.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.ped)),
    ent.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.ent)),
    sub.order('criado_em', { ascending: false }).order('id').range(0, ate(f.lim.sub)),
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
        'empresa_emissora_id, rascunho, ' +
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
        'id, qtd::text, medida, produto_id, condicao_id, linha_id, endereco_destino_id, ' +
          'produto:produtos(nome, grupo_id), condicao:condicoes_produto(nome), ' +
          'linha:linhas_produto(nome), destino:enderecos_clifor(nome_endereco, uf, municipio)',
      )
      .eq('cotacao_id', id)
      .order('criado_em')
      .order('id'),
    supabase.from('v_orcamento_valores').select(COLUNAS_VALORES).eq('cotacao_id', id).order('id'),
    supabase
      .from('orcamentos_fornecedor')
      .select(
        'id, criado_em, fornecedor_id, fornecedor:grupos_clifor(nome), frete:tipos_frete(nome), ' +
          'origem:enderecos_clifor!endereco_origem_id(nome_endereco, uf, regime:regimes_tributarios(nome))',
      )
      .eq('cotacao_id', id),
    supabase
      .from('propostas')
      .select(
        'id, numero, enviada, enviada_em, criado_em, data_prev_entrega, condicao_pagamento, ' +
          'info_adicional, emails_copia, corpo_email, enviar_para_contato_id, faturar_para_endereco_id, ' +
          'vendedor:usuarios!vendedor_id(nome), ' +
          'itens:proposta_itens(id, qtd::text, valor_venda_unit::text, valor_frete::text, ' +
          'orcamento:orcamentos_fornecedor(id, fornecedor_id, produto:produtos(nome), fornecedor:grupos_clifor(nome)))',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false }),
    supabase
      .from('pedidos')
      .select(
        'id, numero, criado_em, etapa_id, formalizado, formalizado_em, finalizado, motivo_cancelamento, ' +
          'ordem_compra_numero, info_adicional, proposta_id, forma_pagamento_id, contato_cliente_id, ' +
          'contato_fornecedor_id, emails_copia_cliente, emails_copia_fornecedor, corpo_email_cliente, ' +
          'corpo_email_fornecedor, proposta:propostas(numero), forma:formas_pagamento(nome), etapa:etapas(nome), ' +
          'prazos:pedido_prazos(prazo_id)',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false }),
    // Tabela, não a view do kanban: a ficha precisa de NF, motivo e arquivos, e não do join
    // de nomes. A RLS de entregas (009) decide o que aparece.
    supabase
      .from('entregas')
      .select(
        'id, pedido_id, orcamento_fornecedor_id, status_id, qtd::text, dt_prev_entrega, dt_entrega, ' +
          'saiu_entrega, nao_emite_nf, nf_fornecedor_numero, dt_emissao_nf, nota_boleto_enviada, ' +
          'motivo_cancelamento, valor_venda_bruto::text, valor_comissao::text, valor_venda_liquido::text, ' +
          'vendedor_substituto_id, arquivos:entrega_arquivos(id, tipo, nome_arquivo, path, enviado_em)',
      )
      .eq('cotacao_id', id)
      .order('dt_prev_entrega', { ascending: true, nullsFirst: false })
      .order('criado_em'),
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
    fornecedor_id: string
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

  // Agenda de contatos (bTPJB, bTbnk, bTcZi): contatos ATIVOS com e-mail do cliente e dos
  // fornecedores orçados. É daqui que sai o destinatário: a action relê pelo id, no banco.
  const grupos = [...new Set([c.cliente_id, ...[...porId.values()].map((n) => n.fornecedor_id)])]
  const { data: contatos, error: eContatos } = await supabase
    .from('contatos_clifor')
    .select('id, grupo_id, nome, email')
    .in('grupo_id', grupos)
    .eq('ativo', true)
    .not('email', 'is', null)
    .order('nome')
    .limit(500)
  if (eContatos) console.error('vendas: contatos da ficha', eContatos)

  // Parte da ficha que falhou (timeout, rede) NÃO vira lista vazia calada: o carrinho sem itens
  // seria lido como "os produtos sumiram". A tela avisa e pede para recarregar.
  const partes = { itens, valores, nomes, propostas, pedidos, entregas, destinos }
  const falhas = Object.entries(partes).filter(([, r]) => r.error)
  for (const [nome, r] of falhas) console.error(`vendas: ficha (${nome})`, r.error)

  return {
    cotacao: c,
    incompleta: falhas.length > 0,
    contatos: ((contatos ?? []) as Ficha['contatos']).filter((x) => x.email.trim() !== ''),
    itens: (itens.data ?? []) as unknown as Item[],
    orcamentos,
    propostas: (propostas.data ?? []) as unknown as Proposta[],
    pedidos: (pedidos.data ?? []) as unknown as Pedido[],
    entregas: (entregas.data ?? []) as unknown as EntregaFicha[],
    destinos: (destinos.data ?? []) as Ficha['destinos'],
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
  const filtros = lerFiltros(await searchParams)
  const filtrarVendedor = podeFiltrarVendedor(usuario)
  // Analista/Operador: o vendedor da URL é ignorado (spec §2.2, bTiYV).
  if (!filtrarVendedor) filtros.vendedor = null

  // Cliente da SESSÃO: quem lê é o usuário, e a RLS decide. Nunca service_role aqui.
  const supabase = await clienteServidor()
  // Com a cotação aberta em TELA CHEIA o quadro fica coberto: não se consulta. Cada gravação na
  // ficha (revalidatePath) refazia as 4 colunas — no banco Micro isso gerava rajadas de 57014.
  // A tela mantém o último quadro recebido e o refaz ao fechar a ficha.
  const [kanban, , opcoes, ficha, opcoesFicha] = await Promise.all([
    filtros.sel ? Promise.resolve(null) : buscarKanban(supabase, filtros, usuario).then(comFotosKanban),
    // WF bTcal: ao abrir, apaga os carrinhos (rascunhos) do PRÓPRIO usuário parados há 24 h
    // (db/022 fn_limpar_rascunhos). Só com o quadro à vista — não a cada gravação na ficha — e
    // em paralelo; falha aqui não impede a tela.
    filtros.sel ? null : limparRascunhos(supabase),
    buscarOpcoes(supabase, filtrarVendedor, usuario.nome),
    filtros.sel ? buscarFicha(supabase, filtros.sel).then(comFotoFicha) : Promise.resolve(null),
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
