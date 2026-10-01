'use client'

import { X } from 'lucide-react'
import { startTransition, useEffect, useId, useRef, useState } from 'react'
import { useActionStateComAviso } from '@/componentes/aviso-acao'

import { Icone } from '@/componentes/icone'

import { formatarData } from '@/lib/datas'
import { formatarReais } from '@/lib/dinheiro'
import { formatarPercentual, nomeDoMes } from '@/lib/metas'

import {
  apagarMeta,
  calcularFechamento,
  cancelarFechamento,
  fecharMeta,
  registrarNivel,
  salvarMeta,
  salvarNivel,
} from './acoes'
import type { Calculo, EstadoAcao, HistoricoNivel, LinhaMeta, Nivel, Vendedor } from './tipos'

function Mensagem({ estado }: { estado: EstadoAcao }) {
  if (estado.erro) {
    return (
      <p className="aviso" data-tom="erro" role="alert" data-teste="erro-dialogo">
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

/** <dialog> nativo aberto com showModal() (estilos/componentes.css), fechado pelo Esc ou pelo X. */
export function Dialogo({
  titulo,
  subtitulo,
  largo,
  aoFechar,
  rodape,
  teste,
  children,
}: {
  titulo: string
  subtitulo?: string
  largo?: boolean
  aoFechar: () => void
  rodape: (fechar: () => void) => React.ReactNode
  teste: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  const fechar = () => ref.current?.close()
  return (
    <dialog
      ref={ref}
      className="dialogo mt-dialogo"
      data-largo={largo || undefined}
      aria-labelledby="mt-dialogo-titulo"
      onClose={aoFechar}
      data-teste={teste}
    >
      <header className="dialogo-cabecalho">
        <div>
          {subtitulo ? <p className="mt-sobretitulo">{subtitulo}</p> : null}
          <h2 id="mt-dialogo-titulo">{titulo}</h2>
        </div>
        <button type="button" className="dialogo-fechar" aria-label="Fechar" onClick={fechar}>
          <Icone icone={X} />
        </button>
      </header>
      <div className="dialogo-corpo">{children}</div>
      <footer className="dialogo-rodape">{rodape(fechar)}</footer>
    </dialog>
  )
}

/** Fecha o diálogo quando a ação deu certo (o servidor já revalidou a página). */
function useFecharAoConcluir(estado: EstadoAcao, aoFechar: () => void) {
  useEffect(() => {
    if (estado.ok) aoFechar()
    // aoFechar muda de identidade a cada render do pai; o gatilho é o "ok".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])
}

// --------------------------------------------------------------------- meta mensal

/**
 * Criar/editar meta mensal — `pop.AddEdita MetasMensais` (bTvyI, WF bTwBh). Defaults do mapa:
 * nível = o do vendedor escolhido (bTvyl), valor = meta de referência do nível (bTvyr).
 * O período é um mês inteiro (metas [DÚVIDA 19]).
 */
export function DialogoMeta({
  linha,
  mesPadrao,
  vendedores,
  niveis,
  aoFechar,
}: {
  linha: LinhaMeta | null
  mesPadrao: string
  vendedores: Vendedor[]
  niveis: Nivel[]
  aoFechar: () => void
}) {
  const [estado, salvar, salvando] = useActionStateComAviso(salvarMeta, 'Salvando meta…')
  const [estadoApagar, apagar, apagando] = useActionStateComAviso(apagarMeta, 'Apagando meta…')
  useFecharAoConcluir(estado, aoFechar)
  useFecharAoConcluir(estadoApagar, aoFechar)

  const [vendedorId, setVendedorId] = useState(linha?.vendedor_id ?? '')
  const [nivelId, setNivelId] = useState(linha?.nivel_id ?? '')
  const [valor, setValor] = useState(linha ? linha.valor_meta.replace('.', ',') : '')

  const elegiveis = vendedores.filter((v) => v.elegivel || v.id === linha?.vendedor_id)

  function escolherVendedor(id: string) {
    setVendedorId(id)
    if (linha) return
    const nivel = vendedores.find((v) => v.id === id)?.nivel_vendedor_id
    if (nivel) escolherNivel(nivel)
  }
  function escolherNivel(id: string) {
    setNivelId(id)
    const n = niveis.find((x) => x.id === id)
    if (n && !linha) setValor(n.meta_venda.replace('.', ','))
  }

  return (
    <Dialogo
      titulo={linha ? 'Editar meta' : 'Nova meta mensal'}
      subtitulo="Metas mensais"
      aoFechar={aoFechar}
      teste="dialogo-meta"
      rodape={(fechar) => (
        <>
          {linha ? (
            <form
              action={apagar}
              onSubmit={(e) => {
                if (!window.confirm('Apagar esta meta? Não dá para desfazer.')) e.preventDefault()
              }}
            >
              <input type="hidden" name="id" value={linha.meta_mensal_id} />
              <button type="submit" className="botao-perigo" disabled={apagando} aria-busy={apagando}>
                {apagando ? 'Apagando…' : 'Apagar'}
              </button>
            </form>
          ) : null}
          <button type="button" className="botao-secundario empurra" onClick={fechar}>
            Fechar
          </button>
          <button
            type="submit"
            form="form-meta"
            className="botao-primario"
            disabled={salvando}
            aria-busy={salvando}
            data-teste="gravar-meta"
          >
            {salvando ? 'Gravando…' : 'Gravar'}
          </button>
        </>
      )}
    >
      <form
        id="form-meta"
        className="mt-form"
        noValidate
        // onSubmit, e não action=: o React 19 limparia o formulário também no erro (como em /produtos).
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          startTransition(() => salvar(f))
        }}
      >
        {linha ? <input type="hidden" name="id" value={linha.meta_mensal_id} /> : null}
        <div className="mt-campos">
          <label className="campo">
            <span>Mês</span>
            <input
              type="month"
              name="mes"
              defaultValue={linha ? linha.competencia.slice(0, 7) : mesPadrao}
              required
              data-teste="campo-mes"
            />
          </label>
          <label className="campo">
            <span>Tipo de meta</span>
            <select name="tipo_meta_id" defaultValue={linha?.tipo_meta_id ?? 1} required data-teste="campo-tipo">
              <option value={1}>Regular</option>
              <option value={2}>Substituição</option>
            </select>
          </label>
          <label className="campo mt-largo">
            <span>Vendedor</span>
            <select
              name="vendedor_id"
              value={vendedorId}
              onChange={(e) => escolherVendedor(e.target.value)}
              required
              data-teste="campo-vendedor"
            >
              <option value="">Escolha…</option>
              {elegiveis.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Nível</span>
            <select
              name="nivel_id"
              value={nivelId}
              onChange={(e) => escolherNivel(e.target.value)}
              required
              data-teste="campo-nivel"
            >
              <option value="">{niveis.length ? 'Escolha…' : 'Nenhum nível cadastrado'}</option>
              {niveis.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Valor da meta (R$)</span>
            <input
              name="valor_meta"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              required
              autoComplete="off"
              data-teste="campo-valor"
            />
          </label>
        </div>
        <p className="mt-nota">
          O nível fica congelado na meta: é ele que dá o fator de comissão no fechamento. Meta fechada não muda —
          cancele o fechamento antes.
        </p>
        <Mensagem estado={estado} />
        <Mensagem estado={estadoApagar} />
      </form>
    </Dialogo>
  )
}

// ---------------------------------------------------------------------- fechamento

/**
 * Confirmação de fechamento com o cálculo ANTES (spec §9.2 `DialogConfirmarFechamento`). O
 * cálculo vem de `fn_calculo_meta`; o fechamento recalcula no servidor (D4/D7) — se uma entrega
 * entrar entre a conferência e o clique, vale o número do servidor.
 */
export function DialogoFechar({
  linha,
  nome,
  aoFechar,
}: {
  linha: LinhaMeta
  nome: string
  aoFechar: () => void
}) {
  const [estado, fechar, fechando] = useActionStateComAviso(fecharMeta, 'Fechando meta…')
  const [calc, setCalc] = useState<{ calculo: Calculo } | { erro: string } | null>(null)
  useFecharAoConcluir(estado, aoFechar)

  useEffect(() => {
    let vivo = true
    calcularFechamento(linha.meta_mensal_id).then((r) => {
      if (vivo) setCalc(r)
    })
    return () => {
      vivo = false
    }
  }, [linha.meta_mensal_id])

  const c = calc && 'calculo' in calc ? calc.calculo : null
  const semEntrega = c !== null && c.qtd_entregas === 0

  return (
    <Dialogo
      titulo={`Fechar meta — ${nome}`}
      subtitulo={`${nomeDoMes(linha.competencia)} · ${linha.tipo_meta_id === 2 ? 'Substituição' : 'Regular'}`}
      aoFechar={aoFechar}
      teste="dialogo-fechar"
      rodape={(sair) => (
        <>
          <button type="button" className="botao-secundario empurra" onClick={sair}>
            Voltar
          </button>
          <button
            type="submit"
            form="form-fechar"
            className="botao-primario"
            disabled={!c || semEntrega || fechando}
            aria-busy={fechando}
            data-teste="confirmar-fechamento"
          >
            {fechando ? 'Fechando…' : 'Confirmar fechamento'}
          </button>
        </>
      )}
    >
      {!calc ? (
        <p className="mt-nota" aria-busy="true">
          Calculando…
        </p>
      ) : 'erro' in calc ? (
        <p className="aviso" data-tom="erro" role="alert">
          {calc.erro}
        </p>
      ) : (
        <form
          id="form-fechar"
          className="mt-form"
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            startTransition(() => fechar(f))
          }}
        >
          <input type="hidden" name="id" value={linha.meta_mensal_id} />
          <dl className="mt-calculo" data-teste="calculo-fechamento">
            <div>
              <dt>Período da meta</dt>
              <dd>
                {formatarData(linha.periodo_inicio)} a {formatarData(linha.periodo_fim)}
              </dd>
            </div>
            <div>
              <dt>Entregas no período</dt>
              <dd className="mt-num">{c!.qtd_entregas}</dd>
            </div>
            <div>
              <dt>Meta</dt>
              <dd className="mt-num">{formatarReais(linha.valor_meta)}</dd>
            </div>
            <div>
              <dt>Realizado (comissão MegaBox)</dt>
              <dd className="mt-num">{formatarReais(c!.realizado)}</dd>
            </div>
            <div>
              <dt>Atingimento</dt>
              <dd className="mt-num">
                {formatarPercentual(c!.percentual)} {c!.meta_batida ? '· meta batida' : '· meta não batida'}
              </dd>
            </div>
            <div>
              <dt>Fator do nível</dt>
              <dd className="mt-num">{formatarPercentual(c!.fator, 2)}</dd>
            </div>
            <div className="mt-destaque">
              <dt>Comissão do vendedor</dt>
              <dd className="mt-num" data-teste="comissao-fechamento">
                {formatarReais(c!.comissao_vendedor)}
              </dd>
            </div>
            <div>
              <dt>Conta</dt>
              <dd className="mt-num">
                {formatarReais(c!.realizado)} × {formatarPercentual(c!.fator, 2)}, arredondado ao centavo
              </dd>
            </div>
          </dl>
          {semEntrega ? (
            <p className="aviso">Não há entrega no período da meta: nada a fechar.</p>
          ) : (
            <label className="caixa">
              <input type="checkbox" name="gerar_conta_pagar" defaultChecked data-teste="gerar-cp" />
              Lançar a comissão em contas a pagar (vence em {formatarData(c!.vencimento)})
            </label>
          )}
          <p className="mt-nota">
            Fechar congela estes valores e vincula as entregas à meta. Se alguma entrega já foi paga ao vendedor
            pela comissão da própria entrega, o banco recusa e nada é gravado.
          </p>
          <Mensagem estado={estado} />
        </form>
      )}
    </Dialogo>
  )
}

/** Cancelar fechamento — `pop apaga meta fechada` (bTzix, WF bTzkZ), só Diretor, agora com motivo. */
export function DialogoCancelar({
  linha,
  nome,
  aoFechar,
}: {
  linha: LinhaMeta
  nome: string
  aoFechar: () => void
}) {
  const [estado, cancelar, cancelando] = useActionStateComAviso(cancelarFechamento, 'Cancelando fechamento…')
  useFecharAoConcluir(estado, aoFechar)
  return (
    <Dialogo
      titulo="Atenção!"
      subtitulo={`Cancelar fechamento — ${nome}, ${nomeDoMes(linha.competencia)}`}
      aoFechar={aoFechar}
      teste="dialogo-cancelar"
      rodape={(sair) => (
        <>
          <button type="button" className="botao-secundario empurra" onClick={sair}>
            Não
          </button>
          <button
            type="submit"
            form="form-cancelar"
            className="botao-perigo"
            disabled={cancelando}
            aria-busy={cancelando}
            data-teste="confirmar-cancelamento"
          >
            {cancelando ? 'Cancelando…' : 'Sim, cancelar fechamento'}
          </button>
        </>
      )}
    >
      <form
        id="form-cancelar"
        className="mt-form"
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          startTransition(() => cancelar(f))
        }}
      >
        <input type="hidden" name="meta_fechada_id" value={linha.meta_fechada_id ?? ''} />
        <p className="mt-sem-margem">
          A meta volta a aberta, as entregas se soltam e a conta a pagar da comissão (
          {formatarReais(linha.comissao_vendedor)}) é <strong>cancelada</strong> — não apagada. Se ela já teve
          baixa, o cancelamento é recusado: estorne no financeiro antes.
        </p>
        <label className="campo">
          <span>Motivo (obrigatório)</span>
          <textarea name="motivo" rows={3} maxLength={500} required data-teste="campo-motivo" />
        </label>
        <Mensagem estado={estado} />
      </form>
    </Dialogo>
  )
}

// --------------------------------------------------------------------------- níveis

/**
 * Uma linha da tabela de níveis. Os campos ficam nas células e se ligam ao <form> da última
 * célula pelo atributo `form` (um <form> não pode envolver um <tr>): o cabeçalho da tabela
 * nomeia as colunas uma vez só, e cada campo leva o nome completo em `aria-label`.
 */
function LinhaNivel({ nivel, aoGravar }: { nivel: Nivel | null; aoGravar: () => void }) {
  const [estado, salvar, salvando] = useActionStateComAviso(salvarNivel, 'Salvando nível…')
  const formId = useId()
  useEffect(() => {
    if (estado.ok) aoGravar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])
  const pct = (f: string | undefined) => (f ? formatarPercentual(f, 2).replace('%', '') : '')
  const quem = nivel ? `do nível ${nivel.nome}` : 'do novo nível'
  return (
    <>
      <tr data-novo={nivel ? undefined : ''} data-teste={nivel ? 'form-nivel' : 'form-nivel-novo'}>
        <td>
          <input form={formId} name="nome" defaultValue={nivel?.nome ?? ''} required maxLength={60} autoComplete="off" aria-label={`Nome ${quem}`} placeholder={nivel ? undefined : 'Novo nível'} />
        </td>
        <td>
          <input form={formId} name="ordem" type="number" min={1} defaultValue={nivel?.ordem ?? ''} required aria-label={`Ordem ${quem}`} />
        </td>
        <td>
          <input form={formId} name="meta_venda" inputMode="decimal" defaultValue={nivel ? nivel.meta_venda.replace('.', ',') : ''} required aria-label={`Meta de referência em reais ${quem}`} />
        </td>
        <td>
          <input form={formId} name="comissao_padrao" inputMode="decimal" defaultValue={pct(nivel?.comissao_padrao)} required aria-label={`Comissão padrão em % ${quem}`} />
        </td>
        <td>
          <input form={formId} name="comissao_meta_batida" inputMode="decimal" defaultValue={pct(nivel?.comissao_meta_batida)} required aria-label={`Comissão de meta batida em % ${quem}`} />
        </td>
        <td>
          <input form={formId} name="qtd_meta_batida" type="number" min={0} max={36} defaultValue={nivel?.qtd_meta_batida ?? 3} required aria-label={`Meses para subir ${quem}`} />
        </td>
        <td>
          <form
            id={formId}
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              startTransition(() => salvar(f))
            }}
          >
            {nivel ? <input type="hidden" name="id" value={nivel.id} /> : null}
            <button type="submit" className="botao-secundario" disabled={salvando} aria-busy={salvando}>
              {salvando ? 'Gravando…' : nivel ? 'Gravar' : 'Incluir'}
            </button>
          </form>
        </td>
      </tr>
      {estado.erro || estado.ok ? (
        <tr className="mt-niveis-msg">
          <td colSpan={7}>
            <Mensagem estado={estado} />
          </td>
        </tr>
      ) : null}
    </>
  )
}

