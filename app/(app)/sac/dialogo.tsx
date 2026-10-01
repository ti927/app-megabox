'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { X } from 'lucide-react'

import { useActionStateComAviso } from '@/componentes/aviso-acao'
import { Icone } from '@/componentes/icone'
import { formatarData } from '@/lib/datas'
import { SITUACOES, TIPOS_ACAO, type TipoAcao } from '@/lib/sac-apoio'
import {
  camposEditaveis,
  formatarDataHora,
  formatarDuracao,
  podeExcluir,
  rotuloEntrega,
  STATUS_EM_ABERTO,
} from '@/lib/sac'

import {
  buscarClifor,
  buscarPedidos,
  carregarDependencias,
  criarPesquisa,
  criarProtocolo,
  excluirProtocolo,
  registrarInteracao,
  restaurarProtocolo,
  salvarProtocolo,
} from './acoes'
import { emitirAvaliacao, salvarAcompanhamento } from './acoes-apoio'
import type {
  CliforEncontrado,
  Entrega,
  EstadoAcao,
  Ficha,
  Filial,
  ItemLista,
  Opcoes,
  PedidoEncontrado,
} from './tipos'

type UsuarioTela = { id: string; ehDiretor: boolean; ehGestor?: boolean }

// ------------------------------------------------------------------------- peças

export function BotaoEnviar({
  children,
  className = 'botao-primario',
  teste,
}: {
  children: React.ReactNode
  className?: string
  teste?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending} data-teste={teste}>
      {pending ? 'Gravando…' : children}
    </button>
  )
}

