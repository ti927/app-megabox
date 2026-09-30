/**
 * Teste de ponta a ponta do FLUXO COMPLETO de trabalho, no navegador (Playwright), medindo o
 * tempo de cada ação e conferindo os dados no banco.
 *
 *   cadastro → cotação → proposta → pedido → entregas → financeiro → metas → relatórios/início
 *   → duplicação × financeiro
 *
 * Regras do dono (e2e):
 *   - Todos os registros usam o grupo CLIENTE "LURE CLIENTE" e o FORNECEDOR "LURE FORNECEDOR".
 *     Se existirem, são reaproveitados; se não, são criados PELA TELA. Cada um ganha uma filial
 *     própria de teste (documento com DV válido, gerado aqui) e um contato @example.com.
 *     Cliente RJ + fornecedor SP, os dois Lucro Real/Presumido: exercita o ICMS da tabela
 *     (SP→RJ) e o PIS/COFINS de 9,25% (db/007 D4).
 *   - Nada de e-mail de verdade: a fila está em modo registro. O script confere que nenhum e-mail
 *     criado na execução ficou `enviado`, e que nenhum saiu para endereço fora de @example.com.
 *   - O banco é só LIDO aqui (transação `read only`, conexão DATABASE_URL). Tudo o que muda passa
 *     pela tela, como um usuário.
 *
 * Tempo de cada ação = do clique até a tela mostrar o resultado (não o esqueleto).
 *   > 3 s → LENTA · > 8 s → CRÍTICA · falhou → ERRO.
 * Também registra avisos de erro na tela ([role=alert], "Parte desta cotação não carregou") e
 * erros de console/página/HTTP 5xx por ação.
 *
 * Uso (servidor já no ar, de preferência em modo produção):
 *   npm run build && npx next start -p 3235
 *   node scripts/e2e-fluxo-completo.mjs              # fluxo completo (reaproveita cadastros)
 *   node scripts/e2e-fluxo-completo.mjs --rotas      # só mede a carga das telas (3×) e o banco
 *   node scripts/e2e-fluxo-completo.mjs --limpar     # desativa/arquiva o que o e2e criou
 *   BASE=http://localhost:3235 HEADED=1 node scripts/e2e-fluxo-completo.mjs
 *
 * Saída: qa/e2e/<execução>/relatorio.json e relatorio.md (+ capturas dos erros). qa/ fica fora
 * do git. Precisa de QA_EMAIL/QA_SENHA (conta Diretor) e DATABASE_URL no .env.
 *
 * --limpar NUNCA apaga: histórico é append-only. Cancela entregas que não chegaram ao
 * Financeiro, arquiva contas a receber e cotações abertas do e2e, desliga o produto de teste do
 * fornecedor e desativa filiais, contatos e o produto de teste. A meta de QA só é apagada se foi
 * este script que a criou (qa/e2e/estado.json). Os grupos LURE só são desativados se foram
 * criados por este script. Só toca em registro marcado como e2e (nome/OC com o prefixo abaixo).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'

import pg from 'pg'
import { chromium } from 'playwright'

// ============================================================================ configuração

const BASE = process.env.BASE ?? 'http://localhost:3235'
const HEADED = process.env.HEADED === '1'
const ARGS = new Set(process.argv.slice(2))
const MODO = ARGS.has('--limpar') ? 'limpar' : ARGS.has('--rotas') ? 'rotas' : 'fluxo'

const LENTA_MS = 3000
const CRITICA_MS = 8000
const LIMITE_MS = 60_000 // espera máxima por uma ação antes de dar ERRO

const CLIENTE = 'LURE CLIENTE'
const FORNECEDOR = 'LURE FORNECEDOR'
const MARCA = 'E2E' // prefixo de tudo o que o script cria
const FILIAL_CLI = { nome: 'LURE CLIENTE E2E RJ', uf: 'RJ', municipio: 'Rio de Janeiro', cep: '20040020', base: '410203040001' }
const FILIAL_FOR = { nome: 'LURE FORNECEDOR E2E SP', uf: 'SP', municipio: 'Sao Paulo', cep: '01310100', base: '510203040001' }
const CONTATO_CLI = { nome: 'Contato E2E Cliente', email: 'e2e.cliente@example.com' }
const CONTATO_FOR = { nome: 'Contato E2E Fornecedor', email: 'e2e.fornecedor@example.com' }
const PRODUTO = 'lure produto e2e' // produtos são gravados em minúsculas
const REGIME_LUCRO_REAL = '1'

// Valores do orçamento: 100 × R$ 12,34 com ICMS 12% e PIS 9,25% → PIS = 114,145 (testa o
// arredondamento); a entrega de 61 dá 752,74 em 3 parcelas → 250,91 + 250,91 + 250,92.
const QTD = '100'
const UNIT = '12,34'
const COMISSAO_UNIT = '1,11'
const QTD_ENTREGA_1 = '61'
const QTD_ENTREGA_2 = '39'
const PRAZOS = ['11', '18', '20'] // 30/60/90 dd (prazos_recebimento)
const FORMA_BOLETO = '2'
const BAIXA_PARCIAL = '10,00'

const RAIZ_SAIDA = resolve('qa', 'e2e')
const ARQ_ESTADO = join(RAIZ_SAIDA, 'estado.json')

// ============================================================================ utilidades

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

const env = lerEnv()
if (!env.QA_EMAIL || !env.QA_SENHA || !env.DATABASE_URL) {
  console.error('Faltam QA_EMAIL, QA_SENHA ou DATABASE_URL no .env')
  process.exit(1)
}

function hojeSP(deslocDias = 0) {
  const d = new Date(Date.now() + deslocDias * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d)
}

/** Dígitos verificadores de CNPJ (mesmo algoritmo de lib/documento.ts). */
function cnpjComDv(base12) {
  const dv = (b) => {
    const pesos = b.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const s = [...b].reduce((acc, c, i) => acc + Number(c) * pesos[i], 0) % 11
    return s < 2 ? 0 : 11 - s
  }
  const d1 = dv(base12)
  return `${base12}${d1}${dv(base12 + d1)}`
}

// ---- dinheiro exato em centavos (BigInt), arredondamento half-up como o round() do Postgres
function centavos(v) {
  const s = String(v).trim()
  const neg = s.startsWith('-')
  const [i, f = ''] = s.replace('-', '').split('.')
  const c = BigInt(i || '0') * 100n + BigInt((f + '00').slice(0, 2))
  const resto = (f + '000').slice(2)
  const ajuste = /^[5-9]/.test(resto) ? 1n : 0n
  return neg ? -(c + ajuste) : c + ajuste
}
function reais(c) {
  const neg = c < 0n
  const a = neg ? -c : c
  return `${neg ? '-' : ''}${a / 100n}.${String(a % 100n).padStart(2, '0')}`
}
function reaisBR(c) {
  const [i, f] = reais(c).replace('-', '').split('.')
  return `${c < 0n ? '-' : ''}${i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${f}`
}
function brParaPonto(txt) {
  return txt.replace(/\./g, '').replace(',', '.')
}
/** round(a × b, 2) com a e b decimais em texto — exato. */
function mult2(...fatores) {
  let num = 1n
  let escala = 1n
  for (const f of fatores) {
    const [i, d = ''] = String(f).split('.')
    num *= BigInt(i + d)
    escala *= 10n ** BigInt(d.length)
  }
  // resultado em centavos = num / escala * 100, half-up
  const n = num * 100n
  return (n * 2n + escala) / (2n * escala)
}
/** fn_valor_parcela (db/010): round(total/n, 2) nas i < n, a última leva a sobra. */
function parcelas(totalC, n) {
  let base = (totalC * 2n + BigInt(n)) / (2n * BigInt(n))
  if (base * BigInt(n - 1) > totalC) base = totalC / BigInt(n)
  return Array.from({ length: n }, (_, i) => (i < n - 1 ? base : totalC - base * BigInt(n - 1)))
}
function somenteValor(texto) {
  const m = texto.match(/-?[\d.]+,\d{2}/)
  return m ? m[0] : null
}

// ============================================================================ banco (só leitura)

let db = null
const falhasConexao = [] // registradas no relatório: o banco é Micro e divide a máquina com a carga

/** Conecta pelo pooler (DATABASE_URL) e, se ele não responder, pela conexão direta. */
async function conectar() {
  for (let tentativa = 1; tentativa <= 6; tentativa++) {
    for (const nome of ['DATABASE_URL', 'DIRECT_URL']) {
      if (!env[nome]) continue
      const c = new pg.Client({ connectionString: env[nome], ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20_000 })
      const t0 = performance.now()
      try {
        await c.connect()
        c.on('error', () => {}) // queda do socket: o próximo sql() reconecta
        db = c
        return
      } catch (e) {
        falhasConexao.push({ em: new Date().toISOString(), via: nome, ms: Math.round(performance.now() - t0), erro: String(e.message).slice(0, 120) })
        await c.end().catch(() => {})
      }
    }
    await new Promise((r) => setTimeout(r, 10_000))
  }
  throw new Error(`banco inacessível (${falhasConexao.length} tentativas): ${falhasConexao.at(-1)?.erro}`)
}

async function sql(texto, params = []) {
  for (let tentativa = 1; ; tentativa++) {
    try {
      if (!db) await conectar()
      await db.query('begin read only')
      try {
        return (await db.query(texto, params)).rows
      } finally {
        await db.query('rollback').catch(() => {})
      }
    } catch (e) {
      const conexao = /connect|terminat|ECONN|timeout|Connection/i.test(String(e.message))
      if (!conexao || tentativa >= 3) throw e
      falhasConexao.push({ em: new Date().toISOString(), via: 'consulta', erro: String(e.message).slice(0, 120) })
      await db?.end().catch(() => {})
      db = null
    }
  }
}
async function um(texto, params = []) {
  return (await sql(texto, params))[0] ?? null
}
async function latenciaBanco() {
  const t0 = performance.now()
  await sql('select 1')
  const ping = Math.round(performance.now() - t0)
  const t1 = performance.now()
  await sql('select count(*) from public.entregas where status_id = 5')
  const consulta = Math.round(performance.now() - t1)
  const ativas = await um(
    "select count(*)::int as n from pg_stat_activity where datname = current_database() and state = 'active'",
  )
  return { ping_ms: ping, consulta_entregas_ms: consulta, conexoes_ativas: ativas?.n ?? null, em: new Date().toISOString() }
}

