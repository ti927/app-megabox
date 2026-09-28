import './rotinas.css'

/** Esqueleto com a forma da tela, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="rotinas" aria-busy="true" aria-label="Carregando rotinas">
      <div className="esqueleto" style={{ height: '2rem', width: '18rem' }} />
      <div className="rotinas-catalogo">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="esqueleto" style={{ height: '11rem' }} />
        ))}
      </div>
      <div className="esqueleto" style={{ height: '16rem' }} />
    </div>
  )
}
