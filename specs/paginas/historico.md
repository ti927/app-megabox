# Spec funcional — módulo Histórico (página `historico` + painel `tool.Historico`)

Fonte:
- `mapa/pagina-historico.md` — página `historico` (`bTsPV`): 281 elementos · 58 workflows · 98 ações · 94 condicionais · 1 popup · 7 RGs · 6 estados customizados.
- `mapa/reusable-tool.Historico.md` — reusable `tool.Historico` (`bTdrv`): 262 elementos · 38 workflows · 61 ações · 73 condicionais · 6 tabelas (o inventário conta "RG"; no mapa são elementos `Table`) · 3 estados customizados.
- `mapa/pagina-historico_full.md` — página `historico_full` (`bUEUx`): 1 elemento · 0 workflows · 0 ações · 0 condicionais.

Apoio: `mapa/data-types.md` (`Tbl.Historico`, `Tbl.GrupoCliFor`, `Tbl.ContatoCliFor`, `Tbl.Cotacao`, `Tbl.Pedido`,
`Tbl.OrcFornecedoresCotacao`, `Tbl.Entregas`, `Tbl.ContasReceber`, `Tbl.ContasPagar`, `User`), `mapa/option-sets.md`
(`opt.TipoCliFor`, `Opt.PerfilUsuario`, `Opt.DeptoUsuario`, `Opt.StatusFinanceiro`, `Opt.Etapas`, `Opt.TiposData`, `Opt.MenuConfig`, `Opt.UFs`),
`mapa/backend-workflows.md` (`CalculaFornecedoresLista` bTPFh, `CalcularValoresListaEntregas` bTtln, `EnviarEmailsGeral` bTnvb0),
`mapa/integracoes.md`, `mapa/reusable-tool.Cabecalho.md`, `mapa/reusable-tool.MenuConfig.md`,
`mapa/reusable-pop.HistoricosContaReceber.md`, `mapa/reusable-pop.HistoricoConversas.md`, `mapa/reusable-pop.CadastroCliFor.md`.

**Se esta spec e o mapa discordarem, o mapa manda.**

---

## Aviso de leitura: "histórico" são duas coisas diferentes

O nome engana. São dois módulos sem nenhum código nem dado em comum:

| | Página `historico` | Reusable `tool.Historico` |
|---|---|---|
| Nome real na interface | **"FollowUp de Pedidos"** (`Opt.MenuConfig.FollowUp de Pedidos`, WF bTvIg do `tool.MenuConfig`) | "Histórico" / "Emails" (painel lateral) |
| O que mostra | a **árvore de um pedido**: cotação → pedido → orçamentos de fornecedor → entregas → contas a receber / a pagar | a **linha do tempo de interações** com um cliente/fornecedor (`Tbl.Historico`) e um disparador de e-mail de prospecção |
| Tabela principal | `Tbl.Cotacao` e descendentes | `Tbl.Historico` + `Tbl.GrupoCliFor` |
| Grava em `Tbl.Historico`? | **não**. O botão "Grava histórico" ali significa "grava em cascata no histórico do pedido", isto é, propaga o valor para os registros filhos | **sim**, é o único lugar deste módulo que cria/edita/apaga `Tbl.Historico` |
| Usa o reusable? | **não** (`tool.Historico` não é instanciado em `pagina-historico.md`) | — |

A "linha do tempo do cliente" de verdade é o reusable. A página é um editor de registros do pedido.

Glossário:
- **Árvore do pedido** = cotação → pedido → orçamento de fornecedor → entrega → CR/CP.
- **CR** = `Tbl.ContasReceber` (`tbl_contasreceber`), comissão a receber do fornecedor. **CP** = `Tbl.ContasPagar` (`tbl_contasreceber1`), comissão a pagar ao vendedor.
- **Interação** = registro de `Tbl.Historico` (descrição livre + cliente + vendedor + unidade).
- **Carteira** = `GrupoCliFor.QualCarteira` (`user`), o vendedor dono do cliente.

---

## 1. Propósito e quem usa

### 1.1 Página `historico` ("FollowUp de Pedidos")
Abre **um pedido inteiro** pelo número e permite **corrigir qualquer registro da árvore no lugar**, sem passar pelos fluxos
de `vendas` e `financeiro`. É a ferramenta de conserto: quando uma venda foi lançada com vendedor errado, quantidade errada,
valor errado ou NF errada, é aqui que se acerta — inclusive em cascata para baixo.

Quem usa: Diretoria e Financeiro. Chega-se nela por três caminhos, nenhum deles no menu principal:
1. `tool.MenuConfig` → item **"FollowUp de Pedidos"** (WF bTvIg → ação bTvIr abre `historico` em nova aba, **sem parâmetro**).
2. `financeiro`, ícone de lápis na linha da CR (WF bTvIN → ação bTvIV) ou da CP (WF bTpjx → ação bTvJE): abre
   `historico?numpedido={NumeroPedido}` em nova aba.
3. URL digitada.

### 1.2 Reusable `tool.Historico` (painel lateral)
Registro e consulta de **interações comerciais com o cliente/fornecedor** ("liguei", "mandei proposta", "sem retorno"),
mais um disparador de **e-mail de prospecção** com 7 modelos prontos. É a agenda do vendedor: mostra há quantos dias
cada cliente da carteira não recebe contato e destaca os que passaram do prazo.

Quem usa: vendedores (a própria carteira) e gestão (qualquer carteira).

### 1.3 Página `historico_full`
**Não é casca vazia** — confirmado: contém exatamente 1 elemento, `tool.Historico A` (`bUEUz`), que instancia o reusable
ancorado no topo, em tela cheia, sem nenhum workflow próprio. É a versão "maximizada" do painel lateral, alcançada pelo
botão "Histórico ↗" (`Button A` bUEUr, WF bUEiY0) que só aparece quando a página hospedeira é `vendas`.
Registro: página de 1 elemento é **intencional**, não resto de refatoração.

### 1.4 Controle de acesso de fato (só no navegador)

**Página `historico`:**
- **Não há verificação nenhuma no carregamento.** O WF de PageLoaded (bTsoB) só normaliza parâmetros de URL. Quem digitar
  `/historico?numpedido=123` entra, logado ou não. Não há redirecionamento de deslogado (isso só existe no `tool.Cabecalho`,
  WF bTKRG, que desloga usuário com `Ativo = false`).
- A página **não está em `Opt.MenuPaginas`** — não tem hierarquia nem departamentos declarados.
- O único filtro é o item de menu: `Opt.MenuConfig.FollowUp de Pedidos` declara `opt_hierarquia = 2`, mas quem habilita o
  item é a linha de `Tbl.ConfigSistema` com `QualMenuConfig = FollowUp de Pedidos`, via `QuaisDeptos` / `QuaisPerfis` /
  `QuaisUsuarios` (condicionais de bTghF no `tool.MenuConfig`). Isso desabilita o **texto do menu**, não a página.
- Dentro da página não há nenhuma restrição por perfil: **qualquer um que chegue à URL pode destravar e regravar cotação,
  pedido, orçamento, entrega, CR e CP, e apagar CR e CP.** Os únicos elementos condicionados são os ícones de copiar id
  (`copy id entrega` bUBid, `copy id receber` bUBiw e o par na CP), visíveis só para `CurrentUser.IsDev = true`.

**Reusable `tool.Historico`:**
- Visibilidade: o hospedeiro mostra/esconde o painel pela condição `cabecalho.var_showhistorico_` (ver §2.4). Nada mais.
- `rad tipoclifor` (bTjmf) e `dd vendedor` (bTeEO) ficam **desabilitados quando `CurrentUser.QualPerfil.hierarquia > 2`**
  (Analista = 3, Operador = 4). Na prática: Diretor e Gerente escolhem qualquer carteira e veem fornecedores; Analista e
  Operador ficam presos à própria carteira (`dd vendedor` tem `default = CurrentUser` quando o tipo é Cliente) e a clientes.
  É desabilitação visual: os dados de todas as carteiras continuam legíveis pela Data API.
- Editar e apagar uma interação: os ícones `btn edita historico por cliente`, `btn edita historico individual` e
  `btn edita historico individual copy` ficam **desabilitados quando `Historico.Created By ≠ CurrentUser`**. Ou seja,
  cada um só mexe no que escreveu — mas de novo só na interface (`button_disabled`), sem regra no banco.
- A aba **"Emails"** (`Group Email`) não tem nenhuma restrição: qualquer usuário do painel dispara e-mail em nome da
  MegaBox para qualquer contato de qualquer cliente.

---

## 2. Estrutura da tela

### 2.1 Página `historico` — layout (de cima para baixo)
1. `reus cabecalho A` (bTsnF) — USA `tool.Cabecalho`.
2. `tool.DashMenu A` (bTsnJ) — USA `tool.MenuPaginas`, visível quando `cabecalho.var_showmenu_ = true`.
3. `alt processando` (bTsnR) — Alert "Aguarde, gravando registros. Não feche essa janela!". **Nenhum workflow o aciona** (morto).
4. `gp filtros financeiro` (bTsSD) — FloatingGroup com a barra de filtros (§2.2). Cópia literal da barra de `financeiro`.
5. `gp elmentos aplicativo` (bTscq) — a árvore, em 5 níveis aninhados de RepeatingGroup:

| Nível | RG | Fonte | Cartão | Expansão |
|---|---|---|---|---|
| 1 | `rpg cotacao` (bTsvH0) | `Search(Tbl.Cotacao: Arquivado = false AND CotacaoNum = UrlParam("numpedido" as number))` | `gp card cotacao` | clique no cartão alterna `rpg pedidos` (WF bTtMT0) |
| 2 | `rpg pedidos` (bTsvZ0) | `Cotacao.QualPedido:convert_to_list` | `gp card pedido` | clique alterna `rpg orcamentos` (WF bTtMe0) |
| 3 | `rpg orcamentos` (bTszK0) | `Pedido.QuaisOrcamentosFonecedores` | `gp card orcamentos` | clique alterna `rpg entregas` (WF bTtMp0) |
| 4 | `rpg entregas` (bTtBV0) | `OrcFornecedor.QuaisEntregas:filtered(NumNfFornecedor = El[dd filterfinanceiro NFfornecedor], ignore_empty)` | `gp card entregas` | clique alterna `rpg areceber` **e** `rpg apagar` juntos (WF bTtMx0) |
| 5a | `rpg areceber` (bTtIb0) | `Entrega.QuaisContasReceber` | `gp card areceber` | — |
| 5b | `rpg apagar` (bTtLP0) | `Entrega.QuaisContasPagar` | `gp card a pagar` | — |
| — | `RepeatingGroup A` (bUCed0) | `Cotacao.QuaisPropostas` | lista "Proposta {n}" dentro do cartão da cotação | — |

Cada nível tem um ícone-guia à esquerda que aparece/some junto com o RG filho (`bootstrap cart-fill` pedidos,
`bootstrap box-fill` orçamentos, `fa fa-truck` entregas, `bootstrap coin` a receber, `Icon H` a pagar) e cada RG some
sozinho quando `This:get_list_data:count < 1`.

6. `pop add areceber na entrega` (bUBjf) — único popup (§2.3).

### 2.2 Barra de filtros da página (`gp filtros financeiro`)

