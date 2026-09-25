import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente para server components e server actions, com a sessão do usuário.
 *
 * Continua sujeito à RLS: é o usuário autenticado quem lê e escreve, não o
 * servidor. Para o que precisa ignorar RLS (carga, formulário público por
 * token), use lib/supabase/admin.ts — e só de dentro de uma server action.
 */
export async function clienteServidor() {
  const jar = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return jar.getAll()
        },
        setAll(itens) {
          try {
            for (const { name, value, options } of itens) {
              jar.set(name, value, options)
            }
          } catch {
            // Chamado de um server component: o middleware já renova a sessão.
          }
        },
      },
    },
  )
}
