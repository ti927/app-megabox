-- =====================================================================================
-- 008_proposta_pedido.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 5 de `specs/02-modelo-de-dados-proposto.md` §11 (e `specs/03-plano-de-construcao.md`
-- §6): colunas Proposta e Pedido do kanban, e a fila de e-mail — é a primeira fatia que envia
-- e-mail (§11: "email_outbox e integracao_tokens entram junto da primeira fatia que precisar
-- enviar e-mail (a 5)").
--
-- Escopo: §3.3 — `propostas`, `proposta_itens`, `pedidos`, `pedido_prazos`; §3.8 —
-- `email_outbox`, `email_anexos`. `integracao_tokens` JÁ EXISTE (001), com RLS e nenhuma
-- policy, e fica como está.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Cria as 6 tabelas (4 com §1.2 completo; `pedido_prazos` é ligação pura).
--   2. `proposta_itens` é SNAPSHOT (§1.6): o trigger copia do orçamento o que vier nulo, e
--      proíbe alterar o item depois que a proposta foi ENVIADA.
--   3. `pedidos`: trigger deriva `cotacao_id` da proposta, e preenche `cliente_id` e `numero`
--      a partir da cotação quando vierem nulos.
--   4. Índice em toda FK, o da fila de e-mail (`agendado_para where enviado_em is null`, §6).
--   5. `fn_set_alterado` nas 5 tabelas com `alterado_em`; `fn_auditoria` em `pedidos`.
--   6. RLS nas 6 tabelas. Ciclo comercial: mesma regra da 007 (vendas + hierarquia ≤ 2 ou
--      dono). Fila de e-mail: nível quase FECHADO (ver o bloco de RLS).
--
-- O QUE **NÃO** ENTRA AQUI
--   - `modelos_email` é da fatia 9 (02 §11). `email_outbox.modelo_chave` nasce text SEM FK; a
--     FK entra na migration da fatia 9.
--   - `email_outbox.cobranca_id` (fatia 7) e `email_outbox.entrega_id` (fatia 6, a 009): as
--     tabelas-alvo ainda não existem. A 009 acrescenta `entrega_id`; a fatia 7, `cobranca_id`.
--   - `v_kanban_pedidos`, `v_pedido_item_saldo`, `v_pedido_divergencia`: consultas de tela;
--     entram com a tela (a de saldo depende de `entregas`, da 009).
--   - Bucket de Storage para PDFs de proposta/pedido e OC: entra com a tela (a coluna guarda o
--     path — §1.8).
--   - Nenhum seed.
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU CONFLITAVA COM O MAPA <<<
--   D1. SNAPSHOT PREENCHIDO PELO BANCO. `02` §3.3 define os 4 valores de `proposta_itens` como
--       NOT NULL, sem dizer quem os copia. O trigger copia do orçamento o que chegar NULO
--       (qtd_venda, valor_venda_unit, valor_comissao_unit e o frete EFETIVO — só CIF Informado,
--       mesma regra D1 da 007). Assim a action só manda o orcamento_fornecedor_id e o retrato
--       não depende de a tela ter copiado certo. É o que bThFu fazia (copiar os vencedores).
--   D2. ITEM DE PROPOSTA ENVIADA É IMUTÁVEL. "A proposta enviada ao cliente é um documento" (02
--       §3.3). O trigger recusa UPDATE em `proposta_itens` quando `propostas.enviada`. DELETE
--       continua possível: é o que o cascade da cotação precisa.
--   D3. O ORÇAMENTO DO ITEM TEM DE SER DA MESMA COTAÇÃO DA PROPOSTA. O trigger recusa o
--       contrário. No Bubble a lista de cópias era livre.
--   D4. PEDIDO: `cotacao_id` DERIVADO DA PROPOSTA quando há proposta; `cliente_id` e `numero`
--       vindos da cotação quando nulos. `numero` = `CotacaoNum` como texto (bTbNB, `vendas.md`
--       §4.6). `02` §8.2: `numero` continua NÃO único (vendas [DÚVIDA 19]).
--   D5. `pedidos.etapa_id` default 3 ("Pedido", chave `pedido0`) — `vendas.md` [DÚVIDA 5]
--       ("presumo valor padrão Pedido"), mesma recomendação de `02` §3.3 para a cotação.
--   D6. LEITURA/ESCRITA DO PEDIDO: dono é quem tem `pedidos.vendedor_id` OU é o vendedor da
--       COTAÇÃO. `02` não diz; no Bubble `QualVendedor` do pedido é quem converteu (bTbNB), que
--       pode ser o gerente convertendo pela equipe — sem a segunda via, o vendedor da cotação
--       perderia de vista o próprio pedido.
--   D7. EMAIL_OUTBOX SEM ESCRITA PELO CLIENTE. Fila com remetente da empresa + destinatário e
--       corpo livres = relay aberto (`vendas.md` §7.4, o risco de `EnviarEmailsGeral`). Por
--       isso INSERT/UPDATE/DELETE são REVOGADOS de `authenticated` no GRANT: quem enfileira é a
--       server action com service_role, depois de validar sessão e tirar os destinatários do
--       banco; quem envia e marca `enviado_em` é o worker, também service_role. `authenticated`
--       só LÊ o que ele mesmo enfileirou (`criado_por`, que a action preenche) — para a tela
--       mostrar "enviado / erro" —, e perfil 1 lê tudo. Não é "sem policy" (que o advisor
--       acusa e que esconderia o status da tela): é leitura mínima + escrita só de servidor.
--   D8. `email_anexos` entra junto (02 §3.8 a define ao lado da fila); o prompt da fatia só
--       nomeava `email_outbox`, mas a fila sem anexo não manda o PDF da proposta.
--   D9. `proposta_itens.orcamento_fornecedor_id` é `on delete NO ACTION DEFERRABLE INITIALLY
--       DEFERRED`, não `restrict` (02 §3.3). Com RESTRICT — e também com NO ACTION imediato,
--       testado — apagar uma cotação com proposta FALHA: o cascade cotação → orçamentos é
--       checado antes de o cascade cotação → propostas → itens terminar. Adiada para o commit,
--       a checagem encontra os itens já apagados; apagar um orçamento que está numa proposta
--       continua recusado (no commit). Achado pelo
--       scripts/testar-rls-vendas.mjs na limpeza; corrigido no banco por `alter table ... drop
--       constraint / add constraint` com o mesmo nome, e aqui, para aplicar do zero igual.
--
-- ORDEM DOS BLOCOS: tabelas → índices → funções → triggers → RLS e policies.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. TABELAS
-- =====================================================================================

-- ----------------------------------------------------------------------------- propostas
create table public.propostas (
  id             uuid primary key default gen_random_uuid(),
  cotacao_id     uuid not null references public.cotacoes(id) on delete cascade,
  numero         integer not null,
  vendedor_id    uuid not null references public.usuarios(id),
  enviar_para_contato_id      uuid references public.contatos_clifor(id),
  faturar_para_endereco_id    uuid references public.enderecos_clifor(id),
  cnpj_fornecedor_endereco_id uuid references public.enderecos_clifor(id),
  condicao_pagamento text,
  info_adicional text,
  corpo_email    text,
  emails_copia   text,
  data_prev_entrega date,
  enviada        boolean not null default false,
  enviada_em     timestamptz,
  arquivo_path   text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  unique (cotacao_id, numero)
);

comment on table public.propostas is
  'Era Tbl.Propostas. A lista QuaisOrcamentosFornecedores vira proposta_itens, com SNAPSHOT dos '
  'valores (02 §1.6): no Bubble reabrir proposta antiga mostrava valores de hoje. '
  'Cotacao.QuaisPropostas não migra (§1.5).';
comment on column public.propostas.numero is
  'Sugerido = propostas da cotação + 1, editável (vendas.md §5.2). Exibido "CotacaoNum/numero". '
  'Único por cotação (02 §3.3). NA CARGA: se a base tiver número repetido na mesma cotação, o '
  'unique derruba a linha — medir antes, como em 04 §1.1.';
comment on column public.propostas.enviada is
  'Vira true só nas ações "…e Enviar" (bThFd / bTPhL). O Bubble mandava e-mail também no '
  '"Gravar" sem enviar (bTnvj0 não lê var_enviamailproposta_, vendas [DÚVIDA 1]); a regra nova '
  'enfileira e-mail só quando enviada. Com enviada = true os itens ficam imutáveis (D2).';
comment on column public.propostas.arquivo_path is
  'PDF em bucket PRIVADO (§1.8). Hoje é URL pública do CDN (vendas.md §7.6).';

-- ------------------------------------------------------------------------ proposta_itens
create table public.proposta_itens (
  id          uuid primary key default gen_random_uuid(),
  proposta_id uuid not null references public.propostas(id) on delete cascade,
  -- NO ACTION DEFERRABLE INITIALLY DEFERRED, e não RESTRICT como em 02 §3.3 (D9): mesmo
  -- efeito para quem apaga um orçamento avulso (recusado no commit), mas checado no FIM da
  -- transação — o que deixa o cascade da cotação apagar propostas e orçamentos juntos.
  orcamento_fornecedor_id uuid not null
              references public.orcamentos_fornecedor(id) on delete no action
              deferrable initially deferred,
  -- SNAPSHOT: valores praticados na proposta, não recalculam se o orçamento mudar depois
  qtd                 numeric(14,3) not null check (qtd > 0),
  valor_venda_unit    numeric(14,2) not null,
  valor_comissao_unit numeric(14,2) not null,
  valor_frete         numeric(14,2) not null,   -- sem default: o trigger copia (D1)
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  unique (proposta_id, orcamento_fornecedor_id)
);

comment on table public.proposta_itens is
  'SNAPSHOT proposital (02 §1.6): a proposta enviada é documento, e o que o cliente recebeu não '
  'muda depois. O trigger fn_proposta_item_snapshot copia do orçamento o que vier nulo (D1), '
  'exige que o orçamento seja da mesma cotação (D3) e recusa UPDATE com a proposta enviada (D2). '
  'NA CARGA: Propostas.QuaisOrcamentosFornecedores apontava para CÓPIAS de '
  'OrcFornecedoresCotacao (bThFu); cada cópia vira uma linha aqui com os valores dela.';
comment on column public.proposta_itens.valor_frete is
  'Frete EFETIVO do orçamento no momento: o valor só com CIF Informado, 0 nos outros tipos '
  '(mesma regra da coluna gerada da 007).';

-- ------------------------------------------------------------------------------- pedidos
create table public.pedidos (
  id            uuid primary key default gen_random_uuid(),
  numero        text not null,
  cotacao_id    uuid not null references public.cotacoes(id) on delete restrict,
  proposta_id   uuid references public.propostas(id) on delete restrict,
  cliente_id    uuid not null references public.grupos_clifor(id) on delete restrict,
  vendedor_id   uuid not null references public.usuarios(id),
  etapa_id      smallint not null default 3 references public.etapas(id),
  forma_pagamento_id smallint references public.formas_pagamento(id),
  ordem_compra_numero text,
  ordem_compra_path   text,
  arquivo_path        text,
  contato_cliente_id     uuid references public.contatos_clifor(id),
  contato_fornecedor_id  uuid references public.contatos_clifor(id),
  emails_copia_cliente    text,
  emails_copia_fornecedor text,
  corpo_email_cliente     text,
  corpo_email_fornecedor  text,
  info_adicional text,
  primeiro_fornecedor_endereco_id uuid references public.enderecos_clifor(id),
  formalizado    boolean not null default false,
  formalizado_em timestamptz,
  finalizado     boolean not null default false,
  finalizado_em  timestamptz,
  motivo_cancelamento   text,
  motivo_altera_valores text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.pedidos is
  'Era Tbl.Pedido (tbl_pedidos). A lista QuaisOrcamentosFonecedores NÃO migra: os itens do pedido '
  'são os proposta_itens da proposta (02 §3.3). QuaisEntregas também não (§1.5). '
  'Pedido.Importado (id cpo_pedidoenviado_boolean, campo REAPROVEITADO) não migra '
  '(rotinas [DÚVIDA 13]). Auditada por trigger.';
comment on column public.pedidos.numero is
  'Texto, como no Bubble (NumeroPedido = CotacaoNum como texto, bTbNB). NÃO é único: uma cotação '
  'pode gerar mais de um pedido? (vendas [DÚVIDA 19], 02 §8.2). Nulo na chegada → o trigger '
  'grava o número da cotação (D4).';
comment on column public.pedidos.cotacao_id is
  'Com proposta_id preenchido, DERIVADO da proposta pelo trigger (D4): o pedido não pode '
  'apontar para uma cotação e uma proposta de outra.';
comment on column public.pedidos.etapa_id is
  'Default 3 = "Pedido" (chave pedido0 — NÃO confundir com pedido = "Pedir", 003). No Bubble '
  'QualEtapa não é gravada na criação (vendas [DÚVIDA 5]).';
comment on column public.pedidos.forma_pagamento_id is
  'No Bubble o "Gravar formalizando" NÃO grava a forma de pagamento (bTcqV/bTcpk, vendas '
  '[DÚVIDA 4]). A action nova grava os MESMOS campos nas duas variantes (vendas.md §8.2).';
comment on column public.pedidos.ordem_compra_path is
  'OC em bucket PRIVADO (§1.8), nunca URL pública.';

-- ------------------------------------------------------------------------- pedido_prazos
create table public.pedido_prazos (
  pedido_id  uuid not null references public.pedidos(id) on delete cascade,
  prazo_id   smallint not null references public.prazos_recebimento(id),
  criado_em  timestamptz not null default now(),
  criado_por uuid references public.usuarios(id),
  primary key (pedido_id, prazo_id)
);

comment on table public.pedido_prazos is
  'Ligação pura Pedido.PrazoRecebComissoes (list.option) → prazos_recebimento (§1.5). Sem id nem '
  'bubble_id, como as ligações da 006: a pk composta é a idempotência da carga.';

-- --------------------------------------------------------------------------- email_outbox
create table public.email_outbox (
  id             uuid primary key default gen_random_uuid(),
  para           text not null,
  cc             text,
  bcc            text,
  assunto        text not null,
  corpo          text not null,
  responder_para text,
  remetente_nome text,
  modelo_chave   text,                 -- FK para modelos_email(chave) entra na fatia 9
  agendado_para  timestamptz not null default now(),
  enviado_em     timestamptz,
  erro           text,
  tentativas     smallint not null default 0,
  -- rastreabilidade: de onde saiu
  pedido_id      uuid references public.pedidos(id) on delete set null,
  proposta_id    uuid references public.propostas(id) on delete set null,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint tentativas_nao_negativas check (tentativas >= 0)
);

comment on table public.email_outbox is
  'Fila com worker, em vez de SendEmail no meio do workflow (02 §3.8). Substitui o contador '
  'diário de ConfigSistema[19] zerado por ResetContagemEmails (bUBmh). ESCRITA SÓ PELO SERVIDOR '
  '(service_role): insert/update/delete revogados de authenticated no GRANT, porque fila com '
  'destinatário e corpo livres é relay aberto (vendas.md §7.4). authenticated só lê o que '
  'enfileirou (D7). NUNCA guardar credencial aqui: SMTP é variável de ambiente (CLAUDE.md '
  'regra 4). Colunas entrega_id (009) e cobranca_id (fatia 7) entram com as tabelas-alvo.';
comment on column public.email_outbox.modelo_chave is
  'Chave de modelos_email (fatia 9). text SEM FK até lá; a FK entra na migration da fatia 9.';
comment on column public.email_outbox.criado_por is
  'Quem pediu o envio. A server action preenche (insere com service_role, então não há '
  'auth.uid() no banco). É por esta coluna que o usuário vê o status do que enviou.';

-- --------------------------------------------------------------------------- email_anexos
create table public.email_anexos (
  id           uuid primary key default gen_random_uuid(),
  email_id     uuid not null references public.email_outbox(id) on delete cascade,
  nome_arquivo text not null,
  path         text not null,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.email_anexos is
  'Anexos de uma mensagem da fila: caminho em bucket privado, lido pelo worker. Substitui os '
  'parâmetros anexo1..anexo10 e o `atachments` inexistente de EnviarEmailsGeral, que fazia o '
  'reenvio de proposta sair SEM o PDF (vendas [DÚVIDA 2]). Mesma política de escrita da fila.';


-- =====================================================================================
-- 2. ÍNDICES
-- =====================================================================================

-- propostas (a unique (cotacao_id, numero) cobre cotacao_id)
create index propostas_vendedor_idx       on public.propostas (vendedor_id);
create index propostas_contato_idx        on public.propostas (enviar_para_contato_id);
create index propostas_faturar_idx        on public.propostas (faturar_para_endereco_id);
create index propostas_cnpj_fornec_idx    on public.propostas (cnpj_fornecedor_endereco_id);
create index propostas_criado_por_idx     on public.propostas (criado_por);
create index propostas_alterado_por_idx   on public.propostas (alterado_por);

-- proposta_itens (a unique (proposta_id, orcamento_fornecedor_id) cobre proposta_id)
create index proposta_itens_orcamento_idx    on public.proposta_itens (orcamento_fornecedor_id);
create index proposta_itens_criado_por_idx   on public.proposta_itens (criado_por);
create index proposta_itens_alterado_por_idx on public.proposta_itens (alterado_por);

-- pedidos — o kanban filtra por período + vendedor + etapa + finalizado (vendas.md §3.2)
create index pedidos_kanban_idx       on public.pedidos (vendedor_id, criado_em desc)
  where not finalizado;
create index pedidos_vendedor_idx     on public.pedidos (vendedor_id);
create index pedidos_cotacao_idx      on public.pedidos (cotacao_id);
create index pedidos_proposta_idx     on public.pedidos (proposta_id);
create index pedidos_cliente_idx      on public.pedidos (cliente_id);
create index pedidos_etapa_idx        on public.pedidos (etapa_id, criado_em desc);
create index pedidos_forma_pgto_idx   on public.pedidos (forma_pagamento_id);
create index pedidos_contato_cli_idx  on public.pedidos (contato_cliente_id);
create index pedidos_contato_for_idx  on public.pedidos (contato_fornecedor_id);
create index pedidos_primeiro_for_idx on public.pedidos (primeiro_fornecedor_endereco_id);
create index pedidos_numero_idx       on public.pedidos (numero);
create index pedidos_criado_por_idx   on public.pedidos (criado_por);
create index pedidos_alterado_por_idx on public.pedidos (alterado_por);

-- pedido_prazos (a pk cobre pedido_id)
create index pedido_prazos_prazo_idx      on public.pedido_prazos (prazo_id);
create index pedido_prazos_criado_por_idx on public.pedido_prazos (criado_por);

-- email_outbox — §6: a fila é lida por "pendentes em ordem de agendamento"
create index email_outbox_pendentes_idx   on public.email_outbox (agendado_para)
  where enviado_em is null;
create index email_outbox_pedido_idx      on public.email_outbox (pedido_id);
create index email_outbox_proposta_idx    on public.email_outbox (proposta_id);
create index email_outbox_criado_por_idx  on public.email_outbox (criado_por, criado_em desc);
create index email_outbox_alterado_por_idx on public.email_outbox (alterado_por);

-- email_anexos
create index email_anexos_email_idx        on public.email_anexos (email_id);
create index email_anexos_criado_por_idx   on public.email_anexos (criado_por);
create index email_anexos_alterado_por_idx on public.email_anexos (alterado_por);


-- =====================================================================================
-- 3. FUNÇÕES DE TRIGGER (security invoker; ninguém as chama por RPC)
-- =====================================================================================

-- ------------------------------------------------------------- fn_proposta_item_snapshot
create function public.fn_proposta_item_snapshot()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_enviada          boolean;
  v_cotacao_proposta uuid;
  v_orc              record;
begin
  select p.enviada, p.cotacao_id into v_enviada, v_cotacao_proposta
  from public.propostas p where p.id = new.proposta_id;

  -- D2: item de proposta enviada não muda
  if tg_op = 'UPDATE' and v_enviada then
    raise exception 'Proposta já enviada: os itens são o documento que o cliente recebeu'
      using errcode = '55000';
  end if;

  select o.cotacao_id, o.qtd_venda, o.valor_venda_unit, o.valor_comissao_unit,
         case when o.tipo_frete_id = 2 then o.valor_frete else 0 end as frete
    into v_orc
  from public.orcamentos_fornecedor o where o.id = new.orcamento_fornecedor_id;

  -- D3: o orçamento tem de ser da cotação da proposta
  if v_orc.cotacao_id is distinct from v_cotacao_proposta then
    raise exception 'O orçamento % não pertence à cotação da proposta', new.orcamento_fornecedor_id
      using errcode = '23514';
  end if;

  -- D1: snapshot do que vier nulo
  if tg_op = 'INSERT' then
    new.qtd                 := coalesce(new.qtd, v_orc.qtd_venda);
    new.valor_venda_unit    := coalesce(new.valor_venda_unit, v_orc.valor_venda_unit);
    new.valor_comissao_unit := coalesce(new.valor_comissao_unit, v_orc.valor_comissao_unit);
    new.valor_frete         := coalesce(new.valor_frete, v_orc.frete);
  end if;

  return new;
end $$;

comment on function public.fn_proposta_item_snapshot() is
  'Trigger BEFORE INSERT OR UPDATE de proposta_itens: copia o retrato do orçamento no INSERT (o '
  'que vier nulo), exige orçamento da mesma cotação e recusa UPDATE com a proposta enviada. '
  'D1–D3 no cabeçalho da 008.';

-- ---------------------------------------------------------------------- fn_pedido_derivados
create function public.fn_pedido_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_cotacao record;
begin
  if new.proposta_id is not null then
    select p.cotacao_id into new.cotacao_id from public.propostas p where p.id = new.proposta_id;
  end if;

  if new.cliente_id is null or new.numero is null then
    select c.cliente_id, c.numero into v_cotacao from public.cotacoes c where c.id = new.cotacao_id;
    new.cliente_id := coalesce(new.cliente_id, v_cotacao.cliente_id);
    new.numero     := coalesce(new.numero, v_cotacao.numero::text);
  end if;

  return new;
end $$;

comment on function public.fn_pedido_derivados() is
  'Trigger BEFORE INSERT OR UPDATE de pedidos: cotacao_id vem da proposta (quando há); cliente_id '
  'e numero vêm da cotação quando nulos (bTbNB: NumeroPedido = CotacaoNum). D4 da 008.';

revoke execute on function public.fn_proposta_item_snapshot() from anon, authenticated, public;
revoke execute on function public.fn_pedido_derivados()       from anon, authenticated, public;


-- =====================================================================================
-- 4. TRIGGERS
-- =====================================================================================

create trigger trg_proposta_itens_snapshot
  before insert or update on public.proposta_itens
  for each row execute function public.fn_proposta_item_snapshot();

create trigger trg_pedidos_derivados
  before insert or update on public.pedidos
  for each row execute function public.fn_pedido_derivados();

create trigger trg_propostas_alterado
  before update on public.propostas
  for each row execute function public.fn_set_alterado();
create trigger trg_proposta_itens_alterado
  before update on public.proposta_itens
  for each row execute function public.fn_set_alterado();
create trigger trg_pedidos_alterado
  before update on public.pedidos
  for each row execute function public.fn_set_alterado();
create trigger trg_email_outbox_alterado
  before update on public.email_outbox
  for each row execute function public.fn_set_alterado();
create trigger trg_email_anexos_alterado
  before update on public.email_anexos
  for each row execute function public.fn_set_alterado();

-- O pedido carrega forma de pagamento, motivo de cancelamento e de alteração de valores: é a
-- trilha que hoje não existe (vendas.md §7.5).
create trigger trg_pedidos_auditoria
  after insert or update or delete on public.pedidos
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 5. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7 e §7)
-- =====================================================================================
-- Ciclo comercial: a regra da 007 — página `vendas` + (hierarquia ≤ 2 OU dono). Filhos herdam
-- a LEITURA pelo `exists` que passa pela RLS do pai, e a ESCRITA pela condição de dono escrita
-- por extenso (a 009 soma leitura ao vendedor substituto, que lê mas não reescreve).
-- Fila de e-mail: D7.

alter table public.propostas      enable row level security;
alter table public.proposta_itens enable row level security;
alter table public.pedidos        enable row level security;
alter table public.pedido_prazos  enable row level security;
alter table public.email_outbox   enable row level security;
alter table public.email_anexos   enable row level security;

revoke all on table public.propostas      from anon;
revoke all on table public.proposta_itens from anon;
revoke all on table public.pedidos        from anon;
revoke all on table public.pedido_prazos  from anon;
revoke all on table public.email_outbox   from anon;
revoke all on table public.email_anexos   from anon;

-- ----------------------------------------------------------------------------- propostas
create policy propostas_leitura on public.propostas
  for select to authenticated
  using (exists (select 1 from public.cotacoes c where c.id = cotacao_id));
create policy propostas_escrita on public.propostas
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

comment on policy propostas_leitura on public.propostas is
  'Herda da cotação (RLS de cotacoes no subselect). No Bubble Propostas era a ÚNICA tabela do '
  'ciclo fechada para anônimo (vendas.md §7.1).';

-- ------------------------------------------------------------------------ proposta_itens
create policy proposta_itens_leitura on public.proposta_itens
  for select to authenticated
  using (exists (select 1 from public.propostas p where p.id = proposta_id));
create policy proposta_itens_escrita on public.proposta_itens
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.propostas p
      join public.cotacoes c on c.id = p.cotacao_id
      where p.id = proposta_id
        and ((select public.fn_hierarquia()) <= 2 or c.vendedor_id = (select auth.uid()))
    )
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.propostas p
      join public.cotacoes c on c.id = p.cotacao_id
      where p.id = proposta_id
        and ((select public.fn_hierarquia()) <= 2 or c.vendedor_id = (select auth.uid()))
    )
  );

