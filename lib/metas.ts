/**
 * Regras puras da página `metas` (fatia 8).
 *
 * O cálculo de dinheiro da meta (realizado, %, fator, comissão) é do BANCO, em `numeric`
 * (`fn_calculo_meta` / `v_meta_atingimento`, db/011). O que sobra para a tela — formatar a
 * razão como %, a meta coletiva, a régua de nível — é feito aqui em aritmética DECIMAL EXATA
 * (BigInt em escala fixa), nunca em float (CLAUDE.md regra 10). Tudo string → string.
 *
 * Fonte: specs/paginas/metas.md §5 (fórmulas citadas com o elemento do mapa).
 */

import { ehUuid } from '@/lib/clifor'
import { lerValorDigitado } from '@/lib/dinheiro'

// ------------------------------------------------------------------ decimal exato

/**
 * Decimal em texto ("123.4567", "-0.5", "12") → inteiro em escala 10^casas, arredondando
 * meio para longe do zero (o `round` do Postgres em numeric). null para lixo.
 */
export function paraEscala(valor: string | number | null | undefined, casas: number): bigint | null {
  if (valor === null || valor === undefined || valor === '') return null
  const texto = typeof valor === 'number' ? (Number.isFinite(valor) ? String(valor) : '') : valor.trim()
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(texto)
  if (!m) return null
  const negativo = m[1] === '-'
  const inteiro = m[2]!
  const frac = m[3] ?? ''
  const cabe = frac.slice(0, casas).padEnd(casas, '0')
  let n = BigInt(inteiro + cabe)
  const proximo = frac.charAt(casas)
  if (proximo !== '' && Number(proximo) >= 5) n += 1n
  return negativo ? -n : n
}

/** Inteiro em escala 10^casas → "1234.56" (sem separador de milhar; é o formato do banco). */
export function deEscala(n: bigint, casas: number): string {
  const negativo = n < 0n
  const abs = negativo ? -n : n
  const s = abs.toString().padStart(casas + 1, '0')
  const corpo = casas > 0 ? `${s.slice(0, -casas)}.${s.slice(-casas)}` : s
  return negativo && abs !== 0n ? `-${corpo}` : corpo
}

/** Divisão inteira arredondando meio para longe do zero. */
function dividirArredondando(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('divisão por zero')
  const negativo = a < 0n !== b < 0n
  const aa = a < 0n ? -a : a
  const bb = b < 0n ? -b : b
  const q = (aa * 2n + bb) / (bb * 2n)
  return negativo ? -q : q
}

/** Soma exata de valores em reais; ignora nulos. Devolve "0.00" para lista vazia. */
export function somarReais(valores: (string | number | null | undefined)[]): string {
  let total = 0n
  for (const v of valores) {
    const c = paraEscala(v, 2)
    if (c !== null) total += c
  }
  return deEscala(total, 2)
}

/** Compara dois valores em reais: -1, 0, 1. */
export function compararReais(a: string, b: string): number {
  const x = paraEscala(a, 2) ?? 0n
  const y = paraEscala(b, 2) ?? 0n
  return x < y ? -1 : x > y ? 1 : 0
}

// ------------------------------------------------------------ percentual e faixa

