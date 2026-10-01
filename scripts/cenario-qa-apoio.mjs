/**
 * Cenário de QA da aba Apoio Comercial (db/030): dados de exemplo no 3º trimestre de 2026
 * para a conta QA_EMAIL (perfil 1) aparecer com números em todos os blocos do painel —
 * ocorrências em cada situação, chamados parados agora, pesquisa NPS, avaliações mensais e
 * oportunidades. Só para captura de tela; nada disso é dado real.
 *
 *   node scripts/cenario-qa-apoio.mjs            (limpa o anterior e cria)
 *   node scripts/cenario-qa-apoio.mjs --limpar   (só limpa)
 *
 * Tudo com o prefixo "QA Apoio ·" (nomes) e criado/apagado com service_role.
 */

import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

const env = {}
for (const linha of readFileSync('.env', 'utf8').split('\n')) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const P = 'QA Apoio ·'
const sp = (dia, hora = '10:00') => `${dia}T${hora}:00-03:00`
const SEM_NULL = { defaultToNull: false }

async function exigir(promessa, oque) {
  const { data, error } = await promessa
  if (error) throw new Error(`${oque}: ${error.message}`)
  return data
}

async function limpar() {
  const { data: pesq } = await admin.from('pesquisas').select('id').like('nome', `${P}%`)
  const idsPesq = (pesq ?? []).map((x) => x.id)
  if (idsPesq.length) {
    const { data: conv } = await admin.from('pesquisa_convites').select('id').in('pesquisa_id', idsPesq)
    const idsConv = (conv ?? []).map((x) => x.id)
    if (idsConv.length) {
      await exigir(admin.from('pesquisa_respostas').delete().in('convite_id', idsConv), 'limpar respostas')
      await exigir(admin.from('pesquisa_convites').delete().in('id', idsConv), 'limpar convites')
    }
    await exigir(admin.from('pesquisas').delete().in('id', idsPesq), 'limpar pesquisas')
  }
  const { data: grupos } = await admin.from('grupos_clifor').select('id').like('nome', `${P}%`)
  const ids = (grupos ?? []).map((x) => x.id)
  if (ids.length) {
    await exigir(admin.from('sac_oportunidades').delete().in('grupo_clifor_id', ids), 'limpar oportunidades de cliente')
    await exigir(admin.from('sac_protocolos').delete().in('grupo_clifor_id', ids), 'limpar protocolos')
    await exigir(admin.from('grupos_clifor').delete().in('id', ids), 'limpar grupos')
  }
  await exigir(admin.from('sac_oportunidades').delete().like('prospect_nome', `${P}%`), 'limpar prospects')
  console.log('cenário anterior limpo')
}

