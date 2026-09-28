'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso, type UsuarioAtual } from '@/lib/autorizacao'
import { ehUuid } from '@/lib/clifor'
import { ehDia, lerNumeroNf, paraCentavos, validarMotivo, validarValorBaixa } from '@/lib/financeiro'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { DadosFornecedor, EstadoAcao } from './tipos'

/*
 * Escrita do financeiro.
 *
 * Server action é endpoint público: cada uma repete `exigirAcesso('financeiro')` e valida a
 * entrada de novo. Grava com o cliente da SESSÃO — a RLS da 010/016 e os triggers de dinheiro
 * são a última palavra (saldo, status, fornecedor da cobrança, recibo = soma das baixas). O
 * cálculo é do banco: aqui nenhum valor é somado em float.
 *
 * A única exceção é `confirmarEntrega` para quem não escreve comissão (010 D12): ver lá.
 */

const PAGINA = '/financeiro'

function traduzirErro(contexto: string, erro: { code?: string; message?: string }): string {
  console.error(`financeiro: ${contexto}`, erro)
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para esta operação.'
    case '23514':
      // saldo excedido, recibo com mais de um fornecedor, cobrança de outro fornecedor…
      return traduzirMensagem(erro.message) ?? 'O banco recusou: os valores não fecham. Recarregue e confira.'
    case '55000':
    case 'P0002':
    case '23502':
      return traduzirMensagem(erro.message) ?? 'A operação não se aplica a esta conta. Recarregue a página.'
    case '23505':
      return 'Esta operação já foi feita (registro repetido). Recarregue a página.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

/**
 * As mensagens de exceção da 010 são escritas para gente ("Há conta já recebida na seleção").
 * Passam para a tela as que não carregam ids nem valores internos.
 */
function traduzirMensagem(msg: string | undefined): string | null {
  if (!msg) return null
  const conhecidas = [
    'Há conta já recebida na seleção',
    'Conta inexistente, cancelada ou sem acesso na seleção',
    'Um recibo declara contas de UM fornecedor',
    'Toda conta da cobrança tem de ser do fornecedor da filial escolhida',
    'Filial do fornecedor não encontrada',
    'Conta cancelada não recebe baixa',
    'A data real de entrega é obrigatória',
    'Sem prazos: informe os prazos ou grave a condição negociada do pedido',
    'Entrega cancelada não gera conta a receber',
  ]
  const achada = conhecidas.find((c) => msg.startsWith(c))
  if (achada) return `${achada}.`
  if (msg.startsWith('Baixa de')) return 'O valor passa do saldo da conta (outra baixa entrou antes). Recarregue.'
  return null
}

function ids(form: FormData, campo = 'ids'): string[] | null {
  const lista = form.getAll(campo)
  if (lista.length === 0 || lista.length > 500) return null
  const saida: string[] = []
  for (const v of lista) {
    if (!ehUuid(v)) return null
    saida.push(v.toLowerCase())
  }
  return [...new Set(saida)]
}

function dia(form: FormData, campo: string): string | null {
  const v = form.get(campo)
  return typeof v === 'string' && ehDia(v) ? v : null
}

function uuid(form: FormData, campo: string): string | null {
  const v = form.get(campo)
  return ehUuid(v) ? v.toLowerCase() : null
}

// ----------------------------------------------------------------- baixa a receber

/**
 * Baixa em lote de contas a receber — WF bTpVP/bTpVQ (com NF MegaBox) e bTrPJ/bTrPO (gerando
 * recibo), por `fn_baixar_contas_receber` (010): UMA transação, cada conta baixa o SALDO, o
 * recibo tem número por sequence e valor = soma das comissões (D14).
 *
 * Fora daqui: anexo da NF (sem bucket ainda, 010 "o que não entra"), PDF do recibo e e-mail.
 */
export async function baixarReceber(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('financeiro')
  const contas = ids(form)
  if (!contas) return { erro: 'Selecione pelo menos uma conta.' }
  const dtNf = dia(form, 'dt_nf')
  const dtCredito = dia(form, 'dt_credito')
  if (!dtNf || !dtCredito) return { erro: 'Informe a data da NF/recibo e a data do crédito no banco.' }
  const gerarRecibo = form.get('gerar_recibo') === 'on'
  const endereco = uuid(form, 'recibo_endereco')
  if (gerarRecibo && !endereco) return { erro: 'Escolha o CNPJ do fornecedor para o recibo.' }
  const numero = gerarRecibo ? null : lerNumeroNf(form.get('nf_numero'))

  const supabase = await clienteServidor()
  const { data: recibo, error } = await supabase.rpc('fn_baixar_contas_receber', {
    p_contas: contas,
    p_dt_credito: dtCredito,
    p_dt_nf: dtNf,
    p_nf_numero: numero,
    p_nf_path: null,
    p_gerar_recibo: gerarRecibo,
    p_recibo_endereco: gerarRecibo ? endereco : null,
  })
  if (error) return { erro: traduzirErro('baixar CR', error) }

  revalidatePath(PAGINA)
  const n = contas.length
  const txt = `${n} ${n === 1 ? 'conta baixada' : 'contas baixadas'}`
  if (recibo) {
    const { data } = await supabase.from('recibos').select('numero').eq('id', recibo as string).maybeSingle()
    return { ok: `${txt}. Recibo nº ${data?.numero ?? '?'} registrado (o PDF ainda não é gerado aqui).` }
  }
  return { ok: `${txt}.` }
}

// ------------------------------------------------------------------- baixa a pagar

/**
 * Baixa em lote de contas a pagar (comissão do vendedor). No Bubble o botão "Baixar Contas a
 * Pagar" não tem workflow (financeiro.md §4.6 [DÚVIDA]); aqui segue o mesmo desenho da CR: cada
 * conta baixa o SALDO lido do banco, num INSERT só (um comando = atômico), e o trigger
 * `fn_baixa_antes` trava a conta e recusa passar do saldo. Escrever baixa de CP é de hierarquia
 * ≤ 2 ou da equipe financeira (010 D11, 016) — a RLS decide.
 */
export async function baixarPagar(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('financeiro')
  const contas = ids(form)
  if (!contas) return { erro: 'Selecione pelo menos uma conta.' }
  const dtCredito = dia(form, 'dt_credito')
  if (!dtCredito) return { erro: 'Informe a data do pagamento no banco.' }
  const observacao = String(form.get('observacao') ?? '').trim().slice(0, 500) || null

  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from('v_contas_pagar')
    .select('id, saldo::text')
    .in('id', contas)
    .is('cancelada_em', null)
  if (error) return { erro: traduzirErro('ler CP', error) }
  const linhas = (data ?? []) as unknown as { id: string; saldo: string }[]
  if (linhas.length !== contas.length) return { erro: 'Conta inexistente, cancelada ou sem acesso na seleção.' }
  if (linhas.some((l) => paraCentavos(l.saldo) <= 0n)) return { erro: 'Há conta já paga na seleção.' }

  const { data: gravadas, error: e2 } = await supabase
    .from('baixas')
    .insert(
      linhas.map((l) => ({
        conta_pagar_id: l.id,
        valor: l.saldo,
        dt_credito: dtCredito,
        observacao,
        usuario_id: usuario.id,
        criado_por: usuario.id,
      })),
    )
    .select('id')
  if (e2) return { erro: traduzirErro('baixar CP', e2) }
  if (!gravadas || gravadas.length === 0) return { erro: 'Você não tem permissão para pagar comissões.' }

  revalidatePath(PAGINA)
  const n = gravadas.length
  return { ok: `${n} ${n === 1 ? 'conta paga' : 'contas pagas'}.` }
}

// --------------------------------------------------------------------- baixa parcial

/**
 * Baixa de UM valor numa conta (a receber ou a pagar). Parcial é permitida (D5): a conta fica
 * em aberto com saldo. O valor chega como texto e vira string exata (lib/financeiro), é
 * conferido contra o saldo lido AGORA e de novo pelo trigger, com a conta travada.
 */
export async function baixarParcial(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('financeiro')
  const conta = uuid(form, 'conta')
  const tipo = form.get('tipo') === 'pagar' ? 'pagar' : 'receber'
  if (!conta) return { erro: 'Conta inválida. Recarregue a página.' }
  const dtCredito = dia(form, 'dt_credito')
  if (!dtCredito) return { erro: 'Informe a data do crédito no banco.' }
  const dtNf = dia(form, 'dt_nf')
  if (tipo === 'receber' && !dtNf) return { erro: 'Informe a data da NF/recibo MegaBox.' }

  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from(tipo === 'pagar' ? 'v_contas_pagar' : 'v_contas_receber')
    .select('saldo::text')
    .eq('id', conta)
    .is('cancelada_em', null)
    .maybeSingle()
  if (error) return { erro: traduzirErro('ler saldo', error) }
  if (!data) return { erro: 'Conta não encontrada (ou sem acesso).' }
  const v = validarValorBaixa(String(form.get('valor') ?? ''), (data as unknown as { saldo: string }).saldo)
  if (!v.ok) return { erro: v.erro }

  const { data: gravada, error: e2 } = await supabase
    .from('baixas')
    .insert({
      [tipo === 'pagar' ? 'conta_pagar_id' : 'conta_receber_id']: conta,
      valor: v.valor,
      dt_credito: dtCredito,
      dt_nf_megabox: tipo === 'receber' ? dtNf : null,
      nf_megabox_numero: tipo === 'receber' ? lerNumeroNf(form.get('nf_numero')) : null,
      observacao: String(form.get('observacao') ?? '').trim().slice(0, 500) || null,
      usuario_id: usuario.id,
      criado_por: usuario.id,
    })
    .select('id')
  if (e2) return { erro: traduzirErro('baixa parcial', e2) }
  if (!gravada || gravada.length === 0) return { erro: 'Você não tem permissão para baixar esta conta.' }

  revalidatePath(PAGINA)
  return { ok: 'Baixa registrada.' }
}

// --------------------------------------------------------------------------- estorno

/**
 * Estorno de uma baixa — WF bTrtf (CR) e bTsBe1 (CP), reusables §4.7. Aqui é REGISTRO (D6): a
 * baixa fica, com um `estornos` apontando para ela; motivo obrigatório; quem e quando nas DUAS
 * origens (a CP do Bubble não gravava). Só o Diretor (010 `estornos_insercao`; reusables §9.3).
 * A checagem de perfil aqui é só a mensagem: a policy recusa de qualquer jeito.
 */
export async function estornarBaixa(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('financeiro')
  if (usuario.perfilId !== 1) return { erro: 'Só o Diretor estorna baixas.' }
  const baixa = uuid(form, 'baixa')
  if (!baixa) return { erro: 'Baixa inválida. Recarregue a página.' }
  const m = validarMotivo(form.get('motivo'))
  if (!m.ok) return { erro: m.erro }

  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from('estornos')
    .insert({ baixa_id: baixa, motivo: m.motivo, usuario_id: usuario.id, criado_por: usuario.id })
    .select('id')
  if (error) return { erro: traduzirErro('estornar', error) }
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para estornar.' }

  revalidatePath(PAGINA)
  return { ok: 'Baixa estornada. A conta voltou a ter saldo.' }
}

// -------------------------------------------------------------------------- arquivar

/**
 * Arquivar / desarquivar CR — WF bUFDT/bUFFD (financeiro.md §4.8). Quem e quando o trigger grava
 * (fn_conta_receber_derivados), o que o Bubble não fazia.
 */
export async function arquivarConta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('financeiro')
  const conta = uuid(form, 'conta')
  if (!conta) return { erro: 'Conta inválida. Recarregue a página.' }
  const arquivar = form.get('arquivar') === 'true'

  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from('contas_receber')
    .update({ arquivado: arquivar })
    .eq('id', conta)
    .select('id')
  if (error) return { erro: traduzirErro('arquivar', error) }
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar esta conta.' }

  revalidatePath(PAGINA)
  return { ok: arquivar ? 'Conta arquivada.' : 'Conta desarquivada.' }
}

