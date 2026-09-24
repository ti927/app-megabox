# Spec funcional — página `metas` (Bubble `bTvoX`)

Fonte: `mapa/pagina-metas.md` (304 elementos · 33 workflows · 56 ações · 38 condicionais · 4 popups · 3 tabelas · 4 repeating groups · 4 HTML · 0 estados customizados).
Apoio: `mapa/data-types.md`, `mapa/option-sets.md`, `mapa/backend-workflows.md`, `mapa/integracoes.md`,
`mapa/reusable-tool.MenuPaginas.md`, `mapa/reusable-tool.Cabecalho.md`, `mapa/reusable-pop.ConfigSistema.md`,
`mapa/reusable-pop.CadastroUsuarios.md`.
Consultei `mapa/pagina-metas_bkp.md` **apenas** para entender a evolução da regra de meta (§8.1, §8.3 e §10) — está anotado onde usei.

Se esta spec e o mapa discordarem, **o mapa manda**.

Glossário desta spec:
- **Meta mensal** = registro de `Tbl.MetasMensais` (`tbl_metasmensais`): um vendedor, um período (`DataInicio`/`DataFim`),
  um nível, um tipo de meta e um valor de meta. É a **linha da tela**.
- **Meta fechada** = registro de `Tbl.MetasFechadas` (`tbl_orcfornecedorescotacao` — nome de tabela herdado de outro uso):
  o "fecho" do período de um vendedor, com o realizado e a comissão apurados, as entregas e as contas vinculadas.
- **Realizado / "Valor faturado"** = soma de `Entregas.ValorComissaoBruto` (`cpo_valorcomissao_number`) das entregas do período.
  **Não é o valor da venda**: é a **comissão que a MegaBox ganha** na operação (confirmado pelo rótulo
  "sum of cpo.ValorComissaoBruto" no gráfico `Line/BarChart A` e por `specs/paginas/financeiro.md`, que chama
  `Entrega.valorcomissao` de "Comissão Megabox").
- **Comissão de vendas** = o que a MegaBox paga ao vendedor: realizado × fator do nível.
- **Nível** = registro de `Tbl.NiveisVendedores`, que carrega a meta de referência, os dois fatores de comissão e a
  quantidade de meses usada na régua de promoção.

---

## 1. Propósito e quem usa

Tela "Metas & Vendas". Serve para:
1. **Definir metas mensais** por vendedor (popup "Metas Mensais"): período, vendedor, nível, tipo de meta e valor.
2. **Acompanhar o atingimento** no período escolhido: painel com meta, realizado, % da meta, comissão de vendas e
   régua de "manter / subir nível" por vendedor (tabela `rpg metas`).
3. **Mostrar o ranking** de vendedores do período (pódio ouro/prata/bronze + lista `rpg ranking vendedores`) e os números
   coletivos (meta coletiva, faturado coletivo, meta diária).
4. **Fechar a meta** de um vendedor: congela o realizado num registro de `Tbl.MetasFechadas` e **gera automaticamente a
   conta a pagar da comissão** do vendedor (`Tbl.ContasPagar`).
5. **Cancelar um fechamento** (só Diretor) e **auditar as entregas** que compõem o realizado (popup "detalha entregas",
   com filtros e exportação para Excel).

**Quem usa:** Diretoria e Gerência comercial. `Opt.MenuPaginas.Metas & Vendas` (`dashboard`) declara `pagina="metas"`,
`ordem=5`, `hierarquia=2` e `departamentosacessiveis=[Administrativo(diretoria)]` — mas **nenhum desses atributos é usado
para bloquear nada**.

### Controle de acesso de fato (só no navegador)

- **Nenhuma verificação no carregamento.** `WF bTwAR` (PageLoaded) não checa sessão, perfil nem departamento. Quem digitar
  `/metas` entra, inclusive deslogado. O único efeito de sessão vem de fora da página (`tool.Cabecalho` desloga usuário com
  `Ativo = false`).
- **Menu.** O link "Metas & Vendas" em `tool.MenuPaginas` (`Link A`, bTeRX) nasce `link_disabled=True` e só é habilitado se a
  linha de `Tbl.ConfigSistema` com `QualPagina = Metas & Vendas` listar o **departamento**, o **perfil** ou o **próprio usuário**
  (`QuaisDeptos` / `QuaisPerfis` / `QuaisUsuarios`). É um link desabilitado, não uma guarda.
- **Escopo da tabela principal `rpg metas` (bTvrH)** — único filtro por papel que existe:
  - `CurrentUser.QualPerfil.hierarquia ≤ 3` (Diretor=1, Gerente=2, Analista=3) → vê **todas** as metas do período;
  - `CurrentUser.QualPerfil.hierarquia > 3` (Operador=4) → vê só as metas com `QualVendedor = CurrentUser`.
  - O `data_source` **padrão** (sem condicional) já é "todas as metas do período": se `QualPerfil` estiver vazio, nenhuma
    das duas condicionais casa e o usuário vê tudo. É falha aberta.
- **Fechar meta** (`btn fechar meta`, bTvqR): nasce desabilitado e só é liberado por condicional quando
  `hierarquia ≤ 1` **OU** `CurrentUser.NomeModelo = "gabriella mesquita de sousa"` **OU**
  `CurrentUser.NomeModelo = "danielle cristine silva reis"` — **dois nomes de pessoa em código**.
- **Cancelar fechamento** (`btn cancela fechamento meta`, bTzir): oculto; só aparece quando a meta está fechada **e**
  `CurrentUser.QualPerfil = Diretor`.
- **Apagar meta mensal** (`Icon Q`, bTwAF, dentro do popup de cadastro): **sem restrição de perfil**; só é desabilitado
  quando a meta já foi fechada (`QualMetaFechada` preenchido).
- **HTML C** (bUFCJ, 90.181 caracteres) só fica visível para `hierarquia ≤ 1`. Conteúdo desconhecido — ver §10.
- Todo o resto (pódio, ranking, meta coletiva, gráficos, popup de entregas, exportação) **não tem nenhuma restrição**.

---

## 2. Estrutura da tela

### 2.1 Layout geral (de cima para baixo)

1. **Cabeçalho** `tool.Cabecalho A` (bTvtF) — USA Reusable `tool.Cabecalho`; fornece o estado `var_showmenu_`.
2. **Menu lateral** `tool.MenuPaginas A` (bTvtJ) — oculto ao carregar; visível quando `tool.Cabecalho A.var_showmenu_` é verdadeiro.
3. **Barra flutuante** `FloatingGroup A` (bTvtK):
   - `RangePicker A` (bTvtL) — plugin date range 1648823245313, pt-BR, 2 meses visíveis; valor inicial = `datainicio`..`datafim` da URL.
   - `rpg entregas gerais` (bTvtP) — RepeatingGroup **de dados**, não visual: é a busca-base de entregas do período (§3.1).
   - `Group O` (bTvtQ) — **oculto ao carregar e nunca exibido**: rótulos "Entregas"/"Comissões" com `Switch A` (bTvtV). Morto (§8.1).
   - `Button B` (bTvtX) "Criar Metas" — abre o popup de metas mensais.
4. **`Group Dashboard`** (bTvtD):
   - **Pódio** (`Group E`, bTvrM): prata = 2º (`Group J`, bTvrS), ouro = 1º (`Group K`, bTzYH0), bronze = 3º (`Group L`, bTzYY0),
     cada um lendo `rpg ranking vendedores:specific_item(n)`. Mostram foto, primeiro+último nome, nome do nível e `RankingVendas` em %.
   - **`Group Statistics`** (bTvsJ): ícone de recarregar (`Icon K`, bTvsb), meta coletiva, faturado coletivo, meta diária (HTML B),
     barra de progresso coletiva (`Progress-Bar B`, bTzhH0) e as colunas dos 3 meses anteriores (§5.2).
   - **`rpg ranking vendedores`** (bTvsN) — lista horizontal de todos os colocados do período (posição, foto, nome, tipo de meta, %).
   - **`gp painel metas`** (bTvrL) → **tabela `rpg metas`** (bTvrH), o painel central (§3.3).
   - **`Group Graphs`** (bTvsg) → `Group PZ` (bUEzd) **oculto ao carregar e nunca exibido**, com os 3 gráficos; `HTML A` (bUEzP, 30.430 chars).
   - **`HTML C`** (bUFCJ, 90.181 chars) — oculto; visível só para `hierarquia ≤ 1`.

### 2.2 Popups e reusables

| Elemento | Tipo | Uso nesta página |
|---|---|---|
| `pop entregas` (bTvtb) | Popup | "Detalha entregas do vendedor": tabela `rpg detalha entregas vendedor` com filtros e botão "Exportar para excel". Aberto por `WF bTwAR` (passo bTwAT) quando a URL traz `detalhaentregas`, e alimentado por `WF bTziN`. Tem condicional `⟂ quando UrlParam("popentregas" as boolean):is_true → ` **sem propriedade nenhuma** — morta. |
| `pop oculto` (bTvtE) | Popup | **Vazio**. Nenhum elemento, nenhum WF. Morto (era o "porta-buscas" copiado da página `financeiro`). |
| `pop.AddEdita MetasMensais` (bTvyI) | Popup (`group_type=user`) | Cadastro de metas mensais: formulário + tabela `rpg metas mensais`. Aberto por `WF bTwBV` `[bTwBZ]`, fechado por `WF bTzVj` `[bTzVp]`. |
| `pop apaga meta fechada` (bTzix) | Popup (`group_type=MetasMensais`) | Confirmação de cancelamento de fechamento. Aberto por `WF bTzkM`; SIM = `WF bTzkZ`; NÃO = `WF bTzlD`. |
| `pop.ConfigSistema A` (bTzWh) | USA Reusable | Aberto por `WF bTzXF` (ícone de pódio ao lado do dropdown de nível) — é onde se cadastram os níveis de vendedor. |
| `pop.CadastroUsuarios A` (bTzWO) | USA Reusable | Aberto por `WF bTzWI` (ícone de pessoas ao lado do dropdown de vendedor). |
| `tool.Cabecalho`, `tool.MenuPaginas` | USA Reusable | Moldura comum do app. |

