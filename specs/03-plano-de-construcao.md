# Plano de construção — ordem das frentes, extração, carga e corte

Escrito em 25/09/2026. Sucessor operacional de `docs/plano-de-migracao.md`: aquele arquivo analisa o
app_capital e define as fases; este diz **como e em que ordem** executar, com comando e nome de
arquivo.

O que construir está em `specs/02-modelo-de-dados-proposto.md` (58 tabelas, 12 fatias). Aqui não se
repete esquema: cita-se a seção.

Governam este plano as regras 5 (vertical slice) e 6 (`npm run verify` antes de todo commit) do
`CLAUDE.md`.

---

## 1. Onde estamos e o que falta

`docs/estado-do-projeto.md` tem o retrato completo. Em uma linha: **mapeamento fechado, specs
escritas, banco vazio, app não iniciado.**

| Frente | Situação |
|---|---|
| `mapa/` (app decompilado) + `mapa/00-inventario.md` | pronto |
| `specs/paginas/*.md` (14 specs, 747 de 771 workflows) | 13 prontas, `vendas-reusables` a conferir |
| `specs/00-achados-de-seguranca.md`, `02-modelo-de-dados-proposto.md`, `04-duvidas.md` | prontos |
| `specs/01-visao-geral.md` | pendente (não bloqueia a Fase A) |
| Supabase `megabox` (`bdntlmsuxpicpmpzosbt`, sa-east-1, Micro) | criado, **zero tabelas** |
| App Next.js, projeto Vercel, `vercel.json` | **não existem** |
| Extração do Bubble | nunca rodou; sem caminho de rede neste ambiente (§4.1) |

Duas correções ao `docs/estado-do-projeto.md`, que foi fechado antes de `02` e `04` existirem: os
dois arquivos existem, e `tools/conferir-cobertura.py` já foi versionado.

---

## 2. Pré-requisitos que travam o início

São as cinco de `02` §8.1 (repetidas em `04` §1) mais uma sexta, de `04` §4.2, sem a qual a fatia 0
não carrega. **Nada fica parado esperando** (`CLAUDE.md` regra 1 e `04` §5.4): cada item tem
recomendação padrão já registrada, e o plano segue com ela.

| # | Pergunta | Quem responde | Se não vier resposta a tempo |
|---|---|---|---|
| B1 | CNPJ/CPF é único? Nome de produto é único dentro do grupo? | dono do projeto + Financeiro | carga em **modo relatório** (§5.4) lista os duplicados; o `create unique index` só entra depois de zero conflito. Sem resposta: criar o índice como **não** único e abrir `[PENDENTE-B1]` na migration da fatia 2 |
| B2 | Regra oficial de `RankingVendas` | Diretoria (é o número que paga comissão) | `v_ranking_metas` segue a regra de `specs/paginas/metas.md`, **não** a de `relatorios`, que conta a comissão duas vezes quando há vendedor substituto |
| B3 | Escala de `ComissaoPadrao`/`ComissaoMetaBatida` — 0,10 é 10% ou 0,10%? | Diretoria | `niveis_vendedor` carrega como **fração** (`02` §1.3) e a carga emite relatório de valores fora de `[0,01 .. 0,30]` para conferência humana. A fatia 8 não vai a produção sem a resposta |
| B4 | Os 3% da comissão são fixos para todos? | Diretoria | `contas_pagar.percentual` fica como **default 0,03**, gravado por linha (snapshot). Se depois vier do nível, muda a origem do default, não o esquema |
| B5 | Fórmulas reais de ICMS e PIS/COFINS | Contabilidade | **não recalcular histórico.** Hoje o cálculo do Bubble sempre dá zero, logo `valor_venda_liquido = valor_venda_bruto` em toda a base (`04` §1). A carga copia o valor como está; fórmula nova só vale para linha nascida no app novo, com data de vigência |
| B6 | Conteúdo real das linhas de permissão do `ConfigSistema` (uma por página e uma por item de configuração, com `QuaisDeptos`/`QuaisPerfis`/`QuaisUsuarios`) | dono do projeto, pelo editor ou pela Data API | **é dado, não decisão**: vem na extração de `Tbl.ConfigSistema` (§4). Até chegar, `permissoes_pagina` é semeada com a tabela de `specs/paginas/casca-e-configuracao.md` §3.2 (Inicio 4; Vendas 4; Financeiro 2; Metas 2; Rotinas 1; Relatórios e SAC **sem regra hoje** → entram como perfil ≤ 2) |

