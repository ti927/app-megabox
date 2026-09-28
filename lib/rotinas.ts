/**
 * Regras puras da tela de rotinas de manutenção (db/014, specs/paginas/rotinas.md §9).
 *
 * O banco é a autoridade — `fn_rotina_recusa` valida tudo de novo e registra a recusa. O que
 * mora aqui é o que a TELA precisa para não mandar lixo e para explicar em português o que o
 * banco respondeu: montar os parâmetros a partir do formulário, conferir a confirmação digitada
 * e traduzir os motivos de recusa.
 */

import { ehUuid } from '@/lib/clifor'

export const ROTINAS_CONHECIDAS = ['sincronizar-ativo-enderecos', 'transferir-carteira'] as const
export type SlugRotina = (typeof ROTINAS_CONHECIDAS)[number]

export function ehRotinaConhecida(slug: unknown): slug is SlugRotina {
  return typeof slug === 'string' && (ROTINAS_CONHECIDAS as readonly string[]).includes(slug)
}

export type ParametrosRotina =
  | { grupo_ids: string[] }
  | { todos: true }
  | { de_vendedor_id: string; para_vendedor_id: string; grupo_ids?: string[] }

type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string }

/** Ids marcados no formulário, validados, minúsculos, sem repetição e em ordem estável. */
function idsDoForm(form: FormData, campo: string): string[] | null {
  const brutos = form.getAll(campo)
  if (brutos.some((v) => !ehUuid(v))) return null
  return [...new Set(brutos.map((v) => (v as string).toLowerCase()))].sort()
}

/**
 * Formulário → objeto `p_parametros` exatamente como `fn_rotina_recusa` aceita (D8 da 014):
 * nenhuma chave a mais, e "todos" só quando a pessoa escolheu "todos" — nunca por omissão.
 */
export function montarParametros(slug: string, form: FormData): Resultado<ParametrosRotina> {
  if (slug === 'sincronizar-ativo-enderecos') {
    const escopo = form.get('escopo')
    if (escopo === 'todos') return { ok: true, dados: { todos: true } }
    if (escopo !== 'grupos') return { ok: false, erro: 'Escolha o alcance: todos os grupos inativos ou só alguns.' }
    const ids = idsDoForm(form, 'grupo_ids')
    if (!ids) return { ok: false, erro: 'Lista de grupos inválida. Recarregue a página.' }
    if (ids.length === 0) return { ok: false, erro: 'Marque pelo menos um grupo, ou escolha "todos".' }
    return { ok: true, dados: { grupo_ids: ids } }
  }

  if (slug === 'transferir-carteira') {
    const de = form.get('de_vendedor_id')
    const para = form.get('para_vendedor_id')
    if (!ehUuid(de)) return { ok: false, erro: 'Escolha o vendedor de origem.' }
    if (!ehUuid(para)) return { ok: false, erro: 'Escolha o vendedor de destino.' }
    if (de.toLowerCase() === para.toLowerCase()) {
      return { ok: false, erro: 'Origem e destino são a mesma pessoa.' }
    }
    const ids = idsDoForm(form, 'grupo_ids')
    if (!ids) return { ok: false, erro: 'Lista de clientes inválida. Recarregue a página.' }
    const dados: ParametrosRotina = {
      de_vendedor_id: de.toLowerCase(),
      para_vendedor_id: para.toLowerCase(),
    }
    if (ids.length > 0) dados.grupo_ids = ids
    return { ok: true, dados }
  }

  return { ok: false, erro: 'Rotina desconhecida. Recarregue a página.' }
}

/**
 * Confirmação da execução real (rotinas.md §9.2 `DialogConfirmacaoRotina`): a pessoa digita o
 * identificador da rotina. Espaços nas pontas e caixa não contam (o identificador é todo
 * minúsculo); qualquer outra diferença não confere.
 */
export function confirmacaoConfere(digitado: unknown, slug: string): boolean {
  return typeof digitado === 'string' && digitado.trim().toLowerCase() === slug
}

/** Motivo da execução real (D10 da 014): obrigatório, com um mínimo de conteúdo. */
export function validarMotivo(bruto: unknown): Resultado<string> {
  const motivo = typeof bruto === 'string' ? bruto.trim() : ''
  if (motivo.length < 5) return { ok: false, erro: 'Escreva o motivo da execução (pelo menos 5 letras).' }
  if (motivo.length > 500) return { ok: false, erro: 'O motivo passou de 500 caracteres.' }
  return { ok: true, dados: motivo }
}

