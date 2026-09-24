# MegaBox — análise do LureCapital e plano de migração

Estado em 24/09/2026. Base: repositório `ti927/app_capital` (67 commits, 17 a 21/09/2026), projeto Vercel `app-capital` e projeto Supabase `app_capital`.

---

## 1. Como o LureCapital foi feito — ordem real, pelos commits

| Quando | Passo | O que saiu |
|---|---|---|
| antes do repo | Mapeamento no Bubble (Claude in Chrome, só leitura) | `specs/bubble/documentacao-completa.md` — 2.540 linhas em 6 fases: inventário → banco → páginas/reusables (árvore, pop-ups, custom states, expressões, 168+28 workflows) → backend WF → integrações → resumo com mapa de navegação, fluxos de ponta a ponta, itens [NÃO VERIFICADO] e pontos de atenção |
| 17/09 15:11 | Esqueleto de governança | `CLAUDE.md` com regras não negociáveis, `.claude/settings.json` (allow/ask/deny), `.env.example`, handoff, primeiro prompt |
| 15:34 | Banco a partir do mapeamento | `db/001` fundação (perfil, auditoria em `evento`), `db/002` 24 tabelas de domínio, `db/003` RLS escrita; option sets viraram tabela com `chave_bubble` para o de-para |
| 16:01 | Extração + carga | `extrair-bubble.mjs` (Data API `/api/1.1/obj/<tipo>`, paginação por cursor, JSON bruto fora do git) e `carregar-supabase.mjs` (idempotente por `bubble_id`) |
| 16:06 | Contas | usuários recriados no Supabase Auth com senha provisória (senha do Bubble não migra) |
| 16:17–16:28 | Plano por fase + design system | `specs/04-fases.md`; tokens e 12 componentes da Lure |
| 16:47 | Fundação + 1ª tela (Cliente) | fixa o padrão de 5 arquivos por tela: `page.tsx` · `loading.tsx` · `tela.tsx` · `dialogo.tsx` · `acoes.ts` |
| 17:01 | As outras 4 telas | Fornecedor, Operação, Esteira, Funil |
| 17:16–17:47 | Ajuste pelo uso, QA com capturas, MCP | `scripts/qa.mjs` (Playwright, claro/escuro/celular); servidor MCP só leitura |
| 18/09 | Rodada QOL em **3 frentes paralelas** | um worktree por branch, propriedade de arquivo publicada antes → merge sem nenhum conflito |
| 21/09 | Rodada de velocidade + documentação | consultas em paralelo, `!inner`, listas incrementais; `aprendizados.md` |

O que fez funcionar em 2 dias, e que vamos repetir:

1. **Bubble = fonte do comportamento, não do desenho.** Banco e lógica refeitos; telas reconhecíveis.
2. **Mapeamento completo antes de qualquer código**, com contagens (elementos, pop-ups, workflows por página) que servem de checklist.
3. **Uma tela-modelo primeiro**, depois as demais copiando o padrão.
4. **`bubble_id` em toda tabela** → carga idempotente e recarga segura.
5. **QA por captura de tela**, e as capturas são abertas (três bugs reais só apareceram assim).
6. **Paralelismo com propriedade de arquivo exclusiva**, uma frente por worktree.
7. **Decisão vira arquivo em `specs/`**, não fica no chat.

---

## 2. O que corrigir no MegaBox (achados do LureCapital)

| # | Achado | Evidência | No MegaBox |
|---|---|---|---|
| 1 | **Servidor da Vercel nos EUA, banco no Brasil** | deploy em `iad1` (Washington); Supabase em `sa-east-1`. Cada consulta custava 60–100ms de ida e volta, e o doc de otimização concluiu que esse era o limite | `vercel.json` com `"regions": ["gru1"]` desde o 1º deploy. **Vale aplicar no app_capital também** |
| 2 | **RLS desligada em produção** | conferido hoje: 0 de 28 tabelas com RLS, 0 policies. A `anon key` fica no navegador → qualquer pessoa lê e grava tudo pela API REST | RLS ligada desde a Fase 0, dentro de cada vertical slice. **No app_capital: aplicar `db/003_rls.sql` com urgência** |
| 3 | Documentação diferente do código | `CLAUDE.md` cita Drizzle, Tailwind e shadcn; o código usa `supabase-js` e CSS próprio. `specs/00`–`07` nunca foram escritos | `CLAUDE.md` descreve só o que existe |
| 4 | Carga linha a linha | 1 `INSERT` por registro — bom para ~1 mil linhas | ~200 mil linhas: inserir em lotes de 500–1.000, em duas passadas (registros, depois referências via `bubble_id`) |
| 5 | Extração do `version-test` | o live não tinha os tipos expostos; o version-test era uma cópia de ~15/09 | extrair do **live**, expondo cada data type em Settings → API; re-extração final por `Modified Date` no corte |
| 6 | Índices dispensados | com 383 etapas não faziam diferença | com 200 mil linhas são obrigatórios: FKs, datas, status e colunas de filtro |
| 7 | Mapeamento num arquivo único | 2.540 linhas, lidas por faixa de linha | um arquivo por página em `specs/bubble/`, cada um com o inventário que tem que bater |
| 8 | Este ambiente na nuvem não acessa o Bubble | `grupomegabox.bubbleapps.io` bloqueado pela política de rede (403) | extração roda na sua máquina (Claude Code local) ou o admin libera o domínio `bubbleapps.io` |

