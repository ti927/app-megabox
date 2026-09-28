-- =====================================================================================
-- 011_metas.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 8 de `specs/02-modelo-de-dados-proposto.md` §11 (e `specs/03-plano-de-construcao.md`
-- §6): página `metas` — metas mensais, atingimento, ranking e fechamento com a comissão do
-- vendedor.
--
-- Escopo: §3.5 — `niveis_vendedor`, `vendedor_nivel_historico`, `metas_mensais`,
-- `metas_fechadas`, `meta_fechada_entregas`; a FK `usuarios.nivel_vendedor_id` que a 001
-- deixou pendente; a FK `contas_pagar.meta_fechada_id` que a 010 deixou pendente; a FK
-- `historicos.conta_receber_id` que a 012 (aplicada antes desta) deixou pendente; de §5,
-- `v_meta_atingimento` (a "v_realizado_vendedor"), `v_ranking_metas` e `fn_fechar_meta`.
--
-- Fontes no mapa (via specs/paginas/metas.md): realizado Regular/Substituição (Ipt valor
-- faturado bTvpn, §5.1), comissão por faixa (Ipt valor comissao bTvqD), ranking (CalculaRanking
-- bTwAv: bUAhB/bUAhP, §5.3), fechamento (bTwAj: bTwAk + bTzXn, §4.11), cancelamento (bTzkZ,
-- §4.12), cadastro de meta (bTwBh, §4.3).
--
-- O QUE ESTA MIGRATION FAZ
--   1. `btree_gist` (em `extensions`, 02 §6.1) para o exclude de vigência do nível.
--   2. 5 tabelas com RLS; FKs pendentes da 001 e da 010.
--   3. Triggers: a meta mensal deriva competência e nível vigente e fica imutável depois de
--      fechada; a meta fechada copia o retrato da meta e exige comissão = realizado × fator.
--   4. Funções security invoker: fn_status_realizado (B-isolada), fn_entregas_da_meta,
--      fn_calculo_meta, fn_fechar_meta, fn_cancelar_fechamento_meta.
--   5. Views security_invoker: v_meta_atingimento, v_ranking_metas.
--   6. Policies ADITIVAS: a página `metas` lê entregas (o realizado soma entregas) e cria/cancela
--      a conta a pagar de ORIGEM META.
--
-- O QUE **NÃO** ENTRA AQUI
--   - `config_metas` (piso 80.000, multiplicador 1,25, meta diária — metas [DÚVIDA 16], [8]):
--     é a "meta coletiva", tela; nada nesta fatia a lê. O prazo de 10 dias virou parâmetro de
--     fn_fechar_meta (default 10, [DÚVIDA 17]).
--   - `vw_metas_resumo_periodo`, `vw_regua_nivel`, `vw_entregas_da_meta`: consultas de tela.
--   - Sincronizar `usuarios.nivel_vendedor_id` com o histórico: a ação "promover" grava os dois
--     (metas [DÚVIDA 15]); a meta mensal lê o histórico e cai no campo do usuário na falta.
--   - Tbl.MetaAdicional, User.RankingVenda*, old_ValorBonus: não migram ([DÚVIDA 11]).
--   - Nenhum seed (nem níveis: são dado de negócio, entram pela carga).
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA, CONFLITAVA COM O MAPA OU ESTÁ SEM RESPOSTA <<<
--   D1. B3 (escala de ComissaoPadrao/ComissaoMetaBatida) — SEM RESPOSTA; RECOMENDAÇÃO PADRÃO
--       (metas [DÚVIDA 7]: "tratar como fração, validar na carga contra as CPs já geradas e
--       abortar se divergir"). As duas colunas são FRAÇÃO numeric(7,4) (02 §3.5) com check
--       0 ≤ x ≤ 1, e a fórmula é a do mapa, multiplicação direta: comissão = realizado × fator
--       (bTvqD). Se a resposta for "0,10 = 0,10%", o que muda é SÓ a conversão na carga
--       (÷ 100); esquema e fórmula ficam. O check é o alarme: carga com 10 (= 10%) é recusada.
--   D2. B2 (regra oficial do ranking) — SEM RESPOSTA; RECOMENDAÇÃO PADRÃO (relatorios
--       [DÚVIDA 7], metas [DÚVIDA 3] e [14]): a regra da página METAS — Regular = entregas do
--       próprio vendedor SEM substituto; Substituição = entregas em que ele é o substituto
--       (bUAhB/bUAhP) —, meta FECHADA usa o valor congelado e aberta o corrente, e o rank é
--       PARTICIONADO por tipo de meta (Regular e Substituição não disputam o mesmo pódio).
--       Isolada numa view só, `v_ranking_metas`; mudar a regra é recriar essa view.
--       RankingVendas deixa de ser coluna (02 §3.5): ninguém grava ranking ao abrir a página.
--   D3. STATUS QUE CONTAM NO REALIZADO — metas [DÚVIDA 1], recomendação padrão: Financeiro OU
--       Concluído (hoje só Financeiro por igualdade, e a entrega que avança some da apuração).
--       Isolada em `fn_status_realizado()` = {5, 6}; toda função aceita `p_status` para
--       sobrepor. (relatorios [DÚVIDA 3] recomenda só Financeiro para OS RELATÓRIOS — o
--       parâmetro existe para isso.)
--   D4. ENTREGAS DO FECHAMENTO = EXATAMENTE AS QUE PRODUZIRAM O VALOR (metas [DÚVIDA 4]): hoje
--       bTwAk vincula as entregas de QualVendedor e soma as do substituto. Aqui as duas saem da
--       MESMA função, `fn_entregas_da_meta`, e o fechamento recalcula tudo no servidor — o valor
--       da tela não entra (metas §7.5, a falha mais grave da página).
--   D5. FECHAMENTO PELO PERÍODO DA META, não o da URL (metas [DÚVIDA 5]).
--   D6. `metas_fechadas` É 1:1 COM A META MENSAL (`meta_mensal_id` unique), e NÃO
--       `unique (vendedor_id, competencia)` como em 02 §3.5: com a unicidade de 02, o vendedor
--       que tem meta Regular E de Substituição no mês (dois tipos, 02 permite as duas metas) não
--       conseguiria fechar a segunda. Também sai `metas_mensais.meta_fechada_id` de 02: o
--       vínculo nos dois sentidos é o defeito do Bubble (metas §8.3.3, "sobram referências para
--       registro apagado"); "fechada" = existe metas_fechadas para ela (v_meta_atingimento).
--   D7. A META FECHADA É RETRATO COM PROVA: guarda realizado, percentual, fator e comissão, e o
--       check `comissao_coerente` exige total_comissao_vendedor = round(realizado × fator, 2).
--       Não tem policy de UPDATE: corrigir é cancelar e fechar de novo. MesNome/MesNumero/
--       AnoNumero não migram (derivam da competência, metas §8.4).
--   D8. AS DUAS ORIGENS DE CONTA A PAGAR (010 D1) — a regra fica no parâmetro
--       `fn_fechar_meta(..., p_gerar_conta_pagar boolean default true)`. A CP de meta declara em
--       conta_pagar_entregas TODAS as entregas do fechamento: se alguma já foi paga ao mesmo
--       vendedor pela confirmação da entrega (CP de 3%), o banco recusa o fechamento inteiro
--       (23505, entrega_paga_uma_vez). E `meta_fechada_entregas.entrega_id` é único (02 §6,
--       constraint 3): a mesma entrega não fecha em duas metas (metas [DÚVIDA 12]).
--   D9. META SEM VALOR: valor_meta ≥ 0 no banco (02 não fixa; a server action exige > 0 ao
--       criar). Com valor 0 o percentual é nulo (não divide por zero, metas §9.3 teste 2) e a
--       faixa é a PADRÃO — meta batida exige valor_meta > 0 e realizado ≥ valor_meta (o `≥` é
--       o do mapa: exatamente 100% já paga o fator cheio, bTvqD).
--   D10. RLS: 02 §7.2 "Restrito — perfil ≤ 2, ou o próprio" para `metas_*` e níveis. O mapa
--       (metas §1) mostra hierarquia ≤ 3 vendo todas as metas na tabela; ficou ≤ 2 porque o
--       realizado soma ENTREGAS, e a 009 já restringe entregas a hierarquia ≤ 2 ou dono — um
--       Analista vendo a meta de todos veria realizado zerado das alheias. Escrever meta e
--       fechar: hierarquia ≤ 2 (metas [DÚVIDA 18]: "Diretor e Gerente", sem os dois nomes em
--       código). Cancelar fechamento, mexer em nível e histórico de nível: perfil 1 (metas §1,
--       bTzir só Diretor; níveis tinham auto-binding aberto, 00-achados §2.3).
--   D11. O NÍVEL DA META É CONGELADO (metas §8.4: "a meta precisa congelar o nível"). Nulo na
--       criação → o vigente em `vendedor_nivel_historico` no início do período; sem histórico,
--       `usuarios.nivel_vendedor_id` (é o default do bTwBh). Fechar sem nível é recusado.
--
-- ORDEM DOS BLOCOS: extensão → tabelas → FKs pendentes → índices → funções → views →
-- triggers → RLS e policies.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. EXTENSÃO (02 §6.1 — conferida disponível; schema extensions, nunca public)
-- =====================================================================================
create extension if not exists btree_gist with schema extensions;


-- =====================================================================================
-- 2. TABELAS (§3.5)
-- =====================================================================================

-- ------------------------------------------------------------------------ niveis_vendedor
create table public.niveis_vendedor (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  ordem      smallint not null unique,
  meta_venda numeric(14,2) not null check (meta_venda >= 0),
  comissao_padrao      numeric(7,4) not null check (comissao_padrao between 0 and 1),
  comissao_meta_batida numeric(7,4) not null check (comissao_meta_batida between 0 and 1),
  qtd_meta_batida      smallint not null default 0 check (qtd_meta_batida >= 0),
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.niveis_vendedor is
  'Era Tbl.NiveisVendedores. QuaisVendedores (list.user) some: a FK é usuarios.nivel_vendedor_id. '
  'old_ValorBonus não migra (metas [DÚVIDA 11]). Escrita só perfil 1 (hoje auto-binding aberto). '
  'Auditada por trigger.';
comment on column public.niveis_vendedor.comissao_padrao is
  'FRAÇÃO (0.0500 = 5%), check 0..1 (D1, B3). Era cpo_fatorpremiacao_number. Aplicada quando o '
  'realizado < meta (bTvqD 2ª condicional).';
comment on column public.niveis_vendedor.comissao_meta_batida is
  'FRAÇÃO, check 0..1 (D1, B3). Era cpo_metabonus_number. Aplicada quando realizado ≥ meta.';
comment on column public.niveis_vendedor.qtd_meta_batida is
  'Nº de metas fechadas na régua de "subir nível" (era cpo_mediasobenivel_number, metas §5.1).';

-- -------------------------------------------------------------- vendedor_nivel_historico
create table public.vendedor_nivel_historico (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null references public.usuarios(id) on delete cascade,
  nivel_id        uuid not null references public.niveis_vendedor(id) on delete restrict,
  vigencia_inicio date not null,
  vigencia_fim    date,
  motivo          text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint vigencia_coerente check (vigencia_fim is null or vigencia_fim > vigencia_inicio),
  constraint vigencia_sem_sobreposicao exclude using gist (
    usuario_id with =,
    daterange(vigencia_inicio, coalesce(vigencia_fim, 'infinity'::date), '[)') with &&
  )
);

comment on table public.vendedor_nivel_historico is
  'Não existe no Bubble (o nível é um ponteiro no User, sem história). Vigência [início, fim): '
  'sem sobreposição por vendedor (exclude). É o que permite recalcular meta antiga com o nível '
  'da época (D11).';

-- --------------------------------------------------------------------------- metas_mensais
create table public.metas_mensais (
  id             uuid primary key default gen_random_uuid(),
  vendedor_id    uuid not null references public.usuarios(id) on delete restrict,
  competencia    date not null,                 -- dia 1 do mês; derivada de periodo_inicio
  tipo_meta_id   smallint not null references public.tipos_meta(id),
  nivel_id       uuid references public.niveis_vendedor(id) on delete restrict,
  valor_meta     numeric(14,2) not null check (valor_meta >= 0),
  periodo_inicio date not null,
  periodo_fim    date not null,
  observacao     text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint periodo_coerente     check (periodo_inicio <= periodo_fim),
  constraint competencia_dia_1    check (extract(day from competencia) = 1),
  constraint metas_mensais_unica  unique (vendedor_id, competencia, tipo_meta_id)
);

comment on table public.metas_mensais is
  'Era Tbl.MetasMensais. RankingVendas NÃO migra: é v_ranking_metas (D2). DataPeriodo (nunca '
  'gravado) vira periodo_inicio/fim (§1.4). meta_fechada_id de 02 não existe: fechada = há linha '
  'em metas_fechadas (D6). Imutável nos valores depois de fechada (trigger). Auditada.';
comment on column public.metas_mensais.nivel_id is
  'Nível CONGELADO na meta (D11). Nulo na criação → vigente no histórico → usuarios.nivel_vendedor_id.';
comment on column public.metas_mensais.valor_meta is
  '≥ 0 no banco; > 0 exigido pela action ao criar (D9). Default da tela = niveis_vendedor.meta_venda.';

-- --------------------------------------------------------------------------- metas_fechadas
create table public.metas_fechadas (
  id               uuid primary key default gen_random_uuid(),
  meta_mensal_id   uuid not null unique references public.metas_mensais(id) on delete restrict,
  -- retrato copiado da meta pelo trigger
  vendedor_id      uuid not null references public.usuarios(id) on delete restrict,
  tipo_meta_id     smallint not null references public.tipos_meta(id),
  competencia      date not null,
  periodo_inicio   date not null,
  periodo_fim      date not null,
  nivel_id         uuid not null references public.niveis_vendedor(id) on delete restrict,
  valor_meta       numeric(14,2) not null,
  -- o que o servidor calculou (D4, D7)
  total_comissao_megabox  numeric(14,2) not null check (total_comissao_megabox >= 0),  -- realizado
  percentual_atingido     numeric(9,4),
  fator_comissao          numeric(7,4) not null check (fator_comissao between 0 and 1),
  total_comissao_vendedor numeric(14,2) not null,
  fechada_em   timestamptz not null default now(),
  fechada_por  uuid not null references public.usuarios(id),
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint comissao_coerente check (
    total_comissao_vendedor = round(total_comissao_megabox * fator_comissao, 2)
  )
);

comment on table public.metas_fechadas is
  'Era Tbl.MetasFechadas (física tbl_orcfornecedorescotacao — reaproveitada; TotalComissaoMegabox '
  'no id cpo_tributoipi e TotalComissaoVendedor em cpo_tributopiscofinsb: cuidado na carga). '
  '1:1 com a meta mensal (D6). Retrato calculado no servidor (bTwAj gravava o que estava na tela, '
  'metas §7.5); comissão = round(realizado × fator, 2) por check (D7). Auditada.';

-- -------------------------------------------------------------------- meta_fechada_entregas
create table public.meta_fechada_entregas (
  meta_fechada_id uuid not null references public.metas_fechadas(id) on delete cascade,
  entrega_id      uuid not null references public.entregas(id) on delete restrict,
  criado_em       timestamptz not null default now(),
  criado_por      uuid references public.usuarios(id),
  primary key (meta_fechada_id, entrega_id)
);

-- 02 §6 constraint 3 — ESTE ÍNDICE É A CORREÇÃO CENTRAL DO MÓDULO (metas §8.3.2)
create unique index entrega_em_uma_meta_so on public.meta_fechada_entregas (entrega_id);

comment on table public.meta_fechada_entregas is
  'MetasFechadas.QuaisEntregas e Entregas.QualMetaFechada (lista + ponteiro solto) viram esta '
  'ligação, com entrega única: a mesma entrega não fecha em duas metas (metas [DÚVIDA 12]). '
  'Cancelar o fechamento solta as entregas (cascade).';


-- =====================================================================================
-- 3. FKs PENDENTES (001 e 010)
-- =====================================================================================
alter table public.usuarios
  add constraint usuarios_nivel_vendedor_fkey
  foreign key (nivel_vendedor_id) references public.niveis_vendedor(id) on delete restrict;

comment on column public.usuarios.nivel_vendedor_id is
  'Nível ATUAL do vendedor (pop.CadastroUsuarios). FK para niveis_vendedor desde a 011. A '
  'história fica em vendedor_nivel_historico.';

alter table public.contas_pagar
  add constraint contas_pagar_meta_fechada_fkey
  foreign key (meta_fechada_id) references public.metas_fechadas(id) on delete set null;

-- Pendência da 012 (rodapé "FICA PENDENTE" 1): historicos.conta_receber_id nasceu SEM FK porque
-- contas_receber é da 010. Idempotente e condicional: só se a coluna existir e a FK ainda não.
-- O índice (historicos_conta_receber_idx, parcial) já veio na 012; o `if not exists` só cobre a
-- hipótese de ele faltar.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'historicos'
               and column_name = 'conta_receber_id') then
    if not exists (select 1 from pg_constraint
                   where conname = 'historicos_conta_receber_id_fkey'
                     and conrelid = 'public.historicos'::regclass) then
      alter table public.historicos
        add constraint historicos_conta_receber_id_fkey
        foreign key (conta_receber_id) references public.contas_receber(id) on delete set null;
    end if;
    create index if not exists historicos_conta_receber_idx
      on public.historicos (conta_receber_id) where conta_receber_id is not null;
  end if;
end $$;


-- =====================================================================================
-- 4. ÍNDICES
-- =====================================================================================
-- niveis_vendedor (nome e ordem são unique)
create index niveis_vendedor_criado_por_idx   on public.niveis_vendedor (criado_por);
create index niveis_vendedor_alterado_por_idx on public.niveis_vendedor (alterado_por);

-- vendedor_nivel_historico (o exclude cria o gist por usuario_id + vigência)
create index vendedor_nivel_hist_usuario_idx   on public.vendedor_nivel_historico (usuario_id, vigencia_inicio desc);
create index vendedor_nivel_hist_nivel_idx     on public.vendedor_nivel_historico (nivel_id);
create index vendedor_nivel_hist_criado_por_idx   on public.vendedor_nivel_historico (criado_por);
create index vendedor_nivel_hist_alterado_por_idx on public.vendedor_nivel_historico (alterado_por);

-- metas_mensais (o unique cobre vendedor_id) — metas §8.4
create index metas_mensais_periodo_idx     on public.metas_mensais (periodo_inicio, periodo_fim);
create index metas_mensais_competencia_idx on public.metas_mensais (competencia, tipo_meta_id);
create index metas_mensais_tipo_idx        on public.metas_mensais (tipo_meta_id);
create index metas_mensais_nivel_idx       on public.metas_mensais (nivel_id);
create index metas_mensais_criado_por_idx   on public.metas_mensais (criado_por);
create index metas_mensais_alterado_por_idx on public.metas_mensais (alterado_por);

-- metas_fechadas (meta_mensal_id é unique)
create index metas_fechadas_vendedor_idx    on public.metas_fechadas (vendedor_id, periodo_inicio desc);
create index metas_fechadas_competencia_idx on public.metas_fechadas (competencia);
create index metas_fechadas_tipo_idx        on public.metas_fechadas (tipo_meta_id);
create index metas_fechadas_nivel_idx       on public.metas_fechadas (nivel_id);
create index metas_fechadas_fechada_por_idx on public.metas_fechadas (fechada_por);
create index metas_fechadas_criado_por_idx   on public.metas_fechadas (criado_por);
create index metas_fechadas_alterado_por_idx on public.metas_fechadas (alterado_por);

-- meta_fechada_entregas (pk cobre meta_fechada_id; entrega_em_uma_meta_so cobre entrega_id)
create index meta_fechada_entregas_criado_por_idx on public.meta_fechada_entregas (criado_por);

-- entregas: a apuração filtra por vendedor/substituto + data real (metas §8.4)
create index entregas_vendedor_dt_entrega_idx   on public.entregas (vendedor_id, dt_entrega)
  where dt_entrega is not null;
create index entregas_substituto_dt_entrega_idx on public.entregas (vendedor_substituto_id, dt_entrega)
  where vendedor_substituto_id is not null and dt_entrega is not null;


-- =====================================================================================
-- 5. FUNÇÕES DE CÁLCULO (security invoker; com teste — CLAUDE.md regra 10)
-- =====================================================================================

-- ------------------------------------------------------------------- fn_status_realizado (D3)
create function public.fn_status_realizado()
  returns smallint[]
  language sql
  immutable
  set search_path = ''
as $$
  -- metas [DÚVIDA 1], recomendação padrão: 5 Financeiro e 6 Concluído (não só Financeiro).
  select array[5, 6]::smallint[]
$$;

comment on function public.fn_status_realizado() is
  'D3 isolada: status de entrega que contam no realizado de meta. Mudar = mudar só esta função '
  '(ou passar p_status nas funções abaixo).';

-- ----------------------------------------------------------------------- fn_entregas_da_meta
create function public.fn_entregas_da_meta(p_meta uuid, p_status smallint[] default null)
  returns table (entrega_id uuid, valor_comissao numeric)
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  select e.id, e.valor_comissao
  from public.metas_mensais m
  join public.entregas e
    on e.dt_entrega between m.periodo_inicio and m.periodo_fim           -- D5: período DA META
  where m.id = p_meta
    and e.status_id = any (coalesce(p_status, public.fn_status_realizado()))
    and (
      -- Regular: do próprio vendedor, fora de substituição (bTvpn 1ª condicional, bUAhB)
      (m.tipo_meta_id = 1 and e.vendedor_id = m.vendedor_id and e.vendedor_substituto_id is null)
      -- Substituição: as que ele cobriu (bTvpn 2ª condicional, bUAhP)
      or (m.tipo_meta_id = 2 and e.vendedor_substituto_id = m.vendedor_id)
    )
$$;

comment on function public.fn_entregas_da_meta(uuid, smallint[]) is
  'As entregas que compõem o realizado de uma meta — a MESMA lista para somar e para vincular no '
  'fechamento (D4). Data REAL de entrega dentro do período da meta.';

-- --------------------------------------------------------------------------- fn_calculo_meta
create function public.fn_calculo_meta(p_meta uuid, p_status smallint[] default null)
  returns table (
    realizado         numeric,
    percentual        numeric,
    meta_batida       boolean,
    fator             numeric,
    comissao_vendedor numeric,
    qtd_entregas      integer
  )
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  select y.realizado,
         y.percentual,
         y.meta_batida,
         y.fator,
         round(y.realizado * y.fator, 2),                                   -- bTvqD
         y.qtd
  from (
    select x.realizado,
           x.qtd,
           case when m.valor_meta > 0 then round(x.realizado / m.valor_meta, 4) end  as percentual,
           (m.valor_meta > 0 and x.realizado >= m.valor_meta)                           as meta_batida,
           case when m.valor_meta > 0 and x.realizado >= m.valor_meta
                then n.comissao_meta_batida else n.comissao_padrao end                  as fator
    from public.metas_mensais m
    left join public.niveis_vendedor n on n.id = m.nivel_id
    cross join lateral (
      select coalesce(sum(d.valor_comissao), 0) as realizado, count(*)::integer as qtd
      from public.fn_entregas_da_meta(m.id, p_status) d
    ) x
    where m.id = p_meta
  ) y
$$;

comment on function public.fn_calculo_meta(uuid, smallint[]) is
  'Realizado, % (razão, 4 casas; nulo com meta 0 — D9), faixa (≥ = batida, bTvqD), fator do nível '
  'congelado (B3 como fração, D1) e comissão = round(realizado × fator, 2). Fonte única da tabela, '
  'do ranking e do fechamento.';


-- =====================================================================================
-- 6. FUNÇÕES DE TRIGGER
-- =====================================================================================

-- ------------------------------------------------------------- fn_meta_mensal_derivados
create function public.fn_meta_mensal_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and exists (select 1 from public.metas_fechadas f where f.meta_mensal_id = old.id)
     and (new.vendedor_id, new.tipo_meta_id, new.nivel_id, new.valor_meta, new.periodo_inicio, new.periodo_fim)
         is distinct from
         (old.vendedor_id, old.tipo_meta_id, old.nivel_id, old.valor_meta, old.periodo_inicio, old.periodo_fim) then
    raise exception 'Meta fechada não muda: cancele o fechamento antes (metas §9.3)' using errcode = '55000';
  end if;

  -- competência = dia 1 do mês de início (02 §3.5)
  new.competencia := new.periodo_inicio - (extract(day from new.periodo_inicio)::integer - 1);

  -- D11: nível congelado — histórico vigente no início, senão o nível atual do usuário
  if new.nivel_id is null then
    select h.nivel_id into new.nivel_id
    from public.vendedor_nivel_historico h
    where h.usuario_id = new.vendedor_id
      and new.periodo_inicio >= h.vigencia_inicio
      and (h.vigencia_fim is null or new.periodo_inicio < h.vigencia_fim);
    if new.nivel_id is null then
      select u.nivel_vendedor_id into new.nivel_id from public.usuarios u where u.id = new.vendedor_id;
    end if;
  end if;
  return new;
end $$;

comment on function public.fn_meta_mensal_derivados() is
  'BEFORE INSERT OR UPDATE de metas_mensais: competência do período, nível congelado (D11) e '
  'imutabilidade depois de fechada.';

-- ------------------------------------------------------------- fn_meta_fechada_derivados
create function public.fn_meta_fechada_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_m record;
begin
  select m.vendedor_id, m.tipo_meta_id, m.competencia, m.periodo_inicio, m.periodo_fim,
         m.nivel_id, m.valor_meta
    into v_m
  from public.metas_mensais m where m.id = new.meta_mensal_id;
  if not found then
    raise exception 'Meta mensal % não encontrada (ou sem acesso)', new.meta_mensal_id using errcode = '42501';
  end if;

  new.vendedor_id    := v_m.vendedor_id;
  new.tipo_meta_id   := v_m.tipo_meta_id;
  new.competencia    := v_m.competencia;
  new.periodo_inicio := v_m.periodo_inicio;
  new.periodo_fim    := v_m.periodo_fim;
  new.nivel_id       := coalesce(new.nivel_id, v_m.nivel_id);
  new.valor_meta     := v_m.valor_meta;
  new.fechada_em     := now();
  new.fechada_por    := coalesce(auth.uid(), new.fechada_por);
  return new;
end $$;

comment on function public.fn_meta_fechada_derivados() is
  'BEFORE INSERT de metas_fechadas: copia o retrato da meta (D6/D7) e o autor do fechamento.';

revoke execute on function public.fn_meta_mensal_derivados()  from anon, authenticated, public;
revoke execute on function public.fn_meta_fechada_derivados() from anon, authenticated, public;


-- =====================================================================================
-- 7. FUNÇÕES DE NEGÓCIO (security invoker)
-- =====================================================================================

-- ---------------------------------------------------------------------------- fn_fechar_meta
create function public.fn_fechar_meta(
  p_meta              uuid,
  p_vencimento_dias   integer default 10,
  p_gerar_conta_pagar boolean default true,
  p_status            smallint[] default null
)
  returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_m  record;
  v_c  record;
  v_f  uuid;
  v_cp uuid;
begin
  select m.id, m.vendedor_id, m.nivel_id into v_m
  from public.metas_mensais m where m.id = p_meta
  for update;
  if not found then
    raise exception 'Meta % não encontrada (ou sem acesso)', p_meta using errcode = 'P0002';
  end if;
  if exists (select 1 from public.metas_fechadas f where f.meta_mensal_id = p_meta) then
    raise exception 'A meta % já está fechada', p_meta using errcode = '23505';
  end if;
  if v_m.nivel_id is null then
    raise exception 'Meta sem nível: não há fator de comissão' using errcode = '23502';
  end if;
  if p_vencimento_dias is null or p_vencimento_dias < 0 then
    raise exception 'Prazo de vencimento inválido' using errcode = '22023';
  end if;

  select * into v_c from public.fn_calculo_meta(p_meta, p_status);
  if v_c.qtd_entregas = 0 then
    raise exception 'Nenhuma entrega no período da meta: nada a fechar (metas §9.3)' using errcode = 'P0002';
  end if;

  insert into public.metas_fechadas
    (meta_mensal_id, total_comissao_megabox, percentual_atingido, fator_comissao,
     total_comissao_vendedor, fechada_por, criado_por)
  values
    (p_meta, v_c.realizado, v_c.percentual, v_c.fator, v_c.comissao_vendedor, auth.uid(), auth.uid())
  returning id into v_f;

  -- D4: exatamente as entregas que produziram o valor; o índice único recusa as já fechadas
  insert into public.meta_fechada_entregas (meta_fechada_id, entrega_id, criado_por)
  select v_f, d.entrega_id, auth.uid() from public.fn_entregas_da_meta(p_meta, p_status) d;

  -- D8: a regra das duas origens fica no parâmetro; a duplicata é o banco que recusa
  if p_gerar_conta_pagar then
    insert into public.contas_pagar
      (origem, meta_fechada_id, vendedor_id, valor_base, percentual, dt_vencimento, criado_por)
    values
      ('meta', v_f, v_m.vendedor_id, v_c.realizado, v_c.fator,
       (now() at time zone 'America/Sao_Paulo')::date + p_vencimento_dias,   -- bTzXn: agora + 10 dias
       auth.uid())
    returning id into v_cp;

    insert into public.conta_pagar_entregas (conta_pagar_id, vendedor_id, entrega_id, criado_por)
    select v_cp, v_m.vendedor_id, d.entrega_id, auth.uid()
    from public.fn_entregas_da_meta(p_meta, p_status) d;
  end if;

  return v_f;
end $$;

comment on function public.fn_fechar_meta(uuid, integer, boolean, smallint[]) is
  'bTwAj + bTzXn numa transação, tudo recalculado no servidor (D4, D7): retrato em metas_fechadas, '
  'entregas vinculadas (únicas), e — se p_gerar_conta_pagar — a CP de origem meta com '
  'valor_comissao = round(realizado × fator, 2) e vencimento hoje + p_vencimento_dias (10, '
  'metas [DÚVIDA 17]). Entrega já paga ao vendedor por outra CP → 23505 (D8).';

-- ---------------------------------------------------------------- fn_cancelar_fechamento_meta
create function public.fn_cancelar_fechamento_meta(p_meta_fechada uuid, p_motivo text)
  returns void
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if nullif(btrim(p_motivo), '') is null then
    raise exception 'Cancelar o fechamento exige motivo' using errcode = '23514';
  end if;

  -- metas [DÚVIDA 6]: recusa se a comissão já foi paga (hoje bTzkw apaga assim mesmo)
  if exists (
    select 1
    from public.contas_pagar cp
    join public.baixas b on b.conta_pagar_id = cp.id
    where cp.meta_fechada_id = p_meta_fechada
      and not exists (select 1 from public.estornos s where s.baixa_id = b.id)
  ) then
    raise exception 'A comissão desta meta já tem baixa: estorne no financeiro antes' using errcode = '55000';
  end if;

  -- cancelamento LÓGICO da CP (solta as entregas por trigger da 010); nada de DeleteList
  update public.contas_pagar
     set cancelada_em = now(), motivo_cancelamento = p_motivo
   where meta_fechada_id = p_meta_fechada and cancelada_em is null;

  delete from public.metas_fechadas where id = p_meta_fechada;
  if not found then
    raise exception 'Meta fechada % não encontrada (ou sem permissão)', p_meta_fechada using errcode = 'P0002';
  end if;
end $$;

comment on function public.fn_cancelar_fechamento_meta(uuid, text) is
  'bTzkZ numa transação, sem deixar lixo (metas §8.3.3): recusa com CP baixada, cancela a CP '
  '(lógico, 010 D8), apaga o fechamento — as entregas se soltam em cascade e a meta mensal volta '
  'a aberta. Só perfil 1 (RLS de delete).';

revoke execute on function public.fn_status_realizado()                                from public, anon;
revoke execute on function public.fn_entregas_da_meta(uuid, smallint[])                from public, anon;
revoke execute on function public.fn_calculo_meta(uuid, smallint[])                    from public, anon;
revoke execute on function public.fn_fechar_meta(uuid, integer, boolean, smallint[])   from public, anon;
revoke execute on function public.fn_cancelar_fechamento_meta(uuid, text)              from public, anon;
grant execute on function public.fn_status_realizado()                                to authenticated, service_role;
grant execute on function public.fn_entregas_da_meta(uuid, smallint[])                to authenticated, service_role;
grant execute on function public.fn_calculo_meta(uuid, smallint[])                    to authenticated, service_role;
grant execute on function public.fn_fechar_meta(uuid, integer, boolean, smallint[])   to authenticated, service_role;
grant execute on function public.fn_cancelar_fechamento_meta(uuid, text)              to authenticated, service_role;


-- =====================================================================================
-- 8. VIEWS (security_invoker)
-- =====================================================================================
create view public.v_meta_atingimento
with (security_invoker = true) as
select m.id                  as meta_mensal_id,
       m.vendedor_id,
       m.competencia,
       m.tipo_meta_id,
       m.periodo_inicio,
       m.periodo_fim,
       m.nivel_id,
       m.valor_meta,
       f.id                  as meta_fechada_id,
       (f.id is not null)    as fechada,
       case when f.id is not null then f.total_comissao_megabox  else c.realizado         end as realizado,
       case when f.id is not null then f.percentual_atingido     else c.percentual        end as percentual,
       case when f.id is not null then (f.valor_meta > 0 and f.total_comissao_megabox >= f.valor_meta)
            else c.meta_batida end                                                          as meta_batida,
       case when f.id is not null then f.fator_comissao          else c.fator             end as fator_comissao,
       case when f.id is not null then f.total_comissao_vendedor else c.comissao_vendedor end as comissao_vendedor
from public.metas_mensais m
left join public.metas_fechadas f on f.meta_mensal_id = m.id
left join lateral (
  select * from public.fn_calculo_meta(m.id) where f.id is null
) c on true;

comment on view public.v_meta_atingimento is
  'Uma linha por meta mensal (metas §9.4): realizado, %, faixa, fator e comissão. Fechada → o '
  'retrato congelado; aberta → fn_calculo_meta. Substitui Ipt valor faturado/% da meta/valor '
  'comissao calculados no navegador. security_invoker: a RLS das metas e das entregas vale.';

create view public.v_ranking_metas
with (security_invoker = true) as
select v.*,
       rank() over (partition by v.competencia, v.tipo_meta_id
                    order by v.percentual desc nulls last) as posicao
from public.v_meta_atingimento v;

comment on view public.v_ranking_metas is
  'B2 ISOLADA AQUI (D2): regra da página metas; fechada usa o valor congelado; rank por '
  'competência E tipo de meta (Regular e Substituição em pódios separados, metas [DÚVIDA 14]). '
  'Substitui MetasMensais.RankingVendas, gravado por DUAS páginas a cada carregamento.';

revoke all on public.v_meta_atingimento from anon;
revoke all on public.v_ranking_metas    from anon;
grant select on public.v_meta_atingimento to authenticated;
grant select on public.v_ranking_metas    to authenticated;


-- =====================================================================================
-- 9. TRIGGERS
-- =====================================================================================
create trigger trg_metas_mensais_derivados
  before insert or update on public.metas_mensais
  for each row execute function public.fn_meta_mensal_derivados();
create trigger trg_metas_fechadas_derivados
  before insert on public.metas_fechadas
  for each row execute function public.fn_meta_fechada_derivados();

create trigger trg_niveis_vendedor_alterado before update on public.niveis_vendedor
  for each row execute function public.fn_set_alterado();
create trigger trg_vendedor_nivel_hist_alterado before update on public.vendedor_nivel_historico
  for each row execute function public.fn_set_alterado();
create trigger trg_metas_mensais_alterado before update on public.metas_mensais
  for each row execute function public.fn_set_alterado();
create trigger trg_metas_fechadas_alterado before update on public.metas_fechadas
  for each row execute function public.fn_set_alterado();

-- Dinheiro e remuneração: trilha completa (metas §7.9: hoje nada registra quem fechou/cancelou)
create trigger trg_niveis_vendedor_auditoria after insert or update or delete on public.niveis_vendedor
  for each row execute function public.fn_auditoria();
create trigger trg_vendedor_nivel_hist_auditoria after insert or update or delete on public.vendedor_nivel_historico
  for each row execute function public.fn_auditoria();
create trigger trg_metas_mensais_auditoria after insert or update or delete on public.metas_mensais
  for each row execute function public.fn_auditoria();
create trigger trg_metas_fechadas_auditoria after insert or update or delete on public.metas_fechadas
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 10. RLS E POLICIES (CLAUDE.md regra 3; 02 §7.2 nível Restrito; D10)
-- =====================================================================================
alter table public.niveis_vendedor          enable row level security;
alter table public.vendedor_nivel_historico enable row level security;
alter table public.metas_mensais            enable row level security;
alter table public.metas_fechadas           enable row level security;
alter table public.meta_fechada_entregas    enable row level security;

revoke all on table public.niveis_vendedor          from anon;
revoke all on table public.vendedor_nivel_historico from anon;
revoke all on table public.metas_mensais            from anon;
revoke all on table public.metas_fechadas           from anon;
revoke all on table public.meta_fechada_entregas    from anon;

-- retrato do fechamento não se edita (D7): corrigir = cancelar e fechar de novo
revoke update, truncate on table public.metas_fechadas from authenticated;

-- ------------------------------------------------------------------------ niveis_vendedor
create policy niveis_vendedor_leitura on public.niveis_vendedor
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('metas'))
    or id = (select u.nivel_vendedor_id from public.usuarios u where u.id = (select auth.uid()))
  );
