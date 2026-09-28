import { describe, expect, it } from 'vitest'

import type { UsuarioAtual } from '@/lib/autorizacao'

import {
  escaparLike,
  faixa,
  FILTROS_PADRAO,
  lerFiltros,
  normalizarNome,
  paraQuery,
  pareceDocumento,
  podeAlterarAtivo,
  podeEscreverTipo,
  podeTerCarteira,
  totalPaginas,
  validarGrupo,
} from './clifor'

const UUID = '3f2a8c1e-0b7d-4e59-9a61-2c4d5e6f7a8b'

function usuario(perfilId: number, departamentoId: number): UsuarioAtual {
  return {
    id: UUID,
    nome: 'Pessoa Teste',
    perfilId,
    departamentoId,
    ehDiretor: perfilId === 1,
    ehGerenciaOuAcima: perfilId <= 2,
  }
}

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

describe('lerFiltros', () => {
  it('sem parâmetro nenhum, devolve o padrão', () => {
    expect(lerFiltros({})).toEqual(FILTROS_PADRAO)
  })

  it('lê todos os filtros válidos', () => {
    expect(
      lerFiltros({
        tipo: 'cliente',
        q: '  agua ',
        ativo: 'nao',
        uf: 'sp',
        semCarteira: '1',
        captacao: '3',
        ordem: 'nome',
        pagina: '4',
        sel: UUID.toUpperCase(),
      }),
    ).toEqual({
      tipo: 'cliente',
      q: 'agua',
      ativo: 'nao',
      uf: 'SP',
      semCarteira: true,
      captacao: 3,
      ordem: 'nome',
      pagina: 4,
      sel: UUID,
    })
  })

  it('valor desconhecido cai no padrão, não vai cru para a consulta', () => {
    const f = lerFiltros({
      tipo: 'x',
      ativo: 'talvez',
      uf: 'São Paulo',
      captacao: '1; drop table',
      ordem: 'aleatoria',
      pagina: '-2',
      sel: 'nao-e-uuid',
    })
    expect(f).toEqual(FILTROS_PADRAO)
  })

  it('usa o primeiro valor quando o parâmetro vem repetido', () => {
    expect(lerFiltros({ tipo: ['fornecedor', 'cliente'] }).tipo).toBe('fornecedor')
  })

  it('"sem carteira" não se aplica a fornecedor', () => {
    expect(lerFiltros({ tipo: 'fornecedor', semCarteira: '1' }).semCarteira).toBe(false)
  })

  it('corta busca muito longa', () => {
    expect(lerFiltros({ q: 'a'.repeat(500) }).q).toHaveLength(100)
  })
})

describe('paraQuery', () => {
  it('omite o que é padrão', () => {
    expect(paraQuery(FILTROS_PADRAO)).toBe('')
  })

  it('ida e volta preserva os filtros', () => {
    const f = lerFiltros({ tipo: 'fornecedor', q: 'box & cia', uf: 'MG', pagina: '2' })
    const volta = lerFiltros(Object.fromEntries(new URLSearchParams(paraQuery(f).slice(1))))
    expect(volta).toEqual(f)
  })

  it('aplica mudanças por cima do atual', () => {
    expect(paraQuery(FILTROS_PADRAO, { tipo: 'fornecedor', pagina: 1 })).toBe('?tipo=fornecedor')
  })
})

describe('paginação', () => {
  it('faixa é inclusiva e começa em zero', () => {
    expect(faixa(1)).toEqual({ de: 0, ate: 49 })
    expect(faixa(3, 10)).toEqual({ de: 20, ate: 29 })
    expect(faixa(0)).toEqual({ de: 0, ate: 49 })
  })

  it('total de páginas nunca é zero', () => {
    expect(totalPaginas(0)).toBe(1)
    expect(totalPaginas(50)).toBe(1)
    expect(totalPaginas(51)).toBe(2)
  })
})

describe('busca', () => {
  it('escapa curingas do LIKE', () => {
    expect(escaparLike('50%_a\\b')).toBe('50\\%\\_a\\\\b')
  })

  it('reconhece documento digitado com ou sem máscara', () => {
    expect(pareceDocumento('12.345.678/0001')).toBe('123456780001')
    expect(pareceDocumento('1234')).toBe('1234')
    expect(pareceDocumento('123')).toBeNull()
    expect(pareceDocumento('agua 123')).toBeNull()
  })
})

