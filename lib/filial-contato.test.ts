import { describe, expect, it } from 'vitest'

import type { UsuarioAtual } from '@/lib/autorizacao'

import {
  aplicarMascara,
  deveTornarPrincipal,
  mascararCep,
  mascararDocumento,
  mascararTelefone,
  podeBloquearFilial,
  validarContato,
  validarFilial,
} from './filial-contato'

// CNPJ e CPF com dígito verificador válido (gerados para teste)
const CNPJ = '11222333000181'
const CPF = '52998224725'

function usuario(perfilId: number, departamentoId: number): UsuarioAtual {
  return {
    id: '3f2a8c1e-0b7d-4e59-9a61-2c4d5e6f7a8b',
    nome: 'Pessoa Teste',
    perfilId,
    departamentoId,
    ehDiretor: perfilId === 1,
    ehGerenciaOuAcima: perfilId <= 2,
  }
}

function formFilial(extra: Record<string, string> = {}) {
  const f = new FormData()
  const base: Record<string, string> = {
    documento: '11.222.333/0001-81',
    razao: 'Loja Teste Ltda',
    fantasia: 'Loja Teste',
    regime_tributario_id: '1',
    cep: '01310-100',
    logradouro: 'Av. Paulista, 1000',
    municipio: 'São Paulo',
    uf: 'sp',
    ...extra,
  }
  for (const [k, v] of Object.entries(base)) f.set(k, v)
  return f
}

describe('máscaras', () => {
  it('acompanha a digitação e para onde os dígitos acabam', () => {
    expect(aplicarMascara('0131', '00000-000')).toBe('0131')
    expect(aplicarMascara('013101', '00000-000')).toBe('01310-1')
    expect(mascararCep('01310100')).toBe('01310-100')
    expect(mascararCep('013101009999')).toBe('01310-100')
  })
  it('documento: até 11 dígitos é CPF, acima é CNPJ', () => {
    expect(mascararDocumento(CPF)).toBe('529.982.247-25')
    expect(mascararDocumento(CNPJ)).toBe('11.222.333/0001-81')
    expect(mascararDocumento('112223330')).toBe('112.223.330')
  })
  it('telefone muda de máscara conforme o tipo (bTeIL/bTxqN)', () => {
    expect(mascararTelefone('11987654321', 3)).toBe('(11) 9 8765-4321')
    expect(mascararTelefone('1133334444', 2)).toBe('(11) 3333-4444')
    expect(mascararTelefone('08007771234', 1)).toBe('0800-777-1234')
  })
})

describe('podeBloquearFilial (cadastros [DÚVIDA 4])', () => {
  it('Diretor, Gerente ou Financeiro', () => {
    expect(podeBloquearFilial(usuario(1, 3))).toBe(true)
    expect(podeBloquearFilial(usuario(2, 3))).toBe(true)
    expect(podeBloquearFilial(usuario(4, 2))).toBe(true)
    expect(podeBloquearFilial(usuario(3, 3))).toBe(false)
    expect(podeBloquearFilial(usuario(4, 4))).toBe(false)
  })
})

