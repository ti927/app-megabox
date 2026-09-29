-- =====================================================================================
-- 020_desempenho.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Corrige a CAUSA dos `57014 canceling statement due to statement timeout` das telas de vendas
-- e financeiro com a base carregada. Depende de 001–019. Não cria tabela, não muda dado, não
-- abre nem fecha acesso: views com as MESMAS colunas, índices, uma função invoker e as
-- policies existentes reescritas com a MESMA condição (§4).
--
-- O DIAGNÓSTICO (logs do Postgres, base cheia: 5.957 cotações, 24.189 orçamentos, 10.045
-- itens, 7.764 propostas, 2.235 pedidos, 3.610 entregas)
--   - Rajadas de 5–7 erros 57014 no MESMO segundo = a página /vendas abrindo: as 4 colunas do
--     kanban e a ficha, em paralelo, cada uma com `count: 'exact'`. Cada consulta passava de
--     ~8 s. Toda server action de vendas faz `revalidatePath('/vendas')`, que refaz as 4.
--   - As views do kanban (015) calculam 4–5 contadores por SUBCONSULTA ESCALAR POR LINHA, e
--     cada subconsulta aplica a RLS da tabela filha, que por sua vez consulta `cotacoes` (e a
--     RLS de `cotacoes`, que consulta `entregas`). São 6 subplanos por cotação e 5 por pedido,
--     cada um com o seu encadeamento de RLS.
--   - As policies de LEITURA das tabelas de cadastro e das listas fixas (001, 003, 004, 006 e
--     outras) chamam `public.fn_usuario_ativo()` SEM o `(select ...)`. A função é `security
--     definer` (não é "inlinada"), então é executada UMA VEZ POR LINHA LIDA — cada chamada é
--     uma consulta em `usuarios`. O kanban junta `grupos_clifor`, `usuarios`, `produtos`,
--     `etapas` e `motivos_arquivamento` em toda linha; a ficha lê `produtos` inteira com as
--     filhas. É o aviso `auth_rls_initplan` do advisor de performance, em ~40 tabelas.
--   - O disco da Micro estava estrangulado (checkpoint de 13 MB em 164 s): tudo o que é
--     trabalho por linha fica muito mais caro. Isto a migration não resolve; reduz a conta.
--   - Os totais do financeiro percorriam o recorte em lotes de 1.000 linhas pela API e
--     somavam no servidor da aplicação (limite registrado no commit 84f1055).
--
-- O QUE ESTA MIGRATION FAZ
--   1. `v_kanban_cotacoes` e `v_kanban_pedidos` recriadas com `create or replace`: MESMAS
--      colunas, nomes, tipos e ordem; contadores por `left join lateral` com UM agregado por
--      tabela filha (cada filha é lida uma vez por linha, não uma vez por coluna).
--   2. Índices para os filtros e a ordenação das 4 colunas do kanban, para o agregado dos
--      vencedores e para as listas do financeiro.
--   3. `fn_resumo_financeiro(...)`: contagem, soma da comissão e do saldo do recorte filtrado,
--      em numeric, numa consulta só. security invoker.
--   4. Toda policy do esquema `public` que chama `fn_usuario_ativo()`, `fn_hierarquia()`,
--      `fn_pode_acessar_pagina('...')` ou `auth.uid()` SEM `(select ...)` é reescrita com o
--      `(select ...)` — a condição é a mesma; muda só quantas vezes a função roda (§4).
--   5. `analyze` das tabelas do kanban e do financeiro (estatística fresca para o plano novo).
--
-- O QUE **NÃO** ENTRA AQUI
--   - `v_kanban_entregas` NÃO é recriada. Ela não tem subconsulta por linha: o único
--     `(select auth.uid())` é initPlan (roda uma vez). O custo dela era a RLS das tabelas do
--     join (grupos_clifor, produtos, usuarios — §4) e a falta de índice para o filtro da coluna
--     (§2). Mexer no corpo dela trocaria `join` por `left join` (015 D6: fora de escopo).
--   - `v_contas_receber`/`v_contas_pagar` ficam como estão (já agregam as baixas por lateral).
--   - Nenhum `create index concurrently`: a migration roda em transação (o script de aplicação
--     e o Supabase). Tabelas de até 25 mil linhas: o lock de criação dura frações de segundo.
--
-- >>> DECISÕES <<<
--   D1. LATERAL COM UM AGREGADO POR FILHA, NÃO SUBCONSULTA POR COLUNA. Revoga a D1 da 015. A
--       premissa de lá ("subconsulta de coluna não pedida é descartada") vale, mas a tela PEDE
--       todas as colunas, e o preço eram 6 subplanos por cotação, cada um reaplicando a RLS da
--       filha. Agora: `cotacao_itens` 1×, `orcamentos_fornecedor` 1× (contador de vencedores,
--       total bruto e o "existe vencedor" do `pode_propor` saem do MESMO agregado), `propostas`
--       1×. Nos pedidos: `proposta_itens` 1×, `entregas` 1× (os três contadores de entrega e o
--       `todas_concluidas`). Agregado sem GROUP BY devolve sempre UMA linha, então o
--       `left join lateral ... on true` nunca multiplica nem some com o cartão.
--   D2. POR QUE NÃO `group by` NUMA CTE SOBRE A TABELA INTEIRA. O kanban filtra um mês (~100–300
--       cotações). Um agregado pré-calculado da tabela inteira (24 mil orçamentos, cada um com a
--       RLS) seria pago a cada abertura, com ou sem filtro — o planejador não empurra o filtro
--       de `cotacoes` para dentro de um GROUP BY. O lateral é o agregado "já restrito": roda só
--       para as linhas que passaram no filtro, por índice (§2).
--   D3. SEMÂNTICA IDÊNTICA, COLUNA POR COLUNA (conferida contra a 015):
--       - `qtd_itens`, `qtd_propostas`: `count(*)::integer` — 0 sem filhas, como antes.
--       - `qtd_vencedores`: `count(distinct cotacao_item_id)` só dos vencedores (015 D2).
--       - `total_bruto_vencedores`: `sum` sobre zero linhas = NULO (015 D3), como antes.
--       - `pode_propor` = existe item E existe orçamento vencedor. `cotacao_item_id` é
--         `not null` (007), então "existe vencedor" ⇔ `qtd_vencedores > 0`. Nunca nulo.
--       - `valor_total`: a mesma soma de `round(qtd × unit + frete, 2)` do snapshot (015 D4);
--         `proposta_id` nulo → nenhum item → NULO, como antes.
--       - `qtd_concluidas`/`todas_concluidas`: `entregas left join etapas`. A 015 usava `join`
--         dentro de cada subconsulta; no agregado, entrega cuja etapa não se vê tem
--         `concluida` nula e não entra em `filter (where et.concluida)` nem em
--         `filter (where not et.concluida)` — exatamente o que o `join` + `exists`/`not exists`
--         da 015 fazia. `qtd_entregas` conta sem depender de `etapas`, como antes.
--       - A RLS de cada filha continua aplicada (view security_invoker, filha lida como quem
--         consulta): nenhum contador passa a enxergar o que antes não enxergava.
--   D4. `create or replace`, NÃO `drop` + `create`: as views mantêm GRANT, comentário e o
--       vínculo que o PostgREST usa para o embed `entregas(...)` a partir de v_kanban_pedidos
--       (a coluna `id` continua vindo direto de `pedidos.id`). Nenhum objeto do banco depende
--       das duas views (só a aplicação e scripts/testar-rls-vendas.mjs) — conferido por grep
--       nas migrations; o Postgres recusaria o replace se tipo ou ordem mudassem.
--   D5. ÍNDICES PARCIAIS NA FORMA EXATA DO FILTRO DA TELA. `rascunho = false` e
--       `saiu_entrega = true` viram predicado do índice (o PostgREST manda `= false`/`= true`,
--       que o planejador simplifica para `not rascunho`/`saiu_entrega`). Colunas na ordem
--       igualdade → intervalo/ordenação. `if not exists` em todos: reaplicar é inócuo.
--   D6. `fn_resumo_financeiro` É SECURITY INVOKER, `search_path = ''`, execute só para
--       authenticated (specs/05 §2, critério para funções novas: há argumentos que apontam
--       linhas de terceiros — vendedor, cliente, fornecedor —, então definer está fora). Lê
--       `v_contas_receber`/`v_contas_pagar` (security_invoker): a RLS de contas, entregas e
--       baixas vale como vale para a lista. Resultado impossível de divergir da lista: é o
--       MESMO filtro de `consulta()` em app/(app)/financeiro/page.tsx, aplicado às mesmas views.
--   D7. A COLUNA DE DATA DO FILTRO É ESCOLHIDA POR LISTA FECHADA, e a consulta é montada com
--       `format(%I)` e valores por `using` (nada do texto do usuário vira SQL). plpgsql com
--       EXECUTE, e não SQL puro com `case`, para o plano ver a coluna de verdade e usar índice.
--       Coluna fora da lista → erro 22023, não "cai no vencimento" em silêncio (quem decide o
--       padrão é lib/financeiro `colunaData`, que já só manda coluna válida).
--   D8. DINHEIRO SAI COMO TEXTO (`numeric` arredondado a 2 casas, `::text`). O PostgREST
--       serializa `numeric` como número JSON, e o supabase-js o lê como float — a soma exata
--       viraria aproximada no caminho (CLAUDE.md regra 10). A soma é `sum(numeric)` (exata).
--   D9. POLICIES: `(select f())` NO LUGAR DE `f()`. As quatro funções não recebem nada da linha
--       (`fn_pode_acessar_pagina` recebe a constante da página) e são `stable`: dentro de uma
--       consulta devolvem o mesmo valor para toda linha. Com `(select ...)` o Postgres calcula
--       uma vez (initPlan) em vez de uma vez por linha. A condição é a mesma — não é
--       simplificação de RLS (CLAUDE.md, Ponytail). Funções que recebem coluna da linha (ex.:
--       `fn_pode_ver_tipo_anexo(tipo_anexo_id)`, 018) NÃO são tocadas: ali o valor muda por
--       linha. A reescrita é feita a partir do texto que o próprio Postgres gera
--       (`pg_get_expr`, o mesmo que o pg_dump usa para recriar policy), com `search_path = ''`
--       para sair tudo qualificado, e termina com uma CONFERÊNCIA que aborta a migration se
--       sobrar chamada sem `(select ...)`.
--
-- ORDEM DOS BLOCOS: views → índices → função → policies → grants → analyze.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- Depois de aplicar: `get_advisors` (segurança e performance), comparado com
-- `specs/05-avisos-do-advisor.md`; `node scripts/testar-rls-vendas.mjs` e
-- `node scripts/testar-rls-financeiro.mjs`.
-- =====================================================================================


