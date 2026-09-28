/**
 * Regras puras da página `sac` (chamados/protocolos e painel NPS).
 *
 * Sem acesso a banco, para serem testadas e reusadas pela tela e pelas server actions.
 * Fonte: specs/paginas/sac.md (citada por seção e WF) e os cabeçalhos D1..D10 de
 * db/013_sac.sql. As listas fixas (status, prioridade, tipo) são as de db/003 — ids
 * estáveis, lidos do banco pela tela; aqui só os ids que têm regra.
 */

import type { UsuarioAtual } from '@/lib/autorizacao'
import { ehUuid } from '@/lib/clifor'

/** sac_status (003): 4 = Resolvido — o id que liga `fechado_em` (D3 da 013). */
export const STATUS_RESOLVIDO = 4
/** sac_status (003): 1 = Em aberto — o padrão de chamado novo (default da coluna). */
export const STATUS_EM_ABERTO = 1
/** tipos_pesquisa (003): 2 = NPS — a campanha que a aba Gestão NPS cria (WF bUDPr). */
export const TIPO_PESQUISA_NPS = 2

export const POR_PAGINA = 30

export type Aba = 'chamados' | 'nps'

export type FiltrosSac = {
  aba: Aba
  q: string
  status: number | null
  prioridade: number | null
  tipo: number | null
  responsavel: string | null
  /** período de ABERTURA, yyyy-mm-dd, inclusivo; os dois ou nenhum */
  de: string | null
  ate: string | null
  /** mostrar os excluídos — só Diretoria (sac [DÚVIDA 4]) */
  excluidos: boolean
  pagina: number
  /** protocolo aberto na ficha — `?sel=<uuid>` (spec §9.1: protocolo linkável) */
  sel: string | null
  /** campanha escolhida na aba NPS (`dd pesquisa` bUDQE) */
  pesquisa: string | null
}

export const FILTROS_PADRAO: FiltrosSac = {
  aba: 'chamados',
  q: '',
  status: null,
  prioridade: null,
  tipo: null,
  responsavel: null,
  de: null,
  ate: null,
  excluidos: false,
  pagina: 1,
  sel: null,
  pesquisa: null,
}

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

/** Id de lista fixa (smallint > 0) ou null. */
function idLista(v: string): number | null {
  const n = Number(v)
  return v !== '' && Number.isInteger(n) && n > 0 && n < 32768 ? n : null
}

function uuidOuNulo(v: string): string | null {
  return ehUuid(v) ? v.toLowerCase() : null
}

const DIA = /^(\d{4})-(\d{2})-(\d{2})$/

/** yyyy-mm-dd que existe no calendário (2025-02-30 não passa). */
export function ehDia(v: string): boolean {
  const m = DIA.exec(v)
  if (!m) return false
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const data = new Date(Date.UTC(a, mes - 1, d))
  return (
    a >= 2000 &&
    a <= 2100 &&
    data.getUTCFullYear() === a &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === d
  )
}

/**
 * searchParams → filtros. Tudo que vem da URL é entrada do usuário: valor desconhecido cai
 * no padrão. Os filtros SOMAM restrições — no Bubble cada um substitui a busca inteira
 * (sac.md §3.1), o que este desenho corrige.
 */
export function lerFiltros(p: Params): FiltrosSac {
  const pagina = Number(um(p, 'pagina'))
  let de = um(p, 'de')
  let ate = um(p, 'ate')
  if (!ehDia(de)) de = ''
  if (!ehDia(ate)) ate = ''
  // Um lado só vale como período aberto no outro; invertido, troca.
  if (de && ate && de > ate) [de, ate] = [ate, de]

  return {
    aba: um(p, 'aba') === 'nps' ? 'nps' : 'chamados',
    q: um(p, 'q').slice(0, 100),
    status: idLista(um(p, 'status')),
    prioridade: idLista(um(p, 'prioridade')),
    tipo: idLista(um(p, 'tipo')),
    responsavel: uuidOuNulo(um(p, 'responsavel')),
    de: de || null,
    ate: ate || null,
    excluidos: um(p, 'excluidos') === '1',
    pagina: Number.isInteger(pagina) && pagina > 1 && pagina < 100_000 ? pagina : 1,
    sel: uuidOuNulo(um(p, 'sel')),
    pesquisa: uuidOuNulo(um(p, 'pesquisa')),
  }
}

