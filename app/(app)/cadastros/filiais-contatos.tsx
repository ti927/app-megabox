'use client'

import { Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { documentoValido, formatarDocumento, somenteDigitos } from '@/lib/documento'
import {
  mascararCep,
  mascararDocumento,
  mascararTelefone,
  TIPO_TELEFONE,
  type TipoTelefoneId,
} from '@/lib/filial-contato'

import {
  definirAtivoContato,
  definirAtivoFilial,
  salvarContato,
  salvarFilial,
  verificarDocumento,
} from './acoes-filial'
import type { Contato, Duplicado, EstadoItem, Ficha, Filial, Opcoes, OutraFilial } from './tipos'

/*
 * Abas "Filiais" e "Contatos" da ficha do grupo, com criar/editar.
 * Porta de pop.AddEditaEndereço (bTxcQ) e pop.AddEditaContato (bTxnz): como no Bubble,
 * formulário e lista nunca aparecem juntos (§2.4). Sem "Destravar campos" (§8.3): o campo
 * é editável se a permissão deixa; a regra que vale é a do servidor (acoes-filial.ts).
 */

export function Retorno({ estado, teste }: { estado: EstadoItem; teste: string }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste={`erro-${teste}`}>
        {estado.erro}
      </p>
    )
  }
  if (estado.ok) {
    return (
      <div className="aviso" data-tom={estado.avisos ? undefined : 'ok'} role="status" data-teste={`ok-${teste}`}>
        <p>{estado.ok}</p>
        {estado.avisos?.map((a) => (
          <p key={a}>{a}</p>
        ))}
      </div>
    )
  }
  return null
}

function BotaoAlternar({ ativo }: { ativo: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="link" disabled={pending}>
      {ativo ? <PowerOff size={14} aria-hidden="true" /> : <Power size={14} aria-hidden="true" />}
      {pending ? 'Gravando…' : ativo ? 'Desativar' : 'Reativar'}
    </button>
  )
}

/** Formulário com onSubmit: com `action`, o React 19 limpa os campos até quando dá erro. */
function useEnvio(acao: (form: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    startTransition(() => acao(form))
  }
}

// ============================================================================ FILIAIS

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

