import { describe, expect, it } from 'vitest'

import { resultadoDoAviso } from './aviso-acao'

describe('resultadoDoAviso', () => {
  it('erro da action vira aviso vermelho com a mensagem', () => {
    expect(resultadoDoAviso({ erro: 'Sem permissão.' }, undefined)).toEqual({ erro: 'Sem permissão.', pronto: false })
  })
  it('erro vence o texto de pronto explícito', () => {
    expect(resultadoDoAviso({ erro: 'x' }, 'Salvo')).toEqual({ erro: 'x', pronto: false })
  })
  it('erro vazio não é erro', () => {
    expect(resultadoDoAviso({ erro: '  ', ok: 'Feito.' }, undefined)).toEqual({ erro: null, pronto: 'Feito.' })
  })
  it('pronto explícito vence o ok da action', () => {
    expect(resultadoDoAviso({ ok: 'Produto adicionado.' }, 'No carrinho')).toEqual({ erro: null, pronto: 'No carrinho' })
  })
  it('sem texto nenhum, "Pronto"', () => {
    expect(resultadoDoAviso(undefined, undefined)).toEqual({ erro: null, pronto: 'Pronto' })
    expect(resultadoDoAviso([1, 2], undefined)).toEqual({ erro: null, pronto: 'Pronto' })
  })
  it('pronto false some calado', () => {
    expect(resultadoDoAviso({ ok: 'x' }, false)).toEqual({ erro: null, pronto: false })
  })
})
