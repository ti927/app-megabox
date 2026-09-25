# Estado do projeto e onde retomar

Fechado em 24/09/2026, ao fim da sessão de mapeamento. Este arquivo existe para que a próxima
sessão comece sem reler nada: diz o que está pronto, o que falta, e qual é o próximo comando.

---

## 1. Onde o projeto está

**Fase 1 do `docs/plano-de-migracao.md` (mapeamento) está praticamente fechada.** Fase 2 (modelo e
carga) não começou. Nenhuma linha de aplicação existe ainda — e isso é proposital: a regra 2 do
`CLAUDE.md` proíbe tocar no banco antes do mapeamento estar completo.

| Frente | Situação |
|---|---|
| `mapa/` — app Bubble decompilado | pronto, herdado |
| `specs/paginas/*.md` — 14 specs funcionais | 13 prontas, 1 em produção |
| `specs/00-achados-de-seguranca.md` | pronto |
| `specs/01-visao-geral.md` | **não começado** |
| `specs/02-modelo-de-dados-proposto.md` | **não começado** ← próximo passo |
| `specs/03-plano-de-construcao.md` | **não começado** |
| `specs/04-duvidas.md` | **não começado** |
| Banco Supabase `megabox` | criado, **sem tabelas** |
| App Next.js | **não iniciado** |
| Repositório GitHub | publicado em `ti927/app-megabox`, `main` |

### O que esta sessão produziu

14 commits. 11.035 linhas de spec funcional em 13 arquivos, cobrindo **747 dos 771 workflows em
escopo** do app Bubble. Mais o consolidado de segurança.

| Spec | Workflows cobertos | Dúvidas |
|---|---|---|
| `vendas.md` | 167 | 44 |
| `financeiro.md` | 76 | 24 |
| `historico.md` | 96 (58 página + 38 `tool.Historico`) | 20 |
| `cadastros.md` | 84 (página + 4 reusables) | 23 |
| `casca-e-configuracao.md` | 68 (6 reusables) | 24 |
| `enderecos-e-contatos.md` | 61 (7 reusables) | 22 |
| `financeiro-reusables.md` | 36 (3 reusables) | 26 |
| `rotinas.md` | 39 | 23 |
| `formularios-publicos.md` | 35 (2 páginas) | 23 |
| `metas.md` | 33 | 40 |
| `sac.md` | 32 (27 página + 5 reusables) | 18 |
| `relatorios.md` | 10 | 32 |
| `inicio-e-acesso.md` | 9 (5 páginas) | 24 |

Toda spec tem a mesma estrutura de 11 seções e uma tabela §11 de cobertura conferida contra
`mapa/00-inventario.md`.

---

## 2. O que falta para fechar o mapeamento

**Uma frente estava em execução quando a sessão acabou:** `specs/paginas/vendas-reusables.md`,
cobrindo os 3 reusables operacionais do fluxo de vendas. Verifique se o arquivo existe:

```
ls specs/paginas/vendas-reusables.md
```

- **Se existir:** confira estrutura e cobertura, e commite.
- **Se não existir:** refaça a frente. São 25 workflows em `mapa/reusable-pop.AnexaNf.md` (9),
  `mapa/reusable-pop.AddEdita_Produtos.md` (6) e `mapa/reusable-pop.DuplicarPedido.md` (10).

Os 24 ids que faltam hoje, pelo checksum:

```
AnexaNf          bTbux bTcBK bTcRH bTcZR bTcon bTcrF bTepV bTiEL0 bUErF0
AddEdita_Produtos bTiax bTibH bTibP bTibg bTigj bTigv
DuplicarPedido   bUAUk bUAVr bUAVy bUAWJ bUAWh bUAaL bUAaT bTzte bUAgB
```

### Como rodar o checksum

O script vive fora do repositório (era temporário). Ele compara todo `#### WF <id>` de `mapa/`
com os ids citados em qualquer arquivo de `specs/paginas/`, ignorando as páginas de backup
(`vendas_bkp`, `vendas_bkp2`, `metas_bkp`, `cadastros_old`, `testes`). Vale recriá-lo em
`tools/conferir-cobertura.py` e versioná-lo — é a prova de nada perdido que o plano pede, e será
usada de novo na carga.

