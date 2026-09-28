import 'server-only'

import { randomUUID } from 'node:crypto'

import {
  assinaturaConfere,
  ehBucket,
  ehUuid,
  lerCaminho,
  montarCaminho,
  nomeSeguro,
  validadeUrl,
  validarArquivo,
  type Bucket,
} from '@/lib/arquivos-regras'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

/**
 * Arquivo no Storage privado (db/018_arquivos.sql; specs/02 §1.8).
 *
 * TUDO aqui roda com a SESSÃO do usuário (`clienteServidor`), e não com service_role: a
 * conferência "a linha dona é visível?" é feita pela RLS da tabela dona, e o Storage confere
 * de novo pela policy de storage.objects. A única exceção é desfazer um upload cuja linha não
 * chegou a ser gravada (`enviarAnexo`), porque objeto não tem policy de DELETE para ninguém.
 *
 * Chamado de server action (`'use server'`), nunca de componente de cliente.
 */

export type Resultado<T> = ({ ok: true } & T) | { ok: false; erro: string }

// ------------------------------------------------------------------------ URL assinada

/**
 * A linha que "possui" o caminho está visível para quem pede?
 * Cada bucket pergunta à SUA tabela, pelo caminho exato — a mesma pergunta da policy de
 * leitura do bucket na 018. Um caminho que nenhuma linha guarda não abre, mesmo que o objeto
 * exista (arquivo órfão, ou caminho adivinhado).
 */
async function donoVisivel(path: string): Promise<boolean> {
  const lido = lerCaminho(path)
  if (!lido) return false
  const sb = await clienteServidor()
  const achou = async (q: PromiseLike<{ data: unknown[] | null; error: unknown }>) => {
    const { data, error } = await q
    return !error && (data?.length ?? 0) > 0
  }

  switch (lido.bucket) {
    case 'anexos':
      return achou(sb.from('anexos').select('id').eq('path', path).limit(1))
    case 'entregas':
      return achou(sb.from('entrega_arquivos').select('id').eq('path', path).limit(1))
    case 'usuarios':
      return achou(sb.from('usuarios').select('id').eq('id', lido.donoId).eq('foto_path', path).limit(1))
    case 'clifor':
      return achou(sb.from('grupos_clifor').select('id').eq('id', lido.donoId).eq('foto_path', path).limit(1))
    case 'produtos': {
      const { data } = await sb
        .from('produtos')
        .select('foto_frontal_path, foto_lateral_path, foto_superior_path, foto_inferior_path')
        .eq('id', lido.donoId)
        .maybeSingle()
      if (data && Object.values(data).includes(path)) return true
      return achou(sb.from('produto_tipos').select('id').eq('id', lido.donoId).eq('icone_path', path).limit(1))
    }
  }
}

/**
 * URL assinada de vida curta (60–300 s, padrão 120) para um caminho guardado numa coluna
 * `*_path`. Nega (sem dizer por quê) se o caminho é malformado — URL de CDN inclusive — ou
 * se a linha dona não é visível pela sessão. `baixarComo` força download com esse nome.
 */
export async function urlAssinada(
  path: string | null | undefined,
  opcoes: { segundos?: number; baixarComo?: string } = {},
): Promise<Resultado<{ url: string; expiraEm: number }>> {
  const negado = { ok: false as const, erro: 'Arquivo indisponível.' }
  if (!path) return negado
  const lido = lerCaminho(path)
  if (!lido || !(await donoVisivel(path))) return negado

  const segundos = validadeUrl(opcoes.segundos)
  const sb = await clienteServidor()
  const { data, error } = await sb.storage
    .from(lido.bucket)
    .createSignedUrl(
      lido.objeto,
      segundos,
      opcoes.baixarComo ? { download: nomeSeguro(opcoes.baixarComo) } : undefined,
    )
  if (error || !data?.signedUrl) return negado
  return { ok: true, url: data.signedUrl, expiraEm: Date.now() + segundos * 1000 }
}

/** Várias de uma vez (galeria de fotos, lista de anexos). Caminho negado vira null. */
export async function urlsAssinadas(
  paths: (string | null | undefined)[],
  segundos?: number,
): Promise<(string | null)[]> {
  return Promise.all(paths.map(async (p) => {
    const r = await urlAssinada(p, { segundos })
    return r.ok ? r.url : null
  }))
}

