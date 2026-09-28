import type { LinhaMes } from '@/lib/relatorios'

/** numeric do Postgres chega como número ou string; nunca somamos aqui. */
type Num = string | number

/** fn_rel_entregas_produto (017). */
export type LinhaProduto = {
  nivel: number // 0 linha · 1 subtotal do produto · 2 total geral
  produto_id: string | null
  produto: string | null
  fornecedor_endereco_id: string | null
  fornecedor: string | null
  cliente_endereco_id: string | null
  cliente: string | null
  uf_destino: string | null
  qtd: Num
  valor_venda_bruto: Num
  valor_comissao: Num
  venda_unit_media: Num | null
  comissao_unit_media: Num | null
  qtd_entregas: Num
}

export type { LinhaMes }

/** fn_rel_cotacoes_resumo (017 D7). */
export type ResumoCotacoes = {
  total: Num
  em_cotacao: Num
  virou_pedido: Num
  arquivadas: Num
  taxa_conversao: Num | null
  faturamento: Num
  ticket_medio: Num | null
  tempo_medio_fechamento_dias: Num | null
  total_anterior: Num
  virou_pedido_anterior: Num
  taxa_conversao_anterior: Num | null
}

export type RankingCotacao = {
  posicao: Num
  vendedor_id: string
  vendedor: string
  cotacoes: Num
  ativas: Num
  pedidos: Num
  arquivadas: Num
  taxa_conversao: Num | null
  faturamento: Num
}

export type CotacaoMes = { mes: string; total: Num; virou_pedido: Num; arquivadas: Num; taxa_conversao: Num | null }
export type MotivoArquivamento = { motivo_id: number | null; motivo: string; qtd: Num }

export type CotacaoDetalhe = {
  id: string
  numero: number
  criado_em: string
  arquivado: boolean
  data_validade: string | null
  etapa: { nome: string } | null
  status: { nome: string } | null
  motivo: { nome: string } | null
  vendedor: { nome: string } | null
}

/** fn_rel_prospeccao_vendedor (017 D8). */
export type LinhaProspeccao = {
  nivel: number // 0 vendedor · 1 total
  posicao: Num | null
  vendedor_id: string | null
  vendedor: string
  propostas: Num
  clientes: Num
  carteira: Num
  carteira_atingida: Num
  cobertura: Num | null
  media_dia: Num | null
  dias_uteis: number
}

export type DiaProspeccao = { dia: string; util: boolean; propostas: Num }

export type DadosRelatorio =
  | { aba: 'outros'; modelo: 'produtos'; produtos: LinhaProduto[] }
  | { aba: 'outros'; modelo: 'clientes' | 'fornecedores'; mes: LinhaMes[] }
  | {
      aba: 'cotacao'
      resumo: ResumoCotacoes | null
      ranking: RankingCotacao[]
      porMes: CotacaoMes[]
      motivos: MotivoArquivamento[]
      detalhe: CotacaoDetalhe[]
      totalDetalhe: number
    }
  | { aba: 'prospeccao'; vendedores: LinhaProspeccao[]; diario: DiaProspeccao[] }

export type Vendedor = { id: string; nome: string }
