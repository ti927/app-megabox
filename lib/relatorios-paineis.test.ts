import { describe, expect, it } from 'vitest'

import {
  anosDisponiveis,
  botoesPagina,
  comExtras,
  destaquesCotacao,
  destaquesProspeccao,
  faixaCobertura,
  iniciais,
  lerExtras,
  limitesDoMes,
  mesAnoDe,
  mesesDoPeriodo,
  nomeCurto,
  ordenarPor,
  participacao,
  percentualInteiro,
  percentualUmaCasa,
  picoDiario,
  pontosPercentuais,
  resumoLista,
  totalPaginas,
  umaCasa,
  type VendedorCotacao,
  type VendedorProspeccao,
} from './relatorios-paineis'

const vc = (nome: string, total: number, ativas: number, pedidos: number, faturamento: string): VendedorCotacao => ({
  vendedor_id: nome,
  nome,
  total,
  ativas,
  pedidos,
  conversao: ativas ? pedidos / ativas : 0,
  faturamento,
})

const vp = (nome: string, enviadas: number, clientes: number, carteira: number): VendedorProspeccao => ({
  vendedor_id: nome,
  nome,
  foto_path: null,
  enviadas,
  clientes,
  carteira,
  cobertura: carteira ? clientes / carteira : 0,
  cobertura_propostas: carteira ? enviadas / carteira : 0,
  media_dia: 0,
})

describe('parâmetros extras', () => {
  it('lê página e filtros, com limites', () => {
    expect(lerExtras({ pagina: '3', fprod: ' palete ', fuf: 'goiás', fcli: 'x'.repeat(200) })).toEqual({
      pagina: 3,
      produto: 'palete',
      fornecedor: '',
      uf: 'GO',
      cliente: 'x'.repeat(80),
    })
    expect(lerExtras({ pagina: '-1' }).pagina).toBe(1)
    expect(lerExtras({ pagina: '2.5' }).pagina).toBe(1)
    expect(lerExtras({ pagina: ['4', '9'] }).pagina).toBe(4)
  })

  it('tira caractere de controle', () => {
    expect(lerExtras({ fforn: 'a\u0000b\nc' }).fornecedor).toBe('abc')
  })

  it('acrescenta só o que não é padrão', () => {
    expect(comExtras('?aba=cotacao', { pagina: 2 })).toBe('?aba=cotacao&pagina=2')
    expect(comExtras('?a=1', { pagina: 1, produto: '', uf: 'SP' })).toBe('?a=1&fuf=SP')
    expect(comExtras('', {})).toBe('')
  })
})

describe('mês do painel', () => {
  it('mês e ano de uma data', () => {
    expect(mesAnoDe('2026-09-15')).toEqual({ ano: 2026, mes: 9 })
  })
  it('limites do mês, inclusive fevereiro bissexto', () => {
    expect(limitesDoMes(2028, 2)).toEqual({ inicio: '2028-02-01', fim: '2028-02-29' })
    expect(limitesDoMes(2026, 12)).toEqual({ inicio: '2026-12-01', fim: '2026-12-31' })
  })
  it('anos do select, do corrente até 2020', () => {
    expect(anosDisponiveis(2022)).toEqual([2022, 2021, 2020])
  })
})

describe('apresentação', () => {
  it('percentual inteiro como o HTML C', () => {
    expect(percentualInteiro(0.356)).toBe('36%')
    expect(percentualInteiro('0.1449')).toBe('14%')
    expect(percentualInteiro(null)).toBe('—')
  })
  it('percentual com uma casa e vírgula', () => {
    expect(percentualUmaCasa(0.8571)).toBe('85,7%')
    expect(percentualUmaCasa(0.5)).toBe('50,0%')
    expect(participacao(4, 28)).toBe('14,3%')
    expect(participacao(1, 0)).toBe('0,0%')
  })
  it('pontos percentuais entre inteiros arredondados (captura: 14% vs 40% = -26 p.p.)', () => {
    expect(pontosPercentuais(0.1429, 0.4)).toBe(-26)
    expect(pontosPercentuais(0.505, 0.5)).toBe(1)
  })
  it('iniciais e nome curto', () => {
    expect(iniciais('nubia alves de carvalho')).toBe('NA')
    expect(iniciais('  paulo  ')).toBe('P')
    expect(nomeCurto('barbara oliveira moura')).toBe('barbara oliveira')
    expect(nomeCurto('')).toBe('—')
  })
  it('faixas da cobertura', () => {
    expect(faixaCobertura(0.7)).toBe('alta')
    expect(faixaCobertura(0.295)).toBe('media')
    expect(faixaCobertura(0.04)).toBe('baixa')
  })
  it('uma casa e resumo de lista', () => {
    expect(umaCasa(1.94)).toBe('1,9')
    expect(umaCasa(null)).toBe('—')
    expect(resumoLista([])).toBe('—')
    expect(resumoLista(['A'])).toBe('A')
    expect(resumoLista(['A', 'B', 'C'])).toBe('A +2')
  })
})

