-- =====================================================================================
-- 012_historico.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 9 de `specs/02-modelo-de-dados-proposto.md` §11 (Histórico: FollowUp + painel).
-- Os números 010 e 011 são das fatias 7 e 8 (financeiro, metas), escritas em paralelo; esta
-- migration NÃO depende de nenhuma tabela delas.
--
-- Escopo: §3.7 — `historicos`; §3.8 — `modelos_email`. Mais o que as migrations anteriores
-- deixaram marcado "para a fatia 9":
--   - `grupos_clifor.ultimo_historico_em` / `ultimo_historico_id` + o trigger que os mantém
--     (cabeçalho e FIM da 006);
--   - a FK `email_outbox.modelo_chave → modelos_email(chave)` (008, linha do `modelo_chave`).
--     Conferido: só `email_outbox` tem `modelo_chave`; propostas e entregas não têm.
--
-- Fonte no mapa (via `specs/paginas/historico.md`): `Tbl.Historico` (7 campos); criação em
-- bTdwJ/bTdzR/bTjKe (tool.Historico), bTxvq (pop.HistoricoConversas), bUEjC0 (e-mail de
-- prospecção), bTpUl/bTrNz (financeiro), bTjCC/bTjBw/bUEoF (vendas), bUCVe (endereço);
-- EDIÇÃO que sobrescreve texto e troca o autor em bTdwt/bTdzi/bTjKr/bTxwD; EXCLUSÃO física em
-- bTeBy/bTeCo/bTjLD; espelho `UltimoHistoricoData/Msg` gravado à mão em 12 lugares e reparado
-- em massa por bTjME/bTjMv (`historico.md` §3.3, §4.13, §4.14, §7.3, §8.3.10).
--
-- O QUE ESTA MIGRATION FAZ
--   1. `modelos_email` (nível DOMÍNIO) e `historicos` (APPEND-ONLY, 02 §2.1.4 e §7.3).
--   2. `grupos_clifor.ultimo_historico_em/_id` + trigger de ESPELHO por INSTRUÇÃO (não por
--      linha) em historicos — ver D4.
--   3. Os triggers de `fn_set_alterado` e `fn_auditoria` de grupos_clifor passam a IGNORAR a
--      atualização do espelho (D5). Sem isso cada interação registrada viraria "cliente
--      alterado" e uma linha de auditoria, e a carga do histórico geraria dezenas de milhares.
--   4. FK de `email_outbox.modelo_chave` (0 linhas preenchidas hoje — conferido antes).
--   5. Índice em toda FK e os dois de §6 para historicos.
--   6. RLS nas 2 tabelas. `anon` sem policy e sem GRANT.
--
-- O QUE **NÃO** ENTRA AQUI
--   - FK de `historicos.conta_receber_id → contas_receber(id)`: `contas_receber` é da fatia 7
--     (db/010, em construção em paralelo). A coluna nasce uuid SEM FK e com índice; a FK entra
--     na primeira migration posterior a 010 e 012 (ver FICA PENDENTE no fim).
--   - Seed dos 7 modelos de e-mail de prospecção (`historico.md` [DÚVIDA 12]): os textos estão
--     no código dos workflows do Bubble; entram pela carga/tela, não por migration.
--   - `emails_enviados` (`historico.md` §8.4): `email_outbox` (008) já é o registro do envio;
--     historicos aponta para ele por `email_id` (D7).
--   - Views de tela (`vw_linha_do_tempo_clifor`, `vw_clientes_sem_interacao`) e a árvore do
--     FollowUp (`fn_arvore_pedido`, `fn_transferir_venda`): dependem de contas_receber/pagar
--     (fatia 7) e entram com a tela.
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU CONFLITAVA COM O MAPA <<<
--   D1. APPEND-ONLY DE VERDADE, NO GRANT E NO TRIGGER. 02 §7.3: "insert com autor_id =
--       auth.uid(), nenhuma policy de update ou delete". Além de não ter policy, UPDATE e DELETE
--       são REVOGADOS de `authenticated` (a tentativa falha com 42501 em vez de "0 linhas"), e o
--       trigger `fn_historico_imutavel` recusa, para QUALQUER papel (service_role incluído),
--       mudar qualquer coluna que não seja a marcação de cancelamento — e cancelamento é de mão
--       única. Correção = linha nova com `corrige_id` (historico.md §7.3, §9.3).
--   D2. CANCELAR É SERVER ACTION. Sem policy de update, `cancelarInteracao(id, motivo)`
--       (historico.md §9.3: "só autor ou diretor") roda com service_role e confere autor/perfil
--       1 no servidor; o banco garante que só as 3 colunas de cancelamento mudam e uma vez só.
--       CORRIGIR é INSERT do próprio usuário: o trigger exige que a linha corrigida seja dele
--       ou que ele seja perfil 1 (42501), do mesmo cliente e não cancelada. Não é a policy que
--       checa: policy de historicos que consulta historicos recursa (42P17) — achado pelo teste
--       e corrigido no banco por `create or replace function` + `drop/create policy`.
--   D3. QUEM LÊ. 02 §7.3 diz "select para quem tem a página", mas o painel não tem página
--       própria: é montado em vendas, financeiro, cadastros e sac (historico.md §2.4) e lido por
--       pop.HistoricoConversas em cadastros (sac.md §3.7). Lê o usuário ATIVO com QUALQUER uma
--       dessas quatro páginas. SEM sigilo por carteira: no Bubble a trava de carteira de
--       Analista/Operador é só visual (`dd vendedor` desabilitado, historico.md §1.4) e o
--       pop.HistoricoConversas mostra o histórico de qualquer cliente a quem abre o cadastro;
--       a spec não impõe sigilo. Se o negócio quiser, é uma policy a mais, não uma coluna.
--   D4. ESPELHO POR TRIGGER DE INSTRUÇÃO. `ultimo_historico_em/_id` = a linha mais recente
--       (criado_em desc, id desc) NÃO cancelada e que NÃO é correção (corrigir um texto antigo
--       não é contato novo; a original continua valendo). Recalculado para os grupos tocados,
--       com tabela de transição — a carga de dezenas de milhares de linhas custa UM update por
--       grupo por lote, não um por linha. Substitui os 12 gravadores à mão e as rotinas
--       bTjME/bTjMv. `fn_historico_espelho_recalcular(uuid[])` fica exposta só ao service_role
--       para reparo depois de carga com `session_replication_role = replica`.
--   D5. OS TRIGGERS DE grupos_clifor IGNORAM O ESPELHO. `trg_grupos_clifor_alterado` e a
--       auditoria de UPDATE ganham `when` que compara a linha SEM ultimo_historico_* e
--       alterado_*: registrar contato não é alterar o cadastro. A auditoria de grupos_clifor é
--       dividida em duas (insert/delete e update) porque `when` com OLD não vale em INSERT.
--   D6. O BANCO CARIMBA, O FORMULÁRIO NÃO. Para quem tem sessão (`auth.uid()` não nulo):
--       `criado_em = now()` e `criado_por = auth.uid()` forçados (sem retrodatar para fugir do
--       "sem interação há N dias"); `autor_id` default `auth.uid()` e a policy RECUSA outro
--       (historico.md §7.3: "autor gravado pelo servidor"); `departamento_id` vem do autor quando
--       nulo ([DÚVIDA 16]). Pela carga (service_role, sem auth.uid()), valem os valores do Bubble.
--   D7. `tipo_evento` e `origem` são text com CHECK (listas pequenas, 02 §3.7). O usuário só
--       insere `origem = 'manual'`; eventos automáticos (proposta, pedido, cobrança, e-mail)
--       vêm do servidor. `origem` ganha `'carga'` para as linhas vindas do Bubble (que não dizem
--       de onde vieram). `email_id → email_outbox` no lugar do corpo inteiro do e-mail em
--       `descricao` (historico.md [DÚVIDA 10]).
--   D8. `historicos` sem `alterado_em/alterado_por` (fuga de §1.2 declarada): a tabela não é
--       alterada; o único "update" permitido tem colunas próprias (cancelado_*).
--   D9. `modelos_email` sem `bubble_id`: os modelos não são registros do Bubble, são texto no
--       código dos workflows (historico.md [DÚVIDA 12]). Tem `nome` e `ordem` porque a tela
--       mostra 7 cartões nomeados (historico.md §2.4). Escrita perfil 1 (nível DOMÍNIO, 02 §7.2),
--       com auditoria: o modelo é texto enviado em nome da empresa.
--
-- ORDEM DOS BLOCOS: tabelas → alter de tabelas anteriores → índices → funções → triggers →
-- backfill → RLS e policies.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. TABELAS
-- =====================================================================================

