/**
 * Prova que a RLS faz o que a spec diz — não só que ela está ligada.
 *
 * `service_role` ignora RLS, então ele não consegue testar policy nenhuma. Este script
 * autentica de verdade, com a conta de QA (.env: QA_EMAIL / QA_SENHA), e compara o que
 * o banco devolve com o que `specs/02-modelo-de-dados-proposto.md` §7 promete.
 *
 * Uma segunda conta (.env: QA_OPERADOR_EMAIL / QA_OPERADOR_SENHA, perfil 4 — a mesma que
 * `testar-acesso.mjs` usa) prova o que o perfil 1 não prova: que a concessão de `cadastros`
 * NÃO abre a escrita no cadastro de produto (db/005, "POR QUE DOIS ALVOS").
 *
 * Roda com o banco vazio e continua valendo depois da carga: cada caso afirma
 * permitido/negado, não uma quantidade de linhas.
 *
 * O único dado que escreve é uma linha `__teste_rls__` em `produto_tipos`, apagada no fim
 * com service_role (SUPABASE_SERVICE_ROLE_KEY) — que aqui só limpa, nunca afirma nada.
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
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY

/** As 11 tabelas de db/006_cadastro.sql. */
const TABELAS_006 = [
  'grupos_clifor',
  'enderecos_clifor',
  'contatos_clifor',
  'anexos',
  'produto_tipos',
  'produto_grupos',
  'produtos',
  'produto_versoes',
  'produto_linhas',
  'produto_condicoes',
  'fornecedor_produtos',
]

/** Prefixo das linhas que o teste cria. Nunca colide com dado real; tudo é apagado no fim. */
const NOME_TESTE = '__teste_rls__'

/** 42501 = insufficient_privilege: recusa de GRANT ou de policy (RLS), não erro de dado. */
const RECUSADO = '42501'

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

/**
 * Uma escrita só conta como 'negado' se o banco a RECUSOU por privilégio (42501). Erro de
 * dado (not null, unique, FK) não prova policy nenhuma, e vira 'erro' para acusar o teste.
 */
function escrita({ error, data }) {
  if (error) return error.code === RECUSADO ? 'negado' : `erro ${error.code}`
  return Array.isArray(data) && data.length === 0 ? 'negado' : 'permitido'
}

async function entrar(email, senha) {
  const cliente = createClient(URL, ANON, { auth: { persistSession: false } })
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha })
  return { cliente, sessao: data, erro: error }
}

