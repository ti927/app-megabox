import 'server-only'

import { lerCaminho, validadeUrl, type Bucket } from '@/lib/arquivos-regras'
import { clienteServidor } from '@/lib/supabase/servidor'

/**
 * URLs assinadas para as fotos de uma LISTA que a sessão acabou de ler.
 *
 * Por que não `urlsAssinadas` (lib/arquivos.ts): ela confere a linha dona de cada caminho com
 * uma consulta própria e assina um por um — 2 chamadas por foto, 100 numa página de 50
 * clientes, no banco Micro. Aqui a linha dona JÁ foi lida pela sessão (a RLS da tabela
 * decidiu), então basta provar que o caminho é daquela linha (`<bucket>/<id da linha>/…`) e
 * assinar tudo numa chamada só (`createSignedUrls`), ainda com a SESSÃO: a policy de leitura
 * do bucket em storage.objects (db/018) confere de novo cada objeto.
 *
 * Caminho malformado, de outro bucket ou de outra linha vira null (mostra as iniciais).
 */
export async function urlsDeLinhas(
  bucket: Bucket,
  itens: { donoId: string; path: string | null | undefined }[],
  segundos?: number,
): Promise<Map<string, string>> {
  const saida = new Map<string, string>()
  const objetos: string[] = []
  const caminhoDoObjeto = new Map<string, string>()

  for (const { donoId, path } of itens) {
    if (!path) continue
    const lido = lerCaminho(path)
    if (!lido || lido.bucket !== bucket || lido.donoId !== donoId.toLowerCase()) continue
    objetos.push(lido.objeto)
    caminhoDoObjeto.set(lido.objeto, path)
  }
  if (objetos.length === 0) return saida

  const sb = await clienteServidor()
  const { data, error } = await sb.storage.from(bucket).createSignedUrls(objetos, validadeUrl(segundos))
  if (error || !data) {
    console.error(`arquivos: assinar lote ${bucket}`, error)
    return saida
  }
  for (const r of data) {
    const path = r.path ? caminhoDoObjeto.get(r.path) : undefined
    if (path && r.signedUrl && !r.error) saida.set(path, r.signedUrl)
  }
  return saida
}
