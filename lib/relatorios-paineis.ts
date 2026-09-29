/**
 * Regras puras dos painéis de relatório com o conteúdo dos blocos HTML do Bubble
 * (db/021_relatorios_graficos.sql, R1–R9 e O1–O3).
 *
 * Nada aqui SOMA dinheiro: os agregados vêm do banco. O que mora aqui é o que o HTML fazia
 * depois da soma — escolher destaques, arredondar para exibir, posicionar colunas, ordenar
 * linhas já agregadas e ler/escrever os parâmetros extras da URL.
 */

type Params = Record<string, string | string[] | undefined>
type Num = string | number

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

// ------------------------------------------------------------------- tipos dos painéis
/** fn_rel_cotacao_painel (021 R1–R6). Dinheiro chega como texto (numeric exato). */
export type PainelCotacao = {
  kpis: {
    total: number
    em_cotacao: number
    virou_pedido: number
    arquivadas: number
    ativas: number
    pedidos_ativos: number
    taxa_conversao: number | null
    faturamento: string
    ticket_medio: string | null
    tempo_medio_dias: number | null
  }
  vendedores: VendedorCotacao[]
  motivos: { motivo_id: number | null; motivo: string; qtd: number }[]
  historico: { mes: number; ativas: number; pedidos: number; conversao: number }[]
}

export type VendedorCotacao = {
  vendedor_id: string | null
  nome: string
  total: number
  ativas: number
  pedidos: number
  conversao: number
  faturamento: string
}

/** fn_rel_prospeccao_painel (021 R7–R9). */
export type PainelProspeccao = {
  dias_uteis: number
  vendedores: VendedorProspeccao[]
  totais: { enviadas: number; clientes: number; carteira: number; cobertura: number; media_dia: number }
  diario: { dia: string; propostas: number }[]
}

export type VendedorProspeccao = {
  vendedor_id: string
  nome: string
  foto_path: string | null
  enviadas: number
  clientes: number
  carteira: number
  cobertura: number
  cobertura_propostas: number
  media_dia: number
}

// ------------------------------------------------------------------------ parâmetros
/** Filtros das colunas de "Outros relatórios" (HTML A/B) e a página da tabela de cotações. */
export type Extras = {
  pagina: number
  produto: string
  fornecedor: string
  uf: string
  cliente: string
}

export const EXTRAS_VAZIOS: Extras = { pagina: 1, produto: '', fornecedor: '', uf: '', cliente: '' }

const CHAVES: Record<Exclude<keyof Extras, 'pagina'>, string> = {
  produto: 'fprod',
  fornecedor: 'fforn',
  uf: 'fuf',
  cliente: 'fcli',
}

/** Texto de filtro: sem caractere de controle, no máximo 80. */
function textoFiltro(v: string): string {
  return v.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 80).trim()
}

export function lerExtras(p: Params): Extras {
  const n = Number(um(p, 'pagina'))
  return {
    pagina: Number.isInteger(n) && n > 1 && n <= 10_000 ? n : 1,
    produto: textoFiltro(um(p, CHAVES.produto)),
    fornecedor: textoFiltro(um(p, CHAVES.fornecedor)),
    uf: textoFiltro(um(p, CHAVES.uf)).slice(0, 2).toUpperCase(),
    cliente: textoFiltro(um(p, CHAVES.cliente)),
  }
}

