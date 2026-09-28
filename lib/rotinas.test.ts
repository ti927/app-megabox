import { describe, expect, it } from 'vitest'

import {
  confirmacaoConfere,
  ehRotinaConhecida,
  formatarDataHora,
  montarParametros,
  segundosRestantes,
  traduzirRecusa,
  validarMotivo,
} from './rotinas'

const A = '3f2a8c1e-0b7d-4e59-9a61-2c4d5e6f7a8b'
const B = '4d111202-86b2-446d-8ce8-52f0144d458d'
const G1 = 'b30a824e-a02a-4e4a-9b90-e327d5cda5b9'
const G2 = '0a0a824e-a02a-4e4a-9b90-e327d5cda5b9'

function form(campos: Record<string, string | string[]>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) {
    for (const x of Array.isArray(v) ? v : [v]) f.append(k, x)
  }
  return f
}

describe('ehRotinaConhecida', () => {
  it('aceita só as duas rotinas com executor', () => {
    expect(ehRotinaConhecida('transferir-carteira')).toBe(true)
    expect(ehRotinaConhecida('sincronizar-ativo-enderecos')).toBe(true)
    expect(ehRotinaConhecida('estornar-baixas')).toBe(false)
    expect(ehRotinaConhecida(null)).toBe(false)
  })
})

describe('montarParametros — sincronizar-ativo-enderecos', () => {
  const slug = 'sincronizar-ativo-enderecos'

  it('"todos" só quando escolhido explicitamente (D8)', () => {
    expect(montarParametros(slug, form({ escopo: 'todos' }))).toEqual({ ok: true, dados: { todos: true } })
  })

  it('sem escopo não vira "todos" por omissão', () => {
    expect(montarParametros(slug, form({})).ok).toBe(false)
  })

  it('grupos: exige pelo menos um, sem repetição, ordenados, minúsculos', () => {
    expect(montarParametros(slug, form({ escopo: 'grupos' })).ok).toBe(false)
    expect(
      montarParametros(slug, form({ escopo: 'grupos', grupo_ids: [G1, G2.toUpperCase(), G1] })),
    ).toEqual({ ok: true, dados: { grupo_ids: [G2, G1] } })
  })

  it('escopo "grupos" ignora os ids se o escopo for "todos" (nunca manda as duas chaves)', () => {
    const r = montarParametros(slug, form({ escopo: 'todos', grupo_ids: [G1] }))
    expect(r).toEqual({ ok: true, dados: { todos: true } })
  })

  it('id inválido recusa', () => {
    expect(montarParametros(slug, form({ escopo: 'grupos', grupo_ids: ['x'] })).ok).toBe(false)
  })
})

describe('montarParametros — transferir-carteira', () => {
  const slug = 'transferir-carteira'

  it('origem e destino obrigatórios', () => {
    expect(montarParametros(slug, form({ para_vendedor_id: B })).ok).toBe(false)
    expect(montarParametros(slug, form({ de_vendedor_id: A })).ok).toBe(false)
  })

  it('origem = destino recusa', () => {
    expect(montarParametros(slug, form({ de_vendedor_id: A, para_vendedor_id: A.toUpperCase() })).ok).toBe(false)
  })

  it('sem grupos: carteira inteira, sem a chave grupo_ids', () => {
    expect(montarParametros(slug, form({ de_vendedor_id: A, para_vendedor_id: B }))).toEqual({
      ok: true,
      dados: { de_vendedor_id: A, para_vendedor_id: B },
    })
  })

  it('com grupos: subconjunto', () => {
    expect(
      montarParametros(slug, form({ de_vendedor_id: A, para_vendedor_id: B, grupo_ids: [G1] })),
    ).toEqual({ ok: true, dados: { de_vendedor_id: A, para_vendedor_id: B, grupo_ids: [G1] } })
  })

  it('não carrega campos de outra rotina', () => {
    const r = montarParametros(slug, form({ de_vendedor_id: A, para_vendedor_id: B, escopo: 'todos' }))
    expect(r.ok && Object.keys(r.dados)).toEqual(['de_vendedor_id', 'para_vendedor_id'])
  })
})

describe('montarParametros — rotina desconhecida', () => {
  it('recusa', () => {
    expect(montarParametros('apagar-tudo', form({ escopo: 'todos' })).ok).toBe(false)
  })
})

describe('confirmacaoConfere', () => {
  it('confere o identificador digitado, sem caixa nem espaços nas pontas', () => {
    expect(confirmacaoConfere(' Transferir-Carteira ', 'transferir-carteira')).toBe(true)
    expect(confirmacaoConfere('transferir carteira', 'transferir-carteira')).toBe(false)
    expect(confirmacaoConfere('', 'transferir-carteira')).toBe(false)
    expect(confirmacaoConfere(null, 'transferir-carteira')).toBe(false)
  })
})

describe('validarMotivo', () => {
  it('obrigatório e com conteúdo (D10)', () => {
    expect(validarMotivo('   ').ok).toBe(false)
    expect(validarMotivo('abc').ok).toBe(false)
    expect(validarMotivo('  vendedor saiu da empresa ')).toEqual({ ok: true, dados: 'vendedor saiu da empresa' })
    expect(validarMotivo('x'.repeat(501)).ok).toBe(false)
  })
})

describe('traduzirRecusa', () => {
  it('traduz os motivos do banco', () => {
    expect(traduzirRecusa('simulação vencida (janela de 15 minutos): refaça o seco')).toMatch(/expirou/)
    expect(
      traduzirRecusa('O alvo mudou desde a simulação (agora 3 linhas): nada foi alterado, refaça o seco'),
    ).toMatch(/agora são 3 registros/)
    expect(
      traduzirRecusa('a simulação foi de outra rotina, de outro usuário ou com outros parâmetros'),
    ).toMatch(/outros parâmetros/)
    expect(traduzirRecusa('esta simulação já foi usada por outra execução real')).toMatch(/já foi usada/)
    expect(traduzirRecusa('usuário sem a página rotinas, ou inativo')).toMatch(/não tem acesso/)
    expect(
      traduzirRecusa('destino deve ser usuário ativo fora dos departamentos Financeiro e Operação'),
    ).toMatch(/Financeiro nem da Operação/)
    expect(traduzirRecusa('execução real exige motivo')).toMatch(/motivo/)
  })

  it('texto desconhecido aparece como veio; vazio vira mensagem genérica', () => {
    expect(traduzirRecusa('algo novo')).toBe('O banco recusou a execução: algo novo')
    expect(traduzirRecusa(null)).toMatch(/Tente de novo/)
  })
})

describe('segundosRestantes', () => {
  it('conta a janela de 15 minutos a partir do fim do seco', () => {
    const fim = '2026-09-28T12:00:00Z'
    const t = new Date(fim).getTime()
    expect(segundosRestantes(fim, t)).toBe(900)
    expect(segundosRestantes(fim, t + 60_000)).toBe(840)
    expect(segundosRestantes(fim, t + 16 * 60_000)).toBe(0)
    expect(segundosRestantes(null, t)).toBe(0)
  })
})

describe('formatarDataHora', () => {
  it('fuso de São Paulo', () => {
    expect(formatarDataHora('2026-09-28T15:07:00Z')).toBe('28/09/26, 12:07')
    expect(formatarDataHora(null)).toBe('—')
  })
})
