# Modelo de dados proposto — Postgres 17 / Supabase `megabox`

Escrito em 25/09/2026, a partir de `mapa/data-types.md` (34 data types, 444 campos),
`mapa/option-sets.md` (36 option sets), `mapa/backend-workflows.md` (28 backend workflows) e das 14
specs funcionais de `specs/paginas/`.

Este arquivo é o contrato do banco novo. Ele **não** é cópia 1:1 dos data types do Bubble
(`CLAUDE.md` regra 2): reconcilia as §9.5 das 14 specs num esquema só, arbitra os nomes, resolve as
listas do Bubble em tabelas de ligação e manda campo calculado para view ou coluna gerada.

Leia junto: `specs/00-achados-de-seguranca.md` (por que RLS e ausência de segredo em tabela não são
negociáveis) e a §9 de cada spec de página (de onde cada tabela veio).

---

## 1. Convenções

Valem para **toda** tabela. Onde uma tabela fugir da convenção, a fuga está escrita na própria
tabela, com o motivo.

### 1.1 Nomes

- `snake_case`, plural, em português. Sem os prefixos do Bubble (`tbl_`, `cpo_`).
- Coluna de chave estrangeira termina em `_id`: `cliente_id`, `pedido_id`.
- Tabela de ligação recebe o nome dos dois lados, do mais forte para o mais fraco:
  `pedido_entregas`, `fornecedor_produtos`, `meta_fechada_entregas`.
- Enum de domínio pequeno e estável vira **tabela**, não `enum` do Postgres — porque option set do
  Bubble tem atributos (ordem, hierarquia, dias de prazo) que precisam de colunas, e porque
  acrescentar valor a `enum` exige migration. Exceção: `tipo_clifor` e `tipo_pessoa`, que têm dois
  valores cada e nenhum atributo (§4.2).

### 1.2 Colunas obrigatórias

```sql
id          uuid primary key default gen_random_uuid()
bubble_id   text unique                 -- null nas linhas nascidas no app novo
criado_em   timestamptz not null default now()
criado_por  uuid references usuarios(id)
alterado_em timestamptz
alterado_por uuid references usuarios(id)
```

`bubble_id` em **toda** tabela é o que torna a carga idempotente e a recarga segura
(`docs/plano-de-migracao.md` §1, aprendizado nº 4). Índice único, e não é a chave primária: o app
novo não deve depender do id do Bubble.

`criado_em`/`criado_por` substituem o `Created Date`/`Created By` implícitos do Bubble. Onde o
Bubble tinha **também** um campo de vendedor separado do criador (`cpo.QualVendedor` ao lado de
`Created By`), as duas colunas continuam existindo — `mapa/backend-workflows.md`
`AtribuirCriadorVendedor` (bTtji) mostra que elas divergiram na base e foram sincronizadas à força.

### 1.3 Dinheiro e números

| Natureza | Tipo | Exemplo |
|---|---|---|
| Valor monetário | `numeric(14,2)` | `valor_venda_bruto`, `valor_comissao` |
| Alíquota / percentual | `numeric(7,4)` | `aliquota_icms` = `0.1200` para 12% |
| Quantidade | `numeric(14,3)` | `qtd_entrega` (permite fracionar) |
| Contador, ordem, prazo em dias | `integer` / `smallint` | `dias_prazo` |

**Nunca `float`, nunca `money`, nunca `text`** (`CLAUDE.md` regra 10). No Bubble tudo é `number`,
que é ponto flutuante — por isso o de-para (§5) converte e a carga precisa de relatório de
arredondamento.

Alíquota é gravada como **fração** (`0.0925`), não como `9.25`. O Bubble mistura as duas escalas:
`AdicionarFornecedores` (bTNri) grava `TotalComissaoVendedor = 0.0925` (fração) e
`NiveisVendedores.ComissaoPadrao` é ambíguo — está em `specs/paginas/metas.md` [DÚVIDA 7] e
bloqueia a carga dessa tabela.

### 1.4 Datas

- `timestamptz` sempre, nunca `timestamp`. Fuso da aplicação: `America/Sao_Paulo`.
- Data sem hora (vencimento, competência da meta) usa `date`.
- Período do Bubble (`date_range`: `User.UltimoDateRange`, `MetasMensais.DataPeriodo`) vira **duas
  colunas** `inicio`/`fim`, ou `daterange` quando houver constraint de não-sobreposição.

### 1.5 Listas do Bubble

Campo `list.custom.X` no Bubble é uma lista de ponteiros guardada na própria linha. Ela some:

- **Lista que espelha uma FK** vira apenas a FK do lado N. Exemplo: `GrupoCliFor.QuaisEnderecos`
  desaparece porque `enderecos_clifor.grupo_id` já diz tudo. Isso resolve o defeito relatado em
  `specs/paginas/enderecos-e-contatos.md` §8: hoje a relação existe em duplicidade e as telas leem
  a **lista**, então endereço que não entre nela fica invisível.
- **Lista que é N:N de verdade** vira tabela de ligação. Exemplo:
  `ProdutosModelo.QuaisFornecedores` → `fornecedor_produtos`.
- **Lista de option set** vira tabela de ligação. Exemplo: `ConfigSistema.QuaisPerfis` →
  `permissoes_pagina`.

### 1.6 Campo calculado

O Bubble grava resultado de cálculo em coluna (`ValorVendaBruto`, `ValorComissaoBruto`,
`RankingVendas`, `UltimoHistoricoData`). No modelo novo:

- Derivação simples e determinística → **coluna gerada** (`generated always as ... stored`).
- Derivação que depende de outras linhas → **view** ou função SQL.
- Espelho mantido por conveniência de leitura → **trigger**, nunca código de tela. Hoje
  `GrupoCliFor.UltimoHistoricoData` é mantido à mão por 12 lugares com regras divergentes, ao ponto
  de existirem duas rotinas de reparo em massa (`specs/paginas/historico.md` §8).

**Snapshot é exceção e é proposital.** Proposta e pedido guardam o valor praticado no momento, e
esse valor **não** pode recalcular quando o orçamento mudar depois. Onde a coluna é snapshot, está
dito na tabela.

### 1.7 RLS

RLS ligada em **toda** tabela na primeira migration (`CLAUDE.md` regra 3), com policy explícita. O
padrão está em §7. Nenhuma tabela nasce sem policy; `integracao_tokens` nasce com RLS e **nenhuma**
policy, acessível só por `service_role`.

### 1.8 Arquivo

Nada de URL pública. Arquivo vai para bucket privado do Supabase Storage e a tabela guarda o
**caminho** (`anexo_path text`), não a URL. Entrega ao usuário por URL assinada de vida curta.
Hoje todo anexo do Bubble abre por URL de CDN sem autenticação, contrato social e documento pessoal
incluídos (`specs/00-achados-de-seguranca.md` §2.2).

---

## 2. Decisões de nome (a reconciliação)

As 14 specs foram escritas em paralelo e batizaram a mesma tabela de formas diferentes. O nome
canônico é o da coluna esquerda; as outras ficam registradas para quem for ler a spec de origem.

| Canônico | Também apareceu como | Onde | Por que este |
|---|---|---|---|
| `grupos_clifor` | `clientes_fornecedores`, `clientes` | `vendas`, `casca` | É o nome de negócio: um grupo que pode ser cliente **ou** fornecedor, e a distinção é o campo `tipo`. `clientes` engana |
| `enderecos_clifor` | `enderecos`, `clifor_enderecos` | `vendas`, `sac` | Mantém o par com `grupos_clifor`. É a **filial**, e é onde mora CNPJ, inscrições e regime tributário |
| `contatos_clifor` | `contatos`, `clifor_contatos` | `vendas`, `sac` | idem |
| `produtos` | `produtos_modelo` | `enderecos-e-contatos` | `Tbl.ProdutosModelo` é o produto em si; "modelo" era ruído do Bubble |
| `produto_tipos` / `produto_grupos` | `produtos_grupo`, `produtos_subgrupo` | várias | **Cuidado:** no Bubble os nomes estão trocados (§5.3) |
| `cotacao_itens` | `cotacao_produtos` | `financeiro`, `metas`, `rotinas` | É a linha do carrinho, não um produto. `vendas.md` §9.5 já usava `cotacao_itens` |
| `orcamentos_fornecedor` | `cotacao_item_orcamentos` | `vendas` | Maioria das specs, e é o nome que o negócio usa ("orçar com o fornecedor") |
| `entrega_arquivos` | `entrega_boletos` | `rotinas` | Uma tabela para NF, boleto e comprovante, discriminada por `tipo` |
| `historicos` | `historico_cliente`, `cliente_conversas` | `vendas`, `sac` | Uma tabela só, append-only, com `tipo_evento` |
| `usuario_preferencias` | `user_preferences` | 4 specs | Português, como o resto |
| `niveis_vendedor` | `niveis_vendedores` | `metas`, `financeiro-reusables` | Singular no qualificador, como `produto_tipos` |
| `prazos_recebimento` | `prazos_pagamento` | `vendas` | É o prazo em que a MegaBox **recebe** a comissão do fornecedor |
| `integracao_tokens` | `integracoes_oauth` | `inicio-e-acesso` | Cobre OAuth e outros; o que importa é ser a tabela sem policy |
| `auditoria` | `auditoria_valores`, `auditoria_metas` | `financeiro-reusables`, `metas` | Uma trilha só, genérica (§6.8). Três tabelas de auditoria é o caminho para nenhuma |
| `pesquisas` / `pesquisa_respostas` | `pesquisa`, `pesquisa_resposta` | `formularios-publicos` | Plural, como o resto |
| `empresas_emissoras` | `empresa` | `financeiro` | São duas (Megabox e Paletes Brasil), então plural |

### 2.1 Decisões estruturais, com o motivo

1. **`contas_receber` e `contas_pagar` são duas tabelas, não uma.** No Bubble são dois data types
   com 40 e 41 campos quase idênticos — e `ContasPagar` mora, confusamente, na tabela
   `tbl_contasreceber1`. Tentar unificar em `lancamentos` com um campo `natureza` foi considerado e
   recusado: as regras divergem em vencimento (CR na data real da entrega, CP na prevista + 1 mês no
   dia 5), em quem é a contraparte (CR é o fornecedor, CP é o vendedor) e em parcelamento (CR
   parcela, CP não). Duas tabelas com colunas comuns e uma view `v_lancamentos` para as telas que
   precisam das duas.

2. **Parcela de conta a receber é linha de `contas_receber`, não tabela filha.** É o que o Bubble já
   faz (`CriarContasReceber` bTfDZ cria N linhas, uma por prazo) e o que as telas esperam. O que
   muda: `valor_total` passa a ser **rateado**, com constraint garantindo que a soma das parcelas de
   uma entrega feche com a venda. Hoje cada parcela recebe a venda cheia, então com 4 parcelas a
   soma é 4× — e é esse campo que alimenta o recibo entregue ao fornecedor
   (`specs/paginas/financeiro-reusables.md` §5, [DÚVIDA 3]).

