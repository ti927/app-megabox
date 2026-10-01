-- =====================================================================================
-- 029_pedido_saldo_rateio.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Leituras e uma transação para a tela única proposta → pedido → entregas (vendas.md §2.9):
--   1. `v_pedido_item_saldo` — por item do pedido, o vendido, o já distribuído em entregas e
--      o que FALTA, em quantidade E em dinheiro (qtd, bruto, comissão, líquido). É o rodapé
--      da sub-tabela de entregas do Bubble ("Qtd entrega: soma / Falta", "Comissão soma /
--      Falta", "Valor bruto soma / Falta", "Valor líq soma / Falta" — vendas.md §2.9, §5.4).
--   2. `fn_rateio_prazos(pedido, prazos[])` — a PRÉVIA das condições de pagamento: uma linha
--      por prazo, na ordem e com os valores (venda E comissão) que `fn_gerar_contas_receber`
--      (010) usaria sobre o total do pedido. Só leitura: a geração continua na confirmação.
--   3. `fn_duplicar_pedido(pedido, destino, orçamentos[], validade)` — "Duplicar Pedido"
--      (pop.DuplicarPedido, WF bTzte + backend bUAeU): cria uma COTAÇÃO nova, na etapa
--      Cotação, com cópias dos itens e dos orçamentos vencedores do pedido. NÃO copia pedido,
--      prazos, entregas nem contas: o financeiro só nasce de entrega confirmada (010).
-- Depende de 003, 006, 007, 008, 009, 010 (fn_valor_parcela).
--
-- REAPLICÁVEL: a versão de 30/09 (WIP) chegou a ser aplicada antes da revisão. Os `drop ...
-- if exists` abaixo trocam aquela versão por esta; num banco limpo não fazem nada.
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
--       fn_gerar_contas_receber — iguais, sobra na última —, aplicada à VENDA (valor_total da
--       conta) e à COMISSÃO (valor_comissao da conta, o que a MegaBox recebe). Base = soma do
--       snapshot do pedido (D1). Na confirmação o rateio é POR ENTREGA; a prévia é do pedido.
--   D5. DUPLICAR copia o ORÇAMENTO (bUAer: CopyListOfThings dos vencedores), não o snapshot:
--       é o que o Bubble faz. Destino e cobrança = o endereço escolhido (bUAfi). Vendedor =
--       quem duplica (bUAfd: QualVendedor = Current User), empresa emissora = a da cotação
--       original (o rádio do Bubble nasce em Megabox; aqui herda), validade = hoje + 2
--       (bUALM). Se o destino MUDA, as alíquotas vão nulas e o trigger da 007 recalcula pela
--       UF nova (007 D5) — o Bubble copiava as antigas, o que deixa ICMS errado com outra UF.
--       Cliente = dono do endereço (bUAfd: QualEnderecoDestino:QualGrupoCliFor).
--       Nada de pedidos, pedido_prazos, entregas, contas_receber, contas_pagar: a função não
--       toca essas tabelas (scripts/testar-rls-financeiro.mjs conta antes e depois).
--   D6. security invoker nas três peças: valem a RLS de pedidos, proposta_itens, orçamentos,
--       entregas e, na duplicação, a de escrita de cotacoes (vendedor = auth.uid()). Nunca
--       definer (004). Sem anon.
-- =====================================================================================

drop function if exists public.fn_duplicar_pedido(uuid, uuid, uuid[], date);
drop function if exists public.fn_rateio_prazos(uuid, smallint[]);
drop view if exists public.v_pedido_item_saldo;

-- ------------------------------------------------------------------ v_pedido_item_saldo
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
         round(pi.qtd * pi.valor_venda_unit * o.aliquota_icms, 2)       as icms,
         round(pi.qtd * pi.valor_venda_unit * o.aliquota_pis_cofins, 2) as pis_cofins
  from public.pedidos p
  join public.proposta_itens pi       on pi.proposta_id = p.proposta_id
  join public.orcamentos_fornecedor o on o.id = pi.orcamento_fornecedor_id
)
select i.pedido_id,
       i.cotacao_id,
       i.proposta_item_id,
       i.orcamento_fornecedor_id,
       i.qtd                                         as qtd_vendida,
       i.bruto                                       as valor_bruto,
       i.comissao                                    as valor_comissao,
       i.bruto - i.icms - i.pis_cofins               as valor_liquido,
       i.icms + i.pis_cofins                         as valor_tributos,
       coalesce(e.qtd, 0)                            as qtd_entregas,
       coalesce(e.bruto, 0)                          as bruto_entregas,
       coalesce(e.comissao, 0)                       as comissao_entregas,
       coalesce(e.liquido, 0)                        as liquido_entregas,
       i.qtd      - coalesce(e.qtd, 0)               as falta_qtd,
       i.bruto    - coalesce(e.bruto, 0)             as falta_bruto,
       i.comissao - coalesce(e.comissao, 0)          as falta_comissao,
       (i.bruto - i.icms - i.pis_cofins) - coalesce(e.liquido, 0) as falta_liquido
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
  'banco; a tela só formata. security_invoker = true (029 D6).';

