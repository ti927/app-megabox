/**
 * Como o aviso de ação (componentes/aviso-acao.tsx) lê o resultado de uma action: o
 * `EstadoAcao` das telas (`{ erro?, ok? }`). Puro, para o teste.
 *
 * - `erro` não vazio → aviso vermelho com a mensagem;
 * - senão "Pronto": o texto explícito da chamada, o `ok` da action ou "Pronto";
 * - `pronto: false` → o aviso some sem "Pronto" (ação cujo efeito já está na tela).
 */
export function resultadoDoAviso(
  resultado: unknown,
  pronto: string | false | undefined,
): { erro: string | null; pronto: string | false } {
  const r = (resultado && typeof resultado === 'object' ? resultado : {}) as { erro?: unknown; ok?: unknown }
  if (typeof r.erro === 'string' && r.erro.trim() !== '') return { erro: r.erro, pronto: false }
  if (pronto === false) return { erro: null, pronto: false }
  if (typeof pronto === 'string') return { erro: null, pronto }
  if (typeof r.ok === 'string' && r.ok.trim() !== '') return { erro: null, pronto: r.ok }
  return { erro: null, pronto: 'Pronto' }
}