function FormHistorico({ niveis, vendedores }: { niveis: Nivel[]; vendedores: Vendedor[] }) {
  const [estado, registrar, registrando] = useActionStateComAviso(registrarNivel, 'Registrando nível…')
  const hoje = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  return (
    <form
      className="mt-nivel-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        startTransition(() => registrar(f))
      }}
      data-teste="form-historico"
    >
      <label className="campo">
        <span>Vendedor</span>
        <select name="usuario_id" required defaultValue="">
          <option value="">Escolha…</option>
          {vendedores
            .filter((v) => v.elegivel)
            .map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
        </select>
      </label>
      <label className="campo">
        <span>Novo nível</span>
        <select name="nivel_id" required defaultValue="">
          <option value="">Escolha…</option>
          {niveis.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="campo">
        <span>A partir de</span>
        <input type="date" name="vigencia_inicio" defaultValue={hoje} required />
      </label>
      <label className="campo mt-largo">
        <span>Motivo</span>
        <input name="motivo" maxLength={500} autoComplete="off" />
      </label>
      <button type="submit" className="botao-secundario" disabled={registrando} aria-busy={registrando}>
        {registrando ? 'Gravando…' : 'Registrar nível'}
      </button>
      <div className="mt-nivel-msg">
        <Mensagem estado={estado} />
      </div>
    </form>
  )
}

