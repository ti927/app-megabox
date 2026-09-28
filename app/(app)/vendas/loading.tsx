import './vendas.css'

/** Esqueleto com a forma do quadro, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="vendas" aria-busy="true" aria-label="Carregando o fluxo de vendas">
      <div className="esqueleto" style={{ height: '4.5rem' }} />
      <div className="kanban">
        {Array.from({ length: 4 }, (_, c) => (
          <section key={c} className="coluna">
            <div className="esqueleto" style={{ height: '3rem' }} />
            <div className="coluna-corpo">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="esqueleto" style={{ height: '6.5rem' }} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