export function Mensagem({ estado, teste }: { estado: EstadoAcao; teste?: string }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste={teste ?? 'erro-sac'}>
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

/** Selo colorido de prioridade (Alta vermelho, Média laranja, Baixa azul — sac.md §3.1). */
export function SeloPrioridade({ id, opcoes }: { id: number; opcoes: ItemLista[] }) {
  return (
    <span className="selo sac-prioridade" data-prioridade={id}>
      {opcoes.find((o) => o.id === id)?.nome ?? '—'}
    </span>
  )
}

/** Selo de status: os quatro de `opt.StatusChamado` com cor própria (§3.1). */
export function SeloStatus({ id, opcoes }: { id: number; opcoes: ItemLista[] }) {
  return (
    <span className="selo sac-status" data-status={id}>
      {opcoes.find((o) => o.id === id)?.nome ?? '—'}
    </span>
  )
}

function Select({
  nome,
  rotulo,
  opcoes,
  valor,
  desabilitado,
  vazio,
  teste,
}: {
  nome: string
  rotulo: string
  opcoes: { id: number | string; nome: string }[]
  valor: number | string | null
  desabilitado?: boolean
  vazio?: string
  teste?: string
}) {
  return (
    <label className="campo">
      <span>{rotulo}</span>
      <select name={desabilitado ? undefined : nome} defaultValue={valor ?? ''} disabled={desabilitado} data-teste={teste}>
        {vazio !== undefined ? <option value="">{vazio}</option> : null}
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
      {/* Campo desabilitado não vai no FormData: o valor atual segue escondido, e o servidor
          ignora o que não é da alçada de quem grava (recortarParaResponsavel). */}
      {desabilitado && valor !== null ? <input type="hidden" name={nome} value={valor} /> : null}
    </label>
  )
}

/**
 * Autocomplete no servidor: debounce, e só vale a resposta do último pedido (a velha não
 * sobrescreve a nova). Mesmo desenho da busca de filial em /produtos.
 */
function Autocomplete<T extends { id: string }>({
  rotulo,
  placeholder,
  buscar,
  render,
  aoEscolher,
  minimo = 2,
  teste,
}: {
  rotulo: string
  placeholder: string
  buscar: (termo: string) => Promise<{ itens: T[] } | { erro: string }>
  render: (item: T) => React.ReactNode
  aoEscolher: (item: T) => void
  minimo?: number
  teste?: string
}) {
  const [texto, setTexto] = useState('')
  const [itens, setItens] = useState<T[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [buscando, setBuscando] = useState(false)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pedido = useRef(0)

  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    if (valor.trim().length < minimo) {
      pedido.current++
      setItens(null)
      setErro(null)
      setBuscando(false)
      return
    }
    espera.current = setTimeout(async () => {
      const meu = ++pedido.current
      setBuscando(true)
      const r = await buscar(valor)
      if (meu !== pedido.current) return
      setBuscando(false)
      if ('erro' in r) {
        setErro(r.erro)
        setItens(null)
      } else {
        setErro(null)
        setItens(r.itens)
      }
    }, 350)
  }

  return (
    <div className="sf-busca">
      <label className="campo">
        <span>{rotulo}</span>
        <input
          type="search"
          value={texto}
          onChange={(e) => digitar(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          data-teste={teste}
        />
      </label>
      {buscando ? <p className="sf-vazio">Buscando…</p> : null}
      {erro ? (
        <p className="aviso" data-tom="erro">
          {erro}
        </p>
      ) : null}
      {!buscando && itens && itens.length === 0 ? <p className="sf-vazio">Nada encontrado.</p> : null}
      {!buscando && itens && itens.length > 0 ? (
        <ul className="sf-resultados" data-teste={teste ? `${teste}-resultados` : undefined}>
          {itens.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => {
                  aoEscolher(i)
                  pedido.current++
                  setTexto('')
                  setItens(null)
                }}
              >
                {render(i)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ListaEntregas({
  entregas,
  marcadas,
  editavel,
}: {
  entregas: Entrega[]
  marcadas: Set<string>
  editavel: boolean
}) {
  if (entregas.length === 0) {
    return <p className="sf-vazio">Nenhuma entrega neste pedido (ou sem acesso às entregas de vendas).</p>
  }
  return (
    <fieldset className="sf-marcas">
      <legend>Quais entregas</legend>
      {entregas.map((e) => (
        <label key={e.id} className="caixa">
          <input
            type="checkbox"
            name={editavel ? 'entregas' : undefined}
            value={e.id}
            defaultChecked={marcadas.has(e.id)}
            disabled={!editavel}
          />
          {rotuloEntrega(e)}
        </label>
      ))}
    </fieldset>
  )
}

function useDialogo() {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  return ref
}

// ------------------------------------------------------------------ ficha existente

/**
 * Ficha do protocolo — `Pop Novo Chamado` (bUCqT) aberto por "Detalhes" (WF bUDMn0), com as
 * abas internas "Protocolo" (WF bUDud) e "Histórico" (WF bUDuJ), aqui "Interações".
 */
export function FichaProtocolo({
  ficha,
  opcoes,
  usuario,
  aoFechar,
}: {
  ficha: Ficha
  opcoes: Opcoes
  usuario: UsuarioTela
  aoFechar: () => void
}) {
  const ref = useDialogo()
  const [aba, setAba] = useState<'protocolo' | 'interacoes'>('protocolo')
  const [excluindo, setExcluindo] = useState(false)
  const [estado, salvar, salvando] = useActionStateComAviso(salvarProtocolo, 'Salvando chamado…')
  const [estadoExcluir, excluir] = useActionStateComAviso(excluirProtocolo, 'Excluindo chamado…')
  const [estadoRestaurar, restaurar] = useActionStateComAviso(restaurarProtocolo, 'Restaurando chamado…')

  const p = ficha.protocolo
  // Excluiu ou restaurou: fecha o formulário do motivo (o estado do protocolo mudou).
  useEffect(() => {
    setExcluindo(false)
  }, [p.excluido_em])
  const pode = camposEditaveis(usuario, p)
  const tudo = pode === 'todos'
  const parcial = pode === 'status_descricao'
  const diretoria = podeExcluir(usuario)
  const marcadas = new Set(ficha.entregas.map((e) => e.id))
  const filialAtual = ficha.filiais.find((f) => f.id === p.filial_id)

  // Responsável inativo some do combo de ativos; mantém-se a opção atual para não trocar calado.
  const usuarios =
    p.responsavel_id && !opcoes.usuarios.some((u) => u.id === p.responsavel_id)
      ? [{ id: p.responsavel_id, nome: '(usuário inativo)' }, ...opcoes.usuarios]
      : opcoes.usuarios

  return (
    <dialog ref={ref} className="dialogo sf" aria-labelledby="sf-titulo" onClose={aoFechar} data-teste="ficha-protocolo">
      <header className="dialogo-cabecalho">
        <div>
          <p className="sf-tipo">Protocolo SAC</p>
          <h2 id="sf-titulo">
            Nº {p.numero} · {p.cliente?.nome ?? 'cliente sem acesso'}
          </h2>
          <p className="sf-selos">
            <SeloStatus id={p.status_id} opcoes={opcoes.status} />
            <SeloPrioridade id={p.prioridade_id} opcoes={opcoes.prioridades} />
            {ficha.acompanhamento?.parado ? (
              <span className="selo" data-tom="erro" data-teste="ficha-parado">
                Parado há {ficha.acompanhamento.dias_sem_acao} dias
              </span>
            ) : null}
            {p.excluido_em ? (
              <span className="selo" data-tom="erro">
                Excluído
              </span>
            ) : null}
          </p>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>

      <div className="abas" role="tablist" aria-label="Seções do protocolo">
        {(
          [
            ['protocolo', 'Protocolo'],
            ['interacoes', `Interações (${ficha.interacoes.length})`],
          ] as const
        ).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`sf-aba-${id}`}
            aria-selected={aba === id}
            aria-controls={`sf-painel-${id}`}
            onClick={() => setAba(id)}
            data-teste={`aba-${id}`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <div className="dialogo-corpo" role="tabpanel" id={`sf-painel-${aba}`} aria-labelledby={`sf-aba-${aba}`}>
        {p.excluido_em ? (
          <p className="aviso sf-aviso-topo" data-tom="erro">
            Excluído em {formatarDataHora(p.excluido_em)}
            {p.excluidor ? ` por ${p.excluidor.nome}` : ''}. Motivo: {p.excluido_motivo}
          </p>
        ) : null}
        {pode === 'nenhum' && !p.excluido_em ? (
          <p className="aviso sf-aviso-topo">Só a Diretoria ou o responsável alteram este protocolo. Você pode registrar interações.</p>
        ) : null}
        {parcial ? (
          <p className="aviso sf-aviso-topo">Como responsável, você altera o status e a descrição. O resto é com a Diretoria.</p>
        ) : null}

        <div hidden={aba !== 'protocolo'}>
          <form
            id="form-protocolo"
            className="sf-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              const form = new FormData(e.currentTarget)
              startTransition(() => salvar(form))
            }}
          >
            <input type="hidden" name="id" value={p.id} />
            <section className="sf-secao" aria-labelledby="sf-situacao">
              <h3 id="sf-situacao">Situação</h3>
              <div className="sf-campos sf-tres">
                <Select nome="tipo_ocorrencia_id" rotulo="Tipo de ocorrência" opcoes={opcoes.tipos} valor={p.tipo_ocorrencia_id} desabilitado={!tudo} />
                <Select nome="prioridade_id" rotulo="Prioridade" opcoes={opcoes.prioridades} valor={p.prioridade_id} desabilitado={!tudo} />
                <Select nome="status_id" rotulo="Status" opcoes={opcoes.status} valor={p.status_id} desabilitado={!tudo && !parcial} teste="campo-status" />
              </div>
            </section>

            <section className="sf-secao" aria-labelledby="sf-identificacao">
              <h3 id="sf-identificacao">Identificação</h3>
              <dl className="sf-dados">
                <div>
                  <dt>{p.cliente?.tipo === 'fornecedor' ? 'Fornecedor' : 'Cliente'}</dt>
                  <dd>{p.cliente?.nome ?? '—'}</dd>
                </div>
                <div>
                  <dt>Pedido</dt>
                  <dd>{p.pedido ? `Nº ${p.pedido.numero}` : p.pedido_id ? 'sem acesso ao pedido' : '—'}</dd>
                </div>
              </dl>
              <div className="sf-campos">
                {tudo ? (
                  <Select
                    nome="filial_id"
                    rotulo="Qual filial"
                    opcoes={ficha.filiais.map((f) => ({ id: f.id, nome: rotuloFilial(f) }))}
                    valor={p.filial_id}
                    vazio="Nenhuma"
                  />
                ) : (
                  <label className="campo">
                    <span>Qual filial</span>
                    <input readOnly value={filialAtual ? rotuloFilial(filialAtual) : '—'} />
                    {p.filial_id ? <input type="hidden" name="filial_id" value={p.filial_id} /> : null}
                  </label>
                )}
              </div>
              {p.pedido_id ? (
                <ListaEntregas
                  entregas={mesclarEntregas(ficha.entregasPedido, ficha.entregas)}
                  marcadas={marcadas}
                  editavel={tudo}
                />
              ) : null}
              {!tudo ? ficha.entregas.map((e) => <input key={e.id} type="hidden" name="entregas" value={e.id} />) : null}
            </section>

            <section className="sf-secao" aria-labelledby="sf-dados">
              <h3 id="sf-dados">Dados</h3>
              <div className="sf-campos">
                <Select
                  nome="responsavel_id"
                  rotulo="Responsável"
                  opcoes={usuarios}
                  valor={p.responsavel_id}
                  vazio="Sem responsável"
                  desabilitado={!tudo}
                />
              </div>
              <label className="campo">
                <span>Descrição detalhada</span>
                <textarea
                  name="descricao"
                  rows={5}
                  maxLength={10000}
                  defaultValue={p.descricao}
                  readOnly={!tudo && !parcial}
                  data-teste="campo-descricao"
                />
              </label>
              <p className="sf-nota">Anexos do chamado ainda não são enviados por aqui.</p>
            </section>

            <Mensagem estado={estado} />

            <dl className="sf-rastro">
              <div>
                <dt>Aberto em</dt>
                <dd>
                  {formatarDataHora(p.aberto_em)}
                  {p.autor ? ` por ${p.autor.nome}` : ''}
                </dd>
              </div>
              <div>
                <dt>Resolvido em</dt>
                <dd>{formatarDataHora(p.fechado_em)}</dd>
              </div>
              <div>
                <dt>Tempo de resolução</dt>
                <dd>{formatarDuracao(p.tempo_resolucao)}</dd>
              </div>
              {p.alterado_em ? (
                <div>
                  <dt>Alterado em</dt>
                  <dd>
                    {formatarDataHora(p.alterado_em)}
                    {p.editor ? ` por ${p.editor.nome}` : ''}
                  </dd>
                </div>
              ) : null}
            </dl>
          </form>

          <Acompanhamento ficha={ficha} usuario={usuario} editavel={pode !== 'nenhum'} />

          {excluindo && diretoria && !p.excluido_em ? (
            <form action={excluir} className="sf-excluir" data-teste="form-excluir">
              <input type="hidden" name="id" value={p.id} />
              <label className="campo">
                <span>Motivo da exclusão</span>
                <input name="motivo" maxLength={500} required autoFocus data-teste="motivo-exclusao" />
              </label>
              <div className="sf-linha-botoes">
                <button type="button" className="botao-texto" onClick={() => setExcluindo(false)}>
                  Desistir
                </button>
                <BotaoEnviar className="botao-perigo" teste="confirmar-exclusao">
                  Excluir protocolo
                </BotaoEnviar>
              </div>
            </form>
          ) : null}
          {/* Só a mensagem que combina com o estado atual: depois de restaurar, o "excluído" some. */}
          <Mensagem estado={p.excluido_em ? estadoExcluir : estadoRestaurar} />
        </div>

        {aba === 'interacoes' ? <AbaInteracoes ficha={ficha} /> : null}
      </div>

      <footer className="dialogo-rodape">
        {diretoria && !p.excluido_em && !excluindo ? (
          <button type="button" className="botao-perigo" onClick={() => { setAba('protocolo'); setExcluindo(true) }} data-teste="excluir-protocolo">
            Excluir
          </button>
        ) : null}
        {diretoria && p.excluido_em ? (
          <form
            action={restaurar}
            onSubmit={(e) => {
              if (!window.confirm(`Desfazer a exclusão do protocolo nº ${p.numero}?`)) e.preventDefault()
            }}
          >
            <input type="hidden" name="id" value={p.id} />
            <BotaoEnviar className="botao-secundario" teste="restaurar-protocolo">
              Desfazer exclusão
            </BotaoEnviar>
          </form>
        ) : null}
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Fechar
        </button>
        {aba === 'protocolo' && pode !== 'nenhum' ? (
          <button
            type="submit"
            form="form-protocolo"
            className="botao-primario"
            disabled={salvando}
            aria-busy={salvando}
            data-teste="gravar-protocolo"
          >
            {salvando ? 'Gravando…' : 'Salvar'}
          </button>
        ) : null}
      </footer>
    </dialog>
  )
}

/**
 * Acompanhamento do chamado (db/030): a foto de agora (prazo efetivo, última ação, cliente
 * informado, fornecedor cobrado, situação), os campos que tornam um atraso "acompanhado"
 * (prazo, depende do fornecedor, motivo da pendência) e a avaliação do atendimento.
 */
function Acompanhamento({ ficha, usuario, editavel }: { ficha: Ficha; usuario: UsuarioTela; editavel: boolean }) {
  const [estado, salvar] = useActionStateComAviso(salvarAcompanhamento, 'Salvando acompanhamento…')
  const p = ficha.protocolo
  const a = ficha.acompanhamento
  const prazoTravado = Boolean(p.prazo_em) && !usuario.ehGestor
  const ativo = editavel && !p.excluido_em
  return (
    <section className="sf-secao sf-acompanhamento" aria-labelledby="sf-acomp" data-teste="acompanhamento">
      <h3 id="sf-acomp">Acompanhamento</h3>
      {a ? (
        <dl className="sf-dados sf-acomp-dados">
          <div>
            <dt>Situação</dt>
            <dd>
              <span className="selo" data-tom={SITUACOES[a.situacao].tom}>
                {SITUACOES[a.situacao].rotulo}
              </span>
            </dd>
          </div>
          <div>
            <dt>Prazo</dt>
            <dd>
              {formatarData(a.prazo)}
              {a.prazo_definido ? '' : ' (padrão)'}
            </dd>
          </div>
          <div>
            <dt>Última ação</dt>
            <dd>
              {a.acoes === 0 ? 'nenhuma (abertura)' : formatarDataHora(a.ultima_acao_em)}
              {a.fechado_em ? '' : ` · há ${a.dias_sem_acao} dia(s), limite ${a.dias_limite}`}
            </dd>
          </div>
          <div>
            <dt>Cliente informado</dt>
            <dd>{a.cliente_informado ? 'Sim' : 'Ainda não'}</dd>
          </div>
          {a.aplica_fornecedor ? (
            <div>
              <dt>Fornecedor cobrado</dt>
              <dd>{a.fornecedor_cobrado ? 'Sim' : 'Ainda não'}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {ativo ? (
        <form action={salvar} className="sf-form" data-teste="form-acompanhamento">
          <input type="hidden" name="id" value={p.id} />
          <div className="sf-campos">
            <label className="campo">
              <span>Prazo de solução{prazoTravado ? ' (só a gerência altera)' : ''}</span>
              <input type="date" name="prazo_em" defaultValue={p.prazo_em ?? ''} readOnly={prazoTravado} data-teste="campo-prazo" />
            </label>
            <label className="caixa sf-caixa-campo">
              <input type="checkbox" name="depende_fornecedor" defaultChecked={p.depende_fornecedor} />
              A solução depende do fornecedor
            </label>
          </div>
          <label className="campo">
            <span>Motivo da pendência (por que ainda não foi resolvido)</span>
            <textarea name="motivo_pendencia" rows={2} maxLength={2000} defaultValue={p.motivo_pendencia ?? ''} data-teste="campo-motivo" />
          </label>
          <div className="sf-linha-botoes">
            <p className="sf-nota">
              Atraso com motivo, cliente informado e fornecedor cobrado (se depender dele) conta como acompanhado. Registre os
              contatos na aba Interações, com o tipo da ação.
            </p>
            <BotaoEnviar className="botao-secundario empurra" teste="gravar-acompanhamento">
              Gravar acompanhamento
            </BotaoEnviar>
          </div>
          <Mensagem estado={estado} />
        </form>
      ) : null}
      {p.fechado_em && p.cliente?.tipo === 'cliente' && !p.excluido_em ? <Avaliacao ficha={ficha} /> : null}
    </section>
  )
}

/** Avaliação do atendimento (030 D8): convite tipo SAC ligado ao protocolo, link para copiar. */
function Avaliacao({ ficha }: { ficha: Ficha }) {
  const [estado, emitir] = useActionStateComAviso(emitirAvaliacao, 'Gerando link de avaliação…')
  const [link, setLink] = useState<string | null>(null)
  useEffect(() => {
    if (estado.link) setLink(estado.link)
  }, [estado])
  const av = ficha.avaliacao
  const comEmail = ficha.contatos.filter((c) => c.email)
  const url = link && typeof window !== 'undefined' ? `${window.location.origin}${link}` : link
  return (
    <div className="sf-avaliacao" data-teste="avaliacao-atendimento">
      <p className="sf-nota">
        <strong>Avaliação do atendimento: </strong>
        {av?.usado_em
          ? `respondida em ${formatarData(av.usado_em)}${av.nota !== null ? `, nota ${av.nota}` : ''}.`
          : av?.enviado_em
            ? `link emitido em ${formatarDataHora(av.enviado_em)}, ainda sem resposta.`
            : 'ainda não pedida.'}
      </p>
      {av?.usado_em ? null : (
        <form action={emitir} className="sf-linha-botoes">
          <input type="hidden" name="protocolo_id" value={ficha.protocolo.id} />
          <label className="campo sf-contato">
            <span className="so-leitor">Contato que recebe</span>
            <select name="contato_id" defaultValue={comEmail[0]?.id ?? ''}>
              <option value="">Sem contato</option>
              {comEmail.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.email})
                </option>
              ))}
            </select>
          </label>
          <BotaoEnviar className="botao-secundario" teste="emitir-avaliacao">
            {av?.enviado_em ? 'Emitir novo link' : 'Pedir avaliação'}
          </BotaoEnviar>
        </form>
      )}
      {url ? (
        <label className="campo">
          <span>Link da avaliação: copie agora, ele não aparece de novo</span>
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} data-teste="link-avaliacao" />
        </label>
      ) : null}
      {estado.erro ? <Mensagem estado={{ erro: estado.erro }} /> : null}
    </div>
  )
}

function rotuloFilial(f: Filial) {
  // "NOME / CNPJ", como `dd qualfilial` (bUDLM0).
  return `${f.nome_endereco}${f.documento ? ` / ${f.documento}` : ''} · ${f.uf}${f.ativo ? '' : ' (inativa)'}`
}

/** Entregas do pedido + as ligadas que não vieram (sem leitura), sem repetir. */
function mesclarEntregas(doPedido: Entrega[], ligadas: Entrega[]) {
  const ids = new Set(doPedido.map((e) => e.id))
  return [...doPedido, ...ligadas.filter((e) => !ids.has(e.id))]
}

/** Aba "Histórico" do popup (`Group HistoricoSac` bUDoX): a conversa e a nova interação. */
function AbaInteracoes({ ficha }: { ficha: Ficha }) {
  const [estado, registrar, registrando] = useActionStateComAviso(registrarInteracao, 'Registrando interação…')
  const [visivel, setVisivel] = useState(false)
  const [tipo, setTipo] = useState<TipoAcao>('atualizacao_interna')
  const formRef = useRef<HTMLFormElement>(null)
  const comEmail = ficha.contatos.filter((c) => c.email)

  // Registrou: limpa a caixa (ação bUECr, ResetGroup em `Group Nova interação`).
  useEffect(() => {
    if (estado.ok) {
      formRef.current?.reset()
      setVisivel(false)
      setTipo('atualizacao_interna')
    }
  }, [estado])

  return (
    <div className="sf-secao">
      {ficha.interacoes.length === 0 ? (
        <p className="sf-vazio">Nenhuma interação registrada ainda.</p>
      ) : (
        <ol className="sf-conversa" data-teste="lista-interacoes">
          {ficha.interacoes.map((i) => (
            <li key={i.id} className="sf-interacao" data-visivel={i.visivel_cliente || undefined}>
              <p className="sf-interacao-cabeca">
                <strong>{i.autor?.nome ?? 'Usuário'}</strong>
                <span>{formatarDataHora(i.criado_em)}</span>
                <span className="selo" data-tom={i.tipo_acao === 'atualizacao_interna' ? undefined : 'info'}>
                  {TIPOS_ACAO[i.tipo_acao]?.rotulo ?? 'Atualização interna'}
                </span>
                {i.visivel_cliente ? (
                  <span className="selo" data-tom="ok">
                    Visível ao cliente
                  </span>
                ) : (
                  <span className="selo">Interna</span>
                )}
              </p>
              <p className="sf-interacao-texto">{i.descricao}</p>
              {i.visivel_cliente ? (
                <p className="sf-nota">
                  Para {i.contato?.nome ?? 'contato'}
                  {i.contato?.email ? ` <${i.contato.email}>` : ''} ·{' '}
                  {i.email_id ? 'aviso por e-mail na fila' : 'aviso por e-mail pendente (envio ainda não existe no app)'}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <form
        ref={formRef}
        className="sf-nova"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          startTransition(() => registrar(form))
        }}
      >
        <input type="hidden" name="protocolo_id" value={ficha.protocolo.id} />
        <div className="sf-campos sf-acao">
          <label className="campo">
            <span>Tipo da ação</span>
            <select name="tipo_acao" value={tipo} onChange={(e) => setTipo(e.target.value as TipoAcao)} data-teste="tipo-acao">
              {(Object.keys(TIPOS_ACAO) as TipoAcao[]).map((t) => (
                <option key={t} value={t}>
                  {TIPOS_ACAO[t].rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="campo">
          <span>Nova interação{tipo === 'atualizacao_interna' ? '' : ' (opcional: vazio grava a frase padrão do tipo)'}</span>
          <textarea name="descricao" rows={3} maxLength={10000} placeholder={TIPOS_ACAO[tipo].padrao} data-teste="nova-interacao" />
        </label>
        <div className="sf-linha-botoes">
          <label className="caixa">
            <input
              type="checkbox"
              name="visivel_cliente"
              checked={visivel}
              onChange={(e) => setVisivel(e.target.checked)}
              data-teste="visivel-cliente"
            />
            Visível ao cliente
          </label>
          {visivel ? (
            <label className="campo sf-contato">
              <span className="so-leitor">Contato que recebe</span>
              <select name="contato_id" defaultValue="" data-teste="contato-interacao">
                <option value="">Escolha o contato…</option>
                {comEmail.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.email}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="submit" className="botao-primario empurra" disabled={registrando} aria-busy={registrando} data-teste="registrar-interacao">
            {registrando ? 'Gravando…' : 'Registrar'}
          </button>
        </div>
        {visivel && comEmail.length === 0 ? (
          <p className="aviso">Este cliente não tem contato ativo com e-mail. Cadastre em Cadastros para avisá-lo.</p>
        ) : null}
        <p className="sf-nota">Interações não se editam nem se apagam: corrija com uma nova.</p>
        <Mensagem estado={estado} />
      </form>
    </div>
  )
}

// ------------------------------------------------------------------ protocolo novo

/**
 * Abrir protocolo — `Pop Novo Chamado` vazio ("+ Novo Chamado", WF bUCtx) e "Gravar"
 * (WF bUDKj0). Seções do Bubble: Situação, Identificação, Dados (design sac-02).
 * O número aparece depois de gravar: vem do banco (D2), não de `last_element + 1`.
 */
export function NovoProtocolo({
  opcoes,
  aoCriar,
  aoFechar,
}: {
  opcoes: Opcoes
  aoCriar: (id: string) => void
  aoFechar: () => void
}) {
  const ref = useDialogo()
  const [estado, criar, criando] = useActionStateComAviso(criarProtocolo, 'Abrindo chamado…')
  const [tipo, setTipo] = useState<'cliente' | 'fornecedor'>('cliente')
  const [pedido, setPedido] = useState<PedidoEncontrado | null>(null)
  const [grupo, setGrupo] = useState<{ id: string; nome: string } | null>(null)
  const [filiais, setFiliais] = useState<Filial[]>([])
  const [entregas, setEntregas] = useState<Entrega[]>([])

  useEffect(() => {
    if (estado.id) aoCriar(estado.id)
    // aoCriar muda de identidade a cada render do pai; o gatilho é só o id novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.id])

  async function recarregar(g: { id: string } | null, p: PedidoEncontrado | null) {
    const r = await carregarDependencias(g?.id ?? null, p?.id ?? null)
    setFiliais(r.filiais)
    setEntregas(r.entregas)
  }

  /** Pré-carrega o cliente (ou o fornecedor do 1º orçamento) do pedido, como `dd qualclifor` (§3.2). */
  function escolherPedido(p: PedidoEncontrado) {
    setPedido(p)
    const g = tipo === 'cliente' ? p.cliente : p.fornecedor
    const novo = g ?? grupo
    setGrupo(novo)
    void recarregar(novo, p)
  }

  function escolherGrupo(g: CliforEncontrado) {
    setGrupo(g)
    void recarregar(g, pedido)
  }

  return (
    <dialog ref={ref} className="dialogo sf" aria-labelledby="sf-novo-titulo" onClose={aoFechar} data-teste="novo-protocolo">
      <header className="dialogo-cabecalho">
        <div>
          <p className="sf-tipo">Protocolo SAC</p>
          <h2 id="sf-novo-titulo">Novo chamado</h2>
          <p className="sf-subtitulo">Registre o atendimento. O número sai ao gravar.</p>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>

      <div className="dialogo-corpo">
        <form
          id="form-novo-protocolo"
          className="sf-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            startTransition(() => criar(form))
          }}
        >
          <section className="sf-secao" aria-labelledby="sfn-situacao">
            <h3 id="sfn-situacao">Situação</h3>
            <div className="sf-campos sf-tres">
              <Select nome="tipo_ocorrencia_id" rotulo="Tipo de ocorrência" opcoes={opcoes.tipos} valor={null} vazio="Escolha…" teste="novo-tipo" />
              <Select nome="prioridade_id" rotulo="Prioridade" opcoes={opcoes.prioridades} valor={null} vazio="Escolha…" teste="novo-prioridade" />
              <Select nome="status_id" rotulo="Status" opcoes={opcoes.status} valor={STATUS_EM_ABERTO} />
            </div>
          </section>

          <section className="sf-secao" aria-labelledby="sfn-identificacao">
            <h3 id="sfn-identificacao">Identificação</h3>
            <fieldset className="sf-marcas sf-radios">
              <legend>O chamado é contra</legend>
              {(['cliente', 'fornecedor'] as const).map((t) => (
                <label key={t} className="caixa">
                  <input
                    type="radio"
                    checked={tipo === t}
                    onChange={() => {
                      setTipo(t)
                      // Trocar o rádio troca o grupo sugerido pelo pedido (cliente × fornecedor).
                      const g = pedido ? (t === 'cliente' ? pedido.cliente : pedido.fornecedor) : null
                      setGrupo(g)
                      void recarregar(g, pedido)
                    }}
                  />
                  {t === 'cliente' ? 'Cliente' : 'Fornecedor'}
                </label>
              ))}
            </fieldset>

            <div className="sf-campos">
              <div className="sf-escolha">
                {pedido ? (
                  <p className="sf-escolhido" data-teste="pedido-escolhido">
                    <span>
                      Pedido <strong>Nº {pedido.numero}</strong>
                      {pedido.cliente ? ` · ${pedido.cliente.nome}` : ''}
                    </span>
                    <button
                      type="button"
                      className="botao-texto"
                      onClick={() => {
                        setPedido(null)
                        setEntregas([])
                      }}
                    >
                      Trocar
                    </button>
                  </p>
                ) : (
                  <Autocomplete
                    rotulo="Número do pedido (opcional)"
                    placeholder="Ex.: 5956"
                    minimo={1}
                    buscar={buscarPedidos}
                    aoEscolher={escolherPedido}
                    render={(p) => (
                      <>
                        <strong>Nº {p.numero}</strong> <small>{p.cliente?.nome ?? ''}</small>
                      </>
                    )}
                    teste="busca-pedido"
                  />
                )}
              </div>

              <div className="sf-escolha">
                {grupo ? (
                  <p className="sf-escolhido" data-teste="grupo-escolhido">
                    <span>
                      {tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}: <strong>{grupo.nome}</strong>
                    </span>
                    <button
                      type="button"
                      className="botao-texto"
                      onClick={() => {
                        setGrupo(null)
                        setFiliais([])
                      }}
                    >
                      Trocar
                    </button>
                  </p>
                ) : (
                  <Autocomplete
                    rotulo={tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}
                    placeholder="Digite parte do nome"
                    buscar={(q) => buscarClifor(q, tipo)}
                    aoEscolher={escolherGrupo}
                    render={(g) => <strong>{g.nome}</strong>}
                    teste="busca-clifor"
                  />
                )}
              </div>
            </div>

            <input type="hidden" name="pedido_id" value={pedido?.id ?? ''} />
            <input type="hidden" name="grupo_clifor_id" value={grupo?.id ?? ''} />

            {grupo ? (
              <div className="sf-campos">
                {/* key: trocar de cliente recria o select com as filiais dele. */}
                <Select
                  key={grupo.id}
                  nome="filial_id"
                  rotulo="Qual filial"
                  opcoes={filiais.map((f) => ({ id: f.id, nome: rotuloFilial(f) }))}
                  valor={filiais.length === 1 ? filiais[0]!.id : null}
                  vazio="Nenhuma"
                />
              </div>
            ) : null}
            {pedido ? <ListaEntregas key={pedido.id} entregas={entregas} marcadas={new Set()} editavel /> : null}
          </section>

          <section className="sf-secao" aria-labelledby="sfn-dados">
            <h3 id="sfn-dados">Dados</h3>
            <div className="sf-campos">
              <Select nome="responsavel_id" rotulo="Responsável" opcoes={opcoes.usuarios} valor={null} vazio="Sem responsável" teste="novo-responsavel" />
            </div>
            <label className="campo">
              <span>Descrição detalhada</span>
              <textarea name="descricao" rows={5} maxLength={10000} data-teste="novo-descricao" />
            </label>
            <p className="sf-nota">Anexos do chamado ainda não são enviados por aqui.</p>
          </section>

          <Mensagem estado={estado} />
        </form>
      </div>

      <footer className="dialogo-rodape">
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
          Cancelar
        </button>
        <button
          type="submit"
          form="form-novo-protocolo"
          className="botao-primario"
          disabled={criando}
          aria-busy={criando}
          data-teste="gravar-novo-protocolo"
        >
          {criando ? 'Gravando…' : 'Gravar'}
        </button>
      </footer>
    </dialog>
  )
}

// ---------------------------------------------------------------- nova pesquisa NPS

/** `pop novapesquisa` (bUDNv): título e "Gravar NPS" (WF bUDPr). */
export function NovaPesquisa({ aoCriar, aoFechar }: { aoCriar: (id: string) => void; aoFechar: () => void }) {
  const ref = useDialogo()
  const [estado, criar] = useActionStateComAviso(criarPesquisa, 'Criando pesquisa…')

  useEffect(() => {
    if (estado.id) aoCriar(estado.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.id])

  return (
    <dialog ref={ref} className="dialogo sf sf-pequeno" aria-labelledby="np-titulo" onClose={aoFechar} data-teste="nova-pesquisa">
      <header className="dialogo-cabecalho">
        <h2 id="np-titulo">Nova pesquisa NPS</h2>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>
      <form action={criar} className="dialogo-corpo sf-form">
        <label className="campo">
          <span>Título da pesquisa</span>
          <input name="nome" maxLength={150} required autoFocus autoComplete="off" data-teste="titulo-pesquisa" />
        </label>
        <Mensagem estado={estado} />
        <BotaoEnviar teste="gravar-pesquisa">Gravar NPS</BotaoEnviar>
      </form>
    </dialog>
  )
}
