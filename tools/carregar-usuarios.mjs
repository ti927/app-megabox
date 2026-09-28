/**
 * Carga dos usuários do Bubble (data type `User`) para `auth.users` + `public.usuarios`.
 *
 * Existe para que `grupos_clifor.carteira_id` (vendedor da carteira) e as fatias seguintes
 * tenham a quem apontar. Depois de gravar os usuários, preenche `grupos_clifor.carteira_id` a
 * partir de `Tbl.GrupoCliFor.cpo.QualCarteira`.
 *
 * REGRAS DURAS (specs/00-achados-de-seguranca.md §1.2; 02 §2.1.5; comment de `usuarios` na 001):
 *  - Nenhuma senha migra. `cpo.PassTexto` e os campos SMTP são DESCARTADOS na leitura, antes de
 *    qualquer outro código tocar o registro (`limpar`). Não existem nem em memória depois disso.
 *  - A conta Auth nasce SEM senha e SEM e-mail de qualquer tipo: `auth.admin.createUser` com
 *    `email_confirm: true` não dispara confirmação. Nada de convite, link mágico ou reset — o
 *    fluxo de primeiro acesso é decisão do dono do projeto.
 *  - Conta que JÁ EXISTIA no Auth com o mesmo e-mail (a do dono, as de QA, criadas pelo
 *    scripts/bootstrap-acesso.mjs) não tem perfil, ativo nem permissões alterados: só recebe
 *    `bubble_id` se estiver vazio.
 *  - Nada pessoal no console: só contagens e avisos genéricos.
 *
 * Idempotente: casa primeiro por `usuarios.bubble_id`, depois por e-mail no Auth. Só as contas
 * que ESTA carga criou (app_metadata.origem = 'carga_bubble') são atualizadas numa recarga.
 *
 * ARMADILHAS da Data API (specs/04-duvidas.md §1.1): campo vem pelo NOME DE EXIBIÇÃO, option set
 * pelo RÓTULO ("Comercial", não `licita__o`), campo vazio é OMITIDO. Perfil e departamento são
 * resolvidos contra `perfis`/`departamentos` por `chave_bubble` OU `nome`, sem acento e caixa.
 * Lembrete: departamento `licita__o` = Comercial e `geral` = Operação — resolver pelo rótulo
 * evita deduzir pela chave.
 *
 * Fora desta carga, de propósito:
 *  - `foto_path`: o Bubble manda URL do CDN; a coluna é caminho no Storage privado (passo de
 *    arquivos, junto de `anexos`).
 *  - `nivel_vendedor_id`: `niveis_vendedor` é da fatia 8.
 *  - estado de tela (`UltimoDateRange`, `OrdenarCampos`, `Selecionados*`, ...) →
 *    `usuario_preferencias`, na fatia que usar.
 *  - `RankingVenda*` (metas [DÚVIDA 11]).
 *
 * Uso:
 *   node tools/carregar-usuarios.mjs --relatorio   # confere e conta, não grava nada
 *   node tools/carregar-usuarios.mjs               # carga real + carteira dos grupos
 */

import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

const ORIGEM = 'carga_bubble'

/** Qualquer campo de senha/SMTP. Casado pelo NOME, sem olhar o valor. */
const CAMPO_PROIBIDO = /pass|senha|smtp|stmp/i

/** Remove campo de senha/SMTP do registro cru. Roda antes de qualquer outra leitura. */
function limpar(r) {
  const out = {}
  for (const [k, v] of Object.entries(r)) if (!CAMPO_PROIBIDO.test(k)) out[k] = v
  return out
}

const texto = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim())
const normalizar = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Data do Bubble (ISO em UTC, meia-noite local = 03:00Z) → `date` no fuso de São Paulo.
 * Cortar a string em 10 caracteres daria o dia certo só por acaso.
 */
const dataLocal = (v) => {
  if (!texto(v)) return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d)
}

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

