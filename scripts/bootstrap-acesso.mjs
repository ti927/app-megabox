/**
 * Bootstrap de acesso.
 *
 * A migration 001 não semeia `permissoes_pagina` de propósito: conceder acesso é
 * decisão de negócio, e semear "todo mundo vê tudo" reproduziria o defeito do Bubble
 * (specs/00-achados-de-seguranca.md §2.3). A consequência é que, num banco recém
 * migrado, **ninguém entra**. Este script resolve isso de forma explícita e auditável.
 *
 * O que ele faz, de forma idempotente:
 *   1. cria (ou encontra) a conta no Supabase Auth;
 *   2. cria (ou atualiza) a linha em `usuarios` com perfil e departamento;
 *   3. concede as páginas pedidas em `permissoes_pagina`.
 *
 * Usa service_role, que ignora RLS — é o único jeito de dar a primeira permissão,
 * já que a policy de escrita exige um perfil 1 que ainda não existe. Roda só no
 * servidor, nunca no navegador (CLAUDE.md regra 4).
 *
 * Uso:
 *   node scripts/bootstrap-acesso.mjs --email pessoa@empresa.com --nome "Nome" \
 *        [--perfil 1] [--depto 1] [--paginas todas] [--senha ...] [--qa]
 *
 * Sem --senha, gera uma provisória e a imprime UMA vez. A senha não é gravada em
 * lugar nenhum do banco: o app novo não tem coluna de senha (02 §2.1.5).
 *
 * --qa marca a conta com `is_dev = true`. Contas de QA existem para o
 * scripts/qa.mjs poder autenticar e fotografar tela com dado real, e devem ser
 * DESATIVADAS no corte (specs/03-plano-de-construcao.md, Fase F).
 */

import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

function lerEnv() {
  // Lê o .env sem depender de dependência nova.
  let texto = ''
  try {
    texto = readFileSync('.env', 'utf8')
  } catch {
    throw new Error('.env não encontrado. Copie de .env.example e preencha.')
  }
  const env = {}
  for (const linha of texto.split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

function argumentos() {
  const a = process.argv.slice(2)
  const out = { paginas: 'todas', perfil: 1, depto: 1, qa: false }
  for (let i = 0; i < a.length; i++) {
    const chave = a[i]
    if (chave === '--qa') {
      out.qa = true
      continue
    }
    const valor = a[i + 1]
    if (chave?.startsWith('--') && valor !== undefined) {
      out[chave.slice(2)] = valor
      i++
    }
  }
  return out
}

async function main() {
  const env = lerEnv()
  const arg = argumentos()

  if (!arg.email || !arg.nome) {
    console.error(
      'Uso: node scripts/bootstrap-acesso.mjs --email <e-mail> --nome "<nome>" ' +
        '[--perfil 1..4] [--depto 1..4] [--paginas todas|a,b,c] [--senha <senha>] [--qa]',
    )
    process.exit(2)
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const chave = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !chave) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.')
  }

  const db = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const perfil = Number(arg.perfil)
  const depto = Number(arg.depto)
  const senha = arg.senha ?? `Mb-${randomBytes(9).toString('base64url')}`
  let senhaGerada = !arg.senha

  // --- 1. conta no Auth ---------------------------------------------------
  let idAuth
  const { data: criado, error: erroCriar } = await db.auth.admin.createUser({
    email: arg.email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome: arg.nome },
  })

  if (erroCriar) {
    const jaExiste =
      erroCriar.status === 422 || /already/i.test(erroCriar.message ?? '')
    if (!jaExiste) throw erroCriar

    const { data: lista, error: erroLista } = await db.auth.admin.listUsers({ perPage: 1000 })
    if (erroLista) throw erroLista
    const achado = lista.users.find(
      (u) => u.email?.toLowerCase() === arg.email.toLowerCase(),
    )
    if (!achado) throw new Error(`Conta ${arg.email} existe no Auth mas não foi encontrada.`)
    idAuth = achado.id
    senhaGerada = false
    console.log(`Auth: conta já existia (${arg.email}); senha mantida.`)
  } else {
    idAuth = criado.user.id
    console.log(`Auth: conta criada (${arg.email}).`)
  }

  // --- 2. linha em usuarios ----------------------------------------------
  const { error: erroUsuario } = await db.from('usuarios').upsert(
    {
      id: idAuth,
      nome: arg.nome,
      email_contato: arg.email,
      perfil_id: perfil,
      departamento_id: depto,
      ativo: true,
      is_dev: arg.qa,
    },
    { onConflict: 'id' },
  )
  if (erroUsuario) throw erroUsuario
  console.log(`usuarios: perfil ${perfil}, departamento ${depto}${arg.qa ? ', is_dev' : ''}.`)

  // --- 3. permissões ------------------------------------------------------
  const { data: paginas, error: erroPaginas } = await db.from('paginas').select('slug')
  if (erroPaginas) throw erroPaginas

  const alvo =
    arg.paginas === 'todas'
      ? paginas.map((p) => p.slug)
      : arg.paginas.split(',').map((s) => s.trim()).filter(Boolean)

  const desconhecidas = alvo.filter((s) => !paginas.some((p) => p.slug === s))
  if (desconhecidas.length > 0) {
    throw new Error(`Página inexistente: ${desconhecidas.join(', ')}`)
  }

  // A concessão é por USUÁRIO, não por perfil: o bootstrap dá acesso a uma pessoa
  // específica, e quem define a política por perfil depois é a tela de administração.
  //
  // O índice único de (pagina_slug, usuario_id) é PARCIAL (where usuario_id is not null),
  // porque a mesma tabela também guarda concessão por perfil e por departamento. ON
  // CONFLICT não sabe mirar índice parcial pelo PostgREST, então lemos o que já existe e
  // inserimos só a diferença — que é o que torna o script idempotente.
  const { data: jaTem, error: erroLer } = await db
    .from('permissoes_pagina')
    .select('pagina_slug')
    .eq('usuario_id', idAuth)
  if (erroLer) throw erroLer

  const existentes = new Set((jaTem ?? []).map((l) => l.pagina_slug))
  const novas = alvo.filter((slug) => !existentes.has(slug))

  if (novas.length > 0) {
    const { error: erroPerm } = await db
      .from('permissoes_pagina')
      .insert(novas.map((slug) => ({ pagina_slug: slug, usuario_id: idAuth })))
    if (erroPerm) throw erroPerm
  }
  console.log(
    `permissoes_pagina: ${novas.length} concedida(s), ${existentes.size} já existia(m). ` +
      `Total do usuário: ${existentes.size + novas.length} de ${paginas.length} páginas.`,
  )

  console.log('\nPronto.')
  if (senhaGerada) {
    console.log(`\n  e-mail: ${arg.email}`)
    console.log(`  senha provisória: ${senha}`)
    console.log('\nEsta senha aparece UMA vez e não é gravada em lugar nenhum.')
    console.log('Troque no primeiro acesso.')
  }
  if (arg.qa) {
    console.log('\nConta de QA: desative no corte (specs/03-plano-de-construcao.md, Fase F).')
  }
}

await main()
