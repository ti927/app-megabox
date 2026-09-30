/**
 * Regras puras das abas "Relatórios" e "Pós-Venda" do SAC (sac.md §2.1, §3.4, §3.6, §9.1).
 *
 * As abas Chamados e Gestão NPS usam `lerFiltros` de lib/sac.ts; estas duas têm filtros
 * próprios e ficam num arquivo à parte. Sem acesso a banco: testado em lib/sac-paineis.test.ts.
 */

import { ehUuid } from '@/lib/clifor'
import { lerData, problemaDoPeriodo } from '@/lib/relatorios'

type Params = Record<string, string | string[] | undefined>

export type AbaSac = 'chamados' | 'relatorios' | 'nps' | 'posvenda'

/** A ordem do Bubble (`Group Nav Buttons` bUCux): Chamados, Relatórios, Gestão NPS, Pós-Venda. */
export const ABAS_SAC: { id: AbaSac; rotulo: string }[] = [
  { id: 'chamados', rotulo: 'Chamados' },
  { id: 'relatorios', rotulo: 'Relatórios' },
  { id: 'nps', rotulo: 'Gestão NPS' },
  { id: 'posvenda', rotulo: 'Pós-Venda' },
]

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

export function lerAba(p: Params): AbaSac {
  const a = um(p, 'aba')
  return a === 'relatorios' || a === 'nps' || a === 'posvenda' ? a : 'chamados'
}

/** `?aba=` de cada aba (Chamados é a raiz). */
export function hrefAba(aba: AbaSac): string {
  return aba === 'chamados' ? '/sac' : `/sac?aba=${aba}`
}

// ------------------------------------------------------------------------ relatórios

export type FiltrosRelatorioSac = { de: string; ate: string; responsavel: string | null }

/**
 * Padrão: os 12 meses até hoje (do dia 1 de 11 meses atrás até hoje). A spec sugeria o mês
 * corrente ([DÚVIDA 2]), mas o bloco que o Bubble mostra é uma série POR MÊS (HTML A, captura
 * sac-03): com um mês só ela vira um ponto. Registrado em specs/04-duvidas.md.
 */
export function periodoPadraoRelatorio(hoje: string): { de: string; ate: string } {
  const [a, m] = hoje.split('-').map(Number) as [number, number]
  const inicio = new Date(Date.UTC(a, m - 12, 1)).toISOString().slice(0, 10)
  return { de: inicio, ate: hoje }
}

export function lerFiltrosRelatorio(p: Params, hoje: string): { filtros: FiltrosRelatorioSac; aviso: string | null } {
  const padrao = periodoPadraoRelatorio(hoje)
  const responsavel = ehUuid(um(p, 'responsavel')) ? um(p, 'responsavel').toLowerCase() : null
  const brutoDe = um(p, 'de')
  const brutoAte = um(p, 'ate')
  if (!brutoDe && !brutoAte) return { filtros: { ...padrao, responsavel }, aviso: null }
  const de = lerData(brutoDe)
  const ate = lerData(brutoAte)
  if (!de || !ate) return { filtros: { ...padrao, responsavel }, aviso: 'Período incompleto: voltou aos últimos 12 meses.' }
  const problema = problemaDoPeriodo(de, ate)
  if (problema) return { filtros: { ...padrao, responsavel }, aviso: `${problema} Voltou aos últimos 12 meses.` }
  return { filtros: { de, ate, responsavel }, aviso: null }
}

export function queryRelatorio(f: FiltrosRelatorioSac, mudancas: Partial<FiltrosRelatorioSac> = {}): string {
  const x = { ...f, ...mudancas }
  const q = new URLSearchParams({ aba: 'relatorios', de: x.de, ate: x.ate })
  if (x.responsavel) q.set('responsavel', x.responsavel)
  return `?${q.toString()}`
}

/** Linha de contagem do painel (`fn_sac_indicadores`). */
export type ContagemSac = { id: number; nome: string; total: number }
export type MesSac = { mes: string; abertos: number; resolvidos: number; media_dias: number | string | null }
export type IndicadoresSac = {
  total: number
  abertos: number
  resolvidos: number
  media_dias: number | string | null
  mediana_dias: number | string | null
  por_tipo: ContagemSac[]
  por_status: ContagemSac[]
  por_prioridade: ContagemSac[]
  mensal: MesSac[]
}

/** Dias com 1 casa, vírgula decimal ("1,8 dia", "12,0 dias"). Nulo → "—". */
export function formatarDias(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  const texto = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)
  return `${texto} ${n >= 0 && n < 2 ? 'dia' : 'dias'}`
}

/** Fração do maior valor (0–1), para o comprimento da barra. Maior 0 → 0. */
export function proporcao(valor: number, maior: number): number {
  return maior > 0 ? Math.max(0, Math.min(1, valor / maior)) : 0
}

// ------------------------------------------------------------------------ pós-venda

export type FiltrosPosVenda = { q: string; vendedor: string | null; pagina: number }

export function lerFiltrosPosVenda(p: Params): FiltrosPosVenda {
  const pagina = Number(um(p, 'pagina'))
  return {
    q: um(p, 'q').slice(0, 100),
    vendedor: ehUuid(um(p, 'vendedor')) ? um(p, 'vendedor').toLowerCase() : null,
    pagina: Number.isInteger(pagina) && pagina > 1 && pagina < 100_000 ? pagina : 1,
  }
}

export function queryPosVenda(f: FiltrosPosVenda, mudancas: Partial<FiltrosPosVenda> = {}): string {
  const x = { ...f, ...mudancas }
  const q = new URLSearchParams({ aba: 'posvenda' })
  if (x.q) q.set('q', x.q)
  if (x.vendedor) q.set('vendedor', x.vendedor)
  if (x.pagina > 1) q.set('pagina', String(x.pagina))
  return `?${q.toString()}`
}
