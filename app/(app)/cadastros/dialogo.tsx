'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

import type { TipoClifor } from '@/lib/clifor'
import { formatarData } from '@/lib/datas'
import { documentoValido, formatarDocumento, somenteDigitos } from '@/lib/documento'

import { definirAtivoGrupo, salvarGrupo } from './acoes'
import type { Contato, Duplicado, EstadoAcao, Ficha, Filial, Opcoes, Permissoes } from './tipos'

type Aba = 'dados' | 'filiais' | 'contatos'

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

// --------------------------------------------------------------------- aba Filiais

function AvisoDuplicado({ filial, outras }: { filial: Filial; outras: Duplicado[] }) {
  return (
    <div className="aviso" data-teste="aviso-duplicado">
      <strong>Documento repetido.</strong> O {filial.tipo_pessoa === 'cpf' ? 'CPF' : 'CNPJ'}{' '}
      {formatarDocumento(filial.documento)} também está em:
      <ul>
        {outras.map((o) => (
          <li key={o.endereco_id}>
            {o.grupo_nome} — {o.nome_endereco}
            {o.grupo_tipo === 'fornecedor' ? ' (fornecedor)' : ''}
            {o.ativo ? '' : ' (inativa)'}
          </li>
        ))}
      </ul>
      <small>
        Está na fila de limpeza de documentos repetidos. Confira com o Comercial qual filial fica.
      </small>
    </div>
  )
}

