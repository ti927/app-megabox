-- =====================================================================================
-- 016_financeiro_equipe.sql — a equipe financeira enxerga o dinheiro de todos os vendedores
-- =====================================================================================
-- O DEFEITO QUE ESTA MIGRATION CORRIGE
-- A 010 liberou contas, baixas e entregas para "página financeiro E (hierarquia ≤ 2 OU o
-- próprio vendedor)" — a regra padrão de 02 §7.3. Aplicada ao pé da letra, ela deixa a EQUIPE
-- FINANCEIRA sem trabalho: um Analista do departamento Financeiro (perfil 3) abre a página e
-- não vê a conta de nenhum vendedor, então não dá baixa, não cobra, não emite recibo e não paga
-- comissão. A própria 010 registrou o ponto (D11) como decisão em aberto.
--
-- O QUE O BUBBLE FAZ (matriz B6, specs/04-duvidas.md §1.1)
-- "Fluxo Financeiro" é concedido aos DEPARTAMENTOS Administrativo e Financeiro (e aos perfis
-- Diretor e Analista). Quem está nesses departamentos trabalha as contas de todos — é o
-- departamento, e não a hierarquia, que diz quem opera o financeiro.
--
-- A DECISÃO
-- Equipe financeira = tem a página `financeiro` E é do departamento Administrativo (id 1) ou
-- Financeiro (id 2). Ela lê e opera entregas, contas a receber e contas a pagar de TODOS os
-- vendedores. Tudo o mais fica como a 010 deixou:
--   * o VENDEDOR continua vendo só o que é dele (sigilo de comissão entre vendedores intacto);
--   * um Analista do Comercial com a página financeiro NÃO ganha nada aqui — no Bubble ganharia,
--     porque a concessão por perfil "Analista" lá é de todo Analista. Não reproduzimos esse
--     alargamento: ele expõe a comissão de todos a quem vende. Registrado como [DÚVIDA] em
--     specs/04-duvidas.md para o dono confirmar;
--   * estorno continua só perfil 1 (010, estornos_insercao).
--
-- COMO
-- Só policies ADITIVAS (permissivas combinam por OU) — nenhuma da 010 é alterada, e revogar
-- esta migration é derrubar cinco policies e uma função. A cascata de visibilidade faz o resto:
-- contas_receber, cobranca_contas, entrega_arquivos, cotacoes e pedidos (policies da 010 que
-- perguntam "exists entrega visível") passam a valer para a equipe sem policy própria.
--
-- `fn_equipe_financeira()` é SECURITY INVOKER: lê a própria linha em `usuarios`, que a policy da
-- 001 já mostra ao dono, e `departamento_id` está no GRANT de coluna da 004. Sem definer, sem
-- aviso novo no get_advisors (specs/05-avisos-do-advisor.md).
--
-- Sem `begin`/`commit`: o Supabase aplica migration em transação.
-- =====================================================================================

create or replace function public.fn_equipe_financeira()
  returns boolean
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  select public.fn_pode_acessar_pagina('financeiro')
     and exists (
       select 1
       from public.usuarios u
       where u.id = auth.uid()
         and u.ativo
         and u.departamento_id in (1, 2)   -- Administrativo, Financeiro (seed da 001)
     )
$$;

comment on function public.fn_equipe_financeira() is
  'Verdadeiro para quem opera o financeiro: página financeiro + departamento Administrativo ou '
  'Financeiro (matriz B6 do Bubble). Fechada em auth.uid(), sem parâmetro. Ver o cabeçalho da 016.';

revoke execute on function public.fn_equipe_financeira() from anon, public;
grant  execute on function public.fn_equipe_financeira() to authenticated;

-- ----------------------------------------------------------------------------- entregas
-- Destrava a cascata: com a entrega visível, contas_receber, cobranca_contas,
-- entrega_arquivos, cotacoes e pedidos seguem pelas policies da 010.
create policy entregas_leitura_equipe_financeira on public.entregas
  for select to authenticated
  using ((select public.fn_equipe_financeira()));

create policy entregas_alteracao_equipe_financeira on public.entregas
  for update to authenticated
  using ((select public.fn_equipe_financeira()))
  with check ((select public.fn_equipe_financeira()));

-- ------------------------------------------------------------------------- contas_pagar
-- É a equipe que paga a comissão. O vendedor continua lendo só a dele (010).
create policy contas_pagar_equipe_financeira on public.contas_pagar
  for all to authenticated
  using ((select public.fn_equipe_financeira()))
  with check ((select public.fn_equipe_financeira()));

create policy conta_pagar_entregas_equipe_financeira on public.conta_pagar_entregas
  for all to authenticated
  using ((select public.fn_equipe_financeira()))
  with check ((select public.fn_equipe_financeira()));

-- --------------------------------------------------------------------------------- baixas
-- A 010 exige hierarquia ≤ 2 para baixar conta a pagar; a equipe baixa também.
-- (A baixa de conta a receber já segue a entrega visível.)
create policy baixas_insercao_equipe_financeira on public.baixas
  for insert to authenticated
  with check (
    (select public.fn_equipe_financeira())
    and conta_pagar_id is not null
    and exists (select 1 from public.contas_pagar c where c.id = conta_pagar_id)
  );

-- DELETE continua revogado no GRANT (010, D8): `for all` acima não o reabre.

-- =====================================================================================
-- FIM da 016_financeiro_equipe.sql
-- CONFERÊNCIA: 1 função invoker; 5 policies aditivas; nenhuma policy da 010 alterada.
-- =====================================================================================
