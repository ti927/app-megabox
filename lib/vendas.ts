/**
 * Regras puras da página `vendas` (kanban cotação → pedido → entregas).
 *
 * Sem acesso a banco, para serem testadas e reusadas pela tela e pelas server actions.
 * Fonte de cada regra: specs/paginas/vendas.md, citada por seção e por WF do Bubble.
 *
 * DINHEIRO (CLAUDE.md regra 10): o cálculo é do banco (colunas geradas e
 * v_orcamento_valores, db/007). Aqui o dinheiro chega como STRING (o select usa `::text`)
 * e só é somado ou comparado em inteiro (BigInt), nunca em float.
 */

import type { UsuarioAtual } from '@/lib/autorizacao'

// ------------------------------------------------------------------------- etapas

/**
 * Ids fixos de `etapas` (seed da 003, `on conflict (id)`). ARMADILHA do de-para: a chave
 * `pedido` é "Pedir" (2) e `pedido0` é "Pedido" (3). Aqui tudo é pelo ID; o rótulo exibido
 * vem da tabela, nunca daqui.
 */
export const ETAPA = {
  COTACAO: 1,
  PEDIR: 2,
  PEDIDO: 3,
  EM_ENTREGA: 4,
  FINANCEIRO: 5,
  CONCLUIDO: 6,
  CANCELADO: 7,
} as const

/** `etapas.concluida` (Financeiro, Concluído, Cancelado) — o que tira o cartão do fluxo. */
export const ETAPAS_CONCLUIDAS: readonly number[] = [ETAPA.FINANCEIRO, ETAPA.CONCLUIDO, ETAPA.CANCELADO]

/** `perfis.id` do Diretor (hierarquia 1). */
const DIRETOR = 1

// ------------------------------------------------------------------------ filtros

export type Coluna = 'cot' | 'ped' | 'ent' | 'sub'
export type Aba = 'cotacao' | 'propostas' | 'pedidos'

export type FiltrosVendas = {
  /** período, YYYY-MM-DD, inclusivo nas duas pontas */
  de: string
  ate: string
  vendedor: string | null
  /** "Número pedido": nº da cotação, do pedido ou da entrega (spec §2.2 `numeropedido`) */
  numero: string
  cliente: string
  arquivadas: boolean
  expandir: boolean
  concluidos: boolean
  cancelados: boolean
  /** quantas "páginas" de cartões cada coluna mostra (limite no SERVIDOR) */
  lim: Record<Coluna, number>
  /** cotação aberta na ficha */
  sel: string | null
  aba: Aba
}

/** Cartões por "página" de coluna. O Bubble carrega a coluna inteira (134 cotações no mês). */
export const POR_COLUNA = 25
const MAX_PAGINAS = 20

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DIA = /^\d{4}-\d{2}-\d{2}$/

export function ehUuid(valor: unknown): valor is string {
  return typeof valor === 'string' && UUID.test(valor)
}

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
 * Mês corrente: dia 1 até o ÚLTIMO dia do mês. O Bubble usa `change_date(31)`, e em
 * meses curtos o fim transborda para o mês seguinte (fevereiro termina em 3/mar —
 * spec §5.7 [bug]). Aqui o fim é o último dia de verdade.
 */
export function mesCorrente(agora = new Date()): { de: string; ate: string } {
  const [a, m] = hojeSP(agora).split('-').map(Number) as [number, number]
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const mm = String(m).padStart(2, '0')
  return { de: `${a}-${mm}-01`, ate: `${a}-${mm}-${String(ultimo).padStart(2, '0')}` }
}

/**
 * Período → intervalo de timestamptz para filtrar `criado_em`: [de 00:00, ate+1 00:00) em
 * São Paulo. O Brasil não tem horário de verão desde 2019, então o fuso é fixo -03:00.
 */
export function intervaloCriacao(de: string, ate: string): { desde: string; antes: string } {
  const [a, m, d] = ate.split('-').map(Number) as [number, number, number]
  const seguinte = new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10)
  return { desde: `${de}T00:00:00-03:00`, antes: `${seguinte}T00:00:00-03:00` }
}

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

