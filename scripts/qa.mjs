/**
 * QA por captura de tela (CLAUDE.md regra 7).
 *
 * Para cada rota: claro, escuro e 390 px. Espera **pelo conteúdo** — um seletor de
 * dado real — e nunca pelo esqueleto de carregamento. No projeto anterior, três bugs
 * reais só apareceram quando alguém abriu as capturas; por isso este script imprime
 * os caminhos no fim, para serem abertos.
 *
 * As rotas autenticadas entram pela própria tela de login, com a conta de QA do .env
 * (QA_EMAIL / QA_SENHA). Fotografar logado é o ponto: tela vazia não mostra bug de
 * layout de tabela, que é o problema real deste app (design/LEIA-ME.md).
 *
 * Uso:
 *   node scripts/qa.mjs                    # todas as rotas conhecidas
 *   node scripts/qa.mjs /inicio
 *   BASE=https://... node scripts/qa.mjs   # contra um deploy
 *
 * As capturas vão para qa/, que está fora do git.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const SAIDA = resolve('qa')

/** rota → { seletor que prova que o conteúdo chegou, precisa de sessão } */
const ROTAS = {
  '/entrar': { seletor: 'form.entrar-cartao input[name="senha"]', autenticada: false },
  '/inicio': { seletor: '[data-teste="inicio-conteudo"]', autenticada: true },
}

const VARIANTES = [
  { nome: 'claro', largura: 1440, altura: 900, escuro: false },
  { nome: 'escuro', largura: 1440, altura: 900, escuro: true },
  { nome: 'celular-390', largura: 390, altura: 844, escuro: false },
]

async function lerEnv() {
  const env = {}
  try {
    for (const linha of (await readFile('.env', 'utf8')).split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2]
    }
  } catch {
    // sem .env: só as rotas públicas serão fotografadas
  }
  return env
}

function nomeArquivo(rota, variante) {
  const base = rota === '/' ? 'raiz' : rota.replace(/^\//, '').replace(/\//g, '-')
  return `${base}-${variante}.png`
}

/** Entra pela tela de login, como um usuário de verdade. */
async function autenticar(pagina, env) {
  await pagina.goto(`${BASE}/entrar`, { waitUntil: 'domcontentloaded' })
  await pagina.fill('input[name="email"]', env.QA_EMAIL)
  await pagina.fill('input[name="senha"]', env.QA_SENHA)
  await Promise.all([
    pagina.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: 20_000 }),
    pagina.click('button[type="submit"]'),
  ])
}

async function main() {
  const env = await lerEnv()
  const temConta = Boolean(env.QA_EMAIL && env.QA_SENHA)

  const pedidas = process.argv.slice(2)
  const rotas = pedidas.length > 0 ? pedidas : Object.keys(ROTAS)

  await mkdir(SAIDA, { recursive: true })

  const navegador = await chromium.launch()
  const geradas = []
  const falhas = []

  try {
    for (const rota of rotas) {
      const config = ROTAS[rota]
      if (!config) {
        falhas.push(`${rota}: sem seletor de conteúdo declarado em ROTAS`)
        continue
      }
      if (config.autenticada && !temConta) {
        falhas.push(`${rota}: precisa de sessão, e QA_EMAIL/QA_SENHA não estão no .env`)
        continue
      }

      for (const v of VARIANTES) {
        const contexto = await navegador.newContext({
          viewport: { width: v.largura, height: v.altura },
          colorScheme: v.escuro ? 'dark' : 'light',
          locale: 'pt-BR',
          timezoneId: 'America/Sao_Paulo',
        })
        const pagina = await contexto.newPage()

        try {
          if (config.autenticada) await autenticar(pagina, env)

          await pagina.goto(`${BASE}${rota}`, { waitUntil: 'domcontentloaded' })
          // Espera pelo CONTEÚDO, não pelo esqueleto.
          await pagina.waitForSelector(config.seletor, { state: 'visible', timeout: 20_000 })

          const caminho = join(SAIDA, nomeArquivo(rota, v.nome))
          await pagina.screenshot({ path: caminho, fullPage: true })
          geradas.push(caminho)
        } catch (erro) {
          falhas.push(`${rota} [${v.nome}]: ${erro.message.split('\n')[0]}`)
        } finally {
          await contexto.close()
        }
      }
    }
  } finally {
    await navegador.close()
  }

  await writeFile(
    join(SAIDA, 'ultima-execucao.json'),
    JSON.stringify({ base: BASE, em: new Date().toISOString(), geradas, falhas }, null, 2),
  )

  console.log(`\n${geradas.length} captura(s) em ${SAIDA}:`)
  for (const c of geradas) console.log(`  ${c}`)

  if (falhas.length > 0) {
    console.error(`\n${falhas.length} falha(s):`)
    for (const f of falhas) console.error(`  ${f}`)
    process.exitCode = 1
    return
  }

  console.log('\nAbra as capturas antes de dar a tela por pronta (CLAUDE.md regra 7).')
  console.log('Compare com specs/bubble/02-telas-e-design.md e design/capturas/.')
}

await main()
