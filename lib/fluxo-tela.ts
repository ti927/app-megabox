/**
 * Regras PURAS da tela nova de proposta → pedido → entregas (app/(app)/vendas/proposta-tela,
 * pedido-tela, entregas). Sem banco, sem dinheiro: aqui só QUANTIDADE (em milésimos, BigInt,
 * como lib/vendas-fluxo), prazos de pagamento (dias, não valores) e larguras de barra.
 * Os valores em R$ da tela vêm todos do banco (v_pedido_item_saldo, fn_rateio_prazos — db/029).
 */

const QTD = /^(\d+)(?:\.(\d{1,3}))?$/

function milesimos(v: string): bigint | null {
  const m = QTD.exec(v.trim())
  if (!m) return null
  return BigInt(m[1]!) * 1000n + BigInt((m[2] ?? '').padEnd(3, '0'))
}

function paraTexto(m: bigint): string {
  const inteiro = m / 1000n
  const frac = (m % 1000n).toString().padStart(3, '0').replace(/0+$/, '')
  return `${inteiro}${frac ? `.${frac}` : ''}`
}

/**
 * "Dividir entrega": parte a quantidade em duas, a primeira com a metade arredondada para
 * baixo no milésimo e a segunda com o resto — a soma é exatamente a original. Menos de 0,002
 * não se divide (a entrega de 0 nasceria sem valor).
 */
export function dividirQuantidade(qtd: string): [string, string] | null {
  const m = milesimos(qtd)
  if (m === null || m < 2n) return null
  const a = m / 2n
  return [paraTexto(a), paraTexto(m - a)]
}

/** Quantidade positiva? ("0", "0.000" e negativas não.) */
export function quantidadePositiva(qtd: string): boolean {
  const m = milesimos(qtd)
  return m !== null && m > 0n
}

/**
 * Largura (%) de cada entrega na barra do item, sobre o MAIOR entre o vendido e o distribuído
 * (entregou a mais → a barra passa do fim e o excesso aparece). Só desenho: número de CSS.
 */
export function larguras(qtdVendida: string, entregas: string[]): { entregas: number[]; falta: number } {
  const vendida = milesimos(qtdVendida) ?? 0n
  const partes = entregas.map((q) => milesimos(q) ?? 0n)
  const soma = partes.reduce((s, q) => s + q, 0n)
  const base = soma > vendida ? soma : vendida
  if (base === 0n) return { entregas: partes.map(() => 0), falta: 0 }
  const pct = (q: bigint) => Number((q * 10000n) / base) / 100
  return { entregas: partes.map(pct), falta: soma < vendida ? pct(vendida - soma) : 0 }
}

// ---------------------------------------------------------------- prazos de pagamento

export type PrazoOpcao = { id: number; nome: string }

/** Dias de um prazo pelo rótulo ("30dd" → 30), como prazos_recebimento.nome (db/003). */
export function diasDoPrazo(nome: string): number | null {
  const m = /^(\d+)\s*dd$/i.exec(nome.trim())
  return m ? Number(m[1]) : null
}

/** Os atalhos da tela: as condições que o comercial mais usa (em dias). */
const ATALHOS: { rotulo: string; dias: number[] }[] = [
  { rotulo: 'À vista', dias: [0] },
  { rotulo: '28 dd', dias: [28] },
  { rotulo: '30 dd', dias: [30] },
  { rotulo: '30/60', dias: [30, 60] },
  { rotulo: '30/60/90', dias: [30, 60, 90] },
  { rotulo: '28/42/56', dias: [28, 42, 56] },
]

/** Atalhos cujos prazos existem (e estão ativos) na lista do banco, com os ids. */
export function atalhosDePrazo(prazos: PrazoOpcao[]): { rotulo: string; ids: number[] }[] {
  const porDia = new Map<number, number>()
  for (const p of prazos) {
    const d = diasDoPrazo(p.nome)
    if (d !== null && !porDia.has(d)) porDia.set(d, p.id)
  }
  return ATALHOS.flatMap((a) => {
    const ids = a.dias.map((d) => porDia.get(d))
    return ids.every((x): x is number => x !== undefined) ? [{ rotulo: a.rotulo, ids }] : []
  })
}

