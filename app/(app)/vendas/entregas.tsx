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
 * ENTREGAS de um item do pedido como CAMINHÕES (vendas.md §2.9 `rpg pedido OrçFornecedores` +
 * sub-tabela de entregas; §2.10/vendas-reusables §2.1 pop.AnexaNf; §4.9 cancelamento):
 *   - cada entrega é um caminhão: data e quantidade se editam na própria cabine (grava ao sair
 *     do campo — bUEti, bTbPN), e a barrinha de carga mostra quanto do vendido ele leva;
 *   - o caminhão TRACEJADO é o que falta: um clique programa a carga inteira (bTbOt, que no
 *     Bubble nascia sem qtd) e "Dividir" parte um caminhão em dois;
 *   - "Registrar saída" abre NF/boletos/saída logo abaixo do comboio, sem pop-up;
 *   - o rodapé mostra o que já está nos caminhões e o que falta, em qtd e em R$
 *     (v_pedido_item_saldo, db/029). A tela só formata: a única conta local é de QUANTIDADE.
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
  const carga = larguras(item.qtd, entregas.map((e) => e.qtd))
  const nomeEtapa = (id: number) => etapas.find((e) => e.id === id)?.nome ?? '—'
  const produto = item.orcamento?.produto?.nome ?? '—'
  const aberta = painel ? entregas.find((e) => e.id === painel.id) : undefined

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
            <dt>Qtd vendida</dt>
            <dd>{formatarQuantidade(item.qtd)}</dd>
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
          <div>
            <dt>Comissão</dt>
            <dd>{saldo ? formatarReais(saldo.valor_comissao) : '…'}</dd>
          </div>
        </dl>
      </header>

      {/* O COMBOIO: cada entrega é um caminhão com a sua carga; o que falta é o caminhão tracejado. */}
      <ol className="comboio" aria-label={`Entregas de ${produto}`} data-teste="tabela-entregas">
        {entregas.map((e, k) => (
          <Caminhao
            key={`${e.id}:${e.qtd}:${e.dt_prev_entrega}`}
            e={e}
            numero={k + 1}
            carga={carga.entregas[k] ?? 0}
            ativo={ativo}
            etapa={nomeEtapa(e.status_id)}
            painel={painel}
            setPainel={setPainel}
            aoResultado={aoResultado}
          />
        ))}
        {faltaPositiva ? (
          <li className="caminhao caminhao-vazio" data-teste="caminhao-falta">
            <span className="caminhao-cabine" aria-hidden="true">
              <Icone icone={Truck} tamanho={24} />
            </span>
            <p className="caminhao-falta">
              Falta {entregas.length ? 'programar' : 'carregar'} <b>{formatarQuantidade(falta)}</b>
            </p>
            {ativo ? (
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
                {acao.pendente ? 'Programando…' : entregas.length === 0 ? 'Programar caminhão' : 'Mais um caminhão'}
              </button>
            ) : null}
            {acao.estado.erro ? <Mensagem estado={acao.estado} /> : null}
          </li>
        ) : null}
      </ol>

      {aberta && painel?.tipo === 'saida' ? (
        <PainelSaida e={aberta} temContatoCliente={!!emailCliente} prazosTexto={prazosTexto} aoOk={aoOk} fechar={() => setPainel(null)} />
      ) : null}
      {aberta && painel?.tipo === 'cancelar' ? (
        <PainelCancelar e={aberta} produto={produto} emailCliente={emailCliente} emailFornecedor={emailFornecedor} aoOk={aoOk} fechar={() => setPainel(null)} />
      ) : null}

      {saldo && entregas.length > 0 ? (
        <div className="ent-saldo" data-teste="falta-item" data-zerado={zero(saldo.falta_qtd) || undefined} data-excesso={saldo.falta_qtd.startsWith('-') || undefined}>
          <dl>
            <div>
              <dt>Nos caminhões</dt>
              <dd>
                {formatarQuantidade(saldo.qtd_entregas)} de {formatarQuantidade(item.qtd)}
              </dd>
            </div>
            <div>
              <dt>Falta</dt>
              <dd>{formatarQuantidade(saldo.falta_qtd)}</dd>
            </div>
            <div>
              <dt>Bruto que falta</dt>
              <dd>{formatarReais(saldo.falta_bruto)}</dd>
            </div>
            <div>
              <dt>Líquido que falta</dt>
              <dd>{formatarReais(saldo.falta_liquido)}</dd>
            </div>
            <div>
              <dt>Comissão que falta</dt>
              <dd>{formatarReais(saldo.falta_comissao)}</dd>
            </div>
          </dl>
          <p>
            {zero(saldo.falta_qtd)
              ? 'Os caminhões levam o pedido inteiro.'
              : saldo.falta_qtd.startsWith('-')
                ? 'Os caminhões levam mais do que o pedido.'
                : 'Ainda falta carga para programar.'}
          </p>
        </div>
      ) : null}
    </section>
  )
}

