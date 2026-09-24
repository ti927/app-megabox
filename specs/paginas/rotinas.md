# Spec funcional — página `rotinas` (Bubble `bTeSL`)

Fonte: `mapa/pagina-rotinas.md` (116 elementos · 39 workflows · 34 ações · 17 condicionais · 1 popup · 2 repeating groups · 1 tabela · 1 estado customizado).
Apoio: `mapa/backend-workflows.md` (é o arquivo central desta tela), `mapa/data-types.md`, `mapa/option-sets.md`,
`mapa/integracoes.md`, `mapa/reusable-tool.MenuPaginas.md`, `mapa/reusable-tool.Cabecalho.md`.

**Se esta spec e o mapa discordarem, o mapa manda.**

Glossário usado nesta spec:
- **Rotina** = um botão desta tela que dispara alteração/exclusão **em massa**, direto (`ChangeListOfThings` /
  `DeleteListOfThings`) ou por `ScheduleAPIEvent` em um backend workflow.
- **CR** = `Tbl.ContasReceber` (`tbl_contasreceber`), comissão a receber do fornecedor.
- **CP** = `Tbl.ContasPagar` (`tbl_contasreceber1`), comissão a pagar ao vendedor.
- **Importado** = registro criado pela carga do sistema antigo (`cpo.Importado = true` em CR, Entregas, OrcFornecedoresCotacao, ContasPagar).
- **Clifor** = `Tbl.GrupoCliFor` (`tbl_clientes`), o grupo cliente/fornecedor; **filial** = `Tbl.EnderecosCliFor`.

---

## 1. Propósito e quem usa

Tela "Manutenção" (`Opt.MenuPaginas.Manutenção`, `página = rotinas`, `hierarquia = 1`). Não é tela de operação: é o
**painel de rotinas de manutenção e carga em massa** do banco. Trinta e oito botões, cada um disparando uma correção de
dado, um backfill ou uma exclusão sobre **toda a tabela**, quase sempre sem filtro, sem confirmação e sem log.

O que a tela faz, em blocos:
1. **Carga do sistema antigo** — importar `Tbl.ContasReceberImportado` gerando cotação → proposta → pedido → entrega → CR
   (WF bTmGz), corrigir os valores da carga (bTmIO) e **apagar tudo o que a carga criou** (bTmUn0).
2. **Backfill de campos criados depois dos dados** — vendedor, modelo de produto no orçamento, endereços da CR, NF do
   fornecedor na CR, data do último histórico, boleto único virando lista.
3. **Normalização** — nome do clifor em maiúsculo, e-mail de contato, cópias de e-mail dos usuários, info adicional do
   clifor replicada nas filiais.
4. **Correções financeiras** — gerar comissões passadas (bTpoG), recalcular comissão a pagar (bTpoX), limpar baixas de CR (bTprd).
5. **Restos de outras telas** — editor de endereço inline, busca de cliente quebrada, seletor "Monthly/Yearly" de template
   e um botão "testar pdf".

**Quem usa:** só a Diretoria — na prática, o desenvolvedor/administrador. `Opt.MenuPaginas.Manutenção` declara
`hierarquia = 1` (Diretor, ver `Opt.PerfilUsuario`) e é a **única página do menu sem `DepartamentosAcessiveis`**.
Esse atributo, porém, não bloqueia nada.

### Controle de acesso de fato (só no navegador)

Esta é a página mais perigosa do app e **não tem nenhuma trava de servidor**. O que existe hoje, exatamente:

1. **Único controle: o link do menu.** Em `tool.MenuPaginas`, `Link A` nasce com `link_disabled = True` e só é habilitado
   por condicional quando a linha de `Tbl.ConfigSistema` com `QualPagina = Manutenção` listar o departamento
   (`QuaisDeptos`), o perfil (`QuaisPerfis`) ou o próprio usuário (`QuaisUsuarios`) do `CurrentUser`. É um `link_disabled`
   de CSS: quem souber a URL entra do mesmo jeito.
2. **A página não verifica nada ao carregar.** O único workflow de `PageLoaded` é o **WF bTeTs**, cuja única ação
   (`SetCustomState` bTeTt) grava `var_qualsubmenu_ = Opt.MenuConfig.submenu1` no cabeçalho. Não há redirecionamento de
   deslogado, não há checagem de `CurrentUser:cpo.QualPerfil` nem de `cpo.IsDev`. **Digitar `/rotinas` na barra de
   endereços basta.**
3. **Nenhum botão tem `SÓ SE`, condicional de perfil ou `button_disabled`.** Os 17 condicionais da página são: máscara de
   CNPJ/CPF (4), default do rádio CPF/CNPJ (1), zebra da lista (1), margem do menu (1), visibilidade do menu (2),
   troca fuzzy/exata da busca (4) e destaque dos botões Monthly/Yearly (4). **Nenhum é de permissão.**
4. **Nenhuma confirmação.** O popup `pop apagar registro` ("Esta ação não pode ser revertida! Deseja continuar?") existe na
   página e **nenhum workflow o abre** — nem o botão que apaga contas a receber importadas. O `Alert alt processando`
   ("Aguarde, gravando registros. Não feche essa janela!") também nunca é acionado.
5. **Os dados que as rotinas alteram são públicos.** `Tbl.GrupoCliFor`, `Tbl.EnderecosCliFor`, `Tbl.ContasReceber`,
   `Tbl.ContasPagar`, `Tbl.Entregas`, `User` e `Tbl.ConfigSistema` têm regra de privacidade `everyone` com
   `view_all`/`search_for` = true, e o app expõe a Data API **e a Workflow API** (`integracoes.md`).

Resumo: hoje **qualquer usuário logado — e, dependendo da exposição dos endpoints (§7), possivelmente qualquer pessoa com
a URL — consegue estornar todas as baixas do financeiro, zerar a carteira de todos os vendedores, liberar todos os
clientes bloqueados ou apagar pedidos, entregas e contas a receber, com um clique e sem registro de quem fez.**

---

## 2. Estrutura da tela

### 2.1 Layout geral (de cima para baixo)
1. **Cabeçalho** `tool.Cabecalho` (bTeSS, USA Reusable `tool.Cabecalho`) — fornece o estado `var_showmenu_`.
2. **Menu lateral** `tool.MenuPaginas A` (bToTF, USA Reusable `tool.MenuPaginas`), oculto ao carregar; aparece quando
   `cabecalho.var_showmenu_` é verdadeiro (e o grupo principal ganha `margin_left = 250`).
3. Grupo `gp elmentos aplicativo` (bTeSM, `unique_id = "documento"`):
   - **`Group J` (bTexP) — a barra de rotinas.** Uma coluna com os 38 botões, sem título, sem agrupamento e sem separação
     visual entre "corrige um campo" e "apaga registros". Contém também o plugin `PDFGenerator A` (bTmZk) e os ícones
     `anterior` (bTexD) / `proxima` (bTexJ).
   - **`rpg contas importadas` (bTmGn)** — repeating group de `Tbl.ContasReceberImportado`; é a fila da carga (§3.1).
   - **`Icon E` (bThhx)** — ícone de envelope que dispara um plugin de e-mail não instalado (§8.1).
   - **`rpg enderecos clifor` (bTeqS)** — repeating group de `Tbl.EnderecosCliFor` com formulário de edição inline por
     linha (§3.2). Não é rotina: edita um registro por vez.
   - **`Table A` (bThfN)** — tabela de `Tbl.Cotacao`, 3 colunas e 3 linhas fixas; só a primeira célula tem conteúdo
     (`Dropdown B` de usuários e `Button B` **sem workflow**). Esqueleto abandonado.
   - **`Group K` (bTkDF) → `gp busca cliente`** — busca de clifor (`src busca chave` fuzzy / `src busca exata`
     autocomplete) com checkbox "Busca exata" e ícone de limpar. Busca **quebrada** (§3.3).
   - **`Mo/yr selector dash` (bUCUt)** — botões "Monthly"/"Yearly" com o estado `window_`; nada lê esse estado.
   - **`Group N` (bUCVS)** — botões "Create" e "Cancel" (`Button JZ` bUCVT/bUCVX), **sem workflow**.
4. **`pop apagar registro` (bTeTa)** — popup de confirmação, nunca aberto.
5. **`alt processando` (bTeTZ)** — alerta "Aguarde, gravando registros", nunca acionado.

Os botões, na ordem em que aparecem (rótulo real, tal como está na tela — em minúsculas, sem padrão):

| Elemento | Rótulo do botão | WF | Seção |
|---|---|---|---|
| `Button A` (bTeyD) | nome clifor maiusculo | bTeyJ | 4.2 |
| `Button E` (bThkx) | cliente lucro real | bThlD | 4.3 |
| `Button F` (bTiEW0) | copiar boleto unico das entregas para lista de boletos | bTiEc0 | 4.4 |
| `Button G` (bTiPn) | gravar fornecedor CONTAS RECEBER | bTiPt | 4.5 |
| `Button H` (bTiTP) | copia NF venda p/ contas receber | bTiTV | 4.6 |
| `Button K` (bTjLs) | copia NF venda p/ contas receber | — (sem WF) | 8.2 |
| `Button J` (bTjLm) | copia NF venda p/ contas receber | — (sem WF) | 8.2 |
| `Button I` (bTjLg) | preenche dt ultimo historico vazio | bTjMt | 4.8 |
| `Button L` (bTjNF) | atualiza dt ultimo historico | bTjLy | 4.7 |
| `Button M` (bTjQY) | clientes carteira julio | bTjQe | 4.9 |
| `Button N` (bTjRf) | atribui clifor aos enderecos | bTjRl | 4.10 |
| `Button O` (bTkRh) | copiar email login para email contato | bTkRn | 4.11 |
| `Button P` (bTmGt) | importar contas receber | bTmGz | 4.12 |
| `Button Q` (bTmII) | att receber importado | bTmIO | 4.13 |
| `Button T` (bTmUH0) | deletar a receber importados | bTmUn0 | 4.14 |
| `Button R` (bTmPn0) | desativar enderecos cujo clifo desativado | bTmPt0 | 4.15 |
| `Button S` (bTmQZ) | copiar info adicionald do clifor para filial | bTmQf | 4.16 |
| `Button W` (bTnyt1) | copiar info adicional do clifor para 1A filial | bTnyz1 | 4.17 |
| `Button U` (bTmZY) | testar pdf | bTmZe | 4.18 |
| `Button V` (bTnwB0) | copiar configs smtp p/ tds usuarios | bTnwH0 | 4.19 |
| `Button X` (bToPB0) | tirar email adm das copias do usuario, colocar somente usuario | bToPH0 | 4.20 |
| `Button Y` (bToTz) | copiar data nfmegabox para data recebimentobanco | bToUF | 4.21 |
| `Button Z` (bToWj0) | copiar endereços pedido para contas receber | bToWp0 | 4.22 |
| `Button AZ` (bTpoA) | gerar comissoes passadas | bTpoG | 4.23 |
| `Button BZ` (bTpoR) | corrigir valor comissao | bTpoX | 4.24 |
| `Button CZ` (bTprX) | tirar nota 1102 das contas a receber | bTprd | 4.25 |
| `Button DZ` (bTtjc) | atribuir CRIADOR ao VENDEDOR | bTtkx | 4.26 |
| `Button EZ` (bTveL) | atribuir liberado = yes para endereços | bTveR | 4.27 |
| `Button FZ` (bTvez) | atribuir ativo = yes grupoclifor vazio | bTvfF | 4.28 |
| `Button GZ` (bTvmV) | atribui clientes ativo = yes para ativos=não | bTvmb / bTvmh (vazios) | 8.1 |
| `Button HZ` (bUAhn) | atribuir modelo produto ao orcamento | bUAht | 4.29 |
| `Button IZ` (bUCUu/bUCUv) | Monthly / Yearly | bUCVB / bUCVL | 8.1 |
| `Button JZ` (bUCVT/bUCVX) | Create / Cancel | — (sem WF) | 8.1 |
| `Button B` (bThgn) | (sem texto, dentro de `Table A`) | — (sem WF) | 8.1 |
| `Button C`/`Button D` (bTeTm/bTeTn) | SIM / NÃO do popup de confirmação | — (sem WF) | 8.1 |

