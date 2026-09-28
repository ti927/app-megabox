import { createHash, randomBytes } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import {
  COMENTARIO_MAX,
  LimitePorChave,
  MENSAGENS,
  ehTipoPesquisa,
  lerComentario,
  lerNota,
  lerResultadoBanco,
  perguntasDoTipo,
  resultadoFinal,
  tokenComFormatoValido,
  validarNotas,
} from './formulario-publico'
import {
  byteaHex,
  hashDoIp,
  hashDoToken,
  ipDosCabecalhos,
  segredoDoIp,
} from './formulario-publico-servidor'

/** Mesmo algoritmo de fn_pesquisa_emitir_token (db/013). */
const tokenReal = () => randomBytes(32).toString('base64url')

describe('tokenComFormatoValido', () => {
  it('aceita o token que o banco emite (32 bytes em base64url = 43 caracteres)', () => {
    for (let i = 0; i < 50; i++) expect(tokenComFormatoValido(tokenReal())).toBe(true)
  })

  it.each([
    ['vazio', ''],
    ['curto', 'a'.repeat(42)],
    ['longo', 'a'.repeat(44)],
    ['base64 comum (+ e /)', `${'a'.repeat(41)}+/`],
    ['com padding', `${'a'.repeat(42)}=`],
    ['com espaço', ` ${'a'.repeat(42)}`],
    ['quebra de linha no fim', `${'a'.repeat(43)}\n`],
    ['uuid', '3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
    ['injeção', `${'a'.repeat(30)}' or 1=1--`],
  ])('recusa %s', (_n, t) => {
    expect(tokenComFormatoValido(t)).toBe(false)
  })

  it('recusa o que não é texto', () => {
    for (const v of [null, undefined, 43, {}, ['a'.repeat(43)]]) {
      expect(tokenComFormatoValido(v)).toBe(false)
    }
  })
})

describe('perguntas por tipo', () => {
  it('NPS pergunta só nota_nps; pós-venda atendimento e produto; SAC atendimento', () => {
    expect(perguntasDoTipo(2).map((p) => p.campo)).toEqual(['nota_nps'])
    expect(perguntasDoTipo(3).map((p) => p.campo)).toEqual(['nota_atendimento', 'nota_produto'])
    expect(perguntasDoTipo(1).map((p) => p.campo)).toEqual(['nota_atendimento'])
  })

  it('reconhece só 1, 2 e 3', () => {
    expect([1, 2, 3].every(ehTipoPesquisa)).toBe(true)
    for (const v of [0, 4, '2', null, 2.5]) expect(ehTipoPesquisa(v)).toBe(false)
  })
})

describe('lerNota', () => {
  it('0 a 10 inteiros', () => {
    for (let n = 0; n <= 10; n++) expect(lerNota(String(n))).toBe(n)
  })
  it('vazio é "não respondida"', () => {
    expect(lerNota(null)).toBeNull()
    expect(lerNota(undefined)).toBeNull()
    expect(lerNota('')).toBeNull()
  })
  it.each(['11', '-1', '7.5', '7.0', ' 7', '1e1', 'abc', '010', '100'])('recusa %s', (v) => {
    expect(lerNota(v)).toBe('invalida')
  })
  it('recusa arquivo/objeto vindo do FormData', () => {
    expect(lerNota({})).toBe('invalida')
    expect(lerNota(5)).toBe('invalida')
  })
})

describe('validarNotas', () => {
  it('pós-venda exige as duas', () => {
    expect(validarNotas(3, { nota_atendimento: '9' })).toEqual({
      ok: false,
      faltando: ['nota_produto'],
    })
    expect(validarNotas(3, { nota_atendimento: '9', nota_produto: '0' })).toEqual({
      ok: true,
      notas: { nota_atendimento: 9, nota_produto: 0 },
    })
  })

  it('ignora campo que não é do tipo (não chega ao banco)', () => {
    expect(validarNotas(2, { nota_nps: '10', nota_produto: '3' })).toEqual({
      ok: true,
      notas: { nota_nps: 10 },
    })
  })

  it('nota fora da faixa conta como faltando', () => {
    expect(validarNotas(2, { nota_nps: '11' })).toEqual({ ok: false, faltando: ['nota_nps'] })
  })
})

describe('lerComentario', () => {
  it('apara e trata vazio como null', () => {
    expect(lerComentario('  oi  ')).toBe('oi')
    expect(lerComentario('   ')).toBeNull()
    expect(lerComentario(null)).toBeNull()
  })

  it('aceita exatamente o limite e recusa um a mais', () => {
    expect(lerComentario('a'.repeat(COMENTARIO_MAX))).toBe('a'.repeat(COMENTARIO_MAX))
    expect(lerComentario('a'.repeat(COMENTARIO_MAX + 1))).toBe('longo')
  })

  it('conta emoji como 1 caractere, como o char_length do Postgres', () => {
    expect(lerComentario('😀'.repeat(COMENTARIO_MAX))).toBe('😀'.repeat(COMENTARIO_MAX))
  })

  it('normaliza \\r\\n do navegador antes de contar', () => {
    const texto = 'a\r\n'.repeat(1000).trim() // 1000 "a" + 999 quebras = 1999
    expect(lerComentario(texto)).toBe('a\n'.repeat(1000).trim())
  })
})

describe('resultados', () => {
  it('só os cinco do banco passam; o resto vira erro', () => {
    for (const r of ['ok', 'invalido', 'expirado', 'respondido', 'dados_invalidos']) {
      expect(lerResultadoBanco(r)).toBe(r)
    }
    for (const r of ['OK', 'limite', '', null, 1, 'ok ']) expect(lerResultadoBanco(r)).toBe('erro')
  })

  it('toda saída tem mensagem', () => {
    for (const r of ['ok', 'invalido', 'expirado', 'respondido', 'dados_invalidos', 'limite', 'erro'] as const) {
      expect(MENSAGENS[r].titulo).toBeTruthy()
      expect(MENSAGENS[r].texto).toBeTruthy()
    }
  })

  it('mensagem de inválido não confirma existência nem motivo', () => {
    const texto = `${MENSAGENS.invalido.titulo} ${MENSAGENS.invalido.texto}`.toLowerCase()
    for (const palavra of ['cancel', 'desativ', 'não existe', 'inexistente']) {
      expect(texto).not.toContain(palavra)
    }
  })

  it('finais encerram o formulário; dados/limite/erro deixam tentar de novo', () => {
    expect(['ok', 'respondido', 'expirado', 'invalido'].every((r) => resultadoFinal(r as never))).toBe(true)
    expect(['dados_invalidos', 'limite', 'erro'].some((r) => resultadoFinal(r as never))).toBe(false)
  })
})

describe('LimitePorChave', () => {
  it('deixa passar até o máximo dentro da janela e barra o seguinte', () => {
    const l = new LimitePorChave(3, 1000)
    expect([l.tentar('a', 0), l.tentar('a', 10), l.tentar('a', 20)]).toEqual([true, true, true])
    expect(l.tentar('a', 30)).toBe(false)
    expect(l.tentar('b', 30)).toBe(true) // outra chave, outro balde
  })

  it('libera quando a janela desliza', () => {
    const l = new LimitePorChave(2, 1000)
    l.tentar('a', 0)
    l.tentar('a', 500)
    expect(l.tentar('a', 999)).toBe(false)
    expect(l.tentar('a', 1001)).toBe(true) // a batida de 0 saiu da janela
  })

  it('tentativa barrada não conta (não prorroga o castigo)', () => {
    const l = new LimitePorChave(1, 1000)
    l.tentar('a', 0)
    for (let t = 100; t < 1000; t += 100) expect(l.tentar('a', t)).toBe(false)
    expect(l.tentar('a', 1001)).toBe(true)
  })

  it('não cresce além de maxChaves', () => {
    const l = new LimitePorChave(5, 1000, 100)
    for (let i = 0; i < 1000; i++) l.tentar(`ip${i}`, i)
    expect(l.tamanho).toBeLessThanOrEqual(100)
  })
})

describe('servidor: hashes', () => {
  it('hashDoToken é o sha256 utf-8 que o banco grava', () => {
    const t = tokenReal()
    expect(hashDoToken(t)).toBe(createHash('sha256').update(t, 'utf8').digest('hex'))
    expect(hashDoToken(t)).toMatch(/^[0-9a-f]{64}$/)
    expect(byteaHex('ab')).toBe('\\xab')
  })

  it('hashDoIp depende do segredo (não é sha256 puro do IP)', () => {
    const a = hashDoIp('200.1.2.3', 's1')
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(a).toBe(hashDoIp(' 200.1.2.3 ', 's1'))
    expect(a).not.toBe(hashDoIp('200.1.2.3', 's2'))
    expect(a).not.toBe(createHash('sha256').update('200.1.2.3').digest('hex'))
    expect(() => hashDoIp('1.1.1.1', '')).toThrow()
  })

  it('segredoDoIp prefere o próprio e senão deriva da chave de serviço sem expô-la', () => {
    expect(segredoDoIp({ PESQUISA_IP_SEGREDO: 'x', SUPABASE_SERVICE_ROLE_KEY: 'k' })).toBe('x')
    const derivado = segredoDoIp({ SUPABASE_SERVICE_ROLE_KEY: 'chave-de-servico' })
    expect(derivado).not.toContain('chave-de-servico')
    expect(derivado).toMatch(/^[0-9a-f]{64}$/)
    expect(() => segredoDoIp({})).toThrow()
  })

  it('ipDosCabecalhos: x-real-ip, depois o 1º do x-forwarded-for, depois "desconhecido"', () => {
    const de = (h: Record<string, string>) => (n: string) => h[n] ?? null
    expect(ipDosCabecalhos(de({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe('1.1.1.1')
    expect(ipDosCabecalhos(de({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2')
    expect(ipDosCabecalhos(de({}))).toBe('desconhecido')
  })
})
