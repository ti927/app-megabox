'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso } from '@/lib/autorizacao'
import { ehUuid } from '@/lib/clifor'
import { lerValorDigitado } from '@/lib/dinheiro'
import { compararReais, ehDataIso, lerPercentualDigitado, validarMeta } from '@/lib/metas'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { Calculo, EstadoAcao } from './tipos'

/*
 * Escrita da página metas.
 *
 * Server action é endpoint público: cada uma repete `exigirAcesso('metas')`, confere o perfil
 * e valida a entrada de novo. Grava com o cliente da SESSÃO — a RLS da 011 é a última palavra
 * (D10: meta e fechamento hierarquia ≤ 2; cancelar fechamento, nível e histórico só perfil 1).
 * O dinheiro NUNCA vem da tela: fechar chama `fn_fechar_meta`, que recalcula tudo no servidor
 * numa transação (D4/D7) — a falha mais grave do Bubble (bTwAj gravava o número da tela,
 * spec §7.5).
 */

const PRAZO_COMISSAO_DIAS = 10 // bTzXn "agora + 10 dias"; default de fn_fechar_meta (metas [DÚVIDA 17])

type Erro = { code?: string; message?: string }

function traduzirErro(contexto: string, erro: Erro): string {
  console.error(`metas: ${contexto}`, erro)
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para esta operação.'
    case '23503':
      return 'Um dos valores escolhidos não existe mais, ou o registro está em uso. Recarregue a página.'
    case '23505':
      return 'Já existe um registro igual.'
    case '55000':
      return erro.message ?? 'Operação não permitida no estado atual.'
    case '23P01':
      return 'Este vendedor já tem um nível vigente nesse período. Ajuste as datas.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

async function exigirGestao() {
  const usuario = await exigirAcesso('metas')
  return usuario.perfilId <= 2 ? usuario : null
}

async function exigirDiretor() {
  const usuario = await exigirAcesso('metas')
  return usuario.perfilId === 1 ? usuario : null
}

function idDoForm(form: FormData, campo: string): string | null {
  const v = form.get(campo)
  return ehUuid(v) ? v.toLowerCase() : null
}

// ------------------------------------------------------------------- meta mensal

/**
 * Criar ou editar a meta mensal — WF bTwBh (gravar) do `pop.AddEdita MetasMensais`. O Bubble
 * não edita (spec §4.3); aqui edita, e o trigger da 011 recusa mexer em meta fechada (55000).
 * O vendedor precisa ser elegível como no combo bTvyf (ativo, fora de Operação e Financeiro).
 */
export async function salvarMeta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirGestao()
  if (!usuario) return { erro: 'Só Diretor e Gerente criam ou editam metas.' }
  const supabase = await clienteServidor()

  const idBruto = form.get('id')
  const id = typeof idBruto === 'string' && idBruto !== '' ? idDoForm(form, 'id') : null
  if (typeof idBruto === 'string' && idBruto !== '' && !id) return { erro: 'Meta inválida. Recarregue a página.' }

  const v = validarMeta(form)
  if (!v.ok) return { erro: v.erro }
  const d = v.dados

  const { data: vend, error: eVend } = await supabase
    .from('usuarios')
    .select('ativo, departamento_id')
    .eq('id', d.vendedor_id)
    .maybeSingle()
  if (eVend) return { erro: traduzirErro('ler vendedor', eVend) }
  if (!vend || !vend.ativo || vend.departamento_id === 2 || vend.departamento_id === 4) {
    return { erro: 'Este vendedor não pode receber meta (inativo, ou de Operação/Financeiro).' }
  }

  if (id) {
    const { data, error } = await supabase.from('metas_mensais').update(d).eq('id', id).select('id')
    if (error) {
      return {
        erro: error.code === '23505'
          ? 'Este vendedor já tem meta deste tipo neste mês.'
          : traduzirErro('editar meta', error),
      }
    }
    if (!data || data.length === 0) return { erro: 'Você não tem permissão para editar esta meta.' }
    revalidatePath('/metas')
    return { ok: 'Meta alterada.' }
  }

  const { error } = await supabase.from('metas_mensais').insert({ ...d, criado_por: usuario.id }).select('id')
  if (error) {
    return {
      erro: error.code === '23505'
        ? 'Este vendedor já tem meta deste tipo neste mês.'
        : traduzirErro('criar meta', error),
    }
  }
  revalidatePath('/metas')
  return { ok: 'Meta criada.' }
}

