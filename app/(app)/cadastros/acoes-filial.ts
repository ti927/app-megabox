'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso } from '@/lib/autorizacao'
import { ehUuid, podeEscreverTipo, type TipoClifor } from '@/lib/clifor'
import { somenteDigitos } from '@/lib/documento'
import {
  deveTornarPrincipal,
  podeBloquearFilial,
  validarContato,
  validarFilial,
} from '@/lib/filial-contato'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { EstadoItem, OutraFilial } from './tipos'

/*
 * Escrita de FILIAL (enderecos_clifor) e CONTATO (contatos_clifor) na ficha do grupo.
 * Porta de pop.AddEditaEndereço (bTxcQ) e pop.AddEditaContato (bTxnz) —
 * specs/paginas/enderecos-e-contatos.md.
 *
 * Mesmas regras de acoes.ts: cada action repete exigirAcesso('cadastros'), valida de novo
 * no servidor e grava com o cliente da SESSÃO (a RLS de 006 é a última palavra). Nunca
 * apaga: desativar é `ativo = false` (§4.6, §4.8 — o Bubble também não tem exclusão).
 * Toda escrita em enderecos_clifor passa pelo trigger de auditoria (regime e UF mudam o
 * ICMS; `liberado` trava a venda), que registra quem e quando.
 */

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

