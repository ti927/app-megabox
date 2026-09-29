'use server'

import { urlAssinada } from '@/lib/arquivos'
import { clienteServidor } from '@/lib/supabase/servidor'

/**
 * URL assinada (5 min) da foto de quem está logado, para o avatar do cabeçalho — ou null.
 * Lê a PRÓPRIA linha de `usuarios` pela sessão (a policy permite); `urlAssinada` confere de
 * novo que a linha dona é visível. Sem sessão ou sem foto, null: o avatar fica nas iniciais.
 */
export async function urlMinhaFoto(): Promise<string | null> {
  const supabase = await clienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('usuarios').select('foto_path').eq('id', user.id).maybeSingle()
  if (!data?.foto_path) return null

  const r = await urlAssinada(data.foto_path as string, { segundos: 300 })
  return r.ok ? r.url : null
}