/** Apagar a meta mensal — WF bTzdR0 (no Bubble sem confirmação nem perfil). Fechada: não. */
export async function apagarMeta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  if (!(await exigirGestao())) return { erro: 'Só Diretor e Gerente apagam metas.' }
  const supabase = await clienteServidor()
  const id = idDoForm(form, 'id')
  if (!id) return { erro: 'Meta inválida. Recarregue a página.' }

  const { data, error } = await supabase.from('metas_mensais').delete().eq('id', id).select('id')
  if (error) {
    return {
      erro: error.code === '23503'
        ? 'Esta meta está fechada: cancele o fechamento antes de apagar.'
        : traduzirErro('apagar meta', error),
    }
  }
  if (!data || data.length === 0) return { erro: 'Esta meta já não existe, ou você não pode apagá-la.' }
  revalidatePath('/metas')
  return { ok: 'Meta apagada.' }
}

// ---------------------------------------------------------------------- fechamento

/**
 * O cálculo que a confirmação mostra ANTES de fechar — `fn_calculo_meta`, a mesma função que
 * `fn_fechar_meta` usa (D4). É só leitura; o fechamento recalcula de novo no servidor.
 */
export async function calcularFechamento(metaId: string): Promise<{ calculo: Calculo } | { erro: string }> {
  if (!(await exigirGestao())) return { erro: 'Só Diretor e Gerente fecham metas.' }
  if (!ehUuid(metaId)) return { erro: 'Meta inválida.' }
  const supabase = await clienteServidor()

  const { data, error } = await supabase
    .rpc('fn_calculo_meta', { p_meta: metaId })
    .select('realizado::text, percentual::text, meta_batida, fator::text, comissao_vendedor::text, qtd_entregas')
    .maybeSingle()
  if (error) return { erro: traduzirErro('calcular fechamento', error) }
  if (!data) return { erro: 'Meta não encontrada.' }

  const c = data as unknown as Omit<Calculo, 'vencimento'>
  const hoje = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  const [a, m, dd] = hoje.split('-').map(Number) as [number, number, number]
  const venc = new Date(Date.UTC(a, m - 1, dd + PRAZO_COMISSAO_DIAS)).toISOString().slice(0, 10)
  return { calculo: { ...c, vencimento: venc } }
}

/**
 * Fechar a meta — WF bTwAj + bTzXn, agora `fn_fechar_meta` numa transação: retrato
 * congelado, entregas vinculadas (únicas) e, se pedido, a conta a pagar da comissão
 * (p_gerar_conta_pagar, 011 D8). Nada do que a tela mostrou entra no cálculo.
 */