### 2.2 Popups e reusables
| Elemento | Tipo | Uso nesta página |
|---|---|---|
| `tool.Cabecalho` (bTeSS) | Reusable | Barra superior; recebe `SetCustomState var_qualsubmenu_` no WF bTeTs |
| `tool.MenuPaginas A` (bToTF) | Reusable | Menu lateral; onde mora a (única) trava de acesso |
| `pop apagar registro` (bTeTa) | Popup | Confirmação de exclusão — **código morto**, nenhum WF o abre e os botões SIM/NÃO não têm workflow |
| `alt processando` (bTeTZ) | Alert | "Não feche essa janela" — **código morto**, nenhum WF o exibe |
| `PDFGenerator A` (bTmZk) | Plugin 1578535742499 | Gerador de PDF; só o botão "testar pdf" (WF bTmZe) o usa. Plugin **não consta** na lista de instalados de `integracoes.md` |
| `MaskInput cnpj` (bTetx), `MaskInput cep` (bTeuN) | Plugin 1609444246883 (instalado, v2.0.0) | Máscaras do editor de endereço inline |

### 2.3 Parâmetros de URL
**Nenhum.** Não há `UrlParam` em nenhum elemento ou workflow da página. A tela é stateless: entra-se e clica-se.
Isso também significa que **nenhuma rotina aceita filtro** — todas rodam sobre a tabela inteira.

### 2.4 Estados customizados
| Estado | Elemento | Tipo | Quem grava | Quem lê |
|---|---|---|---|---|
| `window_` | `Mo/yr selector dash` (bUCUt) | number | WF bUCVB (=1) e WF bUCVL (=2) | só os condicionais de cor dos próprios botões |
| `var_qualsubmenu_` | `tool.Cabecalho` (estado do reusable) | option | WF bTeTs (ação bTeTt) no `PageLoaded` | o reusable `tool.Cabecalho` |

---

## 3. Dados

### 3.1 Fila da carga — `rpg contas importadas` (bTmGn)
Repeating group do tipo `Tbl.ContasReceberImportado` (19 campos: a planilha do sistema antigo já com os vínculos
resolvidos — `numNF`, `qtd`, `valornota`, `valorcomissao`, `dtnf`, `dtvcto`, `dtvenda`, `dtentrega`, `uf`, `cliente`,
`fornecedor`, `produto`, `vendedor` em texto, mais `QualCliente`, `QualFornecedor`, `QualProduto`, `QualVendedor`,
`QualOrigem`, `QualDestino` já apontando para os registros do app).

O RG é a **entrada da rotina de importação**: o WF bTmGz manda `El[rpg contas importadas]:get_list_data` inteiro como
parâmetro do backend workflow e `:count` como tamanho da fila. A lista que o navegador tem em mãos é o lote a importar.

[DÚVIDA 1] O mapa **não traz `data_source` deste RG** — não dá para saber se lista todos os registros, se filtra os ainda
não processados ou se pagina. Recomendação padrão: tratar como "todos os registros de `ContasReceberImportado`".

### 3.2 Endereços — `rpg enderecos clifor` (bTeqS)
Repeating group de `Tbl.EnderecosCliFor`, uma linha por endereço, altura mínima 85px e zebra
(`⟂ CellIndex:modulo(2):equals(1)`). Cada linha é um **formulário de edição inline**: CNPJ/CPF (`RadioButtons cpfcnpj`
sobre `Opt.TipoPessoa`, com máscara que alterna entre `000.000.000-00` e `00.000.000-0000/00`), endereço, complemento,
bairro, município, UF (`Dropdown` sobre `Opt.UFs`), CEP e localização (autocomplete geográfico do Google), mais o ícone
de salvar `Icon B` (bTevh).

Os `content` dos inputs vêm de uma **consulta de CNPJ/CEP do plugin 1602683113110** (`_p_body.logradouro`,
`_p_body.numero`, `_p_body.complemento`, `_p_body.bairro`, `_p_body.municipio`, `_p_body.cep`, `_p_body.uf`), e o default
da UF faz `All(Opt.UFs):filtered(uf_texto = resposta da API)`. Ao lado de cada input há um `Text` com o valor atual
gravado (`Text I`…`Text O`) — a tela serve para **comparar o cadastro com a Receita e corrigir manualmente**.

[DÚVIDA 2] O mapa também não traz o `data_source` deste RG. Recomendação padrão: assumir "todos os endereços", que é o
que explicaria os ícones `anterior`/`proxima` (WF bTexr/bTexg, ambos vazios) como paginação nunca implementada.

### 3.3 Busca de clifor — `gp busca cliente` (bTkDL)
Dois campos alternados pelo checkbox `chk buscaexata` (bTkDH):
- `src busca chave` (bTkDM, `unique_id = "fuzzy"`) — input de texto, visível com o checkbox desmarcado.
- `src busca exata` (bTkDR) — autocomplete sobre
  `Search(Tbl.GrupoCliFor: Ativo = El[dd ativos]:get_data:boolean AND QualTipoCliFor = El[dd tipo clifor]:get_data;
  sort dinâmico "{El[dd ordem]:get_data:nomecampo}")`, buscando em `cpo_nomecliente_text`.

**A busca está quebrada:** `dd ativos`, `dd tipo clifor` e `dd ordem` **não existem nesta página** (a árvore só tem dois
`Dropdown`: `ipt novocliente uf` e `Dropdown B`). Foi colada de `cadastros` sem os filtros. Com as referências vazias, as
constraints `Ativo = vazio` e `QualTipoCliFor = vazio` tendem a não retornar nada. Além disso, **nenhum workflow consome
o resultado da busca** — o único WF é o bTkDT, que reseta o grupo. Ver §8.1.

### 3.4 Tabela de cotações — `Table A` (bThfN)
Tabela de `Tbl.Cotacao` com 3 colunas (`TableMainAxis` bThgJ/bThgK/bThgL), cabeçalho e 3 linhas fixas
(`fixed_number_repeating_axis_count = 3`). Só a primeira célula tem conteúdo: `Dropdown B` (bThgh) com `Search(User)`
exibindo `NomeModelo`, e `Button B` (bThgn) sem workflow. Sem fonte de dados e sem lógica.

### 3.5 As buscas que as rotinas fazem (o que não aparece na tela)
São o **alvo** de cada rotina. Todas rodam sem filtro salvo indicação em contrário:

| Busca | Onde | Tamanho do alvo |
|---|---|---|
| `Search(Tbl.GrupoCliFor)` | bTeyP, bTjME, bTjQk | todos os clientes e fornecedores |
| `Search(Tbl.GrupoCliFor: UltimoHistoricoData is_empty)` | bTjMv | só os sem data |
| `Search(Tbl.GrupoCliFor: Ativo is_empty)` | bTvfL | só os com o campo vazio |
| `Search(Tbl.EnderecosCliFor)` | bTjRs, bTmPz0, bTveX | todos os endereços |
| `Search(Tbl.EnderecosCliFor: TipoClifor = Cliente)` | bThlI | todos os endereços de cliente |
| `Search(Tbl.ContasReceber)` | bTiPz, bTiTb, bTprl, bToXA0 | **todas** as contas a receber |
| `Search(Tbl.ContasReceber: Importado = true)` | bTmUN0 (7 passos) | tudo o que a carga criou |
| `Search(Tbl.ContasReceber: DataNfMegabox is_not_empty)` | bToTv | CRs já faturadas |
| `Search(Tbl.ContasPagar)` | bTpoX (parâmetro `quaiscomissoes`) | todas as contas a pagar |
| `Search(Tbl.Entregas)` | bTiEi0 | todas as entregas |
| `Search(Tbl.Entregas: StatusEntrega = Opt.Etapas.Financeiro)` | bTpoG (parâmetro `quaisentregas`) | entregas em etapa financeira |
| `Search(Tbl.Cotacao)`, `Search(Tbl.OrcFornecedoresCotacao)`, `Search(Tbl.Propostas)`, `Search(Tbl.Pedido)` | bTtji | tudo |
| `Search(Tbl.OrcFornecedoresCotacao)` | bUAhl | todos os orçamentos de fornecedor |
| `Search(Tbl.OrcFornecedoresCotacao: Importado = true)`, `Search(Tbl.Entregas: Importado = true)` | bTmHw | só o que veio da carga |
| `Search(User)` | bTkRt, bTnwN0, bToPN0 | todos os usuários |
| `Search(Tbl.GrupoCliFor):filtered(QuaisEnderecos:count = 1):QuaisEnderecos` | bTmQr | endereços de clifor com uma filial |
| `Search(Tbl.GrupoCliFor):filtered(QuaisEnderecos:count > 1):QuaisEnderecos` | bTnzM1, bTnzR1 | endereços de clifor com várias filiais |

---

## 4. Funcionalidades e regras de negócio

Convenção desta seção: para cada rotina — **dispara**, **backend WF**, **o que altera**, **idempotente?**,
**reversível?**, **rodar duas vezes**.

### 4.1 Carregamento da página
- **Dispara:** `PageLoaded` — **WF bTeTs**.
- **Ação:** `SetCustomState` [bTeTt] em `El[tool.Cabecalho]`: `var_qualsubmenu_ = Opt.MenuConfig.submenu1`.
- Nada mais acontece: sem checagem de perfil, sem carga de dados, sem redirecionamento. Ver §1.

### 4.2 Nome do clifor em maiúsculas
- **Dispara:** `Button A` "nome clifor maiusculo" — **WF bTeyJ**.
- **Backend WF:** nenhum. Ação direta `ChangeListOfThings` [bTeyP] no navegador.
- **Altera:** `Tbl.GrupoCliFor.NomeCliFor = NomeCliFor:to_uppercase` em `Search(Tbl.GrupoCliFor)` — **todos** os cliforos.
- **Idempotente:** sim (maiúscula de maiúscula é maiúscula).
- **Reversível:** não — a grafia original (razão social com acentuação e caixa corretas) é perdida.
- **Rodar duas vezes:** sem efeito adicional, mas percorre a tabela de novo.

### 4.3 Marcar todos os clientes como Lucro Real
- **Dispara:** `Button E` "cliente lucro real" — **WF bThlD**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bThlI].
- **Altera:** `Tbl.EnderecosCliFor.QualRegimeTributario = opt.RegimeTributario.Lucro Real/Presumido` em
  `Search(Tbl.EnderecosCliFor: TipoClifor = Opt.TipoCliFor.Cliente)`.
- **Idempotente:** sim (grava sempre o mesmo valor).
- **Reversível:** **não** — sobrescreve Simples Nacional e MEI/Autônomo sem guardar o anterior.
- **Rodar duas vezes:** mesmo resultado; o dano é na primeira.
- **Impacto financeiro real:** o regime tributário do endereço decide, no backend `AdicionarFornecedores` (bTNrd, passos
  bThgz0 e bTNri), se o orçamento leva ICMS (`TotalBonusExtra` = alíquota de `Tbl.IcmsEstados`) e PIS/COFINS
  (`TotalComissaoVendedor = 0,0925`). Marcar todo mundo como Lucro Real muda o cálculo de imposto de todas as cotações
  seguintes. **Não é uma rotina de manutenção, é uma decisão fiscal aplicada em massa.**

### 4.4 Copiar boleto único da entrega para a lista de boletos
- **Dispara:** `Button F` — **WF bTiEc0**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTiEi0].
- **Altera:** `Tbl.Entregas.BoletoArquivos = "{InjectedValue:cpo.BoletoFile}"` em `Search(Tbl.Entregas)` — todas.
  `BoletoFile` é `file` (um arquivo); `BoletoArquivos` é `list.file`. Migração do campo antigo para o novo.
- **Idempotente:** sim no valor final, mas **sobrescreve** a lista: `ChangeListOfThings` com `=` substitui, não acumula.
- **Reversível:** **não** — entregas que já tinham vários boletos na lista ficam com um só (o de `BoletoFile`);
  entregas sem `BoletoFile` ficam com uma lista contendo string vazia.
- **Rodar duas vezes:** apaga de novo tudo o que tiver sido adicionado à lista entre as duas execuções.
- [DÚVIDA 3] A expressão grava um **texto** (`"{...}"`) num campo `list.file`. Recomendação padrão: na migração, tratar
  `BoletoFile` como o boleto original e `BoletoArquivos` como a lista; não portar esta conversão (é passo de carga).

