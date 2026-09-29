import type { LucideIcon } from 'lucide-react'

/**
 * Ícone do app. Biblioteca única: lucide-react (traço 2 px, grade de 24). Nunca emoji nem
 * glifo de texto (☰ ⚙ ✕ ▾ 🏆): não obedecem à paleta nem ao tema, e cada sistema os desenha
 * de um jeito. Regras em design/sistema-visual.md, "Ícones".
 *
 * - Decorativo por padrão (`aria-hidden`): o texto ao lado já diz o que é.
 * - Botão só com ícone: o NOME vai no botão (`aria-label`), não aqui.
 * - Ícone que é a única informação (fora de botão): passe `rotulo`.
 * - Cor: herda `currentColor` — pinte o elemento pai com um token.
 */
export function Icone({
  icone: Componente,
  tamanho = 18,
  rotulo,
  className,
}: {
  icone: LucideIcon
  tamanho?: 14 | 16 | 18 | 20 | 24
  rotulo?: string
  className?: string
}) {
  return (
    <Componente
      width={tamanho}
      height={tamanho}
      strokeWidth={2}
      absoluteStrokeWidth
      className={['icone', className].filter(Boolean).join(' ')}
      focusable="false"
      {...(rotulo ? { role: 'img', 'aria-label': rotulo } : { 'aria-hidden': true })}
    />
  )
}
