import { describe, expect, it } from 'vitest'

import { formatarAliquota, formatarReais, lerValorDigitado } from './dinheiro'

describe('formatarReais', () => {
  it('formata string numeric vinda do banco', () => {
    expect(formatarReais('1234.5')).toBe('R$ 1.234,50')
  })

  it('mantém os centavos exatos, sem arredondar para cima', () => {
    expect(formatarReais('0.005')).toBe('R$ 0,01')
    expect(formatarReais('0.004')).toBe('R$ 0,00')
  })

  it('devolve travessão para vazio, nulo e lixo', () => {
    expect(formatarReais(null)).toBe('—')
    expect(formatarReais(undefined)).toBe('—')
    expect(formatarReais('')).toBe('—')
    expect(formatarReais('abc')).toBe('—')
  })

  it('formata negativo', () => {
    expect(formatarReais('-10')).toBe('-R$ 10,00')
  })
})

describe('formatarAliquota', () => {
  it('converte fração em percentual', () => {
    // Como as alíquotas são gravadas em fração (02 §1.3), 0.0925 é 9,25%.
    expect(formatarAliquota('0.0925')).toBe('9,25%')
    // Sempre 2 casas no mínimo, para a coluna de alíquota alinhar.
    expect(formatarAliquota('0.12')).toBe('12,00%')
    // Até 4 casas, porque a alíquota é numeric(7,4) no banco.
    expect(formatarAliquota('0.12345')).toBe('12,345%')
  })

  it('devolve travessão para vazio', () => {
    expect(formatarAliquota(null)).toBe('—')
  })
})

describe('lerValorDigitado', () => {
  it('lê o formato pt-BR com separador de milhar', () => {
    expect(lerValorDigitado('1.234,56')).toBe('1234.56')
  })

  it('lê sem separador de milhar', () => {
    expect(lerValorDigitado('1234,56')).toBe('1234.56')
  })

  it('lê com o símbolo da moeda e espaço', () => {
    expect(lerValorDigitado('R$ 1.234,56')).toBe('1234.56')
  })

  it('aceita o formato com ponto decimal', () => {
    expect(lerValorDigitado('1234.56')).toBe('1234.56')
  })

  it('sempre devolve duas casas', () => {
    expect(lerValorDigitado('10')).toBe('10.00')
    expect(lerValorDigitado('10,5')).toBe('10.50')
  })

  it('lê negativo', () => {
    expect(lerValorDigitado('-1.234,56')).toBe('-1234.56')
  })

  it('devolve null para o que não dá para ler', () => {
    expect(lerValorDigitado('')).toBeNull()
    expect(lerValorDigitado('   ')).toBeNull()
    expect(lerValorDigitado('abc')).toBeNull()
    expect(lerValorDigitado('-')).toBeNull()
  })
})
