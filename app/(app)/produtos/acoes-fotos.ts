'use server'

import { revalidatePath } from 'next/cache'

import { enviarArquivo } from '@/lib/arquivos'
import { ehUuid, lerCaminho } from '@/lib/arquivos-regras'
import { exigirAcesso } from '@/lib/autorizacao'
import { colunaDaFoto, FOTOS_PRODUTO } from '@/lib/produtos-fotos'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { EstadoAcao } from './tipos'

/**
 * Trocar UMA das quatro fotos do produto — os PictureInput do `pop.CadastroProdutos`
 * (bTgZk/bTgZq/bTgaD/bTgZx), gravados por bTgei.
 *
 * Objeto no Storage é imutável (db/018): trocar é subir um arquivo NOVO e apontar a coluna
 * para ele. A permissão é conferida pela SESSÃO duas vezes — a policy de envio do bucket
 * `produtos` (página produtos + produto visível) e o UPDATE em `produtos` (RLS de escrita).
 * Só depois disso o service_role entra, e só para remover: o objeto novo, se o UPDATE foi
 * negado (não sobra órfão), ou o antigo, que ficou sem linha que o aponte.
 */
export async function trocarFotoProduto(_anterior: EstadoAcao, form: FormData): Promise<EstadoAcao> {
  await exigirAcesso('produtos')

  const idBruto = form.get('produto_id')
  const id = typeof idBruto === 'string' ? idBruto.toLowerCase() : ''
  const coluna = colunaDaFoto(form.get('foto'))
  const arquivo = form.get('arquivo')
  if (!ehUuid(id) || !coluna) return { erro: 'Pedido inválido. Recarregue a página.' }
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: 'Escolha a imagem.' }

  const supabase = await clienteServidor()
  const { data: atual, error: erroLeitura } = await supabase
    .from('produtos')
    .select(FOTOS_PRODUTO.map((f) => f.coluna).join(', '))
    .eq('id', id)
    .maybeSingle()
  if (erroLeitura) console.error('produtos: ler foto', erroLeitura)
  if (!atual) return { erro: 'Este produto não existe mais. Recarregue a página.' }
  const antigo = (atual as unknown as Record<string, string | null>)[coluna] ?? null

  const envio = await enviarArquivo('produtos', id, arquivo)
  if (!envio.ok) return { erro: envio.erro }

  const admin = clienteAdmin()
  const objetoNovo = envio.path.slice('produtos/'.length)
  const { data, error } = await supabase
    .from('produtos')
    .update({ [coluna]: envio.path })
    .eq('id', id)
    .select('id')
  if (error || !data || data.length === 0) {
    if (error) console.error('produtos: gravar foto', error)
    await admin.storage.from('produtos').remove([objetoNovo])
    return { erro: 'Você não tem permissão para alterar este produto.' }
  }

  // O arquivo antigo só sai se é MESMO deste produto (caminho `produtos/<id>/…`) e se nenhuma
  // outra coluna da linha ainda aponta para ele.
  const lido = antigo ? lerCaminho(antigo) : null
  const outrasColunas = FOTOS_PRODUTO.filter((f) => f.coluna !== coluna).map(
    (f) => (atual as unknown as Record<string, string | null>)[f.coluna],
  )
  if (lido && lido.bucket === 'produtos' && lido.donoId === id && !outrasColunas.includes(antigo)) {
    const { error: erroRemover } = await admin.storage.from('produtos').remove([lido.objeto])
    if (erroRemover) console.error(`produtos: objeto órfão ${antigo}`, erroRemover)
  }

  revalidatePath('/produtos')
  return { ok: 'Foto gravada.', id }
}
