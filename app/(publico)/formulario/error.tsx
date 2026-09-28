'use client'

import { AvisoPesquisa } from './aviso'

/**
 * Falha ao abrir (banco fora, por exemplo). Mensagem genérica, sem detalhe do erro e sem
 * log no navegador: o erro não carrega o token, mas também não precisa ser mostrado.
 */
export default function ErroFormulario({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <AvisoPesquisa resultado="erro" />
      <button type="button" className="botao-secundario pesq-enviar" onClick={reset}>
        Tentar de novo
      </button>
    </>
  )
}
