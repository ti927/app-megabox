/**
 * Regras puras do APOIO COMERCIAL no SAC — metas trimestrais (db/030; specs/paginas/sac.md,
 * seção "Apoio Comercial — metas trimestrais").
 *
 * Os números (percentuais, médias, notas) são calculados no banco (`fn_sac_apoio_indicadores`)
 * em numeric; aqui só lemos filtros, validamos formulários e formatamos. Nenhuma conta de nota
 * em float: pesos são somados em centésimos inteiros.
 */

import { ehUuid } from '@/lib/clifor'
import type { CelulaXlsx } from '@/lib/xlsx-simples'

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

function texto(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : ''
}

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erro: string }

// ------------------------------------------------------------------------ trimestre

export type Trimestre = { ano: number; trimestre: 1 | 2 | 3 | 4 }

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Trimestre de um dia 'AAAA-MM-DD'. */
export function trimestreDe(dia: string): Trimestre {
  const [a, m] = dia.split('-').map(Number) as [number, number]
  return { ano: a, trimestre: (Math.floor((m - 1) / 3) + 1) as Trimestre['trimestre'] }
}

/** '2026-3' (forma da URL). */
export function chaveTrimestre(t: Trimestre): string {
  return `${t.ano}-${t.trimestre}`
}

/** `?t=2026-3` → trimestre; inválido ou ausente → o de hoje. */
export function lerTrimestre(valor: string, hoje: string): Trimestre {
  const m = /^(\d{4})-([1-4])$/.exec(valor)
  if (m) {
    const ano = Number(m[1])
    if (ano >= 2000 && ano <= 2100) return { ano, trimestre: Number(m[2]) as Trimestre['trimestre'] }
  }
  return trimestreDe(hoje)
}

/** Primeiro e último dia do trimestre. */
export function limitesTrimestre(t: Trimestre): { de: string; ate: string } {
  const mesIni = (t.trimestre - 1) * 3 + 1
  const de = `${t.ano}-${String(mesIni).padStart(2, '0')}-01`
  const ate = new Date(Date.UTC(t.ano, mesIni + 2, 0)).toISOString().slice(0, 10)
  return { de, ate }
}

/** "3º tri/2026 (jul–set)". */
export function rotuloTrimestre(t: Trimestre, curto = false): string {
  const base = `${t.trimestre}º tri/${t.ano}`
  if (curto) return base
  const i = (t.trimestre - 1) * 3
  return `${base} (${MESES_CURTOS[i]}–${MESES_CURTOS[i + 2]})`
}

/** Os `n` trimestres até o de hoje, do mais recente para o mais antigo. */
export function trimestresRecentes(hoje: string, n = 8): Trimestre[] {
  const atual = trimestreDe(hoje)
  const lista: Trimestre[] = []
  let { ano, trimestre } = atual as { ano: number; trimestre: number }
  for (let i = 0; i < n; i++) {
    lista.push({ ano, trimestre: trimestre as Trimestre['trimestre'] })
    trimestre -= 1
    if (trimestre === 0) {
      trimestre = 4
      ano -= 1
    }
  }
  return lista
}

// ------------------------------------------------------------------------ filtros

export type FiltrosApoio = { t: Trimestre; responsavel: string | null }

export function lerFiltrosApoio(p: Params, hoje: string): FiltrosApoio {
  const r = um(p, 'responsavel')
  return { t: lerTrimestre(um(p, 't'), hoje), responsavel: ehUuid(r) ? r.toLowerCase() : null }
}

export function queryApoio(
  aba: 'apoio' | 'oportunidades',
  f: FiltrosApoio,
  mudancas: Partial<FiltrosApoio> = {},
): string {
  const x = { ...f, ...mudancas }
  const q = new URLSearchParams({ aba, t: chaveTrimestre(x.t) })
  if (x.responsavel) q.set('responsavel', x.responsavel)
  return `?${q.toString()}`
}

// ------------------------------------------------------------------------ listas fixas