revoke all on public.v_pedido_item_saldo from anon, public;
grant select on public.v_pedido_item_saldo to authenticated, service_role;

-- ------------------------------------------------------------------ fn_rateio_prazos
create function public.fn_rateio_prazos(p_pedido uuid, p_prazos smallint[])
  returns table (
    parcela     integer,
    prazo_id    smallint,
    prazo_nome  text,
    dias_prazo  smallint,
    valor       numeric,
    comissao    numeric
  )
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  with total as (
    select sum(round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2)) as venda,
           sum(round(pi.qtd * pi.valor_comissao_unit, 2))               as comissao
    from public.pedidos p
    join public.proposta_itens pi on pi.proposta_id = p.proposta_id
    where p.id = p_pedido
  ),
  pz as (
    select pr.id, pr.nome, pr.dias_prazo,
           row_number() over (order by pr.dias_prazo, pr.id)::integer as i,
           count(*) over ()::integer                                  as n
    from public.prazos_recebimento pr
    where pr.id = any (p_prazos)
  )
  select pz.i, pz.id, pz.nome, pz.dias_prazo,
         case when t.venda    is null then null else public.fn_valor_parcela(t.venda,    pz.n, pz.i) end,
         case when t.comissao is null then null else public.fn_valor_parcela(t.comissao, pz.n, pz.i) end
  from pz
  left join total t on true
  order by pz.i;
$$;

comment on function public.fn_rateio_prazos(uuid, smallint[]) is
  'Prévia das condições de pagamento do pedido (029 D4): uma linha por prazo, ordem '
  '(dias_prazo, id), venda e comissão rateadas por fn_valor_parcela sobre o snapshot do pedido '
  '— as regras de fn_gerar_contas_receber. Só leitura; security invoker.';

revoke execute on function public.fn_rateio_prazos(uuid, smallint[]) from public, anon;
grant execute on function public.fn_rateio_prazos(uuid, smallint[]) to authenticated, service_role;

-- ------------------------------------------------------------------ fn_duplicar_pedido
create function public.fn_duplicar_pedido(
  p_pedido          uuid,
  p_destino         uuid,
  p_orcamentos      uuid[] default null,
  p_data_validade   date   default null
)
  returns uuid
  language plpgsql
  volatile
  security invoker
  set search_path = ''
as $$
declare
  v_eu        uuid := auth.uid();
  v_cotacao   uuid;
  v_empresa   smallint;
  v_cliente   uuid;
  v_nova      uuid;
  v_item      uuid;
  v_qtd       integer := 0;
  r           record;
