/**
 * Prova que a RLS faz o que a spec diz — não só que ela está ligada.
 *
 * `service_role` ignora RLS, então ele não consegue testar policy nenhuma. Este script
 * autentica de verdade, com a conta de QA (.env: QA_EMAIL / QA_SENHA), e compara o que
 * o banco devolve com o que `specs/02-modelo-de-dados-proposto.md` §7 promete.
 *
 * Roda com o banco vazio e continua valendo depois da carga: cada caso afirma
 * permitido/negado, não uma quantidade de linhas.
 *
 *   node scripts/testar-rls.mjs
 */

import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const env = lerEnv()
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const casos = []
function caso(nome, esperado, obtido, detalhe = '') {
  const ok = esperado === obtido
  casos.push({ nome, esperado, obtido, ok, detalhe })
  const marca = ok ? 'ok  ' : 'FALHA'
  console.log(`  ${marca} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
  if (!ok && detalhe) console.log(`        ${detalhe}`)
}

/** 'permitido' quando a consulta volta sem erro; 'negado' quando o banco recusa. */
async function ler(cliente, tabela) {
  const { error } = await cliente.from(tabela).select('*').limit(1)
  if (!error) return 'permitido'
  return 'negado'
}

async function main() {
  console.log('\nSem sessão (papel anon) — nenhuma policy é `to anon` (02 §7.3):')
  const anonimo = createClient(URL, ANON, { auth: { persistSession: false } })
  for (const t of [
    'perfis',
    'usuarios',
    'permissoes_pagina',
    'config_sistema',
    'auditoria',
    'integracao_tokens',
  ]) {
    caso(`anon lê ${t}`, 'negado', await ler(anonimo, t))
  }

  console.log('\nCom sessão (conta de QA, perfil 1):')
  const usuario = createClient(URL, ANON, { auth: { persistSession: false } })
  const { data: sessao, error: erroLogin } = await usuario.auth.signInWithPassword({
    email: env.QA_EMAIL,
    password: env.QA_SENHA,
  })
  if (erroLogin) {
    console.error(`  FALHA  não consegui autenticar: ${erroLogin.message}`)
    process.exitCode = 1
    return
  }
  const meuId = sessao.user.id

  // Nível domínio: usuário ativo lê as listas fixas (02 §7.2).
  caso('autenticado lê perfis', 'permitido', await ler(usuario, 'perfis'))
  caso('autenticado lê departamentos', 'permitido', await ler(usuario, 'departamentos'))
  caso('autenticado lê paginas', 'permitido', await ler(usuario, 'paginas'))

  // Nível fechado: nem autenticado entra (02 §7.2).
  caso('autenticado lê integracao_tokens', 'negado', await ler(usuario, 'integracao_tokens'))
  caso('autenticado lê auditoria', 'negado', await ler(usuario, 'auditoria'))

  // A própria linha é legível.
  const { data: eu } = await usuario.from('usuarios').select('id, nome, perfil_id').eq('id', meuId)
  caso('autenticado lê a própria linha em usuarios', 'permitido', eu?.length ? 'permitido' : 'negado')

  // Não pode trocar o próprio perfil: é o auto-binding que derrubou o Bubble (02 §2.1).
  const { error: erroEscalar } = await usuario
    .from('usuarios')
    .update({ perfil_id: 1 })
    .eq('id', meuId)
  // Perfil 1 PODE atualizar usuários — o teste real de escalada é com perfil 4,
  // que a fatia 0 cria quando houver outro usuário. Aqui só registramos o estado.
  console.log(
    `        (informativo) update da própria linha por perfil 1: ${erroEscalar ? 'negado' : 'permitido'}`,
  )

  // A função de autorização responde pelo usuário autenticado.
  const { data: podeVendas, error: erroRpc } = await usuario.rpc('fn_pode_acessar_pagina', {
    p_slug: 'vendas',
  })
  caso(
    'fn_pode_acessar_pagina("vendas") para quem tem a concessão',
    'permitido',
    !erroRpc && podeVendas === true ? 'permitido' : 'negado',
    erroRpc?.message,
  )

  const { data: podeInexistente } = await usuario.rpc('fn_pode_acessar_pagina', {
    p_slug: 'pagina-que-nao-existe',
  })
  caso(
    'fn_pode_acessar_pagina() de página sem concessão',
    'negado',
    podeInexistente === true ? 'permitido' : 'negado',
  )

  await usuario.auth.signOut()

  const falhas = casos.filter((c) => !c.ok)
  console.log(`\n${casos.length - falhas.length}/${casos.length} casos como a spec promete.`)
  if (falhas.length > 0) process.exitCode = 1
}

await main()