function paginas(p: Params, chave: string): number {
  const n = Number(um(p, chave))
  return Number.isInteger(n) && n > 1 && n <= MAX_PAGINAS ? n : 1
}

/**
 * searchParams → filtros. Tudo que vem da URL é entrada do usuário: valor desconhecido cai
 * no padrão. Os padrões são os do carregamento do Bubble (WF bTKAD, spec §2.2), com o
 * período corrigido: URL quando existe, senão o mês corrente (spec §4.1).
 */
export function lerFiltros(p: Params, agora = new Date()): FiltrosVendas {
  const mes = mesCorrente(agora)
  let de = um(p, 'de')
  let ate = um(p, 'ate')
  if (!ehDia(de) || !ehDia(ate) || de > ate) {
    de = mes.de
    ate = mes.ate
  }
  const vendedor = um(p, 'vendedor')
  const sel = um(p, 'sel')
  const aba = um(p, 'aba')
  return {
    de,
    ate,
    vendedor: ehUuid(vendedor) ? vendedor.toLowerCase() : null,
    // Os números do app são inteiros (cotação) ou texto de dígitos (pedido/entrega).
    numero: um(p, 'numero').replace(/\D/g, '').slice(0, 12),
    cliente: um(p, 'cliente').slice(0, 100),
    arquivadas: um(p, 'arquivadas') === '1',
    expandir: um(p, 'expandir') === '1',
    concluidos: um(p, 'concluidos') === '1',
    cancelados: um(p, 'cancelados') === '1',
    lim: { cot: paginas(p, 'lc'), ped: paginas(p, 'lp'), ent: paginas(p, 'le'), sub: paginas(p, 'ls') },
    sel: ehUuid(sel) ? sel.toLowerCase() : null,
    aba: aba === 'propostas' || aba === 'pedidos' ? aba : 'cotacao',
  }
}

const CHAVE_LIM: Record<Coluna, string> = { cot: 'lc', ped: 'lp', ent: 'le', sub: 'ls' }

/** Filtros → query string, omitindo o padrão. `mudancas` sobrescreve `atual`. */
export function paraQuery(
  atual: FiltrosVendas,
  mudancas: Partial<FiltrosVendas> = {},
  agora = new Date(),
): string {
  const f = { ...atual, ...mudancas }
  const mes = mesCorrente(agora)
  const q = new URLSearchParams()
  if (f.de !== mes.de || f.ate !== mes.ate) {
    q.set('de', f.de)
    q.set('ate', f.ate)
  }
  if (f.vendedor) q.set('vendedor', f.vendedor)
  if (f.numero) q.set('numero', f.numero)
  if (f.cliente) q.set('cliente', f.cliente)
  if (f.arquivadas) q.set('arquivadas', '1')
  if (f.expandir) q.set('expandir', '1')
  if (f.concluidos) q.set('concluidos', '1')
  if (f.cancelados) q.set('cancelados', '1')
  for (const c of Object.keys(CHAVE_LIM) as Coluna[]) {
    if (f.lim[c] > 1) q.set(CHAVE_LIM[c], String(f.lim[c]))
  }
  if (f.sel) q.set('sel', f.sel)
  if (f.sel && f.aba !== 'cotacao') q.set('aba', f.aba)
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** Escapa `%`, `_` e `\` para o texto digitado ser literal dentro de um ILIKE. */
export function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`)
}

// ------------------------------------------------------------ regras das colunas

export type RegrasColunas = {
  /** vendedor aplicado às colunas próprias; null = todos (só hierarquia ≤ 2) */
  vendedor: string | null
  cotacao: { etapa: { eq: number } | { neq: number }; arquivado: boolean }
  pedido: { etapa: number; finalizado: boolean }
  entrega: {
    status: number
    /** coluna "Entregas Próprias" filtra o período pela data real quando concluídos */
    dataPeriodo: 'dt_pedido' | 'dt_entrega'
  }
  /** "Entregas Substituto": status fora destes (Financeiro e Cancelado — spec §3.4) */
  substitutoExcluiStatus: number[]
}

