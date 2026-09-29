/**
 * Largura do painel lateral (componentes/painel-lateral.tsx), em px.
 *
 * Mínimo de 26rem (416px) — abaixo disso a ficha vira coluna de celular; máximo que deixa
 * pelo menos 22rem (352px) da página visível à esquerda, para a lista continuar clicável.
 * Em janela estreita (celular), o painel ocupa a largura toda.
 */
export const LARGURA_MINIMA = 416
export const SOBRA_MINIMA = 352
export const PASSO_TECLADO = 32

export function larguraMaxima(janela: number): number {
  return Math.max(LARGURA_MINIMA, janela - SOBRA_MINIMA)
}

export function limitarLargura(px: number, janela: number): number {
  if (janela <= LARGURA_MINIMA + SOBRA_MINIMA) return janela
  const minima = Math.min(LARGURA_MINIMA, janela)
  return Math.round(Math.min(Math.max(px, minima), larguraMaxima(janela)))
}

export function larguraInicial(janela: number, fracao: number): number {
  return limitarLargura(janela * fracao, janela)
}
