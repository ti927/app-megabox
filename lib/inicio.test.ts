import { describe, expect, it } from 'vitest'

import { colunasDoPeriodo, lerPeriodo, montarMatrizInicio } from './inicio'

describe('lerPeriodo', () => {
  it('padrão = mês corrente inteiro, como o Bubble', () => {
    expect(lerPeriodo({}, '2026-09-30')).toEqual({ periodo: { de: '2026-09-01', ate: '2026-09-30' }, aviso: null })
    expect(lerPeriodo({}, '2028-02-10').periodo).toEqual({ de: '2028-02-01', ate: '2028-02-29' })
  })
  it('aceita um período válido da URL', () => {
    expect(lerPeriodo({ de: '2026-01-01', ate: '2026-12-31' }, '2026-09-30').periodo).toEqual({ de: '2026-01-01', ate: '2026-12-31' })
  })
  it('período inválido, invertido ou longo demais volta ao mês com aviso', () => {
    expect(lerPeriodo({ de: '2026-02-30', ate: '2026-03-01' }, '2026-09-30').aviso).toMatch(/incompleto/)
    expect(lerPeriodo({ de: '2026-05-01', ate: '2026-04-01' }, '2026-09-30').aviso).toMatch(/anterior/)
    const longo = lerPeriodo({ de: '2024-01-01', ate: '2026-01-01' }, '2026-09-30')
    expect(longo.aviso).toMatch(/24 meses/)
    expect(longo.periodo).toEqual({ de: '2026-09-01', ate: '2026-09-30' })
  })
})

describe('colunasDoPeriodo', () => {
  it('dentro de um ano: as 12 colunas de janeiro a dezembro', () => {
    const c = colunasDoPeriodo({ de: '2026-09-01', ate: '2026-09-30' })
    expect(c).toHaveLength(12)
    expect(c[0]).toEqual({ mes: '2026-01-01', rotulo: 'Janeiro' })
    expect(c[11]).toEqual({ mes: '2026-12-01', rotulo: 'Dezembro' })
  })
  it('cruzando o ano: um mês por coluna, com o ano (no Bubble jan/25 e jan/26 se somavam)', () => {
    expect(colunasDoPeriodo({ de: '2025-11-15', ate: '2026-02-03' })).toEqual([
      { mes: '2025-11-01', rotulo: 'Nov/25' },
      { mes: '2025-12-01', rotulo: 'Dez/25' },
      { mes: '2026-01-01', rotulo: 'Jan/26' },
      { mes: '2026-02-01', rotulo: 'Fev/26' },
    ])
  })
})

describe('montarMatrizInicio', () => {
  it('indexa células e totais do banco sem somar nada', () => {
    const m = montarMatrizInicio([
      { nivel: 0, endereco_id: 'a', fornecedor: 'Alfa', mes: '2026-09-01', valor_comissao: '400.00', qtd_entregas: 1 },
      { nivel: 0, endereco_id: 'a', fornecedor: 'Alfa', mes: '2026-10-01', valor_comissao: 0.1, qtd_entregas: 1 },
      { nivel: 0, endereco_id: 'b', fornecedor: 'Beta', mes: '2026-09-01', valor_comissao: '700.00', qtd_entregas: 2 },
      { nivel: 1, endereco_id: 'a', fornecedor: 'Alfa', mes: null, valor_comissao: '400.10', qtd_entregas: 2 },
      { nivel: 1, endereco_id: 'b', fornecedor: 'Beta', mes: null, valor_comissao: '700.00', qtd_entregas: 2 },
      { nivel: 2, endereco_id: null, fornecedor: null, mes: '2026-09-01', valor_comissao: '1100.00', qtd_entregas: 3 },
      { nivel: 2, endereco_id: null, fornecedor: null, mes: '2026-10-01', valor_comissao: '0.10', qtd_entregas: 1 },
      { nivel: 3, endereco_id: null, fornecedor: null, mes: null, valor_comissao: '1100.10', qtd_entregas: 4 },
    ])
    expect(m.linhas.map((l) => l.fornecedor)).toEqual(['Alfa', 'Beta'])
    expect(m.linhas[0]?.celulas).toEqual({ '2026-09-01': '400.00', '2026-10-01': '0.1' })
    expect(m.linhas[0]?.total).toBe('400.10')
    expect(m.totaisMes['2026-09-01']).toBe('1100.00')
    expect(m.totalGeral).toBe('1100.10')
  })
  it('sem linhas: matriz vazia, sem total', () => {
    expect(montarMatrizInicio([])).toEqual({ linhas: [], totaisMes: {}, totalGeral: null })
  })
})
