'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso } from '@/lib/autorizacao'
import { ehUuid } from '@/lib/clifor'
import {
  confirmacaoConfere,
  ehRotinaConhecida,
  montarParametros,
  traduzirRecusa,
  validarMotivo,
} from '@/lib/rotinas'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

import type {
  ClienteCarteira,
  DetalheExecucao,
  EstadoExecutar,
  EstadoSimular,
  Execucao,
  LinhaAlvo,
} from './tipos'

/*
 * Rotinas de manutenção (db/014, rotinas.md §9.3).
 *
 * COMO O USUÁRIO CHEGA AO BANCO — e por que é seguro:
 *   1. `exigirAcesso('rotinas')` em TODA action (server action é endpoint público): lê a sessão
 *      pelos cookies, no servidor, e confere a página. Devolve o usuário da sessão.
 *   2. O id passado a `fn_rotina_rodar(p_usuario_id)` é `usuario.id` desse retorno — NUNCA um
 *      campo do formulário. O navegador não tem como dizer "sou outra pessoa".
 *   3. `fn_rotina_rodar` só é executável por service_role (TRAVA 2), então a chamada sai daqui
 *      com `clienteAdmin()`. O banco confere de novo a página para ESSE usuário (TRAVA 1), a
 *      simulação (TRAVA 3) e põe o usuário no `sub` das claims da transação (D9) — é assim que
 *      alterado_por e auditoria.usuario_id saem com o nome de quem clicou.
 *   Todo o resto (catálogo, histórico, nomes) é lido com o cliente da SESSÃO, sob RLS.
 */

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

type LinhaExecucao = {
  id: string
  rotina_slug: string
  usuario_id: string
  modo: 'seco' | 'real'
  status: 'rodando' | 'ok' | 'erro' | 'recusada'
  parametros: Record<string, unknown>
  linhas_afetadas: number | null
  resultado: {
    assinatura?: string
    amostra?: Record<string, unknown>[]
    alterados?: Record<string, unknown>[]
  } | null
  erro: string | null
  fim: string | null
}

/** Quantas linhas do resultado se resolvem em nomes (o `in` do PostgREST vai na URL). */
const LIMITE_NOMES = 200

async function nomesPorId(
  supabase: Supabase,
  tabela: 'grupos_clifor' | 'usuarios',
  ids: string[],
): Promise<Map<string, string>> {
  const unicos = [...new Set(ids.filter((i) => ehUuid(i)))]
  if (unicos.length === 0) return new Map()
  const { data, error } = await supabase.from(tabela).select('id, nome').in('id', unicos)
  if (error) console.error(`rotinas: nomes de ${tabela}`, error)
  return new Map((data ?? []).map((l) => [l.id as string, l.nome as string]))
}

/** Itens do resultado (ids e valores anteriores) → linhas legíveis, com nomes. */
async function resolverLinhas(
  supabase: Supabase,
  slug: string,
  parametros: Record<string, unknown>,
  itens: Record<string, unknown>[],
): Promise<LinhaAlvo[]> {
  const parte = itens.slice(0, LIMITE_NOMES)
  const texto = (v: unknown) => (typeof v === 'string' ? v : '')

  if (slug === 'sincronizar-ativo-enderecos') {
    const [grupos, filiais] = await Promise.all([
      nomesPorId(supabase, 'grupos_clifor', parte.map((i) => texto(i.grupo_id))),
      (async () => {
        const ids = parte.map((i) => texto(i.id)).filter((i) => ehUuid(i))
        if (ids.length === 0) return new Map<string, string>()
        const { data, error } = await supabase
          .from('enderecos_clifor')
          .select('id, nome_endereco, municipio, uf')
          .in('id', ids)
        if (error) console.error('rotinas: nomes de filiais', error)
        return new Map(
          (data ?? []).map((f) => [
            f.id as string,
            [f.nome_endereco, [f.municipio, f.uf].filter(Boolean).join('/')].filter(Boolean).join(' · '),
          ]),
        )
      })(),
    ])
    return parte.map((i) => ({
      id: texto(i.id),
      descricao: `${grupos.get(texto(i.grupo_id)) ?? 'grupo ?'} — ${filiais.get(texto(i.id)) ?? 'filial apagada'}`,
      antes: i.ativo_antes === true ? 'Ativa' : 'Inativa',
      depois: 'Inativa',
    }))
  }

  if (slug === 'transferir-carteira') {
    const para = texto(parametros.para_vendedor_id)
    const [grupos, usuarios] = await Promise.all([
      nomesPorId(supabase, 'grupos_clifor', parte.map((i) => texto(i.id))),
      nomesPorId(supabase, 'usuarios', [...parte.map((i) => texto(i.carteira_antes)), para]),
    ])
    return parte.map((i) => ({
      id: texto(i.id),
      descricao: grupos.get(texto(i.id)) ?? 'cliente apagado',
      antes: usuarios.get(texto(i.carteira_antes)) ?? (i.carteira_antes ? 'usuário inativo' : 'sem carteira'),
      depois: usuarios.get(para) ?? 'usuário inativo',
    }))
  }

  return []
}

