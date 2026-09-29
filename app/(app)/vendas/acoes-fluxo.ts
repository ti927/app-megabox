'use server'

import { revalidatePath } from 'next/cache'

import { urlAssinada, enviarArquivo } from '@/lib/arquivos'
import { exigirAcesso, type UsuarioAtual } from '@/lib/autorizacao'
import { formatarReais } from '@/lib/dinheiro'
import { enfileirarEmail, escaparHtml, textoParaHtml } from '@/lib/email'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'
import { ehUuid, ETAPA, formatarDia, formatarQuantidade } from '@/lib/vendas'
import {
  assuntoCancelamentoEntrega,
  assuntoNotaBoleto,
  assuntoPedido,
  assuntoProposta,
  CONDICAO_PAGAMENTO_PADRAO,
  corpoCancelamentoEntrega,
  corpoNotaBoleto,
  corpoPadraoPedido,
  corpoPadraoProposta,
  historicoPedido,
  historicoProposta,
  MAX_BOLETOS,
  podeApagarEntrega,
  podeCancelarEntrega,
  podeEditarEntrega,
  podeGravarSaida,
  produtosDistintos,
  proximoNumeroProposta,
  remetente,
  statusDaSaida,
  validarCancelamentoEntrega,
  validarEdicaoEntrega,
  validarNovaEntrega,
  validarPedido,
  validarProposta,
  validarSaida,
} from '@/lib/vendas-fluxo'

import type { EstadoAcao } from './tipos'

/*
 * Escrita do fluxo DEPOIS da cotação: proposta → pedido → entregas (specs/paginas/vendas.md
 * §4.5–4.9; vendas-reusables.md §4.1–4.5).
 *
 * Mesmas regras de acoes.ts: cada action repete `exigirAcesso('vendas')`, valida a entrada e
 * grava com o cliente da SESSÃO — a RLS das 008/009 é a última palavra. NENHUMA action calcula
 * dinheiro: o retrato da proposta é do trigger fn_proposta_item_snapshot (008 D1), os
 * unitários da entrega são do fn_entrega_derivados (009 D5) e os totais são colunas geradas.
 *
 * E-mail: `enfileirarEmail` (lib/email) — a fila está em modo `registro` e não envia de
 * verdade. O DESTINATÁRIO sai do BANCO (contatos_clifor, relido pelo id), nunca de campo
 * livre; o único texto livre aceito é o de cópias (lerCopias), que vai em `cc`.
 *
 * service_role aparece em UM lugar desta página: o histórico com `email_id` (historicos da
 * 012). A policy de insert de `historicos` exige `origem = 'manual'` e `email_id is null` —
 * evento automático com e-mail é do servidor. Sempre DEPOIS de a action provar pela sessão
 * que a pessoa enxerga a cotação/pedido.
 */

type Supabase = Awaited<ReturnType<typeof clienteServidor>>
type Nome = { nome: string } | null

const PAGINA = '/vendas'