3. **Baixa e estorno viram tabelas próprias** (`baixas`, `estornos`), não colunas na conta. Hoje a
   baixa é um punhado de colunas (`DataBaixaSistema`, `QuemBaixou`, `NumNfMegabox`, `DataEstorno`,
   `QuemEstornou`) que o cancelamento apaga sem deixar rastro, inclusive de comissão já recebida e
   declarada em recibo (`specs/paginas/financeiro-reusables.md` §4). Com tabela própria, a baixa
   sobrevive e o estorno é um registro, não um `UPDATE` destrutivo.

4. **`historicos` é append-only.** `INSERT` com `autor_id = auth.uid()`, sem `UPDATE` e sem
   `DELETE`. Correção é uma nova linha apontando para a anterior (`corrige_id`); cancelamento é
   `cancelado_em`/`cancelado_por`. Hoje editar um histórico sobrescreve o texto **e troca o autor**
   (`specs/paginas/historico.md` §7).

5. **Não existe coluna de senha.** `usuarios` referencia `auth.users`. O campo `User.PassTexto` do
   Bubble não migra (`specs/00-achados-de-seguranca.md` §1.2).

6. **Estado de tela sai das tabelas de negócio.** O Bubble guarda no `User` coisas como
   `SelecionadosPagar`, `SelecionadosReceber`, `TempOrcamentoProdutos` e `UltimoDateRange` — seleção
   de checkbox e rascunho de carrinho persistidos no banco. Vai para `usuario_preferencias` (o que é
   preferência de verdade) ou para o estado do cliente (o que é seleção efêmera). `TempOrcamentoProdutos`
   vira rascunho de cotação com `status = 'rascunho'`, não lista no usuário.

7. **Option set vira tabela com `chave_bubble`.** 36 option sets, todos em §4. A coluna
   `chave_bubble` guarda a chave textual do Bubble (`licita__o`, `lucro_real`) e é o que a carga usa
   para resolver os ponteiros. Ela **não** é o identificador do app novo.

8. **`endereco principal` é implementado de verdade ou não existe.** Hoje `cpo.Principal` é gravado
   `true` em toda filial criada e **nunca é lido** — o conceito está no banco e nunca foi
   implementado (`specs/paginas/enderecos-e-contatos.md` §8). Proposta: índice único parcial
   garantindo no máximo um principal por grupo, e a tela passa a usá-lo.

---

## 3. Esquema

DDL abreviado: omito as colunas obrigatórias de §1.2 (`id`, `bubble_id`, `criado_em`, `criado_por`,
`alterado_em`, `alterado_por`), que existem em **todas** as tabelas. Índices em §6, RLS em §7.

### 3.1 Identidade e acesso

Origem: `specs/paginas/inicio-e-acesso.md` §9.4 e `specs/paginas/casca-e-configuracao.md` §9.4.

```sql
-- Listas fixas de acesso (option sets Opt.PerfilUsuario e Opt.DeptoUsuario)
create table perfis (
  id           smallint primary key,       -- 1 Diretor, 2 Gerente, 3 Analista, 4 Operador
  chave_bubble text not null unique,       -- diretoria | gerencia | colaborador | operador
  nome         text not null
);
-- O id É a hierarquia, de propósito: a policy escreve "perfil_id <= 2", que se lê
-- "Gerente ou acima". Evita a coluna hierarquia separada, que no Bubble dá margem a divergir.

create table departamentos (
  id           smallint primary key,
  chave_bubble text not null unique,       -- diretoria | financeiro | licita__o | geral
  nome         text not null,              -- Administrativo | Financeiro | Comercial | Operação
  descricao    text
);
-- ARMADILHA DO DE-PARA: a chave 'licita__o' é o departamento COMERCIAL e 'geral' é OPERAÇÃO.
-- Nomes herdados de uma versão antiga do app. Não deduzir o departamento pela chave.

create table usuarios (
  id              uuid primary key references auth.users(id) on delete restrict,
  nome            text not null,
  email_contato   text,                    -- e-mail de resposta dos envios; ≠ e-mail de login
  perfil_id       smallint not null references perfis(id),
  departamento_id smallint not null references departamentos(id),
  ativo           boolean not null default true,
  telefone        text,
  foto_path       text,                    -- Storage privado
  cpf text, rg text,                       -- dado pessoal: ver RLS em §7.3
  cidade text, endereco text,
  uf              char(2) references ufs(sigla),
  nivel_vendedor_id uuid references niveis_vendedor(id),
  substituto_id   uuid references usuarios(id),
  ferias_inicio date, ferias_fim date,
  is_dev          boolean not null default false,
  constraint ferias_coerente check (ferias_fim is null or ferias_inicio <= ferias_fim),
  constraint substituto_nao_e_ele_mesmo check (substituto_id is distinct from id)
);
-- SEM coluna de senha. Autenticação é auth.users (specs/00-achados-de-seguranca.md §1.2).
-- NÃO migram: User.PassTexto, User.SmtpSenha/SmtpEndereco/SmtpPorta/StmpLogin (já marcados
-- 'deleted' no Bubble) e User.RankingVenda* (specs/paginas/metas.md [DÚVIDA 11]).

create table paginas (
  slug         text primary key,           -- inicio | vendas | financeiro | metas | ...
  chave_bubble text unique,                -- Opt.MenuPaginas: inicio | licita__o | dashboard | ...
  nome         text not null,              -- "Fluxo de Vendas"
  ordem        smallint,
  icone        text
);
-- No Bubble, 'Relatórios' e 'Suporte de Vendas & Nps' estão SEM ordem e sem hierarquia
-- (specs/paginas/casca-e-configuracao.md [DÚVIDA 17]). A carga precisa atribuir ordem.

create table permissoes_pagina (
  pagina_slug     text not null references paginas(slug) on delete cascade,
  perfil_id       smallint references perfis(id),
  departamento_id smallint references departamentos(id),
  usuario_id      uuid references usuarios(id) on delete cascade,
  constraint alvo_unico check (
    (perfil_id is not null)::int + (departamento_id is not null)::int
    + (usuario_id is not null)::int = 1
  )
);
-- Substitui ConfigSistema.QuaisPerfis/QuaisDeptos/QuaisUsuarios, que hoje é a tabela de permissão
-- COM auto-binding liberado: qualquer logado se dá acesso a qualquer página sem abrir tela
-- (specs/00-achados-de-seguranca.md §2.3). Aqui a escrita é só por server action de admin.

create table usuario_preferencias (
  usuario_id     uuid primary key references usuarios(id) on delete cascade,
  pagina_inicial text references paginas(slug),
  periodo_inicio timestamptz, periodo_fim timestamptz,  -- era User.UltimoDateRange (date_range)
  ordenacao      jsonb not null default '{}',           -- era User.OrdenarCampos
  filtros        jsonb not null default '{}',           -- era FiltraTipoClifor, ExpandirCadastroClifor
  copia_pedido text, copia_proposta text, copia_cancelamentos text
);
-- Recebe o estado de tela que hoje mora no User. NÃO recebe SelecionadosPagar/SelecionadosReceber
-- (seleção de checkbox = estado do cliente) nem TempOrcamentoProdutos (vira cotação rascunho).

create table log_acesso (
  id bigserial primary key,
  usuario_id    uuid references usuarios(id),
  email_tentado text,
  evento        text not null,   -- login | logout | reset_solicitado | convite | falha
  resultado     text not null,   -- ok | senha_invalida | inativo | expirado
  ip inet, user_agent text,
  em timestamptz not null default now()
);
-- Não existe equivalente no Bubble: hoje não há registro nenhum de acesso.

create table integracao_tokens (
  provedor     text not null,              -- google
  conta        text not null,              -- a conta de envio
  access_token text, refresh_token text,
  expira_em    timestamptz,
  unique (provedor, conta)
);
-- RLS ligada e NENHUMA policy: só service_role. Nunca vai para tela.
-- Hoje esses tokens ficam em ConfigSistema[CodigoConfig=21], tabela pública, e são exibidos na
-- interface (specs/00-achados-de-seguranca.md §1.3).

create table config_sistema (
  chave     text primary key,              -- 'email.cota_diaria', 'alerta.dias_sem_interacao'
  valor     jsonb not null,
  descricao text not null,
  editavel_por_perfil smallint not null default 1 references perfis(id)
);
-- comment on table config_sistema is
--   'NUNCA guardar segredo aqui. Credencial de serviço é variável de ambiente do servidor;
--    token de integração é integracao_tokens.';
-- Substitui Tbl.ConfigSistema, que no Bubble são 15 colunas genéricas (ValorTexto1/2,
-- ValorBoolean1/2, ValorNumero, ValorDataHora1/2) endereçadas por um CodigoConfig numérico.
-- As linhas de permissão vão para permissoes_pagina; as de cópia de e-mail para config_copia_email.

create table config_copia_email (
  evento     text not null,                -- pedido | proposta | cancelamento | cobranca
  usuario_id uuid references usuarios(id) on delete cascade,
  email      text,
  tipo       text not null default 'cc',   -- cc | bcc
  constraint destino_unico check ((usuario_id is not null)::int + (email is not null)::int = 1)
);
-- Hoje são endereços colados em campo texto, com ';' e ',' misturados como separador, e alguns
-- fixos no corpo do workflow (contato@ e financeiro@ aparecem hardcoded em EnviarEmailPedido).

create table auditoria (
  id bigserial primary key,
  tabela     text not null,
  linha_id   uuid not null,
  operacao   text not null,                -- insert | update | delete
  usuario_id uuid references usuarios(id),
  antes jsonb, depois jsonb,
  motivo     text,                         -- obrigatório onde a regra exigir
  em timestamptz not null default now()
);
-- Uma trilha só (decisão §2.1.9). UPDATE e DELETE revogados, inclusive para o dono da tabela.
-- Alimentada por trigger nas tabelas de dinheiro, de permissão e de cadastro.
```

### 3.2 Cadastro

Origem: `specs/paginas/cadastros.md` §9.5 e `specs/paginas/enderecos-e-contatos.md` §9.5.

