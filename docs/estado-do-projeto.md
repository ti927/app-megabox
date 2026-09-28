# Estado do projeto e onde retomar

Atualizado em 28/09/2026. Este arquivo existe para que a próxima sessão comece sem reler nada.

---

## 1. Onde o projeto está

**Fase A (fundação) pronta; Fase D em andamento — fatias 0 a 3 com banco aplicado, fatia 2 com
dado carregado e tela em construção.**

| Frente | Situação |
|---|---|
| `mapa/`, `specs/00..04`, `specs/paginas/*` (14 specs, 771/771 WF) | pronto |
| `specs/05-avisos-do-advisor.md` | veredito de cada aviso do `get_advisors` |
| App Next.js 15 (`app/`, `lib/`, `componentes/`, `middleware.ts`) | login, casca, menu por permissão, `/inicio`, `/sem-acesso` |
| Autorização em 3 camadas | middleware (sessão) → `exigirAcesso(slug)` no servidor → menu (só cosmético) |
| Banco `megabox` | migrations **001–006** aplicadas: **44 tabelas, 44 com RLS** |
| Carga (Fase C) | cadastro carregado em 28/09: **4.734 grupos, 5.716 filiais, 8.091 contatos**; 150 linhas descartadas por campo obrigatório vazio; 4.512 grupos com filial principal (222 não têm filial) |
| Repositório | `ti927/app-megabox`, público, `main` publicado |

### Migrations

| Arquivo | Conteúdo |
|---|---|
| `db/001_fundacao.sql` | usuários, perfis, departamentos, páginas, permissões, auditoria, log de acesso |
| `db/002_acesso_leitura.sql` | `fn_minhas_paginas()` (a view daqui foi derrubada pela 004) |
| `db/003_listas_fixas.sql` | 22 listas fixas (option sets), semeadas opção a opção |
| `db/004_usuarios_leitura.sql` | sigilo de CPF/RG por **privilégio de coluna**, `fn_meu_cadastro()` |
| `db/005_paginas_de_configuracao.sql` | `paginas.tipo` (menu × engrenagem), alvos `cadastros` e `produtos` com a matriz B6 |
| `db/006_cadastro.sql` | fatias 2 e 3: cliente/fornecedor, filiais, contatos, anexos, produtos |

Aplicar migration nova: `node scripts/aplicar-migration.mjs db/00X.sql --seco` (roda e desfaz),
depois sem `--seco`; em seguida `get_advisors` e `node scripts/testar-rls.mjs`. **`db/` é a fonte
da verdade** — o registro `supabase_migrations` do painel só tem a 005 e não deve ser usado para
saber o que está aplicado.

### Verificações que valem sempre

```
python tools/conferir-cobertura.py        → 771 workflows, 0 não citados
npm run verify                            → typecheck + lint + teste
node scripts/testar-rls.mjs               → o banco se comporta como 02 §7 promete
node scripts/testar-acesso.mjs            → autorização ponta a ponta com conta de Operador
node tools/carregar-supabase.mjs --relatorio --baixar   → o que a carga faria, sem gravar
```

### O que a carga ensinou (e está tratado no carregador)

A Data API do Bubble fala por **nome de exibição**, o mapa decompilado fala por **id**. Daí:
campo vem como `cpo.CnpjCpf` e não `cpo_cnpjcpf_text`; option set vem pelo rótulo (`"CIF
Incluso"`); campo vazio é omitido do JSON; a chave do Paraná no option set de UF é `pf` (erro de
digitação no Bubble); enum do Postgres exige o valor em minúscula. E o modo relatório só presta se
conferir o que o banco recusa (`not null`, enum, FK), não apenas a tradução. Detalhe em
`specs/04-duvidas.md` §1.1.

---

## 2. O próximo passo

1. **Fatia 2 — tela-modelo `/cadastros`**: fixa o padrão de 5 arquivos por tela (`page.tsx` ·
   `loading.tsx` · `tela.tsx` · `dialogo.tsx` · `acoes.ts`) que as outras copiam. QA por captura
   (claro, escuro, 390px) antes de dar por pronta.
2. **Fatia 3 — carga de produtos**: estender o de-para do carregador (as três ligações puras não
   têm `bubble_id` e precisam de mecanismo próprio).
3. **Carregar os usuários/vendedores** e recarregar o cadastro: `grupos_clifor.carteira_id` aponta
   para o vendedor, e com só 3 usuários no banco novo **nenhum** grupo ficou com carteira (2.445
   tinham). A carga é idempotente por `bubble_id`: rodar de novo depois preenche. Usuário do Bubble
   não traz senha (texto puro, comprometida) — cada um recebe convite e cria a sua.
4. **Fila de limpeza**: `v_clifor_documento_duplicado` tem 261 documentos em 559 filiais. Enquanto
   não esvaziar, o `unique` de documento não entra.
5. Fatias 4 a 12, na ordem de `specs/02` §11.

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
