-- =====================================================================================
-- 013_sac.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 10 de `specs/02-modelo-de-dados-proposto.md` §11 (SAC + formulários públicos).
-- Não depende de 010/011 (financeiro, metas — escritas em paralelo). Depende de 003 (listas
-- `sac_tipos_ocorrencia`, `sac_prioridades`, `sac_status`, `tipos_pesquisa`, que JÁ existem),
-- 006, 008 (`pedidos`, `email_outbox`), 009 (`entregas`) e 012.
--
-- Escopo: §3.6 — `sac_protocolos`, `sac_protocolo_entregas`, `sac_interacoes`, `pesquisas`,
-- `pesquisa_convites`, `pesquisa_respostas`; mais `sac_protocolo_anexos` (sac.md §8.4/§9.5);
-- de §5, `fn_nps`.
--
-- Fonte no mapa (via `specs/paginas/sac.md` e `formularios-publicos.md`): `Tbl.SacProtocolo`
-- (tbl_sac; criar bUDKj0/bUDKp0, editar bUDSx, "excluir" bUEFh2), `Tbl.SacHistorico` (bUDth),
-- `Tbl.PesquisaNps` (bUDPr), `Tbl.PesquisaRespostas` (tbl_pesquisaposvenda; convite bUDcW,
-- e-mail NPS bUDzn, e-mail pós-venda bUEjU/bUESz, gravação pública bUDhU e bUEHr0/bUEjf).
--
-- >>> FORMULÁRIOS PÚBLICOS: A DECISÃO DE SEGURANÇA DESTA MIGRATION <<<
-- Hoje o link da pesquisa é `formularionps?id=<_id do registro>` / `formulariovenda?id=<_id do
-- cliente>&pdd…`: sem token, sem prazo, sem uso único, com a Data API aberta — qualquer um
-- lista os ids e responde por qualquer cliente, em massa (specs/00-achados-de-seguranca.md
-- §2.5; formularios-publicos.md §7). O desenho novo:
--   * NENHUMA tabela tem policy para `anon`, e `anon` não tem GRANT em nenhuma. O cliente final
--     NUNCA fala com o Postgres: fala com a server action (Next.js, gru1), que usa service_role
--     só no servidor (CLAUDE.md regra 4). Não existe `policy ... to anon for insert`.
--   * O link carrega um TOKEN de 32 bytes aleatórios (`extensions.gen_random_bytes`, 256 bits),
--     em base64url (43 caracteres). O banco guarda SÓ o `sha256` do token (`token_hash bytea`,
--     unique). O token em claro existe apenas na volta de `fn_pesquisa_emitir_token` — que a
--     server action põe no e-mail e descarta — e no e-mail do cliente.
--   * `token_hash` NÃO é legível por `authenticated` (GRANT de coluna exclui a coluna), e nem o
--     hash revela o token.
--   * Validade: `expira_em` (padrão 30 dias, formularios-publicos [DÚVIDA 11]). Uso único:
--     `usado_em` + `unique (convite_id)` em respostas. Reenvio gera token NOVO e o antigo morre
--     ([DÚVIDA 12]): o hash é substituído na mesma linha.
--   * A resposta entra por `fn_pesquisa_responder(token, …)`, executável SÓ por service_role:
--     numa transação, com `select … for update` do convite, valida existência, cancelamento,
--     prazo e uso, grava a resposta e marca `usado_em`. Token inválido e convite cancelado
--     devolvem o MESMO código (`invalido`): a página não confirma existência de convite.
--   * Vendedor e pedido vêm do CONVITE (derivados do pedido por trigger), nunca da URL — some o
--     `&pdd` quebrado (formularios-publicos [DÚVIDA 1]).
--   * Limite de tentativas por IP é da server action (formularios-publicos §7.4.5); o banco
--     conta as tentativas falhas por convite (`tentativas`).
--
-- O QUE ESTA MIGRATION FAZ
--   1. 7 tabelas; `sac_protocolos` com número por identity e `tempo_resolucao` gerado.
--   2. Triggers: regras do protocolo (fechado_em pelo status, exclusão só perfil 1, filial do
--      cliente); interações append-only; convite deriva vendedor/cliente do pedido.
--   3. Funções: `fn_pesquisa_emitir_token`, `fn_pesquisa_responder` (só service_role),
--      `fn_nps` (authenticated, security invoker).
--   4. Índice em toda FK e os de sac.md §8.4.
--   5. `fn_set_alterado` nas 4 com alterado_em; `fn_auditoria` em `sac_protocolos`.
--   6. RLS nas 7. `anon`: nenhuma policy, nenhum GRANT.
--
-- O QUE **NÃO** ENTRA AQUI
--   - `emails_recebidos` (leitor de Gmail, sac.md §8.4/[DÚVIDA 15]): entra com a sincronização
--     no servidor; hoje é leitura direta da API no navegador.
--   - Views de tela (`vw_sac_chamados_lista`, `vw_sac_indicadores`, `vw_clientes_pesquisaveis`,
--     `vw_pos_venda_respostas`): entram com a tela.
--   - A campanha permanente de Pós-Venda (`pesquisas` com tipo 3): criada pela server action
--     `criarConvitePosVenda` (acha-ou-cria) ou pela carga. Nenhum seed.
--   - Bucket de Storage dos anexos do chamado: entra com a tela (a coluna guarda o path, §1.8).
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU CONFLITAVA COM O MAPA <<<
--   D1. EXCLUSÃO LÓGICA COM QUEM/QUANDO/POR QUÊ, NO LUGAR DE `ativo`. 02 §3.6 põe `ativo boolean`;
--       o Bubble usa `Ativo` de TRÊS estados (vazio = vivo, false = excluído) e a busca vaza os
--       excluídos em todo filtro (sac.md §3.1, §4.10, [DÚVIDA 4]). sac.md §8.4 pede
--       `excluido_em/excluido_por/motivo`. Adotado o da spec de página: é o mesmo dado com a
--       trilha que falta. Só perfil 1 exclui ou desfaz (trigger; [DÚVIDA 5]: "excluir só
--       Diretoria"). DELETE físico revogado. NA CARGA: `Ativo = false` → excluido_em = Modified
--       Date e motivo "(excluído no Bubble)".
--   D2. NÚMERO POR IDENTITY. Hoje é `last_element + 1` no navegador, de busca sem ordenação
--       (bUDKp0) — duas abas, mesmo número. `generated by default` para a carga poder gravar o
--       número do Bubble. NA CARGA: depois de carregar, `select setval(pg_get_serial_sequence(
--       'public.sac_protocolos','numero'), (select max(numero) from public.sac_protocolos));`.
--   D3. `fechado_em` DERIVADO DO STATUS. Entrar em 4 "Resolvido" (003) grava now(); sair limpa
--       ([DÚVIDA 14]); continuar resolvido preserva. `aberto_em` sempre na criação ([DÚVIDA 13]).
--       `tempo_resolucao` é coluna gerada (02 §3.6). Id literal 4: check/trigger sem subconsulta,
--       como o D3 da 009.
--   D4. QUEM VÊ E QUEM MEXE NO CHAMADO. A página `sac` é pré-requisito de tudo. Perfil 1 vê e
--       altera todos; os demais veem o chamado em que são RESPONSÁVEIS (é a condicional 4 da
--       tabela bUClt: "perfil ≠ Diretor → QualResponsável = CurrentUser") ou que ELES abriram
--       (sem isso quem abre para outro responsável perde o chamado ao gravar). Alterar: perfil 1
--       ou o responsável ([DÚVIDA 5]). Abrir: quem tem a página. O Bubble usa "Diretor" (=1),
--       não "hierarquia ≤ 2" — o mapa manda.
--   D5. INTERAÇÕES APPEND-ONLY. Mesma regra de historicos (012 D1): insert com autor =
--       auth.uid(), sem update/delete para o usuário. O servidor só pode preencher `email_id`
--       (uma vez) depois de enfileirar o aviso ao cliente. Com `visivel_cliente` o usuário tem de
--       escolher o contato (sac.md §4.5: hoje o e-mail sai para destinatário vazio).
--   D6. NOTAS EM COLUNAS FIXAS, COMO 02 §3.6 — e SEM `nota_entrega`. formularios-publicos
--       [DÚVIDA 8] recomenda itens por pergunta; 02 (o contrato do banco) arbitrou colunas, e a
--       fatia segue 02. `nota_entrega` sai: nenhum ponto do mapa grava nem lê `cpo.NotaEntrega`
--       (formularios-publicos §8.1: "não migrar"). Acrescentam-se `ip_hash`/`user_agent` (§7.4.7)
--       e o limite de 2.000 caracteres no comentário (§7.4.6).
--   D7. CONVITE SÓ PELO SERVIDOR. Todo convite nasce com token e todo envio enfileira e-mail —
--       as duas coisas são do servidor. `authenticated` só LÊ o convite (sem a coluna do hash);
--       criar, reenviar, cancelar ("remover convidado", bloqueado se respondido — sac.md
--       [DÚVIDA 8]) são server actions com service_role, como a fila de e-mail (008 D7). O
--       `token_hash` nasce com o hash de bytes aleatórios que ninguém conhece (convite INERTE até
--       `fn_pesquisa_emitir_token`).
--   D8. `envios` NO LUGAR DO `tentativas` AMBÍGUO DE 02. 02 lista `enviado_em` e `tentativas`;
--       sac.md §8.4 pede `convite_enviado_em + convites_enviados`. Ficam as duas coisas com nome
--       próprio: `envios` (quantas vezes o convite foi emitido/enviado) e `tentativas`
--       (respostas RECUSADAS contra este convite — expirado, já usado, dado inválido).
--   D9. SEM UNIQUE (pesquisa, cliente). sac.md §8.4 o pede para o NPS, mas o pós-venda tem um
--       convite por PEDIDO do mesmo cliente na mesma campanha, e a base do Bubble não foi medida
--       (04 §1.1: unique não medido derruba a carga). Índice comum; a server action checa.
--   D10. `fn_nps` segue formularios-publicos §5: promotor 9–10, neutro 7–8, detrator 0–6,
--       NPS = round(100 × (P − D) / respondidas), inteiro; média em numeric(4,2) ao lado, para a
--       comparação com o número de hoje ([DÚVIDA 6], sac [DÚVIDA 7]). Período opcional.
--
-- ORDEM DOS BLOCOS: tabelas → índices → funções → triggers → RLS e policies.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. TABELAS
-- =====================================================================================

-- ------------------------------------------------------------------------ sac_protocolos
create table public.sac_protocolos (
  id              uuid primary key default gen_random_uuid(),
  numero          integer generated by default as identity unique,
  grupo_clifor_id uuid not null references public.grupos_clifor(id) on delete restrict,
  filial_id       uuid references public.enderecos_clifor(id),
  pedido_id       uuid references public.pedidos(id),
  responsavel_id  uuid references public.usuarios(id),
  tipo_ocorrencia_id smallint not null references public.sac_tipos_ocorrencia(id),
  prioridade_id   smallint not null references public.sac_prioridades(id),
  status_id       smallint not null default 1 references public.sac_status(id),
  descricao       text not null,
  aberto_em       timestamptz not null default now(),
  fechado_em      timestamptz,
  tempo_resolucao interval generated always as (fechado_em - aberto_em) stored,
  excluido_em     timestamptz,
  excluido_por    uuid references public.usuarios(id),
  excluido_motivo text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint descricao_nao_vazia check (btrim(descricao) <> ''),
  -- D3: 4 = 'resolvido' (003). Check não aceita subconsulta.
  constraint fechado_so_resolvido check (fechado_em is null or status_id = 4),
  constraint exclusao_com_motivo check (
    excluido_em is null or nullif(btrim(excluido_motivo), '') is not null)
);

comment on table public.sac_protocolos is
  'Era Tbl.SacProtocolo (tbl_sac). QuaisEntregas vira sac_protocolo_entregas; Anexos (list.file) '
  'vira sac_protocolo_anexos. Tbl.Chamado NÃO migra (02 §9). Exclusão lógica com trilha (D1 da '
  '013). Auditada por trigger. RLS: página sac + (perfil 1, responsável ou quem abriu) — D4.';
comment on column public.sac_protocolos.numero is
  'Identity (D2). Era NumeroProtocoloNum = last_element + 1 no navegador (bUDKp0). NA CARGA: '
  'setval depois de carregar.';
comment on column public.sac_protocolos.fechado_em is
  'Derivado do status pelo trigger (D3): entra em Resolvido → now(); sai → nulo. Hoje nada '
  'desfaz DataFechado (sac.md [DÚVIDA 14]).';
comment on column public.sac_protocolos.tempo_resolucao is
  'Gerada (02 §3.6). Era TempoResolução gravado à mão (bUEDD), calculado contra DataAberto '
  'vazio quando o chamado não nascia "Em aberto".';

-- ---------------------------------------------------------------- sac_protocolo_entregas
create table public.sac_protocolo_entregas (
  protocolo_id uuid not null references public.sac_protocolos(id) on delete cascade,
  entrega_id   uuid not null references public.entregas(id) on delete restrict,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  primary key (protocolo_id, entrega_id)
);

comment on table public.sac_protocolo_entregas is
  'Era SacProtocolo.QuaisEntregas (02 §1.5: lista N:N vira ligação). Ligação pura, sem '
  'bubble_id: a pk composta é a idempotência da carga (como as ligações da 006).';

-- ------------------------------------------------------------------ sac_protocolo_anexos
create table public.sac_protocolo_anexos (
  id            uuid primary key default gen_random_uuid(),
  protocolo_id  uuid not null references public.sac_protocolos(id) on delete cascade,
  nome_arquivo  text not null,
  path          text not null,
  tipo_mime     text,
  tamanho_bytes bigint check (tamanho_bytes is null or tamanho_bytes >= 0),
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.sac_protocolo_anexos is
  'Era SacProtocolo.Anexos (list.file, até 10) — sac.md §8.4. path em bucket PRIVADO + URL '
  'assinada (§1.8); hoje os anexos de reclamação abrem por URL pública do CDN (sac.md §7.8). '
  'DELETE revogado: remover passa por server action, que apaga também o objeto no Storage.';

-- -------------------------------------------------------------------------- sac_interacoes
create table public.sac_interacoes (
  id              uuid primary key default gen_random_uuid(),
  protocolo_id    uuid not null references public.sac_protocolos(id) on delete cascade,
  descricao       text not null,
  visivel_cliente boolean not null default false,
  autor_id        uuid not null default auth.uid() references public.usuarios(id),
  contato_id      uuid references public.contatos_clifor(id),
  email_id        uuid references public.email_outbox(id) on delete set null,
  -- colunas de §1.2 (sem alterado_*: append-only, D5)
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  constraint descricao_nao_vazia check (btrim(descricao) <> '')
);

comment on table public.sac_interacoes is
  'Era Tbl.SacHistorico (bUDth). APPEND-ONLY (D5 da 013). visivel_cliente = true enfileira o '
  'aviso ao contato (server action), e email_id aponta para a fila: é daí que a tela mostra '
  '"e-mail enviado em …" (sac.md §8.4). NA CARGA: autor = Created By.';

-- ------------------------------------------------------------------------------ pesquisas
create table public.pesquisas (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  tipo_id   smallint not null references public.tipos_pesquisa(id),
  ativa     boolean not null default true,
  -- colunas obrigatórias de §1.2 (criado_em faz o papel de `criada_em` de 02 §3.6)
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint nome_nao_vazio check (btrim(nome) <> '')
);

comment on table public.pesquisas is
  'Era Tbl.PesquisaNps (bUDPr grava só o nome). tipo_id: 1 SAC | 2 NPS | 3 Pós-Venda (003). '
  'O pós-venda passa a ter campanha (uma permanente), o que hoje não tem (formularios-publicos '
  '§3.2). Desativar = ativa false; DELETE revogado. ativa = false invalida os links dela.';

-- ------------------------------------------------------------------------ pesquisa_convites
create table public.pesquisa_convites (
  id          uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references public.pesquisas(id) on delete cascade,
  cliente_id  uuid not null references public.grupos_clifor(id) on delete restrict,
  contato_id  uuid references public.contatos_clifor(id),
  pedido_id   uuid references public.pedidos(id),
  vendedor_id uuid references public.usuarios(id),
  -- sha-256 do token. Default = hash de bytes aleatórios que ninguém conhece: convite INERTE
  -- até fn_pesquisa_emitir_token (D7).
  token_hash  bytea not null unique
              default pg_catalog.sha256(extensions.gen_random_bytes(32)),
  expira_em   timestamptz not null default (now() + interval '30 days'),
  usado_em    timestamptz,
  enviado_em  timestamptz,
  envios      smallint not null default 0,
  tentativas  smallint not null default 0,
  email_id    uuid references public.email_outbox(id) on delete set null,
  cancelado_em  timestamptz,
  cancelado_por uuid references public.usuarios(id),
  cancelado_motivo text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint token_hash_sha256 check (octet_length(token_hash) = 32),
  constraint contadores_nao_negativos check (envios >= 0 and tentativas >= 0),
  constraint cancelado_nao_usado check (cancelado_em is null or usado_em is null)
);

comment on table public.pesquisa_convites is
  'O LINK DA PESQUISA. Metade "convite" de Tbl.PesquisaRespostas (bUDcW cria sem notas). '
  'token_hash = sha256 do token de 32 bytes; o token em claro NUNCA é gravado. token_hash não é '
  'legível por authenticated (GRANT de coluna). Escrita só por service_role (D7). vendedor_id e '
  'cliente_id DERIVADOS do pedido quando há pedido (trigger). NA CARGA: convite do Bubble sem '
  'resposta entra com o default (token inerte) e expira_em no passado — link antigo não reabre.';
comment on column public.pesquisa_convites.token_hash is
  'sha256(token utf-8). Nunca o token. Ninguém além de service_role lê esta coluna.';
comment on column public.pesquisa_convites.envios is
  'Quantas vezes o convite foi emitido/enviado (D8). Reenvio troca o token.';
comment on column public.pesquisa_convites.tentativas is
  'Respostas recusadas contra este convite: expirado, já respondido, dado inválido (D8).';
comment on column public.pesquisa_convites.vendedor_id is
  'Do PEDIDO (trigger), nunca da URL. Hoje o &pdd sem "=" grava vazio (formularios [DÚVIDA 1]).';

-- ----------------------------------------------------------------------- pesquisa_respostas
create table public.pesquisa_respostas (
  id          uuid primary key default gen_random_uuid(),
  convite_id  uuid not null unique references public.pesquisa_convites(id) on delete restrict,
  nota_nps         smallint check (nota_nps between 0 and 10),
  nota_atendimento smallint check (nota_atendimento between 0 and 10),
  nota_produto     smallint check (nota_produto between 0 and 10),
  criticas_sugestoes text check (char_length(criticas_sugestoes) <= 2000),
  respondida_em timestamptz not null default now(),
  ip_hash     bytea,
  user_agent  text check (char_length(user_agent) <= 500),
  -- colunas de §1.2 (sem alterado_*: resposta não se altera)
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id)
);

comment on table public.pesquisa_respostas is
  'Metade "resposta" de Tbl.PesquisaRespostas. unique (convite_id): uma resposta por convite, '
  'garantida pelo banco — hoje a segunda venda sobrescreve a avaliação da primeira e o pós-venda '
  'converte convite de NPS (formularios-publicos §4.6). Escrita SÓ por fn_pesquisa_responder '
  '(service_role). Sem nota_entrega (D6 da 013).';


-- =====================================================================================
-- 2. ÍNDICES (§6 e sac.md §8.4)
-- =====================================================================================

-- sac_protocolos (numero e bubble_id já têm unique)
create index sac_protocolos_lista_idx       on public.sac_protocolos (prioridade_id desc, aberto_em desc)
  where excluido_em is null;
create index sac_protocolos_status_idx      on public.sac_protocolos (status_id);
create index sac_protocolos_prioridade_idx  on public.sac_protocolos (prioridade_id);
create index sac_protocolos_tipo_idx        on public.sac_protocolos (tipo_ocorrencia_id, aberto_em);
create index sac_protocolos_responsavel_idx on public.sac_protocolos (responsavel_id);
create index sac_protocolos_grupo_idx       on public.sac_protocolos (grupo_clifor_id);
create index sac_protocolos_filial_idx      on public.sac_protocolos (filial_id);
create index sac_protocolos_pedido_idx      on public.sac_protocolos (pedido_id);
create index sac_protocolos_aberto_idx      on public.sac_protocolos (aberto_em);
create index sac_protocolos_excluido_idx    on public.sac_protocolos (excluido_em) where excluido_em is not null;
create index sac_protocolos_excluido_por_idx on public.sac_protocolos (excluido_por);
create index sac_protocolos_criado_por_idx  on public.sac_protocolos (criado_por);
create index sac_protocolos_alterado_por_idx on public.sac_protocolos (alterado_por);

-- sac_protocolo_entregas (a pk cobre protocolo_id)
create index sac_protocolo_entregas_entrega_idx    on public.sac_protocolo_entregas (entrega_id);
create index sac_protocolo_entregas_criado_por_idx on public.sac_protocolo_entregas (criado_por);

-- sac_protocolo_anexos
create index sac_protocolo_anexos_protocolo_idx    on public.sac_protocolo_anexos (protocolo_id);
create index sac_protocolo_anexos_criado_por_idx   on public.sac_protocolo_anexos (criado_por);
create index sac_protocolo_anexos_alterado_por_idx on public.sac_protocolo_anexos (alterado_por);

-- sac_interacoes (conversa em ordem cronológica, sac [DÚVIDA 18])
create index sac_interacoes_protocolo_idx  on public.sac_interacoes (protocolo_id, criado_em);
create index sac_interacoes_autor_idx      on public.sac_interacoes (autor_id);
create index sac_interacoes_contato_idx    on public.sac_interacoes (contato_id);
create index sac_interacoes_email_idx      on public.sac_interacoes (email_id) where email_id is not null;
create index sac_interacoes_criado_por_idx on public.sac_interacoes (criado_por);

-- pesquisas
create index pesquisas_tipo_idx         on public.pesquisas (tipo_id, criado_em desc);
create index pesquisas_criado_por_idx   on public.pesquisas (criado_por);
create index pesquisas_alterado_por_idx on public.pesquisas (alterado_por);

-- pesquisa_convites (token_hash e bubble_id já têm unique)
create index pesquisa_convites_pesquisa_idx  on public.pesquisa_convites (pesquisa_id, cliente_id);
create index pesquisa_convites_cliente_idx   on public.pesquisa_convites (cliente_id);
create index pesquisa_convites_contato_idx   on public.pesquisa_convites (contato_id);
create index pesquisa_convites_pedido_idx    on public.pesquisa_convites (pedido_id);
create index pesquisa_convites_vendedor_idx  on public.pesquisa_convites (vendedor_id);
create index pesquisa_convites_email_idx     on public.pesquisa_convites (email_id) where email_id is not null;
create index pesquisa_convites_cancelado_por_idx on public.pesquisa_convites (cancelado_por);
create index pesquisa_convites_criado_por_idx    on public.pesquisa_convites (criado_por);
create index pesquisa_convites_alterado_por_idx  on public.pesquisa_convites (alterado_por);

-- pesquisa_respostas (convite_id já tem unique)
create index pesquisa_respostas_respondida_idx on public.pesquisa_respostas (respondida_em);
create index pesquisa_respostas_criado_por_idx on public.pesquisa_respostas (criado_por);


-- =====================================================================================
-- 3. FUNÇÕES
-- =====================================================================================

-- ------------------------------------------------ regras do protocolo (security invoker)
create function public.fn_sac_protocolo_regras()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null then
      new.criado_em  := now();
      new.criado_por := auth.uid();
      new.aberto_em  := now();            -- D3: sempre na criação
    end if;
    -- D3: fechado_em pelo status (a carga pode trazer a data do Bubble)
    if new.status_id = 4 then
      new.fechado_em := coalesce(new.fechado_em, now());
    else
      new.fechado_em := null;
    end if;
  else
    new.aberto_em := old.aberto_em;       -- não se reescreve a abertura
    if new.status_id = 4 and old.status_id = 4 then
      new.fechado_em := old.fechado_em;
    elsif new.status_id = 4 then
      new.fechado_em := now();
    else
      new.fechado_em := null;
    end if;
  end if;

  -- D1: excluir / desfazer exclusão só perfil 1 (ou servidor/carga, sem auth.uid())
  if (tg_op = 'INSERT' and new.excluido_em is not null)
     or (tg_op = 'UPDATE' and (new.excluido_em, new.excluido_motivo)
                              is distinct from (old.excluido_em, old.excluido_motivo)) then
    if auth.uid() is not null then
      if coalesce(public.fn_hierarquia(), 99) <> 1 then
        raise exception 'Só a Diretoria exclui chamado' using errcode = '42501';
      end if;
      new.excluido_por := case when new.excluido_em is null then null else auth.uid() end;
    end if;
  end if;

  if new.filial_id is not null and not exists (
       select 1 from public.enderecos_clifor e
       where e.id = new.filial_id and e.grupo_id = new.grupo_clifor_id) then
    raise exception 'A filial % não é do cliente/fornecedor do chamado', new.filial_id
      using errcode = '23514';
  end if;

  return new;
end $$;

comment on function public.fn_sac_protocolo_regras() is
  'BEFORE INSERT/UPDATE em sac_protocolos: aberto_em na criação, fechado_em pelo status (D3), '
  'exclusão só perfil 1 com excluido_por carimbado (D1), filial do mesmo cliente.';

-- ------------------------------------------- regras da interação SAC (security invoker)
create function public.fn_sac_interacao_regras()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null then
      new.criado_em  := now();
      new.criado_por := auth.uid();
    end if;
    if new.contato_id is not null and not exists (
         select 1
         from public.contatos_clifor c
         join public.sac_protocolos p on p.grupo_clifor_id = c.grupo_id
         where c.id = new.contato_id and p.id = new.protocolo_id) then
      raise exception 'O contato % não é do cliente do chamado', new.contato_id
        using errcode = '23514';
    end if;
    return new;
  end if;

  -- UPDATE (só service_role chega aqui: o GRANT de update foi revogado de authenticated).
  -- D5: a única mudança aceita é preencher email_id uma vez.
  if (to_jsonb(new) - 'email_id') is distinct from (to_jsonb(old) - 'email_id')
     or (old.email_id is not null and new.email_id is distinct from old.email_id) then
    raise exception 'sac_interacoes é append-only' using errcode = '55000';
  end if;
  return new;
end $$;

comment on function public.fn_sac_interacao_regras() is
  'BEFORE INSERT/UPDATE em sac_interacoes: carimbo do servidor, contato do cliente do chamado; '
  'no update, só o preenchimento de email_id (D5 da 013).';

-- -------------------------------------------- convite deriva do pedido (security invoker)
create function public.fn_pesquisa_convite_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_ped record;
begin
  if new.pedido_id is not null then
    select p.cliente_id, p.vendedor_id into v_ped
    from public.pedidos p where p.id = new.pedido_id;
    new.cliente_id  := v_ped.cliente_id;
    new.vendedor_id := v_ped.vendedor_id;
  end if;

  if new.contato_id is not null and not exists (
       select 1 from public.contatos_clifor c
       where c.id = new.contato_id and c.grupo_id = new.cliente_id) then
    raise exception 'O contato % não é do cliente do convite', new.contato_id
      using errcode = '23514';
  end if;
  return new;
end $$;

comment on function public.fn_pesquisa_convite_derivados() is
  'BEFORE INSERT/UPDATE em pesquisa_convites: cliente e vendedor vêm do PEDIDO quando há pedido '
  '(formularios-publicos §7.4.8), contato tem de ser do cliente.';

-- ------------------------------------------------ emitir token (SÓ service_role)
-- security invoker: quem a executa é o service_role, que já ignora RLS. Não há motivo para
-- definer, e o execute é revogado de todo papel de cliente.
create function public.fn_pesquisa_emitir_token(
  p_convite_id uuid,
  p_validade   interval default interval '30 days'
)
  returns text
  language plpgsql
  volatile
  security invoker
  set search_path = ''
as $$
declare
  v_token text;
begin
  if p_validade is null or p_validade <= interval '0' or p_validade > interval '180 days' then
    raise exception 'Validade do convite fora de 0..180 dias' using errcode = '22023';
  end if;

  -- 32 bytes aleatórios (256 bits) em base64url, sem padding: 43 caracteres.
  v_token := rtrim(translate(encode(extensions.gen_random_bytes(32), 'base64'), '+/', '-_'), '=');

  update public.pesquisa_convites
     set token_hash = pg_catalog.sha256(convert_to(v_token, 'UTF8')),
         expira_em  = now() + p_validade,
         enviado_em = now(),
         envios     = envios + 1,
         tentativas = 0
   where id = p_convite_id
     and usado_em is null
     and cancelado_em is null;

  if not found then
    raise exception 'Convite % inexistente, já respondido ou cancelado', p_convite_id
      using errcode = 'P0002';
  end if;

  return v_token;   -- a ÚNICA vez que o token existe fora do e-mail
end $$;

comment on function public.fn_pesquisa_emitir_token(uuid, interval) is
  'Gera token novo de 256 bits para o convite, grava só o sha256, renova o prazo e devolve o '
  'token em claro UMA vez (para o e-mail). Reenvio = chamar de novo: o token anterior morre. '
  'Execute só service_role (server action). Ver o cabeçalho da 013.';

-- ------------------------------------------------ responder (SÓ service_role)
create function public.fn_pesquisa_responder(
  p_token            text,
  p_nota_nps         integer default null,
  p_nota_atendimento integer default null,
  p_nota_produto     integer default null,
  p_comentario       text    default null,
  p_ip_hash          bytea   default null,
  p_user_agent       text    default null
)
  returns text
  language plpgsql
  volatile
  security invoker
  set search_path = ''
as $$
declare
  v_conv       record;
  v_comentario text := nullif(btrim(p_comentario), '');
  v_ok         boolean;
begin
  -- Formato: base64url de 32 bytes. Fora disso nem consulta.
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{43}$' then
    return 'invalido';
  end if;

  select c.id, c.expira_em, c.usado_em, c.cancelado_em, p.tipo_id, p.ativa
    into v_conv
  from public.pesquisa_convites c
  join public.pesquisas p on p.id = c.pesquisa_id
  where c.token_hash = pg_catalog.sha256(convert_to(p_token, 'UTF8'))
  for update of c;

  -- Inexistente, cancelado e campanha desativada respondem igual: não confirma existência.
  if not found or v_conv.cancelado_em is not null or not v_conv.ativa then
    return 'invalido';
  end if;

  if v_conv.usado_em is not null then
    update public.pesquisa_convites set tentativas = least(tentativas + 1, 32767) where id = v_conv.id;
    return 'respondido';
  end if;

  if v_conv.expira_em <= now() then
    update public.pesquisa_convites set tentativas = least(tentativas + 1, 32767) where id = v_conv.id;
    return 'expirado';
  end if;

  -- Notas exigidas pelo tipo da campanha (003: 1 SAC, 2 NPS, 3 Pós-Venda); faixa 0..10.
  v_ok := coalesce(p_nota_nps between 0 and 10, true)
      and coalesce(p_nota_atendimento between 0 and 10, true)
      and coalesce(p_nota_produto between 0 and 10, true)
      and coalesce(char_length(v_comentario) <= 2000, true)
      and coalesce(char_length(p_user_agent) <= 500, true)
      and case v_conv.tipo_id
            when 2 then p_nota_nps is not null
            when 3 then p_nota_atendimento is not null and p_nota_produto is not null
            else coalesce(p_nota_nps, p_nota_atendimento, p_nota_produto) is not null
          end;
  if not v_ok then
    update public.pesquisa_convites set tentativas = least(tentativas + 1, 32767) where id = v_conv.id;
    return 'dados_invalidos';
  end if;

  insert into public.pesquisa_respostas
    (convite_id, nota_nps, nota_atendimento, nota_produto, criticas_sugestoes, ip_hash, user_agent)
  values
    (v_conv.id, p_nota_nps, p_nota_atendimento, p_nota_produto, v_comentario, p_ip_hash, p_user_agent);

  update public.pesquisa_convites set usado_em = now() where id = v_conv.id;
  return 'ok';
end $$;

comment on function public.fn_pesquisa_responder(text, integer, integer, integer, text, bytea, text) is
  'A ÚNICA porta de escrita da resposta pública. Numa transação, com o convite travado: valida '
  'token (sha256), cancelamento, campanha ativa, prazo e uso único; grava a resposta e marca '
  'usado_em. Devolve ok | invalido | expirado | respondido | dados_invalidos. Execute só '
  'service_role — a server action do formulário público a chama. Nunca policy para anon.';

-- ------------------------------------------------ fn_nps (authenticated, invoker)
create function public.fn_nps(
  p_pesquisa_id uuid,
  p_de  date default null,
  p_ate date default null
)
  returns table (
    convites    bigint,
    respondidas bigint,
    promotores  bigint,
    neutros     bigint,
    detratores  bigint,
    nps         integer,
    media       numeric(4,2)
  )
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  with c as (
    select c.id
    from public.pesquisa_convites c
    where c.pesquisa_id = p_pesquisa_id
      and c.cancelado_em is null
  ), r as (
    select r.nota_nps
    from public.pesquisa_respostas r
    join c on c.id = r.convite_id
    where r.nota_nps is not null
      and (p_de  is null or r.respondida_em >= (p_de::timestamp at time zone 'America/Sao_Paulo'))
      and (p_ate is null or r.respondida_em <  ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo'))
  )
  select (select count(*) from c),
         count(*),
         count(*) filter (where r.nota_nps >= 9),
         count(*) filter (where r.nota_nps between 7 and 8),
         count(*) filter (where r.nota_nps <= 6),
         round(100.0 * (count(*) filter (where r.nota_nps >= 9)
                      - count(*) filter (where r.nota_nps <= 6))
               / nullif(count(*), 0))::integer,
         round(avg(r.nota_nps), 2)::numeric(4,2)
  from r
$$;

comment on function public.fn_nps(uuid, date, date) is
  'NPS de verdade (D10 da 013): promotores 9–10, neutros 7–8, detratores 0–6; '
  'nps = round(100 × (P − D) / respondidas), nulo sem resposta; média ao lado. Substitui o '
  '"NPS Atual" (contagem de convites) e a "Média" com divisão por zero (sac.md §5). '
  'security invoker: quem não lê a pesquisa pela RLS recebe zeros.';

revoke execute on function public.fn_sac_protocolo_regras()      from public, anon, authenticated;
revoke execute on function public.fn_sac_interacao_regras()      from public, anon, authenticated;
revoke execute on function public.fn_pesquisa_convite_derivados() from public, anon, authenticated;
revoke execute on function public.fn_pesquisa_emitir_token(uuid, interval) from public, anon, authenticated;
revoke execute on function public.fn_pesquisa_responder(text, integer, integer, integer, text, bytea, text)
  from public, anon, authenticated;
grant  execute on function public.fn_pesquisa_emitir_token(uuid, interval) to service_role;
grant  execute on function public.fn_pesquisa_responder(text, integer, integer, integer, text, bytea, text)
  to service_role;
revoke execute on function public.fn_nps(uuid, date, date) from public, anon;
grant  execute on function public.fn_nps(uuid, date, date) to authenticated;


-- =====================================================================================
-- 4. TRIGGERS
-- =====================================================================================
create trigger trg_sac_protocolos_regras
  before insert or update on public.sac_protocolos
  for each row execute function public.fn_sac_protocolo_regras();
create trigger trg_sac_interacoes_regras
  before insert or update on public.sac_interacoes
  for each row execute function public.fn_sac_interacao_regras();
create trigger trg_pesquisa_convites_derivados
  before insert or update on public.pesquisa_convites
  for each row execute function public.fn_pesquisa_convite_derivados();

create trigger trg_sac_protocolos_alterado
  before update on public.sac_protocolos
  for each row execute function public.fn_set_alterado();
create trigger trg_sac_protocolo_anexos_alterado
  before update on public.sac_protocolo_anexos
  for each row execute function public.fn_set_alterado();
create trigger trg_pesquisas_alterado
  before update on public.pesquisas
  for each row execute function public.fn_set_alterado();
create trigger trg_pesquisa_convites_alterado
  before update on public.pesquisa_convites
  for each row execute function public.fn_set_alterado();

-- Status, responsável e exclusão do chamado: hoje ninguém sabe quem excluiu nem quando
-- (sac.md §7.7). Convites NÃO são auditados: a auditoria gravaria token_hash em jsonb.
create trigger trg_sac_protocolos_auditoria
  after insert or update or delete on public.sac_protocolos
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 5. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7, §7)
-- =====================================================================================
-- NENHUMA policy `to anon` em tabela nenhuma deste arquivo, e `revoke all ... from anon` em
-- todas. O formulário público grava por fn_pesquisa_responder, via service_role no servidor.

alter table public.sac_protocolos         enable row level security;
alter table public.sac_protocolo_entregas enable row level security;
alter table public.sac_protocolo_anexos   enable row level security;
alter table public.sac_interacoes         enable row level security;
alter table public.pesquisas              enable row level security;
alter table public.pesquisa_convites      enable row level security;
alter table public.pesquisa_respostas     enable row level security;

revoke all on table public.sac_protocolos         from anon;
revoke all on table public.sac_protocolo_entregas from anon;
revoke all on table public.sac_protocolo_anexos   from anon;
revoke all on table public.sac_interacoes         from anon;
revoke all on table public.pesquisas              from anon;
revoke all on table public.pesquisa_convites      from anon;
revoke all on table public.pesquisa_respostas     from anon;

-- Remoção física fora do alcance do cliente (D1, D5, D7): falha com 42501.
revoke delete, truncate on table public.sac_protocolos       from authenticated;
revoke delete, truncate on table public.sac_protocolo_anexos from authenticated;
revoke update, delete, truncate on table public.sac_interacoes from authenticated;
revoke delete, truncate on table public.pesquisas            from authenticated;
revoke insert, update, delete, truncate on table public.pesquisa_respostas from authenticated;
-- Convite: nenhuma escrita, e leitura por COLUNA, sem token_hash (D7).
revoke all on table public.pesquisa_convites from authenticated;
grant select (id, pesquisa_id, cliente_id, contato_id, pedido_id, vendedor_id, expira_em,
              usado_em, enviado_em, envios, tentativas, email_id, cancelado_em, cancelado_por,
              cancelado_motivo, bubble_id, criado_em, criado_por, alterado_em, alterado_por)
  on public.pesquisa_convites to authenticated;

-- ------------------------------------------------------------------------ sac_protocolos
create policy sac_protocolos_leitura on public.sac_protocolos
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) = 1
         or responsavel_id = (select auth.uid())
         or criado_por     = (select auth.uid()))
  );
