-- =====================================================================================
-- 002_acesso_leitura.sql — fatia 0, parte de leitura
--
-- Duas coisas que a tela precisa e que a 001 deixou em aberto:
--
--   1. `v_usuarios_publico` — a policy de `usuarios` é restritiva de propósito (o próprio
--      ou perfil <= 2), porque a linha carrega CPF, RG, telefone e endereço, e RLS é por
--      linha, não por coluna. Mas toda tela precisa do NOME do vendedor num combo. A view
--      expõe só o que é público dentro da empresa.
--
--   2. `fn_minhas_paginas()` — o menu não pode ser montado lendo `permissoes_pagina`
--      direto: a policy deixa o usuário ver as concessões feitas PARA ELE, mas não as
--      feitas para o perfil ou o departamento dele. Quem lê a tabela crua monta um menu
--      furado para Analista e Operador. A função resolve pelas três vias, como
--      `fn_pode_acessar_pagina`, e é o único lugar que decide o que aparece.
--
-- Não entra aqui: nenhuma tabela nova.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- 1. Usuários visíveis dentro da empresa
-- -------------------------------------------------------------------------------------
create or replace view public.v_usuarios_publico
with (security_invoker = false) as
  select u.id,
         u.nome,
         u.perfil_id,
         u.departamento_id,
         u.ativo,
         u.foto_path
  from public.usuarios u;

comment on view public.v_usuarios_publico is
  'Só o que é público dentro da empresa: id, nome, perfil, departamento, ativo e foto. '
  'Sem CPF, RG, telefone e endereço, que ficam na tabela e só o próprio e perfil <= 2 leem '
  '(02 §7.3). security_invoker = false de propósito: a view existe justamente para '
  'contornar a policy restritiva da tabela, expondo um subconjunto seguro de COLUNAS.';

-- A view roda com os privilégios do dono, então o acesso é controlado pelo GRANT.
revoke all on public.v_usuarios_publico from anon;
grant select on public.v_usuarios_publico to authenticated;

-- -------------------------------------------------------------------------------------
-- 2. Páginas que o usuário autenticado pode abrir
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
  where exists (
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
  'As páginas que quem chamou pode abrir, resolvidas pelas três vias de concessão '
  '(perfil, departamento, usuário). É a fonte do menu. Ler permissoes_pagina direto monta '
  'menu furado, porque a policy da tabela só mostra as concessões feitas para o próprio '
  'usuário. Substitui a liberação por option set no navegador, que hoje é CSS '
  '(specs/00-achados-de-seguranca.md §2.3).';

revoke execute on function public.fn_minhas_paginas() from anon, public;
grant  execute on function public.fn_minhas_paginas() to authenticated;
