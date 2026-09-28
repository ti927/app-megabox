/**
 * Formas dos dados da tela de rotinas (db/014). Nomes em snake_case porque são as colunas.
 */

export type Rotina = {
  slug: string
  nome: string
  descricao: string
  risco: 'baixo' | 'medio' | 'alto'
  idempotente: boolean
  reversivel: boolean
  filtro_obrigatorio: boolean
  parametros: Record<string, string>
  origem_bubble: string | null
  ativa: boolean
}

export type Execucao = {
  id: string
  rotina_slug: string
  modo: 'seco' | 'real'
  status: 'rodando' | 'ok' | 'erro' | 'recusada'
  linhas_afetadas: number | null
  motivo: string | null
  erro: string | null
  inicio: string
  fim: string | null
  simulacao_id: string | null
  parametros: Record<string, unknown>
  usuario: { nome: string } | null
}

/** Usuário para os combos de carteira (colunas que a 004 libera a authenticated). */
export type UsuarioOpcao = {
  id: string
  nome: string
  ativo: boolean
  departamento_id: number
}

/** Grupo inativo que ainda tem filial ativa — o alvo de `sincronizar-ativo-enderecos`. */
export type GrupoInativo = {
  id: string
  nome: string
  tipo: 'cliente' | 'fornecedor'
  filiais_ativas: number
}

export type ClienteCarteira = { id: string; nome: string; ativo: boolean }

/** Uma linha da amostra/dos alterados, já com nomes resolvidos para a tela. */
export type LinhaAlvo = {
  id: string
  /** o que é: nome do cliente (carteira) ou "filial — grupo" (endereços) */
  descricao: string
  /** valor anterior, em texto */
  antes: string
  /** valor que a rotina grava */
  depois: string
}

export type Simulacao = {
  id: string
  rotina_slug: string
  linhas: number
  fim: string | null
  amostra: LinhaAlvo[]
  /** resumo dos parâmetros em português, para a confirmação */
  resumo: string[]
}

export type EstadoSimular = { erro?: string; simulacao?: Simulacao }

export type EstadoExecutar = {
  erro?: string
  /** id da linha de execução criada, mesmo quando recusada ou com erro */
  execucaoId?: string
  ok?: { linhas: number; alterados: LinhaAlvo[] }
}

export type DetalheExecucao = {
  execucao: Execucao
  /** amostra (seco) ou alterados (real), com nomes resolvidos */
  linhas: LinhaAlvo[]
  /** o total de linhas do resultado (a amostra do seco para em 20) */
  total: number
  resumo: string[]
}
