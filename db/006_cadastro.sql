-- =====================================================================================
-- 006_cadastro.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatias 2 e 3 de `specs/02-modelo-de-dados-proposto.md` §11, na mesma migration porque
-- produto não existe sem endereço de fornecedor (`fornecedor_produtos` liga os dois) e
-- separar em dois arquivos criaria uma FK pendente sem necessidade.
--
-- Escopo: §3.2 (Cadastro) — `grupos_clifor`, `enderecos_clifor`, `contatos_clifor`,
-- `anexos`, `produto_tipos`, `produto_grupos`, `produtos`, `produto_versoes`,
-- `produto_linhas`, `produto_condicoes`, `fornecedor_produtos`.
--
-- O QUE ESTA MIGRATION FAZ
--   1. Instala `postgis` no schema `extensions` (§6.1): `enderecos_clifor.localizacao` é
--      `geography(point, 4326)`, e é a única coluna do esquema que precisa da extensão.
--   2. Cria as 8 tabelas de registro próprio com as colunas obrigatórias de §1.2 e as 3
--      tabelas de ligação pura com pk composta.
--   3. Índice em toda FK (§6), trigrama sem acento em `grupos_clifor.nome` e
--      `produtos.nome` (§6.1), e o único parcial `(grupo_id) where principal`.
--   4. Cria `v_clifor_documento_duplicado` — a fila de limpeza que substitui, por ora, o
--      índice único de documento (ver DECISÃO abaixo).
--   5. `fn_set_alterado()` em toda tabela com `alterado_em`; `fn_auditoria()` em
--      `grupos_clifor` e `enderecos_clifor`.
--   6. RLS ligada em TODAS as 11 tabelas, com policy explícita (CLAUDE.md regra 3; §1.7,
--      §7). Nível OPERACIONAL de §7.2: lê qualquer usuário ativo (o combo de cliente e o de
--      produto aparecem em quase toda tela), escreve quem tem a página `cadastros` — ou
--      `produtos`, nas sete tabelas de produto (ver o bloco de DOIS ALVOS abaixo).
--
-- O QUE **NÃO** ENTRA AQUI
--   - Nenhum seed. O dado de cadastro vem da carga (Fase C de `specs/03-plano-de-construcao.md`).
--   - `grupos_clifor.ultimo_historico_em` / `ultimo_historico_id`: o espelho de §3.7 entra
--     com a fatia 9, junto de `historicos` e do trigger que o mantém. Antes disso a coluna
--     não teria como ser preenchida, e coluna espelho sem trigger é exatamente o defeito que
--     §1.6 descreve (12 lugares gravando à mão, com duas rotinas de reparo em massa).
--   - `clifor_bloqueios` (histórico de bloqueio, `specs/paginas/cadastros.md` §9.5): hoje não
--     existe no Bubble, é tabela nova, e a trilha de `liberado`/`liberado_motivo` já fica em
--     `auditoria` pelo trigger desta migration. Entra se a tela pedir.
--   - Nenhuma tabela de cache de CEP/CNPJ (`enderecos-e-contatos` §9.5 as marca opcionais).
--
-- >>> DOIS ALVOS DE PERMISSÃO, NÃO UM (resolvido pela 005) <<<
-- Esta migration nasceu chamando `fn_pode_acessar_pagina('cadastros')` nas onze tabelas, e o
-- slug `cadastros` não existia em `paginas` — a 001 semeou só os 7 itens de `Opt.MenuPaginas`.
-- A 005 cria os alvos que faltavam, e criou **DOIS**, porque a matriz B6 mede duas regras
-- diferentes no Bubble (`specs/04-duvidas.md` §1.1):
--
--   * "Cliente / Fornecedor" (`cadastro_clientes`) → departamento Administrativo e perfis 1..4;
--   * "Cadastro Produtos"   (`cadastro_produtos`) → perfis 1..3, **sem Operador**.
--
-- Colapsar os dois num slug só daria ao Operador a escrita no cadastro de produto, que o
-- Bubble lhe nega hoje. Migração não é o momento de alargar permissão em silêncio. Então:
--
--   * `grupos_clifor`, `enderecos_clifor`, `contatos_clifor`, `anexos` → slug `cadastros`;
--   * `produto_tipos`, `produto_grupos`, `produtos`, `produto_versoes`, `produto_linhas`,
--     `produto_condicoes`, `fornecedor_produtos` → slug `produtos`.
--
-- `fornecedor_produtos` fica no lado do produto porque no Bubble a ligação é editada dentro do
-- produto (`ProdutosModelo.QuaisFornecedoresFiliais`), não na ficha do fornecedor.
-- A LEITURA de todas as onze continua sendo `fn_usuario_ativo()`: nenhuma das duas telas é
-- pré-requisito para ver o nome de um cliente ou de um produto em vendas.
--
-- >>> ARMADILHA DA CARGA (medida em 25/09/2026, `specs/04-duvidas.md` §1.1) <<<
-- A Data API do Bubble devolve os campos pelo **nome de exibição** (`cpo.CnpjCpf`), e NÃO pelo
-- id interno (`cpo_cnpjcpf_text`) que `mapa/data-types.md` e o de-para de `02` §10 usam. Ler
-- pelo id devolve `undefined` em silêncio: a primeira execução do relatório de conflitos disse
-- "zero conflito" porque não leu nada. O carregador DESTA fatia é o que mais tropeça nisso —
-- é aqui que estão os campos com id enganoso (ver os comentários de coluna de
-- `grupos_clifor`). Qualquer contagem que dê zero merece desconfiança, não comemoração.
--
-- >>> DECISÃO TOMADA: documento NÃO é único, e produtos (nome, grupo_id) também não <<<
-- `02` §3.2 pedia `unique (documento)` e `unique (nome, grupo_id)`. Medido contra a base real
-- em 25/09/2026 (`specs/04-duvidas.md` §1.1):
--   * 5.840 endereços, 283 documentos repetidos em 627 linhas;
--   * o recorte "só os ativos com documento de 11 ou 14 dígitos" ainda tem **120 documentos
--     repetidos em 250 linhas** — ou seja, a duplicata não está nos inativos, e o índice único
--     parcial entre ativos também não salva;
--   * 20 endereços com o documento `'·'`, um caractere: lixo de cadastro;
--   * `produtos (nome, grupo_id)`: 11 combinações repetidas.
-- Qualquer `create unique index` quebraria a carga. Nesta migration os dois índices são
-- COMUNS; o único entra em migration posterior, quando a limpeza terminar.
--
-- ORDEM DOS BLOCOS (a mesma da 001 e da 003)
--   extensão → tabelas → índices → views → triggers → RLS e policies.
--
-- Sem `begin`/`commit`: o Supabase aplica migration em transação.
-- Depois de aplicar: rodar `get_advisors` (segurança e desempenho), como manda §7.3.
-- =====================================================================================


