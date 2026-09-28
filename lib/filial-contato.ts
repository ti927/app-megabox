/**
 * Regras puras do cadastro de FILIAL (`enderecos_clifor`) e de CONTATO (`contatos_clifor`),
 * dentro da ficha do grupo na página `cadastros`.
 *
 * Fonte: specs/paginas/enderecos-e-contatos.md (§2.3 campos, §4.2 gravação, §4.4 aviso de
 * documento repetido, §4.5 principal, §4.8 contatos, §8.4 validação no servidor) e
 * specs/paginas/cadastros.md §4.5 (bloqueio). Sem acesso a banco: a server action confere
 * o que depende de tabela (UF em `ufs`, regime, frete, filial do mesmo grupo).
 */

import type { UsuarioAtual } from '@/lib/autorizacao'
import { documentoValido, somenteDigitos } from '@/lib/documento'

// ------------------------------------------------------------------------- máscaras

/**
 * Encaixa os dígitos num padrão em que `0` é um dígito ("00000-000"), parando onde os
 * dígitos acabam — é a máscara que acompanha a digitação (plugin de máscara do Bubble,
 * enderecos-e-contatos §6). Dígito que sobra é descartado.
 */
export function aplicarMascara(digitos: string, padrao: string): string {
  const d = somenteDigitos(digitos)
  let saida = ''
  let i = 0
  for (const c of padrao) {
    if (i >= d.length) break
    if (c === '0') saida += d[i++]
    else saida += c
  }
  return saida
}

/** Até 11 dígitos, CPF; acima, CNPJ (o rádio CPF/CNPJ do Bubble vira dedução pelo tamanho). */
export function mascararDocumento(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 14)
  return aplicarMascara(d, d.length > 11 ? '00.000.000/0000-00' : '000.000.000-00')
}

export function mascararCep(texto: string): string {
  return aplicarMascara(texto, '00000-000')
}

/** `tipos_telefone` (Opt.TipoTelefone): 1 Sac, 2 Fixo, 3 Celular. */
export const TIPO_TELEFONE = { sac: 1, fixo: 2, celular: 3 } as const
export type TipoTelefoneId = (typeof TIPO_TELEFONE)[keyof typeof TIPO_TELEFONE]

/** Máscara por tipo — `RadioButtons tipo telefone clifor` (bTeIL / bTxqN), §2.4. */
const MASCARA_TELEFONE: Record<TipoTelefoneId, string> = {
  1: '0000-000-0000',
  2: '(00) 0000-0000',
  3: '(00) 0 0000-0000',
}

export function mascararTelefone(texto: string, tipo: TipoTelefoneId): string {
  return aplicarMascara(texto, MASCARA_TELEFONE[tipo])
}

function digitosDoPadrao(padrao: string) {
  return [...padrao].filter((c) => c === '0').length
}

// ------------------------------------------------------------------------ permissões

const DEPTO_FINANCEIRO = 2

/**
 * Bloquear ou liberar filial: Diretor, Gerente ou departamento Financeiro.
 * No Bubble não há restrição nenhuma (pop.BloquearClifor, WF bUBbb/bUBbj, auto-binding);
 * specs/paginas/cadastros.md §10 [DÚVIDA 4] recomenda `hierarquia <= 2` ou Financeiro,
 * porque `liberado = false` trava a venda.
 */
export function podeBloquearFilial(u: UsuarioAtual): boolean {
  return u.perfilId <= 2 || u.departamentoId === DEPTO_FINANCEIRO
}

// ------------------------------------------------------------------------- utilidades

export type Validacao<T> = { ok: true; dados: T; avisos: string[] } | { ok: false; erro: string }

function texto(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : ''
}

function opcional(v: FormDataEntryValue | null, max: number): string | null | undefined {
  const t = texto(v)
  if (t === '') return null
  return t.length > max ? undefined : t
}

