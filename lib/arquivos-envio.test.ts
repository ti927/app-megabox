import { describe, expect, it } from 'vitest'

import { aceitos, conferirEnvio, LIMITE_ENVIO_BYTES } from './arquivos-envio'

describe('conferirEnvio', () => {
  it('aceita pdf pequeno em anexos', () => {
    expect(conferirEnvio('anexos', { nome: 'a.pdf', tipo: 'application/pdf', tamanho: 10 })).toEqual({
      ok: true,
      mime: 'application/pdf',
      ext: 'pdf',
    })
  })

  it('recusa tipo que o bucket não aceita antes de olhar o tamanho', () => {
    const r = conferirEnvio('produtos', { nome: 'a.pdf', tipo: 'application/pdf', tamanho: 10 })
    expect(r.ok).toBe(false)
  })

  it('recusa acima do teto da server action mesmo dentro do limite do bucket', () => {
    const r = conferirEnvio('anexos', { nome: 'a.pdf', tipo: 'application/pdf', tamanho: LIMITE_ENVIO_BYTES + 1 })
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('KB') })
  })

  it('o limite do bucket continua valendo quando o teto de envio é maior', () => {
    const r = conferirEnvio('produtos', { nome: 'a.png', tipo: 'image/png', tamanho: 6 * 1024 * 1024 }, 50 * 1024 * 1024)
    expect(r).toEqual({ ok: false, erro: 'Arquivo maior que 5 MB.' })
  })

  it('arquivo vazio é recusado', () => {
    expect(conferirEnvio('anexos', { nome: 'a.pdf', tipo: 'application/pdf', tamanho: 0 }).ok).toBe(false)
  })
})

describe('aceitos', () => {
  it('lista extensões e mimes do bucket, sem html nem svg', () => {
    const a = aceitos('anexos')
    expect(a).toContain('.pdf')
    expect(a).toContain('.jpeg')
    expect(a).toContain('application/pdf')
    expect(a).not.toContain('html')
    expect(a).not.toContain('svg')
  })
})
