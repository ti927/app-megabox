/**
 * Formas dos dados que o servidor entrega à tela de metas. Dinheiro e frações chegam como
 * TEXTO (`coluna::text` no select): o `numeric` do banco nunca vira float no caminho.
 */

import type { MetaDiaria } from '@/lib/metas-painel'

/** Uma linha de `v_meta_atingimento` (uma meta mensal), com o nome resolvido no servidor. */
export type LinhaMeta = {
  meta_mensal_id: string
  vendedor_id: string
  competencia: string
  tipo_meta_id: number
  periodo_inicio: string
  periodo_fim: string
  nivel_id: string | null
  valor_meta: string
  meta_fechada_id: string | null
  fechada: boolean
  realizado: string | null
  percentual: string | null
  meta_batida: boolean | null
  fator_comissao: string | null
  comissao_vendedor: string | null
  /** "Qtd meses p/ subir nível" — calculado em lib/metas `reguaNivel` */
  regua: { consideradas: string[]; media: string | null; subir: boolean; n: number }
  fechamento: { fechada_em: string; fechada_por: string | null } | null
}

/** Uma linha de `v_ranking_metas`. */
export type LinhaRanking = {
  meta_mensal_id: string
  vendedor_id: string
  tipo_meta_id: number
  competencia: string
  percentual: string | null
  fechada: boolean
  posicao: number
}

export type Nivel = {
  id: string
  nome: string
  ordem: number
  meta_venda: string
  comissao_padrao: string
  comissao_meta_batida: string
  qtd_meta_batida: number
}

export type Vendedor = {
  id: string
  nome: string
  perfil_id: number
  departamento_id: number
  nivel_vendedor_id: string | null
  /** URL assinada (curta) da foto em `usuarios`, ou null → iniciais */
  foto: string | null
  /** entra no combo de nova meta (bTvyf: ativo, fora de Operação e Financeiro) */
  elegivel: boolean
}

export type HistoricoNivel = {
  id: string
  usuario_id: string
  nivel_id: string
  vigencia_inicio: string
  vigencia_fim: string | null
  motivo: string | null
}

/** Números coletivos (`Group Statistics`, spec §5.2) — só para hierarquia ≤ 2. */
export type Coletivo = {
  metaColetiva: string
  faturado: string
  /** metas [DÚVIDA 8] — lib/metas-painel `metaDiaria` */
  metaDiaria: MetaDiaria
  meses: { mes: string; vendas: string }[]
}

export type Permissoes = {
  /** hierarquia ≤ 2: vê todas, cria/edita e fecha (011 D10) */
  gerir: boolean
  /** perfil 1: cancela fechamento, mexe em nível e no histórico (011 D10) */
  diretor: boolean
}

/** O cálculo que a confirmação de fechamento mostra — `fn_calculo_meta`, no servidor. */
export type Calculo = {
  realizado: string
  percentual: string | null
  meta_batida: boolean
  fator: string | null
  comissao_vendedor: string
  qtd_entregas: number
  vencimento: string
}

export type EstadoAcao = {
  erro?: string
  ok?: string
}
