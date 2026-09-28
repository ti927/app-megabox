/**
 * Prova que a RLS e as travas das rotinas de manutenção (db/014) fazem o que a spec diz.
 *
 * Mesmo molde de `scripts/testar-rls-historico-sac.mjs`: autentica de verdade com as duas contas
 * de QA do .env — QA_EMAIL/QA_SENHA (perfil 1) e QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA (perfil 4).
 * Nenhuma das duas tem a página `rotinas`: a 014 deixou a concessão SÓ com os 2 usuários nomeados
 * do Bubble (D4). Para provar o lado "com a página", o teste concede a página ao QA perfil 1 por
 * service_role, e remove a concessão no fim (pelo id da linha criada).
 *
 * O que se prova:
 *   - ANON não lê catálogo nem registro e não executa o executor.
 *   - Perfil 1 SEM a concessão não lê nada (perfil não basta: a concessão é nominal, D3).
 *   - authenticated (mesmo com a página) não executa `fn_rotina_rodar`, não insere, não edita e
 *     não apaga execução. Nem o service_role apaga ou reescreve uma execução terminada.
 *   - TRAVA 3: real sem seco, sem motivo, com outros parâmetros, com seco já usado, ou com o
 *     alvo mudado desde o seco → nada muda. Real depois do seco → altera exatamente o previsto,
 *     com alterado_por = quem executou e os valores anteriores no registro.
 *   - Parâmetro desconhecido ou "todos" implícito → recusado (D8).
 *
 * Preparo e limpeza com service_role (SUPABASE_SERVICE_ROLE_KEY), que ignora RLS e por isso
 * NUNCA afirma sigilo. Dados de teste com nome exato `__teste_rls_rotinas__*`, apagados no fim
 * com `in`/`eq` (nunca `like`: `_` é curinga).
 * FICAM PARA TRÁS, de propósito: as linhas de `rotina_execucoes` do teste (append-only, D5 —
 * nem o service_role apaga), identificadas por `motivo = '__teste_rls_rotinas__'`, e a trilha
 * em `auditoria`.
 *
 * Janela de 15 minutos do seco: não é exercida aqui (exigiria esperar ou falsificar `fim`, que o
 * trigger impede). Está em `fn_rotina_recusa`.
 *
 *   node scripts/testar-rls-rotinas.mjs
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

const NOME = '__teste_rls_rotinas__'
const NOME_GRUPO = `${NOME}grupo`
const NOME_ENDERECOS = [`${NOME}filial_a`, `${NOME}filial_b`]

/** 42501 = insufficient_privilege: recusa de GRANT ou de policy. */
const RECUSADO = '42501'

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const casos = []
function caso(nome, esperado, obtido, detalhe = '') {
  const ok = esperado === obtido
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
  if (!ok && detalhe) console.log(`        ${detalhe}`)
}

async function ler(cliente, tabela, coluna) {
  const { error } = await cliente.from(tabela).select(coluna).limit(1)
  return error ? 'negado' : 'permitido'
}

async function contar(cliente, tabela, filtro = (q) => q) {
  const { data, error } = await filtro(cliente.from(tabela).select('*'))
  if (error) return error.code === RECUSADO ? 'negado' : `erro ${error.code}`
  return data.length
}

function escrita({ error, data }) {
  if (error) return error.code === RECUSADO ? 'negado' : `erro ${error.code}`
  return Array.isArray(data) && data.length === 0 ? 'negado' : 'permitido'
}

function rpcNegado({ error }) {
  if (!error) return 'permitido'
  return error.code === RECUSADO ? 'negado' : `erro ${error.code}`
}

async function entrar(email, senha) {
  const cliente = createClient(URL, ANON, { auth: { persistSession: false } })
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(`não autenticou ${email}: ${error.message}`)
  return { cliente, id: data.user.id }
}

async function exigir(promessa, oque) {
  const { data, error } = await promessa
  if (error) throw new Error(`preparo (${oque}): ${error.message}`)
  return data
}

/** Chama o executor como a server action chamaria (service_role). Devolve a linha registrada. */
async function rodar(rotina, usuario, modo, parametros, extra = {}) {
  const { data, error } = await admin.rpc('fn_rotina_rodar', {
    p_rotina: rotina,
    p_usuario_id: usuario,
    p_modo: modo,
    p_parametros: parametros,
    p_motivo: NOME,
    ...extra,
  })
  if (error) return { status: `exceção ${error.code}`, erro: error.message }
  return data
}

let concessaoId = null

