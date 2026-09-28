import './sac.css'

/** Esqueleto com a forma da tela, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="sac" aria-busy="true" aria-label="Carregando o SAC">
      <div className="esqueleto" style={{ height: '2.25rem', width: '14rem' }} />
      <div className="esqueleto" style={{ height: '2rem', width: '20rem' }} />
      <div className="esqueleto" style={{ height: '6rem' }} />
      <ol className="sac-lista">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <div className="esqueleto" style={{ height: '3.75rem' }} />
          </li>
        ))}
      </ol>
    </div>
  )
}
