import { describe, expect, it } from 'vitest'

import { assinaturaFormulario } from './formulario-alterado'

describe('assinaturaFormulario', () => {
  const base: [string, string][] = [
    ['nome', 'caixa bipartida'],
    ['tipo_id', 't1'],
    ['linhas', 'l1'],
    ['linhas', 'l2'],
  ]

  it('mesmo conteúdo, mesma assinatura — em qualquer ordem', () => {
    const embaralhado: [string, string][] = [base[3]!, base[1]!, base[0]!, base[2]!]
    expect(assinaturaFormulario(embaralhado)).toBe(assinaturaFormulario(base))
  })

  it('texto digitado muda a assinatura', () => {
    const outro: [string, string][] = [['nome', 'caixa bipartida x'], ...base.slice(1)]
    expect(assinaturaFormulario(outro)).not.toBe(assinaturaFormulario(base))
  })

  it('marcar ou desmarcar uma caixa muda a assinatura', () => {
    expect(assinaturaFormulario(base.slice(0, 3))).not.toBe(assinaturaFormulario(base))
    expect(assinaturaFormulario([...base, ['linhas', 'l3']])).not.toBe(assinaturaFormulario(base))
  })

  it('digitar e apagar de volta não é alteração', () => {
    const volta: [string, string][] = base.map(([k, v]) => [k, `${v}`])
    expect(assinaturaFormulario(volta)).toBe(assinaturaFormulario(base))
  })

  it('não confunde valores que só diferem na fronteira entre campos', () => {
    expect(assinaturaFormulario([['a', 'b,c']])).not.toBe(assinaturaFormulario([['a', 'b'], ['a', 'c']]))
  })
})
