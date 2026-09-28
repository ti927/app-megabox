/**
 * Regras puras do cadastro de clientes e fornecedores (página `cadastros`).
 *
 * Sem acesso a banco, para serem testadas e reusadas pela tela e pelas server actions.
 * A fonte de cada regra é specs/paginas/cadastros.md, citada por seção e por WF.
 */

import type { UsuarioAtual } from '@/lib/autorizacao'

export type TipoClifor = 'cliente' | 'fornecedor'
export type FiltroAtivo = 'sim' | 'nao' | 'todos'
export type Ordem = 'recente' | 'nome'

export type FiltrosClifor = {
  tipo: TipoClifor
  q: string
  ativo: FiltroAtivo
  uf: string | null
  semCarteira: boolean
  captacao: number | null
  ordem: Ordem
  pagina: number
  /** grupo aberto na ficha — `?sel=<uuid>` (spec §9.1; no Bubble não há link para cliente) */
  sel: string | null
}

export const POR_PAGINA = 50

/**
 * Padrões iguais aos da tela do Bubble hoje (design/capturas/cadastros-03): lista de
 * Cliente, ordem "Recente" e filtro de ativo em "Todos".
 */
export const FILTROS_PADRAO: FiltrosClifor = {
  tipo: 'cliente',
  q: '',
  ativo: 'todos',
  uf: null,
  semCarteira: false,
  captacao: null,
  ordem: 'recente',
  pagina: 1,
  sel: null,
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function ehUuid(valor: unknown): valor is string {
  return typeof valor === 'string' && UUID.test(valor)
}

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

/**
 * searchParams → filtros. Tudo que vem da URL é entrada do usuário: valor desconhecido
 * cai no padrão em vez de virar erro ou ir cru para a consulta.
 */
export function lerFiltros(p: Params): FiltrosClifor {
  const tipo = um(p, 'tipo')
  const ativo = um(p, 'ativo')
  const ordem = um(p, 'ordem')
  const uf = um(p, 'uf').toUpperCase()
  const captacao = Number(um(p, 'captacao'))
  const pagina = Number(um(p, 'pagina'))
  const sel = um(p, 'sel')

  const resultado: FiltrosClifor = {
    tipo: tipo === 'fornecedor' ? 'fornecedor' : 'cliente',
    q: um(p, 'q').slice(0, 100),
    ativo: ativo === 'sim' || ativo === 'nao' ? ativo : 'todos',
    uf: /^[A-Z]{2}$/.test(uf) ? uf : null,
    semCarteira: um(p, 'semCarteira') === '1',
    captacao: Number.isInteger(captacao) && captacao > 0 && captacao < 1000 ? captacao : null,
    ordem: ordem === 'nome' ? 'nome' : 'recente',
    pagina: Number.isInteger(pagina) && pagina > 1 && pagina < 100_000 ? pagina : 1,
    sel: ehUuid(sel) ? sel.toLowerCase() : null,
  }
  // Fornecedor não tem carteira (check carteira_so_cliente, db/006): o filtro não se aplica.
  if (resultado.tipo === 'fornecedor') resultado.semCarteira = false
  return resultado
}

/**
 * Filtros → query string, omitindo o que é padrão, para a URL ficar curta e o link
 * compartilhável. `mudancas` sobrescreve `atual`.
 */
export function paraQuery(atual: FiltrosClifor, mudancas: Partial<FiltrosClifor> = {}): string {
  const f = { ...atual, ...mudancas }
  const p = new URLSearchParams()
  if (f.tipo !== FILTROS_PADRAO.tipo) p.set('tipo', f.tipo)
  if (f.q) p.set('q', f.q)
  if (f.ativo !== FILTROS_PADRAO.ativo) p.set('ativo', f.ativo)
  if (f.uf) p.set('uf', f.uf)
  if (f.semCarteira && f.tipo === 'cliente') p.set('semCarteira', '1')
  if (f.captacao) p.set('captacao', String(f.captacao))
  if (f.ordem !== FILTROS_PADRAO.ordem) p.set('ordem', f.ordem)
  if (f.pagina > 1) p.set('pagina', String(f.pagina))
  if (f.sel) p.set('sel', f.sel)
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** Intervalo inclusivo para `.range(de, ate)` do supabase-js. */
export function faixa(pagina: number, porPagina = POR_PAGINA) {
  const de = (Math.max(1, pagina) - 1) * porPagina
  return { de, ate: de + porPagina - 1 }
}

export function totalPaginas(total: number, porPagina = POR_PAGINA) {
  return Math.max(1, Math.ceil(total / porPagina))
}

/** Escapa `%`, `_` e `\` para o texto digitado ser literal dentro de um ILIKE. */
export function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`)
}

/**
 * Se o texto buscado parece CNPJ/CPF, devolve os dígitos. É o "Busca Cnpj" do Bubble
 * (spec §3.1) sem obrigar a pessoa a escolher o modo: quem digita "12.345" quer
 * documento, quem digita "agua" quer nome.
 */
export function pareceDocumento(q: string): string | null {
  const t = q.trim()
  if (!/^[\d.\-/\s]+$/.test(t)) return null
  const d = t.replace(/\D/g, '')
  return d.length >= 4 ? d : null
}

/**
 * Forma canônica de um nome para comparar: sem acento, sem caixa, sem espaço sobrando.
 * A base legada tem nome com espaço no fim ("LOJA X ") — comparar cru deixaria passar
 * a duplicata que o aviso de nome parecido existe para pegar.
 */
export function normalizarNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// ------------------------------------------------------------------------ permissões

const DEPTO_FINANCEIRO = 2
const DEPTO_OPERACAO = 4

/**
 * Criar ou editar FORNECEDOR: Diretor, Gerente, Analista ou departamento Financeiro.
 * É a regra da página `cadastros` (condicional de `btn novo fornecedor` bUCYe0). O popup
 * antigo não incluía Analista; spec §10 [DÚVIDA 2] manda valer a página.
 * Cliente não tem restrição além do acesso à página (spec §1).
 */
export function podeEscreverTipo(u: UsuarioAtual, tipo: TipoClifor): boolean {
  if (tipo === 'cliente') return true
  return u.perfilId <= 3 || u.departamentoId === DEPTO_FINANCEIRO
}

/**
 * Ativar/inativar: fornecedor só com hierarquia <= 2 (Diretor/Gerente) — `Switch A` de
 * `gp ativo` fica travado para perfil > 2 quando é fornecedor (bUCXd0). Cliente, qualquer um.
 */
export function podeAlterarAtivo(u: UsuarioAtual, tipo: TipoClifor): boolean {
  if (tipo === 'cliente') return true
  return u.perfilId <= 2
}

/**
 * Quem pode ser dono de carteira: usuários ativos exceto Financeiro e Operação
 * (`Dropdown B` bUCXK0 da página; spec §10 [DÚVIDA 3] manda valer a página).
 */
export function podeTerCarteira(departamentoId: number): boolean {
  return departamentoId !== DEPTO_FINANCEIRO && departamentoId !== DEPTO_OPERACAO
}

// ------------------------------------------------------------------------- validação

export type DadosGrupo = {
  tipo: TipoClifor
  nome: string
  carteira_id: string | null
  captacao_id: number | null
  email_principal: string | null
  nao_faz_contrato_parceria: boolean
  observacoes: string | null
}

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erro: string }

function texto(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : ''
}

function opcional(v: FormDataEntryValue | null): string | null {
  const t = texto(v)
  return t === '' ? null : t
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Valida o formulário do grupo. Roda no SERVIDOR; o navegador só ajuda. */
export function validarGrupo(form: FormData): Validacao<DadosGrupo> {
  const tipoBruto = texto(form.get('tipo'))
  if (tipoBruto !== 'cliente' && tipoBruto !== 'fornecedor') {
    return { ok: false, erro: 'Escolha se é cliente ou fornecedor.' }
  }
  const tipo: TipoClifor = tipoBruto

  // Espaços repetidos viram um só: "MEGA  BOX" e "MEGA BOX" não podem ser dois nomes.
  const nome = texto(form.get('nome')).replace(/\s+/g, ' ')
  if (nome.length < 2) return { ok: false, erro: 'Informe o nome (pelo menos 2 letras).' }
  if (nome.length > 200) return { ok: false, erro: 'O nome passa de 200 caracteres.' }

  const carteiraBruta = opcional(form.get('carteira_id'))
  if (carteiraBruta && !ehUuid(carteiraBruta)) {
    return { ok: false, erro: 'Vendedor da carteira inválido.' }
  }

  const captacaoBruta = opcional(form.get('captacao_id'))
  const captacao = captacaoBruta === null ? null : Number(captacaoBruta)
  if (captacao !== null && (!Number.isInteger(captacao) || captacao <= 0)) {
    return { ok: false, erro: 'Captação inválida.' }
  }

  const email = opcional(form.get('email_principal'))?.toLowerCase() ?? null
  if (email && (!EMAIL.test(email) || email.length > 200)) {
    return { ok: false, erro: 'E-mail principal inválido.' }
  }

  const observacoes = opcional(form.get('observacoes'))
  if (observacoes && observacoes.length > 2000) {
    return { ok: false, erro: 'Observações passam de 2.000 caracteres.' }
  }

  return {
    ok: true,
    dados: {
      tipo,
      nome,
      // Fornecedor não tem carteira (check carteira_so_cliente) nem histórico de conversa;
      // cliente não tem contrato de parceria (spec §4.1, tabela Cliente × Fornecedor).
      carteira_id: tipo === 'cliente' ? (carteiraBruta?.toLowerCase() ?? null) : null,
      captacao_id: captacao,
      email_principal: email,
      nao_faz_contrato_parceria:
        tipo === 'fornecedor' && form.get('nao_faz_contrato_parceria') === 'on',
      observacoes,
    },
  }
}
