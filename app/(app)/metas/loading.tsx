import './metas.css'

/** Esqueleto com a forma da tela, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="metas" aria-busy="true" aria-label="Carregando metas">
      <div className="esqueleto" style={{ height: '2.5rem', width: '16rem' }} />
      <div className="esqueleto" style={{ height: '4.5rem' }} />
      <div className="metas-painel-topo">
        <div className="esqueleto" style={{ height: '12rem' }} />
        <div className="esqueleto" style={{ height: '12rem' }} />
      </div>
      <ol className="mt-painel">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i}>
            <div className="esqueleto" style={{ height: '4.5rem' }} />
          </li>
        ))}
      </ol>
    </div>
  )
}
