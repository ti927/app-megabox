import Image from 'next/image'

/**
 * Logo oficial do Grupo MegaBox (public/marca/, origem em public/marca/LEIA-ME.md).
 *
 * Duas imagens, uma por tema: a do site oficial (letreiro cinza, cubo roxo) no claro e uma
 * variante derivada dela (letreiro quase branco, cubo roxo claro) no escuro — o cinza #4B4B4D
 * sobre preto some. Qual aparece é decidido no CSS (`.marca-claro` / `.marca-escuro` em
 * estilos/componentes.css), que segue `data-tema` e `prefers-color-scheme` como o resto do tema.
 *
 * `tamanho` é a ALTURA em px; a largura sai da proporção do recorte (394 × 106).
 */
const LARGURA = 394
const ALTURA = 106

export function Marca({
  className,
  tamanho = 36,
  prioridade = false,
}: {
  className?: string
  tamanho?: number
  prioridade?: boolean
}) {
  const largura = Math.round((tamanho * LARGURA) / ALTURA)
  return (
    <span className={['marca', className].filter(Boolean).join(' ')}>
      <Image
        src="/marca/logo-megabox-claro.png"
        alt="Grupo MegaBox"
        width={largura}
        height={tamanho}
        priority={prioridade}
        className="marca-claro"
      />
      <Image
        src="/marca/logo-megabox-escuro.png"
        alt="Grupo MegaBox"
        width={largura}
        height={tamanho}
        priority={prioridade}
        className="marca-escuro"
      />
    </span>
  )
}