-- ------------------------------------------------------------------------- modelos_email
create table public.modelos_email (
  chave     text primary key,
  nome      text not null,
  assunto   text not null,
  corpo     text not null,
  ativo     boolean not null default true,
  ordem     smallint not null default 0,
  -- colunas de §1.2 (sem bubble_id — D9)
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint chave_formato check (chave ~ '^[a-z0-9_]+$')
);

comment on table public.modelos_email is
  'Modelos de e-mail (02 §3.8). Hoje os 7 modelos de prospecção estão fixos nas condicionais '
  'de tool.Historico (var_modeloemail_ 1..7) e os de proposta/pedido/cobrança/SAC/NPS no corpo '
  'dos workflows (historico.md [DÚVIDA 12], sac.md §8.3). Nível DOMÍNIO: lê usuário ativo, '
  'escreve perfil 1, auditado. Sem seed (D9 da 012).';

-- ----------------------------------------------------------------------------- historicos
create table public.historicos (
  id              uuid primary key default gen_random_uuid(),
  grupo_clifor_id uuid not null references public.grupos_clifor(id) on delete restrict,
  unidade_id      uuid references public.enderecos_clifor(id),
  contato_id      uuid references public.contatos_clifor(id),
  autor_id        uuid not null default auth.uid() references public.usuarios(id),
  vendedor_id     uuid references public.usuarios(id),
  departamento_id smallint references public.departamentos(id),
  tipo_evento     text not null default 'conversa',
  origem          text not null default 'manual',
  descricao       text not null,
  anexo_path      text,
  anexo_link      text,
  -- FK para contas_receber entra depois da fatia 7 (ver cabeçalho)
  conta_receber_id uuid,
  email_id        uuid references public.email_outbox(id) on delete set null,
  corrige_id      uuid references public.historicos(id) on delete restrict,
  cancelado_em    timestamptz,
  cancelado_por   uuid references public.usuarios(id),
  cancelado_motivo text,
  -- colunas de §1.2 (sem alterado_* — D8)
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  constraint tipo_evento_valido check (tipo_evento in
    ('conversa', 'email', 'proposta', 'pedido', 'cobranca', 'recibo', 'cadastro', 'sistema')),
  constraint origem_valida check (origem in ('manual', 'gmail', 'workflow', 'carga')),
  constraint descricao_nao_vazia check (btrim(descricao) <> ''),
  constraint cancelamento_com_motivo check (
    cancelado_em is null or nullif(btrim(cancelado_motivo), '') is not null),
  constraint nao_corrige_a_si_mesmo check (corrige_id is distinct from id)
);

