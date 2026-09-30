/**
 * Prova que os relatórios da página `metas` (db/024) somam certo e respeitam quem consulta.
 *
 * Diferente dos outros testes de RLS, este NÃO cria cenário: a base carregada do Bubble já tem
 * metas e entregas reais de setembro/2026, e o que se quer provar é justamente que os números
 * batem com ela. Por isso roda em Postgres direto (DATABASE_URL) e, para cada pergunta, VESTE
 * um usuário de verdade: `set local role authenticated` + `request.jwt.claims` com o `sub` dele
 * — exatamente o que o PostgREST faz, então a RLS e o `auth.uid()` valem como na tela. Tudo
 * dentro de uma transação desfeita no fim: nada é gravado.
 *
 * O que se prova:
 *   - anon não executa nenhuma função da 024 (GRANT revogado);
 *   - CONSISTÊNCIA: para toda meta ABERTA do mês, a soma da lista do popup
 *     (fn_metas_entregas_meta) = o "Valor faturado" da linha (v_meta_atingimento.realizado),
 *     ao centavo, e a contagem = qtd_entregas de fn_calculo_meta;
 *   - a barra "realizadas" da Análise de Entregas = a soma do "Valor faturado" do mês (Regular);
 *   - o Relatório Anual: faturado de um mês sem fechamento = soma direta das entregas no status
 *     do realizado por data de entrega; só o perfil 1 executa (42501 para os demais);
 *   - vendedor (perfil 4) vê SÓ o dele: nenhuma "realizada", e andamento/canceladas só com o
 *     vendedor_id dele; não vê a lista do popup da meta de outra vendedora.
 *
 *   node scripts/testar-rls-metas-relatorios.mjs
 */

import { readFileSync } from 'node:fs'

import pg from 'pg'

for (const linha of readFileSync('.env', 'utf8').split('\n')) {
  const corte = linha.indexOf('=')
  if (corte < 1 || linha.trimStart().startsWith('#')) continue
  const chave = linha.slice(0, corte).trim()
  if (!process.env[chave]) process.env[chave] = linha.slice(corte + 1).trim()
}

const MES = { inicio: '2026-09-01', fim: '2026-09-30', competencia: '2026-09-01' }

const casos = []
function caso(nome, esperado, obtido) {
  const ok = esperado === obtido
  casos.push(ok)
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
}
const cent = (v) => (v === null || v === undefined ? '0.00' : Number(v).toFixed(2))

const db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

/** Veste um usuário (ou anon) até o próximo `vestir`. */
async function vestir(id) {
  await db.query('reset role')
  if (id === 'anon') {
    await db.query(`select set_config('request.jwt.claims', '{"role":"anon"}', true)`)
    await db.query('set local role anon')
    return
  }
  await db.query(`select set_config('request.jwt.claims', $1, true)`, [
    JSON.stringify({ sub: id, role: 'authenticated' }),
  ])
  await db.query('set local role authenticated')
}

/** Roda e devolve { linhas } ou { codigo } do erro, dentro de um savepoint. */
async function tentar(sql, args = []) {
  await db.query('savepoint t')
  try {
    const r = await db.query(sql, args)
    await db.query('release savepoint t')
    return { linhas: r.rows }
  } catch (e) {
    await db.query('rollback to savepoint t')
    return { codigo: e.code }
  }
}