function traduzirErro(contexto: string, erro: { code?: string; message?: string }, repetido?: string): string {
  console.error(`vendas (fluxo): ${contexto}`, erro)
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para gravar aqui.'
    case '55000':
      return 'Registro travado: a proposta já foi enviada ao cliente.'
    case '23505':
      return repetido ?? 'Este registro já existe. Recarregue a página.'
    case '23503':
      return 'Um dos valores escolhidos não existe mais (ou está em uso). Recarregue a página.'
    case '23514':
      return 'Valor fora do permitido.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

function id(form: FormData, campo: string): string | null {
  const v = form.get(campo)
  return ehUuid(v) ? v.toLowerCase() : null
}

/** Contato ATIVO do grupo, com e-mail — o destinatário, lido do banco pelo id. */
async function contatoComEmail(
  supabase: Supabase,
  contatoId: string,
  grupos: string[],
): Promise<{ id: string; grupo_id: string; nome: string; email: string } | null> {
  const { data } = await supabase
    .from('contatos_clifor')
    .select('id, grupo_id, nome, email')
    .eq('id', contatoId)
    .in('grupo_id', grupos)
    .eq('ativo', true)
    .maybeSingle()
  const c = data as { id: string; grupo_id: string; nome: string; email: string | null } | null
  if (!c?.email?.trim()) return null
  return { ...c, email: c.email.trim() }
}

/** Nome e e-mail de resposta do usuário (remetente "[MegaBox] Nome", responder para = e-mail de contato). */
async function remetenteDe(supabase: Supabase, u: UsuarioAtual) {
  const { data } = await supabase.from('usuarios').select('email_contato').eq('id', u.id).maybeSingle()
  return { remetenteNome: remetente(u.nome), responderPara: (data as { email_contato: string | null } | null)?.email_contato ?? null }
}

/**
 * Histórico com o e-mail enfileirado (bTjCC, bTjBw). service_role: ver o cabeçalho. Falhar
 * aqui não desfaz o envio — o e-mail já está na fila; fica no log.
 */
async function registrarHistorico(h: {
  grupo: string
  contato: string | null
  autor: string
  vendedor: string | null
  tipo: 'proposta' | 'pedido'
  descricao: string
  emailId: string
}) {
  const { error } = await clienteAdmin().from('historicos').insert({
    grupo_clifor_id: h.grupo,
    contato_id: h.contato,
    autor_id: h.autor,
    vendedor_id: h.vendedor,
    tipo_evento: h.tipo,
    origem: 'workflow',
    descricao: h.descricao,
    email_id: h.emailId,
    criado_por: h.autor,
  })
  if (error) console.error('vendas (fluxo): histórico do e-mail', error)
}

/** Linha de item para o corpo do e-mail: valores SÓ formatados, do snapshot do banco. */
function linhaItem(i: { qtd: string; valor_venda_unit: string; valor_frete: string; produto: string }): string {
  const frete = /^0+(\.0+)?$/.test(i.valor_frete) ? '' : ` + frete ${formatarReais(i.valor_frete)}`
  return `• ${formatarQuantidade(i.qtd)} × ${i.produto} — ${formatarReais(i.valor_venda_unit)} por unidade${frete}`
}

function html(corpo: string, anexo: string[]): string {
  const extra = anexo.length ? `<br>\n<br>\n${anexo.map((l) => escaparHtml(l)).join('<br>\n')}` : ''
  return textoParaHtml(corpo).html + extra
}

// ==================================================================== PROPOSTA

type PropostaLida = {
  id: string
  numero: number
  enviada: boolean
  cotacao_id: string
  enviar_para_contato_id: string | null
  corpo_email: string | null
  emails_copia: string | null
  cotacao: {
    numero: number
    cliente_id: string
    vendedor_id: string
    etapa_id: number
    arquivado: boolean
    cliente: Nome
  } | null
  itens: {
    qtd: string
    valor_venda_unit: string
    valor_frete: string
    orcamento: { produto: Nome } | null
  }[]
}

const SELECT_PROPOSTA =
  'id, numero, enviada, cotacao_id, enviar_para_contato_id, corpo_email, emails_copia, ' +
  'cotacao:cotacoes(numero, cliente_id, vendedor_id, etapa_id, arquivado, cliente:grupos_clifor(nome)), ' +
  'itens:proposta_itens(qtd::text, valor_venda_unit::text, valor_frete::text, orcamento:orcamentos_fornecedor(produto:produtos(nome)))'

async function lerProposta(supabase: Supabase, propostaId: string): Promise<PropostaLida | null> {
  const { data, error } = await supabase.from('propostas').select(SELECT_PROPOSTA).eq('id', propostaId).maybeSingle()
  if (error) console.error('vendas (fluxo): ler proposta', error)
  return (data as unknown as PropostaLida | null) ?? null
}

/**
 * Enfileira o e-mail da proposta ao contato do cliente (bTnvu0) e devolve o id da fila.
 * Sem PDF: o gerador de PDF ainda não existe no app novo — os itens vão no corpo.
 */
async function enfileirarProposta(supabase: Supabase, u: UsuarioAtual, p: PropostaLida, para: { email: string; nome: string }) {
  const cot = p.cotacao!
  const nomes = p.itens.map((i) => i.orcamento?.produto?.nome ?? '—')
  const corpo = p.corpo_email || corpoPadraoProposta({ contato: para.nome, cotacao: cot.numero, proposta: p.numero, vendedor: u.nome })
  return enfileirarEmail({
    criadoPor: u.id,
    para: para.email,
    cc: p.emails_copia,
    evento: 'proposta',
    ...(await remetenteDe(supabase, u)),
    conteudo: {
      assunto: assuntoProposta({ cotacao: cot.numero, proposta: p.numero, produtos: produtosDistintos(nomes), cliente: cot.cliente?.nome ?? '' }),
      html: html(corpo, [
        'Itens da proposta:',
        ...p.itens.map((i, k) => linhaItem({ ...i, produto: nomes[k]! })),
      ]),
    },
    vinculo: { propostaId: p.id },
  })
}

/**
 * "+ Proposta" (WF bTPoC): bThFu copia os orçamentos VENCEDORES de todos os produtos e
 * bThFW cria a proposta com eles. Aqui a cópia é o snapshot de proposta_itens (trigger, 008
 * D1): a action manda só o id do orçamento.
 *
 * Diferença registrada: no Bubble a proposta nova fica fora de `Cotacao.QuaisPropostas` até
 * "Gravar" (e "Cancela" apaga, bTPoa). Aqui ela nasce gravada, NÃO enviada; "Descartar"
 * apaga (descartarProposta).
 */
export async function criarProposta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const cotacaoId = id(form, 'cotacao_id')
  if (!cotacaoId) return { erro: 'Cotação inválida. Recarregue a página.' }
  const supabase = await clienteServidor()

  const [cot, vencedores, existentes] = await Promise.all([
    supabase.from('cotacoes').select('id, etapa_id, arquivado').eq('id', cotacaoId).maybeSingle(),
    supabase.from('orcamentos_fornecedor').select('id').eq('cotacao_id', cotacaoId).eq('vencedor', true),
    supabase.from('propostas').select('numero').eq('cotacao_id', cotacaoId),
  ])
  const c = cot.data as { etapa_id: number; arquivado: boolean } | null
  if (!c) return { erro: 'Esta cotação não existe mais ou não é sua. Recarregue a página.' }
  if (c.arquivado && !usuario.ehDiretor) return { erro: 'Cotação arquivada: só o Diretor altera. Desarquive antes.' }
  if (c.etapa_id !== ETAPA.COTACAO) return { erro: 'Esta cotação já virou pedido: a proposta nova sai pelo pedido.' }
  const orcs = (vencedores.data ?? []) as { id: string }[]
  // pode_propor (015): ≥ 1 item e ≥ 1 vencedor.
  if (orcs.length === 0) return { erro: 'Marque o vencedor (troféu) de ao menos um produto antes de propor.' }

  const numero = proximoNumeroProposta(((existentes.data ?? []) as { numero: number }[]).map((p) => p.numero))
  const { data: nova, error } = await supabase
    .from('propostas')
    .insert({
      cotacao_id: cotacaoId,
      numero,
      vendedor_id: usuario.id,
      condicao_pagamento: CONDICAO_PAGAMENTO_PADRAO,
      criado_por: usuario.id,
    })
    .select('id')
    .single()
  if (error) return { erro: traduzirErro('criar proposta', error, 'Outra proposta com este número acabou de ser criada. Tente de novo.') }

  const { error: eItens } = await supabase
    .from('proposta_itens')
    .insert(orcs.map((o) => ({ proposta_id: nova.id, orcamento_fornecedor_id: o.id, criado_por: usuario.id })))
  if (eItens) {
    // Sem itens a proposta não serve: desfaz (é a única escrita anterior, e é nossa).
    await supabase.from('propostas').delete().eq('id', nova.id)
    return { erro: traduzirErro('itens da proposta', eItens) }
  }

  revalidatePath(PAGINA)
  return { ok: `Proposta ${numero} criada com ${orcs.length} ${orcs.length === 1 ? 'item' : 'itens'}. Revise e envie.`, alvo: nova.id as string }
}

/**
 * Gravar/Salvar (bTmXN, bTPhF) e "… e Enviar" (bTPDr0, bTPhL). Proposta ENVIADA não se edita
 * (lápis só se não enviada, §2.8; 008 D2). Enviar = `enviada = true` + e-mail ao contato do
 * cliente + histórico "Proposta número X/Y enviada…" (bTjCC). O e-mail sai SÓ no "… e
 * Enviar" (vendas [DÚVIDA 1], recomendação da 008: o Bubble mandava também no Gravar).
 */
