import 'server-only'

import { fotosDeGrupos } from '@/lib/fotos-lote'
import type { clienteServidor } from '@/lib/supabase/servidor'
import {
  type CarrinhoRelido,
  type FichaTela,
  PARTES_FICHA,
  type ParteFicha,
  type PartesFicha,
} from '@/lib/vendas-ficha'

import type { Contato, Cotacao, Ficha, Orcamento, OpcoesFicha } from './tipos'

type Supabase = Awaited<ReturnType<typeof clienteServidor>>
type Resposta = { data: unknown; error: { message: string; code?: string } | null }

/**
 * Listas dos selects da cotação (carrinho e orçamentos) e do fluxo (prazos, formas). Pedidas UMA
 * vez pela tela (action `opcoesDaCotacaoNova`) e guardadas no cliente: antes iam em todo render
 * da ficha — 7 consultas refeitas a cada gravação. Sempre com o cliente da SESSÃO.
 */
export async function buscarOpcoesFicha(supabase: Supabase): Promise<OpcoesFicha> {
  const [grupos, produtos, condicoes, linhas, fretes, prazos, formas] = await Promise.all([
    supabase.from('produto_grupos').select('id, nome').order('nome'),
    supabase
      .from('produtos')
      .select(
        'id, nome, grupo_id, grupo:produto_grupos(nome), condicoes:produto_condicoes(condicao_id), linhas:produto_linhas(linha_id)',
      )
      .eq('ativo', true)
      .order('nome'),
    supabase.from('condicoes_produto').select('id, nome').order('id'),
    supabase.from('linhas_produto').select('id, nome').order('id'),
    supabase.from('tipos_frete').select('id, nome').order('id'),
    supabase.from('prazos_recebimento').select('id, nome').eq('ativo', true).order('dias_prazo').order('id'),
    supabase.from('formas_pagamento').select('id, nome').order('id'),
  ])
  return {
    grupos: grupos.data ?? [],
    produtos: (produtos.data ?? []) as unknown as OpcoesFicha['produtos'],
    condicoes: condicoes.data ?? [],
    linhas: linhas.data ?? [],
    fretes: fretes.data ?? [],
    prazos: prazos.data ?? [],
    formas: formas.data ?? [],
  }
}

// ======================================================================= ficha

/**
 * Uma nova tentativa para erro TRANSITÓRIO (57014 statement timeout, rede, 5xx do PostgREST).
 * Permissão (42501) e erro de consulta (PGRST*) não mudam na segunda vez: não se repete.
 */
async function comRetentativa<T extends Resposta>(consulta: () => PromiseLike<T>): Promise<T> {
  const r = await consulta()
  if (!r.error) return r
  const code = r.error.code ?? ''
  if (code === '42501' || code.startsWith('PGRST') || code.startsWith('22') || code.startsWith('42')) return r
  await new Promise((ok) => setTimeout(ok, 150))
  return consulta()
}

/** Colunas de `v_orcamento_valores` (db/007): os derivados já calculados pelo banco. */
const COLUNAS_VALORES =
  'id, cotacao_item_id, valor_venda_unit::text, valor_comissao_unit::text, valor_frete::text, ' +
  'tipo_frete_id, aliquota_icms::text, aliquota_pis_cofins::text, valor_venda_bruto::text, ' +
  'valor_comissao_bruto::text, valor_icms::text, valor_pis_cofins::text, valor_tributos::text, ' +
  'valor_venda_liquido::text, valor_unit_liquido::text, vencedor'

const SELECT_CABECALHO =
  'id, numero, criado_em, data_validade, amostra, arquivado, etapa_id, vendedor_id, cliente_id, ' +
  'empresa_emissora_id, rascunho, ' +
  'cliente:grupos_clifor(nome), vendedor:usuarios!vendedor_id(nome), ' +
  'empresa:empresas_emissoras(nome), status:cotacao_status(nome), etapa:etapas(nome), ' +
  'motivo:motivos_arquivamento(nome)'

type ContatoBruto = { id: string; grupo_id: string; nome: string; email: string | null; ativo: boolean | null }
type EnderecoBruto = { id: string; nome_endereco: string; uf: string; municipio: string | null; principal: boolean | null; ativo: boolean | null }

