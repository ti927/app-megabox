# Avisos do `get_advisors` no banco novo — veredito de cada um

O `get_advisors` roda depois de **toda** migration (CLAUDE.md, fatia = migration → RLS → ações →
tela → teste). Ele acusa coisas de propósito, e sem este arquivo a próxima sessão faz uma de duas
bobagens: ou "conserta" um aviso que existe por decisão, ou deixa passar um aviso novo achando que
já era conhecido.

Regra de uso: **se o aviso está aqui, é conhecido e aceito; se não está, é achado novo e trava a
fatia.** Aviso de nível `ERROR` nunca entra nesta lista — ERROR se corrige.

Estado em 25/09/2026, banco `megabox` (`bdntlmsuxpicpmpzosbt`), 44 tabelas, migrations 001–006.

---

## Corrigido, não aceito

| Lint | Nível | O que era | Como saiu |
|---|---|---|---|
| `security_definer_view` | **ERROR** | `v_usuarios_publico` da 002 ignorava a RLS de `usuarios` por completo | a 004 derruba a view e troca por `grant select (colunas)` + `fn_meu_cadastro()` |

Vale registrar por que isso era ERROR e as funções abaixo são só WARN: a view devolvia **linha de
outro**, e a proteção dependia de ninguém acrescentar coluna sensível a ela depois. Proteção que
depende de disciplina futura não é proteção.

---

## Aceitos por decisão

### 1. `rls_enabled_no_policy` — INFO — `auditoria` e `integracao_tokens`

**É o comportamento pedido.** As duas tabelas não têm policy porque **nenhum usuário deve lê-las**:
só `service_role`, de dentro do servidor.

O aviso existe porque RLS sem policy é, quase sempre, esquecimento — e quando é esquecimento o
efeito é traiçoeiro: a consulta devolve **zero linhas em vez de erro**, então a tela parece só estar
vazia. Foi exatamente esse o defeito que o `scripts/testar-rls.mjs` pegou em `auditoria`. Por isso as
duas não param na RLS:

```sql
-- 001, linhas 632, 719-727 e 635
revoke all            on table public.auditoria         from anon;
revoke select         on table public.auditoria         from authenticated;
revoke update, delete on table public.auditoria         from authenticated, anon, service_role;
revoke all            on table public.integracao_tokens from anon, authenticated;
```

Com o GRANT revogado a tentativa **falha**, em vez de mentir que não há dado. A RLS fica como segunda
camada. `scripts/testar-rls.mjs` afirma as duas.

Quando a tela de auditoria for construída (perfil 1), entra a policy de select de `02` §7.3 e
`auditoria` sai desta lista.

### 2. `authenticated_security_definer_function_executable` — WARN — 6 funções

`fn_usuario_ativo()`, `fn_hierarquia()`, `fn_pode_acessar_pagina(text)`, `fn_minhas_paginas()`,
`fn_meu_cadastro()`, `fn_minhas_configuracoes()`.

**Precisam ser executáveis por `authenticated`, e são inofensivas.**

Precisam porque as três primeiras são chamadas **de dentro das policies**, e a policy é avaliada com
o papel de quem consulta: sem `execute` para `authenticated`, toda consulta de todo usuário quebra.
`security definer` é o que permite a policy de uma tabela consultar `public.usuarios` sem cair em
recursão de RLS.

Inofensivas porque **todas são fechadas em `auth.uid()`**:

| Função | Filtro | O que devolve a quem chama por RPC |
|---|---|---|
| `fn_usuario_ativo()` | `u.id = auth.uid()` | se ele mesmo está ativo |
| `fn_hierarquia()` | `u.id = auth.uid()` | o próprio perfil |
| `fn_pode_acessar_pagina(p_slug)` | `u.id = auth.uid()` | se ele mesmo abre aquela página |
| `fn_minhas_paginas()` | `u.id = auth.uid()` | as páginas dele |
| `fn_meu_cadastro()` | `u.id = auth.uid()` | o cadastro dele |
| `fn_minhas_configuracoes()` | `u.id = auth.uid()` | os alvos de configuração dele |
| `fn_pode_ver_tipo_anexo(p_tipo)` (018) | `u.id = auth.uid()` | se o departamento dele vê aquele TIPO de anexo |

A sétima entrou com a 018 (28/09/2026): é chamada pela policy de leitura de `anexos`. O argumento
é o tipo de anexo, não uma pessoa — mesmo caso de `fn_pode_acessar_pagina`.

O critério que separa um caso do outro: **nenhuma aceita parâmetro que enderece outro usuário.**
`fn_pode_acessar_pagina` recebe argumento, mas o argumento é a página, não a pessoa — o `where`
continua sendo `auth.uid()`. É por isso que `fn_meu_cadastro()` foi escrita **sem parâmetro**: uma
`fn_cadastro(p_usuario uuid)` seria a mesma falha da view derrubada, com outra roupa.

**Critério para funções novas:** `security definer` executável por `authenticated` só passa se o
`where` for `auth.uid()` e nenhum argumento apontar linha de terceiro. Fora disso, a função é
`security invoker`, ou o `execute` fica só com `service_role` e a tela chama por server action.

### 3. `extension_in_public` — WARN — `pg_net`

Vem instalada assim pela Supabase, não por nós, e movê-la de esquema quebra o que a plataforma
mantém em cima dela. Nada nosso usa `pg_net`. Fica como está, e a decisão é *não mexer*.

---

## Aceito só enquanto não há produção

### 4. `auth_leaked_password_protection` — WARN — desligado

Ligar é **um clique no painel** (Authentication → Policies), e não dá para ligar por migration nem
pela API que temos aqui. Está na lista de ações do usuário em `docs/estado-do-projeto.md`.

Precisa estar ligado **antes do corte**, e o motivo é concreto: as senhas de hoje estão em texto
puro em `User.PassTexto` e legíveis sem autenticação (`00-achados-de-seguranca.md` §1.2). Toda senha
que existe hoje deve ser tratada como vazada, então o app novo não pode aceitar que ela seja
recadastrada igual.

---

## Performance

`get_advisors(type: 'performance')` é conferido na fatia E (`03-plano-de-construcao.md`), com dado
carregado. Antes da carga ele acusa `unindexed_foreign_keys` e `unused_index` em tabela vazia, o que
não quer dizer nada: índice em tabela de 0 linha nunca é usado. O que valeu desde já é a regra de
`02` §6 — índice em toda FK e em toda coluna de filtro ou ordenação —, aplicada na própria migration.

### `auth_rls_initplan` — corrigido na 020 (29/09/2026)

As policies de leitura de cadastros e listas fixas (001, 003, 004, 006 e outras) chamavam
`public.fn_usuario_ativo()` (e, em algumas, `fn_hierarquia()`, `fn_pode_acessar_pagina('…')` e
`auth.uid()`) sem `(select …)`. Como as três primeiras são `security definer`, o Postgres não as
embute: rodavam **uma vez por linha lida**, cada uma com uma consulta em `usuarios`. Com a base
carregada, isso somado às subconsultas por linha das views do kanban levou a página `/vendas` a
estourar o `statement_timeout` (57014) em rajadas.

A `020_desempenho.sql` reescreve toda policy do esquema `public` com `(select f())` — mesma
condição, calculada uma vez por consulta (initPlan) — e aborta se sobrar chamada solta.
**Regra para policy nova:** função sem argumento de linha vai sempre dentro de `(select …)`.
Função que recebe coluna da linha (ex.: `fn_pode_ver_tipo_anexo(tipo_anexo_id)`, 018) fica como
está, porque ali o valor muda por linha.
