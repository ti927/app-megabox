'use server'

import { revalidatePath } from 'next/cache'

import { exigirAcesso } from '@/lib/autorizacao'
import { ehUuid, escaparLike, pareceDocumento } from '@/lib/clifor'
import {
  chaveNomeProduto,
  diferencaIds,
  grupoCombinaComTipo,
  motivoFilialInapta,
  validarNomeVersao,
  validarProduto,
} from '@/lib/produtos'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { EstadoAcao, FilialEncontrada } from './tipos'

/*
 * Escrita do cadastro de produtos.
 *
 * Server action é endpoint público: cada uma repete `exigirAcesso('produtos')` e valida a
 * entrada de novo. Grava com o cliente da SESSÃO — a RLS das sete tabelas de produto
 * (escrita só para quem tem a página `produtos`, db/006; Operador não tem, db/005) é a
 * última palavra. As regras que a RLS não expressa ficam aqui: grupo coerente com o tipo
 * e "só filial de fornecedor atende produto".
 * Produto e versão nunca são apagados: desativar é `ativo = false`. As ligações (linha,
 * condição, filial) são pares puros e se desligam com DELETE (comentário das ligações, db/006).
 */

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

function traduzirErro(contexto: string, erro: { code?: string; message?: string }): string {
  console.error(`produtos: ${contexto}`, erro)
  switch (erro.code) {
    case '42501':
      return 'Você não tem permissão para gravar produtos.'
    case '23503':
      return 'Um dos valores escolhidos não existe mais. Recarregue a página.'
    case '23505':
      return 'Já existe um registro igual.'
    default:
      return 'Não foi possível gravar agora. Tente de novo em instantes.'
  }
}

function idDoForm(form: FormData, campo: string): string | null {
  const v = form.get(campo)
  return ehUuid(v) ? v.toLowerCase() : null
}

/**
 * Deixa as ligações de uma lista fixa (linhas ou condições) iguais às marcadas.
 * No Bubble são listas dentro do produto regravadas inteiras pelo "Gravar" (bTgeW/bTgei);
 * aqui são linhas de ligação, e só o que mudou é tocado.
 */
async function sincronizarLigacoes(
  supabase: Supabase,
  tabela: 'produto_linhas' | 'produto_condicoes',
  coluna: 'linha_id' | 'condicao_id',
  produtoId: string,
  desejado: number[],
  usuarioId: string,
): Promise<{ code?: string; message?: string } | null> {
  const { data, error } = await supabase.from(tabela).select(coluna).eq('produto_id', produtoId)
  if (error) return error
  const atual = (data ?? []).map((l) => (l as Record<string, number>)[coluna]!)
  const { ligar, desligar } = diferencaIds(atual, desejado)

  if (desligar.length > 0) {
    const { error: e } = await supabase
      .from(tabela)
      .delete()
      .eq('produto_id', produtoId)
      .in(coluna, desligar)
    if (e) return e
  }
  if (ligar.length > 0) {
    const { error: e } = await supabase
      .from(tabela)
      .insert(ligar.map((id) => ({ produto_id: produtoId, [coluna]: id, criado_por: usuarioId })))
    if (e) return e
  }
  return null
}

// --------------------------------------------------------------------------- produto

/**
 * Criar ou editar o produto (modelo) — WF bTgeR (novo) e bTged (edição) do
 * `pop.CadastroProdutos`, num lugar só. Nome em minúsculas, como no Bubble.
 *
 * LIMITE CONHECIDO: produto, linhas e condições são gravações separadas (o PostgREST não
 * abre transação entre chamadas). Se uma ligação falhar, o produto fica gravado e a
 * mensagem diz para tentar de novo — repetir é seguro, a sincronização só toca a diferença.
 */