/** Junta os resultados de uma parte que precisa de mais de uma consulta. */
function juntar(rs: Resposta[], montar: () => unknown): Resposta {
  const erro = rs.find((r) => r.error)?.error ?? null
  return erro ? { data: null, error: erro } : { data: montar(), error: null }
}

/**
 * Cada parte da ficha é UMA ida ao banco (ou duas em paralelo) e depende SÓ do id da cotação —
 * nada espera o cabeçalho. Antes eram três ondas em série (cabeçalho → 9 consultas → contatos);
 * agora é uma. Destinos, contatos e empresa chegam por embed a partir da cotação/orçamentos.
 */
const CONSULTAS: Record<ParteFicha, (s: Supabase, id: string) => Promise<Resposta>> = {
  async itens(s, id) {
    return s
      .from('cotacao_itens')
      .select(
        'id, qtd::text, medida, produto_id, condicao_id, linha_id, endereco_destino_id, ' +
          'produto:produtos(nome, grupo_id), condicao:condicoes_produto(nome), ' +
          'linha:linhas_produto(nome), destino:enderecos_clifor(nome_endereco, uf, municipio)',
      )
      .eq('cotacao_id', id)
      .order('criado_em')
      .order('id')
  },

  async orcamentos(s, id) {
    const [valores, nomes] = await Promise.all([
      s.from('v_orcamento_valores').select(COLUNAS_VALORES).eq('cotacao_id', id).order('id'),
      s
        .from('orcamentos_fornecedor')
        .select(
          'id, criado_em, fornecedor:grupos_clifor(nome), frete:tipos_frete(nome), ' +
            'origem:enderecos_clifor!endereco_origem_id(nome_endereco, uf, regime:regimes_tributarios(nome))',
        )
        .eq('cotacao_id', id),
    ])
    return juntar([valores, nomes], () => {
      type Nomes = { id: string; criado_em: string; fornecedor: { nome: string } | null; frete: { nome: string } | null; origem: Orcamento['origem'] }
      const porId = new Map(((nomes.data ?? []) as unknown as Nomes[]).map((n) => [n.id, n]))
      const chegada = (x: string) => porId.get(x)?.criado_em ?? ''
      return ((valores.data ?? []) as unknown as Omit<Orcamento, 'fornecedor_nome' | 'origem' | 'frete_nome'>[])
        // ordem de chegada, como a lista do Bubble (QuaisOrcamentosForncededores)
        .sort((a, b) => chegada(a.id).localeCompare(chegada(b.id)) || a.id.localeCompare(b.id))
        .map((v) => {
          const n = porId.get(v.id)
          return { ...v, fornecedor_nome: n?.fornecedor?.nome ?? '—', origem: n?.origem ?? null, frete_nome: n?.frete?.nome ?? '—' }
        })
    })
  },

  // Endereços ATIVOS do cliente (destino do item): embed a partir da cotação, sem esperar o
  // cabeçalho para saber o cliente. Principal primeiro, depois por nome — como antes.
  async destinos(s, id) {
    const r = await s
      .from('cotacoes')
      .select('cliente:grupos_clifor(enderecos:enderecos_clifor(id, nome_endereco, uf, municipio, principal, ativo))')
      .eq('id', id)
      .maybeSingle()
    return juntar([r], () =>
      (((r.data as { cliente: { enderecos: EnderecoBruto[] } | null } | null)?.cliente?.enderecos ?? []) as EnderecoBruto[])
        .filter((e) => e.ativo !== false)
        .sort((a, b) => Number(!!b.principal) - Number(!!a.principal) || a.nome_endereco.localeCompare(b.nome_endereco, 'pt-BR'))
        .map(({ id: i, nome_endereco, uf, municipio }) => ({ id: i, nome_endereco, uf, municipio })),
    )
  },

  // Agenda de contatos (bTPJB, bTbnk, bTcZi): contatos ATIVOS com e-mail do cliente e dos
  // fornecedores orçados. É daqui que sai o destinatário: a action relê pelo id, no banco.
  async contatos(s, id) {
    const sel = 'contatos:contatos_clifor(id, grupo_id, nome, email, ativo)'
    const [cli, forn] = await Promise.all([
      s.from('cotacoes').select(`cliente:grupos_clifor(${sel})`).eq('id', id).maybeSingle(),
      s.from('orcamentos_fornecedor').select(`fornecedor:grupos_clifor(${sel})`).eq('cotacao_id', id),
    ])
    return juntar([cli, forn], () => {
      const todos: ContatoBruto[] = [
        ...(((cli.data as { cliente: { contatos: ContatoBruto[] } | null } | null)?.cliente?.contatos ?? []) as ContatoBruto[]),
        ...((forn.data ?? []) as unknown as { fornecedor: { contatos: ContatoBruto[] } | null }[]).flatMap((o) => o.fornecedor?.contatos ?? []),
      ]
      const vistos = new Map<string, Contato>()
      for (const c of todos) {
        if (c.ativo === false || !c.email || c.email.trim() === '' || vistos.has(c.id)) continue
        vistos.set(c.id, { id: c.id, grupo_id: c.grupo_id, nome: c.nome, email: c.email })
      }
      return [...vistos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).slice(0, 500)
    })
  },

  async propostas(s, id) {
    return s
      .from('propostas')
      .select(
        'id, numero, enviada, enviada_em, criado_em, data_prev_entrega, condicao_pagamento, ' +
          'info_adicional, emails_copia, corpo_email, enviar_para_contato_id, faturar_para_endereco_id, ' +
          'vendedor:usuarios!vendedor_id(nome), ' +
          'itens:proposta_itens(id, qtd::text, valor_venda_unit::text, valor_frete::text, ' +
          'orcamento:orcamentos_fornecedor(id, fornecedor_id, produto:produtos(nome), fornecedor:grupos_clifor(nome))), ' +
          // cabeçalho do documento (bTace…bTacl, bTziU)
          'faturar:enderecos_clifor!faturar_para_endereco_id(documento, municipio, uf, grupo:grupos_clifor(nome)), ' +
          'contato:contatos_clifor!enviar_para_contato_id(nome, telefone), ' +
          'fornecedor_cnpj:enderecos_clifor!cnpj_fornecedor_endereco_id(documento, razao)',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false })
  },

  async pedidos(s, id) {
    return s
      .from('pedidos')
      .select(
        'id, numero, criado_em, etapa_id, formalizado, formalizado_em, finalizado, motivo_cancelamento, ' +
          'ordem_compra_numero, info_adicional, proposta_id, forma_pagamento_id, contato_cliente_id, ' +
          'contato_fornecedor_id, emails_copia_cliente, emails_copia_fornecedor, corpo_email_cliente, ' +
          'corpo_email_fornecedor, proposta:propostas(numero), forma:formas_pagamento(nome), etapa:etapas(nome), ' +
          'prazos:pedido_prazos(prazo_id)',
      )
      .eq('cotacao_id', id)
      .order('criado_em', { ascending: false })
  },

  // Tabela, não a view do kanban: a ficha precisa de NF, motivo e arquivos, e não do join
  // de nomes. A RLS de entregas (009) decide o que aparece.
  async entregas(s, id) {
    return s
      .from('entregas')
      .select(
        'id, pedido_id, orcamento_fornecedor_id, status_id, qtd::text, dt_prev_entrega, dt_entrega, ' +
          'saiu_entrega, nao_emite_nf, nf_fornecedor_numero, dt_emissao_nf, nota_boleto_enviada, ' +
          'motivo_cancelamento, valor_venda_bruto::text, valor_comissao::text, valor_venda_liquido::text, ' +
          'vendedor_substituto_id, arquivos:entrega_arquivos(id, tipo, nome_arquivo, path, enviado_em)',
      )
      .eq('cotacao_id', id)
      .order('dt_prev_entrega', { ascending: true, nullsFirst: false })
      .order('criado_em')
  },

  // Documento da proposta (db/024): bruto do item e total somados no banco.
  async documentoItens(s, id) {
    return s
      .from('v_proposta_documento_itens')
      .select(
        'id, proposta_id, qtd::text, valor_venda_unit::text, valor_frete::text, aliquota_icms::text, ' +
          'aliquota_pis_cofins::text, medida, produto_nome, condicao_nome, linha_nome, frete_nome, ' +
          'fornecedor_nome, destino_municipio, destino_uf, valor_total_bruto::text, ' +
          'valor_unit_liquido::text, total_proposta::text',
      )
      .eq('cotacao_id', id)
      .order('criado_em')
      .order('id')
  },

  async empresaEmissora(s, id) {
    const r = await s.from('cotacoes').select('empresa:empresas_emissoras(id, nome, email, telefone)').eq('id', id).maybeSingle()
    return juntar([r], () => (r.data as { empresa: Ficha['empresaEmissora'] } | null)?.empresa ?? null)
  },
}