Resultado esperado quando fechar: `771 no mapa, 0 não citados`.

---

## 3. Próximo passo, em ordem

### 3.1 `specs/02-modelo-de-dados-proposto.md` — a porta para tudo

É o gargalo: sem ele não há migration, e sem migration não há tela. Entra nele:

- Esquema Postgres novo, tabela por tabela, com tipo, chave, índice e FK.
- De-para `Bubble → novo`, campo por campo, para a carga. Os 34 data types estão em
  `mapa/data-types.md`; os 36 option sets em `mapa/option-sets.md`.
- `bubble_id` único em toda tabela (carga idempotente e recarga segura).
- Option set vira tabela com `chave_bubble`; lista do Bubble vira tabela de ligação.
- Campo calculado vira view ou função SQL.
- `numeric` em todo dinheiro, nunca `float` (`CLAUDE.md` regra 10).

Cada spec de página já entregou sua §9.5 com as tabelas que o módulo precisa — o trabalho é
reconciliar as 13 listas num esquema só, não inventar de novo.

**Armadilhas do banco atual que o de-para tem de tratar** (levantadas pelas specs):

| Armadilha | Onde |
|---|---|
| `ContasPagar` mora na tabela `tbl_contasreceber1` | `mapa/data-types.md` |
| `Tbl.ProdutosTipo` mora em `tbl_produtosgrupo`, e `Tbl.ProdutosGrupo` em `tbl_produtossubgrupo` | idem |
| `cpo.Liberado` tem id `cpo_bloqueado_boolean` — **semântica invertida** | `cadastros.md` §8 |
| `cpo.NãoFazContratoParceria` tem id `cpo_fazcontratoparceria_boolean` — idem | idem |
| `GrupoCliFor.Observacoes` tem id `cpo_codcliente_text`; **não existe código de cliente** | idem |
| `Pedido.Importado` tem id `cpo_pedidoenviado_boolean` (campo reaproveitado) | `rotinas.md` [DÚVIDA 13] |
| ICMS do orçamento é calculado sobre `TotalBonusExtra`, campo **excluído** → ICMS e PIS/COFINS sempre 0 | `financeiro-reusables.md` §5 |
| Vários campos de valor resolvidos pelo decompilador com o nome de outro data type | `vendas.md`, nota inicial |
| Relação grupo↔endereço existe em duplicidade (FK + lista); as telas leem a **lista** | `enderecos-e-contatos.md` §8 |
| `cpo.Principal` é gravado em toda filial e **nunca lido** — endereço padrão nunca existiu | idem |
| `Opt.ParcelasReceber` inconsistente: `49dd` sem `diasprazonumero`, `12dd` duplicada | `financeiro-reusables.md` [DÚVIDA 13] |
| `CR.ValorTotal` recebe a venda cheia em **cada** parcela (com 4 parcelas, soma 4×) | idem §5 |
| `CR.StatusFinanceiro` nunca é atribuído na criação | idem |

### 3.2 `specs/04-duvidas.md` — consolidação

**343 itens `[DÚVIDA]`** espalhados pelas 13 specs, cada um já com recomendação padrão. O trabalho
é agrupar por tema, remover repetição (o plugin `1558770956236` aparece em 5 specs; a divergência
de `RankingVendas` em 2) e marcar as que **bloqueiam** a primeira migration.

Decisão do dono do projeto registrada nesta sessão: **as dúvidas serão respondidas por um arquivo
vindo do Claude in Chrome**, com acesso ao editor do Bubble. Até então vale a recomendação padrão
de cada spec. Ao receber esse arquivo, cruzar com `04-duvidas.md` e promover as respostas para as
specs de origem.

As que bloqueiam a migration, por já terem sido identificadas:

1. Índice único de `enderecos_clifor.documento` (CNPJ/CPF) e de `produtos (nome, grupo_id)` — o
   Bubble não tem unicidade em lugar nenhum, então provavelmente há duplicatas. A carga precisa de
   relatório de conflito **antes**.
2. Qual é a regra oficial de `MetasMensais.RankingVendas` — `relatorios` e `metas` calculam
   diferente, e a de `relatorios` conta a comissão duas vezes quando há vendedor substituto.
