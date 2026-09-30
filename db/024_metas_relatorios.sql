-- =====================================================================================
-- 024_metas_relatorios.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- O que faltava na página `metas` depois da 011: o DETALHAMENTO das entregas de uma meta
-- (popup `pop entregas`, bTvtb), a ANÁLISE DE ENTREGAS (HTML A bUEzP) e o RELATÓRIO ANUAL DE
-- VENDAS (HTML C bUFCJ, visível para hierarquia ≤ 1). O decompilador não exporta o conteúdo
-- de elemento HTML; o HTML de A e C foi lido no export bruto `grupomegabox.bubble` e as
-- fórmulas abaixo são as DELE (citadas por função do JavaScript original).
--
-- Mesmo princípio da 017/021: o navegador não soma. No Bubble os blocos baixavam as tabelas
-- inteiras pela Data API e agregavam em JavaScript; aqui cada painel é UMA chamada.
--
-- >>> DETALHAMENTO DA META (pop entregas) <<<
--   D1. `fn_metas_entregas_meta(p_meta)`: as MESMAS entregas que produzem o "Valor faturado"
--       da linha: `fn_entregas_da_meta` (011 D4) — a regra do mapa, AO VIVO, como o popup do
--       Bubble (`rpg detalha entregas vendedor` filtra `rpg entregas gerais`, também para meta
--       fechada). Meta ABERTA: soma = `v_meta_atingimento.realizado`, sempre (conferido por
--       scripts/testar-rls-metas-relatorios.mjs). Meta FECHADA: a linha mostra o valor
--       congelado (011 D7); nas metas fechadas no Bubble o congelado nem sempre bate com as
--       entregas de hoje (a lista `QuaisEntregas` do Bubble misturava titular e substituto e
--       as entregas mudaram depois) — a tela avisa a diferença em vez de esconder. Metas
--       fechadas pelo app novo congelam esta mesma lista (fn_fechar_meta). Colunas do popup (bTvtc):
--       Qtd, Data entrega (dtentrega), Fornecedor (Grupo + Filial de origem), Cliente (Grupo
--       + Filial de destino), Vendedor, Produto, Comissão unit, Valor comissão, NF fornecedor,
--       Num pedido. Os filtros por coluna (bTwBx…bTwCQ) são da tela, sobre esta lista.
--
-- >>> ANÁLISE DE ENTREGAS (HTML A) <<<
--   A1. REALIZADAS = `buscarRealizadas`: StatusEntrega = Financeiro E DtEntrega no período. Aqui
--       o status é `fn_status_realizado()` (011 D3: Financeiro OU Concluído), para o gráfico
--       bater com o "Valor faturado" da tabela logo acima — no Bubble as duas coisas usavam só
--       Financeiro e batiam; com a regra D3 da 011, usar só 5 aqui faria o gráfico divergir.
--   A2. EM ANDAMENTO = DtPrevEntrega no período e status fora do realizado e ≠ Cancelado.
--       CANCELADAS = DtPrevEntrega no período e status Cancelado (`carregar`, `candOutras`).
--   A3. ACESSO (`contextoUsuario`): Diretor vê os três gráficos com todos; os demais perfis NÃO
--       veem "realizadas" e veem andamento/canceladas SÓ das entregas deles (QualVendedor =
--       usuário). Aqui a regra é a mesma, no banco (fn_hierarquia), e a RLS de entregas vale por
--       cima (security invoker).
--   A4. Barra = contagem de entregas do vendedor, rótulo = soma da comissão (`render`); lista
--       do clique = Nº entrega, Fornecedor/Cliente (grupos), Data, Valor venda, Comissão, Status
--       (`openModal`). Ordem das barras por contagem (desc) — decidida na tela.
--
-- >>> RELATÓRIO ANUAL DE VENDAS (HTML C) <<<
--   R1. ETAPAS (`classificar` + STATUS_MAP). O STATUS_MAP do HTML procura rótulos que NÃO
--       existem no option set Etapas ('Fechado', 'Pedido Fechado', 'Aguardando Entrega', 'Entregue'…):
--       na prática só "Financeiro" e "Cancelado" eram reconhecidos, e FECHADO = ENTREGUE =
--       FATURADO. Mantida a INTENÇÃO do HTML com as etapas reais (metas [DÚVIDA] em 04-duvidas,
--       seção "Metas: relatórios e pódio"): FECHADO = Pedido, Em Entrega, Financeiro, Concluído
--       (3,4,5,6); ENTREGUE = Financeiro, Concluído (5,6 — FINANCEIRO_IMPLICA_ENTREGUE);
--       FATURADO = `fn_status_realizado()`; CANCELADO = 7. Cancelado sai de todas as outras.
--   R2. DATA DE CADA ETAPA (DATA_BUCKET): FECHADO e CANCELADO pela data do pedido (reserva:
--       criação); ENTREGUE e FATURADO pela data de entrega (reserva: data do pedido). As datas
--       já são de São Paulo (`date`), então o `mesAnoLocal` do HTML é implícito.
--   R3. MESES ENCERRADOS (`agregar` 5a/5b): se o mês tem meta FECHADA com entregas vinculadas,
--       a verdade do mês são essas entregas (no mês e no vendedor da meta fechada); entrega fora
--       do fechamento não entra naquele mês. A entrega vinculada cuja nenhuma data cai no mês da
--       meta volta para o cálculo por datas (`foraDoMes`). Mês sem fechamento: por datas.
--   R4. VALOR CONSIDERADO (`fValor`): comissão MegaBox (padrão, "valor faturado"), venda bruta
--       ou venda líquida. META = soma de metas_mensais.valor_meta pela competência; COMISSÕES =
--       metas_fechadas (total_comissao_megabox / total_comissao_vendedor) pela competência.
--   R5. A meta coletiva de cada mês (`calcularMetaColetiva`) é conta de tela sobre o
--       com_megabox do ano e do anterior: lib/metas `metaColetiva` (mesma regra de bTzgt0).
--   R6. ACESSO: o bloco só aparece para hierarquia ≤ 1 (bUFCJ); aqui as duas funções RECUSAM
--       (42501) quem não é perfil 1 — não basta esconder na tela.
--   R7. DETALHAMENTO (`renderDetalhe`): paginado no banco (25 por página no HTML), com total.
--       "Status financeiro" não existe em `entregas` (não migrou, 02 §3.3): a coluna sai.
--
-- Todas: security invoker, search_path = '', execute só para authenticated (e service_role).
-- Dinheiro em numeric com round(, 2) explícito.
-- =====================================================================================


