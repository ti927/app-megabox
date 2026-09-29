/**
 * Conferência de arquivo NO NAVEGADOR, antes de mandar para a server action.
 *
 * Soma duas travas: a regra do bucket (`validarArquivo`, espelho da 018) e o teto de corpo da
 * server action. O Next recusa corpo acima de `experimental.serverActions.bodySizeLimit`
 * (padrão 1 MB) com uma exceção que derruba a tela no error boundary — a pessoa perderia o
 * que estava fazendo sem entender por quê. Enquanto o `next.config.ts` não sobe esse limite
 * (ver relatório da fatia de arquivos), o teto efetivo é este, com folga para o multipart.
 *
 * Pura: roda no navegador e no vitest.
 */

import { type Bucket, REGRAS, validarArquivo, type Validacao } from '@/lib/arquivos-regras'

const MB = 1024 * 1024

/**
 * Corpo máximo da server action (`bodySizeLimit: '4mb'` em next.config.ts) menos a folga do
 * multipart e dos campos. Cobre os 3 MB que o Bubble aceitava.
 */
export const LIMITE_ENVIO_BYTES = 4 * MB - 64 * 1024

export function conferirEnvio(
  bucket: Bucket,
  arquivo: { nome: string; tipo: string; tamanho: number },
  limiteEnvio: number = LIMITE_ENVIO_BYTES,
): Validacao {
  const v = validarArquivo(bucket, arquivo)
  if (!v.ok) return v
  if (arquivo.tamanho > limiteEnvio) {
    const kb = Math.floor(limiteEnvio / 1024)
    return { ok: false, erro: `Por enquanto o envio aceita arquivos de até ${kb} KB.` }
  }
  return v
}

/** Valor do atributo `accept` do input de arquivo: extensões e mimes que o bucket aceita. */
export function aceitos(bucket: Bucket): string {
  const tipos = REGRAS[bucket].tipos
  const ext = [...new Set(Object.values(tipos))].map((e) => `.${e}`)
  if (ext.includes('.jpg')) ext.push('.jpeg')
  return [...ext, ...Object.keys(tipos)].join(',')
}
