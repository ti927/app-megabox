'use client'

import { useEffect, useRef } from 'react'

import type { Aba } from '@/lib/relatorios'

/**
 * "Como calculamos" — as definições de cada número da aba aberta. No Bubble as fórmulas
 * moravam dentro de ~160 KB de JavaScript em bloco HTML, invisíveis a quem lia o relatório;
 * aqui estão escritas na 017 (D1, D7, D8) e repetidas para quem usa.
 */
const DEFINICOES: Record<Aba, { titulo: string; itens: [string, string][] }> = {
  outros: {
    titulo: 'Relatórios de entrega',
    itens: [
      ['Quais entregas', 'Só as faturadas (etapa "Financeiro") com data de entrega dentro do período — a mesma regra do sistema atual.'],
      ['Cliente e fornecedor', 'A filial de destino (cliente) e a filial de origem (fornecedor) do orçamento vencedor; a UF é a do cadastro da filial.'],
      ['Comissão', 'Comissão MegaBox da entrega: quantidade × comissão unitária, arredondada a centavos.'],
      ['Venda bruta', 'Quantidade × valor de venda unitário da entrega, arredondada a centavos.'],
      ['Médias unitárias', 'Soma do valor ÷ soma da quantidade do grupo.'],
      ['Totais', 'Calculados pelo banco na mesma consulta — a tela não soma nada.'],
    ],
  },
  cotacao: {
    titulo: 'Relatório de cotação',
    itens: [
      ['Quais cotações', 'As criadas no período (fuso de São Paulo), sem rascunhos.'],
      ['Em cotação', 'Etapa "Cotação" e não arquivada.'],
      ['Virou pedido', 'Cotação que passou para "Pedir" ou adiante.'],
      ['Taxa de conversão', 'Virou pedido ÷ total de cotações do período.'],
      ['Faturamento', 'Venda bruta dos orçamentos vencedores das cotações que viraram pedido.'],
      ['Ticket médio', 'Faturamento ÷ cotações que viraram pedido.'],
      ['Tempo de fechamento', 'Média de dias entre a criação da cotação e o primeiro pedido dela.'],
      ['Período anterior', 'A mesma taxa no período imediatamente anterior, de mesmo tamanho.'],
    ],
  },
  prospeccao: {
    titulo: 'Relatório de prospecção',
    itens: [
      ['Enviadas', 'Propostas marcadas como enviadas, pela data de envio.'],
      ['Clientes', 'Clientes diferentes que receberam proposta.'],
      ['Carteira', 'Clientes ativos que têm o vendedor como carteira (hoje).'],
      ['Cobertura', 'Clientes da carteira que receberam proposta ÷ carteira.'],
      ['Média/dia', 'Propostas enviadas ÷ dias úteis (segunda a sexta) do período.'],
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
          ×
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
