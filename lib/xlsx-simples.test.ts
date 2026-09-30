import { describe, expect, it } from 'vitest'

import { coluna, crc32, gerarXlsx } from './xlsx-simples'

const texto = (b: Uint8Array) => new TextDecoder().decode(b)

describe('xlsx-simples', () => {
  it('crc32 confere com o vetor padrão', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })

  it('coluna em letras', () => {
    expect([0, 25, 26, 27, 701].map(coluna)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ'])
  })

  it('gera um ZIP com as partes do pacote e o dinheiro sem passar por float', () => {
    const b = gerarXlsx('Entregas', [
      ['Cliente', 'Valor'],
      ['AGUA <MARIZA> & cia', { numero: '1420.10', moeda: true }],
      ['sem valor', { numero: 'lixo' }],
    ])
    expect(b[0]).toBe(0x50) // "PK"
    expect(b[1]).toBe(0x4b)
    const s = texto(b)
    expect(s).toContain('[Content_Types].xml')
    expect(s).toContain('xl/worksheets/sheet1.xml')
    expect(s).toContain('<v>1420.10</v>')
    expect(s).toContain('AGUA &lt;MARIZA&gt; &amp; cia')
    expect(s).not.toContain('<v>lixo</v>')
    // fim do diretório central no fim do arquivo
    const fim = new DataView(b.buffer, b.length - 22)
    expect(fim.getUint32(0, true)).toBe(0x06054b50)
    expect(fim.getUint16(10, true)).toBe(6)
  })
})