comment on table public.historicos is
  'Era Tbl.Historico (tbl_historico): a linha do tempo de interações com o cliente/fornecedor. '
  'APPEND-ONLY (02 §2.1.4): sem UPDATE e sem DELETE para usuário (revogados no GRANT) e um '
  'trigger que só deixa marcar o cancelamento, uma vez. Hoje editar sobrescreve o texto e TROCA '
  'O AUTOR (bTdwt, bTdzi, bTjKr, bTxwD) e excluir é físico (bTeBy, bTeCo, bTjLD) — '
  'historico.md §7.3. Correção = linha nova com corrige_id. PRIVACIDADE: é a tabela que mais '
  'cresce e a que guardava corpo de e-mail de prospecção; paginar sempre no servidor.';
comment on column public.historicos.grupo_clifor_id is
  'Era QualCliente (id cpo_qualcliente_custom_tbl_clientes). Cliente ou fornecedor.';
comment on column public.historicos.autor_id is
  'Quem escreveu. Default auth.uid(); a policy recusa outro (D6). NA CARGA: Created By do '
  'Bubble — e NÃO QualVendedor, que a edição sobrescrevia com quem editou.';
comment on column public.historicos.vendedor_id is
  'Era QualVendedor. No e-mail de prospecção o Bubble gravava o vendedor do FILTRO (bUEjC0, '
  'historico.md §8.3.8), não quem enviou. Informativo; quem escreveu é autor_id.';
comment on column public.historicos.origem is
  'manual (usuário) | gmail | workflow (evento automático do servidor) | carga (vindo do Bubble). '
  'authenticated só insere manual (D7).';