// ============================================================================ registro

const execucao = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const SAIDA = join(RAIZ_SAIDA, `${execucao}-${MODO}`)
const acoes = [] // { etapa, acao, ms, status, detalhe, avisos[], console[] }
const divergencias = [] // { etapa, o_que, esperado, obtido, consulta }
const conferencias = [] // { etapa, o_que, ok, detalhe }
let etapaAtual = '—'
let consoleBuffer = []

function classificar(ms) {
  if (ms > CRITICA_MS) return 'CRÍTICA'
  if (ms > LENTA_MS) return 'LENTA'
  return 'OK'
}

function conferir(o_que, ok, esperado, obtido, consulta = null) {
  conferencias.push({ etapa: etapaAtual, o_que, ok, esperado: String(esperado), obtido: String(obtido) })
  if (!ok) divergencias.push({ etapa: etapaAtual, o_que, esperado: String(esperado), obtido: String(obtido), consulta })
  console.log(`   ${ok ? '✔' : '✘'} ${o_que}${ok ? '' : ` — esperado ${esperado}, obtido ${obtido}`}`)
}

async function avisosNaTela(pagina) {
  try {
    return await pagina.evaluate(() => {
      const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
      const textos = []
      for (const el of document.querySelectorAll('[role="alert"], .aviso[data-tom="erro"]')) {
        const t = (el.textContent ?? '').trim()
        if (t && vis(el)) textos.push(t.slice(0, 200))
      }
      if (document.body.innerText.includes('Parte desta cotação não carregou')) textos.push('Parte desta cotação não carregou')
      return [...new Set(textos)]
    })
  } catch {
    return []
  }
}

/**
 * Mede UMA ação: `fazer` dispara (clique) e ESPERA a tela refletir o resultado. O tempo vai do
 * início do `fazer` até ele resolver. Erro vira linha ERRO + captura, e o fluxo segue quando
 * `opcional`, ou para (lança) quando não.
 */
async function medir(pagina, acao, fazer, { opcional = false } = {}) {
  consoleBuffer = []
  const t0 = performance.now()
  let status
  let detalhe = ''
  let retorno
  try {
    retorno = await fazer()
    const ms = Math.round(performance.now() - t0)
    status = classificar(ms)
    registrar(ms)
  } catch (e) {
    const ms = Math.round(performance.now() - t0)
    status = 'ERRO'
    detalhe = String(e?.message ?? e).split('\n')[0].slice(0, 300)
    const captura = join(SAIDA, `erro-${acoes.length + 1}.png`)
    await pagina.screenshot({ path: captura, fullPage: true }).catch(() => {})
    detalhe += ` (captura: ${captura})`
    registrar(ms)
    if (!opcional) throw new ErroFluxo(`${acao}: ${detalhe}`)
  }
  return retorno

  function registrar(ms) {
    const linha = { etapa: etapaAtual, acao, ms, status, detalhe, avisos: [], console: [...consoleBuffer] }
    acoes.push(linha)
    avisosNaTela(pagina).then((a) => (linha.avisos = a))
    const marca = status === 'OK' ? ' ' : status === 'ERRO' ? '✘' : '!'
    console.log(` ${marca} [${String(ms).padStart(6)} ms] ${status.padEnd(7)} ${acao}${detalhe ? ` — ${detalhe}` : ''}`)
  }
}

class ErroFluxo extends Error {}

function etapa(nome) {
  etapaAtual = nome
  console.log(`\n== ${nome}`)
}

// ============================================================================ navegador

async function abrirNavegador() {
  const navegador = await chromium.launch({ headless: !HEADED })
  const contexto = await navegador.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  })
  const pagina = await contexto.newPage()
  pagina.setDefaultTimeout(LIMITE_MS)
  pagina.on('dialog', (d) => d.accept().catch(() => {})) // window.confirm das telas
  pagina.on('console', (m) => {
    if (m.type() === 'error') consoleBuffer.push(`console: ${m.text().slice(0, 300)}`)
  })
  pagina.on('pageerror', (e) => consoleBuffer.push(`pageerror: ${String(e.message).slice(0, 300)}`))
  pagina.on('response', (r) => {
    if (r.status() >= 500) consoleBuffer.push(`HTTP ${r.status()} ${r.request().method()} ${r.url().replace(BASE, '')}`)
  })
  return { navegador, pagina }
}

async function entrar(pagina) {
  await medir(pagina, 'Login (tela /entrar → /inicio)', async () => {
    await pagina.goto(`${BASE}/entrar`, { waitUntil: 'domcontentloaded' })
    await pagina.fill('input[name="email"]', env.QA_EMAIL)
    await pagina.fill('input[name="senha"]', env.QA_SENHA)
    await Promise.all([
      pagina.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: LIMITE_MS }),
      pagina.click('button[type="submit"]'),
    ])
  })
}

/** Navega e espera o CONTEÚDO (seletor real), nunca o esqueleto. */
async function carregar(pagina, rota, seletor, rotulo = `Carregar ${rota.split('?')[0]}`) {
  return medir(pagina, rotulo, async () => {
    await pagina.goto(`${BASE}${rota}`, { waitUntil: 'commit' })
    await pagina.locator(seletor).first().waitFor({ state: 'visible', timeout: LIMITE_MS })
  })
}

const SEL = {
  vendas: '[data-teste="kanban"]:not([aria-busy="true"]) [data-teste="coluna-cot"]',
  cadastros: '[data-teste="lista-grupos"], [data-teste="lista-vazia"]',
  produtos: '[data-teste="lista-produtos"], [data-teste="lista-vazia"]',
  financeiro: '[data-teste="financeiro-conteudo"] [data-teste="tabela-receber"], [data-teste="financeiro-conteudo"] [data-teste="tabela-pagar"], [data-teste="financeiro-conteudo"] [data-teste="tabela-entregas"], [data-teste="financeiro-conteudo"] [data-teste="lista-vazia"]',
  metas: '[data-teste="painel-metas"], [data-teste="lista-vazia"]',
  inicio: '[data-teste="inicio-conteudo"]',
  relatorios: '[data-teste="relatorio-conteudo"]:not([aria-busy="true"])',
}

// ============================================================================ ids do banco

async function idGrupo(tipo, nome) {
  return (await um('select id, ativo from public.grupos_clifor where tipo = $1 and nome = $2 order by criado_em limit 1', [tipo, nome])) ?? null
}
async function filialPorNome(grupoId, nome) {
  return um(
    `select e.id, e.ativo, e.uf, e.regime_tributario_id, e.documento from public.enderecos_clifor e
      where e.grupo_id = $1 and e.nome_endereco = $2 order by e.criado_em limit 1`,
    [grupoId, nome],
  )
}
async function contatoPorEmail(grupoId, email) {
  return um('select id, ativo from public.contatos_clifor where grupo_id = $1 and email = $2 order by criado_em limit 1', [grupoId, email])
}
async function usuarioQa() {
  return um(
    `select u.id, u.nome from public.usuarios u join auth.users a on a.id = u.id where lower(a.email) = lower($1)`,
    [env.QA_EMAIL],
  )
}

async function lerEstado() {
  try {
    return JSON.parse(await readFile(ARQ_ESTADO, 'utf8'))
  } catch {
    return {}
  }
}
async function gravarEstado(e) {
  await mkdir(RAIZ_SAIDA, { recursive: true })
  await writeFile(ARQ_ESTADO, JSON.stringify(e, null, 2))
}

// ============================================================================ 1. cadastro

async function garantirGrupo(pagina, tipo, nome, estado) {
  let g = await idGrupo(tipo, nome)
  if (g) {
    console.log(`   (reaproveita ${tipo} "${nome}")`)
    if (!g.ativo) {
      await carregar(pagina, `/cadastros?tipo=${tipo}&sel=${g.id}`, '[data-teste="ficha-grupo"] [role="tablist"]', `Abrir ficha de ${nome}`)
      await medir(pagina, `Reativar ${tipo} ${nome}`, async () => {
        await pagina.locator('[data-teste="ficha-grupo"] footer').getByRole('button', { name: 'Reativar' }).click()
        await pagina.locator('[data-teste="ficha-grupo"]').getByText('Ativo', { exact: true }).waitFor()
      })
    }
    return g.id
  }
  await carregar(pagina, `/cadastros?tipo=${tipo}`, SEL.cadastros, `Carregar /cadastros (${tipo})`)
  await medir(pagina, `Criar ${tipo} "${nome}"`, async () => {
    await pagina.click('[data-teste="novo-grupo"]')
    await pagina.fill('[data-teste="campo-nome"]', nome)
    await pagina.click('[data-teste="gravar-grupo"]')
    // grupo novo abre a ficha dele (abas aparecem)
    await pagina.locator('[data-teste="ficha-grupo"] [role="tablist"]').waitFor()
  })
  g = await idGrupo(tipo, nome)
  conferir(`${tipo} "${nome}" gravado no banco`, !!g, 'existe', g ? 'existe' : 'não existe')
  estado.gruposCriados = [...(estado.gruposCriados ?? []), g.id]
  return g.id
}

async function garantirFilial(pagina, tipo, grupoId, f) {
  const documento = cnpjComDv(f.base)
  let filial = await filialPorNome(grupoId, f.nome)
  const rota = `/cadastros?tipo=${tipo}&sel=${grupoId}`
  if (filial) {
    console.log(`   (reaproveita filial "${f.nome}")`)
    if (!filial.ativo) {
      await carregar(pagina, rota, '[data-teste="nova-filial"]', `Abrir ficha (${tipo})`)
      await medir(pagina, `Reativar filial ${f.nome}`, async () => {
        const item = pagina.locator('[data-teste="item-filial"]', { hasText: f.nome })
        await item.getByRole('button', { name: 'Reativar' }).click()
        await item.getByText('Ativa', { exact: true }).waitFor()
      })
    }
    return (await filialPorNome(grupoId, f.nome)).id
  }
  await carregar(pagina, rota, '[data-teste="nova-filial"]', `Abrir ficha (${tipo})`)
  await medir(pagina, `Criar filial "${f.nome}" (${f.uf}, Lucro Real)`, async () => {
    await pagina.click('[data-teste="nova-filial"]')
    const form = pagina.locator('[data-teste="form-filial"]')
    await form.locator('[data-teste="campo-nome-endereco"]').fill(f.nome)
    await form.locator('[data-teste="campo-documento"]').fill(documento)
    await form.locator('[data-teste="campo-regime"]').selectOption(REGIME_LUCRO_REAL)
    await form.locator('[data-teste="campo-razao"]').fill(`${f.nome} LTDA`)
    await form.locator('[data-teste="campo-fantasia"]').fill(f.nome)
    await form.locator('[data-teste="campo-cep"]').fill(f.cep)
    await form.locator('[data-teste="campo-uf"]').selectOption(f.uf)
    await form.locator('[data-teste="campo-logradouro"]').fill('Rua de Teste E2E')
    await form.locator('[data-teste="campo-municipio"]').fill(f.municipio)
    await form.locator('[data-teste="gravar-filial"]').click()
    await pagina.locator('[data-teste="item-filial"]', { hasText: f.nome }).waitFor()
  })
  filial = await filialPorNome(grupoId, f.nome)
  conferir(`filial "${f.nome}" no banco com UF ${f.uf}, regime 1, CNPJ ${documento}`,
    !!filial && filial.uf === f.uf && Number(filial.regime_tributario_id) === 1 && filial.documento === documento,
    `${f.uf}/1/${documento}`, filial ? `${filial.uf}/${filial.regime_tributario_id}/${filial.documento}` : 'nada')
  return filial.id
}