create policy sac_protocolos_insert on public.sac_protocolos
  for insert to authenticated
  with check ((select public.fn_pode_acessar_pagina('sac')));
create policy sac_protocolos_update on public.sac_protocolos
  for update to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) = 1 or responsavel_id = (select auth.uid()))
  )
  with check (
    (select public.fn_pode_acessar_pagina('sac'))
    and ((select public.fn_hierarquia()) = 1 or responsavel_id = (select auth.uid()))
  );

comment on policy sac_protocolos_leitura on public.sac_protocolos is
  'Página sac + (perfil 1, OU responsável — condicional 4 de bUClt —, OU quem abriu). D4 da 013. '
  'Excluídos continuam legíveis aqui; a lista filtra excluido_em is null (sac [DÚVIDA 4]).';
comment on policy sac_protocolos_update on public.sac_protocolos is
  'Perfil 1 ou o responsável (sac [DÚVIDA 5]). Excluir/desfazer é só perfil 1 (trigger). '
  'Sem policy de delete e DELETE revogado: exclusão é lógica (D1).';

-- ---------------------------------------------------------------- sac_protocolo_entregas
create policy sac_protocolo_entregas_leitura on public.sac_protocolo_entregas
  for select to authenticated
  using (exists (select 1 from public.sac_protocolos p where p.id = protocolo_id));