/** Filtros → query string, omitindo o padrão. `mudancas` sobrescreve `atual`. */
export function paraQuery(atual: FiltrosSac, mudancas: Partial<FiltrosSac> = {}): string {
  const f = { ...atual, ...mudancas }
  const p = new URLSearchParams()
  if (f.aba !== 'chamados') p.set('aba', f.aba)
  if (f.q) p.set('q', f.q)
  if (f.status) p.set('status', String(f.status))
  if (f.prioridade) p.set('prioridade', String(f.prioridade))
  if (f.tipo) p.set('tipo', String(f.tipo))
  if (f.responsavel) p.set('responsavel', f.responsavel)
  if (f.de) p.set('de', f.de)
  if (f.ate) p.set('ate', f.ate)
  if (f.excluidos) p.set('excluidos', '1')
  if (f.pagina > 1) p.set('pagina', String(f.pagina))
  if (f.sel) p.set('sel', f.sel)
  if (f.pesquisa) p.set('pesquisa', f.pesquisa)
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** Algum filtro da barra está ligado (o que o "Limpar", WF bUDNb, desfaz). */
export function temFiltro(f: FiltrosSac): boolean {
  return (
    f.q !== '' ||
    f.status !== null ||
    f.prioridade !== null ||
    f.tipo !== null ||
    f.responsavel !== null ||
    f.de !== null ||
    f.ate !== null ||
    f.excluidos
  )
}

/**
 * Dia (yyyy-mm-dd) → limite de timestamptz em São Paulo. `de` vira o começo do dia, `ate`
 * o começo do dia SEGUINTE (intervalo meio-aberto). O Brasil não tem horário de verão desde
 * 2019: o fuso é fixo -03:00, o mesmo que `fn_nps` usa (`at time zone 'America/Sao_Paulo'`).
 */
export function limitesPeriodo(de: string | null, ate: string | null): {
  desde: string | null
  antes: string | null
} {
  let antes: string | null = null
  if (ate) {
    const [a, m, d] = ate.split('-').map(Number) as [number, number, number]
    antes = `${new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10)}T00:00:00-03:00`
  }
  return { desde: de ? `${de}T00:00:00-03:00` : null, antes }
}

/** A busca é o número do protocolo? ("123" ou "#123"). Senão, é nome do cliente (§3.1). */
export function numeroProtocoloBuscado(q: string): number | null {
  const m = /^#?\s*(\d{1,9})$/.exec(q.trim())
  return m ? Number(m[1]) : null
}

// ------------------------------------------------------------------------ permissões

/**
 * Quem altera o chamado. D4 da 013 / sac [DÚVIDA 5]: perfil 1 (Diretor) ou o responsável.
 * É também a policy `sac_protocolos_update`; aqui serve para a tela não oferecer o que o
 * banco vai recusar.
 */
export function podeAlterarProtocolo(
  u: Pick<UsuarioAtual, 'id' | 'ehDiretor'>,
  p: { responsavel_id: string | null },
): boolean {
  return u.ehDiretor || (p.responsavel_id !== null && p.responsavel_id === u.id)
}

/**
 * O que cada um altera. No Bubble todos os campos do popup ficam `disabled` para quem não é
 * Diretor (sac.md §1, "Controle de acesso de fato"), mas o botão Salvar (WF bUDSx) grava
 * para qualquer um. A regra adotada é a da spec §9.3 (`atualizarChamado`: "Diretoria;
 * responsável só status e descrição") e da [DÚVIDA 5].
 * O responsável NÃO troca o responsável: a policy de update exige, no `with check`, que a
 * linha continue dele — passá-la adiante é da Diretoria.
 */
export type CamposEditaveis = 'todos' | 'status_descricao' | 'nenhum'

export function camposEditaveis(
  u: Pick<UsuarioAtual, 'id' | 'ehDiretor'>,
  p: { responsavel_id: string | null; excluido_em: string | null },
): CamposEditaveis {
  // Excluído não se edita: primeiro desfaz a exclusão (só Diretoria, D1).
  if (p.excluido_em) return 'nenhum'
  if (u.ehDiretor) return 'todos'
  return podeAlterarProtocolo(u, p) ? 'status_descricao' : 'nenhum'
}

/** Excluir e desfazer exclusão: só perfil 1 (D1 da 013; o trigger recusa os outros com 42501). */
export function podeExcluir(u: Pick<UsuarioAtual, 'ehDiretor'>): boolean {
  return u.ehDiretor
}

// ------------------------------------------------------------------------- validação

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erro: string }

