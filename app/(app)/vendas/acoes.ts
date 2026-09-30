'use server'

import { exigirAcesso } from '@/lib/autorizacao'
import { clienteServidor } from '@/lib/supabase/servidor'
import {
  ehUuid,
  ETAPA,
  escaparLike,
  hojeSP,
  podeSerVencedor,
  validarArquivamento,
  validarCotacao,
  validarItem,
  validarOrcamento,
} from '@/lib/vendas'

import type { CarrinhoRelido } from '@/lib/vendas-ficha'

import { carrinhoAtual } from './consultas'
import { cotacaoEditavel, traduzirErro } from './regras-servidor'
import type { EstadoAcao, FornecedorParaItem } from './tipos'

/** EstadoAcao + o carrinho relido do banco (lib/vendas-ficha): a tela troca só ele. */
export type EstadoCarrinho = EstadoAcao & { carrinho?: CarrinhoRelido }

/*
 * Escrita da página de vendas: cotação, item e orçamento de fornecedor.
 *
 * Server action é endpoint público: cada uma repete `exigirAcesso('vendas')` e valida a
 * entrada de novo. Grava com o cliente da SESSÃO — a RLS (db/007: página vendas + hierarquia
 * ≤ 2 ou dono) é a última palavra. As regras daqui são as do Bubble que a RLS não expressa.
 *
 * NENHUMA action calcula dinheiro: bruto, comissão, ICMS e PIS/COFINS são colunas geradas,
 * as alíquotas vêm do trigger fn_orcamento_derivados, e o líquido de v_orcamento_valores.
 * E-mail (proposta, pedido) fica fora desta versão: a fila email_outbox só aceita escrita
 * de servidor com service_role, e o envio real ainda não existe.
 *
 * DESEMPENHO: nenhuma action daqui revalida a página. Revalidar re-renderizava layout +
 * página + a ficha inteira (propostas, pedidos, documento…) a cada clique — era o que deixava
 * "adicionar ao carrinho" e o troféu em 5–10 s e fazia a ficha cair em 57014. Quem muda o
 * carrinho devolve o carrinho relido (`carrinho`), e a tela troca só ele; o quadro é refeito
 * quando a ficha fecha (navegação sem `sel`).
 */

/** regimes_tributarios.id 1 = 'lucro_real' ("Lucro Real/Presumido"), seed fixo da 003. */
const LUCRO_REAL = 1

// ----------------------------------------------------------------------- cliente

/**
 * Autocomplete de cliente da cotação nova: clientes ATIVOS por nome (spec §2.6, "autocomplete
 * de clientes ativos"). Até 20; a busca é no servidor, a lista de 4.400 nunca vai inteira.
 */
export async function buscarClientes(q: string): Promise<{ id: string; nome: string }[]> {
  await exigirAcesso('vendas')
  const termo = typeof q === 'string' ? q.trim().slice(0, 100) : ''
  if (termo.length < 2) return []
  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from('grupos_clifor')
    .select('id, nome')
    .eq('tipo', 'cliente')
    .eq('ativo', true)
    .ilike('nome', `%${escaparLike(termo)}%`)
    .order('nome')
    .limit(20)
  if (error) {
    console.error('vendas: buscar clientes', error)
    return []
  }
  return data ?? []
}

// ----------------------------------------------------------------------- cotação

/**
 * "Gravar Cotação" (WF bTOTR0 → bTOTX0): cliente, empresa, validade, amostra, vendedor =
 * quem cria. Número, etapa (Cotação) e status (Em andamento) são defaults do banco
 * (db/007 D7/D8) — sem o "último + 1" do Bubble, sujeito a corrida.
 *
 * Diferença de fluxo, registrada: no Bubble o carrinho vive em User.TempOrcamentoProdutos
 * antes de a cotação existir. Aqui a cotação nasce primeiro (vazia) e os itens entram na
 * ficha — sem órfãos quando se cancela.
 */
