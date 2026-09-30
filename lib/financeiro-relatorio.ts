/**
 * Relatórios "contas a receber" e "contas a pagar" do financeiro (Bubble `btn relatorio cr` /
 * `btn relatorio cp`, financeiro.md §2.1, §4.7): CSV do recorte FILTRADO, montado no servidor.
 *
 * No Bubble o de CR não tinha workflow (bUFEH vazio) e o de CP mandava as CPs selecionadas por
 * e-mail ao próprio usuário (bTpsH). Aqui os dois exportam o que a tabela mostra com os filtros
 * da tela, como /relatorios faz.
 *
 * Puro: sem banco. Dinheiro entra e sai como STRING exata ("1234.50" → "1234,50" no CSV), nunca
 * `Number`.
 */

import { formatarPercentualExato, somarReais } from '@/lib/financeiro'

export type Celula = string | null

const NOME_STATUS: Record<number, string> = { 1: 'A receber', 2: 'Recebido', 3: 'A pagar', 4: 'Pago' }

/** "2026-08-04" (ou timestamp) → "04/08/2026". Sem data → vazio. */
export function dataCsv(valor: string | null | undefined): Celula {
  const m = valor ? /^(\d{4})-(\d{2})-(\d{2})/.exec(valor) : null
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null
}

/** Dinheiro/quantidade exatos: "1234.5" → "1234,5"; nada de float no caminho. */
export function numeroCsv(valor: string | null | undefined): Celula {
  if (valor === null || valor === undefined || valor === '') return null
  return /^-?\d+(\.\d+)?$/.test(valor) ? valor.replace('.', ',') : null
}

/**
 * Texto livre (nome de cliente, NF…) numa célula: planilha executa célula que começa com
 * `= + - @` (injeção de fórmula). Prefixa com apóstrofo, que o Excel/LibreOffice mostram como texto.
 */
export function textoCsv(valor: string | null | undefined): Celula {
  if (valor === null || valor === undefined || valor === '') return null
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor
}

/** Separador `;`, BOM e CRLF (o Excel em pt-BR abre direto), aspas quando precisa. */
export function montarCsv(cabecalho: string[], linhas: Celula[][]): string {
  const celula = (v: Celula) => {
    if (v === null) return ''
    return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  }
  return '﻿' + [cabecalho, ...linhas].map((l) => l.map(celula).join(';')).join('\r\n') + '\r\n'
}

export type LinhaReceberCsv = {
  pedido_numero: string | null
  parcela: number
  parcelas_total: number
  vendedor_nome: string
  cliente_nome: string
  filial_destino: string
  fornecedor_nome: string
  filial_origem: string
  produto_nome: string
  qtd: string
  dt_pedido: string | null
  dt_entrega: string | null
  dt_vencimento: string
  nf_fornecedor_numero: string | null
  ultima_nf_megabox: string | null
  ultima_dt_baixa: string | null
  ultima_dt_credito: string | null
  valor_total: string
  valor_comissao: string
  valor_baixado: string
  saldo: string
  status_id: number
  vencida: boolean
  arquivado: boolean
}

export const CABECALHO_RECEBER = [
  'PEDIDO',
  'PARCELA',
  'VENDEDOR',
  'CLIENTE',
  'FILIAL CLIENTE',
  'FORNECEDOR',
  'FILIAL FORNECEDOR',
  'PRODUTO',
  'QTD',
  'DT PEDIDO',
  'DT ENTREGA',
  'DT VENCIMENTO',
  'NF FORNECEDOR',
  'NF/RECIBO MEGABOX',
  'DT BAIXA SISTEMA',
  'DT RECEBTO BANCO',
  'VALOR VENDA',
  'VALOR COMISSAO',
  'RECEBIDO',
  'SALDO',
  'STATUS',
  'VENCIDA',
  'ARQUIVADA',
]