describe('destaques', () => {
  it('cotação: faturamento > 0, volume, conversão com mínimo de 3 ativas', () => {
    const lista = [vc('ana', 10, 10, 2, '0.00'), vc('bia', 4, 2, 2, '0'), vc('caio', 8, 5, 3, '1500.50')]
    const d = destaquesCotacao(lista)
    expect(d.faturamento?.nome).toBe('caio')
    expect(d.volume?.nome).toBe('ana')
    // bia tem 100% mas só 2 ativas: fica de fora (evita 1/1 = 100%)
    expect(d.conversao?.nome).toBe('caio')
  })
  it('cotação: sem ninguém elegível, a conversão vale entre todos; sem valor, sem destaque', () => {
    const d = destaquesCotacao([vc('ana', 1, 1, 0, '0'), vc('bia', 2, 2, 1, '0')])
    expect(d.conversao?.nome).toBe('bia')
    expect(d.faturamento).toBeNull()
    expect(destaquesCotacao([]).volume).toBeNull()
  })
  it('prospecção: cobertura só de quem tem carteira', () => {
    const d = destaquesProspeccao([vp('ana', 14, 11, 264), vp('bia', 11, 10, 0), vp('caio', 5, 2, 20)])
    expect(d.enviadas?.nome).toBe('ana')
    expect(d.clientes?.nome).toBe('ana')
    expect(d.cobertura?.nome).toBe('caio')
  })
  it('pico diário: primeiro dia com o máximo', () => {
    expect(picoDiario([{ dia: 'a', propostas: 0 }, { dia: 'b', propostas: 3 }, { dia: 'c', propostas: 3 }])?.dia).toBe('b')
    expect(picoDiario([{ dia: 'a', propostas: 0 }])).toBeNull()
  })
})

describe('matriz, ordem e paginação', () => {
  it('meses do período atravessando o ano', () => {
    expect(mesesDoPeriodo('2025-11-15', '2026-02-01')).toEqual(['2025-11-01', '2025-12-01', '2026-01-01', '2026-02-01'])
    expect(mesesDoPeriodo('2026-03-01', '2026-03-31')).toEqual(['2026-03-01'])
  })
  it('ordena texto numérico do banco como número, nulos no fim', () => {
    const linhas = [{ v: '100.50' }, { v: '9.99' }, { v: null }, { v: '1000' }]
    expect(ordenarPor(linhas, (l) => l.v, 'desc').map((l) => l.v)).toEqual(['1000', '100.50', '9.99', null])
    expect(ordenarPor(linhas, (l) => l.v, 'asc').map((l) => l.v)).toEqual(['9.99', '100.50', '1000', null])
  })
  it('ordena texto em pt-BR sem caixa e é estável', () => {
    const linhas = [{ n: 'Óleo', i: 1 }, { n: 'abacate', i: 2 }, { n: 'Óleo', i: 3 }]
    expect(ordenarPor(linhas, (l) => l.n, 'asc').map((l) => l.i)).toEqual([2, 1, 3])
  })
  it('páginas e botões', () => {
    expect(totalPaginas(0, 25)).toBe(1)
    expect(totalPaginas(51, 25)).toBe(3)
    expect(botoesPagina(1, 2)).toEqual([1, 2])
    expect(botoesPagina(6, 12)).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 12])
  })
})
