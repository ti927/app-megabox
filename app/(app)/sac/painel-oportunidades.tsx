'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'

import { Plus, X } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { PainelLateral } from '@/componentes/painel-lateral'
import { formatarData } from '@/lib/datas'
import {
  CATEGORIAS,
  chaveTrimestre,
  type FiltrosApoio,
  queryApoio,
  RESULTADOS,
  rotuloTrimestre,
  trimestresRecentes,
} from '@/lib/sac-apoio'

import { buscarClifor } from './acoes'
import { excluirOportunidade, salvarOportunidade } from './acoes-apoio'
import { BotaoEnviar, Mensagem } from './dialogo'
import type { CliforEncontrado, DadosOportunidades, Opcoes, Oportunidade } from './tipos'

type UsuarioApoio = { id: string; nome: string; ehDiretor: boolean; ehGestor: boolean }

const TOM_RESULTADO: Record<Oportunidade['resultado'], 'ok' | 'info' | 'erro' | undefined> = {
  em_andamento: undefined,
  encaminhada: 'info',
  venda_fechada: 'ok',
  sem_interesse: 'erro',
}

/** Cliente cadastrado (busca) ou prospect sem cadastro (nome livre) — 030 `cliente_ou_prospect`. */
function EscolhaCliente({ inicial }: { inicial: Oportunidade | null }) {
  const [modo, setModo] = useState<'cliente' | 'prospect'>(inicial && !inicial.grupo_clifor_id ? 'prospect' : 'cliente')
  const [cliente, setCliente] = useState<{ id: string; nome: string } | null>(
    inicial?.grupo_clifor_id ? { id: inicial.grupo_clifor_id, nome: inicial.cliente?.nome ?? 'cliente' } : null,
  )
  const [texto, setTexto] = useState('')
  const [itens, setItens] = useState<CliforEncontrado[] | null>(null)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pedido = useRef(0)

  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    if (valor.trim().length < 2) {
      pedido.current++
      setItens(null)
      return
    }
    espera.current = setTimeout(async () => {
      const meu = ++pedido.current
      const r = await buscarClifor(valor, 'cliente')
      if (meu !== pedido.current) return
      setItens('erro' in r ? [] : r.itens)
    }, 350)
  }

  return (
    <fieldset className="op-cliente">
      <legend>Quem</legend>
      <div className="op-modo" role="radiogroup" aria-label="Cliente ou prospect">
        <label className="caixa">
          <input type="radio" checked={modo === 'cliente'} onChange={() => setModo('cliente')} />
          Cliente cadastrado
        </label>
        <label className="caixa">
          <input type="radio" checked={modo === 'prospect'} onChange={() => setModo('prospect')} data-teste="modo-prospect" />
          Prospect (sem cadastro)
        </label>
      </div>
      {modo === 'cliente' ? (
        cliente ? (
          <p className="sf-escolhido">
            <input type="hidden" name="grupo_clifor_id" value={cliente.id} />
            <span>
              Cliente: <strong>{cliente.nome}</strong>
            </span>
            <button type="button" className="botao-texto" onClick={() => setCliente(null)}>
              Trocar
            </button>
          </p>
        ) : (
          <div className="sf-busca">
            <label className="campo">
              <span>Buscar cliente</span>
              <input type="search" value={texto} onChange={(e) => digitar(e.target.value)} placeholder="Digite parte do nome" autoComplete="off" spellCheck={false} />
            </label>
            {itens && itens.length === 0 ? <p className="sf-vazio">Nenhum cliente ativo com esse nome.</p> : null}
            {itens && itens.length > 0 ? (
              <ul className="sf-resultados">
                {itens.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        pedido.current++
                        setItens(null)
                        setTexto('')
                        setCliente(c)
                      }}
                    >
                      <strong>{c.nome}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )
      ) : (
        <div className="sf-campos">
          <label className="campo">
            <span>Nome do prospect</span>
            <input name="prospect_nome" maxLength={200} defaultValue={inicial?.prospect_nome ?? ''} required data-teste="prospect-nome" />
          </label>
          <label className="campo">
            <span>Contato (telefone ou e-mail)</span>
            <input name="prospect_contato" maxLength={200} defaultValue={inicial?.prospect_contato ?? ''} />
          </label>
        </div>
      )}
    </fieldset>
  )
}

