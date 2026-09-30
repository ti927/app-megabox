'use client'

import { BookOpen, FileText, Target, Truck } from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { type Aba, type FiltrosRelatorio, paraQuery } from '@/lib/relatorios'
import { comExtras, type Extras, EXTRAS_VAZIOS, limitesDoMes, mesAnoDe } from '@/lib/relatorios-paineis'

import { AbaCotacao } from './aba-cotacao'
import { AbaOutros } from './aba-outros'
import { AbaProspeccao } from './aba-prospeccao'
import { exportarCsv } from './acoes'
import { DialogoDefinicoes } from './dialogo'
import type { DadosRelatorio, Vendedor } from './tipos'

const ABAS: { id: Aba; rotulo: string; Icone: typeof FileText }[] = [
  { id: 'cotacao', rotulo: 'Relatório de Cotação', Icone: FileText },
  { id: 'prospeccao', rotulo: 'Relatório de Prospecção', Icone: Target },
  { id: 'outros', rotulo: 'Outros Relatórios', Icone: Truck },
]

export function TelaRelatorios({
  filtros,
  extras,
  aviso,
  dados,
  falhou,
  vendedores,
  veTodos,
  porPagina,
  hoje,
  geradoEm,
}: {
  filtros: FiltrosRelatorio
  extras: Extras
  aviso: string | null
  dados: DadosRelatorio
  falhou: boolean
  vendedores: Vendedor[]
  veTodos: boolean
  porPagina: number
  hoje: string
  geradoEm: string
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [ajuda, setAjuda] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [erroExportar, setErroExportar] = useState<string | null>(null)
  const query = comExtras(paraQuery(filtros), extras)
  const { ano, mes } = mesAnoDe(filtros.inicio)
  const anoCorrente = mesAnoDe(hoje).ano

  // Tudo na URL (spec §9.1): aba, período, filtros e página são linkáveis.
  function navegar(mudancas: Partial<FiltrosRelatorio>, novos: Partial<Extras> = EXTRAS_VAZIOS) {
    iniciar(() => {
      router.replace(`/relatorios${comExtras(paraQuery(filtros, mudancas), novos)}` as Route, { scroll: false })
    })
  }

  function atualizar() {
    iniciar(() => router.refresh())
  }

  async function exportar() {
    setExportando(true)
    setErroExportar(null)
    try {
      const r = await exportarCsv(query.slice(1))
      if (!r.ok) {
        setErroExportar(r.erro)
        return
      }
      // O arquivo foi montado no servidor; aqui só se entrega o texto ao navegador.
      const url = URL.createObjectURL(new Blob([r.conteudo], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url
      a.download = r.nome
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="relatorios">
      <header className="rel-topo">
        <h1>Relatórios</h1>
        <button type="button" className="botao-secundario rel-botao-icone" onClick={() => setAjuda(true)}>
          <BookOpen size={16} aria-hidden />
          Como calculamos
        </button>
      </header>

      <nav className="abas rel-abas" role="tablist" aria-label="Relatórios">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={filtros.aba === a.id}
            // Cotação e Prospecção são de um mês (R1): ao entrar nelas o período vira o mês do início.
            onClick={() => navegar(a.id === 'outros' ? { aba: a.id } : { aba: a.id, ...limitesDoMes(ano, mes) })}
          >
            <a.Icone size={16} aria-hidden />
            {a.rotulo}
          </button>
        ))}
      </nav>

      {aviso ? <p className="aviso">{aviso} Mostrando o mês corrente.</p> : null}
      {falhou ? (
        <p className="aviso" data-tom="erro">
          Não foi possível carregar o relatório. Tente de novo.
        </p>
      ) : null}
      {erroExportar ? (
        <p className="aviso" data-tom="erro">
          {erroExportar}
        </p>
      ) : null}
      {!veTodos ? <p className="rel-nota">Você vê apenas os números das suas cotações, propostas e entregas.</p> : null}

      <section className="rel-conteudo" data-teste="relatorio-conteudo" aria-busy={pendente}>
        {dados.aba === 'cotacao' ? (
          <AbaCotacao
            key={query}
            painel={dados.painel}
            detalhe={dados.detalhe}
            totalDetalhe={dados.totalDetalhe}
            pagina={extras.pagina}
            porPagina={porPagina}
            filtro={{ ano, mes, arquivado: filtros.arquivado, vendedor: filtros.vendedor }}
            anoCorrente={anoCorrente}
            vendedores={vendedores}
            veTodos={veTodos}
            geradoEm={geradoEm}
            pendente={pendente}
            aoAplicar={(f) => navegar({ ...limitesDoMes(f.ano, f.mes), arquivado: f.arquivado, vendedor: f.vendedor })}
            aoPaginar={(p) => navegar({}, { pagina: p })}
            aoAtualizar={atualizar}
          />
        ) : dados.aba === 'prospeccao' ? (
          <AbaProspeccao
            painel={dados.painel}
            fotos={dados.fotos}
            filtro={{ ano, mes, vendedor: filtros.vendedor }}
            anoCorrente={anoCorrente}
            vendedores={vendedores}
            veTodos={veTodos}
            geradoEm={geradoEm}
            pendente={pendente}
            aoAplicar={(f) => navegar({ ...limitesDoMes(f.ano, f.mes), vendedor: f.vendedor })}
            aoAtualizar={atualizar}
          />
        ) : (
          <AbaOutros
            key={`${filtros.modelo}-${filtros.inicio}-${filtros.fim}`}
            filtros={filtros}
            extras={extras}
            produtos={dados.modelo === 'produtos' ? dados.produtos : null}
            mes={dados.modelo !== 'produtos' ? dados.mes : null}
            vendedores={vendedores}
            veTodos={veTodos}
            query={query.slice(1)}
            pendente={pendente}
            exportando={exportando}
            aoNavegar={navegar}
            aoExportar={exportar}
          />
        )}
      </section>

      <DialogoDefinicoes aba={filtros.aba} aberto={ajuda} aoFechar={() => setAjuda(false)} />
    </div>
  )
}
