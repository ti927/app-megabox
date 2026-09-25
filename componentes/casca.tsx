'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { sair } from '@/app/(publico)/entrar/acoes'
import type { Pagina, UsuarioAtual } from '@/lib/autorizacao'

const PERFIL: Record<number, string> = {
  1: 'Diretor',
  2: 'Gerente',
  3: 'Analista',
  4: 'Operador',
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  const a = partes[0]?.[0] ?? ''
  const b = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : ''
  return (a + b).toUpperCase()
}

export function Casca({
  usuario,
  paginas,
  children,
}: {
  usuario: UsuarioAtual
  paginas: Pagina[]
  children: React.ReactNode
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const caminho = usePathname()

  return (
    <div className="casca" data-menu={menuAberto ? 'aberto' : 'fechado'}>
      <header className="cabecalho">
        <button
          type="button"
          className="cabecalho-menu"
          aria-expanded={menuAberto}
          aria-controls="menu-paginas"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuAberto((v) => !v)}
        >
          <span aria-hidden="true">{menuAberto ? '✕' : '☰'}</span>
        </button>

        <span className="cabecalho-marca">
          Mega<span>Box</span>
        </span>

        <div className="cabecalho-usuario">
          <span className="avatar" aria-hidden="true">
            {iniciais(usuario.nome)}
          </span>
          <span className="cabecalho-identidade">
            <strong data-teste="usuario-nome">{usuario.nome}</strong>
            <small>{PERFIL[usuario.perfilId] ?? `Perfil ${usuario.perfilId}`}</small>
          </span>
          <form action={sair}>
            <button type="submit" className="botao-texto">
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="corpo">
        <nav id="menu-paginas" className="menu" aria-label="Páginas">
          <ul data-teste="menu-paginas">
            {paginas.map((p) => {
              const href = `/${p.slug}` as Route
              const ativa = caminho === href || caminho.startsWith(`${href}/`)
              return (
                <li key={p.slug}>
                  <Link href={href} aria-current={ativa ? 'page' : undefined}>
                    {p.nome}
                  </Link>
                </li>
              )
            })}
          </ul>
          {paginas.length === 0 ? (
            <p className="menu-vazio">
              Nenhuma página liberada para você ainda. Procure a administração.
            </p>
          ) : null}
        </nav>

        <main className="conteudo">{children}</main>
      </div>
    </div>
  )
}
