-- =====================================================================================
-- 030_sac_apoio_comercial.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Metas trimestrais do APOIO COMERCIAL dentro do SAC. Funcionalidade NOVA (não existe no
-- Bubble): pedido do dono — "dentro da parte de SAC haveremos novos funcionários e metas".
-- A colaboradora é avaliada por trimestre em 4 indicadores com peso (total 100%):
--   1. Pesquisa de satisfação ........ 25%  meta: ≥ 25% de respostas
--   2. Avaliação dos atendimentos .... 25%  meta: média ≥ 9,0 com mínimo de avaliações válidas
--   3. Novos clientes / oportunidades  30%  meta: 30 no trimestre
--   4. Acompanhamento e resolução .... 20%  = prazo ≥ 95% (10) + parados = 0 (5) + retorno ≥ 95% (5)
-- Decisões registradas em specs/paginas/sac.md ("Apoio Comercial — metas trimestrais") e as
-- dúvidas em specs/04-duvidas.md (§ SAC — Apoio Comercial).
--
-- Depende de 001 (usuarios, fn_hierarquia, fn_pode_acessar_pagina, fn_set_alterado,
-- fn_auditoria), 006 (grupos_clifor) e 013 (sac_protocolos, sac_interacoes, pesquisas,
-- pesquisa_convites, pesquisa_respostas).
--
-- O QUE REAPROVEITA (nada de tabela paralela)
--   * ocorrência = `sac_protocolos` (+ prazo, motivo de pendência, "depende de fornecedor");
--   * histórico de ações = `sac_interacoes` (append-only, 013 D5) + TIPO da ação;
--   * avaliação do atendimento = pesquisa tipo 1 (SAC) com convite por token, ligado ao
--     protocolo (`pesquisa_convites.protocolo_id`), disparado pela server action ao encerrar;
--   * pesquisa de satisfação = convites de pesquisas tipo 2 (NPS) já existentes.
--
-- >>> DECISÕES <<<
--   D1. FLAGS DERIVADAS, NÃO DIGITADAS. "Cliente informado" e "fornecedor cobrado" saem das
--       interações (tipo da ação; `visivel_cliente` conta como informar o cliente), e "última
--       atualização" é a última AÇÃO REGISTRADA (interação) — ou a abertura, se não houver
--       nenhuma. Editar a descrição ou o status sem registrar ação NÃO conta como
--       acompanhamento. Nada disso é coluna: não depende de disciplina e não desalinha.
--   D2. PRAZO. `prazo_em` (dia, São Paulo) é a previsão de solução. Vazio → prazo padrão =
--       dia da abertura + `prazo_padrao_dias` do trimestre. Vale até o FIM do dia do prazo.
--       Anti-maquiagem: definir o prazo pela primeira vez é livre (responsável); ALTERAR um
--       prazo já definido é só perfil ≤ 2 (trigger, 42501). Atraso se justifica com o motivo
--       de pendência e as ações registradas, não empurrando a data.
--   D3. "ACOMPANHADA" x "RESOLVIDA". Cada ocorrência aberta no trimestre é classificada na
--       data de referência (fim do trimestre, ou agora se ele não acabou):
--         no_prazo     — resolvida até o fim do dia do prazo;
--         em_andamento — aberta e o prazo ainda não venceu (fora do cálculo);
--         acompanhada  — venceu o prazo (resolvida depois ou ainda aberta) MAS tem motivo de
--                        pendência, cliente informado, fornecedor cobrado (quando aplicável) e
--                        não está parada → NÃO penaliza (a regra central do dono);
--         fora_prazo   — venceu o prazo sem esse acompanhamento.
--       Resolvidas no prazo (%) = (no_prazo + acompanhada) ÷ (no_prazo + acompanhada + fora_prazo).
--   D4. PARADO = não resolvida e última ação há MAIS de X dias (`dias_sem_atualizacao`,
--       configurável). Sinalizado na lista e no contador da aba (calculado, sem agendador).
--   D5. FORNECEDOR "QUANDO APLICÁVEL" = `depende_fornecedor` marcado, OU chamado contra um
--       fornecedor, OU já houve cobrança registrada.
--   D6. RETORNO AO CLIENTE (%) = resolvidas com cliente informado ÷ resolvidas (na referência).
--   D7. PESQUISA DE SATISFAÇÃO = convites de pesquisas tipo 2 (NPS), não removidos, com link
--       emitido (`enviado_em`) no trimestre; responsável = quem incluiu o convite
--       (`criado_por`). Resposta conta mesmo se chegar depois do fim do trimestre (o convite é
--       do trimestre; ele expira em 30 dias, então o número estabiliza).
--   D8. AVALIAÇÃO DO ATENDIMENTO = respostas no trimestre a convites tipo 1 (SAC) ligados a
--       protocolos do responsável; nota = nota_atendimento (ou nota_nps). Realizado = MÉDIA
--       DAS MÉDIAS MENSAIS, como o exemplo do dono ("jul 9,2, ago 9,1, set 9,4 → 9,23");
--       meses sem avaliação ficam fora. Abaixo do mínimo de avaliações válidas → não atingida.
--   D9. OPORTUNIDADES = `sac_oportunidades` com `identificada_em` no trimestre, qualquer
--       categoria (novo cliente, inativo recuperado, interesse, qualificada). A venda NÃO é
--       dela: o resultado é informativo e a venda fechada é do vendedor.
--   D10. NOTA. Atingiu a meta → peso cheio. Não atingiu → 0, ou proporcional
--       (peso × realizado ÷ meta, teto no peso) se `nota_proporcional` do trimestre estiver
--       ligado. "Parados = 0" e amostra insuficiente de avaliações dão 0 em qualquer modo.
--       Indicador sem base (nenhuma ocorrência vencida / nenhuma resolvida) = atingido.
--   D11. PARÂMETROS POR TRIMESTRE (`sac_apoio_parametros`), editáveis só pelo perfil 1. Vale a
--       linha do trimestre; sem ela, a do último trimestre anterior que tiver linha; antes da
--       primeira, a primeira. Semente: 1º tri/2026 com os números do dono. Pesos somam 100.
--   D12. SIGILO. A colaboradora vê os dela; perfil ≤ 2 vê todos. Oportunidades: RLS própria.
--       Chamados: a policy de LEITURA da 013 é trocada: perfil ≤ 2 com a página sac lê todos (a 013
--       só dava ao perfil 1) — o gestor precisa enxergar o que avalia. Alterar continua perfil
--       1 ou responsável (013 D4). Nas funções de indicador, quem não é perfil ≤ 2 recebe
--       SEMPRE o próprio painel, qualquer que seja o p_responsavel pedido.
--   D13. Funções `security invoker`, `search_path = ''`, EXECUTE só authenticated (e
--       service_role). Nenhuma security definer nova. Nenhum float: médias e percentuais em
--       numeric arredondado a 2 casas.
--
-- ORDEM: colunas novas → tabelas → índices → funções → triggers → RLS/policies → semente.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. COLUNAS NOVAS EM TABELAS DA 013
-- =====================================================================================

