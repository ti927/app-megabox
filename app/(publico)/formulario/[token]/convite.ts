import 'server-only'

import { byteaHex, hashDoToken } from '@/lib/formulario-publico-servidor'
import { ehTipoPesquisa, type TipoPesquisa } from '@/lib/formulario-publico'
import { clienteAdmin } from '@/lib/supabase/admin'

export type EstadoConvite =
  | { estado: 'aberto'; tipo: TipoPesquisa }
  | { estado: 'respondido' | 'expirado' | 'invalido' }

/**
 * Situação do convite pelo token, SEM consumir e sem contar tentativa.
 *
 * db/013 não tem função "consultar sem responder", então isto lê `pesquisa_convites` com
 * service_role comparando o HASH (o token em claro não sai deste processo). Lê só o que a
 * tela precisa — situação e tipo — e nada do cliente, do pedido ou do vendedor. Uma função
 * dedicada no banco (`fn_pesquisa_consultar(token)`, só service_role) seria melhor: a regra
 * "cancelado/desativado = inválido" ficaria num lugar só, junto de fn_pesquisa_responder.
 *
 * Mesma ordem de fn_pesquisa_responder: inexistente, cancelado e campanha desativada → o
 * mesmo 'invalido'; depois já usado; depois prazo.
 *
 * Quem chama TEM de ter validado o formato do token antes (tokenComFormatoValido).
 * Erro de banco sobe como exceção sem o token na mensagem; nada aqui escreve em log.
 */
export async function consultarConvite(token: string): Promise<EstadoConvite> {
  const { data, error } = await clienteAdmin()
    .from('pesquisa_convites')
    .select('usado_em, expira_em, cancelado_em, pesquisas!inner(tipo_id, ativa)')
    .eq('token_hash', byteaHex(hashDoToken(token)))
    .maybeSingle()

  if (error) throw new Error('Falha ao consultar o convite da pesquisa.')
  if (!data) return { estado: 'invalido' }

  const linha = data as {
    usado_em: string | null
    expira_em: string
    cancelado_em: string | null
    pesquisas: { tipo_id: number; ativa: boolean } | { tipo_id: number; ativa: boolean }[] | null
  }
  const pesquisa = Array.isArray(linha.pesquisas) ? linha.pesquisas[0] : linha.pesquisas

  if (linha.cancelado_em || !pesquisa?.ativa || !ehTipoPesquisa(pesquisa.tipo_id)) {
    return { estado: 'invalido' }
  }
  if (linha.usado_em) return { estado: 'respondido' }
  if (new Date(linha.expira_em).getTime() <= Date.now()) return { estado: 'expirado' }
  return { estado: 'aberto', tipo: pesquisa.tipo_id }
}
