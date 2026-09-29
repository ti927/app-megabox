'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from 'react'

import { Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { totalPaginas } from '@/lib/clifor'
import { formatarData } from '@/lib/datas'
import {
  type FiltrosSac,
  formatarDataHora,
  formatarMedia,
  formatarNps,
  paraQuery,
  POR_PAGINA,
  situacaoConvite,
  type SituacaoConvite,
  temFiltro,
} from '@/lib/sac'

import { adicionarConvidado, buscarClifor, cancelarConvite, emitirConvite, listarContatos } from './acoes'
import { BotaoEnviar, FichaProtocolo, Mensagem, NovaPesquisa, NovoProtocolo, SeloPrioridade, SeloStatus } from './dialogo'
import type { CliforEncontrado, Contato, Convite, Ficha, LinhaProtocolo, Opcoes, PainelNps } from './tipos'

type UsuarioTela = { id: string; ehDiretor: boolean }
type Navegar = (mudancas: Partial<FiltrosSac>) => void

function Paginacao({
  pagina,
  total,
  pendente,
  navegar,
}: {
  pagina: number
  total: number
  pendente: boolean
  navegar: Navegar
}) {
  const paginas = totalPaginas(total, POR_PAGINA)
  const primeiro = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1
  const ultimo = Math.min(total, pagina * POR_PAGINA)
  return (
    <div className="paginacao">
      <span aria-live="polite">
        {total === 0
          ? 'Nenhum resultado'
          : `${primeiro.toLocaleString('pt-BR')}–${ultimo.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')}`}
      </span>
      <nav aria-label="Paginação">
        <button
          type="button"
          className="botao-secundario"
          disabled={pagina <= 1 || pendente}
          onClick={() => navegar({ pagina: pagina - 1, sel: null })}
        >
          <Icone icone={ChevronLeft} tamanho={16} />
          Anterior
        </button>
        <button
          type="button"
          className="botao-secundario"
          disabled={pagina >= paginas || pendente}
          onClick={() => navegar({ pagina: pagina + 1, sel: null })}
        >
          Próxima
          <Icone icone={ChevronRight} tamanho={16} />
        </button>
      </nav>
    </div>
  )
}

// ---------------------------------------------------------------------- chamados

function LinhaChamado({
  linha,
  opcoes,
  selecionada,
  aoAbrir,
}: {
  linha: LinhaProtocolo
  opcoes: Opcoes
  selecionada: boolean
  aoAbrir: () => void
}) {
  const tipo = opcoes.tipos.find((t) => t.id === linha.tipo_ocorrencia_id)?.nome ?? '—'
  return (
    <li>
      <button
        type="button"
        className="sac-linha"
        aria-current={selecionada ? 'true' : undefined}
        data-excluido={linha.excluido_em ? true : undefined}
        data-prioridade={linha.prioridade_id}
        onClick={aoAbrir}
      >
        <span className="sac-col-numero">
          <small className="sac-rotulo">Protocolo</small>
          <strong>Nº {linha.numero}</strong>
          <small>{formatarData(linha.aberto_em)}</small>
        </span>
        <span className="sac-col-cliente">
          <small className="sac-rotulo">Cliente (CNPJ)</small>
          <strong>{linha.cliente?.nome ?? '—'}</strong>
          <small>
            {linha.cliente?.tipo === 'fornecedor' ? 'Fornecedor' : 'Cliente'}
            {linha.filial?.documento ? ` · ${linha.filial.documento}` : ''}
          </small>
        </span>
        <span className="sac-col-pedido">
          <small className="sac-rotulo">Pedido</small>
          {linha.pedido ? `Nº ${linha.pedido.numero}` : '—'}
        </span>
        <span className="sac-col-tipo">
          <small className="sac-rotulo">Tipo</small>
          {tipo}
        </span>
        <span className="sac-col-prioridade">
          <small className="sac-rotulo">Prioridade</small>
          <SeloPrioridade id={linha.prioridade_id} opcoes={opcoes.prioridades} />
        </span>
        <span className="sac-col-selos">
          <small className="sac-rotulo">Status</small>
          <SeloStatus id={linha.status_id} opcoes={opcoes.status} />
          {linha.excluido_em ? (
            <span className="selo" data-tom="erro">
              Excluído
            </span>
          ) : null}
        </span>
        <span className="sac-col-responsavel">
          <small className="sac-rotulo">Responsável</small>
          {linha.responsavel?.nome ?? (linha.responsavel_id ? '(inativo)' : 'Sem responsável')}
        </span>
      </button>
    </li>
  )
}

function Chamados({
  filtros,
  usuario,
  opcoes,
  abertos,
  lista,
  ficha,
  navegar,
  pendente,
}: {
  filtros: FiltrosSac
  usuario: UsuarioTela
  opcoes: Opcoes
  abertos: number
  lista: { linhas: LinhaProtocolo[]; total: number; falhou: boolean }
  ficha: Ficha | null
  navegar: Navegar
  pendente: boolean
}) {
  const [novo, setNovo] = useState(false)
  const [texto, setTexto] = useState(filtros.q)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)

  /** Mudou filtro: volta à página 1 e fecha a ficha. */
  function filtrar(mudancas: Partial<FiltrosSac>) {
    navegar({ pagina: 1, sel: null, ...mudancas })
  }
  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => filtrar({ q: valor.trim() }), 400)
  }
  const algumFiltro = temFiltro(filtros)

  return (
    <>
      <header className="sac-topo">
        <div>
          <h1>Dashboard de Chamados</h1>
          <p className="sac-subtitulo">Gestão centralizada de protocolos de pós-venda</p>
        </div>
        <p className="sac-contador" data-teste="contador">
          Não resolvidos: <strong>{abertos.toLocaleString('pt-BR')}</strong>
        </p>
        <button type="button" className="botao-primario" onClick={() => setNovo(true)} data-teste="novo-chamado">
          <Icone icone={Plus} tamanho={16} />
          Novo chamado
        </button>
      </header>

      <section className="sac-filtros" aria-label="Filtros">
        <label className="campo sac-busca">
          <span>Buscar por cliente ou nº do protocolo</span>
          <input
            type="search"
            value={texto}
            onChange={(e) => digitar(e.target.value)}
            placeholder="Digite parte do nome ou o número"
            spellCheck={false}
            data-teste="busca"
          />
        </label>
        {(
          [
            ['status', 'Status', opcoes.status],
            ['prioridade', 'Prioridade', opcoes.prioridades],
            ['tipo', 'Tipo de ocorrência', opcoes.tipos],
          ] as const
        ).map(([chave, rotulo, lista]) => (
          <label key={chave} className="campo">
            <span>{rotulo}</span>
            <select
              value={filtros[chave] ?? ''}
              onChange={(e) => filtrar({ [chave]: e.target.value ? Number(e.target.value) : null })}
              data-teste={`filtro-${chave}`}
            >
              <option value="">Todos</option>
              {lista.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label className="campo">
          <span>Responsável</span>
          <select value={filtros.responsavel ?? ''} onChange={(e) => filtrar({ responsavel: e.target.value || null })}>
            <option value="">Todos</option>
            {opcoes.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Aberto de</span>
          <input type="date" value={filtros.de ?? ''} onChange={(e) => filtrar({ de: e.target.value || null })} />
        </label>
        <label className="campo">
          <span>até</span>
          <input type="date" value={filtros.ate ?? ''} onChange={(e) => filtrar({ ate: e.target.value || null })} />
        </label>
        <div className="sac-acoes">
          {usuario.ehDiretor ? (
            <label className="caixa">
              <input
                type="checkbox"
                checked={filtros.excluidos}
                onChange={(e) => filtrar({ excluidos: e.target.checked })}
                data-teste="mostrar-excluidos"
              />
              Mostrar excluídos
            </label>
          ) : null}
          {algumFiltro ? (
            <button
              type="button"
              className="botao-texto sac-limpar"
              onClick={() => {
                setTexto('')
                filtrar({ q: '', status: null, prioridade: null, tipo: null, responsavel: null, de: null, ate: null, excluidos: false })
              }}
            >
              <Icone icone={X} tamanho={16} />
              Limpar
            </button>
          ) : null}
        </div>
      </section>

      <section className="sac-corpo" aria-label="Lista de chamados" aria-busy={pendente}>
        {lista.falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar a lista agora. Recarregue a página em instantes.
          </p>
        ) : lista.linhas.length === 0 ? (
          <p className="sac-vazio" data-teste="lista-vazia">
            {algumFiltro ? 'Nenhum chamado encontrado com esses filtros.' : 'Nenhum chamado aberto para você ainda.'}
          </p>
        ) : (
          <div className="sac-tabela">
            <div className="sac-cabecalho" aria-hidden="true">
              <span>Protocolo</span>
              <span>Cliente (CNPJ)</span>
              <span>Pedido</span>
              <span>Tipo</span>
              <span>Prioridade</span>
              <span>Status</span>
              <span>Responsável</span>
            </div>
            <ol className="sac-lista" data-teste="lista-chamados" data-pendente={pendente || undefined}>
              {lista.linhas.map((l) => (
                <LinhaChamado
                  key={l.id}
                  linha={l}
                  opcoes={opcoes}
                  selecionada={filtros.sel === l.id}
                  aoAbrir={() => navegar({ sel: l.id })}
                />
              ))}
            </ol>
          </div>
        )}
        <Paginacao pagina={filtros.pagina} total={lista.total} pendente={pendente} navegar={navegar} />
      </section>

      {ficha ? (
        <FichaProtocolo
          // key: trocar de protocolo remonta o diálogo e zera formulário e aba.
          key={ficha.protocolo.id}
          ficha={ficha}
          opcoes={opcoes}
          usuario={usuario}
          aoFechar={() => navegar({ sel: null })}
        />
      ) : null}
      {novo ? (
        <NovoProtocolo
          opcoes={opcoes}
          aoCriar={(id) => {
            setNovo(false)
            navegar({ sel: id })
          }}
          aoFechar={() => setNovo(false)}
        />
      ) : null}
    </>
  )
}

// --------------------------------------------------------------------------- NPS

const SITUACAO: Record<SituacaoConvite, { rotulo: string; tom?: 'ok' | 'erro' | 'alerta' }> = {
  respondido: { rotulo: 'Respondido', tom: 'ok' },
  enviado: { rotulo: 'Link emitido' },
  nao_enviado: { rotulo: 'Sem link', tom: 'alerta' },
  expirado: { rotulo: 'Link expirado', tom: 'alerta' },
  cancelado: { rotulo: 'Removido', tom: 'erro' },
}

/**
 * O link acabou de ser emitido: mostrado UMA vez, só em memória. Fechar descarta; recarregar a
 * página não o traz de volta (o banco guarda só o hash). É a decisão desta fatia enquanto não
 * existe envio de e-mail: copiar e mandar pelo canal que a Ouvidoria já usa.
 */
function LinkEmitido({ caminho, aoFechar }: { caminho: string; aoFechar: () => void }) {
  const [copiado, setCopiado] = useState(false)
  const url = typeof window === 'undefined' ? caminho : `${window.location.origin}${caminho}`
  return (
    <div className="nps-link" role="status" data-teste="link-emitido">
      <label className="campo">
        <span>Link da pesquisa — copie agora, ele não aparece de novo</span>
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} data-teste="link-convite" />
      </label>
      <div className="sf-linha-botoes">
        <button
          type="button"
          className="botao-primario"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url)
              setCopiado(true)
            } catch {
              setCopiado(false)
            }
          }}
        >
          {copiado ? (
            <>
              <Icone icone={Check} tamanho={16} />
              Copiado
            </>
          ) : (
            'Copiar link'
          )}
        </button>
        <button type="button" className="botao-texto" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </div>
  )
}

