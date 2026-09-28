'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState, useTransition } from 'react'

import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import {
  type Aba,
  type FiltrosRelatorio,
  formatarNumero,
  formatarPercentual,
  type Medida,
  type Modelo,
  montarMatriz,
  paraQuery,
  rotuloMes,
  valorDaMedida,
} from '@/lib/relatorios'

import { exportarCsv } from './acoes'
import { DialogoDefinicoes } from './dialogo'
import type { DadosRelatorio, LinhaMes, LinhaProduto, LinhaProspeccao, Vendedor } from './tipos'

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'cotacao', rotulo: 'Relatório de Cotação' },
  { id: 'prospeccao', rotulo: 'Relatório de Prospecção' },
  { id: 'outros', rotulo: 'Outros Relatórios' },
]
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
/** Títulos do Bubble (`Text C`, `Text D` — spec §4.4), agora sempre coerentes com o dado. */
const TITULO: Record<Modelo, string> = {
  produtos: 'Relatório de Entregas (Produto X Cliente X Fornecedor)',
  clientes: 'Relatório de Entregas (Clientes X Mês)',
  fornecedores: 'Relatório de Entregas (Fornecedores X Mês)',
}

function medida(valor: string | number | null | undefined, m: Medida) {
  return m === 'qtd' ? formatarNumero(valor) : formatarReais(valor)
}