-- =====================================================================================
-- 1. VIEWS DO KANBAN (D1–D4)
-- =====================================================================================

-- --------------------------------------------------------------------- v_kanban_cotacoes
create or replace view public.v_kanban_cotacoes
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
       it.qtd_itens,
       ov.qtd_vencedores,
       pr.qtd_propostas,
       ov.total_bruto_vencedores,
       (it.qtd_itens > 0 and ov.qtd_vencedores > 0)                  as pode_propor
from public.cotacoes c
left join public.grupos_clifor cli         on cli.id = c.cliente_id
left join public.usuarios ven              on ven.id = c.vendedor_id
left join public.motivos_arquivamento mot  on mot.id = c.motivo_arquivamento_id
left join lateral (
  select count(*)::integer as qtd_itens
    from public.cotacao_itens i
   where i.cotacao_id = c.id
) it on true
left join lateral (
  select count(distinct o.cotacao_item_id)::integer as qtd_vencedores,
         sum(o.valor_venda_bruto)                   as total_bruto_vencedores
    from public.orcamentos_fornecedor o
   where o.cotacao_id = c.id
     and o.vencedor
) ov on true
left join lateral (
  select count(*)::integer as qtd_propostas
    from public.propostas p
   where p.cotacao_id = c.id
) pr on true;

