-- =====================================================================================
-- 017_relatorios.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 11 de `specs/02-modelo-de-dados-proposto.md` §11: "Relatórios — só views e funções".
-- Página `relatorios` (Bubble bUBLO). Spec: `specs/paginas/relatorios.md`; aparência das abas
-- de Cotação e Prospecção: `specs/bubble/02-telas-e-design.md` §relatorios e
-- `specs/04-duvidas.md` §2 (o que HTML C e HTML D mostram).
--
-- O PROBLEMA QUE ESTA MIGRATION RESOLVE
-- No Bubble os relatórios somam NO NAVEGADOR: o botão Pesquisar (bUBaV/bUBcv/bUBfH) achata
-- todas as entregas faturadas do período num texto `[..] | [..]` (format_as_text), cola esse
-- texto num elemento com unique_id (`matrix-data`, `clientes-matrix-data`) e ~35 KB de
-- JavaScript em bloco HTML fazem parse, pivot e soma (spec §2.5, §8.3). A aba "Outros
-- Relatórios" dá TIMEOUT em produção (04 §2.1, captura relatorios-05). Aqui toda soma é
-- `sum(numeric)` no Postgres e a tela recebe dezenas de linhas já agregadas.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Policies ADITIVAS de leitura para a página `relatorios` (permissivas, combinam por OU com
--      as da 007–011; nenhuma é alterada) em entregas, cotacoes e pedidos. Orçamentos,
--      propostas e itens herdam pela cotação (policies "exists cotação visível" da 007/008).
--      A regra de dono é a MESMA de 02 §7.3 — hierarquia ≤ 2 vê tudo; Analista/Operador vê o
--      que é dele (relatorios [DÚVIDA 8], recomendação padrão).
--   2. `v_rel_entregas` (security_invoker): a base comum — o caminho
--      entrega → orçamento → produto / endereço de origem / endereço de destino (spec §9.4,
--      `vw_entregas_faturadas`), resolvido UMA vez em join, não linha a linha.
--   3. Funções `security invoker`, `search_path = ''`, uma por relatório da spec:
--        fn_rel_entregas_produto        §3.3  Produto × Cliente × Fornecedor   (bUBaV/bUBab)
--        fn_rel_entregas_cliente_mes    §3.4  Cliente × Mês                    (bUBcv/bUBdB)
--        fn_rel_entregas_fornecedor_mes §3.5  Fornecedor × Mês                 (bUBfH/bUBfN)
--        fn_rel_cotacoes_resumo         aba "Relatório de Cotação" (HTML C): KPIs + indicadores
--        fn_rel_cotacoes_vendedor       idem: "Ver ranking" / "Cotações por vendedor"
--        fn_rel_cotacoes_mes            idem: "Conversão ao longo do tempo" (série mensal)
--        fn_rel_cotacoes_motivos        idem: "Motivo de arquivamento"
--        fn_rel_prospeccao_vendedor     aba "Relatório de Prospecção" (HTML D): KPIs + ranking
--        fn_rel_prospeccao_diario       idem: "Volume diário"
--      Subtotais e total geral saem da MESMA consulta (grouping sets / union all), nunca da
--      tela (spec §9.4: "nunca no navegador").
--   4. Índices para os filtros de data que faltavam (conferidos com explain, ver §5).
--
-- O QUE **NÃO** ENTRA AQUI
--   - Ranking de metas. O PageLoaded da página (bUBWj → bUBWr → CalculaRanking bUBYW) GRAVAVA
--     MetasMensais.RankingVendas a cada abertura, com regra diferente da página metas (B2,
--     spec §4.6). A 011 resolveu B2 em `v_ranking_metas`, que é a ÚNICA definição de ranking:
--     esta página não escreve nada e não cria outro ranking (spec §9.3 "getRankingMetas é
--     somente leitura"). A página relatorios do Bubble não exibe ranking de metas (spec §3.6).
--   - Exportação: CSV é gerado pela server action a partir das MESMAS funções (spec §9.1/§9.3,
--     [DÚVIDA 2]); `log_exportacoes` não existe no modelo e fica para quando existir.
--   - `usuario_preferencias.UltimoDateRange` (bUBWw): o período vive na URL; o padrão é o mês
--     corrente, calculado no servidor ([DÚVIDA 12]).
--   - Plugin AAC (bUBWk, [DÚVIDA 5]): não reproduzido até ser identificado.
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU ESTÁ SEM RESPOSTA <<<
--   D1. STATUS QUE ENTRA NOS RELATÓRIOS DE ENTREGA (relatorios [DÚVIDA 3]): recomendação padrão
--       — só 5 = Financeiro, que é o que o mapa diz (`StatusEntrega = Opt.Etapas.Financeiro`,
--       spec §3). Parametrizável: toda função de entrega aceita `p_status smallint[]`. Note que
--       a 011 usa {5, 6} no realizado de meta (metas [DÚVIDA 1]); os números de relatório e de
--       meta PODEM divergir por isso até a Diretoria decidir, e o parâmetro existe para isso.
--   D2. UF: uma coluna só, `enderecos_clifor.uf` (02 §3.2, relatorios [DÚVIDA 4] DECIDIDA). O
--       par `UF` texto × `QualUfOpt` do Bubble não existe mais; os três relatórios usam a mesma.
--   D3. AGRUPAMENTO POR FILIAL (endereço), não por texto: o Bubble agrupava no JS pelo NOME em
--       maiúsculas; duas filiais homônimas somariam juntas. Aqui a chave é o id do endereço e o
--       nome sai em `upper()` (a apresentação do mapa, `:to_uppercase`).
--   D4. TRÊS MEDIDAS NAS MATRIZES POR MÊS ([DÚVIDA 10]): o Bubble só manda comissão para
--       Cliente×Mês e Fornecedor×Mês; aqui a função devolve quantidade, venda bruta e comissão —
--       a tela escolhe a medida (padrão: comissão, que é o que o Bubble mostra).
--   D5. VENDEDOR: filtro novo ([DÚVIDA 8], §8.4 "filtros que a tela deveria ter"). Numa entrega
--       com substituto, ela aparece para o titular E para o substituto (`p_vendedor in
--       (vendedor_id, vendedor_substituto_id)`) — é um filtro de "onde ele participou", não de
--       apuração; apuração com regra de titular/substituto é `v_ranking_metas` (B2).
--   D6. PERÍODO OBRIGATÓRIO, NO MÁXIMO 24 MESES ([DÚVIDA 12]): as funções recusam período nulo,
--       invertido ou maior que 24 meses (22023). No Bubble o período vazio varria a base.
--   D7. ABA "RELATÓRIO DE COTAÇÃO" (HTML C, 04 §2): as fórmulas não estão no mapa (o decompilador
--       não exporta o conteúdo de bloco HTML) — só a referência visual. Definições adotadas:
--         * universo = cotações NÃO rascunho CRIADAS no período (criado_em, fuso de São Paulo);
--         * "Em cotação" = etapa 1 e não arquivada; "Virou pedido" = etapa ≥ 2 (a cotação vira
--           "Pedir" quando a proposta vira pedido, bTbZt — é a etiqueta verde "Pedir" do
--           detalhamento); "Arquivadas" = arquivado;
--         * taxa de conversão = virou pedido ÷ total (fração, 4 casas; nula com total 0);
--         * faturamento = soma do valor de venda bruto dos orçamentos VENCEDORES das cotações que
--           viraram pedido (o que o cliente comprou); ticket médio = faturamento ÷ virou pedido;
--         * tempo médio de fechamento = média, em dias, entre a criação da cotação e o PRIMEIRO
--           pedido dela;
--         * "conversão vs mês anterior" = a mesma taxa no período imediatamente anterior, de
--           mesmo tamanho.
--       Reversível: é reescrever as funções fn_rel_cotacoes_*, sem mudar tabela.
--   D8. ABA "RELATÓRIO DE PROSPECÇÃO" (HTML D, 04 §2): mesma situação. Definições adotadas:
--         * "Enviadas"/"Propostas" = propostas com `enviada` e `enviada_em` no período;
--         * "Clientes" = clientes (grupo) distintos que receberam proposta;
--         * "Carteira" = clientes ATIVOS com `carteira_id` = o vendedor (hoje, não histórico);
--         * "Cobertura" = clientes DA CARTEIRA que receberam proposta ÷ carteira;
--         * "Média/dia" = propostas ÷ dias úteis (seg–sex) do período, sem feriados.
--   D9. SIGILO DENTRO DAS FUNÇÕES, ALÉM DA RLS: as de ranking por vendedor listam só o próprio
--       vendedor para hierarquia > 2 (a carteira vem de grupos_clifor, que todo usuário ativo lê
--       pela 006 — sem este filtro o Operador veria o tamanho da carteira dos colegas).
--
-- ORDEM DOS BLOCOS: policies → índices → view → funções → grants.
-- IDEMPOTENTE: `drop policy if exists` + `create policy`, `create or replace` em view e funções,
-- `if not exists` nos índices — reaplicar não falha nem duplica.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- Depois de aplicar: `get_advisors` (segurança), comparado com `specs/05-avisos-do-advisor.md`.
-- =====================================================================================


-- =====================================================================================
-- 1. POLICIES ADITIVAS — a página `relatorios` (permissivas; combinam por OU)
-- =====================================================================================
-- Sem ciclo: a policy de entregas não consulta cotacoes nem pedidos; a de cotacoes consulta
-- entregas (substituto), como a 009 já faz.

drop policy if exists entregas_leitura_relatorios on public.entregas;
create policy entregas_leitura_relatorios on public.entregas
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('relatorios'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  );

drop policy if exists cotacoes_leitura_relatorios on public.cotacoes;
create policy cotacoes_leitura_relatorios on public.cotacoes
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('relatorios'))
    and (
      (select public.fn_hierarquia()) <= 2
      or vendedor_id = (select auth.uid())
      or exists (select 1 from public.entregas e
                 where e.cotacao_id = cotacoes.id
                   and e.vendedor_substituto_id = (select auth.uid()))
    )
  );

