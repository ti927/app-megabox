-- =====================================================================================
-- 023_modelos_email.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Seed dos modelos de e-mail do FLUXO DE VENDAS em `modelos_email` (tabela da 012, que nasceu
-- vazia — 012 D9). Até aqui os textos de proposta, pedido, NF/boleto e cancelamento estavam
-- fixos em `lib/vendas-fluxo.ts`; agora o servidor lê o modelo do banco e cai no texto do
-- código se o modelo sumir, for desativado ou não fechar (`montarEmailVendas`).
-- Depende de 001 e 012. Nenhuma tabela, policy ou GRANT; uma função corrigida (D6).
--
-- Fonte dos textos: os padrões de `MODELOS_EMAIL_VENDAS_PADRAO` (lib/vendas-fluxo.ts), que
-- portam vendas.md §6.2 e os WFs bTnvu0 (proposta), bTblt/bTcqO (pedido), bTiFG0 (NF e
-- boleto — assunto EXATO do Bubble) e bTnxa0/bTnxb0 (cancelamento). `lib/vendas-emails.test.ts`
-- confere que este arquivo e o código dizem a MESMA coisa.
--
-- >>> DECISÕES <<<
--   D1. CHAVES `vendas_*`: prefixo do módulo, para não colidir com os 7 modelos de prospecção
--       (historico.md §2.4) nem com os de cobrança/SAC, que entram com as telas deles.
--       `ordem` 101–105 deixa 1–100 para os modelos da tela de histórico.
--   D2. CORPO EM TEXTO PURO com `{{variavel}}`, não HTML: é o mesmo formato do corpo que o
--       vendedor digita no pop (que o substitui por inteiro), e o servidor converte tudo com
--       `textoParaHtml` — que ESCAPA. Quem editar o modelo não consegue injetar HTML no e-mail.
--       Os itens da proposta/pedido continuam anexados pelo código depois do corpo.
--   D3. `on conflict (chave) do nothing`: reaplicar não sobrescreve modelo que o perfil 1 já
--       tenha editado.
--   D4. VARIÁVEIS por chave (as que o código fornece; variável desconhecida no modelo = o
--       código usa o texto padrão daquela parte, nunca manda `{{x}}` ao cliente):
--         vendas_proposta              cotacao, proposta, produtos, cliente, contato, vendedor
--         vendas_pedido_cliente        numero, produtos, nome, contato, vendedor
--         vendas_pedido_fornecedor     numero, produtos, nome, contato, vendedor
--         vendas_nota_boleto           numero, contato_maiusculo, produto, qtd, vendedor
--         vendas_cancelamento_entrega  numero, produtos, para, nome, contato, produto, motivo, vendedor
--   D5. SEM ENVIO: a fila (019) segue em modo registro. Isto só muda de onde vem o texto.
--   D6. CORREÇÃO NA TRILHA (`fn_auditoria`, 001). A 012 pôs o trigger de auditoria em
--       `modelos_email`, mas a função lê `id` uuid e a PK desta tabela é `chave` text: TODA
--       escrita em modelos_email falhava com "linha_id is null" — por isso ela estava vazia e
--       nenhum perfil 1 conseguiria editar modelo. A função passa a aceitar tabela sem `id`:
--       `linha_id` = md5(tabela || ':' || chave)::uuid (determinístico, então a trilha de um
--       modelo continua filtrável por linha_id), e a linha inteira segue em antes/depois.
--       Tabela com `id` uuid (todas as outras): comportamento IDÊNTICO ao da 001. Mesma
--       assinatura, security definer e search_path = ''; o revoke da 001 é repetido.
-- =====================================================================================

-- =====================================================================================
-- 1. fn_auditoria aceita PK textual `chave` (D6)
-- =====================================================================================
create or replace function public.fn_auditoria()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  v_antes  jsonb;
  v_depois jsonb;
  v_linha  uuid;
  v_ref    jsonb;