create policy sac_protocolo_entregas_escrita on public.sac_protocolo_entregas
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and exists (select 1 from public.sac_protocolos p
                where p.id = protocolo_id
                  and ((select public.fn_hierarquia()) = 1
                       or p.responsavel_id = (select auth.uid())
                       or p.criado_por     = (select auth.uid())))
  )
  with check (
    (select public.fn_pode_acessar_pagina('sac'))
    and exists (select 1 from public.sac_protocolos p
                where p.id = protocolo_id
                  and ((select public.fn_hierarquia()) = 1
                       or p.responsavel_id = (select auth.uid())
                       or p.criado_por     = (select auth.uid())))
  );

-- ------------------------------------------------------------------ sac_protocolo_anexos
create policy sac_protocolo_anexos_leitura on public.sac_protocolo_anexos
  for select to authenticated
  using (exists (select 1 from public.sac_protocolos p where p.id = protocolo_id));
create policy sac_protocolo_anexos_insert on public.sac_protocolo_anexos
  for insert to authenticated
  with check (
    (select public.fn_pode_acessar_pagina('sac'))
    and exists (select 1 from public.sac_protocolos p
                where p.id = protocolo_id
                  and ((select public.fn_hierarquia()) = 1
                       or p.responsavel_id = (select auth.uid())
                       or p.criado_por     = (select auth.uid())))
  );