comment on view public.v_kanban_cotacoes is
  'Cartão da coluna Cotação (vendas.md §3.1, §9.4): contadores de item, item com vencedor e '
  'proposta (os 4 inputs ocultos do Bubble) e o total bruto dos vencedores (015 D3: nulo sem '
  'vencedor). pode_propor = ícone de proposta (ipt contaproduto/contavencedor). Contadores por '
  'lateral, um agregado por tabela filha (020 D1). security_invoker = true: respeita a RLS de '
  'cotacoes e das filhas.';

-- ---------------------------------------------------------------------- v_kanban_pedidos
create or replace view public.v_kanban_pedidos
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
       vt.valor_total,
       en.qtd_entregas,
       en.qtd_concluidas,
       (en.qtd_entregas > 0 and en.qtd_abertas = 0)                  as todas_concluidas
from public.pedidos p
left join public.cotacoes cot      on cot.id = p.cotacao_id
left join public.grupos_clifor cli on cli.id = p.cliente_id
left join public.usuarios ven      on ven.id = p.vendedor_id
left join lateral (
  select sum(round(pi.qtd * pi.valor_venda_unit + pi.valor_frete, 2)) as valor_total
    from public.proposta_itens pi
   where pi.proposta_id = p.proposta_id
) vt on true
left join lateral (
  select count(*)::integer                                  as qtd_entregas,
         count(*) filter (where et.concluida)::integer      as qtd_concluidas,
         count(*) filter (where not et.concluida)::integer  as qtd_abertas
    from public.entregas e
    left join public.etapas et on et.id = e.status_id
   where e.pedido_id = p.id
) en on true;

