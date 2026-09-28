'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso } from '@/lib/autorizacao'
import {
  ehUuid,
  escaparLike,
  normalizarNome,
  podeAlterarAtivo,
  podeEscreverTipo,
  podeTerCarteira,
  type TipoClifor,
  validarGrupo,
} from '@/lib/clifor'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { EstadoAcao } from './tipos'

/*
 * Escrita do cadastro de clientes e fornecedores.
 *
 * Server action é endpoint público: cada uma repete `exigirAcesso('cadastros')` e valida
 * a entrada de novo, como se a tela não existisse. Grava com o cliente da SESSÃO — a RLS
 * de grupos_clifor (escrita só para quem tem a página `cadastros`, db/006) é a última
 * palavra; as regras de perfil daqui são as do Bubble que a RLS não expressa.
 * Nunca apaga: desativar é `ativo = false` (comentário da policy grupos_clifor_escrita).
 */

const NOME_TIPO: Record<TipoClifor, string> = { cliente: 'cliente', fornecedor: 'fornecedor' }

/** Erro do Postgres/PostgREST → frase que a pessoa entende. O detalhe vai para o log. */
function traduzirErro(contexto: string, erro: { code?: string; message?: string }): string {
  console.error(`cadastros: ${contexto}`, erro)
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para gravar cadastros.'
    case '23503':
      return 'Um dos valores escolhidos (vendedor ou captação) não existe mais. Recarregue a página.'
    case '23514':
      return 'Fornecedor não pode ter carteira.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

/**
 * Criar ou editar o GRUPO (o cliente/fornecedor "guarda-chuva").
 *
 * No Bubble o grupo só nasce junto da primeira filial, pelo popup de endereço
 * (spec cadastros §4.1, WF bUCcl0/bUCcr0). O banco novo permite grupo sem filial, e é o
 * que esta primeira versão faz; a filial é acrescentada depois na ficha.
 */
export async function salvarGrupo(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('cadastros')
  const supabase = await clienteServidor()

  const idBruto = form.get('id')
  const id = typeof idBruto === 'string' && idBruto !== '' ? idBruto : null
  if (id !== null && !ehUuid(id)) return { erro: 'Cadastro inválido. Recarregue a página.' }

  // Na edição o tipo vem do BANCO, não do formulário: trocar cliente↔fornecedor não é
  // operação desta tela, e o formulário é entrada do usuário.
  let tipoAtual: TipoClifor | null = null
  let carteiraAtual: string | null = null
  if (id) {
    const { data, error } = await supabase
      .from('grupos_clifor')
      .select('tipo, carteira_id')
      .eq('id', id)
      .maybeSingle()
    if (error) return { erro: traduzirErro('ler grupo', error) }
    if (!data) return { erro: 'Este cadastro não existe mais. Recarregue a página.' }
    tipoAtual = data.tipo as TipoClifor
    carteiraAtual = data.carteira_id as string | null
    form.set('tipo', tipoAtual)
  }

  const validacao = validarGrupo(form)
  if (!validacao.ok) return { erro: validacao.erro }
  const dados = validacao.dados

  if (!podeEscreverTipo(usuario, dados.tipo)) {
    // btn novo fornecedor (bUCYe0): Diretor, Gerente, Analista ou Financeiro.
    return { erro: 'Só Diretor, Gerente, Analista ou o Financeiro cadastram fornecedor.' }
  }

  // Carteira: só vendedor ativo fora do Financeiro e da Operação (Dropdown B bUCXK0).
  // Quem já era dono continua valendo mesmo que tenha mudado de departamento — a regra
  // vale para a TROCA, e não pode travar a gravação de outro campo.
  if (dados.carteira_id && dados.carteira_id !== carteiraAtual) {
    const { data: dono } = await supabase
      .from('usuarios')
      .select('departamento_id')
      .eq('id', dados.carteira_id)
      .eq('ativo', true)
      .maybeSingle()
    if (!dono || !podeTerCarteira(dono.departamento_id as number)) {
      return { erro: 'Este vendedor não pode receber carteira.' }
    }
  }

  // Nome repetido é AVISO, não bloqueio: a base já tem duplicata e o índice único de nome
  // só entra depois da limpeza (comentário de grupos_clifor, db/006). A pessoa confirma.
  // A comparação final é em normalizarNome (acento, caixa e espaço sobrando — a base tem
  // "NOME " com espaço no fim); o ILIKE só traz os candidatos.
  if (form.get('confirmar_parecido') !== 'on') {
    let consulta = supabase
      .from('grupos_clifor')
      .select('nome')
      .eq('tipo', dados.tipo)
      .ilike('nome', `%${escaparLike(dados.nome)}%`)
      .limit(50)
    if (id) consulta = consulta.neq('id', id)
    const { data: candidatos, error } = await consulta
    if (error) return { erro: traduzirErro('conferir nome', error) }
    const alvo = normalizarNome(dados.nome)
    const parecidos = (candidatos ?? [])
      .map((c) => c.nome as string)
      .filter((n) => normalizarNome(n) === alvo)
    if (parecidos.length > 0) return { parecidos: parecidos.slice(0, 3) }
  }

  if (id) {
    const alteracao = {
      nome: dados.nome,
      carteira_id: dados.carteira_id,
      captacao_id: dados.captacao_id,
      email_principal: dados.email_principal,
      nao_faz_contrato_parceria: dados.nao_faz_contrato_parceria,
      observacoes: dados.observacoes,
    }
    const { data, error } = await supabase
      .from('grupos_clifor')
      .update(alteracao)
      .eq('id', id)
      .select('id')
    if (error) return { erro: traduzirErro('editar grupo', error) }
    // UPDATE barrado pela RLS não dá erro: devolve zero linhas.
    if (!data || data.length === 0) return { erro: 'Você não tem permissão para editar este cadastro.' }
    revalidatePath('/cadastros')
    return { ok: 'Alterações gravadas.', id }
  }

  const { data, error } = await supabase
    .from('grupos_clifor')
    .insert({ ...dados, criado_por: usuario.id })
    .select('id')
    .single()
  if (error) return { erro: traduzirErro('criar grupo', error) }

  revalidatePath('/cadastros')
  return { ok: `Novo ${NOME_TIPO[dados.tipo]} cadastrado.`, id: data.id as string }
}

/**
 * Ativar ou desativar o grupo, em cascata nas filiais — WF bUCbZ0: (bUCbd0) grava no
 * grupo e (bUCbe0) aplica a MESMA flag em todas as filiais, nos dois sentidos.
 *
 * Fornecedor só com hierarquia <= 2 (Switch A travado por bUCXd0).
 *
 * LIMITE CONHECIDO: são duas gravações sem transação, porque o PostgREST não abre
 * transação entre chamadas. Se a segunda falhar, o grupo fica gravado e as filiais não —
 * a mensagem diz isso. A correção é uma função SQL (`fn_definir_ativo_grupo`) em
 * migration futura; esta tela não altera o banco.
 */
export async function definirAtivoGrupo(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('cadastros')
  const supabase = await clienteServidor()

  const id = form.get('id')
  const ativoBruto = form.get('ativo')
  if (!ehUuid(id) || (ativoBruto !== 'true' && ativoBruto !== 'false')) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }
  const ativo = ativoBruto === 'true'

  const { data: grupo, error: erroLeitura } = await supabase
    .from('grupos_clifor')
    .select('tipo')
    .eq('id', id)
    .maybeSingle()
  if (erroLeitura) return { erro: traduzirErro('ler grupo', erroLeitura) }
  if (!grupo) return { erro: 'Este cadastro não existe mais. Recarregue a página.' }

  const tipo = grupo.tipo as TipoClifor
  if (!podeAlterarAtivo(usuario, tipo)) {
    return { erro: 'Só Diretor ou Gerente ativa ou desativa fornecedor.' }
  }

  const { data, error } = await supabase
    .from('grupos_clifor')
    .update({ ativo })
    .eq('id', id)
    .select('id')
  if (error) return { erro: traduzirErro('ativar grupo', error) }
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar este cadastro.' }

  const { error: erroFiliais } = await supabase
    .from('enderecos_clifor')
    .update({ ativo })
    .eq('grupo_id', id)
    .neq('ativo', ativo)
  revalidatePath('/cadastros')
  if (erroFiliais) {
    traduzirErro('ativar filiais', erroFiliais)
    return {
      erro: `O ${NOME_TIPO[tipo]} foi ${ativo ? 'ativado' : 'desativado'}, mas as filiais não. Tente de novo.`,
      id,
    }
  }

  return { ok: ativo ? 'Cadastro reativado, com as filiais.' : 'Cadastro desativado, com as filiais.', id }
}
