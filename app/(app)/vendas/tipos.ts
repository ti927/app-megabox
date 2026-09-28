/**
 * Formas dos dados que o servidor entrega à tela de vendas.
 *
 * Nomes em snake_case porque são as colunas do banco. Todo dinheiro vem como STRING (o
 * select usa `::text`): o navegador só formata (lib/dinheiro), nunca calcula.
 */

type Nome = { nome: string } | null

/** Uma linha de `v_kanban_cotacoes` (db/015): contadores e total já calculados no banco. */
export type CartaoCotacao = {
  id: string
  numero: number
  criado_em: string
  arquivado: boolean
  etapa_id: number
  cliente_nome: string | null
  vendedor_nome: string | null
  motivo_nome: string | null
  qtd_itens: number
  /** itens com vencedor (um por item, índice um_vencedor_por_item) */
  qtd_vencedores: number
  qtd_propostas: number
  /** soma do bruto dos vencedores; null sem vencedor (015 D3) */
  total_bruto_vencedores: string | null
  pode_propor: boolean
}

export type EntregaResumo = {
  id: string
  qtd: string
  dt_prev_entrega: string | null
  status_id: number
  nf_fornecedor_numero: string | null
  saiu_entrega: boolean
  orcamento: { produto: Nome } | null
}

/** Uma linha de `v_kanban_pedidos` (db/015) + as entregas para o detalhe do cartão. */
export type CartaoPedido = {
  id: string
  numero: string
  cotacao_id: string
  criado_em: string
  etapa_id: number
  finalizado: boolean
  motivo_cancelamento: string | null
  cliente_nome: string | null
  vendedor_nome: string | null
  /** soma do snapshot de proposta_itens; null em pedido sem proposta (015 D4) */
  valor_total: string | null
  /** há entrega e todas em etapa concluída (015 D5) — o cartão verde */
  todas_concluidas: boolean
  entregas: EntregaResumo[]
}

/** Uma linha de `v_kanban_entregas` (db/009). */
export type CartaoEntrega = {
  id: string
  pedido_id: string
  cotacao_id: string
  numero_entrega: string | null
  status_id: number
  qtd: string
  dt_pedido: string | null
  dt_prev_entrega: string | null
  dt_entrega: string | null
  saiu_entrega: boolean
  nf_fornecedor_numero: string | null
  valor_venda_bruto: string
  cliente_nome: string
  produto_nome: string
  vendedor_id: string
  vendedor_substituto_id: string | null
  papel: 'proprio' | 'substituto' | 'equipe'
  vendedor_nome: string | null
}

export type ColunaDados<T> = { cartoes: T[]; total: number; falhou: boolean }

export type Kanban = {
  cotacoes: ColunaDados<CartaoCotacao>
  pedidos: ColunaDados<CartaoPedido>
  entregas: ColunaDados<CartaoEntrega>
  substituto: ColunaDados<CartaoEntrega>
}

// ------------------------------------------------------------------------- ficha

export type Cotacao = {
  id: string
  numero: number
  criado_em: string
  data_validade: string | null
  amostra: boolean
  arquivado: boolean
  etapa_id: number
  vendedor_id: string
  cliente_id: string
  cliente: Nome
  vendedor: Nome
  empresa: Nome
  status: Nome
  etapa: Nome
  motivo: Nome
}

export type Item = {
  id: string
  qtd: string
  medida: string | null
  produto_id: string
  produto: Nome
  condicao: Nome
  linha: Nome
  destino: { nome_endereco: string; uf: string; municipio: string | null } | null
}

/** Linha de `v_orcamento_valores` + os nomes para exibir. */
export type Orcamento = {
  id: string
  cotacao_item_id: string
  valor_venda_unit: string
  valor_comissao_unit: string
  valor_frete: string
  tipo_frete_id: number
  aliquota_icms: string
  aliquota_pis_cofins: string
  valor_venda_bruto: string
  valor_comissao_bruto: string
  valor_icms: string
  valor_pis_cofins: string
  valor_tributos: string
  valor_venda_liquido: string
  valor_unit_liquido: string
  vencedor: boolean
  fornecedor_nome: string
  origem: { nome_endereco: string; uf: string; regime: Nome } | null
  frete_nome: string
}

export type Proposta = {
  id: string
  numero: number
  enviada: boolean
  enviada_em: string | null
  criado_em: string
  data_prev_entrega: string | null
  condicao_pagamento: string | null
  vendedor: Nome
  itens: [{ count: number }]
}

export type Pedido = {
  id: string
  numero: string
  criado_em: string
  etapa_id: number
  formalizado: boolean
  finalizado: boolean
  motivo_cancelamento: string | null
  ordem_compra_numero: string | null
  proposta: { numero: number } | null
  forma: Nome
  etapa: Nome
}

export type Ficha = {
  cotacao: Cotacao
  itens: Item[]
  orcamentos: Orcamento[]
  propostas: Proposta[]
  pedidos: Pedido[]
  entregas: CartaoEntrega[]
  /** endereços ativos do cliente — destino do item */
  destinos: { id: string; nome_endereco: string; uf: string; municipio: string | null }[]
}

// ------------------------------------------------------------------------ opções

export type Opcao = { id: number; nome: string }

export type ProdutoOpcao = {
  id: string
  nome: string
  grupo: Nome
  condicoes: { condicao_id: number }[]
  linhas: { linha_id: number }[]
}

export type Opcoes = {
  etapas: Opcao[]
  vendedores: { id: string; nome: string }[]
  empresas: Opcao[]
  motivos: Opcao[]
}

/** Carregadas só com a ficha aberta: os selects de item e de orçamento. */
export type OpcoesFicha = {
  produtos: ProdutoOpcao[]
  condicoes: Opcao[]
  linhas: Opcao[]
  fretes: Opcao[]
}

export type FornecedorParaItem = {
  endereco_id: string
  grupo_nome: string
  nome_endereco: string
  uf: string
  municipio: string | null
  regime: string | null
  liberado: boolean
  liberado_motivo: string | null
}

export type EstadoAcao = {
  erro?: string
  ok?: string
  /** id gravado — a tela usa para abrir a ficha recém-criada */
  id?: string
}

export type Permissoes = {
  filtrarVendedor: boolean
  ehDiretor: boolean
}
