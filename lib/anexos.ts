/**
 * Regras puras do anexo de cliente/fornecedor (`pop.AnexosClifor`, bTjcT). Sem I/O: a
 * tela e as server actions usam, o vitest testa.
 */

import { ehUuid } from '@/lib/arquivos-regras'

/**
 * Apagar UM anexo: só Diretor ou Gerente (ícone da linha bTjdn, `QualPerfil.hierarquia <= 2`).
 * O "apagar TODOS" do cabeçalho (WF bTjeL, sem confirmação e sem restrição) NÃO é
 * reproduzido — specs/paginas/cadastros.md §4.6 e §7.
 */
export function podeApagarAnexo(usuario: { perfilId: number }): boolean {
  return Number.isInteger(usuario.perfilId) && usuario.perfilId >= 1 && usuario.perfilId <= 2
}

/**
 * Filtro PostgREST `or` dos anexos de um grupo: os do grupo e os das filiais dele (a cópia do
 * Bubble ligou o anexo de cliente à FILIAL — specs/04-duvidas, "Arquivos no Storage").
 * Só aceita uuid: o texto vai para dentro de um `or=(...)`, e nada de fora pode entrar ali.
 */
export function filtroDonoAnexos(grupoId: string, filiais: string[]): string {
  if (!ehUuid(grupoId)) throw new Error('grupo inválido')
  const ids = filiais.filter((f) => ehUuid(f))
  return ids.length > 0 ? `grupo_id.eq.${grupoId},endereco_id.in.(${ids.join(',')})` : `grupo_id.eq.${grupoId}`
}

/** "320 KB", "2,4 MB" — tamanho do arquivo na lista. */
export function formatarTamanho(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
}
