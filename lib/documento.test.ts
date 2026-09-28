import { describe, expect, it } from 'vitest'

import {
  cnpjValido,
  cpfValido,
  documentoValido,
  formatarDocumento,
  somenteDigitos,
} from './documento'

// Documentos de exemplo gerados só para teste (dígitos verificadores calculados), sem
// relação com cadastro real.
const CNPJ_OK = '11222333000181'
const CPF_OK = '52998224725'

describe('somenteDigitos', () => {
  it('tira máscara e lixo', () => {
    expect(somenteDigitos('11.222.333/0001-81')).toBe(CNPJ_OK)
    expect(somenteDigitos(null)).toBe('')
    expect(somenteDigitos('·')).toBe('')
  })
})

describe('formatarDocumento', () => {
  it('mascara CNPJ e CPF', () => {
    expect(formatarDocumento(CNPJ_OK)).toBe('11.222.333/0001-81')
    expect(formatarDocumento(CPF_OK)).toBe('529.982.247-25')
  })

  it('devolve o que veio quando o tamanho não é de documento', () => {
    // A base tem 23 documentos fora do padrão, entre eles '·' (db/006).
    expect(formatarDocumento('·')).toBe('·')
    expect(formatarDocumento('123')).toBe('123')
  })

  it('travessão para vazio', () => {
    expect(formatarDocumento(null)).toBe('—')
    expect(formatarDocumento('  ')).toBe('—')
  })
})

describe('dígito verificador', () => {
  it('aceita CNPJ e CPF corretos, com ou sem máscara', () => {
    expect(cnpjValido(CNPJ_OK)).toBe(true)
    expect(cnpjValido('11.222.333/0001-81')).toBe(true)
    expect(cpfValido(CPF_OK)).toBe(true)
  })

  it('recusa dígito errado', () => {
    expect(cnpjValido('11222333000182')).toBe(false)
    expect(cpfValido('52998224726')).toBe(false)
  })

  it('recusa sequência repetida, que passa na conta mas não existe', () => {
    expect(cnpjValido('00000000000000')).toBe(false)
    expect(cpfValido('11111111111')).toBe(false)
  })

  it('documentoValido decide pelo tamanho', () => {
    expect(documentoValido(CNPJ_OK)).toBe(true)
    expect(documentoValido(CPF_OK)).toBe(true)
    expect(documentoValido('1234567890')).toBe(false)
    expect(documentoValido(null)).toBe(false)
  })
})
