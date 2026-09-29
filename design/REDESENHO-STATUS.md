# Redesenho visual — estado (29/09/2026)

Branch `wip/redesenho-visual`, com `origin/main` mesclado (merge sem conflito: o main só trouxe
`vercel.json`). Sistema documentado em `design/sistema-visual.md` (tokens, escala, paleta com
contrastes AA medidos, estados).

**Revisado e capturado (claro, escuro, 390 px):** casca, `/entrar`, `/inicio`, `/sem-acesso`,
`/cadastros`, `/produtos`, `/sac`, `/relatorios`, `/metas`, `/vendas`, `/financeiro`.

**Não capturado:** `/rotinas` — a conta de QA não tem a página de propósito (db/014 D4) e cai em
`/sem-acesso`; a captura com dado exige `scripts/testar-tela-rotinas.mjs`, que grava no banco e
não foi rodado para poupar a instância Micro. O CSS de rotinas só recebeu os ajustes mecânicos
(tokens de peso, `flex-end`).

**Limites conhecidos:** a conta de QA não tem contas a receber no período, então a tabela do
`/financeiro` não aparece nas capturas desta rodada (o CSS dela foi capturado em 28/09); `/inicio`
é só a saudação — a matriz Fornecedor × meses do Bubble é funcionalidade, não visual.

**Verificado:** `npx tsc --noEmit`, `npx eslint . --max-warnings 0`, `npx vitest run`.
Markup alterado em toda a frente: `casca.tsx`, `entrar/tela.tsx`, `formulario/layout.tsx`,
`app/layout.tsx`. Nenhuma mudança em `data-teste`, nomes de campo, rotas ou server actions.
