-- =====================================================================================
-- 019_email.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- O ENVIO da fila de e-mail. A fila (`email_outbox` + `email_anexos`) nasceu na 008 (D7: só
-- service_role escreve), ganhou `entrega_id` na 009, `cobranca_id`/`recibo_id` na 010 e a FK de
-- `modelo_chave` na 012. Faltava o que faz uma linha virar e-mail enviado UMA vez só.
--
-- Conferido no banco antes de escrever: `email_outbox` já tem `enviado_em`, `erro`, `tentativas`
-- e `agendado_para`. Faltam: estado explícito, próxima tentativa, trava (lease) do worker, id
-- do provedor. O índice `email_outbox_pendentes_idx` (agendado_para where enviado_em is null)
-- deixa de servir à consulta do worker e é trocado.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Colunas novas em `email_outbox`: status, proximo_envio_em, travado_ate, lote_id,
--      ultima_tentativa_em, provedor, provedor_id. Backfill do status pelo enviado_em.
--   2. CHECKs de coerência (status válido; enviado ⇔ enviado_em; enviando ⇔ trava).
--   3. Índices da fila (pendentes por vencimento; travas vencidas) e unique do id do provedor.
--   4. `fn_email_outbox_guarda` (trigger): e-mail ENVIADO é imutável, e o conteúdo não muda
--      depois da primeira tentativa (a chave de idempotência do provedor é o id da linha).
--   5. `fn_email_pegar_lote(...)`: pega lote com `for update skip locked`, marca a tentativa e
--      devolve as linhas. Executável SÓ por service_role.
--   6. `fn_email_enfileirar(jsonb, jsonb)`: insere mensagem + anexos numa transação (o worker
--      nunca vê a mensagem sem os anexos). Executável SÓ por service_role.
--
-- >>> DECISÕES <<<
--   D1. ESTADOS: pendente → enviando → enviado | registrado | falhou (e cancelado, manual).
--       `registrado` é o resultado do provedor `registro` (EMAIL_MODO ≠ envio): a mensagem foi
--       processada e LOGADA, não enviada. É estado próprio, e não `enviado`, para que ligar o
--       envio de verdade não esconda que aquelas mensagens nunca saíram; voltar uma linha
--       `registrado` para `pendente` é permitido (service_role), `enviado` para qualquer coisa não.
--   D2. `proximo_envio_em` NULO = vale `agendado_para`. A fila ordena por
--       coalesce(proximo_envio_em, agendado_para). O backoff (lib/email/backoff.ts) só grava
--       proximo_envio_em; agendado_para continua dizendo quando foi pedido.
--   D3. TRAVA (lease), não lock longo. O lote é marcado `enviando` com `travado_ate` e `lote_id`
--       numa transação curta; o envio HTTP acontece FORA da transação. Duas chamadas simultâneas
--       não pegam a mesma linha (skip locked + recheck do WHERE pelo Postgres na linha travada).
--       Se o worker morrer no meio, a trava vence e a linha volta a ser elegível — e aí o
--       provedor recebe a MESMA chave de idempotência (o id da linha), então não duplica.
--       O resultado só é gravado se `lote_id` ainda for o do lote (quem perdeu a trava não
--       sobrescreve quem a pegou).
--   D4. LIMITE DE TENTATIVAS vem do chamador (p_max_tentativas, default 5). Trava vencida que
--       já esgotou tentativas vira `falhou` em vez de ser pega de novo.
--   D5. SEM função definer: as duas funções são `security invoker` e o execute é SÓ do
--       service_role (specs/05 §2: definer executável por authenticated é proibido; aqui nem
--       invoker executável por authenticated existe). O relay aberto continua fechado pela
--       008 (D7): authenticated não insere na fila.
--   D6. Conteúdo congelado depois da 1ª tentativa: reenviar com a mesma chave de idempotência e
--       outro conteúdo seria recusado pelo provedor, e o registro deixaria de ser o que saiu.
--
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. COLUNAS
-- =====================================================================================
alter table public.email_outbox
  add column status              text not null default 'pendente',
  add column proximo_envio_em    timestamptz,
  add column travado_ate         timestamptz,
  add column lote_id             uuid,
  add column ultima_tentativa_em timestamptz,
  add column provedor            text,
  add column provedor_id         text;

-- Backfill: o que a fila já marcou como enviado continua enviado.
update public.email_outbox set status = 'enviado' where enviado_em is not null;