export const CATEGORIAS = {
  novo_cliente: 'Novo cliente prospectado',
  inativo_recuperado: 'Cliente inativo recuperado',
  interesse: 'Demonstrou interesse',
  qualificada: 'Oportunidade qualificada',
} as const
export type Categoria = keyof typeof CATEGORIAS

export const RESULTADOS = {
  em_andamento: 'Em andamento',
  encaminhada: 'Encaminhada ao comercial',
  venda_fechada: 'Venda fechada (vendedor)',
  sem_interesse: 'Sem interesse',
} as const
export type Resultado = keyof typeof RESULTADOS

export const TIPOS_ACAO = {
  contato_cliente: { rotulo: 'Contato com cliente', padrao: 'Contato com o cliente sobre o andamento.' },
  cobranca_fornecedor: { rotulo: 'Cobrança ao fornecedor', padrao: 'Cobrança feita ao fornecedor.' },
  atualizacao_interna: { rotulo: 'Atualização interna', padrao: 'Atualização interna do chamado.' },
  retorno_cliente: { rotulo: 'Retorno ao cliente', padrao: 'Retorno dado ao cliente.' },
} as const
export type TipoAcao = keyof typeof TIPOS_ACAO

export function ehTipoAcao(v: unknown): v is TipoAcao {
  return typeof v === 'string' && Object.hasOwn(TIPOS_ACAO, v)
}
function ehCategoria(v: string): v is Categoria {
  return Object.hasOwn(CATEGORIAS, v)
}
function ehResultado(v: string): v is Resultado {
  return Object.hasOwn(RESULTADOS, v)
}

// ------------------------------------------------------------------------ validação

const DIA = /^(\d{4})-(\d{2})-(\d{2})$/

function diaValido(v: string): boolean {
  const m = DIA.exec(v)
  if (!m) return false
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const data = new Date(Date.UTC(a, mes - 1, d))
  return a >= 2000 && a <= 2100 && data.getUTCMonth() === mes - 1 && data.getUTCDate() === d
}

function diaOpcional(v: FormDataEntryValue | null): string | null | 'invalido' {
  const t = texto(v)
  if (t === '') return null
  return diaValido(t) ? t : 'invalido'
}

function uuidOpcional(v: FormDataEntryValue | null): string | null | 'invalido' {
  const t = texto(v)
  if (t === '') return null
  return ehUuid(t) ? t.toLowerCase() : 'invalido'
}

export type DadosAcompanhamento = {
  prazo_em: string | null
  depende_fornecedor: boolean
  motivo_pendencia: string | null
}

/** Os campos de acompanhamento da ficha do chamado (db/030 D2, D5). */
export function validarAcompanhamento(form: FormData): Validacao<DadosAcompanhamento> {
  const prazo = diaOpcional(form.get('prazo_em'))
  if (prazo === 'invalido') return { ok: false, erro: 'Prazo inválido.' }
  const motivo = texto(form.get('motivo_pendencia'))
  if (motivo.length > 2000) return { ok: false, erro: 'O motivo da pendência passa de 2.000 caracteres.' }
  return {
    ok: true,
    dados: {
      prazo_em: prazo,
      depende_fornecedor: form.get('depende_fornecedor') === 'on',
      motivo_pendencia: motivo || null,
    },
  }
}

/**
 * Ação registrada com tipo em 1 clique: o botão manda o tipo; o texto é opcional e, vazio,
 * vira a frase padrão do tipo (a interação continua append-only e com descrição, 013 D5).
 */
export function textoDaAcao(tipo: TipoAcao, descricao: string): string {
  const d = descricao.trim()
  return d === '' ? TIPOS_ACAO[tipo].padrao : d
}

export type DadosOportunidade = {
  grupo_clifor_id: string | null
  prospect_nome: string | null
  prospect_contato: string | null
  vendedor_id: string | null
  identificada_em: string
  apresentacao_em: string | null
  categoria: Categoria
  resultado: Resultado
  observacao: string | null
}

