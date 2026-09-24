# Spec funcional — página `financeiro` (Bubble `bTpCB`)

Fonte: `mapa/pagina-financeiro.md` (648 elementos · 76 workflows · 134 ações · 176 condicionais · 1 estado customizado).
Apoio: `data-types.md`, `option-sets.md`, `backend-workflows.md` (`EnviarEmailsGeral` bTnvb0), `integracoes.md`,
`reusable-pop.HistoricosContaReceber.md`, `reusable-pop.AnexaNf.md`, `reusable-pop.AgendaContatos.md`,
`reusable-tool.Cabecalho.md`, `reusable-tool.MenuPaginas.md`, `reusable-pop.ConfigSistema.md`.

Glossário usado nesta spec:
- **CR** = registro de `Tbl.ContasReceber` (`tbl_contasreceber`): comissão que a MegaBox tem a **receber do fornecedor**
  por uma venda/entrega (o "valor comissão" é o que se cobra; "valor venda" é só referência).
- **CP** = registro de `Tbl.ContasPagar` (`tbl_contasreceber1`): comissão a **pagar ao vendedor** pela mesma venda
  (ver relatório WF bTpsH, que rotula `CP.valorcomissao` como "Comissão Vendedor" e `Entrega.valorcomissao` como "Comissão Megabox").
- **Baixa** = marcar CR como `Recebido`, registrando NF/recibo MegaBox, data do recebimento no banco e quem baixou.
- **Cobrança** = e-mail ao fornecedor com PDF listando as CRs selecionadas (gera `Tbl.Cobrancas`).
- **Recibo** = declaração de recebimento em PDF emitida pela MegaBox no lugar da NF de serviço.

---

## 1. Propósito e quem usa

Tela "Fluxo Financeiro". Serve para:
1. Listar e filtrar **contas a receber** (comissões dos fornecedores) e **contas a pagar** (comissões dos vendedores).
2. **Selecionar** CRs e **enviar cobrança** ao fornecedor (PDF + e-mail), gerando número de cobrança.
3. **Baixar** CRs recebidas, com NF MegaBox anexada **ou** gerando **recibo** automático numerado (PDF + e-mail opcional ao fornecedor).
4. Enviar para o próprio e-mail um **relatório de comissões a pagar** (CPs selecionadas).
5. Consultar anexos (NF do fornecedor, NF/recibo MegaBox, PDF da cobrança), registrar **históricos** na CR, **arquivar/desarquivar** CRs,
   saltar para o pedido (página `vendas`) ou para o histórico do pedido (página `historico`).

**Quem usa:** departamento Financeiro e Diretoria. `Opt.MenuPaginas.Fluxo Financeiro` declara `hierarquia=2` e
`DepartamentosAcessiveis = [Financeiro, Administrativo(diretoria)]`, mas esses atributos **não são usados** para bloquear nada.

**Como o acesso é controlado hoje (fraco):**
- Único controle: o link do menu (`tool.MenuPaginas`, elemento `Link A`) só fica habilitado se a linha de `Tbl.ConfigSistema`
  com `QualPagina = financeiro` listar o departamento, o perfil ou o próprio usuário (`QuaisDeptos`/`QuaisPerfis`/`QuaisUsuarios`).
- A página **não tem verificação** no carregamento: quem digitar `/financeiro` entra. Não há redirecionamento para usuário
  deslogado (só `tool.Cabecalho` WF bTKRG desloga usuário com `Ativo = false`).
- Dentro da página:
  - Editar (ícone lápis → abre `historico`) só para `QualPerfil.hierarquia ≤ 1` (Diretor): `bt edita contas receber` e
    `bt edita contas pagar` ficam `button_disabled` quando `hierarquia > 1`.
  - Arquivar/desarquivar: o ícone fica **só cinza** para `hierarquia > 1`, **sem desabilitar**. Qualquer usuário consegue arquivar.
  - IDs internos (entrega e CR) aparecem só para `CurrentUser.IsDev = true` (textos bTvJc/bTvJi/bTvJo/bTvJu).

---

## 2. Estrutura da tela

### 2.1 Layout geral (de cima para baixo)
1. **Cabeçalho** `reus cabecalho A` (USA Reusable `tool.Cabecalho`) — dá os estados `var_showmenu_` e `var_showhistorico_`.
2. **Menu lateral** `tool.DashMenu A` (USA `tool.MenuPaginas`), visível quando `cabecalho.var_showmenu_ = true`.
3. **Painel de histórico** `tool.Historico A` (USA `tool.Historico`), visível quando `cabecalho.var_showhistorico_ = true`.
4. Grupo `gp elmentos aplicativo`:
   - **Barra de controles** (`Group B`):
     - Checkboxes (plugin toggle/checkbox 1680110374647 `AAx`): `chk receber` "Lista a receber" (valor = URL `receber`)
       e `chk pagar` "Lista a pagar" (valor = URL `pagar`).
     - **Botões de ação** (`gp botoes`):
       - Bloco receber: `btn enviar cobranca` "Enviar Cobrança" · `btn baixar cr` "Baixar Contas a Receber" · `btn relatorio cr` "Relatório contas a receber".
       - Bloco pagar: `btn baixar cp` "Baixar Contas a Pagar" · `btn relatorio cp` "Relatório contas a pagar".
       - `Button limparfiltros` "Limpar Filtros".
     - `RadioButtons A` — tipo de data do filtro (todas as opções de `Opt.TiposData`, 3 colunas; default = opção cujo `display` = URL `dtfiltro`).
     - Plugins de barra de rolagem `Scrollbar cr` / `Scrollbar cp` (plugin 1642683387367), ligados aos ids `remodelacr` e `remodelacp`.
   - **Filtros** (`gp filtros financeiro`), cada um com ícone de "limpar filtro" que fica colorido quando preenchido:
     | Rótulo | Elemento | Tipo | Opções | Parâmetro URL |
     |---|---|---|---|---|
     | Intervalo de data | `dtr filterfinanceiro data` (plugin date range 1648823245313, pt-BR, DD/MM/YY, botões "Aplicar/Cancelar") | período | — | `datainicio`, `datafim` |
     | (ícone) Todo histórico | `btn periodointegral` | ícone | habilitado só se cliente, fornecedor ou status preenchido | `datainicio`, `datafim` |
     | Núm pedido | `dd filterfinanceiro numpedido` | inteiro (placeholder errado "Número cobrança") | — | `numpedido` |
     | Cliente | `dd filterfinanceiro CLIENTE` | autocomplete | `GrupoCliFor` tipo Cliente, ordem `NomeCliFor` | `cliente` |
     | Grupo Fornecedor | `dd filterfinanceiro fornecedor` | autocomplete | `GrupoCliFor` tipo Fornecedor e `Ativo`, ordem `NomeCliFor` | `fornecedor` |
     | Filial Fornecedor | `dd filterfinanceiro filialfornecedor` | dropdown | endereços de origem (`QualOrigem`) das CRs hoje listadas, ordenados por `NomeEndereco`; exibe "Nome (CNPJ)" | `filialfornecedor` |
     | Vendedor | `dd filterfinanceiro vendedor` | autocomplete | `User` ativos, ordem `NomeModelo` | `vendedor` |
     | Num NF Fornecedor | `dd filterfinanceiro NFfornecedor` | texto | — | `fornecedornf` |
     | Num NF Megabox | `dd filterfinanceiro numcobranca` (bTpIC — nome duplicado) | texto | — | `megaboxnf` |
     | Núm cobrança | `dd filterfinanceiro numcobranca` (bTpIN) | inteiro | — | `numcobranca` |
     | Status recebimento | `dd filterfinanceiro status` | dropdown | todas de `Opt.StatusFinanceiro` em maiúsculas | `statusfinanceiro` |
     | Arquivados | `dd arquivados` | dropdown estático "Sim/Não" | — | grava `arquivado` na URL, mas **ninguém lê** |
   - **Tabela a receber** `gp receber` → `rpg receber` (visível quando URL `receber = yes`). Ver §3.2.
   - **Tabela a pagar** `gp pagar` → `rpg pagar` (visível quando URL `pagar = yes`). Ver §3.3.
   - **Cards de totais** (`Group XZZZ`):
     - `gp card vencidos` "A receber vencidos (n)" + valor; clicável (WF bTpVD); fundo destacado quando URL `showvencidos = yes`.
     - `gp cards receber`: "Receber listado (n)" + soma; "Receber selecionado (n)" + soma (fundo destacado se há seleção).
     - `gp cards pagar`: "Pagar listado (n)" + soma; "Pagar selecionado (n)" + soma.