B6 é o único que a extração responde sozinha, e por isso a fatia 0 e a Fase B se cruzam: ver §6.

Regra de registro: resposta que chegar vai para a spec de origem (a §10 dela) e é marcada em `04`
com a data (`04` §5.3). Este arquivo não guarda resposta.

---

## 3. Fase A — fundação do repositório e do ambiente

Sem dado, sem tabela. Só casca, e ela fecha em um dia.

### 3.1 Projeto

```
npx create-next-app@latest . --ts --app --eslint --no-tailwind --src-dir=false --import-alias "@/*"
```

CSS próprio com tokens, no padrão do app_capital (`CLAUDE.md`): `estilos/tokens.css` com as
variáveis de cor/espaço/tipografia, `estilos/base.css`, um arquivo por componente. **Nada de
Tailwind, nada de shadcn** — foi o achado nº 3 de `docs/plano-de-migracao.md` (documentação
descrevendo stack que não existe).

### 3.2 `vercel.json` no primeiro commit

```json
{ "regions": ["gru1"] }
```

Achado nº 1 de `docs/plano-de-migracao.md`: no app_capital as funções ficaram em `iad1` e cada
consulta cruzava o continente (60–100 ms por ida e volta). Conferir depois do primeiro deploy que a
função responde de `gru1` — se o projeto da Vercel já existir com outra região, a configuração do
projeto vence o arquivo até ser trocada no painel.

### 3.3 Variáveis

`.env` a partir do `.env.example` já versionado. Nomes, sem valor:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — os únicos `NEXT_PUBLIC_`.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL` — **só servidor** (regra 4).
- `BUBBLE_API_KEY`, `BUBBLE_APP_URL` — só durante a migração; rotacionar no corte (`00` §1.5).
- A acrescentar na fatia 5, quando entrar envio de e-mail: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
  (`00` §1.1 — credencial de SMTP nunca em tabela nem em option set).

`lib/supabase/navegador.ts` usa a anon key; `lib/supabase/servidor.ts` usa `@supabase/ssr` com a
sessão; `lib/supabase/admin.ts` usa `service_role` e tem, na primeira linha, `import 'server-only'`.
O lint falha se `admin.ts` for importado de componente cliente.

### 3.4 `npm run verify`

```json
"typecheck": "tsc --noEmit",
"lint": "next lint --max-warnings 0",
"test": "vitest run",
"test:sql": "node scripts/testar-sql.mjs",
"verify": "npm run typecheck && npm run lint && npm run test"
```

`test` cobre função pura (formatação, validação, de-para de option set). `test:sql` roda os pares
entrada→esperado das funções de dinheiro de `02` §5 contra uma branch do Supabase, e entra no
`verify` a partir da fatia 4, quando existir a primeira função de dinheiro. Regra 10: comissão,
metas, parcelas e ICMS **têm** teste.

### 3.5 Pastas

```
app/(app)/<pagina>/     page.tsx · loading.tsx · tela.tsx · dialogo.tsx · acoes.ts
app/(publico)/          formulários por token, sem sessão
componentes/            compartilhados
lib/                    supabase/, dinheiro.ts, datas.ts, autorizacao.ts
estilos/                tokens.css, base.css
db/                     001_fundacao.sql, 002_listas.sql, … (SQL puro, uma por fatia)
tools/                  extrair-bubble.mjs, carregar-supabase.mjs, conferir-cobertura.py
scripts/                qa.mjs, medir-navegacao.mjs, testar-sql.mjs
bruto/                  JSON do Bubble — fora do git
```

O padrão de 5 arquivos por tela é o do app_capital (`docs/plano-de-migracao.md` §1, aprendizado 3):
`page.tsx` só resolve parâmetro e monta; `loading.tsx` é o esqueleto; `tela.tsx` é cliente e não
fala com o banco; `dialogo.tsx` são os popups daquela tela; `acoes.ts` são as server actions, o
único lugar que escreve. A fatia 2 é quem fixa o padrão (§6.1).

### 3.6 `scripts/qa.mjs`

Playwright, herdado do app_capital. Para cada rota: claro, escuro e 390 px, esperando **pelo
conteúdo** (um seletor de dado real), nunca pelo esqueleto de carregamento (regra 7). Salva em `qa/`
(fora do git) e imprime os caminhos. Quem entrega a tela **abre** as capturas — no app_capital três
bugs reais só apareceram assim.

Comparação: contra `specs/bubble/02-telas-e-design.md` (que é a especificação de desenho) e contra
`design/capturas/`, descompactadas de `megabox-capturas.zip`. Atenção de `design/LEIA-ME.md`: o app
Bubble **não tem** layout móvel — as capturas de 390 px são o problema a resolver, não o alvo.

### 3.7 Fecha a fase quando

`main` com Next.js rodando, `vercel.json` em `gru1`, primeiro deploy protegido, `npm run verify`
verde e `scripts/qa.mjs` gerando as três capturas de uma página em branco.

---

## 4. Fase B — extração do Bubble

### 4.1 Onde roda

**Correção de 25/09/2026:** o bloqueio de rede registrado em `docs/plano-de-migracao.md` §7 e
achado nº 8 **não se aplica mais** — `https://grupomegabox.bubbleapps.io/api/1.1/meta` responde
HTTP 200 deste ambiente, e `tools/extrair-bubble.mjs --meta` lista os 29 tipos daqui. O bloqueio
valia para o **editor** do Bubble, que continua inacessível; a Data API, não. Logo, a extração
pode rodar aqui.

