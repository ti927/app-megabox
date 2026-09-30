'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

import { ChevronRight, Plus, X } from 'lucide-react'

import { Foto } from '@/componentes/foto'
import { Icone } from '@/componentes/icone'
import { PainelLateral } from '@/componentes/painel-lateral'
import { formularioAlterado } from '@/lib/formulario-alterado'
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

/** Duas letras do modelo, para a miniatura sem foto. */
function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

function Linha({
  linha,
  foto,
  opcoes,
  selecionada,
  aoAbrir,
}: {
  linha: LinhaProduto
  foto: string | undefined
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
        aria-haspopup="dialog"
        data-inativo={!linha.ativo || undefined}
        onClick={aoAbrir}
        // Clicar em outra linha com o painel aberto troca o produto, não fecha.
        data-painel-manter=""
      >
        <span className="produto-c produto-c-nome">
          <Foto url={foto} nome={linha.nome} className="produto-foto" iniciais={iniciais(linha.nome)} />
          <span className="produto-principal">
            <strong className="produto-nome">{linha.nome}</strong>
            <span className="produto-classe">
              {linha.tipo?.nome ?? 'sem tipo'}
              <Icone icone={ChevronRight} tamanho={14} />
              {linha.grupo?.nome ?? 'sem grupo'}
            </span>
            <span className="produto-meta">
              {fornecedores} {fornecedores === 1 ? 'fornecedor' : 'fornecedores'} | {versoes}{' '}
              {versoes === 1 ? 'versão' : 'versões'}
            </span>
          </span>
        </span>
        <span className="produto-c produto-c-tipo">
          <span className="produto-rotulo-celula">Tipo: </span>
          {linha.tipo?.nome ?? 'sem tipo'}
        </span>
        <span className="produto-c produto-c-grupo">
          <span className="produto-rotulo-celula">Grupo: </span>
          {linha.grupo?.nome ?? 'sem grupo'}
        </span>
        <span className="produto-c produto-c-for numero">
          <span className="produto-rotulo-celula">Fornecedores: </span>
          {fornecedores}
        </span>
        <span className="produto-c produto-c-ver numero">
          <span className="produto-rotulo-celula">Versões: </span>
          {versoes}
        </span>
        <span className="produto-c produto-c-etq produto-etiquetas">
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
        <span className="produto-c produto-c-sit produto-estado">
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
  fotos,
  total,
  limite,
  falhou,
  ativos,
  opcoes,
  ficha,
}: {
  filtros: FiltrosProduto
  linhas: LinhaProduto[]
  /** id do produto → URL assinada da miniatura */
  fotos: Record<string, string>
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

  // X, Esc, clique fora e "Fechar": com alteração não gravada na aba Dados, confirma antes de
  // descartar. Sem alteração, fecha direto (lib/formulario-alterado).
  function fechar() {
    const form = document.getElementById('form-produto')
    if (form instanceof HTMLFormElement && formularioAlterado(form)) {
      const msg = novo
        ? 'Descartar o produto novo? O que foi digitado ainda não foi gravado.'
        : 'Descartar as alterações? Elas ainda não foram gravadas.'
      if (!window.confirm(msg)) return
    }
    if (novo) setNovo(false)
    else navegar({ sel: null })
  }

  const gruposDoTipo = filtros.tipo ? opcoes.grupos.filter((g) => g.tipo_id === filtros.tipo) : []
  const temFiltro = filtros.q !== '' || filtros.tipo !== null || filtros.ativo !== 'todos'

  return (
    <div className="produtos" data-painel-aberto={ficha || novo ? '' : undefined}>
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
              className="botao-texto produtos-limpar"
              onClick={() => {
                setTexto('')
                filtrar({ q: '', tipo: null, grupo: null, ativo: 'todos' })
              }}
            >
              <Icone icone={X} tamanho={16} />
              Limpar busca
            </button>
          ) : null}
          <button
            type="button"
            className="botao-primario"
            onClick={() => setNovo(true)}
            data-teste="novo-produto"
          >
            <Icone icone={Plus} tamanho={16} />
            Novo produto
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
          <div className="produtos-tabela">
            {/* Cabeçalho só visual: cada linha é um botão, e o leitor de tela lê o botão inteiro. */}
            <div className="produtos-cabeca" aria-hidden="true">
              <span className="produto-c produto-c-nome">Produto</span>
              <span className="produto-c produto-c-tipo">Tipo</span>
              <span className="produto-c produto-c-grupo">Grupo</span>
              <span className="produto-c produto-c-for numero">Fornecedores</span>
              <span className="produto-c produto-c-ver numero">Versões</span>
              <span className="produto-c produto-c-etq">Condições e linhas</span>
              <span className="produto-c produto-c-sit">Situação</span>
            </div>
            <ol className="produtos-lista" data-teste="lista-produtos" data-pendente={pendente || undefined}>
              {linhas.map((l) => (
                <Linha
                  key={l.id}
                  linha={l}
                  foto={fotos[l.id]}
                  opcoes={opcoes}
                  selecionada={filtros.sel === l.id}
                  aoAbrir={() => navegar({ sel: l.id })}
                />
              ))}
            </ol>
          </div>
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
        <PainelLateral
          rotuloId="pf-titulo"
          aoFechar={fechar}
          chaveLargura="produtos"
          fracaoInicial={0.46}
          className="pf-painel"
          data-teste="ficha-produto"
        >
          <FichaProduto
            // key: trocar de produto remonta a ficha e zera formulário e aba.
            key={novo ? 'novo' : ficha!.produto.id}
            ficha={novo ? null : ficha}
            opcoes={opcoes}
            aoCriar={(id) => {
              setNovo(false)
              navegar({ sel: id })
            }}
            aoFechar={fechar}
          />
        </PainelLateral>
      ) : null}
    </div>
  )
}
