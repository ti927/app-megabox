# app-megabox

Migração do app Bubble **grupomegabox** (Grupo MegaBox) para código. O Bubble é a fonte do
**comportamento**, não do desenho: telas e fluxos continuam reconhecíveis para quem usa hoje;
banco e lógica são refeitos e otimizados.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | CSS próprio com tokens (mesmo padrão do app_capital; sem Tailwind) |
| Banco | Supabase `megabox` — ref `bdntlmsuxpicpmpzosbt`, sa-east-1, Postgres 17, Micro |
| Acesso a dados | `@supabase/supabase-js` / `@supabase/ssr`; SQL puro nas migrations |
| Auth | Supabase Auth + RLS |
| Deploy | Vercel, funções em **`gru1`** (`vercel.json` → `"regions": ["gru1"]`) |

Tudo no Brasil: servidor e banco na mesma região. No app_capital as funções ficaram em `iad1`
(EUA) e cada consulta cruzava o continente — não repetir.

## Regras não negociáveis

1. **O mapa manda.** `mapa/` é o app Bubble decompilado do export `.bubble` e é completo. Regra de
   negócio vem de lá (citando o WF), nunca da memória. Se o mapa não deixa claro: **[DÚVIDA]** em
   `specs/04-duvidas.md` e siga com a recomendação padrão registrada lá.
2. **Banco só depois do mapeamento.** O esquema novo sai de `specs/02-modelo-de-dados-proposto.md`,
   não da cópia 1:1 dos data types do Bubble.
3. **RLS ligada em toda tabela desde a primeira migration.** No app_capital ela ficou desligada e
   o banco foi para produção aberto. Aqui não.
4. **`service_role` nunca sai do servidor.** Nada de `NEXT_PUBLIC_` em chave de servidor.
5. **Vertical slice:** migration → RLS → server actions → tela → teste. Nunca todas as migrations
   primeiro e as telas depois.
6. **`npm run verify` (typecheck + lint + teste) passa antes de todo commit.**
7. **QA por captura de tela** (claro, escuro, celular) antes de entregar tela — e as capturas se
   abrem. Espere pelo conteúdo, nunca pelo esqueleto de carregamento.
8. **Segredo não entra no repositório nem no chat.** Vai para `.env`; cite o nome da variável.
9. **Decisão tomada vira arquivo em `specs/`.** Sessão não persiste; `specs/` persiste.
10. **Dinheiro é exato:** `numeric`, nunca `float`; cálculos de comissão, metas, parcelas e ICMS
    têm teste.

## Fora de escopo

Páginas de backup do Bubble, não linkadas em lugar nenhum: `vendas_bkp`, `vendas_bkp2`,
`metas_bkp`, `cadastros_old`, `testes`.

## Onde está o quê

| Caminho | Conteúdo |
|---|---|
| `mapa/LEIA-ME.md` | **leia primeiro** — notação do mapa decompilado |
| `mapa/00-inventario.md` | contagens por página/reusable (checksum do mapeamento) |
| `mapa/pagina-*.md`, `mapa/reusable-*.md` | cada tela e componente: elementos, condicionais, workflows, ações |
| `mapa/data-types.md`, `option-sets.md`, `backend-workflows.md`, `integracoes.md` | banco atual, listas fixas, workflows de servidor, integrações |
| `specs/paginas/*.md` | spec funcional por página/grupo de reusables (em produção pelos agentes) |
| `specs/01-visao-geral.md` | módulos, perfis, fluxos ponta a ponta (em produção) |
| `specs/02-modelo-de-dados-proposto.md` | esquema Postgres novo + de-para Bubble→novo (em produção) |
| `specs/03-plano-de-construcao.md` | ordem das frentes, extração/carga, corte (em produção) |
| `specs/04-duvidas.md` | dúvidas consolidadas com recomendação padrão (em produção) |
| `docs/plano-de-migracao.md` | análise do app_capital e o plano geral |
| `tools/decompile.py` | gera `mapa/` a partir do `.bubble` (o `.bubble` fica fora do git) |

## Economia de contexto

`mapa/pagina-vendas.md` tem ~2.500 linhas. Leia a seção do módulo que está implementando, nunca o
arquivo inteiro de uma vez. Não peça leitura do repositório inteiro — aponte o arquivo.

## Plugins

- **Superpowers**: brainstorming → spec → writing-plans → subagent-driven-development;
  `dispatching-parallel-agents` e `using-git-worktrees` nas frentes paralelas.
- **Ponytail**: `lite` na construção das telas (a spec decide *o que*, o Ponytail decide *como*);
  `full` em scripts; `/ponytail-review` antes de merge. Nunca simplifica RLS, validação ou dinheiro.
- context7 (docs de Next.js/Supabase), security-guidance, pr-review-toolkit, typescript-lsp,
  claude-md-management.

Precedência em conflito: este `CLAUDE.md` > Superpowers > Ponytail.

## Commits

Português, formato convencional, um commit por passo lógico (`feat:`, `fix:`, `chore:`, `docs:`).
`main` sempre publicável. Uma branch por frente.
