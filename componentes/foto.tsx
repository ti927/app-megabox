'use client'

import { useState } from 'react'

const PREENCHE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
}

/**
 * Foto de arquivo privado (URL assinada de vida curta) com recaída para as iniciais.
 *
 * `<img>` e não `next/image` de propósito: o otimizador do Next buscaria a URL assinada e
 * guardaria o resultado em cache além da validade dela, servindo o arquivo a quem pedir a
 * URL otimizada — exatamente o que o bucket privado existe para impedir.
 * Sem URL, ou se ela falhar (expirou, objeto sumiu), mostra as iniciais.
 * A imagem preenche o contêiner (a classe de quem usa dá tamanho e forma) e herda o raio,
 * então serve para círculo e quadrado sem CSS novo. O contêiner recebe `data-foto`.
 */
export function Foto({
  url,
  nome,
  className,
  iniciais,
}: {
  url: string | null | undefined
  nome: string
  className: string
  iniciais: string
}) {
  // Guarda QUAL url falhou: uma url nova (a página recarregou) tenta de novo.
  const [falhou, setFalhou] = useState<string | null>(null)
  if (!url || falhou === url) {
    return (
      <span className={className} aria-hidden="true">
        {iniciais}
      </span>
    )
  }
  return (
    <span className={className} data-foto="" title={nome}>
      {/* alt vazio: a foto sempre acompanha o nome escrito ao lado — é decorativa. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada privada: ver acima */}
      <img src={url} alt="" loading="lazy" decoding="async" style={PREENCHE} onError={() => setFalhou(url)} />
    </span>
  )
}