comment on column public.historicos.conta_receber_id is
  'Ligação com a CR (pop.HistoricosContaReceber, bTmBp). SEM FK até contas_receber existir '
  '(fatia 7, db/010) — a FK entra numa migration posterior.';
comment on column public.historicos.email_id is
  'E-mail que gerou o registro (fila da 008). No lugar do corpo inteiro em descricao '
  '(historico.md [DÚVIDA 10]).';
comment on column public.historicos.corrige_id is
  'Correção aponta para a linha corrigida (02 §3.7). A original permanece.';


-- =====================================================================================
-- 2. COLUNAS E FK QUE MIGRATIONS ANTERIORES DEIXARAM PARA A FATIA 9
-- =====================================================================================
alter table public.grupos_clifor
  add column ultimo_historico_em timestamptz,
  add column ultimo_historico_id uuid references public.historicos(id) on delete set null;

comment on column public.grupos_clifor.ultimo_historico_em is
  'ESPELHO mantido por trigger em historicos (D4 da 012): criado_em da interação mais recente '
  'não cancelada e que não é correção. Nulo = nunca contatado (esses aparecem no topo de "sem '
  'interação", historico.md [DÚVIDA 11]). Era UltimoHistoricoData, gravado à mão em 12 lugares.';
comment on column public.grupos_clifor.ultimo_historico_id is
  'ESPELHO (D4 da 012): a interação correspondente a ultimo_historico_em. Era UltimoHistoricoMsg.';

-- Conferido antes de aplicar: 0 linhas de email_outbox com modelo_chave preenchido.
alter table public.email_outbox
  add constraint email_outbox_modelo_chave_fkey
  foreign key (modelo_chave) references public.modelos_email(chave) on update cascade;

comment on column public.email_outbox.modelo_chave is
  'Chave de modelos_email. FK desde a 012 (fatia 9).';


-- =====================================================================================
-- 3. ÍNDICES (§6 e historico.md §8.4)
-- =====================================================================================

-- historicos — os dois de §6 pelo nome, o do espelho e toda FK
create index historicos_grupo_criado_idx on public.historicos (grupo_clifor_id, criado_em desc, id desc);
create index historicos_autor_criado_idx on public.historicos (autor_id, criado_em desc);
-- o espelho (D4) procura só as linhas que contam
create index historicos_espelho_idx on public.historicos (grupo_clifor_id, criado_em desc, id desc)
  where cancelado_em is null and corrige_id is null;
create index historicos_unidade_idx       on public.historicos (unidade_id);
create index historicos_contato_idx       on public.historicos (contato_id);
create index historicos_vendedor_idx      on public.historicos (vendedor_id, criado_em desc);
create index historicos_departamento_idx  on public.historicos (departamento_id);
create index historicos_conta_receber_idx on public.historicos (conta_receber_id)
  where conta_receber_id is not null;
create index historicos_email_idx         on public.historicos (email_id) where email_id is not null;
create index historicos_corrige_idx       on public.historicos (corrige_id) where corrige_id is not null;
create index historicos_cancelado_por_idx on public.historicos (cancelado_por);
create index historicos_criado_por_idx    on public.historicos (criado_por);

-- modelos_email
create index modelos_email_criado_por_idx   on public.modelos_email (criado_por);
create index modelos_email_alterado_por_idx on public.modelos_email (alterado_por);

-- grupos_clifor: FK nova + "sem interação" por carteira (nunca contatados primeiro)
create index grupos_clifor_ultimo_historico_idx on public.grupos_clifor (ultimo_historico_id);
create index grupos_clifor_carteira_ult_hist_idx on public.grupos_clifor
  (carteira_id, ultimo_historico_em nulls first) where ativo;

-- email_outbox.modelo_chave (FK nova)
create index email_outbox_modelo_idx on public.email_outbox (modelo_chave)
  where modelo_chave is not null;


-- =====================================================================================
-- 4. FUNÇÕES
-- =====================================================================================