create policy sac_protocolo_anexos_update on public.sac_protocolo_anexos
  for update to authenticated
  using (
    (select public.fn_pode_acessar_pagina('sac'))
    and exists (select 1 from public.sac_protocolos p
                where p.id = protocolo_id
                  and ((select public.fn_hierarquia()) = 1
                       or p.responsavel_id = (select auth.uid())))
  )
  with check (
    (select public.fn_pode_acessar_pagina('sac'))
    and exists (select 1 from public.sac_protocolos p
                where p.id = protocolo_id
                  and ((select public.fn_hierarquia()) = 1
                       or p.responsavel_id = (select auth.uid())))
  );

-- -------------------------------------------------------------------------- sac_interacoes
create policy sac_interacoes_leitura on public.sac_interacoes
  for select to authenticated
  using (exists (select 1 from public.sac_protocolos p where p.id = protocolo_id));
create policy sac_interacoes_insert on public.sac_interacoes
  for insert to authenticated
  with check (
    (select public.fn_pode_acessar_pagina('sac'))
    and autor_id = (select auth.uid())
    and email_id is null
    and (not visivel_cliente or contato_id is not null)
    and exists (select 1 from public.sac_protocolos p where p.id = protocolo_id)
  );

comment on policy sac_interacoes_insert on public.sac_interacoes is
  'Quem enxerga o chamado registra interação, como autor ele mesmo; visível ao cliente exige '
  'contato (sac.md §4.5). Sem update/delete (revogados): append-only, D5 da 013.';