/** Cadastro rápido de oportunidade: cliente (ou prospect) → apresentação → resultado → vendedor. */
export function validarOportunidade(form: FormData, hoje: string): Validacao<DadosOportunidade> {
  const grupo = uuidOpcional(form.get('grupo_clifor_id'))
  if (grupo === 'invalido') return { ok: false, erro: 'Cliente inválido. Busque de novo.' }
  const prospect = texto(form.get('prospect_nome')).replace(/\s+/g, ' ')
  if (!grupo && prospect.length < 2) return { ok: false, erro: 'Escolha o cliente ou digite o nome do prospect.' }
  if (prospect.length > 200) return { ok: false, erro: 'O nome do prospect passa de 200 caracteres.' }
  const contato = texto(form.get('prospect_contato'))
  if (contato.length > 200) return { ok: false, erro: 'O contato passa de 200 caracteres.' }

  const categoria = texto(form.get('categoria'))
  if (!ehCategoria(categoria)) return { ok: false, erro: 'Escolha o tipo de oportunidade.' }
  const resultado = texto(form.get('resultado')) || 'em_andamento'
  if (!ehResultado(resultado)) return { ok: false, erro: 'Resultado inválido.' }

  const vendedor = uuidOpcional(form.get('vendedor_id'))
  if (vendedor === 'invalido') return { ok: false, erro: 'Vendedor inválido.' }
  if ((resultado === 'encaminhada' || resultado === 'venda_fechada') && !vendedor) {
    return { ok: false, erro: 'Diga para qual vendedor a oportunidade foi encaminhada.' }
  }

  const ident = diaOpcional(form.get('identificada_em'))
  if (ident === 'invalido') return { ok: false, erro: 'Data da oportunidade inválida.' }
  const identificada = ident ?? hoje
  if (identificada > hoje) return { ok: false, erro: 'A data da oportunidade não pode ser no futuro.' }
  const apres = diaOpcional(form.get('apresentacao_em'))
  if (apres === 'invalido') return { ok: false, erro: 'Data da apresentação inválida.' }
  if (apres && apres > hoje) return { ok: false, erro: 'A apresentação não pode ser no futuro.' }

  const obs = texto(form.get('observacao'))
  if (obs.length > 2000) return { ok: false, erro: 'A observação passa de 2.000 caracteres.' }

  return {
    ok: true,
    dados: {
      grupo_clifor_id: grupo,
      prospect_nome: grupo ? null : prospect,
      prospect_contato: contato || null,
      vendedor_id: vendedor,
      identificada_em: identificada,
      apresentacao_em: apres,
      categoria,
      resultado,
      observacao: obs || null,
    },
  }
}

/** Decimal pt-BR ou com ponto ("25", "9,5", "9.50") → centésimos inteiros. Nunca float. */
export function paraCentesimos(v: string): number | null {
  const t = v.trim().replace(',', '.')
  const m = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(t)
  if (!m) return null
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'))
}

function centesimosParaTexto(c: number): string {
  return `${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}`
}

export const CAMPOS_PESO = [
  'peso_pesquisa',
  'peso_avaliacao',
  'peso_oportunidades',
  'peso_prazo',
  'peso_parados',
  'peso_retorno',
] as const

export type DadosParametros = {
  peso_pesquisa: string
  meta_pesquisa_pct: string
  peso_avaliacao: string
  meta_avaliacao_media: string
  min_avaliacoes: number
  peso_oportunidades: string
  meta_oportunidades: number
  peso_prazo: string
  meta_prazo_pct: string
  peso_parados: string
  meta_parados: number
  peso_retorno: string
  meta_retorno_pct: string
  dias_sem_atualizacao: number
  prazo_padrao_dias: number
  nota_proporcional: boolean
}

function inteiro(v: FormDataEntryValue | null, min: number, max: number): number | null {
  const t = texto(v)
  if (!/^\d{1,4}$/.test(t)) return null
  const n = Number(t)
  return n >= min && n <= max ? n : null
}