export async function salvarProposta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const enviar = form.get('acao') === 'enviar'
  const v = validarProposta(form, enviar)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados
  const supabase = await clienteServidor()

  const p = await lerProposta(supabase, d.proposta_id)
  if (!p?.cotacao) return { erro: 'Esta proposta não existe mais. Recarregue a página.' }
  if (p.enviada) return { erro: 'Proposta já enviada: é o documento que o cliente recebeu e não se edita. Crie outra.' }
  if (p.cotacao.arquivado && !usuario.ehDiretor) return { erro: 'Cotação arquivada: só o Diretor altera.' }

  let contato: Awaited<ReturnType<typeof contatoComEmail>> = null
  if (d.enviar_para_contato_id) {
    contato = await contatoComEmail(supabase, d.enviar_para_contato_id, [p.cotacao.cliente_id])
    if (!contato) return { erro: 'O contato escolhido não é deste cliente, está inativo ou não tem e-mail.' }
  }
  if (d.faturar_para_endereco_id) {
    const { data: end } = await supabase
      .from('enderecos_clifor')
      .select('id')
      .eq('id', d.faturar_para_endereco_id)
      .eq('grupo_id', p.cotacao.cliente_id)
      .eq('ativo', true)
      .maybeSingle()
    if (!end) return { erro: 'O CNPJ de faturamento não é deste cliente, ou está inativo.' }
  }

  const { data: gravou, error } = await supabase
    .from('propostas')
    .update({
      numero: d.numero,
      enviar_para_contato_id: d.enviar_para_contato_id,
      faturar_para_endereco_id: d.faturar_para_endereco_id,
      condicao_pagamento: d.condicao_pagamento,
      data_prev_entrega: d.data_prev_entrega,
      info_adicional: d.info_adicional,
      emails_copia: d.emails_copia,
      corpo_email: d.corpo_email,
      ...(enviar ? { enviada: true, enviada_em: new Date().toISOString() } : {}),
    })
    .eq('id', d.proposta_id)
    .eq('enviada', false) // clique duplo: o segundo não acha linha
    .select('id')
  if (error) return { erro: traduzirErro('gravar proposta', error, 'Já existe proposta com este número nesta cotação.') }
  if (!gravou || gravou.length === 0) return { erro: 'Não foi possível gravar esta proposta (já enviada ou sem permissão).' }

  if (enviar && contato) {
    try {
      const email = await enfileirarProposta(supabase, usuario, { ...p, ...d, numero: d.numero }, contato)
      await registrarHistorico({
        grupo: p.cotacao.cliente_id,
        contato: contato.id,
        autor: usuario.id,
        vendedor: p.cotacao.vendedor_id,
        tipo: 'proposta',
        descricao: historicoProposta(p.cotacao.numero, d.numero, contato.email),
        emailId: email.id,
      })
    } catch (e) {
      console.error('vendas (fluxo): enfileirar proposta', e)
      // Sem e-mail na fila, a proposta não foi enviada: volta para "não enviada".
      await supabase.from('propostas').update({ enviada: false, enviada_em: null }).eq('id', d.proposta_id)
      revalidatePath(PAGINA)
      return { erro: 'A proposta foi gravada, mas o e-mail não entrou na fila. Tente enviar de novo.' }
    }
  }

  revalidatePath(PAGINA)
  return { ok: enviar ? `Proposta enviada para ${contato!.email}.` : 'Proposta gravada.', alvo: d.proposta_id }
}

/** "Cancela" da proposta nova (bTPoa: apaga a proposta). Só a NÃO enviada. */
export async function descartarProposta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('vendas')
  const propostaId = id(form, 'proposta_id')
  if (!propostaId) return { erro: 'Proposta inválida. Recarregue a página.' }
  const supabase = await clienteServidor()
  const { data, error } = await supabase.from('propostas').delete().eq('id', propostaId).eq('enviada', false).select('id')
  if (error) return { erro: traduzirErro('descartar proposta', error) }
  if (!data || data.length === 0) return { erro: 'Só se descarta proposta não enviada.' }
  revalidatePath(PAGINA)
  return { ok: 'Proposta descartada.' }
}

/**
 * Reenviar (bTiOx0 → bTaLf/bTnxZ0): mesma mensagem, ao contato gravado na proposta. Sem
 * histórico (o Bubble não cria no reenvio).
 */
export async function reenviarProposta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const propostaId = id(form, 'proposta_id')
  if (!propostaId) return { erro: 'Proposta inválida. Recarregue a página.' }
  const supabase = await clienteServidor()
  const p = await lerProposta(supabase, propostaId)
  if (!p?.cotacao) return { erro: 'Esta proposta não existe mais. Recarregue a página.' }
  if (!p.enviada) return { erro: 'Esta proposta ainda não foi enviada: use "Gravar e Enviar".' }
  if (!p.enviar_para_contato_id) return { erro: 'A proposta não tem contato do cliente gravado.' }
  // A RLS de propostas não diz "posso ESCREVER"; o reenvio fala em nome do vendedor, então
  // exige a mesma escrita: um update sem mudança que a RLS de escrita filtra.
  const { data: escreve } = await supabase.from('propostas').update({ enviada: true }).eq('id', propostaId).select('id')
  if (!escreve || escreve.length === 0) return { erro: 'Você não tem permissão para reenviar esta proposta.' }
  const contato = await contatoComEmail(supabase, p.enviar_para_contato_id, [p.cotacao.cliente_id])
  if (!contato) return { erro: 'O contato da proposta está inativo ou sem e-mail. Atualize o cadastro.' }
  try {
    await enfileirarProposta(supabase, usuario, p, contato)
  } catch (e) {
    console.error('vendas (fluxo): reenviar proposta', e)
    return { erro: 'O e-mail não entrou na fila. Tente de novo em instantes.' }
  }
  return { ok: `Proposta re-enviada para ${contato.email}.` }
}

// ====================================================================== PEDIDO

/**
 * "Transformar em pedido" (WF bTbFt; só proposta selecionada e ENVIADA): bTbNB cria o pedido
 * (número = nº da cotação, pelo trigger 008 D4; vendedor = quem converte; informações
 * adicionais da proposta; primeiro fornecedor = origem do 1º item) e bTbZt passa a cotação
 * para a etapa "Pedir". Os itens do pedido SÃO os proposta_itens (008) — nada é copiado.
 *
 * Guarda nova: um pedido vivo por proposta. O Bubble deixava clicar de novo e criar outro
 * com o mesmo número (vendas [DÚVIDA 19]).
 */
