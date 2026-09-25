# Estado do projeto e onde retomar

Atualizado em 25/09/2026. Este arquivo existe para que a próxima sessão comece sem reler nada.

---

## 1. Onde o projeto está

**Mapeamento e planejamento fechados. Nenhuma linha de aplicação escrita ainda** — e isso é
proposital: a regra 2 do `CLAUDE.md` proíbe tocar no banco antes do mapeamento, e `specs/03` define
a ordem a partir daqui.

| Frente | Situação |
|---|---|
| `mapa/` — app Bubble decompilado | pronto (herdado) |
| `specs/bubble/02-telas-e-design.md` — referência visual das 14 telas | pronto |
| `specs/paginas/*.md` — 14 specs funcionais | **pronto — 771/771 workflows cobertos** |
| `specs/00-achados-de-seguranca.md` | pronto |
| `specs/01-visao-geral.md` | pronto |
| `specs/02-modelo-de-dados-proposto.md` | pronto — 58 tabelas |
| `specs/03-plano-de-construcao.md` | pronto — 6 fases |
| `specs/04-duvidas.md` | pronto — 226 itens consolidados |
| `.env` | preenchido (fora do git) |
| Banco Supabase `megabox` | criado, **sem tabelas** |
| App Next.js | **não iniciado** ← próximo passo |
| Repositório GitHub | `ti927/app-megabox`, público |

### A prova de nada perdido

```
python tools/conferir-cobertura.py
→ Workflows no mapa (em escopo): 771
→ Nao citados em nenhuma spec:   0
```

Rode isso sempre que uma spec mudar. Páginas de backup (`vendas_bkp`, `vendas_bkp2`, `metas_bkp`,
`cadastros_old`, `testes`) estão fora de escopo e o script já as ignora.

---

## 2. O próximo passo

`specs/03-plano-de-construcao.md`, **Fase A** — fundação do repositório e do ambiente: Next.js 15 +
TypeScript, `vercel.json` com `"regions": ["gru1"]` desde o primeiro commit, `npm run verify`
(typecheck + lint + teste) e `scripts/qa.mjs`.

Depois, na ordem: extração do Bubble (Fase B) → carga (Fase C) → as 12 fatias verticais (Fase D,
a fatia 2 é a tela-modelo) → desempenho (E) → corte (F).

---

## 3. O que depende de decisão sua

Nada disso é técnico; é negócio. `specs/04-duvidas.md` tem o detalhe e a recomendação padrão de
cada item — nenhum fica parado esperando.

### 3.1 Quatro pendências bloqueiam a carga

| # | Pergunta |
|---|---|
| B1 | CNPJ/CPF deve ser único? E nome de produto dentro do grupo? (o Bubble não tem unicidade em lugar nenhum, então é provável que haja duplicata) |
| B2 | Qual é a regra oficial de `RankingVendas`? (`relatorios` e `metas` calculam diferente) |
| B3 | Em que escala estão `ComissaoPadrao` e `ComissaoMetaBatida` — 0,10 é 10% ou 0,10%? |
| B4 | Os 3% da comissão do vendedor são fixos para todos, ou vêm do nível? |

B5 (fórmulas de ICMS e PIS/COFINS) **foi resolvida em 25/09** pela leitura do mapa — ver
`specs/04-duvidas.md` §1.

### 3.2 Antes da Fase A

**O conteúdo atual das linhas de permissão do `ConfigSistema`**: quem hoje enxerga cada página.
Só existe no banco do Bubble, e a fatia 0 depende disso.

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
