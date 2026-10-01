'use client'

import { BarChart3, CircleCheck, CircleX, Clock3, RotateCcw, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import { somarReais } from '@/lib/metas'
import { agruparAnalise, type Categoria, type LinhaAnalise } from '@/lib/metas-relatorios'

import { type EntregaDaBarra, listarEntregasDaBarra } from './acoes'
import { type BarraVendedor, BarrasVendedor } from './graficos'

/**
 * "Análise de Entregas" — HTML A (bUEzP) da página metas no Bubble: três cartões (realizadas
 * por data de entrega; em andamento e canceladas por data PREVISTA), cada um com total de
 * entregas, comissão e uma barra por vendedor (altura = nº de entregas, rótulo = comissão).
 * Clicar numa barra lista as entregas contadas. O agregado vem do banco
 * (`fn_metas_analise_entregas`, db/027): Diretor vê os três com todos; os demais não veem
 * "realizadas" e veem só as próprias.
 */

const CARTOES: {
  chave: Categoria
  titulo: string
  sub: string
  comissao: string
  icone: LucideIcon
}[] = [
  { chave: 'realizada', titulo: 'Entregas realizadas', sub: 'por data de entrega', comissao: 'Comissão realizada', icone: CircleCheck },
  { chave: 'andamento', titulo: 'Entregas em andamento', sub: 'por data prevista de entrega', comissao: 'Comissão prevista', icone: Clock3 },
  { chave: 'cancelada', titulo: 'Entregas canceladas', sub: 'por data prevista de entrega', comissao: 'Comissão perdida', icone: CircleX },
]

function partesNome(nome: string) {
  const t = nome
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toLocaleUpperCase('pt-BR') + p.slice(1))
  return { primeiro: t[0] ?? '', resto: t.slice(1).join(' '), completo: t.join(' ') }
}

type Aberta = { categoria: (typeof CARTOES)[number]; barra: BarraVendedor; vendedorId: string | null }