### 2.3 Parâmetros de URL (todo o estado da tela)

| Parâmetro | Tipo | Quem grava | Quem lê |
|---|---|---|---|
| `datainicio` | date | `WF bTwAR` (passo bTzeX, default) e `WF bTwAd` (bTwAf) | todas as buscas, os 3 meses anteriores, `WF bTwAj`, `WF bTwAv` |
| `datafim` | date | `WF bTwAR` (bTzeZ) e `WF bTwAd` (bTwAf) | idem |
| `detalhaentregas` | `Opt.TipoMeta` (display) | `WF bTziN` | abre `pop entregas` e escolhe qual das duas fontes da tabela usar |
| `vendedor` | id de User | `WF bTziN`, `WF bTwBs`; limpo por `WF bTwCh`, `bTwCz`, `bTwDF` | filtro da tabela de entregas |
| `cliente` | id de `Tbl.GrupoCliFor` | `WF bTwBx`, `WF bTwCE`; limpo por `bTwCb`, `bTwCz`, `bTwDF` | filtro |
| `fornecedor` | id de `Tbl.GrupoCliFor` | `WF bTwBz`, `WF bTwCQ`; limpo por `bTwCV`, `bTwCz`, `bTwDF` | filtro |
| `numnf` | texto | `WF bTwCJ`; limpo por `bTwCn`, `bTwCz`, `bTwDF` | filtro por NF do fornecedor |
| `numpedido` | texto | `WF bTwCL`; limpo por `bTwCt`, `bTwCz`, `bTwDF` | filtro por `Entregas.cpo_numeropedido_text` |
| `popentregas` | boolean | **ninguém** | só a condicional vazia de `pop entregas` — morto |

**Estados customizados: nenhum** (o inventário confirma 0). Tudo o que a tela "lembra" está na URL ou no registro do usuário.

### 2.4 Estado guardado no usuário

`User.UltimoDateRange` (`cpo_ultimodaterange_date_range`): último período escolhido no `RangePicker A`.
Gravado por `WF bTwAd` (passo bTwAe) e relido no carregamento por `WF bTwAR` (passos bTzeX/bTzeZ) para montar `datainicio`/`datafim`.
É o mesmo campo usado pela página `financeiro` — os dois filtros de período **se sobrescrevem**.

---

## 3. Dados

### 3.1 A busca-base de entregas — `rpg entregas gerais` (bTvtP)

Todas as entregas com **status exatamente `Opt.Etapas.Financeiro`** cuja **data efetiva de entrega**
(`Entregas.DtEntrega` = `cpo_dtentrega_date`) esteja entre `datainicio` e `datafim`.

Em linguagem de negócio: *"as entregas já concluídas e liberadas para o financeiro, entregues dentro do período escolhido"*.

Três observações que valem regra:
- O status é comparado por **igualdade** com `Financeiro`. Entregas que já andaram para `Concluído` (que também tem
  `EntregaConcluida = true`) **somem da apuração** — inclusive retroativamente, o que muda o realizado de um período já
  acompanhado. Ver `[DÚVIDA 1]`.
- É essa RG que alimenta **tudo**: realizado por vendedor, faturado coletivo, ranking, gráficos e o popup de detalhe.
  Ou seja: a página baixa para o navegador **todas as entregas do período de todos os vendedores** e faz as contas em memória.
- Não há filtro por empresa, por vendedor ativo nem por tipo de meta nessa busca.

### 3.2 Listas do painel de ranking

- **`rpg ranking vendedores`** (bTvsN): metas mensais com `DataFim ≤ datafim` **e** `DataInicio ≥ datainicio`, ordenadas por
  `RankingVendas` decrescente. É de onde saem o pódio (`specific_item(1|2|3)`) e a lista completa.
  Não filtra `TipoMeta`: **metas de substituição concorrem com as regulares no mesmo ranking**.
- **`rpg metasfechadas`** (bTvqX, dentro de cada linha de `rpg metas`): as metas fechadas do vendedor da linha, ordenadas por
  `DataInicio` decrescente, **limitadas a `QualNivel.QtdMetaBatida` registros** (as N mais recentes, N = regra do nível).
  É a régua de promoção: mostra mês a mês (`MesNome` + `TotalComissaoMegabox`) e a média.
- **`rpg entregas vendedor`** (bTvqV, oculta, dentro de cada linha): as entregas de `rpg entregas gerais` filtradas por
  `QualVendedor = vendedor da linha`. **Serve só ao fechamento** (`WF bTwAj`) — e usa um filtro diferente do que apura o
  realizado exibido (§8.3).

### 3.3 Tabela principal `rpg metas` (bTvrH)

Fonte: metas mensais com `DataFim ≤ datafim` e `DataInicio ≥ datainicio`, ordenadas por `DataInicio`; escopo por hierarquia (§1).
Uma linha = uma meta mensal. Colunas, na ordem dos eixos:

| Coluna | Conteúdo | Elemento |
|---|---|---|
| Vendedor | foto, nome em maiúsculas, nome do nível | bTvpU |
| Meta | `ValorMeta` (moeda, somente leitura) + `TipoMeta` em maiúsculas | `Ipt meta` (bTvpl), `Text JZZ` (bTzVN) |
| Valor faturado | realizado do período (§5.1) + ícone "abrir detalhe" | `Ipt valor faturado` (bTvpn), `btn ver entregas` (bTziB) |
| % da meta | barra de progresso colorida por faixa + input oculto com a razão | `Progress-Bar A` (bTvpx), `Ipt % da meta A` (bTvpt) |
| Comissão de vendas | comissão do vendedor (§5.1) + fator aplicado (oculto) | `Ipt valor comissao` (bTvqD), `Ipt fator comissao` (bTzVX) |
| Qtd meses p/ subir nível | as N metas fechadas mais recentes + média | `rpg metasfechadas` (bTvqX), `Ipt media` (bTvqh) |
| Status nível | "Manter Nível" ou "Subir Nível" | `Text L` (bTvpg) |
| Fechar | fechar / já fechada / cancelar fechamento | bTvqR, bTzir |

### 3.4 Tabela de cadastro `rpg metas mensais` (bTvyt, dentro do popup)

Fonte: `Tbl.MetasMensais` com `DataInicio ≥ (filtro de datas do popup):min`, `DataFim ≤ (filtro):max`,
`QualVendedor = (filtro vendedor)` e `QualNivel = (filtro nível)`, ordenado por `DataInicio`, **ignorando filtros vazios**.
Cabeçalho traz os três filtros (date range `dd filtro data metasmensais` bTvzJ, `dd filtro vendedor metasmensais` bTvzR,
`dd filtro nível metasmensais` bTvzb), cada um com botão de limpar, e o **total das metas listadas**
(`rpg metas mensais:ValorMeta:sum`, `Text LZZ` bTvzd).
Cada linha mostra período, vendedor + tipo de meta, nível, valor e o ícone de apagar (`Icon Q`, bTwAF).

Os filtros de data e vendedor do popup nascem com `default` vindo da URL (`datainicio`/`datafim`), mas **não gravam nada na
URL** — são filtros locais do popup.

### 3.5 Tabela de detalhe `rpg detalha entregas vendedor` (bTvtc, dentro de `pop entregas`)

Fonte: `rpg entregas gerais` **filtrada em memória**, em duas variações escolhidas por `detalhaentregas`:

- `detalhaentregas = Regular`: `QualVendedor = URL vendedor` **E** `NumeroEntrega = URL numpedido` **E**
  `NumNfFornecedor = URL numnf` **E** `QualCliente = URL cliente` **E** `QualFornecedor = URL fornecedor` **E**
  `QualVendedorSubstituto` vazio — ignorando filtros vazios, ordenado por `DtPrevEntrega` (`cpo_dataentrega_date`) crescente.
- `detalhaentregas = Substituição`: os mesmos filtros, **sem** o filtro de `QualVendedor` e trocando a última condição por
  `QualVendedorSubstituto = URL vendedor`.

Colunas: contador `linha/total`, fornecedor (grupo + filial de origem), vendedor, produto, valor comissão (com total no
cabeçalho), comissão unitária, NF do fornecedor, data de entrega (mostra `DtEntrega`, embora a **ordenação** use
`DtPrevEntrega` — divergência, §8.3), número do pedido e cliente (grupo + filial de destino).
Os cabeçalhos das colunas fornecedor, vendedor, NF, pedido e cliente são os próprios filtros; cada linha tem ícones
"filtrar este fornecedor"/"filtrar este cliente".