function inteiroPositivo(v: FormDataEntryValue | null): number | null {
  const t = texto(v)
  if (t === '') return null
  const n = Number(t)
  return Number.isInteger(n) && n > 0 && n < 32768 ? n : NaN
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ---------------------------------------------------------------------------- filial

export type DadosFilial = {
  nome_endereco: string
  razao: string
  fantasia: string
  documento: string | null
  tipo_pessoa: 'cpf' | 'cnpj'
  insc_estadual: string | null
  insc_municipal: string | null
  regime_tributario_id: number
  cep: string | null
  logradouro: string
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string
  uf: string
  // aba "Informações adicionais" — só cliente (bloco `esquerda`, §2.3)
  corporativo: boolean
  frete_id: number | null
  nome_comprador: string | null
  capacidade_compra: string | null
  demanda: string | null
  observacoes: string | null
  // bloqueio (cadastros §4.5)
  liberado: boolean
  liberado_motivo: string | null
}

/** O que já está gravado, quando é edição: o legado inválido continua editável. */
export type FilialAnterior = {
  documento: string | null
  tipo_pessoa: 'cpf' | 'cnpj'
  cep: string | null
}

/**
 * Valida o formulário da filial. Roda no SERVIDOR.
 *
 * Obrigatórios = os `mandatory=True` do Bubble (§4.2 "Validação"): documento, regime, razão,
 * fantasia, CEP, endereço, município e UF. O Bubble não confere dígito verificador nem CEP;
 * aqui confere (§8.4) — mas só para valor NOVO: documento ou CEP legado inválido que a
 * pessoa não mexeu continua gravável, com aviso (a base tem 23 documentos de tamanho
 * inválido, specs/04-duvidas.md §1.1).
 */
export function validarFilial(
  form: FormData,
  tipoGrupo: 'cliente' | 'fornecedor',
  anterior: FilialAnterior | null,
): Validacao<DadosFilial> {
  const avisos: string[] = []

  // ---- documento e tipo_pessoa (derivado: 11 dígitos = CPF, 14 = CNPJ)
  const documento = somenteDigitos(texto(form.get('documento'))) || null
  const docAnterior = anterior ? somenteDigitos(anterior.documento) || null : undefined
  const documentoMudou = anterior === null || documento !== docAnterior
  let tipo_pessoa: 'cpf' | 'cnpj'
  if (documentoMudou) {
    if (!documento) return { ok: false, erro: 'Informe o CNPJ ou o CPF.' }
    if (documento.length !== 11 && documento.length !== 14) {
      return { ok: false, erro: 'O documento precisa ter 11 dígitos (CPF) ou 14 (CNPJ).' }
    }
    if (!documentoValido(documento)) {
      return {
        ok: false,
        erro: `${documento.length === 14 ? 'CNPJ' : 'CPF'} inválido: confira os dígitos.`,
      }
    }
    tipo_pessoa = documento.length === 14 ? 'cnpj' : 'cpf'
  } else {
    // legado sem mudança: vale o que está gravado; só avisa
    if (documento && (documento.length === 11 || documento.length === 14)) {
      tipo_pessoa = documento.length === 14 ? 'cnpj' : 'cpf'
    } else {
      tipo_pessoa = anterior!.tipo_pessoa
    }
    if (!documento) avisos.push('Esta filial continua sem CNPJ/CPF. Complete assim que puder.')
    else if (!documentoValido(documento)) {
      avisos.push('O CNPJ/CPF gravado é inválido (veio do sistema antigo). Corrija assim que puder.')
    }
  }

  // ---- textos obrigatórios
  const razao = texto(form.get('razao'))
  if (!razao) return { ok: false, erro: 'Informe a razão social.' }
  const fantasia = texto(form.get('fantasia'))
  if (!fantasia) return { ok: false, erro: 'Informe o nome fantasia ou o nome completo.' }
  if (razao.length > 200 || fantasia.length > 200) {
    return { ok: false, erro: 'Razão social e nome fantasia vão até 200 caracteres.' }
  }
  // "Identificação do endereço" não é obrigatória no Bubble, mas a coluna é not null:
  // vazia, fica o nome fantasia.
  const nome_endereco = texto(form.get('nome_endereco')) || fantasia
  if (nome_endereco.length > 120) return { ok: false, erro: 'A identificação vai até 120 caracteres.' }

  const regime = inteiroPositivo(form.get('regime_tributario_id'))
  if (regime === null || Number.isNaN(regime)) {
    return { ok: false, erro: 'Escolha o regime tributário — ele decide o ICMS do orçamento.' }
  }

  // ---- CEP: 8 dígitos, guardado com a máscara 00000-000 (como o Bubble gravava)
  const cepDigitos = somenteDigitos(texto(form.get('cep')))
  const cepAnterior = anterior ? somenteDigitos(anterior.cep) : undefined
  let cep: string | null
  if (anterior === null || cepDigitos !== cepAnterior) {
    if (cepDigitos.length !== 8) return { ok: false, erro: 'O CEP precisa ter 8 dígitos.' }
    cep = mascararCep(cepDigitos)
  } else {
    cep = anterior.cep
    if (cepDigitos.length !== 8) avisos.push('O CEP gravado está incompleto. Corrija assim que puder.')
  }

  const logradouro = texto(form.get('logradouro'))
  if (!logradouro) return { ok: false, erro: 'Informe o endereço (logradouro).' }
  const municipio = texto(form.get('municipio'))
  if (!municipio) return { ok: false, erro: 'Informe o município.' }
  const uf = texto(form.get('uf')).toUpperCase()
  if (!/^[A-Z]{2}$/.test(uf)) return { ok: false, erro: 'Escolha a UF.' }

  const curtos = {
    insc_estadual: opcional(form.get('insc_estadual'), 30),
    insc_municipal: opcional(form.get('insc_municipal'), 30),
    numero: opcional(form.get('numero'), 20),
    complemento: opcional(form.get('complemento'), 120),
    bairro: opcional(form.get('bairro'), 120),
  }
  if (Object.values(curtos).some((v) => v === undefined) || logradouro.length > 200 || municipio.length > 120) {
    return { ok: false, erro: 'Algum campo do endereço passou do tamanho máximo.' }
  }

  // ---- informações adicionais (só cliente)
  const cliente = tipoGrupo === 'cliente'
  const frete = cliente ? inteiroPositivo(form.get('frete_id')) : null
  if (Number.isNaN(frete)) return { ok: false, erro: 'Tipo de frete inválido.' }
  const adicionais = {
    nome_comprador: cliente ? opcional(form.get('nome_comprador'), 120) : null,
    capacidade_compra: cliente ? opcional(form.get('capacidade_compra'), 120) : null,
    demanda: cliente ? opcional(form.get('demanda'), 120) : null,
    observacoes: cliente ? opcional(form.get('observacoes'), 2000) : null,
  }
  if (Object.values(adicionais).some((v) => v === undefined)) {
    return { ok: false, erro: 'Algum campo das informações adicionais passou do tamanho máximo.' }
  }

  // ---- bloqueio: bloquear exige motivo; liberar limpa o motivo corrente (a trilha fica na
  // auditoria de enderecos_clifor) — cadastros §10 [DÚVIDA 4] e [DÚVIDA 5]
  const bloqueada = form.get('bloqueada') === 'on'
  const motivo = texto(form.get('liberado_motivo'))
  if (bloqueada && motivo.length < 3) {
    return { ok: false, erro: 'Para bloquear a filial, escreva o motivo.' }
  }
  if (motivo.length > 500) return { ok: false, erro: 'O motivo do bloqueio vai até 500 caracteres.' }

  return {
    ok: true,
    avisos,
    dados: {
      nome_endereco,
      razao,
      fantasia,
      documento,
      tipo_pessoa,
      insc_estadual: curtos.insc_estadual ?? null,
      insc_municipal: curtos.insc_municipal ?? null,
      regime_tributario_id: regime,
      cep,
      logradouro,
      numero: curtos.numero ?? null,
      complemento: curtos.complemento ?? null,
      bairro: curtos.bairro ?? null,
      municipio,
      uf,
      corporativo: cliente && form.get('corporativo') === 'on',
      frete_id: frete,
      nome_comprador: adicionais.nome_comprador ?? null,
      capacidade_compra: adicionais.capacidade_compra ?? null,
      demanda: adicionais.demanda ?? null,
      observacoes: adicionais.observacoes ?? null,
      liberado: !bloqueada,
      liberado_motivo: bloqueada ? motivo : null,
    },
  }
}

/**
 * Principal (§4.5, [DÚVIDA 1]: um por grupo, marcado na primeira filial, trocável na tela).
 * Decide se esta gravação deve TORNAR a filial principal. Desmarcar não existe: para trocar,
 * marca-se outra — assim o grupo nunca fica sem principal por um clique.
 */
export function deveTornarPrincipal(opcoes: {
  pediu: boolean
  jaEraPrincipal: boolean
  grupoTemPrincipal: boolean
  ativa: boolean
}): boolean {
  if (opcoes.jaEraPrincipal) return false
  if (!opcoes.ativa) return false
  return opcoes.pediu || !opcoes.grupoTemPrincipal
}

// ---------------------------------------------------------------------------- contato

export type DadosContato = {
  nome: string
  cargo: string | null
  email: string | null
  telefone: string | null
  tipo_telefone_id: TipoTelefoneId
  endereco_id: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Valida o formulário do contato (WF bTxrd/bTxro). Nome obrigatório; tipo de telefone com
 * padrão Celular (condicional de bTxqN); telefone com a quantidade de dígitos do tipo,
 * gravado com a máscara (como o Bubble); e-mail em formato válido e em minúsculas.
 * Telefone legado fora do padrão, sem mudança, continua gravável com aviso.
 */
export function validarContato(form: FormData, telefoneAnterior: string | null): Validacao<DadosContato> {
  const avisos: string[] = []
  const nome = texto(form.get('nome'))
  if (nome.length < 2) return { ok: false, erro: 'Informe o nome do contato.' }
  if (nome.length > 200) return { ok: false, erro: 'O nome vai até 200 caracteres.' }

  const tipoBruto = Number(texto(form.get('tipo_telefone_id')) || TIPO_TELEFONE.celular)
  if (tipoBruto !== 1 && tipoBruto !== 2 && tipoBruto !== 3) {
    return { ok: false, erro: 'Tipo de telefone inválido.' }
  }
  const tipo = tipoBruto as TipoTelefoneId

  const telDigitos = somenteDigitos(texto(form.get('telefone')))
  let telefone: string | null = null
  if (telDigitos) {
    if (telefoneAnterior !== null && telDigitos === somenteDigitos(telefoneAnterior)) {
      telefone = telefoneAnterior
      if (telDigitos.length !== digitosDoPadrao(MASCARA_TELEFONE[tipo])) {
        avisos.push('O telefone gravado não bate com o tipo escolhido. Confira assim que puder.')
      }
    } else {
      const esperado = digitosDoPadrao(MASCARA_TELEFONE[tipo])
      if (telDigitos.length !== esperado) {
        const nomeTipo = tipo === 1 ? 'SAC' : tipo === 2 ? 'fixo' : 'celular'
        return { ok: false, erro: `Telefone ${nomeTipo} precisa de ${esperado} dígitos.` }
      }
      telefone = mascararTelefone(telDigitos, tipo)
    }
  }

  const email = texto(form.get('email')).toLowerCase() || null
  if (email && (!EMAIL.test(email) || email.length > 200)) return { ok: false, erro: 'E-mail inválido.' }

  const cargo = opcional(form.get('cargo'), 120)
  if (cargo === undefined) return { ok: false, erro: 'Cargo/departamento vai até 120 caracteres.' }

  const endereco = texto(form.get('endereco_id'))
  if (endereco && !UUID.test(endereco)) return { ok: false, erro: 'Filial inválida. Recarregue a página.' }

  return {
    ok: true,
    avisos,
    dados: {
      nome,
      cargo,
      email,
      telefone,
      tipo_telefone_id: tipo,
      endereco_id: endereco ? endereco.toLowerCase() : null,
    },
  }
}
