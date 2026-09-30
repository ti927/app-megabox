/**
 * Contas de TELA dos relatórios da página metas (db/027): o banco devolve o agregado por mês e
 * vendedor (`fn_metas_relatorio_anual`) e por categoria e vendedor (`fn_metas_analise_entregas`);
 * aqui só se junta, filtra e divide para exibir — em decimal exato (BigInt em escala fixa, via
 * lib/metas), nunca em float (CLAUDE.md regra 10). Gráfico recebe `Number()` só para desenhar.
 *
 * Fórmulas: HTML C (`bUFCJ`) do export bruto do Bubble — citadas por função do JavaScript
 * original (`agregar`, `calcularMetaColetiva`, `renderKpis`, `renderPaineis`).
 */

import { deEscala, META_COLETIVA_PADRAO, metaColetiva, paraEscala, somarReais } from '@/lib/metas'

export const MESES = [
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
] as const
export const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const

export type Base = 'faturado' | 'fechado' | 'entregue'
export type ValorConsiderado = 'comissao' | 'venda_bruta' | 'venda_liquida'

export const ROTULO_BASE: Record<Base, string> = {
  faturado: 'Faturado / recebido',
  fechado: 'Fechado (pedido)',
  entregue: 'Entregue',
}
export const ROTULO_VALOR: Record<ValorConsiderado, string> = {
  comissao: 'Valor faturado (comissão MegaBox)',
  venda_bruta: 'Venda bruta',
  venda_liquida: 'Venda líquida',
}

/** Uma linha de `fn_metas_relatorio_anual` (numeric como texto). */
export type LinhaAnual = {
  mes: number
  vendedor_id: string | null
  fechado: string
  entregue: string
  cancelado: string
  faturado: string
  qtd_fechado: number
  qtd_entregue: number
  qtd_faturado: number
  meta: string
  com_megabox: string
  com_vendedor: string
  mes_encerrado: boolean
}

export type Celula = {
  fechado: string
  entregue: string
  cancelado: string
  faturado: string
  meta: string
  comMega: string
  comVend: string
  qtd: Record<Base, number>
}

const vazia = (): Celula => ({
  fechado: '0.00',
  entregue: '0.00',
  cancelado: '0.00',
  faturado: '0.00',
  meta: '0.00',
  comMega: '0.00',
  comVend: '0.00',
  qtd: { faturado: 0, fechado: 0, entregue: 0 },
})

function somarCelula(a: Celula, l: LinhaAnual): Celula {
  return {
    fechado: somarReais([a.fechado, l.fechado]),
    entregue: somarReais([a.entregue, l.entregue]),
    cancelado: somarReais([a.cancelado, l.cancelado]),
    faturado: somarReais([a.faturado, l.faturado]),
    meta: somarReais([a.meta, l.meta]),
    comMega: somarReais([a.comMega, l.com_megabox]),
    comVend: somarReais([a.comVend, l.com_vendedor]),
    qtd: {
      faturado: a.qtd.faturado + Number(l.qtd_faturado),
      fechado: a.qtd.fechado + Number(l.qtd_fechado),
      entregue: a.qtd.entregue + Number(l.qtd_entregue),
    },
  }
}

function somarCelulas(cs: Celula[]): Celula {
  return cs.reduce<Celula>(
    (a, c) =>
      somarCelula(a, {
        mes: 0,
        vendedor_id: null,
        fechado: c.fechado,
        entregue: c.entregue,
        cancelado: c.cancelado,
        faturado: c.faturado,
        qtd_fechado: c.qtd.fechado,
        qtd_entregue: c.qtd.entregue,
        qtd_faturado: c.qtd.faturado,
        meta: c.meta,
        com_megabox: c.comMega,
        com_vendedor: c.comVend,
        mes_encerrado: false,
      }),
    vazia(),
  )
}

export type LinhaVendedor = { id: string | null; meses: Celula[]; total: Celula }

export type Anual = {
  meses: Celula[]
  total: Celula
  vendedores: LinhaVendedor[]
  /** mês (0–11) usa o fechamento oficial (`origemMes = 'fechamento'`) */
  encerrado: boolean[]
}

/**
 * `agregar` do HTML C: séries mensais, matriz vendedor × mês e totais. O filtro de vendedor
 * vale para tudo (como `filtroVendedor`).
 */