-- =====================================================================================
-- 1. DETALHAMENTO DA META
-- =====================================================================================
create or replace function public.fn_metas_entregas_meta(p_meta uuid)
  returns table (
    entrega_id             uuid,
    numero_entrega         text,
    dt_entrega             date,
    fornecedor_id          uuid,
    fornecedor             text,
    fornecedor_filial      text,
    cliente_id             uuid,
    cliente                text,
    cliente_filial         text,
    vendedor_id            uuid,
    vendedor_substituto_id uuid,
    produto                text,
    valor_comissao_unit    numeric,
    valor_comissao         numeric,
    nf_fornecedor          text,
    numero_pedido          text
  )
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  with ids as (select d.entrega_id from public.fn_entregas_da_meta(p_meta) d)
  select e.id,
         e.numero_entrega,
         e.dt_entrega,
         e.fornecedor_id,
         upper(forn.nome),
         eo.nome_endereco,
         e.cliente_id,
         upper(cli.nome),
         ed.nome_endereco,
         e.vendedor_id,
         e.vendedor_substituto_id,
         pr.nome,
         e.valor_comissao_unit,
         e.valor_comissao,
         e.nf_fornecedor_numero,
         p.numero::text
  from ids
  join public.entregas e                  on e.id = ids.entrega_id
  join public.pedidos p                   on p.id = e.pedido_id
  join public.orcamentos_fornecedor o     on o.id = e.orcamento_fornecedor_id
  join public.produtos pr                 on pr.id = o.produto_id
  left join public.grupos_clifor forn     on forn.id = e.fornecedor_id
  left join public.grupos_clifor cli      on cli.id = e.cliente_id
  left join public.enderecos_clifor eo    on eo.id = o.endereco_origem_id
  left join public.enderecos_clifor ed    on ed.id = o.endereco_destino_id
  order by e.dt_entrega, e.numero_entrega, e.id
