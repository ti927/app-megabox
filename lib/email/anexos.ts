import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { LerAnexo } from './fila-nucleo'

/** Soma máxima dos anexos de uma mensagem (Resend aceita 40 MB; margem para o base64). */
export const MAX_BYTES_ANEXO = 25 * 1024 * 1024

/**
 * Baixa o anexo do Storage PRIVADO pelo caminho gravado em `email_anexos.path`.
 *
 * Convenção de caminho = a de `lib/arquivos.ts` (frente de Storage): `<bucket>/<objeto>`
 * (ex.: `anexos/<dono>/<uuid>.pdf`). Lá a leitura é com a SESSÃO do usuário (a policy do bucket
 * decide); aqui é service_role, porque o worker não tem usuário — o anexo já foi autorizado por
 * quem enfileirou (server action). PONTO DE INTEGRAÇÃO: se `lib/caminho.ts` estabilizar um
 * parser de caminho (bucket + objeto), troque o corte manual abaixo por ele.
 */
export function lerAnexoDoStorage(admin: SupabaseClient): LerAnexo {
  return async (path) => {
    const limpo = path.replace(/^\/+/, '')
    const corte = limpo.indexOf('/')
    if (corte < 1 || limpo.includes('..')) throw new Error(`Caminho de anexo inválido: ${path}`)
    const bucket = limpo.slice(0, corte)
    const objeto = limpo.slice(corte + 1)

    const { data, error } = await admin.storage.from(bucket).download(objeto)
    if (error || !data) throw new Error(`Anexo não baixou (${path}): ${error?.message ?? 'vazio'}`)
    if (data.size > MAX_BYTES_ANEXO) throw new Error(`Anexo grande demais (${path})`)
    return new Uint8Array(await data.arrayBuffer())
  }
}