/** Mesma paginação por cursor de tools/carregar-supabase.mjs (copiada: aquele não exporta). */
async function baixar(base, chave, tipo, transformar = (r) => r) {
  const linhas = []
  let cursor = 0
  for (;;) {
    const url = `${base}/api/1.1/obj/${tipo}?limit=100&cursor=${cursor}`
    const resposta = await fetch(url, {
      headers: chave ? { Authorization: `Bearer ${chave}` } : {},
      signal: AbortSignal.timeout(60_000),
    })
    if (!resposta.ok) throw new Error(`${resposta.status} em ${tipo}`)
    const r = (await resposta.json()).response ?? {}
    for (const x of r.results ?? []) linhas.push(transformar(x))
    if (!r.remaining || r.remaining <= 0) break
    cursor += 100
    await dormir(100)
  }
  return linhas
}

async function lerTudo(db, tabela, colunas) {
  const out = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await db.from(tabela).select(colunas).order('id').range(i, i + 999)
    if (error) throw new Error(`lendo ${tabela}: ${error.message}`)
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}

async function indiceDominio(db, tabela, chave = 'id') {
  const { data, error } = await db.from(tabela).select(`${chave}, chave_bubble, nome`)
  if (error) throw new Error(`lendo ${tabela}: ${error.message}`)
  const mapa = new Map()
  for (const l of data) {
    for (const forma of [l.chave_bubble, l.nome, typeof l[chave] === 'string' ? l[chave] : null]) {
      if (forma) mapa.set(normalizar(forma), l[chave])
    }
  }
  return mapa
}

async function listarAuth(db) {
  const todos = []
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`listando auth.users: ${error.message}`)
    todos.push(...data.users)
    if (data.users.length < 1000) break
  }
  return todos
}

/** E-mail de login: o do Auth do Bubble; `cpo.EmailLoginTexto` é a reserva. */
function emailLogin(r) {
  const doAuth = texto(r.authentication?.email?.email)
  const reserva = texto(r['cpo.EmailLoginTexto'])
  const e = (doAuth ?? reserva)?.toLowerCase() ?? null
  return e && EMAIL_VALIDO.test(e) ? e : null
}