```sql
create table grupos_clifor (
  tipo         tipo_clifor not null,       -- enum: cliente | fornecedor
  nome         text not null,
  ativo        boolean not null default true,
  foto_path    text,
  carteira_id  uuid references usuarios(id),
  captacao_id  smallint references captacoes(id),
  liberado     boolean not null default true,        -- false = bloqueado
  liberado_motivo text,
  nao_faz_contrato_parceria boolean not null default false,
  possui_filiais boolean not null default false,
  corporativo  boolean not null default false,
  frete_id     smallint references tipos_frete(id),
  email_principal text,
  nome_comprador text, capacidade_compra text, demanda text, observacoes text,
  codigo_legado integer,
  constraint carteira_so_cliente check (carteira_id is null or tipo = 'cliente')
);
-- ARMADILHAS DO DE-PARA (specs/paginas/cadastros.md §8):
--   cpo.Liberado           → id cpo_bloqueado_boolean          (nome e id com sentido oposto)
--   cpo.NãoFazContratoParceria → id cpo_fazcontratoparceria_boolean  (idem)
--   cpo.Observacoes        → id cpo_codcliente_text            (é observação, NÃO código)
--   cpo.QualProduto (text) → anotação livre, NÃO é FK para produtos
-- ultimo_historico_em / ultimo_historico_id: ver §3.7, mantidos por TRIGGER.

create table enderecos_clifor (
  grupo_id      uuid not null references grupos_clifor(id) on delete restrict,
  nome_endereco text not null,
  razao text, fantasia text,
  documento     text not null,             -- só dígitos: CNPJ (14) ou CPF (11)
  tipo_pessoa   tipo_pessoa not null,      -- enum: cpf | cnpj
  insc_estadual text, insc_municipal text,
  regime_tributario_id smallint not null references regimes_tributarios(id),
  cep text, logradouro text, numero text, complemento text, bairro text, municipio text,
  uf            char(2) not null references ufs(sigla),
  localizacao   geography(point, 4326),
  ativo         boolean not null default true,
  liberado      boolean not null default true,
  liberado_motivo text,
  principal     boolean not null default false,
  corporativo   boolean not null default false,
  frete_id      smallint references tipos_frete(id),
  nome_comprador text, capacidade_compra text, demanda text, observacoes text,
  constraint documento_bate_com_tipo check (
    (tipo_pessoa = 'cpf'  and documento ~ '^[0-9]{11}$') or
    (tipo_pessoa = 'cnpj' and documento ~ '^[0-9]{14}$')
  )
);
create unique index um_principal_por_grupo on enderecos_clifor (grupo_id) where principal;
-- Esta é a FILIAL, e é onde vive TODA a regra fiscal: regime tributário e UF daqui decidem a
-- alíquota de ICMS do orçamento (specs/paginas/enderecos-e-contatos.md §5).
-- O índice parcial implementa de verdade o "endereço principal", que hoje é gravado em toda filial
-- e nunca lido (decisão §2.1.8).
-- UNICIDADE de documento: §8.1 — é uma das cinco pendências que BLOQUEIAM a carga.
-- DUAS FONTES DE UF no Bubble: cpo.UF (text livre) e cpo.QualUfOpt (option set). O option set
-- vence; onde estiver vazio, cai para o texto, com relatório de divergência
-- (specs/paginas/enderecos-e-contatos.md [DÚVIDA 14], specs/paginas/relatorios.md [DÚVIDA 4]).

create table contatos_clifor (
  grupo_id    uuid not null references grupos_clifor(id) on delete cascade,
  endereco_id uuid references enderecos_clifor(id) on delete set null,
  nome        text not null,
  cargo text, email text, telefone text,
  tipo_telefone_id smallint references tipos_telefone(id),
  ativo       boolean not null default true
);
-- Tbl.ContatoCliFor tem cpo.Email E cpo.EmailPrincipal; o segundo nunca é lido
-- (specs/paginas/enderecos-e-contatos.md [DÚVIDA 13]) → migra só email.
-- cpo.ativo nasce vazio no Bubble; na carga, null vira true.

create table anexos (
  grupo_id      uuid references grupos_clifor(id) on delete cascade,
  endereco_id   uuid references enderecos_clifor(id) on delete cascade,
  usuario_id    uuid references usuarios(id) on delete cascade,
  tipo_anexo_id smallint not null references tipos_anexo(id),
  nome_arquivo  text not null,
  path          text not null,             -- Storage privado, NUNCA URL de CDN
  tamanho_bytes bigint,
  constraint dono_unico check (
    (grupo_id is not null)::int + (endereco_id is not null)::int
    + (usuario_id is not null)::int = 1
  )
);
-- Tbl.Anexos não tem regra de privacidade nenhuma no Bubble e os arquivos abrem por URL pública de
-- CDN — contrato social e documento pessoal incluídos (specs/00-achados-de-seguranca.md §2.2).
-- A visibilidade por departamento vem de tipo_anexo_departamentos (§4).

-- PRODUTOS. Atenção: no Bubble os nomes das duas classificações estão TROCADOS em relação
-- às tabelas físicas. O de-para abaixo é o correto.
create table produto_tipos (           -- Bubble: Tbl.ProdutosTipo,  tabela física tbl_produtosgrupo
  nome       text not null unique,
  icone_path text
);
create table produto_grupos (          -- Bubble: Tbl.ProdutosGrupo, tabela física tbl_produtossubgrupo
  tipo_id uuid not null references produto_tipos(id) on delete restrict,
  nome    text not null,
  unique (tipo_id, nome)
);
create table produtos (                -- Bubble: Tbl.ProdutosModelo, tabela física tbl_produtos
  tipo_id   uuid references produto_tipos(id),
  grupo_id  uuid references produto_grupos(id),
  nome      text not null,
  descricao text,
  ativo     boolean not null default true,
  foto_frontal_path text, foto_lateral_path text,
  foto_superior_path text, foto_inferior_path text
);
create table produto_versoes (
  produto_id uuid not null references produtos(id) on delete cascade,
  nome  text not null,
  ativo boolean not null default true,
  unique (produto_id, nome)
);
create table produto_linhas (
  produto_id uuid not null references produtos(id) on delete cascade,
  linha_id   smallint not null references linhas_produto(id),
  primary key (produto_id, linha_id)
);
create table produto_condicoes (
  produto_id  uuid not null references produtos(id) on delete cascade,
  condicao_id smallint not null references condicoes_produto(id),
  primary key (produto_id, condicao_id)
);
create table fornecedor_produtos (
  endereco_fornecedor_id uuid not null references enderecos_clifor(id) on delete cascade,
  produto_id uuid not null references produtos(id) on delete cascade,
  primary key (endereco_fornecedor_id, produto_id)
);
-- O Bubble tem DUAS listas concorrentes: ProdutosModelo.QuaisFornecedores (aponta para o grupo) e
-- QuaisFornecedoresFiliais (aponta para o endereço). Vale a da FILIAL, porque é ela que orça e que
-- define a origem do frete e do ICMS. A lista por grupo é descartada na carga.
-- UNICIDADE de produtos (nome, grupo_id): §8.1, também bloqueia a carga.
-- NÃO existe tela para criar produto_tipos/produto_grupos hoje
-- (specs/paginas/cadastros.md [DÚVIDA 8]) → o app novo precisa de uma.
```

### 3.3 Ciclo comercial

Origem: `specs/paginas/vendas.md` §9.5 e `specs/paginas/vendas-reusables.md` §9.5.
Fluxo: **cotação → (orçamentos por fornecedor, um vencedor por item) → proposta → pedido →
entregas → confirmação de entrega, que gera contas a receber e a pagar.**

