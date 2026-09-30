import { describe, expect, it } from 'vitest'

import {
  formatarDias,
  hrefAba,
  lerAba,
  lerFiltrosPosVenda,
  lerFiltrosRelatorio,
  periodoPadraoRelatorio,
  proporcao,
  queryPosVenda,
  queryRelatorio,
} from './sac-paineis'

const UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

describe('abas', () => {
  it('lê só as quatro abas conhecidas', () => {
    expect(lerAba({ aba: 'relatorios' })).toBe('relatorios')
    expect(lerAba({ aba: 'posvenda' })).toBe('posvenda')
    expect(lerAba({ aba: 'nps' })).toBe('nps')
    expect(lerAba({ aba: 'xyz' })).toBe('chamados')
    expect(lerAba({})).toBe('chamados')
  })
  it('Chamados é a raiz', () => {
    expect(hrefAba('chamados')).toBe('/sac')
    expect(hrefAba('posvenda')).toBe('/sac?aba=posvenda')
  })
})

describe('relatórios', () => {
  it('padrão: os 12 meses até hoje', () => {
    expect(periodoPadraoRelatorio('2026-09-30')).toEqual({ de: '2025-10-01', ate: '2026-09-30' })
    expect(periodoPadraoRelatorio('2026-01-15')).toEqual({ de: '2025-02-01', ate: '2026-01-15' })
  })
  it('período válido da URL e responsável', () => {
    const r = lerFiltrosRelatorio({ de: '2026-01-01', ate: '2026-03-31', responsavel: UUID.toUpperCase() }, '2026-09-30')
    expect(r).toEqual({ filtros: { de: '2026-01-01', ate: '2026-03-31', responsavel: UUID }, aviso: null })
  })
  it('período ruim volta ao padrão com aviso', () => {
    const r = lerFiltrosRelatorio({ de: '2026-05-01', ate: '2026-04-01' }, '2026-09-30')
    expect(r.filtros.de).toBe('2025-10-01')
    expect(r.aviso).toMatch(/anterior/)
    expect(lerFiltrosRelatorio({ de: '2026-05-01' }, '2026-09-30').aviso).toMatch(/incompleto/)
  })
  it('query string', () => {
    expect(queryRelatorio({ de: '2026-01-01', ate: '2026-02-01', responsavel: null })).toBe('?aba=relatorios&de=2026-01-01&ate=2026-02-01')
  })
  it('dias com uma casa e plural', () => {
    expect(formatarDias('1.8')).toBe('1,8 dia')
    expect(formatarDias(12)).toBe('12,0 dias')
    expect(formatarDias(null)).toBe('—')
  })
  it('proporção da barra', () => {
    expect(proporcao(5, 10)).toBe(0.5)
    expect(proporcao(3, 0)).toBe(0)
  })
})

describe('pós-venda', () => {
  it('filtros da URL', () => {
    expect(lerFiltrosPosVenda({ q: ' agua ', vendedor: 'x', pagina: '3' })).toEqual({ q: 'agua', vendedor: null, pagina: 3 })
    expect(lerFiltrosPosVenda({ vendedor: UUID })).toEqual({ q: '', vendedor: UUID, pagina: 1 })
  })
  it('query string omite o padrão', () => {
    expect(queryPosVenda({ q: '', vendedor: null, pagina: 1 })).toBe('?aba=posvenda')
    expect(queryPosVenda({ q: 'a b', vendedor: UUID, pagina: 1 }, { pagina: 2 })).toBe(`?aba=posvenda&q=a+b&vendedor=${UUID}&pagina=2`)
  })
})
