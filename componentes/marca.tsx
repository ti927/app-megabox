/**
 * Marca "megabox": cubo roxo em perspectiva + nome em minúsculas, como no cabeçalho do
 * app Bubble (specs/bubble/02-telas-e-design.md, "Elementos globais"). Desenhada em SVG
 * com tokens: acompanha o tema claro/escuro sem arquivo de imagem.
 */
export function Marca({ className, tamanho = 28 }: { className?: string; tamanho?: number }) {
  return (
    <span className={['marca', className].filter(Boolean).join(' ')}>
      <svg
        viewBox="0 0 32 32"
        width={tamanho}
        height={tamanho}
        aria-hidden="true"
        focusable="false"
        className="marca-cubo"
      >
        <path
          d="M16 3 28 9.5v13L16 29 4 22.5v-13L16 3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M4.6 9.8 16 16l11.4-6.2M16 16v12.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M10 13.2v6.6l3.4 1.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="21.6" cy="18.6" r="1.8" fill="currentColor" />
      </svg>
      <span className="marca-nome">megabox</span>
    </span>
  )
}
