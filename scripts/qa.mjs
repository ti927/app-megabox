/**
 * QA por captura de tela (CLAUDE.md regra 7).
 *
 * Para cada rota: claro, escuro e 390 px. Espera **pelo conteúdo** — um
 * seletor de dado real — e nunca pelo esqueleto de carregamento. No projeto
 * anterior, três bugs reais só apareceram quando alguém abriu as capturas;
 * por isso este script imprime os caminhos no fim, para serem abertos.
 *
 * Uso:
 *   node scripts/qa.mjs                    # todas as rotas conhecidas
 *   node scripts/qa.mjs /vendas /financeiro
 *   BASE=https://... node scripts/qa.mjs   # contra um deploy
 *
 * As capturas vão para qa/, que está fora do git.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const SAIDA = resolve('qa')

/** Rota → seletor que prova que o conteúdo chegou. */
const ROTAS = {
  '/': '[data-teste="fase-a"]',
}

const VARIANTES = [
  { nome: 'claro', largura: 1440, altura: 900, tema: 'claro' },
  { nome: 'escuro', largura: 1440, altura: 900, tema: 'escuro' },
  { nome: 'celular-390', largura: 390, altura: 844, tema: 'claro' },
]

function nomeArquivo(rota, variante) {
  const base = rota === '/' ? 'raiz' : rota.replace(/^\//, '').replace(/\//g, '-')
  return `${base}-${variante}.png`
}

async function main() {
  const pedidas = process.argv.slice(2)
  const rotas = pedidas.length > 0 ? pedidas : Object.keys(ROTAS)

  await mkdir(SAIDA, { recursive: true })

  const navegador = await chromium.launch()
  const geradas = []
  const falhas = []

  try {
    for (const rota of rotas) {
      const seletor = ROTAS[rota]
      if (!seletor) {
        falhas.push(`${rota}: sem seletor de conteúdo declarado em ROTAS`)
        continue
      }

      for (const v of VARIANTES) {
        const contexto = await navegador.newContext({
          viewport: { width: v.largura, height: v.altura },
          colorScheme: v.tema === 'escuro' ? 'dark' : 'light',
          locale: 'pt-BR',
          timezoneId: 'America/Sao_Paulo',
        })
        const pagina = await contexto.newPage()

        try {
          await pagina.goto(`${BASE}${rota}`, { waitUntil: 'domcontentloaded' })
          // Espera pelo CONTEÚDO, não pelo esqueleto.
          await pagina.waitForSelector(seletor, { state: 'visible', timeout: 15_000 })
          await pagina.emulateMedia({ colorScheme: v.tema === 'escuro' ? 'dark' : 'light' })

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
