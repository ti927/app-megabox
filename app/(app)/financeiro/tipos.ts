/**
 * Formas dos dados que o servidor entrega à tela do financeiro.
 *
 * Nomes em snake_case porque são as colunas das views da 010 (`v_contas_receber`,
 * `v_contas_pagar`). Todo dinheiro vem como STRING (`::text` no select): o navegador só
 * formata e soma em centavos inteiros (lib/financeiro), nunca em float.
 */

/** Linha de `v_contas_receber` + os nomes resolvidos no servidor. */
export type ContaReceber = {
  id: string
  entrega_id: string
  pedido_id: string
  pedido_numero: string | null
  cliente_id: string
  fornecedor_id: string
  vendedor_id: string
  endereco_origem_id: string | null
  endereco_destino_id: string | null
  produto_id: string | null
  qtd: string
  valor_unit: string
  parcela: number
  parcelas_total: number
  valor_total: string
  valor_comissao: string
  valor_baixado: string
  saldo: string
  ultima_dt_baixa: string | null
  ultima_dt_credito: string | null
  ultima_nf_megabox: string | null
  dt_vencimento: string
  dt_pedido: string | null
  dt_entrega: string | null
  nf_fornecedor_numero: string | null
  status_id: number
  vencida: boolean
  arquivado: boolean
  // resolvidos
  cliente_nome: string
  fornecedor_nome: string
  vendedor_nome: string
  produto_nome: string
  filial_origem: string
  filial_destino: string
  /** logo do cliente: URL assinada curta; ausente → iniciais */
  cliente_foto?: string | null
}

/** Linha de `v_contas_pagar` + os nomes resolvidos no servidor. */
export type ContaPagar = {
  id: string
  origem: 'entrega' | 'meta'
  entrega_id: string | null
  pedido_numero: string | null
  cliente_id: string | null
  fornecedor_id: string | null
  vendedor_id: string
  qtd: string | null
  dt_entrega: string | null
  nf_fornecedor_numero: string | null
  valor_base: string
  percentual: string
  valor_comissao: string
  valor_pago: string
  saldo: string
  ultima_dt_baixa: string | null
  dt_vencimento: string
  status_id: number
  vencida: boolean
  // resolvidos
  cliente_nome: string
  fornecedor_nome: string
  vendedor_nome: string
  /** logo do cliente: URL assinada curta; ausente → iniciais */
  cliente_foto?: string | null
}

export type Totais = { qtd: number; comissao: string; saldo: string; falhou: boolean }

/** Barra fixa do rodapé (Bubble `Group XZZZ`): vencidos + listado das duas listas. */
export type Rodape = { vencidos: Totais; receber: Totais; pagar: Totais }

export type ListaContas<T> = {
  linhas: T[]
  total: number
  falhou: boolean
  totais: Totais
}

/** Uma baixa com o estorno (se houver). Baixa e estorno são imutáveis (D6, D8). */
export type Baixa = {
  id: string
  valor: string
  dt_baixa: string
  dt_credito: string | null
  nf_megabox_numero: string | null
  dt_nf_megabox: string | null
  observacao: string | null
  criado_em: string
  usuario: { nome: string } | null
  recibo: { numero: number } | null
  estorno: { motivo: string; em: string; usuario: { nome: string } | null } | null
}

export type FichaConta =
  | {
      tipo: 'receber'
      conta: ContaReceber
      baixas: Baixa[]
      cobrancas: { numero: number; criado_em: string }[]
    }
  | { tipo: 'pagar'; conta: ContaPagar; baixas: Baixa[]; cobrancas: [] }

/** Entrega que saiu e ainda não foi confirmada (status < Financeiro). */
export type EntregaPendente = {
  id: string
  numero_entrega: string | null
  status_id: number
  qtd: string
  dt_prev_entrega: string | null
  valor_venda_bruto: string
  valor_comissao: string
  nf_fornecedor_numero: string | null
  pedido: { numero: string; prazos: { prazo_id: number }[] } | null
  cliente_id: string
  cliente: { nome: string } | null
  fornecedor: { nome: string } | null
  vendedor: { nome: string } | null
  orcamento: { produto: { nome: string } | null } | null
  /** logo do cliente: URL assinada curta; ausente → iniciais */
  cliente_foto?: string | null
}

export type Prazo = { id: number; nome: string; dias_prazo: number }

export type Opcoes = {
  vendedores: { id: string; nome: string }[]
  /** só na aba de entregas */
  prazos: Prazo[]
  /** filtro "Filial Fornecedor" (§2.1), "Nome (CNPJ)"; vazio na aba de entregas */
  filiais: { id: string; nome_endereco: string; documento: string | null }[]
}

/** Item da seleção de contas (estado do navegador; no Bubble ia para o registro do usuário). */
export type Selecionada = {
  id: string
  saldo: string
  fornecedorId: string | null
  rotulo: string
}

export type DadosFornecedor = {
  enderecos: { id: string; nome_endereco: string; razao: string | null; documento: string | null }[]
  contatos: { id: string; nome: string; email: string | null }[]
}

export type EstadoAcao = { erro?: string; ok?: string }

export type Permissoes = {
  /** estornar é do Diretor (010 estornos_insercao; reusables §9.3) */
  estornar: boolean
}
