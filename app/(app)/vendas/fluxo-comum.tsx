'use client'

import { useCallback, useState, useTransition } from 'react'

import { abrirArquivoEntrega } from './acoes-fluxo'
import type { Contato, EstadoAcao } from './tipos'

/*
 * Peças comuns da tela de proposta, pedido e entregas (proposta-tela, pedido-tela, entregas).
 *
 * AVISO DE CARREGAMENTO: toda action da tela passa por `useAcao` — é o ÚNICO lugar onde plugar
 * o toast global ("Enviando proposta…", componentes/aviso-acao*) quando ele chegar à main:
 * basta chamar o aviso em `executar` com o `rotulo` que cada botão já informa.
 */

export function Mensagem({ estado, teste = 'fluxo' }: { estado: EstadoAcao; teste?: string }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste={`erro-${teste}`}>
        {estado.erro}
      </p>
    )
  }
  if (estado.ok) {
    return (
      <p className="aviso" data-tom="ok" role="status" data-teste={`ok-${teste}`}>
        {estado.ok}
      </p>
    )
  }
  return null
}

type Acao = (anterior: EstadoAcao, form: FormData) => Promise<EstadoAcao>

/**
 * Roda uma server action com estado pendente (useTransition) e guarda o resultado. `rotulo` é o
 * texto do que está acontecendo ("Enviando proposta…"), mostrado no botão enquanto roda.
 */
export function useAcao() {
  const [pendente, iniciar] = useTransition()
  const [rodando, setRodando] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoAcao>({})
  const executar = useCallback(
    (acao: Acao, campos: FormData | Record<string, string | string[] | boolean | null | undefined>, rotulo: string, aoOk?: (r: EstadoAcao) => void) => {
      const form = campos instanceof FormData ? campos : formDe(campos)
      setRodando(rotulo)
      iniciar(async () => {
        const r = await acao({}, form)
        setEstado(r)
        setRodando(null)
        if (r.ok) aoOk?.(r)
      })
    },
    [],
  )
  return { pendente, rodando, estado, setEstado, executar }
}

export function formDe(campos: Record<string, string | string[] | boolean | null | undefined>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) {
    if (v === null || v === undefined || v === false) continue
    if (v === true) f.set(k, 'on')
    else if (Array.isArray(v)) for (const x of v) f.append(k, x)
    else f.set(k, v)
  }
  return f
}

export function OpcoesContato({ contatos, vazio }: { contatos: Contato[]; vazio: string }) {
  return (
    <>
      <option value="">{contatos.length ? 'Escolha o contato…' : vazio}</option>
      {contatos.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nome} — {c.email}
        </option>
      ))}
    </>
  )
}

/** Contato padrão: o gravado; sem ele, o único contato com e-mail (um clique a menos). */
export function contatoPadrao(gravado: string | null, contatos: Contato[]): string {
  if (gravado && contatos.some((c) => c.id === gravado)) return gravado
  return contatos.length === 1 ? contatos[0]!.id : ''
}

export async function abrirArquivo(path: string, aoErro: (m: string) => void) {
  // A aba abre no clique (bloqueador de pop-up) e recebe a URL assinada depois.
  // Sem 'noopener' aqui: com ele o window.open devolve null. O opener é cortado à mão.
  const aba = window.open('', '_blank')
  if (aba) aba.opener = null
  const r = await abrirArquivoEntrega(path)
  if ('url' in r) {
    if (aba) aba.location.href = r.url
    else window.open(r.url, '_blank', 'noopener')
  } else {
    aba?.close()
    aoErro(r.erro)
  }
}