try {
  await db.connect()
  await db.query('begin')

  const { rows: pessoas } = await db.query(`
    select (select id from public.usuarios where perfil_id = 1 and ativo order by nome limit 1) as diretor,
           (select id from public.usuarios where nome = 'barbara oliveira moura') as barbara,
           (select id from public.usuarios where nome = 'nubia alves de carvalho') as nubia`)
  const { diretor, barbara, nubia } = pessoas[0]
  if (!diretor || !barbara || !nubia) throw new Error('base sem os usuários esperados (carga do Bubble)')
  // As permissões de página dos vendedores ainda não foram carregadas: concede `metas` à
  // vendedora dentro desta transação (desfeita no fim), para a RLS da 011 valer para ela.
  await db.query(
    `insert into public.permissoes_pagina (pagina_slug, usuario_id, bubble_id)
     select 'metas', $1, '__teste_rls_metas_relatorios__'
     where not exists (select 1 from public.permissoes_pagina where pagina_slug = 'metas' and usuario_id = $1)`,
    [barbara],
  )

  console.log('\nanon')
  await vestir('anon')
  for (const [fn, args] of [
    ['fn_metas_analise_entregas($1::date, $2::date)', [MES.inicio, MES.fim]],
    ['fn_metas_relatorio_anual($1::integer)', [2026]],
    ['fn_metas_entregas_meta($1::uuid)', ['00000000-0000-0000-0000-000000000000']],
  ]) {
    const r = await tentar(`select * from public.${fn}`, args)
    caso(`anon não executa ${fn.split('(')[0]}`, '42501', r.codigo)
  }

  console.log('\ndiretor — consistência popup × linha (metas abertas de setembro/2026)')
  await vestir(diretor)
  const { linhas: metas } = await tentar(
    `select v.meta_mensal_id, u.nome, v.realizado::text, v.fechada, v.tipo_meta_id,
            (select c.qtd_entregas from public.fn_calculo_meta(v.meta_mensal_id) c) as qtd
       from public.v_meta_atingimento v join public.usuarios u on u.id = v.vendedor_id
      where v.competencia = $1 order by u.nome`,
    [MES.competencia],
  )
  caso('há metas abertas no mês', true, metas.filter((m) => !m.fechada).length > 0)
  let somaRegular = 0
  for (const m of metas.filter((x) => !x.fechada)) {
    const { linhas } = await tentar(
      `select coalesce(sum(valor_comissao), 0)::text as soma, count(*)::int as n from public.fn_metas_entregas_meta($1)`,
      [m.meta_mensal_id],
    )
    caso(`${m.nome}: soma do popup = valor faturado (${cent(m.realizado)})`, cent(m.realizado), cent(linhas[0].soma))
    caso(`${m.nome}: nº de entregas do popup = fn_calculo_meta`, Number(m.qtd), linhas[0].n)
    if (m.tipo_meta_id === 1) somaRegular += Math.round(Number(m.realizado) * 100)
  }

  console.log('\ndiretor — Análise de Entregas')
  const { linhas: analise } = await tentar(
    `select categoria, sum(valor_comissao)::text as com from public.fn_metas_analise_entregas($1, $2) group by 1`,
    [MES.inicio, MES.fim],
  )
  const realizadas = analise.find((a) => a.categoria === 'realizada')
  caso(
    'realizadas do mês = soma do "Valor faturado" das metas Regulares',
    (somaRegular / 100).toFixed(2),
    cent(realizadas?.com),
  )

  console.log('\ndiretor — Relatório Anual')
  const { linhas: anual } = await tentar(
    `select sum(faturado)::text as fat, bool_or(mes_encerrado) as enc
       from public.fn_metas_relatorio_anual(2026) where mes = 9`,
  )
  const { linhas: direto } = await tentar(
    `select coalesce(sum(valor_comissao), 0)::text as fat from public.entregas
      where status_id = any (public.fn_status_realizado()) and dt_entrega between $1 and $2`,
    [MES.inicio, MES.fim],
  )
  caso('setembro sem fechamento → calculado por datas', false, anual[0].enc)
  caso('faturado de setembro = soma direta das entregas', cent(direto[0].fat), cent(anual[0].fat))
  const pagina = await tentar(`select count(*)::int as n, max(total)::int as total from public.fn_metas_relatorio_detalhe(2026)`)
  caso('detalhe paginado devolve 25 linhas por página', 25, pagina.linhas[0].n)
  const invalido = await tentar(`select * from public.fn_metas_relatorio_anual(2026, 'qualquer')`)
  caso('valor considerado inválido é recusado', '22023', invalido.codigo)

  console.log('\nvendedora (perfil 4) — só o dela')
  await vestir(barbara)
  const anualV = await tentar(`select * from public.fn_metas_relatorio_anual(2026)`)
  caso('relatório anual recusado (só hierarquia 1)', '42501', anualV.codigo)
  const detV = await tentar(`select * from public.fn_metas_relatorio_detalhe(2026)`)
  caso('detalhe anual recusado', '42501', detV.codigo)
  const { linhas: anaV } = await tentar(`select * from public.fn_metas_analise_entregas($1, $2)`, [MES.inicio, MES.fim])
  caso('não vê "realizadas"', 0, anaV.filter((a) => a.categoria === 'realizada').length)
  caso('andamento/canceladas só com o vendedor_id dela', 0, anaV.filter((a) => a.vendedor_id !== barbara).length)
  caso('vê as próprias entregas em andamento', true, anaV.length > 0)
  const metaNubia = metas.find((m) => m.nome === 'nubia alves de carvalho' && !m.fechada)
  if (metaNubia) {
    const { linhas } = await tentar(`select count(*)::int as n from public.fn_metas_entregas_meta($1)`, [
      metaNubia.meta_mensal_id,
    ])
    caso('não vê o popup da meta de outra vendedora', 0, linhas[0].n)
  }
  const lista = await tentar(`select * from public.fn_metas_analise_lista($1, $2, 'andamento', $3)`, [
    MES.inicio,
    MES.fim,
    nubia,
  ])
  caso('lista da barra de outra vendedora vem vazia', 0, lista.linhas?.length)
} catch (e) {
  console.error('\nERRO:', e.message)
  process.exitCode = 1
} finally {
  await db.query('rollback').catch(() => {})
  await db.end()
}

const falhas = casos.filter((ok) => !ok).length
console.log(`\n${casos.length - falhas}/${casos.length} casos ok`)
if (falhas > 0) process.exitCode = 1
