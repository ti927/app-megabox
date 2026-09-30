-- =====================================================================================
-- 026_sac_indicadores.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- A aba "Relatórios" do SAC (`Group Relatórios` bUDDt — "Indicadores e Métricas / Visão geral
-- de desempenho"). No Bubble são dois blocos HTML com Chart.js por CDN: `HTML A` (bUDGP, "SLA
-- Médio de Resolução — média de dias para resolução por mês", captura sac-03) e `HTML B`
-- (bUDGV, "Volume por Tipo de Ocorrência": seis `Search:count` separados). sac.md §3.4, §5,
-- [DÚVIDA 1] e [DÚVIDA 2]; a spec §9.4 pede `vw_sac_indicadores(de, ate)`.
-- Aqui é UMA chamada que devolve o painel inteiro em jsonb.
--
-- Depende de 003 (listas do SAC), 013 (sac_protocolos) e 017 (fn_rel_validar_periodo).
-- Nenhuma tabela, policy ou seed. Idempotente (`create or replace`).
--
-- >>> DECISÕES <<<
--   D1. RECORTE = protocolos ABERTOS no período (`aberto_em`, dia de São Paulo, as duas pontas
--       inclusivas) e não excluídos (`excluido_em is null` — o Bubble não excluía os
--       `Ativo = false`, §5). O período vale para TODOS os números: no Bubble só a barra
--       "Pedido incompleto" o respeitava ([DÚVIDA 2], recomendação: expor e aplicar a tudo).
--   D2. FILTRO por responsável opcional, no lugar do campo "Departamento", que não tem coluna em
--       SacProtocolo ([DÚVIDA 2]).
--   D3. VOLUME POR TIPO/STATUS/PRIORIDADE: todas as opções da lista fixa, com zero quando não há
--       chamado (left join) — o Bubble tinha seis barras fixas, três cores e eixo com máximo 50.
--   D4. TEMPO DE RESOLUÇÃO em dias = `tempo_resolucao` (coluna gerada fechado_em − aberto_em,
--       013) ÷ 86.400 s, só dos resolvidos; média e mediana com 1 casa (`numeric`, nunca float).
--   D5. SLA MENSAL = por mês de ABERTURA dentro do período: abertos, resolvidos e média de dias
--       dos resolvidos. Mês sem chamado aparece com zero/nulo (a série não pula meses).
--   D6. PERÍODO obrigatório, não invertido, ≤ 24 meses (fn_rel_validar_periodo, 017 D6).
--   D7. SIGILO = RLS de quem consulta. `security invoker`: a policy de sac_protocolos (013 D4:
--       página sac + Diretor, responsável ou quem abriu) decide o que entra em cada número.
--       `search_path = ''`; EXECUTE só para authenticated (e service_role).
-- =====================================================================================

create or replace function public.fn_sac_indicadores(p_de date, p_ate date, p_responsavel uuid default null)
  returns jsonb
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_desde timestamptz;
  v_antes timestamptz;
  v_resultado jsonb;
begin
  perform public.fn_rel_validar_periodo(p_de, p_ate);
  v_desde := p_de::timestamp at time zone 'America/Sao_Paulo';
  v_antes := (p_ate + 1)::timestamp at time zone 'America/Sao_Paulo';

  with p as (
    select s.tipo_ocorrencia_id, s.status_id, s.prioridade_id, s.fechado_em,
           date_trunc('month', s.aberto_em at time zone 'America/Sao_Paulo')::date as mes,
           case when s.fechado_em is not null
                then extract(epoch from s.tempo_resolucao) / 86400.0 end as dias
    from public.sac_protocolos s
    where s.excluido_em is null
      and s.aberto_em >= v_desde
      and s.aberto_em <  v_antes
      and (p_responsavel is null or s.responsavel_id = p_responsavel)
  )
  select jsonb_build_object(
    'total',       (select count(*) from p),
    'abertos',     (select count(*) from p where p.status_id <> 4),
    'resolvidos',  (select count(*) from p where p.fechado_em is not null),
    'media_dias',  (select round(avg(p.dias)::numeric, 1) from p),
    'mediana_dias',(select round((percentile_cont(0.5) within group (order by p.dias))::numeric, 1)
                    from p where p.dias is not null),
    'por_tipo', (
      select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'nome', t.nome, 'total', coalesce(c.n, 0)) order by t.id), '[]')
      from public.sac_tipos_ocorrencia t
      left join (select tipo_ocorrencia_id, count(*) n from p group by 1) c on c.tipo_ocorrencia_id = t.id),
    'por_status', (
      select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'nome', t.nome, 'total', coalesce(c.n, 0)) order by t.id), '[]')
      from public.sac_status t
      left join (select status_id, count(*) n from p group by 1) c on c.status_id = t.id),
    'por_prioridade', (
      select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'nome', t.nome, 'total', coalesce(c.n, 0)) order by t.id desc), '[]')
      from public.sac_prioridades t
      left join (select prioridade_id, count(*) n from p group by 1) c on c.prioridade_id = t.id),
    'mensal', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'mes', m.mes, 'abertos', coalesce(c.abertos, 0), 'resolvidos', coalesce(c.resolvidos, 0),
               'media_dias', c.media) order by m.mes), '[]')
      from (select generate_series(date_trunc('month', p_de), date_trunc('month', p_ate), interval '1 month')::date as mes) m
      left join (
        select p.mes, count(*) abertos, count(p.dias) resolvidos, round(avg(p.dias)::numeric, 1) media
        from p group by p.mes
      ) c on c.mes = m.mes)
  ) into v_resultado;

  return v_resultado;
end
$$;

comment on function public.fn_sac_indicadores(date, date, uuid) is
  'Aba Relatórios do SAC (bUDDt: HTML A "SLA médio de resolução" e HTML B "Volume por tipo"): '
  'totais, tempo médio/mediano de resolução, volume por tipo/status/prioridade e série mensal, '
  'dos protocolos abertos no período. Security invoker: a RLS de sac_protocolos decide. 026 D1–D7.';

revoke execute on function public.fn_sac_indicadores(date, date, uuid) from public, anon;
grant execute on function public.fn_sac_indicadores(date, date, uuid) to authenticated, service_role;

-- =====================================================================================
-- FIM da 026_sac_indicadores.sql
-- =====================================================================================
