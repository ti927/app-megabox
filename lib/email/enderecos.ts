/**
 * Endereços de e-mail: separar, validar, mesclar cópias de `config_copia_email`.
 *
 * PURO (sem server-only) para o vitest; quem importa isto de fora de lib/email é bloqueado
 * pelo eslint nas telas. No Bubble os campos de cópia misturavam ';' e ',' como separador
 * (001, comentário de config_copia_email) — aqui os dois valem.
 */

/** Limite do Resend por mensagem (to + cc + bcc). Acima disso a mensagem é recusada. */
export const MAX_DESTINATARIOS = 50

// Deliberadamente simples: sem espaços, um @, domínio com ponto. Não tenta ser a RFC 5322 —
// tenta recusar lixo e, principalmente, quebra de linha (injeção de cabeçalho).
const FORMATO = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/

export class ErroEndereco extends Error {}

export function enderecoValido(endereco: string): boolean {
  return endereco.length <= 254 && FORMATO.test(endereco)
}

/** "a@x.com; B@y.com,c@z.com" → ['a@x.com', 'b@y.com', 'c@z.com'] (minúsculo, sem repetição). */
export function separarEnderecos(texto: string | null | undefined): string[] {
  if (!texto) return []
  const saida: string[] = []
  for (const bruto of texto.split(/[;,\s]+/)) {
    const e = bruto.trim().toLowerCase()
    if (!e) continue
    if (!enderecoValido(e)) throw new ErroEndereco(`Endereço inválido: "${bruto.trim()}"`)
    if (!saida.includes(e)) saida.push(e)
  }
  return saida
}

export type TipoCopia = 'cc' | 'bcc'
export interface Copia {
  email: string
  tipo: TipoCopia
}
export interface Destinatarios {
  para: string[]
  cc: string[]
  bcc: string[]
}

function lista(v: string | string[] | null | undefined): string[] {
  if (!v) return []
  return separarEnderecos(Array.isArray(v) ? v.join(';') : v)
}

/**
 * Monta para/cc/bcc finais: cada endereço aparece UMA vez, no campo de maior visibilidade
 * (para > cc > bcc). As cópias configuradas somam-se ao que a ação pediu. Sem nenhum `para`,
 * ou acima de MAX_DESTINATARIOS, recusa.
 */
export function montarDestinatarios(entrada: {
  para: string | string[]
  cc?: string | string[] | null
  bcc?: string | string[] | null
  copias?: Copia[]
}): Destinatarios {
  const para = lista(entrada.para)
  if (para.length === 0) throw new ErroEndereco('A mensagem precisa de ao menos um destinatário.')

  const vistos = new Set(para)
  const acrescentar = (alvo: string[], enderecos: string[]) => {
    for (const e of enderecos) {
      if (vistos.has(e)) continue
      vistos.add(e)
      alvo.push(e)
    }
  }

  const copias = entrada.copias ?? []
  const copiasCc = lista(copias.filter((c) => c.tipo === 'cc').map((c) => c.email))
  const copiasBcc = lista(copias.filter((c) => c.tipo === 'bcc').map((c) => c.email))

  const cc: string[] = []
  const bcc: string[] = []
  acrescentar(cc, [...lista(entrada.cc), ...copiasCc])
  acrescentar(bcc, [...lista(entrada.bcc), ...copiasBcc])

  const total = para.length + cc.length + bcc.length
  if (total > MAX_DESTINATARIOS) {
    throw new ErroEndereco(`Destinatários demais (${total}; máximo ${MAX_DESTINATARIOS}).`)
  }
  return { para, cc, bcc }
}

/** Para a coluna text da fila: '; ' como separador, nulo quando vazio. */
export function juntarEnderecos(enderecos: string[]): string | null {
  return enderecos.length ? enderecos.join('; ') : null
}