create policy niveis_vendedor_escrita on public.niveis_vendedor
  for all to authenticated
  using ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 1)
  with check ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 1);

comment on policy niveis_vendedor_escrita on public.niveis_vendedor is
  'Só perfil 1: meta de referência e percentuais de comissão (hoje auto-binding aberto a qualquer '
  'logado, 00-achados §2.3). Lê quem tem a página metas, ou o próprio nível.';

-- -------------------------------------------------------------- vendedor_nivel_historico
create policy vendedor_nivel_hist_leitura on public.vendedor_nivel_historico
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('metas'))
    and ((select public.fn_hierarquia()) <= 2 or usuario_id = (select auth.uid()))
  );
create policy vendedor_nivel_hist_escrita on public.vendedor_nivel_historico
  for all to authenticated
  using ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 1)
  with check ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 1);

-- --------------------------------------------------------------------------- metas_mensais
create policy metas_mensais_leitura on public.metas_mensais
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('metas'))
    and ((select public.fn_hierarquia()) <= 2 or vendedor_id = (select auth.uid()))
  );
create policy metas_mensais_escrita on public.metas_mensais
  for all to authenticated
  using ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 2)
  with check ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 2);

comment on policy metas_mensais_leitura on public.metas_mensais is
  'SIGILO (D10): hierarquia ≤ 2 vê todas; abaixo, só as próprias — agora no banco, não na '
  'condicional de RG (metas §1, que ainda abria tudo com QualPerfil vazio).';

