import './relatorios.css'

/** Esqueleto com a forma da tela: abas, cabeçalho, filtros, KPIs e a grade de gráficos. */
export default function Carregando() {
  return (
    <div className="relatorios" aria-busy="true" aria-label="Carregando relatórios">
      <div className="esqueleto" style={{ height: '2rem', width: '12rem' }} />
      <div className="esqueleto" style={{ height: '2.75rem' }} />
      <div className="rel-painel">
        <div className="esqueleto" style={{ height: '3rem', width: '22rem' }} />
        <div className="esqueleto" style={{ height: '5rem' }} />
        <div className="rel-kpis rel-kpis-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="esqueleto" style={{ height: '6rem' }} />
          ))}
        </div>
        <div className="rel-graficos-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="esqueleto" style={{ height: '16rem' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