begin
  if v_eu is null then
    raise exception 'Duplicar pedido exige um usuário logado' using errcode = '42501';
  end if;

  -- O pedido, pela RLS de quem chama: quem não lê o pedido não o duplica.
  select p.cotacao_id, c.empresa_emissora_id
    into v_cotacao, v_empresa
  from public.pedidos p
  join public.cotacoes c on c.id = p.cotacao_id
  where p.id = p_pedido;
  if v_cotacao is null then
    raise exception 'Pedido % não encontrado ou sem acesso', p_pedido using errcode = 'P0002';
  end if;

  -- Cliente = dono do endereço de destino (bUAfd), e tem de ser CLIENTE ativo.
  select e.grupo_id into v_cliente
  from public.enderecos_clifor e
  join public.grupos_clifor g on g.id = e.grupo_id
  where e.id = p_destino and g.tipo = 'cliente' and g.ativo;
  if v_cliente is null then
    raise exception 'Endereço de entrega inválido: escolha um endereço de cliente ativo' using errcode = '22023';
  end if;

  insert into public.cotacoes (cliente_id, vendedor_id, empresa_emissora_id, data_validade, criado_por)
  values (v_cliente, v_eu, v_empresa, coalesce(p_data_validade, current_date + 2), v_eu)
  returning id into v_nova;

  for r in
    select o.*, ci.grupo_produto_id, ci.qtd as item_qtd
    from public.proposta_itens pi
    join public.pedidos p                on p.proposta_id = pi.proposta_id
    join public.orcamentos_fornecedor o  on o.id = pi.orcamento_fornecedor_id
    join public.cotacao_itens ci         on ci.id = o.cotacao_item_id
    where p.id = p_pedido
      and (p_orcamentos is null or o.id = any (p_orcamentos))
    order by pi.criado_em, pi.id
  loop
    insert into public.cotacao_itens
      (cotacao_id, produto_id, grupo_produto_id, qtd, medida, linha_id, condicao_id,
       endereco_destino_id, criado_por)
    values
      (v_nova, r.produto_id, r.grupo_produto_id, r.qtd_venda, r.medida, r.linha_id, r.condicao_id,
       p_destino, v_eu)
    returning id into v_item;

    insert into public.orcamentos_fornecedor
      (cotacao_item_id, cotacao_id, fornecedor_id, endereco_origem_id, endereco_destino_id,
       endereco_cobranca_id, produto_id, vendedor_id, qtd_venda, medida, linha_id, condicao_id,
       valor_venda_unit, valor_comissao_unit, valor_frete, tipo_frete_id, frete_fracionado,
       aliquota_icms, aliquota_pis_cofins, aliquota_ipi, vencedor, criado_por)
    values
      (v_item, v_nova, r.fornecedor_id, r.endereco_origem_id, p_destino,
       p_destino, r.produto_id, v_eu, r.qtd_venda, r.medida, r.linha_id, r.condicao_id,
       r.valor_venda_unit, r.valor_comissao_unit, r.valor_frete, r.tipo_frete_id, r.frete_fracionado,
       -- D5: destino novo → o trigger recalcula as alíquotas pela UF nova
       case when r.endereco_destino_id = p_destino then r.aliquota_icms end,
       case when r.endereco_destino_id = p_destino then r.aliquota_pis_cofins end,
       r.aliquota_ipi, true, v_eu);

    v_qtd := v_qtd + 1;
  end loop;

  if v_qtd = 0 then
    raise exception 'Escolha ao menos um item do pedido para duplicar' using errcode = '22023';
  end if;

  return v_nova;
end $$;

comment on function public.fn_duplicar_pedido(uuid, uuid, uuid[], date) is
  'Duplicar Pedido (pop.DuplicarPedido, bTzte/bUAeU; 029 D5): cotação nova na etapa Cotação, '
  'com cópia dos itens e orçamentos vencedores do pedido (todos ou os de p_orcamentos), para '
  'o cliente dono de p_destino. Não cria pedido, prazos, entregas nem contas. security invoker.';

revoke execute on function public.fn_duplicar_pedido(uuid, uuid, uuid[], date) from public, anon;
grant execute on function public.fn_duplicar_pedido(uuid, uuid, uuid[], date) to authenticated, service_role;

-- =====================================================================================
-- CONFERÊNCIA: 1 view (security_invoker, sem anon), 2 funções invoker com search_path = ''
-- (sem anon). Nenhuma tabela, policy, seed ou segredo. Dinheiro: numeric, somas e diferenças
-- exatas; rateio por fn_valor_parcela (010 D3).
-- =====================================================================================
