-- =====================================================================================
-- 021_relatorios_graficos.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Os relatórios com o CONTEÚDO do Bubble. A 017 foi escrita sem o HTML dos blocos (o
-- decompilador não exportava o conteúdo de elemento HTML) e DEFINIU fórmulas para as abas de
-- Cotação e Prospecção (017 D7/D8). O HTML foi achado no export bruto `grupomegabox.bubble`
-- (página `relatorios`, elementos HTML A "relat por cliente", HTML B "relat por produto",
-- HTML C = Relatório de Cotações, HTML D = Relatório de Prospecção). Esta migration segue as
-- fórmulas DELE; as diferenças para a 017 estão em R1–R9 abaixo. Nada da 017 é apagado: as
-- funções dela continuam (o CSV e o teste de RLS as usam).
--
-- Mesmo princípio da 017: o navegador não soma. No Bubble os quatro blocos baixavam as tabelas
-- inteiras pela Data API (Tbl.Cotacao, Tbl.Propostas, EnderecosCliFor, GrupoCliFor, User) e
-- agregavam em JavaScript; aqui cada aba é UMA chamada que devolve o painel já agregado.
--
-- >>> FÓRMULAS DO HTML ORIGINAL (e onde divergem da 017) <<<
--   R1. COTAÇÃO — PERÍODO: mês/ano (selects "Mês" e "Ano"), pela data de criação. O HTML usa
--       o mês em UTC; aqui o mês é o de São Paulo (a cotação criada às 22h do dia 31 é do mês
--       31, não do seguinte). Filtros "Arquivado" e "Vendedor" como no HTML.
--   R2. COTAÇÃO — "Em Cotação" = etapa Cotação (arquivada ou não — o HTML não exclui);
--       "Virou Pedido" = etapa **Pedir** (id 2, `isPedido`: etapa normalizada = 'pedir'). A 017
--       usava etapa ≥ 2; na base só existem as etapas 1 e 2 em cotação, mas a regra agora é a
--       do HTML. "Arquivadas" = arquivado.
--   R3. COTAÇÃO — TAXA DE CONVERSÃO = pedidos NÃO arquivados ÷ cotações NÃO arquivadas
--       ("Pedidos ÷ Cotações Ativas"). A 017 dividia pelo total. O HTML arredonda para inteiro
--       na tela; aqui volta a fração com 4 casas e a tela arredonda igual.
--   R4. COTAÇÃO — POR VENDEDOR: total, ativas (não arquivadas), pedidos (ativos), conversão =
--       pedidos ÷ ativas (0 sem ativas), faturamento. Ordem = conversão (o "Ver ranking" do
--       HTML); a 017 ordenava por faturamento. Os destaques (maior faturamento, maior volume,
--       melhor conversão com mínimo de 3 ativas) são escolha, não soma: saem de lib/.
--   R5. COTAÇÃO — HISTÓRICO: de janeiro até o mês escolhido do MESMO ano, só com o filtro de
--       vendedor (o HTML ignora "Arquivado" no histórico); conversão mensal = regra R3.
--       "Conversão vs mês anterior" = mês escolhido − mês anterior, em pontos percentuais, dentro
--       desse histórico (janeiro não tem anterior). A 017 comparava com "período anterior de
--       mesmo tamanho".
--   R6. COTAÇÃO — FATURAMENTO, TICKET, TEMPO. O HTML procura campos que Tbl.Cotacao não tem
--       (cpo.ValorTotal…; cpo.DataFechamento… com "Modified Date" de reserva) e por isso mostra
--       "sem dados de valor", ticket "—" e tempo "0,0 dias" (captura relatorios-02). Mantida a
--       intenção com dado de verdade (definição da 017): faturamento = venda bruta dos
--       orçamentos vencedores das cotações em Pedir; ticket = média entre os pedidos com valor
--       (o HTML: média dos valores > 0); tempo = dias entre a criação e o primeiro pedido.
--   R7. PROSPECÇÃO — "ENVIADAS" pela DATA DE CRIAÇÃO da proposta com `enviada` (o HTML filtra
--       `cpo.PropostaEnviada` e data "Created Date"). A 017 usava `enviada_em`, que a carga só
--       preencheu em 1 de 7.574 propostas — a aba ficava quase vazia.
--   R8. PROSPECÇÃO — "CLIENTES" = grupos DISTINTOS que receberam proposta E cuja carteira é o
--       próprio vendedor ("Da carteira, prospectados"); o endereço é `QualCnpjFornecedor` com
--       reserva em `FaturarPara` → `cnpj_fornecedor_endereco_id`, senão
--       `faturar_para_endereco_id`. "Carteira" = grupos com `carteira_id` = vendedor (todos,
--       como o HTML — a 017 contava só clientes ativos). "Cobertura" = clientes ÷ carteira.
--       Só entram vendedores com proposta no mês (ou o filtrado). Totais = soma das linhas
--       (cobertura total = Σ clientes ÷ Σ carteira), como o HTML. O HTML mostrava o e-mail do
--       vendedor sob o nome; aqui NÃO: `usuarios.email_contato` não é concedido a authenticated
--       (004, privilégio por coluna). Vai a foto (`foto_path`) para o avatar.
--   R9. PROSPECÇÃO — "MÉDIA/DIA" = enviadas ÷ dias úteis (seg–sex) do mês, contados ATÉ HOJE
--       se o mês é o corrente (fuso de SP), no mínimo 1. Volume diário: só os dias úteis.
--
-- >>> "OUTROS RELATÓRIOS" (HTML A e B) <<<
--   O1. HTML B agrupa POR PRODUTO (uma linha por produto, com fornecedores/UFs/clientes
--       distintos) e filtra ITEM A ITEM ANTES de agregar: produto, fornecedor e cliente por
--       "contém" sem acento/caixa; UF por igualdade. `fn_rel_entregas_produtos` faz o mesmo.
--   O2. HTML A (Cliente × Mês) filtra as LINHAS por "contém" em Cliente e UF e o total geral é
--       o das linhas visíveis. `fn_rel_entregas_mes` recebe esses filtros e devolve os totais do
--       recorte (grouping sets), para Cliente e para Fornecedor (eixo de origem).
--   O3. Detalhamento ao clicar numa célula (os dois HTML): `fn_rel_entregas_detalhe`, até 1.000
--       entregas, com o número da cotação para o link.
--   Status, UF e agrupamento por filial: as regras da 017 (D1, D2, D3) valem.
--
-- Segurança: toda função `security invoker`, `search_path = ''`, sem EXECUTE para anon. O
-- sigilo por vendedor é o da 017 (RLS de quem lê + D9 nas listas por vendedor).
-- Idempotente (`create or replace`). Sem tabela nova, sem policy nova, sem seed.
-- =====================================================================================


