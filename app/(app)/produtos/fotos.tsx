'use client'

import { startTransition, useActionState, useState } from 'react'

import { aceitos, conferirEnvio } from '@/lib/arquivos-envio'
import { FOTOS_PRODUTO } from '@/lib/produtos-fotos'

import { trocarFotoProduto } from './acoes-fotos'
import type { EstadoAcao, Ficha } from './tipos'

/*
 * Aba "Fotos" da ficha do produto — os quatro PictureInput do `pop.CadastroProdutos`
 * (Superior, Inferior, Frontal, Lateral). Cada foto se troca sozinha, por upload; no Bubble
 * não há "remover foto", e aqui também não.
 * As URLs vêm assinadas do servidor (vida curta), só as deste produto.
 */

const ACEITOS = aceitos('produtos')

function QuadroFoto({
  produtoId,
  chave,
  rotulo,
  url,
}: {
  produtoId: string
  chave: string
  rotulo: string
  url: string | undefined
}) {
  const [estado, trocar, trocando] = useActionState(trocarFotoProduto, {})
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const mostrado: EstadoAcao = erroLocal ? { erro: erroLocal } : estado

  return (
    <li className="pf-foto" data-teste={`foto-${chave}`}>
      <span className="pf-foto-rotulo">{rotulo}</span>
      {url ? (
        <span className="pf-foto-quadro" data-foto="">
          {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada privada (componentes/foto.tsx) */}
          <img src={url} alt={rotulo} loading="lazy" decoding="async" />
        </span>
      ) : (
        <span className="pf-foto-quadro">Sem foto</span>
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const dados = new FormData(e.currentTarget)
          const arquivo = dados.get('arquivo')
          if (!(arquivo instanceof File) || arquivo.size === 0) return setErroLocal('Escolha a imagem.')
          const v = conferirEnvio('produtos', { nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size })
          if (!v.ok) return setErroLocal(v.erro)
          setErroLocal(null)
          startTransition(() => trocar(dados))
        }}
      >
        <input type="hidden" name="produto_id" value={produtoId} />
        <input type="hidden" name="foto" value={chave} />
        <label className="so-leitor" htmlFor={`arquivo-${chave}`}>
          Arquivo da {rotulo.toLowerCase()}
        </label>
        <input id={`arquivo-${chave}`} type="file" name="arquivo" accept={ACEITOS} disabled={trocando} />
        <button type="submit" className="botao-secundario" disabled={trocando} aria-busy={trocando}>
          {trocando ? 'Enviando…' : url ? 'Trocar foto' : 'Enviar foto'}
        </button>
      </form>
      {mostrado.erro ? (
        <p className="aviso" data-tom="erro" role="alert">
          {mostrado.erro}
        </p>
      ) : mostrado.ok ? (
        <p className="aviso" data-tom="ok" role="status">
          {mostrado.ok}
        </p>
      ) : null}
    </li>
  )
}

export function AbaFotos({ ficha }: { ficha: Ficha }) {
  return (
    <div className="pf-secao">
      <ul className="pf-fotos" data-teste="fotos-produto">
        {FOTOS_PRODUTO.map((f) => (
          <QuadroFoto
            key={f.chave}
            produtoId={ficha.produto.id}
            chave={f.chave}
            rotulo={f.rotulo}
            url={ficha.fotos[f.chave]}
          />
        ))}
      </ul>
      <p className="pf-nota">JPG, PNG, WEBP ou GIF.</p>
    </div>
  )
}