### 4.5 Gravar o fornecedor da entrega na conta a receber
- **Dispara:** `Button G` "gravar fornecedor CONTAS RECEBER" — **WF bTiPt**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTiPz].
- **Altera:** `Tbl.ContasReceber.QualFornecedor = QualEntrega:QualFornecedor` em `Search(Tbl.ContasReceber)` — todas.
- **Idempotente:** sim (deriva sempre da entrega).
- **Reversível:** **não** para CRs cuja `QualEntrega` esteja vazia: o fornecedor delas é **apagado**.
- **Rodar duas vezes:** mesmo resultado.
- Backfill de campo redundante: o fornecedor já é alcançável por `CR → Entrega → Fornecedor`.

### 4.6 Copiar a NF do fornecedor da entrega para a conta a receber
- **Dispara:** `Button H` "copia NF venda p/ contas receber" — **WF bTiTV**. (Há mais dois botões com o mesmo rótulo,
  `Button J` e `Button K`, **sem workflow** — ver §8.2.)
- **Backend WF:** nenhum. `ChangeListOfThings` [bTiTb].
- **Altera:** `Tbl.ContasReceber.NumNfFornecedor = "{QualEntrega:NumNfFornecedor}"` em `Search(Tbl.ContasReceber)`.
- **Idempotente:** sim. **Reversível:** não (CR sem entrega perde o número já digitado).
- **Rodar duas vezes:** mesmo resultado.

### 4.7 Atualizar a data do último histórico de todos os cliforos
- **Dispara:** `Button L` "atualiza dt ultimo historico" — **WF bTjLy**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTjME].
- **Altera:** `Tbl.GrupoCliFor.UltimoHistoricoData = Search(Tbl.Historico: QualCliente = este clifor):last_element:Created Date`
  em `Search(Tbl.GrupoCliFor)` — todos.
- **Idempotente:** sim. **Reversível:** não — cliforos **sem** histórico têm a data existente **apagada**.
- **Rodar duas vezes:** mesmo resultado; custo: uma busca em `Historico` por clifor (N+1 clássico).
- [DÚVIDA 4] O `:last_element` não declara ordenação. Recomendação padrão: assumir "histórico mais recente por data de
  criação" e, no banco novo, usar `max(created_at)`.

### 4.8 Preencher a data do último histórico onde estiver vazia
- **Dispara:** `Button I` "preenche dt ultimo historico vazio" — **WF bTjMt**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTjMv].
- **Altera:** `Tbl.GrupoCliFor.UltimoHistoricoData = InjectedValue:Created Date` em
  `Search(Tbl.GrupoCliFor: UltimoHistoricoData is_empty)`.
- **Atenção:** `InjectedValue` aqui é o **próprio clifor**, não um histórico. A rotina grava a **data de cadastro do
  cliente** no campo "data do último contato". É um preenchimento de conveniência para os filtros de carteira não
  ficarem vazios, não um dado verdadeiro.
- **Idempotente:** sim — na segunda execução o filtro `is_empty` já não pega ninguém.
- **Reversível:** não (depois de preenchido, não se distingue de uma data real de histórico).

### 4.9 Atribuir todos os clientes a uma carteira
- **Dispara:** `Button M` "clientes carteira julio" — **WF bTjQe**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTjQk].
- **Altera:** `Tbl.GrupoCliFor.QualCarteira = CurrentUser` em `Search(Tbl.GrupoCliFor)` — **todos**.
- **Idempotente:** sim, e é justamente o problema: sempre resulta em "todos os clientes são do usuário que clicou".
- **Reversível:** **não** — destrói a divisão de carteira de toda a equipe comercial.
- **Rodar duas vezes:** se dois usuários clicarem, a carteira inteira troca de dono.
- O rótulo cita um vendedor específico ("julio") mas o código usa `CurrentUser`. Rotina pontual que virou arma carregada.

### 4.10 Atribuir o clifor aos endereços
- **Dispara:** `Button N` "atribui clifor aos enderecos" — **WF bTjRl**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTjRs].
- **Altera:** `Tbl.EnderecosCliFor.QualGrupoCliFor = Search(Tbl.GrupoCliFor: QuaisEnderecos contains este endereço):first_element`
  em `Search(Tbl.EnderecosCliFor)` — todos.
- É a **reconstrução do lado "filho" de uma relação que só existia no lado "pai"** (lista `QuaisEnderecos` no clifor).
- **Idempotente:** sim. **Reversível:** não — endereços órfãos (fora de qualquer lista) têm o vínculo apagado.
- **Rodar duas vezes:** mesmo resultado; custo: uma busca em `GrupoCliFor` por endereço.

### 4.11 Copiar o e-mail de login para o e-mail de contato
- **Dispara:** `Button O` — **WF bTkRn**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTkRt].
- **Altera:** `User.EmailContato = "{InjectedValue:email}"` em `Search(User)` — todos os usuários.
- **Idempotente:** sim. **Reversível:** **não** — sobrescreve o e-mail de contato de quem usa um endereço diferente do login.

### 4.12 Importar contas a receber do sistema antigo
- **Dispara:** `Button P` "importar contas receber" — **WF bTmGz**.
- **Backend WF:** `ScheduleAPIEvent` [bTmHe] → **`CriarContasReceberImportadas` (bTmHF)**, com
  `qtd = rpg contas importadas:count`, `fila = 1`, `contasreceber = rpg contas importadas:get_list_data`.
- **O que faz (13 ações, uma linha da fila por execução):**
  1. [bTmHN] cria `Tbl.CotacaoProdutos` (Condição Novo, Linha Primeira Linha, qtd, cliente, destino, produto).
  2. [bTmHf] cria `Tbl.Cotacao` — `CotacaoEtapa = Financeiro`, `CotacaoStatus = Em andamento`,
     `CotacaoNum = Search(Tbl.Pedido):last_element:NumeroPedido + 1`, `EmpresaMegabox = Megabox`.
  3. [bTmHM] cria `Tbl.OrcFornecedoresCotacao` — `Vencedor = true`, `Importado = true`, `TipoFrete = FOB`,
     valores unitários calculados (§5).
  4. [bTmHj] cria `Tbl.Propostas` — `PropostaEnviada = true`, `PropostaNum = 1`, corpo do e-mail montado com produto,
     qtd, valor da nota, valor da comissão e número da NF.
  5. [bTmHS] cria `Tbl.Pedido` — `PedidoFinalizado = true`, `PedidoFormalizado = true`, `QualEtapa = Financeiro`,
     `PrazoRecebComissoes = Opt.ParcelasReceber.0dd`, `Importado = true`.
  6. [bTmHT] cria `Tbl.Entregas` — `SaiuEntrega = true`, `NotaBoletoEnviada = true`,
     `StatusEntrega = Financeiro`, `StatusFinanceiro = A receber`, `Importado = true`.
  7. [bTmHH] cria `Tbl.ContasReceber` — `StatusFinanceiro = A receber`, `QdtParcelas`/`QualPrazo = 0dd`, `Importado = true`.
  8–12. [bTmHR, bTmHk, bTmHl, bTmHX, bTmHY] amarram as referências cruzadas entre os seis registros criados.
  13. [bTmHZ] `SÓ SE fila < qtd` → reagenda `bTmHF` com `fila + 1`. Laço recursivo, um registro por execução.
- **Idempotente:** **não**. Cada execução cria um conjunto novo de registros. Não há marca de "já importado" na linha de
  `ContasReceberImportado`, nem verificação de duplicidade por `numNF`.
- **Reversível:** só pelo botão "deletar a receber importados" (§4.14), que apaga por `Importado = true` — ou seja, apaga
  **todas** as cargas, não a última.
- **Rodar duas vezes:** **duplica o financeiro inteiro da carga** — pedidos, entregas e contas a receber em dobro.
- **Numeração frágil:** `CotacaoNum` vem de `Search(Tbl.Pedido):last_element:NumeroPedido + 1`, calculado dentro do laço.
  Como a execução é assíncrona e o pedido do passo anterior já existe, funciona por acidente de ordenação;
  qualquer pedido criado em paralelo na tela `vendas` quebra a sequência. [DÚVIDA 5]

### 4.13 Corrigir os valores da carga
- **Dispara:** `Button Q` "att receber importado" — **WF bTmIO**.
- **Backend WF:** `ScheduleAPIEvent` [bTmIU] → **`AttReceberImportado` (bTmHw)**.
- **O que faz (3 ações):**
  - [bTmIB] `OrcFornecedoresCotacao.ValorComissaoBruto = valorcomissao × QtdVenda`, em `Importado = true`.
  - [bTmIC] `Entregas.valorcomissao = valorcomissao × QtdEntrega`, em `Importado = true`.
  - [bTmIH] `ContasReceber.valorcomissao = valorcomissao × Qtd`, em `Importado = true`.
- **Idempotente:** **NÃO.** As ações 2 e 3 leem e escrevem **o mesmo campo**: cada execução multiplica de novo pela
  quantidade. Rodar duas vezes numa entrega de 100 unidades multiplica a comissão por 10.000.
- **Reversível:** não (só dividindo manualmente pela quantidade, o que exige saber quantas vezes rodou).
- **É a rotina mais perigosa da tela em termos de dinheiro**, e não tem confirmação nenhuma.
- Conserta um erro da §4.12: lá `valorcomissao` foi gravado como valor **unitário** em `OrcFornecedoresCotacao`
  (`valorcomissao / qtd`) mas como valor **total** em `Entregas` e `ContasReceber`; esta rotina tenta uniformizar.

### 4.14 Apagar tudo o que a carga criou
- **Dispara:** `Button T` "deletar a receber importados" — **WF bTmUn0**.
- **Backend WF:** `ScheduleAPIEvent` [bTmUt0] → **`DeletarReceberImportado` (bTmUN0)**.
- **O que faz (8 `DeleteListOfThings`, sem `SÓ SE`, sem confirmação):**
  1. [bTmUP0] apaga `Search(ContasReceber: Importado = true):QualCotacao` — as cotações.
  2. [bTmUT0] apaga os orçamentos de fornecedor dessas CRs.
  3. [bTmUV0] apaga as **entregas** dessas CRs.
  4. [bTmUa0] apaga os **pedidos** dessas CRs.
  5. [bTmUf0] apaga as propostas dessas CRs.
  6. [bTmUh0] apaga os produtos das cotações dessas CRs.
  7. [bTmUx0] apaga as próprias contas a receber importadas.
  8. [bTmUm0] apaga **`Search(Tbl.ContasReceberImportado)` inteira** — a fila de origem, sem filtro nenhum.
- **Idempotente:** sim no sentido de que a segunda execução não acha mais nada (o passo 8 já esvaziou a origem).
- **Reversível:** **não. Nada disso volta.** E o passo 8 apaga também as linhas ainda **não** importadas.
- **Rodar duas vezes:** a segunda é inócua — porque a primeira já levou tudo, inclusive a fonte da carga.
- **Risco além da carga:** os passos 1–6 partem da CR, não do registro alvo. Se uma CR importada apontar para um
  **pedido ou entrega reais** (por exemplo, depois de alguém corrigir o vínculo na tela `vendas`), esse pedido real é
  apagado junto. Não há `SÓ SE Importado = true` no alvo, só na busca das CRs.

### 4.15 Desativar endereços de clifor desativado
- **Dispara:** `Button R` — **WF bTmPt0**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTmPz0].
- **Altera:** `Tbl.EnderecosCliFor.Ativo = QualGrupoCliFor:Ativo` em `Search(Tbl.EnderecosCliFor)` — todos.
- **Idempotente:** sim (deriva do pai). **Reversível:** não — endereço sem `QualGrupoCliFor` recebe valor vazio (inativo).
- O nome do botão diz "desativar", mas a rotina **sincroniza nos dois sentidos**: endereço inativo de clifor ativo volta
  a ficar ativo.

