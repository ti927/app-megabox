'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { larguraInicial, limitarLargura, PASSO_TECLADO } from '@/lib/painel-largura'

import './painel-lateral.css'

/** Tudo o que pode receber foco dentro do painel, na ordem do documento. */
const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary'

function focaveis(raiz: HTMLElement) {
  return [...raiz.querySelectorAll<HTMLElement>(FOCAVEIS)].filter(
    (el) => !el.closest('[hidden], fieldset:disabled') && el.getClientRects().length > 0,
  )
}

/**
 * Escala do app (`--escala`, estilos/base.css: 0,75 no desktop). window.innerWidth e
 * clientX vêm em px da janela; a largura do painel é aplicada em px CSS, que o zoom encolhe.
 */
function escala(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala'))
  return Number.isFinite(v) && v > 0 ? v : 1
}
/** Largura da janela em px CSS (já descontado o zoom). */
function janelaCss(): number {
  return window.innerWidth / escala()
}

function lerLargura(chave: string | undefined): number | null {
  if (!chave) return null
  try {
    const v = Number(localStorage.getItem(`painel-lateral:${chave}`))
    return Number.isFinite(v) && v > 0 ? v : null
  } catch {
    return null
  }
}

function gravarLargura(chave: string | undefined, px: number) {
  if (!chave) return
  try {
    localStorage.setItem(`painel-lateral:${chave}`, String(Math.round(px)))
  } catch {
    // modo privado / armazenamento bloqueado: a largura só não é lembrada
  }
}

export type PropsPainelLateral = {
  /** id do título dentro do painel (aria-labelledby). */
  rotuloId: string
  /** X, Esc ou clique fora. Quem usa decide o que fechar significa (ex.: tirar ?sel= da URL). */
  aoFechar: () => void
  children: React.ReactNode
  /**
   * Cliques fora do painel em elementos dentro de um seletor destes NÃO fecham — é o que
   * permite clicar em outra linha da lista e só trocar o conteúdo. Padrão: `[data-painel-manter]`.
   */
  manter?: string
  /** Para onde o foco volta quando o painel desmonta. Sem isto, volta a quem tinha o foco ao abrir. */
  focoAoFechar?: () => HTMLElement | null
  /** Lembra a largura escolhida (localStorage) sob esta chave. Sem chave, não lembra. */
  chaveLargura?: string
  /** Fração da janela na primeira abertura (0–1). Padrão 0,56. */
  fracaoInicial?: number
  /** Conteúdo ainda chegando (troca de registro): marca aria-busy. */
  ocupado?: boolean
  className?: string
  'data-teste'?: string
}

/**
 * Painel lateral (drawer) à direita, do cabeçalho ao pé da janela, redimensionável pela borda
 * esquerda.
 *
 * Diferente do `<dialog>` central: a página continua visível e clicável à esquerda, para
 * trocar o registro sem fechar. Para o teclado ele se comporta como diálogo — `role=dialog`,
 * `aria-modal`, Tab preso dentro, Esc fecha e o foco volta para quem abriu. O ponteiro pode
 * sair (clicar em outra linha marcada com `data-painel-manter`); qualquer outro clique fora fecha.
 *
 * Enquanto aberto, publica a largura em `--painel-lateral-largura` no <html>, para a página
 * poder abrir espaço (padding) e não ficar escondida atrás dele.
 */
