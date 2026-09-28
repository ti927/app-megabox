/**
 * Prova que o Storage (db/018_arquivos.sql) só entrega arquivo a quem enxerga a linha dona.
 *
 * Mesmo molde de `scripts/testar-rls-relatorios.mjs`: autentica de verdade com as duas contas de
 * QA do .env — QA_EMAIL/QA_SENHA (perfil 1) e QA_OPERADOR_EMAIL/QA_OPERADOR_SENHA (perfil 4).
 * service_role só PREPARA e LIMPA (ignora RLS, nunca afirma nada).
 *
 * O que se prova:
 *   - anon: não lê anexos, não assina URL, não envia, e bucket nenhum é público;
 *   - departamento: anexo de tipo cujo departamento não inclui o do usuário não aparece na
 *     tabela NEM abre no Storage — para qualquer perfil, Diretor incluído (é o Bubble);
 *   - anexo de USUÁRIO (documento pessoal): o dono lê, o Operador colega não;
 *   - upload: formato de caminho fora de `<uuid>/<uuid>.<ext>`, dono inexistente, bucket sem a
 *     página, tipo não aceito e pasta de outro usuário → recusados; o caminho certo passa;
 *   - ninguém apaga objeto pela sessão (sem policy de DELETE);
 *   - a coluna recusa URL de CDN (CHECK de formato).
 *
 * Tudo que o teste cria tem nome/`bubble_id` exato com o prefixo `__teste_rls_arquivos__`, e os
 * objetos são removidos pela LISTA EXATA de caminhos criados — nunca por prefixo ou `like`.
 *
 *   node scripts/testar-rls-arquivos.mjs
 */

import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

const env = {}
for (const linha of readFileSync('.env', 'utf8').split('\n')) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}
const URL_SB = env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const admin = createClient(URL_SB, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const NOME = '__teste_rls_arquivos__'
const PDF = new TextEncoder().encode('%PDF-1.4\n% teste rls arquivos\n%%EOF\n')
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])

/** Todo objeto criado, `bucket/nome`, para a limpeza por nome exato. */
const criados = new Set()

