-- =====================================================================================
-- 001_fundacao.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 0 "Fundação" de `specs/02-modelo-de-dados-proposto.md` §11.
-- Entrega: login, menu e sessão de verdade — identidade, acesso e a trilha de auditoria.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Instala as extensões que esta fatia usa, no schema `extensions` (padrão Supabase).
--   2. Cria o invólucro IMMUTABLE `fn_unaccent` (§6.1, armadilha 2) e o gatilho de `alterado_*`.
--   3. Cria as listas fixas de acesso: `perfis`, `departamentos`, `paginas` (molde de §4).
--   4. Cria `usuarios`, `permissoes_pagina`, `usuario_preferencias`, `log_acesso`,
--      `auditoria`, `config_sistema`, `config_copia_email`, `integracao_tokens` (§3.1).
--   5. Cria as funções de autorização de §7.1 (`fn_usuario_ativo`, `fn_hierarquia`,
--      `fn_pode_acessar_pagina`) e o gatilho de auditoria.
--   6. Liga RLS em TODA tabela, com policy explícita (CLAUDE.md regra 3, §1.7, §7).
--   7. Semeia `perfis`, `departamentos` e `paginas` a partir de `mapa/option-sets.md`.
--
-- O QUE **NÃO** ENTRA AQUI
--   - `niveis_vendedor` (fatia 8): `usuarios.nivel_vendedor_id` fica `uuid` SEM FK; a FK entra
--     na migration 008.
--   - `ufs` (fatia 1): `usuarios.uf` fica `char(2)` SEM FK; a FK entra na migration 002.
--   - As outras 33 listas fixas de §4 (fatia 1), `email_outbox` (fatia 5), views de §5
--     (inclusive `v_usuarios_publico`), e qualquer tabela de negócio (fatias 2 a 12).
--   - Nenhum segredo. Credencial de serviço é variável de ambiente do servidor
--     (`specs/00-achados-de-seguranca.md` §1.1 e §3.4; CLAUDE.md regra 4).
--   - Nenhuma coluna de senha: autenticação é `auth.users` (§2.1.5, achados §1.2 e §3.3).
--
-- ORDEM DOS BLOCOS
--   extensões → funções utilitárias → tabelas de domínio → tabelas principais →
--   funções de autorização → índices → triggers → RLS e policies → seed.
--   As funções de autorização vêm DEPOIS das tabelas de propósito: função `language sql` tem o
--   corpo validado no `create`, então referenciar `public.usuarios` antes da tabela existir
--   falharia na própria migration.
--
-- Sem `begin`/`commit`: o Supabase aplica migration em transação.
-- Depois de aplicar: rodar `get_advisors` (segurança e desempenho), como manda §7.3.
-- =====================================================================================


-- =====================================================================================
-- 1. EXTENSÕES
-- =====================================================================================
-- §6.1: no Supabase extensão instala no schema `extensions`, NUNCA no `public`. Toda chamada
-- dentro de função com `search_path = ''` precisa ser qualificada (`extensions.unaccent(...)`),
-- senão quebra em tempo de execução — em produção, não na migration.
-- As demais extensões conferidas em §6.1 (postgis, btree_gist, pg_cron, pgtap) entram na fatia
-- que primeiro precisar delas. `gen_random_uuid()` é nativa do Postgres 13+.

create extension if not exists unaccent  with schema extensions;
create extension if not exists pg_trgm   with schema extensions;
create extension if not exists pgcrypto  with schema extensions;  -- já instalada no projeto


-- =====================================================================================
-- 2. FUNÇÕES UTILITÁRIAS
-- =====================================================================================