export function linhaReceber(l: LinhaReceberCsv): Celula[] {
  return [
    textoCsv(l.pedido_numero),
    `${l.parcela}/${l.parcelas_total}`,
    textoCsv(l.vendedor_nome),
    textoCsv(l.cliente_nome),
    textoCsv(l.filial_destino),
    textoCsv(l.fornecedor_nome),
    textoCsv(l.filial_origem),
    textoCsv(l.produto_nome),
    numeroCsv(l.qtd),
    dataCsv(l.dt_pedido),
    dataCsv(l.dt_entrega),
    dataCsv(l.dt_vencimento),
    textoCsv(l.nf_fornecedor_numero),
    textoCsv(l.ultima_nf_megabox),
    dataCsv(l.ultima_dt_baixa),
    dataCsv(l.ultima_dt_credito),
    numeroCsv(l.valor_total),
    numeroCsv(l.valor_comissao),
    numeroCsv(l.valor_baixado),
    numeroCsv(l.saldo),
    NOME_STATUS[l.status_id] ?? null,
    l.vencida ? 'Sim' : 'Não',
    l.arquivado ? 'Sim' : 'Não',
  ]
}

export type LinhaPagarCsv = {
  origem: 'entrega' | 'meta'
  pedido_numero: string | null
  vendedor_nome: string
  cliente_nome: string
  fornecedor_nome: string
  qtd: string | null
  dt_entrega: string | null
  dt_vencimento: string
  nf_fornecedor_numero: string | null
  valor_base: string
  percentual: string
  valor_comissao: string
  valor_pago: string
  saldo: string
  ultima_dt_baixa: string | null
  status_id: number
  vencida: boolean
}

export const CABECALHO_PAGAR = [
  'ORIGEM',
  'PEDIDO',
  'VENDEDOR',
  'CLIENTE',
  'FORNECEDOR',
  'QTD',
  'DT ENTREGA',
  'DT VENCIMENTO',
  'NF FORNECEDOR',
  'COMISSAO MEGABOX',
  'PERCENTUAL',
  'COMISSAO VENDEDOR',
  'PAGO',
  'SALDO',
  'DT BAIXA SISTEMA',
  'STATUS',
  'VENCIDA',
]

export function linhaPagar(l: LinhaPagarCsv): Celula[] {
  return [
    l.origem === 'meta' ? 'Fechamento de meta' : 'Entrega',
    textoCsv(l.pedido_numero),
    textoCsv(l.vendedor_nome),
    textoCsv(l.cliente_nome),
    textoCsv(l.fornecedor_nome),
    numeroCsv(l.qtd),
    dataCsv(l.dt_entrega),
    dataCsv(l.dt_vencimento),
    textoCsv(l.nf_fornecedor_numero),
    numeroCsv(l.valor_base),
    l.percentual ? formatarPercentualExato(l.percentual) : null,
    numeroCsv(l.valor_comissao),
    numeroCsv(l.valor_pago),
    numeroCsv(l.saldo),
    dataCsv(l.ultima_dt_baixa),
    NOME_STATUS[l.status_id] ?? null,
    l.vencida ? 'Sim' : 'Não',
  ]
}

/** Linha de TOTAL no fim do arquivo: somas exatas (centavos) das colunas de dinheiro. */
export function totalReceber(linhas: LinhaReceberCsv[]): Celula[] {
  const soma = (k: 'valor_total' | 'valor_comissao' | 'valor_baixado' | 'saldo') =>
    numeroCsv(somarReais(linhas.map((l) => l[k])))
  const vazio = Array<Celula>(15).fill(null)
  return [`TOTAL (${linhas.length})`, ...vazio, soma('valor_total'), soma('valor_comissao'), soma('valor_baixado'), soma('saldo'), null, null, null]
}

export function totalPagar(linhas: LinhaPagarCsv[]): Celula[] {
  const soma = (k: 'valor_base' | 'valor_comissao' | 'valor_pago' | 'saldo') =>
    numeroCsv(somarReais(linhas.map((l) => l[k])))
  const vazio = Array<Celula>(8).fill(null)
  return [`TOTAL (${linhas.length})`, ...vazio, soma('valor_base'), null, soma('valor_comissao'), soma('valor_pago'), soma('saldo'), null, null, null]
}