### 2.2 Popups e reusables
| Elemento | Tipo | Uso nesta página |
|---|---|---|
| `pop baixar recebiveis` (bTqzf) | Popup | Baixa de CRs (NF ou recibo). Estado `var_showalert_` (boolean) = "gravando". Ver §4.4/4.5 |
| `pop envia cobranca new` (bTpNl) | Popup | "Cobrança de Fornecedores": corpo do PDF + e-mail. Ver §4.3 |
| `pop oculto` (bTrRq) | Popup nunca exibido | Guarda as duas RGs de busca (`rpg a pagar geral`, `rpg a receber geral`, 1 linha cada) — funcionam como "variáveis" da lista filtrada |
| `pop apagar registro` (bTpQr) | Popup | Confirmação "apagar registro" — **nenhum WF abre nem usa** (código morto) |
| `alt processando` (bTpQq) | Alert | "Aguarde, gravando registros" — **nunca acionado** (morto) |
| `pop.HistoricosContaReceber A` | USA Reusable | Históricos financeiros da CR (lista, incluir, editar). Aberto por WF bTpUs / bTpVc |
| `pop.AgendaContatos A` | USA Reusable | Agenda de contatos do grupo do fornecedor (para escolher e-mails). WF bTpUT / bTrNb |
| `pop.AnexaNf A` (bUEqi0) | USA Reusable, dentro da célula "NF Fornecedor" de cada CR | Popup "Informações de entrega" da entrega da CR (anexar NF/boletos do fornecedor, e-mail ao cliente) — lógica no próprio reusable |
| `pop.EditaContasReceberNew A` | USA Reusable | Só era aberto por WF bTpTH / bTvIt, **ambos desativados** → sem uso |
| `pop.ConfirmaEntrega A` | USA Reusable `pop.EditaContasReceber` | **Nenhum WF o abre** → sem uso |
| `tool.Cabecalho`, `tool.MenuPaginas`, `tool.Historico` | USA Reusable | Moldura comum do app |

### 2.3 Parâmetros de URL (estado da tela)
`receber` (yes/no) · `pagar` (yes/no) · `dtfiltro` (display de `Opt.TiposData`) · `datainicio`, `datafim` (datas) ·
`cliente`, `fornecedor` (id `GrupoCliFor`) · `filialfornecedor` (id `EnderecosCliFor`) · `vendedor` (id User) ·
`numpedido` (número) · `numcobranca` (número) · `fornecedornf` (texto) · `megaboxnf` (número) ·
`statusfinanceiro` (display de `Opt.StatusFinanceiro`) · `showvencidos` ("yes", só visual) · `arquivado` (gravado, não lido).

### 2.4 Estado "de sessão" guardado no usuário
- `User.SelecionadosReceber` (lista de CR) e `User.SelecionadosPagar` (lista de CP): seleção atual das tabelas, **gravada no banco**.
- `User.UltimoDateRange`: último período escolhido no filtro de data (restaurado ao abrir a página).

---

## 3. Dados

### 3.1 As duas buscas-base (dentro de `pop oculto`)
`rpg a receber geral` (CR) e `rpg a pagar geral` (CP). A fonte depende de `dtfiltro` + `receber`/`pagar` (6 variações cada,
uma por tipo de data). Todas usam "ignorar filtros vazios". Em linguagem de negócio:

> CRs (ou CPs) cuja **data escolhida em `dtfiltro`** esteja entre `datainicio` e `datafim`, e — se informados — do
> cliente, do grupo fornecedor, da filial fornecedor (`QualOrigem`), da filial cliente (`QualDestino`, parâmetro
> `filialcliente`, **não há campo na tela para ele**), do vendedor, com o número de cobrança, o status financeiro,
> o número do pedido (igualdade de texto), a NF MegaBox (igualdade de texto) e cuja NF do fornecedor **contenha** o texto informado.

| `dtfiltro` (Opt.TiposData) | Campo de data comparado |
|---|---|
| Data entrega | `DataEntrega` |
| Data vencimento | `DataVencimento` |
| Data pedido | `DataPedido` |
| Data NF Megabox | `DataNfMegabox` |
| Data baixa sistema | `DataBaixaSistema` |
| Data recebto banco | `DataRecebimentoBancocaixa` (em CR ainda exige `DataRecebimentoBancocaixa` não vazio) |

Diferenças CR × CP:
- CR sempre filtra `Arquivado = false`. CP não tem campo Arquivado.
- CR: se `dd arquivados = "Sim"` (lido direto do elemento, não da URL), a fonte vira **todas as CR com `Arquivado = true`**,
  **ignorando todos os outros filtros e o período** (última condicional vence).
- Sem `dtfiltro` na URL nenhuma condição casa → lista vazia.
- Sem ordenação definida (ordem do banco).

### 3.2 Tabela "a receber" `rpg receber` (tipo CR)
- **Fonte:** `SelecionadosReceber` do usuário **unida** (`merged_with`) à busca-base de CR → as linhas selecionadas continuam
  aparecendo mesmo se saírem do filtro. Cabeçalho fixo (sticky), zebra (linha ímpar com fundo 8%), hover 12%,
  linha selecionada com cor `bTHHF`.
- **Colunas** (cabeçalho → conteúdo):
  | Cabeçalho | Conteúdo |
  |---|---|
  | Vendedor / Núm pedido | "Vendedor:" `QualVendedor.NomeModelo` (ícone filtrar vendedor) · "Núm Pedido:" `NumeroPedido` (ícone filtrar pedido, ícone abrir pedido) · (IsDev) id da entrega e id da CR |
  | Datas | Dt Pedido · Dt prev entrega (grupo oculto) · Dt vcto (vermelho/negrito se agora > vencimento **e** status "A receber") · Dt entrega. O rótulo da data usada no filtro fica destacado |
  | Cliente / Contato | "Grupo:" `QualCliente.NomeCliFor` (ícone filtrar cliente) · "Filial:" `QualOrcamentoFornecedor.QualEnderecoDestino.NomeEndereco` · "Contato:" `QualPedido.EmailCliente.NomeContato` |
  | Valores | Vlr Venda UN `ValorUnit` · Vlr Venda TT `ValorTotal` · Vlr Comissão `valorcomissao` |
  | Fornecedor / Produto | "Grupo:" `QualFornecedor.NomeCliFor` (ícone filtrar fornecedor) · "Filial:" `QualOrcamentoFornecedor.QualEnderecoOrigem.NomeEndereco` · "Prod.:" `Qtd` – `QualOrcamentoFornecedor.QualCotacaoProduto.QualProduto.NomeModelo` |
  | NF Fornecedor / Dt NF Fornecedor | ícone "importada" se `Importado` · "NF Fornec:" `NumNfFornecedor` + clipe (cinza se `QualEntrega.ArquivoNfFornecedor` vazio) · "Boletos:" nº de `QualEntrega.BoletoArquivos` + `pop.AnexaNf` + clipe boletos (oculto) · "Dt Nf:" `QualEntrega.DtEmissaoNf` |
  | Status / Último histórico | Selo `StatusFinanceiro` (verde com ícone "price_check" se Recebido) · pílula com data/hora do último histórico (`QuaisHistoricos:last`) ou "Adicionar Hist" se não houver; texto do último histórico (oculto, alterna ao clicar) |
  | (coluna de seleção) | "i / total" · ícones arquivar/desarquivar (um ou outro conforme `Arquivado`) · lápis editar · checkbox de seleção. No cabeçalho: "marca todos" / "desmarca todos" |
  | NF Recebimento / Dt NF Recebimento | "Cobrança núm:" `CobrancaNum` + clipe (ativo se `QualCobranca.AnexoFile` ou `AnexoLink`) · "Nf Receb.:" `NumNfMegabox` + clipe (ativo se `AnexoNfMegabox`) · "Quem baixou:" primeiro nome de `QuemBaixou` · "Dt NF/Recibo:" `DataNfMegabox` · "Dt Receb Banco:" `DataRecebimentoBancocaixa` · "Dt Baixa Sistema:" `DataBaixaSistema` |

