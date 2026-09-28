'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

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
  paraEscala,
  paraQueryMetas,
  somarMeses,
} from '@/lib/metas'

import { DialogoCancelar, DialogoFechar, DialogoMeta, DialogoNiveis } from './dialogo'
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
  | null

/** Razão exata "realizado ÷ meta" para a barra coletiva — as duas já são texto do servidor. */
function razaoColetiva(c: Coletivo): string | null {
  const meta = paraEscala(c.metaColetiva, 2)
  const fat = paraEscala(c.faturado, 2)
  if (!meta || fat === null) return null
  const r = (fat * 10000n) / meta // floor, 4 casas: basta para barra e rótulo
  return `${r / 10000n}.${String(r % 10000n).padStart(4, '0')}`
}

function Barra({ razao, rotulo }: { razao: string | null; rotulo: string }) {
  return (
    <span className="mt-barra" data-faixa={faixaAtingimento(razao)}>
      <span className="mt-barra-trilho" role="img" aria-label={rotulo}>
        <span className="mt-barra-cheio" style={{ width: `${larguraBarra(razao)}%` }} />
      </span>
      <strong className="mt-num">{formatarPercentual(razao)}</strong>
    </span>
  )
}

function ResumoColetivo({ c }: { c: Coletivo }) {
  const razao = razaoColetiva(c)
  return (
    <section className="mt-cartao mt-coletivo" aria-labelledby="mt-coletivo-titulo" data-teste="coletivo">
      <h2 id="mt-coletivo-titulo">Equipe</h2>
      <dl className="mt-numeros">
        <div>
          <dt>Meta coletiva</dt>
          <dd className="mt-num">{formatarReais(c.metaColetiva)}</dd>
        </div>
        <div>
          <dt>Faturado coletivo</dt>
          <dd className="mt-num">{formatarReais(c.faturado)}</dd>
        </div>
      </dl>
      <Barra razao={razao} rotulo="Atingimento da meta coletiva" />
      <p className="mt-nota">
        Média dos 3 meses anteriores fechados × {META_COLETIVA_PADRAO.multiplicador.replace('.', ',')},
        com piso de {formatarReais(META_COLETIVA_PADRAO.piso)}. Faturado = comissão MegaBox de todas as entregas
        do período.
      </p>
      <ul className="mt-meses">
        {c.meses.map((m) => (
          <li key={m.mes}>
            <span>{nomeDoMes(m.mes)}</span>
            <strong className="mt-num">{formatarReais(m.vendas)}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Ranking({
  ranking,
  nomes,
  nivelDoVendedor,
}: {
  ranking: LinhaRanking[]
  nomes: Map<string, string>
  nivelDoVendedor: (id: string) => string
}) {
  const competencias = new Set(ranking.map((r) => r.competencia))
  return (
    <section className="mt-ranking" aria-label="Ranking" data-teste="ranking">
      {[1, 2].map((tipo) => {
        const doTipo = ranking.filter((r) => r.tipo_meta_id === tipo)
        return (
          <div key={tipo} className="mt-cartao" data-teste={`ranking-${tipo}`}>
            <h2>Ranking {TIPOS[tipo]}</h2>
            {doTipo.length === 0 ? (
              <p className="mt-vazio-p">Nenhuma meta {TIPOS[tipo]!.toLowerCase()} no período.</p>
            ) : (
              <ol className="mt-podio">
                {doTipo.map((r) => (
                  <li key={r.meta_mensal_id} data-pos={r.posicao <= 3 ? r.posicao : undefined}>
                    <span className="mt-posicao" aria-label={`${r.posicao}º lugar`}>
                      {r.posicao}º
                    </span>
                    <span className="mt-quem">
                      <strong>{nomes.get(r.vendedor_id) ?? 'Vendedor'}</strong>
                      <small>
                        {nivelDoVendedor(r.meta_mensal_id)}
                        {competencias.size > 1 ? ` · ${nomeDoMes(r.competencia)}` : ''}
                        {r.fechada ? ' · fechada' : ''}
                      </small>
                    </span>
                    <strong className="mt-num">{formatarPercentual(r.percentual)}</strong>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )
      })}
    </section>
  )
}

function LinhaPainel({
  l,
  nome,
  nivel,
  permissoes,
  aoAbrir,
}: {
  l: LinhaMeta
  nome: string
  nivel: Nivel | undefined
  permissoes: Permissoes
  aoAbrir: (a: Aberto) => void
}) {
  return (
    <li className="mt-linha" data-fechada={l.fechada || undefined} data-teste="linha-meta">
      <div className="mt-col mt-vendedor">
        <strong>{nome}</strong>
        <small>{nivel?.nome ?? 'sem nível'}</small>
        <small>{nomeDoMes(l.competencia)}</small>
      </div>
      <div className="mt-col">
        <span className="mt-rotulo">Meta</span>
        <strong className="mt-num">{formatarReais(l.valor_meta)}</strong>
        <small className="mt-tipo">{TIPOS[l.tipo_meta_id]?.toUpperCase()}</small>
      </div>
      <div className="mt-col">
        <span className="mt-rotulo">Realizado</span>
        <strong className="mt-num" data-teste="realizado">{formatarReais(l.realizado)}</strong>
      </div>
      <div className="mt-col mt-col-barra">
        <span className="mt-rotulo">% da meta</span>
        <Barra razao={l.percentual} rotulo={`Atingimento de ${nome}`} />
      </div>
      <div className="mt-col">
        <span className="mt-rotulo">Comissão</span>
        <strong className="mt-num" data-teste="comissao">{formatarReais(l.comissao_vendedor)}</strong>
        <small>
          fator {formatarPercentual(l.fator_comissao, 2)}
          {l.meta_batida ? ' · meta batida' : ''}
        </small>
      </div>
      <div className="mt-col">
        <span className="mt-rotulo">Nível</span>
        <span className="selo mt-selo-nivel" data-tom={l.regua.subir ? 'ok' : undefined}>
          {l.regua.subir ? 'Subir nível' : 'Manter nível'}
        </span>
        <small title="Média do realizado das últimas metas fechadas (a régua do nível)">
          {l.regua.consideradas.length}/{l.regua.n} meses
          {l.regua.media ? ` · média ${formatarReais(l.regua.media)}` : ''}
        </small>
      </div>
      <div className="mt-col mt-acoes">
        {l.fechada ? (
          <>
            <span className="selo" data-tom="ok">
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
                className="botao-perigo mt-botao-pequeno"
                onClick={() => aoAbrir({ tipo: 'cancelar', linha: l })}
                data-teste="cancelar-fechamento"
              >
                Cancelar fechamento
              </button>
            ) : null}
          </>
        ) : permissoes.gerir ? (
          <>
            <button
              type="button"
              className="botao-primario mt-botao-pequeno"
              onClick={() => aoAbrir({ tipo: 'fechar', linha: l })}
              data-teste="fechar-meta"
            >
              Fechar meta
            </button>
            <button
              type="button"
              className="botao-texto"
              onClick={() => aoAbrir({ tipo: 'meta', linha: l })}
              data-teste="editar-meta"
            >
              Editar
            </button>
          </>
        ) : (
          <span className="selo">Aberta</span>
        )}
      </div>
    </li>
  )
}

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
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [aberto, setAberto] = useState<Aberto>(null)

  const nomes = new Map(vendedores.map((v) => [v.id, v.nome]))
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
  const ehMesInteiro = (() => {
    const l = limitesDoMes(mesInicio)
    return l !== null && l.inicio === filtros.inicio && l.fim === filtros.fim
  })()

  // Quem aparece no filtro: quem tem meta no período, mais o escolhido.
  const vendedoresDoFiltro = vendedores.filter(
    (v) => v.elegivel || linhas.some((l) => l.vendedor_id === v.id) || v.id === filtros.vendedor,
  )

  return (
    <div className="metas">
      <header className="metas-topo">
        <div>
          <h1>Metas &amp; Vendas</h1>
          <p className="metas-periodo" data-teste="periodo">
            {ehMesInteiro ? nomeDoMes(mesInicio) : `${formatarData(filtros.inicio)} a ${formatarData(filtros.fim)}`}
          </p>
        </div>
        <div className="metas-topo-acoes">
          {permissoes.diretor ? (
            <button type="button" className="botao-secundario" onClick={() => setAberto({ tipo: 'niveis' })} data-teste="abrir-niveis">
              Níveis
            </button>
          ) : null}
          {permissoes.gerir ? (
            <button
              type="button"
              className="botao-primario"
              onClick={() => setAberto({ tipo: 'meta', linha: null })}
              data-teste="criar-meta"
            >
              + Criar meta
            </button>
          ) : null}
        </div>
      </header>

      <section className="metas-filtros" aria-label="Período e filtros">
        <div className="metas-meses">
          <button type="button" className="botao-secundario" onClick={() => irParaMes(somarMeses(mesInicio, -1))} aria-label="Mês anterior">
            ‹
          </button>
          <label className="campo">
            <span>Mês</span>
            <input
              type="month"
              value={mesInicio}
              onChange={(e) => e.target.value && irParaMes(e.target.value)}
              data-teste="filtro-mes"
            />
          </label>
          <button type="button" className="botao-secundario" onClick={() => irParaMes(somarMeses(mesInicio, 1))} aria-label="Mês seguinte">
            ›
          </button>
        </div>
        <label className="campo">
          <span>De</span>
          <input
            type="date"
            value={filtros.inicio}
            max={filtros.fim}
            onChange={(e) => e.target.value && navegar({ inicio: e.target.value })}
          />
        </label>
        <label className="campo">
          <span>Até</span>
          <input
            type="date"
            value={filtros.fim}
            min={filtros.inicio}
            onChange={(e) => e.target.value && navegar({ fim: e.target.value })}
          />
        </label>
        {permissoes.gerir ? (
          <label className="campo">
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
      </section>

      <div className="metas-painel-topo" data-pendente={pendente || undefined}>
        {coletivo ? <ResumoColetivo c={coletivo} /> : null}
        <Ranking ranking={ranking} nomes={nomes} nivelDoVendedor={nomeNivelDaMeta} />
      </div>

      <section className="metas-corpo" aria-label="Metas do período" aria-busy={pendente}>
        <h2 className="so-leitor">Metas do período</h2>
        {falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar as metas agora. Recarregue a página em instantes.
          </p>
        ) : linhas.length === 0 ? (
          <p className="metas-vazio" data-teste="lista-vazia">
            {permissoes.gerir
              ? 'Nenhuma meta no período. Use “Criar meta” para cadastrar.'
              : 'Você não tem meta cadastrada neste período.'}
          </p>
        ) : (
          <ol className="mt-painel" data-teste="painel-metas" data-pendente={pendente || undefined}>
            {linhas.map((l) => (
              <LinhaPainel
                key={l.meta_mensal_id}
                l={l}
                nome={nomes.get(l.vendedor_id) ?? (l.vendedor_id === usuarioId ? 'Você' : 'Vendedor')}
                nivel={l.nivel_id ? niveisPorId.get(l.nivel_id) : undefined}
                permissoes={permissoes}
                aoAbrir={setAberto}
              />
            ))}
          </ol>
        )}
        <p className="metas-rodape">
          Realizado = comissão MegaBox das entregas no período da meta com status Financeiro ou Concluído. Meta
          fechada mostra o valor congelado no fechamento.
        </p>
      </section>

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
        <DialogoFechar
          linha={aberto.linha}
          nome={nomes.get(aberto.linha.vendedor_id) ?? 'Vendedor'}
          aoFechar={() => setAberto(null)}
        />
      ) : null}
      {aberto?.tipo === 'cancelar' ? (
        <DialogoCancelar
          linha={aberto.linha}
          nome={nomes.get(aberto.linha.vendedor_id) ?? 'Vendedor'}
          aoFechar={() => setAberto(null)}
        />
      ) : null}
      {aberto?.tipo === 'niveis' ? (
        <DialogoNiveis niveis={niveis} vendedores={vendedores} historico={historico} aoFechar={() => setAberto(null)} />
      ) : null}
    </div>
  )
}