-- ------------------------------------------------------------------------------ pesquisas
create policy pesquisas_leitura on public.pesquisas
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('sac')));
create policy pesquisas_insert on public.pesquisas
  for insert to authenticated
  with check ((select public.fn_pode_acessar_pagina('sac')));
create policy pesquisas_update on public.pesquisas
  for update to authenticated
  using ((select public.fn_pode_acessar_pagina('sac')))
  with check ((select public.fn_pode_acessar_pagina('sac')));

comment on policy pesquisas_leitura on public.pesquisas is
  'Quem tem a página sac — Diretoria e Ouvidoria pela matriz de hoje (04 §1.1, B6). A campanha é '
  'criada pela Ouvidoria (formularios-publicos §1.2: "alguém do SAC/Ouvidoria clica").';

-- ------------------------------------------------------------------------ pesquisa_convites
create policy pesquisa_convites_leitura on public.pesquisa_convites
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('sac')));

comment on policy pesquisa_convites_leitura on public.pesquisa_convites is
  'Só leitura, por quem tem a página sac, e SEM a coluna token_hash (GRANT de coluna). Criar, '
  'reenviar e cancelar são server actions com service_role (D7 da 013). anon: nada.';

-- ----------------------------------------------------------------------- pesquisa_respostas
create policy pesquisa_respostas_leitura on public.pesquisa_respostas
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('sac')));