async function garantirContato(pagina, tipo, grupoId, filialId, c) {
  let contato = await contatoPorEmail(grupoId, c.email)
  const rota = `/cadastros?tipo=${tipo}&sel=${grupoId}`
  if (contato) {
    console.log(`   (reaproveita contato ${c.email})`)
    if (!contato.ativo) {
      await carregar(pagina, rota, '[data-teste="novo-contato"]', `Abrir ficha (${tipo})`)
      await medir(pagina, `Reativar contato ${c.nome}`, async () => {
        const item = pagina.locator('[data-teste="item-contato"]', { hasText: c.nome })
        await item.getByRole('button', { name: 'Reativar' }).click()
        await item.getByText('Inativo', { exact: true }).waitFor({ state: 'detached' })
      })
    }
    return (await contatoPorEmail(grupoId, c.email)).id
  }
  await carregar(pagina, rota, '[data-teste="novo-contato"]', `Abrir ficha (${tipo})`)
  await medir(pagina, `Criar contato "${c.nome}" <${c.email}>`, async () => {
    await pagina.click('[data-teste="novo-contato"]')
    const form = pagina.locator('[data-teste="form-contato"]')
    await form.locator('[data-teste="campo-contato-nome"]').fill(c.nome)
    await form.locator('[data-teste="campo-contato-email"]').fill(c.email)
    await form.locator('[data-teste="campo-contato-filial"]').selectOption(filialId)
    await form.locator('[data-teste="gravar-contato"]').click()
    await pagina.locator('[data-teste="item-contato"]', { hasText: c.nome }).waitFor()
  })
  contato = await contatoPorEmail(grupoId, c.email)
  conferir(`contato ${c.email} no banco`, !!contato, 'existe', contato ? 'existe' : 'não existe')
  return contato.id
}

async function garantirProduto(pagina, filialForId, documentoFor, estado) {
  let p = await um('select id, ativo from public.produtos where nome = $1 order by criado_em limit 1', [PRODUTO])
  if (!p) {
    await carregar(pagina, '/produtos', SEL.produtos)
    await medir(pagina, `Criar produto "${PRODUTO}"`, async () => {
      await pagina.click('[data-teste="novo-produto"]')
      await pagina.fill('[data-teste="ficha-produto"] [data-teste="campo-nome"]', PRODUTO)
      const tipo = pagina.locator('[data-teste="ficha-produto"] [data-teste="campo-tipo"]')
      const valorTipo = await tipo.locator('option:not([value=""])').first().getAttribute('value')
      await tipo.selectOption(valorTipo)
      const grupo = pagina.locator('[data-teste="ficha-produto"] [data-teste="campo-grupo"]')
      await grupo.locator('option:not([value=""])').first().waitFor({ state: 'attached' })
      await grupo.selectOption(await grupo.locator('option:not([value=""])').first().getAttribute('value'))
      await pagina.click('[data-teste="ficha-produto"] [data-teste="gravar-produto"]')
      await pagina.locator('[data-teste="ficha-produto"] [role="tab"]', { hasText: 'Fornecedores' }).waitFor()
    })
    p = await um('select id, ativo from public.produtos where nome = $1 order by criado_em limit 1', [PRODUTO])
    conferir(`produto "${PRODUTO}" no banco`, !!p, 'existe', p ? 'existe' : 'não existe')
    estado.produtoCriado = p.id
  } else {
    console.log(`   (reaproveita produto "${PRODUTO}")`)
  }
  if (!p.ativo) {
    await carregar(pagina, `/produtos?sel=${p.id}`, '[data-teste="ficha-produto"] [role="tablist"]', 'Abrir ficha do produto')
    await medir(pagina, 'Reativar produto de teste', async () => {
      await pagina.locator('[data-teste="ficha-produto"] footer').getByRole('button', { name: 'Reativar' }).click()
      await pagina.locator('[data-teste="ficha-produto"]').getByText('Ativo', { exact: true }).waitFor()
    })
  }
  const ligado = await um('select 1 from public.fornecedor_produtos where produto_id = $1 and endereco_fornecedor_id = $2', [p.id, filialForId])
  if (ligado) {
    console.log('   (fornecedor já ligado ao produto)')
    return p.id
  }
  await carregar(pagina, `/produtos?sel=${p.id}`, '[data-teste="ficha-produto"] [role="tablist"]', 'Abrir ficha do produto')
  await medir(pagina, 'Aba Fornecedores do produto', async () => {
    await pagina.locator('[data-teste="ficha-produto"] [role="tab"]', { hasText: 'Fornecedores' }).click()
    await pagina.locator('[data-teste="busca-filial"]').waitFor()
  })
  await medir(pagina, 'Buscar filial do fornecedor pelo CNPJ', async () => {
    await pagina.fill('[data-teste="busca-filial"]', documentoFor)
    await pagina.locator('[data-teste="resultado-filiais"] li', { hasText: FILIAL_FOR.nome }).waitFor()
  })
  await medir(pagina, 'Ligar fornecedor ao produto', async () => {
    await pagina.locator('[data-teste="resultado-filiais"] li', { hasText: FILIAL_FOR.nome }).getByRole('button', { name: 'Ligar' }).click()
    await pagina.locator('[data-teste="ficha-produto"] [data-teste="lista-filiais"] li', { hasText: FORNECEDOR }).waitFor()
  })
  const ok = await um('select 1 as ok from public.fornecedor_produtos where produto_id = $1 and endereco_fornecedor_id = $2', [p.id, filialForId])
  conferir('fornecedor_produtos gravado', !!ok, 'ligado', ok ? 'ligado' : 'não ligado')
  return p.id
}

async function garantirMeta(pagina, qa, estado) {
  const comp = `${hojeSP().slice(0, 7)}-01`
  let meta = await um(
    'select id from public.metas_mensais where vendedor_id = $1 and competencia = $2 and tipo_meta_id = 1',
    [qa.id, comp],
  )
  if (meta) {
    console.log('   (reaproveita meta do mês do vendedor de QA)')
    return meta.id
  }
  await carregar(pagina, '/metas', SEL.metas)
  const nivel = await um('select id from public.niveis_vendedor order by ordem limit 1')
  await medir(pagina, `Criar meta do mês para ${qa.nome}`, async () => {
    await pagina.click('[data-teste="criar-meta"]')
    const d = pagina.locator('[data-teste="dialogo-meta"]')
    await d.locator('[data-teste="campo-vendedor"]').selectOption(qa.id)
    await d.locator('[data-teste="campo-nivel"]').selectOption(nivel.id)
    await d.locator('[data-teste="campo-valor"]').fill('1000,00')
    await d.locator('[data-teste="gravar-meta"]').click()
    await d.waitFor({ state: 'detached' })
    await pagina.locator('[data-teste="linha-meta"]', { hasText: qa.nome }).first().waitFor()
  })
  meta = await um(
    'select id from public.metas_mensais where vendedor_id = $1 and competencia = $2 and tipo_meta_id = 1',
    [qa.id, comp],
  )
  conferir('meta mensal de QA no banco', !!meta, 'existe', meta ? 'existe' : 'não existe')
  estado.metaCriada = meta.id
  return meta.id
}

// ============================================================================ leitura de telas

async function realizadoNaTela(pagina, nomeVendedor) {
  await carregar(pagina, '/metas', SEL.metas, 'Carregar /metas')
  const linha = pagina.locator('[data-teste="linha-meta"]', { hasText: nomeVendedor }).first()
  if (!(await linha.count())) return null
  return somenteValor(await linha.locator('[data-teste="realizado"]').innerText())
}

async function celulaInicio(pagina, rotuloFornecedor) {
  await carregar(pagina, '/inicio', SEL.inicio, 'Carregar /inicio (matriz)')
  const cab = await pagina.locator('[data-teste="inicio-conteudo"] thead th').allInnerTexts()
  const linha = pagina.locator('[data-teste="inicio-conteudo"] tbody tr', { hasText: rotuloFornecedor }).first()
  if (!(await linha.count())) return { total: null, cabecalho: cab }
  const celulas = await linha.locator('td').allInnerTexts()
  return { total: somenteValor(celulas.at(-1) ?? ''), celulas, cabecalho: cab }
}

// ============================================================================ o fluxo