alter table public.sac_protocolos
  add column prazo_em date,
  add column depende_fornecedor boolean not null default false,
  add column motivo_pendencia text,
  add constraint motivo_pendencia_tamanho check (char_length(motivo_pendencia) <= 2000);

comment on column public.sac_protocolos.prazo_em is
  'Prazo/previsão de solução (dia em São Paulo, vale até o fim do dia). Vazio = abertura + '
  'prazo_padrao_dias do trimestre. Alterar depois de definido: só perfil ≤ 2 (030 D2).';
comment on column public.sac_protocolos.depende_fornecedor is
  'A solução depende do fornecedor: a cobrança ao fornecedor passa a ser exigida no '
  'acompanhamento (030 D5).';
comment on column public.sac_protocolos.motivo_pendencia is
  'Por que não foi resolvida no prazo. Com as ações registradas, é o que torna um atraso '
  '"acompanhado" em vez de "fora do prazo" (030 D3).';

alter table public.sac_interacoes
  add column tipo_acao text not null default 'atualizacao_interna',
  add constraint tipo_acao_valido check (tipo_acao in
    ('contato_cliente', 'cobranca_fornecedor', 'atualizacao_interna', 'retorno_cliente'));

comment on column public.sac_interacoes.tipo_acao is
  'Tipo da ação registrada (030): contato_cliente | cobranca_fornecedor | atualizacao_interna '
  '| retorno_cliente. Deriva "cliente informado" e "fornecedor cobrado" (D1). As interações '
  'anteriores ficam como atualizacao_interna; as visíveis ao cliente já contam como informar.';

alter table public.pesquisa_convites
  add column protocolo_id uuid references public.sac_protocolos(id) on delete set null;

comment on column public.pesquisa_convites.protocolo_id is
  'Avaliação do atendimento (pesquisa tipo 1): o protocolo SAC avaliado. Um convite vivo por '
  'protocolo (índice único parcial). O cliente do convite tem de ser o do protocolo (trigger).';

-- leitura por COLUNA (013 D7): a coluna nova entra na lista de authenticated
grant select (protocolo_id) on public.pesquisa_convites to authenticated;


-- =====================================================================================
-- 2. TABELAS NOVAS
-- =====================================================================================

-- --------------------------------------------------------------------- sac_oportunidades
create table public.sac_oportunidades (
  id                uuid primary key default gen_random_uuid(),
  grupo_clifor_id   uuid references public.grupos_clifor(id) on delete restrict,
  prospect_nome     text,
  prospect_contato  text,
  responsavel_id    uuid not null default auth.uid() references public.usuarios(id),
  vendedor_id       uuid references public.usuarios(id),
  identificada_em   date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  apresentacao_em   date,
  categoria         text not null,
  resultado         text not null default 'em_andamento',
  observacao        text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint cliente_ou_prospect check (
    (grupo_clifor_id is not null) <> (nullif(btrim(prospect_nome), '') is not null)),
  constraint categoria_valida check (categoria in
    ('novo_cliente', 'inativo_recuperado', 'interesse', 'qualificada')),
  constraint resultado_valido check (resultado in
    ('em_andamento', 'encaminhada', 'venda_fechada', 'sem_interesse')),
  constraint encaminhada_tem_vendedor check (
    resultado not in ('encaminhada', 'venda_fechada') or vendedor_id is not null),
  constraint textos_curtos check (
    char_length(prospect_nome) <= 200 and char_length(prospect_contato) <= 200
    and char_length(observacao) <= 2000)
);

