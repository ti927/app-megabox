/**
 * Regras puras da página `relatorios` (specs/paginas/relatorios.md; db/017_relatorios.sql).
 *
 * Sem acesso a banco. Toda SOMA é do banco (funções fn_rel_*): aqui só se lê a URL, se valida
 * o período, se POSICIONA o que já veio agregado (pivot sem soma) e se formata.
 */

export type Aba = 'cotacao' | 'prospeccao' | 'outros'
export type Modelo = 'produtos' | 'clientes' | 'fornecedores'
export type Medida = 'comissao' | 'venda' | 'qtd'
export type FiltroArquivado = 'sim' | 'nao' | null

export type FiltrosRelatorio = {
  aba: Aba
  modelo: Modelo
  /** 'AAAA-MM-DD'. Nomes da URL mantidos do Bubble: `datainicio`/`datafim` (spec §9.1). */
  inicio: string
  fim: string
  vendedor: string | null
  arquivado: FiltroArquivado
  medida: Medida
}

/** Teto de período — 017 D6 / relatorios [DÚVIDA 12]. A função SQL recusa o mesmo. */
export const MESES_MAXIMOS = 24

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATA = /^(\d{4})-(\d{2})-(\d{2})$/

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

/** 'AAAA-MM-DD' (já validado) → [ano, mês, dia]. */
function partes(data: string): [number, number, number] {
  const [a = 0, m = 1, d = 1] = data.split('-').map(Number)
  return [a, m, d]
}

/** 'AAAA-MM-DD' de um dia real (rejeita 2026-02-30), ou null. */
export function lerData(texto: string): string | null {
  const m = DATA.exec(texto)
  if (!m) return null
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const dt = new Date(Date.UTC(a, mes - 1, d))
  if (dt.getUTCFullYear() !== a || dt.getUTCMonth() !== mes - 1 || dt.getUTCDate() !== d) return null
  return texto
}

/** O dia de hoje em São Paulo, 'AAAA-MM-DD' — servidor (gru1) e navegador concordam. */
export function hojeSaoPaulo(agora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora)
  return partes
}

/** Primeiro e último dia do mês de `hoje` — o padrão do servidor (spec §9.1, [DÚVIDA 12]). */
export function mesDe(hoje: string): { inicio: string; fim: string } {
  const [a, m] = partes(hoje)
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const mm = String(m).padStart(2, '0')
  return { inicio: `${a}-${mm}-01`, fim: `${a}-${mm}-${String(ultimo).padStart(2, '0')}` }
}

/** null se o período vale; senão a mensagem para o usuário. Mesma regra de fn_rel_validar_periodo. */
export function problemaDoPeriodo(inicio: string, fim: string): string | null {
  if (fim < inicio) return 'A data final é anterior à inicial.'
  const [a, m, d] = partes(inicio)
  const teto = new Date(Date.UTC(a, m - 1 + MESES_MAXIMOS, d)).toISOString().slice(0, 10)
  if (fim >= teto) return `O período máximo é de ${MESES_MAXIMOS} meses.`
  return null
}

/**
 * searchParams → filtros. Valor desconhecido cai no padrão; período inválido volta para o mês
 * corrente e devolve o motivo em `aviso` (a tela mostra, nunca consulta a base inteira).
 */
export function lerFiltros(p: Params, hoje: string): { filtros: FiltrosRelatorio; aviso: string | null } {
  const aba = um(p, 'aba')
  const modelo = um(p, 'modelo')
  const medida = um(p, 'medida')
  const arquivado = um(p, 'arquivado')
  const vendedor = um(p, 'vendedor')
  const padrao = mesDe(hoje)

  let inicio = lerData(um(p, 'datainicio')) ?? padrao.inicio
  let fim = lerData(um(p, 'datafim')) ?? padrao.fim
  const aviso = problemaDoPeriodo(inicio, fim)
  if (aviso) ({ inicio, fim } = padrao)

  return {
    filtros: {
      aba: aba === 'cotacao' || aba === 'prospeccao' ? aba : 'outros',
      modelo: modelo === 'produtos' || modelo === 'fornecedores' ? modelo : 'clientes',
      inicio,
      fim,
      vendedor: UUID.test(vendedor) ? vendedor.toLowerCase() : null,
      arquivado: arquivado === 'sim' || arquivado === 'nao' ? arquivado : null,
      medida: medida === 'venda' || medida === 'qtd' ? medida : 'comissao',
    },
    aviso,
  }
}

/** Filtros → query string, omitindo os padrões. O período vai sempre: o link fica fiel. */
export function paraQuery(f: FiltrosRelatorio, mudancas: Partial<FiltrosRelatorio> = {}): string {
  const x = { ...f, ...mudancas }
  const p = new URLSearchParams()
  if (x.aba !== 'outros') p.set('aba', x.aba)
  if (x.modelo !== 'clientes') p.set('modelo', x.modelo)
  p.set('datainicio', x.inicio)
  p.set('datafim', x.fim)
  if (x.vendedor) p.set('vendedor', x.vendedor)
  if (x.arquivado) p.set('arquivado', x.arquivado)
  if (x.medida !== 'comissao') p.set('medida', x.medida)
  return `?${p.toString()}`
}

