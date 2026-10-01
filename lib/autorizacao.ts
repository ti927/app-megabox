import { redirect } from 'next/navigation'
import { cache } from 'react'

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
 *
 * `cache`: uma leitura por requisição. Layout, página e `exigirAcesso` chamavam cada um a sua
 * (getUser + usuarios), e cada render de /vendas pagava 3× as mesmas duas idas ao banco.
 */
export const usuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
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
})

/** As páginas que o usuário pode abrir. É a fonte do menu. */
export async function minhasPaginas(): Promise<Pagina[]> {
  const supabase = await clienteServidor()
  const { data, error } = await supabase.rpc('fn_minhas_paginas')
  if (error || !data) return []
  return data as Pagina[]
}

/**
 * Os alvos de configuração que o usuário pode abrir — o conteúdo da engrenagem do
 * cabeçalho (db/005, `fn_minhas_configuracoes`). Cosmético: a trava é `exigirAcesso`.
 */
export async function minhasConfiguracoes(): Promise<Pagina[]> {
  const supabase = await clienteServidor()
  const { data, error } = await supabase.rpc('fn_minhas_configuracoes')
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
  // As duas leituras em paralelo: a RPC decide pelo auth.uid() do JWT, não pelo `usuario`.
  // Sem sessão ela devolve false — e o redirect para /entrar vem antes, como sempre.
  const [usuario, pode] = await Promise.all([
    usuarioAtual(),
    clienteServidor().then((s) => s.rpc('fn_pode_acessar_pagina', { p_slug: slug })),
  ])
  if (!usuario) redirect('/entrar')

  if (pode.data !== true) redirect('/sem-acesso')
  return usuario
}
