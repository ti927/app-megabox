# Estado do projeto e onde retomar

Atualizado em 30/09/2026, fim da sessão. Este arquivo existe para que a próxima sessão comece sem reler nada.

---

## 0. RETOMAR AQUI (fim da sessão de 30/09/2026)

**No ar:** https://app-megabox-1qwe.vercel.app (push no `main` = deploy). Logins de teste de todos os
usuários ativos em `.env` (`LOGIN_<NOME>`, fora do git). `main` verificado: 549+ testes, suítes de RLS
verdes (vendas 100, financeiro 120, relatórios 105, início 16, histórico-SAC 95, metas-relatórios 26),
build ok. Já no `main`: menu em branco, escala 75% como 100%, seletor de período em PT em todas as
telas, relatórios de metas (Análise de Entregas, Relatório Anual) e popup de entregas com Excel/PDF,
financeiro denso (17 linhas visíveis em 1920×1080), correção de open-redirect no login.

**Branches WIP — interrompidos no fim da sessão, NÃO revisados, não fazer merge sem checar**
(`tsc`, `eslint`, `vitest`, suítes de RLS, migration em `--seco` + `get_advisors` contra `specs/05`):

| Branch | Commit | Conteúdo |
|---|---|---|
| `w/perf` | aae93e5 | aviso global de carregamento (`componentes/aviso-acao*`), `lib/vendas-ficha.ts`, lentidão de carrinho/vencedor/envio de proposta, erro "Parte desta cotação não carregou", lista de cotações sumindo após enviar proposta. Migration 028 reservada. |
| `w/proposta` | c09bb63 | tela única proposta → pedido → entregas (caminhões), prazos de pagamento claros; `db/029_pedido_saldo_rateio.sql` |
| `w/sac2` | 1ef6728 | metas trimestrais do Apoio Comercial (4 indicadores 25/25/30/20; item 4 = 10/5/5), ocorrências, alertas de chamado parado; `db/030_sac_apoio_comercial.sql`, `lib/sac-apoio.ts`, `scripts/testar-rls-sac-apoio.mjs`. Falta tela e relatório trimestral. |
| `w/fin2` | 66fbb61 | cores do financeiro (sem mover elementos) |
| `w/e2e` | 37304e2 | `scripts/e2e-fluxo-completo.mjs` com LURE CLIENTE / LURE FORNECEDOR, tempos por etapa, duplicar pedido sem duplicar financeiro |
| `cargas-final` | 6f97bd0 | carregadores finais (worktree `../wt-cargas`, 5 commits à frente do `main`) |

Ordem sugerida de merge: perf → proposta → fin2 → sac2 → e2e (roda por último, contra tudo) → cargas-final.
Migration 031 livre.

**Cargas** (idempotentes por `bubble_id`, rodar de novo continua): historicos 22.802 / 44.612;
contas_pagar 3.367; baixas 2.611; cobrancas 551; pesquisa_respostas 20 / 463. Depois do histórico:
`fn_historico_espelho_recalcular` (alimenta "Última conversa"), respostas SAC/NPS e a cópia dos
arquivos de entrega (`node tools/copiar-arquivos-bubble.mjs --so entregas --paralelo 1 --lote 200 --pausa-lote 60`).

**Investigar:** 4.443 de 10.790 `proposta_itens` apontam para orçamentos com ICMS/PIS = 0 (provável
artefato da carga); entregas antigas com comissão absurda (até R$ 19,6 mi) distorcem o Relatório Anual.

**Decisão do dono:** estilo do pódio de metas (A/B/C/D).

**Com o usuário:** Supabase Micro → Small; domínio `app-megabox.vercel.app` em Settings → Domains;
rotacionar segredos (chave do Bubble colada no chat, Gmail etc.); Vercel Pro para o cron de e-mail;
configurar Resend (hoje `EMAIL_MODO=registro`, nada é enviado). Celular fica para a fase posterior
(`specs/03` §10).

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
| Deploy | Vercel, equipe **Lure TI's projects**, projeto **`app-megabox-1qwe`** ligado a `ti927/app-megabox` (push no `main` = deploy). Variáveis de produção e preview configuradas; `vercel.json` força `gru1`. (Existe também um projeto `app-megabox` vazio, sem git, criado antes do import — pode ser apagado.) |
| Corte | checklist em `docs/plano-de-corte.md` |

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
