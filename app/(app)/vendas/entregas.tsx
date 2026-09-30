'use client'

import { Ban, Paperclip, Plus, Split, Trash2, Truck } from 'lucide-react'
import { useState } from 'react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import { larguras, quantidadePositiva } from '@/lib/fluxo-tela'
import { ETAPA, formatarQuantidade } from '@/lib/vendas'
import { faltaQuantidade, MAX_BOLETOS, podeApagarEntrega, podeCancelarEntrega, podeEditarEntrega, podeGravarSaida } from '@/lib/vendas-fluxo'

import { adicionarEntrega, apagarEntrega, cancelarEntrega, dividirEntrega, editarEntrega, gravarSaidaEntrega } from './acoes-fluxo'
import { abrirArquivo, Mensagem, useAcao } from './fluxo-comum'
import type { EntregaFicha, EstadoAcao, Opcao, PropostaItem } from './tipos'
import type { SaldoItem } from './tipos-fluxo'

/*
 * ENTREGAS de um item do pedido (vendas.md §2.9 `rpg pedido OrçFornecedores` + sub-tabela de
 * entregas; §2.10/vendas-reusables §2.1 pop.AnexaNf; §4.9 cancelamento). Tudo NA LINHA:
 *   - data e quantidade se editam no próprio campo (grava ao sair do campo — bUEti, bTbPN);
 *   - "+ Entrega" lança de uma vez o que FALTA (bTbOt) e "Dividir" parte uma entrega em duas;
 *   - o caminhão abre a NF/saída logo abaixo da linha, sem pop-up sobre a ficha;
 *   - a barra e o rodapé mostram o distribuído e o que falta, em qtd e em R$ (v_pedido_item_saldo,
 *     db/029). A tela só formata: a única conta local é de QUANTIDADE (lib/fluxo-tela).
 */

/** Limite de corpo de server action do Next (1 MB padrão, next.config sem bodySizeLimit). */
const LIMITE_ENVIO = 1_000_000

type Painel = { tipo: 'saida' | 'cancelar'; id: string } | null

function zero(v: string | null | undefined): boolean {
  return !v || /^-?0+(\.0+)?$/.test(v)
}