/** Parâmetros em português, para a confirmação e o histórico. */
async function resumirParametros(
  supabase: Supabase,
  slug: string,
  p: Record<string, unknown>,
): Promise<string[]> {
  const grupos = Array.isArray(p.grupo_ids) ? (p.grupo_ids as string[]) : null

  if (slug === 'sincronizar-ativo-enderecos') {
    if (p.todos === true) return ['Alcance: todos os grupos inativos']
    const nomes = await nomesPorId(supabase, 'grupos_clifor', (grupos ?? []).slice(0, LIMITE_NOMES))
    return [
      `Alcance: ${grupos?.length ?? 0} grupo(s) escolhido(s)`,
      ...[...nomes.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')).slice(0, 10).map((n) => `— ${n}`),
    ]
  }

  if (slug === 'transferir-carteira') {
    const de = typeof p.de_vendedor_id === 'string' ? p.de_vendedor_id : ''
    const para = typeof p.para_vendedor_id === 'string' ? p.para_vendedor_id : ''
    const usuarios = await nomesPorId(supabase, 'usuarios', [de, para])
    const linhas = [
      `De: ${usuarios.get(de) ?? 'usuário inativo'}`,
      `Para: ${usuarios.get(para) ?? 'usuário inativo'}`,
    ]
    if (!grupos) return [...linhas, 'Clientes: toda a carteira de origem']
    const nomes = await nomesPorId(supabase, 'grupos_clifor', grupos.slice(0, LIMITE_NOMES))
    return [
      ...linhas,
      `Clientes: ${grupos.length} escolhido(s)`,
      ...[...nomes.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')).slice(0, 10).map((n) => `— ${n}`),
    ]
  }

  return []
}

/** Chama o executor. É a ÚNICA chamada com service_role desta tela. */
async function rodar(args: {
  rotina: string
  usuarioId: string
  modo: 'seco' | 'real'
  parametros: Record<string, unknown>
  motivo: string | null
  simulacaoId: string | null
}): Promise<{ linha: LinhaExecucao } | { erro: string }> {
  const admin = clienteAdmin()
  const { data, error } = await admin.rpc('fn_rotina_rodar', {
    p_rotina: args.rotina,
    p_usuario_id: args.usuarioId,
    p_modo: args.modo,
    p_parametros: args.parametros,
    p_motivo: args.motivo,
    p_simulacao_id: args.simulacaoId,
  })
  if (error) {
    console.error('rotinas: fn_rotina_rodar', error)
    return { erro: traduzirRecusa(error.message) }
  }
  return { linha: data as LinhaExecucao }
}

// ------------------------------------------------------------------------------ simular

/** Modo SECO: calcula alvo, contagem e amostra, sem alterar nada. Fica registrado. */
export async function simular(_anterior: EstadoSimular, form: FormData): Promise<EstadoSimular> {
  const usuario = await exigirAcesso('rotinas')
  const supabase = await clienteServidor()

  const slug = form.get('rotina')
  if (!ehRotinaConhecida(slug)) return { erro: 'Rotina desconhecida. Recarregue a página.' }
  const params = montarParametros(slug, form)
  if (!params.ok) return { erro: params.erro }

  const r = await rodar({
    rotina: slug,
    usuarioId: usuario.id,
    modo: 'seco',
    parametros: params.dados,
    motivo: null,
    simulacaoId: null,
  })
  revalidatePath('/rotinas')
  if ('erro' in r) return { erro: r.erro }
  const linha = r.linha
  if (linha.status !== 'ok') return { erro: traduzirRecusa(linha.erro) }

  const [amostra, resumo] = await Promise.all([
    resolverLinhas(supabase, slug, linha.parametros, linha.resultado?.amostra ?? []),
    resumirParametros(supabase, slug, linha.parametros),
  ])
  return {
    simulacao: {
      id: linha.id,
      rotina_slug: slug,
      linhas: linha.linhas_afetadas ?? 0,
      fim: linha.fim,
      amostra,
      resumo,
    },
  }
}

// ----------------------------------------------------------------------------- executar

/**
 * Modo REAL. O formulário traz só a simulação, a confirmação digitada e o motivo: rotina e
 * parâmetros saem DA PRÓPRIA SIMULAÇÃO gravada, então o que roda é exatamente o que foi
 * simulado. Se o seco é de outra pessoa, vencido, já usado ou o alvo mudou, quem recusa é o
 * banco — e a recusa fica registrada.
 */
export async function executar(_anterior: EstadoExecutar, form: FormData): Promise<EstadoExecutar> {
  const usuario = await exigirAcesso('rotinas')
  const supabase = await clienteServidor()

  const simulacaoId = form.get('simulacao_id')
  if (!ehUuid(simulacaoId)) return { erro: 'Simule antes de executar.' }

  const { data: seco, error } = await supabase
    .from('rotina_execucoes')
    .select('id, rotina_slug, modo, parametros')
    .eq('id', simulacaoId)
    .maybeSingle()
  if (error) {
    console.error('rotinas: ler simulação', error)
    return { erro: 'Não foi possível ler a simulação agora. Tente de novo.' }
  }
  if (!seco || seco.modo !== 'seco') return { erro: 'A simulação não foi encontrada. Simule de novo.' }

  if (!confirmacaoConfere(form.get('confirmacao'), seco.rotina_slug as string)) {
    return { erro: `Para confirmar, digite exatamente "${seco.rotina_slug}".` }
  }
  const motivo = validarMotivo(form.get('motivo'))
  if (!motivo.ok) return { erro: motivo.erro }

  const r = await rodar({
    rotina: seco.rotina_slug as string,
    usuarioId: usuario.id,
    modo: 'real',
    parametros: seco.parametros as Record<string, unknown>,
    motivo: motivo.dados,
    simulacaoId: seco.id as string,
  })
  revalidatePath('/rotinas')
  revalidatePath('/cadastros')
  if ('erro' in r) return { erro: r.erro }
  const linha = r.linha
  if (linha.status !== 'ok') return { erro: traduzirRecusa(linha.erro), execucaoId: linha.id }

  const alterados = await resolverLinhas(
    supabase,
    linha.rotina_slug,
    linha.parametros,
    linha.resultado?.alterados ?? [],
  )
  return { execucaoId: linha.id, ok: { linhas: linha.linhas_afetadas ?? 0, alterados } }
}

// ------------------------------------------------------------------------ apoio à tela

/**
 * Clientes da carteira de origem, para escolher um subconjunto na transferência. Leitura pela
 * sessão (grupos_clifor é legível por todo usuário ativo); a página continua exigida.
 */
export async function listarCarteira(
  deVendedorId: string,
): Promise<{ clientes: ClienteCarteira[]; total: number } | { erro: string }> {
  await exigirAcesso('rotinas')
  if (!ehUuid(deVendedorId)) return { erro: 'Vendedor inválido.' }
  const supabase = await clienteServidor()

  const { data, count, error } = await supabase
    .from('grupos_clifor')
    .select('id, nome, ativo', { count: 'exact' })
    .eq('carteira_id', deVendedorId)
    .eq('tipo', 'cliente')
    .order('nome')
    .order('id')
    .range(0, 999)
  if (error) {
    console.error('rotinas: carteira', error)
    return { erro: 'Não foi possível ler a carteira agora.' }
  }
  return { clientes: (data ?? []) as ClienteCarteira[], total: count ?? 0 }
}

/** Detalhe de uma execução do histórico: parâmetros, amostra (seco) ou valores anteriores (real). */
export async function lerExecucao(id: string): Promise<DetalheExecucao | { erro: string }> {
  await exigirAcesso('rotinas')
  if (!ehUuid(id)) return { erro: 'Execução inválida.' }
  const supabase = await clienteServidor()

  const { data, error } = await supabase
    .from('rotina_execucoes')
    .select(
      'id, rotina_slug, modo, status, linhas_afetadas, motivo, erro, inicio, fim, simulacao_id, ' +
        'parametros, resultado, usuario:usuarios!usuario_id(nome)',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('rotinas: ler execução', error)
    return { erro: 'Não foi possível ler a execução agora.' }
  }
  if (!data) return { erro: 'Execução não encontrada.' }

  const { resultado, ...execucao } = data as unknown as Execucao & {
    resultado: LinhaExecucao['resultado']
  }
  const itens = resultado?.alterados ?? resultado?.amostra ?? []
  const [linhas, resumo] = await Promise.all([
    resolverLinhas(supabase, execucao.rotina_slug, execucao.parametros, itens),
    resumirParametros(supabase, execucao.rotina_slug, execucao.parametros),
  ])
  return { execucao, linhas, total: itens.length, resumo }
}
