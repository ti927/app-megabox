import { describe, expect, it } from 'vitest'

import {
  colunaData,
  compararReais,
  deCentavos,
  faixa,
  formatarPercentualExato,
  formatarReaisExato,
  lerFiltros,
  lerNumeroNf,
  lerResumo,
  lerValorExato,
  mesCorrente,
  paraCentavos,
  paraQuery,
  parametrosResumo,
  parametrosVencidos,
  resumoSelecao,
  somarReais,
  totalPaginas,
  validarMotivo,
  validarValorBaixa,
} from './financeiro'

describe('dinheiro em centavos', () => {
  it('converte ida e volta sem float', () => {
    expect(paraCentavos('1234.5')).toBe(123450n)
    expect(paraCentavos('0.07')).toBe(7n)
    expect(paraCentavos('-3.70')).toBe(-370n)
    expect(deCentavos(123450n)).toBe('1234.50')
    expect(deCentavos(-7n)).toBe('-0.07')
  })

  it('recusa formato que o banco não devolve', () => {
    expect(() => paraCentavos('1,5')).toThrow()
    expect(() => paraCentavos('1.234')).toThrow()
  })

  it('soma exata onde o float erra (0,1 + 0,2)', () => {
    expect(somarReais(['0.10', '0.20'])).toBe('0.30')
    // 41,15 + 41,15 + 41,16 = 123,46 — o rateio da 010 (D3) fecha ao centavo
    expect(somarReais(['41.15', '41.15', '41.16'])).toBe('123.46')
    expect(somarReais(['9999999999.99', '0.01'])).toBe('10000000000.00')
    expect(somarReais([])).toBe('0.00')
    expect(somarReais([null, '', undefined, '3.7'])).toBe('3.70')
  })

  it('formata direto do texto', () => {
    expect(formatarReaisExato('1234567.8')).toBe('R$ 1.234.567,80')
    expect(formatarReaisExato('0.07')).toBe('R$ 0,07')
    expect(formatarReaisExato('-3.7')).toBe('-R$ 3,70')
    expect(formatarReaisExato('999')).toBe('R$ 999,00')
    expect(formatarReaisExato(null)).toBe('—')
    expect(formatarReaisExato('abc')).toBe('—')
    expect(formatarPercentualExato('0.0300')).toBe('3,00%')
    expect(formatarPercentualExato('0.0725')).toBe('7,25%')
    expect(formatarPercentualExato('1')).toBe('100,00%')
  })

  it('compara', () => {
    expect(compararReais('10.00', '10')).toBe(0)
    expect(compararReais('10.01', '10.00')).toBe(1)
    expect(compararReais('0.99', '1.00')).toBe(-1)
  })
})

describe('lerValorExato (o que o usuário digita)', () => {
  it.each([
    ['1.234,56', '1234.56'],
    ['1234,56', '1234.56'],
    ['1234.56', '1234.56'],
    ['R$ 1.234,5', '1234.50'],
    ['10', '10.00'],
    ['0,07', '0.07'],
    ['1.234', '1234.00'],
    ['1.5', '1.50'],
    ['12.345.678,90', '12345678.90'],
  ])('%s → %s', (texto, esperado) => {
    expect(lerValorExato(texto)).toBe(esperado)
  })

  it.each(['', 'abc', '1,234,5', '1,234', '-5', '1.23,4', '1.2.3', '10,001'])('recusa %j', (texto) => {
    // "1,234" tem 3 casas decimais: recusado, não arredondado
    expect(lerValorExato(texto)).toBeNull()
  })
})

describe('validarValorBaixa (baixa parcial, D5)', () => {
  it('aceita até o saldo', () => {
    expect(validarValorBaixa('41,15', '41.15')).toEqual({ ok: true, valor: '41.15' })
    expect(validarValorBaixa('10', '41.15')).toEqual({ ok: true, valor: '10.00' })
  })
  it('recusa acima do saldo, zero e lixo', () => {
    expect(validarValorBaixa('41,16', '41.15').ok).toBe(false)
    expect(validarValorBaixa('0', '41.15').ok).toBe(false)
    expect(validarValorBaixa('x', '41.15').ok).toBe(false)
  })
})