/**
 * As partes pedidas, todas em paralelo e cada uma com uma retentativa. Parte que falhou volta
 * VAZIA e listada em `falhas` — a tela mantém o valor bom que já tinha (lib/vendas-ficha).
 */
export async function buscarPartes(
  supabase: Supabase,
  id: string,
  partes: readonly ParteFicha[],
): Promise<{ partes: PartesFicha; falhas: ParteFicha[] }> {
  const pedidas = [...new Set(partes)]
  const rs = await Promise.all(pedidas.map((p) => comRetentativa(() => CONSULTAS[p](supabase, id))))
  const out: Record<string, unknown> = {}
  const falhas: ParteFicha[] = []
  pedidas.forEach((p, i) => {
    const r = rs[i]!
    if (r.error) {
      console.error(`vendas: ficha (${p})`, r.error)
      falhas.push(p)
    }
    out[p] = r.error ? VAZIO[p] : r.data ?? VAZIO[p]
  })
  return { partes: out as PartesFicha, falhas }
}

/** Carrinho relido depois de uma gravação: itens e orçamentos (os derivados vêm do banco). */
export async function carrinhoAtual(supabase: Supabase, cotacaoId: string): Promise<CarrinhoRelido> {
  return { cotacaoId, ...(await buscarPartes(supabase, cotacaoId, ['itens', 'orcamentos'])) }
}

