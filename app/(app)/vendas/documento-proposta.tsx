'use client'

import Image from 'next/image'

import { Foto } from '@/componentes/foto'
import { formatarData } from '@/lib/datas'
import { formatarAliquota, formatarReais } from '@/lib/dinheiro'
import { formatarDocumento } from '@/lib/documento'
import { formatarDia, formatarQuantidade } from '@/lib/vendas'

import type { DocumentoItem, Ficha, Proposta } from './tipos'

/*
 * DOCUMENTO da proposta: a pré-visualização do que o cliente recebe (vendas.md §2.8
 * `gp exibe proposta`, mapa bTacB…bTpwD; captura vendas-05). Só leitura: nenhum valor é
 * calculado aqui — bruto por item, total e unitário líquido vêm de v_proposta_documento_itens
 * (db/024), sobre o SNAPSHOT de proposta_itens. O documento é "papel": fica claro nos dois
 * temas, como o PDF que sai para o cliente.
 */

/** Empresa emissora 1 = Megabox (db/003): a única com logo publicado (public/marca). */
const MEGABOX = 1

/** Telefones fixos do cabeçalho (bTacN), iguais para todo consultor. */
const TELEFONES = [
  '(11) 3509-4670',
  '(62) 3142-5356 (Região DDD 62)',
  '0800-591-0248 (Demais localidades)',
  '(62) 99383-7165 Whatsapp',
]

/** bTacp: crédito de impostos por regime. */
function AvisoImpostos() {
  return (
    <div className="doc-aviso">
      <p>
        - Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será
        possível considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do
        enquadramento tributário de sua empresa.
      </p>
      <p>
        - Se positivo, o VALOR LÍQUIDO poderá ser considerado para fins de comparação com outras cotações, pois sua
        empresa se CREDITA desses impostos.
      </p>
      <ul>
        <li>Empresa de Lucro Real: Pode creditar de ICMS, PIS/COFINS e IPI</li>
        <li>Empresa de Lucro Presumido: Pode se creditar apenas do ICMS</li>
        <li>Empresa do Simples Nacional: Não pode se creditar desses impostos</li>
      </ul>
      <p>- Em caso de dúvidas procure seu departamento fiscal/contábil</p>
    </div>
  )
}

/** bTpwD: condições gerais fixas. */
const CONDICOES_GERAIS: { titulo: string; linhas: string[] }[] = [
  {
    titulo: 'Informações importantes sobre Paletes Usados',
    linhas: [
      'Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.',
      'Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.',
      'Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.',
      'É necessário realizar testes para confirmar que atendem às necessidades do cliente.',
      'Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.',
      'Paletes serão entrelaçados no envio (um encaixado dentro do outro).',
      'A descarga será de responsabilidade do cliente.',
    ],
  },
  {
    titulo: 'Informações importantes sobre Paletes Novos',
    linhas: [
      'Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).',
      'Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.',
      'Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.',
      'Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.',
      'Paletes serão entrelaçados no envio.',
      'A descarga será de responsabilidade do cliente.',
      'Para paletes fora de medida, recomenda-se o envio de amostra para teste.',
    ],
  },
  {
    titulo: 'Informações sobre Recebimento de Chapatex',
    linhas: ['A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.'],
  },
  {
    titulo: 'Informações sobre Frete CIF e Descarga',
    linhas: [
      'Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.',
      'Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.',
      'O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.',
    ],
  },
  {
    titulo: 'Informações sobre Pagamento',
    linhas: [
      'Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.',
      'Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.',
      'Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente.',
    ],
  },
]

const DATA_EXTENSO = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function dataPorExtenso(valor: string): string {
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return ''
  const t = DATA_EXTENSO.format(d)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** "Chapatex Usado" + "Usado - Linha - 1000x1200" (bTaeK/bTaeL). */
function descricao(i: DocumentoItem): { nome: string; detalhe: string } {
  return {
    nome: i.produto_nome ?? '—',
    detalhe: [i.condicao_nome, i.linha_nome, i.medida].filter(Boolean).join(' - '),
  }
}

/** Destinos "CIDADE - UF" dos itens (bTafB), sem repetir. */
function destinos(itens: DocumentoItem[]): string {
  const lista = itens
    .filter((i) => i.destino_uf)
    .map((i) => `${(i.destino_municipio ?? '').toUpperCase()} - ${i.destino_uf}`.replace(/^ - /, ''))
  return [...new Set(lista)].join(', ') || '—'
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <p className="doc-linha">
      <b>{rotulo}:</b> {children}
    </p>
  )
}

