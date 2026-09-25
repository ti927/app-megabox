-- =====================================================================================
-- 003_listas_fixas.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 1 "Listas fixas" de `specs/02-modelo-de-dados-proposto.md` §11.
-- Entrega o vocabulário fechado do sistema: as 19 listas de domínio de §4 que ainda faltavam,
-- os dois enums de §4, as duas tabelas editáveis de §3.8 (`empresas_emissoras`,
-- `icms_aliquotas`) e a FK `usuarios.uf → ufs(sigla)` que a 001 deixou pendente.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Cria os dois enums de §4 (`tipo_pessoa`, `tipo_clifor`) — os únicos option sets que
--      NÃO viram tabela, porque têm dois valores e nenhum atributo.
--   2. Cria as listas fixas de §4 com o molde `id smallint primary key, chave_bubble text
--      not null unique, nome text not null [, atributos]` e SEM as colunas de auditoria de
--      §1.2: são listas de domínio, não dado de negócio.
--      `ufs` é a exceção do molde: a pk é `sigla char(2)` (§4), porque a sigla é estável,
--      legível e é o que as FKs de `usuarios`, `enderecos_clifor` e `icms_aliquotas` usam.
--   3. Cria `tipo_anexo_departamentos`, a ligação que substitui a lista de option set
--      `Opt.TipoAnexo.DeptosVisualizam` (§1.5).
--   4. Cria `empresas_emissoras` e `icms_aliquotas` (§3.8) — estas DUAS TÊM as colunas de
--      auditoria de §1.2, porque são dado editável pela tela, não lista fechada.
--   5. Fecha a FK pendente `usuarios.uf → ufs(sigla)` (a 001 a deixou anotada em comentário).
--   6. Liga RLS em TODA tabela criada, com policy explícita (CLAUDE.md regra 3; §1.7, §7).
--      Nível DOMÍNIO de §7.2: lê qualquer usuário ativo; escreve perfil 1.
--   7. Semeia tudo a partir de `mapa/option-sets.md`, com `on conflict do nothing`.
--
-- O QUE **NÃO** ENTRA AQUI
--   - `niveis_vendedor` (fatia 8). `usuarios.nivel_vendedor_id` continua SEM FK.
--   - `Opt.Smtp`: **NUNCA** vira tabela (§4; `specs/00-achados-de-seguranca.md` §1.1). O
--     option set guarda a senha do SMTP em texto puro. Credencial é variável de ambiente do
--     servidor. Não há nenhum segredo neste arquivo.
--   - `Opt.TiposData`, `Opt.SimNão`, `Opt.OrdenarCampos`, `Opt.AçãoCliFor`, `Opt.Ações`,
--     `Opt.GrupoDeConfigsSistema`, `Opt.FiltrosGmail`: não migram (§4, §9) — são widget de
--     tela, "modo" de popup ou rótulo de leitor de e-mail.
--   - `status_bug` e `partes_sistema`: só se o bug report for internalizado (§4/§9); ficam
--     para a fatia que decidir isso.
--   - Seed de `icms_aliquotas`: os valores vêm da carga de `Tbl.IcmsEstados`, não daqui.
--   - O caminho dos logos de `empresas_emissoras`: entra quando o bucket privado do Storage
--     existir (§1.8). A URL de CDN do Bubble NÃO é migrada.
--
-- ORDEM DOS BLOCOS (a mesma da 001)
--   enums → tabelas → índices → FKs pendentes → triggers → RLS e policies → seed.
--
-- Sem `begin`/`commit`: o Supabase aplica migration em transação.
-- Depois de aplicar: rodar `get_advisors` (segurança e desempenho), como manda §7.3.
-- =====================================================================================


-- =====================================================================================
-- 1. ENUMS (§4)
-- =====================================================================================
-- Regra geral de §1.1: option set vira TABELA, não enum, porque carrega atributos e porque
-- acrescentar valor a enum exige migration. Estes dois são a exceção declarada em §4: dois
-- valores cada, nenhum atributo, e nenhuma chance de crescer.

create type public.tipo_pessoa as enum ('cpf', 'cnpj');
comment on type public.tipo_pessoa is
  'Opt.TipoPessoa. Enum e não tabela (02 §4): dois valores, sem atributo. Os rótulos do '
  'Bubble já eram ''cpf'' e ''cnpj'', então o valor do enum É a chave_bubble.';

create type public.tipo_clifor as enum ('cliente', 'fornecedor');
comment on type public.tipo_clifor is
  'opt.TipoCliFor. Enum e não tabela (02 §4). O valor do enum É a chave_bubble do Bubble.';


-- =====================================================================================
-- 2. TABELAS DE DOMÍNIO (molde de §4, SEM as colunas de auditoria de §1.2)
-- =====================================================================================

