import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente para componentes que rodam no navegador.
 *
 * Usa a anon key, que é pública por desenho. Ela só é segura porque toda
 * tabela tem RLS desde a primeira migration (CLAUDE.md regra 3). No app
 * anterior a RLS ficou desligada e a anon key no navegador virou acesso total
 * pela API REST — ver specs/00-achados-de-seguranca.md.
 */
export function clienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
