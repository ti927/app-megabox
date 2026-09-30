'use client'

import { ChevronDown, LogOut, Menu, PanelLeftClose, Settings } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { sair } from '@/app/(publico)/entrar/acoes'
import { Marca } from '@/componentes/marca'
import type { Pagina, UsuarioAtual } from '@/lib/autorizacao'

import { AvatarUsuario } from './avatar-usuario'
import { Icone } from './icone'
import { iconePagina } from './icones-paginas'
import { SeletorTema } from './seletor-tema'
import type { Tema } from './tema'

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
        <Icone icone={Settings} tamanho={20} />
        <Icone icone={ChevronDown} tamanho={14} className="engrenagem-caret" />
      </button>
      {aberto ? (
        <ul id="menu-configuracoes" className="engrenagem-menu" data-teste="menu-configuracoes">
          {itens.map((c) => (
            <li key={c.slug}>
              <Link href={ROTA_CONFIG[c.slug]!}>
                <Icone icone={iconePagina(c.slug)} tamanho={16} />
                {c.nome}
              </Link>
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

/** Largura em que o menu fica aberto por padrão (casca.css usa o mesmo valor). */
const CONSULTA_LARGA = '(min-width: 64.0625rem)'

function assinarLargura(avisar: () => void) {
  const mq = window.matchMedia(CONSULTA_LARGA)
  mq.addEventListener('change', avisar)
  return () => mq.removeEventListener('change', avisar)
}

/**
 * Estado do menu lateral. "padrao" = ninguém mexeu: aberto no desktop, fechado em tela
 * estreita — o CSS decide pela largura, então o HTML do servidor já sai certo nos dois.
 * O hambúrguer troca para "aberto"/"fechado" explícitos.
 */
type EstadoMenu = 'padrao' | 'aberto' | 'fechado'

export function Casca({
  usuario,
  paginas,
  configuracoes,
  tema,
  children,
}: {
  usuario: UsuarioAtual
  paginas: Pagina[]
  configuracoes: Pagina[]
  tema: Tema
  children: React.ReactNode
}) {
  const [menu, setMenu] = useState<EstadoMenu>('padrao')
  const larga = useSyncExternalStore(
    assinarLargura,
    () => window.matchMedia(CONSULTA_LARGA).matches,
    () => true, // servidor: o app é de mesa
  )
  const menuAberto = menu === 'padrao' ? larga : menu === 'aberto'
  const caminho = usePathname()

  // Em tela estreita o menu é gaveta sobre o conteúdo: fecha ao navegar.
  useEffect(() => {
    if (!window.matchMedia(CONSULTA_LARGA).matches) setMenu('padrao')
  }, [caminho])

  return (
    <div className="casca" data-menu={menu}>
      <header className="cabecalho">
        <button
          type="button"
          className="cabecalho-menu"
          aria-expanded={menuAberto}
          aria-controls="menu-paginas"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenu(menuAberto ? 'fechado' : 'aberto')}
        >
          {/* Bubble: ícone "menu"; com o menu aberto, "menu_open". */}
          <Icone icone={menuAberto ? PanelLeftClose : Menu} tamanho={24} />
        </button>

        <Link href="/inicio" className="cabecalho-marca" aria-label="MegaBox — Início">
          <Marca tamanho={56} prioridade />
        </Link>

        <div className="cabecalho-usuario">
          <SeletorTema inicial={tema} className="cabecalho-tema" />
          <AvatarUsuario nome={usuario.nome} iniciais={iniciais(usuario.nome)} />
          <span className="cabecalho-identidade">
            <strong data-teste="usuario-nome">{usuario.nome}</strong>
            <small>{PERFIL[usuario.perfilId] ?? `Perfil ${usuario.perfilId}`}</small>
          </span>
          <Engrenagem configuracoes={configuracoes} />
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
                    <Icone icone={iconePagina(p.slug)} tamanho={20} />
                    <span>{p.nome}</span>
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
          {/* Bubble: "Logout" fica no rodapé do menu lateral. */}
          {/* No celular o seletor do cabeçalho não cabe: vem para o rodapé do menu. */}
          <SeletorTema inicial={tema} className="menu-tema" />
          <form action={sair} className="menu-rodape">
            <button type="submit" className="menu-sair">
              <Icone icone={LogOut} tamanho={18} />
              Sair
            </button>
          </form>
        </nav>

        <main className="conteudo">{children}</main>
      </div>
    </div>
  )
}
