'use client'

import { FileText, Plus, Send, ShoppingCart, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { formatarDocumento } from '@/lib/documento'
import { ETAPA } from '@/lib/vendas'
import { CONDICAO_PAGAMENTO_PADRAO, montarEmailVendas, produtosDistintos } from '@/lib/vendas-fluxo'

import { criarPedido, criarProposta, descartarProposta, extrasProposta, reenviarProposta, salvarProposta } from './acoes-fluxo'
import { DocumentoProposta, type VistaProposta } from './documento'
import { contatoPadrao, Mensagem, OpcoesContato, useAcao } from './fluxo-comum'
import type { EstadoAcao, Ficha, Proposta } from './tipos'
import type { ExtrasProposta } from './tipos-fluxo'

/*
 * Aba Propostas em UMA tela (vendas.md §2.8, decisão 30/09 — ver §2.8 "Tela única"): o
 * DOCUMENTO à esquerda, ao vivo, e à direita a lista de propostas e o formulário da
 * selecionada. Sem diálogo por cima da ficha: "+ Proposta" cria o rascunho e o formulário já
 * está aberto; "Enviar ao cliente" grava e envia num clique; "Virar pedido" leva à aba Pedidos.
 * Regras e gravação são as de sempre (acoes-fluxo: criarProposta, salvarProposta, …).
 */

type Rascunho = {
  numero: string
  contato: string
  cc: string
  /** null = texto do modelo (o servidor monta); string = o vendedor editou */
  corpo: string | null
  faturar: string
  data: string
  condicao: string
  info: string
}

function inicial(p: Proposta, ficha: Ficha): Rascunho {
  const contatos = ficha.contatos.filter((x) => x.grupo_id === ficha.cotacao.cliente_id)
  return {
    numero: String(p.numero),
    contato: contatoPadrao(p.enviar_para_contato_id, contatos),
    cc: p.emails_copia ?? '',
    corpo: p.corpo_email,
    // Sem faturamento escolhido: o endereço do cliente, se só há um.
    faturar: p.faturar_para_endereco_id ?? (ficha.destinos.length === 1 ? ficha.destinos[0]!.id : ''),
    data: p.data_prev_entrega ?? '',
    condicao: p.condicao_pagamento ?? '',
    info: p.info_adicional ?? '',
  }
}

/** Atalhos da condição de pagamento da proposta (texto livre na 008). */
const ATALHOS_CONDICAO = [CONDICAO_PAGAMENTO_PADRAO, 'À vista', '28 dd', '30 dd', '30/60 dd', '30/60/90 dd']

export function AbaPropostas({ ficha, editavel, irParaPedidos }: { ficha: Ficha; editavel: boolean; irParaPedidos: () => void }) {
  const c = ficha.cotacao
  const temVencedor = ficha.orcamentos.some((o) => o.vencedor)
  const podePropor = editavel && c.etapa_id === ETAPA.COTACAO && temVencedor
  const comPedido = new Set(ficha.pedidos.filter((p) => p.etapa_id !== ETAPA.CANCELADO).map((p) => p.proposta_id))
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const proposta = ficha.propostas.find((p) => p.id === selecionada) ?? ficha.propostas[0] ?? null

  const [extras, setExtras] = useState<ExtrasProposta | null>(null)
  useEffect(() => {
    let vivo = true
    extrasProposta(c.id).then((r) => vivo && !('erro' in r) && setExtras(r))
    return () => {
      vivo = false
    }
  }, [c.id])

  // Rascunho por proposta: sobrevive à troca de seleção e é descartado ao gravar.
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>({})
  const rascunho = proposta ? (rascunhos[proposta.id] ?? inicial(proposta, ficha)) : null
  const mudar = (campo: keyof Rascunho, valor: string | null) =>
    proposta && setRascunhos((r) => ({ ...r, [proposta.id]: { ...(r[proposta.id] ?? inicial(proposta, ficha)), [campo]: valor } }))

  const acao = useAcao()
  // A mensagem da última ação (criar, enviar, reenviar…) fica AQUI: o formulário que a gerou
  // pode sumir (proposta enviada vira resumo), a mensagem não.
  const [ultimo, setUltimo] = useState<EstadoAcao>({})
  const criar = () =>
    acao.executar(criarProposta, { cotacao_id: c.id }, 'Criando proposta…', (r) => {
      setUltimo(r)
      if (r.alvo) setSelecionada(r.alvo)
    })
  const mensagemLista = acao.estado.erro ? acao.estado : ultimo

  const editando = !!proposta && !proposta.enviada && editavel
  const vista = useMemo(() => (proposta && rascunho ? montarVista(ficha, proposta, rascunho, extras) : null), [ficha, proposta, rascunho, extras])

  return (
    <div className="mesa" data-teste="mesa-proposta">
      <section className="mesa-papel" aria-label="Documento da proposta">
        {proposta && vista ? (
          <>
            <p className="mesa-estado" data-tom={proposta.enviada ? 'ok' : 'rascunho'}>
              {proposta.enviada
                ? `Enviada ${formatarData(proposta.enviada_em)} — este é o documento que o cliente recebeu e não muda. Para mudar valores, edite a cotação e crie outra proposta.`
                : 'Rascunho: o documento acompanha o que você digita ao lado. O que ainda não foi gravado aparece marcado. Para mudar valores, edite a cotação antes de enviar.'}
            </p>
            <DocumentoProposta ficha={ficha} vista={vista} />
          </>
        ) : (
          <div className="mesa-papel-vazio">
            <Icone icone={FileText} tamanho={24} />
            <p>O documento da proposta aparece aqui, do jeito que o cliente vai receber.</p>
          </div>
        )}
      </section>

      <aside className="mesa-painel" aria-label="Propostas da cotação">
        <header className="mesa-topo">
          <div className="mesa-lista" role="list" aria-label="Propostas" data-teste="lista-propostas">
            {ficha.propostas.map((p) => (
              <button
                key={p.id}
                type="button"
                role="listitem"
                className="mesa-ficha"
                aria-current={p.id === proposta?.id || undefined}
                onClick={() => setSelecionada(p.id)}
                data-teste="linha-proposta"
                data-exibida={p.id === proposta?.id || undefined}
              >
                <strong>
                  {c.numero}/{p.numero}
                </strong>
                <span className="selo" data-tom={p.enviada ? 'ok' : 'alerta'}>
                  {comPedido.has(p.id) ? 'Virou pedido' : p.enviada ? 'Enviada' : 'Rascunho'}
                </span>
                <small>{formatarData(p.criado_em)}</small>
              </button>
            ))}
            {podePropor ? (
              <button type="button" className="mesa-ficha mesa-ficha-nova" onClick={criar} disabled={acao.pendente} aria-busy={acao.pendente} data-teste="nova-proposta">
                <Icone icone={Plus} tamanho={18} />
                {acao.rodando === 'Criando proposta…' ? 'Criando…' : 'Nova proposta'}
              </button>
            ) : null}
          </div>
          {!temVencedor && c.etapa_id === ETAPA.COTACAO ? (
            <p className="vendas-nota">Para propor, marque o vencedor (troféu) dos produtos na aba Cotação.</p>
          ) : null}
          {!proposta ? <Mensagem estado={mensagemLista} /> : null}
        </header>

        {proposta && rascunho ? (
          editando ? (
            <EditorProposta
              key={proposta.id}
              ficha={ficha}
              proposta={proposta}
              rascunho={rascunho}
              mudar={mudar}
              extras={extras}
              aoGravar={(r) => {
                setUltimo(r)
                setRascunhos((todos) => {
                  const resto = { ...todos }
                  delete resto[proposta.id]
                  return resto
                })
              }}
              aoDescartar={(r) => {
                setUltimo(r)
                setSelecionada(null)
              }}
              mensagemLista={mensagemLista}
            />
          ) : (
            <ResumoProposta
              key={proposta.id}
              ficha={ficha}
              proposta={proposta}
              temPedido={comPedido.has(proposta.id)}
              irParaPedidos={irParaPedidos}
              aoResultado={setUltimo}
              mensagemLista={mensagemLista}
            />
          )
        ) : null}
      </aside>
    </div>
  )
}

function montarVista(ficha: Ficha, p: Proposta, r: Rascunho, extras: ExtrasProposta | null): VistaProposta {
  const contato = ficha.contatos.find((x) => x.id === r.contato) ?? null
  const endExtra = extras?.enderecos.find((e) => e.id === r.faturar) ?? null
  const destino = ficha.destinos.find((d) => d.id === r.faturar)
  // Enquanto os extras não chegam: o gravado (se é o mesmo) ou o básico da ficha.
  const faturar =
    endExtra ??
    (r.faturar && r.faturar === p.faturar_para_endereco_id && p.faturar
      ? { id: r.faturar, nome_endereco: '', razao: p.faturar.grupo?.nome ?? null, documento: p.faturar.documento, insc_estadual: null, logradouro: null, numero: null, complemento: null, bairro: null, municipio: p.faturar.municipio, uf: p.faturar.uf, cep: null }
      : destino
        ? { id: destino.id, nome_endereco: destino.nome_endereco, razao: null, documento: null, insc_estadual: null, logradouro: null, numero: null, complemento: null, bairro: null, municipio: destino.municipio, uf: destino.uf, cep: null }
        : null)
  return {
    id: p.id,
    numero: Number(r.numero) || p.numero,
    criado_em: p.criado_em,
    consultor: p.vendedor?.nome ?? ficha.cotacao.vendedor?.nome ?? '—',
    clienteNome: ficha.cotacao.cliente?.nome ?? '—',
    contatoNome: contato?.nome ?? null,
    contatoTelefone: contato ? (extras?.telefones[contato.id] ?? (contato.id === p.enviar_para_contato_id ? (p.contato?.telefone ?? null) : null)) : null,
    faturar,
    condicao: r.condicao || null,
    dataPrevEntrega: r.data || null,
    infoAdicional: r.info || null,
    fornecedorCnpj: p.fornecedor_cnpj,
    rascunho: p.enviada
      ? {}
      : {
          contato: r.contato !== (p.enviar_para_contato_id ?? ''),
          faturar: r.faturar !== (p.faturar_para_endereco_id ?? ''),
          condicao: r.condicao !== (p.condicao_pagamento ?? ''),
          data: r.data !== (p.data_prev_entrega ?? ''),
          info: r.info !== (p.info_adicional ?? ''),
        },
  }
}

function EditorProposta({
  ficha,
  proposta,
  rascunho: r,
  mudar,
  extras,
  aoGravar,
  aoDescartar,
  mensagemLista,
}: {
  ficha: Ficha
  proposta: Proposta
  rascunho: Rascunho
  mudar: (campo: keyof Rascunho, valor: string | null) => void
  extras: ExtrasProposta | null
  aoGravar: (r: EstadoAcao) => void
  aoDescartar: (r: EstadoAcao) => void
  mensagemLista: EstadoAcao
}) {
  const c = ficha.cotacao
  const contatos = ficha.contatos.filter((x) => x.grupo_id === c.cliente_id)
  const contato = contatos.find((x) => x.id === r.contato)
  const acao = useAcao()
  const [confirmaDescarte, setConfirmaDescarte] = useState(false)

  const email = montarEmailVendas(
    'vendas_proposta',
    {
      cotacao: c.numero,
      proposta: Number(r.numero) || proposta.numero,
      produtos: produtosDistintos(proposta.itens.map((i) => i.orcamento?.produto?.nome)) || '—',
      cliente: c.cliente?.nome ?? '',
      contato: contato?.nome ?? '(contato)',
      vendedor: extras?.eu ?? '',
    },
    extras?.modelos.vendas_proposta,
    null,
  )

  function gravar(enviar: boolean) {
    acao.executar(
      salvarProposta,
      {
        proposta_id: proposta.id,
        acao: enviar ? 'enviar' : 'gravar',
        numero: r.numero,
        enviar_para_contato_id: r.contato,
        emails_copia: r.cc,
        corpo_email: r.corpo ?? '',
        faturar_para_endereco_id: r.faturar,
        data_prev_entrega: r.data,
        condicao_pagamento: r.condicao,
        info_adicional: r.info,
      },
      enviar ? 'Enviando proposta…' : 'Gravando…',
      aoGravar,
    )
  }

  const enderecos = extras?.enderecos ?? ficha.destinos.map((d) => ({ ...d, documento: null as string | null }))
  const mensagem = acao.estado.ok || acao.estado.erro ? acao.estado : mensagemLista

  return (
    <form className="mesa-form" noValidate onSubmit={(e) => (e.preventDefault(), gravar(true))} data-teste="form-proposta">
      <div className="mesa-rolagem">
        <div className="mesa-titulo">
          <h2>
            Proposta {c.numero}/
            <input
              className="mesa-numero"
              aria-label="Número da proposta"
              inputMode="numeric"
              value={r.numero}
              onChange={(e) => mudar('numero', e.target.value)}
            />
          </h2>
          <span className="selo" data-tom="alerta">
            Rascunho
          </span>
        </div>

        <fieldset className="mesa-grupo">
          <legend>Para quem vai</legend>
          <div className="mesa-duas">
            <label className="campo">
              <span>E-mail do cliente</span>
              <select value={r.contato} onChange={(e) => mudar('contato', e.target.value)} data-teste="campo-contato">
                <OpcoesContato contatos={contatos} vazio="Cliente sem contato com e-mail" />
              </select>
            </label>
            <label className="campo">
              <span>Cópia (separe por vírgula)</span>
              <input value={r.cc} onChange={(e) => mudar('cc', e.target.value)} autoComplete="off" placeholder="opcional" />
            </label>
          </div>
          <label className="campo">
            <span>Faturar para (CNPJ do cliente)</span>
            <select value={r.faturar} onChange={(e) => mudar('faturar', e.target.value)} data-teste="campo-faturar">
              <option value="">—</option>
              {enderecos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome_endereco}
                  {d.documento ? ` — ${formatarDocumento(d.documento)}` : ''} — {d.municipio ? `${d.municipio}/` : ''}
                  {d.uf}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="mesa-grupo">
          <legend>Condições</legend>
          <div className="mesa-atalhos" role="group" aria-label="Condição de pagamento pronta">
            {ATALHOS_CONDICAO.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={r.condicao === t} onClick={() => mudar('condicao', t)}>
                {t === CONDICAO_PAGAMENTO_PADRAO ? 'Análise do financeiro' : t}
              </button>
            ))}
          </div>
          <div className="mesa-duas">
            <label className="campo">
              <span>Condição de pagamento</span>
              <input value={r.condicao} onChange={(e) => mudar('condicao', e.target.value)} maxLength={500} data-teste="campo-condicao" />
            </label>
            <label className="campo">
              <span>Entrega prevista</span>
              <input type="date" value={r.data} onChange={(e) => mudar('data', e.target.value)} data-teste="campo-prev-entrega" />
            </label>
          </div>
          <label className="campo">
            <span>Informações adicionais</span>
            <textarea rows={2} value={r.info} onChange={(e) => mudar('info', e.target.value)} />
          </label>
        </fieldset>

        <fieldset className="mesa-grupo">
          <legend>Mensagem ao cliente</legend>
          <p className="mesa-assunto">
            <b>Assunto:</b> {email.assunto}
          </p>
          <label className="campo">
            <span className="so-leitor">Corpo do e-mail</span>
            <textarea
              rows={6}
              value={r.corpo ?? email.corpo}
              onChange={(e) => mudar('corpo', e.target.value)}
              data-teste="campo-corpo"
            />
          </label>
          <p className="vendas-nota">
            {r.corpo === null ? 'Texto do modelo de e-mail, com o nome do contato.' : 'Texto editado por você.'} A lista de itens
            vai logo abaixo, automaticamente.
            {r.corpo !== null ? (
              <>
                {' '}
                <button type="button" className="botao-texto" onClick={() => mudar('corpo', null)}>
                  Voltar ao modelo
                </button>
              </>
            ) : null}
          </p>
        </fieldset>
      </div>

      <footer className="mesa-rodape">
        <Mensagem estado={mensagem} />
        <div className="mesa-botoes">
          {confirmaDescarte ? (
            <span className="fluxo-confirma">
              Descartar este rascunho?
              <button
                type="button"
                className="botao-perigo"
                onClick={() => acao.executar(descartarProposta, { proposta_id: proposta.id }, 'Descartando…', aoDescartar)}
                data-teste="descartar-proposta-sim"
              >
                Descartar
              </button>
              <button type="button" className="botao-secundario" onClick={() => setConfirmaDescarte(false)}>
                Manter
              </button>
            </span>
          ) : (
            <button type="button" className="botao-texto mesa-descartar" onClick={() => setConfirmaDescarte(true)} data-teste="descartar-proposta">
              <Icone icone={Trash2} tamanho={16} />
              Descartar
            </button>
          )}
          <button type="button" className="botao-secundario" disabled={acao.pendente} onClick={() => gravar(false)} data-teste="gravar-proposta">
            {acao.rodando === 'Gravando…' ? 'Gravando…' : 'Salvar rascunho'}
          </button>
          <button
            type="submit"
            className="botao-primario"
            disabled={acao.pendente || !r.contato}
            aria-busy={acao.rodando === 'Enviando proposta…'}
            title={r.contato ? 'Grava, trava a proposta e põe o e-mail ao cliente na fila' : 'Escolha o e-mail do cliente'}
            data-teste="enviar-proposta"
          >
            <Icone icone={Send} tamanho={18} />
            {acao.rodando === 'Enviando proposta…' ? 'Enviando proposta…' : 'Enviar ao cliente'}
          </button>
        </div>
      </footer>
    </form>
  )
}

