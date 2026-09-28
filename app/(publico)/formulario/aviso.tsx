import { MENSAGENS, type ResultadoEnvio } from '@/lib/formulario-publico'

/**
 * Estado final do formulário: agradecimento, já respondida, expirado, link inválido.
 * Sem hooks: serve à página (servidor) e à tela (cliente, depois do envio).
 */
export function AvisoPesquisa({ resultado }: { resultado: ResultadoEnvio }) {
  const { titulo, texto } = MENSAGENS[resultado]
  return (
    <section className="pesq-aviso" data-resultado={resultado} data-teste="pesq-aviso" aria-live="polite">
      <h1>{titulo}</h1>
      <p>{texto}</p>
    </section>
  )
}
