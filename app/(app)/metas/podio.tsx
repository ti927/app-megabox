'use client'

import { Trophy } from 'lucide-react'
import { useId, useState } from 'react'

import { Foto } from '@/componentes/foto'
import { COOKIE_PODIO, type EstiloPodio, ESTILOS_PODIO, nomeTitulo } from '@/lib/metas-podio'
import { faixaAtingimento, formatarPercentual, larguraBarra, nomeDoMes } from '@/lib/metas'
import { iniciais, montarPodio, nomeCurto } from '@/lib/metas-painel'

import type { LinhaRanking, Vendedor } from './tipos'

/**
 * Pódio do mês (Group F/G/H/I do Bubble: `specific_item(1|2|3)` do ranking) em QUATRO estilos,
 * para o dono escolher olhando a própria tela. Todos com dado real — foto, nome, nível e o %
 * da meta — e metais (ouro, prata, bronze) tirados dos tokens, nos dois temas.
 *
 *   A · Escudos    — os brasões do Bubble refinados, com o % DENTRO do escudo.
 *   B · Degraus    — pódio clássico: 1º no degrau mais alto ao centro, 2º à esquerda, 3º à direita.
 *   C · Medalhas   — cartões horizontais com a medalha e um anel de progresso do %.
 *   D · Placar     — painel de gestão: barras do % contra a linha de 100% da meta.
 *
 * A escolha fica num cookie (`mb-podio`, lido no servidor — sem piscar no carregamento) e no
 * localStorage. Padrão: A.
 */

const NOMES: Record<EstiloPodio, string> = { A: 'Escudos', B: 'Degraus', C: 'Medalhas', D: 'Placar' }
const METAIS = { 1: 'ouro', 2: 'prata', 3: 'bronze' } as const
const TIPOS: Record<number, string> = { 1: 'Regular', 2: 'Substituição' }

type Item = { lugar: 1 | 2 | 3; r: LinhaRanking; v: Vendedor | undefined; nome: string; nivel: string }

function Avatar({ it, className }: { it: Item; className: string }) {
  return <Foto url={it.v?.foto} nome={it.nome} iniciais={iniciais(it.nome)} className={`mt-avatar ${className}`} />
}

const pct = (it: Item) => formatarPercentual(it.r.percentual)

// ------------------------------------------------------------------ A · Escudos
function Escudo({ it }: { it: Item }) {
  const id = useId()
  return (
    <li className="mt-escudo" data-metal={METAIS[it.lugar]} data-lugar={it.lugar}>
      <svg className="mt-escudo-forma" viewBox="0 0 200 260" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" className="mt-escudo-luz" />
            <stop offset="1" className="mt-escudo-sombra" />
          </linearGradient>
        </defs>
        <path className="mt-escudo-aro" d="M100 4 L194 28 L194 140 C194 200 152 238 100 258 C48 238 6 200 6 140 L6 28 Z" />
        <path fill={`url(#${id}-g)`} d="M100 13 L185 35 L185 140 C185 194 147 228 100 247 C53 228 15 194 15 140 L15 35 Z" />
        <path className="mt-escudo-brilho" d="M100 13 L185 35 L185 70 C150 58 60 58 15 76 L15 35 Z" />
      </svg>
      <div className="mt-escudo-conteudo">
        <span className="mt-escudo-lugar">
          {it.lugar === 1 ? <Trophy aria-hidden="true" /> : null}
          {it.r.posicao}º
        </span>
        <Avatar it={it} className="mt-escudo-foto" />
        <strong className="mt-escudo-nome" title={it.nome}>
          {nomeTitulo(nomeCurto(it.nome))}
        </strong>
        <span className="mt-escudo-nivel">{it.nivel || TIPOS[it.r.tipo_meta_id]}</span>
        <span className="mt-escudo-pct mt-num" data-teste="podio-pct">
          {pct(it)}
        </span>
      </div>
    </li>
  )
}

