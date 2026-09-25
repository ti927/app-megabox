-- =====================================================================================
-- 004_usuarios_leitura.sql — corrige como o nome do colega é lido
--
-- Contexto. A 002 criou `v_usuarios_publico` como view SECURITY DEFINER, para contornar
-- a policy restritiva de `usuarios` e permitir que um combo de vendedor mostre o nome de
-- quem não é o próprio usuário. O `get_advisors` classificou isso como **ERROR**
-- (`security_definer_view`), e com razão: a view ignora a RLS da tabela por completo.
-- Funciona, mas a proteção passa a depender de ninguém acrescentar coluna sensível à
-- view depois — proteção que depende de disciplina futura não é proteção.
--
-- O problema real é que **RLS é por linha e o sigilo aqui é por coluna**: todo mundo pode
-- ver o nome de todo mundo, e ninguém além do próprio e da gerência pode ver CPF, RG,
-- telefone e endereço. Contornar isso com definer é usar a ferramenta errada.
--
-- A ferramenta certa é privilégio de coluna, que o Postgres tem desde sempre:
--
--   * `GRANT SELECT (colunas públicas)` decide **quais colunas** `authenticated` enxerga;
--   * a policy decide **quais linhas**;
--   * uma função SECURITY DEFINER estreita (`fn_meu_cadastro`) devolve a linha completa
--     para o próprio dono, que é o único caso que precisa das colunas sensíveis na tela.
--
-- Assim o dado sensível fica inacessível por construção, e não por acordo.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- 1. A view definer sai
-- -------------------------------------------------------------------------------------
drop view if exists public.v_usuarios_publico;

-- -------------------------------------------------------------------------------------
-- 2. Privilégio por coluna
-- -------------------------------------------------------------------------------------
revoke select on table public.usuarios from authenticated;

grant select (
  id, nome, perfil_id, departamento_id, ativo, foto_path,
  substituto_id, ferias_inicio, ferias_fim, nivel_vendedor_id
) on table public.usuarios to authenticated;

comment on column public.usuarios.cpf is
  'Dado pessoal. SELECT não concedido a authenticated (004): nem o próprio dono lê pela '
  'tabela. A tela de perfil usa fn_meu_cadastro(); a de administração usa server action.';
comment on column public.usuarios.rg is
  'Dado pessoal. Mesmo tratamento de cpf — ver 004.';

-- -------------------------------------------------------------------------------------
-- 3. Quais LINHAS: qualquer usuário ativo enxerga os colegas ativos
-- -------------------------------------------------------------------------------------
-- A policy da 001 (própria linha, ou perfil <= 2) continua valendo e é somada a esta:
-- policies permissivas se combinam com OR. O que antes protegia a linha inteira agora é
-- responsabilidade do GRANT de coluna, que é onde o sigilo realmente estava.
create policy usuarios_leitura_colegas on public.usuarios
  for select to authenticated
  using (ativo and public.fn_usuario_ativo());

comment on policy usuarios_leitura_colegas on public.usuarios is
  'Toda tela precisa do nome do vendedor num combo. A linha do colega ativo fica legível, '
  'mas só nas colunas concedidas em 004 — CPF, RG, telefone e endereço não estão entre elas.';

-- -------------------------------------------------------------------------------------
-- 4. O próprio cadastro, completo, para a tela de perfil
-- -------------------------------------------------------------------------------------
create or replace function public.fn_meu_cadastro()
  returns table (
    id uuid, nome text, email_contato text, telefone text,
    cpf text, rg text, cidade text, endereco text, uf char(2),
    perfil_id smallint, departamento_id smallint,
    ferias_inicio date, ferias_fim date
  )
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select u.id, u.nome, u.email_contato, u.telefone,
         u.cpf, u.rg, u.cidade, u.endereco, u.uf,
         u.perfil_id, u.departamento_id,
         u.ferias_inicio, u.ferias_fim
  from public.usuarios u
  where u.id = auth.uid() and u.ativo
$$;

comment on function public.fn_meu_cadastro() is
  'A linha completa de QUEM CHAMOU, e de mais ninguém: o where é auth.uid(), não um '
  'parâmetro. É o único caminho para as colunas sensíveis chegarem à tela, e por isso é '
  'estreito de propósito — não aceita argumento que permita pedir a linha de outro.';

revoke execute on function public.fn_meu_cadastro() from anon, public;
grant  execute on function public.fn_meu_cadastro() to authenticated;
