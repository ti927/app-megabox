/**
 * Regras puras do painel inicial (`/inicio`): o período da matriz Fornecedor × mês e a montagem
 * da matriz a partir das linhas de `fn_inicio_comissoes_fornecedor_mes` (db/025).
 *
 * Fonte: specs/paginas/inicio-e-acesso.md §2.2 (filtros bUBFN/bUBFT), §3.2 e §5 (pivô), e as
 * dúvidas 7–9 da mesma spec. Sem acesso a banco: testado em lib/inicio.test.ts.
 */

import { lerData, mesDe, problemaDoPeriodo } from '@/lib/relatorios'

type Params = Record<string, string | string[] | undefined>

export type PeriodoInicio = { de: string; ate: string }

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

/**
 * `?de=&ate=` → período. Padrão = o do Bubble: do dia 1 ao último dia do mês corrente
 * (`Current Date/Time:change_date(1)` e `+1 mês, dia 1, −1 dia`). Período inválido, invertido
 * ou maior que 24 meses (a trava da função) volta ao padrão e devolve o motivo em `aviso`.
 */
export function lerPeriodo(p: Params, hoje: string): { periodo: PeriodoInicio; aviso: string | null } {
  const padrao = mesDe(hoje)
  const de = lerData(um(p, 'de'))
  const ate = lerData(um(p, 'ate'))
  if (!um(p, 'de') && !um(p, 'ate')) return { periodo: { de: padrao.inicio, ate: padrao.fim }, aviso: null }
  if (!de || !ate) return { periodo: { de: padrao.inicio, ate: padrao.fim }, aviso: 'Período incompleto: voltou ao mês atual.' }
  const problema = problemaDoPeriodo(de, ate)
  if (problema) return { periodo: { de: padrao.inicio, ate: padrao.fim }, aviso: `${problema} Voltou ao mês atual.` }
  return { periodo: { de, ate }, aviso: null }
}

const NOMES_MES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export type ColunaMes = { mes: string; rotulo: string }

/**
 * As colunas de mês. Intervalo dentro de um ano → as 12 colunas de janeiro a dezembro daquele
 * ano, como a `Table B` do Bubble. Intervalo que cruza o ano → uma coluna por mês do intervalo,
 * com o ano no rótulo (no Bubble janeiro de dois anos caía na mesma coluna — [DÚVIDA 8]).
 */
export function colunasDoPeriodo({ de, ate }: PeriodoInicio): ColunaMes[] {
  const [a0, m0] = de.split('-').map(Number) as [number, number]
  const [a1, m1] = ate.split('-').map(Number) as [number, number]
  const chave = (a: number, m: number) => `${a}-${String(m).padStart(2, '0')}-01`
  if (a0 === a1) return NOMES_MES.map((rotulo, i) => ({ mes: chave(a0, i + 1), rotulo }))
  const colunas: ColunaMes[] = []
  for (let a = a0, m = m0; a < a1 || (a === a1 && m <= m1); m === 12 ? ((a += 1), (m = 1)) : (m += 1)) {
    colunas.push({ mes: chave(a, m), rotulo: `${NOMES_MES[m - 1]?.slice(0, 3)}/${String(a).slice(2)}` })
  }
  return colunas
}

/** Uma linha de `fn_inicio_comissoes_fornecedor_mes`. `numeric` chega como número ou texto. */
export type LinhaInicio = {
  nivel: number
  endereco_id: string | null
  fornecedor: string | null
  mes: string | null
  valor_comissao: string | number
  qtd_entregas: number
}

export type MatrizInicio = {
  linhas: { id: string; fornecedor: string; celulas: Record<string, string>; total: string }[]
  totaisMes: Record<string, string>
  totalGeral: string | null
}

/**
 * Linhas do banco → matriz pronta para a tela. Nenhuma soma aqui: células e totais são os do
 * banco (025 D5); isto só indexa. Ordem das linhas = a do banco (nome do fornecedor).
 */
export function montarMatrizInicio(linhas: LinhaInicio[]): MatrizInicio {
  const porId = new Map<string, MatrizInicio['linhas'][number]>()
  const totaisMes: Record<string, string> = {}
  let totalGeral: string | null = null
  const linha = (id: string, fornecedor: string | null) => {
    let l = porId.get(id)
    if (!l) {
      l = { id, fornecedor: fornecedor ?? '—', celulas: {}, total: '0' }
      porId.set(id, l)
    }
    return l
  }
  for (const l of linhas) {
    const valor = String(l.valor_comissao)
    if (l.nivel === 0 && l.endereco_id && l.mes) linha(l.endereco_id, l.fornecedor).celulas[l.mes] = valor
    else if (l.nivel === 1 && l.endereco_id) linha(l.endereco_id, l.fornecedor).total = valor
    else if (l.nivel === 2 && l.mes) totaisMes[l.mes] = valor
    else if (l.nivel === 3) totalGeral = valor
  }
  return { linhas: [...porId.values()], totaisMes, totalGeral }
}