begin
  if tg_op = 'DELETE' then
    v_antes := to_jsonb(old);
    v_ref   := v_antes;
  elsif tg_op = 'UPDATE' then
    v_antes  := to_jsonb(old);
    v_depois := to_jsonb(new);
    v_ref    := v_depois;
  else
    v_depois := to_jsonb(new);
    v_ref    := v_depois;
  end if;

  if v_ref ? 'id' then
    v_linha := (v_ref ->> 'id')::uuid;
  elsif v_ref ? 'chave' then
    v_linha := md5(tg_table_name || ':' || (v_ref ->> 'chave'))::uuid;
  end if;

  insert into public.auditoria (tabela, linha_id, operacao, usuario_id, antes, depois)
  values (tg_table_name, v_linha, lower(tg_op), auth.uid(), v_antes, v_depois);

  return null;   -- trigger AFTER: o retorno é ignorado
end $$;

comment on function public.fn_auditoria() is
  'Trigger AFTER INSERT/UPDATE/DELETE: grava a linha inteira em auditoria, antes e depois. '
  'linha_id = coluna `id` uuid; em tabela de PK textual `chave` (modelos_email), '
  'md5(tabela:chave)::uuid (023 D6).';

revoke execute on function public.fn_auditoria() from anon, authenticated, public;


-- =====================================================================================
-- 2. SEED dos modelos de vendas
-- =====================================================================================
insert into public.modelos_email (chave, nome, assunto, corpo, ordem) values
  ('vendas_proposta', 'Vendas — envio de proposta',
   'Proposta núm {{cotacao}}/{{proposta}} - Produtos: {{produtos}} - Cliente: {{cliente}}',
   E'Olá {{contato}},\n\nSegue a nossa proposta núm {{cotacao}}/{{proposta}}.\nQualquer dúvida, estou à disposição.\n\nAtenciosamente,\n{{vendedor}}\nGrupo MegaBox',
   101),
  ('vendas_pedido_cliente', 'Vendas — pedido ao cliente',
   'Pedido núm {{numero}} - Produtos: {{produtos}} - Cliente: {{nome}}',
   E'Olá {{contato}},\n\nConfirmamos o seu pedido núm {{numero}}. Seguem abaixo os itens e as entregas programadas.\n\nAtenciosamente,\n{{vendedor}}\nGrupo MegaBox',
   102),
  ('vendas_pedido_fornecedor', 'Vendas — pedido ao fornecedor',
   'Pedido núm {{numero}} - Produtos: {{produtos}} - Fornecedor: {{nome}}',
   E'Olá {{contato}},\n\nSegue o pedido núm {{numero}} para faturamento. Abaixo os itens, a comissão unitária e as entregas programadas.\n\nAtenciosamente,\n{{vendedor}}\nGrupo MegaBox',
   103),
  ('vendas_nota_boleto', 'Vendas — nota fiscal e boleto',
   'Nota fiscal e Boleto - (Pedido núm {{numero}})',
   E'Olá {{contato_maiusculo}}\n\nSegue anexo nota fiscal e boleto referente ao pedido {{numero}} ({{produto}} - {{qtd}})\n\nAtenciosamente,\n{{vendedor}}\nGrupo MegaBox',
   104),
  ('vendas_cancelamento_entrega', 'Vendas — cancelamento de entrega',
   'Cancelamento Entrega: {{numero}} - Produtos: {{produtos}} - {{para}}: {{nome}}',
   E'Olá {{contato}},\n\nInformamos o cancelamento da entrega do pedido {{numero}} ({{produto}}).\nMotivo: {{motivo}}\n\nAtenciosamente,\n{{vendedor}}\nGrupo MegaBox',
   105)
on conflict (chave) do nothing;

-- =====================================================================================
-- FIM da 023_modelos_email.sql
-- =====================================================================================
-- CONFERÊNCIA
--   fn_auditoria: só o caso sem `id` mudou (D6); security definer, execute revogado como na 001.
--   5 linhas em modelos_email, todas ativas (default), chaves no formato do check da 012.
--   Nenhuma tabela, policy, GRANT, função ou segredo. Nenhum envio.
-- =====================================================================================