-- ------------------------------------------------ regras do insert (security invoker)
-- Lê historicos, enderecos_clifor, contatos_clifor e usuarios.departamento_id — tudo legível
-- por quem pode inserir. Nada aqui pede security definer.
create function public.fn_historico_regras()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_orig record;
begin
  -- D6: quem tem sessão não escolhe carimbo
  if auth.uid() is not null then
    new.criado_em  := now();
    new.criado_por := auth.uid();
  end if;

  if new.departamento_id is null then
    select u.departamento_id into new.departamento_id
    from public.usuarios u where u.id = new.autor_id;
  end if;

  if new.unidade_id is not null and not exists (
       select 1 from public.enderecos_clifor e
       where e.id = new.unidade_id and e.grupo_id = new.grupo_clifor_id) then
    raise exception 'A unidade % não é do cliente/fornecedor do histórico', new.unidade_id
      using errcode = '23514';
  end if;

  if new.contato_id is not null and not exists (
       select 1 from public.contatos_clifor c
       where c.id = new.contato_id and c.grupo_id = new.grupo_clifor_id) then
    raise exception 'O contato % não é do cliente/fornecedor do histórico', new.contato_id
      using errcode = '23514';
  end if;

  -- D2: correção é do mesmo cliente, de linha não cancelada, e (para quem tem sessão) da
  -- própria linha ou por perfil 1. Esta checagem mora AQUI e não na policy de insert: uma
  -- policy de historicos que consulta historicos dá 42P17 (recursão) — achado pelo
  -- scripts/testar-rls-historico-sac.mjs.
  if new.corrige_id is not null then
    select h.grupo_clifor_id, h.cancelado_em, h.autor_id into v_orig
    from public.historicos h where h.id = new.corrige_id;
    if not found then
      raise exception 'Histórico a corrigir % não encontrado', new.corrige_id using errcode = '23503';
    end if;
    if auth.uid() is not null
       and v_orig.autor_id is distinct from auth.uid()
       and coalesce(public.fn_hierarquia(), 99) <> 1 then
      raise exception 'Só o autor ou a Diretoria corrige um histórico' using errcode = '42501';
    end if;
    if v_orig.grupo_clifor_id <> new.grupo_clifor_id then
      raise exception 'A correção tem de ser do mesmo cliente/fornecedor' using errcode = '23514';
    end if;
    if v_orig.cancelado_em is not null then
      raise exception 'Histórico cancelado não se corrige' using errcode = '23514';
    end if;
  end if;

  return new;
end $$;

comment on function public.fn_historico_regras() is
  'BEFORE INSERT em historicos: carimbo do servidor (D6), departamento do autor, unidade/contato '
  'do mesmo cliente, correção do mesmo cliente e de linha viva (D2). Ver cabeçalho da 012.';

-- ------------------------------------------------ imutabilidade (security invoker)
create function public.fn_historico_imutavel()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if (to_jsonb(new) - array['cancelado_em', 'cancelado_por', 'cancelado_motivo'])
     is distinct from
     (to_jsonb(old) - array['cancelado_em', 'cancelado_por', 'cancelado_motivo']) then
    raise exception 'historicos é append-only: corrija com uma linha nova (corrige_id)'
      using errcode = '55000';
  end if;
  if old.cancelado_em is not null then
    raise exception 'Histórico já cancelado não muda' using errcode = '55000';
  end if;
  if new.cancelado_em is null then
    raise exception 'O único update permitido em historicos é o cancelamento' using errcode = '55000';
  end if;
  return new;
end $$;

comment on function public.fn_historico_imutavel() is
  'BEFORE UPDATE em historicos, para TODO papel: só as colunas cancelado_* mudam, e uma vez '
  '(D1 da 012). O usuário nem chega aqui: UPDATE está revogado de authenticated.';

-- ------------------------------------------------ espelho em grupos_clifor (D4)
-- SECURITY DEFINER por necessidade: quem registra uma interação (vendedor com a página
-- vendas) em geral NÃO tem escrita em grupos_clifor (página cadastros). A função só toca as
-- duas colunas de espelho, só dos grupos passados, e o execute é revogado de todo papel de
-- cliente (anon, authenticated) — não é chamável por RPC por quem tem sessão.
create function public.fn_historico_espelho_recalcular(p_grupos uuid[])
  returns integer
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  v_linhas integer;
begin
  update public.grupos_clifor g
     set ultimo_historico_em = u.criado_em,
         ultimo_historico_id = u.id
    from (
      select alvo.grupo_id, ult.id, ult.criado_em
      from unnest(p_grupos) as alvo(grupo_id)
      left join lateral (
        select h.id, h.criado_em
        from public.historicos h
        where h.grupo_clifor_id = alvo.grupo_id
          and h.cancelado_em is null
          and h.corrige_id is null
        order by h.criado_em desc, h.id desc
        limit 1
      ) ult on true
    ) u
   where g.id = u.grupo_id
     and (g.ultimo_historico_em, g.ultimo_historico_id)
         is distinct from (u.criado_em, u.id);
  get diagnostics v_linhas = row_count;
  return v_linhas;
