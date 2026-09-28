'use client'

import { useActionState, useState, useSyncExternalStore } from 'react'
import { useFormStatus } from 'react-dom'

import {
  COMENTARIO_MAX,
  MENSAGENS,
  perguntasDoTipo,
  resultadoFinal,
  type CampoNota,
  type TipoPesquisa,
} from '@/lib/formulario-publico'

import { AvisoPesquisa } from '../aviso'
import { responderPesquisa, type EstadoFormulario } from './acoes'

const NOTAS = Array.from({ length: 11 }, (_, n) => n)

const semAssinatura = () => () => {}

/**
 * "Enviar" só liga depois de a página hidratar. Motivo: a página usa Referrer-Policy
 * no-referrer (o token está na URL), e com ela o navegador manda `Origin: null` no POST
 * nativo de formulário; o tratador de server action do Next faz `new URL(origin)` e
 * devolve 500 ("Invalid URL"). Depois de hidratar, o envio é por fetch, que manda a
 * Origin de verdade. Desligado, o botão também bloqueia o envio implícito (Enter num rádio).
 */
function BotaoEnviar() {
  const { pending } = useFormStatus()
  const hidratado = useSyncExternalStore(semAssinatura, () => true, () => false)
  return (
    <button
      type="submit"
      className="botao-primario pesq-enviar"
      disabled={pending || !hidratado}
      aria-busy={pending || undefined}
      data-teste="pesq-enviar"
    >
      {pending ? 'Enviando…' : 'Enviar'}
    </button>
  )
}

/**
 * Formulário do cliente. As notas são rádios nativos (0–10) dentro de <fieldset>: teclado
 * (setas), leitor de tela e envio sem JavaScript de graça — substituem os 33 workflows e
 * 66 condicionais do Bubble (formularios-publicos §8.2).
 *
 * Campos NÃO controlados de propósito: o toque que o cliente dá antes de a página
 * hidratar (celular lento) não é desfeito pelo React. O envio espera a hidratação (ver
 * BotaoEnviar).
 * A validação aqui é só UX; a server action e fn_pesquisa_responder validam de novo.
 */
export function TelaFormulario({ token, tipo }: { token: string; tipo: TipoPesquisa }) {
  const [estado, acao] = useActionState<EstadoFormulario, FormData>(responderPesquisa, {})
  // Cada volta do servidor remonta o formulário com os valores que o cliente mandou
  // (o React reinicia o <form> depois da action). Ajuste de estado durante o render.
  const [versao, setVersao] = useState({ estado, n: 0 })
  if (versao.estado !== estado) setVersao({ estado, n: versao.n + 1 })

  if (estado.resultado && resultadoFinal(estado.resultado)) {
    return <AvisoPesquisa resultado={estado.resultado} />
  }

  return <Formulario key={versao.n} token={token} tipo={tipo} estado={estado} acao={acao} />
}

function Formulario({
  token,
  tipo,
  estado,
  acao,
}: {
  token: string
  tipo: TipoPesquisa
  estado: EstadoFormulario
  acao: (dados: FormData) => void
}) {
  const perguntas = perguntasDoTipo(tipo)
  const inicial = estado.valores
  const [faltando, setFaltando] = useState<Set<CampoNota>>(() => new Set(estado.faltando ?? []))
  const [tamanho, setTamanho] = useState(inicial?.comentario.length ?? 0)

  function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    const dados = new FormData(e.currentTarget)
    const semNota = perguntas.map((p) => p.campo).filter((c) => !dados.get(c))
    setFaltando(new Set(semNota))
    if (semNota.length > 0) {
      e.preventDefault()
      e.currentTarget.querySelector<HTMLInputElement>(`input[name="${semNota[0]}"]`)?.focus()
    }
  }

  function aoEscolher(campo: CampoNota) {
    setFaltando((atual) => {
      if (!atual.has(campo)) return atual
      const novo = new Set(atual)
      novo.delete(campo)
      return novo
    })
  }

  const erroGeral =
    estado.resultado && estado.resultado !== 'dados_invalidos' ? MENSAGENS[estado.resultado] : null

  return (
    <form action={acao} onSubmit={aoEnviar} className="pesq-form" noValidate data-teste="pesq-form">
      <header className="pesq-intro">
        <h1>Olá!</h1>
        <p>Sua opinião é muito importante para nós!</p>
      </header>

      <input type="hidden" name="token" value={token} />

      {perguntas.map((p) => {
        const comErro = faltando.has(p.campo)
        const idErro = `erro-${p.campo}`
        return (
          <fieldset
            key={p.campo}
            className="pesq-pergunta"
            data-erro={comErro || undefined}
            aria-describedby={comErro ? idErro : undefined}
          >
            <legend>{p.texto}</legend>
            <div className="pesq-escala">
              {NOTAS.map((n) => (
                <label key={n} className="pesq-nota">
                  <input
                    type="radio"
                    name={p.campo}
                    value={n}
                    defaultChecked={inicial?.notas[p.campo] === n}
                    onChange={() => aoEscolher(p.campo)}
                    aria-label={`Nota ${n}`}
                  />
                  <span aria-hidden="true">{n}</span>
                </label>
              ))}
            </div>
            <div className="pesq-legenda" aria-hidden="true">
              <span>0 — nada satisfeito</span>
              <span>10 — muito satisfeito</span>
            </div>
            {comErro ? (
              <p id={idErro} className="pesq-erro-campo">
                Escolha uma nota de 0 a 10.
              </p>
            ) : null}
          </fieldset>
        )
      })}

      <label className="campo pesq-comentario">
        <span>Comentários adicionais e sugestões (opcional)</span>
        <textarea
          name="comentario"
          rows={4}
          maxLength={COMENTARIO_MAX}
          placeholder="Escreva aqui"
          defaultValue={inicial?.comentario}
          onInput={(e) => setTamanho(e.currentTarget.value.length)}
          aria-describedby="pesq-contador"
          aria-invalid={estado.comentarioLongo || undefined}
        />
      </label>
      <p id="pesq-contador" className="pesq-contador">
        {tamanho} / {COMENTARIO_MAX} caracteres
      </p>
      {estado.comentarioLongo ? (
        <p className="pesq-erro-campo">O comentário passou de {COMENTARIO_MAX} caracteres.</p>
      ) : null}

      {erroGeral ? (
        <p className="aviso" data-tom="erro" role="alert" data-teste="pesq-erro">
          <strong>{erroGeral.titulo}.</strong> {erroGeral.texto}
        </p>
      ) : null}
      {faltando.size > 0 ? (
        <p className="aviso" data-tom="erro" role="alert">
          {MENSAGENS.dados_invalidos.texto}
        </p>
      ) : null}

      <BotaoEnviar />

      <p className="pesq-lgpd">
        Suas respostas são usadas pelo Grupo MegaBox só para melhorar o atendimento. Não
        pedimos nenhum dado pessoal aqui.
      </p>
    </form>
  )
}
