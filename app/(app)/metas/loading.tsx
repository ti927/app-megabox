import './metas.css'

/** Esqueleto com a forma da tela (topo, pódio + lateral, tabela), para não "pular" na chegada. */
export default function Carregando() {
  return (
    <div className="metas" aria-busy="true" aria-label="Carregando metas">
      <div className="metas-topo">
        <div className="esqueleto" style={{ height: '2.5rem', width: '32rem', maxWidth: '100%' }} />
        <div className="esqueleto" style={{ height: '2.5rem', width: '10rem' }} />
      </div>
      <div className="metas-painel">
        <div className="esqueleto" style={{ height: '26rem' }} />
        <div className="metas-lateral">
          <div className="esqueleto" style={{ height: '12rem' }} />
          <div className="esqueleto" style={{ height: '12rem' }} />
        </div>
      </div>
      <div className="esqueleto" style={{ height: '24rem' }} />
    </div>
  )
}
