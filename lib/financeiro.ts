/**
 * Regras puras da página `financeiro` (contas a receber, contas a pagar, baixa, cobrança).
 *
 * Sem acesso a banco, para serem testadas e reusadas pela tela e pelas server actions.
 * Fonte: specs/paginas/financeiro.md (citada por seção e WF do Bubble) e os cabeçalhos
 * D1..D14 de db/010_financeiro.sql.
 *
 * DINHEIRO (CLAUDE.md regra 10): o cálculo de verdade é do banco (saldo, status, rateio,
 * recibo). Aqui o dinheiro chega como STRING (`::text` no select) e só é somado, comparado ou
 * validado em CENTAVOS INTEIROS (BigInt) — nunca `Number`, nunca float. A soma dos cartões de
 * total ("Receber listado", "selecionado") é feita assim, em string exata.
 */

import { ehUuid } from '@/lib/clifor'

// ---------------------------------------------------------------------------- dinheiro

const DECIMAL = /^(-)?(\d+)(?:\.(\d{1,2}))?$/

/**
 * "1234.5" → 123450n. Só aceita o formato que o Postgres devolve para `numeric(14,2)::text`
 * (ou o que `lerValorExato` produz). Qualquer outra coisa é erro de programação: lança.
 */
export function paraCentavos(valor: string): bigint {
  const m = DECIMAL.exec(valor.trim())
  if (!m) throw new Error(`valor monetário inválido: "${valor}"`)
  const [, sinal, inteiro, frac = ''] = m
  const c = BigInt(inteiro!) * 100n + BigInt(frac.padEnd(2, '0'))
  return sinal ? -c : c
}

/** 123450n → "1234.50". */
export function deCentavos(c: bigint): string {
  const neg = c < 0n
  const abs = neg ? -c : c
  const inteiro = abs / 100n
  const frac = (abs % 100n).toString().padStart(2, '0')
  return `${neg ? '-' : ''}${inteiro}.${frac}`
}

/** Soma exata de valores `numeric` em string. Nulos e vazios contam zero. */
export function somarReais(valores: Iterable<string | null | undefined>): string {
  let total = 0n
  for (const v of valores) {
    if (v === null || v === undefined || v === '') continue
    total += paraCentavos(v)
  }
  return deCentavos(total)
}

/**
 * "1234567.8" → "R$ 1.234.567,80", direto do texto. `lib/dinheiro.formatarReais` passa por
 * `Number` (ok para exibir, mas aqui a regra é string → string de ponta a ponta).
 */