```sql
create table cotacoes (
  numero        integer not null unique,          -- era CotacaoNum; sequence no app novo
  cliente_id    uuid not null references grupos_clifor(id) on delete restrict,
  vendedor_id   uuid not null references usuarios(id),
  empresa_emissora_id smallint not null references empresas_emissoras(id),
  etapa_id      smallint not null references etapas(id),
  status_id     smallint not null references cotacao_status(id),
  data_validade date,
  amostra       boolean not null default false,
  arquivado     boolean not null default false,
  motivo_arquivamento_id smallint references motivos_arquivamento(id),
  rascunho      boolean not null default false     -- era User.TempOrcamentoProdutos
);
-- No Bubble, CotacaoEtapa e CotacaoStatus NÃO são gravados na criação
-- (specs/paginas/vendas.md [DÚVIDA 5]) → aqui são NOT NULL com default explícito na migration.
-- numero: a sequence do app novo começa acima do maior número existente. Hoje há um caminho que
-- deriva o número da cotação do último NÚMERO DE PEDIDO (CriarContasReceberImportadas bTmHf),
-- o que mistura as duas numerações — não reproduzir (specs/paginas/rotinas.md [DÚVIDA 5]).
-- vendedor_id é NOT NULL: resolve de vez a rotina AtribuirCriadorVendedor (bTtji), que existia só
-- para preencher o que nascia vazio.

create table cotacao_itens (                        -- Bubble: Tbl.CotacaoProdutos
  cotacao_id  uuid not null references cotacoes(id) on delete cascade,
  produto_id  uuid not null references produtos(id) on delete restrict,
  grupo_produto_id uuid references produto_grupos(id),
  qtd         numeric(14,3) not null check (qtd > 0),
  medida      text,
  linha_id    smallint references linhas_produto(id),
  condicao_id smallint references condicoes_produto(id),
  endereco_destino_id uuid not null references enderecos_clifor(id) on delete restrict
);
-- cliente_id do Bubble sai: vem por join de cotacoes. Era denormalização sem dono.

create table orcamentos_fornecedor (                -- Bubble: Tbl.OrcFornecedoresCotacao
  cotacao_item_id uuid not null references cotacao_itens(id) on delete cascade,
  cotacao_id      uuid not null references cotacoes(id) on delete cascade,  -- atalho p/ índice
  fornecedor_id   uuid not null references grupos_clifor(id) on delete restrict,
  endereco_origem_id   uuid not null references enderecos_clifor(id) on delete restrict,
  endereco_destino_id  uuid not null references enderecos_clifor(id) on delete restrict,
  endereco_cobranca_id uuid references enderecos_clifor(id),
  produto_id      uuid not null references produtos(id) on delete restrict,
  vendedor_id     uuid not null references usuarios(id),
  qtd_venda       numeric(14,3) not null check (qtd_venda > 0),
  medida text, linha_id smallint references linhas_produto(id),
  condicao_id     smallint references condicoes_produto(id),
  -- valores unitários informados pelo usuário
  valor_venda_unit    numeric(14,2) not null default 0,
  valor_comissao_unit numeric(14,2) not null default 0,
  valor_frete         numeric(14,2) not null default 0,
  tipo_frete_id       smallint not null references tipos_frete(id),
  frete_fracionado    boolean not null default false,
  -- alíquotas, como FRAÇÃO (0.1200 = 12%)
  aliquota_icms       numeric(7,4) not null default 0,
  aliquota_pis_cofins numeric(7,4) not null default 0,
  aliquota_ipi        numeric(7,4) not null default 0,
  -- derivados: colunas geradas, não gravadas pela tela
  valor_venda_bruto numeric(14,2)
    generated always as (qtd_venda * valor_venda_unit + valor_frete) stored,
  valor_comissao_bruto numeric(14,2)
    generated always as (qtd_venda * valor_comissao_unit) stored,
  valor_icms numeric(14,2)
    generated always as (qtd_venda * valor_venda_unit * aliquota_icms) stored,
  valor_pis_cofins numeric(14,2)
    generated always as (qtd_venda * valor_venda_unit * aliquota_pis_cofins) stored,
  vencedor        boolean not null default false
);
create unique index um_vencedor_por_item
  on orcamentos_fornecedor (cotacao_item_id) where vencedor;
-- As colunas geradas reproduzem CalculaFornecedoresLista (bTPFh), que hoje é um backend workflow
-- disparado com PAUSA de 1 segundo a cada tecla digitada. Passa a ser aritmética do banco.
-- valor_venda_liquido e valor_unit_liquido viram view (§5), porque dependem das duas geradas acima.
--
-- ARMADILHA DE LEITURA, RESOLVIDA EM 25/09/2026 (corrige o que estava escrito aqui antes):
-- os ids `cpo_tributos_number` e `cpo_tributopiscofinsb_number` são usados por DOIS data types.
-- Em `Tbl.MetasFechadas` eles carregam `TotalBonusExtra - deleted` e `TotalComissaoVendedor`; em
-- `Tbl.OrcFornecedoresCotacao` eles são `TributosICMS` e `TributoPISCOFINS`, e NÃO estão excluídos.
-- O decompilador rotulou os campos do orçamento com os nomes da meta.
-- Prova: `AdicionarFornecedores` (bTNri) grava nesses campos, num NewThing de
-- OrcFornecedoresCotacao, a alíquota de ICMS buscada em Tbl.IcmsEstados e 0.0925 de PIS/COFINS.
-- Ou seja: `CalculaFornecedoresLista` (bTPFh) calcula os dois tributos CORRETAMENTE.
-- Conclusão para a migração: não é defeito, e `valor_venda_liquido` é liquido de verdade —
-- EXCETO quando as alíquotas ficam vazias, que é o caminho bThgz0 (origem fora de Lucro
-- Real/Presumido), onde os tributos dão zero por regra, não por bug.
--
-- DEFEITOS QUE PERMANECEM E NÃO SE REPRODUZEM AQUI:
--   1. Em bTtlO/bTtlb as DUAS alíquotas recebem o mesmo input (El[ip icms]): na tela de histórico
--      o campo de PIS/COFINS é decorativo (specs/paginas/historico.md §8).
--   2. A alíquota é COPIADA para a tela e gravada, em vez de derivada da tabela de ICMS no
--      momento do cálculo — por isso muda de resultado conforme quem editou por último, e por isso
--      a duplicação de pedido leva o ICMS da UF antiga (specs/paginas/vendas-reusables.md §5).
--   3. `Tbl.IcmsEstados` tem auto-binding liberado: qualquer logado altera a alíquota
--      (specs/00-achados-de-seguranca.md §2.3).
-- aliquota_icms tem default vindo de icms_aliquotas(uf_origem, uf_destino) por função, não por
-- cópia da tela; e só se aplica quando origem e destino são Lucro Real/Presumido
-- (AdicionarFornecedores bTNri; specs/paginas/vendas.md [DÚVIDA 3]).

create table propostas (
  cotacao_id     uuid not null references cotacoes(id) on delete cascade,
  numero         integer not null,
  vendedor_id    uuid not null references usuarios(id),
  enviar_para_contato_id uuid references contatos_clifor(id),
  faturar_para_endereco_id uuid references enderecos_clifor(id),
  cnpj_fornecedor_endereco_id uuid references enderecos_clifor(id),
  condicao_pagamento text,
  info_adicional text,
  corpo_email    text,
  emails_copia   text,
  data_prev_entrega date,
  enviada        boolean not null default false,
  enviada_em     timestamptz,
  arquivo_path   text,                              -- PDF em Storage privado
  unique (cotacao_id, numero)
);
create table proposta_itens (
  proposta_id uuid not null references propostas(id) on delete cascade,
  orcamento_fornecedor_id uuid not null references orcamentos_fornecedor(id) on delete restrict,
  -- SNAPSHOT: valores praticados na proposta, não recalculam se o orçamento mudar depois
  qtd                 numeric(14,3) not null,
  valor_venda_unit    numeric(14,2) not null,
  valor_comissao_unit numeric(14,2) not null,
  valor_frete         numeric(14,2) not null default 0
);
-- Snapshot é proposital (§1.6): a proposta enviada ao cliente é um documento, e o que ele recebeu
-- não pode mudar depois. Hoje o Bubble guarda só a lista de ponteiros
-- (Propostas.QuaisOrcamentosFornecedores), então reabrir uma proposta antiga mostra valores de hoje.

create table pedidos (
  numero        text not null,                      -- era NumeroPedido (texto no Bubble)
  cotacao_id    uuid not null references cotacoes(id) on delete restrict,
  proposta_id   uuid references propostas(id) on delete restrict,
  cliente_id    uuid not null references grupos_clifor(id) on delete restrict,
  vendedor_id   uuid not null references usuarios(id),
  etapa_id      smallint not null references etapas(id),
  forma_pagamento_id smallint references formas_pagamento(id),
  ordem_compra_numero text,
  ordem_compra_path   text,
  arquivo_path        text,                         -- PDF do pedido
  contato_cliente_id     uuid references contatos_clifor(id),
  contato_fornecedor_id  uuid references contatos_clifor(id),
  emails_copia_cliente text, emails_copia_fornecedor text,
  corpo_email_cliente text, corpo_email_fornecedor text,
  info_adicional text,
  primeiro_fornecedor_endereco_id uuid references enderecos_clifor(id),
  formalizado  boolean not null default false, formalizado_em timestamptz,
  finalizado   boolean not null default false, finalizado_em timestamptz,
  motivo_cancelamento text,
  motivo_altera_valores text
);
create table pedido_prazos (                        -- era Pedido.PrazoRecebComissoes (list.option)
  pedido_id uuid not null references pedidos(id) on delete cascade,
  prazo_id  smallint not null references prazos_recebimento(id),
  primary key (pedido_id, prazo_id)
);
-- numero é text porque é assim no Bubble e porque o histórico tem valores não numéricos. O app novo
-- gera a partir da sequence da cotação, mas aceita o legado.
-- 'Pedido número repete o número da cotação' e 'uma cotação pode gerar mais de um pedido?' é
-- pendência (specs/paginas/vendas.md [DÚVIDA 19]) → unique só depois de respondida.
-- Pedido.Importado tem id cpo_pedidoenviado_boolean: campo REAPROVEITADO, não confundir
-- (specs/paginas/rotinas.md [DÚVIDA 13]). Não migra: é flag da importação antiga.

create table entregas (
  pedido_id   uuid not null references pedidos(id) on delete cascade,
  orcamento_fornecedor_id uuid not null references orcamentos_fornecedor(id) on delete restrict,
  cotacao_id  uuid not null references cotacoes(id) on delete restrict,
  proposta_id uuid references propostas(id),
  cliente_id     uuid not null references grupos_clifor(id) on delete restrict,
  fornecedor_id  uuid not null references grupos_clifor(id) on delete restrict,
  vendedor_id    uuid not null references usuarios(id),
  vendedor_substituto_id uuid references usuarios(id),
  numero_entrega text,
  qtd            numeric(14,3) not null check (qtd > 0),
  status_id      smallint not null references etapas(id),
  dt_prev_entrega date,                              -- era DtPrevEntrega (cpo_dataentrega_date)
  dt_entrega      date,                              -- era DtEntrega    (cpo_dtentrega_date)
  dt_pedido       date,
  saiu_entrega   boolean not null default false,
  nao_emite_nf   boolean not null default false,
  nf_fornecedor_numero text, dt_emissao_nf date,
  nf_megabox_numero    text, dt_nf_megabox  date,
  nota_boleto_enviada  boolean not null default false,
  motivo_cancelamento text, motivo_alteracao_valores text,
  -- SNAPSHOT dos valores da entrega, rateados a partir do orçamento
  valor_venda_bruto_unit    numeric(14,2) not null default 0,
  valor_venda_liquido_unit  numeric(14,2) not null default 0,
  valor_comissao_unit       numeric(14,2) not null default 0,
  valor_venda_bruto   numeric(14,2) generated always as (qtd * valor_venda_bruto_unit) stored,
  valor_venda_liquido numeric(14,2) generated always as (qtd * valor_venda_liquido_unit) stored,
  valor_comissao      numeric(14,2) generated always as (qtd * valor_comissao_unit) stored,
  constraint entrega_cancelada_tem_motivo check (
    status_id <> (select id from etapas where chave_bubble = 'cancelado')
    or motivo_cancelamento is not null
  )
);
-- ATENÇÃO NO DE-PARA: no Bubble, DtPrevEntrega tem o id cpo_dataentrega_date e DtEntrega tem
-- cpo_dtentrega_date. É fácil trocar uma pela outra, e a tela de vendas já mostra a PREVISTA sob o
-- rótulo 'Dt Pedido' (specs/paginas/vendas.md §2.3). O de-para segue o SIGNIFICADO.
-- Os três unitários são snapshot (CalcularValoresEntregas bTbPH): a entrega registra o que foi
-- praticado, e mudar o orçamento depois não reescreve entrega já confirmada.
-- vendedor_substituto_id é preenchido por trigger a partir das férias do vendedor
-- (AtribuirVendedorSubstituto bUBpN), não por rotina em massa.

create table entrega_arquivos (
  entrega_id uuid not null references entregas(id) on delete cascade,
  tipo       text not null,        -- nf_fornecedor | boleto | comprovante | nf_megabox
  nome_arquivo text not null,
  path       text not null,        -- Storage privado + URL assinada
  enviado_em timestamptz
);
-- Unifica ArquivoNfFornecedor, BoletoFile, BoletoArquivos (list.file), ComprovanteEntrega e
-- AnexoNfMegabox. Resolve de saída a rotina 'copiar boleto único p/ lista' (bTiEc0), que existia
-- só para reconciliar o campo único com a lista (specs/paginas/rotinas.md §9.6).
```

### 3.4 Financeiro

Origem: `specs/paginas/financeiro.md` §9.5 e `specs/paginas/financeiro-reusables.md` §9.5.
Glossário: **conta a receber** é a comissão que o fornecedor deve à MegaBox; **conta a pagar** é a
comissão do vendedor (3% da comissão da entrega).

