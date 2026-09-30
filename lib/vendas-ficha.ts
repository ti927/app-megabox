import type { Ficha, Item, Orcamento } from '@/app/(app)/vendas/tipos'

/*
 * A ficha da cotação na TELA: carregada por partes, remendada pelas actions e pela atualização
 * otimista. Puro (sem React nem Supabase) para o teste.
 *
 * Por que por partes: com o banco carregado, a consulta de propostas/pedidos (embeds com RLS
 * em cascata) passava de 8 s e caía em 57014; a ficha inteira virava "Parte desta cotação não
 * carregou". Agora cada parte tem vida própria: a que falha mantém o último valor bom e só ELA
 * é recarregada ("Tentar de novo"); as do fluxo (propostas, pedidos…) nem são pedidas enquanto
 * a pessoa está na aba Cotação.
 */

export const PARTES_CARRINHO = ['itens', 'orcamentos', 'destinos'] as const
export const PARTES_FLUXO = ['propostas', 'pedidos', 'entregas', 'contatos', 'documentoItens', 'empresaEmissora'] as const
export const PARTES_FICHA = [...PARTES_CARRINHO, ...PARTES_FLUXO] as const

export type ParteFicha = (typeof PARTES_FICHA)[number]
export type PartesFicha = Partial<Pick<Ficha, ParteFicha>>

/** A ficha como a tela a usa: o que falhou e o que ainda não foi pedido. */
export type FichaTela = Ficha & {
  /** partes que o servidor tentou e não conseguiu (timeout, rede) — valor da parte é vazio */
  falhas: ParteFicha[]
  /** partes ainda não pedidas (as do fluxo, com a aba Cotação aberta) */
  pendentes: ParteFicha[]
}

/** Nome da parte para a mensagem de erro. */
export const NOME_PARTE: Record<ParteFicha, string> = {
  itens: 'os produtos do carrinho',
  orcamentos: 'os orçamentos',
  destinos: 'os endereços do cliente',
  propostas: 'as propostas',
  pedidos: 'os pedidos',
  entregas: 'as entregas',
  contatos: 'os contatos',
  documentoItens: 'o documento da proposta',
  empresaEmissora: 'a empresa emissora',
}

export function ehParteFicha(x: unknown): x is ParteFicha {
  return typeof x === 'string' && (PARTES_FICHA as readonly string[]).includes(x)
}

function carregada(f: FichaTela, p: ParteFicha): boolean {
  return !f.falhas.includes(p) && !f.pendentes.includes(p)
}

function comEstado(f: Ficha, falhas: ParteFicha[], pendentes: ParteFicha[]): FichaTela {
  return { ...f, falhas, pendentes, incompleta: falhas.length > 0 }
}

/**
 * Ficha nova do servidor (render da página) sobre a que está na tela. Mesma cotação: parte que
 * falhou ou não foi pedida agora fica com o último valor BOM da tela — nunca vira lista vazia.
 * Cotação diferente: a nova, como veio.
 */
export function mesclarFicha(anterior: FichaTela | null, nova: FichaTela): FichaTela {
  if (!anterior || anterior.cotacao.id !== nova.cotacao.id) return nova
  const r: Record<string, unknown> = { ...nova }
  const falhas: ParteFicha[] = []
  const pendentes: ParteFicha[] = []
  for (const p of PARTES_FICHA) {
    if (carregada(nova, p)) continue
    if (carregada(anterior, p)) r[p] = anterior[p]
    else if (nova.falhas.includes(p) || anterior.falhas.includes(p)) falhas.push(p)
    else pendentes.push(p)
  }
  return comEstado(r as Ficha, falhas, pendentes)
}

/**
 * Partes recarregadas (action "recarregar", ou o retorno de uma gravação) sobre a ficha da tela.
 * As que vieram substituem; as que falharam de novo continuam com o valor antigo, se havia.
 */
export function aplicarPartes(f: FichaTela, partes: PartesFicha, falhouAgora: readonly ParteFicha[] = []): FichaTela {
  const r: Record<string, unknown> = { ...f }
  const vieram = new Set<ParteFicha>()
  for (const p of PARTES_FICHA) {
    if (p in partes && !falhouAgora.includes(p)) {
      r[p] = partes[p]
      vieram.add(p)
    }
  }
  const falhas = PARTES_FICHA.filter(
    (p) => !vieram.has(p) && (f.falhas.includes(p) || (falhouAgora.includes(p) && !carregada(f, p))),
  )
  const pendentes = f.pendentes.filter((p) => !vieram.has(p) && !falhas.includes(p))
  return comEstado(r as Ficha, falhas, pendentes)
}

// ------------------------------------------------------------------ otimista

/** Item provisório: aparece no carrinho no clique; a resposta da action o substitui. */
export function comItem(f: FichaTela, item: Item): FichaTela {
  return { ...f, itens: [...f.itens, item] }
}

/** Tira o item e os orçamentos dele (a action apaga em cascata). */
export function semItem(f: FichaTela, itemId: string): FichaTela {
  return {
    ...f,
    itens: f.itens.filter((i) => i.id !== itemId),
    orcamentos: f.orcamentos.filter((o) => o.cotacao_item_id !== itemId),
  }
}

export function semOrcamento(f: FichaTela, orcamentoId: string): FichaTela {
  return { ...f, orcamentos: f.orcamentos.filter((o) => o.id !== orcamentoId) }
}

/**
 * Troféu (bTOUP0/bTOUI0): marcar desmarca o vencedor atual DO MESMO ITEM; desmarcar só
 * desmarca. É a mesma regra de fn_definir_vencedor — a resposta do banco confirma ou desfaz.
 */
export function comVencedor(f: FichaTela, orcamentoId: string, marcar: boolean): FichaTela {
  const alvo = f.orcamentos.find((o) => o.id === orcamentoId)
  if (!alvo) return f
  return {
    ...f,
    orcamentos: f.orcamentos.map((o: Orcamento) =>
      o.id === orcamentoId
        ? { ...o, vencedor: marcar }
        : marcar && o.cotacao_item_id === alvo.cotacao_item_id && o.vencedor
          ? { ...o, vencedor: false }
          : o,
    ),
  }
}

/** Os vencedores de um item, para desfazer o troféu otimista exatamente como estava. */
export function vencedoresDoItem(f: FichaTela, orcamentoId: string): Map<string, boolean> {
  const alvo = f.orcamentos.find((o) => o.id === orcamentoId)
  return new Map(
    f.orcamentos.filter((o) => alvo && o.cotacao_item_id === alvo.cotacao_item_id).map((o) => [o.id, o.vencedor]),
  )
}

export function restaurarVencedores(f: FichaTela, antes: Map<string, boolean>): FichaTela {
  return { ...f, orcamentos: f.orcamentos.map((o) => (antes.has(o.id) ? { ...o, vencedor: antes.get(o.id)! } : o)) }
}

/**
 * O que as actions do carrinho devolvem: além do `EstadoAcao`, o carrinho RELIDO do banco
 * (itens + orçamentos com os derivados de dinheiro) — a tela troca só isso, sem re-renderizar a
 * página inteira (antes: revalidatePath → layout + página + ficha inteira a cada clique).
 */
export type CarrinhoRelido = { partes: PartesFicha; falhas: ParteFicha[] }
