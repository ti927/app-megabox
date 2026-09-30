/**
 * Carga do HISTÓRICO e do SAC/NPS: Bubble (Data API) → Supabase `megabox`.
 *
 *   tbl.historico          → historicos                    (db/012)
 *   tbl.sacprotocolo       → sac_protocolos + sac_protocolo_entregas (db/013)
 *   tbl.sachistorico       → sac_interacoes                (db/013)
 *   tbl.pesquisanps        → pesquisas                     (db/013)
 *   tbl.pesquisarespostas  → pesquisa_convites + pesquisa_respostas (db/013)
 *   ligar-cr               → historicos.conta_receber_id, a partir de Tbl.ContasReceber.QuaisHistoricos
 *
 * Irmão de `tools/carregar-supabase.mjs` (que não exporta nada e está sendo editado por outra
 * frente): o mínimo foi COPIADO de lá — leitura do `.env`, download paginado com retentativa,
 * tradução de option set por chave OU rótulo, tradução de FK por bubble_id em lotes de 200.
 *
 * COMO O AUTOR E A DATA DO BUBBLE SÃO PRESERVADOS (historicos)
 *   `fn_historico_regras` (D6 da 012) só carimba criado_em/criado_por quando há `auth.uid()`;
 *   esta carga fala com o Postgres direto (`pg` + DATABASE_URL, sem JWT), então o carimbo já não
 *   dispararia. Mesmo assim o insert roda com `set local session_replication_role = replica`
 *   (o mesmo recurso do passo do substituto em carregar-supabase.mjs), por três motivos:
 *     1. o trigger de ESPELHO por instrução (D4) não roda a cada lote — a instância é Micro e
 *        caiu por carga; o espelho é recalculado UMA vez no fim (`fn_historico_espelho_recalcular`);
 *     2. `ligar-cr` preenche `conta_receber_id` em linha JÁ gravada (as contas a receber chegam
 *        depois). O trigger `fn_historico_imutavel` recusaria até para o dono; em réplica o
 *        passo só troca NULL → uuid, nunca outro campo, nunca o texto;
 *     3. nada de auditoria/alterado_em disparando por linha.
 *   Como em réplica o `fn_historico_regras` também não roda, o que ele garantiria é refeito AQUI,
 *   antes do insert: departamento vem do autor quando o Bubble não diz (DÚVIDA 16), unidade tem
 *   de ser do mesmo cliente (senão fica nula e conta como aviso). CHECKs e FKs continuam valendo
 *   (não são triggers).
 *   Autor = `Created By` do Bubble (NÃO QualVendedor, que a edição sobrescrevia — comentário de
 *   historicos.autor_id). criado_em = `Created Date`. criado_por = autor.
 *
 * IDEMPOTÊNCIA: todo insert é `on conflict (bubble_id) do nothing`; pular o que já existe é
 * decidido lendo o banco. A carga para no meio e continua de onde parou na próxima rodada.
 *
 * BANCO PEQUENO: uma conexão só (pg), lotes de no máximo 200, pausa entre lotes (`--pausa`,
 * padrão 30 s, só nos lotes de historicos), e em timeout/queda UMA espera de 2 min e UMA nova
 * tentativa — falhou de novo, PARA e diz onde parou.
 *
 * Uso (na raiz do projeto):
 *   node tools/carregar-historico-sac.mjs --relatorio --baixar            # baixa, confere, não grava
 *   node tools/carregar-historico-sac.mjs --relatorio --tipos tbl.historico
 *   node tools/carregar-historico-sac.mjs --tipos tbl.pesquisanps,tbl.pesquisarespostas
 *   node tools/carregar-historico-sac.mjs --tipos tbl.historico --pausa 45
 *   node tools/carregar-historico-sac.mjs --tipos ligar-cr               # depois das contas a receber
 *   node tools/carregar-historico-sac.mjs --conferir                     # contagens Bubble × banco
 *
 * `--baixar` baixa da Data API e grava em `bruto/<tipo>/tudo.json` (fora do git). Sem ele, lê de
 * `bruto/`. Nenhum texto, nome ou e-mail é impresso — só contagens e rótulos de listas fixas.
 */
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import pg from 'pg'

const LOTE_MAX = 200
const ORDEM = ['tbl.pesquisanps', 'tbl.pesquisarespostas', 'tbl.sacprotocolo', 'tbl.sachistorico', 'tbl.historico', 'ligar-cr']

// ------------------------------------------------------------------ utilidades (copiadas)
const texto = (v) => (v === undefined || v === null || v === '' ? null : String(v))
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const normalizar = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

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
    if (['--relatorio', '--baixar', '--conferir'].includes(c)) out[c.slice(2)] = true
    else if (c?.startsWith('--') && a[i + 1] !== undefined) out[c.slice(2)] = a[i++ + 1]
  }
  return out
}

