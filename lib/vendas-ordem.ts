/**
 * Pílula "data crescente" do quadro de vendas (Bubble `btn data crescente`, WFs bTaUD/bTaUN).
 *
 * No Bubble o parâmetro `ordemdecrescente` era gravado na URL e nenhuma busca o lia (spec
 * vendas.md §2.2, §8.1): o botão não fazia nada. Aqui ele funciona: ligado, as quatro colunas
 * ordenam pela data de criação da MAIS ANTIGA para a mais nova; desligado (padrão), da mais nova
 * para a mais antiga, como sempre foi.
 *
 * Mora fora de `FiltrosVendas` (lib/vendas.ts) de propósito: é só ordem, não filtra nada, e a
 * URL continua sendo a fonte do estado (`crescente=1`).
 */

export const PARAM_CRESCENTE = 'crescente'

type Params = Record<string, string | string[] | undefined>

/** searchParams → a pílula está ligada? Qualquer valor que não seja "1" é o padrão. */
export function lerCrescente(p: Params): boolean {
  const v = p[PARAM_CRESCENTE]
  return (Array.isArray(v) ? v[0] : v) === '1'
}

/** Acrescenta `crescente=1` à query string montada por `paraQuery` ("" ou "?a=1&b=2"). */
export function comOrdem(query: string, crescente: boolean): string {
  if (!crescente) return query
  return `${query ? `${query}&` : '?'}${PARAM_CRESCENTE}=1`
}