function ResumoProposta({
  ficha,
  proposta,
  temPedido,
  irParaPedidos,
  aoResultado,
  mensagemLista,
}: {
  ficha: Ficha
  proposta: Proposta
  temPedido: boolean
  irParaPedidos: () => void
  aoResultado: (r: EstadoAcao) => void
  mensagemLista: EstadoAcao
}) {
  const c = ficha.cotacao
  const acao = useAcao()
  const contato = ficha.contatos.find((x) => x.id === proposta.enviar_para_contato_id)
  const mensagem = acao.estado.ok || acao.estado.erro ? acao.estado : mensagemLista
  return (
    <div className="mesa-form">
      <div className="mesa-rolagem">
        <div className="mesa-titulo">
          <h2>
            Proposta {c.numero}/{proposta.numero}
          </h2>
          <span className="selo" data-tom={proposta.enviada ? 'ok' : undefined}>
            {proposta.enviada ? 'Enviada' : 'Rascunho'}
          </span>
        </div>
        <dl className="mesa-resumo">
          <div>
            <dt>Enviada para</dt>
            <dd>{contato ? `${contato.nome} — ${contato.email}` : '—'}</dd>
          </div>
          {proposta.emails_copia ? (
            <div>
              <dt>Cópia</dt>
              <dd>{proposta.emails_copia}</dd>
            </div>
          ) : null}
          <div>
            <dt>Quando</dt>
            <dd>{formatarData(proposta.enviada_em)}</dd>
          </div>
          <div>
            <dt>Condição de pagamento</dt>
            <dd>{proposta.condicao_pagamento || '—'}</dd>
          </div>
        </dl>
        {!proposta.enviada ? <p className="vendas-nota">Cotação arquivada: só o Diretor altera esta proposta.</p> : null}
      </div>
      <footer className="mesa-rodape">
        <Mensagem estado={mensagem} />
        <div className="mesa-botoes">
          {proposta.enviada ? (
            <button
              type="button"
              className="botao-secundario"
              disabled={acao.pendente}
              onClick={() => acao.executar(reenviarProposta, { proposta_id: proposta.id }, 'Reenviando…', aoResultado)}
              data-teste="reenviar-proposta"
            >
              <Icone icone={Send} tamanho={16} />
              {acao.rodando === 'Reenviando…' ? 'Reenviando…' : 'Reenviar'}
            </button>
          ) : null}
          {temPedido ? (
            <button type="button" className="botao-primario" onClick={irParaPedidos} data-teste="abrir-pedido">
              <Icone icone={ShoppingCart} tamanho={18} />
              Abrir o pedido
            </button>
          ) : proposta.enviada && !c.arquivado ? (
            <button
              type="button"
              className="botao-primario"
              disabled={acao.pendente}
              aria-busy={acao.rodando === 'Criando pedido…'}
              onClick={() => acao.executar(criarPedido, { proposta_id: proposta.id }, 'Criando pedido…', (r) => {
                  aoResultado(r)
                  irParaPedidos()
                })
              }
              data-teste="virar-pedido"
            >
              <Icone icone={ShoppingCart} tamanho={18} />
              {acao.rodando === 'Criando pedido…' ? 'Criando pedido…' : 'Transformar em pedido'}
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  )
}
