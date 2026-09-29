import { CircleCheck, Clock, Link2Off, type LucideIcon, TriangleAlert } from 'lucide-react'

import { Icone } from '@/componentes/icone'
import { MENSAGENS, type ResultadoEnvio } from '@/lib/formulario-publico'

/** Ícone decorativo de cada estado final; o título ao lado já diz o que houve. */
const ICONES: Record<ResultadoEnvio, LucideIcon> = {
  ok: CircleCheck,
  respondido: CircleCheck,
  expirado: Clock,
  invalido: Link2Off,
  dados_invalidos: TriangleAlert,
  limite: TriangleAlert,
  erro: TriangleAlert,
}

/**
 * Estado final do formulário: agradecimento, já respondida, expirado, link inválido.
 * Sem hooks: serve à página (servidor) e à tela (cliente, depois do envio).
 */
export function AvisoPesquisa({ resultado }: { resultado: ResultadoEnvio }) {
  const { titulo, texto } = MENSAGENS[resultado]
  return (
    <section className="pesq-aviso" data-resultado={resultado} data-teste="pesq-aviso" aria-live="polite">
      <span className="pesq-aviso-icone">
        <Icone icone={ICONES[resultado]} tamanho={24} />
      </span>
      <h1>{titulo}</h1>
      <p>{texto}</p>
    </section>
  )
}