### 4.16 Copiar info adicional do clifor para a filial única
- **Dispara:** `Button S` "copiar info adicionald do clifor para filial" — **WF bTmQf**.
- **Backend WF:** `ScheduleAPIEvent` [bTmQx] → **`copiainfoaddparafilial` (bTmQp)**.
- **O que faz:** [bTmQr] copia `CapacidadeCompra`, `Corporativo`, `Demanda`, `Frete`, `NomeComprador` e `Observacoes` do
  clifor para os endereços de `Search(Tbl.GrupoCliFor):filtered(QuaisEnderecos:count = 1):QuaisEnderecos` — ou seja,
  **só para cliforos com exatamente uma filial**.
- **Idempotente:** sim. **Reversível:** **não** — sobrescreve o que estiver na filial pelo valor do grupo.
- **Rodar duas vezes:** mesmo resultado.

### 4.17 Copiar info adicional do clifor para a "1ª filial"
- **Dispara:** `Button W` "copiar info adicional do clifor para 1A filial" — **WF bTnyz1**.
- **Backend WF:** `ScheduleAPIEvent` [bTnzF1] → **`copiainfoaddparafilial_copy` (bTnzH1)**.
- **O que faz (2 ações):**
  - [bTnzM1] `ChangeListOfThings` com os mesmos 6 campos, sobre `Search(Tbl.GrupoCliFor):filtered(QuaisEnderecos:count > 1):QuaisEnderecos`
    — **todos os endereços** dos cliforos com mais de uma filial, apesar do rótulo dizer "1ª filial".
  - [bTnzR1] `ChangeThing` com os mesmos 6 campos sobre `...:QuaisEnderecos:first_element` — **redundante**, o passo
    anterior já cobriu esse endereço.
- **Idempotente:** sim. **Reversível:** não.
- É um clone do WF anterior (o próprio nome do backend termina em `_copy`) com o filtro invertido. Ver §8.2.

### 4.18 Testar PDF
- **Dispara:** `Button U` "testar pdf" — **WF bTmZe**.
- **Ação:** `Plugin[1578535742499x577397265006067700]/AAt` [bTmZq], sem parâmetros, sobre o elemento `PDFGenerator A` (bTmZk).
- **Altera no banco:** nada. Ferramenta de diagnóstico.
- O plugin `1578535742499x577397265006067700` **não aparece na lista de plugins instalados** de `integracoes.md`.
  Provavelmente já não funciona.

### 4.19 Padronizar cópias de e-mail de pedido de todos os usuários
- **Dispara:** `Button V` "copiar configs smtp p/ tds usuarios" — **WF bTnwH0**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTnwN0].
- **Altera:** `User.CopiaPedido = "contato@grupomegabox.com.br; financeiro@grupomegabox.com.br;{InjectedValue:cpo.EmailContato}"`
  em `Search(User)` — todos.
- **Idempotente:** sim (o valor novo é derivado de `EmailContato`, não do valor anterior).
- **Reversível:** não — apaga listas de cópia personalizadas.
- O rótulo fala em "configs smtp" mas o que muda é só a lista de cópia do e-mail de pedido. Os campos SMTP por usuário
  (`SmtpEndereco`, `SmtpPorta`, `StmpLogin`, `SmtpSenha`) estão marcados como **deleted** em `data-types.md`.

### 4.20 Tirar os e-mails administrativos das cópias do usuário
- **Dispara:** `Button X` — **WF bToPH0**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bToPN0].
- **Altera:** `User.CopiaCancelamentos`, `User.CopiaPedido` e `User.CopiaProposta = "{InjectedValue:cpo.EmailContato}"`
  em `Search(User)` — todos.
- **Idempotente:** sim. **Reversível:** não.
- **É o desfazer do botão anterior (§4.19)**: um põe `contato@` e `financeiro@` na cópia de todos, o outro tira.
  Os dois estão lado a lado, sem rótulo que diga qual é o estado desejado. Ver §8.2.

### 4.21 Copiar a data da NF MegaBox para a data de recebimento no banco
- **Dispara:** `Button Y` — **WF bToUF**.
- **Backend WF:** `ScheduleAPIEvent` [bToUL] → **`CopiarDataNfmegaboxParaDataRecebimentoBanco` (bToTt)**.
- **O que faz:** [bToTv] `ContasReceber.DataRecebimentoBancocaixa = DataNfMegabox` em
  `Search(Tbl.ContasReceber: DataNfMegabox is_not_empty)`.
- **Idempotente:** sim. **Reversível:** **não** — a data real de crédito em conta (que pode ser bem diferente da data da
  nota) é sobrescrita pela data da NF em todas as CRs faturadas. Backfill de um campo novo usando o campo antigo como
  aproximação.

### 4.22 Copiar os endereços do orçamento para a conta a receber
- **Dispara:** `Button Z` — **WF bToWp0**.
- **Backend WF:** `ScheduleAPIEvent` [bToXB0] → **`CopiarEndereçosOrcamentoParaContasReceber` (bToWv0)**.
- **O que faz:** [bToXA0] `ContasReceber.QualDestino = QualOrcamentoFornecedor:QualEnderecoDestino` e
  `QualOrigem = QualOrcamentoFornecedor:QualEnderecoOrigem`, em `Search(Tbl.ContasReceber)` — todas.
- **Idempotente:** sim. **Reversível:** não — CR sem orçamento de fornecedor tem origem/destino apagados.
- Backfill puro: origem e destino já são alcançáveis pelo orçamento. Alimenta o filtro "Filial Fornecedor" da tela
  `financeiro`, que lê `QualOrigem` da CR.

### 4.23 Gerar comissões passadas (contas a pagar retroativas)
- **Dispara:** `Button AZ` "gerar comissoes passadas" — **WF bTpoG**.
- **Backend WF:** `ScheduleAPIEvent` [bTpoM] → **`CriarComissoesPassadas` (bTpni)**, com
  `qtd = Search(Tbl.ContasReceber):count`, `fila = 1`,
  `quaisentregas = Search(Tbl.Entregas: StatusEntrega = Opt.Etapas.Financeiro)`.
- **O que faz:**
  - [bTpol] cria uma `Tbl.ContasPagar` por entrega da fila: `StatusFinanceiro = A pagar`, `Importado = true`,
    `valorcomissao = Entrega.valorcomissao × 0,03`, `DataVencimento = dtentrega + 1 mês, dia 5`, e copia cliente,
    fornecedor, pedido, cotação, proposta, orçamento, origem, destino, vendedor, quantidade e valores (§5).
  - [bTpnz] `SÓ SE fila < qtd` → reagenda `bTpni` com `fila + 1`.
- **Bug de contagem:** `qtd` é a contagem de **contas a receber**, mas `fila` indexa a lista de **entregas**
  (`quaisentregas:specific_item(fila)`). Se houver mais CRs que entregas em etapa financeira, o laço continua depois do
  fim da lista e cria contas a pagar **vazias**; se houver menos, deixa entregas de fora. A passagem
  `_wf_param_quaisreceber = Param.quaisreceber` em bTpnz referencia um parâmetro que **não existe** na assinatura do
  workflow (que só declara `fila`, `qtd`, `quaisentregas`).
- **Idempotente:** **não** — cada execução cria um novo conjunto de contas a pagar, sem checar se já existe CP para a entrega.
- **Reversível:** não automaticamente (os registros têm `Importado = true`, mas a rotina de exclusão §4.14 só apaga
  `ContasReceber`, não `ContasPagar`).
- **Rodar duas vezes:** **duplica as comissões a pagar aos vendedores.**

### 4.24 Corrigir o valor da comissão a pagar
- **Dispara:** `Button BZ` "corrigir valor comissao" — **WF bTpoX**.
- **Backend WF:** `ScheduleAPIEvent` [bTprr] → **`CorrigirValorComissaoPagar` (bTpop)**, com
  `quaiscomissoes = Search(Tbl.ContasPagar)` — **todas**, sem filtro.
- **O que faz:** [bTpor] `ContasPagar.valorcomissao = QualEntrega:valorcomissao × 0,03` e
  `DataVencimento = QualEntrega:dtentrega + 1 mês, dia 5`.
- **Idempotente:** **sim** — lê da entrega, não do próprio campo. É a rotina bem construída da tela.
- **Reversível:** não — comissões ajustadas manualmente (campo `MotivoAlteraComissao` existe justamente para isso)
  voltam ao valor calculado. Vencimentos renegociados também.
- **Rodar duas vezes:** mesmo resultado.
- **Alcance:** mexe em contas a pagar **já pagas** (`StatusFinanceiro = Pago`) tanto quanto nas abertas.

### 4.25 "Tirar nota 1102 das contas a receber"
- **Dispara:** `Button CZ` — **WF bTprd**.
- **Backend WF:** `ScheduleAPIEvent` [bTprp] → **`LImparNota1102ContasReceber` (bTprj)**.
- **O que faz:** [bTprl] em `Search(Tbl.ContasReceber)` — **todas as contas a receber, sem nenhum filtro** — limpa
  `NumNfMegabox`, `AnexoNfMegabox`, `DataNfMegabox`, `DataBaixaSistema`, `DataRecebimentoBancocaixa`, `CobrancaNum`,
  `QualCobranca` e força `StatusFinanceiro = Opt.StatusFinanceiro.A receber`.
- **O rótulo mente.** Não há nenhuma referência ao número 1102 na busca nem nas condições. **Este botão estorna todas as
  baixas do financeiro da empresa e desfaz o vínculo de todas as cobranças.**
- **Idempotente:** sim (a segunda execução não muda mais nada — já está tudo zerado).
- **Reversível:** **não.** NF, anexo, datas, número de cobrança e status são perdidos; a tela `financeiro` passa a mostrar
  tudo como "A receber".
- **Rodar duas vezes:** o estrago é total já na primeira.
- [DÚVIDA 6] A intenção era claramente limpar só as CRs de uma nota específica (1102). Recomendação padrão: **não portar**;
  se a operação for necessária, reescrever como "estornar baixa" com filtro obrigatório e registro de quem estornou
  (`QuemEstornou` e `DataEstorno` já existem em `Tbl.ContasReceber` e **não são preenchidos por esta rotina**).

### 4.26 Atribuir o criador como vendedor
- **Dispara:** `Button DZ` "atribuir CRIADOR ao VENDEDOR" — **WF bTtkx**.
- **Backend WF:** `ScheduleAPIEvent` [bTtlD] → **`AtribuirCriadorVendedor` (bTtji)** (`expose = False`).
- **O que faz (4 ações):** `QualVendedor = InjectedValue:Created By` em `Search(Tbl.Cotacao)` [bTtjt],
  `Search(Tbl.OrcFornecedoresCotacao)` [bTtjv], `Search(Tbl.Propostas)` [bTtkA] e `Search(Tbl.Pedido)` [bTtkF] — tudo.
- **Idempotente:** sim (deriva de `Created By`). **Reversível:** **não** — apaga trocas de vendedor feitas depois
  (transferência de carteira, substituição por férias via `QualVendedorSubstituto`).
- **Rodar duas vezes:** mesmo resultado.
- Backfill do campo `QualVendedor`, criado depois dos dados, a partir do `Created By` do Bubble.

### 4.27 Liberar todos os endereços
- **Dispara:** `Button EZ` "atribuir liberado = yes para endereços" — **WF bTveR**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTveX].
- **Altera:** `Tbl.EnderecosCliFor.Liberado = True` em `Search(Tbl.EnderecosCliFor)` — todos.
- O campo `Liberado` tem id `cpo_bloqueado_boolean` e vem acompanhado de `LiberadoMotivo` (`cpo_bloqueadomotivo_text`):
  é o **bloqueio comercial/financeiro de cliente**. Esta rotina **libera todos os clientes bloqueados de uma vez**, e
  o motivo do bloqueio fica no registro, mas sem efeito.
- **Idempotente:** sim. **Reversível:** **não** — não há como saber quem estava bloqueado antes.
- Backfill de um campo booleano recém-criado (default vazio) que foi aplicado com o valor errado para quem já estava bloqueado.

### 4.28 Ativar cliforos sem o campo Ativo preenchido
- **Dispara:** `Button FZ` "atribuir ativo = yes grupoclifor vazio" — **WF bTvfF**.
- **Backend WF:** nenhum. `ChangeListOfThings` [bTvfL].
- **Altera:** `Tbl.GrupoCliFor.Ativo = True` em `Search(Tbl.GrupoCliFor: Ativo is_empty)`.
- **Idempotente:** sim, e **autolimitante** — a segunda execução não acha ninguém.
- **Reversível:** na prática não, mas o risco é baixo: só toca em registros com o campo vazio, nunca nos marcados como
  inativos. É a rotina mais bem comportada da tela.

