-- =====================================================================================
-- 014_rotinas.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 12 de `specs/02-modelo-de-dados-proposto.md` §11 ("Rotinas — painel de manutenção com
-- dry-run"). Depende de 001 (usuarios, paginas, permissoes_pagina, fn_pode_acessar_pagina,
-- fn_set_alterado, fn_auditoria) e 006 (grupos_clifor, enderecos_clifor). NÃO depende de 010/011
-- (escritas em paralelo): nenhuma rotina mantida toca conta, baixa, meta ou comissão.
--
-- Escopo: `rotinas` (catálogo) e `rotina_execucoes` (registro append-only), a função que roda as
-- rotinas (`fn_rotina_rodar`, só service_role) e a concessão nominal da página `rotinas`.
--
-- Fonte no mapa (via `specs/paginas/rotinas.md`): página `rotinas` (Bubble bTeSL, "Manutenção",
-- 39 workflows). Rotinas mantidas: bTmPt0 → ChangeListOfThings bTmPz0 (ativo do endereço segue o
-- grupo) e bTjQe → bTjQk (carteira de clientes). Permissão: `Tbl.ConfigSistema`, linha
-- `QualPagina = Manutenção`, campo `QuaisUsuarios` (specs/04-duvidas.md §1.1, matriz B6).
--
-- >>> O RISCO QUE ESTA MIGRATION FECHA (specs/00-achados-de-seguranca.md §2.6) <<<
-- No Bubble, `/rotinas` não tem guarda (o link do menu é CSS; digitar a URL basta), nenhum dos 38
-- botões pede confirmação, e nada registra quem rodou o quê. Entre eles, bTprj estorna TODAS as
-- baixas de contas a receber e bTmUN0 apaga pedidos, entregas e propostas (rotinas.md §7). Aqui:
--   * TRAVA 1 — quem: só quem tem a página `rotinas` em `permissoes_pagina` (concessão NOMINAL,
--     aos 2 usuários do Bubble), ativo. Conferido DENTRO do banco, para o usuário informado pela
--     server action, a cada execução.
--   * TRAVA 2 — por onde: `fn_rotina_rodar` é executável SÓ por service_role (server action,
--     CLAUDE.md regra 4). `authenticated` não escreve em nenhuma das duas tabelas e não executa
--     nenhuma função daqui. `anon`: nenhuma policy, nenhum GRANT.
--   * TRAVA 3 — seco antes do real: a execução real exige uma execução `seco` bem-sucedida, da
--     MESMA rotina, do MESMO usuário, com os MESMOS parâmetros, terminada há no máximo 15 minutos,
--     que achou algo a alterar e que ainda não foi usada por outra real. E o alvo real tem de ser
--     EXATAMENTE o que o seco mostrou (assinatura dos ids): se o dado mudou no meio, a real falha
--     e nada é alterado. A trava mora num trigger de `rotina_execucoes`, e vale para todo papel.
--   * REGISTRO: cada chamada — seco, real, recusada ou com erro — vira uma linha com quem,
--     quando, parâmetros, modo, motivo, linhas afetadas e resultado (inclusive os valores
--     ANTERIORES de cada linha alterada, que tornam a rotina desfazível à mão). Append-only.
--
-- O QUE ESTA MIGRATION FAZ
--   1. 2 tabelas: `rotinas` (catálogo, escrito só por migration) e `rotina_execucoes`.
--   2. Funções: `fn_rotina_uuids` e `fn_rotina_recusa` (apoio), `fn_rotina_rodar` (executor),
--      3 de trigger. Todas security invoker, `search_path = ''`, execute SÓ service_role.
--   3. Triggers: nascimento validado (trava 3), fim de mão única, DELETE e TRUNCATE recusados.
--   4. Índice em toda FK + o de listagem por rotina/data.
--   5. RLS nas 2: leitura por quem tem a página `rotinas`. Sem policy de escrita.
--   6. Seed: catálogo com 2 rotinas; concessão nominal da página `rotinas` aos 2 usuários
--      nomeados do Bubble, por `bubble_id` (nenhum nome/e-mail neste arquivo).
--
-- O QUE **NÃO** ENTRA AQUI
--   - A tela e as server actions (`app/(app)/admin/rotinas`, rotinas.md §9.1–9.3): próximo passo
--     da fatia. A server action faz: sessão → usuário → `fn_rotina_rodar(..., 'seco')` → mostra
--     contagem e amostra → confirmação (digitar o nome + motivo) → `fn_rotina_rodar(..., 'real',
--     simulacao_id)`.
--   - `pg_cron` (reset do contador de e-mails, refresh de token, conferência noturna de
--     comissões — rotinas.md §8.4): não são rotinas desta tela; entram com as fatias donas.
--
-- >>> CATÁLOGO: O QUE FICA E O QUE MORRE (rotinas.md §8.1, §8.4, §9.6) <<<
-- Critério: só vira rotina o que (a) ainda tem causa no banco novo e (b) não é resolvido por
-- esquema (FK, default, coluna gerada, trigger) nem por tela de negócio que já existe.
-- FICAM (2):
--   sincronizar-ativo-enderecos  bTmPt0 → bTmPz0. O 006 NÃO tem trigger "filial segue o grupo"
--       (rotinas.md §9.4 o previa), e a base carregada tem 74 filiais ATIVAS de grupos INATIVOS.
--       Só DESATIVA (ver D6).
--   transferir-carteira          bTjQe → bTjQk ("clientes carteira julio"), reescrita como
--       operação de negócio com origem e destino explícitos (rotinas.md §8.4, §9.3). Não existe
--       em lugar nenhum do app novo: cadastros troca a carteira de UM cliente por vez.
-- MORREM (com o motivo):
--   bTmGz/bTmHF, bTmIO/bTmHw, bTmUn0/bTmUN0 — carga do sistema antigo, já cumprida; dado entra por
--       ETL (§8.1). `ContasReceberImportado` e flags `Importado` não migram.
--   bTpoG/bTpni gerar comissões passadas — backfill único, laço quebrado (§4.23); CP nasce da
--       entrega (010 D1).
--   bTpoX/bTpop corrigir valor comissão — `contas_pagar.valor_comissao` é COLUNA GERADA (010 D9);
--       divergência com a entrega aparece em `v_conferencia_comissao_entrega` e se corrige por
--       `fn_reequilibrar_parcelas` (010 D4). Não há o que recalcular em massa.
--   bTprd/bTprj "tirar nota 1102" (estorna TODAS as baixas) — estorno é registro por baixa, só
--       perfil 1, na tela financeiro (010 D6/D11, tabela `estornos`). Estorno em massa é o
--       próprio achado §2.6; rotinas [DÚVIDA 6] recomenda não portar.
--   bTjLy/bTjME e bTjMt/bTjMv data do último histórico — o espelho por trigger da 012 (D4,
--       `fn_historico_espelho_recalcular`) substitui as duas.
--   bTeyJ/bTeyP nome em maiúsculas — a busca sem acento/caixa é índice (006, `fn_unaccent` +
--       trigrama); reescrever a razão social em massa só destrói a grafia (§4.2).
--   bThlD lucro real, bTveR liberado = yes, bTvfF ativo = yes — `regime_tributario_id not null`,
--       `liberado`/`ativo` `default true not null` (006); backfill de carga.
--   bTjRl clifor nos endereços — `enderecos_clifor.grupo_id not null` (006).
--   bTiPt fornecedor na CR, bTiTV NF na CR, bToWp0 endereços na CR, bUAht modelo no orçamento,
--       bTtkx criador → vendedor — join/FK resolve (010 D7, 007/008 `vendedor_id not null`).
--   bTmQf/bTmQp e bTnyz1/bTnzH1 info adicional → filial — dado mora na filial (006), sem cópia.
--   bTiEc0 boleto único → lista — `entrega_arquivos` (009); passo de ETL.
--   bTkRn e-mail login → contato, bTnwH0/bToPH0 cópias de e-mail — `config_copia_email` (001).
--   bToUF data NF → recebimento — a data real mora na baixa (010 D6); aproximação não entra.
--   bTmZe "testar pdf" — plugin não instalado (§8.1). bTvmb/bTvmh — workflows vazios.
--   Editor de endereço inline (bTevn), busca quebrada (bTkDT), Monthly/Yearly, Create/Cancel,
--   popup e alerta órfãos — código morto (§8.1).
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA OU CONFLITAVA <<<
--   D1. MODO `seco` | `real` (não `simulacao | aplicacao` de 02 §3): é o vocabulário da tela e do
--       pedido da fatia. Mesmo conteúdo.
--   D2. JANELA DO SECO = 15 MINUTOS, contados do FIM do seco até o INÍCIO do real. Curta o
--       bastante para o dado não ter mudado muito, longa o bastante para ler a amostra e digitar
--       a confirmação. Além da janela, a real compara a ASSINATURA do alvo (md5 dos ids,
--       ordenados) com a do seco: se diferir, a real falha e nada muda — "o que você viu é o que
--       acontece". Um seco autoriza UMA real (índice único parcial em simulacao_id); a real que
--       falha também consome o seco (o dado mudou: refaça o seco).
--   D3. ACESSO NOMINAL, SEM `perfil_minimo`. 02 §3 tem `perfil_minimo default 1`, e rotinas.md
--       §9.1 fala em "perfil = diretor". Mas o dado real (04 §1.1, B6) é: Manutenção NÃO tem
--       perfil nem departamento, só 2 usuários nomeados — e 04 conclui que manter a concessão
--       nominal é o certo. Uma coluna de perfil seria uma segunda autoridade divergente da
--       primeira. A autorização é `permissoes_pagina` (a mesma de todo o app), conferida no banco.
--   D4. A CONCESSÃO É SÓ DOS 2 NOMEADOS. A migration apaga as concessões da página `rotinas` que
--       não sejam desses dois (hoje: as 2 contas criadas por `scripts/bootstrap-acesso.mjs
--       --paginas todas`, sem bubble_id). "Todas as páginas" na conta de bootstrap reproduzia o
--       Bubble ("perfil 1 vê tudo") exatamente na tela mais perigosa. Quem precisar volta a ser
--       concedido por perfil 1, com trilha em `auditoria` (trigger da 001).
--   D5. APPEND-ONLY DE VERDADE. `authenticated` só lê. A única mudança permitida em uma linha é
--       o FIM de uma execução `rodando` (→ ok | erro), uma vez, feita pelo executor; nenhuma outra
--       coluna muda. DELETE e TRUNCATE são recusados por trigger para TODO papel (inclusive
--       service_role). Recusas também ficam registradas (status `recusada`, com o motivo).
--   D6. `sincronizar-ativo-enderecos` SÓ DESATIVA. O Bubble (bTmPz0: `Ativo = QualGrupoCliFor:
--       Ativo`) sincronizava nos dois sentidos, e por isso REATIVAVA filial desativada à mão em
--       grupo ativo, e zerava a de grupo vazio (rotinas.md §4.15). Aqui: filial ativa de grupo
--       inativo → inativa. Reativar filial é decisão por filial, na tela de cadastros.
--   D7. `transferir-carteira` SEGUE A REGRA DO DROPDOWN DE CARTEIRA (cadastros.md, `Dropdown B`
--       bUCXK0): destino é usuário ATIVO fora dos departamentos Financeiro (2) e Operação (4).
--       Origem obrigatória (é o filtro); grupos opcionais (subconjunto). Só `tipo = 'cliente'`
--       (check `carteira_so_cliente` da 006). O Bubble punha TODOS os clientes na carteira de
--       quem clicou (bTjQk: `QualCarteira = CurrentUser`, sem filtro).
--   D8. PARÂMETRO SEM FILTRO É EXPLÍCITO, NUNCA DEFAULT. Chave desconhecida recusa (senão um
--       filtro digitado errado seria ignorado e a rotina rodaria em tudo). "Todos" só com
--       `{"todos": true}`, e só onde o catálogo diz `filtro_obrigatorio = false`.
--   D9. QUEM EXECUTOU APARECE NO DADO. O executor roda como service_role (auth.uid() nulo);
--       antes de alterar, põe o usuário da execução no `sub` das claims DA TRANSAÇÃO
--       (`set_config(..., true)`), e o `fn_set_alterado`/`fn_auditoria` da 001 gravam
--       alterado_por e auditoria.usuario_id = quem executou. Restaurado no fim.
--   D10. MOTIVO OBRIGATÓRIO NA REAL (rotinas.md §9.2 `DialogConfirmacaoRotina`, §9.3 "motivo
--       obrigatório"). Opcional no seco.
--
-- ORDEM DOS BLOCOS: tabelas → índices → funções → triggers → RLS e policies → seeds.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. TABELAS
-- =====================================================================================

-- ------------------------------------------------------------------------------ rotinas
create table public.rotinas (
  slug               text primary key,
  nome               text not null,
  descricao          text not null,
  risco              text not null,
  idempotente        boolean not null,
  reversivel         boolean not null,
  filtro_obrigatorio boolean not null default true,
  parametros         jsonb not null default '{}',
  origem_bubble      text,
  ativa              boolean not null default true,
  criado_em          timestamptz not null default now(),
  constraint slug_formato check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint risco_valido check (risco in ('baixo', 'medio', 'alto')),
  constraint parametros_objeto check (jsonb_typeof(parametros) = 'object'),
  constraint nome_nao_vazio check (btrim(nome) <> '')
);

comment on table public.rotinas is
  'Catálogo das rotinas de manutenção (02 §3; rotinas.md §9.5). Escrito SÓ por migration '
  '(GRANT de escrita revogado de todo papel de cliente e do service_role). Só entram as que '
  'ainda fazem sentido no banco novo — o de-para das 29 rotinas do Bubble está no cabeçalho da '
  '014. Sem perfil_minimo: o acesso é a concessão nominal da página rotinas (D3 da 014).';
comment on column public.rotinas.parametros is
  'Documentação dos parâmetros aceitos: {chave: descrição}. A VALIDAÇÃO é fn_rotina_recusa; '
  'chave fora desta lista é recusada (D8).';
comment on column public.rotinas.reversivel is
  'true = dá para desfazer com o que fica registrado: os valores anteriores de cada linha '
  'alterada vão em rotina_execucoes.resultado.alterados (e em auditoria).';
comment on column public.rotinas.origem_bubble is
  'Workflow(s) do Bubble de que a rotina deriva (mapa/pagina-rotinas.md).';

-- --------------------------------------------------------------------- rotina_execucoes
create table public.rotina_execucoes (
  id              uuid primary key default gen_random_uuid(),
  rotina_slug     text not null references public.rotinas(slug) on delete restrict,
  usuario_id      uuid not null references public.usuarios(id) on delete restrict,
  modo            text not null,
  parametros      jsonb not null default '{}',
  motivo          text,
  simulacao_id    uuid references public.rotina_execucoes(id) on delete restrict,
  status          text not null default 'rodando',
  linhas_afetadas integer,
  resultado       jsonb,
  erro            text,
  inicio          timestamptz not null default now(),
  fim             timestamptz,
  constraint modo_valido check (modo in ('seco', 'real')),
  constraint status_valido check (status in ('rodando', 'ok', 'erro', 'recusada')),
  constraint parametros_objeto check (jsonb_typeof(parametros) = 'object'),
  constraint linhas_nao_negativas check (linhas_afetadas is null or linhas_afetadas >= 0),
  constraint seco_sem_simulacao check (modo = 'real' or simulacao_id is null),
  constraint real_com_simulacao check (
    modo = 'seco' or status = 'recusada' or simulacao_id is not null),
  constraint real_com_motivo check (
    modo = 'seco' or status = 'recusada' or nullif(btrim(motivo), '') is not null),
  constraint nao_simula_a_si check (simulacao_id is distinct from id),
  constraint fim_coerente check ((status = 'rodando') = (fim is null)),
  constraint erro_explicado check (
    status not in ('erro', 'recusada') or nullif(btrim(erro), '') is not null)
);

comment on table public.rotina_execucoes is
  'Uma linha por chamada de rotina — seco, real, recusada ou com erro: quem, quando, '
  'parâmetros, modo, motivo, linhas afetadas, resultado. APPEND-ONLY (D5 da 014): só o fim de '
  'uma execução rodando muda, uma vez; DELETE/TRUNCATE recusados para todo papel. Real exige '
  'seco ok recente com os mesmos parâmetros (trava 3, D2). Não existe no Bubble: hoje nada '
  'registra quem rodou o quê (rotinas.md §7.4.3).';
comment on column public.rotina_execucoes.simulacao_id is
  'Na real: a execução seca que a autorizou. Um seco autoriza uma real (índice único parcial).';
comment on column public.rotina_execucoes.resultado is
  '{assinatura: md5 dos ids-alvo ordenados, amostra: até 20 linhas (seco), alterados: todas as '
  'linhas com o valor ANTERIOR (real)}. Só ids e valores das colunas alteradas.';
comment on column public.rotina_execucoes.linhas_afetadas is
  'Seco: quantas linhas a real alteraria. Real: quantas alterou (= o seco, ou a real falha).';


-- =====================================================================================
-- 2. ÍNDICES (índice em toda FK — 02 §6)
-- =====================================================================================
create index rotina_execucoes_rotina_idx    on public.rotina_execucoes (rotina_slug, inicio desc);
create index rotina_execucoes_usuario_idx   on public.rotina_execucoes (usuario_id);
create index rotina_execucoes_simulacao_idx on public.rotina_execucoes (simulacao_id)
  where simulacao_id is not null;
-- D2: um seco autoriza uma real. Recusada não consome.
create unique index rotina_execucoes_simulacao_uq on public.rotina_execucoes (simulacao_id)
  where modo = 'real' and status <> 'recusada';


-- =====================================================================================
-- 3. FUNÇÕES — todas security invoker, `search_path = ''`, execute só service_role
-- =====================================================================================

-- ------------------------------------------------------------ lista de uuids de um jsonb
create function public.fn_rotina_uuids(p_valor jsonb)
  returns uuid[]
  language plpgsql
  immutable
  security invoker
  set search_path = ''
as $$
declare
  v_ids uuid[];
begin
  if p_valor is null or jsonb_typeof(p_valor) <> 'array' or jsonb_array_length(p_valor) = 0 then
    return null;
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_valor) x
    where jsonb_typeof(x) <> 'string'
       or (x #>> '{}') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) then
    return null;
  end if;
  select array_agg(distinct (x #>> '{}')::uuid) into v_ids from jsonb_array_elements(p_valor) x;
  return v_ids;
end $$;

comment on function public.fn_rotina_uuids(jsonb) is
  'Array JSON não vazio de uuids → uuid[] sem repetição; qualquer outra coisa → nulo.';

-- ------------------------------------------------------- por que esta execução é recusada?
-- Devolve NULO se pode rodar, ou o motivo da recusa. Usada pelo executor (para registrar a
-- recusa) e pelo trigger de nascimento (para que nem um insert direto passe).
create function public.fn_rotina_recusa(
  p_rotina       text,
  p_usuario_id   uuid,
  p_modo         text,
  p_parametros   jsonb,
  p_motivo       text,
  p_simulacao_id uuid
)
  returns text
  language plpgsql
  stable
  security invoker
  set search_path = ''
as $$
declare
  v_rotina public.rotinas%rowtype;
  v_sim    public.rotina_execucoes%rowtype;
  v_chaves text[];
  v_de     uuid;
  v_para   uuid;
begin
  select * into v_rotina from public.rotinas r where r.slug = p_rotina;
  if not found then
    return 'rotina inexistente';
  end if;
  if not v_rotina.ativa then
    return 'rotina desativada';
  end if;

  -- TRAVA 1 (D3): a mesma regra de fn_pode_acessar_pagina, para o usuário DA EXECUÇÃO.
  if not exists (
    select 1
    from public.usuarios u
    join public.permissoes_pagina pp
      on pp.pagina_slug = 'rotinas'
     and (pp.perfil_id = u.perfil_id
          or pp.departamento_id = u.departamento_id
          or pp.usuario_id = u.id)
    where u.id = p_usuario_id and u.ativo
  ) then
    return 'usuário sem a página rotinas, ou inativo';
  end if;

  if p_modo is null or p_modo not in ('seco', 'real') then
    return 'modo deve ser seco ou real';
  end if;
  if p_parametros is null or jsonb_typeof(p_parametros) <> 'object' then
    return 'parâmetros devem ser um objeto JSON';
  end if;

  -- D8: parâmetros por rotina; chave desconhecida recusa.
  select coalesce(array_agg(k), '{}') into v_chaves from jsonb_object_keys(p_parametros) k;

  if p_rotina = 'sincronizar-ativo-enderecos' then
    if not v_chaves <@ array['grupo_ids', 'todos'] then
      return 'parâmetro desconhecido (aceitos: grupo_ids, todos)';
    end if;
    if (p_parametros ? 'grupo_ids') = (p_parametros ? 'todos') then
      return 'informe grupo_ids OU {"todos": true}';
    end if;
    if p_parametros ? 'todos' and p_parametros -> 'todos' <> 'true'::jsonb then
      return 'todos só aceita true';
    end if;
    if p_parametros ? 'grupo_ids' and public.fn_rotina_uuids(p_parametros -> 'grupo_ids') is null then
      return 'grupo_ids deve ser uma lista não vazia de uuids';
    end if;

  elsif p_rotina = 'transferir-carteira' then
    if not v_chaves <@ array['de_vendedor_id', 'para_vendedor_id', 'grupo_ids'] then
      return 'parâmetro desconhecido (aceitos: de_vendedor_id, para_vendedor_id, grupo_ids)';
    end if;
    v_de   := (public.fn_rotina_uuids(jsonb_build_array(p_parametros -> 'de_vendedor_id')))[1];
    v_para := (public.fn_rotina_uuids(jsonb_build_array(p_parametros -> 'para_vendedor_id')))[1];
    if v_de is null or v_para is null then
      return 'de_vendedor_id e para_vendedor_id são obrigatórios (uuid)';
    end if;
    if v_de = v_para then
      return 'origem e destino da carteira são o mesmo usuário';
    end if;
    if not exists (select 1 from public.usuarios u where u.id = v_de) then
      return 'vendedor de origem inexistente';
    end if;
    -- D7: a regra do dropdown de carteira (bUCXK0): ativo, fora de Financeiro (2) e Operação (4).
    if not exists (
      select 1 from public.usuarios u
      where u.id = v_para and u.ativo and u.departamento_id not in (2, 4)
    ) then
      return 'destino deve ser usuário ativo fora dos departamentos Financeiro e Operação';
    end if;
    if p_parametros ? 'grupo_ids' and public.fn_rotina_uuids(p_parametros -> 'grupo_ids') is null then
      return 'grupo_ids deve ser uma lista não vazia de uuids';
    end if;

  else
    return 'rotina sem executor nesta versão';
  end if;

  if p_modo = 'seco' then
    if p_simulacao_id is not null then
      return 'execução seca não referencia simulação';
    end if;
    return null;
  end if;

  -- TRAVA 3 (D2, D10): real só depois de um seco ok, recente, idêntico e não usado.
  if nullif(btrim(p_motivo), '') is null then
    return 'execução real exige motivo';
  end if;
  if p_simulacao_id is null then
    return 'execução real exige uma execução seca antes';
  end if;
  select * into v_sim from public.rotina_execucoes e where e.id = p_simulacao_id;
  if not found or v_sim.modo <> 'seco' then
    return 'simulação não encontrada';
  end if;
  if v_sim.status <> 'ok' then
    return 'a simulação não terminou bem';
  end if;
  if v_sim.rotina_slug <> p_rotina
     or v_sim.usuario_id <> p_usuario_id
     or v_sim.parametros <> p_parametros then
    return 'a simulação foi de outra rotina, de outro usuário ou com outros parâmetros';
  end if;
  if v_sim.fim < now() - interval '15 minutes' then
    return 'simulação vencida (janela de 15 minutos): refaça o seco';
  end if;
  if coalesce(v_sim.linhas_afetadas, 0) = 0 then
    return 'a simulação não achou nada a alterar';
  end if;
  if exists (
    select 1 from public.rotina_execucoes e
    where e.simulacao_id = p_simulacao_id and e.modo = 'real' and e.status <> 'recusada'
  ) then
    return 'esta simulação já foi usada por outra execução real';
  end if;

  return null;
end $$;

comment on function public.fn_rotina_recusa(text, uuid, text, jsonb, text, uuid) is
  'Nulo se a execução pode rodar; senão o motivo. Trava 1 (página rotinas, ativo), validação '
  'dos parâmetros (D8) e trava 3 (seco ok, mesmo usuário/parâmetros, ≤ 15 min, não usado — '
  'D2). Security invoker, execute só service_role: recebe o usuário por parâmetro, então NÃO '
  'pode ser chamável por authenticated (critério de specs/05).';

-- ------------------------------------------------------------------------------ executor
create function public.fn_rotina_rodar(
  p_rotina       text,
  p_usuario_id   uuid,
  p_modo         text,
  p_parametros   jsonb default '{}',
  p_motivo       text  default null,
  p_simulacao_id uuid  default null
)
  returns public.rotina_execucoes
  language plpgsql
  volatile
  security invoker
  set search_path = ''
as $$
declare
  v_recusa     text;
  v_exec       public.rotina_execucoes;
  v_grupos     uuid[];
  v_de         uuid;
  v_para       uuid;
  v_ids        uuid[];
  v_antes      jsonb;
  v_assinatura text;
  v_sub        text;
  v_claims     text;
begin
  -- Erro de forma (não dá nem para registrar a linha): exceção.
  if not exists (select 1 from public.rotinas r where r.slug = p_rotina) then
    raise exception 'Rotina inexistente: %', p_rotina using errcode = '22023';
  end if;
  if not exists (select 1 from public.usuarios u where u.id = p_usuario_id) then
    raise exception 'Usuário inexistente' using errcode = '22023';
  end if;
  if p_modo is null or p_modo not in ('seco', 'real') then
    raise exception 'Modo deve ser seco ou real' using errcode = '22023';
  end if;
  if p_parametros is null or jsonb_typeof(p_parametros) <> 'object' then
    raise exception 'Parâmetros devem ser um objeto JSON' using errcode = '22023';
  end if;

  -- Recusa de regra: fica REGISTRADA (quem tentou o quê), e a função devolve a linha.
  v_recusa := public.fn_rotina_recusa(p_rotina, p_usuario_id, p_modo, p_parametros, p_motivo,
                                      p_simulacao_id);
  if v_recusa is not null then
    insert into public.rotina_execucoes
      (rotina_slug, usuario_id, modo, parametros, motivo, simulacao_id, status, erro)
    values
      (p_rotina, p_usuario_id, p_modo, p_parametros, p_motivo,
       case when p_modo = 'real'
             and exists (select 1 from public.rotina_execucoes e where e.id = p_simulacao_id)
            then p_simulacao_id end,
       'recusada', v_recusa)
    returning * into v_exec;
    return v_exec;
  end if;

  insert into public.rotina_execucoes
    (rotina_slug, usuario_id, modo, parametros, motivo, simulacao_id, status)
  values
    (p_rotina, p_usuario_id, p_modo, p_parametros, p_motivo, p_simulacao_id, 'rodando')
  returning * into v_exec;

  -- D9: quem executou vira auth.uid() DESTA transação (alterado_por, auditoria.usuario_id).
  v_sub    := current_setting('request.jwt.claim.sub', true);
  v_claims := current_setting('request.jwt.claims', true);
  perform set_config('request.jwt.claim.sub', p_usuario_id::text, true);
  perform set_config('request.jwt.claims',
    (coalesce(nullif(v_claims, '')::jsonb, '{}'::jsonb)
       || jsonb_build_object('sub', p_usuario_id))::text, true);

  -- Bloco com EXCEPTION = subtransação: se a rotina falhar, o que ela alterou é desfeito e a
  -- linha de execução (inserida fora do bloco) fica, marcada como erro.
  begin
    v_grupos := public.fn_rotina_uuids(p_parametros -> 'grupo_ids');

    if p_rotina = 'sincronizar-ativo-enderecos' then
      -- bTmPt0 → bTmPz0, só no sentido de desativar (D6).
      if p_modo = 'real' then
        perform 1
          from public.enderecos_clifor e
          join public.grupos_clifor g on g.id = e.grupo_id
         where e.ativo and not g.ativo and (v_grupos is null or g.id = any(v_grupos))
           for update of e;
      end if;
      select coalesce(array_agg(e.id order by e.id), '{}'),
             coalesce(jsonb_agg(jsonb_build_object(
               'id', e.id, 'grupo_id', e.grupo_id, 'ativo_antes', e.ativo) order by e.id), '[]')
        into v_ids, v_antes
        from public.enderecos_clifor e
        join public.grupos_clifor g on g.id = e.grupo_id
       where e.ativo and not g.ativo and (v_grupos is null or g.id = any(v_grupos));
      if p_modo = 'real' then
        update public.enderecos_clifor set ativo = false where id = any(v_ids);
      end if;

    elsif p_rotina = 'transferir-carteira' then
      -- bTjQe → bTjQk, com origem e destino explícitos (D7).
      v_de   := (p_parametros ->> 'de_vendedor_id')::uuid;
      v_para := (p_parametros ->> 'para_vendedor_id')::uuid;
      if p_modo = 'real' then
        perform 1
          from public.grupos_clifor g
         where g.carteira_id = v_de and g.tipo = 'cliente'
           and (v_grupos is null or g.id = any(v_grupos))
           for update;
      end if;
      select coalesce(array_agg(g.id order by g.id), '{}'),
             coalesce(jsonb_agg(jsonb_build_object(
               'id', g.id, 'carteira_antes', g.carteira_id) order by g.id), '[]')
        into v_ids, v_antes
        from public.grupos_clifor g
       where g.carteira_id = v_de and g.tipo = 'cliente'
         and (v_grupos is null or g.id = any(v_grupos));
      if p_modo = 'real' then
        update public.grupos_clifor set carteira_id = v_para where id = any(v_ids);
      end if;
    end if;

    v_assinatura := md5(array_to_string(v_ids, ','));

    -- D2: o alvo real tem de ser o que o seco mostrou.
    if p_modo = 'real' and v_assinatura is distinct from (
         select e.resultado ->> 'assinatura' from public.rotina_execucoes e
         where e.id = p_simulacao_id) then
      raise exception 'O alvo mudou desde a simulação (agora % linhas): nada foi alterado, refaça o seco',
        cardinality(v_ids) using errcode = '40001';
    end if;

    update public.rotina_execucoes
       set status          = 'ok',
           linhas_afetadas = cardinality(v_ids),
           resultado       = case
             when p_modo = 'seco' then jsonb_build_object(
               'assinatura', v_assinatura,
               'amostra', coalesce((select jsonb_agg(x) from (
                   select x from jsonb_array_elements(v_antes) x limit 20) s), '[]'))
             else jsonb_build_object('assinatura', v_assinatura, 'alterados', v_antes)
           end
     where id = v_exec.id
    returning * into v_exec;

  exception when others then
    update public.rotina_execucoes
       set status = 'erro', erro = sqlerrm
     where id = v_exec.id
    returning * into v_exec;
  end;

  perform set_config('request.jwt.claim.sub', coalesce(v_sub, ''), true);
  perform set_config('request.jwt.claims', coalesce(v_claims, ''), true);
  return v_exec;
end $$;

comment on function public.fn_rotina_rodar(text, uuid, text, jsonb, text, uuid) is
  'Executor único das rotinas. SÓ service_role (a server action, depois de validar a sessão e '
  'passar o usuário dela). Seco: calcula alvo, contagem, amostra e assinatura, sem alterar. '
  'Real: exige o seco (trava 3), trava as linhas, confere a assinatura, altera, registra os '
  'valores anteriores. Recusa e erro também ficam em rotina_execucoes. Security invoker (quem '
  'chama é service_role, que já ignora RLS — definer não daria nada a mais).';

-- ----------------------------------------------------------------- triggers do registro
create function public.fn_rotina_execucao_nasce()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_recusa text;
begin
  new.inicio := now();
  if new.status = 'rodando' then
    new.fim := null;
    new.linhas_afetadas := null;
    new.resultado := null;
    new.erro := null;
    v_recusa := public.fn_rotina_recusa(new.rotina_slug, new.usuario_id, new.modo,
                                        new.parametros, new.motivo, new.simulacao_id);
    if v_recusa is not null then
      raise exception 'Execução recusada: %', v_recusa using errcode = '42501';
    end if;
  elsif new.status = 'recusada' then
    new.fim := now();
    new.linhas_afetadas := null;
    new.resultado := null;
  else
    raise exception 'Execução nasce rodando (ou recusada); o resultado vem do executor'
      using errcode = '23514';
  end if;
  return new;
end $$;

comment on function public.fn_rotina_execucao_nasce() is
  'BEFORE INSERT em rotina_execucoes, para todo papel: início = agora; rodando só com a trava '
  'satisfeita (fn_rotina_recusa); ninguém nasce ok/erro.';

create function public.fn_rotina_execucao_imutavel()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'rotina_execucoes é append-only: nada se apaga' using errcode = '55000';
  end if;
  if tg_op = 'TRUNCATE' then
    raise exception 'rotina_execucoes é append-only: nada se apaga' using errcode = '55000';
  end if;
  -- UPDATE: só o fim de uma execução rodando, uma vez.
  if old.status <> 'rodando' or new.status not in ('ok', 'erro') then
    raise exception 'Execução já terminada não muda' using errcode = '55000';
  end if;
  if (to_jsonb(new) - array['status', 'fim', 'linhas_afetadas', 'resultado', 'erro'])
     is distinct from
     (to_jsonb(old) - array['status', 'fim', 'linhas_afetadas', 'resultado', 'erro']) then
    raise exception 'Só o resultado de uma execução muda, e só ao terminar' using errcode = '55000';
  end if;
  new.fim := now();
  return new;
end $$;

comment on function public.fn_rotina_execucao_imutavel() is
  'BEFORE UPDATE/DELETE/TRUNCATE em rotina_execucoes, para TODO papel (D5 da 014): só rodando '
  '→ ok|erro com status/fim/linhas/resultado/erro; DELETE e TRUNCATE recusados.';

revoke execute on function public.fn_rotina_uuids(jsonb) from public, anon, authenticated;
revoke execute on function public.fn_rotina_recusa(text, uuid, text, jsonb, text, uuid)
  from public, anon, authenticated;
revoke execute on function public.fn_rotina_rodar(text, uuid, text, jsonb, text, uuid)
  from public, anon, authenticated;
revoke execute on function public.fn_rotina_execucao_nasce()    from public, anon, authenticated;
revoke execute on function public.fn_rotina_execucao_imutavel() from public, anon, authenticated;
grant  execute on function public.fn_rotina_uuids(jsonb) to service_role;
grant  execute on function public.fn_rotina_recusa(text, uuid, text, jsonb, text, uuid) to service_role;
grant  execute on function public.fn_rotina_rodar(text, uuid, text, jsonb, text, uuid)  to service_role;


-- =====================================================================================
-- 4. TRIGGERS
-- =====================================================================================
create trigger trg_rotina_execucoes_nasce
  before insert on public.rotina_execucoes
  for each row execute function public.fn_rotina_execucao_nasce();

create trigger trg_rotina_execucoes_imutavel
  before update or delete on public.rotina_execucoes
  for each row execute function public.fn_rotina_execucao_imutavel();

create trigger trg_rotina_execucoes_sem_truncate
  before truncate on public.rotina_execucoes
  for each statement execute function public.fn_rotina_execucao_imutavel();


-- =====================================================================================
-- 5. RLS, GRANTS E POLICIES
-- =====================================================================================
-- NENHUMA policy `to anon`, e `revoke all ... from anon` nas duas.
alter table public.rotinas          enable row level security;
alter table public.rotina_execucoes enable row level security;

revoke all on table public.rotinas          from anon;
revoke all on table public.rotina_execucoes from anon;

-- authenticated só lê (a RLS decide o quê). Toda escrita é do executor, via service_role.
revoke insert, update, delete, truncate on table public.rotinas          from authenticated;
revoke insert, update, delete, truncate on table public.rotina_execucoes from authenticated;
-- O catálogo é da migration; o registro só recebe insert e o fim da execução (trigger).
revoke insert, update, delete, truncate on table public.rotinas          from service_role;
revoke delete, truncate                 on table public.rotina_execucoes from service_role;

create policy rotinas_leitura on public.rotinas
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('rotinas')));

create policy rotina_execucoes_leitura on public.rotina_execucoes
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('rotinas')));

