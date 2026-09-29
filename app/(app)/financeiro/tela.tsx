'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { formatarData } from '@/lib/datas'
import {
  type Aba,
  type FiltrosFinanceiro,
  formatarReaisExato as reais,
  hojeSP,
  paraCentavos,
  paraQuery,
  resumoSelecao,
  type Situacao,
  TIPOS_DATA,
  type TipoData,
  totalPaginas,
} from '@/lib/financeiro'

import { DialogoBaixaLote, DialogoCobranca, DialogoConfirmarEntrega, FichaContaDialogo } from './dialogo'
import type {
  ContaPagar,
  ContaReceber,
  EntregaPendente,
  FichaConta,
  ListaContas,
  Opcoes,
  Permissoes,
  Selecionada,
  Totais,
} from './tipos'

type Navegar = (mudancas: Partial<FiltrosFinanceiro>) => void

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'receber', rotulo: 'Contas a receber' },
  { id: 'pagar', rotulo: 'Contas a pagar' },
  { id: 'entregas', rotulo: 'Confirmar entregas' },
]

const NOME_STATUS: Record<number, string> = { 1: 'A receber', 2: 'Recebido', 3: 'A pagar', 4: 'Pago' }

// ------------------------------------------------------------------------- filtros

function Filtros({ filtros, opcoes, navegar }: { filtros: FiltrosFinanceiro; opcoes: Opcoes; navegar: Navegar }) {
  const [cliente, setCliente] = useState(filtros.cliente)
  const [fornecedor, setFornecedor] = useState(filtros.fornecedor)
  const [pedido, setPedido] = useState(filtros.pedido)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const contas = filtros.aba !== 'entregas'

  function filtrar(m: Partial<FiltrosFinanceiro>) {
    navegar({ pagina: 1, sel: null, ...m })
  }
  function digitar(set: (v: string) => void, campo: 'cliente' | 'fornecedor' | 'pedido', valor: string) {
    set(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => filtrar({ [campo]: valor.trim() }), 450)
  }

  const tipos = (Object.keys(TIPOS_DATA) as TipoData[]).filter(
    (t) => filtros.aba !== 'pagar' || TIPOS_DATA[t].pagar !== null,
  )
  const temFiltro =
    filtros.cliente !== '' ||
    filtros.fornecedor !== '' ||
    filtros.pedido !== '' ||
    filtros.vendedor !== null ||
    filtros.situacao !== '' ||
    filtros.arquivados

  return (
    <section className="fin-filtros" aria-label="Filtros">
      {contas ? (
        <>
          <label className="campo">
            <span>Tipo de data</span>
            <select
              value={filtros.data}
              onChange={(e) => filtrar({ data: e.target.value as TipoData })}
              disabled={filtros.situacao === 'vencidas'}
              data-teste="filtro-data"
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {TIPOS_DATA[t].rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>De</span>
            <input
              type="date"
              value={filtros.de}
              max={filtros.ate}
              disabled={filtros.situacao === 'vencidas'}
              onChange={(e) => e.target.value && filtrar({ de: e.target.value })}
            />
          </label>
          <label className="campo">
            <span>Até</span>
            <input
              type="date"
              value={filtros.ate}
              min={filtros.de}
              disabled={filtros.situacao === 'vencidas'}
              onChange={(e) => e.target.value && filtrar({ ate: e.target.value })}
            />
          </label>
          <label className="campo">
            <span>Situação</span>
            <select value={filtros.situacao} onChange={(e) => filtrar({ situacao: e.target.value as Situacao })}>
              <option value="">Todas</option>
              <option value="aberto">{filtros.aba === 'pagar' ? 'A pagar' : 'A receber'}</option>
              <option value="quitado">{filtros.aba === 'pagar' ? 'Pago' : 'Recebido'}</option>
              <option value="vencidas">Vencidas (todo o período)</option>
            </select>
          </label>
        </>
      ) : null}
      <label className="campo">
        <span>Cliente</span>
        <input
          type="search"
          value={cliente}
          placeholder="Parte do nome"
          onChange={(e) => digitar(setCliente, 'cliente', e.target.value)}
        />
      </label>
      <label className="campo">
        <span>Grupo fornecedor</span>
        <input
          type="search"
          value={fornecedor}
          placeholder="Parte do nome"
          onChange={(e) => digitar(setFornecedor, 'fornecedor', e.target.value)}
        />
      </label>
      <label className="campo">
        <span>Vendedor</span>
        <select value={filtros.vendedor ?? ''} onChange={(e) => filtrar({ vendedor: e.target.value || null })}>
          <option value="">Todos</option>
          {opcoes.vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome}
            </option>
          ))}
        </select>
      </label>
      {contas ? (
        <label className="campo">
          <span>Núm pedido</span>
          <input
            inputMode="numeric"
            value={pedido}
            onChange={(e) => digitar(setPedido, 'pedido', e.target.value)}
            placeholder="Número exato"
          />
        </label>
      ) : null}
      <div className="fin-filtros-fim">
        {filtros.aba === 'receber' ? (
          <label className="caixa">
            <input
              type="checkbox"
              checked={filtros.arquivados}
              onChange={(e) => filtrar({ arquivados: e.target.checked })}
            />
            Arquivadas
          </label>
        ) : null}
        {temFiltro ? (
          <button
            type="button"
            className="botao-secundario"
            onClick={() => {
              setCliente('')
              setFornecedor('')
              setPedido('')
              filtrar({ cliente: '', fornecedor: '', pedido: '', vendedor: null, situacao: '', arquivados: false })
            }}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------- cards

function Card({
  titulo,
  qtd,
  valor,
  detalhe,
  tom,
  ativo,
  aoClicar,
  teste,
}: {
  titulo: string
  qtd: number
  valor: string
  detalhe?: string
  tom: 'roxo' | 'verde' | 'vermelho' | 'azul'
  ativo?: boolean
  aoClicar?: () => void
  teste?: string
}) {
  const corpo = (
    <>
      <span className="fin-card-titulo">
        {titulo} ({qtd.toLocaleString('pt-BR')})
      </span>
      <strong className="fin-card-valor numero">{reais(valor)}</strong>
      {detalhe ? <span className="fin-card-detalhe">{detalhe}</span> : null}
    </>
  )
  return aoClicar ? (
    <button type="button" className="fin-card" data-tom={tom} data-ativo={ativo || undefined} onClick={aoClicar} data-teste={teste}>
      {corpo}
    </button>
  ) : (
    <div className="fin-card" data-tom={tom} data-ativo={ativo || undefined} data-teste={teste}>
      {corpo}
    </div>
  )
}

// -------------------------------------------------------------------------- tabelas

function Paginacao({ filtros, total, navegar }: { filtros: FiltrosFinanceiro; total: number; navegar: Navegar }) {
  const paginas = totalPaginas(total)
  if (total === 0) return null
  return (
    <div className="paginacao">
      <span>
        Página {filtros.pagina} de {paginas} · {total.toLocaleString('pt-BR')} {total === 1 ? 'registro' : 'registros'}
      </span>
      {paginas > 1 ? (
        <nav aria-label="Páginas">
          <button
            type="button"
            className="botao-secundario"
            disabled={filtros.pagina <= 1}
            onClick={() => navegar({ pagina: filtros.pagina - 1, sel: null })}
          >
            ‹ Anterior
          </button>
          <button
            type="button"
            className="botao-secundario"
            disabled={filtros.pagina >= paginas}
            onClick={() => navegar({ pagina: filtros.pagina + 1, sel: null })}
          >
            Próxima ›
          </button>
        </nav>
      ) : null}
    </div>
  )
}

function Status({ id, vencida, saldo, baixado }: { id: number; vencida: boolean; saldo: string; baixado: string }) {
  const quitado = id === 2 || id === 4
  const parcial = !quitado && paraCentavos(baixado) > 0n
  return (
    <span className="fin-status">
      <span className="selo" data-tom={quitado ? 'ok' : vencida ? 'erro' : undefined}>
        {NOME_STATUS[id] ?? '—'}
      </span>
      {vencida ? (
        <span className="selo" data-tom="erro">
          Vencida
        </span>
      ) : null}
      {parcial ? (
        <span className="selo" data-tom="alerta" title={`Saldo ${reais(saldo)}`}>
          Parcial
        </span>
      ) : null}
    </span>
  )
}

function CabecalhoSelecao({
  linhas,
  marcadas,
  alternarTodas,
}: {
  linhas: { id: string; saldo: string }[]
  marcadas: Map<string, Selecionada>
  alternarTodas: (marcar: boolean) => void
}) {
  const abertas = linhas.filter((l) => paraCentavos(l.saldo) > 0n)
  const todas = abertas.length > 0 && abertas.every((l) => marcadas.has(l.id))
  return (
    <th scope="col" className="fin-col-sel">
      <input
        type="checkbox"
        aria-label={todas ? 'Desmarcar as contas desta página' : 'Marcar as contas abertas desta página'}
        checked={todas}
        disabled={abertas.length === 0}
        onChange={(e) => alternarTodas(e.target.checked)}
      />
    </th>
  )
}

function TabelaReceber({
  linhas,
  filtros,
  marcadas,
  alternar,
  alternarTodas,
  abrir,
}: {
  linhas: ContaReceber[]
  filtros: FiltrosFinanceiro
  marcadas: Map<string, Selecionada>
  alternar: (l: ContaReceber) => void
  alternarTodas: (marcar: boolean) => void
  abrir: (id: string) => void
}) {
  const destaque = (t: TipoData) => (filtros.situacao !== 'vencidas' && filtros.data === t ? 'true' : undefined)
  return (
    <table className="fin-tabela" data-teste="tabela-receber">
      <thead>
        <tr>
          <CabecalhoSelecao linhas={linhas} marcadas={marcadas} alternarTodas={alternarTodas} />
          <th scope="col">Vendedor / Pedido</th>
          <th scope="col">Datas</th>
          <th scope="col">Cliente</th>
          <th scope="col">Fornecedor / Produto</th>
          <th scope="col" className="fin-num">
            Valores
          </th>
          <th scope="col">NF / Baixa</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((l) => {
          const aberta = paraCentavos(l.saldo) > 0n
          return (
            <tr key={l.id} data-marcada={marcadas.has(l.id) || undefined} data-atual={filtros.sel === l.id || undefined}>
              <td className="fin-col-sel" data-rotulo="Selecionar">
                <input
                  type="checkbox"
                  aria-label={`Selecionar parcela ${l.parcela}/${l.parcelas_total} do pedido ${l.pedido_numero ?? ''}`}
                  checked={marcadas.has(l.id)}
                  disabled={!aberta}
                  onChange={() => alternar(l)}
                />
              </td>
              <td data-rotulo="Vendedor / Pedido">
                <span className="fin-rot">Vendedor:</span> {l.vendedor_nome}
                <br />
                <button type="button" className="fin-abrir" onClick={() => abrir(l.id)} data-teste="abrir-conta">
                  Pedido {l.pedido_numero ?? '—'} · parcela {l.parcela}/{l.parcelas_total}
                </button>
              </td>
              <td data-rotulo="Datas" className="fin-datas">
                <span data-destaque={destaque('pedido')}>Pedido {formatarData(l.dt_pedido)}</span>
                <span data-destaque={destaque('entrega')}>Entrega {formatarData(l.dt_entrega)}</span>
                <span data-destaque={destaque('vencimento')} data-vencida={l.vencida || undefined}>
                  Vcto {formatarData(l.dt_vencimento)}
                </span>
              </td>
              <td data-rotulo="Cliente">
                <strong>{l.cliente_nome}</strong>
                <br />
                <span className="fin-sub">Filial: {l.filial_destino}</span>
              </td>
              <td data-rotulo="Fornecedor / Produto">
                <strong>{l.fornecedor_nome}</strong>
                <br />
                <span className="fin-sub">Filial: {l.filial_origem}</span>
                <br />
                <span className="fin-sub">
                  Prod.: {l.qtd.replace(/\.?0+$/, '')} – {l.produto_nome}
                </span>
              </td>
              <td data-rotulo="Valores" className="fin-num numero">
                <span className="fin-sub">Venda {reais(l.valor_total)}</span>
                <strong>Comissão {reais(l.valor_comissao)}</strong>
                {paraCentavos(l.valor_baixado) > 0n ? <span className="fin-sub">Recebido {reais(l.valor_baixado)}</span> : null}
                {aberta ? <span className="fin-saldo">Saldo {reais(l.saldo)}</span> : null}
              </td>
              <td data-rotulo="NF / Baixa" className="fin-sub">
                NF fornec.: {l.nf_fornecedor_numero ?? '—'}
                <br />
                NF/recibo MegaBox: {l.ultima_nf_megabox ?? '—'}
                <br />
                <span data-destaque={destaque('baixa')}>Baixa: {formatarData(l.ultima_dt_baixa)}</span>
                {' · '}
                <span data-destaque={destaque('credito')}>Banco: {formatarData(l.ultima_dt_credito)}</span>
              </td>
              <td data-rotulo="Status">
                <Status id={l.status_id} vencida={l.vencida} saldo={l.saldo} baixado={l.valor_baixado} />
                {l.arquivado ? (
                  <span className="selo" data-tom="alerta">
                    Arquivada
                  </span>
                ) : null}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TabelaPagar({
  linhas,
  filtros,
  marcadas,
  alternar,
  alternarTodas,
  abrir,
}: {
  linhas: ContaPagar[]
  filtros: FiltrosFinanceiro
  marcadas: Map<string, Selecionada>
  alternar: (l: ContaPagar) => void
  alternarTodas: (marcar: boolean) => void
  abrir: (id: string) => void
}) {
  const destaque = (t: TipoData) => (filtros.situacao !== 'vencidas' && filtros.data === t ? 'true' : undefined)
  return (
    <table className="fin-tabela" data-teste="tabela-pagar">
      <thead>
        <tr>
          <CabecalhoSelecao linhas={linhas} marcadas={marcadas} alternarTodas={alternarTodas} />
          <th scope="col">Vendedor / Pedido</th>
          <th scope="col">Datas</th>
          <th scope="col">Cliente / Fornecedor</th>
          <th scope="col" className="fin-num">
            Valores
          </th>
          <th scope="col">Info pagamento</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((l) => {
          const aberta = paraCentavos(l.saldo) > 0n
          return (
            <tr key={l.id} data-marcada={marcadas.has(l.id) || undefined} data-atual={filtros.sel === l.id || undefined}>
              <td className="fin-col-sel" data-rotulo="Selecionar">
                <input
                  type="checkbox"
                  aria-label={`Selecionar comissão de ${l.vendedor_nome}, pedido ${l.pedido_numero ?? ''}`}
                  checked={marcadas.has(l.id)}
                  disabled={!aberta}
                  onChange={() => alternar(l)}
                />
              </td>
              <td data-rotulo="Vendedor / Pedido">
                <span className="fin-rot">Vendedor:</span> {l.vendedor_nome}
                <br />
                <button type="button" className="fin-abrir" onClick={() => abrir(l.id)} data-teste="abrir-conta">
                  {l.origem === 'meta' ? 'Fechamento de meta' : `Pedido ${l.pedido_numero ?? '—'}`}
                </button>
              </td>
              <td data-rotulo="Datas" className="fin-datas">
                <span data-destaque={destaque('entrega')}>Entrega {formatarData(l.dt_entrega)}</span>
                <span data-destaque={destaque('vencimento')} data-vencida={l.vencida || undefined}>
                  Vcto {formatarData(l.dt_vencimento)}
                </span>
              </td>
              <td data-rotulo="Cliente / Fornecedor">
                <strong>{l.cliente_nome}</strong>
                <br />
                <span className="fin-sub">Fornecedor: {l.fornecedor_nome}</span>
                <br />
                <span className="fin-sub">NF fornec.: {l.nf_fornecedor_numero ?? '—'}</span>
              </td>
              <td data-rotulo="Valores" className="fin-num numero">
                <span className="fin-sub">Comissão MegaBox {reais(l.valor_base)}</span>
                <strong>Comissão vendedor {reais(l.valor_comissao)}</strong>
                {aberta ? <span className="fin-saldo">Saldo {reais(l.saldo)}</span> : null}
              </td>
              <td data-rotulo="Info pagamento" className="fin-sub">
                <span data-destaque={destaque('baixa')}>Baixa: {formatarData(l.ultima_dt_baixa)}</span>
                <br />
                Pago: {reais(l.valor_pago)}
              </td>
              <td data-rotulo="Status">
                <Status id={l.status_id} vencida={l.vencida} saldo={l.saldo} baixado={l.valor_pago} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ------------------------------------------------------------------- painel de contas

function PainelContas({
  filtros,
  lista,
  vencidos,
  ficha,
  permissoes,
  navegar,
  pendente,
}: {
  filtros: FiltrosFinanceiro
  lista: ListaContas<ContaReceber> | ListaContas<ContaPagar>
  vencidos: Totais
  ficha: FichaConta | null
  permissoes: Permissoes
  navegar: Navegar
  pendente: boolean
}) {
  const receber = filtros.aba === 'receber'
  // Seleção no navegador (no Bubble ia para o registro do usuário, §2.4/§8.1). Sobrevive à
  // troca de página e de filtro, como a `merged_with` do Bubble, mas sem gravar no banco.
  const [marcadas, setMarcadas] = useState<Map<string, Selecionada>>(new Map())
  const [dialogo, setDialogo] = useState<'baixa' | 'cobranca' | null>(null)
  // Guardado ao abrir: concluir zera a seleção, e o diálogo não pode sumir antes da mensagem.
  const [fornecedorCobranca, setFornecedorCobranca] = useState<string | null>(null)

  function item(l: ContaReceber | ContaPagar): Selecionada {
    return {
      id: l.id,
      saldo: l.saldo,
      fornecedorId: l.fornecedor_id,
      rotulo:
        'parcela' in l
          ? `Pedido ${l.pedido_numero ?? '—'} · ${l.parcela}/${l.parcelas_total} · ${l.cliente_nome}`
          : `${l.vendedor_nome} · pedido ${l.pedido_numero ?? '—'}`,
    }
  }
  function alternar(l: ContaReceber | ContaPagar) {
    setMarcadas((m) => {
      const n = new Map(m)
      if (n.has(l.id)) n.delete(l.id)
      else n.set(l.id, item(l))
      return n
    })
  }
  function alternarTodas(marcar: boolean) {
    setMarcadas((m) => {
      const n = new Map(m)
      for (const l of lista.linhas) {
        if (paraCentavos(l.saldo) <= 0n) continue
        if (marcar) n.set(l.id, item(l))
        else n.delete(l.id)
      }
      return n
    })
  }

  // Depois de baixar, a conta quitada sai da seleção (o saldo mudou no banco).
  useEffect(() => {
    setMarcadas((m) => {
      let mudou = false
      const n = new Map(m)
      for (const l of lista.linhas) {
        const s = n.get(l.id)
        if (!s) continue
        if (paraCentavos(l.saldo) <= 0n) {
          n.delete(l.id)
          mudou = true
        } else if (s.saldo !== l.saldo) {
          n.set(l.id, { ...s, saldo: l.saldo })
          mudou = true
        }
      }
      return mudou ? n : m
    })
  }, [lista.linhas])

  const sel = [...marcadas.values()]
  const resumo = resumoSelecao(sel)
  const t = lista.totais
  const nomeLista = receber ? 'Receber' : 'Pagar'

  return (
    <>
      <section className="fin-cards" aria-label="Totais">
        <Card
          titulo={receber ? 'A receber vencidos' : 'A pagar vencidos'}
          qtd={vencidos.qtd}
          valor={vencidos.saldo}
          detalhe={vencidos.falhou ? 'não foi possível somar' :'saldo em aberto, sem filtros'}
          tom="roxo"
          ativo={filtros.situacao === 'vencidas'}
          aoClicar={() => navegar({ situacao: 'vencidas', pagina: 1, sel: null })}
          teste="card-vencidos"
        />
        <Card
          titulo={`${nomeLista} listado`}
          qtd={t.qtd}
          valor={t.comissao}
          detalhe={t.falhou ? 'não foi possível somar tudo' : `saldo ${reais(t.saldo)}`}
          tom={receber ? 'verde' : 'vermelho'}
          teste="card-listado"
        />
        <Card
          titulo={`${nomeLista} selecionado`}
          qtd={resumo.qtd}
          valor={resumo.saldo}
          detalhe="saldo das marcadas"
          tom="azul"
          ativo={resumo.qtd > 0}
          teste="card-selecionado"
        />
      </section>

      <div className="fin-acoes">
        <button
          type="button"
          className="botao-primario"
          disabled={resumo.qtd === 0}
          onClick={() => setDialogo('baixa')}
          data-teste="baixar-selecionadas"
        >
          {receber ? 'Baixar contas a receber' : 'Baixar contas a pagar'}
        </button>
        {receber ? (
          <button
            type="button"
            className="botao-secundario"
            disabled={resumo.qtd === 0 || !resumo.fornecedorUnico}
            title={resumo.qtd > 0 && !resumo.fornecedorUnico ? 'A cobrança é de um fornecedor só' : undefined}
            onClick={() => {
              setFornecedorCobranca(resumo.fornecedorUnico)
              setDialogo('cobranca')
            }}
            data-teste="enviar-cobranca"
          >
            Registrar cobrança
          </button>
        ) : null}
        {resumo.qtd > 0 ? (
          <button type="button" className="botao-texto" onClick={() => setMarcadas(new Map())}>
            Desmarcar todas ({resumo.qtd})
          </button>
        ) : null}
        {receber && resumo.qtd > 0 && !resumo.fornecedorUnico ? (
          <span className="fin-dica">Seleção com mais de um fornecedor: dá para baixar, não para cobrar nem gerar recibo.</span>
        ) : null}
      </div>

      <section className="fin-corpo" aria-label={receber ? 'Contas a receber' : 'Contas a pagar'} aria-busy={pendente}>
        {lista.falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar a lista agora. Recarregue a página em instantes.
          </p>
        ) : lista.linhas.length === 0 ? (
          <p className="fin-vazio" data-teste="lista-vazia">
            Nenhuma conta {receber ? 'a receber' : 'a pagar'} com esses filtros.
          </p>
        ) : (
          <div className="fin-rolagem" data-pendente={pendente || undefined}>
            {receber ? (
              <TabelaReceber
                linhas={lista.linhas as ContaReceber[]}
                filtros={filtros}
                marcadas={marcadas}
                alternar={alternar}
                alternarTodas={alternarTodas}
                abrir={(id) => navegar({ sel: id })}
              />
            ) : (
              <TabelaPagar
                linhas={lista.linhas as ContaPagar[]}
                filtros={filtros}
                marcadas={marcadas}
                alternar={alternar}
                alternarTodas={alternarTodas}
                abrir={(id) => navegar({ sel: id })}
              />
            )}
          </div>
        )}
        <Paginacao filtros={filtros} total={lista.total} navegar={navegar} />
      </section>

      {dialogo === 'baixa' ? (
        <DialogoBaixaLote
          tipo={receber ? 'receber' : 'pagar'}
          selecionadas={sel}
          fornecedorUnico={resumo.fornecedorUnico}
          hoje={hojeSP()}
          aoConcluir={() => setMarcadas(new Map())}
          aoFechar={() => setDialogo(null)}
        />
      ) : null}
      {dialogo === 'cobranca' && fornecedorCobranca ? (
        <DialogoCobranca
          selecionadas={sel}
          fornecedorId={fornecedorCobranca}
          aoConcluir={() => setMarcadas(new Map())}
          aoFechar={() => setDialogo(null)}
        />
      ) : null}
      {ficha ? (
        <FichaContaDialogo
          key={ficha.conta.id}
          ficha={ficha}
          permissoes={permissoes}
          hoje={hojeSP()}
          aoFechar={() => navegar({ sel: null })}
        />
      ) : null}
    </>
  )
}

// ------------------------------------------------------------------------ entregas

function PainelEntregas({
  filtros,
  pendentes,
  opcoes,
  navegar,
  pendente,
}: {
  filtros: FiltrosFinanceiro
  pendentes: { linhas: EntregaPendente[]; total: number; falhou: boolean }
  opcoes: Opcoes
  navegar: Navegar
  pendente: boolean
}) {
  const [aberta, setAberta] = useState<EntregaPendente | null>(null)
  return (
    <section className="fin-corpo" aria-label="Entregas a confirmar" aria-busy={pendente}>
      <p className="fin-dica">
        Entregas que já saíram e ainda não foram confirmadas. Confirmar grava a data real, passa a entrega para
        Financeiro e gera as parcelas a receber e a comissão do vendedor.
      </p>
      {pendentes.falhou ? (
        <p className="aviso" data-tom="erro" role="alert">
          Não foi possível carregar as entregas agora. Recarregue a página em instantes.
        </p>
      ) : pendentes.linhas.length === 0 ? (
        <p className="fin-vazio" data-teste="lista-vazia">
          Nenhuma entrega esperando confirmação.
        </p>
      ) : (
        <div className="fin-rolagem" data-pendente={pendente || undefined}>
          <table className="fin-tabela" data-teste="tabela-entregas">
            <thead>
              <tr>
                <th scope="col">Pedido / Entrega</th>
                <th scope="col">Cliente</th>
                <th scope="col">Fornecedor / Produto</th>
                <th scope="col">Prev. entrega</th>
                <th scope="col" className="fin-num">
                  Valores
                </th>
                <th scope="col">
                  <span className="so-leitor">Ação</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pendentes.linhas.map((e) => (
                <tr key={e.id}>
                  <td data-rotulo="Pedido / Entrega">
                    <strong>Pedido {e.pedido?.numero ?? '—'}</strong>
                    <br />
                    <span className="fin-sub">
                      Entrega {e.numero_entrega ?? '—'} · {e.vendedor?.nome ?? '—'}
                    </span>
                  </td>
                  <td data-rotulo="Cliente">{e.cliente?.nome ?? '—'}</td>
                  <td data-rotulo="Fornecedor / Produto">
                    <strong>{e.fornecedor?.nome ?? '—'}</strong>
                    <br />
                    <span className="fin-sub">
                      {e.qtd.replace(/\.?0+$/, '')} – {e.orcamento?.produto?.nome ?? '—'}
                    </span>
                  </td>
                  <td data-rotulo="Prev. entrega">{formatarData(e.dt_prev_entrega)}</td>
                  <td data-rotulo="Valores" className="fin-num numero">
                    <span className="fin-sub">Venda {reais(e.valor_venda_bruto)}</span>
                    <strong>Comissão {reais(e.valor_comissao)}</strong>
                  </td>
                  <td data-rotulo="Ação">
                    <button
                      type="button"
                      className="botao-primario"
                      onClick={() => setAberta(e)}
                      data-teste="confirmar-entrega"
                    >
                      Confirmar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Paginacao filtros={filtros} total={pendentes.total} navegar={navegar} />
      {aberta ? (
        <DialogoConfirmarEntrega
          key={aberta.id}
          entrega={aberta}
          prazos={opcoes.prazos}
          hoje={hojeSP()}
          aoFechar={() => setAberta(null)}
        />
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------- a tela

export function TelaFinanceiro({
  filtros,
  lista,
  pendentes,
  vencidos,
  opcoes,
  ficha,
  permissoes,
}: {
  filtros: FiltrosFinanceiro
  lista: ListaContas<ContaReceber> | ListaContas<ContaPagar> | null
  pendentes: { linhas: EntregaPendente[]; total: number; falhou: boolean } | null
  vencidos: Totais | null
  opcoes: Opcoes
  ficha: FichaConta | null
  permissoes: Permissoes
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()

  // Estado da tela na URL, como em /vendas e /cadastros: recarregar e mandar o link funcionam.
  function navegar(mudancas: Partial<FiltrosFinanceiro>) {
    iniciar(() => {
      router.replace(`/financeiro${paraQuery(filtros, mudancas)}` as Route, { scroll: false })
    })
  }

  return (
    <div className="financeiro" data-teste="financeiro-conteudo">
      <header className="fin-topo">
        <h1>Fluxo Financeiro</h1>
        <nav className="fin-abas" aria-label="Listas">
          {ABAS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-current={filtros.aba === a.id ? 'page' : undefined}
              onClick={() =>
                navegar({ aba: a.id, pagina: 1, sel: null, situacao: '', data: 'entrega', arquivados: false })
              }
            >
              {a.rotulo}
            </button>
          ))}
        </nav>
      </header>

      {/* key: trocar de aba zera os campos digitados que não se aplicam à outra lista */}
      <Filtros key={`filtros-${filtros.aba}`} filtros={filtros} opcoes={opcoes} navegar={navegar} />

      {filtros.aba === 'entregas' && pendentes ? (
        <PainelEntregas filtros={filtros} pendentes={pendentes} opcoes={opcoes} navegar={navegar} pendente={pendente} />
      ) : lista && vencidos ? (
        // key: a seleção de CR não passa para a lista de CP
        <PainelContas
          key={`contas-${filtros.aba}`}
          filtros={filtros}
          lista={lista}
          vencidos={vencidos}
          ficha={ficha}
          permissoes={permissoes}
          navegar={navegar}
          pendente={pendente}
        />
      ) : null}
    </div>
  )
}