comment on policy pesquisa_respostas_leitura on public.pesquisa_respostas is
  'Só leitura (página sac). Escrita: só fn_pesquisa_responder, executável só por service_role. '
  'Hoje a tabela inteira de respostas desce para o navegador de quem abre o formulário '
  '(formularios-publicos §7.3).';


-- =====================================================================================
-- FIM da 013_sac.sql
-- =====================================================================================
-- CONFERÊNCIA
--   7 tabelas, 7 com RLS, 7 com `revoke all ... from anon`. ZERO policy para anon.
--   15 policies: sac_protocolos (leitura, insert, update); sac_protocolo_entregas (leitura,
--   escrita); sac_protocolo_anexos (leitura, insert, update); sac_interacoes (leitura, insert);
--   pesquisas (leitura, insert, update); pesquisa_convites (leitura); pesquisa_respostas (leitura).
--   GRANT: delete revogado de authenticated em protocolos/anexos/pesquisas; interações sem
--   update/delete; respostas e convites sem escrita; convites com select por coluna sem token_hash.
--   Token: 256 bits, só sha256 gravado, prazo, uso único, reenvio troca o token.
--   FKs indexadas: todas.
--   Funções novas, todas security invoker: 3 de trigger (execute revogado); emitir_token e
--   responder (execute SÓ service_role); fn_nps (authenticated). Nenhuma security definer.
--   Triggers: 3 de regra, 4 fn_set_alterado, 1 fn_auditoria (sac_protocolos).
--   Nenhum dinheiro. Notas smallint 0..10; NPS inteiro e média numeric(4,2). Nenhum float.
--   Nenhum seed. Nenhum segredo.
-- =====================================================================================