/** Níveis de vendedor e histórico de nível — só perfil 1 (011 D10). */
export function DialogoNiveis({
  niveis,
  vendedores,
  historico,
  aoFechar,
}: {
  niveis: Nivel[]
  vendedores: Vendedor[]
  historico: HistoricoNivel[]
  aoFechar: () => void
}) {
  const [aba, setAba] = useState<'niveis' | 'historico'>('niveis')
  const [novo, setNovo] = useState(0) // remonta o formulário de inclusão depois de gravar
  const nomes = new Map(vendedores.map((v) => [v.id, v.nome]))
  const nomesNivel = new Map(niveis.map((n) => [n.id, n.nome]))
  return (
    <Dialogo
      titulo="Níveis de vendedor"
      subtitulo="Configuração de metas"
      largo
      aoFechar={aoFechar}
      teste="dialogo-niveis"
      rodape={(fechar) => (
        <button type="button" className="botao-secundario empurra" onClick={fechar}>
          Fechar
        </button>
      )}
    >
      <div className="abas mt-abas" role="tablist" aria-label="Seções">
        <button type="button" role="tab" aria-selected={aba === 'niveis'} onClick={() => setAba('niveis')}>
          Níveis ({niveis.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'historico'}
          onClick={() => setAba('historico')}
          data-teste="aba-historico"
        >
          Histórico de nível ({historico.length})
        </button>
      </div>

      {aba === 'niveis' ? (
        <div className="mt-secao">
          <p className="mt-nota">
            Comissão padrão vale quando o realizado fica abaixo da meta; a de meta batida, a partir de 100%. Os
            percentuais são gravados como fração. Mudar um nível não altera meta já fechada.
          </p>
          <div className="mt-niveis-rolagem">
            <table className="mt-niveis" data-teste="tabela-niveis">
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Ordem</th>
                  <th scope="col">Meta de referência (R$)</th>
                  <th scope="col">Comissão padrão (%)</th>
                  <th scope="col">Comissão meta batida (%)</th>
                  <th scope="col">Meses p/ subir</th>
                  <th scope="col">
                    <span className="so-leitor">Ação</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {niveis.map((n) => (
                  <LinhaNivel key={n.id} nivel={n} aoGravar={() => undefined} />
                ))}
                <LinhaNivel key={`novo-${novo}`} nivel={null} aoGravar={() => setNovo((k) => k + 1)} />
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-secao">
          <FormHistorico niveis={niveis} vendedores={vendedores} />
          {historico.length === 0 ? (
            <p className="mt-nota">Nenhuma vigência registrada.</p>
          ) : (
            <ul className="mt-itens" data-teste="lista-historico">
              {historico.map((h) => (
                <li key={h.id} className="mt-item mt-hist">
                  <strong>{nomes.get(h.usuario_id) ?? 'Vendedor'}</strong>
                  <span className="selo" data-tom={h.vigencia_fim ? undefined : 'ok'}>
                    {nomesNivel.get(h.nivel_id) ?? 'nível'}
                  </span>
                  <span>
                    {formatarData(h.vigencia_inicio)} → {h.vigencia_fim ? formatarData(h.vigencia_fim) : 'vigente'}
                  </span>
                  {h.motivo ? <small>{h.motivo}</small> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Dialogo>
  )
}