-- §6.1, armadilha 2: `unaccent()` é STABLE e índice exige IMMUTABLE. Sem este invólucro o
-- índice de busca por nome nem compila ("functions in index expression must be marked
-- IMMUTABLE"). O primeiro argumento fixa o dicionário, e é isso que torna o resultado
-- determinístico e indexável.
-- A consulta da tela tem de usar EXATAMENTE esta expressão (`fn_unaccent(nome) ilike ...`),
-- senão o planejador ignora o índice e varre a tabela.
create or replace function public.fn_unaccent(text)
  returns text
  language sql
  immutable parallel safe strict
  security invoker
  set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent', $1) $$;

comment on function public.fn_unaccent(text) is
  'Invólucro IMMUTABLE de extensions.unaccent, para poder indexar busca sem acento (02 §6.1).';

-- §1.2 + exigência 6: `alterado_em`/`alterado_por` nunca são preenchidos pela tela.
create or replace function public.fn_set_alterado()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  new.alterado_em  := now();
  new.alterado_por := auth.uid();
  return new;
end $$;

comment on function public.fn_set_alterado() is
  'Trigger BEFORE UPDATE: preenche alterado_em/alterado_por a partir do relógio e de auth.uid().';


-- =====================================================================================
-- 3. TABELAS DE DOMÍNIO (listas fixas — molde de §4, SEM as colunas de auditoria de §1.2)
-- =====================================================================================

-- Opt.PerfilUsuario
create table public.perfis (
  id           smallint primary key,   -- 1 Diretor, 2 Gerente, 3 Analista, 4 Operador
  chave_bubble text not null unique,   -- diretoria | gerencia | colaborador | operador
  nome         text not null
);

comment on table public.perfis is
  'Opt.PerfilUsuario. Lista fixa de domínio: sem as colunas de auditoria de 02 §1.2.';
comment on column public.perfis.id is
  'ARMADILHA PROPOSITAL: o id É a hierarquia. A policy escreve "perfil_id <= 2", que se lê '
  '"Gerente ou acima". Não existe coluna hierarquia separada — no Bubble ela divergia do id. '
  'Nunca reordenar nem reaproveitar id.';
comment on column public.perfis.chave_bubble is
  'Chave textual do option set, usada só pela carga para resolver ponteiros. NÃO é o '
  'identificador do app novo (02 §2.1.7).';

-- Opt.DeptoUsuario
create table public.departamentos (
  id           smallint primary key,
  chave_bubble text not null unique,   -- diretoria | financeiro | licita__o | geral
  nome         text not null,          -- Administrativo | Financeiro | Comercial | Operação
  descricao    text
);

comment on table public.departamentos is
  'Opt.DeptoUsuario. ARMADILHA DO DE-PARA: a chave ''licita__o'' é o departamento COMERCIAL e '
  'a chave ''geral'' é OPERAÇÃO — nomes herdados de uma versão antiga do app Bubble. NUNCA '
  'deduzir o departamento pela chave; resolver sempre por chave_bubble → id (02 §3.1).';
comment on column public.departamentos.id is
  'Numeração atribuída na carga, na ordem do option set. Ao contrário de perfis.id, NÃO é '
  'hierarquia e não deve ser comparado com < ou >.';

-- Opt.MenuPaginas (e, na fatia das telas de configuração, as linhas de Opt.MenuConfig)
create table public.paginas (
  slug         text primary key,       -- inicio | vendas | financeiro | metas | ...
  chave_bubble text unique,            -- Opt.MenuPaginas: inicio | licita__o | dashboard | ...
  nome         text not null,          -- "Fluxo de Vendas"
  ordem        smallint,
  icone        text
);

comment on table public.paginas is
  'Opt.MenuPaginas. Lista fixa de domínio (02 §4), então sem as colunas de auditoria de §1.2. '
  'Os atributos hierarquia e DepartamentosAcessiveis do option set NÃO migram: ninguém os lê '
  '(02 §4 e §9); a autorização real é permissoes_pagina + fn_pode_acessar_pagina. As linhas de '
  'Opt.MenuConfig (Configurações de Usuário/Sistema, Cadastro Usuários/Produtos, '
  'Cliente/Fornecedor, FollowUp de Pedidos) entram junto das telas de configuração, quando os '
  'slugs das rotas existirem.';
comment on column public.paginas.chave_bubble is
  'Nulo onde a página nasceu no app novo, ou onde vem de Opt.MenuConfig sem chave de menu.';
comment on column public.paginas.ordem is
  'No Bubble, "Relatórios" e "Suporte de Vendas & Nps" estão SEM ordem '
  '(specs/paginas/casca-e-configuracao.md [DÚVIDA 17]). O seed atribui 7 e 8, preservando as '
  'ordens 1,2,3,5,6 que já existiam — o 4 fica vago de propósito, como no Bubble.';
comment on column public.paginas.icone is
  'Nulo no seed: Opt.MenuPaginas não tem atributo de ícone; o ícone vive no elemento do menu '
  '(mapa/reusable-tool.MenuPaginas.md) e é definido quando a casca for construída.';


-- =====================================================================================
-- 4. TABELAS PRINCIPAIS (§3.1) — todas com as colunas obrigatórias de §1.2
-- =====================================================================================

-- ---------------------------------------------------------------------------- usuarios
create table public.usuarios (
  id                uuid primary key references auth.users(id) on delete restrict,
  nome              text not null,
  email_contato     text,        -- e-mail de resposta dos envios; ≠ e-mail de login
  perfil_id         smallint not null references public.perfis(id),
  departamento_id   smallint not null references public.departamentos(id),
  ativo             boolean not null default true,
  telefone          text,
  foto_path         text,        -- caminho no Storage privado, nunca URL pública (§1.8)
  cpf               text,
  rg                text,
  cidade            text,
  endereco          text,
  uf                char(2),     -- FK para ufs(sigla) entra na migration 002 (fatia 1)
  nivel_vendedor_id uuid,        -- FK para niveis_vendedor(id) entra na migration 008 (fatia 8)
  substituto_id     uuid references public.usuarios(id),
  ferias_inicio     date,
  ferias_fim        date,
  is_dev            boolean not null default false,
  -- colunas obrigatórias de §1.2 (id acima é a exceção: é o id de auth.users)
  bubble_id         text unique,
  criado_em         timestamptz not null default now(),
  criado_por        uuid references public.usuarios(id),
  alterado_em       timestamptz,
  alterado_por      uuid references public.usuarios(id),
  constraint ferias_coerente check (ferias_fim is null or ferias_inicio <= ferias_fim),
  constraint substituto_nao_e_ele_mesmo check (substituto_id is distinct from id)
);

comment on table public.usuarios is
  'SEM coluna de senha, por decisão (02 §2.1.5). Autenticação é auth.users; o Bubble gravava '
  'User.PassTexto em texto puro (specs/00-achados-de-seguranca.md §1.2 e §3.3). NÃO migram '
  'User.PassTexto, User.SmtpSenha/SmtpEndereco/SmtpPorta/StmpLogin (já marcados ''deleted'' no '
  'Bubble) nem User.RankingVenda* (specs/paginas/metas.md [DÚVIDA 11]).';
comment on column public.usuarios.id is
  'É o id de auth.users. on delete restrict: apagar o login não apaga o histórico do usuário; '
  'desativar é ativo = false.';
comment on column public.usuarios.cpf is
  'Dado pessoal. A tabela é legível apenas pelo próprio e por perfil <= 2 (02 §7.2/§7.3); as '
  'telas que só precisam de nome/perfil/departamento usam a view v_usuarios_publico, criada na '
  'fatia que precisar dela.';
comment on column public.usuarios.uf is
  'char(2) SEM FK nesta migration: a tabela ufs é da fatia 1. A FK para ufs(sigla) entra na '
  'migration 002.';
comment on column public.usuarios.nivel_vendedor_id is
  'uuid SEM FK nesta migration: niveis_vendedor é da fatia 8. A FK entra na migration 008.';
comment on column public.usuarios.bubble_id is
  'Id do Bubble, o que torna a carga idempotente e a recarga segura (02 §1.2). Único, e NÃO é '
  'a chave primária: o app novo não depende do id do Bubble.';

-- -------------------------------------------------------------------- permissoes_pagina
create table public.permissoes_pagina (
  id              uuid primary key default gen_random_uuid(),
  pagina_slug     text not null references public.paginas(slug) on delete cascade,
  perfil_id       smallint references public.perfis(id),
  departamento_id smallint references public.departamentos(id),
  usuario_id      uuid references public.usuarios(id) on delete cascade,
  bubble_id       text unique,
  criado_em       timestamptz not null default now(),
  criado_por      uuid references public.usuarios(id),
  alterado_em     timestamptz,
  alterado_por    uuid references public.usuarios(id),
  constraint alvo_unico check (
    (perfil_id is not null)::int + (departamento_id is not null)::int
    + (usuario_id is not null)::int = 1
  )
);

comment on table public.permissoes_pagina is
  'Substitui ConfigSistema.QuaisPerfis/QuaisDeptos/QuaisUsuarios, que hoje é a tabela de '
  'permissão COM auto-binding liberado: qualquer logado se dá acesso a qualquer página sem '
  'abrir tela (specs/00-achados-de-seguranca.md §2.3). Aqui a escrita é só por server action de '
  'perfil 1, e a leitura das outras tabelas passa por fn_pode_acessar_pagina.';
comment on constraint alvo_unico on public.permissoes_pagina is
  'Cada linha concede a exatamente UM alvo: perfil, departamento ou usuário.';

-- ----------------------------------------------------------------- usuario_preferencias
create table public.usuario_preferencias (
  usuario_id         uuid primary key references public.usuarios(id) on delete cascade,
  pagina_inicial     text references public.paginas(slug),
  periodo_inicio     timestamptz,   -- era User.UltimoDateRange (date_range → duas colunas, §1.4)
  periodo_fim        timestamptz,
  ordenacao          jsonb not null default '{}',  -- era User.OrdenarCampos
  filtros            jsonb not null default '{}',  -- era FiltraTipoClifor, ExpandirCadastroClifor
  copia_pedido       text,
  copia_proposta     text,
  copia_cancelamentos text,
  -- colunas obrigatórias de §1.2; a pk é usuario_id (02 §3.1), `id` existe para atender §1.2
  id                 uuid not null unique default gen_random_uuid(),
  bubble_id          text unique,
  criado_em          timestamptz not null default now(),
  criado_por         uuid references public.usuarios(id),
  alterado_em        timestamptz,
  alterado_por       uuid references public.usuarios(id),
  constraint periodo_coerente check (periodo_fim is null or periodo_inicio <= periodo_fim)
);

comment on table public.usuario_preferencias is
  'Recebe o estado de tela que hoje mora no User (02 §2.1.6). NÃO recebe '
  'SelecionadosPagar/SelecionadosReceber (seleção de checkbox é estado do cliente) nem '
  'TempOrcamentoProdutos (vira cotação com status = ''rascunho'').';
comment on column public.usuario_preferencias.id is
  'Surrogate de §1.2. A chave primária é usuario_id, como manda 02 §3.1 — este id existe para '
  'cumprir a coluna obrigatória e para poder virar auditoria.linha_id.';

-- ------------------------------------------------------------------------- log_acesso
-- Exceção declarada de §1.2: é log append-only, então bigserial e sem colunas de auditoria.
create table public.log_acesso (
  id            bigserial primary key,
  usuario_id    uuid references public.usuarios(id),
  email_tentado text,
  evento        text not null,   -- login | logout | reset_solicitado | convite | falha
  resultado     text not null,   -- ok | senha_invalida | inativo | expirado
  ip            inet,
  user_agent    text,
  em            timestamptz not null default now()
);

comment on table public.log_acesso is
  'Não existe equivalente no Bubble: hoje não há registro nenhum de acesso. Escrita só por '
  'server action com service_role — o evento de falha acontece ANTES de existir sessão, então '
  'não pode depender de auth.uid().';
comment on column public.log_acesso.email_tentado is
  'Guarda o e-mail digitado na tentativa que falhou, quando não há usuario_id para apontar.';

-- -------------------------------------------------------------------------- auditoria
-- Exceção declarada de §1.2: bigserial, sem colunas de auditoria (auditar a auditoria não faz
-- sentido), e imutável por privilégio.
create table public.auditoria (
  id         bigserial primary key,
  tabela     text not null,
  linha_id   uuid not null,
  operacao   text not null,   -- insert | update | delete
  usuario_id uuid references public.usuarios(id),
  antes      jsonb,
  depois     jsonb,
  motivo     text,            -- obrigatório onde a regra de negócio exigir
  em         timestamptz not null default now(),
  constraint operacao_valida check (operacao in ('insert', 'update', 'delete'))
);

comment on table public.auditoria is
  'Uma trilha só, genérica (02 §2.1 e §2, contra auditoria_valores + auditoria_metas: três '
  'tabelas de auditoria é o caminho para nenhuma). Alimentada por trigger. RLS ligada e NENHUMA '
  'policy: só service_role lê. UPDATE e DELETE revogados, inclusive do dono. A policy de select '
  'para perfil 1 (02 §7.3) entra quando a tela de auditoria for construída.';
comment on column public.auditoria.linha_id is
  'uuid da linha auditada. Por isso o gatilho só é ligado em tabela que tem coluna `id` uuid.';

-- ---------------------------------------------------------------------- config_sistema
create table public.config_sistema (
  chave               text primary key,   -- 'email.cota_diaria', 'alerta.dias_sem_interacao'
  valor               jsonb not null,
  descricao           text not null,
  editavel_por_perfil smallint not null default 1 references public.perfis(id),
  -- colunas obrigatórias de §1.2; a pk é `chave` (02 §3.1)
  id                  uuid not null unique default gen_random_uuid(),
  bubble_id           text unique,
  criado_em           timestamptz not null default now(),
  criado_por          uuid references public.usuarios(id),
  alterado_em         timestamptz,
  alterado_por        uuid references public.usuarios(id)
);

comment on table public.config_sistema is
  'NUNCA guardar segredo aqui. Credencial de serviço é variável de ambiente do servidor; token '
  'de integração é integracao_tokens (02 §3.1; CLAUDE.md regra 4). Substitui Tbl.ConfigSistema, '
  'que no Bubble são 15 colunas genéricas (ValorTexto1/2, ValorBoolean1/2, ValorNumero, '
  'ValorDataHora1/2) endereçadas por um CodigoConfig numérico. As linhas de permissão do Bubble '
  'vão para permissoes_pagina; as de cópia de e-mail para config_copia_email.';
comment on column public.config_sistema.editavel_por_perfil is
  'Hierarquia mínima que pode escrever a chave: a policy compara fn_hierarquia() <= este valor. '
  'Default 1 = só Diretor.';
comment on column public.config_sistema.id is
  'Surrogate de §1.2. A chave primária é `chave`, como manda 02 §3.1.';

-- ------------------------------------------------------------------- config_copia_email
create table public.config_copia_email (
  id           uuid primary key default gen_random_uuid(),
  evento       text not null,   -- pedido | proposta | cancelamento | cobranca
  usuario_id   uuid references public.usuarios(id) on delete cascade,
  email        text,
  tipo         text not null default 'cc',   -- cc | bcc
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint destino_unico check ((usuario_id is not null)::int + (email is not null)::int = 1),
  constraint tipo_valido check (tipo in ('cc', 'bcc'))
);

comment on table public.config_copia_email is
  'Hoje são endereços colados em campo texto, com '';'' e '','' misturados como separador, e '
  'alguns fixos no corpo do workflow (contato@ e financeiro@ aparecem hardcoded em '
  'EnviarEmailPedido). Aqui cada destino é uma linha.';

-- ------------------------------------------------------------------- integracao_tokens
create table public.integracao_tokens (
  id           uuid primary key default gen_random_uuid(),
  provedor     text not null,   -- google
  conta        text not null,   -- a conta de envio
  access_token text,
  refresh_token text,
  expira_em    timestamptz,
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  unique (provedor, conta)
);

comment on table public.integracao_tokens is
  'RLS ligada e NENHUMA policy: só service_role, e os privilégios de anon e authenticated são '
  'revogados abaixo. Nunca vai para tela. Hoje esses tokens ficam em '
  'ConfigSistema[CodigoConfig=21], tabela pública, e são EXIBIDOS na interface '
  '(specs/00-achados-de-seguranca.md §1.3). Token de OAuth é o único segredo que mora em '
  'tabela; credencial de serviço é variável de ambiente (CLAUDE.md regra 4).';


-- =====================================================================================
-- 5. FUNÇÕES DE AUTORIZAÇÃO (§7.1)
-- =====================================================================================
-- Padrão obrigatório: `language sql stable security definer set search_path = ''`, com toda
-- referência a tabela qualificada por `public.` (§6.1, armadilha 1). `security definer` é o que
-- permite consultar public.usuarios de dentro de uma policy sem recursão de RLS.

create function public.fn_usuario_ativo()
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and u.ativo
  )
