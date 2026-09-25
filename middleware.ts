import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLICAS = ['/entrar', '/recuperar-senha', '/formulario']

/**
 * Renova a sessão a cada navegação e barra quem não tem sessão nenhuma.
 *
 * Isto é a primeira camada, não a autorização. Quem decide se ESTE usuário pode ver
 * ESTA página é `exigirAcesso()` no servidor, junto da consulta — ver lib/autorizacao.ts.
 */
export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(itens) {
          for (const { name, value } of itens) request.cookies.set(name, value)
          resposta = NextResponse.next({ request })
          for (const { name, value, options } of itens) {
            resposta.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // getUser() valida o token no servidor. Não usar getSession() aqui: ele confia no
  // cookie sem verificar, e o cookie vem do navegador.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const caminho = request.nextUrl.pathname
  const ehPublica = PUBLICAS.some((p) => caminho === p || caminho.startsWith(`${p}/`))

  if (!user && !ehPublica) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/entrar'
    // Guarda para onde a pessoa queria ir, e volta para lá depois de entrar.
    if (caminho !== '/') destino.searchParams.set('proximo', caminho)
    return NextResponse.redirect(destino)
  }

  if (user && caminho === '/entrar') {
    const destino = request.nextUrl.clone()
    destino.pathname = '/inicio'
    destino.search = ''
    return NextResponse.redirect(destino)
  }

  return resposta
}

export const config = {
  matcher: [
    // Tudo, menos estático e imagem.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