/** Parâmetros do trimestre (db/030 D11). Pesos somam exatamente 100 (em centésimos). */
export function validarParametros(form: FormData): Validacao<DadosParametros> {
  const dec = (campo: string, max: number, nome: string): string | { erro: string } => {
    const c = paraCentesimos(texto(form.get(campo)))
    if (c === null || c > max * 100) return { erro: `${nome}: use um número de 0 a ${max} (até 2 casas).` }
    return centesimosParaTexto(c)
  }
  const campos: [keyof DadosParametros, number, string][] = [
    ['peso_pesquisa', 100, 'Peso da pesquisa'],
    ['meta_pesquisa_pct', 100, 'Meta de respostas'],
    ['peso_avaliacao', 100, 'Peso da avaliação'],
    ['meta_avaliacao_media', 10, 'Meta da média'],
    ['peso_oportunidades', 100, 'Peso das oportunidades'],
    ['peso_prazo', 100, 'Peso do prazo'],
    ['meta_prazo_pct', 100, 'Meta de resolvidas no prazo'],
    ['peso_parados', 100, 'Peso dos parados'],
    ['peso_retorno', 100, 'Peso do retorno'],
    ['meta_retorno_pct', 100, 'Meta de retorno ao cliente'],
  ]
  const lidos: Record<string, string> = {}
  for (const [campo, max, nome] of campos) {
    const r = dec(campo, max, nome)
    if (typeof r !== 'string') return { ok: false, erro: r.erro }
    lidos[campo] = r
  }
  const soma = CAMPOS_PESO.reduce((s, c) => s + paraCentesimos(lidos[c]!)!, 0)
  if (soma !== 10_000) {
    return { ok: false, erro: `Os pesos somam ${centesimosParaTexto(soma).replace('.', ',')}%: precisam somar 100%.` }
  }
  const min = inteiro(form.get('min_avaliacoes'), 0, 1000)
  if (min === null) return { ok: false, erro: 'Mínimo de avaliações: número inteiro de 0 a 1000.' }
  const metaOp = inteiro(form.get('meta_oportunidades'), 0, 10_000)
  if (metaOp === null) return { ok: false, erro: 'Meta de oportunidades: número inteiro.' }
  const metaPar = inteiro(form.get('meta_parados'), 0, 1000)
  if (metaPar === null) return { ok: false, erro: 'Meta de parados: número inteiro.' }
  const dias = inteiro(form.get('dias_sem_atualizacao'), 1, 60)
  if (dias === null) return { ok: false, erro: 'Dias sem atualização: de 1 a 60.' }
  const prazo = inteiro(form.get('prazo_padrao_dias'), 1, 90)
  if (prazo === null) return { ok: false, erro: 'Prazo padrão: de 1 a 90 dias.' }
  const s = (k: string) => lidos[k]!
  return {
    ok: true,
    dados: {
      peso_pesquisa: s('peso_pesquisa'),
      meta_pesquisa_pct: s('meta_pesquisa_pct'),
      peso_avaliacao: s('peso_avaliacao'),
      meta_avaliacao_media: s('meta_avaliacao_media'),
      peso_oportunidades: s('peso_oportunidades'),
      peso_prazo: s('peso_prazo'),
      meta_prazo_pct: s('meta_prazo_pct'),
      peso_parados: s('peso_parados'),
      peso_retorno: s('peso_retorno'),
      meta_retorno_pct: s('meta_retorno_pct'),
      min_avaliacoes: min,
      meta_oportunidades: metaOp,
      meta_parados: metaPar,
      dias_sem_atualizacao: dias,
      prazo_padrao_dias: prazo,
      nota_proporcional: form.get('nota_proporcional') === 'on',
    },
  }
}

// ------------------------------------------------------------------------ painel

type Num = number | string | null

export type IndicadorSimples = { peso: Num; meta: Num; realizado: Num; nota: Num; atingida: boolean }