$$;

comment on function public.fn_usuario_ativo() is
  'Verdadeiro se quem chamou tem linha em usuarios e está ativo. Base de toda policy (02 §7.1).';

create function public.fn_hierarquia()
  returns smallint
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select u.perfil_id from public.usuarios u where u.id = auth.uid()
$$;

comment on function public.fn_hierarquia() is
  'Perfil de quem chamou, que É a hierarquia: 1 Diretor, 2 Gerente, 3 Analista, 4 Operador. '
  'Nulo para quem não tem linha em usuarios — comparação com nulo é nula, logo a policy nega.';

create function public.fn_pode_acessar_pagina(p_slug text)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios u
    join public.permissoes_pagina pp
      on pp.pagina_slug = p_slug
     and (pp.perfil_id = u.perfil_id
          or pp.departamento_id = u.departamento_id
          or pp.usuario_id = u.id)
    where u.id = auth.uid() and u.ativo
  )
$$;

comment on function public.fn_pode_acessar_pagina(text) is
  'Verdadeiro se houver linha em permissoes_pagina casando por perfil, departamento ou usuário. '
  'Substitui a autorização por option set no navegador, que hoje é CSS '
  '(specs/00-achados-de-seguranca.md §3.2). É esta função que as policies das fatias 2+ usam.';


