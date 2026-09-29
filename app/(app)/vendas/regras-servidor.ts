import 'server-only'

import type { UsuarioAtual } from '@/lib/autorizacao'
import type { clienteServidor } from '@/lib/supabase/servidor'
import { ETAPA, podeEditarCotacao } from '@/lib/vendas'

/*
 * Regras de servidor comuns às actions da cotação (acoes.ts e acoes-cotacao.ts). Módulo
 * `server-only` SEM 'use server': o que se exporta daqui não vira endpoint público.
 */

export type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/** Erro do Postgres/PostgREST → frase que a pessoa entende. O detalhe vai para o log. */
export function traduzirErro(
  contexto: string,
  erro: { code?: string; message?: string },
  /** mensagem para 23505 (valor único repetido), que depende de QUAL índice recusou */
  repetido = 'Este registro já existe. Recarregue a página.',
): string {
  console.error(`vendas: ${contexto}`, erro)
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para gravar nesta cotação.'
    case 'P0002':
      // fn_aliquota_icms: par origem × destino sem alíquota (erro explícito, db/007).
      return `${erro.message ?? 'Sem alíquota de ICMS para este par de estados'}. Peça à diretoria para cadastrar a alíquota antes de orçar.`
    case '23505':
      return repetido
    case '23503':
      return 'Um dos valores escolhidos não existe mais. Recarregue a página.'
    case '23514':
      return 'Valor fora do permitido.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

export type CotacaoEditavel = {
  id: string
  cliente_id: string
  vendedor_id: string
  amostra: boolean
  arquivado: boolean
  etapa_id: number
}

/**
 * Lê a cotação pela RLS e aplica as regras de edição do Bubble:
 * - arquivada, só o Diretor (condicional de `btn edita orcamento`, spec §1);
 * - itens e orçamentos só enquanto ela está na etapa Cotação: depois de virar pedido
 *   (bTbZt → "Pedir"), os itens se editam pelo pedido (`pop edita produtos do pedido`).
 */
export async function cotacaoEditavel(
  supabase: Supabase,
  usuario: UsuarioAtual,
  id: string,
): Promise<{ cotacao: CotacaoEditavel } | { erro: string }> {
  const { data, error } = await supabase
    .from('cotacoes')
    .select('id, cliente_id, vendedor_id, amostra, arquivado, etapa_id')
    .eq('id', id)
    .maybeSingle()
  if (error) return { erro: traduzirErro('ler cotação', error) }
  if (!data) return { erro: 'Esta cotação não existe mais ou não é sua. Recarregue a página.' }
  const cotacao = data as CotacaoEditavel
  if (!podeEditarCotacao(usuario, cotacao)) {
    return { erro: 'Cotação arquivada: só o Diretor altera. Desarquive antes.' }
  }
  if (cotacao.etapa_id !== ETAPA.COTACAO) {
    return { erro: 'Esta cotação já virou pedido. Os itens agora se alteram pelo pedido.' }
  }
  return { cotacao }
}

