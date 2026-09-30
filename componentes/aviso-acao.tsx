'use client'

import { CircleAlert, CircleCheck, LoaderCircle, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Icone } from '@/componentes/icone'
import { resultadoDoAviso } from '@/lib/aviso-acao'

import './aviso-acao.css'

/*
 * Aviso de ação ("toast" de carregando) — canto inferior direito, para TODA ação que vai ao
 * servidor: aparece no clique ("Adicionando ao carrinho…", com barra indeterminada) e vira
 * "Pronto" (verde) ou o erro (vermelho, com a mensagem). API em design/sistema-visual.md,
 * seção "Aviso de ação".
 *
 *   const acao = useAcao()
 *   const r = await acao.executar('Enviando proposta…', () => enviarProposta(form))
 *
 * `executar` devolve o que a função devolveu. Resultado com `erro` (o EstadoAcao das actions)
 * vira aviso vermelho; com `ok`, o texto do `ok` vira o "Pronto". Exceção vira aviso vermelho e
 * é relançada — quem chamou desfaz a atualização otimista no `catch`.
 *
 * Por que portal para o <dialog> modal aberto: diálogo com showModal() fica na top layer e
 * deixa o resto da página inerte — um aviso no <body> ficaria atrás dele e fora da árvore de
 * acessibilidade (o leitor de tela não anunciaria). O aviso mora dentro do modal de cima.
 */

type Estado = 'carregando' | 'ok' | 'erro'

type Aviso = { id: number; rotulo: string; estado: Estado; mensagem: string | null }

export type OpcoesAcao = {
  /** texto do "Pronto" (padrão: o `ok` da action, senão "Pronto") ou `false` para sumir calado */
  pronto?: string | false
  /** texto do erro quando a função LANÇA (padrão genérico) */
  falha?: string
}

/** Para fluxos que não são uma promessa só (navegação, várias etapas). */
export type Acompanhamento = {
  pronto: (mensagem?: string | false) => void
  falhou: (mensagem: string) => void
}

export type Acao = {
  executar: <T>(rotulo: string, fn: () => Promise<T>, opcoes?: OpcoesAcao) => Promise<T>
  acompanhar: (rotulo: string) => Acompanhamento
}

const TEMPO_OK = 2200
const TEMPO_ERRO = 9000
const MAX_VISIVEIS = 4

const Contexto = createContext<Acao | null>(null)

/** Fora do provedor (teste, tela sem casca), só executa: nada quebra. */
const SEM_AVISO: Acao = {
  executar: (_r, fn) => fn(),
  acompanhar: () => ({ pronto: () => undefined, falhou: () => undefined }),
}

export function useAcao(): Acao {
  return useContext(Contexto) ?? SEM_AVISO
}

/** O <dialog> modal de cima, se houver; senão o body. */
function alvoDoPortal(): HTMLElement {
  const modais = [...document.querySelectorAll('dialog[open]')].filter((d) => {
    try {
      return d.matches(':modal')
    } catch {
      return false
    }
  })
  return (modais.at(-1) as HTMLElement | undefined) ?? document.body
}

function useAlvo(ativo: boolean): HTMLElement | null {
  const [alvo, setAlvo] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!ativo) return
    const atualizar = () => setAlvo(alvoDoPortal())
    atualizar()
    const obs = new MutationObserver(atualizar)
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'], childList: true })
    return () => obs.disconnect()
  }, [ativo])
  return ativo ? alvo : null
}

export function ProvedorAvisoAcao({ children }: { children: React.ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const proximo = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const fechar = useCallback((id: number) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setAvisos((l) => l.filter((a) => a.id !== id))
  }, [])

  const concluir = useCallback(
    (id: number, estado: Exclude<Estado, 'carregando'>, mensagem: string | null) => {
      setAvisos((l) => l.map((a) => (a.id === id ? { ...a, estado, mensagem } : a)))
      clearTimeout(timers.current.get(id))
      timers.current.set(id, setTimeout(() => fechar(id), estado === 'ok' ? TEMPO_OK : TEMPO_ERRO))
    },
    [fechar],
  )

  const acompanhar = useCallback(
    (rotulo: string): Acompanhamento => {
      const id = proximo.current++
      setAvisos((l) => [...l, { id, rotulo, estado: 'carregando', mensagem: null }])
      let feito = false
      return {
        pronto: (mensagem) => {
          if (feito) return
          feito = true
          if (mensagem === false) fechar(id)
          else concluir(id, 'ok', mensagem ?? 'Pronto')
        },
        falhou: (mensagem) => {
          if (feito) return
          feito = true
          concluir(id, 'erro', mensagem)
        },
      }
    },
    [concluir, fechar],
  )

  const executar = useCallback(
    async <T,>(rotulo: string, fn: () => Promise<T>, opcoes: OpcoesAcao = {}): Promise<T> => {
      const a = acompanhar(rotulo)
      try {
        const r = await fn()
        const fim = resultadoDoAviso(r, opcoes.pronto)
        if (fim.erro) a.falhou(fim.erro)
        else a.pronto(fim.pronto)
        return r
      } catch (e) {
        a.falhou(opcoes.falha ?? 'Não foi possível concluir agora. Verifique a conexão e tente de novo.')
        throw e
      }
    },
    [acompanhar],
  )

  useEffect(() => {
    const t = timers.current
    return () => {
      for (const x of t.values()) clearTimeout(x)
    }
  }, [])

  const valor = useMemo<Acao>(() => ({ executar, acompanhar }), [executar, acompanhar])
  const alvo = useAlvo(avisos.length > 0)

  return (
    <Contexto.Provider value={valor}>
      {children}
      {alvo
        ? createPortal(
            <div className="aviso-acao-regiao" aria-label="Andamento das ações">
              {avisos.slice(-MAX_VISIVEIS).map((a) => (
                <ItemAviso key={a.id} aviso={a} aoFechar={() => fechar(a.id)} />
              ))}
            </div>,
            alvo,
          )
        : null}
    </Contexto.Provider>
  )
}

function ItemAviso({ aviso, aoFechar }: { aviso: Aviso; aoFechar: () => void }) {
  const { estado } = aviso
  const texto = estado === 'carregando' ? aviso.rotulo : (aviso.mensagem ?? (estado === 'ok' ? 'Pronto' : 'Falhou'))
  return (
    <div
      className="aviso-acao"
      data-estado={estado}
      role={estado === 'erro' ? 'alert' : 'status'}
      aria-live={estado === 'erro' ? 'assertive' : 'polite'}
      aria-busy={estado === 'carregando' || undefined}
      data-teste="aviso-acao"
    >
      <span className="aviso-acao-icone">
        <Icone icone={estado === 'carregando' ? LoaderCircle : estado === 'ok' ? CircleCheck : CircleAlert} tamanho={20} />
      </span>
      <div className="aviso-acao-texto">
        {estado === 'erro' ? <strong>{aviso.rotulo.replace(/…$/, '')}: falhou</strong> : null}
        <span>{texto}</span>
      </div>
      {estado === 'carregando' ? null : (
        <button type="button" className="aviso-acao-fechar" aria-label="Fechar aviso" onClick={aoFechar}>
          <Icone icone={X} tamanho={16} />
        </button>
      )}
      {estado === 'carregando' ? <span className="aviso-acao-barra" aria-hidden="true" /> : null}
    </div>
  )
}