-- =====================================================================================
-- 1. EXTENSÃO (§6.1)
-- =====================================================================================
-- No Supabase extensão instala no schema `extensions`, nunca no `public`. Por isso o tipo é
-- escrito `extensions.geography(...)` na coluna: sem a qualificação a migration falha em banco
-- cujo `search_path` não inclua `extensions` — e as funções `security definer` de §7.1 rodam
-- com `search_path = ''`, então nada ali pode contar com resolução implícita.
create extension if not exists postgis with schema extensions;


-- =====================================================================================
-- 2. TABELAS (§3.2) — todas com as colunas obrigatórias de §1.2, exceto as de ligação pura
-- =====================================================================================

-- ------------------------------------------------------------------------ grupos_clifor
-- É o CLIENTE ou o FORNECEDOR "guarda-chuva". A regra fiscal NÃO vive aqui: vive na filial
-- (`enderecos_clifor`).
create table public.grupos_clifor (
  id           uuid primary key default gen_random_uuid(),
  tipo         public.tipo_clifor not null,
  nome         text not null,
  ativo        boolean not null default true,
  foto_path    text,                                   -- caminho no Storage privado (§1.8)
  carteira_id  uuid references public.usuarios(id),
  captacao_id  smallint references public.captacoes(id),
  liberado     boolean not null default true,          -- false = BLOQUEADO
  liberado_motivo text,
  nao_faz_contrato_parceria boolean not null default false,
  possui_filiais boolean not null default false,
  corporativo  boolean not null default false,
  frete_id     smallint references public.tipos_frete(id),
  email_principal text,
  nome_comprador text,
  capacidade_compra text,
  demanda text,
  observacoes text,
  codigo_legado integer,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint carteira_so_cliente check (carteira_id is null or tipo = 'cliente')
);

comment on table public.grupos_clifor is
  'Cliente ou fornecedor, o nível "grupo" (02 §3.2). Era Tbl.GrupoCliFor. As listas '
  'QuaisEnderecos/QuaisContatos NÃO migram: a FK do lado N já diz tudo (§1.5), e é a '
  'duplicidade entre lista e FK que hoje deixa endereço invisível na tela '
  '(specs/paginas/enderecos-e-contatos.md §8). '
  'SEM unique em nome: specs/paginas/cadastros.md §9.5 pedia unique (fn_unaccent(nome), tipo), '
  'mas isso NÃO foi medido contra a base como documento e produtos foram — e o mesmo relatório '
  'mostrou que a base tem duplicata onde ninguém esperava. Entra junto dos outros dois índices '
  'únicos, depois da limpeza. O índice trigrama já deixa a tela avisar "existe cliente '
  'parecido" no momento do cadastro, que é a proteção que importa. '
  'ultimo_historico_em/ultimo_historico_id (§3.7) entram na fatia 9, com o trigger que os mantém.';
comment on column public.grupos_clifor.liberado is
  'ARMADILHA DO DE-PARA (specs/paginas/cadastros.md §8): no Bubble o campo se chama '
  '`cpo.Liberado` mas o id interno é `cpo_bloqueado_boolean` — nome e id têm sentido OPOSTO. '
  'Aqui vale o NOME: true = liberado, false = bloqueado. A carga lê pelo nome de exibição '
  '(`cpo.Liberado`) e NÃO nega o valor.';
comment on column public.grupos_clifor.nao_faz_contrato_parceria is
  'ARMADILHA DO DE-PARA: o id interno é `cpo_fazcontratoparceria_boolean`, sentido invertido em '
  'relação ao nome `cpo.NãoFazContratoParceria`. Aqui vale o nome: true = NÃO faz contrato.';
comment on column public.grupos_clifor.observacoes is
  'ARMADILHA DO DE-PARA: o id interno é `cpo_codcliente_text`, mas o campo é a OBSERVAÇÃO '
  'livre, e NÃO um código de cliente. Código do sistema antigo é `codigo_legado`. Quem migrar '
  '`cpo_codcliente_text` para codigo_legado enche uma coluna integer de texto livre.';
comment on column public.grupos_clifor.codigo_legado is
  'Código do sistema anterior ao Bubble. NÃO vem de cpo_codcliente_text (ver observacoes).';
comment on column public.grupos_clifor.carteira_id is
  'Vendedor dono da carteira. O check carteira_so_cliente existe porque fornecedor não tem '
  'carteira, e no Bubble nada impedia gravar.';
comment on column public.grupos_clifor.foto_path is
  'Caminho no bucket PRIVADO do Storage, nunca URL de CDN (§1.8). Hoje toda foto e todo anexo '
  'do Bubble abre sem autenticação (specs/00-achados-de-seguranca.md §2.2).';
comment on column public.grupos_clifor.bubble_id is
  'Id do Bubble: é o que torna a carga idempotente e a recarga segura (§1.2). Não é a pk.';

