import { describe, expect, it } from 'vitest'

import {
  atalhosDePrazo,
  diasDoPrazo,
  dividirQuantidade,
  frasePagamento,
  larguras,
  mesmosPrazos,
  ordenarPrazos,
  quantidadePositiva,
  sugerirPrazos,
  textoDosPrazos,
} from './fluxo-tela'

// Recorte de prazos_recebimento (db/003): id → rótulo.
const PRAZOS = [
  { id: 1, nome: '0dd' },
  { id: 10, nome: '28dd' },
  { id: 11, nome: '30dd' },
  { id: 14, nome: '42dd' },
  { id: 18, nome: '60dd' },
  { id: 20, nome: '90dd' },
]

describe('dividirQuantidade', () => {
  it('parte em duas somando exatamente o original', () => {
    expect(dividirQuantidade('50')).toEqual(['25', '25'])
    expect(dividirQuantidade('51')).toEqual(['25.5', '25.5'])
    expect(dividirQuantidade('0.005')).toEqual(['0.002', '0.003'])
    expect(dividirQuantidade('1000.001')).toEqual(['500', '500.001'])
  })
  it('não divide o que não dá duas entregas com quantidade', () => {
    expect(dividirQuantidade('0.001')).toBeNull()
    expect(dividirQuantidade('0')).toBeNull()
    expect(dividirQuantidade('abc')).toBeNull()
    expect(dividirQuantidade('-4')).toBeNull()
  })
})

describe('quantidadePositiva', () => {
  it('só maior que zero', () => {
    expect(quantidadePositiva('0')).toBe(false)
    expect(quantidadePositiva('0.000')).toBe(false)
    expect(quantidadePositiva('0.001')).toBe(true)
    expect(quantidadePositiva('-1')).toBe(false)
  })
})

describe('larguras', () => {
  it('reparte a barra pelo vendido e mostra o que falta', () => {
    expect(larguras('100', ['25', '25'])).toEqual({ entregas: [25, 25], falta: 50 })
  })
  it('entregou a mais: a base é o distribuído, sem falta', () => {
    expect(larguras('100', ['100', '25'])).toEqual({ entregas: [80, 20], falta: 0 })
  })
  it('sem nada vendido nem entregue, tudo zero', () => {
    expect(larguras('0', [])).toEqual({ entregas: [], falta: 0 })
  })
})

describe('prazos', () => {
  it('lê os dias do rótulo', () => {
    expect(diasDoPrazo('30dd')).toBe(30)
    expect(diasDoPrazo('120dd')).toBe(120)
    expect(diasDoPrazo('x')).toBeNull()
  })
  it('atalhos só com prazos existentes', () => {
    const a = atalhosDePrazo(PRAZOS)
    expect(a.map((x) => x.rotulo)).toEqual(['À vista', '28 dd', '30 dd', '30/60', '30/60/90'])
    expect(a.find((x) => x.rotulo === '30/60/90')?.ids).toEqual([11, 18, 20])
  })
  it('ordena como as parcelas (dias, depois id)', () => {
    expect(ordenarPrazos([20, 11, 18, 11], PRAZOS)).toEqual([11, 18, 20])
  })
  it('compara sem ordem', () => {
    expect(mesmosPrazos([11, 18], [18, 11])).toBe(true)
    expect(mesmosPrazos([11], [11, 18])).toBe(false)
  })
  it('escreve a condição', () => {
    expect(textoDosPrazos([20, 11, 18], PRAZOS)).toBe('30/60/90 dd')
    expect(textoDosPrazos([1], PRAZOS)).toBe('À vista')
    expect(textoDosPrazos([], PRAZOS)).toBe('')
  })
})

describe('sugerirPrazos (condição da proposta → prazos do pedido)', () => {
  it('reconhece os formatos usuais', () => {
    expect(sugerirPrazos('30/60/90 dd', PRAZOS)).toEqual([11, 18, 20])
    expect(sugerirPrazos('28dd', PRAZOS)).toEqual([10])
    expect(sugerirPrazos('30 / 60 dias', PRAZOS)).toEqual([11, 18])
    expect(sugerirPrazos('À vista', PRAZOS)).toEqual([1])
  })
  it('não inventa: texto sem prazo, prazo inexistente ou vazio', () => {
    expect(sugerirPrazos('Mediante analise do financeiro', PRAZOS)).toEqual([])
    expect(sugerirPrazos('30/45 dd', PRAZOS)).toEqual([])
    expect(sugerirPrazos('', PRAZOS)).toEqual([])
    expect(sugerirPrazos(null, PRAZOS)).toEqual([])
    expect(sugerirPrazos('pedido 30', PRAZOS)).toEqual([])
  })
})

describe('frasePagamento', () => {
  it('sem prazos não diz nada', () => {
    expect(frasePagamento([], PRAZOS, 'Boleto')).toBeNull()
  })
  it('à vista', () => {
    expect(frasePagamento([1], PRAZOS, null)).toBe('O cliente paga à vista, na entrega.')
  })
  it('uma parcela, com a forma', () => {
    expect(frasePagamento([11], PRAZOS, 'Boleto')).toBe('O cliente paga em 1 parcela: 30 dias depois de cada entrega, por Boleto.')
  })
  it('várias parcelas na ordem dos dias, sem repetir, com acento na transferência', () => {
    expect(frasePagamento([20, 11, 18, 11], PRAZOS, 'Transferencia')).toBe(
      'O cliente paga em 3 parcelas: 30, 60 e 90 dias depois de cada entrega, por Transferência.',
    )
  })
})
