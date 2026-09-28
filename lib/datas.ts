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

/** timestamptz do banco → dd/mm/aa (o formato do app atual). */
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return '—'
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? '—' : DATA.format(d)
}
