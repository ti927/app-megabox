import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente para server components e server actions, com a sessão do usuário.
 *
 * Continua sujeito à RLS: é o usuário autenticado quem lê e escreve, não o
 * servidor. Para o que precisa ignorar RLS (carga, formulário público por
 * token), use lib/supabase/admin.ts — e só de dentro de uma server action.
 */
async function fetchComTempo(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const t0 = performance.now()
  const r = await fetch(input, init)
  const u = new URL(input instanceof Request ? input.url : String(input))
  const ms = (performance.now() - t0).toFixed(0).padStart(5)
  console.log(`[supabase] ${ms} ms ${init?.method ?? 'GET'} ${u.pathname.replace('/rest/v1/', '')} ${r.status}`)
  return r
}

export async function clienteServidor() {
  const jar = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // SUPABASE_LOG_TEMPO=1 (só no .env local): uma linha por ida ao banco, com o tempo — foi
      // assim que se achou a rajada de consultas de cada clique na ficha de vendas.
      ...(process.env.SUPABASE_LOG_TEMPO === '1' ? { global: { fetch: fetchComTempo } } : {}),
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