export async function criarCotacao(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('vendas')
  const validacao = validarCotacao(form, hojeSP())
  if (!validacao.ok) return { erro: validacao.erro }
  const dados = validacao.dados

  const supabase = await clienteServidor()
  const { data: cliente } = await supabase
    .from('grupos_clifor')
    .select('id')
    .eq('id', dados.cliente_id)
    .eq('tipo', 'cliente')
    .eq('ativo', true)
    .maybeSingle()
  if (!cliente) return { erro: 'Cliente inativo ou inexistente. Escolha outro na lista.' }

  const { data, error } = await supabase
    .from('cotacoes')
    .insert({ ...dados, vendedor_id: usuario.id, criado_por: usuario.id })
    .select('id, numero')
    .single()
  // 23505 aqui = número repetido: a sequence não foi ajustada depois da carga (db/007 D7).
  if (error) return { erro: traduzirErro('criar cotação', error, 'Número de cotação repetido. Avise o suporte.') }

  return { ok: `Cotação nº ${data.numero} criada. Agora adicione os produtos.`, id: data.id as string }
}

/**
 * Arquivar com motivo (pop.ArquivaCotação, WF bTlDb → bTlDh) ou trocar o motivo de uma já
 * arquivada (WF bTlYI). Desarquivar limpa o motivo (WF bTaTq → bTaTv).
 */
export async function arquivarCotacao(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('vendas')
  const validacao = validarArquivamento(form)
  if (!validacao.ok) return { erro: validacao.erro }
  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from('cotacoes')
    .update({ arquivado: true, motivo_arquivamento_id: validacao.dados.motivo_id })
    .eq('id', validacao.dados.cotacao_id)
    .eq('etapa_id', ETAPA.COTACAO)
    .select('id')
  if (error) return { erro: traduzirErro('arquivar', error) }
  // UPDATE barrado pela RLS (ou fora da etapa) não dá erro: devolve zero linhas.
  if (!data || data.length === 0) return { erro: 'Não foi possível arquivar esta cotação.' }
  return { ok: 'Cotação arquivada.', id: validacao.dados.cotacao_id }
}

export async function desarquivarCotacao(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('vendas')
  const id = form.get('cotacao_id')
  if (!ehUuid(id)) return { erro: 'Cotação inválida. Recarregue a página.' }
  const supabase = await clienteServidor()
  const { data, error } = await supabase
    .from('cotacoes')
    .update({ arquivado: false, motivo_arquivamento_id: null })
    .eq('id', id)
    .select('id')
  if (error) return { erro: traduzirErro('desarquivar', error) }
  if (!data || data.length === 0) return { erro: 'Não foi possível desarquivar esta cotação.' }
  return { ok: 'Cotação desarquivada.', id }
}

// -------------------------------------------------------------------------- item

/**
 * "Adicionar produto ao carrinho" (WF bTOir0 → bTOiw0): produto, condição, linha, medida,
 * qtd e destino = endereço de entrega do cliente.
 */
export async function adicionarItem(_anterior: EstadoAcao, form: FormData): Promise<EstadoCarrinho> {
  const usuario = await exigirAcesso('vendas')
  const validacao = validarItem(form)
  if (!validacao.ok) return { erro: validacao.erro }
  const dados = validacao.dados

  const supabase = await clienteServidor()
  const r = await cotacaoEditavel(supabase, usuario, dados.cotacao_id)
  if ('erro' in r) return { erro: r.erro }

  const [produto, destino, condicao, linha] = await Promise.all([
    supabase.from('produtos').select('id, grupo_id').eq('id', dados.produto_id).eq('ativo', true).maybeSingle(),
    // O destino é um endereço ATIVO do cliente da cotação ("Endereço de entrega", spec §2.6).
    supabase
      .from('enderecos_clifor')
      .select('id')
      .eq('id', dados.endereco_destino_id)
      .eq('grupo_id', r.cotacao.cliente_id)
      .eq('ativo', true)
      .maybeSingle(),
    // Condição e linha vêm de produto.QuaisCondicoes / QuaisLinhas (spec §2.6).
    dados.condicao_id === null
      ? Promise.resolve({ data: true })
      : supabase
          .from('produto_condicoes')
          .select('produto_id')
          .eq('produto_id', dados.produto_id)
          .eq('condicao_id', dados.condicao_id)
          .maybeSingle(),
    dados.linha_id === null
      ? Promise.resolve({ data: true })
      : supabase
          .from('produto_linhas')
          .select('produto_id')
          .eq('produto_id', dados.produto_id)
          .eq('linha_id', dados.linha_id)
          .maybeSingle(),
  ])
  if (!produto.data) return { erro: 'Produto inativo ou inexistente.' }
  if (!destino.data) return { erro: 'O endereço de entrega não é deste cliente, ou está inativo.' }
  if (!condicao.data) return { erro: 'Esta condição não existe para o produto escolhido.' }
  if (!linha.data) return { erro: 'Esta linha não existe para o produto escolhido.' }

  const { error } = await supabase.from('cotacao_itens').insert({
    ...dados,
    grupo_produto_id: (produto.data as { grupo_id: string | null }).grupo_id,
    criado_por: usuario.id,
  })
  if (error) return { erro: traduzirErro('adicionar item', error) }

  return { ok: 'Produto adicionado.', id: dados.cotacao_id, carrinho: await carrinhoAtual(supabase, dados.cotacao_id) }
}

