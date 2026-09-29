import { describe, expect, it } from 'vitest'

import {
  destinoPadrao,
  iniciais,
  linhaPadrao,
  produtosDoGrupo,
  qtdParaCampo,
  reaisParaCampo,
  rotuloEndereco,
  validarCabecalho,
  validarEdicaoOrcamento,
  validarProdutoCarrinho,
  validarQtdItem,
} from './cotacao-tela'

const ID = '11111111-1111-4111-8111-111111111111'
const OUTRO = '22222222-2222-4222-8222-222222222222'

function form(campos: Record<string, string>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

describe('validarCabecalho', () => {
  const base = { cotacao_id: ID, empresa_emissora_id: '1', data_validade: '2026-09-30' }

  it('aceita o cabeçalho completo e lê o checkbox de amostra', () => {
    const r = validarCabecalho(form({ ...base, amostra: 'on' }), '2026-09-29')
    expect(r).toEqual({
      ok: true,
      dados: { cotacao_id: ID, empresa_emissora_id: 1, data_validade: '2026-09-30', amostra: true },
    })
    const sem = validarCabecalho(form(base), '2026-09-29')
    expect(sem.ok && sem.dados.amostra).toBe(false)
  })

  it('recusa cotação, empresa e validade inválidas', () => {
    expect(validarCabecalho(form({ ...base, cotacao_id: 'x' }), '2026-09-29').ok).toBe(false)
    expect(validarCabecalho(form({ ...base, empresa_emissora_id: '' }), '2026-09-29').ok).toBe(false)
    expect(validarCabecalho(form({ ...base, empresa_emissora_id: '1.5' }), '2026-09-29').ok).toBe(false)
    expect(validarCabecalho(form({ ...base, data_validade: '2026-02-30' }), '2026-01-01').ok).toBe(false)
  })

  it('validade no passado só passa se é a que já estava gravada', () => {
    const passado = { ...base, data_validade: '2026-09-01' }
    expect(validarCabecalho(form(passado), '2026-09-29')).toEqual({
      ok: false,
      erro: 'A validade não pode ser anterior a hoje.',
    })
    expect(validarCabecalho(form(passado), '2026-09-29', '2026-09-01').ok).toBe(true)
    expect(validarCabecalho(form(passado), '2026-09-29', '2026-09-02').ok).toBe(false)
  })
})

describe('validarProdutoCarrinho', () => {
  it('lê produto, qtd pt-BR, condição, linha e medida', () => {
    const r = validarProdutoCarrinho(
      form({ produto_id: ID.toUpperCase(), qtd: '1.500', condicao_id: '2', linha_id: '', medida: ' 1,20 x 1,00 ' }),
    )
    expect(r).toEqual({
      ok: true,
      dados: { produto_id: ID, qtd: '1500.000', condicao_id: 2, linha_id: null, medida: '1,20 x 1,00' },
    })
  })

  it('recusa produto ausente, qtd zero e ids fora da lista', () => {
    expect(validarProdutoCarrinho(form({ produto_id: '', qtd: '1' })).ok).toBe(false)
    expect(validarProdutoCarrinho(form({ produto_id: ID, qtd: '0' })).ok).toBe(false)
    expect(validarProdutoCarrinho(form({ produto_id: ID, qtd: '1', condicao_id: 'abc' })).ok).toBe(false)
    expect(validarProdutoCarrinho(form({ produto_id: ID, qtd: '1', medida: 'x'.repeat(501) })).ok).toBe(false)
  })
})

describe('validarQtdItem', () => {
  it('aceita qtd com até 3 casas e recusa o resto', () => {
    expect(validarQtdItem(form({ item_id: ID, qtd: '12,5' }))).toEqual({ ok: true, dados: { item_id: ID, qtd: '12.500' } })
    expect(validarQtdItem(form({ item_id: ID, qtd: '1,2345' })).ok).toBe(false)
    expect(validarQtdItem(form({ item_id: 'x', qtd: '1' })).ok).toBe(false)
  })
})

describe('validarEdicaoOrcamento', () => {
  it('lê os reais como string exata, sem float', () => {
    const r = validarEdicaoOrcamento(
      form({ orcamento_id: ID, valor_venda_unit: 'R$ 8,90', valor_comissao_unit: '0,3', tipo_frete_id: '2', valor_frete: '1.250,00' }),
    )
    expect(r).toEqual({
      ok: true,
      dados: { orcamento_id: ID, valor_venda_unit: '8.90', valor_comissao_unit: '0.30', tipo_frete_id: 2, valor_frete: '1250.00' },
    })
  })

  it('zera o frete fora de "CIF Informado" (bTOSo0)', () => {
    const r = validarEdicaoOrcamento(
      form({ orcamento_id: ID, valor_venda_unit: '1', valor_comissao_unit: '1', tipo_frete_id: '1', valor_frete: '99,00' }),
    )
    expect(r.ok && r.dados.valor_frete).toBe('0.00')
  })

  it('vazio vale zero; mais de 2 casas é recusado, não arredondado', () => {
    const r = validarEdicaoOrcamento(form({ orcamento_id: ID, valor_venda_unit: '', valor_comissao_unit: '' }))
    expect(r.ok && [r.dados.valor_venda_unit, r.dados.valor_comissao_unit, r.dados.tipo_frete_id]).toEqual(['0.00', '0.00', 1])
    expect(validarEdicaoOrcamento(form({ orcamento_id: ID, valor_venda_unit: '8,901' })).ok).toBe(false)
    expect(validarEdicaoOrcamento(form({ orcamento_id: ID, tipo_frete_id: '0' })).ok).toBe(false)
  })
})

describe('escolhas padrão', () => {
  const linhas = [
    { id: 1, nome: 'PBR' },
    { id: 4, nome: 'Usado' },
  ]

  it('linha "Usado" quando a condição é Usado; a única linha; ou nenhuma', () => {
    expect(linhaPadrao({ id: 2, nome: 'Usado' }, linhas)).toBe('4')
    expect(linhaPadrao({ id: 1, nome: 'Novo' }, linhas)).toBe('')
    expect(linhaPadrao(undefined, [{ id: 1, nome: 'PBR' }])).toBe('1')
    expect(linhaPadrao({ id: 2, nome: 'Usado' }, [{ id: 1, nome: 'PBR' }])).toBe('1')
  })

  it('destino: o do último item que ainda existe, o único, ou nenhum', () => {
    const destinos = [{ id: ID }, { id: OUTRO }]
    expect(destinoPadrao([{ endereco_destino_id: ID }, { endereco_destino_id: OUTRO }], destinos)).toBe(OUTRO)
    expect(destinoPadrao([{ endereco_destino_id: ID }, { endereco_destino_id: 'sumiu' }], destinos)).toBe(ID)
    expect(destinoPadrao([], destinos)).toBe('')
    expect(destinoPadrao([], [{ id: ID }])).toBe(ID)
  })

  it('produtos filtrados pelo tipo; sem tipo, todos', () => {
    const ps = [
      { id: 'a', grupo_id: 'g1' },
      { id: 'b', grupo_id: 'g2' },
      { id: 'c', grupo_id: null },
    ]
    expect(produtosDoGrupo(ps, 'g1').map((p) => p.id)).toEqual(['a'])
    expect(produtosDoGrupo(ps, '')).toHaveLength(3)
  })
})

describe('formatos de campo', () => {
  it('reais do banco para o campo, só trocando o separador', () => {
    expect(reaisParaCampo('8.90')).toBe('8,90')
    expect(reaisParaCampo('8.9')).toBe('8,90')
    expect(reaisParaCampo('15000')).toBe('15000,00')
    expect(reaisParaCampo(null)).toBe('0,00')
    expect(reaisParaCampo('lixo')).toBe('0,00')
  })

  it('qtd do banco para o campo, sem zeros à direita', () => {
    expect(qtdParaCampo('50000.000')).toBe('50000')
    expect(qtdParaCampo('12.500')).toBe('12,5')
    expect(qtdParaCampo(undefined)).toBe('')
  })

  it('rótulo do endereço e iniciais', () => {
    expect(rotuloEndereco({ nome_endereco: 'Matriz', uf: 'SP', municipio: 'Jundiaí' })).toBe('Matriz – Jundiaí/SP')
    expect(rotuloEndereco({ nome_endereco: 'Filial', uf: 'MG', municipio: null })).toBe('Filial – MG')
    expect(iniciais('coca cola / solar')).toBe('CC')
    expect(iniciais('  ')).toBe('?')
  })
})
