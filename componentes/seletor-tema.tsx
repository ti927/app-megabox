'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { Icone } from './icone'
import { atributoTema, cookieTema, type Tema } from './tema'

const OPCOES = [
  { valor: 'claro', rotulo: 'Tema claro', icone: Sun },
  { valor: 'escuro', rotulo: 'Tema escuro', icone: Moon },
  { valor: 'sistema', rotulo: 'Seguir o sistema', icone: Monitor },
] as const satisfies ReadonlyArray<{ valor: Tema; rotulo: string; icone: unknown }>

/**
 * Seletor claro / escuro / sistema. O servidor já renderizou `<html data-tema>` a partir do
 * cookie (app/layout.tsx), então aqui só se troca o atributo e grava o cookie — sem recarregar
 * a página e sem piscar. "Sistema" apaga o cookie e volta a seguir `prefers-color-scheme`.
 */
export function SeletorTema({ inicial, className }: { inicial: Tema; className?: string }) {
  const [tema, setTema] = useState<Tema>(inicial)

  function escolher(novo: Tema) {
    setTema(novo)
    const attr = atributoTema(novo)
    if (attr) document.documentElement.dataset.tema = attr
    else delete document.documentElement.dataset.tema
    document.cookie = cookieTema(novo)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema da tela"
      className={['seletor-tema', className].filter(Boolean).join(' ')}
      data-teste="seletor-tema"
    >
      {OPCOES.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={tema === o.valor}
          aria-label={o.rotulo}
          title={o.rotulo}
          onClick={() => escolher(o.valor)}
        >
          <Icone icone={o.icone} tamanho={16} />
        </button>
      ))}
    </div>
  )
}