// ------------------------------------------------------------------------------ upload

/**
 * Envia um arquivo para `<bucket>/<donoId>/<uuid>.<ext>` e devolve o caminho para a coluna.
 * O caminho é gerado AQUI (o nome do usuário nunca entra nele); tipo, tamanho e os primeiros
 * bytes são conferidos antes do upload. A policy de envio do bucket confere, com a sessão,
 * que a linha dona existe e é visível e que o usuário tem a página que escreve nela.
 *
 * NÃO grava a coluna: quem chama grava (`produtos.foto_frontal_path`, `usuarios.foto_path`…)
 * na mesma server action, para a checagem de permissão da ESCRITA ficar com a RLS da tabela.
 * Para anexos use `enviarAnexo`, que já grava a linha.
 */
export async function enviarArquivo(
  bucket: Bucket,
  donoId: string,
  arquivo: File,
): Promise<Resultado<{ path: string; nomeArquivo: string; tamanho: number; mime: string }>> {
  if (!ehBucket(bucket)) return { ok: false, erro: 'Destino inválido.' }
  if (!ehUuid(donoId)) return { ok: false, erro: 'Registro inválido.' }
  if (!(arquivo instanceof File)) return { ok: false, erro: 'Nenhum arquivo enviado.' }

  const v = validarArquivo(bucket, { nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size })
  if (!v.ok) return v

  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  if (!assinaturaConfere(v.mime, bytes)) {
    return { ok: false, erro: 'O conteúdo do arquivo não corresponde ao tipo informado.' }
  }

  const path = montarCaminho(bucket, donoId, randomUUID(), v.ext)
  const objeto = path.slice(bucket.length + 1)
  const sb = await clienteServidor()
  const { error } = await sb.storage.from(bucket).upload(objeto, bytes, {
    contentType: v.mime,
    upsert: false,
    cacheControl: '3600',
  })
  if (error) return { ok: false, erro: 'Não foi possível enviar o arquivo (sem permissão ou registro inexistente).' }

  return { ok: true, path, nomeArquivo: nomeSeguro(arquivo.name), tamanho: arquivo.size, mime: v.mime }
}

export type DonoAnexo = { grupoId: string } | { enderecoId: string } | { usuarioId: string }

/**
 * Anexo de cliente/fornecedor ou de usuário (pop.AnexosClifor, WFs bTjeE e bTkNt): envia o
 * arquivo e grava a linha em `anexos`. A RLS de `anexos` (insert = página cadastros) decide a
 * escrita; se ela negar, o objeto enviado é removido (service_role, só para desfazer) para
 * não sobrar arquivo órfão.
 */
export async function enviarAnexo(entrada: {
  dono: DonoAnexo
  tipoAnexoId: number
  arquivo: File
  usuarioAtualId: string
}): Promise<Resultado<{ id: string; path: string }>> {
  const { dono, tipoAnexoId, arquivo, usuarioAtualId } = entrada
  const donoId =
    'grupoId' in dono ? dono.grupoId : 'enderecoId' in dono ? dono.enderecoId : dono.usuarioId
  if (!Number.isInteger(tipoAnexoId) || tipoAnexoId <= 0) return { ok: false, erro: 'Tipo de documento inválido.' }

  const envio = await enviarArquivo('anexos', donoId, arquivo)
  if (!envio.ok) return envio

  const id = randomUUID()
  const sb = await clienteServidor()
  // Sem `.select()`: o insert não pode depender de a linha ser LEGÍVEL depois (o departamento
  // de quem envia pode não ver aquele tipo — o Bubble deixa enviar e esconde da lista).
  const { error } = await sb.from('anexos').insert({
    id,
    grupo_id: 'grupoId' in dono ? dono.grupoId : null,
    endereco_id: 'enderecoId' in dono ? dono.enderecoId : null,
    usuario_id: 'usuarioId' in dono ? dono.usuarioId : null,
    tipo_anexo_id: tipoAnexoId,
    nome_arquivo: envio.nomeArquivo,
    path: envio.path,
    tamanho_bytes: envio.tamanho,
    criado_por: usuarioAtualId,
  })
  if (error) {
    await clienteAdmin().storage.from('anexos').remove([envio.path.slice('anexos/'.length)])
    return { ok: false, erro: 'Sem permissão para anexar documento.' }
  }
  return { ok: true, id, path: envio.path }
}
