'use client'

import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ListChecks,
  Lock,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

import { Foto } from '@/componentes/foto'
import { SeletorPeriodo } from '@/componentes/seletor-periodo'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import {
  type FiltrosMetas,
  faixaAtingimento,
  formatarPercentual,
  larguraBarra,
  limitesDoMes,
  META_COLETIVA_PADRAO,
  nomeDoMes,
  paraQueryMetas,
  somarMeses,
} from '@/lib/metas'
import { type EstiloPodio, nomeTitulo } from '@/lib/metas-podio'
import type { LinhaAnalise } from '@/lib/metas-relatorios'
import { iniciais, nomeCurto, ordenarRanking, razaoExata } from '@/lib/metas-painel'

import { AnaliseEntregas } from './analise-entregas'
import { DetalheEntregas } from './detalhe-entregas'
import { DialogoCancelar, DialogoFechar, DialogoMeta, DialogoNiveis } from './dialogo'
import { Podio } from './podio'
import { RelatorioAnual } from './relatorio-anual'
import type {
  Coletivo,
  HistoricoNivel,
  LinhaMeta,
  LinhaRanking,
  Nivel,
  Permissoes,
  Vendedor,
} from './tipos'

const TIPOS: Record<number, string> = { 1: 'Regular', 2: 'Substituição' }

type Aberto =
  | { tipo: 'meta'; linha: LinhaMeta | null }
  | { tipo: 'fechar'; linha: LinhaMeta }
  | { tipo: 'cancelar'; linha: LinhaMeta }
  | { tipo: 'niveis' }
  | { tipo: 'entregas'; linha: LinhaMeta }
  | null

// ------------------------------------------------------------------ peças

/**
 * Anel de progresso (medidor de UMA razão): trilho neutro, arco na cor da faixa do
 * `Progress-Bar A` (bTvpx), número no centro em tinta de texto — a cor nunca é a única pista.
 * Satura em 100% como a barra do Bubble; o número mostra o valor real (ex.: 102%).
 */