### 4.29 Atribuir o modelo do produto ao orçamento de fornecedor
- **Dispara:** `Button HZ` — **WF bUAht**.
- **Backend WF:** `ScheduleAPIEvent` [bUAhz] → **`AtribuirModeloProdutoOrcamento` (bUAhf)** (`expose = False`).
- **O que faz:** [bUAhl] `OrcFornecedoresCotacao.QualProdutoModelo = QualCotacaoProduto:QualProduto` em
  `Search(Tbl.OrcFornecedoresCotacao)` — todos.
- **Idempotente:** sim. **Reversível:** não (orçamento sem produto de cotação perde o modelo).
- Backfill de denormalização: `QualProdutoModelo` só existe para evitar o salto
  `OrcFornecedoresCotacao → CotacaoProdutos → ProdutosModelo` nas buscas de relatório.

### 4.30 Elementos de apoio sem efeito no banco
- **`Icon F` limpar busca — WF bTkDT:** `ResetGroup` [bTkDY] em `El[gp busca cliente]`. Único WF que consome o bloco de busca.
- **Monthly / Yearly — WF bUCVB e bUCVL:** `SetCustomState window_ = 1` / `= 2` em `Mo/yr selector dash`.
  Só os condicionais de cor dos próprios botões leem esse estado. Sem efeito.
- **Salvar endereço — WF bTevn:** `ChangeThing` [bTevt] grava bairro, CEP, complemento, endereço, localização, município,
  `QualUfOpt` e `UF` no endereço da linha (`Parent`). É edição de **um** registro, idempotente e reversível manualmente.
  Funcionalidade duplicada de `pop.AddEditaEndereço` (§8.2).

---

## 5. Cálculos e valores

Todos em `number` no Bubble (ponto flutuante). **No banco novo, `numeric`** — regra 10 do `CLAUDE.md`.

| Cálculo | Onde | Fórmula | Observação |
|---|---|---|---|
| Valor unitário de venda (carga) | bTmHM, bTmHH | `valornota / qtd` | divisão sem tratamento de `qtd = 0` |
| Comissão unitária (carga) | bTmHM | `valorcomissao / qtd` | grava **unitário** em `OrcFornecedoresCotacao` |
| Comissão total (carga) | bTmHT, bTmHH | `valorcomissao` da planilha, **sem dividir** | grava **total** em `Entregas` e `ContasReceber` — inconsistente com a linha acima; é o que a rotina §4.13 tenta consertar |
| Comissão bruta do orçamento | bTmIB | `valorcomissao × QtdVenda` | idempotente (campo de destino diferente da origem) |
| Comissão da entrega | bTmIC | `valorcomissao × QtdEntrega` | **não idempotente** — lê e grava o mesmo campo |
| Comissão da CR | bTmIH | `valorcomissao × Qtd` | **não idempotente** — idem |
| Comissão a pagar ao vendedor | bTpol (bTpni), bTpor (bTpop) | `Entrega.valorcomissao × 0,03` | **3% fixo no código**, sem referência a `Tbl.NiveisVendedores` |
| Vencimento da comissão a pagar | bTpol, bTpor | `dtentrega + 1 mês`, `change_date(5)` → dia 5 do mês seguinte | mesma regra em `CriarContasPagar` (bToYh), fora desta página |
| Valor total / unitário da CP | bTpol | `ValorTotal = Entrega.ValorVendaBruto`; `ValorUnit = Entrega.ValorVendaBrutoUnitario` | |
| Número da cotação na carga | bTmHf | `Search(Tbl.Pedido):last_element:NumeroPedido:convert_to_number + 1` | sequência calculada em laço assíncrono — ver §4.12 |

[DÚVIDA 7] Os 3% de comissão do vendedor (`× 0.03`) estão fixos em bTpol e bTpor, enquanto o app tem `Tbl.NiveisVendedores`
(8 campos) e `User.QualNivelVendedor`. Recomendação padrão: no banco novo, o percentual vem do nível do vendedor vigente
na data da entrega, com 3% como default histórico; **teste obrigatório** (regra 10).

---

## 6. Integrações e backend workflows

Tabela principal desta spec: cada rotina, o backend workflow que ela agenda, as ações desse workflow e os tipos alterados.

| # | Rotina (botão) | WF da página | Backend WF | Ações do backend | Tipo(s) alterado(s) | Volume |
|---|---|---|---|---|---|---|
| 1 | importar contas receber | bTmGz → bTmHe | `CriarContasReceberImportadas` (bTmHF) | bTmHN, bTmHf, bTmHM, bTmHj, bTmHS, bTmHT, bTmHH, bTmHR, bTmHk, bTmHl, bTmHX, bTmHY, bTmHZ | cria CotacaoProdutos, Cotacao, OrcFornecedoresCotacao, Propostas, Pedido, Entregas, ContasReceber | 1 linha por execução, laço recursivo |
| 2 | att receber importado | bTmIO → bTmIU | `AttReceberImportado` (bTmHw) | bTmIB, bTmIC, bTmIH | OrcFornecedoresCotacao, Entregas, ContasReceber (`Importado = true`) | toda a carga |
| 3 | deletar a receber importados | bTmUn0 → bTmUt0 | `DeletarReceberImportado` (bTmUN0) | bTmUP0, bTmUT0, bTmUV0, bTmUa0, bTmUf0, bTmUh0, bTmUx0, bTmUm0 | **apaga** Cotacao, OrcFornecedoresCotacao, Entregas, Pedido, Propostas, CotacaoProdutos, ContasReceber, ContasReceberImportado | toda a carga + toda a fila |
| 4 | copiar info adicional p/ filial | bTmQf → bTmQx | `copiainfoaddparafilial` (bTmQp) | bTmQr | EnderecosCliFor (clifor com 1 filial) | parcial |
| 5 | copiar info adicional p/ "1ª filial" | bTnyz1 → bTnzF1 | `copiainfoaddparafilial_copy` (bTnzH1) | bTnzM1, bTnzR1 | EnderecosCliFor (clifor com >1 filial) | parcial |
| 6 | copiar data nfmegabox → recebimento banco | bToUF → bToUL | `CopiarDataNfmegaboxParaDataRecebimentoBanco` (bToTt) | bToTv | ContasReceber (`DataNfMegabox` preenchida) | parcial |
| 7 | copiar endereços pedido → contas receber | bToWp0 → bToXB0 | `CopiarEndereçosOrcamentoParaContasReceber` (bToWv0) | bToXA0 | ContasReceber | **todas** |
| 8 | gerar comissoes passadas | bTpoG → bTpoM | `CriarComissoesPassadas` (bTpni) | bTpol, bTpnz | **cria** ContasPagar | laço recursivo |
| 9 | corrigir valor comissao | bTpoX → bTprr | `CorrigirValorComissaoPagar` (bTpop) | bTpor | ContasPagar | **todas** |
| 10 | tirar nota 1102 das contas a receber | bTprd → bTprp | `LImparNota1102ContasReceber` (bTprj) | bTprl | ContasReceber | **todas** |
| 11 | atribuir CRIADOR ao VENDEDOR | bTtkx → bTtlD | `AtribuirCriadorVendedor` (bTtji) | bTtjt, bTtjv, bTtkA, bTtkF | Cotacao, OrcFornecedoresCotacao, Propostas, Pedido | **todos** |
| 12 | atribuir modelo produto ao orcamento | bUAht → bUAhz | `AtribuirModeloProdutoOrcamento` (bUAhf) | bUAhl | OrcFornecedoresCotacao | **todos** |

Rotinas **sem** backend workflow — `ChangeListOfThings` rodando no navegador do usuário:

| Rotina | WF | Ação | Tipo alterado | Volume |
|---|---|---|---|---|
| nome clifor maiusculo | bTeyJ | bTeyP | GrupoCliFor | todos |
| cliente lucro real | bThlD | bThlI | EnderecosCliFor (clientes) | todos os clientes |
| copiar boleto único → lista | bTiEc0 | bTiEi0 | Entregas | todas |
| gravar fornecedor CR | bTiPt | bTiPz | ContasReceber | todas |
| copia NF venda → CR | bTiTV | bTiTb | ContasReceber | todas |
| atualiza dt ultimo historico | bTjLy | bTjME | GrupoCliFor | todos |
| preenche dt ultimo historico vazio | bTjMt | bTjMv | GrupoCliFor | só os vazios |
| clientes carteira julio | bTjQe | bTjQk | GrupoCliFor | todos |
| atribui clifor aos enderecos | bTjRl | bTjRs | EnderecosCliFor | todos |
| copiar email login → email contato | bTkRn | bTkRt | User | todos |
| desativar enderecos de clifor desativado | bTmPt0 | bTmPz0 | EnderecosCliFor | todos |
| copiar configs smtp p/ tds usuarios | bTnwH0 | bTnwN0 | User | todos |
| tirar email adm das copias | bToPH0 | bToPN0 | User | todos |
| atribuir liberado = yes | bTveR | bTveX | EnderecosCliFor | todos |
| atribuir ativo = yes (vazio) | bTvfF | bTvfL | GrupoCliFor | só os vazios |
| salvar endereço (inline) | bTevn | bTevt | EnderecosCliFor | 1 registro |

Plugins e APIs:

| O quê | Onde | Situação |
|---|---|---|
| Plugin 1578535742499 (PDF) `AAn` / `AAt` | `PDFGenerator A` (bTmZk), WF bTmZe | **não consta** na lista de plugins instalados |
| Plugin 1729605241035 `AAt` (envio de e-mail SMTP) | `Icon E`, WF bThhp ação bThhv | **não consta** na lista de plugins instalados; sem parâmetros na ação |
| Plugin 1609444246883 `AAD` (máscara de input) | `MaskInput cnpj`, `MaskInput cep` | instalado, v2.0.0 |
| Plugin 1602683113110 `AAF` (consulta CNPJ/CEP) | defaults do editor de endereço inline (§3.2) | instalado, v3.1.0 |
| Autocomplete geográfico do Google | `ipt novocliente localizacao` | plugin `google` ativo |
| API Connector | — | **nenhuma chamada** nesta página |

---

## 7. Segurança e privacidade

### 7.1 Rotinas que apagam dado
| Rotina | O que apaga | Confirmação | Log |
|---|---|---|---|
| `deletar a receber importados` (bTmUn0 → bTmUN0) | Cotações, orçamentos de fornecedor, entregas, pedidos, propostas, produtos de cotação e contas a receber com `Importado = true`, **mais a tabela `ContasReceberImportado` inteira** | **nenhuma** | nenhum |

É a única exclusão da tela, e é total. O popup `pop apagar registro` que diria "Esta ação não pode ser revertida!" está na
página e **não é aberto por este botão nem por nenhum outro**.

### 7.2 Rotinas que sobrescrevem dado sem poder desfazer
Ordenadas por gravidade:

1. **bTprd → bTprj** — estorna **todas** as baixas de contas a receber (NF MegaBox, anexo, datas de baixa e de crédito,
   número e vínculo de cobrança, status). Irreversível e sem registro de quem fez. O rótulo sugere uma limpeza pontual.
2. **bTjQe** — põe **todos** os cliforos na carteira de quem clicou. Destrói a divisão comercial.
3. **bTveR** — marca `Liberado = true` em **todos** os endereços: libera todo cliente bloqueado.
4. **bTmIO → bTmHw** — multiplica `valorcomissao` de entregas e CRs importadas pela quantidade **a cada execução**.
5. **bTpoG → bTpni** — cria contas a pagar duplicadas a cada execução, e com laço mal delimitado (§4.23).
6. **bThlD** — força `Lucro Real/Presumido` em todos os endereços de cliente, mudando o cálculo de ICMS e PIS/COFINS.
7. **bTpoX → bTpop** — recalcula **todas** as contas a pagar, inclusive as já pagas e as ajustadas manualmente.
8. **bTtkx → bTtji** — reescreve o vendedor de todas as cotações, orçamentos, propostas e pedidos.
9. **bToUF → bToTt** — sobrescreve a data real de crédito em conta pela data da NF.
10. **bTiEc0** — substitui a lista de boletos das entregas pelo boleto único.
11. **bTnwH0 / bToPH0** — reescrevem as listas de cópia de e-mail de todos os usuários (e um desfaz o outro).
12. **bTiPt, bTiTV, bToWp0, bTjRl, bTmPt0, bUAht, bTjLy, bTkRn, bTmQf, bTnyz1** — backfills derivados: idempotentes
    quando a origem existe, **apagadores** quando a origem está vazia.

