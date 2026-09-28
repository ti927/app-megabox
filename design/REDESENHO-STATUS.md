# Redesenho visual — onde parou (28/09/2026)

Branch `wip/redesenho-visual`. Não fazer merge no `main` antes de `npm run verify` e QA por captura.

**Pronto (capturas conferidas):** sistema visual — `estilos/tokens.css` v2 (razões de contraste AA
nos comentários), fonte Source Sans 3 via `next/font` em `app/layout.tsx`, `base.css`,
`componentes.css` com estados, `.botao-alerta`, `.botao-texto`, `.marca`; casca (logo ao centro,
"Sair" no rodapé do menu, cabeçalho fixo) em `componentes/marca.tsx`, `componentes/casca.tsx`,
`app/(app)/casca.css`; rotas `/entrar`, `/formulario`, `/produtos`, `/sac`, `/relatorios`.

**Pela metade:** `/financeiro` (CSS pronto e capturado); `/metas`, `/rotinas`, `/cadastros` só com o
ajuste geral, sem revisão própria; `/inicio` e `/sem-acesso` só herdam o sistema. **`/vendas` não foi
tocada.** `design/sistema-visual.md` ainda não foi escrito.

**Não verificado depois das mudanças:** `npx tsc --noEmit`, eslint e vitest. Markup alterado:
`casca.tsx` ("Sair" para o rodapé; ícone SVG no lugar de ☰), `entrar/tela.tsx` (título "Bem-vindo de
volta"), `formulario/layout.tsx` (logo numa faixa), `app/layout.tsx` (fonte). Nenhuma mudança em
`data-teste`, nomes de campo ou server actions.

Referências: plugins UI/UX Pro Max e frontend-design (Anthropic) instalados em 28/09; capturas do
Bubble em `design/capturas/` (fora do git).
