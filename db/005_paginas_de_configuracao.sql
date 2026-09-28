-- =====================================================================================
-- 005_paginas_de_configuracao.sql — os alvos de permissão que faltavam
-- =====================================================================================
-- A 001 semeou `paginas` só com os 7 itens de `Opt.MenuPaginas` (inicio, vendas, financeiro,
-- metas, rotinas, relatorios, sac). Faltam os alvos de `Opt.MenuConfig`, e eles fazem falta
-- na primeira tela de cadastro: as policies de escrita da 006 chamam
-- `fn_pode_acessar_pagina('cadastros')` / `('produtos')`, e `permissoes_pagina.pagina_slug`
-- referencia `paginas(slug)` — sem a linha a concessão não pode nem ser criada, a função
-- devolve falso e **ninguém escreve**. Falha silenciosa: a leitura funciona, a tela abre, e só
-- o botão Salvar morre.
--
-- O QUE ESTA MIGRATION FAZ
--   1. `paginas.tipo` — 'menu' ou 'config' — porque um alvo de configuração NÃO é item de
--      menu lateral, e sem a coluna `fn_minhas_paginas()` passaria a devolvê-lo.
--   2. `fn_minhas_paginas()` recriada, filtrando `tipo = 'menu'`.
--   3. `fn_minhas_configuracoes()` — a mesma resolução pelas três vias, para os alvos
--      `config`, que é o que a engrenagem do cabeçalho precisa.
--   4. Semeia os 2 alvos de que a fatia 2 depende: `cadastros` e `produtos`.
--   5. Semeia a concessão dos dois, conforme a matriz B6 medida no Bubble.
--
-- >>> POR QUE DOIS ALVOS, E NÃO UM <<<
-- No Bubble, "Cliente / Fornecedor" e "Cadastro Produtos" são itens DISTINTOS de
-- `Opt.MenuConfig`, com linhas distintas em `Tbl.ConfigSistema` e matrizes de permissão
-- DIFERENTES (`specs/04-duvidas.md` §1.1, matriz B6):
--
--   * Cliente / Fornecedor → departamento Administrativo + perfis Diretor, Gerente, Analista,
--     Operador;
--   * Cadastro Produtos    → perfis Diretor, Gerente, Analista. **Operador não entra.**
--
-- Um slug só para os dois daria ao Operador a escrita no cadastro de produto. Alargar
-- permissão durante uma migração é o tipo de mudança que ninguém percebe até doer, e o mapa
-- manda (CLAUDE.md regra 1).
--
-- Não são itens do menu lateral: no Bubble "Cliente / Fornecedor" abre a página `cadastros` a
-- partir da ENGRENAGEM (`tool.MenuConfig` WF bTgyl) e "Cadastro Produtos" abre o popup
-- `pop.CadastroProdutos` (bTghQ), também alcançável de `vendas`. Daí `tipo = 'config'` e
-- `ordem` nula: eles são alvo de PERMISSÃO, e a rota que cada um abre é decisão da tela.
--
-- >>> SOBRE OS PERFIS 1..4 EM `cadastros` <<<
-- Conceder os quatro perfis é conceder a todo usuário ativo, e isso torna a linha do
-- departamento Administrativo redundante. As duas linhas entram de propósito, porque é o que o
-- Bubble tem hoje e esta migration não é o lugar de apertar a regra: apertar é decisão de
-- negócio, e vai para a tela de administração com registro em `auditoria`. O que está escrito
-- aqui é o retrato fiel do que já vale, não uma proposta.
--
-- >>> SOBRE A CARGA DO `ConfigSistema` <<<
-- As 14 linhas de permissão do Bubble ainda vão ser carregadas (Fase C), e duas delas são
-- estas. Não há `bubble_id` aqui, então a carga vai inserir a linha equivalente OUTRA VEZ.
-- Isso é inofensivo: `fn_pode_acessar_pagina` pergunta `exists`, então duas concessões iguais
-- valem o mesmo que uma — o próprio Bubble já tem `Relatórios` duplicado. Quem quiser evitar
-- o par repetido roda a carga do `ConfigSistema` ANTES de aplicar esta migration; não é
-- necessário.
--
-- Sem `begin`/`commit`: o Supabase aplica migration em transação.
-- =====================================================================================


-- -------------------------------------------------------------------------------------
-- 1. `paginas.tipo`
-- -------------------------------------------------------------------------------------
alter table public.paginas
  add column if not exists tipo text not null default 'menu'
  check (tipo in ('menu', 'config'));

