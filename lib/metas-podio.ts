/**
 * Estilo do pódio da página metas (A escudos · B degraus · C medalhas · D placar), escolhido
 * pelo dono na própria tela. Fica num cookie para o servidor já renderizar o escolhido (sem
 * piscar no carregamento). Arquivo sem 'use client': o page.tsx (servidor) também lê.
 */
export const ESTILOS_PODIO = ['A', 'B', 'C', 'D'] as const
export type EstiloPodio = (typeof ESTILOS_PODIO)[number]
export const COOKIE_PODIO = 'mb-podio'

export function lerEstiloPodio(v: string | undefined | null): EstiloPodio {
  return (ESTILOS_PODIO as readonly string[]).includes(v ?? '') ? (v as EstiloPodio) : 'A'
}

/** "gabriella carvalho" → "Gabriella Carvalho" (os nomes vêm em minúsculas da carga do Bubble). */
export function nomeTitulo(nome: string): string {
  return nome
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => (['da', 'de', 'do', 'das', 'dos', 'e'].includes(p) ? p : p.charAt(0).toLocaleUpperCase('pt-BR') + p.slice(1)))
    .join(' ')
}
