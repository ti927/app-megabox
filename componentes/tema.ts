/**
 * Tema claro/escuro escolhido pelo usuário (seletor do cabeçalho).
 *
 * A escolha vai num cookie para o SERVIDOR já renderizar `<html data-tema="…">` certo — sem
 * piscar o tema errado antes da hidratação. Sem cookie (ou valor desconhecido) o tema é
 * "sistema": nenhum `data-tema` e o CSS segue `prefers-color-scheme` (estilos/tokens.css).
 * Arquivo sem 'use client' nem 'server-only': usado pelos dois lados.
 */

export type Tema = 'claro' | 'escuro' | 'sistema'

export const COOKIE_TEMA = 'mb-tema'

/** Um ano. O cookie é só preferência de exibição: não é segredo nem sessão. */
export const COOKIE_TEMA_MAX_AGE = 60 * 60 * 24 * 365

export function lerTema(valor: string | undefined | null): Tema {
  return valor === 'claro' || valor === 'escuro' ? valor : 'sistema'
}

/** Valor do atributo `data-tema` do `<html>`; `undefined` = não escreve o atributo. */
export function atributoTema(tema: Tema): 'claro' | 'escuro' | undefined {
  return tema === 'sistema' ? undefined : tema
}

/** Linha de `document.cookie` que grava (ou apaga, no "sistema") a escolha. */
export function cookieTema(tema: Tema): string {
  const base = `${COOKIE_TEMA}=${tema === 'sistema' ? '' : tema}; Path=/; SameSite=Lax`
  return tema === 'sistema' ? `${base}; Max-Age=0` : `${base}; Max-Age=${COOKIE_TEMA_MAX_AGE}`
}
