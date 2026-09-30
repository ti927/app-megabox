/**
 * Formas dos dados que o servidor entrega à tela do SAC. Nomes em snake_case porque são as
 * colunas do banco.
 */

type Nome = { nome: string } | null

export type ItemLista = { id: number; nome: string }

export type Opcoes = {
  status: ItemLista[]
  prioridades: ItemLista[]
  tipos: ItemLista[]
  /** usuários ativos, para "Responsável" (`dd responsável` bUDKV0: User ativo por nome) */
  usuarios: { id: string; nome: string }[]
}

export type LinhaProtocolo = {
  id: string
  numero: number
  aberto_em: string
  fechado_em: string | null
  status_id: number
  prioridade_id: number
  tipo_ocorrencia_id: number
  responsavel_id: string | null
  excluido_em: string | null
  cliente: { nome: string; tipo: 'cliente' | 'fornecedor' } | null
  filial: { nome_endereco: string; documento: string | null } | null
  /** nulo também quando a RLS de `pedidos` (página vendas) não deixa ler */
  pedido: { numero: string } | null
  responsavel: Nome
}

export type Protocolo = {
  id: string
  numero: number
  grupo_clifor_id: string
  filial_id: string | null
  pedido_id: string | null
  responsavel_id: string | null
  tipo_ocorrencia_id: number
  prioridade_id: number
  status_id: number
  descricao: string
  aberto_em: string
  fechado_em: string | null
  tempo_resolucao: string | null
  excluido_em: string | null
  excluido_motivo: string | null
  criado_em: string
  alterado_em: string | null
  cliente: { id: string; nome: string; tipo: 'cliente' | 'fornecedor' } | null
  pedido: { numero: string } | null
  autor: Nome
  editor: Nome
  excluidor: Nome
}

export type Entrega = {
  id: string
  numero_entrega: string | null
  dt_prev_entrega: string | null
  qtd: string | null
  nf_fornecedor_numero: string | null
}

export type Interacao = {
  id: string
  descricao: string
  visivel_cliente: boolean
  criado_em: string
  email_id: string | null
  autor: Nome
  contato: { nome: string; email: string | null } | null
}

export type Filial = { id: string; nome_endereco: string; documento: string | null; uf: string; ativo: boolean }
export type Contato = { id: string; nome: string; email: string | null }

export type Ficha = {
  protocolo: Protocolo
  /** entregas ligadas ao protocolo */
  entregas: Entrega[]
  /** entregas do pedido (para ligar/desligar); vazio sem pedido ou sem leitura de vendas */
  entregasPedido: Entrega[]
  filiais: Filial[]
  contatos: Contato[]
  interacoes: Interacao[]
}

// ------------------------------------------------------------------------------ NPS

export type Pesquisa = { id: string; nome: string; tipo_id: number; ativa: boolean; criado_em: string }

export type Nps = {
  convites: number
  respondidas: number
  promotores: number
  neutros: number
  detratores: number
  nps: number | null
  media: string | null
}

export type Convite = {
  id: string
  cliente_id: string
  expira_em: string
  usado_em: string | null
  enviado_em: string | null
  envios: number
  cancelado_em: string | null
  cancelado_motivo: string | null
  criado_em: string
  cliente: { nome: string } | null
  contato: { nome: string; email: string | null } | null
  resposta: { nota_nps: number | null; criticas_sugestoes: string | null; respondida_em: string } | null
}

export type PainelNps = {
  pesquisas: Pesquisa[]
  escolhida: Pesquisa | null
  nps: Nps | null
  convites: Convite[]
  totalConvites: number
  falhou: boolean
}

// ------------------------------------------------------------------------ buscas

export type CliforEncontrado = { id: string; nome: string; tipo: 'cliente' | 'fornecedor' }

export type PedidoEncontrado = {
  id: string
  numero: string
  cliente: { id: string; nome: string } | null
  /** grupo do fornecedor do primeiro orçamento — o `rad tipo clifor` = Fornecedor (§3.2) */
  fornecedor: { id: string; nome: string } | null
}

export type EstadoAcao = {
  erro?: string
  ok?: string
  /** id gravado — a tela abre a ficha do protocolo recém-criado */
  id?: string
  /**
   * Caminho `/formulario/<token>` (a rota pública publicada; a spec dizia /pesquisa) do convite recém-emitido. Existe SÓ nesta resposta: não é
   * gravado, não vai para a URL, não é logado. A tela mostra uma vez para copiar.
   */
  link?: string
}

// ---------------------------------------------------------------------- pós-venda

/** Uma linha da aba Pós-Venda (`Table D` bUEMt0): convite de pesquisa do tipo Pós-Venda. */
export type LinhaPosVenda = {
  id: string
  criado_em: string
  cliente: { nome: string } | null
  vendedor: { nome: string } | null
  resposta: {
    nota_atendimento: number | null
    nota_produto: number | null
    nota_nps: number | null
    criticas_sugestoes: string | null
    respondida_em: string
  } | null
}

export type PainelPosVenda = { linhas: LinhaPosVenda[]; total: number; falhou: boolean }
