-- =====================================================================================
-- 007_cotacao.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 4 de `specs/02-modelo-de-dados-proposto.md` §11 (e `specs/03-plano-de-construcao.md`
-- §6): a coluna Cotação do kanban de vendas, com orçamento por fornecedor e um vencedor por
-- item.
--
-- Escopo: §3.3 (Ciclo comercial, primeira metade) — `cotacoes`, `cotacao_itens`,
-- `orcamentos_fornecedor`; de §5, `fn_aliquota_icms` e `v_orcamento_valores`.
-- `icms_aliquotas` JÁ EXISTE (003), com RLS de domínio (lê ativo, escreve perfil 1),
-- `fn_set_alterado` e auditoria. Nada nela precisou mudar: esta migration só a CONSULTA.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Cria as 3 tabelas com as colunas obrigatórias de §1.2.
--   2. `orcamentos_fornecedor` calcula bruto, comissão bruta, ICMS e PIS/COFINS em COLUNAS
--      GERADAS (`CalculaFornecedoresLista` bTPFh, que no Bubble é backend agendado com pausa
--      de 1 s a cada tecla). Líquido e unitário líquido saem de `v_orcamento_valores`.
--   3. `fn_aliquota_icms(uf_origem, uf_destino)` — alíquota vigente, com ERRO quando o par não
--      existe (`vendas-reusables.md` §5.5 item 3: "erro explícito, não zero silencioso").
--   4. `fn_aliquota_pis_cofins()` — os 9,25% num lugar só (hoje chumbados em bTNri e bTiea).
--   5. Trigger `fn_orcamento_derivados()` em `orcamentos_fornecedor`: força `cotacao_id` a
--      partir do item e preenche as alíquotas pela regra fiscal quando vierem nulas.
--   6. Índice em toda FK (§6), o parcial do kanban (`vendedor_id, criado_em desc`) e o único
--      parcial `um_vencedor_por_item` (§6, constraint nº 2).
--   7. `fn_set_alterado` nas 3 tabelas; `fn_auditoria` em `orcamentos_fornecedor` (é onde
--      está o dinheiro — 001 §7.2: "as de dinheiro entram nas fatias 4 a 8").
--   8. RLS nas 3 tabelas, nível OPERACIONAL de §7.2 com a restrição por vendedor de §7.3
--      (ver o bloco de RLS).
--
-- O QUE **NÃO** ENTRA AQUI
--   - Nenhum seed, nenhuma alíquota. `icms_aliquotas` é carregada da base (Tbl.IcmsEstados).
--   - `v_kanban_cotacoes`, `v_ultima_cotacao_fob`, `fornecedores_para_item`: são consultas de
--     TELA (`vendas.md` §9.4). Entram com a tela da fatia 4, quando o formato for conhecido.
--   - `parametros_fiscais` com vigência (`vendas-reusables.md` §8.4): por ora o 0.0925 mora em
--     `fn_aliquota_pis_cofins()`, UM lugar, que é o que tira o número do código de tela.
--   - A regra "troféu só com valor unitário e comissão ≥ 0,01, exceto amostra" (bTOUP0) fica na
--     server action `definirVencedor`: depende da cotação (amostra), e check não cruza tabela.
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU CONFLITAVA COM O MAPA <<<
--   D1. FRETE NO BRUTO SÓ COM "CIF INFORMADO". `02` §3.3 escreve
--       `valor_venda_bruto = qtd × unit + valor_frete`. O mapa diz mais: bTOSo0/bThtR ZERAM o
--       frete quando o tipo não é CIF Informado (`vendas.md` §5.1). A coluna gerada usa
--       `case when tipo_frete_id = 2 then valor_frete else 0 end`, e o mapa vence (CLAUDE.md
--       regra 1). Assim, frete gravado com FOB por engano (ou vindo da carga) não entra na
--       conta, em vez de depender da tela ter zerado o campo.
--   D2. ARREDONDAMENTO EXPLÍCITO A 2 CASAS em cada coluna gerada (`round(..., 2)`). `02`
--       deixava o arredondamento implícito na conversão para numeric(14,2); `vendas.md` §8.4
--       e `vendas-reusables.md` §5.5 pedem "arredondamento explícito a 2 casas nos totais".
--       Resultado idêntico ao da conversão (meia-unidade para longe do zero), mas escrito.
--   D3. UNITÁRIO LÍQUIDO COM 6 CASAS. `ValorUnitLiquido = líquido ÷ qtd` (bTeYL) é divisão; com
--       2 casas, `qtd × unitário` da entrega (fatia 6) erraria até qtd × R$ 0,005. A view
--       devolve `round(liquido / qtd_venda, 6)`. `qtd_venda > 0` por check, então a divisão
--       por zero do Bubble (`vendas.md` §5.1) não existe aqui.
--   D4. ALÍQUOTAS SEM DEFAULT, PREENCHIDAS POR TRIGGER QUANDO NULAS. `02` §3.3 pedia
--       `not null default 0` e, no comentário, "default vindo de icms_aliquotas por função".
--       Default de coluna não enxerga outra linha; com default 0 não se distingue "0 digitado"
--       de "não informado". Então: `not null` SEM default, e o trigger preenche quando a linha
--       chega com nulo, pela regra de `AdicionarFornecedores` (bTNri / bThgz0):
--         origem E destino Lucro Real/Presumido → ICMS da tabela, PIS/COFINS 0.0925;
--         qualquer outro caso                    → 0 e 0 (fornecedor Simples/MEI não gera
--                                                  crédito — `vendas-reusables.md` §5.2).
--       O caso "origem Lucro Real, destino outro regime" hoje NÃO cria orçamento nenhum
--       (`vendas.md` [DÚVIDA 3]); aqui, se a server action criar, ele nasce com 0 e 0. Criar ou
--       não é decisão da action; o banco só não deixa a alíquota nascer inventada.
--       Valor informado explicitamente (inclusive 0) é respeitado.
--   D5. ALÍQUOTA RECALCULADA QUANDO A ORIGEM OU O DESTINO MUDAM. Defeito 2 de `02` §3.3 e
--       `vendas-reusables.md` §5.3: duplicar pedido leva o ICMS da UF antiga. No update que
--       troca `endereco_origem_id`/`endereco_destino_id` SEM mexer nas alíquotas, o trigger as
--       recalcula. Se o mesmo update trouxer alíquota nova, vale a informada.
--   D6. `cotacao_id` DO ORÇAMENTO É DERIVADO DO ITEM, sempre. `02` o chama de "atalho p/
--       índice"; atalho gravado pela tela pode divergir do item. O trigger sobrescreve.
--   D7. `numero` é `identity` (by default), não sequence avulsa: mesmo efeito, e a carga grava
--       o número legado explicitamente. DEPOIS DA CARGA:
--       `select setval(pg_get_serial_sequence('public.cotacoes','numero'), max(numero)) from public.cotacoes;`
--   D8. `data_validade` default `current_date + 2` ("Validade padrão = agora + 2 dias",
--       `vendas.md` §5.7). `etapa_id` default 1 (Cotação) e `status_id` default 1
--       (Em andamento) — `vendas.md` [DÚVIDA 5], recomendação de `02` §3.3. Os ids são os
--       semeados pela 003 (fixos, `on conflict (id)`).
--   D9. LEITURA POR VENDEDOR, NÃO POR "QUEM TEM A PÁGINA" SÓ. Ver o bloco de RLS.
--
-- ORDEM DOS BLOCOS (a mesma da 006)
--   tabelas → índices → funções → views → triggers → RLS e policies.
--
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- Depois de aplicar: `get_advisors` (segurança), comparado com `specs/05-avisos-do-advisor.md`.
-- =====================================================================================