### 3.3 Tabela "a pagar" `rpg pagar` (tipo CP)
Mesma estrutura, fonte `SelecionadosPagar` unida à busca-base de CP. Diferenças:
- Sem prev. entrega; Contato em maiúsculas; produto em maiúsculas.
- "NF Fornec:" vem de `QualEntrega.NumNfFornecedor` (não do campo da CP); ícone info "gerada retroativamente" se `Importado`; clipe de boletos visível (WF bTpjB vazio).
- Pílula de histórico **oculta** quando não há histórico (na CR ela aparece com "Adicionar Hist").
- Sem arquivar/desarquivar.
- Última coluna "Info Pagamento": Dt Pagto Banco (`DataRecebimentoBancocaixa`), Dt Baixa Sistema, Quem baixou.
- Status fica verde quando `Recebido` e vencimento fica vermelho quando status "A receber" — condições copiadas da CR;
  para CP (status "A pagar"/"Pago") **nunca disparam** [DÚVIDA sobre quais status as CPs realmente usam].

### 3.4 Cards e somatórios
| Card | Quantidade | Valor |
|---|---|---|
| A receber vencidos | nº de valores de comissão não vazios de CRs com status "A receber" e vencimento entre 01/01/2020 00:00 (BRT) e hoje 23:59:59 | soma de `valorcomissao` do mesmo conjunto |
| Receber listado | nº de linhas da busca-base CR (sem os selecionados unidos) | soma de `valorcomissao` da tabela `rpg receber` (**com** os selecionados unidos) → contagem e soma podem divergir |
| Receber selecionado | nº de `SelecionadosReceber` | soma `valorcomissao` dos selecionados |
| Pagar listado | nº de linhas da busca-base CP | soma `valorcomissao` de `rpg pagar` |
| Pagar selecionado | nº de `SelecionadosPagar` | soma `valorcomissao` dos selecionados |

O card de vencidos **não exclui arquivados** e ignora todos os filtros.

### 3.5 Listas dentro dos popups
- **Baixa** (`gp lista receber`, visível quando "gerar recibo" desligado): tabela "Contas a baixar" = `SelecionadosReceber`;
  colunas Datas (pedido, prev. entrega, entrega, vcto), Valor comissão (soma no cabeçalho), Valor venda (soma no cabeçalho),
  Fornecedor/filial origem/NF fornecedor, logo e nome do cliente/filial destino/pedido.
- **Recibo** (`gp recibo`, id HTML `corporecibo`, visível quando "gerar recibo" ligado): tabela = `SelecionadosReceber`, colunas
  Qtd/Produto (HTML C, 12.706 caracteres, não detalhado no mapa), Datas, Valores (UN, TT, Comissão), NF, logo e nome do cliente/pedido.
- **Cobrança** (`gp corpo cobrança`, id HTML `corpocobranca`): tabela = `SelecionadosReceber`, colunas Datas, Qtd/Produto
  (HTML D, 961 caracteres), Valores (UN, TT, Comissão, "Vlr Com. UN" = `QualEntrega.ValorComissaoUnitario`), NF (`QualEntrega.NumNfFornecedor`), logo e cliente/pedido.

---

## 4. Funcionalidades e regras de negócio

### 4.1 Carregamento e filtros (tudo por parâmetro de URL)
- **Ao abrir (WF bTpRZ):**
  1. ação de plugin 1558770956236 `AAC` (bTpRa) — função não identificada [DÚVIDA].
  2. (bTpRb) sem `datainicio`/`datafim` na URL e com `UltimoDateRange` salvo → usa o período salvo.
  3. (bTpRf) condição `(sem datas E sem datas) OU UltimoDateRange vazio` → período = dia 1 do mês 00:00:00 até "dia 31" 23:59:59.
     Pela precedência, se o usuário nunca salvou período, isso **sobrescreve até datas vindas na URL**.
  4. (bTpRg) sem `dtfiltro` → "Data entrega".
  5. (bTplv) sem `receber` → `yes`. (bTpmf) sem `pagar` → `no`.
- **Período** (WF bTpRy): ao aplicar no date range, grava `User.UltimoDateRange` (bTpRz) e põe na URL início 00:00:00 e fim 23:59:59 (bTpSD).
- **Todo histórico** (WF bTpSE): início fixo 01/01/2024 00:00 (BRT) até hoje 23:59:59. Só habilitado com cliente, fornecedor ou status preenchido.
- **Tipo de data** (WF bTpSJ): reseta os grupos das tabelas (bTpml, bTpmh) e grava `dtfiltro` (bTpSK).
- **Cada filtro grava seu parâmetro ao mudar e o ícone de limpar zera o grupo e o parâmetro:**
  | Filtro | Mudar | Limpar |
  |---|---|---|
  | Cliente | WF bTpSR (bTpSV) | WF bTpSL (bTpSP, bTpSQ) |
  | Grupo fornecedor | WF bTpRm (bTpRn) | WF bTpSW (bTpSX, bTpSb) |
  | Filial fornecedor | WF bTpVi (bTpVj) | WF bTpVn (bTpVo, bTpVp) |
  | Vendedor | WF bTpSz (bTpTA) | WF bTpTB (bTpTF, bTpTG) |
  | Núm pedido | WF bTpTl (bTpTp) | WF bTpTq (bTpTr, bTpTv) |
  | Núm cobrança | WF bTpSp (bTpSt) | WF bTpSj (bTpSn, bTpSo) |
  | NF fornecedor | WF bTpTN (bTpTR) | WF bTpTX (bTpTY, bTpTZ) |
  | NF MegaBox | WF bTpTS (bTpTT) | WF bTpTd (bTpTe, bTpTf) |
  | Status | WF bTpRr (bTpRs) | — (esvaziar o dropdown) |
  | Arquivados | WF bUFEf (bUFEm) grava `arquivado`, sem efeito na busca (a busca lê o elemento) | — |
- **Status vazio sem cliente e sem fornecedor** (WF bTpRt, bTpRx): volta o período para o mês corrente e grava status vazio.
  Roda junto com bTpRr.
- **Atalhos de filtro nas linhas** (receber / pagar): vendedor WF bTpqR (bTpqW) / bTpqu (bTpqz); pedido WF bTpqh (bTpqj) /
  bTprH (bTprM); cliente WF bTpVK (bTpVL) / bTpid (bTpif); fornecedor WF bTpVF (bTpVJ) / bTpik (bTpip).
  O ícone fica desabilitado quando o filtro já é aquele valor — mas vendedor e pedido comparam com `cliente` (copiado errado).
- **Mostrar listas** — `chk receber`: WF bTplx (yes→no, bTpmD) / bTpmH (no→yes, bTpmJ); `chk pagar`: WF bTpmO (bTpmU) / bTpmV (bTpma).
- **Limpar filtros** (WF bTpSc): esvazia as duas seleções do usuário (bTpSd), reseta o grupo de filtros (bTpSh) e navega mantendo
  **só** `receber` e `pagar` (bTpSi, `keep_current_page_params=False`) — período e `dtfiltro` somem da URL [DÚVIDA: se a página
  não recarrega, o PageLoaded não repõe `dtfiltro` e as tabelas ficam vazias].
- **Card vencidos** (WF bTpVD, bTpVE): período 01/01/2022 → hoje 23:59:59, status "A receber", `dtfiltro` = Data vencimento,
  `showvencidos=yes`, `receber=yes`, `pagar=no` (mantém os demais filtros). O card conta a partir de 2020, o clique filtra a partir de 2022.

