import { describe, expect, it } from 'vitest'

import {
  diasUteis,
  hojeSaoPaulo,
  iniciais,
  metaDiaria,
  montarPodio,
  nomeCurto,
  ordenarRanking,
  razaoExata,
} from './metas-painel'

describe('razaoExata', () => {
  it('divide reais sem float, truncando em 4 casas', () => {
    expect(razaoExata('73056.00', '86337.50')).toBe('0.8461')
    expect(razaoExata('45842.60', '45000.00')).toBe('1.0187')
    expect(razaoExata('0', '100')).toBe('0.0000')
  })
  it('não há razão sem denominador', () => {
    expect(razaoExata('10', '0')).toBeNull()
    expect(razaoExata('10', null)).toBeNull()
    expect(razaoExata(null, '10')).toBeNull()
  })
})

describe('diasUteis', () => {
  it('conta segunda a sexta, inclusive', () => {
    expect(diasUteis('2026-09-01', '2026-09-30')).toBe(22)
    expect(diasUteis('2026-09-26', '2026-09-27')).toBe(0) // sábado e domingo
    expect(diasUteis('2026-09-29', '2026-09-29')).toBe(1)
  })
  it('intervalo invertido ou inválido dá zero', () => {
    expect(diasUteis('2026-09-30', '2026-09-01')).toBe(0)
    expect(diasUteis('2026-02-30', '2026-03-01')).toBe(0)
  })
})

describe('metaDiaria', () => {
  it('o que falta ÷ dias úteis restantes, arredondado para cima ao centavo', () => {
    // 29 e 30/09/2026 (ter, qua): 2 dias; falta 100,01 → 50,01 (50,005 sobe)
    expect(metaDiaria('1000.00', '899.99', '2026-09-01', '2026-09-30', '2026-09-29')).toEqual({
      estado: 'aberta',
      valor: '50.01',
      dias: 2,
    })
  })
  it('antes do início conta o período inteiro', () => {
    expect(metaDiaria('2200.00', '0', '2026-09-01', '2026-09-30', '2026-08-15')).toEqual({
      estado: 'aberta',
      valor: '100.00',
      dias: 22,
    })
  })
  it('meta batida, período encerrado e sem meta', () => {
    expect(metaDiaria('100.00', '100.00', '2026-09-01', '2026-09-30', '2026-09-10')).toEqual({ estado: 'atingida' })
    expect(metaDiaria('100.00', '10.00', '2026-08-01', '2026-08-31', '2026-09-10')).toEqual({ estado: 'encerrada' })
    expect(metaDiaria(null, '10', '2026-09-01', '2026-09-30', '2026-09-10')).toEqual({ estado: 'sem-meta' })
  })
})

describe('nomes', () => {
  it('nome curto é primeiro + último', () => {
    expect(nomeCurto('Juliane Analia Neves de Barros Silva')).toBe('Juliane Silva')
    expect(nomeCurto('  Paulo  ')).toBe('Paulo')
    expect(nomeCurto('Barbara Moura')).toBe('Barbara Moura')
  })
  it('iniciais', () => {
    expect(iniciais('Paulo Henrique Vieira')).toBe('PV')
    expect(iniciais('núbia')).toBe('N')
    expect(iniciais('   ')).toBe('?')
  })
})

describe('hojeSaoPaulo', () => {
  it('usa o fuso de São Paulo', () => {
    expect(hojeSaoPaulo(new Date('2026-09-30T02:00:00Z'))).toBe('2026-09-29')
  })
})

describe('pódio e ranking (posição é da view)', () => {
  const r = (id: string, tipo: number, comp: string, posicao: number) => ({
    meta_mensal_id: id,
    tipo_meta_id: tipo,
    competencia: comp,
    posicao,
  })
  const ranking = [
    r('s1', 2, '2026-09-01', 1),
    r('a3', 1, '2026-09-01', 3),
    r('a1', 1, '2026-09-01', 1),
    r('old', 1, '2026-08-01', 1),
    r('a2', 1, '2026-09-01', 2),
    r('a4', 1, '2026-09-01', 4),
  ]
  it('ordena Regular, competência recente, posição', () => {
    expect(ordenarRanking(ranking).map((x) => x.meta_mensal_id)).toEqual(['a1', 'a2', 'a3', 'a4', 'old', 's1'])
  })
  it('pódio = 3 primeiros do Regular da competência mais recente', () => {
    expect(montarPodio(ranking).map((x) => x.meta_mensal_id)).toEqual(['a1', 'a2', 'a3'])
  })
  it('sem Regular, usa Substituição; vazio dá vazio', () => {
    expect(montarPodio([r('s1', 2, '2026-09-01', 1)]).map((x) => x.meta_mensal_id)).toEqual(['s1'])
    expect(montarPodio([])).toEqual([])
  })
})
