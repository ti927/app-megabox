/**
 * Regras PURAS de arquivo: buckets, tipos aceitos, formato do caminho, assinatura de bytes.
 *
 * Sem I/O e sem `server-only`, para o vitest testar direto. Quem fala com o Storage é
 * `lib/arquivos.ts` (server-only). Os limites daqui são os MESMOS de `db/018_arquivos.sql`
 * (file_size_limit / allowed_mime_types de cada bucket): o banco é a trava, isto aqui é a
 * mensagem de erro legível antes de gastar um upload.
 *
 * Caminho, em toda coluna `*_path`: `<bucket>/<id da linha dona>/<uuid>.<ext>` (018 §3).
 */

export const BUCKETS = ['anexos', 'produtos', 'entregas', 'usuarios', 'clifor'] as const
export type Bucket = (typeof BUCKETS)[number]

const MB = 1024 * 1024

const PDF = { 'application/pdf': 'pdf' }
const IMAGENS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const WORD = {
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}
const EXCEL = {
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}
const XML = { 'application/xml': 'xml', 'text/xml': 'xml' }

/** Espelho de storage.buckets na 018. mime → extensão gravada no caminho. */
export const REGRAS: Record<Bucket, { maxBytes: number; tipos: Record<string, string> }> = {
  anexos: { maxBytes: 25 * MB, tipos: { ...PDF, ...IMAGENS, ...WORD, ...EXCEL } },
  produtos: { maxBytes: 5 * MB, tipos: { ...IMAGENS, 'image/gif': 'gif' } },
  entregas: { maxBytes: 25 * MB, tipos: { ...PDF, ...XML, ...IMAGENS, ...WORD } },
  usuarios: { maxBytes: 5 * MB, tipos: { ...IMAGENS, 'image/gif': 'gif' } },
  clifor: { maxBytes: 5 * MB, tipos: { ...IMAGENS, 'image/gif': 'gif' } },
}

/** Extensão do nome original → mime, para quando o navegador manda tipo vazio ou genérico. */
const MIME_POR_EXTENSAO: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xml: 'application/xml',
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const RE_UUID = new RegExp(`^${UUID}$`)
const RE_CAMINHO = new RegExp(`^(${BUCKETS.join('|')})/(${UUID})/(${UUID})\\.([a-z0-9]{1,8})$`)

export function ehBucket(x: string): x is Bucket {
  return (BUCKETS as readonly string[]).includes(x)
}

export function ehUuid(x: string): boolean {
  return RE_UUID.test(x)
}

/** Mime efetivo: o declarado, se o bucket aceita; senão o deduzido da extensão do nome. */
export function mimeEfetivo(bucket: Bucket, declarado: string, nomeOriginal: string): string | null {
  const tipos = REGRAS[bucket].tipos
  const limpo = (declarado.split(';')[0] ?? '').trim().toLowerCase()
  if (limpo in tipos) return limpo
  const ext = nomeOriginal.toLowerCase().match(/\.([a-z0-9]{1,5})$/)?.[1]
  const deduzido = ext ? MIME_POR_EXTENSAO[ext] : undefined
  return deduzido && deduzido in tipos ? deduzido : null
}

export type Validacao = { ok: true; mime: string; ext: string } | { ok: false; erro: string }

/** Tipo e tamanho, antes do upload. O bucket confere de novo — isto é só a mensagem boa. */
export function validarArquivo(
  bucket: Bucket,
  arquivo: { nome: string; tipo: string; tamanho: number },
): Validacao {
  if (!arquivo.tamanho || arquivo.tamanho <= 0) return { ok: false, erro: 'Arquivo vazio.' }
  const { maxBytes, tipos } = REGRAS[bucket]
  if (arquivo.tamanho > maxBytes) {
    return { ok: false, erro: `Arquivo maior que ${Math.round(maxBytes / MB)} MB.` }
  }
  const mime = mimeEfetivo(bucket, arquivo.tipo, arquivo.nome)
  if (!mime) {
    const aceitos = [...new Set(Object.values(tipos))].join(', ')
    return { ok: false, erro: `Tipo de arquivo não aceito. Aceitos: ${aceitos}.` }
  }
  const ext = tipos[mime]
  if (!ext) return { ok: false, erro: 'Tipo de arquivo não aceito.' }
  return { ok: true, mime, ext }
}

