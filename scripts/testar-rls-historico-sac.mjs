/**
 * Prova que a RLS e as travas do histórico (db/012) e do SAC/pesquisas (db/013) fazem o que a
 * spec diz.
 *
 * Mesmo molde de `scripts/testar-rls-vendas.mjs`: autentica de verdade com as duas contas de QA
 * do .env — QA_EMAIL/QA_SENHA (perfil 1, com as páginas vendas, cadastros e sac) e
 * QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA (perfil 4, com vendas e cadastros, SEM sac).
 *
 * O que se prova:
 *   - ANON não lê nem escreve nada, inclusive as três tabelas de pesquisa, e não executa as
 *     funções do formulário público (a resposta pública só entra por service_role).
 *   - HISTÓRICO APPEND-ONLY (02 §7.3; 012 D1): usuário comum não edita nem apaga (42501); nem o
 *     service_role muda texto (55000); autor falso e origem automática são recusados.
 *   - ESPELHO (012 D4): grupos_clifor.ultimo_historico_* acompanha sozinho o insert, ignora a
 *     correção, volta ao anterior no cancelamento — e não mexe em alterado_em (012 D5).
 *   - TOKEN DO CONVITE (013): 256 bits, só o sha256 gravado, token_hash ilegível por
 *     authenticated, uso único, prazo, reenvio mata o token anterior, cancelado = inválido.
 *   - SAC: sigilo pela página sac (o Operador não vê nem sendo responsável), exclusão lógica,
 *     fechado_em pelo status, interação append-only, fn_nps com o índice certo.
 *
 * Os dados são preparados e limpos com service_role (SUPABASE_SERVICE_ROLE_KEY), que ignora
 * RLS e por isso NUNCA afirma sigilo — só é usado para afirmar o que vale para todo papel
 * (imutabilidade, token). Tudo tem nome exato `__teste_rls_hist_sac__*` e é apagado no fim, com
 * `in`/`eq` (nunca `like`: `_` é curinga). Fica para trás só a trilha em `auditoria`.
 *
 *   node scripts/testar-rls-historico-sac.mjs
 */

import { createHash, randomBytes } from 'node:crypto'
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

const TABELAS = [
  'historicos',
  'modelos_email',
  'sac_protocolos',
  'sac_protocolo_entregas',
  'sac_protocolo_anexos',
  'sac_interacoes',
  'pesquisas',
  'pesquisa_convites',
  'pesquisa_respostas',
]

const NOME = '__teste_rls_hist_sac__'
const NOME_CLIENTE = `${NOME}cliente`
const NOME_PESQ_NPS = `${NOME}nps`
const NOME_PESQ_CONTA = `${NOME}nps_conta`
const NOME_PESQ_POS = `${NOME}pos_venda`
const PESQUISAS = [NOME_PESQ_NPS, NOME_PESQ_CONTA, NOME_PESQ_POS]

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

/** Lê a tabela? Para anon, com GRANT revogado, é erro; para authenticated, pode ser 0 linhas. */
async function ler(cliente, tabela, colunas = 'id') {
  const { error } = await cliente.from(tabela).select(colunas).limit(1)
  return error ? 'negado' : 'permitido'
}

/** Enxerga UMA linha específica? RLS de leitura filtra sem erro, então conta linhas. */
async function enxerga(cliente, tabela, id, colunas = 'id') {
  const { data, error } = await cliente.from(tabela).select(colunas).eq('id', id)
  if (error) return error.code === RECUSADO ? 'negado' : `erro ${error.code}`
  return data.length === 1 ? 'permitido' : 'negado'
}

/** Escrita só é 'negado' com 42501 ou zero linhas; erro de dado vira 'erro' e acusa o teste. */
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

const sha256hex = (texto) => createHash('sha256').update(texto, 'utf8').digest('hex')
/** PostgREST devolve bytea como '\x…' em hex. */
const byteaHex = (valor) => String(valor ?? '').replace(/^\\x/, '')

async function espelho(grupoId) {
  const [g] = await exigir(
    admin.from('grupos_clifor').select('ultimo_historico_id, ultimo_historico_em, alterado_em').eq('id', grupoId),
    'ler espelho',
  )
  return g
}