-- -------------------------------------------------------------------------- metas_fechadas
create policy metas_fechadas_leitura on public.metas_fechadas
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('metas'))
    and ((select public.fn_hierarquia()) <= 2 or vendedor_id = (select auth.uid()))
  );
create policy metas_fechadas_insercao on public.metas_fechadas
  for insert to authenticated
  with check ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 2);
create policy metas_fechadas_exclusao on public.metas_fechadas
  for delete to authenticated
  using ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 1);

comment on policy metas_fechadas_exclusao on public.metas_fechadas is
  'Cancelar fechamento = só Diretor (bTzir). Pela fn_cancelar_fechamento_meta, que antes cancela '
  'a CP e recusa se ela tem baixa. Sem policy de UPDATE (D7).';

-- -------------------------------------------------------------------- meta_fechada_entregas
create policy meta_fechada_entregas_leitura on public.meta_fechada_entregas
  for select to authenticated
  using (exists (select 1 from public.metas_fechadas f where f.id = meta_fechada_id));
create policy meta_fechada_entregas_escrita on public.meta_fechada_entregas
  for all to authenticated
  using ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 2)
  with check ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 2);

-- ------------------------------------------------ ADITIVAS nas tabelas da 009/010 (permissivas)
-- entregas: o realizado soma entregas; mesma regra de dono da 009.
create policy entregas_leitura_metas on public.entregas
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('metas'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  );

