'use client'

import { AlertTriangle, Building2, FileText, Paperclip, X } from 'lucide-react'
import { startTransition, useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { Foto } from '@/componentes/foto'
import type { TipoClifor } from '@/lib/clifor'
import { formatarData } from '@/lib/datas'
import { somenteDigitos } from '@/lib/documento'

import { definirAtivoGrupo, salvarGrupo } from './acoes'
import { AbaAnexos } from './anexos'
import { AbaContatos, AbaFiliais } from './filiais-contatos'
import type { EstadoAcao, Ficha, Opcoes, Permissoes } from './tipos'

/**
 * Abas da ficha. "geral" = filiais E contatos juntos, como o `gp cadastros` (bUCYr0) do
 * Bubble mostra as duas tabelas ao mesmo tempo (spec §3.3); é a aba de entrada.
 */
export type AbaFicha = 'geral' | 'dados' | 'anexos'

/** Botão de envio DENTRO do form: useFormStatus só enxerga o form que o contém. */
function BotaoEnviar({ children, className = 'botao-primario' }: {
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

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[1]?.[0] ?? '') : '')).toUpperCase()
}

// ----------------------------------------------------------------------- aba Dados

function FormularioGrupo({
  ficha,
  tipo,
  opcoes,
  somenteLeitura,
  estado,
  enviar,
}: {
  ficha: Ficha | null
  tipo: TipoClifor
  opcoes: Opcoes
  somenteLeitura: boolean
  estado: EstadoAcao
  enviar: (form: FormData) => void
}) {
  const g = ficha?.grupo

  // O vendedor atual pode estar fora da lista (mudou de departamento ou saiu da empresa).
  // Ele continua aparecendo, para o select não trocar a carteira em silêncio ao gravar.
  const carteiras =
    g?.carteira_id && !opcoes.carteiras.some((c) => c.id === g.carteira_id)
      ? [{ id: g.carteira_id, nome: `${g.carteira?.nome ?? 'Vendedor inativo'} (atual)` }, ...opcoes.carteiras]
      : opcoes.carteiras

  return (
    <form
      id="form-grupo"
      className="ficha-form"
      noValidate
      // onSubmit em vez de action={...}: com action, o React 19 limpa o formulário ao fim
      // de toda chamada — inclusive quando a validação devolve erro, e a pessoa perderia o
      // que digitou. A validação que vale é a do servidor; noValidate evita a do navegador
      // brigar com ela.
      onSubmit={(e) => {
        e.preventDefault()
        enviar(new FormData(e.currentTarget))
      }}
    >
      {g ? <input type="hidden" name="id" value={g.id} /> : null}
      <input type="hidden" name="tipo" value={tipo} />

      <fieldset disabled={somenteLeitura} className="ficha-campos">
        <label className="campo ficha-largo">
          <span>Nome {tipo === 'cliente' ? 'do cliente' : 'do fornecedor'}</span>
          <input
            name="nome"
            defaultValue={g?.nome ?? ''}
            required
            minLength={2}
            maxLength={200}
            autoComplete="off"
            autoFocus={!g}
            data-teste="campo-nome"
          />
        </label>

        {tipo === 'cliente' ? (
          <label className="campo">
            <span>Carteira (vendedor)</span>
            <select name="carteira_id" defaultValue={g?.carteira_id ?? ''}>
              <option value="">Sem carteira</option>
              {carteiras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="campo">
          <span>Captação</span>
          <select name="captacao_id" defaultValue={g?.captacao_id ?? ''}>
            <option value="">—</option>
            {opcoes.captacoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>E-mail principal</span>
          <input
            name="email_principal"
            type="email"
            defaultValue={g?.email_principal ?? ''}
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        {tipo === 'fornecedor' ? (
          <label className="caixa ficha-largo">
            <input
              type="checkbox"
              name="nao_faz_contrato_parceria"
              defaultChecked={g?.nao_faz_contrato_parceria ?? false}
            />
            Não faz contrato de parceria
          </label>
        ) : null}

        <label className="campo ficha-largo">
          <span>Observações</span>
          <textarea name="observacoes" rows={3} maxLength={2000} defaultValue={g?.observacoes ?? ''} />
        </label>
      </fieldset>

      {estado.parecidos ? (
        <div className="aviso" role="alert" data-teste="aviso-parecido">
          <p>
            Já existe {tipo === 'cliente' ? 'cliente' : 'fornecedor'} com este nome:{' '}
            <strong>{estado.parecidos.join(', ')}</strong>. Confira se não é o mesmo antes de gravar.
          </p>
          <label className="caixa">
            <input type="checkbox" name="confirmar_parecido" />
            Não é o mesmo — gravar assim mesmo
          </label>
        </div>
      ) : null}
      <Mensagem estado={estado} />

      {g ? (
        <dl className="ficha-rastro">
          <div>
            <dt>Criado em</dt>
            <dd>
              {formatarData(g.criado_em)}
              {g.autor ? ` por ${g.autor.nome}` : ''}
            </dd>
          </div>
          {g.alterado_em ? (
            <div>
              <dt>Alterado em</dt>
              <dd>
                {formatarData(g.alterado_em)}
                {g.editor ? ` por ${g.editor.nome}` : ''}
              </dd>
            </div>
          ) : null}
          {g.codigo_legado !== null ? (
            <div>
              <dt>Código antigo</dt>
              <dd>{g.codigo_legado}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </form>
  )
}

// ----------------------------------------------------------------------- a ficha

/**
 * Ficha do grupo (cliente ou fornecedor): filiais e contatos, dados e anexos. É o CONTEÚDO do
 * painel lateral (componentes/painel-lateral.tsx), que a tela monta uma vez só: trocar de
 * grupo troca só isto (key = id), sem refazer a animação do painel.
 *
 * Substitui o painel `gp cadastros` (bUCYr0) da página do Bubble. Filiais e contatos são
 * criados e editados nas próprias abas (filiais-contatos.tsx — porta de pop.AddEditaEndereço
 * e pop.AddEditaContato, specs/paginas/enderecos-e-contatos.md). Como no Bubble, filiais e
 * contatos aparecem juntos na aba de entrada; Dados e Anexos ficam nas outras abas.
 */
export function FichaGrupo({
  ficha,
  novoTipo,
  pedidoAba,
  opcoes,
  permissoes,
  aoCriar,
  aoFechar,
}: {
  ficha: Ficha | null
  novoTipo: TipoClifor | null
  /** aba pedida pela lista (Anexos, Bloquear); `n` muda a cada pedido */
  pedidoAba?: { aba: AbaFicha; n: number }
  opcoes: Opcoes
  permissoes: Permissoes
  aoCriar: (id: string) => void
  aoFechar: () => void
}) {
  const [aba, setAba] = useState<AbaFicha>(ficha ? (pedidoAba?.aba ?? 'geral') : 'dados')
  // Pedido novo da lista com a ficha já aberta: troca de aba sem remontar (o que foi
  // digitado em Dados fica).
  const [pedidoVisto, setPedidoVisto] = useState(pedidoAba?.n)
  if (pedidoAba && pedidoAba.n !== pedidoVisto) {
    setPedidoVisto(pedidoAba.n)
    if (ficha) setAba(pedidoAba.aba)
  }
  const [estado, salvar, salvando] = useActionState(salvarGrupo, {})
  const [estadoAtivo, acaoAtivo] = useActionState(definirAtivoGrupo, {})

  // Grupo recém-criado: abre a ficha dele (a URL passa a apontar para o id novo).
  const criou = !ficha && estado.id ? estado.id : null
  useEffect(() => {
    if (criou) aoCriar(criou)
    // aoCriar muda de identidade a cada render do pai; o gatilho é só o id novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criou])

  const g = ficha?.grupo ?? null
  const tipo: TipoClifor = g?.tipo ?? novoTipo ?? 'cliente'
  const escreve = tipo === 'cliente' || permissoes.escreverFornecedor
  const alteraAtivo = tipo === 'cliente' || permissoes.alterarAtivoFornecedor
  const qtdDuplicados = ficha
    ? ficha.filiais.filter(
        (f) =>
          (ficha.duplicados[somenteDigitos(f.documento)] ?? []).filter((d) => d.endereco_id !== f.id)
            .length > 0,
      ).length
    : 0
  const bloqueadas = ficha ? ficha.filiais.filter((f) => !f.liberado).length : 0

  const abas: { id: AbaFicha; rotulo: string; qtd?: number; Icone: typeof FileText }[] = ficha
    ? [
        { id: 'geral', rotulo: 'Filiais e contatos', Icone: Building2 },
        { id: 'dados', rotulo: 'Dados', Icone: FileText },
        { id: 'anexos', rotulo: 'Anexos', qtd: ficha.anexos.length, Icone: Paperclip },
      ]
    : []

  return (
    <div className="ficha" data-tipo={tipo}>
      <header className="painel-lateral-cabecalho ficha-cabecalho">
        {g ? (
          <Foto
            url={ficha?.fotoUrl}
            nome={g.nome}
            className="clifor-avatar ficha-avatar"
            iniciais={iniciais(g.nome)}
          />
        ) : null}
        <div className="ficha-titulo">
          <p className="ficha-tipo">{tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}</p>
          <h2 id="ficha-titulo">{g ? g.nome : `Novo ${tipo}`}</h2>
          {g && ficha ? (
            <>
              {/* "Contém: N Endereços | M Contatos · Criado em · Por" — o cartão do topo do
                  gp cadastros (captura cadastros-03), mais a carteira. */}
              <p className="ficha-resumo">
                <span>
                  Contém: {ficha.filiais.length} {ficha.filiais.length === 1 ? 'filial' : 'filiais'} |{' '}
                  {ficha.contatos.length} {ficha.contatos.length === 1 ? 'contato' : 'contatos'}
                </span>
                {g.tipo === 'cliente' ? (
                  <span>
                    Carteira: <strong>{g.carteira?.nome ?? 'sem carteira'}</strong>
                  </span>
                ) : null}
                <span>
                  Criado em {formatarData(g.criado_em)}
                  {g.autor ? ` por ${g.autor.nome}` : ''}
                </span>
              </p>
              <p className="ficha-selos">
                <span className="selo" data-tom={g.ativo ? 'ok' : 'erro'}>
                  {g.ativo ? 'Ativo' : 'Inativo'}
                </span>
                {bloqueadas > 0 || !g.liberado ? (
                  <span className="selo" data-tom="erro">
                    {bloqueadas > 0
                      ? `${bloqueadas} ${bloqueadas === 1 ? 'filial bloqueada' : 'filiais bloqueadas'}`
                      : 'Bloqueado'}
                  </span>
                ) : (
                  <span className="selo">Liberado</span>
                )}
                {g.tipo === 'fornecedor' && g.nao_faz_contrato_parceria ? (
                  <span className="selo">Não faz contrato de parceria</span>
                ) : null}
              </p>
            </>
          ) : null}
        </div>
        <button type="button" className="painel-lateral-fechar" aria-label="Fechar" onClick={aoFechar}>
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      {abas.length > 0 ? (
        <div className="abas ficha-abas" role="tablist" aria-label="Seções da ficha">
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
              <a.Icone size={16} aria-hidden="true" />
              {a.rotulo}
              {a.qtd !== undefined ? <span className="aba-qtd">{a.qtd}</span> : null}
              {a.id === 'geral' && qtdDuplicados > 0 ? (
                <AlertTriangle size={16} className="ficha-alerta" aria-label="com documento repetido" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="painel-lateral-corpo ficha-corpo"
        role={abas.length > 0 ? 'tabpanel' : undefined}
        id={`painel-${aba}`}
        aria-labelledby={abas.length > 0 ? `aba-${aba}` : undefined}
      >
        {qtdDuplicados > 0 && aba !== 'geral' ? (
          <p className="aviso ficha-aviso-topo" data-teste="aviso-duplicado-resumo">
            {qtdDuplicados === 1 ? '1 filial tem' : `${qtdDuplicados} filiais têm`} documento repetido em
            outro cadastro.{' '}
            <button type="button" className="link" onClick={() => setAba('geral')}>
              Ver filiais
            </button>
          </p>
        ) : null}

        {/* Filiais e contatos visíveis juntos (gp cadastros: rpg enderecos + rpg contatos). */}
        {ficha && aba === 'geral' ? (
          <div className="ficha-geral">
            <section className="ficha-secao" aria-label="Filiais">
              <AbaFiliais
                ficha={ficha}
                opcoes={opcoes}
                escreve={escreve}
                podeBloquear={permissoes.bloquearFilial}
              />
            </section>
            <section className="ficha-secao" aria-label="Contatos">
              <AbaContatos ficha={ficha} />
            </section>
          </div>
        ) : null}

        {/* hidden em vez de desmontar: trocar de aba não pode perder o que foi digitado. */}
        <div hidden={aba !== 'dados'}>
          {!escreve ? (
            <p className="aviso ficha-aviso-topo">
              Só Diretor, Gerente, Analista ou o Financeiro editam fornecedor.
            </p>
          ) : null}
          <FormularioGrupo
            ficha={ficha}
            tipo={tipo}
            opcoes={opcoes}
            somenteLeitura={!escreve}
            estado={estado}
            enviar={(form) => startTransition(() => salvar(form))}
          />
        </div>
        {ficha && aba === 'anexos' ? (
          <AbaAnexos ficha={ficha} opcoes={opcoes} podeApagar={permissoes.apagarAnexo} />
        ) : null}

        <Mensagem estado={estadoAtivo} />
      </div>

      <footer className="painel-lateral-rodape">
        {g && alteraAtivo ? (
          <form
            action={acaoAtivo}
            onSubmit={(e) => {
              const msg = g.ativo
                ? `Desativar "${g.nome}"? Todas as filiais também serão desativadas.`
                : `Reativar "${g.nome}"? Todas as filiais também serão reativadas.`
              if (!window.confirm(msg)) e.preventDefault()
            }}
          >
            <input type="hidden" name="id" value={g.id} />
            <input type="hidden" name="ativo" value={g.ativo ? 'false' : 'true'} />
            <BotaoEnviar className={g.ativo ? 'botao-perigo' : 'botao-secundario'}>
              {g.ativo ? 'Desativar' : 'Reativar'}
            </BotaoEnviar>
          </form>
        ) : null}
        <button type="button" className="botao-secundario empurra" onClick={aoFechar}>
          Fechar
        </button>
        {escreve && aba === 'dados' ? (
          <button
            type="submit"
            form="form-grupo"
            className="botao-primario"
            disabled={salvando}
            aria-busy={salvando}
            data-teste="gravar-grupo"
          >
            {salvando ? 'Gravando…' : g ? 'Gravar' : 'Cadastrar'}
          </button>
        ) : null}
      </footer>
    </div>
  )
}
