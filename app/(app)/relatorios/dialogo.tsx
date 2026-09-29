'use client'

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { Aba } from '@/lib/relatorios'

/**
 * "Como calculamos": as definições de cada número da aba aberta. São as fórmulas dos blocos HTML
 * do Bubble (achados no export bruto), escritas na 021 (R1–R9, O1–O3) e repetidas para quem usa.
 */
const DEFINICOES: Record<Aba, { titulo: string; itens: [string, string][] }> = {
  outros: {
    titulo: 'Relatórios de entrega',
    itens: [
      ['Quais entregas', 'Só as faturadas (etapa "Financeiro") com data de entrega dentro do período.'],
      ['Cliente e fornecedor', 'A filial de destino (cliente) e a filial de origem (fornecedor) do orçamento vencedor; a UF é a do cadastro da filial.'],
      ['Por produto', 'Uma linha por produto, com os fornecedores, UFs e clientes que entraram. Os filtros das colunas valem entrega a entrega, antes de somar; a UF é exata, os outros "contêm" o texto.'],
      ['Cliente/Fornecedor × Mês', 'Uma coluna por mês do período. Os filtros de nome e UF escolhem as linhas, e o total geral é o das linhas que ficaram.'],
      ['Comissão e venda', 'Comissão MegaBox e venda bruta da entrega (quantidade × unitário), arredondadas a centavos.'],
      ['Detalhamento', 'Clicar num valor abre as entregas que o compõem, com link para a cotação.'],
      ['Totais', 'Calculados pelo banco na mesma consulta — a tela não soma nada.'],
    ],
  },
  cotacao: {
    titulo: 'Relatório de cotação',
    itens: [
      ['Quais cotações', 'As criadas no mês escolhido (fuso de São Paulo), sem rascunhos, com os filtros de Arquivado e Vendedor.'],
      ['Em cotação', 'Etapa "Cotação", arquivada ou não.'],
      ['Virou pedido', 'Etapa "Pedir".'],
      ['Taxa de conversão', 'Pedidos não arquivados ÷ cotações não arquivadas (cotações ativas).'],
      ['Melhor vendedor', 'Maior faturamento, maior número de cotações e melhor conversão entre quem tem ao menos 3 cotações ativas.'],
      ['Faturamento e ticket', 'Venda bruta dos orçamentos vencedores das cotações em "Pedir"; ticket = média entre as que têm valor.'],
      ['Tempo de fechamento', 'Média de dias entre a criação da cotação e o primeiro pedido dela.'],
      ['Ao longo do tempo', 'Conversão de cada mês, de janeiro ao mês escolhido, só com o filtro de vendedor; a comparação é com o mês anterior, em pontos percentuais.'],
    ],
  },
  prospeccao: {
    titulo: 'Relatório de prospecção',
    itens: [
      ['Enviadas', 'Propostas marcadas como enviadas, pela data de criação, no mês escolhido.'],
      ['Clientes', 'Clientes diferentes que receberam proposta E estão na carteira do próprio vendedor.'],
      ['Carteira', 'Clientes que têm o vendedor como carteira (hoje).'],
      ['Cobertura', 'Clientes prospectados ÷ carteira. Na linha, verde a partir de 70% e vermelho abaixo de 30%.'],
      ['Média/dia', 'Enviadas ÷ dias úteis (segunda a sexta) do mês; no mês corrente, os dias úteis até hoje.'],
      ['Ranking', 'Só vendedores com proposta no mês, por enviadas e depois por cobertura.'],
    ],
  },
}

export function DialogoDefinicoes({ aba, aberto, aoFechar }: { aba: Aba; aberto: boolean; aoFechar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) d.showModal()
    if (!aberto && d.open) d.close()
  }, [aberto])

  const def = DEFINICOES[aba]
  return (
    <dialog ref={ref} className="dialogo rel-dialogo" onClose={aoFechar} aria-labelledby="rel-def-titulo">
      <header className="dialogo-cabecalho">
        <h2 id="rel-def-titulo">Como calculamos — {def.titulo}</h2>
        <button type="button" className="dialogo-fechar" onClick={aoFechar} aria-label="Fechar">
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className="dialogo-corpo">
        <dl className="rel-definicoes">
          {def.itens.map(([termo, texto]) => (
            <div key={termo}>
              <dt>{termo}</dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  )
}
