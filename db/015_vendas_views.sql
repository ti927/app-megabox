-- =====================================================================================
-- 015_vendas_views.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fecha as consultas de TELA do kanban de vendas que a 007 e a 008 deixaram para "quando o
-- formato for conhecido" (007: `v_kanban_cotacoes`; 008: `v_kanban_pedidos`). O formato agora
-- é conhecido: é o da tela `app/(app)/vendas/` (commit e4af885), que hoje monta os contadores
-- e o total no servidor da aplicação, com embed de PostgREST e soma BigInt.
-- Depende de 007, 008 e 009. Não toca em tabela nenhuma: só views e uma função.
--
-- Fonte: `specs/paginas/vendas.md` §8.2 (troféu), §9.4 e linhas 681–683 (views dos cartões);
-- `specs/02-modelo-de-dados-proposto.md` §5 (tabela de views); mapa: `ipt contaproduto`,
-- `ipt contavencedor` e os 4 inputs ocultos que contam no cartão de cotação; condicional do
-- cartão de pedido (todas as entregas concluídas); WF bTOUP0 (condição do troféu) e
-- bTOUa0/bTOUU0 (desmarca o vencedor atual, marca o novo — dois passos SEM transação).
--
-- O QUE ESTA MIGRATION FAZ
--   1. `v_kanban_cotacoes` (security_invoker): cotação + nomes + `qtd_itens`,
--      `qtd_vencedores`, `qtd_propostas`, `total_bruto_vencedores`, `pode_propor`.
--   2. `v_kanban_pedidos` (security_invoker): pedido + nomes + `valor_total` (soma do SNAPSHOT
--      de `proposta_itens`) + `qtd_entregas`, `qtd_concluidas`, `todas_concluidas`.
--   3. `v_kanban_entregas` recriada com `create or replace`: as 27 colunas da 009 na MESMA
--      ordem, e `vendedor_nome` e `vendedor_substituto_nome` acrescentadas no FIM.
--   4. `fn_definir_vencedor(p_orcamento uuid)`: troca o vencedor do item numa transação só,
--      com a regra bTOUP0 (unitário de venda e comissão ≥ 0,01, exceto amostra).
--
-- O QUE **NÃO** ENTRA AQUI
--   - `v_ultima_cotacao_fob`, `fornecedores_para_item`, `v_pedido_item_saldo`: outras telas.
--   - As regras de etapa/arquivamento da cotação (só etapa Cotação; arquivada só o Diretor —
--     vendas.md §1). Continuam na server action `definirVencedor`, como toda regra de etapa
--     da 007 ("regras por etapa ficam na server action"). A função não abre porta nova: quem
--     pode chamá-la já pode fazer o mesmo UPDATE direto na tabela, pela mesma RLS.
--   - Nenhum seed, nenhuma tabela, nenhum GRANT em tabela.
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU CONFLITAVA COM O MAPA <<<
--   D1. CONTADORES POR SUBCONSULTA ESCALAR, NÃO POR `join lateral` NEM `group by`. A view é
--       achatada na consulta de quem lê, e subconsulta escalar de coluna que a consulta não
--       pede é descartada pelo planejador: o `count: 'exact'` do kanban não paga pelos
--       contadores. Com `join lateral` + agregado, pagaria sempre.
--   D2. `qtd_vencedores` CONTA ITENS COM VENCEDOR, não orçamentos marcados. Hoje dá o mesmo
--       (índice único parcial `um_vencedor_por_item`, 007), mas é o que o `ipt contavencedor`
--       do Bubble quer dizer e continua certo se o índice mudar.
--   D3. `total_bruto_vencedores` é NULO quando não há vencedor, e não 0: o cartão do Bubble só
--       mostra o valor com vencedor, e 0 seria um valor. Soma de `valor_venda_bruto`, que já é
--       `numeric(14,2)` arredondado por linha (007 D2) — a soma de numeric é exata.
--   D4. `valor_total` DO PEDIDO = Σ round(qtd × valor_venda_unit + valor_frete, 2) dos
--       `proposta_itens` da proposta do pedido. É a fórmula do bruto da 007 (D1, D2) aplicada
--       ao SNAPSHOT (008 D1): `proposta_itens.valor_frete` já é o frete EFETIVO (0 fora de CIF
--       Informado), então não precisa do `case` de tipo de frete. NÃO é a soma das entregas:
--       a entrega parcial ou cancelada mudaria o valor do pedido. Pedido sem proposta (carga
--       antiga, 008) → NULO, e a tela não mostra valor.
--   D5. `todas_concluidas` = há entrega E toda entrega está em etapa `concluida` (003:
--       Financeiro, Concluído, Cancelado). É `todasEntregasConcluidas` de lib/vendas.ts,
--       agora pelo atributo da lista fixa e não por ids chumbados. Pedido sem entrega → false.
--   D6. NOMES POR `left join`. `usuarios` e `grupos_clifor` têm RLS própria; com `inner join`
--       um nome invisível para quem lê SUMIRIA com o cartão inteiro. O nome vem nulo, e o
--       cartão continua lá. (`v_kanban_entregas` mantém os `inner join` da 009 — mudar
--       semântica de coluna existente não é escopo de `create or replace`.)
--   D7. `vendedor_nome` EM `v_kanban_pedidos` é o do `pedidos.vendedor_id`, que é o que o
--       filtro de vendedor e a RLS usam. A tela mostrava o vendedor da COTAÇÃO; na base eles
--       só divergem em pedido gravado por outro usuário (bTbNB grava o usuário corrente), e o
--       cartão passar a mostrar o mesmo vendedor que o filtro seleciona é a correção.
--   D8. `fn_definir_vencedor` É SECURITY INVOKER (specs/05 §2: definer executável por
--       authenticated só com `where auth.uid()` e sem argumento que aponte linha de terceiro —
--       aqui o argumento É linha de terceiro). A RLS de `orcamentos_fornecedor` (007: dono da
--       cotação ou hierarquia ≤ 2) decide quem troca. UPDATE filtrado pela RLS não dá erro,
--       dá 0 linhas; por isso a função confere `row_count` e levanta 42501 — "não marcou"
--       nunca vira sucesso silencioso.
--   D9. TROCA ATÔMICA E SERIALIZADA POR ITEM. Os orçamentos do item são travados
--       (`for update`, em ordem de id) antes de desmarcar: duas trocas simultâneas no mesmo
--       item esperam uma pela outra, em vez de uma delas cair no índice único. Qualquer falha
--       desfaz as duas gravações — no Bubble, falhar no meio deixava o item sem vencedor.
--   D10. ERRO DA REGRA bTOUP0 COM `errcode = '23514'` (check_violation) e mensagem para a
--       pessoa. É a mesma família do check que a regra seria se coubesse num check (não cabe:
--       depende de `cotacoes.amostra`, outra tabela — 007).
--   D11. MARCAR O QUE JÁ É VENCEDOR É IDEMPOTENTE (sucesso, nada muda). Desmarcar continua
--       sendo um UPDATE simples da action: é uma gravação só, sem troca.
--
-- ORDEM DOS BLOCOS: views → funções → grants.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- Depois de aplicar: `get_advisors` (segurança), comparado com `specs/05-avisos-do-advisor.md`.
-- =====================================================================================


