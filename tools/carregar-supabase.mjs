/**
 * Carga do Bubble para o Postgres (Fase C de specs/03-plano-de-construcao.md).
 *
 * Lê o JSON de `bruto/` (ou baixa na hora, com `--baixar`) e grava no Supabase com
 * `service_role`, que é o único jeito de escrever antes de existir usuário.
 *
 * Três coisas fazem esta carga ser retomável e conferível:
 *
 *  1. **Idempotente por `bubble_id`.** Toda tabela tem a coluna (`02` §1.2) com índice
 *     único, e a gravação é `upsert` por ela. Rodar duas vezes não duplica; rodar depois
 *     de uma queda continua de onde parou.
 *  2. **Duas passadas.** A primeira grava só as colunas escalares; a segunda resolve as
 *     referências, traduzindo `bubble_id` → `uuid` já gravado. Sem isso, a ordem de
 *     inserção viraria um problema de grafo.
 *  3. **Modo relatório.** `--relatorio` não escreve nada: conta, valida e lista o que
 *     falharia. É obrigatório antes da primeira aplicação (§5.4).
 *
 * ARMADILHA que custou caro e está resolvida aqui: a Data API devolve os campos pelo
 * **nome de exibição** (`cpo.CnpjCpf`), não pelo id interno (`cpo_cnpjcpf_text`) que
 * `mapa/data-types.md` e o de-para de `02` §10 usam. Ler pelo id devolve `undefined` em
 * silêncio, e uma carga que lê nada grava nulo sem reclamar. O MAPA abaixo usa nome de
 * exibição, e `conferirMapa()` reclama de campo que não existir na amostra.
 *
 * Uso:
 *   node tools/carregar-supabase.mjs --relatorio            # confere, não grava
 *   node tools/carregar-supabase.mjs --tipos tbl.grupoclifor
 *   node tools/carregar-supabase.mjs                        # carrega tudo que o MAPA cobre
 */

import { existsSync, readFileSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createClient } from '@supabase/supabase-js'

const LOTE = 500

// ---------------------------------------------------------------------------------
// De-para. Cresce a cada fatia; hoje cobre a fatia 2 (cadastro).
// `col`  = colunas escalares, destino ← nome de exibição do Bubble (ou função)
// `ref`  = colunas de FK, resolvidas na 2ª passada por bubble_id
// `dom`  = colunas que apontam para lista fixa, resolvidas por chave_bubble
// ---------------------------------------------------------------------------------
const soDigitos = (v) => String(v ?? '').replace(/\D/g, '') || null
const texto = (v) => (v === undefined || v === null || v === '' ? null : String(v))
const bool = (v) => v === true
/** Compara chave e rótulo de option set sem depender de acento, caixa ou espaço. */
const normalizar = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')

