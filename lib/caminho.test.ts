import { describe, expect, it } from 'vitest'

import { caminhoInternoSeguro } from './caminho'

describe('caminhoInternoSeguro', () => {
  it('aceita caminho interno', () => {
    expect(caminhoInternoSeguro('/vendas?sel=1')).toBe('/vendas?sel=1')
  })
  it('recusa tudo que sai do app', () => {
    for (const ruim of ['//evil.com', '/\\evil.com', 'https://evil.com', 'evil.com', '', '/\tx', null, 42]) {
      expect(caminhoInternoSeguro(ruim)).toBe('/inicio')
    }
  })
})
