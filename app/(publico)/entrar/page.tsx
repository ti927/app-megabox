import type { Metadata } from 'next'

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
  const destino = proximo?.startsWith('/') && !proximo.startsWith('//') ? proximo : '/inicio'

  return <TelaEntrar proximo={destino} />
}
