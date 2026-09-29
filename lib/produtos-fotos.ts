/**
 * As quatro fotos do produto — os quatro PictureInput do `pop.CadastroProdutos` (bTgZk,
 * bTgZq, bTgaD, bTgZx), gravados por bTgeW/bTgei em `cpo.FotoSuperior/Inferior/Frontal/
 * Lateral`. No banco novo são as colunas `produtos.foto_*_path` (bucket privado `produtos`).
 * Ordem da tela do Bubble: Superior, Inferior, Frontal, Lateral. Pura, para o vitest.
 */

export const FOTOS_PRODUTO = [
  { chave: 'superior', coluna: 'foto_superior_path', rotulo: 'Foto superior' },
  { chave: 'inferior', coluna: 'foto_inferior_path', rotulo: 'Foto inferior' },
  { chave: 'frontal', coluna: 'foto_frontal_path', rotulo: 'Foto frontal' },
  { chave: 'lateral', coluna: 'foto_lateral_path', rotulo: 'Foto lateral' },
] as const

export type ChaveFoto = (typeof FOTOS_PRODUTO)[number]['chave']
export type ColunaFoto = (typeof FOTOS_PRODUTO)[number]['coluna']

/** Coluna da foto pedida, ou null — a chave vem do formulário e é entrada do usuário. */
export function colunaDaFoto(chave: unknown): ColunaFoto | null {
  return FOTOS_PRODUTO.find((f) => f.chave === chave)?.coluna ?? null
}

/**
 * Foto da miniatura na lista: a frontal; sem ela, a primeira que existir (a cópia do Bubble
 * trouxe produto com só algumas das quatro).
 */
export function fotoDaLista(p: Partial<Record<ColunaFoto, string | null>>): string | null {
  return p.foto_frontal_path ?? p.foto_superior_path ?? p.foto_lateral_path ?? p.foto_inferior_path ?? null
}