| Rótulo | Elemento | Tipo | Parâmetro URL | Filtra alguma coisa? |
|---|---|---|---|---|
| Intervalo de data | `dtr filterfinanceiro data` (bTsQR, plugin 1648823245313, pt-BR, DD/MM/YY) | período | `datainicio`, `datafim` | **não** |
| (ícone) Todo histórico | `btn periodointegral` (bTsQN) | ícone | `datainicio`, `datafim` | **não** |
| Núm pedido | `dd filterfinanceiro numpedido` (bTsRn) — placeholder errado "Número cobrança" | inteiro | `numpedido` | **sim** — é o único filtro real |
| Cliente | `dd filterfinanceiro CLIENTE` (bTsQZ) | autocomplete `GrupoCliFor` tipo Cliente | `cliente` | **não** |
| Grupo Fornecedor | `dd filterfinanceiro fornecedor` (bTsQk) | autocomplete `GrupoCliFor` tipo Fornecedor e Ativo | `fornecedor` | **não** |
| Filial Fornecedor | `dd filterfinanceiro filialfornecedor` (bTsRy) | dropdown — endereços do fornecedor escolhido | `filialfornecedor` | **não** |
| Vendedor | `dd filterfinanceiro vendedor` (bTsQv) | autocomplete `User` ativos | `vendedor` | **não** |
| Num NF Fornecedor | `dd filterfinanceiro NFfornecedor` (bTsRD) | texto | `fornecedornf` | **sim** — filtra `rpg entregas` |
| Num NF Megabox | `dd filterfinanceiro numcobranca` (bTsRO) | texto | `megaboxnf` | **não** |
| Núm cobrança | `dd filterfinanceiro numcobranca` (bTsRZ) — nome duplicado | inteiro | `numcobranca` | **não** |
| Status recebimento | `dd filterfinanceiro status` (bTsRg) | dropdown `Opt.StatusFinanceiro` | `statusfinanceiro` | **não** |

Cada filtro tem um ícone "limpar" que fica colorido quando preenchido. Vários ícones repetem nome
(`reset filter numcobranca` em três grupos, `reset filter fornecedor` em dois).

### 2.3 Popups e reusables da página
| Elemento | Tipo | Uso |
|---|---|---|
| `pop add areceber na entrega` (bUBjf) | Popup (`Tbl.Entregas`) | "Indique o Codigo ID da conta a receber que deseja adicionar à entrega". Abre pelo ícone `Icon N` (fa-dollar) do cartão da entrega (WF bUBkp) e amarra uma CR existente à entrega pelo id colado (WF bUBkV). Ferramenta de conserto manual. |
| `reus cabecalho A` (bTsnF) | `tool.Cabecalho` | cabeçalho + estados `var_showmenu_` / `var_showhistorico_` |
| `tool.DashMenu A` (bTsnJ) | `tool.MenuPaginas` | menu lateral |
| `alt processando` (bTsnR) | Alert | **morto** |

A página **não** instancia `tool.Historico`, embora `var_showhistorico_` exista no cabeçalho.

### 2.4 Estrutura do reusable `tool.Historico`

Contrato de entrada: **nenhum**. O hospedeiro não passa dado nenhum — instancia o elemento e apenas controla a
visibilidade pela condicional `El[reus cabecalho A]:custom.var_showhistorico_` (vendas bTeAe, financeiro bTpQl,
cadastros bUCbT0; em `historico_full` bUEUz está sempre visível). O painel se vira sozinho: descobre o usuário por
`CurrentUser`, define a carteira por `default = CurrentUser` e busca tudo por conta própria. **Não existe "cliente em
foco" herdado do hospedeiro** — se o usuário está olhando um pedido em `vendas`, o painel não sabe disso.

Estados customizados: `var_tabhistorico_` (number, aba do bloco Histórico), `var_modeloemail_` (text, modelo de e-mail
escolhido), `id_clifor_` (`Tbl.GrupoCliFor`, cliente selecionado para o e-mail).

Dois blocos alternados por `Group ZZ` (bUEhj0), que fica **invisível quando a página é `vendas`**:
- `Button B` "Histórico" (WF bUEgZ0) e `Button Email` "Emails" (WF bUEgm0) — cada um alterna os dois grupos.
- `Button E` " Voltar para vendas" (WF bUEhb0) → página `vendas`.

**Bloco Histórico** (`Group Historico` bUEgC0):
- `Button A` "Histórico ↗" (bUEUr, WF bUEiY0) → abre `historico_full`. Visível **só** quando a página é `vendas`.
- `rad tipoclifor` (bTjmf): Cliente | Fornecedor (default Cliente).
- `dd vendedor` (bTeEO): carteira. `Search(User; sort NomeModelo)` — **sem filtro de ativo**.
- Três abas (`var_tabhistorico_`):

| Aba | Rótulo | Tabela | Fonte |
|---|---|---|---|
| 1 | "Por {tipo}" (`Text D`, WF bTdzv) | `rpg clientes historico` (bTdrx) | `GrupoCliFor: QualCarteira = dd vendedor AND NomeCliFor = busca AND Ativo = true` (ignore empty); para Fornecedor troca para `NomeCliFor = busca AND QualTipoCliFor = Fornecedor` |
| 2 | "Individual" (`Text E`, WF bTeAF) | `rpg historico` (bTdyZ) | `Historico: QualVendedor = dd vendedor AND QualCliente = busca; sort Created Date desc` |
| 3 | "Sem interação (n)" (`Text C`, WF bTjCf) | `rpg clientes sem interação` (bTjIH) | `GrupoCliFor: QualCarteira = dd vendedor AND UltimoHistoricoData ≤ hoje-15d AND NomeCliFor = busca; sort NomeCliFor` |

  Nas abas 1 e 3 cada linha é um cliente que expande a sua própria tabela `rpg historico` (bTdtp / bTjIr) com
  `Historico: QualCliente = cliente; sort Created Date desc`. A aba 3 fica desabilitada quando o tipo é Fornecedor.

**Bloco Emails** (`Group Email` bUEVd, oculto ao carregar):
- Filtros: `dd carteira 2 copy` (bUEhz0, `User: IsDev = false`), `Checkbox cliente sem carteira` (bUEXO0),
  `Dropdown G` de UF (bUEYX0, dentro de `Group MZ` **oculto ao carregar e sem condicional que o mostre** — morto),
  `check ultimos 3 meses` (bUEYh0) e `RadioButtons B` (bUEYz0) com "- / 15d / 30d / +1m".
- `rpg clientes historico` (bUEaU0) — tabela de clientes com foto, nome, "Último Histórico: n dias", "Na carteira de: …",
  dropdown `Dropdown H` de e-mail padrão e o ícone `icon email` (bUEij0).
- Painel de composição: `ipt qual email` (bUEiR0), 7 cartões de modelo (`var_modeloemail_` 1 a 7: Modelo Padrão, Chapatex,
  Palete de Plástico, Porta Palete, Logística Reversa, Palete de Metal, Resgate), `ipt assunto` (bUEeu0), `ipt email`
  (bUEfG0, corpo) e `Button D` "Enviar email" (bUEfL0).

### 2.5 Parâmetros de URL (página `historico`)
| Parâmetro | Escrito por | Lido por | Efeito |
|---|---|---|---|
| `numpedido` | WF bTsqX / bTsqc | `rpg cotacao` (bTsvH0) e `dd filterfinanceiro numpedido` | **abre a árvore** |
| `fornecedornf` | WF bTspz / bTsqJ | `dd filterfinanceiro NFfornecedor` → filtro de `rpg entregas` | filtra entregas por NF |
| `datainicio` / `datafim` | WF bTsoB (2,3), bTsof, bTsol | só o próprio date picker | nenhum |
| `dtfiltro` | WF bTsoB (4) | nada | nenhum |
| `receber` / `pagar` | WF bTsoB (5,6) | nada | nenhum |
| `cliente`, `fornecedor`, `filialfornecedor`, `vendedor`, `megaboxnf`, `numcobranca`, `statusfinanceiro` | WFs de filtro | só o default do próprio campo | nenhum |

### 2.6 Estados customizados da página
`var_editacotacao_` (`Tbl.Cotacao`), `var_editapedido_` (`Tbl.Pedido`), `var_editaorcamento_` (`Tbl.OrcFornecedoresCotacao`),
`var_editaentrega_` (`Tbl.Entregas`), `var_editareceber_` (`Tbl.ContasReceber`), `var_editaapagar_` (`Tbl.ContasPagar`).
Cada um guarda **o registro atualmente destravado** daquele nível. Todos os campos do cartão nascem `disabled=True` e
só liberam quando `El[Página historico]:custom.var_edita*_:equals(Parent)` — isto é, um registro por nível por vez.

---

## 3. Dados

### 3.1 O que a página `historico` busca
- **Uma busca só**: `rpg cotacao` (bTsvH0) faz `Search(Tbl.Cotacao: Arquivado = false AND CotacaoNum = UrlParam("numpedido" as number))`.
  Tudo o mais desce por lista de campo (`QualPedido`, `QuaisOrcamentosFonecedores`, `QuaisEntregas`, `QuaisContasReceber`,
  `QuaisContasPagar`, `QuaisPropostas`), sem nova busca.
- Atenção: o parâmetro chama-se `numpedido` mas casa com `Cotacao.CotacaoNum` (number), enquanto quem manda o parâmetro
  (`financeiro`) envia `ContasReceber.NumeroPedido` (text). Ver [DÚVIDA 1].
- Buscas auxiliares de preenchimento de dropdown: `User: Ativo = true` (vendedor da cotação, da entrega, da CR, da CP e o
  substituto — 5 cópias da mesma busca), `EnderecosCliFor: Ativo = true AND TipoClifor = Fornecedor` (origem),
  `EnderecosCliFor: Ativo = true AND TipoClifor = Cliente` (destino), `GrupoCliFor` por tipo (filtros),
  `ContasReceber: _id = {id colado}` (popup de amarração).

### 3.2 O que o cartão de cada nível mostra e edita
| Nível | Campos editáveis no cartão | Somente leitura |
|---|---|---|
| Cotação | `QualVendedor` (`dd vendedor cotacao`) | data de criação, nome do cliente, nº da cotação, `CotacaoStatus`, `_id` no tooltip, propostas |
| Pedido | `PrazoRecebComissoes` (`dd parcelas pedido`), `FormaPagto` (`dd formapagto pedido`) | nº do pedido, data, `MotivoCancelamento` (só quando `QualEtapa = Cancelado`), `_id` |
| Orçamento fornecedor | `QtdVenda`, `ValorVendaUnit`, `ValorComissaoUnit`, `TipoFrete`, `ValorFrete`, alíquota ICMS, alíquota PIS, `QualEnderecoOrigem`, `QualEnderecoDestino` | produto, "Total tributos" (`ValorPISCOFINS + ValorICMS`), `_id` do produto |
| Entrega | `QualVendedor`, `QualVendedorSubstituto`, `QtdEntrega`, `ValorVendaBrutoUnitario`, `ValorComissaoUnitario`, `DtPrevEntrega`, `DtEntrega`, `DtEmissaoNf`, `NumNfFornecedor`, `ArquivoNfFornecedor`, `StatusEntrega` (`Opt.Etapas`) | "Valor comiss receber" (`ValorComissaoBruto`), `_id` (só IsDev) |
| CR | `QualVendedor`, `DataVencimento`, `ValorComissaoUnitario`, `DataRecebimentoBancocaixa`, `DataNfMegabox`, `NumNfMegabox`, `AnexoNfMegabox`, `StatusFinanceiro`, `NumNfFornecedor` | "Valor venda total", "Valor comiss receber", `_id` (só IsDev) |
| CP | os mesmos da CR; `StatusFinanceiro` restrito a `Opt.StatusFinanceiro` **menos** "A receber" e "Recebido" | idem |

