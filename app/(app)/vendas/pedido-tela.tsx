'use client'

import { Check, CircleAlert, Send, ShoppingCart, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { sugerirPrazos, textoDosPrazos } from '@/lib/fluxo-tela'
import { ETAPA } from '@/lib/vendas'
import { montarEmailVendas, produtosDistintos } from '@/lib/vendas-fluxo'

import { descartarPedido, extrasPedido, salvarPedido } from './acoes-fluxo'
import { DocumentoPedido, type VistaPedido } from './documento'
import { EntregasDoItem } from './entregas'
import { contatoPadrao, Mensagem, OpcoesContato, useAcao } from './fluxo-comum'
import { CondicoesPagamento } from './pagamento'
import type { EstadoAcao, Ficha, Opcao, OpcoesFicha, Pedido, PropostaItem } from './tipos'
import type { ExtrasPedido } from './tipos-fluxo'

/*
 * Aba Pedidos em UMA tela (vendas.md §2.9, decisão 30/09 — ver §2.9 "Tela única"): o DOCUMENTO
 * do pedido à esquerda, ao vivo (o que cliente e fornecedor recebem), e à direita tudo o que o
 * vendedor faz: e-mails, condições de pagamento, entregas (com a NF/saída na própria linha) e
 * "Enviar pedido". Sem diálogo sobre a ficha nem pop-up sobre pop-up.
 * Gravação e regras são as de sempre (acoes-fluxo: salvarPedido, adicionarEntrega, …).
 */

type Rascunho = {
  contatoCli: string
  ccCli: string
  corpoCli: string | null
  contatoFor: string
  ccFor: string
  corpoFor: string | null
  oc: string
  info: string
  forma: number | null
  prazos: number[]
}

function itensDoPedido(ficha: Ficha, p: Pedido): PropostaItem[] {
  return ficha.propostas.find((x) => x.id === p.proposta_id)?.itens ?? []
}

function contatosDoPedido(ficha: Ficha, p: Pedido) {
  const fornecedores = new Set(itensDoPedido(ficha, p).map((i) => i.orcamento?.fornecedor_id))
  return {
    cli: ficha.contatos.filter((x) => x.grupo_id === ficha.cotacao.cliente_id),
    forn: ficha.contatos.filter((x) => fornecedores.has(x.grupo_id)),
  }
}

function inicial(ficha: Ficha, p: Pedido, prazos: Opcao[]): Rascunho {
  const { cli, forn } = contatosDoPedido(ficha, p)
  const gravados = p.prazos.map((x) => x.prazo_id)
  const condicao = ficha.propostas.find((x) => x.id === p.proposta_id)?.condicao_pagamento
  return {
    contatoCli: contatoPadrao(p.contato_cliente_id, cli),
    ccCli: p.emails_copia_cliente ?? '',
    corpoCli: p.corpo_email_cliente,
    contatoFor: contatoPadrao(p.contato_fornecedor_id, forn),
    ccFor: p.emails_copia_fornecedor ?? '',
    corpoFor: p.corpo_email_fornecedor,
    oc: p.ordem_compra_numero ?? '',
    info: p.info_adicional ?? '',
    forma: p.forma_pagamento_id,
    // Sem prazos gravados: sugere pela condição escrita na proposta ("30/60/90 dd").
    prazos: gravados.length ? gravados : sugerirPrazos(condicao, prazos),
  }
}

export function AbaPedidos({ ficha, etapas, opcoesFicha }: { ficha: Ficha; etapas: Opcao[]; opcoesFicha: OpcoesFicha }) {
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const padrao = ficha.pedidos.find((p) => p.etapa_id !== ETAPA.CANCELADO && !p.finalizado) ?? ficha.pedidos[0] ?? null
  const pedido = ficha.pedidos.find((p) => p.id === selecionado) ?? padrao
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>({})
  const [ultimo, setUltimo] = useState<EstadoAcao>({})

  // Extras do documento e o saldo em R$ (db/029): relidos quando as entregas mudam.
  const assinatura = pedido
    ? ficha.entregas
        .filter((e) => e.pedido_id === pedido.id)
        .map((e) => `${e.id}:${e.qtd}:${e.status_id}`)
        .join('|')
    : ''
  const [extras, setExtras] = useState<{ id: string; dados: ExtrasPedido } | null>(null)
  const pedidoId = pedido?.id ?? null
  useEffect(() => {
    if (!pedidoId) return
    let vivo = true
    extrasPedido(pedidoId).then((r) => vivo && !('erro' in r) && setExtras({ id: pedidoId, dados: r }))
    return () => {
      vivo = false
    }
  }, [pedidoId, assinatura])
  const dados = extras && extras.id === pedidoId ? extras.dados : null

  const rascunho = pedido ? (rascunhos[pedido.id] ?? inicial(ficha, pedido, opcoesFicha.prazos)) : null
  const mudar = <K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) =>
    pedido && setRascunhos((r) => ({ ...r, [pedido.id]: { ...(r[pedido.id] ?? inicial(ficha, pedido, opcoesFicha.prazos)), [campo]: valor } }))

  const vista = useMemo(
    () => (pedido && rascunho ? montarVista(ficha, pedido, rascunho, dados, opcoesFicha) : null),
    [ficha, pedido, rascunho, dados, opcoesFicha],
  )

  if (!pedido || !rascunho || !vista) {
    return (
      <div className="mesa-papel-vazio">
        <Icone icone={ShoppingCart} tamanho={24} />
        <p>Esta cotação ainda não virou pedido. Envie uma proposta e use “Transformar em pedido”.</p>
      </div>
    )
  }

  return (
    <div className="mesa" data-teste="mesa-pedido">
      <section className="mesa-papel" aria-label="Documento do pedido">
        <p className="mesa-estado" data-tom={pedido.formalizado ? 'ok' : 'rascunho'}>
          {pedido.formalizado
            ? `Pedido formalizado ${formatarData(pedido.formalizado_em)}. Mudanças ao lado só chegam ao cliente e ao fornecedor se você reenviar.`
            : 'Pedido ainda não enviado: o documento acompanha o que você faz ao lado. O que ainda não foi gravado aparece marcado.'}
        </p>
        <DocumentoPedido ficha={ficha} vista={vista} />
      </section>
      <aside className="mesa-painel" aria-label="Pedido">
        <PainelPedido
          key={pedido.id}
          ficha={ficha}
          pedido={pedido}
          rascunho={rascunho}
          mudar={mudar}
          dados={dados}
          etapas={etapas}
          opcoesFicha={opcoesFicha}
          selecionar={setSelecionado}
          ultimo={ultimo}
          aoResultado={setUltimo}
          aoGravar={(r) => {
            setUltimo(r)
            setRascunhos((todos) => {
              const resto = { ...todos }
              delete resto[pedido.id]
              return resto
            })
          }}
        />
      </aside>
    </div>
  )
}

