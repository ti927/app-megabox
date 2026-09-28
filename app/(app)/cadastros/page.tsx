import type { Metadata, Route } from 'next'
import { redirect } from 'next/navigation'

import { exigirAcesso } from '@/lib/autorizacao'
import {
  escaparLike,
  faixa,
  type FiltrosClifor,
  lerFiltros,
  paraQuery,
  pareceDocumento,
  podeAlterarAtivo,
  podeEscreverTipo,
  podeTerCarteira,
} from '@/lib/clifor'
import { somenteDigitos } from '@/lib/documento'
import { podeBloquearFilial } from '@/lib/filial-contato'
import { clienteServidor } from '@/lib/supabase/servidor'

import { TelaCadastros } from './tela'
import type { Contato, Duplicado, Ficha, Filial, Grupo, LinhaGrupo, Opcoes } from './tipos'

import './cadastros.css'

export const metadata: Metadata = { title: 'Cadastros — MegaBox' }

type Supabase = Awaited<ReturnType<typeof clienteServidor>>

/**
 * Lista de grupos, paginada e filtrada NO SERVIDOR — são ~4.700 grupos.
 *
 * No Bubble a lista é um RepeatingGroup invisível de FILIAIS subindo para o grupo
 * (`rpg buscaenderecos a` bUCbF0, spec §3.1), para o filtro de UF e de CNPJ funcionar.
 * Aqui é o contrário: busca-se o grupo, e UF/CNPJ viram um `!inner` em enderecos_clifor,
 * que o PostgREST traduz em "existe filial que casa" — sem repetir o grupo.
 */
async function buscarLista(supabase: Supabase, f: FiltrosClifor) {
  const documento = pareceDocumento(f.q)
  const colunas = [
    'id, tipo, nome, ativo, liberado, criado_em',
    'carteira:usuarios!carteira_id(nome)',
    'autor:usuarios!criado_por(nome)',
    'filiais:enderecos_clifor(count)',
    // o mesmo embed, filtrado abaixo por liberado = false: quantas filiais bloqueadas
    'bloqueadas:enderecos_clifor(count)',
    'contatos:contatos_clifor(count)',
  ]
  if (f.uf || documento) colunas.push('filtro:enderecos_clifor!inner(id)')

  let consulta = supabase
    .from('grupos_clifor')
    .select(colunas.join(','), { count: 'exact' })
    .eq('tipo', f.tipo)
    .eq('bloqueadas.liberado', false)

  if (f.ativo !== 'todos') consulta = consulta.eq('ativo', f.ativo === 'sim')
  if (f.semCarteira) consulta = consulta.is('carteira_id', null)
  if (f.captacao) consulta = consulta.eq('captacao_id', f.captacao)
  if (f.uf) consulta = consulta.eq('filtro.uf', f.uf)
  if (documento) {
    consulta = consulta.like('filtro.documento', `%${documento}%`)
  } else if (f.q) {
    // TODO(busca sem acento): o índice trigrama é sobre fn_unaccent(nome), e o PostgREST
    // não aplica função na coluna filtrada. Até existir fn_clifor_busca (spec §9.4), a
    // busca é ILIKE simples: ignora maiúsculas, mas "agua" não acha "Água".
    consulta = consulta.ilike('nome', `%${escaparLike(f.q)}%`)
  }

  consulta =
    f.ordem === 'nome'
      ? consulta.order('nome').order('id')
      : consulta.order('criado_em', { ascending: false }).order('id')

  const { de, ate } = faixa(f.pagina)
  const { data, count, error } = await consulta.range(de, ate)

  // Página além do fim (a lista encolheu, ou a URL foi editada): volta para a primeira.
  if (error?.code === 'PGRST103') redirect(`/cadastros${paraQuery(f, { pagina: 1 })}` as Route)
  if (error) {
    console.error('cadastros: lista', error)
    return { linhas: [] as LinhaGrupo[], total: 0, falhou: true }
  }
  return { linhas: (data ?? []) as unknown as LinhaGrupo[], total: count ?? 0, falhou: false }
}

/**
 * "Clientes ativos: N · Fornecedores ativos: N" — no Bubble são duas buscas globais que
 * ignoram os filtros (`Text P` bUEpJ, `Text Q` bUEpP, spec §5). `head: true` só conta.
 */
async function contarAtivos(supabase: Supabase) {
  const contar = (tipo: 'cliente' | 'fornecedor') =>
    supabase
      .from('grupos_clifor')
      .select('id', { count: 'exact', head: true })
      .eq('tipo', tipo)
      .eq('ativo', true)
  const [c, f] = await Promise.all([contar('cliente'), contar('fornecedor')])
  return { clientes: c.count ?? 0, fornecedores: f.count ?? 0 }
}

