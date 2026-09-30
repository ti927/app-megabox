import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  corpoCancelamentoEntrega,
  corpoNotaBoleto,
  corpoPadraoPedido,
  corpoPadraoProposta,
  MODELOS_EMAIL_VENDAS_PADRAO,
  montarEmailVendas,
  preencherTexto,
} from './vendas-fluxo'

/** Literal SQL como a 023 escreve: E'...' com \n quando há quebra de linha. */
function literal(s: string): string {
  if (!s.includes('\n')) return `'${s.replaceAll("'", "''")}'`
  return `E'${s.replaceAll('\\', '\\\\').replaceAll("'", "''").replaceAll('\n', '\\n')}'`
}

describe('db/023 = textos padrão do código', () => {
  const sql = readFileSync(resolve(import.meta.dirname, '../db/023_modelos_email.sql'), 'utf8')
  for (const [chave, m] of Object.entries(MODELOS_EMAIL_VENDAS_PADRAO)) {
    it(chave, () => {
      expect(sql).toContain(`(${literal(chave)}, ${literal(m.nome)},`)
      expect(sql).toContain(literal(m.assunto))
      expect(sql).toContain(literal(m.corpo))
    })
  }
})

describe('corpos padrão (mesmo texto de antes da 023)', () => {
  it('proposta', () => {
    expect(corpoPadraoProposta({ contato: 'Ana', cotacao: 120, proposta: 2, vendedor: 'Bia' })).toBe(
      'Olá Ana,\n\nSegue a nossa proposta núm 120/2.\nQualquer dúvida, estou à disposição.\n\nAtenciosamente,\nBia\nGrupo MegaBox',
    )
  })
  it('pedido cliente e fornecedor', () => {
    expect(corpoPadraoPedido({ contato: 'Ana', numero: '120/2', para: 'Cliente', vendedor: 'Bia' })).toBe(
      'Olá Ana,\n\nConfirmamos o seu pedido núm 120/2. Seguem abaixo os itens e as entregas programadas.\n\nAtenciosamente,\nBia\nGrupo MegaBox',
    )
    expect(corpoPadraoPedido({ contato: 'Rui', numero: '120', para: 'Fornecedor', vendedor: 'Bia' })).toContain(
      'Segue o pedido núm 120 para faturamento.',
    )
  })
  it('NF e boleto põe o contato em maiúsculas', () => {
    expect(corpoNotaBoleto({ contato: 'Ana', numeroPedido: '120-1', produto: 'Palete', qtd: '10', vendedor: 'Bia' })).toBe(
      'Olá ANA\n\nSegue anexo nota fiscal e boleto referente ao pedido 120-1 (Palete - 10)\n\nAtenciosamente,\nBia\nGrupo MegaBox',
    )
  })
  it('cancelamento', () => {
    expect(corpoCancelamentoEntrega({ contato: 'Ana', numero: '120-1', produto: 'Palete', motivo: 'atraso', vendedor: 'Bia' })).toBe(
      'Olá Ana,\n\nInformamos o cancelamento da entrega do pedido 120-1 (Palete).\nMotivo: atraso\n\nAtenciosamente,\nBia\nGrupo MegaBox',
    )
  })
})

describe('montarEmailVendas (modelo do banco com fallback)', () => {
  const vars = { cotacao: 120, proposta: 2, produtos: 'Palete', cliente: 'ACME', contato: 'Ana', vendedor: 'Bia' }

  it('sem modelo no banco usa o padrão', () => {
    const r = montarEmailVendas('vendas_proposta', vars, null)
    expect(r.assunto).toBe('Proposta núm 120/2 - Produtos: Palete - Cliente: ACME')
    expect(r.corpo).toBe(corpoPadraoProposta({ contato: 'Ana', cotacao: 120, proposta: 2, vendedor: 'Bia' }))
  })

  it('usa o modelo do banco quando ele fecha', () => {
    const r = montarEmailVendas('vendas_proposta', vars, { assunto: 'Proposta {{cotacao}}', corpo: 'Oi {{contato}}' })
    expect(r).toEqual({ assunto: 'Proposta 120', corpo: 'Oi Ana' })
  })

  it('variável desconhecida no modelo cai no padrão só naquela parte', () => {
    const r = montarEmailVendas('vendas_proposta', vars, { assunto: 'Proposta {{cotacao}}', corpo: 'Oi {{apelido}}' })
    expect(r.assunto).toBe('Proposta 120')
    expect(r.corpo).toContain('Olá Ana,')
    const s = montarEmailVendas('vendas_proposta', vars, { assunto: '{{inexistente}}', corpo: 'Oi {{contato}}' })
    expect(s.assunto).toBe('Proposta núm 120/2 - Produtos: Palete - Cliente: ACME')
    expect(s.corpo).toBe('Oi Ana')
  })

  it('corpo digitado pelo vendedor vence o modelo', () => {
    const r = montarEmailVendas('vendas_proposta', vars, { assunto: 'P {{cotacao}}', corpo: 'Oi {{contato}}' }, 'Texto meu')
    expect(r).toEqual({ assunto: 'P 120', corpo: 'Texto meu' })
  })

  it('assunto sem quebra de linha (injeção de cabeçalho)', () => {
    const r = montarEmailVendas('vendas_proposta', { ...vars, cliente: 'ACME\r\nBcc: x@y.z' }, null)
    expect(r.assunto).not.toMatch(/[\r\n]/)
  })

  it('preencherTexto não escapa (quem escapa é textoParaHtml) e acusa variável faltando', () => {
    expect(preencherTexto('{{a}} & {{b}}', { a: '<x>', b: 1 })).toBe('<x> & 1')
    expect(preencherTexto('{{a}} {{c}}', { a: 'x' })).toBeNull()
  })
})