function texto(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : ''
}

function uuidDoForm(v: FormDataEntryValue | null): string | null | 'invalido' {
  const t = texto(v)
  if (t === '') return null
  return ehUuid(t) ? t.toLowerCase() : 'invalido'
}

function listaDoForm(v: FormDataEntryValue | null): number | null {
  return idLista(texto(v))
}

const MAX_DESCRICAO = 10_000
const MAX_ENTREGAS = 100

export type DadosProtocoloNovo = {
  grupo_clifor_id: string
  filial_id: string | null
  pedido_id: string | null
  responsavel_id: string | null
  tipo_ocorrencia_id: number
  prioridade_id: number
  status_id: number
  descricao: string
  entregas: string[]
}

export type DadosProtocoloEdicao = {
  filial_id: string | null
  responsavel_id: string | null
  tipo_ocorrencia_id: number
  prioridade_id: number
  status_id: number
  descricao: string
  entregas: string[]
}

function validarDescricao(v: FormDataEntryValue | null): Validacao<string> {
  const d = texto(v)
  // `ipt obs` (bUCtL) é o único campo obrigatório do popup (sac.md §3.2).
  if (d === '') return { ok: false, erro: 'Descreva a ocorrência.' }
  if (d.length > MAX_DESCRICAO) return { ok: false, erro: 'A descrição passa de 10.000 caracteres.' }
  return { ok: true, dados: d }
}

function validarEntregas(form: FormData): Validacao<string[]> {
  const ids = new Set<string>()
  for (const v of form.getAll('entregas')) {
    if (typeof v !== 'string' || !ehUuid(v)) return { ok: false, erro: 'Entrega inválida. Recarregue a página.' }
    ids.add(v.toLowerCase())
  }
  if (ids.size > MAX_ENTREGAS) return { ok: false, erro: 'Entregas demais num chamado só.' }
  return { ok: true, dados: [...ids].sort() }
}

/** Os campos de situação e de dados — comuns à criação e à edição. */
function validarComum(form: FormData): Validacao<Omit<DadosProtocoloEdicao, 'entregas'>> {
  const tipo = listaDoForm(form.get('tipo_ocorrencia_id'))
  if (!tipo) return { ok: false, erro: 'Escolha o tipo de ocorrência.' }
  const prioridade = listaDoForm(form.get('prioridade_id'))
  if (!prioridade) return { ok: false, erro: 'Escolha a prioridade.' }
  const status = listaDoForm(form.get('status_id'))
  if (!status) return { ok: false, erro: 'Escolha o status.' }

  const responsavel = uuidDoForm(form.get('responsavel_id'))
  if (responsavel === 'invalido') return { ok: false, erro: 'Responsável inválido.' }
  const filial = uuidDoForm(form.get('filial_id'))
  if (filial === 'invalido') return { ok: false, erro: 'Filial inválida.' }

  const descricao = validarDescricao(form.get('descricao'))
  if (!descricao.ok) return descricao

  return {
    ok: true,
    dados: {
      filial_id: filial,
      responsavel_id: responsavel,
      tipo_ocorrencia_id: tipo,
      prioridade_id: prioridade,
      status_id: status,
      descricao: descricao.dados,
    },
  }
}

/**
 * Abrir protocolo — WF bUDKj0 (ação bUDKp0). O número NÃO vem do formulário: é identity no
 * banco (D2), no lugar de `last_element + 1` no navegador. `aberto_em` é sempre carimbado
 * pelo banco (D3, [DÚVIDA 13]), qualquer que seja o status.
 */
export function validarProtocoloNovo(form: FormData): Validacao<DadosProtocoloNovo> {
  const grupo = uuidDoForm(form.get('grupo_clifor_id'))
  if (!grupo || grupo === 'invalido') return { ok: false, erro: 'Escolha o cliente ou fornecedor da lista.' }
  const pedido = uuidDoForm(form.get('pedido_id'))
  if (pedido === 'invalido') return { ok: false, erro: 'Pedido inválido. Busque de novo.' }

  const comum = validarComum(form)
  if (!comum.ok) return comum
  const entregas = validarEntregas(form)
  if (!entregas.ok) return entregas
  // Entrega sem pedido não existe: as entregas são as DO pedido (`dd entregas` bUDKD0).
  if (!pedido && entregas.dados.length > 0) {
    return { ok: false, erro: 'Escolha o pedido antes de marcar entregas.' }
  }

  return {
    ok: true,
    dados: { ...comum.dados, grupo_clifor_id: grupo, pedido_id: pedido, entregas: entregas.dados },
  }
}