function LinhaConvite({ convite }: { convite: Convite }) {
  const [estadoEmitir, emitir, emitindo] = useActionState(emitirConvite, {})
  const [estadoCancelar, cancelar] = useActionState(cancelarConvite, {})
  const [link, setLink] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState(false)
  const situacao = situacaoConvite(convite)
  const s = SITUACAO[situacao]
  const vivo = situacao !== 'respondido' && situacao !== 'cancelado'

  // O link só passa do estado da action para o estado local; some ao fechar.
  useEffect(() => {
    if (estadoEmitir.link) setLink(estadoEmitir.link)
  }, [estadoEmitir])

  return (
    <li className="nps-convite" data-situacao={situacao}>
      <div className="nps-convite-principal">
        <strong>{convite.cliente?.nome ?? '—'}</strong>
        <small>
          {convite.contato ? `${convite.contato.nome}${convite.contato.email ? ` <${convite.contato.email}>` : ''}` : 'Sem contato escolhido'}
        </small>
        <small>
          Incluído em {formatarData(convite.criado_em)}
          {convite.enviado_em ? ` · link emitido em ${formatarDataHora(convite.enviado_em)} (${convite.envios}×)` : ''}
          {situacao === 'enviado' ? ` · vale até ${formatarData(convite.expira_em)}` : ''}
        </small>
        {convite.cancelado_em ? <small>Removido: {convite.cancelado_motivo}</small> : null}
      </div>
      <div className="nps-convite-resposta">
        <span className="selo" data-tom={s.tom}>
          {s.rotulo}
        </span>
        {convite.resposta ? (
          <span className="nps-nota" data-teste="nota-nps">
            Nota NPS <strong>{convite.resposta.nota_nps ?? '—'}</strong>
            {convite.resposta.criticas_sugestoes ? <em> “{convite.resposta.criticas_sugestoes}”</em> : null}
          </span>
        ) : null}
      </div>
      {vivo ? (
        <div className="nps-convite-acoes">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // Reenvio troca o token e mata o anterior ([DÚVIDA 11]/[DÚVIDA 12]): confirma.
              if (convite.enviado_em && !window.confirm('Emitir um link NOVO? O link anterior deixa de funcionar.')) return
              const form = new FormData(e.currentTarget)
              startTransition(() => emitir(form))
            }}
          >
            <input type="hidden" name="convite_id" value={convite.id} />
            <button type="submit" className="botao-secundario" disabled={emitindo} aria-busy={emitindo} data-teste="emitir-link">
              {emitindo ? 'Emitindo…' : convite.enviado_em ? 'Reemitir link' : 'Emitir link'}
            </button>
          </form>
          {!removendo ? (
            <button type="button" className="botao-texto" onClick={() => setRemovendo(true)} data-teste="remover-convidado">
              Remover
            </button>
          ) : null}
        </div>
      ) : null}
      {removendo && vivo ? (
        <form action={cancelar} className="nps-remover">
          <input type="hidden" name="convite_id" value={convite.id} />
          <label className="campo">
            <span>Motivo da remoção</span>
            <input name="motivo" maxLength={500} required autoFocus data-teste="motivo-remocao" />
          </label>
          <div className="sf-linha-botoes">
            <button type="button" className="botao-texto" onClick={() => setRemovendo(false)}>
              Desistir
            </button>
            <BotaoEnviar className="botao-perigo" teste="confirmar-remocao">
              Remover da pesquisa
            </BotaoEnviar>
          </div>
        </form>
      ) : null}
      {link ? <LinkEmitido caminho={link} aoFechar={() => setLink(null)} /> : null}
      {estadoEmitir.erro ? <Mensagem estado={{ erro: estadoEmitir.erro }} /> : null}
      <Mensagem estado={estadoCancelar} />
    </li>
  )
}

