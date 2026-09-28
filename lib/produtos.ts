/**
 * Regras puras do cadastro de produtos (página `produtos`).
 *
 * Sem acesso a banco, para serem testadas e reusadas pela tela e pelas server actions.
 * Fonte: specs/paginas/cadastros.md §4.8 (`pop.CadastroProdutos`), §9.3 e §10, e os
 * comentários das tabelas de produto em db/006_cadastro.sql.
 */

import { ehUuid } from '@/lib/clifor'

export type FiltroAtivo = 'sim' | 'nao' | 'todos'

export type FiltrosProduto = {
  q: string
  tipo: string | null
  grupo: string | null
  ativo: FiltroAtivo
  /** produto aberto na ficha — `?sel=<uuid>` */
  sel: string | null
}

/**
 * No Bubble a busca de `rpg modelo produto` (bTgcB) filtra por `Ativo` com "ignore empty":
 * sem escolha, lista tudo. O padrão aqui é o mesmo.
 */
export const FILTROS_PADRAO: FiltrosProduto = {
  q: '',
  tipo: null,
  grupo: null,
  ativo: 'todos',
  sel: null,
}

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

function uuidOuNulo(v: string): string | null {
  return ehUuid(v) ? v.toLowerCase() : null
}

/** searchParams → filtros. Valor desconhecido cai no padrão. */
export function lerFiltros(p: Params): FiltrosProduto {
  const ativo = um(p, 'ativo')
  const tipo = uuidOuNulo(um(p, 'tipo'))
  return {
    q: um(p, 'q').slice(0, 100),
    tipo,
    // Grupo sem tipo não faz sentido na tela (o select de grupo depende do tipo).
    grupo: tipo ? uuidOuNulo(um(p, 'grupo')) : null,
    ativo: ativo === 'sim' || ativo === 'nao' ? ativo : 'todos',
    sel: uuidOuNulo(um(p, 'sel')),
  }
}

/** Filtros → query string, omitindo o padrão. `mudancas` sobrescreve `atual`. */
export function paraQuery(atual: FiltrosProduto, mudancas: Partial<FiltrosProduto> = {}): string {
  const f = { ...atual, ...mudancas }
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.tipo) p.set('tipo', f.tipo)
  if (f.tipo && f.grupo) p.set('grupo', f.grupo)
  if (f.ativo !== FILTROS_PADRAO.ativo) p.set('ativo', f.ativo)
  if (f.sel) p.set('sel', f.sel)
  const s = p.toString()
  return s ? `?${s}` : ''
}

/**
 * Nome do produto como é gravado: minúsculas, sem espaço sobrando.
 * O Bubble grava `NomeModelo:to_lowercase` na criação e na edição (WF bTgeR/bTgeW e
 * bTged/bTgei); spec §9.3 manda `lower(trim())`. Espaço repetido vira um só porque a base
 * tem "palete one way  novo" com dois espaços — é o tipo de duplicata que o aviso de
 * nome parecido existe para pegar.
 */
export function normalizarNomeProduto(nome: string): string {
  return nome.replace(/\s+/g, ' ').trim().toLowerCase()
}

/** Para comparar nomes: além de normalizar, ignora acento ("aluminio" = "alumínio"). */
export function chaveNomeProduto(nome: string): string {
  return normalizarNomeProduto(nome).normalize('NFD').replace(/\p{M}/gu, '')
}

/**
 * Grupo tem de ser do tipo escolhido. No Bubble o dropdown de grupo é filtrado pelo tipo
 * (spec §4.8), mas nada impede gravar um par incoerente; no banco novo a coerência é da
 * server action (comentário de `produtos`, db/006), e é esta função que ela usa.
 */
export function grupoCombinaComTipo(grupoTipoId: string | null | undefined, tipoId: string): boolean {
  return typeof grupoTipoId === 'string' && grupoTipoId.toLowerCase() === tipoId.toLowerCase()
}

