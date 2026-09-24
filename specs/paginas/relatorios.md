# Spec funcional — página `relatorios` (Bubble `bUBLO`)

Fonte: `mapa/pagina-relatorios.md` (32 elementos · 10 workflows · 26 ações · 13 condicionais · 4 blocos HTML · 1 estado customizado · 0 popups · 0 repeating groups · 0 tabelas).
Apoio: `mapa/data-types.md` (`Tbl.Entregas`, `Tbl.MetasMensais`, `Tbl.OrcFornecedoresCotacao`, `Tbl.EnderecosCliFor`, `Tbl.ProdutosModelo`, `Tbl.ConfigSistema`, `User`),
`mapa/option-sets.md` (`Opt.Etapas`, `Opt.TipoMeta`, `Opt.MenuPaginas`, `Opt.PerfilUsuario`, `Opt.UFs`), `mapa/integracoes.md`,
`mapa/reusable-tool.Cabecalho.md`, `mapa/reusable-tool.MenuPaginas.md`, `mapa/pagina-metas.md` (WF bTwAv — mesmo cálculo de ranking).

**Se esta spec e o mapa discordarem, o mapa manda.**

Glossário usado nesta spec:
- **Entrega** = registro de `Tbl.Entregas` (`tbl_entregas`). É a linha de faturamento: um produto, uma quantidade, um destino, um valor de venda e um valor de comissão.
- **Entrega faturada** = entrega com `StatusEntrega = Opt.Etapas.Financeiro`. É o único status que entra em qualquer relatório desta página.
- **Comissão MegaBox** = `Entregas.cpo.ValorComissaoBruto` (id `cpo_valorcomissao_number`; o mapa dos workflows escreve `cpo.valorcomissao`).
- **OF** = `Tbl.OrcFornecedoresCotacao` (`tbl_orcamentfornecedores`) — o orçamento do fornecedor vencedor, de onde vêm produto, endereço de origem (filial do fornecedor) e endereço de destino (filial do cliente).
- **Matriz** = a tabela cruzada (pivot) montada dentro do bloco HTML, no navegador, a partir de um texto único gerado pelo Bubble.

---

## 1. Propósito e quem usa

Tela "Relatórios". Uma só página com **três abas** (botões no topo) e, dentro da terceira aba, **três modelos de relatório** escolhidos por radio:

1. **Relatório de Cotação** — bloco HTML autocontido (`HTML C`, 54.434 caracteres). Nenhum workflow o alimenta.
2. **Relatório de Prospecção** — bloco HTML autocontido (`HTML D`, 35.680 caracteres). Nenhum workflow o alimenta.
3. **Outros Relatórios** — os três relatórios de entrega efetivamente construídos em Bubble:
   - **Produtos** — "Relatório de Entregas (Produto X Cliente X Fornecedor)";
   - **Clientes** — "Relatório de Entregas (Clientes X Mês)";
   - **Fornecedores** — "Relatório de Entregas (Fornecedores X Mês)".

O usuário escolhe um **intervalo de entrega** (date range) e clica em **Pesquisar**; o Bubble busca as entregas faturadas do período, achata tudo num **texto único** e o entrega ao bloco HTML, que monta a matriz no navegador.

A página também dispara, **no carregamento e sem mostrar nada**, o recálculo do ranking de metas (WF bUBYW) — ver §3.6 e §8.3.

**Quem usa:** Diretoria e comercial. Não há, em lugar nenhum da página, filtro por vendedor: **todo relatório é da empresa inteira**.

### Controle de acesso de fato (só no navegador)

- **A página não tem nenhuma verificação.** O WF de carregamento (bUBWj) não checa sessão, perfil nem departamento; não há redirecionamento de usuário deslogado. Quem digitar `/relatorios` entra e clica em Pesquisar.
- O **único** controle é o link do menu: em `tool.MenuPaginas`, `Link A` nasce com `link_disabled=True` e só é habilitado por três condicionais, se a linha de `Tbl.ConfigSistema` com `QualPagina = Opt.MenuPaginas.Relatórios` listar o **departamento** (`QuaisDeptos`), o **perfil** (`QuaisPerfis`) ou o **próprio usuário** (`QuaisUsuarios`) do usuário logado.
- A opção `Opt.MenuPaginas.Relatórios` é a **única do option set sem `ordem`, sem `hierarquia` e sem `DepartamentosAcessiveis`** (só `p_gina: "relatorios"`). Ou seja: nem o atributo de hierarquia que as outras páginas declaram existe aqui — e, mesmo onde existe, ele **não é usado** para bloquear nada. O menu ordena por `ordem` ascendente; com `ordem` vazia, a posição de "Relatórios" na lista é indefinida.
- **Um Operador (`hierarquia = 4`) vê tudo.** Se a linha de `ConfigSistema` da página incluir o departamento dele, o link abre; e as buscas dos WFs bUBaV/bUBcv/bUBfH não filtram por `QualVendedor`. Ele lê comissão, valor de venda, cliente, fornecedor e produto de **todos os vendedores** no período. Não há nada na página que o impeça.
- Pior: `Tbl.Entregas`, `Tbl.OrcFornecedoresCotacao`, `Tbl.EnderecosCliFor`, `Tbl.ProdutosModelo` e `Tbl.MetasMensais` têm regra de privacidade `everyone` com `view_all` e `search_for` = true, e o app **expõe a Data API**. O dado é público mesmo para quem não tem login. Ver §7.

---

## 2. Estrutura da tela

### 2.1 Layout geral (de cima para baixo)

1. **Cabeçalho** `tool.Cabecalho A` (bUBQR) — USA `tool.Cabecalho`; fornece o estado `var_showmenu_`.
2. **Menu lateral** `tool.MenuPaginas A` (bUBQS) — oculto ao carregar; visível quando `tool.Cabecalho A.var_showmenu_ = true`.
3. **Barra de abas** `Group G` (bUEsN), três botões que só alternam visibilidade de grupos:
   | Botão | id | Texto | Mostra | WF |
   |---|---|---|---|---|
   | `Button A` | bUEsB | "Relatório de Cotação" | `Gp Cotação` | bUEsr |
   | `Button C` | bUEya | "Relatório de Prospecção" | `Gp Prospecção` | bUEyh |
   | `Button B` | bUEsH | "Outros Relatórios" | `Gp Relatatórios` (sic, com erro de digitação no nome do elemento) | bUEtE |
   Cada botão fica com a cor primária e borda inferior de 5px quando o grupo correspondente está visível (6 condicionais no total, mais 1 de hover no `Button A`).
4. **`Gp Cotação`** (bUEsV) — **visível ao carregar**; contém só `HTML C`. É a aba padrão.
5. **`Gp Relatatórios`** (bUEsf) — oculto ao carregar. Contém:
   - `Group C` (bUBQT) — barra de filtros:
     - `Group E` → `Text B` "Modelo de relatório" + `Group D` → **`rad relatorios`** (bUBcj): RadioButtons de 3 colunas, opções estáticas `Produtos` / `Clientes` / `Fornecedores`, **default "Clientes"**.
     - `Group F` → `Text E` "Intervalo de entrega" + **`RangePicker A`** (bUBQX), plugin `1648823245313x509054419018711040` v1.3.1 (date range picker), locale `pt-BR`, valor inicial = `UrlParam("datainicio"):to_range(UrlParam("datafim"))`, rótulo formatado `dd/mm/yy - dd/mm/yy`.
     - `gp pesquisar` (bUBgn) → `Text F` (bUBgt) "🔍 Pesquisar" — **código morto**: o grupo é oculto ao carregar e **nenhum workflow o exibe**; sua condicional só troca a cor de fundo, e a de `Text F` só troca o texto para "⏳ Aguarde". Ver §8.1.
     - **`Button D`** (bUFBl) "Pesquisar" — é o botão que realmente funciona.
   - `gp relat produto` (bUBQM) — `group_type = "text"`, nome interno "Group Dashboard". Visível **só** quando `rad relatorios = "Produtos"`. Contém `Text C` (título fixo "Relatório de Entregas (Produto X Cliente X Fornecedor)"), o bloco **`relat por produto`** e o texto **`txt relat produtos`**.
   - `gp relat clientes` (bUBen) — `group_type = "text"`. Visível quando `rad relatorios ≠ "Produtos"` (ou seja, atende **Clientes e Fornecedores**). Contém `Text D` (título variável), o bloco **`relat por cliente`** e o texto **`txt relat clientes`**.
