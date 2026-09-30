'use client'

import { CalendarRange, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

import {
  ATALHOS,
  atalhoDoIntervalo,
  DIAS_CURTOS,
  DIAS_LONGOS,
  diaDaSemana,
  diasNoMes,
  escolherDia,
  formatarPeriodo,
  gradeDoMes,
  hojeEmSaoPaulo,
  indiceMes,
  intervaloDoAtalho,
  iso,
  isoValida,
  mesDe,
  nomeDoDia,
  nomeDoMes,
  partes,
  primeiroDia,
  somarDias,
  somarMeses,
  type Atalho,
  type Iso,
  type Mes,
  type Selecao,
} from '@/lib/periodo'

import { Icone } from './icone'

import './seletor-periodo.css'

export type PropsSeletorPeriodo = {
  /** Início 'AAAA-MM-DD' (vazio = sem data). Mudou de fora → o seletor acompanha. */
  de?: string
  /** Fim 'AAAA-MM-DD' (vazio = sem data). */
  ate?: string
  /** Chamado quando o usuário fecha um intervalo (atalho ou dois cliques) ou limpa. */
  onChange?: (de: string, ate: string) => void
  /** Dentro de <form>: gera <input type="hidden" name={nomeDe}> com o início. */
  nomeDe?: string
  /** Dentro de <form>: gera <input type="hidden" name={nomeAte}> com o fim. */
  nomeAte?: string
  /** Nome acessível do botão ("Período", "Data de criação"…). */
  rotulo?: string
  /** Texto do botão sem período escolhido. */
  vazio?: string
  desabilitado?: boolean
  /** Mostra "Limpar" no painel (filtro opcional: período vazio = todas as datas). */
  limpavel?: boolean
  className?: string
  'data-teste'?: string
}

const nada: Selecao = { de: '', ate: '', esperandoFim: false }

/**
 * Seletor de intervalo de datas (modelo do Bubble): botão "01/09/2026 - 30/09/2026" que abre
 * um painel com atalhos à esquerda e dois meses lado a lado à direita. pt-BR, semana na
 * segunda, "hoje" no fuso de São Paulo. Lógica em lib/periodo.ts.
 *
 * Controlado (`de`/`ate` + `onChange`) ou dentro de `<form method="get">` (`nomeDe`/`nomeAte`
 * geram inputs hidden). Teclado: setas movem o dia, PageUp/PageDown trocam o mês, Home/End
 * vão ao início/fim da semana, Enter escolhe, Esc fecha.
 */
export function SeletorPeriodo({
  de,
  ate,
  onChange,
  nomeDe,
  nomeAte,
  rotulo = 'Período',
  vazio = 'Escolher período',
  desabilitado = false,
  limpavel = false,
  className,
  'data-teste': dataTeste,
}: PropsSeletorPeriodo) {
  const id = useId()
  const raiz = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)
  const focarDia = useRef(false)

  const [valor, setValor] = useState({ de: de ?? '', ate: ate ?? '' })
  // Props mudaram (URL nova, "Mês atual"…): o valor acompanha — ajuste no render, sem efeito.
  const [origem, setOrigem] = useState({ de, ate })
  if (origem.de !== de || origem.ate !== ate) {
    setOrigem({ de, ate })
    setValor({ de: de ?? '', ate: ate ?? '' })
  }

  const [aberto, setAberto] = useState(false)
  const [hoje, setHoje] = useState<Iso>('')
  const [rascunho, setRascunho] = useState<Selecao>(nada)
  const [visivel, setVisivel] = useState<Mes>({ ano: 2026, mes: 1 })
  const [foco, setFoco] = useState<Iso>('')
  const [sobre, setSobre] = useState<Iso | null>(null)
  const [lado, setLado] = useState<'esquerda' | 'direita'>('esquerda')

  function abrir() {
    const h = hojeEmSaoPaulo()
    const inicio = isoValida(valor.de) ? valor.de : isoValida(valor.ate) ? valor.ate : h
    setHoje(h)
    setRascunho({ de: valor.de, ate: valor.ate, esperandoFim: false })
    setFoco(inicio)
    setVisivel(mesDe(inicio))
    setSobre(null)
    setAberto(true)
    focarDia.current = true
  }

  function fechar(devolverFoco: boolean) {
    setAberto(false)
    if (devolverFoco) botao.current?.focus()
  }

  function aplicar(novoDe: string, novoAte: string) {
    setValor({ de: novoDe, ate: novoAte })
    fechar(true)
    if (novoDe !== valor.de || novoAte !== valor.ate) onChange?.(novoDe, novoAte)
  }

  // Painel perto da borda direita da janela: abre alinhado pela direita do botão.
  useLayoutEffect(() => {
    if (!aberto || !painel.current || !raiz.current) return
    const r = raiz.current.getBoundingClientRect()
    const p = painel.current.getBoundingClientRect()
    setLado(r.left + p.width > document.documentElement.clientWidth ? 'direita' : 'esquerda')
  }, [aberto])

  // Foco no dia depois que a grade renderizou (abertura e navegação por teclado).
  useEffect(() => {
    if (!aberto || !focarDia.current) return
    focarDia.current = false
    painel.current?.querySelector<HTMLButtonElement>(`[data-dia="${foco}"]`)?.focus()
  }, [aberto, foco, visivel])

  // Clique fora fecha sem mudar nada.
  useEffect(() => {
    if (!aberto) return
    function fora(e: PointerEvent) {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('pointerdown', fora)
    return () => document.removeEventListener('pointerdown', fora)
  }, [aberto])

  function mostrar(d: Iso) {
    const m = mesDe(d)
    if (indiceMes(m) < indiceMes(visivel)) setVisivel(m)
    else if (indiceMes(m) > indiceMes(visivel) + 1) setVisivel(somarMeses(m, -1))
  }

  function moverFoco(d: Iso) {
    setFoco(d)
    mostrar(d)
    focarDia.current = true
  }

  function navegarMes(n: number) {
    const novo = somarMeses(visivel, n)
    setVisivel(novo)
    const f = mesDe(foco)
    if (indiceMes(f) < indiceMes(novo) || indiceMes(f) > indiceMes(novo) + 1) setFoco(primeiroDia(novo))
  }

  function clicarDia(d: Iso) {
    const s = escolherDia(rascunho, d)
    setFoco(d)
    if (s.esperandoFim) {
      setRascunho(s)
      setSobre(null)
    } else {
      aplicar(s.de, s.ate)
    }
  }

  function teclaDia(e: React.KeyboardEvent<HTMLButtonElement>, d: Iso) {
    const { ano, mes, dia } = partes(d)
    const mesmoDiaEm = (n: number) => {
      const m = somarMeses({ ano, mes }, n)
      return iso(m.ano, m.mes, Math.min(dia, diasNoMes(m.ano, m.mes)))
    }
    const alvo: Record<string, () => Iso> = {
      ArrowLeft: () => somarDias(d, -1),
      ArrowRight: () => somarDias(d, 1),
      ArrowUp: () => somarDias(d, -7),
      ArrowDown: () => somarDias(d, 7),
      Home: () => somarDias(d, -diaDaSemana(d)),
      End: () => somarDias(d, 6 - diaDaSemana(d)),
      PageUp: () => mesmoDiaEm(e.shiftKey ? -12 : -1),
      PageDown: () => mesmoDiaEm(e.shiftKey ? 12 : 1),
    }
    const f = alvo[e.key]
    if (!f) return
    e.preventDefault()
    const novo = f()
    moverFoco(novo)
    if (rascunho.esperandoFim) setSobre(novo)
  }

  function teclaPainel(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Escape') return
    // preventDefault: o Esc não chega a fechar o painel lateral/diálogo em volta.
    e.preventDefault()
    e.stopPropagation()
    fechar(true)
  }

  function saiuFoco(e: React.FocusEvent<HTMLDivElement>) {
    const para = e.relatedTarget
    if (aberto && para instanceof Node && !raiz.current?.contains(para)) setAberto(false)
  }

  const atalhoAtivo: Atalho | 'personalizado' | null = !aberto
    ? null
    : rascunho.esperandoFim
      ? 'personalizado'
      : atalhoDoIntervalo(rascunho.de, rascunho.ate, hoje)

  // Intervalo desenhado: o escolhido, ou início → dia sob o ponteiro enquanto falta o fim.
  let iniDesenho = rascunho.de
  let fimDesenho = rascunho.esperandoFim ? (sobre ?? '') : rascunho.ate
  if (fimDesenho && iniDesenho && fimDesenho < iniDesenho) [iniDesenho, fimDesenho] = [fimDesenho, iniDesenho]
  const faixa = !!iniDesenho && !!fimDesenho && iniDesenho !== fimDesenho

  const texto = formatarPeriodo(valor.de, valor.ate)
  const idPainel = `${id}-painel`
  const idDica = `${id}-dica`

  function mesGrade(m: Mes, posicao: 'esquerda' | 'direita') {
    const idTitulo = `${id}-${m.ano}-${m.mes}`
    return (
      <div className="seletor-periodo-mes">
        <div className="seletor-periodo-mes-topo">
          {posicao === 'esquerda' ? (
            <button type="button" className="seletor-periodo-seta" aria-label="Mês anterior" onClick={() => navegarMes(-1)}>
              <Icone icone={ChevronLeft} tamanho={18} />
            </button>
          ) : (
            <span className="seletor-periodo-seta-vaga" />
          )}
          <span id={idTitulo} className="seletor-periodo-mes-nome" aria-live="polite">
            {nomeDoMes(m)}
          </span>
          {posicao === 'direita' ? (
            <button type="button" className="seletor-periodo-seta" aria-label="Próximo mês" onClick={() => navegarMes(1)}>
              <Icone icone={ChevronRight} tamanho={18} />
            </button>
          ) : (
            <span className="seletor-periodo-seta-vaga" />
          )}
        </div>
        <table className="seletor-periodo-grade" aria-labelledby={idTitulo}>
          <thead>
            <tr>
              {DIAS_CURTOS.map((d, i) => (
                <th key={d} scope="col" abbr={DIAS_LONGOS[i]}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gradeDoMes(m).map((semana, i) => (
              <tr key={i}>
                {semana.map((d, j) => {
                  if (!d) return <td key={j} />
                  const ini = d === iniDesenho
                  const fim = d === fimDesenho
                  const dentro = !!iniDesenho && !!fimDesenho && d > iniDesenho && d < fimDesenho
                  const estado = [
                    ini && fim ? 'início e fim do período' : ini ? 'início do período' : fim ? 'fim do período' : '',
                    dentro ? 'dentro do período' : '',
                    d === hoje ? 'hoje' : '',
                  ]
                    .filter(Boolean)
                    .join(', ')
                  return (
                    <td
                      key={j}
                      data-dentro={dentro || undefined}
                      data-meia={faixa ? (ini ? 'direita' : fim ? 'esquerda' : undefined) : undefined}
                    >
                      <button
                        type="button"
                        className="seletor-periodo-dia"
                        data-dia={d}
                        data-hoje={d === hoje || undefined}
                        tabIndex={d === foco ? 0 : -1}
                        aria-label={estado ? `${nomeDoDia(d)}, ${estado}` : nomeDoDia(d)}
                        aria-pressed={ini || fim}
                        aria-current={d === hoje ? 'date' : undefined}
                        onClick={() => clicarDia(d)}
                        onKeyDown={(e) => teclaDia(e, d)}
                        onPointerEnter={() => rascunho.esperandoFim && setSobre(d)}
                        onFocus={() => setFoco(d)}
                      >
                        {partes(d).dia}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div
      ref={raiz}
      className={['seletor-periodo', className].filter(Boolean).join(' ')}
      onKeyDown={aberto ? teclaPainel : undefined}
      onBlur={saiuFoco}
      data-teste={dataTeste}
    >
      <button
        ref={botao}
        type="button"
        className="seletor-periodo-botao"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={aberto ? idPainel : undefined}
        aria-label={`${rotulo}: ${texto ? texto.replace(' - ', ' a ') : 'nenhum período escolhido'}`}
        data-vazio={texto ? undefined : ''}
        disabled={desabilitado}
        onClick={() => (aberto ? fechar(false) : abrir())}
      >
        <Icone icone={CalendarRange} tamanho={16} />
        <span className="seletor-periodo-texto">{texto || vazio}</span>
        <Icone icone={ChevronDown} tamanho={14} className="seletor-periodo-caret" />
      </button>

      {nomeDe ? <input type="hidden" name={nomeDe} value={valor.de} /> : null}
      {nomeAte ? <input type="hidden" name={nomeAte} value={valor.ate} /> : null}

      {aberto ? (
        <div
          ref={painel}
          id={idPainel}
          className="seletor-periodo-painel"
          role="dialog"
          aria-label={`Escolher ${rotulo.toLowerCase()}`}
          aria-describedby={idDica}
          data-lado={lado}
        >
          <ul className="seletor-periodo-atalhos" aria-label="Atalhos">
            {ATALHOS.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  aria-pressed={atalhoAtivo === a.id}
                  onClick={() => {
                    const i = intervaloDoAtalho(a.id, hoje)
                    aplicar(i.de, i.ate)
                  }}
                >
                  {a.rotulo}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                aria-pressed={atalhoAtivo === 'personalizado'}
                onClick={() => {
                  setRascunho(nada)
                  moverFoco(foco || hoje)
                }}
              >
                Personalizado
              </button>
            </li>
          </ul>

          <div className="seletor-periodo-calendario" onPointerLeave={() => setSobre(null)}>
            <div className="seletor-periodo-meses">
              {mesGrade(visivel, 'esquerda')}
              {mesGrade(somarMeses(visivel, 1), 'direita')}
            </div>
            <div className="seletor-periodo-rodape">
              <span id={idDica} className="seletor-periodo-dica">
                {rascunho.esperandoFim
                  ? `Início ${formatarPeriodo(rascunho.de, '').split(' - ')[0]} — escolha o dia final`
                  : formatarPeriodo(rascunho.de, rascunho.ate) || 'Escolha o dia inicial'}
              </span>
              {limpavel ? (
                <button type="button" className="botao-texto" onClick={() => aplicar('', '')}>
                  Limpar
                </button>
              ) : null}
              <button type="button" className="botao-texto" onClick={() => fechar(true)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
