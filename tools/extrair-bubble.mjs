/**
 * Extração do Bubble (Fase B de specs/03-plano-de-construcao.md).
 *
 * Baixa os data types do app **live** pela Data API e grava JSON em `bruto/`, que está
 * no .gitignore — o conteúdo é dado pessoal de cliente e o repositório é público.
 *
 * Decisões que vêm do plano, e o porquê de cada uma:
 *
 *  - **Um arquivo por tipo e por mês** (`bruto/<tipo>/<aaaa-mm>.json`). São ~200 mil
 *    registros; queda no meio é o caso normal, não a exceção. Com janela mensal, uma
 *    nova execução pula o que já baixou e retoma de onde parou.
 *  - **Paginação por cursor**, `limit=100`, que é o teto do Bubble.
 *  - **`_id` guardado como está**: vira `bubble_id` (02 §1.2), e é o que torna a carga
 *    idempotente e a recarga segura.
 *  - **Relatório de contagem**: o `count` que o Bubble declara × o que foi baixado. É a
 *    prova de nada perdido, e divergência interrompe a Fase C.
 *
 * Este ambiente de desenvolvimento NÃO alcança bubbleapps.io (bloqueio de rede).
 * Rode na máquina do usuário.
 *
 * Uso:
 *   node tools/extrair-bubble.mjs --meta              # só lista os tipos expostos
 *   node tools/extrair-bubble.mjs                     # extrai todos
 *   node tools/extrair-bubble.mjs --tipos Tbl.Cotacao,Tbl.Pedido
 *   node tools/extrair-bubble.mjs --desde 2019-01     # janela inicial (padrão 2018-01)
 *   node tools/extrair-bubble.mjs --refazer           # ignora arquivos já baixados
 *   node tools/extrair-bubble.mjs --relatorio         # só regrava bruto/00-contagem.md
 */

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const SAIDA = 'bruto'
const LIMITE = 100 // teto do Bubble
const PAUSA_MS = 120 // respiro entre chamadas, para não tomar 429

// Não migram (02 §9); não vale gastar chamada com eles.
const IGNORAR = new Set(['Tbl.Chamado', 'Tbl.ContasReceberImportado', 'Tbl.cnpjformatado'])