drop policy if exists pedidos_leitura_relatorios on public.pedidos;
create policy pedidos_leitura_relatorios on public.pedidos
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('relatorios'))
    and exists (select 1 from public.cotacoes c where c.id = cotacao_id)
  );

comment on policy entregas_leitura_relatorios on public.entregas is
  'Soma à 009/010/011 a página relatorios, com a MESMA regra de dono (hierarquia ≤ 2, vendedor '
  'ou substituto) — relatorios [DÚVIDA 8]. Só leitura: a página não escreve em nada (mata bUBYW).';
comment on policy cotacoes_leitura_relatorios on public.cotacoes is
  'Página relatorios: hierarquia ≤ 2, dono, ou substituto de uma entrega da cotação. Orçamentos, '
  'itens e propostas herdam (policies "exists cotação" da 007/008) — é o join de v_rel_entregas.';
comment on policy pedidos_leitura_relatorios on public.pedidos is
  'Página relatorios: o pedido de uma cotação visível. Leitura (tempo de fechamento, D7).';


-- =====================================================================================
-- 2. ÍNDICES (spec §9.4; conferidos com explain em base carregada — ver o fim do arquivo)
-- =====================================================================================
-- entregas: toda consulta de entrega começa por status + data real (spec §9.4). O
-- entregas_dt_entrega_idx da 009 não serve ao `status_id = any(..)` do Diretor.
create index if not exists entregas_status_dt_entrega_idx on public.entregas (status_id, dt_entrega)
  where dt_entrega is not null;