const VAZIO: Record<ParteFicha, unknown> = {
  itens: [],
  orcamentos: [],
  destinos: [],
  contatos: [],
  propostas: [],
  pedidos: [],
  entregas: [],
  documentoItens: [],
  empresaEmissora: null,
}

/**
 * A ficha da cotação aberta. `null` = não existe OU a RLS não deixa ver (mesma resposta);
 * `'erro'` = o cabeçalho não carregou nem na segunda tentativa (timeout) — a tela oferece
 * "Tentar de novo" em vez de dizer que a cotação não existe.
 */
export async function buscarFicha(
  supabase: Supabase,
  id: string,
  partes: readonly ParteFicha[] = PARTES_FICHA,
): Promise<FichaTela | 'erro' | null> {
  const cabecalho = comRetentativa(() => supabase.from('cotacoes').select(SELECT_CABECALHO).eq('id', id).maybeSingle())
  // A foto só precisa do cliente: sai logo depois do cabeçalho, junto com as partes.
  const foto = cabecalho.then(async (r) => {
    const c = r.data as { cliente_id: string } | null
    return c ? ((await fotosDeGrupos([c.cliente_id])).get(c.cliente_id) ?? null) : null
  })
  const [cab, lidas, clienteFoto] = await Promise.all([cabecalho, buscarPartes(supabase, id, partes), foto])
  if (cab.error) {
    console.error('vendas: ficha (cabeçalho)', cab.error)
    return 'erro'
  }
  if (!cab.data) return null

  const pendentes = PARTES_FICHA.filter((p) => !partes.includes(p))
  return {
    ...(VAZIO as unknown as Pick<Ficha, ParteFicha>),
    ...lidas.partes,
    cotacao: cab.data as unknown as Cotacao,
    clienteFoto,
    incompleta: lidas.falhas.length > 0,
    falhas: lidas.falhas,
    pendentes,
  }
}
