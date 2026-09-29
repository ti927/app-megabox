import { describe, expect, it } from 'vitest'

import { filtroDonoAnexos, formatarTamanho, podeApagarAnexo } from './anexos'

const G = '11111111-1111-4111-8111-111111111111'
const F1 = '22222222-2222-4222-8222-222222222222'
const F2 = '33333333-3333-4333-8333-333333333333'

describe('podeApagarAnexo (bTjdn: hierarquia <= 2)', () => {
  it.each([
    [1, true],
    [2, true],
    [3, false],
    [4, false],
    [0, false],
    [Number.NaN, false],
  ])('perfil %s → %s', (perfilId, esperado) => {
    expect(podeApagarAnexo({ perfilId })).toBe(esperado)
  })
})

describe('filtroDonoAnexos', () => {
  it('sem filiais: só o grupo', () => {
    expect(filtroDonoAnexos(G, [])).toBe(`grupo_id.eq.${G}`)
  })
  it('com filiais: grupo ou filial dele', () => {
    expect(filtroDonoAnexos(G, [F1, F2])).toBe(`grupo_id.eq.${G},endereco_id.in.(${F1},${F2})`)
  })
  it('descarta o que não é uuid (nada entra no or=)', () => {
    expect(filtroDonoAnexos(G, [F1, 'x),id.not.is.null'])).toBe(`grupo_id.eq.${G},endereco_id.in.(${F1})`)
  })
  it('grupo inválido é erro', () => {
    expect(() => filtroDonoAnexos('abc', [])).toThrow()
  })
})

describe('formatarTamanho', () => {
  it('formata', () => {
    expect(formatarTamanho(512)).toBe('512 B')
    expect(formatarTamanho(320 * 1024)).toBe('320 KB')
    expect(formatarTamanho(2.4 * 1024 * 1024)).toBe('2,4 MB')
    expect(formatarTamanho(null)).toBe('')
  })
})