const NUM = (casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

/**
 * Razão (1 = 100%, como `percentual` de `v_meta_atingimento`, 4 casas) → "80,0%".
 * Exato: multiplica em escala inteira e só formata no fim — o número exibido nunca passa
 * por float. Nulo (meta 0, D9 da 011) → "—".
 */
export function formatarPercentual(razao: string | number | null | undefined, casas = 1): string {
  const r = paraEscala(razao, casas + 2) // razão com casas+2 decimais = % com `casas`
  if (r === null) return '—'
  const texto = deEscala(r, casas) // já é o percentual: 0.8000 em escala 3 = 800 → "80.0"
  const [int, frac = ''] = texto.replace('-', '').split('.')
  const inteiro = NUM(0).format(BigInt(int!))
  const sinal = r < 0n ? '-' : ''
  return `${sinal}${inteiro}${casas > 0 ? `,${frac}` : ''}%`
}

/**
 * Largura da barra: `floor(razão × 100)`, entre 0 e 100 — o `Progress-Bar A` (bTvpx), que
 * satura em 100. Inteiro; é só desenho.
 */
export function larguraBarra(razao: string | number | null | undefined): number {
  const r = paraEscala(razao, 4)
  if (r === null || r <= 0n) return 0
  const pct = r / 100n // floor, r é positivo
  return pct > 100n ? 100 : Number(pct)
}

export type Faixa = 'sem-meta' | 'baixa' | 'media' | 'batida'

/**
 * Faixa de cor do `Progress-Bar A` (bTvpx): padrão < 50%, `primary` de 50% a 100%,
 * destaque ≥ 100%. O `≥` é o do mapa: exatamente 100% já é meta batida (bTvqD).
 */
export function faixaAtingimento(razao: string | number | null | undefined): Faixa {
  const r = paraEscala(razao, 4)
  if (r === null) return 'sem-meta'
  if (r >= 10000n) return 'batida'
  if (r >= 5000n) return 'media'
  return 'baixa'
}

// -------------------------------------------------------------- meta coletiva

/**
 * Parâmetros da meta coletiva. No Bubble estão FIXOS numa condicional do `ipt meta coletiva`
 * (bTzgt0): piso 80.000 e multiplicador 1,25 (spec §5.2, §8.3.7). `config_metas` não existe
 * ainda (011, "O QUE NÃO ENTRA"; metas [DÚVIDA 16]: começar com os valores atuais) — por
 * isso ficam aqui, num lugar só, e entram como parâmetro da função.
 */
export const META_COLETIVA_PADRAO = { piso: '80000.00', multiplicador: '1.25' } as const

/**
 * Meta coletiva (bTzgt0): `M = (venda−1 + venda−2 + venda−3) ÷ 3 × 1,25`; `M < piso → piso`,
 * senão `M`. Mês sem fechamento entra como zero (as vendas vêm de metas FECHADAS, §5.2).
 *
 * Correção consciente: no Bubble as condicionais são `<` e `>` sem valor padrão, e com
 * `M = piso` exato o campo fica VAZIO (§8.3.5). Aqui o empate dá o piso.
 * Arredondamento: M ao centavo (meio para longe do zero), numa conta só.
 */
export function metaColetiva(
  vendas: (string | number | null | undefined)[],
  parametros: { piso: string; multiplicador: string } = META_COLETIVA_PADRAO,
): string {
  const soma = paraEscala(somarReais(vendas.slice(0, 3)), 2)! // centavos
  const mult = paraEscala(parametros.multiplicador, 4)! // × 10^4
  const piso = paraEscala(parametros.piso, 2)!
  // soma(cent) × mult(10^4) ÷ 3 ÷ 10^4 → centavos
  const m = dividirArredondando(soma * mult, 3n * 10000n)
  return deEscala(m < piso ? piso : m, 2)
}

// ---------------------------------------------------------------- régua de nível

/**
 * "Qtd meses p/ subir nível" e "Status nível" (spec §5.1): a média SIMPLES do realizado
 * (`TotalComissaoMegabox`) das últimas N metas fechadas (N = `qtd_meta_batida` do nível;
 * `rpg metasfechadas` bTvqX, `Ipt media` bTvqh) e "Subir Nível" quando média > meta do nível
 * E há exatamente N fechamentos (`Text L` bTvpg). É só rótulo (metas [DÚVIDA 15]).
 *
 * `ultimas` já vem na ordem da régua (mais recente primeiro); só as N primeiras contam.
 */
export function reguaNivel(
  ultimas: string[],
  n: number,
  metaVendaNivel: string | null,
): { consideradas: string[]; media: string | null; subir: boolean } {
  const consideradas = n > 0 ? ultimas.slice(0, n) : []
  if (consideradas.length === 0) return { consideradas, media: null, subir: false }
  const soma = paraEscala(somarReais(consideradas), 2)!
  const media = deEscala(dividirArredondando(soma, BigInt(consideradas.length)), 2)
  const subir =
    metaVendaNivel !== null && consideradas.length === n && compararReais(media, metaVendaNivel) > 0
  return { consideradas, media, subir }
}

// ------------------------------------------------------------------- período

const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** 'AAAA-MM-DD' válido (o calendário confere: 2026-02-30 é recusado). */
export function ehDataIso(v: unknown): v is string {
  if (typeof v !== 'string') return false
  const m = DATA_ISO.exec(v)
  if (!m) return false
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (mes < 1 || mes > 12 || d < 1) return false
  return d <= ultimoDia(a, mes)
}

function ultimoDia(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

const dois = (n: number) => String(n).padStart(2, '0')

/** 'AAAA-MM' → primeiro e último dia do mês. */
export function limitesDoMes(mes: string): { inicio: string; fim: string } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(mes)
  if (!m) return null
  const ano = Number(m[1])
  const mm = Number(m[2])
  if (mm < 1 || mm > 12) return null
  return { inicio: `${m[1]}-${m[2]}-01`, fim: `${m[1]}-${m[2]}-${dois(ultimoDia(ano, mm))}` }
}

/** Soma `n` meses a 'AAAA-MM'. */
export function somarMeses(mes: string, n: number): string {
  const [a, m] = mes.split('-').map(Number) as [number, number]
  const total = a * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${dois((total % 12) + 1)}`
}

/** Mês corrente em São Paulo (metas [DÚVIDA 2]: sem período, o mês corrente — nunca sem intervalo). */
export function mesAtual(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(agora)
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

/** 'AAAA-MM' ou data → "setembro/2026" — derivado da competência, nunca `MesNome` gravado (§8.3.19). */
export function nomeDoMes(mesOuData: string): string {
  const [a, m] = mesOuData.split('-')
  return `${MESES[Number(m) - 1] ?? '?'}/${a}`
}

// -------------------------------------------------------------------- filtros da URL

export type FiltrosMetas = {
  /** `datainicio`/`datafim` — os mesmos nomes da URL do Bubble (spec §2.3, §9.1) */
  inicio: string
  fim: string
  /** filtro de vendedor da tabela (só hierarquia ≤ 2 usa) */
  vendedor: string | null
}

type Params = Record<string, string | string[] | undefined>

function um(p: Params, chave: string): string {
  const v = p[chave]
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

/** searchParams → filtros. Período inválido ou invertido cai no mês corrente. */
export function lerFiltrosMetas(p: Params, agora: Date = new Date()): FiltrosMetas {
  const padrao = limitesDoMes(mesAtual(agora))!
  const ini = um(p, 'datainicio')
  const fim = um(p, 'datafim')
  const valido = ehDataIso(ini) && ehDataIso(fim) && ini <= fim
  const v = um(p, 'vendedor')
  return {
    inicio: valido ? ini : padrao.inicio,
    fim: valido ? fim : padrao.fim,
    vendedor: ehUuid(v) ? v.toLowerCase() : null,
  }
}

export function paraQueryMetas(atual: FiltrosMetas, mudancas: Partial<FiltrosMetas> = {}): string {
  const f = { ...atual, ...mudancas }
  const q = new URLSearchParams({ datainicio: f.inicio, datafim: f.fim })
  if (f.vendedor) q.set('vendedor', f.vendedor)
  return `?${q.toString()}`
}

// --------------------------------------------------------------- validação da meta

export type MetaValidada = {
  vendedor_id: string
  nivel_id: string
  tipo_meta_id: 1 | 2
  valor_meta: string
  periodo_inicio: string
  periodo_fim: string
}

type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string }

/**
 * Formulário da meta mensal (`pop.AddEdita MetasMensais`, WF bTwBh — no Bubble sem validação
 * nenhuma, spec §4.3). Aqui, pela spec §9.3 e pelas recomendações padrão:
 *  - todos os campos obrigatórios (eram `mandatory` no Bubble);
 *  - período = um MÊS inteiro (metas [DÚVIDA 19]: alinhado ao mês; a competência deriva dele);
 *  - valor > 0 (011 D9: o banco aceita 0, a criação não).
 */
export function validarMeta(form: FormData): Resultado<MetaValidada> {
  const texto = (c: string) => {
    const v = form.get(c)
    return typeof v === 'string' ? v.trim() : ''
  }
  const vendedor = texto('vendedor_id')
  if (!ehUuid(vendedor)) return { ok: false, erro: 'Escolha o vendedor.' }
  const nivel = texto('nivel_id')
  if (!ehUuid(nivel)) return { ok: false, erro: 'Escolha o nível.' }
  const tipo = Number(texto('tipo_meta_id'))
  if (tipo !== 1 && tipo !== 2) return { ok: false, erro: 'Escolha o tipo de meta.' }
  const periodo = limitesDoMes(texto('mes'))
  if (!periodo) return { ok: false, erro: 'Escolha o mês da meta.' }
  const valor = lerValorDigitado(texto('valor_meta'))
  if (valor === null) return { ok: false, erro: 'Informe o valor da meta.' }
  if (compararReais(valor, '0') <= 0) return { ok: false, erro: 'O valor da meta tem de ser maior que zero.' }
  if (compararReais(valor, '999999999999.99') > 0) return { ok: false, erro: 'Valor da meta grande demais.' }
  return {
    ok: true,
    dados: {
      vendedor_id: vendedor.toLowerCase(),
      nivel_id: nivel.toLowerCase(),
      tipo_meta_id: tipo,
      valor_meta: valor,
      periodo_inicio: periodo.inicio,
      periodo_fim: periodo.fim,
    },
  }
}

/**
 * Fração digitada como percentual ("7,25" → "0.0725"), para os fatores do nível. Exata:
 * divide por 100 deslocando a escala. Fora de 0..100 → null (o check do banco é 0..1, D1).
 */
export function lerPercentualDigitado(texto: string): string | null {
  const limpo = texto.replace(/[%\s]/g, '').replace(',', '.')
  const n = paraEscala(limpo, 2) // percentual com 2 casas
  if (n === null || n < 0n || n > 10000n) return null
  return deEscala(n, 4) // 7.25% em escala 2 = 725 → em fração escala 4 = "0.0725"
}