function FormOportunidade({
  inicial,
  opcoes,
  usuario,
  hoje,
  aoFechar,
}: {
  inicial: Oportunidade | null
  opcoes: Opcoes
  usuario: UsuarioApoio
  hoje: string
  aoFechar: () => void
}) {
  const [estado, salvar] = useActionState(salvarOportunidade, {})
  const [estadoExcluir, excluir] = useActionState(excluirOportunidade, {})
  const [resultado, setResultado] = useState<Oportunidade['resultado']>(inicial?.resultado ?? 'em_andamento')

  // Gravou uma nova: fecha (a lista recarrega pelo revalidatePath). Apagou: fecha também.
  useEffect(() => {
    if ((estado.ok && !inicial) || estadoExcluir.ok) aoFechar()
  }, [estado, estadoExcluir, inicial, aoFechar])

  return (
    <PainelLateral rotuloId="op-titulo" aoFechar={aoFechar} chaveLargura="sac-oportunidade" fracaoInicial={0.36} data-teste="painel-oportunidade">
      <header className="ap-painel-cabeca">
        <div>
          <p className="sf-tipo">Apoio Comercial</p>
          <h2 id="op-titulo">{inicial ? 'Oportunidade' : 'Nova oportunidade'}</h2>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={aoFechar}>
          <Icone icone={X} tamanho={20} />
        </button>
      </header>
      <form action={salvar} className="sf-form op-form">
        {inicial ? <input type="hidden" name="id" value={inicial.id} /> : null}
        <EscolhaCliente inicial={inicial} />
        <div className="sf-campos">
          <label className="campo">
            <span>Tipo</span>
            <select name="categoria" defaultValue={inicial?.categoria ?? ''} required data-teste="op-categoria">
              <option value="" disabled>
                Escolha…
              </option>
              {(Object.keys(CATEGORIAS) as (keyof typeof CATEGORIAS)[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORIAS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Identificada em</span>
            <input type="date" name="identificada_em" defaultValue={inicial?.identificada_em ?? hoje} max={hoje} required />
          </label>
          <label className="campo">
            <span>Apresentação enviada em</span>
            <input type="date" name="apresentacao_em" defaultValue={inicial?.apresentacao_em ?? ''} max={hoje} />
          </label>
        </div>
        <div className="sf-campos">
          <label className="campo">
            <span>Resultado</span>
            <select name="resultado" value={resultado} onChange={(e) => setResultado(e.target.value as Oportunidade['resultado'])}>
              {(Object.keys(RESULTADOS) as (keyof typeof RESULTADOS)[]).map((r) => (
                <option key={r} value={r}>
                  {RESULTADOS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Vendedor{resultado === 'encaminhada' || resultado === 'venda_fechada' ? ' (obrigatório)' : ''}</span>
            <select name="vendedor_id" defaultValue={inicial?.vendedor_id ?? ''}>
              <option value="">Nenhum ainda</option>
              {opcoes.usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
          {usuario.ehGestor ? (
            <label className="campo">
              <span>Responsável (Apoio)</span>
              <select name="responsavel_id" defaultValue={inicial?.responsavel_id ?? usuario.id}>
                {opcoes.usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <label className="campo">
          <span>Observação</span>
          <textarea name="observacao" rows={3} maxLength={2000} defaultValue={inicial?.observacao ?? ''} />
        </label>
        <p className="sf-nota">Conta para a meta pela data em que foi identificada. A venda fechada é do vendedor.</p>
        <Mensagem estado={estado} />
        <Mensagem estado={estadoExcluir} />
        <div className="sf-linha-botoes">
          {inicial ? (
            <button
              type="submit"
              formAction={excluir}
              className="botao-perigo"
              formNoValidate
              onClick={(e) => {
                if (!window.confirm('Apagar esta oportunidade? Use só para registro feito por engano.')) e.preventDefault()
              }}
            >
              Apagar
            </button>
          ) : null}
          <button type="button" className="botao-texto empurra" onClick={aoFechar}>
            Fechar
          </button>
          <BotaoEnviar teste="gravar-oportunidade">{inicial ? 'Salvar' : 'Registrar'}</BotaoEnviar>
        </div>
      </form>
    </PainelLateral>
  )
}

export function Oportunidades({
  filtros,
  hoje,
  dados,
  opcoes,
  usuario,
}: {
  filtros: FiltrosApoio
  hoje: string
  dados: DadosOportunidades
  opcoes: Opcoes
  usuario: UsuarioApoio
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  /** null = fechado; 'nova' = formulário vazio; senão a oportunidade aberta */
  const [aberta, setAberta] = useState<Oportunidade | 'nova' | null>(null)
  function ir(m: Partial<FiltrosApoio>) {
    iniciar(() => router.replace(`/sac${queryApoio('oportunidades', filtros, m)}` as Route, { scroll: false }))
  }
  const total = dados.linhas.length
  const mostraResp = usuario.ehGestor && !filtros.responsavel

  return (
    <>
      <header className="sac-topo">
        <div>
          <h1>Oportunidades</h1>
          <p className="sac-subtitulo">Novos clientes, inativos recuperados e interesse encaminhado ao comercial</p>
        </div>
        <p className="sac-contador" data-teste="contador-oportunidades">
          No trimestre: <strong>{total}</strong>
          {dados.meta !== null ? ` de ${dados.meta}` : ''}
        </p>
        <button type="button" className="botao-primario" onClick={() => setAberta('nova')} data-teste="nova-oportunidade">
          <Icone icone={Plus} tamanho={16} />
          Nova oportunidade
        </button>
      </header>

      <section className="sac-filtros ap-filtros" aria-label="Filtros">
        <label className="campo">
          <span>Trimestre</span>
          <select value={chaveTrimestre(filtros.t)} onChange={(e) => ir({ t: { ano: Number(e.target.value.slice(0, 4)), trimestre: Number(e.target.value.slice(5)) as 1 | 2 | 3 | 4 } })}>
            {trimestresRecentes(hoje, 8).map((t) => (
              <option key={chaveTrimestre(t)} value={chaveTrimestre(t)}>
                {rotuloTrimestre(t)}
              </option>
            ))}
          </select>
        </label>
        {usuario.ehGestor ? (
          <label className="campo">
            <span>Responsável</span>
            <select value={filtros.responsavel ?? ''} onChange={(e) => ir({ responsavel: e.target.value || null })}>
              <option value="">Toda a equipe</option>
              {opcoes.usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      <section className="sac-corpo" aria-label="Oportunidades do trimestre" aria-busy={pendente}>
        {dados.falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar a lista agora. Recarregue a página em instantes.
          </p>
        ) : total === 0 ? (
          <p className="sac-vazio" data-teste="oportunidades-vazio">
            Nenhuma oportunidade registrada neste trimestre.
          </p>
        ) : (
          <div className="sac-tabela-rolagem">
            <table className="sac-grade op-lista" data-teste="lista-oportunidades">
              <thead>
                <tr>
                  <th scope="col">Identificada</th>
                  <th scope="col">Cliente / prospect</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Apresentação</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Vendedor</th>
                  {mostraResp ? <th scope="col">Responsável</th> : null}
                  <th scope="col">
                    <span className="so-leitor">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dados.linhas.map((o) => (
                  <tr key={o.id} data-painel-manter>
                    <td className="num-data">{formatarData(o.identificada_em)}</td>
                    <td className="op-cliente-celula">
                      {o.cliente?.nome ?? o.prospect_nome}
                      {o.grupo_clifor_id ? null : <small>prospect{o.prospect_contato ? ` · ${o.prospect_contato}` : ''}</small>}
                    </td>
                    <td>{CATEGORIAS[o.categoria]}</td>
                    <td className="num-data">{o.apresentacao_em ? formatarData(o.apresentacao_em) : '—'}</td>
                    <td>
                      <span className="selo" data-tom={TOM_RESULTADO[o.resultado]}>
                        {RESULTADOS[o.resultado]}
                      </span>
                    </td>
                    <td>{o.vendedor?.nome ?? '—'}</td>
                    {mostraResp ? <td>{o.responsavel?.nome ?? '—'}</td> : null}
                    <td>
                      <button type="button" className="botao-texto" onClick={() => setAberta(o)}>
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {aberta ? (
        <FormOportunidade
          key={aberta === 'nova' ? 'nova' : aberta.id}
          inicial={aberta === 'nova' ? null : aberta}
          opcoes={opcoes}
          usuario={usuario}
          hoje={hoje}
          aoFechar={() => setAberta(null)}
        />
      ) : null}
    </>
  )
}
