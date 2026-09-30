'use client'

import type { Route } from 'next'
import {
  Archive,
  ArrowUpNarrowWide,
  CalendarX,
  ChevronDown,
  ChevronsDown,
  ChevronUp,
  FileText,
  Flag,
  type LucideIcon,
  Pencil,
  Plus,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

import { Foto } from '@/componentes/foto'
import { Icone } from '@/componentes/icone'
import { SeletorPeriodo } from '@/componentes/seletor-periodo'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import {
  type Aba,
  type Coluna,
  ETAPA,
  type FiltrosVendas,
  formatarDia,
  formatarQuantidade,
  mesCorrente,
  paraQuery,
  POR_COLUNA,
  primeiroNome,
} from '@/lib/vendas'
import { comOrdem } from '@/lib/vendas-ordem'

import { TelaCotacao } from './cotacao'
import type {
  CartaoCotacao,
  CartaoEntrega,
  CartaoPedido,
  ColunaDados,
  Ficha,
  Kanban,
  Opcoes,
  OpcoesFicha,
  Permissoes,
} from './tipos'

function iniciais(nome: string | null | undefined) {
  const partes = (nome ?? '').trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[1]?.[0] ?? '') : '')).toUpperCase() || '?'
}

/** Lápis azul do canto do cartão: abre a ficha (WFs bTQBP, bTbZy, bTcJT, bTzUJ). */
function BotaoAbrir({ rotulo, aoAbrir }: { rotulo: string; aoAbrir: () => void }) {
  return (
    <button type="button" className="cartao-abrir" aria-label={rotulo} title={rotulo} onClick={aoAbrir}>
      <Icone icone={Pencil} tamanho={18} />
    </button>
  )
}

/** Alterna o detalhe de UM cartão (WFs bTQAy, bTbai, bTiFL0/bTzTz). */
function BotaoDetalhe({ aberto, aoAlternar }: { aberto: boolean; aoAlternar: () => void }) {
  return (
    <button
      type="button"
      className="cartao-detalhe-botao"
      aria-expanded={aberto}
      onClick={aoAlternar}
    >
      {aberto ? 'Menos' : 'Detalhes'}
      <Icone icone={aberto ? ChevronUp : ChevronDown} tamanho={16} />
    </button>
  )
}

// -------------------------------------------------------------------- cartões

function CartaoDeCotacao({
  c,
  expandir,
  aoAbrir,
}: {
  c: CartaoCotacao
  expandir: boolean
  aoAbrir: (aba: Aba) => void
}) {
  const [aberto, setAberto] = useState(false)
  const itens = c.qtd_itens
  const vencedores = c.qtd_vencedores
  const propostas = c.qtd_propostas
  const detalhe = expandir || aberto
  // Soma do banco (v_kanban_cotacoes, db/015); nula sem vencedor.
  const total = c.total_bruto_vencedores

  return (
    <li className="cartao" data-tipo="cotacao" data-arquivado={c.arquivado || undefined}>
      <div className="cartao-topo">
        <Foto url={c.cliente_foto} nome={c.cliente_nome ?? ''} className="cartao-avatar" iniciais={iniciais(c.cliente_nome)} />
        <div className="cartao-principal">
          <strong className="cartao-titulo">
            {c.cliente_nome ?? '—'} - Nº {c.numero}
          </strong>
          <span>
            <b>Vendedor:</b> {primeiroNome(c.vendedor_nome)}
          </span>
          <span>
            <b>Dt Cotação:</b> {formatarData(c.criado_em)}
          </span>
          {total ? (
            <span className="cartao-valor" title="Soma do total bruto dos vencedores">
              <b>Vencedores:</b> {formatarReais(total)}
            </span>
          ) : null}
        </div>
        <div className="cartao-icones">
          <BotaoAbrir rotulo={`Abrir cotação nº ${c.numero}`} aoAbrir={() => aoAbrir('cotacao')} />
          {/* Ícone de proposta: só com ≥1 produto e ≥1 vencedor (ipt contaproduto/contavencedor). */}
          {c.pode_propor ? (
            <button
              type="button"
              className="cartao-propostas"
              aria-label={`Propostas da cotação nº ${c.numero}: ${propostas}`}
              title="Propostas"
              onClick={() => aoAbrir('propostas')}
            >
              <Icone icone={FileText} tamanho={18} />
              <small>{propostas}</small>
            </button>
          ) : null}
        </div>
      </div>
      {c.arquivado ? (
        <span className="selo cartao-motivo">{c.motivo_nome ?? 'Motivo não disponível'}</span>
      ) : null}
      {expandir ? null : <BotaoDetalhe aberto={aberto} aoAlternar={() => setAberto((v) => !v)} />}
      {detalhe ? (
        <ul className="cartao-resumo">
          <li data-icone="carrinho">
            {itens} {itens === 1 ? 'produto' : 'produtos'} no carrinho
          </li>
          <li data-icone="trofeu">
            {vencedores} {vencedores === 1 ? 'produto possui' : 'produtos possuem'} vencedor
          </li>
          <li data-icone="proposta">
            {propostas} {propostas === 1 ? 'proposta' : 'propostas'}
          </li>
        </ul>
      ) : null}
    </li>
  )
}