/**
 * Motivo de recusa/erro do banco (`fn_rotina_recusa`, `fn_rotina_rodar`) → português claro para
 * quem está na tela. Casamento por trecho: o texto do banco é a fonte, esta tabela só explica.
 */
const TRADUCOES: [RegExp, string | ((m: RegExpMatchArray) => string)][] = [
  [/simulação vencida/i, 'A simulação expirou: passaram mais de 15 minutos desde ela. Simule de novo e execute logo em seguida.'],
  [/o alvo mudou desde a simulação \(agora (\d+) linhas\)/i, (m) =>
    `Os dados mudaram depois da simulação (agora são ${m[1]} registros). Nada foi alterado — simule de novo para ver o alvo atual.`],
  [/o alvo mudou/i, 'Os dados mudaram depois da simulação. Nada foi alterado — simule de novo.'],
  [/outra rotina, de outro usuário ou com outros parâmetros/i,
    'Esta simulação foi feita com outros parâmetros (ou por outra pessoa). Simule de novo com os parâmetros que quer executar.'],
  [/já foi usada por outra execução real/i, 'Esta simulação já foi usada numa execução. Cada simulação autoriza uma execução só — simule de novo.'],
  [/não achou nada a alterar/i, 'A simulação não encontrou nada a alterar, então não há o que executar.'],
  [/não terminou bem/i, 'A simulação não terminou bem. Simule de novo.'],
  [/simulação não encontrada/i, 'A simulação não foi encontrada. Simule de novo.'],
  [/exige uma execução seca antes/i, 'É preciso simular antes de executar.'],
  [/exige motivo/i, 'Escreva o motivo da execução.'],
  [/sem a página rotinas, ou inativo/i, 'Você não tem acesso às rotinas de manutenção (ou seu usuário está inativo).'],
  [/destino deve ser usuário ativo/i, 'O destino precisa ser um usuário ativo que não seja do Financeiro nem da Operação.'],
  [/origem e destino da carteira são o mesmo/i, 'Origem e destino são a mesma pessoa.'],
  [/vendedor de origem inexistente/i, 'O vendedor de origem não existe mais. Recarregue a página.'],
  [/de_vendedor_id e para_vendedor_id são obrigatórios/i, 'Escolha o vendedor de origem e o de destino.'],
  [/grupo_ids deve ser uma lista/i, 'A lista de grupos está vazia ou inválida. Marque pelo menos um grupo.'],
  [/informe grupo_ids OU/i, 'Escolha grupos específicos ou "todos" — um dos dois.'],
  [/parâmetro desconhecido/i, 'O banco recusou um parâmetro que esta rotina não aceita. Recarregue a página.'],
  [/rotina desativada/i, 'Esta rotina está desativada.'],
  [/rotina (inexistente|sem executor)/i, 'Esta rotina não existe ou não pode ser executada nesta versão.'],
]

export function traduzirRecusa(texto: string | null | undefined): string {
  const t = texto ?? ''
  for (const [padrao, traducao] of TRADUCOES) {
    const m = t.match(padrao)
    if (m) return typeof traducao === 'string' ? traducao : traducao(m)
  }
  return t ? `O banco recusou a execução: ${t}` : 'Não foi possível executar agora. Tente de novo em instantes.'
}

/** Janela do seco (D2 da 014): quantos segundos faltam para a simulação vencer. */
export const JANELA_SECO_MS = 15 * 60 * 1000

export function segundosRestantes(fimSeco: string | null, agora: number): number {
  if (!fimSeco) return 0
  const fim = new Date(fimSeco).getTime()
  if (Number.isNaN(fim)) return 0
  return Math.max(0, Math.floor((fim + JANELA_SECO_MS - agora) / 1000))
}

const DATA_HORA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/** timestamptz → "dd/mm/aa, hh:mm" no fuso de São Paulo (igual no servidor e no navegador). */
export function formatarDataHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? '—' : DATA_HORA.format(d)
}

export const ROTULO_RISCO: Record<string, { texto: string; tom: 'ok' | 'alerta' | 'erro' }> = {
  baixo: { texto: 'Risco baixo', tom: 'ok' },
  medio: { texto: 'Risco médio', tom: 'alerta' },
  alto: { texto: 'Risco alto', tom: 'erro' },
}

export const ROTULO_STATUS: Record<string, { texto: string; tom?: 'ok' | 'alerta' | 'erro' }> = {
  ok: { texto: 'Concluída', tom: 'ok' },
  erro: { texto: 'Erro', tom: 'erro' },
  recusada: { texto: 'Recusada', tom: 'alerta' },
  rodando: { texto: 'Rodando' },
}
