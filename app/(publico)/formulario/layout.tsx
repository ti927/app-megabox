import type { Metadata } from 'next'

import './formulario.css'

/**
 * Formulário público de pesquisa: o cliente final abre pelo link do e-mail, sem login.
 * `middleware.ts` já deixa `/formulario` e `/formulario/*` passarem sem sessão.
 *
 * O token vai na URL (`/formulario/<token>`), então:
 *   - `referrer: 'no-referrer'` vira <meta name="referrer">: nenhum recurso ou link que
 *     saia desta página leva a URL com o token no Referer;
 *   - `robots` noindex/nofollow/nocache: link de pesquisa não vai para buscador nem cache.
 * Vale também para a página de "link inválido" (not-found.tsx) — por isso fica no layout.
 */
export const metadata: Metadata = {
  title: 'Pesquisa de satisfação — MegaBox',
  referrer: 'no-referrer',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function LayoutFormulario({ children }: { children: React.ReactNode }) {
  return (
    <main className="pesq">
      <div className="pesq-cartao">
        <p className="pesq-marca" aria-label="MegaBox">
          Mega<span>Box</span>
        </p>
        {children}
      </div>
    </main>
  )
}
