/**
 * Copia os arquivos do CDN do Bubble para os buckets PRIVADOS (db/018_arquivos.sql) e grava o
 * CAMINHO na coluna dona. É o "passo de arquivos" que tools/carregar-supabase.mjs deixou de fora
 * (fotos, ícones, anexos e arquivos de entrega chegam do Bubble como URL de CDN; a coluna é
 * caminho: specs/02 §1.8).
 *
 *   node tools/copiar-arquivos-bubble.mjs --relatorio             # só conta; não baixa nada
 *   node tools/copiar-arquivos-bubble.mjs                         # copia tudo o que puder
 *   node tools/copiar-arquivos-bubble.mjs --so produtos,tipos     # alvos: produtos, tipos,
 *                                                                 #   anexos, usuarios, clifor, entregas
 *
 * IDEMPOTENTE: coluna que já tem caminho não é recopiada; anexo é casado por `bubble_id`;
 * arquivo de entrega por (entrega_id, tipo, nome_arquivo) — ver `chaveEntrega`.
 *
 * SIGILO NO LOG: o log mostra SÓ CONTAGENS. Nunca URL, nunca nome de arquivo, nunca nome de
 * cliente — o nome do arquivo de anexo é dado de cliente ("Contrato social ACME.pdf"), e a URL
 * do Bubble abre sem autenticação (specs/00 §2.2): imprimir uma delas é vazar o arquivo.
 *
 * O QUE FICA DE FORA, e é CONTADO no relatório (nunca contornado):
 *   - tipo não aceito pelo bucket (ex.: os 2 anexos `.html`) ou conteúdo que não confere com o
 *     tipo (assinatura de bytes, lib/arquivos-regras.ts);
 *   - linha dona que não está no banco (produto/usuário/cliente/entrega não carregado);
 *   - o que a Data API nega (privacidade do Bubble para "everyone" com BUBBLE_API_KEY vazia).
 *
 * Usa service_role: é carga, não há usuário por quem agir (lib/supabase/admin.ts, mesma regra).
 */

import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

import { REGRAS, assinaturaConfere, montarCaminho, validarArquivo } from '../lib/arquivos-regras.ts'

// --------------------------------------------------------------------------- ambiente
const env = {}
for (const linha of readFileSync('.env', 'utf8').split('\n')) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}
const BUBBLE = (env.BUBBLE_APP_URL ?? '').replace(/\/+$/, '')
const CHAVE = env.BUBBLE_API_KEY || null
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const args = process.argv.slice(2)
const RELATORIO = args.includes('--relatorio')
const soIdx = args.indexOf('--so')
const ALVOS = new Set(
  soIdx >= 0 ? args[soIdx + 1].split(',') : ['produtos', 'tipos', 'anexos', 'usuarios', 'clifor', 'entregas'],
)
const PARALELO = 4

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

// ------------------------------------------------------------------------ Bubble / CDN
async function baixarTipo(tipo) {
  const linhas = []
  let cursor = 0
  for (;;) {
    let r
    for (let t = 1; ; t++) {
      const resp = await fetch(`${BUBBLE}/api/1.1/obj/${tipo}?limit=100&cursor=${cursor}`, {
        headers: CHAVE ? { Authorization: `Bearer ${CHAVE}` } : {},
      }).catch(() => null)
      if (resp?.ok) {
        r = (await resp.json()).response ?? {}
        break
      }
      if (resp && resp.status < 500 && resp.status !== 429) throw new Error(`Data API ${resp.status} em ${tipo}`)
      if (t >= 5) throw new Error(`Data API indisponível em ${tipo}`)
      await dormir(1000 * 2 ** (t - 1))
    }
    linhas.push(...(r.results ?? []))
    if (!r.remaining || r.remaining <= 0) break
    cursor += 100
    await dormir(100)
  }
  return linhas
}

