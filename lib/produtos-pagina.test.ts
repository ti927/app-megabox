import { describe, expect, it } from 'vitest'

import { comPagina, lerPagina } from './produtos-pagina'

describe('lerPagina', () => {
  it('lê a página da URL', () => {
    expect(lerPagina({ pagina: '3' })).toBe(3)
    expect(lerPagina({ pagina: ['2', '9'] })).toBe(2)
  })

  it('valor estranho vira 1', () => {
    for (const v of [undefined, '', '0', '-2', '1.5', 'abc', '999999']) {
      expect(lerPagina({ pagina: v })).toBe(1)
    }
  })
})

describe('comPagina', () => {
  it('página 1 não aparece na URL', () => {
    expect(comPagina('', 1)).toBe('')
    expect(comPagina('?q=palete', 1)).toBe('?q=palete')
  })

  it('acrescenta à query existente ou abre uma', () => {
    expect(comPagina('', 2)).toBe('?pagina=2')
    expect(comPagina('?q=palete&sel=x', 4)).toBe('?q=palete&sel=x&pagina=4')
  })
})