/** Mesma lista de ids, sem olhar a ordem (atalho "ativo"). */
export function mesmosPrazos(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const s = new Set(a)
  return b.every((x) => s.has(x))
}

/** Ordena os ids como fn_gerar_contas_receber (dias, depois id) — a ordem das parcelas. */
export function ordenarPrazos(ids: number[], prazos: PrazoOpcao[]): number[] {
  const dias = (id: number) => diasDoPrazo(prazos.find((p) => p.id === id)?.nome ?? '') ?? Number.MAX_SAFE_INTEGER
  return [...new Set(ids)].sort((x, y) => dias(x) - dias(y) || x - y)
}

/** "30/60/90 dd", "À vista", "28 dd" — o texto da condição a partir dos prazos. */
export function textoDosPrazos(ids: number[], prazos: PrazoOpcao[]): string {
  const dias = ordenarPrazos(ids, prazos)
    .map((id) => diasDoPrazo(prazos.find((p) => p.id === id)?.nome ?? ''))
    .filter((d): d is number => d !== null)
  if (dias.length === 0) return ''
  if (dias.length === 1 && dias[0] === 0) return 'À vista'
  return `${dias.join('/')} dd`
}

/**
 * Sugestão de prazos para o pedido a partir da condição de pagamento da PROPOSTA (texto
 * livre, 008): "30/60/90 dd", "28dd", "30 / 60 dias", "à vista". Só sugere quando TODO número
 * do texto é um prazo existente; "Mediante analise do financeiro" não sugere nada. A tela
 * pré-marca, e o vendedor grava — nada é gravado sozinho.
 */
export function sugerirPrazos(condicao: string | null | undefined, prazos: PrazoOpcao[]): number[] {
  const t = (condicao ?? '').toLowerCase()
  if (!t.trim()) return []
  const porDia = new Map<number, number>()
  for (const p of prazos) {
    const d = diasDoPrazo(p.nome)
    if (d !== null && !porDia.has(d)) porDia.set(d, p.id)
  }
  // Sem \b: "à" não é caractere de palavra para o \b do JS.
  if (/(^|\s)(à|a) vista(\s|$|[.,;])/.test(t) && !/\d/.test(t)) {
    const id = porDia.get(0)
    return id === undefined ? [] : [id]
  }
  const numeros = (t.match(/\d+/g) ?? []).map(Number)
  if (numeros.length === 0 || numeros.length > 12) return []
  if (!/(dd|dias?|\/)/.test(t)) return []
  const ids = numeros.map((n) => porDia.get(n))
  if (!ids.every((x): x is number => x !== undefined)) return []
  return ordenarPrazos(ids, prazos)
}

function listaPt(itens: string[]): string {
  return itens.length <= 1 ? (itens[0] ?? '') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`
}

/**
 * A condição de pagamento em português, para o vendedor (e o documento) lerem sem decifrar
 * "30/60/90 dd": "O cliente paga em 3 parcelas: 30, 60 e 90 dias depois de cada entrega, por
 * Boleto." Sem prazos, null. A forma vem do nome em `formas_pagamento` (003).
 */
export function frasePagamento(ids: number[], prazos: PrazoOpcao[], forma: string | null): string | null {
  const dias = ordenarPrazos(ids, prazos).map((id) => {
    const nome = prazos.find((p) => p.id === id)?.nome ?? ''
    return { nome, dias: diasDoPrazo(nome) }
  })
  if (dias.length === 0) return null
  const porForma = forma ? `, por ${forma === 'Transferencia' ? 'Transferência' : forma}` : ''
  if (dias.length === 1 && dias[0]!.dias === 0) return `O cliente paga à vista, na entrega${porForma}.`
  const quando = listaPt(dias.map((d) => (d.dias === null ? d.nome : String(d.dias))))
  const todosNumeros = dias.every((d) => d.dias !== null)
  const parcelas = dias.length === 1 ? 'em 1 parcela' : `em ${dias.length} parcelas`
  return `O cliente paga ${parcelas}: ${quando}${todosNumeros ? ' dias' : ''} depois de cada entrega${porForma}.`
}
