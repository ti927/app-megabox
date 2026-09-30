'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileCheck,
  FileSpreadsheet,
  FilterX,
  List,
  ListChecks,
  type LucideIcon,
  Send,
} from 'lucide-react'

import { Foto } from '@/componentes/foto'
import { Icone } from '@/componentes/icone'
import { SeletorPeriodo } from '@/componentes/seletor-periodo'
import { formatarData } from '@/lib/datas'
import {
  type Aba,
  FILTROS_LIMPOS,
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

import { exportarRelatorio } from './acoes'
import { DialogoBaixaLote, DialogoCobranca, DialogoConfirmarEntrega, FichaContaDialogo } from './dialogo'
import type {
  ContaPagar,
  ContaReceber,
  EntregaPendente,
  FichaConta,
  ListaContas,
  Opcoes,
  Permissoes,
  Rodape as RodapeTotais,
  Selecionada,
} from './tipos'

type Navegar = (mudancas: Partial<FiltrosFinanceiro>) => void
type Dialogo = 'baixa-receber' | 'baixa-pagar' | 'cobranca'

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[1]?.[0] ?? '') : '')).toUpperCase() || '?'
}

/** Célula do cliente com a logo à esquerda (Bubble: `upi novocliente logo` bTpPb/bTpLm). */
function ComLogo({ nome, foto, children }: { nome: string; foto: string | null | undefined; children: React.ReactNode }) {
  return (
    <div className="fin-cliente">
      <Foto url={foto} nome={nome} className="fin-logo" iniciais={iniciais(nome)} />
      <div>{children}</div>
    </div>
  )
}

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'receber', rotulo: 'Contas a receber' },
  { id: 'pagar', rotulo: 'Contas a pagar' },
  { id: 'entregas', rotulo: 'Confirmar entregas' },
]

const NOME_STATUS: Record<number, string> = { 1: 'A receber', 2: 'Recebido', 3: 'A pagar', 4: 'Pago' }

// ------------------------------------------------------------------------- filtros

type CampoTexto = 'cliente' | 'fornecedor' | 'pedido' | 'nfFornecedor' | 'nfMegabox' | 'cobranca'

/**
 * Filtros (`gp filtros financeiro`, financeiro.md §2.1), na ordem do Bubble. Tudo vai para a
 * URL e é aplicado no servidor. O bloco do período (De/Até) é um controle à parte.
 */