**Atenção ao rótulo:** o filtro "Num pedido" e a coluna "Num pedido" batem em `Entregas.cpo_numeropedido_text`, que em
`data-types.md` é **`cpo.NumeroEntrega`** (o número da entrega), não o número do pedido de `Tbl.Pedido`.

---

## 4. Funcionalidades e regras de negócio

### 4.1 Carregamento da página — `WF bTwAR` (PageLoaded)

1. `[bTwAS]` ação do plugin 1558770956236 `AAC` — **não identificada** (`[DÚVIDA 9]`). A mesma ação aparece no
   PageLoaded da página `financeiro`.
2. `[bTwAT]` mostra `pop entregas` **se** a URL trouxer `detalhaentregas`.
3. `[bTzeX]` se `datainicio` estiver vazio, regrava a URL com `datainicio = User.UltimoDateRange:min` às 00:00:00.
4. `[bTzeZ]` se `datafim` estiver vazio, regrava a URL com `datafim = User.UltimoDateRange:max` às 23:59:59.
5. `[bUAhU]` dispara o custom event `CalculaRanking` (`WF bTwAv`).

Consequências: se o usuário nunca escolheu período (ou está deslogado), `UltimoDateRange` é vazio, a URL fica sem datas e
**todas as buscas ficam sem intervalo** — o comportamento não está definido no mapa (`[DÚVIDA 2]`).
E o passo 5 faz a página **escrever no banco a cada carregamento** (§4.7).

### 4.2 Mudança de período — `WF bTwAd` (RangePicker aplicado)

1. `[bTwAe]` grava `User.UltimoDateRange = min .. max@23:59:59` no registro do usuário.
2. `[bTwAf]` regrava `datainicio` (min, 00:00:00) e `datafim` (max, 23:59:59) na URL, mantendo os demais parâmetros.

Não redispara `CalculaRanking`: o ranking exibido depois de trocar o período é o que estiver gravado em
`MetasMensais.RankingVendas` até que alguém recarregue a página ou clique no ícone de recarregar (`WF bTwBB`).

### 4.3 Criar meta mensal — `WF bTwBV` (abrir) e `WF bTwBh` (gravar)

- `WF bTwBV` `[bTwBZ]`: mostra `pop.AddEdita MetasMensais`.
- Formulário (todos os campos `mandatory`):
  - **Data início** `dt inicio metamensal` (bTvyZ) e **Data fim** `dt final metamensal` (bTvyT) — default = `datainicio`/`datafim` da URL.
  - **Vendedor** `dd vendedor metamensal` (bTvyf) — `User` com `Ativo = true`, `QualDepto ≠ Operação` e `QualDepto ≠ Financeiro`
    (ou seja: Comercial e Administrativo), ordenado por nome.
  - **Nível** `dd nivel metamensal` (bTvyl) — todos os `Tbl.NiveisVendedores` por `Ordem`; **default = nível atual do vendedor
    escolhido** (`dd vendedor metamensal:QualNivelVendedor`).
  - **Tipo de meta** `dd tipometa` (bTzVF) — `Opt.TipoMeta` = Regular | Substituição.
  - **Valor** `ipt valo metamensal` (bTvyr) — moeda; **default = `dd nivel metamensal:MetaVenda`** (a meta de referência do nível).
- `WF bTwBh`:
  1. `[bTwBl]` cria `Tbl.MetasMensais` com `DataInicio`, `DataFim`, `QualNivel`, `QualVendedor`, `ValorMeta`, `TipoMeta`.
  2. `[bTwBm]` limpa os inputs.
- **Não há validação nenhuma**: nem `DataInicio < DataFim`, nem meta duplicada para o mesmo vendedor/período/tipo, nem
  alinhamento com mês-calendário, nem `Observacao` (o campo existe na tabela e nunca é preenchido).
  O campo `MetasMensais.DataPeriodo` (date range) também nunca é gravado.
- **Não existe "editar meta"** — apesar de o popup se chamar "AddEdita". Para corrigir, apaga e cria de novo.

### 4.4 Filtros do popup de metas mensais — `WF bTwBn`, `bTwBa`, `bTwBf`

Cada um faz um `ResetGroup` no grupo do filtro correspondente: `WF bTwBn` `[bTwBr]` → `gp filtro data metasmensais`;
`WF bTwBa` `[bTwBb]` → `gp filtro vendedor metasmensais`; `WF bTwBf` `[bTwBg]` → `gp filtro nível metasmensais`.
O `ResetGroup` devolve o campo ao valor default. Como o default do filtro de datas vem da URL,
"limpar" o filtro de datas **restaura o período da URL**, não esvazia.

### 4.5 Apagar meta mensal — `WF bTzdR0` (`Icon Q`)

`[bTzdX0]` apaga o registro de `Tbl.MetasMensais` da linha. **Sem confirmação e sem restrição de perfil.**
O ícone só é bloqueado quando `QualMetaFechada` está preenchido (aí vira um "check" verde com o título
"Essa meta já foi fechada").

### 4.6 Atalhos de cadastro — `WF bTzWI` e `WF bTzXF`

- `WF bTzWI` `[bTzWU]`: ícone de pessoas ao lado do dropdown de vendedor → abre `pop.CadastroUsuarios A`.
- `WF bTzXF` `[bTzXL]`: ícone de pódio ao lado do dropdown de nível → abre `pop.ConfigSistema A` (onde ficam os níveis).

### 4.7 Recalcular ranking — `WF bTwAv` (custom event «CalculaRanking») e `WF bTwBB`

`WF bTwBB` `[bTwBC]` (ícone recarregar `Icon K`) dispara o mesmo evento que o carregamento da página.
O evento tem `event_name="SortByNumber"` nas propriedades, diferente do rótulo — resíduo de cópia.

O evento faz **duas gravações em massa** (§5.3):

1. `[bUAhB]` — para **cada** meta mensal do período com `TipoMeta = Regular` **e `QualMetaFechada` vazio**, grava
   `RankingVendas = (soma de ValorComissaoBruto das entregas do período com status Financeiro, do vendedor da meta e
   sem vendedor substituto) ÷ ValorMeta da própria meta`.
2. `[bUAhP]` — para **cada** meta mensal do período com `TipoMeta = Substituição` (**sem** o filtro de meta fechada), grava
   `RankingVendas = (soma de ValorComissaoBruto das entregas do período com status Financeiro cujo VendedorSubstituto é o
   vendedor da meta) ÷ ValorMeta da própria meta`.

Ou seja: `RankingVendas` **é o % de atingimento gravado**, não uma posição. A posição é só a ordenação da RG.
A assimetria entre os dois passos (o passo 1 pula metas fechadas, o passo 2 não) é bug — `[DÚVIDA 3]`.

### 4.8 Ver as entregas que compõem o realizado — `WF bTziN`, `WF bTwCz`, `WF bTwDF`

- `WF bTziN` `[bTziP]` (`btn ver entregas` na linha): grava na URL `vendedor = QualVendedor da linha` e
  `detalhaentregas = TipoMeta da linha (display)`. A URL muda, a página recarrega e `WF bTwAR` abre o popup.
- Fechar (`Icon J` → `WF bTwCz`, ações `[bTwDA]` esconde + `[bTwDB]` limpa a URL; `Button A` → `WF bTwDF`, ações `[bTwDG]` +
  `[bTwDH]`): escondem o popup **e** limpam da URL `detalhaentregas`, `vendedor`, `numnf`, `numpedido`, `cliente` e
  `fornecedor`. Os dois workflows são idênticos (§8.2).

### 4.9 Filtros do popup de entregas — `WF bTwBs`, `bTwBx`, `bTwBz`, `bTwCE`, `bTwCJ`, `bTwCL`, `bTwCQ` e os "limpar"

Todos seguem o mesmo padrão: o campo (ou o ícone de funil na linha) **grava o valor na URL**, mantendo os demais parâmetros,
e a tabela relê a URL.

| Parâmetro | Grava (WF / ação) | Limpa (WF / ações: `ResetGroup` + `ChangePage` com valor vazio) |
|---|---|---|
| `vendedor` | `WF bTwBs` `[bTwBt]` (dropdown `dd filtra filtravendedor`) | `WF bTwCh` `[bTwCi]` + `[bTwCj]` (`Icon G`) |
| `cliente` | `WF bTwCE` `[bTwCF]` (dropdown) e `WF bTwBx` `[bTwBy]` (ícone de funil da linha) | `WF bTwCb` `[bTwCc]` + `[bTwCd]` (`Icon F`) |
| `fornecedor` | `WF bTwCQ` `[bTwCR]` (dropdown) e `WF bTwBz` `[bTwCD]` (ícone de funil da linha) | `WF bTwCV` `[bTwCW]` + `[bTwCX]` (`Icon E`) |
| `numnf` | `WF bTwCJ` `[bTwCK]` | `WF bTwCn` `[bTwCo]` + `[bTwCp]` (`Icon H`) |
| `numpedido` | `WF bTwCL` `[bTwCP]` | `WF bTwCt` `[bTwCu]` + `[bTwCv]` (`Icon I`) |

Cada ícone de funil da linha fica desabilitado e destacado quando aquele valor já é o filtro corrente.

### 4.10 Exportar as entregas — `WF bUEUB`

1. `[bUEUh0]` plugin 1691509762858 (`ExportTable A`, bUEUb0): exporta o elemento de id **`grupoentregas`** (a tabela do popup)
   para um arquivo chamado **`bordero`**.