comment on view public.v_kanban_pedidos is
  'Cartão da coluna Pedido (vendas.md §3.2, §9.4): valor_total = soma do SNAPSHOT de '
  'proposta_itens (015 D4; nulo sem proposta), contadores de entrega e todas_concluidas (015 D5: '
  'há entrega e toda entrega em etapa concluída — o cartão verde). Um agregado lateral por '
  'filha (020 D1). security_invoker = true.';


-- =====================================================================================
-- 2. ÍNDICES (D5)
-- =====================================================================================

-- Coluna Cotação: rascunho = false, arquivado = ?, etapa = 1 (ou <> 7), criado_em no mês,
-- ordem criado_em desc, id. Com e sem vendedor (gerência vê todos).
create index if not exists cotacoes_kanban_etapa_idx
  on public.cotacoes (etapa_id, arquivado, criado_em desc, id)
  where not rascunho;
create index if not exists cotacoes_kanban_vendedor_etapa_idx
  on public.cotacoes (vendedor_id, etapa_id, arquivado, criado_em desc)
  where not rascunho;

-- Agregado dos vencedores por cotação (lateral `ov`): só as linhas vencedoras, com o que o
-- agregado lê. `um_vencedor_por_item` (007) é por ITEM, não serve para "por cotação".
create index if not exists orcamentos_fornecedor_vencedor_cotacao_idx
  on public.orcamentos_fornecedor (cotacao_id)
  include (cotacao_item_id, valor_venda_bruto)
  where vencedor;

-- Coluna Pedido: finalizado = ?, etapa = 3 (ou 7), criado_em no mês, ordem criado_em desc.
create index if not exists pedidos_kanban_etapa_idx
  on public.pedidos (etapa_id, finalizado, criado_em desc, id);
create index if not exists pedidos_kanban_vendedor_etapa_idx
  on public.pedidos (vendedor_id, etapa_id, finalizado, criado_em desc);

-- Lateral `en` de v_kanban_pedidos: entregas do pedido já com o status (junção com etapas).
create index if not exists entregas_pedido_status_idx
  on public.entregas (pedido_id, status_id);

-- Coluna Entregas Próprias: saiu_entrega = true, status = 4 (5, 7), período em dt_pedido
-- (dt_entrega com "concluídos": entregas_status_dt_entrega_idx, 017). Com e sem vendedor.
create index if not exists entregas_kanban_status_idx
  on public.entregas (status_id, dt_pedido)
  where saiu_entrega;
create index if not exists entregas_kanban_vendedor_idx
  on public.entregas (vendedor_id, status_id, dt_pedido)
  where saiu_entrega;

-- Coluna Entregas Substituto: vendedor_substituto_id = ? (ou "tem substituto"), período em
-- dt_pedido. `entregas_substituto_idx` (009) não tem a data.
create index if not exists entregas_kanban_substituto_idx
  on public.entregas (vendedor_substituto_id, dt_pedido)
  where vendedor_substituto_id is not null;

-- Financeiro, lista e resumo: `cancelada_em is null` sempre; CR filtra `arquivado`; o filtro de
-- vencimento é o padrão dos cards. Os de data de entrega/pedido já existem em `entregas`.
create index if not exists contas_receber_lista_idx
  on public.contas_receber (arquivado, dt_vencimento)
  where cancelada_em is null;
create index if not exists contas_pagar_lista_idx
  on public.contas_pagar (dt_vencimento)
  where cancelada_em is null;
-- Card "vencidos": status aberto, não cancelada (e não arquivada, na CR), vencimento < hoje.
create index if not exists contas_receber_vencidas_idx
  on public.contas_receber (dt_vencimento)
  where status_id = 1 and cancelada_em is null and not arquivado;
create index if not exists contas_pagar_vencidas_idx
  on public.contas_pagar (dt_vencimento)
  where status_id = 3 and cancelada_em is null;


