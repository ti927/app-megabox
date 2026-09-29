'use client'

import {
  Box,
  ChevronDown,
  ChevronRight,
  Contact,
  Factory,
  MapPin,
  Pencil,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  Trophy,
  UserPlus,
  X,
} from 'lucide-react'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'

import {
  destinoPadrao,
  iniciais,
  linhaPadrao,
  produtosDoGrupo,
  qtdParaCampo,
  reaisParaCampo,
  rotuloEndereco,
} from '@/lib/cotacao-tela'
import { formatarData } from '@/lib/datas'
import { formatarAliquota, formatarReais } from '@/lib/dinheiro'
import {
  type Aba,
  ETAPA,
  FRETE_CIF_INFORMADO,
  formatarQuantidade,
  hojeSP,
  idsMenorLiquido,
  podeSerVencedor,
  validadePadrao,
} from '@/lib/vendas'

import {
  adicionarOrcamento,
  arquivarCotacao,
  buscarClientes,
  criarCotacao,
  definirVencedor,
  desarquivarCotacao,
  fornecedoresParaItem,
} from './acoes'
import {
  adicionarAoCarrinho,
  alterarQtdItem,
  descartarRascunho,
  editarItem,
  editarOrcamento,
  enderecosDoCliente,
  excluirItem,
  excluirOrcamento,
  gravarCabecalho,
  opcoesDaCotacaoNova,
} from './acoes-cotacao'
import { AbaPedidos, AbaPropostas } from './fluxo'
import type {
  Destino,
  EstadoAcao,
  Ficha,
  FornecedorParaItem,
  Item,
  Opcao,
  Opcoes,
  OpcoesFicha,
  Orcamento,
  Permissoes,
} from './tipos'

/*
 * A cotação em TELA CHEIA — `pop add edita cotacao` do Bubble (spec vendas §2.6; capturas
 * vendas-03 e vendas-04). Mesma disposição: cartão do cabeçalho à esquerda, "Adicionar produto
 * ao carrinho" à direita e, embaixo, a tabela do carrinho na largura toda, com os orçamentos
 * de fornecedor aninhados sob cada produto.
 *
 * Fluxo da NOVA (WF bTOOI): cliente → endereço de entrega → amostra → produtos pelo carrinho →
 * orçamentos → Gravar. O carrinho é uma cotação em rascunho (acoes-cotacao.ts), criada no
 * primeiro produto. Os valores em dinheiro são SEMPRE os do banco: a tela só formata.
 */

const ICONE = { size: 18, strokeWidth: 2, 'aria-hidden': true } as const

function Mensagem({ estado }: { estado: EstadoAcao }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste="erro-vendas">
        {estado.erro}
      </p>
    )
  }
  if (estado.ok) {
    return (
      <p className="aviso" data-tom="ok" role="status">
        {estado.ok}
      </p>
    )
  }
  return null
}

/**
 * onSubmit em vez de action={...}: com action, o React 19 limpa o formulário ao fim de toda
 * chamada — inclusive quando a validação devolve erro, e a pessoa perderia o que digitou.
 */
function enviarCom(acao: (f: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    startTransition(() => acao(form))
  }
}

function formDe(campos: Record<string, string | boolean>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) {
    if (typeof v === 'boolean') {
      if (v) f.set(k, 'on')
    } else f.set(k, v)
  }
  return f
}

/** Lixeira em dois toques: o primeiro arma ("Apagar?"), o segundo apaga. Sem confirm() nativo. */
function BotaoApagar({
  rotulo,
  campo,
  valor,
  acao,
  pendente,
}: {
  rotulo: string
  campo: string
  valor: string
  acao: (f: FormData) => void
  pendente: boolean
}) {
  const [armado, setArmado] = useState(false)
  useEffect(() => {
    if (!armado) return
    const t = setTimeout(() => setArmado(false), 4000)
    return () => clearTimeout(t)
  }, [armado])
  return (
    <button
      type="button"
      className="cot-icone"
      data-tom="perigo"
      data-armado={armado || undefined}
      aria-label={armado ? `Confirmar: ${rotulo}` : rotulo}
      title={armado ? 'Clique de novo para apagar' : rotulo}
      disabled={pendente}
      onClick={() => {
        if (!armado) return setArmado(true)
        setArmado(false)
        startTransition(() => acao(formDe({ [campo]: valor })))
      }}
    >
      <Trash2 {...ICONE} />
    </button>
  )
}

// =================================================================== cabeçalho

type Cliente = { id: string; nome: string }