export async function criarPedido(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const propostaId = id(form, 'proposta_id')
  if (!propostaId) return { erro: 'Proposta inválida. Recarregue a página.' }
  const supabase = await clienteServidor()

  const [prop, itens, jaTem] = await Promise.all([
    supabase
      .from('propostas')
      .select('id, enviada, cotacao_id, info_adicional, enviar_para_contato_id, cotacao:cotacoes(etapa_id, arquivado)')
      .eq('id', propostaId)
      .maybeSingle(),
    supabase
      .from('proposta_itens')
      .select('orcamento:orcamentos_fornecedor(endereco_origem_id)')
      .eq('proposta_id', propostaId)
      .order('criado_em')
      .order('id')
      .limit(1),
    supabase.from('pedidos').select('id').eq('proposta_id', propostaId).neq('etapa_id', ETAPA.CANCELADO).limit(1),
  ])
  const p = prop.data as unknown as {
    enviada: boolean
    cotacao_id: string
    info_adicional: string | null
    enviar_para_contato_id: string | null
    cotacao: { etapa_id: number; arquivado: boolean } | null
  } | null
  if (!p?.cotacao) return { erro: 'Esta proposta não existe mais. Recarregue a página.' }
  if (!p.enviada) return { erro: 'Só proposta ENVIADA vira pedido.' }
  if (p.cotacao.arquivado) return { erro: 'Cotação arquivada: desarquive antes de gerar o pedido.' }
  if ((jaTem.data ?? []).length > 0) return { erro: 'Esta proposta já tem pedido. Abra-o na aba Pedidos.' }
  const primeiro = (itens.data?.[0] as unknown as { orcamento: { endereco_origem_id: string } | null } | undefined)?.orcamento

  const { data: novo, error } = await supabase
    .from('pedidos')
    .insert({
      proposta_id: propostaId,
      cotacao_id: p.cotacao_id, // o trigger rederiva da proposta (008 D4)
      vendedor_id: usuario.id,
      info_adicional: p.info_adicional,
      contato_cliente_id: p.enviar_para_contato_id,
      primeiro_fornecedor_endereco_id: primeiro?.endereco_origem_id ?? null,
      criado_por: usuario.id,
    })
    .select('id, numero')
    .single()
  if (error) return { erro: traduzirErro('criar pedido', error) }

  // bTbZt: a cotação sai da coluna Cotação (etapa "Pedir").
  const { error: eEtapa } = await supabase
    .from('cotacoes')
    .update({ etapa_id: ETAPA.PEDIR })
    .eq('id', p.cotacao_id)
    .eq('etapa_id', ETAPA.COTACAO)
  if (eEtapa) console.error('vendas (fluxo): etapa da cotação', eEtapa)

  revalidatePath(PAGINA)
  return { ok: `Pedido nº ${novo.numero} criado. Lance as entregas e formalize.`, alvo: novo.id as string }
}

/**
 * "Cancelar pedido novo" (bTbrC0): apaga o pedido e devolve a cotação para "Cotação". Só
 * pedido NÃO formalizado e SEM entregas (no Bubble as entregas lançadas ficavam órfãs).
 */
export async function descartarPedido(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('vendas')
  const pedidoId = id(form, 'pedido_id')
  if (!pedidoId) return { erro: 'Pedido inválido. Recarregue a página.' }
  const supabase = await clienteServidor()
  const [ped, ents] = await Promise.all([
    supabase.from('pedidos').select('id, cotacao_id, formalizado').eq('id', pedidoId).maybeSingle(),
    supabase.from('entregas').select('id').eq('pedido_id', pedidoId).limit(1),
  ])
  const p = ped.data as { cotacao_id: string; formalizado: boolean } | null
  if (!p) return { erro: 'Este pedido não existe mais. Recarregue a página.' }
  if (p.formalizado) return { erro: 'Pedido já formalizado com o cliente: não se descarta.' }
  if ((ents.data ?? []).length > 0) return { erro: 'Apague as entregas deste pedido antes de descartá-lo.' }

  const { data, error } = await supabase.from('pedidos').delete().eq('id', pedidoId).eq('formalizado', false).select('id')
  if (error) return { erro: traduzirErro('descartar pedido', error) }
  if (!data || data.length === 0) return { erro: 'Não foi possível descartar este pedido.' }

  const { data: outros } = await supabase.from('pedidos').select('id').eq('cotacao_id', p.cotacao_id).limit(1)
  if (!outros || outros.length === 0) {
    await supabase.from('cotacoes').update({ etapa_id: ETAPA.COTACAO }).eq('id', p.cotacao_id).eq('etapa_id', ETAPA.PEDIR)
  }
  revalidatePath(PAGINA)
  return { ok: 'Pedido descartado. A cotação voltou para a coluna Cotação.' }
}

type PedidoLido = {
  id: string
  numero: string
  etapa_id: number
  formalizado: boolean
  finalizado: boolean
  cliente_id: string
  vendedor_id: string
  proposta_id: string | null
  cliente: Nome
  proposta: {
    numero: number
    itens: {
      qtd: string
      valor_venda_unit: string
      valor_comissao_unit: string
      valor_frete: string
      orcamento_fornecedor_id: string
      orcamento: { fornecedor_id: string; produto: Nome; fornecedor: Nome } | null
    }[]
  } | null
}

async function lerPedido(supabase: Supabase, pedidoId: string): Promise<PedidoLido | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select(
      'id, numero, etapa_id, formalizado, finalizado, cliente_id, vendedor_id, proposta_id, cliente:grupos_clifor(nome), ' +
        'proposta:propostas(numero, itens:proposta_itens(qtd::text, valor_venda_unit::text, valor_comissao_unit::text, ' +
        'valor_frete::text, orcamento_fornecedor_id, orcamento:orcamentos_fornecedor(fornecedor_id, produto:produtos(nome), ' +
        'fornecedor:grupos_clifor(nome))))',
    )
    .eq('id', pedidoId)
    .maybeSingle()
  if (error) console.error('vendas (fluxo): ler pedido', error)
  return (data as unknown as PedidoLido | null) ?? null
}

/**
 * Gravar/Salvar o pedido (bTblt/bTbmF) e formalizando (bTcqO/bTbnL).
 *
 * Formalizar = `formalizado = true` + entregas "Pedir" → "Pedido" (bTcqZ/bTcqJ) + e-mail ao
 * FORNECEDOR (bTnxT0) e ao CLIENTE 15 s depois (bTnxU0), com as cópias de config_copia_email
 * do evento `pedido` (a lib soma) + histórico "Pedido número N enviado…" (bTjBw).
 *
 * Decisões ([DÚVIDA 4], recomendação da 008): a forma de pagamento é gravada nas duas
 * variantes; formalizar NÃO rebaixa entrega que já está Em Entrega/Financeiro/Cancelada (o
 * Bubble punha TODAS em "Pedido" a cada reenvio). Formalizar exige toda entrega com data
 * prevista ("Existem entregas sem data prevista", §2.9) — a entrega vai ao fornecedor.
 */
