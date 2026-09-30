/**
 * Prova que a matriz Fornecedor × mês do painel inicial (db/025) soma certo e respeita a RLS
 * de quem consulta.
 *
 * Mesmo molde de `scripts/testar-rls-relatorios.mjs`: autentica de verdade com as duas contas de
 * QA do .env — QA_EMAIL/QA_SENHA (perfil 1) e QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA (perfil 4). As
 * duas têm a página `vendas`, que é o que a policy de `entregas` (009) exige.
 *
 * O que se prova:
 *   - anon não executa a função (GRANT revogado);
 *   - perfil 1 vê a empresa inteira; o Operador vê SÓ o que é dele (security invoker, 025 D7);
 *   - valores conhecidos conferidos AO CENTAVO (CLAUDE.md regra 10), com meio centavo;
 *   - só entra entrega em "Financeiro" e dentro do intervalo (025 D1);
 *   - dezembro de um ano e janeiro do seguinte são colunas DIFERENTES (025 D4 — o Bubble as
 *     somava juntas por usar só o número do mês);
 *   - totais por fornecedor, por mês e geral (025 D5);
 *   - período obrigatório, não invertido e ≤ 24 meses (025 D6).
 *
 * Dados em dez/2032–fev/2033, longe da base carregada. Criados com service_role, que só PREPARA e
 * LIMPA — nunca afirma nada, porque ignora RLS. Nomes exatos com o prefixo `__teste_rls_inicio__`,
 * apagados no fim com `in` (nunca `like`: `_` é curinga). Fica só a trilha em `auditoria`.
 *
 *   node scripts/testar-rls-inicio.mjs
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

const NOME = '__teste_rls_inicio__'
const GRUPOS = [`${NOME}cliente_dir`, `${NOME}cliente_op`, `${NOME}fornecedor_a`, `${NOME}fornecedor_b`]
const FILIAL_A = `${NOME}filial_a`
const FILIAL_B = `${NOME}filial_b`

const PERIODO = { p_inicio: '2032-12-01', p_fim: '2033-01-31' }
const FN = 'fn_inicio_comissoes_fornecedor_mes'
const RECUSADO = '42501'

const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })

const casos = []
function caso(nome, esperado, obtido) {
  const ok = esperado === obtido
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
}

const fixo = (v) => (v === null || v === undefined ? null : Number(v).toFixed(2))

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

async function rpc(cliente, args = PERIODO) {
  const { data, error } = await cliente.rpc(FN, args)
  if (error) throw new Error(`${FN}: ${error.code} ${error.message}`)
  return data
}

// ------------------------------------------------------------------ preparo e limpeza
async function preparar(idDir, idOp) {
  const grupos = await exigir(
    admin
      .from('grupos_clifor')
      .insert([
        { tipo: 'cliente', nome: GRUPOS[0], carteira_id: idDir },
        { tipo: 'cliente', nome: GRUPOS[1], carteira_id: idOp },
        { tipo: 'fornecedor', nome: GRUPOS[2] },
        { tipo: 'fornecedor', nome: GRUPOS[3] },
      ])
      .select('id, nome'),
    'grupos',
  )
  const g = Object.fromEntries(grupos.map((x) => [x.nome, x.id]))
  const endereco = (grupo, nome, uf) => ({ grupo_id: grupo, nome_endereco: nome, tipo_pessoa: 'cnpj', regime_tributario_id: 1, uf })
  const ends = await exigir(
    admin
      .from('enderecos_clifor')
      .insert([
        endereco(g[GRUPOS[0]], NOME, 'GO'),
        endereco(g[GRUPOS[1]], NOME, 'MG'),
        endereco(g[GRUPOS[2]], FILIAL_A, 'SP'),
        endereco(g[GRUPOS[3]], FILIAL_B, 'PR'),
      ])
      .select('id, grupo_id'),
    'endereços',
  )
  const end = (grupo) => ends.find((e) => e.grupo_id === g[grupo]).id
  const [produto] = await exigir(admin.from('produtos').insert({ nome: NOME }).select('id'), 'produto')

  /** Cotação → item → orçamento vencedor → pedido. */
  async function cadeia({ vendedor, cliente, destino, fornecedor, origem }) {
    const [cot] = await exigir(
      admin.from('cotacoes').insert({ cliente_id: cliente, vendedor_id: vendedor, empresa_emissora_id: 1, etapa_id: 2 }).select('id'),
      'cotação',
    )
    const [item] = await exigir(
      admin.from('cotacao_itens').insert({ cotacao_id: cot.id, produto_id: produto.id, qtd: 10, endereco_destino_id: destino }).select('id'),
      'item',
    )
    const [orc] = await exigir(
      admin
        .from('orcamentos_fornecedor')
        .insert({
          cotacao_item_id: item.id,
          cotacao_id: cot.id,
          fornecedor_id: fornecedor,
          endereco_origem_id: origem,
          endereco_destino_id: destino,
          produto_id: produto.id,
          vendedor_id: vendedor,
          qtd_venda: 10,
          valor_venda_unit: '10.00',
          valor_comissao_unit: '1.00',
          aliquota_icms: '0.1200',
          aliquota_pis_cofins: '0.0925',
          vencedor: true,
        })
        .select('id'),
      'orçamento',
    )
    const [ped] = await exigir(admin.from('pedidos').insert({ cotacao_id: cot.id, vendedor_id: vendedor }).select('id'), 'pedido')
    return { ped: ped.id, orc: orc.id }
  }

  const a = await cadeia({ vendedor: idDir, cliente: g[GRUPOS[0]], destino: end(GRUPOS[0]), fornecedor: g[GRUPOS[2]], origem: end(GRUPOS[2]) })
  const b = await cadeia({ vendedor: idOp, cliente: g[GRUPOS[1]], destino: end(GRUPOS[1]), fornecedor: g[GRUPOS[3]], origem: end(GRUPOS[3]) })

  // Unitários explícitos (o snapshot do trigger só entra quando vêm nulos):
  //   A1 perfil 1, dez/2032, Financeiro: 3 × 1,11 = 3,33
  //   A2 perfil 1, jan/2033, Financeiro: 2,5 × 0,99 = 2,475 → 2,48 (meio centavo)
  //   A3 perfil 1, jan/2033, Em Entrega (4): 100 × 100,00 — NÃO entra (D1)
  //   A4 perfil 1, fev/2033, Financeiro, fora do intervalo — NÃO entra (D1)
  //   B1 Operador, jan/2033, Financeiro: 1 × 5,55 = 5,55
  const entrega = (c, status, dt, qtd, comissao) => ({
    pedido_id: c.ped,
    orcamento_fornecedor_id: c.orc,
    status_id: status,
    dt_entrega: dt,
    qtd,
    valor_venda_bruto_unit: '10.00',
    valor_venda_liquido_unit: '10.00',
    valor_comissao_unit: comissao,
  })
  await exigir(
    admin
      .from('entregas')
      .insert([
        entrega(a, 5, '2032-12-10', 3, '1.11'),
        entrega(a, 5, '2033-01-02', 2.5, '0.99'),
        entrega(a, 4, '2033-01-15', 100, '100.00'),
        entrega(a, 5, '2033-02-01', 1, '9.99'),
        entrega(b, 5, '2033-01-20', 1, '5.55'),
      ])
      .select('id'),
    'entregas',
  )
  return { filialA: end(GRUPOS[2]), filialB: end(GRUPOS[3]) }
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
    // FKs restrict: entregas → pedidos → cotações (itens e orçamentos em cascade) → endereços → grupos.
    registrar('entregas', await admin.from('entregas').delete().in('cliente_id', ids).select('id'))
    registrar('pedidos', await admin.from('pedidos').delete().in('cliente_id', ids).select('id'))
    registrar('cotacoes', await admin.from('cotacoes').delete().in('cliente_id', ids).select('id'))
    registrar('enderecos', await admin.from('enderecos_clifor').delete().in('grupo_id', ids).select('id'))
    registrar('grupos', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  registrar('produto', await admin.from('produtos').delete().in('nome', [NOME]).select('id'))
  console.log(`\nlimpeza — ${passos.join(', ')}`)
}

