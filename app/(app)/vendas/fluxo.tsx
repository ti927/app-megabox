'use client'

import { Plus, Truck, X } from 'lucide-react'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import { ETAPA, formatarDia, formatarQuantidade } from '@/lib/vendas'
import {
  faltaQuantidade,
  MAX_BOLETOS,
  podeApagarEntrega,
  podeCancelarEntrega,
  podeEditarEntrega,
  podeGravarSaida,
} from '@/lib/vendas-fluxo'

import {
  abrirArquivoEntrega,
  adicionarEntrega,
  apagarEntrega,
  cancelarEntrega,
  criarPedido,
  criarProposta,
  descartarPedido,
  descartarProposta,
  editarEntrega,
  gravarSaidaEntrega,
  reenviarProposta,
  salvarPedido,
  salvarProposta,
} from './acoes-fluxo'
import { DocumentoProposta } from './documento-proposta'
import type { Contato, EntregaFicha, EstadoAcao, Ficha, Opcao, OpcoesFicha, Pedido, Proposta, PropostaItem } from './tipos'

/*
 * Proposta → pedido → entregas, dentro da ficha da cotação (specs/paginas/vendas.md §2.8,
 * §2.9, §2.10; vendas-reusables.md §2.1). Os diálogos são <dialog> nativos abertos por cima
 * da ficha (top layer): foco preso e Esc fecha, como o resto da tela.
 *
 * Nenhum valor é calculado aqui: dinheiro vem do banco como texto e só é formatado. O único
 * número derivado é a QUANTIDADE que falta entregar (lib/vendas-fluxo, em milésimos).
 */

/** Limite de corpo de server action do Next (1 MB padrão, next.config sem bodySizeLimit). */
const LIMITE_ENVIO = 1_000_000

function Mensagem({ estado }: { estado: EstadoAcao }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste="erro-fluxo">
        {estado.erro}
      </p>
    )
  }
  if (estado.ok) {
    return (
      <p className="aviso" data-tom="ok" role="status" data-teste="ok-fluxo">
        {estado.ok}
      </p>
    )
  }
  return null
}

function useModal() {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  return ref
}

/**
 * Como o `enviarCom` de dialogo.tsx (onSubmit, para o React não limpar o formulário no erro),
 * mas levando o botão que submeteu: "Gravar" e "Gravar e Enviar" são o mesmo formulário.
 */
function enviarCom(acao: (f: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submissor = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const form = new FormData(e.currentTarget, submissor)
    startTransition(() => acao(form))
  }
}

/**
 * Fecha o diálogo quando a action deu certo (o servidor já revalidou a ficha) e entrega a
 * mensagem à aba, que a mostra depois de o diálogo sumir ("e-mail na fila para …").
 */