export async function salvarPedido(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const formalizar = form.get('formalizar') === 'on'
  const v = validarPedido(form, formalizar)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados
  const supabase = await clienteServidor()

  const p = await lerPedido(supabase, d.pedido_id)
  if (!p) return { erro: 'Este pedido não existe mais. Recarregue a página.' }
  if (p.etapa_id === ETAPA.CANCELADO) return { erro: 'Pedido cancelado não se altera.' }
  if (p.finalizado) return { erro: 'Pedido finalizado não se altera.' }
  const itens = p.proposta?.itens ?? []
  const fornecedores = [...new Set(itens.map((i) => i.orcamento?.fornecedor_id).filter((x): x is string => !!x))]

  const [cli, forn, ents] = await Promise.all([
    d.contato_cliente_id ? contatoComEmail(supabase, d.contato_cliente_id, [p.cliente_id]) : Promise.resolve(null),
    d.contato_fornecedor_id && fornecedores.length
      ? contatoComEmail(supabase, d.contato_fornecedor_id, fornecedores)
      : Promise.resolve(null),
    supabase
      .from('entregas')
      .select('orcamento_fornecedor_id, qtd::text, dt_prev_entrega, status_id')
      .eq('pedido_id', d.pedido_id)
      .order('dt_prev_entrega'),
  ])
  if (d.contato_cliente_id && !cli) return { erro: 'O e-mail do cliente escolhido não é deste cliente, está inativo ou sem e-mail.' }
  if (d.contato_fornecedor_id && !forn) return { erro: 'O e-mail do fornecedor escolhido não é de um fornecedor deste pedido.' }
  const entregas = (ents.data ?? []) as { orcamento_fornecedor_id: string; qtd: string; dt_prev_entrega: string | null; status_id: number }[]
  if (formalizar && entregas.some((e) => e.status_id !== ETAPA.CANCELADO && !e.dt_prev_entrega)) {
    return { erro: 'Existem entregas sem data prevista. Informe as datas antes de formalizar.' }
  }

  const { data: gravou, error } = await supabase
    .from('pedidos')
    .update({
      contato_cliente_id: d.contato_cliente_id,
      emails_copia_cliente: d.emails_copia_cliente,
      corpo_email_cliente: d.corpo_email_cliente,
      contato_fornecedor_id: d.contato_fornecedor_id,
      emails_copia_fornecedor: d.emails_copia_fornecedor,
      corpo_email_fornecedor: d.corpo_email_fornecedor,
      ordem_compra_numero: d.ordem_compra_numero,
      info_adicional: d.info_adicional,
      forma_pagamento_id: d.forma_pagamento_id,
      ...(formalizar && !p.formalizado ? { formalizado: true, formalizado_em: new Date().toISOString() } : {}),
    })
    .eq('id', d.pedido_id)
    .select('id')
  if (error) return { erro: traduzirErro('gravar pedido', error) }
  if (!gravou || gravou.length === 0) return { erro: 'Você não tem permissão para alterar este pedido.' }

  // Prazos (Pedido.PrazoRecebComissoes): substitui a lista. Ligação pura, pk composta.
  const { error: eDel } = await supabase.from('pedido_prazos').delete().eq('pedido_id', d.pedido_id)
  if (eDel) return { erro: traduzirErro('prazos do pedido', eDel) }
  if (d.prazos.length) {
    const { error: eIns } = await supabase
      .from('pedido_prazos')
      .insert(d.prazos.map((prazo) => ({ pedido_id: d.pedido_id, prazo_id: prazo, criado_por: usuario.id })))
    if (eIns) return { erro: traduzirErro('prazos do pedido', eIns) }
  }

  if (!formalizar) {
    revalidatePath(PAGINA)
    return { ok: 'Pedido gravado.' }
  }

  const { error: eStatus } = await supabase
    .from('entregas')
    .update({ status_id: ETAPA.PEDIDO })
    .eq('pedido_id', d.pedido_id)
    .eq('status_id', ETAPA.PEDIR)
  if (eStatus) console.error('vendas (fluxo): entregas para Pedido', eStatus)

  // --- e-mails (bTiKL0): fornecedor, e o cliente 15 s depois
  const num = p.proposta ? `${p.numero}/${p.proposta.numero}` : p.numero
  const nomes = itens.map((i) => i.orcamento?.produto?.nome ?? '—')
  const produtos = produtosDistintos(nomes)
  const entregasTxt = (orc: string) =>
    entregas
      .filter((e) => e.orcamento_fornecedor_id === orc && e.status_id !== ETAPA.CANCELADO)
      .map((e) => `    entrega ${formatarDia(e.dt_prev_entrega)}: ${formatarQuantidade(e.qtd)}`)
  const linhas = (comComissao: boolean) =>
    itens.flatMap((i, k) => [
      linhaItem({ ...i, produto: nomes[k]! }) +
        (comComissao ? ` — comissão ${formatarReais(i.valor_comissao_unit)} por unidade` : ''),
      ...entregasTxt(i.orcamento_fornecedor_id),
    ])
  const rem = await remetenteDe(supabase, usuario)
  const avisos: string[] = []

  try {
    if (forn) {
      const nomeFornecedor = itens.find((i) => i.orcamento?.fornecedor_id === forn.grupo_id)?.orcamento?.fornecedor?.nome ?? ''
      await enfileirarEmail({
        criadoPor: usuario.id,
        para: forn.email,
        cc: d.emails_copia_fornecedor,
        evento: 'pedido',
        ...rem,
        conteudo: {
          assunto: assuntoPedido({ numero: p.numero, proposta: p.proposta?.numero ?? null, produtos, para: 'Fornecedor', nome: nomeFornecedor }),
          html: html(
            d.corpo_email_fornecedor || corpoPadraoPedido({ contato: forn.nome, numero: num, para: 'Fornecedor', vendedor: usuario.nome }),
            ['Itens do pedido:', ...linhas(true)],
          ),
        },
        vinculo: { pedidoId: p.id },
      })
    } else {
      avisos.push('sem e-mail do fornecedor, só o cliente foi avisado')
    }
    const emailCliente = await enfileirarEmail({
      criadoPor: usuario.id,
      para: cli!.email,
      cc: d.emails_copia_cliente,
      evento: 'pedido',
      ...rem,
      conteudo: {
        assunto: assuntoPedido({ numero: p.numero, proposta: p.proposta?.numero ?? null, produtos, para: 'Cliente', nome: p.cliente?.nome ?? '' }),
        html: html(
          d.corpo_email_cliente || corpoPadraoPedido({ contato: cli!.nome, numero: num, para: 'Cliente', vendedor: usuario.nome }),
          ['Itens do pedido:', ...linhas(false)],
        ),
      },
      vinculo: { pedidoId: p.id },
      agendadoPara: new Date(Date.now() + 15_000),
    })
    await registrarHistorico({
      grupo: p.cliente_id,
      contato: cli!.id,
      autor: usuario.id,
      vendedor: p.vendedor_id,
      tipo: 'pedido',
      descricao: historicoPedido(num, cli!.email),
      emailId: emailCliente.id,
    })
  } catch (e) {
    console.error('vendas (fluxo): enfileirar pedido', e)
    revalidatePath(PAGINA)
    return { erro: 'Pedido gravado e formalizado, mas o e-mail não entrou na fila. Salve de novo com "Reenviar" marcado.' }
  }

  revalidatePath(PAGINA)
  return { ok: `Pedido formalizado. E-mail na fila para ${cli!.email}${avisos.length ? ` (${avisos.join('; ')})` : ''}.` }
}