-- =====================================================================================
-- 1. VIEWS
-- =====================================================================================

-- --------------------------------------------------------------------- v_kanban_cotacoes
create view public.v_kanban_cotacoes
with (security_invoker = true) as
select c.id,
       c.numero,
       c.criado_em,
       c.arquivado,
       c.rascunho,
       c.etapa_id,
       c.amostra,
       c.cliente_id,
       cli.nome  as cliente_nome,
       c.vendedor_id,
       ven.nome  as vendedor_nome,
       c.motivo_arquivamento_id,
       mot.nome  as motivo_nome,
       (select count(*)::integer
          from public.cotacao_itens i
         where i.cotacao_id = c.id)                                  as qtd_itens,
       (select count(distinct o.cotacao_item_id)::integer
          from public.orcamentos_fornecedor o
         where o.cotacao_id = c.id and o.vencedor)                   as qtd_vencedores,
       (select count(*)::integer
          from public.propostas p
         where p.cotacao_id = c.id)                                  as qtd_propostas,
       (select sum(o.valor_venda_bruto)
          from public.orcamentos_fornecedor o
         where o.cotacao_id = c.id and o.vencedor)                   as total_bruto_vencedores,
       (exists (select 1 from public.cotacao_itens i where i.cotacao_id = c.id)
        and exists (select 1 from public.orcamentos_fornecedor o
                     where o.cotacao_id = c.id and o.vencedor))     as pode_propor
from public.cotacoes c
left join public.grupos_clifor cli         on cli.id = c.cliente_id
left join public.usuarios ven              on ven.id = c.vendedor_id
left join public.motivos_arquivamento mot  on mot.id = c.motivo_arquivamento_id;