### 3.3 O que entra na linha do tempo do cliente (`Tbl.Historico`)
`Tbl.Historico` (`tbl_historico`) tem **7 campos** e nenhum tipo de evento:
`Descricao` (text), `QualClifor` (`custom.tbl_clientes`, id `cpo_qualcliente_custom_tbl_clientes` — os workflows chamam de
`QualCliente`), `QualVendedor` (user), `QualUnidade` (`tbl_enderecosclifor`), `QualDepto` (`Opt.DeptoUsuario`),
`AnexoFile` (file), `AnexoLink` (text). Autor e data vêm dos campos nativos `Created By` / `Created Date` / `Modified Date`.

A linha do tempo é, portanto, **uma lista de textos livres**. Quem a alimenta hoje, em todo o app:

| Origem | Como | Automático? | Texto |
|---|---|---|---|
| `tool.Historico` aba "Por cliente" (WF bTdwD) | `NewThing` bTdwJ | manual | digitado pelo usuário |
| `tool.Historico` aba "Individual" (WF bTdzL) | `NewThing` bTdzR | manual | digitado |
| `tool.Historico` aba "Sem interação" (WF bTjKZ) | `NewThing` bTjKe | manual | digitado |
| `tool.Historico` aba Emails (WF bUEgz0) | `NewThing` bUEjC0 | automático ao enviar | o corpo inteiro do e-mail |
| `financeiro` — envio de cobrança (WF bTpUZ) | `NewThing` bTpUl | automático | "Enviado email de cobrança número {n} contendo relatório anexo de contas a receber" + `AnexoLink` do PDF |
| `financeiro` — recibo (WF bTrNj) | `NewThing` bTrNz | automático | "Enviado email de recibo número {n} contendo lista de contas recebidas" + PDF |
| `pop.HistoricosContaReceber` | `NewThing` bTmBp (+ bTmCr no fornecedor, opcional) | manual | digitado; grava `QualDepto` e amarra a unidade de destino/origem |
| `vendas` — proposta enviada (bTjCC) | `NewThing` | automático | "Proposta número {cot}/{prop} enviada ao cliente no email {…}" |
| `vendas` — pedido enviado (bTjBw) | `NewThing` | automático | "Pedido número {n} enviado ao cliente no email {…}" |
| `vendas` — e-mail de pós-venda (bUEoF) | `NewThing` | automático | corpo fixo do e-mail de encerramento |
| `pop.AddEditaEndereço` (bUCVe) | `NewThing` | automático | "Cliente criado/Endereço adicionado" |
| `pop.CadastroCliFor` (bTjNx) e `pop.HistoricoConversas` (bTxvq) | `NewThing` | manual | digitado |

Quem **lê** a linha do tempo: `tool.Historico` (3 tabelas), `pop.CadastroCliFor` (`Table B`), `pop.HistoricoConversas`,
`tool.Cabecalho` (`Table H`), `pagina-cadastros` (contagem e data do último), `financeiro` (via `CR.QuaisHistoricos`).

**Campo espelho:** `GrupoCliFor.UltimoHistoricoData` (date) e `GrupoCliFor.UltimoHistoricoMsg` (ponteiro para o último
`Tbl.Historico`) são mantidos à mão por cada um desses workflows — é deles que saem "Último Histórico: n dias",
a aba "Sem interação", os filtros 15d/30d/3 meses e o sino de alerta do cabeçalho
(`GrupoCliFor: QualCarteira = CurrentUser AND UltimoHistoricoData ≤ hoje-15d`, condicional do `tool.Cabecalho`).
`pagina-rotinas` tem duas rotinas de recálculo em massa (bTjME, bTjMv) justamente porque esse espelho sai do ar.

---

## 4. Funcionalidades e regras de negócio

## PÁGINA `historico`

### 4.1 Carregamento (WF bTsoB — PageLoaded)
1. `Plugin[1558770956236]/AAC` (bTsoF) — ação de plugin não identificada, a mesma que `financeiro` executa no load [DÚVIDA 2].
2. (bTsoG) **SÓ SE** `datainicio` e `datafim` vazios **e** `CurrentUser.UltimoDateRange` preenchido → grava na URL o
   período salvo do usuário (`min`, `max`).
3. (bTsoH) **SÓ SE** (`datainicio` e `datafim` vazios) **ou** `UltimoDateRange` vazio → grava dia 1 00:00:00 até
   dia 31 23:59:59 do mês corrente. A condição usa `or_`, então com período já na URL e `UltimoDateRange` vazio esta ação
   **sobrescreve** a URL; e `change_date(31)` transborda em meses curtos (30/abr vira 01/mai).
4. (bTsoL) **SÓ SE** `dtfiltro` vazio → grava `dtfiltro = "Data entrega"`.
5. (bTsoM) **SÓ SE** `receber` vazio → grava `receber = yes`.
6. (bTsoN) **SÓ SE** `pagar` vazio → grava `pagar = no`.

Os passos 2 a 6 disparam até 5 recarregamentos encadeados da página e **nenhum dos parâmetros que eles gravam é usado
nesta página** (§2.5). É cópia integral do PageLoaded de `financeiro`.

### 4.2 Filtros (20 workflows)
Cada campo grava o seu parâmetro na URL com `keep_current_page_params=true`; cada ícone de limpar faz `ResetGroup` do
grupo e apaga o parâmetro:

| Campo | Grava (WF) | Limpa (WF) |
|---|---|---|
| Cliente | bTspD | bTsox |
| Grupo fornecedor | bTsoT | bTspI |
| Filial fornecedor | bTsur | bTsuw |
| Vendedor | bTspl | bTspn |
| Núm pedido | bTsqX | bTsqc |
| Núm cobrança | bTspb | bTspV |
| NF fornecedor | bTspz | bTsqJ |
| NF megabox | bTsqE (lê `El[dd filterfinanceiro numcobranca]`) | bTsqP |
| Status | bTsoY | — |
| Status vazio + cliente e fornecedor vazios | bTsod (volta o período ao mês corrente) | — |
| Período (plugin `AAd`) | bTsof: grava `UltimoDateRange` no usuário (bTsoj) e o período na URL (bTsok) | — |
| "Todo histórico" (bTsol) | período `Date(1704078000000)` = 01/01/2024 00:00 BRT → hoje 23:59:59 | — |

Destes, só bTsqX/bTsqc (pedido) e bTspz/bTsqJ (NF fornecedor) mudam o que aparece na tela.

### 4.3 Abrir e fechar os níveis da árvore
- WF bTtMT0 (clique em `gp card cotacao`) → `ToggleElement rpg pedidos`.
- WF bTtMe0 (`gp card pedido`) → `ToggleElement rpg orcamentos`.
- WF bTtMp0 (`gp card orcamentos`) → `ToggleElement rpg entregas`.
- WF bTtMx0 (`gp card entregas`) → `ToggleElement rpg areceber` **e** `rpg apagar`.

`ToggleElement` age sobre **todas as instâncias** do RG daquele nome na página, não sobre a linha clicada: abrir as
entregas de um orçamento abre as de todos. Os RGs de CR e CP nascem `oculto ao carregar`; os demais, visíveis.

### 4.4 Destravar / travar um registro (12 workflows, 6 pares)
Cada nível tem um botão cadeado (`btn edita …`, ícone `feather unlock`) com dois workflows espelhados:

| Nível | Destrava (estado vazio → grava `Parent`) | Trava (estado preenchido → limpa) |
|---|---|---|
| Cotação | bTthq → bTthv | bTthX → bTthd |
| Pedido | bTthf → bTthl | bTthx → bTtiC |
| Orçamento | bTtiH → bTtiJ | bTtiO → bTtiT |
| Entrega | bTtiV → bTtia | bTtif → bTtih |
| CR | bTtim → bTtir | bTtit → bTtiy |
| CP | bTtjD → bTtjF | bTtjK → bTtjP |

Enquanto o estado aponta para o registro, todos os campos daquele cartão ficam habilitados e os botões "Grava …" saem de
`button_disabled`. Como a comparação é `estado = Parent`, **só um registro por nível fica destravado**; clicar no cadeado
de outro registro do mesmo nível com o estado preenchido apenas **trava o anterior** (a condição do par é sobre o estado,
não sobre a linha), então é preciso clicar duas vezes.

### 4.5 Gravar (9 workflows)

**Cotação — "Grava cotação" (WF bTtjR):** `ChangeThing` bTtjX grava `Cotacao.QualVendedor = dd vendedor cotacao`;
`SetCustomState` bTtkM trava de volta.

**Cotação — "Grava histórico" (WF bTtkR): troca de vendedor em cascata pela árvore inteira.**
1. bTtkX — `Cotacao.QualVendedor`.
2. bTtkZ — `QuaisProdutos:QuaisOrcamentosForncededores.QualVendedor` (todos os orçamentos de fornecedor).
3. bTtke — `QualPedido.QualVendedor`.
4. bTtkj — `QualPedido.QuaisEntregas.QualVendedor`.
5. bTtkl — `QualPedido.QuaisEntregas.QuaisContasReceber.QualVendedor`.
6. bTtkq — `QualPedido.QuaisEntregas.QuaisContasPagar.QualVendedor` (`type_to_change = tbl_contasreceber1`).
7. bTtkv — trava.
É a operação de **transferência de venda entre vendedores**: muda comissão a pagar, metas e relatórios de todo mundo.
Roda no navegador, sem transação, sem confirmação e sem registrar quem transferiu nem por quê.

**Pedido — "Grava pedido" (WF bTvGV0):** bTvGd0 grava `PrazoRecebComissoes` e `FormaPagto`; bTvGi0 trava.

**Orçamento — "Grava orçmto" (WF bTtlI):**
1. bTtlO grava `QtdVenda`, `ValorVendaUnit`, `ValorComissaoUnit`, `TipoFrete`, `ValorFrete`, a alíquota de ICMS
   (campo `cpo_tributos_number`), a alíquota de PIS/COFINS (campo `cpo_tributopiscofinsb_number`),
   `QualEnderecoOrigem`, `QualFornecedor = origem.QualGrupoCliFor` e `QualEnderecoDestino`.
   **Os dois campos de alíquota recebem o valor de `El[ip icms]`** — o input `ip piscofins` nunca é gravado (§5, ponto 2).
2. bTtlT agenda o backend `CalculaFornecedoresLista` (bTPFh) com este orçamento, que recalcula
   `ValorVendaBruto`, `ValorComissaoBruto`, `ValorPISCOFINS`, `ValorICMS`, `ValorVendaLiquido`, `ValorUnitLiquido`.
   **Não trava o cartão de volta** (falta o `SetCustomState`, ao contrário dos outros níveis).

**Orçamento — "Grava histórico" (WF bTtlV):** faz o mesmo (bTtlb, bTtlg) e mais:
3. bTtmK — propaga para `QuaisEntregas`: `ValorVendaBrutoUnitario = ip oct valor unit` e `ValorComissaoUnitario = ip oct comiss unit`.
4. bTtll — agenda `CalcularValoresListaEntregas` (bTtln) com `QuaisEntregas`, `Qtd = QuaisEntregas:count`, `Fila = 1`,
   que recalcula entrega a entrega (recursivo) `valorcomissao`, `ValorVendaBruto`, `ValorVendaBrutoUnitario`,
   `ValorVendaLiquido`, `ValorVendaLiquidoUnitario` a partir do orçamento.
   Também não trava o cartão.

