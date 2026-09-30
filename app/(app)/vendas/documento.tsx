'use client'

import Image from 'next/image'

import { Foto } from '@/componentes/foto'
import { formatarData } from '@/lib/datas'
import { formatarAliquota, formatarReais } from '@/lib/dinheiro'
import { formatarDocumento } from '@/lib/documento'
import { ETAPA, formatarDia, formatarQuantidade } from '@/lib/vendas'

import type { DocumentoItem, EntregaFicha, Ficha } from './tipos'
import type { EnderecoDoc } from './tipos-fluxo'

/*
 * DOCUMENTO ao vivo: o que o cliente (proposta) ou o cliente e o fornecedor (pedido) recebem —
 * vendas.md §2.8 `gp exibe proposta` (bTacB…bTpwD, captura vendas-05) e §2.9
 * `gp pedido corpoarquivo` (captura vendas-06). Só leitura: nenhum valor é calculado aqui —
 * bruto por item, total e unitário líquido vêm de v_proposta_documento_itens (db/024); as
 * entregas trazem os valores das colunas geradas (009).
 *
 * "Ao vivo": a tela passa o RASCUNHO do formulário (o que o vendedor está digitando) e cada
 * campo ainda não gravado aparece marcado (`data-rascunho`), como caneta marca-texto no papel.
 * O documento é "papel": claro nos dois temas, como o PDF (paleta .doc de vendas.css).
 */

/** Empresa emissora 1 = Megabox (db/003): a única com logo publicado (public/marca). */
const MEGABOX = 1

/** Telefones fixos do cabeçalho (bTacN), iguais para todo consultor. */
const TELEFONES = ['(11) 3509-4670', '(62) 3142-5356 (Região DDD 62)', '0800-591-0248 (Demais localidades)', '(62) 99383-7165 Whatsapp']

