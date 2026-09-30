'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  CalendarRange,
  Download,
  ExternalLink,
  Inbox,
  PackageSearch,
  Search,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState, useTransition } from 'react'

import { SeletorPeriodo } from '@/componentes/seletor-periodo'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import {
  type FiltrosRelatorio,
  formatarNumero,
  type Medida,
  type Modelo,
  montarMatriz,
  rotuloMes,
  valorDaMedida,
} from '@/lib/relatorios'
import {
  type Direcao,
  type Extras,
  MESES_NOME,
  mesesDoPeriodo,
  ordenarPor,
  resumoLista,
} from '@/lib/relatorios-paineis'

import { type AlvoDetalhe, detalhar } from './acoes'
import { BarrasHorizontais, Colunas } from './graficos'
import { Cartao, Vazio } from './pecas'
import type { LinhaDetalhe, LinhaMes, LinhaProdutoGrupo, Vendedor } from './tipos'

const MODELOS: { id: Modelo; rotulo: string }[] = [
  { id: 'produtos', rotulo: 'Produtos' },
  { id: 'clientes', rotulo: 'Clientes' },
  { id: 'fornecedores', rotulo: 'Fornecedores' },
]
const MEDIDAS: { id: Medida; rotulo: string }[] = [
  { id: 'comissao', rotulo: 'Comissão MegaBox' },
  { id: 'venda', rotulo: 'Venda bruta' },
  { id: 'qtd', rotulo: 'Quantidade' },
]
/** Títulos do Bubble (`Text C`, `Text D`), agora sempre coerentes com o dado. */
const TITULO: Record<Modelo, string> = {
  produtos: 'Relatório de Entregas (Produto X Cliente X Fornecedor)',
  clientes: 'Relatório de Entregas (Clientes X Mês)',
  fornecedores: 'Relatório de Entregas (Fornecedores X Mês)',
}

const COMPACTO = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })
const compacto = (v: number) => COMPACTO.format(v)

function formatarMedida(v: string | number | null | undefined, m: Medida) {
  return m === 'qtd' ? formatarNumero(v) : formatarReais(v)
}

type Totais = { qtd: string | number; venda: string | number; comissao: string | number }
type Aberto = { titulo: string; alvo: AlvoDetalhe; totais: Totais }

// ------------------------------------------------------------- cabeçalho ordenável
function ThOrdena({
  rotulo,
  col,
  ordem,
  aoOrdenar,
  valor,
}: {
  rotulo: string
  col: string
  ordem: { col: string; dir: Direcao }
  aoOrdenar: (col: string) => void
  valor?: boolean
}) {
  const ativo = ordem.col === col
  return (
    <th scope="col" className={valor ? 'valor' : undefined} aria-sort={ativo ? (ordem.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="rel-ordenar" onClick={() => aoOrdenar(col)}>
        {rotulo}
        {ativo ? (
          ordem.dir === 'asc' ? <ArrowUp size={12} aria-hidden /> : <ArrowDown size={12} aria-hidden />
        ) : (
          <ArrowUpDown size={12} aria-hidden className="rel-ordenar-inativo" />
        )}
      </button>
    </th>
  )
}

/** Campo de filtro na linha de filtros: aplica com Enter ou ao sair do campo (cada troca é uma consulta). */
function FiltroColuna({
  valor,
  rotulo,
  maxLength,
  aoAplicar,
}: {
  valor: string
  rotulo: string
  maxLength?: number
  aoAplicar: (v: string) => void
}) {
  const [texto, setTexto] = useState(valor)
  useEffect(() => setTexto(valor), [valor])
  const aplicar = () => {
    if (texto.trim() !== valor) aoAplicar(texto.trim())
  }
  return (
    <input
      type="search"
      className={maxLength === 2 ? 'rel-filtro-coluna rel-filtro-uf' : 'rel-filtro-coluna'}
      value={texto}
      maxLength={maxLength ?? 80}
      placeholder={`Filtrar ${rotulo.toLowerCase()}`}
      aria-label={`Filtrar ${rotulo}`}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={aplicar}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          aplicar()
        }
      }}
    />
  )
}

