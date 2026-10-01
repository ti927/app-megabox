import type { Metadata, Route } from 'next'
import { redirect } from 'next/navigation'

import { exigirAcesso } from '@/lib/autorizacao'
import { escaparLike, faixa } from '@/lib/clifor'
import {
  type FiltrosSac,
  lerFiltros,
  limitesPeriodo,
  numeroProtocoloBuscado,
  paraQuery,
  POR_PAGINA,
  podeExcluir,
  STATUS_RESOLVIDO,
} from '@/lib/sac'
import { hojeSaoPaulo } from '@/lib/relatorios'
import {
  type FiltrosPosVenda,
  type IndicadoresSac,
  lerAba,
  lerFiltrosPosVenda,
  lerFiltrosRelatorio,
} from '@/lib/sac-paineis'
import { lerFiltrosApoio } from '@/lib/sac-apoio'
import { clienteServidor } from '@/lib/supabase/servidor'

import { buscarApoio, buscarOportunidades } from './dados-apoio'

import { TelaSac } from './tela'
import type {
  Contato,
  Convite,
  Entrega,
  Ficha,
  Filial,
  Interacao,
  LinhaProtocolo,
  Nps,
  Opcoes,
  LinhaPosVenda,
  PainelNps,
  PainelPosVenda,
  Pesquisa,
  Protocolo,
} from './tipos'

import './sac.css'
import './apoio.css'