**Entrega — "Grava entrega" (WF bTvDn0):**
1. bTvDt0 grava `QualVendedor`, `QtdEntrega`, `ValorVendaBrutoUnitario`, `ValorComissaoUnitario`,
   `DtPrevEntrega` (campo `cpo_dataentrega_date`), `DtEntrega` (`cpo_dtentrega_date`), `DtEmissaoNf`, `NumNfFornecedor`,
   `ArquivoNfFornecedor`, `StatusEntrega`, `QualVendedorSubstituto`.
2. bTvKr recalcula na própria entrega: `ValorComissaoBruto = ValorComissaoUnitario × QtdEntrega`,
   `ValorVendaBruto = ValorVendaBrutoUnitario × QtdEntrega`, `ValorVendaLiquido = ValorVendaLiquidoUnitario × QtdEntrega`.
   Usa `InjectedValue`, ou seja, os valores **já gravados** no passo 1.
3. bUBiY propaga para `QuaisContasReceber`: `QualVendedor`, `NumNfFornecedor`, **`NumNfFornecedor` de novo (com o arquivo)**
   e `DataEntrega = Entrega.DtEntrega`. Ver o defeito em §8.3.
4. bTvDv0 trava.

**Entrega — "Grava entrega historico" (WF bTvEA0):** mesmo passo 1 (bTvEG0); depois
2. bTvdH — `ValorComissaoBruto = QtdEntrega × ValorComissaoUnitario`;
3. bTvEN0 — propaga para as CRs: `QualVendedor`, `ValorComissaoUnitario`,
   **`ValorComissao = Entrega.ValorComissaoBruto ÷ QuaisContasReceber:count`** (rateio da comissão pelas parcelas),
   `NumNfFornecedor` (duas vezes, o mesmo defeito), `DataEntrega`, `ValorUnit = ValorVendaBrutoUnitario`,
   `ValorTotal = ValorVendaBrutoUnitario × QtdEntrega`;
4. bTvEX0 trava.
Diferença prática entre os dois botões da entrega: o primeiro só acerta a entrega e carimba NF/vendedor nas CRs;
o segundo **redistribui os valores financeiros** entre as parcelas.

**CR — "Grava a receber" (WF bTvEZ0):** bTvEf0 grava `QualVendedor`, `DataVencimento`, `ValorComissaoUnitario`,
`ValorComissao = ip rec valor unit × QualEntrega.QtdEntrega`, `DataRecebimentoBancocaixa`, `DataNfMegabox`,
`NumNfMegabox`, `AnexoNfMegabox`, `StatusFinanceiro`, `NumNfFornecedor`; bTvEp0 trava.
**Marcar "Recebido" aqui não registra `QuemBaixou` nem `DataBaixaSistema`** — é uma baixa por fora do fluxo de `financeiro`.

**CP — "Grava a pagar" (WF bTvEr0):** idêntico ao da CR (bTvEw0, bTvEx0), sobre `Tbl.ContasPagar`.

### 4.6 Apagar (2 workflows)
- WF bTvGn0 — "Deletar a receber": `DeleteThing` bTvGt0 apaga a CR e bTvGv0 trava o estado.
- WF bTvHA0 — "Deletar a pagar": `DeleteThing` bTvHG0 apaga a CP e bTvHL0 trava.

Sem confirmação, sem lixeira, sem registro. Os botões só ficam habilitados com o cartão destravado, mas isso é
`button_disabled` no navegador. Nada limpa `Entrega.QuaisContasReceber` / `QuaisContasPagar`, que ficam com referência órfã.

### 4.7 Copiar ids e abrir anexos (7 workflows)
- Copiar para a área de transferência (plugin 1497473108162, ação `AAU`): id da entrega (bUBij), id da CR (bUBjC),
  id da CP (bUBjP), id da cotação (bUCfm0), id do pedido (bUCgL0), id do modelo de produto do orçamento (bUCgn0).
  Os três primeiros só aparecem para `IsDev`; os três últimos (ícones `fa fa-info-circle` com o id no tooltip) aparecem para todos.
- WF bUCeq0 — clique em "Proposta {n}" abre `Proposta.AquivoProposta` em nova aba.

### 4.8 Amarrar uma CR existente a uma entrega (2 workflows)
- WF bUBkp — clique no ícone `fa fa-dollar` da entrega: mostra `pop add areceber na entrega` (bUBkv) e carrega a entrega nele (bUBlA).
- WF bUBkV — "Gravar": bUBkb grava `Entrega.QuaisContasReceber = Search(ContasReceber: _id = {texto colado}):first_element`,
  bUBkn grava `ContasReceber.QualEntrega = a entrega`, bUBkd reseta os inputs e bUBki fecha o popup.
  **`QuaisContasReceber` é substituída, não acrescida**: amarrar uma segunda CR desamarra a primeira.
  Sem validação de que o id existe, de que a CR é do mesmo pedido ou de que já não pertence a outra entrega.

### 4.9 Workflow morto
- WF bTsul — sem evento e sem ações.

## REUSABLE `tool.Historico`

### 4.10 Abas e escopo
- `Text D` → `var_tabhistorico_ = 1` (WF bTdzv/bTeAB); `Text E` → 2 (bTeAF/bTeAL); `Text C` → 3 (bTjCf/bTjCl).
- WF bTjmt (mudou `rad tipoclifor`): volta para a aba 1 (bTjmz) e, **SÓ SE** o tipo for Fornecedor, faz `ResetGroup` em
  `gp vendedor` (bTkBf) — porque fornecedor não tem carteira.
- **Não existe inicialização de `var_tabhistorico_`**: o único PageLoaded do reusable (bUEnc) só define
  `var_modeloemail_ = "1"`. Como as três tabelas usam `equals(1|2|3) → visível` / `not_equals → invisível`, ao abrir o
  painel **nenhuma tabela aparece** até o usuário clicar numa aba. Ver [DÚVIDA 5].

### 4.11 Expandir a linha do tempo de um cliente
- WF bTdvt (aba 1) e WF bTjKS (aba 3): `ToggleElement rpg historico` — de novo, alterna **todas** as tabelas de
  histórico da lista, não só a do cliente clicado.
- WF bUEcp0 (`gp nome cliente` no bloco Emails): **sem ações** — morto.

### 4.12 Criar uma interação (3 pares de workflows, um por aba)
O mesmo comportamento, triplicado. Em cada aba o botão de salvar tem dois workflows: um para criar (quando o grupo de
edição está vazio) e outro para editar (quando está preenchido).

**Aba 1 — "Por cliente" (WF bTdwD, condição `gp edita historico por cliente` vazio):**
1. bTdwJ — `NewThing Tbl.Historico`: `Descricao = ipt descricao historico cli`, `QualCliente = gp cliente` (a linha da tabela),
   `QualVendedor = CurrentUser`, `QualUnidade = dd unidade agrupado`.
2. bTdzn — `ResetGroup gp edita historico indi` (**reseta o grupo da aba 2**, não o da aba 1 — ver §8.3).
3. bTeDB — `ResetInputs`.
4. bTjIC — `ChangeThing` no cliente: `UltimoHistoricoData = Page.Current Date/Time`, `UltimoHistoricoMsg = ResultOfStep[bTdwJ]`.

**Aba 2 — "Individual" (WF bTdzL):** bTdzR cria com `QualCliente = src busca clifor individual` e
`QualUnidade = dd unidade individual`; bTdzV reseta o grupo; bTeDM `ResetInputs`; bTjIB atualiza o espelho do cliente.

**Aba 3 — "Sem interação" (WF bTjKZ):** bTjKe cria com `QualCliente = gp cliente` e `QualUnidade = dd unidade seminteracao`;
bTjKf reseta o grupo da aba 2 (mesmo deslize); bTjKj `ResetInputs`; bTjKk atualiza o espelho.

Em todos: `QualDepto` fica vazio (só `pop.HistoricosContaReceber` o preenche) e `AnexoFile`/`AnexoLink` não são oferecidos.
A unidade é obrigatória (`mandatory=True`) nos três dropdowns.

### 4.13 Editar uma interação
- Carregar no formulário: WF bTdwV (aba 1, `DisplayGroupData` bTdwb), WF bTjLI (aba 3, bTjLN), WF bTdzo (aba 2, bTdzu) —
  todos levam `Ancestor[TableCrossAxis]` (a linha) para o grupo de edição.
- Salvar por cima: WF bTdwj (aba 1) → `ChangeThing` bTdwt reescreve `Descricao`, `QualCliente` e
  **`QualVendedor = CurrentUser`**; depois bTeDH/bTeDF resetam. WF bTdzW (aba 2) → bTdzi reescreve os mesmos campos
  mais `QualUnidade`; bTdzc reseta. WF bTjKp (aba 3) → bTjKr reescreve incluindo `QualUnidade`; bTjKv/bTjKw resetam.
- **A edição sobrescreve o texto original e troca o vendedor do registro para quem editou.** Não sobra versão anterior.
  Nenhum desses três workflows atualiza `UltimoHistoricoData`/`UltimoHistoricoMsg` do cliente.
- O bloco "Modificado: …" existe nas três tabelas, mas a condicional está invertida: mostra
  `⟂ quando Modified Date:equals_rounded_down(Created Date, minute) → visível`, ou seja, aparece exatamente quando o
  registro **nunca** foi alterado (bTlYU, bTiIL, bTlWv).

### 4.14 Apagar uma interação (3 workflows idênticos)
WF bTeBs, WF bTeCj e WF bTjLB — os três disparam do mesmo nome de elemento (`btn edita historico individual copy`,
ícone de lixeira) nas três tabelas:
1. `DeleteThing` (bTeBy / bTeCo / bTjLD) apaga a linha.
2. `ChangeThing` (bTlEQ / bTlEV / bTlEP) recalcula no cliente:
   `UltimoHistoricoData = Search(Tbl.Historico: QualCliente = …):last_element:Created Date` e
   `UltimoHistoricoMsg = Search(…):last_element`.
   A busca **não tem ordenação** e o alvo (`Ancestor[TableCrossAxis]:cpo.QualCliente`) é lido do registro que acabou de
   ser apagado. Exclusão física, sem confirmação e sem registro de quem apagou.

### 4.15 Limpar buscas
WF bTiqs (`ResetGroup gp buscaclientehistorico`), WF bTirj (`gp buscaclienteindividual`), WF bUEcf0
(`gp buscaclientehistorico` do bloco Emails) — os três ícones "x" ao lado dos campos de busca.

### 4.16 E-mail de prospecção (bloco Emails)
1. Escolher o cliente: WF bUEhK0 (ícone de envelope na linha) ou WF bUEir0 (clique no cartão do cliente) gravam
   `id_clifor_ = Ancestor[TableCrossAxis]`.
2. Escolher o modelo: WFs bUEmJ(1), bUEmU(2), bUEmy(3), bUEmf(4), bUEmn(5), bUEnJ(6), bUEnR(7) gravam `var_modeloemail_`.
   As condicionais de `ipt assunto` e `ipt email` trocam assunto e corpo conforme o modelo; o default (WF bUEnc) é o 1.
