'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso } from '@/lib/autorizacao'
import { ehUuid, escaparLike } from '@/lib/clifor'
import {
  camposEditaveis,
  caminhoPesquisa,
  podeExcluir,
  recortarParaResponsavel,
  TIPO_PESQUISA_NPS,
  validarInteracao,
  validarMotivo,
  validarNomePesquisa,
  validarProtocoloEdicao,
  validarProtocoloNovo,
} from '@/lib/sac'
import { ehTipoAcao, textoDaAcao, type TipoAcao } from '@/lib/sac-apoio'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { CliforEncontrado, Contato, Entrega, EstadoAcao, Filial, PedidoEncontrado } from './tipos'

/*
 * Escrita da página SAC.
 *
 * Server action é endpoint público: cada uma repete `exigirAcesso('sac')` e valida a entrada
 * de novo. Chamados, entregas ligadas, interações e campanhas gravam com o cliente da SESSÃO —
 * a RLS da 013 (D4: perfil 1, responsável ou quem abriu) e os triggers (D1 exclusão só perfil
 * 1, D3 fechado_em pelo status, D5 interação append-only) são a última palavra.
 *
 * CONVITES são a exceção (D7 da 013): `authenticated` não tem escrita em pesquisa_convites nem
 * execute em fn_pesquisa_emitir_token. Essas três actions (adicionar, emitir, cancelar) usam
 * service_role, e por isso conferem ANTES, com o cliente da sessão, que a pessoa enxerga a
 * pesquisa e o convite. O TOKEN EM CLARO só existe na volta de `emitirConvite`: não é logado,
 * não é gravado, não entra em mensagem de erro — vai uma vez ao navegador como link a copiar.
 */

type Supabase = Awaited<ReturnType<typeof clienteServidor>>
type Erro = { code?: string; message?: string }

