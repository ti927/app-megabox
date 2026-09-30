/**
 * "Tem alteração não gravada?" para formulários NÃO controlados (defaultValue), como a ficha de
 * /produtos: fechar o painel lateral (X, Esc, clique fora) desmontava o formulário e o que foi
 * digitado sumia sem aviso. A regra: pedir confirmação SÓ quando o conteúdo atual difere do que
 * estava ao abrir (ou do último gravado) — digitar e apagar de volta não conta como alteração.
 *
 * A assinatura é dos VALORES que o formulário enviaria (FormData): campo desabilitado e caixa
 * desmarcada ficam de fora dos dois lados, então comparam igual. A ordem das chaves não importa;
 * a ordem dos valores repetidos (caixas de mesmo nome) também não.
 */

type Entrada = [string, FormDataEntryValue | string]

function texto(v: FormDataEntryValue | string): string {
  return typeof v === 'string' ? v : `arquivo:${v.name}:${v.size}`
}

/** Assinatura estável do conteúdo de um formulário. Pura: testável sem DOM. */
export function assinaturaFormulario(entradas: Iterable<Entrada>): string {
  const pares = [...entradas].map(([k, v]) => [k, texto(v)] as const)
  pares.sort((a, b) => (a[0] === b[0] ? (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0) : a[0] < b[0] ? -1 : 1))
  return JSON.stringify(pares)
}

const CHAVE = 'assinaturaGravada'

/** Registra o estado atual como "gravado" (ao abrir e depois de gravar com sucesso). */
export function marcarFormularioGravado(form: HTMLFormElement | null): void {
  if (form) form.dataset[CHAVE] = assinaturaFormulario(new FormData(form))
}

/** Difere do último estado gravado? Formulário nunca marcado = sem alteração conhecida. */
export function formularioAlterado(form: HTMLFormElement | null): boolean {
  if (!form) return false
  const gravada = form.dataset[CHAVE]
  if (gravada === undefined) return false
  return assinaturaFormulario(new FormData(form)) !== gravada
}