// ------------------------------------------------------------------ Outros: Produtos
function TabelaProdutos({ linhas }: { linhas: LinhaProduto[] }) {
  const corpo = linhas.filter((l) => l.nivel < 2)
  const total = linhas.find((l) => l.nivel === 2)
  if (corpo.length === 0) return <Vazio texto="Nenhuma entrega faturada no período." />
  return (
    <div className="rel-rolagem">
      <table className="rel-tabela">
        <thead>
          <tr>
            <th scope="col">Produto</th>
            <th scope="col">Fornecedor</th>
            <th scope="col">Cliente</th>
            <th scope="col">UF</th>
            <th scope="col" className="valor">Qtd</th>
            <th scope="col" className="valor">Venda bruta</th>
            <th scope="col" className="valor">Comissão</th>
            <th scope="col" className="valor">Venda unit. média</th>
            <th scope="col" className="valor">Comissão unit. média</th>
            <th scope="col" className="valor">Entregas</th>
          </tr>
        </thead>
        <tbody>
          {corpo.map((l) => (
            <tr
              key={`${l.nivel}-${l.produto_id}-${l.fornecedor_endereco_id}-${l.cliente_endereco_id}`}
              data-nivel={l.nivel === 1 ? 'subtotal' : undefined}
            >
              <th scope="row">{l.nivel === 1 ? `Subtotal ${l.produto ?? ''}` : l.produto}</th>
              <td>{l.fornecedor ?? ''}</td>
              <td>{l.cliente ?? ''}</td>
              <td>{l.uf_destino ?? ''}</td>
              <td className="valor">{formatarNumero(l.qtd)}</td>
              <td className="valor">{formatarReais(l.valor_venda_bruto)}</td>
              <td className="valor">{formatarReais(l.valor_comissao)}</td>
              <td className="valor">{formatarReais(l.venda_unit_media)}</td>
              <td className="valor">{formatarReais(l.comissao_unit_media)}</td>
              <td className="valor">{formatarNumero(l.qtd_entregas)}</td>
            </tr>
          ))}
        </tbody>
        {total ? (
          <tfoot>
            <tr>
              <th scope="row" colSpan={4}>Total geral</th>
              <td className="valor">{formatarNumero(total.qtd)}</td>
              <td className="valor">{formatarReais(total.valor_venda_bruto)}</td>
              <td className="valor">{formatarReais(total.valor_comissao)}</td>
              <td className="valor">{formatarReais(total.venda_unit_media)}</td>
              <td className="valor">{formatarReais(total.comissao_unit_media)}</td>
              <td className="valor">{formatarNumero(total.qtd_entregas)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  )
}

// ------------------------------------------------- Outros: Clientes / Fornecedores × Mês
function TabelaMes({ linhas, eixo, m }: { linhas: LinhaMes[]; eixo: string; m: Medida }) {
  const matriz = montarMatriz(linhas)
  if (matriz.linhas.length === 0) return <Vazio texto="Nenhuma entrega faturada no período." />
  return (
    <div className="rel-rolagem">
      <table className="rel-tabela rel-matriz">
        <thead>
          <tr>
            <th scope="col">{eixo}</th>
            <th scope="col">UF</th>
            {matriz.meses.map((mes) => (
              <th key={mes} scope="col" className="valor">
                {rotuloMes(mes)}
              </th>
            ))}
            <th scope="col" className="valor">Total</th>
          </tr>
        </thead>
        <tbody>
          {matriz.linhas.map((l) => (
            <tr key={l.id}>
              <th scope="row">{l.nome}</th>
              <td>{l.uf}</td>
              {matriz.meses.map((mes) => (
                <td key={mes} className="valor">
                  {l.celulas[mes] ? medida(valorDaMedida(l.celulas[mes], m), m) : ''}
                </td>
              ))}
              <td className="valor rel-total">{medida(valorDaMedida(l.total, m), m)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>Total</th>
            {matriz.meses.map((mes) => (
              <td key={mes} className="valor">
                {medida(valorDaMedida(matriz.totaisMes[mes], m), m)}
              </td>
            ))}
            <td className="valor rel-total">{medida(valorDaMedida(matriz.totalGeral, m), m)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ------------------------------------------------------------------------ Cotação
function Kpi({ rotulo, valor, tom, detalhe }: { rotulo: string; valor: string; tom?: string; detalhe?: string }) {
  return (
    <div className="rel-kpi" data-tom={tom}>
      <span className="rel-kpi-rotulo">{rotulo}</span>
      <strong className="rel-kpi-valor">{valor}</strong>
      {detalhe ? <span className="rel-kpi-detalhe">{detalhe}</span> : null}
    </div>
  )
}

function AbaCotacao({ dados, detalheMax }: { dados: Extract<DadosRelatorio, { aba: 'cotacao' }>; detalheMax: number }) {
  const r = dados.resumo
  return (
    <>
      <section className="rel-kpis" aria-label="Indicadores">
        <Kpi rotulo="Total de cotações" valor={formatarNumero(r?.total ?? 0)} tom="azul" />
        <Kpi rotulo="Em cotação" valor={formatarNumero(r?.em_cotacao ?? 0)} tom="azul" />
        <Kpi rotulo="Virou pedido" valor={formatarNumero(r?.virou_pedido ?? 0)} tom="verde" />
        <Kpi rotulo="Arquivadas" valor={formatarNumero(r?.arquivadas ?? 0)} tom="vermelho" />
        <Kpi
          rotulo="Taxa de conversão"
          valor={formatarPercentual(r?.taxa_conversao)}
          tom="roxo"
          detalhe={`Período anterior: ${formatarPercentual(r?.taxa_conversao_anterior)}`}
        />
      </section>
      <section className="rel-kpis" aria-label="Indicadores de performance">
        <Kpi rotulo="Faturamento" valor={formatarReais(r?.faturamento ?? 0)} tom="verde" />
        <Kpi rotulo="Ticket médio" valor={formatarReais(r?.ticket_medio)} tom="verde" />
        <Kpi
          rotulo="Tempo médio de fechamento"
          valor={r?.tempo_medio_fechamento_dias == null ? '—' : `${formatarNumero(r.tempo_medio_fechamento_dias, 1)} dias`}
          tom="azul"
        />
      </section>

      <section className="rel-bloco">
        <h2>Ranking de vendedores</h2>
        {dados.ranking.length === 0 ? (
          <Vazio texto="Nenhuma cotação no período." />
        ) : (
          <div className="rel-rolagem">
            <table className="rel-tabela">
              <thead>
                <tr>
                  <th scope="col" className="valor">#</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col" className="valor">Cotações</th>
                  <th scope="col" className="valor">Ativas</th>
                  <th scope="col" className="valor">Pedidos</th>
                  <th scope="col" className="valor">Arquivadas</th>
                  <th scope="col" className="valor">Conversão</th>
                  <th scope="col" className="valor">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {dados.ranking.map((l) => (
                  <tr key={l.vendedor_id}>
                    <td className="valor">{formatarNumero(l.posicao)}º</td>
                    <th scope="row">{l.vendedor}</th>
                    <td className="valor">{formatarNumero(l.cotacoes)}</td>
                    <td className="valor">{formatarNumero(l.ativas)}</td>
                    <td className="valor">{formatarNumero(l.pedidos)}</td>
                    <td className="valor">{formatarNumero(l.arquivadas)}</td>
                    <td className="valor rel-roxo">{formatarPercentual(l.taxa_conversao)}</td>
                    <td className="valor">{formatarReais(l.faturamento)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="rel-colunas">
        <section className="rel-bloco">
          <h2>Conversão por mês</h2>
          {dados.porMes.length === 0 ? (
            <Vazio texto="Nenhuma cotação no período." />
          ) : (
          <div className="rel-rolagem">
            <table className="rel-tabela">
              <thead>
                <tr>
                  <th scope="col">Mês</th>
                  <th scope="col" className="valor">Cotações</th>
                  <th scope="col" className="valor">Viraram pedido</th>
                  <th scope="col" className="valor">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {dados.porMes.map((l) => (
                  <tr key={l.mes}>
                    <th scope="row">{rotuloMes(l.mes)}</th>
                    <td className="valor">{formatarNumero(l.total)}</td>
                    <td className="valor">{formatarNumero(l.virou_pedido)}</td>
                    <td className="valor rel-roxo">{formatarPercentual(l.taxa_conversao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>
        <section className="rel-bloco">
          <h2>Motivo de arquivamento</h2>
          {dados.motivos.length === 0 ? (
            <Vazio texto="Sem arquivamentos no período." />
          ) : (
            <table className="rel-tabela">
              <thead>
                <tr>
                  <th scope="col">Motivo</th>
                  <th scope="col" className="valor">Cotações</th>
                </tr>
              </thead>
              <tbody>
                {dados.motivos.map((l) => (
                  <tr key={l.motivo_id ?? 'sem'}>
                    <th scope="row">{l.motivo}</th>
                    <td className="valor">{formatarNumero(l.qtd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="rel-bloco">
        <h2>
          Cotações do período <span className="selo">{formatarNumero(dados.totalDetalhe)}</span>
        </h2>
        {dados.totalDetalhe > detalheMax ? (
          <p className="rel-nota">Mostrando as {detalheMax} mais recentes.</p>
        ) : null}
        {dados.detalhe.length === 0 ? (
          <Vazio texto="Nenhuma cotação no período." />
        ) : (
          <div className="rel-rolagem">
            <table className="rel-tabela">
              <thead>
                <tr>
                  <th scope="col">Nº cotação</th>
                  <th scope="col">Criada em</th>
                  <th scope="col">Etapa</th>
                  <th scope="col">Status</th>
                  <th scope="col">Arquivado</th>
                  <th scope="col">Motivo arq.</th>
                  <th scope="col">Validade</th>
                  <th scope="col">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {dados.detalhe.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className="valor">{c.numero}</th>
                    <td>{formatarData(c.criado_em)}</td>
                    <td>
                      <span className="selo" data-tom={c.etapa?.nome === 'Cotação' ? undefined : 'ok'}>
                        {c.etapa?.nome ?? '—'}
                      </span>
                    </td>
                    <td>{c.status?.nome ?? '—'}</td>
                    <td>
                      <span className="selo" data-tom={c.arquivado ? 'erro' : 'ok'}>
                        {c.arquivado ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td>{c.motivo?.nome ?? ''}</td>
                    <td>{formatarData(c.data_validade)}</td>
                    <td>{c.vendedor?.nome ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

// --------------------------------------------------------------------- Prospecção
function AbaProspeccao({ dados }: { dados: Extract<DadosRelatorio, { aba: 'prospeccao' }> }) {
  const total: LinhaProspeccao | undefined = dados.vendedores.find((l) => l.nivel === 1)
  const linhas = dados.vendedores.filter((l) => l.nivel === 0)
  const uteis = dados.diario.filter((d) => d.util)
  return (
    <>
      <section className="rel-kpis" aria-label="Indicadores">
        <Kpi rotulo="Enviadas" valor={formatarNumero(total?.propostas ?? 0)} tom="azul" />
        <Kpi rotulo="Clientes" valor={formatarNumero(total?.clientes ?? 0)} tom="verde" />
        <Kpi rotulo="Carteira" valor={formatarNumero(total?.carteira ?? 0)} tom="laranja" />
        <Kpi
          rotulo="Média/dia"
          valor={formatarNumero(total?.media_dia ?? 0, 2)}
          tom="vermelho"
          detalhe={`${total?.dias_uteis ?? 0} dias úteis`}
        />
        <Kpi rotulo="Cobertura" valor={formatarPercentual(total?.cobertura)} tom="roxo" />
      </section>

      <section className="rel-bloco">
        <h2>Ranking de prospecção</h2>
        {linhas.length === 0 ? (
          <Vazio texto="Nenhuma proposta enviada nem carteira no período." />
        ) : (
          <div className="rel-rolagem">
            <table className="rel-tabela">
              <thead>
                <tr>
                  <th scope="col" className="valor">#</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col" className="valor">Propostas</th>
                  <th scope="col" className="valor">Clientes</th>
                  <th scope="col" className="valor">Carteira</th>
                  <th scope="col" className="valor">Cobertura</th>
                  <th scope="col" className="valor">Média/dia</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.vendedor_id ?? 'x'}>
                    <td className="valor">{formatarNumero(l.posicao)}º</td>
                    <th scope="row">{l.vendedor}</th>
                    <td className="valor">{formatarNumero(l.propostas)}</td>
                    <td className="valor rel-verde">{formatarNumero(l.clientes)}</td>
                    <td className="valor">{formatarNumero(l.carteira)}</td>
                    <td className="valor rel-roxo">{formatarPercentual(l.cobertura)}</td>
                    <td className="valor">{formatarNumero(l.media_dia, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rel-bloco">
        <h2>Volume diário (dias úteis)</h2>
        <div className="rel-rolagem">
          <table className="rel-tabela rel-diario">
            <thead>
              <tr>
                <th scope="col">Dia</th>
                {uteis.map((d) => (
                  <th key={d.dia} scope="col" className="valor">
                    {d.dia.slice(8, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Propostas</th>
                {uteis.map((d) => (
                  <td key={d.dia} className="valor">
                    {formatarNumero(d.propostas)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p className="rel-vazio" data-teste="relatorio-vazio">
      {texto}
    </p>
  )
}

// ------------------------------------------------------------------------ a tela
export function TelaRelatorios({
  filtros,
  aviso,
  dados,
  falhou,
  vendedores,
  veTodos,
  detalheMax,
}: {
  filtros: FiltrosRelatorio
  aviso: string | null
  dados: DadosRelatorio
  falhou: boolean
  vendedores: Vendedor[]
  veTodos: boolean
  detalheMax: number
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [inicio, setInicio] = useState(filtros.inicio)
  const [fim, setFim] = useState(filtros.fim)
  const [ajuda, setAjuda] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [erroExportar, setErroExportar] = useState<string | null>(null)

  // Tudo na URL (spec §9.1): aba, modelo, período e filtros são linkáveis — no Bubble só o
  // período ia para a URL e trocá-lo recarregava a página na aba Cotação (§8.3).
  function navegar(mudancas: Partial<FiltrosRelatorio>) {
    iniciar(() => {
      router.replace(`/relatorios${paraQuery(filtros, mudancas)}` as Route, { scroll: false })
    })
  }

  function pesquisar(e: FormEvent) {
    e.preventDefault()
    navegar({ inicio, fim })
  }

  async function exportar() {
    setExportando(true)
    setErroExportar(null)
    try {
      const r = await exportarCsv(paraQuery(filtros).slice(1))
      if (!r.ok) {
        setErroExportar(r.erro)
        return
      }
      // O arquivo foi montado no servidor; aqui só se entrega o texto ao navegador.
      const url = URL.createObjectURL(new Blob([r.conteudo], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url
      a.download = r.nome
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="relatorios">
      <header className="rel-topo">
        <h1>Relatórios</h1>
        <button type="button" className="botao-secundario" onClick={() => setAjuda(true)}>
          Como calculamos
        </button>
      </header>

      <nav className="abas rel-abas" role="tablist" aria-label="Relatórios">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={filtros.aba === a.id}
            onClick={() => navegar({ aba: a.id })}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      <form className="rel-filtros" onSubmit={pesquisar} aria-label="Filtros">
        {filtros.aba === 'outros' ? (
          <fieldset className="rel-modelo">
            <legend>Modelo de relatório</legend>
            {MODELOS.map((m) => (
              <label key={m.id} className="caixa">
                <input
                  type="radio"
                  name="modelo"
                  value={m.id}
                  checked={filtros.modelo === m.id}
                  onChange={() => navegar({ modelo: m.id, inicio, fim })}
                />
                {m.rotulo}
              </label>
            ))}
          </fieldset>
        ) : null}

        <label className="campo">
          <span>{filtros.aba === 'outros' ? 'Entrega de' : filtros.aba === 'cotacao' ? 'Criadas de' : 'Enviadas de'}</span>
          <input type="date" value={inicio} required onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label className="campo">
          <span>até</span>
          <input type="date" value={fim} required min={inicio} onChange={(e) => setFim(e.target.value)} />
        </label>

        {veTodos ? (
          <label className="campo">
            <span>Vendedor</span>
            <select
              value={filtros.vendedor ?? ''}
              onChange={(e) => navegar({ vendedor: e.target.value || null, inicio, fim })}
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {filtros.aba === 'cotacao' ? (
          <label className="campo">
            <span>Arquivado</span>
            <select
              value={filtros.arquivado ?? ''}
              onChange={(e) =>
                navegar({ arquivado: (e.target.value || null) as FiltrosRelatorio['arquivado'], inicio, fim })
              }
            >
              <option value="">Todos</option>
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </label>
        ) : null}

        {filtros.aba === 'outros' && filtros.modelo !== 'produtos' ? (
          <label className="campo">
            <span>Medida</span>
            <select value={filtros.medida} onChange={(e) => navegar({ medida: e.target.value as Medida, inicio, fim })}>
              {MEDIDAS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.rotulo}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="rel-acoes">
          <button type="submit" className="botao-primario" aria-busy={pendente} disabled={pendente}>
            {pendente ? 'Pesquisando…' : 'Pesquisar'}
          </button>
          {filtros.aba === 'outros' ? (
            <button
              type="button"
              className="botao-secundario"
              onClick={exportar}
              disabled={exportando}
              aria-busy={exportando}
            >
              {exportando ? 'Gerando…' : 'Exportar CSV'}
            </button>
          ) : null}
        </div>
      </form>

      {aviso ? <p className="aviso">{aviso} Mostrando o mês corrente.</p> : null}
      {falhou ? (
        <p className="aviso" data-tom="erro">
          Não foi possível carregar o relatório. Tente de novo.
        </p>
      ) : null}
      {erroExportar ? (
        <p className="aviso" data-tom="erro">
          {erroExportar}
        </p>
      ) : null}
      {!veTodos ? <p className="rel-nota">Você vê apenas os números das suas cotações e entregas.</p> : null}

      <section
        className="rel-conteudo"
        data-teste="relatorio-conteudo"
        aria-busy={pendente}
        aria-label={`Período de ${formatarData(filtros.inicio)} a ${formatarData(filtros.fim)}`}
      >
        {dados.aba === 'outros' ? (
          <section className="rel-bloco">
            <h2>{TITULO[dados.modelo]}</h2>
            <p className="rel-nota">
              Entregas faturadas de {formatarData(filtros.inicio)} a {formatarData(filtros.fim)}
              {dados.modelo !== 'produtos' ? ` · ${MEDIDAS.find((m) => m.id === filtros.medida)?.rotulo}` : ''}
            </p>
            {dados.modelo === 'produtos' ? (
              <TabelaProdutos linhas={dados.produtos} />
            ) : (
              <TabelaMes
                linhas={dados.mes}
                eixo={dados.modelo === 'clientes' ? 'Cliente' : 'Fornecedor'}
                m={filtros.medida}
              />
            )}
          </section>
        ) : dados.aba === 'cotacao' ? (
          <AbaCotacao dados={dados} detalheMax={detalheMax} />
        ) : (
          <AbaProspeccao dados={dados} />
        )}
      </section>

      <DialogoDefinicoes aba={filtros.aba} aberto={ajuda} aoFechar={() => setAjuda(false)} />
    </div>
  )
}