export function formatarReaisExato(valor: string | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  let c: bigint
  try {
    c = paraCentavos(valor)
  } catch {
    return '—'
  }
  const neg = c < 0n
  const [inteiro, frac] = deCentavos(neg ? -c : c).split('.') as [string, string]
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${neg ? '-' : ''}R$ ${milhar},${frac}`
}

/** Percentual guardado como fração com até 4 casas ("0.0300") → "3,00%", sem float. */
export function formatarPercentualExato(fracao: string | null | undefined): string {
  const m = fracao ? /^(\d+)(?:\.(\d{1,4}))?$/.exec(fracao.trim()) : null
  if (!m) return '—'
  const dezmil = BigInt(m[1]!) * 10000n + BigInt((m[2] ?? '').padEnd(4, '0')) // 0.0300 → 300
  return `${dezmil / 100n},${(dezmil % 100n).toString().padStart(2, '0')}%`
}

/** -1, 0 ou 1, como `localeCompare`, em centavos. */
export function compararReais(a: string, b: string): number {
  const x = paraCentavos(a)
  const y = paraCentavos(b)
  return x < y ? -1 : x > y ? 1 : 0
}

/**
 * Lê o que o usuário digitou (pt-BR) e devolve a string exata para o banco, SEM passar por
 * float — `lib/dinheiro.lerValorDigitado` usa `Number`, e aqui é dinheiro de baixa.
 *
 * Aceita "1.234,56", "1234,56", "1234.56", "R$ 1.234,5", "10". Recusa (null) mais de 2
 * casas, negativos e lixo. Com vírgula e ponto, o ponto é milhar; com só ponto seguido de 3
 * dígitos ("1.234") também é milhar — é assim que se digita no Brasil.
 */
export function lerValorExato(texto: string): string | null {
  const limpo = texto.replace(/R\$|\s/g, '')
  if (limpo === '' || /[^\d.,]/.test(limpo)) return null

  let inteiro: string
  let frac = ''
  if (limpo.includes(',')) {
    const partes = limpo.split(',')
    if (partes.length !== 2) return null
    inteiro = partes[0]!.replace(/\./g, '')
    frac = partes[1]!
    if (partes[0]!.includes('.') && !/^\d{1,3}(\.\d{3})+$/.test(partes[0]!)) return null
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    inteiro = limpo.replace(/\./g, '')
  } else {
    const partes = limpo.split('.')
    if (partes.length > 2) return null
    inteiro = partes[0]!
    frac = partes[1] ?? ''
  }
  if (!/^\d+$/.test(inteiro) || !/^\d{0,2}$/.test(frac)) return null
  return deCentavos(BigInt(inteiro) * 100n + BigInt(frac.padEnd(2, '0') || '0'))
}

export type ValidacaoValor = { ok: true; valor: string } | { ok: false; erro: string }

/**
 * Valor de uma baixa PARCIAL (D5: parcial deixa a conta em aberto com saldo): positivo e até o
 * saldo. O banco confere de novo (fn_baixa_antes, com a conta travada) — isto é a mensagem boa
 * antes da viagem.
 */
export function validarValorBaixa(texto: string, saldo: string): ValidacaoValor {
  const valor = lerValorExato(texto)
  if (valor === null) return { ok: false, erro: 'Valor inválido. Use o formato 1.234,56.' }
  if (paraCentavos(valor) <= 0n) return { ok: false, erro: 'O valor da baixa tem de ser maior que zero.' }
  if (compararReais(valor, saldo) > 0) {
    return { ok: false, erro: `O valor passa do saldo da conta (${deCentavos(paraCentavos(saldo)).replace('.', ',')}).` }
  }
  return { ok: true, valor }
}

// ------------------------------------------------------------------------------- datas

const DIA = /^\d{4}-\d{2}-\d{2}$/

/** YYYY-MM-DD de verdade (rejeita 2026-02-30). */
export function ehDia(valor: string): boolean {
  if (!DIA.test(valor)) return false
  const [a, m, d] = valor.split('-').map(Number) as [number, number, number]
  const data = new Date(Date.UTC(a, m - 1, d))
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d
}

const HOJE_SP = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Hoje em São Paulo, YYYY-MM-DD. */
export function hojeSP(agora = new Date()): string {
  return HOJE_SP.format(agora)
}

/**
 * Período padrão: o mês corrente, do dia 1 ao ÚLTIMO dia de verdade. O Bubble usa
 * `change_date(31)` (financeiro.md §5, WF bTpRf), que em mês curto transborda para o seguinte.
 */
export function mesCorrente(agora = new Date()): { de: string; ate: string } {
  const [a, m] = hojeSP(agora).split('-').map(Number) as [number, number]
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const mm = String(m).padStart(2, '0')
  return { de: `${a}-${mm}-01`, ate: `${a}-${mm}-${String(ultimo).padStart(2, '0')}` }
}

// ----------------------------------------------------------------------------- filtros

export type Aba = 'receber' | 'pagar' | 'entregas'

/**
 * Tipos de data do filtro (`Opt.TiposData`, financeiro.md §3.1) → coluna da view. "Data NF
 * Megabox" não entra: a data da NF mora na baixa (D6) e `v_contas_receber` não a expõe.
 */
export const TIPOS_DATA = {
  entrega: { rotulo: 'Data entrega', receber: 'dt_entrega', pagar: 'dt_entrega' },
  vencimento: { rotulo: 'Data vencimento', receber: 'dt_vencimento', pagar: 'dt_vencimento' },
  pedido: { rotulo: 'Data pedido', receber: 'dt_pedido', pagar: null },
  baixa: { rotulo: 'Data baixa sistema', receber: 'ultima_dt_baixa', pagar: 'ultima_dt_baixa' },
  credito: { rotulo: 'Data recebto banco', receber: 'ultima_dt_credito', pagar: null },
} as const

export type TipoData = keyof typeof TIPOS_DATA

/** A coluna de data do filtro para a aba; tipo que não existe na aba cai no vencimento. */
export function colunaData(tipo: TipoData, aba: 'receber' | 'pagar'): string {
  return TIPOS_DATA[tipo][aba] ?? 'dt_vencimento'
}

export type Situacao = '' | 'aberto' | 'quitado' | 'vencidas'

export type FiltrosFinanceiro = {
  aba: Aba
  /** `dtfiltro` do Bubble; padrão "Data entrega" (WF bTpRg) */
  data: TipoData
  de: string
  ate: string
  situacao: Situacao
  /** texto no nome do grupo cliente / fornecedor (autocomplete no Bubble) */
  cliente: string
  fornecedor: string
  vendedor: string | null
  pedido: string
  /** `dd arquivados` — só a receber */
  arquivados: boolean
  /** `filialfornecedor`: endereço de origem (filial do fornecedor), id */
  filial: string | null
  /** `fornecedornf`: NF do fornecedor CONTÉM o texto (§3.1) */
  nfFornecedor: string
  /** `megaboxnf`: NF MegaBox igual ao texto (§3.1) */
  nfMegabox: string
  /** `numcobranca`: número da cobrança (inteiro, só dígitos) */
  cobranca: string
  pagina: number
  /** conta aberta na ficha */
  sel: string | null
}

export const POR_PAGINA = 50
const MAX_PAGINA = 1000

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

/**
 * searchParams → filtros. Tudo que vem da URL é entrada do usuário: valor desconhecido cai no
 * padrão. Padrões do carregamento do Bubble (WF bTpRZ, financeiro.md §4.1): data de entrega,
 * lista a receber, mês corrente.
 */
export function lerFiltros(p: Params, agora = new Date()): FiltrosFinanceiro {
  const mes = mesCorrente(agora)
  let de = um(p, 'de')
  let ate = um(p, 'ate')
  if (!ehDia(de) || !ehDia(ate) || de > ate) {
    de = mes.de
    ate = mes.ate
  }
  const aba = um(p, 'aba')
  const data = um(p, 'data')
  const situacao = um(p, 'situacao')
  const vendedor = um(p, 'vendedor')
  const sel = um(p, 'sel')
  const filial = um(p, 'filial')
  const cobranca = um(p, 'cobranca')
  const pagina = Number(um(p, 'pag'))
  return {
    aba: aba === 'pagar' || aba === 'entregas' ? aba : 'receber',
    data: data in TIPOS_DATA ? (data as TipoData) : 'entrega',
    de,
    ate,
    situacao: situacao === 'aberto' || situacao === 'quitado' || situacao === 'vencidas' ? situacao : '',
    cliente: um(p, 'cliente').slice(0, 80),
    fornecedor: um(p, 'fornecedor').slice(0, 80),
    vendedor: ehUuid(vendedor) ? vendedor.toLowerCase() : null,
    pedido: um(p, 'pedido').slice(0, 30),
    arquivados: um(p, 'arquivados') === 'sim',
    filial: ehUuid(filial) ? filial.toLowerCase() : null,
    nfFornecedor: um(p, 'nffornecedor').slice(0, 40),
    nfMegabox: um(p, 'nfmegabox').slice(0, 40),
    cobranca: /^\d{1,9}$/.test(cobranca) ? String(Number(cobranca)) : '',
    pagina: Number.isInteger(pagina) && pagina > 1 && pagina <= MAX_PAGINA ? pagina : 1,
    sel: ehUuid(sel) ? sel.toLowerCase() : null,
  }
}

/** Filtros → query string, omitindo o padrão. Período vai sempre (link reproduzível). */
export function paraQuery(atual: FiltrosFinanceiro, mudancas: Partial<FiltrosFinanceiro> = {}): string {
  const f = { ...atual, ...mudancas }
  const q = new URLSearchParams()
  if (f.aba !== 'receber') q.set('aba', f.aba)
  if (f.data !== 'entrega') q.set('data', f.data)
  q.set('de', f.de)
  q.set('ate', f.ate)
  if (f.situacao) q.set('situacao', f.situacao)
  if (f.cliente) q.set('cliente', f.cliente)
  if (f.fornecedor) q.set('fornecedor', f.fornecedor)
  if (f.vendedor) q.set('vendedor', f.vendedor)
  if (f.pedido) q.set('pedido', f.pedido)
  if (f.arquivados) q.set('arquivados', 'sim')
  if (f.filial) q.set('filial', f.filial)
  if (f.nfFornecedor) q.set('nffornecedor', f.nfFornecedor)
  if (f.nfMegabox) q.set('nfmegabox', f.nfMegabox)
  if (f.cobranca) q.set('cobranca', f.cobranca)
  if (f.pagina > 1) q.set('pag', String(f.pagina))
  if (f.sel) q.set('sel', f.sel)
  const s = q.toString()
  return s ? `?${s}` : ''
}

/**
 * Filtros que `fn_resumo_financeiro` (db/020) não recebe: com algum deles ligado, o total do
 * recorte é somado na aplicação (em centavos, `somarReais`) a partir das mesmas linhas.
 */
export function temFiltroExtra(f: FiltrosFinanceiro): boolean {
  return f.filial !== null || f.nfFornecedor !== '' || f.nfMegabox !== '' || f.cobranca !== ''
}

/**
 * "Limpar Filtros" (WF bTpSc): zera todos os filtros e o tipo de data. O período fica — o
 * controle de período é um componente próprio da tela.
 */
export const FILTROS_LIMPOS = {
  data: 'entrega',
  situacao: '',
  cliente: '',
  fornecedor: '',
  vendedor: null,
  pedido: '',
  arquivados: false,
  filial: null,
  nfFornecedor: '',
  nfMegabox: '',
  cobranca: '',
  pagina: 1,
  sel: null,
} as const satisfies Partial<FiltrosFinanceiro>

/** Status de CR e CP são separados (D5): 1/2 a receber, 3/4 a pagar. */
export const STATUS = {
  receber: { aberto: 1, quitado: 2 },
  pagar: { aberto: 3, quitado: 4 },
} as const

// ------------------------------------------------------------------ resumo (db/020)

/** Argumentos de `fn_resumo_financeiro` (db/020). Nomes = parâmetros da função. */
export type ParametrosResumo = {
  p_aba: 'receber' | 'pagar'
  p_coluna_data: string | null
  p_de: string | null
  p_ate: string | null
  p_situacao: Situacao
  p_arquivados: boolean
  p_clientes: string[] | null
  p_fornecedores: string[] | null
  p_vendedor: string | null
  p_pedido: string | null
}

/**
 * Filtros da tela → argumentos da função de resumo. É o MESMO recorte da lista
 * (`consulta()` em app/(app)/financeiro/page.tsx): a soma e a contagem saem do banco, numa
 * consulta, em vez de a página percorrer o recorte em lotes de 1.000.
 * `ids` null = sem filtro de cliente/fornecedor.
 */
export function parametrosResumo(
  f: FiltrosFinanceiro,
  ids: { cliente: string[] | null; fornecedor: string[] | null },
): ParametrosResumo {
  const aba = f.aba === 'pagar' ? 'pagar' : 'receber'
  return {
    p_aba: aba,
    p_coluna_data: colunaData(f.data, aba),
    p_de: f.de,
    p_ate: f.ate,
    p_situacao: f.situacao,
    p_arquivados: f.arquivados,
    p_clientes: ids.cliente,
    p_fornecedores: ids.fornecedor,
    p_vendedor: f.vendedor,
    p_pedido: f.pedido || null,
  }
}

/**
 * Card "vencidos" (§3.4): ignora todos os filtros da tela, não conta arquivada (a receber)
 * nem cancelada.
 */
export function parametrosVencidos(aba: 'receber' | 'pagar'): ParametrosResumo {
  return {
    p_aba: aba,
    p_coluna_data: null,
    p_de: null,
    p_ate: null,
    p_situacao: 'vencidas',
    p_arquivados: false,
    p_clientes: null,
    p_fornecedores: null,
    p_vendedor: null,
    p_pedido: null,
  }
}

export type Resumo = { qtd: number; comissao: string; saldo: string }

/**
 * Linha devolvida pela função → resumo. O dinheiro vem como TEXTO (db/020 D8) e passa por
 * `somarReais` só para sair no formato exato de sempre ("1234.50"); valor fora do formato
 * (ou linha ausente) é `null` — a tela mostra a falha em vez de um total errado.
 */
export function lerResumo(linha: unknown): Resumo | null {
  if (!linha || typeof linha !== 'object') return null
  const { qtd, comissao, saldo } = linha as Record<string, unknown>
  if (typeof qtd !== 'number' || !Number.isInteger(qtd) || qtd < 0) return null
  if (typeof comissao !== 'string' || typeof saldo !== 'string') return null
  try {
    return { qtd, comissao: somarReais([comissao]), saldo: somarReais([saldo]) }
  } catch {
    return null
  }
}

/** Faixa do `range` do PostgREST para a página (0-based, inclusivo). */
export function faixa(pagina: number, porPagina = POR_PAGINA): { de: number; ate: number } {
  const de = (pagina - 1) * porPagina
  return { de, ate: de + porPagina - 1 }
}

export function totalPaginas(total: number, porPagina = POR_PAGINA): number {
  return Math.max(1, Math.ceil(total / porPagina))
}

// -------------------------------------------------------------------------- seleção

export type ContaSelecionada = { id: string; saldo: string; fornecedorId: string | null }

/**
 * O que a seleção permite. Baixa em lote: qualquer conta com saldo. Cobrança e recibo: um
 * fornecedor só (D14; financeiro.md §9.3 — hoje o Bubble não valida).
 */
export function resumoSelecao(sel: ContaSelecionada[]): {
  qtd: number
  saldo: string
  fornecedorUnico: string | null
} {
  const fornecedores = new Set(sel.map((s) => s.fornecedorId))
  const unico = fornecedores.size === 1 ? [...fornecedores][0]! : null
  return { qtd: sel.length, saldo: somarReais(sel.map((s) => s.saldo)), fornecedorUnico: unico }
}

/** Motivo de estorno: obrigatório (estornos.motivo_preenchido), 5 a 500 caracteres. */
export function validarMotivo(bruto: FormDataEntryValue | null): { ok: true; motivo: string } | { ok: false; erro: string } {
  const motivo = typeof bruto === 'string' ? bruto.trim() : ''
  if (motivo.length < 5) return { ok: false, erro: 'Escreva o motivo (pelo menos 5 caracteres).' }
  if (motivo.length > 500) return { ok: false, erro: 'Motivo longo demais (até 500 caracteres).' }
  return { ok: true, motivo }
}

/** Número de NF MegaBox: texto livre curto (bTpVQ `NumNfMegabox`). Vazio = nulo. */
export function lerNumeroNf(bruto: FormDataEntryValue | null): string | null {
  const t = typeof bruto === 'string' ? bruto.trim().slice(0, 40) : ''
  return t === '' ? null : t
}