function FormularioFilial({
  ficha,
  filial,
  opcoes,
  podeBloquear,
  aoConcluir,
  aoCancelar,
}: {
  ficha: Ficha
  filial: Filial | null
  opcoes: Opcoes
  podeBloquear: boolean
  aoConcluir: (estado: EstadoItem) => void
  aoCancelar: () => void
}) {
  const [estado, salvar, salvando] = useActionState(salvarFilial, {})
  const [documento, setDocumento] = useState(
    filial?.documento ? mascararDocumento(filial.documento) : '',
  )
  const [cep, setCep] = useState(filial?.cep ?? '')
  const [bloqueada, setBloqueada] = useState(filial ? !filial.liberado : false)
  const [outras, setOutras] = useState<OutraFilial[]>([])
  const conferido = useRef(somenteDigitos(filial?.documento))
  const enviar = useEnvio(salvar)

  useEffect(() => {
    if (estado.ok) aoConcluir(estado)
    // aoConcluir muda a cada render do pai; o gatilho é o retorno da gravação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  const cliente = ficha.grupo.tipo === 'cliente'
  const digitos = somenteDigitos(documento)
  const completo = digitos.length === 11 || digitos.length === 14
  const dvRuim = completo && !documentoValido(digitos)
  const mudou = digitos !== somenteDigitos(filial?.documento)
  const temPrincipal = ficha.filiais.some((f) => f.principal)

  // Aviso de documento já cadastrado (§4.4): consulta no servidor ao sair do campo.
  function conferirDocumento() {
    if (!completo || digitos === conferido.current) return
    conferido.current = digitos
    startTransition(async () => {
      setOutras(await verificarDocumento(digitos, filial?.id ?? null))
    })
  }

  return (
    <form className="ficha-form" noValidate onSubmit={enviar} data-teste="form-filial">
      <input type="hidden" name="grupo_id" value={ficha.grupo.id} />
      {filial ? <input type="hidden" name="id" value={filial.id} /> : null}

      <h3 className="ficha-subtitulo">
        {filial ? `Editar filial — ${filial.nome_endereco}` : `Nova filial do ${cliente ? 'cliente' : 'fornecedor'}`}
      </h3>

      <fieldset className="ficha-campos">
        <legend>Informações de cadastro</legend>
        <label className="campo ficha-largo">
          <span>Identificação do endereço</span>
          <input
            name="nome_endereco"
            defaultValue={filial?.nome_endereco ?? ''}
            maxLength={120}
            placeholder="Ex.: Matriz, Filial Campinas (vazio = nome fantasia)"
            autoComplete="off"
            autoFocus
            data-teste="campo-nome-endereco"
          />
        </label>

        <label className="campo">
          <span>CNPJ ou CPF *</span>
          <input
            name="documento"
            value={documento}
            onChange={(e) => setDocumento(mascararDocumento(e.target.value))}
            onBlur={conferirDocumento}
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={dvRuim || undefined}
            aria-describedby="dica-documento"
            data-teste="campo-documento"
          />
          <small id="dica-documento" className="ficha-dica" data-tom={dvRuim ? 'erro' : undefined}>
            {dvRuim
              ? mudou
                ? 'Dígito verificador não confere.'
                : 'Documento antigo inválido — corrija assim que puder.'
              : digitos.length === 14
                ? 'Pessoa jurídica (CNPJ)'
                : digitos.length === 11
                  ? 'Pessoa física (CPF)'
                  : '11 dígitos para CPF, 14 para CNPJ'}
          </small>
        </label>

        <label className="campo">
          <span>Regime tributário *</span>
          <select name="regime_tributario_id" defaultValue={filial?.regime_tributario_id ?? ''} data-teste="campo-regime">
            <option value="">Escolha…</option>
            {opcoes.regimes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>

        {outras.length > 0 ? (
          <div className="aviso ficha-largo" role="status" data-teste="aviso-documento-existente">
            <strong>Leia com atenção:</strong> você pode continuar cadastrando este documento, mas ele
            já existe em:
            <ul>
              {outras.map((o) => (
                <li key={o.endereco_id}>
                  {o.grupo_nome} — {o.nome_endereco}
                  {o.grupo_tipo === 'fornecedor' ? ' (fornecedor)' : ''}
                  {o.ativo ? '' : ' (inativa)'}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <label className="campo">
          <span>Inscrição estadual</span>
          <input name="insc_estadual" defaultValue={filial?.insc_estadual ?? ''} maxLength={30} autoComplete="off" />
        </label>
        <label className="campo">
          <span>Inscrição municipal</span>
          <input name="insc_municipal" defaultValue={filial?.insc_municipal ?? ''} maxLength={30} autoComplete="off" />
        </label>

        <label className="campo ficha-largo">
          <span>Razão social *</span>
          <input name="razao" defaultValue={filial?.razao ?? ''} maxLength={200} autoComplete="off" data-teste="campo-razao" />
        </label>
        <label className="campo ficha-largo">
          <span>Nome fantasia ou nome completo *</span>
          <input name="fantasia" defaultValue={filial?.fantasia ?? ''} maxLength={200} autoComplete="off" data-teste="campo-fantasia" />
        </label>

        <label className="campo">
          <span>CEP *</span>
          <input
            name="cep"
            value={cep}
            onChange={(e) => setCep(mascararCep(e.target.value))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="00000-000"
            data-teste="campo-cep"
          />
        </label>
        <label className="campo">
          <span>UF *</span>
          <select name="uf" defaultValue={filial?.uf ?? ''} data-teste="campo-uf">
            <option value="">Escolha…</option>
            {opcoes.ufs.map((u) => (
              <option key={u.sigla} value={u.sigla}>
                {u.sigla} — {u.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo ficha-largo">
          <span>Endereço (logradouro) *</span>
          <input name="logradouro" defaultValue={filial?.logradouro ?? ''} maxLength={200} autoComplete="off" data-teste="campo-logradouro" />
        </label>
        <label className="campo">
          <span>Número</span>
          <input name="numero" defaultValue={filial?.numero ?? ''} maxLength={20} autoComplete="off" />
        </label>
        <label className="campo">
          <span>Complemento</span>
          <input name="complemento" defaultValue={filial?.complemento ?? ''} maxLength={120} autoComplete="off" />
        </label>
        <label className="campo">
          <span>Bairro</span>
          <input name="bairro" defaultValue={filial?.bairro ?? ''} maxLength={120} autoComplete="off" />
        </label>
        <label className="campo">
          <span>Município *</span>
          <input name="municipio" defaultValue={filial?.municipio ?? ''} maxLength={120} autoComplete="off" data-teste="campo-municipio" />
        </label>

        <label className="caixa ficha-largo">
          <input
            type="checkbox"
            name="principal"
            defaultChecked={filial ? filial.principal : !temPrincipal}
            disabled={filial?.principal || (filial !== null && !filial.ativo)}
            data-teste="campo-principal"
          />
          Filial principal (endereço padrão do cadastro)
        </label>
        <small className="ficha-dica ficha-largo">
          {filial?.principal
            ? 'Esta é a principal. Para trocar, marque outra filial como principal.'
            : !temPrincipal
              ? 'Este cadastro ainda não tem principal: esta filial assume.'
              : 'Marcar aqui desmarca a principal atual.'}
        </small>
      </fieldset>

      {cliente ? (
        <fieldset className="ficha-campos">
          <legend>Informações adicionais</legend>
          <label className="caixa ficha-largo">
            <input type="checkbox" name="corporativo" defaultChecked={filial?.corporativo ?? false} />
            Corporativo
          </label>
          <label className="campo">
            <span>Nome do comprador</span>
            <input name="nome_comprador" defaultValue={filial?.nome_comprador ?? ''} maxLength={120} autoComplete="off" />
          </label>
          <label className="campo">
            <span>Frete</span>
            <select name="frete_id" defaultValue={filial?.frete_id ?? ''}>
              <option value="">—</option>
              {opcoes.fretes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Capacidade de compra</span>
            <input name="capacidade_compra" defaultValue={filial?.capacidade_compra ?? ''} maxLength={120} autoComplete="off" />
          </label>
          <label className="campo">
            <span>Demanda</span>
            <input name="demanda" defaultValue={filial?.demanda ?? ''} maxLength={120} autoComplete="off" />
          </label>
          <label className="campo ficha-largo">
            <span>Observação</span>
            <textarea name="observacoes" rows={2} maxLength={2000} defaultValue={filial?.observacoes ?? ''} />
          </label>
        </fieldset>
      ) : (
        <p className="ficha-dica">
          Produtos que esta filial fornece: continuam no app atual nesta versão.
        </p>
      )}

      {filial ? (
        <fieldset className="ficha-campos">
          <legend>Liberação para venda</legend>
          {podeBloquear ? (
            <>
              <label className="caixa ficha-largo">
                <input
                  type="checkbox"
                  name="bloqueada"
                  checked={bloqueada}
                  onChange={(e) => setBloqueada(e.target.checked)}
                  data-teste="campo-bloqueada"
                />
                Filial bloqueada (não libera venda)
              </label>
              {bloqueada ? (
                <label className="campo ficha-largo">
                  <span>Motivo do bloqueio *</span>
                  <textarea
                    name="liberado_motivo"
                    rows={2}
                    maxLength={500}
                    defaultValue={filial.liberado_motivo ?? ''}
                    data-teste="campo-motivo"
                  />
                </label>
              ) : null}
            </>
          ) : (
            <>
              {/* Sem permissão: o estado atual vai junto, para a gravação não o mudar. */}
              {!filial.liberado ? (
                <>
                  <input type="hidden" name="bloqueada" value="on" />
                  <input type="hidden" name="liberado_motivo" value={filial.liberado_motivo ?? ''} />
                </>
              ) : null}
              <p className="ficha-dica ficha-largo">
                {filial.liberado
                  ? 'Liberada. '
                  : `Bloqueada${filial.liberado_motivo ? `: ${filial.liberado_motivo}` : ''}. `}
                Só Diretor, Gerente ou o Financeiro bloqueiam ou liberam.
              </p>
            </>
          )}
        </fieldset>
      ) : null}

      <Retorno estado={estado} teste="filial" />

      <div className="ficha-form-acoes">
        <button type="button" className="botao-secundario" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </button>
        <button type="submit" className="botao-primario" disabled={salvando} aria-busy={salvando} data-teste="gravar-filial">
          {salvando ? 'Gravando…' : filial ? 'Gravar filial' : 'Cadastrar filial'}
        </button>
      </div>
    </form>
  )
}

export function AbaFiliais({
  ficha,
  opcoes,
  escreve,
  podeBloquear,
}: {
  ficha: Ficha
  opcoes: Opcoes
  escreve: boolean
  podeBloquear: boolean
}) {
  const [editando, setEditando] = useState<Filial | 'nova' | null>(null)
  const [retorno, setRetorno] = useState<EstadoItem>({})
  const [estadoAtivo, alternar] = useActionState(definirAtivoFilial, {})
  // Só o retorno da ÚLTIMA ação fica na tela (gravar no formulário × ativar na lista).
  const [verAtivo, setVerAtivo] = useState(false)

  if (editando) {
    return (
      <FormularioFilial
        ficha={ficha}
        filial={editando === 'nova' ? null : editando}
        opcoes={opcoes}
        podeBloquear={podeBloquear}
        aoConcluir={(e) => {
          setRetorno(e)
          setVerAtivo(false)
          setEditando(null)
        }}
        aoCancelar={() => setEditando(null)}
      />
    )
  }

  return (
    <>
      <div className="ficha-secao-topo">
        <span>{ficha.grupo.tipo === 'cliente' ? 'Endereços do cliente' : 'Endereços do fornecedor'}</span>
        {escreve ? (
          <button
            type="button"
            className="botao-primario"
            onClick={() => {
              setRetorno({})
              setEditando('nova')
            }}
            data-teste="nova-filial"
          >
            <Plus size={16} aria-hidden="true" />
            Nova filial
          </button>
        ) : null}
      </div>
      {!escreve ? (
        <p className="ficha-dica">Só Diretor, Gerente, Analista ou o Financeiro alteram filial de fornecedor.</p>
      ) : null}
      <Retorno estado={retorno} teste="lista-filial" />
      {verAtivo ? <Retorno estado={estadoAtivo} teste="ativo-filial" /> : null}

      {ficha.filiais.length === 0 ? (
        <p className="ficha-vazio">Nenhuma filial cadastrada.</p>
      ) : (
        <ul className="ficha-itens" data-teste="lista-filiais">
          {ficha.filiais.map((f) => {
            const documento = somenteDigitos(f.documento)
            const outras = (ficha.duplicados[documento] ?? []).filter((d) => d.endereco_id !== f.id)
            return (
              <li key={f.id} className="ficha-item" data-inativo={!f.ativo || undefined} data-teste="item-filial">
                <div className="ficha-item-topo">
                  <strong>{f.nome_endereco}</strong>
                  {f.principal ? <span className="selo">Principal</span> : null}
                  <span className="selo" data-tom={f.ativo ? 'ok' : 'erro'}>
                    {f.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="selo" data-tom={f.liberado ? undefined : 'erro'}>
                    {f.liberado ? 'Liberada' : 'Bloqueada'}
                  </span>
                  {escreve ? (
                    <span className="ficha-item-acoes">
                      <button
                        type="button"
                        className="link"
                        onClick={() => {
                          setRetorno({})
                          setEditando(f)
                        }}
                        data-teste="editar-filial"
                      >
                        <Pencil size={14} aria-hidden="true" />
                        Editar
                      </button>
                      <form
                        action={alternar}
                        onSubmit={(e) => {
                          if (f.ativo && !window.confirm(`Desativar a filial "${f.nome_endereco}"?`)) {
                            e.preventDefault()
                            return
                          }
                          setRetorno({})
                          setVerAtivo(true)
                        }}
                      >
                        <input type="hidden" name="id" value={f.id} />
                        <input type="hidden" name="ativo" value={f.ativo ? 'false' : 'true'} />
                        <BotaoAlternar ativo={f.ativo} />
                      </form>
                    </span>
                  ) : null}
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
      )}
    </>
  )
}

// =========================================================================== CONTATOS

const TIPOS_PADRAO: { id: TipoTelefoneId; nome: string }[] = [
  { id: TIPO_TELEFONE.celular, nome: 'Celular' },
  { id: TIPO_TELEFONE.fixo, nome: 'Fixo' },
  { id: TIPO_TELEFONE.sac, nome: 'Sac' },
]

function FormularioContato({
  ficha,
  contato,
  aoConcluir,
  aoCancelar,
}: {
  ficha: Ficha
  contato: Contato | null
  aoConcluir: (estado: EstadoItem) => void
  aoCancelar: () => void
}) {
  const [estado, salvar, salvando] = useActionState(salvarContato, {})
  // "quando vazio → default Celular" (condicional de bTxqN, §2.5)
  const tipoInicial = (contato?.tipo_telefone_id ?? TIPO_TELEFONE.celular) as TipoTelefoneId
  const [tipo, setTipo] = useState<TipoTelefoneId>(tipoInicial)
  const [telefone, setTelefone] = useState(contato?.telefone ?? '')
  const enviar = useEnvio(salvar)

  useEffect(() => {
    if (estado.ok) aoConcluir(estado)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  // Filial vinculada: as ativas, mais a atual do contato mesmo que inativa.
  const filiais = ficha.filiais.filter((f) => f.ativo || f.id === contato?.endereco_id)
  const telefoneLegado = contato?.telefone != null && telefone === contato.telefone

  return (
    <form className="ficha-form" noValidate onSubmit={enviar} data-teste="form-contato">
      <input type="hidden" name="grupo_id" value={ficha.grupo.id} />
      {contato ? <input type="hidden" name="id" value={contato.id} /> : null}
      <h3 className="ficha-subtitulo">{contato ? `Editar contato — ${contato.nome}` : 'Novo contato'}</h3>

      <fieldset className="ficha-campos">
        <legend className="so-leitor">Dados do contato</legend>
        <label className="campo ficha-largo">
          <span>Nome *</span>
          <input name="nome" defaultValue={contato?.nome ?? ''} maxLength={200} autoComplete="off" autoFocus data-teste="campo-contato-nome" />
        </label>

        <fieldset className="ficha-radios ficha-largo">
          <legend>Tipo de telefone</legend>
          {TIPOS_PADRAO.map((t) => (
            <label key={t.id} className="caixa">
              <input
                type="radio"
                name="tipo_telefone_id"
                value={t.id}
                checked={tipo === t.id}
                onChange={() => {
                  setTipo(t.id)
                  if (!telefoneLegado) setTelefone(mascararTelefone(telefone, t.id))
                }}
              />
              {t.nome}
            </label>
          ))}
        </fieldset>

        <label className="campo">
          <span>Telefone</span>
          <input
            name="telefone"
            value={telefone}
            onChange={(e) => setTelefone(mascararTelefone(e.target.value, tipo))}
            inputMode="tel"
            autoComplete="off"
            placeholder={tipo === 3 ? '(00) 0 0000-0000' : tipo === 2 ? '(00) 0000-0000' : '0000-000-0000'}
            data-teste="campo-contato-telefone"
          />
        </label>
        <label className="campo">
          <span>E-mail</span>
          <input
            name="email"
            type="email"
            defaultValue={contato?.email ?? ''}
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
            data-teste="campo-contato-email"
          />
        </label>
        <label className="campo">
          <span>Cargo / departamento</span>
          <input name="cargo" defaultValue={contato?.cargo ?? ''} maxLength={120} autoComplete="off" />
        </label>
        <label className="campo">
          <span>Vinculado à filial</span>
          <select name="endereco_id" defaultValue={contato?.endereco_id ?? ''} data-teste="campo-contato-filial">
            <option value="">Do cadastro (nenhuma filial)</option>
            {filiais.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome_endereco}
                {f.ativo ? '' : ' (inativa)'}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <Retorno estado={estado} teste="contato" />

      <div className="ficha-form-acoes">
        <button type="button" className="botao-secundario" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </button>
        <button type="submit" className="botao-primario" disabled={salvando} aria-busy={salvando} data-teste="gravar-contato">
          {salvando ? 'Gravando…' : contato ? 'Gravar contato' : 'Cadastrar contato'}
        </button>
      </div>
    </form>
  )
}

export function AbaContatos({ ficha }: { ficha: Ficha }) {
  const [editando, setEditando] = useState<Contato | 'novo' | null>(null)
  const [retorno, setRetorno] = useState<EstadoItem>({})
  const [estadoAtivo, alternar] = useActionState(definirAtivoContato, {})
  const [verAtivo, setVerAtivo] = useState(false)

  if (editando) {
    return (
      <FormularioContato
        ficha={ficha}
        contato={editando === 'novo' ? null : editando}
        aoConcluir={(e) => {
          setRetorno(e)
          setVerAtivo(false)
          setEditando(null)
        }}
        aoCancelar={() => setEditando(null)}
      />
    )
  }

  const nomeFilial = new Map(ficha.filiais.map((f) => [f.id, f.nome_endereco]))
  return (
    <>
      <div className="ficha-secao-topo">
        <span>{ficha.grupo.tipo === 'cliente' ? 'Contatos do cliente' : 'Contatos do fornecedor'}</span>
        <button
          type="button"
          className="botao-primario"
          onClick={() => {
            setRetorno({})
            setEditando('novo')
          }}
          data-teste="novo-contato"
        >
          <Plus size={16} aria-hidden="true" />
          Novo contato
        </button>
      </div>
      <Retorno estado={retorno} teste="lista-contato" />
      {verAtivo ? <Retorno estado={estadoAtivo} teste="ativo-contato" /> : null}

      {ficha.contatos.length === 0 ? (
        <p className="ficha-vazio">Nenhum contato cadastrado.</p>
      ) : (
        <ul className="ficha-itens" data-teste="lista-contatos">
          {ficha.contatos.map((c) => (
            <li key={c.id} className="ficha-item" data-inativo={!c.ativo || undefined} data-teste="item-contato">
              <div className="ficha-item-topo">
                <strong>{c.nome}</strong>
                {c.cargo ? <span className="ficha-cargo">{c.cargo}</span> : null}
                {c.ativo ? null : (
                  <span className="selo" data-tom="erro">
                    Inativo
                  </span>
                )}
                <span className="ficha-item-acoes">
                  <button
                    type="button"
                    className="link"
                    onClick={() => {
                      setRetorno({})
                      setEditando(c)
                    }}
                    data-teste="editar-contato"
                  >
                    <Pencil size={14} aria-hidden="true" />
                    Editar
                  </button>
                  <form
                    action={alternar}
                    onSubmit={(e) => {
                      if (c.ativo && !window.confirm(`Desativar o contato "${c.nome}"?`)) {
                        e.preventDefault()
                        return
                      }
                      setRetorno({})
                      setVerAtivo(true)
                    }}
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="ativo" value={c.ativo ? 'false' : 'true'} />
                    <BotaoAlternar ativo={c.ativo} />
                  </form>
                </span>
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
                  <dd>{(c.endereco_id && nomeFilial.get(c.endereco_id)) || 'Do cadastro'}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
