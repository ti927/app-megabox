import 'server-only'

import { fotosDeGrupos } from '@/lib/fotos-lote'

import type { Ficha, Kanban } from './tipos'

/**
 * Logo do cliente no avatar dos cartões (Bubble: Image N/K/L/M, `QualCliente:Foto`).
 * Só os cartões que a página vai desenhar (as colunas já vêm limitadas pelo `range`), numa
 * leitura de grupos_clifor + UMA assinatura em lote para o quadro inteiro.
 */
export async function comFotosKanban(k: Kanban): Promise<Kanban> {
  const todos = [...k.cotacoes.cartoes, ...k.pedidos.cartoes, ...k.entregas.cartoes, ...k.substituto.cartoes]
  const fotos = await fotosDeGrupos(todos.map((c) => c.cliente_id))
  if (fotos.size === 0) return k
  const foto = <T extends { cliente_id?: string | null }>(c: T): T => ({
    ...c,
    cliente_foto: c.cliente_id ? (fotos.get(c.cliente_id) ?? null) : null,
  })
  return {
    cotacoes: { ...k.cotacoes, cartoes: k.cotacoes.cartoes.map(foto) },
    pedidos: { ...k.pedidos, cartoes: k.pedidos.cartoes.map(foto) },
    entregas: { ...k.entregas, cartoes: k.entregas.cartoes.map(foto) },
    substituto: { ...k.substituto, cartoes: k.substituto.cartoes.map(foto) },
  }
}

/** Logo do cliente ao lado de "Cliente" na cotação aberta (Bubble bTcWp). */
export async function comFotoFicha(f: Ficha | null): Promise<Ficha | null> {
  if (!f) return f
  const fotos = await fotosDeGrupos([f.cotacao.cliente_id])
  return { ...f, clienteFoto: fotos.get(f.cotacao.cliente_id) ?? null }
}
