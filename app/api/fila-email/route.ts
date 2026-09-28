import { NextResponse, type NextRequest } from 'next/server'

import { processarFila } from '@/lib/email'
import { escolherProvedor } from '@/lib/email/provedor'
import { segredoConfere, tokenBearer } from '@/lib/email/segredo'

/**
 * Processador da fila de e-mail (db/019). NÃO tem sessão de usuário: quem chama é o Vercel
 * Cron (GET) ou um processo de servidor (POST). A única credencial é o segredo.
 *
 *   Authorization: Bearer <FILA_EMAIL_SEGREDO>
 *
 * Na Vercel, o Cron manda `Authorization: Bearer ${CRON_SECRET}` — por isso CRON_SECRET tem de
 * ter O MESMO valor de FILA_EMAIL_SEGREDO (ver o relatório da frente / vercel.json).
 *
 * GET              → processa a fila em lotes até esvaziar ou o orçamento de tempo acabar.
 * POST {ids: [..]} → processa só aquelas linhas (reenvio pontual, teste). {ids: []} não
 *                    processa nada e só devolve o modo (usado pelo teste para conferir que
 *                    está em `registro` antes de enfileirar).
 *
 * Segredo ausente ou curto → 503 (falha FECHADA: nunca processar sem autenticação).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function autorizar(req: NextRequest): NextResponse | null {
  const esperado = process.env.FILA_EMAIL_SEGREDO ?? ''
  if (esperado.length < 32) {
    return NextResponse.json({ erro: 'fila de e-mail desligada' }, { status: 503 })
  }
  if (!segredoConfere(tokenBearer(req.headers.get('authorization')), esperado)) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 })
  }
  return null
}

async function executar(ids: string[] | null) {
  try {
    if (ids && ids.length === 0) {
      return NextResponse.json({ modo: escolherProvedor(process.env).nome, lotes: 0 })
    }
    const r = await processarFila({ ids })
    return NextResponse.json(r)
  } catch (e) {
    console.error(JSON.stringify({ evento: 'email.fila.erro', erro: (e as Error).message }))
    return NextResponse.json({ erro: 'falha ao processar a fila' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const negado = autorizar(req)
  if (negado) return negado
  return executar(null)
}

export async function POST(req: NextRequest) {
  const negado = autorizar(req)
  if (negado) return negado

  const corpo = (await req.json().catch(() => null)) as { ids?: unknown } | null
  const ids = corpo?.ids
  if (
    !Array.isArray(ids) ||
    ids.length > 100 ||
    !ids.every((x): x is string => typeof x === 'string' && UUID.test(x))
  ) {
    return NextResponse.json({ erro: 'corpo esperado: {"ids": [uuid, ...]} (até 100)' }, { status: 400 })
  }
  return executar(ids)
}
