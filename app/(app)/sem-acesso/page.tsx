import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sem acesso — MegaBox' }

export default function SemAcesso() {
  return (
    <>
      <h1>Sem acesso</h1>
      <p data-teste="sem-acesso" style={{ color: 'var(--texto-2)' }}>
        Você está autenticado, mas esta página não foi liberada para o seu perfil.
        Procure a administração se precisar dela.
      </p>
    </>
  )
}