-- ------------------------------------------------------------------------------- pedidos
create policy pedidos_leitura on public.pedidos
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and (
      (select public.fn_hierarquia()) <= 2
      or vendedor_id = (select auth.uid())
      or exists (select 1 from public.cotacoes c
                 where c.id = cotacao_id and c.vendedor_id = (select auth.uid()))
    )
  );
create policy pedidos_escrita on public.pedidos
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and (
      (select public.fn_hierarquia()) <= 2
      or vendedor_id = (select auth.uid())
      or exists (select 1 from public.cotacoes c
                 where c.id = cotacao_id and c.vendedor_id = (select auth.uid()))
    )
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and (
      (select public.fn_hierarquia()) <= 2
      or vendedor_id = (select auth.uid())
      or exists (select 1 from public.cotacoes c
                 where c.id = cotacao_id and c.vendedor_id = (select auth.uid()))
    )
  );

comment on policy pedidos_leitura on public.pedidos is
  'Página vendas + (hierarquia ≤ 2, OU vendedor do pedido, OU vendedor da cotação — D6). A 009 '
  'soma o vendedor substituto de alguma entrega do pedido. "Editar produtos do pedido só por '
  'quem criou ou pelo Diretor" (vendas.md §1) fica na server action.';

-- ------------------------------------------------------------------------- pedido_prazos
create policy pedido_prazos_leitura on public.pedido_prazos
  for select to authenticated
  using (exists (select 1 from public.pedidos p where p.id = pedido_id));