-- =====================================================================================
-- 1. AUXILIARES
-- =====================================================================================

-- "contém" sem acento e sem caixa (o `norm` dos dois HTML). translate em vez de unaccent: a
-- extensão não está instalada e não vale uma dependência por isto.
create or replace function public.fn_rel_norm(p_texto text)
  returns text
  language sql
  immutable
  parallel safe
  set search_path = ''
as $$
  select lower(translate(coalesce(p_texto, ''),
    'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ',
    'AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn'))
$$;

comment on function public.fn_rel_norm(text) is
  'Minúsculas sem acento — o `norm` dos blocos HTML do Bubble, para os filtros "contém" (021 O1/O2).';

-- Filtro "contém": vazio/nulo não filtra. position() em vez de like: nada de escapar % e _.
create or replace function public.fn_rel_contem(p_valor text, p_filtro text)
  returns boolean
  language sql
  immutable
  parallel safe
  set search_path = ''
as $$
  select coalesce(btrim(p_filtro), '') = ''
      or position(public.fn_rel_norm(btrim(p_filtro)) in public.fn_rel_norm(p_valor)) > 0
$$;

comment on function public.fn_rel_contem(text, text) is
  'true quando o filtro é vazio ou está contido no valor, sem acento e sem caixa (021 O1/O2).';

