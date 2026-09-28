import { createHash, timingSafeEqual } from 'node:crypto'

/** Tamanho mínimo do FILA_EMAIL_SEGREDO. Menor que isso a rota fica desligada (falha fechada). */
export const SEGREDO_MIN = 32

/**
 * Compara o segredo recebido com o esperado em tempo constante. Os dois passam por SHA-256
 * antes: `timingSafeEqual` exige o mesmo tamanho, e comparar o tamanho primeiro vazaria o
 * tamanho do segredo.
 */
export function segredoConfere(recebido: string | null | undefined, esperado: string): boolean {
  if (!recebido || esperado.length < SEGREDO_MIN) return false
  const a = createHash('sha256').update(recebido, 'utf8').digest()
  const b = createHash('sha256').update(esperado, 'utf8').digest()
  return timingSafeEqual(a, b)
}

/** "Bearer xyz" → "xyz". Vercel Cron manda `Authorization: Bearer ${CRON_SECRET}`. */
export function tokenBearer(cabecalho: string | null): string | null {
  const m = cabecalho?.match(/^Bearer\s+(\S+)\s*$/i)
  return m?.[1] ?? null
}
