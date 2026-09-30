-- =====================================================================================
-- 022_transacoes_venda.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Três escritas que a aplicação fazia em VÁRIAS chamadas do PostgREST, sem transação entre
-- elas, viram uma função cada — mesmo molde de `fn_definir_vencedor` (015): security invoker,
-- `search_path = ''`, execute só para authenticated. Depende de 006, 007, 008, 009 e 010.
--
-- O QUE ESTA MIGRATION FAZ
--   1. `fn_definir_principal(p_endereco uuid)`: troca a filial principal do grupo numa
--      transação. Era "desmarca a anterior → marca esta → se falhar, remarca a anterior" em
--      `app/(app)/cadastros/acoes-filial.ts` (enderecos-e-contatos.md §4.5), que podia deixar o
--      grupo SEM principal se a compensação também falhasse.
--   2. `fn_alterar_qtd_item(p_item uuid, p_qtd numeric)`: WF bTOYp0 — grava a qtd do item
--      (bTOYv0) e copia para `qtd_venda` de todos os orçamentos dele (bTOZB0). Eram dois UPDATEs
--      em `app/(app)/vendas/acoes-cotacao.ts`: se o segundo falhasse, item e orçamentos ficavam
--      com quantidades diferentes — e o bruto/comissão do orçamento sai de `qtd_venda`.
--   3. `fn_limpar_rascunhos(p_idade interval default '24 hours')`: WF bTcal (vendas.md §4.2, linha
--      282 e tabela linha 801) — "ao abrir em modo Nova, apaga os temporários de uma sessão
--      anterior". Aqui o carrinho é uma cotação `rascunho = true` (007), e a página de vendas
--      chama a função ao abrir.
--
-- O QUE **NÃO** ENTRA AQUI
--   - Regras de perfil e de etapa: continuam na server action (trava de fornecedor em
--     `podeEscreverTipo`; `cotacaoEditavel` para etapa/arquivamento). Como na 015, as funções
--     não abrem porta nova: quem pode chamá-las já pode fazer os mesmos UPDATE/DELETE direto na
--     tabela, pela mesma RLS.
--   - Nenhuma tabela, nenhuma policy, nenhum GRANT em tabela, nenhum seed.
--
-- >>> DECISÕES <<<
--   D1. SECURITY INVOKER nas três (specs/05 §2, critério para funções novas). A RLS de quem
--       chama decide o que a função lê e grava. UPDATE filtrado pela RLS não dá erro — dá zero
--       linhas —, então cada função confere o `row_count` da escrita que PRECISA acontecer e
--       levanta 42501; a exceção desfaz o que já foi feito na mesma chamada (a transação da RPC).
--   D2. `fn_definir_principal` só aceita filial ATIVA (23514): é a regra de `deveTornarPrincipal`
--       (lib/filial-contato.ts) — filial inativa não é principal. Já principal → não faz nada.
--       Serializa pelo grupo com `for update` nas filiais dele, como a 015 D9 serializa o item:
--       duas trocas simultâneas não colidem no índice único `um_principal_por_grupo`.
--   D3. `fn_alterar_qtd_item` grava o ITEM PRIMEIRO e os orçamentos depois. A ordem importa só
--       para o erro: sem permissão no item (RLS), nada foi tocado; e se um orçamento recusar
--       (ex.: estouro de `numeric(14,2)` no bruto gerado), a exceção desfaz a qtd do item junto.
--       Item sem orçamento é legítimo (carrinho recém-montado): zero orçamentos não é erro.
--       `p_qtd` nulo ou ≤ 0 → 23514 com mensagem; o check da tabela diria o mesmo, sem texto.
--   D4. `fn_limpar_rascunhos` apaga SÓ os rascunhos do PRÓPRIO usuário (`vendedor_id =
--       auth.uid()`), mesmo para Diretor/Gerente, que pela RLS poderiam apagar o de outro: o
--       bTcal limpava os temporários de quem abria a tela (User.TempOrcamentoProdutos era do
--       usuário), e um Diretor abrindo vendas não pode sumir com o carrinho aberto de um vendedor.
--   D5. "ANTIGO" = sem atividade há `p_idade`: nem a cotação, nem item, nem orçamento criado ou
--       alterado nesse intervalo. Olhar só `criado_em` apagaria o carrinho de quem montou ontem e
--       está mexendo agora. Piso de 1 hora (22023 abaixo disso): a página chama com o padrão, e
--       uma chamada com `'0'` apagaria o carrinho aberto em outra aba.
--   D6. FK `restrict` (pedidos, entregas, contas a receber/pagar) é respeitada rascunho a
--       rascunho: cada DELETE roda num bloco com `exception when foreign_key_violation`, e o
--       rascunho referenciado FICA (não deveria existir, mas se existir não é o carrinho de
--       ninguém para apagar). Itens, orçamentos e propostas vão em cascata (007, 008). Devolve
--       quantos apagou.
-- =====================================================================================