/** URL do CDN normalizada. O Bubble grava `//s3…` (sem esquema) e às vezes `https://…`. */
function urlCdn(v) {
  if (typeof v !== 'string' || !v) return null
  if (v.startsWith('//')) return `https:${v}`
  if (v.startsWith('https://')) return v
  return null
}

/** Nome do arquivo como estava no Bubble (último segmento, decodificado). NUNCA vai ao log. */
function nomeDoArquivo(url) {
  const seg = url.split('?')[0].split('/').pop() ?? 'arquivo'
  try {
    return decodeURIComponent(seg)
  } catch {
    return seg
  }
}

const hashUrl = (url) => createHash('sha256').update(url).digest('hex').slice(0, 16)

async function baixarArquivo(url) {
  for (let t = 1; ; t++) {
    const resp = await fetch(url).catch(() => null)
    if (resp?.ok) return { bytes: new Uint8Array(await resp.arrayBuffer()), tipo: resp.headers.get('content-type') ?? '' }
    if (resp && resp.status < 500 && resp.status !== 429) return { erro: `http_${resp.status}` }
    if (t >= 3) return { erro: resp ? `http_${resp.status}` : 'rede' }
    await dormir(1000 * t)
  }
}

// ----------------------------------------------------------------------------- contagem
const conta = {}
function somar(alvo, chave, n = 1) {
  conta[alvo] ??= {}
  conta[alvo][chave] = (conta[alvo][chave] ?? 0) + n
}

/**
 * Baixa, confere e envia UM arquivo. Devolve o caminho gravável, ou null (já contado).
 * Em --relatorio não baixa: só valida pelo nome e conta como "a copiar".
 */
async function copiar(alvo, bucket, donoId, url) {
  const nome = nomeDoArquivo(url)
  // Sem extensão no nome (acontece nas fotos de cliente), quem decide são os bytes baixados.
  const temExtensao = /\.[a-z0-9]{1,5}$/i.test(nome)
  const previa = validarArquivo(bucket, { nome, tipo: '', tamanho: 1 })
  if (!previa.ok && temExtensao) {
    somar(alvo, 'bloqueado_tipo_nao_aceito')
    return null
  }
  if (RELATORIO) {
    somar(alvo, 'a_copiar')
    return null
  }
  const baixado = await baixarArquivo(url)
  if (baixado.erro) {
    somar(alvo, `falha_download_${baixado.erro}`)
    return null
  }
  let v = validarArquivo(bucket, { nome, tipo: baixado.tipo, tamanho: baixado.bytes.length })
  if (!v.ok && !temExtensao) {
    // Sem extensão e content-type genérico: o tipo é o que a assinatura dos bytes disser.
    const porBytes = Object.keys(REGRAS[bucket].tipos).find((m) => assinaturaConfere(m, baixado.bytes))
    if (porBytes) v = validarArquivo(bucket, { nome, tipo: porBytes, tamanho: baixado.bytes.length })
  }
  if (!v.ok) {
    somar(alvo, 'bloqueado_tipo_ou_tamanho')
    return null
  }
  if (!assinaturaConfere(v.mime, baixado.bytes)) {
    somar(alvo, 'bloqueado_conteudo_nao_confere')
    return null
  }
  const path = montarCaminho(bucket, donoId, randomUUID(), v.ext)
  const { error } = await admin.storage
    .from(bucket)
    .upload(path.slice(bucket.length + 1), baixado.bytes, { contentType: v.mime, upsert: false })
  if (error) {
    // O motivo do Storage fala do objeto pelo caminho novo (uuid), nunca pelo nome de origem.
    const motivo = String(error.statusCode ?? error.message ?? 'erro').replace(/[^a-z0-9]+/gi, '_').slice(0, 40)
    somar(alvo, `falha_upload_${motivo}`)
    return null
  }
  return { path, nome, tamanho: baixado.bytes.length }
}

