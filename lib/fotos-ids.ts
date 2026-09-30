/**
 * Parte PURA do lote de fotos (lib/fotos-lote.ts), sem I/O, para o vitest testar direto.
 */

/** Ids distintos e não vazios, na ordem em que aparecem. */
export function idsUnicos(ids: readonly (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((x): x is string => typeof x === 'string' && x !== ''))]
}

/**
 * id da linha dona → URL assinada. `urls` vem de `urlsDeLinhas` (chave = caminho); linha sem
 * foto, ou cujo caminho não foi assinado, fica fora do mapa (a tela mostra as iniciais).
 */
export function fotoPorDono(
  linhas: readonly { id: string; foto_path: string | null }[],
  urls: ReadonlyMap<string, string>,
): Map<string, string> {
  const saida = new Map<string, string>()
  for (const l of linhas) {
    const url = l.foto_path ? urls.get(l.foto_path) : undefined
    if (url) saida.set(l.id, url)
  }
  return saida
}
