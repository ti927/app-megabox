/**
 * Prova que os relatórios (db/017) somam certo e respeitam a RLS de quem consulta.
 *
 * Mesmo molde de `scripts/testar-rls-vendas.mjs`: autentica de verdade com as duas contas de QA
 * do .env — QA_EMAIL/QA_SENHA (perfil 1) e QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA (perfil 4). O perfil 1
 * tem a página `relatorios`; o Operador NÃO tem — o teste concede a página a ele por uma linha
 * nominal em permissoes_pagina marcada com `bubble_id = '__teste_rls_relatorios__'`, apagada no fim.
 * LIMITE: as duas contas também têm a página `vendas`, cujas policies (009) dão a mesma
 * visibilidade; o que se prova aqui é o comportamento da PÁGINA (quem a abre vê só o seu), não
 * que as policies novas da 017 bastem sozinhas.
 *
 * O que se prova:
 *   - anon não lê a view nem executa nenhuma função de relatório (GRANT revogado);
 *   - hierarquia ≤ 2 vê o agregado da empresa inteira; o Operador vê SÓ o agregado do que é
 *     dele — mesma função, mesma chamada, a RLS de entregas/cotações decide (security invoker);
 *   - um cenário de valores conhecidos, conferido AO CENTAVO (CLAUDE.md regra 10), incluindo
 *     arredondamento de meio centavo e a exclusão de entrega fora de "Financeiro" (017 D1);
 *   - o período é obrigatório e limitado (017 D6).
 *
 * Os dados ficam em 2031, longe da base carregada, para o total ser só o do cenário. São criados
 * com service_role, que aqui só PREPARA e LIMPA — nunca afirma nada, porque ignora RLS. Tudo tem
 * nome exato com o prefixo `__teste_rls_relatorios__` e é apagado no fim, com `in` (nunca `like`:
 * `_` é curinga). Fica para trás só a trilha em `auditoria` (append-only por GRANT).
 *
 *   node scripts/testar-rls-relatorios.mjs
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

const NOME = '__teste_rls_relatorios__'
const GRUPOS = [`${NOME}cliente_dir`, `${NOME}cliente_op`, `${NOME}fornecedor`]

/** Período do cenário: março e abril de 2031. */
const INICIO = '2031-03-01'
const FIM = '2031-04-30'
const MARCO = { p_inicio: '2031-03-01', p_fim: '2031-03-31' }

const RECUSADO = '42501'

const FUNCOES = {
  fn_rel_entregas_produto: { p_inicio: INICIO, p_fim: FIM },
  fn_rel_entregas_cliente_mes: { p_inicio: INICIO, p_fim: FIM },
  fn_rel_entregas_fornecedor_mes: { p_inicio: INICIO, p_fim: FIM },
  fn_rel_cotacoes_resumo: MARCO,
  fn_rel_cotacoes_vendedor: MARCO,
  fn_rel_cotacoes_mes: MARCO,
  fn_rel_cotacoes_motivos: MARCO,
  fn_rel_prospeccao_vendedor: MARCO,
  fn_rel_prospeccao_diario: MARCO,
}

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

/** numeric chega como número ou string; compara sempre com 2 (ou n) casas fixas. */
const fixo = (v, casas = 2) => (v === null || v === undefined ? null : Number(v).toFixed(casas))

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

async function rpc(cliente, fn, args) {
  const { data, error } = await cliente.rpc(fn, args)
  if (error) throw new Error(`${fn}: ${error.code} ${error.message}`)
  return data
}