export function agregarAnual(linhas: LinhaAnual[], vendedor: string | null = null): Anual {
  const doFiltro = vendedor ? linhas.filter((l) => l.vendedor_id === vendedor) : linhas
  const meses = Array.from({ length: 12 }, vazia)
  const encerrado = Array.from({ length: 12 }, () => false)
  const porVendedor = new Map<string, Celula[]>()
  for (const l of linhas) if (l.mes_encerrado && l.mes >= 1 && l.mes <= 12) encerrado[l.mes - 1] = true
  for (const l of doFiltro) {
    const i = l.mes - 1
    if (i < 0 || i > 11) continue
    meses[i] = somarCelula(meses[i]!, l)
    const chave = l.vendedor_id ?? ''
    const linha = porVendedor.get(chave) ?? Array.from({ length: 12 }, vazia)
    linha[i] = somarCelula(linha[i]!, l)
    porVendedor.set(chave, linha)
  }
  const vendedores = [...porVendedor.entries()].map(([id, ms]) => ({ id: id || null, meses: ms, total: somarCelulas(ms) }))
  return { meses, total: somarCelulas(meses), vendedores, encerrado }
}

/** Valor da célula na base escolhida. */
export const naBase = (c: Celula, base: Base): string => c[base]

// ------------------------------------------------------------------ meta coletiva

export type MetaDoMes = { valor: string; media: string; projetada: string; noPiso: boolean }

/**
 * `calcularMetaColetiva`: meta de cada mês = média dos 3 meses anteriores × 1,25, piso 80.000;
 * o faturamento de cada mês é a soma de TotalComissaoMegabox das metas fechadas do mês (de
 * TODOS os vendedores — o HTML não aplica o filtro de vendedor aqui). Janeiro puxa out–dez do
 * ano anterior. `valor` é a mesma conta de lib/metas `metaColetiva` (bTzgt0).
 */
export function metasColetivas(anual: LinhaAnual[], anterior: LinhaAnual[]): MetaDoMes[] {
  const mega = (ls: LinhaAnual[], mes: number) => somarReais(ls.filter((l) => l.mes === mes).map((l) => l.com_megabox))
  const serie = [
    ...Array.from({ length: 12 }, (_, i) => mega(anterior, i + 1)),
    ...Array.from({ length: 12 }, (_, i) => mega(anual, i + 1)),
  ]
  const piso = paraEscala(META_COLETIVA_PADRAO.piso, 2)!
  return Array.from({ length: 12 }, (_, mes) => {
    const tres = [serie[11 + mes]!, serie[10 + mes]!, serie[9 + mes]!]
    const soma = paraEscala(somarReais(tres), 2)!
    const media = dividir(soma, 3n)
    const projetada = dividir(soma * paraEscala(META_COLETIVA_PADRAO.multiplicador, 4)!, 30000n)
    return {
      valor: metaColetiva(tres),
      media: deEscala(media, 2),
      projetada: deEscala(projetada, 2),
      noPiso: projetada < piso,
    }
  })
}

/** a ÷ b (b > 0) arredondando meio para longe do zero — o `round` do Postgres. */
function dividir(a: bigint, b: bigint): bigint {
  const abs = a < 0n ? -a : a
  const q = (abs * 2n + b) / (b * 2n)
  return a < 0n ? -q : q
}

/** Média em reais dos valores > 0 (a "média dos meses com movimento" do HTML); null sem nenhum. */
export function mediaComMovimento(valores: string[]): string | null {
  const ativos = valores.map((v) => paraEscala(v, 2) ?? 0n).filter((v) => v > 0n)
  if (ativos.length === 0) return null
  return deEscala(dividir(ativos.reduce((a, b) => a + b, 0n), BigInt(ativos.length)), 2)
}

/** Médias por trimestre (`renderPaineis` / `renderTrimestres`). */
export function mediasTrimestrais(meses: Celula[], base: Base): (string | null)[] {
  return [0, 1, 2, 3].map((t) => mediaComMovimento(meses.slice(t * 3, t * 3 + 3).map((m) => m[base])))
}

/** Razão exata a ÷ b com 4 casas (para formatarPercentual); null com b ≤ 0. */
export function razao(a: string, b: string): string | null {
  const x = paraEscala(a, 2) ?? 0n
  const y = paraEscala(b, 2) ?? 0n
  if (y <= 0n) return null
  return deEscala(dividir(x * 10000n, y), 4)
}

