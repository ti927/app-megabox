'use client'

import './fluxo.css'

/*
 * Proposta → pedido → entregas, dentro da ficha da cotação (specs/paginas/vendas.md §2.8,
 * §2.9, §2.10; vendas-reusables.md §2.1). A ficha (cotacao.tsx) hospeda as duas abas por aqui.
 *
 * Desde 30/09 cada aba é UMA tela (a "mesa"): o documento ao vivo à esquerda e tudo o que o
 * vendedor faz à direita, sem diálogo por cima da ficha — ver vendas.md §2.8/§2.9 "Tela única".
 *   - proposta-tela.tsx  — lista, rascunho e envio da proposta; "Transformar em pedido"
 *   - pedido-tela.tsx    — e-mails, condições de pagamento (pagamento.tsx), OC e envio
 *   - entregas.tsx       — entregas por item, com NF/saída e cancelamento na própria linha
 *   - documento.tsx      — o documento (proposta e pedido), com o rascunho marcado
 * As server actions continuam em acoes-fluxo.ts, com as mesmas regras.
 */

export { AbaPedidos } from './pedido-tela'
export { AbaPropostas } from './proposta-tela'
