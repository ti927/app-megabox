import 'server-only'

import { urlsDeLinhas } from '@/lib/arquivos-lote'
import { fotoPorDono, idsUnicos } from '@/lib/fotos-ids'
import { clienteServidor } from '@/lib/supabase/servidor'

/** Validade das URLs de foto nas listas: o teto de `validadeUrl` (5 min), como em /metas. */
export const VALIDADE_FOTO_S = 300

/**
 * Fotos de clientes/fornecedores (bucket `clifor`) de uma lista que só tem os IDS — as views
 * do kanban e do financeiro não trazem `foto_path`. Custo fixo por página, qualquer que seja o
 * tamanho da lista: 1 leitura de `grupos_clifor` (só os ids visíveis) + 1 `createSignedUrls`.
 * Tudo com a SESSÃO: a RLS da tabela decide quem aparece e a policy do bucket confere de novo.
 */
export async function fotosDeGrupos(ids: readonly (string | null | undefined)[]): Promise<Map<string, string>> {
  return fotosDe('grupos_clifor', 'clifor', ids)
}

/** O mesmo para funcionários (bucket `usuarios`). */
export async function fotosDeUsuarios(ids: readonly (string | null | undefined)[]): Promise<Map<string, string>> {
  return fotosDe('usuarios', 'usuarios', ids)
}

async function fotosDe(
  tabela: 'grupos_clifor' | 'usuarios',
  bucket: 'clifor' | 'usuarios',
  ids: readonly (string | null | undefined)[],
): Promise<Map<string, string>> {
  const unicos = idsUnicos(ids)
  if (unicos.length === 0) return new Map()
  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from(tabela)
    .select('id, foto_path')
    .in('id', unicos)
    .not('foto_path', 'is', null)
  if (error) {
    console.error(`fotos: ${tabela}`, error)
    return new Map()
  }
  const linhas = (data ?? []) as { id: string; foto_path: string | null }[]
  const urls = await urlsDeLinhas(
    bucket,
    linhas.map((l) => ({ donoId: l.id, path: l.foto_path })),
    VALIDADE_FOTO_S,
  )
  return fotoPorDono(linhas, urls)
}