2. `[bUEUJ]` toast (plugin 1658328157117): "Salvo como Excel com sucesso!" — exibido **mesmo se a exportação falhar**.

`HTML D` (bUFGN, 12.416 chars, id `rg-relatorio`) está no mesmo grupo do botão; conteúdo desconhecido (`[DÚVIDA 10]`).

### 4.11 **Fechar a meta** — `WF bTwAj` (`btn fechar meta`)

É a operação mais importante da página. Seis ações, todas no navegador, **sem transação**:

1. `[bTwAk]` cria `Tbl.MetasFechadas` com:
   - `DataInicio = URL datainicio`, `DataFim = URL datafim`;
   - `QualVendedor = QualVendedor da linha`;
   - `MesNome = datainicio formatado "mmmm"`, `MesNumero = mês de datainicio`, `AnoNumero = ano de datainicio`;
   - `QuaisEntregas = rpg entregas vendedor` (as entregas do período **do vendedor da linha**);
   - `QuaisContasReceber = QuaisContasReceber dessas entregas`;
   - `TotalComissaoMegabox = Ipt valor faturado` (o realizado exibido);
   - `TotalComissaoVendedor = Ipt valor comissao` (a comissão exibida).
2. `[bTzXn]` cria `Tbl.ContasPagar` com:
   - `DataVencimento = agora + 10 dias`;
   - `QualVendedor` = o da meta fechada;
   - `StatusFinanceiro = Opt.StatusFinanceiro.A pagar`;
   - `valorcomissao (cpo.ValorComissao) = TotalComissaoVendedor` — **o que a MegaBox paga ao vendedor**;
   - `ValorTotal = TotalComissaoMegabox` — o realizado;
   - `QuaisEntregas` = as mesmas entregas; `QualMetaFechada` = a meta fechada.
3. `[bTzlB]` liga a conta a pagar de volta: `MetasFechadas.QuaisContasPagar = [a CP criada]`.
4. `[bTzXt0]` marca a meta mensal: `MetasMensais.QualMetaFechada = a meta fechada`.
5. `[bTzdP0]` marca **todas as entregas** da meta fechada: `Entregas.QualMetaFechada = a meta fechada`.
6. `[bTwAp]` `ResetGroup` em `gp painel metas` para redesenhar a tabela.

Regras implícitas e problemas (detalhados em §8.3):
- O que é gravado é **o número que estava na tela**, calculado no navegador — não recalculado no servidor.
- **`QuaisEntregas` usa `rpg entregas vendedor`, que filtra só por `QualVendedor`**, enquanto `Ipt valor faturado`
  usa filtros diferentes conforme o tipo de meta. Para meta de **Substituição** os dois discordam: o valor gravado é o das
  entregas substituídas, mas as entregas **vinculadas** são as próprias do vendedor. `[DÚVIDA 4]`
- Nada impede fechar com meta zerada ou fechar um período diferente do período da meta
  (o fechamento usa `datainicio`/`datafim` **da URL**, não `MetasMensais.DataInicio`/`DataFim`). `[DÚVIDA 5]`
- `MetasFechadas.MesNome` é gravado como texto, no formato/idioma do navegador.

### 4.12 Cancelar o fechamento — `WF bTzkM`, `WF bTzkZ` (SIM), `WF bTzlD` (NÃO)

- `WF bTzkM`: `[bTzkS]` mostra `pop apaga meta fechada`; `[bTzkX]` carrega nele a **meta mensal** da linha.
  Texto: "Você está apagando as metas fechadas desse vendedor. Essa ação não pode ser revertida!".
- `WF bTzkZ` (SIM):
  1. `[bTzkw]` apaga **a lista** `MetasMensais.QualMetaFechada.QuaisContasPagar` (tipo `custom.tbl_contasreceber1` = Contas a Pagar).
  2. `[bTzkk]` apaga o registro de `Tbl.MetasFechadas`.
  3. `[bTzlO]` esconde o popup.
- `WF bTzlD` (NÃO): `[bTzlJ]` só esconde o popup.

**Não limpa** `MetasMensais.QualMetaFechada` nem `Entregas.QualMetaFechada`: sobram referências apontando para um registro
apagado. Também **não verifica** se a conta a pagar já foi baixada/paga no financeiro — apaga assim mesmo. `[DÚVIDA 6]`

---

## 5. Cálculos e valores

Esta é a parte central do módulo. Todas as fórmulas abaixo estão **literalmente** no mapa; a origem de cada número está citada.

### 5.1 Meta, realizado e atingimento por vendedor (tabela `rpg metas`)

| Valor | Fórmula exata | Origem |
|---|---|---|
| **Meta** | `MetasMensais.ValorMeta` da linha | `Ipt meta` (bTvpl). Definida **por vendedor e por período**, com um `TipoMeta`. Não há meta por produto, por cliente nem por fornecedor. Default de digitação = `NiveisVendedores.MetaVenda` do nível escolhido (`ipt valo metamensal`, bTvyr). |
| **Realizado — meta Regular** | `rpg entregas gerais:filtered(QualVendedor = linha.QualVendedor AND QualVendedorSubstituto is empty):ValorComissaoBruto:sum` | `Ipt valor faturado` (bTvpn), 1ª condicional. Ou seja: entregas com status `Financeiro`, entregues no período, **do próprio vendedor**, descartando as que estão sob substituição. |
| **Realizado — meta Substituição** | `rpg entregas gerais:filtered(QualVendedorSubstituto = linha.QualVendedor):ValorComissaoBruto:sum` | `Ipt valor faturado`, 2ª condicional. As entregas que este vendedor cobriu no lugar de outro. |
| **Realizado — sem condicional casada** | *vazio* | `Ipt valor faturado` **não tem conteúdo padrão**: se `TipoMeta` estiver vazio, a célula fica vazia e a comissão também. |
| **% da meta (razão)** | `Ipt valor faturado ÷ Ipt meta` | `Ipt % da meta A` (bTvpt), oculto, `float_number` 2 casas. É uma **razão** (1 = 100%), não percentual. Divisão por zero se `ValorMeta = 0`. |
| **% da meta (barra)** | `floor(Ipt valor faturado × 100 ÷ Ipt meta)`, máximo 100 | `Progress-Bar A` (bTvpx). Cores: padrão < 50%; `primary` entre 50% e 100%; verde-destaque ≥ 100%. |
| **Comissão de vendas — meta batida** | `Ipt valor faturado × NiveisVendedores.ComissaoMetaBatida` (`cpo_metabonus_number`) quando **razão ≥ 1** | `Ipt valor comissao` (bTvqD), 1ª condicional. Note o `≥`: exatamente 100% já paga o fator cheio. |
| **Comissão de vendas — meta não batida** | `Ipt valor faturado × NiveisVendedores.ComissaoPadrao` (`cpo_fatorpremiacao_number`) quando **razão < 1** | `Ipt valor comissao`, 2ª condicional. |
| **Fator aplicado (exibição)** | `ComissaoMetaBatida` quando razão ≥ 1 **e também** `ComissaoMetaBatida` quando razão < 1 | `Ipt fator comissao` (bTzVX), oculto. **As duas condicionais gravam o mesmo campo — é bug** (a segunda deveria ser `ComissaoPadrao`). Como o input está oculto, não afeta o valor pago, só a exibição se alguém o revelar. |
| **Média para promoção** | `média de TotalComissaoMegabox das últimas N metas fechadas do vendedor`, N = `NiveisVendedores.QtdMetaBatida` (`cpo_mediasobenivel_number`) | `Ipt media` (bTvqh) sobre `rpg metasfechadas` (bTvqX). **Média simples**, não ponderada por período. |
| **Status nível** | "Subir Nível" quando `Ipt media > NiveisVendedores.MetaVenda` **E** `contagem de rpg metasfechadas = NiveisVendedores.QtdMetaBatida`; caso contrário "Manter Nível" | `Text L` (bTvpg). É só um **rótulo**: nada no app promove o vendedor automaticamente (`QualNivelVendedor` continua manual em `pop.CadastroUsuarios`). A comparação usa a meta do nível, não a meta mensal digitada. |

Os fatores `ComissaoPadrao` e `ComissaoMetaBatida` são multiplicadores diretos (ex.: 0,10 = 10%); o mapa não informa a
escala gravada — ver `[DÚVIDA 7]`.

### 5.2 Números coletivos (`Group Statistics`)