export function AnaliseEntregas({
  linhas,
  diretor,
  inicio,
  fim,
  nomeDe,
}: {
  linhas: LinhaAnalise[]
  diretor: boolean
  inicio: string
  fim: string
  nomeDe: (id: string | null) => string
}) {
  const router = useRouter()
  const [atualizando, iniciar] = useTransition()
  const [aberta, setAberta] = useState<Aberta | null>(null)
  const cartoes = diretor ? CARTOES : CARTOES.filter((c) => c.chave !== 'realizada')

  return (
    <section className="mt-analise" aria-labelledby="mt-analise-titulo" data-teste="analise-entregas" aria-busy={atualizando}>
      <header className="mt-secao-cabeca">
        <span className="mt-secao-icone" aria-hidden="true">
          <BarChart3 />
        </span>
        <div>
          <h2 id="mt-analise-titulo">Análise de entregas</h2>
          <p>
            Comissão por vendedor de {formatarData(inicio)} a {formatarData(fim)}
            {diretor ? '' : ' · somente as suas'} · clique numa barra para ver as entregas contadas
          </p>
        </div>
        <button
          type="button"
          className="botao-secundario mt-botao-icone empurra"
          onClick={() => iniciar(() => router.refresh())}
          disabled={atualizando}
        >
          <Icone icone={RotateCcw} tamanho={16} />
          {atualizando ? 'Atualizando…' : 'Atualizar'}
        </button>
      </header>
      <div className="mt-analise-grade" data-colunas={cartoes.length}>
        {cartoes.map((c) => {
          const g = agruparAnalise(linhas, c.chave)
          const barras: BarraVendedor[] = g.grupos.map((x) => ({
            chave: x.vendedor_id ?? 'sem',
            ...partesNome(x.vendedor_id ? nomeDe(x.vendedor_id) : 'Sem vendedor'),
            qtd: x.qtd,
            comissao: x.comissao,
          }))
          const abrir = (b: BarraVendedor) => setAberta({ categoria: c, barra: b, vendedorId: b.chave === 'sem' ? null : b.chave })
          return (
            <article key={c.chave} className="mt-analise-cartao" data-categoria={c.chave} data-teste={`analise-${c.chave}`}>
              <header>
                <span className="mt-analise-icone" aria-hidden="true">
                  <c.icone />
                </span>
                <div>
                  <h3>{c.titulo}</h3>
                  <p>{c.sub}</p>
                </div>
              </header>
              <dl className="mt-analise-kpis">
                <div>
                  <dt>Total de entregas</dt>
                  <dd className="mt-num">{g.qtd}</dd>
                </div>
                <div>
                  <dt>{c.comissao}</dt>
                  <dd className="mt-num" data-destaque="">
                    {formatarReais(g.comissao)}
                  </dd>
                </div>
              </dl>
              {barras.length === 0 ? (
                <p className="mt-analise-vazio">Sem entregas no período.</p>
              ) : (
                <>
                  <BarrasVendedor
                    dados={barras}
                    cor={`var(--mt-cat-${c.chave})`}
                    descricao={`${c.titulo}: ${barras.map((b) => `${b.completo} ${b.qtd}`).join(', ')}`}
                    aoEscolher={abrir}
                  />
                  <ul className="mt-analise-nomes" style={{ gridTemplateColumns: `repeat(${barras.length}, minmax(0, 1fr))` }}>
                    {barras.map((b) => (
                      <li key={b.chave}>
                        <button type="button" onClick={() => abrir(b)} title={`${b.completo}: ver as ${b.qtd} entregas`}>
                          <b className="mt-num">{b.qtd}</b>
                          <span>{b.primeiro}</span>
                          <small>{b.resto}</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          )
        })}
      </div>
      {aberta ? (
        <ListaDaBarra
          key={`${aberta.categoria.chave}-${aberta.barra.chave}`}
          aberta={aberta}
          inicio={inicio}
          fim={fim}
          aoFechar={() => setAberta(null)}
        />
      ) : null}
    </section>
  )
}

function ListaDaBarra({
  aberta,
  inicio,
  fim,
  aoFechar,
}: {
  aberta: Aberta
  inicio: string
  fim: string
  aoFechar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [lista, setLista] = useState<EntregaDaBarra[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  useEffect(() => {
    let vivo = true
    listarEntregasDaBarra(inicio, fim, aberta.categoria.chave, aberta.vendedorId).then((r) => {
      if (!vivo) return
      if (r.erro !== undefined) setErro(r.erro)
      else setLista(r.dados)
    })
    return () => {
      vivo = false
    }
  }, [inicio, fim, aberta])

  const filtradas = useMemo(() => {
    const q = busca.trim().toLocaleLowerCase('pt-BR')
    return (lista ?? []).filter((e) => !q || `${e.fornecedor} ${e.cliente} ${e.numero_entrega}`.toLocaleLowerCase('pt-BR').includes(q))
  }, [lista, busca])

  return (
    <dialog
      ref={ref}
      className="dialogo mt-dialogo"
      data-largo=""
      aria-labelledby="mt-barra-titulo"
      onClose={aoFechar}
      data-teste="dialogo-barra"
    >
      <header className="dialogo-cabecalho">
        <div>
          <p className="mt-sobretitulo">
            {aberta.categoria.titulo} · {aberta.categoria.sub}
          </p>
          <h2 id="mt-barra-titulo">{aberta.barra.completo}</h2>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} />
        </button>
      </header>
      <div className="dialogo-corpo mt-barra-corpo">
        <label className="campo">
          <span>Buscar por fornecedor, cliente ou nº da entrega</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} autoComplete="off" />
        </label>
        {erro ? (
          <p className="aviso" data-tom="erro" role="alert">
            {erro}
          </p>
        ) : lista === null ? (
          <p className="mt-det-vazio">Buscando as entregas…</p>
        ) : (
          <div className="mt-det-rolagem">
            <table className="mt-det-tabela">
              <thead>
                <tr>
                  <th scope="col">Nº entrega</th>
                  <th scope="col">Fornecedor / cliente</th>
                  <th scope="col">Data</th>
                  <th scope="col" className="mt-det-num">
                    Valor venda
                  </th>
                  <th scope="col" className="mt-det-num">
                    Comissão
                  </th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((e) => (
                  <tr key={e.entrega_id}>
                    <td className="mt-num mt-det-forte">{e.numero_entrega ?? '—'}</td>
                    <td>
                      <span className="mt-det-gf">
                        <strong>{e.fornecedor ?? '—'}</strong>
                        <small>{e.cliente ?? '—'}</small>
                      </span>
                    </td>
                    <td className="mt-num">{formatarData(e.data)}</td>
                    <td className="mt-det-num mt-num">{formatarReais(e.valor_venda)}</td>
                    <td className="mt-det-num mt-num mt-det-forte">{formatarReais(e.valor_comissao)}</td>
                    <td>
                      <span className="selo">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <footer className="dialogo-rodape mt-barra-rodape">
        <dl>
          <div>
            <dt>Entregas</dt>
            <dd className="mt-num">{filtradas.length}</dd>
          </div>
          <div>
            <dt>Valor de venda</dt>
            <dd className="mt-num">{formatarReais(somarReais(filtradas.map((e) => e.valor_venda)))}</dd>
          </div>
          <div>
            <dt>{aberta.categoria.comissao}</dt>
            <dd className="mt-num">{formatarReais(somarReais(filtradas.map((e) => e.valor_comissao)))}</dd>
          </div>
        </dl>
        <button type="button" className="botao-secundario" onClick={() => ref.current?.close()}>
          Fechar
        </button>
      </footer>
    </dialog>
  )
}
