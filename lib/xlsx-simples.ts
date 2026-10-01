/**
 * Planilha .xlsx de verdade (Office Open XML), sem dependência: uma aba, cabeçalho em negrito,
 * texto como inlineStr e número como célula numérica (o Excel soma e ordena). O pacote é um ZIP
 * sem compressão ("stored") com CRC-32 — o formato aceita e o Excel, o LibreOffice e o Google
 * Planilhas abrem. Por que não uma biblioteca (SheetJS/ExcelJS): 400–900 KB no bundle para
 * exportar UMA tabela; este arquivo tem ~150 linhas e teste.
 *
 * Dinheiro: o valor chega como TEXTO decimal do banco ("1420.00") e vai para o XML como está —
 * nunca passa por float no caminho. O formato de moeda (R$ #.##0,00) é aplicado por estilo.
 */

export type CelulaXlsx = string | { numero: string; moeda?: boolean } | null | undefined

const TABELA_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(dados: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < dados.length; i++) c = TABELA_CRC[(c ^ dados[i]!) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const escapar = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // caracteres de controle são inválidos em XML 1.0
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')

/** Índice de coluna (0 = A) → letras. */
export function coluna(i: number): string {
  let s = ''
  let n = i + 1
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function celulaXml(c: CelulaXlsx, ref: string, cabecalho: boolean): string {
  if (c === null || c === undefined || c === '') return ''
  if (typeof c === 'object') {
    if (!/^-?\d+(\.\d+)?$/.test(c.numero)) return ''
    return `<c r="${ref}" s="${c.moeda ? 2 : 0}"><v>${c.numero}</v></c>`
  }
  return `<c r="${ref}" t="inlineStr"${cabecalho ? ' s="1"' : ''}><is><t xml:space="preserve">${escapar(c)}</t></is></c>`
}

function planilhaXml(linhas: CelulaXlsx[][], larguras: number[]): string {
  const cols = larguras.length
    ? `<cols>${larguras.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : ''
  const corpo = linhas
    .map(
      (l, r) =>
        `<row r="${r + 1}">${l.map((c, i) => celulaXml(c, `${coluna(i)}${r + 1}`, r === 0)).join('')}</row>`,
    )
    .join('')
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `${cols}<sheetData>${corpo}</sheetData></worksheet>`
  )
}

const ESTILOS =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;R$&quot; #,##0.00"/></numFmts>' +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>'

function arquivos(nomeAba: string, linhas: CelulaXlsx[][], larguras: number[]): [string, string][] {
  const aba = escapar(nomeAba.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Planilha')
  return [
    [
      '[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>',
    ],
    [
      '_rels/.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    ],
    [
      'xl/workbook.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets><sheet name="${aba}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ],
    [
      'xl/_rels/workbook.xml.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>',
    ],
    ['xl/styles.xml', ESTILOS],
    ['xl/worksheets/sheet1.xml', planilhaXml(linhas, larguras)],
  ]
}

/** ZIP "stored" (sem compressão), um bloco por arquivo + diretório central. */
export function zipSemCompressao(entradas: [string, Uint8Array][]): Uint8Array {
  const partes: Uint8Array[] = []
  const central: Uint8Array[] = []
  let deslocamento = 0
  const enc = new TextEncoder()
  for (const [nome, dados] of entradas) {
    const n = enc.encode(nome)
    const crc = crc32(dados)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // nomes em UTF-8
    local.setUint16(8, 0, true) // stored
    local.setUint32(14, crc, true)
    local.setUint32(18, dados.length, true)
    local.setUint32(22, dados.length, true)
    local.setUint16(26, n.length, true)
    partes.push(new Uint8Array(local.buffer), n, dados)
    const c = new DataView(new ArrayBuffer(46))
    c.setUint32(0, 0x02014b50, true)
    c.setUint16(4, 20, true)
    c.setUint16(6, 20, true)
    c.setUint16(8, 0x0800, true)
    c.setUint32(16, crc, true)
    c.setUint32(20, dados.length, true)
    c.setUint32(24, dados.length, true)
    c.setUint16(28, n.length, true)
    c.setUint32(42, deslocamento, true)
    central.push(new Uint8Array(c.buffer), n)
    deslocamento += 30 + n.length + dados.length
  }
  const tamCentral = central.reduce((s, p) => s + p.length, 0)
  const fim = new DataView(new ArrayBuffer(22))
  fim.setUint32(0, 0x06054b50, true)
  fim.setUint16(8, entradas.length, true)
  fim.setUint16(10, entradas.length, true)
  fim.setUint32(12, tamCentral, true)
  fim.setUint32(16, deslocamento, true)
  const tudo = [...partes, ...central, new Uint8Array(fim.buffer)]
  const saida = new Uint8Array(tudo.reduce((s, p) => s + p.length, 0))
  let pos = 0
  for (const p of tudo) {
    saida.set(p, pos)
    pos += p.length
  }
  return saida
}

/** Linhas (a primeira é o cabeçalho) → bytes de um .xlsx. */
export function gerarXlsx(nomeAba: string, linhas: CelulaXlsx[][], larguras: number[] = []): Uint8Array {
  const enc = new TextEncoder()
  return zipSemCompressao(arquivos(nomeAba, linhas, larguras).map(([n, x]) => [n, enc.encode(x)]))
}

export const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