export function DocumentoProposta({ ficha, proposta }: { ficha: Ficha; proposta: Proposta }) {
  const c = ficha.cotacao
  const empresa = ficha.empresaEmissora
  const itens = ficha.documentoItens.filter((i) => i.proposta_id === proposta.id)
  const total = itens[0]?.total_proposta ?? null
  const faturar = proposta.faturar
  const clienteNome = faturar?.grupo?.nome ?? c.cliente?.nome ?? '—'
  const cidade = faturar ? [faturar.municipio, faturar.uf].filter(Boolean).join('/') : ''
  const cnpjFornecedor = proposta.fornecedor_cnpj

  return (
    <article className="doc" aria-label={`Documento da proposta ${c.numero}/${proposta.numero}`} data-teste="documento-proposta">
      <header className="doc-topo">
        {c.empresa_emissora_id === MEGABOX ? (
          // Sempre o logo CLARO: o documento é "papel" nos dois temas (public/marca/LEIA-ME.md).
          <Image className="doc-logo" src="/marca/logo-megabox-claro.png" alt={empresa?.nome ?? 'Megabox'} width={223} height={60} />
        ) : (
          <strong className="doc-logo-texto">{empresa?.nome ?? c.empresa?.nome ?? '—'}</strong>
        )}
        <div className="doc-consultor">
          <p>
            <b>Consultor:</b> {proposta.vendedor?.nome ?? c.vendedor?.nome ?? '—'}
          </p>
          {empresa?.email ? (
            <p>
              <b>Email:</b> {empresa.email}
            </p>
          ) : null}
          {TELEFONES.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </header>

      <div className="doc-faixa">
        <span>
          Proposta núm: {c.numero}/{proposta.numero}
        </span>
        <span>{dataPorExtenso(proposta.criado_em)}</span>
      </div>

      <section className="doc-cliente">
        <Foto url={ficha.clienteFoto ?? null} nome={clienteNome} className="doc-avatar" iniciais={clienteNome.slice(0, 2).toUpperCase()} />
        <div>
          <Linha rotulo="Cliente">{clienteNome}</Linha>
          <Linha rotulo="A/C">{proposta.contato?.nome ?? '—'}</Linha>
          <Linha rotulo="CNPJ">{faturar?.documento ? formatarDocumento(faturar.documento) : '—'}</Linha>
          <Linha rotulo="Telefone">{proposta.contato?.telefone || '—'}</Linha>
          <Linha rotulo="Cidade">{cidade || '—'}</Linha>
        </div>
      </section>

      <AvisoImpostos />

      <h3 className="doc-faixa">Itens da proposta</h3>
      <div className="doc-rolagem">
        <table className="doc-tabela">
          <thead>
            <tr>
              <th scope="col">Qtd</th>
              <th scope="col">Descrição</th>
              <th scope="col">
                Preço unitário
                <small>líquido de impostos</small>
              </th>
              <th scope="col">Frete</th>
              <th scope="col">Alíquota ICMS</th>
              <th scope="col">Alíquota PIS/COFINS</th>
              <th scope="col">
                Preço unitário bruto
                <small>impostos inclusos</small>
              </th>
              <th scope="col">
                Valor total bruto
                <small className="doc-total" data-teste="documento-total">
                  {formatarReais(total)}
                </small>
              </th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan={8} className="doc-vazio">
                  {ficha.incompleta ? 'Os itens não carregaram. Recarregue a página.' : 'Proposta sem itens.'}
                </td>
              </tr>
            ) : (
              itens.map((i) => {
                const d = descricao(i)
                return (
                  <tr key={i.id}>
                    <td>{formatarQuantidade(i.qtd)}</td>
                    <th scope="row">
                      {d.nome}
                      {d.detalhe ? <small>{d.detalhe}</small> : null}
                    </th>
                    <td>{formatarReais(i.valor_unit_liquido)}</td>
                    <td>
                      {i.frete_nome ?? '—'}
                      <small>{formatarReais(i.valor_frete)}</small>
                    </td>
                    <td>{formatarAliquota(i.aliquota_icms)}</td>
                    <td>{formatarAliquota(i.aliquota_pis_cofins)}</td>
                    <td>{formatarReais(i.valor_venda_unit)}</td>
                    <td>{formatarReais(i.valor_total_bruto)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <h3 className="doc-faixa">Condições da proposta</h3>
      <section className="doc-condicoes">
        <Linha rotulo="Validade">{formatarData(c.data_validade)}</Linha>
        <Linha rotulo="Condições de pagamento">{proposta.condicao_pagamento || '—'}</Linha>
        <Linha rotulo="Destinos">{destinos(itens)}</Linha>
        <Linha rotulo="Data prevista entrega">{formatarDia(proposta.data_prev_entrega)}</Linha>
        {cnpjFornecedor?.documento ? (
          <Linha rotulo="CNPJ faturamento">
            {formatarDocumento(cnpjFornecedor.documento)}
            {cnpjFornecedor.razao ? ` - ${cnpjFornecedor.razao}` : ''}
          </Linha>
        ) : null}
        <Linha rotulo="Informações adicionais">{proposta.info_adicional || '—'}</Linha>
        {CONDICOES_GERAIS.map((g) => (
          <div key={g.titulo} className="doc-geral">
            <b>{g.titulo}</b>
            <ul>
              {g.linhas.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </article>
  )
}
