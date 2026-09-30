'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { totalPaginas } from '@/lib/clifor'
import { formatarDataHora, POR_PAGINA } from '@/lib/sac'
import { type FiltrosPosVenda, queryPosVenda } from '@/lib/sac-paineis'

import type { Opcoes, PainelPosVenda } from './tipos'

/**
 * "Gestão de Respostas do Pós-Venda" (`Group Pós - Venda` bUELT0, `Table D` bUEMt0, captura
 * sac-06). Diferenças deliberadas (sac.md §3.6): a busca por cliente SOMA ao filtro de
 * Pós-Venda (no Bubble ela o trocava pela campanha NPS escolhida na outra aba) e o campo
 * "Qual vendedora" do cabeçalho, que no Bubble não filtrava nada, filtra.
 */
export function PosVenda({
  filtros,
  painel,
  opcoes,
}: {
  filtros: FiltrosPosVenda
  painel: PainelPosVenda
  opcoes: Opcoes
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [texto, setTexto] = useState(filtros.q)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)

  function ir(m: Partial<FiltrosPosVenda>) {
    iniciar(() => router.replace(`/sac${queryPosVenda(filtros, m)}` as Route, { scroll: false }))
  }
  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => ir({ q: valor.trim(), pagina: 1 }), 400)
  }
  const paginas = totalPaginas(painel.total, POR_PAGINA)

  return (
    <>
      <header className="sac-topo">
        <div>
          <h1>Gestão de respostas do pós-venda</h1>
          <p className="sac-subtitulo">Avaliações de atendimento e produto enviadas pelos clientes</p>
        </div>
      </header>

      <section className="sac-filtros" aria-label="Filtros do pós-venda">
        <label className="campo sac-busca">
          <span>Buscar por cliente</span>
          <input type="search" value={texto} onChange={(e) => digitar(e.target.value)} placeholder="Digite parte do nome" spellCheck={false} />
        </label>
        <label className="campo">
          <span>Vendedora</span>
          <select value={filtros.vendedor ?? ''} onChange={(e) => ir({ vendedor: e.target.value || null, pagina: 1 })}>
            <option value="">Todas</option>
            {opcoes.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="sac-corpo" aria-label="Respostas do pós-venda" aria-busy={pendente}>
        {painel.falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar as respostas agora. Recarregue a página em instantes.
          </p>
        ) : null}
        <div className="sac-tabela-rolagem">
          <table className="sac-grade" data-teste="lista-pos-venda" data-pendente={pendente || undefined}>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Cliente</th>
                <th scope="col">Vendedora</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">
                  Nota atendimento
                </th>
                <th scope="col" className="num">
                  Nota produto
                </th>
                <th scope="col">Observação</th>
              </tr>
            </thead>
            <tbody>
              {painel.linhas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sac-grade-vazia">
                    {filtros.q || filtros.vendedor ? 'Nenhuma resposta com esses filtros.' : 'Nenhuma pesquisa de pós-venda ainda.'}
                  </td>
                </tr>
              ) : (
                painel.linhas.map((l) => (
                  <tr key={l.id}>
                    <td className="num-data">{formatarDataHora(l.criado_em)}</td>
                    <td className="sac-grade-cliente">{l.cliente?.nome ?? '—'}</td>
                    <td>{l.vendedor?.nome ?? '—'}</td>
                    <td>
                      <span className="selo" data-tom={l.resposta ? 'ok' : 'alerta'}>
                        {l.resposta ? 'Respondido' : 'Sem resposta'}
                      </span>
                    </td>
                    <td className="num">{l.resposta?.nota_atendimento ?? '—'}</td>
                    <td className="num">{l.resposta?.nota_produto ?? '—'}</td>
                    <td className="sac-grade-texto">{l.resposta?.criticas_sugestoes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {painel.total > POR_PAGINA ? (
          <div className="paginacao">
            <span>
              Página {filtros.pagina} de {paginas}
            </span>
            <nav aria-label="Paginação">
              <button type="button" className="botao-secundario" disabled={filtros.pagina <= 1 || pendente} onClick={() => ir({ pagina: filtros.pagina - 1 })}>
                <Icone icone={ChevronLeft} tamanho={16} />
                Anterior
              </button>
              <button type="button" className="botao-secundario" disabled={filtros.pagina >= paginas || pendente} onClick={() => ir({ pagina: filtros.pagina + 1 })}>
                Próxima
                <Icone icone={ChevronRight} tamanho={16} />
              </button>
            </nav>
          </div>
        ) : null}
      </section>
    </>
  )
}