/** Editar protocolo — WF bUDSx (ação bUDTF), nos campos que a tela deixa mexer. */
export function validarProtocoloEdicao(form: FormData): Validacao<DadosProtocoloEdicao> {
  const comum = validarComum(form)
  if (!comum.ok) return comum
  const entregas = validarEntregas(form)
  if (!entregas.ok) return entregas
  return { ok: true, dados: { ...comum.dados, entregas: entregas.dados } }
}

/**
 * Só o que o responsável (não Diretor) pode mudar — status e descrição (§9.3). O resto do
 * formulário é ignorado no servidor, não confiado ao `disabled` do navegador (sac.md §7.3).
 */
export function recortarParaResponsavel(d: DadosProtocoloEdicao): Pick<DadosProtocoloEdicao, 'status_id' | 'descricao'> {
  return { status_id: d.status_id, descricao: d.descricao }
}

export type DadosInteracao = {
  descricao: string
  visivel_cliente: boolean
  contato_id: string | null
}

/**
 * Registrar interação — WF bUDth (ação bUDtn). Diferença deliberada: com "visível ao cliente"
 * o contato é OBRIGATÓRIO (sac.md §4.5: hoje o e-mail sai para destinatário vazio; a policy
 * `sac_interacoes_insert` recusa sem contato — D5 da 013). Texto vazio também não passa (o
 * Bubble aceita).
 */
export function validarInteracao(form: FormData): Validacao<DadosInteracao> {
  const descricao = texto(form.get('descricao'))
  if (descricao === '') return { ok: false, erro: 'Escreva a interação.' }
  if (descricao.length > MAX_DESCRICAO) return { ok: false, erro: 'A interação passa de 10.000 caracteres.' }
  const visivel = form.get('visivel_cliente') === 'on'
  const contato = uuidDoForm(form.get('contato_id'))
  if (contato === 'invalido') return { ok: false, erro: 'Contato inválido.' }
  if (visivel && !contato) return { ok: false, erro: 'Escolha o contato do cliente que deve ver esta interação.' }
  return { ok: true, dados: { descricao, visivel_cliente: visivel, contato_id: visivel ? contato : null } }
}

/**
 * Motivo da exclusão lógica (D1 da 013: `excluido_motivo` obrigatório pelo check
 * `exclusao_com_motivo`). No Bubble a lixeira (WF bUEFh2) não pede nada (sac.md §7.7).
 */
export function validarMotivo(v: FormDataEntryValue | null): Validacao<string> {
  const m = texto(v).replace(/\s+/g, ' ')
  if (m.length < 3) return { ok: false, erro: 'Diga o motivo (pelo menos 3 letras).' }
  if (m.length > 500) return { ok: false, erro: 'O motivo passa de 500 caracteres.' }
  return { ok: true, dados: m }
}

/** Nome da campanha — WF bUDPr grava só `NomePesquisa` (sac.md §4.7). */
export function validarNomePesquisa(v: FormDataEntryValue | null): Validacao<string> {
  const n = texto(v).replace(/\s+/g, ' ')
  if (n.length < 2) return { ok: false, erro: 'Dê um título à pesquisa (pelo menos 2 letras).' }
  if (n.length > 150) return { ok: false, erro: 'O título passa de 150 caracteres.' }
  return { ok: true, dados: n }
}

// --------------------------------------------------------------------- apresentação

/**
 * `interval` do Postgres (saída padrão, ex.: "3 days 04:05:06.12", "1 day", "00:42:00") →
 * texto curto em português. Nulo = chamado não resolvido.
 */
