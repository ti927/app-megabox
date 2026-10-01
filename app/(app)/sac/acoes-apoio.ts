'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso } from '@/lib/autorizacao'
import { ehUuid } from '@/lib/clifor'
import { caminhoPesquisa } from '@/lib/sac'
import { lerTrimestre, validarAcompanhamento, validarOportunidade, validarParametros } from '@/lib/sac-apoio'
import { hojeSaoPaulo } from '@/lib/relatorios'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { EstadoAcao } from './tipos'

/*
 * Escrita do APOIO COMERCIAL (db/030). Como em ./acoes.ts: cada action repete
 * `exigirAcesso('sac')`, valida de novo e grava com o cliente da SESSÃO — a RLS da 030
 * (oportunidades: perfil ≤ 2 ou a responsável; parâmetros: só perfil 1) e os triggers (prazo já
 * definido só muda pela gerência) dão a última palavra.
 *
 * A única exceção é o convite da AVALIAÇÃO DO ATENDIMENTO: pesquisa_convites não tem escrita
 * para authenticated (013 D7), então a action confere com a sessão que a pessoa enxerga o
 * protocolo e só então usa service_role para criar o convite e emitir o link.
 */

type Erro = { code?: string; message?: string }

function traduzirErro(contexto: string, erro: Erro): string {
  console.error(`sac-apoio: ${contexto}`, { code: erro.code, message: erro.message })
  switch (erro.code) {
    case '42501':
      return erro.message?.startsWith('Prazo já definido')
        ? 'O prazo já foi definido: só a gerência o altera. Registre o motivo da pendência.'
        : 'Você não tem permissão para esta alteração.'
    case '23503':
      return 'Um dos valores escolhidos não existe mais. Recarregue a página.'
    case '23505':
      return 'Já existe um registro igual.'
    case '23514':
      return erro.message?.includes('antes da abertura')
        ? 'O prazo não pode ser antes da abertura do chamado.'
        : 'Os dados não combinam entre si. Confira e grave de novo.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

function idDoForm(form: FormData, campo: string): string | null {
  const v = form.get(campo)
  return ehUuid(v) ? v.toLowerCase() : null
}

// ------------------------------------------------------------------ acompanhamento

/**
 * Prazo, "depende do fornecedor" e motivo da pendência do chamado (030 D2, D3, D5). Prazo vazio
 * no formulário não apaga um prazo já definido (só a gerência mexe nele; o trigger recusa).
 */
export async function salvarAcompanhamento(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const id = idDoForm(form, 'id')
  if (!id) return { erro: 'Protocolo inválido. Recarregue a página.' }
  const v = validarAcompanhamento(form)
  if (!v.ok) return { erro: v.erro }

  const { data: atual, error: eAtual } = await supabase
    .from('sac_protocolos')
    .select('prazo_em, excluido_em')
    .eq('id', id)
    .maybeSingle()
  if (eAtual) return { erro: traduzirErro('ler protocolo', eAtual) }
  if (!atual) return { erro: 'Este protocolo não existe ou você não tem acesso a ele.' }
  if (atual.excluido_em) return { erro: 'Protocolo excluído: desfaça a exclusão antes de editar.' }

  const d = v.dados
  const campos: Record<string, unknown> = {
    depende_fornecedor: d.depende_fornecedor,
    motivo_pendencia: d.motivo_pendencia,
  }
  if (d.prazo_em !== (atual.prazo_em ?? null)) {
    if (atual.prazo_em && !usuario.ehGerenciaOuAcima) {
      return { erro: 'O prazo já foi definido: só a gerência o altera. Registre o motivo da pendência.' }
    }
    if (d.prazo_em || usuario.ehGerenciaOuAcima) campos.prazo_em = d.prazo_em
  }

  const { data, error } = await supabase.from('sac_protocolos').update(campos).eq('id', id).select('id')
  if (error) return { erro: traduzirErro('acompanhamento', error) }
  if (!data || data.length === 0) return { erro: 'Só a Diretoria ou o responsável alteram este protocolo.' }

  revalidatePath('/sac')
  return { ok: 'Acompanhamento gravado.' }
}

// ------------------------------------------------------------------ avaliação

/** tipos_pesquisa (003): 1 = SAC (avaliação do atendimento). */
const TIPO_PESQUISA_SAC = 1
const NOME_PESQUISA_SAC = 'Avaliação do atendimento SAC'

/**
 * Avaliação do atendimento (030 D8): convite de pesquisa tipo 1 ligado ao protocolo RESOLVIDO,
 * com link de uso único para copiar (o e-mail ainda não sai pelo app). Um convite vivo por
 * protocolo (índice único); emitir de novo troca o token e mata o anterior.
 */
export async function emitirAvaliacao(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const id = idDoForm(form, 'protocolo_id')
  if (!id) return { erro: 'Protocolo inválido. Recarregue a página.' }
  const contatoBruto = form.get('contato_id')
  const contatoId = idDoForm(form, 'contato_id')
  if (typeof contatoBruto === 'string' && contatoBruto !== '' && !contatoId) return { erro: 'Contato inválido.' }

  // Trava com a SESSÃO antes de qualquer service_role.
  const { data: prot, error: eProt } = await supabase
    .from('sac_protocolos')
    .select('grupo_clifor_id, fechado_em, excluido_em, cliente:grupos_clifor(tipo)')
    .eq('id', id)
    .maybeSingle()
  if (eProt) return { erro: traduzirErro('ler protocolo', eProt) }
  const p = prot as unknown as {
    grupo_clifor_id: string
    fechado_em: string | null
    excluido_em: string | null
    cliente: { tipo: string } | null
  } | null
  if (!p) return { erro: 'Este protocolo não existe ou você não tem acesso a ele.' }
  if (p.excluido_em) return { erro: 'Protocolo excluído.' }
  if (!p.fechado_em) return { erro: 'A avaliação é pedida depois que o chamado é resolvido.' }
  if (p.cliente?.tipo !== 'cliente') return { erro: 'A avaliação do atendimento é só para chamados de cliente.' }
  if (contatoId) {
    const { data: c } = await supabase.from('contatos_clifor').select('grupo_id').eq('id', contatoId).maybeSingle()
    if (!c || c.grupo_id !== p.grupo_clifor_id) return { erro: 'Este contato não é do cliente do chamado.' }
  }

  const admin = clienteAdmin()
  const { data: existente, error: eConv } = await admin
    .from('pesquisa_convites')
    .select('id, usado_em')
    .eq('protocolo_id', id)
    .is('cancelado_em', null)
    .maybeSingle()
  if (eConv) return { erro: traduzirErro('conferir avaliação', eConv) }
  if (existente?.usado_em) return { erro: 'O cliente já avaliou este atendimento.' }

  let conviteId = existente?.id as string | undefined
  if (!conviteId) {
    // A campanha "Avaliação do atendimento SAC" (tipo 1) nasce na primeira avaliação.
    let { data: pesquisa } = await supabase
      .from('pesquisas')
      .select('id')
      .eq('tipo_id', TIPO_PESQUISA_SAC)
      .eq('ativa', true)
      .order('criado_em')
      .limit(1)
      .maybeSingle()
    if (!pesquisa) {
      const r = await supabase
        .from('pesquisas')
        .insert({ nome: NOME_PESQUISA_SAC, tipo_id: TIPO_PESQUISA_SAC, ativa: true, criado_por: usuario.id })
        .select('id')
        .single()
      if (r.error) return { erro: traduzirErro('criar pesquisa SAC', r.error) }
      pesquisa = r.data
    }
    const { data: novo, error } = await admin
      .from('pesquisa_convites')
      .insert({
        pesquisa_id: pesquisa.id,
        cliente_id: p.grupo_clifor_id,
        contato_id: contatoId,
        protocolo_id: id,
        criado_por: usuario.id,
      })
      .select('id')
      .single()
    if (error) return { erro: traduzirErro('criar avaliação', error) }
    conviteId = novo.id as string
  }

  const { data: token, error } = await admin.rpc('fn_pesquisa_emitir_token', { p_convite_id: conviteId })
  if (error) return { erro: traduzirErro('emitir avaliação', error) }
  const link = caminhoPesquisa(token)
  if (!link) return { erro: 'Não foi possível emitir o link agora.' }

  revalidatePath('/sac')
  return { ok: 'Link da avaliação emitido. Copie agora: ele não será mostrado de novo.', link }
}

// ------------------------------------------------------------------ oportunidades

/** Registrar ou alterar oportunidade (030 D9). A responsável é quem grava, salvo a gerência. */
export async function salvarOportunidade(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const v = validarOportunidade(form, hojeSaoPaulo())
  if (!v.ok) return { erro: v.erro }
  const id = idDoForm(form, 'id')
  const respBruto = idDoForm(form, 'responsavel_id')
  const responsavel = usuario.ehGerenciaOuAcima && respBruto ? respBruto : null

  if (v.dados.grupo_clifor_id) {
    const { data: g } = await supabase.from('grupos_clifor').select('tipo').eq('id', v.dados.grupo_clifor_id).maybeSingle()
    if (!g || g.tipo !== 'cliente') return { erro: 'Escolha um cliente da lista (ou digite o prospect).' }
  }

  const linha = { ...v.dados, ...(responsavel ? { responsavel_id: responsavel } : {}) }
  const r = id
    ? await supabase.from('sac_oportunidades').update(linha).eq('id', id).select('id')
    : await supabase
        .from('sac_oportunidades')
        .insert({ ...linha, responsavel_id: responsavel ?? usuario.id })
        .select('id')
  if (r.error) return { erro: traduzirErro('oportunidade', r.error) }
  if (!r.data || r.data.length === 0) return { erro: 'Você não pode alterar esta oportunidade.' }

  revalidatePath('/sac')
  return { ok: id ? 'Oportunidade alterada.' : 'Oportunidade registrada.', id: r.data[0]!.id as string }
}

/** Apagar oportunidade registrada por engano (a auditoria guarda a linha). */
export async function excluirOportunidade(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('sac')
  const supabase = await clienteServidor()
  const id = idDoForm(form, 'id')
  if (!id) return { erro: 'Oportunidade inválida. Recarregue a página.' }
  const { data, error } = await supabase.from('sac_oportunidades').delete().eq('id', id).select('id')
  if (error) return { erro: traduzirErro('apagar oportunidade', error) }
  if (!data || data.length === 0) return { erro: 'Você não pode apagar esta oportunidade.' }
  revalidatePath('/sac')
  return { ok: 'Oportunidade apagada.' }
}

// ------------------------------------------------------------------ parâmetros

/** Pesos, metas e X dias do trimestre (030 D11). Só perfil 1; grava a linha DO trimestre. */
export async function salvarParametros(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  if (!usuario.ehDiretor) return { erro: 'Só a Diretoria altera as metas do Apoio Comercial.' }
  const supabase = await clienteServidor()

  const brutoT = form.get('t')
  const t = lerTrimestre(typeof brutoT === 'string' ? brutoT : '', hojeSaoPaulo())
  const v = validarParametros(form)
  if (!v.ok) return { erro: v.erro }

  const { error } = await supabase
    .from('sac_apoio_parametros')
    .upsert({ ano: t.ano, trimestre: t.trimestre, ...v.dados }, { onConflict: 'ano,trimestre' })
  if (error) return { erro: traduzirErro('parâmetros', error) }

  revalidatePath('/sac')
  return { ok: `Metas do ${t.trimestre}º trimestre de ${t.ano} gravadas.` }
}