/** Limites em timestamptz do período, fuso de São Paulo (UTC-3, sem horário de verão desde 2019). */
export function limitesSaoPaulo(inicio: string, fim: string): { de: string; ate: string } {
  const [a, m, d] = partes(fim)
  const seguinte = new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10)
  return { de: `${inicio}T00:00:00-03:00`, ate: `${seguinte}T00:00:00-03:00` }
}

// ------------------------------------------------------------------- matriz por mês
/** Linha de fn_rel_entregas_cliente_mes / _fornecedor_mes. */
export type LinhaMes = {
  nivel: number // 0 célula · 1 total da linha · 2 total do mês · 3 total geral
  endereco_id: string | null
  nome: string | null
  uf: string | null
  mes: string | null
  qtd: string | number
  valor_venda_bruto: string | number
  valor_comissao: string | number
  qtd_entregas: number | string
}

export type Matriz = {
  meses: string[]
  linhas: { id: string; nome: string; uf: string; celulas: Record<string, LinhaMes>; total: LinhaMes | null }[]
  totaisMes: Record<string, LinhaMes>
  totalGeral: LinhaMes | null
}

/**
 * Posiciona as linhas agregadas pelo banco numa tabela cruzada. NÃO soma nada: os totais de
 * linha, de coluna e o geral já vêm do grouping sets (017). É o que substitui o parser de
 * `clientes-matrix-data` do bloco HTML (spec §2.5).
 */
export function montarMatriz(linhas: LinhaMes[]): Matriz {
  const meses = [...new Set(linhas.filter((l) => l.nivel === 0 && l.mes).map((l) => l.mes as string))].sort()
  const porId = new Map<string, Matriz['linhas'][number]>()
  const totaisMes: Record<string, LinhaMes> = {}
  let totalGeral: LinhaMes | null = null

  for (const l of linhas) {
    if (l.nivel === 3) {
      totalGeral = l
      continue
    }
    if (l.nivel === 2 && l.mes) {
      totaisMes[l.mes] = l
      continue
    }
    if (!l.endereco_id) continue
    let alvo = porId.get(l.endereco_id)
    if (!alvo) {
      alvo = { id: l.endereco_id, nome: l.nome ?? '—', uf: l.uf ?? '', celulas: {}, total: null }
      porId.set(l.endereco_id, alvo)
    }
    if (l.nivel === 0 && l.mes) alvo.celulas[l.mes] = l
    if (l.nivel === 1) alvo.total = l
  }

  const ordenadas = [...porId.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  return { meses, linhas: ordenadas, totaisMes, totalGeral }
}

/** O valor da medida escolhida numa linha agregada (string numeric, sem conversão). */
export function valorDaMedida(l: Pick<LinhaMes, 'qtd' | 'valor_venda_bruto' | 'valor_comissao'> | null | undefined, m: Medida) {
  if (!l) return null
  return m === 'qtd' ? l.qtd : m === 'venda' ? l.valor_venda_bruto : l.valor_comissao
}

// ------------------------------------------------------------------------- formatação
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** '2026-03-01' → 'mar/26', do texto, sem fuso. */
export function rotuloMes(mes: string): string {
  const m = DATA.exec(mes)
  return m ? `${MESES[Number(m[2]) - 1] ?? ''}/${(m[1] ?? '').slice(2)}` : mes
}

/** Fração do banco (0.3580) → '35,8%'. Nulo → '—'. */
export function formatarPercentual(fracao: string | number | null | undefined, casas = 1): string {
  if (fracao === null || fracao === undefined || fracao === '') return '—'
  const n = Number(fracao)
  if (!Number.isFinite(n)) return '—'
  return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n * 100)}%`
}

/** Contagem ou quantidade: até 3 casas, sem zeros à direita. */
export function formatarNumero(valor: string | number | null | undefined, casas = 3): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  const n = Number(valor)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: casas }).format(n)
}

// ------------------------------------------------------------------------------ CSV
/**
 * Linhas → CSV para Excel pt-BR: separador `;`, decimal com vírgula, BOM UTF-8. O valor
 * numeric chega como texto do banco e só troca o ponto pela vírgula — nunca vira float.
 */
export function paraCsv(cabecalho: string[], linhas: (string | number | null | undefined)[][]): string {
  const celula = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'number' ? String(v) : v
    const texto = /^-?\d+(\.\d+)?$/.test(s) ? s.replace('.', ',') : s
    return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
  }
  return '﻿' + [cabecalho, ...linhas].map((l) => l.map(celula).join(';')).join('\r\n') + '\r\n'
}