6. **`Gp Prospecção`** (bUEuT) — oculto ao carregar; contém só `HTML D`.
7. **Reusables órfãos:** `pop.ConfigSistema A` (bUBWM) e `pop.CadastroUsuarios A` (bUBWL) estão na página, mas **nenhum workflow desta página os exibe** — quem os abre é `tool.MenuConfig` (WFs bTgrB e bToKV0), que **não está nesta página**. São peso morto que carrega as buscas internas dos dois reusables. Ver §8.1.

### 2.2 Popups e reusables

Não há popups próprios (inventário: 0 popups, 0 repeating groups, 0 tabelas). Reusables instanciados: `tool.Cabecalho`, `tool.MenuPaginas`, `pop.ConfigSistema` (órfão), `pop.CadastroUsuarios` (órfão).

### 2.3 Parâmetros de URL

| Parâmetro | Tipo | Quem escreve | Quem lê |
|---|---|---|---|
| `datainicio` | date | bUBWp (carregamento, se vazio), bUBWx (date range aplicado) | `RangePicker A`, buscas dos WFs bUBaV/bUBcv/bUBfH, ranking bUBYW |
| `datafim` | date | bUBWq (carregamento, se vazio), bUBWx | idem |

Não existe parâmetro para a aba escolhida nem para o modelo de relatório: **a tela não é linkável no estado em que está**. Recarregar volta para a aba "Cotação" e para o modelo "Clientes", e apaga o resultado da matriz.

### 2.4 Estados

- **Estado de página** `var_pesquisando_` (boolean): ligado no primeiro passo e desligado no último passo do mesmo workflow de pesquisa (bUBaz/bUBbE, bUBcx/bUBdC, bUBfM/bUBfR). Como as ações são síncronas e o grupo que o exibiria está oculto, **ele nunca aparece na tela**.
- **Estado no usuário** `User.cpo.UltimoDateRange` (date_range): o período é gravado no próprio usuário a cada aplicação do date range (bUBWw) e relido no carregamento seguinte (bUBWp/bUBWq). É o **mesmo campo usado pela página `financeiro`** (WF bTpRy) — mudar o período num lado muda o padrão do outro.

### 2.5 O que cada bloco HTML faz

O decompilador guarda só o tamanho do HTML, não o conteúdo (`html(N chars)`). O que se pode afirmar pelo mapa:

| Bloco | id | Tamanho | Dentro de | Recebe dado de | O que é |
|---|---|---|---|---|---|
| `HTML C` | bUErv | 54.434 ch. | `Gp Cotação` | **nada** | Aba "Relatório de Cotação". Sem data source Bubble e sem workflow; é HTML+JS autocontido que busca os próprios dados (a Data API do app está exposta) ou exibe conteúdo estático. **[DÚVIDA 1]** |
| `relat por produto` | bUBNe | 35.456 ch. | `gp relat produto` | `txt relat produtos` (id DOM `matrix-data`) | Renderizador da matriz Produto × Cliente × Fornecedor |
| `relat por cliente` | bUBdO | 35.650 ch. | `gp relat clientes` | `txt relat clientes` (id DOM `clientes-matrix-data`) | Renderizador da matriz Cliente × Mês **e** Fornecedor × Mês (o mesmo bloco serve aos dois modelos) |
| `HTML D` | bUEyT | 35.680 ch. | `Gp Prospecção` | **nada** | Aba "Relatório de Prospecção". Mesma situação do `HTML C`. **[DÚVIDA 1]** |

**O contrato entre o Bubble e o HTML** (esta é a arquitetura da página, e é o ponto que a migração tem de substituir):

1. O workflow do botão Pesquisar faz um `DisplayGroupData` num grupo cujo `group_type` é **`text`**. O "dado" do grupo é uma **string única**.
2. Essa string é produzida por `:format_as_text(content=…, delimiter="⏎")`: uma linha por entrega, campos entre colchetes separados por `" | "`, o **último separador sem espaços** (`]|[`).
3. Um `Text` filho exibe `{Parent}` (a string inteira) com `unique_id` = `matrix-data` (produtos) ou `clientes-matrix-data` (clientes/fornecedores). No DOM do Bubble isso vira um elemento identificável.
4. O bloco HTML irmão lê o texto desse elemento, quebra por linha e por `|`, tira os colchetes, agrupa e soma **em JavaScript, no navegador**, e desenha a tabela cruzada. Os 35 KB de HTML são esse parser + pivot + (provavelmente) a exportação.

Não há na página nenhuma ação de download, `OpenURL`, plugin de PDF/planilha ou envio de e-mail: **se existe exportação, ela está dentro do JavaScript do bloco HTML** (ex.: gerar CSV/XLSX por `Blob` ou copiar a tabela). **[DÚVIDA 2]**

---

## 3. Dados

Origem única e comum aos três relatórios construídos em Bubble: `Search(Tbl.Entregas: cpo.DtEntrega ≥ UrlParam("datainicio") AND cpo.DtEntrega ≤ UrlParam("datafim") AND cpo.StatusEntrega = Opt.Etapas.Financeiro)`.

Observações que valem para os três:
- **Sem ordenação.** Nenhuma das buscas declara `sort`; a ordem das linhas é a ordem do Bubble (criação). Quem ordena/agrupa é o JavaScript do bloco HTML.
- **Sem filtro de vendedor, cliente, fornecedor ou produto.** O único filtro é o período + status.
- **Só `Opt.Etapas.Financeiro`.** As etapas `Concluído` e `Cancelado` também têm `EntregaConcluida = true` no option set, mas **não entram**; quem já passou de "Financeiro" para "Concluído" some do relatório. **[DÚVIDA 3]**
- Se `datainicio`/`datafim` estiverem vazios (usuário sem `UltimoDateRange`), o Bubble ignora a restrição vazia e a busca traz **todas as entregas faturadas da base**. Ver §8.3.

### 3.1 Aba "Relatório de Cotação" (`Gp Cotação` / `HTML C`)

Nenhum dado Bubble. Sem data source, sem workflow, sem parâmetro. O conteúdo está dentro dos 54 KB de HTML. **[DÚVIDA 1]**

### 3.2 Aba "Relatório de Prospecção" (`Gp Prospecção` / `HTML D`)

Idem. **[DÚVIDA 1]**

### 3.3 Outros Relatórios → **Produtos** (WF bUBaV, ação bUBab)

