/**
 * Colunas calculadas da lista de /cadastros (spec cadastros §3.2). Puro, sem I/O: a página
 * calcula no servidor e o vitest testa.
 */

const DIA_SP = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/** Data de calendário em São Paulo, em dias desde a época (para subtrair). */
function diaSP(d: Date): number {
  const [a, m, dia] = DIA_SP.format(d).split('-').map(Number)
  return Date.UTC(a!, m! - 1, dia!) / 86_400_000
}

/**
 * "Última conversa: N dias" — dias de CALENDÁRIO (fuso de São Paulo) desde
 * `grupos_clifor.ultimo_historico_em` (espelho da 012, era `UltimoHistoricoData`).
 * Nulo = nunca contatado. Data no futuro (relógio torto) conta como 0.
 */
export function diasDesde(iso: string | null | undefined, agora: Date): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return Math.max(0, diaSP(agora) - diaSP(d))
}

type Contagem = { count: number }[] | null | undefined

/**
 * "Anexos: N" da linha. O anexo tem UM dono (`anexos.dono_unico`, db/006): o grupo ou uma
 * filial dele — a cópia do Bubble ligou o de cliente à filial. A ficha lista os dois
 * (page.tsx, buscarAnexos); a contagem da lista soma os dois do mesmo jeito.
 */
export function contarAnexos(doGrupo: Contagem, dasFiliais: { anexos: Contagem }[] | null | undefined): number {
  const n = (c: Contagem) => c?.[0]?.count ?? 0
  return n(doGrupo) + (dasFiliais ?? []).reduce((soma, f) => soma + n(f.anexos), 0)
}
