import type { Metadata } from 'next'

import { exigirAcesso } from '@/lib/autorizacao'
import { clienteServidor } from '@/lib/supabase/servidor'

import { TelaRotinas } from './tela'
import type { Execucao, GrupoInativo, Rotina, UsuarioOpcao } from './tipos'

import './rotinas.css'

export const metadata: Metadata = { title: 'Rotinas — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/** Quantas execuções o histórico mostra (mais recentes primeiro). */
const LIMITE_HISTORICO = 50

async function buscarCatalogo(supabase: Supabase) {
  const { data, error } = await supabase
    .from('rotinas')
    .select('slug, nome, descricao, risco, idempotente, reversivel, filtro_obrigatorio, parametros, origem_bubble, ativa')
    .order('nome')
  if (error) console.error('rotinas: catálogo', error)
  return { rotinas: (data ?? []) as Rotina[], falhou: Boolean(error) }
}

async function buscarHistorico(supabase: Supabase) {
  const { data, error } = await supabase
    .from('rotina_execucoes')
    .select(
      'id, rotina_slug, modo, status, linhas_afetadas, motivo, erro, inicio, fim, simulacao_id, ' +
        'parametros, usuario:usuarios!usuario_id(nome)',
    )
    .order('inicio', { ascending: false })
    .limit(LIMITE_HISTORICO)
  if (error) console.error('rotinas: histórico', error)
  return { execucoes: (data ?? []) as unknown as Execucao[], falhou: Boolean(error) }
}

/**
 * Usuários para os combos da transferência de carteira. Pela sessão: a 004 libera id, nome,
 * ativo e departamento. Inativos só aparecem para perfil ≤ 2 (policy da 001) — é justamente de
 * quem saiu que se costuma transferir a carteira.
 */
async function buscarUsuarios(supabase: Supabase) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, ativo, departamento_id')
    .order('nome')
  if (error) console.error('rotinas: usuários', error)
  return (data ?? []) as UsuarioOpcao[]
}

/** Grupos inativos com filial ainda ativa: o alvo de `sincronizar-ativo-enderecos`. */
async function buscarGruposInativos(supabase: Supabase): Promise<GrupoInativo[]> {
  const { data, error } = await supabase
    .from('grupos_clifor')
    .select('id, nome, tipo, enderecos:enderecos_clifor!inner(id)')
    .eq('ativo', false)
    .eq('enderecos.ativo', true)
    .order('nome')
    .limit(1000)
  if (error) console.error('rotinas: grupos inativos', error)
  type Linha = { id: string; nome: string; tipo: 'cliente' | 'fornecedor'; enderecos: { id: string }[] }
  return ((data ?? []) as unknown as Linha[]).map((g) => ({
    id: g.id,
    nome: g.nome,
    tipo: g.tipo,
    filiais_ativas: g.enderecos.length,
  }))
}

export default async function PaginaRotinas() {
  // Trava no servidor: concessão NOMINAL da página rotinas (db/014 D3/D4).
  await exigirAcesso('rotinas')

  // Cliente da SESSÃO: a RLS decide o que se lê. service_role só nas actions de execução.
  const supabase = await clienteServidor()
  const [catalogo, historico, usuarios, gruposInativos] = await Promise.all([
    buscarCatalogo(supabase),
    buscarHistorico(supabase),
    buscarUsuarios(supabase),
    buscarGruposInativos(supabase),
  ])

  return (
    <TelaRotinas
      rotinas={catalogo.rotinas}
      falhouCatalogo={catalogo.falhou}
      execucoes={historico.execucoes}
      falhouHistorico={historico.falhou}
      limiteHistorico={LIMITE_HISTORICO}
      usuarios={usuarios}
      gruposInativos={gruposInativos}
    />
  )
}
