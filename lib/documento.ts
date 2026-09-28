/**
 * CNPJ e CPF.
 *
 * No banco o documento é guardado SÓ COM DÍGITOS (`enderecos_clifor.documento`, 006).
 * A máscara é só apresentação. O Bubble não valida nada disso hoje
 * (specs/paginas/cadastros.md §4.11): `validarDocumento` existe para o formulário de
 * filial, que ainda não grava nesta primeira versão, e para avisar na leitura.
 */

export function somenteDigitos(texto: string | null | undefined): string {
  return (texto ?? '').replace(/\D/g, '')
}

/** 14 dígitos → 00.000.000/0000-00; 11 → 000.000.000-00; resto volta como veio. */
export function formatarDocumento(documento: string | null | undefined): string {
  const d = somenteDigitos(documento)
  if (d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
  }
  if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }
  return documento?.trim() || '—'
}

function todosIguais(d: string) {
  return /^(\d)\1+$/.test(d)
}

function digitoCnpj(base: string): number {
  const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0
  for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesos[i] ?? 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

function digitoCpf(base: string): number {
  let soma = 0
  const peso = base.length + 1
  for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (peso - i)
  const resto = (soma * 10) % 11
  return resto === 10 ? 0 : resto
}

export function cnpjValido(documento: string): boolean {
  const d = somenteDigitos(documento)
  if (d.length !== 14 || todosIguais(d)) return false
  const d1 = digitoCnpj(d.slice(0, 12))
  const d2 = digitoCnpj(d.slice(0, 12) + d1)
  return d.endsWith(`${d1}${d2}`)
}

export function cpfValido(documento: string): boolean {
  const d = somenteDigitos(documento)
  if (d.length !== 11 || todosIguais(d)) return false
  const d1 = digitoCpf(d.slice(0, 9))
  const d2 = digitoCpf(d.slice(0, 9) + d1)
  return d.endsWith(`${d1}${d2}`)
}

/** true quando o documento tem tamanho e dígito verificador de CNPJ ou de CPF. */
export function documentoValido(documento: string | null | undefined): boolean {
  const d = somenteDigitos(documento)
  return d.length === 14 ? cnpjValido(d) : d.length === 11 ? cpfValido(d) : false
}
