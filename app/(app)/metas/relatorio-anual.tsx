'use client'

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, FileBarChart, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import { formatarPercentual, paraEscala, somarReais } from '@/lib/metas'
import {
  agregarAnual,
  type Anual,
  type Base,
  type Celula,
  kpisAnuais,
  type LinhaAnual,
  MESES,
  MESES_CURTOS,
  mediaComMovimento,
  mediasTrimestrais,
  metasColetivas,
  origemDoMes,
  razao,
  ROTULO_BASE,
  ROTULO_VALOR,
  type ValorConsiderado,
} from '@/lib/metas-relatorios'
import { paraCsv } from '@/lib/relatorios'

import { carregarDetalheAnual, carregarRelatorioAnual, type LinhaDetalheAnual } from './acoes'
import { AreasMes, BarrasRanking, ColunasMes, type Fatia, type PontoMes, RoscaParticipacao } from './graficos'

/**
 * "Relatório Anual de Vendas" — HTML C (bUFCJ) da página metas no Bubble, visível só para
 * hierarquia ≤ 1: faturamento, metas e comissões mês a mês, com comparativo com o ano anterior.
 * Abas: Resumo do ano, Metas e comissões, Análises, Detalhamento. Filtros: ano, vendedor, base
 * do faturamento, valor considerado e busca na matriz. O agregado vem do banco
 * (`fn_metas_relatorio_anual`, db/027 R1–R6); aqui só se junta e divide, em decimal exato.
 */

type Aba = 'resumo' | 'metas' | 'analises' | 'detalhe'
const ABAS: { chave: Aba; nome: string }[] = [
  { chave: 'resumo', nome: 'Resumo do ano' },
  { chave: 'metas', nome: 'Metas e comissões' },
  { chave: 'analises', nome: 'Análises' },
  { chave: 'detalhe', nome: 'Detalhamento' },
]
type Metrica = 'atingido' | 'meta' | 'perc' | 'comissao'
const POR_PAGINA = 25

const n = (v: string | null | undefined) => Number(v ?? 0) // só para desenhar
const positivo = (v: string) => (paraEscala(v, 2) ?? 0n) > 0n
const primeiroNome = (s: string) => s.split(/\s+/).slice(0, 2).join(' ')
const pct = (r: string | null) => formatarPercentual(r, 1)
const faixa = (r: string | null) => {
  const x = paraEscala(r, 4)
  if (x === null) return undefined
  return x >= 10000n ? 'ok' : x >= 8000n ? 'alerta' : 'erro'
}

function hojeSP() {
  const [a, m] = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date()).split('-')
  return { ano: Number(a), mes: Number(m) - 1 }
}

