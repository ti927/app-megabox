-- =====================================================================================
-- 009_entrega.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 6 de `specs/02-modelo-de-dados-proposto.md` §11 (e `specs/03-plano-de-construcao.md`
-- §6): colunas de entrega do kanban (próprias e de substituto) e o diálogo `pop.AnexaNf`.
--
-- Escopo: §3.3 (fim do ciclo) — `entregas`, `entrega_arquivos`; de §5, `v_kanban_entregas`.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Cria `entregas` e `entrega_arquivos` com as colunas obrigatórias de §1.2.
--   2. Trigger `fn_entrega_derivados()`: copia do pedido e do orçamento o que é denormalizado
--      (cotação, proposta, cliente, fornecedor, número, data do pedido), tira o SNAPSHOT dos
--      unitários (`CalcularValoresEntregas` bTbPH) quando vierem nulos e aplica a regra do
--      vendedor substituto de férias (`AtribuirVendedorSubstituto` bUBpN; bTyAt, bUEtu, bTyBX
--      e o AnexaNf — `vendas.md` §5.7, §8.2).
--   3. `email_outbox.entrega_id` — a coluna que a 008 deixou para quando `entregas` existisse.
--   4. Soma a LEITURA do vendedor SUBSTITUTO em `cotacoes` e `pedidos` (policies novas,
--      permissivas: combinam com OR às da 007/008 e não as alteram). É o que a coluna "Entregas
--      Substituto" precisa para abrir o pedido (bTzUJ) e a confirmação (bTzUV).
--   5. `v_kanban_entregas` (security_invoker) com `vendedor_efetivo_id` e o papel de quem lê
--      (próprio ou substituto) — `03` §6: "vem da view, não de duas buscas".
--   6. Índices de §6 (`status_id, dt_prev_entrega`; substituto parcial) e em toda FK.
--   7. `fn_set_alterado` nas 2; `fn_auditoria` em `entregas` (valores e status de dinheiro).
--   8. RLS nas 2 tabelas: página `vendas` + (hierarquia ≤ 2, OU vendedor, OU substituto) —
--      exatamente a recomendação padrão de `02` §7.3 para entregas.
--
-- O QUE **NÃO** ENTRA AQUI
--   - Leitura/escrita de entregas pela página `financeiro` (o AnexaNf também é hospedado lá,
--     `vendas-reusables.md` §1). Entra na FATIA 7 como policy NOVA e permissiva — soma, não
--     substitui estas. Até lá, só quem tem `vendas` enxerga entrega.
--   - `entrega_envios` (histórico de envio de NF/boleto, `vendas-reusables.md` §8.4): o envio já
--     fica rastreado em `email_outbox.entrega_id`. Tabela própria só se a tela pedir.
--   - Índice ÚNICO de NF repetida (`vendas-reusables.md` §9.4): a base não foi medida (04 §1.1
--     mostrou que "único" derruba carga) e a exceção por item está em [DÚVIDA 10.10]. Entra índice
--     comum para a checagem por `exists`; o único vem com a limpeza.
--   - `v_pedido_item_saldo`, `fn_gerar_contas_receber`, `confirmar_entrega`: fatia 7.
--   - Nenhum seed.
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU CONFLITAVA COM O MAPA <<<
--   D1. `qtd >= 0`, default 0 — e NÃO `qtd > 0` como em `02` §3.3. O mapa contradiz a spec em
--       dois pontos: a entrega nasce "sem qtd e sem status" (bTbOz, `vendas.md` §4.6) e o
--       cancelamento grava `QtdEntrega = 0` (bTeaF, §4.9). Com `> 0`, cancelar entrega seria
--       impossível e a carga reprovaria toda entrega cancelada. O mapa manda (regra 1).
--   D2. `status_id` default 2 ("Pedir", chave `pedido`). A entrega nasce SEM status no Bubble e
--       só vira "Pedido" quando o pedido é formalizado (bTcqZ/bTcqJ). "Pedir" é exatamente o
--       estado "falta pedir ao fornecedor" (003). NA CARGA: status vazio do Bubble → 2.
--   D3. O CHECK DE CANCELAMENTO usa o id literal 7. `02` escreveu
--       `status_id <> (select id from etapas where chave_bubble = 'cancelado')`, e o Postgres
--       NÃO aceita subconsulta em check. O id 7 é o semeado fixo pela 003. NA CARGA: entrega
--       cancelada sem motivo no Bubble precisa de um motivo de carga (ex.: "(sem motivo no
--       Bubble)") — medir antes.
--   D4. UNITÁRIOS DE VENDA COM 6 CASAS (numeric(16,6)): `bruto_unit = Orc.Bruto ÷ Orc.Qtd`
--       (bToSn) e `liquido_unit = Orc.ValorUnitLiquido` (bToSx) são divisões; com 2 casas,
--       `qtd × unit` erraria até qtd × R$ 0,005 contra o `Orc.Bruto ÷ Orc.Qtd × QtdEntrega` do
--       Bubble (bToSl/bToSs). `valor_comissao_unit` fica numeric(14,2): é o valor DIGITADO no
--       orçamento (bToSg), não divisão. Os totais gerados são `round(qtd × unit, 2)`.
--       (`02` §1.3 pede numeric(14,2) para valor monetário; `vendas.md` §8.4 e
--       `vendas-reusables.md` §5.5 pedem mais precisão no cálculo e 2 casas nos totais — esta é a
--       conciliação das duas.)
--   D5. SNAPSHOT POR NULO, E "RECALCULAR" = GRAVAR NULO. Os unitários são snapshot (02 §3.3):
--       mudar o orçamento NÃO reescreve a entrega. O trigger só os preenche quando chegam nulos
--       — no insert, ou num update que os anule. É assim que a action `recalcularEntrega`
--       (vendas.md §9.3; bTcSZ) pede o recálculo, sem duplicar a fórmula na aplicação.
--   D6. DENORMALIZADOS SEMPRE DERIVADOS. `02` mantém `cotacao_id`, `proposta_id`, `cliente_id`,
--       `fornecedor_id` como colunas (índice do kanban), e `vendas.md` §8.3 alerta que no Bubble
--       eles divergem. Aqui o trigger os SOBRESCREVE a partir do pedido e do orçamento, e recusa
--       orçamento de outra cotação. `vendedor_id` nulo → vendedor da COTAÇÃO (bTbOz: "QualVendedor
--       = criador da cotação"); `numero_entrega`/`dt_pedido`/`dt_prev_entrega` nulos → do pedido
--       e da proposta.
--   D7. SUBSTITUTO DERIVADO POR COMPLETO. Os WFs do Bubble só GRAVAM o substituto quando as férias
--       cobrem a data prevista, e nunca o limpam — férias remarcadas deixam substituto velho. Aqui
--       ele é recalculado no insert e quando `vendedor_id` ou `dt_prev_entrega` mudam: dentro das
--       férias → `usuarios.substituto_id`; fora → nulo. NA CARGA: rodar com
--       `session_replication_role = replica` para PRESERVAR o substituto histórico (entra em
--       comissão e meta); senão o trigger o recalcula com as férias de hoje.
--
-- ORDEM DOS BLOCOS: tabelas → alter de tabela anterior → índices → funções → views → triggers
-- → RLS e policies.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. TABELAS (§3.3)
-- =====================================================================================

-- ------------------------------------------------------------------------------ entregas
create table public.entregas (
  id          uuid primary key default gen_random_uuid(),
  pedido_id   uuid not null references public.pedidos(id) on delete cascade,
  orcamento_fornecedor_id uuid not null
              references public.orcamentos_fornecedor(id) on delete restrict,
  cotacao_id  uuid not null references public.cotacoes(id) on delete restrict,
  proposta_id uuid references public.propostas(id),
  cliente_id     uuid not null references public.grupos_clifor(id) on delete restrict,
  fornecedor_id  uuid not null references public.grupos_clifor(id) on delete restrict,
  vendedor_id    uuid not null references public.usuarios(id),
  vendedor_substituto_id uuid references public.usuarios(id),
  numero_entrega text,
  qtd            numeric(14,3) not null default 0 check (qtd >= 0),
  status_id      smallint not null default 2 references public.etapas(id),
  dt_prev_entrega date,
  dt_entrega      date,
  dt_pedido       date,
  saiu_entrega   boolean not null default false,
  nao_emite_nf   boolean not null default false,
  nf_fornecedor_numero text,
  dt_emissao_nf  date,
  nf_megabox_numero text,
  dt_nf_megabox  date,
  nota_boleto_enviada boolean not null default false,
  motivo_cancelamento text,
  motivo_alteracao_valores text,
  -- SNAPSHOT dos unitários (bTbPH). Sem default: o trigger preenche quando nulos (D4, D5).
  valor_venda_bruto_unit   numeric(16,6) not null,
  valor_venda_liquido_unit numeric(16,6) not null,
  valor_comissao_unit      numeric(14,2) not null,
  valor_venda_bruto   numeric(14,2) generated always as (round(qtd * valor_venda_bruto_unit, 2)) stored,
  valor_venda_liquido numeric(14,2) generated always as (round(qtd * valor_venda_liquido_unit, 2)) stored,
  valor_comissao      numeric(14,2) generated always as (round(qtd * valor_comissao_unit, 2)) stored,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  -- D3: 7 = 'cancelado' (003). Check não aceita subconsulta.
  constraint entrega_cancelada_tem_motivo check (status_id <> 7 or motivo_cancelamento is not null),
  constraint substituto_nao_e_o_vendedor check (vendedor_substituto_id is distinct from vendedor_id)
);

comment on table public.entregas is
  'Era Tbl.Entregas (tbl_entregas). QuaisContasReceber e Orc.QuaisEntregas não migram (§1.5). '
  'Os textos QualClienteTexto/QualFornecedTexto também não: nome vem por join (vendas.md §8.3). '
  'Os denormalizados que ficaram (cotação, proposta, cliente, fornecedor) são DERIVADOS pelo '
  'trigger (D6 da 009). Auditada por trigger.';
comment on column public.entregas.dt_prev_entrega is
  'Data PREVISTA. ATENÇÃO NO DE-PARA: vem de DtPrevEntrega, cujo id é cpo_dataentrega_date — é '
  'fácil trocar com a real. A tela do Bubble ainda a mostra sob o rótulo "Dt Pedido" '
  '(vendas.md §2.3). Nula no insert → proposta.data_prev_entrega (bTbOz).';
comment on column public.entregas.dt_entrega is
  'Data REAL da entrega, gravada na confirmação (bTcXj). De DtEntrega, id cpo_dtentrega_date. '
  'É dela que parte o vencimento das contas a receber (bTfDZ).';
comment on column public.entregas.qtd is
  'numeric(14,3), >= 0 (D1): nasce sem quantidade (bTbOz) e o cancelamento zera (bTeaF). '
  '02 §3.3 pedia > 0; o mapa manda.';
comment on column public.entregas.status_id is
  'Opt.Etapas. Default 2 = "Pedir" (D2). Formalizar o pedido → 3 Pedido; saiu para entrega → 4 '
  'Em Entrega; confirmação → 5 Financeiro; 7 Cancelado exige motivo.';
comment on column public.entregas.vendedor_substituto_id is
  'Derivado pelo trigger (D7): se as férias do vendedor cobrem dt_prev_entrega, o substituto '
  'dele; senão nulo. Substitui a regra espalhada em bTbOt, bUEti, bTcXd, AnexaNf (3×) e '
  'AtribuirVendedorSubstituto (bUBpN) — vendas.md §8.2.';
comment on column public.entregas.valor_venda_bruto_unit is
  'SNAPSHOT (bToSn = Orc.ValorVendaBruto ÷ Orc.QtdVenda, com o frete rateado). 6 casas (D4). '
  'Nulo → o trigger recalcula do orçamento (D5).';
comment on column public.entregas.valor_venda_liquido_unit is
  'SNAPSHOT (bToSx = Orc.ValorUnitLiquido, v_orcamento_valores). 6 casas (D4).';
comment on column public.entregas.valor_comissao_unit is
  'SNAPSHOT (bToSg = Orc.ValorComissaoUnit). Valor digitado, 2 casas.';

-- ---------------------------------------------------------------------- entrega_arquivos
create table public.entrega_arquivos (
  id           uuid primary key default gen_random_uuid(),
  entrega_id   uuid not null references public.entregas(id) on delete cascade,
  tipo         text not null,
  nome_arquivo text not null,
  path         text not null,
  enviado_em   timestamptz,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint tipo_valido check (tipo in ('nf_fornecedor', 'boleto', 'comprovante', 'nf_megabox'))
);

comment on table public.entrega_arquivos is
  'Unifica ArquivoNfFornecedor, BoletoFile, BoletoArquivos (list.file), ComprovanteEntrega e '
  'AnexoNfMegabox (02 §3.3). Resolve a rotina "copiar boleto único p/ lista" (bTiEc0). `path` é '
  'caminho em bucket PRIVADO + URL assinada (§1.8): hoje NF e BOLETO abrem por URL pública do '
  'CDN, sem expirar (vendas-reusables.md §7.1). NA CARGA: um BubbleId por ARQUIVO não existe '
  '(são campos da entrega) — bubble_id fica nulo e a idempotência é (entrega_id, tipo, path).';
comment on column public.entrega_arquivos.path is
  'Caminho no bucket privado. Se algum dia guardar "https://", o vazamento do Bubble voltou.';


-- =====================================================================================
-- 2. A COLUNA QUE A 008 DEIXOU PENDENTE
-- =====================================================================================
alter table public.email_outbox
  add column entrega_id uuid references public.entregas(id) on delete set null;

comment on column public.email_outbox.entrega_id is
  'E-mail de NF + boleto ao cliente (vendas-reusables.md §4.5) e de cancelamento de entrega. '
  'Entrou na 009, quando entregas passou a existir.';


-- =====================================================================================
-- 3. ÍNDICES (§6)
-- =====================================================================================

-- entregas — os dois de §6 pelo nome, e o do kanban por vendedor
create index entregas_status_prev_idx on public.entregas (status_id, dt_prev_entrega);
create index entregas_substituto_idx  on public.entregas (vendedor_substituto_id)
  where vendedor_substituto_id is not null;
create index entregas_vendedor_idx    on public.entregas (vendedor_id, criado_em desc);
create index entregas_pedido_idx      on public.entregas (pedido_id);
create index entregas_orcamento_idx   on public.entregas (orcamento_fornecedor_id);
create index entregas_cotacao_idx     on public.entregas (cotacao_id);
create index entregas_proposta_idx    on public.entregas (proposta_id);
create index entregas_cliente_idx     on public.entregas (cliente_id);
create index entregas_fornecedor_idx  on public.entregas (fornecedor_id);
create index entregas_dt_entrega_idx  on public.entregas (dt_entrega) where dt_entrega is not null;
-- "NF repetida" (vendas-reusables.md §3 #1) por exists no servidor, não varredura no navegador.
create index entregas_nf_fornecedor_idx on public.entregas (fornecedor_id, nf_fornecedor_numero)
  where nf_fornecedor_numero is not null;
create index entregas_criado_por_idx   on public.entregas (criado_por);
create index entregas_alterado_por_idx on public.entregas (alterado_por);

-- entrega_arquivos
create index entrega_arquivos_entrega_idx      on public.entrega_arquivos (entrega_id, tipo);
create index entrega_arquivos_criado_por_idx   on public.entrega_arquivos (criado_por);
create index entrega_arquivos_alterado_por_idx on public.entrega_arquivos (alterado_por);

-- email_outbox.entrega_id
create index email_outbox_entrega_idx on public.email_outbox (entrega_id);


-- =====================================================================================
-- 4. FUNÇÃO DE TRIGGER (security invoker; ninguém a chama por RPC)
-- =====================================================================================
-- Lê pedidos, cotacoes, propostas, orcamentos_fornecedor e as colunas de férias de usuarios —
-- todas legíveis por quem pode gravar a entrega (usuarios: substituto_id/ferias_* estão no
-- GRANT de coluna da 004). Nada aqui pede security definer.
create function public.fn_entrega_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_ped record;
  v_orc record;
  v_recalcular_substituto boolean;
begin
  select p.cotacao_id, p.proposta_id, p.cliente_id, p.numero, p.criado_em,
         c.vendedor_id as vendedor_cotacao, pr.data_prev_entrega
    into v_ped
  from public.pedidos p
  join public.cotacoes c on c.id = p.cotacao_id
  left join public.propostas pr on pr.id = p.proposta_id
  where p.id = new.pedido_id;

  select v.cotacao_id, v.fornecedor_id, v.valor_venda_bruto, v.qtd_venda,
         v.valor_unit_liquido, v.valor_comissao_unit
    into v_orc
  from public.v_orcamento_valores v
  where v.id = new.orcamento_fornecedor_id;

  -- D6: o orçamento tem de ser da cotação do pedido
  if v_orc.cotacao_id is distinct from v_ped.cotacao_id then
    raise exception 'O orçamento % não pertence à cotação do pedido', new.orcamento_fornecedor_id
      using errcode = '23514';
  end if;

  -- D6: denormalizados sempre derivados
  new.cotacao_id    := v_ped.cotacao_id;
  new.proposta_id   := v_ped.proposta_id;
  new.cliente_id    := v_ped.cliente_id;
  new.fornecedor_id := v_orc.fornecedor_id;

  if tg_op = 'INSERT' then
    new.vendedor_id     := coalesce(new.vendedor_id, v_ped.vendedor_cotacao);
    new.numero_entrega  := coalesce(new.numero_entrega, v_ped.numero);
    new.dt_pedido       := coalesce(new.dt_pedido, (v_ped.criado_em at time zone 'America/Sao_Paulo')::date);
    new.dt_prev_entrega := coalesce(new.dt_prev_entrega, v_ped.data_prev_entrega);
  end if;

  -- D5: snapshot só do que vier nulo
  new.valor_venda_bruto_unit   := coalesce(new.valor_venda_bruto_unit,
                                           round(v_orc.valor_venda_bruto / v_orc.qtd_venda, 6));
  new.valor_venda_liquido_unit := coalesce(new.valor_venda_liquido_unit, v_orc.valor_unit_liquido);
  new.valor_comissao_unit      := coalesce(new.valor_comissao_unit, v_orc.valor_comissao_unit);

  -- D7: substituto de férias
  v_recalcular_substituto := tg_op = 'INSERT'
    or new.vendedor_id     is distinct from old.vendedor_id
    or new.dt_prev_entrega is distinct from old.dt_prev_entrega;

  if v_recalcular_substituto then
    select u.substituto_id into new.vendedor_substituto_id
    from public.usuarios u
    where u.id = new.vendedor_id
      and new.dt_prev_entrega is not null
      and u.ferias_inicio is not null
      and new.dt_prev_entrega between u.ferias_inicio and coalesce(u.ferias_fim, u.ferias_inicio);
    -- select into sem linha deixa o alvo NULO: fora das férias, não há substituto.
  end if;

  return new;
end $$;

comment on function public.fn_entrega_derivados() is
  'Trigger BEFORE INSERT OR UPDATE de entregas: deriva cotação/proposta/cliente/fornecedor (D6), '
  'tira o snapshot dos unitários quando nulos (bTbPH, D5) e aplica o substituto de férias (bUBpN, '
  'D7). Ver o cabeçalho da 009.';

revoke execute on function public.fn_entrega_derivados() from anon, authenticated, public;


-- =====================================================================================
-- 5. VIEWS
-- =====================================================================================
create view public.v_kanban_entregas
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
       e.criado_em
from public.entregas e
join public.pedidos p               on p.id = e.pedido_id
join public.orcamentos_fornecedor o on o.id = e.orcamento_fornecedor_id
join public.grupos_clifor cli       on cli.id = e.cliente_id
join public.grupos_clifor forn      on forn.id = e.fornecedor_id
join public.produtos pr             on pr.id = o.produto_id;

comment on view public.v_kanban_entregas is
  'Cartões das duas colunas de entrega (vendas.md §3.3 e §3.4) numa consulta só: papel = '
  '''proprio'' | ''substituto'' | ''equipe'' em relação a quem lê, e vendedor_efetivo_id. '
  'Substitui as duas buscas separadas (bTbxZ, bTzTB). security_invoker = true: respeita a RLS '
  'de entregas e das tabelas do join.';

revoke all on public.v_kanban_entregas from anon;
grant select on public.v_kanban_entregas to authenticated;


-- =====================================================================================
-- 6. TRIGGERS
-- =====================================================================================
create trigger trg_entregas_derivados
  before insert or update on public.entregas
  for each row execute function public.fn_entrega_derivados();

create trigger trg_entregas_alterado
  before update on public.entregas
  for each row execute function public.fn_set_alterado();
create trigger trg_entrega_arquivos_alterado
  before update on public.entrega_arquivos
  for each row execute function public.fn_set_alterado();

-- Status, quantidade e unitários da entrega viram conta a receber e comissão (fatia 7). No
-- Bubble, auto-binding: qualquer logado muda a NF, o status e os boletos de qualquer entrega
-- (vendas-reusables.md §7.4).
create trigger trg_entregas_auditoria
  after insert or update or delete on public.entregas
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 7. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7 e §7.3)
-- =====================================================================================
-- `02` §7.3, "Entregas e contas, para Analista/Operador": restringir às próprias
-- (vendedor_id = auth.uid() or vendedor_substituto_id = auth.uid()) é a recomendação padrão.
-- O substituto ESCREVE na entrega (o caminhão do cartão de substituto abre a confirmação,
-- bTzUV), mas só LÊ a cotação e o pedido (policies de leitura somadas abaixo).

alter table public.entregas         enable row level security;
alter table public.entrega_arquivos enable row level security;

revoke all on table public.entregas         from anon;
revoke all on table public.entrega_arquivos from anon;

-- ------------------------------------------------------------------------------ entregas
create policy entregas_leitura on public.entregas
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  );
create policy entregas_escrita on public.entregas
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  );

comment on policy entregas_leitura on public.entregas is
  'Página vendas + (hierarquia ≤ 2, OU vendedor, OU substituto) — 02 §7.3 e relatorios '
  '[DÚVIDA 8]. A página financeiro entra na fatia 7 como policy nova. Regra "entrega em '
  'Financeiro só o Diretor reabre" (bTmJL0) fica na server action.';

-- ---------------------------------------------------------------------- entrega_arquivos
create policy entrega_arquivos_leitura on public.entrega_arquivos
  for select to authenticated
  using (exists (select 1 from public.entregas e where e.id = entrega_id));
create policy entrega_arquivos_escrita on public.entrega_arquivos
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  );

comment on policy entrega_arquivos_escrita on public.entrega_arquivos is
  'Escreve quem enxerga a entrega pela RLS de entregas — a mesma condição da escrita dela. O '
  'bucket de Storage espelha esta regra (vendas-reusables.md §7.1).';

-- ------------------------------------- leitura do SUBSTITUTO em cotacoes e pedidos (soma)
-- Permissivas: combinam por OR com cotacoes_leitura (007) e pedidos_leitura (008). Não há
-- ciclo: as policies de entregas não consultam cotacoes nem pedidos.
create policy cotacoes_leitura_substituto on public.cotacoes
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.entregas e
      where e.cotacao_id = cotacoes.id
        and e.vendedor_substituto_id = (select auth.uid())
    )
  );
create policy pedidos_leitura_substituto on public.pedidos
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.entregas e
      where e.pedido_id = pedidos.id
        and e.vendedor_substituto_id = (select auth.uid())
    )
  );

comment on policy cotacoes_leitura_substituto on public.cotacoes is
  'O substituto de férias LÊ a cotação das entregas que cobre (e, pelas policies de herança, '
  'itens, orçamentos e propostas dela). NÃO escreve: a escrita continua sendo do dono.';
comment on policy pedidos_leitura_substituto on public.pedidos is
  'O substituto abre o pedido pelo cartão de entrega de substituto (bTzUJ). Só leitura.';


-- =====================================================================================
-- FIM da 009_entrega.sql
-- =====================================================================================
-- CONFERÊNCIA
--   2 tabelas, 2 com RLS, 2 com `revoke all ... from anon`.
--   6 policies novas: leitura + escrita em entregas e entrega_arquivos; leitura do substituto
--   em cotacoes e pedidos.
--   1 coluna nova em email_outbox (entrega_id), com índice.
--   Dinheiro: numeric; unitários de venda (16,6), comissão unitária e totais (14,2). Nenhum float.
--   FKs indexadas: todas.
--   Função nova: fn_entrega_derivados — security invoker, só trigger. Nenhuma security definer.
--   1 view (security_invoker = true).
--   Triggers: 1 derivados, 2 fn_set_alterado, 1 fn_auditoria.
--   Nenhum seed. Nenhum segredo.
-- =====================================================================================
