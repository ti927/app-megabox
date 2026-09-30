'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatarReais } from '@/lib/dinheiro'
import { atalhosDePrazo, diasDoPrazo, mesmosPrazos, ordenarPrazos } from '@/lib/fluxo-tela'

import { rateioPrazos } from './acoes-fluxo'
import type { Opcao } from './tipos'
import type { Parcela } from './tipos-fluxo'

/*
 * CONDIÇÕES DE PAGAMENTO do pedido (vendas.md §2.9: `Opt.FormaPgto` + multi-seleção de
 * `Opt.ParcelasReceber` → pedidos.forma_pagamento_id + pedido_prazos). No Bubble era um
 * multi-select de 21 opções ao lado de um dropdown — o vendedor não via o que estava montando.
 * Aqui: a forma é um botão de cada (um clique), os prazos vêm dos atalhos de sempre
 * ("30/60/90") ou um a um, e a LINHA DO TEMPO mostra as parcelas com o valor de cada uma.
 *
 * O valor das parcelas é do BANCO (fn_rateio_prazos, db/029: mesma ordem e mesmo rateio de
 * fn_gerar_contas_receber), sobre o total do pedido. A tela não soma nem divide nada.
 */

export function CondicoesPagamento({
  pedidoId,
  formas,
  prazos,
  forma,
  selecionados,
  aoMudarForma,
  aoMudarPrazos,
  desabilitado,
  sugeridos,
}: {
  pedidoId: string
  formas: Opcao[]
  prazos: Opcao[]
  forma: number | null
  selecionados: number[]
  aoMudarForma: (id: number) => void
  aoMudarPrazos: (ids: number[]) => void
  desabilitado: boolean
  /** os prazos vieram da condição da proposta e ainda não foram gravados */
  sugeridos: boolean
}) {
  const atalhos = atalhosDePrazo(prazos)
  const ordenados = ordenarPrazos(selecionados, prazos)
  const restantes = prazos.filter((p) => !selecionados.includes(p.id))
  const chave = ordenados.join(',')

  const [parcelas, setParcelas] = useState<Parcela[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  useEffect(() => {
    if (!chave) {
      setParcelas([])
      return
    }
    let vivo = true
    // Pequena espera: vários cliques seguidos pedem um rateio só.
    const t = setTimeout(() => {
      rateioPrazos(pedidoId, chave.split(',').map(Number)).then((r) => {
        if (!vivo) return
        if ('erro' in r) {
          setErro(r.erro)
          setParcelas(null)
        } else {
          setErro(null)
          setParcelas(r.parcelas)
        }
      })
    }, 200)
    return () => {
      vivo = false
      clearTimeout(t)
    }
  }, [pedidoId, chave])

  const maxDias = Math.max(30, ...ordenados.map((id) => diasDoPrazo(prazos.find((p) => p.id === id)?.nome ?? '') ?? 0))
  const nome = (id: number) => prazos.find((p) => p.id === id)?.nome ?? '?'

  return (
    <div className="pgto" data-teste="condicoes-pagamento">
      <div className="pgto-linha">
        <span className="pgto-rotulo" id="pgto-forma">
          Forma
        </span>
        <div className="segmentos" role="radiogroup" aria-labelledby="pgto-forma">
          {formas.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={forma === f.id}
              disabled={desabilitado}
              onClick={() => aoMudarForma(f.id)}
              data-teste={`forma-${f.id}`}
            >
              {f.nome === 'Transferencia' ? 'Transferência' : f.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="pgto-linha">
        <span className="pgto-rotulo" id="pgto-prazos">
          Prazos
        </span>
        <div className="pgto-prazos" role="group" aria-labelledby="pgto-prazos">
          {atalhos.map((a) => (
            <button
              key={a.rotulo}
              type="button"
              className="chip"
              aria-pressed={mesmosPrazos(a.ids, selecionados)}
              disabled={desabilitado}
              onClick={() => aoMudarPrazos(a.ids)}
              data-teste={`atalho-${a.rotulo}`}
            >
              {a.rotulo}
            </button>
          ))}
          <select
            className="pgto-outro"
            aria-label="Acrescentar outro prazo"
            value=""
            disabled={desabilitado || restantes.length === 0 || selecionados.length >= 12}
            onChange={(e) => e.target.value && aoMudarPrazos([...selecionados, Number(e.target.value)])}
          >
            <option value="">+ outro prazo</option>
            {restantes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {ordenados.length === 0 ? (
        <p className="pgto-vazio">Escolha os prazos. Cada entrega confirmada vira uma parcela por prazo.</p>
      ) : (
        <div className="pgto-tempo" aria-label="Parcelas previstas">
          <ol className="pgto-trilho">
            <li className="pgto-marco pgto-marco-inicio" style={{ left: '0%' }}>
              <span>Entrega</span>
            </li>
            {ordenados.map((id, k) => {
              const dias = diasDoPrazo(nome(id)) ?? 0
              const p = parcelas?.find((x) => x.prazo_id === id)
              return (
                <li key={id} className="pgto-marco" style={{ left: `${(dias / maxDias) * 100}%` }} data-teste="parcela">
                  <span className="pgto-prazo">
                    {nome(id)}
                    {!desabilitado ? (
                      <button
                        type="button"
                        className="pgto-tira"
                        aria-label={`Tirar o prazo ${nome(id)}`}
                        onClick={() => aoMudarPrazos(selecionados.filter((x) => x !== id))}
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    ) : null}
                  </span>
                  <strong>{p?.valor ? formatarReais(p.valor) : '…'}</strong>
                  <small>{k + 1}ª parcela</small>
                </li>
              )
            })}
          </ol>
          <p className="pgto-nota">
            {erro ??
              `${ordenados.length} ${ordenados.length === 1 ? 'parcela' : 'parcelas'} sobre o total do pedido, vencendo ${ordenados
                .map((id) => nome(id))
                .join(', ')} após a data de cada entrega. Na confirmação, cada entrega é rateada do mesmo jeito.`}
            {sugeridos ? ' Sugerido pela condição da proposta — confira e grave.' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