-- contas_pagar de ORIGEM META: a página metas cria (fechar) e cancela (cancelar fechamento).
create policy contas_pagar_leitura_metas on public.contas_pagar
  for select to authenticated
  using (
    origem = 'meta'
    and (select public.fn_pode_acessar_pagina('metas'))
    and ((select public.fn_hierarquia()) <= 2 or vendedor_id = (select auth.uid()))
  );
create policy contas_pagar_insercao_metas on public.contas_pagar
  for insert to authenticated
  with check (
    origem = 'meta'
    and (select public.fn_pode_acessar_pagina('metas'))
    and (select public.fn_hierarquia()) <= 2
  );
create policy contas_pagar_alteracao_metas on public.contas_pagar
  for update to authenticated
  using (
    origem = 'meta'
    and (select public.fn_pode_acessar_pagina('metas'))
    and (select public.fn_hierarquia()) <= 1
  )
  with check (
    origem = 'meta'
    and (select public.fn_pode_acessar_pagina('metas'))
    and (select public.fn_hierarquia()) <= 1
  );
create policy conta_pagar_entregas_escrita_metas on public.conta_pagar_entregas
  for all to authenticated
  using ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 2)
  with check ((select public.fn_pode_acessar_pagina('metas')) and (select public.fn_hierarquia()) <= 2);

