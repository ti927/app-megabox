/**
 * Regras puras do fluxo de vendas DEPOIS da cotação: proposta → pedido → entregas.
 *
 * Sem acesso a banco (testável, e usada pela tela e pelas server actions de
 * app/(app)/vendas/acoes-fluxo.ts). Fonte: specs/paginas/vendas.md §4.5–4.9 e
 * specs/paginas/vendas-reusables.md §4.1–4.5, citadas por WF do Bubble.
 *
 * DINHEIRO (CLAUDE.md regra 10): nada aqui calcula dinheiro. Os unitários das entregas e os
 * totais são do banco (triggers e colunas geradas das 008/009). Aqui só a QUANTIDADE que
 * falta entregar (numeric(14,3), em inteiro BigInt) e os textos dos e-mails.
 */

import { ehDia, ehUuid, ETAPA, lerQuantidade } from '@/lib/vendas'

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erro: string }

function texto(v: FormDataEntryValue | null | undefined): string {
  return typeof v === 'string' ? v.trim() : ''
}

function uuidOuNulo(v: FormDataEntryValue | null): string | null | 'invalido' {
  const t = texto(v)
  if (t === '') return null
  return ehUuid(t) ? t.toLowerCase() : 'invalido'
}

function marcado(v: FormDataEntryValue | null): boolean {
  return v === 'on' || v === 'true' || v === '1'
}

// ----------------------------------------------------------------- e-mails livres

