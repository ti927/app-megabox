'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

import { type FiltrosClifor, paraQuery, POR_PAGINA, type TipoClifor, totalPaginas } from '@/lib/clifor'
import { formatarData } from '@/lib/datas'

import { FichaGrupo } from './dialogo'
import type { Ficha, LinhaGrupo, Opcoes, Permissoes } from './tipos'

const ROTULO: Record<TipoClifor, { um: string; varios: string }> = {
  cliente: { um: 'Cliente', varios: 'Clientes' },
  fornecedor: { um: 'Fornecedor', varios: 'Fornecedores' },
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[1]?.[0] ?? '') : '')).toUpperCase()
}

function Linha({
  linha,
  indice,
  selecionada,
  aoAbrir,
}: {
  linha: LinhaGrupo
  indice: number
  selecionada: boolean
  aoAbrir: () => void
}) {
  const filiais = linha.filiais[0]?.count ?? 0
  const bloqueadas = linha.bloqueadas[0]?.count ?? 0
  const contatos = linha.contatos[0]?.count ?? 0
  // Bloqueio é da FILIAL (spec cadastros §10 [DÚVIDA 6]); o campo do grupo ainda existe
  // e é mostrado se alguém o tiver gravado, mas a informação que importa é a das filiais.
  const bloqueado = !linha.liberado || bloqueadas > 0

  return (
    <li>
      <button
        type="button"
        className="clifor-linha"
        data-tipo={linha.tipo}
        aria-current={selecionada ? 'true' : undefined}
        onClick={aoAbrir}
      >
        <span className="clifor-indice" aria-hidden="true">
          {indice}
        </span>
        <span className="clifor-avatar" aria-hidden="true">
          {iniciais(linha.nome)}
        </span>
        <span className="clifor-principal">
          <strong className="clifor-nome">{linha.nome}</strong>
          <span className="clifor-meta">
            Contém: {filiais} {filiais === 1 ? 'filial' : 'filiais'} | {contatos}{' '}
            {contatos === 1 ? 'contato' : 'contatos'}
          </span>
          <span className="clifor-meta">
            Criado em {formatarData(linha.criado_em)}
            {linha.autor ? ` por ${linha.autor.nome}` : ''}
          </span>
        </span>
        {linha.tipo === 'cliente' ? (
          <span className="clifor-carteira">
            <small>Carteira</small>
            <span>{linha.carteira?.nome ?? 'Sem carteira'}</span>
          </span>
        ) : null}
        <span className="clifor-selos">
          <span className="selo" data-tom={linha.ativo ? 'ok' : 'erro'}>
            {linha.ativo ? 'Ativo' : 'Inativo'}
          </span>
          {bloqueado ? (
            <span className="selo" data-tom="erro">
              {bloqueadas > 0 ? `${bloqueadas} bloqueada${bloqueadas === 1 ? '' : 's'}` : 'Bloqueado'}
            </span>
          ) : (
            <span className="selo">Liberado</span>
          )}
        </span>
      </button>
    </li>
  )
}