Ainda assim, as duas saídas abaixo continuam válidas e são preferíveis para a extração completa,
porque ~200 mil registros levam horas e convém rodar onde alguém acompanhe:

1. **Máquina do usuário** (Claude Code local): `node tools/extrair-bubble.mjs`, JSON em `bruto/`.
2. **Edge Function no Supabase** (`sa-east-1`), gravando direto em tabelas de estágio. Escolha
   registrada em `docs/plano-de-migracao.md` §7; vale quando ninguém puder acompanhar a máquina
   local.

Zapier não serve: a ação "Find" traz no máximo 100 registros e a ação de código troca o cabeçalho de
autenticação pelo dela, que o Bubble recusa com 401 (mesma fonte).

### 4.2 Antes de extrair: expor os data types

Data API do **live**, nunca do `version-test` — achado nº 5: no app_capital o version-test era uma
cópia velha e foi carregada por engano.

O `/api/1.1/meta` do live lista **29** data types (`specs/bubble/01-inventario-dados.md`) e o mapa
decompilado tem **34** (`mapa/data-types.md`). Os cinco que faltam são exatamente os do módulo de
SAC e pesquisas: `Tbl.SacProtocolo`, `Tbl.SacHistorico`, `Tbl.PesquisaNps`, `Tbl.PesquisaRespostas`
e `Tbl.Chamado`. **Sem expor os quatro primeiros em Settings → API → Data API, a fatia 10 não tem
dado.** `Tbl.Chamado` não migra (`02` §9).

Conferência: `/api/1.1/meta` tem de voltar com 33 tipos antes de a extração começar.

### 4.3 Como extrair

```
GET {BUBBLE_APP_URL}/api/1.1/obj/{tipo}?limit=100&cursor={n}
Authorization: Bearer {BUBBLE_API_KEY}
```

- Paginação por **cursor**, `limit=100` (teto do Bubble); avançar até `remaining = 0`.
- Fatiar por `Created Date` (`constraints=[{"key":"Created Date","constraint_type":"greater than",
  "value":"…"}]`, uma janela por mês) para que uma queda não perca o já baixado e para poder
  retomar. São ~200 mil registros no total.
- Um arquivo por tipo e por janela: `bruto/<tipo>/<aaaa-mm>.json`. **`bruto/` está no
  `.gitignore`** — contém dado pessoal de cliente e o repositório é público.
- Guardar o `_id` do Bubble como está: é o `bubble_id` de `02` §1.2, e é o que torna a carga
  idempotente e a recarga segura.
- Arquivos e imagens: baixar os binários do CDN do Bubble para `bruto/arquivos/` na mesma passada,
  com o caminho de origem anotado. A regravação em bucket privado é da Fase C (`02` §1.8).

### 4.4 Relatório de contagem — a prova de nada perdido

`node tools/extrair-bubble.mjs --relatorio` grava `bruto/00-contagem.md`: por tipo, o total que o
Bubble declara (`count` do primeiro `GET`) × o total de linhas baixadas. **Divergência interrompe a
Fase C.** É o mesmo papel que `tools/conferir-cobertura.py` cumpre no mapeamento
(`docs/plano-de-migracao.md` §4: cada fase fecha com contagem origem × destino).

---

## 5. Fase C — carga

`tools/carregar-supabase.mjs`, rodando com `service_role` **fora** do app, na mesma máquina que
extraiu. Cada fatia carrega só as suas tabelas, depois da migration e da RLS daquela fatia.

