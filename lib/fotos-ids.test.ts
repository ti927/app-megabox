import { describe, expect, it } from 'vitest'

import { fotoPorDono, idsUnicos } from './fotos-ids'

describe('fotos em lote', () => {
  it('ids únicos, sem vazios, na ordem', () => {
    expect(idsUnicos(['b', null, 'a', 'b', undefined, '', 'a'])).toEqual(['b', 'a'])
    expect(idsUnicos([])).toEqual([])
  })

  it('mapa id → url só para quem tem foto assinada', () => {
    const urls = new Map([['clifor/1/x.jpg', 'https://assinada/x']])
    const r = fotoPorDono(
      [
        { id: '1', foto_path: 'clifor/1/x.jpg' },
        { id: '2', foto_path: null },
        { id: '3', foto_path: 'clifor/3/nao-assinada.jpg' },
      ],
      urls,
    )
    expect([...r]).toEqual([['1', 'https://assinada/x']])
  })
})
