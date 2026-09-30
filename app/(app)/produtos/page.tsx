import type { Metadata, Route } from 'next'
import { redirect } from 'next/navigation'

import { urlsDeLinhas } from '@/lib/arquivos-lote'
import { exigirAcesso } from '@/lib/autorizacao'
import { escaparLike, faixa } from '@/lib/clifor'
import { type FiltrosProduto, lerFiltros, paraQuery } from '@/lib/produtos'
import { lerPagina, POR_PAGINA_PRODUTOS } from '@/lib/produtos-pagina'
import { FOTOS_PRODUTO, fotoDaLista } from '@/lib/produtos-fotos'
import { clienteServidor } from '@/lib/supabase/servidor'

import { TelaProdutos } from './tela'
import type { Ficha, FilialLigada, LinhaProduto, Opcoes, Produto, Versao } from './tipos'

import './produtos.css'

export const metadata: Metadata = { title: 'Produtos — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/**
 * A lista do `pop.CadastroProdutos` (`rpg modelo produto` bTgcB): Search de ProdutosModelo
 * por nome, tipo, grupo e ativo, ordenada por nome. Colunas: grupo, tipo, modelo, condição,
 * linha, qtd de fornecedores — que aqui conta a ligação POR FILIAL (fornecedor_produtos),
 * e não o campo excluído `QuaisFornecedores - deleted`, que mostrava zero (spec §5).
 *
 * Paginada NO SERVIDOR, 50 por página, como /cadastros: a lista inteira numa página só
 * passava de 8.000 px de altura.
 */
async function buscarLista(supabase: Supabase, f: FiltrosProduto, pagina: number) {
  let consulta = supabase
    .from('produtos')
    .select(
      'id, nome, ativo, tipo:produto_tipos(nome), grupo:produto_grupos(nome), ' +
        'foto_frontal_path, foto_lateral_path, foto_superior_path, foto_inferior_path, ' +
        'linhas:produto_linhas(linha_id), condicoes:produto_condicoes(condicao_id), ' +
        'fornecedores:fornecedor_produtos(count), versoes:produto_versoes(count)',
      { count: 'exact' },
    )
  if (f.tipo) consulta = consulta.eq('tipo_id', f.tipo)
  if (f.grupo) consulta = consulta.eq('grupo_id', f.grupo)
  if (f.ativo !== 'todos') consulta = consulta.eq('ativo', f.ativo === 'sim')
  // TODO(busca sem acento): mesma limitação de /cadastros — o índice trigrama é sobre
  // fn_unaccent(nome) e o PostgREST não aplica função na coluna. ILIKE simples por ora.
  if (f.q) consulta = consulta.ilike('nome', `%${escaparLike(f.q)}%`)

  const { de, ate } = faixa(pagina, POR_PAGINA_PRODUTOS)
  const { data, count, error } = await consulta.order('nome').order('id').range(de, ate)
  // Página além do fim (a lista encolheu, ou a URL foi editada): volta para a primeira.
  if (error?.code === 'PGRST103') redirect(`/produtos${paraQuery(f)}` as Route)
  if (error) {
    console.error('produtos: lista', error)
    return { linhas: [] as LinhaProduto[], total: 0, falhou: true }
  }
  return { linhas: (data ?? []) as unknown as LinhaProduto[], total: count ?? 0, falhou: false }
}

async function buscarOpcoes(supabase: Supabase): Promise<Opcoes> {
  const [tipos, grupos, linhas, condicoes] = await Promise.all([
    supabase.from('produto_tipos').select('id, nome').order('nome'),
    supabase.from('produto_grupos').select('id, nome, tipo_id').order('nome'),
    supabase.from('linhas_produto').select('id, nome').order('id'),
    supabase.from('condicoes_produto').select('id, nome').order('id'),
  ])
  return {
    tipos: tipos.data ?? [],
    grupos: grupos.data ?? [],
    linhas: linhas.data ?? [],
    condicoes: condicoes.data ?? [],
  }
}

/** Contador do topo: ativos na base inteira, ignorando os filtros (como em /cadastros). */
async function contarAtivos(supabase: Supabase) {
  const { count } = await supabase
    .from('produtos')
    .select('id', { count: 'exact', head: true })
    .eq('ativo', true)
  return count ?? 0
}

async function buscarFicha(supabase: Supabase, id: string): Promise<Ficha | null> {
  const [produto, versoes, filiais] = await Promise.all([
    supabase
      .from('produtos')
      .select(
        'id, nome, descricao, ativo, tipo_id, grupo_id, criado_em, alterado_em, ' +
          'foto_frontal_path, foto_lateral_path, foto_superior_path, foto_inferior_path, ' +
          'autor:usuarios!criado_por(nome), editor:usuarios!alterado_por(nome), ' +
          'linhas:produto_linhas(linha_id), condicoes:produto_condicoes(condicao_id)',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('produto_versoes')
      .select('id, nome, ativo')
      .eq('produto_id', id)
      .order('ativo', { ascending: false })
      .order('nome'),
    supabase
      .from('fornecedor_produtos')
      .select(
        'endereco_fornecedor_id, criado_em, endereco:enderecos_clifor(id, nome_endereco, municipio, ' +
          'uf, ativo, liberado, grupo:grupos_clifor(id, nome, tipo, ativo))',
      )
      .eq('produto_id', id),
  ])

  if (produto.error) console.error('produtos: ficha', produto.error)
  if (!produto.data) return null

  // Ordena no servidor por fornecedor e filial (o embed não ordena pelo neto).
  const listaFiliais = ((filiais.data ?? []) as unknown as FilialLigada[]).sort((a, b) => {
    const ga = a.endereco?.grupo?.nome ?? ''
    const gb = b.endereco?.grupo?.nome ?? ''
    return ga.localeCompare(gb, 'pt-BR') ||
      (a.endereco?.nome_endereco ?? '').localeCompare(b.endereco?.nome_endereco ?? '', 'pt-BR')
  })

  const p = produto.data as unknown as Produto
  const assinadas = await urlsDeLinhas(
    'produtos',
    FOTOS_PRODUTO.map((f) => ({ donoId: p.id, path: p[f.coluna] })),
  )
  const fotos: Ficha['fotos'] = {}
  for (const f of FOTOS_PRODUTO) {
    const url = p[f.coluna] ? assinadas.get(p[f.coluna]!) : undefined
    if (url) fotos[f.chave] = url
  }

  return {
    produto: p,
    fotos,
    versoes: (versoes.data ?? []) as Versao[],
    filiais: listaFiliais,
  }
}

export default async function PaginaProdutos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor. Operador não tem esta página (db/005): a RLS também barra a escrita.
  await exigirAcesso('produtos')
  const params = await searchParams
  const filtros = lerFiltros(params)
  const pagina = lerPagina(params)

  // Cliente da SESSÃO: a RLS decide. Nunca service_role aqui.
  const supabase = await clienteServidor()
  const [lista, ativos, opcoes, ficha] = await Promise.all([
    buscarLista(supabase, filtros, pagina),
    contarAtivos(supabase),
    buscarOpcoes(supabase),
    filtros.sel ? buscarFicha(supabase, filtros.sel) : Promise.resolve(null),
  ])

  // Miniatura da lista: uma foto por produto, assinadas numa chamada (lib/arquivos-lote).
  const miniaturas = lista.linhas.map((l) => ({ donoId: l.id, path: fotoDaLista(l) }))
  const assinadas = await urlsDeLinhas('produtos', miniaturas)
  const fotos: Record<string, string> = {}
  for (const m of miniaturas) {
    const url = m.path ? assinadas.get(m.path) : undefined
    if (url) fotos[m.donoId] = url
  }

  return (
    <TelaProdutos
      filtros={filtros}
      linhas={lista.linhas}
      fotos={fotos}
      total={lista.total}
      pagina={pagina}
      falhou={lista.falhou}
      ativos={ativos}
      opcoes={opcoes}
      ficha={ficha}
    />
  )
}
