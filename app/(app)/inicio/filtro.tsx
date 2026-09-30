'use client'

import { FilterX } from 'lucide-react'
import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { Icone } from '@/componentes/icone'

/**
 * "Intervalo datas" do Bubble (`ipt filter dtinicio` bUBFN, `ipt filter dtfim` bUBFT) e o
 * "limpar filtro de data" (`Icon H` bTlHn, WF bTlIx). O estado vive na URL (`?de=&ate=`); limpar
 * volta ao padrão do servidor, o mês corrente. O WF bTlIx também gravava `clienteplanilha` na
 * URL, que ninguém lê — não reproduzido ([DÚVIDA 10]).
 */
export function FiltroPeriodo({ de, ate }: { de: string; ate: string }) {
  const router = useRouter()
  const caminho = usePathname()
  const [pendente, iniciar] = useTransition()

  function ir(novoDe: string, novoAte: string) {
    iniciar(() => router.replace(`${caminho}?de=${novoDe}&ate=${novoAte}` as Route, { scroll: false }))
  }

  return (
    <div className="inicio-filtro" aria-busy={pendente}>
      <label className="campo">
        <span>De</span>
        <input type="date" value={de} max={ate} onChange={(e) => e.target.value && ir(e.target.value, ate)} />
      </label>
      <label className="campo">
        <span>Até</span>
        <input type="date" value={ate} min={de} onChange={(e) => e.target.value && ir(de, e.target.value)} />
      </label>
      <button
        type="button"
        className="botao-texto"
        onClick={() => iniciar(() => router.replace(caminho as Route, { scroll: false }))}
      >
        <Icone icone={FilterX} tamanho={16} />
        Mês atual
      </button>
    </div>
  )
}