| Valor | Fórmula exata | Origem |
|---|---|---|
| **Venda do mês −1** | `Search(MetasFechadas: DataInicio ≥ datainicio:rounded_down(month):plus_months(-1) AND DataFim ≤ datainicio:rounded_down(month):plus_seconds(-1)):TotalComissaoMegabox:sum` | `ipt venda menos1` (bTzgL) |
| **Venda do mês −2** | idem com `plus_months(-2)` … `plus_months(-1):plus_seconds(-1)` | `ipt venda menos2` (bTzgP) |
| **Venda do mês −3** | idem com `plus_months(-3)` … `plus_months(-2):plus_seconds(-1)` | `ipt venda menos3` (bTzgQ) |
| **Rótulos dos meses** | `datainicio:plus_months(-1\|-2\|-3):format_date("mmmm")` | `ipt mes menos1/2/3` (bTzdc0/bTzdi0/bTzdo0) |
| **Meta coletiva** | seja `M = (venda−1 + venda−2 + venda−3) ÷ 3 × 1,25`: se `M < 80000` → **80000**; se `M > 80000` → **M** | `ipt meta coletiva` (bTzgt0), duas condicionais. **Não há valor padrão**: se `M = 80000` exatamente, nenhuma das duas casa e o campo fica **vazio** (e a barra e a meta diária quebram). O piso `80000` e o multiplicador `1,25` estão **fixos no elemento**, não em configuração. |
| **Faturado coletivo** | `rpg entregas gerais:filtered:ValorComissaoBruto:sum` | `ipt faturado coletivo` (bTzhB0). O `:filtered` **sem restrição nenhuma** = a soma de todas as entregas do período, de todos os vendedores, inclusive as que estão sob substituição (portanto **não é** a soma das colunas "Valor faturado" da tabela). |
| **Barra coletiva** | `floor(faturado coletivo × 100 ÷ meta coletiva)`, máximo 100 | `Progress-Bar B` (bTzhH0) |
| **Meta diária** | desconhecida — está dentro de `HTML B` (bUFBU, 23.501 chars) | `[DÚVIDA 8]` |

Repare que **a base do histórico coletivo é `MetasFechadas.TotalComissaoMegabox`**, ou seja: os três meses anteriores só
"existem" se as metas daqueles meses tiverem sido fechadas. Mês sem fechamento entra como zero e **derruba a meta coletiva**
para o piso de 80.000. E a soma não filtra vendedor: é o total da empresa naqueles meses.

### 5.3 Ranking

| Valor | Fórmula exata | Origem |
|---|---|---|
| **`MetasMensais.RankingVendas` (Regular)** | `Search(Entregas: status = Financeiro AND DtEntrega entre datainicio e datafim AND QualVendedor = meta.QualVendedor AND QualVendedorSubstituto vazio):ValorComissaoBruto:sum ÷ meta.ValorMeta` | `WF bTwAv` ação `[bUAhB]` |
| **`MetasMensais.RankingVendas` (Substituição)** | `Search(Entregas: status = Financeiro AND DtEntrega entre datainicio e datafim AND QualVendedorSubstituto = meta.QualVendedor):ValorComissaoBruto:sum ÷ meta.ValorMeta` | `WF bTwAv` ação `[bUAhP]` |
| **Posição** | ordenação de `rpg ranking vendedores` por `RankingVendas` desc | bTvsN |
| **Exibição** | `RankingVendas:format_number(percentage, 1 casa)` | pódio (bTvrZ, bTzYS0, bTzYj0) e lista (bTvsZ) |

`RankingVendas` é **a mesma conta** de `Ipt % da meta A`, feita duas vezes: uma no banco (gravada) e outra no navegador
(exibida). Podem divergir se ninguém recarregou depois de mudar o período (§4.2).

### 5.4 Totais e contadores auxiliares

| Valor | Fórmula | Origem |
|---|---|---|
| Total das metas cadastradas (popup) | `rpg metas mensais:ValorMeta:sum` | `Text LZZ` (bTvzd) |
| Total de comissão do detalhe | `rpg detalha entregas vendedor:valorcomissao:sum` | `Text OZ` (bTvuM) |
| Contador de linha do detalhe | `CellIndex / rpg detalha entregas vendedor:count` | `Text HZ` (bTvux) |
| Vencimento da comissão a pagar | `agora + 10 dias` | `WF bTwAj` `[bTzXn]` — prazo fixo no código |

**Todos os valores monetários são `number` no Bubble (ponto flutuante).** No banco novo: `numeric`.

### 5.5 Gráficos (hoje invisíveis, §8.1)

| Gráfico | Fonte | Agregação |
|---|---|---|
| "Entregas realizadas (por data de entrega)" (bTvsy) | `rpg entregas gerais` | agrupa por `QualVendedor`, **conta** `ValorComissaoBruto` |
| "Entregas em andamento (por data prevista de entrega)" (bTvsm) | `Search(Entregas: DtPrevEntrega entre datainicio/datafim AND status ≠ Cancelado AND status ≠ Financeiro)` | agrupa por `QualVendedor`, conta + **soma** `ValorComissaoBruto` |
| "Entregas canceladas (por data prevista de entrega)" (bTvss) | `Search(Entregas: status = Cancelado AND DtPrevEntrega entre datainicio/datafim)` | agrupa por `QualVendedor`, conta |

---

## 6. Integrações e backend workflows

| O quê | Onde | Detalhe |
|---|---|---|
| **Backend workflows** | — | **Nenhum.** A página não tem `ScheduleAPIEvent`. Fechamento de meta, geração de conta a pagar e cálculo de ranking rodam **inteiramente no navegador**. |
| **API Connector / App Connector** | — | Nenhuma chamada nesta página. |
| Plugin 1648823245313 (date range picker) v1.3.1 | `RangePicker A` (bTvtL), `dd filtro data metasmensais` (bTvzJ) | evento `AAd` = "aplicou"; `AAF` = período (`min`/`max`); `AAD` = valor inicial |
| Plugin 1658181838561 (progress bar) v1.3.0 | `Progress-Bar A` (bTvpx), `Progress-Bar B` (bTzhH0) | `AAF` = valor, `AAT` = máximo 100; só visual |
| Plugin 1691509762858 (export table) v1.3.0 | `ExportTable A` (bUEUb0) | ação `AAF` exporta o elemento de id `grupoentregas` como `bordero` |
| Plugin 1658328157117 (toast) v1.2.0 | `WF bUEUB` `[bUEUJ]` | mensagem de sucesso |
| Plugin 1680110374647 (toggle/switch) v1.5.13 | `Switch A` (bTvtV) | dentro de grupo morto |
| Plugin 1558770956236 v1.0.0 | `WF bTwAR` `[bTwAS]` | função desconhecida — `[DÚVIDA 9]` |
| chartjs (`chartjs-LineBarChart`) | bTvsy, bTvsm, bTvss | 3 gráficos de barras, hoje invisíveis |
| **HTML embutidos** | `HTML B` (23.501), `HTML A` (30.430), `HTML C` (90.181), `HTML D` (12.416) | conteúdo não está no mapa — `[DÚVIDA 8]` e `[DÚVIDA 10]` |
| Imagens do pódio | CDN do Bubble (`ouro.png`, `prata.png`, `bronze.png`) | URLs fixas no CDN — precisam ser reempacotadas no app novo |

---

## 7. Segurança e privacidade

1. **Sem privacy rule.** `Tbl.MetasMensais` e `Tbl.MetasFechadas` **não têm nenhuma regra de privacidade declarada** em
   `data-types.md` e estão **expostas na Data API**. `Tbl.Entregas`, `Tbl.ContasPagar`, `Tbl.NiveisVendedores`,
   `Tbl.GrupoCliFor` e `User` têm regra `everyone` com `view_all`/`search_for` = true. Resultado: **qualquer pessoa, mesmo
   deslogada, lê meta, realizado, comissão e ranking de todos os vendedores**, além da remuneração variável de cada um,
   dos valores por cliente/fornecedor e da tabela de níveis.
2. **Página sem guarda.** Nenhuma checagem no carregamento (§1). O filtro por hierarquia só existe na tabela `rpg metas`,
   é condicional de elemento (vale só no navegador) e tem um caminho aberto quando `QualPerfil` é vazio.
3. **Permissão por nome próprio.** O botão "fechar meta" libera para `hierarquia ≤ 1` **ou** para dois nomes de pessoa
   escritos no código (`"gabriella mesquita de sousa"`, `"danielle cristine silva reis"`). Quem mudar de nome perde o acesso;
   quem for cadastrado com o mesmo nome ganha. Tem de virar permissão nomeada.
4. **Escrita em massa a partir do navegador.** `WF bTwAv` grava `RankingVendas` em **todas** as metas do período a cada
   carregamento da página — qualquer usuário (ou robô) que abra `/metas` altera dados de todos os vendedores.
5. **Dinheiro criado no cliente.** `WF bTwAj` cria a conta a pagar com o valor que estava na tela. Quem manipular o DOM ou a
   requisição escolhe quanto a MegaBox vai pagar de comissão. É a falha mais grave da página.
6. **Exclusão financeira sem trava.** `WF bTzkZ` apaga contas a pagar (`Tbl.ContasPagar`) sem checar se já foram baixadas,
   sem log e sem desfazer os vínculos (§4.12).
7. **Dado pessoal em tela.** Nome completo e foto de todos os vendedores, no pódio e na lista, sem controle de acesso.
8. **Operações sem transação.** Fechamento (6 ações) e cancelamento (3 ações): se a aba fechar no meio, fica meta fechada
   sem conta a pagar, ou conta a pagar apagada com meta fechada viva.
9. **Sem trilha de auditoria.** Nada registra quem fechou, quem cancelou nem quando.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto

- `pop oculto` (bTvtE) — popup vazio, sem elementos e sem workflow.
- `Group O` (bTvtQ) com `Switch A` (bTvtV) e os textos "Entregas"/"Comissões" — oculto ao carregar, **nenhuma condicional ou
  workflow o mostra**. Em `metas_bkp` esse switch alternava a visão do ranking (`rpg ranking vendedores`, bTqkx, condicionais
  em bTqoP) — aqui sobrou a casca. *(uso de `metas_bkp` declarado.)*
- `Group PZ` (bUEzd) com **os 3 gráficos** (bTvsy, bTvsm, bTvss) — oculto ao carregar, nunca exibido. Os gráficos funcionam,
  mas ninguém os vê. Decidir se voltam (§9.2) ou se somem.
