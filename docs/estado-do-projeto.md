# Estado do projeto e onde retomar

Atualizado em 28/09/2026, fim da sessão. Este arquivo existe para que a próxima sessão comece sem reler nada.

---

## 0. RETOMAR AQUI (fim da sessão de 28/09/2026)

**O banco caiu às 19:47 de 28/09 e estava fora quando a sessão acabou.** A instância Micro do
Supabase saturou com vários agentes testando ao mesmo tempo (a causa principal foi o QA repetido de
`/vendas`, cujas views de kanban fazem subconsulta por linha + `count: exact`). O painel diz
"saudável", mas nenhuma conexão entra. **Primeiro passo:** Supabase → projeto `megabox` → Settings →
General → *Restart project*. Recomendado subir de **Micro para Small**.

Depois que o banco voltar, nesta ordem:
1. `alter function public.fn_pode_ver_tipo_anexo(smallint) security invoker;` (o arquivo 018 já
   diz invoker; o banco ainda está definer) e `node scripts/testar-rls-arquivos.mjs`.
2. Limpar sobras de QA interrompido: `node scripts/cenario-qa-metas.mjs limpar`; e dados com os
   marcadores exatos `__qa_vendas__` (grupos, filiais, produto, cotação, orçamentos).
3. Apagar duas concessões de teste que ficaram no Operador de QA (`financeiro`, `metas`) —
   ids `b9d66a5e-3279-437f-8360-b31b1c2ff5d1` e `e29b57d3-4177-4395-9aa8-d8bcf6895138` em
   `permissoes_pagina`. Sem isso `testar-rls-financeiro` falha no preparo.
4. Rodar todas as suítes: `testar-rls`, `-vendas`, `-financeiro`, `-historico-sac`, `-rotinas`,
   `-relatorios`, `-arquivos`, `testar-fila-email`, `testar-formulario-publico`.
5. `EXPLAIN ANALYZE` nas 4 consultas do kanban (`v_kanban_cotacoes`, `v_kanban_pedidos`,
   `v_kanban_entregas`) e otimizar antes de produção (trocar subconsulta por linha por join
   agregado; `count: 'planned'` ou contagem em função).
6. **Redesenho visual**: trabalho em andamento está no branch `wip/redesenho-visual` (não no
   main). Retomar com o agente de design; `/vendas` ainda não foi redesenhada.
7. **Deploy:** o conector da Vercel funciona (conta pessoal, 7 projetos; ainda não há projeto
   `app-megabox`). Criar o projeto a partir do repositório, região `gru1`, variáveis de ambiente.
   O cron da fila de e-mail a cada 5 min exige plano **Pro** (senão trocar por `pg_cron`).

## 1. Onde o projeto está (~80%)

| Frente | Situação |
|---|---|
| Mapeamento e specs (771 WF) | pronto |
| Banco | migrations **001–019** — as 12 fatias do plano + ajustes (016 equipe financeira, 015 views de vendas, 018 arquivos, 019 e-mail). Cada fatia com suíte de RLS |
| Carga do Bubble | clientes (4.734), filiais (5.716), contatos (8.091), produtos (133), usuários (31, sem senha; 21 inativos bloqueados), cotações (5.948), pedidos (2.229), ICMS (729). **Bloqueados** sem `BUBBLE_API_KEY`: itens de cotação, orçamentos, propostas, entregas |
| Telas | entrar, início, cadastros (com filial/contato), produtos, vendas (kanban), SAC, financeiro, metas, relatórios, rotinas, formulário público |
| Arquivos | buckets privados + URL assinada; cópia do CDN do Bubble pronta |
| E-mail | fila + Resend, **desligado** (`EMAIL_MODO=registro`) |
| Revisão de segurança | feita; 1 achado médio (redirect pós-login) corrigido |
| Visual | redesenho em andamento no branch `wip/redesenho-visual` |
| Deploy / corte | não iniciado |

Verificações: `npm run verify`; as suítes `scripts/testar-rls*.mjs`; `python tools/conferir-cobertura.py`.
Aplicar migration: `node scripts/aplicar-migration.mjs db/0XX.sql --seco`, depois sem `--seco`,
`get_advisors` contra `specs/05`. `db/` é a fonte da verdade.

**Coordenação de agentes (aprendido na marra):** um único `next dev` na porta 3000; nenhum agente
mata processo alheio; nenhum agente roda QA em repetição contra a instância Micro; teste nunca apaga
`auditoria`.

## 2. O que depende do dono

1. **`BUBBLE_API_KEY` no `.env`** (chave de admin) — destrava orçamentos, propostas e entregas.
2. **Reiniciar o Supabase** (e, de preferência, subir para Small).
3. **Plano da Vercel** (Pro para o cron de e-mail) e **Resend** (domínio verificado,
   `RESEND_API_KEY`, `EMAIL_REMETENTE`) para ligar o envio.
4. As dúvidas de negócio em `specs/04-duvidas.md` (B1–B4, equipe financeira, status que conta como
   venda, fórmulas de Cotação/Prospecção, leitura do SAC).
5. Rotação de credenciais (seção 4 abaixo).

---

## 3. O que depende de decisão sua

Nada disso é técnico; é negócio. `specs/04-duvidas.md` tem o detalhe e a recomendação padrão de
cada item — nenhum fica parado esperando.