describe('filtros', () => {
  const agora = new Date('2026-02-10T12:00:00-03:00')

  it('padrões do carregamento (bTpRZ): a receber, data de entrega, mês corrente de verdade', () => {
    const f = lerFiltros({}, agora)
    expect(f).toMatchObject({ aba: 'receber', data: 'entrega', de: '2026-02-01', ate: '2026-02-28', pagina: 1 })
    expect(mesCorrente(new Date('2024-02-10T12:00:00-03:00'))).toEqual({ de: '2024-02-01', ate: '2024-02-29' })
  })

  it('valor desconhecido cai no padrão', () => {
    const f = lerFiltros(
      { aba: 'x', data: 'y', de: '2026-02-30', ate: '2026-03-01', vendedor: 'nao-uuid', pag: '-3', situacao: 'z' },
      agora,
    )
    expect(f).toMatchObject({ aba: 'receber', data: 'entrega', de: '2026-02-01', vendedor: null, pagina: 1, situacao: '' })
  })

  it('ida e volta pela URL', () => {
    const f = lerFiltros(
      {
        aba: 'pagar',
        data: 'vencimento',
        de: '2026-01-01',
        ate: '2026-01-31',
        situacao: 'vencidas',
        cliente: 'acme',
        pag: '3',
        arquivados: 'sim',
      },
      agora,
    )
    const q = paraQuery(f)
    expect(lerFiltros(Object.fromEntries(new URLSearchParams(q.slice(1))), agora)).toEqual(f)
    expect(paraQuery(f, { pagina: 1 })).not.toContain('pag=')
  })

  it('coluna de data por aba (tipo inexistente na CP cai no vencimento)', () => {
    expect(colunaData('entrega', 'receber')).toBe('dt_entrega')
    expect(colunaData('credito', 'receber')).toBe('ultima_dt_credito')
    expect(colunaData('credito', 'pagar')).toBe('dt_vencimento')
  })

  it('paginação', () => {
    expect(faixa(1)).toEqual({ de: 0, ate: 49 })
    expect(faixa(3)).toEqual({ de: 100, ate: 149 })
    expect(totalPaginas(0)).toBe(1)
    expect(totalPaginas(101)).toBe(3)
  })
})

describe('seleção', () => {
  it('soma o saldo exato e acusa mais de um fornecedor', () => {
    expect(
      resumoSelecao([
        { id: 'a', saldo: '41.15', fornecedorId: 'f1' },
        { id: 'b', saldo: '41.16', fornecedorId: 'f1' },
      ]),
    ).toEqual({ qtd: 2, saldo: '82.31', fornecedorUnico: 'f1' })
    expect(
      resumoSelecao([
        { id: 'a', saldo: '1.00', fornecedorId: 'f1' },
        { id: 'b', saldo: '1.00', fornecedorId: 'f2' },
      ]).fornecedorUnico,
    ).toBeNull()
  })
})

describe('entradas de texto', () => {
  it('motivo do estorno é obrigatório', () => {
    expect(validarMotivo('  ').ok).toBe(false)
    expect(validarMotivo('baixa em duplicidade')).toEqual({ ok: true, motivo: 'baixa em duplicidade' })
  })
  it('número de NF vazio vira nulo', () => {
    expect(lerNumeroNf('  ')).toBeNull()
    expect(lerNumeroNf(' 123 ')).toBe('123')
  })
})

describe('resumo do recorte (fn_resumo_financeiro, db/020)', () => {
  const agora = new Date('2026-09-15T12:00:00-03:00')

  it('leva à função o MESMO recorte da lista', () => {
    const f = lerFiltros(
      { aba: 'receber', data: 'pedido', de: '2026-09-01', ate: '2026-09-30', situacao: 'aberto', pedido: '1234', arquivados: 'sim' },
      agora,
    )
    expect(parametrosResumo(f, { cliente: ['c1'], fornecedor: null })).toEqual({
      p_aba: 'receber',
      p_coluna_data: 'dt_pedido',
      p_de: '2026-09-01',
      p_ate: '2026-09-30',
      p_situacao: 'aberto',
      p_arquivados: true,
      p_clientes: ['c1'],
      p_fornecedores: null,
      p_vendedor: null,
      p_pedido: '1234',
    })
  })

  it('a pagar: tipo de data que não existe na aba cai no vencimento; pedido vazio vira nulo', () => {
    const f = lerFiltros({ aba: 'pagar', data: 'credito' }, agora)
    const p = parametrosResumo(f, { cliente: null, fornecedor: null })
    expect(p.p_aba).toBe('pagar')
    expect(p.p_coluna_data).toBe('dt_vencimento')
    expect(p.p_pedido).toBeNull()
  })

  it('vencidos ignora os filtros e não conta arquivada', () => {
    expect(parametrosVencidos('pagar')).toMatchObject({
      p_aba: 'pagar',
      p_situacao: 'vencidas',
      p_arquivados: false,
      p_coluna_data: null,
      p_clientes: null,
      p_vendedor: null,
    })
  })

  it('lê o dinheiro do banco como texto exato, sem float', () => {
    expect(lerResumo({ qtd: 3, comissao: '123.46', saldo: '0.1' })).toEqual({ qtd: 3, comissao: '123.46', saldo: '0.10' })
    expect(lerResumo({ qtd: 0, comissao: '0.00', saldo: '-3.70' })).toEqual({ qtd: 0, comissao: '0.00', saldo: '-3.70' })
    expect(lerResumo({ qtd: 1, comissao: '10000000000.01', saldo: '9999999999.99' })?.comissao).toBe('10000000000.01')
  })

  it('linha ausente ou fora do formato é falha, não total zero', () => {
    expect(lerResumo(null)).toBeNull()
    expect(lerResumo({ qtd: 1, comissao: 12.5, saldo: '1.00' })).toBeNull()
    expect(lerResumo({ qtd: 1, comissao: '1,5', saldo: '1.00' })).toBeNull()
    expect(lerResumo({ qtd: -1, comissao: '1.00', saldo: '1.00' })).toBeNull()
  })
})