```sql
create table contas_receber (
  entrega_id    uuid not null references entregas(id) on delete restrict,
  pedido_id     uuid not null references pedidos(id) on delete restrict,
  cotacao_id    uuid references cotacoes(id),
  proposta_id   uuid references propostas(id),
  orcamento_fornecedor_id uuid references orcamentos_fornecedor(id),
  cliente_id    uuid not null references grupos_clifor(id) on delete restrict,
  fornecedor_id uuid not null references grupos_clifor(id) on delete restrict,
  vendedor_id   uuid not null references usuarios(id),
  endereco_origem_id  uuid references enderecos_clifor(id),
  endereco_destino_id uuid references enderecos_clifor(id),
  parcela       smallint not null check (parcela >= 1),
  parcelas_total smallint not null check (parcelas_total >= 1),
  prazo_id      smallint references prazos_recebimento(id),
  qtd           numeric(14,3) not null,
  valor_unit    numeric(14,2) not null,
  valor_total   numeric(14,2) not null,       -- RATEADO por parcela (§2.1.2)
  valor_comissao numeric(14,2) not null,      -- RATEADO por parcela
  motivo_altera_comissao text,
  dt_pedido date, dt_prev_entrega date, dt_entrega date,
  dt_vencimento date not null,
  nf_fornecedor_numero text,
  nf_megabox_numero text, dt_nf_megabox date, nf_megabox_path text,
  status_id     smallint not null references status_financeiro(id),
  arquivado     boolean not null default false,
  constraint parcela_coerente check (parcela <= parcelas_total),
  unique (entrega_id, parcela)
);
-- MUDANÇAS DELIBERADAS EM RELAÇÃO AO BUBBLE (specs/paginas/financeiro-reusables.md §5):
--   1. valor_total é RATEADO. Hoje CriarContasReceber (bTfDb) grava a venda CHEIA em cada parcela:
--      com 4 parcelas a soma é 4× a venda — e é esse campo que alimenta o recibo entregue ao
--      fornecedor. Constraint de fechamento em §6.
--   2. status_id é NOT NULL. Hoje bTfDb NUNCA atribui StatusFinanceiro: as parcelas nascem com
--      status vazio, e só o importador grava 'A receber'.
--   3. unique (entrega_id, parcela) impede a duplicação que hoje acontece quando a confirmação de
--      entrega é regravada (specs/paginas/vendas.md [DÚVIDA 9]).
--   4. NF do fornecedor e caminho do arquivo são DUAS colunas. Hoje bUBiY/bTvEN0 atribuem o campo
--      NumNfFornecedor duas vezes na mesma ação, e a URL do arquivo vence, deixando uma URL no
--      campo do número e quebrando o filtro e o relatório (specs/paginas/historico.md §8).

create table contas_pagar (
  entrega_id  uuid not null references entregas(id) on delete restrict,
  pedido_id   uuid not null references pedidos(id) on delete restrict,
  cotacao_id  uuid references cotacoes(id),
  orcamento_fornecedor_id uuid references orcamentos_fornecedor(id),
  cliente_id  uuid not null references grupos_clifor(id) on delete restrict,
  fornecedor_id uuid references grupos_clifor(id),
  vendedor_id uuid not null references usuarios(id),   -- é a QUEM se paga
  meta_fechada_id uuid references metas_fechadas(id),
  qtd         numeric(14,3) not null,
  valor_base  numeric(14,2) not null,        -- comissão da entrega
  percentual  numeric(7,4) not null,         -- 0.0300 hoje; ver §8.1
  valor_comissao numeric(14,2) not null,     -- valor_base * percentual, validado por teste
  dt_vencimento date not null,
  status_id   smallint not null references status_financeiro(id),
  motivo_altera_comissao text,
  unique (entrega_id, vendedor_id)
);
-- percentual deixa de ser literal. Hoje 0.03 está fixo em TRÊS workflows (CriarContasPagar bToYn,
-- CriarComissoesPassadas bTpol, CorrigirValorComissaoPagar bTpor) e não se sabe se é igual para
-- todos os vendedores ou se deveria vir de niveis_vendedor (§8.1).
-- Vencimento: DtEntrega + 1 mês, dia 5 (bToYn). A CR usa a data REAL e a CP a PREVISTA — divergência
-- registrada em specs/paginas/financeiro-reusables.md [DÚVIDA 4].
-- unique (entrega_id, vendedor_id) impede a comissão em dobro que hoje acontece quando a mesma
-- entrega é fechada na meta Regular de um vendedor e na de Substituição de outro
-- (specs/paginas/metas.md §5).

create table baixas (
  conta_receber_id uuid references contas_receber(id) on delete restrict,
  conta_pagar_id   uuid references contas_pagar(id) on delete restrict,
  valor      numeric(14,2) not null check (valor > 0),
  dt_baixa   date not null,
  dt_credito date,                            -- era DataRecebimentoBancocaixa
  usuario_id uuid not null references usuarios(id),
  recibo_id  uuid references recibos(id),
  observacao text,
  constraint conta_unica check (
    (conta_receber_id is not null)::int + (conta_pagar_id is not null)::int = 1
  )
);
create table estornos (
  baixa_id   uuid not null references baixas(id) on delete restrict,
  motivo     text not null,
  usuario_id uuid not null references usuarios(id),
  em timestamptz not null default now()
);
-- Baixa e estorno viram FATOS, não colunas na conta (§2.1.3). Hoje são colunas que o cancelamento
-- apaga sem deixar rastro, inclusive de comissão já recebida e declarada em recibo
-- (specs/paginas/financeiro-reusables.md §4). Aqui o estorno é registro, não UPDATE destrutivo, e
-- o status da conta passa a ser derivado das baixas (view em §5).

create table cobrancas (
  numero        integer not null unique,
  fornecedor_id uuid not null references grupos_clifor(id) on delete restrict,
  enviada_em    timestamptz,
  arquivo_path  text, link text
);
create table cobranca_contas (
  cobranca_id      uuid not null references cobrancas(id) on delete cascade,
  conta_receber_id uuid not null references contas_receber(id) on delete restrict,
  primary key (cobranca_id, conta_receber_id)
);
create table recibos (
  numero      integer not null unique,
  fornecedor_id uuid not null references grupos_clifor(id) on delete restrict,
  emitido_em  timestamptz not null default now(),
  emitido_por uuid not null references usuarios(id),
  valor_total numeric(14,2) not null,
  arquivo_path text
);
-- Cobrancas.QuaisEntregas está marcada 'deleted' no Bubble e QuaisContasReceber é a viva → só a
-- ligação com contas_receber migra.
```

### 3.5 Metas e comissão do vendedor

Origem: `specs/paginas/metas.md` §9.5.

```sql
create table niveis_vendedor (                     -- Bubble: Tbl.NiveisVendedores
  nome       text not null unique,
  ordem      smallint not null unique,
  meta_venda numeric(14,2) not null,
  comissao_padrao      numeric(7,4) not null,      -- FRAÇÃO (0.0300), ver §8.1
  comissao_meta_batida numeric(7,4) not null,
  qtd_meta_batida      smallint not null default 0 -- era cpo_mediasobenivel_number
);
-- QuaisVendedores (list.user) some: a FK é usuarios.nivel_vendedor_id.
-- old_ValorBonus NÃO migra (specs/paginas/metas.md [DÚVIDA 11]).
-- ESCALA das duas comissões é pendência que bloqueia a carga (§8.1): o Bubble não deixa claro se
-- 0,10 significa 10% ou 0,10%. Hoje essa tabela tem auto-binding liberado, então qualquer logado
-- altera meta e percentual sem passar por workflow (specs/00-achados-de-seguranca.md §2.3).

create table vendedor_nivel_historico (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  nivel_id   uuid not null references niveis_vendedor(id),
  vigencia_inicio date not null,
  vigencia_fim    date,
  motivo     text,
  exclude using gist (
    usuario_id with =,
    daterange(vigencia_inicio, coalesce(vigencia_fim, 'infinity'::date), '[)') with &&
  )
);
-- Não existe no Bubble: hoje o nível é um ponteiro no User, sem história. Sem isso não dá para
-- recalcular uma meta antiga com o percentual que valia na época.

create table metas_mensais (
  vendedor_id uuid not null references usuarios(id) on delete restrict,
  competencia date not null,                       -- sempre dia 1 do mês
  tipo_meta_id smallint not null references tipos_meta(id),  -- Regular | Substituição
  nivel_id    uuid references niveis_vendedor(id),
  valor_meta  numeric(14,2) not null,
  periodo_inicio date not null,
  periodo_fim    date not null,
  observacao  text,
  meta_fechada_id uuid references metas_fechadas(id),
  constraint periodo_coerente check (periodo_inicio <= periodo_fim),
  unique (vendedor_id, competencia, tipo_meta_id)
);
-- RankingVendas SAI da tabela: vira view (§5). Hoje é gravado por DUAS páginas com regras
-- diferentes, a cada carregamento, a partir do navegador — e a de relatorios conta a comissão duas
-- vezes quando há vendedor substituto (specs/paginas/relatorios.md §4.6). Qual regra vale é
-- pendência que bloqueia (§8.1).
-- DataPeriodo (date_range) vira as duas colunas, conforme §1.4.

create table metas_fechadas (                      -- Bubble: Tbl.MetasFechadas (tbl_orcfornecedorescotacao)
  vendedor_id uuid not null references usuarios(id) on delete restrict,
  competencia date not null,
  periodo_inicio date not null,
  periodo_fim    date not null,
  total_comissao_megabox  numeric(14,2) not null,
  total_comissao_vendedor numeric(14,2) not null,
  fechada_em  timestamptz not null default now(),
  fechada_por uuid not null references usuarios(id),
  unique (vendedor_id, competencia)
);
create table meta_fechada_entregas (
  meta_fechada_id uuid not null references metas_fechadas(id) on delete cascade,
  entrega_id      uuid not null references entregas(id) on delete restrict,
  primary key (meta_fechada_id, entrega_id)
);
create unique index entrega_em_uma_meta_so on meta_fechada_entregas (entrega_id);
-- ESSE ÍNDICE É A CORREÇÃO CENTRAL DO MÓDULO. Hoje a mesma entrega pode ser fechada na meta
-- Regular de um vendedor E na de Substituição de outro, gerando duas contas a pagar
-- (specs/paginas/metas.md §5). Com ele, o banco recusa.
-- total_comissao_vendedor deixa de vir do input da tela. Hoje o WF bTwAj grava o valor que está no
-- campo e cria a conta a pagar com ele, sem recálculo no servidor e sem transação: quem mexe no DOM
-- escolhe quanto a MegaBox paga. No app novo é função SQL, em transação, com teste (§5).
-- Tbl.MetaAdicional NÃO migra (specs/paginas/metas.md [DÚVIDA 11]).
```

### 3.6 SAC e pesquisas

Origem: `specs/paginas/sac.md` §9.5 e `specs/paginas/formularios-publicos.md` §9.5.

```sql
create table sac_protocolos (
  numero        integer not null unique,
  grupo_clifor_id uuid not null references grupos_clifor(id) on delete restrict,
  filial_id     uuid references enderecos_clifor(id),
  pedido_id     uuid references pedidos(id),
  responsavel_id uuid references usuarios(id),
  tipo_ocorrencia_id smallint not null references sac_tipos_ocorrencia(id),
  prioridade_id smallint not null references sac_prioridades(id),
  status_id     smallint not null references sac_status(id),
  descricao     text not null,
  aberto_em     timestamptz not null default now(),
  fechado_em    timestamptz,
  ativo         boolean not null default true,
  tempo_resolucao interval generated always as (fechado_em - aberto_em) stored
);
create table sac_protocolo_entregas (
  protocolo_id uuid not null references sac_protocolos(id) on delete cascade,
  entrega_id   uuid not null references entregas(id) on delete restrict,
  primary key (protocolo_id, entrega_id)
);
create table sac_interacoes (                      -- Bubble: Tbl.SacHistorico
  protocolo_id uuid not null references sac_protocolos(id) on delete cascade,
  descricao    text not null,
  visivel_cliente boolean not null default false,
  autor_id     uuid not null references usuarios(id)
);
-- tempo_resolucao vira coluna gerada. Hoje é gravado à mão e nada o desfaz quando o status volta de
-- "Resolvido" (specs/paginas/sac.md [DÚVIDA 14]).
-- Tbl.Chamado (7 campos) é a versão anterior de Tbl.SacProtocolo e NÃO migra (§9).

create table pesquisas (
  nome       text not null,
  tipo_id    smallint not null references tipos_pesquisa(id),  -- SAC | NPS | Pós-Venda
  ativa      boolean not null default true,
  criada_em  timestamptz not null default now()
);
create table pesquisa_convites (
  pesquisa_id uuid not null references pesquisas(id) on delete cascade,
  cliente_id  uuid not null references grupos_clifor(id) on delete restrict,
  contato_id  uuid references contatos_clifor(id),
  pedido_id   uuid references pedidos(id),
  vendedor_id uuid references usuarios(id),
  token_hash  text not null unique,                -- hash do token, nunca o token
  expira_em   timestamptz not null,
  usado_em    timestamptz,
  enviado_em  timestamptz,
  tentativas  smallint not null default 0
);
create table pesquisa_respostas (
  convite_id  uuid not null references pesquisa_convites(id) on delete restrict,
  nota_nps         smallint check (nota_nps between 0 and 10),
  nota_atendimento smallint check (nota_atendimento between 0 and 10),
  nota_produto     smallint check (nota_produto between 0 and 10),
  nota_entrega     smallint check (nota_entrega between 0 and 10),
  criticas_sugestoes text,
  respondida_em timestamptz not null default now(),
  unique (convite_id)
);
-- O CONVITE COM TOKEN É A CORREÇÃO CENTRAL. Hoje o link é ?id=<_id do Bubble>, sem token, sem prazo
-- e sem uso único: com a Data API aberta dá para listar os ids e responder em nome de qualquer
-- cliente, em massa (specs/00-achados-de-seguranca.md §2.5).
-- unique (convite_id) resolve o "uma resposta por cliente para sempre", em que a segunda venda
-- sobrescrevia a avaliação da primeira.
-- vendedor_id vem do CONVITE, não da URL. Hoje o link sai como &pdd<id> sem o '=', então o
-- parâmetro volta vazio e o vendedor é gravado em branco
-- (specs/paginas/formularios-publicos.md, veredito da [DÚVIDA 1]).
-- O índice NPS vira função (§5), não coluna: hoje a tela mostra média, não NPS
-- (specs/paginas/sac.md [DÚVIDA 7]).
```

