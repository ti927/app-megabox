import { describe, expect, it } from 'vitest'

import type { UsuarioAtual } from '@/lib/autorizacao'

import {
  compararDecimal,
  ETAPA,
  formatarDia,
  formatarQuantidade,
  idsMenorLiquido,
  intervaloCriacao,
  lerFiltros,
  lerQuantidade,
  lerReais,
  mesCorrente,
  paraQuery,
  podeEditarCotacao,
  podeSerVencedor,
  primeiroNome,
  regrasColunas,
  validadePadrao,
  validarCotacao,
  validarItem,
  validarOrcamento,
} from './vendas'

const AGORA = new Date('2026-02-10T15:00:00Z')
const ID = '11111111-1111-4111-8111-111111111111'
const OUTRO = '22222222-2222-4222-8222-222222222222'

function usuario(perfilId: number): UsuarioAtual {
  return {
    id: ID,
    nome: 'Teste',
    perfilId,
    departamentoId: 3,
    ehDiretor: perfilId === 1,
    ehGerenciaOuAcima: perfilId <= 2,
  }
}

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

describe('período', () => {
  it('mês corrente termina no último dia de verdade (bug do dia 31 do Bubble)', () => {
    expect(mesCorrente(AGORA)).toEqual({ de: '2026-02-01', ate: '2026-02-28' })
    expect(mesCorrente(new Date('2028-02-15T12:00:00Z'))).toEqual({ de: '2028-02-01', ate: '2028-02-29' })
    expect(mesCorrente(new Date('2026-08-20T12:00:00Z')).ate).toBe('2026-08-31')
  })

  it('usa o fuso de São Paulo: 01/03 00:30 UTC ainda é fevereiro', () => {
    expect(mesCorrente(new Date('2026-03-01T00:30:00Z')).de).toBe('2026-02-01')
  })

  it('intervalo de criação é [de 00:00, ate+1 00:00) em -03:00', () => {
    expect(intervaloCriacao('2026-02-01', '2026-02-28')).toEqual({
      desde: '2026-02-01T00:00:00-03:00',
      antes: '2026-03-01T00:00:00-03:00',
    })
  })
})

describe('filtros da URL', () => {
  it('padrão: mês corrente, colunas sem arquivadas/concluídos/cancelados', () => {
    const f = lerFiltros({}, AGORA)
    expect(f.de).toBe('2026-02-01')
    expect(f.arquivadas).toBe(false)
    expect(f.lim).toEqual({ cot: 1, ped: 1, ent: 1, sub: 1 })
    expect(paraQuery(f, {}, AGORA)).toBe('')
  })

  it('valor inválido cai no padrão em vez de ir cru para a consulta', () => {
    const f = lerFiltros(
      { de: '2026-02-30', ate: '2026-02-01', vendedor: "x' or 1=1", numero: '57a60', lc: '999', sel: 'nada' },
      AGORA,
    )
    expect(f.de).toBe('2026-02-01')
    expect(f.vendedor).toBeNull()
    expect(f.numero).toBe('5760')
    expect(f.lim.cot).toBe(1)
    expect(f.sel).toBeNull()
  })

  it('ida e volta pela query string', () => {
    const f = lerFiltros(
      { de: '2026-01-01', ate: '2026-01-31', vendedor: ID, cliente: 'coca', cancelados: '1', lp: '3', sel: OUTRO, aba: 'pedidos' },
      AGORA,
    )
    expect(lerFiltros(Object.fromEntries(new URLSearchParams(paraQuery(f, {}, AGORA))), AGORA)).toEqual(f)
  })
})