async function emitir(conviteId) {
  const { data, error } = await admin.rpc('fn_pesquisa_emitir_token', { p_convite_id: conviteId })
  if (error) throw new Error(`preparo (emitir token): ${error.message}`)
  return data
}

async function responder(token, notas = {}) {
  const { data, error } = await admin.rpc('fn_pesquisa_responder', { p_token: token, ...notas })
  if (error) return `erro ${error.code}: ${error.message}`
  return data
}

// ------------------------------------------------------------------ preparo e limpeza
async function preparar() {
  const [grupo] = await exigir(
    admin.from('grupos_clifor').insert({ tipo: 'cliente', nome: NOME_CLIENTE }).select('id, alterado_em'),
    'grupo',
  )
  const [contato] = await exigir(
    admin.from('contatos_clifor').insert({ grupo_id: grupo.id, nome: NOME, email: 'qa@example.invalid' }).select('id'),
    'contato',
  )
  const pesquisas = await exigir(
    admin
      .from('pesquisas')
      .insert([
        { nome: NOME_PESQ_NPS, tipo_id: 2 },
        { nome: NOME_PESQ_CONTA, tipo_id: 2 },
        { nome: NOME_PESQ_POS, tipo_id: 3 },
      ])
      .select('id, nome'),
    'pesquisas',
  )
  const pesq = Object.fromEntries(pesquisas.map((p) => [p.nome, p.id]))
  return { grupo: grupo.id, contato: contato.id, pesq }
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

  // só existe se o caso "Operador cria modelo" falhar
  registrar('modelos_email', await admin.from('modelos_email').delete().eq('chave', 'teste_rls').select('chave'))

  const { data: pesqs } = await admin.from('pesquisas').select('id').in('nome', PESQUISAS)
  const idsPesq = (pesqs ?? []).map((p) => p.id)
  if (idsPesq.length) {
    const { data: convs } = await admin.from('pesquisa_convites').select('id').in('pesquisa_id', idsPesq)
    const idsConv = (convs ?? []).map((c) => c.id)
    if (idsConv.length) {
      registrar('pesquisa_respostas', await admin.from('pesquisa_respostas').delete().in('convite_id', idsConv).select('id'))
    }
    // convites vão em cascade com a pesquisa
    registrar('pesquisas', await admin.from('pesquisas').delete().in('id', idsPesq).select('id'))
  }

  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', [NOME_CLIENTE])
  const ids = (grupos ?? []).map((g) => g.id)
  if (ids.length) {
    // interações, anexos e ligações vão em cascade com o protocolo
    registrar('sac_protocolos', await admin.from('sac_protocolos').delete().in('grupo_clifor_id', ids).select('id'))
    // correções antes das originais (corrige_id é restrict)
    registrar(
      'historicos (correções)',
      await admin.from('historicos').delete().in('grupo_clifor_id', ids).not('corrige_id', 'is', null).select('id'),
    )
    registrar('historicos', await admin.from('historicos').delete().in('grupo_clifor_id', ids).select('id'))
    registrar('contatos_clifor', await admin.from('contatos_clifor').delete().in('grupo_id', ids).select('id'))
    registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  console.log(`\nLimpeza: ${passos.join(' · ')}`)
}

// ------------------------------------------------------------------------------- casos
async function main() {
  // Se uma execução anterior morreu no meio, começa limpo.
  await limpar()

  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const d = await preparar()

  // -------------------------------------------------------------------------- anon
  console.log('\nSem sessão (papel anon) — nenhuma policy é `to anon` e o GRANT foi revogado:')
  const anonimo = createClient(URL, ANON, { auth: { persistSession: false } })
  for (const t of TABELAS) caso(`anon lê ${t}`, 'negado', await ler(anonimo, t, t === 'modelos_email' ? 'chave' : t === 'sac_protocolo_entregas' ? 'protocolo_id' : 'id'))
  caso(
    'anon insere historico',
    'negado',
    escrita(await anonimo.from('historicos').insert({ grupo_clifor_id: d.grupo, autor_id: dir.id, descricao: NOME }).select('id')),
  )
  caso(
    'anon insere pesquisa_convites',
    'negado',
    escrita(await anonimo.from('pesquisa_convites').insert({ pesquisa_id: d.pesq[NOME_PESQ_NPS], cliente_id: d.grupo }).select('id')),
  )
  caso(
    'anon insere pesquisa_respostas',
    'negado',
    escrita(await anonimo.from('pesquisa_respostas').insert({ convite_id: d.grupo, nota_nps: 10 }).select('id')),
  )
  caso('anon insere pesquisas', 'negado', escrita(await anonimo.from('pesquisas').insert({ nome: NOME, tipo_id: 2 }).select('id')))
  caso(
    'anon insere sac_protocolos',
    'negado',
    escrita(
      await anonimo
        .from('sac_protocolos')
        .insert({ grupo_clifor_id: d.grupo, tipo_ocorrencia_id: 1, prioridade_id: 1, descricao: NOME })
        .select('id'),
    ),
  )
  caso(
    'anon executa fn_pesquisa_responder',
    'negado',
    rpcNegado(await anonimo.rpc('fn_pesquisa_responder', { p_token: 'x'.repeat(43), p_nota_nps: 10 })),
  )
  caso(
    'anon executa fn_pesquisa_emitir_token',
    'negado',
    rpcNegado(await anonimo.rpc('fn_pesquisa_emitir_token', { p_convite_id: d.grupo })),
  )
  caso('anon executa fn_nps', 'negado', rpcNegado(await anonimo.rpc('fn_nps', { p_pesquisa_id: d.pesq[NOME_PESQ_NPS] })))
  caso(
    'anon executa fn_historico_espelho_recalcular',
    'negado',
    rpcNegado(await anonimo.rpc('fn_historico_espelho_recalcular', { p_grupos: [d.grupo] })),
  )

  // ------------------------------------------------------------------ histórico (perfil 1)
  console.log('\nHistórico — perfil 1:')
  const antes = await espelho(d.grupo)
  const h1 = await dir.cliente
    .from('historicos')
    .insert({ grupo_clifor_id: d.grupo, descricao: `${NOME} primeira`, criado_em: '2000-01-01T00:00:00Z' })
    .select('id, autor_id, criado_em')
  caso('perfil 1 registra interação', 'permitido', escrita(h1), h1.error?.message)
  const idH1 = h1.data?.[0]?.id
  caso('autor = quem inseriu (default auth.uid())', dir.id, h1.data?.[0]?.autor_id ?? null)
  caso('criado_em retrodatado pelo formulário é ignorado', true, h1.data?.[0] ? new Date(h1.data[0].criado_em).getFullYear() > 2000 : null)
  caso('ESPELHO: ultimo_historico_id = a interação nova', idH1, (await espelho(d.grupo)).ultimo_historico_id)

  const h2 = await dir.cliente.from('historicos').insert({ grupo_clifor_id: d.grupo, descricao: `${NOME} segunda` }).select('id')
  const idH2 = h2.data?.[0]?.id
  caso('ESPELHO: acompanha a mais recente', idH2, (await espelho(d.grupo)).ultimo_historico_id)
  caso('ESPELHO não mexe em grupos_clifor.alterado_em', antes.alterado_em, (await espelho(d.grupo)).alterado_em)

  const falso = await dir.cliente
    .from('historicos')
    .insert({ grupo_clifor_id: d.grupo, descricao: NOME, autor_id: op.id })
    .select('id')
  caso('registrar em nome de outro autor', 'negado', escrita(falso), falso.error?.message)
  const auto = await dir.cliente
    .from('historicos')
    .insert({ grupo_clifor_id: d.grupo, descricao: NOME, origem: 'workflow', tipo_evento: 'proposta' })
    .select('id')
  caso('usuário grava evento automático (origem workflow)', 'negado', escrita(auto), auto.error?.message)

  const edita = await dir.cliente.from('historicos').update({ descricao: 'reescrito' }).eq('id', idH1).select('id')
  caso('APPEND-ONLY: perfil 1 edita o texto', 'negado', escrita(edita), edita.error?.message)
  const cancelaUser = await dir.cliente
    .from('historicos')
    .update({ cancelado_em: new Date().toISOString(), cancelado_motivo: 'x' })
    .eq('id', idH1)
    .select('id')
  caso('APPEND-ONLY: usuário cancela direto (é server action)', 'negado', escrita(cancelaUser), cancelaUser.error?.message)
  const apaga = await dir.cliente.from('historicos').delete().eq('id', idH1).select('id')
  caso('APPEND-ONLY: perfil 1 apaga fisicamente', 'negado', escrita(apaga), apaga.error?.message)
  const svcEdita = await admin.from('historicos').update({ descricao: 'reescrito' }).eq('id', idH1).select('id')
  caso('APPEND-ONLY: nem service_role reescreve o texto', '55000', svcEdita.error?.code ?? 'reescreveu')

  const corr = await dir.cliente
    .from('historicos')
    .insert({ grupo_clifor_id: d.grupo, descricao: `${NOME} correção`, corrige_id: idH2 })
    .select('id')
  caso('correção = linha nova com corrige_id', 'permitido', escrita(corr), corr.error?.message)
  caso('ESPELHO: correção não conta como contato novo', idH2, (await espelho(d.grupo)).ultimo_historico_id)
  const { data: orig } = await dir.cliente.from('historicos').select('descricao').eq('id', idH2).single()
  caso('correção preserva o texto original', `${NOME} segunda`, orig?.descricao ?? null)

  const cancela = await admin
    .from('historicos')
    .update({ cancelado_em: new Date().toISOString(), cancelado_por: dir.id, cancelado_motivo: 'teste' })
    .eq('id', idH2)
    .select('id')
  caso('servidor cancela (marcação, não remoção)', 'permitido', escrita(cancela), cancela.error?.message)
  caso('ESPELHO: cancelar volta para a anterior', idH1, (await espelho(d.grupo)).ultimo_historico_id)
  const descancela = await admin.from('historicos').update({ cancelado_em: null, cancelado_motivo: null }).eq('id', idH2).select('id')
  caso('cancelamento é de mão única', '55000', descancela.error?.code ?? 'desfez')

  // ------------------------------------------------------------------ histórico (Operador)
  console.log('\nHistórico — Operador (vendas + cadastros):')
  const o = op.cliente
  caso('Operador lê o histórico do cliente (sem sigilo por carteira, 012 D3)', 'permitido', await enxerga(o, 'historicos', idH1))
  const hOp = await o.from('historicos').insert({ grupo_clifor_id: d.grupo, descricao: `${NOME} operador` }).select('id')
  caso('Operador registra interação própria', 'permitido', escrita(hOp), hOp.error?.message)
  caso('ESPELHO atualiza com Operador sem escrita em grupos_clifor', hOp.data?.[0]?.id, (await espelho(d.grupo)).ultimo_historico_id)
  const corrAlheia = await o
    .from('historicos')
    .insert({ grupo_clifor_id: d.grupo, descricao: NOME, corrige_id: idH1 })
    .select('id')
  caso('Operador corrige interação de outro autor', 'negado', escrita(corrAlheia), corrAlheia.error?.message)
  const opApaga = await o.from('historicos').delete().eq('id', hOp.data?.[0]?.id).select('id')
  caso('Operador apaga a própria interação', 'negado', escrita(opApaga), opApaga.error?.message)
  const opEdita = await o.from('historicos').update({ descricao: 'x' }).eq('id', hOp.data?.[0]?.id).select('id')
  caso('Operador edita a própria interação', 'negado', escrita(opEdita), opEdita.error?.message)
  const modelo = await o.from('modelos_email').insert({ chave: 'teste_rls', nome: NOME, assunto: NOME, corpo: NOME }).select('chave')
  caso('Operador cria modelo de e-mail (só perfil 1)', 'negado', escrita(modelo), modelo.error?.message)

  // ------------------------------------------------------------------------- SAC (perfil 1)
  console.log('\nSAC — perfil 1 (página sac):')
  const prot = await dir.cliente
    .from('sac_protocolos')
    .insert({ grupo_clifor_id: d.grupo, tipo_ocorrencia_id: 1, prioridade_id: 1, descricao: NOME, responsavel_id: op.id })
    .select('id, numero, aberto_em, fechado_em')
  caso('perfil 1 abre chamado', 'permitido', escrita(prot), prot.error?.message)
  const idProt = prot.data?.[0]?.id
  caso('número do protocolo vem do banco (identity)', true, Number.isInteger(prot.data?.[0]?.numero))
  const resolve = await dir.cliente.from('sac_protocolos').update({ status_id: 4 }).eq('id', idProt).select('fechado_em, tempo_resolucao')
  caso('Resolvido grava fechado_em e tempo_resolucao', true, !!(resolve.data?.[0]?.fechado_em && resolve.data?.[0]?.tempo_resolucao), resolve.error?.message)
  const reabre = await dir.cliente.from('sac_protocolos').update({ status_id: 1 }).eq('id', idProt).select('fechado_em')
  caso('sair de Resolvido limpa fechado_em (DÚVIDA 14)', null, reabre.data?.[0] ? reabre.data[0].fechado_em : 'erro')

  const inter = await dir.cliente.from('sac_interacoes').insert({ protocolo_id: idProt, descricao: NOME }).select('id')
  caso('perfil 1 registra interação no chamado', 'permitido', escrita(inter), inter.error?.message)
  const semContato = await dir.cliente
    .from('sac_interacoes')
    .insert({ protocolo_id: idProt, descricao: NOME, visivel_cliente: true })
    .select('id')
  caso('interação visível ao cliente sem contato', 'negado', escrita(semContato), semContato.error?.message)
  const comContato = await dir.cliente
    .from('sac_interacoes')
    .insert({ protocolo_id: idProt, descricao: NOME, visivel_cliente: true, contato_id: d.contato })
    .select('id')
  caso('interação visível ao cliente com contato', 'permitido', escrita(comContato), comContato.error?.message)
  const edInter = await dir.cliente.from('sac_interacoes').update({ descricao: 'x' }).eq('id', inter.data?.[0]?.id).select('id')
  caso('APPEND-ONLY: edita interação do chamado', 'negado', escrita(edInter), edInter.error?.message)
  const apInter = await dir.cliente.from('sac_interacoes').delete().eq('id', inter.data?.[0]?.id).select('id')
  caso('APPEND-ONLY: apaga interação do chamado', 'negado', escrita(apInter), apInter.error?.message)

  const apProt = await dir.cliente.from('sac_protocolos').delete().eq('id', idProt).select('id')
  caso('chamado não se apaga fisicamente', 'negado', escrita(apProt), apProt.error?.message)

  // ------------------------------------------------------------------------ SAC (Operador)
  console.log('\nSAC — Operador (SEM a página sac):')
  caso('Operador lê chamado mesmo sendo o responsável', 'negado', await enxerga(o, 'sac_protocolos', idProt))
  caso('Operador lê interação do chamado', 'negado', await enxerga(o, 'sac_interacoes', inter.data?.[0]?.id))
  const opProt = await o
    .from('sac_protocolos')
    .insert({ grupo_clifor_id: d.grupo, tipo_ocorrencia_id: 1, prioridade_id: 1, descricao: NOME })
    .select('id')
  caso('Operador abre chamado', 'negado', escrita(opProt), opProt.error?.message)
  const opMuda = await o.from('sac_protocolos').update({ status_id: 2 }).eq('id', idProt).select('id')
  caso('Operador altera chamado', 'negado', escrita(opMuda), opMuda.error?.message)
  caso('Operador lê pesquisas', 'negado', await enxerga(o, 'pesquisas', d.pesq[NOME_PESQ_NPS]))

  // exclusão lógica: só perfil 1, com quem/quando
  const exclui = await dir.cliente
    .from('sac_protocolos')
    .update({ excluido_em: new Date().toISOString(), excluido_motivo: 'teste' })
    .eq('id', idProt)
    .select('excluido_por')
  caso('perfil 1 exclui logicamente, excluido_por carimbado', dir.id, exclui.data?.[0]?.excluido_por ?? exclui.error?.message)

  // ------------------------------------------------------------------- convite e token
  console.log('\nConvite e token (formulário público):')
  const conv = await dir.cliente
    .from('pesquisa_convites')
    .insert({ pesquisa_id: d.pesq[NOME_PESQ_NPS], cliente_id: d.grupo })
    .select('id')
  caso('perfil 1 cria convite direto (só servidor, 013 D7)', 'negado', escrita(conv), conv.error?.message)

  const [c1, c2, c3, c4, c5] = await exigir(
    admin
      .from('pesquisa_convites')
      .insert([1, 2, 3, 4].map(() => ({ pesquisa_id: d.pesq[NOME_PESQ_NPS], cliente_id: d.grupo, contato_id: d.contato })).concat([
        { pesquisa_id: d.pesq[NOME_PESQ_POS], cliente_id: d.grupo },
      ]))
      .select('id'),
    'convites',
  )

  const lerHash = await dir.cliente.from('pesquisa_convites').select('token_hash').eq('id', c1.id)
  caso('token_hash ilegível por authenticated (perfil 1)', 'negado', lerHash.error?.code === RECUSADO ? 'negado' : 'permitido')
  const lerTudo = await dir.cliente.from('pesquisa_convites').select('*').eq('id', c1.id)
  caso('select * no convite também recusa (a coluna do hash)', 'negado', lerTudo.error?.code === RECUSADO ? 'negado' : 'permitido')
  caso('perfil 1 lê o convite sem o hash', 'permitido', await enxerga(dir.cliente, 'pesquisa_convites', c1.id, 'id, usado_em, envios'))
  caso('Operador lê convite (sem página sac)', 'negado', await enxerga(o, 'pesquisa_convites', c1.id, 'id'))
  caso(
    'perfil 1 executa fn_pesquisa_emitir_token',
    'negado',
    rpcNegado(await dir.cliente.rpc('fn_pesquisa_emitir_token', { p_convite_id: c1.id })),
  )
  caso(
    'perfil 1 executa fn_pesquisa_responder',
    'negado',
    rpcNegado(await dir.cliente.rpc('fn_pesquisa_responder', { p_token: 'x'.repeat(43), p_nota_nps: 10 })),
  )
  const respDireta = await dir.cliente.from('pesquisa_respostas').insert({ convite_id: c1.id, nota_nps: 10 }).select('id')
  caso('perfil 1 grava resposta direto na tabela', 'negado', escrita(respDireta), respDireta.error?.message)

  const t1 = await emitir(c1.id)
  caso('token tem 43 caracteres base64url (256 bits)', true, /^[A-Za-z0-9_-]{43}$/.test(t1))
  const [guardado] = await exigir(admin.from('pesquisa_convites').select('token_hash, envios').eq('id', c1.id), 'ler hash')
  caso('banco guarda sha256(token), não o token', sha256hex(t1), byteaHex(guardado.token_hash))
  caso('o token em claro não aparece no que foi gravado', false, JSON.stringify(guardado).includes(t1))
  caso('emitir conta um envio', 1, guardado.envios)

  caso('token desconhecido → invalido', 'invalido', await responder(randomBytes(32).toString('base64url'), { p_nota_nps: 10 }))
  caso('token malformado → invalido', 'invalido', await responder("' or 1=1 --", { p_nota_nps: 10 }))
  caso('NPS sem nota → dados_invalidos', 'dados_invalidos', await responder(t1, {}))
  caso('nota fora de 0..10 → dados_invalidos', 'dados_invalidos', await responder(t1, { p_nota_nps: 11 }))
  caso('resposta válida → ok', 'ok', await responder(t1, { p_nota_nps: 9, p_comentario: NOME }))
  caso('USO ÚNICO: segunda resposta → respondido', 'respondido', await responder(t1, { p_nota_nps: 0 }))
  const { data: respostas } = await admin.from('pesquisa_respostas').select('nota_nps').eq('convite_id', c1.id)
  caso('a primeira resposta ficou intacta', '9', respostas?.length === 1 ? String(respostas[0].nota_nps) : `linhas ${respostas?.length}`)
  const reemite = await admin.rpc('fn_pesquisa_emitir_token', { p_convite_id: c1.id })
  caso('convite respondido não ganha token novo', 'P0002', reemite.error?.code ?? 'emitiu')
  caso('perfil 1 lê a resposta', 'permitido', (await dir.cliente.from('pesquisa_respostas').select('id').eq('convite_id', c1.id)).data?.length === 1 ? 'permitido' : 'negado')
  caso('Operador lê a resposta', 'negado', (await o.from('pesquisa_respostas').select('id').eq('convite_id', c1.id)).data?.length === 1 ? 'permitido' : 'negado')

  const velho = await emitir(c2.id)
  const novo = await emitir(c2.id)
  caso('REENVIO: token antigo morre → invalido', 'invalido', await responder(velho, { p_nota_nps: 10 }))
  caso('REENVIO: token novo vale → ok', 'ok', await responder(novo, { p_nota_nps: 10 }))

  const t3 = await emitir(c3.id)
  await exigir(admin.from('pesquisa_convites').update({ expira_em: '2000-01-01T00:00:00Z' }).eq('id', c3.id).select('id'), 'expirar')
  caso('PRAZO: token vencido → expirado', 'expirado', await responder(t3, { p_nota_nps: 10 }))
  const [conta3] = await exigir(admin.from('pesquisa_convites').select('tentativas').eq('id', c3.id), 'tentativas')
  caso('tentativa recusada é contada', 1, conta3.tentativas)

  const t4 = await emitir(c4.id)
  await exigir(
    admin.from('pesquisa_convites').update({ cancelado_em: new Date().toISOString(), cancelado_motivo: 'teste' }).eq('id', c4.id).select('id'),
    'cancelar',
  )
  caso('convite cancelado → invalido (não confirma existência)', 'invalido', await responder(t4, { p_nota_nps: 10 }))

  const t5 = await emitir(c5.id)
  caso('PÓS-VENDA sem nota de produto → dados_invalidos', 'dados_invalidos', await responder(t5, { p_nota_atendimento: 8 }))
  caso('PÓS-VENDA com as duas notas → ok', 'ok', await responder(t5, { p_nota_atendimento: 8, p_nota_produto: 7 }))

  // ------------------------------------------------------------------------------ fn_nps
  console.log('\nfn_nps (índice de verdade, 013 D10):')
  const notas = [10, 9, 9, 7, 3]
  const convs = await exigir(
    admin
      .from('pesquisa_convites')
      .insert([...notas, null].map(() => ({ pesquisa_id: d.pesq[NOME_PESQ_CONTA], cliente_id: d.grupo })))
      .select('id'),
    'convites nps',
  )
  for (let i = 0; i < notas.length; i++) {
    const t = await emitir(convs[i].id)
    const r = await responder(t, { p_nota_nps: notas[i] })
    if (r !== 'ok') throw new Error(`preparo (resposta nps ${i}): ${r}`)
  }
  const { data: nps, error: npsErro } = await dir.cliente.rpc('fn_nps', { p_pesquisa_id: d.pesq[NOME_PESQ_CONTA] })
  const n = nps?.[0]
  caso('convites (inclui o não respondido)', 6, n ? Number(n.convites) : npsErro?.message)
  caso('respondidas', 5, n ? Number(n.respondidas) : null)
  caso('promotores / neutros / detratores', '3/1/1', n ? `${n.promotores}/${n.neutros}/${n.detratores}` : null)
  caso('NPS = round(100 × (3 − 1) / 5) = 40', 40, n ? Number(n.nps) : null)
  caso('média = 38 / 5 = 7,60', '7.60', n ? Number(n.media).toFixed(2) : null)
  const { data: npsOp } = await o.rpc('fn_nps', { p_pesquisa_id: d.pesq[NOME_PESQ_CONTA] })
  caso('Operador (sem sac) vê zero convites pela RLS', 0, npsOp?.[0] ? Number(npsOp[0].convites) : null)
  const { data: npsVazio } = await dir.cliente.rpc('fn_nps', { p_pesquisa_id: d.pesq[NOME_PESQ_POS] })
  caso('sem nota NPS: nps nulo, sem divisão por zero', null, npsVazio?.[0] ? npsVazio[0].nps : 'erro')

  await dir.cliente.auth.signOut()
  await o.auth.signOut()

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