async function removerObjeto(path) {
  const [bucket, ...resto] = path.split('/')
  await admin.storage.from(bucket).remove([resto.join('/')])
}

/** Roda `fn` em lotes de PARALELO. */
async function emParalelo(itens, fn) {
  for (let i = 0; i < itens.length; i += PARALELO) {
    await Promise.all(itens.slice(i, i + PARALELO).map(fn))
  }
}

/** Todas as linhas de uma tabela (paginado: o PostgREST devolve no máximo 1000 por vez). */
async function tudo(tabela, colunas) {
  const linhas = []
  for (let de = 0; ; de += 1000) {
    const { data, error } = await admin.from(tabela).select(colunas).order('id').range(de, de + 999)
    if (error) throw new Error(`leitura de ${tabela}: ${error.message}`)
    linhas.push(...data)
    if (data.length < 1000) return linhas
  }
}

async function mapaPorBubble(tabela, colunas = 'id, bubble_id') {
  const m = new Map()
  for (const l of await tudo(tabela, colunas)) if (l.bubble_id) m.set(l.bubble_id, l)
  return m
}

// ------------------------------------------------------------------ colunas "simples"
/** Foto(s) em coluna da própria linha: produtos, ícone de tipo, usuário, cliente. */
async function copiarColunas({ alvo, tipoBubble, tabela, bucket, campos }) {
  const bubble = await baixarTipo(tipoBubble)
  const colunas = ['id', 'bubble_id', ...Object.values(campos)].join(', ')
  const linhas = await mapaPorBubble(tabela, colunas)
  const tarefas = []
  for (const r of bubble) {
    for (const [campo, coluna] of Object.entries(campos)) {
      const url = urlCdn(r[campo])
      if (!url) continue
      somar(alvo, 'no_bubble')
      const linha = linhas.get(r._id)
      if (!linha) {
        somar(alvo, 'bloqueado_linha_dona_ausente')
        continue
      }
      if (linha[coluna]) {
        somar(alvo, 'ja_copiado')
        continue
      }
      tarefas.push({ linha, coluna, url })
    }
  }
  await emParalelo(tarefas, async ({ linha, coluna, url }) => {
    const c = await copiar(alvo, bucket, linha.id, url)
    if (!c) return
    const { error } = await admin.from(tabela).update({ [coluna]: c.path }).eq('id', linha.id).is(coluna, null)
    if (error) {
      await removerObjeto(c.path)
      somar(alvo, 'falha_gravar_caminho')
    } else somar(alvo, 'copiado')
  })
}

