-- =====================================================================================
-- 029_pedido_saldo_rateio.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Duas leituras para a tela nova de PEDIDO (fluxo da ficha de vendas, vendas.md §2.9):
--   1. `v_pedido_item_saldo` — por item do pedido, o vendido, o já distribuído em entregas e
--      o que FALTA, em quantidade E em dinheiro (qtd, bruto, comissão, líquido). É o rodapé
--      da sub-tabela de entregas do Bubble ("Qtd entrega: soma / Falta", "Comissão soma /
--      Falta", "Valor bruto soma / Falta", "Valor líq soma / Falta" — vendas.md §2.9, §5.4).
--   2. `fn_rateio_prazos(pedido, prazos[])` — a PRÉVIA do rateio das condições de pagamento:
--      uma linha por prazo, na ordem e com o valor que `fn_gerar_contas_receber` (010) usaria,
--      sobre o total do pedido. Só leitura: a geração de verdade continua na confirmação.
-- Depende de 003, 007, 008, 009, 010 (fn_valor_parcela) e 015 (v_kanban_pedidos).
-- Nenhuma tabela, policy ou GRANT de escrita.
--
-- >>> DECISÕES <<<
--   D1. O ITEM é o SNAPSHOT de proposta_itens (008 D1): bruto = round(qtd × unit + frete, 2),
--       a fórmula de v_proposta_documento_itens (024 D2) e de v_kanban_pedidos (015 D4);
--       comissão = round(qtd × comissão unit, 2), a de orcamentos_fornecedor (007);
--       líquido = bruto − ICMS − PIS/COFINS com as alíquotas do orçamento (024 D3).
--   D2. O DISTRIBUÍDO é a soma das colunas geradas de TODAS as entregas do item (009): as
--       canceladas têm qtd 0 (bTeaF) e já somam zero — como o Bubble (vendas.md §5.4).
--   D3. FALTA = item − distribuído. Pode ser negativa (entregou a mais) e, em dinheiro, pode
--       sobrar centavo com a quantidade fechada: a entrega usa o unitário de 6 casas do
--       orçamento (009 D4) e arredonda por entrega. A tela mostra o número como está.
--   D4. RATEIO: mesma ordem (dias_prazo, id) e mesma função (fn_valor_parcela, 010 D3) de
--       fn_gerar_contas_receber — iguais, sobra na última. Base = v_kanban_pedidos.valor_total
--       (o total do pedido). Na confirmação o rateio é POR ENTREGA; a prévia é do pedido todo.
--   D5. security_invoker nas duas (view e função): valem a RLS de pedidos, proposta_itens,
--       orcamentos_fornecedor e entregas. Nunca definer (004).
-- =====================================================================================

create view public.v_pedido_item_saldo
with (security_invoker = true) as
with item as (
  select p.id  as pedido_id,
         p.cotacao_id,
         pi.id as proposta_item_id,
         pi.orcamento_fornecedor_id,
         pi.qtd,
         round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2)       as bruto,
         round(pi.qtd * pi.valor_comissao_unit, 2)                     as comissao,
         round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2)
           - round(pi.qtd * pi.valor_venda_unit * o.aliquota_icms, 2)
           - round(pi.qtd * pi.valor_venda_unit * o.aliquota_pis_cofins, 2) as liquido,
         round(pi.qtd * pi.valor_venda_unit * o.aliquota_icms, 2)
           + round(pi.qtd * pi.valor_venda_unit * o.aliquota_pis_cofins, 2) as tributos
  from public.pedidos p
  join public.proposta_itens pi       on pi.proposta_id = p.proposta_id
  join public.orcamentos_fornecedor o on o.id = pi.orcamento_fornecedor_id
)
select i.pedido_id,
       i.cotacao_id,
       i.proposta_item_id,
       i.orcamento_fornecedor_id,
       i.qtd                                   as qtd_vendida,
       i.bruto                                 as valor_bruto,
       i.comissao                              as valor_comissao,
       i.liquido                               as valor_liquido,
       i.tributos                              as valor_tributos,
       coalesce(e.qtd, 0)                      as qtd_entregas,
       coalesce(e.bruto, 0)                    as bruto_entregas,
       coalesce(e.comissao, 0)                 as comissao_entregas,
       coalesce(e.liquido, 0)                  as liquido_entregas,
       i.qtd      - coalesce(e.qtd, 0)         as falta_qtd,
       i.bruto    - coalesce(e.bruto, 0)       as falta_bruto,
       i.comissao - coalesce(e.comissao, 0)    as falta_comissao,
       i.liquido  - coalesce(e.liquido, 0)     as falta_liquido
from item i
left join lateral (
  select sum(en.qtd)                 as qtd,
         sum(en.valor_venda_bruto)   as bruto,
         sum(en.valor_comissao)      as comissao,
         sum(en.valor_venda_liquido) as liquido
  from public.entregas en
  where en.pedido_id = i.pedido_id
    and en.orcamento_fornecedor_id = i.orcamento_fornecedor_id
) e on true;

comment on view public.v_pedido_item_saldo is
  'Saldo por item do pedido (vendas.md §2.9 rodapé das entregas, §5.4): vendido (snapshot de '
  'proposta_itens), soma das entregas e FALTA em qtd, bruto, comissão e líquido. Dinheiro do '
  'banco; a tela só formata. security_invoker = true.';

revoke all on public.v_pedido_item_saldo from anon;
grant select on public.v_pedido_item_saldo to authenticated;

-- ------------------------------------------------------------------ fn_rateio_prazos
create function public.fn_rateio_prazos(p_pedido uuid, p_prazos smallint[])
  returns table (parcela integer, prazo_id smallint, prazo_nome text, dias_prazo smallint, valor numeric)
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  with total as (
    select k.valor_total from public.v_kanban_pedidos k where k.id = p_pedido
  ),
  pz as (
    select pr.id, pr.nome, pr.dias_prazo,
           row_number() over (order by pr.dias_prazo, pr.id)::integer as i,
           count(*) over ()::integer                                  as n
    from public.prazos_recebimento pr
    where pr.id = any (p_prazos)
  )
  select pz.i, pz.id, pz.nome, pz.dias_prazo,
         case when t.valor_total is null then null
              else public.fn_valor_parcela(t.valor_total, pz.n, pz.i) end
  from pz
  left join total t on true
  order by pz.i;
$$;

comment on function public.fn_rateio_prazos(uuid, smallint[]) is
  'Prévia do rateio das condições de pagamento do pedido (029 D4): uma linha por prazo, ordem '
  '(dias_prazo, id) e valor por fn_valor_parcela sobre v_kanban_pedidos.valor_total — as mesmas '
  'regras de fn_gerar_contas_receber. Só leitura; security invoker.';

revoke execute on function public.fn_rateio_prazos(uuid, smallint[]) from public, anon;
grant execute on function public.fn_rateio_prazos(uuid, smallint[]) to authenticated, service_role;

-- =====================================================================================
-- CONFERÊNCIA: 1 view (security_invoker, sem anon), 1 função invoker (sem anon). Nenhuma
-- tabela, policy, seed ou segredo. Dinheiro: numeric, somas e diferenças exatas.
-- =====================================================================================
