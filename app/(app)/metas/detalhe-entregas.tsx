'use client'

import { FileSpreadsheet, FilterX, Printer, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import { compararReais, nomeDoMes, somarReais } from '@/lib/metas'
import { gerarXlsx, TIPO_XLSX } from '@/lib/xlsx-simples'

import { type EntregaDaMeta, listarEntregasDaMeta } from './acoes'
import type { LinhaMeta } from './tipos'

/**
 * Detalhamento do "Valor faturado" — `pop entregas` (bTvtb) com a tabela `rpg detalha entregas
 * vendedor` (bTvtc): TODAS as entregas que somam o valor da linha (db/027 D1), com os filtros
 * por coluna do Bubble (fornecedor, cliente, vendedor, NF, nº do pedido — WFs bTwBs…bTwCQ),
 * total no cabeçalho, "Exportar para Excel" (bUEUB, aqui .xlsx de verdade) e "Imprimir".
 * A lista vem do banco com a RLS de quem vê: o vendedor só abre a própria meta.
 */

const TIPOS: Record<number, string> = { 1: 'Regular', 2: 'Substituição' }

type Filtros = { fornecedor: string; cliente: string; vendedor: string; nf: string; pedido: string }
const SEM_FILTRO: Filtros = { fornecedor: '', cliente: '', vendedor: '', nf: '', pedido: '' }

const contem = (valor: string | null, busca: string) =>
  !busca || (valor ?? '').toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'))

function opcoes(lista: EntregaDaMeta[], id: (e: EntregaDaMeta) => string | null, nome: (e: EntregaDaMeta) => string) {
  const m = new Map<string, string>()
  for (const e of lista) {
    const k = id(e)
    if (k && !m.has(k)) m.set(k, nome(e))
  }
  return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
}

export function DetalheEntregas({
  linha,
  nome,
  nomeDe,
  aoFechar,
}: {
  linha: LinhaMeta
  nome: string
  nomeDe: (id: string | null) => string
  aoFechar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [lista, setLista] = useState<EntregaDaMeta[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [f, setF] = useState<Filtros>(SEM_FILTRO)
  const [imprimindo, setImprimindo] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  useEffect(() => {
    let vivo = true
    listarEntregasDaMeta(linha.meta_mensal_id).then((r) => {
      if (!vivo) return
      if (r.erro !== undefined) setErro(r.erro)
      else setLista(r.dados)
    })
    return () => {
      vivo = false
    }
  }, [linha.meta_mensal_id])

  // Impressão: a folha só existe no DOM enquanto imprime (portal em <body>, @media print).
  useEffect(() => {
    if (!imprimindo) return
    const depois = () => setImprimindo(false)
    window.addEventListener('afterprint', depois)
    const t = window.setTimeout(() => window.print(), 50)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('afterprint', depois)
    }
  }, [imprimindo])

  const filtradas = useMemo(
    () =>
      (lista ?? []).filter(
        (e) =>
          (!f.fornecedor || e.fornecedor_id === f.fornecedor) &&
          (!f.cliente || e.cliente_id === f.cliente) &&
          (!f.vendedor || e.vendedor_id === f.vendedor) &&
          contem(e.nf_fornecedor, f.nf) &&
          contem(e.numero_pedido, f.pedido),
      ),
    [lista, f],
  )
  const total = somarReais(filtradas.map((e) => e.valor_comissao))
  const totalGeral = somarReais((lista ?? []).map((e) => e.valor_comissao))
  const filtrando = Object.values(f).some(Boolean)
  const divergente = lista !== null && !filtrando && linha.realizado !== null && compararReais(totalGeral, linha.realizado) !== 0

  const fornecedores = useMemo(() => opcoes(lista ?? [], (e) => e.fornecedor_id, (e) => e.fornecedor ?? '—'), [lista])
  const clientes = useMemo(() => opcoes(lista ?? [], (e) => e.cliente_id, (e) => e.cliente ?? '—'), [lista])
  const vendedores = useMemo(() => opcoes(lista ?? [], (e) => e.vendedor_id, (e) => nomeDe(e.vendedor_id)), [lista, nomeDe])

  const periodo = `${formatarData(linha.periodo_inicio)} a ${formatarData(linha.periodo_fim)}`
  const titulo = `Entregas de ${nome}`

  function exportar() {
    const cab = [
      'Qtd',
      'Data entrega',
      'Fornecedor',
      'Filial fornecedor',
      'Cliente',
      'Filial cliente',
      'Vendedor',
      'Produto',
      'Comissão unit',
      'Valor comissão',
      'NF fornecedor',
      'Num pedido',
    ]
    const linhas = filtradas.map((e, i) => [
      `${i + 1}/${filtradas.length}`,
      formatarData(e.dt_entrega),
      e.fornecedor,
      e.fornecedor_filial,
      e.cliente,
      e.cliente_filial,
      nomeDe(e.vendedor_id),
      e.produto,
      e.valor_comissao_unit ? { numero: e.valor_comissao_unit, moeda: true } : null,
      e.valor_comissao ? { numero: e.valor_comissao, moeda: true } : null,
      e.nf_fornecedor,
      e.numero_pedido,
    ])
    const rodape = ['', '', '', '', '', '', '', '', 'Total', { numero: total, moeda: true }, '', '']
    const bytes = gerarXlsx('Entregas', [cab, ...linhas, rodape], [8, 12, 28, 22, 28, 22, 26, 26, 14, 16, 14, 12])
    const blob = new Blob([bytes as BlobPart], { type: TIPO_XLSX })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `metas-entregas-${nome.split(' ')[0]?.toLowerCase() ?? 'vendedor'}-${linha.competencia.slice(0, 7)}.xlsx`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const tabela = (paraImpressao: boolean) => (
    <table className="mt-det-tabela" data-teste={paraImpressao ? undefined : 'tabela-entregas-meta'}>
      <thead>
        <tr>
          <th scope="col" className="mt-det-num">
            Qtd
          </th>
          <th scope="col">Data entrega</th>
          <th scope="col">
            {paraImpressao ? 'Fornecedor' : <FiltroSelect rotulo="Fornecedor" valor={f.fornecedor} opcoes={fornecedores} aoMudar={(v) => setF({ ...f, fornecedor: v })} />}
          </th>
          <th scope="col">
            {paraImpressao ? 'Cliente' : <FiltroSelect rotulo="Cliente" valor={f.cliente} opcoes={clientes} aoMudar={(v) => setF({ ...f, cliente: v })} />}
          </th>
          <th scope="col">
            {paraImpressao ? 'Vendedor' : <FiltroSelect rotulo="Vendedor" valor={f.vendedor} opcoes={vendedores} aoMudar={(v) => setF({ ...f, vendedor: v })} />}
          </th>
          <th scope="col">Produto</th>
          <th scope="col" className="mt-det-num">
            Comissão unit
          </th>
          <th scope="col" className="mt-det-num">
            <span>Valor comissão</span>
            <strong className="mt-det-total" data-teste="total-entregas-meta">
              {formatarReais(total)}
            </strong>
          </th>
          <th scope="col">
            {paraImpressao ? 'NF fornecedor' : <FiltroTexto rotulo="NF fornecedor" valor={f.nf} aoMudar={(v) => setF({ ...f, nf: v })} />}
          </th>
          <th scope="col">
            {paraImpressao ? 'Num pedido' : <FiltroTexto rotulo="Num pedido" valor={f.pedido} aoMudar={(v) => setF({ ...f, pedido: v })} />}
          </th>
        </tr>
      </thead>
      <tbody>
        {filtradas.map((e, i) => (
          <tr key={e.entrega_id}>
            <td className="mt-det-num mt-det-fraco">
              {i + 1}/{filtradas.length}
            </td>
            <td className="mt-num">{formatarData(e.dt_entrega)}</td>
            <td>
              <GrupoFilial grupo={e.fornecedor} filial={e.fornecedor_filial} />
            </td>
            <td>
              <GrupoFilial grupo={e.cliente} filial={e.cliente_filial} />
            </td>
            <td>{nomeDe(e.vendedor_id)}</td>
            <td>{e.produto}</td>
            <td className="mt-det-num mt-num">{formatarReais(e.valor_comissao_unit)}</td>
            <td className="mt-det-num mt-num mt-det-forte">{formatarReais(e.valor_comissao)}</td>
            <td className="mt-num">{e.nf_fornecedor ?? '—'}</td>
            <td className="mt-num">{e.numero_pedido ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <>
      <dialog
        ref={ref}
        className="dialogo mt-dialogo mt-det"
        aria-labelledby="mt-det-titulo"
        onClose={aoFechar}
        data-teste="dialogo-entregas-meta"
      >
        <header className="dialogo-cabecalho mt-det-cabeca">
          <div>
            <p className="mt-sobretitulo">
              Valor faturado · {TIPOS[linha.tipo_meta_id]} · {nomeDoMes(linha.competencia)}
            </p>
            <h2 id="mt-det-titulo">{titulo}</h2>
            <p className="mt-det-sub">
              {lista === null ? 'Carregando…' : `${filtradas.length} de ${lista.length} entregas`} · {periodo}
            </p>
          </div>
          <div className="mt-det-acoes">
            <button type="button" className="botao-secundario mt-botao-icone" onClick={exportar} disabled={!lista?.length} data-teste="exportar-excel">
              <Icone icone={FileSpreadsheet} />
              Exportar para Excel
            </button>
            <button type="button" className="botao-secundario mt-botao-icone" onClick={() => setImprimindo(true)} disabled={!lista?.length} data-teste="imprimir">
              <Icone icone={Printer} />
              Imprimir
            </button>
            <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
              <Icone icone={X} />
            </button>
          </div>
        </header>
        <div className="dialogo-corpo mt-det-corpo">
          {erro ? (
            <p className="aviso" data-tom="erro" role="alert">
              {erro}
            </p>
          ) : lista === null ? (
            <p className="mt-det-vazio" aria-busy="true">
              Buscando as entregas…
            </p>
          ) : (
            <>
              {divergente ? (
                <p className="aviso" data-tom="info" role="status" data-teste="aviso-divergencia">
                  Meta fechada com {formatarReais(linha.realizado)}. As entregas que hoje atendem à regra somam{' '}
                  {formatarReais(totalGeral)} — a base mudou depois do fechamento.
                </p>
              ) : null}
              {filtrando ? (
                <div className="mt-det-filtros">
                  <span>Filtrando: total {formatarReais(total)} de {formatarReais(totalGeral)}</span>
                  <button type="button" className="botao-texto mt-botao-icone" onClick={() => setF(SEM_FILTRO)}>
                    <Icone icone={FilterX} tamanho={16} />
                    Limpar filtros
                  </button>
                </div>
              ) : null}
              {lista.length === 0 ? (
                <p className="mt-det-vazio">Nenhuma entrega no período desta meta.</p>
              ) : (
                <div className="mt-det-rolagem">{tabela(false)}</div>
              )}
            </>
          )}
        </div>
      </dialog>
      {imprimindo
        ? createPortal(
            <div className="mt-impressao">
              <header>
                <h1>Metas &amp; Bonus</h1>
                <p>
                  {nome} · {TIPOS[linha.tipo_meta_id]} · {periodo}
                </p>
                <p>
                  Emitido em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date())}
                  {' · '}
                  {filtradas.length} entregas · total {formatarReais(total)}
                </p>
              </header>
              {tabela(true)}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function GrupoFilial({ grupo, filial }: { grupo: string | null; filial: string | null }) {
  return (
    <span className="mt-det-gf">
      <strong>{grupo ?? '—'}</strong>
      {filial ? <small>{filial}</small> : null}
    </span>
  )
}

function FiltroSelect({
  rotulo,
  valor,
  opcoes,
  aoMudar,
}: {
  rotulo: string
  valor: string
  opcoes: [string, string][]
  aoMudar: (v: string) => void
}) {
  return (
    <label className="mt-det-filtro" data-ativo={valor ? '' : undefined}>
      <span className="so-leitor">Filtrar por {rotulo.toLowerCase()}</span>
      <select value={valor} onChange={(e) => aoMudar(e.target.value)}>
        <option value="">{rotulo}</option>
        {opcoes.map(([id, nome]) => (
          <option key={id} value={id}>
            {nome}
          </option>
        ))}
      </select>
    </label>
  )
}

function FiltroTexto({ rotulo, valor, aoMudar }: { rotulo: string; valor: string; aoMudar: (v: string) => void }) {
  return (
    <label className="mt-det-filtro" data-ativo={valor ? '' : undefined}>
      <span className="so-leitor">Filtrar por {rotulo.toLowerCase()}</span>
      <input value={valor} placeholder={rotulo} onChange={(e) => aoMudar(e.target.value)} inputMode="numeric" autoComplete="off" />
    </label>
  )
}
