/**
 * Cenário de QA da página /metas (fatia 8) — cria e apaga.
 *
 * Hoje não há entrega carregada (a carga do Bubble não rodou), então o realizado de toda meta
 * é zero e a tela não mostra nada que valha fotografar. Este script monta um cenário mínimo
 * PELAS FUNÇÕES DO BANCO, autenticado como o perfil 1 de QA (QA_EMAIL/QA_SENHA): confirma
 * entregas com `fn_confirmar_entrega`, cria metas pela tabela (RLS de verdade) e fecha a do mês
 * anterior com `fn_fechar_meta`. O esqueleto que a RLS não deixa criar do nada (cliente,
 * fornecedor, cotação, pedido, entrega crua, nível) vai por service_role — que nunca afirma nada.
 *
 *   node scripts/cenario-qa-metas.mjs criar    # monta (limpa antes, se sobrou algo)
 *   node scripts/cenario-qa-metas.mjs limpar   # apaga tudo o que tem o prefixo
 *
 * Tudo nasce com o prefixo exato `__qa_metas__` e é apagado com `in`/`eq` (nunca `like`).
 * O que a TELA cria durante o QA (meta, fechamento, CP da comissão, histórico de nível) é
 * achado pelos níveis de QA, pelos vendedores de QA e pela hora de início gravada em
 * qa/metas-cenario.json (qa/ fica fora do git). A página `metas` concedida ao Operador de QA
 * é removida pelo bubble_id da linha. Fica para trás só a trilha em `auditoria` (append-only).
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
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

const NOME = '__qa_metas__'
const NOME_CLIENTE = `${NOME}cliente`
const NOME_FORNECEDOR = `${NOME}fornecedor`
const NIVEIS = [
  // fatores em FRAÇÃO (011 D1)
  { nome: `${NOME}junior`, ordem: 32101, meta_venda: '200.00', comissao_padrao: '0.0333', comissao_meta_batida: '0.0725', qtd_meta_batida: 3 },
  { nome: `${NOME}pleno`, ordem: 32102, meta_venda: '400.00', comissao_padrao: '0.0400', comissao_meta_batida: '0.0800', qtd_meta_batida: 3 },
]
// a tela pode criar mais níveis durante o QA: usar estes nomes
const NOMES_NIVEL = [...NIVEIS.map((n) => n.nome), `${NOME}senior`]
const ESTADO = 'qa/metas-cenario.json'
const PRAZOS = [11, 18, 20] // 30/60/90 dd (003)

if (!URL || !ANON || !SERVICE || !env.QA_EMAIL || !env.QA_OPERADOR_EMAIL) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY ou as contas de QA no .env')
  process.exit(1)
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })

async function entrar(email, senha) {
  const cliente = createClient(URL, ANON, { auth: { persistSession: false } })
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(`não autenticou ${email}: ${error.message}`)
  return { cliente, id: data.user.id }
}

async function exigir(promessa, oque) {
  const { data, error } = await promessa
  if (error) throw new Error(`${oque}: ${error.message}`)
  return data
}

const hojeSP = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date())
function mesDe(data, delta = 0) {
  const [a, m] = data.split('-').map(Number)
  const t = a * 12 + (m - 1) + delta
  const ano = Math.floor(t / 12)
  const mes = (t % 12) + 1
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  const mm = String(mes).padStart(2, '0')
  return { inicio: `${ano}-${mm}-01`, fim: `${ano}-${mm}-${ultimo}`, dia: (d) => `${ano}-${mm}-${String(d).padStart(2, '0')}` }
}

// ------------------------------------------------------------------------------- criar
async function criar() {
  const inicio = new Date().toISOString()
  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const D = dir.cliente

  const { data: originais } = await admin.from('usuarios').select('id, nivel_vendedor_id').in('id', [dir.id, op.id])
  await mkdir('qa', { recursive: true })
  await writeFile(ESTADO, JSON.stringify({ inicio, usuarios: originais, dir: dir.id, op: op.id }, null, 2))

  // --- esqueleto comercial (service_role; mesmo molde de scripts/testar-rls-financeiro.mjs)
  const grupos = await exigir(
    admin.from('grupos_clifor').insert([{ tipo: 'cliente', nome: NOME_CLIENTE }, { tipo: 'fornecedor', nome: NOME_FORNECEDOR }]).select('id, tipo'),
    'grupos',
  )
  const cliente = grupos.find((g) => g.tipo === 'cliente').id
  const fornecedor = grupos.find((g) => g.tipo === 'fornecedor').id
  const enderecos = await exigir(
    admin
      .from('enderecos_clifor')
      .insert([
        { grupo_id: cliente, nome_endereco: NOME, tipo_pessoa: 'cnpj', regime_tributario_id: 1, uf: 'GO' },
        { grupo_id: fornecedor, nome_endereco: NOME, tipo_pessoa: 'cnpj', regime_tributario_id: 1, uf: 'SP' },
      ])
      .select('id, grupo_id'),
    'endereços',
  )
  const destino = enderecos.find((e) => e.grupo_id === cliente).id
  const origem = enderecos.find((e) => e.grupo_id === fornecedor).id
  const [produto] = await exigir(admin.from('produtos').insert({ nome: NOME }).select('id'), 'produto')

  const [cot] = await exigir(
    admin.from('cotacoes').insert({ cliente_id: cliente, vendedor_id: op.id, empresa_emissora_id: 1 }).select('id'),
    'cotação',
  )
  // As entregas são do OPERADOR de QA: o Diretor de QA recebe entregas de teste de outros
  // scripts (financeiro), e elas entrariam no realizado dele.
  // comissões: 123,46 + 76,55 = 200,01 (a meta Regular fecha em exatamente 100%); 50,00 coberta
  // pelo Diretor (Substituição); 80,00 no mês anterior (meta fechada)
  const comissoes = ['123.46', '76.55', '50.00', '80.00']
  const itens = await exigir(
    admin
      .from('cotacao_itens')
      .insert(comissoes.map(() => ({ cotacao_id: cot.id, produto_id: produto.id, qtd: 1, endereco_destino_id: destino })))
      .select('id'),
    'itens',
  )
  const orcs = await exigir(
    admin
      .from('orcamentos_fornecedor')
      .insert(
        comissoes.map((c, i) => ({
          cotacao_id: cot.id,
          cotacao_item_id: itens[i].id,
          fornecedor_id: fornecedor,
          endereco_origem_id: origem,
          endereco_destino_id: destino,
          produto_id: produto.id,
          vendedor_id: op.id,
          qtd_venda: 1,
          tipo_frete_id: 1,
          aliquota_icms: '0.1200',
          aliquota_pis_cofins: '0.0925',
          vencedor: true,
          valor_venda_unit: '1000.00',
          valor_comissao_unit: c,
        })),
      )
      .select('id, valor_comissao_unit'),
    'orçamentos',
  )
  const orcDe = (c) => orcs.find((o) => Number(o.valor_comissao_unit) === Number(c)).id
  const [prop] = await exigir(
    admin.from('propostas').insert({ cotacao_id: cot.id, numero: 1, vendedor_id: op.id, data_prev_entrega: '2030-01-15' }).select('id'),
    'proposta',
  )
  await exigir(admin.from('proposta_itens').insert(orcs.map((o) => ({ proposta_id: prop.id, orcamento_fornecedor_id: o.id }))).select('id'), 'itens da proposta')
  const [ped] = await exigir(admin.from('pedidos').insert({ proposta_id: prop.id, cotacao_id: cot.id, vendedor_id: op.id }).select('id'), 'pedido')
  await exigir(admin.from('pedido_prazos').insert(PRAZOS.map((p) => ({ pedido_id: ped.id, prazo_id: p }))).select('prazo_id'), 'prazos')
  const entregas = await exigir(
    admin.from('entregas').insert(comissoes.map((c) => ({ pedido_id: ped.id, orcamento_fornecedor_id: orcDe(c), qtd: 1 }))).select('id, orcamento_fornecedor_id'),
    'entregas',
  )
  const ent = (c) => entregas.find((e) => e.orcamento_fornecedor_id === orcDe(c)).id
  // a de 50,00 foi coberta pelo Diretor de QA (substituto de férias); o trigger só recalcula
  // o substituto quando muda vendedor ou data prevista
  await exigir(admin.from('entregas').update({ vendedor_substituto_id: dir.id }).eq('id', ent('50.00')).select('id'), 'substituto')

  const niveis = await exigir(admin.from('niveis_vendedor').insert(NIVEIS).select('id, nome'), 'níveis')
  const junior = niveis.find((n) => n.nome === `${NOME}junior`).id

  // --- pelas funções, como o perfil 1 de QA
  const atual = mesDe(hojeSP())
  const anterior = mesDe(hojeSP(), -1)
  const confirmar = async (c, dia) => {
    const r = await D.rpc('fn_confirmar_entrega', { p_entrega: ent(c), p_dt_entrega: dia, p_gerar_conta_pagar: false })
    if (r.error) throw new Error(`fn_confirmar_entrega ${c}: ${r.error.message}`)
  }
  await confirmar('123.46', atual.dia(10))
  await confirmar('76.55', atual.dia(12))
  await confirmar('50.00', atual.dia(14))
  await confirmar('80.00', anterior.dia(20))

  const metas = await exigir(
    D.from('metas_mensais')
      .insert([
        { vendedor_id: dir.id, tipo_meta_id: 2, nivel_id: junior, valor_meta: '40.00', periodo_inicio: atual.inicio, periodo_fim: atual.fim, criado_por: dir.id },
        { vendedor_id: op.id, tipo_meta_id: 2, nivel_id: junior, valor_meta: '30.00', periodo_inicio: atual.inicio, periodo_fim: atual.fim, criado_por: dir.id },
        { vendedor_id: op.id, tipo_meta_id: 1, nivel_id: junior, valor_meta: '60.00', periodo_inicio: anterior.inicio, periodo_fim: anterior.fim, criado_por: dir.id },
      ])
      .select('id, vendedor_id, periodo_inicio'),
    'metas (sessão perfil 1)',
  )
  const metaAnterior = metas.find((m) => m.periodo_inicio === anterior.inicio).id
  const fecha = await D.rpc('fn_fechar_meta', { p_meta: metaAnterior, p_gerar_conta_pagar: false })
  if (fecha.error) throw new Error(`fn_fechar_meta: ${fecha.error.message}`)

  // página metas para o Operador de QA, para fotografar a visão do vendedor
  await exigir(admin.from('permissoes_pagina').insert({ pagina_slug: 'metas', usuario_id: op.id, bubble_id: NOME }).select('id'), 'permissão do Operador')

  const conf = await D.from('v_meta_atingimento')
    .select('vendedor_id, tipo_meta_id, competencia, realizado::text, percentual::text, comissao_vendedor::text, fechada')
    .in('meta_mensal_id', metas.map((m) => m.id))
  console.log('Cenário criado. Atingimento pela view (sessão perfil 1):')
  console.table(conf.data)
  console.log(`Na tela: crie a meta Regular de ${atual.inicio.slice(0, 7)} para o QA Operador (nível ${NOME}junior, R$ 200,01) → 100% exato.`)
}

// ------------------------------------------------------------------------------ limpar
async function limpar() {
  let estado = null
  try {
    estado = JSON.parse(await readFile(ESTADO, 'utf8'))
  } catch {
    // sem estado: limpa pelo prefixo; as CPs criadas pela tela ficam sem a janela de tempo
  }
  const passos = []
  const registrar = (oque, r) => {
    if (r.error) {
      console.error(`  FALHA  limpeza de ${oque}: ${r.error.message}`)
      process.exitCode = 1
    } else passos.push(`${oque}: ${r.data?.length ?? 0}`)
  }

  registrar('permissão do Operador', await admin.from('permissoes_pagina').delete().eq('bubble_id', NOME).select('id'))

  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', [NOME_CLIENTE, NOME_FORNECEDOR])
  const ids = (grupos ?? []).map((g) => g.id)
  const { data: niveis } = await admin.from('niveis_vendedor').select('id').in('nome', NOMES_NIVEL)
  const nivelIds = (niveis ?? []).map((n) => n.id)
  const { data: ents } = ids.length ? await admin.from('entregas').select('id').in('cliente_id', ids) : { data: [] }
  const entIds = (ents ?? []).map((e) => e.id)

  const { data: metas } = nivelIds.length ? await admin.from('metas_mensais').select('id').in('nivel_id', nivelIds) : { data: [] }
  const metaIds = (metas ?? []).map((m) => m.id)
  const { data: fechadas } = metaIds.length ? await admin.from('metas_fechadas').select('id').in('meta_mensal_id', metaIds) : { data: [] }
  const fechadaIds = (fechadas ?? []).map((f) => f.id)

  const cps = []
  if (ids.length) cps.push(...((await admin.from('contas_pagar').select('id').in('cliente_id', ids)).data ?? []))
  if (entIds.length) cps.push(...((await admin.from('contas_pagar').select('id').in('entrega_id', entIds)).data ?? []))
  if (fechadaIds.length) cps.push(...((await admin.from('contas_pagar').select('id').in('meta_fechada_id', fechadaIds)).data ?? []))
  if (estado) {
    // CP de meta cujo fechamento a TELA cancelou: meta_fechada_id virou nulo (on delete set null)
    const { data } = await admin
      .from('contas_pagar')
      .select('id')
      .eq('origem', 'meta')
      .in('vendedor_id', [estado.dir, estado.op])
      .gte('criado_em', estado.inicio)
    cps.push(...(data ?? []))
  }
  const cpIds = [...new Set(cps.map((c) => c.id))]
  const { data: crs } = ids.length ? await admin.from('contas_receber').select('id').in('cliente_id', ids) : { data: [] }
  const crIds = (crs ?? []).map((c) => c.id)

  const baixas = []
  if (crIds.length) baixas.push(...((await admin.from('baixas').select('id').in('conta_receber_id', crIds)).data ?? []))
  if (cpIds.length) baixas.push(...((await admin.from('baixas').select('id').in('conta_pagar_id', cpIds)).data ?? []))
  const baixaIds = baixas.map((b) => b.id)
  if (baixaIds.length) {
    registrar('estornos', await admin.from('estornos').delete().in('baixa_id', baixaIds).select('id'))
    registrar('baixas', await admin.from('baixas').delete().in('id', baixaIds).select('id'))
  }
  if (cpIds.length) registrar('contas_pagar', await admin.from('contas_pagar').delete().in('id', cpIds).select('id'))
  if (fechadaIds.length) registrar('metas_fechadas', await admin.from('metas_fechadas').delete().in('id', fechadaIds).select('id'))
  if (metaIds.length) registrar('metas_mensais', await admin.from('metas_mensais').delete().in('id', metaIds).select('id'))
  if (nivelIds.length) {
    registrar('vendedor_nivel_historico', await admin.from('vendedor_nivel_historico').delete().in('nivel_id', nivelIds).select('id'))
    registrar('usuarios (nível de QA desfeito)', await admin.from('usuarios').update({ nivel_vendedor_id: null }).in('nivel_vendedor_id', nivelIds).select('id'))
  }
  if (estado?.usuarios) {
    for (const u of estado.usuarios) {
      if (u.nivel_vendedor_id) registrar('usuarios (nível original)', await admin.from('usuarios').update({ nivel_vendedor_id: u.nivel_vendedor_id }).eq('id', u.id).select('id'))
    }
  }
  if (nivelIds.length) registrar('niveis_vendedor', await admin.from('niveis_vendedor').delete().in('id', nivelIds).select('id'))

  if (ids.length) {
    registrar('contas_receber', await admin.from('contas_receber').delete().in('cliente_id', ids).select('id'))
    registrar('entregas', await admin.from('entregas').delete().in('cliente_id', ids).select('id'))
    registrar('pedidos', await admin.from('pedidos').delete().in('cliente_id', ids).select('id'))
    registrar('cotacoes', await admin.from('cotacoes').delete().in('cliente_id', ids).select('id'))
    registrar('enderecos_clifor', await admin.from('enderecos_clifor').delete().in('grupo_id', ids).select('id'))
    registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  registrar('produtos', await admin.from('produtos').delete().eq('nome', NOME).select('id'))
  if (!process.exitCode) await rm(ESTADO, { force: true })
  console.log(`Limpeza: ${passos.join(' · ')}`)
}

const comando = process.argv[2]
try {
  if (comando === 'criar') {
    await limpar()
    await criar()
  } else if (comando === 'limpar') {
    await limpar()
  } else {
    console.error('uso: node scripts/cenario-qa-metas.mjs criar|limpar')
    process.exitCode = 1
  }
} catch (erro) {
  console.error(`FALHA  ${erro.message}`)
  console.error('Rode `node scripts/cenario-qa-metas.mjs limpar` para desfazer o que ficou.')
  process.exitCode = 1
}
