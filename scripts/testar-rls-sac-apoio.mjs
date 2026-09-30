/**
 * Prova as metas trimestrais do Apoio Comercial (db/030): os 4 indicadores com um cenário de
 * números conhecidos, a regra "acompanhada x resolvida", a sinalização de parados, a RLS nova
 * (oportunidades, parâmetros, leitura dos chamados) e as travas (prazo, tipo da ação, convite
 * ligado a protocolo).
 *
 * Contas de QA do .env: QA_EMAIL/QA_SENHA (perfil 1) e QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA
 * (perfil 4 = a colaboradora do cenário). O Operador não tem a página `sac`; o teste a concede
 * por uma linha nominal em permissoes_pagina com `bubble_id = '__teste_sac_apoio__'`.
 *
 * Cenário no 3º trimestre de 2019 (jul–set; referência = 01/10/2019 00h de São Paulo), com
 * parâmetros próprios do trimestre: X = 5 dias sem atualização, prazo padrão 5 dias, mínimo de
 * 15 avaliações. Tudo é criado e apagado com service_role (que só PREPARA e LIMPA — sem
 * auth.uid() os triggers preservam as datas informadas). Nomes exatos com o prefixo.
 *
 *   1. Pesquisa: 8 convites NPS emitidos em ago pela colaboradora, 3 respostas (10, 8, 9)
 *      → 37,50% ≥ 25% (média 9,00) → 25. Fora: 1 removido, 1 emitido em out, 2 de outra pessoa.
 *   2. Avaliação: jul 5 notas (10,9,9,9,9 = 9,2), ago 10 (10 + 9×9 = 9,1), set 5 (10,10,9,9,9 =
 *      9,4) → média das médias 9,23 ≥ 9,0 com 20 ≥ 15 válidas → 25. (A média simples seria 9,20.)
 *   3. Oportunidades: 28 no trimestre (10 novos, 5 inativos, 7 interesse, 6 qualificadas) < 30 → 0.
 *   4. Acompanhamento — 8 ocorrências abertas no trimestre:
 *      A1 no prazo, com retorno | A2 no prazo (prazo padrão), SEM retorno |
 *      A3 resolvida atrasada, depende do fornecedor, cobrou + informou + motivo → ACOMPANHADA |
 *      A4 resolvida atrasada sem motivo → fora do prazo |
 *      A5 aberta, vencida, fornecedor cobrado, cliente informado 3 dias antes da referência,
 *         motivo → ACOMPANHADA (pendente, mas bem acompanhada: não penaliza) |
 *      A6 aberta, vencida, última ação há 41 dias → PARADA e fora do prazo |
 *      A7 aberta há 3 dias, prazo não venceu → em andamento (fora do cálculo) |
 *      A11 resolvida só DEPOIS da referência → conta como aberta; sem ação há 11 dias → PARADA.
 *      Prazo = (2 + 2) ÷ 7 = 57,14% | parados = 2 | retorno = 3 de 4 resolvidas = 75,00%.
 *   Total (tudo-ou-nada) = 25 + 25 + 0 + 0 = 50,00. Proporcional = 25 + 25 + 28 + 6,01 + 0 +
 *   3,95 = 87,96.
 *
 *   node scripts/testar-rls-sac-apoio.mjs
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

const NOME = '__teste_sac_apoio__'
const NOME_B = `${NOME} B`
const PESQ_NPS = `${NOME} NPS`
const PESQ_SAC = `${NOME} SAC`
const FN = 'fn_sac_apoio_indicadores'
const TRI = { p_ano: 2019, p_trimestre: 3 }
const RECUSADO = '42501'

const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })

const casos = []
function caso(nome, esperado, obtido) {
  const ok = String(esperado) === String(obtido)
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
}
const duas = (v) => (v === null || v === undefined ? 'null' : Number(v).toFixed(2))

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

async function painel(cliente, args = {}) {
  const { data, error } = await cliente.rpc(FN, { ...TRI, ...args })
  if (error) throw new Error(`${FN}: ${error.code} ${error.message}`)
  return data
}

const sp = (dia, hora = '10:00') => `${dia}T${hora}:00-03:00`

async function preparar(idDir, idOp) {
  await exigir(admin.from('permissoes_pagina').insert({ pagina_slug: 'sac', usuario_id: idOp, bubble_id: NOME }).select('id'), 'página sac')
  await exigir(
    admin
      .from('sac_apoio_parametros')
      .insert({ ano: 2019, trimestre: 3, dias_sem_atualizacao: 5, prazo_padrao_dias: 5, min_avaliacoes: 15, bubble_id: NOME })
      .select('id'),
    'parâmetros 2019/3',
  )
  const grupos = await exigir(
    admin.from('grupos_clifor').insert([{ tipo: 'cliente', nome: NOME }, { tipo: 'cliente', nome: NOME_B }]).select('id, nome'),
    'grupos',
  )
  const grupo = grupos.find((g) => g.nome === NOME).id
  const grupoB = grupos.find((g) => g.nome === NOME_B).id

  // ---------------------------------------------------------------- 4. acompanhamento
  const prot = (rotulo, x) => ({
    grupo_clifor_id: grupo,
    descricao: `${NOME} ${rotulo}`,
    prioridade_id: 1,
    tipo_ocorrencia_id: 1,
    status_id: x.fechado_em ? 4 : 1,
    criado_por: idDir,
    responsavel_id: idOp,
    ...x,
  })
  const protocolos = await exigir(
    admin
      .from('sac_protocolos')
      .insert([
        prot('A1', { aberto_em: sp('2019-07-01'), prazo_em: '2019-07-05', fechado_em: sp('2019-07-04') }),
        prot('A2', { aberto_em: sp('2019-07-02'), fechado_em: sp('2019-07-06') }),
        prot('A3', { aberto_em: sp('2019-07-10'), prazo_em: '2019-07-15', fechado_em: sp('2019-07-25'), depende_fornecedor: true, motivo_pendencia: 'fornecedor atrasou a reposição' }),
        prot('A4', { aberto_em: sp('2019-07-10'), prazo_em: '2019-07-15', fechado_em: sp('2019-07-30') }),
        prot('A5', { aberto_em: sp('2019-08-01'), prazo_em: '2019-08-10', depende_fornecedor: true, motivo_pendencia: 'aguardando peça do fornecedor' }),
        prot('A6', { aberto_em: sp('2019-08-05'), prazo_em: '2019-08-10', motivo_pendencia: 'cliente sumiu' }),
        prot('A7', { aberto_em: sp('2019-09-28') }),
        prot('A8', { aberto_em: sp('2019-07-03'), excluido_em: sp('2019-07-04'), excluido_motivo: NOME }),
        prot('A9', { aberto_em: sp('2019-07-15'), prazo_em: '2019-07-20', fechado_em: sp('2019-07-18'), responsavel_id: idDir }),
        prot('A10', { aberto_em: sp('2019-10-02') }),
        prot('A11', { aberto_em: sp('2019-09-20'), prazo_em: '2019-09-25', fechado_em: sp('2019-10-03') }),
      ])
      .select('id, descricao'),
    'protocolos',
  )
  const p = Object.fromEntries(protocolos.map((x) => [x.descricao.slice(NOME.length + 1), x.id]))
  const acao = (rotulo, tipo, dia, autor = idOp) => ({
    protocolo_id: p[rotulo],
    descricao: `${NOME} ${tipo}`,
    tipo_acao: tipo,
    autor_id: autor,
    criado_em: sp(dia, '12:00'),
  })
  await exigir(
    admin.from('sac_interacoes').insert([
      acao('A1', 'retorno_cliente', '2019-07-04'),
      acao('A3', 'cobranca_fornecedor', '2019-07-16'),
      acao('A3', 'contato_cliente', '2019-07-17'),
      acao('A4', 'retorno_cliente', '2019-07-30'),
      acao('A5', 'cobranca_fornecedor', '2019-09-20'),
      acao('A5', 'contato_cliente', '2019-09-28'),
      acao('A6', 'contato_cliente', '2019-08-20'),
      acao('A9', 'retorno_cliente', '2019-07-18', idDir),
      // depois da referência: não entra na foto do trimestre
      acao('A6', 'atualizacao_interna', '2019-10-05'),
    ]),
    'interações',
  )

  // ---------------------------------------------------------------- 1. pesquisa (NPS)
  const pesquisas = await exigir(
    admin.from('pesquisas').insert([{ nome: PESQ_NPS, tipo_id: 2 }, { nome: PESQ_SAC, tipo_id: 1 }]).select('id, nome'),
    'pesquisas',
  )
  const nps = pesquisas.find((x) => x.nome === PESQ_NPS).id
  const sac = pesquisas.find((x) => x.nome === PESQ_SAC).id
  const conv = (x) => ({ pesquisa_id: nps, cliente_id: grupo, criado_por: idOp, enviado_em: sp('2019-08-10'), envios: 1, ...x })
  const convites = await exigir(
    admin
      .from('pesquisa_convites')
      .insert([
        ...Array.from({ length: 8 }, () => conv({})),
        conv({ cancelado_em: sp('2019-08-11'), cancelado_motivo: NOME }),
        conv({ enviado_em: sp('2019-10-05') }),
        conv({ criado_por: idDir }),
        conv({ criado_por: idDir }),
      ])
      .select('id, criado_por, cancelado_em, enviado_em'),
    'convites NPS',
  )
  const daOp = convites.filter((c) => c.criado_por === idOp && !c.cancelado_em && c.enviado_em < '2019-10')
  const doDir = convites.filter((c) => c.criado_por === idDir)
  await exigir(
    admin.from('pesquisa_respostas').insert([
      { convite_id: daOp[0].id, nota_nps: 10, respondida_em: sp('2019-08-12') },
      { convite_id: daOp[1].id, nota_nps: 8, respondida_em: sp('2019-08-13') },
      // resposta que chega depois do fim do trimestre ainda conta (030 D7)
      { convite_id: daOp[2].id, nota_nps: 9, respondida_em: sp('2019-10-02') },
      { convite_id: doDir[0].id, nota_nps: 7, respondida_em: sp('2019-08-14') },
    ]),
    'respostas NPS',
  )

  // ---------------------------------------------------------------- 2. avaliação (SAC)
  const notas = [
    ...[10, 9, 9, 9, 9].map((n, i) => ({ n, dia: `2019-07-${String(10 + i).padStart(2, '0')}` })),
    ...[10, 9, 9, 9, 9, 9, 9, 9, 9, 9].map((n, i) => ({ n, dia: `2019-08-${String(10 + i).padStart(2, '0')}` })),
    ...[10, 10, 9, 9, 9].map((n, i) => ({ n, dia: `2019-09-${String(10 + i).padStart(2, '0')}` })),
    { n: 0, dia: '2019-10-05', rotulo: 'fora' }, // outubro: fora do trimestre
    { n: 10, dia: '2019-08-20', rotulo: 'dir', resp: idDir }, // de outra pessoa
  ]
  const avaliados = await exigir(
    admin
      .from('sac_protocolos')
      .insert(
        notas.map((x, i) => ({
          grupo_clifor_id: grupo,
          descricao: `${NOME} av ${i}`,
          prioridade_id: 1,
          tipo_ocorrencia_id: 1,
          status_id: 4,
          aberto_em: sp('2019-04-01'),
          fechado_em: sp('2019-04-02'),
          criado_por: idDir,
          responsavel_id: x.resp ?? idOp,
        })),
      )
      .select('id, descricao'),
    'protocolos avaliados',
  )
  const idAv = Object.fromEntries(avaliados.map((x) => [Number(x.descricao.split(' ').pop()), x.id]))
  const convAv = await exigir(
    admin
      .from('pesquisa_convites')
      .insert(notas.map((_, i) => ({ pesquisa_id: sac, cliente_id: grupo, protocolo_id: idAv[i], criado_por: idDir, enviado_em: sp('2019-04-02') })))
      .select('id, protocolo_id'),
    'convites de avaliação',
  )
  const convDoProt = Object.fromEntries(convAv.map((c) => [c.protocolo_id, c.id]))
  await exigir(
    admin
      .from('pesquisa_respostas')
      .insert(notas.map((x, i) => ({ convite_id: convDoProt[idAv[i]], nota_atendimento: x.n, respondida_em: sp(x.dia) }))),
    'avaliações',
  )

  // ---------------------------------------------------------------- 3. oportunidades
  const categorias = [
    ...Array(10).fill('novo_cliente'),
    ...Array(5).fill('inativo_recuperado'),
    ...Array(7).fill('interesse'),
    ...Array(6).fill('qualificada'),
  ]
  const resultado = (i) => (i < 6 ? 'encaminhada' : i === 6 ? 'venda_fechada' : i === 7 ? 'sem_interesse' : 'em_andamento')
  await exigir(
    admin.from('sac_oportunidades').insert([
      ...categorias.map((c, i) => ({
        prospect_nome: NOME,
        responsavel_id: idOp,
        categoria: c,
        resultado: resultado(i),
        vendedor_id: i < 7 ? idDir : null,
        identificada_em: `2019-${String(7 + (i % 3)).padStart(2, '0')}-15`,
        apresentacao_em: `2019-${String(7 + (i % 3)).padStart(2, '0')}-16`,
      })),
      { prospect_nome: NOME, responsavel_id: idOp, categoria: 'interesse', identificada_em: '2019-06-30' },
      { prospect_nome: NOME, responsavel_id: idDir, categoria: 'interesse', identificada_em: '2019-08-01' },
      { prospect_nome: NOME, responsavel_id: idDir, categoria: 'qualificada', identificada_em: '2019-08-02' },
    ]),
    'oportunidades',
  )

  return { p, grupo, grupoB, sac }
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
  const { data: pesq } = await admin.from('pesquisas').select('id').in('nome', [PESQ_NPS, PESQ_SAC])
  const idsPesq = (pesq ?? []).map((x) => x.id)
  if (idsPesq.length) {
    const { data: conv } = await admin.from('pesquisa_convites').select('id').in('pesquisa_id', idsPesq)
    const idsConv = (conv ?? []).map((x) => x.id)
    if (idsConv.length) {
      registrar('pesquisa_respostas', await admin.from('pesquisa_respostas').delete().in('convite_id', idsConv).select('id'))
      registrar('pesquisa_convites', await admin.from('pesquisa_convites').delete().in('id', idsConv).select('id'))
    }
    registrar('pesquisas', await admin.from('pesquisas').delete().in('id', idsPesq).select('id'))
  }
  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', [NOME, NOME_B])
  const ids = (grupos ?? []).map((x) => x.id)
  if (ids.length) {
    registrar('sac_protocolos', await admin.from('sac_protocolos').delete().in('grupo_clifor_id', ids).select('id'))
    registrar('grupos', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  registrar('sac_oportunidades', await admin.from('sac_oportunidades').delete().in('prospect_nome', [NOME]).select('id'))
  registrar('sac_apoio_parametros', await admin.from('sac_apoio_parametros').delete().in('bubble_id', [NOME]).select('id'))
  registrar('permissoes_pagina', await admin.from('permissoes_pagina').delete().in('bubble_id', [NOME]).select('id'))
  console.log(`\nlimpeza — ${passos.join(', ')}`)
}

async function main() {
  for (const chave of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'QA_EMAIL', 'QA_SENHA', 'QA_OPERADOR_EMAIL', 'QA_OPERADOR_SENHA']) {
    if (!env[chave]) throw new Error(`${chave} não está no .env`)
  }
  await limpar()
  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const { p, grupo, grupoB } = await preparar(dir.id, op.id)

  console.log('anon:')
  const anon = createClient(URL, ANON, { auth: { persistSession: false } })
  caso('não executa o painel', RECUSADO, (await anon.rpc(FN, TRI)).error?.code ?? 'sem erro')
  caso('não executa o acompanhamento', RECUSADO, (await anon.rpc('fn_sac_acompanhamento')).error?.code ?? 'sem erro')
  caso('não lê oportunidades', RECUSADO, (await anon.from('sac_oportunidades').select('id').limit(1)).error?.code ?? 'sem erro')
  caso('não lê parâmetros', RECUSADO, (await anon.from('sac_apoio_parametros').select('id').limit(1)).error?.code ?? 'sem erro')

  console.log('\nColaboradora (perfil 4) — o próprio painel:')
  const o = await painel(op.cliente)
  caso('o painel é o dela mesmo sem pedir (D12)', op.id, o.periodo.responsavel)
  caso('trimestre encerrado', true, o.periodo.encerrado)
  caso('1. convites emitidos no trimestre', 8, o.pesquisa.enviadas)
  caso('1. responderam (inclui a resposta de outubro)', 3, o.pesquisa.respondidas)
  caso('1. % de respostas', '37.50', duas(o.pesquisa.realizado))
  caso('1. média das notas', '9.00', duas(o.pesquisa.media))
  caso('1. atingida → nota 25', '25.00', duas(o.pesquisa.nota))
  caso('2. avaliações válidas', 20, o.avaliacao.validas)
  caso('2. médias mensais jul/ago/set', '9.20/9.10/9.40', o.avaliacao.mensal.map((m) => duas(m.media)).join('/'))
  caso('2. média das médias mensais (não 9,20 da simples)', '9.23', duas(o.avaliacao.realizado))
  caso('2. atingida → nota 25', '25.00', duas(o.avaliacao.nota))
  caso('3. oportunidades no trimestre', 28, o.oportunidades.realizado)
  caso('3. por categoria', '10/5/7/6', ['novo_cliente', 'inativo_recuperado', 'interesse', 'qualificada'].map((k) => o.oportunidades.por_categoria[k]).join('/'))
  caso('3. encaminhadas ao comercial', 6, o.oportunidades.por_resultado.encaminhada)
  caso('3. abaixo de 30 → nota 0', '0.00', duas(o.oportunidades.nota))
  const a = o.acompanhamento
  caso('4. ocorrências (sem a excluída, a de outro e a de outubro)', 8, a.total)
  caso('4. resolvidas na referência (A11 fechou depois)', 4, a.resolvidas)
  caso('4. abertas', 4, a.abertas)
  caso('4. no prazo / acompanhadas / fora / em andamento', '2/2/3/1', `${a.no_prazo}/${a.acompanhadas}/${a.fora_prazo}/${a.em_andamento}`)
  caso('4. resolvidas no prazo ou acompanhadas = 4/7', '57.14', duas(a.prazo.realizado))
  caso('4. parados há mais de 5 dias (A6 e A11)', 2, a.parados)
  caso('4. retorno ao cliente: 3 de 4 resolvidas', '75.00', duas(a.retorno.realizado))
  caso('4. com cliente informado', 5, a.com_retorno)
  caso('4. com todas as ações registradas (A1, A3, A5)', 3, a.com_acoes_completas)
  caso('4. nota do bloco (tudo-ou-nada)', '0.00', duas(a.nota))
  caso('TOTAL ponderado', '50.00', duas(o.total))
  const oDir = await painel(op.cliente, { p_responsavel: dir.id })
  caso('SIGILO: pedir o painel do perfil 1 devolve o dela', `${op.id} 50.00`, `${oDir.periodo.responsavel} ${duas(oDir.total)}`)

  console.log('\nPerfil 1:')
  const d1 = await painel(dir.cliente, { p_responsavel: op.id })
  caso('o painel da colaboradora é o mesmo', '50.00', duas(d1.total))
  const todos = await painel(dir.cliente)
  caso('todos: convites 10, respostas 4 (40%)', '10/4/40.00', `${todos.pesquisa.enviadas}/${todos.pesquisa.respondidas}/${duas(todos.pesquisa.realizado)}`)
  caso('todos: avaliação 21 válidas, média das médias 9,26', '21/9.26', `${todos.avaliacao.validas}/${duas(todos.avaliacao.realizado)}`)
  caso('todos: 30 oportunidades → atingida', '30/30.00', `${todos.oportunidades.realizado}/${duas(todos.oportunidades.nota)}`)
  caso('todos: total', '80.00', duas(todos.total))

  console.log('\nParâmetros (só perfil 1):')
  const upOp = await op.cliente.from('sac_apoio_parametros').update({ nota_proporcional: true }).eq('bubble_id', NOME).select('id')
  caso('colaboradora não altera (0 linhas)', 0, upOp.error ? upOp.error.code : upOp.data.length)
  const insOp = await op.cliente.from('sac_apoio_parametros').insert({ ano: 2019, trimestre: 2 })
  caso('colaboradora não cria', RECUSADO, insOp.error?.code ?? 'sem erro')
  const pesos = await dir.cliente.from('sac_apoio_parametros').update({ peso_prazo: 11 }).eq('bubble_id', NOME).select('id')
  caso('pesos que não somam 100 são recusados', '23514', pesos.error?.code ?? 'sem erro')
  await exigir(dir.cliente.from('sac_apoio_parametros').update({ nota_proporcional: true }).eq('bubble_id', NOME).select('id'), 'proporcional')
  const pr = await painel(op.cliente)
  caso('proporcional: oportunidades 30 × 28/30', '28.00', duas(pr.oportunidades.nota))
  caso('proporcional: prazo 10 × 57,14/95', '6.01', duas(pr.acompanhamento.prazo.nota))
  caso('proporcional: parados continua 0', '0.00', duas(pr.acompanhamento.parados_ind.nota))
  caso('proporcional: retorno 5 × 75/95', '3.95', duas(pr.acompanhamento.retorno.nota))
  caso('proporcional: total', '87.96', duas(pr.total))
  await exigir(dir.cliente.from('sac_apoio_parametros').update({ nota_proporcional: false, min_avaliacoes: 25 }).eq('bubble_id', NOME).select('id'), 'mínimo 25')
  const mi = await painel(op.cliente)
  caso('mínimo de 25 avaliações: amostra insuficiente → 0', 'false/0.00', `${mi.avaliacao.suficiente}/${duas(mi.avaliacao.nota)}`)
  caso('parâmetro de 2019/3 não vaza para 2026', 3, (await painel(dir.cliente, { p_ano: 2026, p_trimestre: 3 })).parametros.dias_sem_atualizacao)

  console.log('\nOportunidades (RLS):')
  const vistasOp = await op.cliente.from('sac_oportunidades').select('id', { count: 'exact', head: true }).eq('prospect_nome', NOME)
  caso('colaboradora vê só as dela (28 + a de junho)', 29, vistasOp.count)
  const vistasDir = await dir.cliente.from('sac_oportunidades').select('id', { count: 'exact', head: true }).eq('prospect_nome', NOME)
  caso('perfil 1 vê todas', 31, vistasDir.count)
  const alheia = await op.cliente.from('sac_oportunidades').insert({ prospect_nome: NOME, categoria: 'interesse', responsavel_id: dir.id })
  caso('não registra em nome de outra pessoa', RECUSADO, alheia.error?.code ?? 'sem erro')
  const propria = await op.cliente
    .from('sac_oportunidades')
    .insert({ prospect_nome: NOME, categoria: 'interesse', identificada_em: '2019-12-01' })
    .select('id, responsavel_id, criado_por')
    .single()
  caso('registra a própria (responsável = ela por padrão)', `${op.id}/${op.id}`, `${propria.data?.responsavel_id}/${propria.data?.criado_por}`)
  const { data: dasDir } = await admin.from('sac_oportunidades').select('id').eq('prospect_nome', NOME).eq('responsavel_id', dir.id).limit(1)
  const mexe = await op.cliente.from('sac_oportunidades').update({ resultado: 'sem_interesse' }).eq('id', dasDir[0].id).select('id')
  caso('não altera a de outra pessoa (0 linhas)', 0, mexe.data?.length ?? mexe.error?.code)
  const encSemVend = await op.cliente.from('sac_oportunidades').update({ resultado: 'encaminhada' }).eq('id', propria.data.id).select('id')
  caso('encaminhada exige vendedor', '23514', encSemVend.error?.code ?? 'sem erro')
  const apaga = await op.cliente.from('sac_oportunidades').delete().eq('id', propria.data.id).select('id')
  caso('apaga a própria', 1, apaga.data?.length ?? apaga.error?.code)

  console.log('\nSinalização de parados (agora):')
  const { data: fresco } = await admin
    .from('sac_protocolos')
    .insert({ grupo_clifor_id: grupo, descricao: `${NOME} F`, prioridade_id: 1, tipo_ocorrencia_id: 1, criado_por: dir.id, responsavel_id: op.id })
    .select('id')
    .single()
  const ag = await op.cliente.rpc('fn_sac_acompanhamento', { p_ids: [p.A6, fresco.id] })
  if (ag.error) throw new Error(`fn_sac_acompanhamento: ${ag.error.message}`)
  const porId = Object.fromEntries(ag.data.map((x) => [x.protocolo_id, x]))
  caso('A6 (sem ação desde 2019) está parado', true, porId[p.A6]?.parado)
  caso('A6: a ação de out/2019 conta agora como a última', '2019-10-05', porId[p.A6]?.ultima_acao_em?.slice(0, 10))
  caso('chamado aberto agora não está parado', 'false/em_andamento', `${porId[fresco.id]?.parado}/${porId[fresco.id]?.situacao}`)
  caso('X dias vem dos parâmetros do trimestre corrente', true, Number.isInteger(porId[fresco.id]?.dias_limite))
  const cont = await op.cliente.rpc('fn_sac_acompanhamento', {}, { count: 'exact', head: true }).eq('parado', true)
  caso('contador de parados da colaboradora (A5, A6, A7, A10; A11 já fechou)', 4, cont.count)
  const contDir = await dir.cliente.rpc('fn_sac_acompanhamento', {}, { count: 'exact', head: true }).eq('parado', true).in('protocolo_id', [p.A5, p.A6, p.A7, p.A10, p.A11, fresco.id])
  caso('perfil 1 vê os mesmos parados', 4, contDir.count)

  console.log('\nTravas:')
  const pz1 = await op.cliente.from('sac_protocolos').update({ prazo_em: '2099-01-10' }).eq('id', fresco.id).select('id')
  caso('responsável define o prazo pela 1ª vez', 1, pz1.data?.length ?? pz1.error?.code)
  const pz2 = await op.cliente.from('sac_protocolos').update({ prazo_em: '2099-02-10' }).eq('id', fresco.id).select('id')
  caso('responsável NÃO empurra prazo já definido', RECUSADO, pz2.error?.code ?? 'sem erro')
  const pz3 = await dir.cliente.from('sac_protocolos').update({ prazo_em: '2099-02-10' }).eq('id', fresco.id).select('id')
  caso('perfil 1 altera o prazo', 1, pz3.data?.length ?? pz3.error?.code)
  const pz4 = await dir.cliente.from('sac_protocolos').update({ prazo_em: '2000-01-01' }).eq('id', fresco.id).select('id')
  caso('prazo antes da abertura é recusado', '23514', pz4.error?.code ?? 'sem erro')
  const tipoRuim = await op.cliente.from('sac_interacoes').insert({ protocolo_id: fresco.id, descricao: NOME, autor_id: op.id, tipo_acao: 'fofoca' })
  caso('tipo de ação desconhecido é recusado', '23514', tipoRuim.error?.code ?? 'sem erro')
  await exigir(
    op.cliente.from('sac_interacoes').insert({ protocolo_id: fresco.id, descricao: NOME, autor_id: op.id, tipo_acao: 'cobranca_fornecedor' }).select('id'),
    'cobrança',
  )
  const depois = await op.cliente.rpc('fn_sac_acompanhamento', { p_ids: [fresco.id] })
  caso('cobrança registrada: fornecedor cobrado e aplicável (D5)', 'true/true', `${depois.data?.[0]?.fornecedor_cobrado}/${depois.data?.[0]?.aplica_fornecedor}`)
  const convErrado = await admin.from('pesquisa_convites').insert({ pesquisa_id: (await admin.from('pesquisas').select('id').eq('nome', PESQ_SAC).single()).data.id, cliente_id: grupoB, protocolo_id: fresco.id })
  caso('convite de avaliação de outro cliente é recusado', '23514', convErrado.error?.code ?? 'sem erro')
  const colunaConvite = await op.cliente.from('pesquisa_convites').select('protocolo_id').not('protocolo_id', 'is', null).limit(1)
  caso('protocolo_id do convite é legível (GRANT de coluna)', 'sem erro', colunaConvite.error?.code ?? 'sem erro')

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