// -------------------------------------------------------------------------- cobrança

/** Filiais ativas e contatos do fornecedor — para cobrança e recibo (cliente da sessão). */
export async function buscarDadosFornecedor(fornecedorId: string): Promise<DadosFornecedor> {
  await exigirAcesso('financeiro')
  if (!ehUuid(fornecedorId)) return { enderecos: [], contatos: [] }
  const supabase = await clienteServidor()
  const [enderecos, contatos] = await Promise.all([
    supabase
      .from('enderecos_clifor')
      .select('id, nome_endereco, razao, documento')
      .eq('grupo_id', fornecedorId)
      .eq('ativo', true)
      .order('principal', { ascending: false })
      .order('nome_endereco'),
    supabase
      .from('contatos_clifor')
      .select('id, nome, email')
      .eq('grupo_id', fornecedorId)
      .eq('ativo', true)
      .order('nome'),
  ])
  if (enderecos.error || contatos.error) console.error('financeiro: fornecedor', enderecos.error ?? contatos.error)
  return {
    enderecos: (enderecos.data ?? []) as DadosFornecedor['enderecos'],
    contatos: (contatos.data ?? []) as DadosFornecedor['contatos'],
  }
}

/**
 * Registrar a cobrança — WF bTpUZ (bTpUa/bTpUb) por `fn_registrar_cobranca` (010): número por
 * sequence (não `count + 1`), fornecedor DERIVADO da filial e toda CR desse fornecedor (D14).
 * Fora daqui: o PDF (bTpUN) e o e-mail (bTpUg) — a fila `email_outbox` é só service_role e o
 * envio não existe ainda.
 */
