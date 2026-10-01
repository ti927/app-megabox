import { describe, expect, it } from 'vitest'

import {
  agregarAnual,
  agruparAnalise,
  kpisAnuais,
  type LinhaAnual,
  mediaComMovimento,
  metasColetivas,
  origemDoMes,
  razao,
} from './metas-relatorios'

const l = (mes: number, v: string, x: Partial<LinhaAnual> = {}): LinhaAnual => ({
  mes,
  vendedor_id: v,
  fechado: '0.00',
  entregue: '0.00',
  cancelado: '0.00',
  faturado: '0.00',
  qtd_fechado: 0,
  qtd_entregue: 0,
  qtd_faturado: 0,
  meta: '0.00',
  com_megabox: '0.00',
  com_vendedor: '0.00',
  mes_encerrado: false,
  ...x,
})

describe('agregarAnual', () => {
  const linhas = [
    l(1, 'a', { faturado: '0.10', fechado: '0.20', mes_encerrado: true, qtd_faturado: 1 }),
    l(1, 'b', { faturado: '0.20', mes_encerrado: true, qtd_faturado: 2 }),
    l(3, 'a', { faturado: '100.005', meta: '50.00' }),
  ]
  it('soma exata por mês e vendedor (0,1 + 0,2 = 0,3)', () => {
    const a = agregarAnual(linhas)
    expect(a.meses[0]!.faturado).toBe('0.30')
    expect(a.meses[0]!.qtd.faturado).toBe(3)
    expect(a.total.faturado).toBe('100.31')
    expect(a.encerrado[0]).toBe(true)
    expect(a.encerrado[2]).toBe(false)
    expect(a.vendedores).toHaveLength(2)
  })
  it('filtro de vendedor vale para as séries, mas o mês encerrado é global', () => {
    const a = agregarAnual(linhas, 'b')
    expect(a.total.faturado).toBe('0.20')
    expect(a.encerrado[0]).toBe(true)
  })
})

describe('metasColetivas', () => {
  it('janeiro puxa out–dez do ano anterior; piso de 80.000', () => {
    const anterior = [l(10, 'a', { com_megabox: '90000.00' }), l(11, 'a', { com_megabox: '90000.00' }), l(12, 'a', { com_megabox: '90000.00' })]
    const m = metasColetivas([], anterior)
    expect(m[0]!.valor).toBe('112500.00') // 90.000 × 1,25
    expect(m[0]!.media).toBe('90000.00')
    expect(m[0]!.noPiso).toBe(false)
    expect(m[3]!.valor).toBe('80000.00') // jan–mar sem fechamento → piso
    expect(m[3]!.noPiso).toBe(true)
  })
})

describe('contas de tela', () => {
  it('razão exata e nula sem divisor', () => {
    expect(razao('1420.00', '12000.00')).toBe('0.1183')
    expect(razao('1', '0')).toBeNull()
  })
  it('média só dos meses com movimento', () => {
    expect(mediaComMovimento(['0.00', '10.00', '20.01'])).toBe('15.01')
    expect(mediaComMovimento(['0.00'])).toBeNull()
  })
  it('KPIs: em aberto nunca negativo, variação sobre o ano anterior', () => {
    const atual = agregarAnual([l(1, 'a', { faturado: '150.00', fechado: '100.00' })])
    const ant = agregarAnual([l(1, 'a', { faturado: '100.00' })])
    const k = kpisAnuais(atual, ant, metasColetivas([], []), 'faturado', null)
    expect(k.emAberto).toBe('0.00')
    expect(k.variacao).toBe('0.5000')
    expect(k.mesesComMovimento).toBe(1)
    expect(k.metaAcumulada).toBe('960000.00') // 12 × piso, ano encerrado
  })
  it('origem do mês', () => {
    const a = agregarAnual([l(2, 'a', { faturado: '1.00' })])
    expect(origemDoMes(a.meses[0]!, 0, false, null)).toBe('sem-lancamento')
    expect(origemDoMes(a.meses[1]!, 1, false, 1)).toBe('andamento')
    expect(origemDoMes(a.meses[1]!, 1, true, 5)).toBe('encerrado')
    expect(origemDoMes(a.meses[1]!, 1, false, 5)).toBe('sem-fechamento')
  })
  it('análise: barras pela contagem e total exato', () => {
    const g = agruparAnalise(
      [
        { categoria: 'realizada', vendedor_id: 'a', qtd: 2, valor_comissao: '1420.00', valor_venda: '0' },
        { categoria: 'realizada', vendedor_id: 'b', qtd: 10, valor_comissao: '5141.50', valor_venda: '0' },
        { categoria: 'cancelada', vendedor_id: 'c', qtd: 1, valor_comissao: '100.00', valor_venda: '0' },
      ],
      'realizada',
    )
    expect(g.grupos.map((x) => x.vendedor_id)).toEqual(['b', 'a'])
    expect(g.qtd).toBe(12)
    expect(g.comissao).toBe('6561.50')
  })
})