function CartaoDePedido({
  p,
  expandir,
  aoAbrir,
}: {
  p: CartaoPedido
  expandir: boolean
  aoAbrir: () => void
}) {
  const [aberto, setAberto] = useState(false)
  const concluido = p.todas_concluidas
  const cancelado = p.etapa_id === ETAPA.CANCELADO
  const detalhe = expandir || aberto
  const entregas = [...p.entregas].sort((a, b) =>
    (a.dt_prev_entrega ?? '9999').localeCompare(b.dt_prev_entrega ?? '9999'),
  )

  return (
    <li className="cartao" data-tipo="pedido" data-concluido={concluido || undefined} data-cancelado={cancelado || undefined}>
      <div className="cartao-topo">
        <Foto url={p.cliente_foto} nome={p.cliente_nome ?? ''} className="cartao-avatar" iniciais={iniciais(p.cliente_nome)} />
        <div className="cartao-principal">
          <strong className="cartao-titulo">
            {p.cliente_nome ?? '—'} - Nº {p.numero}
          </strong>
          <span>
            <b>Vendedor:</b> {primeiroNome(p.vendedor_nome)}
          </span>
          <span>
            <b>Dt Pedido:</b> {formatarData(p.criado_em)}
          </span>
          {p.valor_total ? (
            <span className="cartao-valor" title="Soma dos itens da proposta do pedido">
              <b>Valor:</b> {formatarReais(p.valor_total)}
            </span>
          ) : null}
          {cancelado ? (
            <span className="cartao-cancelado">
              <b>Cancelado:</b> {p.motivo_cancelamento || '—'}
            </span>
          ) : null}
          {concluido && !cancelado ? <span className="cartao-concluido">Entregas concluídas</span> : null}
        </div>
        <div className="cartao-icones">
          <BotaoAbrir rotulo={`Abrir pedido nº ${p.numero}`} aoAbrir={aoAbrir} />
        </div>
      </div>
      {expandir ? null : <BotaoDetalhe aberto={aberto} aoAlternar={() => setAberto((v) => !v)} />}
      {detalhe ? (
        entregas.length === 0 ? (
          <p className="cartao-vazio">Nenhuma entrega lançada.</p>
        ) : (
          <ul className="cartao-entregas">
            {entregas.map((e) => (
              <li key={e.id} data-status={e.status_id} data-saiu={e.saiu_entrega || undefined}>
                <span className="pilula">{formatarQuantidade(e.qtd)}</span>
                {formatarDia(e.dt_prev_entrega)} - {e.orcamento?.produto?.nome ?? '—'}
                {e.nf_fornecedor_numero ? ` - NF ${e.nf_fornecedor_numero}` : ''}
              </li>
            ))}
          </ul>
        )
      ) : null}
    </li>
  )
}

