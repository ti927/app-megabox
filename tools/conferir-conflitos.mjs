/**
 * Modo relatório da carga (Fase C, §5.4 de specs/03-plano-de-construcao.md).
 *
 * Responde, com dado em vez de opinião, as pendências que bloqueiam a carga:
 *
 *   B1  `enderecos_clifor.documento` pode ser único? E `produtos (nome, grupo)`?
 *       → conta os duplicados que existem hoje. Zero conflito libera o índice único.
 *   B6  quais são as linhas de permissão do `ConfigSistema`?
 *       → é dado, não decisão: sai da própria extração.
 *
 * Roda antes de qualquer `create unique index`: no Bubble não existe unicidade em
 * tabela nenhuma, então a chance de a base estar limpa é baixa, e um índice que quebra
 * no meio da carga derruba a fatia 2, que é a tela-modelo.
 *
 * **Não grava documento nem nome de cliente no relatório.** Só contagens e amostras
 * mascaradas — o relatório sai em `bruto/`, que está fora do git, mas o princípio vale
 * mesmo assim.
 *
 * ARMADILHA: a Data API devolve os campos pelo NOME DE EXIBIÇÃO (`cpo.CnpjCpf`), e não
 * pelo id interno (`cpo_cnpjcpf_text`) que `mapa/data-types.md` e o de-para de `02` §10
 * usam. Ler pelo id devolve `undefined` em silêncio — e um relatório de conflito que
 * não lê nada informa "zero conflito", que é a pior resposta errada possível.
 * O carregador da Fase C tem de tratar isso.
 *
 *   node tools/conferir-conflitos.mjs
 */

import { readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'

const LIMITE = 100

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

async function baixarTudo(base, chave, tipo) {
  const linhas = []
  let cursor = 0
  for (;;) {
    const url = `${base}/api/1.1/obj/${tipo}?limit=${LIMITE}&cursor=${cursor}`
    const cabecalhos = chave ? { Authorization: `Bearer ${chave}` } : {}
    const resposta = await fetch(url, { headers: cabecalhos })
    if (!resposta.ok) throw new Error(`${resposta.status} em ${tipo}`)
    const r = (await resposta.json()).response ?? {}
    linhas.push(...(r.results ?? []))
    if (!r.remaining || r.remaining <= 0) break
    cursor += LIMITE
    await dormir(100)
  }
  return linhas
}

/** Mostra só o formato, nunca o valor: 12345678000190 → 12·······90 (14) */
function mascarar(v) {
  const s = String(v ?? '')
  if (s.length <= 4) return `${'·'.repeat(s.length)} (${s.length})`
  return `${s.slice(0, 2)}${'·'.repeat(Math.max(0, s.length - 4))}${s.slice(-2)} (${s.length})`
}

function soDigitos(v) {
  return String(v ?? '').replace(/\D/g, '')
}

function agrupar(linhas, chaveDe) {
  const mapa = new Map()
  for (const l of linhas) {
    const k = chaveDe(l)
    if (!k) continue
    mapa.set(k, (mapa.get(k) ?? 0) + 1)
  }
  return mapa
}

async function main() {
  const env = lerEnv()
  const base = (env.BUBBLE_APP_URL ?? '').replace(/\/+$/, '')
  const chave = env.BUBBLE_API_KEY || null
  if (!base) throw new Error('BUBBLE_APP_URL é obrigatória no .env.')

  if (!chave) {
    console.warn(
      'AVISO: sem BUBBLE_API_KEY. A extração está funcionando porque a Data API do\n' +
        'Bubble responde sem autenticação — que é o achado §0.1 de\n' +
        'specs/00-achados-de-seguranca.md, não um recurso.\n',
    )
  }

  const secoes = []
  const resumo = []

  // ---------------------------------------------------------------- B1: documentos
  console.log('Baixando endereços (filiais)…')
  const enderecos = await baixarTudo(base, chave, 'tbl.enderecosclifor')
  const comDoc = enderecos.filter((e) => soDigitos(e['cpo.CnpjCpf']).length > 0)
  const porDoc = agrupar(comDoc, (e) => soDigitos(e['cpo.CnpjCpf']))
  const dupDoc = [...porDoc.entries()].filter(([, n]) => n > 1)
  const tamanhoInvalido = comDoc.filter(
    (e) => ![11, 14].includes(soDigitos(e['cpo.CnpjCpf']).length),
  )

  const totalDupDoc = dupDoc.reduce((s, [, n]) => s + n, 0)
  resumo.push(
    `B1 documento: ${dupDoc.length} valor(es) repetido(s), ${totalDupDoc} linha(s) envolvida(s)`,
  )

  secoes.push(
    `## B1 — \`enderecos_clifor.documento\` pode ser único?\n\n` +
      `| | |\n|---|---:|\n` +
      `| Endereços no Bubble | ${enderecos.length} |\n` +
      `| Com documento preenchido | ${comDoc.length} |\n` +
      `| Sem documento | ${enderecos.length - comDoc.length} |\n` +
      `| Documentos distintos | ${porDoc.size} |\n` +
      `| **Documentos repetidos** | **${dupDoc.length}** |\n` +
      `| Linhas envolvidas na repetição | ${totalDupDoc} |\n` +
      `| Documento com tamanho ≠ 11 e ≠ 14 | ${tamanhoInvalido.length} |\n\n` +
      (dupDoc.length === 0
        ? `**Zero conflito.** O índice único em \`documento\` pode entrar na migration da fatia 2.\n`
        : `**Há conflito.** O índice único NÃO pode entrar antes de resolver. Repetidos, mascarados:\n\n` +
          dupDoc
            .slice(0, 30)
            .map(([d, n]) => `- ${mascarar(d)} — ${n} endereços`)
            .join('\n') +
          (dupDoc.length > 30 ? `\n- … e mais ${dupDoc.length - 30}\n` : '\n') +
          `\nCaminhos: (a) decidir que documento **não** é único, porque a mesma filial pode ` +
          `aparecer duas vezes por erro de cadastro; (b) deduplicar antes da carga; ` +
          `(c) índice único parcial, só para os ativos.\n`) +
      (tamanhoInvalido.length > 0
        ? `\nO \`check documento_bate_com_tipo\` de \`02\` §3.2 rejeitaria ${tamanhoInvalido.length} ` +
          `linha(s) por tamanho. Tamanhos encontrados: ` +
          [...new Set(tamanhoInvalido.map((e) => soDigitos(e['cpo.CnpjCpf']).length))]
            .sort((a, b) => a - b)
            .join(', ') +
          `.\n`
        : ''),
  )

  // ---------------------------------------------------------------- B1: produtos
  console.log('Baixando produtos…')
  const produtos = await baixarTudo(base, chave, 'tbl.produtosmodelo')
  const porNome = agrupar(produtos, (p) =>
    `${p['cpo.QualGrupoProduto'] ?? '-'}|${String(p['cpo.NomeModelo'] ?? '')
      .trim()
      .toLowerCase()}`,
  )
  const dupProd = [...porNome.entries()].filter(([, n]) => n > 1)
  resumo.push(`B1 produto: ${dupProd.length} nome(s) repetido(s) dentro do grupo`)

  secoes.push(
    `## B1 — \`produtos (nome, grupo_id)\` pode ser único?\n\n` +
      `| | |\n|---|---:|\n` +
      `| Produtos no Bubble | ${produtos.length} |\n` +
      `| Combinações distintas de (grupo, nome) | ${porNome.size} |\n` +
      `| **Repetidas** | **${dupProd.length}** |\n\n` +
      (dupProd.length === 0
        ? `**Zero conflito.** O índice único pode entrar.\n`
        : `**Há conflito** em ${dupProd.length} combinação(ões). O índice único não pode entrar ` +
          `sem deduplicar ou sem decidir que o nome não é único.\n`),
  )

  // ---------------------------------------------------------------- B6: permissões
  console.log('Baixando ConfigSistema…')
  const config = await baixarTudo(base, chave, 'tbl.configsistema')
  const dePagina = config.filter((c) => c['cpo.QualPagina'])
  const deSubmenu = config.filter((c) => c['cpo.QualMenuConfig'])

  const linhasPerm = [...dePagina, ...deSubmenu].map((c) => ({
    alvo: c['cpo.QualPagina'] ?? c['cpo.QualMenuConfig'],
    tipo: c['cpo.QualPagina'] ? 'página' : 'config',
    deptos: c['cpo.QuaisDeptos'] ?? [],
    perfis: c['cpo.QuaisPerfis'] ?? [],
    usuarios: (c['cpo.QuaisUsuarios'] ?? []).length,
  }))

  resumo.push(`B6: ${linhasPerm.length} linha(s) de permissão encontradas`)

  secoes.push(
    `## B6 — as linhas de permissão do \`ConfigSistema\`\n\n` +
      `${config.length} linhas de configuração no total; ${linhasPerm.length} são de permissão.\n\n` +
      `| Alvo | Tipo | Departamentos | Perfis | Usuários nomeados |\n|---|---|---|---|---:|\n` +
      linhasPerm
        .map(
          (l) =>
            `| \`${l.alvo}\` | ${l.tipo} | ${l.deptos.join(', ') || '—'} | ` +
            `${l.perfis.join(', ') || '—'} | ${l.usuarios} |`,
        )
        .join('\n') +
      `\n\nAtenção ao de-para: a chave \`licita__o\` é o departamento **Comercial** e \`geral\` ` +
      `é **Operação** (\`02\` §3.1). Os usuários nomeados não são listados aqui de propósito.\n`,
  )

  // ---------------------------------------------------------------- relatório
  await mkdir('bruto', { recursive: true })
  const texto =
    `# Relatório de conflitos — modo relatório da carga\n\n` +
    `Gerado por \`node tools/conferir-conflitos.mjs\` em ${new Date().toISOString()}.\n` +
    `Responde B1 e B6 de \`specs/04-duvidas.md\` §1 com dado, não com opinião.\n\n` +
    `Nenhum documento ou nome de cliente aparece aqui: só contagens e amostras mascaradas.\n\n` +
    `---\n\n` +
    secoes.join('\n---\n\n')

  await writeFile('bruto/00-conflitos.md', texto)

  console.log('\n' + resumo.map((r) => `  ${r}`).join('\n'))
  console.log('\nRelatório em bruto/00-conflitos.md (fora do git).')
}

await main()
