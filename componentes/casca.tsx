'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { sair } from '@/app/(publico)/entrar/acoes'
import type { Pagina, UsuarioAtual } from '@/lib/autorizacao'

const PERFIL: Record<number, string> = {
  1: 'Diretor',
  2: 'Gerente',
  3: 'Analista',
  4: 'Operador',
}

/**
 * Rota de cada alvo de configuração. Só vira link o que já tem tela — link para 404 não
 * ajuda ninguém. No Bubble "Cliente / Fornecedor" abre a página `cadastros`
 * (`tool.MenuConfig` WF bTgyl) e "Cadastro Produtos" abre o `pop.CadastroProdutos`
 * (WF bTghQ), que aqui virou a página `/produtos`.
 */
const ROTA_CONFIG: Record<string, Route> = {
  cadastros: '/cadastros',
  produtos: '/produtos',
}

function Engrenagem({ configuracoes }: { configuracoes: Pagina[] }) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const caminho = usePathname()
  const itens = configuracoes.filter((c) => ROTA_CONFIG[c.slug])

  // Fecha ao navegar, ao clicar fora e com Esc.
  useEffect(() => setAberto(false), [caminho])
  useEffect(() => {
    if (!aberto) return
    function fora(e: MouseEvent) {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false)
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  if (itens.length === 0) return null

  return (
    <div className="engrenagem" ref={raiz}>
      <button
        type="button"
        className="engrenagem-botao"
        aria-expanded={aberto}
        aria-controls="menu-configuracoes"
        aria-label="Configurações"
        onClick={() => setAberto((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.24-1.12.55-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.61.22l2.39-.96c.5.39 1.04.7 1.62.94l.36 2.54c.05.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.24 1.12-.55 1.62-.94l2.39.96c.22.08.48 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
          />
        </svg>
        <span aria-hidden="true" className="engrenagem-caret">▾</span>
      </button>
      {aberto ? (
        <ul id="menu-configuracoes" className="engrenagem-menu" data-teste="menu-configuracoes">
          {itens.map((c) => (
            <li key={c.slug}>
              <Link href={ROTA_CONFIG[c.slug]!}>{c.nome}</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
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
  configuracoes,
  children,
}: {
  usuario: UsuarioAtual
  paginas: Pagina[]
  configuracoes: Pagina[]
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
          <Engrenagem configuracoes={configuracoes} />
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
