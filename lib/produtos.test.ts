import { describe, expect, it } from 'vitest'

import {
  chaveNomeProduto,
  diferencaIds,
  FILTROS_PADRAO,
  grupoCombinaComTipo,
  lerFiltros,
  motivoFilialInapta,
  normalizarNomeProduto,
  paraQuery,
  validarNomeVersao,
  validarProduto,
} from './produtos'

const TIPO = '4d111202-86b2-446d-8ce8-52f0144d458d'
const GRUPO = '3f2a8c1e-0b7d-4e59-9a61-2c4d5e6f7a8b'
const PRODUTO = 'b30a824e-a02a-4e4a-9b90-e327d5cda5b9'

function form(campos: Record<string, string | string[]>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) {
    for (const x of Array.isArray(v) ? v : [v]) f.append(k, x)
  }
  return f
}

describe('lerFiltros / paraQuery', () => {
  it('URL vazia dá o padrão', () => {
    expect(lerFiltros({})).toEqual(FILTROS_PADRAO)
  })

  it('lê filtros válidos e ignora lixo', () => {
    expect(
      lerFiltros({ q: '  palete ', tipo: TIPO.toUpperCase(), grupo: GRUPO, ativo: 'nao', sel: PRODUTO }),
    ).toEqual({ q: 'palete', tipo: TIPO, grupo: GRUPO, ativo: 'nao', sel: PRODUTO })
    expect(lerFiltros({ tipo: 'x', grupo: GRUPO, ativo: 'talvez', sel: '1' })).toEqual(FILTROS_PADRAO)
  })

  it('grupo sem tipo é descartado', () => {
    expect(lerFiltros({ grupo: GRUPO }).grupo).toBeNull()
  })

  it('limita a busca a 100 caracteres', () => {
    expect(lerFiltros({ q: 'a'.repeat(300) }).q).toHaveLength(100)
  })

  it('omite o padrão e volta pelo mesmo caminho', () => {
    expect(paraQuery(FILTROS_PADRAO)).toBe('')
    const f = { q: 'pbr', tipo: TIPO, grupo: GRUPO, ativo: 'sim' as const, sel: PRODUTO }
    const q = paraQuery(f)
    expect(lerFiltros(Object.fromEntries(new URLSearchParams(q)))).toEqual(f)
  })

  it('não escreve grupo sem tipo', () => {
    expect(paraQuery(FILTROS_PADRAO, { grupo: GRUPO })).toBe('')
  })
})

describe('nome do produto', () => {
  it('grava em minúsculas, sem espaço sobrando (WF bTgeW/bTgei)', () => {
    expect(normalizarNomeProduto('  Palete  One Way   NOVO ')).toBe('palete one way novo')
  })

  it('a chave de comparação ignora acento', () => {
    expect(chaveNomeProduto('Palete de Alumínio')).toBe(chaveNomeProduto('palete de aluminio'))
  })
})

describe('grupoCombinaComTipo', () => {
  it('aceita o grupo do mesmo tipo, sem ligar para caixa', () => {
    expect(grupoCombinaComTipo(TIPO, TIPO.toUpperCase())).toBe(true)
  })
  it('recusa grupo de outro tipo ou inexistente', () => {
    expect(grupoCombinaComTipo(GRUPO, TIPO)).toBe(false)
    expect(grupoCombinaComTipo(null, TIPO)).toBe(false)
    expect(grupoCombinaComTipo(undefined, TIPO)).toBe(false)
  })
})