function ListaFiliais({ ficha }: { ficha: Ficha }) {
  if (ficha.filiais.length === 0) {
    return <p className="ficha-vazio">Nenhuma filial cadastrada.</p>
  }
  return (
    <ul className="ficha-itens" data-teste="lista-filiais">
      {ficha.filiais.map((f) => {
        const documento = somenteDigitos(f.documento)
        const outras = (ficha.duplicados[documento] ?? []).filter((d) => d.endereco_id !== f.id)
        return (
          <li key={f.id} className="ficha-item" data-inativo={!f.ativo || undefined}>
            <div className="ficha-item-topo">
              <strong>{f.nome_endereco}</strong>
              {f.principal ? <span className="selo">Principal</span> : null}
              <span className="selo" data-tom={f.ativo ? 'ok' : 'erro'}>
                {f.ativo ? 'Ativa' : 'Inativa'}
              </span>
              <span className="selo" data-tom={f.liberado ? undefined : 'erro'}>
                {f.liberado ? 'Liberada' : 'Bloqueada'}
              </span>
            </div>
            {f.razao ? <div>{f.razao}</div> : null}
            <dl className="ficha-dados">
              <div>
                <dt>{f.tipo_pessoa === 'cpf' ? 'CPF' : 'CNPJ'}</dt>
                <dd className="numero">
                  {formatarDocumento(f.documento)}
                  {documento && !documentoValido(documento) ? (
                    <span className="selo" data-tom="alerta">
                      inválido
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt>Insc. estadual</dt>
                <dd>{f.insc_estadual || '—'}</dd>
              </div>
              <div>
                <dt>Regime</dt>
                <dd>{f.regime?.nome ?? '—'}</dd>
              </div>
              <div>
                <dt>Município/UF</dt>
                <dd>
                  {f.municipio ? `${f.municipio}/` : ''}
                  {f.uf}
                </dd>
              </div>
            </dl>
            {!f.liberado && f.liberado_motivo ? (
              <p className="ficha-motivo">Motivo do bloqueio: {f.liberado_motivo}</p>
            ) : null}
            {outras.length > 0 ? <AvisoDuplicado filial={f} outras={outras} /> : null}
          </li>
        )
      })}
    </ul>
  )
}

// -------------------------------------------------------------------- aba Contatos

function ListaContatos({ contatos, filiais }: { contatos: Contato[]; filiais: Filial[] }) {
  if (contatos.length === 0) {
    return <p className="ficha-vazio">Nenhum contato cadastrado.</p>
  }
  const nomeFilial = new Map(filiais.map((f) => [f.id, f.nome_endereco]))
  return (
    <ul className="ficha-itens" data-teste="lista-contatos">
      {contatos.map((c) => (
        <li key={c.id} className="ficha-item" data-inativo={!c.ativo || undefined}>
          <div className="ficha-item-topo">
            <strong>{c.nome}</strong>
            {c.cargo ? <span className="ficha-cargo">{c.cargo}</span> : null}
            {c.ativo ? null : (
              <span className="selo" data-tom="erro">
                Inativo
              </span>
            )}
          </div>
          <dl className="ficha-dados">
            <div>
              <dt>Telefone{c.tipo_telefone ? ` (${c.tipo_telefone.nome})` : ''}</dt>
              <dd className="numero">{c.telefone || '—'}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd className="quebra">{c.email || '—'}</dd>
            </div>
            <div>
              <dt>Filial</dt>
              <dd>{(c.endereco_id && nomeFilial.get(c.endereco_id)) || 'Do grupo'}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}

// ----------------------------------------------------------------------- o diálogo

/**
 * Ficha do grupo (cliente ou fornecedor): dados, filiais e contatos.
 *
 * Substitui o painel `gp cadastros` (bUCYr0) da página do Bubble. Nesta primeira versão
 * filiais e contatos são só leitura; a edição deles é do módulo de endereços e contatos
 * (specs/paginas/enderecos-e-contatos.md).
 */
export function FichaGrupo({
  ficha,
  novoTipo,
  opcoes,
  permissoes,
  aoCriar,
  aoFechar,
}: {
  ficha: Ficha | null
  novoTipo: TipoClifor | null
  opcoes: Opcoes
  permissoes: Permissoes
  aoCriar: (id: string) => void
  aoFechar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [aba, setAba] = useState<Aba>('dados')
  const [estado, salvar, salvando] = useActionState(salvarGrupo, {})
  const [estadoAtivo, acaoAtivo] = useActionState(definirAtivoGrupo, {})

  // Grupo recém-criado: abre a ficha dele (a URL passa a apontar para o id novo).
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

  const abas: { id: Aba; rotulo: string }[] = ficha
    ? [
        { id: 'dados', rotulo: 'Dados' },
        { id: 'filiais', rotulo: `Filiais (${ficha.filiais.length})` },
        { id: 'contatos', rotulo: `Contatos (${ficha.contatos.length})` },
      ]
    : []

  return (
    <dialog
      ref={ref}
      className="dialogo ficha"
      aria-labelledby="ficha-titulo"
      data-tipo={tipo}
      onClose={aoFechar}
      data-teste="ficha-grupo"
    >
      <header className="dialogo-cabecalho">
        <div>
          <p className="ficha-tipo">{tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}</p>
          <h2 id="ficha-titulo">{g ? g.nome : `Novo ${tipo}`}</h2>
          {g ? (
            <p className="ficha-selos">
              <span className="selo" data-tom={g.ativo ? 'ok' : 'erro'}>
                {g.ativo ? 'Ativo' : 'Inativo'}
              </span>
              {g.tipo === 'fornecedor' && g.nao_faz_contrato_parceria ? (
                <span className="selo">Não faz contrato de parceria</span>
              ) : null}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="dialogo-fechar"
          aria-label="Fechar"
          onClick={() => ref.current?.close()}
        >
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
              {a.id === 'filiais' && qtdDuplicados > 0 ? (
                <span className="ficha-alerta" aria-label="com documento repetido">
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
        {qtdDuplicados > 0 && aba !== 'filiais' ? (
          <p className="aviso ficha-aviso-topo" data-teste="aviso-duplicado-resumo">
            {qtdDuplicados === 1 ? '1 filial tem' : `${qtdDuplicados} filiais têm`} documento repetido em
            outro cadastro.{' '}
            <button type="button" className="link" onClick={() => setAba('filiais')}>
              Ver filiais
            </button>
          </p>
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
        {ficha && aba === 'filiais' ? <ListaFiliais ficha={ficha} /> : null}
        {ficha && aba === 'contatos' ? (
          <ListaContatos contatos={ficha.contatos} filiais={ficha.filiais} />
        ) : null}
        {ficha && aba !== 'dados' ? (
          <p className="ficha-nota">
            Nesta versão, filiais e contatos são só para consulta. Para incluir ou alterar, use o app
            atual.
          </p>
        ) : null}

        <Mensagem estado={estadoAtivo} />
      </div>

      <footer className="dialogo-rodape">
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
        <button type="button" className="botao-secundario empurra" onClick={() => ref.current?.close()}>
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
    </dialog>
  )
}