comment on table public.sac_oportunidades is
  'Apoio Comercial (030 D9): cliente (ou prospect sem cadastro) → apresentação enviada → '
  'responsável → resultado → vendedor. Conta para a meta pela identificada_em, qualquer '
  'categoria. A venda fechada é do vendedor. RLS: página sac + (perfil ≤ 2 ou responsável).';

-- -------------------------------------------------------------------- sac_apoio_parametros
create table public.sac_apoio_parametros (
  id                    uuid primary key default gen_random_uuid(),
  ano                   smallint not null check (ano between 2000 and 2100),
  trimestre             smallint not null check (trimestre between 1 and 4),
  peso_pesquisa         numeric(5,2) not null default 25,
  meta_pesquisa_pct     numeric(5,2) not null default 25,
  peso_avaliacao        numeric(5,2) not null default 25,
  meta_avaliacao_media  numeric(4,2) not null default 9,
  min_avaliacoes        smallint not null default 10,
  peso_oportunidades    numeric(5,2) not null default 30,
  meta_oportunidades    smallint not null default 30,
  peso_prazo            numeric(5,2) not null default 10,
  meta_prazo_pct        numeric(5,2) not null default 95,
  peso_parados          numeric(5,2) not null default 5,
  meta_parados          smallint not null default 0,
  peso_retorno          numeric(5,2) not null default 5,
  meta_retorno_pct      numeric(5,2) not null default 95,
  dias_sem_atualizacao  smallint not null default 3,
  prazo_padrao_dias     smallint not null default 5,
  nota_proporcional     boolean not null default false,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint trimestre_unico unique (ano, trimestre),
  constraint pesos_somam_100 check (
    peso_pesquisa + peso_avaliacao + peso_oportunidades + peso_prazo + peso_parados + peso_retorno = 100),
  constraint pesos_nao_negativos check (
    least(peso_pesquisa, peso_avaliacao, peso_oportunidades, peso_prazo, peso_parados, peso_retorno) >= 0),
  constraint metas_na_faixa check (
    meta_pesquisa_pct between 0 and 100 and meta_prazo_pct between 0 and 100
    and meta_retorno_pct between 0 and 100 and meta_avaliacao_media between 0 and 10
    and meta_oportunidades >= 0 and meta_parados >= 0 and min_avaliacoes >= 0),
  constraint dias_na_faixa check (
    dias_sem_atualizacao between 1 and 60 and prazo_padrao_dias between 1 and 90)
);

comment on table public.sac_apoio_parametros is
  'Pesos, metas, X dias sem atualização, prazo padrão e mínimo de avaliações do Apoio '
  'Comercial, por trimestre (030 D11). Vale a linha do trimestre ou a do último anterior. '
  'Escrita só perfil 1; DELETE revogado.';


-- =====================================================================================
-- 3. ÍNDICES
-- =====================================================================================
create index sac_oportunidades_resp_idx       on public.sac_oportunidades (responsavel_id, identificada_em);
create index sac_oportunidades_ident_idx      on public.sac_oportunidades (identificada_em);
create index sac_oportunidades_grupo_idx      on public.sac_oportunidades (grupo_clifor_id);
create index sac_oportunidades_vendedor_idx   on public.sac_oportunidades (vendedor_id);
create index sac_oportunidades_criado_por_idx on public.sac_oportunidades (criado_por);
create index sac_oportunidades_alterado_por_idx on public.sac_oportunidades (alterado_por);
create index sac_apoio_parametros_criado_por_idx   on public.sac_apoio_parametros (criado_por);
create index sac_apoio_parametros_alterado_por_idx on public.sac_apoio_parametros (alterado_por);
create index sac_protocolos_prazo_idx on public.sac_protocolos (prazo_em) where excluido_em is null;
-- um convite vivo por protocolo avaliado (a action checa; o banco garante)
create unique index pesquisa_convites_protocolo_uidx on public.pesquisa_convites (protocolo_id)
  where protocolo_id is not null and cancelado_em is null;
create index pesquisa_convites_enviado_idx on public.pesquisa_convites (enviado_em) where enviado_em is not null;


-- =====================================================================================
-- 4. FUNÇÕES
-- =====================================================================================

-- ------------------------------------------ prazo e motivo do protocolo (security invoker)
create function public.fn_sac_protocolo_acompanhamento()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  new.motivo_pendencia := nullif(btrim(new.motivo_pendencia), '');
  -- D2: prazo já definido só muda por perfil ≤ 2 (servidor/carga sem auth.uid() passa)
  if tg_op = 'UPDATE' and auth.uid() is not null
     and old.prazo_em is not null and new.prazo_em is distinct from old.prazo_em
     and coalesce(public.fn_hierarquia(), 99) > 2 then
    raise exception 'Prazo já definido: só a gerência o altera. Registre o motivo da pendência.'
      using errcode = '42501';
  end if;
  if new.prazo_em is not null
     and new.prazo_em < (coalesce(new.aberto_em, now()) at time zone 'America/Sao_Paulo')::date then
    raise exception 'O prazo não pode ser antes da abertura do chamado' using errcode = '23514';
  end if;
  return new;
end $$;

comment on function public.fn_sac_protocolo_acompanhamento() is
  'BEFORE INSERT/UPDATE em sac_protocolos (030 D2): motivo de pendência aparado; prazo já '
  'definido só muda por perfil ≤ 2; prazo não antes da abertura.';

