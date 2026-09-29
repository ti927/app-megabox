'use server'

import { revalidatePath } from 'next/cache'

import { podeApagarAnexo } from '@/lib/anexos'
import { enviarAnexo, urlAssinada } from '@/lib/arquivos'
import { ehUuid, lerCaminho } from '@/lib/arquivos-regras'
import { exigirAcesso } from '@/lib/autorizacao'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { EstadoItem } from './tipos'

/*
 * Anexos (documentos) do cliente/fornecedor — porta do `pop.AnexosClifor` (bTjcT),
 * specs/paginas/cadastros.md §4.6.
 *
 * Server action é endpoint público: cada uma repete `exigirAcesso('cadastros')` e valida a
 * entrada. LER e ENVIAR usam a SESSÃO (a RLS de `anexos` e a policy do bucket decidem, db/018).
 * APAGAR usa service_role — não existe policy de DELETE em `anexos` nem em storage.objects,
 * de propósito (006/018) — e só DEPOIS de conferir, pela sessão, que quem pede é Diretor ou
 * Gerente (bTjdn) e ENXERGA aquele anexo. Apaga UM por vez: o "apagar todos" do Bubble
 * (WF bTjeL, sem confirmação nem restrição) não existe aqui.
 */

/** Extensões que o navegador mostra na aba; o resto (doc, docx, xls…) desce com o nome real. */
const ABRE_NA_ABA = new Set(['pdf', 'jpg', 'png', 'webp', 'gif'])

function texto(form: FormData, campo: string): string {
  const v = form.get(campo)
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Enviar anexo — WF bTjdz (modo Cliente/Fornecedor). Tipo obrigatório; a filial também,
 * como no Bubble (`dd qualendereco` mandatory), quando o grupo tem filial ativa. Grupo sem
 * filial ativa guarda o anexo no próprio grupo.
 */
export async function enviarAnexoGrupo(_anterior: EstadoItem, form: FormData): Promise<EstadoItem> {
  const usuario = await exigirAcesso('cadastros')
  const supabase = await clienteServidor()

  const grupoId = texto(form, 'grupo_id').toLowerCase()
  const enderecoId = texto(form, 'endereco_id').toLowerCase()
  const tipoAnexoId = Number(texto(form, 'tipo_anexo_id'))
  const arquivo = form.get('arquivo')

  if (!ehUuid(grupoId)) return { erro: 'Cadastro inválido. Recarregue a página.' }
  if (!Number.isInteger(tipoAnexoId) || tipoAnexoId <= 0) return { erro: 'Escolha o tipo do documento.' }
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: 'Escolha o arquivo.' }
  if (enderecoId !== '' && !ehUuid(enderecoId)) return { erro: 'Filial inválida. Recarregue a página.' }

  // O tipo tem de ser de cliente/fornecedor (`dd tipodocumento` filtra por QualCadastro).
  const [tipo, grupo, filiais] = await Promise.all([
    supabase.from('tipos_anexo').select('id, qual_cadastro').eq('id', tipoAnexoId).maybeSingle(),
    supabase.from('grupos_clifor').select('id').eq('id', grupoId).maybeSingle(),
    supabase.from('enderecos_clifor').select('id').eq('grupo_id', grupoId).eq('ativo', true),
  ])
  if (!tipo.data || tipo.data.qual_cadastro !== 'clifor') return { erro: 'Tipo de documento inválido.' }
  if (!grupo.data) return { erro: 'Este cadastro não existe mais. Recarregue a página.' }

  const ativas = new Set((filiais.data ?? []).map((f) => f.id as string))
  if (ativas.size > 0 && enderecoId === '') return { erro: 'Escolha a filial do documento.' }
  if (enderecoId !== '' && !ativas.has(enderecoId)) {
    return { erro: 'Essa filial não é deste cadastro ou está inativa.' }
  }

  const r = await enviarAnexo({
    dono: enderecoId !== '' ? { enderecoId } : { grupoId },
    tipoAnexoId,
    arquivo,
    usuarioAtualId: usuario.id,
  })
  if (!r.ok) return { erro: r.erro }

  revalidatePath('/cadastros')

  // O Bubble deixa enviar tipo que o próprio departamento não vê, e esconde da lista. Aqui
  // também — mas avisa, para ninguém achar que o envio se perdeu.
  const { data: ve } = await supabase
    .from('tipo_anexo_departamentos')
    .select('tipo_anexo_id')
    .eq('tipo_anexo_id', tipoAnexoId)
    .eq('departamento_id', usuario.departamentoId)
    .maybeSingle()
  return ve
    ? { ok: 'Documento anexado.' }
    : {
        ok: 'Documento anexado.',
        avisos: ['Seu departamento não vê documentos deste tipo, por isso ele não aparece na lista.'],
      }
}