### 5.1 Duas passadas

`02` §10 e achado nº 4 de `docs/plano-de-migracao.md`:

1. **Escalares.** Insere as linhas com texto, número, data e boolean, mais o `bubble_id`. FKs ficam
   nulas.
2. **Referências.** Resolve cada ponteiro do Bubble pelo `bubble_id` do destino e faz `update`.
   Roda depois que todas as tabelas da fatia (e das anteriores) existirem.

Lotes de **500 a 1.000 linhas** por chamada, nunca `INSERT` linha a linha: com 200 mil registros o
laço de 1 em 1 do app_capital levaria horas e falharia no meio.

### 5.2 Idempotência

```sql
insert into <tabela> (...) values (...)
on conflict (bubble_id) do update set ... ;
```

Recarregar a mesma janela não duplica nada. É o que permite a re-extração do corte (§8) ser um
`re-run`, e não uma migração nova.

### 5.3 Ordem dentro da carga

Listas fixas (fatia 1) antes de tudo — todo ponteiro de option set resolve por `chave_bubble`
(`02` §4). Duas armadilhas dessa resolução:

- `Opt.Etapas`: `pedido` e `pedido0` são opções **diferentes** ("Pedir" e "Pedido"). Resolver pela
  chave, nunca pelo rótulo.
- `departamentos`: a chave `licita__o` é o **Comercial** e `geral` é **Operação** (`02` §3.1). Não
  deduzir o departamento pela chave.

### 5.4 Modo relatório, antes de aplicar

```
node tools/carregar-supabase.mjs --relatorio --tabela enderecos_clifor
```

Não escreve nada. Lista:

- duplicatas de `enderecos_clifor.documento` (CNPJ/CPF) e de `produtos (nome, grupo_id)` — os dois
  índices únicos de `02` §8.1. **Sem isso o `create unique index` falha no meio da carga.**
- grupos com mais de um endereço `principal` (hoje é `true` em toda filial): a carga escolhe **um
  por grupo, o mais antigo** (`02` §8.2).
- divergência de UF entre o campo texto e o option set (`02` §3.2: option set vence, texto é
  fallback).
- valores de comissão fora de `[0,01 .. 0,30]` (a B3 de §2).
- entregas que aparecem em mais de uma meta fechada — hoje geram comissão em dobro, e o índice único
  `entrega_em_uma_meta_so` (`02` §6) vai recusá-las.

Só depois de zero conflito (ou de decisão registrada em `specs/`) o índice único entra na migration.

### 5.5 Conversões que exigem cuidado

De `02` §1.3–1.8 e §10:

| O quê | Regra |
|---|---|
| Alíquota | vira **fração**: `12` → `0.1200`, em `numeric(7,4)`. O Bubble mistura as duas escalas na mesma base |
| Dinheiro | `numeric(14,2)`, nunca `float`. Relatório de arredondamento: toda linha cujo valor original tinha mais de 2 casas |
| `date_range` | duas colunas `inicio`/`fim` (`User.UltimoDateRange` → `usuario_preferencias.periodo_inicio/fim`; `MetasMensais.DataPeriodo`) |
| Lista do Bubble | FK do lado N quando espelha relação (`QuaisEnderecos`, `QuaisContatos`, `QuaisEntregas` **não** migram); tabela de ligação quando é N:N de verdade (`ProdutosModelo.QuaisFornecedores` → `fornecedor_produtos`); tabela de ligação quando é lista de option set (`ConfigSistema.QuaisPerfis` → `permissoes_pagina`) |
| Arquivo | baixar do CDN público do Bubble e regravar em **bucket privado** do Storage; a tabela guarda `anexo_path`, nunca URL |
| `Tbl.ConfigSistema` | quebra em três: `config_sistema` (chave-valor), `permissoes_pagina` (as linhas com `QualPagina`/`QualMenuConfig`) e `config_copia_email` (códigos 5–10). **A linha de código 21 não carrega** — são os tokens do Google, que vão para `integracao_tokens` pelo OAuth novo, não pela carga (`00` §1.3) |
| Nome invertido | `cpo.Liberado` ← `cpo_bloqueado_boolean`; `cpo.NãoFazContratoParceria` ← `cpo_fazcontratoparceria_boolean`; `GrupoCliFor.Observacoes` ← `cpo_codcliente_text`; `Pedido.Importado` ← `cpo_pedidoenviado_boolean`; `Entregas.DtPrevEntrega` ← `cpo_dataentrega`, `DtEntrega` ← `cpo_dtentrega` |
| Tabela física que engana | `Tbl.ContasPagar` mora em `tbl_contasreceber1`; `Tbl.ProdutosTipo` em `tbl_produtosgrupo` e `Tbl.ProdutosGrupo` em `tbl_produtossubgrupo`; `Tbl.MetasFechadas` em `tbl_orcfornecedorescotacao` |
| Campo vazio que vira `not null` | `contas_receber.status_id` (nunca atribuído na criação), `contatos_clifor.ativo` (vazio → `true`), etapa e status de `cotacoes` (→ default) |
| `contas_receber.valor_total` | **ratear** por parcela (`02` §2.1.2). Hoje cada parcela recebe a venda cheia; com 4 parcelas a soma dá 4×. Decisão reversível (`02` §8.2) — se cair, cai junto o trigger `fn_valida_rateio_cr` |
| Não carregar | tudo de `02` §9, em especial `User.PassTexto`, os campos SMTP do usuário e `Opt.Smtp` |