$$;

comment on function public.fn_metas_entregas_meta(uuid) is
  '024 D1: entregas que compõem o "Valor faturado" de uma meta (popup pop entregas, bTvtc) — '
  'fn_entregas_da_meta ao vivo. Meta aberta: soma = v_meta_atingimento.realizado.';


-- =====================================================================================
-- 2. ANÁLISE DE ENTREGAS (HTML A)
-- =====================================================================================

-- Base comum: uma linha por entrega que entra em alguma das três categorias (A1–A3).
create or replace function public.fn_metas_analise_base(p_inicio date, p_fim date)
  returns table (categoria text, entrega_id uuid)
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  with quem as (select public.fn_hierarquia() as h, auth.uid() as eu)
  select 'realizada', e.id
  from public.entregas e, quem
  where quem.h = 1                                                     -- A3: só Diretor
    and e.status_id = any (public.fn_status_realizado())
    and e.dt_entrega between p_inicio and p_fim
  union all
  select case when e.status_id = 7 then 'cancelada' else 'andamento' end, e.id
  from public.entregas e, quem
  where e.dt_prev_entrega between p_inicio and p_fim
    and not (e.status_id = any (public.fn_status_realizado()))
    and (quem.h = 1 or e.vendedor_id = quem.eu)                        -- A3: os demais, só as suas
$$;