create policy pedido_prazos_escrita on public.pedido_prazos
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.pedidos p
      where p.id = pedido_id
        and ((select public.fn_hierarquia()) <= 2
             or p.vendedor_id = (select auth.uid())
             or exists (select 1 from public.cotacoes c
                        where c.id = p.cotacao_id and c.vendedor_id = (select auth.uid())))
    )
  )
  with check (
    (select public.fn_pode_acessar_pagina('vendas'))
    and exists (
      select 1 from public.pedidos p
      where p.id = pedido_id
        and ((select public.fn_hierarquia()) <= 2
             or p.vendedor_id = (select auth.uid())
             or exists (select 1 from public.cotacoes c
                        where c.id = p.cotacao_id and c.vendedor_id = (select auth.uid())))
    )
  );

-- --------------------------------------------------------------- email_outbox / anexos (D7)
revoke insert, update, delete, truncate on table public.email_outbox from authenticated;
revoke insert, update, delete, truncate on table public.email_anexos from authenticated;

create policy email_outbox_leitura on public.email_outbox
  for select to authenticated
  using (
    (select public.fn_usuario_ativo())
    and (criado_por = (select auth.uid()) or (select public.fn_hierarquia()) = 1)
  );
create policy email_anexos_leitura on public.email_anexos
  for select to authenticated
  using (exists (select 1 from public.email_outbox e where e.id = email_id));

comment on policy email_outbox_leitura on public.email_outbox is
  'Lê o que enfileirou (criado_por), e perfil 1 lê tudo. Escrita NÃO tem policy e está revogada '
  'no GRANT: só service_role (server action que enfileira, worker que envia). Ver D7 da 008.';


-- =====================================================================================
-- FIM da 008_proposta_pedido.sql
-- =====================================================================================
-- CONFERÊNCIA
--   6 tabelas, 6 com RLS, 6 com `revoke all ... from anon`.
--   10 policies: leitura + escrita em propostas, proposta_itens, pedidos, pedido_prazos;
--   SÓ leitura em email_outbox e email_anexos (escrita revogada no GRANT de authenticated).
--   Dinheiro: numeric(14,2); quantidade numeric(14,3). Nenhum float.
--   FKs indexadas: todas.
--   Funções novas: fn_proposta_item_snapshot, fn_pedido_derivados — security invoker, só
--   trigger, execute revogado de anon/authenticated. Nenhuma security definer nova.
--   Triggers: 2 derivados, 5 fn_set_alterado, 1 fn_auditoria (pedidos).
--   integracao_tokens: intocada (001). Nenhum seed. Nenhum segredo.
-- =====================================================================================
