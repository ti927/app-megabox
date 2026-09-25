import type { Metadata } from 'next'

import { exigirAcesso, minhasPaginas } from '@/lib/autorizacao'

export const metadata: Metadata = { title: 'Início — MegaBox' }

export default async function PaginaInicio() {
  // Trava no servidor, junto da consulta. Digitar a URL não basta.
  const usuario = await exigirAcesso('inicio')
  const paginas = await minhasPaginas()

  return (
    <>
      <h1>Olá, {usuario.nome.split(' ')[0]}</h1>
      <p data-teste="inicio-conteudo" style={{ color: 'var(--texto-2)' }}>
        Você tem acesso a {paginas.length}{' '}
        {paginas.length === 1 ? 'página' : 'páginas'}.
      </p>
    </>
  )
}