-- =====================================================================================
-- 1. fn_definir_principal
-- =====================================================================================
create function public.fn_definir_principal(p_endereco uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_grupo     uuid;
  v_ativo     boolean;
  v_principal boolean;
  v_linhas    integer;
begin
  -- Lido pela RLS de quem chama.
  select e.grupo_id, e.ativo, e.principal
    into v_grupo, v_ativo, v_principal
    from public.enderecos_clifor e
   where e.id = p_endereco;

  if not found then
    raise exception 'Filial não encontrada'
      using errcode = 'P0002';
  end if;

  -- D2
  if not v_ativo then
    raise exception 'Filial inativa não pode ser a principal.'
      using errcode = '23514';
  end if;

  if v_principal then
    return;
  end if;

  -- D2: serializa as trocas do mesmo grupo.
  perform 1
     from public.enderecos_clifor e
    where e.grupo_id = v_grupo
    order by e.id
      for update;

  update public.enderecos_clifor
     set principal = false
   where grupo_id = v_grupo
     and principal
     and id <> p_endereco;

  update public.enderecos_clifor
     set principal = true
   where id = p_endereco;

  -- D1: zero linhas = a RLS de escrita filtrou; a exceção desfaz o "desmarcar" acima.
  get diagnostics v_linhas = row_count;
  if v_linhas = 0 then
    raise exception 'Sem permissão para alterar este cadastro'
      using errcode = '42501';
  end if;
end $$;

comment on function public.fn_definir_principal(uuid) is
  'Troca a filial principal do grupo NUMA transação (enderecos-e-contatos.md §4.5): desmarca a '
  'atual e marca esta, serializado por grupo. Só filial ativa (23514). security invoker (022 D1): '
  'a RLS de enderecos_clifor decide; UPDATE filtrado vira 42501. Trava de fornecedor: server action.';


-- =====================================================================================
-- 2. fn_alterar_qtd_item
-- =====================================================================================
create function public.fn_alterar_qtd_item(p_item uuid, p_qtd numeric)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_linhas integer;
begin
  if p_qtd is null or p_qtd <= 0 then
    raise exception 'Quantidade deve ser maior que zero.'
      using errcode = '23514';
  end if;

  perform 1 from public.cotacao_itens i where i.id = p_item;
  if not found then
    raise exception 'Item não encontrado'
      using errcode = 'P0002';
  end if;

  -- D3: o item primeiro (bTOYv0).
  update public.cotacao_itens
     set qtd = p_qtd
   where id = p_item;

  get diagnostics v_linhas = row_count;
  if v_linhas = 0 then
    raise exception 'Sem permissão para alterar este item'
      using errcode = '42501';
  end if;

  -- bTOZB0: todos os orçamentos do item. O bruto, a comissão e os tributos são colunas geradas.
  update public.orcamentos_fornecedor
     set qtd_venda = p_qtd
   where cotacao_item_id = p_item;
end $$;

comment on function public.fn_alterar_qtd_item(uuid, numeric) is
  'WF bTOYp0: qtd do item (bTOYv0) + qtd_venda de todos os orçamentos dele (bTOZB0) NUMA '
  'transação. security invoker (022 D1): RLS de cotacao_itens/orcamentos_fornecedor decide; item '
  'invisível = P0002, UPDATE filtrado = 42501. Etapa/arquivamento: server action (cotacaoEditavel).';


-- =====================================================================================
-- 3. fn_limpar_rascunhos
-- =====================================================================================
create function public.fn_limpar_rascunhos(p_idade interval default interval '24 hours')
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_eu      uuid := auth.uid();
  v_limite  timestamptz;
  v_id      uuid;
  v_apagou  integer := 0;
begin
  if v_eu is null then
    raise exception 'Sem sessão'
      using errcode = '42501';
  end if;

  -- D5
  if p_idade is null or p_idade < interval '1 hour' then
    raise exception 'Idade mínima do rascunho é 1 hora.'
      using errcode = '22023';
  end if;
  v_limite := now() - p_idade;

  for v_id in
    select c.id
      from public.cotacoes c
     where c.rascunho
       and c.vendedor_id = v_eu                                   -- D4
       and c.criado_em < v_limite
       and coalesce(c.alterado_em, c.criado_em) < v_limite
       and not exists (                                           -- D5
             select 1 from public.cotacao_itens i
              where i.cotacao_id = c.id
                and greatest(i.criado_em, coalesce(i.alterado_em, i.criado_em)) >= v_limite)
       and not exists (
             select 1 from public.orcamentos_fornecedor o
              where o.cotacao_id = c.id
                and greatest(o.criado_em, coalesce(o.alterado_em, o.criado_em)) >= v_limite)
  loop
    begin                                                         -- D6
      delete from public.cotacoes where id = v_id and rascunho;
      if found then
        v_apagou := v_apagou + 1;
      end if;
    exception when foreign_key_violation then
      null;
    end;
  end loop;

  return v_apagou;
end $$;

comment on function public.fn_limpar_rascunhos(interval) is
  'WF bTcal: apaga os carrinhos (cotação rascunho) do PRÓPRIO usuário sem atividade há p_idade '
  '(padrão 24 h, mínimo 1 h). security invoker: RLS de cotacoes. Rascunho preso por FK restrict '
  'fica (022 D6). Devolve quantos apagou. Chamada pela página de vendas ao abrir.';


-- =====================================================================================
-- 4. GRANTS
-- =====================================================================================
revoke execute on function public.fn_definir_principal(uuid)          from public, anon;
revoke execute on function public.fn_alterar_qtd_item(uuid, numeric)  from public, anon;
revoke execute on function public.fn_limpar_rascunhos(interval)       from public, anon;
grant  execute on function public.fn_definir_principal(uuid)          to authenticated;
grant  execute on function public.fn_alterar_qtd_item(uuid, numeric)  to authenticated;
grant  execute on function public.fn_limpar_rascunhos(interval)       to authenticated;


-- =====================================================================================
-- FIM da 022_transacoes_venda.sql
-- =====================================================================================
-- CONFERÊNCIA
--   Nenhuma tabela, policy, GRANT em tabela ou seed.
--   3 funções, todas security invoker, search_path = '', execute revogado de public/anon e
--   concedido só a authenticated. Nenhuma security definer nova.
--   Dinheiro: nenhuma conta aqui; bruto/comissão/tributos continuam colunas geradas (007).
-- =====================================================================================