// -------------------------------------------------------------------------------- anexos
async function copiarAnexos() {
  const alvo = 'anexos'
  const bubble = await baixarTipo('tbl.anexos')
  const [existentes, grupos, enderecos, usuarios, tipos] = await Promise.all([
    mapaPorBubble('anexos'),
    mapaPorBubble('grupos_clifor'),
    mapaPorBubble('enderecos_clifor'),
    mapaPorBubble('usuarios'),
    admin.from('tipos_anexo').select('id, nome, chave_bubble'),
  ])
  if (tipos.error) throw new Error(`tipos_anexo: ${tipos.error.message}`)
  // A Data API devolve o option set pelo RÓTULO ("Cartão CNPJ"); aceita a chave também.
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
  const tipoPor = new Map()
  for (const t of tipos.data) {
    tipoPor.set(norm(t.nome), t.id)
    tipoPor.set(norm(t.chave_bubble), t.id)
  }

  const tarefas = []
  for (const r of bubble) {
    const url = urlCdn(r['cpo.Anexo'])
    if (!url) continue
    somar(alvo, 'no_bubble')
    if (existentes.has(r._id)) {
      somar(alvo, 'ja_copiado')
      continue
    }
    const tipoId = tipoPor.get(norm(r['cpo.TipoAnexo']))
    if (!tipoId) {
      somar(alvo, 'bloqueado_tipo_anexo_desconhecido')
      continue
    }
    // Dono ÚNICO (006, dono_unico). No Bubble o anexo de cliente tem grupo E filial (a filial é
    // `cpo.QualOrigem` no WF bTjeE): a FILIAL é gravada, porque é mais específica e o grupo se
    // deduz dela (enderecos_clifor.grupo_id). Sem filial, o grupo; sem cliente, o usuário.
    const end = enderecos.get(r['cpo.QualEndereco'])
    const grupo = grupos.get(r['cpo.QualClifor'])
    const usu = usuarios.get(r['cpo.QualUsuario'])
    const dono = end
      ? { endereco_id: end.id }
      : grupo
        ? { grupo_id: grupo.id }
        : usu
          ? { usuario_id: usu.id }
          : null
    if (!dono) {
      somar(alvo, 'bloqueado_linha_dona_ausente')
      continue
    }
    tarefas.push({ r, url, tipoId, dono, donoId: Object.values(dono)[0] })
  }

  await emParalelo(tarefas, async ({ r, url, tipoId, dono, donoId }) => {
    const c = await copiar(alvo, 'anexos', donoId, url)
    if (!c) return
    const { error } = await admin.from('anexos').insert({
      ...dono,
      tipo_anexo_id: tipoId,
      nome_arquivo: c.nome.slice(-200),
      path: c.path,
      tamanho_bytes: c.tamanho,
      bubble_id: r._id,
      criado_em: r['Created Date'] ?? undefined,
    })
    if (error) {
      await removerObjeto(c.path)
      somar(alvo, error.code === '23505' ? 'ja_copiado' : 'falha_gravar_linha')
    } else somar(alvo, 'copiado')
  })
}

// ------------------------------------------------------------------------------ entregas
const CAMPOS_ENTREGA = [
  ['cpo.ArquivoNfFornecedor', 'nf_fornecedor'],
  ['cpo.BoletoFile', 'boleto'],
  ['cpo.BoletoArquivos', 'boleto'],
  ['cpo.ComprovanteEntrega', 'comprovante'],
]

/**
 * `entrega_arquivos` não tem bubble_id (um arquivo não é registro no Bubble, é campo da
 * entrega — 009) e o caminho novo é uuid, então nada no caminho lembra a origem. O casamento
 * de idempotência é por (entrega_id, tipo, nome_arquivo): o nome vem da URL de origem.
 */
const chaveEntrega = (entregaId, tipo, nome) => `${entregaId}|${tipo}|${nome}`

async function copiarEntregas() {
  const alvo = 'entregas'
  const { count, error } = await admin.from('entregas').select('id', { count: 'exact', head: true })
  if (error) throw new Error(`contagem de entregas: ${error.message || error.code || 'sem resposta do banco'}`)
  const bubble = await baixarTipo('tbl.entregas')

  // Lista de arquivos por entrega, sem repetir URL: a rotina bTiEc0 copia o boleto único para a
  // lista, então BoletoFile costuma estar também em BoletoArquivos.
  const porEntrega = bubble.map((r) => {
    const vistos = new Set()
    const arquivos = []
    for (const [campo, tipo] of CAMPOS_ENTREGA) {
      const v = r[campo]
      for (const bruto of Array.isArray(v) ? v : v ? [v] : []) {
        const url = urlCdn(bruto)
        if (!url || vistos.has(hashUrl(url))) continue
        vistos.add(hashUrl(url))
        arquivos.push({ url, tipo })
      }
    }
    return { r, arquivos }
  })
  const totalArquivos = porEntrega.reduce((s, x) => s + x.arquivos.length, 0)
  somar(alvo, 'no_bubble', totalArquivos)

  if (!count) {
    somar(alvo, 'bloqueado_entregas_nao_carregadas', totalArquivos)
    return
  }

  const entregas = await mapaPorBubble('entregas')
  const ja = new Set(
    (await tudo('entrega_arquivos', 'id, entrega_id, tipo, nome_arquivo')).map((a) =>
      chaveEntrega(a.entrega_id, a.tipo, a.nome_arquivo),
    ),
  )
  const tarefas = []
  for (const { r, arquivos } of porEntrega) {
    const e = entregas.get(r._id)
    for (const a of arquivos) {
      if (!e) {
        somar(alvo, 'bloqueado_linha_dona_ausente')
        continue
      }
      if (ja.has(chaveEntrega(e.id, a.tipo, nomeDoArquivo(a.url).slice(-200)))) {
        somar(alvo, 'ja_copiado')
        continue
      }
      tarefas.push({ e, a })
    }
  }
  await emParalelo(tarefas, async ({ e, a }) => {
    const c = await copiar(alvo, 'entregas', e.id, a.url)
    if (!c) return
    const { error: erro } = await admin.from('entrega_arquivos').insert({
      entrega_id: e.id,
      tipo: a.tipo,
      nome_arquivo: c.nome.slice(-200),
      path: c.path,
    })
    if (erro) {
      await removerObjeto(c.path)
      somar(alvo, 'falha_gravar_linha')
    } else somar(alvo, 'copiado')
  })
}

