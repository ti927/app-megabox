import { describe, expect, it } from 'vitest'

import { contarAnexos, diasDesde } from './cadastros-lista'

describe('diasDesde', () => {
  const agora = new Date('2026-09-30T15:00:00-03:00')

  it('nulo quando nunca houve conversa', () => {
    expect(diasDesde(null, agora)).toBeNull()
    expect(diasDesde(undefined, agora)).toBeNull()
    expect(diasDesde('lixo', agora)).toBeNull()
  })

  it('conta dias de calendário em São Paulo', () => {
    expect(diasDesde('2026-09-30T08:00:00-03:00', agora)).toBe(0)
    expect(diasDesde('2026-09-29T23:59:00-03:00', agora)).toBe(1)
    expect(diasDesde('2026-08-26T10:00:00-03:00', agora)).toBe(35)
  })

  it('usa o fuso de São Paulo, não o UTC', () => {
    // 01:30 UTC do dia 30 ainda é 29 à noite em São Paulo
    expect(diasDesde('2026-09-30T01:30:00Z', agora)).toBe(1)
    // e "agora" às 23h de SP (02h UTC do dia seguinte) ainda é dia 30
    expect(diasDesde('2026-09-30T08:00:00-03:00', new Date('2026-10-01T02:00:00Z'))).toBe(0)
  })

  it('data no futuro conta como 0', () => {
    expect(diasDesde('2026-10-05T10:00:00-03:00', agora)).toBe(0)
  })
})

describe('contarAnexos', () => {
  it('soma os do grupo e os das filiais', () => {
    expect(contarAnexos([{ count: 2 }], [{ anexos: [{ count: 1 }] }, { anexos: [{ count: 3 }] }])).toBe(6)
  })

  it('tolera embed vazio ou ausente', () => {
    expect(contarAnexos(undefined, undefined)).toBe(0)
    expect(contarAnexos([], [{ anexos: [] }, { anexos: null }])).toBe(0)
  })
})
