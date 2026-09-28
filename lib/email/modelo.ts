/**
 * Montagem da mensagem a partir de `modelos_email` (db/012): `{{variavel}}` no assunto e no
 * corpo. PURO, para o vitest.
 *
 * Regras:
 *   - No CORPO (HTML) todo valor é escapado. Quem precisa inserir HTML pronto (ex.: o texto
 *     livre do vendedor já convertido por `textoParaHtml`) passa `{ html }` — marcação explícita,
 *     nunca por acidente.
 *   - No ASSUNTO nada é escapado (não é HTML), mas quebra de linha e caractere de controle
 *     somem: assunto com "\r\n" é injeção de cabeçalho.
 *   - Variável usada no modelo e não fornecida → erro. Mandar "Olá {{nome_contato}}" para o
 *     cliente é pior que não mandar.
 */

export type ValorVariavel = string | number | { html: string }
export type Variaveis = Record<string, ValorVariavel | null | undefined>

export class ErroModelo extends Error {}

const VARIAVEL = /\{\{\s*([a-z0-9_]+)\s*\}\}/g

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Texto livre (ex.: corpo digitado pelo vendedor) → HTML seguro, preservando as linhas. */
export function textoParaHtml(texto: string): { html: string } {
  return { html: escaparHtml(texto).replace(/\r\n|\r|\n/g, '<br>\n') }
}

/** Remove quebras de linha e caracteres de controle; colapsa espaços. */
export function limparCabecalho(texto: string): string {
  return texto.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function variaveisDoModelo(modelo: string): string[] {
  return [...new Set([...modelo.matchAll(VARIAVEL)].map((m) => m[1] ?? ''))]
}

function substituir(modelo: string, variaveis: Variaveis, emHtml: boolean): string {
  const faltando = variaveisDoModelo(modelo).filter((v) => variaveis[v] == null)
  if (faltando.length) {
    throw new ErroModelo(`Variáveis sem valor no modelo: ${faltando.join(', ')}`)
  }
  return modelo.replace(VARIAVEL, (_, nome: string) => {
    const valor = variaveis[nome] as ValorVariavel
    if (typeof valor === 'object') {
      if (!emHtml) throw new ErroModelo(`Variável HTML "${nome}" não pode ir no assunto`)
      return valor.html
    }
    return emHtml ? escaparHtml(String(valor)) : String(valor)
  })
}

export interface ModeloEmail {
  assunto: string
  corpo: string
}

export function renderizarModelo(
  modelo: ModeloEmail,
  variaveis: Variaveis,
): { assunto: string; html: string } {
  const assunto = limparCabecalho(substituir(modelo.assunto, variaveis, false))
  if (!assunto) throw new ErroModelo('Assunto vazio depois da montagem.')
  if (assunto.length > 250) throw new ErroModelo('Assunto maior que 250 caracteres.')
  const html = substituir(modelo.corpo, variaveis, true)
  if (!html.trim()) throw new ErroModelo('Corpo vazio depois da montagem.')
  return { assunto, html }
}

/** "Grupo MegaBox" + "vendas@x.com" → `"Grupo MegaBox" <vendas@x.com>` (nome saneado). */
export function formatarRemetente(nome: string | null | undefined, endereco: string): string {
  const limpo = limparCabecalho(nome ?? '').replace(/["<>\\]/g, '')
  return limpo ? `"${limpo}" <${endereco}>` : endereco
}
