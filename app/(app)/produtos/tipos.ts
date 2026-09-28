/**
 * Formas dos dados que o servidor entrega à tela de produtos. Nomes em snake_case porque
 * são as colunas do banco.
 */

type Nome = { nome: string } | null

export type LinhaProduto = {
  id: string
  nome: string
  ativo: boolean
  tipo: Nome
  grupo: Nome
  linhas: { linha_id: number }[]
  condicoes: { condicao_id: number }[]
  fornecedores: [{ count: number }]
  versoes: [{ count: number }]
}

export type Produto = {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  tipo_id: string | null
  grupo_id: string | null
  criado_em: string
  alterado_em: string | null
  autor: Nome
  editor: Nome
  linhas: { linha_id: number }[]
  condicoes: { condicao_id: number }[]
}

export type Versao = {
  id: string
  nome: string
  ativo: boolean
}

/** Uma filial ligada ao produto (fornecedor_produtos → enderecos_clifor → grupos_clifor). */
export type FilialLigada = {
  endereco_fornecedor_id: string
  criado_em: string
  endereco: {
    id: string
    nome_endereco: string
    municipio: string | null
    uf: string
    ativo: boolean
    liberado: boolean
    grupo: { id: string; nome: string; tipo: 'cliente' | 'fornecedor'; ativo: boolean } | null
  } | null
}

export type Ficha = {
  produto: Produto
  versoes: Versao[]
  filiais: FilialLigada[]
}

/** Resultado da busca de filial de fornecedor, para ligar ao produto. */
export type FilialEncontrada = {
  id: string
  nome_endereco: string
  municipio: string | null
  uf: string
  grupo_nome: string
}

export type Opcoes = {
  tipos: { id: string; nome: string }[]
  grupos: { id: string; nome: string; tipo_id: string }[]
  linhas: { id: number; nome: string }[]
  condicoes: { id: number; nome: string }[]
}

export type EstadoAcao = {
  erro?: string
  ok?: string
  /** id do produto gravado — a tela usa para abrir a ficha recém-criada */
  id?: string
  /** nomes parecidos no mesmo grupo; a gravação espera confirmação */
  parecidos?: string[]
}
