'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

import { FileSpreadsheet, FileText, Printer, Settings2, X } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { PainelLateral } from '@/componentes/painel-lateral'
import { formatarData } from '@/lib/datas'
import {
  CATEGORIAS,
  chaveTrimestre,
  type FiltrosApoio,
  formatarDecimal,
  fracaoNota,
  type IndicadoresApoio,
  type LinhaRelatorio,
  linhasRelatorio,
  nomeArquivoRelatorio,
  paraCsv,
  pendencias,
  planilhaRelatorio,
  queryApoio,
  RESULTADOS,
  rotuloTrimestre,
  SITUACOES,
  trimestresRecentes,
} from '@/lib/sac-apoio'
import { gerarXlsx, TIPO_XLSX } from '@/lib/xlsx-simples'

import { salvarParametros } from './acoes-apoio'
import { BotaoEnviar, Mensagem } from './dialogo'
import { GraficoAvaliacaoMensal } from './graficos-apoio'
import type { DadosApoio, LinhaOcorrencia, Opcoes } from './tipos'

type UsuarioApoio = { id: string; nome: string; ehDiretor: boolean; ehGestor: boolean }

function baixar(bytes: BlobPart, tipo: string, nome: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([bytes], { type: tipo }))
  a.download = nome
  a.click()
  URL.revokeObjectURL(a.href)
}

function Selo({ atingida }: { atingida: boolean }) {
  return (
    <span className="selo" data-tom={atingida ? 'ok' : 'erro'}>
      {atingida ? 'Atingida' : 'Não atingida'}
    </span>
  )
}

/** Barra da nota dentro do peso (a cor vem do estado, o número está ao lado). */
function BarraNota({ nota, peso, atingida }: { nota: LinhaRelatorio['nota']; peso: LinhaRelatorio['peso']; atingida: boolean }) {
  return (
    <span className="ap-barra" aria-hidden="true">
      <i style={{ width: `${fracaoNota(nota, peso) * 100}%` }} data-atingida={atingida || undefined} />
    </span>
  )
}