function BuscaCliente({ aoEscolher }: { aoEscolher: (c: Cliente) => void }) {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<Cliente[]>([])
  const [buscando, setBuscando] = useState(false)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)

  function procurar(texto: string) {
    setBusca(texto)
    clearTimeout(espera.current)
    if (texto.trim().length < 2) {
      setResultados([])
      return
    }
    espera.current = setTimeout(async () => {
      setBuscando(true)
      setResultados(await buscarClientes(texto))
      setBuscando(false)
    }, 300)
  }

  return (
    <div className="cot-busca">
      <input
        id="cot-cliente"
        type="search"
        value={busca}
        onChange={(e) => procurar(e.target.value)}
        placeholder="Buscar cliente"
        autoComplete="off"
        autoFocus
        aria-controls="cot-resultados"
        data-teste="campo-cliente"
      />
      {busca.trim().length >= 2 ? (
        <ul id="cot-resultados" className="vendas-resultados cot-resultados" role="listbox" aria-label="Clientes encontrados">
          {buscando ? <li className="vendas-resultado-vazio">Buscando…</li> : null}
          {!buscando && resultados.length === 0 ? (
            <li className="vendas-resultado-vazio">Nenhum cliente ativo com esse nome.</li>
          ) : null}
          {resultados.map((r) => (
            <li key={r.id} role="option" aria-selected={false}>
              <button type="button" onClick={() => aoEscolher(r)}>
                {r.nome}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

type Cabecalho = { empresa: string; validade: string; amostra: boolean }

function CartaoCabecalho({
  titulo,
  numero,
  cliente,
  clienteTravado,
  aoEscolherCliente,
  destinos,
  carregandoDestinos,
  destino,
  setDestino,
  cab,
  setCab,
  aoTrocarAmostra,
  empresas,
  dataCotacao,
  vendedor,
  editavel,
}: {
  titulo: string
  numero: number | null
  cliente: Cliente | null
  clienteTravado: boolean
  aoEscolherCliente: (c: Cliente | null) => void
  destinos: Destino[]
  carregandoDestinos: boolean
  destino: string
  setDestino: (id: string) => void
  cab: Cabecalho
  setCab: (c: Cabecalho) => void
  aoTrocarAmostra: (amostra: boolean) => void
  empresas: Opcao[]
  dataCotacao: string
  vendedor: string
  editavel: boolean
}) {
  const hoje = hojeSP()
  return (
    <section className="cot-cartao cot-cabecalho" aria-labelledby="cot-titulo">
      <div className="cot-cabecalho-topo">
        <h2 id="cot-titulo">{titulo}</h2>
        <label className="caixa cot-amostra">
          <input
            type="checkbox"
            checked={cab.amostra}
            disabled={!editavel}
            onChange={(e) => {
              setCab({ ...cab, amostra: e.target.checked })
              aoTrocarAmostra(e.target.checked)
            }}
            data-teste="campo-amostra"
          />
          Pedido de Amostra
        </label>
        <p className="cot-numero">
          <span>Cotação núm.</span>
          <strong data-teste="cotacao-numero">{numero ?? '—'}</strong>
        </p>
      </div>

      <div className="cot-linha-cliente">
        <span className="cot-avatar" aria-hidden="true" data-vazio={!cliente || undefined}>
          {cliente ? iniciais(cliente.nome) : null}
        </span>
        <div className="campo cot-campo-cliente">
          <label htmlFor="cot-cliente">Cliente</label>
          {cliente ? (
            <div className="cot-cliente-escolhido">
              <strong id="cot-cliente" title={cliente.nome}>
                {cliente.nome}
              </strong>
              {clienteTravado ? null : (
                <button type="button" className="cot-icone" aria-label="Trocar cliente" title="Trocar cliente" onClick={() => aoEscolherCliente(null)}>
                  <X {...ICONE} />
                </button>
              )}
            </div>
          ) : (
            <BuscaCliente aoEscolher={aoEscolherCliente} />
          )}
        </div>
        {/* Novo cliente (WF bTeyi): o cadastro abre em outra aba para não perder o carrinho. */}
        <a className="cot-icone" href="/cadastros" target="_blank" rel="noopener" aria-label="Novo cliente (abre o cadastro em outra aba)" title="Novo cliente">
          <UserPlus {...ICONE} />
        </a>
        <label className="campo cot-campo-destino">
          <span>Endereço de entrega</span>
          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            disabled={!cliente || carregandoDestinos || !editavel}
            data-teste="campo-destino"
          >
            <option value="">{carregandoDestinos ? 'Carregando…' : cliente && destinos.length === 0 ? 'Cliente sem endereço ativo' : 'Selecione o destino'}</option>
            {destinos.map((d) => (
              <option key={d.id} value={d.id}>
                {rotuloEndereco(d)}
              </option>
            ))}
          </select>
        </label>
        {/* Agenda de endereços e contatos do cliente (WF bTcjZ). */}
        {cliente ? (
          <a
            className="cot-icone"
            href={`/cadastros?sel=${cliente.id}`}
            target="_blank"
            rel="noopener"
            aria-label="Endereços e contatos do cliente (abre em outra aba)"
            title="Endereços e contatos do cliente"
          >
            <Contact {...ICONE} />
          </a>
        ) : (
          <span className="cot-icone" aria-hidden="true" data-inativo>
            <Contact {...ICONE} />
          </span>
        )}
      </div>

      <div className="cot-linha-dados">
        <span className="cot-logo" aria-hidden="true">
          <Box size={34} strokeWidth={1.6} />
        </span>
        <fieldset className="cot-empresa" disabled={!editavel}>
          <legend className="so-leitor">Empresa emissora</legend>
          {empresas.map((e) => (
            <label key={e.id} className="caixa">
              <input
                type="radio"
                name="cot-empresa"
                value={e.id}
                checked={cab.empresa === String(e.id)}
                onChange={() => setCab({ ...cab, empresa: String(e.id) })}
              />
              {e.nome}
            </label>
          ))}
        </fieldset>
        <div className="cot-dado">
          <span>Data cotação</span>
          <strong>{dataCotacao}</strong>
        </div>
        <label className="cot-dado cot-validade">
          <span>Data Validade</span>
          <input
            type="date"
            value={cab.validade}
            min={hoje}
            required
            disabled={!editavel}
            onChange={(e) => setCab({ ...cab, validade: e.target.value })}
            data-teste="campo-validade"
          />
        </label>
        <div className="cot-dado">
          <span>Vendedor</span>
          <strong>{vendedor}</strong>
        </div>
      </div>
    </section>
  )
}

// ==================================================================== carrinho

type Edicao = { item: Item } | null

function CartaoCarrinho({
  opcoesFicha,
  pronto,
  motivoBloqueio,
  edicao,
  aoCancelarEdicao,
  enviar,
  enviando,
  estado,
}: {
  opcoesFicha: OpcoesFicha | null
  pronto: boolean
  motivoBloqueio: string | null
  edicao: Edicao
  aoCancelarEdicao: () => void
  enviar: (f: FormData, editando: boolean) => void
  enviando: boolean
  estado: EstadoAcao
}) {
  const item = edicao?.item ?? null
  const [grupo, setGrupo] = useState(item?.produto?.grupo_id ?? '')
  const [produtoId, setProdutoId] = useState(item?.produto_id ?? '')
  const [condicao, setCondicao] = useState(item?.condicao_id ? String(item.condicao_id) : '')
  const [linha, setLinha] = useState(item?.linha_id ? String(item.linha_id) : '')
  const formRef = useRef<HTMLFormElement>(null)

  const produtos = produtosDoGrupo(opcoesFicha?.produtos ?? [], grupo)
  const produto = opcoesFicha?.produtos.find((p) => p.id === produtoId)
  const condicoes = (opcoesFicha?.condicoes ?? []).filter((c) => produto?.condicoes.some((x) => x.condicao_id === c.id))
  const linhas = (opcoesFicha?.linhas ?? []).filter((l) => produto?.linhas.some((x) => x.linha_id === l.id))

  // Depois de gravar, o formulário volta a "Novo Produto" limpo (bTNjj/bTOir0 limpam o grupo).
  useEffect(() => {
    if (!estado.ok || edicao) return
    setProdutoId('')
    setCondicao('')
    setLinha('')
    formRef.current?.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  function escolherProduto(id: string) {
    setProdutoId(id)
    const p = opcoesFicha?.produtos.find((x) => x.id === id)
    if (p && !grupo && p.grupo_id) setGrupo(p.grupo_id)
    const cs = (opcoesFicha?.condicoes ?? []).filter((c) => p?.condicoes.some((x) => x.condicao_id === c.id))
    const ls = (opcoesFicha?.linhas ?? []).filter((l) => p?.linhas.some((x) => x.linha_id === l.id))
    const c = cs.length === 1 ? cs[0] : undefined
    setCondicao(c ? String(c.id) : '')
    setLinha(linhaPadrao(c, ls))
  }

  function escolherCondicao(id: string) {
    setCondicao(id)
    setLinha(linhaPadrao(condicoes.find((c) => String(c.id) === id), linhas))
  }

  const desabilitado = !pronto || !opcoesFicha
  return (
    <section className="cot-cartao cot-carrinho" aria-labelledby="cot-carrinho-titulo" data-editando={item ? true : undefined}>
      <header className="cot-carrinho-topo">
        <span className="cot-carrinho-marca" aria-hidden="true">
          <ShoppingCart size={22} />
        </span>
        <h3 id="cot-carrinho-titulo">{item ? 'Editar produto do carrinho' : 'Adicionar produto ao carrinho'}</h3>
      </header>
      {motivoBloqueio ? <p className="cot-dica">{motivoBloqueio}</p> : null}
      <form
        ref={formRef}
        className="cot-carrinho-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          enviar(f, !!item)
        }}
        data-teste="form-item"
      >
        <fieldset disabled={desabilitado} className="cot-carrinho-campos">
          <label className="campo">
            <span>Tipo Produto</span>
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)} data-teste="campo-tipo">
              <option value="">Todos</option>
              {opcoesFicha?.grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="campo cot-campo-produto">
            <label htmlFor="cot-produto">Produto</label>
            <div className="cot-com-icone">
              <select id="cot-produto" name="produto_id" value={produtoId} onChange={(e) => escolherProduto(e.target.value)} required data-teste="campo-produto">
                <option value="">{opcoesFicha ? 'Escolha…' : 'Carregando…'}</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              {/* Editar o cadastro do produto (WF bThDv), em outra aba. */}
              {produtoId ? (
                <a
                  className="cot-icone"
                  href={`/produtos?sel=${produtoId}`}
                  target="_blank"
                  rel="noopener"
                  aria-label="Editar cadastro do produto (abre em outra aba)"
                  title="Editar cadastro do produto"
                >
                  <Pencil {...ICONE} />
                </a>
              ) : (
                <span className="cot-icone" data-inativo aria-hidden="true">
                  <Pencil {...ICONE} />
                </span>
              )}
            </div>
          </div>
          <label className="campo">
            <span>Condição</span>
            <select name="condicao_id" value={condicao} onChange={(e) => escolherCondicao(e.target.value)} disabled={!produto}>
              <option value="">—</option>
              {condicoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Linha</span>
            <select name="linha_id" value={linha} onChange={(e) => setLinha(e.target.value)} disabled={!produto}>
              <option value="">—</option>
              {linhas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo cot-campo-qtd">
            <span>Qtd</span>
            <input name="qtd" inputMode="decimal" required placeholder="0" defaultValue={item ? qtdParaCampo(item.qtd) : ''} data-teste="campo-qtd" />
          </label>
          <label className="campo cot-campo-medida">
            <span>Medida, descrição ou obs.</span>
            <input name="medida" maxLength={500} autoComplete="off" defaultValue={item?.medida ?? ''} data-teste="campo-medida" />
          </label>
          <div className="cot-carrinho-acoes">
            {item ? (
              <button type="button" className="cot-icone" aria-label="Cancelar edição do produto" title="Cancelar edição" onClick={aoCancelarEdicao}>
                <X {...ICONE} />
              </button>
            ) : null}
            <button
              type="submit"
              className="cot-botao-carrinho"
              disabled={enviando}
              aria-busy={enviando}
              aria-label={item ? 'Salvar produto' : 'Adicionar ao carrinho'}
              title={item ? 'Salvar produto' : 'Adicionar ao carrinho'}
              data-teste="gravar-item"
            >
              {item ? <Save size={20} aria-hidden="true" /> : <ShoppingCart size={20} aria-hidden="true" />}
              {item ? null : <Plus size={14} strokeWidth={3} className="cot-mais" aria-hidden="true" />}
              <span>{enviando ? 'Gravando…' : item ? 'Salvar' : 'Adicionar'}</span>
            </button>
          </div>
        </fieldset>
      </form>
      <Mensagem estado={estado} />
    </section>
  )
}

// ================================================================= orçamentos

const COLUNAS = 14

function FormOrcamento({ item, fretes, aoTerminar }: { item: Item; fretes: Opcao[]; aoTerminar: () => void }) {
  const [estado, enviar, enviando] = useActionState(adicionarOrcamento, {})
  const [lista, setLista] = useState<FornecedorParaItem[] | null>(null)
  const [erroLista, setErroLista] = useState<string | null>(null)
  const [tipoFrete, setTipoFrete] = useState('1')

  useEffect(() => {
    let vivo = true
    fornecedoresParaItem(item.id).then((r) => {
      if (!vivo) return
      if ('erro' in r) setErroLista(r.erro)
      else setLista(r)
    })
    return () => {
      vivo = false
    }
  }, [item.id])

  useEffect(() => {
    if (estado.ok) aoTerminar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  return (
    <form className="vendas-subform cot-subform" noValidate onSubmit={enviarCom(enviar)} data-teste="form-orcamento">
      <h4>
        <Factory {...ICONE} /> Adiciona fornecedor para orçar
      </h4>
      <input type="hidden" name="cotacao_item_id" value={item.id} />
      {erroLista ? (
        <p className="aviso" data-tom="erro">
          {erroLista}
        </p>
      ) : null}
      <div className="vendas-subform-campos cot-subform-campos">
        <label className="campo vendas-largo">
          <span>Fornecedor (filial)</span>
          <select name="endereco_origem_id" required disabled={!lista} data-teste="campo-fornecedor">
            <option value="">{lista ? (lista.length === 0 ? 'Nenhum fornecedor tem este produto' : 'Escolha…') : 'Carregando…'}</option>
            {lista?.map((f) => (
              <option key={f.endereco_id} value={f.endereco_id} disabled={!f.liberado}>
                {f.grupo_nome} – {f.nome_endereco} – {f.municipio ? `${f.municipio}/` : ''}
                {f.uf} · {f.regime ?? 'Falta regime tributário'}
                {f.liberado ? '' : ` · BLOQUEADO${f.liberado_motivo ? `: ${f.liberado_motivo}` : ''}`}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Produto Unit.</span>
          <input name="valor_venda_unit" inputMode="decimal" placeholder="R$ 0,00" data-teste="campo-unit" />
        </label>
        <label className="campo">
          <span>Comissão Unit.</span>
          <input name="valor_comissao_unit" inputMode="decimal" placeholder="R$ 0,00" data-teste="campo-comissao" />
        </label>
        <label className="campo">
          <span>Tipo Frete</span>
          <select name="tipo_frete_id" value={tipoFrete} onChange={(e) => setTipoFrete(e.target.value)}>
            {fretes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </label>
        {/* Frete só se digita com "CIF Informado" (spec §2.6); nos outros tipos vai 0 (bTOSo0). */}
        <label className="campo">
          <span>Valor Frete</span>
          <input name="valor_frete" inputMode="decimal" placeholder="R$ 0,00" disabled={Number(tipoFrete) !== FRETE_CIF_INFORMADO} key={tipoFrete} />
        </label>
      </div>
      <p className="vendas-nota">As alíquotas de ICMS e PIS/COFINS são aplicadas pelo sistema conforme o regime e a UF de origem e destino.</p>
      <Mensagem estado={estado} />
      <div className="vendas-subform-acoes">
        <button type="button" className="botao-secundario" onClick={aoTerminar}>
          Cancela
        </button>
        <button type="submit" className="botao-primario" disabled={enviando || !lista} aria-busy={enviando} data-teste="gravar-orcamento">
          {enviando ? 'Gravando…' : 'Adicionar Fornecedor'}
        </button>
      </div>
    </form>
  )
}

function BotaoTrofeu({ o, amostra, editavel }: { o: Orcamento; amostra: boolean; editavel: boolean }) {
  const [estado, enviar, pendente] = useActionState(definirVencedor, {})
  const pode = podeSerVencedor(o, amostra)
  const rotulo = o.vencedor
    ? editavel
      ? 'Vencedor (clique para desmarcar)'
      : 'Vencedor'
    : pode
      ? 'Marcar como vencedor'
      : 'Informe valor e comissão para poder vencer'
  return (
    <>
      <button
        type="button"
        className="cot-trofeu"
        data-vencedor={o.vencedor || undefined}
        aria-pressed={o.vencedor}
        aria-label={rotulo}
        title={estado.erro ?? rotulo}
        disabled={!editavel || pendente || (!o.vencedor && !pode)}
        onClick={() => startTransition(() => enviar(formDe({ orcamento_id: o.id, marcar: o.vencedor ? 'false' : 'true' })))}
        data-teste="trofeu"
      >
        <Trophy size={16} aria-hidden="true" />
      </button>
      {estado.erro ? (
        <span className="so-leitor" role="alert">
          {estado.erro}
        </span>
      ) : null}
    </>
  )
}

function LinhaOrcamento({
  o,
  menor,
  amostra,
  editavel,
  fretes,
}: {
  o: Orcamento
  menor: boolean
  amostra: boolean
  editavel: boolean
  fretes: Opcao[]
}) {
  const [estado, enviar, gravando] = useActionState(editarOrcamento, {})
  const [estadoApagar, apagar, apagando] = useActionState(excluirOrcamento, {})
  const [tipo, setTipo] = useState(String(o.tipo_frete_id))
  const formId = `orc-${o.id}`
  const formRef = useRef<HTMLFormElement>(null)
  // Os campos são do servidor: quando o banco devolve outro valor, a chave muda e o campo relê.
  const versao = `${o.valor_venda_unit}|${o.valor_comissao_unit}|${o.tipo_frete_id}|${o.valor_frete}`

  function gravarSeMudou(e: React.FocusEvent<HTMLInputElement>, doBanco: string) {
    if (e.currentTarget.value.trim() !== reaisParaCampo(doBanco)) formRef.current?.requestSubmit()
  }

  const erro = estado.erro ?? estadoApagar.erro
  return (
    <>
      <tr className="cot-orc" data-vencedor={o.vencedor || undefined} aria-busy={gravando || undefined} data-teste="linha-orcamento">
        <td className="cot-col-acoes" />
        <td className="cot-col-qtd cot-centro">
          <BotaoTrofeu o={o} amostra={amostra} editavel={editavel} />
        </td>
        <th scope="row" className="cot-col-produto">
          <form id={formId} ref={formRef} onSubmit={enviarCom(enviar)} hidden>
            <input type="hidden" name="orcamento_id" value={o.id} />
          </form>
          <strong>
            {o.fornecedor_nome} – {o.origem?.uf ?? ''}
          </strong>
          <small>{o.origem?.regime?.nome ?? 'Falta regime tributário'}</small>
        </th>
        {editavel ? (
          <>
            <td>
              <input
                key={`u-${versao}`}
                form={formId}
                name="valor_venda_unit"
                className="cot-num"
                inputMode="decimal"
                defaultValue={reaisParaCampo(o.valor_venda_unit)}
                aria-label={`Produto Unit. de ${o.fornecedor_nome}`}
                onBlur={(e) => gravarSeMudou(e, o.valor_venda_unit)}
                data-teste="orc-unit"
              />
            </td>
            <td>
              <input
                key={`c-${versao}`}
                form={formId}
                name="valor_comissao_unit"
                className="cot-num"
                inputMode="decimal"
                defaultValue={reaisParaCampo(o.valor_comissao_unit)}
                aria-label={`Comissão Unit. de ${o.fornecedor_nome}`}
                onBlur={(e) => gravarSeMudou(e, o.valor_comissao_unit)}
                data-teste="orc-comissao"
              />
            </td>
            <td>
              <select
                form={formId}
                name="tipo_frete_id"
                value={tipo}
                aria-label={`Tipo Frete de ${o.fornecedor_nome}`}
                onChange={(e) => {
                  setTipo(e.target.value)
                  // Troca de tipo grava na hora (bTOSi0); fora de CIF Informado o frete vai a 0.
                  queueMicrotask(() => formRef.current?.requestSubmit())
                }}
              >
                {fretes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                key={`f-${versao}-${tipo}`}
                form={formId}
                name="valor_frete"
                className="cot-num"
                inputMode="decimal"
                defaultValue={reaisParaCampo(o.valor_frete)}
                disabled={Number(tipo) !== FRETE_CIF_INFORMADO}
                aria-label={`Valor Frete de ${o.fornecedor_nome}`}
                onBlur={(e) => gravarSeMudou(e, o.valor_frete)}
              />
            </td>
          </>
        ) : (
          <>
            <td>{formatarReais(o.valor_venda_unit)}</td>
            <td>{formatarReais(o.valor_comissao_unit)}</td>
            <td className="cot-texto">{o.frete_nome}</td>
            <td>{formatarReais(o.valor_frete)}</td>
          </>
        )}
        <td>{formatarAliquota(o.aliquota_icms)}</td>
        <td>{formatarAliquota(o.aliquota_pis_cofins)}</td>
        <td className="cot-tributos">{formatarReais(o.valor_tributos)}</td>
        <td>{formatarReais(o.valor_venda_bruto)}</td>
        <td className="cot-liquido" data-menor={menor || undefined}>
          {formatarReais(o.valor_venda_liquido)}
        </td>
        <td>{formatarReais(o.valor_comissao_bruto)}</td>
        <td className="cot-col-fim">
          {editavel ? (
            <BotaoApagar rotulo={`Apagar orçamento de ${o.fornecedor_nome}`} campo="orcamento_id" valor={o.id} acao={apagar} pendente={apagando} />
          ) : null}
        </td>
      </tr>
      {erro ? (
        <tr className="cot-orc-erro">
          <td colSpan={COLUNAS}>
            <p className="aviso" data-tom="erro" role="alert" data-teste="erro-vendas">
              {erro}
            </p>
          </td>
        </tr>
      ) : null}
    </>
  )
}

function QtdItem({ item, editavel }: { item: Item; editavel: boolean }) {
  const [estado, enviar, gravando] = useActionState(alterarQtdItem, {})
  const formRef = useRef<HTMLFormElement>(null)
  if (!editavel) return <span className="cot-qtd-leitura">{formatarQuantidade(item.qtd)}</span>
  return (
    <form ref={formRef} onSubmit={enviarCom(enviar)} className="cot-qtd-form">
      <input type="hidden" name="item_id" value={item.id} />
      <input
        key={item.qtd}
        name="qtd"
        className="cot-num cot-qtd"
        inputMode="decimal"
        defaultValue={qtdParaCampo(item.qtd)}
        aria-label={`Quantidade de ${item.produto?.nome ?? 'produto'}`}
        aria-invalid={!!estado.erro || undefined}
        title={estado.erro}
        aria-busy={gravando || undefined}
        onBlur={(e) => {
          if (e.currentTarget.value.trim() !== qtdParaCampo(item.qtd)) formRef.current?.requestSubmit()
        }}
        data-teste="item-qtd"
      />
    </form>
  )
}

function LinhasItem({
  item,
  orcamentos,
  amostra,
  editavel,
  fretes,
  aberto,
  aoAlternar,
  aoEditar,
  editando,
}: {
  item: Item
  orcamentos: Orcamento[]
  amostra: boolean
  editavel: boolean
  fretes: Opcao[]
  aberto: boolean
  aoAlternar: () => void
  aoEditar: () => void
  editando: boolean
}) {
  const [orcando, setOrcando] = useState(false)
  const [estadoApagar, apagar, apagando] = useActionState(excluirItem, {})
  const vencedor = orcamentos.find((o) => o.vencedor)
  const menores = new Set(idsMenorLiquido(orcamentos))
  const sub = [item.condicao?.nome, item.linha?.nome, item.medida].filter(Boolean).join(' - ')
  const destino = item.destino ? rotuloEndereco(item.destino) : null
  // Lista fechada: a linha do produto mostra os valores do vencedor (spec §2.6).
  const resumo = !aberto && vencedor ? vencedor : null

  return (
    <tbody className="cot-item" data-editando={editando || undefined} data-teste="item-carrinho">
      <tr className="cot-item-linha">
        <td className="cot-col-acoes">
          <div className="cot-acoes">
            {editavel ? (
              <button type="button" className="cot-icone" aria-label={`Editar ${item.produto?.nome ?? 'produto'}`} title="Editar produto" onClick={aoEditar} aria-pressed={editando}>
                <Pencil {...ICONE} />
              </button>
            ) : null}
            {/* "Destino desse produto" — verde quando tem destino; sem workflow no Bubble (§2.6). */}
            <span className="cot-icone" data-tom={destino ? 'ok' : undefined} role="img" aria-label={destino ? `Destino: ${destino}` : 'Sem destino'} title={destino ? `Destino: ${destino}` : 'Sem destino'}>
              <MapPin {...ICONE} />
            </span>
            {editavel ? (
              <button
                type="button"
                className="cot-icone"
                aria-label="Adiciona fornecedor para orçar"
                title="Adiciona fornecedor para orçar"
                aria-expanded={orcando}
                onClick={() => setOrcando((v) => !v)}
                data-teste="novo-orcamento"
              >
                <Factory {...ICONE} />
              </button>
            ) : null}
          </div>
        </td>
        <td className="cot-col-qtd">
          <QtdItem item={item} editavel={editavel} />
        </td>
        {/* Sem valores de vencedor para mostrar, o produto ocupa as colunas de valor (vazias). */}
        <th scope="rowgroup" className="cot-col-produto" colSpan={resumo ? 1 : 11}>
          <div className="cot-produto">
            <button type="button" className="cot-chevron" aria-expanded={aberto} aria-label={aberto ? 'Esconder fornecedores' : 'Mostrar fornecedores'} onClick={aoAlternar}>
              {aberto ? <ChevronDown {...ICONE} /> : <ChevronRight {...ICONE} />}
            </button>
            <button type="button" className="cot-produto-nome" onClick={aoAlternar}>
              <strong>{item.produto?.nome ?? '—'}</strong>
              <small>{sub || '—'}</small>
            </button>
            <span className="cot-contador" title="Fornecedores orçados" aria-label={`${orcamentos.length} fornecedores orçados`}>
              {orcamentos.length}
            </span>
            {vencedor ? (
              <span className="cot-vencedor" title={`Vencedor: ${vencedor.fornecedor_nome}`}>
                <Trophy size={14} aria-hidden="true" />
                <span>{vencedor.fornecedor_nome}</span>
              </span>
            ) : null}
            {orcamentos.length === 0 ? <span className="cot-item-vazio">Nenhum fornecedor orçado para este produto.</span> : null}
          </div>
        </th>
        {resumo ? (
          <>
            <td>{formatarReais(resumo.valor_venda_unit)}</td>
            <td>{formatarReais(resumo.valor_comissao_unit)}</td>
            <td className="cot-texto">{resumo.frete_nome}</td>
            <td>{formatarReais(resumo.valor_frete)}</td>
            <td>{formatarAliquota(resumo.aliquota_icms)}</td>
            <td>{formatarAliquota(resumo.aliquota_pis_cofins)}</td>
            <td className="cot-tributos">{formatarReais(resumo.valor_tributos)}</td>
            <td>{formatarReais(resumo.valor_venda_bruto)}</td>
            <td className="cot-liquido" data-menor>
              {formatarReais(resumo.valor_venda_liquido)}
            </td>
            <td>{formatarReais(resumo.valor_comissao_bruto)}</td>
          </>
        ) : null}
        <td className="cot-col-fim">
          {editavel ? (
            <BotaoApagar rotulo={`Remover ${item.produto?.nome ?? 'produto'} do carrinho`} campo="item_id" valor={item.id} acao={apagar} pendente={apagando} />
          ) : null}
        </td>
      </tr>
      {estadoApagar.erro ? (
        <tr className="cot-orc-erro">
          <td colSpan={COLUNAS}>
            <p className="aviso" data-tom="erro" role="alert">
              {estadoApagar.erro}
            </p>
          </td>
        </tr>
      ) : null}
      {orcando ? (
        <tr className="cot-orc-form">
          <td colSpan={COLUNAS}>
            <FormOrcamento item={item} fretes={fretes} aoTerminar={() => setOrcando(false)} />
          </td>
        </tr>
      ) : null}
      {aberto
        ? orcamentos.map((o) => (
            <LinhaOrcamento key={o.id} o={o} menor={menores.has(o.id)} amostra={amostra} editavel={editavel} fretes={fretes} />
          ))
        : null}
    </tbody>
  )
}

function TabelaCarrinho({
  ficha,
  fretes,
  amostra,
  editavel,
  editandoId,
  aoEditar,
}: {
  ficha: Ficha | null
  fretes: Opcao[]
  amostra: boolean
  editavel: boolean
  editandoId: string | null
  aoEditar: (item: Item) => void
}) {
  const [fechados, setFechados] = useState<Set<string>>(new Set())
  const itens = ficha?.itens ?? []
  const todosAbertos = fechados.size === 0
  function alternar(id: string) {
    setFechados((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }
  return (
    <section className="cot-cartao cot-tabela-cartao" aria-label="Carrinho">
      <div className="cot-rolagem">
        <table className="cot-tabela" data-teste="lista-itens">
          <colgroup>
            <col className="cot-c-acoes" />
            <col className="cot-c-qtd" />
            <col className="cot-c-produto" />
            <col span={10} className="cot-c-valor" />
            <col className="cot-c-fim" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <span className="so-leitor">Ações</span>
              </th>
              <th scope="col">QTD</th>
              <th scope="col" className="cot-col-produto">
                <button
                  type="button"
                  className="cot-abrir-todos"
                  aria-label={todosAbertos ? 'Fechar todos os fornecedores' : 'Abrir todos os fornecedores'}
                  title={todosAbertos ? 'Fechar todos' : 'Abrir todos'}
                  onClick={() => setFechados(todosAbertos ? new Set(itens.map((i) => i.id)) : new Set())}
                  disabled={itens.length === 0}
                >
                  {todosAbertos ? <ChevronDown {...ICONE} /> : <ChevronRight {...ICONE} />}
                </button>
                Produto / Fornecedor
              </th>
              <th scope="col">Produto Unit.</th>
              <th scope="col">Comissão Unit.</th>
              <th scope="col">Tipo Frete</th>
              <th scope="col">Valor Frete</th>
              <th scope="col">Alíq. ICMS</th>
              <th scope="col">Alíq. PIS/COFINS</th>
              <th scope="col">Total Tributos</th>
              <th scope="col">Total Bruto</th>
              <th scope="col">Total Líq</th>
              <th scope="col">Total Comiss.</th>
              <th scope="col">
                <span className="so-leitor">Apagar</span>
              </th>
            </tr>
          </thead>
          {itens.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={COLUNAS} className="cot-vazio">
                  <ShoppingCart size={28} strokeWidth={1.5} aria-hidden="true" />
                  <span>Nenhum produto no carrinho ainda.</span>
                </td>
              </tr>
            </tbody>
          ) : (
            itens.map((it) => (
              <LinhasItem
                key={it.id}
                item={it}
                orcamentos={(ficha?.orcamentos ?? []).filter((o) => o.cotacao_item_id === it.id)}
                amostra={amostra}
                editavel={editavel}
                fretes={fretes}
                aberto={!fechados.has(it.id)}
                aoAlternar={() => alternar(it.id)}
                aoEditar={() => aoEditar(it)}
                editando={editandoId === it.id}
              />
            ))
          )}
        </table>
      </div>
    </section>
  )
}

// ================================================================ arquivamento

function Arquivamento({ ficha, motivos }: { ficha: Ficha; motivos: Opcao[] }) {
  const [estadoArq, arquivar, arquivando] = useActionState(arquivarCotacao, {})
  const [estadoDes, desarquivar, desarquivando] = useActionState(desarquivarCotacao, {})
  const c = ficha.cotacao
  if (c.etapa_id !== ETAPA.COTACAO || c.rascunho) return null
  return (
    <div className="vendas-arquivo">
      {c.arquivado ? (
        <form onSubmit={enviarCom(desarquivar)}>
          <input type="hidden" name="cotacao_id" value={c.id} />
          <button type="submit" className="botao-secundario" disabled={desarquivando} aria-busy={desarquivando}>
            {desarquivando ? 'Gravando…' : 'Desarquivar'}
          </button>
        </form>
      ) : (
        <form className="vendas-arquivo-form" onSubmit={enviarCom(arquivar)}>
          <input type="hidden" name="cotacao_id" value={c.id} />
          <label className="campo">
            <span>Motivo do arquivamento</span>
            <select name="motivo_id" required defaultValue="">
              <option value="">Escolha…</option>
              {motivos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="botao-perigo" disabled={arquivando} aria-busy={arquivando}>
            {arquivando ? 'Gravando…' : 'Arquivar'}
          </button>
        </form>
      )}
      <Mensagem estado={estadoArq.erro ? estadoArq : estadoDes} />
    </div>
  )
}

// ======================================================================= a tela

/** Abre o <dialog> nativo em modo modal ao montar: foco preso, fundo inerte, sem biblioteca. */
function useModal() {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  return ref
}

/**
 * A cotação em tela cheia. `ficha = null` é a cotação NOVA ainda sem carrinho; com ficha, é o
 * rascunho (ainda "Nova Cotação") ou a cotação gravada ("Edita Cotação"), que hospeda também
 * as abas de propostas e pedidos (fluxo.tsx).
 */
export function TelaCotacao({
  ficha,
  abaInicial,
  opcoes,
  opcoesFicha: opcoesDaPagina,
  permissoes,
  aoCriarRascunho,
  aoFechar,
}: {
  ficha: Ficha | null
  abaInicial: Aba
  opcoes: Opcoes
  opcoesFicha: OpcoesFicha | null
  permissoes: Permissoes
  /** o primeiro produto criou o rascunho: a página passa a mostrá-lo pela URL */
  aoCriarRascunho: (id: string) => void
  aoFechar: () => void
}) {
  const ref = useModal()
  const c = ficha?.cotacao ?? null
  const nova = !c || c.rascunho
  const editavel = !c || (c.etapa_id === ETAPA.COTACAO && (!c.arquivado || permissoes.ehDiretor))
  const [aba, setAba] = useState<Aba>(nova ? 'cotacao' : abaInicial)

  // Listas do carrinho: da página quando há ficha; na nova, pedidas ao abrir.
  const [opcoesNova, setOpcoesNova] = useState<OpcoesFicha | null>(null)
  const opcoesFicha = opcoesDaPagina ?? opcoesNova
  useEffect(() => {
    if (opcoesDaPagina || opcoesNova) return
    let vivo = true
    opcoesDaCotacaoNova().then((o) => vivo && setOpcoesNova(o))
    return () => {
      vivo = false
    }
  }, [opcoesDaPagina, opcoesNova])

  // Cliente e endereços: da ficha quando existe; na nova, da busca.
  const [clienteNovo, setClienteNovo] = useState<{ id: string; nome: string } | null>(null)
  const cliente = c ? { id: c.cliente_id, nome: c.cliente?.nome ?? '—' } : clienteNovo
  const [destinosNovo, setDestinosNovo] = useState<Destino[]>([])
  const [carregandoDestinos, setCarregandoDestinos] = useState(false)
  const destinos = ficha ? ficha.destinos : destinosNovo
  const [destino, setDestino] = useState(() => (ficha ? destinoPadrao(ficha.itens, ficha.destinos) : ''))

  const [cab, setCab] = useState<Cabecalho>(() => ({
    empresa: String(c?.empresa_emissora_id ?? opcoes.empresas[0]?.id ?? ''),
    validade: c?.data_validade ?? validadePadrao(hojeSP()),
    amostra: c?.amostra ?? false,
  }))

  async function escolherCliente(novo: { id: string; nome: string } | null) {
    setClienteNovo(novo)
    setDestino('')
    setDestinosNovo([])
    if (!novo) return
    setCarregandoDestinos(true)
    const r = await enderecosDoCliente(novo.id)
    setCarregandoDestinos(false)
    if ('erro' in r) return
    setDestinosNovo(r)
    if (r.length === 1) setDestino(r[0]!.id)
  }

  // ------------------------------------------------------------ carrinho
  const [edicao, setEdicao] = useState<Edicao>(null)
  const [estadoItem, setEstadoItem] = useState<EstadoAcao>({})
  const [enviandoItem, setEnviandoItem] = useState(false)
  const [versaoForm, setVersaoForm] = useState(0)

  function camposCabecalho(): Record<string, string | boolean> {
    return {
      cliente_id: cliente?.id ?? '',
      empresa_emissora_id: cab.empresa,
      data_validade: cab.validade,
      amostra: cab.amostra,
    }
  }

  async function enviarItem(f: FormData, editando: boolean) {
    setEnviandoItem(true)
    let r: EstadoAcao
    if (editando && edicao) {
      f.set('item_id', edicao.item.id)
      r = await editarItem({}, f)
    } else {
      for (const [k, v] of Object.entries(camposCabecalho())) {
        if (typeof v === 'boolean') {
          if (v) f.set(k, 'on')
        } else f.set(k, v)
      }
      f.set('cotacao_id', c?.id ?? '')
      f.set('endereco_destino_id', destino)
      r = await adicionarAoCarrinho({}, f)
    }
    setEnviandoItem(false)
    setEstadoItem(r)
    if (r.ok) {
      if (editando) {
        setEdicao(null)
        setVersaoForm((v) => v + 1)
      }
      if (!c && r.id) aoCriarRascunho(r.id)
    }
  }

  const bloqueio = !editavel
    ? 'Esta cotação não aceita mais produtos (arquivada ou já virou pedido).'
    : !cliente
      ? 'Comece pelo cliente: busque pelo nome no cartão ao lado.'
      : !destino
        ? 'Escolha o endereço de entrega do cliente.'
        : null

  // ------------------------------------------------------------ rodapé
  const [estadoRodape, setEstadoRodape] = useState<EstadoAcao>({})
  const [gravando, setGravando] = useState(false)

  async function gravar() {
    setGravando(true)
    const r = c
      ? await gravarCabecalho({}, formDe({ cotacao_id: c.id, finalizar: 'true', ...camposCabecalho() }))
      : await criarCotacao({}, formDe(camposCabecalho()))
    setGravando(false)
    setEstadoRodape(r)
    if (r.ok) ref.current?.close()
  }

  async function cancelar() {
    if (c?.rascunho) {
      setGravando(true)
      const r = await descartarRascunho({}, formDe({ cotacao_id: c.id }))
      setGravando(false)
      if (r.erro) return setEstadoRodape(r)
    }
    ref.current?.close()
  }

  async function trocarAmostra(amostra: boolean) {
    if (!c) return
    const r = await gravarCabecalho({}, formDe({ cotacao_id: c.id, ...camposCabecalho(), amostra }))
    if (r.erro) {
      setCab((x) => ({ ...x, amostra: !amostra }))
      setEstadoRodape(r)
    }
  }

  const abas: { id: Aba; rotulo: string }[] = ficha
    ? [
        { id: 'cotacao', rotulo: `Cotação (${ficha.itens.length})` },
        { id: 'propostas', rotulo: `Propostas (${ficha.propostas.length})` },
        { id: 'pedidos', rotulo: `Pedidos (${ficha.pedidos.length})` },
      ]
    : []

  return (
    <dialog
      ref={ref}
      className="dialogo cot-tela"
      aria-labelledby="cot-titulo-tela"
      onClose={aoFechar}
      // Esc com carrinho em rascunho não some com ele: sair é pelo "Cancela" (apaga) ou "Gravar".
      onCancel={(e) => {
        if (c?.rascunho) e.preventDefault()
      }}
      data-teste={nova ? 'nova-cotacao-dialogo' : 'ficha-cotacao'}
    >
      <header className="cot-barra">
        <div className="cot-barra-titulo">
          <p className="ficha-vendas-tipo">{nova ? 'Nova Cotação' : editavel ? 'Edita Cotação' : 'Cotação'}</p>
          <h1 id="cot-titulo-tela">
            {cliente?.nome ?? 'Cliente ainda não escolhido'}
            {c ? <span className="ficha-vendas-num">Cotação núm. {c.numero}</span> : null}
          </h1>
          {c && !c.rascunho ? (
            <p className="ficha-vendas-selos">
              <span className="selo">{c.etapa?.nome ?? '—'}</span>
              <span className="selo" data-tom={c.status?.nome === 'Cancelado' ? 'erro' : undefined}>
                {c.status?.nome ?? '—'}
              </span>
              {c.amostra ? (
                <span className="selo" data-tom="alerta">
                  Pedido de Amostra
                </span>
              ) : null}
              {c.arquivado ? (
                <span className="selo" data-tom="erro">
                  Arquivada: {c.motivo?.nome ?? 'Motivo não disponível'}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        {abas.length > 0 && !nova ? (
          <div className="abas cot-abas" role="tablist" aria-label="Seções da cotação">
            {abas.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                id={`aba-${a.id}`}
                aria-selected={aba === a.id}
                aria-controls={`painel-${a.id}`}
                onClick={() => setAba(a.id)}
              >
                {a.rotulo}
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" className="dialogo-fechar" aria-label="Fechar" title={c?.rascunho ? 'Use Cancela para descartar o rascunho' : 'Fechar'} onClick={() => (c?.rascunho ? cancelar() : ref.current?.close())}>
          <X size={22} aria-hidden="true" />
        </button>
      </header>

      <div className="cot-corpo" role={abas.length > 0 && !nova ? 'tabpanel' : undefined} id={`painel-${aba}`} aria-labelledby={abas.length > 0 && !nova ? `aba-${aba}` : undefined}>
        {ficha?.incompleta ? (
          <p className="aviso" data-tom="erro" role="alert">
            Parte desta cotação não carregou agora. Recarregue a página antes de alterar.
          </p>
        ) : null}
        {c?.arquivado && !permissoes.ehDiretor ? (
          <p className="aviso vendas-aviso-topo">Cotação arquivada: só o Diretor altera. Desarquive para editar.</p>
        ) : null}

        {aba === 'cotacao' ? (
          <>
            <div className="cot-topo">
              <CartaoCabecalho
                titulo={nova ? 'Nova Cotação' : 'Edita Cotação'}
                numero={c?.numero ?? null}
                cliente={cliente}
                clienteTravado={!!c}
                aoEscolherCliente={escolherCliente}
                destinos={destinos}
                carregandoDestinos={carregandoDestinos}
                destino={destino}
                setDestino={setDestino}
                cab={cab}
                setCab={setCab}
                aoTrocarAmostra={trocarAmostra}
                empresas={opcoes.empresas}
                dataCotacao={formatarData(c?.criado_em ?? new Date().toISOString())}
                vendedor={c?.vendedor?.nome ?? opcoes.eu}
                editavel={editavel}
              />
              <CartaoCarrinho
                key={`${edicao?.item.id ?? 'novo'}-${versaoForm}`}
                opcoesFicha={opcoesFicha}
                pronto={!bloqueio}
                motivoBloqueio={edicao ? null : bloqueio}
                edicao={edicao}
                aoCancelarEdicao={() => {
                  setEdicao(null)
                  setEstadoItem({})
                }}
                enviar={enviarItem}
                enviando={enviandoItem}
                estado={estadoItem}
              />
            </div>
            <TabelaCarrinho
              ficha={ficha}
              fretes={opcoesFicha?.fretes ?? []}
              amostra={c?.amostra ?? cab.amostra}
              editavel={editavel && !!c}
              editandoId={edicao?.item.id ?? null}
              aoEditar={(item) => {
                setEdicao({ item })
                setEstadoItem({})
              }}
            />
          </>
        ) : null}
        {ficha && aba === 'propostas' ? (
          <AbaPropostas ficha={ficha} editavel={!ficha.cotacao.arquivado || permissoes.ehDiretor} irParaPedidos={() => setAba('pedidos')} />
        ) : null}
        {ficha && aba === 'pedidos' ? <AbaPedidos ficha={ficha} etapas={opcoes.etapas} opcoesFicha={opcoesFicha ?? vazias} /> : null}
      </div>

      <footer className="dialogo-rodape cot-rodape">
        {ficha && aba === 'cotacao' ? <Arquivamento ficha={ficha} motivos={opcoes.motivos} /> : null}
        <div className="cot-rodape-centro">
          <Mensagem estado={estadoRodape} />
          {aba === 'cotacao' && editavel ? (
            <>
              <button
                type="button"
                className={nova ? 'botao-primario cot-gravar' : 'botao-alerta cot-gravar'}
                disabled={gravando || !cliente}
                aria-busy={gravando}
                onClick={gravar}
                data-teste="gravar-cotacao"
              >
                <Save size={18} aria-hidden="true" />
                {gravando ? 'Gravando…' : nova ? 'Gravar Cotação' : 'Salvar Cotação'}
              </button>
              <button type="button" className="botao-secundario cot-cancela" data-tom={nova ? undefined : 'alerta'} disabled={gravando} onClick={cancelar} data-teste="cancela-cotacao">
                Cancela
              </button>
            </>
          ) : (
            <button type="button" className="botao-secundario" onClick={() => ref.current?.close()}>
              Fechar
            </button>
          )}
        </div>
      </footer>
    </dialog>
  )
}

const vazias: OpcoesFicha = { grupos: [], produtos: [], condicoes: [], linhas: [], fretes: [], prazos: [], formas: [] }