### 4.2 Seleção de contas
- CR, linha: WF bTpRI (bTpRJ) adiciona se não está; WF bTpRN (bTpRO) remove se está.
- CR, cabeçalho: "marca todos" WF bTpRP (bTpRT) e "desmarca todos" WF bTpRU (bTpRV) sobre a lista da tabela.
- CP, linha: WF bTpjg (bTpjl) adiciona / WF bTpjn (bTpjs) remove. Cabeçalho: WF bTpiM (bTpiR) e WF bTpiT (bTpiY).
- O mapa mostra todas como `campo = valor`; o operador de lista (add/remove/set/clear) não foi decompilado. Pelos ícones e
  condições, a leitura é: adicionar, remover, adicionar todos, remover todos [DÚVIDA — confirmar no editor].
- A seleção é gravada no **registro do usuário** (persistente entre sessões e abas).

### 4.3 Enviar cobrança ao fornecedor
- Botão `btn enviar cobranca` habilitado só com ≥ 1 CR selecionada **e** filial fornecedor escolhida no filtro. WF bTpSu (bTpSv) abre o popup.
- **Popup "Cobrança de Fornecedores"** (corpo `corpocobranca`, vira PDF):
  - Logo `Opt.EmpresaMegabox.Megabox.logo_horizontal`; consultor (nome e e-mail do usuário); telefones fixos no texto.
  - "Cobrança núm:" = **quantidade de cobranças existentes + 1** (campo desabilitado); data de hoje por extenso.
  - Fornecedor = grupo do filtro "Grupo Fornecedor" (logo e nome); "A/C:" = contato escolhido.
  - Resumo: quantidade; "Valor total em vendas" = agrupa selecionados por entrega e tira a **mediana** de `ValorTotal`
    de cada entrega (evita somar a mesma venda repetida em várias parcelas) [DÚVIDA: a expressão devolve uma lista, não a soma];
    "Valor total em comissões" = soma `valorcomissao`.
  - Tabela dos selecionados (§3.5), "Mais observações" e texto fixo com dados bancários da MegaBox (banco, agência, conta, PIX).
  - E-mail: **Para** = um contato do grupo da filial fornecedor escolhida (obrigatório); **Cópia** = vários contatos do mesmo grupo;
    **Corpo** pré-preenchido (saudação ao contato, texto padrão, dados bancários, nome e `EmailContato` do usuário).
  - Ícone agenda (WF bTpUT: bTpUU, bTpUV) abre `pop.AgendaContatos` com o grupo da filial para cadastrar/editar contatos.
  - Fechar (WF bTpUO, bTpUP).
- **Enviar** (WF bTpUH): rola até o aviso "gravando" (bTpUI), esconde o título (bTpUJ → aviso aparece), gera PDF do grupo
  `corpocobranca` 800×1100, nome `cobranca _numero{N}__{nome da filial em minúsculas}` (bTpUN, plugin PDF 1648430145817).
- **Ao terminar o PDF** (WF bTpUZ):
  1. (bTpUa) cria `Cobrancas`: `NumeroCobranca` = número do popup, `QualFornecedor` = **filtro Grupo Fornecedor** (pode estar vazio,
     o botão só exige a filial), `AnexoLink` = URL do PDF, `QuaisContasReceber` = selecionados.
  2. (bTpUb) em cada CR selecionada: `QualCobranca` = cobrança criada, `CobrancaNum` = número. **Status não muda.**
  3. (bTpUf) esvazia `SelecionadosReceber`.
  4. (bTpUg) agenda `EnviarEmailsGeral` (bTnvb0) agora: to = e-mail do contato; cc = e-mails da cópia; bcc = `EmailContato` dos usuários
     da config `CodigoConfig = 10`; reply-to = `EmailContato` do usuário; remetente "[Megabox] PRIMEIRONOME"; assunto
     "Cobrança número N"; anexo1 = PDF; `mailpessoal` aponta para campo excluído.
  5. (bTpUh) mostra o título de novo.
  6. (bTpUl) cria `Historico` no fornecedor da cobrança: "Enviado email de cobrança número N contendo relatório anexo de contas a receber",
     vendedor = usuário, anexo = PDF. **Não** liga o histórico às CRs e **não** atualiza `UltimoHistorico*` do grupo (o recibo atualiza).
  7. (bTpUn, bTpUr) fecha e reseta o popup.
- Não há validação de que todas as CRs selecionadas são do fornecedor escolhido.

### 4.4 Baixar contas a receber — com NF MegaBox (recibo desligado)
- Botão `btn baixar cr` habilitado com ≥ 1 CR selecionada. WF bTpRh (bTrFr) abre `pop baixar recebiveis`. Fechar: WF bTrMB (bTrMH, bTrMJ).
- Campos: "Número NF Megabox" (texto livre), "Anexo NF Megabox" (arquivo, máx. 2 MB), "Data NF Megabox" (obrigatória),
  "Data recbto. banco" (obrigatória), "Data baixa sistema" (= agora, desabilitada). Lista "Contas a baixar" (§3.5).
- **Baixar Contas** (WF bTpVP, condição recibo desligado): rola ao topo (bTvTM), liga o aviso (bTvSt) e, em **todas** as CRs selecionadas (bTpVQ):
  `DataNfMegabox` = data informada · `NumNfMegabox` = número · `StatusFinanceiro` = **Recebido** · `AnexoNfMegabox` = arquivo ·
  `DataBaixaSistema` = agora · `QuemBaixou` = usuário · `DataRecebimentoBancocaixa` = data do banco.
  Depois reseta os campos (bTpVR), desliga o aviso (bTvTA) e fecha (bTvTF).
- **A seleção não é esvaziada** neste caminho (no recibo é). Não gera histórico.

### 4.5 Baixar contas a receber — gerando recibo
- Toggle `tgg gerar recibo` "Gerar recibo no lugar da nota fiscal" (plugin 1680110374647). Ao mudar (WF bTrMV) reseta número (bTrMb) e o toggle de e-mail (bTrOk).
- Com o toggle ligado:
  - Rótulos mudam para "Número/Anexo/Data Recibo Megabox".
  - Número = `ConfigSistema[17].ValorNumero + 1`, desabilitado. Anexo desabilitado ("Recibo gerado automaticamente").
  - "CNPJ fornecedor do recibo" fica obrigatório e habilitado: endereços **ativos** do fornecedor da **primeira** CR selecionada, exibidos "NOME (cnpj: …)".
  - Toggle "Enviar recibo para o fornecedor" habilitado. Com ele ligado, habilitam "Email para" (contatos do grupo do endereço escolhido, obrigatório),
    "Enviar cópia para" (múltiplos) e "Corpo do email" (pré-preenchido: saudação, "Segue anexo nosso recibo número N…", nome e `EmailLoginTexto` do usuário).
    Ícone agenda: WF bTrNb (bTrNd, bTrNh) abre `pop.AgendaContatos` com o grupo do endereço.
  - A lista vira o **documento do recibo** (`corporecibo`): logo, consultor, telefones; "Declaração de recebimento" + data do recibo por extenso
    (formato `dddd, dd "de" mmm "de" yyyy`); "RECIBO Nº N"; texto: "A MEGABOX LOGÍSTIDA LTDA, CNPJ 39.667.615/0001-01, declara … que recebeu de
    {Razão do endereço}, CNPJ {CnpjCpf}, o valor total de {soma valorcomissao} referente às vendas abaixo discriminadas";
    bloco do fornecedor (logo do grupo, razão e CNPJ); resumo (quantidade, total em vendas = soma `ValorTotal`, total em comissões = soma `valorcomissao`); tabela.
- **Baixar Contas** (WF bTrPJ, condição recibo ligado):
  1. (bTvTR) rola ao topo; (bTvSv) liga o aviso.
  2. (bTrPO) nas CRs selecionadas: mesmos campos da §4.4 **exceto** anexo (Status Recebido, `NumNfMegabox` = nº do recibo, `DataNfMegabox` = data do recibo,
     `DataBaixaSistema` = agora, `QuemBaixou`, `DataRecebimentoBancocaixa`).
  3. (bUFHZ1) grava `ConfigSistema[17].ValorNumero` = número do recibo.
  4. (bTrPU) gera PDF do grupo `corporecibo` 800×1000, nome "ReciboNum: N - Fornecedor: NOME".