comment on view public.v_kanban_cotacoes is
  'Cartão da coluna Cotação (vendas.md §3.1, §9.4): contadores de item, item com vencedor e '
  'proposta (os 4 inputs ocultos do Bubble) e o total bruto dos vencedores (D3: nulo sem '
  'vencedor). pode_propor = ícone de proposta (ipt contaproduto/contavencedor). Contadores por '
  'subconsulta escalar (D1). security_invoker = true: respeita a RLS de cotacoes e das filhas.';

revoke all on public.v_kanban_cotacoes from anon;
grant select on public.v_kanban_cotacoes to authenticated;

-- ---------------------------------------------------------------------- v_kanban_pedidos
create view public.v_kanban_pedidos
with (security_invoker = true) as
select p.id,
       p.numero,
       p.cotacao_id,
       cot.numero as cotacao_numero,
       p.proposta_id,
       p.criado_em,
       p.etapa_id,
       p.formalizado,
       p.finalizado,
       p.motivo_cancelamento,
       p.cliente_id,
       cli.nome   as cliente_nome,
       p.vendedor_id,
       ven.nome   as vendedor_nome,
       (select sum(round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2))
          from public.proposta_itens pi
         where pi.proposta_id = p.proposta_id)                       as valor_total,
       (select count(*)::integer
          from public.entregas e
         where e.pedido_id = p.id)                                   as qtd_entregas,
       (select count(*)::integer
          from public.entregas e
          join public.etapas et on et.id = e.status_id
         where e.pedido_id = p.id and et.concluida)                  as qtd_concluidas,
       (exists (select 1 from public.entregas e where e.pedido_id = p.id)
        and not exists (select 1
                          from public.entregas e
                          join public.etapas et on et.id = e.status_id
                         where e.pedido_id = p.id and not et.concluida)) as todas_concluidas
from public.pedidos p
left join public.cotacoes cot      on cot.id = p.cotacao_id
left join public.grupos_clifor cli on cli.id = p.cliente_id
left join public.usuarios ven      on ven.id = p.vendedor_id;

comment on view public.v_kanban_pedidos is
  'Cartão da coluna Pedido (vendas.md §3.2, §9.4): valor_total = soma do SNAPSHOT de '
  'proposta_itens (D4; nulo sem proposta), contadores de entrega e todas_concluidas (D5: há '
  'entrega e toda entrega em etapa concluída — o cartão verde). security_invoker = true.';

revoke all on public.v_kanban_pedidos from anon;
grant select on public.v_kanban_pedidos to authenticated;

-- --------------------------------------------------------------------- v_kanban_entregas
-- `create or replace`: as colunas da 009 ficam iguais em nome, tipo e ordem (exigência do
-- Postgres), e as duas novas entram no fim. Nenhum objeto depende desta view (conferido em
-- pg_depend antes de escrever). O GRANT da 009 é preservado pelo replace; o `with` é repetido
-- porque o replace regrava as opções da view.
create or replace view public.v_kanban_entregas
with (security_invoker = true) as
select e.id,
       e.pedido_id,
       e.cotacao_id,
       e.orcamento_fornecedor_id,
       e.numero_entrega,
       e.status_id,
       e.qtd,
       e.dt_pedido,
       e.dt_prev_entrega,
       e.dt_entrega,
       e.saiu_entrega,
       e.nf_fornecedor_numero,
       e.valor_venda_bruto,
       e.valor_venda_liquido,
       e.valor_comissao,
       e.cliente_id,
       cli.nome            as cliente_nome,
       e.fornecedor_id,
       forn.nome           as fornecedor_nome,
       o.produto_id,
       pr.nome             as produto_nome,
       p.finalizado        as pedido_finalizado,
       e.vendedor_id,
       e.vendedor_substituto_id,
       coalesce(e.vendedor_substituto_id, e.vendedor_id) as vendedor_efetivo_id,
       case
         when e.vendedor_substituto_id = (select auth.uid()) then 'substituto'
         when e.vendedor_id            = (select auth.uid()) then 'proprio'
         else 'equipe'
       end                 as papel,
       e.criado_em,
       -- 015: acrescentadas no fim (a tela buscava os nomes numa segunda consulta)
       ven.nome            as vendedor_nome,
       sub.nome            as vendedor_substituto_nome