export function TelaCadastros({
  filtros,
  linhas,
  total,
  falhou,
  contadores,
  opcoes,
  ficha,
  permissoes,
}: {
  filtros: FiltrosClifor
  linhas: LinhaGrupo[]
  total: number
  falhou: boolean
  contadores: { clientes: number; fornecedores: number }
  opcoes: Opcoes
  ficha: Ficha | null
  permissoes: Permissoes
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [novo, setNovo] = useState<TipoClifor | null>(null)
  const [texto, setTexto] = useState(filtros.q)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Todo o estado da lista mora na URL (spec §9.1): recarregar, voltar e mandar o link
  // funcionam. A transição mantém a lista atual na tela enquanto a nova chega.
  function navegar(mudancas: Partial<FiltrosClifor>) {
    iniciar(() => {
      router.replace(`/cadastros${paraQuery(filtros, mudancas)}` as Route, { scroll: false })
    })
  }
  /** Mudou filtro: volta à página 1 e fecha a ficha. */
  function filtrar(mudancas: Partial<FiltrosClifor>) {
    navegar({ pagina: 1, sel: null, ...mudancas })
  }

  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => filtrar({ q: valor.trim() }), 400)
  }

  const rotulo = ROTULO[filtros.tipo]
  const podeCriar = filtros.tipo === 'cliente' || permissoes.escreverFornecedor
  const paginas = totalPaginas(total)
  const primeiro = total === 0 ? 0 : (filtros.pagina - 1) * POR_PAGINA + 1
  const ultimo = Math.min(total, filtros.pagina * POR_PAGINA)
  const temFiltro =
    filtros.q !== '' || filtros.uf !== null || filtros.semCarteira || filtros.captacao !== null

  return (
    <div className="cadastros">
      <header className="cadastros-topo">
        <h1>Cadastros de {rotulo.um}</h1>
        <p className="cadastros-contadores" data-teste="contadores">
          <span>
            Clientes ativos: <strong>{contadores.clientes.toLocaleString('pt-BR')}</strong>
          </span>
          <span>
            Fornecedores ativos: <strong>{contadores.fornecedores.toLocaleString('pt-BR')}</strong>
          </span>
        </p>
      </header>

      <section className="cadastros-filtros" aria-label="Filtros">
        <fieldset className="cadastros-tipo">
          <legend>Exibir lista de</legend>
          {(['cliente', 'fornecedor'] as const).map((t) => (
            <label key={t} className="caixa">
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={filtros.tipo === t}
                onChange={() => filtrar({ tipo: t, semCarteira: false })}
              />
              {ROTULO[t].um}
            </label>
          ))}
        </fieldset>

        <label className="campo cadastros-busca">
          <span>Buscar por nome ou CNPJ/CPF</span>
          <input
            type="search"
            value={texto}
            onChange={(e) => digitar(e.target.value)}
            placeholder="Digite parte do nome ou do documento"
            spellCheck={false}
            data-teste="busca"
          />
        </label>

        <label className="campo">
          <span>Estado</span>
          <select value={filtros.uf ?? ''} onChange={(e) => filtrar({ uf: e.target.value || null })}>
            <option value="">Todos</option>
            {opcoes.ufs.map((u) => (
              <option key={u.sigla} value={u.sigla}>
                {u.sigla} — {u.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Situação</span>
          <select
            value={filtros.ativo}
            onChange={(e) => filtrar({ ativo: e.target.value as FiltrosClifor['ativo'] })}
          >
            <option value="todos">Todos</option>
            <option value="sim">Ativos</option>
            <option value="nao">Inativos</option>
          </select>
        </label>

        {/* Filtro de captação: existia na página antiga e no pop.CadastroCliFor (bTrns) e
            sumiu da página atual; spec §10 [DÚVIDA 15] manda voltar. */}
        <label className="campo">
          <span>Captação</span>
          <select
            value={filtros.captacao ?? ''}
            onChange={(e) => filtrar({ captacao: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Todas</option>
            {opcoes.captacoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Ordem</span>
          <select
            value={filtros.ordem}
            onChange={(e) => filtrar({ ordem: e.target.value as FiltrosClifor['ordem'] })}
          >
            <option value="recente">Recente</option>
            <option value="nome">Alfabética</option>
          </select>
        </label>

        {filtros.tipo === 'cliente' ? (
          <label className="caixa cadastros-sem-carteira">
            <input
              type="checkbox"
              checked={filtros.semCarteira}
              onChange={(e) => filtrar({ semCarteira: e.target.checked })}
            />
            Clientes sem carteira
          </label>
        ) : null}

        <div className="cadastros-acoes">
          {temFiltro ? (
            <button
              type="button"
              className="botao-texto"
              onClick={() => {
                setTexto('')
                filtrar({ q: '', uf: null, semCarteira: false, captacao: null })
              }}
            >
              Limpar busca
            </button>
          ) : null}
          {/* No Bubble só aparece o botão do tipo escolhido, e o de fornecedor nasce
              desabilitado para quem não pode (bUCYe0). Aqui ele nem aparece. */}
          {podeCriar ? (
            <button
              type="button"
              className="botao-primario"
              onClick={() => setNovo(filtros.tipo)}
              data-teste="novo-grupo"
            >
              + {rotulo.um}
            </button>
          ) : null}
        </div>
      </section>

      <section className="cadastros-lista" aria-label={`Lista de ${rotulo.varios.toLowerCase()}`} aria-busy={pendente}>
        {falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar a lista agora. Recarregue a página em instantes.
          </p>
        ) : linhas.length === 0 ? (
          <p className="cadastros-vazio" data-teste="lista-vazia">
            {temFiltro
              ? `Nenhum ${rotulo.um.toLowerCase()} encontrado com esses filtros.`
              : `Nenhum ${rotulo.um.toLowerCase()} cadastrado ainda.`}
          </p>
        ) : (
          <ol className="clifor-lista" data-teste="lista-grupos" data-pendente={pendente || undefined}>
            {linhas.map((l, i) => (
              <Linha
                key={l.id}
                linha={l}
                indice={primeiro + i}
                selecionada={filtros.sel === l.id}
                aoAbrir={() => navegar({ sel: l.id })}
              />
            ))}
          </ol>
        )}

        <div className="paginacao">
          <span aria-live="polite">
            {total === 0
              ? 'Nenhum resultado'
              : `${primeiro.toLocaleString('pt-BR')}–${ultimo.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')}`}
          </span>
          <nav aria-label="Paginação">
            <button
              type="button"
              className="botao-secundario"
              disabled={filtros.pagina <= 1 || pendente}
              onClick={() => navegar({ pagina: filtros.pagina - 1, sel: null })}
            >
              ← Anterior
            </button>
            <button
              type="button"
              className="botao-secundario"
              disabled={filtros.pagina >= paginas || pendente}
              onClick={() => navegar({ pagina: filtros.pagina + 1, sel: null })}
            >
              Próxima →
            </button>
          </nav>
        </div>
      </section>

      {ficha || novo ? (
        <FichaGrupo
          // key: trocar de grupo remonta o diálogo e zera o formulário e a aba.
          key={novo ? `novo-${novo}` : ficha!.grupo.id}
          ficha={novo ? null : ficha}
          novoTipo={novo}
          opcoes={opcoes}
          permissoes={permissoes}
          aoCriar={(id) => {
            setNovo(null)
            navegar({ sel: id })
          }}
          aoFechar={() => {
            if (novo) setNovo(null)
            else navegar({ sel: null })
          }}
        />
      ) : null}
    </div>
  )
}
