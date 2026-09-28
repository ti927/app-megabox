// =====================================================================================
// scripts/aplicar-migration.mjs — aplica um arquivo de db/ no banco, em transação
//
//   node scripts/aplicar-migration.mjs db/006_cadastro.sql
//   node scripts/aplicar-migration.mjs db/006_cadastro.sql --seco   (roda e desfaz)
//
// POR QUE ESTE SCRIPT EXISTE
// A migration é SQL puro (CLAUDE.md), e o jeito de aplicá-la era colar o arquivo inteiro numa
// chamada de ferramenta. Funciona para 4 KB; para as 860 linhas da 006 é desperdício, e o
// arquivo aplicado deixa de ser, byte a byte, o arquivo do repositório — que é o ponto de ter
// migration versionada.
//
// `--seco` aplica e dá ROLLBACK: serve para descobrir erro de sintaxe e de dependência sem
// sujar o banco. Toda migration nova passa por `--seco` antes de valer.
//
// Não registra nada em `supabase_migrations`: quem faz isso é o painel/MCP. Este script é a
// ferramenta de quem está construindo, e o registro entra pelo caminho oficial.
// =====================================================================================

import { readFileSync } from 'node:fs'
import { Client } from 'pg'

const arquivo = process.argv[2]
const seco = process.argv.includes('--seco')

if (!arquivo) {
  console.error('uso: node scripts/aplicar-migration.mjs db/00X_nome.sql [--seco]')
  process.exit(1)
}

// O .env é lido à mão para não arrastar dependência só por isto.
for (const linha of readFileSync('.env', 'utf8').split('\n')) {
  const corte = linha.indexOf('=')
  if (corte < 1 || linha.trimStart().startsWith('#')) continue
  const chave = linha.slice(0, corte).trim()
  if (!process.env[chave]) process.env[chave] = linha.slice(corte + 1).trim()
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL não está no .env. Sem ela não há como aplicar DDL.')
  process.exit(1)
}

const sql = readFileSync(arquivo, 'utf8')
const cliente = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

console.log(`${arquivo} — ${sql.length} bytes${seco ? ' (SECO: vai desfazer no fim)' : ''}`)

try {
  await cliente.connect()
  await cliente.query('begin')
  await cliente.query(sql)

  if (seco) {
    await cliente.query('rollback')
    console.log('OK em modo seco: a migration roda inteira. Desfeita, nada mudou no banco.')
  } else {
    await cliente.query('commit')
    console.log('APLICADA e commitada.')
  }
} catch (erro) {
  await cliente.query('rollback').catch(() => {})
  // A posição do erro é o que economiza tempo: sem ela, "syntax error" em 860 linhas é caça.
  console.error(`\nFALHOU — nada foi aplicado (rollback).\n`)
  console.error(`  ${erro.message}`)
  if (erro.position) {
    const pos = Number(erro.position)
    const linha = sql.slice(0, pos).split('\n').length
    console.error(`  linha ${linha} do arquivo:`)
    console.error(`    ${sql.split('\n')[linha - 1]?.trim()}`)
  }
  if (erro.detail) console.error(`  detalhe: ${erro.detail}`)
  if (erro.hint) console.error(`  dica: ${erro.hint}`)
  process.exitCode = 1
} finally {
  await cliente.end()
}
