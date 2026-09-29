'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import {
  formatarPercentualExato,
  formatarReaisExato as reais,
  paraCentavos,
  somarReais,
} from '@/lib/financeiro'

import {
  arquivarConta,
  baixarPagar,
  baixarParcial,
  baixarReceber,
  buscarDadosFornecedor,
  confirmarEntrega,
  estornarBaixa,
  registrarCobranca,
} from './acoes'
import type { Baixa, DadosFornecedor, EntregaPendente, EstadoAcao, FichaConta, Permissoes, Prazo, Selecionada } from './tipos'

type Acao = (form: FormData) => void

function Mensagem({ estado }: { estado: EstadoAcao }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste="erro-dialogo">
        {estado.erro}
      </p>
    )
  }
  if (estado.ok) {
    return (
      <p className="aviso" data-tom="ok" role="status" data-teste="ok-dialogo">
        {estado.ok}
      </p>
    )
  }
  return null
}

/** <dialog> nativo aberto com showModal() — foco preso e Esc fecha (estilos/componentes.css). */
function useDialogo() {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  return ref
}

/**
 * onSubmit, e não action=: com action o React 19 limpa o formulário ao fim de toda chamada,
 * inclusive quando a validação devolve erro (mesmo motivo de /cadastros e /produtos).
 */
function enviarCom(acao: Acao, confirmar?: string) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (confirmar && !window.confirm(confirmar)) return
    const form = new FormData(e.currentTarget)
    startTransition(() => acao(form))
  }
}

/** "1234.50" → "1.234,50" para o campo de valor (o que a pessoa digitaria). */
function paraCampo(valor: string): string {
  return reais(valor).replace(/^-?R\$\s/, '')
}

