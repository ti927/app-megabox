/**
 * Paginação da lista de /produtos, no servidor, como a de /cadastros (lib/clifor: 50 por
 * página, `?pagina=N`). Fica à parte de lib/produtos para não mexer nos filtros de lá: a
 * página é só mais um parâmetro que anda junto da query.
 */

import { POR_PAGINA } from '@/lib/clifor'

export const POR_PAGINA_PRODUTOS = POR_PAGINA

type Params = Record<string, string | string[] | undefined>

/** `?pagina=N` → N. Valor estranho vira 1 (entrada do usuário, nunca erro). */
export function lerPagina(p: Params): number {
  const bruto = p.pagina
  const n = Number((Array.isArray(bruto) ? bruto[0] : bruto)?.trim() ?? '')
  return Number.isInteger(n) && n > 1 && n < 100_000 ? n : 1
}

/** Acrescenta `pagina` a uma query já montada (`?q=...` ou ''). Página 1 é o padrão e some. */
export function comPagina(query: string, pagina: number): string {
  if (pagina <= 1) return query
  return `${query ? `${query}&` : '?'}pagina=${pagina}`
}