-- =====================================================================================
-- 3. FUNÇÃO DE RESUMO DO FINANCEIRO (D6–D8)
-- =====================================================================================
create or replace function public.fn_resumo_financeiro(
  p_aba          text,
  p_coluna_data  text,
  p_de           date,
  p_ate          date,
  p_situacao     text    default '',
  p_arquivados   boolean default false,
  p_clientes     uuid[]  default null,
  p_fornecedores uuid[]  default null,
  p_vendedor     uuid    default null,
  p_pedido       text    default null
)
returns table (qtd integer, comissao text, saldo text)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_view    text;
  v_aberto  smallint;
  v_quitado smallint;
  v_sql     text;
begin
  if p_aba = 'receber' then
    v_view := 'v_contas_receber';  v_aberto := 1;  v_quitado := 2;
    if p_coluna_data is not null and p_coluna_data not in
       ('dt_entrega', 'dt_vencimento', 'dt_pedido', 'ultima_dt_baixa', 'ultima_dt_credito') then
      raise exception 'Coluna de data inválida para contas a receber: %', p_coluna_data
        using errcode = '22023';
    end if;
  elsif p_aba = 'pagar' then
    v_view := 'v_contas_pagar';  v_aberto := 3;  v_quitado := 4;
    if p_coluna_data is not null and p_coluna_data not in
       ('dt_entrega', 'dt_vencimento', 'ultima_dt_baixa') then
      raise exception 'Coluna de data inválida para contas a pagar: %', p_coluna_data
        using errcode = '22023';
    end if;
  else
    raise exception 'Aba inválida: %', p_aba using errcode = '22023';
  end if;

  -- O MESMO recorte de consulta() em app/(app)/financeiro/page.tsx. Cancelada nunca entra.
  v_sql := format('select v.valor_comissao, v.saldo from public.%I v where v.cancelada_em is null', v_view);

  if p_situacao = 'vencidas' then
    -- "Vencidas" independe do período e da situação (card bTpVD).
    v_sql := v_sql || ' and v.vencida';
  else
    if p_coluna_data is null or p_de is null or p_ate is null then
      raise exception 'Período e coluna de data são obrigatórios fora de "vencidas"'
        using errcode = '22023';
    end if;
    v_sql := v_sql || format(' and v.%I between $1 and $2', p_coluna_data);
    if p_situacao = 'aberto' then
      v_sql := v_sql || format(' and v.status_id = %s', v_aberto);
    elsif p_situacao = 'quitado' then
      v_sql := v_sql || format(' and v.status_id = %s', v_quitado);
    elsif coalesce(p_situacao, '') <> '' then
      raise exception 'Situação inválida: %', p_situacao using errcode = '22023';
    end if;
  end if;

  -- CP não arquiva na 010: o filtro de arquivado é só da CR (como na tela).
  if p_aba = 'receber' then v_sql := v_sql || ' and v.arquivado = $3'; end if;
  if p_clientes     is not null then v_sql := v_sql || ' and v.cliente_id = any($4)';    end if;
  if p_fornecedores is not null then v_sql := v_sql || ' and v.fornecedor_id = any($5)'; end if;
  if p_vendedor     is not null then v_sql := v_sql || ' and v.vendedor_id = $6';        end if;
  if coalesce(p_pedido, '') <> '' then v_sql := v_sql || ' and v.pedido_numero = $7';    end if;

  return query execute
    'select count(*)::integer, '
    || 'round(coalesce(sum(r.valor_comissao), 0), 2)::text, '
    || 'round(coalesce(sum(r.saldo), 0), 2)::text '
    || 'from (' || v_sql || ') r'
    using p_de, p_ate, p_arquivados, p_clientes, p_fornecedores, p_vendedor, p_pedido;
end $$;

comment on function public.fn_resumo_financeiro(text, text, date, date, text, boolean, uuid[], uuid[], uuid, text) is
  'Totais do recorte filtrado do financeiro (financeiro.md §3.4): quantidade, soma da comissão e '
  'do saldo, numa consulta — no lugar de percorrer as linhas em lotes de 1.000 na aplicação. '
  'Mesmo filtro da lista, sobre v_contas_receber/v_contas_pagar. security invoker (020 D6): a '
  'RLS de quem chama decide. Coluna de data por lista fechada (D7). Dinheiro como texto (D8).';