-- =====================================================================================
-- 6. ÍNDICES (§6: índice em toda FK e em toda coluna usada em filtro ou ordenação)
-- =====================================================================================

-- usuarios
create index usuarios_perfil_idx       on public.usuarios (perfil_id);
create index usuarios_departamento_idx on public.usuarios (departamento_id);
create index usuarios_substituto_idx   on public.usuarios (substituto_id)
  where substituto_id is not null;
create index usuarios_nivel_vendedor_idx on public.usuarios (nivel_vendedor_id)
  where nivel_vendedor_id is not null;
create index usuarios_criado_por_idx   on public.usuarios (criado_por);
create index usuarios_alterado_por_idx on public.usuarios (alterado_por);
-- A tela de cadastro de usuários filtra por departamento + perfil + ativo e ordena por nome
-- (mapa/reusable-pop.CadastroUsuarios.md, El[rpg usuarios] bTgkj).
create index usuarios_ativos_idx on public.usuarios (departamento_id, perfil_id, nome)
  where ativo;
-- Busca por nome ignorando acento. Usa a MESMA expressão que a consulta da tela precisa usar
-- (`public.fn_unaccent(nome) ilike ...`), senão o planejador ignora o índice (§6.1).
create index usuarios_nome_trgm_idx on public.usuarios
  using gin (public.fn_unaccent(nome) extensions.gin_trgm_ops);