### 7.3 Backend workflows expostos sem autenticação
- **`VicularOcamentoCopiaAoProdutoCopia` (bUAeU)** — `expose = True`, **`auth_unecessary = True`**,
  **`ignore_privacy_rules = True`**. É um endpoint público, sem login, que ignora as regras de privacidade e que, no
  passo bUAfd, **cria uma `Tbl.Cotacao`** (com `CotacaoNum = último + 1`) e, no passo bUAfz, **altera o `User` recebido
  no parâmetro `currentuser`** (`TempOrcamentoProdutos = vazio`). Não é chamado por esta página — o disparo está em
  `vendas` — mas é o pior buraco do app e precisa ser fechado na migração. Já registrado pelo projeto; repetido aqui
  porque a `rotinas` é a tela que documenta os endpoints de backend.
- **`AtribuirCriadorVendedor` (bTtji)**, **`AtribuirModeloProdutoOrcamento` (bUAhf)**, `ResetContagemEmails` (bUBmh) e
  `AtribuirVendedorSubstituto` (bUBpN) declaram **`expose = False`** — não são endpoints públicos.
- [DÚVIDA 8] Os demais backend workflows que esta página dispara — `CriarContasReceberImportadas` (bTmHF),
  `AttReceberImportado` (bTmHw), `copiainfoaddparafilial` (bTmQp), `copiainfoaddparafilial_copy` (bTnzH1),
  `CopiarDataNfmegaboxParaDataRecebimentoBanco` (bToTt), `CriarComissoesPassadas` (bTpni),
  `CorrigirValorComissaoPagar` (bTpop), `LImparNota1102ContasReceber` (bTprj), `DeletarReceberImportado` (bTmUN0) e
  `CopiarEndereçosOrcamentoParaContasReceber` (bToWv0) — **não declaram `expose` no mapa**. O app tem a Workflow API
  ligada (`integracoes.md`: "expõe Workflow API: True"). Recomendação padrão: **auditar cada um no editor Bubble antes
  do corte e tratar como potencialmente públicos até prova em contrário**; um `POST` anônimo em `bTmUN0` apagaria
  pedidos, entregas e contas a receber, e um em `bTprj` estornaria todo o financeiro.

### 7.4 Outros pontos
1. **Dados públicos.** Tudo o que estas rotinas tocam (`GrupoCliFor`, `EnderecosCliFor`, `ContasReceber`, `ContasPagar`,
   `Entregas`, `User`, `ConfigSistema`) tem privacy rule `everyone` com `view_all` e `search_for` = true, e a Data API
   está exposta. CNPJ, razão social, comissões e e-mails são legíveis por qualquer um.
2. **Sem transação.** As `ChangeListOfThings` rodam no navegador: fechar a aba no meio deixa metade da tabela alterada e
   metade não. Não há rollback e não há como saber onde parou.
3. **Sem auditoria.** Nenhuma rotina grava quem executou nem quando. `Tbl.ContasReceber` tem os campos `QuemEstornou` e
   `DataEstorno`, e `Tbl.GrupoCliFor` tem `UltimoQue(Des)ativou` — **nenhuma rotina desta tela os preenche.**
4. **Dado pessoal em massa.** bTkRn, bTnwH0 e bToPH0 reescrevem e-mails de todos os usuários.
5. **Consulta externa de CNPJ** (plugin 1602683113110) no editor de endereço inline: envia o CNPJ do cliente a um
   serviço terceiro a cada renderização de linha do RG.
6. **Laço recursivo sem trava.** bTmHF e bTpni se reagendam com `fila + 1`; o `SÓ SE fila < qtd` é a única parada.
   Se `qtd` vier errado (é o caso de bTpni, §4.23), o laço roda além da lista criando registros vazios.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto — não portar
**O bloco de importação do sistema antigo já cumpriu o papel e não deve ser portado.**
São os botões `Button P` "importar contas receber" (WF bTmGz), `Button Q` "att receber importado" (WF bTmIO) e
`Button T` "deletar a receber importados" (WF bTmUn0), os backends `CriarContasReceberImportadas` (bTmHF),
`AttReceberImportado` (bTmHw) e `DeletarReceberImportado` (bTmUN0), o repeating group `rpg contas importadas` (bTmGn),
o data type **`Tbl.ContasReceberImportado`** inteiro e as flags `cpo.Importado` em `ContasReceber`, `ContasPagar`,
`Entregas`, `OrcFornecedoresCotacao` e `Pedido`. Foi a carga única da migração do sistema anterior para o Bubble; os
registros que ela criou já são dados normais do app. Na migração Bubble → Postgres, os dados vêm por ETL
(`specs/03-plano-de-construcao.md`), não por esta rotina. **Nada disso vai para o app novo.**

Outros elementos e workflows mortos:

| Item | Por quê |
|---|---|
| WF bTexg (`proxima`) e bTexr (`anterior`) | **vazios** — paginação nunca implementada |
| WF bThiD (`Icon E`) | **vazio** (segundo workflow do mesmo ícone) |
| WF bTvmb e bTvmh (`Button GZ` "atribui clientes ativo = yes para ativos=não") | **vazios** — o botão existe e não faz nada |
| WF bThhp ação bThhv | plugin de e-mail 1729605241035 **não instalado**; ação sem parâmetros |
| WF bTmZe ação bTmZq ("testar pdf") | plugin de PDF 1578535742499 **não instalado** |
| `Button J` (bTjLm) e `Button K` (bTjLs) | rótulo idêntico ao `Button H`, **sem workflow** |
| `Button B` (bThgn), `Dropdown B` (bThgh), `Table A` (bThfN) e seus 6 `TableCell` | tabela de cotações sem fonte de dados e sem lógica |
| `Mo/yr selector dash` (bUCUt) + `Button IZ` ×2 + estado `window_` + WF bUCVB/bUCVL | seletor Monthly/Yearly de template; nada lê o estado |
| `Group N` (bUCVS) + `Button JZ` Create/Cancel | **sem workflow** |
| `pop apagar registro` (bTeTa) + `Button C`/`Button D` (SIM/NÃO) | popup de confirmação que nenhum WF abre e cujos botões não têm workflow |
| `alt processando` (bTeTZ) | alerta nunca acionado |
| `gp busca cliente` (bTkDL) + WF bTkDT | busca referenciando `dd ativos`, `dd tipo clifor` e `dd ordem`, que **não existem** nesta página; nenhum WF consome o resultado (§3.3) |
| `rpg enderecos clifor` (bTeqS) + WF bTevn | editor de endereço duplicado de `pop.AddEditaEndereço` (§8.2) |
| `Button M` "clientes carteira julio" (WF bTjQe) | correção pontual de 2022 com o nome de um vendedor no rótulo; hoje só destrói carteira |
| `Button EZ` (bTveR) e `Button E` (bThlD) | backfills de campo novo aplicados com valor fixo; já rodaram |

### 8.2 Duplicação
1. **Três botões "copia NF venda p/ contas receber"** (`Button H`, `J`, `K`); só o `H` tem workflow.
2. **`copiainfoaddparafilial` (bTmQp) × `copiainfoaddparafilial_copy` (bTnzH1)** — o mesmo `ChangeListOfThings` de 6
   campos, duplicado, com o filtro invertido (`count = 1` × `count > 1`). Deveria ser um só, sem filtro de contagem.
3. **Dentro de bTnzH1**, o passo bTnzR1 (`ChangeThing` no `first_element`) é redundante: o passo bTnzM1 já aplicou o
   mesmo valor a todos os endereços do conjunto.
4. **`Button V` (bTnwH0) × `Button X` (bToPH0)** — um adiciona `contato@` e `financeiro@` às cópias de todos os usuários,
   o outro tira. Dois botões opostos, lado a lado, sem indicação de qual é o estado correto.
5. **`Button L` (bTjLy) × `Button I` (bTjMt)** — a mesma coluna `UltimoHistoricoData` preenchida por duas regras
   diferentes (data do último histórico × data de cadastro do cliente).
6. **Editor de endereço inline** (`rpg enderecos clifor` + WF bTevn) reproduz `pop.AddEditaEndereço` (164 elementos,
   20 workflows), inclusive a consulta de CNPJ/CEP e as máscaras.
7. **`CriarComissoesPassadas` (bTpni) × `CriarContasPagar` (bToYh)** — criam a mesma `Tbl.ContasPagar` com a mesma regra
   de 3% e o mesmo vencimento (dia 5 do mês seguinte), com listas de campos ligeiramente diferentes.

### 8.3 Gambiarras
1. **Laço recursivo com `ScheduleAPIEvent`** (bTmHZ, bTpnz): o Bubble não tem `for`, então cada execução processa um item
   e reagenda a próxima. No Postgres é um `INSERT ... SELECT` ou uma função com `FOR ... LOOP`.
2. **`qtd` de uma tabela indexando outra** (bTpoG: `qtd = count(ContasReceber)`, `fila` indexa `quaisentregas`) — §4.23.
3. **Parâmetro inexistente** `_wf_param_quaisreceber` passado em bTpnz.
4. **Sequência calculada em laço** (`Search(Tbl.Pedido):last_element:NumeroPedido + 1` em bTmHf) em vez de sequence.
5. **Campo lista recebendo texto** (`BoletoArquivos = "{BoletoFile}"` em bTiEi0).
6. **Rótulo que não corresponde ao código**: "tirar nota 1102" apaga tudo; "1ª filial" atinge todas as filiais;
   "carteira julio" usa `CurrentUser`; "copiar configs smtp" mexe em lista de cópia de e-mail.
7. **Somar `× 0,03` em dois lugares diferentes** em vez de ler o nível do vendedor.
8. **`last_element` sem ordenação** (bTjME) — depende da ordem natural da busca.
9. **Ação que lê e escreve o mesmo campo** (bTmIC, bTmIH) — torna a rotina não repetível.
10. **Denormalização mantida à mão** (`QualFornecedor`, `NumNfFornecedor`, `QualOrigem`, `QualDestino`, `QualVendedor`,
    `QualProdutoModelo`, `UltimoHistoricoData`, `QualGrupoCliFor` no endereço) — toda a razão de existir da metade dos
    botões desta tela.

### 8.4 Otimizações para o banco novo

**Vira `pg_cron` / job agendado:**
- Nada desta tela precisa ser job periódico por si só. O que roda hoje "de vez em quando" é backfill, e backfill não se
  repete. Os dois candidatos legítimos a agendamento estão fora desta página e são citados aqui por completude:
  `ResetContagemEmails` (bUBmh, reagenda-se a cada meia-noite) e `RefreshTokenGoogle` (bUCKC, reagenda-se no expiry) —
  ambos viram `pg_cron` ou Vercel Cron.
- **Recalcular comissões a pagar** (§4.24) pode ser um job noturno de **conferência** (relatório de divergências),
  nunca de correção automática.

**Vira trigger / coluna gerada / constraint:**
| Rotina de hoje | No banco novo |
|---|---|
| nome clifor maiusculo (bTeyP) | normalização na escrita: `citext` ou coluna gerada `nome_normalizado` para busca, preservando a grafia original |
| atualiza/preenche dt ultimo historico (bTjME, bTjMv) | coluna `ultimo_historico_em` mantida por **trigger** em `historicos`, ou `LATERAL (SELECT max(created_at) …)` na view — nunca coluna preenchida em lote |
| desativar enderecos de clifor desativado (bTmPz0) | `ativo` do endereço deriva do grupo: coluna gerada ou trigger `AFTER UPDATE ON grupos_clifor` |
| atribui clifor aos enderecos (bTjRs) | **deixa de existir**: `enderecos_clifor.grupo_clifor_id` é FK `NOT NULL`; a lista `QuaisEnderecos` do Bubble vira o próprio relacionamento |
| atribuir liberado = yes (bTveX), ativo = yes (bTvfL) | `DEFAULT true NOT NULL` na coluna; backfill acontece uma vez na migration |
| atribuir ativo dos enderecos | idem |