export type IndicadoresApoio = {
  periodo: { ano: number; trimestre: number; de: string; ate: string; referencia: string; encerrado: boolean; responsavel: string | null }
  parametros: Record<string, Num | boolean> & { dias_sem_atualizacao: number; nota_proporcional: boolean }
  pesquisa: IndicadorSimples & { enviadas: number; respondidas: number; media: Num }
  avaliacao: IndicadorSimples & {
    minimo: number
    validas: number
    suficiente: boolean
    mensal: { mes: string; avaliacoes: number; media: Num }[]
  }
  oportunidades: IndicadorSimples & {
    por_categoria: Record<Categoria, number>
    por_resultado: Record<Resultado, number>
  }
  acompanhamento: {
    peso: Num
    nota: Num
    atingida: boolean
    dias_sem_atualizacao: number
    total: number
    resolvidas: number
    abertas: number
    parados: number
    com_retorno: number
    com_acoes_completas: number
    no_prazo: number
    acompanhadas: number
    fora_prazo: number
    em_andamento: number
    prazo: IndicadorSimples
    parados_ind: IndicadorSimples
    retorno: IndicadorSimples
  }
  total: Num
}

/** Número do banco → texto pt-BR com `casas` casas ("37,50"). Nulo → "—". */
export function formatarDecimal(v: Num | undefined, casas = 2): string {
  if (v === null || v === undefined || v === '') return '—'
  const s = String(v)
  if (!/^-?\d+(\.\d+)?$/.test(s)) return '—'
  const [inteira, frac = ''] = s.split('.') as [string, string?]
  // Arredondamento já foi feito no banco (numeric, 2 casas); aqui só completa ou corta zeros.
  const f = (frac + '0'.repeat(casas)).slice(0, casas)
  const milhar = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return casas > 0 ? `${milhar},${f}` : milhar
}

export function formatarPct(v: Num | undefined): string {
  const t = formatarDecimal(v)
  return t === '—' ? '—' : `${t}%`
}

export type LinhaRelatorio = {
  chave: string
  indicador: string
  peso: Num
  meta: string
  realizado: string
  nota: Num
  atingida: boolean
  sub?: boolean
  detalhe?: string
}