// ==================================================================== ENTREGAS

type EntregaLida = {
  id: string
  pedido_id: string
  status_id: number
  saiu_entrega: boolean
  fornecedor_id: string
  numero_entrega: string | null
  qtd: string
  nota_boleto_enviada: boolean
  arquivos: { id: string; tipo: string; nome_arquivo: string; path: string }[]
  orcamento: { produto: Nome } | null
  fornecedor: Nome
  pedido: {
    numero: string
    cliente_id: string
    contato_cliente_id: string | null
    contato_fornecedor_id: string | null
    cliente: Nome
  } | null
}

async function lerEntrega(supabase: Supabase, entregaId: string): Promise<EntregaLida | null> {
  const { data, error } = await supabase
    .from('entregas')
    .select(
      'id, pedido_id, status_id, saiu_entrega, fornecedor_id, numero_entrega, qtd::text, nota_boleto_enviada, ' +
        'arquivos:entrega_arquivos(id, tipo, nome_arquivo, path), orcamento:orcamentos_fornecedor(produto:produtos(nome)), ' +
        'fornecedor:grupos_clifor!fornecedor_id(nome), ' +
        'pedido:pedidos(numero, cliente_id, contato_cliente_id, contato_fornecedor_id, cliente:grupos_clifor(nome))',
    )
    .eq('id', entregaId)
    .maybeSingle()
  if (error) console.error('vendas (fluxo): ler entrega', error)
  return (data as unknown as EntregaLida | null) ?? null
}

/**
 * "+ entrega" no item (bTbOt → bTbOz). O trigger fn_entrega_derivados (009) deriva cotação,
 * proposta, cliente, fornecedor, número, data do pedido, vendedor (= o da COTAÇÃO), a data
 * prevista (= a da proposta, se vazia), o SNAPSHOT dos unitários (bTbPH) e o substituto de
 * férias (bTyAt). A action só confere que o orçamento é item deste pedido.
 */
export async function adicionarEntrega(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const v = validarNovaEntrega(form)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados
  const supabase = await clienteServidor()
  const { data: ped } = await supabase
    .from('pedidos')
    .select('id, etapa_id, finalizado, proposta_id')
    .eq('id', d.pedido_id)
    .maybeSingle()
  const p = ped as { etapa_id: number; finalizado: boolean; proposta_id: string | null } | null
  if (!p) return { erro: 'Este pedido não existe mais. Recarregue a página.' }
  if (p.etapa_id === ETAPA.CANCELADO || p.finalizado) return { erro: 'Pedido cancelado ou finalizado não recebe entrega.' }
  if (!p.proposta_id) return { erro: 'Pedido sem proposta: os itens não são conhecidos.' }
  const { data: item } = await supabase
    .from('proposta_itens')
    .select('id')
    .eq('proposta_id', p.proposta_id)
    .eq('orcamento_fornecedor_id', d.orcamento_fornecedor_id)
    .maybeSingle()
  if (!item) return { erro: 'Este produto não é item do pedido.' }

  const { error } = await supabase.from('entregas').insert({
    pedido_id: d.pedido_id,
    orcamento_fornecedor_id: d.orcamento_fornecedor_id,
    qtd: d.qtd,
    dt_prev_entrega: d.dt_prev_entrega,
    criado_por: usuario.id,
  })
  if (error) return { erro: traduzirErro('adicionar entrega', error) }
  revalidatePath(PAGINA)
  return { ok: 'Entrega lançada.' }
}

/**
 * Editar data prevista (bUEti) e quantidade (bTbPN) de entrega que não saiu. bTbPN agenda
 * CalcularValoresEntregas: aqui os unitários vão NULOS e o trigger refaz o snapshot do
 * orçamento (009 D5, "recalcular = gravar nulo"). O substituto de férias é recalculado pelo
 * trigger quando a data muda (bUEtu, 009 D7).
 */
export async function editarEntrega(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('vendas')
  const v = validarEdicaoEntrega(form)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados
  const supabase = await clienteServidor()
  const e = await lerEntrega(supabase, d.entrega_id)
  if (!e) return { erro: 'Esta entrega não existe mais. Recarregue a página.' }
  if (!podeEditarEntrega(e)) return { erro: 'Entrega que já saiu (ou cancelada/confirmada) não muda data nem quantidade.' }
  const { data, error } = await supabase
    .from('entregas')
    .update({
      qtd: d.qtd,
      dt_prev_entrega: d.dt_prev_entrega,
      valor_venda_bruto_unit: null,
      valor_venda_liquido_unit: null,
      valor_comissao_unit: null,
    })
    .eq('id', d.entrega_id)
    .eq('saiu_entrega', false)
    .select('id')
  if (error) return { erro: traduzirErro('editar entrega', error) }
  if (!data || data.length === 0) return { erro: 'Não foi possível alterar esta entrega.' }
  revalidatePath(PAGINA)
  return { ok: 'Entrega atualizada e valores recalculados.' }
}