async function main() {
  const relatorio = process.argv.includes('--relatorio')
  const env = lerEnv()
  const base = (env.BUBBLE_APP_URL ?? '').replace(/\/+$/, '')
  const chaveBubble = env.BUBBLE_API_KEY || null
  if (!base) throw new Error('BUBBLE_APP_URL é obrigatória no .env.')
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.')
  }
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // ------------------------------------------------------------------ leitura
  const bubble = await baixar(base, chaveBubble, 'user', limpar)
  const perfis = await indiceDominio(db, 'perfis')
  const deptos = await indiceDominio(db, 'departamentos')
  const ufs = await indiceDominio(db, 'ufs', 'sigla')

  const usuarios = await lerTudo(db, 'usuarios', 'id, bubble_id')
  const porBubble = new Map(usuarios.filter((u) => u.bubble_id).map((u) => [u.bubble_id, u.id]))
  const temLinha = new Set(usuarios.map((u) => u.id))
  const contasAuth = await listarAuth(db)
  const authPorEmail = new Map(contasAuth.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u]))
  const authPorId = new Map(contasAuth.map((u) => [u.id, u]))

  const n = {
    bubble: bubble.length,
    inativos: 0,
    semEmail: 0,
    emailDuplicado: 0,
    semNome: 0,
    semPerfilOuDepto: 0,
    criados: 0,
    atualizadosDaCarga: 0,
    jaExistentesPreservados: 0,
    bubbleIdPreenchido: 0,
    linhaCriadaParaContaSemLinha: 0,
    substitutos: 0,
  }
  const avisos = new Map()
  const avisar = (m) => avisos.set(m, (avisos.get(m) ?? 0) + 1)

  // ------------------------------------------------------------------ tradução
  const vistos = new Set()
  const plano = []
  for (const r of bubble) {
    const ativo = r['cpo.Ativo'] === true
    if (!ativo) n.inativos++

    const email = emailLogin(r)
    if (!email) {
      n.semEmail++
      continue
    }
    if (vistos.has(email)) {
      n.emailDuplicado++
      avisar('e-mail de login repetido entre usuários do Bubble — o segundo fica de fora')
      continue
    }
    vistos.add(email)

    const perfilRotulo = r['cpo.QualPerfil']
    const deptoRotulo = r['cpo.QualDepto']
    const perfil_id = perfis.get(normalizar(perfilRotulo))
    const departamento_id = deptos.get(normalizar(deptoRotulo))
    if (perfil_id === undefined) avisar(`perfil: rótulo "${perfilRotulo ?? '(vazio)'}" sem correspondente em perfis`)
    if (departamento_id === undefined) {
      avisar(`departamento: rótulo "${deptoRotulo ?? '(vazio)'}" sem correspondente em departamentos`)
    }
    const nome = texto(r['cpo.Nome'])
    if (!nome) n.semNome++
    if (perfil_id === undefined || departamento_id === undefined) n.semPerfilOuDepto++
    if (!nome || perfil_id === undefined || departamento_id === undefined) continue

    let uf = null
    if (texto(r['cpo.Uf'])) {
      uf = ufs.get(normalizar(r['cpo.Uf'])) ?? null
      if (!uf) avisar(`uf: rótulo "${r['cpo.Uf']}" sem correspondente em ufs`)
    }
    let ferias_inicio = dataLocal(r['cpo.FeriasInicio'])
    let ferias_fim = dataLocal(r['cpo.FeriasFim'])
    if (ferias_inicio && ferias_fim && ferias_inicio > ferias_fim) {
      avisar('férias com fim antes do início — gravadas vazias')
      ferias_inicio = ferias_fim = null
    }
    if (!ferias_inicio && ferias_fim) ferias_fim = null

    plano.push({
      email,
      substitutoBubble: texto(r['cpo.QualVendedorSubstituto']),
      linha: {
        bubble_id: r._id,
        nome,
        email_contato: texto(r['cpo.EmailContato']),
        perfil_id,
        departamento_id,
        ativo,
        telefone: texto(r['cpo.Telefone']),
        cpf: texto(r['cpo.Cpf']),
        rg: texto(r['cpo.Rg']),
        cidade: texto(r['cpo.Cidade']),
        endereco: texto(r['cpo.Endereço']),
        uf,
        ferias_inicio,
        ferias_fim,
        is_dev: r['cpo.IsDev'] === true,
        criado_em: texto(r['Created Date']) ?? new Date().toISOString(),
        alterado_em: texto(r['Modified Date']),
      },
    })
  }

  // ------------------------------------------------------------------ gravação
  const bubbleParaUuid = new Map(porBubble)
  const PREVISTO = '(previsto)'
  const daCarga = new Set() // uuids que esta carga pode atualizar

  for (const p of plano) {
    const idPorBubble = porBubble.get(p.linha.bubble_id)
    const conta = idPorBubble ? authPorId.get(idPorBubble) : authPorEmail.get(p.email)

    if (conta) {
      const nossa = conta.app_metadata?.origem === ORIGEM
      if (nossa) {
        // Conta criada por esta carga numa rodada anterior: reflete o Bubble de novo.
        n.atualizadosDaCarga++
        daCarga.add(conta.id)
        bubbleParaUuid.set(p.linha.bubble_id, conta.id)
        if (!relatorio) {
          const { error } = await db.from('usuarios').upsert({ id: conta.id, ...p.linha }, { onConflict: 'id' })
          if (error) throw new Error(`usuarios (recarga): ${error.message}`)
        }
        continue
      }
      if (!temLinha.has(conta.id)) {
        // Conta Auth sem linha em usuarios: não há perfil a preservar; a linha nasce do Bubble.
        n.linhaCriadaParaContaSemLinha++
        daCarga.add(conta.id)
        bubbleParaUuid.set(p.linha.bubble_id, conta.id)
        if (!relatorio) {
          const { error } = await db.from('usuarios').insert({ id: conta.id, ...p.linha })
          if (error) throw new Error(`usuarios (conta sem linha): ${error.message}`)
        }
        continue
      }
      // Conta preexistente (dono, QA): só bubble_id, e só se vazio.
      n.jaExistentesPreservados++
      bubbleParaUuid.set(p.linha.bubble_id, conta.id)
      if (!idPorBubble) {
        n.bubbleIdPreenchido++
        if (!relatorio) {
          const { error } = await db
            .from('usuarios')
            .update({ bubble_id: p.linha.bubble_id })
            .eq('id', conta.id)
            .is('bubble_id', null)
          if (error) throw new Error(`usuarios (bubble_id): ${error.message}`)
        }
      }
      continue
    }

    n.criados++
    if (relatorio) {
      bubbleParaUuid.set(p.linha.bubble_id, PREVISTO)
      continue
    }
    // Sem senha e sem e-mail enviado. Se o servidor recusar sem senha, gera uma aleatória que
    // morre neste escopo: nunca impressa, nunca gravada.
    let { data, error } = await db.auth.admin.createUser({
      email: p.email,
      email_confirm: true,
      user_metadata: { bubble_id: p.linha.bubble_id },
      app_metadata: { origem: ORIGEM },
    })
    if (error && /password/i.test(error.message ?? '')) {
      ;({ data, error } = await db.auth.admin.createUser({
        email: p.email,
        password: randomBytes(32).toString('base64url'),
        email_confirm: true,
        user_metadata: { bubble_id: p.linha.bubble_id },
        app_metadata: { origem: ORIGEM },
      }))
    }
    if (error) throw new Error(`auth.createUser: ${error.message}`)
    const id = data.user.id
    daCarga.add(id)
    bubbleParaUuid.set(p.linha.bubble_id, id)
    const { error: erroLinha } = await db.from('usuarios').insert({ id, ...p.linha })
    if (erroLinha) throw new Error(`usuarios (insert): ${erroLinha.message}`)
  }

  // ------------------------------------------------ substituto (auto-referência, 2ª passada)
  let substitutoOrfao = 0
  for (const p of plano) {
    if (!p.substitutoBubble) continue
    const dono = bubbleParaUuid.get(p.linha.bubble_id)
    if (!dono || (dono !== PREVISTO && !daCarga.has(dono))) continue // conta preservada: não mexe
    const alvo = bubbleParaUuid.get(p.substitutoBubble)
    if (!alvo || (alvo !== PREVISTO && alvo === dono) || p.substitutoBubble === p.linha.bubble_id) {
      substitutoOrfao++
      continue
    }
    n.substitutos++
    if (!relatorio) {
      const { error } = await db.from('usuarios').update({ substituto_id: alvo }).eq('id', dono)
      if (error) throw new Error(`usuarios (substituto): ${error.message}`)
    }
  }

  // ------------------------------------------------ inativo = conta BLOQUEADA no Auth
  // `ativo = false` em `usuarios` já tira tudo pela RLS (fn_usuario_ativo), mas a conta Auth
  // continuaria podendo pedir "recuperar senha" em /recuperar-senha e ganhar sessão. Sessão sem
  // dado ainda é sessão: é ela que um ex-funcionário usaria para sondar o que a RLS deixou
  // aberto. Bloquear no Auth fecha a porta antes do banco. Só nas contas desta carga; a volta
  // (reativar) é da tela de administração, que desbloqueia junto.
  let bloqueados = 0
  for (const p of plano) {
    const id = bubbleParaUuid.get(p.linha.bubble_id)
    if (!id || id === PREVISTO || !daCarga.has(id)) continue
    if (relatorio) continue
    const { error } = await db.auth.admin.updateUserById(id, {
      ban_duration: p.linha.ativo ? 'none' : '876000h',
    })
    if (error) throw new Error(`auth (bloqueio): ${error.message}`)
    if (!p.linha.ativo) bloqueados++
  }
  console.log(`  contas inativas bloqueadas no Auth ........... ${bloqueados}`)

  // ------------------------------------------------ grupos_clifor.carteira_id
  const grupos = await baixar(base, chaveBubble, 'tbl.grupoclifor', (r) => ({
    _id: r._id,
    carteira: texto(r['cpo.QualCarteira']),
  }))
  const carteiraDoGrupo = new Map(grupos.filter((g) => g.carteira).map((g) => [g._id, g.carteira]))
  const gruposBanco = await lerTudo(db, 'grupos_clifor', 'id, bubble_id, carteira_id, tipo')
  const c = { comPonteiroNoBubble: carteiraDoGrupo.size, jaLigados: 0, ligar: 0, orfaos: 0, semLinhaNoBanco: 0, naoCliente: 0 }
  const lotes = new Map() // uuid do vendedor → ids de grupo
  const noBanco = new Set()
  for (const g of gruposBanco) {
    if (!g.bubble_id) continue
    noBanco.add(g.bubble_id)
    const ponteiro = carteiraDoGrupo.get(g.bubble_id)
    if (!ponteiro) continue
    // Fornecedor não tem carteira (check carteira_so_cliente, 006): no Bubble nada impedia gravar.
    if (g.tipo !== 'cliente') {
      c.naoCliente++
      continue
    }
    if (g.carteira_id) {
      c.jaLigados++
      continue
    }
    const uuid = bubbleParaUuid.get(ponteiro)
    if (!uuid) {
      c.orfaos++
      continue
    }
    c.ligar++
    if (uuid !== PREVISTO) (lotes.get(uuid) ?? lotes.set(uuid, []).get(uuid)).push(g.id)
  }
  for (const b of carteiraDoGrupo.keys()) if (!noBanco.has(b)) c.semLinhaNoBanco++

  if (!relatorio) {
    for (const [uuid, ids] of lotes) {
      for (let i = 0; i < ids.length; i += 200) {
        const { error } = await db
          .from('grupos_clifor')
          .update({ carteira_id: uuid })
          .in('id', ids.slice(i, i + 200))
          .eq('tipo', 'cliente')
          .is('carteira_id', null)
        if (error) throw new Error(`grupos_clifor (carteira): ${error.message}`)
      }
    }
  }

  // ------------------------------------------------------------------ resumo (só números)
  console.log(relatorio ? '\nModo relatório — nada foi gravado.\n' : '\nCarga concluída.\n')
  console.log(`  usuários no Bubble ............................ ${n.bubble}`)
  console.log(`    inativos (entram com ativo = false) ......... ${n.inativos}`)
  console.log(`    sem e-mail de login válido (sem conta) ...... ${n.semEmail}`)
  console.log(`    e-mail repetido (fora) ...................... ${n.emailDuplicado}`)
  console.log(`    sem nome (fora) ............................. ${n.semNome}`)
  console.log(`    perfil/departamento não resolvido (fora) .... ${n.semPerfilOuDepto}`)
  console.log(`  contas ${relatorio ? 'a criar' : 'criadas'} ................................ ${n.criados}`)
  console.log(`  contas já da carga, ${relatorio ? 'a atualizar' : 'atualizadas'} ............... ${n.atualizadosDaCarga}`)
  console.log(`  contas preexistentes preservadas .............. ${n.jaExistentesPreservados}`)
  console.log(`    das quais bubble_id ${relatorio ? 'a preencher' : 'preenchido'} ................ ${n.bubbleIdPreenchido}`)
  console.log(`  conta Auth sem linha em usuarios, ${relatorio ? 'a criar' : 'criada'} ..... ${n.linhaCriadaParaContaSemLinha}`)
  console.log(`  substitutos ${relatorio ? 'a ligar' : 'ligados'} / órfãos ................... ${n.substitutos} / ${substitutoOrfao}`)
  console.log(`  avisos de tradução ............................ ${[...avisos.values()].reduce((a, b) => a + b, 0)}`)
  for (const [m, q] of avisos) console.log(`      ${q}× ${m}`)
  console.log('\n  grupos_clifor.carteira_id')
  console.log(`    grupos com ponteiro no Bubble ............... ${c.comPonteiroNoBubble}`)
  console.log(`    já ligados antes ............................ ${c.jaLigados}`)
  console.log(`    ${relatorio ? 'a ligar' : 'ligados agora'} ................................ ${c.ligar}`)
  console.log(`    órfãos (vendedor sem usuário) ............... ${c.orfaos}`)
  console.log(`    ponteiro em grupo não-cliente (fora, check) . ${c.naoCliente}`)
  console.log(`    ponteiro de grupo que não está no banco ..... ${c.semLinhaNoBanco}`)
}

await main()