- **Lista:** uma linha por **entrega faturada** do período.
- **Filtrado por:** `DtEntrega` no intervalo **e** `StatusEntrega = Financeiro`.
- **Agrupado por:** nada no Bubble — o agrupamento Produto × Cliente × Fornecedor acontece no JavaScript de `relat por produto`.
- **Ordenado por:** nada no Bubble.
- **Colunas da linha achatada**, na ordem exata do `format_as_text`:

  | # | Conteúdo | Expressão (mapa) |
  |---|---|---|
  | 1 | Produto (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualProdutoModelo.NomeModelo:to_uppercase` |
  | 2 | Quantidade | `Entrega.QtdEntrega:format_number(decimal_place=2)` |
  | 3 | Venda bruta unitária | `Entrega.ValorVendaBrutoUnitario:format_number(decimal_place=2)` |
  | 4 | Comissão unitária | `Entrega.ValorComissaoUnitario:format_number(decimal_place=2)` |
  | 5 | Fornecedor — nome da filial de origem (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualEnderecoOrigem.NomeEndereco:to_uppercase` |
  | 6 | UF de destino (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualEnderecoDestino.QualUfOpt:display:to_uppercase` |
  | 7 | Cliente — nome da filial de destino (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualEnderecoDestino.NomeEndereco:to_uppercase` |
  | 8 | Venda bruta total da entrega | `Entrega.ValorVendaBruto:format_number(decimal_place=2)` |
  | 9 | Comissão total da entrega | `Entrega.ValorComissaoBruto:format_number(decimal_place=2)` |
  | 10 | Link do pedido | `{Page.Website Home}historico?numpedido={Entrega.NumeroEntrega}` (campo `cpo_numeropedido_text`) |

- **Alvo:** `DisplayGroupData` em `gp relat produto`; o texto aparece em `txt relat produtos` (`unique_id = matrix-data`).
- Note que **não há data** nesta linha: o relatório de produtos não pode ser quebrado por mês.

### 3.4 Outros Relatórios → **Clientes** (WF bUBcv, ação bUBdB)

- **Lista:** uma linha por entrega faturada do período (mesma busca).
- **Agrupado por:** cliente × mês, no JavaScript (título "Relatório de Entregas (Clientes X Mês)").
- **Colunas:**

  | # | Conteúdo | Expressão |
  |---|---|---|
  | 1 | Cliente — nome da filial de destino (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualEnderecoDestino.NomeEndereco:to_uppercase` |
  | 2 | UF de destino (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualEnderecoDestino.UF:to_uppercase` — **campo texto livre**, não o option set |
  | 3 | Data de entrega | `Entrega.DtEntrega:format_date("dd/mm/yyyy")` — é o que permite ao JS montar a coluna "mês" |
  | 4 | Comissão | `Entrega.ValorComissaoBruto:format_number(decimal_place=2)` |
  | 5 | Link do pedido | `{Page.Website Home}historico?numpedido={Entrega.NumeroEntrega}` |

- **Alvo:** `gp relat clientes` / `txt relat clientes` (`unique_id = clientes-matrix-data`).
- **Só comissão.** Não traz quantidade nem valor de venda: a matriz Cliente × Mês soma **comissão MegaBox**, não faturamento.
- **Inconsistência com §3.3:** aqui a UF sai de `EnderecosCliFor.cpo.UF` (texto), lá de `cpo.QualUfOpt` (option set `Opt.UFs`). Os dois campos coexistem na tabela e podem divergir. **[DÚVIDA 4]**

### 3.5 Outros Relatórios → **Fornecedores** (WF bUBfH, ação bUBfN)

Idêntico a §3.4, trocando destino por **origem**:

| # | Conteúdo | Expressão |
|---|---|---|
| 1 | Fornecedor — nome da filial de origem (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualEnderecoOrigem.NomeEndereco:to_uppercase` |
| 2 | UF de origem (maiúsculas) | `Entrega.QualOrcamentoFornecedor.QualEnderecoOrigem.UF:to_uppercase` |
| 3 | Data de entrega | `dd/mm/yyyy` |
| 4 | Comissão | `Entrega.ValorComissaoBruto:format_number(decimal_place=2)` |
| 5 | Link do pedido | `historico?numpedido=…` |

**Alvo:** o **mesmo** grupo e o **mesmo** bloco HTML do relatório de Clientes (`gp relat clientes`, `clientes-matrix-data`). Só o título (`Text D`) muda por condicional. Consequência: ao trocar o radio de "Clientes" para "Fornecedores" **sem clicar em Pesquisar de novo**, o título muda mas a matriz continua sendo a de clientes. Ver §8.3.

### 3.6 Ranking de metas (WF bUBYW) — grava, não exibe

- **Lê:** `Tbl.MetasMensais` com `DataFim ≥ datafim AND DataInicio ≤ datainicio` (metas que **contêm** o período), separadas por `TipoMeta = Regular` e `TipoMeta = Substituição`, ordenadas por `DataInicio`.
- **Escreve:** o campo `MetasMensais.cpo.RankingVendas` de cada uma delas.
- **Não há nenhum elemento nesta página que mostre ranking, meta ou vendedor.** O resultado só é lido pela página `metas` (`rpg ranking vendedores`, textos bTvrZ/bTzYS0/bTzYj0/bTvsZ, exibido como percentual com 1 casa).

---

## 4. Funcionalidades e regras de negócio

### 4.1 Carregamento da página (WF bUBWj — PageLoaded, 4 ações)

1. **bUBWk** — ação `AAC` do plugin `1558770956236x539499438875082750` v1.0.0. O mapa não diz o que é; o mesmo plugin roda no PageLoaded de `inicio`, `vendas`, `financeiro`, `historico` e `metas`. **[DÚVIDA 5]**
2. **bUBWp** — `SÓ SE UrlParam("datainicio") está vazio`: `ChangePage` para a própria página acrescentando `datainicio = CurrentUser.UltimoDateRange:min` com hora `00:00:00`, preservando os demais parâmetros.
3. **bUBWq** — `SÓ SE UrlParam("datafim") está vazio`: idem para `datafim = CurrentUser.UltimoDateRange:max` com `23:59:59`.
4. **bUBWr** — `TriggerCustomEvent` do evento `bUBYW` (CalculaRanking).

Regras que decorrem disso:
- São **duas navegações** seguidas na mesma página (dois `ChangePage`), não uma; o carregamento roda mais de uma vez e, a cada vez, o passo 4 volta a gravar no banco.
- Se o usuário **nunca aplicou um período** (`UltimoDateRange` vazio), os dois parâmetros continuam vazios e **não há período nenhum**: o date range abre vazio e a pesquisa varre a base inteira.
- Não há valor padrão de calendário (mês corrente, por exemplo) como existe em `financeiro`.

### 4.2 Escolha da aba (WFs bUEsr, bUEtE, bUEyh — 9 ações)

Três workflows simétricos, cada um com um `ShowElement` e dois `HideElement`, sem nenhuma outra lógica:

| WF | Clique | Mostra | Esconde |
|---|---|---|---|
| bUEsr | `Button A` "Relatório de Cotação" | `Gp Cotação` (bUEsz) | `Gp Relatatórios` (bUEsx), `Gp Prospecção` (bUEzD) |
| bUEtE | `Button B` "Outros Relatórios" | `Gp Relatatórios` (bUEtJ) | `Gp Cotação` (bUEtK), `Gp Prospecção` (bUEzF) |
| bUEyh | `Button C` "Relatório de Prospecção" | `Gp Prospecção` (bUEyr) | `Gp Relatatórios` (bUEyt), `Gp Cotação` (bUEyy) |

A aba não vai para a URL e não é lembrada.

### 4.3 Escolha do período (WF bUBWv — 2 ações)

Disparado pelo evento `AAd` ("período aplicado") do `RangePicker A`:
1. **bUBWw** — `MakeChangeCurrentUser`: `UltimoDateRange = This:get_AAF:min :to_range( This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59) )`.
   Repare: o **fim** é normalizado para 23:59:59, mas o **início gravado no usuário não é normalizado para 00:00:00** (só o da URL é). O valor guardado e o valor usado divergem no horário.
2. **bUBWx** — `ChangePage` na própria página gravando `datainicio` = `min` às `00:00:00` e `datafim` = `max` às `23:59:59`, preservando os demais parâmetros.

Trocar o período **recarrega a página** — ou seja, apaga a matriz já exibida e volta para a aba "Cotação". O usuário precisa clicar de novo em "Outros Relatórios" e em "Pesquisar".

### 4.4 Escolha do modelo de relatório

`rad relatorios` (bUBcj): opções estáticas `Produtos` / `Clientes` / `Fornecedores`, default `Clientes`. **Não tem workflow** — só governa condicionais:
- `gp relat produto` visível ⟺ valor = "Produtos";
- `gp relat clientes` visível ⟺ valor ≠ "Produtos";
- `Text D` = "Relatório de Entregas (Clientes X Mês)" se "Clientes", "Relatório de Entregas (Fornecedores X Mês)" se "Fornecedores" (fora isso, o texto literal "Relatorio").

### 4.5 Pesquisar (WFs bUBaV, bUBcv, bUBfH — 9 ações)

Três workflows no **mesmo** botão `Button D`, diferenciados pela condição sobre `rad relatorios`. Cada um tem a mesma forma:

1. `SetCustomState` `var_pesquisando_ = true` (bUBaz / bUBcx / bUBfM);
2. `DisplayGroupData` no grupo de texto, com a busca + `format_as_text` descritos em §3.3/§3.4/§3.5 (bUBab / bUBdB / bUBfN);
3. `SetCustomState` `var_pesquisando_ = false` (bUBbE / bUBdC / bUBfR).

| WF | Condição (`rad relatorios`) | Grupo alvo | `unique_id` do texto |
|---|---|---|---|
| bUBaV | `= "Produtos"` | `gp relat produto` | `matrix-data` |
| bUBcv | `= "Clientes"` | `gp relat clientes` | `clientes-matrix-data` |
| bUBfH | `= "Fornecedores"` | `gp relat clientes` | `clientes-matrix-data` |

Não há validação de período, limite de linhas, paginação, mensagem de "nenhum resultado" nem tratamento de erro.

### 4.6 Recalcular ranking de metas (WF bUBYW — evento customizado «CalculaRanking», 2 ações)

Disparado **só** por bUBWr, no carregamento. Duas ações `ChangeListOfThings` sobre `Tbl.MetasMensais`:

- **bUBYX — metas regulares.** Alvo: `Search(MetasMensais: DataFim ≥ datafim AND DataInicio ≤ datainicio AND TipoMeta = Regular; sort DataInicio)`.
  Grava, para cada meta: `RankingVendas = Search(Entregas: StatusEntrega = Financeiro AND DtEntrega ≥ datainicio AND DtEntrega ≤ datafim AND QualVendedor = meta.QualVendedor):ValorComissaoBruto:sum ÷ meta.ValorMeta`.
- **bUBYb — metas de substituição.** Alvo: o mesmo filtro com `TipoMeta = Substituição`.
  Grava: `RankingVendas = Search(Entregas: … AND QualVendedorSubstituto = meta.QualVendedor):ValorComissaoBruto:sum ÷ meta.ValorMeta`.

**Divergência com a página `metas` (WF bTwAv) — a mesma coluna, duas regras diferentes:**

| | `relatorios` (bUBYW) | `metas` (bTwAv) |
|---|---|---|
| Quais metas | `DataFim ≥ datafim AND DataInicio ≤ datainicio` (a meta **contém** o período) | `DataFim ≤ datafim AND DataInicio ≥ datainicio` (a meta está **contida** no período) |
| Meta fechada | sem filtro | exige `QualMetaFechada is_empty` (bUAhB) |
| Entregas da meta regular | `QualVendedor = vendedor` | `QualVendedor = vendedor AND QualVendedorSubstituto is_empty` |

Consequências, todas gravadas no banco:
1. Abrir `relatorios` **sobrescreve** o `RankingVendas` que a página `metas` calculou, com outro conjunto de metas e outra regra.
2. Como bUBYX não exclui as entregas que têm substituto, a mesma comissão é contada **duas vezes**: no ranking do vendedor titular (bUBYX) e no do substituto (bUBYb).
3. Metas já fechadas (`QualMetaFechada` preenchido) são reescritas aqui, ao contrário de `metas`.

### 4.7 Exportar / enviar

**Não existe nesta página, do lado Bubble.** Nenhuma ação de `OpenURL`, download, geração de PDF, `ScheduleAPIEvent` ou envio de e-mail. O que existe é o link por linha para `historico?numpedido=…`, embutido no texto e renderizado pelo HTML. Os relatórios por e-mail que o sistema tem hoje estão na página `financeiro` (§4.7 de `specs/paginas/financeiro.md`: "Relatório contas a pagar" WF bTpsH, que agenda o backend `EnviarEmailsGeral` bTnvb0, e "Relatório contas a receber" WF bUFEH, vazio) — **não são desta página e não devem ser repetidos aqui**. Se há exportação em `relatorios`, ela está dentro do JavaScript dos blocos HTML. **[DÚVIDA 2]**

### 4.8 Workflow vazio (WF bUFBb)

`ButtonClicked` em `El[Text F]` — **zero ações**. Era o botão "Pesquisar" antigo (dentro de `gp pesquisar`), substituído por `Button D` (ids bUFBb/bUFBl, criados na mesma leva). Código morto.

---

## 5. Cálculos e valores

O Bubble desta página **não calcula nenhum total**. Ele só formata números linha a linha; toda soma, subtotal e total geral das matrizes está dentro do JavaScript dos blocos HTML, que o mapa não captura. O que o mapa dá, literal:

| Valor | Fórmula exata (mapa) | Observação |
|---|---|---|
| `RankingVendas` (meta regular) — WF bUBYW/bUBYX | `Search(Entregas: StatusEntrega = Financeiro AND DtEntrega ≥ datainicio AND DtEntrega ≤ datafim AND QualVendedor = meta.QualVendedor):ValorComissaoBruto:sum ÷ meta.ValorMeta` | Fração (exibida em `metas` como percentual, 1 casa). **Divisão por zero** se `ValorMeta = 0` ou vazio |
| `RankingVendas` (meta de substituição) — bUBYb | idem com `QualVendedorSubstituto = meta.QualVendedor` | soma a comissão **inteira** da entrega ao substituto |
| Quantidade (col. 2, relatório de Produtos) | `Entrega.QtdEntrega:format_number(decimal_place=2)` | vira **texto** antes de chegar ao JS |
| Venda bruta unitária (col. 3) | `Entrega.ValorVendaBrutoUnitario:format_number(decimal_place=2)` | idem |
| Comissão unitária (col. 4) | `Entrega.ValorComissaoUnitario:format_number(decimal_place=2)` | idem |
| Venda bruta da entrega (col. 8) | `Entrega.ValorVendaBruto:format_number(decimal_place=2)` | idem |
| Comissão da entrega (col. 9 de Produtos; col. 4 de Clientes/Fornecedores) | `Entrega.ValorComissaoBruto:format_number(decimal_place=2)` | idem |
| Data de entrega (Clientes/Fornecedores) | `Entrega.DtEntrega:format_date("dd/mm/yyyy")` | é a **única** fonte do "mês" da matriz; fuso do navegador |
| Início do período | `UltimoDateRange:min :change_hours(0):change_minutes(0):change_seconds(0)` (bUBWp, bUBWx) | fuso do navegador |
| Fim do período | `UltimoDateRange:max :change_hours(23):change_minutes(59):change_seconds(59)` (bUBWq, bUBWx) | idem |
| Período gravado no usuário | `min` **sem** normalização + `max` às 23:59:59 (bUBWw) | diverge do que vai para a URL |

Riscos de exatidão a não reproduzir:
- **Dinheiro vira string e volta a número no navegador.** `format_number(decimal_place=2)` arredonda antes de somar, e o app está em `pt_br`: se a saída usar `.` de milhar e `,` decimal, o `parseFloat` do JavaScript lê "1.234,56" como `1.234`. Qualquer erro de separador silencia num total errado. **[DÚVIDA 6]**
- No app novo, todos esses valores são `numeric` e **as somas são feitas no Postgres**, nunca no navegador (§8.4, §9.4).

---

## 6. Integrações e backend workflows

| O quê | Onde | Detalhe |
|---|---|---|
| Plugin `1648823245313x509054419018711040` v1.3.1 (date range picker) | `RangePicker A` (bUBQX) | evento `AAd` = período aplicado (dispara WF bUBWv); `AAF` = período escolhido; `AAD` = valor inicial; `AAG` = "pt-BR"; `AAf` = rótulo `dd/mm/yy - dd/mm/yy`. É o mesmo plugin do filtro de data de `financeiro` |
| Plugin `1558770956236x539499438875082750` v1.0.0, ação `AAC` | bUBWk (PageLoaded) | finalidade não identificada; roda no PageLoaded de 5 páginas **[DÚVIDA 5]** |
| Blocos HTML (4) | bUErv, bUBNe, bUBdO, bUEyT | JavaScript embutido: parser do texto, pivot e renderização; possivelmente a exportação. Conteúdo fora do mapa **[DÚVIDA 1, 2]** |
| Backend workflows | — | **nenhum**. A página não agenda nada em `backend-workflows.md` |
| API Connector | — | **nenhuma chamada**. (A API `EstudoDePedidos` bTpnn/bTpno, declarada em `integracoes.md` com POST sem URL, **não é usada em página nenhuma** do app — ver §8.1) |
| E-mail / PDF / planilha | — | nenhuma ação Bubble. Ver §4.7 |
| Data API do Bubble | app inteiro | exposta (`integracoes.md`: "expõe Data API: True") — é a única forma plausível de os blocos `HTML C`/`HTML D` obterem dados **[DÚVIDA 1]** |

---

## 7. Segurança e privacidade

1. **Página sem guarda.** Nenhuma checagem de sessão, perfil ou departamento no carregamento (WF bUBWj). O controle é só o `link_disabled` do menu; a URL direta funciona.
2. **Relatório da empresa inteira para qualquer um que entre.** As buscas dos WFs bUBaV/bUBcv/bUBfH não têm filtro de vendedor, cliente ou fornecedor. Quem abre a página vê comissão, valor de venda, produto, cliente e fornecedor de **todos** os vendedores no período — inclusive um Operador (`hierarquia = 4`).
3. **Dados públicos na Data API.** `Tbl.Entregas`, `Tbl.OrcFornecedoresCotacao`, `Tbl.EnderecosCliFor`, `Tbl.ProdutosModelo`, `Tbl.MetasMensais` e `Tbl.NiveisVendedores` têm regra `everyone` com `view_all` e `search_for` = true. Com a Data API exposta, **qualquer pessoa, mesmo deslogada**, extrai a base comercial completa — margens, carteira de clientes e de fornecedores. É o risco mais grave desta tela e não se resolve na tela: resolve-se com RLS no banco novo.
4. **Escrita no banco a partir de uma tela de leitura.** Abrir `/relatorios` grava em `MetasMensais.RankingVendas` (WF bUBYW), sem nenhuma permissão exigida. Qualquer usuário — ou qualquer robô que carregue a página — altera a apuração de metas e, por consequência, a base de premiação dos vendedores.
5. **Dado pessoal/comercial em texto solto no DOM.** A base achatada fica num `Text` visível no HTML da página (`matrix-data` / `clientes-matrix-data`), acessível a qualquer extensão do navegador e a qualquer `view-source`.
6. **Links por linha** apontam para `{Page.Website Home}historico?numpedido=…` — a página `historico` também não tem guarda própria.
7. **Preferência gravada no usuário** (`UltimoDateRange`) é inofensiva, mas é compartilhada com `financeiro`.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto

- **WF bUFBb** (`ButtonClicked` em `Text F`): zero ações. Apagar.
- **`gp pesquisar` (bUBgn) + `Text F` (bUBgt)**: grupo oculto ao carregar que **nenhum workflow exibe**; as duas condicionais (fundo e "⏳ Aguarde") nunca aparecem. Era o botão de pesquisa antigo. Apagar junto com o WF bUFBb.
- **Estado `var_pesquisando_`**: ligado e desligado dentro do mesmo workflow síncrono e lido só pelo grupo morto acima. Nunca produz efeito visível. No app novo o indicador de carregamento vem do estado real da requisição.
- **`pop.ConfigSistema A` (bUBWM) e `pop.CadastroUsuarios A` (bUBWL)**: instanciados na página sem nenhum workflow que os abra (quem abre é `tool.MenuConfig`, ausente aqui). São 470 elementos de reusable carregados à toa. Não portar para esta rota.
- **API `EstudoDePedidos` (bTpnn / chamada bTpno)**: declarada no API Connector (POST sem URL) e **não referenciada em nenhuma página**. Não migrar.
- **Texto `Text D` = "Relatorio"**: valor literal só visível quando o radio não é "Clientes" nem "Fornecedores" — estado impossível com as três opções atuais.

### 8.2 Duplicação

- **Três workflows para um botão.** bUBaV, bUBcv e bUBfH são o mesmo procedimento com um `content` diferente. No app novo é **uma** ação com o tipo de relatório como parâmetro.
- **Clientes e Fornecedores compartilham grupo, texto e bloco HTML**, mudando só o campo de endereço (destino × origem). São a mesma consulta com o eixo trocado.
- **CalculaRanking existe em duas páginas** (`relatorios` bUBYW e `metas` bTwAv) com **regras diferentes** para o mesmo campo `MetasMensais.RankingVendas` (§4.6). Duas verdades para a apuração de meta. No app novo existe **uma** definição, e ela é uma consulta, não uma coluna.
- **`UltimoDateRange`** é escrito por esta página (bUBWw) e por `financeiro` (bTpRy) com normalizações de hora diferentes.
- **Os quatro blocos HTML somam ~161 KB** de JavaScript, sendo que `relat por produto` (35.456) e `relat por cliente` (35.650) são quase do mesmo tamanho — provavelmente o mesmo parser/pivot copiado e ajustado. Um componente de tabela cruzada resolve os dois.

### 8.3 Gambiarras

- **Banco de dados via `innerText`.** Achatar o resultado de uma busca num texto com `[valor] | [valor]` e `⏎`, colar esse texto num `Text` com `unique_id` e deixar o JavaScript do bloco HTML parsear é um canal de dados frágil: qualquer nome de produto, endereço ou cliente que contenha `|`, `[` ou `]` quebra a linha inteira, e o separador do último campo é diferente dos outros (`]|[` em vez de `] | [`). Substituir por JSON tipado vindo do servidor.
- **Número formatado antes de somar.** Dinheiro e quantidade viram string com 2 casas antes de chegar ao JavaScript (§5). Arredondamento antes da soma e risco de separador decimal.
- **Relatório de leitura que grava no banco.** O PageLoaded dispara `CalculaRanking`, que faz dois `ChangeListOfThings` em massa em `MetasMensais`. Além do efeito colateral indevido (§7.4), cada item do alvo dispara uma busca própria em `Entregas` — é um N+1 executado no navegador, escrevendo registro a registro, sem transação: fechar a aba no meio deixa metade das metas com ranking novo e metade com o antigo.
- **Dois `ChangePage` em sequência** no carregamento (bUBWp, bUBWq) para preencher dois parâmetros — a página recarrega duas vezes e o ranking é recalculado a cada recarga.
- **Período pode ficar vazio.** Usuário sem `UltimoDateRange` pesquisa a base inteira sem aviso (§4.1). Precisa de padrão no servidor (mês corrente) e de limite.
- **Trocar o período recarrega e perde o resultado**, jogando o usuário de volta na aba "Cotação" e no modelo "Clientes".
- **Título mente.** Trocar o radio de "Clientes" para "Fornecedores" muda o título (`Text D`) por condicional, mas a matriz exibida continua sendo a anterior até o clique em "Pesquisar" — o usuário lê "Fornecedores X Mês" sobre dados de clientes.
- **Nada é linkável.** Aba e modelo não vão para a URL; só o período vai.
- **Só `Opt.Etapas.Financeiro`.** Entregas que avançaram para "Concluído" desaparecem do relatório (§3, **[DÚVIDA 3]**).
- **UF de duas fontes** (`QualUfOpt` no relatório de produtos, `UF` texto nos demais) — **[DÚVIDA 4]**.

### 8.4 Otimizações (o ponto central)

**Relatório agregado não baixa linha para somar no navegador.** Hoje, para uma matriz Cliente × Mês, o app traz **todas** as entregas faturadas do período com quatro níveis de join resolvidos um a um (`Entrega → OF → EnderecoDestino`, `→ ProdutoModelo`, `→ EnderecoOrigem`), concatena tudo num texto e soma em JavaScript. Num ano de operação isso é a base inteira trafegando para renderizar uma tabela de algumas dezenas de células.

No app novo:

| Hoje (navegador) | No app novo |
|---|---|
| Busca + `format_as_text` do relatório de Produtos (bUBab) | **função SQL** `fn_rel_entregas_produto(p_inicio, p_fim)` chamada por RPC/server action — devolve já agregado por produto × cliente × fornecedor |
| Busca + `format_as_text` do relatório de Clientes (bUBdB) | **função SQL** `fn_rel_entregas_cliente_mes(p_inicio, p_fim)` — pivot por mês feito com `date_trunc` + agregação |
| Busca + `format_as_text` do relatório de Fornecedores (bUBfN) | **função SQL** `fn_rel_entregas_fornecedor_mes(p_inicio, p_fim)` — a mesma, com o eixo trocado |
| Pivot e somas em JavaScript dentro do bloco HTML | agregação no Postgres (`sum(numeric)`), formatação só na renderização |
| `ChangeListOfThings` em `MetasMensais.RankingVendas` (bUBYX, bUBYb) | **view** `vw_ranking_metas` — campo calculado deixa de ser coluna gravada; nada é escrito ao abrir o relatório |
| N+1: uma busca em `Entregas` por meta | um `left join lateral`/`group by` único |
| Base inteira no DOM | payload agregado (dezenas de linhas) em JSON |

Outras otimizações:
- **Desnormalizar o caminho do endereço.** `Entrega → QualOrcamentoFornecedor → QualEnderecoOrigem/Destino` é o join mais caro e mais repetido. No modelo novo, `entregas` guarda `endereco_origem_id` e `endereco_destino_id` diretamente (a entrega já é filha do orçamento vencedor), e uma view `vw_entregas_faturadas` materializa produto, cliente, fornecedor e UFs.
- **UF única.** Uma coluna `uf` referenciando a tabela de UFs (o option set `Opt.UFs` vira tabela), eliminando o par `UF` texto × `QualUfOpt`.
- **Índices:** `entregas(status, dt_entrega)` (todas as consultas desta página começam por aí), `entregas(vendedor_id, dt_entrega)` e `entregas(vendedor_substituto_id, dt_entrega)` para o ranking.
- **Exportação no servidor.** CSV/XLSX gerado por rota de servidor a partir da mesma função SQL, com streaming — não montar arquivo no navegador.
- **Filtros que a tela deveria ter e não tem:** vendedor, cliente, fornecedor, produto, UF. Todos viram parâmetros da função SQL e da URL.
- **Status configurável:** o conjunto de etapas que conta como "faturado" vira parâmetro (hoje é `Financeiro` fixo) — ver **[DÚVIDA 3]**.

---

## 9. Proposta para o app novo

### 9.1 Rotas

- `app/(app)/relatorios/page.tsx` — Server Component. Lê `searchParams` com zod e mantém os nomes atuais `datainicio`/`datafim` (compatibilidade de links e hábito), acrescentando o que hoje não é linkável:
  `aba` (`cotacao` | `prospeccao` | `outros`, padrão `outros`), `modelo` (`produtos` | `clientes` | `fornecedores`, padrão `clientes`) e os filtros novos (`vendedor`, `cliente`, `fornecedor`, `produto`, `uf`).
  Período padrão **no servidor**: preferência do usuário, senão mês corrente (`America/Sao_Paulo`, primeiro dia 00:00:00 até último dia 23:59:59) — nunca período vazio.
- `app/(app)/relatorios/exportar/route.ts` — GET que devolve CSV/XLSX do mesmo conjunto de parâmetros, gerado no servidor.
- Layout/middleware checa sessão e permissão de página (tabela `permissoes_pagina`, que substitui a regra de `ConfigSistema` + `Opt.MenuPaginas`).

### 9.2 Componentes

- `RelatoriosTabs` — as três abas (§4.2), com a aba na URL.
- `FiltrosRelatorio` — date range (pt-BR, `dd/mm/yy`), seletor de modelo (segmented control equivalente ao `rad relatorios`) e os filtros novos; tudo escreve na URL via `router.replace`.
- `MatrizCruzada` — **um** componente de tabela cruzada que atende os três relatórios (linhas, colunas, células, subtotais por linha e por coluna, total geral, sticky header/first column, célula clicável). Substitui `relat por produto` + `relat por cliente` e os dois parsers de texto.
- `RelatorioProdutos` (Produto × Cliente × Fornecedor), `RelatorioClienteMes`, `RelatorioFornecedorMes` — casca fina sobre `MatrizCruzada`.
- `BotaoExportar` (CSV/XLSX) — chama a rota do §9.1.
- `RelatorioCotacao` e `RelatorioProspeccao` — a reescrever depois que **[DÚVIDA 1]** for respondida; enquanto não for, não portar o HTML como está.
- Célula/linha clicável abre `/historico?numpedido=…`, como hoje.

### 9.3 Server actions / rotas

| Ação | Regra |
|---|---|
| `getRelatorioEntregas({ modelo, inicio, fim, filtros })` | Server action de **leitura**; valida o intervalo (obrigatório, máximo configurável), checa permissão e chama a função SQL do modelo. Devolve JSON agregado, nunca linhas cruas |
| `exportarRelatorioEntregas({ modelo, inicio, fim, filtros, formato })` | Mesma função SQL, saída CSV/XLSX por streaming; registra quem exportou o quê (dado comercial sensível) |
| `salvarPeriodoPreferido(range)` | Substitui `User.UltimoDateRange` (bUBWw); grava em `user_preferences`, uma preferência por usuário, compartilhada com `financeiro` só se assim for decidido |
| `getRankingMetas({ inicio, fim })` | **Somente leitura**, sobre `vw_ranking_metas`. O carregamento de `/relatorios` **não escreve nada** (mata bUBYW) |

Nenhuma action desta página escreve em `metas_mensais`, `entregas` ou qualquer tabela de negócio.

### 9.4 Consultas / views SQL

Base comum — resolve de uma vez o caminho `entrega → orçamento fornecedor → endereços/produto` que hoje é percorrido linha a linha:

```sql
create view vw_entregas_faturadas as
select
  e.id,
  e.numero_entrega,
  e.dt_entrega,
  date_trunc('month', e.dt_entrega)::date        as mes,
  e.vendedor_id,
  e.vendedor_substituto_id,
  e.qtd                                          as qtd_entrega,      -- numeric
  e.valor_venda_bruto_unitario,                                       -- numeric(14,2)
  e.valor_comissao_unitario,                                          -- numeric(14,2)
  e.valor_venda_bruto,                                                -- numeric(14,2)
  e.valor_comissao_bruto,                                             -- numeric(14,2)
  pm.id   as produto_id,      upper(pm.nome)      as produto,
  eo.id   as fornecedor_end_id, upper(eo.nome)    as fornecedor,  eo.uf_id as uf_origem_id,
  ed.id   as cliente_end_id,    upper(ed.nome)    as cliente,     ed.uf_id as uf_destino_id
from entregas e
join orcamentos_fornecedor de on de.id = e.orcamento_fornecedor_id
left join produtos pm         on pm.id = de.produto_id
left join enderecos_clifor eo on eo.id = de.endereco_origem_id
left join enderecos_clifor ed on ed.id = de.endereco_destino_id
where e.status = 'financeiro';   -- §3, [DÚVIDA 3]
```

Os três relatórios (agregação no banco, uma chamada por clique):

```sql
-- §3.3 — Produto × Cliente × Fornecedor
create function fn_rel_entregas_produto(p_inicio timestamptz, p_fim timestamptz, p_filtros jsonb default '{}')
returns table (
  produto text, fornecedor text, cliente text, uf_destino text,
  qtd numeric, valor_venda_bruto numeric, valor_comissao numeric,
  valor_venda_unit_medio numeric, valor_comissao_unit_medio numeric, qtd_entregas bigint
) …
  select produto, fornecedor, cliente, uf.sigla,
         sum(qtd_entrega), sum(valor_venda_bruto), sum(valor_comissao_bruto),
         sum(valor_venda_bruto) / nullif(sum(qtd_entrega), 0),
         sum(valor_comissao_bruto) / nullif(sum(qtd_entrega), 0),
         count(*)
    from vw_entregas_faturadas v
    left join ufs uf on uf.id = v.uf_destino_id
   where v.dt_entrega between p_inicio and p_fim
     and (p_filtros->>'vendedor' is null or v.vendedor_id = (p_filtros->>'vendedor')::uuid)
     …
   group by 1,2,3,4;

-- §3.4 — Cliente × Mês (soma de comissão)
create function fn_rel_entregas_cliente_mes(p_inicio timestamptz, p_fim timestamptz, p_filtros jsonb default '{}')
returns table (cliente text, uf text, mes date, valor_comissao numeric, qtd_entregas bigint) …
   group by cliente, uf, mes;

-- §3.5 — Fornecedor × Mês (a mesma, com o eixo trocado)
create function fn_rel_entregas_fornecedor_mes(…) returns table (fornecedor text, uf text, mes date, valor_comissao numeric, qtd_entregas bigint) …
```

O pivot (mês → coluna) é feito na renderização a partir dessas linhas já agregadas, ou com `crosstab`/agregação condicional se o conjunto de meses for fixado pelo período. Subtotais por linha, por coluna e total geral saem de `grouping sets`/`rollup` na mesma consulta — **nunca no navegador**.

Ranking de metas (§3.6/§4.6) deixa de ser coluna gravada:

```sql
create view vw_ranking_metas as
select m.id, m.vendedor_id, m.tipo_meta, m.data_inicio, m.data_fim, m.valor_meta,
       coalesce(v.total, 0)                        as realizado,
       coalesce(v.total, 0) / nullif(m.valor_meta, 0) as ranking   -- nunca divide por zero
  from metas_mensais m
  left join lateral (
    select sum(e.valor_comissao_bruto) as total
      from vw_entregas_faturadas e
     where e.dt_entrega between m.data_inicio and m.data_fim
       and ((m.tipo_meta = 'regular'      and e.vendedor_id = m.vendedor_id and e.vendedor_substituto_id is null)
         or (m.tipo_meta = 'substituicao' and e.vendedor_substituto_id = m.vendedor_id))
  ) v on true;
```

A regra adotada é a da página `metas` (exclui a entrega com substituto da conta do titular), que é a única que não conta a mesma comissão duas vezes — ver **[DÚVIDA 7]**.

Índices: `entregas(status, dt_entrega)`, `entregas(vendedor_id, dt_entrega)`, `entregas(vendedor_substituto_id, dt_entrega)`, `orcamentos_fornecedor(endereco_origem_id)`, `orcamentos_fornecedor(endereco_destino_id)`, `metas_mensais(data_inicio, data_fim, tipo_meta)`.

### 9.5 Tabelas envolvidas

`entregas`, `orcamentos_fornecedor`, `produtos`, `enderecos_clifor`, `grupos_clifor`, `ufs` (option set `Opt.UFs` → tabela), `usuarios` (vendedor e substituto), `metas_mensais`, `niveis_vendedores`, `permissoes_pagina`, `user_preferences`, `log_exportacoes` (novo, §9.3).

**RLS:** ligada em todas, desde a primeira migration.
- Leitura do relatório: só usuário autenticado com permissão na página Relatórios.
- Diretoria/Gerência: todas as entregas. Analista/Operador: ver **[DÚVIDA 8]** — recomendação padrão é restringir a visão do vendedor às próprias entregas (`vendedor_id = auth.uid() or vendedor_substituto_id = auth.uid()`) até decisão em contrário.
- `metas_mensais`: **nenhuma escrita** a partir desta rota.
- A Data API pública do Bubble não tem equivalente: nada de `anon` com `select` amplo.

---

## 10. Dúvidas

1. **[DÚVIDA 1]** O conteúdo dos blocos `HTML C` (54.434 ch., aba "Relatório de Cotação") e `HTML D` (35.680 ch., aba "Relatório de Prospecção") não está no mapa, e nenhum workflow os alimenta. O que eles mostram e de onde tiram o dado — Data API do Bubble, iframe de ferramenta externa (Looker/Data Studio), ou conteúdo estático?
   *Recomendação padrão:* abrir os dois no editor Bubble e extrair o HTML antes de qualquer implementação; **não** portar o HTML como está. Tratar cada um como um relatório novo, a especificar em spec própria, e manter as abas desabilitadas na primeira entrega.
2. **[DÚVIDA 2]** Existe exportação hoje (CSV, Excel, PDF, imprimir, copiar) dentro dos blocos `relat por produto` / `relat por cliente`? O Bubble não tem nenhuma ação de download.
   *Recomendação padrão:* assumir que sim e entregar exportação CSV e XLSX gerada no servidor para os três relatórios (§9.3).
3. **[DÚVIDA 3]** Só `Opt.Etapas.Financeiro` entra nos relatórios. `Concluído` e `Cancelado` também têm `EntregaConcluida = true`; a entrega que avança para "Concluído" some do relatório. Isso é intencional?
   *Recomendação padrão:* manter `Financeiro` como padrão (é o que o mapa diz) e deixar o conjunto de status parametrizável na função SQL, confirmando com a Diretoria antes do corte.
4. **[DÚVIDA 4]** UF: o relatório de Produtos usa `EnderecosCliFor.QualUfOpt` (option set) e os de Clientes/Fornecedores usam `EnderecosCliFor.UF` (texto livre). Qual é a fonte correta?
   *Recomendação padrão:* no banco novo existe **uma** coluna `uf_id` referenciando a tabela `ufs`; na carga, `QualUfOpt` vence e `UF` texto é usado só onde o option set estiver vazio, com relatório das divergências.
5. **[DÚVIDA 5]** O que faz a ação `AAC` do plugin `1558770956236x539499438875082750` (bUBWk), presente no PageLoaded de `inicio`, `vendas`, `financeiro`, `historico`, `metas` e `relatorios`? (Mesma dúvida da spec de `financeiro`.)
   *Recomendação padrão:* identificar o plugin no editor; até lá, não reproduzir.
6. **[DÚVIDA 6]** Qual é o formato de saída de `format_number(decimal_place=2)` neste app (`idioma: pt_br`) — `1.234,56` ou `1,234.56`? Disso depende se o JavaScript dos blocos HTML está somando os valores certos hoje.
   *Recomendação padrão:* irrelevante para o app novo, onde a soma é SQL sobre `numeric`; mas conferir antes de comparar os números do sistema antigo com os do novo na homologação — pode haver divergência histórica.
7. **[DÚVIDA 7]** `MetasMensais.RankingVendas` é gravado por duas páginas com regras diferentes (§4.6): `relatorios` (meta **contém** o período, sem excluir metas fechadas, sem excluir entregas com substituto) e `metas` (meta **contida** no período, exclui metas fechadas e entregas com substituto). Qual é a regra oficial?
   *Recomendação padrão:* adotar a de `metas` (não conta a mesma comissão duas vezes e respeita meta fechada), transformar o campo em **view calculada** (§9.4) e **eliminar a gravação a partir de `relatorios`**.
8. **[DÚVIDA 8]** Um Operador/Analista deve enxergar os relatórios de **todos** os vendedores, como hoje (§1)?
   *Recomendação padrão:* Diretoria e Gerência veem tudo; Analista e Operador veem apenas as próprias entregas (RLS, §9.5), até decisão em contrário registrada em `specs/04-duvidas.md`.
9. **[DÚVIDA 9]** O link por linha aponta para `historico?numpedido={Entregas.NumeroEntrega}` (campo `cpo_numeropedido_text`, texto), mas a página `historico` busca `Tbl.Cotacao.CotacaoNum` (número). A numeração de entrega, pedido e cotação é a mesma?
   *Recomendação padrão:* no modelo novo, linkar pelo identificador do pedido (`pedido_id`), não por número em texto; manter `?numpedido=` como alias de compatibilidade.
10. **[DÚVIDA 10]** A matriz Cliente × Mês e Fornecedor × Mês soma **só comissão MegaBox** (§3.4). A Diretoria quer também faturamento (`ValorVendaBruto`) e quantidade nessas duas matrizes?
    *Recomendação padrão:* entregar as três medidas (quantidade, venda bruta e comissão) com seletor de medida — a função SQL já agrega as três sem custo adicional.
11. **[DÚVIDA 11]** O relatório de Produtos não traz data (§3.3), logo não pode ser quebrado por mês. É intencional ou falta a coluna?
    *Recomendação padrão:* incluir `mes` na função SQL e deixar o eixo de tempo opcional na tela.
12. **[DÚVIDA 12]** O período fica vazio para usuário sem `UltimoDateRange` e a busca varre a base inteira (§4.1). Qual deve ser o padrão?
    *Recomendação padrão:* mês corrente no servidor, e intervalo obrigatório com teto configurável (ex.: 24 meses).

---

## 11. Cobertura — todos os 10 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bUBWj | PageLoaded | plugin `AAC` desconhecido; preenche `datainicio`/`datafim` a partir de `User.UltimoDateRange` quando vazios (2 `ChangePage`); dispara o evento CalculaRanking | 4.1 |
| 2 | bUBWv | `AAd` do `RangePicker A` (período aplicado) | grava `User.UltimoDateRange` e escreve `datainicio` (00:00:00) e `datafim` (23:59:59) na URL, recarregando a página | 4.3 |
| 3 | bUBYW | CustomEvent «CalculaRanking» (`SortByNumber`) | recalcula e **grava** `MetasMensais.RankingVendas` das metas Regular (por `QualVendedor`) e Substituição (por `QualVendedorSubstituto`) que contêm o período | 3.6, 4.6, 8.3 |
| 4 | bUBaV | Clique `Button D` · `rad relatorios = "Produtos"` | acha o estado "pesquisando", achata as entregas faturadas do período em texto (produto, qtd, unitários, origem, UF destino, destino, venda, comissão, link) e entrega a `gp relat produto` (`matrix-data`) | 3.3, 4.5 |
| 5 | bUBcv | Clique `Button D` · `rad relatorios = "Clientes"` | idem, com cliente (endereço destino), UF destino, data de entrega, comissão e link → `gp relat clientes` (`clientes-matrix-data`) | 3.4, 4.5 |
| 6 | bUBfH | Clique `Button D` · `rad relatorios = "Fornecedores"` | idem, com fornecedor (endereço origem), UF origem, data de entrega, comissão e link → **o mesmo** `gp relat clientes` | 3.5, 4.5 |
| 7 | bUEsr | Clique `Button A` "Relatório de Cotação" | mostra `Gp Cotação`, esconde `Gp Relatatórios` e `Gp Prospecção` | 4.2 |
| 8 | bUEtE | Clique `Button B` "Outros Relatórios" | mostra `Gp Relatatórios`, esconde `Gp Cotação` e `Gp Prospecção` | 4.2 |
| 9 | bUEyh | Clique `Button C` "Relatório de Prospecção" | mostra `Gp Prospecção`, esconde `Gp Relatatórios` e `Gp Cotação` | 4.2 |
| 10 | bUFBb | Clique `Text F` ("Pesquisar" antigo, em grupo nunca exibido) | **vazio** — nenhuma ação. Código morto | 4.8, 8.1 |

Ações cobertas: 4 (bUBWj) + 2 (bUBWv) + 2 (bUBYW) + 3 (bUBaV) + 3 (bUBcv) + 3 (bUBfH) + 3 (bUEsr) + 3 (bUEtE) + 3 (bUEyh) + 0 (bUFBb) = **26**, igual ao inventário.
Elementos: 11 Group + 7 Text + 4 CustomElement + 4 Button + 4 HTML + 1 RadioButtons + 1 plugin date range = **32**.
Condicionais: 2 (`Button A`: hover + aba ativa) + 1 (`Button C`) + 1 (`Button B`) + 1 (`tool.MenuPaginas A`) + 1 (`gp pesquisar`) + 1 (`Text F`) + 2 (`gp relat produto`) + 2 (`gp relat clientes`) + 2 (`Text D`) = **13**.
