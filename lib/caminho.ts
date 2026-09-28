/**
 * Caminho interno seguro para redirecionar depois do login.
 *
 * Aceita só caminho absoluto DENTRO do app. Recusa `//site.com` (URL sem protocolo, que o
 * navegador resolve para outro domínio) e `/\site.com` (alguns navegadores tratam a barra
 * invertida como barra). Serve à página e à server action: a action é endpoint público e não
 * pode confiar no que a página já filtrou.
 */
export function caminhoInternoSeguro(valor: unknown, padrao = '/inicio'): string {
  if (typeof valor !== 'string') return padrao
  if (!valor.startsWith('/')) return padrao
  if (valor.startsWith('//') || valor.startsWith('/\\')) return padrao
  if (/[\u0000-\u001f]/.test(valor)) return padrao
  return valor
}
