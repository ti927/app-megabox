'use client'

import { SeletorPeriodo } from '@/componentes/seletor-periodo'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { FilterX } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { rotuloMes } from '@/lib/relatorios'
import {
  type ContagemSac,
  type FiltrosRelatorioSac,
  formatarDias,
  type IndicadoresSac,
  proporcao,
  queryRelatorio,
} from '@/lib/sac-paineis'

import type { Opcoes } from './tipos'

/** Barras horizontais de contagem, com o número ao lado (um só tom; a legenda é o rótulo). */
function Barras({ itens, descricao }: { itens: ContagemSac[]; descricao: string }) {
  const maior = Math.max(0, ...itens.map((i) => i.total))
  return (
    <ul className="sr-barras" aria-label={descricao}>
      {itens.map((i) => (
        <li key={i.id}>
          <span className="sr-barras-rotulo">{i.nome}</span>
          <span className="sr-barras-trilho" aria-hidden="true">
            <i style={{ width: `${proporcao(i.total, maior) * 100}%` }} data-zero={i.total === 0 || undefined} />
          </span>
          <strong>{i.total.toLocaleString('pt-BR')}</strong>
        </li>
      ))}
    </ul>
  )
}

/**
 * "SLA Médio de Resolução — média de dias para resolução por mês" (HTML A bUDGP, captura
 * sac-03). Colunas por mês de abertura; a dica de cada coluna e a linha de números embaixo são
 * a vista em tabela (abertos/resolvidos por mês).
 */
function SlaMensal({ dados }: { dados: IndicadoresSac['mensal'] }) {
  const maior = Math.max(0, ...dados.map((m) => Number(m.media_dias ?? 0)))
  return (
    <figure className="sr-sla" aria-label="Média de dias para resolução por mês">
      <div className="sr-sla-colunas">
        {dados.map((m) => {
          const temMedia = m.media_dias !== null && m.media_dias !== undefined
          const dica = `${rotuloMes(m.mes)}: ${temMedia ? formatarDias(m.media_dias) : 'sem chamado resolvido'} · ${m.abertos} aberto(s), ${m.resolvidos} resolvido(s)`
          return (
            <div key={m.mes} className="sr-sla-coluna" role="img" title={dica} aria-label={dica} tabIndex={0}>
              <span className="sr-sla-valor">{temMedia ? formatarDias(m.media_dias).replace(/ dias?$/, 'd') : ''}</span>
              <span className="sr-sla-barra" style={{ height: `${proporcao(Number(m.media_dias ?? 0), maior) * 100}%` }} data-vazio={!temMedia || undefined} />
            </div>
          )
        })}
      </div>
      <div className="sr-sla-eixo" aria-hidden="true">
        {dados.map((m) => (
          <span key={m.mes}>
            {rotuloMes(m.mes)}
            <small>
              {m.resolvidos}/{m.abertos}
            </small>
          </span>
        ))}
      </div>
    </figure>
  )
}

export function RelatoriosSac({
  filtros,
  aviso,
  dados,
  falhou,
  opcoes,
  veTodos,
}: {
  filtros: FiltrosRelatorioSac
  aviso: string | null
  dados: IndicadoresSac | null
  falhou: boolean
  opcoes: Opcoes
  veTodos: boolean
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  function ir(m: Partial<FiltrosRelatorioSac> | null) {
    const destino = m === null ? '/sac?aba=relatorios' : `/sac${queryRelatorio(filtros, m)}`
    iniciar(() => router.replace(destino as Route, { scroll: false }))
  }

  return (
    <>
      <header className="sac-topo">
        <div>
          <h1>Indicadores e métricas</h1>
          <p className="sac-subtitulo">Visão geral de desempenho dos chamados abertos no período</p>
        </div>
      </header>

      <section className="sac-filtros" aria-label="Filtros dos indicadores">
        <div className="campo">
          <span>Aberto em</span>
          <SeletorPeriodo
            rotulo="Aberto em"
            de={filtros.de}
            ate={filtros.ate}
            onChange={(de, ate) => ir({ de, ate })}
          />
        </div>
        {veTodos ? (
          <label className="campo">
            <span>Responsável</span>
            <select value={filtros.responsavel ?? ''} onChange={(e) => ir({ responsavel: e.target.value || null })}>
              <option value="">Todos</option>
              {opcoes.usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="sac-acoes">
          <button type="button" className="botao-texto sac-limpar" onClick={() => ir(null)}>
            <Icone icone={FilterX} tamanho={16} />
            Últimos 12 meses
          </button>
        </div>
      </section>

      {aviso ? <p className="aviso">{aviso}</p> : null}
      {falhou ? (
        <p className="aviso" data-tom="erro" role="alert">
          Não foi possível carregar os indicadores agora. Recarregue a página em instantes.
        </p>
      ) : null}

      {dados ? (
        <div className="sr" aria-busy={pendente} data-teste="sac-relatorios">
          <section className="nps-cards" aria-label="Resumo do período">
            <div className="nps-card nps-card-destaque">
              <small>Chamados no período</small>
              <strong>{dados.total.toLocaleString('pt-BR')}</strong>
              <span>não excluídos</span>
            </div>
            <div className="nps-card">
              <small>Não resolvidos</small>
              <strong>{dados.abertos.toLocaleString('pt-BR')}</strong>
              <span>em aberto, em análise ou pendentes</span>
            </div>
            <div className="nps-card">
              <small>Resolvidos</small>
              <strong>{dados.resolvidos.toLocaleString('pt-BR')}</strong>
              <span>{dados.total ? `${Math.round((dados.resolvidos / dados.total) * 100)}% do período` : '—'}</span>
            </div>
            <div className="nps-card">
              <small>Tempo médio de resolução</small>
              <strong>{formatarDias(dados.media_dias)}</strong>
              <span>mediana {formatarDias(dados.mediana_dias)}</span>
            </div>
          </section>

          <section className="sr-cartao sr-largo" aria-labelledby="sr-sla-t">
            <h2 id="sr-sla-t">SLA médio de resolução</h2>
            <p className="sr-sub">Média de dias para resolução por mês de abertura · embaixo, resolvidos/abertos</p>
            {dados.resolvidos === 0 ? <p className="sr-vazio">Nenhum chamado resolvido no período.</p> : null}
            <SlaMensal dados={dados.mensal} />
          </section>

          <section className="sr-cartao" aria-labelledby="sr-tipo-t">
            <h2 id="sr-tipo-t">Volume por tipo de ocorrência</h2>
            <p className="sr-sub">Chamados abertos no período</p>
            <Barras itens={dados.por_tipo} descricao="Chamados por tipo de ocorrência" />
          </section>
          <section className="sr-cartao" aria-labelledby="sr-status-t">
            <h2 id="sr-status-t">Por status</h2>
            <p className="sr-sub">Situação atual dos chamados do período</p>
            <Barras itens={dados.por_status} descricao="Chamados por status" />
          </section>
          <section className="sr-cartao" aria-labelledby="sr-prio-t">
            <h2 id="sr-prio-t">Por prioridade</h2>
            <p className="sr-sub">Da mais alta para a mais baixa</p>
            <Barras itens={dados.por_prioridade} descricao="Chamados por prioridade" />
          </section>
        </div>
      ) : null}
    </>
  )
}
