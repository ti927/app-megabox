'use client'

import './fluxo.css'

import { Check, FileText, ShoppingCart, Truck } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import type { Aba } from '@/lib/vendas'
import { ETAPA } from '@/lib/vendas'

import { AbaPedidos } from './pedido-tela'
import { AbaPropostas } from './proposta-tela'
import type { Ficha, Opcao, OpcoesFicha } from './tipos'
import { ANCORA_ENTREGAS } from './tipos-fluxo'

/*
 * Proposta → pedido → entregas em UMA tela, dentro da ficha da cotação (specs/paginas/vendas.md
 * §2.8, §2.9, §2.10; vendas-reusables.md §2.1). A referência é o "Pedido ao Fornecedor" do
 * Bubble (`pop add edita pedido`): o documento ao vivo à esquerda e, à direita, tudo o que o
 * vendedor faz — sem diálogo sobre a ficha nem pop-up sobre pop-up.
 *
 * Desde 01/10 as antigas abas Propostas e Pedidos são UMA aba ("Proposta e pedido"), com a
 * TRILHA no topo: 1 Proposta → 2 Pedido → 3 Entregas, cada passo com o seu estado. O passo
 * ativo decide o que a mesa mostra:
 *   - proposta-tela.tsx  — lista, rascunho e envio da proposta; "Transformar em pedido"
 *   - pedido-tela.tsx    — e-mails, condições de pagamento (pagamento.tsx), OC, envio, duplicar
 *   - entregas.tsx       — as entregas de cada item como CAMINHÕES, com NF/saída na própria carga
 *   - documento.tsx      — o documento (proposta e pedido), com o rascunho marcado
 * As server actions continuam em acoes-fluxo.ts, com as mesmas regras.
 */


type Passo = { id: 'proposta' | 'pedido' | 'entregas'; titulo: string; estado: string; tom?: 'ok' | 'alerta' | 'erro'; feito: boolean; aberto: boolean }

function passos(ficha: Ficha): Passo[] {
  const props = ficha.propostas
  const enviada = props.find((p) => p.enviada)
  const pedido = ficha.pedidos.find((p) => p.etapa_id !== ETAPA.CANCELADO && !p.finalizado) ?? ficha.pedidos[0] ?? null
  const entregas = pedido ? ficha.entregas.filter((e) => e.pedido_id === pedido.id && e.status_id !== ETAPA.CANCELADO) : []
  const sairam = entregas.filter((e) => e.status_id >= ETAPA.EM_ENTREGA).length
  return [
    {
      id: 'proposta',
      titulo: 'Proposta',
      estado: enviada ? `Enviada ${formatarData(enviada.enviada_em)}` : props.length ? 'Rascunho, não enviada' : 'Ainda não criada',
      tom: enviada ? 'ok' : props.length ? 'alerta' : undefined,
      feito: !!enviada,
      aberto: true,
    },
    {
      id: 'pedido',
      titulo: 'Pedido',
      estado: !pedido
        ? 'Transforme a proposta enviada'
        : pedido.etapa_id === ETAPA.CANCELADO
          ? 'Cancelado'
          : pedido.formalizado
            ? `Enviado ${formatarData(pedido.formalizado_em)}`
            : 'Criado, não enviado',
      tom: !pedido ? undefined : pedido.etapa_id === ETAPA.CANCELADO ? 'erro' : pedido.formalizado ? 'ok' : 'alerta',
      feito: !!pedido?.formalizado,
      aberto: !!pedido,
    },
    {
      id: 'entregas',
      titulo: 'Entregas',
      estado: !pedido
        ? '—'
        : entregas.length === 0
          ? 'Nenhum caminhão programado'
          : `${entregas.length} ${entregas.length === 1 ? 'caminhão' : 'caminhões'}, ${sairam} ${sairam === 1 ? 'saiu' : 'saíram'}`,
      tom: entregas.length && sairam === entregas.length ? 'ok' : undefined,
      feito: entregas.length > 0 && sairam === entregas.length,
      aberto: !!pedido,
    },
  ]
}

const ICONES = { proposta: FileText, pedido: ShoppingCart, entregas: Truck }

export function FluxoVenda({
  ficha,
  aba,
  mudarAba,
  editavel,
  etapas,
  opcoesFicha,
}: {
  ficha: Ficha
  aba: Exclude<Aba, 'cotacao'>
  mudarAba: (a: Aba) => void
  editavel: boolean
  etapas: Opcao[]
  opcoesFicha: OpcoesFicha
}) {
  const lista = passos(ficha)
  const ativo = aba === 'propostas' ? 'proposta' : 'pedido'

  function ir(p: Passo) {
    if (!p.aberto) return
    mudarAba(p.id === 'proposta' ? 'propostas' : 'pedidos')
    if (p.id === 'entregas') {
      // Depois da troca de passo o painel do pedido já está na tela: rola até as entregas.
      requestAnimationFrame(() => document.getElementById(ANCORA_ENTREGAS)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  return (
    <div className="fluxo-venda">
      <nav className="trilha" aria-label="Etapas da venda">
        <ol>
          {lista.map((p, k) => {
            // Pedido e entregas moram na MESMA mesa: os dois passos acendem juntos.
            const atual = p.id === ativo || (ativo === 'pedido' && p.id === 'entregas')
            return (
              <li key={p.id} data-feito={p.feito || undefined} data-atual={atual || undefined}>
                <button type="button" onClick={() => ir(p)} disabled={!p.aberto} aria-current={atual ? 'step' : undefined} data-teste={`passo-${p.id}`}>
                  <span className="trilha-num" aria-hidden="true">
                    {p.feito ? <Icone icone={Check} tamanho={16} /> : k + 1}
                  </span>
                  <span className="trilha-texto">
                    <strong>
                      <Icone icone={ICONES[p.id]} tamanho={16} />
                      {p.titulo}
                    </strong>
                    <small data-tom={p.tom}>{p.estado}</small>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
      {aba === 'propostas' ? (
        <AbaPropostas ficha={ficha} editavel={editavel} irParaPedidos={() => mudarAba('pedidos')} />
      ) : (
        <AbaPedidos ficha={ficha} etapas={etapas} opcoesFicha={opcoesFicha} />
      )}
    </div>
  )
}
