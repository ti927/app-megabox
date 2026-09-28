import { describe, expect, it } from 'vitest'

import {
  formatarPercentual,
  hojeSaoPaulo,
  type LinhaMes,
  lerData,
  lerFiltros,
  limitesSaoPaulo,
  mesDe,
  montarMatriz,
  paraCsv,
  paraQuery,
  problemaDoPeriodo,
  rotuloMes,
  valorDaMedida,
} from './relatorios'

const HOJE = '2026-09-28'

describe('período', () => {
  it('padrão é o mês corrente de São Paulo (nunca vazio — [DÚVIDA 12])', () => {
    expect(mesDe('2026-02-10')).toEqual({ inicio: '2026-02-01', fim: '2026-02-28' })
    expect(mesDe('2028-02-10')).toEqual({ inicio: '2028-02-01', fim: '2028-02-29' })
    const { filtros, aviso } = lerFiltros({}, HOJE)
    expect([filtros.inicio, filtros.fim, aviso]).toEqual(['2026-09-01', '2026-09-30', null])
  })

  it('hoje é o de São Paulo, não o do servidor', () => {
    // 01:00 UTC do dia 1º ainda é dia 30 em São Paulo.
    expect(hojeSaoPaulo(new Date('2026-10-01T01:00:00Z'))).toBe('2026-09-30')
  })

  it('rejeita data impossível', () => {
    expect(lerData('2026-02-30')).toBeNull()
    expect(lerData('2026-02-28')).toBe('2026-02-28')
    expect(lerData('28/02/2026')).toBeNull()
  })

  it('invertido ou maior que 24 meses volta ao padrão, com aviso', () => {
    expect(problemaDoPeriodo('2026-01-01', '2027-12-31')).toBeNull()
    expect(problemaDoPeriodo('2026-01-01', '2028-01-01')).toMatch(/24 meses/)
    const r = lerFiltros({ datainicio: '2026-05-01', datafim: '2026-04-01' }, HOJE)
    expect(r.aviso).toMatch(/anterior/)
    expect(r.filtros.inicio).toBe('2026-09-01')
  })

  it('limites em timestamptz cobrem o último dia inteiro', () => {
    expect(limitesSaoPaulo('2026-02-01', '2026-02-28')).toEqual({
      de: '2026-02-01T00:00:00-03:00',
      ate: '2026-03-01T00:00:00-03:00',
    })
  })
})

describe('filtros na URL', () => {
  it('lixo cai no padrão; ida e volta preserva', () => {
    const { filtros } = lerFiltros(
      { aba: 'x', modelo: 'produtos', vendedor: 'nao-e-uuid', medida: 'venda', arquivado: 'sim' },
      HOJE,
    )
    expect(filtros).toMatchObject({ aba: 'outros', modelo: 'produtos', vendedor: null, medida: 'venda', arquivado: 'sim' })
    const volta = lerFiltros(Object.fromEntries(new URLSearchParams(paraQuery(filtros))), HOJE).filtros
    expect(volta).toEqual(filtros)
  })

  it('omite o que é padrão', () => {
    const { filtros } = lerFiltros({}, HOJE)
    expect(paraQuery(filtros)).toBe('?datainicio=2026-09-01&datafim=2026-09-30')
    expect(paraQuery(filtros, { aba: 'cotacao' })).toBe('?aba=cotacao&datainicio=2026-09-01&datafim=2026-09-30')
  })
})

describe('montarMatriz — posiciona, não soma', () => {
  const l = (nivel: number, id: string | null, nome: string | null, mes: string | null, com: string): LinhaMes => ({
    nivel, endereco_id: id, nome, uf: id ? 'GO' : null, mes, qtd: '1', valor_venda_bruto: '10.00', valor_comissao: com, qtd_entregas: 1,
  })

  it('células, totais de linha e de mês vêm do banco como estão', () => {
    const m = montarMatriz([
      l(0, 'b', 'BETA', '2026-04-01', '2.48'),
      l(0, 'a', 'ALFA', '2026-03-01', '3.33'),
      l(1, 'a', 'ALFA', null, '3.33'),
      l(1, 'b', 'BETA', null, '2.48'),
      l(2, null, null, '2026-03-01', '3.33'),
      l(2, null, null, '2026-04-01', '2.48'),
      // total geral propositalmente DIFERENTE da soma: prova que a tela não recalcula
      l(3, null, null, null, '999.99'),
    ])
    expect(m.meses).toEqual(['2026-03-01', '2026-04-01'])
    expect(m.linhas.map((x) => x.nome)).toEqual(['ALFA', 'BETA'])
    expect(m.linhas[0]?.celulas['2026-04-01']).toBeUndefined()
    expect(valorDaMedida(m.totalGeral, 'comissao')).toBe('999.99')
    expect(valorDaMedida(m.totaisMes['2026-04-01'], 'venda')).toBe('10.00')
  })
})

describe('formatação', () => {
  it('mês e percentual', () => {
    expect(rotuloMes('2031-03-01')).toBe('mar/31')
    expect(formatarPercentual('0.3580')).toBe('35,8%')
    expect(formatarPercentual(null)).toBe('—')
  })
})

describe('paraCsv', () => {
  it('Excel pt-BR: ; e vírgula decimal, sem passar dinheiro por float', () => {
    const csv = paraCsv(['Cliente', 'Comissão'], [['A; B "C"', '1234.56'], ['X', '0.10'], ['Y', null]])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toBe('﻿Cliente;Comissão\r\n"A; B ""C""";1234,56\r\nX;0,10\r\nY;\r\n')
  })
})
