import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { urlsDeLinhas } from '@/lib/arquivos-lote'
import { exigirAcesso } from '@/lib/autorizacao'
import {
  type FiltrosMetas,
  lerFiltrosMetas,
  limitesDoMes,
  metaColetiva,
  reguaNivel,
  somarMeses,
  somarReais,
} from '@/lib/metas'
import { hojeSaoPaulo, metaDiaria } from '@/lib/metas-painel'
import { COOKIE_PODIO, lerEstiloPodio } from '@/lib/metas-podio'
import type { LinhaAnalise } from '@/lib/metas-relatorios'
import { clienteServidor } from '@/lib/supabase/servidor'

import { TelaMetas } from './tela'
import type {
  Coletivo,
  HistoricoNivel,
  LinhaMeta,
  LinhaRanking,
  Nivel,
  Permissoes,
  Vendedor,
} from './tipos'

import './metas.css'
import './metas-extra.css'

export const metadata: Metadata = { title: 'Metas & Vendas — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/** Departamentos fora do combo de vendedor da meta (bTvyf: QualDepto ≠ Operação e ≠ Financeiro). */
const DEPTOS_FORA = new Set([2, 4])

// Dinheiro e frações sempre como texto: `numeric` não passa por float (CLAUDE.md regra 10).
const COLUNAS_ATINGIMENTO =
  'meta_mensal_id, vendedor_id, competencia, tipo_meta_id, periodo_inicio, periodo_fim, nivel_id, ' +
  'valor_meta::text, meta_fechada_id, fechada, realizado::text, percentual::text, meta_batida, ' +
  'fator_comissao::text, comissao_vendedor::text'

type Atingimento = Omit<LinhaMeta, 'regua' | 'fechamento'>

/**
 * Painel do período (`rpg metas`, bTvrH): metas com `DataInicio ≥ datainicio` e
 * `DataFim ≤ datafim`, ordenadas por início. O escopo por vendedor é da RLS (011 D10:
 * hierarquia ≤ 2 vê todas, abaixo só a própria) — não de condicional de tela.
 */
async function buscarPainel(supabase: Supabase, f: FiltrosMetas, gerir: boolean) {
  let q = supabase
    .from('v_meta_atingimento')
    .select(COLUNAS_ATINGIMENTO)
    .gte('periodo_inicio', f.inicio)
    .lte('periodo_fim', f.fim)
  if (gerir && f.vendedor) q = q.eq('vendedor_id', f.vendedor)
  const { data, error } = await q
    .order('periodo_inicio')
    .order('tipo_meta_id')
    .order('vendedor_id')
    .limit(500)
  if (error) {
    console.error('metas: painel', error)
    return { linhas: [] as Atingimento[], falhou: true }
  }
  return { linhas: (data ?? []) as unknown as Atingimento[], falhou: false }
}

/**
 * Ranking (B2 isolada em `v_ranking_metas`, 011 D2): o rank é calculado na view por
 * competência E tipo de meta, ANTES do filtro de período — filtrar aqui não muda posição.
 */
async function buscarRanking(supabase: Supabase, f: FiltrosMetas) {
  const { data, error } = await supabase
    .from('v_ranking_metas')
    .select('meta_mensal_id, vendedor_id, tipo_meta_id, competencia, percentual::text, fechada, posicao')
    .gte('periodo_inicio', f.inicio)
    .lte('periodo_fim', f.fim)
    .order('tipo_meta_id')
    .order('competencia')
    .order('posicao')
    .limit(500)
  if (error) console.error('metas: ranking', error)
  return (data ?? []) as unknown as LinhaRanking[]
}

async function buscarNiveis(supabase: Supabase) {
  const { data, error } = await supabase
    .from('niveis_vendedor')
    .select(
      'id, nome, ordem, meta_venda::text, comissao_padrao::text, comissao_meta_batida::text, qtd_meta_batida',
    )
    .order('ordem')
  if (error) console.error('metas: níveis', error)
  return (data ?? []) as unknown as Nivel[]
}

/** Colegas ativos (policy de 004) — nomes da tela e o combo de nova meta. */
async function buscarVendedores(supabase: Supabase): Promise<(Vendedor & { foto_path: string | null })[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, perfil_id, departamento_id, ativo, nivel_vendedor_id, foto_path')
    .order('nome')
  if (error) console.error('metas: vendedores', error)
  return (data ?? []).map((u) => ({
    id: u.id as string,
    nome: u.nome as string,
    perfil_id: u.perfil_id as number,
    departamento_id: u.departamento_id as number,
    nivel_vendedor_id: (u.nivel_vendedor_id as string | null) ?? null,
    foto_path: (u.foto_path as string | null) ?? null,
    foto: null,
    elegivel: Boolean(u.ativo) && !DEPTOS_FORA.has(u.departamento_id as number),
  }))
}

type Fechada = {
  id: string
  meta_mensal_id: string
  vendedor_id: string
  periodo_inicio: string
  total_comissao_megabox: string
  fechada_em: string
  autor: { nome: string } | null
}

/**
 * Metas fechadas dos vendedores do painel — a régua de nível (`rpg metasfechadas` bTvqX:
 * as do vendedor, por início decrescente) e o carimbo de quem fechou.
 */
async function buscarFechadas(supabase: Supabase, vendedores: string[]) {
  if (vendedores.length === 0) return [] as Fechada[]
  const { data, error } = await supabase
    .from('metas_fechadas')
    .select(
      'id, meta_mensal_id, vendedor_id, periodo_inicio, total_comissao_megabox::text, fechada_em, ' +
        'autor:usuarios!fechada_por(nome)',
    )
    .in('vendedor_id', vendedores)
    .order('periodo_inicio', { ascending: false })
    .limit(2000)
  if (error) console.error('metas: fechadas', error)
  return (data ?? []) as unknown as Fechada[]
}

/**
 * `Group Statistics` (spec §5.2). Venda dos meses −1/−2/−3 = soma de
 * `metas_fechadas.total_comissao_megabox` da competência (mês sem fechamento = zero);
 * faturado coletivo = todas as entregas do período nos status do realizado (011 D3), de
 * todos os vendedores — é o `:filtered` sem restrição do `ipt faturado coletivo` (bTzhB0).
 */
async function buscarColetivo(supabase: Supabase, f: FiltrosMetas): Promise<Coletivo> {
  const mes = f.inicio.slice(0, 7)
  const meses = [1, 2, 3].map((k) => somarMeses(mes, -k))
  const [fechadas, entregas, status] = await Promise.all([
    supabase
      .from('metas_fechadas')
      .select('competencia, total_comissao_megabox::text')
      .in('competencia', meses.map((m) => limitesDoMes(m)!.inicio))
      .limit(5000),
    supabase
      .from('entregas')
      .select('valor_comissao::text, status_id')
      .gte('dt_entrega', f.inicio)
      .lte('dt_entrega', f.fim)
      .limit(20000),
    supabase.rpc('fn_status_realizado'),
  ])
  if (fechadas.error) console.error('metas: coletivo fechadas', fechadas.error)
  if (entregas.error) console.error('metas: coletivo entregas', entregas.error)

  const porMes = meses.map((m) => {
    const alvo = limitesDoMes(m)!.inicio
    const valores = ((fechadas.data ?? []) as unknown as { competencia: string; total_comissao_megabox: string }[])
      .filter((l) => l.competencia === alvo)
      .map((l) => l.total_comissao_megabox)
    return { mes: m, vendas: somarReais(valores) }
  })
  const contam = new Set(((status.data as number[] | null) ?? [5, 6]).map(Number))
  const faturado = somarReais(
    ((entregas.data ?? []) as unknown as { valor_comissao: string | null; status_id: number }[])
      .filter((e) => contam.has(e.status_id))
      .map((e) => e.valor_comissao),
  )
  const meta = metaColetiva(porMes.map((m) => m.vendas))
  return {
    metaColetiva: meta,
    faturado,
    metaDiaria: metaDiaria(meta, faturado, f.inicio, f.fim, hojeSaoPaulo()),
    meses: porMes,
  }
}

/**
 * Análise de Entregas (HTML A, db/027): o agregado por categoria e vendedor no período da tela.
 * Quem não é Diretor recebe só as próprias e sem "realizadas" — regra do banco.
 */
async function buscarAnalise(supabase: Supabase, f: FiltrosMetas) {
  const { data, error } = await supabase
    .rpc('fn_metas_analise_entregas', { p_inicio: f.inicio, p_fim: f.fim })
    .select('categoria, vendedor_id, qtd, valor_comissao::text, valor_venda::text')
  if (error) console.error('metas: análise de entregas', error)
  return (data ?? []) as unknown as LinhaAnalise[]
}

async function buscarHistorico(supabase: Supabase) {
  const { data, error } = await supabase
    .from('vendedor_nivel_historico')
    .select('id, usuario_id, nivel_id, vigencia_inicio, vigencia_fim, motivo')
    .order('vigencia_inicio', { ascending: false })
    .limit(500)
  if (error) console.error('metas: histórico de nível', error)
  return (data ?? []) as HistoricoNivel[]
}

export default async function PaginaMetas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const usuario = await exigirAcesso('metas')
  const filtros = lerFiltrosMetas(await searchParams)
  const permissoes: Permissoes = { gerir: usuario.perfilId <= 2, diretor: usuario.perfilId === 1 }
  if (!permissoes.gerir) filtros.vendedor = null

  // Cliente da SESSÃO: a RLS decide o que cada um vê. Nunca service_role aqui.
  const supabase = await clienteServidor()
  const estiloPodio = lerEstiloPodio((await cookies()).get(COOKIE_PODIO)?.value)
  const [painel, ranking, niveis, vendedoresLidos, coletivo, historico, analise] = await Promise.all([
    buscarPainel(supabase, filtros, permissoes.gerir),
    buscarRanking(supabase, filtros),
    buscarNiveis(supabase),
    buscarVendedores(supabase),
    permissoes.gerir ? buscarColetivo(supabase, filtros) : Promise.resolve(null),
    permissoes.diretor ? buscarHistorico(supabase) : Promise.resolve([] as HistoricoNivel[]),
    buscarAnalise(supabase, filtros),
  ])

  // Fotos só de quem aparece (painel + ranking), numa chamada de Storage só. A linha dona
  // (usuarios) já foi lida pela sessão; o bucket privado confere de novo cada objeto.
  const naTela = new Set([...painel.linhas.map((l) => l.vendedor_id), ...ranking.map((r) => r.vendedor_id)])
  const [fechadas, fotos] = await Promise.all([
    buscarFechadas(supabase, [...new Set(painel.linhas.map((l) => l.vendedor_id))]),
    urlsDeLinhas(
      'usuarios',
      vendedoresLidos.filter((v) => naTela.has(v.id)).map((v) => ({ donoId: v.id, path: v.foto_path })),
      300,
    ),
  ])
  const niveisPorId = new Map(niveis.map((n) => [n.id, n]))
  const vendedores: Vendedor[] = vendedoresLidos.map(({ foto_path, ...v }) => ({
    ...v,
    foto: foto_path ? (fotos.get(foto_path) ?? null) : null,
  }))

  const linhas: LinhaMeta[] = painel.linhas.map((l) => {
    const nivel = l.nivel_id ? niveisPorId.get(l.nivel_id) : undefined
    const n = nivel?.qtd_meta_batida ?? 0
    const doVendedor = fechadas.filter((f) => f.vendedor_id === l.vendedor_id)
    const propria = doVendedor.find((f) => f.meta_mensal_id === l.meta_mensal_id)
    return {
      ...l,
      regua: {
        ...reguaNivel(doVendedor.map((f) => f.total_comissao_megabox), n, nivel?.meta_venda ?? null),
        n,
      },
      fechamento: propria ? { fechada_em: propria.fechada_em, fechada_por: propria.autor?.nome ?? null } : null,
    }
  })

  return (
    <TelaMetas
      usuarioId={usuario.id}
      filtros={filtros}
      permissoes={permissoes}
      linhas={linhas}
      falhou={painel.falhou}
      ranking={ranking}
      niveis={niveis}
      vendedores={vendedores}
      coletivo={coletivo}
      historico={historico}
      analise={analise}
      estiloPodio={estiloPodio}
    />
  )
}