-- ------------------------------------------------ convite ligado a protocolo (invoker)
create function public.fn_pesquisa_convite_protocolo()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if new.protocolo_id is not null and not exists (
       select 1 from public.sac_protocolos s
       where s.id = new.protocolo_id and s.grupo_clifor_id = new.cliente_id) then
    raise exception 'O convite de avaliação tem de ser do cliente do protocolo' using errcode = '23514';
  end if;
  return new;
end $$;

comment on function public.fn_pesquisa_convite_protocolo() is
  'BEFORE INSERT/UPDATE em pesquisa_convites: convite de avaliação (protocolo_id) é do mesmo '
  'cliente do protocolo (030).';

-- ------------------------------------------------ oportunidade: carimbos (invoker)
create function public.fn_sac_oportunidade_regras()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  new.prospect_nome    := nullif(btrim(new.prospect_nome), '');
  new.prospect_contato := nullif(btrim(new.prospect_contato), '');
  new.observacao       := nullif(btrim(new.observacao), '');
  if tg_op = 'INSERT' and auth.uid() is not null then
    new.criado_em  := now();
    new.criado_por := auth.uid();
  end if;
  return new;
end $$;

comment on function public.fn_sac_oportunidade_regras() is
  'BEFORE INSERT/UPDATE em sac_oportunidades: textos aparados, carimbo de criação (030).';

-- ------------------------------------------------ parâmetros do trimestre (invoker)
create function public.fn_sac_apoio_parametros(p_ano integer, p_trimestre integer)
  returns public.sac_apoio_parametros
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  r public.sac_apoio_parametros;
begin
  select * into r from public.sac_apoio_parametros p
  where (p.ano, p.trimestre) <= (p_ano, p_trimestre)
  order by p.ano desc, p.trimestre desc
  limit 1;
  if not found then
    select * into r from public.sac_apoio_parametros p
    order by p.ano, p.trimestre
    limit 1;
  end if;
  return r;
end $$;

comment on function public.fn_sac_apoio_parametros(integer, integer) is
  'Parâmetros vigentes no trimestre (030 D11): a linha dele, senão a do último anterior, '
  'senão a primeira. Security invoker: sem a página sac, volta vazio.';

-- ------------------------------------ classificação das ocorrências (núcleo, invoker)
create function public.fn_sac_apoio_ocorrencias(
  p_desde        timestamptz,
  p_antes        timestamptz,
  p_ref          timestamptz,
  p_responsavel  uuid,
  p_dias         integer,
  p_prazo_padrao integer,
  p_ids          uuid[] default null
)
  returns table (
    protocolo_id       uuid,
    responsavel_id     uuid,
    aberto_em          timestamptz,
    fechado_em         timestamptz,
    prazo              date,
    prazo_definido     boolean,
    ultima_acao_em     timestamptz,
    dias_sem_acao      integer,
    acoes              integer,
    cliente_informado  boolean,
    fornecedor_cobrado boolean,
    aplica_fornecedor  boolean,
    motivo_registrado  boolean,
    atrasado           boolean,
    parado             boolean,
    situacao           text,
    acoes_completas    boolean
  )
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  with p as (
    select s.id, s.responsavel_id, s.aberto_em,
           case when s.fechado_em < p_ref then s.fechado_em end as fechado_em,
           coalesce(s.prazo_em,
                    (s.aberto_em at time zone 'America/Sao_Paulo')::date + p_prazo_padrao) as prazo,
           s.prazo_em is not null as prazo_definido,
           s.motivo_pendencia is not null as motivo,
           s.depende_fornecedor or g.tipo = 'fornecedor' as contra_fornecedor
    from public.sac_protocolos s
    left join public.grupos_clifor g on g.id = s.grupo_clifor_id
    where s.excluido_em is null
      and s.aberto_em < p_ref
      and (p_desde is null or s.aberto_em >= p_desde)
      and (p_antes is null or s.aberto_em <  p_antes)
      and (p_responsavel is null or s.responsavel_id = p_responsavel)
      and (p_ids is null or s.id = any (p_ids))
  ), i as (
    select it.protocolo_id,
           max(it.criado_em) as ultima,
           count(*)::integer as n,
           bool_or(it.visivel_cliente or it.tipo_acao in ('contato_cliente', 'retorno_cliente')) as informado,
           bool_or(it.tipo_acao = 'cobranca_fornecedor') as cobrado
    from public.sac_interacoes it
    join p on p.id = it.protocolo_id
    where it.criado_em < p_ref
    group by it.protocolo_id
  ), b as (
    select p.*,
           coalesce(i.ultima, p.aberto_em) as ultima,
           coalesce(i.n, 0) as n,
           coalesce(i.informado, false) as informado,
           coalesce(i.cobrado, false) as cobrado,
           (p.prazo + 1)::timestamp at time zone 'America/Sao_Paulo' as limite
    from p left join i on i.protocolo_id = p.id
  ), c as (
    select b.*,
           b.contra_fornecedor or b.cobrado as aplica,
           (b.fechado_em is not null and b.fechado_em >= b.limite)
             or (b.fechado_em is null and p_ref >= b.limite) as atrasou,
           b.fechado_em is null and b.ultima < p_ref - make_interval(days => p_dias) as parou
    from b
  )
  select c.id, c.responsavel_id, c.aberto_em, c.fechado_em, c.prazo, c.prazo_definido, c.ultima,
         floor(extract(epoch from (p_ref - c.ultima)) / 86400)::integer,
         c.n, c.informado, c.cobrado, c.aplica, c.motivo, c.atrasou, c.parou,
         case
           when c.fechado_em is not null and c.fechado_em < c.limite then 'no_prazo'
           when not c.atrasou then 'em_andamento'
           when c.motivo and c.informado and (not c.aplica or c.cobrado) and not c.parou then 'acompanhada'
           else 'fora_prazo'
         end,
         c.n > 0 and c.informado and (not c.aplica or c.cobrado) and not c.parou
           and (not c.atrasou or c.motivo)
  from c
