import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { cookies } from 'next/headers'

import { CamposData } from '@/componentes/campos-data'
import { atributoTema, COOKIE_TEMA, lerTema } from '@/componentes/tema'

import '@/estilos/base.css'

// Fonte servida pelo próprio app (next/font baixa no build): nada de CDN em runtime.
// A escolha está em design/sistema-visual.md, "Tipografia".
const fonteSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--fonte-sans',
})

export const metadata: Metadata = {
  title: 'MegaBox',
  description: 'Sistema comercial do Grupo MegaBox',
  // Símbolo do site oficial (public/marca/LEIA-ME.md).
  icons: {
    icon: [
      { url: '/marca/favicon.ico', sizes: 'any' },
      { url: '/marca/simbolo-megabox-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: { url: '/marca/simbolo-megabox-180.png', sizes: '180x180' },
  },
}

export default async function LayoutRaiz({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Tema escolhido no seletor do cabeçalho (componentes/tema.ts). Lido no servidor para o
  // HTML já sair com o tema certo — sem piscar. Sem cookie: sem data-tema, segue o sistema.
  const tema = lerTema((await cookies()).get(COOKIE_TEMA)?.value)

  return (
    <html lang="pt-BR" className={fonteSans.variable} data-tema={atributoTema(tema)}>
      <body>
        <CamposData />
        {children}
      </body>
    </html>
  )
}