async function fluxo(pagina) {
  const estado = await lerEstado()
  const qa = await usuarioQa()
  if (!qa) throw new ErroFluxo('usuário de QA não encontrado em public.usuarios')
  const inicioExec = new Date().toISOString()
  const r = { ids: {} } // ids do que este fluxo tocou

  // ----------------------------------------------------------------- 1. cadastro
  etapa('1. Cadastro')
  const cliId = await garantirGrupo(pagina, 'cliente', CLIENTE, estado)
  const forId = await garantirGrupo(pagina, 'fornecedor', FORNECEDOR, estado)
  const filCliId = await garantirFilial(pagina, 'cliente', cliId, FILIAL_CLI)
  const filForId = await garantirFilial(pagina, 'fornecedor', forId, FILIAL_FOR)
  const conCliId = await garantirContato(pagina, 'cliente', cliId, filCliId, CONTATO_CLI)
  const conForId = await garantirContato(pagina, 'fornecedor', forId, filForId, CONTATO_FOR)
  const produtoId = await garantirProduto(pagina, filForId, cnpjComDv(FILIAL_FOR.base), estado)
  const metaId = await garantirMeta(pagina, qa, estado)
  await gravarEstado(estado)
  Object.assign(r.ids, { cliId, forId, filCliId, filForId, conCliId, conForId, produtoId, metaId })

  // linhas de base, para medir o "antes/depois" do Financeiro
  const realizadoAntes = await realizadoNaTela(pagina, qa.nome)
  const calcAntes = await um('select realizado::text from public.fn_calculo_meta($1)', [metaId])
  const inicioAntes = await celulaInicio(pagina, FILIAL_FOR.nome)

  // ----------------------------------------------------------------- 2. cotação
  etapa('2. Nova cotação')
  await carregar(pagina, '/vendas', SEL.vendas, 'Carregar /vendas (kanban)')
  const dialogoNova = pagina.locator('[data-teste="nova-cotacao-dialogo"]')
  await medir(pagina, 'Abrir nova cotação (até a lista de produtos carregar)', async () => {
    await pagina.click('[data-teste="nova-cotacao"]')
    await dialogoNova.locator(`[data-teste="campo-produto"] option[value="${produtoId}"]`).waitFor({ state: 'attached' })
  })
  await medir(pagina, 'Buscar cliente "LURE CLIENTE"', async () => {
    await dialogoNova.locator('[data-teste="campo-cliente"]').fill(CLIENTE)
    await dialogoNova.locator('#cot-resultados').getByRole('button', { name: CLIENTE, exact: true }).waitFor()
  })
  await medir(pagina, 'Escolher cliente (carrega endereços)', async () => {
    await dialogoNova.locator('#cot-resultados').getByRole('button', { name: CLIENTE, exact: true }).click()
    await dialogoNova.locator(`[data-teste="campo-destino"] option[value="${filCliId}"]`).waitFor({ state: 'attached' })
  })
  await dialogoNova.locator('[data-teste="campo-destino"]').selectOption(filCliId)
  await dialogoNova.locator('[data-teste="campo-produto"]').selectOption(produtoId)
  await dialogoNova.locator('[data-teste="campo-qtd"]').fill(QTD)
  await dialogoNova.locator('[data-teste="campo-medida"]').fill(`${MARCA} ${execucao}`)
  await medir(pagina, 'Adicionar produto ao carrinho (cria o rascunho)', async () => {
    await dialogoNova.locator('[data-teste="gravar-item"]').click()
    await pagina.waitForURL(/sel=/)
    await pagina.locator('[data-teste="item-carrinho"]').first().waitFor()
  })
  const cotacaoId = new URL(pagina.url()).searchParams.get('sel')
  r.ids.cotacaoId = cotacaoId
  const cot = await um('select numero, rascunho, cliente_id, vendedor_id from public.cotacoes where id = $1', [cotacaoId])
  conferir('cotação em rascunho, do LURE CLIENTE e do vendedor de QA',
    cot?.rascunho === true && cot.cliente_id === cliId && cot.vendedor_id === qa.id, 'rascunho/cliente/QA', JSON.stringify(cot))

  const tela = pagina.locator('dialog[open]').first()
  await medir(pagina, 'Abrir "Adiciona fornecedor para orçar" (lista fornecedores)', async () => {
    await tela.locator('[data-teste="novo-orcamento"]').first().click()
    await tela.locator(`[data-teste="campo-fornecedor"] option[value="${filForId}"]`).waitFor({ state: 'attached' })
  })
  await tela.locator('[data-teste="campo-fornecedor"]').selectOption(filForId)
  await tela.locator('[data-teste="campo-unit"]').fill(UNIT)
  await tela.locator('[data-teste="campo-comissao"]').fill(COMISSAO_UNIT)
  await medir(pagina, 'Gravar orçamento do fornecedor (valores + tributos)', async () => {
    await tela.locator('[data-teste="gravar-orcamento"]').click()
    await tela.locator('[data-teste="linha-orcamento"]').first().waitFor()
  })
  const textoOrc = await tela.locator('[data-teste="linha-orcamento"]').first().innerText()
  const orc = await um(
    `select v.id, v.aliquota_icms::text, v.aliquota_pis_cofins::text, v.valor_venda_bruto::text, v.valor_icms::text,
            v.valor_pis_cofins::text, v.valor_tributos::text, v.valor_venda_liquido::text, v.valor_comissao_bruto::text,
            v.valor_unit_liquido::text, v.qtd_venda::text
       from public.v_orcamento_valores v where v.cotacao_id = $1`, [cotacaoId])
  r.ids.orcamentoId = orc?.id
  const aliqTabela = await um('select aliquota::text from public.icms_aliquotas where uf_origem = $1 and uf_destino = $2', [FILIAL_FOR.uf, FILIAL_CLI.uf])
  const pisPadrao = await um('select public.fn_aliquota_pis_cofins()::text as a')
  const unit = brParaPonto(UNIT)
  const brutoC = mult2(QTD, unit)
  const icmsC = mult2(QTD, unit, aliqTabela.aliquota)
  const pisC = mult2(QTD, unit, pisPadrao.a)
  const liqC = brutoC - icmsC - pisC
  const comC = mult2(QTD, brParaPonto(COMISSAO_UNIT))
  const consultaOrc = `select * from v_orcamento_valores where cotacao_id = '${cotacaoId}'`
  conferir(`ICMS ${FILIAL_FOR.uf}→${FILIAL_CLI.uf} Lucro Real×Lucro Real = alíquota da tabela`, orc.aliquota_icms === aliqTabela.aliquota, aliqTabela.aliquota, orc.aliquota_icms, consultaOrc)
  conferir('PIS/COFINS = fn_aliquota_pis_cofins()', orc.aliquota_pis_cofins === pisPadrao.a, pisPadrao.a, orc.aliquota_pis_cofins, consultaOrc)
  conferir('Total bruto = qtd × unit', centavos(orc.valor_venda_bruto) === brutoC, reais(brutoC), orc.valor_venda_bruto, consultaOrc)
  conferir('Valor ICMS = round(qtd × unit × alíq, 2)', centavos(orc.valor_icms) === icmsC, reais(icmsC), orc.valor_icms, consultaOrc)
  conferir('Valor PIS/COFINS = round(qtd × unit × 9,25%, 2) (meio centavo p/ cima)', centavos(orc.valor_pis_cofins) === pisC, reais(pisC), orc.valor_pis_cofins, consultaOrc)
  conferir('Total líquido = bruto − ICMS − PIS', centavos(orc.valor_venda_liquido) === liqC, reais(liqC), orc.valor_venda_liquido, consultaOrc)
  conferir('Total comissão = qtd × comissão unit', centavos(orc.valor_comissao_bruto) === comC, reais(comC), orc.valor_comissao_bruto, consultaOrc)
  conferir('Tela mostra o total bruto e o líquido do banco', textoOrc.includes(reaisBR(brutoC)) && textoOrc.includes(reaisBR(liqC)), `${reaisBR(brutoC)} e ${reaisBR(liqC)}`, textoOrc.replace(/\s+/g, ' ').slice(0, 200))

  await medir(pagina, 'Marcar vencedor (troféu)', async () => {
    await tela.locator('[data-teste="trofeu"]').first().click()
    await tela.locator('[data-teste="trofeu"][aria-pressed="true"]').first().waitFor()
  })
  await medir(pagina, 'Gravar cotação (fecha a tela cheia)', async () => {
    await tela.locator('[data-teste="gravar-cotacao"]').click()
    await pagina.locator('dialog[open]').waitFor({ state: 'detached' })
  })
  const cotGravada = await um('select numero, rascunho, etapa_id from public.cotacoes where id = $1', [cotacaoId])
  const venc = await um('select count(*)::int n from public.orcamentos_fornecedor where cotacao_id = $1 and vencedor', [cotacaoId])
  conferir('cotação gravada (não é mais rascunho), etapa Cotação, 1 vencedor',
    cotGravada.rascunho === false && Number(cotGravada.etapa_id) === 1 && venc.n === 1, 'false/1/1', `${cotGravada.rascunho}/${cotGravada.etapa_id}/${venc.n}`)
  console.log(`   cotação nº ${cotGravada.numero}`)

  // ----------------------------------------------------------------- 3. proposta
  etapa('3. Proposta')
  await carregar(pagina, `/vendas?sel=${cotacaoId}&aba=propostas`, '[data-teste="ficha-cotacao"] [data-teste="nova-proposta"]', 'Abrir cotação na aba Propostas')
  const ficha = pagina.locator('[data-teste="ficha-cotacao"]')
  await medir(pagina, 'Criar proposta (abre o formulário)', async () => {
    await ficha.locator('[data-teste="nova-proposta"]').click()
    await pagina.locator('[data-teste="dialogo-proposta"]').waitFor()
  })
  const dProp = pagina.locator('[data-teste="dialogo-proposta"]')
  await dProp.locator('[data-teste="campo-contato"]').selectOption(conCliId)
  await dProp.locator('[data-teste="campo-prev-entrega"]').fill(hojeSP(10))
  await dProp.locator('select[name="faturar_para_endereco_id"]').selectOption(filCliId)
  await dProp.locator('input[name="condicao_pagamento"]').fill('30/60/90 dd')
  await dProp.locator('textarea[name="info_adicional"]').fill(`${MARCA} ${execucao}`)
  await medir(pagina, 'Gravar e Enviar proposta', async () => {
    await dProp.locator('[data-teste="enviar-proposta"]').click()
    await dProp.waitFor({ state: 'detached' })
    await ficha.locator('[data-teste="ok-fluxo"]', { hasText: 'Proposta enviada' }).waitFor()
  })
  const prop = await um('select id, numero, enviada, enviar_para_contato_id from public.propostas where cotacao_id = $1 order by criado_em desc limit 1', [cotacaoId])
  r.ids.propostaId = prop.id
  const propItens = await um('select count(*)::int n, sum(qtd)::text q from public.proposta_itens where proposta_id = $1', [prop.id])
  conferir('proposta enviada, para o contato @example.com, com 1 item de qtd 100', prop.enviada === true && prop.enviar_para_contato_id === conCliId && propItens.n === 1 && Number(propItens.q) === Number(QTD), `true/${conCliId}/1/100`, `${prop.enviada}/${prop.enviar_para_contato_id}/${propItens.n}/${propItens.q}`)

  // ----------------------------------------------------------------- 4. pedido
  etapa('4. Pedido')
  await medir(pagina, 'Transformar proposta em pedido', async () => {
    await ficha.locator('[data-teste="virar-pedido"]').first().click()
    await ficha.locator('[data-teste="pedido"]').first().waitFor()
  })
  const ped = await um('select id, numero, etapa_id, formalizado from public.pedidos where cotacao_id = $1 order by criado_em desc limit 1', [cotacaoId])
  r.ids.pedidoId = ped.id
  r.pedidoNumero = ped.numero
  console.log(`   pedido nº ${ped.numero}`)
  const contasAntes = await um(
    `select (select count(*) from public.contas_receber where pedido_id = $1)::int cr,
            (select count(*) from public.contas_pagar where pedido_id = $1)::int cp`, [ped.id])
  conferir('pedido recém-criado não tem conta a receber nem a pagar', contasAntes.cr === 0 && contasAntes.cp === 0, '0/0', `${contasAntes.cr}/${contasAntes.cp}`)

  const dPed = pagina.locator('[data-teste="dialogo-pedido"]')
  await medir(pagina, 'Abrir "Dados e formalização" do pedido', async () => {
    await ficha.locator('[data-teste="editar-pedido"]').first().click()
    await dPed.waitFor()
  })
  await dPed.locator('[data-teste="campo-contato-cliente"]').selectOption(conCliId)
  await dPed.locator('[data-teste="campo-contato-fornecedor"]').selectOption(conForId)
  await dPed.locator('input[name="ordem_compra_numero"]').fill(`${MARCA}-${execucao}`)
  await dPed.locator('[data-teste="campo-forma"]').selectOption(FORMA_BOLETO)
  for (const pz of PRAZOS) await dPed.locator(`input[name="prazos"][value="${pz}"]`).check()
  await medir(pagina, 'Gravar prazos de pagamento (30/60/90) e forma', async () => {
    await dPed.locator('[data-teste="gravar-pedido"]').click()
    await dPed.waitFor({ state: 'detached' })
    await ficha.locator('[data-teste="ok-fluxo"]', { hasText: 'Pedido gravado' }).waitFor()
  })
  const prazosGravados = await sql('select prazo_id::text from public.pedido_prazos where pedido_id = $1 order by prazo_id', [ped.id])
  conferir('pedido_prazos = 30/60/90 dd', prazosGravados.map((x) => x.prazo_id).join(',') === PRAZOS.join(','), PRAZOS.join(','), prazosGravados.map((x) => x.prazo_id).join(','))

  await medir(pagina, 'Reabrir pedido', async () => {
    await ficha.locator('[data-teste="editar-pedido"]').first().click()
    await dPed.waitFor()
  })
  await medir(pagina, 'Formalizar pedido por e-mail', async () => {
    await dPed.locator('[data-teste="campo-formalizar"]').check()
    await dPed.locator('[data-teste="gravar-pedido"]').click()
    await dPed.waitFor({ state: 'detached' })
    await ficha.locator('[data-teste="selo-formalizado"]', { hasText: 'Formalizado' }).first().waitFor()
  })
  const pedF = await um('select formalizado, forma_pagamento_id::text, contato_cliente_id, contato_fornecedor_id from public.pedidos where id = $1', [ped.id])
  conferir('pedido formalizado, boleto, contatos e2e', pedF.formalizado === true && pedF.forma_pagamento_id === FORMA_BOLETO && pedF.contato_cliente_id === conCliId && pedF.contato_fornecedor_id === conForId, 'true/2/e2e/e2e', JSON.stringify(pedF))

  // ----------------------------------------------------------------- 5. entregas
  etapa('5. Entregas')
  for (const [i, qtd] of [QTD_ENTREGA_1, QTD_ENTREGA_2].entries()) {
    const antes = await ficha.locator('[data-teste="linha-entrega"]').count()
    await medir(pagina, `Lançar entrega ${i + 1} de 2 (qtd ${qtd})`, async () => {
      await ficha.locator('[data-teste="nova-entrega"]').first().click()
      const form = ficha.locator('[data-teste="form-entrega"]')
      await form.locator('[data-teste="campo-qtd-entrega"]').fill(qtd)
      await form.locator('[data-teste="campo-data-entrega"]').fill(hojeSP(7 + i))
      await form.locator('[data-teste="gravar-form-entrega"]').click()
      await ficha.locator('[data-teste="linha-entrega"]').nth(antes).waitFor()
    })
  }
  const entregas = await sql(
    `select id, qtd::text, status_id, valor_venda_bruto::text, valor_venda_liquido::text, valor_comissao::text,
            valor_venda_bruto_unit::text, valor_venda_liquido_unit::text, valor_comissao_unit::text
       from public.entregas where pedido_id = $1 order by qtd desc`, [ped.id])
  conferir('2 entregas, 61 + 39 = 100 (a quantidade vendida)', entregas.length === 2 && entregas.reduce((s, e) => s + Number(e.qtd), 0) === Number(QTD), '2 / 100', `${entregas.length} / ${entregas.reduce((s, e) => s + Number(e.qtd), 0)}`)
  const [e1, e2] = entregas
  r.ids.entrega1 = e1.id
  r.ids.entrega2 = e2.id
  const liqUnit = (Number(liqC) / Number(QTD) / 100).toFixed(6) // só para exibir; conferência abaixo é exata
  for (const e of entregas) {
    const bruto = mult2(e.qtd, brParaPonto(UNIT))
    const com = mult2(e.qtd, brParaPonto(COMISSAO_UNIT))
    const liq = mult2(e.qtd, orc.valor_unit_liquido)
    const q = `select * from entregas where id = '${e.id}'`
    conferir(`entrega qtd ${Number(e.qtd)}: bruto ${reais(bruto)}, comissão ${reais(com)}, líquido ${reais(liq)}`,
      centavos(e.valor_venda_bruto) === bruto && centavos(e.valor_comissao) === com && centavos(e.valor_venda_liquido) === liq,
      `${reais(bruto)}/${reais(com)}/${reais(liq)}`, `${e.valor_venda_bruto}/${e.valor_comissao}/${e.valor_venda_liquido}`, q)
  }
  void liqUnit

  const dEnt = pagina.locator('[data-teste="dialogo-entrega"]')
  await medir(pagina, 'Abrir NF / saída da entrega 1', async () => {
    await ficha.locator('[data-teste="linha-entrega"]', { hasText: String(Number(e1.qtd)) }).first().locator('[data-teste="abrir-saida"]').click()
    await dEnt.waitFor()
  })
  const nf = `E2E${execucao.replace(/\D/g, '').slice(-8)}`
  await dEnt.locator('[data-teste="campo-nf"]').fill(nf)
  await dEnt.locator('[data-teste="campo-data-nf"]').fill(hojeSP())
  await dEnt.locator('[data-teste="campo-arquivo-nf"]').setInputFiles({
    name: `nf-${nf}.pdf`,
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'),
  })
  await dEnt.locator('[data-teste="campo-saiu"]').check()
  await medir(pagina, 'Registrar NF + "Saiu para entrega" (upload do PDF)', async () => {
    await dEnt.locator('[data-teste="gravar-entrega"]').click()
    await dEnt.waitFor({ state: 'detached' })
    await ficha.locator('[data-teste="ok-fluxo"]', { hasText: 'Saiu para entrega' }).waitFor()
  })
  const e1s = await um('select status_id, saiu_entrega, nf_fornecedor_numero, (select count(*)::int from public.entrega_arquivos a where a.entrega_id = e.id) arquivos from public.entregas e where id = $1', [e1.id])
  conferir('entrega 1: Em Entrega (4), saiu, NF gravada, 1 arquivo', Number(e1s.status_id) === 4 && e1s.saiu_entrega && e1s.nf_fornecedor_numero === nf && e1s.arquivos === 1, `4/true/${nf}/1`, `${e1s.status_id}/${e1s.saiu_entrega}/${e1s.nf_fornecedor_numero}/${e1s.arquivos}`)

  // ----------------------------------------------------------------- 6. financeiro
  etapa('6. Financeiro')
  await carregar(pagina, `/financeiro?aba=entregas&cliente=${encodeURIComponent(CLIENTE)}`, SEL.financeiro, 'Carregar Financeiro › Confirmar entregas')
  const linhaConf = pagina.locator('[data-teste="tabela-entregas"] tbody tr', { hasText: `Pedido ${ped.numero}` }).first()
  const dConf = pagina.locator('[data-teste="dialogo-confirmar"]')
  await medir(pagina, 'Abrir "Confirmar" da entrega 1', async () => {
    await linhaConf.locator('[data-teste="confirmar-entrega"]').click()
    await dConf.waitFor()
  })
  const marcados = await dConf.locator('input[name="prazos"]:checked').evaluateAll((els) => els.map((e) => e.value))
  conferir('diálogo já traz os prazos negociados no pedido', marcados.join(',') === PRAZOS.join(','), PRAZOS.join(','), marcados.join(','))
  await medir(pagina, 'Confirmar entrega (gera parcelas e comissão)', async () => {
    await dConf.locator('[data-teste="gravar-confirmacao"]').click()
    await dConf.locator('[data-teste="ok-dialogo"]').waitFor()
  })
  await dConf.getByRole('button', { name: 'Fechar' }).last().click().catch(() => {})

  const dtEntrega = hojeSP()
  const cr = await sql(
    `select c.id, c.parcela, c.parcelas_total, c.prazo_id::text, c.valor_total::text, c.valor_comissao::text,
            c.dt_vencimento::text, c.status_id from public.contas_receber c where c.entrega_id = $1 and c.cancelada_em is null order by c.parcela`, [e1.id])
  const consultaCr = `select * from contas_receber where entrega_id = '${e1.id}' order by parcela`
  const esperadoTotal = parcelas(centavos(e1.valor_venda_bruto), PRAZOS.length)
  const esperadoCom = parcelas(centavos(e1.valor_comissao), PRAZOS.length)
  conferir(`3 parcelas a receber (uma por prazo)`, cr.length === PRAZOS.length, PRAZOS.length, cr.length, consultaCr)
  conferir('parcelas (venda) = rateio exato, sobra na última', cr.map((c) => c.valor_total).join('|') === esperadoTotal.map(reais).join('|'), esperadoTotal.map(reais).join('|'), cr.map((c) => c.valor_total).join('|'), consultaCr)
  conferir('Σ parcelas (venda) = bruto da entrega ao centavo', cr.reduce((s, c) => s + centavos(c.valor_total), 0n) === centavos(e1.valor_venda_bruto), e1.valor_venda_bruto, reais(cr.reduce((s, c) => s + centavos(c.valor_total), 0n)), consultaCr)
  conferir('Σ parcelas (comissão) = comissão da entrega ao centavo', cr.reduce((s, c) => s + centavos(c.valor_comissao), 0n) === centavos(e1.valor_comissao) && cr.map((c) => c.valor_comissao).join('|') === esperadoCom.map(reais).join('|'), esperadoCom.map(reais).join('|'), cr.map((c) => c.valor_comissao).join('|'), consultaCr)
  const dias = (await sql('select id::text, dias_prazo from public.prazos_recebimento where id = any($1::smallint[]) order by dias_prazo', [PRAZOS])).map((x) => x.dias_prazo)
  const vencEsperados = dias.map((d) => new Date(Date.parse(`${dtEntrega}T12:00:00Z`) + d * 86_400_000).toISOString().slice(0, 10))
  conferir('vencimentos = data real + dias do prazo', cr.map((c) => c.dt_vencimento).join(',') === vencEsperados.join(','), vencEsperados.join(','), cr.map((c) => c.dt_vencimento).join(','), consultaCr)

  const cp = await sql(`select id, valor_base::text, percentual::text, valor_comissao::text, dt_vencimento::text, status_id, vendedor_id from public.contas_pagar where entrega_id = $1 and cancelada_em is null`, [e1.id])
  const consultaCp = `select * from contas_pagar where entrega_id = '${e1.id}'`
  const perc = await um('select public.fn_percentual_comissao_vendedor($1, $2::date)::text p', [qa.id, dtEntrega])
  const cpEsperada = mult2(e1.valor_comissao, perc.p)
  const [a, m] = dtEntrega.split('-').map(Number)
  const vencCp = new Date(Date.UTC(a, m, 5)).toISOString().slice(0, 10)
  conferir('1 conta a pagar (comissão do vendedor) por entrega', cp.length === 1, 1, cp.length, consultaCp)
  if (cp[0]) {
    conferir(`comissão do vendedor = round(${e1.valor_comissao} × ${perc.p}, 2)`, centavos(cp[0].valor_comissao) === cpEsperada && cp[0].valor_base === e1.valor_comissao, reais(cpEsperada), cp[0].valor_comissao, consultaCp)
    conferir('vencimento da comissão = dia 5 do mês seguinte', cp[0].dt_vencimento === vencCp, vencCp, cp[0].dt_vencimento, consultaCp)
    conferir('comissão é do vendedor da cotação (QA)', cp[0].vendedor_id === qa.id, qa.id, cp[0].vendedor_id, consultaCp)
  }
  const e1f = await um('select status_id, dt_entrega::text from public.entregas where id = $1', [e1.id])
  conferir('entrega 1 passou para Financeiro (5) com data real de hoje', Number(e1f.status_id) === 5 && e1f.dt_entrega === dtEntrega, `5/${dtEntrega}`, `${e1f.status_id}/${e1f.dt_entrega}`)
  const e2c = await um('select (select count(*) from public.contas_receber where entrega_id = $1)::int cr, (select count(*) from public.contas_pagar where entrega_id = $1)::int cp', [e2.id])
  conferir('entrega 2 (não confirmada) continua sem conta a receber/pagar', e2c.cr === 0 && e2c.cp === 0, '0/0', `${e2c.cr}/${e2c.cp}`)

  await carregar(pagina, `/financeiro?pedido=${ped.numero}`, SEL.financeiro, 'Carregar Contas a receber do pedido')
  const linhasCr = await pagina.locator('[data-teste="tabela-receber"] tbody tr').count()
  conferir('tela de contas a receber mostra as 3 parcelas do pedido', linhasCr === PRAZOS.length, PRAZOS.length, linhasCr)
  await carregar(pagina, `/financeiro?aba=pagar&pedido=${ped.numero}`, SEL.financeiro, 'Carregar Contas a pagar do pedido')
  const textoCp = await pagina.locator('[data-teste="financeiro-conteudo"]').innerText()
  conferir('tela de contas a pagar mostra a comissão do vendedor', textoCp.includes(reaisBR(cpEsperada)), reaisBR(cpEsperada), textoCp.includes('Nenhuma conta') ? 'lista vazia' : 'valor ausente')

  // baixa parcial e estorno na 1ª parcela
  const p1 = cr[0]
  await carregar(pagina, `/financeiro?pedido=${ped.numero}&sel=${p1.id}`, '[data-teste="ficha-conta"] [data-teste="saldo-conta"]', 'Abrir ficha da parcela 1')
  const fichaConta = pagina.locator('[data-teste="ficha-conta"]')
  const saldoParcial = centavos(p1.valor_comissao) - centavos(brParaPonto(BAIXA_PARCIAL))
  await fichaConta.locator('[data-teste="campo-valor"]').fill(BAIXA_PARCIAL)
  await fichaConta.locator('input[name="nf_numero"]').fill(nf)
  await medir(pagina, `Baixa parcial de R$ ${BAIXA_PARCIAL} na parcela 1`, async () => {
    await fichaConta.locator('[data-teste="confirmar-baixa-parcial"]').click()
    await fichaConta.locator('[data-teste="saldo-conta"]', { hasText: reaisBR(saldoParcial) }).waitFor()
  })
  const vcr1 = await um('select saldo::text, valor_baixado::text, status_id from public.v_contas_receber where id = $1', [p1.id])
  conferir('baixa parcial: saldo = comissão − baixa, conta segue aberta (1)', centavos(vcr1.saldo) === saldoParcial && Number(vcr1.status_id) === 1, `${reais(saldoParcial)}/1`, `${vcr1.saldo}/${vcr1.status_id}`, `select * from v_contas_receber where id = '${p1.id}'`)
  await medir(pagina, 'Estornar a baixa parcial (Diretor)', async () => {
    await fichaConta.locator('[data-teste="estornar"]').first().click()
    await fichaConta.locator('[data-teste="campo-motivo"]').fill(`${MARCA} estorno de teste`)
    await fichaConta.locator('[data-teste="confirmar-estorno"]').click()
    await fichaConta.locator('[data-teste="linha-baixa"]', { hasText: 'Estornada' }).first().waitFor()
    await fichaConta.locator('[data-teste="saldo-conta"]', { hasText: reaisBR(centavos(p1.valor_comissao)) }).waitFor()
  })
  const vcr2 = await um('select saldo::text, status_id, (select count(*)::int from public.baixas b where b.conta_receber_id = v.id) baixas, (select count(*)::int from public.estornos s join public.baixas b on b.id = s.baixa_id where b.conta_receber_id = v.id) estornos from public.v_contas_receber v where id = $1', [p1.id])
  conferir('estorno: saldo volta ao total, baixa fica registrada (append-only)', centavos(vcr2.saldo) === centavos(p1.valor_comissao) && vcr2.baixas === 1 && vcr2.estornos === 1, `${p1.valor_comissao}/1 baixa/1 estorno`, `${vcr2.saldo}/${vcr2.baixas}/${vcr2.estornos}`)

  // ----------------------------------------------------------------- 7. metas
  etapa('7. Metas')
  const calcDepois = await um('select realizado::text, qtd_entregas from public.fn_calculo_meta($1)', [metaId])
  const realizadoDepois = await realizadoNaTela(pagina, qa.nome)
  const diffBanco = centavos(calcDepois.realizado) - centavos(calcAntes.realizado)
  conferir('realizado (banco) subiu exatamente a comissão da entrega confirmada', diffBanco === centavos(e1.valor_comissao), e1.valor_comissao, reais(diffBanco), `select * from fn_calculo_meta('${metaId}')`)
  conferir('realizado na tela = fn_calculo_meta', realizadoDepois === reaisBR(centavos(calcDepois.realizado)), reaisBR(centavos(calcDepois.realizado)), realizadoDepois ?? 'linha da meta não apareceu')
  if (realizadoAntes !== null && realizadoDepois !== null) {
    const diffTela = centavos(brParaPonto(realizadoDepois)) - centavos(brParaPonto(realizadoAntes))
    conferir('realizado na tela: antes → depois da confirmação', diffTela === centavos(e1.valor_comissao), `+${e1.valor_comissao}`, `${realizadoAntes} → ${realizadoDepois}`)
  }
  const linhaMeta = pagina.locator('[data-teste="linha-meta"]', { hasText: qa.nome }).first()
  if (await linhaMeta.count()) {
    await medir(pagina, 'Ver entregas que somam o realizado', async () => {
      await linhaMeta.locator('[data-teste="ver-entregas"]').click()
      await pagina.locator('[data-teste="dialogo-entregas-meta"] [data-teste="tabela-entregas-meta"]').waitFor()
    }, { opcional: true })
    const detalhe = await pagina.locator('[data-teste="dialogo-entregas-meta"]').innerText().catch(() => '')
    conferir('detalhe das entregas da meta lista o LURE CLIENTE', detalhe.includes(CLIENTE), CLIENTE, detalhe ? 'ausente' : 'diálogo não abriu')
  }

  // ----------------------------------------------------------------- 8. relatórios e início
  etapa('8. Relatórios e Início')
  const inicioDepois = await celulaInicio(pagina, FILIAL_FOR.nome)
  const matriz = await sql('select nivel, fornecedor, mes::text, valor_comissao::text from public.fn_inicio_comissoes_fornecedor_mes($1::date, $2::date) where endereco_id = $3 and nivel = 1', [`${dtEntrega.slice(0, 4)}-01-01`, `${dtEntrega.slice(0, 4)}-12-31`, filForId])
  const totalMatriz = matriz[0]?.valor_comissao ?? '0'
  conferir('matriz do início: linha da filial do fornecedor e2e = soma do banco', inicioDepois.total === reaisBR(centavos(totalMatriz)), reaisBR(centavos(totalMatriz)), inicioDepois.total ?? 'linha ausente', `select * from fn_inicio_comissoes_fornecedor_mes('${dtEntrega.slice(0, 4)}-01-01','${dtEntrega.slice(0, 4)}-12-31') where endereco_id = '${filForId}'`)
  if (inicioAntes.total !== null || inicioDepois.total !== null) {
    const antesC = inicioAntes.total ? centavos(brParaPonto(inicioAntes.total)) : 0n
    const depoisC = inicioDepois.total ? centavos(brParaPonto(inicioDepois.total)) : 0n
    conferir('matriz do início subiu a comissão da entrega confirmada', depoisC - antesC === centavos(e1.valor_comissao), `+${e1.valor_comissao}`, `${inicioAntes.total ?? '—'} → ${inicioDepois.total ?? '—'}`)
  }
  await carregar(pagina, '/relatorios', SEL.relatorios, 'Carregar /relatorios (entregas por cliente)')
  const textoRel = await pagina.locator('[data-teste="relatorio-conteudo"]').innerText()
  conferir('relatório de entregas por cliente lista o LURE CLIENTE no mês', textoRel.includes(CLIENTE), CLIENTE, 'ausente')
  await carregar(pagina, '/relatorios?modelo=fornecedores', SEL.relatorios, 'Carregar /relatorios (por fornecedor)')
  const textoRelF = await pagina.locator('[data-teste="relatorio-conteudo"]').innerText()
  conferir('relatório por fornecedor lista o LURE FORNECEDOR', textoRelF.includes(FORNECEDOR) || textoRelF.includes(FILIAL_FOR.nome), FORNECEDOR, 'ausente')

  // ----------------------------------------------------------------- 9. duplicação × financeiro
  etapa('9. Duplicação de pedido × financeiro')
  await carregar(pagina, `/vendas?sel=${cotacaoId}&aba=pedidos`, '[data-teste="ficha-cotacao"] [data-teste="pedido"]', 'Abrir cotação na aba Pedidos')
  const botaoDup = await pagina.locator('button, a', { hasText: /duplicar/i }).count()
  const dupNoKanban = await (async () => {
    await pagina.goto(`${BASE}/vendas?cliente=${encodeURIComponent(CLIENTE)}`, { waitUntil: 'commit' })
    await pagina.locator(SEL.vendas).first().waitFor()
    return pagina.locator('button, a, [aria-label]', { hasText: /duplicar/i }).count()
  })()
  r.duplicarNaTela = botaoDup + dupNoKanban > 0
  // Não é divergência: no Bubble o ícone (Icon GZZZ, WF bUAdY) nunca fica visível (vendas.md §8.1).
  console.log(`   função "Duplicar pedido" na tela: ${r.duplicarNaTela ? 'EXISTE' : 'não existe (no Bubble o ícone também é inalcançável)'}`)

  // Sem a função, a regra é conferida no banco sobre TODOS os pedidos e2e (cada execução é um
  // pedido "irmão" do anterior, do mesmo cliente/fornecedor/produto): conta só nasce de entrega
  // confirmada, nunca é copiada entre pedidos, e confirmar de novo não duplica.
  const invariantes = await sql(
    `with ped as (select p.id from public.pedidos p where p.ordem_compra_numero like $1)
     select
       (select count(*) from public.contas_receber c join public.entregas e on e.id = c.entrega_id
         where e.pedido_id in (select id from ped) and e.status_id not in (5, 6) and c.cancelada_em is null)::int as cr_de_entrega_nao_confirmada,
       (select count(*) from public.contas_pagar c join public.entregas e on e.id = c.entrega_id
         where e.pedido_id in (select id from ped) and e.status_id not in (5, 6) and c.cancelada_em is null)::int as cp_de_entrega_nao_confirmada,
       (select count(*) from public.contas_receber c join public.entregas e on e.id = c.entrega_id
         where c.pedido_id is distinct from e.pedido_id)::int as cr_com_pedido_trocado,
       (select count(*) from (select c.entrega_id from public.contas_receber c where c.cancelada_em is null
          and c.entrega_id in (select e.id from public.entregas e where e.pedido_id in (select id from ped))
          group by c.entrega_id, c.parcela having count(*) > 1) x)::int as parcela_repetida,
       (select count(*) from (select c.entrega_id from public.contas_pagar c where c.cancelada_em is null and c.origem = 'entrega'
          and c.entrega_id in (select e.id from public.entregas e where e.pedido_id in (select id from ped))
          group by c.entrega_id having count(*) > 1) x)::int as cp_repetida,
       (select count(*) from ped)::int as pedidos_e2e`,
    [`${MARCA}-%`],
  )
  const inv = invariantes[0]
  const consultaInv = 'ver scripts/e2e-fluxo-completo.mjs, etapa 9 (invariantes sobre pedidos com OC like \'E2E-%\')'
  conferir(`nenhuma conta a receber em entrega não confirmada (${inv.pedidos_e2e} pedidos e2e)`, inv.cr_de_entrega_nao_confirmada === 0, 0, inv.cr_de_entrega_nao_confirmada, consultaInv)
  conferir('nenhuma conta a pagar em entrega não confirmada', inv.cp_de_entrega_nao_confirmada === 0, 0, inv.cp_de_entrega_nao_confirmada, consultaInv)
  conferir('nenhuma conta a receber apontando para pedido diferente do da entrega (base inteira)', inv.cr_com_pedido_trocado === 0, 0, inv.cr_com_pedido_trocado, consultaInv)
  conferir('nenhuma parcela repetida por entrega', inv.parcela_repetida === 0, 0, inv.parcela_repetida, consultaInv)
  conferir('nenhuma comissão (CP) repetida por entrega', inv.cp_repetida === 0, 0, inv.cp_repetida, consultaInv)
  const irmaos = await sql(
    `select p.numero, p.id, count(distinct c.id)::int cr, count(distinct cp.id)::int cp
       from public.pedidos p left join public.contas_receber c on c.pedido_id = p.id and c.cancelada_em is null
       left join public.contas_pagar cp on cp.pedido_id = p.id and cp.cancelada_em is null
      where p.ordem_compra_numero like $1 group by p.numero, p.id order by p.numero`, [`${MARCA}-%`])
  r.pedidosE2e = irmaos
  const esteCr = irmaos.find((x) => x.id === ped.id)
  conferir('o pedido desta execução tem só as contas da SUA entrega confirmada (3 CR + 1 CP)', esteCr?.cr === PRAZOS.length && esteCr?.cp === 1, `${PRAZOS.length}/1`, esteCr ? `${esteCr.cr}/${esteCr.cp}` : 'ausente')

  // ----------------------------------------------------------------- e-mails
  etapa('E-mails da execução (fila em modo registro)')
  const emails = await sql(
    `select status, para, cc, bcc, modelo_chave from public.email_outbox where criado_em >= $1 and criado_por = $2 order by criado_em`,
    [inicioExec, qa.id],
  )
  r.emails = emails
  const enviados = emails.filter((x) => x.status === 'enviado')
  conferir('nenhum e-mail da execução com status "enviado"', enviados.length === 0, 0, enviados.length, `select status, count(*) from email_outbox where criado_em >= '${inicioExec}' group by 1`)
  const fora = emails.flatMap((x) => [x.para, x.cc, x.bcc].filter(Boolean).join(',').split(/[,;]\s*/)).filter((x) => x && !/@example\.com$/i.test(x.trim()))
  conferir('destinatários só @example.com (para/cc/bcc)', fora.length === 0, 'só @example.com', fora.length ? `${fora.length} endereço(s) de fora (domínios: ${[...new Set(fora.map((x) => x.split('@')[1]))].join(', ')})` : 'ok')
  console.log(`   ${emails.length} e-mail(s) na fila: ${[...new Set(emails.map((x) => `${x.modelo_chave ?? '?'}=${x.status}`))].join(', ')}`)

  return r
}

