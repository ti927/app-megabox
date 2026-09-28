/**
 * Parte de SERVIDOR do formulário público: hash do token e do IP.
 *
 * Usa `node:crypto`, então não entra em bundle de navegador (a tela importa só
 * `lib/formulario-publico.ts`). Não lê variável de ambiente nem guarda segredo: quem chama
 * passa o segredo — assim estas funções ficam puras e testáveis.
 */

import { createHash, createHmac } from 'node:crypto'

/**
 * sha256 do token (utf-8), em hex. É exatamente o que `pesquisa_convites.token_hash` guarda
 * (`pg_catalog.sha256(convert_to(token, 'UTF8'))`, db/013).
 */
export function hashDoToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

/** Literal bytea que o PostgREST aceita para filtro ou parâmetro: `\x` + hex. */
export function byteaHex(hex: string): string {
  return `\\x${hex}`
}

/**
 * HMAC-SHA256 do IP com um segredo do servidor, em hex.
 *
 * NÃO é sha256 puro: o espaço de IPv4 tem 2³² endereços e um sha256 sem segredo se
 * desfaz por força bruta em minutos. Com HMAC, quem lê `pesquisa_respostas.ip_hash` sem o
 * segredo não recupera o IP; quem tem o segredo só consegue CORRELACIONAR (mesmo IP →
 * mesmo hash), que é o uso pretendido (formularios-publicos §7.4.7). O IP em claro nunca é
 * gravado nem logado.
 */
export function hashDoIp(ip: string, segredo: string): string {
  if (!segredo) throw new Error('hashDoIp exige segredo do servidor')
  return createHmac('sha256', segredo).update(`ip:${ip.trim().toLowerCase()}`).digest('hex')
}

/**
 * Segredo do HMAC do IP. Se existir `PESQUISA_IP_SEGREDO`, usa; senão deriva de
 * `SUPABASE_SERVICE_ROLE_KEY` com rótulo próprio (nunca usa a chave crua como chave de
 * outra coisa). Trocar a chave de serviço muda os hashes novos — aceitável: o hash serve
 * para correlação recente, não para identidade permanente.
 */
export function segredoDoIp(env: Record<string, string | undefined>): string {
  const proprio = env.PESQUISA_IP_SEGREDO
  if (proprio) return proprio
  const base = env.SUPABASE_SERVICE_ROLE_KEY
  if (!base) throw new Error('SUPABASE_SERVICE_ROLE_KEY é obrigatória no servidor.')
  return createHmac('sha256', base).update('megabox/formulario-publico/ip-hash/v1').digest('hex')
}

/**
 * IP do cliente a partir dos cabeçalhos. Na Vercel `x-real-ip` é posto pela plataforma;
 * `x-forwarded-for` fica de reserva (primeiro item). Sem cabeçalho → 'desconhecido' (um
 * balde só: em dev local todo mundo é o mesmo IP de qualquer jeito).
 */
export function ipDosCabecalhos(obter: (nome: string) => string | null): string {
  const real = obter('x-real-ip')?.trim()
  if (real) return real
  const encaminhado = obter('x-forwarded-for')?.split(',')[0]?.trim()
  return encaminhado || 'desconhecido'
}
