import 'server-only'

import type { UsuarioAtual } from '@/lib/autorizacao'
import { limitesPeriodo } from '@/lib/sac'
import {
  type FiltrosApoio,
  type IndicadoresApoio,
  limitesTrimestre,
  type Ocorrencia,
  ordenarOcorrencias,
} from '@/lib/sac-apoio'
import type { clienteServidor } from '@/lib/supabase/servidor'

import type { DadosApoio, DadosOportunidades, LinhaOcorrencia, Oportunidade, ProtocoloResumo } from './tipos'

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

const COLUNAS_PROTOCOLO = 'id, numero, status_id, cliente:grupos_clifor(nome), responsavel:usuarios!responsavel_id(nome)'

/**
 * De quem é o painel: a gerência (perfil ≤ 2) escolhe (vazio = todos); os demais veem sempre
 * o próprio — a mesma regra que `fn_sac_apoio_indicadores` impõe no banco (030 D12).
 */
export function responsavelDoPainel(f: FiltrosApoio, usuario: UsuarioAtual): string | null {
  return usuario.ehGerenciaOuAcima ? f.responsavel : usuario.id
}

function juntar(ocorrencias: Ocorrencia[], protocolos: ProtocoloResumo[]): LinhaOcorrencia[] {
  const porId = new Map(protocolos.map((p) => [p.id, p]))
  return ordenarOcorrencias(ocorrencias).map((o) => ({ ...o, protocolo: porId.get(o.protocolo_id) ?? null }))
}

/**
 * Aba "Apoio Comercial": painel do trimestre (os 4 indicadores, no banco), as ocorrências do
 * trimestre classificadas e os chamados parados AGORA. Três chamadas leves em paralelo depois
 * do painel (que traz a referência e os parâmetros que as outras usam).
 */
export async function buscarApoio(supabase: Supabase, f: FiltrosApoio, usuario: UsuarioAtual): Promise<DadosApoio> {
  const resp = responsavelDoPainel(f, usuario)
  const painel = await supabase.rpc('fn_sac_apoio_indicadores', {
    p_ano: f.t.ano,
    p_trimestre: f.t.trimestre,
    p_responsavel: resp,
  })
  if (painel.error) {
    console.error('sac-apoio: painel', { code: painel.error.code, message: painel.error.message })
    return { painel: null, ocorrencias: [], parados: [], diasLimite: 3, falhou: true }
  }
  const dados = painel.data as IndicadoresApoio
  const { de, ate } = limitesTrimestre(f.t)
  const { desde, antes } = limitesPeriodo(de, ate)
  const respPainel = dados.periodo.responsavel

  let prots = supabase
    .from('sac_protocolos')
    .select(COLUNAS_PROTOCOLO)
    .is('excluido_em', null)
    .gte('aberto_em', desde!)
    .lt('aberto_em', antes!)
    .limit(1000)
  if (respPainel) prots = prots.eq('responsavel_id', respPainel)

  let parados = supabase
    .rpc('fn_sac_acompanhamento')
    .eq('parado', true)
    .order('dias_sem_acao', { ascending: false })
    .limit(100)
  if (resp) parados = parados.eq('responsavel_id', resp)

  const [oc, pr, pa] = await Promise.all([
    supabase.rpc('fn_sac_apoio_ocorrencias', {
      p_desde: desde,
      p_antes: antes,
      p_ref: dados.periodo.referencia,
      p_responsavel: respPainel,
      p_dias: Number(dados.parametros.dias_sem_atualizacao),
      p_prazo_padrao: Number(dados.parametros.prazo_padrao_dias),
    }),
    prots,
    parados,
  ])
  for (const [nome, r] of [['ocorrências', oc], ['protocolos', pr], ['parados', pa]] as const) {
    if (r.error) console.error(`sac-apoio: ${nome}`, { code: r.error.code, message: r.error.message })
  }

  const listaParados = (pa.data ?? []) as Ocorrencia[]
  let protParados: ProtocoloResumo[] = []
  if (listaParados.length > 0) {
    const r = await supabase
      .from('sac_protocolos')
      .select(COLUNAS_PROTOCOLO)
      .in(
        'id',
        listaParados.map((p) => p.protocolo_id),
      )
    protParados = (r.data ?? []) as unknown as ProtocoloResumo[]
  }

  return {
    painel: dados,
    ocorrencias: juntar((oc.data ?? []) as Ocorrencia[], (pr.data ?? []) as unknown as ProtocoloResumo[]),
    parados: juntar(listaParados, protParados),
    diasLimite: (listaParados[0] as (Ocorrencia & { dias_limite?: number }) | undefined)?.dias_limite ?? Number(dados.parametros.dias_sem_atualizacao),
    falhou: Boolean(oc.error || pr.error || pa.error),
  }
}

/** Aba "Oportunidades": as do trimestre (pela data identificada) e a meta vigente. */
export async function buscarOportunidades(
  supabase: Supabase,
  f: FiltrosApoio,
  usuario: UsuarioAtual,
): Promise<DadosOportunidades> {
  const resp = responsavelDoPainel(f, usuario)
  const { de, ate } = limitesTrimestre(f.t)
  let q = supabase
    .from('sac_oportunidades')
    .select(
      'id, grupo_clifor_id, prospect_nome, prospect_contato, responsavel_id, vendedor_id, identificada_em, ' +
        'apresentacao_em, categoria, resultado, observacao, cliente:grupos_clifor(nome), ' +
        'responsavel:usuarios!responsavel_id(nome), vendedor:usuarios!vendedor_id(nome)',
    )
    .gte('identificada_em', de)
    .lte('identificada_em', ate)
    .order('identificada_em', { ascending: false })
    .order('criado_em', { ascending: false })
    .limit(500)
  if (resp) q = q.eq('responsavel_id', resp)
  const [lista, par] = await Promise.all([
    q,
    supabase.rpc('fn_sac_apoio_parametros', { p_ano: f.t.ano, p_trimestre: f.t.trimestre }),
  ])
  if (lista.error) console.error('sac-apoio: oportunidades', { code: lista.error.code, message: lista.error.message })
  const p = par.data as { meta_oportunidades?: number } | null
  return {
    linhas: (lista.data ?? []) as unknown as Oportunidade[],
    meta: p?.meta_oportunidades ?? null,
    falhou: Boolean(lista.error),
  }
}
