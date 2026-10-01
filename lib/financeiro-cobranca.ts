/**
 * Texto do e-mail de cobrança ao fornecedor (WF bTpUZ/bTpUg, financeiro.md §4.3).
 *
 * Puro, sem banco. Sai TEXTO puro: quem monta o HTML é `textoParaHtml` (escapa tudo). Dinheiro
 * como string exata, formatado e somado em centavos (lib/financeiro), nunca float.
 */

import { formatarReaisExato, somarReais } from '@/lib/financeiro'

export type ContaCobranca = {
  pedido_numero: string | null
  parcela: number
  parcelas_total: number
  cliente: string
  dt_vencimento: string
  nf_fornecedor_numero: string | null
  valor_comissao: string
}

function dia(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

/** Assunto do Bubble: "Cobrança número N". */
export function assuntoCobranca(numero: number): string {
  return `Cobrança número ${numero}`
}

export function textoCobranca(p: {
  numero: number
  contato: string | null
  fornecedor: string
  usuario: string
  contas: ContaCobranca[]
}): string {
  const total = somarReais(p.contas.map((c) => c.valor_comissao))
  const linhas = p.contas.map(
    (c) =>
      `• Pedido ${c.pedido_numero ?? '—'} (parcela ${c.parcela}/${c.parcelas_total}) — ${c.cliente} — ` +
      `NF ${c.nf_fornecedor_numero ?? '—'} — vencimento ${dia(c.dt_vencimento)} — comissão ${formatarReaisExato(c.valor_comissao)}`,
  )
  return [
    `Olá${p.contato ? ` ${p.contato}` : ''},`,
    '',
    `Segue a cobrança número ${p.numero} de ${p.fornecedor}, com as comissões abaixo.`,
    '',
    ...linhas,
    '',
    `Quantidade: ${p.contas.length}`,
    `Valor total em comissões: ${formatarReaisExato(total)}`,
    '',
    'Qualquer dúvida, estou à disposição.',
    '',
    'Atenciosamente,',
    p.usuario,
    'Grupo MegaBox',
  ].join('\n')
}