$$;

comment on function public.fn_sac_apoio_ocorrencias(timestamptz, timestamptz, timestamptz, uuid, integer, integer, uuid[]) is
  'Núcleo do acompanhamento (030 D1–D5): cada protocolo não excluído aberto no intervalo, '
  'visto na data p_ref — prazo efetivo, última ação, cliente informado, fornecedor cobrado, '
  'parado há mais de p_dias, e a situação no_prazo | em_andamento | acompanhada | fora_prazo. '
  'Security invoker: a RLS de sac_protocolos decide o que entra.';

-- ------------------------------------ acompanhamento AGORA (lista de chamados)
create function public.fn_sac_acompanhamento(p_ids uuid[] default null)
  returns table (
    protocolo_id       uuid,
    responsavel_id     uuid,
    aberto_em          timestamptz,
    fechado_em         timestamptz,
    prazo              date,
    prazo_definido     boolean,
    ultima_acao_em     timestamptz,
    dias_sem_acao      integer,
    acoes              integer,
    cliente_informado  boolean,
    fornecedor_cobrado boolean,
    aplica_fornecedor  boolean,
    motivo_registrado  boolean,
    atrasado           boolean,
    parado             boolean,
    situacao           text,
    acoes_completas    boolean,
    dias_limite        integer
  )
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_par  public.sac_apoio_parametros;
begin
  v_par := public.fn_sac_apoio_parametros(extract(year from v_hoje)::integer,
                                          extract(quarter from v_hoje)::integer);
  return query
    select o.*, coalesce(v_par.dias_sem_atualizacao, 3)::integer
    from public.fn_sac_apoio_ocorrencias(null, null, now(), null,
           coalesce(v_par.dias_sem_atualizacao, 3), coalesce(v_par.prazo_padrao_dias, 5), p_ids) o;
end $$;

comment on function public.fn_sac_acompanhamento(uuid[]) is
  'Acompanhamento de cada protocolo AGORA, com o X dias e o prazo padrão do trimestre corrente '
  '(030 D4): alimenta as colunas da lista, o destaque e o contador de parados. Sem p_ids, '
  'todos os visíveis a quem consulta (RLS).';

-- ------------------------------------ painel do trimestre (os 4 indicadores)
create function public.fn_sac_apoio_indicadores(
  p_ano         integer,
  p_trimestre   integer,
  p_responsavel uuid default null
)
  returns jsonb
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_resp   uuid := p_responsavel;
  v_ini    date;
  v_fim    date;
  v_desde  timestamptz;
  v_antes  timestamptz;
  v_ref    timestamptz;
  v_par    public.sac_apoio_parametros;
  v_prop   boolean;
  -- 1. pesquisa
  v_env    bigint;
  v_resp_n bigint;
  v_media_pesq numeric;
  v_pct_pesq   numeric;
  -- 2. avaliação
  v_val    bigint;
  v_media_av   numeric;
  v_mensal jsonb;
  -- 3. oportunidades
  v_op     bigint;
  v_op_cat jsonb;
  v_op_res jsonb;
  -- 4. acompanhamento
  a        record;
  v_pct_prazo   numeric;
  v_pct_retorno numeric;
  -- notas
  n1 numeric; n2 numeric; n3 numeric; n4a numeric; n4b numeric; n4c numeric;
  ok1 boolean; ok2 boolean; ok3 boolean; ok4a boolean; ok4b boolean; ok4c boolean;