/**
 * Só filial de grupo FORNECEDOR atende produto (spec §9.5; comentário de
 * `fornecedor_produtos`, db/006). O autocomplete do Bubble (`ipt add fornecedor` bTgan)
 * filtra `TipoClifor = Fornecedor` e `Ativo = true`; aqui a mesma regra roda no servidor.
 */
export function motivoFilialInapta(filial: {
  ativo: boolean
  grupo: { tipo: string; ativo: boolean } | null
}): string | null {
  if (!filial.grupo || filial.grupo.tipo !== 'fornecedor') {
    return 'Só filial de fornecedor pode atender um produto.'
  }
  if (!filial.grupo.ativo) return 'Este fornecedor está inativo.'
  if (!filial.ativo) return 'Esta filial está inativa.'
  return null
}

/** O que ligar e o que desligar para a lista atual virar a desejada. Sem repetição. */
export function diferencaIds<T extends string | number>(
  atual: readonly T[],
  desejado: readonly T[],
): { ligar: T[]; desligar: T[] } {
  const a = new Set(atual)
  const d = new Set(desejado)
  return {
    ligar: [...d].filter((x) => !a.has(x)),
    desligar: [...a].filter((x) => !d.has(x)),
  }
}

// ------------------------------------------------------------------------- validação

export type DadosProduto = {
  nome: string
  tipo_id: string
  grupo_id: string
  descricao: string | null
  linhas: number[]
  condicoes: number[]
}

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erro: string }

function texto(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : ''
}

/** Ids de lista fixa (smallint) marcados no formulário. Qualquer coisa estranha → null. */
function idsDeLista(valores: FormDataEntryValue[]): number[] | null {
  const ids = new Set<number>()
  for (const v of valores) {
    const n = typeof v === 'string' ? Number(v) : NaN
    if (!Number.isInteger(n) || n <= 0 || n > 32767) return null
    ids.add(n)
  }
  return [...ids].sort((a, b) => a - b)
}

/** Valida o formulário do produto. Roda no SERVIDOR; o navegador só ajuda. */
export function validarProduto(form: FormData): Validacao<DadosProduto> {
  const nome = normalizarNomeProduto(texto(form.get('nome')))
  if (nome.length < 2) return { ok: false, erro: 'Informe o nome do modelo (pelo menos 2 letras).' }
  if (nome.length > 200) return { ok: false, erro: 'O nome passa de 200 caracteres.' }

  // Tipo e grupo: `mandatory=True` nos dropdowns do Bubble (spec §4.11). A carga aceitou
  // produto sem classificação; a tela não aceita.
  const tipo = texto(form.get('tipo_id'))
  if (!ehUuid(tipo)) return { ok: false, erro: 'Escolha o tipo do produto.' }
  const grupo = texto(form.get('grupo_id'))
  if (!ehUuid(grupo)) return { ok: false, erro: 'Escolha o grupo do produto.' }

  const descricao = texto(form.get('descricao'))
  if (descricao.length > 5000) return { ok: false, erro: 'A descrição passa de 5.000 caracteres.' }

  const linhas = idsDeLista(form.getAll('linhas'))
  if (!linhas) return { ok: false, erro: 'Linha inválida. Recarregue a página.' }
  const condicoes = idsDeLista(form.getAll('condicoes'))
  if (!condicoes) return { ok: false, erro: 'Condição inválida. Recarregue a página.' }

  return {
    ok: true,
    dados: {
      nome,
      tipo_id: tipo.toLowerCase(),
      grupo_id: grupo.toLowerCase(),
      descricao: descricao === '' ? null : descricao,
      linhas,
      condicoes,
    },
  }
}

/** Nome de versão (medida, acabamento): texto livre, curto, sem espaço sobrando. */
export function validarNomeVersao(bruto: FormDataEntryValue | null): Validacao<string> {
  const nome = texto(bruto).replace(/\s+/g, ' ')
  if (nome.length < 1) return { ok: false, erro: 'Informe o nome da versão.' }
  if (nome.length > 120) return { ok: false, erro: 'O nome da versão passa de 120 caracteres.' }
  return { ok: true, dados: nome }
}