**Deixa de existir porque o modelo novo não precisa (join resolve):**
| Rotina de hoje | Por quê |
|---|---|
| gravar fornecedor CR (bTiPz) | `contas_receber → entregas → fornecedor` |
| copia NF venda p/ CR (bTiTb) | `contas_receber → entregas.num_nf_fornecedor` |
| copiar endereços pedido → CR (bToXA0) | `contas_receber → orcamentos_fornecedor.{origem,destino}` |
| atribuir modelo produto ao orcamento (bUAhl) | `orcamentos_fornecedor → cotacao_produtos → produtos` |
| atribuir CRIADOR ao VENDEDOR (bTtji) | `vendedor_id NOT NULL` preenchido na criação; `created_by` é auditoria, não regra |
| copiar info adicional p/ filial (bTmQr, bTnzM1, bTnzR1) | os 6 campos (`capacidade_compra`, `corporativo`, `demanda`, `frete`, `nome_comprador`, `observacoes`) ficam **só no grupo**; a filial os lê por join, com `COALESCE(filial.x, grupo.x)` se precisar sobrescrever |
| copiar boleto unico → lista (bTiEi0) | `entrega_boletos` (tabela filha) desde a primeira migration; a conversão é passo do ETL |
| copiar email login → email contato (bTkRt) | `usuarios.email_contato` com `DEFAULT` = e-mail de login na criação |
| copiar/tirar cópias de e-mail (bTnwN0, bToPN0) | lista de cópias fixas vem de `config_sistema`, não é copiada para cada usuário |
| copiar data nfmegabox → recebimento banco (bToTv) | `data_recebimento_banco` é preenchida na **baixa**; se faltar, é `NULL`, não uma aproximação |
| cliente lucro real (bThlI) | regime tributário é campo obrigatório do cadastro, com validação — nunca atribuição em massa |
| clientes carteira julio (bTjQk) | transferência de carteira é operação de negócio com origem, destino e log, na tela de cadastros |
| todo o bloco de importação (§8.1) | ETL |

**Ganhos de desempenho imediatos:** as buscas N+1 de bTjME (uma busca de `Historico` por clifor) e bTjRs (uma busca de
`GrupoCliFor` por endereço) viram um `UPDATE ... FROM` único. As dez rotinas que hoje varrem a tabela inteira no
navegador viram `UPDATE` com `WHERE` obrigatório.

---

## 9. Proposta para o app novo

Princípio: **a tela continua existindo, mas deixa de ser um painel de botões que escrevem na tabela inteira.** Vira um
console de manutenção com catálogo de rotinas, pré-visualização de impacto, confirmação explícita e log de execução.

### 9.1 Rotas
- `app/(app)/admin/rotinas/page.tsx` — Server Component. Lista o catálogo de rotinas (do banco, não do código) com a
  data da última execução, quem executou e quantas linhas foram afetadas.
- `app/(app)/admin/rotinas/[slug]/page.tsx` — detalhe de uma rotina: descrição, alvo, filtros obrigatórios,
  pré-visualização (dry-run) e botão de execução.
- `app/(app)/admin/rotinas/execucoes/page.tsx` — histórico de execuções.
- **Guarda no `layout.tsx` do grupo `admin`**: sessão válida **e** `perfil = 'diretor'` (hierarquia 1) **e**
  permissão da página em `permissoes_pagina`. Redireciona para `/inicio` se falhar. A guarda é de servidor; nenhuma
  rotina é alcançável por URL sem ela.
- Rotas que **não** voltam: editor de endereço inline, busca de clifor, tabela de cotações, seletor Monthly/Yearly.

### 9.2 Componentes
- `CatalogoRotinas` — cards por rotina, agrupados em "Correção de dados", "Financeiro" e "Diagnóstico", com selo de
  risco (baixo / alto / destrutivo).
- `RotinaDetalhe` — descrição em português, tabela(s) afetada(s), campos escritos, se é idempotente e se é reversível.
- `FiltroObrigatorio` — nenhuma rotina de alto risco roda sem pelo menos um filtro (período, cliente, fornecedor,
  pedido, NF). O botão fica desabilitado enquanto o filtro estiver vazio.
- `PreviewImpacto` — resultado do dry-run: quantas linhas serão alteradas, amostra de 20 com valor atual → valor novo.
- `DialogConfirmacaoRotina` — exibe a contagem, o que é irreversível e exige **digitar o nome da rotina** para liberar
  o botão. Substitui o `pop apagar registro` que nunca foi ligado.
- `HistoricoExecucoes` — tabela de `rotina_execucoes` com filtro por rotina e por usuário.
- `BadgeIdempotencia` — deixa explícito na tela o que acontece se rodar duas vezes.

### 9.3 Server actions
Todas em `'use server'`, todas com a mesma estrutura: **valida sessão → valida perfil Diretor → valida filtro →
dry-run ou execução em transação → grava `rotina_execucoes`**. Nenhuma recebe "rodar em tudo" como default.

| Server action | Trava | Confirmação | Transação | Dry-run |
|---|---|---|---|---|
| `recalcularComissoesPagar({ periodo, vendedorId?, entregaIds? })` | diretor | digitar nome + contagem | sim | obrigatório |
| `estornarBaixasContasReceber({ filtro, motivo })` | diretor | digitar nome + contagem + **motivo obrigatório** | sim | obrigatório |
| `sincronizarAtivoEnderecos({ grupoId? })` | diretor | contagem | sim | obrigatório |
| `recalcularUltimoHistorico({ grupoId? })` | gerente ou diretor | contagem | sim | opcional |
| `normalizarNomesClifor({ grupoIds? })` | diretor | contagem | sim | obrigatório |
| `transferirCarteira({ deVendedorId, paraVendedorId, grupoIds })` | diretor | digitar nome | sim | obrigatório |
| `diagnosticoPdf()` | diretor | — | — | — |

Regras comuns, não negociáveis:
- `estornarBaixasContasReceber` grava `quem_estornou` e `data_estorno` em cada linha (campos que hoje existem e não são
  preenchidos) e nunca roda sem filtro.
- Rotina destrutiva sem filtro é **erro de validação**, não um aviso.
- Toda action grava em `rotina_execucoes`: rotina, usuário, parâmetros (jsonb), linhas afetadas, início, fim, resultado.
- Nenhuma rotina roda no cliente. `service_role` fica no servidor (regra 4 do `CLAUDE.md`).
- Cálculo de dinheiro em `numeric`, com teste (regra 10).

### 9.4 SQL e jobs
- **Funções, uma por rotina sobrevivente**, sempre com parâmetro de filtro e `RETURNS TABLE` no modo dry-run:
  `fn_recalcular_comissao_pagar(p_filtro jsonb, p_dry_run boolean)`,
  `fn_estornar_baixa_cr(p_filtro jsonb, p_motivo text, p_usuario uuid, p_dry_run boolean)`.
- **Triggers:** `trg_endereco_ativo_segue_grupo` em `grupos_clifor`; `trg_atualiza_ultimo_historico` em `historicos`.
- **Colunas geradas / views:** `vw_clifor_lista` com `ultimo_historico_em` por `LATERAL`; os campos denormalizados de CR
  (`fornecedor`, `num_nf_fornecedor`, `origem`, `destino`) saem do esquema e viram colunas da view.
- **Constraints que tornam metade das rotinas impossíveis:** `enderecos_clifor.grupo_clifor_id NOT NULL`,
  `orcamentos_fornecedor.produto_id NOT NULL`, `cotacoes.vendedor_id NOT NULL`,
  `enderecos_clifor.regime_tributario NOT NULL`.
- **Sequences:** `seq_numero_pedido` / `seq_numero_cotacao` no lugar de `último + 1` calculado em laço.
- **`pg_cron`:** `reset_contador_emails` (diário, 00:00 `America/Sao_Paulo`) e `refresh_token_google` (pelo expiry) —
  os dois backends auto-reagendados de hoje. Mais um job noturno de **conferência** de comissões que só escreve em
  `divergencias_comissao`, sem corrigir nada.
- **RLS ligada desde a primeira migration** (regra 3) em todas as tabelas citadas; `rotina_execucoes` só é legível por
  diretor e só é escrita por `security definer`.

### 9.5 Tabelas envolvidas
Alteradas pelas rotinas: `grupos_clifor`, `enderecos_clifor`, `contas_receber`, `contas_pagar`, `entregas`, `pedidos`,
`propostas`, `cotacoes`, `cotacao_produtos`, `orcamentos_fornecedor`, `entrega_boletos`, `usuarios`, `historicos`.
Novas, para esta tela: **`rotinas`** (catálogo: slug, nome, descrição, risco, idempotente, reversível, filtro obrigatório)
e **`rotina_execucoes`** (execução: rotina, usuário, parâmetros jsonb, linhas afetadas, início, fim, status, erro).
Apoio: `permissoes_pagina`, `config_sistema`, `niveis_vendedores`, `divergencias_comissao`.
**Não migram:** `Tbl.ContasReceberImportado` e as flags `Importado`.

### 9.6 Classificação das 29 rotinas

**Continuam (rotina manual, com trava de diretoria, filtro obrigatório e confirmação):**
1. Recalcular comissão a pagar (bTpoX → bTpop) — passa a exigir período/vendedor e a não tocar em CP paga.
2. Estornar baixas de contas a receber (bTprd → bTprj) — passa a exigir filtro e motivo, e grava `quem_estornou`.
3. Sincronizar "ativo" dos endereços com o grupo (bTmPt0) — mantida como botão de reparo, além do trigger.
4. Recalcular a data do último histórico (bTjLy) — mantida como reparo, além do trigger.
5. Normalizar nomes de clifor (bTeyJ) — mantida, mas preservando a grafia original em coluna separada.
6. Transferir carteira de clientes (evolução de bTjQe) — vira operação de negócio, com origem e destino explícitos.
7. Diagnóstico de geração de PDF (bTmZe) — vira smoke test da fila de PDF, se o app novo gerar PDF no servidor.

**Viram job automático (trigger, coluna gerada ou `pg_cron`):**
8. Data do último histórico (bTjLy, bTjMt) → trigger em `historicos`.
9. Ativo do endereço segue o grupo (bTmPt0) → trigger em `grupos_clifor`.
10. Conferência noturna de comissões (derivada de bTpoX) → `pg_cron`, só relatório.
11. (fora desta tela, citadas por completude) `ResetContagemEmails` e `RefreshTokenGoogle` → `pg_cron`.

**Morrem na migração:**
12. Importar contas receber (bTmGz → bTmHF) — **rotina de migração antiga, já cumpriu o papel**.
13. Att receber importado (bTmIO → bTmHw) — idem; além de não ser idempotente.
14. Deletar a receber importados (bTmUn0 → bTmUN0) — idem.
15. Gerar comissões passadas (bTpoG → bTpni) — backfill único, com laço quebrado.
16. Cliente lucro real (bThlD).
17. Clientes carteira julio (bTjQe) — substituída pela transferência de carteira.
18. Atribui clifor aos endereços (bTjRl) — FK resolve.
19. Gravar fornecedor na CR (bTiPt) — join resolve.
20. Copia NF venda p/ CR (bTiTV) — join resolve.
21. Copiar endereços do orçamento p/ CR (bToWp0) — join resolve.
22. Atribuir criador ao vendedor (bTtkx) — `vendedor_id NOT NULL` resolve.
23. Atribuir modelo produto ao orçamento (bUAht) — join resolve.
24. Copiar info adicional p/ filial (bTmQf e bTnyz1, as duas cópias) — o dado mora no grupo.
25. Copiar boleto único p/ lista (bTiEc0) — passo de ETL.
26. Copiar e-mail de login p/ contato (bTkRn) — default na criação.
27. Copiar / tirar cópias de e-mail dos usuários (bTnwH0, bToPH0) — vem de `config_sistema`.
28. Copiar data NF MegaBox p/ recebimento banco (bToUF) — preenchido na baixa.
29. Liberar todos os endereços (bTveR) e ativar cliforos vazios (bTvfF) — `DEFAULT` + backfill de migration.