begin
  if p_ano is null or p_ano not between 2000 and 2100 or p_trimestre is null or p_trimestre not between 1 and 4 then
    raise exception 'Trimestre inválido' using errcode = '22023';
  end if;
  -- D12: quem não é perfil ≤ 2 vê sempre o próprio painel
  if coalesce(public.fn_hierarquia(), 99) > 2 then
    v_resp := auth.uid();
  end if;

  v_ini   := make_date(p_ano, (p_trimestre - 1) * 3 + 1, 1);
  v_fim   := (v_ini + interval '3 months')::date - 1;
  v_desde := v_ini::timestamp at time zone 'America/Sao_Paulo';
  v_antes := (v_fim + 1)::timestamp at time zone 'America/Sao_Paulo';
  v_ref   := least(now(), v_antes);
  v_par   := public.fn_sac_apoio_parametros(p_ano, p_trimestre);
  if v_par.id is null then
    raise exception 'Sem parâmetros do Apoio Comercial visíveis' using errcode = '42501';
  end if;
  v_prop := v_par.nota_proporcional;

  -- 1. PESQUISA DE SATISFAÇÃO (D7)
  select count(*), count(r.id), avg(r.nota_nps)
    into v_env, v_resp_n, v_media_pesq
  from public.pesquisa_convites c
  join public.pesquisas pq on pq.id = c.pesquisa_id and pq.tipo_id = 2
  left join public.pesquisa_respostas r on r.convite_id = c.id
  where c.cancelado_em is null
    and c.enviado_em >= v_desde and c.enviado_em < v_antes
    and (v_resp is null or c.criado_por = v_resp);
  v_pct_pesq := round(100.0 * v_resp_n / nullif(v_env, 0), 2);
  ok1 := coalesce(v_pct_pesq >= v_par.meta_pesquisa_pct, false);
  n1 := case when ok1 then v_par.peso_pesquisa
             when v_prop and v_par.meta_pesquisa_pct > 0
               then round(v_par.peso_pesquisa * least(1, coalesce(v_pct_pesq, 0) / v_par.meta_pesquisa_pct), 2)
             else 0 end;

  -- 2. AVALIAÇÃO DOS ATENDIMENTOS (D8): média das médias mensais
  with av as (
    select date_trunc('month', r.respondida_em at time zone 'America/Sao_Paulo')::date as mes,
           coalesce(r.nota_atendimento, r.nota_nps) as nota
    from public.pesquisa_respostas r
    join public.pesquisa_convites c on c.id = r.convite_id and c.cancelado_em is null
    join public.pesquisas pq on pq.id = c.pesquisa_id and pq.tipo_id = 1
    join public.sac_protocolos s on s.id = c.protocolo_id and s.excluido_em is null
    where r.respondida_em >= v_desde and r.respondida_em < v_antes
      and coalesce(r.nota_atendimento, r.nota_nps) is not null
      and (v_resp is null or s.responsavel_id = v_resp)
  ), meses as (
    select m::date as mes from generate_series(v_ini, v_fim, interval '1 month') m
  ), pm as (
    select meses.mes, count(av.nota) as n, avg(av.nota) as media
    from meses left join av on av.mes = meses.mes
    group by meses.mes
  )
  select coalesce(sum(pm.n), 0), avg(pm.media),
         jsonb_agg(jsonb_build_object('mes', pm.mes, 'avaliacoes', pm.n, 'media', round(pm.media, 2)) order by pm.mes)
    into v_val, v_media_av, v_mensal
  from pm;
  v_media_av := round(v_media_av, 2);
  ok2 := v_val >= v_par.min_avaliacoes and coalesce(v_media_av >= v_par.meta_avaliacao_media, false);
  n2 := case when ok2 then v_par.peso_avaliacao
             when v_prop and v_val >= v_par.min_avaliacoes and v_par.meta_avaliacao_media > 0
               then round(v_par.peso_avaliacao * least(1, coalesce(v_media_av, 0) / v_par.meta_avaliacao_media), 2)
             else 0 end;

  -- 3. OPORTUNIDADES (D9)
  with o as (
    select o.categoria, o.resultado
    from public.sac_oportunidades o
    where o.identificada_em between v_ini and v_fim
      and (v_resp is null or o.responsavel_id = v_resp)
  )
  select (select count(*) from o),
         (select jsonb_object_agg(k, (select count(*) from o where o.categoria = k))
            from unnest(array['novo_cliente', 'inativo_recuperado', 'interesse', 'qualificada']) k),
         (select jsonb_object_agg(k, (select count(*) from o where o.resultado = k))
            from unnest(array['em_andamento', 'encaminhada', 'venda_fechada', 'sem_interesse']) k)
    into v_op, v_op_cat, v_op_res;
  ok3 := v_op >= v_par.meta_oportunidades;
  n3 := case when ok3 then v_par.peso_oportunidades
             when v_prop and v_par.meta_oportunidades > 0
               then round(v_par.peso_oportunidades * least(1, v_op::numeric / v_par.meta_oportunidades), 2)
             else 0 end;

  -- 4. ACOMPANHAMENTO E RESOLUÇÃO (D3–D6)
  select count(*) as total,
         count(*) filter (where o.fechado_em is not null) as resolvidas,
         count(*) filter (where o.fechado_em is null) as abertas,
         count(*) filter (where o.parado) as parados,
         count(*) filter (where o.cliente_informado) as com_retorno,
         count(*) filter (where o.fechado_em is not null and o.cliente_informado) as resolvidas_com_retorno,
         count(*) filter (where o.acoes_completas) as com_acoes_completas,
         count(*) filter (where o.situacao = 'no_prazo') as no_prazo,
         count(*) filter (where o.situacao = 'acompanhada') as acompanhadas,
         count(*) filter (where o.situacao = 'fora_prazo') as fora_prazo,
         count(*) filter (where o.situacao = 'em_andamento') as em_andamento
    into a
  from public.fn_sac_apoio_ocorrencias(v_desde, v_antes, v_ref, v_resp,
         v_par.dias_sem_atualizacao, v_par.prazo_padrao_dias) o;

  v_pct_prazo := round(100.0 * (a.no_prazo + a.acompanhadas)
                       / nullif(a.no_prazo + a.acompanhadas + a.fora_prazo, 0), 2);
  ok4a := v_pct_prazo is null or v_pct_prazo >= v_par.meta_prazo_pct;
  n4a := case when ok4a then v_par.peso_prazo
              when v_prop and v_par.meta_prazo_pct > 0
                then round(v_par.peso_prazo * least(1, v_pct_prazo / v_par.meta_prazo_pct), 2)
              else 0 end;

  ok4b := a.parados <= v_par.meta_parados;
  n4b := case when ok4b then v_par.peso_parados else 0 end;

  v_pct_retorno := round(100.0 * a.resolvidas_com_retorno / nullif(a.resolvidas, 0), 2);
  ok4c := v_pct_retorno is null or v_pct_retorno >= v_par.meta_retorno_pct;
  n4c := case when ok4c then v_par.peso_retorno
              when v_prop and v_par.meta_retorno_pct > 0
                then round(v_par.peso_retorno * least(1, v_pct_retorno / v_par.meta_retorno_pct), 2)
              else 0 end;

  return jsonb_build_object(
    'periodo', jsonb_build_object(
      'ano', p_ano, 'trimestre', p_trimestre, 'de', v_ini, 'ate', v_fim,
      'referencia', v_ref, 'encerrado', now() >= v_antes, 'responsavel', v_resp),
    'parametros', to_jsonb(v_par) - 'bubble_id' - 'criado_por' - 'alterado_por' - 'criado_em',
    'pesquisa', jsonb_build_object(
      'peso', v_par.peso_pesquisa, 'meta', v_par.meta_pesquisa_pct, 'realizado', v_pct_pesq,
      'nota', n1, 'atingida', ok1,
      'enviadas', v_env, 'respondidas', v_resp_n, 'media', round(v_media_pesq, 2)),
    'avaliacao', jsonb_build_object(
      'peso', v_par.peso_avaliacao, 'meta', v_par.meta_avaliacao_media, 'realizado', v_media_av,
      'nota', n2, 'atingida', ok2,
      'minimo', v_par.min_avaliacoes, 'validas', v_val,
      'suficiente', v_val >= v_par.min_avaliacoes, 'mensal', v_mensal),
    'oportunidades', jsonb_build_object(
      'peso', v_par.peso_oportunidades, 'meta', v_par.meta_oportunidades, 'realizado', v_op,
      'nota', n3, 'atingida', ok3, 'por_categoria', v_op_cat, 'por_resultado', v_op_res),
    'acompanhamento', jsonb_build_object(
      'peso', v_par.peso_prazo + v_par.peso_parados + v_par.peso_retorno,
      'nota', n4a + n4b + n4c, 'atingida', ok4a and ok4b and ok4c,
      'dias_sem_atualizacao', v_par.dias_sem_atualizacao,
      'total', a.total, 'resolvidas', a.resolvidas, 'abertas', a.abertas, 'parados', a.parados,
      'com_retorno', a.com_retorno, 'com_acoes_completas', a.com_acoes_completas,
      'no_prazo', a.no_prazo, 'acompanhadas', a.acompanhadas, 'fora_prazo', a.fora_prazo,
      'em_andamento', a.em_andamento,
      'prazo', jsonb_build_object('peso', v_par.peso_prazo, 'meta', v_par.meta_prazo_pct,
                                  'realizado', v_pct_prazo, 'nota', n4a, 'atingida', ok4a),
      'parados_ind', jsonb_build_object('peso', v_par.peso_parados, 'meta', v_par.meta_parados,
                                        'realizado', a.parados, 'nota', n4b, 'atingida', ok4b),
      'retorno', jsonb_build_object('peso', v_par.peso_retorno, 'meta', v_par.meta_retorno_pct,
                                    'realizado', v_pct_retorno, 'nota', n4c, 'atingida', ok4c)),
    'total', n1 + n2 + n3 + n4a + n4b + n4c
  );
