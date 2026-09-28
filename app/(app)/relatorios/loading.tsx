import './relatorios.css'

/** Esqueleto com a forma da tela: abas, filtros e a tabela. */
export default function Carregando() {
  return (
    <div className="relatorios" aria-busy="true" aria-label="Carregando relatórios">
      <div className="esqueleto" style={{ height: '2rem', width: '12rem' }} />
      <div className="esqueleto" style={{ height: '2.5rem' }} />
      <div className="esqueleto" style={{ height: '5.5rem' }} />
      <div className="esqueleto" style={{ height: '20rem' }} />
    </div>
  )
}