function traduzirErro(contexto: string, erro: Erro): string {
  // Só código e mensagem do Postgres: nenhuma action aqui passa token para o banco em texto
  // que volte em erro (o token só existe na RESPOSTA de fn_pesquisa_emitir_token).
  console.error(`sac: ${contexto}`, { code: erro.code, message: erro.message })
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para esta alteração.'
    case '23503':
      return 'Um dos valores escolhidos não existe mais. Recarregue a página.'
    case '23505':
      return 'Já existe um registro igual.'
    case '23514':
      return 'Os dados não combinam entre si (filial ou contato de outro cliente). Confira e grave de novo.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

function idDoForm(form: FormData, campo: string): string | null {
  const v = form.get(campo)
  return ehUuid(v) ? v.toLowerCase() : null
}

/** Entregas pedidas que são mesmo do pedido. Devolve null se alguma não for (ou não for legível). */
async function conferirEntregas(supabase: Supabase, pedidoId: string, ids: string[]) {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('entregas').select('id').eq('pedido_id', pedidoId).in('id', ids)
  if (error) return null
  return (data ?? []).length === ids.length ? ids : null
}

/** Deixa as entregas ligadas iguais às marcadas (só a diferença é tocada). */
async function sincronizarEntregas(
  supabase: Supabase,
  protocoloId: string,
  desejado: string[],
  usuarioId: string,
): Promise<Erro | null> {
  const { data, error } = await supabase
    .from('sac_protocolo_entregas')
    .select('entrega_id')
    .eq('protocolo_id', protocoloId)
  if (error) return error
  const atual = new Set((data ?? []).map((l) => l.entrega_id as string))
  const quero = new Set(desejado)
  const desligar = [...atual].filter((x) => !quero.has(x))
  const ligar = [...quero].filter((x) => !atual.has(x))
  if (desligar.length > 0) {
    const { error: e } = await supabase
      .from('sac_protocolo_entregas')
      .delete()
      .eq('protocolo_id', protocoloId)
      .in('entrega_id', desligar)
    if (e) return e
  }
  if (ligar.length > 0) {
    const { error: e } = await supabase
      .from('sac_protocolo_entregas')
      .insert(ligar.map((entrega_id) => ({ protocolo_id: protocoloId, entrega_id, criado_por: usuarioId })))
    if (e) return e
  }
  return null
}

// ------------------------------------------------------------------ buscas (leitura)

/**
 * Autocomplete de cliente/fornecedor — `dd qualclifor` (bUCrI): GrupoCliFor ativo por nome,
 * aqui também pelo tipo do rádio `rad tipo clifor` (bUDLe0).
 */
export async function buscarClifor(
  termo: string,
  tipo: 'cliente' | 'fornecedor',
): Promise<{ itens: CliforEncontrado[] } | { erro: string }> {
  await exigirAcesso('sac')
  const supabase = await clienteServidor()
  const q = typeof termo === 'string' ? termo.trim().slice(0, 100) : ''
  if (q.length < 2) return { itens: [] }
  const { data, error } = await supabase
    .from('grupos_clifor')
    .select('id, nome, tipo')
    .eq('tipo', tipo === 'fornecedor' ? 'fornecedor' : 'cliente')
    .eq('ativo', true)
    .ilike('nome', `%${escaparLike(q)}%`)
    .order('nome')
    .limit(20)
  if (error) {
    console.error('sac: buscar clifor', { code: error.code })
    return { erro: 'Não foi possível buscar agora.' }
  }
  return { itens: (data ?? []) as CliforEncontrado[] }
}

/**
 * Autocomplete de pedido — `dd pedido` (bUCrf) busca Tbl.Pedido pelo número. A RLS de
 * `pedidos` é a de vendas (página vendas + carteira): quem só tem a página sac não acha
 * pedido nenhum — ver o relatório da fatia.
 */
export async function buscarPedidos(termo: string): Promise<{ itens: PedidoEncontrado[] } | { erro: string }> {
  await exigirAcesso('sac')
  const supabase = await clienteServidor()
  const q = typeof termo === 'string' ? termo.replace(/\D/g, '').slice(0, 12) : ''
  if (q.length < 1) return { itens: [] }
  const { data, error } = await supabase
    .from('pedidos')
    .select(
      'id, numero, cliente:grupos_clifor!cliente_id(id, nome), ' +
        'forn:enderecos_clifor!primeiro_fornecedor_endereco_id(grupo:grupos_clifor(id, nome))',
    )
    .like('numero', `${q}%`)
    .order('numero', { ascending: false })
    .limit(15)
  if (error) {
    console.error('sac: buscar pedido', { code: error.code, message: error.message })
    return { erro: 'Não foi possível buscar agora.' }
  }
  type Linha = {
    id: string
    numero: string
    cliente: { id: string; nome: string } | null
    forn: { grupo: { id: string; nome: string } | null } | null
  }
  return {
    itens: ((data ?? []) as unknown as Linha[]).map((p) => ({
      id: p.id,
      numero: p.numero,
      cliente: p.cliente,
      fornecedor: p.forn?.grupo ?? null,
    })),
  }
}

/**
 * Dependências do formulário novo: filiais do cliente (`dd qualfilial` bUDLM0) e entregas do
 * pedido (`dd entregas` bUDKD0).
 */
export async function carregarDependencias(
  grupoId: string | null,
  pedidoId: string | null,
): Promise<{ filiais: Filial[]; entregas: Entrega[] }> {
  await exigirAcesso('sac')
  const supabase = await clienteServidor()
  const [filiais, entregas] = await Promise.all([
    ehUuid(grupoId)
      ? supabase
          .from('enderecos_clifor')
          .select('id, nome_endereco, documento, uf, ativo')
          .eq('grupo_id', grupoId)
          .order('ativo', { ascending: false })
          .order('nome_endereco')
      : Promise.resolve({ data: [] }),
    ehUuid(pedidoId)
      ? supabase
          .from('entregas')
          .select('id, numero_entrega, dt_prev_entrega, qtd, nf_fornecedor_numero')
          .eq('pedido_id', pedidoId)
          .order('dt_prev_entrega', { nullsFirst: false })
      : Promise.resolve({ data: [] }),
  ])
  return {
    filiais: (filiais.data ?? []) as Filial[],
    entregas: (entregas.data ?? []) as Entrega[],
  }
}

/**
 * Contatos com e-mail do cliente — o `dd qual email contato` (bUDcj) da linha da pesquisa.
 * Só os que têm e-mail: é para eles que o link vai.
 */
export async function listarContatos(grupoId: string): Promise<Contato[]> {
  await exigirAcesso('sac')
  if (!ehUuid(grupoId)) return []
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('contatos_clifor')
    .select('id, nome, email')
    .eq('grupo_id', grupoId)
    .eq('ativo', true)
    .not('email', 'is', null)
    .order('nome')
  return (data ?? []) as Contato[]
}

// ------------------------------------------------------------------------ protocolo

/**
 * Abrir protocolo — WF bUDKj0 (ação bUDKp0 cria; bUECt grava DataAberto só se "Em aberto").
 * Aqui número é identity (D2) e `aberto_em` é sempre do banco (D3). O pedido tem de ser do
 * cliente escolhido quando o rádio é Cliente — o Bubble pré-carrega o cliente do pedido
 * (`dd qualclifor`, §3.2) mas deixa trocar; aqui não se grava par incoerente.
 *
 * LIMITE CONHECIDO: protocolo e entregas ligadas são gravações separadas (PostgREST não abre
 * transação entre chamadas). Se as entregas falharem, o protocolo fica e a ficha abre para
 * gravar de novo.
 */
export async function criarProtocolo(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const v = validarProtocoloNovo(form)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados

  const { data: grupo, error: eGrupo } = await supabase
    .from('grupos_clifor')
    .select('id, tipo, ativo')
    .eq('id', d.grupo_clifor_id)
    .maybeSingle()
  if (eGrupo) return { erro: traduzirErro('ler cliente', eGrupo) }
  if (!grupo) return { erro: 'Este cliente/fornecedor não existe mais. Busque de novo.' }

  if (d.pedido_id) {
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select('cliente_id')
      .eq('id', d.pedido_id)
      .maybeSingle()
    if (error) return { erro: traduzirErro('ler pedido', error) }
    if (!pedido) return { erro: 'Este pedido não existe ou você não tem acesso a ele.' }
    if (grupo.tipo === 'cliente' && pedido.cliente_id !== d.grupo_clifor_id) {
      return { erro: 'O pedido escolhido é de outro cliente.' }
    }
    if ((await conferirEntregas(supabase, d.pedido_id, d.entregas)) === null) {
      return { erro: 'Alguma entrega marcada não é deste pedido. Escolha o pedido de novo.' }
    }
  }

  const { data, error } = await supabase
    .from('sac_protocolos')
    .insert({
      grupo_clifor_id: d.grupo_clifor_id,
      filial_id: d.filial_id,
      pedido_id: d.pedido_id,
      responsavel_id: d.responsavel_id,
      tipo_ocorrencia_id: d.tipo_ocorrencia_id,
      prioridade_id: d.prioridade_id,
      status_id: d.status_id,
      descricao: d.descricao,
      criado_por: usuario.id,
    })
    .select('id, numero')
    .single()
  if (error) return { erro: traduzirErro('criar protocolo', error) }

  const id = data.id as string
  const erroEntregas = await sincronizarEntregas(supabase, id, d.entregas, usuario.id)
  revalidatePath('/sac')
  if (erroEntregas) {
    traduzirErro('ligar entregas', erroEntregas)
    return { erro: `Protocolo nº ${data.numero} aberto, mas as entregas não foram ligadas. Grave de novo.`, id }
  }
  // Toast do Bubble: "Criado com sucesso" (ação bUDLZ0).
  return { ok: `Protocolo nº ${data.numero} aberto.`, id }
}

/**
 * Editar protocolo — WF bUDSx (ação bUDTF grava os campos; bUECy grava DataFechado se
 * Resolvido; bUEDD calcula TempoResolução). Aqui `fechado_em` e `tempo_resolucao` são do banco
 * (D3: entrar em Resolvido carimba, sair limpa — [DÚVIDA 14]). Quem mexe no quê:
 * `camposEditaveis` (Diretoria tudo; responsável só status e descrição — [DÚVIDA 5], §9.3).
 * Cliente e pedido não mudam depois de aberto (decisão da tela, ver relatório).
 */
export async function salvarProtocolo(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const id = idDoForm(form, 'id')
  if (!id) return { erro: 'Protocolo inválido. Recarregue a página.' }
  const v = validarProtocoloEdicao(form)
  if (!v.ok) return { erro: v.erro }

  const { data: atual, error: eAtual } = await supabase
    .from('sac_protocolos')
    .select('responsavel_id, excluido_em, pedido_id')
    .eq('id', id)
    .maybeSingle()
  if (eAtual) return { erro: traduzirErro('ler protocolo', eAtual) }
  if (!atual) return { erro: 'Este protocolo não existe ou você não tem acesso a ele.' }

  const pode = camposEditaveis(usuario, atual)
  if (pode === 'nenhum') {
    return {
      erro: atual.excluido_em
        ? 'Protocolo excluído: desfaça a exclusão antes de editar.'
        : 'Só a Diretoria ou o responsável alteram este protocolo.',
    }
  }

  const d = v.dados
  const campos =
    pode === 'todos'
      ? {
          filial_id: d.filial_id,
          responsavel_id: d.responsavel_id,
          tipo_ocorrencia_id: d.tipo_ocorrencia_id,
          prioridade_id: d.prioridade_id,
          status_id: d.status_id,
          descricao: d.descricao,
        }
      : recortarParaResponsavel(d)

  if (pode === 'todos' && atual.pedido_id) {
    if ((await conferirEntregas(supabase, atual.pedido_id, d.entregas)) === null) {
      return { erro: 'Alguma entrega marcada não é do pedido deste protocolo.' }
    }
  }

  const { data, error } = await supabase.from('sac_protocolos').update(campos).eq('id', id).select('id')
  if (error) return { erro: traduzirErro('editar protocolo', error) }
  // UPDATE barrado pela RLS não dá erro: devolve zero linhas.
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar este protocolo.' }

  if (pode === 'todos' && atual.pedido_id) {
    const e = await sincronizarEntregas(supabase, id, d.entregas, usuario.id)
    if (e) {
      revalidatePath('/sac')
      traduzirErro('ligar entregas', e)
      return { erro: 'O protocolo foi gravado, mas as entregas não. Grave de novo.' }
    }
  }

  revalidatePath('/sac')
  // Toast do Bubble: "Alterado com sucesso!" (ação bUEAb3).
  return { ok: 'Alterações gravadas.' }
}

/**
 * Excluir chamado — WF bUEFh2 (ação bUEFn2 `Ativo = False`; bUEFs2 e bUEGD2 são inócuos e não
 * migram). Aqui: exclusão LÓGICA com motivo, quem e quando (D1), só perfil 1 ([DÚVIDA 5]).
 * O trigger carimba `excluido_por` e recusa quem não é perfil 1 — esta checagem é a de tela.
 */
export async function excluirProtocolo(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  if (!podeExcluir(usuario)) return { erro: 'Só a Diretoria exclui protocolo.' }
  const supabase = await clienteServidor()

  const id = idDoForm(form, 'id')
  if (!id) return { erro: 'Protocolo inválido. Recarregue a página.' }
  const motivo = validarMotivo(form.get('motivo'))
  if (!motivo.ok) return { erro: motivo.erro }

  const { data, error } = await supabase
    .from('sac_protocolos')
    .update({ excluido_em: new Date().toISOString(), excluido_motivo: motivo.dados })
    .eq('id', id)
    .is('excluido_em', null)
    .select('id')
  if (error) return { erro: traduzirErro('excluir protocolo', error) }
  if (!data || data.length === 0) return { erro: 'Este protocolo já foi excluído ou você não pode alterá-lo.' }

  revalidatePath('/sac')
  return { ok: 'Protocolo excluído. Ele sai da lista e pode ser restaurado pela Diretoria.' }
}

/** Desfazer a exclusão — só perfil 1 (D1). Não existe no Bubble (lá nada desfaz). */
export async function restaurarProtocolo(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  if (!podeExcluir(usuario)) return { erro: 'Só a Diretoria restaura protocolo.' }
  const supabase = await clienteServidor()

  const id = idDoForm(form, 'id')
  if (!id) return { erro: 'Protocolo inválido. Recarregue a página.' }

  const { data, error } = await supabase
    .from('sac_protocolos')
    .update({ excluido_em: null, excluido_motivo: null })
    .eq('id', id)
    .not('excluido_em', 'is', null)
    .select('id')
  if (error) return { erro: traduzirErro('restaurar protocolo', error) }
  if (!data || data.length === 0) return { erro: 'Este protocolo não está excluído.' }

  revalidatePath('/sac')
  return { ok: 'Exclusão desfeita.' }
}

/**
 * Registrar interação — WF bUDth (ação bUDtn cria; bUDzl agenda o e-mail "Atualização do seu
 * atendimento – SAC" se visível ao cliente). APPEND-ONLY (D5): só INSERT, com autor = quem
 * grava. O E-MAIL AO CLIENTE NÃO É ENVIADO nesta fatia (não há envio no app ainda): a
 * interação fica marcada visível, com o contato, e `email_id` nulo — a tela diz "aviso por
 * e-mail pendente".
 */
export async function registrarInteracao(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const protocoloId = idDoForm(form, 'protocolo_id')
  if (!protocoloId) return { erro: 'Protocolo inválido. Recarregue a página.' }
  // Tipo da ação (db/030 D1): deriva "cliente informado" e "fornecedor cobrado". Com tipo
  // escolhido, o texto é opcional e vira a frase padrão do tipo.
  const tipoBruto = form.get('tipo_acao')
  const tipo: TipoAcao = ehTipoAcao(tipoBruto) ? tipoBruto : 'atualizacao_interna'
  const descricaoBruta = form.get('descricao')
  if (ehTipoAcao(tipoBruto) && (typeof descricaoBruta !== 'string' || descricaoBruta.trim() === '')) {
    form.set('descricao', textoDaAcao(tipo, ''))
  }
  const v = validarInteracao(form)
  if (!v.ok) return { erro: v.erro }

  if (v.dados.contato_id) {
    const { data: contato } = await supabase
      .from('contatos_clifor')
      .select('email')
      .eq('id', v.dados.contato_id)
      .maybeSingle()
    if (!contato?.email) return { erro: 'Este contato não tem e-mail. Escolha outro.' }
  }

  const { error } = await supabase.from('sac_interacoes').insert({
    protocolo_id: protocoloId,
    descricao: v.dados.descricao,
    visivel_cliente: v.dados.visivel_cliente,
    contato_id: v.dados.contato_id,
    autor_id: usuario.id,
    tipo_acao: tipo,
  })
  if (error) return { erro: traduzirErro('registrar interação', error) }

  revalidatePath('/sac')
  // Toast do Bubble: "Registrado com sucesso!" (ação bUDtz).
  return { ok: 'Interação registrada.' }
}

// ------------------------------------------------------------------------------ NPS

/** Nova campanha — WF bUDPr (ação bUDPx grava só o nome). Tipo NPS (003). */
export async function criarPesquisa(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()
  const nome = validarNomePesquisa(form.get('nome'))
  if (!nome.ok) return { erro: nome.erro }

  const { data, error } = await supabase
    .from('pesquisas')
    .insert({ nome: nome.dados, tipo_id: TIPO_PESQUISA_NPS, ativa: true, criado_por: usuario.id })
    .select('id')
    .single()
  if (error) return { erro: traduzirErro('criar pesquisa', error) }

  revalidatePath('/sac')
  return { ok: 'Pesquisa criada.', id: data.id as string }
}

/** Pesquisa legível pela SESSÃO e ativa — a trava antes de qualquer service_role. */
async function pesquisaVisivel(supabase: Supabase, id: string) {
  const { data } = await supabase.from('pesquisas').select('id, ativa').eq('id', id).maybeSingle()
  return data
}

/**
 * Adicionar convidado — WF bUDcQ (ação bUDcW cria PesquisaRespostas com cliente e pesquisa).
 * Aqui o convite nasce INERTE (token_hash de bytes que ninguém conhece, D7) até ser emitido.
 * Um convite vivo por (pesquisa, cliente): D9 deixa o unique de fora e manda a action checar.
 */
export async function adicionarConvidado(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const pesquisaId = idDoForm(form, 'pesquisa_id')
  const clienteId = idDoForm(form, 'cliente_id')
  const contatoBruto = form.get('contato_id')
  const contatoId = idDoForm(form, 'contato_id')
  if (!pesquisaId || !clienteId) return { erro: 'Escolha o cliente da lista.' }
  if (typeof contatoBruto === 'string' && contatoBruto !== '' && !contatoId) return { erro: 'Contato inválido.' }

  const pesquisa = await pesquisaVisivel(supabase, pesquisaId)
  if (!pesquisa) return { erro: 'Pesquisa não encontrada.' }
  if (!pesquisa.ativa) return { erro: 'Esta pesquisa está desativada.' }

  const { data: cliente } = await supabase
    .from('grupos_clifor')
    .select('tipo, ativo')
    .eq('id', clienteId)
    .maybeSingle()
  if (!cliente || cliente.tipo !== 'cliente' || !cliente.ativo) {
    return { erro: 'Só cliente ativo entra na pesquisa.' }
  }
  if (contatoId) {
    const { data: contato } = await supabase
      .from('contatos_clifor')
      .select('grupo_id')
      .eq('id', contatoId)
      .maybeSingle()
    if (!contato || contato.grupo_id !== clienteId) return { erro: 'Este contato não é do cliente escolhido.' }
  }

  const { count, error: eDup } = await supabase
    .from('pesquisa_convites')
    .select('id', { count: 'exact', head: true })
    .eq('pesquisa_id', pesquisaId)
    .eq('cliente_id', clienteId)
    .is('cancelado_em', null)
  if (eDup) return { erro: traduzirErro('conferir convite', eDup) }
  if ((count ?? 0) > 0) return { erro: 'Este cliente já está nesta pesquisa.' }

  const admin = clienteAdmin()
  const { error } = await admin.from('pesquisa_convites').insert({
    pesquisa_id: pesquisaId,
    cliente_id: clienteId,
    contato_id: contatoId,
    criado_por: usuario.id,
  })
  if (error) return { erro: traduzirErro('criar convite', error) }

  revalidatePath('/sac')
  // Toast do Bubble: "Adicionado a lista de respostas com sucesso" (ação bUEEe2).
  return { ok: 'Cliente adicionado à pesquisa.' }
}

/**
 * Emitir / reemitir o link do convite — no lugar do "Enviar Email" (WF bUDcb, ação bUDzn),
 * que mandava `formularionps?id=<_id>` sem token. Aqui `fn_pesquisa_emitir_token` gera 256
 * bits, grava só o sha256, renova o prazo, conta o envio (D8) e mata o token anterior
 * ([DÚVIDA 12] da 013). O e-mail NÃO é enviado nesta fatia: o link volta UMA vez para ser
 * copiado. Não é logado, gravado nem posto na URL.
 */
export async function emitirConvite(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const conviteId = idDoForm(form, 'convite_id')
  if (!conviteId) return { erro: 'Convite inválido. Recarregue a página.' }

  const { data: convite } = await supabase
    .from('pesquisa_convites')
    .select('usado_em, cancelado_em, pesquisa:pesquisas(ativa)')
    .eq('id', conviteId)
    .maybeSingle()
  const c = convite as unknown as {
    usado_em: string | null
    cancelado_em: string | null
    pesquisa: { ativa: boolean } | null
  } | null
  if (!c) return { erro: 'Convite não encontrado.' }
  if (c.usado_em) return { erro: 'O cliente já respondeu: não há link a emitir.' }
  if (c.cancelado_em) return { erro: 'Convite removido da pesquisa.' }
  if (!c.pesquisa?.ativa) return { erro: 'Esta pesquisa está desativada.' }

  const admin = clienteAdmin()
  const { data: token, error } = await admin.rpc('fn_pesquisa_emitir_token', { p_convite_id: conviteId })
  if (error) {
    if (error.code === 'P0002') return { erro: 'O convite mudou enquanto isso (respondido ou removido). Recarregue.' }
    return { erro: traduzirErro('emitir convite', error) }
  }
  const link = caminhoPesquisa(token)
  if (!link) return { erro: 'Não foi possível emitir o link agora.' }

  revalidatePath('/sac')
  return { ok: 'Link emitido. Copie agora: ele não será mostrado de novo.', link }
}

/**
 * Remover convidado — WF bUEER2 (ação bUEEX2 `DeleteThing`, sem confirmação, inclusive de
 * resposta já dada). Aqui: CANCELAMENTO lógico com motivo, bloqueado se respondido
 * (sac [DÚVIDA 8]; check `cancelado_nao_usado`). O link emitido deixa de valer.
 */
export async function cancelarConvite(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('sac')
  const supabase = await clienteServidor()

  const conviteId = idDoForm(form, 'convite_id')
  if (!conviteId) return { erro: 'Convite inválido. Recarregue a página.' }
  const motivo = validarMotivo(form.get('motivo'))
  if (!motivo.ok) return { erro: motivo.erro }

  const { data: convite } = await supabase
    .from('pesquisa_convites')
    .select('usado_em, cancelado_em')
    .eq('id', conviteId)
    .maybeSingle()
  if (!convite) return { erro: 'Convite não encontrado.' }
  if (convite.usado_em) return { erro: 'O cliente já respondeu: a resposta não se remove.' }
  if (convite.cancelado_em) return { erro: 'Este convite já foi removido.' }

  const admin = clienteAdmin()
  const { data, error } = await admin
    .from('pesquisa_convites')
    .update({
      cancelado_em: new Date().toISOString(),
      cancelado_por: usuario.id,
      cancelado_motivo: motivo.dados,
      alterado_por: usuario.id,
    })
    .eq('id', conviteId)
    .is('usado_em', null)
    .is('cancelado_em', null)
    .select('id')
  if (error) return { erro: traduzirErro('cancelar convite', error) }
  if (!data || data.length === 0) return { erro: 'O convite mudou enquanto isso. Recarregue.' }

  revalidatePath('/sac')
  return { ok: 'Cliente removido da pesquisa.' }
}