/** bTacp: crédito de impostos por regime. */
function AvisoImpostos() {
  return (
    <div className="doc-aviso">
      <p>
        - Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será possível
        considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do enquadramento
        tributário de sua empresa.
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

/** bTpwD: condições gerais fixas (as mesmas na proposta e no pedido). */
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
  return { nome: i.produto_nome ?? '—', detalhe: [i.condicao_nome, i.linha_nome, i.medida].filter(Boolean).join(' - ') }
}

/** Destinos "CIDADE - UF" dos itens (bTafB), sem repetir. */
function destinos(itens: DocumentoItem[]): string {
  const lista = itens.filter((i) => i.destino_uf).map((i) => `${(i.destino_municipio ?? '').toUpperCase()} - ${i.destino_uf}`.replace(/^ - /, ''))
  return [...new Set(lista)].join(', ') || '—'
}

function Linha({ rotulo, rascunho, children }: { rotulo: string; rascunho?: boolean; children: React.ReactNode }) {
  return (
    <p className="doc-linha">
      <b>{rotulo}:</b> <span data-rascunho={rascunho || undefined}>{children}</span>
    </p>
  )
}

function Cabecalho({ ficha, consultor, titulo, data }: { ficha: Ficha; consultor: string; titulo: string; data: string }) {
  const c = ficha.cotacao
  const empresa = ficha.empresaEmissora
  return (
    <>
      <header className="doc-topo">
        {c.empresa_emissora_id === MEGABOX ? (
          // Sempre o logo CLARO: o documento é "papel" nos dois temas (public/marca/LEIA-ME.md).
          <Image className="doc-logo" src="/marca/logo-megabox-claro.png" alt={empresa?.nome ?? 'Megabox'} width={223} height={60} />
        ) : (
          <strong className="doc-logo-texto">{empresa?.nome ?? c.empresa?.nome ?? '—'}</strong>
        )}
        <div className="doc-consultor">
          <p>
            <b>Consultor:</b> {consultor}
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
        <span>{titulo}</span>
        <span>{dataPorExtenso(data)}</span>
      </div>
    </>
  )
}

/** Tabela de itens (bTacv): mesma na proposta e no pedido; o pedido acrescenta as entregas. */
function TabelaItens({
  itens,
  incompleta,
  entregasDe,
}: {
  itens: DocumentoItem[]
  incompleta: boolean
  entregasDe?: (i: DocumentoItem) => EntregaFicha[]
}) {
  const total = itens[0]?.total_proposta ?? null
  return (
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
                {incompleta ? 'Os itens não carregaram. Recarregue a página.' : 'Sem itens.'}
              </td>
            </tr>
          ) : (
            itens.flatMap((i) => {
              const d = descricao(i)
              const ents = entregasDe?.(i) ?? []
              const linha = (
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
              if (!entregasDe) return [linha]
              return [
                linha,
                <tr key={`${i.id}-ent`} className="doc-entregas-linha">
                  <td colSpan={8}>
                    {ents.length === 0 ? (
                      <p className="doc-vazio" data-rascunho>
                        Entregas ainda não programadas.
                      </p>
                    ) : (
                      <table className="doc-tabela doc-entregas">
                        <thead>
                          <tr>
                            <th scope="col">Data entrega</th>
                            <th scope="col">Qtd entrega</th>
                            <th scope="col">Valor bruto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ents.map((e) => (
                            <tr key={e.id} data-status={e.status_id}>
                              <td>{formatarDia(e.dt_prev_entrega)}</td>
                              <td>{formatarQuantidade(e.qtd)}</td>
                              <td>{formatarReais(e.valor_venda_bruto)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>,
              ]
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

function CondicoesGerais() {
  return (
    <>
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
    </>
  )
}

// ==================================================================== PROPOSTA

/** O que a tela passa ao documento da proposta: gravado + rascunho, já resolvido. */
export type VistaProposta = {
  id: string
  numero: number
  criado_em: string
  consultor: string
  clienteNome: string
  contatoNome: string | null
  contatoTelefone: string | null
  faturar: EnderecoDoc | null
  condicao: string | null
  dataPrevEntrega: string | null
  infoAdicional: string | null
  fornecedorCnpj: { documento: string | null; razao: string | null } | null
  /** campos com rascunho não gravado (marcados no papel) */
  rascunho: Partial<Record<'contato' | 'faturar' | 'condicao' | 'data' | 'info' | 'numero', boolean>>
}

export function DocumentoProposta({ ficha, vista }: { ficha: Ficha; vista: VistaProposta }) {
  const c = ficha.cotacao
  const itens = ficha.documentoItens.filter((i) => i.proposta_id === vista.id)
  const r = vista.rascunho
  const cidade = vista.faturar ? [vista.faturar.municipio, vista.faturar.uf].filter(Boolean).join('/') : ''
  return (
    <article className="doc" aria-label={`Documento da proposta ${c.numero}/${vista.numero}`} data-teste="documento-proposta">
      <Cabecalho ficha={ficha} consultor={vista.consultor} titulo={`Proposta núm: ${c.numero}/${vista.numero}`} data={vista.criado_em} />
      <section className="doc-cliente">
        <Foto url={ficha.clienteFoto ?? null} nome={vista.clienteNome} className="doc-avatar" iniciais={vista.clienteNome.slice(0, 2).toUpperCase()} />
        <div>
          <Linha rotulo="Cliente">{vista.faturar?.razao || vista.clienteNome}</Linha>
          <Linha rotulo="A/C" rascunho={r.contato}>
            {vista.contatoNome ?? '—'}
          </Linha>
          <Linha rotulo="CNPJ" rascunho={r.faturar}>
            {vista.faturar?.documento ? formatarDocumento(vista.faturar.documento) : '—'}
          </Linha>
          <Linha rotulo="Telefone" rascunho={r.contato}>
            {vista.contatoTelefone || '—'}
          </Linha>
          <Linha rotulo="Cidade" rascunho={r.faturar}>
            {cidade || '—'}
          </Linha>
        </div>
      </section>
      <AvisoImpostos />
      <h3 className="doc-faixa">Itens da proposta</h3>
      <TabelaItens itens={itens} incompleta={ficha.incompleta} />
      <h3 className="doc-faixa">Condições da proposta</h3>
      <section className="doc-condicoes">
        <Linha rotulo="Validade">{formatarData(c.data_validade)}</Linha>
        <Linha rotulo="Condições de pagamento" rascunho={r.condicao}>
          {vista.condicao || '—'}
        </Linha>
        <Linha rotulo="Destinos">{destinos(itens)}</Linha>
        <Linha rotulo="Data prevista entrega" rascunho={r.data}>
          {formatarDia(vista.dataPrevEntrega)}
        </Linha>
        {vista.fornecedorCnpj?.documento ? (
          <Linha rotulo="CNPJ faturamento">
            {formatarDocumento(vista.fornecedorCnpj.documento)}
            {vista.fornecedorCnpj.razao ? ` - ${vista.fornecedorCnpj.razao}` : ''}
          </Linha>
        ) : null}
        <Linha rotulo="Informações adicionais" rascunho={r.info}>
          {vista.infoAdicional || '—'}
        </Linha>
        <CondicoesGerais />
      </section>
    </article>
  )
}

// ====================================================================== PEDIDO

function Endereco({ e, vazio }: { e: EnderecoDoc | null | undefined; vazio: string }) {
  if (!e) return <p className="doc-falta">{vazio}</p>
  const rua = [e.logradouro, e.numero, e.complemento].filter(Boolean).join(', ')
  const cidade = [e.bairro, e.municipio, e.uf, e.cep].filter(Boolean).join(' - ')
  return (
    <>
      <p>
        <b>Razão:</b> {e.razao || e.nome_endereco}
      </p>
      <p>
        <b>Endereço:</b> {[rua, cidade].filter(Boolean).join(' - ') || '—'}
      </p>
      <p>
        <b>CNPJ:</b> {e.documento ? formatarDocumento(e.documento) : '—'}
      </p>
      <p>
        <b>Insc. Est.:</b> {e.insc_estadual || '—'}
      </p>
    </>
  )
}

export type VistaPedido = {
  pedidoId: string
  numero: string
  propostaId: string | null
  criado_em: string
  consultor: string
  ordemCompra: string | null
  infoAdicional: string | null
  /** "30/60/90 dd — Boleto" */
  pagamento: string
  itens: { orcamento_fornecedor_id: string; origem: EnderecoDoc | null; destino: EnderecoDoc | null; fornecedor: string }[]
  faturar: EnderecoDoc | null
  rascunho: Partial<Record<'oc' | 'info' | 'pagamento', boolean>>
}

export function DocumentoPedido({ ficha, vista }: { ficha: Ficha; vista: VistaPedido }) {
  const itens = ficha.documentoItens.filter((i) => i.proposta_id === vista.propostaId)
  const r = vista.rascunho
  // Documento item ↔ orçamento: pela ordem da proposta (mesma ordem de criado_em, id).
  const orcDoItem = (i: DocumentoItem) =>
    ficha.propostas.find((p) => p.id === vista.propostaId)?.itens.find((x) => x.id === i.id)?.orcamento?.id ?? null
  const entregasDe = (i: DocumentoItem) => {
    const orc = orcDoItem(i)
    return ficha.entregas.filter((e) => e.pedido_id === vista.pedidoId && e.orcamento_fornecedor_id === orc && e.status_id !== ETAPA.CANCELADO)
  }
  // Um bloco de faturamento por FORNECEDOR (origem), e um "Enviar para" por destino.
  const origens = [...new Map(vista.itens.filter((i) => i.origem).map((i) => [i.origem!.id, i])).values()]
  const destinosEnd = [...new Map(vista.itens.filter((i) => i.destino).map((i) => [i.destino!.id, i.destino!])).values()]

  return (
    <article className="doc" aria-label={`Documento do pedido ${vista.numero}`} data-teste="documento-pedido">
      <Cabecalho ficha={ficha} consultor={vista.consultor} titulo={`Pedido núm: ${vista.numero}`} data={vista.criado_em} />
      <h3 className="doc-faixa">Detalhes do pedido</h3>
      <section className="doc-bloco">
        {origens.length === 0 ? (
          <p className="doc-falta">Dados de faturamento do fornecedor indisponíveis.</p>
        ) : (
          origens.map((o) => (
            <div key={o.origem!.id}>
              <p>
                <b>Dados de faturamento</b> ({o.fornecedor})
              </p>
              <Endereco e={o.origem} vazio="—" />
            </div>
          ))
        )}
      </section>
      <section className="doc-enderecos">
        <div>
          <p className="doc-rotulo">Enviar para</p>
          {destinosEnd.length === 0 ? (
            <p className="doc-falta">Selecione um endereço para entrega</p>
          ) : (
            destinosEnd.map((d) => <Endereco key={d.id} e={d} vazio="" />)
          )}
        </div>
        <div>
          <p className="doc-rotulo">Faturar para</p>
          <Endereco e={vista.faturar} vazio="Selecione um endereço para faturamento" />
        </div>
      </section>
      <TabelaItens itens={itens} incompleta={ficha.incompleta} entregasDe={entregasDe} />
      <h3 className="doc-faixa">Informações adicionais</h3>
      <section className="doc-condicoes">
        <p className="doc-oc" data-rascunho={r.oc || undefined}>
          Número da Ordem de compra: {vista.ordemCompra || '—'}
        </p>
        <Linha rotulo="Informações adicionais" rascunho={r.info}>
          {vista.infoAdicional || '—'}
        </Linha>
        <Linha rotulo="Condições de pagamento" rascunho={r.pagamento}>
          {vista.pagamento || '—'}
        </Linha>
        <CondicoesGerais />
      </section>
    </article>
  )
}