/**
 * Os critérios das 4 colunas, a partir dos filtros e de quem está vendo (spec §3.1–3.4).
 *
 * - Vendedor: hierarquia > 2 é forçada no PRÓPRIO id (WF bTKAD, ação bTiYV). No Bubble isso
 *   era só parâmetro de URL; aqui a RLS (db/007–009) já restringe, e o filtro repete a regra
 *   para as colunas mostrarem o mesmo que o Bubble mostra.
 * - Cotação: etapa Cotação e `arquivado = arquivadas`. Exceção do Diretor com "exibe
 *   concluídos": etapa ≠ Cancelado (condicional de `rpg cardscotacao`).
 * - Pedido: `finalizado = concluidos`, etapa Pedido ou Cancelado ("exibe cancelados",
 *   WFs bTiWQ/bTiWX).
 * - Entregas próprias: status Em Entrega; Financeiro com "exibe concluídos" (WF bTiWJ);
 *   Cancelado com "exibe cancelados". Com concluídos, o período vale para a data REAL.
 */
export function regrasColunas(f: FiltrosVendas, u: UsuarioAtual): RegrasColunas {
  const vendedor = u.perfilId > 2 ? u.id : f.vendedor
  const statusEntrega = f.cancelados
    ? ETAPA.CANCELADO
    : f.concluidos
      ? ETAPA.FINANCEIRO
      : ETAPA.EM_ENTREGA
  return {
    vendedor,
    cotacao: {
      etapa:
        f.concluidos && u.perfilId === DIRETOR ? { neq: ETAPA.CANCELADO } : { eq: ETAPA.COTACAO },
      arquivado: f.arquivadas,
    },
    pedido: { etapa: f.cancelados ? ETAPA.CANCELADO : ETAPA.PEDIDO, finalizado: f.concluidos },
    entrega: {
      status: statusEntrega,
      dataPeriodo: f.concluidos && !f.cancelados ? 'dt_entrega' : 'dt_pedido',
    },
    substitutoExcluiStatus: [ETAPA.FINANCEIRO, ETAPA.CANCELADO],
  }
}

/**
 * Cartão de pedido verde: há entrega e todas estão em etapa concluída (spec §2.3 e §3.8:
 * "≥1 entrega concluída e total de entregas = total concluídas").
 */
export function todasEntregasConcluidas(statusIds: number[]): boolean {
  return statusIds.length > 0 && statusIds.every((s) => ETAPAS_CONCLUIDAS.includes(s))
}

// ------------------------------------------------------------------------- datas

/**
 * Coluna `date` do banco (YYYY-MM-DD) → dd/mm/aa. Sem passar por `Date`: `new Date('2026-08-31')`
 * é meia-noite UTC, que em São Paulo ainda é dia 30.
 */
export function formatarDia(valor: string | null | undefined): string {
  if (!valor || !DIA.test(valor.slice(0, 10))) return '—'
  const [a, m, d] = valor.slice(0, 10).split('-') as [string, string, string]
  return `${d}/${m}/${a.slice(2)}`
}

/**
 * Quantidade do banco (`numeric(14,3)` como texto) → pt-BR sem zeros à direita e sem passar
 * por float: "50000.000" → "50.000", "1.500" → "1,5".
 */
export function formatarQuantidade(valor: string | null | undefined): string {
  const m = valor ? DECIMAL.exec(valor.trim()) : null
  if (!m) return '—'
  const [, sinal, inteiro, fracao = ''] = m
  const milhar = inteiro!.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decimais = fracao.replace(/0+$/, '')
  return `${sinal ?? ''}${milhar}${decimais ? `,${decimais}` : ''}`
}

/** "gabriella carvalho" → "Gabriella" — o cartão do Bubble mostra só o primeiro nome. */
export function primeiroNome(nome: string | null | undefined): string {
  const p = nome?.trim().split(/\s+/)[0]
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : '—'
}

// ------------------------------------------------------------ dinheiro exato

const DECIMAL = /^(-)?(\d+)(?:\.(\d+))?$/