const casos = []
function caso(nome, esperado, obtido, detalhe = '') {
  const ok = esperado === obtido
  casos.push({ nome, ok })
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `  (esperado ${esperado}, veio ${obtido})`}`)
  if (!ok && detalhe) console.log(`        ${detalhe}`)
}

async function exigir(promessa, oque) {
  const { data, error } = await promessa
  if (error) throw new Error(`preparo (${oque}): ${error.message}`)
  return data
}

async function entrar(email, senha) {
  const cliente = createClient(URL_SB, ANON, { auth: { persistSession: false } })
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(`não autenticou: ${error.message}`)
  return { cliente, id: data.user.id }
}

/** Sobe com service_role (preparo). Devolve o caminho de coluna `bucket/dono/uuid.ext`. */
async function subirAdmin(bucket, dono, bytes, ext, mime) {
  const objeto = `${dono}/${randomUUID()}.${ext}`
  await exigir(admin.storage.from(bucket).upload(objeto, bytes, { contentType: mime }), `upload ${bucket}`)
  criados.add(`${bucket}/${objeto}`)
  return `${bucket}/${objeto}`
}

/** Tenta subir com a sessão; registra para limpeza se passou. */
async function subir(cliente, bucket, objeto, bytes, mime) {
  const { error } = await cliente.storage.from(bucket).upload(objeto, bytes, { contentType: mime, upsert: false })
  if (!error) criados.add(`${bucket}/${objeto}`)
  return error ? 'recusado' : 'aceito'
}

/** Assina com a sessão e baixa. 'abre' só se a URL existir E devolver 200. */
async function abre(cliente, path) {
  const [bucket, ...resto] = path.split('/')
  const { data, error } = await cliente.storage.from(bucket).createSignedUrl(resto.join('/'), 60)
  if (error || !data?.signedUrl) return 'negado'
  const r = await fetch(data.signedUrl)
  return r.ok ? 'abre' : `http_${r.status}`
}

async function lerAnexo(cliente, bubbleId) {
  const { data } = await cliente.from('anexos').select('id').eq('bubble_id', bubbleId)
  return data?.length ?? 0
}

// ------------------------------------------------------------------ preparo e limpeza
async function preparar(dir, op) {
  const tipos = await exigir(admin.from('tipos_anexo').select('id, chave_bubble, qual_cadastro'), 'tipos_anexo')
  const tad = await exigir(admin.from('tipo_anexo_departamentos').select('tipo_anexo_id, departamento_id'), 'tad')
  const [uop] = await exigir(admin.from('usuarios').select('departamento_id').eq('id', op.id), 'usuário op')
  const deptos = (tipoId) => tad.filter((t) => t.tipo_anexo_id === tipoId).map((t) => t.departamento_id)

  // Tipo de cliente que o departamento do Operador VÊ; tipo que NINGUÉM vê (comprovante de
  // endereço não tem departamento nenhum, na 003 e no Bubble); tipo de usuário visível.
  const visivel = tipos.find((t) => t.qual_cadastro === 'clifor' && deptos(t.id).includes(uop.departamento_id))
  const ninguem = tipos.find((t) => deptos(t.id).length === 0)
  const deUsuario = tipos.find((t) => t.qual_cadastro === 'usuario' && deptos(t.id).includes(uop.departamento_id))
  if (!visivel || !ninguem || !deUsuario) throw new Error('preparo: tipos de anexo esperados não encontrados')

  const [grupo] = await exigir(admin.from('grupos_clifor').insert({ tipo: 'cliente', nome: NOME }).select('id'), 'grupo')
  const [produto] = await exigir(admin.from('produtos').insert({ nome: NOME }).select('id'), 'produto')

  const pVisivel = await subirAdmin('anexos', grupo.id, PDF, 'pdf', 'application/pdf')
  const pNinguem = await subirAdmin('anexos', grupo.id, PDF, 'pdf', 'application/pdf')
  const pPessoal = await subirAdmin('anexos', dir.id, PDF, 'pdf', 'application/pdf')
  const pOrfao = await subirAdmin('anexos', grupo.id, PDF, 'pdf', 'application/pdf')
  const pFoto = await subirAdmin('produtos', produto.id, PNG, 'png', 'image/png')

  const anexo = (sufixo, path, tipo, dono) => ({
    ...dono,
    tipo_anexo_id: tipo,
    nome_arquivo: `${NOME}.pdf`,
    path,
    bubble_id: `${NOME}${sufixo}`,
  })
  await exigir(
    admin.from('anexos').insert([
      anexo('visivel', pVisivel, visivel.id, { grupo_id: grupo.id }),
      anexo('ninguem', pNinguem, ninguem.id, { grupo_id: grupo.id }),
      anexo('pessoal', pPessoal, deUsuario.id, { usuario_id: dir.id }),
    ]),
    'anexos',
  )
  await exigir(admin.from('produtos').update({ foto_frontal_path: pFoto }).eq('id', produto.id).select('id'), 'foto')
  return { grupo: grupo.id, produto: produto.id, pVisivel, pNinguem, pPessoal, pOrfao, pFoto }
}

async function limpar() {
  const passos = []
  const registrar = (oque, r) => {
    if (r.error) {
      console.error(`  FALHA  limpeza de ${oque}: ${r.error.message}`)
      process.exitCode = 1
    } else passos.push(`${oque}: ${r.data?.length ?? 0}`)
  }
  const ids = ['visivel', 'ninguem', 'pessoal', 'cdn'].map((s) => `${NOME}${s}`)
  registrar('anexos', await admin.from('anexos').delete().in('bubble_id', ids).select('id'))
  registrar('produtos', await admin.from('produtos').delete().in('nome', [NOME]).select('id'))
  registrar('grupos_clifor', await admin.from('grupos_clifor').delete().in('nome', [NOME]).select('id'))
  // Objetos: SÓ os caminhos exatos criados nesta execução.
  const porBucket = {}
  for (const p of criados) {
    const [b, ...resto] = p.split('/')
    ;(porBucket[b] ??= []).push(resto.join('/'))
  }
  let removidos = 0
  for (const [b, nomes] of Object.entries(porBucket)) {
    const r = await admin.storage.from(b).remove(nomes)
    if (r.error) registrar(`storage ${b}`, r)
    else removidos += r.data.length
  }
  passos.push(`objetos: ${removidos}/${criados.size}`)
  criados.clear()
  console.log(`\nLimpeza: ${passos.join(' · ')}`)
}

// ------------------------------------------------------------------------------- casos
async function main() {
  const anonimo = createClient(URL_SB, ANON, { auth: { persistSession: false } })
  const dir = await entrar(env.QA_EMAIL, env.QA_SENHA)
  const op = await entrar(env.QA_OPERADOR_EMAIL, env.QA_OPERADOR_SENHA)
  const d = await preparar(dir, op)

  console.log('\nBuckets:')
  const { data: buckets } = await admin.storage.listBuckets()
  for (const b of ['anexos', 'produtos', 'entregas', 'usuarios', 'clifor']) {
    const x = buckets?.find((y) => y.id === b)
    caso(`bucket ${b} existe e é privado`, 'privado', x ? (x.public ? 'público' : 'privado') : 'ausente')
  }

  console.log('\nSem sessão (anon):')
  caso('anon lê anexos', 0, await lerAnexo(anonimo, `${NOME}visivel`))
  caso('anon assina URL de anexo', 'negado', await abre(anonimo, d.pVisivel))
  caso('anon assina URL de foto de produto', 'negado', await abre(anonimo, d.pFoto))
  const pub = await fetch(`${URL_SB}/storage/v1/object/public/${d.pVisivel}`)
  caso('URL "pública" do objeto não abre', false, pub.ok)
  caso(
    'anon envia arquivo',
    'recusado',
    await subir(anonimo, 'anexos', `${d.grupo}/${randomUUID()}.pdf`, PDF, 'application/pdf'),
  )

  console.log('\nDepartamento (tipo_anexo_departamentos):')
  caso('Operador lê anexo de tipo do seu departamento (tabela)', 1, await lerAnexo(op.cliente, `${NOME}visivel`))
  caso('Operador abre o arquivo desse anexo (URL assinada)', 'abre', await abre(op.cliente, d.pVisivel))
  caso('Operador NÃO lê anexo de tipo sem o seu departamento', 0, await lerAnexo(op.cliente, `${NOME}ninguem`))
  caso('Operador NÃO abre o arquivo desse anexo', 'negado', await abre(op.cliente, d.pNinguem))
  caso('Diretor também NÃO lê tipo sem o seu departamento (regra vale p/ todo perfil)', 0, await lerAnexo(dir.cliente, `${NOME}ninguem`))
  caso('Diretor NÃO abre esse arquivo', 'negado', await abre(dir.cliente, d.pNinguem))
  caso('objeto sem linha em anexos (órfão) não abre', 'negado', await abre(dir.cliente, d.pOrfao))

  console.log('\nAnexo de usuário (documento pessoal):')
  caso('o dono (perfil 1) lê o próprio documento', 1, await lerAnexo(dir.cliente, `${NOME}pessoal`))
  caso('o dono abre o arquivo', 'abre', await abre(dir.cliente, d.pPessoal))
  caso('Operador colega NÃO lê o documento de outro', 0, await lerAnexo(op.cliente, `${NOME}pessoal`))
  caso('Operador colega NÃO abre o arquivo', 'negado', await abre(op.cliente, d.pPessoal))

  console.log('\nProdutos (leitura de qualquer usuário ativo):')
  caso('Operador abre a foto do produto', 'abre', await abre(op.cliente, d.pFoto))

  console.log('\nUpload pela sessão:')
  const certo = `${d.grupo}/${randomUUID()}.pdf`
  caso('Operador envia anexo no caminho certo (página cadastros)', 'aceito', await subir(op.cliente, 'anexos', certo, PDF, 'application/pdf'))
  caso('…mas o objeto sem linha em anexos continua sem abrir', 'negado', await abre(op.cliente, `anexos/${certo}`))
  caso('nome fora de <uuid>/<uuid>.<ext>', 'recusado', await subir(op.cliente, 'anexos', `${d.grupo}/contrato.pdf`, PDF, 'application/pdf'))
  caso('pasta raiz sem dono', 'recusado', await subir(op.cliente, 'anexos', `${randomUUID()}.pdf`, PDF, 'application/pdf'))
  caso('dono inexistente', 'recusado', await subir(op.cliente, 'anexos', `${randomUUID()}/${randomUUID()}.pdf`, PDF, 'application/pdf'))
  caso('subpasta extra', 'recusado', await subir(op.cliente, 'anexos', `${d.grupo}/x/${randomUUID()}.pdf`, PDF, 'application/pdf'))
  caso('tipo não aceito (text/html)', 'recusado', await subir(op.cliente, 'anexos', `${d.grupo}/${randomUUID()}.html`, new TextEncoder().encode('<html>'), 'text/html'))
  caso('Operador sem a página produtos não envia foto', 'recusado', await subir(op.cliente, 'produtos', `${d.produto}/${randomUUID()}.png`, PNG, 'image/png'))
  caso('Diretor (página produtos) envia foto', 'aceito', await subir(dir.cliente, 'produtos', `${d.produto}/${randomUUID()}.png`, PNG, 'image/png'))
  caso('Operador NÃO envia foto na pasta de outro usuário', 'recusado', await subir(op.cliente, 'usuarios', `${dir.id}/${randomUUID()}.png`, PNG, 'image/png'))
  caso('Operador envia a própria foto', 'aceito', await subir(op.cliente, 'usuarios', `${op.id}/${randomUUID()}.png`, PNG, 'image/png'))
  caso('bucket entregas sem entrega na pasta', 'recusado', await subir(dir.cliente, 'entregas', `${randomUUID()}/${randomUUID()}.pdf`, PDF, 'application/pdf'))

  console.log('\nApagar e sobrescrever:')
  const [bucket, ...resto] = d.pVisivel.split('/')
  await op.cliente.storage.from(bucket).remove([resto.join('/')])
  const { data: ainda } = await admin.storage.from(bucket).list(d.grupo, { search: resto[1] })
  caso('Operador NÃO apaga objeto (sem policy de DELETE)', 1, ainda?.length ?? 0)
  const sobre = await op.cliente.storage.from(bucket).upload(resto.join('/'), PDF, { contentType: 'application/pdf', upsert: true })
  caso('Operador NÃO sobrescreve objeto (sem policy de UPDATE)', true, Boolean(sobre.error))

  console.log('\nColuna é caminho, não URL:')
  const cdn = await admin.from('anexos').insert({
    grupo_id: d.grupo,
    tipo_anexo_id: 2,
    nome_arquivo: 'x.pdf',
    path: 'https://s3.amazonaws.com/appforest_uf/x.pdf',
    bubble_id: `${NOME}cdn`,
  })
  caso('anexos.path recusa URL de CDN (CHECK 23514)', '23514', cdn.error?.code ?? 'aceitou')
  const cdnFoto = await admin.from('produtos').update({ foto_lateral_path: '//s3.amazonaws.com/x.png' }).eq('id', d.produto)
  caso('produtos.foto_*_path recusa URL de CDN', '23514', cdnFoto.error?.code ?? 'aceitou')

  await dir.cliente.auth.signOut()
  await op.cliente.auth.signOut()

  const falhas = casos.filter((c) => !c.ok)
  console.log(`\n${casos.length - falhas.length}/${casos.length} casos como a 018 promete.`)
  if (falhas.length > 0) process.exitCode = 1
}

try {
  await main()
} catch (erro) {
  console.error(`\nFALHA  ${erro.message}`)
  process.exitCode = 1
} finally {
  await limpar()
}