describe('normalizarNome', () => {
  it('ignora acento, caixa e espaço sobrando', () => {
    expect(normalizarNome('  Água   Mineral LTDA ')).toBe('agua mineral ltda')
    expect(normalizarNome('LOJA X ')).toBe(normalizarNome('loja x'))
  })
})

describe('permissões (spec cadastros §1 e §10)', () => {
  it('cliente: qualquer perfil cria e inativa', () => {
    expect(podeEscreverTipo(usuario(4, 4), 'cliente')).toBe(true)
    expect(podeAlterarAtivo(usuario(4, 4), 'cliente')).toBe(true)
  })

  it('fornecedor: cria Diretor, Gerente, Analista ou Financeiro; Operador não', () => {
    expect(podeEscreverTipo(usuario(1, 1), 'fornecedor')).toBe(true)
    expect(podeEscreverTipo(usuario(3, 3), 'fornecedor')).toBe(true)
    expect(podeEscreverTipo(usuario(4, 2), 'fornecedor')).toBe(true)
    expect(podeEscreverTipo(usuario(4, 3), 'fornecedor')).toBe(false)
  })

  it('fornecedor: só hierarquia <= 2 inativa (bUCXd0)', () => {
    expect(podeAlterarAtivo(usuario(2, 3), 'fornecedor')).toBe(true)
    expect(podeAlterarAtivo(usuario(3, 2), 'fornecedor')).toBe(false)
  })

  it('carteira exclui Financeiro e Operação', () => {
    expect(podeTerCarteira(1)).toBe(true)
    expect(podeTerCarteira(3)).toBe(true)
    expect(podeTerCarteira(2)).toBe(false)
    expect(podeTerCarteira(4)).toBe(false)
  })
})

describe('validarGrupo', () => {
  it('aceita cliente mínimo e normaliza espaços', () => {
    const r = validarGrupo(form({ tipo: 'cliente', nome: '  Loja   Exemplo ' }))
    expect(r).toEqual({
      ok: true,
      dados: {
        tipo: 'cliente',
        nome: 'Loja Exemplo',
        carteira_id: null,
        captacao_id: null,
        email_principal: null,
        nao_faz_contrato_parceria: false,
        observacoes: null,
      },
    })
  })

  it('exige tipo e nome', () => {
    expect(validarGrupo(form({ nome: 'Loja' }))).toMatchObject({ ok: false })
    expect(validarGrupo(form({ tipo: 'cliente', nome: ' a ' }))).toMatchObject({ ok: false })
  })

  it('fornecedor perde carteira; cliente perde contrato de parceria', () => {
    const forn = validarGrupo(
      form({ tipo: 'fornecedor', nome: 'Fábrica X', carteira_id: UUID, nao_faz_contrato_parceria: 'on' }),
    )
    expect(forn).toMatchObject({
      ok: true,
      dados: { carteira_id: null, nao_faz_contrato_parceria: true },
    })

    const cli = validarGrupo(
      form({ tipo: 'cliente', nome: 'Loja', carteira_id: UUID, nao_faz_contrato_parceria: 'on' }),
    )
    expect(cli).toMatchObject({ ok: true, dados: { carteira_id: UUID, nao_faz_contrato_parceria: false } })
  })

  it('recusa carteira, captação e e-mail malformados', () => {
    expect(validarGrupo(form({ tipo: 'cliente', nome: 'Loja', carteira_id: 'x' }))).toMatchObject({ ok: false })
    expect(validarGrupo(form({ tipo: 'cliente', nome: 'Loja', captacao_id: '1.5' }))).toMatchObject({ ok: false })
    expect(validarGrupo(form({ tipo: 'cliente', nome: 'Loja', email_principal: 'sem-arroba' }))).toMatchObject({
      ok: false,
    })
  })

  it('e-mail vai em minúsculas', () => {
    const r = validarGrupo(form({ tipo: 'cliente', nome: 'Loja', email_principal: 'Compras@Exemplo.com' }))
    expect(r).toMatchObject({ ok: true, dados: { email_principal: 'compras@exemplo.com' } })
  })
})