3. `ipt qual email` lista `id_clifor_.QuaisContatos`; se o primeiro contato do grupo tiver `EmailPrincipal`, ele vira o default.
4. WF bUEgz0 — "Enviar email":
   1. bUEhF0 agenda `EnviarEmailsGeral` (bTnvb0) com `to = ipt qual email:cpo.Email`, `body = ipt email`,
      `subject = ipt assunto`, `reply = CurrentUser.EmailContato`,
      `sender = "[Megabox] {primeiro nome do usuário em maiúsculas}"`.
   2. bUEjC0 — `NewThing Tbl.Historico`: `QualCliente = id_clifor_`, `Descricao = corpo inteiro do e-mail`,
      **`QualVendedor = El[dd carteira 2 copy]:get_data`** (o vendedor do **filtro**, não quem enviou). Sem `QualUnidade`.
   3. bUEjH0 — `ChangeThing` no cliente: `UltimoHistoricoData = agora` (**não** grava `UltimoHistoricoMsg`).
   4. bUEhu0 — toast "Enviado com sucesso" (plugin 1658328157117), emitido mesmo que o envio falhe depois no backend.
   Sem validação de destinatário preenchido, sem limite de disparos e sem descadastro.
5. WF bUErd — mudar o dropdown "Email padrão" da linha: `ChangeThing` bUErj grava `EmailPrincipal = valor escolhido` no
   **primeiro** `ContatoCliFor` do grupo (`Search(…):first_element`), independentemente de qual contato seja;
   bUErl mostra "Email principal para contato salvo com sucesso".

### 4.17 Navegação do painel
- WF bUEgZ0 / bUEgm0 — alternam `Group Historico` e `Group Email` (dois `ToggleElement` cada; clicar duas vezes no mesmo
  botão inverte tudo em vez de manter a aba).
- WF bUEhb0 — "Voltar para vendas" → página `vendas`.
- WF bUEiY0 — "Histórico ↗" → página `historico_full`, com `data_to_send = Text("")` (vazio).

---

## 5. Cálculos e valores

| Valor | Fórmula exata (Bubble) | Onde | Observação |
|---|---|---|---|
| Comissão da entrega | `ValorComissaoUnitario × QtdEntrega` | bTvKr, bTvdH, backend bTtlt | grava em `Entrega.ValorComissaoBruto` (`cpo_valorcomissao_number`) |
| Venda bruta da entrega | `ValorVendaBrutoUnitario × QtdEntrega` | bTvKr | |
| Venda líquida da entrega | `ValorVendaLiquidoUnitario × QtdEntrega` | bTvKr | usa o unitário **anterior**, que só o backend bTtln atualiza |
| Comissão da CR (grava a receber) | `ip rec valor unit × QualEntrega.QtdEntrega` | bTvEf0 | usa a quantidade da **entrega inteira**, não a da parcela |
| Comissão da CP (grava a pagar) | `ip gar valor unit × QualEntrega.QtdEntrega` | bTvEw0 | idem |
| Rateio da comissão pelas parcelas | `Entrega.ValorComissaoBruto ÷ QuaisContasReceber:count` | bTvEN0 | ponto flutuante, sem tratamento de resto; se `count = 0`, divisão por zero |
| Valor total da CR | `ValorVendaBrutoUnitario × QtdEntrega` | bTvEN0 | |
| Total de tributos (exibição) | `ValorPISCOFINS + ValorICMS` | `ipt calculotributo` bTtAx0 | só leitura |
| Venda bruta do orçamento | `QtdVenda × ValorVendaUnit + ValorFrete` | backend bTPGA | |
| Comissão bruta do orçamento | `QtdVenda × ValorComissaoUnit` | backend bTPFo | |
| Valor de PIS/COFINS | `QtdVenda × ValorVendaUnit × TributoPISCOFINS` | backend bTPFt | alíquota como fração |
| Valor de ICMS | `QtdVenda × ValorVendaUnit × TributosICMS` | backend bTPFv | |
| Venda líquida do orçamento | `ValorVendaBruto − ValorICMS − ValorPISCOFINS` | backend bTPGF | |
| Unitário líquido | `ValorVendaLiquido ÷ QtdVenda` | backend bTeYL | |
| "Último Histórico: n dias" | `Page.Current Date/Time:minus(GrupoCliFor.UltimoHistoricoData):to_days:round(0)` | reusable, 3 lugares | calculado no navegador, sem fuso; cliente sem histórico mostra número absurdo |
| Corte "sem interação" | `UltimoHistoricoData ≤ hoje − 15 dias` | `rpg clientes sem interação` | 15 dias fixo no elemento |
| Cortes do bloco Emails | `−15d`, `−30d`, `−30d` (para "+1m"), `−3 meses` | condicionais de bUEaU0 | "+1m" repete o corte de 30d |
| Período padrão | dia 1 00:00:00 → dia 31 23:59:59 do mês | bTsoH | `change_date(31)` transborda em meses curtos |
| "Todo histórico" | `Date(1704078000000)` = 01/01/2024 00:00 BRT → hoje | bTsop | corta tudo antes de 2024 |

**Dois pontos de atenção sobre dinheiro e tributo:**
1. Todos os valores são `number` no Bubble (ponto flutuante). A comissão unitária é exibida com `decimal_place=6`
   (`ip oct comiss unit`, `ipt etg comiss unit`) e o rateio por parcela (bTvEN0) divide sem arredondar. No banco novo:
   `numeric` e rateio com resto na última parcela, com teste.
2. **A alíquota de PIS/COFINS nunca é gravada.** Nos WFs bTtlO e bTtlb os dois campos de alíquota recebem
   `El[ip icms]:get_data`: o campo `cpo_tributos_number` (ICMS) e o campo `cpo_tributopiscofinsb_number` (PIS/COFINS).
   O input `ip piscofins` (bTtAr0) exibe `cpo_tributopiscofinsb_number` e tem `bind_field` para ele, mas como
   `auto_binding = False` e nenhuma ação o lê, **digitar nele não faz nada** — e o backend bTPFt calcula o PIS usando o
   valor de ICMS. (Nota de leitura do mapa: por colisão de id de campo, o decompilador imprime esses dois campos com os
   nomes `cpo.TotalBonusExtra - deleted` e `cpo.TotalComissaoVendedor`, que na verdade pertencem a `Tbl.MetasFechadas`.
   Os ids `cpo_tributos_number` e `cpo_tributopiscofinsb_number` são de `Tbl.OrcFornecedoresCotacao`.)

---

## 6. Integrações e backend workflows

| O quê | Onde | Detalhe |
|---|---|---|
| `ScheduleAPIEvent` → `CalculaFornecedoresLista` (bTPFh) | página, ações bTtlT (WF bTtlI) e bTtlg (WF bTtlV) | recalcula os 6 valores derivados do orçamento de fornecedor; roda como backend, assíncrono |
| `ScheduleAPIEvent` → `CalcularValoresListaEntregas` (bTtln) | página, ação bTtll (WF bTtlV) | percorre `QuaisEntregas` recursivamente (`Fila+1` a cada passo) recalculando valores da entrega a partir do orçamento |
| `ScheduleAPIEvent` → `EnviarEmailsGeral` (bTnvb0) | reusable, ação bUEhF0 (WF bUEgz0) | envia por **SendGrid/SendEmail do Bubble** se `ConfigSistema[CodigoConfig=19].ValorBoolean1 = false`, ou por **SMTP Gmail** (plugin 1752755029481, credenciais em `Opt.Smtp.GmailMegabox`) se `true`; soma 1 no contador `ConfigSistema[19].ValorNumero` |
| Plugin 1497473108162 (`AAU`) — área de transferência | WFs bUBij, bUBjC, bUBjP, bUCfm0, bUCgL0, bUCgn0 | copia o `_id` |
| Plugin 1648823245313 (date range) | `dtr filterfinanceiro data`; evento `AAd` (WF bTsof), valor `AAF` | |
| Plugin 1558770956236 (`AAC`) | ação bTsoF no PageLoaded | não identificado [DÚVIDA 2] |
| Plugin 1658328157117 (toast) | ações bUEhu0, bUErl | mensagens do reusable |
| API Connector | — | nenhuma chamada nestes dois arquivos |

---

## 7. Segurança e privacidade

1. **`Tbl.Historico` não tem nenhuma regra de privacidade declarada** e está marcada como "exposto na API", num app com
   Data API e Workflow API ligadas (`integracoes.md`). Toda a conversa comercial com todos os clientes — incluindo os
   corpos completos de e-mails de prospecção gravados em `Descricao` (WF bUEgz0) — é leitura aberta.
   `Tbl.GrupoCliFor`, `Tbl.ContatoCliFor`, `Tbl.Pedido`, `Tbl.Entregas`, `Tbl.ContasReceber` e
   `Tbl.OrcFornecedoresCotacao` têm regra `everyone` com `view_all`, `search_for` e `view_attachments` = true.
2. **A página `historico` não tem guarda nenhuma** e é a tela com mais poder de escrita do sistema: destrava e regrava
   qualquer registro da árvore de qualquer pedido, transfere a venda inteira de vendedor (WF bTtkR), apaga contas a
   receber e a pagar (bTvGn0, bTvHA0) e amarra CRs a entregas por id colado (bUBkV). O único controle é o item de menu.
3. **Histórico deveria ser trilha de auditoria e não é.** Hoje:
   - a edição sobrescreve `Descricao` no lugar (bTdwt, bTdzi, bTjKr) e ainda troca o autor lógico (`QualVendedor = CurrentUser`);
   - a exclusão é física (bTeBy, bTeCo, bTjLD), sem confirmação e sem quem/quando;
   - a restrição "só o autor mexe" é `button_disabled` no navegador, contornável pela API;
   - o carimbo de alteração (`Modified Date`) está exibido com condicional invertida (§4.13).
   **No app novo: `historicos` é append-only.** Sem `UPDATE` e sem `DELETE` para usuário comum (RLS permitindo apenas
   `INSERT` e `SELECT`); correção = novo registro referenciando o anterior (`corrige_id`) ou `cancelado_em`/`cancelado_por`
   com o texto original preservado. Autor gravado pelo servidor (`auth.uid()`), nunca vindo do formulário.
4. **Ações destrutivas sem rastro na página:** troca de vendedor em cascata, exclusão de CR/CP, baixa informal de CR
   (gravar `StatusFinanceiro = Recebido` sem `QuemBaixou`/`DataBaixaSistema`). Tudo isso precisa de log de auditoria
   (tabela `auditoria` por trigger) e de restrição por perfil no servidor.
5. **Segredo exposto:** `Opt.Smtp.GmailMegabox` guarda usuário e senha SMTP em texto puro num option set — option sets
   vão inteiros para o navegador. Revogar essa senha e usar segredo de ambiente no servidor
   (por exemplo `SMTP_PASSWORD` ou `RESEND_API_KEY`); nunca `NEXT_PUBLIC_`.
6. **Envio de e-mail em massa sem controle:** qualquer usuário com o painel aberto dispara e-mail em nome da MegaBox
   para qualquer contato, sem limite, sem descadastro e sem registro de falha (o toast é otimista). Exige permissão e
   fila auditada.
7. **Dados pessoais** expostos na tela e gravados em `Descricao`: nome e e-mail de compradores, telefones, CNPJ das
   unidades. O corpo do e-mail guardado como histórico duplica dados pessoais sem necessidade.
8. **Arquivos públicos:** `ArquivoNfFornecedor`, `AnexoNfMegabox`, `Historico.AnexoFile` e os PDFs vinculados por
   `AnexoLink` ficam com URL pública e permanente no CDN do Bubble. No novo: Storage privado com URL assinada.
9. **`_id` exposto no tooltip** de cotação, pedido e produto para qualquer usuário (bUCfV0, bUCfx0, bUCgW0); os ids de
   entrega/CR/CP ficam atrás de `IsDev`. Com ids opacos e Data API fechada, isso deixa de importar.