/** "123.4" → 123400n em escala 10^casas. Lança em texto que não é decimal. */
function paraInteiro(valor: string, casas: number): bigint {
  const m = DECIMAL.exec(valor.trim())
  if (!m) throw new Error(`valor decimal inválido: ${valor}`)
  const [, sinal, inteiro, fracao = ''] = m
  if (fracao.length > casas) throw new Error(`mais de ${casas} casas: ${valor}`)
  const n = BigInt(inteiro! + fracao.padEnd(casas, '0'))
  return sinal ? -n : n
}

function deInteiro(n: bigint, casas: number): string {
  const negativo = n < 0n
  const s = (negativo ? -n : n).toString().padStart(casas + 1, '0')
  const inteiro = s.slice(0, s.length - casas)
  const fracao = s.slice(s.length - casas)
  return `${negativo ? '-' : ''}${inteiro}${casas > 0 ? `.${fracao}` : ''}`
}

/**
 * Soma exata de valores `numeric(14,2)` vindos do banco como texto. Serve ao total dos
 * vencedores no cartão de cotação enquanto não existe `v_kanban_cotacoes` com a soma
 * pronta (spec §9.4) — o PostgREST do projeto não tem agregados ligados.
 */
export function somarReais(valores: (string | null | undefined)[]): string {
  let total = 0n
  for (const v of valores) if (v !== null && v !== undefined && v !== '') total += paraInteiro(v, 2)
  return deInteiro(total, 2)
}

/** Compara dois decimais exatos (até 6 casas): -1, 0 ou 1. */
export function compararDecimal(a: string, b: string): -1 | 0 | 1 {
  const x = paraInteiro(a, 6)
  const y = paraInteiro(b, 6)
  return x < y ? -1 : x > y ? 1 : 0
}

/**
 * Ids dos orçamentos com o MENOR líquido do item — o "Total Líq." verde do carrinho
 * (`ip valorminimo`, spec §3.5 e §5.1). Empate: todos os empatados.
 */
export function idsMenorLiquido(orcamentos: { id: string; valor_venda_liquido: string }[]): string[] {
  if (orcamentos.length < 2) return []
  let menor = orcamentos[0]!.valor_venda_liquido
  for (const o of orcamentos) if (compararDecimal(o.valor_venda_liquido, menor) < 0) menor = o.valor_venda_liquido
  return orcamentos.filter((o) => compararDecimal(o.valor_venda_liquido, menor) === 0).map((o) => o.id)
}

/**
 * Troféu (vencedor) habilitado: valor unitário ≥ 0,01 E comissão unitária ≥ 0,01, exceto em
 * "Pedido de Amostra" (condicional do troféu, WF bTOUP0; db/007 manda a regra para a action).
 */
export function podeSerVencedor(
  o: { valor_venda_unit: string; valor_comissao_unit: string },
  amostra: boolean,
): boolean {
  if (amostra) return true
  return compararDecimal(o.valor_venda_unit, '0.01') >= 0 && compararDecimal(o.valor_comissao_unit, '0.01') >= 0
}

// ------------------------------------------------------------------ permissões

/**
 * Editar a cotação: arquivada só o Diretor (condicional de `btn edita orcamento`, spec §1:
 * "hierarquia > 1 não edita cotação arquivada").
 */
export function podeEditarCotacao(u: UsuarioAtual, cotacao: { arquivado: boolean }): boolean {
  return !cotacao.arquivado || u.perfilId === DIRETOR
}

/** Filtro de vendedor só para Diretor e Gerente (condicional de `dd filter vendedor`). */
export function podeFiltrarVendedor(u: UsuarioAtual): boolean {
  return u.perfilId <= 2
}

// ------------------------------------------------------------------ validação

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erro: string }

