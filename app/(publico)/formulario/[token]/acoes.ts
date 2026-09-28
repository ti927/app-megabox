'use server'

import { headers } from 'next/headers'

import {
  COMENTARIO_MAX,
  LimitePorChave,
  USER_AGENT_MAX,
  lerComentario,
  lerNota,
  lerResultadoBanco,
  resultadoFinal,
  tokenComFormatoValido,
  validarNotas,
  type CampoNota,
  type Notas,
  type ResultadoEnvio,
} from '@/lib/formulario-publico'
import {
  byteaHex,
  hashDoIp,
  hashDoToken,
  ipDosCabecalhos,
  segredoDoIp,
} from '@/lib/formulario-publico-servidor'
import { clienteAdmin } from '@/lib/supabase/admin'

import { consultarConvite } from './convite'

export type EstadoFormulario = {
  resultado?: ResultadoEnvio
  /** Perguntas sem nota válida (só com resultado 'dados_invalidos'). */
  faltando?: CampoNota[]
  comentarioLongo?: boolean
  /**
   * O que o próprio cliente acabou de mandar, devolvido só quando o formulário continua na
   * tela (dados inválidos, limite, erro): o React reinicia o form depois da action, e sem
   * isto o cliente perderia as notas e o comentário.
   */
  valores?: { notas: Notas; comentario: string }
}

/*
 * LIMITE POR IP E POR TOKEN — em memória, por instância (ver LimitePorChave).
 * Em serverless NÃO é global: cada instância quente tem o seu. Segura flood de uma origem;
 * o limite global exigiria contador compartilhado (tabela ou KV). A chave é o HMAC do IP,
 * nunca o IP em claro. Quem envia legitimamente manda 1 ou 2 vezes.
 */
const DEZ_MINUTOS = 10 * 60 * 1000
const limitePorIp = new LimitePorChave(10, DEZ_MINUTOS)
const limitePorToken = new LimitePorChave(5, DEZ_MINUTOS)

const CAMPOS: CampoNota[] = ['nota_nps', 'nota_atendimento', 'nota_produto']

/**
 * Envio do formulário público. A ÚNICA escrita é `fn_pesquisa_responder` (db/013), com
 * service_role, que refaz toda validação dentro de uma transação com o convite travado.
 *
 * Nada aqui escreve em log: nem token, nem IP, nem resposta. Erros voltam como código.
 */
export async function responderPesquisa(
  _anterior: EstadoFormulario,
  form: FormData,
): Promise<EstadoFormulario> {
  const estado = await processar(form)
  if (!estado.resultado || resultadoFinal(estado.resultado)) return estado

  const notas: Notas = {}
  for (const campo of CAMPOS) {
    const nota = lerNota(form.get(campo))
    if (typeof nota === 'number') notas[campo] = nota
  }
  const comentario = form.get('comentario')
  return {
    ...estado,
    valores: {
      notas,
      comentario: typeof comentario === 'string' ? comentario.slice(0, COMENTARIO_MAX * 2) : '',
    },
  }
}

async function processar(form: FormData): Promise<EstadoFormulario> {
  const token = form.get('token')
  if (!tokenComFormatoValido(token)) return { resultado: 'invalido' }

  const cabecalhos = await headers()
  let ipHash: string
  try {
    ipHash = hashDoIp(ipDosCabecalhos((n) => cabecalhos.get(n)), segredoDoIp(process.env))
  } catch {
    return { resultado: 'erro' }
  }

  if (!limitePorIp.tentar(`ip:${ipHash}`) || !limitePorToken.tentar(`tk:${hashDoToken(token)}`)) {
    return { resultado: 'limite' }
  }

  const agente = cabecalhos.get('user-agent')
  const chamar = (notas: Notas, comentario: string | null) =>
    clienteAdmin().rpc('fn_pesquisa_responder', {
      p_token: token,
      p_nota_nps: notas.nota_nps ?? null,
      p_nota_atendimento: notas.nota_atendimento ?? null,
      p_nota_produto: notas.nota_produto ?? null,
      p_comentario: comentario,
      p_ip_hash: byteaHex(ipHash),
      p_user_agent: agente ? [...agente].slice(0, USER_AGENT_MAX).join('') : null,
    })

  try {
    // O tipo vem do BANCO, nunca do formulário: decide quais notas contam. Nota de pergunta
    // que não é do tipo é descartada aqui e não chega à resposta.
    const convite = await consultarConvite(token)
    if (convite.estado !== 'aberto') {
      // Deixa o banco responder (e contar a tentativa em pesquisa_convites.tentativas):
      // ele é a autoridade e a resposta vem igual para inexistente/cancelado.
      const { data, error } = await chamar({}, null)
      return { resultado: error ? 'erro' : lerResultadoBanco(data) }
    }

    const notas = validarNotas(convite.tipo, {
      nota_nps: form.get('nota_nps'),
      nota_atendimento: form.get('nota_atendimento'),
      nota_produto: form.get('nota_produto'),
    })
    const comentario = lerComentario(form.get('comentario'))
    if (!notas.ok || comentario === 'longo') {
      return {
        resultado: 'dados_invalidos',
        faltando: notas.ok ? [] : notas.faltando,
        comentarioLongo: comentario === 'longo',
      }
    }

    const { data, error } = await chamar(notas.notas, comentario)
    if (error) return { resultado: 'erro' }
    return { resultado: lerResultadoBanco(data) }
  } catch {
    return { resultado: 'erro' }
  }
}
