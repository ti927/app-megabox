-- =====================================================================================
-- 024_proposta_documento.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Itens do DOCUMENTO da proposta (a pré-visualização à esquerda da aba Propostas —
-- vendas.md §2.8 `gp exibe proposta`, mapa bTacv `rpg itens orcamento`). Uma view, só leitura.
-- Depende de 003, 006, 007 e 008. Nenhuma tabela, policy, função ou GRANT de escrita.
--
-- >>> DECISÕES <<<
--   D1. VALORES DO SNAPSHOT. qtd, preço unitário e frete vêm de `proposta_itens` (008 D1):
--       reabrir uma proposta antiga mostra o que o cliente recebeu, não o orçamento de hoje
--       (no Bubble mostrava o de hoje — 02 §1.6).
--   D2. VALOR TOTAL BRUTO do item = round(qtd × unit + frete, 2), a MESMA fórmula de
--       `v_kanban_pedidos.valor_total` (015 D4): o frete do snapshot já é o efetivo (só CIF
--       Informado tem valor). `total_proposta` é a soma desses por proposta — o
--       "VALOR TOTAL BRUTO" do cabeçalho da tabela no Bubble (bTehB). O navegador só formata.
--   D3. PREÇO UNITÁRIO LÍQUIDO = (bruto − ICMS − PIS/COFINS) ÷ qtd, 6 casas — a fórmula de
--       `v_orcamento_valores.valor_unit_liquido` (007 D3), aplicada ao snapshot. As ALÍQUOTAS
--       não fazem parte do snapshot (008): vêm do orçamento, que não muda depois de proposta
--       enviada na prática (a tela de cotação trava o carrinho com proposta). Se um dia
--       precisarem ser congeladas, entram como colunas de `proposta_itens`.
--   D4. PREÇO UNITÁRIO BRUTO = `valor_venda_unit` (sem frete), como na proposta EXIBIDA e no
--       pedido do Bubble (vendas.md §5.2; a divergência com a "nova" segue em [DÚVIDA]).
--   D5. A janela particiona por (cotacao_id, proposta_id): o filtro `cotacao_id = …` da ficha
--       desce até as tabelas (predicado só em coluna de partição), em vez de a view somar a
--       base inteira antes de filtrar.
--   D6. security_invoker = true: respeita a RLS de proposta_itens, orcamentos_fornecedor,
--       produtos e enderecos_clifor. Nunca definer (004).
-- =====================================================================================

create view public.v_proposta_documento_itens
with (security_invoker = true) as
select pi.id,
       pi.proposta_id,
       o.cotacao_id,
       pi.criado_em,
       pi.qtd,
       pi.valor_venda_unit,
       pi.valor_frete,
       o.aliquota_icms,
       o.aliquota_pis_cofins,
       o.medida,
       pr.nome  as produto_nome,
       cp.nome  as condicao_nome,
       lp.nome  as linha_nome,
       tf.nome  as frete_nome,
       fo.nome  as fornecedor_nome,
       de.municipio as destino_municipio,
       de.uf        as destino_uf,
       round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2)            as valor_total_bruto,
       round((round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2)
              - round(pi.qtd * pi.valor_venda_unit * o.aliquota_icms, 2)
              - round(pi.qtd * pi.valor_venda_unit * o.aliquota_pis_cofins, 2)) / pi.qtd, 6)
                                                                          as valor_unit_liquido,
       sum(round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2))
         over (partition by o.cotacao_id, pi.proposta_id)                 as total_proposta
from public.proposta_itens pi
join public.orcamentos_fornecedor o      on o.id = pi.orcamento_fornecedor_id
left join public.produtos pr             on pr.id = o.produto_id
left join public.condicoes_produto cp    on cp.id = o.condicao_id
left join public.linhas_produto lp       on lp.id = o.linha_id
left join public.tipos_frete tf          on tf.id = o.tipo_frete_id
left join public.grupos_clifor fo        on fo.id = o.fornecedor_id
left join public.enderecos_clifor de     on de.id = o.endereco_destino_id;

comment on view public.v_proposta_documento_itens is
  'Itens do documento da proposta (vendas.md §2.8, bTacv): snapshot de proposta_itens + '
  'descrição, destino e alíquotas do orçamento; valor_total_bruto e total_proposta com a fórmula '
  'de v_kanban_pedidos (015 D4); valor_unit_liquido com a de v_orcamento_valores (007 D3). '
  'security_invoker = true.';

revoke all on public.v_proposta_documento_itens from anon;
grant select on public.v_proposta_documento_itens to authenticated;