/** Download paginado com retentativa por página (cópia do carregar-supabase.mjs, + ordenação). */
async function baixar(base, chave, tipo) {
  const vistos = new Map()
  let cursor = 0
  for (;;) {
    // Ordenado por Created Date: registro criado DURANTE o download cai no fim, não desloca página.
    const url = `${base}/api/1.1/obj/${tipo}?limit=100&cursor=${cursor}&sort_field=Created%20Date`
    let r
    for (let tentativa = 1; ; tentativa++) {
      try {
        const resposta = await fetch(url, { headers: chave ? { Authorization: `Bearer ${chave}` } : {} })
        if (resposta.ok) {
          r = (await resposta.json()).response ?? {}
          break
        }
        const definitivo = resposta.status < 500 && resposta.status !== 429
        if (definitivo || tentativa >= 5) throw new Error(`${resposta.status} em ${tipo}`)
      } catch (erro) {
        if (tentativa >= 5 || /^\d{3} em /.test(erro.message)) throw erro
      }
      await dormir(1000 * 2 ** (tentativa - 1))
    }
    for (const l of r.results ?? []) vistos.set(l._id, l)
    if (cursor % 5000 === 0) process.stdout.write(`\r  ${tipo}: ${vistos.size} baixados…`)
    if (!r.remaining || r.remaining <= 0) break
    cursor += 100
    await dormir(100)
  }
  process.stdout.write(`\r  ${tipo}: ${vistos.size} baixados.        \n`)
  return [...vistos.values()]
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

/** Presença de cada campo em TODAS as linhas (o Bubble omite campo vazio: amostra não prova nada). */
function presenca(linhas) {
  const p = new Map()
  for (const r of linhas) for (const k of Object.keys(r)) p.set(k, (p.get(k) ?? 0) + 1)
  return p
}

// ------------------------------------------------------------------ banco (uma conexão)
const SOBRECARGA = /57014|statement timeout|ECONNRESET|ETIMEDOUT|Connection terminated|timeout|socket hang up|too many connections|53300|57P01/i

class Parada extends Error {}

function criarBanco(env) {
  let cli = null
  async function abrir() {
    if (cli) return cli
    if (!env.DATABASE_URL) throw new Error('DATABASE_URL não está no .env')
    cli = new pg.Client({ connectionString: env.DATABASE_URL.trim(), ssl: { rejectUnauthorized: false } })
    cli.on('error', () => {}) // a queda aparece na próxima query; não derruba o processo
    await cli.connect()
    return cli
  }
  async function fechar() {
    const c = cli
    cli = null
    await c?.end().catch(() => {})
  }
  /** Uma consulta. `replica` roda numa transação com session_replication_role = replica LOCAL. */
  async function bruta(textoSql, params, replica) {
    const c = await abrir()
    if (!replica) return c.query(textoSql, params)
    try {
      await c.query('begin')
      await c.query('set local session_replication_role = replica')
      const r = await c.query(textoSql, params)
      await c.query('commit')
      return r
    } catch (erro) {
      await c.query('rollback').catch(() => {})
      throw erro
    }
  }
  /** Com UMA espera de 2 min em sobrecarga; falhou de novo → Parada (a carga é retomável). */
  async function sql(textoSql, params = [], { replica = false, rotulo = 'consulta' } = {}) {
    try {
      return await bruta(textoSql, params, replica)
    } catch (erro) {
      if (!SOBRECARGA.test(`${erro.code ?? ''} ${erro.message ?? ''}`)) throw erro
      console.warn(`\n  ${rotulo}: sobrecarga/queda (${erro.code ?? erro.message}). Esperando 2 min, UMA nova tentativa…`)
      await fechar()
      await dormir(120_000)
      try {
        return await bruta(textoSql, params, replica)
      } catch (erro2) {
        await fechar()
        throw new Parada(`${rotulo}: falhou de novo depois da espera (${erro2.code ?? ''} ${erro2.message}). PARANDO.`)
      }
    }
  }
  return { sql, fechar }
}

// ------------------------------------------------------------------ main
async function main() {
  const env = lerEnv()
  const arg = argumentos()
  const relatorio = !!arg.relatorio
  const pausa = Math.max(0, Number(arg.pausa ?? 30)) * 1000
  const lote = Math.min(LOTE_MAX, Math.max(1, Number(arg.lote ?? LOTE_MAX)))
  const tipos = arg.tipos ? arg.tipos.split(',').map((s) => s.trim()) : ORDEM
  for (const t of tipos) if (!ORDEM.includes(t)) throw new Error(`tipo desconhecido: ${t} (use ${ORDEM.join(', ')})`)
  const db = criarBanco(env)
  const { sql } = db

  // ---- dados crus
  const cache = {}
  async function bruto(tipo) {
    if (cache[tipo]) return cache[tipo]
    let linhas = null
    if (arg.baixar) {
      console.log(`  ${tipo}: baixando da Data API…`)
      linhas = await baixar((env.BUBBLE_APP_URL ?? '').replace(/\/+$/, ''), env.BUBBLE_API_KEY || null, tipo)
      await mkdir(join('bruto', tipo), { recursive: true })
      await writeFile(join('bruto', tipo, 'tudo.json'), JSON.stringify({ tipo, baixado_em: new Date().toISOString(), linhas }))
    } else {
      linhas = await lerBruto(tipo)
    }
    if (!linhas) throw new Error(`${tipo}: nada em bruto/${tipo}/ — rode com --baixar`)
    cache[tipo] = linhas
    return linhas
  }

  // ---- traduções
  const dominios = {}
  /** Option set → id; aceita chave_bubble, rótulo e id (a Data API manda o RÓTULO). */
  async function dominio(tabela) {
    if (dominios[tabela]) return dominios[tabela]
    const { rows } = await sql(`select id, chave_bubble, nome from public.${tabela}`)
    const mapa = new Map()
    for (const l of rows) if (l.chave_bubble) mapa.set(normalizar(l.chave_bubble), l.id)
    for (const l of rows) mapa.set(normalizar(l.nome), l.id)
    dominios[tabela] = mapa
    return mapa
  }
  /** bubble_id → uuid, em lotes de 200 (lê o banco; a ordem das rodadas não importa). */
  async function traduzir(tabela, conjunto, colunas = 'id, bubble_id') {
    const mapa = new Map()
    const ids = [...conjunto].filter(Boolean).map(String)
    for (let i = 0; i < ids.length; i += 200) {
      const { rows } = await sql(`select ${colunas} from public.${tabela} where bubble_id = any($1::text[])`, [
        ids.slice(i, i + 200),
      ])
      for (const l of rows) mapa.set(l.bubble_id, colunas === 'id, bubble_id' ? l.id : l)
    }
    return mapa
  }
  async function jaGravados(tabela) {
    const { rows } = await sql(`select bubble_id from public.${tabela} where bubble_id is not null`)
    return new Set(rows.map((r) => r.bubble_id))
  }

  /** Placar de uma tabela: grava, já existia, descarta por motivo, avisos por coluna. */
  const placares = []
  function placar(tabela, total) {
    const p = { tabela, total, grava: 0, existia: 0, descarta: {}, aviso: {} }
    placares.push(p)
    return {
      p,
      descartar: (motivo) => (p.descarta[motivo] = (p.descarta[motivo] ?? 0) + 1),
      avisar: (motivo) => (p.aviso[motivo] = (p.aviso[motivo] ?? 0) + 1),
    }
  }

  /** Insere em lotes com `on conflict (bubble_id) do nothing`; devolve quantas entraram. */
  async function inserir(tabela, colunas, linhas, { replica = false, pausaEntre = 0, conflito = '(bubble_id)' } = {}) {
    let entraram = 0
    const n = Math.ceil(linhas.length / lote)
    for (let i = 0; i < linhas.length; i += lote) {
      const fatia = linhas.slice(i, i + lote)
      const k = i / lote + 1
      const r = await sql(
        `insert into public.${tabela} (${colunas.join(', ')})
         select ${colunas.join(', ')} from json_populate_recordset(null::public.${tabela}, $1::json)
         on conflict ${conflito} do nothing`,
        [JSON.stringify(fatia)],
        { replica, rotulo: `${tabela} lote ${k}/${n} (a partir de bubble_id na posição ${i})` },
      )
      entraram += r.rowCount
      process.stdout.write(`\r  ${tabela}: lote ${k}/${n}, ${entraram} inserida(s)   `)
      if (pausaEntre && i + lote < linhas.length) await dormir(pausaEntre)
    }
    if (linhas.length) process.stdout.write('\n')
    return entraram
  }

  const usuarios = async (conjunto) => traduzir('usuarios', conjunto, 'id, bubble_id, departamento_id')

  // =============================================================== tbl.pesquisanps
  async function pesquisasNps() {
    const linhas = await bruto('tbl.pesquisanps')
    const resp = await bruto('tbl.pesquisarespostas')
    const tipos = await dominio('tipos_pesquisa')
    const { p, descartar, avisar } = placar('pesquisas', linhas.length)
    // Tbl.PesquisaNps não tem tipo: é criada na aba NPS do SAC (bUDPr). Vale o TipoResposta
    // mais comum das respostas dela; sem resposta, NPS.
    const tipoPorPesquisa = new Map()
    for (const r of resp) {
      if (!r['cpo.QualPesquisa'] || !r['cpo.TipoResposta']) continue
      const m = tipoPorPesquisa.get(r['cpo.QualPesquisa']) ?? new Map()
      const t = tipos.get(normalizar(r['cpo.TipoResposta']))
      if (t === 3) continue // pós-venda em convite de NPS (DÚVIDA 4) não define a campanha
      m.set(t, (m.get(t) ?? 0) + 1)
      tipoPorPesquisa.set(r['cpo.QualPesquisa'], m)
    }
    const criador = await usuarios(new Set(linhas.map((r) => r['Created By'])))
    const existentes = await jaGravados('pesquisas')
    const gravar = []
    for (const r of linhas) {
      const nome = texto(r['cpo.NomePesquisa'])?.trim()
      if (!nome) {
        descartar('nome vazio')
        continue
      }
      const cont = tipoPorPesquisa.get(r._id)
      const tipo_id = cont ? [...cont.entries()].sort((a, b) => b[1] - a[1])[0][0] ?? 2 : 2
      if (!cont) avisar('tipo_id: pesquisa sem resposta — assumido NPS (criada na aba NPS, bUDPr)')
      const u = criador.get(r['Created By'])
      if (r['Created By'] && !u) avisar('criado_por: Created By sem usuário correspondente (fica nulo)')
      if (existentes.has(r._id)) {
        p.existia++
        continue
      }
      gravar.push({
        bubble_id: r._id,
        nome,
        tipo_id,
        ativa: true,
        criado_em: r['Created Date'],
        criado_por: u?.id ?? null,
        alterado_em: r['Modified Date'] ?? null,
      })
    }
    p.grava = gravar.length
    if (!relatorio) p.grava = await inserir('pesquisas', Object.keys(gravar[0] ?? { bubble_id: 1 }), gravar)
  }

  // =============================================================== tbl.pesquisarespostas
  async function pesquisaRespostas() {
    const linhas = await bruto('tbl.pesquisarespostas')
    const tipos = await dominio('tipos_pesquisa')
    const pc = placar('pesquisa_convites', linhas.length)
    const pr = placar('pesquisa_respostas', linhas.filter((r) => r['cpo.Respondida'] === true).length)

    const pesquisas = await traduzir('pesquisas', new Set(linhas.map((r) => r['cpo.QualPesquisa'])))
    const grupos = await traduzir(
      'grupos_clifor',
      new Set(linhas.flatMap((r) => [r['cpo.QualCliente'], r['cpo.QualFornecedor']])),
    )
    const pedidos = await traduzir('pedidos', new Set(linhas.map((r) => r['cpo.QualPedido'])))
    const vend = await usuarios(new Set(linhas.map((r) => r['cpo.QualVendedor'])))
    const criador = await usuarios(new Set(linhas.map((r) => r['Created By'])))

    // Campanha permanente de Pós-Venda (013 "O QUE NÃO ENTRA": criada pela server action OU pela
    // carga). A resposta pós-venda do Bubble não tem campanha (formularios-publicos §3.2).
    // Acha-ou-cria por tipo 3; sem bubble_id (não há registro do Bubble por trás).
    const precisaPosVenda = linhas.some((r) => tipos.get(normalizar(r['cpo.TipoResposta'])) === 3)
    let posVenda = null
    if (precisaPosVenda) {
      const { rows } = await sql(`select id from public.pesquisas where tipo_id = 3 order by criado_em, id limit 1`)
      posVenda = rows[0]?.id ?? null
      if (!posVenda && !relatorio) {
        const { rows: novo } = await sql(
          `insert into public.pesquisas (nome, tipo_id, ativa) values ('Pós-Venda', 3, true) returning id`,
        )
        posVenda = novo[0].id
        console.log('  pesquisas: criada a campanha permanente "Pós-Venda" (tipo 3) para as respostas sem campanha')
      }
      if (!posVenda) posVenda = '(prevista)'
    }

    const convitesExist = await jaGravados('pesquisa_convites')
    const respostasExist = await jaGravados('pesquisa_respostas')
    const convites = []
    const respostas = []
    const agora = Date.now()
    const nota = (v, rot, av) => {
      const n = num(v)
      if (n === null) return null
      if (!Number.isInteger(n) || n < 0 || n > 10) {
        av(`${rot}: fora de 0..10 inteiro — fica nula`)
        return null
      }
      return n
    }
    for (const r of linhas) {
      const tipo = tipos.get(normalizar(r['cpo.TipoResposta'])) ?? null
      if (r['cpo.TipoResposta'] && tipo === null) pc.avisar(`TipoResposta com rótulo desconhecido`)
      let pesquisa_id = null
      if (tipo === 3) {
        // Resposta pós-venda vai para a campanha pós-venda. Se ela está num convite de NPS
        // (QualPesquisa preenchido), é o bUEHr0 que CONVERTEU o convite de NPS (formularios-
        // publicos [DÚVIDA 4]): a resposta é pós-venda (notas de atendimento/produto), o convite
        // de NPS original já tinha sido perdido no Bubble.
        pesquisa_id = posVenda
        if (r['cpo.QualPesquisa']) pc.avisar('pós-venda respondida em convite de NPS (DÚVIDA 4): vai para a campanha Pós-Venda')
      } else if (r['cpo.QualPesquisa']) {
        pesquisa_id = pesquisas.get(r['cpo.QualPesquisa'])
        if (!pesquisa_id) {
          pc.descartar('pesquisa_id: QualPesquisa sem linha em pesquisas')
          continue
        }
      } else {
        // Sem campanha, sem tipo, sem resposta, sem nota: nada a representar além de "cliente
        // X", e pesquisa_id é not null. (Candidatos: formulariovenda aberto sem id — DÚVIDA 3.)
        pc.descartar(`pesquisa_id: sem QualPesquisa, sem TipoResposta e sem resposta (registro vazio)`)
        continue
      }
      const cli = r['cpo.QualCliente'] ? grupos.get(r['cpo.QualCliente']) : null
      const forn = r['cpo.QualFornecedor'] ? grupos.get(r['cpo.QualFornecedor']) : null
      if (r['cpo.QualCliente'] && !cli) pc.avisar('cliente_id: QualCliente sem linha em grupos_clifor')
      const pedido_id = r['cpo.QualPedido'] ? (pedidos.get(r['cpo.QualPedido']) ?? null) : null
      if (r['cpo.QualPedido'] && !pedido_id) pc.avisar('pedido_id: QualPedido sem linha em pedidos (fica nulo)')
      const cliente_id = cli ?? forn ?? null
      if (!cli && forn) pc.avisar('cliente_id: sem QualCliente, usado QualFornecedor')
      if (!cliente_id && !pedido_id) {
        pc.descartar('cliente_id: sem cliente (nem fornecedor, nem pedido) — not null')
        continue
      }
      const vendTxt = texto(r['cpo.QualVendedor'])
      const vendedor_id = vendTxt ? (vend.get(vendTxt)?.id ?? null) : null
      if (vendTxt && !vendedor_id) pc.avisar('vendedor_id: QualVendedor (texto) não casa com usuário (fica nulo; DÚVIDA 1)')
      const respondida = r['cpo.Respondida'] === true
      const temNota = ['cpo.NotaNps', 'cpo.NotaAtendimento', 'cpo.NotaProduto'].some((c) => num(r[c]) !== null)
      if (!respondida && temNota) pc.avisar('Respondida vazia mas com nota: vira convite sem resposta (spec §9.4: só Respondida = true)')
      if (num(r['cpo.NotaEntrega']) !== null) pc.avisar('NotaEntrega preenchida: não migrada (D6 da 013)')
      const criado = r['Created Date']
      const modificado = r['Modified Date'] ?? criado
      // Link antigo não reabre: prazo = criação + 30 dias, e nunca depois de agora.
      const expira = new Date(Math.min(new Date(criado).getTime() + 30 * 86400_000, agora)).toISOString()
      const u = criador.get(r['Created By'])

      if (convitesExist.has(r._id)) pc.p.existia++
      else
        convites.push({
          bubble_id: r._id,
          pesquisa_id,
          cliente_id: cliente_id ?? null,
          pedido_id,
          vendedor_id,
          expira_em: expira,
          usado_em: respondida ? modificado : null,
          envios: 0,
          tentativas: 0,
          criado_em: criado,
          criado_por: u?.id ?? null,
          alterado_em: r['Modified Date'] ?? null,
        })

      if (!respondida) continue
      let comentario = texto(r['cpo.CriticasSugestoes'])?.trim() || null
      if (comentario && comentario.length > 2000) {
        pr.avisar('criticas_sugestoes: mais de 2.000 caracteres — cortado em 2.000')
        comentario = comentario.slice(0, 2000)
      }
      if (!temNota) pr.avisar('respondida sem nenhuma nota (entra assim)')
      if (respostasExist.has(r._id)) {
        pr.p.existia++
        continue
      }
      respostas.push({
        bubble_id: r._id,
        __convite: r._id,
        nota_nps: nota(r['cpo.NotaNps'], 'nota_nps', pr.avisar),
        nota_atendimento: nota(r['cpo.NotaAtendimento'], 'nota_atendimento', pr.avisar),
        nota_produto: nota(r['cpo.NotaProduto'], 'nota_produto', pr.avisar),
        criticas_sugestoes: comentario,
        respondida_em: modificado,
        criado_em: modificado,
      })
    }
    pc.p.grava = convites.length
    pr.p.grava = respostas.length
    if (relatorio) return
    if (convites.some((c) => c.pesquisa_id === '(prevista)')) throw new Error('campanha pós-venda não criada')
    // Convite passa pelo trigger de derivados (cliente/vendedor do pedido): sem réplica.
    pc.p.grava = await inserir('pesquisa_convites', Object.keys(convites[0] ?? { bubble_id: 1 }), convites)
    const conv = await traduzir('pesquisa_convites', new Set(respostas.map((x) => x.__convite)))
    const prontas = []
    for (const x of respostas) {
      const convite_id = conv.get(x.__convite)
      if (!convite_id) {
        pr.descartar('convite_id: convite não gravado')
        continue
      }
      const { __convite, ...resto } = x
      void __convite
      prontas.push({ ...resto, convite_id })
    }
    pr.p.grava = await inserir('pesquisa_respostas', Object.keys(prontas[0] ?? { bubble_id: 1 }), prontas)
  }

  // =============================================================== tbl.sacprotocolo
  async function sacProtocolos() {
    const linhas = await bruto('tbl.sacprotocolo')
    const { p, descartar, avisar } = placar('sac_protocolos', linhas.length)
    // Em sequência: uma conexão só, uma consulta por vez.
    const tiposOc = await dominio('sac_tipos_ocorrencia')
    const prios = await dominio('sac_prioridades')
    const status = await dominio('sac_status')
    const grupos = await traduzir('grupos_clifor', new Set(linhas.map((r) => r['cpo.QualGrupoClifor'])))
    const filiais = await traduzir('enderecos_clifor', new Set(linhas.map((r) => r['cpo.QualFilial'])), 'id, bubble_id, grupo_id')
    const pedidos = await traduzir('pedidos', new Set(linhas.map((r) => r['cpo.QualPedido'])))
    const pessoas = await usuarios(new Set(linhas.flatMap((r) => [r['cpo.QualResponsável'], r['Created By']])))
    const existentes = await jaGravados('sac_protocolos')
    const gravar = []
    let anexos = 0
    const dom = (mapa, v, rot) => {
      if (v == null || v === '') return null
      const id = mapa.get(normalizar(v))
      if (id === undefined) avisar(`${rot}: rótulo desconhecido`)
      return id ?? null
    }
    for (const r of linhas) {
      anexos += (r['cpo.Anexos'] ?? []).length
      const grupo = grupos.get(r['cpo.QualGrupoClifor'])
      if (!grupo) {
        descartar('grupo_clifor_id: sem cliente ou cliente não carregado')
        continue
      }
      const descricao = texto(r['cpo.Descricao'])?.trim()
      if (!descricao) {
        descartar('descricao vazia')
        continue
      }
      const tipo = dom(tiposOc, r['cpo.QualTipoOcorrencia'], 'tipo_ocorrencia_id')
      const prio = dom(prios, r['Cpo.QualPrioridade'], 'prioridade_id')
      if (tipo === null) {
        descartar('tipo_ocorrencia_id vazio')
        continue
      }
      if (prio === null) {
        descartar('prioridade_id vazio')
        continue
      }
      const st = dom(status, r['cpo.QualStatusChamado'], 'status_id') ?? 1
      const f = r['cpo.QualFilial'] ? filiais.get(r['cpo.QualFilial']) : null
      if (r['cpo.QualFilial'] && (!f || f.grupo_id !== grupo)) avisar('filial_id: filial ausente ou de outro cliente (fica nula)')
      const resp = r['cpo.QualResponsável'] ? pessoas.get(r['cpo.QualResponsável']) : null
      if (r['cpo.QualResponsável'] && !resp) avisar('responsavel_id: usuário não carregado (fica nulo)')
      const pedido_id = r['cpo.QualPedido'] ? (pedidos.get(r['cpo.QualPedido']) ?? null) : null
      if (r['cpo.QualPedido'] && !pedido_id) avisar('pedido_id: pedido não carregado (fica nulo)')
      const numero = num(r['cpo.NumeroProtocoloNum'])
      if (numero === null) avisar('numero: vazio no Bubble — ganha número da sequence')
      const excluido = r['cpo.Ativo'] === false
      if (st === 4 && !r['cpo.DataFechado']) avisar('fechado_em: resolvido sem DataFechado — usa Modified Date')
      if (existentes.has(r._id)) {
        p.existia++
        continue
      }
      const linha = {
        bubble_id: r._id,
        grupo_clifor_id: grupo,
        filial_id: f && f.grupo_id === grupo ? f.id : null,
        pedido_id,
        responsavel_id: resp?.id ?? null,
        tipo_ocorrencia_id: tipo,
        prioridade_id: prio,
        status_id: st,
        descricao,
        aberto_em: r['cpo.DataAberto'] ?? r['Created Date'],
        // O trigger (D3) zera fora de "Resolvido" e, em Resolvido, mantém o valor dado.
        fechado_em: st === 4 ? (r['cpo.DataFechado'] ?? r['Modified Date']) : null,
        excluido_em: excluido ? r['Modified Date'] : null,
        excluido_motivo: excluido ? '(excluído no Bubble)' : null,
        criado_em: r['Created Date'],
        criado_por: pessoas.get(r['Created By'])?.id ?? null,
      }
      if (numero !== null) linha.numero = numero
      gravar.push(linha)
    }
    if (anexos) avisar(`anexos: ${anexos} arquivo(s) NÃO carregado(s) (URL do CDN → passo de arquivos)`)
    p.grava = gravar.length
    if (relatorio) return
    // numero é identity "by default": vai explícito; os sem número entram noutro insert.
    const comNum = gravar.filter((l) => 'numero' in l)
    const semNum = gravar.filter((l) => !('numero' in l))
    p.grava = 0
    if (comNum.length) p.grava += await inserir('sac_protocolos', Object.keys(comNum[0]), comNum)
    await sql(
      `select setval(pg_get_serial_sequence('public.sac_protocolos','numero'),
                     greatest((select max(numero) from public.sac_protocolos), 1))`,
    )
    if (semNum.length) p.grava += await inserir('sac_protocolos', Object.keys(semNum[0]), semNum)

    // Ligação QuaisEntregas → sac_protocolo_entregas (pk composta = idempotência)
    const le = placar('sac_protocolo_entregas', linhas.reduce((n, r) => n + (r['cpo.QuaisEntregas'] ?? []).length, 0))
    const prots = await traduzir('sac_protocolos', new Set(linhas.map((r) => r._id)))
    const ents = await traduzir('entregas', new Set(linhas.flatMap((r) => r['cpo.QuaisEntregas'] ?? [])))
    const pares = []
    for (const r of linhas)
      for (const e of r['cpo.QuaisEntregas'] ?? []) {
        const pid = prots.get(r._id)
        const eid = ents.get(String(e))
        if (!pid) le.descartar('protocolo não gravado')
        else if (!eid) le.descartar('entrega não carregada')
        else pares.push({ protocolo_id: pid, entrega_id: eid })
      }
    le.p.grava = await inserir('sac_protocolo_entregas', ['protocolo_id', 'entrega_id'], pares, {
      conflito: '(protocolo_id, entrega_id)',
    })
  }

  // =============================================================== tbl.sachistorico
  async function sacInteracoes() {
    const linhas = await bruto('tbl.sachistorico')
    const { p, descartar, avisar } = placar('sac_interacoes', linhas.length)
    const prots = await traduzir('sac_protocolos', new Set(linhas.map((r) => r['cpo.QualProtocolo'])))
    const pessoas = await usuarios(new Set(linhas.map((r) => r['Created By'])))
    const existentes = await jaGravados('sac_interacoes')
    const gravar = []
    for (const r of linhas) {
      const protocolo_id = prots.get(r['cpo.QualProtocolo'])
      if (!protocolo_id) {
        descartar('protocolo_id: chamado ausente ou não gravado')
        continue
      }
      const descricao = texto(r['cpo.DescricaoHistorico'])?.trim()
      if (!descricao) {
        descartar('descricao vazia')
        continue
      }
      const autor = pessoas.get(r['Created By'])
      if (!autor) {
        descartar('autor_id: Created By sem usuário correspondente — not null')
        continue
      }
      if (r['cpo.VisivelCliente'] === true) avisar('visivel_cliente = true sem contato (o Bubble não guarda contato)')
      if (existentes.has(r._id)) {
        p.existia++
        continue
      }
      gravar.push({
        bubble_id: r._id,
        protocolo_id,
        descricao,
        visivel_cliente: r['cpo.VisivelCliente'] === true,
        autor_id: autor.id,
        criado_em: r['Created Date'],
        criado_por: autor.id,
      })
    }
    p.grava = gravar.length
    if (!relatorio) p.grava = await inserir('sac_interacoes', Object.keys(gravar[0] ?? { bubble_id: 1 }), gravar)
  }

  // =============================================================== tbl.historico
  /**
   * tipo_evento não existe no Bubble (historico.md §3.3: "nenhum tipo de evento"). Os textos
   * AUTOMÁTICOS têm forma fixa (bTpUl, bTrNz, bTjCC, bTjBw, bUEoF, bUCVe) e são reconhecidos
   * pelo começo; o resto é 'conversa'. O e-mail de prospecção (bUEjC0) grava o corpo digitado
   * e não é reconhecível: fica 'conversa'.
   */
  function tipoEvento(descricao) {
    const d = String(descricao)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trimStart()
    if (/^enviado email de cobranca numero /.test(d)) return 'cobranca'
    if (/^enviado email de recibo numero /.test(d)) return 'recibo'
    if (/^proposta numero .* enviada ao cliente/.test(d)) return 'proposta'
    if (/^pedido numero .* enviado ao cliente/.test(d)) return 'pedido'
    if (/^email enviado:/.test(d)) return 'email'
    if (/^cliente criado\/endereco adicionado/.test(d)) return 'cadastro'
    return 'conversa'
  }

  async function historicos() {
    const linhas = await bruto('tbl.historico')
    const { p, descartar, avisar } = placar('historicos', linhas.length)
    const deps = await dominio('departamentos')
    console.log(`  historicos: traduzindo ponteiros de ${linhas.length} linha(s)…`)
    const grupos = await traduzir('grupos_clifor', new Set(linhas.map((r) => r['cpo.QualClifor'])))
    const unidades = await traduzir('enderecos_clifor', new Set(linhas.map((r) => r['cpo.QualUnidade'])), 'id, bubble_id, grupo_id')
    const pessoas = await usuarios(new Set(linhas.flatMap((r) => [r['Created By'], r['cpo.QualVendedor']])))
    const existentes = await jaGravados('historicos')
    const porTipo = {}
    const gravar = []
    let anexosArquivo = 0
    for (const r of linhas) {
      const grupo = grupos.get(r['cpo.QualClifor'])
      if (!grupo) {
        descartar(r['cpo.QualClifor'] ? 'grupo_clifor_id: cliente não carregado' : 'grupo_clifor_id: sem cliente no Bubble')
        continue
      }
      const descricao = texto(r['cpo.Descricao'])
      if (!descricao || descricao.trim() === '') {
        descartar('descricao vazia (check descricao_nao_vazia)')
        continue
      }
      const autor = pessoas.get(r['Created By'])
      if (!autor) {
        descartar(r['Created By'] ? 'autor_id: Created By sem usuário carregado' : 'autor_id: sem Created By')
        continue
      }
      const vend = r['cpo.QualVendedor'] ? pessoas.get(r['cpo.QualVendedor']) : null
      if (r['cpo.QualVendedor'] && !vend) avisar('vendedor_id: QualVendedor sem usuário carregado (fica nulo)')
      let unidade_id = null
      if (r['cpo.QualUnidade']) {
        const u = unidades.get(r['cpo.QualUnidade'])
        if (!u) avisar('unidade_id: unidade não carregada (fica nula)')
        else if (u.grupo_id !== grupo) avisar('unidade_id: unidade de OUTRO cliente (fica nula; o trigger recusaria)')
        else unidade_id = u.id
      }
      let departamento_id = null
      if (r['cpo.QualDepto']) {
        departamento_id = deps.get(normalizar(r['cpo.QualDepto'])) ?? null
        if (departamento_id === null) avisar('departamento_id: rótulo desconhecido (vai o do autor)')
      }
      // Em réplica o fn_historico_regras não roda: o "departamento do autor" dele é feito aqui.
      departamento_id ??= autor.departamento_id ?? null
      if (r['cpo.AnexoFile']) {
        anexosArquivo++
      }
      const tipo_evento = tipoEvento(descricao)
      porTipo[tipo_evento] = (porTipo[tipo_evento] ?? 0) + 1
      if (existentes.has(r._id)) {
        p.existia++
        continue
      }
      gravar.push({
        bubble_id: r._id,
        grupo_clifor_id: grupo,
        unidade_id,
        autor_id: autor.id,
        vendedor_id: vend?.id ?? null,
        departamento_id,
        tipo_evento,
        origem: 'carga',
        descricao,
        anexo_link: texto(r['cpo.AnexoLink']),
        criado_em: r['Created Date'],
        criado_por: autor.id,
      })
    }
    if (anexosArquivo) avisar(`anexo_path: ${anexosArquivo} arquivo(s) (AnexoFile) NÃO carregado(s) — URL do CDN → passo de arquivos`)
    p.porTipo = porTipo
    p.grava = gravar.length
    if (relatorio) return
    // Ordem de criação: se parar no meio, o que entrou é o começo da linha do tempo.
    gravar.sort((a, b) => String(a.criado_em).localeCompare(String(b.criado_em)) || a.bubble_id.localeCompare(b.bubble_id))
    const n = Math.ceil(gravar.length / lote)
    console.log(`  historicos: ${gravar.length} a inserir em ${n} lote(s) de ${lote}, pausa de ${pausa / 1000} s (≈ ${Math.round((n * pausa) / 60000)} min)`)
    p.grava = await inserir('historicos', Object.keys(gravar[0] ?? { bubble_id: 1 }), gravar, {
      replica: true,
      pausaEntre: pausa,
    })
    // Espelho: em réplica o trigger por instrução não rodou. UMA chamada, para TODOS os grupos com
    // histórico da carga — não só os desta rodada: uma rodada anterior interrompida (29/09) também
    // gravou em réplica e pode ter parado antes de recalcular.
    const { rows: gs } = await sql(
      `select array_agg(distinct grupo_clifor_id) as g from public.historicos where origem = 'carga'`,
      [],
      { rotulo: 'grupos com histórico da carga' },
    )
    const tocados = gs[0].g ?? []
    if (tocados.length) {
      const r = await sql(`select public.fn_historico_espelho_recalcular($1::uuid[]) as n`, [tocados], {
        rotulo: 'espelho grupos_clifor',
      })
      p.espelho = `fn_historico_espelho_recalcular: ${tocados.length} grupo(s) tocado(s), ${r.rows[0].n} espelho(s) mudaram`
    }
  }

  // =============================================================== ligar-cr
  /**
   * historicos.conta_receber_id ← Tbl.ContasReceber.QuaisHistoricos. Só NULL → uuid (nunca troca
   * uma ligação existente, nunca toca outro campo), em réplica porque fn_historico_imutavel recusa
   * qualquer update que não seja cancelamento. Idempotente: rode de novo quando entrarem mais CRs.
   */
  async function ligarCr() {
    const crs = await bruto('tbl.contasreceber')
    const pares = new Map() // historico bubble → cr bubble
    let repetidos = 0
    for (const cr of crs)
      for (const h of cr['cpo.QuaisHistoricos'] ?? []) {
        if (pares.has(String(h))) repetidos++
        else pares.set(String(h), cr._id)
      }
    const { p, descartar, avisar } = placar('historicos.conta_receber_id', pares.size)
    if (repetidos) avisar(`${repetidos} histórico(s) em mais de uma CR: fica a primeira`)
    const hist = await traduzir('historicos', new Set(pares.keys()), 'id, bubble_id, conta_receber_id')
    const crMap = await traduzir('contas_receber', new Set(pares.values()))
    const ligar = []
    for (const [hb, cb] of pares) {
      const h = hist.get(hb)
      const c = crMap.get(cb)
      if (!h) descartar('histórico não gravado (ou ausente no Bubble)')
      else if (!c) descartar('conta a receber ainda não carregada — PENDENTE, rode de novo depois')
      else if (h.conta_receber_id === c) p.existia++
      else if (h.conta_receber_id) descartar('já ligado a OUTRA CR (não se troca)')
      else ligar.push([h.id, c])
    }
    p.grava = ligar.length
    if (relatorio) return
    let feitas = 0
    for (let i = 0; i < ligar.length; i += lote) {
      const f = ligar.slice(i, i + lote)
      const r = await sql(
        `update public.historicos h set conta_receber_id = v.c
           from unnest($1::uuid[], $2::uuid[]) as v(h, c)
          where h.id = v.h and h.conta_receber_id is null`,
        [f.map((x) => x[0]), f.map((x) => x[1])],
        { replica: true, rotulo: `ligar-cr lote ${i / lote + 1}` },
      )
      feitas += r.rowCount
      if (i + lote < ligar.length) await dormir(Math.min(pausa, 10_000))
    }
    p.grava = feitas
  }

  // =============================================================== conferência
  async function conferir() {
    const alvo = {
      'tbl.historico': 'historicos',
      'tbl.sacprotocolo': 'sac_protocolos',
      'tbl.sachistorico': 'sac_interacoes',
      'tbl.pesquisanps': 'pesquisas',
      'tbl.pesquisarespostas': 'pesquisa_convites',
    }
    console.log('\nConferência Bubble × banco (linhas com bubble_id):')
    for (const [t, tab] of Object.entries(alvo)) {
      const b = (await bruto(t)).length
      const { rows } = await sql(`select count(*)::int n from public.${tab} where bubble_id is not null`)
      console.log(`  ${t.padEnd(24)} Bubble ${String(b).padStart(6)}  ×  ${tab.padEnd(18)} ${String(rows[0].n).padStart(6)}`)
    }
    const resp = await bruto('tbl.pesquisarespostas')
    const { rows: rr } = await sql(`select count(*)::int n from public.pesquisa_respostas where bubble_id is not null`)
    console.log(`  respondidas no Bubble ${resp.filter((r) => r['cpo.Respondida'] === true).length}  ×  pesquisa_respostas ${rr[0].n}`)
    const { rows: tipos } = await sql(
      `select tipo_evento, count(*)::int n from public.historicos where origem = 'carga' group by 1 order by 2 desc`,
    )
    console.log('  historicos (carga) por tipo_evento: ' + tipos.map((t) => `${t.tipo_evento} ${t.n}`).join(', '))
    const { rows: esp } = await sql(`
      select count(*) filter (where g.ultimo_historico_id is distinct from u.id)::int divergentes,
             count(*)::int grupos
        from public.grupos_clifor g
        join lateral (select h.id from public.historicos h
                       where h.grupo_clifor_id = g.id and h.cancelado_em is null and h.corrige_id is null
                       order by h.criado_em desc, h.id desc limit 1) u on true`)
    console.log(`  espelho: ${esp[0].grupos} grupo(s) com histórico, ${esp[0].divergentes} divergente(s)`)
    const { rows: cr } = await sql(
      `select count(*) filter (where conta_receber_id is not null)::int ligados from public.historicos`,
    )
    console.log(`  historicos ligados a conta a receber: ${cr[0].ligados}`)

    // NPS: fn_nps × o que a tela do Bubble mostrava ("NPS Atual" = nº de convites; "Média" = média da NotaNps)
    console.log('  NPS por campanha (fn_nps) × Bubble:')
    const pesq = await bruto('tbl.pesquisanps')
    for (const pn of pesq) {
      const { rows } = await sql(`select p.id, p.tipo_id from public.pesquisas p where p.bubble_id = $1`, [pn._id])
      if (!rows[0]) continue
      const { rows: f } = await sql(`select * from public.fn_nps($1)`, [rows[0].id])
      const minhas = resp.filter((r) => r['cpo.QualPesquisa'] === pn._id)
      const notas = minhas.map((r) => num(r['cpo.NotaNps'])).filter((n) => n !== null)
      const media = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2) : '—'
      const prom = notas.filter((n) => n >= 9).length
      const det = notas.filter((n) => n <= 6).length
      const npsB = notas.length ? Math.round((100 * (prom - det)) / notas.length) : null
      console.log(
        `    campanha tipo ${rows[0].tipo_id}: Bubble convites ${minhas.length}, notas ${notas.length}, média ${media}, NPS recalculado ${npsB ?? '—'}` +
          `  ×  fn_nps convites ${f[0].convites}, respondidas ${f[0].respondidas}, P/N/D ${f[0].promotores}/${f[0].neutros}/${f[0].detratores}, NPS ${f[0].nps ?? '—'}, média ${f[0].media ?? '—'}`,
      )
    }
    const { rows: pv } = await sql(`
      select count(c.*)::int convites, count(r.*)::int respostas,
             round(avg(r.nota_atendimento), 2) media_atend, round(avg(r.nota_produto), 2) media_prod
        from public.pesquisas p join public.pesquisa_convites c on c.pesquisa_id = p.id
        left join public.pesquisa_respostas r on r.convite_id = c.id
       where p.tipo_id = 3`)
    console.log(`    pós-venda (tipo 3): ${JSON.stringify(pv[0])}`)
  }

  // =============================================================== execução
  try {
    if (arg.conferir) {
      await conferir()
      return
    }
    for (const t of tipos) {
      // Presença de campo (nomes, nunca valores): o de-para lê por NOME de exibição.
      if (t !== 'ligar-cr') {
        const linhas = await bruto(t)
        const pres = presenca(linhas)
        console.log(`\n${t}: ${linhas.length} registro(s). Campos (preenchidos em n):`)
        console.log('  ' + [...pres.entries()].map(([k, n]) => `${k} ${n}`).join(' · '))
      } else {
        console.log('\nligar-cr:')
      }
      const passo = {
        'tbl.pesquisanps': pesquisasNps,
        'tbl.pesquisarespostas': pesquisaRespostas,
        'tbl.sacprotocolo': sacProtocolos,
        'tbl.sachistorico': sacInteracoes,
        'tbl.historico': historicos,
        'ligar-cr': ligarCr,
      }[t]
      await passo()
    }
  } catch (erro) {
    if (erro instanceof Parada) {
      console.error(`\n  ${erro.message}\n  A carga é idempotente por bubble_id: rode o mesmo comando mais tarde para continuar.`)
      process.exitCode = 2
    } else throw erro
  } finally {
    await db.fechar()
    if (placares.length) {
      console.log(relatorio ? '\nModo relatório — nada foi gravado.' : '\nResultado:')
      for (const p of placares) {
        console.log(
          `  ${p.tabela}: ${p.total} no Bubble → ${p.grava} ${relatorio ? 'gravaria' : 'gravada(s)'}, ${p.existia} já existia(m), ` +
            `${Object.values(p.descarta).reduce((a, b) => a + b, 0)} descartada(s)`,
        )
        for (const [m, n] of Object.entries(p.descarta)) console.log(`      descarta ${n}: ${m}`)
        for (const [m, n] of Object.entries(p.aviso)) console.log(`      aviso ${n}: ${m}`)
        if (p.porTipo) console.log(`      tipo_evento: ${Object.entries(p.porTipo).map(([k, n]) => `${k} ${n}`).join(', ')}`)
        if (p.espelho) console.log(`      ${p.espelho}`)
      }
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