10. **Operações em massa no navegador** (`ChangeListOfThings` de bTtkR, bTvEN0, bUBiY) não são transacionais: fechar a aba
    no meio deixa metade da árvore com um vendedor e metade com outro. Daí o alerta "Não feche essa janela" — que aliás
    nunca é mostrado (§8.1).

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto
- **Página:** WF bTsul (sem evento, sem ações); `alt processando` (bTsnR) nunca acionado; os passos 4, 5 e 6 do PageLoaded
  (`dtfiltro`, `receber`, `pagar`) gravam parâmetros que ninguém lê; 9 dos 11 filtros não filtram nada (§2.2), com os
  20 workflows de filtro correspondentes; `btn periodointegral` e o date range não mudam nada na tela.
- **Reusable:** WF bUEcp0 (sem ações); `Group MZ` (bUEXz0) com o filtro de UF é `oculto ao carregar` e **não tem
  condicional que o mostre** — o dropdown de estado é inalcançável; a opção "+1m" do `RadioButtons B` aplica o mesmo
  corte que "30d"; o rótulo "Compraram nos últimos 3 meses" descreve o oposto da consulta (que busca quem **não** tem
  contato nem alteração há 3 meses).
- `historico_full` **não** é morta: é o host em tela cheia do painel (§1.3).

### 8.2 Duplicação
- **A barra de filtros inteira é cópia de `financeiro`**, inclusive nomes de elementos repetidos
  (`dd filterfinanceiro numcobranca` em dois campos, `reset filter numcobranca` em três grupos,
  `reset filter fornecedor` em dois) e o placeholder "Número cobrança" no campo de número do pedido.
- **12 workflows de destravar/travar** (6 pares) que são o mesmo comportamento repetido por nível → um único
  "registro em edição" (id + tipo) resolve.
- **5 buscas idênticas** `Search(User: Ativo = true; sort NomeModelo)` nos dropdowns de vendedor.
- **Cada nível tem dois botões de gravar** ("Grava X" e "Grava histórico") com o passo 1 literalmente igual —
  são o mesmo salvamento com propagação opcional.
- **No reusable, três cópias da mesma tela de histórico** (abas 1, 2 e 3): três tabelas `rpg historico` com o mesmo
  layout, três formulários de edição, três pares criar/editar (bTdwD/bTdwj, bTdzL/bTdzW, bTjKZ/bTjKp) e três workflows
  de exclusão idênticos (bTeBs, bTeCj, bTjLB). São três dropdowns de unidade diferentes (`dd unidade agrupado`,
  `dd unidade individual`, `dd unidade seminteracao`) para a mesma coisa. Um componente único resolve.
- 6 variações da mesma busca de `GrupoCliFor` nas condicionais de `rpg clientes historico` (bUEaU0), diferindo só no corte de data.

### 8.3 Gambiarras e defeitos a corrigir (não reproduzir)
1. **NF do fornecedor sobrescrita pelo arquivo.** Em bUBiY e bTvEN0 o campo `cpo.NumNfFornecedor` da CR é atribuído
   **duas vezes na mesma ação**: primeiro com `Parent:cpo.NumNfFornecedor` (o número) e logo depois com
   `Parent:cpo.ArquivoNfFornecedor` (a URL do arquivo). A segunda vence: a CR fica com uma URL no campo do número da NF.
   Isso quebra o filtro "Num NF Fornecedor" de `financeiro` e o relatório de comissões.
2. **Alíquota de PIS/COFINS recebe o valor do ICMS** e o input de PIS é decorativo (§5, ponto 2).
3. **`ResetGroup` no grupo errado:** bTdzn (aba 1) e bTjKf (aba 3) resetam `gp edita historico indi`, que é da aba 2.
   O formulário da aba que acabou de gravar continua preenchido.
4. **"Modificado" com condicional invertida** (bTlYU, bTiIL, bTlWv): aparece quando o registro **não** foi modificado.
5. **`ToggleElement` por nome** afeta todas as instâncias do RG/tabela: abrir uma entrega abre todas; expandir o
   histórico de um cliente expande o de todos (bTdvt, bTjKS, bTtMT0, bTtMe0, bTtMp0, bTtMx0).
6. **`var_tabhistorico_` sem valor inicial** → painel abre sem nenhuma tabela (§4.10).
7. **`QuaisContasReceber` substituída em vez de acrescida** ao amarrar CR na entrega (bUBkb).
8. **Vendedor do histórico de e-mail vem do filtro** (bUEjC0 usa `dd carteira 2 copy`), não de quem enviou.
9. **`EmailPrincipal` gravado sempre no primeiro contato do grupo** (bUErj), qualquer que seja o contato escolhido.
10. **Espelho `UltimoHistoricoData` inconsistente:** uns gravam `Page.Current Date/Time` (bTdwJ/bTjIC, bUEjH0),
    outros `Historico.Created Date` (bTrOA, bTkgh2), a edição não grava nada e a exclusão recalcula com
    `Search(...):last_element` **sem ordenação** e lendo um registro já apagado (bTlEQ, bTlEV, bTlEP). Existem duas
    rotinas de reparo em massa em `rotinas` (bTjME, bTjMv) só por causa disso.
11. **Nomes de campo enganosos no Bubble** a não repetir no banco novo: `Entrega.DtPrevEntrega` guardado em
    `cpo_dataentrega_date` e `Entrega.DtEntrega` em `cpo_dtentrega_date`; o input `ipt gar numnfmegabox` mostra
    `AnexoNfMegabox` (arquivo) num campo rotulado "Núm. NF megabox"; três campos distintos com id
    `cpo_valorcomissao_number` em tabelas diferentes.
12. **Alterar valor e vendedor sem exigir motivo**, embora existam os campos `MotivoAlteraComissao`,
    `MotivoAlteracaoValores` e `MotivoAlteraValores`.

### 8.4 Otimizações para o banco e a lógica novos

**Sobre o histórico (a tabela mais volumosa do sistema):**
- `historicos` cresce por cliente × interação × e-mail disparado. Hoje toda leitura é `Search(Tbl.Historico: QualCliente = X)`
  sem limite, trazendo o histórico **inteiro** do cliente para o navegador a cada expansão de linha — e a aba 1 pode
  expandir a carteira inteira de uma vez.
  **No app novo: paginação no servidor** (cursor por `(criado_em desc, id desc)`), com "carregar mais", nunca lista completa.
- **Índices:** `historicos(clifor_id, criado_em desc)` (a linha do tempo), `historicos(autor_id, criado_em desc)`
  (aba "Individual"), `historicos(conta_receber_id)`, `historicos(unidade_id)`, e
  `gin (to_tsvector('portuguese', descricao))` se houver busca por texto.
- **A gravação do histórico tem de sair da tela.** Hoje 12 lugares diferentes criam `Tbl.Historico` e cada um decide
  sozinho se e como atualiza o espelho do cliente — daí a inconsistência de 8.3.10. No novo:
  - eventos automáticos (proposta enviada, pedido enviado, cobrança, recibo, e-mail de prospecção, endereço criado)
    viram **trigger/função no Postgres** disparada pela operação que os origina, não código de tela;
  - `clifor.ultimo_historico_em` / `ultimo_historico_id` deixam de ser campo mantido à mão: ou viram
    **coluna mantida por trigger `AFTER INSERT/UPDATE/DELETE ON historicos`**, ou desaparecem e a tela usa
    `mv_clifor_ultimo_historico` (`DISTINCT ON (clifor_id) … ORDER BY clifor_id, criado_em DESC`). Com isso as rotinas de
    reparo de `pagina-rotinas` deixam de existir.
- `tipo_evento` (enum) e `origem` (manual | email | proposta | pedido | cobranca | recibo | sistema) em `historicos`:
  hoje o tipo do evento está embutido no texto ("Enviado email de cobrança número …"), o que impede filtrar,
  contar e desenhar a linha do tempo.
- Corpo de e-mail **não** vai para `descricao`: grava-se um resumo e uma FK para `emails_enviados`.
- "Sem interação há N dias" vira **view** `vw_clientes_sem_interacao(vendedor_id, dias)` com o corte parametrizado
  (hoje há 15 fixo no elemento, 15/30/30/90 nas condicionais e 15 no sino do cabeçalho — um número só, configurável).

**Sobre a árvore do pedido:**
- A cadeia `Cotacao.QualPedido` / `Pedido.QuaisOrcamentosFonecedores` / `QuaisEntregas` / `QuaisContasReceber` /
  `QuaisContasPagar` é lista-de-coisas do Bubble; no Postgres vira **FK no filho** (`pedido.cotacao_id`,
  `orcamento_fornecedor.pedido_id`, `entrega.orcamento_fornecedor_id`, `conta.entrega_id`) e a árvore sai de **uma
  consulta/view** `vw_arvore_pedido`, não de 5 buscas aninhadas no navegador.
- Índices: `cotacoes(numero)` único, `pedidos(numero)`, `entregas(num_nf_fornecedor)`, `contas_*(entrega_id)`.
- Valores derivados (`valor_venda_bruto`, `valor_comissao_bruto`, `valor_icms`, `valor_pis_cofins`, `valor_venda_liquido`,
  `valor_unit_liquido`) saem dos backends bTPFh/bTtln e viram **colunas geradas ou view**, calculadas em `numeric`.
- Alíquotas (`aliquota_icms`, `aliquota_pis_cofins`) como `numeric(7,6)` com `CHECK (>= 0 AND <= 1)`, cada uma no seu campo.
- Troca de vendedor em cascata vira **uma função SQL transacional** (`fn_transferir_venda`) que grava auditoria, não 6
  `ChangeListOfThings` no navegador.
- Exclusão de CR/CP vira **soft delete** (`excluido_em`, `excluido_por`, `motivo`) com verificação de que a conta não está baixada.
- Preferência de período do usuário (`UltimoDateRange`) em `user_preferences` ou cookie, não em `User`.

---

## 9. Proposta para o app novo

### 9.1 Rotas
- `app/(app)/pedidos/[numero]/followup/page.tsx` — a árvore do pedido (nome real da funcionalidade).
  Server Component; carrega a árvore inteira em uma consulta.
- `app/(app)/historico/page.tsx` — **rota de compatibilidade**: lê `?numpedido=` (os links de `financeiro` e o item de
  menu apontam para cá) e redireciona para a rota acima. Manter até os links antigos saírem de circulação.
- `app/(app)/crm/historico/page.tsx` — substitui `historico_full`: o painel de interações em tela cheia, com
  `?vendedor=`, `?tipo=cliente|fornecedor`, `?aba=carteira|individual|sem-interacao`, `?q=` na URL.
- O painel lateral não é rota: é o componente `<PainelHistoricoCliente />` montado no layout do app.
- Middleware/layout valida sessão e permissão de página (tabela `permissoes_pagina`, equivalente ao que hoje é
  `ConfigSistema.QuaisDeptos/QuaisPerfis/QuaisUsuarios`). O follow-up exige perfil `hierarquia ≤ 2`.

### 9.2 Componentes
- `ArvorePedido` — recebe a árvore já montada; níveis colapsáveis **por linha** (estado por id, não global).
- `CartaoNivel` genérico (`cotacao | pedido | orcamento | entrega | conta`) com modo leitura/edição por registro,
  substituindo os 6 estados `var_edita*_` por um único `{ tipo, id } | null`.
