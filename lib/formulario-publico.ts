/**
 * Regras puras do formulário público de pesquisa (NPS / SAC / pós-venda).
 *
 * Sem segredo, sem banco, sem `node:crypto`: pode ir para o navegador (a tela usa as
 * perguntas e a validação das notas para a UX). A parte de servidor — hash do token e do
 * IP — está em `lib/formulario-publico-servidor.ts`.
 *
 * O banco é a autoridade: `fn_pesquisa_responder` (db/013) valida formato, prazo, uso
 * único e notas por tipo de novo. O que está aqui só evita ida e volta inútil e dá
 * mensagem clara ao cliente.
 */

// ------------------------------------------------------------------------------ token

/**
 * 32 bytes aleatórios em base64url sem padding = 43 caracteres. É o mesmo teste que
 * `fn_pesquisa_responder` faz antes de consultar (db/013). Fora disso, nem se consulta.
 */
const FORMATO_TOKEN = /^[A-Za-z0-9_-]{43}$/

export function tokenComFormatoValido(token: unknown): token is string {
  return typeof token === 'string' && FORMATO_TOKEN.test(token)
}

// --------------------------------------------------------------------- tipos e perguntas

/** `tipos_pesquisa` (db/003): 1 SAC | 2 NPS | 3 Pós-Venda. */
export type TipoPesquisa = 1 | 2 | 3

export type CampoNota = 'nota_nps' | 'nota_atendimento' | 'nota_produto'

export type Pergunta = { campo: CampoNota; texto: string }

/**
 * Textos do Bubble (specs/paginas/formularios-publicos.md §2.1/§2.2):
 * - NPS (formularionps, bUDfV): "…nosso serviço?" → `nota_nps`;
 * - Pós-venda (formulariovenda, bUEHM0/bUELC0): atendimento e produto.
 * SAC (tipo 1) não tem página no Bubble (§8.1: "Opt.TipoPesquisa.SAC: nenhuma das páginas
 * grava"); `fn_pesquisa_responder` exige ao menos uma nota. Adotado: uma pergunta de
 * atendimento — é o que um chamado de SAC avalia.
 */
const PERGUNTAS: Record<TipoPesquisa, Pergunta[]> = {
  1: [
    {
      campo: 'nota_atendimento',
      texto: 'Em uma escala de 0 a 10, qual nota você atribui para o nosso atendimento?',
    },
  ],
  2: [
    {
      campo: 'nota_nps',
      texto: 'Em uma escala de 0 a 10, qual nota você atribui para o nosso serviço?',
    },
  ],
  3: [
    {
      campo: 'nota_atendimento',
      texto: 'Em uma escala de 0 a 10, qual nota você atribui para o nosso atendimento?',
    },
    {
      campo: 'nota_produto',
      texto: 'Em uma escala de 0 a 10, qual nota você atribui para a qualidade do produto?',
    },
  ],
}

export function ehTipoPesquisa(valor: unknown): valor is TipoPesquisa {
  return valor === 1 || valor === 2 || valor === 3
}

export function perguntasDoTipo(tipo: TipoPesquisa): Pergunta[] {
  return PERGUNTAS[tipo]
}

// ------------------------------------------------------------------------ notas e texto

export const COMENTARIO_MAX = 2000
/** `pesquisa_respostas.user_agent` tem check de 500 (db/013). */
export const USER_AGENT_MAX = 500

export type Notas = Partial<Record<CampoNota, number>>

/**
 * Lê uma nota do formulário. Vazio → null (não respondida); inteiro 0..10 → número;
 * qualquer outra coisa → 'invalida'. Não aceita "7.0", " 7", "1e1": só dígitos.
 */
export function lerNota(valor: unknown): number | null | 'invalida' {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor !== 'string' || !/^\d{1,2}$/.test(valor)) return 'invalida'
  const n = Number(valor)
  return n >= 0 && n <= 10 ? n : 'invalida'
}

export type ValidacaoNotas =
  | { ok: true; notas: Notas }
  | { ok: false; faltando: CampoNota[] }

/**
 * Só as notas das perguntas do tipo entram; campo estranho mandado pelo navegador é
 * ignorado (não chega ao banco). Toda pergunta do tipo é obrigatória.
 */
export function validarNotas(
  tipo: TipoPesquisa,
  entrada: Partial<Record<CampoNota, unknown>>,
): ValidacaoNotas {
  const notas: Notas = {}
  const faltando: CampoNota[] = []
  for (const { campo } of perguntasDoTipo(tipo)) {
    const nota = lerNota(entrada[campo])
    if (typeof nota === 'number') notas[campo] = nota
    else faltando.push(campo)
  }
  return faltando.length ? { ok: false, faltando } : { ok: true, notas }
}