comment on policy entregas_leitura_metas on public.entregas is
  'Soma à 009/010 a página metas, com a mesma regra de dono: sem ela, quem tem metas e não tem '
  'vendas veria realizado zero.';
comment on policy contas_pagar_insercao_metas on public.contas_pagar is
  'Só CP de ORIGEM META, só hierarquia ≤ 2 (fn_fechar_meta). O valor é gerado '
  '(round(base × percentual, 2), 010 D9) e as entregas pagas passam pelo unique da 010 (D8).';


-- =====================================================================================
-- FIM da 011_metas.sql
-- =====================================================================================
-- CONFERÊNCIA
--   5 tabelas, 5 com RLS, 5 com `revoke all ... from anon`.
--   Policies novas: 11 nas tabelas desta migration + 5 ADITIVAS (entregas leitura; contas_pagar
--   leitura/inserção/alteração de origem meta; conta_pagar_entregas escrita).
--   FKs pendentes resolvidas: usuarios.nivel_vendedor_id (001), contas_pagar.meta_fechada_id
--   (010) e, condicional/idempotente, historicos.conta_receber_id (pendência 1 da 012).
--   Dinheiro: numeric(14,2); fatores numeric(7,4) em fração (check 0..1); nenhum float.
--   FKs indexadas: todas. 2 índices novos em entregas para a apuração.
--   Funções: 3 de cálculo + 2 de negócio, security invoker, execute para authenticated e
--   service_role, revogado de anon; 2 de trigger, execute revogado. Nenhuma security definer.
--   2 views (security_invoker = true).
--   Triggers: 2 derivados, 4 fn_set_alterado, 4 fn_auditoria.
--   Extensão: btree_gist em `extensions`. Nenhum seed. Nenhum segredo.
-- =====================================================================================