// --------------------------------------------------------------------- detalhamento
function DialogoDetalhe({ aberto, query, aoFechar }: { aberto: Aberto | null; query: string; aoFechar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [linhas, setLinhas] = useState<LinhaDetalhe[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, iniciar] = useTransition()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) d.showModal()
    if (!aberto && d.open) d.close()
    if (!aberto) return
    setLinhas(null)
    setErro(null)
    iniciar(async () => {
      const r = await detalhar(query, aberto.alvo)
      if (r.ok) setLinhas(r.linhas)
      else setErro(r.erro)
    })
  }, [aberto, query])

  return (
    <dialog ref={ref} className="dialogo rel-dialogo-detalhe" onClose={aoFechar} aria-labelledby="rel-det-titulo">
      <header className="dialogo-cabecalho">
        <h2 id="rel-det-titulo">
          {aberto?.titulo}
          {linhas ? <small> · {linhas.length} entrega(s)</small> : null}
        </h2>
        <button type="button" className="dialogo-fechar" onClick={aoFechar} aria-label="Fechar">
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className="dialogo-corpo">
        {carregando || (!linhas && !erro) ? <p className="rel-carregando">Carregando entregas…</p> : null}
        {erro ? (
          <p className="aviso" data-tom="erro">
            {erro}
          </p>
        ) : null}
        {linhas ? (
          <div className="rel-rolagem rel-detalhe-rolagem">
            <table className="rel-tabela-simples rel-tabela-detalhe">
              <thead>
                <tr>
                  <th scope="col">Data entrega</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">UF</th>
                  <th scope="col">Fornecedor</th>
                  <th scope="col">Produto</th>
                  <th scope="col" className="valor">Qtd</th>
                  <th scope="col" className="valor">Vl unit venda</th>
                  <th scope="col" className="valor">Total venda</th>
                  <th scope="col" className="valor">Total comissão</th>
                  <th scope="col">Cotação</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.entrega_id}>
                    <td>{formatarData(l.dt_entrega)}</td>
                    <td>{l.cliente ?? '—'}</td>
                    <td>{l.uf_destino ?? '—'}</td>
                    <td>{l.fornecedor ?? '—'}</td>
                    <td>{l.produto ?? '—'}</td>
                    <td className="valor">{formatarNumero(l.qtd)}</td>
                    <td className="valor">{formatarReais(l.valor_venda_bruto_unit)}</td>
                    <td className="valor">{formatarReais(l.valor_venda_bruto)}</td>
                    <td className="valor">{formatarReais(l.valor_comissao)}</td>
                    <td>
                      {l.cotacao_id && l.cotacao_numero ? (
                        <Link
                          className="rel-link"
                          href={`/vendas?numero=${l.cotacao_numero}&sel=${l.cotacao_id}` as Route}
                          title="Abrir a cotação"
                        >
                          {l.cotacao_numero} <ExternalLink size={12} aria-hidden />
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {aberto ? (
                <tfoot>
                  <tr>
                    {/* Totais da CÉLULA clicada, vindos do banco — o diálogo não soma as linhas. */}
                    <th scope="row" colSpan={5}>
                      Total
                    </th>
                    <td className="valor">{formatarNumero(aberto.totais.qtd)}</td>
                    <td />
                    <td className="valor">{formatarReais(aberto.totais.venda)}</td>
                    <td className="valor">{formatarReais(aberto.totais.comissao)}</td>
                    <td />
                  </tr>
                </tfoot>
              ) : null}
            </table>
            {linhas.length >= 1000 ? <p className="rel-nota">Mostrando as primeiras 1.000 entregas.</p> : null}
          </div>
        ) : null}
      </div>
    </dialog>
  )
}

