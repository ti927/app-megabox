-- =====================================================================================
-- 018_arquivos.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Armazenamento de arquivos: buckets PRIVADOS do Supabase Storage e as policies de
-- `storage.objects` amarradas à RLS das tabelas donas (`specs/02` §1.8).
--
-- POR QUE ESTA MIGRATION EXISTE
-- No Bubble, contrato social, RG, contracheque, NF e boleto abrem por URL pública de CDN, sem
-- autenticação e sem expirar (`specs/00-achados-de-seguranca.md` §2.2) — e a Data API anônima
-- devolve essas URLs para qualquer um (medido em 28/09/2026: os 761 anexos, com URL). Aqui:
--   * bucket PRIVADO (public = false): não existe URL pública;
--   * as colunas `*_path` guardam CAMINHO, nunca URL — agora com CHECK que prova o formato;
--   * o arquivo sai por URL ASSINADA de vida curta, gerada no servidor (`lib/arquivos.ts`)
--     depois de conferir, pela sessão, que a linha dona é visível;
--   * a policy de `storage.objects` repete a mesma pergunta ("a linha dona é visível para
--     quem pede?"), então nem o SDK chamado direto do navegador contorna a regra.
--
-- FORMATO DO CAMINHO (o mesmo em todo bucket, e o que o CHECK de cada coluna exige)
--     <bucket>/<id da linha dona>/<uuid>.<ext>
-- O `name` do objeto no Storage é o caminho SEM o prefixo do bucket (`<id>/<uuid>.<ext>`); a
-- coluna guarda COM o prefixo, para o caminho se explicar sozinho (`anexos/...`, `produtos/...`)
-- e para uma coluna nunca apontar para o bucket errado.
--
--   bucket    | linha dona (1ª pasta)                     | coluna que guarda o caminho
--   ----------+-------------------------------------------+------------------------------------
--   anexos    | grupos_clifor / enderecos_clifor / usuarios| anexos.path
--   produtos  | produtos / produto_tipos                   | produtos.foto_*_path, produto_tipos.icone_path
--   entregas  | entregas                                   | entrega_arquivos.path
--   usuarios  | usuarios                                   | usuarios.foto_path
--   clifor    | grupos_clifor                              | grupos_clifor.foto_path
--
-- >>> A REGRA DE DEPARTAMENTO VIRA POLICY (o que a 006 deixou "para quando a tela existir") <<<
-- `pop.AnexosClifor` (bTjcT) filtra a lista por
--   `cpo.TipoAnexo:deptosvisualizam:contains(CurrentUser:cpo.QualDepto)`
-- (mapa/reusable-pop.AnexosClifor.md, linha 53) — no navegador, e sem valer para a URL, que
-- abria para qualquer um. Aqui o filtro é a policy de LEITURA de `anexos`, via
-- `fn_pode_ver_tipo_anexo(tipo)` sobre `tipo_anexo_departamentos` (003). Como a policy de
-- `storage.objects` do bucket `anexos` pergunta "existe linha de `anexos` com este caminho?"
-- DE DENTRO da RLS de `anexos`, o arquivo herda o filtro sem repeti-lo.
-- Vale para TODOS os perfis, Diretor incluído — é o que o Bubble faz (o `contains` não tem
-- exceção por perfil). Consequência medida: `comprovante_endere_o` não tem departamento
-- nenhum em 003 (nem no Bubble), então ninguém lê anexo desse tipo pela sessão.
--
-- >>> DECISÃO NOVA: anexo de USUÁRIO (RG, CPF, contracheque, exames) <<<
-- No Bubble o modo "Usuário" do mesmo popup lista `User.QuaisAnexos` SEM filtro de departamento
-- (linha 52 do reusable) e a URL é pública. Documento pessoal de funcionário não pode ser lido
-- por qualquer colega do departamento: aqui ele segue a MESMA regra da linha de `usuarios` com
-- dado pessoal (001, `usuarios_leitura_proprio_ou_gerencia`): o próprio dono ou hierarquia ≤ 2
-- — e, somado, o filtro de departamento do tipo. Registrado em specs/04-duvidas.md.
--
-- O QUE **NÃO** ENTRA AQUI
--   - Policy de UPDATE e de DELETE em storage.objects: objeto é IMUTÁVEL (arquivo novo = uuid
--     novo) e remover é server action com service_role, depois de conferir permissão — mesmo
--     raciocínio da 006 para o delete de `anexos` (WF bTjeL apagava tudo em um clique).
--   - `anon`: nenhuma policy em bucket nenhum. Bucket privado + zero policy = nada.
--   - `cotacoes`/`propostas` `arquivo_path` (PDF da proposta): entra com a fatia que gera o PDF.
--
-- Sem `begin`/`commit`: aplicada em transação por scripts/aplicar-migration.mjs.
-- Depois de aplicar: `get_advisors` (segurança e desempenho) contra specs/05.
-- =====================================================================================


-- =====================================================================================
-- 1. FUNÇÕES
-- =====================================================================================

-- Converte a 1ª pasta do objeto em uuid SEM lançar erro: `name` vem de quem faz o upload, e um
-- `::uuid` direto transformaria caminho malformado em erro 500 em vez de recusa limpa.
-- `security invoker` (o padrão), imutável: não lê tabela nenhuma.
create or replace function public.fn_uuid_ou_nulo(p_texto text)
  returns uuid
  language sql
  immutable
  set search_path = ''
as $$
  select case
    when p_texto ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then p_texto::uuid
  end
$$;

comment on function public.fn_uuid_ou_nulo(text) is
  'uuid do texto, ou nulo se o texto não for uuid. Usada nas policies de storage.objects para '
  'ler a 1ª pasta do caminho (a linha dona) sem transformar caminho malformado em erro.';

-- O filtro de departamento de Opt.TipoAnexo.DeptosVisualizam. Fechada em `auth.uid()`; o
-- argumento é o TIPO, não uma pessoa. SECURITY INVOKER: só lê a própria linha de `usuarios` (a policy da 001 a mostra ao dono) e
-- `tipo_anexo_departamentos` (lista fixa legível por usuário ativo). Não precisa de definer, e
-- invoker não acrescenta um 7º aviso ao get_advisors (specs/05 §2).
create or replace function public.fn_pode_ver_tipo_anexo(p_tipo smallint)
  returns boolean
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios u
    join public.tipo_anexo_departamentos t
      on t.departamento_id = u.departamento_id
     and t.tipo_anexo_id = p_tipo
    where u.id = auth.uid() and u.ativo
  )