comment on column public.paginas.tipo is
  '''menu'' = item do menu lateral (Opt.MenuPaginas); ''config'' = alvo de permissão alcançado '
  'pela engrenagem do cabeçalho (Opt.MenuConfig). A tabela guarda os dois porque a AUTORIZAÇÃO '
  'é a mesma mecânica para ambos — permissoes_pagina + fn_pode_acessar_pagina —, e só a forma '
  'de chegar lá difere. Sem esta coluna, fn_minhas_paginas() devolveria os alvos de '
  'configuração e eles apareceriam como item de menu.';

-- As 7 linhas da 001 são todas de menu, e o default já as deixa assim.

-- -------------------------------------------------------------------------------------
-- 2. O menu lateral passa a ignorar os alvos de configuração
-- -------------------------------------------------------------------------------------
create or replace function public.fn_minhas_paginas()
  returns table (slug text, nome text, ordem smallint, icone text)
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select p.slug, p.nome, p.ordem, p.icone
  from public.paginas p
  join public.usuarios u on u.id = auth.uid() and u.ativo
  where p.tipo = 'menu'
    and exists (
      select 1
      from public.permissoes_pagina pp
      where pp.pagina_slug = p.slug
        and (pp.perfil_id = u.perfil_id
             or pp.departamento_id = u.departamento_id
             or pp.usuario_id = u.id)
    )
  order by p.ordem nulls last, p.nome
$$;

comment on function public.fn_minhas_paginas() is
  'As páginas de MENU que quem chamou pode abrir, resolvidas pelas três vias de concessão '
  '(perfil, departamento, usuário). É a fonte do menu lateral. O filtro tipo = ''menu'' entrou '
  'na 005: sem ele, "Cliente / Fornecedor" e "Cadastro Produtos" viriam como item de menu, o '
  'que não são em lugar nenhum do app atual. Ler permissoes_pagina direto monta menu furado, '
  'porque a policy da tabela só mostra as concessões feitas para o próprio usuário.';

-- -------------------------------------------------------------------------------------
-- 3. E a engrenagem ganha a sua própria consulta
-- -------------------------------------------------------------------------------------
create or replace function public.fn_minhas_configuracoes()
  returns table (slug text, nome text, ordem smallint, icone text)
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select p.slug, p.nome, p.ordem, p.icone
  from public.paginas p
  join public.usuarios u on u.id = auth.uid() and u.ativo
  where p.tipo = 'config'
    and exists (
      select 1
      from public.permissoes_pagina pp
      where pp.pagina_slug = p.slug
        and (pp.perfil_id = u.perfil_id
             or pp.departamento_id = u.departamento_id
             or pp.usuario_id = u.id)
    )
  order by p.ordem nulls last, p.nome
$$;

comment on function public.fn_minhas_configuracoes() is
  'Os alvos de CONFIGURAÇÃO que quem chamou pode abrir — o conteúdo do menu da engrenagem. '
  'Fechada em auth.uid() e sem parâmetro, como as demais definer de 001 e 004 '
  '(specs/05-avisos-do-advisor.md §2). No Bubble o item do submenu nasce `button_disabled=True` '
  'e é habilitado por condicional no navegador (specs/paginas/casca-e-configuracao.md §2.3), '
  'ou seja, a trava é CSS: quem inspeciona o elemento entra. Aqui o item nem chega ao cliente, '
  'e de todo modo o menu é cosmético — a trava real é exigirAcesso() no servidor.';

revoke execute on function public.fn_minhas_configuracoes() from anon, public;
grant  execute on function public.fn_minhas_configuracoes() to authenticated;

-- -------------------------------------------------------------------------------------
-- 4. Os dois alvos da fatia 2
-- -------------------------------------------------------------------------------------
insert into public.paginas (slug, chave_bubble, nome, tipo, ordem) values
  ('cadastros', 'cadastro_clientes', 'Cliente / Fornecedor', 'config', null),
  ('produtos',  'cadastro_produtos', 'Cadastro Produtos',    'config', null)
on conflict (slug) do nothing;

-- Os outros 4 itens de Opt.MenuConfig — Configurações de Usuário, Cadastro Usuários,
-- Configurações de Sistema, FollowUp de Pedidos — entram com as fatias que criarem suas telas,
-- pelo mesmo motivo que a 001 não semeou estes dois: alvo de permissão sem tela é convite a
-- conceder acesso a coisa que não existe.

-- -------------------------------------------------------------------------------------
-- 5. A concessão, conforme a matriz B6
-- -------------------------------------------------------------------------------------
-- `alvo_unico` exige EXATAMENTE um alvo por linha (perfil, departamento OU usuário), então uma
-- linha da matriz do Bubble, que mistura os três numa só, vira várias linhas aqui.
insert into public.permissoes_pagina (pagina_slug, perfil_id, departamento_id) values
  -- Cliente / Fornecedor: departamento Administrativo + os 4 perfis
  ('cadastros', null, 1),
  ('cadastros', 1,    null),
  ('cadastros', 2,    null),
  ('cadastros', 3,    null),
  ('cadastros', 4,    null),
  -- Cadastro Produtos: Diretor, Gerente e Analista. Operador NÃO.
  ('produtos',  1,    null),
  ('produtos',  2,    null),
  ('produtos',  3,    null);

-- =====================================================================================
-- FIM da 005_paginas_de_configuracao.sql
-- =====================================================================================
-- CONFERÊNCIA
--   1 coluna nova em `paginas`, com check de domínio e default que preserva as 7 linhas da 001.
--   2 funções: `fn_minhas_paginas()` recriada com o filtro de tipo, `fn_minhas_configuracoes()`
--   nova — ambas `security definer` fechadas em `auth.uid()`, sem parâmetro.
--   2 linhas em `paginas` (tipo 'config', ordem nula) e 8 em `permissoes_pagina`.
--   Nenhuma tabela nova, nenhuma policy nova, nenhuma view.
--
-- DEPOIS DE APLICAR
--   * `get_advisors` (segurança): `fn_minhas_configuracoes` deve aparecer como o 6º WARN de
--     `authenticated_security_definer_function_executable`, aceito pelo critério de
--     `specs/05-avisos-do-advisor.md` §2 (fechada em auth.uid(), sem parâmetro que enderece
--     outro usuário). Qualquer outro achado é novo e trava a fatia.
--   * `scripts/testar-rls.mjs` deve continuar 14/14.
--   * O menu de quem for Operador NÃO deve ganhar item novo: `cadastros` é `tipo = 'config'`.
-- =====================================================================================