### 5.6 Fecha a carga de cada fatia quando

`bruto/00-contagem.md` × `select count(*)` por tabela batem, e o relatório de **campo preenchido**
(quantas linhas têm cada coluna não nula, origem × destino) não tem queda inexplicada. Uma coluna
que cai de 100% para 60% é FK que não resolveu, não dado que não existia.

---

## 6. Fase D — as 12 fatias verticais

Ordem de `02` §11. Cada fatia é **migration → RLS → server action → tela → teste** (regra 5), e cada
uma termina com `get_advisors`, `npm run verify` e QA por captura. Nunca todas as migrations
primeiro.

| # | Fatia | O que entra | O que o usuário passa a fazer | Pronto quando |
|---|---|---|---|---|
| 0 | Fundação | `perfis`, `departamentos`, `paginas`, `permissoes_pagina`, `usuarios`, `usuario_preferencias`, `auditoria`, `log_acesso`, `fn_usuario_ativo`, `fn_hierarquia`, `fn_pode_acessar_pagina` | entra com login de verdade e vê só o menu a que tem direito | rota interna sem sessão **redireciona**, e não por CSS: a autorização é policy + server action (`00` §3.2). `auditoria` com `update`/`delete` revogados |
| 1 | Listas fixas | as tabelas de `02` §4 | nada (é seed) | seed idempotente por `chave_bubble`; `pedido`/`pedido0` distintos; `licita__o` = Comercial |
| 2 | Cadastro | `grupos_clifor`, `enderecos_clifor`, `contatos_clifor`, `anexos` + Storage privado | busca e edita cliente/fornecedor, endereço, contato e anexo | **é a tela-modelo** (§6.1). Anexo abre por URL assinada de vida curta, nunca pública |
| 3 | Produtos | `produto_tipos`, `produto_grupos`, `produtos`, `produto_versoes`, `fornecedor_produtos` | cadastra produto, tipo e grupo — **tela que não existe no Bubble** (`04` §4.5, `cadastros` 8) | índice único de `produtos (nome, grupo_id)` aplicado, com B1 resolvida |
| 4 | Cotação | `cotacoes`, `cotacao_itens`, `orcamentos_fornecedor`, `icms_aliquotas`, `v_orcamento_valores`, `fn_aliquota_icms` | coluna Cotação do kanban, com orçamento por fornecedor e vencedor por item | `um_vencedor_por_item` ativo; ICMS calculado **no servidor**, em `numeric`, com teste |
| 5 | Proposta e pedido | `propostas`, `proposta_itens`, `pedidos`, `pedido_prazos`, `email_outbox`, `integracao_tokens` | gera proposta, formaliza pedido, envia e-mail | valor do item é **snapshot** e não muda quando o orçamento mudar (`02` §1.6); `integracao_tokens` com RLS e **nenhuma** policy |
| 6 | Entrega | `entregas`, `entrega_arquivos`, `v_kanban_entregas` | confirma entrega e anexa NF | `vendedor_efetivo` (próprio ou substituto) vem da view, não de duas buscas |
| 7 | Financeiro | `contas_receber`, `contas_pagar`, `baixas`, `estornos`, `cobrancas`, `recibos`, `fn_gerar_contas_receber`, `fn_gerar_conta_pagar`, `v_conta_receber_status` | página financeiro: baixa, estorno, cobrança, recibo | parcelas **fecham** com a venda (`fn_valida_rateio_cr`); `cp_unica (entrega_id, vendedor_id)`; toda baixa e todo estorno com autor e data |
| 8 | Metas | `niveis_vendedor`, `vendedor_nivel_historico`, `metas_mensais`, `metas_fechadas`, `meta_fechada_entregas`, `fn_fechar_meta`, `v_realizado_vendedor`, `v_ranking_metas` | página metas, fechamento e comissão | `fn_fechar_meta` em **transação**, com o percentual vindo da tabela e não do input; `entrega_em_uma_meta_so` ativo; B2 e B3 respondidas |
| 9 | Histórico | `historicos`, `modelos_email` | FollowUp e painel de interação | `historicos` é **append-only**: `insert` com `autor_id = auth.uid()`, sem policy de `update` nem de `delete` |
| 10 | SAC e pesquisas | `sac_protocolos`, `sac_protocolo_entregas`, `sac_interacoes`, `pesquisas`, `pesquisa_convites`, `pesquisa_respostas`, `fn_nps` | SAC e os dois formulários públicos | formulário por **token opaco** com prazo e uso único; `anon` sem policy em tabela nenhuma; NPS de verdade (promotores − detratores), não média |
| 11 | Relatórios | só views e funções (`fn_rel_entregas_produto`, `_cliente_mes`, `_fornecedor_mes`) | página relatórios | agregação por **RPC**, nada de somar no navegador — hoje a aba "Outros Relatórios" morre de timeout (`04` §2.1) |
| 12 | Rotinas | `rotinas`, `rotina_execucoes` | painel de manutenção | **trava tripla**: perfil, confirmação explícita e dry-run com relatório antes de aplicar (`00` §3.9) |