// ------------------------------------------------------------------------- casos
async function main() {
  for (const chave of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'QA_EMAIL', 'QA_SENHA', 'QA_OPERADOR_EMAIL', 'QA_OPERADOR_SENHA']) {
    if (!env[chave]) throw new Error(`${chave} não está no .env`)
  }
  await limpar() // resto de uma execução interrompida
  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const d = await preparar(dir.id, op.id)

  console.log('anon:')
  const anon = createClient(URL, ANON, { auth: { persistSession: false } })
  const r = await anon.rpc(FN, PERIODO)
  caso('anon não executa a função', RECUSADO, r.error?.code ?? 'sem erro')

  const nivel = (linhas, n) => linhas.filter((l) => l.nivel === n)
  const celula = (linhas, end, mes) => nivel(linhas, 0).find((l) => l.endereco_id === end && l.mes === mes)
  const doFornecedor = (linhas, end) => nivel(linhas, 1).find((l) => l.endereco_id === end)
  const doMes = (linhas, mes) => nivel(linhas, 2).find((l) => l.mes === mes)

  console.log('\nperfil 1 (empresa inteira):')
  const m = await rpc(dir.cliente)
  caso('célula filial A / dez-2032', '3.33', fixo(celula(m, d.filialA, '2032-12-01')?.valor_comissao))
  caso('célula filial A / jan-2033 (meio centavo, sem a entrega fora de Financeiro)', '2.48', fixo(celula(m, d.filialA, '2033-01-01')?.valor_comissao))
  caso('D4: dezembro e janeiro são colunas diferentes da filial A', 2, nivel(m, 0).filter((l) => l.endereco_id === d.filialA).length)
  caso('D1: entrega de fevereiro (fora do intervalo) não aparece', undefined, celula(m, d.filialA, '2033-02-01'))
  caso('célula filial B / jan-2033 (do Operador)', '5.55', fixo(celula(m, d.filialB, '2033-01-01')?.valor_comissao))
  caso('rótulo da linha = nome da filial de origem', FILIAL_A, celula(m, d.filialA, '2032-12-01')?.fornecedor)
  caso('total da filial A', '5.81', fixo(doFornecedor(m, d.filialA)?.valor_comissao))
  // A base carregada não tem entregas em 2032–2033: os totais de mês e geral são só o cenário.
  caso('total de janeiro', '8.03', fixo(doMes(m, '2033-01-01')?.valor_comissao))
  caso('total geral', '11.36', fixo(nivel(m, 3)[0]?.valor_comissao))
  caso('total geral conta 3 entregas (A1, A2, B1)', 3, Number(nivel(m, 3)[0]?.qtd_entregas))

  console.log('\nOperador (perfil 4 — só o que é dele):')
  const o = await rpc(op.cliente)
  caso('total geral do Operador', '5.55', fixo(nivel(o, 3)[0]?.valor_comissao))
  caso('SIGILO: a filial A (do perfil 1) não aparece', false, o.some((l) => l.endereco_id === d.filialA))

  console.log('\nPeríodo (025 D6):')
  const invertido = await dir.cliente.rpc(FN, { p_inicio: '2033-01-31', p_fim: '2032-12-01' })
  caso('período invertido é recusado (22023)', '22023', invertido.error?.code ?? 'sem erro')
  const longo = await dir.cliente.rpc(FN, { p_inicio: '2030-01-01', p_fim: '2032-12-31' })
  caso('período maior que 24 meses é recusado (22023)', '22023', longo.error?.code ?? 'sem erro')
  const semFim = await dir.cliente.rpc(FN, { p_inicio: '2032-12-01', p_fim: null })
  caso('período sem fim é recusado (22023)', '22023', semFim.error?.code ?? 'sem erro')

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