function Filtros({ filtros, opcoes, navegar }: { filtros: FiltrosFinanceiro; opcoes: Opcoes; navegar: Navegar }) {
  const [texto, setTexto] = useState<Record<CampoTexto, string>>({
    cliente: filtros.cliente,
    fornecedor: filtros.fornecedor,
    pedido: filtros.pedido,
    nfFornecedor: filtros.nfFornecedor,
    nfMegabox: filtros.nfMegabox,
    cobranca: filtros.cobranca,
  })
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const contas = filtros.aba !== 'entregas'

  function filtrar(m: Partial<FiltrosFinanceiro>) {
    navegar({ pagina: 1, sel: null, ...m })
  }
  function digitar(campo: CampoTexto, valor: string) {
    setTexto((t) => ({ ...t, [campo]: valor }))
    clearTimeout(espera.current)
    espera.current = setTimeout(() => filtrar({ [campo]: valor.trim() }), 450)
  }
  function caixa(campo: CampoTexto, rotulo: string, placeholder: string, numerico = false) {
    return (
      <label className="campo">
        <span>{rotulo}</span>
        <input
          type="search"
          inputMode={numerico ? 'numeric' : undefined}
          value={texto[campo]}
          placeholder={placeholder}
          onChange={(e) => digitar(campo, numerico ? e.target.value.replace(/\D/g, '') : e.target.value)}
          data-teste={`filtro-${campo}`}
        />
      </label>
    )
  }

  return (
    <section className="fin-filtros" aria-label="Filtros">
      {contas ? (
        <>
          <div className="campo">
            <span>Período</span>
            <SeletorPeriodo
              rotulo="Período"
              de={filtros.de}
              ate={filtros.ate}
              desabilitado={filtros.situacao === 'vencidas'}
              onChange={(de, ate) => filtrar({ de, ate })}
              data-teste="filtro-periodo"
            />
          </div>
          {caixa('pedido', 'Núm pedido', 'Número exato', true)}
        </>
      ) : null}
      {caixa('cliente', 'Cliente', 'Parte do nome')}
      {caixa('fornecedor', 'Grupo fornecedor', 'Parte do nome')}
      {contas ? (
        <label className="campo">
          <span>Filial fornecedor</span>
          <select
            value={filtros.filial ?? ''}
            onChange={(e) => filtrar({ filial: e.target.value || null })}
            data-teste="filtro-filial"
          >
            <option value="">Todas</option>
            {opcoes.filiais.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome_endereco}
                {e.documento ? ` (${e.documento})` : ''}
              </option>
            ))}
          </select>
        </label>
      ) : null}
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
        <>
          {caixa('nfFornecedor', 'Num NF fornecedor', 'Contém')}
          {caixa('nfMegabox', 'Num NF MegaBox', 'Número exato')}
          {caixa('cobranca', 'Núm cobrança', 'Número exato', true)}
          <label className="campo">
            <span>Status recebimento</span>
            <select
              value={filtros.situacao}
              onChange={(e) => filtrar({ situacao: e.target.value as Situacao })}
              data-teste="filtro-status"
            >
              <option value="">Todos</option>
              <option value="aberto">{filtros.aba === 'pagar' ? 'A pagar' : 'A receber'}</option>
              <option value="quitado">{filtros.aba === 'pagar' ? 'Pago' : 'Recebido'}</option>
              <option value="vencidas">Vencidas (todo o período)</option>
            </select>
          </label>
          {filtros.aba === 'receber' ? (
            <label className="campo">
              <span>Arquivados</span>
              <select
                value={filtros.arquivados ? 'sim' : 'nao'}
                onChange={(e) => filtrar({ arquivados: e.target.value === 'sim' })}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </label>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

// ------------------------------------------------------- tipo de data e botões (topo)

/** `RadioButtons A` (§2.1): opções de marcar, em 3 colunas, como no Bubble. */
function TipoDeData({ filtros, navegar }: { filtros: FiltrosFinanceiro; navegar: Navegar }) {
  const tipos = (Object.keys(TIPOS_DATA) as TipoData[]).filter(
    (t) => filtros.aba !== 'pagar' || TIPOS_DATA[t].pagar !== null,
  )
  const desligado = filtros.situacao === 'vencidas'
  return (
    <fieldset className="fin-tipo-data" data-teste="filtro-data" disabled={desligado}>
      <legend>Tipo de data</legend>
      {tipos.map((t) => (
        <label key={t} className="fin-opcao">
          <input
            type="radio"
            name="tipo-data"
            value={t}
            checked={filtros.data === t}
            onChange={() => navegar({ data: t, pagina: 1, sel: null })}
          />
          {TIPOS_DATA[t].rotulo}
        </label>
      ))}
    </fieldset>
  )
}

function BotaoRelatorio({ tipo, query }: { tipo: 'receber' | 'pagar'; query: string }) {
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  async function exportar() {
    setGerando(true)
    setErro(null)
    try {
      const r = await exportarRelatorio(query, tipo)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      // O arquivo foi montado no servidor; aqui só se entrega o texto ao navegador.
      const url = URL.createObjectURL(new Blob([r.conteudo], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url
      a.download = r.nome
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErro('Não foi possível gerar o arquivo agora.')
    } finally {
      setGerando(false)
    }
  }
  return (
    <button
      type="button"
      onClick={exportar}
      disabled={gerando}
      aria-busy={gerando}
      title={erro ?? 'CSV do que está filtrado na tela'}
      data-erro={erro ? 'true' : undefined}
      data-teste={`relatorio-${tipo}`}
    >
      <Icone icone={FileSpreadsheet} tamanho={16} />
      {gerando ? 'Gerando…' : tipo === 'receber' ? 'Relatório contas a receber' : 'Relatório contas a pagar'}
    </button>
  )
}

function Controles({
  filtros,
  selReceber,
  selPagar,
  abrir,
  limpar,
  navegar,
}: {
  filtros: FiltrosFinanceiro
  selReceber: ReturnType<typeof resumoSelecao>
  selPagar: ReturnType<typeof resumoSelecao>
  abrir: (d: Dialogo) => void
  limpar: () => void
  navegar: Navegar
}) {
  const contas = filtros.aba !== 'entregas'
  const query = paraQuery(filtros, { pagina: 1, sel: null }).slice(1)
  const cobrar = selReceber.qtd > 0 && selReceber.fornecedorUnico !== null
  return (
    <section className="fin-controles" aria-label="Ações">
      {contas ? <TipoDeData filtros={filtros} navegar={navegar} /> : <span />}
      <div className="fin-botoes">
        {contas ? (
          <>
            <div className="fin-grupo-botoes" role="group" aria-label="Contas a receber">
              <button
                type="button"
                disabled={!cobrar}
                title={
                  selReceber.qtd === 0
                    ? 'Selecione contas a receber'
                    : !selReceber.fornecedorUnico
                      ? 'A cobrança é de um fornecedor só'
                      : undefined
                }
                onClick={() => abrir('cobranca')}
                data-teste="enviar-cobranca"
              >
                <Icone icone={Send} tamanho={16} />
                Enviar Cobrança
              </button>
              <button
                type="button"
                disabled={selReceber.qtd === 0}
                onClick={() => abrir('baixa-receber')}
                data-teste="baixar-selecionadas"
              >
                <Icone icone={FileCheck} tamanho={16} />
                Baixar Contas a Receber
              </button>
              <BotaoRelatorio tipo="receber" query={query} />
            </div>
            <div className="fin-grupo-botoes" role="group" aria-label="Contas a pagar">
              <button
                type="button"
                disabled={selPagar.qtd === 0}
                onClick={() => abrir('baixa-pagar')}
                data-teste="baixar-pagar"
              >
                <Icone icone={FileCheck} tamanho={16} />
                Baixar Contas a Pagar
              </button>
              <BotaoRelatorio tipo="pagar" query={query} />
            </div>
          </>
        ) : null}
        <div className="fin-grupo-botoes" role="group" aria-label="Filtros">
          <button type="button" className="fin-limpar" onClick={limpar} data-teste="limpar-filtros">
            <Icone icone={FilterX} tamanho={16} />
            Limpar Filtros
          </button>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- barra do rodapé

function Total({
  titulo,
  qtd,
  valor,
  icone,
  tom,
  falhou,
  ativo,
  aoClicar,
  teste,
}: {
  titulo: string
  qtd: number
  valor: string
  icone: LucideIcon
  tom: 'roxo' | 'verde' | 'vermelho'
  falhou?: boolean
  ativo?: boolean
  aoClicar?: () => void
  teste: string
}) {
  const corpo = (
    <>
      <Icone icone={icone} tamanho={18} />
      <span className="fin-total-texto">
        <span className="fin-total-titulo">
          {titulo} ({qtd.toLocaleString('pt-BR')})
        </span>
        <strong className="numero" title={falhou ? 'Não foi possível somar agora' : undefined}>
          {falhou ? '—' : reais(valor)}
        </strong>
      </span>
    </>
  )
  return aoClicar ? (
    <button
      type="button"
      className="fin-total"
      data-tom={tom}
      data-ativo={ativo || undefined}
      onClick={aoClicar}
      aria-pressed={ativo}
      data-teste={teste}
    >
      {corpo}
    </button>
  ) : (
    <div className="fin-total" data-tom={tom} data-ativo={ativo || undefined} data-teste={teste}>
      {corpo}
    </div>
  )
}

/**
 * Barra fixa do rodapé (Bubble `Group XZZZ`, §2.1/§3.4): A receber vencidos · Receber listado ·
 * Receber selecionado · Pagar listado · Pagar selecionado. Listado e vencidos vêm do servidor
 * (fn_resumo_financeiro, numeric); selecionado é somado aqui em centavos (resumoSelecao).
 */
function Rodape({
  rodape,
  filtros,
  selReceber,
  selPagar,
  navegar,
}: {
  rodape: RodapeTotais
  filtros: FiltrosFinanceiro
  selReceber: ReturnType<typeof resumoSelecao>
  selPagar: ReturnType<typeof resumoSelecao>
  navegar: Navegar
}) {
  return (
    <footer className="fin-rodape" aria-label="Totais">
      <Total
        titulo="A receber vencidos"
        qtd={rodape.vencidos.qtd}
        valor={rodape.vencidos.saldo}
        falhou={rodape.vencidos.falhou}
        icone={CircleDollarSign}
        tom="roxo"
        ativo={filtros.situacao === 'vencidas' && filtros.aba === 'receber'}
        aoClicar={() => navegar({ aba: 'receber', situacao: 'vencidas', pagina: 1, sel: null })}
        teste="card-vencidos"
      />
      <span className="fin-rodape-grupo">
        <Total
          titulo="Receber listado"
          qtd={rodape.receber.qtd}
          valor={rodape.receber.comissao}
          falhou={rodape.receber.falhou}
          icone={List}
          tom="verde"
          teste="card-listado"
        />
        <Total
          titulo="Receber selecionado"
          qtd={selReceber.qtd}
          valor={selReceber.saldo}
          icone={ListChecks}
          tom="verde"
          ativo={selReceber.qtd > 0}
          teste="card-selecionado"
        />
      </span>
      <span className="fin-rodape-grupo">
        <Total
          titulo="Pagar listado"
          qtd={rodape.pagar.qtd}
          valor={rodape.pagar.comissao}
          falhou={rodape.pagar.falhou}
          icone={List}
          tom="vermelho"
          teste="card-listado-pagar"
        />
        <Total
          titulo="Pagar selecionado"
          qtd={selPagar.qtd}
          valor={selPagar.saldo}
          icone={ListChecks}
          tom="vermelho"
          ativo={selPagar.qtd > 0}
          teste="card-selecionado-pagar"
        />
      </span>
    </footer>
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
            <Icone icone={ChevronLeft} tamanho={16} />
            Anterior
          </button>
          <button
            type="button"
            className="botao-secundario"
            disabled={filtros.pagina >= paginas}
            onClick={() => navegar({ pagina: filtros.pagina + 1, sel: null })}
          >
            Próxima
            <Icone icone={ChevronRight} tamanho={16} />
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
                <span data-destaque={destaque('pedido')}>
                  <span className="fin-rot-data">Pedido</span> {formatarData(l.dt_pedido)}
                </span>
                <span data-destaque={destaque('entrega')}>
                  <span className="fin-rot-data">Entrega</span> {formatarData(l.dt_entrega)}
                </span>
                <span data-destaque={destaque('vencimento')} data-vencida={l.vencida || undefined}>
                  <span className="fin-rot-data">Vcto</span> {formatarData(l.dt_vencimento)}
                </span>
              </td>
              <td data-rotulo="Cliente">
                <ComLogo nome={l.cliente_nome} foto={l.cliente_foto}>
                  <strong>{l.cliente_nome}</strong>
                  <br />
                  <span className="fin-sub">Filial: {l.filial_destino}</span>
                </ComLogo>
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
                <span data-destaque={destaque('baixa')}>
                  <span className="fin-rot-data">Baixa:</span> {formatarData(l.ultima_dt_baixa)}
                </span>
                {' · '}
                <span data-destaque={destaque('credito')}>
                  <span className="fin-rot-data">Banco:</span> {formatarData(l.ultima_dt_credito)}
                </span>
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
                <span data-destaque={destaque('entrega')}>
                  <span className="fin-rot-data">Entrega</span> {formatarData(l.dt_entrega)}
                </span>
                <span data-destaque={destaque('vencimento')} data-vencida={l.vencida || undefined}>
                  <span className="fin-rot-data">Vcto</span> {formatarData(l.dt_vencimento)}
                </span>
              </td>
              <td data-rotulo="Cliente / Fornecedor">
                <ComLogo nome={l.cliente_nome} foto={l.origem === 'meta' ? null : l.cliente_foto}>
                  <strong>{l.cliente_nome}</strong>
                  <br />
                  <span className="fin-sub">Fornecedor: {l.fornecedor_nome}</span>
                  <br />
                  <span className="fin-sub">NF fornec.: {l.nf_fornecedor_numero ?? '—'}</span>
                </ComLogo>
              </td>
              <td data-rotulo="Valores" className="fin-num numero">
                <span className="fin-sub">Comissão MegaBox {reais(l.valor_base)}</span>
                <strong>Comissão vendedor {reais(l.valor_comissao)}</strong>
                {aberta ? <span className="fin-saldo">Saldo {reais(l.saldo)}</span> : null}
              </td>
              <td data-rotulo="Info pagamento" className="fin-sub">
                <span data-destaque={destaque('baixa')}>
                  <span className="fin-rot-data">Baixa:</span> {formatarData(l.ultima_dt_baixa)}
                </span>
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

type Marcadas = Map<string, Selecionada>

function PainelContas({
  filtros,
  lista,
  ficha,
  permissoes,
  navegar,
  pendente,
  marcadas,
  setMarcadas,
}: {
  filtros: FiltrosFinanceiro
  lista: ListaContas<ContaReceber> | ListaContas<ContaPagar>
  ficha: FichaConta | null
  permissoes: Permissoes
  navegar: Navegar
  pendente: boolean
  marcadas: Marcadas
  setMarcadas: React.Dispatch<React.SetStateAction<Marcadas>>
}) {
  const receber = filtros.aba === 'receber'

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
  }, [lista.linhas, setMarcadas])

  return (
    <>
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
                  <td data-rotulo="Cliente">
                    <ComLogo nome={e.cliente?.nome ?? '—'} foto={e.cliente_foto}>
                      {e.cliente?.nome ?? '—'}
                    </ComLogo>
                  </td>
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
  rodape,
  opcoes,
  ficha,
  permissoes,
}: {
  filtros: FiltrosFinanceiro
  lista: ListaContas<ContaReceber> | ListaContas<ContaPagar> | null
  pendentes: { linhas: EntregaPendente[]; total: number; falhou: boolean } | null
  rodape: RodapeTotais | null
  opcoes: Opcoes
  ficha: FichaConta | null
  permissoes: Permissoes
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  // Seleção no navegador, uma por lista (no Bubble `SelecionadosReceber/Pagar` no registro do
  // usuário, §2.4/§8.1). Sobrevive à troca de página, filtro e aba, como a `merged_with` do
  // Bubble, sem gravar no banco. Fica aqui em cima porque a barra do rodapé mostra as duas.
  const [selReceber, setSelReceber] = useState<Marcadas>(new Map())
  const [selPagar, setSelPagar] = useState<Marcadas>(new Map())
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)
  // Guardado ao abrir: concluir zera a seleção, e o diálogo não pode sumir antes da mensagem.
  const [aberto, setAberto] = useState<{ lista: Selecionada[]; fornecedor: string | null }>({ lista: [], fornecedor: null })
  const [versaoFiltros, setVersaoFiltros] = useState(0)

  // Estado da tela na URL, como em /vendas e /cadastros: recarregar e mandar o link funcionam.
  function navegar(mudancas: Partial<FiltrosFinanceiro>) {
    iniciar(() => {
      router.replace(`/financeiro${paraQuery(filtros, mudancas)}` as Route, { scroll: false })
    })
  }

  const resumoReceber = resumoSelecao([...selReceber.values()])
  const resumoPagar = resumoSelecao([...selPagar.values()])

  function abrir(d: Dialogo) {
    const sel = d === 'baixa-pagar' ? resumoPagar : resumoReceber
    setAberto({ lista: [...(d === 'baixa-pagar' ? selPagar : selReceber).values()], fornecedor: sel.fornecedorUnico })
    setDialogo(d)
  }

  // "Limpar Filtros" (WF bTpSc): esvazia as duas seleções e zera os filtros (o período fica).
  function limpar() {
    setSelReceber(new Map())
    setSelPagar(new Map())
    setVersaoFiltros((v) => v + 1)
    navegar(FILTROS_LIMPOS)
  }

  const contas = filtros.aba !== 'entregas'
  const receber = filtros.aba === 'receber'

  return (
    <div className="financeiro" data-teste="financeiro-conteudo" data-com-rodape={rodape ? 'true' : undefined}>
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

      <Controles
        filtros={filtros}
        selReceber={resumoReceber}
        selPagar={resumoPagar}
        abrir={abrir}
        limpar={limpar}
        navegar={navegar}
      />
      {contas && resumoReceber.qtd > 0 && !resumoReceber.fornecedorUnico ? (
        <p className="fin-dica">Seleção a receber com mais de um fornecedor: dá para baixar, não para cobrar nem gerar recibo.</p>
      ) : null}

      {/* key: trocar de aba ou limpar zera os campos digitados */}
      <Filtros key={`filtros-${filtros.aba}-${versaoFiltros}`} filtros={filtros} opcoes={opcoes} navegar={navegar} />

      {filtros.aba === 'entregas' && pendentes ? (
        <PainelEntregas filtros={filtros} pendentes={pendentes} opcoes={opcoes} navegar={navegar} pendente={pendente} />
      ) : lista ? (
        <PainelContas
          key={`contas-${filtros.aba}`}
          filtros={filtros}
          lista={lista}
          ficha={ficha}
          permissoes={permissoes}
          navegar={navegar}
          pendente={pendente}
          marcadas={receber ? selReceber : selPagar}
          setMarcadas={receber ? setSelReceber : setSelPagar}
        />
      ) : null}

      {contas && rodape ? (
        <Rodape rodape={rodape} filtros={filtros} selReceber={resumoReceber} selPagar={resumoPagar} navegar={navegar} />
      ) : null}

      {dialogo === 'baixa-receber' || dialogo === 'baixa-pagar' ? (
        <DialogoBaixaLote
          tipo={dialogo === 'baixa-pagar' ? 'pagar' : 'receber'}
          selecionadas={aberto.lista}
          fornecedorUnico={aberto.fornecedor}
          hoje={hojeSP()}
          aoConcluir={() => (dialogo === 'baixa-pagar' ? setSelPagar : setSelReceber)(new Map())}
          aoFechar={() => setDialogo(null)}
        />
      ) : null}
      {dialogo === 'cobranca' && aberto.fornecedor ? (
        <DialogoCobranca
          selecionadas={aberto.lista}
          fornecedorId={aberto.fornecedor}
          filialInicial={filtros.filial}
          aoConcluir={() => setSelReceber(new Map())}
          aoFechar={() => setDialogo(null)}
        />
      ) : null}
    </div>
  )
}