function traduzirErro(contexto: string, erro: { code?: string; message?: string }): string {
  console.error(`cadastros/filial: ${contexto}`, erro)
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para gravar cadastros.'
    case '23503':
      return 'Um dos valores escolhidos não existe mais. Recarregue a página.'
    case '23505':
      return 'Outra pessoa acabou de trocar a filial principal deste cadastro. Recarregue e tente de novo.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

async function lerGrupo(supabase: Supabase, grupoId: string) {
  const { data, error } = await supabase
    .from('grupos_clifor')
    .select('id, tipo')
    .eq('id', grupoId)
    .maybeSingle()
  return { grupo: data as { id: string; tipo: TipoClifor } | null, error }
}

const NEGADO_FORNECEDOR = 'Só Diretor, Gerente, Analista ou o Financeiro alteram filial de fornecedor.'

// ----------------------------------------------------------------- documento repetido

/**
 * Aviso de documento já cadastrado (§4.4, `rpg busca cnpj` bTxfL): onde mais este
 * CNPJ/CPF aparece. SÓ AVISA — B1 (specs/04-duvidas.md §1.1): documento não é único.
 *
 * Lê `enderecos_clifor` e não `v_clifor_documento_duplicado`: a view só lista documentos
 * que JÁ se repetem, e o caso que o aviso existe para pegar é o primeiro repetido — o
 * documento que está uma vez na base e vai entrar de novo.
 */
export async function verificarDocumento(
  documentoBruto: string,
  enderecoId: string | null,
): Promise<OutraFilial[]> {
  await exigirAcesso('cadastros')
  const documento = somenteDigitos(documentoBruto)
  if (documento.length !== 11 && documento.length !== 14) return []
  const supabase = await clienteServidor()
  let consulta = supabase
    .from('enderecos_clifor')
    .select('id, nome_endereco, ativo, grupo:grupos_clifor!inner(id, nome, tipo)')
    .eq('documento', documento)
    .limit(10)
  if (enderecoId && ehUuid(enderecoId)) consulta = consulta.neq('id', enderecoId)
  const { data, error } = await consulta
  if (error) {
    console.error('cadastros/filial: verificar documento', error)
    return []
  }
  type Linha = { id: string; nome_endereco: string; ativo: boolean; grupo: { id: string; nome: string; tipo: TipoClifor } }
  return ((data ?? []) as unknown as Linha[]).map((l) => ({
    endereco_id: l.id,
    nome_endereco: l.nome_endereco,
    grupo_id: l.grupo.id,
    grupo_nome: l.grupo.nome,
    grupo_tipo: l.grupo.tipo,
    ativo: l.ativo,
  }))
}

// ------------------------------------------------------------------------ salvar filial

/**
 * Criar (WF bTxmM) ou editar (WF bTxjr) uma filial.
 *
 * Diferenças deliberadas do Bubble: NÃO regrava o grupo (§8.1, [DÚVIDA 8]); valida no
 * servidor (§8.4); `principal` é de verdade e único por grupo (§4.5, [DÚVIDA 1]).
 */
export async function salvarFilial(_anterior: EstadoItem, form: FormData): Promise<EstadoItem> {
  const usuario = await exigirAcesso('cadastros')
  const supabase = await clienteServidor()

  const grupoId = form.get('grupo_id')
  const idBruto = form.get('id')
  const id = typeof idBruto === 'string' && idBruto !== '' ? idBruto : null
  if (!ehUuid(grupoId) || (id !== null && !ehUuid(id))) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }

  const { grupo, error: erroGrupo } = await lerGrupo(supabase, grupoId)
  if (erroGrupo) return { erro: traduzirErro('ler grupo', erroGrupo) }
  if (!grupo) return { erro: 'Este cadastro não existe mais. Recarregue a página.' }
  // btn novo endereço cliente (bTPNs) e "Destravar Campos" (bTxef): fornecedor tem trava de
  // perfil; vale a regra da página cadastros (clifor.podeEscreverTipo).
  if (!podeEscreverTipo(usuario, grupo.tipo)) return { erro: NEGADO_FORNECEDOR }

  type Atual = {
    id: string
    grupo_id: string
    documento: string | null
    tipo_pessoa: 'cpf' | 'cnpj'
    cep: string | null
    ativo: boolean
    liberado: boolean
    liberado_motivo: string | null
    principal: boolean
  }
  let atual: Atual | null = null
  if (id) {
    const { data, error } = await supabase
      .from('enderecos_clifor')
      .select('id, grupo_id, documento, tipo_pessoa, cep, ativo, liberado, liberado_motivo, principal')
      .eq('id', id)
      .maybeSingle()
    if (error) return { erro: traduzirErro('ler filial', error) }
    // A filial tem de ser DESTE grupo: o id vem do formulário.
    if (!data || data.grupo_id !== grupoId) return { erro: 'Esta filial não existe mais. Recarregue a página.' }
    atual = data as Atual
  }

  const validacao = validarFilial(form, grupo.tipo, atual)
  if (!validacao.ok) return { erro: validacao.erro }
  const dados = validacao.dados
  const avisos = [...validacao.avisos]

  // Filial nova nasce liberada: bloquear é decisão sobre filial que já existe.
  if (!atual) {
    dados.liberado = true
    dados.liberado_motivo = null
  }
  const mexeuNoBloqueio =
    atual !== null &&
    (atual.liberado !== dados.liberado || (!dados.liberado && atual.liberado_motivo !== dados.liberado_motivo))
  if (mexeuNoBloqueio && !podeBloquearFilial(usuario)) {
    return { erro: 'Só Diretor, Gerente ou o Financeiro bloqueiam ou liberam filial.' }
  }

  // Listas fixas conferidas no banco: UF de `ufs` (Opt.UFs), regime e frete.
  const [uf, regime, frete, principalAtual] = await Promise.all([
    supabase.from('ufs').select('sigla').eq('sigla', dados.uf).maybeSingle(),
    supabase.from('regimes_tributarios').select('id').eq('id', dados.regime_tributario_id).maybeSingle(),
    dados.frete_id === null
      ? Promise.resolve({ data: { id: 0 }, error: null })
      : supabase.from('tipos_frete').select('id').eq('id', dados.frete_id).maybeSingle(),
    supabase
      .from('enderecos_clifor')
      .select('id')
      .eq('grupo_id', grupoId)
      .eq('principal', true)
      .maybeSingle(),
  ])
  const falhaLeitura = uf.error ?? regime.error ?? frete.error ?? principalAtual.error
  if (falhaLeitura) return { erro: traduzirErro('conferir listas', falhaLeitura) }
  if (!uf.data) return { erro: 'UF inválida.' }
  if (!regime.data) return { erro: 'Regime tributário inválido.' }
  if (!frete.data) return { erro: 'Tipo de frete inválido.' }

  const anteriorPrincipalId = (principalAtual.data?.id as string | undefined) ?? null
  const tornarPrincipal = deveTornarPrincipal({
    pediu: form.get('principal') === 'on',
    jaEraPrincipal: atual?.principal ?? false,
    grupoTemPrincipal: anteriorPrincipalId !== null,
    ativa: atual ? atual.ativo : true,
  })
  if (form.get('principal') === 'on' && atual && !atual.ativo) {
    avisos.push('Filial inativa não pode ser a principal; a principal continua a mesma.')
  }

  // Troca de principal numa sequência segura: DESMARCA a anterior → grava esta marcada.
  // O índice único parcial um_principal_por_grupo impede duas. Se a segunda gravação falhar,
  // a anterior é REMARCADA; se até isso falhar, a mensagem diz que o grupo ficou sem principal.
  // (Sem transação entre chamadas do PostgREST — ver o relatório: uma função SQL resolveria.)
  let desmarcou: string | null = null
  if (tornarPrincipal && anteriorPrincipalId && anteriorPrincipalId !== id) {
    const { data, error } = await supabase
      .from('enderecos_clifor')
      .update({ principal: false })
      .eq('id', anteriorPrincipalId)
      .select('id')
    if (error) return { erro: traduzirErro('desmarcar principal', error) }
    if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar este cadastro.' }
    desmarcou = anteriorPrincipalId
  }

  const registro = { ...dados, ...(tornarPrincipal ? { principal: true } : {}) }
  const gravacao = id
    ? await supabase.from('enderecos_clifor').update(registro).eq('id', id).select('id')
    : await supabase
        .from('enderecos_clifor')
        .insert({ ...registro, grupo_id: grupoId, criado_por: usuario.id })
        .select('id')

  const falhou = gravacao.error ?? (!gravacao.data || gravacao.data.length === 0 ? { code: '42501' } : null)
  if (falhou) {
    const mensagem = traduzirErro(id ? 'editar filial' : 'criar filial', falhou)
    if (desmarcou) {
      const { error: erroVolta } = await supabase
        .from('enderecos_clifor')
        .update({ principal: true })
        .eq('id', desmarcou)
      revalidatePath('/cadastros')
      if (erroVolta) {
        traduzirErro('remarcar principal', erroVolta)
        return {
          erro: `${mensagem} Atenção: a filial principal anterior foi desmarcada e não deu para remarcar — o cadastro está sem principal. Marque uma filial como principal.`,
        }
      }
    }
    return { erro: mensagem }
  }

  revalidatePath('/cadastros')
  return {
    ok: id ? 'Filial gravada.' : tornarPrincipal ? 'Filial cadastrada como principal.' : 'Filial cadastrada.',
    avisos: avisos.length > 0 ? avisos : undefined,
  }
}