export async function registrarCobranca(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('financeiro')
  const contas = ids(form)
  if (!contas) return { erro: 'Selecione pelo menos uma conta.' }
  const endereco = uuid(form, 'endereco')
  if (!endereco) return { erro: 'Escolha a filial do fornecedor.' }
  const contato = uuid(form, 'contato')

  const supabase = await clienteServidor()
  const { data, error } = await supabase.rpc('fn_registrar_cobranca', {
    p_contas: contas,
    p_endereco_fornecedor: endereco,
    p_contato: contato,
  })
  if (error) return { erro: traduzirErro('cobrança', error) }

  revalidatePath(PAGINA)
  const numero = (data as { numero?: number } | null)?.numero
  return { ok: `Cobrança nº ${numero ?? '?'} registrada com ${contas.length} ${contas.length === 1 ? 'conta' : 'contas'}.` }
}

// ------------------------------------------------------------------ confirmar entrega

/** Quem grava comissão pela sessão: hierarquia ≤ 2 ou equipe financeira (010 D11, 016). */
async function escreveComissao(supabase: Awaited<ReturnType<typeof clienteServidor>>, u: UsuarioAtual) {
  if (u.perfilId <= 2) return true
  const { data } = await supabase.rpc('fn_equipe_financeira')
  return data === true
}