function montarVista(ficha: Ficha, p: Pedido, r: Rascunho, dados: ExtrasPedido | null, opcoes: OpcoesFicha): VistaPedido {
  const proposta = ficha.propostas.find((x) => x.id === p.proposta_id)
  const forma = opcoes.formas.find((f) => f.id === r.forma)?.nome
  const texto = textoDosPrazos(r.prazos, opcoes.prazos)
  const gravados = p.prazos.map((x) => x.prazo_id)
  const itens = itensDoPedido(ficha, p)
  return {
    pedidoId: p.id,
    numero: proposta ? `${p.numero}/${proposta.numero}` : p.numero,
    propostaId: p.proposta_id,
    criado_em: p.criado_em,
    consultor: ficha.cotacao.vendedor?.nome ?? '—',
    ordemCompra: r.oc || null,
    infoAdicional: r.info || null,
    pagamento: [texto, forma === 'Transferencia' ? 'Transferência' : forma].filter(Boolean).join(' — '),
    itens: itens.map((i) => {
      const d = dados?.itens.find((x) => x.orcamento_fornecedor_id === i.orcamento?.id)
      return { orcamento_fornecedor_id: i.orcamento?.id ?? '', origem: d?.origem ?? null, destino: d?.destino ?? null, fornecedor: i.orcamento?.fornecedor?.nome ?? '—' }
    }),
    faturar: dados?.faturar ?? null,
    rascunho: {
      oc: r.oc !== (p.ordem_compra_numero ?? ''),
      info: r.info !== (p.info_adicional ?? ''),
      pagamento: r.forma !== p.forma_pagamento_id || r.prazos.length !== gravados.length || r.prazos.some((x) => !gravados.includes(x)),
    },
  }
}

