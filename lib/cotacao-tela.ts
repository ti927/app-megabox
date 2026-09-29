/**
 * Regras puras da tela de cotação em tela cheia (`pop add edita cotacao`, spec vendas §2.6,
 * §4.2 e §4.3): validação do cabeçalho, do carrinho e da edição inline dos orçamentos, e as
 * escolhas padrão dos selects.
 *
 * Nada aqui calcula dinheiro: valores digitados viram string exata (lerReais/lerQuantidade de
 * lib/vendas) e os totais continuam sendo das colunas geradas e do trigger do banco (db/007).
 */

import {
  ehDia,
  ehUuid,
  FRETE_CIF_INFORMADO,
  lerQuantidade,
  lerReais,
  type Validacao,
} from '@/lib/vendas'

function texto(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : ''
}

function idPequeno(v: FormDataEntryValue | null): number | null | 'invalido' {
  const t = texto(v)
  if (t === '') return null
  const n = Number(t)
  return Number.isInteger(n) && n > 0 && n < 1000 ? n : 'invalido'
}

// ------------------------------------------------------------------- cabeçalho

export type DadosCabecalho = {
  cotacao_id: string
  empresa_emissora_id: number
  data_validade: string
  amostra: boolean
}

/**
 * "Gravar/Salvar Cotação" (WFs bTOTR0 → bTOTX0 e bTOjP0 → bTOjb0): empresa, validade
 * (obrigatória) e amostra. A validade não pode ficar antes de hoje — exceto se é a que já
 * estava gravada: cotação antiga aberta para editar outra coisa não fica presa por isso.
 */
export function validarCabecalho(
  form: FormData,
  hoje: string,
  validadeAtual: string | null = null,
): Validacao<DadosCabecalho> {
  const cotacao = texto(form.get('cotacao_id'))
  if (!ehUuid(cotacao)) return { ok: false, erro: 'Cotação inválida. Recarregue a página.' }
  const empresa = Number(texto(form.get('empresa_emissora_id')))
  if (!Number.isInteger(empresa) || empresa <= 0 || empresa > 99) {
    return { ok: false, erro: 'Escolha a empresa emissora.' }
  }
  const validade = texto(form.get('data_validade'))
  if (!ehDia(validade)) return { ok: false, erro: 'Informe a data de validade.' }
  if (validade < hoje && validade !== validadeAtual) {
    return { ok: false, erro: 'A validade não pode ser anterior a hoje.' }
  }
  return {
    ok: true,
    dados: {
      cotacao_id: cotacao.toLowerCase(),
      empresa_emissora_id: empresa,
      data_validade: validade,
      amostra: form.get('amostra') === 'on',
    },
  }
}

// --------------------------------------------------------------------- carrinho

export type DadosProdutoCarrinho = {
  produto_id: string
  qtd: string
  condicao_id: number | null
  linha_id: number | null
  medida: string | null
}

/**
 * O que o formulário "Adicionar produto ao carrinho" manda (WFs bTNjj/bTOir0; edição bTOiR0),
 * sem cotação e sem destino: na cotação nova o rascunho ainda pode não existir, e o destino vem
 * do "Endereço de entrega" do cabeçalho.
 */
export function validarProdutoCarrinho(form: FormData): Validacao<DadosProdutoCarrinho> {
  const produto = texto(form.get('produto_id'))
  if (!ehUuid(produto)) return { ok: false, erro: 'Escolha o produto.' }
  const qtd = lerQuantidade(texto(form.get('qtd')))
  if (!qtd) return { ok: false, erro: 'Quantidade inválida (maior que zero, até 3 casas).' }
  const condicao = idPequeno(form.get('condicao_id'))
  const linha = idPequeno(form.get('linha_id'))
  if (condicao === 'invalido' || linha === 'invalido') return { ok: false, erro: 'Condição ou linha inválida.' }
  const medida = texto(form.get('medida'))
  if (medida.length > 500) return { ok: false, erro: 'A medida passa de 500 caracteres.' }
  return {
    ok: true,
    dados: {
      produto_id: produto.toLowerCase(),
      qtd,
      condicao_id: condicao,
      linha_id: linha,
      medida: medida || null,
    },
  }
}

/** Qtd digitada na linha do carrinho (WF bTOYp0 → bTOYv0 e bTOZB0). */
export function validarQtdItem(form: FormData): Validacao<{ item_id: string; qtd: string }> {
  const item = texto(form.get('item_id'))
  if (!ehUuid(item)) return { ok: false, erro: 'Item inválido. Recarregue a página.' }
  const qtd = lerQuantidade(texto(form.get('qtd')))
  if (!qtd) return { ok: false, erro: 'Quantidade inválida (maior que zero, até 3 casas).' }
  return { ok: true, dados: { item_id: item.toLowerCase(), qtd } }
}

// ------------------------------------------------------------------- orçamento

export type DadosEdicaoOrcamento = {
  orcamento_id: string
  valor_venda_unit: string
  valor_comissao_unit: string
  tipo_frete_id: number
  valor_frete: string
}