/** Apaga, com service_role, o que o teste possa ter criado. Idempotente. */
async function limpar() {
  if (!SERVICE) {
    console.error('  FALHA  sem SUPABASE_SERVICE_ROLE_KEY: não consegui garantir a limpeza')
    process.exitCode = 1
    return
  }
  const admin = createClient(URL, SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await admin
    .from('produto_tipos')
    .delete()
    // `in` e não `like`: `_` é curinga em LIKE, e a limpeza não pode pegar nome real.
    .in('nome', [NOME_TESTE, `${NOME_TESTE}op`])
    .select('id')
  if (error) {
    console.error(`  FALHA  limpeza de produto_tipos (${NOME_TESTE}*): ${error.message}`)
    process.exitCode = 1
    return
  }
  console.log(`\nLimpeza: ${data.length} linha(s) de teste apagada(s) de produto_tipos.`)
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
  // 006: `revoke all ... from anon` e nenhuma policy `to anon`.
  for (const t of [...TABELAS_006, 'v_clifor_documento_duplicado']) {
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

  // --------------------------------------------------------------- 006: cadastro
  // Leitura das 11 é fn_usuario_ativo(): qualquer usuário ativo lê.
  for (const t of TABELAS_006) {
    caso(`autenticado lê ${t}`, 'permitido', await ler(usuario, t))
  }

  // security_invoker: respeita a RLS de quem lê, e o autenticado ativo lê.
  caso(
    'autenticado lê v_clifor_documento_duplicado',
    'permitido',
    await ler(usuario, 'v_clifor_documento_duplicado'),
  )

  // 005: alvo `config` é da engrenagem, não do menu lateral.
  const { data: menu, error: erroMenu } = await usuario.rpc('fn_minhas_paginas')
  const slugsMenu = (menu ?? []).map((p) => p.slug)
  caso(
    'fn_minhas_paginas() não devolve cadastros nem produtos',
    'negado',
    erroMenu
      ? 'erro'
      : slugsMenu.includes('cadastros') || slugsMenu.includes('produtos')
        ? 'permitido'
        : 'negado',
    erroMenu?.message ?? `slugs: ${slugsMenu.join(', ')}`,
  )

  const { data: config, error: erroConfig } = await usuario.rpc('fn_minhas_configuracoes')
  const slugsConfig = (config ?? []).map((p) => p.slug)
  caso(
    'fn_minhas_configuracoes() devolve cadastros e produtos (perfil 1)',
    'permitido',
    !erroConfig && slugsConfig.includes('cadastros') && slugsConfig.includes('produtos')
      ? 'permitido'
      : 'negado',
    erroConfig?.message ?? `slugs: ${slugsConfig.join(', ')}`,
  )
  caso(
    'fn_minhas_configuracoes() não devolve item de menu',
    'negado',
    slugsConfig.some((s) => slugsMenu.includes(s)) ? 'permitido' : 'negado',
    `slugs: ${slugsConfig.join(', ')}`,
  )

  // Perfil 1 tem `produtos` (matriz B6) e escreve no cadastro de produto.
  const insercao = await usuario.from('produto_tipos').insert({ nome: NOME_TESTE }).select('id')
  caso(
    'perfil 1 insere em produto_tipos',
    'permitido',
    escrita(insercao),
    insercao.error?.message,
  )

  // anexos: DELETE revogado no GRANT — nem perfil 1 apaga. O filtro mira um id que não
  // existe, para o teste não apagar nada nem se a revogação sumir; o GRANT recusa antes de
  // olhar linha, então a resposta tem de ser 42501, não "0 linhas".
  const apagarAnexo = await usuario
    .from('anexos')
    .delete()
    .eq('id', '00000000-0000-0000-0000-000000000000')
  caso(
    'perfil 1 apaga em anexos (revoke delete no GRANT)',
    'negado',
    apagarAnexo.error?.code === RECUSADO ? 'negado' : 'permitido',
    apagarAnexo.error?.message,
  )

  await usuario.auth.signOut()

  // --------------------------------------------- Operador (perfil 4): os dois slugs
  console.log('\nCom sessão (conta de Operador, perfil 4):')
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  if (op.erro) {
    caso(
      'Operador autentica (QA_OPERADOR_EMAIL / QA_OPERADOR_SENHA)',
      'permitido',
      'negado',
      op.erro.message,
    )
  } else {
    const operador = op.cliente
    const opId = op.sessao.user.id

    const { data: linhaOp } = await operador
      .from('usuarios')
      .select('perfil_id')
      .eq('id', opId)
      .maybeSingle()
    caso('a conta de Operador é perfil 4', 4, linhaOp?.perfil_id ?? null)

    const pode = async (slug) => {
      const { data, error } = await operador.rpc('fn_pode_acessar_pagina', { p_slug: slug })
      return { v: !error && data === true ? 'permitido' : 'negado', erro: error?.message }
    }
    const cad = await pode('cadastros')
    caso('Operador: fn_pode_acessar_pagina("cadastros")', 'permitido', cad.v, cad.erro)
    const prod = await pode('produtos')
    caso('Operador: fn_pode_acessar_pagina("produtos")', 'negado', prod.v, prod.erro)

    // A razão de existirem dois slugs: ter `cadastros` não abre a escrita de produto.
    const insOp = await operador
      .from('produto_tipos')
      .insert({ nome: `${NOME_TESTE}op` })
      .select('id')
    caso('Operador insere em produto_tipos', 'negado', escrita(insOp), insOp.error?.message)

    // Mas continua lendo produto: o combo do orçamento está em vendas.
    caso('Operador lê produtos', 'permitido', await ler(operador, 'produtos'))

    // ESCALADA: o Operador tenta se promover a Diretor pela própria linha. No Bubble isso é
    // um auto-binding de um clique (specs/00-achados-de-seguranca.md §2.3). Aqui não há policy
    // de update para quem não é perfil 1, então o PostgREST filtra a linha e devolve ZERO
    // linhas alteradas, sem erro — por isso o caso confere o que voltou, e não só o erro.
    const { data: eu } = await operador.auth.getUser()
    const escalada = await operador
      .from('usuarios')
      .update({ perfil_id: 1 })
      .eq('id', eu.user.id)
      .select('id')
    caso('Operador se promove a Diretor', 'negado', escrita(escalada), escalada.error?.message)
    if (escrita(escalada) === 'permitido') {
      // Se um dia passar, o teste não pode deixar um Diretor falso para trás.
      await createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
        .from('usuarios').update({ perfil_id: 4 }).eq('id', eu.user.id)
      console.log('        (revertido para perfil 4 com service_role)')
    }

    await operador.auth.signOut()
  }

  const falhas = casos.filter((c) => !c.ok)
  console.log(`\n${casos.length - falhas.length}/${casos.length} casos como a spec promete.`)
  if (falhas.length > 0) process.exitCode = 1
}

try {
  await main()
} finally {
  await limpar()
}