// ============================================================================ --rotas

async function medirRotas(pagina) {
  etapa('Carga das telas (3× cada) — separa lentidão do app da do banco')
  const rotas = [
    ['/inicio', SEL.inicio],
    ['/vendas', SEL.vendas],
    ['/cadastros', SEL.cadastros],
    ['/produtos', SEL.produtos],
    ['/financeiro', SEL.financeiro],
    ['/financeiro?aba=entregas', SEL.financeiro],
    ['/metas', SEL.metas],
    ['/relatorios', SEL.relatorios],
  ]
  for (const [rota, sel] of rotas) {
    for (let i = 1; i <= 3; i++) await carregar(pagina, rota, sel, `Carregar ${rota} (#${i})`).catch(() => {})
  }
}

// ============================================================================ --limpar

async function limpar(pagina) {
  const estado = await lerEstado()
  const cli = await idGrupo('cliente', CLIENTE)
  const forn = await idGrupo('fornecedor', FORNECEDOR)

  etapa('Limpar: entregas e2e que não chegaram ao Financeiro → Cancelar')
  const pendentes = await sql(
    `select e.id, e.cotacao_id, e.qtd::text from public.entregas e join public.pedidos p on p.id = e.pedido_id
      where p.ordem_compra_numero like $1 and e.status_id in (2, 3, 4)`, [`${MARCA}-%`])
  for (const e of pendentes) {
    await carregar(pagina, `/vendas?sel=${e.cotacao_id}&aba=pedidos`, '[data-teste="ficha-cotacao"] [data-teste="pedido"]', 'Abrir pedido e2e')
    await medir(pagina, `Cancelar entrega e2e (qtd ${Number(e.qtd)})`, async () => {
      const linhas = pagina.locator(`[data-teste="linha-entrega"]:has([data-teste="cancelar-entrega"])`)
      await linhas.first().locator('[data-teste="cancelar-entrega"]').click()
      const d = pagina.locator('[data-teste="dialogo-cancelar-entrega"]')
      await d.locator('[data-teste="campo-motivo"]').fill(`${MARCA} limpeza do teste`)
      await d.locator('[data-teste="confirmar-cancelamento"]').click()
      await d.waitFor({ state: 'detached' })
    }, { opcional: true })
  }

  etapa('Limpar: contas a receber e2e → Arquivar (baixas e estornos ficam: append-only)')
  const contas = await sql(
    `select c.id, p.numero from public.contas_receber c join public.pedidos p on p.id = c.pedido_id
      where p.ordem_compra_numero like $1 and not c.arquivado and c.cancelada_em is null`, [`${MARCA}-%`])
  for (const c of contas) {
    await carregar(pagina, `/financeiro?pedido=${c.numero}&sel=${c.id}`, '[data-teste="ficha-conta"]', 'Abrir conta e2e')
    await medir(pagina, `Arquivar conta a receber (pedido ${c.numero})`, async () => {
      const f = pagina.locator('[data-teste="ficha-conta"]')
      await f.getByRole('button', { name: 'Arquivar' }).click()
      await f.getByRole('button', { name: 'Desarquivar' }).waitFor()
    }, { opcional: true })
  }

  etapa('Limpar: cotações e2e ainda em Cotação → Arquivar')
  if (cli) {
    const abertas = await sql(
      `select distinct c.id from public.cotacoes c join public.cotacao_itens i on i.cotacao_id = c.id
        where c.cliente_id = $1 and c.etapa_id = 1 and not c.arquivado and not c.rascunho and i.medida like $2`,
      [cli.id, `${MARCA} %`])
    for (const c of abertas) {
      await carregar(pagina, `/vendas?sel=${c.id}`, '[data-teste="ficha-cotacao"]', 'Abrir cotação e2e')
      await medir(pagina, 'Arquivar cotação e2e', async () => {
        const f = pagina.locator('[data-teste="ficha-cotacao"]')
        const motivo = f.locator('select[name="motivo_id"]')
        await motivo.selectOption(await motivo.locator('option:not([value=""])').first().getAttribute('value'))
        await f.getByRole('button', { name: 'Arquivar' }).click()
        await f.getByRole('button', { name: 'Desarquivar' }).waitFor()
      }, { opcional: true })
    }
  }

  etapa('Limpar: meta de QA (só se criada pelo e2e)')
  if (estado.metaCriada) {
    await carregar(pagina, '/metas', SEL.metas)
    const qa = await usuarioQa()
    await medir(pagina, 'Apagar meta criada pelo e2e', async () => {
      await pagina.locator('[data-teste="linha-meta"]', { hasText: qa.nome }).first().locator('[data-teste="editar-meta"]').click()
      const d = pagina.locator('[data-teste="dialogo-meta"]')
      await d.getByRole('button', { name: 'Apagar' }).click()
      await d.waitFor({ state: 'detached' })
    }, { opcional: true })
    const aindaExiste = await um('select 1 from public.metas_mensais where id = $1', [estado.metaCriada])
    if (!aindaExiste) delete estado.metaCriada
  } else console.log('   (meta não foi criada pelo e2e: fica)')

  etapa('Limpar: produto de teste → desligar fornecedor e desativar')
  const prod = await um('select id, ativo from public.produtos where nome = $1', [PRODUTO])
  if (prod) {
    const filFor = forn ? await filialPorNome(forn.id, FILIAL_FOR.nome) : null
    const ligado = filFor ? await um('select 1 from public.fornecedor_produtos where produto_id = $1 and endereco_fornecedor_id = $2', [prod.id, filFor.id]) : null
    if (ligado) {
      await carregar(pagina, `/produtos?sel=${prod.id}`, '[data-teste="ficha-produto"] [role="tablist"]', 'Abrir produto de teste')
      await medir(pagina, 'Desligar fornecedor e2e do produto', async () => {
        await pagina.locator('[data-teste="ficha-produto"] [role="tab"]', { hasText: 'Fornecedores' }).click()
        const item = pagina.locator('[data-teste="ficha-produto"] [data-teste="lista-filiais"] li', { hasText: FORNECEDOR })
        await item.getByRole('button', { name: 'Desligar' }).click()
        await item.waitFor({ state: 'detached' })
      }, { opcional: true })
    }
    if (prod.ativo) {
      await carregar(pagina, `/produtos?sel=${prod.id}`, '[data-teste="ficha-produto"] [role="tablist"]', 'Abrir produto de teste')
      await medir(pagina, 'Desativar produto de teste', async () => {
        await pagina.locator('[data-teste="ficha-produto"] footer').getByRole('button', { name: 'Desativar' }).click()
        await pagina.locator('[data-teste="ficha-produto"]').getByText('Inativo', { exact: true }).waitFor()
      }, { opcional: true })
    }
  }

  etapa('Limpar: filiais e contatos e2e → Desativar')
  for (const [tipo, grupo, f, c] of [['cliente', cli, FILIAL_CLI, CONTATO_CLI], ['fornecedor', forn, FILIAL_FOR, CONTATO_FOR]]) {
    if (!grupo) continue
    const rota = `/cadastros?tipo=${tipo}&sel=${grupo.id}`
    const contato = await contatoPorEmail(grupo.id, c.email)
    if (contato?.ativo) {
      await carregar(pagina, rota, '[data-teste="novo-contato"]', `Abrir ficha (${tipo})`)
      await medir(pagina, `Desativar contato ${c.nome}`, async () => {
        const item = pagina.locator('[data-teste="item-contato"]', { hasText: c.nome })
        await item.getByRole('button', { name: 'Desativar' }).click()
        await item.getByText('Inativo', { exact: true }).waitFor()
      }, { opcional: true })
    }
    const filial = await filialPorNome(grupo.id, f.nome)
    if (filial?.ativo) {
      await carregar(pagina, rota, '[data-teste="nova-filial"]', `Abrir ficha (${tipo})`)
      await medir(pagina, `Desativar filial ${f.nome}`, async () => {
        const item = pagina.locator('[data-teste="item-filial"]', { hasText: f.nome })
        await item.getByRole('button', { name: 'Desativar' }).click()
        await item.getByText('Inativa', { exact: true }).waitFor()
      }, { opcional: true })
    }
    if ((estado.gruposCriados ?? []).includes(grupo.id)) {
      await carregar(pagina, rota, '[data-teste="ficha-grupo"] [role="tablist"]', `Abrir ficha (${tipo})`)
      await medir(pagina, `Desativar ${tipo} criado pelo e2e`, async () => {
        await pagina.locator('[data-teste="ficha-grupo"] footer').getByRole('button', { name: 'Desativar' }).click()
        await pagina.locator('[data-teste="ficha-grupo"]').getByText('Inativo', { exact: true }).waitFor()
      }, { opcional: true })
    }
  }
  console.log('   Contas a pagar e2e não têm arquivamento na tela: ficam (append-only).')
  await gravarEstado(estado)
}