alter table public.email_outbox
  add constraint status_valido check (status in
    ('pendente', 'enviando', 'enviado', 'registrado', 'falhou', 'cancelado')),
  add constraint enviado_coerente check ((status = 'enviado') = (enviado_em is not null)),
  add constraint enviando_com_trava check (
    status <> 'enviando' or (travado_ate is not null and lote_id is not null));

comment on column public.email_outbox.status is
  'pendente → enviando → enviado | registrado | falhou; cancelado é manual. registrado = '
  'processado pelo provedor `registro` (EMAIL_MODO ≠ envio): logado, NÃO enviado (D1 da 019).';
comment on column public.email_outbox.proximo_envio_em is
  'Próxima tentativa (backoff). Nulo = vale agendado_para (D2 da 019).';
comment on column public.email_outbox.travado_ate is
  'Trava do worker: até quando a linha `enviando` pertence ao lote lote_id (D3 da 019).';
comment on column public.email_outbox.lote_id is
  'Lote que está com a linha. O resultado só é gravado com este lote_id (D3 da 019).';
comment on column public.email_outbox.provedor is
  'resend | registro. Quem processou a última tentativa.';
comment on column public.email_outbox.provedor_id is
  'Id da mensagem no provedor (Resend: data.id). Único por provedor.';


-- =====================================================================================
-- 2. ÍNDICES
-- =====================================================================================
drop index public.email_outbox_pendentes_idx;

create index email_outbox_fila_idx on public.email_outbox
  (coalesce(proximo_envio_em, agendado_para), id) where status = 'pendente';
create index email_outbox_travados_idx on public.email_outbox (travado_ate)
  where status = 'enviando';
create index email_outbox_status_idx on public.email_outbox (status, criado_em desc);
create unique index email_outbox_provedor_id_uq on public.email_outbox (provedor, provedor_id)
  where provedor_id is not null;


-- =====================================================================================
-- 3. GUARDA (trigger)
-- =====================================================================================
create function public.fn_email_outbox_guarda()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if old.status = 'enviado' and (
       new.status is distinct from old.status
       or new.enviado_em is distinct from old.enviado_em
       or new.provedor_id is distinct from old.provedor_id
       or new.provedor is distinct from old.provedor) then
    raise exception 'E-mail já enviado não muda de estado (id %)', old.id
      using errcode = '55000';
  end if;

  if old.tentativas > 0 and (
       new.para is distinct from old.para
       or new.cc is distinct from old.cc
       or new.bcc is distinct from old.bcc
       or new.assunto is distinct from old.assunto
       or new.corpo is distinct from old.corpo
       or new.responder_para is distinct from old.responder_para
       or new.remetente_nome is distinct from old.remetente_nome) then
    raise exception 'Conteúdo do e-mail congelado depois da primeira tentativa (id %)', old.id
      using errcode = '55000';
  end if;

  return new;
end $$;

comment on function public.fn_email_outbox_guarda() is
  'Trigger BEFORE UPDATE de email_outbox: enviado é final; conteúdo congelado após a 1ª '
  'tentativa (D1 e D6 da 019).';

revoke execute on function public.fn_email_outbox_guarda() from public, anon, authenticated;

create trigger trg_email_outbox_guarda
  before update on public.email_outbox
  for each row execute function public.fn_email_outbox_guarda();


-- =====================================================================================
-- 4. PEGAR LOTE (worker)
-- =====================================================================================
create function public.fn_email_pegar_lote(
  p_limite          integer default 10,
  p_trava_segundos  integer default 600,
  p_max_tentativas  integer default 5,
  p_ids             uuid[]  default null
)
  returns setof public.email_outbox
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_lote uuid := gen_random_uuid();
begin
  if p_limite is null or p_limite < 1 or p_limite > 100 then
    raise exception 'p_limite fora de 1..100' using errcode = '22023';
  end if;
  if p_trava_segundos is null or p_trava_segundos < 30 or p_trava_segundos > 3600 then
    raise exception 'p_trava_segundos fora de 30..3600' using errcode = '22023';
  end if;
  if p_max_tentativas is null or p_max_tentativas < 1 or p_max_tentativas > 20 then
    raise exception 'p_max_tentativas fora de 1..20' using errcode = '22023';
  end if;

  -- D4: trava vencida que já gastou todas as tentativas não volta à fila.
  update public.email_outbox e
     set status = 'falhou', travado_ate = null, lote_id = null,
         erro = 'tentativa interrompida (trava vencida) e limite de tentativas atingido'
   where e.status = 'enviando'
     and e.travado_ate < now()
     and e.tentativas >= p_max_tentativas
     and (p_ids is null or e.id = any (p_ids));

  return query
  with alvo as (
    select e.id
      from public.email_outbox e
     where (   (e.status = 'pendente' and coalesce(e.proximo_envio_em, e.agendado_para) <= now())
            or (e.status = 'enviando' and e.travado_ate < now()))
       and e.tentativas < p_max_tentativas
       and (p_ids is null or e.id = any (p_ids))
     order by coalesce(e.proximo_envio_em, e.agendado_para), e.id
     limit p_limite
       for update skip locked
  )
  update public.email_outbox e
     set status              = 'enviando',
         lote_id             = v_lote,
         travado_ate         = now() + make_interval(secs => p_trava_segundos),
         tentativas          = e.tentativas + 1,
         ultima_tentativa_em = now(),
         erro = case when e.status = 'enviando'
                     then 'tentativa anterior interrompida (trava vencida)'
                     else e.erro end
    from alvo
   where e.id = alvo.id
  returning e.*;
