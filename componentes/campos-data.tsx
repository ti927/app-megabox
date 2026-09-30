'use client'

import { useEffect } from 'react'

/**
 * Marca campos de data/mês vazios para o CSS (estilos/componentes.css, "Data VAZIA").
 *
 * Num <input type="date"> não controlado o atributo value não acompanha o que o usuário
 * digita, e não existe pseudo-classe de "data vazia". Um único ouvinte no documento põe
 * data-vazio / data-preenchido a cada mudança. Não renderiza nada.
 */
export function CamposData() {
  useEffect(() => {
    function marcar(e: Event) {
      const el = e.target
      if (!(el instanceof HTMLInputElement) || (el.type !== 'date' && el.type !== 'month')) return
      el.toggleAttribute('data-vazio', el.value === '')
      el.toggleAttribute('data-preenchido', el.value !== '')
    }
    document.addEventListener('input', marcar, true)
    document.addEventListener('change', marcar, true)
    return () => {
      document.removeEventListener('input', marcar, true)
      document.removeEventListener('change', marcar, true)
    }
  }, [])
  return null
}