// ============================================================================ relatório

function tabelaMarkdown() {
  const linhas = [
    '| # | Etapa | Ação | Tempo (ms) | Status | Avisos na tela / console |',
    '|---|---|---|---:|---|---|',
  ]
  acoes.forEach((a, i) => {
    const extra = [...a.avisos, ...a.console, a.detalhe].filter(Boolean).join(' · ').replace(/\|/g, '/').slice(0, 300)
    linhas.push(`| ${i + 1} | ${a.etapa} | ${a.acao} | ${a.ms} | ${a.status} | ${extra} |`)
  })
  return linhas.join('\n')
}

async function main() {
  await mkdir(SAIDA, { recursive: true })
  await conectar()
  const bancoInicio = await latenciaBanco()
  console.log(`Base ${BASE} · modo ${MODO} · banco: ping ${bancoInicio.ping_ms} ms, consulta ${bancoInicio.consulta_entregas_ms} ms, ${bancoInicio.conexoes_ativas} conexões ativas`)

  const { navegador, pagina } = await abrirNavegador()
  let resultado = null
  let falha = null
  try {
    etapa('0. Entrada')
    await entrar(pagina)
    if (MODO === 'fluxo') resultado = await fluxo(pagina)
    else if (MODO === 'rotas') await medirRotas(pagina)
    else await limpar(pagina)
  } catch (e) {
    falha = String(e?.message ?? e)
    console.error(`\nFLUXO INTERROMPIDO: ${falha}`)
  } finally {
    await new Promise((r) => setTimeout(r, 300)) // avisos assíncronos da última ação
    await navegador.close()
  }
  const bancoFim = await latenciaBanco().catch(() => null)
  await db?.end().catch(() => {})

  const resumo = {
    OK: acoes.filter((a) => a.status === 'OK').length,
    LENTA: acoes.filter((a) => a.status === 'LENTA').length,
    'CRÍTICA': acoes.filter((a) => a.status === 'CRÍTICA').length,
    ERRO: acoes.filter((a) => a.status === 'ERRO').length,
  }
  const relatorio = {
    base: BASE, modo: MODO, execucao, banco: { inicio: bancoInicio, fim: bancoFim, falhasConexao }, falha, resumo,
    acoes, conferencias, divergencias, resultado,
  }
  await writeFile(join(SAIDA, 'relatorio.json'), JSON.stringify(relatorio, null, 2))
  const md = [
    `# E2E ${MODO} — ${execucao}`,
    '',
    `Base: ${BASE}. Banco no início: ping ${bancoInicio.ping_ms} ms / consulta ${bancoInicio.consulta_entregas_ms} ms; no fim: ${bancoFim ? `${bancoFim.ping_ms} ms / ${bancoFim.consulta_entregas_ms} ms` : '—'}.`,
    `Falhas de conexão ao banco durante a execução: ${falhasConexao.length}${falhasConexao.length ? ` (${falhasConexao.map((f) => `${f.em.slice(11, 19)} ${f.via}: ${f.erro}`).join('; ')})` : ''}.`,
    `Resumo: ${Object.entries(resumo).map(([k, v]) => `${k} ${v}`).join(' · ')}${falha ? ` · INTERROMPIDO: ${falha}` : ''}`,
    '',
    tabelaMarkdown(),
    '',
    `## Conferências (${conferencias.filter((c) => c.ok).length}/${conferencias.length} ok)`,
    '',
    ...conferencias.map((c) => `- ${c.ok ? '✔' : '✘'} [${c.etapa}] ${c.o_que}${c.ok ? '' : ` — esperado \`${c.esperado}\`, obtido \`${c.obtido}\``}`),
    '',
    '## Divergências',
    '',
    ...(divergencias.length ? divergencias.map((d) => `- [${d.etapa}] ${d.o_que}: esperado \`${d.esperado}\`, obtido \`${d.obtido}\`${d.consulta ? `\n  - prova: \`${d.consulta}\`` : ''}`) : ['Nenhuma.']),
  ].join('\n')
  await writeFile(join(SAIDA, 'relatorio.md'), md)

  console.log(`\nResumo: ${Object.entries(resumo).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
  console.log(`Conferências: ${conferencias.filter((c) => c.ok).length}/${conferencias.length} ok · divergências: ${divergencias.length}`)
  console.log(`Relatório: ${join(SAIDA, 'relatorio.md')}`)
  if (falha || resumo.ERRO > 0 || divergencias.length > 0) process.exitCode = 1
}

await main()