---

## 3. Arquitetura alvo

| Camada | Escolha | Observação |
|---|---|---|
| Front + servidor | Next.js 15 (App Router) + TypeScript + CSS próprio com tokens | igual ao app_capital, para aproveitar casca, auth e componentes |
| Hospedagem | Vercel, funções em **`gru1` (São Paulo)** | mesma região do banco |
| Banco | Supabase **Micro**, `sa-east-1`, Postgres 17 | conexão da aplicação pelo pooler (6543, transaction mode) |
| Auth | Supabase Auth (e-mail/senha; Google depois) | senhas do Bubble não migram → convite/reset |
| Segurança | RLS em toda tabela; `service_role` só no servidor | |
| Auditoria | trigger em `evento`, UPDATE/DELETE revogados | igual ao app_capital |

### Supabase Micro com ~200 mil registros

Aguenta com folga: 200 mil linhas com índices devem ficar bem abaixo de 1 GB. No Micro o gargalo é a memória (1 GB de RAM), não o disco. Com isso:

- **Índice em toda FK e em toda coluna usada em filtro ou ordenação** (datas de entrega e de vencimento, status, vendedor, cliente).
- **Relatórios agregados no banco** (views ou funções SQL chamadas via RPC) — o relatório anual de vendas e as metas não podem baixar linhas para somar no navegador.
- **Paginação no servidor** em toda lista longa, além da lista incremental.
- **Tipos numéricos de verdade** para valores e datas (evitar `text` monetário, que no LureCapital ficou pendente).
- Conferir `get_advisors` (performance e segurança) depois de cada migration.

---

## 4. Plano por fase

Cada fase fecha com a **prova de nada perdido**: contagem na origem × contagem no destino.

### Fase 0 — Acessos e inventário
- App Bubble: `grupomegabox.bubbleapps.io`. Expor **todos** os data types na Data API do **live**; gerar chave de API.
- Inventário-mestre: páginas, reusables, data types, option sets, backend e scheduled workflows, plugins, API Connector — com contagem de elementos, pop-ups e workflows por página.
- Repositório GitHub, projeto Supabase (`sa-east-1`, Micro), projeto Vercel (`gru1`).

### Fase 1 — Mapeamento em paralelo
- Um agente por página (Claude in Chrome), todos com o mesmo modelo: árvore de elementos, pop-ups, custom states, conditionals, expressões literais, workflows com passos, navegação, prints de cada estado.
- **Checagem:** o que cada agente documentou precisa bater com as contagens do inventário. Divergência vira item [NÃO VERIFICADO] e volta para o agente.
- Atenção especial: backend/scheduled workflows (em execução no corte), privacy rules, HTML customizado (ex.: contador de parcelas em Cobrança de Fornecedores).

### Fase 2 — Modelo e carga
- Esquema SQL a partir da Fase 2 do mapeamento: `bubble_id` único em toda tabela, option sets como tabela com `chave_bubble`, listas do Bubble viram tabelas de ligação.
- Extração do live, fatiada por `Created Date` e em lotes; JSON bruto fora do git.
- Carga em lote, idempotente, duas passadas. Relatório de contagem por tabela e por campo preenchido.

### Fase 3 — Fundação do app
- Casca copiada do app_capital (layout, menu, auth, design system, QA, MCP só leitura).
- RLS ligada, região `gru1`, variáveis na Vercel, primeiro deploy já protegido.

### Fase 4 — Telas em vertical slice
- Uma tela-modelo, depois as demais em frentes paralelas (worktree + propriedade de arquivo).
- Cada tela: migration → RLS → consulta/ações → tela → QA com capturas, comparadas com os prints do Bubble.

