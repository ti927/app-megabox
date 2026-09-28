/**
 * Backoff e limite de tentativas da fila. PURO, para o vitest.
 *
 * `tentativas` já conta a tentativa que acabou de falhar (fn_email_pegar_lote incrementa ao
 * pegar). Atrasos fixos em vez de exponencial com jitter: a fila é pequena (dezenas por dia),
 * o que importa é previsibilidade para quem lê "próxima tentativa às 14:05".
 */

export const MAX_TENTATIVAS_PADRAO = 5

/** Atraso depois da 1ª, 2ª, 3ª, 4ª… falha. A última posição vale para as seguintes. */
export const ATRASOS_SEGUNDOS = [60, 5 * 60, 15 * 60, 60 * 60, 6 * 60 * 60] as const

export function atrasoAposFalha(tentativas: number): number {
  const i = Math.min(Math.max(tentativas, 1), ATRASOS_SEGUNDOS.length) - 1
  return ATRASOS_SEGUNDOS[i] ?? ATRASOS_SEGUNDOS[4]
}

export type DecisaoFalha =
  | { status: 'falhou' }
  | { status: 'pendente'; proximoEnvioEm: Date }

/**
 * Falha definitiva (endereço recusado, 4xx de validação) não é repetida; transitória é
 * reagendada até o limite.
 */
export function decidirAposFalha(p: {
  tentativas: number
  maxTentativas: number
  definitivo: boolean
  agora: Date
}): DecisaoFalha {
  if (p.definitivo || p.tentativas >= p.maxTentativas) return { status: 'falhou' }
  return {
    status: 'pendente',
    proximoEnvioEm: new Date(p.agora.getTime() + atrasoAposFalha(p.tentativas) * 1000),
  }
}
