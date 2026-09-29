import { ArrowRight } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { Icone } from '@/componentes/icone'
import { iconePagina } from '@/componentes/icones-paginas'
import { exigirAcesso, minhasPaginas } from '@/lib/autorizacao'

import './inicio.css'

export const metadata: Metadata = { title: 'Início — MegaBox' }

export default async function PaginaInicio() {
  // Trava no servidor, junto da consulta. Digitar a URL não basta.
  const usuario = await exigirAcesso('inicio')
  const paginas = await minhasPaginas()
  const atalhos = paginas.filter((p) => p.slug !== 'inicio')

  return (
    <div className="inicio">
      <h1>Olá, {usuario.nome.split(' ')[0]}</h1>
      <p data-teste="inicio-conteudo" className="inicio-sub">
        Você tem acesso a {paginas.length}{' '}
        {paginas.length === 1 ? 'página' : 'páginas'}.
      </p>

      {atalhos.length > 0 ? (
        <nav aria-label="Atalhos">
          <ul className="inicio-atalhos">
            {atalhos.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}` as Route} className="inicio-atalho">
                  <span className="inicio-atalho-icone">
                    <Icone icone={iconePagina(p.slug)} tamanho={20} />
                  </span>
                  <span className="inicio-atalho-nome">{p.nome}</span>
                  <Icone icone={ArrowRight} tamanho={16} className="inicio-atalho-seta" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
