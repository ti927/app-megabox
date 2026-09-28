import './cadastros.css'

/** Esqueleto com a forma da tela, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="cadastros" aria-busy="true" aria-label="Carregando cadastros">
      <div className="esqueleto" style={{ height: '2rem', width: '16rem' }} />
      <div className="esqueleto" style={{ height: '5.5rem' }} />
      <ol className="clifor-lista">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <div className="esqueleto" style={{ height: '4.5rem' }} />
          </li>
        ))}
      </ol>
    </div>
  )
}
