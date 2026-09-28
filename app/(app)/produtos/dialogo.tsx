'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { formatarData } from '@/lib/datas'

import {
  buscarFiliaisFornecedor,
  definirAtivoProduto,
  definirAtivoVersao,
  desligarFilial,
  ligarFilial,
  salvarProduto,
  salvarVersao,
} from './acoes'
import type { EstadoAcao, Ficha, FilialEncontrada, FilialLigada, Opcoes, Versao } from './tipos'

type Aba = 'dados' | 'versoes' | 'fornecedores'
type Acao = (form: FormData) => void

function BotaoEnviar({
  children,
  className = 'botao-primario',
}: {
  children: React.ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? 'Gravando…' : children}
    </button>
  )
}

function Mensagem({ estado }: { estado: EstadoAcao }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste="erro-ficha">
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

/** Filial ligada cujo grupo não é fornecedor — as 19 ligações herdadas (04-duvidas). */
function ehDeCliente(f: FilialLigada) {
  return f.endereco?.grupo?.tipo !== 'fornecedor'
}

// ----------------------------------------------------------------------- aba Dados

function FormularioProduto({
  ficha,
  opcoes,
  estado,
  enviar,
}: {
  ficha: Ficha | null
  opcoes: Opcoes
  estado: EstadoAcao
  enviar: Acao
}) {
  const p = ficha?.produto
  const [tipoId, setTipoId] = useState(p?.tipo_id ?? '')
  const grupos = opcoes.grupos.filter((g) => g.tipo_id === tipoId)
  const grupoInicial = p?.grupo_id && grupos.some((g) => g.id === p.grupo_id) ? p.grupo_id : ''
  const linhas = new Set(p?.linhas.map((l) => l.linha_id) ?? [])
  const condicoes = new Set(p?.condicoes.map((c) => c.condicao_id) ?? [])

  return (
    <form
      id="form-produto"
      className="pf-form"
      noValidate
      // onSubmit, e não action=: com action o React 19 limpa o formulário ao fim de toda
      // chamada, inclusive quando a validação devolve erro (mesmo motivo de /cadastros).
      onSubmit={(e) => {
        e.preventDefault()
        enviar(new FormData(e.currentTarget))
      }}
    >
      {p ? <input type="hidden" name="id" value={p.id} /> : null}

      <div className="pf-campos">
        <label className="campo pf-largo">
          <span>Nome do modelo</span>
          <input
            name="nome"
            defaultValue={p?.nome ?? ''}
            required
            minLength={2}
            maxLength={200}
            autoComplete="off"
            autoFocus={!p}
            data-teste="campo-nome"
          />
          <small className="pf-dica">Gravado em minúsculas, como no app atual.</small>
        </label>

        <label className="campo">
          <span>Tipo</span>
          <select
            name="tipo_id"
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            required
            data-teste="campo-tipo"
          >
            <option value="">Escolha…</option>
            {opcoes.tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Grupo</span>
          {/* key: trocar o tipo recria o select, e o grupo antigo (de outro tipo) sai. */}
          <select
            key={tipoId}
            name="grupo_id"
            defaultValue={grupoInicial}
            required
            disabled={!tipoId}
            data-teste="campo-grupo"
          >
            <option value="">{tipoId ? 'Escolha…' : 'Escolha o tipo antes'}</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="pf-marcas">
          <legend>Condição</legend>
          {opcoes.condicoes.map((c) => (
            <label key={c.id} className="caixa">
              <input type="checkbox" name="condicoes" value={c.id} defaultChecked={condicoes.has(c.id)} />
              {c.nome}
            </label>
          ))}
        </fieldset>

        <fieldset className="pf-marcas">
          <legend>Linha</legend>
          {opcoes.linhas.map((l) => (
            <label key={l.id} className="caixa">
              <input type="checkbox" name="linhas" value={l.id} defaultChecked={linhas.has(l.id)} />
              {l.nome}
            </label>
          ))}
        </fieldset>

        <label className="campo pf-largo">
          <span>Descrição</span>
          <textarea name="descricao" rows={5} maxLength={5000} defaultValue={p?.descricao ?? ''} />
        </label>
      </div>

      {p && !p.tipo_id ? (
        <p className="aviso">Este produto veio do app antigo sem tipo nem grupo. Escolha os dois para gravar.</p>
      ) : null}

      {estado.parecidos ? (
        <div className="aviso" role="alert" data-teste="aviso-parecido">
          <p className="pf-sem-margem">
            Já existe produto com este nome no mesmo grupo: <strong>{estado.parecidos.join(', ')}</strong>.
            Confira se não é o mesmo antes de gravar.
          </p>
          <label className="caixa">
            <input type="checkbox" name="confirmar_parecido" />
            Não é o mesmo — gravar assim mesmo
          </label>
        </div>
      ) : null}
      <Mensagem estado={estado} />

      <p className="pf-nota">Fotos do produto ainda não são editadas aqui.</p>

      {p ? (
        <dl className="pf-rastro">
          <div>
            <dt>Criado em</dt>
            <dd>
              {formatarData(p.criado_em)}
              {p.autor ? ` por ${p.autor.nome}` : ''}
            </dd>
          </div>
          {p.alterado_em ? (
            <div>
              <dt>Alterado em</dt>
              <dd>
                {formatarData(p.alterado_em)}
                {p.editor ? ` por ${p.editor.nome}` : ''}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </form>
  )
}

// --------------------------------------------------------------------- aba Versões

function LinhaVersao({ versao, produtoId }: { versao: Versao; produtoId: string }) {
  const [estado, renomear, renomeando] = useActionState(salvarVersao, {})
  const [estadoAtivo, alternar] = useActionState(definirAtivoVersao, {})

  return (
    <li className="pf-item" data-inativo={!versao.ativo || undefined}>
      <form
        className="pf-versao"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          startTransition(() => renomear(form))
        }}
      >
        <input type="hidden" name="id" value={versao.id} />
        <input type="hidden" name="produto_id" value={produtoId} />
        <label className="campo">
          <span className="so-leitor">Nome da versão</span>
          <input name="nome" defaultValue={versao.nome} maxLength={120} autoComplete="off" />
        </label>
        <button
          type="submit"
          className="botao-secundario"
          disabled={renomeando}
          aria-busy={renomeando}
        >
          {renomeando ? 'Gravando…' : 'Renomear'}
        </button>
      </form>
      <form action={alternar} className="pf-versao-ativo">
        <input type="hidden" name="id" value={versao.id} />
        <input type="hidden" name="ativo" value={versao.ativo ? 'false' : 'true'} />
        <span className="selo" data-tom={versao.ativo ? 'ok' : 'erro'}>
          {versao.ativo ? 'Ativa' : 'Inativa'}
        </span>
        <BotaoEnviar className="botao-texto">{versao.ativo ? 'Desativar' : 'Reativar'}</BotaoEnviar>
      </form>
      <Mensagem estado={estado} />
      <Mensagem estado={estadoAtivo} />
    </li>
  )
}

function AbaVersoes({ ficha }: { ficha: Ficha }) {
  const [estado, incluir] = useActionState(salvarVersao, {})
  const produtoId = ficha.produto.id

  return (
    <div className="pf-secao">
      {/* action= aqui de propósito: o React limpa o campo depois de incluir. */}
      <form action={incluir} className="pf-versao pf-nova" noValidate>
        <input type="hidden" name="produto_id" value={produtoId} />
        <label className="campo">
          <span>Nova versão (medida, acabamento)</span>
          <input name="nome" maxLength={120} autoComplete="off" placeholder="Ex.: 1000 mm x 1200 mm" data-teste="nova-versao" />
        </label>
        <BotaoEnviar className="botao-primario">Incluir</BotaoEnviar>
      </form>
      <Mensagem estado={estado} />

      {ficha.versoes.length === 0 ? (
        <p className="pf-vazio">Nenhuma versão cadastrada.</p>
      ) : (
        <ul className="pf-itens" data-teste="lista-versoes">
          {ficha.versoes.map((v) => (
            <LinhaVersao key={v.id} versao={v} produtoId={produtoId} />
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- aba Fornecedores

function BuscaFilial({ produtoId, ligadas, ligar }: { produtoId: string; ligadas: Set<string>; ligar: Acao }) {
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState<FilialEncontrada[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [buscando, setBuscando] = useState(false)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pedido = useRef(0)

  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    if (valor.trim().length < 2) {
      setResultado(null)
      setErro(null)
      return
    }
    espera.current = setTimeout(async () => {
      // Resposta velha não pode sobrescrever a nova: só vale a do último pedido.
      const meu = ++pedido.current
      setBuscando(true)
      const r = await buscarFiliaisFornecedor(valor)
      if (meu !== pedido.current) return
      setBuscando(false)
      if ('erro' in r) {
        setErro(r.erro)
        setResultado(null)
      } else {
        setErro(null)
        setResultado(r.filiais)
      }
    }, 350)
  }

  return (
    <div className="pf-busca">
      <label className="campo">
        <span>Ligar filial de fornecedor</span>
        <input
          type="search"
          value={texto}
          onChange={(e) => digitar(e.target.value)}
          placeholder="Nome do fornecedor ou CNPJ"
          spellCheck={false}
          autoComplete="off"
          data-teste="busca-filial"
        />
      </label>
      {buscando ? <p className="pf-vazio">Buscando…</p> : null}
      {erro ? (
        <p className="aviso" data-tom="erro">
          {erro}
        </p>
      ) : null}
      {!buscando && resultado && resultado.length === 0 ? (
        <p className="pf-vazio">Nenhuma filial ativa de fornecedor com esse nome.</p>
      ) : null}
      {!buscando && resultado && resultado.length > 0 ? (
        <ul className="pf-resultados" data-teste="resultado-filiais">
          {resultado.map((f) => {
            const ja = ligadas.has(f.id)
            return (
              <li key={f.id}>
                <span className="pf-filial">
                  <strong>{f.grupo_nome}</strong>
                  <small>
                    {f.nome_endereco} · {f.municipio ? `${f.municipio}/` : ''}
                    {f.uf}
                  </small>
                </span>
                {ja ? (
                  <span className="selo">Já ligada</span>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      ligar(new FormData(e.currentTarget))
                    }}
                  >
                    <input type="hidden" name="produto_id" value={produtoId} />
                    <input type="hidden" name="endereco_id" value={f.id} />
                    <button type="submit" className="botao-secundario">
                      Ligar
                    </button>
                  </form>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function AbaFornecedores({ ficha }: { ficha: Ficha }) {
  const [estadoLigar, ligar] = useActionState(ligarFilial, {})
  const [estadoDesligar, desligar] = useActionState(desligarFilial, {})
  const produtoId = ficha.produto.id
  const ligadas = new Set(ficha.filiais.map((f) => f.endereco_fornecedor_id))
  // Mostra a mensagem da última ação que respondeu.
  const [ultima, setUltima] = useState<'ligar' | 'desligar' | null>(null)

  return (
    <div className="pf-secao">
      <BuscaFilial
        produtoId={produtoId}
        ligadas={ligadas}
        ligar={(form) => {
          setUltima('ligar')
          startTransition(() => ligar(form))
        }}
      />
      <Mensagem estado={ultima === 'ligar' ? estadoLigar : ultima === 'desligar' ? estadoDesligar : {}} />

      {ficha.filiais.length === 0 ? (
        <p className="pf-vazio">
          Nenhuma filial atende este produto ainda. Sem fornecedor, ele não entra em orçamento.
        </p>
      ) : (
        <ul className="pf-itens" data-teste="lista-filiais">
          {ficha.filiais.map((f) => {
            const e = f.endereco
            const cliente = ehDeCliente(f)
            return (
              <li
                key={f.endereco_fornecedor_id}
                className="pf-item pf-filial-ligada"
                data-inativo={(e && (!e.ativo || !e.grupo?.ativo)) || undefined}
              >
                <span className="pf-filial">
                  <strong>{e?.grupo?.nome ?? 'Cadastro removido'}</strong>
                  <small>
                    {e ? `${e.nome_endereco} · ${e.municipio ? `${e.municipio}/` : ''}${e.uf}` : '—'}
                  </small>
                  <span className="pf-selos">
                    {cliente ? (
                      <span className="selo" data-tom="alerta">
                        Filial de cliente
                      </span>
                    ) : null}
                    {e && !e.ativo ? (
                      <span className="selo" data-tom="erro">
                        Filial inativa
                      </span>
                    ) : null}
                    {e?.grupo && !e.grupo.ativo ? (
                      <span className="selo" data-tom="erro">
                        Fornecedor inativo
                      </span>
                    ) : null}
                    {e && !e.liberado ? (
                      <span className="selo" data-tom="erro">
                        Bloqueada
                      </span>
                    ) : null}
                  </span>
                  {cliente ? (
                    <small className="pf-motivo">
                      Ligação herdada do app antigo: só filial de fornecedor deveria atender produto.
                      Confira com o Comercial e desligue se estiver errada.
                    </small>
                  ) : null}
                </span>
                <form
                  onSubmit={(ev) => {
                    ev.preventDefault()
                    const nome = e?.grupo?.nome ?? 'esta filial'
                    if (!window.confirm(`Desligar ${nome} deste produto?`)) return
                    const form = new FormData(ev.currentTarget)
                    setUltima('desligar')
                    startTransition(() => desligar(form))
                  }}
                >
                  <input type="hidden" name="produto_id" value={produtoId} />
                  <input type="hidden" name="endereco_id" value={f.endereco_fornecedor_id} />
                  <button type="submit" className="botao-perigo">
                    Desligar
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------- o diálogo

/**
 * Ficha do produto: dados, versões e filiais fornecedoras.
 *
 * Substitui o `pop.CadastroProdutos` (bTgZS). Diferença deliberada: no Bubble dá para
 * juntar fornecedores ANTES de gravar um produto novo (custom state
 * `var_quaisfornecedores_`, WF bTgdm/bTgeE). Aqui o produto nasce primeiro e a ficha abre
 * nele em seguida — as abas de versões e fornecedores aparecem então. Um caminho só de
 * gravação no lugar de dois workflows por botão (spec §8.2).
 */
export function FichaProduto({
  ficha,
  opcoes,
  aoCriar,
  aoFechar,
}: {
  ficha: Ficha | null
  opcoes: Opcoes
  aoCriar: (id: string) => void
  aoFechar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [aba, setAba] = useState<Aba>('dados')
  const [estado, salvar, salvando] = useActionState(salvarProduto, {})
  const [estadoAtivo, acaoAtivo] = useActionState(definirAtivoProduto, {})

  const criou = !ficha && estado.id ? estado.id : null
  useEffect(() => {
    if (criou) aoCriar(criou)
    // aoCriar muda de identidade a cada render do pai; o gatilho é só o id novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criou])

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  const p = ficha?.produto ?? null
  const deCliente = ficha ? ficha.filiais.filter(ehDeCliente).length : 0

  const abas: { id: Aba; rotulo: string }[] = ficha
    ? [
        { id: 'dados', rotulo: 'Dados' },
        { id: 'versoes', rotulo: `Versões (${ficha.versoes.length})` },
        { id: 'fornecedores', rotulo: `Fornecedores (${ficha.filiais.length})` },
      ]
    : []

  return (
    <dialog
      ref={ref}
      className="dialogo pf"
      aria-labelledby="pf-titulo"
      onClose={aoFechar}
      data-teste="ficha-produto"
    >
      <header className="dialogo-cabecalho">
        <div>
          <p className="pf-tipo">{p ? 'Edita produto' : 'Novo produto'}</p>
          <h2 id="pf-titulo">{p ? p.nome : 'Novo produto'}</h2>
          {p ? (
            <p className="pf-selos">
              <span className="selo" data-tom={p.ativo ? 'ok' : 'erro'}>
                {p.ativo ? 'Ativo' : 'Inativo'}
              </span>
              {ficha && ficha.filiais.length === 0 ? (
                <span className="selo" data-tom="alerta">
                  Sem fornecedor
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          ✕
        </button>
      </header>

      {abas.length > 0 ? (
        <div className="abas" role="tablist" aria-label="Seções da ficha">
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
              {a.id === 'fornecedores' && deCliente > 0 ? (
                <span className="pf-alerta" aria-label="com filial de cliente">
                  {' '}
                  ⚠
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="dialogo-corpo"
        role={abas.length > 0 ? 'tabpanel' : undefined}
        id={`painel-${aba}`}
        aria-labelledby={abas.length > 0 ? `aba-${aba}` : undefined}
      >
        {deCliente > 0 && aba !== 'fornecedores' ? (
          <p className="aviso pf-aviso-topo" data-teste="aviso-filial-cliente">
            {deCliente === 1 ? '1 filial ligada é' : `${deCliente} filiais ligadas são`} de cliente, não de
            fornecedor.{' '}
            <button type="button" className="pf-link" onClick={() => setAba('fornecedores')}>
              Ver fornecedores
            </button>
          </p>
        ) : null}

        {/* hidden em vez de desmontar: trocar de aba não perde o que foi digitado. */}
        <div hidden={aba !== 'dados'}>
          <FormularioProduto
            ficha={ficha}
            opcoes={opcoes}
            estado={estado}
            enviar={(form) => startTransition(() => salvar(form))}
          />
        </div>
        {ficha && aba === 'versoes' ? <AbaVersoes ficha={ficha} /> : null}
        {ficha && aba === 'fornecedores' ? <AbaFornecedores ficha={ficha} /> : null}

        <Mensagem estado={estadoAtivo} />
      </div>

      <footer className="dialogo-rodape">
        {p ? (
          <form
            action={acaoAtivo}
            onSubmit={(e) => {
              const msg = p.ativo
                ? `Desativar "${p.nome}"? Ele não é apagado e pode ser reativado.`
                : `Reativar "${p.nome}"?`
              if (!window.confirm(msg)) e.preventDefault()
            }}
          >
            <input type="hidden" name="id" value={p.id} />
            <input type="hidden" name="ativo" value={p.ativo ? 'false' : 'true'} />
            <BotaoEnviar className={p.ativo ? 'botao-perigo' : 'botao-secundario'}>
              {p.ativo ? 'Desativar' : 'Reativar'}
            </BotaoEnviar>
          </form>
        ) : null}
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Fechar
        </button>
        {aba === 'dados' ? (
          <button
            type="submit"
            form="form-produto"
            className="botao-primario"
            disabled={salvando}
            aria-busy={salvando}
            data-teste="gravar-produto"
          >
            {salvando ? 'Gravando…' : p ? 'Gravar' : 'Cadastrar'}
          </button>
        ) : null}
      </footer>
    </dialog>
  )
}