end $$;

comment on function public.fn_sac_apoio_indicadores(integer, integer, uuid) is
  'Painel trimestral do Apoio Comercial (030): os 4 indicadores com peso, meta, realizado, '
  'nota ponderada e o total (100%). Quem não é perfil ≤ 2 recebe o próprio painel (D12). '
  'Security invoker: a RLS de quem consulta decide o que entra.';

revoke execute on function public.fn_sac_protocolo_acompanhamento() from public, anon, authenticated;
revoke execute on function public.fn_pesquisa_convite_protocolo()   from public, anon, authenticated;
revoke execute on function public.fn_sac_oportunidade_regras()      from public, anon, authenticated;
revoke execute on function public.fn_sac_apoio_parametros(integer, integer) from public, anon;
revoke execute on function public.fn_sac_apoio_ocorrencias(timestamptz, timestamptz, timestamptz, uuid, integer, integer, uuid[]) from public, anon;
revoke execute on function public.fn_sac_acompanhamento(uuid[]) from public, anon;
revoke execute on function public.fn_sac_apoio_indicadores(integer, integer, uuid) from public, anon;
grant execute on function public.fn_sac_apoio_parametros(integer, integer) to authenticated, service_role;
grant execute on function public.fn_sac_apoio_ocorrencias(timestamptz, timestamptz, timestamptz, uuid, integer, integer, uuid[]) to authenticated, service_role;
grant execute on function public.fn_sac_acompanhamento(uuid[]) to authenticated, service_role;
grant execute on function public.fn_sac_apoio_indicadores(integer, integer, uuid) to authenticated, service_role;


-- =====================================================================================
-- 5. TRIGGERS
-- =====================================================================================
create trigger trg_sac_protocolos_acompanhamento
  before insert or update on public.sac_protocolos
  for each row execute function public.fn_sac_protocolo_acompanhamento();
create trigger trg_pesquisa_convites_protocolo
  before insert or update on public.pesquisa_convites
  for each row execute function public.fn_pesquisa_convite_protocolo();
