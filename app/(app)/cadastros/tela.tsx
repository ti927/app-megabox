'use client'

import { Ban, ChevronLeft, ChevronRight, Paperclip, Plus, Search, UserX, X } from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

import { useActionStateComAviso } from '@/componentes/aviso-acao'
import { Foto } from '@/componentes/foto'
import { PainelLateral } from '@/componentes/painel-lateral'
import { type FiltrosClifor, paraQuery, POR_PAGINA, type TipoClifor, totalPaginas } from '@/lib/clifor'
import { formatarData } from '@/lib/datas'

import { definirAtivoGrupo } from './acoes'
import { type AbaFicha, FichaGrupo, iniciais } from './dialogo'
import type { Ficha, LinhaGrupo, Opcoes, Permissoes } from './tipos'

const ROTULO: Record<TipoClifor, { um: string; varios: string }> = {
  cliente: { um: 'Cliente', varios: 'Clientes' },
  fornecedor: { um: 'Fornecedor', varios: 'Fornecedores' },
}

const idLinha = (id: string) => `clifor-${id}`

/**
 * Chave "Ativo" da linha (`gp ativo`, spec §3.2 → WF bUCbZ0, §4.4): a MESMA action da ficha,
 * com a mesma confirmação. Sem permissão (fornecedor, hierarquia > 2), só o selo.
 */