export function formatarDuracao(intervalo: string | null | undefined): string {
  if (!intervalo) return '—'
  let dias = 0
  let resto = intervalo.trim()
  const md = /^(-?\d+) days?\s*/.exec(resto)
  if (md) {
    dias = Number(md[1])
    resto = resto.slice(md[0].length)
  }
  let horas = 0
  let minutos = 0
  const mh = /^(-?)(\d+):(\d{2}):(\d{2})/.exec(resto)
  if (mh) {
    horas = Number(mh[2])
    minutos = Number(mh[3])
    // Postgres pode trazer "25:00:00" num interval gerado por subtração (sem justify).
    dias += Math.floor(horas / 24)
    horas %= 24
  } else if (!md) {
    return '—'
  }
  if (dias === 0 && horas === 0) return minutos < 1 ? 'menos de 1 min' : `${minutos} min`
  const partes: string[] = []
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`)
  if (horas > 0) partes.push(`${horas} h`)
  if (dias === 0 && minutos > 0) partes.push(`${minutos} min`)
  return partes.join(' ')
}

/** Rótulo de entrega no protocolo: "Dt Prev / Qtd / Nf", como `dd entregas` (bUDKD0, §3.2). */
export function rotuloEntrega(e: {
  numero_entrega: string | null
  dt_prev_entrega: string | null
  qtd: string | number | null
  nf_fornecedor_numero: string | null
}): string {
  const data = e.dt_prev_entrega && DIA.test(e.dt_prev_entrega)
    ? e.dt_prev_entrega.split('-').reverse().join('/')
    : 'sem previsão'
  // qtd é numeric(14,3): string do banco, formatada sem passar por soma em float.
  let qtd = e.qtd === null || e.qtd === '' ? '—' : String(e.qtd)
  if (qtd.includes('.')) qtd = qtd.replace(/\.?0+$/, '')
  qtd = qtd.replace('.', ',')
  const nf = e.nf_fornecedor_numero ? `NF ${e.nf_fornecedor_numero}` : 'sem NF'
  const numero = e.numero_entrega ? `Entrega ${e.numero_entrega} · ` : ''
  return `${numero}${data} / ${qtd} / ${nf}`
}

/** NPS inteiro de `fn_nps` → texto com sinal ("+40", "-15", "0"). Nulo = sem resposta. */
export function formatarNps(nps: number | null | undefined): string {
  if (nps === null || nps === undefined || !Number.isFinite(nps)) return '—'
  return nps > 0 ? `+${nps}` : String(nps)
}

/** Média numeric(4,2) do banco ("8.50") → "8,5". Sem float na conta; só na formatação. */
export function formatarMedia(media: string | number | null | undefined): string {
  if (media === null || media === undefined || media === '') return '—'
  const s = String(media)
  if (!/^-?\d+(\.\d+)?$/.test(s)) return '—'
  return s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '').replace('.', ',')
}

// ------------------------------------------------------------------ link da pesquisa

const TOKEN = /^[A-Za-z0-9_-]{43}$/

/**
 * Caminho público da pesquisa para o token recém-emitido por `fn_pesquisa_emitir_token`
 * (formularios-publicos.md: `/formulario/<token>` (a rota pública publicada; a spec dizia /pesquisa)). Recusa o que não tem a forma de token —
 * nunca monta link com lixo, e nunca repete o token numa mensagem de erro.
 */
export function caminhoPesquisa(token: unknown): string | null {
  return typeof token === 'string' && TOKEN.test(token) ? `/formulario/${token}` : null
}

/** Situação do convite, na ordem em que a tela pergunta. */
export type SituacaoConvite = 'respondido' | 'cancelado' | 'expirado' | 'enviado' | 'nao_enviado'

export function situacaoConvite(
  c: { usado_em: string | null; cancelado_em: string | null; enviado_em: string | null; expira_em: string },
  agora = new Date(),
): SituacaoConvite {
  if (c.usado_em) return 'respondido'
  if (c.cancelado_em) return 'cancelado'
  if (!c.enviado_em) return 'nao_enviado'
  return new Date(c.expira_em).getTime() <= agora.getTime() ? 'expirado' : 'enviado'
}

const DATA_HORA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/**
 * timestamptz → "dd/mm/aa hh:mm" em São Paulo (fuso fixo, para servidor e navegador darem o
 * mesmo texto na hidratação — mesmo motivo de lib/datas.ts). A conversa do chamado precisa
 * da hora; `formatarData` só dá o dia.
 */
export function formatarDataHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? '—' : DATA_HORA.format(d).replace(',', '')
}