/** Diferença a − b em reais, sem sair do decimal. */
export function subtrair(a: string, b: string): string {
  return deEscala((paraEscala(a, 2) ?? 0n) - (paraEscala(b, 2) ?? 0n), 2)
}

// ------------------------------------------------------------------ KPIs

export type Kpis = {
  faturado: string
  anterior: string | null
  variacao: string | null
  metaAcumulada: string
  pctMeta: string | null
  media: string
  mesesComMovimento: number
  comVend: string
  comMega: string
  emAberto: string
  fechado: string
  cancelado: string
  pctCancelado: string | null
}

/**
 * `renderKpis`. Meta acumulada = a coletiva só dos meses com movimento ou até o mês corrente
 * (ano corrente); ano encerrado soma todos.
 */
export function kpisAnuais(
  atual: Anual,
  anterior: Anual | null,
  metas: MetaDoMes[],
  base: Base,
  mesCorrente: number | null,
): Kpis {
  const faturado = atual.total[base]
  const comMovimento = atual.meses.filter((m) => (paraEscala(m[base], 2) ?? 0n) > 0n).length
  const media = deEscala(dividir(paraEscala(faturado, 2) ?? 0n, BigInt(Math.max(1, comMovimento))), 2)
  const metaAcumulada = somarReais(
    metas
      .filter((_, i) => mesCorrente === null || i <= mesCorrente || (paraEscala(atual.meses[i]![base], 2) ?? 0n) > 0n)
      .map((m) => m.valor),
  )
  const ant = anterior ? anterior.total[base] : null
  const antCent = ant ? (paraEscala(ant, 2) ?? 0n) : 0n
  const variacao = ant && antCent > 0n ? razao(subtrair(faturado, ant), ant) : null
  const emAbertoCent = (paraEscala(atual.total.fechado, 2) ?? 0n) - (paraEscala(atual.total.faturado, 2) ?? 0n)
  return {
    faturado,
    anterior: ant,
    variacao,
    metaAcumulada,
    pctMeta: razao(faturado, metaAcumulada),
    media,
    mesesComMovimento: comMovimento,
    comVend: atual.total.comVend,
    comMega: atual.total.comMega,
    emAberto: deEscala(emAbertoCent > 0n ? emAbertoCent : 0n, 2),
    fechado: atual.total.fechado,
    cancelado: atual.total.cancelado,
    pctCancelado: razao(atual.total.cancelado, somarReais([atual.total.fechado, atual.total.cancelado])),
  }
}

/** Origem do mês na tabela mensal (pílula da coluna "Origem"). */
export function origemDoMes(
  c: Celula,
  i: number,
  encerrado: boolean,
  mesCorrente: number | null,
): 'sem-lancamento' | 'andamento' | 'encerrado' | 'sem-fechamento' {
  const semDado = (paraEscala(c.fechado, 2) ?? 0n) === 0n && (paraEscala(c.faturado, 2) ?? 0n) === 0n
  if (semDado) return 'sem-lancamento'
  if (i === mesCorrente) return 'andamento'
  return encerrado ? 'encerrado' : 'sem-fechamento'
}

// ------------------------------------------------------------------ Análise de Entregas

export type Categoria = 'realizada' | 'andamento' | 'cancelada'
export type LinhaAnalise = {
  categoria: Categoria
  vendedor_id: string | null
  qtd: number
  valor_comissao: string
  valor_venda: string
}
export type GrupoAnalise = { vendedor_id: string | null; qtd: number; comissao: string }

/** `render` do HTML A: barras por vendedor, ordenadas pela contagem (desc), e os totais. */
export function agruparAnalise(linhas: LinhaAnalise[], categoria: Categoria) {
  const grupos: GrupoAnalise[] = linhas
    .filter((l) => l.categoria === categoria)
    .map((l) => ({ vendedor_id: l.vendedor_id, qtd: Number(l.qtd), comissao: somarReais([l.valor_comissao]) }))
    .sort((a, b) => b.qtd - a.qtd || (paraEscala(b.comissao, 2)! > paraEscala(a.comissao, 2)! ? 1 : -1))
  return {
    grupos,
    qtd: grupos.reduce((s, g) => s + g.qtd, 0),
    comissao: somarReais(grupos.map((g) => g.comissao)),
  }
}