// ------------------------------------------------------------------ preparo e limpeza
async function preparar(operadorId) {
  const [grupo] = await exigir(
    admin
      .from('grupos_clifor')
      .insert({ tipo: 'cliente', nome: NOME_GRUPO, ativo: false, carteira_id: operadorId })
      .select('id'),
    'grupo',
  )
  const enderecos = await exigir(
    admin
      .from('enderecos_clifor')
      .insert(
        NOME_ENDERECOS.map((n) => ({
          grupo_id: grupo.id,
          nome_endereco: n,
          tipo_pessoa: 'cnpj',
          regime_tributario_id: 1,
          uf: 'SP',
          ativo: true,
        })),
      )
      .select('id, nome_endereco'),
    'enderecos',
  )
  const porNome = Object.fromEntries(enderecos.map((e) => [e.nome_endereco, e.id]))
  return { grupo: grupo.id, a: porNome[NOME_ENDERECOS[0]], b: porNome[NOME_ENDERECOS[1]] }
}

async function limpar() {
  if (!SERVICE) {
    console.error('  FALHA  sem SUPABASE_SERVICE_ROLE_KEY: não consegui garantir a limpeza')
    process.exitCode = 1
    return
  }
  const passos = []
  const registrar = (oque, r) => {
    if (r.error) {
      console.error(`  FALHA  limpeza de ${oque}: ${r.error.message}`)
      process.exitCode = 1
    } else passos.push(`${oque}: ${r.data?.length ?? 0}`)
  }
  if (concessaoId) {
    registrar('permissoes_pagina (concessão temporária)', await admin.from('permissoes_pagina').delete().eq('id', concessaoId).select('id'))
    concessaoId = null
  }
  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', [NOME_GRUPO])
  const ids = (grupos ?? []).map((g) => g.id)
  if (ids.length) {
    registrar('enderecos_clifor', await admin.from('enderecos_clifor').delete().in('grupo_id', ids).in('nome_endereco', NOME_ENDERECOS).select('id'))
    registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  console.log(`\nLimpeza: ${passos.join(' · ') || 'nada a limpar'}`)
}

async function ativo(id) {
  const [e] = await exigir(admin.from('enderecos_clifor').select('ativo, alterado_por').eq('id', id), 'ler endereço')
  return e
}

// ------------------------------------------------------------------------------- casos
async function main() {
  await limpar()

  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)

  // Se uma execução anterior morreu com a concessão temporária no ar, tira.
  await exigir(admin.from('permissoes_pagina').delete().eq('pagina_slug', 'rotinas').eq('usuario_id', dir.id).select('id'), 'concessão velha')

  const d = await preparar(op.id)

  // -------------------------------------------------------------------------- anon
  console.log('\nSem sessão (papel anon) — nenhuma policy é `to anon` e o GRANT foi revogado:')
  const anonimo = createClient(URL, ANON, { auth: { persistSession: false } })
  caso('anon lê rotinas', 'negado', await ler(anonimo, 'rotinas', 'slug'))
  caso('anon lê rotina_execucoes', 'negado', await ler(anonimo, 'rotina_execucoes', 'id'))
  caso(
    'anon executa fn_rotina_rodar',
    'negado',
    rpcNegado(await anonimo.rpc('fn_rotina_rodar', { p_rotina: 'transferir-carteira', p_usuario_id: dir.id, p_modo: 'seco' })),
  )
  caso(
    'anon insere execução',
    'negado',
    escrita(await anonimo.from('rotina_execucoes').insert({ rotina_slug: 'transferir-carteira', usuario_id: dir.id, modo: 'seco' }).select('id')),
  )

  // --------------------------------------------------------- sem a concessão nominal
  console.log('\nPerfil 1 e Operador SEM a concessão da página rotinas:')
  caso('perfil 1 sem concessão vê o catálogo', 0, await contar(dir.cliente, 'rotinas'))
  caso('perfil 1 sem concessão vê o registro', 0, await contar(dir.cliente, 'rotina_execucoes'))
  caso('Operador vê o catálogo', 0, await contar(op.cliente, 'rotinas'))
  caso('Operador vê o registro', 0, await contar(op.cliente, 'rotina_execucoes'))
  const semPagina = await rodar('sincronizar-ativo-enderecos', dir.id, 'seco', { grupo_ids: [d.grupo] })
  caso('executor recusa quem não tem a página (e registra)', 'recusada', semPagina.status, semPagina.erro)

  // -------------------------------------------------- com a concessão (temporária)
  const [conc] = await exigir(
    admin.from('permissoes_pagina').insert({ pagina_slug: 'rotinas', usuario_id: dir.id }).select('id'),
    'concessão temporária',
  )
  concessaoId = conc.id

  console.log('\nPerfil 1 COM a página rotinas (concessão temporária do teste):')
  caso('lê o catálogo (2 rotinas)', 2, await contar(dir.cliente, 'rotinas'))
  caso(
    'catálogo não tem rotina descartada (estorno em massa)',
    0,
    await contar(dir.cliente, 'rotinas', (q) => q.in('slug', ['estornar-baixas', 'recalcular-comissao-pagar', 'recalcular-ultimo-historico'])),
  )
  caso(
    'authenticated com a página executa fn_rotina_rodar',
    'negado',
    rpcNegado(await dir.cliente.rpc('fn_rotina_rodar', { p_rotina: 'sincronizar-ativo-enderecos', p_usuario_id: dir.id, p_modo: 'seco', p_parametros: { grupo_ids: [d.grupo] } })),
  )
  caso(
    'authenticated com a página insere execução direto',
    'negado',
    escrita(await dir.cliente.from('rotina_execucoes').insert({ rotina_slug: 'sincronizar-ativo-enderecos', usuario_id: dir.id, modo: 'seco', parametros: { grupo_ids: [d.grupo] } }).select('id')),
  )
  caso(
    'authenticated com a página altera o catálogo',
    'negado',
    escrita(await dir.cliente.from('rotinas').update({ ativa: false }).eq('slug', 'transferir-carteira').select('slug')),
  )

  // ------------------------------------------------------------ parâmetros (D8)
  console.log('\nParâmetros:')
  caso('chave desconhecida → recusada', 'recusada', (await rodar('sincronizar-ativo-enderecos', dir.id, 'seco', { grupo_id: d.grupo })).status)
  caso('sem filtro nem "todos" → recusada', 'recusada', (await rodar('sincronizar-ativo-enderecos', dir.id, 'seco', {})).status)
  caso('grupo_ids e todos juntos → recusada', 'recusada', (await rodar('sincronizar-ativo-enderecos', dir.id, 'seco', { grupo_ids: [d.grupo], todos: true })).status)
  caso('carteira de X para X → recusada', 'recusada', (await rodar('transferir-carteira', dir.id, 'seco', { de_vendedor_id: op.id, para_vendedor_id: op.id })).status)
  const inexistente = await rodar('rotina-que-nao-existe', dir.id, 'seco', {})
  caso('rotina inexistente → exceção, nada registrado', true, inexistente.status.startsWith('exceção'))

  // ------------------------------------------------------- trava 3: seco antes do real
  console.log('\nSeco antes do real — sincronizar-ativo-enderecos:')
  const params = { grupo_ids: [d.grupo] }
  const semSeco = await rodar('sincronizar-ativo-enderecos', dir.id, 'real', params)
  caso('real sem seco → recusada', 'recusada', semSeco.status)
  caso('recusa não mexeu no dado', true, (await ativo(d.a)).ativo)

  const seco = await rodar('sincronizar-ativo-enderecos', dir.id, 'seco', params)
  caso('seco → ok', 'ok', seco.status, seco.erro)
  caso('seco prevê 2 filiais', 2, seco.linhas_afetadas)
  caso('seco não altera nada', true, (await ativo(d.a)).ativo && (await ativo(d.b)).ativo)
  caso('seco guarda amostra e assinatura', true, Array.isArray(seco.resultado?.amostra) && typeof seco.resultado?.assinatura === 'string')

  caso(
    'real sem motivo → recusada',
    'recusada',
    (await rodar('sincronizar-ativo-enderecos', dir.id, 'real', params, { p_motivo: '  ', p_simulacao_id: seco.id })).status,
  )
  caso(
    'real com outros parâmetros → recusada',
    'recusada',
    (await rodar('sincronizar-ativo-enderecos', dir.id, 'real', { todos: true }, { p_simulacao_id: seco.id })).status,
  )
  caso(
    'real de outro usuário com o seco alheio → recusada',
    'recusada',
    (await rodar('sincronizar-ativo-enderecos', op.id, 'real', params, { p_simulacao_id: seco.id })).status,
  )
  const real = await rodar('sincronizar-ativo-enderecos', dir.id, 'real', params, { p_simulacao_id: seco.id })
  caso('real depois do seco → ok', 'ok', real.status, real.erro)
  caso('real alterou o previsto (2)', 2, real.linhas_afetadas)
  const depoisA = await ativo(d.a)
  caso('filial desativada', false, depoisA.ativo)
  caso('alterado_por = quem executou (D9)', dir.id, depoisA.alterado_por)
  caso('registro guarda o valor anterior de cada linha', 2, real.resultado?.alterados?.length)
  caso(
    'seco já usado → recusada',
    'recusada',
    (await rodar('sincronizar-ativo-enderecos', dir.id, 'real', params, { p_simulacao_id: seco.id })).status,
  )

  // alvo mudou entre o seco e o real
  await exigir(admin.from('enderecos_clifor').update({ ativo: true }).eq('id', d.a).select('id'), 'reativar a')
  const seco2 = await rodar('sincronizar-ativo-enderecos', dir.id, 'seco', params)
  caso('novo seco prevê 1', 1, seco2.linhas_afetadas)
  await exigir(admin.from('enderecos_clifor').update({ ativo: true }).eq('id', d.b).select('id'), 'reativar b')
  const deriva = await rodar('sincronizar-ativo-enderecos', dir.id, 'real', params, { p_simulacao_id: seco2.id })
  caso('alvo mudou desde o seco → erro', 'erro', deriva.status)
  caso('e nada foi alterado', true, (await ativo(d.a)).ativo && (await ativo(d.b)).ativo)

  // ------------------------------------------------------------- transferir-carteira
  console.log('\nTransferir carteira:')
  const pc = { de_vendedor_id: op.id, para_vendedor_id: dir.id, grupo_ids: [d.grupo] }
  const secoC = await rodar('transferir-carteira', dir.id, 'seco', pc)
  caso('seco prevê 1 cliente', 1, secoC.linhas_afetadas, secoC.erro)
  const realC = await rodar('transferir-carteira', dir.id, 'real', pc, { p_simulacao_id: secoC.id })
  caso('real → ok', 'ok', realC.status, realC.erro)
  const [g] = await exigir(admin.from('grupos_clifor').select('carteira_id').eq('id', d.grupo), 'ler carteira')
  caso('carteira passou ao destino', dir.id, g.carteira_id)
  caso('dono anterior ficou no registro', op.id, realC.resultado?.alterados?.[0]?.carteira_antes)

  // --------------------------------------------------------------- append-only (D5)
  console.log('\nRegistro append-only:')
  caso('perfil 1 com a página lê o registro', true, (await contar(dir.cliente, 'rotina_execucoes', (q) => q.eq('id', real.id))) === 1)
  caso('Operador (sem a página) não lê a mesma execução', 0, await contar(op.cliente, 'rotina_execucoes', (q) => q.eq('id', real.id)))
  const ed = await dir.cliente.from('rotina_execucoes').update({ linhas_afetadas: 0 }).eq('id', real.id).select('id')
  caso('perfil 1 edita execução', 'negado', escrita(ed), ed.error?.message)
  const ap = await dir.cliente.from('rotina_execucoes').delete().eq('id', real.id).select('id')
  caso('perfil 1 apaga execução', 'negado', escrita(ap), ap.error?.message)
  const svcEd = await admin.from('rotina_execucoes').update({ linhas_afetadas: 0 }).eq('id', real.id).select('id')
  caso('nem service_role reescreve execução terminada', '55000', svcEd.error?.code ?? 'reescreveu')
  const svcAp = await admin.from('rotina_execucoes').delete().eq('id', real.id).select('id')
  caso('nem service_role apaga execução', RECUSADO, svcAp.error?.code ?? 'apagou')
  const svcOk = await admin
    .from('rotina_execucoes')
    .insert({ rotina_slug: 'sincronizar-ativo-enderecos', usuario_id: dir.id, modo: 'seco', parametros: params, status: 'ok', linhas_afetadas: 99 })
    .select('id')
  caso('ninguém insere execução já "ok" (forjar resultado)', '23514', svcOk.error?.code ?? 'inseriu')
  const svcReal = await admin
    .from('rotina_execucoes')
    .insert({ rotina_slug: 'sincronizar-ativo-enderecos', usuario_id: dir.id, modo: 'real', parametros: params, motivo: NOME, simulacao_id: seco.id })
    .select('id')
  caso('insert direto de real com seco usado → recusado pelo trigger', RECUSADO, svcReal.error?.code ?? 'inseriu')

  await dir.cliente.auth.signOut()
  await op.cliente.auth.signOut()

  const falhas = casos.filter((c) => !c.ok)
  console.log(`\n${casos.length - falhas.length}/${casos.length} casos como a spec promete.`)
  if (falhas.length > 0) process.exitCode = 1
}

try {
  await main()
} catch (erro) {
  console.error(`\nFALHA  ${erro.message}`)
  process.exitCode = 1
} finally {
  await limpar()
}