- **Ao terminar o PDF** (WF bTrNj):
  1. (bTrNp) `AnexoNfMegabox` = URL do PDF em todas as CRs selecionadas.
  2. (bTrNt) esvazia `SelecionadosReceber`.
  3. (bTrNu) **só se** "enviar recibo" ligado: agenda bTnvb0 — to = contato, cc = cópias, bcc = usuários da config 10, reply-to = `EmailContato`,
     remetente "[Megabox] PRIMEIRONOME", assunto "Rebibo número N" (erro de digitação), anexo = PDF.
  4. (bTrNz) cria `Historico`: "Enviado email de recibo número N contendo lista de contas recebidas" (gravado mesmo sem e-mail),
     cliente = fornecedor da 1ª CR alterada, vendedor = usuário, anexo = PDF, unidade = endereço/CNPJ do recibo.
  5. (bTrOA) atualiza `UltimoHistoricoData`/`UltimoHistoricoMsg` do grupo fornecedor.
  6. (bTvTH) desliga o aviso; (bTvTT) grava de novo `ConfigSistema[17].ValorNumero` (duplicado de bUFHZ1); (bTrOB, bTrOF) fecha e reseta.
- O campo `ContasReceber.GerouReciboRecebimento` existe mas **nunca é gravado**.

### 4.6 Baixar contas a pagar
- Botão `btn baixar cp` (habilitado com ≥ 1 CP selecionada) **não tem workflow**. Não existe baixa de CP nesta página [DÚVIDA: onde as CPs são baixadas hoje?].

### 4.7 Relatórios por e-mail
- **Relatório contas a pagar** (WF bTpsH): agenda bTnvb0 (bTpud) para o `EmailContato` do **próprio usuário**, assunto "Lista comissões",
  remetente = nome do usuário, corpo "Lista de comissões a pagar:" + uma linha por CP selecionada:
  `Cliente – Destino – "Num pedido:" (mostra a DataPedido, bug) – Dt Entrega – Produto – Qtd (CotacaoProduto.qtd) –
  Comissão Megabox (Entrega.valorcomissao) – Comissão Vendedor (CP.valorcomissao) – Data/Núm NF (Entrega.DtEmissaoNf – CP.NumNfFornecedor)`.
  Toast "Email enviado para … Confira caixa de spam." (bTpsO) e esvazia `SelecionadosPagar` (bTpsP).
- **Relatório contas a receber** (WF bUFEH): **vazio** — botão sem efeito.

### 4.8 Arquivar / desarquivar CR
- Arquivar (WF bUFDT): `Arquivado = true` (bUFDd) + toast "Arquivado com sucesso" (bUFEr). Desarquivar (WF bUFFD): `Arquivado = false` (bUFFK) + toast (bUFFP).
- Sem confirmação, sem registro de quem/quando/motivo (existe `Opt.MotivoArquivamento`, não usado aqui).

### 4.9 Históricos da conta
- CR: clicar na pílula (WF bTpUs) alterna o texto do último histórico (bTpUt) e abre `pop.HistoricosContaReceber` com a CR (bUFAN, bUFAS).
  Clicar no texto (WF bTpVc: bTpVd, bTpVh) também abre.
- CP: clicar na pílula (WF bTpjO, bTpjT) só alterna o texto; não abre popup.
- O reusable permite incluir histórico (grava no cliente e, opcional, no fornecedor, atualiza `UltimoHistorico*` e liga à CR),
  editar/apagar os próprios (ou todos, se Diretor) — detalhado em `reusable-pop.HistoricosContaReceber.md`.

### 4.10 Anexos e navegação
- NF do fornecedor: WF bTpTj (CR, bTpTk) e WF bTpir (CP, bTpiw) abrem `QualEntrega.ArquivoNfFornecedor` em nova aba.
- Boletos: WF bTpTw (CR, abria até 4 boletos — bTpTx, bTpUB, bTpUC, bTpUD) está **desativado**; WF bTpjB (CP) **vazio**.
- PDF da cobrança: WF bTpUx abre `QualCobranca.AnexoLink` (bTpUy) e/ou `AnexoFile` (bTpUz).
- NF/recibo MegaBox: WF bTpVX (bTpVb) abre `AnexoNfMegabox`.
- Abrir pedido: WF bTsMh (bTsMn) → página `vendas` em nova aba com `datainicio`/`datafim` = dia do pedido e `numeropedido`.
- Editar (lápis): CR WF bTvIN (bTvIV) e CP WF bTpjx (bTvJE) → página `historico` em nova aba com `numpedido`.
  As versões antigas que abriam `pop.EditaContasReceberNew` (WF bTpTH: bTpTL, bTpTM; WF bTvIt: bTvIy, bTvIz) estão **desativadas**.

---

## 5. Cálculos e valores

| Valor | Fórmula exata (Bubble) | Observação |
|---|---|---|
| Soma de comissão (cards, cabeçalhos, recibo) | `lista:cpo.valorcomissao:sum` | sem arredondamento; exibe moeda R$ 2 casas, vírgula decimal, ponto milhar |
| Soma de venda (popup baixa, recibo) | `lista:cpo.ValorTotal:sum` | idem |
| Total em vendas (cobrança) | `SelecionadosReceber:group_by(QualEntrega):median(ValorTotal)` | mediana por entrega; saída é lista [DÚVIDA] |
| Valor declarado no recibo | soma `valorcomissao` dos selecionados | é a comissão, não a venda |
| Vencidos | CR com `StatusFinanceiro = A receber` e `DataVencimento` entre `Date(1577847600000)` (01/01/2020 00:00 BRT) e hoje 23:59:59; qtd = `valorcomissao:count`, valor = `valorcomissao:sum` | a contagem conta valores não vazios, não registros |
| Número da cobrança | `Search(Cobrancas):count + 1` | calculado no navegador; colide com concorrência ou exclusão |
| Número do recibo | `ConfigSistema[CodigoConfig=17].ValorNumero + 1`; após baixa grava o número exibido (`convert_to_number`) | calculado no navegador; gravado 2× |
| Período padrão | início = hoje `change_date(1)` 00:00:00; fim = hoje `change_date(31)` 23:59:59 | em meses com < 31 dias o "dia 31" transborda para o mês seguinte (ex.: 30/abr → 01/mai) |
| Período do date range | início `min` 00:00:00; fim `max` 23:59:59 | fuso do navegador |
| Todo histórico | `Date(1704078000000)` = 01/01/2024 00:00 BRT → hoje 23:59:59 | registros antes de 2024 ficam de fora |
| Clique em vencidos | `Date(1641006000000)` = 01/01/2022 00:00 BRT → hoje 23:59:59 | diferente do card (2020) |
| Vencida (cor) | `agora > DataVencimento` (e, nas tabelas principais, status A receber) | compara data-hora: vence "hoje" já aparece vermelho se vencimento gravado 00:00 |
| Contador de linha | `CellIndex / total da tabela` | |
| Quem baixou | `QuemBaixou.NomeModelo:split_by(" "):first` | |
| Datas | formato `dd/mm/yy`; histórico `dd/mm/yy/ - HH:MM`; e-mail CP `dd/mmm/yy` | |

---

## 6. Integrações e backend workflows