function PainelPedido({
  ficha,
  pedido: p,
  rascunho: r,
  mudar,
  dados,
  etapas,
  opcoesFicha,
  selecionar,
  ultimo,
  aoResultado,
  aoGravar,
}: {
  ficha: Ficha
  pedido: Pedido
  rascunho: Rascunho
  mudar: <K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) => void
  dados: ExtrasPedido | null
  etapas: Opcao[]
  opcoesFicha: OpcoesFicha
  selecionar: (id: string) => void
  ultimo: EstadoAcao
  aoResultado: (r: EstadoAcao) => void
  aoGravar: (r: EstadoAcao) => void
}) {
  const c = ficha.cotacao
  const acao = useAcao()
  const [confirmaDescarte, setConfirmaDescarte] = useState(false)
  const ativo = p.etapa_id !== ETAPA.CANCELADO && !p.finalizado
  const itens = itensDoPedido(ficha, p)
  const entregas = ficha.entregas.filter((e) => e.pedido_id === p.id)
  const vivas = entregas.filter((e) => e.status_id !== ETAPA.CANCELADO)
  const { cli, forn } = contatosDoPedido(ficha, p)
  const contatoCli = cli.find((x) => x.id === r.contatoCli)
  const contatoFor = forn.find((x) => x.id === r.contatoFor)
  const proposta = ficha.propostas.find((x) => x.id === p.proposta_id)
  const num = proposta ? `${p.numero}/${proposta.numero}` : p.numero
  const produtos = produtosDistintos(itens.map((i) => i.orcamento?.produto?.nome)) || '—'
  const nomeFornecedor = itens.find((i) => i.orcamento?.fornecedor_id === contatoFor?.grupo_id)?.orcamento?.fornecedor?.nome ?? itens[0]?.orcamento?.fornecedor?.nome ?? ''
  const eu = dados?.eu ?? ''
  const emailCli = montarEmailVendas(
    'vendas_pedido_cliente',
    { numero: num, produtos, nome: c.cliente?.nome ?? '', contato: contatoCli?.nome ?? '(contato)', vendedor: eu },
    dados?.modelos.vendas_pedido_cliente,
  )
  const emailFor = montarEmailVendas(
    'vendas_pedido_fornecedor',
    { numero: num, produtos, nome: nomeFornecedor, contato: contatoFor?.nome ?? '(contato)', vendedor: eu },
    dados?.modelos.vendas_pedido_fornecedor,
  )
  const prazosTexto = [textoDosPrazos(p.prazos.map((x) => x.prazo_id), opcoesFicha.prazos), p.forma?.nome].filter(Boolean).join(' — ')

  // O que falta para enviar: as MESMAS exigências de validarPedido/salvarPedido, mostradas antes.
  const semData = vivas.some((e) => !e.dt_prev_entrega)
  const saldoAberto = (dados?.saldo ?? []).some((s) => !/^0+(\.0+)?$/.test(s.falta_qtd))
  const checagens = [
    { ok: !!r.contatoCli, texto: 'E-mail do cliente' },
    { ok: r.forma !== null, texto: 'Forma de pagamento' },
    { ok: r.prazos.length > 0, texto: 'Prazos' },
    { ok: vivas.length > 0 && !semData, texto: vivas.length === 0 ? 'Entregas programadas' : 'Entregas com data' },
  ]
  const pronto = checagens.every((x) => x.ok)

  function gravar(formalizar: boolean) {
    acao.executar(
      salvarPedido,
      {
        pedido_id: p.id,
        contato_cliente_id: r.contatoCli,
        emails_copia_cliente: r.ccCli,
        corpo_email_cliente: r.corpoCli ?? '',
        contato_fornecedor_id: r.contatoFor,
        emails_copia_fornecedor: r.ccFor,
        corpo_email_fornecedor: r.corpoFor ?? '',
        ordem_compra_numero: r.oc,
        info_adicional: r.info,
        forma_pagamento_id: r.forma === null ? '' : String(r.forma),
        prazos: r.prazos.map(String),
        formalizar,
      },
      formalizar ? 'Enviando pedido…' : 'Gravando…',
      aoGravar,
    )
  }

  const mensagem = acao.estado.ok || acao.estado.erro ? acao.estado : ultimo

  return (
    // <div>, não <form>: a NF/saída das entregas é um formulário próprio aqui dentro (sem aninhar).
    <div className="mesa-form" data-teste="form-pedido">
      <div className="mesa-rolagem">
        {ficha.pedidos.length > 1 ? (
          <div className="mesa-lista" role="list" aria-label="Pedidos da cotação">
            {ficha.pedidos.map((x) => (
              <button key={x.id} type="button" role="listitem" className="mesa-ficha" aria-current={x.id === p.id || undefined} onClick={() => selecionar(x.id)} data-teste="pedido">
                <strong>Pedido {x.numero}</strong>
                <span className="selo" data-tom={x.etapa_id === ETAPA.CANCELADO ? 'erro' : x.formalizado ? 'ok' : 'alerta'}>
                  {x.etapa_id === ETAPA.CANCELADO ? 'Cancelado' : x.formalizado ? 'Enviado' : 'Não enviado'}
                </span>
                <small>{formatarData(x.criado_em)}</small>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mesa-titulo" data-teste="pedido">
          <h2>Pedido {num}</h2>
          <span className="selo" data-tom={p.etapa_id === ETAPA.CANCELADO ? 'erro' : undefined}>
            {p.etapa?.nome ?? '—'}
          </span>
          <span className="selo" data-tom={p.formalizado ? 'ok' : 'alerta'} data-teste="selo-formalizado">
            {p.formalizado ? `Enviado ${formatarData(p.formalizado_em)}` : 'Não enviado'}
          </span>
          {p.finalizado ? <span className="selo">Finalizado</span> : null}
        </div>
        {p.motivo_cancelamento ? <p className="aviso" data-tom="erro">Cancelado: {p.motivo_cancelamento}</p> : null}

        <fieldset className="mesa-grupo" disabled={!ativo}>
          <legend>Para quem vai</legend>
          <div className="mesa-duas">
            <label className="campo">
              <span>E-mail do cliente</span>
              <select value={r.contatoCli} onChange={(e) => mudar('contatoCli', e.target.value)} data-teste="campo-contato-cliente">
                <OpcoesContato contatos={cli} vazio="Cliente sem contato com e-mail" />
              </select>
            </label>
            <label className="campo">
              <span>E-mail do fornecedor</span>
              <select value={r.contatoFor} onChange={(e) => mudar('contatoFor', e.target.value)} data-teste="campo-contato-fornecedor">
                <OpcoesContato contatos={forn} vazio="Fornecedor sem contato com e-mail" />
              </select>
            </label>
            <label className="campo">
              <span>Cópia ao cliente</span>
              <input value={r.ccCli} onChange={(e) => mudar('ccCli', e.target.value)} autoComplete="off" placeholder="opcional" />
            </label>
            <label className="campo">
              <span>Cópia ao fornecedor</span>
              <input value={r.ccFor} onChange={(e) => mudar('ccFor', e.target.value)} autoComplete="off" placeholder="opcional" />
            </label>
          </div>
        </fieldset>

        <fieldset className="mesa-grupo" disabled={!ativo}>
          <legend>Condições de pagamento</legend>
          <CondicoesPagamento
            pedidoId={p.id}
            formas={opcoesFicha.formas}
            prazos={opcoesFicha.prazos}
            forma={r.forma}
            selecionados={r.prazos}
            aoMudarForma={(id) => mudar('forma', id)}
            aoMudarPrazos={(ids) => mudar('prazos', ids)}
            desabilitado={!ativo}
            sugeridos={p.prazos.length === 0 && r.prazos.length > 0}
          />
        </fieldset>

        <fieldset className="mesa-grupo mesa-grupo-entregas">
          <legend>Produtos e entregas</legend>
          {itens.map((i) => (
            <EntregasDoItem
              key={i.id}
              pedidoId={p.id}
              item={i}
              entregas={entregas.filter((e) => e.orcamento_fornecedor_id === i.orcamento?.id)}
              saldo={dados?.saldo.find((s) => s.orcamento_fornecedor_id === i.orcamento?.id)}
              ativo={ativo}
              etapas={etapas}
              emailCliente={ficha.contatos.find((x) => x.id === p.contato_cliente_id)?.email ?? null}
              emailFornecedor={ficha.contatos.find((x) => x.id === p.contato_fornecedor_id)?.email ?? null}
              prazosTexto={prazosTexto}
              aoResultado={aoResultado}
            />
          ))}
          {entregas.some((e) => e.status_id === ETAPA.EM_ENTREGA) ? (
            <p className="vendas-nota" data-teste="nota-financeiro">
              Entregue ao cliente? A confirmação (data real, parcelas a receber e comissão) é feita na tela Financeiro.
            </p>
          ) : null}
        </fieldset>

        <fieldset className="mesa-grupo" disabled={!ativo}>
          <legend>Ordem de compra e observações</legend>
          <div className="mesa-duas">
            <label className="campo">
              <span>Nº da ordem de compra do cliente</span>
              <input value={r.oc} onChange={(e) => mudar('oc', e.target.value)} maxLength={60} data-teste="campo-oc" />
            </label>
            <label className="campo">
              <span>Informações adicionais</span>
              <input value={r.info} onChange={(e) => mudar('info', e.target.value)} maxLength={4000} />
            </label>
          </div>
        </fieldset>

        <details className="mesa-grupo mesa-mensagens">
          <summary>
            Mensagens dos e-mails
            <small>{r.corpoCli !== null || r.corpoFor !== null ? 'editadas por você' : 'texto dos modelos, com os nomes dos contatos'}</small>
          </summary>
          <div className="mesa-duas">
            <div className="mesa-mensagem">
              <p className="mesa-assunto">
                <b>Ao cliente:</b> {emailCli.assunto}
              </p>
              <textarea aria-label="Mensagem ao cliente" rows={7} value={r.corpoCli ?? emailCli.corpo} onChange={(e) => mudar('corpoCli', e.target.value)} disabled={!ativo} />
              {r.corpoCli !== null ? (
                <button type="button" className="botao-texto" onClick={() => mudar('corpoCli', null)}>
                  Voltar ao modelo
                </button>
              ) : null}
            </div>
            <div className="mesa-mensagem">
              <p className="mesa-assunto">
                <b>Ao fornecedor:</b> {emailFor.assunto}
              </p>
              <textarea aria-label="Mensagem ao fornecedor" rows={7} value={r.corpoFor ?? emailFor.corpo} onChange={(e) => mudar('corpoFor', e.target.value)} disabled={!ativo} />
              {r.corpoFor !== null ? (
                <button type="button" className="botao-texto" onClick={() => mudar('corpoFor', null)}>
                  Voltar ao modelo
                </button>
              ) : null}
            </div>
          </div>
          <p className="vendas-nota">Os itens e as entregas vão logo abaixo da mensagem; ao fornecedor, com a comissão unitária.</p>
        </details>
      </div>

      {ativo ? (
        <footer className="mesa-rodape">
          <ul className="mesa-checagem" aria-label="Para enviar o pedido">
            {checagens.map((x) => (
              <li key={x.texto} data-ok={x.ok || undefined}>
                <Icone icone={x.ok ? Check : CircleAlert} tamanho={14} />
                {x.texto}
              </li>
            ))}
            {vivas.length > 0 && saldoAberto ? (
              <li data-aviso>
                <Icone icone={CircleAlert} tamanho={14} />
                Entregas não somam o pedido
              </li>
            ) : null}
          </ul>
          <Mensagem estado={mensagem} />
          <div className="mesa-botoes">
            {!p.formalizado && entregas.length === 0 ? (
              confirmaDescarte ? (
                <span className="fluxo-confirma">
                  Descartar o pedido? A cotação volta para a coluna Cotação.
                  <button type="button" className="botao-perigo" onClick={() => acao.executar(descartarPedido, { pedido_id: p.id }, 'Descartando…', aoResultado)} data-teste="descartar-pedido-sim">
                    Descartar
                  </button>
                  <button type="button" className="botao-secundario" onClick={() => setConfirmaDescarte(false)}>
                    Manter
                  </button>
                </span>
              ) : (
                <button type="button" className="botao-texto mesa-descartar" onClick={() => setConfirmaDescarte(true)} data-teste="descartar-pedido">
                  <Icone icone={Trash2} tamanho={16} />
                  Descartar
                </button>
              )
            ) : null}
            <button type="button" className="botao-secundario" disabled={acao.pendente} onClick={() => gravar(false)} data-teste="gravar-pedido">
              {acao.rodando === 'Gravando…' ? 'Gravando…' : 'Salvar'}
            </button>
            <button
              type="button"
              className="botao-primario"
              onClick={() => gravar(true)}
              disabled={acao.pendente || !pronto}
              aria-busy={acao.rodando === 'Enviando pedido…'}
              title={pronto ? 'Grava e envia o pedido ao fornecedor e ao cliente' : 'Complete os itens marcados ao lado'}
              data-teste="enviar-pedido"
            >
              <Icone icone={Send} tamanho={18} />
              {acao.rodando === 'Enviando pedido…' ? 'Enviando pedido…' : p.formalizado ? 'Salvar e reenviar pedido' : 'Enviar pedido'}
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