/**
 * Confirmar a entrega — bTcXd/bTcXj: data real, status Financeiro, parcelas a receber (bTfDZ,
 * rateio exato D3) e a comissão do vendedor (bToYh), por `fn_confirmar_entrega` (010), numa
 * transação e idempotente.
 *
 * 010 D12: quem tem a página mas NÃO escreve comissão (Analista fora do Administrativo/
 * Financeiro, D11) não passa na RLS de `contas_pagar`. Para ele, e SÓ para ele, a mesma função
 * roda com service_role — depois de esta action revalidar `exigirAcesso` e provar, pelo
 * cliente da SESSÃO, que a RLS deixa ver a entrega. Como sem sessão `auth.uid()` é nulo, o
 * autor é gravado em seguida nas linhas criadas.
 */
export async function confirmarEntrega(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('financeiro')
  const entrega = uuid(form, 'entrega')
  if (!entrega) return { erro: 'Entrega inválida. Recarregue a página.' }
  const dtEntrega = dia(form, 'dt_entrega')
  if (!dtEntrega) return { erro: 'Informe a data real da entrega.' }
  const prazos = form
    .getAll('prazos')
    .map((p) => Number(p))
    .filter((p) => Number.isInteger(p) && p > 0 && p < 1000)
  const pPrazos = prazos.length > 0 ? prazos : null

  const supabase = await clienteServidor()
  const { data: visivel, error: e1 } = await supabase
    .from('entregas')
    .select('id, status_id')
    .eq('id', entrega)
    .maybeSingle()
  if (e1) return { erro: traduzirErro('ler entrega', e1) }
  if (!visivel) return { erro: 'Entrega não encontrada (ou sem acesso).' }
  if (visivel.status_id === 7) return { erro: 'Entrega cancelada não se confirma.' }

  const args = { p_entrega: entrega, p_dt_entrega: dtEntrega, p_prazos: pPrazos, p_gerar_conta_pagar: true }

  if (await escreveComissao(supabase, usuario)) {
    const { error } = await supabase.rpc('fn_confirmar_entrega', args)
    if (error) return { erro: traduzirErro('confirmar entrega', error) }
  } else {
    const admin = clienteAdmin()
    const { error } = await admin.rpc('fn_confirmar_entrega', args)
    if (error) return { erro: traduzirErro('confirmar entrega (servidor)', error) }
    // Registra o autor onde a função gravou nulo (auth.uid() sem sessão). `entregas.alterado_por`
    // não dá: fn_set_alterado (001) o sobrescreve com auth.uid() em todo UPDATE.
    const marcas = await Promise.all([
      admin.from('contas_receber').update({ criado_por: usuario.id }).eq('entrega_id', entrega).is('criado_por', null),
      admin.from('contas_pagar').update({ criado_por: usuario.id }).eq('entrega_id', entrega).is('criado_por', null),
    ])
    for (const m of marcas) if (m.error) console.error('financeiro: autor da confirmação', m.error)
  }

  revalidatePath(PAGINA)
  return { ok: 'Entrega confirmada. As contas a receber e a comissão foram geradas.' }
}