-- Mês e ano do painel (R1): recusa fora de 1–12 e ano absurdo, como a 017 recusa período.
create or replace function public.fn_rel_validar_mes(p_ano integer, p_mes integer)
  returns void
  language plpgsql
  immutable
  set search_path = ''
as $$
begin
  if p_ano is null or p_mes is null or p_mes not between 1 and 12 or p_ano not between 2000 and 2100 then
    raise exception 'mês inválido: %/%', p_mes, p_ano using errcode = '22023';
  end if;
end
$$;


-- =====================================================================================
-- 2. ABA "RELATÓRIO DE COTAÇÃO" (HTML C) — R1 a R6
-- =====================================================================================
create or replace function public.fn_rel_cotacao_painel(
  p_ano       integer,
  p_mes       integer,
  p_vendedor  uuid    default null,
  p_arquivado boolean default null
)
  returns jsonb
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_ini      date;
  v_de       timestamptz;
  v_ate      timestamptz;
  v_ano_de   timestamptz;
  v_ve_todos boolean := (select public.fn_hierarquia()) <= 2;
  v_painel   jsonb;
begin
  perform public.fn_rel_validar_mes(p_ano, p_mes);
  v_ini    := make_date(p_ano, p_mes, 1);
  v_de     := v_ini::timestamp at time zone 'America/Sao_Paulo';
  v_ate    := (v_ini + interval '1 month')::timestamp at time zone 'America/Sao_Paulo';
  v_ano_de := make_date(p_ano, 1, 1)::timestamp at time zone 'America/Sao_Paulo';

  with base as (
    select c.id,
           c.vendedor_id,
           c.etapa_id,
           c.arquivado,
           c.criado_em,
           c.motivo_arquivamento_id,
           (c.etapa_id = 2) as pedido                                      -- R2: etapa Pedir
    from public.cotacoes c
    where not c.rascunho
      and c.criado_em >= v_de
      and c.criado_em <  v_ate
      and (p_vendedor  is null or c.vendedor_id = p_vendedor)
      and (p_arquivado is null or c.arquivado   = p_arquivado)
  ),
  valor as (                                                                -- R6
    select b.*,
           case when b.pedido then
             (select sum(o.valor_venda_bruto) from public.orcamentos_fornecedor o
               where o.cotacao_id = b.id and o.vencedor)
           end as fat,
           case when b.pedido then
             (select min(p.criado_em) from public.pedidos p where p.cotacao_id = b.id)
           end as primeiro_pedido
    from base b
  ),
  kpis as (
    select jsonb_build_object(
      'total',            count(*),
      'em_cotacao',       count(*) filter (where v.etapa_id = 1),
      'virou_pedido',     count(*) filter (where v.pedido),
      'arquivadas',       count(*) filter (where v.arquivado),
      'ativas',           count(*) filter (where not v.arquivado),
      'pedidos_ativos',   count(*) filter (where v.pedido and not v.arquivado),
      'taxa_conversao',   round((count(*) filter (where v.pedido and not v.arquivado))::numeric
                                / nullif(count(*) filter (where not v.arquivado), 0), 4),      -- R3
      'faturamento',      (coalesce(round(sum(v.fat) filter (where v.pedido), 2), 0))::text,
      'ticket_medio',     (round(avg(v.fat) filter (where v.pedido and v.fat > 0), 2))::text,
      'tempo_medio_dias', round(avg(extract(epoch from (v.primeiro_pedido - v.criado_em)) / 86400)
                                filter (where v.pedido and v.primeiro_pedido >= v.criado_em), 1)
    ) as j
    from valor v
  ),
  por_vendedor as (                                                         -- R4
    select v.vendedor_id,
           count(*)                                              as total,
           count(*) filter (where not v.arquivado)               as ativas,
           count(*) filter (where v.pedido and not v.arquivado)  as pedidos,
           coalesce(round(sum(v.fat) filter (where v.pedido), 2), 0) as faturamento
    from valor v
    where v_ve_todos or v.vendedor_id = (select auth.uid())                 -- 017 D9
    group by v.vendedor_id
  ),
  vendedores as (
    select coalesce(jsonb_agg(jsonb_build_object(
             'vendedor_id', x.vendedor_id,
             'nome',        coalesce(u.nome, 'Não informado'),
             'total',       x.total,
             'ativas',      x.ativas,
             'pedidos',     x.pedidos,
             'conversao',   coalesce(round(x.pedidos::numeric / nullif(x.ativas, 0), 4), 0),
             'faturamento', x.faturamento::text)
           order by coalesce(x.pedidos::numeric / nullif(x.ativas, 0), 0) desc, x.total desc, u.nome),
           '[]'::jsonb) as j
    from por_vendedor x
    left join public.usuarios u on u.id = x.vendedor_id
  ),
  motivos as (
    select coalesce(jsonb_agg(jsonb_build_object('motivo', m.motivo, 'qtd', m.qtd)
                              order by m.qtd desc, m.motivo), '[]'::jsonb) as j
    from (
      select coalesce(mo.nome, 'Não informado') as motivo, count(*) as qtd
      from base b
      left join public.motivos_arquivamento mo on mo.id = b.motivo_arquivamento_id
      where b.arquivado
      group by 1
    ) m
  ),
  historico as (                                                            -- R5
    select coalesce(jsonb_agg(jsonb_build_object(
             'mes',       g.m,
             'ativas',    coalesce(h.ativas, 0),
             'pedidos',   coalesce(h.pedidos, 0),
             'conversao', coalesce(round(h.pedidos::numeric / nullif(h.ativas, 0), 4), 0))
           order by g.m), '[]'::jsonb) as j
    from generate_series(1, p_mes) as g(m)
    left join (
      select extract(month from c.criado_em at time zone 'America/Sao_Paulo')::integer as m,
             count(*) filter (where not c.arquivado)                    as ativas,
             count(*) filter (where not c.arquivado and c.etapa_id = 2) as pedidos
      from public.cotacoes c
      where not c.rascunho
        and c.criado_em >= v_ano_de
        and c.criado_em <  v_ate
        and (p_vendedor is null or c.vendedor_id = p_vendedor)
      group by 1
    ) h on h.m = g.m
  )
  select jsonb_build_object(
           'kpis',       k.j,
           'vendedores', ve.j,
           'motivos',    mo.j,
           'historico',  hi.j)
    into v_painel
  from kpis k, vendedores ve, motivos mo, historico hi;

  return v_painel;
