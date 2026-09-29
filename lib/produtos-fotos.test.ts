import { describe, expect, it } from 'vitest'

import { colunaDaFoto, FOTOS_PRODUTO, fotoDaLista } from './produtos-fotos'

describe('colunaDaFoto', () => {
  it('mapeia as quatro chaves', () => {
    expect(FOTOS_PRODUTO.map((f) => colunaDaFoto(f.chave))).toEqual([
      'foto_superior_path',
      'foto_inferior_path',
      'foto_frontal_path',
      'foto_lateral_path',
    ])
  })
  it('recusa qualquer outra coisa (nada de coluna arbitrária vinda do formulário)', () => {
    expect(colunaDaFoto('nome')).toBeNull()
    expect(colunaDaFoto('foto_frontal_path')).toBeNull()
    expect(colunaDaFoto(undefined)).toBeNull()
  })
})

describe('fotoDaLista', () => {
  it('prefere a frontal', () => {
    expect(fotoDaLista({ foto_frontal_path: 'f', foto_superior_path: 's' })).toBe('f')
  })
  it('sem frontal, a primeira que existir', () => {
    expect(fotoDaLista({ foto_frontal_path: null, foto_superior_path: null, foto_lateral_path: 'l' })).toBe('l')
  })
  it('sem nenhuma, null', () => {
    expect(fotoDaLista({})).toBeNull()
  })
})
