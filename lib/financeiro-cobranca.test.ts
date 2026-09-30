import { describe, expect, it } from 'vitest'

import { assuntoCobranca, textoCobranca } from './financeiro-cobranca'

describe('e-mail de cobrança', () => {
  const conta = {
    pedido_numero: '5456',
    parcela: 1,
    parcelas_total: 2,
    cliente: 'Cliente A',
    dt_vencimento: '2026-09-05',
    nf_fornecedor_numero: '2361',
    valor_comissao: '0.10',
  }

  it('assunto do Bubble', () => {
    expect(assuntoCobranca(519)).toBe('Cobrança número 519')
  })

  it('lista as contas e soma a comissão em centavos', () => {
    const t = textoCobranca({
      numero: 519,
      contato: 'Maria',
      fornecedor: 'Fornecedor X',
      usuario: 'Julio Di Franco',
      contas: [conta, { ...conta, parcela: 2, valor_comissao: '0.20' }],
    })
    expect(t).toContain('Olá Maria,')
    expect(t).toContain('cobrança número 519 de Fornecedor X')
    expect(t).toContain('vencimento 05/09/2026 — comissão R$ 0,10')
    expect(t).toContain('Quantidade: 2')
    // 0,10 + 0,20 = 0,30 exatos
    expect(t).toContain('Valor total em comissões: R$ 0,30')
  })

  it('sem contato, saudação neutra', () => {
    expect(textoCobranca({ numero: 1, contato: null, fornecedor: 'F', usuario: 'U', contas: [] })).toMatch(/^Olá,/)
  })
})
