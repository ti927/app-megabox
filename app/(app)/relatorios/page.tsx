import type { Metadata } from 'next'

import { exigirAcesso } from '@/lib/autorizacao'
import { type FiltrosRelatorio, hojeSaoPaulo, lerFiltros, limitesSaoPaulo } from '@/lib/relatorios'
import { clienteServidor } from '@/lib/supabase/servidor'

import { TelaRelatorios } from './tela'
import type {
  CotacaoDetalhe,
  CotacaoMes,
  DadosRelatorio,
  DiaProspeccao,
  LinhaMes,
  LinhaProduto,
  LinhaProspeccao,
  MotivoArquivamento,
  RankingCotacao,
  ResumoCotacoes,
  Vendedor,
} from './tipos'

import './relatorios.css'

export const metadata: Metadata = { title: 'Relatórios — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

const DETALHE_MAX = 50

/**
 * Uma chamada ao banco por bloco da aba aberta — só a aba aberta (no Bubble as três abas
 * carregavam juntas e o HTML somava no navegador; spec §8.4). Toda soma é das funções fn_rel_*
 * da 017, com o cliente da SESSÃO: a RLS de quem lê decide o que entra no agregado.
 */
async function buscar(supabase: Supabase, f: FiltrosRelatorio): Promise<{ dados: DadosRelatorio; falhou: boolean }> {
  const periodo = { p_inicio: f.inicio, p_fim: f.fim, p_vendedor: f.vendedor }
  const arquivado = f.arquivado === null ? null : f.arquivado === 'sim'

  if (f.aba === 'outros') {
    if (f.modelo === 'produtos') {
      const r = await supabase.rpc('fn_rel_entregas_produto', periodo)
      if (r.error) console.error('relatorios: produtos', r.error)
      return { dados: { aba: 'outros', modelo: 'produtos', produtos: (r.data ?? []) as LinhaProduto[] }, falhou: !!r.error }
    }
    const fn = f.modelo === 'clientes' ? 'fn_rel_entregas_cliente_mes' : 'fn_rel_entregas_fornecedor_mes'
    const r = await supabase.rpc(fn, periodo)
    if (r.error) console.error(`relatorios: ${f.modelo}`, r.error)
    return { dados: { aba: 'outros', modelo: f.modelo, mes: (r.data ?? []) as LinhaMes[] }, falhou: !!r.error }
  }

  if (f.aba === 'cotacao') {
    const comArq = { ...periodo, p_arquivado: arquivado }
    const { de, ate } = limitesSaoPaulo(f.inicio, f.fim)
    let detalhe = supabase
      .from('cotacoes')
      .select(
        'id, numero, criado_em, arquivado, data_validade, etapa:etapas(nome), status:cotacao_status(nome), ' +
          'motivo:motivos_arquivamento(nome), vendedor:usuarios!vendedor_id(nome)',
        { count: 'exact' },
      )
      .eq('rascunho', false)
      .gte('criado_em', de)
      .lt('criado_em', ate)
    if (f.vendedor) detalhe = detalhe.eq('vendedor_id', f.vendedor)
    if (arquivado !== null) detalhe = detalhe.eq('arquivado', arquivado)

    const [resumo, ranking, porMes, motivos, lista] = await Promise.all([
      supabase.rpc('fn_rel_cotacoes_resumo', comArq),
      supabase.rpc('fn_rel_cotacoes_vendedor', comArq),
      supabase.rpc('fn_rel_cotacoes_mes', comArq),
      supabase.rpc('fn_rel_cotacoes_motivos', periodo),
      detalhe.order('criado_em', { ascending: false }).order('id').limit(DETALHE_MAX),
    ])
    const erros = [resumo, ranking, porMes, motivos, lista].filter((r) => r.error)
    for (const e of erros) console.error('relatorios: cotação', e.error)
    return {
      dados: {
        aba: 'cotacao',
        resumo: ((resumo.data ?? []) as ResumoCotacoes[])[0] ?? null,
        ranking: (ranking.data ?? []) as RankingCotacao[],
        porMes: (porMes.data ?? []) as CotacaoMes[],
        motivos: (motivos.data ?? []) as MotivoArquivamento[],
        detalhe: (lista.data ?? []) as unknown as CotacaoDetalhe[],
        totalDetalhe: lista.count ?? 0,
      },
      falhou: erros.length > 0,
    }
  }

  const [vendedores, diario] = await Promise.all([
    supabase.rpc('fn_rel_prospeccao_vendedor', periodo),
    supabase.rpc('fn_rel_prospeccao_diario', periodo),
  ])
  if (vendedores.error) console.error('relatorios: prospecção', vendedores.error)
  if (diario.error) console.error('relatorios: prospecção diária', diario.error)
  return {
    dados: {
      aba: 'prospeccao',
      vendedores: (vendedores.data ?? []) as LinhaProspeccao[],
      diario: (diario.data ?? []) as DiaProspeccao[],
    },
    falhou: !!(vendedores.error || diario.error),
  }
}

export default async function PaginaRelatorios({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor. No Bubble a página não tinha guarda nenhuma (spec §7.1).
  const usuario = await exigirAcesso('relatorios')
  const { filtros, aviso } = lerFiltros(await searchParams, hojeSaoPaulo())

  // Analista/Operador vê só o que é dele (RLS, [DÚVIDA 8]); o filtro de vendedor seria inócuo.
  if (!usuario.ehGerenciaOuAcima) filtros.vendedor = null

  const supabase = await clienteServidor()
  const [resultado, vendedores] = await Promise.all([
    buscar(supabase, filtros),
    usuario.ehGerenciaOuAcima
      ? supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome')
      : Promise.resolve({ data: [{ id: usuario.id, nome: usuario.nome }] }),
  ])

  return (
    <TelaRelatorios
      filtros={filtros}
      aviso={aviso}
      dados={resultado.dados}
      falhou={resultado.falhou}
      vendedores={(vendedores.data ?? []) as Vendedor[]}
      veTodos={usuario.ehGerenciaOuAcima}
      detalheMax={DETALHE_MAX}
    />
  )
}