/** Apagar entrega que não saiu (bTbxI → bTbxO). Com arquivo anexado, cancele em vez de apagar. */
export async function apagarEntrega(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('vendas')
  const entregaId = id(form, 'entrega_id')
  if (!entregaId) return { erro: 'Entrega inválida. Recarregue a página.' }
  const supabase = await clienteServidor()
  const e = await lerEntrega(supabase, entregaId)
  if (!e) return { erro: 'Esta entrega não existe mais. Recarregue a página.' }
  if (!podeApagarEntrega(e)) return { erro: 'Só se apaga entrega que ainda não saiu. Use "Cancelar".' }
  // Objeto do Storage não tem policy de DELETE (018): apagar a linha deixaria o arquivo órfão.
  if (e.arquivos.length > 0) return { erro: 'Esta entrega tem arquivo anexado: cancele-a em vez de apagar.' }
  const { data, error } = await supabase.from('entregas').delete().eq('id', entregaId).eq('saiu_entrega', false).select('id')
  if (error) return { erro: traduzirErro('apagar entrega', error) }
  if (!data || data.length === 0) return { erro: 'Não foi possível apagar esta entrega.' }
  revalidatePath(PAGINA)
  return { ok: 'Entrega apagada.' }
}

/** Arquivos que vieram no formulário (input vazio manda um File de tamanho 0). */
function arquivos(form: FormData, campo: string): File[] {
  return form.getAll(campo).filter((f): f is File => f instanceof File && f.size > 0)
}

/**
 * pop.AnexaNf fora do Financeiro (bTcRH com o interruptor ligado, bTcZR desligado):
 * NF (número, data, arquivo), "não emite NF", boletos (até 4), "saiu para entrega" → Em
 * Entrega / Pedido. O substituto de férias é do trigger (009 D7), sem o passo bTyBZ.
 *
 * Arquivos: `enviarArquivo` (lib/arquivos) para o bucket privado `entregas` + linha em
 * entrega_arquivos — no Bubble eram URL pública de CDN (vendas-reusables §7.1).
 *
 * E-mail NF + boleto ao cliente (bTiFG0): condição EXPLÍCITA "marcou enviar" — o Bubble tinha
 * a precedência quebrada e o 1º envio nunca saía ([DÚVIDA 10.7]). Destinatário = contato do
 * cliente gravado no PEDIDO (`Pedido.EmailCliente`), anexos = a NF e os boletos da entrega.
 * NF repetida no mesmo fornecedor: só avisa, como o Bubble (bTeZN) — a exceção por item está
 * em [DÚVIDA 10.10].
 */
export async function gravarSaidaEntrega(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const entregaId = id(form, 'entrega_id')
  if (!entregaId) return { erro: 'Entrega inválida. Recarregue a página.' }
  const supabase = await clienteServidor()
  const e = await lerEntrega(supabase, entregaId)
  if (!e?.pedido) return { erro: 'Esta entrega não existe mais. Recarregue a página.' }
  if (!podeGravarSaida(e.status_id)) return { erro: 'Entrega em Financeiro, concluída ou cancelada: a NF se trata na tela Financeiro.' }

  const novaNf = arquivos(form, 'arquivo_nf')[0] ?? null
  const novosBoletos = arquivos(form, 'boletos')
  const temNf = !!novaNf || e.arquivos.some((a) => a.tipo === 'nf_fornecedor')
  const v = validarSaida(form, temNf)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados
  const boletosAtuais = e.arquivos.filter((a) => a.tipo === 'boleto').length
  if (boletosAtuais + novosBoletos.length > MAX_BOLETOS) {
    return { erro: `No máximo ${MAX_BOLETOS} boletos por entrega (já há ${boletosAtuais}).` }
  }

  // Grava a entrega antes dos arquivos: se a RLS recusar, nada sobe para o Storage.
  const { data: gravou, error } = await supabase
    .from('entregas')
    .update({
      nf_fornecedor_numero: d.nf_fornecedor_numero,
      dt_emissao_nf: d.dt_emissao_nf,
      nao_emite_nf: d.nao_emite_nf,
      saiu_entrega: d.saiu,
      status_id: statusDaSaida(d.saiu),
    })
    .eq('id', entregaId)
    .in('status_id', [ETAPA.PEDIR, ETAPA.PEDIDO, ETAPA.EM_ENTREGA])
    .select('id')
  if (error) return { erro: traduzirErro('gravar saída', error) }
  if (!gravou || gravou.length === 0) return { erro: 'Você não tem permissão para alterar esta entrega.' }

  const enviados: { tipo: string; nomeArquivo: string; path: string }[] = []
  for (const [tipo, arq] of [
    ...(novaNf ? [['nf_fornecedor', novaNf] as const] : []),
    ...novosBoletos.map((b) => ['boleto', b] as const),
  ]) {
    const up = await enviarArquivo('entregas', entregaId, arq)
    if (!up.ok) return { erro: `${arq.name}: ${up.erro} (os dados da entrega foram gravados).` }
    const { error: eArq } = await supabase.from('entrega_arquivos').insert({
      entrega_id: entregaId,
      tipo,
      nome_arquivo: up.nomeArquivo,
      path: up.path,
      criado_por: usuario.id,
    })
    if (eArq) return { erro: traduzirErro('anexar arquivo', eArq) }
    enviados.push({ tipo, nomeArquivo: up.nomeArquivo, path: up.path })
  }

  const avisos: string[] = []
  if (d.nf_fornecedor_numero) {
    const { data: repetida } = await supabase
      .from('entregas')
      .select('id')
      .eq('fornecedor_id', e.fornecedor_id)
      .eq('nf_fornecedor_numero', d.nf_fornecedor_numero)
      .neq('id', entregaId)
      .limit(1)
    if (repetida && repetida.length > 0) avisos.push('já existe NF com esse número para esse fornecedor')
  }

  if (d.enviar_cliente) {
    const r = await enviarNotaBoleto(supabase, usuario, e, [...e.arquivos, ...enviados])
    if ('erro' in r) {
      revalidatePath(PAGINA)
      return { erro: `Entrega gravada, mas ${r.erro}` }
    }
    avisos.push(`NF/boleto na fila para ${r.email}`)
  }

  revalidatePath(PAGINA)
  const etapa = d.saiu ? 'Saiu para entrega.' : 'Entrega gravada.'
  return { ok: `${etapa}${avisos.length ? ` Atenção: ${avisos.join('; ')}.` : ''}` }
}

