import 'server-only'

import { createClient } from '@supabase/supabase-js'

/**
 * Cliente com service_role. IGNORA RLS POR COMPLETO.
 *
 * CLAUDE.md regra 4: service_role nunca sai do servidor. O `server-only` acima
 * faz o build quebrar se este arquivo entrar num bundle de cliente, e o
 * eslint.config.mjs proíbe importá-lo de tela.tsx, dialogo.tsx e componentes/.
 *
 * Use só onde não há usuário autenticado para agir por: carga de dados e
 * gravação de formulário público validada por token
 * (specs/paginas/formularios-publicos.md §9.3).
 */
export function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !chave) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias no servidor.',
    )
  }

  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