| O quê | Onde | Detalhe |
|---|---|---|
| `ScheduleAPIEvent` → `EnviarEmailsGeral` (bTnvb0) | WF bTpUZ (bTpUg) cobrança; WF bTrNj (bTrNu) recibo; WF bTpsH (bTpud) relatório CP | O backend envia por **SendEmail do Bubble (SendGrid)** se `ConfigSistema[19].ValorBoolean1 = false`, ou por **SMTP Gmail** (plugin 1752755029481, credenciais em `Opt.Smtp.GmailMegabox`) se `true`; soma 1 no contador diário `ConfigSistema[19].ValorNumero` |
| `ConfigSistema` código 10 | bcc de cobrança e recibo | lista de usuários que recebem cópia oculta [DÚVIDA: nome da config] |
| `ConfigSistema` código 17 | recibo | "Numeração de recibos" (`reusable-pop.ConfigSistema`, grupo CONTROLE RECIBOS) |
| `ConfigSistema` código 19 | backend e-mail | "CONTROLE EMAILS": escolhe SMTP × SendGrid e conta envios |
| Plugin 1648430145817 (gerador PDF/imagem de HTML) | `PDF/IMG cobranca`, `PDF/IMG recibo` | ação `AAL` gera PDF de um grupo pelo id HTML; evento `AAY` "PDF pronto" devolve URL (`AAb`) já hospedada no Bubble |
| Plugin 1680110374647 (toggle/checkbox) | `tgg gerar recibo`, `tgg enviar email recibo`, `chk receber`, `chk pagar` | eventos `AAJ`/`AAf` = mudou; `AAI` = valor |
| Plugin 1648823245313 (date range picker) | `dtr filterfinanceiro data` | evento `AAd` = aplicou; `AAF` = período |
| Plugin 1642683387367 (scrollbar) | `Scrollbar cr`, `Scrollbar cp` | só visual |
| Plugin 1658328157117 (toast) | bTpsO, bUFEr, bUFFP | mensagens |
| Plugin 1558770956236 `AAC` | WF bTpRZ (bTpRa) | desconhecido [DÚVIDA] |
| select2 MultiDropdown | cópias de e-mail | |
| API Connector | — | nenhuma chamada nesta página |

---

## 7. Segurança e privacidade

1. **Dados financeiros públicos.** `ContasReceber`, `ContasPagar`, `Entregas`, `Cobrancas`, `EnderecosCliFor`, `GrupoCliFor`
   têm regra de privacidade `everyone` com `view_all`, `search_for` e `view_attachments` = true, e o app expõe a Data API.
   Qualquer pessoa, **mesmo deslogada**, pode ler todas as comissões, valores, CNPJs e anexos (NF, boletos, recibos).
2. **Página sem guarda.** Não há checagem de departamento/perfil ao carregar; só o link do menu é desabilitado.
3. **Permissões só visuais.** Arquivar/desarquivar sem bloqueio para não-diretores; nenhuma regra impede qualquer logado de
   baixar CRs, gerar recibo, mudar numeração ou enviar e-mails em nome da empresa.
4. **Segredo exposto.** `Opt.Smtp.GmailMegabox` guarda usuário e **senha de app do Gmail em texto puro** num option set
   (option sets vão para o navegador). Revogar essa senha e trocar por segredo de servidor na migração.
   (Relacionado, fora desta página: `tool.Cabecalho` grava senha temporária em `User.PassTexto` e envia por e-mail.)
5. **Arquivos públicos.** Uploads (`ipt anexo nf megabox`), PDFs gerados e imagens (`PictureInput private=False`) ficam com URL
   pública e permanente no CDN do Bubble.
6. **Dados pessoais em tela/PDF:** nome e e-mail do consultor, contatos e e-mails de fornecedores, CNPJs.
7. **Dados bancários da MegaBox** (agência, conta, PIX) fixos no texto — não são segredo, mas devem vir de configuração.
8. **E-mails com cópia oculta** para usuários da config 10 — manter, mas registrar no log de envio.
9. **Operações em massa no navegador** (`ChangeListOfThings`) sem transação: se a aba fechar no meio, parte das CRs fica baixada
   e parte não (daí o aviso "Não feche essa janela").

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Não reproduzir
- WF desativados/vazios e elementos mortos: bTpTH, bTvIt, bTpTw (desativados); bTpjB, bUFEH, bTrSm (vazios); `btn baixar cp` sem WF;
  `pop apagar registro`, `alt processando`, `pop.ConfirmaEntrega A`, `pop.EditaContasReceberNew A` (sem gatilho ativo); clipe de boletos oculto;
  condicional vazia de TableCrossAxis (`cpo_tempcobrarentregas…contains`).
- `pop oculto` com RGs de 1 linha como "variável" de busca; 12 buscas quase iguais copiadas (6 por tipo) — virar **uma** consulta parametrizada.
- Seleção gravada no registro do usuário (`SelecionadosReceber/Pagar`) — vira estado de cliente (ou tabela temporária por sessão, se precisar sobreviver a reload).
- Tabela = seleção `merged_with` busca (duplicidade de lógica e totais inconsistentes).
- Pares de WF espelhados (adicionar/remover, yes/no) e atalhos de filtro duplicados em CR e CP — um componente só.
- Nome de elemento duplicado (`dd filterfinanceiro numcobranca`, `reset filter numcobranca`, `reset filter fornecedor`, `Icon EZ`, `Group DZZZ`).
- Datas mágicas (`Date(1577847600000)`, `1641006000000`, `1704078000000`) e `change_date(31)`.
- Numeração no navegador (`count+1`, config+1) e gravação dupla do contador (bUFHZ1 e bTvTT).
- Parâmetro `arquivado` gravado e não lido; `filialcliente` lido e sem campo na tela; `mailpessoal` apontando para campo excluído.
- Textos fixos: telefones, CNPJ, razão com erro "LOGÍSTIDA", dados bancários, "Rebibo", placeholder "Número cobrança" no filtro de pedido.
- Condicionais de cor copiadas errado (CP comparando "Recebido"/"A receber"; ícones de filtro comparando `cliente`).
- Contagem de vencidos por `valorcomissao:count`.

### 8.2 Otimizações para o banco e a lógica novos
- **Unificar CR e CP** numa tabela `lancamentos_comissao` (`tipo = receber | pagar`) ou manter duas tabelas com a mesma estrutura
  e uma view comum — hoje são 40/41 campos quase idênticos (`tbl_contasreceber` × `tbl_contasreceber1`).
- **Desnormalizações a remover:** `NumeroPedido`, `DataPedido`, `DataEntrega`, `DataPrevEntrega`, `NumNfFornecedor`, `QualCliente`, `QualFornecedor`,
  `QualVendedor`, `QualOrigem`, `QualDestino` são cópias do pedido/entrega/orçamento → vêm por join numa view
  (`vw_contas_receber_lista`). Manter só o que é do lançamento (vencimento, valores, parcela, status, baixa).
- `CobrancaNum` duplica `QualCobranca.NumeroCobranca`; `Cobrancas.QuaisContasReceber` e `CR.QualCobranca`/`QuaisCobrancas` são três
  representações da mesma relação → **uma FK** `cobranca_id` na CR (ou tabela `cobranca_itens` se uma CR puder estar em várias cobranças).
- `QuaisHistoricos` (lista na CR) → `historicos.conta_receber_id` (FK).
- Criar tabela **`recibos`** (número por `sequence`, data, fornecedor, endereço/CNPJ, valor, URL do PDF, usuário) e **`baixas`**
  (data NF/recibo, número, data banco, anexo, usuário, data sistema) ligadas às CRs — hoje a baixa é carimbada campo a campo em cada CR.
- Numeração de cobrança e recibo por **sequence do Postgres** dentro da transação.
- `StatusFinanceiro` → enum ou tabela; "vencida" como coluna calculada/view (`status = 'a_receber' and data_vencimento < current_date`).
- Soma/contagem dos cards via **view/função SQL** (`fn_resumo_financeiro(filtros)`), não no navegador.
- Índices: `(status, data_vencimento)`, `(data_entrega)`, `(data_pedido)`, `(data_nf_megabox)`, `(data_baixa_sistema)`, `(data_recebimento_banco)`,
  `(fornecedor_id)`, `(cliente_id)`, `(vendedor_id)`, `(numero_pedido)`, `(cobranca_id)`, `(arquivado)`; trigram em `num_nf_fornecedor` para o "contém".
- Arquivamento com `arquivado_em`, `arquivado_por`, `motivo`.
- Preferência de período do usuário (`UltimoDateRange`) em `user_preferences` ou só em cookie.
- Dados da empresa (razão, CNPJ, telefones, banco, PIX, logo) numa tabela `empresa`/config — `Opt.EmpresaMegabox` já tem parte disso.
- Valores monetários como `numeric(14,2)`.

---