`email_outbox` e `integracao_tokens` entram na fatia 5, que é a primeira que precisa enviar e-mail
(`02` §11).

### 6.1 A fatia 2 é a tela-modelo

Ela fixa o padrão de 5 arquivos, o formato da server action (validar → autorizar → transação →
`revalidate`), o tratamento de erro, os componentes de lista/filtro/paginação e o roteiro de QA.
**Ela roda sozinha, sem nenhuma frente em paralelo.** As fatias seguintes copiam o padrão em vez de
inventar (`docs/plano-de-migracao.md` §1, aprendizado 3).

### 6.2 O que pode correr em paralelo

Pré-condição para qualquer paralelismo (`docs/plano-de-migracao.md` §1, aprendizado 6): um worktree
por frente, uma branch por frente e a **propriedade de arquivo declarada antes** de começar — quem
pode tocar em `estilos/tokens.css`, em `componentes/` e em `lib/`. No app_capital três frentes
paralelas fecharam com zero conflito por causa disso.

| Pode em paralelo | Por quê |
|---|---|
| 3 (produtos) e 9 (histórico), depois da 2 | tocam tabelas diferentes; ambas só dependem de `grupos_clifor` e `usuarios` |
| 8 (metas) e 10 (SAC/pesquisas), depois da 7 | módulos independentes; só compartilham `entregas`, em leitura |
| 11 (relatórios) e 12 (rotinas) | 11 é só view e RPC; 12 é tela de manutenção |

| Não pode | Por quê |
|---|---|
| 0 e 1 | são o chão de todas: RLS e resolução de option set dependem delas |
| 2 junto de qualquer outra | é a tela-modelo; paralelizar é copiar um padrão que ainda não existe |
| 4 → 5 → 6 → 7 | cadeia de dados: item de cotação → proposta/pedido → entrega → conta. A conta a receber depende do valor da entrega, que depende do pedido |
| 11 antes de 7 e 8 | as views agregam dinheiro que ainda não existe |

---

## 7. Fase E — desempenho

Não é fase separada no calendário: acontece dentro de cada fatia, e só o fechamento é aqui.

- **Os índices de `02` §6 entram na mesma migration da tabela**, não depois. Regra: índice em toda
  FK e em toda coluna usada em filtro ou ordenação. Com Supabase Micro (1 GB de RAM) e 200 mil
  linhas, índice é requisito, não otimização (achado nº 6).
- **`get_advisors` (segurança e desempenho) depois de cada migration.** É o hábito que faltou no
  app_capital. Advisor de segurança com achado bloqueia o merge da fatia.
- **Meta: abaixo de 300 ms na primeira visita**, com servidor e banco no Brasil.
  `node scripts/medir-navegacao.mjs --vezes 7`, uma linha por rota, com mediana e p95.
- **Paginação no servidor em toda lista longa** (`range()`), além da lista incremental. Nenhuma tela
  baixa a tabela inteira para filtrar no cliente.
