'use server'

import { exigirAcesso } from '@/lib/autorizacao'
import { hojeSaoPaulo, lerFiltros, paraCsv, rotuloMes } from '@/lib/relatorios'
import { clienteServidor } from '@/lib/supabase/servidor'

import type { LinhaMes, LinhaProduto } from './tipos'

export type ResultadoCsv = { ok: true; nome: string; conteudo: string } | { ok: false; erro: string }

/**
 * CSV dos relatórios de entrega, gerado NO SERVIDOR a partir das mesmas funções SQL da tela
 * (spec §9.1/§9.3, [DÚVIDA 2]). Recebe a query string da tela e a relê como se fosse a URL:
 * nada do navegador é confiado, e a RLS de quem pede decide o conteúdo.
 */
export async function exportarCsv(query: string): Promise<ResultadoCsv> {
  const usuario = await exigirAcesso('relatorios')
  const { filtros, aviso } = lerFiltros(Object.fromEntries(new URLSearchParams(query)), hojeSaoPaulo())
  if (aviso) return { ok: false, erro: aviso }
  if (filtros.aba !== 'outros') return { ok: false, erro: 'Exportação existe só em "Outros relatórios".' }
  if (!usuario.ehGerenciaOuAcima) filtros.vendedor = null

  const supabase = await clienteServidor()
  const args = { p_inicio: filtros.inicio, p_fim: filtros.fim, p_vendedor: filtros.vendedor }
  const sufixo = `${filtros.inicio}_${filtros.fim}`

  if (filtros.modelo === 'produtos') {
    const { data, error } = await supabase.rpc('fn_rel_entregas_produto', args)
    if (error) return { ok: false, erro: 'Não foi possível gerar o arquivo.' }
    const linhas = ((data ?? []) as LinhaProduto[]).map((l) => [
      l.nivel === 2 ? 'TOTAL' : l.nivel === 1 ? `SUBTOTAL ${l.produto ?? ''}` : l.produto,
      l.fornecedor,
      l.cliente,
      l.uf_destino,
      String(l.qtd),
      String(l.valor_venda_bruto),
      String(l.valor_comissao),
      l.venda_unit_media === null ? null : String(l.venda_unit_media),
      l.comissao_unit_media === null ? null : String(l.comissao_unit_media),
      String(l.qtd_entregas),
    ])
    const cab = ['Produto', 'Fornecedor', 'Cliente', 'UF destino', 'Quantidade', 'Venda bruta', 'Comissão',
      'Venda unit. média', 'Comissão unit. média', 'Entregas']
    return { ok: true, nome: `relatorio-produtos_${sufixo}.csv`, conteudo: paraCsv(cab, linhas) }
  }

  const fn = filtros.modelo === 'clientes' ? 'fn_rel_entregas_cliente_mes' : 'fn_rel_entregas_fornecedor_mes'
  const { data, error } = await supabase.rpc(fn, args)
  if (error) return { ok: false, erro: 'Não foi possível gerar o arquivo.' }
  // Formato longo (uma linha por célula), que é o que planilha filtra e pivota sem esforço.
  const linhas = ((data ?? []) as LinhaMes[]).map((l) => [
    l.nivel >= 2 ? 'TOTAL' : l.nome,
    l.nivel >= 2 ? null : l.uf,
    l.mes ? rotuloMes(l.mes) : 'TOTAL',
    String(l.qtd),
    String(l.valor_venda_bruto),
    String(l.valor_comissao),
    String(l.qtd_entregas),
  ])
  const eixo = filtros.modelo === 'clientes' ? 'Cliente' : 'Fornecedor'
  const cab = [eixo, 'UF', 'Mês', 'Quantidade', 'Venda bruta', 'Comissão', 'Entregas']
  return { ok: true, nome: `relatorio-${filtros.modelo}-mes_${sufixo}.csv`, conteudo: paraCsv(cab, linhas) }
}