export async function salvarProduto(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('produtos')
  const supabase = await clienteServidor()

  const idBruto = form.get('id')
  const id = typeof idBruto === 'string' && idBruto !== '' ? idDoForm(form, 'id') : null
  if (typeof idBruto === 'string' && idBruto !== '' && !id) {
    return { erro: 'Produto inválido. Recarregue a página.' }
  }

  const validacao = validarProduto(form)
  if (!validacao.ok) return { erro: validacao.erro }
  const dados = validacao.dados

  // Coerência tipo × grupo: a FK não garante (comentário de `produtos`, db/006).
  const { data: grupo, error: erroGrupo } = await supabase
    .from('produto_grupos')
    .select('tipo_id')
    .eq('id', dados.grupo_id)
    .maybeSingle()
  if (erroGrupo) return { erro: traduzirErro('ler grupo', erroGrupo) }
  if (!grupoCombinaComTipo(grupo?.tipo_id as string | undefined, dados.tipo_id)) {
    return { erro: 'O grupo escolhido não pertence a este tipo. Escolha o grupo de novo.' }
  }

  // Nome repetido no grupo é AVISO, não bloqueio: a base tem 11 pares (nome, grupo)
  // repetidos e o índice único só entra depois da limpeza (comentário de produtos.nome,
  // db/006; cadastros [DÚVIDA 10]). A pessoa confirma. São poucos produtos por grupo:
  // compara-se tudo, sem acento, em vez de confiar num ILIKE.
  if (form.get('confirmar_parecido') !== 'on') {
    let consulta = supabase.from('produtos').select('nome').eq('grupo_id', dados.grupo_id).limit(1000)
    if (id) consulta = consulta.neq('id', id)
    const { data: vizinhos, error } = await consulta
    if (error) return { erro: traduzirErro('conferir nome', error) }
    const alvo = chaveNomeProduto(dados.nome)
    const parecidos = (vizinhos ?? [])
      .map((v) => v.nome as string)
      .filter((n) => chaveNomeProduto(n) === alvo)
    if (parecidos.length > 0) return { parecidos: parecidos.slice(0, 3) }
  }

  const campos = {
    nome: dados.nome,
    tipo_id: dados.tipo_id,
    grupo_id: dados.grupo_id,
    descricao: dados.descricao,
  }

  let produtoId: string
  if (id) {
    const { data, error } = await supabase.from('produtos').update(campos).eq('id', id).select('id')
    if (error) return { erro: traduzirErro('editar produto', error) }
    // UPDATE barrado pela RLS não dá erro: devolve zero linhas.
    if (!data || data.length === 0) return { erro: 'Você não tem permissão para editar este produto.' }
    produtoId = id
  } else {
    const { data, error } = await supabase
      .from('produtos')
      .insert({ ...campos, ativo: true, criado_por: usuario.id })
      .select('id')
      .single()
    if (error) return { erro: traduzirErro('criar produto', error) }
    produtoId = data.id as string
  }

  const erroLinhas = await sincronizarLigacoes(
    supabase, 'produto_linhas', 'linha_id', produtoId, dados.linhas, usuario.id,
  )
  const erroCondicoes = erroLinhas
    ? null
    : await sincronizarLigacoes(
        supabase, 'produto_condicoes', 'condicao_id', produtoId, dados.condicoes, usuario.id,
      )

  revalidatePath('/produtos')
  if (erroLinhas || erroCondicoes) {
    traduzirErro('ligar linha/condição', (erroLinhas ?? erroCondicoes)!)
    return {
      erro: 'O produto foi gravado, mas as linhas ou condições não. Grave de novo.',
      id: produtoId,
    }
  }
  return { ok: id ? 'Alterações gravadas.' : 'Produto cadastrado.', id: produtoId }
}

/** Ativar/desativar o produto (switch com auto-binding na linha de `rpg modelo produto`). */
export async function definirAtivoProduto(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('produtos')
  const supabase = await clienteServidor()

  const id = idDoForm(form, 'id')
  const ativoBruto = form.get('ativo')
  if (!id || (ativoBruto !== 'true' && ativoBruto !== 'false')) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }
  const ativo = ativoBruto === 'true'

  const { data, error } = await supabase.from('produtos').update({ ativo }).eq('id', id).select('id')
  if (error) return { erro: traduzirErro('ativar produto', error) }
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar este produto.' }

  revalidatePath('/produtos')
  return { ok: ativo ? 'Produto reativado.' : 'Produto desativado.', id }
}

// --------------------------------------------------------------------------- versões

/** Criar ou renomear uma versão (medida, acabamento). Nome é único dentro do produto. */
export async function salvarVersao(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('produtos')
  const supabase = await clienteServidor()

  const produtoId = idDoForm(form, 'produto_id')
  if (!produtoId) return { erro: 'Produto inválido. Recarregue a página.' }
  const idBruto = form.get('id')
  const id = typeof idBruto === 'string' && idBruto !== '' ? idDoForm(form, 'id') : null
  if (typeof idBruto === 'string' && idBruto !== '' && !id) {
    return { erro: 'Versão inválida. Recarregue a página.' }
  }

  const nome = validarNomeVersao(form.get('nome'))
  if (!nome.ok) return { erro: nome.erro }

  if (id) {
    const { data, error } = await supabase
      .from('produto_versoes')
      .update({ nome: nome.dados })
      .eq('id', id)
      .eq('produto_id', produtoId)
      .select('id')
    if (error) {
      return { erro: error.code === '23505' ? 'Este produto já tem uma versão com esse nome.' : traduzirErro('editar versão', error) }
    }
    if (!data || data.length === 0) return { erro: 'Você não tem permissão para editar esta versão.' }
    revalidatePath('/produtos')
    return { ok: 'Versão renomeada.', id }
  }

  const { data, error } = await supabase
    .from('produto_versoes')
    .insert({ produto_id: produtoId, nome: nome.dados, ativo: true, criado_por: usuario.id })
    .select('id')
    .single()
  if (error) {
    return { erro: error.code === '23505' ? 'Este produto já tem uma versão com esse nome.' : traduzirErro('criar versão', error) }
  }
  revalidatePath('/produtos')
  return { ok: 'Versão incluída.', id: data.id as string }
}