describe('regras das colunas (spec §3.1–3.4)', () => {
  const base = lerFiltros({ vendedor: OUTRO }, AGORA)

  it('Analista/Operador ficam presos ao próprio id (bTiYV), gerente escolhe', () => {
    expect(regrasColunas(base, usuario(3)).vendedor).toBe(ID)
    expect(regrasColunas(base, usuario(4)).vendedor).toBe(ID)
    expect(regrasColunas(base, usuario(2)).vendedor).toBe(OUTRO)
  })

  it('padrão: Cotação / Pedido não finalizado / Em Entrega', () => {
    const r = regrasColunas(base, usuario(2))
    expect(r.cotacao.etapa).toEqual({ eq: ETAPA.COTACAO })
    expect(r.pedido).toEqual({ etapa: ETAPA.PEDIDO, finalizado: false })
    expect(r.entrega).toEqual({ status: ETAPA.EM_ENTREGA, dataPeriodo: 'dt_pedido' })
  })

  it('"Pedir" (2) e "Pedido" (3) não se confundem: a coluna Pedido usa 3', () => {
    expect(ETAPA.PEDIR).toBe(2)
    expect(regrasColunas(base, usuario(1)).pedido.etapa).toBe(3)
  })

  it('exibe concluídos: pedidos finalizados, entregas em Financeiro pela data real', () => {
    const r = regrasColunas({ ...base, concluidos: true }, usuario(2))
    expect(r.pedido.finalizado).toBe(true)
    expect(r.entrega).toEqual({ status: ETAPA.FINANCEIRO, dataPeriodo: 'dt_entrega' })
    expect(r.cotacao.etapa).toEqual({ eq: ETAPA.COTACAO })
  })

  it('só o Diretor com concluídos vê cotações de toda etapa menos Cancelado', () => {
    expect(regrasColunas({ ...base, concluidos: true }, usuario(1)).cotacao.etapa).toEqual({
      neq: ETAPA.CANCELADO,
    })
  })

  it('exibe cancelados: pedido e entrega Cancelado', () => {
    const r = regrasColunas({ ...base, cancelados: true }, usuario(2))
    expect(r.pedido.etapa).toBe(ETAPA.CANCELADO)
    expect(r.entrega.status).toBe(ETAPA.CANCELADO)
  })

})

describe('dinheiro exato', () => {
  // A soma do cartão (total dos vencedores, valor do pedido) é do banco: v_kanban_cotacoes e
  // v_kanban_pedidos (db/015), com numeric. Aqui só a comparação exata.
  it('recusa texto que não é decimal', () => {
    expect(() => compararDecimal('1e3', '0')).toThrow()
    expect(() => compararDecimal('1.2345678', '0')).toThrow()
  })

  it('compara até 6 casas', () => {
    expect(compararDecimal('8.9', '8.90')).toBe(0)
    expect(compararDecimal('6.379425', '6.379426')).toBe(-1)
    expect(compararDecimal('-1', '0')).toBe(-1)
  })

  it('menor líquido do item pinta o(s) mais barato(s); sozinho não pinta', () => {
    const lista = [
      { id: 'a', valor_venda_liquido: '445000.00' },
      { id: 'b', valor_venda_liquido: '319287.45' },
      { id: 'c', valor_venda_liquido: '319287.45' },
    ]
    expect(idsMenorLiquido(lista)).toEqual(['b', 'c'])
    expect(idsMenorLiquido([lista[0]!])).toEqual([])
  })

  it('vencedor exige unitário e comissão ≥ 0,01, salvo amostra (bTOUP0)', () => {
    expect(podeSerVencedor({ valor_venda_unit: '8.90', valor_comissao_unit: '0.30' }, false)).toBe(true)
    expect(podeSerVencedor({ valor_venda_unit: '8.90', valor_comissao_unit: '0.00' }, false)).toBe(false)
    expect(podeSerVencedor({ valor_venda_unit: '0.00', valor_comissao_unit: '0.00' }, true)).toBe(true)
  })
})

