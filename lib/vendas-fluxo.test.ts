import { describe, expect, it } from 'vitest'

import { ETAPA } from './vendas'
import {
  assuntoCancelamentoEntrega,
  assuntoNotaBoleto,
  assuntoPedido,
  assuntoProposta,
  faltaQuantidade,
  historicoPedido,
  historicoProposta,
  lerCopias,
  podeCancelarEntrega,
  podeEditarEntrega,
  podeGravarSaida,
  produtosDistintos,
  proximoNumeroProposta,
  remetente,
  statusDaSaida,
  validarCancelamentoEntrega,
  validarEdicaoEntrega,
  validarNovaEntrega,
  validarPedido,
  validarProposta,
  validarSaida,
} from './vendas-fluxo'

const ID = '11111111-2222-4333-8444-555555555555'
const ID2 = '66666666-7777-4888-8999-aaaaaaaaaaaa'

function form(campos: Record<string, string | string[]>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x)
  return f
}

describe('lerCopias', () => {
  it('normaliza, tira repetidos e aceita vírgula, ponto e vírgula e espaço', () => {
    expect(lerCopias(' A@x.com; b@y.com.br  a@x.com ')).toEqual({ ok: true, valor: 'a@x.com, b@y.com.br' })
  })
  it('vazio é null', () => {
    expect(lerCopias('  ')).toEqual({ ok: true, valor: null })
  })
  it('recusa endereço malformado e cabeçalho injetado', () => {
    expect(lerCopias('a@x.com, sem-arroba').ok).toBe(false)
    expect(lerCopias('a@x.com\nbcc:z@z.com').ok).toBe(false)
  })
  it('limita a 10', () => {
    const muitos = Array.from({ length: 11 }, (_, i) => `u${i}@x.com`).join(',')
    expect(lerCopias(muitos).ok).toBe(false)
  })
})

describe('proximoNumeroProposta', () => {
  it('é o maior + 1, não a contagem + 1 (evita repetir depois de descartar)', () => {
    expect(proximoNumeroProposta([])).toBe(1)
    expect(proximoNumeroProposta([1, 3])).toBe(4)
  })
})

describe('validarProposta', () => {
  const base = { proposta_id: ID, numero: '2', condicao_pagamento: 'À vista' }
  it('grava sem contato', () => {
    const r = validarProposta(form(base), false)
    expect(r.ok && r.dados.enviar_para_contato_id).toBe(null)
  })
  it('enviar exige o contato do cliente (to do e-mail, bTnvu0)', () => {
    expect(validarProposta(form(base), true)).toEqual({ ok: false, erro: 'Para enviar, escolha o e-mail do cliente.' })
    expect(validarProposta(form({ ...base, enviar_para_contato_id: ID2 }), true).ok).toBe(true)
  })
  it('recusa número, data e uuid inválidos', () => {
    expect(validarProposta(form({ ...base, numero: '0' }), false).ok).toBe(false)
    expect(validarProposta(form({ ...base, data_prev_entrega: '2026-02-30' }), false).ok).toBe(false)
    expect(validarProposta(form({ ...base, faturar_para_endereco_id: 'x' }), false).ok).toBe(false)
  })
})

describe('validarPedido', () => {
  const base = { pedido_id: ID }
  it('grava sem formalizar com tudo vazio', () => {
    const r = validarPedido(form(base), false)
    expect(r.ok && r.dados.prazos).toEqual([])
  })
  it('formalizar exige contato do cliente, forma e prazo', () => {
    expect(validarPedido(form(base), true).ok).toBe(false)
    expect(validarPedido(form({ ...base, contato_cliente_id: ID2 }), true).ok).toBe(false)
    expect(validarPedido(form({ ...base, contato_cliente_id: ID2, forma_pagamento_id: '1' }), true).ok).toBe(false)
    const r = validarPedido(form({ ...base, contato_cliente_id: ID2, forma_pagamento_id: '1', prazos: ['30', '7', '30'] }), true)
    expect(r.ok && r.dados.prazos).toEqual([7, 30])
  })
  it('recusa prazo inválido e cópia inválida', () => {
    expect(validarPedido(form({ ...base, prazos: ['abc'] }), false).ok).toBe(false)
    expect(validarPedido(form({ ...base, emails_copia_cliente: 'nada' }), false).ok).toBe(false)
  })
})

describe('entregas: regras de etapa', () => {
  it('só edita/apaga o que não saiu, em Pedir ou Pedido', () => {
    expect(podeEditarEntrega({ status_id: ETAPA.PEDIR, saiu_entrega: false })).toBe(true)
    expect(podeEditarEntrega({ status_id: ETAPA.PEDIDO, saiu_entrega: false })).toBe(true)
    expect(podeEditarEntrega({ status_id: ETAPA.PEDIDO, saiu_entrega: true })).toBe(false)
    expect(podeEditarEntrega({ status_id: ETAPA.EM_ENTREGA, saiu_entrega: false })).toBe(false)
  })
  it('saída e cancelamento só antes do Financeiro', () => {
    for (const s of [ETAPA.PEDIR, ETAPA.PEDIDO, ETAPA.EM_ENTREGA]) {
      expect(podeGravarSaida(s)).toBe(true)
      expect(podeCancelarEntrega(s)).toBe(true)
    }
    for (const s of [ETAPA.FINANCEIRO, ETAPA.CONCLUIDO, ETAPA.CANCELADO]) {
      expect(podeGravarSaida(s)).toBe(false)
      expect(podeCancelarEntrega(s)).toBe(false)
    }
  })
  it('interruptor: ligado Em Entrega (bTcRH), desligado Pedido (bTcZR)', () => {
    expect(statusDaSaida(true)).toBe(ETAPA.EM_ENTREGA)
    expect(statusDaSaida(false)).toBe(ETAPA.PEDIDO)
  })
})

