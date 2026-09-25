import { redirect } from 'next/navigation'

import { clienteServidor } from '@/lib/supabase/servidor'

export type Pagina = {
  slug: string
  nome: string
  ordem: number | null
  icone: string | null
}

export type UsuarioAtual = {
  id: string
  nome: string
  perfilId: number
  departamentoId: number
  ehDiretor: boolean
  ehGerenciaOuAcima: boolean
}

/**
 * Quem está logado, ou null.
 *
 * Lê a própria linha de `usuarios`, o que a policy permite. Devolve null também
 * quando existe sessão mas não existe linha — conta criada no Auth sem bootstrap.
 */
export async function usuarioAtual(): Promise<UsuarioAtual | null> {
  const supabase = await clienteServidor()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('usuarios')
    .select('id, nome, perfil_id, departamento_id, ativo')
    .eq('id', user.id)
    .maybeSingle()

  if (!data || !data.ativo) return null

  return {
    id: data.id,
    nome: data.nome,
    perfilId: data.perfil_id,
    departamentoId: data.departamento_id,
    ehDiretor: data.perfil_id === 1,
    ehGerenciaOuAcima: data.perfil_id <= 2,
  }
}

/** As páginas que o usuário pode abrir. É a fonte do menu. */
export async function minhasPaginas(): Promise<Pagina[]> {
  const supabase = await clienteServidor()
  const { data, error } = await supabase.rpc('fn_minhas_paginas')
  if (error || !data) return []
  return data as Pagina[]
}

/**
 * Trava de página. Chame no `page.tsx` de toda rota protegida.
 *
 * O middleware só renova a sessão e barra quem não tem sessão nenhuma — ele roda
 * antes de saber qual dado a página vai ler. A autorização de verdade é esta, no
 * servidor, junto da consulta. No app Bubble a única trava é `link_disabled` no
 * item de menu, então digitar a URL basta (specs/00-achados-de-seguranca.md §2.6).
 */
export async function exigirAcesso(slug: string): Promise<UsuarioAtual> {
  const usuario = await usuarioAtual()
  if (!usuario) redirect('/entrar')

  const supabase = await clienteServidor()
  const { data: pode } = await supabase.rpc('fn_pode_acessar_pagina', { p_slug: slug })

  if (pode !== true) redirect('/sem-acesso')
  return usuario
}
