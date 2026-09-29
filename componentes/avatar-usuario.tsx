'use client'

import { useEffect, useState } from 'react'

import { urlMinhaFoto } from './acoes-avatar'
import { Foto } from './foto'

/**
 * Avatar do cabeçalho: iniciais na hora, foto quando a URL assinada chega. Pede UMA vez por
 * carga da casca (o layout não remonta ao navegar entre páginas), sem segurar a renderização
 * do servidor. Falhou ou não tem foto: continua nas iniciais.
 */
export function AvatarUsuario({ nome, iniciais }: { nome: string; iniciais: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    urlMinhaFoto()
      .then((u) => {
        if (vivo) setUrl(u)
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  return <Foto url={url} nome={nome} className="avatar" iniciais={iniciais} />
}