-- permissoes_pagina
create index permissoes_pagina_pagina_idx       on public.permissoes_pagina (pagina_slug);
create index permissoes_pagina_perfil_idx       on public.permissoes_pagina (perfil_id)
  where perfil_id is not null;
create index permissoes_pagina_departamento_idx on public.permissoes_pagina (departamento_id)
  where departamento_id is not null;
create index permissoes_pagina_usuario_idx      on public.permissoes_pagina (usuario_id)
  where usuario_id is not null;
create index permissoes_pagina_criado_por_idx   on public.permissoes_pagina (criado_por);
create index permissoes_pagina_alterado_por_idx on public.permissoes_pagina (alterado_por);
-- Concessão duplicada é ruído e mascara erro de tela: um alvo por página, uma vez.
create unique index permissoes_pagina_perfil_uq on public.permissoes_pagina
  (pagina_slug, perfil_id) where perfil_id is not null;
create unique index permissoes_pagina_departamento_uq on public.permissoes_pagina
  (pagina_slug, departamento_id) where departamento_id is not null;
create unique index permissoes_pagina_usuario_uq on public.permissoes_pagina
  (pagina_slug, usuario_id) where usuario_id is not null;

-- usuario_preferencias
create index usuario_preferencias_pagina_inicial_idx on public.usuario_preferencias (pagina_inicial);
create index usuario_preferencias_criado_por_idx     on public.usuario_preferencias (criado_por);
create index usuario_preferencias_alterado_por_idx   on public.usuario_preferencias (alterado_por);