function useFecharNoOk(estado: EstadoAcao, ref: React.RefObject<HTMLDialogElement | null>, aoOk: (e: EstadoAcao) => void) {
  useEffect(() => {
    if (!estado.ok) return
    aoOk(estado)
    ref.current?.close()
    // aoOk muda a cada render do pai; o gatilho é o resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, ref])
}

/** A mensagem da aba: a da action mais recente (inclusive a dos diálogos, via aoOk). */
function useMensagem(estado: EstadoAcao, setMensagem: (e: EstadoAcao) => void) {
  useEffect(() => {
    if (estado.ok || estado.erro) setMensagem(estado)
    // setMensagem é estável (useState); o gatilho é o resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])
}

function nomeItem(i: PropostaItem): string {
  return i.orcamento?.produto?.nome ?? '—'
}

function Cabecalho({ titulo, sub, id, fechar }: { titulo: string; sub?: string; id: string; fechar: () => void }) {
  return (
    <header className="dialogo-cabecalho">
      <div>
        {sub ? <p className="ficha-vendas-tipo">{sub}</p> : null}
        <h2 id={id}>{titulo}</h2>
      </div>
      <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={fechar}>
        <X size={22} aria-hidden="true" />
      </button>
    </header>
  )
}

function OpcoesContato({ contatos, vazio }: { contatos: Contato[]; vazio: string }) {
  return (
    <>
      <option value="">{contatos.length ? 'Escolha…' : vazio}</option>
      {contatos.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nome} — {c.email}
        </option>
      ))}
    </>
  )
}

/** Itens de proposta/pedido: SNAPSHOT (008 D1), só formatado. */
function TabelaItens({ itens }: { itens: PropostaItem[] }) {
  return (
    <div className="orc-rolagem">
      <table className="orc-tabela">
        <thead>
          <tr>
            <th scope="col">Produto</th>
            <th scope="col">Qtd</th>
            <th scope="col">Preço unit.</th>
            <th scope="col">Frete</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((i) => (
            <tr key={i.id}>
              <th scope="row">
                <strong>{nomeItem(i)}</strong>
                <small>{i.orcamento?.fornecedor?.nome ?? '—'}</small>
              </th>
              <td>{formatarQuantidade(i.qtd)}</td>
              <td>{formatarReais(i.valor_venda_unit)}</td>
              <td>{formatarReais(i.valor_frete)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ==================================================================== PROPOSTA

/**
 * `pop add edita propostas`, formulário da direita (§2.8): dados do e-mail e da proposta.
 * Gravar (bTmXN/bTPhF) e Gravar e Enviar (bTPDr0/bTPhL). Sem PDF nem anexos nesta versão.
 */
function DialogoProposta({
  proposta,
  ficha,
  aoFechar,
  aoOk,
}: {
  proposta: Proposta
  ficha: Ficha
  aoFechar: () => void
  aoOk: (e: EstadoAcao) => void
}) {
  const ref = useModal()
  const [estado, salvar, salvando] = useActionState(salvarProposta, {})
  useFecharNoOk(estado, ref, aoOk)
  const c = ficha.cotacao
  const contatos = ficha.contatos.filter((x) => x.grupo_id === c.cliente_id)

  return (
    <dialog ref={ref} className="dialogo fluxo-dialogo" aria-labelledby="proposta-titulo" onClose={aoFechar} data-teste="dialogo-proposta">
      <Cabecalho
        id="proposta-titulo"
        sub={`${c.cliente?.nome ?? '—'} · Cotação núm. ${c.numero}`}
        titulo={`Proposta núm. ${c.numero}/${proposta.numero}`}
        fechar={() => ref.current?.close()}
      />
      <form id="form-proposta" className="dialogo-corpo fluxo-corpo" noValidate onSubmit={enviarCom(salvar)}>
        <p className="aviso" data-tom="alerta">
          Proposta não enviada: ainda permite edição. Depois de enviada, é o documento do cliente e não muda.
        </p>
        <input type="hidden" name="proposta_id" value={proposta.id} />
        <TabelaItens itens={proposta.itens} />

        <fieldset className="fluxo-bloco">
          <legend>Dados do e-mail</legend>
          <div className="vendas-form">
            <label className="campo vendas-largo">
              <span>E-mail do cliente</span>
              <select name="enviar_para_contato_id" defaultValue={proposta.enviar_para_contato_id ?? ''} data-teste="campo-contato">
                <OpcoesContato contatos={contatos} vazio="Cliente sem contato ativo com e-mail" />
              </select>
            </label>
            <label className="campo vendas-largo">
              <span>E-mails cópia (separados por vírgula)</span>
              <input name="emails_copia" defaultValue={proposta.emails_copia ?? ''} autoComplete="off" />
            </label>
            <label className="campo vendas-largo">
              <span>Corpo do e-mail</span>
              <textarea name="corpo_email" rows={4} defaultValue={proposta.corpo_email ?? ''} placeholder="Em branco: texto padrão com os itens da proposta." />
            </label>
          </div>
        </fieldset>

        <fieldset className="fluxo-bloco">
          <legend>Dados da proposta</legend>
          <div className="vendas-form">
            <label className="campo">
              <span>Número</span>
              <input name="numero" inputMode="numeric" defaultValue={proposta.numero} required />
            </label>
            <label className="campo">
              <span>Data prevista de entrega</span>
              <input type="date" name="data_prev_entrega" defaultValue={proposta.data_prev_entrega ?? ''} data-teste="campo-prev-entrega" />
            </label>
            <label className="campo vendas-largo">
              <span>CNPJ do cliente (faturar para)</span>
              <select name="faturar_para_endereco_id" defaultValue={proposta.faturar_para_endereco_id ?? ''}>
                <option value="">—</option>
                {ficha.destinos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome_endereco} — {d.municipio ? `${d.municipio}/` : ''}
                    {d.uf}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo vendas-largo">
              <span>Condição de pagamento</span>
              <input name="condicao_pagamento" defaultValue={proposta.condicao_pagamento ?? ''} maxLength={500} />
            </label>
            <label className="campo vendas-largo">
              <span>Informações adicionais</span>
              <textarea name="info_adicional" rows={2} defaultValue={proposta.info_adicional ?? ''} />
            </label>
          </div>
        </fieldset>
        <Mensagem estado={estado} />
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Cancela
        </button>
        <button type="submit" form="form-proposta" name="acao" value="gravar" className="botao-secundario" disabled={salvando} data-teste="gravar-proposta">
          Gravar
        </button>
        <button
          type="submit"
          form="form-proposta"
          name="acao"
          value="enviar"
          className="botao-primario"
          disabled={salvando || contatos.length === 0}
          aria-busy={salvando}
          title="Grava, marca como enviada e põe o e-mail ao cliente na fila"
          data-teste="enviar-proposta"
        >
          {salvando ? 'Gravando…' : 'Gravar e Enviar'}
        </button>
      </footer>
    </dialog>
  )
}

/** Botão de uma action só com id (descartar, reenviar, virar pedido): um formulário por linha. */
function BotaoAcao({
  acao,
  campo,
  valor,
  rotulo,
  classe = 'botao-texto',
  teste,
  confirmar,
}: {
  acao: (f: FormData) => void
  campo: string
  valor: string
  rotulo: string
  classe?: string
  teste?: string
  confirmar?: string
}) {
  const [pedindo, setPedindo] = useState(false)
  if (confirmar && pedindo) {
    return (
      <span className="fluxo-confirma">
        <span>{confirmar}</span>
        <form onSubmit={enviarCom(acao)}>
          <input type="hidden" name={campo} value={valor} />
          <button type="submit" className="botao-perigo" data-teste={teste ? `${teste}-sim` : undefined}>
            Sim
          </button>
        </form>
        <button type="button" className="botao-secundario" onClick={() => setPedindo(false)}>
          Não
        </button>
      </span>
    )
  }
  if (confirmar) {
    return (
      <button type="button" className={classe} onClick={() => setPedindo(true)} data-teste={teste}>
        {rotulo}
      </button>
    )
  }
  return (
    <form onSubmit={enviarCom(acao)}>
      <input type="hidden" name={campo} value={valor} />
      <button type="submit" className={classe} data-teste={teste}>
        {rotulo}
      </button>
    </form>
  )
}

/**
 * Aba Propostas (`gp historico propostas`, §2.8): "+ Proposta", a tabela (mais nova primeiro)
 * e as ações por linha — lápis só se não enviada, reenviar se enviada, carrinho "transformar em
 * pedido" só se enviada.
 */
export function AbaPropostas({ ficha, editavel, irParaPedidos }: { ficha: Ficha; editavel: boolean; irParaPedidos: () => void }) {
  const [aberta, setAberta] = useState<string | null>(null)
  const [estadoNova, criar, criando] = useActionState(criarProposta, {})
  const [estadoDesc, descartar] = useActionState(descartarProposta, {})
  const [estadoReenvio, reenviar] = useActionState(reenviarProposta, {})
  const [estadoPedido, virarPedido] = useActionState(criarPedido, {})
  const c = ficha.cotacao
  const temVencedor = ficha.orcamentos.some((o) => o.vencedor)
  const podePropor = editavel && c.etapa_id === ETAPA.COTACAO && temVencedor
  const comPedido = new Set(ficha.pedidos.filter((p) => p.etapa_id !== ETAPA.CANCELADO).map((p) => p.proposta_id))
  const propostaAberta = ficha.propostas.find((p) => p.id === aberta && !p.enviada)
  // Rádio da tabela (bTagt/bTahD): qual proposta o documento à esquerda mostra. Sem escolha,
  // a mais nova (a lista vem da mais nova para a mais antiga).
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const exibida = ficha.propostas.find((p) => p.id === selecionada) ?? ficha.propostas[0] ?? null

  useEffect(() => {
    if (estadoNova.alvo) {
      setAberta(estadoNova.alvo)
      setSelecionada(estadoNova.alvo)
    }
  }, [estadoNova])
  useEffect(() => {
    if (estadoPedido.ok) irParaPedidos()
    // irParaPedidos muda a cada render do pai; o gatilho é o resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoPedido])

  const [ultimo, setUltimo] = useState<EstadoAcao>({})
  useMensagem(estadoNova, setUltimo)
  useMensagem(estadoDesc, setUltimo)
  useMensagem(estadoReenvio, setUltimo)
  useMensagem(estadoPedido, setUltimo)

  return (
    <div className="fluxo-aba prop-layout">
      <div className="prop-documento">
        {exibida ? (
          <>
            {/* Alerta sobre a proposta exibida (bTahj). */}
            <p className="aviso" data-tom={exibida.enviada ? undefined : 'alerta'}>
              {exibida.enviada
                ? 'A proposta selecionada já foi enviada e não permite edição. Caso precise alterar valores, edite a cotação e crie uma nova proposta.'
                : 'A proposta selecionada NÃO foi enviada e ainda permite edição de informações. Caso precise alterar valores, edite a cotação antes de enviar.'}
            </p>
            <DocumentoProposta key={exibida.id} ficha={ficha} proposta={exibida} />
          </>
        ) : (
          <div className="prop-documento-vazio">
            <p>O documento da proposta aparece aqui.</p>
            <p className="vendas-nota">
              {podePropor ? 'Crie a primeira com “Proposta”.' : 'Marque os vencedores na aba Cotação para poder propor.'}
            </p>
          </div>
        )}
      </div>

      <div className="prop-lista">
      <div className="itens-topo">
        <h3>Propostas ({ficha.propostas.length})</h3>
        {podePropor ? (
          <form onSubmit={enviarCom(criar)}>
            <input type="hidden" name="cotacao_id" value={c.id} />
            <button type="submit" className="botao-primario" disabled={criando} aria-busy={criando} data-teste="nova-proposta">
              {criando ? (
                'Criando…'
              ) : (
                <>
                  <Icone icone={Plus} tamanho={18} />
                  Proposta
                </>
              )}
            </button>
          </form>
        ) : null}
      </div>
      {!temVencedor && c.etapa_id === ETAPA.COTACAO ? (
        <p className="vendas-nota">Para propor, marque o vencedor (troféu) dos produtos na aba Cotação.</p>
      ) : null}
      <Mensagem estado={ultimo} />

      {ficha.propostas.length === 0 ? (
        <p className="vendas-vazio">Nenhuma proposta nesta cotação.</p>
      ) : (
        <div className="orc-rolagem">
          <table className="orc-tabela vendas-propostas" data-teste="lista-propostas">
            <thead>
              <tr>
                <th scope="col">
                  <span className="so-leitor">Exibir</span>
                </th>
                <th scope="col">Núm</th>
                <th scope="col">Situação</th>
                <th scope="col">Produtos</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ficha.propostas.map((p) => (
                <tr key={p.id} data-teste="linha-proposta" data-exibida={p.id === exibida?.id || undefined}>
                  <td>
                    <input
                      type="radio"
                      name="proposta-exibida"
                      className="prop-radio"
                      checked={p.id === exibida?.id}
                      onChange={() => setSelecionada(p.id)}
                      aria-label={`Exibir a proposta ${c.numero}/${p.numero}`}
                    />
                  </td>
                  <th scope="row">
                    {c.numero}/{p.numero}
                    <small>{formatarData(p.criado_em)}</small>
                  </th>
                  <td>
                    <span className="selo" data-tom={p.enviada ? 'ok' : undefined}>
                      {p.enviada ? 'Enviada' : 'Não enviada'}
                    </span>
                    {p.enviada && p.enviada_em ? <small>{formatarData(p.enviada_em)}</small> : null}
                  </td>
                  <td>
                    {p.itens.map((i) => (
                      <span key={i.id} className="fluxo-produto">
                        {formatarQuantidade(i.qtd)} × {nomeItem(i)} · {formatarReais(i.valor_venda_unit)}
                      </span>
                    ))}
                  </td>
                  <td>
                    <div className="fluxo-acoes">
                      {!p.enviada && editavel ? (
                        <>
                          <button type="button" className="botao-texto" onClick={() => setAberta(p.id)} data-teste="editar-proposta">
                            Editar
                          </button>
                          <BotaoAcao acao={descartar} campo="proposta_id" valor={p.id} rotulo="Descartar" confirmar="Descartar?" />
                        </>
                      ) : null}
                      {p.enviada ? (
                        <BotaoAcao acao={reenviar} campo="proposta_id" valor={p.id} rotulo="Reenviar" teste="reenviar-proposta" />
                      ) : null}
                      {p.enviada && !comPedido.has(p.id) && !c.arquivado ? (
                        <BotaoAcao
                          acao={virarPedido}
                          campo="proposta_id"
                          valor={p.id}
                          rotulo="Transformar em pedido"
                          classe="botao-primario"
                          teste="virar-pedido"
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
      {propostaAberta ? <DialogoProposta key={propostaAberta.id} proposta={propostaAberta} ficha={ficha} aoFechar={() => setAberta(null)} aoOk={setUltimo} /> : null}
    </div>
  )
}

// ====================================================================== PEDIDO

function itensDoPedido(ficha: Ficha, p: Pedido): PropostaItem[] {
  return ficha.propostas.find((x) => x.id === p.proposta_id)?.itens ?? []
}

/**
 * `pop add edita pedido` (§2.9), o formulário: e-mails do cliente e do fornecedor, OC,
 * informações, condições de pagamento (prazos + forma) e "Formalizar pedido por e-mail".
 */
function DialogoPedido({
  pedido,
  ficha,
  opcoesFicha,
  aoFechar,
  aoOk,
}: {
  pedido: Pedido
  ficha: Ficha
  opcoesFicha: OpcoesFicha
  aoFechar: () => void
  aoOk: (e: EstadoAcao) => void
}) {
  const ref = useModal()
  const [estado, salvar, salvando] = useActionState(salvarPedido, {})
  useFecharNoOk(estado, ref, aoOk)
  const c = ficha.cotacao
  const itens = itensDoPedido(ficha, pedido)
  const fornecedores = new Set(itens.map((i) => i.orcamento?.fornecedor_id))
  const contatosCli = ficha.contatos.filter((x) => x.grupo_id === c.cliente_id)
  const contatosFor = ficha.contatos.filter((x) => fornecedores.has(x.grupo_id))
  const prazos = new Set(pedido.prazos.map((x) => x.prazo_id))
  const semData = ficha.entregas.some((e) => e.pedido_id === pedido.id && e.status_id !== ETAPA.CANCELADO && !e.dt_prev_entrega)
  const num = pedido.proposta ? `${pedido.numero}/${pedido.proposta.numero}` : pedido.numero

  return (
    <dialog ref={ref} className="dialogo fluxo-dialogo" aria-labelledby="pedido-titulo" onClose={aoFechar} data-teste="dialogo-pedido">
      <Cabecalho
        id="pedido-titulo"
        sub={pedido.formalizado ? 'Edita Pedido' : 'Novo Pedido'}
        titulo={`Pedido núm. ${num} — ${c.cliente?.nome ?? '—'}`}
        fechar={() => ref.current?.close()}
      />
      <form id="form-pedido" className="dialogo-corpo fluxo-corpo" noValidate onSubmit={enviarCom(salvar)}>
        <input type="hidden" name="pedido_id" value={pedido.id} />
        <TabelaItens itens={itens} />
        <div className="fluxo-colunas">
          <fieldset className="fluxo-bloco">
            <legend>E-mails</legend>
            <div className="vendas-form">
              <label className="campo vendas-largo">
                <span>E-mail do cliente (obrigatório para formalizar)</span>
                <select name="contato_cliente_id" defaultValue={pedido.contato_cliente_id ?? ''} data-teste="campo-contato-cliente">
                  <OpcoesContato contatos={contatosCli} vazio="Cliente sem contato ativo com e-mail" />
                </select>
              </label>
              <label className="campo vendas-largo">
                <span>CC do cliente</span>
                <input name="emails_copia_cliente" defaultValue={pedido.emails_copia_cliente ?? ''} autoComplete="off" />
              </label>
              <label className="campo vendas-largo">
                <span>Corpo para o cliente</span>
                <textarea name="corpo_email_cliente" rows={3} defaultValue={pedido.corpo_email_cliente ?? ''} placeholder="Em branco: texto padrão com itens e entregas." />
              </label>
              <label className="campo vendas-largo">
                <span>E-mail do fornecedor</span>
                <select name="contato_fornecedor_id" defaultValue={pedido.contato_fornecedor_id ?? ''} data-teste="campo-contato-fornecedor">
                  <OpcoesContato contatos={contatosFor} vazio="Fornecedor sem contato ativo com e-mail" />
                </select>
              </label>
              <label className="campo vendas-largo">
                <span>CC do fornecedor</span>
                <input name="emails_copia_fornecedor" defaultValue={pedido.emails_copia_fornecedor ?? ''} autoComplete="off" />
              </label>
              <label className="campo vendas-largo">
                <span>Corpo para o fornecedor</span>
                <textarea name="corpo_email_fornecedor" rows={3} defaultValue={pedido.corpo_email_fornecedor ?? ''} placeholder="Em branco: texto padrão com comissão unitária e entregas." />
              </label>
            </div>
          </fieldset>
          <fieldset className="fluxo-bloco">
            <legend>Pedido</legend>
            <div className="vendas-form">
              <label className="campo vendas-largo">
                <span>Nº da OC do cliente</span>
                <input name="ordem_compra_numero" defaultValue={pedido.ordem_compra_numero ?? ''} maxLength={60} />
              </label>
              <label className="campo vendas-largo">
                <span>Informações adicionais</span>
                <textarea name="info_adicional" rows={2} defaultValue={pedido.info_adicional ?? ''} />
              </label>
              <label className="campo vendas-largo">
                <span>Forma de pagamento</span>
                <select name="forma_pagamento_id" defaultValue={pedido.forma_pagamento_id ?? ''} data-teste="campo-forma">
                  <option value="">Escolha…</option>
                  {opcoesFicha.formas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="vendas-largo fluxo-prazos">
                <legend>Condições de pagamento (prazos)</legend>
                {opcoesFicha.prazos.map((pz) => (
                  <label key={pz.id} className="caixa">
                    <input type="checkbox" name="prazos" value={pz.id} defaultChecked={prazos.has(pz.id)} />
                    {pz.nome}
                  </label>
                ))}
              </fieldset>
            </div>
          </fieldset>
        </div>
        {semData ? (
          <p className="aviso" data-tom="alerta">
            Existem entregas sem data prevista.
          </p>
        ) : null}
        <label className="caixa fluxo-formalizar">
          <input type="checkbox" name="formalizar" disabled={semData} data-teste="campo-formalizar" />
          {pedido.formalizado ? 'Reenviar pedido por e-mail (cliente e fornecedor)' : 'Formalizar pedido por e-mail (cliente e fornecedor)'}
        </label>
        <Mensagem estado={estado} />
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Cancela
        </button>
        <button type="submit" form="form-pedido" className="botao-primario" disabled={salvando} aria-busy={salvando} data-teste="gravar-pedido">
          {salvando ? 'Gravando…' : pedido.formalizado ? 'Salvar' : 'Gravar'}
        </button>
      </footer>
    </dialog>
  )
}

// ==================================================================== ENTREGAS

async function abrirArquivo(path: string, aoErro: (m: string) => void) {
  // A aba abre no clique (bloqueador de pop-up) e recebe a URL assinada depois.
  // Sem 'noopener' aqui: com ele o window.open devolve null. O opener é cortado à mão.
  const aba = window.open('', '_blank')
  if (aba) aba.opener = null
  const r = await abrirArquivoEntrega(path)
  if ('url' in r) {
    if (aba) aba.location.href = r.url
    else window.open(r.url, '_blank', 'noopener')
  } else {
    aba?.close()
    aoErro(r.erro)
  }
}

/**
 * pop.AnexaNf (vendas-reusables §2.1) fora do Financeiro: NF do fornecedor, boletos, envio ao
 * cliente e "Saiu para entrega".
 */
function DialogoEntrega({
  entrega,
  produto,
  prazos,
  temContatoCliente,
  aoFechar,
  aoOk,
}: {
  entrega: EntregaFicha
  produto: string
  prazos: string
  temContatoCliente: boolean
  aoFechar: () => void
  aoOk: (e: EstadoAcao) => void
}) {
  const ref = useModal()
  const [estado, gravar, gravando] = useActionState(gravarSaidaEntrega, {})
  const [local, setLocal] = useState<EstadoAcao>({})
  const [naoEmite, setNaoEmite] = useState(entrega.nao_emite_nf)
  useFecharNoOk(estado, ref, aoOk)
  const nf = entrega.arquivos.filter((a) => a.tipo === 'nf_fornecedor')
  const boletos = entrega.arquivos.filter((a) => a.tipo === 'boleto')

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const total = [...form.values()].reduce((s, v) => s + (v instanceof File ? v.size : 0), 0)
    if (total > LIMITE_ENVIO) {
      setLocal({ erro: 'Os arquivos passam de 1 MB juntos. Envie um de cada vez.' })
      return
    }
    setLocal({})
    startTransition(() => gravar(form))
  }

  return (
    <dialog ref={ref} className="dialogo fluxo-dialogo-estreito" aria-labelledby="entrega-titulo" onClose={aoFechar} data-teste="dialogo-entrega">
      <Cabecalho id="entrega-titulo" sub={produto} titulo="Informações de entrega" fechar={() => ref.current?.close()} />
      <form id="form-entrega" className="dialogo-corpo fluxo-corpo" noValidate onSubmit={enviar} encType="multipart/form-data">
        <input type="hidden" name="entrega_id" value={entrega.id} />
        <label className="caixa">
          <input type="checkbox" name="nao_emite_nf" checked={naoEmite} onChange={(e) => setNaoEmite(e.target.checked)} />
          Fornecedor não emite nota fiscal
        </label>
        <div className="vendas-form">
          <label className="campo">
            <span>Número NF</span>
            <input name="nf_fornecedor_numero" defaultValue={entrega.nf_fornecedor_numero ?? ''} disabled={naoEmite} maxLength={30} data-teste="campo-nf" />
          </label>
          <label className="campo">
            <span>Data NF</span>
            <input type="date" name="dt_emissao_nf" defaultValue={entrega.dt_emissao_nf ?? ''} disabled={naoEmite} data-teste="campo-data-nf" />
          </label>
          <label className="campo vendas-largo">
            <span>Arquivo NF {nf.length ? '(substituir não apaga o anterior)' : ''}</span>
            <input type="file" name="arquivo_nf" accept=".pdf,.xml,image/*" disabled={naoEmite} data-teste="campo-arquivo-nf" />
          </label>
          <label className="campo vendas-largo">
            <span>
              Boletos ({boletos.length} de {MAX_BOLETOS})
            </span>
            <input type="file" name="boletos" accept=".pdf,image/*" multiple disabled={boletos.length >= MAX_BOLETOS} />
          </label>
        </div>
        {entrega.arquivos.length ? (
          <ul className="fluxo-arquivos">
            {entrega.arquivos.map((a) => (
              <li key={a.id}>
                <button type="button" className="botao-texto" onClick={() => abrirArquivo(a.path, (m) => setLocal({ erro: m }))}>
                  {a.tipo === 'boleto' ? 'Boleto' : 'NF'}: {a.nome_arquivo}
                </button>
                {a.enviado_em ? <small>enviado {formatarData(a.enviado_em)}</small> : null}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="vendas-nota">Forma de pgto combinada: {prazos || '—'}</p>
        <label className="caixa">
          <input type="checkbox" name="enviar_cliente" disabled={!temContatoCliente} data-teste="campo-enviar-nf" />
          {entrega.nota_boleto_enviada ? 'Re-envia nota fiscal e/ou boleto para o cliente' : 'Envia nota fiscal e/ou boleto para o cliente'}
          {!temContatoCliente ? ' (grave o e-mail do cliente no pedido)' : ''}
        </label>
        <label className="caixa fluxo-saiu">
          <input type="checkbox" name="saiu" defaultChecked={entrega.saiu_entrega} data-teste="campo-saiu" />
          Saiu para entrega
        </label>
        <Mensagem estado={local.erro ? local : estado} />
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Cancela
        </button>
        <button type="submit" form="form-entrega" className="botao-primario" disabled={gravando} aria-busy={gravando} data-teste="gravar-entrega">
          {gravando ? 'Gravando…' : 'Gravar'}
        </button>
      </footer>
    </dialog>
  )
}

/** `pop cancelar entrega e pedido`, modo Cancela Entrega (§2.10, WF bTeZz). */
function DialogoCancelarEntrega({
  entrega,
  produto,
  emailCliente,
  emailFornecedor,
  aoFechar,
  aoOk,
}: {
  entrega: EntregaFicha
  produto: string
  emailCliente: string | null
  emailFornecedor: string | null
  aoFechar: () => void
  aoOk: (e: EstadoAcao) => void
}) {
  const ref = useModal()
  const [estado, cancelar, cancelando] = useActionState(cancelarEntrega, {})
  useFecharNoOk(estado, ref, aoOk)
  return (
    <dialog ref={ref} className="dialogo fluxo-dialogo-estreito" aria-labelledby="cancela-titulo" onClose={aoFechar} data-teste="dialogo-cancelar-entrega">
      <Cabecalho id="cancela-titulo" sub={produto} titulo="ATENÇÃO! Cancelar entrega" fechar={() => ref.current?.close()} />
      <form id="form-cancela" className="dialogo-corpo fluxo-corpo" noValidate onSubmit={enviarCom(cancelar)}>
        <input type="hidden" name="entrega_id" value={entrega.id} />
        <p className="vendas-nota">
          Qtd {formatarQuantidade(entrega.qtd)} · prevista {formatarDia(entrega.dt_prev_entrega)}. A entrega fica Cancelada, com quantidade 0.
        </p>
        <label className="campo">
          <span>Motivo (obrigatório)</span>
          <textarea name="motivo" rows={3} maxLength={1000} required data-teste="campo-motivo" />
        </label>
        <label className="caixa">
          <input type="checkbox" name="avisar_cliente" disabled={!emailCliente} />
          Envia e-mail informando o cliente {emailCliente ? `(${emailCliente})` : '(pedido sem e-mail do cliente)'}
        </label>
        <label className="caixa">
          <input type="checkbox" name="avisar_fornecedor" disabled={!emailFornecedor} />
          Envia e-mail informando o fornecedor {emailFornecedor ? `(${emailFornecedor})` : '(pedido sem e-mail do fornecedor)'}
        </label>
        <Mensagem estado={estado} />
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Fechar
        </button>
        <button type="submit" form="form-cancela" className="botao-perigo" disabled={cancelando} aria-busy={cancelando} data-teste="confirmar-cancelamento">
          {cancelando ? 'Cancelando…' : 'Cancela Entrega'}
        </button>
      </footer>
    </dialog>
  )
}

/** "+ entrega" no item (bTbOt) e edição de data/qtd (bUEti, bTbPN): subformulário na linha. */
function FormEntrega({
  pedidoId,
  orcamentoId,
  entrega,
  aoTerminar,
}: {
  pedidoId: string
  orcamentoId: string
  entrega?: EntregaFicha
  aoTerminar: () => void
}) {
  const [estado, enviar, enviando] = useActionState(entrega ? editarEntrega : adicionarEntrega, {})
  useEffect(() => {
    if (estado.ok) aoTerminar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])
  return (
    <form className="vendas-subform" noValidate onSubmit={enviarCom(enviar)} data-teste="form-entrega">
      <h4>{entrega ? 'Editar entrega' : 'Nova entrega'}</h4>
      <input type="hidden" name="pedido_id" value={pedidoId} />
      <input type="hidden" name="orcamento_fornecedor_id" value={orcamentoId} />
      {entrega ? <input type="hidden" name="entrega_id" value={entrega.id} /> : null}
      <div className="vendas-subform-campos">
        <label className="campo">
          <span>Qtd entrega</span>
          <input name="qtd" inputMode="decimal" defaultValue={entrega ? formatarQuantidade(entrega.qtd) : ''} required data-teste="campo-qtd-entrega" />
        </label>
        <label className="campo">
          <span>Data prevista</span>
          <input type="date" name="dt_prev_entrega" defaultValue={entrega?.dt_prev_entrega ?? ''} data-teste="campo-data-entrega" />
        </label>
      </div>
      <p className="vendas-nota">
        {entrega ? 'Os valores da entrega são recalculados pelo sistema a partir do orçamento.' : 'Data em branco: a data prevista da proposta.'}
      </p>
      <Mensagem estado={estado} />
      <div className="vendas-subform-acoes">
        <button type="button" className="botao-secundario" onClick={aoTerminar}>
          Cancela
        </button>
        <button type="submit" className="botao-primario" disabled={enviando} aria-busy={enviando} data-teste="gravar-form-entrega">
          {enviando ? 'Gravando…' : entrega ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}

type Aberto =
  | { tipo: 'pedido'; id: string }
  | { tipo: 'saida'; id: string }
  | { tipo: 'cancelar'; id: string }
  | null

/**
 * Aba Pedidos: por pedido, os dados, os itens (da proposta) com "Falta qtd" e "+ entrega", e
 * as entregas com as ações do §2.9 (editar, NF/saída, cancelar, apagar). A confirmação da
 * entrega (vai para Financeiro, bTcXd) é da tela Financeiro — ver a nota na tela.
 */
export function AbaPedidos({ ficha, etapas, opcoesFicha }: { ficha: Ficha; etapas: Opcao[]; opcoesFicha: OpcoesFicha }) {
  const [aberto, setAberto] = useState<Aberto>(null)
  const [nova, setNova] = useState<string | null>(null) // `${pedido}:${orcamento}`
  const [editando, setEditando] = useState<string | null>(null)
  const [erroArquivo, setErroArquivo] = useState<EstadoAcao>({})
  const [estadoDesc, descartar] = useActionState(descartarPedido, {})
  const [estadoApagar, apagar] = useActionState(apagarEntrega, {})
  const [ultimo, setUltimo] = useState<EstadoAcao>({})
  useMensagem(estadoDesc, setUltimo)
  useMensagem(estadoApagar, setUltimo)
  useMensagem(erroArquivo, setUltimo)
  const nomeEtapa = (id: number) => etapas.find((e) => e.id === id)?.nome ?? '—'
  const nomePrazos = (p: Pedido) =>
    p.prazos
      .map((x) => opcoesFicha.prazos.find((o) => o.id === x.prazo_id)?.nome)
      .filter(Boolean)
      .join(', ')
  const contato = (id: string | null) => ficha.contatos.find((c) => c.id === id) ?? null

  if (ficha.pedidos.length === 0) {
    return <p className="vendas-vazio">Esta cotação ainda não virou pedido. Envie uma proposta e use &quot;Transformar em pedido&quot;.</p>
  }

  const pedidoAberto = aberto?.tipo === 'pedido' ? ficha.pedidos.find((p) => p.id === aberto.id) : undefined
  const entregaAberta = aberto && aberto.tipo !== 'pedido' ? ficha.entregas.find((e) => e.id === aberto.id) : undefined
  const pedidoDaEntrega = entregaAberta ? ficha.pedidos.find((p) => p.id === entregaAberta.pedido_id) : undefined
  const produtoDe = (e: EntregaFicha) => {
    const p = ficha.pedidos.find((x) => x.id === e.pedido_id)
    const i = p ? itensDoPedido(ficha, p).find((x) => x.orcamento?.id === e.orcamento_fornecedor_id) : undefined
    return i ? nomeItem(i) : '—'
  }

  return (
    <div className="fluxo-aba">
      <Mensagem estado={ultimo} />
      <ul className="itens" data-teste="lista-pedidos">
        {ficha.pedidos.map((p) => {
          const entregas = ficha.entregas.filter((e) => e.pedido_id === p.id)
          const itens = itensDoPedido(ficha, p)
          const ativo = p.etapa_id !== ETAPA.CANCELADO && !p.finalizado
          const cli = contato(p.contato_cliente_id)
          return (
            <li key={p.id} className="item" data-teste="pedido">
              <div className="item-topo">
                <div className="item-nome">
                  <strong>
                    Pedido nº {p.numero}
                    {p.proposta ? ` (proposta ${ficha.cotacao.numero}/${p.proposta.numero})` : ''}
                  </strong>
                  <small>Criado em {formatarData(p.criado_em)}</small>
                </div>
                <span className="selo" data-tom={p.etapa_id === ETAPA.CANCELADO ? 'erro' : undefined}>
                  {p.etapa?.nome ?? nomeEtapa(p.etapa_id)}
                </span>
                <span className="selo" data-tom={p.formalizado ? 'ok' : 'alerta'} data-teste="selo-formalizado">
                  {p.formalizado ? `Formalizado ${formatarData(p.formalizado_em)}` : 'Não formalizado'}
                </span>
                {p.finalizado ? <span className="selo">Finalizado</span> : null}
                {ativo ? (
                  <div className="fluxo-acoes">
                    <button type="button" className="botao-secundario" onClick={() => setAberto({ tipo: 'pedido', id: p.id })} data-teste="editar-pedido">
                      {p.formalizado ? 'Editar pedido' : 'Dados e formalização'}
                    </button>
                    {!p.formalizado && entregas.length === 0 ? (
                      <BotaoAcao acao={descartar} campo="pedido_id" valor={p.id} rotulo="Descartar" confirmar="Descartar o pedido?" />
                    ) : null}
                  </div>
                ) : null}
              </div>
              <dl className="vendas-dados">
                <div>
                  <dt>E-mail do cliente</dt>
                  <dd>{cli ? cli.email : '—'}</dd>
                </div>
                <div>
                  <dt>Forma de pagamento</dt>
                  <dd>{p.forma?.nome ?? '—'}</dd>
                </div>
                <div>
                  <dt>Prazos</dt>
                  <dd>{nomePrazos(p) || '—'}</dd>
                </div>
                <div>
                  <dt>Ordem de compra</dt>
                  <dd>{p.ordem_compra_numero || '—'}</dd>
                </div>
                {p.motivo_cancelamento ? (
                  <div>
                    <dt>Cancelado</dt>
                    <dd>{p.motivo_cancelamento}</dd>
                  </div>
                ) : null}
              </dl>

              {itens.map((i) => {
                const orc = i.orcamento?.id ?? ''
                const doItem = entregas.filter((e) => e.orcamento_fornecedor_id === orc)
                const falta = faltaQuantidade(i.qtd, doItem.map((e) => e.qtd))
                const chave = `${p.id}:${orc}`
                return (
                  <div key={i.id} className="fluxo-item" data-teste="item-pedido">
                    <div className="item-topo">
                      <span className="item-qtd" title="Quantidade vendida">
                        {formatarQuantidade(i.qtd)}
                      </span>
                      <div className="item-nome">
                        <strong>{nomeItem(i)}</strong>
                        <small>{i.orcamento?.fornecedor?.nome ?? '—'}</small>
                      </div>
                      <span className="selo" data-tom={falta === '0' ? 'ok' : falta.startsWith('-') ? 'erro' : 'alerta'} title="Falta entregar (quantidade)">
                        Falta {formatarQuantidade(falta.replace('-', ''))}
                        {falta.startsWith('-') ? ' a mais' : ''}
                      </span>
                      {ativo && nova !== chave ? (
                        <button type="button" className="botao-texto" onClick={() => setNova(chave)} data-teste="nova-entrega">
                          <Icone icone={Plus} tamanho={16} />
                          entrega
                        </button>
                      ) : null}
                    </div>
                    {nova === chave ? <FormEntrega pedidoId={p.id} orcamentoId={orc} aoTerminar={() => setNova(null)} /> : null}
                    {doItem.length === 0 ? (
                      <p className="vendas-vazio">Nenhuma entrega lançada.</p>
                    ) : (
                      <div className="orc-rolagem">
                        <table className="orc-tabela" data-teste="tabela-entregas">
                          <thead>
                            <tr>
                              <th scope="col">Dt prev. entrega</th>
                              <th scope="col">Qtd</th>
                              <th scope="col">Comissão</th>
                              <th scope="col">Bruto</th>
                              <th scope="col">Líquido</th>
                              <th scope="col">Etapa</th>
                              <th scope="col">NF / boletos</th>
                              <th scope="col">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {doItem.map((e) => {
                              const bol = e.arquivos.filter((a) => a.tipo === 'boleto').length
                              const nf = e.arquivos.find((a) => a.tipo === 'nf_fornecedor')
                              return (
                                <tr key={e.id} data-status={e.status_id} data-teste="linha-entrega">
                                  <th scope="row">
                                    {formatarDia(e.dt_prev_entrega)}
                                    {e.vendedor_substituto_id ? <small>com substituto de férias</small> : null}
                                  </th>
                                  <td>{formatarQuantidade(e.qtd)}</td>
                                  <td className="fluxo-valor">{formatarReais(e.valor_comissao)}</td>
                                  <td className="fluxo-valor">{formatarReais(e.valor_venda_bruto)}</td>
                                  <td className="fluxo-valor">{formatarReais(e.valor_venda_liquido)}</td>
                                  <td>
                                    <span className="selo" data-tom={e.status_id === ETAPA.CANCELADO ? 'erro' : e.status_id >= ETAPA.FINANCEIRO ? 'ok' : undefined}>
                                      {nomeEtapa(e.status_id)}
                                    </span>
                                    {e.motivo_cancelamento ? <small className="fluxo-motivo">{e.motivo_cancelamento}</small> : null}
                                  </td>
                                  <td>
                                    {nf ? (
                                      <button type="button" className="botao-texto" onClick={() => abrirArquivo(nf.path, (m) => setErroArquivo({ erro: m }))}>
                                        Nf: {e.nf_fornecedor_numero ?? nf.nome_arquivo}
                                      </button>
                                    ) : (
                                      <span>{e.nao_emite_nf ? 'Não emite NF' : e.nf_fornecedor_numero ? `Nf: ${e.nf_fornecedor_numero}` : '—'}</span>
                                    )}
                                    <small>Boletos ({bol})</small>
                                  </td>
                                  <td>
                                    <div className="fluxo-acoes">
                                      {podeEditarEntrega(e) && ativo ? (
                                        <button type="button" className="botao-texto" onClick={() => setEditando(e.id)} data-teste="editar-entrega">
                                          Editar
                                        </button>
                                      ) : null}
                                      {podeGravarSaida(e.status_id) && ativo ? (
                                        <button type="button" className="botao-texto" onClick={() => setAberto({ tipo: 'saida', id: e.id })} data-teste="abrir-saida">
                                          <Icone icone={Truck} tamanho={16} />
                                          NF / saída
                                        </button>
                                      ) : null}
                                      {podeCancelarEntrega(e.status_id) && ativo ? (
                                        <button type="button" className="botao-texto" onClick={() => setAberto({ tipo: 'cancelar', id: e.id })} data-teste="cancelar-entrega">
                                          Cancelar
                                        </button>
                                      ) : null}
                                      {podeApagarEntrega(e) && ativo && e.arquivos.length === 0 ? (
                                        <BotaoAcao acao={apagar} campo="entrega_id" valor={e.id} rotulo="Apagar" confirmar="Apagar?" teste="apagar-entrega" />
                                      ) : null}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {editando && doItem.some((e) => e.id === editando) ? (
                      <FormEntrega
                        key={editando}
                        pedidoId={p.id}
                        orcamentoId={orc}
                        entrega={doItem.find((e) => e.id === editando)}
                        aoTerminar={() => setEditando(null)}
                      />
                    ) : null}
                  </div>
                )
              })}
              {entregas.some((e) => e.status_id === ETAPA.EM_ENTREGA) ? (
                <p className="vendas-nota" data-teste="nota-financeiro">
                  Entregue ao cliente? A confirmação (data real, parcelas a receber e comissão) é feita na tela Financeiro, e
                  a entrega passa para a etapa Financeiro.
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>

      {pedidoAberto ? (
        <DialogoPedido
          key={pedidoAberto.id}
          pedido={pedidoAberto}
          ficha={ficha}
          opcoesFicha={opcoesFicha}
          aoFechar={() => setAberto(null)}
          aoOk={setUltimo}
        />
      ) : null}
      {entregaAberta && pedidoDaEntrega && aberto?.tipo === 'saida' ? (
        <DialogoEntrega
          key={entregaAberta.id}
          entrega={entregaAberta}
          produto={produtoDe(entregaAberta)}
          prazos={nomePrazos(pedidoDaEntrega)}
          temContatoCliente={!!contato(pedidoDaEntrega.contato_cliente_id)}
          aoFechar={() => setAberto(null)}
          aoOk={setUltimo}
        />
      ) : null}
      {entregaAberta && pedidoDaEntrega && aberto?.tipo === 'cancelar' ? (
        <DialogoCancelarEntrega
          key={entregaAberta.id}
          entrega={entregaAberta}
          produto={produtoDe(entregaAberta)}
          emailCliente={contato(pedidoDaEntrega.contato_cliente_id)?.email ?? null}
          emailFornecedor={contato(pedidoDaEntrega.contato_fornecedor_id)?.email ?? null}
          aoFechar={() => setAberto(null)}
          aoOk={setUltimo}
        />
      ) : null}
    </div>
  )
}