function CartaoDeEntrega({
  e,
  concluidos,
  expandir,
  aoAbrir,
}: {
  e: CartaoEntrega
  concluidos: boolean
  expandir: boolean
  aoAbrir: () => void
}) {
  const [aberto, setAberto] = useState(false)
  const detalhe = expandir || aberto
  return (
    <li
      className="cartao"
      data-tipo="entrega"
      data-cancelado={e.status_id === ETAPA.CANCELADO || undefined}
      data-financeiro={e.status_id === ETAPA.FINANCEIRO || undefined}
    >
      <div className="cartao-topo">
        <Foto url={e.cliente_foto} nome={e.cliente_nome ?? ''} className="cartao-avatar" iniciais={iniciais(e.cliente_nome)} />
        <div className="cartao-principal">
          <strong className="cartao-titulo">
            {e.cliente_nome} - Nº {e.numero_entrega ?? '—'} - NF: {e.nf_fornecedor_numero ?? ''}
          </strong>
          <span>
            <b>Vendedor:</b> {primeiroNome(e.vendedor_nome)}
          </span>
          {/* No Bubble o rótulo é "Dt Pedido" e o valor é a data PREVISTA (spec §2.3). */}
          {concluidos && e.dt_entrega ? (
            <span>
              <b>Dt Entrega:</b> {formatarDia(e.dt_entrega)}
            </span>
          ) : (
            <span>
              <b>Prev. entrega:</b> {formatarDia(e.dt_prev_entrega)}
            </span>
          )}
          <span className="cartao-valor">
            <b>Bruto:</b> {formatarReais(e.valor_venda_bruto)}
          </span>
        </div>
        <div className="cartao-icones">
          <BotaoAbrir rotulo={`Abrir pedido nº ${e.numero_entrega ?? ''}`} aoAbrir={aoAbrir} />
        </div>
      </div>
      {expandir ? null : <BotaoDetalhe aberto={aberto} aoAlternar={() => setAberto((v) => !v)} />}
      {detalhe ? (
        <ul className="cartao-entregas">
          <li>
            <span className="pilula">{formatarQuantidade(e.qtd)}</span>
            {formatarDia(e.dt_prev_entrega)} - {e.produto_nome}
          </li>
        </ul>
      ) : null}
    </li>
  )
}

// --------------------------------------------------------------------- coluna

