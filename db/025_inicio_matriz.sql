-- =====================================================================================
-- 025_inicio_matriz.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- A matriz Fornecedor × mês do painel inicial (`/inicio`). No Bubble é o `gp ajuste enderecos`
-- (bTisF): o RG `rpg entregas` (bUBFZ) baixa as entregas em "Financeiro" do intervalo de datas e
-- a `Table B` (bUAxV) agrupa por filial de origem do orçamento do fornecedor, com 12 colunas de
-- mês; cada célula refaz o filtro NO NAVEGADOR (12 × N varreduras) — inicio-e-acesso.md §3.2/§5.
-- Aqui é UMA chamada que devolve a matriz já agregada (spec §8.4).
--
-- Depende de 007 (orcamentos_fornecedor), 006 (enderecos_clifor), 009 (entregas) e 017
-- (fn_rel_validar_periodo). Nenhuma tabela, policy ou seed. Idempotente (`create or replace`).
--
-- >>> DECISÕES <<<
--   D1. UNIVERSO = o do Bubble: entregas com status 5 "Financeiro" (`StatusEntrega =
--       Opt.Etapas.Financeiro`) e `dt_entrega` no intervalo, inclusivo nas duas pontas
--       (inicio-e-acesso [DÚVIDA 9]: manter a regra; a tela a diz no subtítulo).
--   D2. LINHA = filial de ORIGEM do orçamento (`QualOrcamentoFornecedor.QualEnderecoOrigem`),
--       rótulo `enderecos_clifor.nome_endereco` (`grouping0:cpo.NomeEndereco`).
--   D3. VALOR = soma de `entregas.valor_comissao` — o que a célula do Bubble mostra
--       (`cpo.valorcomissao:sum`). O `sum ValorComissaoBruto` do agrupamento era calculado e
--       nunca exibido; não é reproduzido ([DÚVIDA 7], recomendação: o número da tela).
--   D4. MÊS COM ANO. O Bubble usa `extract month` sem o ano: janeiro/2025 e janeiro/2026 caíam na
--       mesma coluna ([DÚVIDA 8]). Aqui a chave é `date_trunc('month', dt_entrega)::date`; a tela
--       decide quantas colunas mostra (12 do ano quando o intervalo cabe num ano, como o Bubble).
--   D5. TOTAIS por `grouping sets` (o Bubble não tinha nenhum — §5): nivel 0 = célula,
--       1 = total do fornecedor no intervalo, 2 = total do mês, 3 = total geral.
--   D6. PERÍODO obrigatório e ≤ 24 meses (fn_rel_validar_periodo, 017 D6).
--   D7. SIGILO = RLS de quem consulta. `security invoker`: as policies de `entregas` (009:
--       página vendas + hierarquia ≤ 2, ou vendedor/substituto) e de `orcamentos_fornecedor`
--       decidem o que entra na soma. Quem não tem a página vendas vê a matriz vazia.
--       `search_path = ''`; EXECUTE só para authenticated (e service_role).
-- =====================================================================================

create or replace function public.fn_inicio_comissoes_fornecedor_mes(p_inicio date, p_fim date)
  returns table (
    nivel          smallint,  -- 0 célula · 1 total do fornecedor · 2 total do mês · 3 total geral
    endereco_id    uuid,
    fornecedor     text,
    mes            date,      -- primeiro dia do mês; nulo nos níveis 1 e 3
    valor_comissao numeric,
    qtd_entregas   bigint
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
    select o.endereco_origem_id                       as endereco_id,
           en.nome_endereco                           as fornecedor,
           date_trunc('month', e.dt_entrega)::date    as mes,
           e.valor_comissao
    from public.entregas e
    join public.orcamentos_fornecedor o on o.id = e.orcamento_fornecedor_id
    join public.enderecos_clifor en     on en.id = o.endereco_origem_id
    where e.status_id = 5                                   -- D1: "Financeiro"
      and e.dt_entrega between p_inicio and p_fim
  )
  select (case
            when grouping(f.endereco_id) = 0 and grouping(f.mes) = 0 then 0
            when grouping(f.endereco_id) = 0 then 1
            when grouping(f.mes) = 0 then 2
            else 3
          end)::smallint,
         f.endereco_id,
         f.fornecedor,
         f.mes,
         coalesce(round(sum(f.valor_comissao), 2), 0),
         count(*)
  from f
  group by grouping sets ((f.endereco_id, f.fornecedor, f.mes), (f.endereco_id, f.fornecedor), (f.mes), ())
  order by 1, 3, 2, 4;
end
$$;

comment on function public.fn_inicio_comissoes_fornecedor_mes(date, date) is
  'Painel inicial (Bubble bTisF/bUAxV): comissão das entregas em Financeiro por filial de origem '
  'do fornecedor × mês (com ano), com totais por linha, por mês e geral. Security invoker: a RLS '
  'de entregas decide o que entra. 025 D1–D7.';

revoke execute on function public.fn_inicio_comissoes_fornecedor_mes(date, date) from public, anon;
grant execute on function public.fn_inicio_comissoes_fornecedor_mes(date, date) to authenticated, service_role;

-- =====================================================================================
-- FIM da 025_inicio_matriz.sql
-- =====================================================================================