export const metadata: Metadata = { title: 'SAC — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/**
 * Lista de protocolos — `tbl Chamados` (bUClt), paginada e filtrada NO SERVIDOR.
 *
 * Diferenças deliberadas (sac.md §3.1): os filtros SOMAM (no Bubble cada condicional troca a
 * busca inteira e a de perfil anula as outras); excluídos ficam fora em todo filtro
 * ([DÚVIDA 4]) — só a Diretoria pede para vê-los; a regra "não-Diretor vê só os seus" é a RLS
 * (D4 da 013: responsável ou quem abriu), não uma condicional de tela. Ordem: prioridade desc
 * e abertura desc ([DÚVIDA 18]).
 */
async function buscarLista(supabase: Supabase, f: FiltrosSac, verExcluidos: boolean) {
  const numero = numeroProtocoloBuscado(f.q)
  const porNome = f.q !== '' && numero === null
  const colunas = [
    'id, numero, aberto_em, fechado_em, status_id, prioridade_id, tipo_ocorrencia_id, responsavel_id, excluido_em',
    porNome ? 'cliente:grupos_clifor!inner(nome, tipo)' : 'cliente:grupos_clifor(nome, tipo)',
    'filial:enderecos_clifor(nome_endereco, documento)',
    'pedido:pedidos(numero)',
    'responsavel:usuarios!responsavel_id(nome)',
  ]
  let consulta = supabase.from('sac_protocolos').select(colunas.join(','), { count: 'exact' })

  if (!(f.excluidos && verExcluidos)) consulta = consulta.is('excluido_em', null)
  if (f.status) consulta = consulta.eq('status_id', f.status)
  if (f.prioridade) consulta = consulta.eq('prioridade_id', f.prioridade)
  if (f.tipo) consulta = consulta.eq('tipo_ocorrencia_id', f.tipo)
  if (f.responsavel) consulta = consulta.eq('responsavel_id', f.responsavel)
  const { desde, antes } = limitesPeriodo(f.de, f.ate)
  if (desde) consulta = consulta.gte('aberto_em', desde)
  if (antes) consulta = consulta.lt('aberto_em', antes)
  // `Input A` (bUClD): nome do cliente/fornecedor contém o texto. Número puro = nº do protocolo.
  // TODO(busca sem acento): mesma limitação de /cadastros (ILIKE simples).
  if (numero !== null) consulta = consulta.eq('numero', numero)
  else if (porNome) consulta = consulta.ilike('cliente.nome', `%${escaparLike(f.q)}%`)

  const { de, ate } = faixa(f.pagina, POR_PAGINA)
  const { data, count, error } = await consulta
    .order('prioridade_id', { ascending: false })
    .order('aberto_em', { ascending: false })
    .order('id')
    .range(de, ate)

  // Página além do fim (a lista encolheu, ou a URL foi editada): volta para a primeira.
  if (error?.code === 'PGRST103') redirect(`/sac${paraQuery(f, { pagina: 1 })}` as Route)
  if (error) {
    console.error('sac: lista', { code: error.code, message: error.message })
    return { linhas: [] as LinhaProtocolo[], total: 0, falhou: true }
  }
  return { linhas: (data ?? []) as unknown as LinhaProtocolo[], total: count ?? 0, falhou: false }
}

/** Contador do topo: não resolvidos visíveis a quem olha, ignorando os filtros. */
async function contarAbertos(supabase: Supabase) {
  const { count } = await supabase
    .from('sac_protocolos')
    .select('id', { count: 'exact', head: true })
    .is('excluido_em', null)
    .neq('status_id', STATUS_RESOLVIDO)
  return count ?? 0
}

async function buscarOpcoes(supabase: Supabase): Promise<Opcoes> {
  const [status, prioridades, tipos, usuarios] = await Promise.all([
    supabase.from('sac_status').select('id, nome').order('id'),
    supabase.from('sac_prioridades').select('id, nome').order('id', { ascending: false }),
    supabase.from('sac_tipos_ocorrencia').select('id, nome').order('id'),
    supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome'),
  ])
  return {
    status: status.data ?? [],
    prioridades: prioridades.data ?? [],
    tipos: tipos.data ?? [],
    usuarios: usuarios.data ?? [],
  }
}

/** A ficha do protocolo aberto — `Pop Novo Chamado` (bUCqT) com os dados, e as interações. */
async function buscarFicha(supabase: Supabase, id: string): Promise<Ficha | null> {
  const { data: p, error } = await supabase
    .from('sac_protocolos')
    .select(
      'id, numero, grupo_clifor_id, filial_id, pedido_id, responsavel_id, tipo_ocorrencia_id, ' +
        'prioridade_id, status_id, descricao, aberto_em, fechado_em, tempo_resolucao, excluido_em, ' +
        'excluido_motivo, criado_em, alterado_em, prazo_em, depende_fornecedor, motivo_pendencia, ' +
        'cliente:grupos_clifor(id, nome, tipo), ' +
        'pedido:pedidos(numero), autor:usuarios!criado_por(nome), editor:usuarios!alterado_por(nome), ' +
        'excluidor:usuarios!excluido_por(nome)',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) console.error('sac: ficha', { code: error.code, message: error.message })
  if (!p) return null
  const protocolo = p as unknown as Protocolo

  const colunasEntrega = 'id, numero_entrega, dt_prev_entrega, qtd, nf_fornecedor_numero'
  const [ligadas, doPedido, filiais, contatos, interacoes, acomp, aval] = await Promise.all([
    supabase
      .from('sac_protocolo_entregas')
      .select(`entrega_id, entrega:entregas(${colunasEntrega})`)
      .eq('protocolo_id', id),
    protocolo.pedido_id
      ? supabase
          .from('entregas')
          .select(colunasEntrega)
          .eq('pedido_id', protocolo.pedido_id)
          .order('dt_prev_entrega', { nullsFirst: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from('enderecos_clifor')
      .select('id, nome_endereco, documento, uf, ativo')
      .eq('grupo_id', protocolo.grupo_clifor_id)
      .order('ativo', { ascending: false })
      .order('nome_endereco'),
    supabase
      .from('contatos_clifor')
      .select('id, nome, email')
      .eq('grupo_id', protocolo.grupo_clifor_id)
      .eq('ativo', true)
      .order('nome'),
    // Conversa em ordem cronológica ([DÚVIDA 18]); no Bubble, sem ordenação (RepeatingGroup C).
    supabase
      .from('sac_interacoes')
      .select(
        'id, descricao, tipo_acao, visivel_cliente, criado_em, email_id, autor:usuarios!autor_id(nome), ' +
          'contato:contatos_clifor(nome, email)',
      )
      .eq('protocolo_id', id)
      .order('criado_em')
      .order('id'),
    // Acompanhamento AGORA (db/030): prazo efetivo, última ação, parado, situação.
    supabase.rpc('fn_sac_acompanhamento', { p_ids: [id] }),
    // Avaliação do atendimento ligada ao protocolo (030 D8). Colunas explícitas (sem token_hash).
    supabase
      .from('pesquisa_convites')
      .select('enviado_em, usado_em, resposta:pesquisa_respostas(nota_atendimento, nota_nps)')
      .eq('protocolo_id', id)
      .is('cancelado_em', null)
      .maybeSingle(),
  ])
  if (acomp.error) console.error('sac: acompanhamento', { code: acomp.error.code, message: acomp.error.message })

  type Ligada = { entrega_id: string; entrega: Entrega | null }
  // Entrega que a RLS de vendas não deixa ler aparece só pelo id (o vínculo é do SAC).
  const entregas = ((ligadas.data ?? []) as unknown as Ligada[]).map(
    (l) =>
      l.entrega ?? {
        id: l.entrega_id,
        numero_entrega: null,
        dt_prev_entrega: null,
        qtd: null,
        nf_fornecedor_numero: null,
      },
  )

  return {
    protocolo,
    entregas,
    entregasPedido: (doPedido.data ?? []) as Entrega[],
    filiais: (filiais.data ?? []) as Filial[],
    contatos: (contatos.data ?? []) as Contato[],
    interacoes: (interacoes.data ?? []) as unknown as Interacao[],
    acompanhamento: ((acomp.data ?? [])[0] ?? null) as Ficha['acompanhamento'],
    avaliacao: avaliacaoDoConvite(aval.data),
  }
}

type NotaBruta = { nota_atendimento: number | null; nota_nps: number | null }
function avaliacaoDoConvite(c: unknown): Ficha['avaliacao'] {
  const x = c as { enviado_em: string | null; usado_em: string | null; resposta: NotaBruta | NotaBruta[] | null } | null
  if (!x) return null
  const r = Array.isArray(x.resposta) ? (x.resposta[0] ?? null) : x.resposta
  return { enviado_em: x.enviado_em, usado_em: x.usado_em, nota: r ? (r.nota_atendimento ?? r.nota_nps) : null }
}

/**
 * Sinalização de chamado parado na lista (db/030 D4): o acompanhamento só das linhas da
 * página, e o contador de parados visíveis a quem olha.
 */
async function buscarParados(supabase: Supabase, ids: string[]) {
  const [linhas, contagem] = await Promise.all([
    ids.length > 0
      ? supabase.rpc('fn_sac_acompanhamento', { p_ids: ids }).select('protocolo_id, parado, dias_sem_acao, dias_limite')
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc('fn_sac_acompanhamento', {}, { count: 'exact', head: true }).eq('parado', true),
  ])
  if (linhas.error) console.error('sac: parados', { code: linhas.error.code, message: linhas.error.message })
  type Linha = { protocolo_id: string; parado: boolean; dias_sem_acao: number; dias_limite: number }
  const mapa: Record<string, number> = {}
  let limite: number | null = null
  for (const l of (linhas.data ?? []) as Linha[]) {
    limite = l.dias_limite
    if (l.parado) mapa[l.protocolo_id] = l.dias_sem_acao
  }
  return { mapa, total: contagem.count ?? 0, limite }
}

/**
 * Painel "Gestão NPS" (`Group Gestão NPS` bUCyb). Os cards vêm de `fn_nps` (D10 da 013), no
 * lugar de "NPS Atual" = contagem de convites e da média com divisão por zero (§5, [DÚVIDA 7]).
 * A lista de convidados é `Table B` (bUCzL), com o filtro por nome de cliente (`Input F`).
 */
async function buscarPainelNps(supabase: Supabase, f: FiltrosSac): Promise<PainelNps> {
  const { data: pesquisas, error } = await supabase
    .from('pesquisas')
    .select('id, nome, tipo_id, ativa, criado_em')
    .order('criado_em', { ascending: false })
    .limit(200)
  if (error) {
    console.error('sac: pesquisas', { code: error.code, message: error.message })
    return { pesquisas: [], escolhida: null, nps: null, convites: [], totalConvites: 0, falhou: true }
  }
  const lista = (pesquisas ?? []) as Pesquisa[]
  const escolhida = lista.find((p) => p.id === f.pesquisa) ?? lista[0] ?? null
  if (!escolhida) return { pesquisas: lista, escolhida: null, nps: null, convites: [], totalConvites: 0, falhou: false }

  let consulta = supabase
    .from('pesquisa_convites')
    // Colunas explícitas: `token_hash` não tem GRANT para authenticated (D7) e nunca é pedido.
    .select(
      'id, cliente_id, expira_em, usado_em, enviado_em, envios, cancelado_em, cancelado_motivo, criado_em, ' +
        `cliente:grupos_clifor${f.q ? '!inner' : ''}(nome), contato:contatos_clifor(nome, email), ` +
        'resposta:pesquisa_respostas(nota_nps, criticas_sugestoes, respondida_em)',
      { count: 'exact' },
    )
    .eq('pesquisa_id', escolhida.id)
  if (f.q) consulta = consulta.ilike('cliente.nome', `%${escaparLike(f.q)}%`)
  const { de, ate } = faixa(f.pagina, POR_PAGINA)

  const [nps, convites] = await Promise.all([
    supabase.rpc('fn_nps', { p_pesquisa_id: escolhida.id, p_de: f.de, p_ate: f.ate }),
    consulta.order('cancelado_em', { nullsFirst: true }).order('criado_em', { ascending: false }).order('id').range(de, ate),
  ])
  if (nps.error) console.error('sac: fn_nps', { code: nps.error.code, message: nps.error.message })
  if (convites.error?.code === 'PGRST103') redirect(`/sac${paraQuery(f, { pagina: 1 })}` as Route)
  if (convites.error) console.error('sac: convites', { code: convites.error.code, message: convites.error.message })

  const linhaNps = (Array.isArray(nps.data) ? nps.data[0] : nps.data) as Record<string, unknown> | undefined
  type Bruto = Omit<Convite, 'resposta'> & { resposta: Convite['resposta'] | Convite['resposta'][] }
  return {
    pesquisas: lista,
    escolhida,
    nps: linhaNps
      ? ({
          convites: Number(linhaNps.convites ?? 0),
          respondidas: Number(linhaNps.respondidas ?? 0),
          promotores: Number(linhaNps.promotores ?? 0),
          neutros: Number(linhaNps.neutros ?? 0),
          detratores: Number(linhaNps.detratores ?? 0),
          nps: linhaNps.nps === null || linhaNps.nps === undefined ? null : Number(linhaNps.nps),
          media: linhaNps.media === null || linhaNps.media === undefined ? null : String(linhaNps.media),
        } satisfies Nps)
      : null,
    // pesquisa_respostas.convite_id é unique: o PostgREST devolve objeto, mas aceita-se lista.
    convites: ((convites.data ?? []) as unknown as Bruto[]).map((c) => ({
      ...c,
      resposta: Array.isArray(c.resposta) ? (c.resposta[0] ?? null) : c.resposta,
    })),
    totalConvites: convites.count ?? 0,
    falhou: Boolean(nps.error || convites.error),
  }
}

/**
 * Aba Pós-Venda (`Table D` bUEMt0): convites de pesquisa do tipo 3 (Pós-Venda) com a resposta.
 * A busca por cliente SOMA ao tipo (no Bubble trocava pela campanha NPS da outra aba) e a
 * vendedora filtra de verdade (`Input H` bUEoZ não filtrava nada) — sac.md §3.6.
 */
async function buscarPosVenda(supabase: Supabase, f: FiltrosPosVenda): Promise<PainelPosVenda> {
  let consulta = supabase
    .from('pesquisa_convites')
    // Colunas explícitas: `token_hash` não tem GRANT para authenticated (D7 da 013).
    .select(
      'id, criado_em, pesquisa:pesquisas!inner(tipo_id), ' +
        `cliente:grupos_clifor${f.q ? '!inner' : ''}(nome), vendedor:usuarios!vendedor_id(nome), ` +
        'resposta:pesquisa_respostas(nota_atendimento, nota_produto, nota_nps, criticas_sugestoes, respondida_em)',
      { count: 'exact' },
    )
    .eq('pesquisa.tipo_id', TIPO_PESQUISA_POS_VENDA)
    .is('cancelado_em', null)
  if (f.q) consulta = consulta.ilike('cliente.nome', `%${escaparLike(f.q)}%`)
  if (f.vendedor) consulta = consulta.eq('vendedor_id', f.vendedor)
  const { de, ate } = faixa(f.pagina, POR_PAGINA)
  const { data, count, error } = await consulta.order('criado_em', { ascending: false }).order('id').range(de, ate)
  if (error?.code === 'PGRST103') redirect('/sac?aba=posvenda' as Route)
  if (error) {
    console.error('sac: pós-venda', { code: error.code, message: error.message })
    return { linhas: [], total: 0, falhou: true }
  }
  type Bruto = Omit<LinhaPosVenda, 'resposta'> & { resposta: LinhaPosVenda['resposta'] | LinhaPosVenda['resposta'][] }
  return {
    linhas: ((data ?? []) as unknown as Bruto[]).map((l) => ({
      ...l,
      resposta: Array.isArray(l.resposta) ? (l.resposta[0] ?? null) : l.resposta,
    })),
    total: count ?? 0,
    falhou: false,
  }
}

/** tipos_pesquisa (003): 3 = Pós-Venda. */
const TIPO_PESQUISA_POS_VENDA = 3

export default async function PaginaSac({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor. No Bubble a página não tem guarda nenhuma (sac.md §1, §7.2).
  const usuario = await exigirAcesso('sac')
  const params = await searchParams
  const aba = lerAba(params)
  const filtros = lerFiltros(params)
  const diretoria = podeExcluir(usuario)

  // Cliente da SESSÃO: a RLS decide o que cada um vê. Nunca service_role aqui.
  const supabase = await clienteServidor()
  const opcoes = await buscarOpcoes(supabase)
  const quem = { id: usuario.id, nome: usuario.nome, ehDiretor: usuario.ehDiretor, ehGestor: usuario.ehGerenciaOuAcima }

  if (aba === 'relatorios') {
    const { filtros: fr, aviso } = lerFiltrosRelatorio(params, hojeSaoPaulo())
    // Quem não é Diretor já só enxerga os seus (RLS, 013 D4): o filtro de responsável seria inócuo.
    if (!usuario.ehDiretor) fr.responsavel = null
    const r = await supabase.rpc('fn_sac_indicadores', { p_de: fr.de, p_ate: fr.ate, p_responsavel: fr.responsavel })
    if (r.error) console.error('sac: indicadores', { code: r.error.code, message: r.error.message })
    return (
      <TelaSac
        aba={aba}
        filtros={filtros}
        usuario={quem}
        opcoes={opcoes}
        abertos={null}
        lista={null}
        ficha={null}
        painel={null}
        relatorio={{
          filtros: fr,
          aviso,
          dados: (r.data ?? null) as IndicadoresSac | null,
          falhou: !!r.error,
          veTodos: usuario.ehDiretor,
        }}
      />
    )
  }

  if (aba === 'apoio' || aba === 'oportunidades') {
    const fa = lerFiltrosApoio(params, hojeSaoPaulo())
    if (!usuario.ehGerenciaOuAcima) fa.responsavel = null
    const apoio = aba === 'apoio' ? await buscarApoio(supabase, fa, usuario) : null
    const oportunidades = aba === 'oportunidades' ? await buscarOportunidades(supabase, fa, usuario) : null
    return (
      <TelaSac
        aba={aba}
        filtros={filtros}
        usuario={quem}
        opcoes={opcoes}
        abertos={null}
        lista={null}
        ficha={null}
        painel={null}
        apoio={{ filtros: fa, hoje: hojeSaoPaulo(), dados: apoio, oportunidades }}
      />
    )
  }

  if (aba === 'posvenda') {
    const fp = lerFiltrosPosVenda(params)
    const painel = await buscarPosVenda(supabase, fp)
    return (
      <TelaSac
        aba={aba}
        filtros={filtros}
        usuario={quem}
        opcoes={opcoes}
        abertos={null}
        lista={null}
        ficha={null}
        painel={null}
        posVenda={{ filtros: fp, painel }}
      />
    )
  }

  if (filtros.aba === 'nps') {
    const painel = await buscarPainelNps(supabase, filtros)
    return (
      <TelaSac
        aba={aba}
        filtros={filtros}
        usuario={quem}
        opcoes={opcoes}
        abertos={null}
        lista={null}
        ficha={null}
        painel={painel}
      />
    )
  }

  const [lista, abertos, ficha] = await Promise.all([
    buscarLista(supabase, filtros, diretoria),
    contarAbertos(supabase),
    filtros.sel ? buscarFicha(supabase, filtros.sel) : Promise.resolve(null),
  ])

  const parados = await buscarParados(
    supabase,
    lista.linhas.map((l) => l.id),
  )

  return (
    <TelaSac
      aba={aba}
      filtros={filtros}
      usuario={quem}
      opcoes={opcoes}
      abertos={abertos}
      parados={parados}
      lista={lista}
      ficha={ficha}
      painel={null}
    />
  )
}
