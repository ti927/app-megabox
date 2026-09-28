import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { clienteAdmin } from '@/lib/supabase/admin'

import { lerAnexoDoStorage } from './anexos'
import {
  processarFilaCom,
  type AnexoFila,
  type Gravacao,
  type LinhaFila,
  type RepositorioFila,
  type ResumoFila,
} from './fila-nucleo'
import { escolherProvedor, type Provedor } from './provedor'

/** Repositório real: service_role, via fn_email_pegar_lote (db/019). */
export function repositorioSupabase(admin: SupabaseClient): RepositorioFila {
  return {
    async pegarLote(p) {
      const { data, error } = await admin.rpc('fn_email_pegar_lote', {
        p_limite: p.limite,
        p_trava_segundos: p.travaSegundos,
        p_max_tentativas: p.maxTentativas,
        p_ids: p.ids,
      })
      if (error) throw new Error(`fn_email_pegar_lote: ${error.message}`)
      return (data ?? []) as LinhaFila[]
    },

    async anexos(ids) {
      const { data, error } = await admin
        .from('email_anexos')
        .select('email_id, nome_arquivo, path')
        .in('email_id', ids)
        .order('criado_em')
      if (error) throw new Error(`email_anexos: ${error.message}`)
      return (data ?? []) as AnexoFila[]
    },

    async gravar(id, loteId, g: Gravacao) {
      const base = { travado_ate: null, lote_id: null, provedor: g.provedor, status: g.status }
      let campos: Record<string, unknown>
      switch (g.status) {
        case 'enviado':
          campos = { ...base, provedor_id: g.provedorId, erro: null, enviado_em: g.agora.toISOString() }
          break
        case 'registrado':
          campos = { ...base, provedor_id: g.provedorId, erro: null }
          break
        case 'pendente':
          campos = { ...base, erro: g.erro, proximo_envio_em: g.proximoEnvioEm.toISOString() }
          break
        case 'falhou':
          campos = { ...base, erro: g.erro }
          break
      }

      // O filtro por status + lote_id é a trava otimista: quem perdeu a linha não grava.
      const { data, error } = await admin
        .from('email_outbox')
        .update(campos)
        .eq('id', id)
        .eq('status', 'enviando')
        .eq('lote_id', loteId)
        .select('id')
      if (error) throw new Error(`gravar resultado ${id}: ${error.message}`)
      return (data?.length ?? 0) === 1
    },
  }
}

export interface ExecucaoFila {
  modo: Provedor['nome']
  lotes: number
  resumo: ResumoFila
}

/**
 * Processa a fila em lotes até esvaziar ou até `orcamentoMs` (a função da Vercel tem teto de
 * duração; o que sobrar fica para a próxima chamada do cron). Com `ids`, uma passada só.
 */
export async function processarFila(opcoes: {
  ids?: string[] | null
  limite?: number
  maxTentativas?: number
  orcamentoMs?: number
} = {}): Promise<ExecucaoFila> {
  const provedor = escolherProvedor(process.env)
  const admin = clienteAdmin()
  const repo = repositorioSupabase(admin)
  const lerAnexo = lerAnexoDoStorage(admin)
  const inicio = Date.now()
  const orcamento = opcoes.orcamentoMs ?? 40_000

  const total: ResumoFila = {
    pegos: 0, enviados: 0, registrados: 0, reagendados: 0, falhos: 0, perdidos: 0,
  }
  let lotes = 0
  for (;;) {
    const r = await processarFilaCom({
      repo, provedor, lerAnexo,
      limite: opcoes.limite, maxTentativas: opcoes.maxTentativas, ids: opcoes.ids ?? null,
    })
    lotes++
    for (const k of Object.keys(total) as (keyof ResumoFila)[]) total[k] += r[k]
    if (opcoes.ids || r.pegos === 0 || Date.now() - inicio > orcamento) break
  }
  return { modo: provedor.nome, lotes, resumo: total }
}