3. Escala de `ComissaoPadrao`/`ComissaoMetaBatida`: 0,10 ou 10.
4. Os 3% da comissão do vendedor são fixos para todos, ou vêm de `Tbl.NiveisVendedores`.
5. Fórmulas reais de ICMS e PIS/COFINS (as do Bubble estão quebradas, ver tabela acima).

### 3.3 `specs/01-visao-geral.md` e `specs/03-plano-de-construcao.md`

`01` é derivável das 14 specs: módulos, perfis e fluxos ponta a ponta. `03` depende de `02`:
ordem das frentes, extração, carga em lote e corte.

### 3.4 Só então: primeira migration

Vertical slice, conforme `CLAUDE.md` regra 5: migration → RLS → server actions → tela → teste.
Nunca todas as migrations primeiro.

---

## 4. Pendências fora do código

### 4.1 Segurança — não espera o corte

`specs/00-achados-de-seguranca.md` tem o detalhe e a fonte no mapa. Em resumo, **cinco credenciais
a rotacionar** e **todas as senhas de usuário a considerar comprometidas** (`User.PassTexto` é
texto puro numa tabela com regra `everyone` e Data API aberta; `reset_pw` não tem workflow, logo
ninguém nunca trocou a própria senha). Nada disso foi feito ainda.

### 4.2 Plugins

Instalados nesta sessão, na mão, escrevendo em `~/.claude/plugins/installed_plugins.json`
(backup em `installed_plugins.bak.json` no scratchpad da sessão, que é volátil):

`security-guidance 2.0.8` · `claude-security 0.11.0` · `pr-review-toolkit 1.0.0` ·
`claude-md-management 1.0.0` · `typescript-lsp 1.0.0` · `context7 1.0.0` · `playwright 1.0.0`
(+ `superpowers 6.4.1`, que já estava)

**Precisa reiniciar o Claude Code** para carregar. `context7` e `playwright` são MCP e vão pedir
autorização.

**Ponytail não foi instalado.** O clone de `DietrichGebert/ponytail` é bloqueado como integração de
código não confiável — o plugin instala hooks e skills que alteram o comportamento do agente. Tem
de ser o usuário:

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

O `CLAUDE.md` descreve Ponytail como parte do fluxo. Enquanto ele não estiver instalado, a seção
"Plugins" do `CLAUDE.md` está descrevendo ferramental que não existe — que é o achado nº 3 do
próprio `docs/plano-de-migracao.md` se repetindo. Ou instale, ou ajuste o `CLAUDE.md`.

### 4.3 MCP da Vercel

Pede autorização e não pode ser autorizado em sessão não interativa. Rode `/mcp` numa sessão
interativa.

### 4.4 Git

`main` publicado em `ti927/app-megabox`. **Os 12 commits desta sessão ainda não foram enviados** —
o push inicial passou, os seguintes não foram tentados. Rode:

```
git push
```

Duas notas sobre o repositório: ele é **público** por decisão registrada do dono em 24/09/2026, e
`mapa/option-sets.md` contém a senha de aplicativo do Gmail em texto puro, commitada desde
`fcacaf2`. A decisão foi publicar como está; o que neutraliza é rotacionar a credencial (§4.1).

---

## 5. O retrato do app atual, em cinco frases

Serve para calibrar expectativa: migrar isto não é traduzir, é reconstruir.

1. **Autorização é CSS.** Nenhuma página tem guarda de sessão; o controle é `link_disabled` no item
   de menu. Qualquer rota abre por URL, logado ou não.
2. **Dinheiro é calculado no navegador** e gravado direto no banco por auto-binding, sem workflow,
   sem transação e sem autoria — inclusive alíquota de ICMS, valor de comissão e vencimento.
3. **Histórico é o oposto de auditoria:** editar sobrescreve o texto e troca o autor; excluir é
   físico.
4. **Há regra de negócio escondida em condicional de input** (a meta coletiva, com piso e
   multiplicador fixos no elemento) e **em JavaScript embutido** (os relatórios, ~90 KB que somam no
   cliente a partir de um `innerText`).
5. **Existe código morto em escala:** rotinas de migração já cumpridas, telas duplicadas com regras
   divergentes, filtros que não filtram, botões sem workflow e workflows vazios. Cada spec tem uma
   §8.1 dizendo o que **não** portar.