-- =====================================================================================
-- 1. TABELAS (§3.3)
-- =====================================================================================

-- ------------------------------------------------------------------------------ cotacoes
create table public.cotacoes (
  id            uuid primary key default gen_random_uuid(),
  numero        integer generated by default as identity unique,
  cliente_id    uuid not null references public.grupos_clifor(id) on delete restrict,
  vendedor_id   uuid not null references public.usuarios(id),
  empresa_emissora_id smallint not null references public.empresas_emissoras(id),
  etapa_id      smallint not null default 1 references public.etapas(id),
  status_id     smallint not null default 1 references public.cotacao_status(id),
  data_validade date default (current_date + 2),
  amostra       boolean not null default false,
  arquivado     boolean not null default false,
  motivo_arquivamento_id smallint references public.motivos_arquivamento(id),
  rascunho      boolean not null default false,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.cotacoes is
  'Era Tbl.Cotacao (tbl_orcamento). A lista QuaisProdutos e QuaisPropostas NÃO migram: a FK do '
  'lado N (cotacao_itens.cotacao_id, propostas.cotacao_id) já diz tudo (§1.5). '
  'Leitura e escrita restritas ao vendedor para Analista/Operador (ver policies).';
comment on column public.cotacoes.numero is
  'Era CotacaoNum, calculado no Bubble como "último + 1" numa busca SEM ordenação (bTOTX0, '
  'bUAfd) — sujeito a corrida e a ordem indefinida (vendas.md §5.7). Aqui é identity. A carga '
  'grava o número legado e DEPOIS ajusta a sequence (ver D7 no cabeçalho da 007). NÃO derivar '
  'do número de pedido, como CriarContasReceberImportadas (bTmHf) fazia (rotinas [DÚVIDA 5]).';
comment on column public.cotacoes.vendedor_id is
  'Era QualVendedor. NOT NULL resolve de vez AtribuirCriadorVendedor (bTtji), que só existia '
  'para preencher o que nascia vazio. É por esta coluna que Analista/Operador enxergam a linha.';
comment on column public.cotacoes.etapa_id is
  'Opt.Etapas. No Bubble CotacaoEtapa NÃO é gravada na criação (vendas [DÚVIDA 5]); aqui nasce '
  '1 = Cotação. Vira 2 = Pedir quando a proposta vira pedido (bTbZt).';
comment on column public.cotacoes.status_id is
  'Opt.CotacaoStatus. Default 1 = "Em andamento" (chave ''aberto''). ARMADILHA: a chave '
  '''negociando'' é "Cancelado" — resolver sempre por chave_bubble (003).';
comment on column public.cotacoes.rascunho is
  'Substitui User.TempOrcamentoProdutos (02 §2.1.6): o carrinho é uma cotação em rascunho, com '
  'FK normal. Cancelar o rascunho = apagar a cotação, e os itens e orçamentos vão em cascata — '
  'no Bubble eles ficavam órfãos (vendas.md §8.3).';
comment on column public.cotacoes.motivo_arquivamento_id is
  'Obrigatório ao arquivar (pop.ArquivaCotação bTlDb) e limpo ao desarquivar (bTaTv). SEM check '
  'arquivado→motivo: a base legada não foi medida, e um check aqui pode derrubar a carga. A '
  'server action exige o motivo.';

-- ------------------------------------------------------------------------- cotacao_itens
create table public.cotacao_itens (
  id          uuid primary key default gen_random_uuid(),
  cotacao_id  uuid not null references public.cotacoes(id) on delete cascade,
  produto_id  uuid not null references public.produtos(id) on delete restrict,
  grupo_produto_id uuid references public.produto_grupos(id),
  qtd         numeric(14,3) not null check (qtd > 0),
  medida      text,
  linha_id    smallint references public.linhas_produto(id),
  condicao_id smallint references public.condicoes_produto(id),
  endereco_destino_id uuid not null references public.enderecos_clifor(id) on delete restrict,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.cotacao_itens is
  'Era Tbl.CotacaoProdutos (tbl_orcamentoprodutos) — a linha do carrinho (02 §2). O cliente_id '
  'do Bubble SAI: vem por join de cotacoes, era denormalização sem dono. A lista '
  'QuaisOrcamentosForncededores sai também: orcamentos_fornecedor.cotacao_item_id diz tudo.';
comment on column public.cotacao_itens.qtd is
  'Quantidade, numeric(14,3) (§1.3). Ao mudar, a server action copia para QtdVenda de todos os '
  'orçamentos do item (bTOip0 / bTOZB0) — as colunas geradas recalculam sozinhas.';

-- ------------------------------------------------------------------ orcamentos_fornecedor
create table public.orcamentos_fornecedor (
  id              uuid primary key default gen_random_uuid(),
  cotacao_item_id uuid not null references public.cotacao_itens(id) on delete cascade,
  cotacao_id      uuid not null references public.cotacoes(id) on delete cascade,
  fornecedor_id   uuid not null references public.grupos_clifor(id) on delete restrict,
  endereco_origem_id   uuid not null references public.enderecos_clifor(id) on delete restrict,
  endereco_destino_id  uuid not null references public.enderecos_clifor(id) on delete restrict,
  endereco_cobranca_id uuid references public.enderecos_clifor(id),
  produto_id      uuid not null references public.produtos(id) on delete restrict,
  vendedor_id     uuid not null references public.usuarios(id),
  qtd_venda       numeric(14,3) not null check (qtd_venda > 0),
  medida          text,
  linha_id        smallint references public.linhas_produto(id),
  condicao_id     smallint references public.condicoes_produto(id),
  -- valores unitários informados pelo usuário
  valor_venda_unit    numeric(14,2) not null default 0,
  valor_comissao_unit numeric(14,2) not null default 0,
  valor_frete         numeric(14,2) not null default 0,
  tipo_frete_id       smallint not null default 1 references public.tipos_frete(id),
  frete_fracionado    boolean not null default false,
  -- alíquotas, como FRAÇÃO (0.1200 = 12%). SEM default: o trigger preenche (D4).
  aliquota_icms       numeric(7,4) not null,
  aliquota_pis_cofins numeric(7,4) not null,
  aliquota_ipi        numeric(7,4) not null default 0,
  -- derivados: colunas geradas, nunca gravadas pela tela (D1, D2)
  valor_venda_bruto numeric(14,2) generated always as (
    round(qtd_venda * valor_venda_unit
          + case when tipo_frete_id = 2 then valor_frete else 0 end, 2)
  ) stored,
  valor_comissao_bruto numeric(14,2) generated always as (
    round(qtd_venda * valor_comissao_unit, 2)
  ) stored,
  valor_icms numeric(14,2) generated always as (
    round(qtd_venda * valor_venda_unit * aliquota_icms, 2)
  ) stored,
  valor_pis_cofins numeric(14,2) generated always as (
    round(qtd_venda * valor_venda_unit * aliquota_pis_cofins, 2)
  ) stored,
  vencedor        boolean not null default false,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint aliquotas_sao_fracao check (
    aliquota_icms       >= 0 and aliquota_icms       < 1 and
    aliquota_pis_cofins >= 0 and aliquota_pis_cofins < 1 and
    aliquota_ipi        >= 0 and aliquota_ipi        < 1
  )
);

comment on table public.orcamentos_fornecedor is
  'Era Tbl.OrcFornecedoresCotacao (tbl_orcamentfornecedores) — o orçamento de UMA filial de '
  'fornecedor para UM item, e é onde está todo o dinheiro da cadeia. As colunas geradas '
  'reproduzem CalculaFornecedoresLista (bTPFh): bruto (bTPGA), comissão bruta (bTPFo), '
  'PIS/COFINS (bTPFt), ICMS (bTPFv). Líquido (bTPGF) e unitário líquido (bTeYL) estão em '
  'v_orcamento_valores. ARMADILHA DE LEITURA (02 §3.3, 04 B5): os ids cpo_tributos_number e '
  'cpo_tributopiscofinsb_number são TributosICMS e TributoPISCOFINS AQUI, e não campos '
  'excluídos — o decompilador os rotulou com os nomes de Tbl.MetasFechadas. Auditada por trigger.';
comment on column public.orcamentos_fornecedor.cotacao_id is
  'Atalho para índice (02 §3.3). DERIVADO de cotacao_itens pelo trigger, sempre (D6): o valor '
  'que a tela mandar é sobrescrito.';
comment on column public.orcamentos_fornecedor.valor_frete is
  'Só entra no bruto com tipo_frete_id = 2 (CIF Informado) — D1, bTOSo0/bThtR. Os tributos NÃO '
  'incidem sobre o frete, e o líquido carrega o frete integral (vendas-reusables.md §5.1).';
comment on column public.orcamentos_fornecedor.aliquota_icms is
  'FRAÇÃO (0.1200 = 12%). Sem default: nula na chegada, o trigger fn_orcamento_derivados '
  'preenche por fn_aliquota_icms quando origem e destino são Lucro Real/Presumido, e 0 nos '
  'demais casos (D4). Troca de origem/destino recalcula (D5).';
comment on column public.orcamentos_fornecedor.aliquota_pis_cofins is
  'FRAÇÃO. Mesma regra de aliquota_icms; o valor vem de fn_aliquota_pis_cofins() (0.0925). '
  'DEFEITO QUE NÃO SE REPRODUZ: em bTtlO/bTtlb as duas alíquotas recebem o mesmo input '
  '(historico.md §8).';
comment on column public.orcamentos_fornecedor.aliquota_ipi is
  'Existe no Bubble (TributoIPI) e NUNCA é calculada por bTPFh. Mantida, sem coluna gerada.';
comment on column public.orcamentos_fornecedor.vencedor is
  'Um por item, garantido pelo índice único parcial um_vencedor_por_item (02 §6, constraint 2). '
  'No Bubble eram dois passos (desmarca o atual, marca este — bTOUa0/bTOUU0) sem transação.';


-- =====================================================================================
-- 2. ÍNDICES (§6: toda FK e toda coluna de filtro ou ordenação)
-- =====================================================================================

-- cotacoes — o kanban filtra por período + vendedor + etapa e ordena por criação desc (§6)
create index cotacoes_kanban_idx on public.cotacoes (vendedor_id, criado_em desc)
  where not arquivado;
create index cotacoes_vendedor_idx     on public.cotacoes (vendedor_id);
create index cotacoes_cliente_idx      on public.cotacoes (cliente_id);
create index cotacoes_empresa_idx      on public.cotacoes (empresa_emissora_id);
create index cotacoes_etapa_idx        on public.cotacoes (etapa_id, criado_em desc);
create index cotacoes_status_idx       on public.cotacoes (status_id);
create index cotacoes_motivo_arq_idx   on public.cotacoes (motivo_arquivamento_id)
  where motivo_arquivamento_id is not null;
create index cotacoes_criado_por_idx   on public.cotacoes (criado_por);
create index cotacoes_alterado_por_idx on public.cotacoes (alterado_por);

-- cotacao_itens
create index cotacao_itens_cotacao_idx      on public.cotacao_itens (cotacao_id);
create index cotacao_itens_produto_idx      on public.cotacao_itens (produto_id);
create index cotacao_itens_grupo_idx        on public.cotacao_itens (grupo_produto_id);
create index cotacao_itens_linha_idx        on public.cotacao_itens (linha_id);
create index cotacao_itens_condicao_idx     on public.cotacao_itens (condicao_id);
create index cotacao_itens_destino_idx      on public.cotacao_itens (endereco_destino_id);
create index cotacao_itens_criado_por_idx   on public.cotacao_itens (criado_por);
create index cotacao_itens_alterado_por_idx on public.cotacao_itens (alterado_por);

-- orcamentos_fornecedor
-- §6, constraint nº 2: um vencedor por item. É o que mata o pareamento por índice de lista
-- do Bubble (vendas-reusables.md §4.7).
create unique index um_vencedor_por_item
  on public.orcamentos_fornecedor (cotacao_item_id) where vencedor;
create index orcamentos_fornecedor_item_idx       on public.orcamentos_fornecedor (cotacao_item_id);
create index orcamentos_fornecedor_cotacao_idx    on public.orcamentos_fornecedor (cotacao_id);
create index orcamentos_fornecedor_fornecedor_idx on public.orcamentos_fornecedor (fornecedor_id);
create index orcamentos_fornecedor_origem_idx     on public.orcamentos_fornecedor (endereco_origem_id);
create index orcamentos_fornecedor_destino_idx    on public.orcamentos_fornecedor (endereco_destino_id);
create index orcamentos_fornecedor_cobranca_idx   on public.orcamentos_fornecedor (endereco_cobranca_id)
  where endereco_cobranca_id is not null;
create index orcamentos_fornecedor_vendedor_idx   on public.orcamentos_fornecedor (vendedor_id);
create index orcamentos_fornecedor_linha_idx      on public.orcamentos_fornecedor (linha_id);
create index orcamentos_fornecedor_condicao_idx   on public.orcamentos_fornecedor (condicao_id);
create index orcamentos_fornecedor_frete_idx      on public.orcamentos_fornecedor (tipo_frete_id);
create index orcamentos_fornecedor_criado_por_idx   on public.orcamentos_fornecedor (criado_por);
create index orcamentos_fornecedor_alterado_por_idx on public.orcamentos_fornecedor (alterado_por);
-- "Última cotação FOB" do seletor de fornecedores (vendas.md §3.6): mesmo produto, mesma
-- origem, frete FOB, a mais recente. No Bubble a busca não tinha data nem ordenação.
create index orcamentos_fornecedor_ultima_fob_idx
  on public.orcamentos_fornecedor (produto_id, endereco_origem_id, criado_em desc)
  where tipo_frete_id = 1;


-- =====================================================================================
-- 3. FUNÇÕES
-- =====================================================================================
-- Todas `security invoker`: leem só tabelas que o usuário ativo já lê (icms_aliquotas,
-- enderecos_clifor, regimes_tributarios, cotacao_itens). Critério de specs/05 §2: nada aqui
-- precisa de `security definer`, então nenhuma entra na lista de avisos aceitos.

-- ---------------------------------------------------------------------- fn_aliquota_icms
create function public.fn_aliquota_icms(p_uf_origem char(2), p_uf_destino char(2))
  returns numeric(7,4)
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_aliquota numeric(7,4);
begin
  select a.aliquota into v_aliquota
  from public.icms_aliquotas a
  where a.uf_origem = p_uf_origem and a.uf_destino = p_uf_destino;

  if v_aliquota is null then
    raise exception 'Sem alíquota de ICMS para origem % e destino %', p_uf_origem, p_uf_destino
      using errcode = 'P0002',
            hint = 'Cadastre o par em icms_aliquotas (perfil 1) antes de orçar.';
  end if;

  return v_aliquota;
end $$;

comment on function public.fn_aliquota_icms(char, char) is
  'Alíquota de ICMS vigente para o par origem × destino, como FRAÇÃO. ERRO (P0002) quando o par '
  'não existe: no Bubble o first_element vinha vazio e o ICMS dava 0 sem aviso (bTiea, '
  'vendas-reusables.md §5.2 e §5.5 item 3). Substitui as 4 buscas repetidas em IcmsEstados '
  '(vendas.md §8.2). security invoker: icms_aliquotas já é legível por qualquer usuário ativo.';

-- ----------------------------------------------------------------- fn_aliquota_pis_cofins
create function public.fn_aliquota_pis_cofins()
  returns numeric(7,4)
  language sql
  immutable
  security invoker
  set search_path = ''
as $$ select 0.0925::numeric(7,4) $$;

comment on function public.fn_aliquota_pis_cofins() is
  'PIS/COFINS de 9,25% como FRAÇÃO. Hoje chumbado em DOIS workflows do Bubble (bTNri e bTiea — '
  'vendas-reusables.md [DÚVIDA 10.20]); aqui é um lugar só. Vira parâmetro com vigência '
  '(parametros_fiscais, vendas-reusables.md §8.4) quando a alíquota mudar pela primeira vez.';

-- ------------------------------------------------------------------ fn_orcamento_derivados
-- Trigger BEFORE INSERT OR UPDATE de orcamentos_fornecedor:
--   * cotacao_id := cotacao_itens.cotacao_id (D6);
--   * alíquotas nulas → regra fiscal de AdicionarFornecedores (D4);
--   * origem/destino trocados sem alíquota nova → recalcula (D5).
create function public.fn_orcamento_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_regime_origem  smallint;
  v_regime_destino smallint;
  v_uf_origem      char(2);
  v_uf_destino     char(2);
  -- regimes_tributarios.id 1 = 'lucro_real' ("Lucro Real/Presumido"), semeado fixo pela 003
  c_lucro_real constant smallint := 1;
begin
  select i.cotacao_id into new.cotacao_id
  from public.cotacao_itens i
  where i.id = new.cotacao_item_id;

  if tg_op = 'UPDATE'
     and (new.endereco_origem_id  is distinct from old.endereco_origem_id
       or new.endereco_destino_id is distinct from old.endereco_destino_id)
     and new.aliquota_icms       is not distinct from old.aliquota_icms
     and new.aliquota_pis_cofins is not distinct from old.aliquota_pis_cofins then
    new.aliquota_icms       := null;
    new.aliquota_pis_cofins := null;
  end if;

  if new.aliquota_icms is null or new.aliquota_pis_cofins is null then
    select e.regime_tributario_id, e.uf into v_regime_origem, v_uf_origem
    from public.enderecos_clifor e where e.id = new.endereco_origem_id;
    select e.regime_tributario_id, e.uf into v_regime_destino, v_uf_destino
    from public.enderecos_clifor e where e.id = new.endereco_destino_id;

    if v_regime_origem = c_lucro_real and v_regime_destino = c_lucro_real then
      new.aliquota_icms       := coalesce(new.aliquota_icms,
                                          public.fn_aliquota_icms(v_uf_origem, v_uf_destino));
      new.aliquota_pis_cofins := coalesce(new.aliquota_pis_cofins,
                                          public.fn_aliquota_pis_cofins());
    else
      new.aliquota_icms       := coalesce(new.aliquota_icms, 0);
      new.aliquota_pis_cofins := coalesce(new.aliquota_pis_cofins, 0);
    end if;
  end if;

  return new;
end $$;

comment on function public.fn_orcamento_derivados() is
  'Trigger de orcamentos_fornecedor: deriva cotacao_id do item e preenche as alíquotas pela '
  'regra de AdicionarFornecedores (bTNri: Lucro Real nos dois lados → ICMS da tabela + 9,25%; '
  'bThgz0: senão, 0 e 0). Alíquota informada é respeitada. Ver D4–D6 no cabeçalho da 007. '
  'NA CARGA: gravar as alíquotas do Bubble explicitamente (vazio do Bubble → 0), para o trigger '
  'não consultar a tabela de ICMS em linha histórica.';

revoke execute on function public.fn_aliquota_icms(char, char) from anon, public;
grant  execute on function public.fn_aliquota_icms(char, char) to authenticated;
revoke execute on function public.fn_aliquota_pis_cofins() from anon, public;
grant  execute on function public.fn_aliquota_pis_cofins() to authenticated;
revoke execute on function public.fn_orcamento_derivados() from anon, authenticated, public;


-- =====================================================================================
-- 4. VIEWS
-- =====================================================================================

-- ------------------------------------------------------------------- v_orcamento_valores
-- As duas fórmulas de bTPFh que dependem das colunas geradas (02 §3.3 e §5).
-- security_invoker = true: respeita a RLS de orcamentos_fornecedor (nunca definer — 004).
create view public.v_orcamento_valores
with (security_invoker = true) as
select o.id,
       o.cotacao_id,
       o.cotacao_item_id,
       o.fornecedor_id,
       o.endereco_origem_id,
       o.produto_id,
       o.vendedor_id,
       o.qtd_venda,
       o.valor_venda_unit,
       o.valor_comissao_unit,
       o.valor_frete,
       o.tipo_frete_id,
       o.aliquota_icms,
       o.aliquota_pis_cofins,
       o.valor_venda_bruto,
       o.valor_comissao_bruto,
       o.valor_icms,
       o.valor_pis_cofins,
       o.valor_icms + o.valor_pis_cofins                           as valor_tributos,
       o.valor_venda_bruto - o.valor_icms - o.valor_pis_cofins     as valor_venda_liquido,
       round((o.valor_venda_bruto - o.valor_icms - o.valor_pis_cofins) / o.qtd_venda, 6)
                                                                   as valor_unit_liquido,
       o.vencedor
from public.orcamentos_fornecedor o;

comment on view public.v_orcamento_valores is
  'Líquido (bTPGF = bruto − ICMS − PIS/COFINS) e unitário líquido (bTeYL = líquido ÷ qtd, com 6 '
  'casas — D3) de cada orçamento, mais "Total Tributos" (ICMS + PIS/COFINS, vendas.md §5.1). '
  'security_invoker = true: respeita a RLS de orcamentos_fornecedor.';

revoke all on public.v_orcamento_valores from anon;
grant select on public.v_orcamento_valores to authenticated;


-- =====================================================================================
-- 5. TRIGGERS
-- =====================================================================================

create trigger trg_orcamentos_fornecedor_derivados
  before insert or update on public.orcamentos_fornecedor
  for each row execute function public.fn_orcamento_derivados();

create trigger trg_cotacoes_alterado
  before update on public.cotacoes
  for each row execute function public.fn_set_alterado();

create trigger trg_cotacao_itens_alterado
  before update on public.cotacao_itens
  for each row execute function public.fn_set_alterado();

create trigger trg_orcamentos_fornecedor_alterado
  before update on public.orcamentos_fornecedor
  for each row execute function public.fn_set_alterado();

-- Auditoria só onde há dinheiro: valor unitário, comissão, frete e alíquota. Hoje esses campos
-- são auto-binding no Bubble, gravados por qualquer logado sem rastro (00 §2.3; vendas.md §7.5).
create trigger trg_orcamentos_fornecedor_auditoria
  after insert or update or delete on public.orcamentos_fornecedor
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 6. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7 e §7)
-- =====================================================================================
-- Nível OPERACIONAL de §7.2 — "quem tem a página" — com a restrição por vendedor que
-- `vendas.md` §1 e §7.2 descrevem e §8.4 manda levar para o banco:
--
--   * Diretor e Gerente (hierarquia ≤ 2) com a página `vendas`: tudo;
--   * Analista e Operador com a página `vendas`: só o que é SEU (`vendedor_id = auth.uid()`).
--
-- No Bubble essa restrição é um parâmetro de URL forçado no carregamento (bTKAD/bTiYV): trocar
-- o parâmetro mostra os dados de todos (vendas.md §7.2). É também a recomendação padrão de
-- §7.3 ("restringir às próprias") e de relatorios [DÚVIDA 8]. (D9)
--
-- As tabelas-filhas (itens, orçamentos) herdam da cotação:
--   * LEITURA por `exists (select 1 from cotacoes c where c.id = cotacao_id)` — o subselect
--     passa pela RLS de cotacoes, então quem enxerga a cotação enxerga os filhos, e só ele;
--   * ESCRITA com a MESMA condição de dono escrita por extenso sobre a cotação, porque a 009
--     acrescenta leitura de cotação ao vendedor SUBSTITUTO — e ele lê, mas não reorça.
--
-- Funções de autorização entre parênteses `(select ...)`: o Postgres as avalia UMA vez por
-- consulta (initPlan), e não uma por linha — o kanban lê centenas de linhas.
--
-- `anon` não tem policy nem privilégio (§7.3).

alter table public.cotacoes              enable row level security;
alter table public.cotacao_itens         enable row level security;
alter table public.orcamentos_fornecedor enable row level security;

revoke all on table public.cotacoes              from anon;
revoke all on table public.cotacao_itens         from anon;
revoke all on table public.orcamentos_fornecedor from anon;

-- ------------------------------------------------------------------------------ cotacoes
create policy cotacoes_leitura on public.cotacoes
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and ((select public.fn_hierarquia()) <= 2 or vendedor_id = (select auth.uid()))
  );
create policy cotacoes_escrita on public.cotacoes
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and ((select public.fn_hierarquia()) <= 2 or vendedor_id = (select auth.uid()))
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and ((select public.fn_hierarquia()) <= 2 or vendedor_id = (select auth.uid()))
  );

comment on policy cotacoes_leitura on public.cotacoes is
  'Página vendas + (hierarquia ≤ 2 OU a cotação é do próprio vendedor). No Bubble a restrição '
  'era parâmetro de URL (vendas.md §7.2). A 009 soma a leitura do vendedor substituto.';
comment on policy cotacoes_escrita on public.cotacoes is
  'Mesma regra da leitura. O WITH CHECK impede o Analista/Operador de gravar cotação em nome de '
  'outro vendedor ou de "passar" a sua para outro. Regras por etapa (não editar arquivada, '
  'hierarquia > 1 — vendas.md §1) ficam na server action.';

-- ------------------------------------------------------------------------- cotacao_itens
create policy cotacao_itens_leitura on public.cotacao_itens
  for select to authenticated
  using (exists (select 1 from public.cotacoes c where c.id = cotacao_id));
create policy cotacao_itens_escrita on public.cotacao_itens
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.cotacoes c
      where c.id = cotacao_id
        and ((select public.fn_hierarquia()) <= 2 or c.vendedor_id = (select auth.uid()))
    )
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.cotacoes c
      where c.id = cotacao_id
        and ((select public.fn_hierarquia()) <= 2 or c.vendedor_id = (select auth.uid()))
    )
  );

comment on policy cotacao_itens_leitura on public.cotacao_itens is
  'Herda da cotação: o subselect passa pela RLS de cotacoes.';

-- ------------------------------------------------------------------ orcamentos_fornecedor
create policy orcamentos_fornecedor_leitura on public.orcamentos_fornecedor
  for select to authenticated
  using (exists (select 1 from public.cotacoes c where c.id = cotacao_id));
create policy orcamentos_fornecedor_escrita on public.orcamentos_fornecedor
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.cotacoes c
      where c.id = cotacao_id
        and ((select public.fn_hierarquia()) <= 2 or c.vendedor_id = (select auth.uid()))
    )
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.cotacoes c
      where c.id = cotacao_id
        and ((select public.fn_hierarquia()) <= 2 or c.vendedor_id = (select auth.uid()))
    )
  );

comment on policy orcamentos_fornecedor_escrita on public.orcamentos_fornecedor is
  'Escreve quem é dono da COTAÇÃO (ou hierarquia ≤ 2). cotacao_id é derivado do item pelo '
  'trigger antes do WITH CHECK, então não dá para apontar o orçamento para a cotação de outro.';


-- =====================================================================================
-- FIM da 007_cotacao.sql
-- =====================================================================================
-- CONFERÊNCIA
--   3 tabelas criadas, 3 com `enable row level security`, 3 com `revoke all ... from anon`.
--   6 policies: leitura + escrita em cada uma. Nenhuma `to anon`.
--   Dinheiro: numeric(14,2) nos valores, numeric(7,4) nas alíquotas (fração, check < 1),
--   numeric(14,3) nas quantidades. Nenhum float.
--   FKs indexadas: todas (inclusive criado_por/alterado_por).
--   Funções novas: fn_aliquota_icms, fn_aliquota_pis_cofins, fn_orcamento_derivados — todas
--   security invoker, search_path = ''. Nenhuma security definer nova.
--   1 view (security_invoker = true). 1 índice único parcial (um_vencedor_por_item).
--   Triggers: 1 derivados, 3 fn_set_alterado, 1 fn_auditoria.
--   icms_aliquotas: intocada (003 já tem RLS, auditoria e fn_set_alterado).
--   Nenhum seed. Nenhum segredo.
-- =====================================================================================