// ----------------------------------------------------------- ativar/desativar filial

/**
 * Substitui o switch auto-binding `Switch A` (bTeNJ, §4.6): server action, com permissão e
 * trilha (auditoria). Não apaga.
 */
export async function definirAtivoFilial(_anterior: EstadoItem, form: FormData): Promise<EstadoItem> {
  const usuario = await exigirAcesso('cadastros')
  const supabase = await clienteServidor()

  const id = form.get('id')
  const ativoBruto = form.get('ativo')
  if (!ehUuid(id) || (ativoBruto !== 'true' && ativoBruto !== 'false')) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }
  const ativo = ativoBruto === 'true'

  const { data: filial, error } = await supabase
    .from('enderecos_clifor')
    .select('id, grupo_id, principal, grupo:grupos_clifor!inner(tipo)')
    .eq('id', id)
    .maybeSingle()
  if (error) return { erro: traduzirErro('ler filial', error) }
  if (!filial) return { erro: 'Esta filial não existe mais. Recarregue a página.' }
  const tipo = (filial.grupo as unknown as { tipo: TipoClifor }).tipo
  if (!podeEscreverTipo(usuario, tipo)) return { erro: NEGADO_FORNECEDOR }

  // A principal não sai de cena enquanto houver outra filial ativa para assumir.
  if (!ativo && filial.principal) {
    const { count } = await supabase
      .from('enderecos_clifor')
      .select('id', { count: 'exact', head: true })
      .eq('grupo_id', filial.grupo_id)
      .eq('ativo', true)
      .neq('id', id)
    if ((count ?? 0) > 0) {
      return { erro: 'Esta é a filial principal. Marque outra como principal antes de desativá-la.' }
    }
  }

  const { data, error: erroGravar } = await supabase
    .from('enderecos_clifor')
    .update({ ativo })
    .eq('id', id)
    .select('id')
  if (erroGravar) return { erro: traduzirErro('ativar filial', erroGravar) }
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar este cadastro.' }
  revalidatePath('/cadastros')
  return { ok: ativo ? 'Filial reativada.' : 'Filial desativada.' }
}