async function criar() {
  const { data: login } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  }).auth.signInWithPassword({ email: env.QA_EMAIL, password: env.QA_SENHA })
  if (!login?.user) throw new Error('não autenticou a conta QA_EMAIL')
  const eu = login.user.id

  const nomes = ['Distribuidora Aurora', 'Mercado Bom Preço', 'Rede Central', 'Atacado Serra', 'Empório Lima', 'Casa Nova Utilidades']
  const grupos = await exigir(
    admin.from('grupos_clifor').insert(nomes.map((n) => ({ tipo: 'cliente', nome: `${P} ${n}` }))).select('id, nome'),
    'grupos',
  )
  const g = (i) => grupos[i % grupos.length].id

  // ------------------------------------------------------------ ocorrências do 3º tri
  const prot = (i, x) => ({
    grupo_clifor_id: g(i),
    descricao: `${P} ocorrência ${i}`,
    prioridade_id: 1 + (i % 3),
    tipo_ocorrencia_id: 1,
    status_id: x.fechado_em ? 4 : 1,
    criado_por: eu,
    responsavel_id: eu,
    ...x,
  })
  const linhas = [
    prot(0, { aberto_em: sp('2026-07-02'), prazo_em: '2026-07-07', fechado_em: sp('2026-07-06') }),
    prot(1, { aberto_em: sp('2026-07-08'), fechado_em: sp('2026-07-10') }),
    prot(2, { aberto_em: sp('2026-07-14'), prazo_em: '2026-07-18', fechado_em: sp('2026-07-17') }),
    prot(3, { aberto_em: sp('2026-07-21'), prazo_em: '2026-07-24', fechado_em: sp('2026-08-04'), depende_fornecedor: true, motivo_pendencia: 'Fornecedor atrasou a reposição do lote' }),
    prot(4, { aberto_em: sp('2026-08-03'), prazo_em: '2026-08-06', fechado_em: sp('2026-08-05') }),
    prot(5, { aberto_em: sp('2026-08-11'), prazo_em: '2026-08-14', fechado_em: sp('2026-08-25') }),
    prot(6, { aberto_em: sp('2026-08-18'), fechado_em: sp('2026-08-20') }),
    prot(7, { aberto_em: sp('2026-09-01'), prazo_em: '2026-09-04', fechado_em: sp('2026-09-03') }),
    prot(8, { aberto_em: sp('2026-09-08'), prazo_em: '2026-09-15', depende_fornecedor: true, motivo_pendencia: 'Aguardando peça do fornecedor' }),
    prot(9, { aberto_em: sp('2026-09-15'), prazo_em: '2026-09-19', motivo_pendencia: 'Cliente não retornou' }),
    prot(10, { aberto_em: sp('2026-09-24') }),
    prot(11, { aberto_em: sp('2026-09-29') }),
  ]
  const protocolos = await exigir(admin.from('sac_protocolos').insert(linhas, SEM_NULL).select('id, descricao'), 'protocolos')
  const id = (i) => protocolos.find((x) => x.descricao === `${P} ocorrência ${i}`).id
  const acao = (i, tipo, dia) => ({ protocolo_id: id(i), descricao: `${P} ${tipo}`, tipo_acao: tipo, autor_id: eu, criado_em: sp(dia, '15:00') })
  await exigir(
    admin.from('sac_interacoes').insert([
      acao(0, 'retorno_cliente', '2026-07-06'),
      acao(1, 'retorno_cliente', '2026-07-10'),
      acao(2, 'contato_cliente', '2026-07-15'),
      acao(2, 'retorno_cliente', '2026-07-17'),
      acao(3, 'cobranca_fornecedor', '2026-07-25'),
      acao(3, 'contato_cliente', '2026-07-28'),
      acao(3, 'retorno_cliente', '2026-08-04'),
      acao(4, 'retorno_cliente', '2026-08-05'),
      acao(5, 'atualizacao_interna', '2026-08-20'),
      acao(6, 'retorno_cliente', '2026-08-20'),
      acao(7, 'retorno_cliente', '2026-09-03'),
      acao(8, 'cobranca_fornecedor', '2026-09-22'),
      acao(8, 'contato_cliente', '2026-09-30'),
      acao(9, 'contato_cliente', '2026-09-17'),
    ]),
    'interações',
  )

  // ------------------------------------------------------------ pesquisa NPS (agosto)
  const pesquisas = await exigir(
    admin.from('pesquisas').insert([{ nome: `${P} NPS 3º tri`, tipo_id: 2 }, { nome: `${P} Avaliação SAC`, tipo_id: 1 }]).select('id, tipo_id'),
    'pesquisas',
  )
  const nps = pesquisas.find((x) => x.tipo_id === 2).id
  const sac = pesquisas.find((x) => x.tipo_id === 1).id
  const convNps = await exigir(
    admin
      .from('pesquisa_convites')
      .insert(Array.from({ length: 14 }, (_, i) => ({ pesquisa_id: nps, cliente_id: g(i), criado_por: eu, enviado_em: sp(`2026-08-${String(3 + i).padStart(2, '0')}`), envios: 1 })))
      .select('id'),
    'convites NPS',
  )
  await exigir(
    admin.from('pesquisa_respostas').insert([10, 9, 7, 10].map((n, i) => ({ convite_id: convNps[i].id, nota_nps: n, respondida_em: sp(`2026-08-${String(10 + i).padStart(2, '0')}`) }))),
    'respostas NPS',
  )

  // ------------------------------------------------------------ avaliação do atendimento
  const notas = [
    ...[10, 9, 9, 10].map((n, i) => ({ n, dia: `2026-07-${String(10 + i).padStart(2, '0')}` })),
    ...[9, 9, 8, 10, 9, 10].map((n, i) => ({ n, dia: `2026-08-${String(10 + i).padStart(2, '0')}` })),
    ...[10, 9, 10, 9, 10].map((n, i) => ({ n, dia: `2026-09-${String(10 + i).padStart(2, '0')}` })),
  ]
  const avaliados = await exigir(
    admin
      .from('sac_protocolos')
      .insert(
        notas.map((x, i) => ({
          grupo_clifor_id: g(i),
          descricao: `${P} avaliado ${i}`,
          prioridade_id: 1,
          tipo_ocorrencia_id: 1,
          status_id: 4,
          aberto_em: sp('2026-06-01'),
          fechado_em: sp('2026-06-03'),
          criado_por: eu,
          responsavel_id: eu,
        })),
      )
      .select('id, grupo_clifor_id, descricao'),
    'protocolos avaliados',
  )
  const convAv = await exigir(
    admin
      .from('pesquisa_convites')
      .insert(avaliados.map((a) => ({ pesquisa_id: sac, cliente_id: a.grupo_clifor_id, protocolo_id: a.id, criado_por: eu, enviado_em: sp('2026-06-03') })))
      .select('id, protocolo_id'),
    'convites de avaliação',
  )
  const porProt = Object.fromEntries(convAv.map((c) => [c.protocolo_id, c.id]))
  await exigir(
    admin.from('pesquisa_respostas').insert(
      avaliados.map((a) => {
        const i = Number(a.descricao.split(' ').pop())
        return { convite_id: porProt[a.id], nota_atendimento: notas[i].n, respondida_em: sp(notas[i].dia) }
      }),
    ),
    'avaliações',
  )

  // ------------------------------------------------------------ oportunidades
  const cats = ['novo_cliente', 'novo_cliente', 'inativo_recuperado', 'interesse', 'qualificada', 'novo_cliente', 'interesse']
  const res = ['encaminhada', 'em_andamento', 'venda_fechada', 'em_andamento', 'encaminhada', 'sem_interesse', 'em_andamento']
  await exigir(
    admin.from('sac_oportunidades').insert(
      Array.from({ length: 24 }, (_, i) => {
        const resultado = res[i % res.length]
        const cliente = i % 3 === 0
        return {
          ...(cliente ? { grupo_clifor_id: g(i) } : { prospect_nome: `${P} Prospect ${i + 1}`, prospect_contato: `(11) 9${String(1000 + i)}-0000` }),
          responsavel_id: eu,
          vendedor_id: resultado === 'encaminhada' || resultado === 'venda_fechada' ? eu : null,
          categoria: cats[i % cats.length],
          resultado,
          identificada_em: `2026-${String(7 + (i % 3)).padStart(2, '0')}-${String(5 + (i % 20)).padStart(2, '0')}`,
          apresentacao_em: i % 2 ? `2026-${String(7 + (i % 3)).padStart(2, '0')}-${String(6 + (i % 20)).padStart(2, '0')}` : null,
        }
      }),
      SEM_NULL,
    ),
    'oportunidades',
  )
  console.log(`cenário criado: ${protocolos.length} ocorrências, 14 convites NPS, ${notas.length} avaliações, 24 oportunidades`)
}

try {
  await limpar()
  if (!process.argv.includes('--limpar')) await criar()
} catch (erro) {
  console.error(`FALHA  ${erro.message}`)
  process.exitCode = 1
}