### 3.7 Histórico

Origem: `specs/paginas/historico.md` §9.5. **Append-only** (decisão §2.1.4).

```sql
create table historicos (
  grupo_clifor_id uuid not null references grupos_clifor(id) on delete restrict,
  unidade_id   uuid references enderecos_clifor(id),
  contato_id   uuid references contatos_clifor(id),
  autor_id     uuid not null references usuarios(id),
  vendedor_id  uuid references usuarios(id),
  departamento_id smallint references departamentos(id),
  tipo_evento  text not null,      -- conversa | email | proposta | pedido | cobranca | sistema
  origem       text not null,      -- manual | gmail | workflow
  descricao    text not null,
  anexo_path   text,
  anexo_link   text,
  conta_receber_id uuid references contas_receber(id),
  corrige_id   uuid references historicos(id),     -- correção aponta para a linha corrigida
  cancelado_em timestamptz,
  cancelado_por uuid references usuarios(id)
);
-- RLS: SELECT para quem tem permissão; INSERT com autor_id = auth.uid(); SEM update e SEM delete.
-- Correção é linha nova apontando para a anterior; cancelamento é marcação, não remoção.
-- Hoje editar um histórico sobrescreve o texto E troca o autor, e excluir é físico
-- (specs/paginas/historico.md §7).
-- O espelho em grupos_clifor (ultimo_historico_em, ultimo_historico_id) é mantido por TRIGGER.
-- Hoje é mantido à mão por 12 lugares com regras divergentes, ao ponto de existirem duas rotinas
-- de reparo em massa em pagina-rotinas (specs/paginas/historico.md §8).
-- ATENÇÃO DE PRIVACIDADE: descricao guarda o corpo completo de e-mails de prospecção, e a tabela
-- não tem regra nenhuma no Bubble (specs/00-achados-de-seguranca.md §2.2). É a tabela que mais
-- cresce: índice por (grupo_clifor_id, criado_em desc) e paginação no servidor, sempre.
```

### 3.8 Infraestrutura do app

```sql
create table empresas_emissoras (                  -- era o option set Opt.EmpresaMegabox
  id       smallint primary key,
  chave_bubble text not null unique,               -- megabox | paletes_brasil
  nome     text not null, razao text not null, cnpj text not null,
  email text, telefone text, endereco text,
  logo_path text, logo_horizontal_path text
);
-- Vira tabela porque carrega 7 atributos e porque logo e textos mudam sem migration.

create table icms_aliquotas (
  uf_origem  char(2) not null references ufs(sigla),
  uf_destino char(2) not null references ufs(sigla),
  aliquota   numeric(7,4) not null check (aliquota >= 0 and aliquota < 1),
  primary key (uf_origem, uf_destino)
);
-- Hoje é Tbl.IcmsEstados com auto-binding liberado: qualquer logado altera a alíquota de qualquer
-- par origem×destino direto no banco (specs/00-achados-de-seguranca.md §2.3). Aqui a escrita é
-- restrita por RLS a perfil 1, com trigger de auditoria.

create table prazos_recebimento (                  -- era Opt.ParcelasReceber
  id         smallint primary key,
  chave_bubble text not null unique,
  rotulo     text not null,                        -- "30dd"
  dias_prazo smallint not null,
  ativo      boolean not null default true
);
-- O option set do Bubble está inconsistente: '49dd' não tem diasprazonumero (o vencimento vira
-- HOJE), '12dd' aparece duplicada e uma está marcada deleted, e os atributos qtdparcelasnumero
-- não batem com o rótulo (28dd→4, 30dd→5)
-- (specs/paginas/financeiro-reusables.md [DÚVIDA 13]). A carga precisa normalizar e relatar.

create table modelos_email (
  chave    text primary key,                       -- proposta | pedido_cliente | cobranca | ...
  assunto  text not null,
  corpo    text not null,                          -- template
  ativo    boolean not null default true
);
create table email_outbox (
  para text not null, cc text, bcc text,
  assunto text not null, corpo text not null,
  responder_para text, remetente_nome text,
  modelo_chave text references modelos_email(chave),
  agendado_para timestamptz not null default now(),
  enviado_em timestamptz, erro text, tentativas smallint not null default 0,
  -- rastreabilidade: de onde saiu
  pedido_id uuid references pedidos(id),
  proposta_id uuid references propostas(id),
  cobranca_id uuid references cobrancas(id),
  entrega_id uuid references entregas(id)
);
create table email_anexos (
  email_id uuid not null references email_outbox(id) on delete cascade,
  nome_arquivo text not null,
  path text not null
);
-- Fila com worker, em vez de SendEmail no meio do workflow. Substitui também o contador diário de
-- e-mails que hoje é uma linha de ConfigSistema (CodigoConfig 19) incrementada à mão e zerada por
-- um backend workflow que se reagenda sozinho (ResetContagemEmails bUBmh).
-- Os 7 modelos hoje estão fixos no código dos workflows
-- (specs/paginas/historico.md [DÚVIDA 12]).

create table rotinas (
  slug        text primary key,
  nome        text not null,
  descricao   text not null,
  risco       text not null,                       -- baixo | medio | alto
  idempotente boolean not null,
  reversivel  boolean not null,
  filtro_obrigatorio boolean not null default true,
  perfil_minimo smallint not null default 1 references perfis(id),
  ativa       boolean not null default true
);
create table rotina_execucoes (
  rotina_slug text not null references rotinas(slug),
  usuario_id  uuid not null references usuarios(id),
  parametros  jsonb not null default '{}',
  modo        text not null,                       -- simulacao | aplicacao
  linhas_afetadas integer,
  inicio timestamptz not null default now(), fim timestamptz,
  status text not null,                            -- rodando | ok | erro
  erro text
);
-- Não existe no Bubble: hoje /rotinas não tem guarda alguma, nenhum botão pede confirmação, e não
-- há registro de quem rodou o quê (specs/paginas/rotinas.md §7). O modo 'simulacao' é o dry-run
-- que a spec exige antes de aplicar.
```

---

## 4. Listas fixas (os 36 option sets)

Todas as tabelas desta seção seguem o mesmo molde e **não** têm as colunas de auditoria de §1.2 —
são listas de domínio, não dado de negócio:

```sql
id smallint primary key, chave_bubble text not null unique, nome text not null [, atributos]
```

`chave_bubble` é o que a carga usa para resolver os ponteiros do Bubble. Não é o identificador do
app novo.

| Option set do Bubble | Vira | Atributos que vêm junto |
|---|---|---|
| `Opt.PerfilUsuario` | `perfis` | hierarquia **é** o id (§3.1) |
| `Opt.DeptoUsuario` | `departamentos` | `descricao` |
| `Opt.MenuPaginas` | `paginas` | `ordem`; `hierarquia` e `DepartamentosAcessiveis` **não** migram (ninguém os lê — ver §9) |
| `Opt.MenuConfig` | `paginas` (linhas de configuração) | `ordem` |
| `Opt.Etapas` | `etapas` | `concluida boolean` (o atributo `EntregaConcluida`) |
| `Opt.CotacaoStatus` | `cotacao_status` | — |
| `Opt.StatusFinanceiro` | `status_financeiro` | — |
| `Opt.ParcelasReceber` | `prazos_recebimento` | `dias_prazo` (normalizar: §3.8) |
| `Opt.FormaPgto` | `formas_pagamento` | — |
| `Opt.TipoFrete` | `tipos_frete` | — |
| `Opt.MotivoArquivamento` | `motivos_arquivamento` | — |
| `Opt.EmpresaMegabox` | `empresas_emissoras` | 7 atributos (§3.8) |
| `Opt.UFs` | `ufs` (pk `sigla char(2)`) | — |
| `opt.RegimeTributario` | `regimes_tributarios` | — |
| `Opt.TipoPessoa` | **enum** `tipo_pessoa` | dois valores, sem atributo |
| `opt.TipoCliFor` | **enum** `tipo_clifor` | idem |
| `Opt.ProdutosLinhas` | `linhas_produto` | — |
| `Opt.ProdutosCondicao` | `condicoes_produto` | — |
| `Opt.TipoAnexo` | `tipos_anexo` + `tipo_anexo_departamentos` | `qual_cadastro`; `DeptosVisualizam` vira ligação |
| `Opt.CaptacaoCliente` | `captacoes` | — |
| `Opt.TipoTelefone` | `tipos_telefone` | — |
| `Opt.TipoMeta` | `tipos_meta` | — |
| `Opt.TipoPesquisa` | `tipos_pesquisa` | — |
| `Opt.TipoOcorrencia` | `sac_tipos_ocorrencia` | — |
| `opt.prioridade` | `sac_prioridades` | — |
| `opt.StatusChamado` | `sac_status` | — |
| `Opt.StatusBug` | `status_bug` | `ordem` — só se bug report for internalizado (§9) |
| `Opt.PartesDoSistema` | `partes_sistema` | idem |
| `Opt.TiposData` | **não vira tabela** | é filtro de tela; vira união discriminada no código |
| `Opt.SimNão` | **não migra** | é widget de filtro com ícone, não domínio |
| `Opt.OrdenarCampos` | **não migra** | preferência de tela → `usuario_preferencias.ordenacao` |
| `Opt.AçãoCliFor`, `Opt.Ações` | **não migram** | são o "modo" do popup do Bubble; no app novo é a rota |
| `Opt.GrupoDeConfigsSistema` | **não migra** | agrupamento de tela da config antiga |
| `Opt.FiltrosGmail` | **não migra** | rótulos do leitor de Gmail (§9) |
| `Opt.Smtp` | **NUNCA migra** | guarda senha em texto puro; credencial vai para variável de ambiente (`specs/00-achados-de-seguranca.md` §1.1) |