// -------------------------------------------------------------------------- produtos
function TabelaProdutos({
  linhas,
  extras,
  aoFiltrar,
  aoAbrir,
}: {
  linhas: LinhaProdutoGrupo[]
  extras: Extras
  aoFiltrar: (e: Partial<Extras>) => void
  aoAbrir: (a: Aberto) => void
}) {
  const [ordem, setOrdem] = useState<{ col: string; dir: Direcao }>({ col: 'venda', dir: 'desc' })
  const total = linhas.find((l) => l.nivel === 1)
  const corpo = linhas.filter((l) => l.nivel === 0)
  const chave: Record<string, (l: LinhaProdutoGrupo) => unknown> = {
    produto: (l) => l.produto,
    qtd: (l) => l.qtd,
    fornecedor: (l) => l.fornecedores[0] ?? null,
    uf: (l) => l.ufs[0] ?? null,
    cliente: (l) => l.clientes[0] ?? null,
    venda: (l) => l.valor_venda_bruto,
    comissao: (l) => l.valor_comissao,
  }
  const ordenadas = ordenarPor(corpo, chave[ordem.col] ?? chave.venda!, ordem.dir)
  const ordenar = (col: string) =>
    setOrdem((o) => ({ col, dir: o.col === col && o.dir === 'desc' ? 'asc' : o.col === col ? 'desc' : col === 'produto' ? 'asc' : 'desc' }))
  const abrir = (l: LinhaProdutoGrupo) =>
    l.produto_id &&
    aoAbrir({
      titulo: `${l.produto ?? ''}${extras.uf ? ` — UF ${extras.uf}` : ''}`,
      alvo: { tipo: 'produto', produtoId: l.produto_id },
      totais: { qtd: l.qtd, venda: l.valor_venda_bruto, comissao: l.valor_comissao },
    })

  return (
    <div className="rel-rolagem rel-matriz-rolagem">
      <table className="rel-matriz">
        <thead>
          <tr className="rel-matriz-cabeca">
            <ThOrdena rotulo="Produto" col="produto" ordem={ordem} aoOrdenar={ordenar} />
            <ThOrdena rotulo="Qtd" col="qtd" ordem={ordem} aoOrdenar={ordenar} valor />
            <ThOrdena rotulo="Fornecedor" col="fornecedor" ordem={ordem} aoOrdenar={ordenar} />
            <ThOrdena rotulo="UF" col="uf" ordem={ordem} aoOrdenar={ordenar} />
            <ThOrdena rotulo="Cliente" col="cliente" ordem={ordem} aoOrdenar={ordenar} />
            <ThOrdena rotulo="Total venda" col="venda" ordem={ordem} aoOrdenar={ordenar} valor />
            <ThOrdena rotulo="Total comissão" col="comissao" ordem={ordem} aoOrdenar={ordenar} valor />
          </tr>
          <tr className="rel-matriz-total">
            <th scope="row">TOTAL</th>
            <td className="valor">{formatarNumero(total?.qtd ?? 0)}</td>
            <td>{total ? `${total.fornecedores.length} fornecedor(es)` : ''}</td>
            <td title={total?.ufs.join(', ')}>{total ? `${total.ufs.length} UF(s)` : '—'}</td>
            <td>{total ? `${total.clientes.length} cliente(s)` : ''}</td>
            <td className="valor">{formatarReais(total?.valor_venda_bruto ?? 0)}</td>
            <td className="valor">{formatarReais(total?.valor_comissao ?? 0)}</td>
          </tr>
          <tr className="rel-matriz-filtros">
            <td>
              <FiltroColuna rotulo="Produto" valor={extras.produto} aoAplicar={(v) => aoFiltrar({ produto: v })} />
            </td>
            <td />
            <td>
              <FiltroColuna rotulo="Fornecedor" valor={extras.fornecedor} aoAplicar={(v) => aoFiltrar({ fornecedor: v })} />
            </td>
            <td>
              <FiltroColuna rotulo="UF" valor={extras.uf} maxLength={2} aoAplicar={(v) => aoFiltrar({ uf: v.toUpperCase() })} />
            </td>
            <td>
              <FiltroColuna rotulo="Cliente" valor={extras.cliente} aoAplicar={(v) => aoFiltrar({ cliente: v })} />
            </td>
            <td />
            <td />
          </tr>
        </thead>
        <tbody>
          {ordenadas.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <Vazio Icone={Inbox} texto="Nenhum registro para os filtros aplicados." />
              </td>
            </tr>
          ) : (
            ordenadas.map((l) => (
              <tr key={l.produto_id ?? l.produto}>
                <th scope="row">{l.produto}</th>
                <td className="valor">{formatarNumero(l.qtd)}</td>
                <td title={l.fornecedores.join(', ')}>{resumoLista(l.fornecedores)}</td>
                <td title={l.ufs.join(', ')}>{l.ufs.join(', ') || '—'}</td>
                <td title={l.clientes.join(', ')}>{resumoLista(l.clientes)}</td>
                <td className="valor">
                  <button type="button" className="rel-celula" onClick={() => abrir(l)} title="Ver as entregas">
                    {formatarReais(l.valor_venda_bruto)}
                  </button>
                </td>
                <td className="valor">
                  <button type="button" className="rel-celula" onClick={() => abrir(l)} title="Ver as entregas">
                    {formatarReais(l.valor_comissao)}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ----------------------------------------------------------------- Cliente/Fornecedor × Mês
function TabelaMes({
  linhas,
  eixo,
  medida,
  meses,
  extras,
  aoFiltrar,
  aoAbrir,
}: {
  linhas: LinhaMes[]
  eixo: 'clientes' | 'fornecedores'
  medida: Medida
  meses: string[]
  extras: Extras
  aoFiltrar: (e: Partial<Extras>) => void
  aoAbrir: (a: Aberto) => void
}) {
  const [ordem, setOrdem] = useState<{ col: string; dir: Direcao }>({ col: 'TOTAL', dir: 'desc' })
  const matriz = montarMatriz(linhas)
  const rotuloEixo = eixo === 'clientes' ? 'Cliente' : 'Fornecedor'
  const filtroNome = eixo === 'clientes' ? extras.cliente : extras.fornecedor
  const valorCol = (l: (typeof matriz.linhas)[number], col: string) =>
    col === 'nome' ? l.nome : col === 'uf' ? l.uf : col === 'TOTAL' ? valorDaMedida(l.total, medida) : valorDaMedida(l.celulas[col], medida)
  const ordenadas = ordenarPor(matriz.linhas, (l) => valorCol(l, ordem.col) ?? 0, ordem.dir)
  const ordenar = (col: string) =>
    setOrdem((o) => ({
      col,
      dir: o.col === col ? (o.dir === 'desc' ? 'asc' : 'desc') : col === 'nome' || col === 'uf' ? 'asc' : 'desc',
    }))
  const abrir = (l: (typeof matriz.linhas)[number], mes: string | null) => {
    const celula = mes ? l.celulas[mes] : l.total
    if (!celula) return
    const [a, m] = (mes ?? '').split('-')
    aoAbrir({
      titulo: `Entregas de ${l.nome}${l.uf ? ` (${l.uf})` : ''} em ${mes ? `${MESES_NOME[Number(m) - 1]}/${a}` : 'todo o período'}`,
      alvo: { tipo: 'celula', enderecoId: l.id, mes },
      totais: { qtd: celula.qtd, venda: celula.valor_venda_bruto, comissao: celula.valor_comissao },
    })
  }

  return (
    <div className="rel-rolagem rel-matriz-rolagem">
      <table className="rel-matriz rel-matriz-meses">
        <thead>
          <tr className="rel-matriz-cabeca">
            <ThOrdena rotulo={rotuloEixo} col="nome" ordem={ordem} aoOrdenar={ordenar} />
            <ThOrdena rotulo="UF" col="uf" ordem={ordem} aoOrdenar={ordenar} />
            {meses.map((mes) => (
              <ThOrdena key={mes} rotulo={rotuloMes(mes)} col={mes} ordem={ordem} aoOrdenar={ordenar} valor />
            ))}
            <ThOrdena rotulo="TOTAL" col="TOTAL" ordem={ordem} aoOrdenar={ordenar} valor />
          </tr>
          <tr className="rel-matriz-total">
            <th scope="row" colSpan={2}>
              TOTAL GERAL
            </th>
            {meses.map((mes) => (
              <td key={mes} className="valor">
                {formatarMedida(valorDaMedida(matriz.totaisMes[mes], medida) ?? 0, medida)}
              </td>
            ))}
            <td className="valor">{formatarMedida(valorDaMedida(matriz.totalGeral, medida) ?? 0, medida)}</td>
          </tr>
          <tr className="rel-matriz-filtros">
            <td>
              <FiltroColuna
                rotulo={rotuloEixo}
                valor={filtroNome}
                aoAplicar={(v) => aoFiltrar(eixo === 'clientes' ? { cliente: v } : { fornecedor: v })}
              />
            </td>
            <td>
              <FiltroColuna rotulo="UF" valor={extras.uf} maxLength={2} aoAplicar={(v) => aoFiltrar({ uf: v.toUpperCase() })} />
            </td>
            {meses.map((mes) => (
              <td key={mes} />
            ))}
            <td />
          </tr>
        </thead>
        <tbody>
          {ordenadas.length === 0 ? (
            <tr>
              <td colSpan={meses.length + 3}>
                <Vazio
                  Icone={Inbox}
                  texto={filtroNome || extras.uf ? 'Nenhum resultado corresponde ao filtro.' : 'Nenhuma entrega faturada no período.'}
                />
              </td>
            </tr>
          ) : (
            ordenadas.map((l) => (
              <tr key={l.id}>
                <th scope="row">{l.nome}</th>
                <td>{l.uf}</td>
                {meses.map((mes) => (
                  <td key={mes} className="valor">
                    {l.celulas[mes] ? (
                      <button type="button" className="rel-celula" onClick={() => abrir(l, mes)} title="Ver as entregas">
                        {formatarMedida(valorDaMedida(l.celulas[mes], medida), medida)}
                      </button>
                    ) : (
                      <span className="rel-zero">{formatarMedida(0, medida)}</span>
                    )}
                  </td>
                ))}
                <td className="valor rel-matriz-col-total">
                  <button type="button" className="rel-celula" onClick={() => abrir(l, null)} title="Ver as entregas">
                    {formatarMedida(valorDaMedida(l.total, medida), medida)}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ------------------------------------------------------------------------------ aba
export function AbaOutros({
  filtros,
  extras,
  produtos,
  mes,
  vendedores,
  veTodos,
  query,
  pendente,
  exportando,
  aoNavegar,
  aoExportar,
}: {
  filtros: FiltrosRelatorio
  extras: Extras
  produtos: LinhaProdutoGrupo[] | null
  mes: LinhaMes[] | null
  vendedores: Vendedor[]
  veTodos: boolean
  query: string
  pendente: boolean
  exportando: boolean
  aoNavegar: (m: Partial<FiltrosRelatorio>, e?: Partial<Extras>) => void
  aoExportar: () => void
}) {
  const [inicio, setInicio] = useState(filtros.inicio)
  const [fim, setFim] = useState(filtros.fim)
  const [aberto, setAberto] = useState<Aberto | null>(null)
  const filtrar = (e: Partial<Extras>) => aoNavegar({}, { ...extras, ...e, pagina: 1 })

  function pesquisar(e: FormEvent) {
    e.preventDefault()
    aoNavegar({ inicio, fim }, extras)
  }

  const meses = mesesDoPeriodo(filtros.inicio, filtros.fim)
  const matriz = mes ? montarMatriz(mes) : null
  const m = filtros.medida
  const numMedida = (l: LinhaMes | null | undefined) => Number(valorDaMedida(l, m) ?? 0) // só para desenhar
  const fmtGrafico = m === 'qtd' ? (v: number) => formatarNumero(v, 0) : compacto

  return (
    <div className="rel-painel">
      <form className="rel-filtros-cartao" onSubmit={pesquisar} aria-label="Filtros dos relatórios de entrega">
        <fieldset className="rel-modelo">
          <legend>Modelo de relatório</legend>
          {MODELOS.map((x) => (
            <label key={x.id} className="caixa">
              <input
                type="radio"
                name="modelo"
                value={x.id}
                checked={filtros.modelo === x.id}
                onChange={() => aoNavegar({ modelo: x.id, inicio, fim }, { pagina: 1 })}
              />
              {x.rotulo}
            </label>
          ))}
        </fieldset>
        <div className="campo rel-campo">
          <span>
            <CalendarRange size={12} aria-hidden /> Entrega
          </span>
          <SeletorPeriodo
            rotulo="Período de entrega"
            de={inicio}
            ate={fim}
            onChange={(de, ate) => {
              setInicio(de)
              setFim(ate)
            }}
            data-teste="filtro-periodo"
          />
        </div>
        {veTodos ? (
          <label className="campo rel-campo">
            <span>
              <UserRound size={12} aria-hidden /> Vendedor
            </span>
            <select value={filtros.vendedor ?? ''} onChange={(e) => aoNavegar({ vendedor: e.target.value || null, inicio, fim }, extras)}>
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {filtros.modelo !== 'produtos' ? (
          <label className="campo rel-campo">
            <span>Medida</span>
            <select value={m} onChange={(e) => aoNavegar({ medida: e.target.value as Medida, inicio, fim }, extras)}>
              {MEDIDAS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.rotulo}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="rel-acoes">
          <button type="submit" className="botao-primario rel-botao-icone" aria-busy={pendente} disabled={pendente}>
            <Search size={16} aria-hidden />
            {pendente ? 'Pesquisando…' : 'Pesquisar'}
          </button>
          <button
            type="button"
            className="botao-secundario rel-botao-icone"
            onClick={aoExportar}
            disabled={exportando}
            aria-busy={exportando}
          >
            <Download size={16} aria-hidden />
            {exportando ? 'Gerando…' : 'Baixar CSV'}
          </button>
        </div>
      </form>

      <div className="rel-outros-titulo">
        <h2>{TITULO[filtros.modelo]}</h2>
        <p>
          Entregas faturadas de {formatarData(filtros.inicio)} a {formatarData(filtros.fim)}
          {filtros.modelo !== 'produtos' ? ` · ${MEDIDAS.find((x) => x.id === m)?.rotulo}` : ''} · clique num valor para ver as
          entregas
        </p>
      </div>

      {filtros.modelo === 'produtos' && produtos ? (
        <>
          {produtos.some((l) => l.nivel === 0) ? (
            <Cartao
              Icone={PackageSearch}
              titulo="Maiores produtos por venda bruta"
              subtitulo="Top 10 do recorte"
              etiqueta={{ Icone: BarChart3, texto: 'Horizontal' }}
            >
              <BarrasHorizontais
                descricao="Os dez produtos com maior venda bruta no período"
                formatar={compacto}
                larguraNome={220}
                dados={ordenarPor(
                  produtos.filter((l) => l.nivel === 0),
                  (l) => l.valor_venda_bruto,
                  'desc',
                )
                  .slice(0, 10)
                  .map((l) => ({
                    chave: l.produto_id ?? String(l.produto),
                    nome: l.produto ?? '—',
                    valor: Number(l.valor_venda_bruto),
                    dica: 'Venda bruta',
                  }))}
              />
            </Cartao>
          ) : null}
          <TabelaProdutos linhas={produtos} extras={extras} aoFiltrar={filtrar} aoAbrir={setAberto} />
        </>
      ) : null}

      {filtros.modelo !== 'produtos' && mes && matriz ? (
        <>
          {matriz.linhas.length ? (
            <div className="rel-graficos-2 rel-graficos-meio">
              <Cartao
                Icone={BarChart3}
                titulo="Total por mês"
                subtitulo={MEDIDAS.find((x) => x.id === m)?.rotulo}
                etiqueta={{ Icone: BarChart3, texto: 'Colunas' }}
              >
                <Colunas
                  descricao="Total de cada mês do período"
                  formatar={fmtGrafico}
                  dados={meses.map((x) => ({ rotulo: rotuloMes(x), valor: numMedida(matriz.totaisMes[x]), dica: rotuloMes(x) }))}
                />
              </Cartao>
              <Cartao
                Icone={Truck}
                titulo={filtros.modelo === 'clientes' ? 'Maiores clientes' : 'Maiores fornecedores'}
                subtitulo="Top 10 no período"
                etiqueta={{ Icone: BarChart3, texto: 'Horizontal' }}
              >
                <BarrasHorizontais
                  descricao="Os dez maiores do período"
                  formatar={fmtGrafico}
                  larguraNome={220}
                  dados={ordenarPor(matriz.linhas, (l) => valorDaMedida(l.total, m) ?? 0, 'desc')
                    .slice(0, 10)
                    .map((l) => ({ chave: l.id, nome: l.nome, valor: numMedida(l.total), dica: 'Total' }))}
                />
              </Cartao>
            </div>
          ) : null}
          <TabelaMes
            linhas={mes}
            eixo={filtros.modelo}
            medida={m}
            meses={meses}
            extras={extras}
            aoFiltrar={filtrar}
            aoAbrir={setAberto}
          />
        </>
      ) : null}

      <DialogoDetalhe aberto={aberto} query={query} aoFechar={() => setAberto(null)} />
    </div>
  )
}
