import { ShieldAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Icone } from '@/componentes/icone'

export const metadata: Metadata = { title: 'Sem acesso — MegaBox' }

export default function SemAcesso() {
  return (
    <div style={{ display: 'grid', gap: 'var(--e3)', justifyItems: 'start' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--e3)', margin: 0 }}>
        <span style={{ display: 'inline-flex', color: 'var(--vermelho)' }}>
          <Icone icone={ShieldAlert} tamanho={24} />
        </span>
        Sem acesso
      </h1>
      <p data-teste="sem-acesso" style={{ margin: 0, maxWidth: 'var(--medida)', color: 'var(--texto-2)' }}>
        Você está autenticado, mas esta página não foi liberada para o seu perfil.
        Procure a administração se precisar dela.
      </p>
      <Link href="/inicio" className="botao-secundario">
        Voltar ao início
      </Link>
    </div>
  )
}
