import type { Metadata } from 'next'

import '@/estilos/base.css'

export const metadata: Metadata = {
  title: 'MegaBox',
  description: 'Sistema comercial do Grupo MegaBox',
}

export default function LayoutRaiz({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