- **Relatório agregado por RPC** chamando função SQL (`02` §5). O que hoje são ~90 KB de JavaScript
  somando a partir de um `innerText` vira uma função por matriz.
- Conexão da aplicação pelo **pooler** (6543, transaction mode) — `docs/plano-de-migracao.md` §3.

---

## 8. Fase F — corte

A ordem importa. O que sair de ordem custa dado ou custa acesso.

### 8.1 Antes do corte, sem esperar por ele

Rotação das cinco credenciais de `00` §1. As duas primeiras **não** esperam o corte, porque estão em
circulação hoje:

1. **Senha de aplicativo do Gmail** (`00` §1.1) — está em texto puro num option set, que o navegador
   de qualquer visitante baixa. Revogar no Google e emitir outra. **Consequência a combinar com o
   dono antes:** o envio de e-mail do Bubble para de funcionar na hora. Ou se aceita a janela sem
   e-mail, ou a rotação é agendada para o dia em que a fatia 5 já enviar pelo app novo.
2. **Refresh token e client secret do Google** (`00` §1.3) — revogar no Google Cloud. Derruba o
   leitor de Gmail do Bubble, que `04` §4.5 já dá como possivelmente sem uso.
3. **Chave do App Connector `GestaoLure`** (`00` §1.4) — rotacionar, e conferir se o app
   `gestaolure` tem o mesmo problema de privacidade.
4. **Fechar no Bubble o backend workflow `VicularOcamentoCopiaAoProdutoCopia`** (bUAeU): exposto sem
   autenticação, ignorando privacidade, e **cria** registro. Auditar item a item os outros 24
   workflows que não declaram `expose` (`00` §2.1).

A **chave da API do Bubble** (`00` §1.5) é a única que rotaciona **depois**: é ela que a re-extração
usa. Rotacionar no passo 8.2.6.

### 8.2 A sequência do corte

1. **Re-extração incremental por `Modified Date`**, não por `Created Date`: traz o que mudou desde a
   carga anterior. `node tools/extrair-bubble.mjs --desde <timestamp>`, depois
   `node tools/carregar-supabase.mjs` — que é idempotente por `bubble_id`, então recarregar linha já
   existente é `update`, não duplicata.
2. **Congelamento do Bubble.** Comunicado, horário marcado, ninguém mais grava. Conferir se algum
   scheduled workflow está agendado para a janela (`docs/plano-de-migracao.md` §5, pendência 4): o
   `ResetContagemEmails` se reagenda sozinho todo dia à meia-noite.
3. **Re-extração final**, da mesma forma, com o app já congelado. `bruto/00-contagem.md` × banco tem
   de bater tabela por tabela. É a última prova de nada perdido.
4. **Criação das contas no Supabase Auth, por convite.** As senhas do Bubble **não migram e são
   consideradas comprometidas**: `User.PassTexto` é texto puro numa tabela com regra `everyone` e
   Data API aberta, e `reset_pw` nunca teve workflow, logo ninguém jamais trocou a própria senha — as
   que circulam são as temporárias do cadastro (`00` §1.2). Convite/reset para **100%** das contas, e
   aviso para trocar a senha em qualquer outro serviço onde ela tenha sido reaproveitada. Conferir
   antes quem entra sem perfil ou sem departamento e qual e-mail vira `auth.users.email`
   (`04` §4.3, `inicio-e-acesso` 14 e 15).
5. **Virada de domínio** na Vercel, com a função confirmada em `gru1`.
6. **Desligamento da Data API e da Workflow API do Bubble** e restrição das privacy rules, mesmo que
   o app fique acessível para consulta (`00` §2.7 — recomendação padrão). Enquanto as APIs estiverem
   no ar, as 18 tabelas sem regra de privacidade continuam legíveis por qualquer pessoa. Só depois
   disso, **rotacionar a chave da API do Bubble** (`00` §1.5) e remover `BUBBLE_API_KEY` do `.env`.
7. **Varredura final:** `get_advisors` nos dois modos sem achado; nenhum `NEXT_PUBLIC_` carregando
   chave de servidor; toda tabela com RLS ligada e policy explícita.

---

## 9. Riscos e o que fazer se der errado