describe('validarNovaEntrega / validarEdicaoEntrega', () => {
  it('exige quantidade > 0', () => {
    expect(validarNovaEntrega(form({ pedido_id: ID, orcamento_fornecedor_id: ID2, qtd: '0' })).ok).toBe(false)
    const r = validarNovaEntrega(form({ pedido_id: ID, orcamento_fornecedor_id: ID2, qtd: '1.500,5' }))
    expect(r.ok && r.dados).toEqual({ pedido_id: ID, orcamento_fornecedor_id: ID2, qtd: '1500.500', dt_prev_entrega: null })
  })
  it('edição valida data', () => {
    expect(validarEdicaoEntrega(form({ entrega_id: ID, qtd: '10', dt_prev_entrega: '2026-13-01' })).ok).toBe(false)
    expect(validarEdicaoEntrega(form({ entrega_id: ID, qtd: '10', dt_prev_entrega: '2026-10-01' })).ok).toBe(true)
  })
})

describe('validarSaida (pop.AnexaNf)', () => {
  it('sair exige NF, data e arquivo', () => {
    const f = { entrega_id: ID, saiu: 'on' }
    expect(validarSaida(form(f), true).ok).toBe(false)
    expect(validarSaida(form({ ...f, nf_fornecedor_numero: '123' }), true).ok).toBe(false)
    expect(validarSaida(form({ ...f, nf_fornecedor_numero: '123', dt_emissao_nf: '2026-09-01' }), false).ok).toBe(false)
    expect(validarSaida(form({ ...f, nf_fornecedor_numero: '123', dt_emissao_nf: '2026-09-01' }), true).ok).toBe(true)
  })
  it('"não emite NF" desobriga e limpa número e data', () => {
    const r = validarSaida(form({ entrega_id: ID, saiu: 'on', nao_emite_nf: 'on', nf_fornecedor_numero: '9' }), false)
    expect(r.ok && r.dados).toMatchObject({ saiu: true, nao_emite_nf: true, nf_fornecedor_numero: null, dt_emissao_nf: null })
  })
  it('sem sair grava o que vier; NF com caractere estranho é recusada', () => {
    expect(validarSaida(form({ entrega_id: ID }), false).ok).toBe(true)
    expect(validarSaida(form({ entrega_id: ID, nf_fornecedor_numero: '1<2' }), false).ok).toBe(false)
  })
})

describe('validarCancelamentoEntrega', () => {
  it('motivo obrigatório', () => {
    expect(validarCancelamentoEntrega(form({ entrega_id: ID, motivo: ' ' })).ok).toBe(false)
    const r = validarCancelamentoEntrega(form({ entrega_id: ID, motivo: 'Cliente desistiu', avisar_cliente: 'on' }))
    expect(r.ok && r.dados).toEqual({ entrega_id: ID, motivo: 'Cliente desistiu', avisar_cliente: true, avisar_fornecedor: false })
  })
})

describe('faltaQuantidade (vendas.md §5.4)', () => {
  it('exata em milésimos', () => {
    expect(faltaQuantidade('100', ['30.5', '0.25'])).toBe('69.25')
    expect(faltaQuantidade('0.3', ['0.1', '0.2'])).toBe('0')
  })
  it('negativa quando entregou a mais', () => {
    expect(faltaQuantidade('10', ['12.001'])).toBe('-2.001')
  })
})

describe('textos de e-mail e histórico', () => {
  it('produtos distintos na ordem', () => {
    expect(produtosDistintos(['Palete', ' Caixa', 'Palete', null])).toBe('Palete, Caixa')
  })
  it('remetente com o primeiro nome', () => {
    expect(remetente('maria DA silva')).toBe('[MegaBox] Maria')
  })
  it('assuntos', () => {
    expect(assuntoProposta({ cotacao: 120, proposta: 2, produtos: 'Palete', cliente: 'ACME' })).toBe(
      'Proposta núm 120/2 - Produtos: Palete - Cliente: ACME',
    )
    expect(assuntoPedido({ numero: '120', proposta: 2, produtos: 'Palete', para: 'Fornecedor', nome: 'F' })).toBe(
      'Pedido núm 120/2 - Produtos: Palete - Fornecedor: F',
    )
    expect(assuntoNotaBoleto('120')).toBe('Nota fiscal e Boleto - (Pedido núm 120)')
    expect(assuntoCancelamentoEntrega({ numero: '120', produtos: 'Palete', para: 'Cliente', nome: 'ACME' })).toBe(
      'Cancelamento Entrega: 120 - Produtos: Palete - Cliente: ACME',
    )
  })
  it('históricos (bTjCC, bTjBw)', () => {
    expect(historicoProposta(120, 2, 'a@x.com')).toBe('Proposta número 120/2 enviada ao cliente no email a@x.com')
    expect(historicoPedido('120', 'a@x.com')).toBe('Pedido número 120 enviado ao cliente no email a@x.com')
  })
})