function ListaSelecionadas({ selecionadas }: { selecionadas: Selecionada[] }) {
  return (
    <div className="fin-lote">
      <p className="fin-lote-titulo">
        Contas ({selecionadas.length}) · saldo total <strong className="numero">{reais(somarReais(selecionadas.map((s) => s.saldo)))}</strong>
      </p>
      <ul>
        {selecionadas.map((s) => (
          <li key={s.id}>
            <span>{s.rotulo}</span>
            <span className="numero">{reais(s.saldo)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------- baixa em lote

/**
 * `pop baixar recebiveis` (bTqzf) — e o mesmo desenho para contas a pagar, cujo botão no
 * Bubble não tem workflow (financeiro.md §4.6). Com NF MegaBox (bTpVQ) ou gerando recibo
 * (bTrPO): número do recibo sai da sequence, no banco, e não do navegador (§5).
 */
export function DialogoBaixaLote({
  tipo,
  selecionadas,
  fornecedorUnico,
  hoje,
  aoConcluir,
  aoFechar,
}: {
  tipo: 'receber' | 'pagar'
  selecionadas: Selecionada[]
  fornecedorUnico: string | null
  hoje: string
  aoConcluir: () => void
  aoFechar: () => void
}) {
  const ref = useDialogo()
  const [estado, acao, gravando] = useActionState(tipo === 'receber' ? baixarReceber : baixarPagar, {})
  const [recibo, setRecibo] = useState(false)
  const [fornecedor, setFornecedor] = useState<DadosFornecedor | null>(null)
  // A lista mostrada é a do momento em que o diálogo abriu: concluir zera a seleção lá fora.
  const [lista] = useState(selecionadas)

  useEffect(() => {
    if (estado.ok) aoConcluir()
    // aoConcluir muda de identidade a cada render do pai; o gatilho é o ok novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  useEffect(() => {
    if (!recibo || !fornecedorUnico || fornecedor) return
    let vivo = true
    buscarDadosFornecedor(fornecedorUnico).then((d) => vivo && setFornecedor(d))
    return () => {
      vivo = false
    }
  }, [recibo, fornecedorUnico, fornecedor])

  const concluido = Boolean(estado.ok)

  return (
    <dialog ref={ref} className="dialogo fin-dialogo" aria-labelledby="bl-titulo" onClose={aoFechar} data-teste="dialogo-baixa">
      <header className="dialogo-cabecalho">
        <div>
          <p className="fin-dialogo-tipo">{tipo === 'receber' ? 'Contas a receber' : 'Contas a pagar'}</p>
          <h2 id="bl-titulo">{tipo === 'receber' ? 'Baixar recebíveis' : 'Pagar comissões'}</h2>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>
      <form id="form-baixa-lote" className="dialogo-corpo fin-form" noValidate onSubmit={enviarCom(acao)}>
        {lista.map((s) => (
          <input key={s.id} type="hidden" name="ids" value={s.id} />
        ))}
        <p className="fin-dica">
          Cada conta é baixada pelo <strong>saldo</strong> em aberto, tudo numa transação. Para baixar só parte de uma
          conta, abra a conta e use a baixa parcial.
        </p>
        <div className="fin-campos">
          {tipo === 'receber' ? (
            <>
              <label className="caixa fin-largo">
                <input
                  type="checkbox"
                  name="gerar_recibo"
                  checked={recibo}
                  disabled={!fornecedorUnico || concluido}
                  onChange={(e) => setRecibo(e.target.checked)}
                />
                Gerar recibo no lugar da nota fiscal
                {!fornecedorUnico ? <span className="fin-sub"> (só com contas de um fornecedor)</span> : null}
              </label>
              {recibo ? (
                <label className="campo fin-largo">
                  <span>CNPJ do fornecedor no recibo</span>
                  <select name="recibo_endereco" required defaultValue="" disabled={!fornecedor}>
                    <option value="">{fornecedor ? 'Escolha a filial…' : 'Carregando…'}</option>
                    {fornecedor?.enderecos.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.razao ?? e.nome_endereco} {e.documento ? `(cnpj: ${e.documento})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="campo">
                  <span>Número NF MegaBox</span>
                  <input name="nf_numero" maxLength={40} autoComplete="off" data-teste="campo-nf" />
                </label>
              )}
              <label className="campo">
                <span>{recibo ? 'Data do recibo' : 'Data NF MegaBox'}</span>
                <input type="date" name="dt_nf" defaultValue={hoje} required />
              </label>
            </>
          ) : (
            <label className="campo fin-largo">
              <span>Observação</span>
              <input name="observacao" maxLength={500} autoComplete="off" />
            </label>
          )}
          <label className="campo">
            <span>{tipo === 'receber' ? 'Data recebimento no banco' : 'Data pagamento no banco'}</span>
            <input type="date" name="dt_credito" defaultValue={hoje} required />
          </label>
        </div>
        {tipo === 'receber' ? (
          <p className="fin-nota">Anexo da NF, PDF do recibo e e-mail ao fornecedor ainda não são feitos aqui.</p>
        ) : null}
        <ListaSelecionadas selecionadas={lista} />
        <Mensagem estado={estado} />
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          {concluido ? 'Fechar' : 'Cancelar'}
        </button>
        {!concluido ? (
          <button
            type="submit"
            form="form-baixa-lote"
            className="botao-primario"
            disabled={gravando}
            aria-busy={gravando}
            data-teste="confirmar-baixa"
          >
            {gravando ? 'Gravando…' : `Baixar ${lista.length} ${lista.length === 1 ? 'conta' : 'contas'}`}
          </button>
        ) : null}
      </footer>
    </dialog>
  )
}

// -------------------------------------------------------------------------- cobrança

/**
 * `pop envia cobranca new` (bTpNl), só a parte que grava (bTpUa/bTpUb): número pela sequence,
 * fornecedor derivado da filial (D14). O PDF e o e-mail ficam para a fatia de e-mail.
 */
export function DialogoCobranca({
  selecionadas,
  fornecedorId,
  aoConcluir,
  aoFechar,
}: {
  selecionadas: Selecionada[]
  fornecedorId: string
  aoConcluir: () => void
  aoFechar: () => void
}) {
  const ref = useDialogo()
  const [estado, acao, gravando] = useActionState(registrarCobranca, {})
  const [dados, setDados] = useState<DadosFornecedor | null>(null)
  const [lista] = useState(selecionadas)

  useEffect(() => {
    let vivo = true
    buscarDadosFornecedor(fornecedorId).then((d) => vivo && setDados(d))
    return () => {
      vivo = false
    }
  }, [fornecedorId])

  useEffect(() => {
    if (estado.ok) aoConcluir()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  const concluido = Boolean(estado.ok)

  return (
    <dialog ref={ref} className="dialogo fin-dialogo" aria-labelledby="cb-titulo" onClose={aoFechar} data-teste="dialogo-cobranca">
      <header className="dialogo-cabecalho">
        <div>
          <p className="fin-dialogo-tipo">Contas a receber</p>
          <h2 id="cb-titulo">Cobrança de fornecedor</h2>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>
      <form id="form-cobranca" className="dialogo-corpo fin-form" noValidate onSubmit={enviarCom(acao)}>
        {lista.map((s) => (
          <input key={s.id} type="hidden" name="ids" value={s.id} />
        ))}
        <div className="fin-campos">
          <label className="campo">
            <span>Filial do fornecedor</span>
            <select name="endereco" required defaultValue="" disabled={!dados || concluido} data-teste="campo-filial">
              <option value="">{dados ? 'Escolha…' : 'Carregando…'}</option>
              {dados?.enderecos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome_endereco}
                  {e.documento ? ` (${e.documento})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>A/C (contato)</span>
            <select name="contato" defaultValue="" disabled={!dados || concluido}>
              <option value="">Sem contato</option>
              {dados?.contatos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                  {c.email ? ` — ${c.email}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        {dados && dados.enderecos.length === 0 ? (
          <p className="aviso">Este fornecedor não tem filial ativa. Cadastre uma em Cadastros antes de cobrar.</p>
        ) : null}
        <p className="fin-nota">
          O número da cobrança sai do banco ao registrar. O PDF e o e-mail ao fornecedor ainda não são enviados daqui.
        </p>
        <ListaSelecionadas selecionadas={lista} />
        <Mensagem estado={estado} />
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          {concluido ? 'Fechar' : 'Cancelar'}
        </button>
        {!concluido ? (
          <button
            type="submit"
            form="form-cobranca"
            className="botao-primario"
            disabled={gravando || !dados}
            aria-busy={gravando}
            data-teste="confirmar-cobranca"
          >
            {gravando ? 'Gravando…' : 'Registrar cobrança'}
          </button>
        ) : null}
      </footer>
    </dialog>
  )
}

// ------------------------------------------------------------------- ficha da conta

function LinhaBaixa({ b, podeEstornar, estornar }: { b: Baixa; podeEstornar: boolean; estornar: Acao }) {
  const [abrindo, setAbrindo] = useState(false)
  return (
    <li className="fin-baixa" data-estornada={b.estorno ? 'true' : undefined} data-teste="linha-baixa">
      <div className="fin-baixa-linha">
        <strong className="numero">{reais(b.valor)}</strong>
        <span>baixa {formatarData(b.dt_baixa)}</span>
        <span>banco {formatarData(b.dt_credito)}</span>
        {b.recibo ? <span>recibo nº {b.recibo.numero}</span> : b.nf_megabox_numero ? <span>NF {b.nf_megabox_numero}</span> : null}
        {b.dt_nf_megabox ? <span>dt NF {formatarData(b.dt_nf_megabox)}</span> : null}
        <span>por {b.usuario?.nome.split(' ')[0] ?? '—'}</span>
        {b.estorno ? (
          <span className="selo" data-tom="erro">
            Estornada
          </span>
        ) : podeEstornar && !abrindo ? (
          <button type="button" className="botao-perigo fin-botao-mini" onClick={() => setAbrindo(true)} data-teste="estornar">
            Estornar
          </button>
        ) : null}
      </div>
      {b.observacao ? <p className="fin-sub">{b.observacao}</p> : null}
      {b.estorno ? (
        <p className="fin-sub">
          Estornada em {formatarData(b.estorno.em)} por {b.estorno.usuario?.nome ?? '—'}: {b.estorno.motivo}
        </p>
      ) : null}
      {abrindo && !b.estorno ? (
        <form
          className="fin-estorno"
          noValidate
          onSubmit={enviarCom(estornar, `Estornar a baixa de ${reais(b.valor)}? A baixa fica registrada e a conta volta a ter saldo.`)}
        >
          <input type="hidden" name="baixa" value={b.id} />
          <label className="campo">
            <span>Motivo do estorno</span>
            <input name="motivo" required minLength={5} maxLength={500} autoFocus data-teste="campo-motivo" />
          </label>
          <button type="submit" className="botao-perigo" data-teste="confirmar-estorno">
            Confirmar estorno
          </button>
          <button type="button" className="botao-texto" onClick={() => setAbrindo(false)}>
            Cancelar
          </button>
        </form>
      ) : null}
    </li>
  )
}

/**
 * A conta aberta: dados, baixas (com estorno — reusables §4.7) e baixa parcial. Substitui o
 * lápis que abre `historico` e a parte "estornar" de `pop.EditaContasReceberNew`.
 */
export function FichaContaDialogo({
  ficha,
  permissoes,
  hoje,
  aoFechar,
}: {
  ficha: FichaConta
  permissoes: Permissoes
  hoje: string
  aoFechar: () => void
}) {
  const ref = useDialogo()
  const [estadoBaixa, acaoBaixa, gravandoBaixa] = useActionState(baixarParcial, {})
  const [estadoEstorno, acaoEstorno] = useActionState(estornarBaixa, {})
  const [estadoArquivo, acaoArquivo] = useActionState(arquivarConta, {})
  const c = ficha.conta
  const receber = ficha.tipo === 'receber'
  const aberta = paraCentavos(c.saldo) > 0n
  const baixado = receber ? ficha.conta.valor_baixado : ficha.conta.valor_pago

  return (
    <dialog ref={ref} className="dialogo fin-dialogo" aria-labelledby="fc-titulo" onClose={aoFechar} data-teste="ficha-conta">
      <header className="dialogo-cabecalho">
        <div>
          <p className="fin-dialogo-tipo">{receber ? 'Conta a receber' : 'Conta a pagar — comissão do vendedor'}</p>
          <h2 id="fc-titulo">
            {ficha.tipo === 'receber'
              ? `Pedido ${ficha.conta.pedido_numero ?? '—'} · parcela ${ficha.conta.parcela}/${ficha.conta.parcelas_total}`
              : ficha.conta.origem === 'meta'
                ? `Meta · ${ficha.conta.vendedor_nome}`
                : `Pedido ${ficha.conta.pedido_numero ?? '—'} · ${ficha.conta.vendedor_nome}`}
          </h2>
          <p className="fin-selos">
            <span className="selo" data-tom={aberta ? (c.vencida ? 'erro' : undefined) : 'ok'}>
              {aberta ? (receber ? 'A receber' : 'A pagar') : receber ? 'Recebido' : 'Pago'}
            </span>
            {c.vencida ? (
              <span className="selo" data-tom="erro">
                Vencida
              </span>
            ) : null}
            {ficha.tipo === 'receber' && ficha.conta.arquivado ? (
              <span className="selo" data-tom="alerta">
                Arquivada
              </span>
            ) : null}
          </p>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>

      <div className="dialogo-corpo fin-form">
        <dl className="fin-dados">
          <div>
            <dt>Cliente</dt>
            <dd>{c.cliente_nome}</dd>
          </div>
          <div>
            <dt>Fornecedor</dt>
            <dd>{c.fornecedor_nome}</dd>
          </div>
          <div>
            <dt>Vendedor</dt>
            <dd>{c.vendedor_nome}</dd>
          </div>
          <div>
            <dt>Vencimento</dt>
            <dd data-vencida={c.vencida || undefined}>{formatarData(c.dt_vencimento)}</dd>
          </div>
          {ficha.tipo === 'receber' ? (
            <>
              <div>
                <dt>Produto</dt>
                <dd>
                  {ficha.conta.qtd.replace(/\.?0+$/, '')} – {ficha.conta.produto_nome}
                </dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>{formatarData(ficha.conta.dt_entrega)}</dd>
              </div>
              <div>
                <dt>Venda (parcela)</dt>
                <dd className="numero">{reais(ficha.conta.valor_total)}</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Comissão MegaBox</dt>
                <dd className="numero">{reais(ficha.conta.valor_base)}</dd>
              </div>
              <div>
                <dt>Percentual</dt>
                <dd className="numero">{formatarPercentualExato(ficha.conta.percentual)}</dd>
              </div>
            </>
          )}
          <div>
            <dt>{receber ? 'Comissão' : 'Comissão do vendedor'}</dt>
            <dd className="numero">
              <strong>{reais(c.valor_comissao)}</strong>
            </dd>
          </div>
          <div>
            <dt>{receber ? 'Recebido' : 'Pago'}</dt>
            <dd className="numero">{reais(baixado)}</dd>
          </div>
          <div>
            <dt>Saldo</dt>
            <dd className="numero" data-teste="saldo-conta">
              <strong>{reais(c.saldo)}</strong>
            </dd>
          </div>
          {ficha.tipo === 'receber' ? (
            <div>
              <dt>Cobranças</dt>
              <dd>{ficha.cobrancas.length ? ficha.cobrancas.map((x) => `nº ${x.numero}`).join(', ') : '—'}</dd>
            </div>
          ) : null}
        </dl>

        <section className="fin-secao" aria-labelledby="fc-baixas">
          <h3 id="fc-baixas">Baixas</h3>
          {ficha.baixas.length === 0 ? (
            <p className="fin-sub">Nenhuma baixa ainda.</p>
          ) : (
            <ul className="fin-baixas">
              {ficha.baixas.map((b) => (
                <LinhaBaixa key={b.id} b={b} podeEstornar={permissoes.estornar} estornar={acaoEstorno} />
              ))}
            </ul>
          )}
          {!permissoes.estornar && ficha.baixas.some((b) => !b.estorno) ? (
            <p className="fin-nota">Estornar uma baixa é do Diretor.</p>
          ) : null}
          <Mensagem estado={estadoEstorno} />
        </section>

        {aberta ? (
          <section className="fin-secao" aria-labelledby="fc-nova">
            <h3 id="fc-nova">{receber ? 'Registrar recebimento' : 'Registrar pagamento'}</h3>
            <form className="fin-form" noValidate onSubmit={enviarCom(acaoBaixa)} data-teste="form-baixa-parcial">
              <input type="hidden" name="conta" value={c.id} />
              <input type="hidden" name="tipo" value={ficha.tipo} />
              <div className="fin-campos">
                <label className="campo">
                  <span>Valor (até {reais(c.saldo)})</span>
                  <input
                    name="valor"
                    inputMode="decimal"
                    defaultValue={paraCampo(c.saldo)}
                    required
                    autoComplete="off"
                    data-teste="campo-valor"
                  />
                </label>
                <label className="campo">
                  <span>Data no banco</span>
                  <input type="date" name="dt_credito" defaultValue={hoje} required />
                </label>
                {receber ? (
                  <>
                    <label className="campo">
                      <span>Número NF MegaBox</span>
                      <input name="nf_numero" maxLength={40} autoComplete="off" />
                    </label>
                    <label className="campo">
                      <span>Data NF MegaBox</span>
                      <input type="date" name="dt_nf" defaultValue={hoje} required />
                    </label>
                  </>
                ) : null}
                <label className="campo fin-largo">
                  <span>Observação</span>
                  <input name="observacao" maxLength={500} autoComplete="off" />
                </label>
              </div>
              <div className="fin-linha-botoes">
                <button
                  type="submit"
                  className="botao-primario"
                  disabled={gravandoBaixa}
                  aria-busy={gravandoBaixa}
                  data-teste="confirmar-baixa-parcial"
                >
                  {gravandoBaixa ? 'Gravando…' : 'Registrar baixa'}
                </button>
                <span className="fin-sub">Valor menor que o saldo deixa a conta em aberto.</span>
              </div>
            </form>
            <Mensagem estado={estadoBaixa} />
          </section>
        ) : (
          <Mensagem estado={estadoBaixa} />
        )}
        <Mensagem estado={estadoArquivo} />
      </div>

      <footer className="dialogo-rodape">
        {ficha.tipo === 'receber' ? (
          <form action={acaoArquivo}>
            <input type="hidden" name="conta" value={c.id} />
            <input type="hidden" name="arquivar" value={ficha.conta.arquivado ? 'false' : 'true'} />
            <button type="submit" className="botao-secundario">
              {ficha.conta.arquivado ? 'Desarquivar' : 'Arquivar'}
            </button>
          </form>
        ) : null}
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Fechar
        </button>
      </footer>
    </dialog>
  )
}

// ---------------------------------------------------------------- confirmar entrega

/**
 * Confirmação da entrega (bTcXd/bTcXj; na 010, `fn_confirmar_entrega`). Os prazos marcados são
 * os da condição negociada do pedido (bTryZ1); sem nenhum, a função recusa.
 */
export function DialogoConfirmarEntrega({
  entrega,
  prazos,
  hoje,
  aoFechar,
}: {
  entrega: EntregaPendente
  prazos: Prazo[]
  hoje: string
  aoFechar: () => void
}) {
  const ref = useDialogo()
  const [estado, acao, gravando] = useActionState(confirmarEntrega, {})
  const negociados = new Set(entrega.pedido?.prazos.map((p) => p.prazo_id) ?? [])
  const concluido = Boolean(estado.ok)

  return (
    <dialog ref={ref} className="dialogo fin-dialogo" aria-labelledby="ce-titulo" onClose={aoFechar} data-teste="dialogo-confirmar">
      <header className="dialogo-cabecalho">
        <div>
          <p className="fin-dialogo-tipo">Confirmar entrega</p>
          <h2 id="ce-titulo">
            Pedido {entrega.pedido?.numero ?? '—'} · {entrega.cliente?.nome ?? '—'}
          </h2>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>
      <form id="form-confirmar" className="dialogo-corpo fin-form" noValidate onSubmit={enviarCom(acao)}>
        <input type="hidden" name="entrega" value={entrega.id} />
        <dl className="fin-dados">
          <div>
            <dt>Fornecedor</dt>
            <dd>{entrega.fornecedor?.nome ?? '—'}</dd>
          </div>
          <div>
            <dt>Produto</dt>
            <dd>
              {entrega.qtd.replace(/\.?0+$/, '')} – {entrega.orcamento?.produto?.nome ?? '—'}
            </dd>
          </div>
          <div>
            <dt>Venda</dt>
            <dd className="numero">{reais(entrega.valor_venda_bruto)}</dd>
          </div>
          <div>
            <dt>Comissão MegaBox</dt>
            <dd className="numero">{reais(entrega.valor_comissao)}</dd>
          </div>
        </dl>
        <label className="campo fin-campo-curto">
          <span>Data real da entrega</span>
          <input type="date" name="dt_entrega" defaultValue={hoje} required data-teste="campo-dt-entrega" />
        </label>
        <fieldset className="fin-prazos" disabled={concluido}>
          <legend>Prazos de recebimento (uma parcela por prazo)</legend>
          {prazos.map((p) => (
            <label key={p.id} className="caixa">
              <input type="checkbox" name="prazos" value={p.id} defaultChecked={negociados.has(p.id)} />
              {p.nome}
            </label>
          ))}
        </fieldset>
        <p className="fin-nota">
          {negociados.size > 0
            ? 'Marcados: a condição negociada no pedido. O rateio é exato — a sobra de centavos vai na última parcela.'
            : 'O pedido não tem condição negociada: marque os prazos.'}
        </p>
        <Mensagem estado={estado} />
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          {concluido ? 'Fechar' : 'Cancelar'}
        </button>
        {!concluido ? (
          <button
            type="submit"
            form="form-confirmar"
            className="botao-primario"
            disabled={gravando}
            aria-busy={gravando}
            data-teste="gravar-confirmacao"
          >
            {gravando ? 'Gravando…' : 'Confirmar entrega'}
          </button>
        ) : null}
      </footer>
    </dialog>
  )
}