**Atenção na carga de `Opt.Etapas`:** as chaves `pedido` e `pedido0` são opções **diferentes**
("Pedir" e "Pedido"). Resolver pela chave, nunca pelo rótulo.

---

## 5. Views e funções

O que hoje é cálculo no navegador ou coluna gravada à mão. Cada função de dinheiro leva teste
(`CLAUDE.md` regra 10).

| Objeto | O que entrega | Substitui |
|---|---|---|
| `v_orcamento_valores` | líquido e unitário líquido do orçamento | `CalculaFornecedoresLista` (bTPFh) |
| `fn_aliquota_icms(uf_o, uf_d)` | alíquota vigente | busca repetida em `IcmsEstados` |
| `v_kanban_cotacoes` | cotação + contadores de item, vencedor e proposta | 4 inputs ocultos contando na tela |
| `v_kanban_pedidos` | pedido + `todas_concluidas` | condicional de cartão |
| `v_kanban_entregas` | entrega + `vendedor_efetivo` (próprio ou substituto) | duas buscas separadas |
| `v_pedido_item_saldo` | saldo a entregar por item | cálculo no cartão |
| `v_conta_receber_status` | status derivado das baixas e estornos | coluna `StatusFinanceiro` gravada à mão |
| `v_lancamentos` | união de CR e CP para telas que mostram as duas | — |
| `fn_gerar_contas_receber(entrega, prazos[])` | parcelas **rateadas**, em transação | `CriarContasReceber` (bTfDZ) |
| `fn_gerar_conta_pagar(entrega)` | comissão do vendedor, com percentual da tabela | `CriarContasPagar` (bToYh) |
| `v_realizado_vendedor(periodo)` | comissão realizada por vendedor e tipo de meta | soma no navegador |
| `v_ranking_metas(periodo)` | ranking calculado, **sem gravar** | `RankingVendas` escrito por 2 páginas |
| `fn_fechar_meta(vendedor, competencia)` | fecha a meta e gera a CP, em transação | `bTwAj` + `bTzXn`, que hoje rodam na tela |
| `fn_nps(pesquisa, periodo)` | índice NPS de verdade (promotores − detratores) | média exibida como se fosse NPS |
| `fn_rel_entregas_produto / _cliente_mes / _fornecedor_mes` | matrizes agregadas, por RPC | ~90 KB de JS somando no cliente |
| `fn_tem_hierarquia(n)` · `fn_usuario_ativo()` · `fn_pode_acessar_pagina(slug)` | autorização | condicional de menu |
| `fn_distancia_km(endereco_o, endereco_d)` | distância entre filiais (PostGIS) | `distance_from` do plugin |

Todas as funções de autorização são `security definer` com `search_path = ''`.

---

## 6. Índices e constraints

Com ~200 mil linhas e Supabase Micro (1 GB de RAM), índice não é otimização, é requisito
(`docs/plano-de-migracao.md` §3).

**Regra geral:** índice em **toda** FK e em **toda** coluna usada em filtro ou ordenação.

Os que não são óbvios:

```sql
-- Kanban de vendas: filtra por período + vendedor + etapa, ordena por criação desc
create index on cotacoes (vendedor_id, criado_em desc) where not arquivado;
create index on entregas (status_id, dt_prev_entrega);
create index on entregas (vendedor_substituto_id) where vendedor_substituto_id is not null;

-- Financeiro: a tela filtra por 6 tipos de data diferentes (Opt.TiposData)
create index on contas_receber (dt_vencimento) where not arquivado;
create index on contas_receber (fornecedor_id, status_id, dt_vencimento);
create index on contas_pagar (vendedor_id, dt_vencimento);

-- Histórico: a tabela que mais cresce
create index on historicos (grupo_clifor_id, criado_em desc);
create index on historicos (autor_id, criado_em desc);

-- Busca de cliente por nome, ignorando acento (a tela tem busca "exata" e "próxima").
-- NÃO dá para indexar unaccent() direto: ela é STABLE, e índice exige IMMUTABLE.
-- Precisa do invólucro abaixo — ver §6.1.
create index on grupos_clifor using gin (fn_unaccent(nome) gin_trgm_ops);
create index on enderecos_clifor (documento);

-- Fornecedores que atendem um produto, para o seletor de orçamento
create index on fornecedor_produtos (produto_id, endereco_fornecedor_id);

-- Fila de e-mail
create index on email_outbox (agendado_para) where enviado_em is null;
```

**Constraint que vale por uma regra de negócio** — as quatro que corrigem defeito real:

```sql
-- 1. As parcelas de uma entrega fecham com a venda (§2.1.2)
create or replace function fn_valida_rateio_cr() returns trigger ...
  -- soma(valor_total) das parcelas da entrega = entregas.valor_venda_bruto, tolerância de centavos

-- 2. Um vencedor por item da cotação
create unique index um_vencedor_por_item on orcamentos_fornecedor (cotacao_item_id) where vencedor;

-- 3. Uma entrega em uma meta fechada só
create unique index entrega_em_uma_meta_so on meta_fechada_entregas (entrega_id);

-- 4. Uma conta a pagar por entrega e vendedor
alter table contas_pagar add constraint cp_unica unique (entrega_id, vendedor_id);
```

---

### 6.1 Extensões — conferidas no projeto

Conferido em 25/09/2026 por `list_extensions` no projeto `bdntlmsuxpicpmpzosbt`. Todas as que este
documento usa **estão disponíveis**; nenhuma precisa de plano acima do Micro.

| Extensão | Versão | Para quê | Estado |
|---|---|---|---|
| `postgis` | 3.3.7 | `geography(point, 4326)` e distância entre filiais | disponível |
| `pg_trgm` | 1.6 | busca de cliente por nome parcial | disponível |
| `unaccent` | 1.1 | busca ignorando acento | disponível |
| `btree_gist` | 1.7 | o `exclude` de `vendedor_nivel_historico` | disponível |
| `pg_cron` | 1.6.4 | jobs que substituem rotinas e workflows auto-agendados | disponível |
| `pgtap` | 1.3.3 | teste de função SQL — útil para os cálculos de dinheiro | disponível |
| `pgcrypto` | 1.3 | — | **já instalada** |

`gen_random_uuid()` é nativa do Postgres 13+; não depende de extensão.

**Duas armadilhas que valem a migration inteira:**

1. **No Supabase, extensão instala no schema `extensions`, não no `public`.** Como as funções de
   RLS em §7.1 são `security definer set search_path = ''`, qualquer chamada a `unaccent()`,
   `similarity()` ou função PostGIS **dentro delas** precisa ser qualificada
   (`extensions.unaccent(...)`). Sem isso a função falha em tempo de execução, não de criação — ou
   seja, quebra em produção, não na migration.

2. **`unaccent()` é `STABLE`, e índice exige `IMMUTABLE`.** O índice de busca por nome de §6 **não
   compila** se chamar `unaccent` direto: o Postgres responde *"functions in index expression must
   be marked IMMUTABLE"*. Precisa do invólucro:

```sql
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm  with schema extensions;

-- Invólucro IMMUTABLE. O primeiro argumento fixa o dicionário, que é o que torna
-- o resultado determinístico e permite indexar.
create or replace function fn_unaccent(text)
  returns text
  language sql
  immutable parallel safe strict
  set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent', $1) $$;

create index on grupos_clifor using gin (fn_unaccent(nome) extensions.gin_trgm_ops);
```

A consulta da tela tem de usar **a mesma** expressão do índice (`fn_unaccent(nome) ilike ...`),
senão o planejador ignora o índice e volta a varrer a tabela.

---

## 7. RLS — o padrão

RLS ligada em toda tabela na primeira migration (`CLAUDE.md` regra 3). O padrão é este, e cada
tabela declara sua variação:

### 7.1 Funções de apoio

```sql
create function fn_usuario_ativo() returns boolean
  language sql stable security definer set search_path = '' as $$
    select exists (select 1 from public.usuarios u
                   where u.id = auth.uid() and u.ativo) $$;

create function fn_hierarquia() returns smallint
  language sql stable security definer set search_path = '' as $$
    select u.perfil_id from public.usuarios u where u.id = auth.uid() $$;

create function fn_pode_acessar_pagina(p_slug text) returns boolean ...
  -- verdadeiro se houver linha em permissoes_pagina casando por perfil, departamento ou usuário
```

### 7.2 Os quatro níveis

| Nível | Quem lê | Quem escreve | Tabelas |
|---|---|---|---|
| **Domínio** | qualquer usuário ativo | perfil 1, por server action | listas fixas de §4, `icms_aliquotas`, `empresas_emissoras` |
| **Operacional** | quem tem a página | quem tem a página, com regra por etapa | ciclo comercial, financeiro, cadastro |
| **Restrito** | perfil ≤ 2, ou o próprio | server action com trava | `metas_*`, `niveis_vendedor`, `permissoes_pagina`, `usuarios` |
| **Fechado** | ninguém pelo cliente | só `service_role` | `integracao_tokens`, `auditoria` (escrita por trigger) |

### 7.3 Variações que importam

- **`usuarios`:** todo usuário ativo lê `id`, `nome`, `perfil_id`, `departamento_id` (a tela precisa
  do nome do vendedor); `cpf`, `rg`, `telefone` e `endereco` não. **RLS é por linha e este sigilo é
  por coluna**, então a solução não é RLS: é `grant select (colunas públicas) on usuarios to
  authenticated`, com a policy liberando a linha de qualquer colega ativo. A linha completa do
  próprio dono sai por `fn_meu_cadastro()`, função `security definer` sem parâmetro — o `where` é
  `auth.uid()`, então não há como pedir a linha de outro. Implementado em `db/004_usuarios_leitura.sql`.
  Uma view `security definer` foi tentada antes e descartada: o `get_advisors` a marca como ERROR,
  porque ignora a RLS e passa a depender de ninguém acrescentar coluna sensível a ela depois.
- **`historicos`:** `select` para quem tem a página, `insert` com `autor_id = auth.uid()`,
  **nenhuma** policy de `update` ou `delete`.
- **`auditoria`:** `select` só perfil 1; `update`/`delete` revogados até para o dono.
- **Entregas e contas, para Analista/Operador:** restringir às próprias
  (`vendedor_id = auth.uid() or vendedor_substituto_id = auth.uid()`) é a **recomendação padrão**
  até decisão registrada — `specs/paginas/relatorios.md` [DÚVIDA 8].
- **`anon` não tem policy em nenhuma tabela.** Os formulários públicos gravam por server action com
  `service_role`, validando o token do convite (`specs/paginas/formularios-publicos.md` §9.3).

Depois de **cada** migration, rodar `get_advisors` (segurança e desempenho) — é o hábito que faltou
no app_capital (`docs/plano-de-migracao.md` §2).

---

## 8. Pendências

### 8.1 As cinco que bloqueiam a carga

Nenhuma migration de dado roda antes destas. Cada uma tem recomendação padrão na spec de origem, e
a resposta definitiva deve vir do `specs/bubble/` e do editor do Bubble.

1. **Unicidade de `enderecos_clifor.documento` e de `produtos (nome, grupo_id)`.** O Bubble não tem
   unicidade em lugar nenhum, então é provável que haja duplicata. A carga precisa rodar em modo
   relatório **antes** e listar os conflitos. Sem isso, o `create unique index` falha no meio da
   carga. — `specs/paginas/cadastros.md` [DÚVIDA 9] e [DÚVIDA 10].