### Fase 5 — Desempenho e corte
- `medir-navegacao` com `--vezes 7`; meta abaixo de 300ms na primeira visita, com servidor e banco no Brasil.
- Re-extração por `Modified Date`, congelamento do Bubble, convite de senha aos usuários, virada de domínio.

---

## 5. Pendências de decisão

1. Onde roda a extração: na sua máquina ou com o domínio liberado neste ambiente.
2. Link/método usado no LureCapital para ler todos os workflows pela API/JSON do app (não está no repositório).
3. Nome do repositório e da organização no GitHub (o LureCapital está em `ti927`).
4. Quantos usuários ativos e se há scheduled workflows rodando (afeta o corte).

---

## 6. Ferramental de desenvolvimento (plugins)

Rodam no Claude Code da máquina onde o código é desenvolvido. Ordem de precedência quando conflitarem: **`CLAUDE.md` do projeto > processo do Superpowers > estilo do Ponytail**.

| Papel | Plugin / ferramenta | Como entra na MegaBox |
|---|---|---|
| Processo | **Superpowers** (`obra/superpowers`) | brainstorming → spec → writing-plans → subagent-driven-development; `dispatching-parallel-agents` no mapeamento; `using-git-worktrees` nas frentes paralelas; `verification-before-completion` antes de dar tarefa por pronta; `systematic-debugging` em bug |
| Estilo de código | **Ponytail** (`DietrichGebert/ponytail`) | `lite` na construção das telas (a spec decide **o que** existe; o Ponytail decide **como**, com o mínimo); `full` em scripts de extração/carga e utilitários; `/ponytail-review` e `/ponytail-audit` antes de cada merge. Nunca simplifica RLS, validação nem tratamento de erro — a própria skill exclui esses casos |
| Documentação de libs | **context7** | docs das versões exatas de Next.js 15 e supabase-js |
| Banco | Supabase MCP (já conectado) + `supabase/agent-skills` | migrations, `get_advisors` depois de cada migration |
| Deploy | Vercel MCP (já conectado) | região `gru1`, variáveis, logs |
| QA visual | **playwright** + `scripts/qa.mjs` herdado do app_capital | capturas claro/escuro/celular, comparadas com os prints do Bubble |
| Segurança | **security-guidance** (alerta a cada edição) + **claude-security** (varredura antes do corte) | resposta direta ao achado da RLS desligada no app_capital |
| Revisão | **pr-review-toolkit** / **code-review** | um PR por fase/frente |
| TypeScript | **typescript-lsp** | erros de tipo durante a edição |
| Memória do projeto | **claude-md-management** | mantém o `CLAUDE.md` igual ao código (achado nº 3) |
| Máquina de estados | polygraph — **só se** aparecer fluxo de status (entrega, cobrança) | conferência de transições, experimental |

Fora de propósito: **caveman** (medido em 8,5% de economia no app_capital), **code-simplifier** e **feature-dev** (sobrepõem Ponytail e Superpowers).

Referência medida no app_capital (`docs/fluxo-de-trabalho.md`): Ponytail deu −15% de código e ~−10% de custo sem perda de qualidade, e a economia aparece onde há espaço para superengenharia. Por isso `lite` na construção e `full` nos scripts.

Regra de teste: Superpowers pede TDD; Ponytail pede "um teste que falha se a lógica quebrar". Em cálculo de dinheiro (vendas, metas, cobranças, parcelas) vale o TDD completo.

---

## 7. Decisões e andamento — 24/09/2026

- **Extração roda dentro do Supabase** (Edge Function no projeto `megabox`, `sa-east-1`, Micro), gravando direto no banco. Motivo: este ambiente não alcança `bubbleapps.io`/`bubble.io` (bloqueio de rede), e o Zapier não serve para volume — a ação "Find" traz no máximo 100 registros por vez, e a ação de código do Zapier troca o cabeçalho de autenticação pelo token dela, que o Bubble recusa (401).
- **Inventário de dados feito** pelo `/api/1.1/meta` do live: 29 data types, 444 campos, 26 option sets, 24 backend workflows → `megabox/specs/bubble/01-inventario-dados.md`.
- **Achado de segurança no Bubble:** o backend workflow `VicularOcamentoCopiaAoProdutoCopia` está exposto **sem autenticação** — qualquer pessoa com a URL pode dispará-lo.
- **Chave da API do Bubble** foi colada no chat e passou pelo sandbox do Zapier → rotacionar depois do corte.
- **Criação do projeto Supabase pelo conector falhou** (timeout, duas tentativas, nenhum projeto criado) → criar pelo painel.
- **Mapeamento de páginas** depende do Claude in Chrome na máquina do usuário: o editor do Bubble não é acessível deste ambiente.