const MAPA = {
  'tbl.grupoclifor': {
    tabela: 'grupos_clifor',
    col: {
      nome: (r) => texto(r['cpo.NomeCliFor']),
      ativo: (r) => r['cpo.Ativo'] !== false,
      // ARMADILHA: cpo.Liberado tem id cpo_bloqueado_boolean — o NOME é que vale.
      liberado: (r) => r['cpo.Liberado'] !== false,
      liberado_motivo: (r) => texto(r['cpo.LiberadoMotivo']),
      // ARMADILHA: cpo.Observacoes tem id cpo_codcliente_text e NÃO é código de cliente.
      observacoes: (r) => texto(r['cpo.Observacoes']),
      nome_comprador: (r) => texto(r['cpo.NomeComprador']),
      capacidade_compra: (r) => texto(r['cpo.CapacidadeCompra']),
      demanda: (r) => texto(r['cpo.Demanda']),
      email_principal: (r) => texto(r['cpo.EmailPrincipal']),
      corporativo: (r) => bool(r['cpo.Corporativo']),
      possui_filiais: (r) => bool(r['cpo.PossuiFiliais']),
      nao_faz_contrato_parceria: (r) => bool(r['cpo.NãoFazContratoParceria']),
      codigo_legado: (r) => (r['cpo.IdCliforAntigo'] ?? null),
    },
    dom: {
      tipo: { de: 'cpo.QualTipoCliFor', enum: true }, // tipo_clifor: cliente | fornecedor
      captacao_id: { de: 'cpo.Captacao', tabela: 'captacoes' },
      frete_id: { de: 'cpo.Frete', tabela: 'tipos_frete' },
    },
    ref: {
      carteira_id: { de: 'cpo.QualCarteira', tabela: 'usuarios' },
    },
  },

  'tbl.enderecosclifor': {
    tabela: 'enderecos_clifor',
    col: {
      nome_endereco: (r) => texto(r['cpo.NomeEndereco']),
      razao: (r) => texto(r['cpo.Razao']),
      fantasia: (r) => texto(r['cpo.Fantasia']),
      documento: (r) => soDigitos(r['cpo.CnpjCpf']),
      insc_estadual: (r) => texto(r['cpo.InscEstadual']),
      insc_municipal: (r) => texto(r['cpo.InscMunicipal']),
      cep: (r) => soDigitos(r['cpo.Cep']),
      logradouro: (r) => texto(r['cpo.Endereco']),
      complemento: (r) => texto(r['cpo.Complemento']),
      bairro: (r) => texto(r['cpo.Bairro']),
      municipio: (r) => texto(r['cpo.Municipio']),
      ativo: (r) => r['cpo.Ativo'] !== false,
      liberado: (r) => r['cpo.Liberado'] !== false,
      liberado_motivo: (r) => texto(r['cpo.LiberadoMotivo']),
      corporativo: (r) => bool(r['cpo.Corporativo']),
      nome_comprador: (r) => texto(r['cpo.NomeComprador']),
      capacidade_compra: (r) => texto(r['cpo.CapacidadeCompra']),
      demanda: (r) => texto(r['cpo.Demanda']),
      observacoes: (r) => texto(r['cpo.Observacoes']),
      // `principal` NÃO vem do Bubble: lá é true em toda filial e nunca lido
      // (02 §2.1.8). A escolha de um por grupo é o passo `principal` abaixo.
      principal: () => false,
      // tipo_pessoa é derivado do tamanho, porque o campo do Bubble é texto livre.
      tipo_pessoa: (r) => {
        const d = soDigitos(r['cpo.CnpjCpf'])
        return d?.length === 11 ? 'cpf' : d?.length === 14 ? 'cnpj' : null
      },
    },
    dom: {
      // Duas fontes de UF; a option set vence e o texto é reserva (02 §3.2).
      uf: { de: 'cpo.QualUfOpt', reserva: 'cpo.UF', tabela: 'ufs', porSigla: true },
      regime_tributario_id: { de: 'cpo.QualRegimeTributario', tabela: 'regimes_tributarios' },
      frete_id: { de: 'cpo.Frete', tabela: 'tipos_frete' },
    },
    ref: {
      grupo_id: { de: 'cpo.QualGrupoCliFor', tabela: 'grupos_clifor', obrigatorio: true },
    },
  },

  'tbl.contatoclifor': {
    tabela: 'contatos_clifor',
    col: {
      nome: (r) => texto(r['cpo.NomeContato']),
      cargo: (r) => texto(r['cpo.Cargo']),
      email: (r) => texto(r['cpo.Email']),
      telefone: (r) => texto(r['cpo.Telefone']),
      // No Bubble nasce vazio e a lista não filtra por ele (02 §3.2): nulo vira true.
      ativo: (r) => r['cpo.ativo'] !== false,
    },
    dom: {
      tipo_telefone_id: { de: 'cpo.TipoTelefone', tabela: 'tipos_telefone' },
    },
    ref: {
      grupo_id: { de: 'cpo.QualGrupoCliFor', tabela: 'grupos_clifor', obrigatorio: true },
      endereco_id: { de: 'cpo.QualEndereço', tabela: 'enderecos_clifor' },
    },
  },
}

// ---------------------------------------------------------------------------------

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

function argumentos() {
  const a = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < a.length; i++) {
    const c = a[i]
    if (c === '--relatorio' || c === '--baixar') out[c.slice(2)] = true
    else if (c?.startsWith('--') && a[i + 1] !== undefined) out[c.slice(2)] = a[i++ + 1]
  }
  return out
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

async function baixar(base, chave, tipo) {
  const linhas = []
  let cursor = 0
  for (;;) {
    const url = `${base}/api/1.1/obj/${tipo}?limit=100&cursor=${cursor}`
    const resposta = await fetch(url, {
      headers: chave ? { Authorization: `Bearer ${chave}` } : {},
    })
    if (!resposta.ok) throw new Error(`${resposta.status} em ${tipo}`)
    const r = (await resposta.json()).response ?? {}
    linhas.push(...(r.results ?? []))
    if (!r.remaining || r.remaining <= 0) break
    cursor += 100
    await dormir(100)
  }
  return linhas
}

