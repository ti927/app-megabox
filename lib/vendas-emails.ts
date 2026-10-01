import type { SupabaseClient } from '@supabase/supabase-js'

import type { ChaveEmailVendas, ModeloTexto } from '@/lib/vendas-fluxo'

/**
 * Lê os modelos `vendas_*` ATIVOS de `modelos_email` (db/023) com o cliente da SESSÃO — a
 * policy de leitura da 012 deixa todo usuário ativo ler. Falha de leitura não impede o e-mail:
 * devolve o que achou (ou nada) e `montarEmailVendas` usa o texto padrão do código.
 */
export async function lerModelosEmailVendas(
  supabase: SupabaseClient,
  chaves: ChaveEmailVendas[],
): Promise<Partial<Record<ChaveEmailVendas, ModeloTexto>>> {
  const { data, error } = await supabase
    .from('modelos_email')
    .select('chave, assunto, corpo')
    .in('chave', chaves)
    .eq('ativo', true)
  if (error) {
    console.error('vendas: modelos de e-mail (usando o texto padrão)', error)
    return {}
  }
  const saida: Partial<Record<ChaveEmailVendas, ModeloTexto>> = {}
  for (const m of (data ?? []) as { chave: ChaveEmailVendas; assunto: string; corpo: string }[]) {
    saida[m.chave] = { assunto: m.assunto, corpo: m.corpo }
  }
  return saida
}