/**
 * Confere os primeiros bytes contra o mime: um `.pdf` que na verdade é HTML não entra.
 * Formatos binários têm assinatura fixa; docx/xlsx são zip (PK); doc/xls são OLE (D0 CF);
 * xml é texto que começa (após BOM/espaço) por `<`.
 */
export function assinaturaConfere(mime: string, bytes: Uint8Array): boolean {
  const comeca = (...b: number[]) => b.every((v, i) => bytes[i] === v)
  switch (mime) {
    case 'application/pdf':
      return comeca(0x25, 0x50, 0x44, 0x46) // %PDF
    case 'image/png':
      return comeca(0x89, 0x50, 0x4e, 0x47)
    case 'image/jpeg':
      return comeca(0xff, 0xd8, 0xff)
    case 'image/gif':
      return comeca(0x47, 0x49, 0x46, 0x38) // GIF8
    case 'image/webp':
      return comeca(0x52, 0x49, 0x46, 0x46) && [0x57, 0x45, 0x42, 0x50].every((v, i) => bytes[8 + i] === v)
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return comeca(0x50, 0x4b, 0x03, 0x04)
    case 'application/msword':
    case 'application/vnd.ms-excel':
      return comeca(0xd0, 0xcf, 0x11, 0xe0)
    case 'application/xml':
    case 'text/xml': {
      let i = comeca(0xef, 0xbb, 0xbf) ? 3 : 0
      while (i < bytes.length && [0x20, 0x09, 0x0a, 0x0d].includes(bytes[i] ?? -1)) i++
      return bytes[i] === 0x3c // '<'
    }
    default:
      return false
  }
}

/** `<bucket>/<dono>/<arquivo>.<ext>` — o que vai para a coluna `*_path`. */
export function montarCaminho(bucket: Bucket, donoId: string, arquivoId: string, ext: string): string {
  const caminho = `${bucket}/${donoId.toLowerCase()}/${arquivoId.toLowerCase()}.${ext}`
  if (!RE_CAMINHO.test(caminho)) throw new Error('caminho de arquivo inválido')
  return caminho
}

export type CaminhoLido = { bucket: Bucket; donoId: string; objeto: string }

/**
 * Desmonta um caminho de coluna. Nulo para qualquer coisa fora do formato — URL de CDN
 * (`https://…`, `//…`), `..`, bucket desconhecido. `objeto` é o `name` dentro do bucket.
 */
export function lerCaminho(caminho: string): CaminhoLido | null {
  const m = RE_CAMINHO.exec(caminho)
  if (!m) return null
  const bucket = m[1] as Bucket
  return { bucket, donoId: m[2] ?? '', objeto: caminho.slice(bucket.length + 1) }
}

export const VALIDADE_MIN_S = 60
export const VALIDADE_MAX_S = 300
export const VALIDADE_PADRAO_S = 120

/** Vida da URL assinada, presa entre 60 e 300 s. */
export function validadeUrl(segundos?: number): number {
  if (segundos === undefined || !Number.isFinite(segundos)) return VALIDADE_PADRAO_S
  return Math.min(VALIDADE_MAX_S, Math.max(VALIDADE_MIN_S, Math.round(segundos)))
}

/** Nome para o download: sem barra, sem controle, sem aspas, até 150 caracteres. */
export function nomeSeguro(nome: string): string {
  const limpo = nome
    .replace(/[\u0000-\u001f\u007f"\\/:*?<>|]+/g, '_')
    .trim()
    .slice(-150)
  return limpo || 'arquivo'
}
