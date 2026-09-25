/**
 * Prova a corrente inteira de autorização pelo HTTP, como um navegador faria.
 *
 * `testar-rls.mjs` prova o banco. Este prova o app: middleware, `exigirAcesso()` e o
 * menu. São camadas diferentes e podem divergir — no app Bubble elas divergem, porque
 * lá a única "trava" é CSS no item de menu e digitar a URL basta
 * (specs/00-achados-de-seguranca.md §2.6).
 *
 * Usa duas contas do .env:
 *   QA_EMAIL / QA_SENHA                    → perfil 1, todas as páginas
 *   QA_OPERADOR_EMAIL / QA_OPERADOR_SENHA  → perfil 4, só /vendas
 *
 *   node scripts/testar-acesso.mjs            # contra localhost:3000
 *   BASE=https://... node scripts/testar-acesso.mjs
 */

import { readFile } from 'node:fs/promises'

import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000'

const casos = []
function caso(nome, esperado, obtido) {
  const ok = esperado === obtido
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
}

async function lerEnv() {
  const env = {}
  for (const linha of (await readFile('.env', 'utf8')).split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

async function entrar(pagina, email, senha) {
  await pagina.goto(`${BASE}/entrar`, { waitUntil: 'domcontentloaded' })
  await pagina.fill('input[name="email"]', email)
  await pagina.fill('input[name="senha"]', senha)
  await Promise.all([
    pagina.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: 20_000 }),
    pagina.click('button[type="submit"]'),
  ])
}

/**
 * Para onde a rota levou, depois de todos os redirecionamentos.
 *
 * Espera a rede sossegar antes de ler a URL: com `loading.tsx` a página faz streaming,
 * e um `redirect()` do servidor pode chegar depois do `domcontentloaded`. Ler a URL
 * cedo demais dá falso negativo — foi o que aconteceu na primeira versão deste teste.
 */
async function irPara(pagina, rota) {
  await pagina.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' })
  return new URL(pagina.url()).pathname
}

/** Qual marcador de conteúdo a página acabou mostrando. Não depende de timing de URL. */
async function conteudoDe(pagina) {
  for (const marca of ['inicio-conteudo', 'sem-acesso', 'erro-login']) {
    if (await pagina.locator(`[data-teste="${marca}"]`).count()) return marca
  }
  return 'desconhecido'
}

async function main() {
  const env = await lerEnv()
  const navegador = await chromium.launch()

  try {
    // ---------------------------------------------------------------- sem sessão
    console.log('\nSem sessão:')
    {
      const ctx = await navegador.newContext()
      const p = await ctx.newPage()
      caso('/inicio manda para /entrar', '/entrar', await irPara(p, '/inicio'))
      caso('/vendas manda para /entrar', '/entrar', await irPara(p, '/vendas'))
      caso('/entrar abre', '/entrar', await irPara(p, '/entrar'))
      await ctx.close()
    }

    // --------------------------------------------------- credencial errada
    console.log('\nCredencial errada:')
    {
      const ctx = await navegador.newContext()
      const p = await ctx.newPage()
      await p.goto(`${BASE}/entrar`, { waitUntil: 'domcontentloaded' })
      await p.fill('input[name="email"]', env.QA_EMAIL)
      await p.fill('input[name="senha"]', 'senha-errada-de-proposito')
      await p.click('button[type="submit"]')
      await p.waitForSelector('[data-teste="erro-login"]', { timeout: 15_000 })
      const texto = await p.textContent('[data-teste="erro-login"]')
      caso('mostra erro e não entra', '/entrar', new URL(p.url()).pathname)
      // A mensagem não pode dizer se o e-mail existe: isso entrega quem é cadastrado.
      caso(
        'mensagem não revela se o e-mail existe',
        true,
        /incorretos/i.test(texto ?? '') && !/não existe|não encontrado/i.test(texto ?? ''),
      )
      await ctx.close()
    }

    // ------------------------------------------------- perfil 1, todas as páginas
    console.log('\nDiretor (todas as páginas):')
    {
      const ctx = await navegador.newContext()
      const p = await ctx.newPage()
      await entrar(p, env.QA_EMAIL, env.QA_SENHA)
      caso('/inicio abre', '/inicio', await irPara(p, '/inicio'))
      const itens = await p.locator('[data-teste="menu-paginas"] li').count()
      caso('menu lista as 7 páginas', 7, itens)
      await ctx.close()
    }

    // ------------------------------------ perfil 4, só /vendas — o teste que importa
    console.log('\nOperador (só /vendas concedida):')
    {
      const ctx = await navegador.newContext()
      const p = await ctx.newPage()
      await entrar(p, env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)

      // Digitar a URL de uma página não concedida NÃO pode funcionar. É exatamente o
      // que funciona no Bubble hoje.
      const parou = await irPara(p, '/inicio')
      caso('/inicio digitado na URL cai em /sem-acesso', '/sem-acesso', parou)
      caso('e o conteúdo do início não é renderizado', 'sem-acesso', await conteudoDe(p))

      const itens = await p.locator('[data-teste="menu-paginas"] li').count()
      caso('menu lista só 1 página', 1, itens)

      const texto = await p.textContent('[data-teste="menu-paginas"]')
      caso('menu não mostra Financeiro', true, !/Financeiro/i.test(texto ?? ''))
      await ctx.close()
    }
  } finally {
    await navegador.close()
  }

  const falhas = casos.filter((c) => !c.ok).length
  console.log(`\n${casos.length - falhas}/${casos.length} casos como a spec promete.`)
  if (falhas > 0) process.exitCode = 1
}

await main()