- `FormTransferirVenda` — diálogo com destino, motivo obrigatório e prévia do que será alterado (n orçamentos,
  n entregas, n CRs, n CPs).
- `DialogVincularContaEntrega` — busca a conta por número/pedido, não por id colado; valida pedido e mostra a conta antes de amarrar.
- `PainelHistoricoCliente` — um componente só, com as três visões como abas (`carteira`, `individual`, `sem-interacao`)
  e **um** formulário de interação; aba inicial definida no servidor.
- `LinhaDoTempoCliente` — lista paginada por cursor, com ícone e rótulo por `tipo_evento`, autor, data e unidade.
- `FormInteracao` — descrição, unidade (obrigatória), anexo opcional.
- `ComposerEmailProspeccao` — seleção de contato, escolha de modelo (modelos vindos do banco, não do código), prévia e envio.
- `FiltrosCarteira` — vendedor, tipo, "sem carteira", UF, corte de dias.

### 9.3 Server actions
| Ação | Regra |
|---|---|
| `registrarInteracao({ cliforId, descricao, unidadeId, anexo? })` | autor = `auth.uid()` no servidor; `tipo_evento = 'manual'`; espelho do cliente atualizado por trigger |
| `cancelarInteracao(id, motivo)` | substitui o "apagar": marca `cancelado_em`/`cancelado_por`, preserva o texto; só autor ou diretor |
| `corrigirInteracao(id, novaDescricao, motivo)` | cria **novo** registro com `corrige_id = id`; não altera o original |
| `enviarEmailProspeccao({ cliforId, contatoId, modeloId, assunto, corpo })` | valida permissão e contato; enfileira em `email_outbox`; grava `emails_enviados` + `historicos` (`tipo_evento='email'`, resumo + FK) numa transação |
| `definirEmailPrincipal(contatoId)` | grava no contato escolhido (corrige 8.3.9) |
| `salvarCotacaoFollowup({ id, vendedorId })` | só perfis autorizados |
| `salvarPedidoFollowup({ id, prazoRecebimento, formaPagamento })` | |
| `salvarOrcamentoFollowup({ id, qtd, valorVendaUnit, comissaoUnit, tipoFrete, valorFrete, aliquotaIcms, aliquotaPisCofins, origemId, destinoId })` | alíquotas separadas; recálculo por função SQL na mesma transação |
| `salvarEntregaFollowup({ id, ...campos, propagarParaContas })` | `propagarParaContas` substitui os dois botões "Grava entrega"/"Grava histórico"; rateio da comissão com resto na última parcela |
| `salvarContaFollowup({ id, tipo, ...campos })` | baixar (status → recebido/pago) exige `quem_baixou` e `data_baixa`; recusa conta arquivada |
| `excluirContaFollowup(id, motivo)` | soft delete; recusa conta já baixada ou vinculada a cobrança |
| `transferirVenda({ cotacaoId, vendedorId, motivo })` | chama `fn_transferir_venda` (transação + auditoria) |
| `vincularContaEntrega({ contaId, entregaId })` | valida que conta e entrega são do mesmo pedido e que a conta não está em outra entrega |
- E-mail em fila (`email_outbox`) processada por rota/cron na Vercel (`gru1`); provedor por segredo de ambiente.

### 9.4 Consultas e views SQL
- `vw_arvore_pedido` — cotação + pedido + orçamentos + entregas + contas de um número, já com os valores calculados e os
  nomes de cliente/fornecedor/vendedor.
- `fn_arvore_pedido(p_numero text)` — aceita número de pedido **e** número de cotação, resolvendo a ambiguidade de hoje.
- `vw_linha_do_tempo_clifor` — `historicos` + autor + unidade + tipo de evento + origem, ordenada `criado_em desc`,
  filtrável por `clifor_id`, `autor_id`, `tipo_evento`, período; paginação por cursor.
- `mv_clifor_ultimo_historico` (ou coluna por trigger) — último histórico por clifor, base de "Último Histórico: n dias".
- `vw_clientes_sem_interacao(vendedor_id, dias)` — carteira do vendedor com `ultimo_historico_em <= now() - dias`,
  **incluindo** os que nunca tiveram interação (hoje eles somem, porque `UltimoHistoricoData` vazio não satisfaz `lte`).
- `fn_transferir_venda(cotacao_id, vendedor_id, motivo, ator)` — atualiza cotação, orçamentos, pedido, entregas e contas
  numa transação e grava `auditoria`.
- `fn_recalcular_orcamento(orcamento_id)` e `fn_recalcular_entregas(orcamento_id)` — substituem os backends bTPFh e bTtln,
  síncronas e em `numeric`.
- Triggers: `trg_historicos_espelho` (mantém o último histórico do clifor), `trg_auditoria_*` nas tabelas da árvore.

### 9.5 Tabelas envolvidas
`historicos` (append-only: `id`, `clifor_id`, `unidade_id`, `autor_id`, `vendedor_id`, `depto`, `tipo_evento`, `origem`,
`descricao`, `anexo_path`, `anexo_link`, `conta_receber_id`, `corrige_id`, `cancelado_em`, `cancelado_por`, `criado_em`),
`modelos_email`, `emails_enviados`, `email_outbox`,
`grupos_clifor` (+ `ultimo_historico_em`/`ultimo_historico_id` por trigger), `enderecos_clifor`, `contatos_clifor`,
`cotacoes`, `propostas`, `pedidos`, `orcamentos_fornecedor`, `entregas`, `contas_receber`, `contas_pagar`,
`usuarios` (perfil, departamento, carteira), `permissoes_pagina`, `auditoria`, `user_preferences`, `config_sistema`.
**RLS ligada em todas desde a primeira migration**: `historicos` com `SELECT` para usuário autenticado com permissão,
`INSERT` com `autor_id = auth.uid()`, **sem** `UPDATE` e **sem** `DELETE`; tabelas da árvore com escrita restrita ao
perfil de follow-up. Storage privado com URL assinada para anexos.

---

## 10. Dúvidas

1. **[DÚVIDA]** O parâmetro `numpedido` casa com `Cotacao.CotacaoNum` (number), mas quem o envia (`financeiro`, WFs
   bTvIN e bTpjx) manda `ContasReceber.NumeroPedido` (text). Número de pedido e número de cotação são sempre iguais?
   *Recomendação padrão:* `fn_arvore_pedido` aceita os dois e resolve por cotação **ou** por pedido; a URL nova leva o id da cotação.
2. **[DÚVIDA]** O que faz a ação de plugin `1558770956236/AAC` no carregamento (bTsoF)? A mesma aparece em `financeiro`.
   *Recomendação padrão:* não reproduzir até identificar.
3. **[DÚVIDA]** Qual é a diferença pretendida entre "Grava X" e "Grava histórico" em cada nível? Pelo mapa, o segundo
   propaga para baixo. *Recomendação padrão:* um botão só, com caixa "propagar para os registros filhos" marcada por padrão.
4. **[DÚVIDA]** Marcar `StatusFinanceiro = Recebido` aqui (bTvEf0) deve contar como baixa? Não grava `QuemBaixou`
   nem `DataBaixaSistema`. *Recomendação padrão:* sim, é baixa; o novo grava sempre quem e quando, ou o status fica
   bloqueado nesta tela.
5. **[DÚVIDA]** Qual aba o painel deve abrir? `var_tabhistorico_` nunca é inicializado e nenhuma tabela aparece no load.
   *Recomendação padrão:* aba 1 ("Por cliente") na carteira do usuário.
6. **[DÚVIDA]** O corte de "sem interação" é 15 dias na aba 3 e no sino do cabeçalho, e 15/30/30/90 no bloco Emails.
   Qual vale? *Recomendação padrão:* um parâmetro em `config_sistema` com default 15, ajustável na tela.
7. **[DÚVIDA]** O filtro de UF do bloco Emails (`Dropdown G`, dentro de `Group MZ` oculto) deveria estar visível?
   *Recomendação padrão:* sim — é filtro útil; `GrupoCliFor` não tem UF, ela vem de `EnderecosCliFor`, então filtra por endereço.
8. **[DÚVIDA]** "Compraram nos últimos 3 meses" (`check ultimos 3 meses`) busca quem **não** tem contato nem alteração há
   3 meses. O rótulo ou a consulta está errado? *Recomendação padrão:* o rótulo; renomear para "Sem contato há mais de 3 meses".
9. **[DÚVIDA]** "+1m" no `RadioButtons B` aplica o mesmo corte de "30d". Deveria ser 60 dias?
   *Recomendação padrão:* trocar por um seletor de dias (15/30/60/90).
10. **[DÚVIDA]** O corpo inteiro do e-mail deve mesmo virar a descrição do histórico (bUEjC0)?
    *Recomendação padrão:* não; gravar "E-mail de prospecção enviado — modelo {nome}" + FK para `emails_enviados`.
11. **[DÚVIDA]** Clientes com `UltimoHistoricoData` vazio (nunca contatados) **não aparecem** na aba "Sem interação",
    porque `lte` não casa com vazio. Deveriam aparecer primeiro? *Recomendação padrão:* sim, no topo da lista.
12. **[DÚVIDA]** Os 7 modelos de e-mail e seus textos devem continuar fixos no código?
    *Recomendação padrão:* tabela `modelos_email` editável, com os textos atuais migrados.
13. **[DÚVIDA]** Quem pode usar o FollowUp de Pedidos? `Opt.MenuConfig.FollowUp de Pedidos` diz `hierarquia = 2`, mas a
    liberação real está em `ConfigSistema`. *Recomendação padrão:* `hierarquia ≤ 2` (Diretor e Gerente) mais a lista
    explícita de `permissoes_pagina`.
14. **[DÚVIDA]** Apagar CR/CP deve continuar existindo nesta tela? *Recomendação padrão:* substituir por cancelamento
    com motivo, bloqueado para conta já baixada ou em cobrança.
15. **[DÚVIDA]** O painel lateral deveria receber o cliente em foco do hospedeiro (o cliente do pedido aberto em `vendas`,
    o fornecedor da CR em `financeiro`)? Hoje não recebe nada. *Recomendação padrão:* sim — o componente novo recebe
    `cliforId` opcional e abre já no cliente certo.
16. **[DÚVIDA]** `Historico.QualDepto` só é preenchido por `pop.HistoricosContaReceber`. Deve ser obrigatório em toda
    interação? *Recomendação padrão:* preencher sempre a partir do departamento do autor, no servidor.

---

## 11. Cobertura