- Condicional de `pop entregas` `⟂ quando UrlParam("popentregas"):is_true → ` **sem nenhuma propriedade** — e o parâmetro
  `popentregas` não é gravado por nenhum workflow.
- `ipt venda menos1 copy` (bUCVp), `ipt venda menos2 copy` (bUCVv), `ipt venda menos3 copy` (bUCWB) — ocultos, com **as mesmas
  três buscas** dos visíveis. São 3 buscas a mais no banco a cada carregamento, sem ninguém ler o resultado.
- `Ipt fator comissao` (bTzVX) — oculto e com as duas condicionais gravando o mesmo valor.
- O popup se chama "AddEdita MetasMensais" mas **não edita** nada.
- `MetasMensais.Observacao` e `MetasMensais.DataPeriodo` — campos que nunca são escritos nem lidos.
- `User.RankingVendaRegular`, `User.RankingVendaMedia`, `User.RankingVendaSubstituto` e `Tbl.MetaAdicional`: eram a base do
  ranking e das metas extras na versão antiga (`metas_bkp`, WF bTrkb e `Table C` bTvMo). **A página atual não usa nenhum deles.**
  Confirmar se podem morrer na migração — `[DÚVIDA 11]`. *(uso de `metas_bkp` declarado.)*
- `NiveisVendedores.old_ValorBonus` — usado só em `metas_bkp` (bônus fixo por meta batida), abandonado aqui.

### 8.2 Duplicação

- `WF bTwCz` (`Icon J`) e `WF bTwDF` (`Button A`) são **idênticos**: esconder o popup e limpar 6 parâmetros. Um só handler.
- Cinco pares "mudou filtro → grava na URL" + "clicou no X → limpa da URL" (`bTwBs`/`bTwCh`, `bTwCE`/`bTwCb`,
  `bTwCQ`/`bTwCV`, `bTwCJ`/`bTwCn`, `bTwCL`/`bTwCt`) — um componente de filtro genérico resolve os dez.
- `WF bTwBx` (`filtrar cliente` na linha) duplica `WF bTwCE` (dropdown de cliente); `WF bTwBz` duplica `WF bTwCQ`.
- `WF bTwBa`, `bTwBf`, `bTwBn` — três "limpar filtro" iguais no popup de cadastro.
- A **mesma conta de atingimento** existe em três lugares: `Ipt % da meta A` (navegador), `Progress-Bar A` (navegador) e
  `WF bTwAv` (gravado em `RankingVendas`).
- As duas variações do `data_source` de `rpg detalha entregas vendedor` repetem 5 dos 6 filtros.
- `rpg entregas vendedor` (bTvqV) e as duas condicionais de `Ipt valor faturado` respondem à mesma pergunta com filtros
  diferentes (§8.3).
- Os dois `data_source` condicionais de `rpg metas` para `hierarquia ≤ 3` e o `data_source` padrão são o mesmo texto.
- `MetasFechadas.TotalComissaoMegabox` é gravado no campo de id `cpo_tributoipi_number` e `TotalComissaoVendedor` em
  `cpo_tributopiscofinsb_number`: a tabela `tbl_orcfornecedorescotacao` foi **reaproveitada** de outro domínio. Os nomes de
  coluna mentem sobre o conteúdo — cuidado na extração/carga.

### 8.3 Gambiarras e erros a corrigir

1. **Fechamento vincula entregas erradas na meta de Substituição** (`WF bTwAj` `[bTwAk]`): `QuaisEntregas` vem de
   `rpg entregas vendedor`, filtrado **só** por `QualVendedor = vendedor da linha`, enquanto `TotalComissaoMegabox` vem de
   `Ipt valor faturado`, que para `Substituição` filtra por `QualVendedorSubstituto`. Valor e entregas descrevem coisas
   diferentes. Para meta `Regular` também difere: `rpg entregas vendedor` **não** exclui as entregas sob substituição, que o
   valor exclui. `[DÚVIDA 4]`
2. **Duplo carimbo de `Entregas.QualMetaFechada`** (`[bTzdP0]`): a mesma entrega pode ser fechada na meta Regular de um
   vendedor e na meta de Substituição de outro — o segundo fechamento sobrescreve o vínculo do primeiro, mas **as duas contas
   a pagar continuam existindo**. Risco de pagar comissão em dobro pela mesma entrega. `[DÚVIDA 12]`
3. **Cancelamento deixa lixo**: não limpa `MetasMensais.QualMetaFechada` nem `Entregas.QualMetaFechada` (§4.12).
4. **`RankingVendas` gravado assimetricamente**: passo 1 pula metas fechadas, passo 2 não (§4.7).
5. **Meta coletiva vazia no empate**: sem valor padrão e com condicionais `<` e `>` (§5.2).
6. **Faturado coletivo ≠ soma da tabela**: `:filtered` sem restrição soma tudo, inclusive substituições (§5.2).
7. **Piso 80.000 e fator 1,25 fixos no elemento** — regra de negócio escondida numa condicional de input.
8. **Prazo de 10 dias da comissão fixo no workflow** (`[bTzXn]`).
9. **Dois nomes de pessoa como permissão** (§7.3).
10. **Fechamento usa o período da URL, não o da meta** (§4.11) — fechar com o range "errado" grava um período que não é o da meta.
11. **`status = Financeiro` por igualdade**: entregas que avançam para `Concluído` desaparecem da apuração (§3.1).
12. **Ordenação × exibição divergentes** no popup de detalhe: ordena por `DtPrevEntrega` (`cpo_dataentrega_date`), mostra
    `DtEntrega` (`cpo_dtentrega_date`).
13. **Rótulo "Num pedido" filtra o número da entrega** (`cpo_numeropedido_text` = `Entregas.NumeroEntrega`) — §3.5.
14. **Toast de sucesso incondicional** na exportação (`WF bUEUB`).
15. **Ranking mistura tipos de meta**: metas de Substituição disputam o pódio com as Regulares (§3.2).
16. **"Subir Nível" é só um rótulo** — nenhuma ação promove o vendedor (§5.1).
17. **Apagar meta mensal sem confirmação e sem perfil** (`WF bTzdR0`).
18. **Tudo no navegador**: a página baixa todas as entregas do período para somar em memória; o `Progress-Bar`, a comissão, a
    média e o ranking são calculados no cliente e alguns são **gravados** de lá.
19. **`MesNome` como texto formatado** em `MetasFechadas` — depende do idioma do navegador; a régua de promoção exibe esse texto.

### 8.4 Otimizações para o banco novo

- **`metas_mensais`** com chave natural `(vendedor_id, periodo_inicio, periodo_fim, tipo_meta)` **única**, `valor_meta numeric(14,2)`,
  `nivel_id` e `periodo daterange` (tipo nativo do Postgres, com índice GiST e constraint de não sobreposição por
  vendedor+tipo via `EXCLUDE USING gist`). Resolve de uma vez meta duplicada e período inconsistente.
- **`metas_fechadas`** com `UNIQUE (meta_mensal_id)` e FK `meta_mensal_id` — hoje o vínculo é um campo solto nos dois sentidos.
- **`meta_fechada_entregas`** (tabela de ligação) no lugar de `MetasFechadas.QuaisEntregas` (lista) e de
  `Entregas.QualMetaFechada`, com `UNIQUE (entrega_id)` para **impedir a mesma entrega em duas metas fechadas** (§8.3.2).
  Idem `meta_fechada_contas_pagar` no lugar de `QuaisContasPagar`.
- **`RankingVendas` não é coluna**: vira **view** `vw_ranking_metas`, calculada no banco a partir das entregas.
  Nada de `ChangeListOfThings` no carregamento da página.
- **Realizado como função SQL** `fn_realizado_meta(meta_id)` / view `vw_meta_atingimento`, com `sum(numeric)` no banco —
  **nunca baixar entregas para somar no cliente**. Agregação de metas não desce para o navegador.
- **Agregados coletivos** (`vw_metas_resumo_periodo`: meta coletiva, faturado coletivo, meta diária, vendas dos 3 meses
  anteriores) numa única view/função, não em 9 buscas soltas.
- **Parâmetros de negócio em tabela `config_metas`** com vigência: piso da meta coletiva (80.000), multiplicador (1,25),
  prazo de vencimento da comissão (10 dias), dias úteis para a meta diária. Nada fixo em componente.
- **`niveis_vendedores`**: renomear `cpo_metabonus_number` → `fator_comissao_meta_batida`, `cpo_fatorpremiacao_number` →
  `fator_comissao_padrao`, `cpo_mediasobenivel_number` → `meses_para_subir_nivel`; dropar `old_ValorBonus`.
  Guardar os fatores como `numeric(6,5)` e registrar a escala (§10, `[DÚVIDA 7]`).
- **Histórico de nível do vendedor** (`vendedor_nivel_historico` com vigência) — hoje é um campo único em `User`, e a meta
  guarda o nível do momento (o que, aliás, é o comportamento correto: a meta precisa congelar o nível).
- **`contas_pagar.origem = 'comissao_meta'` + FK `meta_fechada_id`** e **proibição de exclusão** quando já baixada
  (`ON DELETE RESTRICT` + regra de negócio), no lugar do `DeleteListOfThings`.