describe('leitura do que foi digitado', () => {
  it('reais em pt-BR, string→string', () => {
    expect(lerReais('R$ 1.234,56')).toBe('1234.56')
    expect(lerReais('8,9')).toBe('8.90')
    expect(lerReais('8.90')).toBe('8.90')
    expect(lerReais('1.234')).toBe('1234.00')
    expect(lerReais('0,3')).toBe('0.30')
    expect(lerReais('1,234')).toBeNull()
    expect(lerReais('abc')).toBeNull()
    expect(lerReais('-5')).toBeNull()
  })

  it('quantidade com até 3 casas e maior que zero', () => {
    expect(lerQuantidade('50000')).toBe('50000.000')
    expect(lerQuantidade('1.500')).toBe('1500.000')
    expect(lerQuantidade('1,5')).toBe('1.500')
    expect(lerQuantidade('2.5')).toBe('2.500')
    expect(lerQuantidade('0')).toBeNull()
    expect(lerQuantidade('1,2345')).toBeNull()
  })

  it('quantidade do banco em pt-BR, sem float', () => {
    expect(formatarQuantidade('50000.000')).toBe('50.000')
    expect(formatarQuantidade('1.500')).toBe('1,5')
    expect(formatarQuantidade('1234567.125')).toBe('1.234.567,125')
    expect(formatarQuantidade(null)).toBe('—')
  })

  it('primeiro nome com inicial maiúscula', () => {
    expect(primeiroNome('gabriella carvalho')).toBe('Gabriella')
    expect(primeiroNome(null)).toBe('—')
  })

  it('datas do tipo date não passam por Date (31/08 não vira 30/08)', () => {
    expect(formatarDia('2026-08-31')).toBe('31/08/26')
    expect(formatarDia(null)).toBe('—')
  })

  it('validade padrão = hoje + 2 dias, virando o mês', () => {
    expect(validadePadrao('2026-02-27')).toBe('2026-03-01')
  })
})

describe('validação no servidor', () => {
  it('cotação: cliente da lista, empresa e validade não vencida', () => {
    const ok = validarCotacao(
      form({ cliente_id: ID, empresa_emissora_id: '1', data_validade: '2026-02-12', amostra: 'on' }),
      '2026-02-10',
    )
    expect(ok).toEqual({
      ok: true,
      dados: { cliente_id: ID, empresa_emissora_id: 1, data_validade: '2026-02-12', amostra: true },
    })
    expect(validarCotacao(form({ cliente_id: 'coca', empresa_emissora_id: '1', data_validade: '2026-02-12' }), '2026-02-10').ok).toBe(false)
    expect(validarCotacao(form({ cliente_id: ID, empresa_emissora_id: '1', data_validade: '2026-02-01' }), '2026-02-10').ok).toBe(false)
  })

  it('item: quantidade exata, destino obrigatório', () => {
    const r = validarItem(
      form({ cotacao_id: ID, produto_id: OUTRO, qtd: '50.000', endereco_destino_id: ID, condicao_id: '2', linha_id: '' }),
    )
    expect(r.ok && r.dados.qtd).toBe('50000.000')
    expect(r.ok && r.dados.linha_id).toBeNull()
    expect(validarItem(form({ cotacao_id: ID, produto_id: OUTRO, qtd: '5' })).ok).toBe(false)
  })

  it('orçamento: frete só vale com CIF Informado (bTOSo0)', () => {
    const fob = validarOrcamento(
      form({ cotacao_item_id: ID, endereco_origem_id: OUTRO, valor_venda_unit: '8,90', valor_comissao_unit: '0,30', tipo_frete_id: '1', valor_frete: '500' }),
    )
    expect(fob.ok && fob.dados).toMatchObject({ valor_venda_unit: '8.90', valor_comissao_unit: '0.30', valor_frete: '0.00' })
    const cif = validarOrcamento(
      form({ cotacao_item_id: ID, endereco_origem_id: OUTRO, tipo_frete_id: '2', valor_frete: '1.500,00' }),
    )
    expect(cif.ok && cif.dados).toMatchObject({ valor_venda_unit: '0.00', valor_frete: '1500.00' })
  })

  it('cotação arquivada só o Diretor edita', () => {
    expect(podeEditarCotacao(usuario(2), { arquivado: true })).toBe(false)
    expect(podeEditarCotacao(usuario(1), { arquivado: true })).toBe(true)
    expect(podeEditarCotacao(usuario(4), { arquivado: false })).toBe(true)
  })
})