| Risco | Como aparece | O que fazer | O que "rollback" significa |
|---|---|---|---|
| **Carga parcial** | a contagem de uma tabela não bate, ou uma coluna de FK cai de 100% para 60% | reprocessar só a janela e a tabela afetadas: a carga é idempotente por `bubble_id`, então recarregar é `update` | `delete from <tabela> where bubble_id is not null` e recarregar do `bruto/`. Nunca `truncate`: linha nascida no app novo tem `bubble_id` nulo |
| **Índice único que quebra no meio** | `create unique index` falha em `enderecos_clifor.documento` ou em `produtos (nome, grupo_id)` | era para ter rodado o **modo relatório** antes (§5.4). Criar como não único, abrir `[PENDENTE-B1]` e seguir | a migration é uma transação: o índice não entra e a tabela fica como estava |
| **Comissão que não bate com o histórico** | o valor calculado pelo app novo difere do que o Bubble mostrava | **não corrigir o passado.** O líquido do Bubble é igual ao bruto em toda a base porque o ICMS calcula sobre campo excluído (`04` §1, B5). Fórmula nova vale só do corte para frente, com data de vigência, e a diferença vira relatório de conciliação assinado pela Diretoria | não existe rollback de número que o negócio já viu: o que existe é vigência |
| **Comissão em dobro** | a mesma entrega aparece em duas metas fechadas | `entrega_em_uma_meta_so` recusa na carga; o relatório de §5.4 lista os casos históricos para a Diretoria decidir qual meta vale | nenhum: é defeito do Bubble que a carga expõe |
| **Rotina antiga disparada por engano** | alguém abre `/rotinas` do Bubble depois do corte e estorna todas as baixas (bTprj), ou apaga pedidos, entregas e propostas (bTmUN0) | é o motivo do passo 8.2.6: **desligar a Workflow API e restringir as privacy rules no corte**, não depois. No app novo, nenhuma rotina sem a trava tripla da fatia 12 | restaurar do backup do Supabase (PITR) e reaplicar a re-extração. Por isso o passo 3 do corte é a última extração, não a primeira |
| **Bubble gravou durante a janela** | registro criado depois da re-extração final | o congelamento (8.2.2) é o controle. Se furar, uma terceira passada por `Modified Date` resolve, porque a carga é idempotente | nenhum dado se perde; o custo é a janela reabrir |
| **A fatia 5 envia e-mail antes da rotação do Gmail** | o app novo passa a usar a credencial exposta | `SMTP_PASS` só é preenchido com a senha **nova** (§8.1.1). A rotação é pré-requisito do deploy da fatia 5, não do corte | desligar `email_outbox` — o envio é fila, não síncrono |
| **Região errada na Vercel** | primeira visita acima de 300 ms com o banco ainda vazio | conferir a região no painel: a configuração do projeto vence o `vercel.json` | trocar a região e redeployar; nenhum dado envolvido |

Rollback por fase, em uma linha: **A** é `git revert`; **B** é apagar `bruto/` e reextrair; **C** é
recarregar por `bubble_id`; **D** é reverter a branch da fatia e derrubar as tabelas dela (nenhuma
outra fatia depende de tabela que ainda não foi entregue); **E** é remover índice; **F** é PITR do
Supabase mais a re-extração.

---

## 10. Definição de pronto de cada entrega

Checklist curto, derivado do `CLAUDE.md`. Vale para **toda** fatia, e nada vai para `main` sem os
seis itens.

- [ ] **Migration com RLS ligada e policy explícita** em toda tabela nova, na mesma migration
      (regra 3). `get_advisors` nos dois modos, sem achado. Nenhuma tabela nasce sem policy; tabela
      de token nasce com RLS e **nenhuma** policy.
- [ ] **Teste de dinheiro** onde houver comissão, meta, parcela ou ICMS (regra 10): `numeric`, nunca
      `float`, cálculo em função SQL ou server action, dentro de transação, com pares
      entrada→esperado tirados de caso real.
- [ ] **`npm run verify` verde** — typecheck, lint e teste (regra 6), antes de todo commit.
- [ ] **QA por captura de tela** em claro, escuro e celular, esperando pelo conteúdo e não pelo
      esqueleto — **e as capturas abertas** (regra 7), comparadas com
      `specs/bubble/02-telas-e-design.md`.
- [ ] **`service_role` só no servidor**, nenhum segredo no repositório nem no chat; o que houver é
      citado pelo nome da variável (regras 4 e 8).
- [ ] **Decisão tomada virou arquivo em `specs/`** (regra 9): dúvida respondida vai para a §10 da
      spec de origem e é marcada em `04-duvidas.md` com a data. Sessão não persiste; `specs/`
      persiste.

Commit em português, formato convencional, um por passo lógico. Uma branch por frente, `main`
sempre publicável.
