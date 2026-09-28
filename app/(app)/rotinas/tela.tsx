'use client'

import { startTransition, useActionState, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { podeTerCarteira } from '@/lib/clifor'
import {
  confirmacaoConfere,
  formatarDataHora,
  ROTULO_RISCO,
  ROTULO_STATUS,
  segundosRestantes,
} from '@/lib/rotinas'

import { executar, listarCarteira, simular } from './acoes'
import { DialogoExecucao, TabelaAlvo } from './dialogo'
import type {
  ClienteCarteira,
  EstadoExecutar,
  EstadoSimular,
  Execucao,
  GrupoInativo,
  Rotina,
  Simulacao,
  UsuarioOpcao,
} from './tipos'

// ------------------------------------------------------------------------- catálogo

function CartaoRotina({
  rotina,
  selecionada,
  aoEscolher,
}: {
  rotina: Rotina
  selecionada: boolean
  aoEscolher: () => void
}) {
  const risco = ROTULO_RISCO[rotina.risco] ?? { texto: rotina.risco, tom: 'alerta' as const }
  return (
    <article className="rotina-cartao" aria-current={selecionada ? 'true' : undefined} data-teste="rotina-cartao">
      <header className="rotina-cartao-topo">
        <h2>{rotina.nome}</h2>
        <code className="rotina-slug">{rotina.slug}</code>
      </header>
      <p className="rotina-descricao">{rotina.descricao}</p>
      <p className="rotina-selos">
        <span className="selo" data-tom={risco.tom}>
          {risco.texto}
        </span>
        <span className="selo" data-tom={rotina.reversivel ? 'ok' : 'erro'}>
          {rotina.reversivel ? 'Reversível' : 'Irreversível'}
        </span>
        {rotina.idempotente ? <span className="selo">Rodar 2× não repete efeito</span> : null}
        {rotina.filtro_obrigatorio ? <span className="selo">Filtro obrigatório</span> : null}
        {!rotina.ativa ? (
          <span className="selo" data-tom="erro">
            Desativada
          </span>
        ) : null}
      </p>
      <details className="rotina-detalhes">
        <summary>Parâmetros aceitos e origem</summary>
        <dl>
          {Object.entries(rotina.parametros).map(([chave, desc]) => (
            <div key={chave}>
              <dt>
                <code>{chave}</code>
              </dt>
              <dd>{desc}</dd>
            </div>
          ))}
          <div>
            <dt>Origem no Bubble</dt>
            <dd>{rotina.origem_bubble ?? '—'}</dd>
          </div>
        </dl>
      </details>
      <div className="rotina-cartao-acoes">
        <button
          type="button"
          className={selecionada ? 'botao-primario' : 'botao-secundario'}
          onClick={aoEscolher}
          disabled={!rotina.ativa}
          data-teste={`abrir-${rotina.slug}`}
        >
          {selecionada ? 'Selecionada' : 'Preparar execução'}
        </button>
      </div>
    </article>
  )
}

// ----------------------------------------------------------------------- parâmetros

function ListaMarcavel({
  itens,
  nome,
  rotuloBusca,
}: {
  itens: { id: string; rotulo: string; extra?: string }[]
  nome: string
  rotuloBusca: string
}) {
  const [filtro, setFiltro] = useState('')
  const [marcados, setMarcados] = useState<Set<string>>(new Set())
  const f = filtro.trim().toLowerCase()
  const visiveis = f ? itens.filter((i) => i.rotulo.toLowerCase().includes(f)) : itens

  function alternar(id: string) {
    setMarcados((m) => {
      const n = new Set(m)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div className="rotina-marcavel">
      <div className="rotina-marcavel-topo">
        <label className="campo">
          <span>{rotuloBusca}</span>
          <input type="search" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar pelo nome" />
        </label>
        <span className="rotina-marcavel-conta">
          {marcados.size} de {itens.length} marcado(s)
        </span>
      </div>
      {/* Marcados que o filtro esconde continuam indo no formulário. */}
      {[...marcados]
        .filter((id) => !visiveis.some((v) => v.id === id))
        .map((id) => (
          <input key={id} type="hidden" name={nome} value={id} />
        ))}
      <ul className="rotina-marcavel-lista">
        {visiveis.map((i) => (
          <li key={i.id}>
            <label className="caixa">
              <input
                type="checkbox"
                name={nome}
                value={i.id}
                checked={marcados.has(i.id)}
                onChange={() => alternar(i.id)}
              />
              <span>
                {i.rotulo}
                {i.extra ? <small> · {i.extra}</small> : null}
              </span>
            </label>
          </li>
        ))}
        {visiveis.length === 0 ? <li className="rotina-vazio-curto">Nada com esse nome.</li> : null}
      </ul>
    </div>
  )
}

function ParametrosSincronizar({ grupos }: { grupos: GrupoInativo[] }) {
  const [escopo, setEscopo] = useState<'todos' | 'grupos' | ''>('')
  const filiais = grupos.reduce((s, g) => s + g.filiais_ativas, 0)
  return (
    <fieldset className="rotina-parametros">
      <legend>Alcance</legend>
      <p className="rotina-ajuda">
        Hoje há <strong>{grupos.length}</strong> grupo(s) inativo(s) com <strong>{filiais}</strong> filial(is) ainda
        ativa(s). A rotina só desativa filiais; nunca reativa.
      </p>
      <label className="caixa">
        <input type="radio" name="escopo" value="todos" checked={escopo === 'todos'} onChange={() => setEscopo('todos')} />
        Todos os grupos inativos
      </label>
      <label className="caixa">
        <input type="radio" name="escopo" value="grupos" checked={escopo === 'grupos'} onChange={() => setEscopo('grupos')} />
        Só os grupos que eu marcar
      </label>
      {escopo === 'grupos' ? (
        <ListaMarcavel
          nome="grupo_ids"
          rotuloBusca="Grupos inativos com filial ativa"
          itens={grupos.map((g) => ({
            id: g.id,
            rotulo: g.nome,
            extra: `${g.tipo} · ${g.filiais_ativas} filial(is) ativa(s)`,
          }))}
        />
      ) : null}
    </fieldset>
  )
}

function ParametrosCarteira({ usuarios }: { usuarios: UsuarioOpcao[] }) {
  const [de, setDe] = useState('')
  const [carteira, setCarteira] = useState<{ clientes: ClienteCarteira[]; total: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, iniciar] = useTransition()

  // Destino: a regra do dropdown de carteira (D7 da 014, bUCXK0): ativo, fora de Financeiro/Operação.
  const destinos = usuarios.filter((u) => u.ativo && podeTerCarteira(u.departamento_id) && u.id !== de)

  function escolherOrigem(id: string) {
    setDe(id)
    setCarteira(null)
    setErro(null)
    if (!id) return
    iniciar(async () => {
      const r = await listarCarteira(id)
      if ('erro' in r) setErro(r.erro)
      else setCarteira(r)
    })
  }

  return (
    <fieldset className="rotina-parametros">
      <legend>Carteira</legend>
      <div className="rotina-grade-2">
        <label className="campo">
          <span>Vendedor de origem (obrigatório)</span>
          <select name="de_vendedor_id" value={de} onChange={(e) => escolherOrigem(e.target.value)} data-teste="de-vendedor">
            <option value="">Escolha…</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
                {u.ativo ? '' : ' (inativo)'}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Vendedor de destino</span>
          <select name="para_vendedor_id" defaultValue="" data-teste="para-vendedor">
            <option value="">Escolha…</option>
            {destinos.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="rotina-ajuda">
        O destino só lista usuários ativos fora do Financeiro e da Operação — a mesma regra do cadastro de clientes.
      </p>
      {carregando ? <p className="rotina-ajuda">Lendo a carteira…</p> : null}
      {erro ? (
        <p className="aviso" data-tom="erro" role="alert">
          {erro}
        </p>
      ) : null}
      {carteira ? (
        carteira.total === 0 ? (
          <p className="aviso">Este vendedor não tem clientes na carteira.</p>
        ) : (
          <>
            <p className="rotina-ajuda">
              <strong>{carteira.total}</strong> cliente(s) na carteira. Nenhum marcado = transfere <strong>todos</strong>.
              {carteira.total > carteira.clientes.length
                ? ` A lista mostra os primeiros ${carteira.clientes.length}.`
                : ''}
            </p>
            <ListaMarcavel
              key={de}
              nome="grupo_ids"
              rotuloBusca="Só estes clientes (opcional)"
              itens={carteira.clientes.map((c) => ({
                id: c.id,
                rotulo: c.nome,
                extra: c.ativo ? undefined : 'inativo',
              }))}
            />
          </>
        )
      ) : null}
    </fieldset>
  )
}

// -------------------------------------------------------------------------- execução

function Cronometro({ fim, aoVencer }: { fim: string | null; aoVencer: (vencida: boolean) => void }) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = segundosRestantes(fim, agora)
  useEffect(() => aoVencer(s === 0), [s, aoVencer])
  if (s === 0) {
    return (
      <p className="aviso" data-tom="erro" role="alert">
        A simulação expirou (15 minutos). Simule de novo para executar.
      </p>
    )
  }
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return (
    <p className="rotina-ajuda" aria-live="off">
      A simulação autoriza uma execução nos próximos <strong className="rotina-numero">{mm}:{ss}</strong>.
    </p>
  )
}

function ConfirmarExecucao({ simulacao, rotina }: { simulacao: Simulacao; rotina: Rotina }) {
  const [estado, enviar] = useActionState<EstadoExecutar, FormData>(executar, {})
  const [digitado, setDigitado] = useState('')
  const [motivo, setMotivo] = useState('')
  const [vencida, setVencida] = useState(false)
  // Trava de duplo clique: vira true no PRIMEIRO submit e nunca volta. O banco também recusa
  // o segundo uso do mesmo seco, mas a tela não deve nem tentar.
  const [enviado, setEnviado] = useState(false)
  const travado = useRef(false)

  const confere = confirmacaoConfere(digitado, rotina.slug)
  const podeEnviar = confere && motivo.trim().length >= 5 && !vencida && !enviado
  const terminou = Boolean(estado.ok || estado.erro)

  return (
    <section className="rotina-passo" aria-labelledby="passo-3">
      <h3 id="passo-3">3. Executar de verdade</h3>
      {!terminou ? <Cronometro fim={simulacao.fim} aoVencer={setVencida} /> : null}
      <form
        className="rotina-confirmacao"
        onSubmit={(e) => {
          e.preventDefault()
          if (travado.current || !podeEnviar) return
          travado.current = true
          setEnviado(true)
          const dados = new FormData(e.currentTarget)
          startTransition(() => enviar(dados))
        }}
      >
        <input type="hidden" name="simulacao_id" value={simulacao.id} />
        <p className="aviso">
          Isto vai alterar <strong>{simulacao.linhas}</strong> registro(s) de verdade.{' '}
          {rotina.reversivel
            ? 'Os valores anteriores ficam gravados no histórico, para desfazer à mão se preciso.'
            : 'Esta rotina não pode ser desfeita.'}
        </p>
        <label className="campo">
          <span>
            Para confirmar, digite <code>{rotina.slug}</code>
          </span>
          <input
            name="confirmacao"
            value={digitado}
            onChange={(e) => setDigitado(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={enviado}
            data-teste="confirmacao"
          />
        </label>
        <label className="campo">
          <span>Motivo (obrigatório — fica no histórico)</span>
          <textarea
            name="motivo"
            rows={2}
            maxLength={500}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            disabled={enviado}
            data-teste="motivo"
          />
        </label>
        <div className="rotina-botoes">
          <button
            type="submit"
            className="botao-perigo"
            disabled={!podeEnviar}
            aria-busy={enviado && !terminou}
            data-teste="executar"
          >
            {enviado ? (terminou ? 'Execução enviada' : 'Executando…') : `Executar em ${simulacao.linhas} registro(s)`}
          </button>
        </div>
      </form>

      {estado.erro ? (
        <p className="aviso" data-tom="erro" role="alert" data-teste="erro-execucao">
          {estado.erro} Nada foi alterado.
        </p>
      ) : null}
      {estado.ok ? (
        <div className="rotina-resultado" data-teste="resultado-execucao">
          <p className="aviso" data-tom="ok" role="status">
            Execução concluída: {estado.ok.linhas} registro(s) alterado(s). Está no histórico abaixo.
          </p>
          <TabelaAlvo linhas={estado.ok.alterados} total={estado.ok.linhas} rotuloAntes="Antes" rotuloDepois="Agora" />
        </div>
      ) : null}
    </section>
  )
}

function PainelRotina({
  rotina,
  usuarios,
  gruposInativos,
}: {
  rotina: Rotina
  usuarios: UsuarioOpcao[]
  gruposInativos: GrupoInativo[]
}) {
  const [estado, enviar, simulando] = useActionState<EstadoSimular, FormData>(simular, {})
  // A simulação vale para os parâmetros com que foi feita: mexer no formulário a descarta.
  const [descartada, setDescartada] = useState<string | null>(null)
  const sim = estado.simulacao && estado.simulacao.id !== descartada ? estado.simulacao : null

  return (
    <section className="rotina-painel" aria-labelledby="painel-titulo" data-teste="painel-rotina">
      <h2 id="painel-titulo">{rotina.nome}</h2>

      <form
        // Sem `action=`: o React 19 zera o formulário depois de uma action, e a tela mostraria
        // radios e marcações apagados logo abaixo da simulação feita com eles.
        onSubmit={(e) => {
          e.preventDefault()
          const dados = new FormData(e.currentTarget)
          startTransition(() => enviar(dados))
        }}
        onChange={() => {
          if (estado.simulacao) setDescartada(estado.simulacao.id)
        }}
      >
        <input type="hidden" name="rotina" value={rotina.slug} />
        <section className="rotina-passo" aria-labelledby="passo-1">
          <h3 id="passo-1">1. Parâmetros</h3>
          {rotina.slug === 'sincronizar-ativo-enderecos' ? (
            <ParametrosSincronizar grupos={gruposInativos} />
          ) : rotina.slug === 'transferir-carteira' ? (
            <ParametrosCarteira usuarios={usuarios} />
          ) : (
            <p className="aviso">Esta rotina não tem formulário nesta versão.</p>
          )}
        </section>
        <section className="rotina-passo" aria-labelledby="passo-2">
          <h3 id="passo-2">2. Simular (não altera nada)</h3>
          <div className="rotina-botoes">
            <button type="submit" className="botao-primario" disabled={simulando} aria-busy={simulando} data-teste="simular">
              {simulando ? 'Simulando…' : 'Simular'}
            </button>
          </div>
        </section>
      </form>

      {estado.erro && !simulando ? (
        <p className="aviso" data-tom="erro" role="alert" data-teste="erro-simulacao">
          {estado.erro}
        </p>
      ) : null}

      {sim && !simulando ? (
        <div className="rotina-simulacao" data-teste="resultado-simulacao">
          <p className="rotina-contagem">
            <span className="rotina-numero">{sim.linhas.toLocaleString('pt-BR')}</span> registro(s) seriam alterados
          </p>
          <ul className="rotina-resumo">
            {sim.resumo.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          {sim.linhas > 0 ? (
            <TabelaAlvo linhas={sim.amostra} total={sim.linhas} rotuloAntes="Hoje" rotuloDepois="Depois" />
          ) : (
            <p className="aviso" data-tom="ok">
              Nada a alterar com esses parâmetros.
            </p>
          )}
        </div>
      ) : null}

      {sim && !simulando && sim.linhas > 0 ? (
        <ConfirmarExecucao key={sim.id} simulacao={sim} rotina={rotina} />
      ) : null}
    </section>
  )
}

// ------------------------------------------------------------------------- histórico

function Historico({
  execucoes,
  rotinas,
  limite,
  falhou,
  aoAbrir,
}: {
  execucoes: Execucao[]
  rotinas: Rotina[]
  limite: number
  falhou: boolean
  aoAbrir: (id: string) => void
}) {
  const [filtro, setFiltro] = useState('')
  const nomes = useMemo(() => new Map(rotinas.map((r) => [r.slug, r.nome])), [rotinas])
  const lista = filtro ? execucoes.filter((e) => e.rotina_slug === filtro) : execucoes

  return (
    <section className="rotinas-historico" aria-labelledby="historico-titulo">
      <header className="rotinas-historico-topo">
        <h2 id="historico-titulo">Histórico de execuções</h2>
        <label className="campo">
          <span>Rotina</span>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todas</option>
            {rotinas.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>
      </header>
      {falhou ? (
        <p className="aviso" data-tom="erro" role="alert">
          Não foi possível carregar o histórico agora.
        </p>
      ) : lista.length === 0 ? (
        <p className="rotinas-vazio" data-teste="historico-vazio">
          Nenhuma execução registrada.
        </p>
      ) : (
        <ol className="rotinas-execucoes" data-teste="historico">
          <li className="rotina-execucao rotina-execucao-cabecalho" aria-hidden="true">
            <span>Quando</span>
            <span>Rotina</span>
            <span>Modo</span>
            <span>Situação</span>
            <span>Linhas</span>
            <span>Quem</span>
            <span>Motivo</span>
          </li>
          {lista.map((e) => {
            const st = ROTULO_STATUS[e.status] ?? { texto: e.status }
            return (
              <li key={e.id}>
                <button type="button" className="rotina-execucao" onClick={() => aoAbrir(e.id)}>
                  <span className="rotina-numero">{formatarDataHora(e.inicio)}</span>
                  <span className="rotina-execucao-nome">{nomes.get(e.rotina_slug) ?? e.rotina_slug}</span>
                  <span>
                    <span className="selo" data-tom={e.modo === 'real' ? 'erro' : undefined}>
                      {e.modo === 'real' ? 'Real' : 'Simulação'}
                    </span>
                  </span>
                  <span>
                    <span className="selo" data-tom={st.tom}>
                      {st.texto}
                    </span>
                  </span>
                  <span className="rotina-numero">{e.linhas_afetadas ?? '—'}</span>
                  <span>{e.usuario?.nome ?? '—'}</span>
                  <span className="rotina-execucao-motivo">{e.motivo ?? (e.erro ? e.erro : '—')}</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
      {execucoes.length >= limite ? (
        <p className="rotina-ajuda">Mostrando as {limite} execuções mais recentes.</p>
      ) : null}
    </section>
  )
}

// ----------------------------------------------------------------------------- tela

export function TelaRotinas({
  rotinas,
  falhouCatalogo,
  execucoes,
  falhouHistorico,
  limiteHistorico,
  usuarios,
  gruposInativos,
}: {
  rotinas: Rotina[]
  falhouCatalogo: boolean
  execucoes: Execucao[]
  falhouHistorico: boolean
  limiteHistorico: number
  usuarios: UsuarioOpcao[]
  gruposInativos: GrupoInativo[]
}) {
  const [slug, setSlug] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<string | null>(null)
  const rotina = rotinas.find((r) => r.slug === slug) ?? null

  return (
    <div className="rotinas" data-teste="rotinas-conteudo">
      <header className="rotinas-topo">
        <h1>Rotinas de manutenção</h1>
        <p className="rotina-ajuda">
          Toda rotina é simulada antes: a simulação mostra o que mudaria e autoriza <strong>uma</strong> execução, por
          15 minutos, com os mesmos parâmetros. Tudo fica registrado no histórico.
        </p>
      </header>

      {falhouCatalogo ? (
        <p className="aviso" data-tom="erro" role="alert">
          Não foi possível carregar o catálogo agora. Recarregue a página.
        </p>
      ) : rotinas.length === 0 ? (
        <p className="rotinas-vazio">Nenhuma rotina no catálogo.</p>
      ) : (
        <div className="rotinas-catalogo" data-teste="catalogo">
          {rotinas.map((r) => (
            <CartaoRotina key={r.slug} rotina={r} selecionada={r.slug === slug} aoEscolher={() => setSlug(r.slug)} />
          ))}
        </div>
      )}

      {rotina ? (
        <PainelRotina key={rotina.slug} rotina={rotina} usuarios={usuarios} gruposInativos={gruposInativos} />
      ) : null}

      <Historico
        execucoes={execucoes}
        rotinas={rotinas}
        limite={limiteHistorico}
        falhou={falhouHistorico}
        aoAbrir={setDetalhe}
      />

      {detalhe ? (
        <DialogoExecucao key={detalhe} id={detalhe} rotinas={rotinas} aoFechar={() => setDetalhe(null)} />
      ) : null}
    </div>
  )
}
