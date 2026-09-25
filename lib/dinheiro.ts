/**
 * Dinheiro na camada de apresentação.
 *
 * O cálculo é sempre do banco, em `numeric` (CLAUDE.md regra 10). Aqui só se
 * formata e se lê o que o usuário digitou. Por isso o tipo de trabalho é
 * string → string: nunca somamos em float no navegador, que é exatamente o que
 * o app Bubble faz hoje (specs/paginas/relatorios.md §8.4).
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formata um valor vindo do banco (string `numeric` ou número) como R$. */
export function formatarReais(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  const n = typeof valor === 'number' ? valor : Number(valor)
  if (!Number.isFinite(n)) return '—'
  return BRL.format(n)
}

/** Formata uma alíquota guardada como fração (0.0925) em percentual. */
export function formatarAliquota(fracao: string | number | null | undefined): string {
  if (fracao === null || fracao === undefined || fracao === '') return '—'
  const n = typeof fracao === 'number' ? fracao : Number(fracao)
  if (!Number.isFinite(n)) return '—'
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n * 100)}%`
}

/**
 * Lê o que o usuário digitou em pt-BR e devolve a string que vai para o banco.
 *
 * Aceita "1.234,56", "1234,56", "R$ 1.234,56" e "1234.56". Devolve null quando
 * não dá para ler — quem chama decide se isso é erro de validação.
 */
export function lerValorDigitado(texto: string): string | null {
  const limpo = texto.replace(/[^\d,.-]/g, '').trim()
  if (limpo === '' || limpo === '-') return null

  const temVirgula = limpo.includes(',')
  const temPonto = limpo.includes('.')

  let normalizado: string
  if (temVirgula && temPonto) {
    // "1.234,56" — ponto é separador de milhar
    normalizado = limpo.replace(/\./g, '').replace(',', '.')
  } else if (temVirgula) {
    normalizado = limpo.replace(',', '.')
  } else {
    normalizado = limpo
  }

  const n = Number(normalizado)
  if (!Number.isFinite(n)) return null
  return n.toFixed(2)
}
