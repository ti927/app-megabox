import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ProvedorAvisoAcao } from '@/componentes/aviso-acao'
import { Casca } from '@/componentes/casca'
import { COOKIE_TEMA, lerTema } from '@/componentes/tema'
import { minhasConfiguracoes, minhasPaginas, usuarioAtual } from '@/lib/autorizacao'

import './casca.css'

/**
 * Casca das telas autenticadas.
 *
 * O menu é montado por `fn_minhas_paginas()`, no servidor. No Bubble o menu lista
 * tudo e desabilita por CSS o que o usuário não pode abrir — o item continua no DOM
 * e a URL continua funcionando (specs/00-achados-de-seguranca.md §2.3). Aqui, o que
 * a pessoa não pode abrir não é renderizado, e a trava de verdade é `exigirAcesso()`
 * no `page.tsx` de cada rota.
 */
export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioAtual()
  if (!usuario) redirect('/entrar')

  const [paginas, configuracoes, jar] = await Promise.all([
    minhasPaginas(),
    minhasConfiguracoes(),
    cookies(),
  ])

  return (
    <Casca
      usuario={usuario}
      paginas={paginas}
      configuracoes={configuracoes}
      tema={lerTema(jar.get(COOKIE_TEMA)?.value)}
    >
      {/* Aviso de ação (toast "Salvando…" → "Pronto"/erro) para todas as telas: useAcao(). */}
      <ProvedorAvisoAcao>{children}</ProvedorAvisoAcao>
    </Casca>
  )
}
