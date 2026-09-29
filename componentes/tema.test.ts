import { describe, expect, it } from 'vitest'

import { atributoTema, cookieTema, lerTema } from './tema'

describe('lerTema', () => {
  it('aceita só claro e escuro', () => {
    expect(lerTema('claro')).toBe('claro')
    expect(lerTema('escuro')).toBe('escuro')
  })

  it('sem cookie ou com lixo, segue o sistema', () => {
    expect(lerTema(undefined)).toBe('sistema')
    expect(lerTema(null)).toBe('sistema')
    expect(lerTema('')).toBe('sistema')
    expect(lerTema('ESCURO')).toBe('sistema')
    expect(lerTema('"><script>')).toBe('sistema')
  })
})

describe('atributoTema', () => {
  it('não escreve data-tema quando segue o sistema', () => {
    expect(atributoTema('sistema')).toBeUndefined()
    expect(atributoTema('escuro')).toBe('escuro')
  })
})

describe('cookieTema', () => {
  it('grava por um ano com Path=/ e SameSite=Lax', () => {
    expect(cookieTema('escuro')).toBe('mb-tema=escuro; Path=/; SameSite=Lax; Max-Age=31536000')
  })

  it('"sistema" apaga o cookie', () => {
    expect(cookieTema('sistema')).toBe('mb-tema=; Path=/; SameSite=Lax; Max-Age=0')
  })
})