/** Comentário: apara, vazio vira null, acima do limite é recusado (não truncado em silêncio). */
export function lerComentario(valor: unknown): string | null | 'longo' {
  if (typeof valor !== 'string') return null
  // O navegador envia quebra de linha de textarea como \r\n, mas o maxlength dela conta \n
  // como 1: sem normalizar, um texto no limite da tela passaria do limite aqui.
  const texto = valor.replace(/\r\n?/g, '\n').trim()
  if (!texto) return null
  // Conta caracteres como o Postgres (char_length conta code points, não UTF-16).
  return [...texto].length > COMENTARIO_MAX ? 'longo' : texto
}

// --------------------------------------------------------------- resultados e mensagens

/** O que `fn_pesquisa_responder` devolve (db/013). */
export type ResultadoBanco = 'ok' | 'invalido' | 'expirado' | 'respondido' | 'dados_invalidos'

/** O que a server action devolve à tela: o do banco mais o que nasce antes dele. */
export type ResultadoEnvio = ResultadoBanco | 'limite' | 'erro'

const RESULTADOS_BANCO: readonly string[] = [
  'ok',
  'invalido',
  'expirado',
  'respondido',
  'dados_invalidos',
]

/** Resposta desconhecida do banco é tratada como erro, nunca como sucesso. */
export function lerResultadoBanco(valor: unknown): ResultadoEnvio {
  return typeof valor === 'string' && RESULTADOS_BANCO.includes(valor)
    ? (valor as ResultadoBanco)
    : 'erro'
}

/**
 * Mensagem ao cliente. `invalido` é UMA mensagem para inexistente, cancelado, campanha
 * desativada e malformado — a página não confirma que um convite existe (db/013).
 */
export const MENSAGENS: Record<ResultadoEnvio, { titulo: string; texto: string }> = {
  ok: {
    titulo: 'Obrigado pela atenção!',
    texto: 'Sua opinião é fundamental para a nossa melhoria.',
  },
  respondido: {
    titulo: 'Esta pesquisa já foi respondida',
    texto: 'Cada link aceita uma resposta só. Obrigado por participar!',
  },
  expirado: {
    titulo: 'Este link expirou',
    texto: 'O prazo para responder esta pesquisa terminou. Se quiser avaliar, peça um novo link ao seu contato na MegaBox.',
  },
  invalido: {
    titulo: 'Link inválido',
    texto: 'Não encontramos esta pesquisa. Confira se o endereço foi copiado inteiro do e-mail.',
  },
  dados_invalidos: {
    titulo: 'Confira as notas',
    texto: 'Escolha uma nota de 0 a 10 em cada pergunta e tente de novo.',
  },
  limite: {
    titulo: 'Muitas tentativas',
    texto: 'Aguarde alguns minutos e tente de novo.',
  },
  erro: {
    titulo: 'Não foi possível enviar agora',
    texto: 'Tente de novo em instantes.',
  },
}

/** Resultados que encerram o formulário (não adianta tentar de novo com o mesmo link). */
export function resultadoFinal(r: ResultadoEnvio): boolean {
  return r === 'ok' || r === 'respondido' || r === 'expirado' || r === 'invalido'
}

// ----------------------------------------------------------------- limite de tentativas

/**
 * Janela deslizante por chave, EM MEMÓRIA.
 *
 * Limite honesto e local: em serverless (Vercel) cada instância tem o seu mapa, e uma
 * instância nova começa zerada. Ele segura o flood de uma origem contra uma instância
 * quente; não é um limite global. O limite global de verdade seria um contador
 * compartilhado (tabela no Postgres ou KV) — ver o relatório da tela. O token de 256 bits
 * já torna adivinhar inviável; isto protege contra spam no comentário e martelada.
 *
 * `maxChaves` impede que um atacante com muitos IPs faça o mapa crescer sem fim.
 */
export class LimitePorChave {
  private readonly batidas = new Map<string, number[]>()

  constructor(
    private readonly maximo: number,
    private readonly janelaMs: number,
    private readonly maxChaves = 10_000,
  ) {}

  /** Registra uma tentativa. Devolve false se a chave já estourou a janela (não registra). */
  tentar(chave: string, agora: number = Date.now()): boolean {
    const desde = agora - this.janelaMs
    const recentes = (this.batidas.get(chave) ?? []).filter((t) => t > desde)
    if (recentes.length >= this.maximo) {
      this.batidas.set(chave, recentes)
      return false
    }
    recentes.push(agora)
    this.batidas.delete(chave) // reinsere no fim: o Map vira fila por uso mais recente
    this.batidas.set(chave, recentes)
    this.podar(desde)
    return true
  }

  get tamanho(): number {
    return this.batidas.size
  }

  private podar(desde: number) {
    if (this.batidas.size <= this.maxChaves) return
    for (const [chave, tempos] of this.batidas) {
      if (tempos.every((t) => t <= desde)) this.batidas.delete(chave)
    }
    // Ainda cheio: descarta as chaves usadas há mais tempo (início do Map).
    for (const chave of this.batidas.keys()) {
      if (this.batidas.size <= this.maxChaves) break
      this.batidas.delete(chave)
    }
  }
}