async function buscarOpcoes(supabase: Supabase): Promise<Opcoes> {
  const [ufs, captacoes, usuarios, regimes, fretes] = await Promise.all([
    supabase.from('ufs').select('sigla, nome').order('sigla'),
    supabase.from('captacoes').select('id, nome').order('id'),
    supabase
      .from('usuarios')
      .select('id, nome, departamento_id')
      .eq('ativo', true)
      .order('nome'),
    supabase.from('regimes_tributarios').select('id, nome').order('id'),
    supabase.from('tipos_frete').select('id, nome').order('id'),
  ])
  return {
    ufs: ufs.data ?? [],
    captacoes: captacoes.data ?? [],
    regimes: regimes.data ?? [],
    fretes: fretes.data ?? [],
    carteiras: (usuarios.data ?? [])
      .filter((u) => podeTerCarteira(u.departamento_id))
      .map((u) => ({ id: u.id, nome: u.nome })),
  }
}

/** A ficha do grupo aberto: dados, filiais, contatos e a fila de documento repetido. */
async function buscarFicha(supabase: Supabase, id: string): Promise<Ficha | null> {
  const [grupo, filiais, contatos] = await Promise.all([
    supabase
      .from('grupos_clifor')
      .select(
        'id, tipo, nome, ativo, liberado, liberado_motivo, carteira_id, captacao_id, ' +
          'email_principal, nao_faz_contrato_parceria, observacoes, codigo_legado, ' +
          'criado_em, alterado_em, carteira:usuarios!carteira_id(nome), ' +
          'autor:usuarios!criado_por(nome), editor:usuarios!alterado_por(nome)',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('enderecos_clifor')
      .select(
        'id, nome_endereco, razao, fantasia, documento, tipo_pessoa, insc_estadual, ' +
          'insc_municipal, regime_tributario_id, cep, logradouro, numero, complemento, bairro, ' +
          'municipio, uf, ativo, liberado, liberado_motivo, principal, corporativo, frete_id, ' +
          'nome_comprador, capacidade_compra, demanda, observacoes, ' +
          'regime:regimes_tributarios(nome)',
      )
      .eq('grupo_id', id)
      .order('principal', { ascending: false })
      .order('ativo', { ascending: false })
      .order('nome_endereco'),
    supabase
      .from('contatos_clifor')
      .select(
        'id, nome, cargo, email, telefone, ativo, endereco_id, tipo_telefone_id, ' +
          'tipo_telefone:tipos_telefone(nome)',
      )
      .eq('grupo_id', id)
      .order('ativo', { ascending: false })
      .order('nome'),
  ])

  if (grupo.error) console.error('cadastros: ficha', grupo.error)
  if (!grupo.data) return null

  const listaFiliais = (filiais.data ?? []) as unknown as Filial[]

  // A view é a fila de limpeza que substitui, por ora, o índice único de documento
  // (comentário de v_clifor_documento_duplicado, db/006). Aqui só se AVISA: bloquear
  // gravação não é regra do Bubble (enderecos-e-contatos §4.4: "é só aviso").
  const documentos = [
    ...new Set(listaFiliais.map((f) => somenteDigitos(f.documento)).filter((d) => d.length > 0)),
  ]
  const duplicados: Record<string, Duplicado[]> = {}
  if (documentos.length > 0) {
    const { data } = await supabase
      .from('v_clifor_documento_duplicado')
      .select('documento, qtd_enderecos, endereco_id, nome_endereco, grupo_id, grupo_nome, grupo_tipo, ativo')
      .in('documento', documentos)
    for (const linha of (data ?? []) as Duplicado[]) {
      ;(duplicados[linha.documento] ??= []).push(linha)
    }
  }

  return {
    grupo: grupo.data as unknown as Grupo,
    filiais: listaFiliais,
    contatos: (contatos.data ?? []) as unknown as Contato[],
    duplicados,
  }
}

export default async function PaginaCadastros({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor, antes de qualquer consulta. O menu da engrenagem é cosmético.
  const usuario = await exigirAcesso('cadastros')
  const filtros = lerFiltros(await searchParams)

  // Cliente da SESSÃO: quem lê é o usuário, e a RLS decide. Nunca service_role aqui.
  const supabase = await clienteServidor()
  const [lista, contadores, opcoes, ficha] = await Promise.all([
    buscarLista(supabase, filtros),
    contarAtivos(supabase),
    buscarOpcoes(supabase),
    filtros.sel ? buscarFicha(supabase, filtros.sel) : Promise.resolve(null),
  ])

  return (
    <TelaCadastros
      filtros={filtros}
      linhas={lista.linhas}
      total={lista.total}
      falhou={lista.falhou}
      contadores={contadores}
      opcoes={opcoes}
      ficha={ficha}
      permissoes={{
        escreverFornecedor: podeEscreverTipo(usuario, 'fornecedor'),
        alterarAtivoFornecedor: podeAlterarAtivo(usuario, 'fornecedor'),
        bloquearFilial: podeBloquearFilial(usuario),
      }}
    />
  )
}
