'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { formatarDataHora, ROTULO_STATUS } from '@/lib/rotinas'

import { lerExecucao } from './acoes'
import type { DetalheExecucao, LinhaAlvo, Rotina } from './tipos'

/** Amostra (seco) ou alterados (real): o que é, valor de antes, valor de depois. */
export function TabelaAlvo({
  linhas,
  total,
  rotuloAntes,
  rotuloDepois,
}: {
  linhas: LinhaAlvo[]
  total: number
  rotuloAntes: string
  rotuloDepois: string
}) {
  if (linhas.length === 0) return null
  return (
    <div className="rotina-alvo">
      <p className="rotina-ajuda">
        {linhas.length < total
          ? `Mostrando ${linhas.length} de ${total.toLocaleString('pt-BR')}.`
          : `${total.toLocaleString('pt-BR')} registro(s).`}
      </p>
      <ol className="rotina-alvo-lista" data-teste="amostra">
        <li className="rotina-alvo-linha rotina-alvo-cabecalho" aria-hidden="true">
          <span>Registro</span>
          <span>{rotuloAntes}</span>
          <span>{rotuloDepois}</span>
        </li>
        {linhas.map((l) => (
          <li key={l.id} className="rotina-alvo-linha">
            <span className="rotina-alvo-desc">{l.descricao}</span>
            <span>
              <span className="so-leitor">{rotuloAntes}: </span>
              {l.antes}
            </span>
            <span>
              <span className="so-leitor">{rotuloDepois}: </span>
              <strong>{l.depois}</strong>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Detalhe de uma execução do histórico, em <dialog> nativo. */
export function DialogoExecucao({
  id,
  rotinas,
  aoFechar,
}: {
  id: string
  rotinas: Rotina[]
  aoFechar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [dados, setDados] = useState<DetalheExecucao | { erro: string } | null>(null)

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  useEffect(() => {
    let vivo = true
    lerExecucao(id).then((r) => {
      if (vivo) setDados(r)
    })
    return () => {
      vivo = false
    }
  }, [id])

  const e = dados && 'execucao' in dados ? dados.execucao : null
  const nome = e ? (rotinas.find((r) => r.slug === e.rotina_slug)?.nome ?? e.rotina_slug) : 'Execução'
  const st = e ? (ROTULO_STATUS[e.status] ?? { texto: e.status }) : null

  return (
    <dialog ref={ref} className="dialogo rotina-dialogo" aria-labelledby="re-titulo" onClose={aoFechar} data-teste="detalhe-execucao">
      <header className="dialogo-cabecalho">
        <div>
          <p className="rotina-ajuda">{e ? (e.modo === 'real' ? 'Execução real' : 'Simulação') : 'Carregando…'}</p>
          <h2 id="re-titulo">{nome}</h2>
          {e && st ? (
            <p className="rotina-selos">
              <span className="selo" data-tom={st.tom}>
                {st.texto}
              </span>
              <span className="selo" data-tom={e.modo === 'real' ? 'erro' : undefined}>
                {e.modo === 'real' ? 'Real' : 'Simulação'}
              </span>
            </p>
          ) : null}
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>
      <div className="dialogo-corpo">
        {!dados ? (
          <div className="esqueleto" style={{ height: '8rem' }} />
        ) : 'erro' in dados ? (
          <p className="aviso" data-tom="erro" role="alert">
            {dados.erro}
          </p>
        ) : (
          <>
            <dl className="rotina-ficha">
              <div>
                <dt>Quem</dt>
                <dd>{dados.execucao.usuario?.nome ?? '—'}</dd>
              </div>
              <div>
                <dt>Início</dt>
                <dd>{formatarDataHora(dados.execucao.inicio)}</dd>
              </div>
              <div>
                <dt>Fim</dt>
                <dd>{formatarDataHora(dados.execucao.fim)}</dd>
              </div>
              <div>
                <dt>Linhas</dt>
                <dd>{dados.execucao.linhas_afetadas ?? '—'}</dd>
              </div>
              <div className="rotina-ficha-larga">
                <dt>Motivo</dt>
                <dd>{dados.execucao.motivo ?? '—'}</dd>
              </div>
              {dados.execucao.erro ? (
                <div className="rotina-ficha-larga">
                  <dt>Recusa / erro (texto do banco)</dt>
                  <dd>{dados.execucao.erro}</dd>
                </div>
              ) : null}
              <div className="rotina-ficha-larga">
                <dt>Parâmetros</dt>
                <dd>
                  <ul className="rotina-resumo">
                    {dados.resumo.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              {dados.execucao.simulacao_id ? (
                <div className="rotina-ficha-larga">
                  <dt>Simulação que autorizou</dt>
                  <dd>
                    <code>{dados.execucao.simulacao_id}</code>
                  </dd>
                </div>
              ) : null}
            </dl>
            {dados.linhas.length > 0 ? (
              <>
                <h3>{dados.execucao.modo === 'real' ? 'Registros alterados (valor anterior)' : 'Amostra da simulação'}</h3>
                <TabelaAlvo
                  linhas={dados.linhas}
                  total={dados.execucao.modo === 'real' ? dados.total : (dados.execucao.linhas_afetadas ?? dados.total)}
                  rotuloAntes={dados.execucao.modo === 'real' ? 'Antes' : 'Hoje'}
                  rotuloDepois="Depois"
                />
              </>
            ) : null}
          </>
        )}
      </div>
    </dialog>
  )
}