-- log_acesso: a consulta é "últimos acessos", por usuário ou geral
create index log_acesso_usuario_idx on public.log_acesso (usuario_id, em desc);
create index log_acesso_em_idx      on public.log_acesso (em desc);
create index log_acesso_email_idx   on public.log_acesso (email_tentado, em desc)
  where email_tentado is not null;

-- auditoria: a consulta é "o que aconteceu com esta linha" e "o que este usuário fez"
create index auditoria_linha_idx   on public.auditoria (tabela, linha_id, em desc);
create index auditoria_usuario_idx on public.auditoria (usuario_id, em desc);
create index auditoria_em_idx      on public.auditoria (em desc);

-- config_sistema
create index config_sistema_editavel_idx     on public.config_sistema (editavel_por_perfil);
create index config_sistema_criado_por_idx   on public.config_sistema (criado_por);
create index config_sistema_alterado_por_idx on public.config_sistema (alterado_por);

-- config_copia_email
create index config_copia_email_evento_idx   on public.config_copia_email (evento);
create index config_copia_email_usuario_idx  on public.config_copia_email (usuario_id)
  where usuario_id is not null;
create index config_copia_email_criado_por_idx   on public.config_copia_email (criado_por);
create index config_copia_email_alterado_por_idx on public.config_copia_email (alterado_por);
create unique index config_copia_email_usuario_uq on public.config_copia_email
  (evento, tipo, usuario_id) where usuario_id is not null;
create unique index config_copia_email_email_uq on public.config_copia_email
  (evento, tipo, lower(email)) where email is not null;

-- integracao_tokens
create index integracao_tokens_criado_por_idx   on public.integracao_tokens (criado_por);
create index integracao_tokens_alterado_por_idx on public.integracao_tokens (alterado_por);


-- =====================================================================================
-- 7. TRIGGERS
-- =====================================================================================

-- 7.1 alterado_em / alterado_por (exigência 6). Não vai nas listas fixas de domínio nem em
--     log_acesso/auditoria, que são append-only.
create trigger trg_usuarios_alterado
  before update on public.usuarios
  for each row execute function public.fn_set_alterado();

create trigger trg_permissoes_pagina_alterado
  before update on public.permissoes_pagina
  for each row execute function public.fn_set_alterado();

create trigger trg_usuario_preferencias_alterado
  before update on public.usuario_preferencias
  for each row execute function public.fn_set_alterado();

create trigger trg_config_sistema_alterado
  before update on public.config_sistema
  for each row execute function public.fn_set_alterado();

create trigger trg_config_copia_email_alterado
  before update on public.config_copia_email
  for each row execute function public.fn_set_alterado();

create trigger trg_integracao_tokens_alterado
  before update on public.integracao_tokens
  for each row execute function public.fn_set_alterado();

-- 7.2 Auditoria. `security definer` (dono = postgres) é o que permite gravar numa tabela com
--     RLS e nenhuma policy. `search_path = ''`, com public. explícito.
create function public.fn_auditoria()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  v_antes  jsonb;
  v_depois jsonb;
  v_linha  uuid;
begin
  if tg_op = 'DELETE' then
    v_antes := to_jsonb(old);
    v_linha := (v_antes ->> 'id')::uuid;
  elsif tg_op = 'UPDATE' then
    v_antes  := to_jsonb(old);
    v_depois := to_jsonb(new);
    v_linha  := (v_depois ->> 'id')::uuid;
  else
    v_depois := to_jsonb(new);
    v_linha  := (v_depois ->> 'id')::uuid;
  end if;

  insert into public.auditoria (tabela, linha_id, operacao, usuario_id, antes, depois)
  values (tg_table_name, v_linha, lower(tg_op), auth.uid(), v_antes, v_depois);

  return null;   -- trigger AFTER: o retorno é ignorado
end $$;

comment on function public.fn_auditoria() is
  'Trigger AFTER INSERT/UPDATE/DELETE: grava a linha inteira em auditoria, antes e depois. '
  'Exige que a tabela tenha coluna `id` uuid (auditoria.linha_id é uuid).';

-- Nesta fatia a trilha cobre as tabelas de permissão e de configuração (02 §3.1: "trigger nas
-- tabelas de dinheiro, de permissão e de cadastro"). As de dinheiro entram nas fatias 4 a 8.
create trigger trg_usuarios_auditoria
  after insert or update or delete on public.usuarios
  for each row execute function public.fn_auditoria();

create trigger trg_permissoes_pagina_auditoria
  after insert or update or delete on public.permissoes_pagina
  for each row execute function public.fn_auditoria();

create trigger trg_config_sistema_auditoria
  after insert or update or delete on public.config_sistema
  for each row execute function public.fn_auditoria();

create trigger trg_config_copia_email_auditoria
  after insert or update or delete on public.config_copia_email
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 8. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7 e §7)
-- =====================================================================================
-- Toda tabela com RLS ligada e policy explícita, exceto integracao_tokens e auditoria, que
-- nascem com RLS e NENHUMA policy (só service_role).
-- `anon` não tem policy em tabela nenhuma (§7.3) e, por segurança em profundidade, também não
-- tem privilégio: os formulários públicos gravam por server action com service_role.