// --------------------------------------------------------------------- orçamento

type EnderecoFornecedor = {
  id: string
  nome_endereco: string
  uf: string
  municipio: string | null
  ativo: boolean
  liberado: boolean
  liberado_motivo: string | null
  regime_tributario_id: number | null
  regime: { nome: string } | null
  grupo: { id: string; nome: string; tipo: string; ativo: boolean } | null
}

/**
 * Fornecedores para orçar um item (`rpg cotacao fornecedores`, spec §3.6): endereços ativos
 * de fornecedor ativo cujo cadastro fornece o produto, MENOS os que já orçam este item.
 * Bloqueados vêm na lista (a tela mostra o motivo), mas não podem ser escolhidos.
 */
export async function fornecedoresParaItem(itemId: string): Promise<FornecedorParaItem[] | { erro: string }> {
  await exigirAcesso('vendas')
  if (!ehUuid(itemId)) return { erro: 'Item inválido. Recarregue a página.' }
  const supabase = await clienteServidor()

  const { data: item } = await supabase.from('cotacao_itens').select('produto_id').eq('id', itemId).maybeSingle()
  if (!item) return { erro: 'Este item não existe mais. Recarregue a página.' }

  const [lista, jaOrcados] = await Promise.all([
    supabase
      .from('fornecedor_produtos')
      .select(
        'endereco:enderecos_clifor!inner(id, nome_endereco, uf, municipio, ativo, liberado, liberado_motivo, ' +
          'regime_tributario_id, regime:regimes_tributarios(nome), grupo:grupos_clifor!inner(id, nome, tipo, ativo))',
      )
      .eq('produto_id', item.produto_id)
      .eq('endereco.ativo', true)
      .eq('endereco.grupo.tipo', 'fornecedor')
      .eq('endereco.grupo.ativo', true)
      .limit(500),
    supabase.from('orcamentos_fornecedor').select('endereco_origem_id').eq('cotacao_item_id', itemId),
  ])
  if (lista.error) {
    console.error('vendas: fornecedores do item', lista.error)
    return { erro: 'Não foi possível carregar os fornecedores agora.' }
  }
  const excluir = new Set((jaOrcados.data ?? []).map((o) => o.endereco_origem_id as string))
  return ((lista.data ?? []) as unknown as { endereco: EnderecoFornecedor | null }[])
    .map((l) => l.endereco)
    .filter((e): e is EnderecoFornecedor => !!e && !!e.grupo && !excluir.has(e.id))
    .map((e) => ({
      endereco_id: e.id,
      grupo_nome: e.grupo!.nome,
      nome_endereco: e.nome_endereco,
      uf: e.uf,
      municipio: e.municipio,
      regime: e.regime?.nome ?? null,
      liberado: e.liberado,
      liberado_motivo: e.liberado_motivo,
    }))
    .sort((a, b) => a.grupo_nome.localeCompare(b.grupo_nome, 'pt-BR') || a.nome_endereco.localeCompare(b.nome_endereco, 'pt-BR'))
}