create or replace function public.fn_metas_analise_entregas(p_inicio date, p_fim date)
  returns table (
    categoria       text,
    vendedor_id     uuid,
    qtd             bigint,
    valor_comissao  numeric,
    valor_venda     numeric
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  select b.categoria,
         e.vendedor_id,
         count(*),
         round(coalesce(sum(e.valor_comissao), 0), 2),
         round(coalesce(sum(e.valor_venda_bruto), 0), 2)
  from public.fn_metas_analise_base(p_inicio, p_fim) b
  join public.entregas e on e.id = b.entrega_id
  group by b.categoria, e.vendedor_id
  order by b.categoria, count(*) desc, e.vendedor_id;
end
$$;

comment on function public.fn_metas_analise_entregas(date, date) is
  '024 A1–A4: "Análise de Entregas" (HTML A bUEzP) — por categoria (realizada | andamento | '
  'cancelada) e vendedor: quantidade, comissão e venda bruta. Realizadas só para o Diretor.';

create or replace function public.fn_metas_analise_lista(
  p_inicio    date,
  p_fim       date,
  p_categoria text,
  p_vendedor  uuid
)
  returns table (
    entrega_id     uuid,
    numero_entrega text,
    fornecedor     text,
    cliente        text,
    data           date,
    valor_venda    numeric,
    valor_comissao numeric,
    status         text
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  select e.id,
         e.numero_entrega,
         upper(forn.nome),
         upper(cli.nome),
         case when b.categoria = 'realizada' then coalesce(e.dt_entrega, e.dt_prev_entrega)
              else e.dt_prev_entrega end,
         e.valor_venda_bruto,
         e.valor_comissao,
         et.nome
  from public.fn_metas_analise_base(p_inicio, p_fim) b
  join public.entregas e             on e.id = b.entrega_id
  join public.etapas et              on et.id = e.status_id
  left join public.grupos_clifor forn on forn.id = e.fornecedor_id
  left join public.grupos_clifor cli  on cli.id = e.cliente_id
  where b.categoria = p_categoria
    and e.vendedor_id is not distinct from p_vendedor
  order by e.valor_comissao desc nulls last, e.numero_entrega;
end
$$;

comment on function public.fn_metas_analise_lista(date, date, text, uuid) is
  '024 A4: as entregas de UMA barra da Análise de Entregas (openModal do HTML A).';


-- =====================================================================================
-- 3. RELATÓRIO ANUAL DE VENDAS (HTML C)
-- =====================================================================================

-- Guarda R6: só o perfil 1 (hierarquia ≤ 1, bUFCJ).
create or replace function public.fn_metas_exigir_diretor()
  returns void
  language plpgsql
  stable
  set search_path = ''
as $$
begin
  if coalesce(public.fn_hierarquia(), 99) > 1 then
    raise exception 'relatório anual: só hierarquia 1 (bUFCJ)' using errcode = '42501';
  end if;
end
$$;

-- Lançamentos do ano: uma linha por (entrega, etapa) no mês e vendedor em que ela conta (R1–R4).
create or replace function public.fn_metas_anual_lancamentos(p_ano integer, p_valor text)
  returns table (
    entrega_id  uuid,
    mes         integer,
    vendedor_id uuid,
    etapa       text,
    valor       numeric,
    fechado     boolean
  )
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  with par as (
    select make_date(p_ano, 1, 1) as ini, make_date(p_ano, 12, 31) as fim,
           public.fn_status_realizado() as realizado
  ),
  ent as (
    select e.id, e.vendedor_id, e.status_id, e.dt_pedido, e.dt_entrega,
           (e.criado_em at time zone 'America/Sao_Paulo')::date as criado,
           case p_valor when 'venda_bruta'   then e.valor_venda_bruto
                        when 'venda_liquida' then e.valor_venda_liquido
                        else e.valor_comissao end as valor
    from public.entregas e, par
    where coalesce(e.dt_pedido, (e.criado_em at time zone 'America/Sao_Paulo')::date) between par.ini and par.fim
       or e.dt_entrega between par.ini and par.fim
  ),
  etapas as (   -- R1 + R2: cada etapa com a sua data
    select ent.id, ent.vendedor_id, ent.valor, k.etapa, k.dia
    from ent, par
    cross join lateral (values
      ('fechado',   ent.status_id in (3, 4, 5, 6),            coalesce(ent.dt_pedido, ent.criado)),
      ('entregue',  ent.status_id in (5, 6),                  coalesce(ent.dt_entrega, ent.dt_pedido)),
      ('cancelado', ent.status_id = 7,                        coalesce(ent.dt_pedido, ent.criado)),
      ('faturado',  ent.status_id = any (par.realizado),      coalesce(ent.dt_entrega, ent.dt_pedido))
    ) as k(etapa, conta, dia)
    where k.conta
  ),
  vinc as (     -- R3: entregas amarradas a meta fechada do ano, com alguma data no mês da meta
    select mfe.entrega_id, extract(month from mf.competencia)::integer as mes, mf.vendedor_id
    from public.meta_fechada_entregas mfe
    join public.metas_fechadas mf on mf.id = mfe.meta_fechada_id
    join ent on ent.id = mfe.entrega_id
    where extract(year from mf.competencia)::integer = p_ano
      and (   date_trunc('month', ent.dt_entrega) = mf.competencia
           or date_trunc('month', ent.dt_pedido)  = mf.competencia
           or date_trunc('month', ent.criado)     = mf.competencia)
  ),
  meses_fechados as (select distinct v.mes from vinc v)
  select et.id, v.mes, v.vendedor_id, et.etapa, et.valor, true
  from etapas et
  join vinc v on v.entrega_id = et.id
  union all
  select et.id, extract(month from et.dia)::integer, et.vendedor_id, et.etapa, et.valor, false
  from etapas et
  where not exists (select 1 from vinc v where v.entrega_id = et.id)
    and extract(year from et.dia)::integer = p_ano
    and extract(month from et.dia)::integer not in (select mf.mes from meses_fechados mf)
$$;

create or replace function public.fn_metas_relatorio_anual(p_ano integer, p_valor text default 'comissao')
  returns table (
    mes            integer,
    vendedor_id    uuid,
    fechado        numeric,
    entregue       numeric,
    cancelado      numeric,
    faturado       numeric,
    qtd_fechado    bigint,
    qtd_entregue   bigint,
    qtd_faturado   bigint,
    meta           numeric,
    com_megabox    numeric,
    com_vendedor   numeric,
    mes_encerrado  boolean
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_metas_exigir_diretor();
  if p_ano is null or p_ano < 2000 or p_ano > 2100 then
    raise exception 'ano inválido: %', p_ano using errcode = '22023';
  end if;
  if p_valor not in ('comissao', 'venda_bruta', 'venda_liquida') then
    raise exception 'valor considerado inválido: %', p_valor using errcode = '22023';
  end if;

  return query
  with lanc as (select * from public.fn_metas_anual_lancamentos(p_ano, p_valor)),
  por_etapa as (
    select l.mes, l.vendedor_id,
           sum(l.valor) filter (where l.etapa = 'fechado')   as fechado,
           sum(l.valor) filter (where l.etapa = 'entregue')  as entregue,
           sum(l.valor) filter (where l.etapa = 'cancelado') as cancelado,
           sum(l.valor) filter (where l.etapa = 'faturado')  as faturado,
           count(*) filter (where l.etapa = 'fechado')       as qf,
           count(*) filter (where l.etapa = 'entregue')      as qe,
           count(*) filter (where l.etapa = 'faturado')      as qt
    from lanc l
    group by l.mes, l.vendedor_id
  ),
  metas as (
    select extract(month from m.competencia)::integer as mes, m.vendedor_id, sum(m.valor_meta) as meta
    from public.metas_mensais m
    where extract(year from m.competencia)::integer = p_ano
    group by 1, 2
  ),
  com as (
    select extract(month from f.competencia)::integer as mes, f.vendedor_id,
           sum(f.total_comissao_megabox) as mega, sum(f.total_comissao_vendedor) as vend
    from public.metas_fechadas f
    where extract(year from f.competencia)::integer = p_ano
    group by 1, 2
  ),
  chaves as (
    select pe.mes, pe.vendedor_id from por_etapa pe
    union select mt.mes, mt.vendedor_id from metas mt
    union select c.mes, c.vendedor_id from com c
  ),
  encerrados as (select distinct l.mes from lanc l where l.fechado)
  select k.mes,
         k.vendedor_id,
         round(coalesce(pe.fechado, 0), 2),
         round(coalesce(pe.entregue, 0), 2),
         round(coalesce(pe.cancelado, 0), 2),
         round(coalesce(pe.faturado, 0), 2),
         coalesce(pe.qf, 0),
         coalesce(pe.qe, 0),
         coalesce(pe.qt, 0),
         round(coalesce(mt.meta, 0), 2),
         round(coalesce(c.mega, 0), 2),
         round(coalesce(c.vend, 0), 2),
         k.mes in (select en.mes from encerrados en)
  from chaves k
  left join por_etapa pe on pe.mes = k.mes and pe.vendedor_id is not distinct from k.vendedor_id
  left join metas mt     on mt.mes = k.mes and mt.vendedor_id = k.vendedor_id
  left join com c        on c.mes  = k.mes and c.vendedor_id  = k.vendedor_id
  order by k.mes, k.vendedor_id;
end
$$;

comment on function public.fn_metas_relatorio_anual(integer, text) is
  '024 R1–R6: "Relatório Anual de Vendas" (HTML C bUFCJ) — por mês e vendedor: fechado, '
  'entregue, cancelado, faturado (valor escolhido), quantidades, meta lançada e comissões das '
  'metas fechadas; mes_encerrado = o mês usa o fechamento oficial. Só perfil 1.';

create or replace function public.fn_metas_relatorio_detalhe(
  p_ano      integer,
  p_valor    text    default 'comissao',
  p_base     text    default 'faturado',
  p_vendedor uuid    default null,
  p_limite   integer default 25,
  p_deslocar integer default 0
)
  returns table (
    entrega_id     uuid,
    numero_entrega text,
    vendedor_id    uuid,
    mes            integer,
    data           date,
    status         text,
    venda_bruta    numeric,
    venda_liquida  numeric,
    comissao       numeric,
    valor          numeric,
    fechado        boolean,
    cancelado      boolean,
    total          bigint
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_metas_exigir_diretor();
  if p_base not in ('faturado', 'fechado', 'entregue') then
    raise exception 'base inválida: %', p_base using errcode = '22023';
  end if;
  if p_valor not in ('comissao', 'venda_bruta', 'venda_liquida') then
    raise exception 'valor considerado inválido: %', p_valor using errcode = '22023';
  end if;

  return query
  with lanc as (
    select l.entrega_id, min(l.mes) as mes, min(l.vendedor_id::text)::uuid as vendedor_id,
           bool_or(l.fechado) as fechado
    from public.fn_metas_anual_lancamentos(p_ano, p_valor) l
    where p_vendedor is null or l.vendedor_id = p_vendedor
    group by l.entrega_id
  )
  select e.id,
         e.numero_entrega,
         l.vendedor_id,
         l.mes,
         case when p_base = 'fechado' then coalesce(e.dt_pedido, (e.criado_em at time zone 'America/Sao_Paulo')::date)
              else coalesce(e.dt_entrega, e.dt_pedido) end,
         et.nome,
         e.valor_venda_bruto,
         e.valor_venda_liquido,
         e.valor_comissao,
         case p_valor when 'venda_bruta' then e.valor_venda_bruto
                      when 'venda_liquida' then e.valor_venda_liquido
                      else e.valor_comissao end,
         l.fechado,
         e.status_id = 7,
         count(*) over ()
  from lanc l
  join public.entregas e on e.id = l.entrega_id
  join public.etapas et  on et.id = e.status_id
  order by 5 desc nulls last, e.numero_entrega desc, e.id
  limit least(greatest(coalesce(p_limite, 25), 1), 500)
  offset greatest(coalesce(p_deslocar, 0), 0);
end
$$;

comment on function public.fn_metas_relatorio_detalhe(integer, text, text, uuid, integer, integer) is
  '024 R7: aba "Detalhamento" do Relatório Anual — entregas lançadas no ano, paginadas no banco, '
  'com o total (count over). Só perfil 1.';


-- =====================================================================================
-- 4. PRIVILÉGIOS (execute só para authenticated; anon e public fora)
-- =====================================================================================
revoke execute on function public.fn_metas_entregas_meta(uuid)                    from public, anon;
revoke execute on function public.fn_metas_analise_base(date, date)               from public, anon;
revoke execute on function public.fn_metas_analise_entregas(date, date)           from public, anon;
revoke execute on function public.fn_metas_analise_lista(date, date, text, uuid)  from public, anon;
revoke execute on function public.fn_metas_exigir_diretor()                       from public, anon;
revoke execute on function public.fn_metas_anual_lancamentos(integer, text)       from public, anon;
revoke execute on function public.fn_metas_relatorio_anual(integer, text)         from public, anon;
revoke execute on function public.fn_metas_relatorio_detalhe(integer, text, text, uuid, integer, integer) from public, anon;

grant execute on function public.fn_metas_entregas_meta(uuid)                     to authenticated, service_role;
grant execute on function public.fn_metas_analise_base(date, date)                to authenticated, service_role;
grant execute on function public.fn_metas_analise_entregas(date, date)            to authenticated, service_role;
grant execute on function public.fn_metas_analise_lista(date, date, text, uuid)   to authenticated, service_role;
grant execute on function public.fn_metas_exigir_diretor()                        to authenticated, service_role;
grant execute on function public.fn_metas_anual_lancamentos(integer, text)        to authenticated, service_role;
grant execute on function public.fn_metas_relatorio_anual(integer, text)          to authenticated, service_role;
grant execute on function public.fn_metas_relatorio_detalhe(integer, text, text, uuid, integer, integer) to authenticated, service_role;