end $$;

comment on function public.fn_email_pegar_lote(integer, integer, integer, uuid[]) is
  'Worker da fila: pega até p_limite linhas vencidas (pendente, ou enviando com trava vencida) '
  'com FOR UPDATE SKIP LOCKED, marca enviando + lote_id + trava + tentativa, e devolve. '
  'p_ids restringe a ids (reenvio pontual, teste). SÓ service_role (D5 da 019).';

revoke execute on function public.fn_email_pegar_lote(integer, integer, integer, uuid[])
  from public, anon, authenticated;
grant execute on function public.fn_email_pegar_lote(integer, integer, integer, uuid[])
  to service_role;


-- =====================================================================================
-- 5. ENFILEIRAR (mensagem + anexos numa transação)
-- =====================================================================================
create function public.fn_email_enfileirar(p_email jsonb, p_anexos jsonb default '[]'::jsonb)
  returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_id uuid;
  r    public.email_outbox;
begin
  r := jsonb_populate_record(null::public.email_outbox, p_email);

  if nullif(btrim(r.para), '') is null or nullif(btrim(r.assunto), '') is null
     or nullif(btrim(r.corpo), '') is null then
    raise exception 'para, assunto e corpo são obrigatórios' using errcode = '23502';
  end if;
  if r.criado_por is null then
    raise exception 'criado_por é obrigatório: é por ele que o usuário vê o status'
      using errcode = '23502';
  end if;

  -- Só as colunas de conteúdo e vínculo: estado, tentativas e trava nascem do default.
  insert into public.email_outbox (
    para, cc, bcc, assunto, corpo, responder_para, remetente_nome, modelo_chave,
    agendado_para, pedido_id, proposta_id, entrega_id, cobranca_id, recibo_id, criado_por)
  values (
    r.para, r.cc, r.bcc, r.assunto, r.corpo, r.responder_para, r.remetente_nome, r.modelo_chave,
    coalesce(r.agendado_para, now()), r.pedido_id, r.proposta_id, r.entrega_id, r.cobranca_id,
    r.recibo_id, r.criado_por)
  returning id into v_id;

  insert into public.email_anexos (email_id, nome_arquivo, path, criado_por)
  select v_id, a.nome_arquivo, a.path, r.criado_por
    from jsonb_to_recordset(coalesce(p_anexos, '[]'::jsonb)) as a(nome_arquivo text, path text);

  return v_id;
end $$;

comment on function public.fn_email_enfileirar(jsonb, jsonb) is
  'Enfileira mensagem + anexos na MESMA transação (o worker nunca pega a mensagem sem o PDF). '
  'Chamada pela server action via lib/email/enfileirar.ts, depois de validar sessão e tirar '
  'destinatários do banco. SÓ service_role (D5 da 019; relay aberto: D7 da 008).';

revoke execute on function public.fn_email_enfileirar(jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.fn_email_enfileirar(jsonb, jsonb) to service_role;


-- =====================================================================================
-- FIM da 019_email.sql
-- =====================================================================================
-- CONFERÊNCIA
--   0 tabelas novas; 7 colunas em email_outbox, 3 CHECKs, 4 índices (1 trocado).
--   Funções: fn_email_outbox_guarda (trigger), fn_email_pegar_lote, fn_email_enfileirar —
--   todas security invoker; execute revogado de public/anon/authenticated; as duas de RPC
--   só com service_role. Nenhuma security definer nova. RLS e GRANTs da 008 intocados.
-- =====================================================================================