end $$;

comment on function public.fn_historico_espelho_recalcular(uuid[]) is
  'Recalcula ultimo_historico_em/_id dos grupos dados; devolve quantos mudaram. Chamada pelo '
  'trigger de historicos e, só por service_role, para reparo depois de carga em modo replica. '
  'Substitui as rotinas bTjME/bTjMv (historico.md §8.3.10).';

revoke execute on function public.fn_historico_espelho_recalcular(uuid[]) from public, anon, authenticated;

-- Trigger de INSTRUÇÃO. A tabela de transição se chama `linhas` nos três eventos.
-- Definer para poder chamar a função acima (cujo execute foi revogado de authenticated).
create function public.fn_historico_espelho()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  perform public.fn_historico_espelho_recalcular(
    array(select distinct l.grupo_clifor_id from linhas l));
  return null;
end $$;

comment on function public.fn_historico_espelho() is
  'AFTER INSERT/UPDATE/DELETE FOR EACH STATEMENT em historicos: um recálculo por grupo tocado, '
  'não um por linha (D4 da 012).';

revoke execute on function public.fn_historico_regras()   from public, anon, authenticated;
revoke execute on function public.fn_historico_imutavel() from public, anon, authenticated;
revoke execute on function public.fn_historico_espelho()  from public, anon, authenticated;


-- =====================================================================================
-- 5. TRIGGERS
-- =====================================================================================

-- historicos
create trigger trg_historicos_regras
  before insert on public.historicos
  for each row execute function public.fn_historico_regras();
create trigger trg_historicos_imutavel
  before update on public.historicos
  for each row execute function public.fn_historico_imutavel();

-- Transition tables não aceitam trigger de mais de um evento: três triggers, uma função.
create trigger trg_historicos_espelho_ins
  after insert on public.historicos
  referencing new table as linhas
  for each statement execute function public.fn_historico_espelho();
create trigger trg_historicos_espelho_upd
  after update on public.historicos
  referencing new table as linhas
  for each statement execute function public.fn_historico_espelho();
create trigger trg_historicos_espelho_del
  after delete on public.historicos
  referencing old table as linhas
  for each statement execute function public.fn_historico_espelho();

-- modelos_email
create trigger trg_modelos_email_alterado
  before update on public.modelos_email
  for each row execute function public.fn_set_alterado();
create trigger trg_modelos_email_auditoria
  after insert or update or delete on public.modelos_email
  for each row execute function public.fn_auditoria();

-- grupos_clifor (D5): recriados com `when` que ignora o espelho. Idempotente.
drop trigger if exists trg_grupos_clifor_alterado     on public.grupos_clifor;
drop trigger if exists trg_grupos_clifor_auditoria    on public.grupos_clifor;
drop trigger if exists trg_grupos_clifor_auditoria_upd on public.grupos_clifor;

create trigger trg_grupos_clifor_alterado
  before update on public.grupos_clifor
  for each row
  when ((to_jsonb(old) - array['ultimo_historico_em', 'ultimo_historico_id', 'alterado_em', 'alterado_por'])
        is distinct from
        (to_jsonb(new) - array['ultimo_historico_em', 'ultimo_historico_id', 'alterado_em', 'alterado_por']))
  execute function public.fn_set_alterado();

create trigger trg_grupos_clifor_auditoria
  after insert or delete on public.grupos_clifor
  for each row execute function public.fn_auditoria();

create trigger trg_grupos_clifor_auditoria_upd
  after update on public.grupos_clifor
  for each row
  when ((to_jsonb(old) - array['ultimo_historico_em', 'ultimo_historico_id', 'alterado_em', 'alterado_por'])
        is distinct from
        (to_jsonb(new) - array['ultimo_historico_em', 'ultimo_historico_id', 'alterado_em', 'alterado_por']))
  execute function public.fn_auditoria();


-- =====================================================================================
-- 6. BACKFILL DO ESPELHO (idempotente)
-- =====================================================================================
-- Hoje `historicos` acabou de nascer vazia: isto não toca linha nenhuma. Fica aqui para que o
-- arquivo, reaplicado sobre um banco com histórico carregado, deixe o espelho certo. Toca só
-- grupos cujo espelho difere, e (D5) não gera auditoria nem muda alterado_em.
select public.fn_historico_espelho_recalcular(
  array(select distinct h.grupo_clifor_id from public.historicos h));


