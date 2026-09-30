import type { Metadata } from 'next'

import { urlsDeLinhas } from '@/lib/arquivos-lote'
import { exigirAcesso } from '@/lib/autorizacao'
import { VALIDADE_FOTO_S } from '@/lib/fotos-lote'
import { type FiltrosRelatorio, hojeSaoPaulo, lerFiltros, limitesSaoPaulo } from '@/lib/relatorios'
import { type Extras, lerExtras, limitesDoMes, mesAnoDe } from '@/lib/relatorios-paineis'
import { clienteServidor } from '@/lib/supabase/servidor'

import { TelaRelatorios } from './tela'
import type {
  CotacaoDetalhe,
  DadosRelatorio,
  LinhaMes,
  LinhaProdutoGrupo,
  PainelCotacao,
  PainelProspeccao,
  Vendedor,
} from './tipos'

import './relatorios.css'

export const metadata: Metadata = { title: 'Relatórios — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/** Linhas por página da tabela "Cotações do Período" (PAGE_SIZE do HTML C). */
const POR_PAGINA = 25

/**
 * Uma chamada ao banco por bloco da aba ABERTA (no Bubble as três abas carregavam juntas e o
 * JavaScript dos blocos HTML baixava tabelas inteiras). Toda soma é das funções da 021, com o
 * cliente da SESSÃO: a RLS de quem lê decide o que entra no agregado.
 */
async function buscar(
  supabase: Supabase,
  f: FiltrosRelatorio,
  x: Extras,
): Promise<{ dados: DadosRelatorio; falhou: boolean }> {
  if (f.aba === 'outros') {
    const periodo = { p_inicio: f.inicio, p_fim: f.fim, p_vendedor: f.vendedor }
    if (f.modelo === 'produtos') {
      const r = await supabase.rpc('fn_rel_entregas_produtos', {
        ...periodo,
        p_produto: x.produto || null,
        p_fornecedor: x.fornecedor || null,
        p_uf: x.uf || null,
        p_cliente: x.cliente || null,
      })
      if (r.error) console.error('relatorios: produtos', r.error)
      return {
        dados: { aba: 'outros', modelo: 'produtos', produtos: (r.data ?? []) as LinhaProdutoGrupo[] },
        falhou: !!r.error,
      }
    }
    const r = await supabase.rpc('fn_rel_entregas_mes', {
      p_eixo: f.modelo === 'clientes' ? 'cliente' : 'fornecedor',
      ...periodo,
      p_nome: (f.modelo === 'clientes' ? x.cliente : x.fornecedor) || null,
      p_uf: x.uf || null,
    })
    if (r.error) console.error(`relatorios: ${f.modelo}`, r.error)
    return { dados: { aba: 'outros', modelo: f.modelo, mes: (r.data ?? []) as LinhaMes[] }, falhou: !!r.error }
  }

  // Cotação e Prospecção são painéis de UM mês (R1): o do início do período da URL.
  const { ano, mes } = mesAnoDe(f.inicio)

  if (f.aba === 'cotacao') {
    const arquivado = f.arquivado === null ? null : f.arquivado === 'sim'
    const { inicio, fim } = limitesDoMes(ano, mes)
    const { de, ate } = limitesSaoPaulo(inicio, fim)
    let detalhe = supabase
      .from('cotacoes')
      .select(
        'id, numero, criado_em, arquivado, data_validade, etapa_id, etapa:etapas(nome), ' +
          'status:cotacao_status(nome), motivo:motivos_arquivamento(nome), vendedor:usuarios!vendedor_id(nome)',
        { count: 'exact' },
      )
      .eq('rascunho', false)
      .gte('criado_em', de)
      .lt('criado_em', ate)
    if (f.vendedor) detalhe = detalhe.eq('vendedor_id', f.vendedor)
    if (arquivado !== null) detalhe = detalhe.eq('arquivado', arquivado)
    const desde = (x.pagina - 1) * POR_PAGINA

    const [painel, lista] = await Promise.all([
      supabase.rpc('fn_rel_cotacao_painel', { p_ano: ano, p_mes: mes, p_vendedor: f.vendedor, p_arquivado: arquivado }),
      // Ordem da Data API do Bubble: criação crescente (captura relatorios-02: 5761, 5762…).
      detalhe.order('criado_em', { ascending: true }).order('numero').range(desde, desde + POR_PAGINA - 1),
    ])
    if (painel.error) console.error('relatorios: cotação', painel.error)
    if (lista.error) console.error('relatorios: cotações do período', lista.error)
    return {
      dados: {
        aba: 'cotacao',
        painel: (painel.data ?? null) as PainelCotacao | null,
        detalhe: (lista.data ?? []) as unknown as CotacaoDetalhe[],
        totalDetalhe: lista.count ?? 0,
      },
      falhou: !!(painel.error || lista.error),
    }
  }

  const painel = await supabase.rpc('fn_rel_prospeccao_painel', { p_ano: ano, p_mes: mes, p_vendedor: f.vendedor })
  if (painel.error) console.error('relatorios: prospecção', painel.error)
  const dadosPainel = (painel.data ?? null) as PainelProspeccao | null
  // Fotos de quem está no ranking/destaques: a RPC já trouxe o caminho (pela sessão), então é
  // só UMA assinatura em lote no Storage — nenhuma consulta a mais no banco.
  const vendedores = dadosPainel?.vendedores ?? []
  const urls = await urlsDeLinhas(
    'usuarios',
    vendedores.map((v) => ({ donoId: v.vendedor_id, path: v.foto_path })),
    VALIDADE_FOTO_S,
  )
  const fotos: Record<string, string> = {}
  for (const v of vendedores) {
    const url = v.foto_path ? urls.get(v.foto_path) : undefined
    if (url) fotos[v.vendedor_id] = url
  }
  return {
    dados: { aba: 'prospeccao', painel: dadosPainel, fotos },
    falhou: !!painel.error,
  }
}

export default async function PaginaRelatorios({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor. No Bubble a página não tinha guarda nenhuma (spec §7.1).
  const usuario = await exigirAcesso('relatorios')
  const params = await searchParams
  const hoje = hojeSaoPaulo()
  const { filtros, aviso } = lerFiltros(params, hoje)
  const extras = lerExtras(params)

  // Analista/Operador vê só o que é dele (RLS, [DÚVIDA 8]); o filtro de vendedor seria inócuo.
  if (!usuario.ehGerenciaOuAcima) filtros.vendedor = null

  const supabase = await clienteServidor()
  const [resultado, vendedores] = await Promise.all([
    buscar(supabase, filtros, extras),
    usuario.ehGerenciaOuAcima
      ? supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome')
      : Promise.resolve({ data: [{ id: usuario.id, nome: usuario.nome }] }),
  ])

  return (
    <TelaRelatorios
      filtros={filtros}
      extras={extras}
      aviso={aviso}
      dados={resultado.dados}
      falhou={resultado.falhou}
      vendedores={(vendedores.data ?? []) as Vendedor[]}
      veTodos={usuario.ehGerenciaOuAcima}
      porPagina={POR_PAGINA}
      hoje={hoje}
      geradoEm={new Date().toISOString()}
    />
  )
}