export async function definirAtivoVersao(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('produtos')
  const supabase = await clienteServidor()

  const id = idDoForm(form, 'id')
  const ativoBruto = form.get('ativo')
  if (!id || (ativoBruto !== 'true' && ativoBruto !== 'false')) {
    return { erro: 'Pedido inválido. Recarregue a página.' }
  }
  const ativo = ativoBruto === 'true'

  const { data, error } = await supabase
    .from('produto_versoes')
    .update({ ativo })
    .eq('id', id)
    .select('id')
  if (error) return { erro: traduzirErro('ativar versão', error) }
  if (!data || data.length === 0) return { erro: 'Você não tem permissão para alterar esta versão.' }

  revalidatePath('/produtos')
  return { ok: ativo ? 'Versão reativada.' : 'Versão desativada.' }
}

// ------------------------------------------------------------ filiais de fornecedor

/**
 * Autocomplete de filial fornecedora (`ipt add fornecedor` bTgan: EnderecosCliFor com
 * TipoClifor = Fornecedor e Ativo). Leitura, mas é endpoint público como toda action:
 * exige a página e devolve só o que a lista mostra.
 */
export async function buscarFiliaisFornecedor(
  termo: string,
): Promise<{ filiais: FilialEncontrada[] } | { erro: string }> {
  await exigirAcesso('produtos')
  const supabase = await clienteServidor()

  const q = typeof termo === 'string' ? termo.trim().slice(0, 100) : ''
  if (q.length < 2) return { filiais: [] }

  const colunas =
    'id, nome_endereco, municipio, uf, ativo, grupo:grupos_clifor!inner(nome, tipo, ativo)'
  const documento = pareceDocumento(q)
  let consulta = supabase
    .from('enderecos_clifor')
    .select(colunas)
    .eq('ativo', true)
    .eq('grupo.tipo', 'fornecedor')
    .eq('grupo.ativo', true)
  consulta = documento
    ? consulta.like('documento', `%${documento}%`)
    : consulta.ilike('grupo.nome', `%${escaparLike(q)}%`)

  const { data, error } = await consulta.order('nome_endereco').limit(20)
  if (error) {
    console.error('produtos: buscar filial', error)
    return { erro: 'Não foi possível buscar agora.' }
  }

  type Linha = {
    id: string
    nome_endereco: string
    municipio: string | null
    uf: string
    grupo: { nome: string } | null
  }
  return {
    filiais: ((data ?? []) as unknown as Linha[]).map((f) => ({
      id: f.id,
      nome_endereco: f.nome_endereco,
      municipio: f.municipio,
      uf: f.uf,
      grupo_nome: f.grupo?.nome ?? '',
    })),
  }
}

/**
 * Ligar filial ao produto — WF bTgdt no Bubble (grava nos dois lados da lista). Aqui é
 * uma linha em `fornecedor_produtos`, e a regra "filial de fornecedor" é conferida AQUI
 * (comentário da tabela, db/006) — o autocomplete é só ajuda.
 */
export async function ligarFilial(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  const usuario = await exigirAcesso('produtos')
  const supabase = await clienteServidor()

  const produtoId = idDoForm(form, 'produto_id')
  const enderecoId = idDoForm(form, 'endereco_id')
  if (!produtoId || !enderecoId) return { erro: 'Escolha uma filial da lista.' }

  const { data: filial, error: erroFilial } = await supabase
    .from('enderecos_clifor')
    .select('ativo, grupo:grupos_clifor(tipo, ativo)')
    .eq('id', enderecoId)
    .maybeSingle()
  if (erroFilial) return { erro: traduzirErro('ler filial', erroFilial) }
  if (!filial) return { erro: 'Esta filial não existe mais. Busque de novo.' }
  const motivo = motivoFilialInapta(
    filial as unknown as { ativo: boolean; grupo: { tipo: string; ativo: boolean } | null },
  )
  if (motivo) return { erro: motivo }

  const { error } = await supabase
    .from('fornecedor_produtos')
    .insert({ produto_id: produtoId, endereco_fornecedor_id: enderecoId, criado_por: usuario.id })
  if (error) {
    return {
      erro: error.code === '23505' ? 'Esta filial já atende este produto.' : traduzirErro('ligar filial', error),
    }
  }
  revalidatePath('/produtos')
  return { ok: 'Filial ligada ao produto.' }
}

/** Desligar filial — WF bTgeK (operador ambíguo no mapa, cadastros [DÚVIDA 7]: é remover). */
export async function desligarFilial(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('produtos')
  const supabase = await clienteServidor()

  const produtoId = idDoForm(form, 'produto_id')
  const enderecoId = idDoForm(form, 'endereco_id')
  if (!produtoId || !enderecoId) return { erro: 'Pedido inválido. Recarregue a página.' }

  const { data, error } = await supabase
    .from('fornecedor_produtos')
    .delete()
    .eq('produto_id', produtoId)
    .eq('endereco_fornecedor_id', enderecoId)
    .select('produto_id')
  if (error) return { erro: traduzirErro('desligar filial', error) }
  if (!data || data.length === 0) return { erro: 'Esta ligação já não existe, ou você não pode alterá-la.' }

  revalidatePath('/produtos')
  return { ok: 'Filial desligada do produto.' }
}