### 3.1 Quatro pendências de negócio

| # | Pergunta |
|---|---|
| B1 | **Medido:** 120 CNPJs repetidos entre filiais ativas e válidas, 11 produtos repetidos no grupo. Decidido por ora: índice comum + `v_clifor_documento_duplicado` como fila de limpeza; o `unique` entra quando a fila esvaziar. Falta você decidir **quem limpa** e **qual filial fica** em cada par. |
| B2 | Qual é a regra oficial de `RankingVendas`? (`relatorios` e `metas` calculam diferente) |
| B3 | Em que escala estão `ComissaoPadrao` e `ComissaoMetaBatida` — 0,10 é 10% ou 0,10%? |
| B4 | Os 3% da comissão do vendedor são fixos para todos, ou vêm do nível? |

B5 (fórmulas de ICMS e PIS/COFINS) **foi resolvida em 25/09** pela leitura do mapa — ver
`specs/04-duvidas.md` §1.

### 3.2 Permissões (B6) — respondida com dado

As 14 linhas de permissão do `ConfigSistema` foram extraídas e estão em `specs/04-duvidas.md` §1.1.
Uma coisa para você olhar: **"Cliente / Fornecedor" é concedido aos quatro perfis**, ou seja, a
todo usuário ativo — inclusive escrita no cadastro. A migration 005 reproduz isso fielmente, porque
apertar regra durante a migração é decisão sua, não minha.

### 3.3 Antes da Fase B

**Expor quatro data types na Data API do Bubble** (Settings → API): `Tbl.SacProtocolo`,
`Tbl.SacHistorico`, `Tbl.PesquisaNps` e `Tbl.PesquisaRespostas`. Hoje só 29 dos 34 tipos estão
expostos, e sem eles a fatia 10 sai sem dado. `Tbl.Chamado` não migra.

### 3.4 Uma pergunta que nasceu do cruzamento de duas specs

**As duas origens de conta a pagar.** A confirmação da entrega cria uma CP de 3% (vencimento no dia
5 do mês seguinte) e o fechamento da meta cria **outra** (vencimento em 10 dias). O `02` impede a
duplicata por constraint, mas não decide se o fechamento deve criar conta nova ou consolidar as que
a entrega já gerou. É conversa com o Financeiro.

---

## 4. Segurança — não espera o corte

`specs/00-achados-de-seguranca.md` tem o detalhe e a fonte no mapa de cada item.

**Rotação barata, faça quando quiser:** senha do banco Supabase e `service_role` (o banco está
vazio, nada quebra). As duas foram coladas em chat, o que é o mesmo motivo pelo qual a chave da API
do Bubble já estava na lista.

**Rotação com efeito colateral:** rotacionar a senha de aplicativo do Gmail **derruba o envio de
e-mail do Bubble na hora**. Ou se combina uma janela, ou se espera a fatia 5 enviar pelo app novo.

**Não espera:** `User.PassTexto` guarda a senha em texto puro numa tabela com regra `everyone` e
Data API aberta. Toda senha atual deve ser considerada comprometida; nenhuma migra.

**Pendente de confirmação no `.env`:** o host do pooler em `DATABASE_URL` (o prefixo varia entre
`aws-0` e `aws-1`). Copie de Project Settings → Database → Connection string → Transaction pooler.

---

## 5. Ambiente

**Plugins instalados** (escritos à mão em `~/.claude/plugins/installed_plugins.json`;
**precisa reiniciar o Claude Code** para carregar): `superpowers 6.4.1`, `security-guidance 2.0.8`,
`claude-security 0.11.0`, `pr-review-toolkit`, `claude-md-management`, `typescript-lsp`,
`context7`, `playwright`. Os dois últimos são MCP e pedem autorização.

**Ponytail não está instalado** e não pode ser instalado por um agente (clonar marketplace de
terceiro é integração de código não confiável). É `/plugin marketplace add DietrichGebert/ponytail`
em sessão interativa. O `CLAUDE.md` já registra isso.

**MCP:** Supabase conectado e funcionando. Vercel pede autorização.

**Capturas do Bubble:** 80 PNGs em `design/capturas/`, fora do git porque contêm dado real de
cliente e o repositório é público. Ver `design/LEIA-ME.md`.

---

## 6. O retrato do app atual, em cinco frases

Serve para calibrar expectativa: migrar isto não é traduzir, é reconstruir.

1. **Autorização é CSS.** O controle é `link_disabled` no item de menu; a proteção de sessão que
   existe vem do próprio Bubble, não do app.
2. **Dinheiro é calculado no navegador** e gravado direto no banco por auto-binding, sem workflow,
   sem transação e sem autoria — inclusive alíquota de ICMS, valor de comissão e vencimento.
3. **Histórico é o oposto de auditoria:** editar sobrescreve o texto e troca o autor; excluir é
   físico.
4. **Há regra de negócio escondida em condicional de input** (a meta coletiva, com piso e
   multiplicador fixos no elemento) e **em JavaScript embutido** (os relatórios, que somam no
   cliente — e a aba "Outros Relatórios" está com erro de timeout em produção).
5. **Existe código morto em escala:** rotinas de migração já cumpridas, telas duplicadas com regras
   divergentes, filtros que não filtram, botões sem workflow e workflows vazios. Cada spec tem uma
   §8.1 dizendo o que **não** portar.