/** Cartão de um indicador: nota ponderada no peso, meta, realizado e detalhe. */
function CartaoIndicador({ linha, numero, subs }: { linha: LinhaRelatorio; numero: number; subs?: LinhaRelatorio[] }) {
  return (
    <article className="ap-cartao" data-atingida={linha.atingida || undefined} data-teste={`indicador-${linha.chave}`}>
      <header>
        <small>
          {numero}. Peso {formatarDecimal(linha.peso, 0)}%
        </small>
        <h3>{linha.indicador}</h3>
      </header>
      <p className="ap-nota">
        <strong>{formatarDecimal(linha.nota)}</strong>
        <span>de {formatarDecimal(linha.peso, 0)}</span>
      </p>
      <BarraNota nota={linha.nota} peso={linha.peso} atingida={linha.atingida} />
      {subs ? (
        <ul className="ap-subs">
          {subs.map((s) => (
            <li key={s.chave} data-teste={`sub-${s.chave}`}>
              <span className="ap-sub-nome">
                {s.indicador}
                <small>
                  meta {s.meta} · realizado <b>{s.realizado}</b>
                </small>
              </span>
              <span className="ap-sub-nota">
                {formatarDecimal(s.nota)}
                <small>/{formatarDecimal(s.peso, 0)}</small>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <dl className="ap-meta">
          <div>
            <dt>Meta</dt>
            <dd>{linha.meta}</dd>
          </div>
          <div>
            <dt>Realizado</dt>
            <dd>{linha.realizado}</dd>
          </div>
        </dl>
      )}
      <footer>
        <Selo atingida={linha.atingida} />
        {linha.detalhe ? <span>{linha.detalhe}</span> : null}
      </footer>
    </article>
  )
}

/** Tabela do relatório de avaliação — a mesma na tela e na folha impressa. */
function TabelaRelatorio({ d }: { d: IndicadoresApoio }) {
  return (
    <table className="ap-relatorio" data-teste="relatorio-apoio">
      <thead>
        <tr>
          <th scope="col">Indicador</th>
          <th scope="col" className="num">
            Peso
          </th>
          <th scope="col">Meta</th>
          <th scope="col">Realizado</th>
          <th scope="col" className="num">
            Nota
          </th>
          <th scope="col">Situação</th>
        </tr>
      </thead>
      <tbody>
        {linhasRelatorio(d).map((l) => (
          <tr key={l.chave} data-sub={l.sub || undefined}>
            <th scope="row">
              {l.indicador}
              {l.detalhe ? <small>{l.detalhe}</small> : null}
            </th>
            <td className="num">{formatarDecimal(l.peso, 0)}%</td>
            <td>{l.meta}</td>
            <td>{l.realizado}</td>
            <td className="num">{formatarDecimal(l.nota)}</td>
            <td>{l.atingida ? 'Atingida' : 'Não atingida'}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total ponderado</th>
          <td className="num">100%</td>
          <td colSpan={2} />
          <td className="num" data-teste="total-relatorio">
            {formatarDecimal(d.total)}
          </td>
          <td />
        </tr>
      </tfoot>
    </table>
  )
}

function LinhaOcorrenciaTabela({ o, diasLimite, mostraResp }: { o: LinhaOcorrencia; diasLimite: number; mostraResp: boolean }) {
  const s = SITUACOES[o.situacao]
  const falta = pendencias(o, diasLimite)
  return (
    <tr data-parado={o.parado || undefined}>
      <td>
        <Link href={`/sac?sel=${o.protocolo_id}` as Route} className="ap-protocolo">
          Nº {o.protocolo?.numero ?? '—'}
        </Link>
      </td>
      <td className="ap-cliente">{o.protocolo?.cliente?.nome ?? '—'}</td>
      {mostraResp ? <td>{o.protocolo?.responsavel?.nome ?? 'Sem responsável'}</td> : null}
      <td className="num-data">{formatarData(o.aberto_em)}</td>
      <td className="num-data">
        {formatarData(o.prazo)}
        {o.prazo_definido ? null : <small>padrão</small>}
      </td>
      <td className="num-data">
        {formatarData(o.ultima_acao_em)}
        <small>{o.acoes === 0 ? 'sem ação' : `${o.acoes} ação(ões)`}</small>
      </td>
      <td>
        <span className="ap-selos">
          {o.parado ? (
            <span className="selo" data-tom="erro" data-teste="flag-parado">
              Parado {o.dias_sem_acao}d
            </span>
          ) : null}
          <span className="selo" data-tom={s.tom}>
            {s.rotulo}
          </span>
        </span>
      </td>
      <td className="ap-pendencias">{falta.length ? falta.join(' · ') : o.fechado_em ? 'resolvida' : 'em dia'}</td>
    </tr>
  )
}

function TabelaOcorrencias({
  linhas,
  diasLimite,
  mostraResp,
  teste,
}: {
  linhas: LinhaOcorrencia[]
  diasLimite: number
  mostraResp: boolean
  teste: string
}) {
  return (
    <div className="sac-tabela-rolagem">
      <table className="sac-grade ap-ocorrencias" data-teste={teste}>
        <thead>
          <tr>
            <th scope="col">Protocolo</th>
            <th scope="col">Cliente</th>
            {mostraResp ? <th scope="col">Responsável</th> : null}
            <th scope="col">Aberto em</th>
            <th scope="col">Prazo</th>
            <th scope="col">Última ação</th>
            <th scope="col">Situação</th>
            <th scope="col">O que falta</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((o) => (
            <LinhaOcorrenciaTabela key={o.protocolo_id} o={o} diasLimite={diasLimite} mostraResp={mostraResp} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Folha de impressão: só existe no DOM enquanto imprime (portal em <body>, @media print). */
function FolhaImpressao({ d, quem }: { d: IndicadoresApoio; quem: string }) {
  const t = { ano: d.periodo.ano, trimestre: d.periodo.trimestre as 1 | 2 | 3 | 4 }
  const a = d.acompanhamento
  return createPortal(
    <div className="ap-impressao">
      <header>
        <h1>Relatório de avaliação — Apoio Comercial</h1>
        <p>
          {rotuloTrimestre(t)} · {quem} ·{' '}
          {d.periodo.encerrado ? 'trimestre encerrado' : `parcial, posição de ${formatarData(d.periodo.referencia)}`}
        </p>
      </header>
      <TabelaRelatorio d={d} />
      <p>
        Ocorrências do trimestre: {a.total} ({a.resolvidas} resolvidas, {a.abertas} abertas) · {a.no_prazo} no prazo ·{' '}
        {a.acompanhadas} atrasadas mas acompanhadas · {a.fora_prazo} fora do prazo · {a.parados} paradas há mais de{' '}
        {a.dias_sem_atualizacao} dias.
      </p>
      <p>
        Oportunidades: {(Object.keys(CATEGORIAS) as (keyof typeof CATEGORIAS)[]).map((c) => `${d.oportunidades.por_categoria?.[c] ?? 0} ${CATEGORIAS[c].toLowerCase()}`).join(' · ')}
        . Resultado: {(Object.keys(RESULTADOS) as (keyof typeof RESULTADOS)[]).map((r) => `${d.oportunidades.por_resultado?.[r] ?? 0} ${RESULTADOS[r].toLowerCase()}`).join(' · ')}.
      </p>
      <p className="ap-impressao-rodape">
        Nota: atingiu a meta = peso cheio; {d.parametros.nota_proporcional ? 'abaixo da meta = proporcional (peso × realizado ÷ meta)' : 'abaixo da meta = 0'}. Emitido em{' '}
        {new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.
      </p>
    </div>,
    document.body,
  )
}

// ------------------------------------------------------------------ parâmetros

const CAMPOS_PARAMETROS: { grupo: string; campos: [string, string, string?][] }[] = [
  { grupo: '1. Pesquisa de satisfação', campos: [['peso_pesquisa', 'Peso (%)'], ['meta_pesquisa_pct', 'Meta de respostas (%)']] },
  {
    grupo: '2. Avaliação dos atendimentos',
    campos: [['peso_avaliacao', 'Peso (%)'], ['meta_avaliacao_media', 'Meta da média (0–10)'], ['min_avaliacoes', 'Mínimo de avaliações']],
  },
  { grupo: '3. Novos clientes / oportunidades', campos: [['peso_oportunidades', 'Peso (%)'], ['meta_oportunidades', 'Meta no trimestre']] },
  {
    grupo: '4. Acompanhamento e resolução',
    campos: [
      ['peso_prazo', 'Peso: no prazo (%)'],
      ['meta_prazo_pct', 'Meta no prazo (%)'],
      ['peso_parados', 'Peso: parados (%)'],
      ['meta_parados', 'Meta de parados'],
      ['peso_retorno', 'Peso: retorno (%)'],
      ['meta_retorno_pct', 'Meta de retorno (%)'],
      ['dias_sem_atualizacao', 'Parado após (dias)'],
      ['prazo_padrao_dias', 'Prazo padrão (dias)'],
    ],
  },
]

function Parametros({ d, chave, aoFechar }: { d: IndicadoresApoio; chave: string; aoFechar: () => void }) {
  const [estado, salvar] = useActionState(salvarParametros, {})
  const p = d.parametros as Record<string, unknown>
  const t = { ano: d.periodo.ano, trimestre: d.periodo.trimestre as 1 | 2 | 3 | 4 }
  const herdado = Number(p.ano) !== t.ano || Number(p.trimestre) !== t.trimestre
  return (
    <PainelLateral rotuloId="ap-par-titulo" aoFechar={aoFechar} chaveLargura="sac-apoio-parametros" fracaoInicial={0.36} data-teste="painel-parametros">
      <header className="ap-painel-cabeca">
        <div>
          <p className="sf-tipo">Metas do Apoio Comercial</p>
          <h2 id="ap-par-titulo">{rotuloTrimestre(t)}</h2>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={aoFechar}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>
      <form action={salvar} className="ap-parametros sf-form">
        <input type="hidden" name="t" value={chave} />
        {herdado ? (
          <p className="aviso">
            Este trimestre ainda usa as metas de {Number(p.trimestre)}º tri/{Number(p.ano)}. Gravar cria as metas próprias dele.
          </p>
        ) : null}
        {CAMPOS_PARAMETROS.map((g) => (
          <fieldset key={g.grupo}>
            <legend>{g.grupo}</legend>
            <div className="ap-parametros-campos">
              {g.campos.map(([nome, rotulo]) => (
                <label key={nome} className="campo">
                  <span>{rotulo}</span>
                  <input name={nome} defaultValue={String(p[nome] ?? '').replace('.', ',')} inputMode="decimal" required />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <label className="caixa">
          <input type="checkbox" name="nota_proporcional" defaultChecked={Boolean(p.nota_proporcional)} />
          Abaixo da meta, nota proporcional (peso × realizado ÷ meta). Desligado: tudo ou nada.
        </label>
        <p className="sf-nota">Os pesos somam 100%. “Parados” e avaliações abaixo do mínimo dão zero em qualquer modo.</p>
        <Mensagem estado={estado} />
        <div className="sf-linha-botoes">
          <button type="button" className="botao-texto" onClick={aoFechar}>
            Fechar
          </button>
          <BotaoEnviar teste="gravar-parametros">Gravar metas</BotaoEnviar>
        </div>
      </form>
    </PainelLateral>
  )
}

// ------------------------------------------------------------------ painel

export function ApoioComercial({
  filtros,
  hoje,
  dados,
  opcoes,
  usuario,
}: {
  filtros: FiltrosApoio
  hoje: string
  dados: DadosApoio
  opcoes: Opcoes
  usuario: UsuarioApoio
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [imprimindo, setImprimindo] = useState(false)
  const [metas, setMetas] = useState(false)
  const d = dados.painel

  function ir(m: Partial<FiltrosApoio>) {
    iniciar(() => router.replace(`/sac${queryApoio('apoio', filtros, m)}` as Route, { scroll: false }))
  }

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

  const quem = !usuario.ehGestor
    ? usuario.nome
    : filtros.responsavel
      ? (opcoes.usuarios.find((u) => u.id === filtros.responsavel)?.nome ?? 'Responsável')
      : 'Toda a equipe'

  function exportar(formato: 'xlsx' | 'csv') {
    if (!d) return
    const linhas = planilhaRelatorio(d, quem)
    const nome = nomeArquivoRelatorio(filtros.t, usuario.ehGestor && !filtros.responsavel ? 'equipe' : quem)
    if (formato === 'csv') baixar(paraCsv(linhas), 'text/csv;charset=utf-8', `${nome}.csv`)
    else baixar(gerarXlsx('Avaliação', linhas, [44, 10, 30, 18, 14, 14, 60]) as BlobPart, TIPO_XLSX, `${nome}.xlsx`)
  }

  const linhas = d ? linhasRelatorio(d) : []
  const porChave = Object.fromEntries(linhas.map((l) => [l.chave, l]))
  const mostraResp = usuario.ehGestor && !filtros.responsavel

  return (
    <>
      <header className="sac-topo">
        <div>
          <h1>Apoio Comercial</h1>
          <p className="sac-subtitulo">Metas trimestrais: quatro indicadores ponderados, nota de 0 a 100</p>
        </div>
        <div className="ap-acoes">
          <button type="button" className="botao-secundario" onClick={() => setImprimindo(true)} disabled={!d} data-teste="imprimir-relatorio">
            <Icone icone={Printer} tamanho={16} />
            Imprimir
          </button>
          <button type="button" className="botao-secundario" onClick={() => exportar('xlsx')} disabled={!d} data-teste="exportar-xlsx">
            <Icone icone={FileSpreadsheet} tamanho={16} />
            Excel
          </button>
          <button type="button" className="botao-secundario" onClick={() => exportar('csv')} disabled={!d}>
            <Icone icone={FileText} tamanho={16} />
            CSV
          </button>
          {usuario.ehDiretor ? (
            <button type="button" className="botao-secundario" onClick={() => setMetas(true)} disabled={!d} data-teste="abrir-parametros">
              <Icone icone={Settings2} tamanho={16} />
              Metas do trimestre
            </button>
          ) : null}
        </div>
      </header>

      <section className="sac-filtros ap-filtros" aria-label="Filtros do painel">
        <label className="campo">
          <span>Trimestre</span>
          <select value={chaveTrimestre(filtros.t)} onChange={(e) => ir({ t: { ano: Number(e.target.value.slice(0, 4)), trimestre: Number(e.target.value.slice(5)) as 1 | 2 | 3 | 4 } })} data-teste="trimestre">
            {trimestresRecentes(hoje, 8).map((t) => (
              <option key={chaveTrimestre(t)} value={chaveTrimestre(t)}>
                {rotuloTrimestre(t)}
              </option>
            ))}
          </select>
        </label>
        {usuario.ehGestor ? (
          <label className="campo">
            <span>Colaboradora</span>
            <select value={filtros.responsavel ?? ''} onChange={(e) => ir({ responsavel: e.target.value || null })} data-teste="colaboradora">
              <option value="">Toda a equipe</option>
              {opcoes.usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="ap-quem">
            Painel de <strong>{usuario.nome}</strong>
          </p>
        )}
        {d ? (
          <p className="ap-referencia">
            {d.periodo.encerrado
              ? `Trimestre encerrado em ${formatarData(d.periodo.ate)}.`
              : `Parcial: posição de ${formatarData(d.periodo.referencia)}. O trimestre fecha em ${formatarData(d.periodo.ate)}.`}
          </p>
        ) : null}
      </section>

      {dados.falhou ? (
        <p className="aviso" data-tom="erro" role="alert">
          {d ? 'Parte do painel não carregou. Recarregue a página em instantes.' : 'Não foi possível carregar o painel agora. Recarregue a página em instantes.'}
        </p>
      ) : null}

      {d ? (
        <div className="ap" aria-busy={pendente} data-teste="painel-apoio">
          <section className="ap-placar" aria-label="Notas do trimestre">
            <article className="ap-total" data-teste="total-ponderado">
              <small>Total ponderado</small>
              <p>
                <strong>{formatarDecimal(d.total)}</strong>
                <span>de 100</span>
              </p>
              <span className="ap-barra ap-barra-grossa" aria-hidden="true">
                <i style={{ width: `${fracaoNota(d.total, 100) * 100}%` }} />
              </span>
              <span>
                {linhas.filter((l) => !l.sub && l.atingida).length} de 4 indicadores atingidos ·{' '}
                {d.parametros.nota_proporcional ? 'nota proporcional abaixo da meta' : 'tudo ou nada por indicador'}
              </span>
            </article>
            {porChave.pesquisa ? <CartaoIndicador linha={porChave.pesquisa} numero={1} /> : null}
            {porChave.avaliacao ? <CartaoIndicador linha={porChave.avaliacao} numero={2} /> : null}
            {porChave.oportunidades ? <CartaoIndicador linha={porChave.oportunidades} numero={3} /> : null}
            {porChave.acompanhamento ? (
              <CartaoIndicador
                linha={porChave.acompanhamento}
                numero={4}
                subs={[porChave.prazo, porChave.parados, porChave.retorno].filter((x): x is LinhaRelatorio => Boolean(x))}
              />
            ) : null}
          </section>

          <section className="sr-cartao ap-largo2" aria-labelledby="ap-av-t">
            <h2 id="ap-av-t">Avaliação do atendimento por mês</h2>
            <p className="sr-sub">
              Média de cada mês (embaixo, quantas avaliações). O realizado é a média das médias mensais ·{' '}
              {d.avaliacao.validas} avaliações válidas (mínimo {d.avaliacao.minimo})
            </p>
            <GraficoAvaliacaoMensal mensal={d.avaliacao.mensal} meta={d.avaliacao.meta} />
          </section>

          <section className="sr-cartao" aria-labelledby="ap-op-t">
            <h2 id="ap-op-t">Oportunidades</h2>
            <p className="sr-sub">
              {d.oportunidades.realizado} de {formatarDecimal(d.oportunidades.meta, 0)} no trimestre ·{' '}
              <Link href={`/sac${queryApoio('oportunidades', filtros)}` as Route}>ver lista</Link>
            </p>
            <ul className="sr-barras" aria-label="Oportunidades por tipo">
              {(Object.keys(CATEGORIAS) as (keyof typeof CATEGORIAS)[]).map((c) => {
                const n = d.oportunidades.por_categoria?.[c] ?? 0
                const maior = Math.max(1, ...Object.values(d.oportunidades.por_categoria ?? {}))
                return (
                  <li key={c}>
                    <span className="sr-barras-rotulo">{CATEGORIAS[c]}</span>
                    <span className="sr-barras-trilho" aria-hidden="true">
                      <i style={{ width: `${(n / maior) * 100}%` }} data-zero={n === 0 || undefined} />
                    </span>
                    <strong>{n}</strong>
                  </li>
                )
              })}
            </ul>
            <p className="sr-sub">
              {(Object.keys(RESULTADOS) as (keyof typeof RESULTADOS)[])
                .map((r) => `${d.oportunidades.por_resultado?.[r] ?? 0} ${RESULTADOS[r].toLowerCase()}`)
                .join(' · ')}
            </p>
          </section>

          <section className="sr-cartao ap-largo" aria-labelledby="ap-par-t" data-teste="chamados-parados">
            <h2 id="ap-par-t">
              Chamados parados agora{' '}
              <span className="selo" data-tom={dados.parados.length ? 'erro' : 'ok'}>
                {dados.parados.length}
              </span>
            </h2>
            <p className="sr-sub">
              Não resolvidos e sem nenhuma ação registrada há mais de {dados.diasLimite} dias, de qualquer trimestre. Registrar
              uma ação (contato, cobrança, retorno) tira o chamado daqui.
            </p>
            {dados.parados.length === 0 ? (
              <p className="sr-vazio">Nenhum chamado parado.</p>
            ) : (
              <TabelaOcorrencias linhas={dados.parados} diasLimite={dados.diasLimite} mostraResp={usuario.ehGestor && !filtros.responsavel} teste="lista-parados" />
            )}
          </section>

          <section className="sr-cartao ap-largo" aria-labelledby="ap-oc-t">
            <h2 id="ap-oc-t">Ocorrências do trimestre</h2>
            <p className="sr-sub">
              {d.acompanhamento.total} abertas no trimestre · {d.acompanhamento.no_prazo} resolvidas no prazo ·{' '}
              {d.acompanhamento.acompanhadas} atrasadas mas acompanhadas · {d.acompanhamento.fora_prazo} fora do prazo ·{' '}
              {d.acompanhamento.em_andamento} ainda no prazo. Atrasada conta como acompanhada quando tem motivo da pendência,
              cliente informado e fornecedor cobrado (se depender dele) e não está parada.
            </p>
            {dados.ocorrencias.length === 0 ? (
              <p className="sr-vazio">Nenhuma ocorrência aberta neste trimestre.</p>
            ) : (
              <TabelaOcorrencias linhas={dados.ocorrencias} diasLimite={Number(d.parametros.dias_sem_atualizacao)} mostraResp={mostraResp} teste="lista-ocorrencias" />
            )}
          </section>

          <section className="sr-cartao ap-largo" aria-labelledby="ap-rel-t">
            <h2 id="ap-rel-t">Relatório de avaliação</h2>
            <p className="sr-sub">
              {rotuloTrimestre(filtros.t)} · {quem}. Atingiu a meta: peso cheio;{' '}
              {d.parametros.nota_proporcional ? 'abaixo dela, proporcional.' : 'abaixo dela, zero.'} Use Imprimir, Excel ou CSV no topo.
            </p>
            <TabelaRelatorio d={d} />
          </section>
        </div>
      ) : null}

      {imprimindo && d ? <FolhaImpressao d={d} quem={quem} /> : null}
      {metas && d && usuario.ehDiretor ? <Parametros d={d} chave={chaveTrimestre(filtros.t)} aoFechar={() => setMetas(false)} /> : null}
    </>
  )
}