comment on policy rotinas_leitura on public.rotinas is
  'Só quem tem a página rotinas (concessão nominal, D3/D4 da 014). Sem policy de escrita.';
comment on policy rotina_execucoes_leitura on public.rotina_execucoes is
  'Só quem tem a página rotinas lê o registro — de todos, é trilha de auditoria. Sem policy de '
  'escrita: insert/update/delete revogados de authenticated (D5).';


-- =====================================================================================
-- 6. SEEDS
-- =====================================================================================

-- --------------------------------------------------------------------- catálogo (2 rotinas)
insert into public.rotinas
  (slug, nome, descricao, risco, idempotente, reversivel, filtro_obrigatorio, parametros,
   origem_bubble)
values
  ('sincronizar-ativo-enderecos',
   'Desativar filiais de clientes/fornecedores inativos',
   'Marca como inativa toda filial ativa cujo grupo (cliente/fornecedor) está inativo. Só '
   'desativa: nunca reativa filial (D6 da 014). A segunda execução não acha nada.',
   'medio', true, true, false,
   '{"grupo_ids": "lista de ids de grupos_clifor (subconjunto)", '
   '"todos": "true para todos os grupos inativos — explícito, nunca por omissão"}',
   'bTmPt0 → bTmPz0 (Button R "desativar enderecos cujo clifo desativado")'),
  ('transferir-carteira',
   'Transferir carteira de clientes',
   'Passa os clientes da carteira de um vendedor para outro. Origem obrigatória; grupos '
   'opcionais. Destino: usuário ativo fora de Financeiro e Operação (regra do dropdown de '
   'carteira, bUCXK0). Os donos anteriores ficam no registro da execução.',
   'alto', true, true, true,
   '{"de_vendedor_id": "uuid do dono atual (obrigatório)", '
   '"para_vendedor_id": "uuid do novo dono (obrigatório)", '
   '"grupo_ids": "lista de ids de grupos_clifor (opcional, subconjunto)"}',
   'bTjQe → bTjQk (Button M "clientes carteira julio"), reescrita com origem e destino')
