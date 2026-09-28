'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

import { type FiltrosProduto, paraQuery } from '@/lib/produtos'

import { FichaProduto } from './dialogo'
import type { Ficha, LinhaProduto, Opcoes } from './tipos'

function nomesDe(ids: number[], lista: { id: number; nome: string }[]) {
  const mapa = new Map(lista.map((o) => [o.id, o.nome]))
  return ids
    .slice()
    .sort((a, b) => a - b)
    .map((id) => mapa.get(id))
    .filter((n): n is string => Boolean(n))
}

function Linha({
  linha,
  opcoes,
  selecionada,
  aoAbrir,
}: {
  linha: LinhaProduto
  opcoes: Opcoes
  selecionada: boolean
  aoAbrir: () => void
}) {
  const fornecedores = linha.fornecedores[0]?.count ?? 0
  const versoes = linha.versoes[0]?.count ?? 0
  const condicoes = nomesDe(linha.condicoes.map((c) => c.condicao_id), opcoes.condicoes)
  const linhas = nomesDe(linha.linhas.map((l) => l.linha_id), opcoes.linhas)

  return (
    <li>
      <button
        type="button"
        className="produto-linha"
        aria-current={selecionada ? 'true' : undefined}
        data-inativo={!linha.ativo || undefined}
        onClick={aoAbrir}
      >
        <span className="produto-principal">
          <span className="produto-classe">
            {linha.tipo?.nome ?? 'sem tipo'} › {linha.grupo?.nome ?? 'sem grupo'}
          </span>
          <strong className="produto-nome">{linha.nome}</strong>
          <span className="produto-meta">
            {fornecedores} {fornecedores === 1 ? 'fornecedor' : 'fornecedores'} | {versoes}{' '}
            {versoes === 1 ? 'versão' : 'versões'}
          </span>
        </span>
        <span className="produto-etiquetas">
          {condicoes.map((c) => (
            <span key={`c-${c}`} className="selo">
              {c}
            </span>
          ))}
          {linhas.map((l) => (
            <span key={`l-${l}`} className="selo produto-selo-linha">
              {l}
            </span>
          ))}
        </span>
        <span className="produto-estado">
          <span className="selo" data-tom={linha.ativo ? 'ok' : 'erro'}>
            {linha.ativo ? 'Ativo' : 'Inativo'}
          </span>
          {fornecedores === 0 ? (
            <span className="selo" data-tom="alerta">
              Sem fornecedor
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}

export function TelaProdutos({
  filtros,
  linhas,
  total,
  limite,
  falhou,
  ativos,
  opcoes,
  ficha,
}: {
  filtros: FiltrosProduto
  linhas: LinhaProduto[]
  total: number
  limite: number
  falhou: boolean
  ativos: number
  opcoes: Opcoes
  ficha: Ficha | null
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [novo, setNovo] = useState(false)
  const [texto, setTexto] = useState(filtros.q)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Estado da lista na URL, como em /cadastros: recarregar e mandar o link funcionam.
  function navegar(mudancas: Partial<FiltrosProduto>) {
    iniciar(() => {
      router.replace(`/produtos${paraQuery(filtros, mudancas)}` as Route, { scroll: false })
    })
  }
  function filtrar(mudancas: Partial<FiltrosProduto>) {
    navegar({ sel: null, ...mudancas })
  }
  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => filtrar({ q: valor.trim() }), 400)
  }

  const gruposDoTipo = filtros.tipo ? opcoes.grupos.filter((g) => g.tipo_id === filtros.tipo) : []
  const temFiltro = filtros.q !== '' || filtros.tipo !== null || filtros.ativo !== 'todos'

  return (
    <div className="produtos">
      <header className="produtos-topo">
        <h1>Cadastro de Produtos</h1>
        <p className="produtos-contador" data-teste="contador">
          Produtos ativos: <strong>{ativos.toLocaleString('pt-BR')}</strong>
        </p>
      </header>

      <section className="produtos-filtros" aria-label="Filtros">
        <label className="campo produtos-busca">
          <span>Buscar por nome do modelo</span>
          <input
            type="search"
            value={texto}
            onChange={(e) => digitar(e.target.value)}
            placeholder="Digite parte do nome"
            spellCheck={false}
            data-teste="busca"
          />
        </label>

        <label className="campo">
          <span>Tipo</span>
          <select
            value={filtros.tipo ?? ''}
            onChange={(e) => filtrar({ tipo: e.target.value || null, grupo: null })}
          >
            <option value="">Todos</option>
            {opcoes.tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>

        {/* Grupo depende do tipo, como `src filter produto grupo` no Bubble. */}
        <label className="campo">
          <span>Grupo</span>
          <select
            value={filtros.grupo ?? ''}
            disabled={!filtros.tipo}
            onChange={(e) => filtrar({ grupo: e.target.value || null })}
          >
            <option value="">{filtros.tipo ? 'Todos' : 'Escolha o tipo'}</option>
            {gruposDoTipo.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Situação</span>
          <select
            value={filtros.ativo}
            onChange={(e) => filtrar({ ativo: e.target.value as FiltrosProduto['ativo'] })}
          >
            <option value="todos">Todos</option>
            <option value="sim">Ativos</option>
            <option value="nao">Inativos</option>
          </select>
        </label>

        <div className="produtos-acoes">
          {temFiltro ? (
            <button
              type="button"
              className="botao-texto"
              onClick={() => {
                setTexto('')
                filtrar({ q: '', tipo: null, grupo: null, ativo: 'todos' })
              }}
            >
              Limpar busca
            </button>
          ) : null}
          <button
            type="button"
            className="botao-primario"
            onClick={() => setNovo(true)}
            data-teste="novo-produto"
          >
            + Novo produto
          </button>
        </div>
      </section>

      <section className="produtos-corpo" aria-label="Lista de produtos" aria-busy={pendente}>
        {falhou ? (
          <p className="aviso" data-tom="erro" role="alert">
            Não foi possível carregar a lista agora. Recarregue a página em instantes.
          </p>
        ) : linhas.length === 0 ? (
          <p className="produtos-vazio" data-teste="lista-vazia">
            {temFiltro ? 'Nenhum produto encontrado com esses filtros.' : 'Nenhum produto cadastrado ainda.'}
          </p>
        ) : (
          <ol className="produtos-lista" data-teste="lista-produtos" data-pendente={pendente || undefined}>
            {linhas.map((l) => (
              <Linha
                key={l.id}
                linha={l}
                opcoes={opcoes}
                selecionada={filtros.sel === l.id}
                aoAbrir={() => navegar({ sel: l.id })}
              />
            ))}
          </ol>
        )}

        <p className="produtos-rodape" aria-live="polite">
          {total === 0
            ? 'Nenhum resultado'
            : total > limite
              ? `Mostrando ${limite.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')} — use os filtros para achar o resto.`
              : `${total.toLocaleString('pt-BR')} ${total === 1 ? 'produto' : 'produtos'}`}
        </p>
      </section>

      {ficha || novo ? (
        <FichaProduto
          // key: trocar de produto remonta o diálogo e zera formulário e aba.
          key={novo ? 'novo' : ficha!.produto.id}
          ficha={novo ? null : ficha}
          opcoes={opcoes}
          aoCriar={(id) => {
            setNovo(false)
            navegar({ sel: id })
          }}
          aoFechar={() => {
            if (novo) setNovo(false)
            else navegar({ sel: null })
          }}
        />
      ) : null}
    </div>
  )
}