function ChaveAtivo({ linha, pode }: { linha: LinhaGrupo; pode: boolean }) {
  const [estado, acao, gravando] = useActionStateComAviso(definirAtivoGrupo, 'Alterando situação do cadastro…')
  if (!pode) {
    return (
      <span className="selo" data-tom={linha.ativo ? 'ok' : 'erro'}>
        {linha.ativo ? 'Ativo' : 'Inativo'}
      </span>
    )
  }
  return (
    <form
      className="clifor-ativo"
      action={acao}
      onSubmit={(e) => {
        const msg = linha.ativo
          ? `Desativar "${linha.nome}"? Todas as filiais também serão desativadas.`
          : `Reativar "${linha.nome}"? Todas as filiais também serão reativadas.`
        if (!window.confirm(msg)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={linha.id} />
      <input type="hidden" name="ativo" value={linha.ativo ? 'false' : 'true'} />
      <button
        type="submit"
        role="switch"
        aria-checked={linha.ativo}
        aria-label={`Ativo: ${linha.nome}`}
        className="clifor-chave"
        disabled={gravando}
        aria-busy={gravando}
        data-painel-manter=""
      >
        <span className="clifor-chave-trilho" aria-hidden="true" />
        <span className="clifor-chave-texto">{linha.ativo ? 'Ativo' : 'Inativo'}</span>
      </button>
      {estado.erro ? (
        <span className="clifor-erro" role="alert">
          {estado.erro}
        </span>
      ) : null}
    </form>
  )
}

function Linha({
  linha,
  foto,
  indice,
  selecionada,
  podeAtivo,
  aoAbrir,
}: {
  linha: LinhaGrupo
  foto: string | undefined
  indice: number
  selecionada: boolean
  podeAtivo: boolean
  aoAbrir: (aba?: AbaFicha) => void
}) {
  const filiais = linha.filiais[0]?.count ?? 0
  const bloqueadas = linha.bloqueadas[0]?.count ?? 0
  const contatos = linha.contatos[0]?.count ?? 0
  // Bloqueio é da FILIAL (spec cadastros §10 [DÚVIDA 6]); o campo do grupo ainda existe
  // e é mostrado se alguém o tiver gravado, mas a informação que importa é a das filiais.
  const bloqueado = !linha.liberado || bloqueadas > 0
  const cliente = linha.tipo === 'cliente'
  const dias = linha.dias_sem_conversa

  // O botão principal (nome) cobre a linha inteira por baixo (::after); as células de ação
  // ficam por cima dele — botão dentro de botão não existe em HTML.
  return (
    <li className="clifor-linha" data-tipo={linha.tipo} data-atual={selecionada || undefined}>
      <span className="clifor-c clifor-c-ind numero" aria-hidden="true">
        {indice}
      </span>
      <span className="clifor-c clifor-c-nome">
        <Foto url={foto} nome={linha.nome} className="clifor-avatar" iniciais={iniciais(linha.nome)} />
        <span className="clifor-principal">
          <button
            type="button"
            id={idLinha(linha.id)}
            className="clifor-abrir"
            aria-current={selecionada ? 'true' : undefined}
            aria-haspopup="dialog"
            onClick={() => aoAbrir()}
            // Clicar em outra linha com o painel aberto troca o conteúdo, não fecha.
            data-painel-manter=""
          >
            <strong className="clifor-nome">{linha.nome}</strong>
          </button>
          <span className="clifor-meta">
            Contém: {filiais} {filiais === 1 ? 'filial' : 'filiais'} | {contatos}{' '}
            {contatos === 1 ? 'contato' : 'contatos'}
          </span>
          <span className="clifor-meta clifor-meta-criado">
            Criado em {formatarData(linha.criado_em)}
            {linha.autor ? ` por ${linha.autor.nome}` : ''}
          </span>
        </span>
      </span>
      {cliente ? (
        <span className="clifor-c clifor-c-cart" data-vazio={linha.carteira ? undefined : ''}>
          <span className="rotulo-celula">Carteira: </span>
          {linha.carteira?.nome ?? 'Sem carteira'}
        </span>
      ) : null}
      {/* "Última conversa: dd/mm/aa · N dias" (só Cliente, §3.2), do espelho da 012. */}
      {cliente ? (
        <span className="clifor-c clifor-c-conv" data-vazio={dias === null ? '' : undefined}>
          <span className="rotulo-celula">Última conversa: </span>
          {dias === null ? (
            'Nunca'
          ) : (
            <>
              <strong className="numero">
                {dias} {dias === 1 ? 'dia' : 'dias'}
              </strong>
              <small className="numero">{formatarData(linha.ultimo_historico_em)}</small>
            </>
          )}
        </span>
      ) : null}
      <span className="clifor-c clifor-c-fil numero">
        <span className="rotulo-celula">Filiais: </span>
        {filiais}
      </span>
      <span className="clifor-c clifor-c-con numero">
        <span className="rotulo-celula">Contatos: </span>
        {contatos}
      </span>
      <span className="clifor-c clifor-c-cri">
        <span className="rotulo-celula">Criado em </span>
        <span className="numero">{formatarData(linha.criado_em)}</span>
        {linha.autor ? (
          <small>
            <span className="rotulo-celula">por </span>
            {linha.autor.nome}
          </small>
        ) : null}
      </span>
      <span className="clifor-c clifor-c-anx">
        <button
          type="button"
          className="clifor-acao"
          onClick={() => aoAbrir('anexos')}
          aria-label={`Anexos de ${linha.nome}: ${linha.qtd_anexos}`}
          data-painel-manter=""
        >
          <Paperclip size={16} aria-hidden="true" />
          <span className="numero">{linha.qtd_anexos}</span>
        </button>
      </span>
      {/* "Bloquear" (gp bloquear → pop.BloquearClifor, §4.5): o bloqueio é por filial, e as
          filiais ficam no painel — o botão abre a ficha nelas. */}
      <span className="clifor-c clifor-c-lib">
        <button
          type="button"
          className="clifor-acao"
          data-tom={bloqueado ? 'erro' : undefined}
          onClick={() => aoAbrir('geral')}
          aria-label={`${bloqueado ? 'Bloqueio' : 'Bloquear'}: ${linha.nome}`}
          data-painel-manter=""
        >
          <Ban size={16} aria-hidden="true" />
          <span className="clifor-acao-texto">
            {bloqueadas > 0
              ? `${bloqueadas} bloqueada${bloqueadas === 1 ? '' : 's'}`
              : bloqueado
                ? 'Bloqueado'
                : 'Bloquear'}
          </span>
        </button>
      </span>
      <span className="clifor-c clifor-c-sit">
        <ChaveAtivo linha={linha} pode={podeAtivo} />
      </span>
    </li>
  )
}

/** Enquanto a ficha de outro grupo chega do servidor: nome já no topo, forma do resto. */
function FichaCarregando({ nome, aoFechar }: { nome: string; aoFechar: () => void }) {
  return (
    <div className="ficha">
      <header className="painel-lateral-cabecalho ficha-cabecalho">
        <span className="clifor-avatar ficha-avatar" aria-hidden="true">
          {iniciais(nome)}
        </span>
        <div className="ficha-titulo">
          <p className="ficha-tipo">Carregando</p>
          <h2 id="ficha-titulo">{nome}</h2>
        </div>
        <button type="button" className="painel-lateral-fechar" aria-label="Fechar" onClick={aoFechar}>
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="painel-lateral-corpo ficha-corpo">
        <div className="esqueleto" style={{ height: '2.75rem', marginBottom: 'var(--e4)' }} />
        <div className="esqueleto" style={{ height: '14rem' }} />
      </div>
    </div>
  )
}

export function TelaCadastros({
  filtros,
  linhas,
  fotos,
  total,
  falhou,
  contadores,
  opcoes,
  ficha,
  permissoes,
}: {
  filtros: FiltrosClifor
  linhas: LinhaGrupo[]
  /** id do grupo → URL assinada da foto (só a página visível) */
  fotos: Record<string, string>
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
  const [pedidoAba, setPedidoAba] = useState<{ aba: AbaFicha; n: number }>({ aba: 'geral', n: 0 })
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Grupo que o painel mostra. Anda na frente da URL: o painel abre (ou troca de nome) no
  // clique, e a ficha completa entra quando o servidor responde. Voltar/avançar do
  // navegador muda `filtros.sel`, e o alvo acompanha.
  const [alvo, setAlvo] = useState<string | null>(filtros.sel)
  const [selVista, setSelVista] = useState<string | null>(filtros.sel)
  if (filtros.sel !== selVista) {
    setSelVista(filtros.sel)
    setAlvo(filtros.sel)
  }
  // Foco volta para a linha que estava aberta (ou para o botão "novo").
  const devolverPara = useRef<string | null>(null)

  // Todo o estado da lista mora na URL (spec §9.1): recarregar, voltar e mandar o link
  // funcionam. A transição mantém a lista atual na tela enquanto a nova chega.
  function navegar(mudancas: Partial<FiltrosClifor>) {
    iniciar(() => {
      router.replace(`/cadastros${paraQuery(filtros, mudancas)}` as Route, { scroll: false })
    })
  }
  /** Mudou filtro: volta à página 1 e fecha a ficha. */
  function filtrar(mudancas: Partial<FiltrosClifor>) {
    setAlvo(null)
    navegar({ pagina: 1, sel: null, ...mudancas })
  }

  function digitar(valor: string) {
    setTexto(valor)
    clearTimeout(espera.current)
    espera.current = setTimeout(() => filtrar({ q: valor.trim() }), 400)
  }

  function abrir(id: string, aba?: AbaFicha) {
    setNovo(null)
    setAlvo(id)
    // Aba pedida pela linha (Anexos, Bloquear). O número muda a cada pedido, para o mesmo
    // pedido repetido com a ficha já aberta também valer.
    setPedidoAba((p) => ({ aba: aba ?? 'geral', n: p.n + 1 }))
    devolverPara.current = idLinha(id)
    if (filtros.sel !== id) navegar({ sel: id })
  }

  function fechar() {
    const eraNovo = novo !== null
    setNovo(null)
    setAlvo(null)
    if (!eraNovo || filtros.sel) navegar({ sel: null })
  }

  const rotulo = ROTULO[filtros.tipo]
  const podeCriar = filtros.tipo === 'cliente' || permissoes.escreverFornecedor
  const paginas = totalPaginas(total)
  const primeiro = total === 0 ? 0 : (filtros.pagina - 1) * POR_PAGINA + 1
  const ultimo = Math.min(total, filtros.pagina * POR_PAGINA)
  const temFiltro =
    filtros.q !== '' || filtros.uf !== null || filtros.semCarteira || filtros.captacao !== null

  const fichaCerta = ficha && ficha.grupo.id === alvo ? ficha : null
  // Esperando a ficha do alvo: só enquanto a navegação corre. Terminou e não veio (id que
  // não existe ou que a RLS esconde)? Painel fechado, como antes.
  const carregando = !novo && alvo !== null && !fichaCerta && (pendente || filtros.sel !== alvo)
  const aberto = novo !== null || fichaCerta !== null || carregando
  const nomeAlvo = linhas.find((l) => l.id === alvo)?.nome ?? ficha?.grupo.nome ?? 'Cadastro'
  const tipoPainel = novo ?? fichaCerta?.grupo.tipo ?? filtros.tipo

  return (
    <div className="cadastros" data-painel-aberto={aberto || undefined}>
      <header className="cadastros-topo">
        <div className="cadastros-titulo">
          <h1>Cadastros de {rotulo.um}</h1>
          <p className="cadastros-contadores" data-teste="contadores">
            <span data-tipo="cliente">
              Clientes ativos: <strong>{contadores.clientes.toLocaleString('pt-BR')}</strong>
            </span>
            <span data-tipo="fornecedor">
              Fornecedores ativos: <strong>{contadores.fornecedores.toLocaleString('pt-BR')}</strong>
            </span>
          </p>
        </div>
        {/* No Bubble só aparece o botão do tipo escolhido, e o de fornecedor nasce
            desabilitado para quem não pode (bUCYe0). Aqui ele nem aparece. */}
        {podeCriar ? (
          <button
            type="button"
            className="botao-primario"
            onClick={() => {
              setAlvo(null)
              devolverPara.current = 'cadastros-novo'
              setNovo(filtros.tipo)
            }}
            id="cadastros-novo"
            data-painel-manter=""
            data-teste="novo-grupo"
          >
            <Plus size={16} aria-hidden="true" />
            {rotulo.um}
          </button>
        ) : null}
      </header>

      <section className="cadastros-filtros" aria-label="Filtros">
        <fieldset className="cadastros-tipo">
          <legend className="visualmente-oculto">Exibir lista de</legend>
          {(['cliente', 'fornecedor'] as const).map((t) => (
            <label key={t}>
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={filtros.tipo === t}
                onChange={() => filtrar({ tipo: t, semCarteira: false })}
              />
              <span>{ROTULO[t].varios}</span>
            </label>
          ))}
        </fieldset>

        <label className="campo cadastros-busca">
          <span className="visualmente-oculto">Buscar por nome ou CNPJ/CPF</span>
          <Search size={16} className="cadastros-busca-icone" aria-hidden="true" />
          <input
            type="search"
            value={texto}
            onChange={(e) => digitar(e.target.value)}
            placeholder="Buscar por nome ou CNPJ/CPF"
            spellCheck={false}
            data-teste="busca"
          />
        </label>

        <label className="campo cadastros-filtro">
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

        <label className="campo cadastros-filtro">
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
        <label className="campo cadastros-filtro">
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

        <label className="campo cadastros-filtro">
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
            <UserX size={16} aria-hidden="true" />
            Sem carteira
          </label>
        ) : null}

        {temFiltro ? (
          <button
            type="button"
            className="botao-texto cadastros-limpar"
            onClick={() => {
              setTexto('')
              filtrar({ q: '', uf: null, semCarteira: false, captacao: null })
            }}
          >
            <X size={16} aria-hidden="true" />
            Limpar busca
          </button>
        ) : null}
      </section>

      <section
        className="cadastros-lista"
        aria-label={`Lista de ${rotulo.varios.toLowerCase()}`}
        aria-busy={pendente}
      >
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
          <div className="clifor-tabela" data-tipo={filtros.tipo}>
            {/* Cabeçalho só visual: cada linha é um botão, e o leitor de tela lê o botão inteiro. */}
            <div className="clifor-cabeca" aria-hidden="true">
              <span className="clifor-c clifor-c-ind">#</span>
              <span className="clifor-c clifor-c-nome">{rotulo.um}</span>
              {filtros.tipo === 'cliente' ? <span className="clifor-c clifor-c-cart">Carteira</span> : null}
              {filtros.tipo === 'cliente' ? <span className="clifor-c clifor-c-conv">Última conversa</span> : null}
              <span className="clifor-c clifor-c-fil numero">Filiais</span>
              <span className="clifor-c clifor-c-con numero">Contatos</span>
              <span className="clifor-c clifor-c-cri">Criado em</span>
              <span className="clifor-c clifor-c-anx">Anexos</span>
              <span className="clifor-c clifor-c-lib">Bloqueio</span>
              <span className="clifor-c clifor-c-sit">Ativo</span>
            </div>
            <ol className="clifor-lista" data-teste="lista-grupos" data-pendente={pendente || undefined}>
              {linhas.map((l, i) => (
                <Linha
                  key={l.id}
                  linha={l}
                  foto={fotos[l.id]}
                  indice={primeiro + i}
                  selecionada={!novo && alvo === l.id}
                  podeAtivo={l.tipo === 'cliente' || permissoes.alterarAtivoFornecedor}
                  aoAbrir={(aba) => abrir(l.id, aba)}
                />
              ))}
            </ol>
          </div>
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
              onClick={() => {
                setAlvo(null)
                navegar({ pagina: filtros.pagina - 1, sel: null })
              }}
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              className="botao-secundario"
              disabled={filtros.pagina >= paginas || pendente}
              onClick={() => {
                setAlvo(null)
                navegar({ pagina: filtros.pagina + 1, sel: null })
              }}
            >
              Próxima
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </section>

      {aberto ? (
        <PainelLateral
          rotuloId="ficha-titulo"
          aoFechar={fechar}
          focoAoFechar={() =>
            devolverPara.current ? document.getElementById(devolverPara.current) : null
          }
          chaveLargura="cadastros"
          fracaoInicial={0.52}
          ocupado={carregando}
          className={`ficha-painel ficha-painel-${tipoPainel}`}
          data-teste="ficha-grupo"
        >
          {fichaCerta || novo ? (
            <FichaGrupo
              // key: trocar de grupo remonta a ficha e zera o formulário e a aba.
              key={novo ? `novo-${novo}` : fichaCerta!.grupo.id}
              ficha={novo ? null : fichaCerta}
              novoTipo={novo}
              pedidoAba={pedidoAba}
              opcoes={opcoes}
              permissoes={permissoes}
              aoCriar={(id) => {
                setNovo(null)
                abrir(id)
              }}
              aoFechar={fechar}
            />
          ) : (
            <FichaCarregando nome={nomeAlvo} aoFechar={fechar} />
          )}
        </PainelLateral>
      ) : null}
    </div>
  )
}