alter table public.perfis               enable row level security;
alter table public.departamentos        enable row level security;
alter table public.paginas              enable row level security;
alter table public.usuarios             enable row level security;
alter table public.permissoes_pagina    enable row level security;
alter table public.usuario_preferencias enable row level security;
alter table public.log_acesso           enable row level security;
alter table public.auditoria            enable row level security;
alter table public.config_sistema       enable row level security;
alter table public.config_copia_email   enable row level security;
alter table public.integracao_tokens    enable row level security;

revoke all on table public.perfis               from anon;
revoke all on table public.departamentos        from anon;
revoke all on table public.paginas              from anon;
revoke all on table public.usuarios             from anon;
revoke all on table public.permissoes_pagina    from anon;
revoke all on table public.usuario_preferencias from anon;
revoke all on table public.log_acesso           from anon;
revoke all on table public.auditoria            from anon;
revoke all on table public.config_sistema       from anon;
revoke all on table public.config_copia_email   from anon;
revoke all on table public.integracao_tokens    from anon, authenticated;

-- ------------------------------------------------- Nível DOMÍNIO (§7.2): lê quem está ativo,
-- escreve perfil 1 por server action.
create policy perfis_leitura on public.perfis
  for select to authenticated using (public.fn_usuario_ativo());
create policy perfis_escrita_diretoria on public.perfis
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

create policy departamentos_leitura on public.departamentos
  for select to authenticated using (public.fn_usuario_ativo());
create policy departamentos_escrita_diretoria on public.departamentos
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

create policy paginas_leitura on public.paginas
  for select to authenticated using (public.fn_usuario_ativo());
create policy paginas_escrita_diretoria on public.paginas
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- ------------------------------------------------ Nível RESTRITO (§7.2/§7.3): usuarios
-- Lê o próprio ou perfil <= 2. As telas que só precisam de nome/perfil/departamento de todos
-- usarão a view v_usuarios_publico (§7.3), não esta tabela — RLS é por linha, não por coluna,
-- e cpf/rg/telefone/endereco não podem vazar para toda a empresa.
create policy usuarios_leitura_proprio_ou_gerencia on public.usuarios
  for select to authenticated
  using (
    id = auth.uid()
    or (public.fn_usuario_ativo() and public.fn_hierarquia() <= 2)
  );

-- Escrita só por perfil 1: se o próprio usuário pudesse atualizar a sua linha, poderia trocar
-- o próprio perfil_id — é exatamente o auto-binding que derrubou a autorização no Bubble
-- (specs/00-achados-de-seguranca.md §2.3). Preferência do usuário vai em usuario_preferencias.
create policy usuarios_insert_diretoria on public.usuarios
  for insert to authenticated
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);
create policy usuarios_update_diretoria on public.usuarios
  for update to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);
-- SEM policy de delete, de propósito: desativar é `ativo = false`. Remover usuário é operação
-- de service_role, porque arrasta histórico e auth.users (on delete restrict).

-- ---------------------------------------- Nível RESTRITO (§7.2): permissoes_pagina
create policy permissoes_pagina_leitura on public.permissoes_pagina
  for select to authenticated
  using (
    usuario_id = auth.uid()
    or (public.fn_usuario_ativo() and public.fn_hierarquia() <= 2)
  );
create policy permissoes_pagina_escrita_diretoria on public.permissoes_pagina
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);
-- O menu não depende desta leitura: quem responde "posso ver a página X?" é
-- fn_pode_acessar_pagina, que é security definer.

-- ------------------------------------------------------ usuario_preferencias: só o dono
create policy usuario_preferencias_proprio on public.usuario_preferencias
  for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- ------------------------------------------------------------------------- log_acesso
-- Lê o próprio ou perfil 1. Escrita é service_role: o evento de falha de login acontece antes
-- de existir sessão.
create policy log_acesso_leitura on public.log_acesso
  for select to authenticated
  using (
    usuario_id = auth.uid()
    or (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  );
revoke insert, update, delete on table public.log_acesso from authenticated;

-- ------------------------------------------------------------- Nível FECHADO: auditoria
-- RLS ligada e NENHUMA policy: nenhum acesso pelo cliente. Escrita só pelo trigger
-- (security definer). UPDATE e DELETE revogados, inclusive do dono da tabela (02 §3.1/§7.3):
-- trilha que pode ser editada não é trilha.
revoke update, delete on table public.auditoria from authenticated, anon;
revoke update, delete on table public.auditoria from service_role;
revoke insert          on table public.auditoria from authenticated;

-- ------------------------------------------------- Nível FECHADO: integracao_tokens
-- RLS ligada e NENHUMA policy; privilégios de anon e authenticated já revogados acima.

-- --------------------------------------------------------------------- config_sistema
create policy config_sistema_leitura on public.config_sistema
  for select to authenticated using (public.fn_usuario_ativo());
create policy config_sistema_escrita on public.config_sistema
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() <= editavel_por_perfil)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() <= editavel_por_perfil);