end
$$;

comment on function public.fn_rel_cotacao_painel(integer, integer, uuid, boolean) is
  'Aba "Relatório de Cotação" = HTML C do Bubble, numa chamada: kpis, vendedores (ranking por '
  'conversão), motivos de arquivamento e histórico mensal do ano. Fórmulas em R1–R6 da 021. '
  'Dinheiro vai como texto (numeric exato).';


-- =====================================================================================
-- 3. ABA "RELATÓRIO DE PROSPECÇÃO" (HTML D) — R7 a R9
-- =====================================================================================
create or replace function public.fn_rel_prospeccao_painel(
  p_ano      integer,
  p_mes      integer,
  p_vendedor uuid default null
)
  returns jsonb
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_ini      date;
  v_ult      date;
  v_lim      date;
  v_hoje     date := (now() at time zone 'America/Sao_Paulo')::date;
  v_de       timestamptz;
  v_ate      timestamptz;
  v_uteis    integer;
  v_ve_todos boolean := (select public.fn_hierarquia()) <= 2;
  v_eu       uuid    := (select auth.uid());
  v_painel   jsonb;
begin
  perform public.fn_rel_validar_mes(p_ano, p_mes);
  v_ini := make_date(p_ano, p_mes, 1);
  v_ult := (v_ini + interval '1 month' - interval '1 day')::date;
  v_de  := v_ini::timestamp at time zone 'America/Sao_Paulo';
  v_ate := (v_ult + 1)::timestamp at time zone 'America/Sao_Paulo';

  -- R9: mês corrente conta os dias úteis até hoje.
  v_lim := case when date_trunc('month', v_hoje)::date = v_ini then least(v_ult, v_hoje) else v_ult end;
  select greatest(count(*), 1)::integer into v_uteis
  from generate_series(v_ini, v_lim, interval '1 day') d
  where extract(isodow from d) < 6;

  with env as (                                                             -- R7
    select p.vendedor_id,
           (p.criado_em at time zone 'America/Sao_Paulo')::date as dia,
           e.grupo_id
    from public.propostas p
    left join public.enderecos_clifor e
      on e.id = coalesce(p.cnpj_fornecedor_endereco_id, p.faturar_para_endereco_id)   -- R8
    where p.enviada
      and p.criado_em >= v_de
      and p.criado_em <  v_ate
      and (p_vendedor is null or p.vendedor_id = p_vendedor)
      and (v_ve_todos or p.vendedor_id = v_eu)                              -- 017 D9
  ),
  por as (
    select e.vendedor_id,
           count(*) as enviadas,
           count(distinct e.grupo_id) filter (where g.carteira_id = e.vendedor_id) as clientes
    from env e
    left join public.grupos_clifor g on g.id = e.grupo_id
    group by e.vendedor_id
  ),
  alvo as (
    select vendedor_id from por
    union
    select p_vendedor where p_vendedor is not null and (v_ve_todos or p_vendedor = v_eu)
  ),
  linhas as (
    select a.vendedor_id,
           coalesce(u.nome, '(vendedor sem cadastro)') as nome,
           u.foto_path                                 as foto_path,
           coalesce(po.enviadas, 0)                    as enviadas,
           coalesce(po.clientes, 0)                    as clientes,
           (select count(*) from public.grupos_clifor g where g.carteira_id = a.vendedor_id) as carteira
    from alvo a
    left join por po           on po.vendedor_id = a.vendedor_id
    left join public.usuarios u on u.id = a.vendedor_id
  ),
  vendedores as (
    select coalesce(jsonb_agg(jsonb_build_object(
             'vendedor_id',          l.vendedor_id,
             'nome',                 l.nome,
             'foto_path',            l.foto_path,
             'enviadas',             l.enviadas,
             'clientes',             l.clientes,
             'carteira',             l.carteira,
             'cobertura',            coalesce(round(l.clientes::numeric / nullif(l.carteira, 0), 4), 0),
             'cobertura_propostas',  coalesce(round(l.enviadas::numeric / nullif(l.carteira, 0), 4), 0),
             'media_dia',            round(l.enviadas::numeric / v_uteis, 2))
           order by l.enviadas desc,
                    coalesce(l.clientes::numeric / nullif(l.carteira, 0), 0) desc,
                    l.nome), '[]'::jsonb) as j
    from linhas l
  ),
  totais as (
    select jsonb_build_object(
             'enviadas',  coalesce(sum(l.enviadas), 0),
             'clientes',  coalesce(sum(l.clientes), 0),
             'carteira',  coalesce(sum(l.carteira), 0),
             'cobertura', coalesce(round(sum(l.clientes)::numeric / nullif(sum(l.carteira), 0), 4), 0),
             'media_dia', round(coalesce(sum(l.enviadas), 0)::numeric / v_uteis, 2)) as j
    from linhas l
  ),
  diario as (
    select coalesce(jsonb_agg(jsonb_build_object('dia', d::date, 'propostas', coalesce(x.n, 0))
                              order by d), '[]'::jsonb) as j
    from generate_series(v_ini, v_ult, interval '1 day') d
    left join (select e.dia, count(*) as n from env e group by e.dia) x on x.dia = d::date
    where extract(isodow from d) < 6
  )
  select jsonb_build_object(
           'dias_uteis', v_uteis,
           'vendedores', ve.j,
           'totais',     t.j,
           'diario',     di.j)
    into v_painel
  from vendedores ve, totais t, diario di;

  return v_painel;