from public.entregas e
join public.pedidos p               on p.id = e.pedido_id
join public.orcamentos_fornecedor o on o.id = e.orcamento_fornecedor_id
join public.grupos_clifor cli       on cli.id = e.cliente_id
join public.grupos_clifor forn      on forn.id = e.fornecedor_id
join public.produtos pr             on pr.id = o.produto_id
left join public.usuarios ven       on ven.id = e.vendedor_id
left join public.usuarios sub       on sub.id = e.vendedor_substituto_id;

comment on view public.v_kanban_entregas is
  'Cartões das duas colunas de entrega (vendas.md §3.3 e §3.4) numa consulta só: papel = '
  '''proprio'' | ''substituto'' | ''equipe'' em relação a quem lê, e vendedor_efetivo_id. '
  'Substitui as duas buscas separadas (bTbxZ, bTzTB). A 015 acrescentou vendedor_nome e '
  'vendedor_substituto_nome (left join, D6). security_invoker = true: respeita a RLS de '
  'entregas e das tabelas do join.';


-- =====================================================================================
-- 2. FUNÇÕES
-- =====================================================================================

-- ------------------------------------------------------------------- fn_definir_vencedor
create function public.fn_definir_vencedor(p_orcamento uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item      uuid;
  v_unit      numeric;
  v_comissao  numeric;
  v_amostra   boolean;
  v_vencedor  boolean;
  v_linhas    integer;
begin
  -- Lido pela RLS de quem chama: orçamento de outro vendedor = "não existe".
  select o.cotacao_item_id, o.valor_venda_unit, o.valor_comissao_unit, c.amostra, o.vencedor
    into v_item, v_unit, v_comissao, v_amostra, v_vencedor
    from public.orcamentos_fornecedor o
    join public.cotacoes c on c.id = o.cotacao_id
   where o.id = p_orcamento;

  if not found then
    raise exception 'Orçamento não encontrado'
      using errcode = 'P0002';
  end if;

  -- Regra do troféu (bTOUP0; D10).
  if not v_amostra and (v_unit < 0.01 or v_comissao < 0.01) then
    raise exception 'Para ser vencedor, informe valor unitário e comissão unitária (mínimo R$ 0,01).'
      using errcode = '23514';
  end if;

  -- D11: já é o vencedor.
  if v_vencedor then
    return;
  end if;

  -- D9: serializa as trocas do mesmo item.
  perform 1
     from public.orcamentos_fornecedor o
    where o.cotacao_item_id = v_item
    order by o.id
      for update;

  update public.orcamentos_fornecedor
     set vencedor = false
   where cotacao_item_id = v_item
     and vencedor
     and id <> p_orcamento;

  update public.orcamentos_fornecedor
     set vencedor = true
   where id = p_orcamento;

  -- D8: a RLS de escrita filtra sem erro. Zero linhas = sem permissão, e a exceção desfaz o
  -- "desmarcar" acima junto.
  get diagnostics v_linhas = row_count;
  if v_linhas = 0 then
    raise exception 'Sem permissão para alterar este orçamento'
      using errcode = '42501';
  end if;
end $$;

comment on function public.fn_definir_vencedor(uuid) is
  'Troféu do carrinho (bTOUa0/bTOUU0): desmarca o vencedor atual do item e marca este, NUMA '
  'transação e serializado por item (D9), com a regra bTOUP0 (unitário e comissão ≥ 0,01, '
  'exceto amostra — errcode 23514). security invoker (D8): a RLS de orcamentos_fornecedor '
  'decide; UPDATE filtrado vira 42501. Etapa/arquivamento: server action definirVencedor.';


-- =====================================================================================
-- 3. GRANTS
-- =====================================================================================
revoke execute on function public.fn_definir_vencedor(uuid) from public, anon;
grant  execute on function public.fn_definir_vencedor(uuid) to authenticated;


-- =====================================================================================
-- FIM da 015_vendas_views.sql
-- =====================================================================================
-- CONFERÊNCIA
--   Nenhuma tabela nova, nenhuma policy nova, nenhum GRANT em tabela.
--   3 views, todas `security_invoker = true`, todas com `revoke all ... from anon` (a de
--   entregas herda o da 009 pelo replace) e `select` só para authenticated.
--   v_kanban_entregas: 27 colunas da 009 na mesma ordem + 2 no fim.
--   1 função: fn_definir_vencedor — security invoker, search_path = '', execute só
--   authenticated. Nenhuma security definer nova.
--   Dinheiro: somas de numeric(14,2) (exatas); round(..., 2) por item de proposta (007 D2).
--   Nenhum float. Nenhum seed. Nenhum segredo.
-- =====================================================================================
