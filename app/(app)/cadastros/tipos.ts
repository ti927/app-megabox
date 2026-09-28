/**
 * Formas dos dados que o servidor entrega à tela de cadastros.
 *
 * Só as colunas que a tela mostra (spec cadastros §7, item 6: não mandar ao navegador
 * CNPJ, IE e observações de todo mundo para montar uma lista). Nomes em snake_case
 * porque são as colunas do banco, sem tradução no meio do caminho.
 */

import type { TipoClifor } from '@/lib/clifor'

type Nome = { nome: string } | null

export type LinhaGrupo = {
  id: string
  tipo: TipoClifor
  nome: string
  ativo: boolean
  liberado: boolean
  criado_em: string
  carteira: Nome
  autor: Nome
  filiais: [{ count: number }]
  bloqueadas: [{ count: number }]
  contatos: [{ count: number }]
}

export type Grupo = {
  id: string
  tipo: TipoClifor
  nome: string
  ativo: boolean
  liberado: boolean
  liberado_motivo: string | null
  carteira_id: string | null
  captacao_id: number | null
  email_principal: string | null
  nao_faz_contrato_parceria: boolean
  observacoes: string | null
  codigo_legado: number | null
  criado_em: string
  alterado_em: string | null
  carteira: Nome
  autor: Nome
  editor: Nome
}

export type Filial = {
  id: string
  nome_endereco: string
  razao: string | null
  fantasia: string | null
  documento: string | null
  tipo_pessoa: 'cpf' | 'cnpj'
  insc_estadual: string | null
  municipio: string | null
  uf: string
  ativo: boolean
  liberado: boolean
  liberado_motivo: string | null
  principal: boolean
  regime: Nome
}

export type Contato = {
  id: string
  nome: string
  cargo: string | null
  email: string | null
  telefone: string | null
  ativo: boolean
  endereco_id: string | null
  tipo_telefone: Nome
}

/** Uma linha de `v_clifor_documento_duplicado` (db/006). */
export type Duplicado = {
  documento: string
  qtd_enderecos: number
  endereco_id: string
  nome_endereco: string
  grupo_id: string
  grupo_nome: string
  grupo_tipo: TipoClifor
  ativo: boolean
}

export type Ficha = {
  grupo: Grupo
  filiais: Filial[]
  contatos: Contato[]
  /** documento → todas as filiais (de qualquer grupo, inclusive este) que o compartilham */
  duplicados: Record<string, Duplicado[]>
}

export type Opcao = { id: string; nome: string }

export type Opcoes = {
  ufs: { sigla: string; nome: string }[]
  captacoes: { id: number; nome: string }[]
  /** quem pode ser dono de carteira (clifor.podeTerCarteira) */
  carteiras: Opcao[]
}

export type Permissoes = {
  escreverFornecedor: boolean
  alterarAtivoFornecedor: boolean
}

export type EstadoAcao = {
  erro?: string
  ok?: string
  /** id do grupo gravado — a tela usa para abrir a ficha recém-criada */
  id?: string
  /** nomes parecidos já cadastrados; a gravação espera confirmação */
  parecidos?: string[]
}
