'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'

import { formatarData } from '@/lib/datas'
import { formatarAliquota, formatarReais } from '@/lib/dinheiro'
import {
  type Aba,
  ETAPA,
  FRETE_CIF_INFORMADO,
  formatarDia,
  formatarQuantidade,
  hojeSP,
  idsMenorLiquido,
  podeSerVencedor,
  validadePadrao,
} from '@/lib/vendas'

import { AbaPedidos, AbaPropostas } from './fluxo'
import {
  adicionarItem,
  adicionarOrcamento,
  arquivarCotacao,
  buscarClientes,
  criarCotacao,
  definirVencedor,
  desarquivarCotacao,
  fornecedoresParaItem,
} from './acoes'
import type {
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

/** Abre o <dialog> nativo em modo modal ao montar: foco preso e Esc fecha, sem biblioteca. */
function useModal() {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  return ref
}

/**
 * onSubmit em vez de action={...}: com action, o React 19 limpa o formulário ao fim de toda
 * chamada — inclusive quando a validação devolve erro, e a pessoa perderia o que digitou.
 * (Mesmo motivo da tela-modelo de cadastros.)
 */
function enviarCom(acao: (f: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    startTransition(() => acao(form))
  }
}

// ------------------------------------------------------------------ nova cotação

/**
 * "+ Cotação" (WF bTOOI → pop add edita cotacao em modo Nova Cotação). Cliente por
 * autocomplete de clientes ativos, empresa emissora (padrão Megabox), validade (hoje + 2)
 * e "Pedido de Amostra". Os produtos entram depois, na ficha.
 */
export function NovaCotacao({
  empresas,
  aoCriar,
  aoFechar,
}: {
  empresas: Opcao[]
  aoCriar: (id: string) => void
  aoFechar: () => void
}) {
  const ref = useModal()
  const [estado, criar, criando] = useActionState(criarCotacao, {})
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<{ id: string; nome: string }[]>([])
  const [buscando, setBuscando] = useState(false)
  const [cliente, setCliente] = useState<{ id: string; nome: string } | null>(null)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hoje = hojeSP()

  useEffect(() => {
    if (estado.id) aoCriar(estado.id)
    // aoCriar muda de identidade a cada render do pai; o gatilho é só o id novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.id])

  function procurar(texto: string) {
    setBusca(texto)
    setCliente(null)
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
    <dialog ref={ref} className="dialogo vendas-nova-dialogo" aria-labelledby="nova-titulo" onClose={aoFechar} data-teste="nova-cotacao-dialogo">
      <header className="dialogo-cabecalho">
        <h2 id="nova-titulo">Nova Cotação</h2>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          ✕
        </button>
      </header>
      <form id="form-nova" className="dialogo-corpo vendas-form" noValidate onSubmit={enviarCom(criar)}>
        <input type="hidden" name="cliente_id" value={cliente?.id ?? ''} />
        <div className="campo vendas-largo">
          <label htmlFor="nova-cliente">Cliente</label>
          <input
            id="nova-cliente"
            type="search"
            value={cliente ? cliente.nome : busca}
            onChange={(e) => procurar(e.target.value)}
            placeholder="Buscar cliente (2 letras ou mais)"
            autoComplete="off"
            autoFocus
            aria-controls="nova-resultados"
            data-teste="campo-cliente"
          />
          {!cliente && busca.trim().length >= 2 ? (
            <ul id="nova-resultados" className="vendas-resultados" role="listbox" aria-label="Clientes encontrados">
              {buscando ? <li className="vendas-resultado-vazio">Buscando…</li> : null}
              {!buscando && resultados.length === 0 ? (
                <li className="vendas-resultado-vazio">Nenhum cliente ativo com esse nome.</li>
              ) : null}
              {resultados.map((r) => (
                <li key={r.id} role="option" aria-selected={false}>
                  <button type="button" onClick={() => setCliente(r)}>
                    {r.nome}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <fieldset className="vendas-empresa">
          <legend>Empresa emissora</legend>
          {empresas.map((e, i) => (
            <label key={e.id} className="caixa">
              <input type="radio" name="empresa_emissora_id" value={e.id} defaultChecked={i === 0} />
              {e.nome}
            </label>
          ))}
        </fieldset>

        <label className="campo">
          <span>Data validade</span>
          <input type="date" name="data_validade" min={hoje} defaultValue={validadePadrao(hoje)} required />
        </label>

        <label className="caixa">
          <input type="checkbox" name="amostra" />
          Pedido de Amostra
        </label>

        <div className="vendas-largo">
          <Mensagem estado={estado} />
        </div>
      </form>
      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Cancela
        </button>
        <button type="submit" form="form-nova" className="botao-primario" disabled={criando || !cliente} aria-busy={criando} data-teste="gravar-cotacao">
          {criando ? 'Gravando…' : 'Gravar Cotação'}
        </button>
      </footer>
    </dialog>
  )
}

// ---------------------------------------------------------------- aba Cotação

function FormItem({
  ficha,
  opcoesFicha,
  aoTerminar,
}: {
  ficha: Ficha
  opcoesFicha: OpcoesFicha
  aoTerminar: () => void
}) {
  const [estado, enviar, enviando] = useActionState(adicionarItem, {})
  const [produtoId, setProdutoId] = useState('')
  const produto = opcoesFicha.produtos.find((p) => p.id === produtoId)
  const condicoes = opcoesFicha.condicoes.filter((c) => produto?.condicoes.some((x) => x.condicao_id === c.id))
  const linhas = opcoesFicha.linhas.filter((l) => produto?.linhas.some((x) => x.linha_id === l.id))

  useEffect(() => {
    if (estado.ok) aoTerminar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  return (
    <form className="vendas-subform" noValidate onSubmit={enviarCom(enviar)} data-teste="form-item">
      <h4>Adicionar produto ao carrinho</h4>
      <input type="hidden" name="cotacao_id" value={ficha.cotacao.id} />
      <div className="vendas-subform-campos">
        <label className="campo vendas-largo">
          <span>Produto</span>
          <select name="produto_id" value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
            <option value="">Escolha…</option>
            {opcoesFicha.produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
                {p.grupo ? ` — ${p.grupo.nome}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Condição</span>
          <select name="condicao_id" disabled={!produto} key={`c-${produtoId}`} defaultValue={condicoes.length === 1 ? condicoes[0]!.id : ''}>
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
          <select name="linha_id" disabled={!produto} key={`l-${produtoId}`} defaultValue={linhas.length === 1 ? linhas[0]!.id : ''}>
            <option value="">—</option>
            {linhas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Qtd</span>
          <input name="qtd" inputMode="decimal" required placeholder="0" data-teste="campo-qtd" />
        </label>
        <label className="campo vendas-largo">
          <span>Endereço de entrega</span>
          <select name="endereco_destino_id" required defaultValue={ficha.destinos.length === 1 ? ficha.destinos[0]!.id : ''}>
            <option value="">Selecione o destino</option>
            {ficha.destinos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome_endereco} — {d.municipio ? `${d.municipio}/` : ''}
                {d.uf}
              </option>
            ))}
          </select>
        </label>
        <label className="campo vendas-largo">
          <span>Medida, descrição ou obs.</span>
          <input name="medida" maxLength={500} autoComplete="off" data-teste="campo-medida" />
        </label>
      </div>
      <Mensagem estado={estado} />
      <div className="vendas-subform-acoes">
        <button type="button" className="botao-secundario" onClick={aoTerminar}>
          Cancela
        </button>
        <button type="submit" className="botao-primario" disabled={enviando} aria-busy={enviando} data-teste="gravar-item">
          {enviando ? 'Gravando…' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}

function FormOrcamento({
  item,
  fretes,
  aoTerminar,
}: {
  item: Item
  fretes: Opcao[]
  aoTerminar: () => void
}) {
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
    <form className="vendas-subform" noValidate onSubmit={enviarCom(enviar)} data-teste="form-orcamento">
      <h4>Adiciona fornecedor para orçar</h4>
      <input type="hidden" name="cotacao_item_id" value={item.id} />
      {erroLista ? <p className="aviso" data-tom="erro">{erroLista}</p> : null}
      <div className="vendas-subform-campos">
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
          <input
            name="valor_frete"
            inputMode="decimal"
            placeholder="R$ 0,00"
            disabled={Number(tipoFrete) !== FRETE_CIF_INFORMADO}
            key={tipoFrete}
          />
        </label>
      </div>
      <p className="vendas-nota">
        As alíquotas de ICMS e PIS/COFINS são aplicadas pelo sistema conforme o regime e a UF de origem e destino.
      </p>
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

function Trofeu({
  o,
  amostra,
  editavel,
  enviar,
}: {
  o: Orcamento
  amostra: boolean
  editavel: boolean
  enviar: (f: FormData) => void
}) {
  const pode = podeSerVencedor(o, amostra)
  const rotulo = o.vencedor ? 'Vencedor (clique para desmarcar)' : pode ? 'Marcar como vencedor' : 'Informe valor e comissão para poder vencer'
  if (!editavel) {
    return (
      <span className="trofeu" data-vencedor={o.vencedor || undefined} title={o.vencedor ? 'Vencedor' : undefined} aria-label={o.vencedor ? 'Vencedor' : 'Não vencedor'}>
        🏆
      </span>
    )
  }
  return (
    <form onSubmit={enviarCom(enviar)}>
      <input type="hidden" name="orcamento_id" value={o.id} />
      <input type="hidden" name="marcar" value={o.vencedor ? 'false' : 'true'} />
      <button
        type="submit"
        className="trofeu"
        data-vencedor={o.vencedor || undefined}
        aria-pressed={o.vencedor}
        aria-label={rotulo}
        title={rotulo}
        disabled={!o.vencedor && !pode}
      >
        🏆
      </button>
    </form>
  )
}

/**
 * Sub-tabela de orçamentos do item (`rpg fornecedorescotacao`, spec §2.6): os valores são
 * os do BANCO (colunas geradas + v_orcamento_valores). Vencedor com fundo verde; o menor
 * líquido do item em verde.
 */
function TabelaOrcamentos({
  orcamentos,
  amostra,
  editavel,
  enviarVencedor,
}: {
  orcamentos: Orcamento[]
  amostra: boolean
  editavel: boolean
  enviarVencedor: (f: FormData) => void
}) {
  const menores = new Set(idsMenorLiquido(orcamentos))
  return (
    <div className="orc-rolagem">
      <table className="orc-tabela">
        <thead>
          <tr>
            <th scope="col">Fornecedor</th>
            <th scope="col">Produto Unit.</th>
            <th scope="col">Comissão Unit.</th>
            <th scope="col">Tipo Frete</th>
            <th scope="col">Valor Frete</th>
            <th scope="col">Aliq. ICMS</th>
            <th scope="col">Aliq. PIS/COFINS</th>
            <th scope="col">Total Tributos</th>
            <th scope="col">Total Bruto</th>
            <th scope="col">Total Comiss.</th>
            <th scope="col">Total Líq.</th>
            <th scope="col">
              <span className="so-leitor">Vencedor</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orcamentos.map((o) => (
            <tr key={o.id} data-vencedor={o.vencedor || undefined}>
              <th scope="row">
                <strong>
                  {o.fornecedor_nome} – {o.origem?.uf ?? ''}
                </strong>
                <small>{o.origem?.regime?.nome ?? 'Falta regime tributário'}</small>
              </th>
              <td>{formatarReais(o.valor_venda_unit)}</td>
              <td>{formatarReais(o.valor_comissao_unit)}</td>
              <td>{o.frete_nome}</td>
              <td>{formatarReais(o.valor_frete)}</td>
              <td>{formatarAliquota(o.aliquota_icms)}</td>
              <td>{formatarAliquota(o.aliquota_pis_cofins)}</td>
              <td className="orc-tributos">{formatarReais(o.valor_tributos)}</td>
              <td>{formatarReais(o.valor_venda_bruto)}</td>
              <td>{formatarReais(o.valor_comissao_bruto)}</td>
              <td className="orc-liquido" data-menor={menores.has(o.id) || undefined}>
                {formatarReais(o.valor_venda_liquido)}
              </td>
              <td>
                <Trofeu o={o} amostra={amostra} editavel={editavel} enviar={enviarVencedor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AbaCotacao({
  ficha,
  opcoesFicha,
  editavel,
}: {
  ficha: Ficha
  opcoesFicha: OpcoesFicha
  editavel: boolean
}) {
  const [novoItem, setNovoItem] = useState(false)
  const [orcarItem, setOrcarItem] = useState<string | null>(null)
  const [estadoVencedor, enviarVencedor] = useActionState(definirVencedor, {})
  const c = ficha.cotacao

  return (
    <div className="ficha-cotacao">
      <dl className="vendas-dados">
        <div>
          <dt>Cliente</dt>
          <dd>{c.cliente?.nome ?? '—'}</dd>
        </div>
        <div>
          <dt>Empresa</dt>
          <dd>{c.empresa?.nome ?? '—'}</dd>
        </div>
        <div>
          <dt>Data cotação</dt>
          <dd>{formatarData(c.criado_em)}</dd>
        </div>
        <div>
          <dt>Data Validade</dt>
          <dd className="vendas-data">{formatarDia(c.data_validade)}</dd>
        </div>
        <div>
          <dt>Vendedor</dt>
          <dd>{c.vendedor?.nome ?? '—'}</dd>
        </div>
      </dl>

      <Mensagem estado={estadoVencedor} />

      <div className="itens-topo">
        <h3>Carrinho ({ficha.itens.length})</h3>
        {editavel && !novoItem ? (
          <button type="button" className="botao-secundario" onClick={() => setNovoItem(true)} data-teste="novo-item">
            + Produto
          </button>
        ) : null}
      </div>
      {novoItem ? <FormItem ficha={ficha} opcoesFicha={opcoesFicha} aoTerminar={() => setNovoItem(false)} /> : null}

      {ficha.itens.length === 0 ? (
        <p className="vendas-vazio">Nenhum produto no carrinho ainda.</p>
      ) : (
        <ul className="itens" data-teste="lista-itens">
          {ficha.itens.map((it) => {
            const orcs = ficha.orcamentos.filter((o) => o.cotacao_item_id === it.id)
            const vencedor = orcs.find((o) => o.vencedor)
            const sub = [it.condicao?.nome, it.linha?.nome, it.medida].filter(Boolean).join(' - ')
            return (
              <li key={it.id} className="item">
                <div className="item-topo">
                  <span className="item-qtd" title="Quantidade">
                    {formatarQuantidade(it.qtd)}
                  </span>
                  <div className="item-nome">
                    <strong>{it.produto?.nome ?? '—'}</strong>
                    <small>{sub || '—'}</small>
                    <small>
                      Destino: {it.destino ? `${it.destino.nome_endereco} — ${it.destino.municipio ? `${it.destino.municipio}/` : ''}${it.destino.uf}` : '—'}
                    </small>
                  </div>
                  <span className="item-contador" title="Fornecedores orçados">
                    {orcs.length}
                  </span>
                  {vencedor ? <span className="item-vencedor">🏆 {vencedor.fornecedor_nome}</span> : null}
                  {editavel && orcarItem !== it.id ? (
                    <button type="button" className="botao-texto" onClick={() => setOrcarItem(it.id)} data-teste="novo-orcamento">
                      + Fornecedor
                    </button>
                  ) : null}
                </div>
                {orcarItem === it.id ? (
                  <FormOrcamento item={it} fretes={opcoesFicha.fretes} aoTerminar={() => setOrcarItem(null)} />
                ) : null}
                {orcs.length > 0 ? (
                  <TabelaOrcamentos
                    orcamentos={orcs}
                    amostra={c.amostra}
                    editavel={editavel}
                    enviarVencedor={enviarVencedor}
                  />
                ) : (
                  <p className="vendas-vazio">Nenhum fornecedor orçado para este produto.</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// --------------------------------------------------------------- arquivamento

function Arquivamento({ ficha, motivos }: { ficha: Ficha; motivos: Opcao[] }) {
  const [estadoArq, arquivar, arquivando] = useActionState(arquivarCotacao, {})
  const [estadoDes, desarquivar, desarquivando] = useActionState(desarquivarCotacao, {})
  const c = ficha.cotacao
  if (c.etapa_id !== ETAPA.COTACAO) return null
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
          <button type="submit" className="botao-alerta" disabled={arquivando} aria-busy={arquivando}>
            {arquivando ? 'Gravando…' : 'Arquivar'}
          </button>
        </form>
      )}
      <Mensagem estado={estadoArq.erro ? estadoArq : estadoDes} />
    </div>
  )
}

// ---------------------------------------------------------------------- a ficha

/**
 * Ficha da cotação: dados e carrinho (itens × orçamentos com os valores do banco e o
 * vencedor por item), propostas e pedidos com as entregas. Substitui os popups
 * `pop add edita cotacao`, `pop add edita propostas` e `pop add edita pedido` — spec
 * §2.6–2.9. Proposta, pedido e entregas moram em ./fluxo.tsx.
 */
export function FichaCotacao({
  ficha,
  abaInicial,
  opcoes,
  opcoesFicha,
  permissoes,
  aoFechar,
}: {
  ficha: Ficha
  abaInicial: Aba
  opcoes: Opcoes
  opcoesFicha: OpcoesFicha
  permissoes: Permissoes
  aoFechar: () => void
}) {
  const ref = useModal()
  const [aba, setAba] = useState<Aba>(abaInicial)
  const c = ficha.cotacao
  // Mesma regra das actions (cotacaoEditavel): arquivada só o Diretor; só na etapa Cotação.
  const editavel = c.etapa_id === ETAPA.COTACAO && (!c.arquivado || permissoes.ehDiretor)

  const abas: { id: Aba; rotulo: string }[] = [
    { id: 'cotacao', rotulo: `Cotação (${ficha.itens.length})` },
    { id: 'propostas', rotulo: `Propostas (${ficha.propostas.length})` },
    { id: 'pedidos', rotulo: `Pedidos (${ficha.pedidos.length})` },
  ]

  return (
    <dialog ref={ref} className="dialogo ficha-vendas" aria-labelledby="ficha-titulo" onClose={aoFechar} data-teste="ficha-cotacao">
      <header className="dialogo-cabecalho">
        <div>
          <p className="ficha-vendas-tipo">{editavel ? 'Edita Cotação' : 'Cotação'}</p>
          <h2 id="ficha-titulo">
            {c.cliente?.nome ?? '—'} <span className="ficha-vendas-num">Cotação núm. {c.numero}</span>
          </h2>
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
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          ✕
        </button>
      </header>

      <div className="abas" role="tablist" aria-label="Seções da cotação">
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

      <div className="dialogo-corpo" role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`}>
        {c.arquivado && !permissoes.ehDiretor ? (
          <p className="aviso vendas-aviso-topo">Cotação arquivada: só o Diretor altera. Desarquive para editar.</p>
        ) : null}
        {aba === 'cotacao' ? <AbaCotacao ficha={ficha} opcoesFicha={opcoesFicha} editavel={editavel} /> : null}
        {aba === 'propostas' ? (
          <AbaPropostas ficha={ficha} editavel={!c.arquivado || permissoes.ehDiretor} irParaPedidos={() => setAba('pedidos')} />
        ) : null}
        {aba === 'pedidos' ? <AbaPedidos ficha={ficha} etapas={opcoes.etapas} opcoesFicha={opcoesFicha} /> : null}
      </div>

      <footer className="dialogo-rodape">
        <Arquivamento ficha={ficha} motivos={opcoes.motivos} />
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Fechar
        </button>
      </footer>
    </dialog>
  )
}
