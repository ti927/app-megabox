import './cadastros.css'

/** Esqueleto com a forma da tela, para a página não "pular" quando o conteúdo chega. */
export default function Carregando() {
  return (
    <div className="cadastros" aria-busy="true" aria-label="Carregando cadastros">
      <div className="esqueleto" style={{ height: '2rem', width: '22rem' }} />
      <div className="esqueleto" style={{ height: '4rem' }} />
      <div className="clifor-tabela">
        <div className="clifor-cabeca" />
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ padding: 'var(--e2) var(--e3)' }}>
            <div className="esqueleto" style={{ height: '2.25rem' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