-- --------------------------------------------------------------------- enderecos_clifor
-- Esta é a FILIAL, e é onde vive TODA a regra fiscal: regime tributário e UF daqui decidem a
-- alíquota de ICMS do orçamento (specs/paginas/enderecos-e-contatos.md §5).
create table public.enderecos_clifor (
  id            uuid primary key default gen_random_uuid(),
  grupo_id      uuid not null references public.grupos_clifor(id) on delete restrict,
  nome_endereco text not null,
  razao    text,
  fantasia text,
  documento     text,                        -- só dígitos: CNPJ (14) ou CPF (11)
  tipo_pessoa   public.tipo_pessoa not null,
  insc_estadual  text,
  insc_municipal text,
  regime_tributario_id smallint not null references public.regimes_tributarios(id),
  cep text, logradouro text, numero text, complemento text, bairro text, municipio text,
  uf            char(2) not null references public.ufs(sigla),
  localizacao   extensions.geography(point, 4326),
  ativo         boolean not null default true,
  liberado      boolean not null default true,
  liberado_motivo text,
  principal     boolean not null default false,
  corporativo   boolean not null default false,
  frete_id      smallint references public.tipos_frete(id),
  nome_comprador text,
  capacidade_compra text,
  demanda text,
  observacoes text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)

  -- >>> O CHECK DE 02 §3.2 FICA COMENTADO, DE PROPÓSITO <<<
  -- `02` §3.2 pede o check abaixo. Ele REPROVA 23 LINHAS da base atual: são os documentos com
  -- tamanho diferente de 11 e de 14, entre eles 20 endereços cujo documento é o caractere '·'
  -- (`specs/04-duvidas.md` §1.1). Ligar o check aqui faria a carga falhar na primeira dessas
  -- linhas, e são filiais com pedido e histórico atrelados — perdê-las não é opção.
  -- ALTERNATIVA ADOTADA, e é por isso que `documento` é NULLABLE nesta migration: a carga
  -- grava documento NULO nessas 23 linhas e emite um AVISO no relatório de carga; a filial
  -- entra no banco e o Comercial completa o documento pela tela. O check volta, junto com o
  -- `not null` e com o `create unique index`, na migration que fechar a limpeza.
  -- , constraint documento_bate_com_tipo check (
  --     (tipo_pessoa = 'cpf'  and documento ~ '^[0-9]{11}$') or
  --     (tipo_pessoa = 'cnpj' and documento ~ '^[0-9]{14}$')
  --   )
);

comment on table public.enderecos_clifor is
  'A FILIAL. É aqui que vive TODA a regra fiscal: regime_tributario_id + uf decidem a alíquota '
  'de ICMS do orçamento (specs/paginas/enderecos-e-contatos.md §5), e é o endereço (não o '
  'grupo) que orça, que define a origem do frete e que aparece em fornecedor_produtos. '
  'DUAS FONTES DE UF no Bubble: cpo.UF (texto livre) e cpo.QualUfOpt (option set). O option set '
  'VENCE; onde estiver vazio, cai para o texto, com relatório de divergência '
  '(enderecos-e-contatos [DÚVIDA 14], relatorios [DÚVIDA 4]).';
comment on column public.enderecos_clifor.documento is
  'CNPJ (14 dígitos) ou CPF (11), SÓ DÍGITOS. '
  'NÃO É ÚNICO, e isso é decisão medida, não esquecimento: em 25/09/2026, de 5.840 endereços, '
  '283 documentos se repetem (627 linhas), e mesmo no recorte dos ATIVOS com documento de '
  'tamanho válido sobram 120 documentos repetidos em 250 linhas — são filiais ativas de verdade '
  'com o mesmo CNPJ. O `create unique index` de 02 §3.2 entra em MIGRATION POSTERIOR, quando a '
  'view v_clifor_documento_duplicado voltar vazia. Números e motivo em '
  'specs/04-duvidas.md §1.1. '
  'NULLABLE (02 §3.2 pedia not null) porque a carga precisa de um destino para as 23 linhas de '
  'documento inválido — ver o check comentado no corpo da tabela.';
comment on column public.enderecos_clifor.liberado is
  'Bloqueio da filial: false impede liberar venda. Mesma armadilha de nome/id do grupo '
  '(cpo.Liberado ↔ cpo_bloqueado_boolean): vale o NOME. Mudança aqui é auditada por trigger, '
  'porque libera ou trava venda.';
comment on column public.enderecos_clifor.regime_tributario_id is
  'Entra no cálculo de tributo. Mudança aqui é auditada por trigger (02 §3.1): trocar o regime '
  'muda a alíquota de todo orçamento novo daquela filial.';
comment on column public.enderecos_clifor.principal is
  'O "endereço principal" de verdade, garantido pelo índice único parcial '
  'um_principal_por_grupo. Regra NOVA, e é por isso que este único pode entrar: não é dado '
  'herdado. NA CARGA: o Bubble grava cpo.Principal = true em TODA filial e nunca lê o campo '
  '(decisão 02 §2.1.8), então copiar o valor derruba o índice no segundo endereço de cada '
  'grupo. O carregador TEM de escolher um principal por grupo — a recomendação é o endereço '
  'ativo mais antigo — e gravar false nos demais.';
comment on column public.enderecos_clifor.localizacao is
  'geography(point, 4326) do PostGIS, para distância entre filiais (§6.1). Tipo qualificado '
  'como extensions.geography porque no Supabase a extensão não mora no public.';

