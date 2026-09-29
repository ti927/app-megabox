import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'

import '@/estilos/base.css'

// Fonte servida pelo próprio app (next/font baixa no build): nada de CDN em runtime.
// A escolha está em design/sistema-visual.md.
const fonteSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--fonte-sans',
})

export const metadata: Metadata = {
  title: 'MegaBox',
  description: 'Sistema comercial do Grupo MegaBox',
}

export default function LayoutRaiz({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={fonteSans.variable}>
      <body>{children}</body>
    </html>
  )
}