/** Montar a lista de convidados — no lugar de `rpg adicionar contatos` (WF bUDcQ). */
function AdicionarConvidado({ pesquisaId }: { pesquisaId: string }) {
  const [estado, adicionar] = useActionState(adicionarConvidado, {})
  const [cliente, setCliente] = useState<CliforEncontrado | null>(null)
  /** null = carregando os contatos do cliente escolhido */
  const [contatos, setContatos] = useState<Contato[] | null>([])
  const [texto, setTexto] = useState('')
  const [itens, setItens] = useState<CliforEncontrado[] | null>(null)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pedido = useRef(0)

  useEffect(() => {
    if (estado.ok) {
      setCliente(null)
      setContatos([])
    }
  }, [estado])

  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    if (valor.trim().length < 2) {
      pedido.current++
      setItens(null)
      return
    }
    espera.current = setTimeout(async () => {
      const meu = ++pedido.current
      const r = await buscarClifor(valor, 'cliente')
      if (meu !== pedido.current) return
      setItens('erro' in r ? [] : r.itens)
    }, 350)
  }

  return (
    <div className="nps-adicionar">
      {cliente ? (
        <form action={adicionar} className="nps-adicionar-form">
          <input type="hidden" name="pesquisa_id" value={pesquisaId} />
          <input type="hidden" name="cliente_id" value={cliente.id} />
          <p className="sf-escolhido">
            <span>
              Cliente: <strong>{cliente.nome}</strong>
            </span>
            <button type="button" className="botao-texto" onClick={() => setCliente(null)}>
              Trocar
            </button>
          </p>
          <label className="campo">
            <span>Contato que recebe o link</span>
            <select
              key={`${cliente.id}-${contatos?.length ?? 'carregando'}`}
              name="contato_id"
              defaultValue={contatos?.[0]?.id ?? ''}
              disabled={contatos === null}
              data-teste="contato-convite"
            >
              <option value="">{contatos === null ? 'Carregando…' : 'Sem contato'}</option>
              {(contatos ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.email}
                </option>
              ))}
            </select>
          </label>
          {contatos === null ? (
            <button type="button" className="botao-primario" disabled>
              Carregando…
            </button>
          ) : (
            <BotaoEnviar teste="adicionar-convidado">Adicionar à pesquisa</BotaoEnviar>
          )}
        </form>
      ) : (
        <div className="sf-busca">
          <label className="campo">
            <span>Adicionar cliente à pesquisa</span>
            <input
              type="search"
              value={texto}
              onChange={(e) => digitar(e.target.value)}
              placeholder="Digite parte do nome do cliente"
              spellCheck={false}
              autoComplete="off"
              data-teste="busca-convidado"
            />
          </label>
          {itens && itens.length === 0 ? <p className="sf-vazio">Nenhum cliente ativo com esse nome.</p> : null}
          {itens && itens.length > 0 ? (
            <ul className="sf-resultados" data-teste="busca-convidado-resultados">
              {itens.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={async () => {
                      pedido.current++
                      setItens(null)
                      setTexto('')
                      // Zera antes de carregar: o contato do cliente anterior não pode ir junto.
                      setContatos(null)
                      setCliente(c)
                      setContatos(await listarContatos(c.id))
                    }}
                  >
                    <strong>{c.nome}</strong>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
      <Mensagem estado={estado} />
    </div>
  )
}

function GestaoNps({
  filtros,
  painel,
  navegar,
  pendente,
}: {
  filtros: FiltrosSac
  painel: PainelNps
  navegar: Navegar
  pendente: boolean
}) {
  const [nova, setNova] = useState(false)
  const [texto, setTexto] = useState(filtros.q)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const p = painel.escolhida
  const n = painel.nps

  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => navegar({ q: valor.trim(), pagina: 1 }), 400)
  }

  return (
    <>
      <header className="sac-topo">
        <div>
          <h1>Gestão de Pesquisa de Satisfação</h1>
          <p className="sac-subtitulo">Campanhas de NPS, convidados e respostas</p>
        </div>
        <button type="button" className="botao-primario" onClick={() => setNova(true)} data-teste="nova-pesquisa-botao">
          <Icone icone={Plus} tamanho={16} />
          Nova pesquisa NPS
        </button>
      </header>

      {painel.pesquisas.length === 0 ? (
        <p className="sac-vazio" data-teste="nps-vazio">
          Nenhuma pesquisa criada ainda. Crie a primeira em “Nova pesquisa NPS”.
        </p>
      ) : (
        <>
          <section className="sac-filtros nps-filtros" aria-label="Pesquisa">
            <label className="campo sac-busca">
              <span>Qual pesquisa?</span>
              <select
                value={p?.id ?? ''}
                onChange={(e) => navegar({ pesquisa: e.target.value || null, pagina: 1, q: '' })}
                data-teste="escolher-pesquisa"
              >
                {painel.pesquisas.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nome}
                    {x.ativa ? '' : ' (desativada)'}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo">
              <span>Respostas de</span>
              <input type="date" value={filtros.de ?? ''} onChange={(e) => navegar({ de: e.target.value || null, pagina: 1 })} />
            </label>
            <label className="campo">
              <span>até</span>
              <input type="date" value={filtros.ate ?? ''} onChange={(e) => navegar({ ate: e.target.value || null, pagina: 1 })} />
            </label>
          </section>

          {/* Quatro cards ([DÚVIDA 7]) no lugar de "NPS Atual" (que contava convites) e da média
              com divisão por zero (§5). Tudo de fn_nps, no banco. */}
          <section className="nps-cards" aria-label="Indicadores" data-teste="nps-cards">
            <div className="nps-card nps-card-destaque">
              <small>NPS</small>
              <strong data-teste="valor-nps">{formatarNps(n?.nps)}</strong>
              <span>% promotores (9–10) − % detratores (0–6)</span>
            </div>
            <div className="nps-card">
              <small>Convites</small>
              <strong>{(n?.convites ?? 0).toLocaleString('pt-BR')}</strong>
              <span>não removidos</span>
            </div>
            <div className="nps-card">
              <small>Respondidas</small>
              <strong>{(n?.respondidas ?? 0).toLocaleString('pt-BR')}</strong>
              <span>
                {n ? `${n.promotores} promotores · ${n.neutros} neutros · ${n.detratores} detratores` : '—'}
              </span>
            </div>
            <div className="nps-card">
              <small>Nota média</small>
              <strong>{formatarMedia(n?.media)}</strong>
              <span>de 0 a 10</span>
            </div>
          </section>

          {p && p.ativa ? <AdicionarConvidado key={p.id} pesquisaId={p.id} /> : null}

          <section className="sac-corpo" aria-label="Convidados" aria-busy={pendente}>
            <label className="campo nps-busca">
              <span>Filtrar convidados por cliente</span>
              <input
                type="search"
                value={texto}
                onChange={(e) => digitar(e.target.value)}
                placeholder="Digite parte do nome"
                spellCheck={false}
              />
            </label>
            {painel.falhou ? (
              <p className="aviso" data-tom="erro" role="alert">
                Parte do painel não carregou. Recarregue a página em instantes.
              </p>
            ) : null}
            {painel.convites.length === 0 ? (
              <p className="sac-vazio" data-teste="convites-vazio">
                {filtros.q ? 'Nenhum convidado com esse nome.' : 'Nenhum cliente nesta pesquisa ainda.'}
              </p>
            ) : (
              <ol className="nps-convites" data-teste="lista-convites" data-pendente={pendente || undefined}>
                {painel.convites.map((c) => (
                  <LinhaConvite key={c.id} convite={c} />
                ))}
              </ol>
            )}
            <Paginacao pagina={filtros.pagina} total={painel.totalConvites} pendente={pendente} navegar={navegar} />
            <p className="sf-nota">
              O e-mail com o link ainda não é enviado pelo app: emita o link, copie e envie ao contato. Cada
              emissão gera um link novo, válido por 30 dias e de uso único.
            </p>
          </section>
        </>
      )}

      {nova ? (
        <NovaPesquisa
          aoCriar={(id) => {
            setNova(false)
            navegar({ pesquisa: id, pagina: 1, q: '' })
          }}
          aoFechar={() => setNova(false)}
        />
      ) : null}
    </>
  )
}