-- ---------------------------------------------------------------------- contatos_clifor
create table public.contatos_clifor (
  id          uuid primary key default gen_random_uuid(),
  grupo_id    uuid not null references public.grupos_clifor(id) on delete cascade,
  endereco_id uuid references public.enderecos_clifor(id) on delete set null,
  nome        text not null,
  cargo    text,
  email    text,
  telefone text,
  tipo_telefone_id smallint references public.tipos_telefone(id),
  ativo       boolean not null default true,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.contatos_clifor is
  'Era Tbl.ContatoCliFor. `endereco_id` é opcional: existe contato do grupo que não é de filial '
  'nenhuma, e por isso o on delete é SET NULL — apagar a filial não pode apagar a pessoa. O '
  'grupo, sim, arrasta (cascade).';
comment on column public.contatos_clifor.email is
  'O Bubble tem cpo.Email E cpo.EmailPrincipal; o segundo NUNCA é lido '
  '(enderecos-e-contatos [DÚVIDA 13]) → migra só este.';
comment on column public.contatos_clifor.ativo is
  'NA CARGA: cpo.ativo nasce VAZIO no Bubble; null vira true (02 §3.2). Migrar o vazio como '
  'false esconderia todo contato antigo da tela.';

-- ------------------------------------------------------------------------------- anexos
create table public.anexos (
  id            uuid primary key default gen_random_uuid(),
  grupo_id      uuid references public.grupos_clifor(id) on delete cascade,
  endereco_id   uuid references public.enderecos_clifor(id) on delete cascade,
  usuario_id    uuid references public.usuarios(id) on delete cascade,
  tipo_anexo_id smallint not null references public.tipos_anexo(id),
  nome_arquivo  text not null,
  path          text not null,             -- Storage privado, NUNCA URL de CDN (§1.8)
  tamanho_bytes bigint,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint dono_unico check (
    (grupo_id is not null)::int + (endereco_id is not null)::int
    + (usuario_id is not null)::int = 1
  )
);

comment on table public.anexos is
  'Era Tbl.Anexos, que no Bubble NÃO tem regra de privacidade nenhuma: os arquivos abrem por '
  'URL pública de CDN, contrato social e documento pessoal incluídos '
  '(specs/00-achados-de-seguranca.md §2.2). Aqui `path` é caminho em bucket PRIVADO e a entrega '
  'é por URL assinada de vida curta (§1.8). '
  'SEM POLICY DE DELETE, de propósito — ver o bloco de RLS. '
  'A visibilidade por departamento vem de tipo_anexo_departamentos (003) e hoje é aplicada pela '
  'server action; vira policy quando a tela de anexo existir.';
comment on column public.anexos.path is
  'Caminho no bucket privado. Se algum dia guardar "https://", o vazamento do Bubble voltou.';
comment on constraint dono_unico on public.anexos is
  'Cada anexo pertence a exatamente UM dono: grupo, endereço ou usuário.';

-- =====================================================================================
-- PRODUTOS
-- =====================================================================================
-- ATENÇÃO: no Bubble os nomes das duas classificações estão TROCADOS em relação às tabelas
-- físicas. O de-para abaixo é o correto (02 §3.2) e está repetido em comment on table, porque é
-- erro que o carregador comete uma vez e ninguém percebe até o combo vir invertido.

-- ------------------------------------------------------------------------ produto_tipos
create table public.produto_tipos (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  icone_path text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.produto_tipos is
  'A classificação de PRIMEIRO nível. ARMADILHA: no Bubble é Tbl.ProdutosTipo, mas a tabela '
  'FÍSICA chama-se tbl_produtosgrupo — as duas classificações moram em tabelas físicas TROCADAS '
  '(02 §3.2). Carregar pelo nome da tabela física, e não pelo data type, inverte a hierarquia '
  'inteira. '
  'NÃO existe tela para criar produto_tipos/produto_grupos hoje (cadastros [DÚVIDA 8]): o app '
  'novo precisa de uma. O unique em nome pode ficar: são poucas linhas, curadas.';

-- ----------------------------------------------------------------------- produto_grupos
create table public.produto_grupos (
  id      uuid primary key default gen_random_uuid(),
  tipo_id uuid not null references public.produto_tipos(id) on delete restrict,
  nome    text not null,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  unique (tipo_id, nome)
);

comment on table public.produto_grupos is
  'A classificação de SEGUNDO nível, dentro do tipo. ARMADILHA: no Bubble é Tbl.ProdutosGrupo, '
  'mas a tabela FÍSICA chama-se tbl_produtossubgrupo — troca espelhada à de produto_tipos '
  '(02 §3.2). O unique (tipo_id, nome) vale: são poucas linhas, curadas.';

-- ----------------------------------------------------------------------------- produtos
create table public.produtos (
  id        uuid primary key default gen_random_uuid(),
  tipo_id   uuid references public.produto_tipos(id),
  grupo_id  uuid references public.produto_grupos(id),
  nome      text not null,
  descricao text,
  ativo     boolean not null default true,
  foto_frontal_path  text,
  foto_lateral_path  text,
  foto_superior_path text,
  foto_inferior_path text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.produtos is
  'Era Tbl.ProdutosModelo, tabela física tbl_produtos (02 §3.2). tipo_id e grupo_id são nulos '
  'porque a base tem produto sem classificação; a tela pode exigir, a carga não pode. '
  'A coerência produtos.tipo_id = produto_grupos.tipo_id é validada pela server action, e não '
  'por FK composta: a FK exigiria unique (id, tipo_id) em produto_grupos e travaria a '
  'reclassificação de um grupo.';
comment on column public.produtos.nome is
  'NÃO HÁ unique (nome, grupo_id), embora 02 §3.2 o peça: medido em 25/09/2026, a base tem 11 '
  'combinações (nome, grupo_id) repetidas (specs/04-duvidas.md §1.1). O volume é pequeno — dá '
  'para deduplicar antes da carga — mas o índice único entra na MESMA migration posterior que o '
  'de enderecos_clifor.documento, depois da limpeza, e não antes. Até lá o índice é comum, e o '
  'trigrama deixa a tela avisar "existe produto parecido".';
comment on column public.produtos.grupo_id is
  'ARMADILHA VIZINHA: grupos_clifor / cpo.QualProduto, no Bubble, é anotação de TEXTO LIVRE e '
  'NÃO é FK para produtos (02 §3.2). Não existe ponteiro de cliente para produto a migrar.';

-- ---------------------------------------------------------------------- produto_versoes
create table public.produto_versoes (
  id         uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  nome  text not null,
  ativo boolean not null default true,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  unique (produto_id, nome)
);

comment on table public.produto_versoes is
  'Variação do mesmo produto (medida, acabamento). Registro próprio, COM bubble_id: no Bubble é '
  'data type, e não lista dentro do produto.';

-- =====================================================================================
-- LIGAÇÕES PURAS — pk composta e SEM as colunas de §1.2
-- =====================================================================================
-- POR QUE ESTAS TRÊS NÃO TÊM `bubble_id` (nem `id`, nem `alterado_em`/`alterado_por`):
-- a origem delas não é um registro do Bubble, é uma LISTA GUARDADA DENTRO de outro registro
-- (`ProdutosModelo.QuaisLinhas`, `QuaisCondicoes`, `QuaisFornecedoresFiliais` — §1.5). Não há
-- id do Bubble a preservar, porque o par nunca teve linha própria lá. A idempotência da carga
-- vem da própria pk composta (`on conflict (a, b) do nothing`), que é garantia mais forte do
-- que um `bubble_id` único. `criado_em`/`criado_por` ficam: saber quem ligou um fornecedor a um
-- produto é informação de negócio, e é barato.

create table public.produto_linhas (
  produto_id uuid not null references public.produtos(id) on delete cascade,
  linha_id   smallint not null references public.linhas_produto(id),
  criado_em  timestamptz not null default now(),
  criado_por uuid references public.usuarios(id),
  primary key (produto_id, linha_id)
);

comment on table public.produto_linhas is
  'Ligação pura ProdutosModelo.QuaisLinhas → linhas_produto (§1.5). Sem id nem bubble_id: a '
  'origem é lista dentro do produto, não registro próprio; a pk composta é a idempotência.';

create table public.produto_condicoes (
  produto_id  uuid not null references public.produtos(id) on delete cascade,
  condicao_id smallint not null references public.condicoes_produto(id),
  criado_em   timestamptz not null default now(),
  criado_por  uuid references public.usuarios(id),
  primary key (produto_id, condicao_id)
);

comment on table public.produto_condicoes is
  'Ligação pura ProdutosModelo.QuaisCondicoes → condicoes_produto (§1.5). Sem id nem '
  'bubble_id, pelo mesmo motivo de produto_linhas.';

create table public.fornecedor_produtos (
  endereco_fornecedor_id uuid not null references public.enderecos_clifor(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  criado_em  timestamptz not null default now(),
  criado_por uuid references public.usuarios(id),
  primary key (endereco_fornecedor_id, produto_id)
);

comment on table public.fornecedor_produtos is
  'Quais produtos cada FILIAL de fornecedor atende. O Bubble tem DUAS listas concorrentes: '
  'ProdutosModelo.QuaisFornecedores (aponta para o grupo) e QuaisFornecedoresFiliais (aponta '
  'para o endereço). Vale a da FILIAL, porque é ela que orça e que define a origem do frete e do '
  'ICMS; a lista por grupo é DESCARTADA na carga (02 §3.2). '
  'Sem id nem bubble_id: ligação pura, origem é lista dentro do produto (§1.5). '
  'A regra "o endereço tem de ser de um grupo tipo fornecedor" (specs/paginas/cadastros.md '
  '§9.5) fica na server action: como CHECK ela exigiria subquery, que o Postgres não aceita, e '
  'como trigger mentiria se o grupo mudasse de tipo depois.';


-- =====================================================================================
-- 3. ÍNDICES (§6: índice em toda FK e em toda coluna usada em filtro ou ordenação)
-- =====================================================================================

-- ------------------------------------------------------------------------ grupos_clifor
create index grupos_clifor_carteira_idx     on public.grupos_clifor (carteira_id)
  where carteira_id is not null;
create index grupos_clifor_captacao_idx     on public.grupos_clifor (captacao_id);
create index grupos_clifor_frete_idx        on public.grupos_clifor (frete_id);
create index grupos_clifor_criado_por_idx   on public.grupos_clifor (criado_por);
create index grupos_clifor_alterado_por_idx on public.grupos_clifor (alterado_por);
-- A tela de cadastros filtra por tipo + ativo e ordena por nome.
create index grupos_clifor_tipo_ativo_idx   on public.grupos_clifor (tipo, nome) where ativo;
-- Busca por nome ignorando acento. A consulta da tela tem de usar EXATAMENTE esta expressão
-- (`public.fn_unaccent(nome) ilike ...`), senão o planejador ignora o índice (§6.1).
create index grupos_clifor_nome_trgm_idx on public.grupos_clifor
  using gin (public.fn_unaccent(nome) extensions.gin_trgm_ops);

-- --------------------------------------------------------------------- enderecos_clifor
create index enderecos_clifor_grupo_idx        on public.enderecos_clifor (grupo_id);
create index enderecos_clifor_regime_idx       on public.enderecos_clifor (regime_tributario_id);
create index enderecos_clifor_uf_idx           on public.enderecos_clifor (uf);
create index enderecos_clifor_frete_idx        on public.enderecos_clifor (frete_id);
create index enderecos_clifor_criado_por_idx   on public.enderecos_clifor (criado_por);
create index enderecos_clifor_alterado_por_idx on public.enderecos_clifor (alterado_por);
-- Índice COMUM, e não único: 120 documentos repetidos entre os endereços ATIVOS com documento
-- de tamanho válido, em 250 linhas (specs/04-duvidas.md §1.1). O `create unique index` entra em
-- migration posterior, quando v_clifor_documento_duplicado voltar vazia. Mesmo comum ele é
-- necessário: a tela tem "busca por CNPJ", que é a consulta mais usada do cadastro.
create index enderecos_clifor_documento_idx on public.enderecos_clifor (documento)
  where documento is not null;
-- A tela lista as filiais aptas a orçar: ativas e liberadas.
create index enderecos_clifor_aptas_idx on public.enderecos_clifor (grupo_id, nome_endereco)
  where ativo and liberado;
-- ESTE único PODE entrar: é regra nova (02 §2.1.8), não dado herdado. Ver o comment on column
-- de `principal` — a carga precisa escolher um principal por grupo antes de rodar.
create unique index um_principal_por_grupo on public.enderecos_clifor (grupo_id)
  where principal;
-- Distância entre filiais (§6.1). GiST é o índice do PostGIS.
create index enderecos_clifor_localizacao_idx on public.enderecos_clifor
  using gist (localizacao) where localizacao is not null;

-- ---------------------------------------------------------------------- contatos_clifor
create index contatos_clifor_grupo_idx          on public.contatos_clifor (grupo_id);
create index contatos_clifor_endereco_idx       on public.contatos_clifor (endereco_id)
  where endereco_id is not null;
create index contatos_clifor_tipo_telefone_idx  on public.contatos_clifor (tipo_telefone_id);
create index contatos_clifor_criado_por_idx     on public.contatos_clifor (criado_por);
create index contatos_clifor_alterado_por_idx   on public.contatos_clifor (alterado_por);

-- ------------------------------------------------------------------------------- anexos
create index anexos_grupo_idx        on public.anexos (grupo_id, tipo_anexo_id)
  where grupo_id is not null;
create index anexos_endereco_idx     on public.anexos (endereco_id)
  where endereco_id is not null;
create index anexos_usuario_idx      on public.anexos (usuario_id, tipo_anexo_id)
  where usuario_id is not null;
create index anexos_tipo_idx         on public.anexos (tipo_anexo_id);
create index anexos_criado_por_idx   on public.anexos (criado_por);
create index anexos_alterado_por_idx on public.anexos (alterado_por);

-- ------------------------------------------------------------------------ produto_tipos
create index produto_tipos_criado_por_idx   on public.produto_tipos (criado_por);
create index produto_tipos_alterado_por_idx on public.produto_tipos (alterado_por);

-- ----------------------------------------------------------------------- produto_grupos
create index produto_grupos_tipo_idx         on public.produto_grupos (tipo_id);
create index produto_grupos_criado_por_idx   on public.produto_grupos (criado_por);
create index produto_grupos_alterado_por_idx on public.produto_grupos (alterado_por);

-- ----------------------------------------------------------------------------- produtos
create index produtos_tipo_idx         on public.produtos (tipo_id);
create index produtos_grupo_idx        on public.produtos (grupo_id);
create index produtos_criado_por_idx   on public.produtos (criado_por);
create index produtos_alterado_por_idx on public.produtos (alterado_por);
-- O seletor de produto filtra por classificação e ativo, e ordena por nome.
create index produtos_ativos_idx on public.produtos (tipo_id, grupo_id, nome) where ativo;
-- COMUM, não único: 11 combinações (nome, grupo_id) repetidas na base (04 §1.1).
create index produtos_nome_grupo_idx on public.produtos (nome, grupo_id);
-- Busca por nome ignorando acento, mesma expressão da consulta da tela (§6.1).
create index produtos_nome_trgm_idx on public.produtos
  using gin (public.fn_unaccent(nome) extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------- produto_versoes
create index produto_versoes_produto_idx      on public.produto_versoes (produto_id);
create index produto_versoes_criado_por_idx   on public.produto_versoes (criado_por);
create index produto_versoes_alterado_por_idx on public.produto_versoes (alterado_por);

-- ------------------------------------------------------------------- ligações (§6, FKs)
-- O lado esquerdo da pk composta já tem índice; o direito não, e é por ele que se pergunta
-- "quais produtos são de primeira linha?".
create index produto_linhas_linha_idx      on public.produto_linhas (linha_id);
create index produto_linhas_criado_por_idx on public.produto_linhas (criado_por);

create index produto_condicoes_condicao_idx   on public.produto_condicoes (condicao_id);
create index produto_condicoes_criado_por_idx on public.produto_condicoes (criado_por);

-- §6 pede este por nome: "fornecedores que atendem um produto, para o seletor de orçamento".
-- A pk cobre (endereco, produto); este cobre o sentido inverso, que é o do seletor.
create index fornecedor_produtos_produto_idx on public.fornecedor_produtos
  (produto_id, endereco_fornecedor_id);
create index fornecedor_produtos_criado_por_idx on public.fornecedor_produtos (criado_por);


-- =====================================================================================
-- 4. VIEWS
-- =====================================================================================

-- --------------------------------------------------- v_clifor_documento_duplicado
-- A fila de trabalho do Comercial, e a condição de saída da decisão de 04 §1.1: quando esta
-- view voltar VAZIA, a migration com `create unique index` em enderecos_clifor (documento) pode
-- entrar.
--
-- `security_invoker = true` é o PADRÃO e está explícito de propósito: a view respeita a RLS de
-- quem consulta. NÃO é `security definer` — a 002 criou uma view definer, o `get_advisors` a
-- marcou como ERROR (`security_definer_view`) e a 004 existe justamente para desfazer isso.
create view public.v_clifor_documento_duplicado
with (security_invoker = true) as
select e.documento,
       count(*) over (partition by e.documento) as qtd_enderecos,
       e.id            as endereco_id,
       e.nome_endereco,
       e.grupo_id,
       g.nome          as grupo_nome,
       g.tipo          as grupo_tipo,
       e.ativo,
       e.uf,
       e.criado_em
from public.enderecos_clifor e
join public.grupos_clifor g on g.id = e.grupo_id
where e.documento is not null
  and e.documento <> ''
  and e.documento in (
    select d.documento
    from public.enderecos_clifor d
    where d.documento is not null
      and d.documento <> ''
    group by d.documento
    having count(*) > 1
  );

comment on view public.v_clifor_documento_duplicado is
  'Os endereços que compartilham documento, uma LINHA POR ENDEREÇO, com quantos são '
  '(qtd_enderecos), de que grupo vêm e se estão ativos — é o que o Comercial precisa para '
  'decidir qual filial fica. Substitui, por ora, o unique index de 02 §3.2: medido em '
  '25/09/2026, a base tem 283 documentos repetidos em 627 linhas, e 120 deles ainda repetem '
  'entre os ATIVOS com documento válido (250 linhas) — specs/04-duvidas.md §1.1. '
  'CONDIÇÃO DE SAÍDA: quando esta view voltar vazia, entra o create unique index, o '
  'documento volta a not null e o check documento_bate_com_tipo sai do comentário. '
  'security_invoker = true (o padrão): respeita a RLS de enderecos_clifor e de grupos_clifor. '
  'Nunca security definer — get_advisors marca como ERROR, e a 004 é a prova.';

revoke all on public.v_clifor_documento_duplicado from anon;
grant select on public.v_clifor_documento_duplicado to authenticated;


-- =====================================================================================
-- 5. TRIGGERS
-- =====================================================================================

-- ------------------------------------ fn_set_alterado: toda tabela com `alterado_em` (§1.2)
-- As três ligações puras não têm alterado_em e por isso não têm trigger: não se "altera" um
-- par, apaga-se e cria-se outro.
create trigger trg_grupos_clifor_alterado
  before update on public.grupos_clifor
  for each row execute function public.fn_set_alterado();

create trigger trg_enderecos_clifor_alterado
  before update on public.enderecos_clifor
  for each row execute function public.fn_set_alterado();

create trigger trg_contatos_clifor_alterado
  before update on public.contatos_clifor
  for each row execute function public.fn_set_alterado();

create trigger trg_anexos_alterado
  before update on public.anexos
  for each row execute function public.fn_set_alterado();

create trigger trg_produto_tipos_alterado
  before update on public.produto_tipos
  for each row execute function public.fn_set_alterado();

create trigger trg_produto_grupos_alterado
  before update on public.produto_grupos
  for each row execute function public.fn_set_alterado();

create trigger trg_produtos_alterado
  before update on public.produtos
  for each row execute function public.fn_set_alterado();

create trigger trg_produto_versoes_alterado
  before update on public.produto_versoes
  for each row execute function public.fn_set_alterado();

-- ----------------------------------------------- fn_auditoria: só as duas tabelas sensíveis
-- `grupos_clifor` e `enderecos_clifor` carregam o que muda DINHEIRO e LIBERAÇÃO DE VENDA:
-- regime tributário e UF decidem a alíquota de ICMS do orçamento, e `liberado` trava ou libera
-- a venda. Alterar qualquer um dos dois sem trilha é alterar o resultado fiscal sem trilha. As
-- outras nove tabelas são cadastro descritivo e ficam de fora, para não inflar a auditoria (que
-- é a tabela sem poda nesta fase).
create trigger trg_grupos_clifor_auditoria
  after insert or update or delete on public.grupos_clifor
  for each row execute function public.fn_auditoria();

create trigger trg_enderecos_clifor_auditoria
  after insert or update or delete on public.enderecos_clifor
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 6. RLS E POLICIES (CLAUDE.md regra 3; 02 §1.7 e §7)
-- =====================================================================================
-- Nível OPERACIONAL de §7.2, com uma variação declarada: a LEITURA é de qualquer usuário ativo,
-- e não só de quem tem a página. Cadastro é o dado que toda tela precisa ler — o combo de
-- cliente no kanban de vendas, o de produto no orçamento, o nome do fornecedor no financeiro.
-- Exigir a página `cadastros` para ler deixaria metade do sistema sem nome para mostrar. A
-- ESCRITA é de quem tem a página `cadastros` (ver PRÉ-REQUISITO no cabeçalho).
--
-- `anon` não tem policy em tabela nenhuma (§7.3) e, por segurança em profundidade, também não
-- tem privilégio.

alter table public.grupos_clifor       enable row level security;
alter table public.enderecos_clifor    enable row level security;
alter table public.contatos_clifor     enable row level security;
alter table public.anexos              enable row level security;
alter table public.produto_tipos       enable row level security;
alter table public.produto_grupos      enable row level security;
alter table public.produtos            enable row level security;
alter table public.produto_versoes     enable row level security;
alter table public.produto_linhas      enable row level security;
alter table public.produto_condicoes   enable row level security;
alter table public.fornecedor_produtos enable row level security;

revoke all on table public.grupos_clifor       from anon;
revoke all on table public.enderecos_clifor    from anon;
revoke all on table public.contatos_clifor     from anon;
revoke all on table public.anexos              from anon;
revoke all on table public.produto_tipos       from anon;
revoke all on table public.produto_grupos      from anon;
revoke all on table public.produtos            from anon;
revoke all on table public.produto_versoes     from anon;
revoke all on table public.produto_linhas      from anon;
revoke all on table public.produto_condicoes   from anon;
revoke all on table public.fornecedor_produtos from anon;

-- ------------------------------------------------------------------------ grupos_clifor
create policy grupos_clifor_leitura on public.grupos_clifor
  for select to authenticated using (public.fn_usuario_ativo());
create policy grupos_clifor_escrita on public.grupos_clifor
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'));

comment on policy grupos_clifor_leitura on public.grupos_clifor is
  'Qualquer usuário ativo lê: o nome do cliente aparece no kanban de vendas, no financeiro e '
  'nos relatórios, telas cujo acesso não passa pela página cadastros.';
comment on policy grupos_clifor_escrita on public.grupos_clifor is
  'Escreve quem tem a página cadastros (§7.2, nível operacional). O DELETE está incluído no FOR '
  'ALL, mas a server action deve DESATIVAR (ativo = false) em vez de apagar: apagar arrasta '
  'contatos e anexos em cascade, e é impedido por on delete restrict onde houver endereço.';

-- --------------------------------------------------------------------- enderecos_clifor
create policy enderecos_clifor_leitura on public.enderecos_clifor
  for select to authenticated using (public.fn_usuario_ativo());
create policy enderecos_clifor_escrita on public.enderecos_clifor
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'));

comment on policy enderecos_clifor_escrita on public.enderecos_clifor is
  'Escreve quem tem a página cadastros. Toda escrita aqui é auditada por trigger, porque regime '
  'tributário e UF mudam o cálculo de ICMS e `liberado` libera ou trava a venda.';

-- ---------------------------------------------------------------------- contatos_clifor
create policy contatos_clifor_leitura on public.contatos_clifor
  for select to authenticated using (public.fn_usuario_ativo());
create policy contatos_clifor_escrita on public.contatos_clifor
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'));

-- ------------------------------------------------------------------------------- anexos
-- VARIAÇÃO: leitura de usuário ativo, escrita de quem tem a página cadastros, e **NENHUMA
-- POLICY DE DELETE**.
-- Motivo: no Bubble o WF bTjeL apaga TODOS os anexos de um cliente em um clique, sem
-- confirmação e sem restrição de perfil — enquanto apagar UM exige hierarquia <= 2
-- (specs/00-achados-de-seguranca.md §2.6; specs/paginas/cadastros.md §7). É apagamento em massa
-- de contrato social e documento pessoal, ao alcance de qualquer logado. Sem policy de delete
-- esse workflow não tem como ser reproduzido pelo cliente: remover anexo passa a ser server
-- action, com confirmação, trava de perfil e remoção do objeto no Storage — e o DELETE fica
-- revogado também no nível do GRANT, para que uma policy permissiva criada por engano amanhã
-- não seja suficiente (mesmo raciocínio da auditoria na 001).
create policy anexos_leitura on public.anexos
  for select to authenticated using (public.fn_usuario_ativo());
create policy anexos_insert on public.anexos
  for insert to authenticated
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'));
create policy anexos_update on public.anexos
  for update to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('cadastros'));
revoke delete on table public.anexos from authenticated;

comment on policy anexos_leitura on public.anexos is
  'Lê quem está ativo. O filtro por departamento (tipo_anexo_departamentos, 003) é aplicado '
  'pela server action e vem para cá quando a tela de anexo existir.';

-- --------------------------------------------------------- produtos e suas classificações
create policy produto_tipos_leitura on public.produto_tipos
  for select to authenticated using (public.fn_usuario_ativo());
create policy produto_tipos_escrita on public.produto_tipos
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'));

create policy produto_grupos_leitura on public.produto_grupos
  for select to authenticated using (public.fn_usuario_ativo());
create policy produto_grupos_escrita on public.produto_grupos
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'));

create policy produtos_leitura on public.produtos
  for select to authenticated using (public.fn_usuario_ativo());
create policy produtos_escrita on public.produtos
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'));

comment on policy produtos_leitura on public.produtos is
  'Qualquer usuário ativo lê: o combo de produto está no orçamento e na cotação, telas cujo '
  'acesso é a página vendas, e não cadastros.';

create policy produto_versoes_leitura on public.produto_versoes
  for select to authenticated using (public.fn_usuario_ativo());
create policy produto_versoes_escrita on public.produto_versoes
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'));

-- ------------------------------------------------------------------------ ligações puras
create policy produto_linhas_leitura on public.produto_linhas
  for select to authenticated using (public.fn_usuario_ativo());
create policy produto_linhas_escrita on public.produto_linhas
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'));

create policy produto_condicoes_leitura on public.produto_condicoes
  for select to authenticated using (public.fn_usuario_ativo());
create policy produto_condicoes_escrita on public.produto_condicoes
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'));

create policy fornecedor_produtos_leitura on public.fornecedor_produtos
  for select to authenticated using (public.fn_usuario_ativo());
create policy fornecedor_produtos_escrita on public.fornecedor_produtos
  for all to authenticated
  using (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'))
  with check (public.fn_usuario_ativo() and public.fn_pode_acessar_pagina('produtos'));

comment on policy fornecedor_produtos_leitura on public.fornecedor_produtos is
  'Lê quem está ativo: é esta ligação que responde "quais filiais de fornecedor atendem este '
  'produto?", pergunta feita pelo seletor de orçamento, dentro da página vendas.';


-- =====================================================================================
-- FIM da 006_cadastro.sql
-- =====================================================================================
-- CONFERÊNCIA
--   11 tabelas criadas, 11 com `enable row level security`, 11 com `revoke all ... from anon`.
--   23 policies: leitura + escrita nas 10 primeiras, e `anexos` com leitura + insert + update e
--   NENHUM delete (delete também revogado no GRANT).
--   8 triggers `fn_set_alterado` (uma por tabela com alterado_em) e 2 triggers `fn_auditoria`
--   (grupos_clifor, enderecos_clifor).
--   1 view, com `security_invoker = true`. Nenhuma view security definer neste arquivo.
--   NENHUM `create unique index` em `enderecos_clifor (documento)` nem em
--   `produtos (nome, grupo_id)` — decisão medida, 04 §1.1. O único índice único novo é
--   `um_principal_por_grupo`, que é regra nova e não dado herdado.
--   Funções chamadas, todas criadas em migrations anteriores: `fn_usuario_ativo` (001),
--   `fn_pode_acessar_pagina` (001), `fn_unaccent` (001), `fn_set_alterado` (001),
--   `fn_auditoria` (001).
--   Nenhum seed. Nenhum segredo.
--
-- FICA PENDENTE, por ordem de urgência:
--   1. A linha 'cadastros' em `paginas` e a concessão em `permissoes_pagina` — sem elas NINGUÉM
--      escreve nestas tabelas (ver PRÉ-REQUISITO no cabeçalho).
--   2. A migration de limpeza: `create unique index` em enderecos_clifor (documento) e em
--      produtos (nome, grupo_id), `documento` volta a `not null` e o check
--      `documento_bate_com_tipo` sai do comentário. Gatilho: v_clifor_documento_duplicado vazia.
--   3. `grupos_clifor.ultimo_historico_em` / `ultimo_historico_id` + trigger, na fatia 9.
-- =====================================================================================