end
$$;

comment on function public.fn_rel_prospeccao_painel(integer, integer, uuid) is
  'Aba "Relatório de Prospecção" = HTML D do Bubble, numa chamada: vendedores (ranking por '
  'enviadas), totais, dias úteis e volume diário (dias úteis do mês). Fórmulas em R7–R9 da 021.';

-- carteira é contada por vendedor a cada chamada; a 017 já indexou grupos_clifor(carteira_id).
-- propostas por data de criação (R7): índice parcial das enviadas.
create index if not exists propostas_enviada_criado_em_idx on public.propostas (criado_em)
  where enviada;


-- =====================================================================================
-- 4. "OUTROS RELATÓRIOS" (HTML A e B) — O1 a O3
-- =====================================================================================

-- ------------------------------------------------------------- O1: por produto (HTML B)
create or replace function public.fn_rel_entregas_produtos(
  p_inicio     date,
  p_fim        date,
  p_vendedor   uuid default null,
  p_produto    text default null,
  p_fornecedor text default null,
  p_uf         text default null,
  p_cliente    text default null
)
  returns table (
    nivel             smallint,   -- 0 produto · 1 total geral
    produto_id        uuid,
    produto           text,
    qtd               numeric,
    valor_venda_bruto numeric,
    valor_comissao    numeric,
    fornecedores      text[],
    ufs               text[],
    clientes          text[],
    qtd_entregas      bigint
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  with f as (
    select v.produto_id, v.produto, v.fornecedor, v.cliente, v.uf_destino::text as uf,
           v.qtd, v.valor_venda_bruto, v.valor_comissao
    from public.v_rel_entregas v
    where v.status_id = 5                                                   -- 017 D1
      and v.dt_entrega between p_inicio and p_fim
      and (p_vendedor is null or p_vendedor in (v.vendedor_id, v.vendedor_substituto_id))
      and public.fn_rel_contem(v.produto,    p_produto)
      and public.fn_rel_contem(v.fornecedor, p_fornecedor)
      and public.fn_rel_contem(v.cliente,    p_cliente)
      and (coalesce(btrim(p_uf), '') = '' or upper(v.uf_destino::text) = upper(btrim(p_uf)))  -- UF exata
  )
  select grouping(f.produto_id)::smallint,
         f.produto_id,
         f.produto,
         coalesce(round(sum(f.qtd), 3), 0),
         coalesce(round(sum(f.valor_venda_bruto), 2), 0),
         coalesce(round(sum(f.valor_comissao), 2), 0),
         coalesce(array_agg(distinct f.fornecedor order by f.fornecedor) filter (where f.fornecedor is not null), '{}'),
         coalesce(array_agg(distinct f.uf order by f.uf)                 filter (where f.uf is not null), '{}'),
         coalesce(array_agg(distinct f.cliente order by f.cliente)       filter (where f.cliente is not null), '{}'),
         count(*)
  from f
  group by grouping sets ((f.produto_id, f.produto), ())
  order by 1, 3, 2;
end
$$;

comment on function public.fn_rel_entregas_produtos(date, date, uuid, text, text, text, text) is
  'HTML B do Bubble (relat por produto): uma linha por produto com qtd, venda, comissão e as '
  'listas distintas de fornecedor/UF/cliente; nivel 1 = total do recorte. Filtros aplicados '
  'entrega a entrega ANTES de agregar (021 O1).';

-- --------------------------------------------- O2: Cliente/Fornecedor × Mês (HTML A)
create or replace function public.fn_rel_entregas_mes(
  p_eixo     text,
  p_inicio   date,
  p_fim      date,
  p_vendedor uuid default null,
  p_nome     text default null,
  p_uf       text default null
)
  returns table (
    nivel             smallint,   -- 0 célula · 1 total da linha · 2 total do mês · 3 total geral
    endereco_id       uuid,
    nome              text,
    uf                text,
    mes               date,
    qtd               numeric,
    valor_venda_bruto numeric,
    valor_comissao    numeric,
    qtd_entregas      bigint
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_forn boolean;
begin
  if p_eixo is null or p_eixo not in ('cliente', 'fornecedor') then
    raise exception 'eixo inválido: %', p_eixo using errcode = '22023';
  end if;
  v_forn := p_eixo = 'fornecedor';
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  with f as (
    select case when v_forn then v.fornecedor_endereco_id else v.cliente_endereco_id end as endereco_id,
           case when v_forn then v.fornecedor             else v.cliente             end as nome,
           (case when v_forn then v.uf_origem else v.uf_destino end)::text                 as uf,
           v.mes, v.qtd, v.valor_venda_bruto, v.valor_comissao
    from public.v_rel_entregas v
    where v.status_id = 5
      and v.dt_entrega between p_inicio and p_fim
      and (p_vendedor is null or p_vendedor in (v.vendedor_id, v.vendedor_substituto_id))
  )
  select (grouping(f.endereco_id) * 2 + grouping(f.mes))::smallint,
         f.endereco_id,
         f.nome,
         f.uf,
         f.mes,
         coalesce(round(sum(f.qtd), 3), 0),
         coalesce(round(sum(f.valor_venda_bruto), 2), 0),
         coalesce(round(sum(f.valor_comissao), 2), 0),
         count(*)
  from f
  where public.fn_rel_contem(f.nome, p_nome)
    and public.fn_rel_contem(f.uf,   p_uf)
  group by grouping sets (
    (f.endereco_id, f.nome, f.uf, f.mes),
    (f.endereco_id, f.nome, f.uf),
    (f.mes),
    ()
  )
  order by grouping(f.endereco_id), f.nome, f.endereco_id, grouping(f.mes), f.mes;
end
$$;

comment on function public.fn_rel_entregas_mes(text, date, date, uuid, text, text) is
  'HTML A do Bubble (Cliente × Mês) e o mesmo para Fornecedor (eixo de origem), com os filtros '
  '"contém" de nome e UF do bloco; totais do recorte pelo banco (021 O2). Mesmo formato de linha '
  'de fn_rel_entregas_cliente_mes (017).';

-- ------------------------------------------------------------------- O3: detalhamento
create or replace function public.fn_rel_entregas_detalhe(
  p_inicio      date,
  p_fim         date,
  p_vendedor    uuid default null,
  p_produto_id  uuid default null,
  p_eixo        text default null,     -- 'cliente' | 'fornecedor' quando p_endereco_id vem
  p_endereco_id uuid default null,
  p_mes         date default null,
  p_fornecedor  text default null,
  p_uf          text default null,
  p_cliente     text default null
)
  returns table (
    entrega_id              uuid,
    cotacao_id              uuid,
    cotacao_numero          integer,
    dt_entrega              date,
    produto                 text,
    cliente                 text,
    uf_destino              text,
    fornecedor              text,
    uf_origem               text,
    qtd                     numeric,
    valor_venda_bruto_unit  numeric,
    valor_venda_bruto       numeric,
    valor_comissao          numeric
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  if p_endereco_id is not null and (p_eixo is null or p_eixo not in ('cliente', 'fornecedor')) then
    raise exception 'eixo inválido: %', p_eixo using errcode = '22023';
  end if;
  return query
  select v.entrega_id,
         v.cotacao_id,
         c.numero,
         v.dt_entrega,
         v.produto,
         v.cliente,
         v.uf_destino::text,
         v.fornecedor,
         v.uf_origem::text,
         v.qtd,
         v.valor_venda_bruto_unit,
         v.valor_venda_bruto,
         v.valor_comissao
  from public.v_rel_entregas v
  left join public.cotacoes c on c.id = v.cotacao_id
  where v.status_id = 5
    and v.dt_entrega between p_inicio and p_fim
    and (p_vendedor   is null or p_vendedor in (v.vendedor_id, v.vendedor_substituto_id))
    and (p_produto_id is null or v.produto_id = p_produto_id)
    and (p_endereco_id is null
         or (p_eixo = 'cliente'    and v.cliente_endereco_id    = p_endereco_id)
         or (p_eixo = 'fornecedor' and v.fornecedor_endereco_id = p_endereco_id))
    and (p_mes is null or v.mes = p_mes)
    and public.fn_rel_contem(v.fornecedor, p_fornecedor)
    and public.fn_rel_contem(v.cliente,    p_cliente)
    and (coalesce(btrim(p_uf), '') = '' or upper(v.uf_destino::text) = upper(btrim(p_uf)))
  order by v.dt_entrega, c.numero, v.entrega_id
  limit 1000;
end
$$;

comment on function public.fn_rel_entregas_detalhe(date, date, uuid, uuid, text, uuid, date, text, text, text) is
  'Detalhamento ao clicar numa célula dos HTML A/B (021 O3): as entregas que compõem o número, '
  'com o número da cotação para o link. No máximo 1.000 linhas.';


-- =====================================================================================
-- 5. GRANTS — nada para anon
-- =====================================================================================
revoke execute on function public.fn_rel_norm(text)                                        from public, anon;
revoke execute on function public.fn_rel_contem(text, text)                                from public, anon;
revoke execute on function public.fn_rel_validar_mes(integer, integer)                     from public, anon;
revoke execute on function public.fn_rel_cotacao_painel(integer, integer, uuid, boolean)   from public, anon;
revoke execute on function public.fn_rel_prospeccao_painel(integer, integer, uuid)         from public, anon;
revoke execute on function public.fn_rel_entregas_produtos(date, date, uuid, text, text, text, text) from public, anon;
revoke execute on function public.fn_rel_entregas_mes(text, date, date, uuid, text, text)  from public, anon;
revoke execute on function public.fn_rel_entregas_detalhe(date, date, uuid, uuid, text, uuid, date, text, text, text) from public, anon;

grant execute on function public.fn_rel_norm(text)                                        to authenticated, service_role;
grant execute on function public.fn_rel_contem(text, text)                                to authenticated, service_role;
grant execute on function public.fn_rel_validar_mes(integer, integer)                     to authenticated, service_role;
grant execute on function public.fn_rel_cotacao_painel(integer, integer, uuid, boolean)   to authenticated, service_role;
grant execute on function public.fn_rel_prospeccao_painel(integer, integer, uuid)         to authenticated, service_role;
grant execute on function public.fn_rel_entregas_produtos(date, date, uuid, text, text, text, text) to authenticated, service_role;
grant execute on function public.fn_rel_entregas_mes(text, date, date, uuid, text, text)  to authenticated, service_role;
grant execute on function public.fn_rel_entregas_detalhe(date, date, uuid, uuid, text, uuid, date, text, text, text) to authenticated, service_role;

-- =====================================================================================
-- FIM da 021. 0 tabelas, 0 policies, 1 índice parcial (propostas.criado_em onde enviada),
-- 8 funções: todas security invoker, search_path = '', sem EXECUTE para anon/public.
-- =====================================================================================
