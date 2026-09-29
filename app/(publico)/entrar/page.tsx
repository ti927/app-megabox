import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { COOKIE_TEMA, lerTema } from '@/componentes/tema'

import { caminhoInternoSeguro } from '@/lib/caminho'
import { TelaEntrar } from './tela'

import './entrar.css'

export const metadata: Metadata = { title: 'Entrar — MegaBox' }

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>
}) {
  const { proximo } = await searchParams
  // Só caminho interno: `?proximo=https://outro-site` seria redirecionamento aberto.
  const destino = caminhoInternoSeguro(proximo)

  const tema = lerTema((await cookies()).get(COOKIE_TEMA)?.value)

  return <TelaEntrar proximo={destino} tema={tema} />
}
