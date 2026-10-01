import type { ChaveEmailVendas, ModeloTexto } from '@/lib/vendas-fluxo'

/*
 * Formas dos dados EXTRAS da tela de proposta/pedido (proposta-tela, pedido-tela), lidos sob
 * demanda pelas actions de leitura de acoes-fluxo.ts — a ficha (page.tsx) não os traz.
 * Dinheiro como texto, do banco (db/029); a tela só formata.
 */

/** Endereço para o DOCUMENTO: "Dados de faturamento", "Enviar para", "Faturar para". */
export type EnderecoDoc = {
  id: string
  nome_endereco: string
  razao: string | null
  documento: string | null
  insc_estadual: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string
  cep: string | null
}

/** Linha de v_pedido_item_saldo (db/029). */
export type SaldoItem = {
  pedido_id: string
  orcamento_fornecedor_id: string
  qtd_vendida: string
  valor_bruto: string
  valor_comissao: string
  valor_liquido: string
  valor_tributos: string
  qtd_entregas: string
  bruto_entregas: string
  comissao_entregas: string
  liquido_entregas: string
  falta_qtd: string
  falta_bruto: string
  falta_comissao: string
  falta_liquido: string
}

export type Modelos = Partial<Record<ChaveEmailVendas, ModeloTexto>>

export type ExtrasProposta = {
  /** endereços ativos do cliente com CNPJ e endereço (o select "Faturar para" e o documento) */
  enderecos: EnderecoDoc[]
  /** telefone de cada contato do cliente (A/C do documento) */
  telefones: Record<string, string | null>
  modelos: Modelos
  /** nome de quem está logado: a assinatura do e-mail */
  eu: string
}

export type ExtrasPedido = {
  itens: { orcamento_fornecedor_id: string; origem: EnderecoDoc | null; destino: EnderecoDoc | null }[]
  faturar: EnderecoDoc | null
  saldo: SaldoItem[]
  modelos: Modelos
  eu: string
}

/** Linha de fn_rateio_prazos (db/029). */
export type Parcela = {
  parcela: number
  prazo_id: number
  prazo_nome: string
  dias_prazo: number
  /** parte da VENDA (o que o cliente paga ao fornecedor nesse prazo) */
  valor: string | null
  /** parte da COMISSÃO (o que a MegaBox recebe nesse prazo) */
  comissao: string | null
}

/** Âncora das entregas na mesa do pedido: o passo "Entregas" da trilha rola até aqui. */
export const ANCORA_ENTREGAS = 'pedido-entregas'