Mais tudo o que está na tabela de código morto da §8.1 (editor de endereço inline, busca quebrada, tabela de cotações,
Monthly/Yearly, Create/Cancel, popup e alerta órfãos, botões sem workflow).

---

## 10. Dúvidas

- **[DÚVIDA 1]** `data_source` do `rpg contas importadas` (bTmGn) não está no mapa. *Recomendação padrão:* assumir
  "todos os registros de `ContasReceberImportado`". Irrelevante para o app novo, já que a rotina não é portada.
- **[DÚVIDA 2]** `data_source` do `rpg enderecos clifor` (bTeqS) não está no mapa. *Recomendação padrão:* assumir
  "todos os endereços". Irrelevante: o editor inline não é portado.
- **[DÚVIDA 3]** bTiEi0 grava texto (`"{BoletoFile}"`) num campo `list.file`. *Recomendação padrão:* no ETL, cada
  `BoletoFile` vira uma linha de `entrega_boletos`; ignorar o conteúdo atual de `BoletoArquivos` se conflitar.
- **[DÚVIDA 4]** `:last_element` sem ordenação em bTjME. *Recomendação padrão:* usar `max(created_at)` do histórico.
- **[DÚVIDA 5]** `CotacaoNum = Search(Tbl.Pedido):last_element:NumeroPedido + 1` (bTmHf): a numeração de cotação é
  derivada da de pedido? *Recomendação padrão:* no app novo, duas sequences independentes
  (`seq_numero_cotacao`, `seq_numero_pedido`), inicializadas com o maior valor existente.
- **[DÚVIDA 6]** O que era a "nota 1102" do `Button CZ` (bTprj)? O código não filtra nada. *Recomendação padrão:*
  **não portar**; substituir por "estornar baixa" com filtro e motivo obrigatórios.
- **[DÚVIDA 7]** Os 3% de comissão do vendedor (bTpol, bTpor) são fixos, mas existem `Tbl.NiveisVendedores` e
  `User.QualNivelVendedor`. *Recomendação padrão:* percentual vindo do nível vigente na data da entrega, com 3% como
  default histórico, e teste unitário do cálculo.
- **[DÚVIDA 8]** Quais dos backends que esta página dispara estão realmente expostos na Workflow API? O mapa só declara
  `expose` em alguns. *Recomendação padrão:* auditar bTmHF, bTmHw, bTmQp, bTnzH1, bToTt, bTpni, bTpop, bTprj, bTmUN0 e
  bToWv0 no editor Bubble **antes do corte**, e tratá-los como públicos até prova em contrário. `bUAeU`
  (`VicularOcamentoCopiaAoProdutoCopia`) já está confirmado como público, sem autenticação e ignorando privacidade.
- **[DÚVIDA 9]** A rotina §4.13 (bTmHw) multiplica o próprio campo pela quantidade. Alguma vez foi executada mais de uma
  vez? *Recomendação padrão:* antes do ETL, conferir `ContasReceber` com `Importado = true` cujo `valorcomissao` seja
  absurdo em relação a `ValorTotal`, e corrigir na carga.
- **[DÚVIDA 10]** `bTpni` recebe `qtd = count(ContasReceber)` mas itera sobre entregas (§4.23). Existem contas a pagar
  vazias/órfãs criadas por esse descompasso? *Recomendação padrão:* no ETL, descartar CP sem `entrega_id`.
- **[DÚVIDA 11]** `Button GZ` "atribui clientes ativo = yes para ativos=não" tem dois workflows **vazios** (bTvmb,
  bTvmh). Era para fazer o quê, e ainda é necessário? *Recomendação padrão:* não portar.
- **[DÚVIDA 12]** `Button V` (põe `contato@`/`financeiro@` nas cópias) e `Button X` (tira) são opostos. Qual é o estado
  desejado hoje? *Recomendação padrão:* cópias fixas ficam em `config_sistema` e são aplicadas no envio, não no cadastro
  do usuário.
- **[DÚVIDA 13]** `Tbl.Pedido.cpo.Importado` tem id `cpo_pedidoenviado_boolean` — campo reaproveitado. Em pedidos
  antigos, `Importado = true` significa "importado" ou "pedido enviado"? *Recomendação padrão:* no ETL, **não** usar
  esse campo de `Pedido` como marca de carga; usar só o de `ContasReceber`.
- **[DÚVIDA 14]** O editor de endereço inline (§3.2) e a busca de clifor (§3.3) ainda são usados por alguém, ou são
  restos de `cadastros`? *Recomendação padrão:* não portar; `cadastros` e `pop.AddEditaEndereço` já cobrem.
- **[DÚVIDA 15]** Qual rotina desta tela ainda é executada hoje, e com que frequência? *Recomendação padrão:* na
  ausência de resposta, portar apenas as sete listadas em §9.6 como "continuam", e ligar as demais só sob pedido.

---

## 11. Cobertura — todos os 39 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTeTs | PageLoaded | `SetCustomState var_qualsubmenu_ = MenuConfig.submenu1` no cabeçalho; nenhuma checagem de acesso | 1, 4.1 |
| 2 | bTevn | Clique `Icon B` (linha do RG de endereços) | grava bairro, CEP, complemento, endereço, localização, município, UF e `QualUfOpt` no endereço da linha | 3.2, 4.30 |
| 3 | bTexg | Clique `proxima` | **vazio** | 8.1 |
| 4 | bTexr | Clique `anterior` | **vazio** | 8.1 |
| 5 | bTeyJ | Clique `Button A` "nome clifor maiusculo" | `GrupoCliFor.NomeCliFor` → maiúsculas, em todos | 4.2 |
| 6 | bThhp | Clique `Icon E` | ação do plugin de e-mail 1729605241035 (não instalado), sem parâmetros | 8.1 |
| 7 | bThiD | Clique `Icon E` | **vazio** | 8.1 |
| 8 | bThlD | Clique `Button E` "cliente lucro real" | `EnderecosCliFor.QualRegimeTributario = Lucro Real/Presumido` em todos os endereços de cliente | 4.3 |
| 9 | bTiPt | Clique `Button G` "gravar fornecedor CONTAS RECEBER" | `ContasReceber.QualFornecedor = Entrega.QualFornecedor`, em todas | 4.5 |
| 10 | bTiTV | Clique `Button H` "copia NF venda p/ contas receber" | `ContasReceber.NumNfFornecedor = Entrega.NumNfFornecedor`, em todas | 4.6 |
| 11 | bTjLy | Clique `Button L` "atualiza dt ultimo historico" | `GrupoCliFor.UltimoHistoricoData` = data do último histórico do cliente, em todos | 4.7 |
| 12 | bTjMt | Clique `Button I` "preenche dt ultimo historico vazio" | `GrupoCliFor.UltimoHistoricoData` = data de criação do próprio clifor, só nos vazios | 4.8 |
| 13 | bTjQe | Clique `Button M` "clientes carteira julio" | `GrupoCliFor.QualCarteira = CurrentUser`, em **todos** | 4.9 |
| 14 | bTjRl | Clique `Button N` "atribui clifor aos enderecos" | `EnderecosCliFor.QualGrupoCliFor` = grupo que contém o endereço, em todos | 4.10 |
| 15 | bTkDT | Clique `Icon F` | `ResetGroup` em `gp busca cliente` | 3.3, 4.30 |
| 16 | bTkRn | Clique `Button O` "copiar email login para email contato" | `User.EmailContato = email`, em todos os usuários | 4.11 |
| 17 | bTmGz | Clique `Button P` "importar contas receber" | agenda `CriarContasReceberImportadas` (bTmHF) com a fila do RG | 4.12, 8.1 |
| 18 | bTmIO | Clique `Button Q` "att receber importado" | agenda `AttReceberImportado` (bTmHw) | 4.13, 8.1 |
| 19 | bTmQf | Clique `Button S` "copiar info adicionald do clifor para filial" | agenda `copiainfoaddparafilial` (bTmQp) | 4.16 |
| 20 | bTmZe | Clique `Button U` "testar pdf" | ação do plugin de PDF 1578535742499 (não instalado) | 4.18, 8.1 |
| 21 | bToUF | Clique `Button Y` "copiar data nfmegabox para data recebimentobanco" | agenda `CopiarDataNfmegaboxParaDataRecebimentoBanco` (bToTt) | 4.21 |
| 22 | bTpoG | Clique `Button AZ` "gerar comissoes passadas" | agenda `CriarComissoesPassadas` (bTpni) com `qtd = count(ContasReceber)` e entregas em etapa Financeiro | 4.23 |
| 23 | bTpoX | Clique `Button BZ` "corrigir valor comissao" | agenda `CorrigirValorComissaoPagar` (bTpop) com **todas** as contas a pagar | 4.24 |
| 24 | bTprd | Clique `Button CZ` "tirar nota 1102 das contas a receber" | agenda `LImparNota1102ContasReceber` (bTprj) — estorna **todas** as baixas | 4.25, 7.2 |
| 25 | bTtkx | Clique `Button DZ` "atribuir CRIADOR ao VENDEDOR" | agenda `AtribuirCriadorVendedor` (bTtji) | 4.26 |
| 26 | bTveR | Clique `Button EZ` "atribuir liberado = yes para endereços" | `EnderecosCliFor.Liberado = true`, em **todos** | 4.27, 7.2 |
| 27 | bTvfF | Clique `Button FZ` "atribuir ativo = yes grupoclifor vazio" | `GrupoCliFor.Ativo = true`, só nos que têm o campo vazio | 4.28 |
| 28 | bTvmb | Clique `Button GZ` "atribui clientes ativo = yes para ativos=não" | **vazio** | 8.1 |
| 29 | bTvmh | Clique `Button GZ` (segundo workflow) | **vazio** | 8.1 |
| 30 | bUAht | Clique `Button HZ` "atribuir modelo produto ao orcamento" | agenda `AtribuirModeloProdutoOrcamento` (bUAhf) | 4.29 |
| 31 | bUCVB | Clique `Button IZ` "Monthly" | `SetCustomState window_ = 1` | 2.4, 8.1 |
| 32 | bUCVL | Clique `Button IZ` "Yearly" | `SetCustomState window_ = 2` | 2.4, 8.1 |
| 33 | bTiEc0 | Clique `Button F` "copiar boleto unico das entregas para lista de boletos" | `Entregas.BoletoArquivos = BoletoFile`, em todas | 4.4 |
| 34 | bTmPt0 | Clique `Button R` "desativar enderecos cujo clifo desativado" | `EnderecosCliFor.Ativo = QualGrupoCliFor.Ativo`, em todos | 4.15 |
| 35 | bTmUn0 | Clique `Button T` "deletar a receber importados" | agenda `DeletarReceberImportado` (bTmUN0) — 8 exclusões em massa | 4.14, 7.1 |
| 36 | bTnwH0 | Clique `Button V` "copiar configs smtp p/ tds usuarios" | `User.CopiaPedido = "contato@…; financeiro@…;{EmailContato}"`, em todos | 4.19 |
| 37 | bTnyz1 | Clique `Button W` "copiar info adicional do clifor para 1A filial" | agenda `copiainfoaddparafilial_copy` (bTnzH1) | 4.17 |
| 38 | bToPH0 | Clique `Button X` "tirar email adm das copias do usuario" | `User.CopiaCancelamentos`, `CopiaPedido` e `CopiaProposta = EmailContato`, em todos | 4.20 |
| 39 | bToWp0 | Clique `Button Z` "copiar endereços pedido para contas receber" | agenda `CopiarEndereçosOrcamentoParaContasReceber` (bToWv0) | 4.22 |

**39 de 39 workflows cobertos.** Ações: 34 (os 5 workflows vazios — bTexg, bTexr, bThiD, bTvmb, bTvmh — não têm ação;
39 − 5 = 34, igual ao inventário). Condicionais: 17 (menu 2, margem do grupo 1, zebra 1, máscara CNPJ/CPF 4, default do
rádio 1, troca fuzzy/exata 4, Monthly/Yearly 4). Popup: 1 (`pop apagar registro`, morto). Repeating groups: 2
(`rpg contas importadas`, `rpg enderecos clifor`). Tabela: 1 (`Table A`, morta). Estado customizado: 1 (`window_`).
