import type { LinhaMes } from '@/lib/relatorios'
import type { PainelCotacao, PainelProspeccao } from '@/lib/relatorios-paineis'

/** numeric do Postgres chega como número ou string; nunca somamos aqui. */
type Num = string | number

export type { LinhaMes, PainelCotacao, PainelProspeccao }

/** fn_rel_entregas_produto (017) — ainda usado pelo CSV antigo e pelo teste de RLS. */
export type LinhaProduto = {
  nivel: number
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

/** fn_rel_entregas_produtos (021 O1) — uma linha por produto, como o HTML B. */
export type LinhaProdutoGrupo = {
  nivel: number // 0 produto · 1 total do recorte
  produto_id: string | null
  produto: string | null
  qtd: Num
  valor_venda_bruto: Num
  valor_comissao: Num
  fornecedores: string[]
  ufs: string[]
  clientes: string[]
  qtd_entregas: Num
}

/** fn_rel_entregas_detalhe (021 O3). */
export type LinhaDetalhe = {
  entrega_id: string
  cotacao_id: string | null
  cotacao_numero: number | null
  dt_entrega: string
  produto: string | null
  cliente: string | null
  uf_destino: string | null
  fornecedor: string | null
  uf_origem: string | null
  qtd: Num
  valor_venda_bruto_unit: Num | null
  valor_venda_bruto: Num
  valor_comissao: Num
}

/** Linha da tabela "Cotações do Período" (HTML C, Detalhamento). */
export type CotacaoDetalhe = {
  id: string
  numero: number
  criado_em: string
  arquivado: boolean
  data_validade: string | null
  etapa_id: number
  etapa: { nome: string } | null
  status: { nome: string } | null
  motivo: { nome: string } | null
  vendedor: { nome: string } | null
}

export type DadosRelatorio =
  | { aba: 'outros'; modelo: 'produtos'; produtos: LinhaProdutoGrupo[] }
  | { aba: 'outros'; modelo: 'clientes' | 'fornecedores'; mes: LinhaMes[] }
  | { aba: 'cotacao'; painel: PainelCotacao | null; detalhe: CotacaoDetalhe[]; totalDetalhe: number }
  | { aba: 'prospeccao'; painel: PainelProspeccao | null }

export type Vendedor = { id: string; nome: string }
