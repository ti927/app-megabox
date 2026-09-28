import { describe, expect, it } from 'vitest'

import {
  assinaturaConfere,
  lerCaminho,
  montarCaminho,
  nomeSeguro,
  validadeUrl,
  validarArquivo,
} from './arquivos-regras'

const DONO = '0b6f1c1e-6f3a-4d5e-9a7b-2c3d4e5f6a7b'
const ARQ = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'

describe('montarCaminho / lerCaminho', () => {
  it('monta <bucket>/<dono>/<uuid>.<ext> e desmonta de volta', () => {
    const p = montarCaminho('anexos', DONO, ARQ, 'pdf')
    expect(p).toBe(`anexos/${DONO}/${ARQ}.pdf`)
    expect(lerCaminho(p)).toEqual({ bucket: 'anexos', donoId: DONO, objeto: `${DONO}/${ARQ}.pdf` })
  })

  it('normaliza uuid em maiúsculas', () => {
    expect(montarCaminho('produtos', DONO.toUpperCase(), ARQ, 'png')).toBe(`produtos/${DONO}/${ARQ}.png`)
  })

  it('recusa montar com dono que não é uuid', () => {
    expect(() => montarCaminho('anexos', '../x', ARQ, 'pdf')).toThrow()
  })

  it.each([
    'https://s3.amazonaws.com/appforest_uf/f1/arquivo.pdf',
    '//s3.amazonaws.com/appforest_uf/f1/arquivo.pdf',
    `publico/${DONO}/${ARQ}.pdf`,
    `anexos/${DONO}/../${ARQ}.pdf`,
    `anexos/${DONO}/${ARQ}.PDF`,
    `anexos/${DONO}/${ARQ}`,
    `anexos/nao-e-uuid/${ARQ}.pdf`,
    '',
  ])('lerCaminho recusa %s', (p) => {
    expect(lerCaminho(p)).toBeNull()
  })
})

describe('validarArquivo', () => {
  it('aceita pdf em anexos e devolve a extensão', () => {
    expect(validarArquivo('anexos', { nome: 'contrato.pdf', tipo: 'application/pdf', tamanho: 1000 })).toEqual({
      ok: true,
      mime: 'application/pdf',
      ext: 'pdf',
    })
  })

  it('deduz o tipo pela extensão quando o navegador manda octet-stream', () => {
    const v = validarArquivo('anexos', { nome: 'CARTAO.JPEG', tipo: 'application/octet-stream', tamanho: 10 })
    expect(v).toEqual({ ok: true, mime: 'image/jpeg', ext: 'jpg' })
  })

  it('recusa html (os 2 anexos .html do Bubble não entram)', () => {
    expect(validarArquivo('anexos', { nome: 'x.html', tipo: 'text/html', tamanho: 10 }).ok).toBe(false)
  })

  it('recusa svg em foto de produto', () => {
    expect(validarArquivo('produtos', { nome: 'x.svg', tipo: 'image/svg+xml', tamanho: 10 }).ok).toBe(false)
  })

  it('recusa pdf como foto de produto', () => {
    expect(validarArquivo('produtos', { nome: 'x.pdf', tipo: 'application/pdf', tamanho: 10 }).ok).toBe(false)
  })

  it('aceita xml de NF em entregas', () => {
    expect(validarArquivo('entregas', { nome: 'nfe.xml', tipo: 'text/xml', tamanho: 10 })).toMatchObject({ ok: true, ext: 'xml' })
  })

  it('respeita o teto do bucket (5 MB em produtos, 25 MB em anexos)', () => {
    const cinco = 5 * 1024 * 1024
    expect(validarArquivo('produtos', { nome: 'a.png', tipo: 'image/png', tamanho: cinco }).ok).toBe(true)
    expect(validarArquivo('produtos', { nome: 'a.png', tipo: 'image/png', tamanho: cinco + 1 }).ok).toBe(false)
    expect(validarArquivo('anexos', { nome: 'a.pdf', tipo: 'application/pdf', tamanho: cinco + 1 }).ok).toBe(true)
    expect(validarArquivo('anexos', { nome: 'a.pdf', tipo: 'application/pdf', tamanho: 25 * 1024 * 1024 + 1 }).ok).toBe(false)
  })

  it('recusa arquivo vazio', () => {
    expect(validarArquivo('anexos', { nome: 'a.pdf', tipo: 'application/pdf', tamanho: 0 }).ok).toBe(false)
  })
})

describe('assinaturaConfere', () => {
  const b = (...x: number[]) => new Uint8Array([...x, 0, 0, 0, 0, 0, 0, 0, 0])
  it('pdf de verdade passa; html com extensão .pdf não', () => {
    expect(assinaturaConfere('application/pdf', new TextEncoder().encode('%PDF-1.7'))).toBe(true)
    expect(assinaturaConfere('application/pdf', new TextEncoder().encode('<html>'))).toBe(false)
  })
  it('png, jpeg, gif, docx, doc', () => {
    expect(assinaturaConfere('image/png', b(0x89, 0x50, 0x4e, 0x47))).toBe(true)
    expect(assinaturaConfere('image/jpeg', b(0xff, 0xd8, 0xff))).toBe(true)
    expect(assinaturaConfere('image/gif', b(0x47, 0x49, 0x46, 0x38))).toBe(true)
    expect(
      assinaturaConfere('application/vnd.openxmlformats-officedocument.wordprocessingml.document', b(0x50, 0x4b, 0x03, 0x04)),
    ).toBe(true)
    expect(assinaturaConfere('application/msword', b(0xd0, 0xcf, 0x11, 0xe0))).toBe(true)
    expect(assinaturaConfere('image/png', b(0xff, 0xd8, 0xff))).toBe(false)
  })
  it('webp confere RIFF....WEBP', () => {
    expect(assinaturaConfere('image/webp', new TextEncoder().encode('RIFF\x00\x00\x00\x00WEBPVP8 '))).toBe(true)
    expect(assinaturaConfere('image/webp', new TextEncoder().encode('RIFF\x00\x00\x00\x00WAVEfmt '))).toBe(false)
  })
  it('xml aceita BOM e espaço antes do <', () => {
    expect(assinaturaConfere('text/xml', new Uint8Array([0xef, 0xbb, 0xbf, 0x20, 0x3c, 0x3f]))).toBe(true)
    expect(assinaturaConfere('application/xml', new TextEncoder().encode('oi'))).toBe(false)
  })
  it('mime desconhecido nunca confere', () => {
    expect(assinaturaConfere('text/html', new TextEncoder().encode('<html>'))).toBe(false)
  })
})

describe('validadeUrl', () => {
  it('padrão 120 s, presa entre 60 e 300', () => {
    expect(validadeUrl()).toBe(120)
    expect(validadeUrl(5)).toBe(60)
    expect(validadeUrl(3600)).toBe(300)
    expect(validadeUrl(90.4)).toBe(90)
    expect(validadeUrl(Number.NaN)).toBe(120)
  })
})

describe('nomeSeguro', () => {
  it('tira barra, aspas e controle; nunca vazio', () => {
    expect(nomeSeguro('../contrato "social".pdf')).toBe('.._contrato _social_.pdf')
    expect(nomeSeguro('a\r\nb.pdf')).toBe('a_b.pdf')
    expect(nomeSeguro('   ')).toBe('arquivo')
  })
})