-- ----------------------------------------------------------------- config_copia_email
create policy config_copia_email_leitura on public.config_copia_email
  for select to authenticated using (public.fn_usuario_ativo());
create policy config_copia_email_escrita_diretoria on public.config_copia_email
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);


-- =====================================================================================
-- 9. SEED — listas fixas de acesso (mapa/option-sets.md)
-- =====================================================================================
-- Idempotente: `on conflict do nothing`. Não sobrescreve nome nem descrição já ajustados.

-- Opt.PerfilUsuario — o id É o atributo Hierarquia do option set.
insert into public.perfis (id, chave_bubble, nome) values
  (1, 'diretoria',   'Diretor'),
  (2, 'gerencia',    'Gerente'),
  (3, 'colaborador', 'Analista'),
  (4, 'operador',    'Operador')
on conflict (id) do nothing;

-- Opt.DeptoUsuario — ATENÇÃO: 'licita__o' = Comercial, 'geral' = Operação.
insert into public.departamentos (id, chave_bubble, nome, descricao) values
  (1, 'diretoria',  'Administrativo',
      'RH, Compras, TI, Jurídico, Processos, etc.'),
  (2, 'financeiro', 'Financeiro',
      'Finanças, Contábil, Op. de Caixa, Contas Pagar/Receber, Cobrança, etc.'),
  (3, 'licita__o',  'Comercial',
      'Vendas, Marketing, Publicidade, P&D, Qualidade e Satisfação, etc.'),
  (4, 'geral',      'Operação',
      'Estoque, Logistica, Conferência, Balanço, Carga/Descarga, Frota, etc.')
on conflict (id) do nothing;

-- Opt.MenuPaginas — o slug é o atributo `página` do option set; a ordem é o atributo `ordem`.
-- 'relatorios' e 'sac' não têm ordem no Bubble ([DÚVIDA 17]): recebem 7 e 8, preservando as
-- ordens já existentes. Os atributos hierarquia e DepartamentosAcessiveis não migram (§4).
insert into public.paginas (slug, chave_bubble, nome, ordem) values
  ('inicio',     'inicio',     'Inicio',                   1),
  ('vendas',     'licita__o',  'Fluxo de Vendas',          2),
  ('financeiro', 'financeiro', 'Fluxo Financeiro',         3),
  ('metas',      'dashboard',  'Metas & Vendas',           5),
  ('rotinas',    'manuten__o', 'Manutenção',               6),
  ('relatorios', 'relat_rios', 'Relatórios',               7),
  ('sac',        'sac___nps',  'Suporte de Vendas & Nps',  8)
on conflict (slug) do nothing;

-- Nenhum seed de permissoes_pagina: a concessão inicial é decisão de negócio, feita pela tela
-- de administração (perfil 1). Semear "todo mundo vê tudo" reproduziria o defeito do Bubble.
-- Nenhum seed de config_sistema: cada chave nasce com a fatia que a usa.
-- =====================================================================================
-- FIM da 001_fundacao.sql
-- =====================================================================================
-- =====================================================================================
-- Fecha o que o get_advisors apontou depois da primeira aplicação (25/09/2026).
--
-- Achado: `anon_security_definer_function_executable` e
-- `authenticated_security_definer_function_executable`. O PostgREST publica toda função
-- do schema `public` como RPC em /rest/v1/rpc/<nome>. Como as quatro são SECURITY
-- DEFINER, ficavam chamáveis de fora — inclusive sem sessão.
--
-- O que muda e por quê:
--
--  * As três de autorização continuam executáveis por `authenticated`, e isso é
--    OBRIGATÓRIO: a expressão de uma policy de RLS roda com os privilégios de quem
--    consulta, então revogar EXECUTE de `authenticated` faria toda leitura falhar com
--    permissão negada. Revogamos só de `anon` e de `public`.
--    Para `anon` não há perda: nenhuma policy é `to anon`, e as três já devolviam
--    falso/nulo sem sessão. É defesa em profundidade e cala o alerta.
--
--  * `fn_auditoria` é função de GATILHO e nunca deve ser chamada por ninguém. O
--    privilégio de EXECUTE em função de trigger é verificado na criação do trigger, não
--    a cada disparo, então revogar de todos não quebra a auditoria.
-- =====================================================================================

revoke execute on function public.fn_usuario_ativo()            from anon, public;
revoke execute on function public.fn_hierarquia()               from anon, public;
revoke execute on function public.fn_pode_acessar_pagina(text)  from anon, public;

revoke execute on function public.fn_auditoria() from anon, authenticated, public;

-- `fn_unaccent` é IMMUTABLE e SECURITY INVOKER: usada em índice e em busca, continua
-- executável por quem consulta.