### 11.1 Página `historico` — 58 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTsoB | PageLoaded | plugin desconhecido + normaliza período, `dtfiltro`, `receber`, `pagar` na URL | 4.1 |
| 2 | bTsoT | Muda `dd filterfinanceiro fornecedor` | grava `fornecedor` na URL (sem efeito) | 4.2 |
| 3 | bTsoY | Muda `dd filterfinanceiro status` | grava `statusfinanceiro` (sem efeito) | 4.2 |
| 4 | bTsod | Muda status vazio, sem cliente e sem fornecedor | volta o período ao mês corrente | 4.2 |
| 5 | bTsof | Date range aplicado (`AAd`) | salva `UltimoDateRange` no usuário e grava o período na URL | 4.2 |
| 6 | bTsol | Clique `btn periodointegral` | período 01/01/2024 → hoje (sem efeito) | 4.2 |
| 7 | bTsox | Clique `reset filter cliente` | reseta o grupo e limpa `cliente` | 4.2 |
| 8 | bTspD | Muda `dd filterfinanceiro CLIENTE` | grava `cliente` | 4.2 |
| 9 | bTspI | Clique `reset filter fornecedor` | reseta o grupo e limpa `fornecedor` | 4.2 |
| 10 | bTspV | Clique `reset filter numcobranca` | reseta `gp filter numerocobranca` e limpa `numcobranca` | 4.2 |
| 11 | bTspb | Muda `dd filterfinanceiro numcobranca` | grava `numcobranca` | 4.2 |
| 12 | bTspl | Muda `dd filterfinanceiro vendedor` | grava `vendedor` | 4.2 |
| 13 | bTspn | Clique `reset filter vendedor` | limpa `vendedor` | 4.2 |
| 14 | bTspz | Muda `dd filterfinanceiro NFfornecedor` | grava `fornecedornf` — **filtra `rpg entregas`** | 4.2, 2.5 |
| 15 | bTsqE | Muda `dd filterfinanceiro numcobranca` (NF megabox) | grava `megaboxnf` | 4.2 |
| 16 | bTsqJ | Clique `reset filter nf fornecedor` | limpa `fornecedornf` | 4.2 |
| 17 | bTsqP | Clique `reset filter nf megabox` | limpa `megaboxnf` | 4.2 |
| 18 | bTsqX | Muda `dd filterfinanceiro numpedido` | grava `numpedido` — **abre a árvore** | 4.2, 3.1 |
| 19 | bTsqc | Clique `reset filter numcobranca` (nº pedido) | reseta `gp filter numeropedido` e limpa `numpedido` | 4.2 |
| 20 | bTsul | SEM_TIPO | sem evento e sem ações — morto | 4.9, 8.1 |
| 21 | bTthX | Clique `btn edita cotacao` (estado preenchido) | trava a cotação | 4.4 |
| 22 | bTthf | Clique `btn edita pedido` (estado vazio) | destrava o pedido | 4.4 |
| 23 | bTthq | Clique `btn edita cotacao` (estado vazio) | destrava a cotação | 4.4 |
| 24 | bTthx | Clique `btn edita pedido` (estado preenchido) | trava o pedido | 4.4 |
| 25 | bTtiH | Clique `btn edita orcamento` (vazio) | destrava o orçamento | 4.4 |
| 26 | bTtiO | Clique `btn edita orcamento` (preenchido) | trava o orçamento | 4.4 |
| 27 | bTtiV | Clique `btn edita entrega` (vazio) | destrava a entrega | 4.4 |
| 28 | bTtif | Clique `btn edita entrega` (preenchido) | trava a entrega | 4.4 |
| 29 | bTtim | Clique `btn edita receber` (vazio) | destrava a CR | 4.4 |
| 30 | bTtit | Clique `btn edita receber` (preenchido) | trava a CR | 4.4 |
| 31 | bTtjD | Clique `btn edita pagar` (vazio) | destrava a CP | 4.4 |
| 32 | bTtjK | Clique `btn edita pagar` (preenchido) | trava a CP | 4.4 |
| 33 | bTtjR | Clique `btn grava cotacao` | grava o vendedor da cotação e trava | 4.5 |
| 34 | bTtkR | Clique `btn grava cotacao historico` | **troca o vendedor em cascata** por orçamentos, pedido, entregas, CRs e CPs | 4.5, 7 |
| 35 | bTtlI | Clique `btn grava orçmento` | grava os campos do orçamento e agenda `CalculaFornecedoresLista` | 4.5, 6 |
| 36 | bTtlV | Clique `btn grava orçmnto historico` | idem + propaga valores às entregas e agenda `CalcularValoresListaEntregas` | 4.5, 6 |
| 37 | bUBij | Clique `copy id entrega` | copia o id da entrega (só IsDev) | 4.7 |
| 38 | bUBjC | Clique `copy id receber` (CR) | copia o id da CR (só IsDev) | 4.7 |
| 39 | bUBjP | Clique `copy id receber` (CP) | copia o id da CP (só IsDev) | 4.7 |
| 40 | bUBkV | Clique `Button C` "Gravar" (popup) | amarra a CR do id colado à entrega nos dois sentidos, reseta e fecha | 4.8 |
| 41 | bUBkp | Clique `Icon N` (fa-dollar da entrega) | abre `pop add areceber na entrega` com a entrega | 4.8 |
| 42 | bTsur | Muda `dd filterfinanceiro filialfornecedor` | grava `filialfornecedor` | 4.2 |
| 43 | bTsuw | Clique `reset filter fornecedor` (filial) | limpa `filialfornecedor` | 4.2 |
| 44 | bTtMT0 | Clique `gp card cotacao` | alterna `rpg pedidos` (todas as instâncias) | 4.3 |
| 45 | bTtMe0 | Clique `gp card pedido` | alterna `rpg orcamentos` | 4.3 |
| 46 | bTtMp0 | Clique `gp card orcamentos` | alterna `rpg entregas` | 4.3 |
| 47 | bTtMx0 | Clique `gp card entregas` | alterna `rpg areceber` e `rpg apagar` | 4.3 |
| 48 | bTvDn0 | Clique `btn grava entrega` | grava a entrega, recalcula seus totais, carimba vendedor/NF/data nas CRs e trava | 4.5, 5 |
| 49 | bTvEA0 | Clique `btn grava entrega historico` | idem + rateia a comissão entre as CRs e grava valor unitário/total | 4.5, 5 |
| 50 | bTvEZ0 | Clique `btn grava receber` | grava a CR (vencimento, valores, NF, status) e trava | 4.5 |
| 51 | bTvEr0 | Clique `btn grava pagar` | grava a CP (mesmos campos) e trava | 4.5 |
| 52 | bTvGV0 | Clique `btn grava pedido` | grava parcelas e forma de pagamento e trava | 4.5 |
| 53 | bTvGn0 | Clique `btn del receber` | **apaga a CR** e trava | 4.6, 7 |
| 54 | bTvHA0 | Clique `btn del pagar` | **apaga a CP** e trava | 4.6, 7 |
| 55 | bUCeq0 | Clique `Text AZ` ("Proposta n") | abre o arquivo da proposta em nova aba | 4.7 |
| 56 | bUCfm0 | Clique `Icon O` (cotação) | copia o id da cotação | 4.7 |
| 57 | bUCgL0 | Clique `Icon R` (pedido) | copia o id do pedido | 4.7 |
| 58 | bUCgn0 | Clique `Icon T` (orçamento) | copia o id do modelo de produto | 4.7 |

### 11.2 Reusable `tool.Historico` — 38 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTdvt | Clique `gp nome cliente` (aba 1) | alterna a tabela `rpg historico` do cliente (na prática, de todos) | 4.11, 8.3 |
| 2 | bTdwD | Clique `btn grava historico por cliente` (novo) | cria interação no cliente da linha, reseta e atualiza o espelho do cliente | 4.12 |
| 3 | bTdwV | Clique `btn edita historico por cliente` | carrega a interação no formulário da aba 1 | 4.13 |
| 4 | bTdwj | Clique `btn grava historico por cliente` (edição) | sobrescreve descrição/cliente e põe `QualVendedor = CurrentUser` | 4.13, 7 |
| 5 | bTdzL | Clique `btn grava historico individual` (novo) | cria interação na aba 2 e atualiza o espelho | 4.12 |
| 6 | bTdzW | Clique `btn grava historico individual` (edição) | sobrescreve descrição, cliente, vendedor e unidade | 4.13 |
| 7 | bTdzo | Clique `btn edita historico individual` | carrega a interação no formulário da aba 2 | 4.13 |
| 8 | bTdzv | Clique `Text D` | aba 1 ("Por cliente/fornecedor") | 4.10 |
| 9 | bTeAF | Clique `Text E` | aba 2 ("Individual") | 4.10 |
| 10 | bTeBs | Clique lixeira (aba 2) | **apaga a interação** e recalcula o espelho do cliente | 4.14, 7 |
| 11 | bTeCj | Clique lixeira (aba 1) | idem | 4.14, 7 |
| 12 | bTiqs | Clique `Icon H` | reseta a busca de cliente da aba 1 | 4.15 |
| 13 | bTirj | Clique `Icon J` | reseta a busca de cliente da aba 2 | 4.15 |
| 14 | bTjCf | Clique `Text C` | aba 3 ("Sem interação") | 4.10 |
| 15 | bTjKS | Clique `gp nome cliente` (aba 3) | alterna a tabela de histórico do cliente | 4.11 |
| 16 | bTjKZ | Clique `btn grava historico interação` (novo) | cria interação na aba 3 e atualiza o espelho | 4.12 |
| 17 | bTjKp | Clique `btn grava historico interação` (edição) | sobrescreve a interação da aba 3 | 4.13 |
| 18 | bTjLB | Clique lixeira (aba 3) | apaga a interação e recalcula o espelho | 4.14 |
| 19 | bTjLI | Clique `btn edita historico por cliente` (aba 3) | carrega a interação no formulário | 4.13 |
| 20 | bTjmt | Muda `rad tipoclifor` | volta à aba 1 e, se Fornecedor, reseta `gp vendedor` | 4.10 |
| 21 | bUEmJ | Clique `Group S` | modelo de e-mail 1 (Padrão) | 4.16 |
| 22 | bUEmU | Clique `Group UZ` | modelo 2 (Chapatex) | 4.16 |
| 23 | bUEmf | Clique `Group BZZ` | modelo 4 (Porta Palete) | 4.16 |
| 24 | bUEmn | Clique `Group CZZ` | modelo 5 (Logística Reversa) | 4.16 |
| 25 | bUEmy | Clique `Group AZZ` | modelo 3 (Palete de Plástico) | 4.16 |
| 26 | bUEnJ | Clique `Group DZZ` | modelo 6 (Palete de Metal) | 4.16 |
| 27 | bUEnR | Clique `Group GZZ` | modelo 7 (Resgate) | 4.16 |
| 28 | bUEnc | PageLoaded | `var_modeloemail_ = "1"` (não inicializa a aba) | 4.10, 4.16, 8.3 |
| 29 | bUErd | Muda `Dropdown H` ("Email padrão") | grava `EmailPrincipal` no **primeiro** contato do grupo + toast | 4.16, 8.3 |
| 30 | bUEcf0 | Clique `Icon T` (bloco Emails) | reseta a busca de cliente | 4.15 |
| 31 | bUEcp0 | Clique `gp nome cliente` (bloco Emails) | sem ações — morto | 8.1 |
| 32 | bUEgZ0 | Clique `Button B` "Histórico" | alterna os blocos Histórico/Email | 4.17 |
| 33 | bUEgm0 | Clique `Button Email` | alterna os blocos Histórico/Email | 4.17 |
| 34 | bUEgz0 | Clique `Button D` "Enviar email" | agenda `EnviarEmailsGeral`, cria interação com o corpo do e-mail, carimba `UltimoHistoricoData`, toast | 4.16, 6, 7 |
| 35 | bUEhK0 | Clique `icon email` (linha) | grava `id_clifor_` = cliente da linha | 4.16 |
| 36 | bUEhb0 | Clique `Button E` "Voltar para vendas" | vai para a página `vendas` | 4.17 |
| 37 | bUEiY0 | Clique `Button A` "Histórico ↗" | abre a página `historico_full` | 4.17, 1.3 |
| 38 | bUEir0 | Clique `gp cliente` | grava `id_clifor_` = cliente da linha | 4.16 |

**Total: 58 + 38 = 96 workflows cobertos.** `historico_full` tem 0 workflows (nada a cobrir).