## 9. Proposta para o app novo

### 9.1 Rotas
- `app/(app)/financeiro/page.tsx` — Server Component; lê `searchParams` com os **mesmos nomes** de hoje (compatibilidade de links e hábito)
  e valida com zod. Defaults no servidor: `dtfiltro=data_entrega`, `receber=yes`, `pagar=no`, período = preferência do usuário ou mês corrente
  (primeiro dia 00:00 até último dia 23:59:59, `America/Sao_Paulo`).
- Middleware/layout checa sessão e permissão de página (tabela `permissoes_pagina` por departamento/perfil/usuário = regra do menu atual).

### 9.2 Componentes
- `FinanceiroToolbar` (checkbox receber/pagar, botões, radio de tipo de data, limpar filtros).
- `FiltrosFinanceiro` (date range, autocompletes de cliente/fornecedor/vendedor, filial fornecedor dependente, inputs de pedido/NF/cobrança, status, arquivados) — tudo escreve na URL (`router.replace`).
- `ResumoCards` (vencidos, listado, selecionado — receber e pagar).
- `TabelaContasReceber`, `TabelaContasPagar` (TanStack Table; seleção em estado de cliente com "selecionar todos da página/filtro"; zebra, sticky header, destaque da data filtrada, vencida em vermelho).
- `DialogBaixaRecebiveis` (modo NF | modo recibo, pré-visualização do recibo, e-mail opcional).
- `DialogEnviarCobranca` (pré-visualização, destinatários, corpo).
- `DialogHistoricosConta` (lista/inclui/edita histórico), `DialogAnexaNfEntrega` (porta do `pop.AnexaNf`), `DialogAgendaContatos`.
- Templates PDF: `CobrancaPdf`, `ReciboPdf` (react-pdf ou HTML → PDF no servidor).

### 9.3 Server actions / rotas de API
| Ação | Regra |
|---|---|
| `baixarContasReceber({ids, numeroNf, dataNf, dataBanco, anexo})` | transação: cria `baixas`, marca CRs `recebido`, `quem_baixou`, `data_baixa_sistema = now()`; valida que todas estão "a receber" e não arquivadas |
| `baixarComRecibo({ids, enderecoFornecedorId, dataRecibo, dataBanco, email?})` | transação: `nextval('seq_recibo')`, cria `recibos` e `baixas`, marca CRs; gera PDF no servidor, grava no Storage privado, registra histórico no grupo fornecedor e atualiza último histórico; se `email`, enfileira envio |
| `enviarCobranca({ids, fornecedorId, filialId, para, cc, corpo})` | valida que as CRs são do fornecedor; `nextval('seq_cobranca')`; cria `cobrancas` + vínculo; gera PDF; enfileira e-mail; cria histórico (e liga às CRs) |
| `arquivarConta(id, motivo?)` / `desarquivarConta(id)` | só perfis autorizados; grava quem/quando |
| `enviarRelatorioComissoesPagar({ids})` | e-mail ao próprio usuário com a lista (corrigir rótulo "Num pedido") |
| `salvarPeriodoPreferido(range)` | preferência do usuário |
| (novo, a confirmar) `baixarContasPagar` / `relatorioContasReceber` | botões existem sem lógica [DÚVIDA] |
- E-mail: fila (`email_outbox`) processada por rota/cron na Vercel ou Edge Function; provedor via segredo de ambiente (Resend/SMTP); contador diário vira `count(*)` do log.

### 9.4 SQL / views
- `vw_contas_receber_lista`: CR + pedido (número, contato), entrega (NF fornecedor, arquivo, boletos, dt emissão), orçamento fornecedor
  (produto, endereços origem/destino), cliente, fornecedor, vendedor, cobrança (número, PDF), baixa/recibo, último histórico (lateral join).
- `vw_contas_pagar_lista`: análoga.
- `fn_contas_receber(filtros jsonb)` / `fn_contas_pagar(filtros jsonb)`: um `CASE` escolhe a coluna de data pelo `dtfiltro`; filtros opcionais com `IS NULL OR`.
- `fn_resumo_financeiro(filtros)`: listado (qtd, soma comissão), vencidos (qtd, soma), respeitando arquivado.
- Sequences `seq_cobranca`, `seq_recibo` (iniciar com os valores atuais: `count(Cobrancas)` e `ConfigSistema[17].ValorNumero`).

### 9.5 Tabelas envolvidas
`contas_receber`, `contas_pagar` (ou `lancamentos_comissao`), `cobrancas` (+ `cobranca_itens` se N:N), `recibos`, `baixas`, `historicos`,
`entregas`, `pedidos`, `orcamentos_fornecedor`, `cotacao_produtos`, `produtos`, `grupos_clifor`, `enderecos_clifor`, `contatos_clifor`,
`usuarios` (perfil, departamento), `config_sistema` (cópias ocultas, controle de e-mail), `empresa`, `email_outbox`, `user_preferences`, `permissoes_pagina`.
RLS: leitura/escrita só para usuários com permissão na página Financeiro; Storage privado com URLs assinadas.

---

## 10. Dúvidas

- [DÚVIDA] Operador de lista nas seleções (WF bTpRI/bTpRN/bTpRP/bTpRU/bTpjg/bTpjn/bTpiM/bTpiT): o mapa mostra "=", presumido add/remove/add-all/clear.
- [DÚVIDA] Ação de plugin 1558770956236 `AAC` no carregamento (bTpRa): o que faz?
- [DÚVIDA] "Limpar filtros" (bTpSc) remove `dtfiltro` e período: a página recarrega (PageLoaded repõe) ou as tabelas ficam vazias?
- [DÚVIDA] Quais status as CPs usam ("A pagar"/"Pago" ou "Recebido")? As condicionais da tabela CP usam os status de CR.
- [DÚVIDA] Onde as contas a pagar são baixadas hoje? O botão "Baixar Contas a Pagar" não tem workflow.
- [DÚVIDA] "Relatório contas a receber" deveria fazer o quê (WF bUFEH vazio)?
- [DÚVIDA] "Valor total em vendas" da cobrança (mediana por entrega) — exibe lista; qual é o número esperado: soma das vendas distintas por entrega?
- [DÚVIDA] Config `CodigoConfig = 10` (bcc): qual é o nome/propósito? Deve continuar?
- [DÚVIDA] A cobrança grava `QualFornecedor` do filtro "Grupo Fornecedor", mas o botão só exige a filial. Deve derivar o grupo da filial?
- [DÚVIDA] Na baixa com NF a seleção não é esvaziada (no recibo é). Intencional?
- [DÚVIDA] Período "Todo histórico" começa em 01/01/2024 e o clique em vencidos em 01/01/2022, enquanto o card conta desde 01/01/2020. Qual início vale?
- [DÚVIDA] Arquivar deve ser restrito a gerentes/diretores (ícone cinza sugere isso) e pedir motivo (`Opt.MotivoArquivamento`)?
- [DÚVIDA] Parâmetro `filialcliente` é usado por algum link externo? Não há campo na tela.
- [DÚVIDA] Conteúdo dos HTML C (12.706 caracteres, recibo) e HTML D (961, cobrança) não está no mapa — conferir no editor o que mostram na coluna Qtd/Produto.
- [DÚVIDA] O recibo deve continuar com o valor = soma das comissões (não da venda)? E a razão social correta é "Mega Box Logística Ltda" (`Opt.EmpresaMegabox`).

---

## 11. Cobertura — todos os 76 workflows