export async function fecharMeta(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  if (!(await exigirGestao())) return { erro: 'Só Diretor e Gerente fecham metas.' }
  const supabase = await clienteServidor()
  const id = idDoForm(form, 'id')
  if (!id) return { erro: 'Meta inválida. Recarregue a página.' }
  const gerarCp = form.get('gerar_conta_pagar') === 'on'

  const { error } = await supabase.rpc('fn_fechar_meta', {
    p_meta: id,
    p_vencimento_dias: PRAZO_COMISSAO_DIAS,
    p_gerar_conta_pagar: gerarCp,
  })
  if (error) {
    const msg = error.message ?? ''
    if (error.code === '23505' && msg.includes('já está fechada')) return { erro: 'Esta meta já está fechada.' }
    if (error.code === '23505') {
      return {
        erro:
          'Alguma entrega desta meta já foi paga ao vendedor (comissão da entrega) ou já está em outra meta ' +
          'fechada. Nada foi gravado.',
      }
    }
    if (error.code === 'P0002' && msg.includes('Nenhuma entrega')) {
      return { erro: 'Não há entrega no período da meta: nada a fechar.' }
    }
    if (error.code === 'P0002') return { erro: 'Meta não encontrada, ou você não pode fechá-la.' }
    if (error.code === '23502') return { erro: 'A meta está sem nível: não há fator de comissão. Edite a meta.' }
    return { erro: traduzirErro('fechar meta', error) }
  }
  revalidatePath('/metas')
  return { ok: gerarCp ? 'Meta fechada e comissão lançada em contas a pagar.' : 'Meta fechada.' }
}

/**
 * Cancelar o fechamento — WF bTzkZ, só Diretor (bTzir), agora com motivo e sem lixo:
 * `fn_cancelar_fechamento_meta` recusa se a comissão já tem baixa, cancela a CP (lógico) e
 * solta as entregas (metas [DÚVIDA 6], 011 §7).
 */
export async function cancelarFechamento(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  if (!(await exigirDiretor())) return { erro: 'Só o Diretor cancela fechamento.' }
  const supabase = await clienteServidor()
  const id = idDoForm(form, 'meta_fechada_id')
  if (!id) return { erro: 'Fechamento inválido. Recarregue a página.' }
  const motivo = String(form.get('motivo') ?? '').trim().slice(0, 500)
  if (motivo.length < 5) return { erro: 'Escreva o motivo do cancelamento (pelo menos 5 letras).' }

  const { error } = await supabase.rpc('fn_cancelar_fechamento_meta', { p_meta_fechada: id, p_motivo: motivo })
  if (error) {
    if (error.code === 'P0002') return { erro: 'Fechamento não encontrado, ou você não pode cancelá-lo.' }
    return { erro: traduzirErro('cancelar fechamento', error) }
  }
  revalidatePath('/metas')
  return { ok: 'Fechamento cancelado. A meta voltou a aberta.' }
}

// --------------------------------------------------------------------------- níveis

/**
 * Criar ou editar nível de vendedor (Tbl.NiveisVendedores, hoje cadastrado no
 * `pop.ConfigSistema`, WF bTzXF). Só perfil 1 (011 D10; hoje auto-binding aberto).
 * Fatores digitados em % e gravados como FRAÇÃO (011 D1).
 */
export async function salvarNivel(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirDiretor()
  if (!usuario) return { erro: 'Só o Diretor mexe em níveis.' }
  const supabase = await clienteServidor()

  const idBruto = form.get('id')
  const id = typeof idBruto === 'string' && idBruto !== '' ? idDoForm(form, 'id') : null
  if (typeof idBruto === 'string' && idBruto !== '' && !id) return { erro: 'Nível inválido. Recarregue a página.' }

  const nome = String(form.get('nome') ?? '').replace(/\s+/g, ' ').trim()
  if (nome.length < 2 || nome.length > 60) return { erro: 'Nome do nível: de 2 a 60 letras.' }
  const ordem = Number(form.get('ordem'))
  if (!Number.isInteger(ordem) || ordem < 1 || ordem > 32767) return { erro: 'Ordem: número inteiro de 1 a 32767.' }
  const meta = lerValorDigitado(String(form.get('meta_venda') ?? ''))
  if (meta === null || compararReais(meta, '0') < 0) return { erro: 'Informe a meta de referência do nível.' }
  const padrao = lerPercentualDigitado(String(form.get('comissao_padrao') ?? ''))
  const batida = lerPercentualDigitado(String(form.get('comissao_meta_batida') ?? ''))
  if (padrao === null || batida === null) return { erro: 'Comissões: percentual de 0 a 100.' }
  const qtd = Number(form.get('qtd_meta_batida'))
  if (!Number.isInteger(qtd) || qtd < 0 || qtd > 36) return { erro: 'Meses para subir de nível: de 0 a 36.' }

  const campos = {
    nome,
    ordem,
    meta_venda: meta,
    comissao_padrao: padrao,
    comissao_meta_batida: batida,
    qtd_meta_batida: qtd,
  }
  const r = id
    ? await supabase.from('niveis_vendedor').update(campos).eq('id', id).select('id')
    : await supabase.from('niveis_vendedor').insert({ ...campos, criado_por: usuario.id }).select('id')
  if (r.error) {
    return {
      erro: r.error.code === '23505' ? 'Já existe nível com esse nome ou essa ordem.' : traduzirErro('gravar nível', r.error),
    }
  }
  if (!r.data || r.data.length === 0) return { erro: 'Você não tem permissão para gravar níveis.' }
  revalidatePath('/metas')
  return { ok: id ? 'Nível alterado.' : 'Nível criado.' }
}

