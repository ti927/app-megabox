'use server'

import type { Route } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

export type EstadoEntrar = { erro?: string }

/**
 * Registra a tentativa de acesso.
 *
 * Usa service_role porque a falha acontece ANTES de existir sessão — não há
 * auth.uid() para uma policy avaliar. É o único caminho possível, e é o motivo de
 * `log_acesso` ter escrita revogada de `authenticated` na 001.
 *
 * Não existe equivalente no Bubble: hoje não há registro nenhum de acesso.
 */
async function registrar(
  evento: string,
  resultado: string,
  email: string,
  usuarioId: string | null,
) {
  try {
    const cabecalhos = await headers()
    const ip =
      cabecalhos.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      cabecalhos.get('x-real-ip') ??
      null

    await clienteAdmin().from('log_acesso').insert({
      usuario_id: usuarioId,
      email_tentado: email,
      evento,
      resultado,
      ip,
      user_agent: cabecalhos.get('user-agent'),
    })
  } catch {
    // Log é registro, não é o fluxo. Falha aqui não pode impedir alguém de entrar.
  }
}

export async function entrar(
  _anterior: EstadoEntrar,
  form: FormData,
): Promise<EstadoEntrar> {
  const email = String(form.get('email') ?? '').trim()
  const senha = String(form.get('senha') ?? '')
  const proximo = String(form.get('proximo') ?? '') || '/inicio'

  if (!email || !senha) {
    return { erro: 'Informe e-mail e senha.' }
  }

  const supabase = await clienteServidor()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error || !data.user) {
    await registrar('login', 'senha_invalida', email, null)
    // Mensagem única de propósito: dizer "usuário não existe" entrega quem é cadastrado.
    return { erro: 'E-mail ou senha incorretos.' }
  }

  // Usuário inativo não entra. No Bubble ele entra e só é derrubado depois, pelo
  // cabeçalho, no navegador (specs/paginas/inicio-e-acesso.md §7).
  const { data: linha } = await supabase
    .from('usuarios')
    .select('ativo')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!linha) {
    await supabase.auth.signOut()
    await registrar('login', 'sem_cadastro', email, data.user.id)
    return { erro: 'Sua conta ainda não foi liberada. Procure a administração.' }
  }

  if (!linha.ativo) {
    await supabase.auth.signOut()
    await registrar('login', 'inativo', email, data.user.id)
    return { erro: 'Sua conta está inativa. Procure a administração.' }
  }

  await registrar('login', 'ok', email, data.user.id)
  redirect((proximo.startsWith('/') ? proximo : '/inicio') as Route)
}

export async function sair() {
  const supabase = await clienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase.auth.signOut()
  if (user?.email) await registrar('logout', 'ok', user.email, user.id)

  redirect('/entrar')
}
