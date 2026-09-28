/**
 * Provedores de envio. PURO (o `fetch` é injetado), para o vitest poder provar o payload do
 * Resend sem rede. A escolha do provedor pelo ambiente está em `escolherProvedor`.
 *
 * Padrão = `registro`: NÃO envia, grava uma linha de log estruturado sem corpo e sem
 * endereços. Só `EMAIL_MODO=envio` (com RESEND_API_KEY e EMAIL_REMETENTE) liga o Resend.
 */

import { formatarRemetente } from './modelo'

export interface AnexoPronto {
  nome: string
  conteudo: Uint8Array
}

export interface MensagemPronta {
  /** id da linha em email_outbox: é a chave de idempotência no provedor. */
  id: string
  remetenteNome: string | null
  para: string[]
  cc: string[]
  bcc: string[]
  responderPara: string | null
  assunto: string
  html: string
  anexos: AnexoPronto[]
}

export type ResultadoEnvio =
  | { ok: true; provedorId: string }
  /** definitivo = não adianta repetir (ex.: 422 de validação). */
  | { ok: false; erro: string; definitivo: boolean }

export interface Provedor {
  nome: 'resend' | 'registro'
  /** true só quando a mensagem sai de verdade. `registro` → status `registrado`. */
  enviaDeVerdade: boolean
  enviar(m: MensagemPronta): Promise<ResultadoEnvio>
}

// ------------------------------------------------------------------------------ registro
export function provedorRegistro(log: (linha: string) => void = console.log): Provedor {
  return {
    nome: 'registro',
    enviaDeVerdade: false,
    async enviar(m) {
      // Sem corpo, sem assunto e sem endereços: log vai para a Vercel e não é lugar de dado
      // de cliente. O id basta para achar a linha na fila.
      log(
        JSON.stringify({
          evento: 'email.registro',
          id: m.id,
          destinatarios: m.para.length + m.cc.length + m.bcc.length,
          anexos: m.anexos.length,
          bytes_anexos: m.anexos.reduce((s, a) => s + a.conteudo.byteLength, 0),
          bytes_corpo: m.html.length,
        }),
      )
      return { ok: true, provedorId: `registro:${m.id}` }
    },
  }
}

// -------------------------------------------------------------------------------- resend
export const RESEND_URL = 'https://api.resend.com/emails'

export function payloadResend(m: MensagemPronta, remetente: string) {
  return {
    from: formatarRemetente(m.remetenteNome, remetente),
    to: m.para,
    ...(m.cc.length ? { cc: m.cc } : {}),
    ...(m.bcc.length ? { bcc: m.bcc } : {}),
    ...(m.responderPara ? { reply_to: m.responderPara } : {}),
    subject: m.assunto,
    html: m.html,
    ...(m.anexos.length
      ? {
          attachments: m.anexos.map((a) => ({
            filename: a.nome,
            content: Buffer.from(a.conteudo).toString('base64'),
          })),
        }
      : {}),
  }
}

export function provedorResend(cfg: {
  chave: string
  remetente: string
  fetch?: typeof fetch
}): Provedor {
  const f = cfg.fetch ?? fetch
  return {
    nome: 'resend',
    enviaDeVerdade: true,
    async enviar(m) {
      let resposta: Response
      try {
        resposta = await f(RESEND_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cfg.chave}`,
            'Content-Type': 'application/json',
            // Mesma chave em toda tentativa da mesma linha: se o worker morrer depois de o
            // Resend aceitar e antes de gravar `enviado`, a repetição não duplica (24 h).
            'Idempotency-Key': `email_outbox/${m.id}`,
          },
          body: JSON.stringify(payloadResend(m, cfg.remetente)),
          signal: AbortSignal.timeout(20_000),
        })
      } catch (e) {
        return { ok: false, erro: `rede: ${(e as Error).message}`.slice(0, 500), definitivo: false }
      }

      const corpo = (await resposta.json().catch(() => null)) as
        | { id?: string; message?: string; name?: string }
        | null

      if (resposta.ok && corpo?.id) return { ok: true, provedorId: corpo.id }
      if (resposta.ok) {
        return { ok: false, erro: 'resend: resposta sem id', definitivo: false }
      }

      const erro = `resend ${resposta.status}: ${corpo?.name ?? ''} ${corpo?.message ?? ''}`
        .trim()
        .slice(0, 500)
      // 429 (limite), 409 (idempotência concorrente) e 5xx passam; o resto é o pedido que está
      // errado (chave, domínio, endereço, anexo) e repetir não conserta.
      const transitorio =
        resposta.status === 429 || resposta.status === 409 || resposta.status >= 500
      return { ok: false, erro, definitivo: !transitorio }
    },
  }
}

// ------------------------------------------------------------------------------- escolha
export class ErroConfiguracaoEmail extends Error {}

/** process.env serve; os campos lidos são EMAIL_MODO, RESEND_API_KEY e EMAIL_REMETENTE. */
export type AmbienteEmail = Record<string, string | undefined>

/**
 * `EMAIL_MODO=envio` → Resend (exige RESEND_API_KEY e EMAIL_REMETENTE; faltando, ERRO — não
 * cai silenciosamente para registro, porque aí e-mail "enviado" nunca sairia). Qualquer outro
 * valor, ou ausente → registro.
 */
export function escolherProvedor(env: AmbienteEmail, fetchImpl?: typeof fetch): Provedor {
  if (env.EMAIL_MODO?.trim() !== 'envio') return provedorRegistro()
  const chave = env.RESEND_API_KEY?.trim()
  const remetente = env.EMAIL_REMETENTE?.trim()
  if (!chave || !remetente) {
    throw new ErroConfiguracaoEmail(
      'EMAIL_MODO=envio exige RESEND_API_KEY e EMAIL_REMETENTE no ambiente do servidor.',
    )
  }
  return provedorResend({ chave, remetente, fetch: fetchImpl })
}