export function PainelLateral({
  rotuloId,
  aoFechar,
  children,
  manter = '[data-painel-manter]',
  focoAoFechar,
  chaveLargura,
  fracaoInicial = 0.56,
  ocupado = false,
  className,
  'data-teste': dataTeste,
}: PropsPainelLateral) {
  const ref = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState<number | null>(null)
  // Largura da janela só depois de montar: no servidor não existe, e o HTML tem de bater.
  const [janela, setJanela] = useState(0)
  const [arrastando, setArrastando] = useState(false)

  // aoFechar/focoAoFechar mudam de identidade a cada render do pai; os ouvintes leem o atual.
  const fechar = useRef(aoFechar)
  const devolver = useRef(focoAoFechar)
  useEffect(() => {
    fechar.current = aoFechar
    devolver.current = focoAoFechar
  })

  // Largura: lembrada ou fração da janela; acompanha o redimensionamento da janela.
  useEffect(() => {
    const ajustar = () => {
      const w = janelaCss()
      setJanela(w)
      setLargura((atual) => limitarLargura(atual ?? lerLargura(chaveLargura) ?? larguraInicial(w, fracaoInicial), w))
    }
    ajustar()
    window.addEventListener('resize', ajustar)
    return () => window.removeEventListener('resize', ajustar)
  }, [chaveLargura, fracaoInicial])

  useEffect(() => {
    if (largura === null) return
    const raiz = document.documentElement
    raiz.style.setProperty('--painel-lateral-largura', `${largura}px`)
    raiz.dataset.painelLateral = 'aberto'
  }, [largura])
  useEffect(
    () => () => {
      const raiz = document.documentElement
      raiz.style.removeProperty('--painel-lateral-largura')
      delete raiz.dataset.painelLateral
    },
    [],
  )

  // Foco: entra no painel ao abrir e volta ao fechar. Se ninguém dentro já pegou (ex.: autoFocus
  // no primeiro campo), vai para o TÍTULO (aria-labelledby) — o leitor de tela anuncia o nome do
  // painel e o próximo Tab já cai nos controles. Focar o contêiner inteiro desenhava o contorno
  // de foco em volta do painel todo. O próprio painel só recebe foco se o título não existir.
  const rotulo = useRef(rotuloId)
  useEffect(() => {
    const painel = ref.current
    const abridor = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (painel && !painel.contains(document.activeElement)) {
      const titulo = document.getElementById(rotulo.current)
      if (titulo && painel.contains(titulo)) {
        if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1')
        titulo.dataset.painelFocoInicial = ''
        titulo.focus({ preventScroll: true })
      } else {
        painel.focus({ preventScroll: true })
      }
    }
    return () => {
      const ativo = document.activeElement
      // Clique fora já levou o foco para outro lugar de propósito: não roubar.
      if (ativo && ativo !== document.body && !painel?.contains(ativo)) return
      const alvo = devolver.current?.() ?? abridor
      if (alvo?.isConnected) alvo.focus({ preventScroll: true })
    }
  }, [])

  // Esc em qualquer lugar e clique fora.
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      e.preventDefault()
      fechar.current()
    }
    function ponteiro(e: PointerEvent) {
      const alvo = e.target
      if (!(alvo instanceof Element) || e.button !== 0) return
      if (ref.current?.contains(alvo)) return
      // barra de rolagem da página e elementos marcados para manter
      if (alvo === document.documentElement || alvo.closest(manter)) return
      fechar.current()
    }
    document.addEventListener('keydown', tecla)
    document.addEventListener('pointerdown', ponteiro)
    return () => {
      document.removeEventListener('keydown', tecla)
      document.removeEventListener('pointerdown', ponteiro)
    }
  }, [manter])

  // Tab preso: do último vai ao primeiro e vice-versa.
  function prenderTab(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !ref.current) return
    const lista = focaveis(ref.current)
    if (lista.length === 0) {
      e.preventDefault()
      return
    }
    const primeiro = lista[0]!
    const ultimo = lista[lista.length - 1]!
    const ativo = document.activeElement
    if (e.shiftKey && (ativo === primeiro || ativo === ref.current)) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && ativo === ultimo) {
      e.preventDefault()
      primeiro.focus()
    }
  }

  const mudarLargura = useCallback(
    (px: number) => {
      const nova = limitarLargura(px, janelaCss())
      setLargura(nova)
      gravarLargura(chaveLargura, nova)
    },
    [chaveLargura],
  )

  function comecarArrasto(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    e.preventDefault()
    const alca = e.currentTarget
    alca.setPointerCapture(e.pointerId)
    setArrastando(true)
    const mover = (ev: PointerEvent) => mudarLargura((window.innerWidth - ev.clientX) / escala())
    const soltar = () => {
      setArrastando(false)
      alca.removeEventListener('pointermove', mover)
      alca.removeEventListener('pointerup', soltar)
      alca.removeEventListener('pointercancel', soltar)
    }
    alca.addEventListener('pointermove', mover)
    alca.addEventListener('pointerup', soltar)
    alca.addEventListener('pointercancel', soltar)
  }

  function teclaAlca(e: React.KeyboardEvent<HTMLDivElement>) {
    if (largura === null) return
    // A alça fica na borda ESQUERDA: seta para a esquerda alarga.
    if (e.key === 'ArrowLeft') mudarLargura(largura + PASSO_TECLADO)
    else if (e.key === 'ArrowRight') mudarLargura(largura - PASSO_TECLADO)
    else if (e.key === 'Home') mudarLargura(Number.POSITIVE_INFINITY)
    else if (e.key === 'End') mudarLargura(0)
    else return
    e.preventDefault()
  }


  return (
    <div
      ref={ref}
      className={`painel-lateral${className ? ` ${className}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={rotuloId}
      aria-busy={ocupado || undefined}
      tabIndex={-1}
      onKeyDown={prenderTab}
      data-arrastando={arrastando || undefined}
      data-teste={dataTeste}
      style={largura === null ? undefined : { width: `${largura}px` }}
    >
      <div
        className="painel-lateral-alca"
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar painel"
        aria-valuenow={largura ?? undefined}
        aria-valuemin={janela ? limitarLargura(0, janela) : undefined}
        aria-valuemax={janela ? limitarLargura(Number.POSITIVE_INFINITY, janela) : undefined}
        tabIndex={0}
        onPointerDown={comecarArrasto}
        onKeyDown={teclaAlca}
        onDoubleClick={() => mudarLargura(larguraInicial(janelaCss(), fracaoInicial))}
      />
      {children}
    </div>
  )
}