describe('motivoFilialInapta', () => {
  const fornecedor = { tipo: 'fornecedor', ativo: true }
  it('filial ativa de fornecedor ativo pode', () => {
    expect(motivoFilialInapta({ ativo: true, grupo: fornecedor })).toBeNull()
  })
  it('filial de cliente não pode', () => {
    expect(motivoFilialInapta({ ativo: true, grupo: { tipo: 'cliente', ativo: true } })).toMatch(
      /fornecedor/,
    )
    expect(motivoFilialInapta({ ativo: true, grupo: null })).toMatch(/fornecedor/)
  })
  it('fornecedor inativo ou filial inativa não pode', () => {
    expect(motivoFilialInapta({ ativo: true, grupo: { tipo: 'fornecedor', ativo: false } })).toMatch(
      /fornecedor está inativo/,
    )
    expect(motivoFilialInapta({ ativo: false, grupo: fornecedor })).toMatch(/filial está inativa/)
  })
})

describe('diferencaIds', () => {
  it('calcula o que ligar e o que desligar', () => {
    expect(diferencaIds([1, 2, 3], [2, 3, 4])).toEqual({ ligar: [4], desligar: [1] })
  })
  it('nada muda quando é igual, em qualquer ordem, com repetição', () => {
    expect(diferencaIds([3, 1], [1, 3, 3])).toEqual({ ligar: [], desligar: [] })
  })
  it('lista vazia desliga tudo', () => {
    expect(diferencaIds(['a', 'b'], [])).toEqual({ ligar: [], desligar: ['a', 'b'] })
  })
})

describe('validarProduto', () => {
  const valido = {
    nome: '  Palete PBR  Novo ',
    tipo_id: TIPO,
    grupo_id: GRUPO,
    descricao: ' Madeira eucalipto. ',
    linhas: ['1', '2', '2'],
    condicoes: ['3'],
  }

  it('normaliza e aceita', () => {
    const r = validarProduto(form(valido))
    expect(r).toEqual({
      ok: true,
      dados: {
        nome: 'palete pbr novo',
        tipo_id: TIPO,
        grupo_id: GRUPO,
        descricao: 'Madeira eucalipto.',
        linhas: [1, 2],
        condicoes: [3],
      },
    })
  })

  it('sem linha e sem condição é permitido', () => {
    const r = validarProduto(form({ nome: 'x1', tipo_id: TIPO, grupo_id: GRUPO }))
    expect(r.ok && r.dados).toMatchObject({ linhas: [], condicoes: [], descricao: null })
  })

  it('exige nome, tipo e grupo', () => {
    expect(validarProduto(form({ ...valido, nome: ' a ' }))).toMatchObject({ ok: false })
    expect(validarProduto(form({ ...valido, tipo_id: '' }))).toEqual({
      ok: false,
      erro: 'Escolha o tipo do produto.',
    })
    expect(validarProduto(form({ ...valido, grupo_id: 'x' }))).toEqual({
      ok: false,
      erro: 'Escolha o grupo do produto.',
    })
  })

  it('recusa id de lista fixa inválido', () => {
    expect(validarProduto(form({ ...valido, linhas: ['1', 'abc'] }))).toMatchObject({ ok: false })
    expect(validarProduto(form({ ...valido, condicoes: ['0'] }))).toMatchObject({ ok: false })
    expect(validarProduto(form({ ...valido, condicoes: ['1.5'] }))).toMatchObject({ ok: false })
  })

  it('recusa texto longo demais', () => {
    expect(validarProduto(form({ ...valido, nome: 'a'.repeat(201) }))).toMatchObject({ ok: false })
    expect(validarProduto(form({ ...valido, descricao: 'a'.repeat(5001) }))).toMatchObject({ ok: false })
  })
})

describe('validarNomeVersao', () => {
  it('limpa espaço e aceita', () => {
    expect(validarNomeVersao(' 1000 mm  x 1200 mm ')).toEqual({ ok: true, dados: '1000 mm x 1200 mm' })
  })
  it('recusa vazio, nulo e longo demais', () => {
    expect(validarNomeVersao('  ')).toMatchObject({ ok: false })
    expect(validarNomeVersao(null)).toMatchObject({ ok: false })
    expect(validarNomeVersao('a'.repeat(121))).toMatchObject({ ok: false })
  })
})