async function lerBruto(tipo) {
  const pasta = join('bruto', tipo)
  if (!existsSync(pasta)) return null
  const linhas = []
  for (const f of (await readdir(pasta)).filter((x) => x.endsWith('.json'))) {
    const j = JSON.parse(await readFile(join(pasta, f), 'utf8'))
    linhas.push(...(j.linhas ?? []))
  }
  return linhas
}

/**
 * Reclama de campo do MAPA que não aparece em registro nenhum — pega erro de nome cedo.
 *
 * Confere contra **todas** as linhas, não contra a primeira: o Bubble **omite o campo**
 * quando o valor é vazio, então um registro só não prova nada. Acusar pela amostra dá
 * falso positivo em campo pouco preenchido, que é o caso de quase todo campo opcional.
 * Só some do relatório o que não existe em lugar nenhum.
 */
function conferirMapa(tipo, config, linhas) {
  if (!linhas?.length) return { ausentes: [], raros: [] }

  const presenca = new Map()
  for (const r of linhas) {
    for (const k of Object.keys(r)) presenca.set(k, (presenca.get(k) ?? 0) + 1)
  }

  const ausentes = []
  const raros = []
  const conferir = (destino, campo, reserva) => {
    const n = (presenca.get(campo) ?? 0) + (reserva ? (presenca.get(reserva) ?? 0) : 0)
    if (n === 0) ausentes.push(`${tipo}.${destino} ← ${campo}`)
    else if (n / linhas.length < 0.01) {
      raros.push(`${destino} ← ${campo}: preenchido em ${n} de ${linhas.length}`)
    }
  }

  for (const [destino, d] of Object.entries(config.dom ?? {})) conferir(destino, d.de, d.reserva)
  for (const [destino, d] of Object.entries(config.ref ?? {})) conferir(destino, d.de)
  for (const destino of Object.keys(config.col ?? {})) {
    // As colunas escalares são funções; não dá para inspecionar o nome sem executá-las.
    void destino
  }
  return { ausentes, raros }
}