/** Uma entrega = um caminhão: data e quantidade editáveis na própria cabine (bUEti, bTbPN). */
function Caminhao({
  e,
  numero,
  carga,
  ativo,
  etapa,
  painel,
  setPainel,
  aoResultado,
}: {
  e: EntregaFicha
  numero: number
  /** % do vendido que este caminhão leva (só desenho) */
  carga: number
  ativo: boolean
  etapa: string
  painel: Painel
  setPainel: (p: Painel) => void
  aoResultado: (r: EstadoAcao) => void
}) {
  const acao = useAcao()
  const [qtd, setQtd] = useState(formatarQuantidade(e.qtd))
  const [data, setData] = useState(e.dt_prev_entrega ?? '')
  const [apagando, setApagando] = useState(false)
  const editavel = ativo && podeEditarEntrega(e)
  const nf = e.arquivos.find((a) => a.tipo === 'nf_fornecedor')
  const boletos = e.arquivos.filter((a) => a.tipo === 'boleto')
  const aberto = painel?.id === e.id ? painel.tipo : null
  const cancelada = e.status_id === ETAPA.CANCELADO

  function gravar(novaQtd: string, novaData: string) {
    if (novaQtd === formatarQuantidade(e.qtd) && novaData === (e.dt_prev_entrega ?? '')) return
    acao.executar(editarEntrega, { entrega_id: e.id, qtd: novaQtd, dt_prev_entrega: novaData }, 'Gravando…', aoResultado)
  }

  return (
    <li className="caminhao" data-status={e.status_id} data-aberta={aberto || undefined} aria-busy={acao.pendente || undefined} data-teste="linha-entrega">
      <div className="caminhao-topo">
        <span className="caminhao-cabine" aria-hidden="true">
          <Icone icone={Truck} tamanho={24} />
        </span>
        <strong>Caminhão {numero}</strong>
        <span className="selo" data-tom={cancelada ? 'erro' : e.status_id >= ETAPA.EM_ENTREGA ? 'ok' : undefined}>
          {etapa}
        </span>
      </div>
      <span className="caminhao-carga" aria-hidden="true">
        <span style={{ width: `${Math.min(carga, 100)}%` }} />
      </span>

      <div className="caminhao-campos">
        <label>
          <span>Previsão</span>
          {editavel ? (
            <input
              type="date"
              className="ent-campo"
              value={data}
              onChange={(x) => setData(x.target.value)}
              onBlur={() => gravar(qtd, data)}
              data-teste="campo-data-entrega"
            />
          ) : (
            <b>{formatarData(e.dt_prev_entrega)}</b>
          )}
        </label>
        <label>
          <span>Quantidade</span>
          {editavel ? (
            <input
              className="ent-campo ent-qtd"
              inputMode="decimal"
              value={qtd}
              onChange={(x) => setQtd(x.target.value)}
              onBlur={() => gravar(qtd, data)}
              onKeyDown={(x) => x.key === 'Enter' && (x.preventDefault(), gravar(qtd, data))}
              data-teste="campo-qtd-entrega"
            />
          ) : (
            <b>{formatarQuantidade(e.qtd)}</b>
          )}
        </label>
      </div>
      {e.vendedor_substituto_id ? <small className="caminhao-nota">com substituto de férias</small> : null}

      <dl className="caminhao-valores" data-cancelada={cancelada || undefined}>
        <div>
          <dt>Bruto</dt>
          <dd>{formatarReais(e.valor_venda_bruto)}</dd>
        </div>
        <div>
          <dt>Comissão</dt>
          <dd>{formatarReais(e.valor_comissao)}</dd>
        </div>
      </dl>

      <p className="caminhao-nf">
        {nf ? (
          <button type="button" className="botao-texto" onClick={() => abrirArquivo(nf.path, (m) => aoResultado({ erro: m }))}>
            <Icone icone={Paperclip} tamanho={14} />
            NF {e.nf_fornecedor_numero ?? nf.nome_arquivo}
          </button>
        ) : (
          <span>{e.nao_emite_nf ? 'Não emite NF' : e.nf_fornecedor_numero ? `NF ${e.nf_fornecedor_numero}` : 'Sem NF'}</span>
        )}
        <small>
          {boletos.length} {boletos.length === 1 ? 'boleto' : 'boletos'}
        </small>
      </p>
      {e.motivo_cancelamento ? <small className="fluxo-motivo">{e.motivo_cancelamento}</small> : null}

      <div className="caminhao-acoes">
        {ativo && podeGravarSaida(e.status_id) ? (
          <button
            type="button"
            className="botao-secundario caminhao-saida"
            data-destaque={e.saiu_entrega || undefined}
            aria-expanded={aberto === 'saida'}
            onClick={() => setPainel(aberto === 'saida' ? null : { tipo: 'saida', id: e.id })}
            data-teste="abrir-saida"
          >
            <Icone icone={Truck} tamanho={16} />
            {e.saiu_entrega ? 'NF e saída' : 'Registrar saída'}
          </button>
        ) : null}
        {editavel ? (
          <button
            type="button"
            className="ent-icone"
            aria-label="Dividir em dois caminhões"
            title="Dividir em dois caminhões"
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
              <button type="button" className="botao-perigo" onClick={() => acao.executar(apagarEntrega, { entrega_id: e.id }, 'Apagando…', aoResultado)} data-teste="apagar-entrega-sim">
                Apagar
              </button>
              <button type="button" className="botao-secundario" onClick={() => setApagando(false)}>
                Não
              </button>
            </span>
          ) : (
            <button type="button" className="ent-icone" aria-label="Apagar caminhão" title="Apagar caminhão" onClick={() => setApagando(true)} data-teste="apagar-entrega">
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
    </li>
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
