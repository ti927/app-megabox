import { describe, expect, it } from 'vitest'

import { larguraInicial, larguraMaxima, limitarLargura, LARGURA_MINIMA, SOBRA_MINIMA } from './painel-largura'

describe('painel-largura', () => {
  it('abre com a fração pedida da janela', () => {
    expect(larguraInicial(1440, 0.56)).toBe(806)
    expect(larguraInicial(1920, 0.56)).toBe(1075)
  })

  it('não passa do mínimo nem esconde a página inteira', () => {
    expect(limitarLargura(100, 1440)).toBe(LARGURA_MINIMA)
    expect(limitarLargura(5000, 1440)).toBe(1440 - SOBRA_MINIMA)
    expect(limitarLargura(Number.POSITIVE_INFINITY, 1920)).toBe(larguraMaxima(1920))
  })

  it('em janela estreita ocupa a largura toda', () => {
    expect(limitarLargura(300, 390)).toBe(390)
    expect(larguraInicial(700, 0.56)).toBe(700)
  })
})