export function EntregasDoItem({
  pedidoId,
  item,
  entregas,
  saldo,
  ativo,
  etapas,
  emailCliente,
  emailFornecedor,
  prazosTexto,
  aoResultado,
}: {
  pedidoId: string
  item: PropostaItem
  entregas: EntregaFicha[]
  saldo: SaldoItem | undefined
  ativo: boolean
  etapas: Opcao[]
  emailCliente: string | null
  emailFornecedor: string | null
  prazosTexto: string
  aoResultado: (r: EstadoAcao) => void
}) {
  const orc = item.orcamento?.id ?? ''
  const acao = useAcao()
  const [painel, setPainel] = useState<Painel>(null)
  const falta = faltaQuantidade(item.qtd, entregas.map((e) => e.qtd))
  const faltaPositiva = quantidadePositiva(falta)
  const barra = larguras(item.qtd, entregas.map((e) => e.qtd))
  const nomeEtapa = (id: number) => etapas.find((e) => e.id === id)?.nome ?? '—'
  const produto = item.orcamento?.produto?.nome ?? '—'

  const aoOk = (r: EstadoAcao) => {
    aoResultado(r)
    setPainel(null)
  }

  return (
    <section className="ent" data-teste="item-pedido">
      <header className="ent-topo">
        <div className="ent-produto">
          <strong>{produto}</strong>
          <small>{item.orcamento?.fornecedor?.nome ?? '—'}</small>
        </div>
        <dl className="ent-numeros">
          <div>
            <dt>Qtd</dt>
            <dd>{formatarQuantidade(item.qtd)}</dd>
          </div>
          <div>
            <dt>Comissão</dt>
            <dd>{saldo ? formatarReais(saldo.valor_comissao) : '…'}</dd>
          </div>
          <div>
            <dt>Frete</dt>
            <dd>{formatarReais(item.valor_frete)}</dd>
          </div>
          <div>
            <dt>Bruto</dt>
            <dd>{saldo ? formatarReais(saldo.valor_bruto) : '…'}</dd>
          </div>
          <div>
            <dt>Tributos</dt>
            <dd>{saldo ? formatarReais(saldo.valor_tributos) : '…'}</dd>
          </div>
          <div>
            <dt>Líquido</dt>
            <dd>{saldo ? formatarReais(saldo.valor_liquido) : '…'}</dd>
          </div>
        </dl>
      </header>

      <div className="ent-barra" role="img" aria-label={`Distribuído ${formatarQuantidade(saldo?.qtd_entregas ?? '0')} de ${formatarQuantidade(item.qtd)}; falta ${formatarQuantidade(falta)}`}>
        {entregas.map((e, k) => (
          <span key={e.id} className="ent-segmento" data-status={e.status_id} style={{ width: `${barra.entregas[k]}%` }} title={`${formatarData(e.dt_prev_entrega)}: ${formatarQuantidade(e.qtd)}`} />
        ))}
        {barra.falta > 0 ? <span className="ent-segmento ent-falta" style={{ width: `${barra.falta}%` }} /> : null}
      </div>

      <div className="ent-rolagem">
        <table className="ent-tabela" data-teste="tabela-entregas">
          <thead>
            <tr>
              <th scope="col">Data prevista</th>
              <th scope="col">Qtd</th>
              <th scope="col">Comissão</th>
              <th scope="col">Bruto</th>
              <th scope="col">Líquido</th>
              <th scope="col">NF / boletos</th>
              <th scope="col">Etapa</th>
              <th scope="col">
                <span className="so-leitor">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entregas.length === 0 ? (
              <tr>
                <td colSpan={8} className="ent-vazio">
                  Nenhuma entrega programada. Use “Programar entrega” para lançar tudo numa entrega e divida se o cliente
                  receber em partes.
                </td>
              </tr>
            ) : null}
            {entregas.map((e) => (
              <LinhaEntrega
                key={`${e.id}:${e.qtd}:${e.dt_prev_entrega}`}
                e={e}
                ativo={ativo}
                etapa={nomeEtapa(e.status_id)}
                painel={painel}
                setPainel={setPainel}
                aoResultado={aoResultado}
                emailCliente={emailCliente}
                emailFornecedor={emailFornecedor}
                prazosTexto={prazosTexto}
                produto={produto}
                aoOk={aoOk}
              />
            ))}
          </tbody>
          {saldo && entregas.length > 0 ? (
            <tfoot>
              <tr>
                <th scope="row">Distribuído</th>
                <td>{formatarQuantidade(saldo.qtd_entregas)}</td>
                <td>{formatarReais(saldo.comissao_entregas)}</td>
                <td>{formatarReais(saldo.bruto_entregas)}</td>
                <td>{formatarReais(saldo.liquido_entregas)}</td>
                <td colSpan={3} />
              </tr>
              <tr className="ent-falta-linha" data-zerado={zero(saldo.falta_qtd) || undefined} data-teste="falta-item">
                <th scope="row">Falta</th>
                <td>{formatarQuantidade(saldo.falta_qtd)}</td>
                <td>{formatarReais(saldo.falta_comissao)}</td>
                <td>{formatarReais(saldo.falta_bruto)}</td>
                <td>{formatarReais(saldo.falta_liquido)}</td>
                <td colSpan={3}>
                  {zero(saldo.falta_qtd)
                    ? 'As entregas somam o pedido.'
                    : saldo.falta_qtd.startsWith('-')
                      ? 'As entregas passam do pedido.'
                      : 'Ainda falta programar.'}
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {ativo && faltaPositiva ? (
        <div className="ent-rodape">
          <button
            type="button"
            className="botao-secundario"
            disabled={acao.pendente}
            aria-busy={acao.pendente}
            onClick={() =>
              acao.executar(adicionarEntrega, { pedido_id: pedidoId, orcamento_fornecedor_id: orc, qtd: falta, dt_prev_entrega: '' }, 'Programando…', aoResultado)
            }
            data-teste="nova-entrega"
          >
            <Icone icone={Plus} tamanho={16} />
            {acao.pendente ? 'Programando…' : entregas.length === 0 ? `Programar entrega (${formatarQuantidade(falta)})` : `Programar o que falta (${formatarQuantidade(falta)})`}
          </button>
          {acao.estado.erro ? <Mensagem estado={acao.estado} /> : null}
        </div>
      ) : null}
    </section>
  )
}

function LinhaEntrega({
  e,
  ativo,
  etapa,
  painel,
  setPainel,
  aoResultado,
  aoOk,
  emailCliente,
  emailFornecedor,
  prazosTexto,
  produto,
}: {
  e: EntregaFicha
  ativo: boolean
  etapa: string
  painel: Painel
  setPainel: (p: Painel) => void
  aoResultado: (r: EstadoAcao) => void
  aoOk: (r: EstadoAcao) => void
  emailCliente: string | null
  emailFornecedor: string | null
  prazosTexto: string
  produto: string
}) {
  const acao = useAcao()
  const [qtd, setQtd] = useState(formatarQuantidade(e.qtd))
  const [data, setData] = useState(e.dt_prev_entrega ?? '')
  const [apagando, setApagando] = useState(false)
  const editavel = ativo && podeEditarEntrega(e)
  const nf = e.arquivos.find((a) => a.tipo === 'nf_fornecedor')
  const boletos = e.arquivos.filter((a) => a.tipo === 'boleto')
  const aberto = painel?.id === e.id ? painel.tipo : null

  function gravar(novaQtd: string, novaData: string) {
    if (novaQtd === formatarQuantidade(e.qtd) && novaData === (e.dt_prev_entrega ?? '')) return
    acao.executar(editarEntrega, { entrega_id: e.id, qtd: novaQtd, dt_prev_entrega: novaData }, 'Gravando…', aoResultado)
  }

  return (
    <>
      <tr data-status={e.status_id} data-aberta={aberto || undefined} aria-busy={acao.pendente || undefined} data-teste="linha-entrega">
        <td>
          {editavel ? (
            <input
              type="date"
              className="ent-campo"
              aria-label="Data prevista da entrega"
              value={data}
              onChange={(x) => setData(x.target.value)}
              onBlur={() => gravar(qtd, data)}
              data-teste="campo-data-entrega"
            />
          ) : (
            formatarData(e.dt_prev_entrega)
          )}
          {e.vendedor_substituto_id ? <small>com substituto de férias</small> : null}
        </td>
        <td>
          {editavel ? (
            <input
              className="ent-campo ent-qtd"
              inputMode="decimal"
              aria-label="Quantidade da entrega"
              value={qtd}
              onChange={(x) => setQtd(x.target.value)}
              onBlur={() => gravar(qtd, data)}
              onKeyDown={(x) => x.key === 'Enter' && (x.preventDefault(), gravar(qtd, data))}
              data-teste="campo-qtd-entrega"
            />
          ) : (
            formatarQuantidade(e.qtd)
          )}
        </td>
        <td className="ent-valor">{formatarReais(e.valor_comissao)}</td>
        <td className="ent-valor">{formatarReais(e.valor_venda_bruto)}</td>
        <td className="ent-valor">{formatarReais(e.valor_venda_liquido)}</td>
        <td>
          {nf ? (
            <button type="button" className="botao-texto" onClick={() => abrirArquivo(nf.path, (m) => aoResultado({ erro: m }))}>
              <Icone icone={Paperclip} tamanho={14} />
              NF {e.nf_fornecedor_numero ?? nf.nome_arquivo}
            </button>
          ) : (
            <span>{e.nao_emite_nf ? 'Não emite NF' : e.nf_fornecedor_numero ? `NF ${e.nf_fornecedor_numero}` : '—'}</span>
          )}
          <small>
            {boletos.length} {boletos.length === 1 ? 'boleto' : 'boletos'}
          </small>
        </td>
        <td>
          <span className="selo" data-tom={e.status_id === ETAPA.CANCELADO ? 'erro' : e.status_id >= ETAPA.EM_ENTREGA ? 'ok' : undefined}>
            {etapa}
          </span>
          {e.motivo_cancelamento ? <small className="fluxo-motivo">{e.motivo_cancelamento}</small> : null}
        </td>
        <td>
          <div className="ent-acoes">
            {ativo && podeGravarSaida(e.status_id) ? (
              <button
                type="button"
                className="ent-icone"
                data-destaque={e.saiu_entrega || undefined}
                aria-expanded={aberto === 'saida'}
                aria-label={e.saiu_entrega ? 'NF e saída (já saiu)' : 'Registrar NF e saída'}
                title={e.saiu_entrega ? 'NF e saída (já saiu)' : 'Registrar NF e saída'}
                onClick={() => setPainel(aberto === 'saida' ? null : { tipo: 'saida', id: e.id })}
                data-teste="abrir-saida"
              >
                <Icone icone={Truck} tamanho={20} />
              </button>
            ) : null}
            {editavel ? (
              <button
                type="button"
                className="ent-icone"
                aria-label="Dividir em duas entregas"
                title="Dividir em duas entregas"
                disabled={acao.pendente}
                onClick={() => acao.executar(dividirEntrega, { entrega_id: e.id }, 'Dividindo…', aoResultado)}
                data-teste="dividir-entrega"
              >
                <Icone icone={Split} tamanho={18} />
              </button>
            ) : null}
            {ativo && podeApagarEntrega(e) && e.arquivos.length === 0 ? (
              apagando ? (
                <span className="fluxo-confirma">
                  <button
                    type="button"
                    className="botao-perigo"
                    onClick={() => acao.executar(apagarEntrega, { entrega_id: e.id }, 'Apagando…', aoResultado)}
                    data-teste="apagar-entrega-sim"
                  >
                    Apagar
                  </button>
                  <button type="button" className="botao-secundario" onClick={() => setApagando(false)}>
                    Não
                  </button>
                </span>
              ) : (
                <button type="button" className="ent-icone" aria-label="Apagar entrega" title="Apagar entrega" onClick={() => setApagando(true)} data-teste="apagar-entrega">
                  <Icone icone={Trash2} tamanho={18} />
                </button>
              )
            ) : ativo && podeCancelarEntrega(e.status_id) ? (
              <button
                type="button"
                className="ent-icone"
                aria-expanded={aberto === 'cancelar'}
                aria-label="Cancelar entrega"
                title="Cancelar entrega"
                onClick={() => setPainel(aberto === 'cancelar' ? null : { tipo: 'cancelar', id: e.id })}
                data-teste="cancelar-entrega"
              >
                <Icone icone={Ban} tamanho={18} />
              </button>
            ) : null}
          </div>
          {acao.estado.erro ? <small className="ent-erro">{acao.estado.erro}</small> : null}
        </td>
      </tr>
      {aberto === 'saida' ? (
        <tr className="ent-painel">
          <td colSpan={8}>
            <PainelSaida e={e} temContatoCliente={!!emailCliente} prazosTexto={prazosTexto} aoOk={aoOk} fechar={() => setPainel(null)} />
          </td>
        </tr>
      ) : null}
      {aberto === 'cancelar' ? (
        <tr className="ent-painel">
          <td colSpan={8}>
            <PainelCancelar e={e} produto={produto} emailCliente={emailCliente} emailFornecedor={emailFornecedor} aoOk={aoOk} fechar={() => setPainel(null)} />
          </td>
        </tr>
      ) : null}
    </>
  )
}

/**
 * pop.AnexaNf (vendas-reusables §2.1) NA LINHA: NF do fornecedor, boletos, envio ao cliente e
 * "saiu para entrega". Os dois botões são o interruptor do Bubble: "Registrar saída" liga
 * (Em Entrega, bTcRH), "Só gravar" mantém como está, e "Desfazer saída" desliga (bTcZR).
 */
function PainelSaida({
  e,
  temContatoCliente,
  prazosTexto,
  aoOk,
  fechar,
}: {
  e: EntregaFicha
  temContatoCliente: boolean
  prazosTexto: string
  aoOk: (r: EstadoAcao) => void
  fechar: () => void
}) {
  const acao = useAcao()
  const [local, setLocal] = useState<EstadoAcao>({})
  const [naoEmite, setNaoEmite] = useState(e.nao_emite_nf)
  const nf = e.arquivos.filter((a) => a.tipo === 'nf_fornecedor')
  const boletos = e.arquivos.filter((a) => a.tipo === 'boleto')

  function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const submissor = (ev.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const form = new FormData(ev.currentTarget)
    const saiu = submissor?.value === 'sair' ? true : submissor?.value === 'voltar' ? false : e.saiu_entrega
    form.delete('saiu')
    if (saiu) form.set('saiu', 'on')
    const total = [...form.values()].reduce((s, v) => s + (v instanceof File ? v.size : 0), 0)
    if (total > LIMITE_ENVIO) {
      setLocal({ erro: 'Os arquivos passam de 1 MB juntos. Envie um de cada vez.' })
      return
    }
    setLocal({})
    acao.executar(gravarSaidaEntrega, form, saiu && !e.saiu_entrega ? 'Registrando saída…' : 'Gravando…', aoOk)
  }

  return (
    <form className="ent-form" noValidate onSubmit={enviar} encType="multipart/form-data" data-teste="painel-saida">
      <input type="hidden" name="entrega_id" value={e.id} />
      <div className="ent-form-campos">
        <label className="caixa ent-largo">
          <input type="checkbox" name="nao_emite_nf" checked={naoEmite} onChange={(x) => setNaoEmite(x.target.checked)} />
          Fornecedor não emite nota fiscal
        </label>
        <label className="campo">
          <span>Número da NF</span>
          <input name="nf_fornecedor_numero" defaultValue={e.nf_fornecedor_numero ?? ''} disabled={naoEmite} maxLength={30} data-teste="campo-nf" />
        </label>
        <label className="campo">
          <span>Data da NF</span>
          <input type="date" name="dt_emissao_nf" defaultValue={e.dt_emissao_nf ?? ''} disabled={naoEmite} data-teste="campo-data-nf" />
        </label>
        <label className="campo">
          <span>Arquivo da NF {nf.length ? '(anexar outro não apaga o anterior)' : ''}</span>
          <input type="file" name="arquivo_nf" accept=".pdf,.xml,image/*" disabled={naoEmite} data-teste="campo-arquivo-nf" />
        </label>
        <label className="campo">
          <span>
            Boletos ({boletos.length} de {MAX_BOLETOS})
          </span>
          <input type="file" name="boletos" accept=".pdf,image/*" multiple disabled={boletos.length >= MAX_BOLETOS} />
        </label>
      </div>
      {e.arquivos.length ? (
        <ul className="fluxo-arquivos">
          {e.arquivos.map((a) => (
            <li key={a.id}>
              <button type="button" className="botao-texto" onClick={() => abrirArquivo(a.path, (m) => setLocal({ erro: m }))}>
                {a.tipo === 'boleto' ? 'Boleto' : 'NF'}: {a.nome_arquivo}
              </button>
              {a.enviado_em ? <small>enviado {formatarData(a.enviado_em)}</small> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <label className="caixa">
        <input type="checkbox" name="enviar_cliente" disabled={!temContatoCliente} data-teste="campo-enviar-nf" />
        {e.nota_boleto_enviada ? 'Reenviar NF e boletos ao cliente por e-mail' : 'Enviar NF e boletos ao cliente por e-mail'}
        {!temContatoCliente ? ' (escolha o e-mail do cliente no pedido)' : ''}
      </label>
      <p className="vendas-nota">Pagamento combinado: {prazosTexto || '—'}</p>
      <Mensagem estado={local.erro ? local : acao.estado} teste="saida" />
      <div className="ent-form-botoes">
        <button type="button" className="botao-texto" onClick={fechar}>
          Fechar
        </button>
        {e.saiu_entrega ? (
          <button type="submit" value="voltar" className="botao-secundario" disabled={acao.pendente}>
            Desfazer saída
          </button>
        ) : null}
        <button type="submit" value="manter" className="botao-secundario" disabled={acao.pendente} data-teste="gravar-entrega">
          {acao.rodando === 'Gravando…' ? 'Gravando…' : e.saiu_entrega ? 'Gravar' : 'Só gravar'}
        </button>
        {!e.saiu_entrega ? (
          <button type="submit" value="sair" className="botao-primario" disabled={acao.pendente} aria-busy={acao.rodando === 'Registrando saída…'} data-teste="registrar-saida">
            <Icone icone={Truck} tamanho={18} />
            {acao.rodando === 'Registrando saída…' ? 'Registrando saída…' : 'Registrar saída'}
          </button>
        ) : null}
      </div>
    </form>
  )
}

/** `pop cancelar entrega e pedido`, modo Cancela Entrega (§2.10, WF bTeZz), na linha. */
function PainelCancelar({
  e,
  produto,
  emailCliente,
  emailFornecedor,
  aoOk,
  fechar,
}: {
  e: EntregaFicha
  produto: string
  emailCliente: string | null
  emailFornecedor: string | null
  aoOk: (r: EstadoAcao) => void
  fechar: () => void
}) {
  const acao = useAcao()
  return (
    <form
      className="ent-form ent-form-perigo"
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault()
        acao.executar(cancelarEntrega, new FormData(ev.currentTarget), 'Cancelando…', aoOk)
      }}
      data-teste="painel-cancelar"
    >
      <input type="hidden" name="entrega_id" value={e.id} />
      <p className="vendas-nota">
        Cancelar a entrega de {formatarQuantidade(e.qtd)} de {produto} ({formatarData(e.dt_prev_entrega)}). Ela fica Cancelada, com
        quantidade 0.
      </p>
      <label className="campo">
        <span>Motivo (obrigatório)</span>
        <textarea name="motivo" rows={2} maxLength={1000} required data-teste="campo-motivo" />
      </label>
      <label className="caixa">
        <input type="checkbox" name="avisar_cliente" disabled={!emailCliente} />
        Avisar o cliente por e-mail {emailCliente ? `(${emailCliente})` : '(pedido sem e-mail do cliente)'}
      </label>
      <label className="caixa">
        <input type="checkbox" name="avisar_fornecedor" disabled={!emailFornecedor} />
        Avisar o fornecedor por e-mail {emailFornecedor ? `(${emailFornecedor})` : '(pedido sem e-mail do fornecedor)'}
      </label>
      <Mensagem estado={acao.estado} />
      <div className="ent-form-botoes">
        <button type="button" className="botao-texto" onClick={fechar}>
          Voltar
        </button>
        <button type="submit" className="botao-perigo" disabled={acao.pendente} data-teste="confirmar-cancelamento">
          {acao.pendente ? 'Cancelando…' : 'Cancelar entrega'}
        </button>
      </div>
    </form>
  )
}