on conflict (slug) do nothing;

-- ------------------------------------------ concessão nominal da página rotinas (B6, D4)
-- Os 2 usuários de `Tbl.ConfigSistema` (QualPagina = Manutenção).QuaisUsuarios, lidos pela Data
-- API do Bubble em 28/09/2026 e resolvidos por `usuarios.bubble_id`. Só o id do Bubble aqui —
-- nenhum nome ou e-mail. Usuário inativo recebe a concessão mesmo assim (fn_pode_acessar_pagina
-- exige ativo, então ele não entra até ser reativado).
-- Sai só a concessão NÃO nominal (por perfil ou departamento): rotina destrutiva não é
-- "todo perfil 1". Concessão nominal que já exista (ex.: a conta do dono, criada pelo
-- bootstrap) FICA — uma migration não tira acesso de pessoa por efeito colateral. Na primeira
-- aplicação esta linha tinha apagado também as concessões nominais das contas de bootstrap; a
-- do dono foi devolvida à mão e o arquivo corrigido para não repetir.
delete from public.permissoes_pagina pp
 where pp.pagina_slug = 'rotinas'
   and pp.usuario_id is null;

insert into public.permissoes_pagina (pagina_slug, usuario_id)
select 'rotinas', u.id
from public.usuarios u
where u.bubble_id in ('1707754495143x683477483600043440',
                      '1725291470227x984119985928825600')
  and not exists (
    select 1 from public.permissoes_pagina pp
    where pp.pagina_slug = 'rotinas' and pp.usuario_id = u.id);