$$;

comment on function public.fn_pode_ver_tipo_anexo(smallint) is
  'Verdadeiro se o departamento de quem chamou está em tipo_anexo_departamentos para o tipo. '
  'É Opt.TipoAnexo.DeptosVisualizam (pop.AnexosClifor, bTjcT) virando regra do banco.';

revoke all on function public.fn_pode_ver_tipo_anexo(smallint) from public, anon;
grant execute on function public.fn_pode_ver_tipo_anexo(smallint) to authenticated;
revoke all on function public.fn_uuid_ou_nulo(text) from public, anon;
grant execute on function public.fn_uuid_ou_nulo(text) to authenticated;


-- =====================================================================================
-- 2. BUCKETS — todos privados, com teto de tamanho e lista de tipos
-- =====================================================================================
-- Os tetos e as listas vêm do que existe no Bubble (medido em 28/09/2026 pela Data API):
--   anexos:   pdf 503, jpeg/jpg 136, docx 89, png 30, doc 1, html 2 (html NÃO entra: é página
--             executável servida do domínio do Storage; os 2 ficam de fora da cópia e são
--             reportados);
--   produtos: png 25, jpg 8, webp 1 (fotos + 4 ícones de tipo);
--   entregas: pdf 412, docx 27, xml 5 (NF-e), jpeg 2, webp 1;
--   usuarios / clifor: png, jpeg, webp, gif (fotos).
-- SVG fica de fora de propósito: é imagem com script.
-- `on conflict do update` para a migration poder ser reaplicada e para corrigir um bucket que
-- alguém tenha criado público pelo painel.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('anexos', 'anexos', false, 26214400, array[
     'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'application/vnd.ms-excel',
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('produtos', 'produtos', false, 5242880, array[
     'image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('entregas', 'entregas', false, 26214400, array[
     'application/pdf', 'application/xml', 'text/xml', 'image/jpeg', 'image/png', 'image/webp',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('usuarios', 'usuarios', false, 5242880, array[
     'image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('clifor', 'clifor', false, 5242880, array[
     'image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public             = false,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- =====================================================================================
-- 3. O CAMINHO É CAMINHO — CHECK em toda coluna `*_path` que esta migration cobre
-- =====================================================================================
-- O comentário de `anexos.path` na 006 diz: "se algum dia guardar https://, o vazamento do
-- Bubble voltou". Comentário não impede; CHECK impede. Formato exigido:
--   <bucket>/<uuid>/<uuid>.<ext>   (ext: 1 a 8 caracteres minúsculos ou dígitos)
-- As tabelas estavam vazias nessas colunas quando esta migration foi escrita (a carga deixou
-- fotos e anexos de fora, justamente para este passo); se não estiverem, o CHECK falha e a
-- migration inteira volta — melhor do que aceitar URL de CDN em silêncio.

alter table public.anexos add constraint anexos_path_formato check (
  path ~ '^anexos/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$');
alter table public.entrega_arquivos add constraint entrega_arquivos_path_formato check (
  path ~ '^entregas/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$');
alter table public.produtos add constraint produtos_fotos_path_formato check (
      (foto_frontal_path  is null or foto_frontal_path  ~ '^produtos/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$')
  and (foto_lateral_path  is null or foto_lateral_path  ~ '^produtos/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$')
  and (foto_superior_path is null or foto_superior_path ~ '^produtos/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$')
  and (foto_inferior_path is null or foto_inferior_path ~ '^produtos/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$'));
alter table public.produto_tipos add constraint produto_tipos_icone_path_formato check (
  icone_path is null or icone_path ~ '^produtos/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$');
alter table public.usuarios add constraint usuarios_foto_path_formato check (
  foto_path is null or foto_path ~ '^usuarios/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$');
alter table public.grupos_clifor add constraint grupos_clifor_foto_path_formato check (
  foto_path is null or foto_path ~ '^clifor/[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$');

-- Único: um objeto é de UMA linha. É também o índice que a policy de leitura dos buckets
-- `anexos` e `entregas` usa (`where a.path = 'anexos/' || name`).
create unique index anexos_path_uidx on public.anexos (path);
create unique index entrega_arquivos_path_uidx on public.entrega_arquivos (path);


-- =====================================================================================
-- 4. POLICY DE LEITURA DE `anexos` — agora com o departamento
-- =====================================================================================
drop policy if exists anexos_leitura on public.anexos;
create policy anexos_leitura on public.anexos
  for select to authenticated
  using (
    (select public.fn_usuario_ativo())
    and public.fn_pode_ver_tipo_anexo(tipo_anexo_id)
    and (
      usuario_id is null
      or usuario_id = (select auth.uid())
      or (select public.fn_hierarquia()) <= 2
    )
  );

comment on policy anexos_leitura on public.anexos is
  'Usuário ativo, cujo DEPARTAMENTO está em tipo_anexo_departamentos para o tipo do anexo '
  '(Opt.TipoAnexo.DeptosVisualizam, pop.AnexosClifor bTjcT) — vale para todo perfil, como no '
  'Bubble. Anexo de USUÁRIO (documento pessoal) exige ainda ser o dono ou hierarquia ≤ 2 '
  '(decisão da 018, mesma regra de dado pessoal de usuarios na 001). A policy do bucket '
  '`anexos` em storage.objects pergunta por esta tabela, então o arquivo herda a regra.';


-- =====================================================================================
-- 5. POLICIES DE storage.objects
-- =====================================================================================
-- Só `authenticated`. Só SELECT e INSERT. Cada bucket responde à pergunta da sua tabela dona.
-- Nome de policy com prefixo `megabox_` para não colidir com policy criada pelo painel.
-- O formato do `name` é conferido no INSERT: upload fora de `<uuid>/<uuid>.<ext>` é recusado,
-- e a 1ª pasta tem de ser uma linha dona que o usuário ENXERGA (a subconsulta roda com a RLS
-- de quem envia).

-- ----------------------------------------------------------------------------- anexos
drop policy if exists megabox_anexos_leitura on storage.objects;
create policy megabox_anexos_leitura on storage.objects
  for select to authenticated
  using (
    bucket_id = 'anexos'
    and exists (select 1 from public.anexos a where a.path = 'anexos/' || name)
  );

drop policy if exists megabox_anexos_envio on storage.objects;
create policy megabox_anexos_envio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'anexos'
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$'
    and (select public.fn_usuario_ativo())
    and (select public.fn_pode_acessar_pagina('cadastros'))
    and (
      exists (select 1 from public.grupos_clifor g
              where g.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
      or exists (select 1 from public.enderecos_clifor e
                 where e.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
      or exists (select 1 from public.usuarios u
                 where u.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
    )
  );

-- ---------------------------------------------------------------------------- produtos
drop policy if exists megabox_produtos_leitura on storage.objects;
create policy megabox_produtos_leitura on storage.objects
  for select to authenticated
  using (
    bucket_id = 'produtos'
    and (select public.fn_usuario_ativo())
    and (
      exists (select 1 from public.produtos p
              where p.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
      or exists (select 1 from public.produto_tipos t
                 where t.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
    )
  );

drop policy if exists megabox_produtos_envio on storage.objects;
create policy megabox_produtos_envio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'produtos'
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$'
    and (select public.fn_usuario_ativo())
    and (select public.fn_pode_acessar_pagina('produtos'))
    and (
      exists (select 1 from public.produtos p
              where p.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
      or exists (select 1 from public.produto_tipos t
                 where t.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
    )
  );

-- ---------------------------------------------------------------------------- entregas
-- Leitura pela linha de entrega_arquivos (cuja RLS é "enxergo a entrega", 009).
-- Envio: página vendas + a entrega da 1ª pasta visível — a mesma condição da escrita de
-- entrega_arquivos na 009.
drop policy if exists megabox_entregas_leitura on storage.objects;
create policy megabox_entregas_leitura on storage.objects
  for select to authenticated
  using (
    bucket_id = 'entregas'
    and exists (select 1 from public.entrega_arquivos ea where ea.path = 'entregas/' || name)
  );

drop policy if exists megabox_entregas_envio on storage.objects;
create policy megabox_entregas_envio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'entregas'
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$'
    and (select public.fn_pode_acessar_pagina('vendas'))
    and exists (select 1 from public.entregas e
                where e.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
  );

-- ---------------------------------------------------------------------------- usuarios
-- Foto de colega aparece em combo e cartão: lê quem enxerga a linha do usuário (004: colegas
-- ativos). Envia a própria foto, ou o perfil 1 (que é quem edita usuarios, 001).
drop policy if exists megabox_usuarios_leitura on storage.objects;
create policy megabox_usuarios_leitura on storage.objects
  for select to authenticated
  using (
    bucket_id = 'usuarios'
    and (select public.fn_usuario_ativo())
    and exists (select 1 from public.usuarios u
                where u.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
  );

drop policy if exists megabox_usuarios_envio on storage.objects;
create policy megabox_usuarios_envio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'usuarios'
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$'
    and (select public.fn_usuario_ativo())
    and (
      public.fn_uuid_ou_nulo((storage.foldername(name))[1]) = (select auth.uid())
      or (select public.fn_hierarquia()) = 1
    )
  );

-- ------------------------------------------------------------------------------ clifor
-- Foto/logo do grupo: mesma leitura de grupos_clifor (usuário ativo), envio pela página
-- cadastros (mesma escrita de grupos_clifor, 006).
drop policy if exists megabox_clifor_leitura on storage.objects;
create policy megabox_clifor_leitura on storage.objects
  for select to authenticated
  using (
    bucket_id = 'clifor'
    and exists (select 1 from public.grupos_clifor g
                where g.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
  );

drop policy if exists megabox_clifor_envio on storage.objects;
create policy megabox_clifor_envio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'clifor'
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.[a-z0-9]{1,8}$'
    and (select public.fn_pode_acessar_pagina('cadastros'))
    and exists (select 1 from public.grupos_clifor g
                where g.id = public.fn_uuid_ou_nulo((storage.foldername(name))[1]))
  );


-- =====================================================================================
-- FIM da 018_arquivos.sql
-- =====================================================================================
-- CONFERÊNCIA
--   5 buckets, todos public = false, com file_size_limit e allowed_mime_types.
--   10 policies em storage.objects (leitura + envio por bucket), todas `to authenticated`;
--   nenhuma de UPDATE/DELETE; nenhuma para anon.
--   anexos_leitura refeita com departamento (+ dono/hierarquia para anexo de usuário).
--   6 CHECKs de formato de caminho; 2 índices únicos de caminho.
--   2 funções: fn_uuid_ou_nulo (invoker, imutável), fn_pode_ver_tipo_anexo (definer, fechada
--   em auth.uid() — entra na lista de specs/05 §2).
-- =====================================================================================