/**
 * Abrir anexo — WF bTjec abria a URL pública do CDN. Aqui a URL é assinada NA HORA do clique,
 * com vida de 60 s, depois de a sessão ler a linha (a RLS de `anexos` já filtra o departamento).
 */
export async function abrirAnexo(id: string): Promise<{ url: string } | { erro: string }> {
  await exigirAcesso('cadastros')
  if (typeof id !== 'string' || !ehUuid(id)) return { erro: 'Documento inválido.' }

  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('anexos')
    .select('path, nome_arquivo')
    .eq('id', id)
    .is('usuario_id', null)
    .maybeSingle()
  if (!data) return { erro: 'Documento indisponível.' }

  const ext = lerCaminho(data.path as string)?.objeto.split('.').pop() ?? ''
  const r = await urlAssinada(data.path as string, {
    segundos: 60,
    baixarComo: ABRE_NA_ABA.has(ext) ? undefined : (data.nome_arquivo as string),
  })
  return r.ok ? { url: r.url } : { erro: r.erro }
}

/**
 * Apagar UM anexo — WF bTjeV (ícone da linha, hierarquia <= 2). Confere tudo pela SESSÃO
 * antes de tocar em service_role: perfil, e que a linha existe e é VISÍVEL para quem pede
 * (quem não vê o tipo não apaga o tipo). Apaga a linha e depois o objeto, pelo caminho exato.
 */
export async function removerAnexo(_anterior: EstadoItem, form: FormData): Promise<EstadoItem> {
  const usuario = await exigirAcesso('cadastros')
  if (!podeApagarAnexo(usuario)) return { erro: 'Só Diretor ou Gerente apaga documento.' }

  const id = texto(form, 'id').toLowerCase()
  if (!ehUuid(id)) return { erro: 'Documento inválido. Recarregue a página.' }

  const supabase = await clienteServidor()
  const { data: anexo } = await supabase
    .from('anexos')
    .select('id, path')
    .eq('id', id)
    .is('usuario_id', null)
    .maybeSingle()
  if (!anexo) return { erro: 'Este documento não existe mais ou você não pode vê-lo.' }

  const path = anexo.path as string
  const lido = lerCaminho(path)
  if (!lido || lido.bucket !== 'anexos') return { erro: 'Documento com caminho inválido. Avise o suporte.' }

  const admin = clienteAdmin()
  const { data: apagadas, error } = await admin
    .from('anexos')
    .delete()
    .eq('id', id)
    .eq('path', path)
    .select('id')
  if (error || !apagadas || apagadas.length !== 1) {
    console.error('cadastros: apagar anexo', error)
    return { erro: 'Não foi possível apagar agora. Tente de novo em instantes.' }
  }

  // A linha já saiu: sem ela, a policy do bucket não deixa ninguém ler o objeto. Se a remoção
  // do objeto falhar, sobra só um arquivo órfão inacessível — registrado para a limpeza.
  const { error: erroObjeto } = await admin.storage.from('anexos').remove([lido.objeto])
  if (erroObjeto) console.error(`cadastros: objeto órfão ${path}`, erroObjeto)

  revalidatePath('/cadastros')
  return { ok: 'Documento apagado.' }
}