/**
 * Edição inline de um orçamento (auto-binding do Bubble: bTOXZ0 unitário, bTOXg0 comissão,
 * bTPGv frete, bTOSi0 tipo de frete). Frete só com "CIF Informado"; nos outros tipos vai 0
 * (bTOSo0). As alíquotas não vêm da tela: são do trigger fn_orcamento_derivados.
 */
export function validarEdicaoOrcamento(form: FormData): Validacao<DadosEdicaoOrcamento> {
  const id = texto(form.get('orcamento_id'))
  if (!ehUuid(id)) return { ok: false, erro: 'Orçamento inválido. Recarregue a página.' }
  const unit = lerReais(texto(form.get('valor_venda_unit')) || '0')
  if (unit === null) return { ok: false, erro: 'Valor unitário inválido (até 2 casas).' }
  const comissao = lerReais(texto(form.get('valor_comissao_unit')) || '0')
  if (comissao === null) return { ok: false, erro: 'Comissão unitária inválida (até 2 casas).' }
  const tipoFrete = Number(texto(form.get('tipo_frete_id')) || '1')
  if (!Number.isInteger(tipoFrete) || tipoFrete <= 0 || tipoFrete > 99) {
    return { ok: false, erro: 'Tipo de frete inválido.' }
  }
  const frete = tipoFrete === FRETE_CIF_INFORMADO ? lerReais(texto(form.get('valor_frete')) || '0') : '0.00'
  if (frete === null) return { ok: false, erro: 'Valor do frete inválido (até 2 casas).' }
  return {
    ok: true,
    dados: {
      orcamento_id: id.toLowerCase(),
      valor_venda_unit: unit,
      valor_comissao_unit: comissao,
      tipo_frete_id: tipoFrete,
      valor_frete: frete,
    },
  }
}

// ------------------------------------------------------------- escolhas padrão

type ComId = { id: string }
type Opcao = { id: number; nome: string }

/** Produto do select filtrado pelo "Tipo Produto" (ProdutosGrupo → ProdutosModelo, §2.6). */
export function produtosDoGrupo<T extends { grupo_id: string | null }>(produtos: T[], grupoId: string): T[] {
  return grupoId ? produtos.filter((p) => p.grupo_id === grupoId) : produtos
}

/**
 * Linha padrão ao escolher a condição: "Usado" se a condição for Usado (§2.6); senão, a única
 * linha possível do produto; senão nenhuma.
 */
export function linhaPadrao(condicao: Opcao | undefined, linhas: Opcao[]): string {
  const normal = (s: string) => s.trim().toLowerCase()
  if (condicao && normal(condicao.nome) === 'usado') {
    const usado = linhas.find((l) => normal(l.nome) === 'usado')
    if (usado) return String(usado.id)
  }
  return linhas.length === 1 ? String(linhas[0]!.id) : ''
}

/**
 * Endereço de entrega sugerido no cabeçalho: o do último produto do carrinho (continua o que a
 * pessoa vinha fazendo); senão o único endereço do cliente; senão nenhum ("Selecione o destino").
 */
export function destinoPadrao(
  itens: { endereco_destino_id: string }[],
  destinos: ComId[],
): string {
  const ids = new Set(destinos.map((d) => d.id))
  for (let i = itens.length - 1; i >= 0; i--) {
    const id = itens[i]!.endereco_destino_id
    if (ids.has(id)) return id
  }
  return destinos.length === 1 ? destinos[0]!.id : ''
}

/** "Nome – Município/UF" do endereço, como o select do Bubble. */
export function rotuloEndereco(d: { nome_endereco: string; uf: string; municipio: string | null }): string {
  return `${d.nome_endereco} – ${d.municipio ? `${d.municipio}/` : ''}${d.uf}`
}

/** Iniciais do avatar do cliente (a foto fica no Storage privado; o avatar é por iniciais). */
export function iniciais(nome: string | null | undefined): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[1]?.[0] ?? '') : '')).toUpperCase() || '?'
}

/**
 * Valor de reais do banco ("8.90") para o campo editável em pt-BR ("8,90"), sem passar por
 * float: é só troca de separador. Vazio/nulo vira "0,00".
 */
export function reaisParaCampo(valor: string | null | undefined): string {
  const t = (valor ?? '').trim()
  if (!/^-?\d+(\.\d+)?$/.test(t)) return '0,00'
  const [inteiro = '0', fracao = ''] = t.split('.')
  return `${inteiro},${(fracao + '00').slice(0, 2)}`
}

/** Quantidade do banco ("50000.000") para o campo ("50000" / "12,5"), sem float. */
export function qtdParaCampo(valor: string | null | undefined): string {
  const t = (valor ?? '').trim()
  if (!/^\d+(\.\d+)?$/.test(t)) return ''
  const [inteiro = '0', fracao = ''] = t.split('.')
  const f = fracao.replace(/0+$/, '')
  return f ? `${inteiro},${f}` : inteiro
}