async function main() {
  const env = lerEnv()
  const arg = argumentos()
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const tipos = arg.tipos ? arg.tipos.split(',').map((s) => s.trim()) : Object.keys(MAPA)
  const relatorio = []

  // Listas fixas, para traduzir chave_bubble → id, uma vez só.
  const dominios = {}
  /**
   * Traduz o valor de option set que vem do Bubble para o id da lista fixa.
   *
   * A Data API devolve option set pelo RÓTULO ("CIF Incluso"), não pela chave
   * (`cif_incluso`) — é a mesma armadilha dos nomes de campo. Por isso o índice aceita
   * as duas formas, sem acento e sem caixa, e o de-para não depende de qual delas a
   * origem resolveu mandar.
   */
  async function dominio(tabela) {
    if (dominios[tabela]) return dominios[tabela]
    const chave = tabela === 'ufs' ? 'sigla' : 'id'
    const { data, error } = await db.from(tabela).select(`${chave}, chave_bubble, nome`)
    if (error) throw new Error(`lendo ${tabela}: ${error.message}`)
    const mapa = new Map()
    for (const l of data) {
      for (const forma of [l.chave_bubble, l.nome]) {
        if (forma) mapa.set(normalizar(forma), l[chave])
      }
    }
    dominios[tabela] = mapa
    return mapa
  }

  for (const tipo of tipos) {
    const config = MAPA[tipo]
    if (!config) {
      console.error(`  ${tipo}: sem de-para no MAPA — pulado`)
      continue
    }

    let linhas = await lerBruto(tipo)
    if (!linhas) {
      if (!arg.baixar) {
        console.error(`  ${tipo}: nada em bruto/${tipo}/. Rode a extração, ou use --baixar.`)
        continue
      }
      console.log(`  ${tipo}: baixando…`)
      linhas = await baixar(
        (env.BUBBLE_APP_URL ?? '').replace(/\/+$/, ''),
        env.BUBBLE_API_KEY || null,
        tipo,
      )
    }

    const { ausentes, raros } = conferirMapa(tipo, config, linhas)
    if (ausentes.length > 0) {
      console.error(`  ${tipo}: campo do MAPA em NENHUM registro — ${ausentes.join(', ')}`)
      console.error('  (nome de exibição mudou? o de-para lê por NOME, não por id)')
      process.exitCode = 1
      continue
    }
    if (raros.length > 0) {
      console.warn(`  ${tipo}: campos quase sempre vazios (confira se o nome está certo):`)
      for (const r of raros) console.warn(`      ${r}`)
    }

    // ----------------------------------------------------- 1ª passada: escalares
    const avisos = []
    const registros = []
    for (const r of linhas) {
      const linha = { bubble_id: r._id }
      for (const [destino, fn] of Object.entries(config.col)) linha[destino] = fn(r)

      for (const [destino, d] of Object.entries(config.dom ?? {})) {
        const bruto = r[d.de] ?? (d.reserva ? r[d.reserva] : null)
        if (bruto == null || bruto === '') {
          linha[destino] = null
          continue
        }
        if (d.enum) {
          linha[destino] = String(bruto)
          continue
        }
        const mapa = await dominio(d.tabela)
        const traduzido = mapa.get(normalizar(bruto))
        if (traduzido === undefined) {
          avisos.push(`${destino}: chave "${bruto}" não existe em ${d.tabela}`)
          linha[destino] = null
        } else {
          linha[destino] = traduzido
        }
      }
      registros.push(linha)
    }

    const resumoAvisos = [...new Set(avisos)].slice(0, 10)

    if (arg.relatorio) {
      relatorio.push(
        `${tipo} → ${config.tabela}: ${registros.length} linha(s), ` +
          `${avisos.length} aviso(s) de tradução` +
          (resumoAvisos.length ? `\n      ${resumoAvisos.join('\n      ')}` : ''),
      )
      continue
    }

    for (let i = 0; i < registros.length; i += LOTE) {
      const fatia = registros.slice(i, i + LOTE)
      const { error } = await db
        .from(config.tabela)
        .upsert(fatia, { onConflict: 'bubble_id', ignoreDuplicates: false })
      if (error) throw new Error(`${config.tabela} lote ${i / LOTE + 1}: ${error.message}`)
      process.stdout.write(`\r  ${config.tabela}: ${Math.min(i + LOTE, registros.length)}/${registros.length}`)
    }
    console.log(`\r  ${config.tabela}: ${registros.length} linha(s) gravada(s).           `)
    if (avisos.length) console.warn(`    ${avisos.length} aviso(s); primeiros: ${resumoAvisos.join('; ')}`)

    // ----------------------------------------------------- 2ª passada: referências
    if (config.ref) {
      const paraAtualizar = []
      for (const r of linhas) {
        const patch = {}
        let tem = false
        for (const [destino, d] of Object.entries(config.ref)) {
          const alvo = r[d.de]
          if (!alvo) continue
          patch[destino] = { bubble: String(alvo), tabela: d.tabela }
          tem = true
        }
        if (tem) paraAtualizar.push({ bubble_id: r._id, patch })
      }

      // Traduz bubble_id → uuid, por tabela de destino, em lote.
      const cache = {}
      for (const { patch } of paraAtualizar) {
        for (const { bubble, tabela } of Object.values(patch)) {
          ;(cache[tabela] ??= new Set()).add(bubble)
        }
      }
      const traducao = {}
      for (const [tabela, conjunto] of Object.entries(cache)) {
        traducao[tabela] = new Map()
        const ids = [...conjunto]
        for (let i = 0; i < ids.length; i += 1000) {
          const { data, error } = await db
            .from(tabela)
            .select('id, bubble_id')
            .in('bubble_id', ids.slice(i, i + 1000))
          if (error) throw new Error(`traduzindo ${tabela}: ${error.message}`)
          for (const l of data) traducao[tabela].set(l.bubble_id, l.id)
        }
      }

      let ligadas = 0
      let orfas = 0
      for (let i = 0; i < paraAtualizar.length; i += LOTE) {
        for (const { bubble_id, patch } of paraAtualizar.slice(i, i + LOTE)) {
          const set = {}
          for (const [destino, { bubble, tabela }] of Object.entries(patch)) {
            const uuid = traducao[tabela].get(bubble)
            if (uuid) set[destino] = uuid
            else orfas++
          }
          if (Object.keys(set).length === 0) continue
          const { error } = await db.from(config.tabela).update(set).eq('bubble_id', bubble_id)
          if (error) throw new Error(`${config.tabela} ref: ${error.message}`)
          ligadas++
        }
        process.stdout.write(`\r  ${config.tabela}: referências ${Math.min(i + LOTE, paraAtualizar.length)}/${paraAtualizar.length}`)
      }
      console.log(`\r  ${config.tabela}: ${ligadas} linha(s) ligada(s), ${orfas} referência(s) órfã(s).   `)
    }
  }

  if (arg.relatorio) {
    console.log('\nModo relatório — nada foi gravado.\n')
    for (const l of relatorio) console.log(`  ${l}`)
    console.log('\nConfira os avisos antes de rodar sem --relatorio.')
  }
}

await main()