-- cotacoes: o período da aba Cotação é a DATA DE CRIAÇÃO, da empresa inteira. Os índices da
-- 007 começam por vendedor ou etapa (kanban) e não atendem o Diretor filtrando só por data.
create index if not exists cotacoes_criado_em_idx on public.cotacoes (criado_em)
  where not rascunho;

-- propostas: a aba Prospecção filtra por data de ENVIO (D8).
create index if not exists propostas_enviada_em_idx on public.propostas (enviada_em)
  where enviada;

-- grupos_clifor.carteira_id: a 006 não indexou (FK sem índice); a carteira é contada por vendedor.
create index if not exists grupos_clifor_carteira_idx on public.grupos_clifor (carteira_id)
  where carteira_id is not null;


-- =====================================================================================
-- 3. VIEW BASE (security_invoker: a RLS de quem consulta vale)
-- =====================================================================================
create or replace view public.v_rel_entregas
with (security_invoker = true) as
select e.id                          as entrega_id,
       e.pedido_id,
       e.cotacao_id,
       e.numero_entrega,
       e.status_id,
       e.dt_entrega,
       date_trunc('month', e.dt_entrega)::date as mes,
       e.vendedor_id,
       e.vendedor_substituto_id,
       e.qtd,
       e.valor_venda_bruto_unit,
       e.valor_comissao_unit,
       e.valor_venda_bruto,
       e.valor_comissao,
       o.produto_id,
       upper(pr.nome)                as produto,
       o.endereco_origem_id          as fornecedor_endereco_id,
       upper(eo.nome_endereco)       as fornecedor,
       eo.uf                         as uf_origem,
       o.endereco_destino_id         as cliente_endereco_id,
       upper(ed.nome_endereco)       as cliente,
       ed.uf                         as uf_destino
from public.entregas e
join public.orcamentos_fornecedor o on o.id  = e.orcamento_fornecedor_id
join public.produtos pr             on pr.id = o.produto_id
join public.enderecos_clifor eo     on eo.id = o.endereco_origem_id
join public.enderecos_clifor ed     on ed.id = o.endereco_destino_id;

comment on view public.v_rel_entregas is
  'Base dos relatórios de entrega (spec relatorios §9.4, vw_entregas_faturadas): entrega + '
  'produto + filial de origem (fornecedor) + filial de destino (cliente) + UF única (D2). SEM '
  'filtro de status: quem filtra é a função (D1). security_invoker: a RLS de entregas, '
  'orcamentos_fornecedor, produtos e enderecos_clifor de quem lê vale.';

revoke all on public.v_rel_entregas from anon;
grant select on public.v_rel_entregas to authenticated;


-- =====================================================================================
-- 4. FUNÇÕES (security invoker; search_path = ''; dinheiro com round(, 2) explícito)
-- =====================================================================================