- **Status da entrega**: apurar por "elegível para meta" (enum `financeiro` **ou** `concluido`, conforme `[DÚVIDA 1]`), não por
  igualdade a um único valor.
- **Índices**: `entregas(status, dt_entrega)`, `entregas(vendedor_id, dt_entrega)`, `entregas(vendedor_substituto_id, dt_entrega)`,
  `metas_mensais(periodo_inicio, periodo_fim)`, `metas_mensais(vendedor_id)`, `metas_fechadas(vendedor_id, data_inicio desc)`.
- **Dinheiro `numeric(14,2)`** em toda parte; fatores `numeric(6,5)`; percentuais calculados, nunca gravados como float.
- `MetasFechadas.MesNome`/`MesNumero`/`AnoNumero` saem: derivam do período (`date_trunc`).
- Preferência de período do usuário (`UltimoDateRange`) em `user_preferences` **separada por tela** — hoje `metas` e
  `financeiro` brigam pelo mesmo campo.
- Imagens do pódio como assets do projeto, não URLs do CDN do Bubble.

---

## 9. Proposta para o app novo

### 9.1 Rotas

- `app/(app)/metas/page.tsx` — Server Component. Lê `searchParams` com os **mesmos nomes de hoje** (`datainicio`, `datafim`,
  `detalhaentregas`, `vendedor`, `cliente`, `fornecedor`, `numnf`, `numpedido`) e valida com zod. Default de período:
  preferência do usuário ou mês corrente em `America/Sao_Paulo`.
- `app/(app)/metas/entregas/page.tsx` (ou modal interceptado `@modal/(.)entregas`) — detalhe das entregas do vendedor,
  mantendo o popup de hoje mas com URL própria e paginação no servidor.
- `app/api/metas/export/route.ts` — exportação da lista de entregas (CSV/XLSX gerado **no servidor**, a partir da consulta,
  não do DOM).
- Layout/middleware: exige sessão e permissão de página (tabela `permissoes_pagina`, mesma regra do menu atual).
  Perfil Operador (hierarquia 4) só enxerga as próprias metas — agora **no servidor e na RLS**, não em condicional de tela.

### 9.2 Componentes

- `PeriodoRangePicker` — escreve `datainicio`/`datafim` na URL e salva a preferência.
- `PodioMetas` (1º/2º/3º) e `RankingList` — leem uma única consulta `vw_ranking_metas`.
- `ResumoColetivo` — meta coletiva, faturado coletivo, meta diária e barra; um só objeto vindo do servidor.
- `TabelaMetas` — a tabela principal: vendedor, meta, realizado, % (barra), comissão, régua de nível, ações.
  Nada calculado no cliente: as colunas vêm prontas da view.
- `DialogCadastroMeta` — criar **e editar** meta mensal, com o filtro/listagem de metas do período e o total.
- `DialogConfirmarFechamento` e `DialogCancelarFechamento` — com resumo do que será gravado/apagado.
- `TabelaEntregasDaMeta` — detalhe filtrável + botão de exportar.
- `GraficosEntregas` — os 3 gráficos de `Group PZ`, **se** forem retomados (`[DÚVIDA 13]`).

### 9.3 Server actions

| Ação | Regra | Precisa de teste |
|---|---|---|
| `criarMetaMensal({vendedorId, periodo, nivelId, tipoMeta, valorMeta})` | valida `inicio < fim`, unicidade por vendedor+período+tipo (sem sobreposição), vendedor ativo e de departamento Comercial/Administrativo, `valor_meta > 0`; grava o nível **vigente no momento** | **sim** |
| `editarMetaMensal(id, campos)` | bloqueada se a meta já estiver fechada | sim |
| `excluirMetaMensal(id)` | só perfil autorizado; bloqueada se fechada; confirmação explícita | sim |
| `fecharMeta(metaMensalId)` | **tudo no servidor, em uma transação**: recalcula realizado e comissão pela função SQL (ignora qualquer valor vindo do cliente), cria `metas_fechadas`, vincula as entregas (`UNIQUE` impede reuso), cria `contas_pagar` com vencimento = hoje + `config_metas.prazo_comissao_dias`, grava `fechada_por`/`fechada_em`. Rejeita se já fechada, se não houver entregas ou se alguma entrega já pertencer a outra meta fechada | **sim — o mais importante** |
| `cancelarFechamento(metaFechadaId)` | só Diretor; transação: recusa se alguma conta a pagar já estiver baixada/paga; solta as entregas, limpa o vínculo da meta mensal, apaga conta a pagar e meta fechada; grava log de auditoria | **sim** |
| `salvarPeriodoPreferido(range)` | preferência do usuário desta tela | não |
| `exportarEntregasDaMeta(filtros)` | gera o arquivo no servidor a partir da mesma consulta da tela | não |

**Cálculos que exigem teste automatizado** (regra 10 do `CLAUDE.md` — dinheiro é exato):
1. Realizado por tipo de meta — Regular (exclui entregas sob substituição) × Substituição (só as substituídas).
2. % de atingimento, incluindo `valor_meta = 0` (não pode dividir por zero) e o limiar **exatamente 100%**.
3. Comissão do vendedor nas duas faixas (`≥ 1` → fator meta batida; `< 1` → fator padrão), em `numeric`, com regra de
   arredondamento monetário definida.
4. Meta coletiva: média dos 3 meses × 1,25 com piso, **incluindo o caso de igualdade exata ao piso** e meses sem fechamento.
5. Média das N últimas metas fechadas e a regra "subir nível" (média > meta do nível **e** exatamente N metas fechadas).
6. Fechamento: valores gravados == valores calculados pela função SQL; conta a pagar com vencimento correto; idempotência;
   recusa de entrega já vinculada a outra meta fechada.
7. Cancelamento: recusa com conta a pagar já baixada; limpeza completa dos vínculos.
8. `vw_ranking_metas` == `%` exibido na tabela — hoje são dois caminhos que podem divergir.

### 9.4 Consultas / views SQL

- `vw_meta_atingimento(meta_mensal_id, vendedor_id, periodo, tipo_meta, valor_meta, realizado, percentual, fator_comissao, comissao_vendedor, nivel_id, meta_fechada_id)`
  — **uma linha por meta mensal**, com o realizado já somado no banco (`sum(entregas.valor_comissao_bruto)` com o filtro do
  tipo de meta) e a comissão já aplicada pela faixa. É a fonte única da tabela principal, do ranking e do fechamento.
- `vw_ranking_metas` — `vw_meta_atingimento` ordenada por `percentual desc`, com `rank() over ()`; opcionalmente separada por
  `tipo_meta` (`[DÚVIDA 14]`).
- `fn_realizado_vendedor(vendedor_id, periodo, tipo_meta) returns numeric` — a soma usada pela view e pelo `fecharMeta`
  (mesma função nos dois lugares, para não divergirem).
- `vw_metas_resumo_periodo(periodo)` — faturado coletivo, meta coletiva (média dos 3 meses fechados × multiplicador, com piso,
  lendo `config_metas`), meta diária e as vendas dos meses −1/−2/−3 numa consulta só.
- `vw_regua_nivel(vendedor_id)` — as N últimas metas fechadas (`N = nivel.meses_para_subir_nivel`), a média e a flag
  `pode_subir_nivel`.
- `vw_entregas_da_meta(meta_mensal_id)` — o detalhe do popup: entrega + fornecedor/filial de origem + cliente/filial de destino +
  produto + vendedor + comissão, já resolvido por join (hoje são 5 níveis de `:cpo.` encadeados no navegador).
- Todas com **RLS**: Diretor/Gerente/Analista veem tudo; Operador só `vendedor_id = auth.uid()`.

### 9.5 Tabelas envolvidas

`metas_mensais`, `metas_fechadas`, `meta_fechada_entregas`, `meta_fechada_contas_pagar`, `niveis_vendedores`,
`vendedor_nivel_historico`, `config_metas`, `entregas`, `contas_pagar`, `contas_receber`, `pedidos`,
`orcamentos_fornecedor`, `cotacao_produtos`, `produtos`, `grupos_clifor`, `enderecos_clifor`, `usuarios`,
`user_preferences`, `permissoes_pagina`, `auditoria_metas`.
Tabelas/campos do Bubble que **não** migram: `Tbl.MetaAdicional`, `User.RankingVenda*`, `NiveisVendedores.old_ValorBonus`
(§8.1, `[DÚVIDA 11]`).

---

## 10. Dúvidas

1. **[DÚVIDA] Quais status de entrega entram na apuração?** Hoje só `Opt.Etapas.Financeiro` (igualdade). Entregas que
   avançam para `Concluído` saem do realizado, mudando retroativamente metas já acompanhadas.
   *Recomendação padrão:* apurar por entrega **concluída e não cancelada** (`Financeiro` **ou** `Concluído`), congelando o
   conjunto no fechamento (`meta_fechada_entregas`). Confirmar com a operação antes de migrar os números.
2. **[DÚVIDA] O que a tela deve mostrar quando não há período?** (usuário novo, `UltimoDateRange` vazio).
   *Recomendação:* default no servidor = mês corrente (`America/Sao_Paulo`); nunca consultar sem intervalo.
3. **[DÚVIDA] O ranking deve incluir metas já fechadas?** `WF bTwAv` `[bUAhB]` pula metas fechadas nas Regulares e
   `[bUAhP]` não pula nas de Substituição.
   *Recomendação:* a view calcula **todas** as metas do período; meta fechada usa o valor congelado, meta aberta usa o
   realizado corrente.