/**
 * Orçamento de UMA filial de fornecedor para UM item (WF bTNrX → backend AdicionarFornecedores
 * bTNrd, que no Bubble é recursivo com +1 s por origem; aqui é uma linha por chamada).
 *
 * O que a action NÃO faz: calcular. Alíquotas vão NULAS e o trigger fn_orcamento_derivados
 * aplica a regra de bTNri/bThgz0 (Lucro Real dos dois lados → ICMS da tabela + 9,25%; senão
 * 0 e 0); bruto, comissão, ICMS e PIS/COFINS são colunas geradas.
 *
 * [DÚVIDA vendas 3] Origem Lucro Real/Presumido com destino em outro regime: o Bubble NÃO
 * cria o orçamento, em silêncio. Aqui também não cria — mas diz por quê, em vez de sumir.
 */
export async function adicionarOrcamento(_anterior: EstadoAcao, form: FormData): Promise<EstadoCarrinho> {
  const usuario = await exigirAcesso('vendas')
  const validacao = validarOrcamento(form)
  if (!validacao.ok) return { erro: validacao.erro }
  const dados = validacao.dados

  const supabase = await clienteServidor()
  const { data: item } = await supabase
    .from('cotacao_itens')
    .select('id, cotacao_id, produto_id, qtd::text, medida, linha_id, condicao_id, endereco_destino_id, destino:enderecos_clifor(regime_tributario_id)')
    .eq('id', dados.cotacao_item_id)
    .maybeSingle()
  if (!item) return { erro: 'Este item não existe mais. Recarregue a página.' }
  const it = item as unknown as {
    cotacao_id: string
    produto_id: string
    qtd: string
    medida: string | null
    linha_id: number | null
    condicao_id: number | null
    endereco_destino_id: string
    destino: { regime_tributario_id: number | null } | null
  }

  const r = await cotacaoEditavel(supabase, usuario, it.cotacao_id)
  if ('erro' in r) return { erro: r.erro }

  const [origem, fornece, jaExiste] = await Promise.all([
    supabase
      .from('enderecos_clifor')
      .select('id, grupo_id, ativo, liberado, regime_tributario_id, grupo:grupos_clifor!inner(tipo, ativo)')
      .eq('id', dados.endereco_origem_id)
      .maybeSingle(),
    supabase
      .from('fornecedor_produtos')
      .select('produto_id')
      .eq('endereco_fornecedor_id', dados.endereco_origem_id)
      .eq('produto_id', it.produto_id)
      .maybeSingle(),
    supabase
      .from('orcamentos_fornecedor')
      .select('id')
      .eq('cotacao_item_id', dados.cotacao_item_id)
      .eq('endereco_origem_id', dados.endereco_origem_id)
      .maybeSingle(),
  ])
  const o = origem.data as unknown as {
    grupo_id: string
    ativo: boolean
    liberado: boolean
    regime_tributario_id: number | null
    grupo: { tipo: string; ativo: boolean } | null
  } | null
  if (!o || !o.ativo || o.grupo?.tipo !== 'fornecedor' || !o.grupo.ativo) {
    return { erro: 'Fornecedor inativo ou inexistente.' }
  }
  // Endereço com Liberado = false não pode ser marcado (bTNrD, spec §4.3).
  if (!o.liberado) return { erro: 'Este endereço de fornecedor está bloqueado.' }
  if (!fornece.data) return { erro: 'Este fornecedor não tem o produto no cadastro.' }
  if (jaExiste.data) return { erro: 'Este fornecedor já orça este produto.' }
  if (o.regime_tributario_id === LUCRO_REAL && it.destino?.regime_tributario_id !== LUCRO_REAL) {
    return {
      erro:
        'Fornecedor Lucro Real/Presumido com cliente em outro regime: o app atual não cria este ' +
        'orçamento, e a regra de alíquotas ainda está em aberto (dúvida vendas 3).',
    }
  }

  const { error } = await supabase.from('orcamentos_fornecedor').insert({
    cotacao_item_id: dados.cotacao_item_id,
    cotacao_id: it.cotacao_id, // o trigger sobrescreve a partir do item (db/007 D6)
    fornecedor_id: o.grupo_id,
    endereco_origem_id: dados.endereco_origem_id,
    endereco_destino_id: it.endereco_destino_id,
    produto_id: it.produto_id,
    vendedor_id: r.cotacao.vendedor_id,
    qtd_venda: it.qtd, // QtdVenda = qtd do produto (bTNru0)
    medida: it.medida,
    linha_id: it.linha_id,
    condicao_id: it.condicao_id,
    valor_venda_unit: dados.valor_venda_unit,
    valor_comissao_unit: dados.valor_comissao_unit,
    tipo_frete_id: dados.tipo_frete_id,
    valor_frete: dados.valor_frete,
    criado_por: usuario.id,
  })
  if (error) return { erro: traduzirErro('adicionar orçamento', error) }

  return { ok: 'Fornecedor adicionado ao produto.', id: it.cotacao_id, carrinho: await carrinhoAtual(supabase, it.cotacao_id) }
}