async function enviarNotaBoleto(
  supabase: Supabase,
  usuario: UsuarioAtual,
  e: EntregaLida,
  arqs: { tipo: string; nomeArquivo?: string; nome_arquivo?: string; path: string }[],
): Promise<{ email: string } | { erro: string }> {
  const anexos = arqs
    .filter((a) => a.tipo === 'nf_fornecedor' || a.tipo === 'boleto')
    .map((a) => ({ nomeArquivo: a.nomeArquivo ?? a.nome_arquivo ?? 'arquivo', path: a.path }))
  if (anexos.length === 0) return { erro: 'não há NF nem boleto anexado para enviar.' }
  if (!e.pedido?.contato_cliente_id) return { erro: 'o pedido não tem e-mail do cliente: grave-o no pedido para enviar a NF.' }
  const cli = await contatoComEmail(supabase, e.pedido.contato_cliente_id, [e.pedido.cliente_id])
  if (!cli) return { erro: 'o contato do cliente do pedido está inativo ou sem e-mail.' }
  const numero = e.numero_entrega ?? e.pedido.numero
  try {
    await enfileirarEmail({
      criadoPor: usuario.id,
      para: cli.email,
      evento: 'pedido',
      ...(await remetenteDe(supabase, usuario)),
      conteudo: {
        assunto: assuntoNotaBoleto(numero),
        html: html(
          corpoNotaBoleto({
            contato: cli.nome,
            numeroPedido: numero,
            produto: e.orcamento?.produto?.nome ?? '—',
            qtd: formatarQuantidade(e.qtd),
            vendedor: usuario.nome,
          }),
          [],
        ),
      },
      vinculo: { entregaId: e.id, pedidoId: e.pedido_id },
      anexos,
    })
  } catch (err) {
    console.error('vendas (fluxo): enfileirar NF/boleto', err)
    return { erro: 'o e-mail da NF não entrou na fila. Tente reenviar.' }
  }
  const agora = new Date().toISOString()
  await supabase.from('entregas').update({ nota_boleto_enviada: true }).eq('id', e.id)
  await supabase
    .from('entrega_arquivos')
    .update({ enviado_em: agora })
    .eq('entrega_id', e.id)
    .in('path', anexos.map((a) => a.path))
  return { email: cli.email }
}

/**
 * Cancelar entrega (WF bTeZz → bTeaF): "Cancelado", motivo, quantidade 0 (009 D1). Com qtd 0
 * as colunas geradas zeram bruto, líquido e comissão — no Bubble a comissão ficava gravada.
 * E-mails opcionais ao cliente (bTnxa0) e ao fornecedor +15 s (bTnxb0), evento
 * `cancelamento`; destinatários = contatos gravados no PEDIDO (no Bubble, escolhidos no popup).
 */
export async function cancelarEntrega(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const v = validarCancelamentoEntrega(form)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados
  const supabase = await clienteServidor()
  const e = await lerEntrega(supabase, d.entrega_id)
  if (!e?.pedido) return { erro: 'Esta entrega não existe mais. Recarregue a página.' }
  if (!podeCancelarEntrega(e.status_id)) return { erro: 'Entrega em Financeiro, concluída ou já cancelada não se cancela aqui.' }

  const avisar: { para: 'Cliente' | 'Fornecedor'; contatoId: string | null; grupo: string; nome: string }[] = []
  if (d.avisar_cliente) avisar.push({ para: 'Cliente', contatoId: e.pedido.contato_cliente_id, grupo: e.pedido.cliente_id, nome: e.pedido.cliente?.nome ?? '' })
  if (d.avisar_fornecedor) avisar.push({ para: 'Fornecedor', contatoId: e.pedido.contato_fornecedor_id, grupo: e.fornecedor_id, nome: e.fornecedor?.nome ?? '' })
  const destinos: { para: 'Cliente' | 'Fornecedor'; email: string; contato: string; nome: string }[] = []
  for (const a of avisar) {
    const c = a.contatoId ? await contatoComEmail(supabase, a.contatoId, [a.grupo]) : null
    if (!c) return { erro: `O pedido não tem e-mail do ${a.para.toLowerCase()} válido. Grave-o no pedido ou desmarque o aviso.` }
    destinos.push({ para: a.para, email: c.email, contato: c.nome, nome: a.nome })
  }

  const { data, error } = await supabase
    .from('entregas')
    .update({ status_id: ETAPA.CANCELADO, motivo_cancelamento: d.motivo, qtd: 0 })
    .eq('id', d.entrega_id)
    .in('status_id', [ETAPA.PEDIR, ETAPA.PEDIDO, ETAPA.EM_ENTREGA])
    .select('id')
  if (error) return { erro: traduzirErro('cancelar entrega', error) }
  if (!data || data.length === 0) return { erro: 'Não foi possível cancelar esta entrega.' }

  const numero = e.numero_entrega ?? e.pedido.numero
  const produto = e.orcamento?.produto?.nome ?? '—'
  const rem = destinos.length ? await remetenteDe(supabase, usuario) : null
  const enviados: string[] = []
  try {
    for (const [k, dest] of destinos.entries()) {
      await enfileirarEmail({
        criadoPor: usuario.id,
        para: dest.email,
        evento: 'cancelamento',
        ...rem!,
        conteudo: {
          assunto: assuntoCancelamentoEntrega({ numero, produtos: produto, para: dest.para, nome: dest.nome }),
          html: html(corpoCancelamentoEntrega({ contato: dest.contato, numero, produto, motivo: d.motivo, vendedor: usuario.nome }), []),
        },
        vinculo: { entregaId: e.id, pedidoId: e.pedido_id },
        agendadoPara: k > 0 ? new Date(Date.now() + 15_000) : undefined,
      })
      enviados.push(dest.email)
    }
  } catch (err) {
    console.error('vendas (fluxo): enfileirar cancelamento', err)
    revalidatePath(PAGINA)
    return { erro: 'Entrega cancelada, mas o aviso por e-mail não entrou na fila.' }
  }
  revalidatePath(PAGINA)
  return { ok: `Entrega cancelada.${enviados.length ? ` Aviso na fila para ${enviados.join(', ')}.` : ''}` }
}

/**
 * Abrir NF/boleto (bTepV, bTcRp, bTjjH): URL assinada de vida curta. `urlAssinada` confere
 * que a linha de entrega_arquivos é visível pela sessão — caminho adivinhado não abre.
 */
export async function abrirArquivoEntrega(path: string): Promise<{ url: string } | { erro: string }> {
  await exigirAcesso('vendas')
  if (typeof path !== 'string' || !path.startsWith('entregas/')) return { erro: 'Arquivo indisponível.' }
  const r = await urlAssinada(path, { segundos: 120 })
  return r.ok ? { url: r.url } : { erro: r.erro }
}