// ------------------------------------------------------------------ preparo e limpeza
async function preparar(idDir, idOp) {
  await exigir(
    admin.from('permissoes_pagina').insert({ pagina_slug: 'relatorios', usuario_id: idOp, bubble_id: NOME }).select('id'),
    'página relatorios para o Operador',
  )
  const grupos = await exigir(
    admin
      .from('grupos_clifor')
      .insert([
        { tipo: 'cliente', nome: GRUPOS[0], carteira_id: idDir },
        { tipo: 'cliente', nome: GRUPOS[1], carteira_id: idOp },
        { tipo: 'fornecedor', nome: GRUPOS[2] },
      ])
      .select('id, nome'),
    'grupos',
  )
  const g = Object.fromEntries(grupos.map((x) => [x.nome, x.id]))
  const endereco = (grupo, uf) => ({
    grupo_id: grupo,
    nome_endereco: NOME,
    tipo_pessoa: 'cnpj',
    regime_tributario_id: 1,
    uf,
  })
  const ends = await exigir(
    admin
      .from('enderecos_clifor')
      .insert([endereco(g[GRUPOS[0]], 'GO'), endereco(g[GRUPOS[1]], 'MG'), endereco(g[GRUPOS[2]], 'SP')])
      .select('id, grupo_id'),
    'endereços',
  )
  const end = (grupo) => ends.find((e) => e.grupo_id === g[grupo]).id
  const destDir = end(GRUPOS[0])
  const destOp = end(GRUPOS[1])
  const origem = end(GRUPOS[2])

  const [produto] = await exigir(admin.from('produtos').insert({ nome: NOME }).select('id'), 'produto')

  /** Uma cotação com item e orçamento vencedor. */
  async function cadeia({ vendedor, cliente, destino, criado, etapa, arquivado = false, qtd, unit, comissao }) {
    const [cot] = await exigir(
      admin
        .from('cotacoes')
        .insert({
          cliente_id: cliente,
          vendedor_id: vendedor,
          empresa_emissora_id: 1,
          etapa_id: etapa,
          arquivado,
          motivo_arquivamento_id: arquivado ? 1 : null,
          criado_em: criado,
        })
        .select('id'),
      'cotação',
    )
    const [item] = await exigir(
      admin
        .from('cotacao_itens')
        .insert({ cotacao_id: cot.id, produto_id: produto.id, qtd, endereco_destino_id: destino })
        .select('id'),
      'item',
    )
    const [orc] = await exigir(
      admin
        .from('orcamentos_fornecedor')
        .insert({
          cotacao_item_id: item.id,
          cotacao_id: cot.id,
          fornecedor_id: g[GRUPOS[2]],
          endereco_origem_id: origem,
          endereco_destino_id: destino,
          produto_id: produto.id,
          vendedor_id: vendedor,
          qtd_venda: qtd,
          valor_venda_unit: unit,
          valor_comissao_unit: comissao,
          aliquota_icms: '0.1200',
          aliquota_pis_cofins: '0.0925',
          vencedor: true,
        })
        .select('id'),
      'orçamento',
    )
    return { cot: cot.id, orc: orc.id }
  }

  // C1 (perfil 1) virou pedido; orçamento 10 × 12,34 = 123,40.
  const c1 = await cadeia({
    vendedor: idDir, cliente: g[GRUPOS[0]], destino: destDir, criado: '2031-03-05T12:00:00-03:00',
    etapa: 2, qtd: 10, unit: '12.34', comissao: '1.11',
  })
  // C2 (Operador) virou pedido; orçamento 2 × 20,00 = 40,00.
  const c2 = await cadeia({
    vendedor: idOp, cliente: g[GRUPOS[1]], destino: destOp, criado: '2031-03-06T12:00:00-03:00',
    etapa: 2, qtd: 2, unit: '20.00', comissao: '5.55',
  })
  // C3 (perfil 1) arquivada; C4 (Operador) em cotação.
  await cadeia({
    vendedor: idDir, cliente: g[GRUPOS[0]], destino: destDir, criado: '2031-03-07T12:00:00-03:00',
    etapa: 1, arquivado: true, qtd: 1, unit: '1.00', comissao: '0.10',
  })
  await cadeia({
    vendedor: idOp, cliente: g[GRUPOS[1]], destino: destOp, criado: '2031-03-08T12:00:00-03:00',
    etapa: 1, qtd: 1, unit: '1.00', comissao: '0.10',
  })

  // Propostas enviadas (aba Prospecção) e pedidos com data conhecida (tempo de fechamento:
  // C1 = 2 dias, C2 = 3 dias → média 2,5).
  await exigir(
    admin
      .from('propostas')
      .insert([
        { cotacao_id: c1.cot, numero: 1, vendedor_id: idDir, enviada: true, enviada_em: '2031-03-10T10:00:00-03:00' },
        { cotacao_id: c2.cot, numero: 1, vendedor_id: idOp, enviada: true, enviada_em: '2031-03-11T10:00:00-03:00' },
      ])
      .select('id'),
    'propostas',
  )
  const peds = await exigir(
    admin
      .from('pedidos')
      .insert([
        { cotacao_id: c1.cot, vendedor_id: idDir, criado_em: '2031-03-07T12:00:00-03:00' },
        { cotacao_id: c2.cot, vendedor_id: idOp, criado_em: '2031-03-09T12:00:00-03:00' },
      ])
      .select('id, cotacao_id'),
    'pedidos',
  )
  const ped = (cot) => peds.find((p) => p.cotacao_id === cot).id

  // Entregas com unitários EXPLÍCITOS (o snapshot do trigger só entra quando vêm nulos):
  //   E1 perfil 1, mar: 3 × 12,345678 = 37,037034 → 37,04;  3 × 1,11 = 3,33
  //   E2 perfil 1, abr: 2,5 × 10,00 = 25,00;               2,5 × 0,99 = 2,475 → 2,48
  //   E3 perfil 1, mar, status 4 (Em Entrega): 100 × 100,00 — NÃO pode entrar (017 D1)
  //   E4 Operador, mar: 1 × 50,00 = 50,00;                 1 × 5,55 = 5,55
  const entrega = (cot, orc, status, dt, qtd, venda, comissao) => ({
    pedido_id: ped(cot),
    orcamento_fornecedor_id: orc,
    status_id: status,
    dt_entrega: dt,
    qtd,
    valor_venda_bruto_unit: venda,
    valor_venda_liquido_unit: venda,
    valor_comissao_unit: comissao,
  })
  await exigir(
    admin
      .from('entregas')
      .insert([
        entrega(c1.cot, c1.orc, 5, '2031-03-10', 3, '12.345678', '1.11'),
        entrega(c1.cot, c1.orc, 5, '2031-04-02', 2.5, '10.00', '0.99'),
        entrega(c1.cot, c1.orc, 4, '2031-03-15', 100, '100.00', '100.00'),
        entrega(c2.cot, c2.orc, 5, '2031-03-20', 1, '50.00', '5.55'),
      ])
      .select('id'),
    'entregas',
  )
  return { destDir, destOp, origem }
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
  const { data: grupos } = await admin.from('grupos_clifor').select('id').in('nome', GRUPOS)
  const ids = (grupos ?? []).map((x) => x.id)
  if (ids.length) {
    // FKs restrict: entregas → pedidos → cotações (itens, orçamentos, propostas em cascade) →
    // endereços → grupos → produto.
    registrar('entregas', await admin.from('entregas').delete().in('cliente_id', ids).select('id'))
    registrar('pedidos', await admin.from('pedidos').delete().in('cliente_id', ids).select('id'))
    registrar('cotacoes', await admin.from('cotacoes').delete().in('cliente_id', ids).select('id'))
    registrar('enderecos_clifor', await admin.from('enderecos_clifor').delete().in('grupo_id', ids).select('id'))
    registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  registrar('produtos', await admin.from('produtos').delete().in('nome', [NOME]).select('id'))
  registrar('permissoes_pagina', await admin.from('permissoes_pagina').delete().in('bubble_id', [NOME]).select('id'))
  console.log(`\nLimpeza: ${passos.join(' · ')}`)
}

// ------------------------------------------------------------------------------- casos
const nivel = (linhas, n) => linhas.filter((l) => l.nivel === n)

async function main() {
  await limpar()

  console.log('\nSem sessão (papel anon):')
  const anonimo = createClient(URL, ANON, { auth: { persistSession: false } })
  const view = await anonimo.from('v_rel_entregas').select('entrega_id').limit(1)
  caso('anon lê v_rel_entregas', 'negado', view.error ? 'negado' : 'permitido')
  for (const [fn, args] of Object.entries(FUNCOES)) {
    const r = await anonimo.rpc(fn, args)
    caso(`anon executa ${fn}`, 'negado', r.error?.code === RECUSADO ? 'negado' : 'permitido', r.error?.message)
  }

  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const d = await preparar(dir.id, op.id)

  // ------------------------------------------------------------------------ perfil 1
  console.log('\nPerfil 1 (hierarquia ≤ 2 — vê a empresa inteira), valores ao centavo:')
  const periodo = { p_inicio: INICIO, p_fim: FIM }

  const prod = await rpc(dir.cliente, 'fn_rel_entregas_produto', periodo)
  const [totProd] = nivel(prod, 2)
  caso('Produtos: total de venda bruta (37,04 + 25,00 + 50,00)', '112.04', fixo(totProd?.valor_venda_bruto))
  caso('Produtos: total de comissão (3,33 + 2,48 + 5,55; 2,475 → 2,48)', '11.36', fixo(totProd?.valor_comissao))
  caso('Produtos: quantidade total', '6.500', fixo(totProd?.qtd, 3))
  caso('Produtos: entrega em "Em Entrega" fica de fora (3 entregas, não 4)', 3, Number(totProd?.qtd_entregas))
  const linhasProd = nivel(prod, 0)
  caso('Produtos: uma linha por produto × fornecedor × cliente (2 clientes)', 2, linhasProd.length)
  const linhaDir = linhasProd.find((l) => l.cliente_endereco_id === d.destDir)
  caso('Produtos: venda do cliente do perfil 1 (37,04 + 25,00)', '62.04', fixo(linhaDir?.valor_venda_bruto))
  caso('Produtos: unitário médio de venda = 62,04 ÷ 5,5', '11.28', fixo(linhaDir?.venda_unit_media))
  caso('Produtos: UF de destino da filial', 'GO', linhaDir?.uf_destino)
  caso('Produtos: nome em maiúsculas (mapa: :to_uppercase)', NOME.toUpperCase(), linhaDir?.cliente)
  caso('Produtos: subtotal do produto = total', '11.36', fixo(nivel(prod, 1)[0]?.valor_comissao))

  const cli = await rpc(dir.cliente, 'fn_rel_entregas_cliente_mes', periodo)
  const celula = (linhas, id, mes) => linhas.find((l) => l.nivel === 0 && l.endereco_id === id && l.mes === mes)
  caso('Cliente×Mês: célula perfil 1 / março', '3.33', fixo(celula(cli, d.destDir, '2031-03-01')?.valor_comissao))
  caso('Cliente×Mês: célula perfil 1 / abril', '2.48', fixo(celula(cli, d.destDir, '2031-04-01')?.valor_comissao))
  caso(
    'Cliente×Mês: total da linha do perfil 1',
    '5.81',
    fixo(cli.find((l) => l.nivel === 1 && l.endereco_id === d.destDir)?.valor_comissao),
  )
  caso('Cliente×Mês: total do mês de março (3,33 + 5,55)', '8.88', fixo(cli.find((l) => l.nivel === 2 && l.mes === '2031-03-01')?.valor_comissao))
  caso('Cliente×Mês: total geral', '11.36', fixo(nivel(cli, 3)[0]?.valor_comissao))

  const forn = await rpc(dir.cliente, 'fn_rel_entregas_fornecedor_mes', periodo)
  const linhaForn = forn.find((l) => l.nivel === 1 && l.endereco_id === d.origem)
  caso('Fornecedor×Mês: total do fornecedor (eixo de origem)', '11.36', fixo(linhaForn?.valor_comissao))
  caso('Fornecedor×Mês: UF de origem', 'SP', linhaForn?.uf)

  const filtrado = await rpc(dir.cliente, 'fn_rel_entregas_produto', { ...periodo, p_vendedor: op.id })
  caso('filtro de vendedor: só a comissão do Operador', '5.55', fixo(nivel(filtrado, 2)[0]?.valor_comissao))
  const comConcluido = await rpc(dir.cliente, 'fn_rel_entregas_produto', { ...periodo, p_status: [4, 5] })
  caso('p_status parametrizável (D1): com "Em Entrega" entram os 100 × 100,00', '10011.36', fixo(nivel(comConcluido, 2)[0]?.valor_comissao))

  const [res] = await rpc(dir.cliente, 'fn_rel_cotacoes_resumo', MARCO)
  caso('Cotação: total no período', 4, Number(res?.total))
  caso('Cotação: em cotação', 1, Number(res?.em_cotacao))
  caso('Cotação: virou pedido', 2, Number(res?.virou_pedido))
  caso('Cotação: arquivadas', 1, Number(res?.arquivadas))
  caso('Cotação: taxa de conversão', '0.5000', fixo(res?.taxa_conversao, 4))
  caso('Cotação: faturamento (123,40 + 40,00)', '163.40', fixo(res?.faturamento))
  caso('Cotação: ticket médio', '81.70', fixo(res?.ticket_medio))
  caso('Cotação: tempo médio de fechamento (2 e 3 dias)', '2.5', fixo(res?.tempo_medio_fechamento_dias, 1))

  const rankDir = await rpc(dir.cliente, 'fn_rel_cotacoes_vendedor', MARCO)
  caso('Cotação: ranking tem os 2 vendedores', 2, rankDir.length)
  caso('Cotação: 1º lugar é o maior faturamento (perfil 1)', dir.id, rankDir[0]?.vendedor_id)

  const motivos = await rpc(dir.cliente, 'fn_rel_cotacoes_motivos', MARCO)
  caso('Cotação: motivo de arquivamento', 1, Number(motivos.find((m) => m.motivo_id === 1)?.qtd))

  const prospOp = await rpc(dir.cliente, 'fn_rel_prospeccao_vendedor', { ...MARCO, p_vendedor: op.id })
  const linhaOp = prospOp.find((l) => l.nivel === 0 && l.vendedor_id === op.id)
  caso('Prospecção: propostas enviadas do Operador', 1, Number(linhaOp?.propostas))
  caso('Prospecção: carteira atingida do Operador', 1, Number(linhaOp?.carteira_atingida))
  const dias = await rpc(dir.cliente, 'fn_rel_prospeccao_diario', MARCO)
  caso('Prospecção: um dia por dia do período', 31, dias.length)
  caso('Prospecção: volume do dia 10/03', 1, Number(dias.find((x) => x.dia === '2031-03-10')?.propostas))

  // ------------------------------------------------------------------------ Operador
  console.log('\nOperador (perfil 4 — só o agregado do que é dele):')
  const o = op.cliente
  const { data: podeAbrir } = await o.rpc('fn_pode_acessar_pagina', { p_slug: 'relatorios' })
  caso('Operador abre a página relatorios (concessão do teste)', true, podeAbrir)
  const prodOp = await rpc(o, 'fn_rel_entregas_produto', periodo)
  caso('Produtos: total do Operador é só a entrega dele', '5.55', fixo(nivel(prodOp, 2)[0]?.valor_comissao))
  caso('Produtos: venda do Operador', '50.00', fixo(nivel(prodOp, 2)[0]?.valor_venda_bruto))
  caso(
    'SIGILO: não aparece o cliente do perfil 1',
    false,
    nivel(prodOp, 0).some((l) => l.cliente_endereco_id === d.destDir),
  )
  const cliOp = await rpc(o, 'fn_rel_entregas_cliente_mes', periodo)
  caso('Cliente×Mês: total geral do Operador', '5.55', fixo(nivel(cliOp, 3)[0]?.valor_comissao))
  const pedirTudo = await rpc(o, 'fn_rel_entregas_produto', { ...periodo, p_vendedor: dir.id })
  caso('SIGILO: filtrar pelo perfil 1 não revela nada', '0.00', fixo(nivel(pedirTudo, 2)[0]?.valor_comissao))
  const { data: viewOp } = await o.from('v_rel_entregas').select('entrega_id, valor_comissao').gte('dt_entrega', INICIO).lte('dt_entrega', FIM)
  caso('SIGILO: v_rel_entregas devolve só a entrega do Operador', 1, viewOp?.length)

  const [resOp] = await rpc(o, 'fn_rel_cotacoes_resumo', MARCO)
  caso('Cotação: total do Operador', 2, Number(resOp?.total))
  caso('Cotação: faturamento do Operador', '40.00', fixo(resOp?.faturamento))
  const rankOp = await rpc(o, 'fn_rel_cotacoes_vendedor', MARCO)
  caso('SIGILO: ranking de cotação só com o próprio Operador', true, rankOp.length === 1 && rankOp[0].vendedor_id === op.id)
  const prospAll = await rpc(o, 'fn_rel_prospeccao_vendedor', MARCO)
  caso(
    'SIGILO: prospecção sem linha de outro vendedor (nem carteira)',
    true,
    prospAll.filter((l) => l.nivel === 0).every((l) => l.vendedor_id === op.id),
  )

  // ------------------------------------------------------------------------ período
  console.log('\nPeríodo (017 D6):')
  const semFim = await dir.cliente.rpc('fn_rel_entregas_produto', { p_inicio: INICIO, p_fim: null })
  caso('período sem fim é recusado (22023)', '22023', semFim.error?.code ?? 'sem erro')
  const longo = await dir.cliente.rpc('fn_rel_cotacoes_resumo', { p_inicio: '2029-01-01', p_fim: '2031-01-01' })
  caso('período maior que 24 meses é recusado (22023)', '22023', longo.error?.code ?? 'sem erro')

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