do $$
declare
  v_n integer;
begin
  select count(*) into v_n
  from public.permissoes_pagina pp
  join public.usuarios u on u.id = pp.usuario_id
  where pp.pagina_slug = 'rotinas'
    and u.bubble_id in ('1707754495143x683477483600043440', '1725291470227x984119985928825600');
  if v_n <> 2 then
    raise notice 'rotinas: % de 2 usuários nomeados resolvidos (carga de usuarios pendente?)', v_n;
  end if;
end $$;


-- =====================================================================================
-- FIM da 014_rotinas.sql
-- =====================================================================================
-- CONFERÊNCIA
--   2 tabelas, 2 com RLS, 2 com `revoke all ... from anon`. ZERO policy para anon.
--   2 policies, ambas de leitura por fn_pode_acessar_pagina('rotinas'). Nenhuma de escrita.
--   GRANT: authenticated só select nas duas; service_role sem escrita no catálogo e sem
--   delete/truncate no registro; trigger recusa DELETE/TRUNCATE/UPDATE fora do fim para todos.
--   FKs indexadas: rotina_slug (rotina_execucoes_rotina_idx), usuario_id, simulacao_id.
--   Funções novas, todas security invoker com search_path = '': 3 de apoio/executor (execute SÓ
--   service_role) e 2 de trigger (execute revogado). Nenhuma security definer.
--   Seeds: 2 rotinas; concessão da página rotinas a 2 usuários por bubble_id (demais removidas).
--   Nenhum dinheiro. Nenhum float. Nenhum nome ou e-mail. Nenhum segredo.
-- =====================================================================================
