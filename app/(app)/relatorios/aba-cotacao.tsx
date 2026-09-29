'use client'

import {
  Archive,
  ArrowDown,
  ArrowUp,
  BadgeDollarSign,
  BarChart3,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  Filter,
  FolderClosed,
  FolderOpen,
  Hash,
  Inbox,
  Info,
  Layers,
  LineChart,
  ListChecks,
  ListOrdered,
  Medal,
  PieChart,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Table2,
  Target,
  TrendingUp,
  Trophy,
  TriangleAlert,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { type FormEvent, useState } from 'react'

import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import {
  anosDisponiveis,
  destaquesCotacao,
  MESES_ABREV,
  MESES_NOME,
  nomeCurto,
  type PainelCotacao,
  participacao,
  percentualInteiro,
  percentualUmaCasa,
  pontosPercentuais,
  totalPaginas,
  umaCasa,
} from '@/lib/relatorios-paineis'

import { BarrasHorizontais, Funil, LinhaArea, Rosca } from './graficos'
import { CabecalhoRelatorio, Cartao, Kpi, LegendaLista, Paginacao, Secao, Vazio } from './pecas'
import type { CotacaoDetalhe, Vendedor } from './tipos'

export type FiltroCotacao = { ano: number; mes: number; arquivado: 'sim' | 'nao' | null; vendedor: string | null }

const COR_MOTIVO = (id: number | null) => (id === null ? 'var(--graf-neutro)' : `var(--graf-cat-${((id - 1) % 8) + 1})`)

export function AbaCotacao({
  painel,
  detalhe,
  totalDetalhe,
  pagina,
  porPagina,
  filtro,
  anoCorrente,
  vendedores,
  veTodos,
  geradoEm,
  pendente,
  aoAplicar,
  aoPaginar,
  aoAtualizar,
}: {
  painel: PainelCotacao | null
  detalhe: CotacaoDetalhe[]
  totalDetalhe: number
  pagina: number
  porPagina: number
  filtro: FiltroCotacao
  anoCorrente: number
  vendedores: Vendedor[]
  veTodos: boolean
  geradoEm: string
  pendente: boolean
  aoAplicar: (f: FiltroCotacao) => void
  aoPaginar: (p: number) => void
  aoAtualizar: () => void
}) {
  const [rascunho, setRascunho] = useState(filtro)
  const [verRanking, setVerRanking] = useState(false)

  function aplicar(e: FormEvent) {
    e.preventDefault()
    aoAplicar(rascunho)
  }

  const k = painel?.kpis
  const vend = painel?.vendedores ?? []
  const destaque = destaquesCotacao(vend)
  const hist = painel?.historico ?? []
  const atual = hist[filtro.mes - 1]
  const anterior = hist[filtro.mes - 2]
  const pp = atual && anterior ? pontosPercentuais(atual.conversao, anterior.conversao) : null

  const total = k?.total ?? 0
  const emCotacao = k?.em_cotacao ?? 0
  const pedido = k?.virou_pedido ?? 0

  const convVend = vend.filter((v) => v.ativas > 0).slice(0, 8)
  const maxConv = Math.min(1, Math.ceil((Math.max(0, ...convVend.map((v) => v.conversao)) + 0.1) * 10) / 10)
  const porVolume = [...vend].sort((a, b) => b.total - a.total).slice(0, 10)
  const motivos = painel?.motivos ?? []
  const totalArq = k?.arquivadas ?? 0 // o total dos motivos é o KPI "Arquivadas" (mesma base)

  return (
    <div className="rel-painel">
      <CabecalhoRelatorio
        Icone={FileText}
        titulo="Relatório de Cotações"
        subtitulo="Análise completa das cotações do mês"
        geradoEm={geradoEm}
        atualizando={pendente}
        aoAtualizar={aoAtualizar}
      />

      <form className="rel-filtros-cartao" onSubmit={aplicar} aria-label="Filtros do relatório de cotações">
        <span className="rel-filtros-marca" aria-hidden>
          <SlidersHorizontal size={17} />
          Filtros
        </span>
        <label className="campo rel-campo">
          <span>
            <Calendar size={12} aria-hidden /> Mês
          </span>
          <select value={rascunho.mes} onChange={(e) => setRascunho({ ...rascunho, mes: Number(e.target.value) })}>
            {MESES_NOME.map((n, i) => (
              <option key={n} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="campo rel-campo">
          <span>
            <CalendarDays size={12} aria-hidden /> Ano
          </span>
          <select value={rascunho.ano} onChange={(e) => setRascunho({ ...rascunho, ano: Number(e.target.value) })}>
            {anosDisponiveis(anoCorrente).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="campo rel-campo">
          <span>
            <Archive size={12} aria-hidden /> Arquivado
          </span>
          <select
            value={rascunho.arquivado ?? ''}
            onChange={(e) => setRascunho({ ...rascunho, arquivado: (e.target.value || null) as FiltroCotacao['arquivado'] })}
          >
            <option value="">Todos</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </label>
        {veTodos ? (
          <label className="campo rel-campo">
            <span>
              <UserRound size={12} aria-hidden /> Vendedor
            </span>
            <select value={rascunho.vendedor ?? ''} onChange={(e) => setRascunho({ ...rascunho, vendedor: e.target.value || null })}>
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button type="submit" className="botao-primario rel-botao-icone" disabled={pendente} aria-busy={pendente}>
          <Search size={16} aria-hidden />
          Aplicar filtros
        </button>
        <div className="rel-definicao">
          <Info size={16} aria-hidden />
          <div>
            <b>Taxa de Conversão</b>
            <span>Pedidos ÷ Cotações Ativas (cotações não arquivadas)</span>
          </div>
        </div>
      </form>

      <p className="rel-status" data-tom={total > 0 ? 'ok' : 'alerta'} role="status">
        {total > 0 ? <CheckCircle2 size={16} aria-hidden /> : <TriangleAlert size={16} aria-hidden />}
        {total > 0
          ? `${total} cotação(ões) em ${MESES_NOME[filtro.mes - 1]} de ${filtro.ano}.`
          : 'Nenhum registro encontrado para os filtros selecionados.'}
      </p>

      <div className="rel-kpis rel-kpis-5 rel-kpis-tingidos">
        <Kpi Icone={ClipboardList} rotulo="Total de Cotações" valor={total} apoio="no período selecionado" />
        <Kpi Icone={FileText} rotulo="Em Cotação" valor={emCotacao} apoio="etapa: Cotação" />
        <Kpi Icone={ShoppingCart} tom="verde" rotulo="Virou Pedido" valor={pedido} apoio="etapa: Pedir" />
        <Kpi Icone={FolderClosed} tom="vermelho" rotulo="Arquivadas" valor={k?.arquivadas ?? 0} apoio="cotações arquivadas" />
        <Kpi
          Icone={TrendingUp}
          tom="roxo"
          rotulo="Taxa de Conversão"
          valor={percentualInteiro(k?.taxa_conversao ?? null)}
          apoio="cotações ativas que viraram pedido"
          ajuda="Pedidos ÷ Cotações Ativas (não arquivadas)"
        />
      </div>

      <Secao id="rel-sec-ind" Icone={Medal} titulo="Indicadores de performance">
        <Cartao
          Icone={Trophy}
          titulo="Melhor Vendedor do Mês"
          acao={
            <button type="button" className="rel-etiqueta rel-etiqueta-botao" aria-expanded={verRanking} onClick={() => setVerRanking((v) => !v)}>
              {verRanking ? <X size={12} aria-hidden /> : <ListOrdered size={12} aria-hidden />}
              {verRanking ? 'Ocultar ranking' : 'Ver ranking'}
            </button>
          }
        >
          <div className="rel-podio">
            <div className="rel-pod" data-tom="verde">
              <span className="rel-pod-cat">
                <BadgeDollarSign size={14} aria-hidden /> Maior faturamento
              </span>
              <b>{destaque.faturamento ? nomeCurto(destaque.faturamento.nome) : '—'}</b>
              <span>{destaque.faturamento ? formatarReais(destaque.faturamento.faturamento) : 'sem dados de valor'}</span>
            </div>
            <div className="rel-pod" data-tom="azul">
              <span className="rel-pod-cat">
                <Layers size={14} aria-hidden /> Maior volume de cotações
              </span>
              <b>{destaque.volume ? nomeCurto(destaque.volume.nome) : '—'}</b>
              <span>{destaque.volume ? `${destaque.volume.total} cotações` : '—'}</span>
            </div>
            <div className="rel-pod" data-tom="roxo">
              <span className="rel-pod-cat">
                <Target size={14} aria-hidden /> Melhor conversão
              </span>
              <b>{destaque.conversao ? nomeCurto(destaque.conversao.nome) : '—'}</b>
              <span>
                {destaque.conversao
                  ? `${percentualUmaCasa(destaque.conversao.conversao)} (${destaque.conversao.pedidos}/${destaque.conversao.ativas})`
                  : '—'}
              </span>
            </div>
          </div>
          {verRanking ? (
            <div className="rel-rolagem rel-ranking">
              <table className="rel-tabela-simples">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Vendedor</th>
                    <th scope="col" className="valor">Cotações</th>
                    <th scope="col" className="valor">Ativas</th>
                    <th scope="col" className="valor">Pedidos</th>
                    <th scope="col" className="valor">Conversão</th>
                    <th scope="col" className="valor">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {vend.map((v, i) => (
                    <tr key={v.vendedor_id ?? `sem-${i}`}>
                      <td>
                        <span className="rel-posicao" data-topo={i === 0 || undefined}>
                          {i + 1}
                        </span>
                      </td>
                      <th scope="row">{nomeCurto(v.nome)}</th>
                      <td className="valor">{v.total}</td>
                      <td className="valor">{v.ativas}</td>
                      <td className="valor">{v.pedidos}</td>
                      <td className="valor rel-destaque-roxo">{percentualUmaCasa(v.conversao)}</td>
                      <td className="valor">{Number(v.faturamento) > 0 ? formatarReais(v.faturamento) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Cartao>

        <div className="rel-grade-3">
          <Kpi
            Icone={DollarSign}
            tom="verde"
            rotulo="Ticket Médio"
            valor={k?.ticket_medio ? formatarReais(k.ticket_medio) : '—'}
            apoio="valor médio por pedido fechado"
          />
          <Kpi
            Icone={Clock}
            rotulo="Tempo Médio de Fechamento"
            valor={k?.tempo_medio_dias === null || k?.tempo_medio_dias === undefined ? '—' : `${umaCasa(k.tempo_medio_dias)} dias`}
            apoio="cotação → primeiro pedido"
          />
          <Kpi
            Icone={TrendingUp}
            tom="roxo"
            rotulo="Conversão vs Mês Anterior"
            valor={atual ? percentualInteiro(atual.conversao) : '—'}
            ajuda="Conversão do mês escolhido comparada ao mês anterior"
            apoio={
              atual && anterior && pp !== null ? (
                <>
                  <span className="rel-variacao" data-sinal={pp >= 0 ? 'mais' : 'menos'}>
                    {pp >= 0 ? <ArrowUp size={12} aria-hidden /> : <ArrowDown size={12} aria-hidden />}
                    {Math.abs(pp)} p.p.
                  </span>
                  {' · '}
                  {MESES_NOME[filtro.mes - 2]}: {percentualInteiro(anterior.conversao)}
                </>
              ) : (
                'sem mês anterior para comparar'
              )
            }
          />
        </div>
      </Secao>

      <Secao id="rel-sec-graf" Icone={PieChart} titulo="Análise gráfica">
        <div className="rel-graficos-4">
          <Cartao Icone={PieChart} titulo="Status das Cotações" subtitulo="Distribuição por etapa" etiqueta={{ Icone: PieChart, texto: 'Rosca' }}>
            <div className="rel-rosca-corpo">
              <Rosca
                descricao={`Em cotação ${emCotacao}, virou pedido ${pedido}`}
                fatias={[
                  { chave: 'cot', nome: 'Em Cotação', valor: emCotacao, cor: 'var(--graf-1)' },
                  { chave: 'ped', nome: 'Virou Pedido', valor: pedido, cor: 'var(--graf-pedido)' },
                ]}
                formatar={(f) => `${f.valor} (${participacao(f.valor, total)})`}
              />
              <div className="rel-rosca-lado">
                <LegendaLista
                  itens={[
                    { chave: 'cot', cor: 'var(--graf-1)', nome: 'Em Cotação', meta: `${emCotacao} (${participacao(emCotacao, total)})` },
                    { chave: 'ped', cor: 'var(--graf-pedido)', nome: 'Virou Pedido', meta: `${pedido} (${participacao(pedido, total)})` },
                  ]}
                />
                <div className="rel-total-caixa">
                  <span>Total</span>
                  <b>{total}</b>
                </div>
              </div>
            </div>
          </Cartao>

          <Cartao Icone={Filter} titulo="Funil de Conversão" subtitulo="Visão geral do processo" etiqueta={{ Icone: Filter, texto: 'Funil' }}>
            <div className="rel-funil">
              <Funil
                descricao={`Cotações ${total}, em cotação ${emCotacao}, virou pedido ${pedido}`}
                niveis={[
                  { nome: 'Cotações', valor: total, cor: 'var(--graf-2)' },
                  { nome: 'Em Cotação', valor: emCotacao, cor: 'var(--graf-1)' },
                  { nome: 'Virou Pedido', valor: pedido, cor: 'var(--graf-pedido)' },
                ]}
              />
              <ul className="rel-funil-legenda">
                {[
                  ['Cotações', total],
                  ['Em Cotação', emCotacao],
                  ['Virou Pedido', pedido],
                ].map(([n, v]) => (
                  <li key={n}>
                    <b>{n}</b>
                    <small>{participacao(Number(v), total)}</small>
                  </li>
                ))}
              </ul>
            </div>
            <p className="rel-rodape-grafico">
              Conversão: <b>{participacao(pedido, total)}</b> das cotações viraram pedido
            </p>
          </Cartao>

          <Cartao
            Icone={Trophy}
            titulo="Conversão por Vendedor"
            subtitulo="Taxa (pedidos ÷ cotações ativas)"
            etiqueta={{ Icone: BarChart3, texto: 'Barras' }}
          >
            {convVend.length ? (
              <BarrasHorizontais
                descricao="Conversão por vendedor"
                maximo={maxConv}
                larguraNome={118}
                formatar={(v) => percentualInteiro(v)}
                dados={convVend.map((v, i) => ({
                  chave: v.vendedor_id ?? `v${i}`,
                  nome: nomeCurto(v.nome),
                  valor: v.conversao,
                  cor: i === 0 ? 'var(--graf-pedido)' : 'var(--graf-1)',
                  dica: `Conversão (${v.pedidos}/${v.ativas})`,
                }))}
              />
            ) : (
              <Vazio Icone={BarChart3} texto="Sem cotações ativas no mês." />
            )}
            <p className="rel-rodape-grafico">
              Média geral: <b>{percentualInteiro(k?.taxa_conversao ?? null)}</b>
            </p>
          </Cartao>

          <Cartao
            Icone={LineChart}
            titulo="Conversão ao Longo do Tempo"
            subtitulo={`Histórico mensal da taxa em ${filtro.ano}`}
            etiqueta={{ Icone: LineChart, texto: 'Linha' }}
          >
            <LinhaArea
              descricao={`Conversão mensal de janeiro a ${MESES_NOME[filtro.mes - 1]}`}
              formatar={(v) => percentualInteiro(v)}
              dados={hist.map((h) => ({
                rotulo: MESES_ABREV[h.mes - 1] ?? String(h.mes),
                valor: h.conversao,
                dica: `Conversão (${h.pedidos}/${h.ativas})`,
              }))}
            />
            <p className="rel-rodape-grafico">
              {MESES_NOME[filtro.mes - 1]}: <b>{atual ? percentualInteiro(atual.conversao) : '0%'}</b>
              {anterior && pp !== null ? (
                <>
                  {' | '}
                  {MESES_NOME[filtro.mes - 2]}: {percentualInteiro(anterior.conversao)}{' '}
                  <span className="rel-variacao" data-sinal={pp >= 0 ? 'mais' : 'menos'}>
                    {pp >= 0 ? <ArrowUp size={12} aria-hidden /> : <ArrowDown size={12} aria-hidden />}
                    {Math.abs(pp)} p.p.
                  </span>
                </>
              ) : null}
            </p>
          </Cartao>
        </div>

        <div className="rel-graficos-2">
          <Cartao
            Icone={FolderOpen}
            titulo="Motivo de Arquivamento"
            subtitulo="Somente cotações arquivadas"
            etiqueta={{ Icone: PieChart, texto: 'Pizza' }}
          >
            <div className="rel-rosca-corpo">
              <Rosca
                cheia
                descricao={`${totalArq} cotações arquivadas por motivo`}
                fatias={motivos.map((m) => ({
                  chave: String(m.motivo_id ?? 'sem'),
                  nome: m.motivo,
                  valor: m.qtd,
                  cor: COR_MOTIVO(m.motivo_id),
                }))}
                formatar={(f) => `${f.valor} (${participacao(f.valor, totalArq)})`}
              />
              <div className="rel-rosca-lado">
                <LegendaLista
                  itens={
                    motivos.length
                      ? motivos.map((m) => ({
                          chave: String(m.motivo_id ?? 'sem'),
                          cor: COR_MOTIVO(m.motivo_id),
                          nome: m.motivo,
                          meta: `${m.qtd} (${participacao(m.qtd, totalArq)})`,
                        }))
                      : [{ chave: 'nada', cor: 'var(--graf-vazio)', nome: 'Sem arquivamentos', meta: 'no período' }]
                  }
                />
                <div className="rel-total-caixa">
                  <span>Total arquivadas</span>
                  <b>{totalArq}</b>
                </div>
              </div>
            </div>
          </Cartao>

          <Cartao
            Icone={Users}
            titulo="Cotações por Vendedor"
            subtitulo="Volume no período (top 10)"
            etiqueta={{ Icone: BarChart3, texto: 'Horizontal' }}
          >
            <div className="rel-barras-lado">
              {porVolume.length ? (
                <BarrasHorizontais
                  descricao="Cotações por vendedor"
                  formatar={(v) => String(Math.round(v))}
                  dados={porVolume.map((v, i) => ({
                    chave: v.vendedor_id ?? `v${i}`,
                    nome: nomeCurto(v.nome),
                    valor: v.total,
                    dica: 'Cotações',
                  }))}
                />
              ) : (
                <Vazio Icone={Users} texto="Nenhuma cotação no mês." />
              )}
              <div className="rel-total-caixa">
                <span>Total de cotações</span>
                <b>{total}</b>
              </div>
            </div>
          </Cartao>
        </div>
      </Secao>

      <Secao id="rel-sec-tab" Icone={Table2} titulo="Detalhamento">
        <div className="rel-tabela-cartao">
          <div className="rel-tabela-topo">
            <h4>
              <ListChecks size={16} aria-hidden /> Cotações do Período
            </h4>
            <span className="rel-contagem">{totalDetalhe} registro(s)</span>
          </div>
          <div className="rel-rolagem">
            <table className="rel-tabela-dados">
              <thead>
                <tr>
                  <th scope="col">
                    <Hash size={12} aria-hidden />
                    <span className="so-leitor">Linha</span>
                  </th>
                  <th scope="col">
                    <FileText size={12} aria-hidden /> Nº Cotação
                  </th>
                  <th scope="col">
                    <Layers size={12} aria-hidden /> Etapa
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <Archive size={12} aria-hidden /> Arquivado
                  </th>
                  <th scope="col">Motivo Arq.</th>
                  <th scope="col">
                    <Calendar size={12} aria-hidden /> Validade
                  </th>
                  <th scope="col">
                    <UserRound size={12} aria-hidden /> Vendedor
                  </th>
                </tr>
              </thead>
              <tbody>
                {detalhe.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <Vazio Icone={Inbox} texto="Nenhum registro encontrado." />
                    </td>
                  </tr>
                ) : (
                  detalhe.map((c, i) => {
                    const ehPedido = c.etapa_id === 2
                    return (
                      <tr key={c.id}>
                        <td className="rel-num-linha">{(pagina - 1) * porPagina + i + 1}</td>
                        <th scope="row">
                          <Link href={`/vendas?numero=${c.numero}&sel=${c.id}` as Route} className="rel-link">
                            {c.numero}
                          </Link>
                        </th>
                        <td>
                          <span className="rel-marca" data-tom={ehPedido ? 'verde' : 'azul'}>
                            {ehPedido ? <ShoppingCart size={11} aria-hidden /> : <FileText size={11} aria-hidden />}
                            {c.etapa?.nome ?? '—'}
                          </span>
                        </td>
                        <td className="rel-suave">{c.status?.nome ?? '—'}</td>
                        <td>
                          <span className="rel-marca" data-tom={c.arquivado ? 'vermelho' : 'verde'}>
                            {c.arquivado ? <FolderClosed size={11} aria-hidden /> : <FolderOpen size={11} aria-hidden />}
                            {c.arquivado ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="rel-suave">{c.motivo?.nome ?? '—'}</td>
                        <td className="rel-suave">{c.data_validade ? formatarData(c.data_validade) : '—'}</td>
                        <td>
                          <span className="rel-vendedor">
                            <UserRound size={12} aria-hidden />
                            {c.vendedor ? nomeCurto(c.vendedor.nome) : 'Não informado'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <Paginacao atual={pagina} total={totalPaginas(totalDetalhe, porPagina)} aoIr={aoPaginar} />
        </div>
      </Secao>
    </div>
  )
}