2. **Regra oficial de `RankingVendas`.** `relatorios` e `metas` calculam diferente, e a de
   `relatorios` conta a comissão duas vezes quando há vendedor substituto. Define
   `v_ranking_metas`. — `specs/paginas/relatorios.md` [DÚVIDA 7].
3. **Escala de `ComissaoPadrao` e `ComissaoMetaBatida`:** 0,10 é 10% ou 0,10%? Define o tipo e a
   conversão de `niveis_vendedor`. — `specs/paginas/metas.md` [DÚVIDA 7].
4. **Os 3% da comissão do vendedor são fixos para todos?** Hoje é literal em três workflows. Se
   vierem de `niveis_vendedor`, `contas_pagar.percentual` muda de default para lookup. —
   `specs/paginas/financeiro-reusables.md` [DÚVIDA 23].
5. **~~Fórmulas reais de ICMS e PIS/COFINS.~~ RESOLVIDA em 25/09/2026 — deixou de bloquear.**
   A leitura anterior (campos excluídos, tributos sempre zero) estava errada: vinha de colisão de
   id entre `Tbl.OrcFornecedoresCotacao` e `Tbl.MetasFechadas`, que o decompilador resolveu pelo
   nome do data type errado. As fórmulas são as de §3.3:
   `ICMS = qtd × valor_unit × aliquota_icms` e `PIS/COFINS = qtd × valor_unit × aliquota_pis_cofins`,
   com a alíquota de ICMS vinda de `Tbl.IcmsEstados` por UF de origem × destino e PIS/COFINS em
   0,0925. Detalhe e prova no comentário de `orcamentos_fornecedor` em §3.3.
   **O que continua aberto, e é menor:** os 9,25% estão chumbados em dois lugares e precisam de
   parâmetro com vigência, e falta confirmar a regra quando origem e destino não são ambos Lucro
   Real/Presumido — hoje as alíquotas ficam vazias (`specs/paginas/vendas.md` [DÚVIDA 3]).

### 8.2 Decisões deste documento que podem ser revertidas

Tomadas com a recomendação padrão, sem resposta do negócio. Estão aqui para não passarem
despercebidas:

- Ratear `contas_receber.valor_total` por parcela (§2.1.2) muda o número impresso no recibo do
  fornecedor. Se o valor cheio for proposital, a constraint de fechamento cai.
- `pedidos.numero` ainda **não** é único, porque não se sabe se uma cotação pode gerar mais de um
  pedido.
- `enderecos_clifor.principal` passa a ser lido de verdade (§2.1.8) — hoje é sempre `true`, então a
  carga precisa escolher **um** por grupo. Recomendação: o mais antigo.

---

## 9. O que não migra

| O quê | Por quê |
|---|---|
| `User.PassTexto` e os campos SMTP do usuário | senha em texto puro; autenticação vira Supabase Auth |
| `Opt.Smtp` | guarda credencial; vai para variável de ambiente |
| `Tbl.ContasReceberImportado` e todas as flags `Importado` | rotina de migração antiga, já cumprida |
| `Tbl.MetaAdicional`, `User.RankingVenda*`, `NiveisVendedores.old_ValorBonus` | órfãos da versão anterior de metas |
| `Tbl.Chamado` | versão anterior de `SacProtocolo` |
| `Tbl.cnpjformatado` | tabela de apoio para formatar CNPJ em busca; resolve-se com índice |
| `Tbl.PerfilUsuario` (1 campo) | duplica `User.QualPerfil` |
| `User.SelecionadosPagar/SelecionadosReceber`, `TempOrcamentoProdutos` | estado de tela no banco |
| `Tbl.BugReport` + `Opt.StatusBug` + `Opt.PartesDoSistema` | só se a integração com o app parceiro for internalizada — hoje é `apiconnector` para `gestaolure` |
| Listas que espelham FK (`QuaisEnderecos`, `QuaisContatos`, `QuaisEntregas`, `QuaisProdutos`…) | a FK do lado N já diz tudo (§1.5) |
| Campos marcados `- deleted` no mapa | já mortos no Bubble |
| `Opt.MenuPaginas.hierarquia` e `DepartamentosAcessiveis` | existem e **ninguém os lê**; quem manda é `ConfigSistema` → `permissoes_pagina` |

---

## 10. De-para Bubble → novo, por data type

Os 34 data types. Coluna "atenção" traz o que quebra a carga se for feito no automático.

| Data type (tabela física) | Vira | Atenção |
|---|---|---|
| `User` (`user`) | `usuarios` + `auth.users` + `usuario_preferencias` | senha não migra; `date_range` → 2 colunas |
| `Tbl.GrupoCliFor` (`tbl_clientes`) | `grupos_clifor` | `Liberado`←`cpo_bloqueado`; `Observacoes`←`cpo_codcliente` |
| `Tbl.EnderecosCliFor` (`tbl_enderecosclifor`) | `enderecos_clifor` | duas fontes de UF; escolher um `principal` |
| `Tbl.ContatoCliFor` (`tbl_contatoclifor`) | `contatos_clifor` | `ativo` vazio → `true` |
| `Tbl.Anexos` (`tbl_anexos`) | `anexos` + Storage | baixar do CDN e regravar em bucket privado |
| `Tbl.ProdutosModelo` (`tbl_produtos`) | `produtos` | duas listas de fornecedor; vale a da filial |
| `Tbl.ProdutosTipo` (`tbl_produtosgrupo`) | `produto_tipos` | **nome × tabela trocados** |
| `Tbl.ProdutosGrupo` (`tbl_produtossubgrupo`) | `produto_grupos` | idem |
| `Tbl.ProdutoVersao` | `produto_versoes` | — |
| `Tbl.Cotacao` (`tbl_orcamento`) | `cotacoes` | etapa e status nascem vazios → default |
| `Tbl.CotacaoProdutos` (`tbl_orcamentoprodutos`) | `cotacao_itens` | `cliente_id` sai (vem por join) |
| `Tbl.OrcFornecedoresCotacao` (`tbl_orcamentfornecedores`) | `orcamentos_fornecedor` | nomes de alíquota resolvidos com id de outro tipo (§3.3) |
| `Tbl.Propostas` | `propostas` + `proposta_itens` | itens viram snapshot |
| `Tbl.Pedido` (`tbl_pedidos`) | `pedidos` + `pedido_prazos` | `Importado`←`cpo_pedidoenviado` |
| `Tbl.Entregas` (`tbl_entregas`) | `entregas` + `entrega_arquivos` | `DtPrevEntrega`←`cpo_dataentrega`, `DtEntrega`←`cpo_dtentrega` |
| `Tbl.ContasReceber` (`tbl_contasreceber`) | `contas_receber` + `baixas` | ratear `valor_total`; status vazio |
| `Tbl.ContasPagar` (**`tbl_contasreceber1`**) | `contas_pagar` + `baixas` | nome da tabela física engana |
| `Tbl.Cobrancas` | `cobrancas` + `cobranca_contas` | `QuaisEntregas` está `deleted` |
| `Tbl.Historico` (`tbl_historico`) | `historicos` | append-only a partir da carga |
| `Tbl.IcmsEstados` | `icms_aliquotas` | converter para fração |
| `Tbl.MetasMensais` | `metas_mensais` | `RankingVendas` não migra (vira view) |
| `Tbl.MetasFechadas` (`tbl_orcfornecedorescotacao`) | `metas_fechadas` + `meta_fechada_entregas` | nome da tabela física engana; checar entrega em duas metas |
| `Tbl.NiveisVendedores` | `niveis_vendedor` | escala das comissões (§8.1) |
| `Tbl.SacProtocolo` (`tbl_sac`) | `sac_protocolos` + `sac_protocolo_entregas` | — |
| `Tbl.SacHistorico` | `sac_interacoes` | — |
| `Tbl.PesquisaNps` | `pesquisas` | — |
| `Tbl.PesquisaRespostas` (`tbl_pesquisaposvenda`) | `pesquisa_convites` + `pesquisa_respostas` | vendedor é **texto** e costuma estar vazio |
| `Tbl.ConfigSistema` | `config_sistema` + `permissoes_pagina` + `config_copia_email` | **não** carregar segredo |
| `Tbl.Chamado`, `Tbl.cnpjformatado`, `Tbl.PerfilUsuario`, `Tbl.MetaAdicional`, `Tbl.ContasReceberImportado`, `Tbl.BugReport` | — | §9 |

**Carga em duas passadas** (`docs/plano-de-migracao.md` §4): primeiro os registros com os campos
escalares, depois as referências resolvidas por `bubble_id`. Lotes de 500 a 1.000 linhas, nunca
`INSERT` linha a linha — são ~200 mil registros.

---

## 11. Ordem das migrations

Vertical slice (`CLAUDE.md` regra 5): cada fatia é migration → RLS → server action → tela → teste.
**Nunca** todas as migrations primeiro.

| # | Fatia | Tabelas | Entrega |
|---|---|---|---|
| 0 | Fundação | `perfis`, `departamentos`, `paginas`, `permissoes_pagina`, `usuarios`, `usuario_preferencias`, `auditoria`, `log_acesso`, funções de RLS | login, menu e sessão de verdade |
| 1 | Listas fixas | as tabelas de §4 | seed; sem tela |
| 2 | Cadastro | `grupos_clifor`, `enderecos_clifor`, `contatos_clifor`, `anexos` | tela de cadastros — **é a tela-modelo** |
| 3 | Produtos | `produto_tipos`, `produto_grupos`, `produtos`, `produto_versoes`, ligações | cadastro de produtos |
| 4 | Cotação | `cotacoes`, `cotacao_itens`, `orcamentos_fornecedor`, `icms_aliquotas` | coluna Cotação do kanban |
| 5 | Proposta e pedido | `propostas`, `proposta_itens`, `pedidos`, `pedido_prazos` | colunas Proposta e Pedido |
| 6 | Entrega | `entregas`, `entrega_arquivos` | colunas de entrega + confirmação |
| 7 | Financeiro | `contas_receber`, `contas_pagar`, `baixas`, `estornos`, `cobrancas`, `recibos` | página financeiro |
| 8 | Metas | `niveis_vendedor`, `vendedor_nivel_historico`, `metas_*` | página metas |
| 9 | Histórico | `historicos`, `modelos_email` | FollowUp + painel |
| 10 | SAC e pesquisas | `sac_*`, `pesquisas`, `pesquisa_convites`, `pesquisa_respostas` | SAC + formulários públicos |
| 11 | Relatórios | só views e funções | página relatórios |
| 12 | Rotinas | `rotinas`, `rotina_execucoes` | painel de manutenção com dry-run |

A fatia 2 é a **tela-modelo**: fixa o padrão de 5 arquivos por tela
(`page.tsx` · `loading.tsx` · `tela.tsx` · `dialogo.tsx` · `acoes.ts`) que o app_capital validou
(`docs/plano-de-migracao.md` §1). As demais copiam o padrão.

`email_outbox` e `integracao_tokens` entram junto da primeira fatia que precisar enviar e-mail
(a 5).