| id | Evento / elemento | O que faz | Seção |
|---|---|---|---|
| bTpRI | Clique `Icon B` (linha CR) | adiciona CR à seleção se não estiver | 4.2 |
| bTpRN | Clique `Icon B` (linha CR) | remove CR da seleção se estiver | 4.2 |
| bTpRP | Clique `Icon D` (cabeçalho CR) | marca todas as CRs da tabela | 4.2 |
| bTpRU | Clique `Icon C` (cabeçalho CR) | desmarca todas as CRs da tabela | 4.2 |
| bTpRZ | PageLoaded | plugin desconhecido + defaults de período, dtfiltro, receber, pagar | 4.1 |
| bTpRh | Clique `btn baixar cr` | abre popup de baixa | 4.4 |
| bTpRm | Muda `dd filterfinanceiro fornecedor` | grava `fornecedor` na URL | 4.1 |
| bTpRr | Muda `dd filterfinanceiro status` | grava `statusfinanceiro` na URL | 4.1 |
| bTpRt | Muda `dd filterfinanceiro status` (vazio, sem cliente/fornecedor) | volta período ao mês corrente | 4.1 |
| bTpRy | Date range aplicado | salva `UltimoDateRange` e grava período na URL | 4.1 |
| bTpSE | Clique `btn periodointegral` | período 01/01/2024 → hoje | 4.1 |
| bTpSJ | Muda `RadioButtons A` | reseta tabelas e grava `dtfiltro` | 4.1 |
| bTpSL | Clique `reset filter cliente` | limpa filtro cliente | 4.1 |
| bTpSR | Muda `dd filterfinanceiro CLIENTE` | grava `cliente` na URL | 4.1 |
| bTpSW | Clique `reset filter fornecedor` (grupo) | limpa filtro fornecedor | 4.1 |
| bTpSc | Clique `Button limparfiltros` | esvazia seleções, reseta filtros, URL só com receber/pagar | 4.1 |
| bTpSj | Clique `reset filter numcobranca` (nº cobrança) | limpa `numcobranca` | 4.1 |
| bTpSp | Muda `dd filterfinanceiro numcobranca` (nº cobrança) | grava `numcobranca` | 4.1 |
| bTpSu | Clique `btn enviar cobranca` | abre popup de cobrança | 4.3 |
| bTpSz | Muda `dd filterfinanceiro vendedor` | grava `vendedor` | 4.1 |
| bTpTB | Clique `reset filter vendedor` | limpa `vendedor` | 4.1 |
| bTpTH | Clique `bt edita contas receber` (desativado) | abria `pop.EditaContasReceberNew` com a entrega | 4.10, 8.1 |
| bTpTN | Muda `dd filterfinanceiro NFfornecedor` | grava `fornecedornf` | 4.1 |
| bTpTS | Muda `dd filterfinanceiro numcobranca` (NF MegaBox) | grava `megaboxnf` | 4.1 |
| bTpTX | Clique `reset filter nf fornecedor` | limpa `fornecedornf` | 4.1 |
| bTpTd | Clique `reset filter nf megabox` | limpa `megaboxnf` | 4.1 |
| bTpTj | Clique `open nf fornecedor` (CR) | abre arquivo NF do fornecedor | 4.10 |
| bTpTl | Muda `dd filterfinanceiro numpedido` | grava `numpedido` | 4.1 |
| bTpTq | Clique `reset filter numcobranca` (nº pedido) | limpa `numpedido` | 4.1 |
| bTpTw | Clique `open boletos` (CR, desativado) | abria até 4 boletos | 4.10, 8.1 |
| bTpUH | Clique `Button H` "Enviar" (cobrança) | mostra aviso e gera PDF da cobrança | 4.3 |
| bTpUO | Clique `Icon U` | fecha popup de cobrança | 4.3 |
| bTpUT | Clique `Icon V` | abre agenda de contatos do grupo da filial | 4.3 |
| bTpUZ | PDF da cobrança pronto | cria cobrança, vincula CRs, limpa seleção, agenda e-mail, cria histórico | 4.3, 6 |
| bTpUs | Clique `Group D` (pílula histórico CR) | alterna texto e abre popup de históricos | 4.9 |
| bTpUx | Clique `open cobranca pdf` | abre PDF/arquivo da cobrança | 4.10 |
| bTpVD | Clique `gp card vencidos` | aplica filtro de vencidos na URL | 4.1 |
| bTpVF | Clique `filtrar fornecedor` (CR) | filtra pelo fornecedor da linha | 4.1 |
| bTpVK | Clique `filtrar cliente` (CR) | filtra pelo cliente da linha | 4.1 |
| bTpVP | Clique `Button I` "Baixar Contas" (sem recibo) | baixa CRs com NF MegaBox | 4.4 |
| bTpVX | Clique `open nf recebimento` | abre NF/recibo MegaBox | 4.10 |
| bTpVc | Clique `txt msgem` (CR) | abre popup de históricos | 4.9 |
| bTpiM | Clique `Icon EZ` (cabeçalho CP) | marca todas as CPs | 4.2 |
| bTpiT | Clique `Icon EZ` (cabeçalho CP) | desmarca todas as CPs | 4.2 |
| bTpid | Clique `filtrar cliente` (CP) | filtra pelo cliente da linha | 4.1 |
| bTpik | Clique `filtrar fornecedor` (CP) | filtra pelo fornecedor da linha | 4.1 |
| bTpir | Clique `open nf fornecedor` (CP) | abre arquivo NF do fornecedor | 4.10 |
| bTpjB | Clique `open boletos` (CP) | vazio (sem ações) | 4.10, 8.1 |
| bTpjO | Clique `Group DZZZ` (pílula histórico CP) | alterna texto do último histórico | 4.9 |
| bTpjg | Clique `Icon EZ` (linha CP) | adiciona CP à seleção | 4.2 |
| bTpjn | Clique `Icon EZ` (linha CP) | remove CP da seleção | 4.2 |
| bTpjx | Clique `bt edita contas pagar` | abre `historico` do pedido em nova aba | 4.10 |
| bTplx | Toggle `chk receber` (yes) | muda `receber` para no | 4.1 |
| bTpmH | Toggle `chk receber` (no) | muda `receber` para yes | 4.1 |
| bTpmO | Toggle `chk pagar` (yes) | muda `pagar` para no | 4.1 |
| bTpmV | Toggle `chk pagar` (no) | muda `pagar` para yes | 4.1 |
| bTpqR | Clique `filtrar vendedor` (CR) | filtra pelo vendedor da linha | 4.1 |
| bTpqh | Clique `filtrar pedido` (CR) | filtra pelo pedido da linha | 4.1 |
| bTpqu | Clique `filtrar vendedor` (CP) | filtra pelo vendedor da linha | 4.1 |
| bTprH | Clique `filtrar pedido` (CP) | filtra pelo pedido da linha | 4.1 |
| bTpsH | Clique `btn relatorio cp` | e-mail ao usuário com CPs selecionadas, toast, limpa seleção | 4.7, 6 |
| bTrMB | Clique `Icon N` | fecha e reseta popup de baixa | 4.4 |
| bTrMV | Toggle `tgg gerar recibo` | reseta número e toggle de e-mail | 4.5 |
| bTrNb | Clique `Icon IZ` | abre agenda de contatos do grupo do CNPJ do recibo | 4.5 |
| bTrNj | PDF do recibo pronto | anexa PDF, limpa seleção, e-mail opcional, histórico, contador, fecha | 4.5, 6 |
| bTrPJ | Clique `Button I` "Baixar Contas" (com recibo) | baixa CRs, grava contador, gera PDF do recibo | 4.5 |
| bTrSm | SEM_TIPO | workflow sem evento e sem ações | 8.1 |
| bTsMh | Clique `abri pedido` | abre `vendas` filtrada no pedido em nova aba | 4.10 |
| bTvIN | Clique `bt edita contas receber` | abre `historico` do pedido em nova aba | 4.10 |
| bTvIt | Clique `bt edita contas pagar` (desativado) | abria `pop.EditaContasReceberNew` | 4.10, 8.1 |
| bUFDT | Clique `btn arquivar` | arquiva CR + toast | 4.8 |
| bUFEH | Clique `btn relatorio cr` | vazio (sem ações) | 4.7, 8.1 |
| bUFEf | Muda `dd arquivados` | grava `arquivado` na URL (não lido) | 4.1, 3.1 |
| bUFFD | Clique `btn desarquivar` | desarquiva CR + toast | 4.8 |
| bTpVi | Muda `dd filterfinanceiro filialfornecedor` | grava `filialfornecedor` | 4.1 |
| bTpVn | Clique `reset filter fornecedor` (filial) | limpa `filialfornecedor` | 4.1 |