/** Acrescenta os extras (sem os vazios) a uma query string `?a=b` já montada. */
export function comExtras(query: string, e: Partial<Extras>): string {
  const p = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
  if (e.pagina && e.pagina > 1) p.set('pagina', String(e.pagina))
  for (const [campo, chave] of Object.entries(CHAVES) as [keyof typeof CHAVES, string][]) {
    const v = e[campo]
    if (v) p.set(chave, v)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** 'AAAA-MM-DD' → mês e ano do painel (R1: o painel é de um mês). */
export function mesAnoDe(data: string): { ano: number; mes: number } {
  const [a = '2000', m = '1'] = data.split('-')
  return { ano: Number(a), mes: Number(m) }
}

/** Primeiro e último dia de um mês/ano, 'AAAA-MM-DD'. */
export function limitesDoMes(ano: number, mes: number): { inicio: string; fim: string } {
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  const mm = String(mes).padStart(2, '0')
  return { inicio: `${ano}-${mm}-01`, fim: `${ano}-${mm}-${String(ultimo).padStart(2, '0')}` }
}

/** Anos do select "Ano": do corrente para trás até 2020 (HTML C). */
export function anosDisponiveis(anoCorrente: number, desde = 2020): number[] {
  const anos: number[] = []
  for (let a = anoCorrente; a >= desde; a--) anos.push(a)
  return anos
}

export const MESES_NOME = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const
export const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const

// --------------------------------------------------------------------- apresentação
/** Fração → '36%' (o HTML arredonda a conversão para inteiro). Nulo → '—'. */
export function percentualInteiro(fracao: Num | null | undefined): string {
  if (fracao === null || fracao === undefined || fracao === '') return '—'
  const n = Number(fracao)
  return Number.isFinite(n) ? `${Math.round(n * 100)}%` : '—'
}

/** Fração → '36,4%' (uma casa, vírgula — `pct` do HTML C). */
export function percentualUmaCasa(fracao: Num | null | undefined): string {
  if (fracao === null || fracao === undefined || fracao === '') return '—'
  const n = Number(fracao)
  if (!Number.isFinite(n)) return '—'
  return `${(Math.round(n * 1000) / 10).toFixed(1).replace('.', ',')}%`
}

/** Parte ÷ todo em '12,5%' — só para rótulo de legenda (contagens inteiras, não dinheiro). */
export function participacao(parte: number, todo: number): string {
  return todo > 0 ? percentualUmaCasa(parte / todo) : '0,0%'
}

/**
 * "Conversão vs mês anterior" (R5): diferença em pontos percentuais entre os percentuais
 * INTEIROS dos dois meses, como o HTML (`cur.conv - prev.conv`, já arredondados).
 */
export function pontosPercentuais(atual: number, anterior: number): number {
  return Math.round(atual * 100) - Math.round(anterior * 100)
}

/** 'nubia alves de carvalho' → 'NA' (o `initials` do HTML D). */
export function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/).filter(Boolean)
  return (((p[0] ?? '?')[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase()
}

/** Primeiro e segundo nome (o mapa de vendedores do HTML C). */
export function nomeCurto(nome: string): string {
  const p = nome.trim().split(/\s+/).filter(Boolean)
  return p.length > 1 ? `${p[0]} ${p[1]}` : (p[0] ?? '—')
}

/** Faixa da barra de cobertura do HTML D: ≥ 70% verde, < 30% vermelho, senão azul. */
export function faixaCobertura(fracao: number): 'alta' | 'media' | 'baixa' {
  const pct = Math.round(fracao * 100)
  return pct >= 70 ? 'alta' : pct < 30 ? 'baixa' : 'media'
}

/** '1,9' — uma casa com vírgula (o `fmt(n, 1)` do HTML D). */
export function umaCasa(n: Num | null | undefined): string {
  if (n === null || n === undefined || n === '') return '—'
  const v = Number(n)
  return Number.isFinite(v) ? v.toFixed(1).replace('.', ',') : '—'
}

/** 'A', 'A +2', '—' — o `resumo` do HTML B para listas de fornecedores/clientes. */
export function resumoLista(lista: readonly string[]): string {
  if (lista.length === 0) return '—'
  if (lista.length === 1) return lista[0] ?? '—'
  return `${lista[0]} +${lista.length - 1}`
}

// ------------------------------------------------------------------------- destaques
/**
 * "Melhor Vendedor do Mês" (HTML C `renderMelhorVendedor`): maior faturamento (> 0), maior
 * volume de cotações e melhor conversão entre quem tem ao menos `minimo` cotações ativas (se
 * ninguém tem, entre todos). Empate: fica o primeiro da lista, como o sort estável do HTML.
 */
export function destaquesCotacao(vendedores: readonly VendedorCotacao[], minimo = 3) {
  const maior = <T,>(lista: readonly T[], chave: (x: T) => number): T | null =>
    lista.reduce<T | null>((melhor, x) => (melhor === null || chave(x) > chave(melhor) ? x : melhor), null)
  const comValor = vendedores.filter((v) => Number(v.faturamento) > 0)
  const elegiveis = vendedores.filter((v) => v.ativas >= minimo)
  return {
    faturamento: maior(comValor, (v) => Number(v.faturamento)),
    volume: maior(vendedores, (v) => v.total),
    conversao: maior(elegiveis.length ? elegiveis : vendedores, (v) => v.conversao),
  }
}

/** "Destaques do mês" (HTML D): mais enviadas, mais clientes, melhor cobertura (carteira > 0). */
export function destaquesProspeccao(vendedores: readonly VendedorProspeccao[]) {
  const maior = <T,>(lista: readonly T[], chave: (x: T) => number): T | null =>
    lista.reduce<T | null>((melhor, x) => (melhor === null || chave(x) > chave(melhor) ? x : melhor), null)
  return {
    enviadas: maior(vendedores, (v) => v.enviadas),
    clientes: maior(vendedores, (v) => v.clientes),
    cobertura: maior(
      vendedores.filter((v) => v.carteira > 0),
      (v) => v.cobertura,
    ),
  }
}

/** Pico do volume diário: o primeiro dia com o maior número (> 0), ou null. */
export function picoDiario(diario: readonly { dia: string; propostas: number }[]) {
  let pico: { dia: string; propostas: number } | null = null
  for (const d of diario) if (d.propostas > (pico?.propostas ?? 0)) pico = d
  return pico
}

// ----------------------------------------------------------------------- matriz e ordem
/** Meses do período, 'AAAA-MM-01' — a matriz mostra toda coluna, mesmo vazia (HTML A: 12 fixas). */
export function mesesDoPeriodo(inicio: string, fim: string): string[] {
  const [ai = 0, mi = 1] = inicio.split('-').map(Number)
  const [af = 0, mf = 1] = fim.split('-').map(Number)
  const meses: string[] = []
  let a = ai
  let m = mi
  while ((a < af || (a === af && m <= mf)) && meses.length < 60) {
    meses.push(`${a}-${String(m).padStart(2, '0')}-01`)
    m += 1
    if (m > 12) {
      m = 1
      a += 1
    }
  }
  return meses
}

export type Direcao = 'asc' | 'desc'

/**
 * Ordena linhas JÁ agregadas por uma chave (clicar no cabeçalho, HTML A/B). Número e texto
 * numérico do banco comparam como número; o resto em pt-BR. Estável; nulos vão para o fim.
 */
export function ordenarPor<T>(linhas: readonly T[], valor: (l: T) => unknown, dir: Direcao): T[] {
  const sinal = dir === 'asc' ? 1 : -1
  const numero = (v: unknown) =>
    typeof v === 'number' ? v : typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : null
  return linhas
    .map((l, i) => ({ l, i, v: valor(l) }))
    .sort((a, b) => {
      if (a.v === null || a.v === undefined) return b.v === null || b.v === undefined ? a.i - b.i : 1
      if (b.v === null || b.v === undefined) return -1
      const na = numero(a.v)
      const nb = numero(b.v)
      const c =
        na !== null && nb !== null ? na - nb : String(a.v).localeCompare(String(b.v), 'pt-BR', { sensitivity: 'base' })
      return c !== 0 ? c * sinal : a.i - b.i
    })
    .map((x) => x.l)
}

/** Total de páginas para `total` itens (mínimo 1). */
export function totalPaginas(total: number, porPagina: number): number {
  return Math.max(1, Math.ceil(total / porPagina))
}

/** Botões da paginação do HTML C: 1, última, e ±2 da atual; '…' onde pula. */
export function botoesPagina(atual: number, total: number): (number | '…')[] {
  const out: (number | '…')[] = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - atual) <= 2) out.push(p)
    else if (Math.abs(p - atual) === 3) out.push('…')
  }
  return out
}
