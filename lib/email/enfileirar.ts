import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { clienteAdmin } from '@/lib/supabase/admin'

import { juntarEnderecos, montarDestinatarios, separarEnderecos, type Copia } from './enderecos'
import { limparCabecalho, renderizarModelo, type Variaveis } from './modelo'

/** Eventos de `config_copia_email.evento` (db/001). */
export type EventoCopia = 'pedido' | 'proposta' | 'cancelamento' | 'cobranca'

export interface PedidoDeEmail {
  /** Quem pediu (auth.uid() da sessão validada na server action). Obrigatório: é por ele que a tela mostra o status. */
  criadoPor: string
  /**
   * Destinatários. REGRA ANTI-RELAY (008 D7): a server action tira estes endereços do BANCO
   * (contato do pedido/proposta/cobrança), nunca de campo livre do formulário. O campo de
   * "cópias" que o vendedor digita (propostas.emails_copia etc.) é o único texto livre aceito,
   * e vai em `cc`.
   */
  para: string | string[]
  cc?: string | string[] | null
  bcc?: string | string[] | null
  /** Soma as cópias configuradas para o evento em config_copia_email. */
  evento?: EventoCopia
  /** Modelo de modelos_email + variáveis (escapadas no corpo). */
  modelo?: { chave: string; variaveis: Variaveis }
  /** Alternativa ao modelo: assunto + HTML JÁ SEGURO (use textoParaHtml para texto livre). */
  conteudo?: { assunto: string; html: string }
  responderPara?: string | null
  remetenteNome?: string | null
  vinculo?: {
    pedidoId?: string
    propostaId?: string
    entregaId?: string
    cobrancaId?: string
    reciboId?: string
  }
  /** Caminhos no Storage privado (`<bucket>/<objeto>`, ver lib/email/anexos.ts). */
  anexos?: { nomeArquivo: string; path: string }[]
  agendadoPara?: Date
}

/** Cópias configuradas para o evento: linha com e-mail fixo, ou usuário ATIVO com email_contato. */
export async function copiasDoEvento(admin: SupabaseClient, evento: EventoCopia): Promise<Copia[]> {
  const { data, error } = await admin
    .from('config_copia_email')
    .select('email, tipo, usuario:usuarios!config_copia_email_usuario_id_fkey(email_contato, ativo)')
    .eq('evento', evento)
  if (error) throw new Error(`config_copia_email: ${error.message}`)

  const copias: Copia[] = []
  for (const l of (data ?? []) as unknown as {
    email: string | null
    tipo: 'cc' | 'bcc'
    usuario: { email_contato: string | null; ativo: boolean } | null
  }[]) {
    const email = l.email ?? (l.usuario?.ativo ? l.usuario.email_contato : null)
    if (email) copias.push({ email, tipo: l.tipo })
  }
  return copias
}

/**
 * Enfileira UMA mensagem (e seus anexos) na fila, numa transação (fn_email_enfileirar, 019).
 * Não envia: quem envia é o processador (app/api/fila-email). Devolve o id da linha, para
 * gravar em historicos.email_id / sac_interacoes.email_id.
 *
 * Só para server action/rota: usa service_role. A action valida sessão e permissão ANTES.
 */
export async function enfileirarEmail(p: PedidoDeEmail): Promise<{ id: string }> {
  if (!p.criadoPor) throw new Error('criadoPor é obrigatório.')
  if (!!p.modelo === !!p.conteudo) throw new Error('Informe modelo OU conteudo.')

  const admin = clienteAdmin()

  let assunto: string
  let html: string
  if (p.modelo) {
    const { data, error } = await admin
      .from('modelos_email')
      .select('assunto, corpo, ativo')
      .eq('chave', p.modelo.chave)
      .maybeSingle()
    if (error) throw new Error(`modelos_email: ${error.message}`)
    if (!data || !data.ativo) throw new Error(`Modelo de e-mail "${p.modelo.chave}" inexistente ou inativo.`)
    ;({ assunto, html } = renderizarModelo(data, p.modelo.variaveis))
  } else {
    assunto = limparCabecalho(p.conteudo!.assunto)
    html = p.conteudo!.html
    if (!assunto || !html.trim()) throw new Error('Assunto e corpo são obrigatórios.')
  }

  const copias = p.evento ? await copiasDoEvento(admin, p.evento) : []
  const dest = montarDestinatarios({ para: p.para, cc: p.cc, bcc: p.bcc, copias })
  const responder = p.responderPara ? separarEnderecos(p.responderPara)[0] ?? null : null

  const { data, error } = await admin.rpc('fn_email_enfileirar', {
    p_email: {
      para: juntarEnderecos(dest.para),
      cc: juntarEnderecos(dest.cc),
      bcc: juntarEnderecos(dest.bcc),
      assunto,
      corpo: html,
      responder_para: responder,
      remetente_nome: p.remetenteNome ? limparCabecalho(p.remetenteNome) : null,
      modelo_chave: p.modelo?.chave ?? null,
      agendado_para: p.agendadoPara?.toISOString() ?? null,
      pedido_id: p.vinculo?.pedidoId ?? null,
      proposta_id: p.vinculo?.propostaId ?? null,
      entrega_id: p.vinculo?.entregaId ?? null,
      cobranca_id: p.vinculo?.cobrancaId ?? null,
      recibo_id: p.vinculo?.reciboId ?? null,
      criado_por: p.criadoPor,
    },
    p_anexos: (p.anexos ?? []).map((a) => ({ nome_arquivo: a.nomeArquivo, path: a.path })),
  })
  if (error) throw new Error(`fn_email_enfileirar: ${error.message}`)
  return { id: data as string }
}