// -------------------------------------------------------------------------- tela

export function TelaSac({
  filtros,
  usuario,
  opcoes,
  abertos,
  lista,
  ficha,
  painel,
}: {
  filtros: FiltrosSac
  usuario: UsuarioTela
  opcoes: Opcoes
  abertos: number | null
  lista: { linhas: LinhaProtocolo[]; total: number; falhou: boolean } | null
  ficha: Ficha | null
  painel: PainelNps | null
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()

  // Estado na URL (spec §9.1: aba, filtros e protocolo linkáveis — no Bubble nada sobrevive ao F5).
  function navegar(mudancas: Partial<FiltrosSac>) {
    iniciar(() => {
      router.replace(`/sac${paraQuery(filtros, mudancas)}` as Route, { scroll: false })
    })
  }

  // Abas por navegação, não toggle (§4.1: clicar de novo na aba ativa deixava a tela em branco).
  // Relatórios e Pós-Venda ainda não existem aqui.
  const abas = [
    { id: 'chamados', rotulo: 'Chamados' },
    { id: 'nps', rotulo: 'Gestão NPS' },
  ] as const

  return (
    <div className="sac">
      <nav className="abas sac-abas" aria-label="Seções do SAC">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-current={filtros.aba === a.id ? 'page' : undefined}
            onClick={() => {
              if (filtros.aba !== a.id) {
                router.push((a.id === 'nps' ? '/sac?aba=nps' : '/sac') as Route)
              }
            }}
            data-teste={`aba-sac-${a.id}`}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      {filtros.aba === 'nps' && painel ? (
        <GestaoNps filtros={filtros} painel={painel} navegar={navegar} pendente={pendente} />
      ) : lista && abertos !== null ? (
        <Chamados
          filtros={filtros}
          usuario={usuario}
          opcoes={opcoes}
          abertos={abertos}
          lista={lista}
          ficha={ficha}
          navegar={navegar}
          pendente={pendente}
        />
      ) : null}
    </div>
  )
}