function Anel({
  razao,
  tamanho,
  casas = 0,
  rotulo,
}: {
  razao: string | null
  tamanho: 'p' | 'g'
  casas?: number
  rotulo: string
}) {
  const r = 42
  const volta = 2 * Math.PI * r
  const cheio = (larguraBarra(razao) / 100) * volta
  const texto = formatarPercentual(razao, casas)
  return (
    <span className="mt-anel" data-tamanho={tamanho} data-faixa={faixaAtingimento(razao)} role="img" aria-label={`${rotulo}: ${texto}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="mt-anel-trilho" cx="50" cy="50" r={r} />
        {cheio > 0 ? (
          <circle
            className="mt-anel-arco"
            cx="50"
            cy="50"
            r={r}
            strokeDasharray={`${cheio} ${volta}`}
            transform="rotate(-90 50 50)"
          />
        ) : null}
      </svg>
      <strong className="mt-anel-num" aria-hidden="true">
        {texto}
      </strong>
    </span>
  )
}

function Avatar({ v, nome, tamanho }: { v: Vendedor | undefined; nome: string; tamanho: 'p' | 'm' | 'g' }) {
  return <Foto url={v?.foto} nome={nome} iniciais={iniciais(nome)} className={`mt-avatar mt-avatar-${tamanho}`} />
}

// ------------------------------------------------------------------ equipe

function CartaoEquipe({ c }: { c: Coletivo }) {
  const razao = razaoExata(c.faturado, c.metaColetiva)
  const d = c.metaDiaria
  return (
    <section className="mt-equipe" aria-labelledby="mt-equipe-titulo" data-teste="coletivo">
      <div className="mt-equipe-cabeca">
        <span className="mt-equipe-icone" aria-hidden="true">
          <Users />
        </span>
        <h2 id="mt-equipe-titulo">Meta da equipe</h2>
      </div>
      <div className="mt-equipe-corpo">
        <dl className="mt-equipe-numeros">
          <div>
            <dt>Meta</dt>
            <dd className="mt-num">{formatarReais(c.metaColetiva)}</dd>
          </div>
          <div>
            <dt>Faturado</dt>
            <dd className="mt-num" data-destaque="">
              {formatarReais(c.faturado)}
            </dd>
          </div>
          <div>
            <dt>Meta diária</dt>
            <dd className="mt-num" data-teste="meta-diaria">
              {d.estado === 'aberta' ? (
                <>
                  {formatarReais(d.valor)}
                  <small>
                    {d.dias} {d.dias === 1 ? 'dia útil restante' : 'dias úteis restantes'}
                  </small>
                </>
              ) : d.estado === 'atingida' ? (
                <span className="mt-ok">Meta atingida</span>
              ) : d.estado === 'encerrada' ? (
                <span className="mt-alerta">Meta não atingida</span>
              ) : (
                '—'
              )}
            </dd>
          </div>
        </dl>
        <Anel razao={razao} tamanho="g" casas={1} rotulo="Atingimento da meta da equipe" />
        <ul className="mt-equipe-meses" aria-label="Vendas dos 3 meses anteriores">
          {c.meses.map((m) => (
            <li key={m.mes}>
              <span>{nomeDoMes(m.mes).split('/')[0]}</span>
              <strong className="mt-num">{formatarReais(m.vendas)}</strong>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-nota">
        Meta = média dos 3 meses anteriores fechados × {META_COLETIVA_PADRAO.multiplicador.replace('.', ',')}, piso de{' '}
        {formatarReais(META_COLETIVA_PADRAO.piso)}. Meta diária = o que falta ÷ dias úteis restantes.
      </p>
    </section>
  )
}

// ------------------------------------------------------------------ ranking

function Ranking({
  ranking,
  vendedores,
}: {
  ranking: LinhaRanking[]
  vendedores: Map<string, Vendedor>
}) {
  const ordenado = ordenarRanking(ranking)
  const variasCompetencias = new Set(ranking.map((r) => r.competencia)).size > 1
  return (
    <section className="mt-ranking" aria-labelledby="mt-ranking-titulo" data-teste="ranking">
      <h2 id="mt-ranking-titulo">Ranking do período</h2>
      {ordenado.length === 0 ? (
        <p className="mt-vazio-p">Nenhuma meta no período.</p>
      ) : (
        <ol className="mt-ranking-lista">
          {ordenado.map((r) => {
            const v = vendedores.get(r.vendedor_id)
            const nome = v?.nome ?? 'Vendedor'
            return (
              <li
                key={r.meta_mensal_id}
                className="mt-ranking-item"
                data-pos={r.tipo_meta_id === 1 && r.posicao <= 3 ? r.posicao : undefined}
                data-teste={`ranking-${r.tipo_meta_id}`}
              >
                <span className="mt-ranking-pos" aria-label={`${r.posicao}º lugar`}>
                  {r.posicao}º
                </span>
                <Avatar v={v} nome={nome} tamanho="m" />
                <span className="mt-ranking-quem">
                  <strong title={nome}>{nomeTitulo(nomeCurto(nome))}</strong>
                  <small>
                    {TIPOS[r.tipo_meta_id]}
                    {variasCompetencias ? ` · ${nomeDoMes(r.competencia)}` : ''}
                    {r.fechada ? ' · fechada' : ''}
                  </small>
                </span>
                <strong className="mt-ranking-pct mt-num" data-faixa={faixaAtingimento(r.percentual)}>
                  {formatarPercentual(r.percentual)}
                </strong>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

// ------------------------------------------------------------------ tabela

function LinhaTabela({
  l,
  v,
  nome,
  nivel,
  mostrarMes,
  permissoes,
  aoAbrir,
}: {
  l: LinhaMeta
  v: Vendedor | undefined
  nome: string
  nivel: Nivel | undefined
  mostrarMes: boolean
  permissoes: Permissoes
  aoAbrir: (a: Aberto) => void
}) {
  return (
    <tr data-fechada={l.fechada || undefined} data-teste="linha-meta">
      <th scope="row">
        <span className="mt-cel-vendedor">
          <Avatar v={v} nome={nome} tamanho="p" />
          <span>
            <strong>{nome}</strong>
            <small>
              {nivel?.nome ?? 'Sem nível'}
              {mostrarMes ? ` · ${nomeDoMes(l.competencia)}` : ''}
            </small>
          </span>
        </span>
      </th>
      <td>
        <strong className="mt-num">{formatarReais(l.valor_meta)}</strong>
        <small className="mt-tipo">{TIPOS[l.tipo_meta_id]}</small>
      </td>
      <td>
        <span className="mt-cel-faturado">
          <strong className="mt-num" data-teste="realizado">
            {formatarReais(l.realizado)}
          </strong>
          <button
            type="button"
            className="mt-icone-botao mt-icone-botao-p"
            onClick={() => aoAbrir({ tipo: 'entregas', linha: l })}
            aria-label={`Ver as entregas que somam o valor faturado de ${nome}`}
            title="Ver entregas"
            data-teste="ver-entregas"
          >
            <ListChecks aria-hidden="true" />
          </button>
        </span>
      </td>
      <td className="mt-cel-anel">
        <Anel razao={l.percentual} tamanho="p" rotulo={`Atingimento de ${nome}`} />
      </td>
      <td>
        <strong className="mt-num" data-teste="comissao">
          {formatarReais(l.comissao_vendedor)}
        </strong>
        <small>
          Fator {formatarPercentual(l.fator_comissao, 2)}
          {l.meta_batida ? ' · meta batida' : ''}
        </small>
      </td>
      <td>
        <strong className="mt-num" title="Metas fechadas que entram na régua do nível">
          {l.regua.consideradas.length} de {l.regua.n} {l.regua.n === 1 ? 'mês' : 'meses'}
        </strong>
        <small>Média {l.regua.media ? formatarReais(l.regua.media) : '—'}</small>
      </td>
      <td>
        <span className="mt-status" data-tom={l.regua.subir ? 'subir' : 'manter'}>
          {l.regua.subir ? <TrendingUp aria-hidden="true" /> : <Minus aria-hidden="true" />}
          {l.regua.subir ? 'Subir nível' : 'Manter nível'}
        </span>
      </td>
      <td className="mt-cel-acoes">
        {l.fechada ? (
          <span className="mt-fechada">
            <span className="mt-status" data-tom="fechada">
              <Lock aria-hidden="true" />
              Fechada
            </span>
            {l.fechamento ? (
              <small>
                {formatarData(l.fechamento.fechada_em)}
                {l.fechamento.fechada_por ? ` · ${l.fechamento.fechada_por}` : ''}
              </small>
            ) : null}
            {permissoes.diretor ? (
              <button
                type="button"
                className="mt-icone-botao"
                data-tom="perigo"
                onClick={() => aoAbrir({ tipo: 'cancelar', linha: l })}
                aria-label={`Cancelar fechamento da meta de ${nome}`}
                title="Cancelar fechamento"
                data-teste="cancelar-fechamento"
              >
                <RotateCcw aria-hidden="true" />
              </button>
            ) : null}
          </span>
        ) : permissoes.gerir ? (
          <span className="mt-acoes">
            <button
              type="button"
              className="mt-icone-botao"
              data-tom="ok"
              onClick={() => aoAbrir({ tipo: 'fechar', linha: l })}
              aria-label={`Fechar a meta de ${nome}`}
              title="Fechar meta"
              data-teste="fechar-meta"
            >
              <CircleCheck aria-hidden="true" />
            </button>
            <button
              type="button"
              className="mt-icone-botao"
              onClick={() => aoAbrir({ tipo: 'meta', linha: l })}
              aria-label={`Editar a meta de ${nome}`}
              title="Editar meta"
              data-teste="editar-meta"
            >
              <Pencil aria-hidden="true" />
            </button>
          </span>
        ) : (
          <span className="mt-status">Aberta</span>
        )}
      </td>
    </tr>
  )
}

// ------------------------------------------------------------------ tela

export function TelaMetas({
  usuarioId,
  filtros,
  permissoes,
  linhas,
  falhou,
  ranking,
  niveis,
  vendedores,
  coletivo,
  historico,
  analise,
  estiloPodio,
}: {
  usuarioId: string
  filtros: FiltrosMetas
  permissoes: Permissoes
  linhas: LinhaMeta[]
  falhou: boolean
  ranking: LinhaRanking[]
  niveis: Nivel[]
  vendedores: Vendedor[]
  coletivo: Coletivo | null
  historico: HistoricoNivel[]
  analise: LinhaAnalise[]
  estiloPodio: EstiloPodio
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [aberto, setAberto] = useState<Aberto>(null)

  const porId = new Map(vendedores.map((v) => [v.id, v]))
  const nomeDe = (id: string) => porId.get(id)?.nome ?? (id === usuarioId ? 'Você' : 'Vendedor')
  const nomeOuVazio = useCallback(
    (id: string | null) => (id ? nomeTitulo(porId.get(id)?.nome ?? (id === usuarioId ? 'Você' : 'Vendedor')) : 'Sem vendedor'),
    // porId é refeito a cada render a partir de `vendedores`; a identidade estável vem deles
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vendedores, usuarioId],
  )
  const niveisPorId = new Map(niveis.map((n) => [n.id, n]))
  const nivelDaMeta = new Map(linhas.map((l) => [l.meta_mensal_id, l.nivel_id]))
  const nomeNivelDaMeta = (metaId: string) => {
    const id = nivelDaMeta.get(metaId)
    return (id && niveisPorId.get(id)?.nome) || ''
  }

  function navegar(mudancas: Partial<FiltrosMetas>) {
    iniciar(() => {
      router.replace(`/metas${paraQueryMetas(filtros, mudancas)}` as Route, { scroll: false })
    })
  }
  function irParaMes(mes: string) {
    const l = limitesDoMes(mes)
    if (l) navegar({ inicio: l.inicio, fim: l.fim })
  }
  const mesInicio = filtros.inicio.slice(0, 7)
  const variosMeses = new Set(linhas.map((l) => l.competencia)).size > 1

  // Quem aparece no filtro: quem tem meta no período, mais o escolhido.
  const vendedoresDoFiltro = vendedores.filter(
    (v) => v.elegivel || linhas.some((l) => l.vendedor_id === v.id) || v.id === filtros.vendedor,
  )

  return (
    <div className="metas">
      <header className="metas-topo">
        <h1 className="so-leitor">Metas &amp; Vendas</h1>
        <div className="metas-periodo" role="group" aria-label="Período">
          <div className="metas-meses">
            <button
              type="button"
              className="mt-icone-botao"
              onClick={() => irParaMes(somarMeses(mesInicio, -1))}
              aria-label="Mês anterior"
              title="Mês anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <label className="campo metas-mes">
              <span className="so-leitor">Mês</span>
              <input
                type="month"
                value={mesInicio}
                onChange={(e) => e.target.value && irParaMes(e.target.value)}
                data-teste="filtro-mes"
              />
            </label>
            <button
              type="button"
              className="mt-icone-botao"
              onClick={() => irParaMes(somarMeses(mesInicio, 1))}
              aria-label="Mês seguinte"
              title="Mês seguinte"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
          <div className="campo metas-data">
            <span>Período</span>
            <SeletorPeriodo
              de={filtros.inicio}
              ate={filtros.fim}
              onChange={(inicio, fim) => navegar({ inicio, fim })}
              data-teste="filtro-periodo"
            />
          </div>
          {permissoes.gerir ? (
            <label className="campo metas-data">
              <span>Vendedor</span>
              <select
                value={filtros.vendedor ?? ''}
                onChange={(e) => navegar({ vendedor: e.target.value || null })}
                data-teste="filtro-vendedor"
              >
                <option value="">Todos</option>
                {vendedoresDoFiltro.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <span className="so-leitor" data-teste="periodo">
            {formatarData(filtros.inicio)} a {formatarData(filtros.fim)}
          </span>
        </div>
        <div className="metas-topo-acoes">
          {permissoes.diretor ? (
            <button
              type="button"
              className="botao-secundario mt-botao-icone"
              onClick={() => setAberto({ tipo: 'niveis' })}
              data-teste="abrir-niveis"
            >
              <SlidersHorizontal aria-hidden="true" />
              Níveis
            </button>
          ) : null}
          {permissoes.gerir ? (
            <button
              type="button"
              className="botao-primario mt-botao-icone"
              onClick={() => setAberto({ tipo: 'meta', linha: null })}
              data-teste="criar-meta"
            >
              <Plus aria-hidden="true" />
              Criar metas
            </button>
          ) : null}
        </div>
      </header>

      <div className="metas-painel" data-pendente={pendente || undefined}>
        <Podio ranking={ranking} vendedores={porId} nivelDaMeta={nomeNivelDaMeta} estiloInicial={estiloPodio} />
        <div className="metas-lateral">
          {coletivo ? <CartaoEquipe c={coletivo} /> : null}
          <Ranking ranking={ranking} vendedores={porId} />
        </div>
      </div>

      <section className="metas-corpo" aria-labelledby="metas-tabela-titulo" aria-busy={pendente}>
        <h2 id="metas-tabela-titulo" className="so-leitor">
          Metas do período
        </h2>
        {falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar as metas agora. Recarregue a página em instantes.
          </p>
        ) : linhas.length === 0 ? (
          <p className="metas-vazio" data-teste="lista-vazia">
            {permissoes.gerir
              ? 'Nenhuma meta no período. Use “Criar metas” para cadastrar.'
              : 'Você não tem meta cadastrada neste período.'}
          </p>
        ) : (
          <div className="mt-tabela-rolagem">
            <table className="mt-tabela" data-teste="painel-metas" data-pendente={pendente || undefined}>
              <thead>
                <tr>
                  <th scope="col">Vendedor</th>
                  <th scope="col">Meta</th>
                  <th scope="col">Valor faturado</th>
                  <th scope="col" className="mt-cel-anel">
                    % da meta
                  </th>
                  <th scope="col">Comissão de vendas</th>
                  <th scope="col">Meses p/ subir nível</th>
                  <th scope="col">Status nível</th>
                  <th scope="col" className="mt-cel-acoes">
                    Fechar
                  </th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <LinhaTabela
                    key={l.meta_mensal_id}
                    l={l}
                    v={porId.get(l.vendedor_id)}
                    nome={nomeDe(l.vendedor_id)}
                    nivel={l.nivel_id ? niveisPorId.get(l.nivel_id) : undefined}
                    mostrarMes={variosMeses}
                    permissoes={permissoes}
                    aoAbrir={setAberto}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="metas-rodape">
          Valor faturado = comissão MegaBox das entregas no período da meta com status Financeiro ou Concluído. Meta
          fechada mostra o valor congelado no fechamento.
        </p>
      </section>

      <AnaliseEntregas linhas={analise} diretor={permissoes.diretor} inicio={filtros.inicio} fim={filtros.fim} nomeDe={nomeOuVazio} />

      {permissoes.diretor ? (
        <RelatorioAnual
          anoInicial={Number(filtros.inicio.slice(0, 4))}
          vendedores={vendedores.map((v) => ({ id: v.id, nome: v.nome }))}
          nomeDe={nomeOuVazio}
        />
      ) : null}

      {aberto?.tipo === 'meta' ? (
        <DialogoMeta
          key={aberto.linha?.meta_mensal_id ?? 'nova'}
          linha={aberto.linha}
          mesPadrao={mesInicio}
          vendedores={vendedores}
          niveis={niveis}
          aoFechar={() => setAberto(null)}
        />
      ) : null}
      {aberto?.tipo === 'fechar' ? (
        <DialogoFechar linha={aberto.linha} nome={nomeDe(aberto.linha.vendedor_id)} aoFechar={() => setAberto(null)} />
      ) : null}
      {aberto?.tipo === 'cancelar' ? (
        <DialogoCancelar
          linha={aberto.linha}
          nome={nomeDe(aberto.linha.vendedor_id)}
          aoFechar={() => setAberto(null)}
        />
      ) : null}
      {aberto?.tipo === 'entregas' ? (
        <DetalheEntregas
          linha={aberto.linha}
          nome={nomeOuVazio(aberto.linha.vendedor_id)}
          nomeDe={nomeOuVazio}
          aoFechar={() => setAberto(null)}
        />
      ) : null}
      {aberto?.tipo === 'niveis' ? (
        <DialogoNiveis niveis={niveis} vendedores={vendedores} historico={historico} aoFechar={() => setAberto(null)} />
      ) : null}
    </div>
  )
}