/** As linhas do relatório de avaliação (tela, impressão, Excel e CSV). */
export function linhasRelatorio(d: IndicadoresApoio): LinhaRelatorio[] {
  const a = d.acompanhamento
  return [
    {
      chave: 'pesquisa',
      indicador: 'Pesquisa de satisfação',
      peso: d.pesquisa.peso,
      meta: `≥ ${formatarPct(d.pesquisa.meta)} de respostas`,
      realizado: formatarPct(d.pesquisa.realizado),
      nota: d.pesquisa.nota,
      atingida: d.pesquisa.atingida,
      detalhe: `${d.pesquisa.respondidas} de ${d.pesquisa.enviadas} responderam · média ${formatarDecimal(d.pesquisa.media)}`,
    },
    {
      chave: 'avaliacao',
      indicador: 'Avaliação dos atendimentos',
      peso: d.avaliacao.peso,
      meta: `média ≥ ${formatarDecimal(d.avaliacao.meta)} (mín. ${d.avaliacao.minimo} avaliações)`,
      realizado: formatarDecimal(d.avaliacao.realizado),
      nota: d.avaliacao.nota,
      atingida: d.avaliacao.atingida,
      detalhe: `${d.avaliacao.validas} avaliações válidas${d.avaliacao.suficiente ? '' : ' — abaixo do mínimo'}`,
    },
    {
      chave: 'oportunidades',
      indicador: 'Novos clientes / oportunidades',
      peso: d.oportunidades.peso,
      meta: `≥ ${formatarDecimal(d.oportunidades.meta, 0)} no trimestre`,
      realizado: formatarDecimal(d.oportunidades.realizado, 0),
      nota: d.oportunidades.nota,
      atingida: d.oportunidades.atingida,
      detalhe: (Object.keys(CATEGORIAS) as Categoria[])
        .map((c) => `${d.oportunidades.por_categoria?.[c] ?? 0} ${CATEGORIAS[c].toLowerCase()}`)
        .join(' · '),
    },
    {
      chave: 'acompanhamento',
      indicador: 'Acompanhamento e resolução',
      peso: a.peso,
      meta: 'os três abaixo',
      realizado: `${a.total} ocorrências`,
      nota: a.nota,
      atingida: a.atingida,
      detalhe: `${a.resolvidas} resolvidas · ${a.abertas} abertas · ${a.com_acoes_completas} com todas as ações registradas`,
    },
    {
      chave: 'prazo',
      indicador: 'Resolvidas no prazo (ou acompanhadas)',
      peso: a.prazo.peso,
      meta: `≥ ${formatarPct(a.prazo.meta)}`,
      realizado: a.prazo.realizado === null ? 'sem vencidas' : formatarPct(a.prazo.realizado),
      nota: a.prazo.nota,
      atingida: a.prazo.atingida,
      sub: true,
      detalhe: `${a.no_prazo} no prazo · ${a.acompanhadas} atrasadas mas acompanhadas · ${a.fora_prazo} fora do prazo · ${a.em_andamento} ainda no prazo`,
    },
    {
      chave: 'parados',
      indicador: `Sem atualização há mais de ${a.dias_sem_atualizacao} dias`,
      peso: a.parados_ind.peso,
      meta: `= ${formatarDecimal(a.parados_ind.meta, 0)}`,
      realizado: formatarDecimal(a.parados_ind.realizado, 0),
      nota: a.parados_ind.nota,
      atingida: a.parados_ind.atingida,
      sub: true,
    },
    {
      chave: 'retorno',
      indicador: 'Retorno ao cliente registrado',
      peso: a.retorno.peso,
      meta: `≥ ${formatarPct(a.retorno.meta)}`,
      realizado: a.retorno.realizado === null ? 'sem resolvidas' : formatarPct(a.retorno.realizado),
      nota: a.retorno.nota,
      atingida: a.retorno.atingida,
      sub: true,
      detalhe: `${a.com_retorno} de ${a.total} com cliente informado`,
    },
  ]
}

function numeroCelula(v: Num): CelulaXlsx {
  return v === null || v === '' ? null : { numero: String(v) }
}

/** Planilha do relatório: cabeçalho de contexto + linhas + total. */
export function planilhaRelatorio(d: IndicadoresApoio, responsavel: string): CelulaXlsx[][] {
  const t = { ano: d.periodo.ano, trimestre: d.periodo.trimestre as Trimestre['trimestre'] }
  return [
    ['Relatório de avaliação — Apoio Comercial'],
    ['Trimestre', rotuloTrimestre(t)],
    ['Responsável', responsavel],
    ['Situação', d.periodo.encerrado ? 'trimestre encerrado' : 'parcial (trimestre em andamento)'],
    [],
    ['Indicador', 'Peso (%)', 'Meta', 'Realizado', 'Nota ponderada', 'Situação', 'Detalhe'],
    ...linhasRelatorio(d).map((l) => [
      l.sub ? `   ${l.indicador}` : l.indicador,
      numeroCelula(l.peso),
      l.meta,
      l.realizado,
      numeroCelula(l.nota),
      l.atingida ? 'Atingida' : 'Não atingida',
      l.detalhe ?? '',
    ]),
    ['Total', { numero: '100' }, '', '', numeroCelula(d.total), '', ''],
  ]
}

/** CSV (separador `;`, como o Excel em pt-BR abre) com BOM para acentos. */
export function paraCsv(linhas: CelulaXlsx[][]): string {
  const celula = (c: CelulaXlsx) => {
    const v = c === null || c === undefined ? '' : typeof c === 'string' ? c : c.numero.replace('.', ',')
    return /[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  }
  return '﻿' + linhas.map((l) => l.map(celula).join(';')).join('\r\n')
}
