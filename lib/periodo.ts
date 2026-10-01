/**
 * Lógica pura do seletor de período (componentes/seletor-periodo.tsx).
 *
 * Datas são texto 'AAAA-MM-DD' (o mesmo formato dos parâmetros de URL das telas e de
 * <input type="date">). A aritmética é feita em UTC ao meio-dia de mentira — nunca em hora
 * local — para que nenhum fuso ou horário de verão empurre o dia. O único ponto que depende
 * de fuso é "hoje", e ele é sempre o de São Paulo (o servidor em gru1 e o navegador concordam).
 */

export type Iso = string
export type Mes = { ano: number; mes: number } // mes: 1–12

export type Atalho = 'hoje' | 'ontem' | '7dias' | '30dias' | 'mes' | 'mesPassado' | 'ano'

/** Ordem de exibição no painel ("Personalizado" vem por último, fora desta lista). */
export const ATALHOS: { id: Atalho; rotulo: string }[] = [
  { id: 'hoje', rotulo: 'Hoje' },
  { id: 'ontem', rotulo: 'Ontem' },
  { id: '7dias', rotulo: 'Últimos 7 dias' },
  { id: '30dias', rotulo: 'Últimos 30 dias' },
  { id: 'mes', rotulo: 'Este mês' },
  { id: 'mesPassado', rotulo: 'Mês passado' },
  { id: 'ano', rotulo: 'Este ano' },
]

/** Quando dois atalhos dão o mesmo intervalo, o de calendário vence (setembro = "Este mês"). */
const PREFERENCIA: Atalho[] = ['mes', 'mesPassado', 'ano', 'hoje', 'ontem', '7dias', '30dias']

export const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]
/** Semana começa na segunda. */
export const DIAS_CURTOS = ['seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.', 'dom.']
export const DIAS_LONGOS = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo']

const HOJE_SP = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function hojeEmSaoPaulo(agora: Date = new Date()): Iso {
  return HOJE_SP.format(agora) // en-CA já sai AAAA-MM-DD
}

const dois = (n: number) => String(n).padStart(2, '0')

export function iso(ano: number, mes: number, dia: number): Iso {
  return `${String(ano).padStart(4, '0')}-${dois(mes)}-${dois(dia)}`
}

export function partes(d: Iso): { ano: number; mes: number; dia: number } {
  const [a, m, di] = d.split('-').map(Number)
  return { ano: a!, mes: m!, dia: di! }
}

export function isoValida(d: string | null | undefined): d is Iso {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false
  const { ano, mes, dia } = partes(d)
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasNoMes(ano, mes)
}

export function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

function paraUtc(d: Iso): Date {
  const { ano, mes, dia } = partes(d)
  return new Date(Date.UTC(ano, mes - 1, dia))
}
function deUtc(x: Date): Iso {
  return iso(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate())
}

export function somarDias(d: Iso, n: number): Iso {
  const x = paraUtc(d)
  x.setUTCDate(x.getUTCDate() + n)
  return deUtc(x)
}

export function somarMeses(m: Mes, n: number): Mes {
  const total = m.ano * 12 + (m.mes - 1) + n
  return { ano: Math.floor(total / 12), mes: (total % 12) + 1 }
}

export function mesDe(d: Iso): Mes {
  const { ano, mes } = partes(d)
  return { ano, mes }
}

export function primeiroDia(m: Mes): Iso {
  return iso(m.ano, m.mes, 1)
}
export function ultimoDia(m: Mes): Iso {
  return iso(m.ano, m.mes, diasNoMes(m.ano, m.mes))
}

/** 0 = segunda … 6 = domingo. */
export function diaDaSemana(d: Iso): number {
  return (paraUtc(d).getUTCDay() + 6) % 7
}

/** Semanas do mês (segunda a domingo); dias de fora do mês são null. */
export function gradeDoMes(m: Mes): (Iso | null)[][] {
  const total = diasNoMes(m.ano, m.mes)
  const vazios = diaDaSemana(primeiroDia(m))
  const celulas: (Iso | null)[] = Array.from({ length: vazios }, () => null)
  for (let dia = 1; dia <= total; dia++) celulas.push(iso(m.ano, m.mes, dia))
  while (celulas.length % 7) celulas.push(null)
  const semanas: (Iso | null)[][] = []
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7))
  return semanas
}

export function intervaloDoAtalho(a: Atalho, hoje: Iso): { de: Iso; ate: Iso } {
  const mes = mesDe(hoje)
  switch (a) {
    case 'hoje':
      return { de: hoje, ate: hoje }
    case 'ontem': {
      const d = somarDias(hoje, -1)
      return { de: d, ate: d }
    }
    case '7dias':
      return { de: somarDias(hoje, -6), ate: hoje }
    case '30dias':
      return { de: somarDias(hoje, -29), ate: hoje }
    case 'mes':
      return { de: primeiroDia(mes), ate: ultimoDia(mes) }
    case 'mesPassado': {
      const p = somarMeses(mes, -1)
      return { de: primeiroDia(p), ate: ultimoDia(p) }
    }
    case 'ano':
      return { de: iso(mes.ano, 1, 1), ate: iso(mes.ano, 12, 31) }
  }
}

export function atalhoDoIntervalo(de: string, ate: string, hoje: Iso): Atalho | 'personalizado' {
  if (!isoValida(de) || !isoValida(ate)) return 'personalizado'
  for (const a of PREFERENCIA) {
    const i = intervaloDoAtalho(a, hoje)
    if (i.de === de && i.ate === ate) return a
  }
  return 'personalizado'
}

export type Selecao = { de: string; ate: string; esperandoFim: boolean }

/** Clique num dia: o primeiro marca o início, o segundo o fim (a ordem se acerta sozinha). */
export function escolherDia(s: Selecao, dia: Iso): Selecao {
  if (!s.esperandoFim || !isoValida(s.de)) return { de: dia, ate: '', esperandoFim: true }
  return dia < s.de ? { de: dia, ate: s.de, esperandoFim: false } : { de: s.de, ate: dia, esperandoFim: false }
}

export function formatarData(d: string): string {
  if (!isoValida(d)) return ''
  const { ano, mes, dia } = partes(d)
  return `${dois(dia)}/${dois(mes)}/${ano}`
}

export function formatarPeriodo(de: string, ate: string): string {
  if (!isoValida(de) && !isoValida(ate)) return ''
  return `${formatarData(de) || '…'} - ${formatarData(ate) || '…'}`
}

export function nomeDoMes(m: Mes): string {
  return `${MESES[m.mes - 1]} ${m.ano}`
}

/** "terça-feira, 1 de setembro de 2026" — nome do dia para leitor de tela. */
export function nomeDoDia(d: Iso): string {
  const { ano, mes, dia } = partes(d)
  return `${DIAS_LONGOS[diaDaSemana(d)]}, ${dia} de ${MESES[mes - 1]} de ${ano}`
}

/** Um mês é "antes" de outro? Comparação por número (ano*12+mes). */
export function indiceMes(m: Mes): number {
  return m.ano * 12 + m.mes
}