/**
 * Troféu: marcar (WF bTOUP0 — desmarca o vencedor atual bTOUa0 e marca este bTOUU0) ou
 * desmarcar (bTOUI0). Um vencedor por item é garantido pelo índice um_vencedor_por_item.
 *
 * Marcar é a RPC `fn_definir_vencedor` (db/015): troca atômica, com a regra bTOUP0 no banco.
 * Etapa e arquivamento (cotacaoEditavel) continuam aqui.
 */
export async function definirVencedor(_anterior: EstadoAcao, form: FormData): Promise<EstadoCarrinho> {
  const usuario = await exigirAcesso('vendas')
  const id = form.get('orcamento_id')
  const marcar = form.get('marcar')
  if (!ehUuid(id) || (marcar !== 'true' && marcar !== 'false')) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }

  const supabase = await clienteServidor()
  const { data: orc } = await supabase
    .from('orcamentos_fornecedor')
    .select('id, cotacao_id, valor_venda_unit::text, valor_comissao_unit::text')
    .eq('id', id)
    .maybeSingle()
  if (!orc) return { erro: 'Este orçamento não existe mais. Recarregue a página.' }
  const o = orc as unknown as {
    cotacao_id: string
    valor_venda_unit: string
    valor_comissao_unit: string
  }

  const r = await cotacaoEditavel(supabase, usuario, o.cotacao_id)
  if ('erro' in r) return { erro: r.erro }

  if (marcar === 'false') {
    const { error } = await supabase.from('orcamentos_fornecedor').update({ vencedor: false }).eq('id', id)
    if (error) return { erro: traduzirErro('desmarcar vencedor', error) }
    return { ok: 'Vencedor desmarcado.', id: o.cotacao_id, carrinho: await carrinhoAtual(supabase, o.cotacao_id) }
  }

  // Pré-checagem para a mensagem sair sem ida ao banco; a regra que vale é a da função.
  if (!podeSerVencedor(o, r.cotacao.amostra)) {
    return { erro: 'Para ser vencedor, informe valor unitário e comissão unitária (mínimo R$ 0,01).' }
  }

  // Desmarca o vencedor atual do item e marca este NUMA transação (db/015 fn_definir_vencedor,
  // security invoker: a RLS decide). No Bubble eram dois passos (bTOUa0/bTOUU0), e falhar no
  // meio deixava o item sem vencedor.
  const { error } = await supabase.rpc('fn_definir_vencedor', { p_orcamento: id })
  // 23514 = a regra bTOUP0 recusou e a função desfez tudo: nada mudou (a tela desfaz o troféu
  // otimista). Os outros erros podem vir de mudança feita por outra pessoa (orçamento apagado,
  // vencedor trocado): aí vai o carrinho relido, e a tela mostra a versão do banco.
  if (error?.code === '23514') {
    return { erro: 'Para ser vencedor, informe valor unitário e comissão unitária (mínimo R$ 0,01).', id: o.cotacao_id }
  }
  const carrinho = await carrinhoAtual(supabase, o.cotacao_id)
  if (error) {
    if (error.code === 'P0002') return { erro: 'Este orçamento não existe mais.', carrinho }
    return {
      erro: traduzirErro('definir vencedor', error, 'Outro orçamento deste produto já é o vencedor.'),
      id: o.cotacao_id,
      carrinho,
    }
  }
  return { ok: 'Vencedor definido.', id: o.cotacao_id, carrinho }
}