-- --------------------------------------------------------------- guarda de período (D6)
create or replace function public.fn_rel_validar_periodo(p_inicio date, p_fim date)
  returns void
  language plpgsql
  immutable
  set search_path = ''
as $$
begin
  if p_inicio is null or p_fim is null then
    raise exception 'período obrigatório (relatorios [DÚVIDA 12])' using errcode = '22023';
  end if;
  if p_fim < p_inicio then
    raise exception 'período invertido: % a %', p_inicio, p_fim using errcode = '22023';
  end if;
  if p_fim >= (p_inicio + interval '24 months')::date then
    raise exception 'período maior que 24 meses: % a %', p_inicio, p_fim using errcode = '22023';
  end if;
end
$$;

comment on function public.fn_rel_validar_periodo(date, date) is
  'D6: período obrigatório, fim ≥ início, no máximo 24 meses. 22023 = invalid_parameter_value.';

-- ------------------------------------------------ §3.3 Produto × Cliente × Fornecedor
create or replace function public.fn_rel_entregas_produto(
  p_inicio   date,
  p_fim      date,
  p_vendedor uuid       default null,
  p_status   smallint[] default null
)
  returns table (
    nivel                smallint,   -- 0 linha · 1 subtotal do produto · 2 total geral
    produto_id           uuid,
    produto              text,
    fornecedor_endereco_id uuid,
    fornecedor           text,
    cliente_endereco_id  uuid,
    cliente              text,
    uf_destino           text,
    qtd                  numeric,
    valor_venda_bruto    numeric,
    valor_comissao       numeric,
    venda_unit_media     numeric,
    comissao_unit_media  numeric,
    qtd_entregas         bigint
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  -- detalhe: nenhum agrupado (0); subtotal: só o fornecedor agrupado (1); total: os dois (2)
  select (grouping(v.produto_id) + grouping(v.fornecedor_endereco_id))::smallint,
         v.produto_id,
         v.produto,
         v.fornecedor_endereco_id,
         v.fornecedor,
         v.cliente_endereco_id,
         v.cliente,
         v.uf_destino::text,
         coalesce(round(sum(v.qtd), 3), 0),
         coalesce(round(sum(v.valor_venda_bruto), 2), 0),
         coalesce(round(sum(v.valor_comissao), 2), 0),
         round(sum(v.valor_venda_bruto) / nullif(sum(v.qtd), 0), 2),
         round(sum(v.valor_comissao)    / nullif(sum(v.qtd), 0), 2),
         count(*)
  from public.v_rel_entregas v
  where v.status_id = any (coalesce(p_status, array[5]::smallint[]))       -- D1
    and v.dt_entrega between p_inicio and p_fim
    and (p_vendedor is null or p_vendedor in (v.vendedor_id, v.vendedor_substituto_id))  -- D5
  group by grouping sets (
    (v.produto_id, v.produto, v.fornecedor_endereco_id, v.fornecedor,
     v.cliente_endereco_id, v.cliente, v.uf_destino),
    (v.produto_id, v.produto),
    ()
  )
  order by grouping(v.produto_id), v.produto, v.produto_id,
           grouping(v.fornecedor_endereco_id), v.cliente, v.fornecedor;
end
$$;

comment on function public.fn_rel_entregas_produto(date, date, uuid, smallint[]) is
  'relatorios §3.3 (bUBaV/bUBab): entregas por produto × fornecedor (filial de origem) × cliente '
  '(filial de destino) + UF de destino, com subtotal por produto (nivel 1) e total (nivel 2). '
  'Unitários médios = soma ÷ quantidade (nulos com quantidade 0).';

-- ------------------------------------------------------------------ §3.4 Cliente × Mês
create or replace function public.fn_rel_entregas_cliente_mes(
  p_inicio   date,
  p_fim      date,
  p_vendedor uuid       default null,
  p_status   smallint[] default null
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
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  select (grouping(v.cliente_endereco_id) * 2 + grouping(v.mes))::smallint,
         v.cliente_endereco_id,
         v.cliente,
         v.uf_destino::text,
         v.mes,
         coalesce(round(sum(v.qtd), 3), 0),
         coalesce(round(sum(v.valor_venda_bruto), 2), 0),
         coalesce(round(sum(v.valor_comissao), 2), 0),
         count(*)
  from public.v_rel_entregas v
  where v.status_id = any (coalesce(p_status, array[5]::smallint[]))
    and v.dt_entrega between p_inicio and p_fim
    and (p_vendedor is null or p_vendedor in (v.vendedor_id, v.vendedor_substituto_id))
  group by grouping sets (
    (v.cliente_endereco_id, v.cliente, v.uf_destino, v.mes),
    (v.cliente_endereco_id, v.cliente, v.uf_destino),
    (v.mes),
    ()
  )
  order by grouping(v.cliente_endereco_id), v.cliente, v.cliente_endereco_id,
           grouping(v.mes), v.mes;
end
$$;

comment on function public.fn_rel_entregas_cliente_mes(date, date, uuid, smallint[]) is
  'relatorios §3.4 (bUBcv/bUBdB): Cliente (filial de destino) × mês da entrega real. nivel 0 = '
  'célula, 1 = total do cliente, 2 = total do mês, 3 = total geral — o pivot da tela só posiciona '
  'células, não soma. Três medidas (D4).';

-- --------------------------------------------------------------- §3.5 Fornecedor × Mês
create or replace function public.fn_rel_entregas_fornecedor_mes(
  p_inicio   date,
  p_fim      date,
  p_vendedor uuid       default null,
  p_status   smallint[] default null
)
  returns table (
    nivel             smallint,
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
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  select (grouping(v.fornecedor_endereco_id) * 2 + grouping(v.mes))::smallint,
         v.fornecedor_endereco_id,
         v.fornecedor,
         v.uf_origem::text,
         v.mes,
         coalesce(round(sum(v.qtd), 3), 0),
         coalesce(round(sum(v.valor_venda_bruto), 2), 0),
         coalesce(round(sum(v.valor_comissao), 2), 0),
         count(*)
  from public.v_rel_entregas v
  where v.status_id = any (coalesce(p_status, array[5]::smallint[]))
    and v.dt_entrega between p_inicio and p_fim
    and (p_vendedor is null or p_vendedor in (v.vendedor_id, v.vendedor_substituto_id))
  group by grouping sets (
    (v.fornecedor_endereco_id, v.fornecedor, v.uf_origem, v.mes),
    (v.fornecedor_endereco_id, v.fornecedor, v.uf_origem),
    (v.mes),
    ()
  )
  order by grouping(v.fornecedor_endereco_id), v.fornecedor, v.fornecedor_endereco_id,
           grouping(v.mes), v.mes;
end
$$;

comment on function public.fn_rel_entregas_fornecedor_mes(date, date, uuid, smallint[]) is
  'relatorios §3.5 (bUBfH/bUBfN): a de §3.4 com o eixo trocado — filial de ORIGEM e UF de origem. '
  'No Bubble usava o MESMO bloco HTML e o título mentia ao trocar o radio (§8.3); aqui é outra RPC.';

-- --------------------------------------------------- aba Cotação: KPIs e indicadores (D7)
create or replace function public.fn_rel_cotacoes_resumo(
  p_inicio    date,
  p_fim       date,
  p_vendedor  uuid    default null,
  p_arquivado boolean default null
)
  returns table (
    total                     bigint,
    em_cotacao                bigint,
    virou_pedido              bigint,
    arquivadas                bigint,
    taxa_conversao            numeric,
    faturamento               numeric,
    ticket_medio              numeric,
    tempo_medio_fechamento_dias numeric,
    total_anterior            bigint,
    virou_pedido_anterior     bigint,
    taxa_conversao_anterior   numeric
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_dias integer;
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  v_dias := p_fim - p_inicio + 1;
  return query
  with base as (
    select c.id,
           c.etapa_id,
           c.arquivado,
           c.criado_em,
           (c.criado_em >= (p_inicio::timestamp at time zone 'America/Sao_Paulo')) as atual
    from public.cotacoes c
    where not c.rascunho
      -- período atual E o anterior de mesmo tamanho (D7), numa varredura só do índice
      and c.criado_em >= ((p_inicio - v_dias)::timestamp at time zone 'America/Sao_Paulo')
      and c.criado_em <  ((p_fim + 1)::timestamp     at time zone 'America/Sao_Paulo')
      and (p_vendedor  is null or c.vendedor_id = p_vendedor)
      and (p_arquivado is null or c.arquivado   = p_arquivado)
  ),
  atual as (
    select b.*,
           (b.etapa_id >= 2) as pedido,
           (select round(sum(o.valor_venda_bruto), 2)
              from public.orcamentos_fornecedor o
             where o.cotacao_id = b.id and o.vencedor)                    as fat,
           (select min(p.criado_em) from public.pedidos p where p.cotacao_id = b.id) as primeiro_pedido
    from base b
    where b.atual
  ),
  agg as (
    select count(*)                                                    as total,
           count(*) filter (where a.etapa_id = 1 and not a.arquivado)   as em_cotacao,
           count(*) filter (where a.pedido)                             as virou_pedido,
           count(*) filter (where a.arquivado)                          as arquivadas,
           coalesce(round(sum(a.fat) filter (where a.pedido), 2), 0)    as faturamento,
           round(avg(extract(epoch from (a.primeiro_pedido - a.criado_em)) / 86400)
                   filter (where a.pedido and a.primeiro_pedido >= a.criado_em), 1) as tempo
    from atual a
  ),
  ant as (
    select count(*)                                  as total,
           count(*) filter (where b.etapa_id >= 2)   as virou_pedido
    from base b
    where not b.atual
  )
  select g.total,
         g.em_cotacao,
         g.virou_pedido,
         g.arquivadas,
         round(g.virou_pedido::numeric / nullif(g.total, 0), 4),
         g.faturamento,
         round(g.faturamento / nullif(g.virou_pedido, 0), 2),
         g.tempo,
         n.total,
         n.virou_pedido,
         round(n.virou_pedido::numeric / nullif(n.total, 0), 4)
  from agg g cross join ant n;
end
$$;

comment on function public.fn_rel_cotacoes_resumo(date, date, uuid, boolean) is
  'Aba "Relatório de Cotação" (HTML C; 04 §2): 5 KPIs (total, em cotação, virou pedido, '
  'arquivadas, conversão), ticket médio, tempo médio de fechamento e conversão do período '
  'anterior. Definições em D7 no cabeçalho da 017.';

-- ------------------------------------------- aba Cotação: ranking por vendedor (D7, D9)
create or replace function public.fn_rel_cotacoes_vendedor(
  p_inicio    date,
  p_fim       date,
  p_vendedor  uuid    default null,
  p_arquivado boolean default null
)
  returns table (
    posicao        bigint,
    vendedor_id    uuid,
    vendedor       text,
    cotacoes       bigint,
    ativas         bigint,
    pedidos        bigint,
    arquivadas     bigint,
    taxa_conversao numeric,
    faturamento    numeric
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  with por as (
    select c.vendedor_id,
           count(*)                                                  as cotacoes,
           count(*) filter (where c.etapa_id = 1 and not c.arquivado) as ativas,
           count(*) filter (where c.etapa_id >= 2)                   as pedidos,
           count(*) filter (where c.arquivado)                       as arquivadas,
           coalesce(round(sum(f.fat) filter (where c.etapa_id >= 2), 2), 0) as faturamento
    from public.cotacoes c
    left join lateral (
      select sum(o.valor_venda_bruto) as fat
      from public.orcamentos_fornecedor o
      where o.cotacao_id = c.id and o.vencedor
    ) f on true
    where not c.rascunho
      and c.criado_em >= (p_inicio::timestamp     at time zone 'America/Sao_Paulo')
      and c.criado_em <  ((p_fim + 1)::timestamp  at time zone 'America/Sao_Paulo')
      and (p_vendedor  is null or c.vendedor_id = p_vendedor)
      and (p_arquivado is null or c.arquivado   = p_arquivado)
      and ((select public.fn_hierarquia()) <= 2 or c.vendedor_id = (select auth.uid()))  -- D9
    group by c.vendedor_id
  )
  select rank() over (order by p.faturamento desc,
                               (p.pedidos::numeric / nullif(p.cotacoes, 0)) desc nulls last),
         p.vendedor_id,
         coalesce(u.nome, '—'),
         p.cotacoes,
         p.ativas,
         p.pedidos,
         p.arquivadas,
         round(p.pedidos::numeric / nullif(p.cotacoes, 0), 4),
         p.faturamento
  from por p
  left join public.usuarios u on u.id = p.vendedor_id
  order by 1, 3;
end
$$;

comment on function public.fn_rel_cotacoes_vendedor(date, date, uuid, boolean) is
  'Aba Cotação — "Ver ranking" (# | Vendedor | Cotações | Ativas | Pedidos | Conversão | '
  'Faturamento, captura relatorios-03). Posição por faturamento, desempate por conversão. NÃO é o '
  'ranking de metas (esse é v_ranking_metas, B2).';

-- ---------------------------------------------- aba Cotação: série mensal de conversão
create or replace function public.fn_rel_cotacoes_mes(
  p_inicio    date,
  p_fim       date,
  p_vendedor  uuid    default null,
  p_arquivado boolean default null
)
  returns table (mes date, total bigint, virou_pedido bigint, arquivadas bigint, taxa_conversao numeric)
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  select date_trunc('month', c.criado_em at time zone 'America/Sao_Paulo')::date,
         count(*),
         count(*) filter (where c.etapa_id >= 2),
         count(*) filter (where c.arquivado),
         round(count(*) filter (where c.etapa_id >= 2)::numeric / nullif(count(*), 0), 4)
  from public.cotacoes c
  where not c.rascunho
    and c.criado_em >= (p_inicio::timestamp    at time zone 'America/Sao_Paulo')
    and c.criado_em <  ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo')
    and (p_vendedor  is null or c.vendedor_id = p_vendedor)
    and (p_arquivado is null or c.arquivado   = p_arquivado)
  group by 1
  order by 1;
end
$$;

comment on function public.fn_rel_cotacoes_mes(date, date, uuid, boolean) is
  'Aba Cotação — "Conversão ao longo do tempo": uma linha por mês de criação (fuso de SP).';

-- ------------------------------------------------- aba Cotação: motivo de arquivamento
create or replace function public.fn_rel_cotacoes_motivos(
  p_inicio   date,
  p_fim      date,
  p_vendedor uuid default null
)
  returns table (motivo_id smallint, motivo text, qtd bigint)
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  select c.motivo_arquivamento_id,
         coalesce(m.nome, 'Sem motivo informado'),
         count(*)
  from public.cotacoes c
  left join public.motivos_arquivamento m on m.id = c.motivo_arquivamento_id
  where not c.rascunho
    and c.arquivado
    and c.criado_em >= (p_inicio::timestamp    at time zone 'America/Sao_Paulo')
    and c.criado_em <  ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo')
    and (p_vendedor is null or c.vendedor_id = p_vendedor)
  group by c.motivo_arquivamento_id, m.nome
  order by 3 desc, 2;
end
$$;

comment on function public.fn_rel_cotacoes_motivos(date, date, uuid) is
  'Aba Cotação — "Motivo de arquivamento" (motivos_arquivamento, 003). Cotação arquivada sem '
  'motivo aparece como tal (a 007 não tem check arquivado → motivo).';

-- ------------------------------------------- aba Prospecção: KPIs + ranking (D8, D9)
create or replace function public.fn_rel_prospeccao_vendedor(
  p_inicio   date,
  p_fim      date,
  p_vendedor uuid default null
)
  returns table (
    nivel       smallint,   -- 0 vendedor · 1 total
    posicao     bigint,
    vendedor_id uuid,
    vendedor    text,
    propostas   bigint,
    clientes    bigint,
    carteira    bigint,
    carteira_atingida bigint,
    cobertura   numeric,
    media_dia   numeric,
    dias_uteis  integer
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_uteis integer;
  v_ve_todos boolean := (select public.fn_hierarquia()) <= 2;
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  select count(*)::integer into v_uteis
  from generate_series(p_inicio, p_fim, interval '1 day') d
  where extract(isodow from d) < 6;

  return query
  with env as (
    select p.vendedor_id, c.cliente_id
    from public.propostas p
    join public.cotacoes c on c.id = p.cotacao_id
    where p.enviada
      and p.enviada_em >= (p_inicio::timestamp    at time zone 'America/Sao_Paulo')
      and p.enviada_em <  ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo')
      and (p_vendedor is null or p.vendedor_id = p_vendedor)
      and (v_ve_todos or p.vendedor_id = (select auth.uid()))              -- D9
  ),
  cart as (
    select g.carteira_id as vendedor_id, g.id as cliente_id
    from public.grupos_clifor g
    where g.carteira_id is not null
      and g.tipo = 'cliente'
      and g.ativo
      and (p_vendedor is null or g.carteira_id = p_vendedor)
      and (v_ve_todos or g.carteira_id = (select auth.uid()))              -- D9
  ),
  vendedores as (
    select e.vendedor_id from env e
    union
    select k.vendedor_id from cart k
  ),
  por as (
    select v.vendedor_id,
           (select count(*) from env e where e.vendedor_id = v.vendedor_id)                     as propostas,
           (select count(distinct e.cliente_id) from env e where e.vendedor_id = v.vendedor_id) as clientes,
           (select count(*) from cart k where k.vendedor_id = v.vendedor_id)                    as carteira,
           (select count(*) from cart k
             where k.vendedor_id = v.vendedor_id
               and exists (select 1 from env e
                            where e.vendedor_id = k.vendedor_id and e.cliente_id = k.cliente_id)) as atingida
    from vendedores v
  )
  select 0::smallint,
         rank() over (order by p.propostas desc, p.clientes desc),
         p.vendedor_id,
         coalesce(u.nome, '—'),
         p.propostas,
         p.clientes,
         p.carteira,
         p.atingida,
         round(p.atingida::numeric / nullif(p.carteira, 0), 4),
         round(p.propostas::numeric / nullif(v_uteis, 0), 2),
         v_uteis
  from por p
  left join public.usuarios u on u.id = p.vendedor_id
  union all
  select 1::smallint,
         null::bigint,
         null::uuid,
         'Total',
         (select count(*) from env),
         (select count(distinct e.cliente_id) from env e),
         (select count(*) from cart),
         (select count(*) from cart k
           where exists (select 1 from env e
                          where e.vendedor_id = k.vendedor_id and e.cliente_id = k.cliente_id)),
         round((select count(*) from cart k
                 where exists (select 1 from env e
                                where e.vendedor_id = k.vendedor_id and e.cliente_id = k.cliente_id))::numeric
               / nullif((select count(*) from cart), 0), 4),
         round((select count(*) from env)::numeric / nullif(v_uteis, 0), 2),
         v_uteis
  order by 1, 2, 4;
end
$$;

comment on function public.fn_rel_prospeccao_vendedor(date, date, uuid) is
  'Aba "Relatório de Prospecção" (HTML D; 04 §2): Enviadas, Clientes, Carteira, Média/dia e '
  'Cobertura por vendedor (nivel 0, com posição) e da equipe (nivel 1 — clientes distintos NÃO é '
  'a soma das linhas). Definições em D8; sigilo em D9.';

-- --------------------------------------------------- aba Prospecção: volume diário (D8)
create or replace function public.fn_rel_prospeccao_diario(
  p_inicio   date,
  p_fim      date,
  p_vendedor uuid default null
)
  returns table (dia date, util boolean, propostas bigint)
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
begin
  perform public.fn_rel_validar_periodo(p_inicio, p_fim);
  return query
  select d::date,
         extract(isodow from d) < 6,
         count(p.id)
  from generate_series(p_inicio, p_fim, interval '1 day') d
  left join public.propostas p
    on p.enviada
   and (p.enviada_em at time zone 'America/Sao_Paulo')::date = d::date
   and p.enviada_em >= (p_inicio::timestamp    at time zone 'America/Sao_Paulo')
   and p.enviada_em <  ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo')
   and (p_vendedor is null or p.vendedor_id = p_vendedor)
   and ((select public.fn_hierarquia()) <= 2 or p.vendedor_id = (select auth.uid()))
  group by d
  order by d;
end
$$;

comment on function public.fn_rel_prospeccao_diario(date, date, uuid) is
  'Aba Prospecção — "Volume diário": propostas enviadas por dia do período (dias sem envio vêm com '
  '0; `util` marca seg–sex para a média).';


-- =====================================================================================
-- 5. GRANTS — nada para anon (o padrão do Supabase concede EXECUTE a anon em função nova)
-- =====================================================================================
revoke execute on function public.fn_rel_validar_periodo(date, date)                          from public, anon;
revoke execute on function public.fn_rel_entregas_produto(date, date, uuid, smallint[])        from public, anon;
revoke execute on function public.fn_rel_entregas_cliente_mes(date, date, uuid, smallint[])    from public, anon;
revoke execute on function public.fn_rel_entregas_fornecedor_mes(date, date, uuid, smallint[]) from public, anon;
revoke execute on function public.fn_rel_cotacoes_resumo(date, date, uuid, boolean)           from public, anon;
revoke execute on function public.fn_rel_cotacoes_vendedor(date, date, uuid, boolean)         from public, anon;
revoke execute on function public.fn_rel_cotacoes_mes(date, date, uuid, boolean)              from public, anon;
revoke execute on function public.fn_rel_cotacoes_motivos(date, date, uuid)                   from public, anon;
revoke execute on function public.fn_rel_prospeccao_vendedor(date, date, uuid)                from public, anon;
revoke execute on function public.fn_rel_prospeccao_diario(date, date, uuid)                  from public, anon;

grant execute on function public.fn_rel_validar_periodo(date, date)                          to authenticated, service_role;
grant execute on function public.fn_rel_entregas_produto(date, date, uuid, smallint[])        to authenticated, service_role;
grant execute on function public.fn_rel_entregas_cliente_mes(date, date, uuid, smallint[])    to authenticated, service_role;
grant execute on function public.fn_rel_entregas_fornecedor_mes(date, date, uuid, smallint[]) to authenticated, service_role;
grant execute on function public.fn_rel_cotacoes_resumo(date, date, uuid, boolean)           to authenticated, service_role;
grant execute on function public.fn_rel_cotacoes_vendedor(date, date, uuid, boolean)         to authenticated, service_role;
grant execute on function public.fn_rel_cotacoes_mes(date, date, uuid, boolean)              to authenticated, service_role;
grant execute on function public.fn_rel_cotacoes_motivos(date, date, uuid)                   to authenticated, service_role;
grant execute on function public.fn_rel_prospeccao_vendedor(date, date, uuid)                to authenticated, service_role;
grant execute on function public.fn_rel_prospeccao_diario(date, date, uuid)                  to authenticated, service_role;


-- =====================================================================================
-- FIM da 017_relatorios.sql
-- =====================================================================================
-- CONFERÊNCIA
--   0 tabelas novas. 3 policies ADITIVAS de leitura (entregas, cotacoes, pedidos), nenhuma
--   alterada; nenhuma de escrita — a página não grava nada (mata bUBYW/CalculaRanking).
--   1 view (security_invoker = true), sem anon.
--   10 funções: TODAS security invoker, search_path = '', sem EXECUTE para anon/public.
--   Nenhuma security definer, portanto nenhum aviso novo esperado no get_advisors.
--   Dinheiro: numeric, round(, 2) explícito em toda soma/divisão de valor; frações 4 casas.
--   4 índices: entregas (status_id, dt_entrega), cotacoes (criado_em), propostas (enviada_em),
--   grupos_clifor (carteira_id).
--   Nenhum seed. Nenhum segredo.
-- =====================================================================================