// ----------------------------------------------------------------------- salvar contato

/**
 * Criar (WF bTxrd) ou editar (WF bTxro) contato. Sem trava de perfil, como no Bubble (§1:
 * "nenhuma restrição"); quem escreve é quem tem a página `cadastros` (RLS). Contato novo
 * nasce ativo ([DÚVIDA 5]).
 */
export async function salvarContato(_anterior: EstadoItem, form: FormData): Promise<EstadoItem> {
  const usuario = await exigirAcesso('cadastros')
  const supabase = await clienteServidor()

  const grupoId = form.get('grupo_id')
  const idBruto = form.get('id')
  const id = typeof idBruto === 'string' && idBruto !== '' ? idBruto : null
  if (!ehUuid(grupoId) || (id !== null && !ehUuid(id))) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }

  const { grupo, error: erroGrupo } = await lerGrupo(supabase, grupoId)
  if (erroGrupo) return { erro: traduzirErro('ler grupo', erroGrupo) }
  if (!grupo) return { erro: 'Este cadastro não existe mais. Recarregue a página.' }

  let telefoneAnterior: string | null = null
  if (id) {
    const { data, error } = await supabase
      .from('contatos_clifor')
      .select('grupo_id, telefone')
      .eq('id', id)
      .maybeSingle()
    if (error) return { erro: traduzirErro('ler contato', error) }
    if (!data || data.grupo_id !== grupoId) return { erro: 'Este contato não existe mais. Recarregue a página.' }
    telefoneAnterior = (data.telefone as string | null) ?? null
  }

  const validacao = validarContato(form, telefoneAnterior)
  if (!validacao.ok) return { erro: validacao.erro }
  const dados = validacao.dados

  // "Vinculado ao endereço" (dd qual endereco bTxqC): só filial DESTE grupo.
  if (dados.endereco_id) {
    const { data, error } = await supabase
      .from('enderecos_clifor')
      .select('grupo_id')
      .eq('id', dados.endereco_id)
      .maybeSingle()
    if (error) return { erro: traduzirErro('conferir filial do contato', error) }
    if (!data || data.grupo_id !== grupoId) return { erro: 'A filial escolhida não é deste cadastro.' }
  }

  const gravacao = id
    ? await supabase.from('contatos_clifor').update(dados).eq('id', id).select('id')
    : await supabase
        .from('contatos_clifor')
        .insert({ ...dados, grupo_id: grupoId, ativo: true, criado_por: usuario.id })
        .select('id')
  if (gravacao.error) return { erro: traduzirErro(id ? 'editar contato' : 'criar contato', gravacao.error) }
  if (!gravacao.data || gravacao.data.length === 0) {
    return { erro: 'Você não tem permissão para alterar este cadastro.' }
  }

  revalidatePath('/cadastros')
  return {
    ok: id ? 'Contato gravado.' : 'Contato cadastrado.',
    avisos: validacao.avisos.length > 0 ? validacao.avisos : undefined,
  }
}

/** Substitui o switch auto-binding do contato (`Switch A` bTeir0, §4.8). */
export async function definirAtivoContato(_anterior: EstadoItem, form: FormData): Promise<EstadoItem> {
  await exigirAcesso('cadastros')
  const supabase = await clienteServidor()

  const id = form.get('id')
  const ativoBruto = form.get('ativo')
  if (!ehUuid(id) || (ativoBruto !== 'true' && ativoBruto !== 'false')) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }
  const { data, error } = await supabase
    .from('contatos_clifor')
    .update({ ativo: ativoBruto === 'true' })
    .eq('id', id)
    .select('id')
  if (error) return { erro: traduzirErro('ativar contato', error) }
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar este contato.' }
  revalidatePath('/cadastros')
  return { ok: ativoBruto === 'true' ? 'Contato reativado.' : 'Contato desativado.' }
}