4. **[DÚVIDA] Na meta de Substituição, quais entregas devem ser vinculadas ao fechamento?** O valor usa
   `QualVendedorSubstituto`, a lista gravada usa `QualVendedor` (§8.3.1).
   *Recomendação:* vincular **exatamente** as entregas que produziram o valor (mesmo filtro), em transação, com o total
   recalculado no servidor.
5. **[DÚVIDA] O fechamento deve usar o período da meta ou o período da tela?** Hoje usa `datainicio`/`datafim` da URL.
   *Recomendação:* usar o período da própria `metas_mensais` e recusar o fechamento se o filtro da tela não coincidir.
6. **[DÚVIDA] Cancelar fechamento pode apagar conta a pagar já baixada?** Hoje apaga sem checar.
   *Recomendação:* recusar o cancelamento se houver conta a pagar baixada/paga; exigir estorno no financeiro antes.
7. **[DÚVIDA] Em que escala estão `ComissaoPadrao` e `ComissaoMetaBatida`?** (0,10 = 10% ou 10 = 10%). O mapa só mostra a
   multiplicação direta pelo realizado.
   *Recomendação:* tratar como fração (`numeric(6,5)`), validar na migração comparando com as comissões já geradas em
   `Tbl.ContasPagar` e abortar a carga se divergir.
8. **[DÚVIDA] Como se calcula a "Meta Diária"?** Está dentro de `HTML B` (bUFBU, 23.501 caracteres), fora do mapa.
   *Recomendação:* abrir o elemento no editor Bubble antes de implementar; se não houver regra clara, adotar
   `meta coletiva ÷ dias úteis restantes do período`, parametrizado em `config_metas`.
9. **[DÚVIDA] O que faz a ação do plugin 1558770956236 `AAC`** no carregamento (`WF bTwAR` `[bTwAS]`)? A mesma aparece em
   `financeiro`. *Recomendação:* tratar como não funcional e não reproduzir até identificar.
10. **[DÚVIDA] O que mostram `HTML A` (30.430), `HTML C` (90.181, só Diretor) e `HTML D` (12.416, id `rg-relatorio`)?**
    *Recomendação:* conferir no editor; se forem relatório/estilo, reescrever como componente React; se forem código morto,
    descartar.
11. **[DÚVIDA] `Tbl.MetaAdicional`, `User.RankingVenda*` e `old_ValorBonus` podem morrer?** Usados só na versão antiga
    (`metas_bkp`). *Recomendação:* não migrar a estrutura; exportar os dados históricos para arquivo antes de descartar.
12. **[DÚVIDA] A mesma entrega pode contar em duas metas (Regular de um vendedor e Substituição de outro)?** Hoje pode, e
    gera duas contas a pagar. *Recomendação:* proibir (`UNIQUE` em `meta_fechada_entregas`) e definir de quem é a comissão
    quando há substituto — recomendação padrão: do substituto, que é o que o realizado já faz.
13. **[DÚVIDA] Os 3 gráficos e o switch "Entregas/Comissões" devem voltar?** Estão prontos e ocultos.
    *Recomendação:* não reproduzir no primeiro corte; perguntar aos usuários.
14. **[DÚVIDA] O pódio deve misturar metas Regular e Substituição?** Hoje mistura.
    *Recomendação:* rankear só as metas `Regular` e mostrar as de Substituição em lista à parte.
15. **[DÚVIDA] "Subir Nível" deve virar ação?** Hoje é só rótulo; a promoção é manual em `pop.CadastroUsuarios`.
    *Recomendação:* manter como sugestão, com botão "promover" auditado para Diretor.
16. **[DÚVIDA] O piso de R$ 80.000 e o multiplicador 1,25 da meta coletiva continuam valendo?** Estão fixos no elemento e
    sem data. *Recomendação:* levar para `config_metas` com vigência, começando com os valores atuais.
17. **[DÚVIDA] O prazo de 10 dias para o vencimento da comissão é regra ou chute?**
    *Recomendação:* parametrizar em `config_metas` com o valor atual (10 dias corridos).
18. **[DÚVIDA] Quem pode fechar meta, sem os dois nomes em código?**
    *Recomendação:* permissão nomeada `metas.fechar`, concedida a Diretor e Gerente, mais concessão individual em
    `permissoes_pagina`; migrar as duas pessoas citadas como concessão individual.
19. **[DÚVIDA] A meta mensal precisa coincidir com mês-calendário?** Hoje são datas livres, mas `MesNome`/`MesNumero` e as
    buscas dos 3 meses anteriores pressupõem mês fechado.
    *Recomendação:* exigir período alinhado ao mês (primeiro ao último dia) e derivar mês/ano do período.

---

## 11. Cobertura — todos os 33 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTwAR | PageLoaded | plugin desconhecido, abre `pop entregas` se houver `detalhaentregas`, repõe `datainicio`/`datafim` do `UltimoDateRange`, dispara CalculaRanking | 4.1 |
| 2 | bTwAd | `RangePicker A` aplicado (plugin `AAd`) | grava `User.UltimoDateRange` e o período na URL | 4.2 |
| 3 | bTwAj | Clique `btn fechar meta` | cria `MetasFechadas`, cria `ContasPagar` (venc. +10 dias), liga CP↔meta fechada, marca a meta mensal e as entregas, redesenha o painel | 4.11, 5.1 |
| 4 | bTwBV | Clique `Button B` "Criar Metas" | abre `pop.AddEdita MetasMensais` | 4.3 |
| 5 | bTwBa | Clique `bt reset filter vendedor metasmensais` | reseta o filtro de vendedor do popup | 4.4 |
| 6 | bTwBf | Clique `bt reset nivel metasmensais` | reseta o filtro de nível do popup | 4.4 |
| 7 | bTwBh | Clique `Button C` "Gravar" | cria a meta mensal (período, nível, vendedor, valor, tipo) e limpa o formulário | 4.3 |
| 8 | bTwBn | Clique `bt reset filter datas metasmensais` | reseta o filtro de datas do popup (volta ao período da URL) | 4.4 |
| 9 | bTzVj | Clique `Icon R` | fecha `pop.AddEdita MetasMensais` | 2.2, 4.3 |
| 10 | bTzWI | Clique `Icon B` (pessoas) | abre `pop.CadastroUsuarios A` | 4.6 |
| 11 | bTzXF | Clique `Icon L` (pódio) | abre `pop.ConfigSistema A` (níveis de vendedor) | 4.6 |
| 12 | bTwBB | Clique `Icon K` (recarregar) | dispara CalculaRanking | 4.7 |
| 13 | bTziN | Clique `btn ver entregas` | grava `vendedor` e `detalhaentregas` na URL → abre o detalhe | 4.8 |
| 14 | bTzkM | Clique `btn cancela fechamento meta` | abre `pop apaga meta fechada` com a meta mensal da linha | 4.12 |
| 15 | bTzkZ | Clique `Button D` (SIM) | apaga as contas a pagar da meta fechada, apaga a meta fechada, fecha o popup | 4.12 |
| 16 | bTzlD | Clique `Button E` (NÃO) | fecha o popup sem apagar | 4.12 |
| 17 | bTwAv | CustomEvent «CalculaRanking» | grava `RankingVendas` em todas as metas do período (Regular sem meta fechada; Substituição sem esse filtro) | 4.7, 5.3 |
| 18 | bUEUB | Clique `Button F` "Exportar para excel" | exporta a tabela `grupoentregas` como `bordero` e mostra toast de sucesso | 4.10 |
| 19 | bTwBs | Muda `dd filtra filtravendedor` | grava `vendedor` na URL | 4.9 |
| 20 | bTwBx | Clique `filtrar cliente` (linha) | grava `cliente` na URL | 4.9 |
| 21 | bTwBz | Clique `filtrar fornecedor` (linha) | grava `fornecedor` na URL | 4.9 |
| 22 | bTwCE | Muda `dd filtra cliente` | grava `cliente` na URL | 4.9 |
| 23 | bTwCJ | Muda `dd filtra numnf` | grava `numnf` na URL | 4.9 |
| 24 | bTwCL | Muda `dd filtra num pedido` | grava `numpedido` na URL (bate em `NumeroEntrega`) | 4.9, 3.5 |
| 25 | bTwCQ | Muda `dd filtra fornecedor` | grava `fornecedor` na URL | 4.9 |
| 26 | bTwCV | Clique `Icon E` | limpa o filtro de fornecedor (grupo + URL) | 4.9 |
| 27 | bTwCb | Clique `Icon F` | limpa o filtro de cliente | 4.9 |
| 28 | bTwCh | Clique `Icon G` | limpa o filtro de vendedor | 4.9 |
| 29 | bTwCn | Clique `Icon H` | limpa o filtro de NF do fornecedor | 4.9 |
| 30 | bTwCt | Clique `Icon I` | limpa o filtro de número do pedido | 4.9 |
| 31 | bTwCz | Clique `Icon J` (X do popup) | fecha `pop entregas` e limpa 6 parâmetros da URL | 4.8, 8.2 |
| 32 | bTwDF | Clique `Button A` "Fechar" | idêntico ao bTwCz | 4.8, 8.2 |
| 33 | bTzdR0 | Clique `Icon Q` | apaga a meta mensal da linha (sem confirmação, sem restrição de perfil) | 4.5 |
