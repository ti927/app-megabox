import { describe, expect, it } from 'vitest'

import {
  CABECALHO_PAGAR,
  CABECALHO_RECEBER,
  dataCsv,
  linhaPagar,
  linhaReceber,
  type LinhaPagarCsv,
  type LinhaReceberCsv,
  montarCsv,
  numeroCsv,
  textoCsv,
  totalPagar,
  totalReceber,
} from './financeiro-relatorio'

const cr = (o: Partial<LinhaReceberCsv> = {}): LinhaReceberCsv => ({
  pedido_numero: '5456',
  parcela: 1,
  parcelas_total: 3,
  vendedor_nome: 'Ana',
  cliente_nome: 'Cliente',
  filial_destino: 'Matriz',
  fornecedor_nome: 'Fornecedor',
  filial_origem: 'Fábrica',
  produto_nome: 'Chapa',
  qtd: '5000.000',
  dt_pedido: '2026-07-29',
  dt_entrega: '2026-08-04',
  dt_vencimento: '2026-09-05',
  nf_fornecedor_numero: '2361',
  ultima_nf_megabox: null,
  ultima_dt_baixa: null,
  ultima_dt_credito: null,
  valor_total: '27000.00',
  valor_comissao: '0.10',
  valor_baixado: '0.00',
  saldo: '0.10',
  status_id: 1,
  vencida: false,
  arquivado: false,
  ...o,
})

const cp = (o: Partial<LinhaPagarCsv> = {}): LinhaPagarCsv => ({
  origem: 'entrega',
  pedido_numero: '5456',
  vendedor_nome: 'Ana',
  cliente_nome: 'Cliente',
  fornecedor_nome: 'Fornecedor',
  qtd: '10',
  dt_entrega: '2026-08-04',
  dt_vencimento: '2026-09-05',
  nf_fornecedor_numero: null,
  valor_base: '100.00',
  percentual: '0.0300',
  valor_comissao: '3.00',
  valor_pago: '0.00',
  saldo: '3.00',
  ultima_dt_baixa: null,
  status_id: 3,
  vencida: true,
  ...o,
})

describe('células do CSV', () => {
  it('data dd/mm/aaaa, vazio sem data', () => {
    expect(dataCsv('2026-08-04')).toBe('04/08/2026')
    expect(dataCsv('2026-08-04T10:00:00+00:00')).toBe('04/08/2026')
    expect(dataCsv(null)).toBeNull()
  })
  it('número exato com vírgula, sem passar por float', () => {
    expect(numeroCsv('0.10')).toBe('0,10')
    expect(numeroCsv('12345678901234.99')).toBe('12345678901234,99')
    expect(numeroCsv('abc')).toBeNull()
  })
  it('texto que viraria fórmula ganha apóstrofo', () => {
    expect(textoCsv('=HYPERLINK("x")')).toBe(`'=HYPERLINK("x")`)
    expect(textoCsv('-1')).toBe(`'-1`)
    expect(textoCsv('ACME')).toBe('ACME')
  })
  it('separador ; com aspas, BOM e CRLF', () => {
    expect(montarCsv(['A', 'B'], [['x;y', null]])).toBe('﻿A;B\r\n"x;y";\r\n')
  })
})

describe('linhas e total', () => {
  it('a receber: uma célula por coluna, total em centavos', () => {
    const linhas = [cr(), cr({ valor_comissao: '0.20', saldo: '0.20', valor_total: '0.01' })]
    expect(linhaReceber(linhas[0]!)).toHaveLength(CABECALHO_RECEBER.length)
    const total = totalReceber(linhas)
    expect(total).toHaveLength(CABECALHO_RECEBER.length)
    // 0,10 + 0,20 = 0,30 exatos (em float daria 0.30000000000000004)
    expect(total[CABECALHO_RECEBER.indexOf('VALOR COMISSAO')]).toBe('0,30')
    expect(total[CABECALHO_RECEBER.indexOf('VALOR VENDA')]).toBe('27000,01')
    expect(total[0]).toBe('TOTAL (2)')
  })
  it('a pagar: percentual legível, total alinhado ao cabeçalho', () => {
    const l = linhaPagar(cp())
    expect(l).toHaveLength(CABECALHO_PAGAR.length)
    expect(l[CABECALHO_PAGAR.indexOf('PERCENTUAL')]).toBe('3,00%')
    const total = totalPagar([cp(), cp()])
    expect(total).toHaveLength(CABECALHO_PAGAR.length)
    expect(total[CABECALHO_PAGAR.indexOf('COMISSAO VENDEDOR')]).toBe('6,00')
    expect(total[CABECALHO_PAGAR.indexOf('SALDO')]).toBe('6,00')
  })
})