-- =====================================================================================
-- 4. POLICIES: `(select f())` NO LUGAR DE `f()` (D9)
-- =====================================================================================
do $$
declare
  r          record;
  v_path     text := current_setting('search_path');
  v_using    text;
  v_check    text;
  v_novo_u   text;
  v_novo_c   text;
  v_alteradas integer := 0;
  -- Chamadas SEM `SELECT ` imediatamente antes. O `pg_get_expr` escreve `(select f())` como
  -- `( SELECT f() AS f)`, então o lookbehind separa o que já está embrulhado.
  c_sem_select constant text :=
    '(?<!SELECT )(public\.fn_usuario_ativo\(\)|public\.fn_hierarquia\(\)|'
    'public\.fn_pode_acessar_pagina\(''[a-z_]+''::text\)|auth\.uid\(\))';
begin
  -- Tudo qualificado no texto gerado (e re-lido sem depender do search_path).
  perform set_config('search_path', '', true);

  for r in
    select pol.polname,
           cls.relname,
           pg_get_expr(pol.polqual, pol.polrelid)      as usando,
           pg_get_expr(pol.polwithcheck, pol.polrelid) as confere
      from pg_catalog.pg_policy pol
      join pg_catalog.pg_class cls     on cls.oid = pol.polrelid
      join pg_catalog.pg_namespace nsp on nsp.oid = cls.relnamespace
     where nsp.nspname = 'public'
     order by cls.relname, pol.polname
  loop
    v_novo_u := case when r.usando  is null then null
                     else regexp_replace(r.usando,  c_sem_select, '(SELECT \1)', 'g') end;
    v_novo_c := case when r.confere is null then null
                     else regexp_replace(r.confere, c_sem_select, '(SELECT \1)', 'g') end;

    if v_novo_u is distinct from r.usando then
      execute format('alter policy %I on public.%I using (%s)', r.polname, r.relname, v_novo_u);
    end if;
    if v_novo_c is distinct from r.confere then
      execute format('alter policy %I on public.%I with check (%s)', r.polname, r.relname, v_novo_c);
    end if;
    if v_novo_u is distinct from r.usando or v_novo_c is distinct from r.confere then
      v_alteradas := v_alteradas + 1;
    end if;
  end loop;

  -- CONFERÊNCIA: nenhuma chamada solta pode ter sobrado.
  for r in
    select cls.relname, pol.polname
      from pg_catalog.pg_policy pol
      join pg_catalog.pg_class cls     on cls.oid = pol.polrelid
      join pg_catalog.pg_namespace nsp on nsp.oid = cls.relnamespace
     where nsp.nspname = 'public'
       and (coalesce(pg_get_expr(pol.polqual, pol.polrelid), '')      ~ c_sem_select
         or coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid), '') ~ c_sem_select)
  loop
    raise exception 'policy % em % ainda chama função por linha', r.polname, r.relname;
  end loop;

  raise notice '020: % policies reescritas com (select ...)', v_alteradas;
  perform set_config('search_path', v_path, true);
end $$;


-- =====================================================================================
-- 5. GRANTS
-- =====================================================================================
-- As views mantêm os GRANTs da 015 (`create or replace` não os toca).
revoke execute on function public.fn_resumo_financeiro(text, text, date, date, text, boolean, uuid[], uuid[], uuid, text)
  from public, anon;
grant  execute on function public.fn_resumo_financeiro(text, text, date, date, text, boolean, uuid[], uuid[], uuid, text)
  to authenticated;


-- =====================================================================================
-- 6. ESTATÍSTICA
-- =====================================================================================
analyze public.cotacoes;
analyze public.cotacao_itens;
analyze public.orcamentos_fornecedor;
analyze public.propostas;
analyze public.proposta_itens;
analyze public.pedidos;
analyze public.entregas;
analyze public.contas_receber;
analyze public.contas_pagar;
analyze public.baixas;


-- =====================================================================================
-- FIM da 020_desempenho.sql
-- =====================================================================================
-- CONFERÊNCIA
--   Nenhuma tabela nova, nenhuma policy nova ou removida, nenhum GRANT em tabela.
--   2 views recriadas (`create or replace`): mesmas 18 colunas na mesma ordem e tipo, ainda
--   security_invoker = true, GRANT da 015 preservado. v_kanban_entregas intocada.
--   12 índices `if not exists`, nenhum `concurrently`.
--   1 função: fn_resumo_financeiro — security invoker, search_path = '', execute só
--   authenticated. Nenhuma security definer nova.
--   Policies: só a forma da chamada muda (initPlan); a conferência do bloco 4 aborta se sobrar
--   chamada por linha.
--   Dinheiro: sum(numeric), round(…, 2), entregue como texto. Nenhum float. Nenhum segredo.
-- =====================================================================================