function ColunaKanban<T>({
  id,
  titulo,
  subtitulo,
  dados,
  vazio,
  mostrarMais,
  tentarDeNovo,
  pendente,
  children,
}: {
  id: Coluna
  titulo: string
  subtitulo: string | null
  dados: ColunaDados<T>
  vazio: string
  mostrarMais: () => void
  tentarDeNovo: () => void
  pendente: boolean
  children: React.ReactNode
}) {
  const faltam = dados.total - dados.cartoes.length
  return (
    <section className="coluna" aria-labelledby={`coluna-${id}`} data-teste={`coluna-${id}`}>
      <header className="coluna-cabecalho">
        <h2 id={`coluna-${id}`}>{titulo}</h2>
        {/* Na falha o contador seria "0 cotações" — um número falso ao lado do erro. */}
        {subtitulo && !dados.falhou ? <p>{subtitulo}</p> : null}
      </header>
      <div className="coluna-corpo">
        {dados.falhou ? (
          <div className="aviso coluna-erro" data-tom="erro" role="alert">
            <p>Não foi possível carregar esta coluna.</p>
            <button type="button" className="botao-secundario" disabled={pendente} aria-busy={pendente} onClick={tentarDeNovo}>
              {pendente ? 'Carregando…' : 'Tentar de novo'}
            </button>
          </div>
        ) : dados.cartoes.length === 0 ? (
          <p className="coluna-vazia">{vazio}</p>
        ) : (
          <ol className="coluna-cartoes">{children}</ol>
        )}
        {faltam > 0 ? (
          <button type="button" className="botao-secundario coluna-mais" disabled={pendente} onClick={mostrarMais}>
            Mostrar mais ({Math.min(faltam, POR_COLUNA)} de {faltam.toLocaleString('pt-BR')} restantes)
          </button>
        ) : null}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------- tela

const COLUNA_VAZIA = { cartoes: [], total: 0, falhou: false }
const KANBAN_VAZIO: Kanban = { cotacoes: COLUNA_VAZIA, pedidos: COLUNA_VAZIA, entregas: COLUNA_VAZIA, substituto: COLUNA_VAZIA }

type ChavePilula = 'arquivadas' | 'crescente' | 'expandir' | 'concluidos' | 'cancelados'

/** Na ordem e com os ícones do Bubble (bTaTT, bTaTx, bTaGh, bTfTJ0, bTiVJ). */
const PILULAS: { chave: ChavePilula; rotulo: string; icone: LucideIcon; dica: string }[] = [
  { chave: 'arquivadas', rotulo: 'cotações arquivadas', icone: Archive, dica: 'Exibe só as cotações arquivadas' },
  { chave: 'crescente', rotulo: 'data crescente', icone: ArrowUpNarrowWide, dica: 'Ordena da mais antiga para a mais nova' },
  { chave: 'expandir', rotulo: 'expandir cartões', icone: ChevronsDown, dica: 'Expande todos os cartões' },
  { chave: 'concluidos', rotulo: 'exibe concluídos', icone: Flag, dica: 'Exibe pedidos concluídos' },
  { chave: 'cancelados', rotulo: 'exibe cancelados', icone: CalendarX, dica: 'Exibe pedidos e entregas cancelados' },
]

/** Botão × de limpar um filtro (Icon EZZ, Icon Q, Icon EZZZ do Bubble): só com valor. */
function BotaoLimpar({ rotulo, aoLimpar }: { rotulo: string; aoLimpar: () => void }) {
  return (
    <button type="button" className="vendas-limpar" aria-label={rotulo} title={rotulo} onClick={aoLimpar}>
      <Icone icone={X} tamanho={16} />
    </button>
  )
}

export function TelaVendas({
  filtros,
  crescente,
  kanban: kanbanDoServidor,
  opcoes,
  ficha,
  opcoesFicha,
  usuario,
  permissoes,
}: {
  filtros: FiltrosVendas
  /** pílula "data crescente" (lib/vendas-ordem) */
  crescente: boolean
  /** null com a cotação aberta em tela cheia: o servidor não refaz o quadro coberto */
  kanban: Kanban | null
  opcoes: Opcoes
  ficha: Ficha | null
  opcoesFicha: OpcoesFicha | null
  usuario: { id: string; perfilId: number }
  permissoes: Permissoes
}) {
  // Último quadro recebido: fica atrás da tela cheia enquanto a ficha está aberta.
  const [ultimoKanban, setUltimoKanban] = useState<Kanban>(kanbanDoServidor ?? KANBAN_VAZIO)
  if (kanbanDoServidor && kanbanDoServidor !== ultimoKanban) setUltimoKanban(kanbanDoServidor)
  const kanban = kanbanDoServidor ?? ultimoKanban
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  /**
   * Cotação NOVA aberta: `null` fechada; `'nova'` sem carrinho ainda; o id do rascunho depois do
   * primeiro produto. A mesma instância da tela cheia continua montada quando o rascunho chega
   * pela URL — o que a pessoa escolheu no cabeçalho não se perde.
   */
  const [nova, setNova] = useState<string | null>(null)
  const [numero, setNumero] = useState(filtros.numero)
  const [cliente, setCliente] = useState(filtros.cliente)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Todo o estado do quadro mora na URL (spec §2.2): recarregar, voltar e mandar o link
  // funcionam. A transição mantém o quadro atual na tela enquanto o novo chega.
  function navegar(mudancas: Partial<FiltrosVendas>, ordem = crescente) {
    iniciar(() => {
      router.replace(`/vendas${comOrdem(paraQuery(filtros, mudancas), ordem)}` as Route, { scroll: false })
    })
  }
  /** Mudou filtro (ou a ordem): colunas voltam ao primeiro bloco. */
  function filtrar(mudancas: Partial<FiltrosVendas>, ordem = crescente) {
    navegar({ lim: { cot: 1, ped: 1, ent: 1, sub: 1 }, ...mudancas }, ordem)
  }
  function alternar(chave: ChavePilula) {
    // "concluídos" e "cancelados" mudam a etapa das colunas juntas (bTiWJ/bTiWQ):
    // os dois ligados ao mesmo tempo misturariam critérios, então um desliga o outro.
    if (chave === 'crescente') filtrar({}, !crescente)
    else if (chave === 'concluidos') filtrar({ concluidos: !filtros.concluidos, cancelados: false })
    else if (chave === 'cancelados') filtrar({ cancelados: !filtros.cancelados, concluidos: false })
    else filtrar({ [chave]: !filtros[chave] })
  }
  function limpar(chave: 'numero' | 'cliente') {
    clearTimeout(espera.current)
    if (chave === 'numero') setNumero('')
    else setCliente('')
    filtrar({ [chave]: '' })
  }
  /** Coluna que falhou (timeout no banco): refaz a página no servidor, sem perder a URL. */
  function tentarDeNovo() {
    iniciar(() => router.refresh())
  }
  function digitar(chave: 'numero' | 'cliente', valor: string) {
    if (chave === 'numero') setNumero(valor)
    else setCliente(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => filtrar({ [chave]: valor.trim() }), 400)
  }
  function mais(c: Coluna) {
    navegar({ lim: { ...filtros.lim, [c]: filtros.lim[c] + 1 } })
  }
  function abrir(cotacaoId: string, aba: Aba) {
    navegar({ sel: cotacaoId, aba })
  }

  const nomeEtapa = (id: number) => opcoes.etapas.find((e) => e.id === id)?.nome ?? ''
  const statusEntrega = filtros.cancelados ? ETAPA.CANCELADO : filtros.concluidos ? ETAPA.FINANCEIRO : ETAPA.EM_ENTREGA
  const mes = mesCorrente()
  const noMes = filtros.de === mes.de && filtros.ate === mes.ate
  const plural = (n: number, um: string, varios: string) => `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`

  return (
    <div className="vendas">
      <section className="vendas-filtros" aria-label="Filtros">
        <fieldset className="vendas-periodo">
          <legend>Data criação (Cotação e Pedido)</legend>
          <SeletorPeriodo
            rotulo="Data de criação"
            de={filtros.de}
            ate={filtros.ate}
            onChange={(de, ate) => filtrar({ de, ate })}
            data-teste="filtro-periodo"
          />
          {noMes ? null : (
            <button type="button" className="botao-texto" onClick={() => filtrar({ de: mes.de, ate: mes.ate })}>
              Mês atual
            </button>
          )}
        </fieldset>

        {/* Só Diretor e Gerente escolhem o vendedor; para os outros ele é travado no próprio
            usuário no SERVIDOR (bTiYV) e a RLS garante — aqui o campo nem aparece. */}
        {permissoes.filtrarVendedor ? (
          <div className="vendas-limpavel" data-cheio={filtros.vendedor ? true : undefined}>
            <label className="campo">
              <span>Vendedor</span>
              <select
                value={filtros.vendedor ?? ''}
                onChange={(e) => filtrar({ vendedor: e.target.value || null })}
                data-teste="filtro-vendedor"
              >
                <option value="">Todos</option>
                {opcoes.vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </label>
            {filtros.vendedor ? <BotaoLimpar rotulo="Limpar vendedor" aoLimpar={() => filtrar({ vendedor: null })} /> : null}
          </div>
        ) : null}

        <div className="vendas-limpavel" data-cheio={numero ? true : undefined}>
          <label className="campo">
            <span>Número pedido</span>
            <input
              inputMode="numeric"
              value={numero}
              onChange={(e) => digitar('numero', e.target.value.replace(/\D/g, ''))}
              placeholder="Nº"
              maxLength={12}
            />
          </label>
          {numero ? <BotaoLimpar rotulo="Limpar número" aoLimpar={() => limpar('numero')} /> : null}
        </div>

        <div className="vendas-limpavel" data-cheio={cliente ? true : undefined}>
          <label className="campo">
            <span>Cliente</span>
            <input
              type="search"
              value={cliente}
              onChange={(e) => digitar('cliente', e.target.value)}
              placeholder="Nome do cliente"
              spellCheck={false}
              data-teste="filtro-cliente"
            />
          </label>
          {cliente ? <BotaoLimpar rotulo="Limpar cliente" aoLimpar={() => limpar('cliente')} /> : null}
        </div>

        <div className="vendas-pilulas" role="group" aria-label="Exibição">
          {PILULAS.map((p) => (
            <button
              key={p.chave}
              type="button"
              className="pilula-filtro"
              aria-pressed={p.chave === 'crescente' ? crescente : filtros[p.chave]}
              title={p.dica}
              onClick={() => alternar(p.chave)}
            >
              <Icone icone={p.icone} tamanho={16} />
              {p.rotulo}
            </button>
          ))}
        </div>

        <button type="button" className="botao-primario vendas-nova" onClick={() => setNova('nova')} data-teste="nova-cotacao">
          <Icone icone={Plus} tamanho={18} />
          Cotação
        </button>
      </section>

      <div className="kanban" aria-busy={pendente} data-pendente={pendente || undefined} data-teste="kanban">
        <ColunaKanban
          id="cot"
          titulo={nomeEtapa(ETAPA.COTACAO) || 'Cotação'}
          subtitulo={`${plural(kanban.cotacoes.total, 'cotação', 'cotações')}${filtros.arquivadas ? ' arquivadas' : ''}`}
          dados={kanban.cotacoes}
          vazio={filtros.arquivadas ? 'Nenhuma cotação arquivada no período.' : 'Nenhuma cotação no período.'}
          mostrarMais={() => mais('cot')}
          tentarDeNovo={tentarDeNovo}
          pendente={pendente}
        >
          {kanban.cotacoes.cartoes.map((c) => (
            <CartaoDeCotacao key={c.id} c={c} expandir={filtros.expandir} aoAbrir={(aba) => abrir(c.id, aba)} />
          ))}
        </ColunaKanban>

        <ColunaKanban
          id="ped"
          titulo={nomeEtapa(ETAPA.PEDIDO) || 'Pedido'}
          subtitulo={`${plural(kanban.pedidos.total, 'pedido', 'pedidos')}${
            filtros.cancelados ? ' cancelados' : filtros.concluidos ? ' finalizados' : ''
          }`}
          dados={kanban.pedidos}
          vazio="Nenhum pedido no período."
          mostrarMais={() => mais('ped')}
          tentarDeNovo={tentarDeNovo}
          pendente={pendente}
        >
          {kanban.pedidos.cartoes.map((p) => (
            <CartaoDePedido key={p.id} p={p} expandir={filtros.expandir} aoAbrir={() => abrir(p.cotacao_id, 'pedidos')} />
          ))}
        </ColunaKanban>

        <ColunaKanban
          id="ent"
          titulo="Entregas Próprias"
          subtitulo={`${plural(kanban.entregas.total, 'entrega', 'entregas')} · ${nomeEtapa(statusEntrega)}`}
          dados={kanban.entregas}
          vazio="Nenhuma entrega que saiu no período."
          mostrarMais={() => mais('ent')}
          tentarDeNovo={tentarDeNovo}
          pendente={pendente}
        >
          {kanban.entregas.cartoes.map((e) => (
            <CartaoDeEntrega
              key={e.id}
              e={e}
              concluidos={filtros.concluidos}
              expandir={filtros.expandir}
              aoAbrir={() => abrir(e.cotacao_id, 'pedidos')}
            />
          ))}
        </ColunaKanban>

        <ColunaKanban
          id="sub"
          titulo="Entregas Substituto"
          subtitulo={kanban.substituto.total > 0 ? plural(kanban.substituto.total, 'entrega', 'entregas') : null}
          dados={kanban.substituto}
          vazio={
            usuario.perfilId > 2 || filtros.vendedor
              ? 'Nenhuma entrega de férias de colega.'
              : 'Nenhuma entrega com vendedor substituto.'
          }
          mostrarMais={() => mais('sub')}
          tentarDeNovo={tentarDeNovo}
          pendente={pendente}
        >
          {kanban.substituto.cartoes.map((e) => (
            <CartaoDeEntrega
              key={e.id}
              e={e}
              concluidos={false}
              expandir={filtros.expandir}
              aoAbrir={() => abrir(e.cotacao_id, 'pedidos')}
            />
          ))}
        </ColunaKanban>
      </div>

      {nova ? (
        <TelaCotacao
          key="nova"
          ficha={ficha && ficha.cotacao.id === nova ? ficha : null}
          abaInicial="cotacao"
          opcoes={opcoes}
          opcoesFicha={ficha && ficha.cotacao.id === nova ? opcoesFicha : null}
          permissoes={permissoes}
          aoCriarRascunho={(id) => {
            setNova(id)
            abrir(id, 'cotacao')
          }}
          aoFechar={() => {
            setNova(null)
            navegar({ sel: null, aba: 'cotacao' })
          }}
        />
      ) : ficha && opcoesFicha ? (
        <TelaCotacao
          // key: trocar de cotação remonta a tela e zera formulários e aba.
          key={ficha.cotacao.id}
          ficha={ficha}
          abaInicial={filtros.aba}
          opcoes={opcoes}
          opcoesFicha={opcoesFicha}
          permissoes={permissoes}
          aoCriarRascunho={() => undefined}
          aoFechar={() => navegar({ sel: null, aba: 'cotacao' })}
        />
      ) : filtros.sel ? (
        <p className="aviso vendas-aviso" role="alert">
          Esta cotação não existe ou não é sua.{' '}
          <button type="button" className="vendas-link" onClick={() => navegar({ sel: null, aba: 'cotacao' })}>
            Fechar
          </button>
        </p>
      ) : null}
    </div>
  )
}