const EMAIL = /^[^\s@<>(),;:"[\]]+@[^\s@<>(),;:"[\]]+\.[^\s@<>(),;:"[\]]+$/
const MAX_COPIAS = 10

/**
 * Campo "e-mails cópia" (propostas.emails_copia, pedidos.emails_copia_*): o ÚNICO texto livre
 * de endereço aceito (lib/email/enfileirar.ts, regra anti-relay). Separados por vírgula,
 * ponto e vírgula ou espaço; até 10; cada um com formato de e-mail. Devolve normalizado
 * ("a@x.com, b@y.com") ou null quando vazio.
 */
export function lerCopias(bruto: string): { ok: true; valor: string | null } | { ok: false; erro: string } {
  const partes = bruto
    .split(/[\s,;]+/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
  if (partes.length === 0) return { ok: true, valor: null }
  if (partes.length > MAX_COPIAS) return { ok: false, erro: `No máximo ${MAX_COPIAS} e-mails em cópia.` }
  const ruim = partes.find((p) => p.length > 254 || !EMAIL.test(p))
  if (ruim) return { ok: false, erro: `E-mail em cópia inválido: ${ruim}` }
  return { ok: true, valor: [...new Set(partes)].join(', ') }
}

function textoLimitado(v: FormDataEntryValue | null, max: number): string | null | 'longo' {
  const t = texto(v)
  if (t === '') return null
  return t.length > max ? 'longo' : t
}

// ----------------------------------------------------------------------- proposta

/** Padrão do campo na proposta nova (`pop add edita propostas`, vendas.md §2.8). */
export const CONDICAO_PAGAMENTO_PADRAO = 'Mediante analise do financeiro'

/**
 * Nº sugerido da proposta (vendas.md §5.2: "quantidade de propostas da cotação + 1"). Aqui
 * é o MAIOR + 1: depois de descartar uma proposta, "quantidade + 1" repetiria um número que
 * ainda existe e o `unique (cotacao_id, numero)` da 008 recusaria.
 */
export function proximoNumeroProposta(existentes: number[]): number {
  return existentes.reduce((m, n) => Math.max(m, n), 0) + 1
}

export type DadosProposta = {
  proposta_id: string
  numero: number
  enviar_para_contato_id: string | null
  faturar_para_endereco_id: string | null
  condicao_pagamento: string | null
  data_prev_entrega: string | null
  info_adicional: string | null
  emails_copia: string | null
  corpo_email: string | null
}

/**
 * Gravar / Gravar e Enviar (WF bTmXN → bTmXT; bTPDr0 → bThFd) e Salvar / Salvar e Enviar
 * (bTPhF, bTPhL). "Enviar" exige o contato do cliente (é o `to` do e-mail, bTnvu0).
 */
export function validarProposta(form: FormData, enviar: boolean): Validacao<DadosProposta> {
  const id = texto(form.get('proposta_id'))
  if (!ehUuid(id)) return { ok: false, erro: 'Proposta inválida. Recarregue a página.' }
  const numero = Number(texto(form.get('numero')))
  if (!Number.isInteger(numero) || numero < 1 || numero > 9999) {
    return { ok: false, erro: 'Número da proposta inválido (1 a 9999).' }
  }
  const contato = uuidOuNulo(form.get('enviar_para_contato_id'))
  const faturar = uuidOuNulo(form.get('faturar_para_endereco_id'))
  if (contato === 'invalido' || faturar === 'invalido') return { ok: false, erro: 'Contato ou endereço inválido.' }
  if (enviar && !contato) return { ok: false, erro: 'Para enviar, escolha o e-mail do cliente.' }
  const data = texto(form.get('data_prev_entrega'))
  if (data && !ehDia(data)) return { ok: false, erro: 'Data prevista de entrega inválida.' }
  const condicao = textoLimitado(form.get('condicao_pagamento'), 500)
  const info = textoLimitado(form.get('info_adicional'), 4000)
  const corpo = textoLimitado(form.get('corpo_email'), 10000)
  if (condicao === 'longo' || info === 'longo' || corpo === 'longo') {
    return { ok: false, erro: 'Um dos textos passou do tamanho máximo.' }
  }
  const copias = lerCopias(texto(form.get('emails_copia')))
  if (!copias.ok) return copias
  return {
    ok: true,
    dados: {
      proposta_id: id.toLowerCase(),
      numero,
      enviar_para_contato_id: contato,
      faturar_para_endereco_id: faturar,
      condicao_pagamento: condicao,
      data_prev_entrega: data || null,
      info_adicional: info,
      emails_copia: copias.valor,
      corpo_email: corpo,
    },
  }
}

// ------------------------------------------------------------------------- pedido

export type DadosPedido = {
  pedido_id: string
  contato_cliente_id: string | null
  emails_copia_cliente: string | null
  corpo_email_cliente: string | null
  contato_fornecedor_id: string | null
  emails_copia_fornecedor: string | null
  corpo_email_fornecedor: string | null
  ordem_compra_numero: string | null
  info_adicional: string | null
  forma_pagamento_id: number | null
  prazos: number[]
}

/**
 * Gravar/Salvar o pedido, formalizando ou não (WFs bTblt/bTbmF e bTcqO/bTbnL). As duas
 * variantes gravam os MESMOS campos — inclusive a forma de pagamento, que o Bubble esquecia
 * ao formalizar (vendas [DÚVIDA 4], recomendação da 008). Formalizar exige o e-mail do cliente
 * (`obrigatório se formalizar`, §2.9), a forma e ao menos um prazo: é deles que a confirmação
 * da entrega gera as parcelas (fn_gerar_contas_receber, 010).
 */
export function validarPedido(form: FormData, formalizar: boolean): Validacao<DadosPedido> {
  const id = texto(form.get('pedido_id'))
  if (!ehUuid(id)) return { ok: false, erro: 'Pedido inválido. Recarregue a página.' }
  const cliente = uuidOuNulo(form.get('contato_cliente_id'))
  const fornecedor = uuidOuNulo(form.get('contato_fornecedor_id'))
  if (cliente === 'invalido' || fornecedor === 'invalido') return { ok: false, erro: 'Contato inválido.' }
  const forma = texto(form.get('forma_pagamento_id'))
  const formaId = forma === '' ? null : Number(forma)
  if (formaId !== null && (!Number.isInteger(formaId) || formaId <= 0 || formaId > 99)) {
    return { ok: false, erro: 'Forma de pagamento inválida.' }
  }
  const prazos = [...new Set(form.getAll('prazos').map((p) => Number(p)))]
  if (prazos.some((p) => !Number.isInteger(p) || p <= 0 || p > 999)) return { ok: false, erro: 'Prazo inválido.' }
  if (prazos.length > 12) return { ok: false, erro: 'No máximo 12 prazos.' }
  if (formalizar) {
    if (!cliente) return { ok: false, erro: 'Para formalizar, escolha o e-mail do cliente.' }
    if (formaId === null) return { ok: false, erro: 'Para formalizar, escolha a forma de pagamento.' }
    if (prazos.length === 0) return { ok: false, erro: 'Para formalizar, escolha ao menos um prazo de pagamento.' }
  }
  const oc = textoLimitado(form.get('ordem_compra_numero'), 60)
  const info = textoLimitado(form.get('info_adicional'), 4000)
  const corpoCli = textoLimitado(form.get('corpo_email_cliente'), 10000)
  const corpoFor = textoLimitado(form.get('corpo_email_fornecedor'), 10000)
  if ([oc, info, corpoCli, corpoFor].includes('longo')) return { ok: false, erro: 'Um dos textos passou do tamanho máximo.' }
  const ccCli = lerCopias(texto(form.get('emails_copia_cliente')))
  if (!ccCli.ok) return ccCli
  const ccFor = lerCopias(texto(form.get('emails_copia_fornecedor')))
  if (!ccFor.ok) return ccFor
  return {
    ok: true,
    dados: {
      pedido_id: id.toLowerCase(),
      contato_cliente_id: cliente,
      emails_copia_cliente: ccCli.valor,
      corpo_email_cliente: corpoCli as string | null,
      contato_fornecedor_id: fornecedor,
      emails_copia_fornecedor: ccFor.valor,
      corpo_email_fornecedor: corpoFor as string | null,
      ordem_compra_numero: oc as string | null,
      info_adicional: info as string | null,
      forma_pagamento_id: formaId,
      prazos: prazos.sort((a, b) => a - b),
    },
  }
}

// ----------------------------------------------------------------------- entregas

type StatusEntrega = { status_id: number; saiu_entrega: boolean }

/**
 * Data e quantidade só se editam enquanto a entrega não saiu (§2.9: "editável se não saiu")
 * e não foi cancelada nem confirmada.
 */
export function podeEditarEntrega(e: StatusEntrega): boolean {
  return !e.saiu_entrega && (e.status_id === ETAPA.PEDIR || e.status_id === ETAPA.PEDIDO)
}

/** "Apagar entregas que ainda não saíram" (bTbuB/bTbxI): a mesma condição. */
export const podeApagarEntrega = podeEditarEntrega

/**
 * O diálogo de NF/saída (pop.AnexaNf) grava fora do Financeiro (bTcRH/bTcZR). Em Financeiro,
 * Concluído ou Cancelado o grupo "Saiu para entrega" some (bTcAr) e a gravação é outra.
 */
export function podeGravarSaida(status: number): boolean {
  return status === ETAPA.PEDIR || status === ETAPA.PEDIDO || status === ETAPA.EM_ENTREGA
}

/** Cancelar entrega: desabilitado em Financeiro/Cancelado (§2.9); Concluído também. */
export const podeCancelarEntrega = podeGravarSaida

/** Interruptor "Saiu para entrega": ligado → Em Entrega (bTcRH); desligado → Pedido (bTcZR). */
export function statusDaSaida(saiu: boolean): number {
  return saiu ? ETAPA.EM_ENTREGA : ETAPA.PEDIDO
}

export type DadosNovaEntrega = {
  pedido_id: string
  orcamento_fornecedor_id: string
  qtd: string
  dt_prev_entrega: string | null
}

/**
 * "+ entrega" no item do pedido (WF bTbOt → bTbOz). O Bubble cria a entrega vazia e a
 * quantidade entra depois; aqui entra junto (a coluna aceita 0, 009 D1, mas entrega de 0
 * nasceria sem valor nenhum). Data em branco → a da proposta (trigger, 009 D6).
 */
export function validarNovaEntrega(form: FormData): Validacao<DadosNovaEntrega> {
  const pedido = texto(form.get('pedido_id'))
  const orc = texto(form.get('orcamento_fornecedor_id'))
  if (!ehUuid(pedido) || !ehUuid(orc)) return { ok: false, erro: 'Item do pedido inválido. Recarregue a página.' }
  const qtd = lerQuantidade(texto(form.get('qtd')))
  if (!qtd) return { ok: false, erro: 'Quantidade inválida (maior que zero, até 3 casas).' }
  const data = texto(form.get('dt_prev_entrega'))
  if (data && !ehDia(data)) return { ok: false, erro: 'Data prevista inválida.' }
  return {
    ok: true,
    dados: { pedido_id: pedido.toLowerCase(), orcamento_fornecedor_id: orc.toLowerCase(), qtd, dt_prev_entrega: data || null },
  }
}

export type DadosEdicaoEntrega = { entrega_id: string; qtd: string; dt_prev_entrega: string | null }

/** Editar data prevista (bUEti) e quantidade (bTbPN) de uma entrega que não saiu. */
export function validarEdicaoEntrega(form: FormData): Validacao<DadosEdicaoEntrega> {
  const id = texto(form.get('entrega_id'))
  if (!ehUuid(id)) return { ok: false, erro: 'Entrega inválida. Recarregue a página.' }
  const qtd = lerQuantidade(texto(form.get('qtd')))
  if (!qtd) return { ok: false, erro: 'Quantidade inválida (maior que zero, até 3 casas).' }
  const data = texto(form.get('dt_prev_entrega'))
  if (data && !ehDia(data)) return { ok: false, erro: 'Data prevista inválida.' }
  return { ok: true, dados: { entrega_id: id.toLowerCase(), qtd, dt_prev_entrega: data || null } }
}

export type DadosSaida = {
  entrega_id: string
  saiu: boolean
  nao_emite_nf: boolean
  nf_fornecedor_numero: string | null
  dt_emissao_nf: string | null
  enviar_cliente: boolean
}

/**
 * pop.AnexaNf (vendas-reusables §4.2–4.3). NF (número e data) é obrigatória para a entrega
 * SAIR, exceto com "Fornecedor não emite nota fiscal", que desobriga e limpa os dois (as 3
 * condicionais de bTiFr0). Sem sair, grava o que vier.
 * `temArquivoNf` = já há arquivo de NF gravado OU veio um agora.
 */
export function validarSaida(form: FormData, temArquivoNf: boolean): Validacao<DadosSaida> {
  const id = texto(form.get('entrega_id'))
  if (!ehUuid(id)) return { ok: false, erro: 'Entrega inválida. Recarregue a página.' }
  const saiu = marcado(form.get('saiu'))
  const naoEmite = marcado(form.get('nao_emite_nf'))
  const nf = naoEmite ? '' : texto(form.get('nf_fornecedor_numero'))
  const data = naoEmite ? '' : texto(form.get('dt_emissao_nf'))
  if (nf.length > 30) return { ok: false, erro: 'Número da NF passa de 30 caracteres.' }
  if (nf && !/^[0-9A-Za-z./-]+$/.test(nf)) return { ok: false, erro: 'Número da NF: só letras, números, ponto, barra e hífen.' }
  if (data && !ehDia(data)) return { ok: false, erro: 'Data de emissão da NF inválida.' }
  if (saiu && !naoEmite) {
    if (!nf) return { ok: false, erro: 'Informe o número da NF do fornecedor (ou marque que ele não emite).' }
    if (!data) return { ok: false, erro: 'Informe a data de emissão da NF.' }
    if (!temArquivoNf) return { ok: false, erro: 'Anexe o arquivo da NF do fornecedor.' }
  }
  return {
    ok: true,
    dados: {
      entrega_id: id.toLowerCase(),
      saiu,
      nao_emite_nf: naoEmite,
      nf_fornecedor_numero: nf || null,
      dt_emissao_nf: data || null,
      enviar_cliente: marcado(form.get('enviar_cliente')),
    },
  }
}

export type DadosCancelamento = {
  entrega_id: string
  motivo: string
  avisar_cliente: boolean
  avisar_fornecedor: boolean
}

/** pop cancelar entrega e pedido, modo Cancela Entrega (WF bTeZz): motivo obrigatório. */
export function validarCancelamentoEntrega(form: FormData): Validacao<DadosCancelamento> {
  const id = texto(form.get('entrega_id'))
  if (!ehUuid(id)) return { ok: false, erro: 'Entrega inválida. Recarregue a página.' }
  const motivo = texto(form.get('motivo'))
  if (motivo.length < 3) return { ok: false, erro: 'Informe o motivo do cancelamento.' }
  if (motivo.length > 1000) return { ok: false, erro: 'O motivo passa de 1000 caracteres.' }
  return {
    ok: true,
    dados: {
      entrega_id: id.toLowerCase(),
      motivo,
      avisar_cliente: marcado(form.get('avisar_cliente')),
      avisar_fornecedor: marcado(form.get('avisar_fornecedor')),
    },
  }
}

/** Boletos por entrega: 4 (`upf boletos`, max_files=4, bTiDt0). */
export const MAX_BOLETOS = 4

// ------------------------------------------------------------ saldo de QUANTIDADE

const QTD = /^(\d+)(?:\.(\d{1,3}))?$/

function milesimos(v: string): bigint {
  const m = QTD.exec(v.trim())
  if (!m) throw new Error(`quantidade inválida: ${v}`)
  return BigInt(m[1]!) * 1000n + BigInt((m[2] ?? '').padEnd(3, '0'))
}

/**
 * "Falta qtd" do item (vendas.md §5.4) = QtdVenda − Σ QtdEntrega de TODAS as entregas (as
 * canceladas têm qtd 0, bTeaF). Quantidade, não dinheiro; exata em milésimos. Pode ser
 * negativa (entregou a mais), como no Bubble, que a mostra em vermelho.
 */
export function faltaQuantidade(qtdVenda: string, entregas: string[]): string {
  const falta = entregas.reduce((s, q) => s - milesimos(q), milesimos(qtdVenda))
  const neg = falta < 0n
  const abs = neg ? -falta : falta
  const inteiro = abs / 1000n
  const frac = (abs % 1000n).toString().padStart(3, '0').replace(/0+$/, '')
  return `${neg ? '-' : ''}${inteiro}${frac ? `.${frac}` : ''}`
}

// ------------------------------------------------------------------ textos de e-mail

/** Produtos distintos, na ordem em que aparecem ("agrupados por nome", vendas.md §6.2). */
export function produtosDistintos(nomes: (string | null | undefined)[]): string {
  return [...new Set(nomes.map((n) => n?.trim()).filter((n): n is string => !!n))].join(', ')
}

/** Remetente "[MegaBox] PRIMEIRONOME" (vendas.md §6.2). */
export function remetente(nomeUsuario: string): string {
  const primeiro = nomeUsuario.trim().split(/\s+/)[0] ?? ''
  return `[MegaBox] ${primeiro.charAt(0).toUpperCase()}${primeiro.slice(1).toLowerCase()}`.trim()
}

export function assuntoProposta(p: { cotacao: number; proposta: number; produtos: string; cliente: string }): string {
  return `Proposta núm ${p.cotacao}/${p.proposta} - Produtos: ${p.produtos || '—'} - Cliente: ${p.cliente}`
}

export function corpoPadraoProposta(p: { contato: string; cotacao: number; proposta: number; vendedor: string }): string {
  return [
    `Olá ${p.contato},`,
    '',
    `Segue a nossa proposta núm ${p.cotacao}/${p.proposta}.`,
    'Qualquer dúvida, estou à disposição.',
    '',
    'Atenciosamente,',
    p.vendedor,
    'Grupo MegaBox',
  ].join('\n')
}

export function assuntoPedido(p: {
  numero: string
  proposta: number | null
  produtos: string
  para: 'Cliente' | 'Fornecedor'
  nome: string
}): string {
  const num = p.proposta === null ? p.numero : `${p.numero}/${p.proposta}`
  return `Pedido núm ${num} - Produtos: ${p.produtos || '—'} - ${p.para}: ${p.nome}`
}

export function corpoPadraoPedido(p: { contato: string; numero: string; para: 'Cliente' | 'Fornecedor'; vendedor: string }): string {
  const frase =
    p.para === 'Cliente'
      ? `Confirmamos o seu pedido núm ${p.numero}. Seguem abaixo os itens e as entregas programadas.`
      : `Segue o pedido núm ${p.numero} para faturamento. Abaixo os itens, a comissão unitária e as entregas programadas.`
  return [`Olá ${p.contato},`, '', frase, '', 'Atenciosamente,', p.vendedor, 'Grupo MegaBox'].join('\n')
}

/** Assunto EXATO do Bubble (bTiFG0): `Nota fiscal e Boleto - (Pedido núm N)`. */
export function assuntoNotaBoleto(numeroPedido: string): string {
  return `Nota fiscal e Boleto - (Pedido núm ${numeroPedido})`
}

export function corpoNotaBoleto(p: { contato: string; numeroPedido: string; produto: string; qtd: string; vendedor: string }): string {
  return [
    `Olá ${p.contato.toUpperCase()}`,
    '',
    `Segue anexo nota fiscal e boleto referente ao pedido ${p.numeroPedido} (${p.produto} - ${p.qtd})`,
    '',
    'Atenciosamente,',
    p.vendedor,
    'Grupo MegaBox',
  ].join('\n')
}

/** "Cancelamento Entrega: <nº> - Produtos: … - Cliente/Fornecedor: …" (bTnxa0/bTnxb0). */
export function assuntoCancelamentoEntrega(p: { numero: string; produtos: string; para: 'Cliente' | 'Fornecedor'; nome: string }): string {
  return `Cancelamento Entrega: ${p.numero} - Produtos: ${p.produtos || '—'} - ${p.para}: ${p.nome}`
}

export function corpoCancelamentoEntrega(p: { contato: string; numero: string; produto: string; motivo: string; vendedor: string }): string {
  return [
    `Olá ${p.contato},`,
    '',
    `Informamos o cancelamento da entrega do pedido ${p.numero} (${p.produto}).`,
    `Motivo: ${p.motivo}`,
    '',
    'Atenciosamente,',
    p.vendedor,
    'Grupo MegaBox',
  ].join('\n')
}

/** Texto do histórico (bTjCC): "Proposta número X/Y enviada ao cliente no email …". */
export function historicoProposta(cotacao: number, proposta: number, email: string): string {
  return `Proposta número ${cotacao}/${proposta} enviada ao cliente no email ${email}`
}

/** Texto do histórico (bTjBw): "Pedido número N enviado ao cliente no email …". */
export function historicoPedido(numero: string, email: string): string {
  return `Pedido número ${numero} enviado ao cliente no email ${email}`
}
