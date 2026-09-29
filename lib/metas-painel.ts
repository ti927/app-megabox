/**
 * Regras puras do PAINEL de metas (pódio, ranking, cartão da equipe). Complementa
 * `lib/metas.ts`: aqui não há regra de negócio nova de dinheiro — só a razão exata para
 * anéis, a meta diária da equipe e a arrumação do que `v_ranking_metas` já devolve.
 *
 * Dinheiro e razão em DECIMAL EXATO (BigInt em escala fixa), nunca float (CLAUDE.md regra 10).
 */

import { deEscala, ehDataIso, paraEscala } from '@/lib/metas'

// ------------------------------------------------------------------ razão exata

/**
 * `numerador ÷ denominador` (reais em texto) → razão com 4 casas, truncada ("0.8412").
 * Basta para anel e rótulo com 1 casa de %. null se o denominador é zero/ausente.
 */
export function razaoExata(
  numerador: string | null | undefined,
  denominador: string | null | undefined,
): string | null {
  const den = paraEscala(denominador, 2)
  const num = paraEscala(numerador, 2)
  if (!den || num === null) return null
  return deEscala((num * 10000n) / den, 4)
}

// ------------------------------------------------------------------ dias úteis

function diaDaSemana(iso: string): number {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}

function somarDias(iso: string, n: number): string {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}

/** Dias de segunda a sexta entre duas datas ISO, inclusive. 0 se o intervalo é vazio/inválido. */
export function diasUteis(inicio: string, fim: string): number {
  if (!ehDataIso(inicio) || !ehDataIso(fim) || inicio > fim) return 0
  let n = 0
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) {
    const s = diaDaSemana(d)
    if (s !== 0 && s !== 6) n++
  }
  return n
}

/** Data de hoje ('AAAA-MM-DD') em São Paulo. */
export function hojeSaoPaulo(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(agora)
}

export type MetaDiaria =
  | { estado: 'aberta'; valor: string; dias: number }
  | { estado: 'atingida' }
  | { estado: 'encerrada' }
  | { estado: 'sem-meta' }

/**
 * Meta diária da equipe (metas [DÚVIDA 8], recomendação padrão: meta coletiva sobre os dias
 * úteis restantes do período). Lida como o que FALTA faturar por dia útil restante:
 * `(meta − faturado) ÷ dias úteis de max(hoje, início) até o fim`, ao centavo, arredondando
 * para cima (é um alvo: arredondar para baixo deixaria a meta por um centavo).
 * Meta já batida → 'atingida'; sem dia útil restante → 'encerrada'.
 */
export function metaDiaria(
  meta: string | null | undefined,
  faturado: string | null | undefined,
  inicio: string,
  fim: string,
  hoje: string,
): MetaDiaria {
  const m = paraEscala(meta, 2)
  if (!m || m <= 0n) return { estado: 'sem-meta' }
  const f = paraEscala(faturado, 2) ?? 0n
  const falta = m - f
  if (falta <= 0n) return { estado: 'atingida' }
  const dias = diasUteis(hoje > inicio ? hoje : inicio, fim)
  if (dias === 0) return { estado: 'encerrada' }
  const d = BigInt(dias)
  return { estado: 'aberta', valor: deEscala((falta + d - 1n) / d, 2), dias }
}

// ------------------------------------------------------------------ nomes

/** "Gabriella Oliveira Carvalho" → "Gabriella Carvalho" (pódio: primeiro + último nome). */
export function nomeCurto(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 2) return partes.join(' ')
  return `${partes[0]} ${partes[partes.length - 1]}`
}

/** Iniciais para quando não há foto: "Paulo Henrique Vieira" → "PV". */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0]!.charAt(0)
  const ultima = partes.length > 1 ? partes[partes.length - 1]!.charAt(0) : ''
  return (primeira + ultima).toUpperCase()
}

// ------------------------------------------------------------------ pódio e ranking

type ItemRanking = {
  meta_mensal_id: string
  tipo_meta_id: number
  competencia: string
  posicao: number
}

/**
 * Ranking na ordem de leitura: Regular antes de Substituição, competência mais recente
 * primeiro, e dentro de cada uma a POSIÇÃO QUE A VIEW CALCULOU (`v_ranking_metas`, 011 D2 —
 * o rank é da view; aqui só se ordena, nada é recalculado).
 */
export function ordenarRanking<T extends ItemRanking>(ranking: T[]): T[] {
  return [...ranking].sort(
    (a, b) =>
      a.tipo_meta_id - b.tipo_meta_id ||
      (a.competencia < b.competencia ? 1 : a.competencia > b.competencia ? -1 : 0) ||
      a.posicao - b.posicao ||
      (a.meta_mensal_id < b.meta_mensal_id ? -1 : 1),
  )
}

/**
 * Os 3 do pódio: os primeiros do ranking Regular da competência mais recente do período
 * (sem Regular, os de Substituição). O pódio do Bubble lê `specific_item(1|2|3)` da lista
 * ordenada; aqui a lista é a da view, então o empate da view (rank igual) aparece igual.
 */
export function montarPodio<T extends ItemRanking>(ranking: T[]): T[] {
  const ordenado = ordenarRanking(ranking)
  const primeiro = ordenado[0]
  if (!primeiro) return []
  return ordenado
    .filter((r) => r.tipo_meta_id === primeiro.tipo_meta_id && r.competencia === primeiro.competencia)
    .slice(0, 3)
}
