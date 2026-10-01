'use client'

import { CircleAlert, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Icone } from '@/componentes/icone'
import { formatarReais } from '@/lib/dinheiro'
import { atalhosDePrazo, diasDoPrazo, frasePagamento, mesmosPrazos, ordenarPrazos, sugerirPrazos } from '@/lib/fluxo-tela'

import { rateioPrazos } from './acoes-fluxo'
import type { Opcao } from './tipos'
import type { Parcela } from './tipos-fluxo'

/*
 * CONDIÇÕES DE PAGAMENTO do pedido (vendas.md §2.9: `Opt.FormaPgto` + multi-seleção de
 * `Opt.ParcelasReceber` → pedidos.forma_pagamento_id + pedido_prazos). No Bubble era um
 * multi-select de 21 opções ao lado de um dropdown, e o vendedor não via o que estava montando
 * — nem a diferença entre o que o CLIENTE paga e o que a MegaBox RECEBE.
 *
 * Aqui, de cima para baixo:
 *   1. a FRASE da condição, em português ("O cliente paga em 3 parcelas, 30, 60 e 90 dias
 *      depois de cada entrega, por boleto") — é ela que vai ao documento;
 *   2. a forma (um botão de cada) e os prazos (atalhos "30/60/90" ou um a um);
 *   3. a tabela das parcelas: quando vence, quanto da VENDA o cliente paga e quanto de
 *      COMISSÃO a MegaBox recebe. Valores do BANCO (fn_rateio_prazos, db/029: mesma ordem e
 *      mesmo rateio de fn_gerar_contas_receber), sobre o total do pedido. A tela não soma nada;
 *   4. a comparação com a condição ESCRITA na proposta (texto livre), para o vendedor ver na
 *      hora se o pedido diz o mesmo que o cliente aceitou.
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
  condicaoProposta,
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
  /** a condição de pagamento escrita na proposta (texto livre, 008) */
  condicaoProposta: string | null
}) {
  const atalhos = atalhosDePrazo(prazos)
  const ordenados = ordenarPrazos(selecionados, prazos)
  const restantes = prazos.filter((p) => !selecionados.includes(p.id))
  const chave = ordenados.join(',')
  const nomeForma = formas.find((f) => f.id === forma)?.nome ?? null
  const frase = frasePagamento(ordenados, prazos, nomeForma)
  const daProposta = sugerirPrazos(condicaoProposta, prazos)
  const confere = daProposta.length > 0 && mesmosPrazos(daProposta, ordenados)

  const [parcelas, setParcelas] = useState<Parcela[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  useEffect(() => {
    if (!chave) return
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

  const nome = (id: number) => prazos.find((p) => p.id === id)?.nome ?? '?'

  return (
    <div className="pgto" data-teste="condicoes-pagamento">
      <p className="pgto-frase" data-vazio={!frase || undefined} data-teste="frase-pagamento">
        {frase ?? 'Escolha a forma e os prazos: cada entrega confirmada vira uma parcela por prazo.'}
      </p>

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

      {ordenados.length > 0 ? (
        <table className="pgto-tabela" aria-label="Parcelas previstas" data-teste="tabela-parcelas">
          <thead>
            <tr>
              <th scope="col">Parcela</th>
              <th scope="col">Vence</th>
              <th scope="col" className="pgto-num">
                Cliente paga ao fornecedor
              </th>
              <th scope="col" className="pgto-num">
                MegaBox recebe (comissão)
              </th>
              <th scope="col">
                <span className="so-leitor">Tirar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((id, k) => {
              const p = parcelas?.find((x) => x.prazo_id === id)
              const dias = diasDoPrazo(nome(id))
              return (
                <tr key={id} data-teste="parcela">
                  <td>{k + 1}ª</td>
                  <td>{dias === null ? nome(id) : dias === 0 ? 'na entrega' : `${dias} dias após a entrega`}</td>
                  <td className="pgto-num">{p ? formatarReais(p.valor) : '…'}</td>
                  <td className="pgto-num pgto-comissao">{p ? formatarReais(p.comissao) : '…'}</td>
                  <td>
                    {!desabilitado ? (
                      <button type="button" className="pgto-tira" aria-label={`Tirar o prazo ${nome(id)}`} title="Tirar este prazo" onClick={() => aoMudarPrazos(selecionados.filter((x) => x !== id))}>
                        <Icone icone={X} tamanho={14} />
                      </button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : null}

      <p className="pgto-nota">
        {erro ??
          (ordenados.length
            ? 'Valores sobre o pedido inteiro. Na confirmação de cada entrega (tela Financeiro) a mesma divisão é feita sobre o valor daquela entrega, com vencimento contado da data real.'
            : '')}
      </p>

      {condicaoProposta ? (
        <p className="pgto-proposta" data-tom={ordenados.length === 0 ? undefined : confere ? 'ok' : 'alerta'} data-teste="pgto-proposta">
          <Icone icone={ordenados.length && !confere ? CircleAlert : Check} tamanho={14} />
          Na proposta o cliente aceitou: <b>“{condicaoProposta}”</b>
          {ordenados.length === 0 ? '' : confere ? ' — o pedido diz o mesmo.' : daProposta.length ? ' — os prazos do pedido são outros.' : ' — confira com o financeiro.'}
          {sugeridos ? ' Prazos pré-marcados por ela: confira e grave.' : ''}
        </p>
      ) : null}
    </div>
  )
}
