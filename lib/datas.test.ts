import { describe, expect, it } from 'vitest'

import { formatarData } from './datas'

describe('formatarData', () => {
  it('usa o fuso de São Paulo, não o do servidor', () => {
    // 02:00 UTC do dia 5 ainda é dia 4 em São Paulo (UTC-3).
    expect(formatarData('2026-08-05T02:00:00Z')).toBe('04/08/26')
  })

  it('travessão para vazio e lixo', () => {
    expect(formatarData(null)).toBe('—')
    expect(formatarData('ontem')).toBe('—')
  })
})

describe('formatarData com coluna date', () => {
  it('não recua um dia por causa do fuso', () => {
    expect(formatarData('2026-08-31')).toBe('31/08/26')
    expect(formatarData('2026-01-01')).toBe('01/01/26')
  })
})
