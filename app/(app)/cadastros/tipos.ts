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
  /** caminho no bucket `clifor` (db/018); a URL assinada vem à parte, em `fotos` */
  foto_path: string | null
  carteira: Nome
  autor: Nome
  filiais: [{ count: number }]
  bloqueadas: [{ count: number }]
  contatos: [{ count: number }]
  /** espelho da 012 (era UltimoHistoricoData); nulo = nunca contatado */
  ultimo_historico_em: string | null
  /** calculado no servidor (lib/cadastros-lista): dias desde a última conversa */
  dias_sem_conversa: number | null
  /** anexos do grupo + das filiais que a RLS deixa ver */
  qtd_anexos: number
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
  foto_path: string | null
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
  insc_municipal: string | null
  regime_tributario_id: number
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string
  ativo: boolean
  liberado: boolean
  liberado_motivo: string | null
  principal: boolean
  corporativo: boolean
  frete_id: number | null
  nome_comprador: string | null
  capacidade_compra: string | null
  demanda: string | null
  observacoes: string | null
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
  tipo_telefone_id: number | null
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

/**
 * Um anexo (documento) do grupo ou de uma filial dele — `pop.AnexosClifor` (bTjcT).
 * Só chegam aqui os tipos que o departamento de quem vê pode ver: o filtro é a RLS de
 * `anexos` (db/018 §4). O caminho do arquivo NÃO vem: a URL é assinada no clique.
 */
export type Anexo = {
  id: string
  nome_arquivo: string
  tamanho_bytes: number | null
  criado_em: string
  endereco_id: string | null
  tipo: Nome
  autor: Nome
  filial: { nome_endereco: string } | null
}

export type Ficha = {
  grupo: Grupo
  /** URL assinada de vida curta da foto do grupo, ou null */
  fotoUrl: string | null
  filiais: Filial[]
  contatos: Contato[]
  anexos: Anexo[]
  /** documento → todas as filiais (de qualquer grupo, inclusive este) que o compartilham */
  duplicados: Record<string, Duplicado[]>
}

export type Opcao = { id: string; nome: string }

export type Opcoes = {
  ufs: { sigla: string; nome: string }[]
  captacoes: { id: number; nome: string }[]
  /** quem pode ser dono de carteira (clifor.podeTerCarteira) */
  carteiras: Opcao[]
  regimes: { id: number; nome: string }[]
  fretes: { id: number; nome: string }[]
  /** Opt.TipoAnexo com QualCadastro = Cliente/Fornecedor, por nome (`dd tipodocumento` bTjck) */
  tiposAnexo: { id: number; nome: string }[]
}

export type Permissoes = {
  escreverFornecedor: boolean
  alterarAtivoFornecedor: boolean
  /** bloquear/liberar filial (filial-contato.podeBloquearFilial) */
  bloquearFilial: boolean
  /** apagar UM anexo: hierarquia <= 2 (ícone bTjdn). Apagar todos (bTjeL) não existe aqui. */
  apagarAnexo: boolean
}

export type EstadoAcao = {
  erro?: string
  ok?: string
  /** id do grupo gravado — a tela usa para abrir a ficha recém-criada */
  id?: string
  /** nomes parecidos já cadastrados; a gravação espera confirmação */
  parecidos?: string[]
}

/** Retorno das actions de filial e contato. */
export type EstadoItem = {
  erro?: string
  ok?: string
  /** gravou, mas com ressalva (documento legado inválido, principal não trocado…) */
  avisos?: string[]
}

/** Onde mais um documento aparece — aviso de §4.4, conferido antes de gravar. */
export type OutraFilial = {
  endereco_id: string
  nome_endereco: string
  grupo_id: string
  grupo_nome: string
  grupo_tipo: TipoClifor
  ativo: boolean
}
