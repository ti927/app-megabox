import { describe, expect, it } from 'vitest'

import type { Item, Orcamento } from '@/app/(app)/vendas/tipos'

import {
  aplicarCarrinho,
  aplicarPartes,
  comVencedor,
  type FichaTela,
  fluxoPendente,
  mesclarFicha,
  restaurarVencedores,
} from './vendas-ficha'

const item = (id: string): Item => ({
  id,
  qtd: '1',
  medida: null,
  produto_id: 'p',
  condicao_id: null,
  linha_id: null,
  endereco_destino_id: 'd',
  produto: { nome: 'Caixa', grupo_id: null },
  condicao: null,
  linha: null,
  destino: null,
})

const orc = (id: string, itemId: string, vencedor = false): Orcamento =>
  ({ id, cotacao_item_id: itemId, vencedor, valor_venda_unit: '1.00' }) as unknown as Orcamento

function ficha(cotacaoId: string, extra: Partial<FichaTela> = {}): FichaTela {
  return {
    cotacao: { id: cotacaoId } as FichaTela['cotacao'],
    itens: [item('i1')],
    orcamentos: [orc('o1', 'i1', true), orc('o2', 'i1'), orc('o3', 'i2', true)],
    propostas: [{ id: 'pr1' } as FichaTela['propostas'][number]],
    pedidos: [],
    entregas: [],
    contatos: [],
    destinos: [],
    documentoItens: [],
    empresaEmissora: null,
    incompleta: false,
    falhas: [],
    pendentes: [],
    ...extra,
  }
}

describe('mesclarFicha', () => {
  it('parte que falhou agora fica com o último valor bom (não vira lista vazia)', () => {
    const tela = ficha('c1')
    const nova = ficha('c1', { propostas: [], falhas: ['propostas'], incompleta: true, itens: [item('i1'), item('i2')] })
    const r = mesclarFicha(tela, nova)
    expect(r.propostas).toEqual(tela.propostas)
    expect(r.itens).toHaveLength(2)
    expect(r.falhas).toEqual([])
    expect(r.incompleta).toBe(false)
  })

  it('parte falha sem valor bom anterior continua falha', () => {
    const tela = ficha('c1', { pedidos: [], falhas: ['pedidos'] })
    const r = mesclarFicha(tela, ficha('c1', { falhas: ['pedidos'] }))
    expect(r.falhas).toEqual(['pedidos'])
    expect(r.incompleta).toBe(true)
  })

  it('parte não pedida (pendente) reaproveita a da tela; sem ela, continua pendente', () => {
    const tela = ficha('c1', { pendentes: ['entregas'] })
    const r = mesclarFicha(tela, ficha('c1', { propostas: [], pendentes: ['propostas', 'entregas'] }))
    expect(r.propostas).toEqual(tela.propostas)
    expect(r.pendentes).toEqual(['entregas'])
  })

  it('outra cotação: vale a nova, inteira', () => {
    const nova = ficha('c2', { falhas: ['itens'], itens: [] })
    expect(mesclarFicha(ficha('c1'), nova)).toBe(nova)
  })
})

describe('aplicarPartes', () => {
  it('substitui só as partes que vieram e tira da lista de falhas/pendentes', () => {
    const f = ficha('c1', { falhas: ['pedidos'], pendentes: ['entregas'] })
    const r = aplicarPartes(f, { pedidos: [{ id: 'pe1' } as FichaTela['pedidos'][number]], entregas: [] })
    expect(r.pedidos).toHaveLength(1)
    expect(r.falhas).toEqual([])
    expect(r.pendentes).toEqual([])
    expect(r.itens).toBe(f.itens)
  })

  it('falhou de novo: mantém o valor antigo; sem valor antigo, segue falha', () => {
    const f = ficha('c1', { falhas: ['pedidos'] })
    const r = aplicarPartes(f, { propostas: [] }, ['propostas', 'pedidos'])
    expect(r.propostas).toEqual(f.propostas)
    expect(r.falhas).toEqual(['pedidos'])
  })
})

describe('aplicarCarrinho', () => {
  it('carrinho relido da mesma cotação troca itens e orçamentos e mantém o fluxo', () => {
    const f = ficha('c1')
    const r = aplicarCarrinho(f, { cotacaoId: 'c1', partes: { itens: [item('i1'), item('i2')], orcamentos: [] }, falhas: [] })
    expect(r.itens).toHaveLength(2)
    expect(r.orcamentos).toEqual([])
    expect(r.propostas).toBe(f.propostas)
  })

  it('carrinho de OUTRA cotação (a pessoa trocou de ficha no meio) é ignorado', () => {
    const f = ficha('c1')
    expect(aplicarCarrinho(f, { cotacaoId: 'c2', partes: { itens: [] }, falhas: [] })).toBe(f)
  })

  it('releitura que falhou não apaga o carrinho da tela', () => {
    const f = ficha('c1')
    const r = aplicarCarrinho(f, { cotacaoId: 'c1', partes: { itens: [], orcamentos: [] }, falhas: ['itens', 'orcamentos'] })
    expect(r.itens).toBe(f.itens)
    expect(r.orcamentos).toBe(f.orcamentos)
  })
})

describe('fluxoPendente', () => {
  it('aba de propostas/pedidos espera as partes do fluxo; o carrinho não conta', () => {
    expect(fluxoPendente(ficha('c1', { pendentes: ['propostas', 'pedidos'] }))).toBe(true)
    expect(fluxoPendente(ficha('c1', { pendentes: [] }))).toBe(false)
  })
})

describe('troféu otimista', () => {
  it('marcar vencedor desmarca o do MESMO item e não mexe nos outros itens', () => {
    const r = comVencedor(ficha('c1'), 'o2', true)
    expect(r.orcamentos.map((o) => [o.id, o.vencedor])).toEqual([
      ['o1', false],
      ['o2', true],
      ['o3', true],
    ])
  })

  it('desmarcar só desmarca', () => {
    const r = comVencedor(ficha('c1'), 'o1', false)
    expect(r.orcamentos.map((o) => o.vencedor)).toEqual([false, false, true])
  })

  it('orçamento inexistente: nada muda', () => {
    const f = ficha('c1')
    expect(comVencedor(f, 'x', true)).toBe(f)
  })

  it('restaurarVencedores desfaz o troféu otimista exatamente', () => {
    const f = ficha('c1')
    const antes = new Map([
      ['o1', true],
      ['o2', false],
    ])
    const r = restaurarVencedores(comVencedor(f, 'o2', true), antes)
    expect(r.orcamentos.map((o) => o.vencedor)).toEqual([true, false, true])
  })
})