create trigger trg_sac_oportunidades_regras
  before insert or update on public.sac_oportunidades
  for each row execute function public.fn_sac_oportunidade_regras();
create trigger trg_sac_oportunidades_alterado
  before update on public.sac_oportunidades
  for each row execute function public.fn_set_alterado();
create trigger trg_sac_apoio_parametros_alterado
  before update on public.sac_apoio_parametros
  for each row execute function public.fn_set_alterado();
create trigger trg_sac_oportunidades_auditoria
  after insert or update or delete on public.sac_oportunidades
  for each row execute function public.fn_auditoria();
create trigger trg_sac_apoio_parametros_auditoria
  after insert or update or delete on public.sac_apoio_parametros
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 6. RLS E POLICIES
-- =====================================================================================
alter table public.sac_oportunidades    enable row level security;
alter table public.sac_apoio_parametros enable row level security;

revoke all on table public.sac_oportunidades    from anon;
revoke all on table public.sac_apoio_parametros from anon;
revoke truncate on table public.sac_oportunidades from authenticated;
revoke delete, truncate on table public.sac_apoio_parametros from authenticated;

-- --------------------------------------------------------------------- sac_oportunidades
create policy sac_oportunidades_leitura on public.sac_oportunidades
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) <= 2 or responsavel_id = (select auth.uid()))
  );
create policy sac_oportunidades_insert on public.sac_oportunidades
  for insert to authenticated
  with check (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) <= 2 or responsavel_id = (select auth.uid()))
  );
create policy sac_oportunidades_update on public.sac_oportunidades
  for update to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) <= 2 or responsavel_id = (select auth.uid()))
  )
  with check (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) <= 2 or responsavel_id = (select auth.uid()))
  );
create policy sac_oportunidades_delete on public.sac_oportunidades
  for delete to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) <= 2 or responsavel_id = (select auth.uid()))
  );

comment on policy sac_oportunidades_leitura on public.sac_oportunidades is
  'Página sac + (perfil ≤ 2 ou a própria responsável). 030 D12. Apagar é permitido a quem '
  'pode alterar (registro errado); a auditoria guarda a linha apagada.';

-- -------------------------------------------------------------------- sac_apoio_parametros
create policy sac_apoio_parametros_leitura on public.sac_apoio_parametros
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('sac')));
create policy sac_apoio_parametros_insert on public.sac_apoio_parametros
  for insert to authenticated
  with check ((select public.fn_pode_acessar_pagina('sac')) and (select public.fn_hierarquia()) = 1);
create policy sac_apoio_parametros_update on public.sac_apoio_parametros
  for update to authenticated
  using ((select public.fn_pode_acessar_pagina('sac')) and (select public.fn_hierarquia()) = 1)
  with check ((select public.fn_pode_acessar_pagina('sac')) and (select public.fn_hierarquia()) = 1);

comment on policy sac_apoio_parametros_update on public.sac_apoio_parametros is
  'Metas, pesos e X dias: só perfil 1 (030 D11). Leitura: quem tem a página sac.';

-- ------------------------------------------ sac_protocolos: leitura para perfil ≤ 2 (D12)
-- Troca a policy da 013 em vez de somar outra: duas policies permissivas de SELECT na mesma
-- tabela são avaliadas as duas em toda linha (advisor `multiple_permissive_policies`).
drop policy sac_protocolos_leitura on public.sac_protocolos;
create policy sac_protocolos_leitura on public.sac_protocolos
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) <= 2
         or responsavel_id = (select auth.uid())
         or criado_por     = (select auth.uid()))
  );

comment on policy sac_protocolos_leitura on public.sac_protocolos is
  'Página sac + (perfil ≤ 2, OU responsável, OU quem abriu). 013 D4 ampliada pela 030 D12: o '
  'gestor (perfil 2) LÊ todos os chamados para avaliar o Apoio Comercial. Alterar segue perfil 1 '
  'ou responsável. Excluídos continuam legíveis; a lista filtra excluido_em is null.';


-- =====================================================================================
-- 7. SEMENTE — os números do dono, vigentes desde o 1º trimestre de 2026 (D11)
-- =====================================================================================
insert into public.sac_apoio_parametros (ano, trimestre) values (2026, 1);


-- =====================================================================================
-- FIM da 030_sac_apoio_comercial.sql
-- =====================================================================================
-- CONFERÊNCIA
--   2 tabelas novas, 2 com RLS, 2 com `revoke all ... from anon`. ZERO policy para anon.
--   Policies novas: sac_oportunidades (leitura, insert, update, delete); sac_apoio_parametros
--   (leitura, insert, update); sac_protocolos_leitura TROCADA (perfil ≤ 2 lê todos).
--   Colunas novas: sac_protocolos (prazo_em, depende_fornecedor, motivo_pendencia),
--   sac_interacoes (tipo_acao), pesquisa_convites (protocolo_id, com GRANT de coluna).
--   Funções novas, todas security invoker e search_path '': 3 de trigger (execute revogado),
--   fn_sac_apoio_parametros, fn_sac_apoio_ocorrencias, fn_sac_acompanhamento,
--   fn_sac_apoio_indicadores (execute authenticated + service_role). Nenhuma security definer.
--   FKs indexadas: todas. Nenhum float: percentuais e médias em numeric (2 casas).
--   Semente: 1 linha de parâmetros (2026/1). Nenhum segredo.
-- =====================================================================================