/**
 * Registrar o nível de um vendedor a partir de uma data (promover/rebaixar). A história não
 * existe no Bubble (nível é um ponteiro no User); a "promoção" grava os dois — o histórico e
 * `usuarios.nivel_vendedor_id` (011, "O QUE NÃO ENTRA"; metas [DÚVIDA 15]).
 *
 * Fecha a vigência aberta anterior no dia da nova. LIMITE CONHECIDO: são três gravações
 * separadas (o PostgREST não abre transação entre chamadas); o exclude da 011 impede
 * sobreposição, então repetir é seguro.
 */
export async function registrarNivel(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirDiretor()
  if (!usuario) return { erro: 'Só o Diretor mexe no nível dos vendedores.' }
  const supabase = await clienteServidor()

  const vendedor = idDoForm(form, 'usuario_id')
  const nivel = idDoForm(form, 'nivel_id')
  const inicio = String(form.get('vigencia_inicio') ?? '')
  const motivo = String(form.get('motivo') ?? '').trim().slice(0, 500) || null
  if (!vendedor) return { erro: 'Escolha o vendedor.' }
  if (!nivel) return { erro: 'Escolha o nível.' }
  if (!ehDataIso(inicio)) return { erro: 'Informe a data de início da vigência.' }

  // a vigência aberta que começou antes termina onde a nova começa
  const { data: aberta, error: eAb } = await supabase
    .from('vendedor_nivel_historico')
    .select('id, vigencia_inicio, nivel_id')
    .eq('usuario_id', vendedor)
    .is('vigencia_fim', null)
    .maybeSingle()
  if (eAb) return { erro: traduzirErro('ler vigência', eAb) }
  if (aberta && aberta.vigencia_inicio >= inicio) {
    return { erro: 'Já há um nível vigente a partir desta data ou depois. Escolha uma data posterior.' }
  }
  if (aberta && aberta.nivel_id === nivel) return { erro: 'O vendedor já está neste nível.' }
  if (aberta) {
    const { error } = await supabase
      .from('vendedor_nivel_historico')
      .update({ vigencia_fim: inicio })
      .eq('id', aberta.id)
      .select('id')
    if (error) return { erro: traduzirErro('encerrar vigência', error) }
  }

  const { error: eIns } = await supabase
    .from('vendedor_nivel_historico')
    .insert({ usuario_id: vendedor, nivel_id: nivel, vigencia_inicio: inicio, motivo, criado_por: usuario.id })
    .select('id')
  if (eIns) return { erro: traduzirErro('registrar nível', eIns) }

  const hoje = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  if (inicio <= hoje) {
    const { error } = await supabase.from('usuarios').update({ nivel_vendedor_id: nivel }).eq('id', vendedor).select('id')
    if (error) {
      return { erro: `${traduzirErro('nível atual do usuário', error)} O histórico foi gravado.` }
    }
  }
  revalidatePath('/metas')
  return { ok: 'Nível registrado.' }
}