// ------------------------------------------------------------------ B · Degraus
function Degrau({ it }: { it: Item }) {
  return (
    <li className="mt-degrau" data-metal={METAIS[it.lugar]} data-lugar={it.lugar}>
      <div className="mt-degrau-pessoa">
        {it.lugar === 1 ? <Trophy className="mt-degrau-trofeu" aria-hidden="true" /> : null}
        <Avatar it={it} className="mt-degrau-foto" />
        <strong title={it.nome}>{nomeTitulo(nomeCurto(it.nome))}</strong>
        <span>{it.nivel || TIPOS[it.r.tipo_meta_id]}</span>
      </div>
      <div className="mt-degrau-bloco">
        <span className="mt-degrau-num" aria-hidden="true">
          {it.r.posicao}
        </span>
        <span className="mt-degrau-pct mt-num" data-teste="podio-pct">
          {pct(it)}
        </span>
        <span className="so-leitor">{it.r.posicao}º lugar</span>
      </div>
    </li>
  )
}

// ------------------------------------------------------------------ C · Medalhas
function Medalha({ it }: { it: Item }) {
  const r = 44
  const volta = 2 * Math.PI * r
  const cheio = (larguraBarra(it.r.percentual) / 100) * volta
  return (
    <li className="mt-medalha" data-metal={METAIS[it.lugar]} data-lugar={it.lugar}>
      <span className="mt-medalha-anel">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="mt-medalha-trilho" cx="50" cy="50" r={r} />
          {cheio > 0 ? (
            <circle className="mt-medalha-arco" cx="50" cy="50" r={r} strokeDasharray={`${cheio} ${volta}`} transform="rotate(-90 50 50)" />
          ) : null}
        </svg>
        <Avatar it={it} className="mt-medalha-foto" />
        <span className="mt-medalha-selo" aria-label={`${it.r.posicao}º lugar`}>
          {it.r.posicao}º
        </span>
      </span>
      <span className="mt-medalha-quem">
        <strong title={it.nome}>{nomeTitulo(nomeCurto(it.nome))}</strong>
        <span>{it.nivel || TIPOS[it.r.tipo_meta_id]}</span>
      </span>
      <span className="mt-medalha-pct mt-num" data-faixa={faixaAtingimento(it.r.percentual)} data-teste="podio-pct">
        {pct(it)}
        <small>da meta</small>
      </span>
    </li>
  )
}

// ------------------------------------------------------------------ D · Placar
function LinhaPlacar({ it, escala }: { it: Item; escala: number }) {
  // A barra vai até 100% da meta em `100 / escala` da largura; acima de 100% avança além da marca.
  const bruto = Number(it.r.percentual ?? 0) * 100 // só desenho
  const largura = Math.max(0, Math.min(100, (bruto / escala) * 100))
  return (
    <li className="mt-placar-linha" data-metal={METAIS[it.lugar]} data-lugar={it.lugar}>
      <span className="mt-placar-pos">{it.r.posicao}º</span>
      <Avatar it={it} className="mt-placar-foto" />
      <span className="mt-placar-quem">
        <strong title={it.nome}>{nomeTitulo(nomeCurto(it.nome))}</strong>
        <span>{it.nivel || TIPOS[it.r.tipo_meta_id]}</span>
      </span>
      <span className="mt-placar-trilho" aria-hidden="true">
        <span className="mt-placar-barra" data-faixa={faixaAtingimento(it.r.percentual)} style={{ width: `${largura}%` }} />
      </span>
      <strong className="mt-placar-pct mt-num" data-teste="podio-pct">
        {pct(it)}
      </strong>
    </li>
  )
}

