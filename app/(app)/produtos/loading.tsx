import './produtos.css'

/** Esqueleto com a forma da tela, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="produtos" aria-busy="true" aria-label="Carregando produtos">
      <div className="esqueleto" style={{ height: '2rem', width: '16rem' }} />
      <div className="esqueleto" style={{ height: '4.25rem' }} />
      <div className="esqueleto" style={{ height: '2.25rem' }} />
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="esqueleto" style={{ height: '3.25rem' }} />
      ))}
    </div>
  )
}