-- =====================================================================================
-- 7. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7, §7.2, §7.3)
-- =====================================================================================
alter table public.modelos_email enable row level security;
alter table public.historicos    enable row level security;

revoke all on table public.modelos_email from anon;
revoke all on table public.historicos    from anon;

-- D1: append-only também no GRANT — a tentativa falha (42501) em vez de "0 linhas".
revoke update, delete, truncate on table public.historicos from authenticated;

-- ------------------------------------------------------------------------- modelos_email
create policy modelos_email_leitura on public.modelos_email
  for select to authenticated
  using ((select public.fn_usuario_ativo()));
create policy modelos_email_escrita on public.modelos_email
  for all to authenticated
  using ((select public.fn_usuario_ativo()) and (select public.fn_hierarquia()) = 1)
  with check ((select public.fn_usuario_ativo()) and (select public.fn_hierarquia()) = 1);

comment on policy modelos_email_escrita on public.modelos_email is
  'Nível DOMÍNIO (02 §7.2): só perfil 1 edita modelo. Auditado por trigger.';

-- ----------------------------------------------------------------------------- historicos
create policy historicos_leitura on public.historicos
  for select to authenticated
  using (
    (select public.fn_usuario_ativo())
    and ((select public.fn_pode_acessar_pagina('vendas'))
         or (select public.fn_pode_acessar_pagina('financeiro'))
         or (select public.fn_pode_acessar_pagina('cadastros'))
         or (select public.fn_pode_acessar_pagina('sac')))
  );

create policy historicos_insert on public.historicos
  for insert to authenticated
  with check (
    (select public.fn_usuario_ativo())
    and ((select public.fn_pode_acessar_pagina('vendas'))
         or (select public.fn_pode_acessar_pagina('financeiro'))
         or (select public.fn_pode_acessar_pagina('cadastros'))
         or (select public.fn_pode_acessar_pagina('sac')))
    and autor_id = (select auth.uid())
    and origem = 'manual'
    and email_id is null
    and cancelado_em is null and cancelado_por is null and cancelado_motivo is null
  );

comment on policy historicos_leitura on public.historicos is
  'Usuário ativo com vendas, financeiro, cadastros ou sac — as páginas que hospedam o painel e o '
  'pop.HistoricoConversas (D3 da 012). Sem sigilo por carteira: a spec não o impõe. '
  'NÃO há policy de update nem de delete (02 §7.3) e os dois estão revogados no GRANT.';
comment on policy historicos_insert on public.historicos is
  'Autor = quem insere, origem manual, sem cancelamento e sem e-mail (evento automático é do '
  'servidor). Correção só da própria linha ou por perfil 1 (historico.md §9.3) — checada no '
  'trigger fn_historico_regras, porque policy de historicos que lê historicos recursa (42P17).';


-- =====================================================================================
-- FIM da 012_historico.sql
-- =====================================================================================
-- CONFERÊNCIA
--   2 tabelas novas, 2 com RLS, 2 com `revoke all ... from anon`.
--   4 policies: modelos_email (leitura + escrita perfil 1), historicos (leitura + insert).
--   historicos: UPDATE/DELETE/TRUNCATE revogados de authenticated; trigger de imutabilidade
--   para todo papel.
--   grupos_clifor: +2 colunas de espelho (FK com índice); triggers alterado/auditoria recriados
--   com `when` (D5). email_outbox: FK de modelo_chave, com índice.
--   FKs indexadas: todas (conta_receber_id sem FK por ora, já indexada).
--   Funções novas: fn_historico_regras, fn_historico_imutavel (invoker, só trigger);
--   fn_historico_espelho, fn_historico_espelho_recalcular (DEFINER — escrevem só as 2 colunas
--   de espelho; execute revogado de anon/authenticated/public).
--   Nenhum dinheiro nesta migration. Nenhum seed. Nenhum segredo.
--
-- FICA PENDENTE
--   1. `alter table public.historicos add constraint historicos_conta_receber_id_fkey foreign
--      key (conta_receber_id) references public.contas_receber(id) on delete set null;` —
--      na primeira migration depois de 010 (contas_receber) e 012.
-- =====================================================================================