function Placar({ itens }: { itens: Item[] }) {
  const maior = Math.max(100, ...itens.map((i) => Number(i.r.percentual ?? 0) * 100))
  const escala = Math.ceil(maior / 25) * 25
  return (
    <div className="mt-placar" style={{ '--mt-marca-100': `${(100 / escala) * 100}%` } as React.CSSProperties}>
      <ol className="mt-placar-lista">
        {itens.map((it) => (
          <LinhaPlacar key={it.r.meta_mensal_id} it={it} escala={escala} />
        ))}
      </ol>
      <div className="mt-placar-escala" aria-hidden="true">
        <span className="mt-placar-eixo">
          <span>0%</span>
          <span className="mt-placar-cem">100% da meta</span>
          {escala > 100 ? <span>{escala}%</span> : <span aria-hidden="true" />}
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ o cartão
export function Podio({
  ranking,
  vendedores,
  nivelDaMeta,
  estiloInicial,
}: {
  ranking: LinhaRanking[]
  vendedores: Map<string, Vendedor>
  nivelDaMeta: (id: string) => string
  estiloInicial: EstiloPodio
}) {
  const [estilo, setEstilo] = useState<EstiloPodio>(estiloInicial)
  function escolher(e: EstiloPodio) {
    setEstilo(e)
    document.cookie = `${COOKIE_PODIO}=${e}; path=/; max-age=31536000; samesite=lax`
    try {
      localStorage.setItem(COOKIE_PODIO, e)
    } catch {
      // armazenamento bloqueado: o cookie basta
    }
  }

  const tres = montarPodio(ranking)
  const itens: Item[] = tres.map((r, i) => {
    const v = vendedores.get(r.vendedor_id)
    return { lugar: (i + 1) as 1 | 2 | 3, r, v, nome: v?.nome ?? 'Vendedor', nivel: nivelDaMeta(r.meta_mensal_id) }
  })
  // Leitura do pódio: 2º à esquerda, 1º ao centro, 3º à direita (lugar vago mantém a coluna).
  const emPodio = [itens[1], itens[0], itens[2]]

  const seletor = (
    <div className="mt-podio-estilos" role="radiogroup" aria-label="Estilo do pódio">
      <span aria-hidden="true">Estilo do pódio</span>
      {ESTILOS_PODIO.map((e) => (
        <button
          key={e}
          type="button"
          role="radio"
          aria-checked={estilo === e}
          aria-label={`${e} · ${NOMES[e]}`}
          title={NOMES[e]}
          onClick={() => escolher(e)}
          data-teste={`podio-estilo-${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  )

  if (itens.length === 0) {
    return (
      <section className="mt-podio mt-podio-vazio" aria-label="Pódio" data-teste="podio">
        <Trophy aria-hidden="true" />
        <p>Nenhuma meta no período para formar o pódio.</p>
      </section>
    )
  }
  const primeiro = itens[0]!.r
  return (
    <section className="mt-podio" aria-labelledby="mt-podio-titulo" data-teste="podio" data-estilo={estilo}>
      <header className="mt-podio-cabeca">
        <div>
          <h2 id="mt-podio-titulo">Pódio</h2>
          <p>
            Ranking {TIPOS[primeiro.tipo_meta_id]!.toLowerCase()} de {nomeDoMes(primeiro.competencia)} · {NOMES[estilo].toLowerCase()}
          </p>
        </div>
        {seletor}
      </header>
      {estilo === 'A' ? (
        <ol className="mt-podio-lista mt-escudos">
          {emPodio.map((it, i) => (it ? <Escudo key={it.r.meta_mensal_id} it={it} /> : <li key={`vago-${i}`} className="mt-podio-vago" aria-hidden="true" />))}
        </ol>
      ) : estilo === 'B' ? (
        <ol className="mt-podio-lista mt-degraus">
          {emPodio.map((it, i) => (it ? <Degrau key={it.r.meta_mensal_id} it={it} /> : <li key={`vago-${i}`} className="mt-podio-vago" aria-hidden="true" />))}
        </ol>
      ) : estilo === 'C' ? (
        <ol className="mt-medalhas">
          {itens.map((it) => (
            <Medalha key={it.r.meta_mensal_id} it={it} />
          ))}
        </ol>
      ) : (
        <Placar itens={itens} />
      )}
    </section>
  )
}
