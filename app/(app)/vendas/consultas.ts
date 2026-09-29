import 'server-only'

import type { clienteServidor } from '@/lib/supabase/servidor'

import type { OpcoesFicha } from './tipos'

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/**
 * Listas dos selects da cotação (carrinho e orçamentos) e do fluxo (prazos, formas). Usada pela
 * página, com uma ficha aberta, e pela action da cotação NOVA — que abre antes de existir ficha.
 * Sempre com o cliente da SESSÃO: a RLS de cada tabela decide.
 */
export async function buscarOpcoesFicha(supabase: Supabase): Promise<OpcoesFicha> {
  const [grupos, produtos, condicoes, linhas, fretes, prazos, formas] = await Promise.all([
    supabase.from('produto_grupos').select('id, nome').order('nome'),
    supabase
      .from('produtos')
      .select(
        'id, nome, grupo_id, grupo:produto_grupos(nome), condicoes:produto_condicoes(condicao_id), linhas:produto_linhas(linha_id)',
      )
      .eq('ativo', true)
      .order('nome'),
    supabase.from('condicoes_produto').select('id, nome').order('id'),
    supabase.from('linhas_produto').select('id, nome').order('id'),
    supabase.from('tipos_frete').select('id, nome').order('id'),
    supabase.from('prazos_recebimento').select('id, nome').eq('ativo', true).order('dias_prazo').order('id'),
    supabase.from('formas_pagamento').select('id, nome').order('id'),
  ])
  return {
    grupos: grupos.data ?? [],
    produtos: (produtos.data ?? []) as unknown as OpcoesFicha['produtos'],
    condicoes: condicoes.data ?? [],
    linhas: linhas.data ?? [],
    fretes: fretes.data ?? [],
    prazos: prazos.data ?? [],
    formas: formas.data ?? [],
  }
}
