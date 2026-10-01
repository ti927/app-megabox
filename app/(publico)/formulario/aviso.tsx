import { CircleCheck, Clock, Link2Off, type LucideIcon, Mail, TriangleAlert } from 'lucide-react'

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

/** Estados em que o cliente fica sem caminho: a tela diz a quem recorrer (L2). */
const PEDE_CONTATO: ResultadoEnvio[] = ['invalido', 'expirado', 'erro', 'limite']

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
      {PEDE_CONTATO.includes(resultado) ? (
        // Orientação sem dado nenhum: nem telefone, nem e-mail, nem nome — a página não pode
        // confirmar que um convite existe (db/013), então só aponta o canal que o cliente já tem.
        <div className="pesq-contato" data-teste="pesq-contato">
          <Icone icone={Mail} tamanho={20} />
          <p>
            <strong>Precisa de ajuda?</strong> Responda ao e-mail em que recebeu este link ou fale com o seu contato
            comercial na MegaBox; se for preciso, enviamos um link novo.
          </p>
        </div>
      ) : null}
    </section>
  )
}
