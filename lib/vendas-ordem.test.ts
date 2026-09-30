import { describe, expect, it } from 'vitest'

import { comOrdem, lerCrescente } from './vendas-ordem'

describe('lerCrescente', () => {
  it('só "1" liga a ordem crescente', () => {
    expect(lerCrescente({ crescente: '1' })).toBe(true)
    expect(lerCrescente({ crescente: ['1', '0'] })).toBe(true)
    expect(lerCrescente({})).toBe(false)
    expect(lerCrescente({ crescente: 'yes' })).toBe(false)
    expect(lerCrescente({ crescente: '0' })).toBe(false)
  })
})

describe('comOrdem', () => {
  it('não mexe na query quando desligada', () => {
    expect(comOrdem('', false)).toBe('')
    expect(comOrdem('?expandir=1', false)).toBe('?expandir=1')
  })
  it('acrescenta o parâmetro à query vazia ou existente', () => {
    expect(comOrdem('', true)).toBe('?crescente=1')
    expect(comOrdem('?expandir=1', true)).toBe('?expandir=1&crescente=1')
  })
})