function lerEnv() {
  const env = {}
  // Sem try/catch de propósito: `.env` ausente é erro de configuração, e engolir isso
  // faria o script culpar a chave quando o problema é outro.
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

function argumentos() {
  const a = process.argv.slice(2)
  const out = { desde: '2018-01' }
  for (let i = 0; i < a.length; i++) {
    const c = a[i]
    if (c === '--meta' || c === '--refazer' || c === '--relatorio') {
      out[c.slice(2)] = true
      continue
    }
    if (c?.startsWith('--') && a[i + 1] !== undefined) {
      out[c.slice(2)] = a[i + 1]
      i++
    }
  }
  return out
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

/** Janelas mensais de `desde` até o mês corrente, mais uma para o que vier depois. */
function janelas(desde) {
  const [a0, m0] = desde.split('-').map(Number)
  const fim = new Date()
  const lista = []
  let ano = a0
  let mes = m0
  while (ano < fim.getUTCFullYear() || (ano === fim.getUTCFullYear() && mes <= fim.getUTCMonth() + 1)) {
    const inicio = new Date(Date.UTC(ano, mes - 1, 1))
    const proximo = new Date(Date.UTC(ano, mes, 1))
    lista.push({
      rotulo: `${ano}-${String(mes).padStart(2, '0')}`,
      de: inicio.toISOString(),
      ate: proximo.toISOString(),
    })
    mes++
    if (mes > 12) {
      mes = 1
      ano++
    }
  }
  return lista
}

async function chamar(url, chave, tentativa = 1) {
  const resposta = await fetch(url, { headers: { Authorization: `Bearer ${chave}` } })

  if (resposta.status === 429 || resposta.status >= 500) {
    if (tentativa > 5) throw new Error(`${resposta.status} depois de 5 tentativas: ${url}`)
    const espera = 500 * 2 ** tentativa
    console.warn(`    ${resposta.status}; tentando de novo em ${espera}ms`)
    await dormir(espera)
    return chamar(url, chave, tentativa + 1)
  }

  if (!resposta.ok) {
    const corpo = await resposta.text()
    throw new Error(`${resposta.status} em ${url}\n${corpo.slice(0, 300)}`)
  }
  return resposta.json()
}

/** Todos os registros de um tipo dentro de uma janela, seguindo o cursor. */
async function baixarJanela(base, chave, tipo, janela) {
  const restricoes = encodeURIComponent(
    JSON.stringify([
      { key: 'Created Date', constraint_type: 'greater than or equal', value: janela.de },
      { key: 'Created Date', constraint_type: 'less than', value: janela.ate },
    ]),
  )

  const linhas = []
  let cursor = 0
  let declarado = null

  for (;;) {
    const url = `${base}/api/1.1/obj/${encodeURIComponent(tipo)}?limit=${LIMITE}&cursor=${cursor}&constraints=${restricoes}`
    const json = await chamar(url, chave)
    const r = json.response ?? {}

    if (declarado === null) declarado = (r.count ?? 0) + (r.remaining ?? 0)
    linhas.push(...(r.results ?? []))

    if (!r.remaining || r.remaining <= 0) break
    cursor += LIMITE
    await dormir(PAUSA_MS)
  }

  return { linhas, declarado: declarado ?? linhas.length }
}

/**
 * Os tipos expostos, como `{ id, nome }`.
 *
 * O `/api/1.1/meta` devolve `get` (lista de ids em minúsculas, ex. `tbl.cotacao`),
 * `types` (dicionário id → { display, fields }) e `post` (os endpoints da Workflow API).
 * A URL de dados usa o **id**; o `display` é o nome legível do mapa (`Tbl.Cotacao`).
 * Confundir os dois faz o script pedir um tipo que não existe.
 */
async function listarTipos(base, chave) {
  const json = await chamar(`${base}/api/1.1/meta`, chave)
  const tipos = json.types ?? {}
  const ids = Array.isArray(json.get) ? json.get : Object.keys(tipos)
  return ids
    .map((id) => ({ id, nome: tipos[id]?.display ?? id }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

async function relatorio() {
  const linhas = [
    '# Contagem da extração — prova de nada perdido',
    '',
    'Gerado por `node tools/extrair-bubble.mjs`. Divergência entre declarado e baixado',
    '**interrompe a Fase C** (specs/03-plano-de-construcao.md §4.4).',
    '',
    '| Tipo | Declarado pelo Bubble | Baixado | Janelas | Confere |',
    '|---|---:|---:|---:|---|',
  ]

  let tipos = []
  try {
    tipos = (await readdir(SAIDA, { withFileTypes: true }))
      .filter((d) => d.isDirectory() && d.name !== 'arquivos')
      .map((d) => d.name)
      .sort()
  } catch {
    console.error(`Nada em ${SAIDA}/. Rode a extração antes.`)
    process.exitCode = 1
    return
  }

  let totalBaixado = 0
  let divergentes = 0

  for (const tipo of tipos) {
    const arquivos = (await readdir(join(SAIDA, tipo))).filter((f) => f.endsWith('.json'))
    let declarado = 0
    let baixado = 0
    for (const f of arquivos) {
      const j = JSON.parse(await readFile(join(SAIDA, tipo, f), 'utf8'))
      declarado += j.declarado ?? 0
      baixado += (j.linhas ?? []).length
    }
    const ok = declarado === baixado
    if (!ok) divergentes++
    totalBaixado += baixado
    linhas.push(
      `| \`${tipo}\` | ${declarado} | ${baixado} | ${arquivos.length} | ${ok ? 'sim' : '**NÃO**'} |`,
    )
  }

  linhas.push('', `**Total baixado: ${totalBaixado} registros em ${tipos.length} tipos.**`)
  if (divergentes > 0) {
    linhas.push('', `> ${divergentes} tipo(s) divergem. NÃO prossiga para a carga.`)
  }

  await writeFile(join(SAIDA, '00-contagem.md'), linhas.join('\n') + '\n')
  console.log(`\nRelatório em ${join(SAIDA, '00-contagem.md')}`)
  console.log(`${totalBaixado} registros, ${divergentes} tipo(s) divergentes.`)
  if (divergentes > 0) process.exitCode = 1
}

async function main() {
  const arg = argumentos()

  if (arg.relatorio) return relatorio()

  const env = lerEnv()
  const base = (env.BUBBLE_APP_URL ?? '').replace(/\/+$/, '')
  const chave = env.BUBBLE_API_KEY

  if (!base || !chave) {
    console.error(
      'BUBBLE_APP_URL e BUBBLE_API_KEY são obrigatórias no .env.\n' +
        'A chave se rotaciona no corte (specs/00-achados-de-seguranca.md §1.5).',
    )
    process.exit(2)
  }

  const expostos = await listarTipos(base, chave)
  console.log(`\n/api/1.1/meta expõe ${expostos.length} tipo(s):`)
  for (const t of expostos) console.log(`  ${t.nome}  (${t.id})`)

  // O mapa decompilado tem 34 tipos; o live expõe 29. Os que faltam são do SAC e das
  // pesquisas, e sem eles a fatia 10 não tem dado (03 §4.2).
  const precisam = [
    'Tbl.SacProtocolo',
    'Tbl.SacHistorico',
    'Tbl.PesquisaNps',
    'Tbl.PesquisaRespostas',
  ].filter((nome) => !expostos.some((t) => t.nome === nome))

  if (precisam.length > 0) {
    console.error(
      `\nFaltam expor em Settings → API → Data API: ${precisam.join(', ')}.\n` +
        'Sem eles o módulo de SAC e pesquisas fica sem dado (03 §4.2).',
    )
    if (!arg.meta) process.exitCode = 1
  }

  if (arg.meta) return

  const pedidos = arg.tipos ? arg.tipos.split(',').map((s) => s.trim().toLowerCase()) : null
  const alvo = expostos.filter(
    (t) =>
      !IGNORAR.has(t.nome) &&
      (!pedidos || pedidos.includes(t.id) || pedidos.includes(t.nome.toLowerCase())),
  )
  const meses = janelas(arg.desde)
  console.log(`\nExtraindo ${alvo.length} tipo(s) em ${meses.length} janela(s) mensais.\n`)

  for (const tipo of alvo) {
    const pasta = join(SAIDA, tipo.id)
    await mkdir(pasta, { recursive: true })
    let doTipo = 0

    for (const janela of meses) {
      const caminho = join(pasta, `${janela.rotulo}.json`)
      if (!arg.refazer && existsSync(caminho)) continue

      try {
        const { linhas, declarado } = await baixarJanela(base, chave, tipo.id, janela)
        if (linhas.length === 0 && declarado === 0) continue

        await writeFile(
          caminho,
          JSON.stringify(
            { tipo: tipo.id, nome: tipo.nome, janela: janela.rotulo, declarado, linhas },
            null,
            1,
          ),
        )
        doTipo += linhas.length
        const alerta = declarado !== linhas.length ? `  ATENÇÃO: declarado ${declarado}` : ''
        console.log(`  ${tipo.nome} ${janela.rotulo}: ${linhas.length}${alerta}`)
      } catch (erro) {
        console.error(`  ${tipo.nome} ${janela.rotulo}: ${erro.message}`)
        console.error('  (a janela não foi gravada; rode de novo para retomar daqui)')
        process.exitCode = 1
      }
      await dormir(PAUSA_MS)
    }

    console.log(`${tipo.nome}: ${doTipo} registro(s).`)
  }

  await relatorio()
}

await main()
