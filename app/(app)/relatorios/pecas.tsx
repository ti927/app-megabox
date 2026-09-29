'use client'

import { CalendarCheck, ChevronLeft, ChevronRight, Info, type LucideIcon, Minus, Plus, RefreshCw } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { botoesPagina } from '@/lib/relatorios-paineis'

/** "29/09, 16:05" no fuso de São Paulo (o chip "Atualizado" dos blocos HTML). */
export function horaDe(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** Topo de cada relatório: selo com ícone, título, subtítulo, "Atualizado" e "Atualizar dados". */
export function CabecalhoRelatorio({
  Icone,
  titulo,
  subtitulo,
  geradoEm,
  atualizando,
  aoAtualizar,
}: {
  Icone: LucideIcon
  titulo: string
  subtitulo: string
  geradoEm: string
  atualizando: boolean
  aoAtualizar: () => void
}) {
  return (
    <header className="rel-cabecalho">
      <div className="rel-cabecalho-titulo">
        <span className="rel-selo-icone" aria-hidden>
          <Icone size={20} strokeWidth={2} />
        </span>
        <div>
          <h2>{titulo}</h2>
          <p>{subtitulo}</p>
        </div>
      </div>
      <div className="rel-cabecalho-acoes">
        <span className="rel-chip" title="Hora em que estes números foram calculados">
          <CalendarCheck size={14} aria-hidden />
          Atualizado {horaDe(geradoEm)}
        </span>
        <button type="button" className="botao-primario rel-botao-icone" onClick={aoAtualizar} disabled={atualizando} aria-busy={atualizando}>
          <RefreshCw size={16} aria-hidden className={atualizando ? 'rel-girando' : undefined} />
          {atualizando ? 'Atualizando…' : 'Atualizar dados'}
        </button>
      </div>
    </header>
  )
}

/** Seção com rótulo em caixa alta e botão de recolher (os "−/+" do HTML C). */
export function Secao({ id, Icone, titulo, children }: { id: string; Icone: LucideIcon; titulo: string; children: ReactNode }) {
  const [aberta, setAberta] = useState(true)
  return (
    <section className="rel-secao" aria-labelledby={`${id}-t`}>
      <div className="rel-secao-rotulo">
        <h3 id={`${id}-t`}>
          <Icone size={15} aria-hidden />
          {titulo}
        </h3>
        <button
          type="button"
          className="rel-recolher"
          aria-expanded={aberta}
          aria-controls={id}
          onClick={() => setAberta((a) => !a)}
          title={aberta ? 'Recolher' : 'Expandir'}
        >
          {aberta ? <Minus size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
          <span className="so-leitor">{aberta ? 'Recolher' : 'Expandir'} {titulo}</span>
        </button>
      </div>
      <div id={id} hidden={!aberta}>
        {children}
      </div>
    </section>
  )
}

/** Cartão com cabeçalho (ícone, título, subtítulo) e etiqueta do tipo de gráfico à direita. */
export function Cartao({
  Icone,
  titulo,
  subtitulo,
  etiqueta,
  acao,
  className,
  children,
}: {
  Icone: LucideIcon
  titulo: string
  subtitulo?: string
  etiqueta?: { Icone: LucideIcon; texto: string }
  acao?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`rel-cartao${className ? ` ${className}` : ''}`}>
      <div className="rel-cartao-topo">
        <div className="rel-cartao-titulo">
          <span className="rel-cartao-icone" aria-hidden>
            <Icone size={16} />
          </span>
          <div>
            <h4>{titulo}</h4>
            {subtitulo ? <p>{subtitulo}</p> : null}
          </div>
        </div>
        {acao ??
          (etiqueta ? (
            <span className="rel-etiqueta">
              <etiqueta.Icone size={12} aria-hidden />
              {etiqueta.texto}
            </span>
          ) : null)}
      </div>
      {children}
    </div>
  )
}

export type Tom = 'azul' | 'verde' | 'vermelho' | 'roxo' | 'laranja'

/** Cartão de indicador: ícone em quadrado de cor, rótulo, valor grande e linha de apoio. */
export function Kpi({
  Icone,
  rotulo,
  valor,
  apoio,
  tom = 'azul',
  ajuda,
  children,
}: {
  Icone: LucideIcon
  rotulo: string
  valor?: ReactNode
  apoio?: ReactNode
  tom?: Tom
  ajuda?: string
  children?: ReactNode
}) {
  return (
    <div className="rel-kpi" data-tom={tom}>
      {ajuda ? (
        <span className="rel-ajuda" title={ajuda}>
          <Info size={14} aria-hidden />
          <span className="so-leitor">{ajuda}</span>
        </span>
      ) : null}
      <span className="rel-kpi-icone" aria-hidden>
        <Icone size={20} />
      </span>
      <div className="rel-kpi-corpo">
        <span className="rel-kpi-rotulo">{rotulo}</span>
        {valor !== undefined ? <strong className="rel-kpi-valor">{valor}</strong> : null}
        {children}
        {apoio ? <span className="rel-kpi-apoio">{apoio}</span> : null}
      </div>
    </div>
  )
}

/** Legenda lateral de rosca/pizza: bolinha, nome e "n (x%)". */
export function LegendaLista({ itens }: { itens: { chave: string; cor: string; nome: string; meta: string }[] }) {
  return (
    <ul className="rel-legenda">
      {itens.map((i) => (
        <li key={i.chave}>
          <i style={{ background: i.cor }} aria-hidden />
          <span>
            <b>{i.nome}</b>
            <small>{i.meta}</small>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Paginação do HTML C: "Página x de y", Ant., números com reticências, Próx. */
export function Paginacao({ atual, total, aoIr }: { atual: number; total: number; aoIr: (p: number) => void }) {
  if (total <= 1) return null
  return (
    <nav className="rel-paginacao" aria-label="Paginação">
      <span>
        Página {atual} de {total}
      </span>
      <button type="button" onClick={() => aoIr(atual - 1)} disabled={atual <= 1}>
        <ChevronLeft size={14} aria-hidden /> Ant.
      </button>
      {botoesPagina(atual, total).map((p, i) =>
        p === '…' ? (
          <span key={`r${i}`} aria-hidden>
            …
          </span>
        ) : (
          <button key={p} type="button" aria-current={p === atual ? 'page' : undefined} onClick={() => aoIr(p)}>
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={() => aoIr(atual + 1)} disabled={atual >= total}>
        Próx. <ChevronRight size={14} aria-hidden />
      </button>
    </nav>
  )
}

export function Vazio({ Icone, texto }: { Icone: LucideIcon; texto: string }) {
  return (
    <div className="rel-vazio" data-teste="relatorio-vazio">
      <Icone size={28} aria-hidden />
      <span>{texto}</span>
    </div>
  )
}