export function RelatorioAnual({
  anoInicial,
  vendedores,
  nomeDe,
}: {
  anoInicial: number
  vendedores: { id: string; nome: string }[]
  nomeDe: (id: string | null) => string
}) {
  const hoje = hojeSP()
  const [ano, setAno] = useState(anoInicial)
  const [vendedor, setVendedor] = useState('')
  const [base, setBase] = useState<Base>('faturado')
  const [valor, setValor] = useState<ValorConsiderado>('comissao')
  const [busca, setBusca] = useState('')
  const [aba, setAba] = useState<Aba>('resumo')
  const [dados, setDados] = useState<{ atual: LinhaAnual[]; anterior: LinhaAnual[] } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    setCarregando(true)
    carregarRelatorioAnual(ano, valor).then((r) => {
      if (!vivo) return
      setCarregando(false)
      if (r.erro !== undefined) {
        setErro(r.erro)
        return
      }
      setErro(null)
      setDados(r.dados)
      setAtualizadoEm(new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date()))
    })
    return () => {
      vivo = false
    }
  }, [ano, valor, versao])

  const filtro = vendedor || null
  const calc = useMemo(() => {
    if (!dados) return null
    const atual = agregarAnual(dados.atual, filtro)
    const anterior = dados.anterior.length ? agregarAnual(dados.anterior, filtro) : null
    const metas = metasColetivas(dados.atual, dados.anterior)
    const mesCorrente = ano === hoje.ano ? hoje.mes : ano > hoje.ano ? -1 : null
    return { atual, anterior, metas, mesCorrente, kpis: kpisAnuais(atual, anterior, metas, base, mesCorrente) }
  }, [dados, filtro, ano, base, hoje.ano, hoje.mes])

  const anos = Array.from({ length: 5 }, (_, i) => hoje.ano - i)
  const comDados = new Set([...(dados?.atual ?? []), ...(dados?.anterior ?? [])].map((l) => l.vendedor_id).filter(Boolean))
  const opcoesVendedor = vendedores.filter((v) => comDados.has(v.id)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const exportarCsv = useCallback(async () => {
    if (!calc) return
    const { atual, metas, mesCorrente } = calc
    const linhas: (string | number | null)[][] = []
    linhas.push([`RESUMO MENSAL ${ano}`])
    linhas.push(['Mês', 'Fechado', 'Entregue', 'Cancelado', 'Faturado/Recebido', 'Meta', '% da meta', 'Comissão vendedores', 'Comissão MegaBox', 'Origem'])
    atual.meses.forEach((m, i) =>
      linhas.push([
        MESES[i]!,
        m.fechado,
        m.entregue,
        m.cancelado,
        m.faturado,
        metas[i]!.valor,
        pct(razao(m[base], metas[i]!.valor)),
        m.comVend,
        m.comMega,
        i === mesCorrente ? 'Mês em andamento' : 'Mês encerrado',
      ]),
    )
    linhas.push([])
    linhas.push([`VENDEDOR X MÊS · ${ROTULO_BASE[base]}`])
    linhas.push(['Vendedor', ...MESES, 'Total ano', 'Meta ano', '% da meta', 'Comissão ano'])
    ;[...atual.vendedores]
      .sort((a, b) => n(b.total[base]) - n(a.total[base]))
      .forEach((v) =>
        linhas.push([
          nomeDe(v.id),
          ...v.meses.map((c) => c[base]),
          v.total[base],
          v.total.meta,
          pct(razao(v.total[base], v.total.meta)),
          v.total.comVend,
        ]),
      )
    linhas.push([])
    linhas.push(['ENTREGAS DETALHADAS'])
    linhas.push(['Entrega', 'Data', 'Mês', 'Vendedor', 'Status', 'Venda bruta', 'Venda líquida', 'Comissão', 'Origem'])
    for (let pagina = 1; pagina <= 40; pagina++) {
      const r = await carregarDetalheAnual({ ano, valor, base, vendedor: filtro, pagina, porPagina: 500 })
      if (r.erro || !r.dados) break
      for (const l of r.dados)
        linhas.push([
          l.numero_entrega,
          formatarData(l.data),
          MESES[l.mes - 1] ?? '',
          nomeDe(l.vendedor_id),
          l.status,
          l.venda_bruta,
          l.venda_liquida,
          l.comissao,
          l.fechado ? 'Mês encerrado' : 'Mês em andamento',
        ])
      if (r.dados.length < 500) break
    }
    const blob = new Blob([paraCsv(linhas[0] as string[], linhas.slice(1))], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `megabox-vendas-${ano}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }, [calc, ano, base, valor, filtro, nomeDe])

  return (
    <section className="mt-anual" aria-labelledby="mt-anual-titulo" data-teste="relatorio-anual">
      <header className="mt-secao-cabeca">
        <span className="mt-secao-icone" aria-hidden="true">
          <FileBarChart />
        </span>
        <div>
          <h2 id="mt-anual-titulo">Relatório anual de vendas</h2>
          <p>Faturamento, metas e comissões mês a mês, com comparativo com o ano anterior</p>
        </div>
        <div className="mt-anual-acoes empurra">
          {atualizadoEm ? <span className="mt-anual-hora">Atualizado às {atualizadoEm}</span> : null}
          <button type="button" className="botao-secundario mt-botao-icone" onClick={exportarCsv} disabled={!calc} data-teste="anual-csv">
            <Icone icone={Download} tamanho={16} />
            Exportar CSV
          </button>
          <button
            type="button"
            className="botao-primario mt-botao-icone"
            onClick={() => setVersao((v) => v + 1)}
            disabled={carregando}
            aria-busy={carregando}
          >
            <Icone icone={RefreshCw} tamanho={16} />
            {carregando ? 'Atualizando…' : 'Atualizar dados'}
          </button>
        </div>
      </header>

      <div className="mt-anual-filtros" role="group" aria-label="Filtros do relatório anual">
        <label className="campo">
          <span>Ano</span>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))} data-teste="anual-ano">
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Vendedor</span>
          <select value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
            <option value="">Todos os vendedores</option>
            {opcoesVendedor.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Base do faturamento</span>
          <select value={base} onChange={(e) => setBase(e.target.value as Base)}>
            {(Object.keys(ROTULO_BASE) as Base[]).map((b) => (
              <option key={b} value={b}>
                {ROTULO_BASE[b]}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Valor considerado</span>
          <select value={valor} onChange={(e) => setValor(e.target.value as ValorConsiderado)}>
            {(Object.keys(ROTULO_VALOR) as ValorConsiderado[]).map((v) => (
              <option key={v} value={v}>
                {ROTULO_VALOR[v]}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Buscar vendedor na matriz</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite um nome" autoComplete="off" />
        </label>
      </div>

      <div className="abas mt-anual-abas" role="tablist" aria-label="Seções do relatório anual">
        {ABAS.map((a) => (
          <button
            key={a.chave}
            type="button"
            role="tab"
            id={`mt-anual-aba-${a.chave}`}
            aria-selected={aba === a.chave}
            aria-controls="mt-anual-painel"
            onClick={() => setAba(a.chave)}
            data-teste={`anual-aba-${a.chave}`}
          >
            {a.nome}
          </button>
        ))}
      </div>

      <div id="mt-anual-painel" role="tabpanel" aria-labelledby={`mt-anual-aba-${aba}`} aria-busy={carregando} className="mt-anual-painel">
        {erro ? (
          <p className="aviso" data-tom="erro" role="alert">
            {erro}
          </p>
        ) : !calc ? (
          <p className="mt-det-vazio">Buscando as vendas de {ano}…</p>
        ) : aba === 'resumo' ? (
          <Resumo calc={calc} base={base} ano={ano} />
        ) : aba === 'metas' ? (
          <MetasComissoes atual={calc.atual} metas={calc.metas} base={base} busca={busca} nomeDe={nomeDe} mesCorrente={calc.mesCorrente} />
        ) : aba === 'analises' ? (
          <Analises calc={calc} base={base} ano={ano} nomeDe={nomeDe} />
        ) : (
          <Detalhe ano={ano} valor={valor} base={base} vendedor={filtro} nomeDe={nomeDe} />
        )}
      </div>
    </section>
  )
}

type Calc = {
  atual: Anual
  anterior: Anual | null
  metas: ReturnType<typeof metasColetivas>
  mesCorrente: number | null
  kpis: ReturnType<typeof kpisAnuais>
}

// ------------------------------------------------------------------ Resumo do ano
function Resumo({ calc, base, ano }: { calc: Calc; base: Base; ano: number }) {
  const { atual, anterior, metas, mesCorrente, kpis: k } = calc
  const iProx = mesCorrente !== null && mesCorrente >= 0 ? mesCorrente : 0
  const mc = metas[iProx]!
  const tri = mediasTrimestrais(atual.meses, base)
  const metaAno = somarReais(metas.map((m) => m.valor))
  const cartoes: { rotulo: string; valor: string; detalhe: React.ReactNode; tom?: string }[] = [
    {
      rotulo: 'Faturamento no ano',
      valor: formatarReais(k.faturado),
      detalhe:
        k.variacao === null ? (
          'sem base no ano anterior'
        ) : (
          <>
            <span className="mt-delta" data-sobe={!k.variacao.startsWith('-') || undefined}>
              <Icone icone={k.variacao.startsWith('-') ? ArrowDown : ArrowUp} tamanho={14} /> {pct(k.variacao.replace('-', ''))}
            </span>{' '}
            vs {ano - 1}
          </>
        ),
    },
    {
      rotulo: 'Meta acumulada',
      valor: formatarReais(k.metaAcumulada),
      detalhe: k.pctMeta ? (
        <>
          <span className="selo" data-tom={faixa(k.pctMeta)}>
            {pct(k.pctMeta)} da meta
          </span>{' '}
          coletiva
        </>
      ) : (
        'sem meta calculada'
      ),
    },
    { rotulo: 'Média mensal', valor: formatarReais(k.media), detalhe: `${k.mesesComMovimento} ${k.mesesComMovimento === 1 ? 'mês' : 'meses'} com movimento` },
    { rotulo: 'Comissão vendedores', valor: formatarReais(k.comVend), detalhe: `MegaBox: ${formatarReais(k.comMega)}`, tom: 'ok' },
    {
      rotulo: 'Em aberto (não faturado)',
      valor: formatarReais(k.emAberto),
      detalhe: `${formatarReais(k.fechado)} fechado · ${formatarReais(atual.total.faturado)} faturado`,
      tom: 'alerta',
    },
    { rotulo: 'Cancelado no ano', valor: formatarReais(k.cancelado), detalhe: k.pctCancelado ? `${pct(k.pctCancelado)} do total fechado` : '—', tom: 'erro' },
  ]
  return (
    <div className="mt-anual-resumo">
      <ul className="mt-anual-kpis">
        {cartoes.map((c) => (
          <li key={c.rotulo} data-tom={c.tom}>
            <span>{c.rotulo}</span>
            <strong className="mt-num">{c.valor}</strong>
            <small>{c.detalhe}</small>
          </li>
        ))}
      </ul>
      <div className="mt-anual-resumo-corpo">
        <div className="mt-tabela-rolagem">
          <table className="mt-anual-tabela" data-teste="anual-mensal">
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col">Fechado</th>
                <th scope="col">Entregue</th>
                <th scope="col">Cancelado</th>
                <th scope="col">Faturado / recebido</th>
                <th scope="col">Meta</th>
                <th scope="col">% da meta</th>
                <th scope="col">Comissão vendedores</th>
                <th scope="col">Comissão MegaBox</th>
                <th scope="col">Origem</th>
              </tr>
            </thead>
            <tbody>
              {atual.meses.map((m, i) => {
                const origem = origemDoMes(m, i, atual.encerrado[i]!, mesCorrente)
                const r = origem === 'sem-lancamento' ? null : razao(m[base], metas[i]!.valor)
                return (
                  <tr key={i} data-atual={i === mesCorrente || undefined}>
                    <th scope="row">{MESES[i]}</th>
                    <td>{valorOuTraco(m.fechado)}</td>
                    <td>{valorOuTraco(m.entregue)}</td>
                    <td data-tom={positivo(m.cancelado) ? 'erro' : undefined}>{valorOuTraco(m.cancelado)}</td>
                    <td className="mt-det-forte">{valorOuTraco(m.faturado)}</td>
                    <td>
                      {formatarReais(metas[i]!.valor)}
                      {metas[i]!.noPiso ? <small className="mt-anual-piso"> piso</small> : null}
                    </td>
                    <td>{r ? <span className="selo" data-tom={faixa(r)}>{pct(r)}</span> : <span className="mt-traco">—</span>}</td>
                    <td>{valorOuTraco(m.comVend)}</td>
                    <td>{valorOuTraco(m.comMega)}</td>
                    <td>
                      <span className="selo" data-tom={{ 'sem-lancamento': undefined, andamento: 'alerta', encerrado: 'info', 'sem-fechamento': 'alerta' }[origem]}>
                        {{ 'sem-lancamento': 'sem lançamento', andamento: 'em andamento', encerrado: 'encerrado', 'sem-fechamento': 'sem fechamento' }[origem]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total {ano}</th>
                <td>{formatarReais(atual.total.fechado)}</td>
                <td>{formatarReais(atual.total.entregue)}</td>
                <td>{formatarReais(atual.total.cancelado)}</td>
                <td>{formatarReais(atual.total.faturado)}</td>
                <td>{formatarReais(metaAno)}</td>
                <td>{pct(razao(atual.total[base], metaAno))}</td>
                <td>{formatarReais(atual.total.comVend)}</td>
                <td>{formatarReais(atual.total.comMega)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <aside className="mt-anual-lateral">
          <div className="mt-anual-quadro">
            <h3>Média mensal por trimestre</h3>
            {tri.map((v, i) => (
              <p key={i}>
                <span>{i + 1}º trimestre</span>
                <b className="mt-num">{v ? formatarReais(v) : '—'}</b>
              </p>
            ))}
          </div>
          <div className="mt-anual-quadro">
            <h3>Referências</h3>
            <p data-destaque="">
              <span>Meta de {MESES[iProx]}</span>
              <b className="mt-num">{formatarReais(mc.valor)}</b>
            </p>
            <p>
              <span>Média dos 3 meses anteriores</span>
              <b className="mt-num">{formatarReais(mc.media)}</b>
            </p>
            <p>
              <span>Média + 25%</span>
              <b className="mt-num">{formatarReais(mc.projetada)}</b>
            </p>
            <p>
              <span>Piso da meta{mc.noPiso ? ' (em uso)' : ''}</span>
              <b className="mt-num">{formatarReais('80000.00')}</b>
            </p>
            <p>
              <span>Média mensal do ano</span>
              <b className="mt-num">{formatarReais(mediaComMovimento(atual.meses.map((m) => m[base])) ?? '0')}</b>
            </p>
            <p>
              <span>Faturado em {ano - 1}</span>
              <b className="mt-num">{anterior && positivo(anterior.total[base]) ? formatarReais(anterior.total[base]) : 'sem dados'}</b>
            </p>
            <p>
              <span>Meta acumulada do ano</span>
              <b className="mt-num">{formatarReais(metaAno)}</b>
            </p>
            <p>
              <span>Pendente de faturamento</span>
              <b className="mt-num">{formatarReais(k.emAberto)}</b>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function valorOuTraco(v: string) {
  return positivo(v) ? formatarReais(v) : <span className="mt-traco">—</span>
}

// ------------------------------------------------------------------ Metas e comissões
function MetasComissoes({
  atual,
  metas,
  base,
  busca,
  nomeDe,
  mesCorrente,
}: {
  atual: Anual
  metas: Calc['metas']
  base: Base
  busca: string
  nomeDe: (id: string | null) => string
  mesCorrente: number | null
}) {
  const [metrica, setMetrica] = useState<Metrica>('atingido')
  const ordenados = [...atual.vendedores].sort((a, b) => n(b.total[base]) - n(a.total[base]))
  const grade = ordenados.slice(0, 12)
  const q = busca.trim().toLocaleLowerCase('pt-BR')
  const matriz = ordenados.filter((v) => !q || nomeDe(v.id).toLocaleLowerCase('pt-BR').includes(q))

  const valorMetrica = (c: Celula): string | null =>
    metrica === 'atingido' ? c[base] : metrica === 'meta' ? c.meta : metrica === 'comissao' ? c.comVend : razao(c[base], c.meta)
  const maximo = Math.max(1, ...matriz.flatMap((v) => v.meses.map((c) => (metrica === 'perc' ? 0 : n(valorMetrica(c))))))
  const celula = (c: Celula) => {
    const v = valorMetrica(c)
    if (v === null || (paraEscala(v, 4) ?? 0n) <= 0n) return { texto: '—', estilo: undefined, tom: undefined }
    if (metrica === 'perc') return { texto: pct(v), estilo: undefined, tom: faixa(v) }
    const a = Math.min(0.9, 0.08 + (n(v) / maximo) * 0.82)
    return { texto: formatarReais(v).replace(/,\d{2}$/, ''), estilo: { '--calor': `${Math.round(a * 100)}%` } as React.CSSProperties, tom: a > 0.5 ? 'forte' : undefined }
  }

  if (grade.length === 0) return <p className="mt-det-vazio">Nenhum vendedor com meta ou venda neste ano.</p>
  return (
    <div className="mt-anual-metas">
      <div className="mt-anual-bloco">
        <h3>Grade de metas</h3>
        <p className="mt-nota">
          {grade.length} {grade.length === 1 ? 'vendedor' : 'vendedores'} · meta, atingido ({ROTULO_BASE[base].toLowerCase()}) e comissão de cada mês.
          Atingido em verde bateu a meta do vendedor; em vermelho, não.
        </p>
        <div className="mt-tabela-rolagem">
          <table className="mt-anual-grade" data-teste="anual-grade">
            <thead>
              <tr>
                <th scope="col" colSpan={2}>
                  Mês
                </th>
                {grade.map((v) => (
                  <th key={v.id ?? 'sem'} scope="col" title={nomeDe(v.id)}>
                    {primeiroNome(nomeDe(v.id))}
                  </th>
                ))}
                <th scope="col">MegaBox</th>
              </tr>
            </thead>
            <tbody>
              {MESES.map((mes, i) => (
                <GradeMes key={mes} i={i} grade={grade} base={base} metaColetiva={metas[i]!.valor} total={atual.meses[i]!} atual={i === mesCorrente} />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <th scope="row">Atingiu</th>
                {grade.map((v) => (
                  <td key={v.id ?? 'sem'}>{formatarReais(v.total[base])}</td>
                ))}
                <td>{formatarReais(atual.total[base])}</td>
              </tr>
              <tr>
                <th scope="row" />
                <th scope="row">Comissão</th>
                {grade.map((v) => (
                  <td key={v.id ?? 'sem'}>{formatarReais(v.total.comVend)}</td>
                ))}
                <td>{formatarReais(atual.total.comVend)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-anual-bloco">
        <div className="mt-anual-bloco-cabeca">
          <div>
            <h3>Mapa de calor vendedor × mês</h3>
            <p className="mt-nota">
              {matriz.length} {matriz.length === 1 ? 'vendedor' : 'vendedores'} · quanto mais escura a célula, maior o valor.
            </p>
          </div>
          <div className="mt-segmentos" role="group" aria-label="Métrica do mapa">
            {(
              [
                ['atingido', 'Atingido'],
                ['meta', 'Meta'],
                ['perc', '% da meta'],
                ['comissao', 'Comissão'],
              ] as [Metrica, string][]
            ).map(([m, r]) => (
              <button key={m} type="button" aria-pressed={metrica === m} onClick={() => setMetrica(m)}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-tabela-rolagem">
          <table className="mt-anual-matriz" data-teste="anual-matriz">
            <thead>
              <tr>
                <th scope="col">Vendedor</th>
                {MESES_CURTOS.map((m, i) => (
                  <th key={m} scope="col" data-atual={i === mesCorrente || undefined}>
                    {m}
                  </th>
                ))}
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {matriz.map((v) => (
                <tr key={v.id ?? 'sem'}>
                  <th scope="row">{nomeDe(v.id)}</th>
                  {v.meses.map((c, i) => {
                    const x = celula(c)
                    return (
                      <td key={i} className="mt-calor" style={x.estilo} data-tom={x.tom} data-perc={metrica === 'perc' || undefined}>
                        {x.texto}
                      </td>
                    )
                  })}
                  <td className="mt-det-forte">
                    {metrica === 'perc' ? pct(razao(v.total[base], v.total.meta)) : formatarReais(valorMetrica(v.total) ?? '0')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GradeMes({
  i,
  grade,
  base,
  metaColetiva,
  total,
  atual,
}: {
  i: number
  grade: Anual['vendedores']
  base: Base
  metaColetiva: string
  total: Celula
  atual: boolean
}) {
  return (
    <>
      <tr className="mt-grade-meta" data-atual={atual || undefined}>
        <th scope="rowgroup" rowSpan={3}>
          {MESES[i]}
        </th>
        <th scope="row">Meta</th>
        {grade.map((v) => (
          <td key={v.id ?? 'sem'}>{valorOuTraco(v.meses[i]!.meta)}</td>
        ))}
        <td>{formatarReais(metaColetiva)}</td>
      </tr>
      <tr data-atual={atual || undefined}>
        <th scope="row">Atingiu</th>
        {grade.map((v) => {
          const c = v.meses[i]!
          if (!positivo(c[base])) return <td key={v.id ?? 'sem'}>{valorOuTraco('0')}</td>
          if (!positivo(c.meta)) return <td key={v.id ?? 'sem'}>{formatarReais(c[base])}</td>
          const bateu = (paraEscala(c[base], 2) ?? 0n) >= (paraEscala(c.meta, 2) ?? 0n)
          return (
            <td key={v.id ?? 'sem'}>
              <span className="selo" data-tom={bateu ? 'ok' : 'erro'}>
                {formatarReais(c[base])}
              </span>
            </td>
          )
        })}
        <td className="mt-det-forte">{valorOuTraco(total[base])}</td>
      </tr>
      <tr className="mt-grade-fim" data-atual={atual || undefined}>
        <th scope="row">Comissão</th>
        {grade.map((v) => (
          <td key={v.id ?? 'sem'}>{valorOuTraco(v.meses[i]!.comVend)}</td>
        ))}
        <td>{valorOuTraco(total.comVend)}</td>
      </tr>
    </>
  )
}

// ------------------------------------------------------------------ Análises
const CAT = Array.from({ length: 8 }, (_, i) => `var(--mt-cat-${i + 1})`)

function Analises({ calc, base, ano, nomeDe }: { calc: Calc; base: Base; ano: number; nomeDe: (id: string | null) => string }) {
  const { atual, anterior, metas } = calc
  const ponto = (i: number, series: Record<string, string>): PontoMes => {
    const p: PontoMes = { mes: MESES_CURTOS[i]! }
    for (const [k, v] of Object.entries(series)) {
      p[k] = n(v)
      p[`${k}_txt`] = v
    }
    return p
  }
  const fluxo = atual.meses.map((m, i) => ponto(i, { atual: m[base], anterior: anterior?.meses[i]![base] ?? '0' }))
  const metaXating = atual.meses.map((m, i) => ponto(i, { atingido: m[base], meta: metas[i]!.valor }))
  const comissoes = atual.meses.map((m, i) => ponto(i, { vend: m.comVend, mega: m.comMega }))
  const triAtual = mediasTrimestrais(atual.meses, base)
  const triAnt = anterior ? mediasTrimestrais(anterior.meses, base) : [null, null, null, null]
  const trimestres: PontoMes[] = [0, 1, 2, 3].map((t) => {
    const p: PontoMes = { mes: `${t + 1}º tri` }
    p.atual = n(triAtual[t])
    p.atual_txt = triAtual[t] ?? '0'
    p.anterior = n(triAnt[t])
    p.anterior_txt = triAnt[t] ?? '0'
    return p
  })
  const ordenado = [...atual.vendedores].filter((v) => positivo(v.total[base])).sort((a, b) => n(b.total[base]) - n(a.total[base]))
  const top = ordenado.slice(0, 7)
  const demais = somarReais(ordenado.slice(7).map((v) => v.total[base]))
  const fatias: Fatia[] = top.map((v, i) => ({ chave: v.id ?? 'sem', nome: nomeDe(v.id), valor: n(v.total[base]), texto: v.total[base], cor: CAT[i]! }))
  if (positivo(demais)) fatias.push({ chave: 'demais', nome: 'Demais', valor: n(demais), texto: demais, cor: 'var(--mt-graf-neutro)' })
  const ranking = ordenado.slice(0, 10).map((v) => ({ chave: v.id ?? 'sem', nome: nomeDe(v.id), valor: n(v.total[base]), texto: v.total[base] }))
  const rotulo = ROTULO_BASE[base].toLowerCase()

  return (
    <div className="mt-anual-graficos">
      <article className="mt-anual-bloco">
        <h3>Faturamento mês a mês</h3>
        <p className="mt-nota">
          {ano} contra {ano - 1}, base {rotulo}
        </p>
        <ColunasMes
          dados={fluxo}
          series={[
            { chave: 'atual', nome: String(ano), cor: 'var(--mt-graf-1)' },
            { chave: 'anterior', nome: String(ano - 1), cor: 'var(--mt-graf-neutro)', tipo: 'tracejada' },
          ]}
          descricao={`Faturamento mensal de ${ano} comparado a ${ano - 1}`}
        />
      </article>
      <article className="mt-anual-bloco">
        <h3>Meta × atingido</h3>
        <p className="mt-nota">Meta coletiva do mês e quanto entrou de fato</p>
        <ColunasMes
          dados={metaXating}
          series={[
            { chave: 'atingido', nome: 'Atingido', cor: 'var(--mt-graf-1)' },
            { chave: 'meta', nome: 'Meta', cor: 'var(--mt-graf-meta)' },
          ]}
          descricao="Meta coletiva e valor atingido por mês"
        />
      </article>
      <article className="mt-anual-bloco">
        <h3>Participação por vendedor</h3>
        <p className="mt-nota">Fatia de cada um no acumulado do ano</p>
        {fatias.length ? (
          <RoscaParticipacao fatias={fatias} descricao="Participação de cada vendedor no faturamento do ano" />
        ) : (
          <p className="mt-det-vazio">Sem faturamento por vendedor na base escolhida.</p>
        )}
      </article>
      <article className="mt-anual-bloco">
        <h3>Comissões</h3>
        <p className="mt-nota">Evolução mensal do que foi pago a vendedores e à MegaBox (metas fechadas)</p>
        <AreasMes
          dados={comissoes}
          series={[
            { chave: 'vend', nome: 'Vendedores', cor: 'var(--mt-graf-1)' },
            { chave: 'mega', nome: 'MegaBox', cor: 'var(--mt-graf-2)' },
          ]}
          descricao="Comissões mensais de vendedores e da MegaBox"
        />
      </article>
      <article className="mt-anual-bloco">
        <h3>Média por trimestre</h3>
        <p className="mt-nota">Faturamento médio mensal, comparado ao ano anterior</p>
        <ColunasMes
          dados={trimestres}
          series={[
            { chave: 'atual', nome: String(ano), cor: 'var(--mt-graf-1)' },
            { chave: 'anterior', nome: String(ano - 1), cor: 'var(--mt-graf-neutro)' },
          ]}
          descricao="Média mensal por trimestre"
        />
      </article>
      <article className="mt-anual-bloco">
        <h3>Ranking do ano</h3>
        <p className="mt-nota">Os dez maiores faturamentos acumulados</p>
        {ranking.length ? (
          <BarrasRanking dados={ranking} cor="var(--mt-graf-1)" descricao="Dez maiores faturamentos do ano" />
        ) : (
          <p className="mt-det-vazio">Sem faturamento no ano.</p>
        )}
      </article>
    </div>
  )
}

// ------------------------------------------------------------------ Detalhamento
function Detalhe({
  ano,
  valor,
  base,
  vendedor,
  nomeDe,
}: {
  ano: number
  valor: ValorConsiderado
  base: Base
  vendedor: string | null
  nomeDe: (id: string | null) => string
}) {
  const [pagina, setPagina] = useState(1)
  const [linhas, setLinhas] = useState<LinhaDetalheAnual[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const chave = `${ano}|${valor}|${base}|${vendedor}`
  const [chaveVista, setChaveVista] = useState(chave)
  if (chave !== chaveVista) {
    setChaveVista(chave)
    setPagina(1)
  }

  useEffect(() => {
    let vivo = true
    setLinhas(null)
    carregarDetalheAnual({ ano, valor, base, vendedor, pagina, porPagina: POR_PAGINA }).then((r) => {
      if (!vivo) return
      if (r.erro !== undefined) setErro(r.erro)
      else {
        setErro(null)
        setLinhas(r.dados)
      }
    })
    return () => {
      vivo = false
    }
  }, [ano, valor, base, vendedor, pagina])

  const total = linhas?.[0]?.total ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const ini = (pagina - 1) * POR_PAGINA

  if (erro)
    return (
      <p className="aviso" data-tom="erro" role="alert">
        {erro}
      </p>
    )
  return (
    <div className="mt-anual-bloco">
      <p className="mt-nota">
        {linhas === null ? 'Carregando…' : `${total.toLocaleString('pt-BR')} ${total === 1 ? 'venda' : 'vendas'} no ano`} · meses encerrados usam o
        fechamento oficial; o mês corrente é parcial
      </p>
      <div className="mt-tabela-rolagem">
        <table className="mt-det-tabela" data-teste="anual-detalhe">
          <thead>
            <tr>
              <th scope="col">Entrega</th>
              <th scope="col">Data</th>
              <th scope="col">Vendedor</th>
              <th scope="col">Status</th>
              <th scope="col" className="mt-det-num">
                Venda bruta
              </th>
              <th scope="col" className="mt-det-num">
                Venda líquida
              </th>
              <th scope="col" className="mt-det-num">
                Comissão
              </th>
              <th scope="col">Origem</th>
            </tr>
          </thead>
          <tbody>
            {(linhas ?? []).map((l) => (
              <tr key={l.entrega_id}>
                <td className="mt-num mt-det-forte">{l.numero_entrega ?? '—'}</td>
                <td className="mt-num">{formatarData(l.data)}</td>
                <td>{nomeDe(l.vendedor_id)}</td>
                <td>
                  <span className="selo" data-tom={l.cancelado ? 'erro' : undefined}>
                    {l.status}
                  </span>
                </td>
                <td className="mt-det-num mt-num">{formatarReais(l.venda_bruta)}</td>
                <td className="mt-det-num mt-num">{formatarReais(l.venda_liquida)}</td>
                <td className="mt-det-num mt-num">{formatarReais(l.comissao)}</td>
                <td>
                  <span className="selo" data-tom={l.fechado ? 'info' : 'alerta'}>
                    {l.fechado ? 'mês encerrado' : 'mês em andamento'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="mt-paginacao" aria-label="Páginas do detalhamento">
        <span>{total ? `Exibindo ${ini + 1}–${Math.min(ini + POR_PAGINA, total)} de ${total.toLocaleString('pt-BR')}` : 'Nada a exibir'}</span>
        <button type="button" className="mt-icone-botao" onClick={() => setPagina((p) => p - 1)} disabled={pagina <= 1} aria-label="Página anterior">
          <Icone icone={ChevronLeft} />
        </button>
        <span>
          Página {pagina} de {paginas}
        </span>
        <button type="button" className="mt-icone-botao" onClick={() => setPagina((p) => p + 1)} disabled={pagina >= paginas} aria-label="Próxima página">
          <Icone icone={ChevronRight} />
        </button>
      </nav>
    </div>
  )
}
