import { notFound } from 'next/navigation'

import { tokenComFormatoValido } from '@/lib/formulario-publico'

import { AvisoPesquisa } from '../aviso'
import { consultarConvite } from './convite'
import { TelaFormulario } from './tela'

// Cada abertura consulta o banco: nada de cache estático de uma página que depende do token.
export const dynamic = 'force-dynamic'

/**
 * `/formulario/<token>` — o link do e-mail (NPS, SAC ou pós-venda).
 *
 * Token no SEGMENTO da rota, não em query: é o formato de formularios-publicos §7.4.1
 * ("a URL vira /pesquisa/<token> — sem id, sem pdd"), com o prefixo que o middleware já
 * libera (`/formulario`). Nenhum outro parâmetro é lido.
 */
export default async function PaginaFormulario({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Formato ANTES de qualquer consulta. Malformado cai no mesmo "link inválido" (404).
  if (!tokenComFormatoValido(token)) notFound()

  const convite = await consultarConvite(token)
  if (convite.estado === 'invalido') notFound()
  if (convite.estado !== 'aberto') return <AvisoPesquisa resultado={convite.estado} />

  return <TelaFormulario token={token} tipo={convite.tipo} />
}
