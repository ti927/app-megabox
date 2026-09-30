import './financeiro.css'

/** Esqueleto com a forma da tela, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="financeiro" aria-busy="true" aria-label="Carregando o fluxo financeiro">
      <div className="esqueleto" style={{ height: '2.5rem', width: '22rem', maxWidth: '100%' }} />
      <div className="esqueleto" style={{ height: '4rem' }} />
      <div className="esqueleto" style={{ height: '8rem' }} />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="esqueleto" style={{ height: '4.5rem' }} />
      ))}
      <div className="esqueleto" style={{ height: '3.5rem' }} />
    </div>
  )
}