-- ------------------------------------------------------------------------------- ufs
-- Única fuga do molde, declarada em §4: a pk é a sigla.
create table public.ufs (
  sigla        char(2) primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.ufs is
  'Opt.UFs (27 opções). Lista fixa de domínio: sem as colunas de auditoria de 02 §1.2. '
  'A pk é a sigla (02 §4), e não um smallint, porque a sigla é estável, legível na URL e é '
  'o que as FKs de usuarios, enderecos_clifor e icms_aliquotas guardam.';
comment on column public.ufs.chave_bubble is
  'ARMADILHA: a chave do Paraná no Bubble é ''pf'', não ''pr'' — erro de digitação na criação '
  'do option set. A carga resolve por chave_bubble, então NÃO corrigir aqui: corrigir '
  'quebraria o de-para de todo endereço do Paraná.';
comment on column public.ufs.nome is
  'Nome do estado. No Bubble o atributo `UF Texto` repetia a sigla, o que deixaria `nome` '
  'inútil; aqui guarda o nome por extenso, que é o que a tela mostra no combo.';

-- ---------------------------------------------------------------------------- etapas
create table public.etapas (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null,
  concluida    boolean not null default false
);

comment on table public.etapas is
  'Opt.Etapas (7 opções). ARMADILHA DO DE-PARA, escrita em 02 §4: as chaves ''pedido'' e '
  '''pedido0'' são opções DIFERENTES — ''pedido'' é a etapa "Pedir" (falta pedir ao '
  'fornecedor) e ''pedido0'' é "Pedido" (já pedido). Resolver SEMPRE por chave_bubble, '
  'NUNCA pelo rótulo: um de-para por rótulo troca as duas etapas de lugar e move o kanban '
  'inteiro para a coluna errada.';
comment on column public.etapas.concluida is
  'Era o atributo `EntregaConcluida` do option set (gravado como `concluido` no export). '
  'Verdadeiro em Financeiro, Concluído e Cancelado: é o que tira o cartão do fluxo ativo.';

-- -------------------------------------------------------------------- cotacao_status
create table public.cotacao_status (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.cotacao_status is
  'Opt.CotacaoStatus (3 opções). ARMADILHA: nenhuma chave bate com o rótulo — ''aberto'' é '
  '"Em andamento", ''or_ando'' é "Parado" e ''negociando'' é "CANCELADO". São chaves de uma '
  'versão antiga do option set, renomeadas só no rótulo. Resolver por chave_bubble; deduzir '
  'pelo nome da chave marca cotação cancelada como em negociação.';

-- ----------------------------------------------------------------- status_financeiro
create table public.status_financeiro (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.status_financeiro is
  'Opt.StatusFinanceiro (4 opções). Serve contas a receber e contas a pagar na mesma lista. '
  'ARMADILHA: a chave de "A receber" é ''em_aberto'', a mesma string que opt.StatusChamado usa '
  'para "Em aberto" em sac_status — chave_bubble é única DENTRO de cada lista, nunca entre '
  'listas. A carga precisa saber de qual option set veio o ponteiro.';

-- -------------------------------------------------------------- prazos_recebimento
create table public.prazos_recebimento (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null,                     -- "30dd"
  dias_prazo   smallint not null,
  ativo        boolean not null default true,
  constraint prazo_dias_nao_negativo check (dias_prazo >= 0)
);

comment on table public.prazos_recebimento is
  'Opt.ParcelasReceber (22 opções no Bubble; 21 semeadas). O option set está inconsistente e '
  'esta migration normaliza (02 §3.8; specs/paginas/financeiro-reusables.md [DÚVIDA 13]). '
  'O QUE FOI FEITO COM CADA CASO: '
  '(1) ''49dd'' não tem `diasprazonumero` no Bubble, então hoje o vencimento calculado vira '
  'HOJE — semeada com dias_prazo = 49, derivado do rótulo, e `dias_prazo` é NOT NULL para que '
  'o defeito não possa voltar. '
  '(2) ''12dd'' aparece DUAS vezes; a segunda está marcada `deleted` no export, então NÃO foi '
  'semeada (exigência 4) — e nem poderia, porque repetiria chave_bubble, que é unique. '
  '(3) o atributo `qtdparcelasnumero` NÃO migra: ele não bate com o rótulo (28dd→4 parcelas, '
  '30dd→5) e é dado de parcelamento, que no modelo novo sai da contagem de linhas de '
  'contas_receber, não de um atributo de lista fixa. '
  '(4) os atributos `ordem`, `dd___dd` e `diasprazotexto` também não migram: são rótulo de '
  'tela, redundantes com `nome` e `dias_prazo`.';
comment on column public.prazos_recebimento.nome is
  'É o `rotulo` de 02 §3.8, renomeado para `nome` para não fugir do molde de §4, que todas as '
  'outras 18 listas desta migration seguem. Mesmo conteúdo: "30dd".';
comment on column public.prazos_recebimento.dias_prazo is
  'NOT NULL de propósito. No Bubble o atributo é opcional, e a opção sem valor (''49dd'') faz '
  'o vencimento cair em HOJE silenciosamente.';
comment on column public.prazos_recebimento.ativo is
  'Prazo que sai de uso vira `ativo = false`; nunca é apagado, porque contas antigas o '
  'referenciam. É o substituto honesto do `deleted` do Bubble.';

-- ------------------------------------------------------------------ formas_pagamento
create table public.formas_pagamento (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.formas_pagamento is
  'Opt.FormaPgto (4 opções). Lista fixa de domínio (02 §4).';

-- ----------------------------------------------------------------------- tipos_frete
create table public.tipos_frete (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.tipos_frete is
  'Opt.TipoFrete (3 opções). ATENÇÃO na leitura de valores: "CIF Informado" (o frete é da '
  'MegaBox e vem destacado) e "CIF Incluso" (já está no preço do fornecedor) são coisas '
  'diferentes no cálculo, e compartilham o prefixo de chave ''cif''.';

-- -------------------------------------------------------------- motivos_arquivamento
create table public.motivos_arquivamento (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.motivos_arquivamento is
  'Opt.MotivoArquivamento (7 opções). Motivo obrigatório ao arquivar cotação/proposta.';

-- ------------------------------------------------------------- regimes_tributarios
create table public.regimes_tributarios (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.regimes_tributarios is
  'opt.RegimeTributario (3 opções). Entra no cálculo de tributo do orçamento, por isso a '
  'escrita é perfil 1: hoje o regime do cliente é gravável por qualquer logado via '
  'auto-binding de Tbl.EnderecosCliFor (specs/00-achados-de-seguranca.md §2.3).';

-- --------------------------------------------------------------------- linhas_produto
create table public.linhas_produto (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.linhas_produto is
  'Opt.ProdutosLinhas (4 opções). ATENÇÃO: a chave ''usado'' existe AQUI e também em '
  'condicoes_produto (Opt.ProdutosCondicao). São listas distintas e a carga tem de resolver '
  'cada ponteiro pelo option set de origem.';

-- ------------------------------------------------------------------ condicoes_produto
create table public.condicoes_produto (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.condicoes_produto is
  'Opt.ProdutosCondicao (3 opções). Ver o aviso de linhas_produto: a chave ''usado'' se '
  'repete nas duas listas.';

-- ------------------------------------------------------------------------- captacoes
create table public.captacoes (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.captacoes is
  'Opt.CaptacaoCliente (5 opções): por onde o cliente chegou. Inclui a opção ''n_a'' (N/A), '
  'que é valor de verdade no Bubble e não ausência de valor — por isso a coluna que a '
  'referencia pode ser NOT NULL sem mentir.';

-- ---------------------------------------------------------------------- tipos_telefone
create table public.tipos_telefone (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.tipos_telefone is
  'Opt.TipoTelefone (3 opções). A chave ''sac'' também existe em tipos_pesquisa e em '
  'sac_tipos_ocorrencia: resolver por option set de origem.';

-- -------------------------------------------------------------------------- tipos_meta
create table public.tipos_meta (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.tipos_meta is
  'Opt.TipoMeta (2 opções): Regular e Substituição. Vira tabela e não enum porque a fatia 8 '
  '(metas e comissão) pode precisar de atributos de cálculo por tipo.';

-- ----------------------------------------------------------------------- tipos_pesquisa
create table public.tipos_pesquisa (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.tipos_pesquisa is
  'Opt.TipoPesquisa (3 opções): SAC, NPS e Pós-Venda. É o que discrimina o formulário '
  'público respondido pelo cliente.';

-- ------------------------------------------------------------- sac_tipos_ocorrencia
create table public.sac_tipos_ocorrencia (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.sac_tipos_ocorrencia is
  'Opt.TipoOcorrencia (6 opções). ARMADILHA: a chave de "Pedido incompleto" é '
  '''falta_de_material'', rótulo antigo. Resolver por chave_bubble.';

-- ------------------------------------------------------------------- sac_prioridades
create table public.sac_prioridades (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.sac_prioridades is
  'opt.prioridade (3 opções: Baixa, Média, Alta). O id segue a ordem crescente de urgência, '
  'então "prioridade >= 2" se lê "Média ou acima". Os atributos do option set '
  '(`alta`, `baixa`, `média`) estão todos marcados `deleted` no export e não migram.';

-- ------------------------------------------------------------------------ sac_status
create table public.sac_status (
  id           smallint primary key,
  chave_bubble text not null unique,
  nome         text not null
);

comment on table public.sac_status is
  'opt.StatusChamado (4 opções). ARMADILHAS: a chave de "Pendente de informações" é '
  '''aguardando_fornecedor'', e a chave ''em_aberto'' se repete em status_financeiro (lá é '
  '"A receber"). Os atributos do option set estão marcados `deleted` e não migram.';

-- ----------------------------------------------------------------------- tipos_anexo
create table public.tipos_anexo (
  id            smallint primary key,
  chave_bubble  text not null unique,
  nome          text not null,
  qual_cadastro text not null,
  constraint qual_cadastro_valido check (qual_cadastro in ('clifor', 'usuario'))
);

comment on table public.tipos_anexo is
  'Opt.TipoAnexo (26 opções). O atributo `DeptosVisualizam` era uma lista de option set e '
  'virou a ligação tipo_anexo_departamentos (02 §1.5). O arquivo em si guarda CAMINHO no '
  'Storage privado, nunca URL (§1.8): hoje contrato social e documento pessoal abrem por URL '
  'de CDN do Bubble sem autenticação (specs/00-achados-de-seguranca.md §2.2).';
comment on column public.tipos_anexo.qual_cadastro is
  'Normalizado para ''clifor'' | ''usuario''. No Bubble o atributo é texto livre com os '
  'valores "Cliente/Fornecedor" e "Usuário" — acento e barra em coluna de discriminação é '
  'convite a erro de comparação. A carga traduz.';

-- ------------------------------------------------------- tipo_anexo_departamentos
create table public.tipo_anexo_departamentos (
  tipo_anexo_id   smallint not null references public.tipos_anexo(id) on delete cascade,
  departamento_id smallint not null references public.departamentos(id) on delete cascade,
  primary key (tipo_anexo_id, departamento_id)
);

comment on table public.tipo_anexo_departamentos is
  'Ligação que substitui Opt.TipoAnexo.DeptosVisualizam (02 §1.5): quais departamentos podem '
  'VER anexos deste tipo. Lista fixa de domínio, sem colunas de auditoria. Quem não tem linha '
  'aqui não vê o anexo — é a lista de permissão, não um enfeite. No Bubble ela só escondia '
  'elemento na tela; a regra de verdade passa a ser a policy da tabela de anexos, na fatia '
  'que criar essa tabela.';


-- =====================================================================================
-- 3. TABELAS EDITÁVEIS DE §3.8 — estas DUAS TÊM as colunas de auditoria de §1.2
-- =====================================================================================
-- Não são lista fechada: razão social, endereço, telefone, logo e alíquota mudam sem
-- migration, e mudança de alíquota mexe em dinheiro. Por isso carregam §1.2 e, no caso de
-- icms_aliquotas, trilha de auditoria.

-- --------------------------------------------------------------- empresas_emissoras
create table public.empresas_emissoras (
  id                   smallint primary key,
  chave_bubble         text not null unique,      -- megabox | paletes_brasil
  nome                 text not null,
  razao                text not null,
  cnpj                 text not null,
  email                text,
  telefone             text,
  endereco             text,
  logo_path            text,
  logo_horizontal_path text,
  -- colunas obrigatórias de §1.2 (a pk é smallint de propósito: chave_bubble faz o papel de
  -- bubble_id, porque a origem é um option set e não um data type)
  criado_em            timestamptz not null default now(),
  criado_por           uuid references public.usuarios(id),
  alterado_em          timestamptz,
  alterado_por         uuid references public.usuarios(id)
);

comment on table public.empresas_emissoras is
  'Era o option set Opt.EmpresaMegabox, com os 7 atributos (02 §3.8). Virou TABELA, e com as '
  'colunas de auditoria de §1.2, porque logo e textos mudam sem migration — é dado editável, '
  'não lista fechada. Sem gatilho de auditoria: public.fn_auditoria() exige coluna `id` uuid '
  '(auditoria.linha_id é uuid) e aqui o id é smallint; a trilha desta tabela são as colunas '
  'alterado_em/alterado_por, mantidas por trigger.';
comment on column public.empresas_emissoras.logo_path is
  'CAMINHO no bucket privado do Storage, nunca URL (02 §1.8). NASCE NULO de propósito: no '
  'Bubble o logo é URL de CDN pública (//...cdn.bubble.io/...) e essa URL NÃO é migrada. O '
  'caminho entra quando o bucket existir e os dois arquivos forem enviados.';
comment on column public.empresas_emissoras.cnpj is
  'Texto, não número: zeros à esquerda e máscara importam. O CNPJ de Paletes Brasil está '
  'preenchido com zeros no Bubble (''000.000.000/0000-00'') — é placeholder, e a tela de '
  'emissão precisa tratar como pendência, não como CNPJ válido.';

-- ------------------------------------------------------------------- icms_aliquotas
create table public.icms_aliquotas (
  id          uuid not null default gen_random_uuid() unique,
  uf_origem   char(2) not null references public.ufs(sigla),
  uf_destino  char(2) not null references public.ufs(sigla),
  aliquota    numeric(7,4) not null,
  -- colunas obrigatórias de §1.2
  bubble_id   text unique,
  criado_em   timestamptz not null default now(),
  criado_por  uuid references public.usuarios(id),
  alterado_em timestamptz,
  alterado_por uuid references public.usuarios(id),
  primary key (uf_origem, uf_destino),
  constraint aliquota_e_fracao check (aliquota >= 0 and aliquota < 1)
);

comment on table public.icms_aliquotas is
  'Era Tbl.IcmsEstados (02 §3.8). Hoje a tabela tem AUTO-BINDING LIBERADO no campo '
  'AliquotaIcms: qualquer usuário logado altera a alíquota de qualquer par origem × destino '
  'direto no banco, sem workflow, sem validação e sem registro de quem alterou '
  '(specs/00-achados-de-seguranca.md §2.3). Aqui a escrita é restrita por RLS a perfil 1 e '
  'passa por gatilho de auditoria; a leitura é de qualquer usuário ativo, porque o cálculo do '
  'orçamento precisa dela. Dado editável, logo TEM as colunas de auditoria de §1.2.';
comment on column public.icms_aliquotas.aliquota is
  'FRAÇÃO, nunca percentual: 0.1200 é 12% (02 §1.3). numeric(7,4), nunca float (CLAUDE.md '
  'regra 10). O check aliquota < 1 é a rede contra a carga gravar 12 em vez de 0.12 — se a '
  'carga estourar o check, é sinal de que a escala veio errada da origem.';
comment on column public.icms_aliquotas.id is
  'Surrogate uuid AO LADO da pk composta (uf_origem, uf_destino), que é a chave de negócio de '
  '§3.8. Existe por um motivo só: public.fn_auditoria() lê `to_jsonb(row) ->> ''id''` e grava '
  'em auditoria.linha_id, que é uuid NOT NULL. Sem esta coluna o gatilho de auditoria falharia '
  'em toda escrita. Não é usado pelo app.';
comment on column public.icms_aliquotas.bubble_id is
  'Id da linha de Tbl.IcmsEstados, para a carga ser idempotente e a recarga segura (02 §1.2). '
  'Aqui a lista NÃO é semeada: os valores vêm da carga.';


-- =====================================================================================
-- 4. ÍNDICES (§6: índice em toda FK e em toda coluna usada em filtro ou ordenação)
-- =====================================================================================
-- As listas de domínio não levam índice além da pk e do unique de chave_bubble: são tabelas
-- de 2 a 27 linhas, que o planejador varre mais rápido do que percorre índice.

-- Ligação: a pk cobre (tipo_anexo_id, departamento_id); falta o outro lado, que é o filtro
-- real da tela ("quais anexos o MEU departamento vê").
create index tipo_anexo_departamentos_departamento_idx
  on public.tipo_anexo_departamentos (departamento_id);

-- icms_aliquotas: a pk cobre uf_origem (e o par). O destino é consultado sozinho quando a
-- tela lista "quanto pago para entregar em X".
create index icms_aliquotas_uf_destino_idx on public.icms_aliquotas (uf_destino);
create index icms_aliquotas_criado_por_idx   on public.icms_aliquotas (criado_por);
create index icms_aliquotas_alterado_por_idx on public.icms_aliquotas (alterado_por);

-- empresas_emissoras: 2 linhas, mas as FKs de auditoria seguem a regra geral de §6.
create index empresas_emissoras_criado_por_idx   on public.empresas_emissoras (criado_por);
create index empresas_emissoras_alterado_por_idx on public.empresas_emissoras (alterado_por);

-- FK nova em usuarios (bloco 5): §6 pede índice em toda FK. A 001 não pôde criá-lo porque
-- a coluna ainda não era FK.
create index usuarios_uf_idx on public.usuarios (uf) where uf is not null;


-- =====================================================================================
-- 5. FKs QUE A 001 DEIXOU PENDENTES
-- =====================================================================================
-- `usuarios.uf` nasceu char(2) SEM FK porque `ufs` é desta fatia; o comentário da coluna em
-- 001 anotou a pendência. Agora fecha.
-- `usuarios.nivel_vendedor_id` continua SEM FK: `niveis_vendedor` é da fatia 8 (migration
-- 008). Não inventar a tabela aqui.

alter table public.usuarios
  add constraint usuarios_uf_fkey foreign key (uf) references public.ufs(sigla);


-- =====================================================================================
-- 6. TRIGGERS
-- =====================================================================================

-- 6.1 alterado_em / alterado_por (exigência 6 do CLAUDE.md), só nas duas tabelas que têm as
--     colunas de §1.2. As listas fixas de domínio não têm essas colunas e não levam trigger.
create trigger trg_empresas_emissoras_alterado
  before update on public.empresas_emissoras
  for each row execute function public.fn_set_alterado();

create trigger trg_icms_aliquotas_alterado
  before update on public.icms_aliquotas
  for each row execute function public.fn_set_alterado();

-- 6.2 Auditoria de icms_aliquotas. É a exigência de §3.8: a alíquota entra no cálculo de
--     tributo do orçamento, e hoje qualquer logado a altera sem deixar rastro
--     (specs/00-achados-de-seguranca.md §2.3). A trilha registra linha inteira antes/depois.
create trigger trg_icms_aliquotas_auditoria
  after insert or update or delete on public.icms_aliquotas
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 7. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7 e §7)
-- =====================================================================================
-- Nível DOMÍNIO de §7.2 para TODAS as tabelas desta migration, inclusive icms_aliquotas e
-- empresas_emissoras, que §7.2 lista explicitamente nesse nível:
--   select  → qualquer usuário ativo   (fn_usuario_ativo())
--   all     → perfil 1                 (fn_hierarquia() = 1), por server action
-- `anon` não tem policy em tabela nenhuma (§7.3) e, por defesa em profundidade, também perde
-- o privilégio de tabela.

alter table public.ufs                      enable row level security;
alter table public.etapas                   enable row level security;
alter table public.cotacao_status            enable row level security;
alter table public.status_financeiro         enable row level security;
alter table public.prazos_recebimento        enable row level security;
alter table public.formas_pagamento          enable row level security;
alter table public.tipos_frete               enable row level security;
alter table public.motivos_arquivamento      enable row level security;
alter table public.regimes_tributarios       enable row level security;
alter table public.linhas_produto            enable row level security;
alter table public.condicoes_produto         enable row level security;
alter table public.captacoes                 enable row level security;
alter table public.tipos_telefone            enable row level security;
alter table public.tipos_meta                enable row level security;
alter table public.tipos_pesquisa            enable row level security;
alter table public.sac_tipos_ocorrencia      enable row level security;
alter table public.sac_prioridades           enable row level security;
alter table public.sac_status                enable row level security;
alter table public.tipos_anexo                enable row level security;
alter table public.tipo_anexo_departamentos   enable row level security;
alter table public.empresas_emissoras         enable row level security;
alter table public.icms_aliquotas             enable row level security;

revoke all on table public.ufs                    from anon;
revoke all on table public.etapas                 from anon;
revoke all on table public.cotacao_status         from anon;
revoke all on table public.status_financeiro      from anon;
revoke all on table public.prazos_recebimento     from anon;
revoke all on table public.formas_pagamento       from anon;
revoke all on table public.tipos_frete            from anon;
revoke all on table public.motivos_arquivamento   from anon;
revoke all on table public.regimes_tributarios    from anon;
revoke all on table public.linhas_produto         from anon;
revoke all on table public.condicoes_produto      from anon;
revoke all on table public.captacoes              from anon;
revoke all on table public.tipos_telefone         from anon;
revoke all on table public.tipos_meta             from anon;
revoke all on table public.tipos_pesquisa         from anon;
revoke all on table public.sac_tipos_ocorrencia   from anon;
revoke all on table public.sac_prioridades        from anon;
revoke all on table public.sac_status             from anon;
revoke all on table public.tipos_anexo            from anon;
revoke all on table public.tipo_anexo_departamentos from anon;
revoke all on table public.empresas_emissoras     from anon;
revoke all on table public.icms_aliquotas         from anon;

-- ufs
create policy ufs_leitura on public.ufs
  for select to authenticated using (public.fn_usuario_ativo());
create policy ufs_escrita_diretoria on public.ufs
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- etapas
create policy etapas_leitura on public.etapas
  for select to authenticated using (public.fn_usuario_ativo());
create policy etapas_escrita_diretoria on public.etapas
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- cotacao_status
create policy cotacao_status_leitura on public.cotacao_status
  for select to authenticated using (public.fn_usuario_ativo());
create policy cotacao_status_escrita_diretoria on public.cotacao_status
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- status_financeiro
create policy status_financeiro_leitura on public.status_financeiro
  for select to authenticated using (public.fn_usuario_ativo());
create policy status_financeiro_escrita_diretoria on public.status_financeiro
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- prazos_recebimento
create policy prazos_recebimento_leitura on public.prazos_recebimento
  for select to authenticated using (public.fn_usuario_ativo());
create policy prazos_recebimento_escrita_diretoria on public.prazos_recebimento
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- formas_pagamento
create policy formas_pagamento_leitura on public.formas_pagamento
  for select to authenticated using (public.fn_usuario_ativo());
create policy formas_pagamento_escrita_diretoria on public.formas_pagamento
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- tipos_frete
create policy tipos_frete_leitura on public.tipos_frete
  for select to authenticated using (public.fn_usuario_ativo());
create policy tipos_frete_escrita_diretoria on public.tipos_frete
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- motivos_arquivamento
create policy motivos_arquivamento_leitura on public.motivos_arquivamento
  for select to authenticated using (public.fn_usuario_ativo());
create policy motivos_arquivamento_escrita_diretoria on public.motivos_arquivamento
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- regimes_tributarios
create policy regimes_tributarios_leitura on public.regimes_tributarios
  for select to authenticated using (public.fn_usuario_ativo());
create policy regimes_tributarios_escrita_diretoria on public.regimes_tributarios
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- linhas_produto
create policy linhas_produto_leitura on public.linhas_produto
  for select to authenticated using (public.fn_usuario_ativo());
create policy linhas_produto_escrita_diretoria on public.linhas_produto
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- condicoes_produto
create policy condicoes_produto_leitura on public.condicoes_produto
  for select to authenticated using (public.fn_usuario_ativo());
create policy condicoes_produto_escrita_diretoria on public.condicoes_produto
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- captacoes
create policy captacoes_leitura on public.captacoes
  for select to authenticated using (public.fn_usuario_ativo());
create policy captacoes_escrita_diretoria on public.captacoes
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- tipos_telefone
create policy tipos_telefone_leitura on public.tipos_telefone
  for select to authenticated using (public.fn_usuario_ativo());
create policy tipos_telefone_escrita_diretoria on public.tipos_telefone
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- tipos_meta
create policy tipos_meta_leitura on public.tipos_meta
  for select to authenticated using (public.fn_usuario_ativo());
create policy tipos_meta_escrita_diretoria on public.tipos_meta
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- tipos_pesquisa
create policy tipos_pesquisa_leitura on public.tipos_pesquisa
  for select to authenticated using (public.fn_usuario_ativo());
create policy tipos_pesquisa_escrita_diretoria on public.tipos_pesquisa
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- sac_tipos_ocorrencia
create policy sac_tipos_ocorrencia_leitura on public.sac_tipos_ocorrencia
  for select to authenticated using (public.fn_usuario_ativo());
create policy sac_tipos_ocorrencia_escrita_diretoria on public.sac_tipos_ocorrencia
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- sac_prioridades
create policy sac_prioridades_leitura on public.sac_prioridades
  for select to authenticated using (public.fn_usuario_ativo());
create policy sac_prioridades_escrita_diretoria on public.sac_prioridades
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- sac_status
create policy sac_status_leitura on public.sac_status
  for select to authenticated using (public.fn_usuario_ativo());
create policy sac_status_escrita_diretoria on public.sac_status
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- tipos_anexo
create policy tipos_anexo_leitura on public.tipos_anexo
  for select to authenticated using (public.fn_usuario_ativo());
create policy tipos_anexo_escrita_diretoria on public.tipos_anexo
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- tipo_anexo_departamentos — é lista de PERMISSÃO de visibilidade de anexo, por isso a
-- escrita é perfil 1 como as demais, e a leitura é liberada ao usuário ativo: a tela precisa
-- saber que tipos pode oferecer. Quem decide se o ARQUIVO aparece é a policy da tabela de
-- anexos, na fatia que a criar — não esta leitura.
create policy tipo_anexo_departamentos_leitura on public.tipo_anexo_departamentos
  for select to authenticated using (public.fn_usuario_ativo());
create policy tipo_anexo_departamentos_escrita_diretoria on public.tipo_anexo_departamentos
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- empresas_emissoras (§7.2 lista no nível DOMÍNIO)
create policy empresas_emissoras_leitura on public.empresas_emissoras
  for select to authenticated using (public.fn_usuario_ativo());
create policy empresas_emissoras_escrita_diretoria on public.empresas_emissoras
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);

-- icms_aliquotas (§7.2 nível DOMÍNIO; §3.8 exige escrita só perfil 1 + auditoria)
create policy icms_aliquotas_leitura on public.icms_aliquotas
  for select to authenticated using (public.fn_usuario_ativo());
create policy icms_aliquotas_escrita_diretoria on public.icms_aliquotas
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_hierarquia() = 1)
  with check (public.fn_usuario_ativo() and public.fn_hierarquia() = 1);


-- =====================================================================================
-- 8. SEED — a partir de `mapa/option-sets.md`
-- =====================================================================================
-- Idempotente em toda lista (`on conflict do nothing`): não sobrescreve nome já ajustado
-- pela tela. Opção marcada `deleted` no mapa NÃO é semeada, e está dito onde acontece.
-- O id segue a ordem do option set, salvo onde um comentário diga o contrário.

-- Opt.UFs — 27 opções. A chave do Paraná é 'pf' no Bubble (erro de digitação de lá).
insert into public.ufs (sigla, chave_bubble, nome) values
  ('AC', 'ac', 'Acre'),
  ('AL', 'al', 'Alagoas'),
  ('AM', 'am', 'Amazonas'),
  ('AP', 'ap', 'Amapá'),
  ('BA', 'ba', 'Bahia'),
  ('CE', 'ce', 'Ceará'),
  ('DF', 'df', 'Distrito Federal'),
  ('ES', 'es', 'Espírito Santo'),
  ('GO', 'go', 'Goiás'),
  ('MA', 'ma', 'Maranhão'),
  ('MT', 'mt', 'Mato Grosso'),
  ('MS', 'ms', 'Mato Grosso do Sul'),
  ('MG', 'mg', 'Minas Gerais'),
  ('PA', 'pa', 'Pará'),
  ('PB', 'pb', 'Paraíba'),
  ('PR', 'pf', 'Paraná'),
  ('PE', 'pe', 'Pernambuco'),
  ('PI', 'pi', 'Piauí'),
  ('RN', 'rn', 'Rio Grande do Norte'),
  ('RS', 'rs', 'Rio Grande do Sul'),
  ('RJ', 'rj', 'Rio de Janeiro'),
  ('RO', 'ro', 'Rondônia'),
  ('RR', 'rr', 'Roraima'),
  ('SC', 'sc', 'Santa Catarina'),
  ('SP', 'sp', 'São Paulo'),
  ('SE', 'se', 'Sergipe'),
  ('TO', 'to', 'Tocantins')
on conflict (sigla) do nothing;

-- Opt.Etapas — 7 opções. 'pedido' = "Pedir", 'pedido0' = "Pedido": opções DIFERENTES.
-- O id segue a ordem do fluxo, que é a ordem do option set.
insert into public.etapas (id, chave_bubble, nome, concluida) values
  (1, 'cota__o',    'Cotação',    false),
  (2, 'pedido',     'Pedir',      false),
  (3, 'pedido0',    'Pedido',     false),
  (4, 'entrega',    'Em Entrega', false),
  (5, 'financeiro', 'Financeiro', true),
  (6, 'conclu_do',  'Concluído',  true),
  (7, 'cancelado',  'Cancelado',  true)
on conflict (id) do nothing;

-- Opt.CotacaoStatus — 3 opções. Nenhuma chave bate com o rótulo; ver comentário da tabela.
insert into public.cotacao_status (id, chave_bubble, nome) values
  (1, 'aberto',     'Em andamento'),
  (2, 'or_ando',    'Parado'),
  (3, 'negociando', 'Cancelado')
on conflict (id) do nothing;

-- Opt.StatusFinanceiro — 4 opções.
insert into public.status_financeiro (id, chave_bubble, nome) values
  (1, 'em_aberto', 'A receber'),
  (2, 'recebido',  'Recebido'),
  (3, 'a_pagar',   'A pagar'),
  (4, 'pago',      'Pago')
on conflict (id) do nothing;

-- Opt.ParcelasReceber — 22 opções no Bubble: 21 semeadas + 1 NÃO semeada.
-- NÃO SEMEADA: a segunda '12dd', marcada `deleted` no export (exigência 4 e 02 §3.8). Ela
-- repetiria a chave_bubble '12dd' do id 4, que é unique.
-- NORMALIZAÇÃO: '49dd' não tem `diasprazonumero` no Bubble — recebe 49, derivado do rótulo.
-- NÃO MIGRAM: `qtdparcelasnumero` (28dd→4 e 30dd→5 não batem com o rótulo), `ordem`,
-- `dd___dd` e `diasprazotexto`.
-- O id segue a ordem do option set, que já é crescente em dias.
insert into public.prazos_recebimento (id, chave_bubble, nome, dias_prazo) values
  ( 1, '0x',    '0dd',     0),
  ( 2, '7_',    '7dd',     7),
  ( 3, '1x',    '10dd',   10),
  ( 4, '12dd',  '12dd',   12),
  ( 5, '14_',   '14dd',   14),
  ( 6, '2x',    '15dd',   15),
  ( 7, '20dd',  '20dd',   20),
  ( 8, '3x',    '21dd',   21),
  ( 9, '25dd',  '25dd',   25),
  (10, '5x',    '28dd',   28),
  (11, '4x',    '30dd',   30),
  (12, '35_',   '35dd',   35),
  (13, '40_',   '40dd',   40),
  (14, '42_',   '42dd',   42),
  (15, '45_',   '45dd',   45),
  (16, '49dd',  '49dd',   49),   -- dias derivados do rótulo: o Bubble não tem o atributo
  (17, '50dd',  '50dd',   50),
  (18, '60_',   '60dd',   60),
  (19, '70dd',  '70dd',   70),
  (20, '90_',   '90dd',   90),
  (21, '120_',  '120dd', 120)
on conflict (id) do nothing;

-- Opt.FormaPgto — 4 opções.
insert into public.formas_pagamento (id, chave_bubble, nome) values
  (1, 'pix',            'Pix'),
  (2, 'boleto',         'Boleto'),
  (3, 'transferencia',  'Transferencia'),
  (4, 'antecipa__o',    'Antecipação')
on conflict (id) do nothing;

-- Opt.TipoFrete — 3 opções.
insert into public.tipos_frete (id, chave_bubble, nome) values
  (1, 'fob',         'FOB'),
  (2, 'cif',         'CIF Informado'),
  (3, 'cif_incluso', 'CIF Incluso')
on conflict (id) do nothing;

-- Opt.MotivoArquivamento — 7 opções.
insert into public.motivos_arquivamento (id, chave_bubble, nome) values
  (1, 'pre_o_alto',                   'Preço alto'),
  (2, 'pesquisa_de_pre_o',            'Pesquisa de preço'),
  (3, 'demora_no_atendimento',        'Demora no atendimento'),
  (4, 'n_o_aprovado_pelo_financeiro', 'Não aprovado pelo financeiro'),
  (5, 'fechou_com_outro_fornecedor',  'Fechou com outro fornecedor'),
  (6, 'sem_demanda',                  'Sem demanda'),
  (7, 'erro_ou_mudan_a_de_dados',     'Erro ou mudança de dados')
on conflict (id) do nothing;

-- opt.RegimeTributario — 3 opções.
insert into public.regimes_tributarios (id, chave_bubble, nome) values
  (1, 'lucro_real',       'Lucro Real/Presumido'),
  (2, 'simples_nacional', 'Simples Nacional'),
  (3, 'mei___autonomo',   'Mei/Autonomo')
on conflict (id) do nothing;

-- Opt.ProdutosLinhas — 4 opções. A chave 'usado' também existe em condicoes_produto.
insert into public.linhas_produto (id, chave_bubble, nome) values
  (1, 'primeira_linha', 'Primeira Linha'),
  (2, 'segunda_linha',  'Segunda Linha'),
  (3, 'terceira_linha', 'Terceira Linha'),
  (4, 'usado',          'Usado')
on conflict (id) do nothing;

-- Opt.ProdutosCondicao — 3 opções.
insert into public.condicoes_produto (id, chave_bubble, nome) values
  (1, 'novo',     'Novo'),
  (2, 'usado',    'Usado'),
  (3, 'seminovo', 'Seminovo')
on conflict (id) do nothing;

-- Opt.CaptacaoCliente — 5 opções.
insert into public.captacoes (id, chave_bubble, nome) values
  (1, 'rd',       'Rd'),
  (2, 'telefone', 'Telefone'),
  (3, 'email',    'Email'),
  (4, 'digisac',  'Digisac'),
  (5, 'n_a',      'N/A')
on conflict (id) do nothing;

-- Opt.TipoTelefone — 3 opções.
insert into public.tipos_telefone (id, chave_bubble, nome) values
  (1, 'sac',      'Sac'),
  (2, 'fixo',     'Fixo'),
  (3, 'celular',  'Celular')
on conflict (id) do nothing;

-- Opt.TipoMeta — 2 opções.
insert into public.tipos_meta (id, chave_bubble, nome) values
  (1, 'regular',       'Regular'),
  (2, 'substitui__o',  'Substituição')
on conflict (id) do nothing;

-- Opt.TipoPesquisa — 3 opções.
insert into public.tipos_pesquisa (id, chave_bubble, nome) values
  (1, 'sac',       'SAC'),
  (2, 'nps',       'NPS'),
  (3, 'p_s_venda', 'Pós-Venda')
on conflict (id) do nothing;

-- Opt.TipoOcorrencia — 6 opções. 'falta_de_material' é "Pedido incompleto".
insert into public.sac_tipos_ocorrencia (id, chave_bubble, nome) values
  (1, 'atraso',                 'Atraso'),
  (2, 'diverg_ncia_de_pedido',  'Divergência de Pedido'),
  (3, 'falta_de_material',      'Pedido incompleto'),
  (4, 'financeiro',             'Financeiro'),
  (5, 'qualidade',              'Qualidade'),
  (6, 'outro',                  'Outro')
on conflict (id) do nothing;

-- opt.prioridade — 3 opções. O id cresce com a urgência, para "prioridade >= 2" funcionar.
-- Os três atributos do option set estão marcados `deleted` e não migram.
insert into public.sac_prioridades (id, chave_bubble, nome) values
  (1, 'baixa',  'Baixa'),
  (2, 'm_dia',  'Média'),
  (3, 'alta',   'Alta')
on conflict (id) do nothing;

-- opt.StatusChamado — 4 opções. 'aguardando_fornecedor' é "Pendente de informações".
-- Os quatro atributos do option set estão marcados `deleted` e não migram.
insert into public.sac_status (id, chave_bubble, nome) values
  (1, 'em_aberto',             'Em aberto'),
  (2, 'em_an_lise',            'Em análise'),
  (3, 'aguardando_fornecedor', 'Pendente de informações'),
  (4, 'resolvido',             'Resolvido')
on conflict (id) do nothing;

-- Opt.TipoAnexo — 26 opções, na ordem do option set. `QualCadastro` normalizado:
-- "Cliente/Fornecedor" → 'clifor', "Usuário" → 'usuario'.
insert into public.tipos_anexo (id, chave_bubble, nome, qual_cadastro) values
  ( 1, 'alvar__de_funcionamento',  'Alvará de Funcionamento', 'clifor'),
  ( 2, 'cart_o_cnpj',              'Cartão CNPJ',             'clifor'),
  ( 3, 'certificado_ibama',        'Certificação IBAMA',      'clifor'),
  ( 4, 'certifica__o_bombeiros',   'Certificação Bombeiros',  'clifor'),
  ( 5, 'contrato_social',          'Contrato Social',         'clifor'),
  ( 6, 'dados_banc_rios',          'Dados Bancários',         'clifor'),
  ( 7, 'inscri__o_estadual',       'Inscrição Estadual',      'clifor'),
  ( 8, 'inscri__o_municipal',      'Inscrição Municipal',     'clifor'),
  ( 9, 'contrato_de_parceria',     'Contrato de parceria',    'clifor'),
  (10, 'dados_cadastrais',         'Dados cadastrais',        'clifor'),
  (11, 'dispensa',                 'Dispensa',                'clifor'),
  (12, 'sintegra',                 'Sintegra',                'clifor'),
  (13, 'regime_tribut_rio',        'Regime tributário',       'clifor'),
  (14, 'documento_pessoal',        'RG',                      'usuario'),
  (15, 'contracheque',             'Contracheque',            'usuario'),
  (16, 'contratos',                'Contratos',               'usuario'),
  (17, 'outros',                   'Outros Documentos',       'usuario'),
  (18, 'cpf',                      'CPF',                     'usuario'),
  (19, 'comprovante_endere_o',     'Comprovante Endereço',    'usuario'),
  (20, 't_tulo_de_eleitor',        'Título de Eleitor',       'usuario'),
  (21, 'exames',                   'Exames',                  'usuario'),
  (22, 'carteira_de_trabalho',     'Carteira de Trabalho',    'usuario'),
  (23, 'pis',                      'PIS',                     'usuario'),
  (24, 'conta_banc_ria',           'Conta Bancária',          'usuario'),
  (25, 'fotos_de_produtos',        'Fotos de Produtos',       'clifor'),
  (26, 'cnd',                      'CND',                     'clifor')
on conflict (id) do nothing;

-- Ligação Opt.TipoAnexo.DeptosVisualizam → tipo_anexo_departamentos. 98 linhas.
-- No Bubble, 24 dos 26 tipos liberam os QUATRO departamentos; as duas exceções são:
--   * 'contrato_de_parceria' → só Financeiro e Administrativo (chaves 'financeiro' e
--     'diretoria'; lembrar que 'diretoria' é o depto ADMINISTRATIVO, 001 §3);
--   * 'comprovante_endere_o' → NENHUM departamento, ou seja, ninguém vê. Isso é quase certo
--     um esquecimento no Bubble (o atributo ficou vazio), mas é o que o mapa diz e o mapa
--     manda (CLAUDE.md regra 1). Fica assim, e a correção é decisão de negócio na tela de
--     configuração: 24 * 4 + 2 + 0 = 98.
-- Escrito como select em vez de VALUES para resolver o departamento por chave_bubble, que é
-- o que o de-para exige ('licita__o' = Comercial, 'geral' = Operação).
insert into public.tipo_anexo_departamentos (tipo_anexo_id, departamento_id)
select t.id, d.id
from public.tipos_anexo t
cross join public.departamentos d
where t.chave_bubble <> 'comprovante_endere_o'
  and (t.chave_bubble <> 'contrato_de_parceria'
       or d.chave_bubble in ('financeiro', 'diretoria'))
on conflict (tipo_anexo_id, departamento_id) do nothing;

-- Opt.EmpresaMegabox → empresas_emissoras. 2 linhas, SEM logo: o caminho no Storage entra
-- quando o bucket privado existir (02 §1.8). As URLs de CDN do Bubble não migram.
insert into public.empresas_emissoras
  (id, chave_bubble, nome, razao, cnpj, email, telefone, endereco) values
  (1, 'megabox', 'Megabox', 'Mega Box Logistica Ltda', '39.667.615/0001-01',
      'contato@megabox.com.br', '(62) 3509-4670',
      E'Rua Waldomiro Correia Neto, 814, Sala 102, Jd. Alexandrina\nAnápolis/GO\n75060-473'),
  (2, 'paletes_brasil', 'Paletes Brasil', 'Paletes Brasil Logística Ltda',
      '000.000.000/0000-00',
      'contato@paletesbrasil.com.br', '(62) 3509-4670',
      E'Logradouro, 000, Bairro\nAnápolis/GO\n00000-000')
on conflict (id) do nothing;

-- icms_aliquotas: NENHUM seed. Os valores vêm da carga de Tbl.IcmsEstados, e a alíquota é
-- gravada como FRAÇÃO (0.1200 = 12%, 02 §1.3). Semear zero aqui seria pior que vazio: um
-- cálculo de tributo silenciosamente errado é mais difícil de notar do que um que falha.


-- =====================================================================================
-- FIM da 003_listas_fixas.sql
-- =====================================================================================
-- CONFERÊNCIA DE CONTAGEM contra mapa/option-sets.md:
--   ufs 27 · etapas 7 · cotacao_status 3 · status_financeiro 4 ·
--   prazos_recebimento 21 vivas (+1 `deleted` não semeada, de 22 no Bubble) ·
--   formas_pagamento 4 · tipos_frete 3 · motivos_arquivamento 7 ·
--   regimes_tributarios 3 · linhas_produto 4 · condicoes_produto 3 · captacoes 5 ·
--   tipos_telefone 3 · tipos_meta 2 · tipos_pesquisa 3 · sac_tipos_ocorrencia 6 ·
--   sac_prioridades 3 · sac_status 4 · tipos_anexo 26 ·
--   tipo_anexo_departamentos 98 · empresas_emissoras 2 · icms_aliquotas 0 (carga).
--
-- 22 tabelas criadas, 22 com RLS ligada, 44 policies (leitura + escrita em cada).
-- 2 enums. 1 FK pendente fechada. Nenhuma referência a niveis_vendedor. Nenhum segredo:
-- Opt.Smtp NÃO virou tabela (02 §4; specs/00-achados-de-seguranca.md §1.1).
-- =====================================================================================