describe('validarFilial', () => {
  it('filial nova válida: documento só dígitos, tipo_pessoa derivado, CEP com máscara, UF maiúscula', () => {
    const r = validarFilial(formFilial(), 'cliente', null)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.dados.documento).toBe(CNPJ)
    expect(r.dados.tipo_pessoa).toBe('cnpj')
    expect(r.dados.cep).toBe('01310-100')
    expect(r.dados.uf).toBe('SP')
    expect(r.dados.nome_endereco).toBe('Loja Teste') // vazio → fantasia
    expect(r.dados.liberado).toBe(true)
    expect(r.dados.liberado_motivo).toBeNull()
    expect(r.avisos).toEqual([])
  })

  it('CPF vira tipo_pessoa cpf', () => {
    const r = validarFilial(formFilial({ documento: CPF }), 'cliente', null)
    expect(r.ok && r.dados.tipo_pessoa).toBe('cpf')
  })

  it('documento novo com DV errado é recusado', () => {
    const r = validarFilial(formFilial({ documento: '11222333000182' }), 'cliente', null)
    expect(r).toEqual({ ok: false, erro: 'CNPJ inválido: confira os dígitos.' })
    expect(validarFilial(formFilial({ documento: '123' }), 'cliente', null).ok).toBe(false)
    expect(validarFilial(formFilial({ documento: '' }), 'cliente', null).ok).toBe(false)
  })

  it('legado inválido SEM mudança continua gravável, com aviso e o tipo gravado', () => {
    const anterior = { documento: '·', tipo_pessoa: 'cnpj' as const, cep: '0131' }
    const r = validarFilial(formFilial({ documento: '·', cep: '0131' }), 'cliente', anterior)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.dados.documento).toBeNull()
    expect(r.dados.tipo_pessoa).toBe('cnpj')
    expect(r.dados.cep).toBe('0131')
    expect(r.avisos.length).toBe(2)
  })

  it('legado com DV inválido sem mudança: grava e avisa; mudou → exige válido', () => {
    const anterior = { documento: '11222333000182', tipo_pessoa: 'cnpj' as const, cep: '01310-100' }
    const igual = validarFilial(formFilial({ documento: '11.222.333/0001-82' }), 'cliente', anterior)
    expect(igual.ok).toBe(true)
    if (igual.ok) expect(igual.avisos[0]).toMatch(/inválido/)
    const mudou = validarFilial(formFilial({ documento: '11222333000183' }), 'cliente', anterior)
    expect(mudou.ok).toBe(false)
  })

  it('obrigatórios do Bubble: regime, razão, fantasia, CEP, logradouro, município, UF', () => {
    for (const campo of ['regime_tributario_id', 'razao', 'fantasia', 'cep', 'logradouro', 'municipio', 'uf']) {
      expect(validarFilial(formFilial({ [campo]: '' }), 'cliente', null).ok, campo).toBe(false)
    }
  })

  it('bloquear exige motivo; liberada limpa o motivo', () => {
    expect(validarFilial(formFilial({ bloqueada: 'on', liberado_motivo: '' }), 'cliente', null)).toEqual({
      ok: false,
      erro: 'Para bloquear a filial, escreva o motivo.',
    })
    const b = validarFilial(formFilial({ bloqueada: 'on', liberado_motivo: 'Inadimplente' }), 'cliente', null)
    expect(b.ok && [b.dados.liberado, b.dados.liberado_motivo]).toEqual([false, 'Inadimplente'])
    const l = validarFilial(formFilial({ liberado_motivo: 'antigo' }), 'cliente', null)
    expect(l.ok && l.dados.liberado_motivo).toBeNull()
  })

  it('informações adicionais só valem para cliente', () => {
    const extra = { corporativo: 'on', frete_id: '2', nome_comprador: 'Ana', observacoes: 'x' }
    const c = validarFilial(formFilial(extra), 'cliente', null)
    expect(c.ok && [c.dados.corporativo, c.dados.frete_id, c.dados.nome_comprador]).toEqual([true, 2, 'Ana'])
    const f = validarFilial(formFilial(extra), 'fornecedor', null)
    expect(f.ok && [f.dados.corporativo, f.dados.frete_id, f.dados.nome_comprador]).toEqual([false, null, null])
  })
})

describe('deveTornarPrincipal ([DÚVIDA 1])', () => {
  const base = { pediu: false, jaEraPrincipal: false, grupoTemPrincipal: true, ativa: true }
  it('primeira filial do grupo vira principal sozinha', () => {
    expect(deveTornarPrincipal({ ...base, grupoTemPrincipal: false })).toBe(true)
  })
  it('só troca quando pedido', () => {
    expect(deveTornarPrincipal(base)).toBe(false)
    expect(deveTornarPrincipal({ ...base, pediu: true })).toBe(true)
  })
  it('já principal não regrava; inativa não vira principal', () => {
    expect(deveTornarPrincipal({ ...base, pediu: true, jaEraPrincipal: true })).toBe(false)
    expect(deveTornarPrincipal({ ...base, pediu: true, ativa: false })).toBe(false)
  })
})

describe('validarContato', () => {
  function formContato(extra: Record<string, string>) {
    const f = new FormData()
    for (const [k, v] of Object.entries({ nome: 'Maria Souza', ...extra })) f.set(k, v)
    return f
  }

  it('padrão Celular; telefone gravado com máscara; e-mail minúsculo', () => {
    const r = validarContato(formContato({ telefone: '11987654321', email: 'Maria@Exemplo.com.br' }), null)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.dados.tipo_telefone_id).toBe(3)
    expect(r.dados.telefone).toBe('(11) 9 8765-4321')
    expect(r.dados.email).toBe('maria@exemplo.com.br')
    expect(r.dados.endereco_id).toBeNull()
  })

  it('telefone com dígitos errados para o tipo é recusado', () => {
    const r = validarContato(formContato({ telefone: '1133334444', tipo_telefone_id: '3' }), null)
    expect(r).toEqual({ ok: false, erro: 'Telefone celular precisa de 11 dígitos.' })
    const fixo = validarContato(formContato({ telefone: '1133334444', tipo_telefone_id: '2' }), null)
    expect(fixo.ok && fixo.dados.telefone).toBe('(11) 3333-4444')
  })

  it('telefone legado sem mudança passa com aviso', () => {
    const r = validarContato(formContato({ telefone: '11 3333-444' }), '11 3333-444')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.dados.telefone).toBe('11 3333-444')
      expect(r.avisos.length).toBe(1)
    }
  })

  it('nome obrigatório, e-mail e filial validados', () => {
    expect(validarContato(formContato({ nome: '' }), null).ok).toBe(false)
    expect(validarContato(formContato({ email: 'sem-arroba' }), null).ok).toBe(false)
    expect(validarContato(formContato({ endereco_id: 'x' }), null).ok).toBe(false)
    expect(validarContato(formContato({ tipo_telefone_id: '9' }), null).ok).toBe(false)
  })
})
