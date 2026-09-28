/**
 * Teste da TELA de rotinas (/rotinas) pelo navegador, contra o `next dev` que já está rodando.
 *
 * A conta de QA perfil 1 (QA_EMAIL) NÃO tem a página `rotinas` — de propósito (db/014 D4).
 * Este script concede a página por service_role, testa, e REMOVE a concessão no fim (pelo id).
 *
 * Contra dado REAL só se roda o modo SECO (simular). O modo REAL só atinge dado criado aqui:
 * um grupo cliente INATIVO `__qa_rotinas__grupo` com duas filiais ATIVAS. Tudo o que o script
 * cria é apagado no fim por nome exato (`in`/`eq`, nunca `like`). As linhas de
 * `rotina_execucoes` ficam (append-only, D5), identificadas pelo motivo `__qa_rotinas__`.
 *
 * Capturas em qa/rotinas-*.png (claro, escuro, 390 px) — abra antes de dar a tela por pronta.
 *
 *   node scripts/testar-tela-rotinas.mjs
 */

import { mkdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const SAIDA = resolve('qa')
const NOME = '__qa_rotinas__'
const NOME_GRUPO = `${NOME}grupo`
const NOME_FILIAIS = [`${NOME}filial_a`, `${NOME}filial_b`]

const env = {}
for (const l of (await readFile('.env', 'utf8')).split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const casos = []
function caso(nome, ok, detalhe = '') {
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${!ok && detalhe ? `  (${detalhe})` : ''}`)
}
async function exigir(p, oque) {
  const { data, error } = await p
  if (error) throw new Error(`${oque}: ${error.message}`)
  return data
}

let concessaoId = null
let grupoId = null
let filiais = {}

async function preparar(qaId) {
  const [c] = await exigir(
    admin.from('permissoes_pagina').insert({ pagina_slug: 'rotinas', usuario_id: qaId }).select('id'),
    'concessão temporária',
  )
  concessaoId = c.id
  const [g] = await exigir(
    admin
      .from('grupos_clifor')
      .insert({ tipo: 'cliente', nome: NOME_GRUPO, ativo: false, carteira_id: qaId })
      .select('id'),
    'grupo de teste',
  )
  grupoId = g.id
  const fs = await exigir(
    admin
      .from('enderecos_clifor')
      .insert(
        NOME_FILIAIS.map((n) => ({
          grupo_id: grupoId,
          nome_endereco: n,
          tipo_pessoa: 'cnpj',
          regime_tributario_id: 1,
          uf: 'SP',
          ativo: true,
        })),
      )
      .select('id, nome_endereco'),
    'filiais de teste',
  )
  filiais = Object.fromEntries(fs.map((f) => [f.nome_endereco, f.id]))
}

async function limpar() {
  const passos = []
  const reg = (oque, r) => {
    if (r.error) {
      console.error(`  FALHA  limpeza de ${oque}: ${r.error.message}`)
      process.exitCode = 1
    } else passos.push(`${oque}: ${r.data?.length ?? 0}`)
  }
  if (concessaoId) {
    reg('concessão temporária', await admin.from('permissoes_pagina').delete().eq('id', concessaoId).select('id'))
  }
  const { data: gs } = await admin.from('grupos_clifor').select('id').in('nome', [NOME_GRUPO])
  const ids = (gs ?? []).map((g) => g.id)
  if (ids.length) {
    reg('filiais', await admin.from('enderecos_clifor').delete().in('grupo_id', ids).in('nome_endereco', NOME_FILIAIS).select('id'))
    reg('grupo', await admin.from('grupos_clifor').delete().in('id', ids).select('id'))
  }
  console.log(`\nLimpeza: ${passos.join(' · ') || 'nada a limpar'}`)
}

async function entrar(pagina) {
  await pagina.goto(`${BASE}/entrar`, { waitUntil: 'domcontentloaded' })
  await pagina.fill('input[name="email"]', env.QA_EMAIL)
  await pagina.fill('input[name="senha"]', env.QA_SENHA)
  await Promise.all([
    pagina.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: 30_000 }),
    pagina.click('button[type="submit"]'),
  ])
  await pagina.goto(`${BASE}/rotinas`, { waitUntil: 'domcontentloaded' })
  await pagina.waitForSelector('[data-teste="catalogo"]', { state: 'visible', timeout: 60_000 })
  await pagina.waitForLoadState('networkidle').catch(() => {})
}

/** Abre o painel da rotina; repete o clique se a hidratação ainda não tinha terminado. */
async function abrir(pagina, slug) {
  for (let i = 0; i < 10; i++) {
    await pagina.click(`[data-teste="abrir-${slug}"]`)
    if (await pagina.waitForSelector('[data-teste="painel-rotina"]', { timeout: 3_000 }).catch(() => null)) return
  }
  throw new Error(`painel de ${slug} não abriu`)
}

/** Simula com o formulário já preenchido; devolve 'ok' ou o texto do erro. */
async function simularNaTela(pagina) {
  await pagina.click('[data-teste="simular"]')
  const r = await pagina.waitForSelector('[data-teste="resultado-simulacao"], [data-teste="erro-simulacao"]', {
    timeout: 60_000,
  })
  return (await r.getAttribute('data-teste')) === 'resultado-simulacao' ? 'ok' : await r.innerText()
}

async function marcarGrupoDeTeste(pagina) {
  await pagina.fill('.rotina-marcavel input[type="search"]', NOME)
  await pagina.check(`label.caixa:has-text("${NOME_GRUPO}") input[type="checkbox"]`)
}

async function execucoesDaSimulacao(simId) {
  return exigir(
    admin.from('rotina_execucoes').select('id, status, erro, linhas_afetadas').eq('simulacao_id', simId),
    'ler reais',
  )
}

async function ultimaSimulacao(qaId) {
  const [s] = await exigir(
    admin
      .from('rotina_execucoes')
      .select('id, linhas_afetadas, parametros')
      .eq('usuario_id', qaId)
      .eq('modo', 'seco')
      .order('inicio', { ascending: false })
      .limit(1),
    'última simulação',
  )
  return s
}

async function main() {
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
  // Várias frentes testam ao mesmo tempo com a mesma conta: o Auth pode limitar. Tenta de novo.
  let sessao = null
  let error = null
  for (let i = 0; i < 6 && !sessao?.user; i++) {
    if (i) await new Promise((r) => setTimeout(r, 5_000 * i))
    ;({ data: sessao, error } = await anon.auth.signInWithPassword({ email: env.QA_EMAIL, password: env.QA_SENHA }))
  }
  if (!sessao?.user) throw new Error(`login QA: ${error?.status ?? ''} ${error?.message ?? ''}`)
  const qaId = sessao.user.id

  await mkdir(SAIDA, { recursive: true })
  const navegador = await chromium.launch()

  // Sem a concessão, a página manda para /sem-acesso.
  {
    const ctx = await navegador.newContext({ locale: 'pt-BR' })
    const p = await ctx.newPage()
    await p.goto(`${BASE}/entrar`, { waitUntil: 'domcontentloaded' })
    await p.fill('input[name="email"]', env.QA_EMAIL)
    await p.fill('input[name="senha"]', env.QA_SENHA)
    await Promise.all([p.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: 30_000 }), p.click('button[type="submit"]')])
    await p.goto(`${BASE}/rotinas`, { waitUntil: 'domcontentloaded' })
    await p.waitForURL((u) => u.pathname !== '/rotinas', { timeout: 30_000 }).catch(() => {})
    caso('sem a concessão nominal → /sem-acesso', new URL(p.url()).pathname === '/sem-acesso', p.url())
    await ctx.close()
  }

  try {
    await preparar(qaId)

    const ctx = await navegador.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
    })
    const pagina = await ctx.newPage()
    pagina.on('pageerror', (e) => console.log('  [erro na página]', e.message))
    await entrar(pagina)
    caso('catálogo com as 2 rotinas', (await pagina.locator('[data-teste="rotina-cartao"]').count()) === 2)

    // 1) SECO contra dado real: sincronizar "todos".
    await abrir(pagina, 'sincronizar-ativo-enderecos')
    await pagina.check('input[name="escopo"][value="todos"]')
    const r1 = await simularNaTela(pagina)
    const s1 = await ultimaSimulacao(qaId)
    caso('seco "todos" (dado real) mostra contagem', r1 === 'ok' && s1.parametros.todos === true, r1)
    await pagina.screenshot({ path: join(SAIDA, 'rotinas-simulacao-claro.png'), fullPage: true })

    // 2) REAL só no grupo de teste: simular → confirmar → executar; duplo clique não dispara 2×.
    await pagina.check('input[name="escopo"][value="grupos"]')
    await marcarGrupoDeTeste(pagina)
    const r2 = await simularNaTela(pagina)
    const s2 = await ultimaSimulacao(qaId)
    caso('seco no grupo de teste acha as 2 filiais', r2 === 'ok' && s2.linhas_afetadas === 2, `${r2} / ${s2.linhas_afetadas}`)
    caso(
      'parâmetros enviados = só o grupo de teste',
      JSON.stringify(s2.parametros) === JSON.stringify({ grupo_ids: [grupoId] }),
      JSON.stringify(s2.parametros),
    )
    caso('executar desabilitado antes da confirmação', await pagina.isDisabled('[data-teste="executar"]'))
    await pagina.fill('[data-teste="confirmacao"]', 'sincronizar-ativo-enderecos')
    await pagina.fill('[data-teste="motivo"]', NOME)
    caso('executar liberado com nome + motivo', await pagina.isEnabled('[data-teste="executar"]'))
    await pagina.dblclick('[data-teste="executar"]')
    await pagina.waitForSelector('[data-teste="resultado-execucao"], [data-teste="erro-execucao"]', { timeout: 60_000 })
    caso('resultado da real na tela', await pagina.isVisible('[data-teste="resultado-execucao"]'))
    caso('botão fica desabilitado depois do clique', await pagina.isDisabled('[data-teste="executar"]'))
    const reais = await execucoesDaSimulacao(s2.id)
    caso('duplo clique gerou UMA execução real', reais.length === 1 && reais[0].status === 'ok', JSON.stringify(reais))
    const fs = await exigir(admin.from('enderecos_clifor').select('ativo, alterado_por').in('id', Object.values(filiais)), 'filiais')
    caso('filiais desativadas, alterado_por = quem clicou (D9)', fs.every((f) => !f.ativo && f.alterado_por === qaId), JSON.stringify(fs))
    await pagina.screenshot({ path: join(SAIDA, 'rotinas-execucao-claro.png'), fullPage: true })

    // 3) Alvo muda entre o seco e a real → recusa traduzida, nada muda.
    await exigir(admin.from('enderecos_clifor').update({ ativo: true }).eq('id', filiais[NOME_FILIAIS[0]]).select('id'), 'reativar a')
    await pagina.reload({ waitUntil: 'domcontentloaded' })
    await pagina.waitForSelector('[data-teste="catalogo"]')
    await pagina.waitForLoadState('networkidle').catch(() => {})
    await abrir(pagina, 'sincronizar-ativo-enderecos')
    await pagina.check('input[name="escopo"][value="grupos"]')
    await marcarGrupoDeTeste(pagina)
    const r3 = await simularNaTela(pagina)
    const s3 = await ultimaSimulacao(qaId)
    caso('seco depois de reativar 1 filial acha 1', r3 === 'ok' && s3.linhas_afetadas === 1)
    await exigir(admin.from('enderecos_clifor').update({ ativo: true }).eq('id', filiais[NOME_FILIAIS[1]]).select('id'), 'reativar b')
    await pagina.fill('[data-teste="confirmacao"]', 'sincronizar-ativo-enderecos')
    await pagina.fill('[data-teste="motivo"]', NOME)
    await pagina.click('[data-teste="executar"]')
    const erro = await pagina.waitForSelector('[data-teste="erro-execucao"]', { timeout: 60_000 }).then((e) => e.innerText()).catch(() => '')
    caso('alvo mudou → mensagem em português', /Os dados mudaram depois da simulação/.test(erro), erro)
    const fs2 = await exigir(admin.from('enderecos_clifor').select('ativo').in('id', Object.values(filiais)), 'filiais 2')
    caso('alvo mudou → nada alterado', fs2.every((f) => f.ativo))

    // 4) Transferir carteira: SECO só (origem = QA, que carrega o grupo de teste).
    await pagina.reload({ waitUntil: 'domcontentloaded' })
    await pagina.waitForSelector('[data-teste="catalogo"]')
    await pagina.waitForLoadState('networkidle').catch(() => {})
    await abrir(pagina, 'transferir-carteira')
    await pagina.selectOption('[data-teste="de-vendedor"]', qaId)
    await pagina.waitForSelector('.rotina-marcavel', { timeout: 30_000 })
    const destino = await pagina.locator('[data-teste="para-vendedor"] option:not([value=""])').first().getAttribute('value')
    await pagina.selectOption('[data-teste="para-vendedor"]', destino)
    await marcarGrupoDeTeste(pagina)
    const r4 = await simularNaTela(pagina)
    const s4 = await ultimaSimulacao(qaId)
    caso('seco de carteira só no grupo de teste acha 1', r4 === 'ok' && s4.linhas_afetadas === 1, `${r4} / ${s4.linhas_afetadas}`)

    // 5) Detalhe do histórico.
    await pagina.reload({ waitUntil: 'domcontentloaded' })
    await pagina.waitForSelector('[data-teste="historico"]')
    await pagina.waitForLoadState('networkidle').catch(() => {})
    for (let i = 0; i < 10; i++) {
      await pagina.locator('[data-teste="historico"] button.rotina-execucao').first().click()
      if (await pagina.waitForSelector('[data-teste="detalhe-execucao"]', { timeout: 3_000 }).catch(() => null)) break
    }
    const det = await pagina
      .waitForSelector('[data-teste="detalhe-execucao"] .rotina-ficha, [data-teste="detalhe-execucao"] .aviso', { timeout: 30_000 })
      .then((e) => e.getAttribute('class'))
      .catch(() => 'nada')
    caso('detalhe da execução abre com a ficha', det === 'rotina-ficha', det)
    await pagina.screenshot({ path: join(SAIDA, 'rotinas-detalhe-claro.png') })
    await ctx.close()

    // 6) Capturas claro / escuro / 390 da tela com uma simulação aberta.
    for (const v of [
      { nome: 'claro', w: 1440, h: 900, escuro: false },
      { nome: 'escuro', w: 1440, h: 900, escuro: true },
      { nome: 'celular-390', w: 390, h: 844, escuro: false },
    ]) {
      const c = await navegador.newContext({
        viewport: { width: v.w, height: v.h },
        colorScheme: v.escuro ? 'dark' : 'light',
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      })
      const p = await c.newPage()
      await entrar(p)
      await abrir(p, 'sincronizar-ativo-enderecos')
      await p.check('input[name="escopo"][value="grupos"]')
      await marcarGrupoDeTeste(p)
      await simularNaTela(p)
      await p.screenshot({ path: join(SAIDA, `rotinas-${v.nome}.png`), fullPage: true })
      const larg = await p.evaluate(() => document.documentElement.scrollWidth)
      caso(`sem rolagem horizontal [${v.nome}]`, larg <= v.w, `scrollWidth ${larg}`)
      await c.close()
    }
  } finally {
    await navegador.close()
    await limpar()
  }

  const falhas = casos.filter((c) => !c.ok).length
  console.log(`\n${casos.length - falhas}/${casos.length} ok. Capturas em ${SAIDA}\\rotinas-*.png`)
  if (falhas) process.exitCode = 1
}

await main()