// ---------------------------------------------------------------------------------- main
const passos = {
  produtos: () =>
    copiarColunas({
      alvo: 'produtos',
      tipoBubble: 'tbl.produtosmodelo',
      tabela: 'produtos',
      bucket: 'produtos',
      campos: {
        'cpo.FotoFrontal': 'foto_frontal_path',
        'cpo.FotoLateral': 'foto_lateral_path',
        'cpo.FotoSuperior': 'foto_superior_path',
        'cpo.FotoInferior': 'foto_inferior_path',
      },
    }),
  tipos: () =>
    copiarColunas({
      alvo: 'tipos',
      tipoBubble: 'tbl.produtostipo',
      tabela: 'produto_tipos',
      bucket: 'produtos',
      campos: { 'cpo.Icon': 'icone_path' },
    }),
  anexos: copiarAnexos,
  usuarios: () =>
    copiarColunas({
      alvo: 'usuarios',
      tipoBubble: 'user',
      tabela: 'usuarios',
      bucket: 'usuarios',
      campos: { 'cpo.Foto': 'foto_path' },
    }),
  clifor: () =>
    copiarColunas({
      alvo: 'clifor',
      tipoBubble: 'tbl.grupoclifor',
      tabela: 'grupos_clifor',
      bucket: 'clifor',
      campos: { 'cpo.Foto': 'foto_path' },
    }),
  entregas: copiarEntregas,
}

console.log(`Cópia de arquivos do Bubble${RELATORIO ? ' — RELATÓRIO (nada é baixado nem gravado)' : ''}`)
console.log(`Data API: ${CHAVE ? 'com chave' : 'anônima (BUBBLE_API_KEY vazia): o que a privacidade nega não vem'}`)
for (const [nome, passo] of Object.entries(passos)) {
  if (!ALVOS.has(nome)) continue
  try {
    await passo()
  } catch (erro) {
    // A mensagem é nossa (tabela/tipo/status), nunca contém URL de arquivo.
    somar(nome, 'erro_do_passo')
    // Resposta de erro pode ser uma página HTML inteira (522 do Cloudflare): só o essencial.
    const msg = String(erro.message || 'sem resposta do banco')
    const curta = /<title>([^<]*)<\/title>/i.exec(msg)?.[1] ?? msg.replace(/\s+/g, ' ').slice(0, 160)
    console.error(`  ${nome}: ${curta}`)
    process.exitCode = 1
  }
  const c = conta[nome] ?? {}
  console.log(`  ${nome.padEnd(9)} ${Object.entries(c).map(([k, v]) => `${k}=${v}`).join(' · ') || 'nada no Bubble'}`)
}