function texto(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Quantidade digitada em pt-BR → string para `numeric(14,3)`, sem float.
 * Aceita "1.234,5", "1234,5", "1234.5" (ponto só como decimal quando não há vírgula e a
 * parte depois do ponto não tem 3 dígitos — "1.500" é mil e quinhentos, como se lê no Brasil).
 */
export function lerQuantidade(bruto: string): string | null {
  const t = bruto.replace(/\s/g, '')
  if (t === '') return null
  let normal: string
  if (t.includes(',')) {
    if (!/^\d{1,3}(\.\d{3})*,\d+$|^\d+,\d+$/.test(t)) return null
    normal = t.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    normal = t.replace(/\./g, '')
  } else if (/^\d+(\.\d+)?$/.test(t)) {
    normal = t
  } else {
    return null
  }
  const [inteiro = '0', fracao = ''] = normal.split('.')
  if (fracao.length > 3) return null
  if (inteiro.replace(/^0+/, '').length > 11) return null
  const n = paraInteiro(`${inteiro}.${fracao || '0'}`, 3)
  return n > 0n ? deInteiro(n, 3) : null
}

/**
 * Valor em reais digitado em pt-BR → string com 2 casas para `numeric(14,2)`, sem float.
 * Aceita "R$ 1.234,56", "1234,5", "0,3", "8.90" (ponto decimal quando não há vírgula e não
 * tem exatamente 3 dígitos depois). Mais de 2 casas é recusado, não arredondado.
 */
export function lerReais(bruto: string): string | null {
  const t = bruto.replace(/R\$|\s/gi, '')
  if (t === '') return null
  let normal: string
  if (t.includes(',')) {
    if (!/^\d{1,3}(\.\d{3})*,\d+$|^\d+,\d+$/.test(t)) return null
    normal = t.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    normal = t.replace(/\./g, '')
  } else if (/^\d+(\.\d+)?$/.test(t)) {
    normal = t
  } else {
    return null
  }
  const [inteiro = '0', fracao = ''] = normal.split('.')
  if (fracao.length > 2) return null
  if (inteiro.replace(/^0+/, '').length > 12) return null
  return deInteiro(paraInteiro(`${inteiro}.${fracao || '0'}`, 2), 2)
}

export type DadosCotacao = {
  cliente_id: string
  empresa_emissora_id: number
  data_validade: string
  amostra: boolean
}

/** "Gravar Cotação" (WF bTOTR0 / bTOTX0): cliente, empresa, validade obrigatória, amostra. */
export function validarCotacao(form: FormData, hoje: string): Validacao<DadosCotacao> {
  const cliente = texto(form.get('cliente_id'))
  if (!ehUuid(cliente)) return { ok: false, erro: 'Escolha o cliente na lista.' }
  const empresa = Number(texto(form.get('empresa_emissora_id')))
  if (!Number.isInteger(empresa) || empresa <= 0) return { ok: false, erro: 'Escolha a empresa emissora.' }
  const validade = texto(form.get('data_validade'))
  if (!ehDia(validade)) return { ok: false, erro: 'Informe a data de validade.' }
  if (validade < hoje) return { ok: false, erro: 'A validade não pode ser anterior a hoje.' }
  return {
    ok: true,
    dados: {
      cliente_id: cliente.toLowerCase(),
      empresa_emissora_id: empresa,
      data_validade: validade,
      amostra: form.get('amostra') === 'on',
    },
  }
}

export type DadosItem = {
  cotacao_id: string
  produto_id: string
  qtd: string
  condicao_id: number | null
  linha_id: number | null
  medida: string | null
  endereco_destino_id: string
}

function idPequeno(v: FormDataEntryValue | null): number | null | 'invalido' {
  const t = texto(v)
  if (t === '') return null
  const n = Number(t)
  return Number.isInteger(n) && n > 0 && n < 1000 ? n : 'invalido'
}

/** "Adicionar produto ao carrinho" (WFs bTNjj/bTOir0 → bTNjp/bTOiw0). */
export function validarItem(form: FormData): Validacao<DadosItem> {
  const cotacao = texto(form.get('cotacao_id'))
  if (!ehUuid(cotacao)) return { ok: false, erro: 'Cotação inválida. Recarregue a página.' }
  const produto = texto(form.get('produto_id'))
  if (!ehUuid(produto)) return { ok: false, erro: 'Escolha o produto.' }
  const qtd = lerQuantidade(texto(form.get('qtd')))
  if (!qtd) return { ok: false, erro: 'Quantidade inválida (maior que zero, até 3 casas).' }
  const condicao = idPequeno(form.get('condicao_id'))
  const linha = idPequeno(form.get('linha_id'))
  if (condicao === 'invalido' || linha === 'invalido') return { ok: false, erro: 'Condição ou linha inválida.' }
  const destino = texto(form.get('endereco_destino_id'))
  if (!ehUuid(destino)) return { ok: false, erro: 'Escolha o endereço de entrega.' }
  const medida = texto(form.get('medida'))
  if (medida.length > 500) return { ok: false, erro: 'A medida passa de 500 caracteres.' }
  return {
    ok: true,
    dados: {
      cotacao_id: cotacao.toLowerCase(),
      produto_id: produto.toLowerCase(),
      qtd,
      condicao_id: condicao,
      linha_id: linha,
      medida: medida || null,
      endereco_destino_id: destino.toLowerCase(),
    },
  }
}

export type DadosOrcamento = {
  cotacao_item_id: string
  endereco_origem_id: string
  valor_venda_unit: string
  valor_comissao_unit: string
  tipo_frete_id: number
  valor_frete: string
}

/** Tipo de frete "CIF Informado" (tipos_frete.id 2, seed da 003). */
export const FRETE_CIF_INFORMADO = 2

/**
 * Orçamento de um fornecedor para um item (WF bTNrX → `AdicionarFornecedores` + a edição
 * dos valores, bTOXZ0/bTOXg0/bTOSi0). Frete só com "CIF Informado": nos outros tipos vai 0
 * (bTOSo0) — e a coluna gerada ignora o frete de qualquer jeito (db/007 D1).
 * As alíquotas NÃO vêm do formulário: o trigger fn_orcamento_derivados as preenche.
 */
export function validarOrcamento(form: FormData): Validacao<DadosOrcamento> {
  const item = texto(form.get('cotacao_item_id'))
  if (!ehUuid(item)) return { ok: false, erro: 'Item inválido. Recarregue a página.' }
  const origem = texto(form.get('endereco_origem_id'))
  if (!ehUuid(origem)) return { ok: false, erro: 'Escolha o fornecedor.' }
  const unit = lerReais(texto(form.get('valor_venda_unit')) || '0')
  const comissao = lerReais(texto(form.get('valor_comissao_unit')) || '0')
  if (unit === null) return { ok: false, erro: 'Valor unitário inválido (até 2 casas).' }
  if (comissao === null) return { ok: false, erro: 'Comissão unitária inválida (até 2 casas).' }
  const tipoFrete = Number(texto(form.get('tipo_frete_id')) || '1')
  if (!Number.isInteger(tipoFrete) || tipoFrete <= 0 || tipoFrete > 99) {
    return { ok: false, erro: 'Tipo de frete inválido.' }
  }
  const frete = tipoFrete === FRETE_CIF_INFORMADO ? lerReais(texto(form.get('valor_frete')) || '0') : '0.00'
  if (frete === null) return { ok: false, erro: 'Valor do frete inválido (até 2 casas).' }
  return {
    ok: true,
    dados: {
      cotacao_item_id: item.toLowerCase(),
      endereco_origem_id: origem.toLowerCase(),
      valor_venda_unit: unit,
      valor_comissao_unit: comissao,
      tipo_frete_id: tipoFrete,
      valor_frete: frete,
    },
  }
}

/** Arquivar exige motivo (pop.ArquivaCotação, WF bTlDb). */
export function validarArquivamento(form: FormData): Validacao<{ cotacao_id: string; motivo_id: number }> {
  const cotacao = texto(form.get('cotacao_id'))
  if (!ehUuid(cotacao)) return { ok: false, erro: 'Cotação inválida. Recarregue a página.' }
  const motivo = idPequeno(form.get('motivo_id'))
  if (motivo === null || motivo === 'invalido') return { ok: false, erro: 'Escolha o motivo do arquivamento.' }
  return { ok: true, dados: { cotacao_id: cotacao.toLowerCase(), motivo_id: motivo } }
}

/** Validade padrão da cotação nova: hoje + 2 dias (spec §5.7; default da coluna, db/007 D8). */
export function validadePadrao(hoje: string): string {
  const [a, m, d] = hoje.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + 2)).toISOString().slice(0, 10)
}
