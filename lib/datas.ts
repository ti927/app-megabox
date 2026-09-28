/**
 * Datas na apresentação. Fuso fixo de São Paulo: o servidor (gru1) e o navegador têm de
 * produzir o mesmo texto, senão a hidratação do React acusa diferença.
 */
const DATA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/**
 * Data do banco → dd/mm/aa (o formato do app atual).
 *
 * Aceita `timestamptz` e também `date` puro ('2026-08-31'). O segundo NÃO pode passar por
 * `new Date`: o JavaScript lê 'AAAA-MM-DD' como meia-noite em UTC, e no fuso de São Paulo isso
 * vira 21h do dia anterior — um vencimento 31/08 apareceria como 30/08. Por isso é formatado
 * direto do texto, sem fuso nenhum.
 */
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return '—'
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1].slice(2)}`
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? '—' : DATA.format(d)
}
