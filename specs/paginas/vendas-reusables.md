# Spec funcional — reusables operacionais do fluxo de vendas

Fonte: `mapa/reusable-pop.AnexaNf.md` (bTbua — 59 elementos · 9 workflows · 24 ações · 50 condicionais · 1 popup · 5 HTML),
`mapa/reusable-pop.AddEdita_Produtos.md` (bTiZh — 28 elementos · 6 workflows · 17 ações · 20 condicionais · 1 estado customizado),
`mapa/reusable-pop.DuplicarPedido.md` (bUAJN — 229 elementos · 10 workflows · 24 ações · 43 condicionais · 4 tabelas).
Total coberto: **316 elementos · 25 workflows · 65 ações · 113 condicionais**.
Apoio: `mapa/data-types.md` (`Tbl.Entregas` 41 campos, `Tbl.Pedido` 28, `Tbl.OrcFornecedoresCotacao` 31,
`Tbl.CotacaoProdutos` 10, `Tbl.Cotacao` 13, `Tbl.IcmsEstados`, `User`), `mapa/option-sets.md`
(`Opt.Etapas`, `Opt.EmpresaMegabox`, `Opt.TipoFrete`, `Opt.ProdutosCondicao`, `Opt.ProdutosLinhas`,
`Opt.ParcelasReceber`, `opt.RegimeTributario`), `mapa/backend-workflows.md`
(`CalculaFornecedoresLista` bTPFh, `AdicionarFornecedores` bTNrd, `VicularOcamentoCopiaAoProdutoCopia` bUAeU,
`AtribuirVendedorSubstituto` bUBpN), `mapa/integracoes.md`, e os hospedeiros `mapa/pagina-vendas.md` e
`mapa/pagina-financeiro.md`.

**Se esta spec e o mapa discordarem, o mapa manda.**

Esta spec complementa `specs/paginas/vendas.md` e **não a repete**: kanban, filtros, cotação, carrinho, propostas,
pedido, confirmação de entrega, cancelamento e os cálculos do pedido estão lá (§4.1 a §4.10, §5). O que o hospedeiro
faz para abrir cada um destes três reusables está em `vendas.md` §4.6 (WFs bTicz, bTigA, bUAdY) e §4.7 (AnexaNf).
A agenda de endereços que o `DuplicarPedido` abre (WF bUAMz) está em `specs/paginas/enderecos-e-contatos.md`.
Aqui está só o que estes três reusables fazem por dentro.

Glossário e nomes de campo que o decompilador deriva do id (ler antes da §4 e §5):

- **Entrega** = `Tbl.Entregas` (`tbl_entregas`); **orçamento** = `Tbl.OrcFornecedoresCotacao`
  (`tbl_orcamentfornecedores`, uma linha por fornecedor candidato de um item); **item** = `Tbl.CotacaoProdutos`
  (`tbl_orcamentoprodutos`); **cotação** = `Tbl.Cotacao` (`tbl_orcamento`).
- Em `Tbl.OrcFornecedoresCotacao`, o mapa dos workflows imprime **nomes de campos já renomeados/excluídos**:
  - `cpo.TotalBonusExtra - deleted` → é `cpo_tributos_number` = **`cpo.TributosICMS`** (alíquota de ICMS, fração);
  - `cpo.TotalComissaoVendedor` → é `cpo_tributopiscofinsb_number` = **`cpo.TributoPISCOFINS`** (alíquota
    PIS/COFINS, fração — o `0.0925` gravado é 9,25%);
  - `cpo.valorcomissao` → é `cpo_valorcomissao_number` = **`cpo.ValorComissaoUnit`** (comissão **unitária**);
  - `cpo.ValorVendaUnit` = `cpo_valorvenda_number`.
  A confirmação vem de `CalculaFornecedoresLista` (bTPFh), que usa `TotalBonusExtra - deleted` como multiplicador do
  ICMS e `TotalComissaoVendedor` como multiplicador do PIS/COFINS (§5.1). O mesmo apontamento está em
  `specs/paginas/financeiro-reusables.md` [DÚVIDA 21] — **aqui a leitura é a inversa**: os campos existem, com outros
  nomes, e os cálculos **não** são zero. Ver §10.1.
- Em `Tbl.Entregas`: `cpo.DataEntrega` = `cpo_dataentrega_date` = **data prevista** (`cpo.DtPrevEntrega`);
  `cpo.DtEntrega` = `cpo_dtentrega_date` = data real. A regra do vendedor substituto usa a **prevista**.
- Dois campos de lista com grafias diferentes para a mesma ideia, e os dois com erro de digitação:
  `Tbl.Pedido.cpo.QuaisOrcamentosFonecedores` e `Tbl.CotacaoProdutos.cpo.QuaisOrcamentosForncededores`.
- Inversão nas tabelas de produto: `Tbl.ProdutosGrupo` tem id `tbl_produtossubgrupo` e `Tbl.ProdutosTipo` tem id
  `tbl_produtosgrupo`. O dropdown "Tipo Produto" do `AddEdita Produtos` grava em `QualProdutoGrupo`.

---

## 1. Propósito e quem usa

| Reusable | Papel | Quem abre / de onde |
|---|---|---|
| `pop.AnexaNf` (bTbua) | Diálogo operacional de **uma entrega**: número, data e arquivo da NF do fornecedor, até 4 boletos, "fornecedor não emite NF", o interruptor **"Saiu para entrega"** (que move a entrega entre as etapas `Pedido` ↔ `Em Entrega`), o envio/reenvio de NF+boleto por e-mail ao cliente, e o motivo de cancelamento quando a entrega está cancelada. **Ele traz o próprio gatilho** (o grupo `botao anexa nf`, com os ícones de caminhão), então o hospedeiro só o coloca na célula da tabela. | Dois hospedeiros: `pagina-vendas` — `tool.AnexaNf A` (bTbvn), dentro da tabela de entregas do popup de pedido, `data_source = Ancestor[TableCrossAxis]` (a entrega da linha); `pagina-financeiro` — `pop.AnexaNf A` (bUEqi0), na linha de conta a receber, `data_source = Ancestor[TableCrossAxis]:cpo.QualEntrega`. O reusable **muda de comportamento** conforme `Page.Current Page Name` (§2.1). |
| `pop.AddEdita Produtos` (bTiZh) | Diálogo de **um item de um pedido já existente**: escolhe tipo de produto, produto, condição, linha, quantidade e medida. Em modo *adicionar*, cria o item **e** o orçamento vencedor e dispara a criação dos orçamentos por origem; em modo *editar*, grava o item e a quantidade do orçamento e manda recalcular. Também é a porta para o cadastro de produtos. | `pagina-vendas`, instância `pop.AddEdita Produtos A` (bTicE), dentro do popup de itens do pedido: WF **bTicz** ("Novo Produto" — `ShowElement` + `SetCustomState var_qualpedido_ = Parent`) e WF **bTigA** (lápis — `DisplayGroupData` com o orçamento da linha + `ShowElement`). Ver `vendas.md` §4.6. |
| `pop.DuplicarPedido` (bUAJN) | Assistente de 3 passos para **duplicar um pedido como nova cotação**: escolhe o cliente e o endereço de entrega de destino, marca quais itens do pedido original entram, e grava — copiando itens e orçamentos vencedores e criando uma `Tbl.Cotacao` nova pelo backend `bUAeU`. | `pagina-vendas`, instância `pop.DuplicarPedido A` (bUAdS), WF **bUAdY** (`ShowElement` + `DisplayGroupData` com o pedido do cartão). **O ícone que dispara bUAdY (`Icon GZZZ`) nunca fica visível** (`vendas.md` §4.6 e §8.1): na produção este diálogo está inalcançável pela interface. |

Perfis: `Opt.PerfilUsuario` = Diretor (hierarquia 1), Gerente (2), Analista (3), Operador (4). Usam estes diálogos
vendedores e o Financeiro; `DuplicarPedido` é um atalho comercial do vendedor.

### Controle de acesso de fato (só no navegador)

Nenhum destes reusables verifica nada no servidor. Tudo é condicional de elemento, e há uma única menção a perfil:

1. **`botao anexa nf` (bTmJL0)** — a **única** trava de perfil dos três reusables:
   - `This:get_group_data:cpo.StatusEntrega = Financeiro AND CurrentUser:cpo.QualPerfil:hierarquia > 1` →
     `button_disabled=True`. Isto é: depois de a entrega entrar no Financeiro, **só o Diretor** reabre o diálogo.
   - `Parent:cpo.StatusEntrega = Financeiro AND Page.Current Page Name = "financeiro"` → `button_disabled=False`.
     Na página `financeiro` a trava acima é **anulada para qualquer perfil**.
   - Duas leituras do mesmo dado (`This:get_group_data` e `Parent`) na mesma lista de condicionais (§8.3).
   Botão desabilitado no Bubble só impede o clique; o workflow de gravação (bTcRH/bTcZR/bUErF0) não reconfere nada.
2. **`gp grava naocancelado` (bTcAO)** aparece quando `StatusEntrega ≠ Cancelado AND Page.Current Page Name ≠ "financeiro"`;
   **`gp grava financeiro` (bUEqo0)** quando `StatusEntrega ≠ Cancelado AND Page.Current Page Name = "financeiro"`;
   **`gp grava cancelado` (bTcoc)** quando `StatusEntrega = Cancelado`. O nome da página é a única chave de contexto.
3. **`gp envia arquivos segunda vez copy` (bTiFp0)** — o "Fornecedor não emite nota fiscal" — só aparece quando
   `Page.Current Page Name ≠ "financeiro"`. Na página `financeiro` o campo existe no DOM e continua sendo gravado
   por bTcRH/bTcZR, mas não por bUErF0 (§4.3).
4. Os botões **Gravar** ficam `button_disabled=True` até alguma condicional de "sujo" bater (8 condicionais em cada
   variante, §2.1). É controle de UI, não de permissão.
5. No `AddEdita Produtos` e no `DuplicarPedido`: **nenhuma** condicional de perfil. Qualquer usuário logado adiciona
   item a qualquer pedido e duplica qualquer pedido de qualquer vendedor.
6. No `DuplicarPedido`, a seleção de itens é gravada em **`User.cpo.TempOrcamentoProdutos`** — o mesmo campo que o
   carrinho da cotação nova usa (`vendas.md` §8.3). Ver §8.3 aqui.
7. As tabelas envolvidas (`Tbl.Entregas`, `Tbl.OrcFornecedoresCotacao`, `Tbl.CotacaoProdutos`, `Tbl.Pedido`) têm
   regra `everyone` com `view_all/search_for` liberado e regra `auto binding` para qualquer logado; `Tbl.Cotacao`
   não tem regra nenhuma. Detalhe e consequências em `specs/00-achados-de-seguranca.md` §2.2 e §2.3 e na §7 daqui.

---

## 2. Estrutura

### 2.1 `pop.AnexaNf` (bTbua)

**Contrato de entrada:** o hospedeiro só coloca a instância na tela com `data_source` apontando para **um
`Tbl.Entregas`** — em `vendas` `Ancestor[TableCrossAxis]` (a entrega da linha, bTbvn), em `financeiro`
`Ancestor[TableCrossAxis]:cpo.QualEntrega` (bUEqi0). **Não há parâmetro de URL, nem estado customizado (0), nem
`ShowElement` do hospedeiro:** o próprio reusable expõe o gatilho `botao anexa nf` (bTmJL0) e o WF **bTbux** faz
`ToggleElement` no popup `GroupFocus A` (bTbuf). Todo grupo de primeiro nível é `group_type="custom.tbl_entregas"`
com `data_source: Parent`. A segunda entrada, implícita e frágil, é **`Page.Current Page Name`** (§1, item 2).

**O que grava** (detalhe na §4): só `Tbl.Entregas` — `NumNfFornecedor`, `DtEmissaoNf`, `ArquivoNfFornecedor`,
`BoletoArquivos`, `NaoEmiteNF`, `NotaBoletoEnviada`, `SaiuEntrega`, `StatusEntrega`, `MotivoCancelamento`,
`QualVendedorSubstituto`. Não grava em `Tbl.Pedido` nem no orçamento, e não dispara recálculo de valores.

**Layout, de cima para baixo (dentro de `GroupFocus A`, título "Informações de entrega"):**

| Bloco | Elementos | Conteúdo |
|---|---|---|
| Corpo normal | `Group I` (bTcnr) — visível só quando `StatusEntrega ≠ Cancelado` | tudo o que segue |
| Fornecedor não emite NF | `gp envia arquivos segunda vez copy` (bTiFp0), oculto ao carregar, visível quando página ≠ `financeiro` | checkbox `tgg nao emite nf` (bTiFr0, ligado a `Entrega.NaoEmiteNF`) + "Fornecedor não emite nota fiscal". Marcado, **desobriga e desabilita** número da NF, data da NF e upload da NF (3 condicionais) |
| NF do fornecedor | `Group N` / `Group M` (bTefV / bTefH) | `ipt numero nf` (bTbvK, obrigatório, `content = Entrega.NumNfFornecedor`) e `ipt data nf` (bTcZP, obrigatório, `DateInput`, `content = Entrega.DtEmissaoNf`) |
| Alerta de NF repetida | `alerta nf repetida` (bTeZN) | "* Já existe NF com esse número para esse fornecedor" — busca ao vivo, **só avisa, não bloqueia** (§3, §4.2) |
| Anexo da NF | `gp anexa nota` (bTbwf) → `gp upfnota` (bTbzp) | `upf anexanota` (bTbvE, `FileInput`, obrigatório, `max_size=5` MB, `src = Entrega.ArquivoNfFornecedor`); o rótulo `Text A` troca para "Arquivo NF ⟳" durante o upload; ícone `btn abrir nota` (bTepP, `open_in_new`, desabilitado sem arquivo) → WF bTepV |
| Boletos | `Group O` / `Group S` / `Group L` (bTefg / bTfTt / bTeVq) | `upf boletos` (bTiDt0, plugin `multifileupload`, `max_files=4`, `initial = Entrega.BoletoArquivos`) e o aviso `Group U` (bTiPf): "Forma de pgto combinada: {Entrega.QualPedido.PrazoRecebComissoes:display}" (lista de `Opt.ParcelasReceber`) |
| Envio ao cliente | `Group P` (bTefr) → `gp envia arquivos primeira vez` (bTegK) / `gp envia arquivos segunda vez` (bTiEj0) | alternam por `Entrega.NotaBoletoEnviada`: falso → `tgg envianota primeiravez` (bTeWb, ligado a `NotaBoletoEnviada`) "Envia nota fiscal e/ou boleto para o cliente"; verdadeiro → `tgg envianota segundavez` (bTiEo0, **sem vínculo dinâmico**) "Re-envia nota fiscal e/ou boleto para o cliente" |
| Saiu para entrega | `Group E` (bTcAr), escondido quando `StatusEntrega` é `Financeiro`, `Concluído` ou `Cancelado` | `tgg saiuentrega` (bTcRd, `Plugin[1680110374647x249108010620944400]/AAC` — interruptor de terceiro; estado inicial `AAD = Entrega.SaiuEntrega`, leitura `get_AAI`) + "Saiu para entrega" |
| Cancelamento | `Group J` (bTcoE), visível só quando `StatusEntrega = Cancelado` | "Motivo cancelamento" + `ipt motivocancela` (bTcoK, `content = Entrega.MotivoCancelamento`) |
| Rodapé A (fora do financeiro) | `gp grava naocancelado` (bTcAO) | `Button Gravar não cancelado` (bTbvQ) → WFs bTcRH / bTcZR; `Button Cancela naocancelado` (bTcAI) → WF bTcBK |
| Rodapé B (no financeiro) | `gp grava financeiro` (bUEqo0) | `Button Gravar financeiro` (bUEqt0) e `Button Cancela naocancelado` (bUEqu0). **O WF de gravação (bUErF0) está no grupo, não no botão**, e o botão de cancelar **não tem workflow nenhum** (§8.1, §10.4) |
| Rodapé C (cancelada) | `gp grava cancelado` (bTcoc) | `Button Gravarcancelado` (bTcoh) → WF bTcon; `Button Cancela cancelado` (bTcoi) → WF bTcrF |
| Gatilho | `botao anexa nf` (bTmJL0), **fora** do popup | os 5 blocos HTML + `Icon C` (bTmJF0) |

**As 8 condicionais de "está sujo"** (idênticas em `Button Gravar não cancelado` bTbvQ e `Button Gravar financeiro`
bUEqt0 — duplicação, §8.2). Qualquer uma delas habilita o botão:

1. `NotaBoletoEnviada = true AND tgg envianota segundavez` → cor **primária** (caminho de reenvio);
2. `NotaBoletoEnviada = false AND tgg envianota primeiravez` → cor **primária**;
3. `Entrega.ArquivoNfFornecedor:url ≠ upf anexanota:get_data`;
4. `Entrega.NumNfFornecedor ≠ ipt numero nf:get_data`;
5. `Entrega.SaiuEntrega = true AND tgg saiuentrega:get_AAI = false`;
6. `Entrega.SaiuEntrega = false AND tgg saiuentrega:get_AAI = true`;
7. `Entrega.BoletoArquivos:count ≠ upf boletos:get_data:count` (compara **contagem**, não conteúdo);
8. `Entrega.MotivoCancelamento ≠ ipt motivocancela:get_data`.

`Button Gravarcancelado` (bTcoh) tem só a condicional 8. Consequência: **mudar só a data de emissão da NF não
habilita o botão** — não existe condicional comparando `DtEmissaoNf` com `ipt data nf` ([DÚVIDA 10.3]).

**Os 5 blocos HTML** — todos dentro de `botao anexa nf`; são os ícones de caminhão da linha/cartão:

| # | Elemento | Onde | O que faz |
|---|---|---|---|
| 1 | `HTML D` (bTcnb), 52 car., **oculto ao carregar e sem condicional que o mostre** | direto em `botao anexa nf` | o mapa não preserva o conteúdo; pelo tamanho é um `<style>`/`<div>` de apoio. Nunca é exibido → código morto (§8.1, [DÚVIDA 10.9]) |
| 2 | `btn fumacinha` (bTbvW), 201 car. | `gp caminhaonormal` (bTcmH0) | SVG de três traços (a "fumacinha" do escapamento) ao lado do caminhão. A condicional `SaiuEntrega = true AND StatusEntrega ≠ Cancelado` troca o SVG por um idêntico com `fill="#108f66"` (verde) |
| 3 | `btn show enderecos` (bTbub), 576 car. | `gp caminhaonormal` (bTcmH0) | SVG do **caminhão** — é o botão que o usuário clica para abrir o diálogo (WF bTbux). Mesma condicional de cor |
| 4 | `btn fumacinha` (bTcnC0), 201 car. | `gp caminhaoinvertido` (bTcmx0, visível só quando `StatusEntrega = Cancelado`) | cópia do #2 **sem** as condicionais de cor |
| 5 | `btn show enderecos` (bTcnD0), 576 car. | `gp caminhaoinvertido` (bTcmx0, `unique_id="caminhao"`) | cópia do #3 **sem** as condicionais de cor — o caminhão da entrega cancelada |

`gp caminhaonormal` aparece quando `StatusEntrega` é `Pedir`, `Em Entrega` ou `Pedido`. Em `Financeiro` nenhum dos
dois grupos de caminhão aparece: entra `Icon C` (bTmJF0) — `thumb_up`, que na página `financeiro` troca para
`attach_file` na cor primária. Em `Concluído` **nada** é renderizado ([DÚVIDA 10.8]). A cor `#108f66` está embutida no
SVG, fora dos tokens do tema (§8.3).

### 2.2 `pop.AddEdita Produtos` (bTiZh)

**Contrato de entrada — dois canais, usados em modos diferentes:**

| Canal | Quem preenche | Conteúdo | Serve para |
|---|---|---|---|
| Estado customizado **`var_qualpedido_`** : `Tbl.Pedido` | WF bTicz do hospedeiro, ação bTidH (`SetCustomState`, `value = Parent`) | o **pedido** em edição | modo *adicionar*: origem/destino/cobrança/fornecedor do novo orçamento e a lista `QuaisOrcamentosFonecedores` (bTicQ, bTicR, bTicX, bTieH) |
| `data_source` do reusable (`DisplayGroupData`) | WF bTigA do hospedeiro, ação bTigG (`data_source = Ancestor[TableCrossAxis]`) | **um `Tbl.OrcFornecedoresCotacao`** (a linha do item clicada) | modo *editar*: `Parent:cpo.QualCotacaoProduto` é o item e `El[Reusable …]:get_group_data` é o orçamento (bTibU, bTigL, bTibZ) |

O grupo raiz `Group A` (bTiZj) e os grupos `Group B` (bTiZv) e `Group C` (bTiaR) têm
`data_source = Parent:cpo.QualCotacaoProduto` com `group_type="custom.tbl_orcamentoprodutos"`. Dentro deles, `Parent`
é o **item da cotação**. Logo **`Parent:is_empty` é o modo adicionar** e `Parent:is_not_empty` o modo editar.
Quem abre em modo adicionar (bTicz) **não** faz `DisplayGroupData` — `var_qualpedido_` é a única fonte. Quem abre em
modo editar (bTigA) **não** define `var_qualpedido_`, e não precisa, porque bTibP não o lê.

**O que grava:** `Tbl.CotacaoProdutos` (cria em bTicQ; altera `Condicao`, `Linha`, `Medida`, `qtd`,
`QualProdutoGrupo`, `QualProduto` em bTibU), `Tbl.OrcFornecedoresCotacao` (cria em bTicR, completa as alíquotas em
bTiea, altera **só** `QtdVenda` em bTigL) e `Tbl.Pedido.QuaisOrcamentosFonecedores` (bTicX). **Não** grava em
`Tbl.Cotacao` ([DÚVIDA 10.6]). Dispara os backends `CalculaFornecedoresLista` (bTPFh) e `AdicionarFornecedores` (bTNrd).

**Layout:**

| Bloco | Elementos | Conteúdo |
|---|---|---|
| Título | `Text A` (bTiZo) | padrão "Novo Produto"; `Parent:is_empty` → "Adicionar produto ao pedido"; `Parent:is_not_empty` → "Edita produto do pedido". O padrão nunca deveria aparecer (§8.1) |
| Atalho de cadastro | `Group A` (bTiZp) + `Image abre cadastro produtos` (bTiZt, ícone de palete no CDN do Bubble) | abre `pop.CadastroProdutos A` (bTicJ) — **dois** workflows fazem isso: bTiax (na imagem) e bTigj (no grupo que a contém) (§8.2) |
| Linha 1 | `Group B` (bTiZv) | `dd add grupo produto` (bTiaF, "Tipo Produto", `Search(Tbl.ProdutosGrupo; sort NomeGrupo)`, `default = Item.QualProdutoGrupo`); `dd add modelo produto` (bTiaL, "Produto", `Search(Tbl.ProdutosModelo: QualGrupoProduto = grupo escolhido AND Ativo = True; sort NomeModelo)`, `default = Item.QualProduto`); `Icon edita produto` (bTiaM) → WF bTibH |
| Linha 2 | `Group C` (bTiaR) | `dd add condicao` (bTiaX, opções = `Produto.QuaisCondicoes`, `default = Item.Condicao`); `dd add linha` (bTiae, opções = `Produto.QuaisLinhas`, `default = Item.Linha`, + condicional **`condicao = Usado` → `default = Opt.ProdutosLinhas.Usado`**); `ip add qtd` (bTiak, `int_number`, `content = Item.qtd`); `ip add medida` (bTiaq, "Medida, descrição ou obs.", `content = Item.Medida`) — **os 5 obrigatórios** |
| Ação | `Icon add produto` (bTiav, carrinho) visível quando `Parent:is_empty`; `Icon salvar produto` (bTiar, disquete) visível quando `Parent:is_not_empty` | WF bTibg / WF bTibP |

Não há botão de fechar nem de cancelar: sai-se pelo `Esc`/clique fora e o WF **bTigv** (`PopupClosed`) reseta o grupo.
Das 20 condicionais, 13 são hover/foco/validação dos 4 dropdowns e 2 inputs; as que importam são as 2 do título,
a de "Usado" e as 4 de visibilidade dos ícones de ação.

### 2.3 `pop.DuplicarPedido` (bUAJN)

**Contrato de entrada:** `ShowElement` + `DisplayGroupData` com **um `Tbl.Pedido`** (hospedeiro `vendas`, WF bUAdY,
ações bUAde / bUAdj). Prova pelo mapa: `Group C` (bUAXY) é `group_type="custom.tbl_pedidos"` com `data_source: Parent`,
e `Group A` (bUAJP) é `data_source: Parent:cpo.QualCotacao` (`custom.tbl_orcamento`) — `Parent` é o pedido, a cotação
vem dele. **Nenhum estado customizado (0)** e nenhum parâmetro de URL. A seleção de itens vive em
**`User.cpo.TempOrcamentoProdutos`** (lista de `Tbl.CotacaoProdutos`), não em estado de tela: persiste entre sessões e
abas e é o mesmo campo do carrinho da cotação nova (§8.3).

**O que grava:** cópias de `Tbl.CotacaoProdutos` e de `Tbl.OrcFornecedoresCotacao` (bUAem / bUAer),
`User.TempOrcamentoProdutos` (bUAaR / bUAaY, limpo em bUAfz) e — via backend `bUAeU` — o vínculo item↔orçamento e uma
**`Tbl.Cotacao` nova**. Os WFs bUAVr / bUAVy escreveriam `Vencedor` no orçamento **do pedido original** e bUAUk zeraria
o `ValorFrete` dele; os três estão inalcançáveis (§8.1).

**Layout, de cima para baixo:**

| Bloco | Elementos | Conteúdo |
|---|---|---|
| Cabeçalho | `Group D` (bUAbC) + `g Input` (bUAKb) | "Duplicar Pedido" / "Siga as orientações ao lado"; `ip num orcamento copiar` (bUAKd, **desabilitado**) mostra `Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1)` — número apenas ilustrativo (§5.4) |
| Cliente e destino | `Group A` (bUAKi) | foto do cliente (`Image A` bUAKu, placeholder do svgrepo.com quando vazia); `ipt buscacliente copiar` (bUAKo, `AutocompleteDropdown` em `Tbl.GrupoCliFor` com `QualTipoCliFor = Cliente AND Ativo = True`, `ac_list_max=25`, `allow_not_in_list=True`); `dd enderecoentregacliente copiar` (bUALB, endereços do cliente escolhido); `Icon A` (bUALF, desabilitado sem cliente) → WF **bUAMz**, que abre `pop.AgendaEnderecos A` (bUAYg) com o cliente no estado `var_qualgrupoclifor_` |
| Empresa e datas | `Group A` (bUALG) | `rd empresa megabox copiar` (bUALT, `All(Opt.EmpresaMegabox)`, default `Megabox`) e a logo correspondente (`Image A` bUALX, **URLs de CDN chumbadas na condicional**, uma com querystring de analytics); `ip data orcamento copiar` (bUALd, hoje, desabilitado); `ip data validade copiar` (bUALM, **hoje + 2 dias**, obrigatório); `ip vendedor copiar` (bUALS, nome do usuário logado, desabilitado) |
| Orientações | `gp add produto` (bUAJT) | os 3 passos numerados ("Selecione o cliente", "Escolha os produtos", "Revisão e ajustes") e o aviso `Text J` (bUAdG): **"O pedido será criado na etapa PROPOSTA. Será necessário enviar a proposta para o cliente aceitar."** — o backend cria na etapa **Cotação** (§4.7, [DÚVIDA 10.2]) |
| Tabela de itens | `rpg produto duplicar` (bUANK), `data_source = Pedido.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto` | uma linha por item; colunas Produto/Fornecedor, QTD e a caixa de seleção |
| Sub-tabela do produto | `tbl nome produto duplicar` (bUAPO) | nome, condição/linha/medida, ícone do tipo de produto, `indica fornecedores` (bUAPf) e `indica vencedor` (bUAPg, troféu com o nome do fornecedor vencedor no `title`); mais 10 inputs de resumo (bruto, comissão, líquido, unitário, comissão unit., tipo de frete, frete, PIS/COFINS), **todos desabilitados e todos escondidos quando a sub-tabela de fornecedores está aberta** |
| Sub-tabela de fornecedores | `rpg fornecedorescotacao duplicar` (bUANL), `data_source = Item.QuaisOrcamentosForncededores:filtered(Vencedor = True)` | a linha do orçamento **vencedor**: fornecedor + UF + regime tributário (com o alerta "Falta regime tributário"), `ip valorvenda copiar`, `ip valorcomissao copiar`, `dd tipofrete copiar`, `ip valorfrete copiar`, `ip icms copiar`, `ip piscofins copiar` — **todos `auto_binding: True` e todos `disabled=True`** (§7) — mais `ipt calculotributo copiar` (bUAOS, `ValorPISCOFINS + ValorICMS`), os totais e o troféu `Icon B` (bUAOq, `button_disabled=True` sem nenhuma condicional que habilite) |
| Cabeçalho da tabela | `Table A` (bUARq), **`group_type="option.opt_a__oclifor"`** (`Opt.AçãoCliFor` — tipo errado, sobra de outra tela) | rótulos "Produto / Fornecedor", "Produto Unit.", "Comissão Unit.", "Tipo Frete", "Valor Frete", "Aliq. ICMS", "Aliq. PISCOFINS", "Total Tributos", "Total Bruto", "Total Comiss.", "Total Líq", mais `txt titulo icms` / `txt titulo piscofins` (ocultos, alternados por bUAWJ / bUAWh) e `btn abrir todos` (bUASm, **oculto ao carregar e sem condicional** → morto) |
| Seleção | `btn seleciona produto` (bUARe) | `check_box_outline_blank` → `check_box` quando `CurrentUser.TempOrcamentoProdutos:contains(item)`; o `title` diz "Destino desse produto" (rótulo errado). `Input qtd copiar` (bUARS) é `auto_binding` em `cpo_qtd_number` mas `disabled=True` |
| Valor mínimo | `ip valorminimo` (bUAOv), oculto | `El[rpg fornecedorescotacao duplicar]:get_list_data:cpo.ValorVendaLiquido:min` — input escondido usado como variável para pintar o menor líquido de verde (§8.3) |
| Rodapé | `Group C` (bUAXY) | `btn gravarcotacao` (bUAXd, "Duplicar Pedido") → WF **bTzte**, desabilitado enquanto `cliente vazio OR endereço vazio OR TempOrcamentoProdutos:count < 1`; `btn cancelacotacao` (bUAXf) → WF **bUAgB** |
| Reusables aninhados | bUAYg, bUAYm | `pop.AgendaEnderecos` (WF bUAMz) e `pop.CadastroProdutos` — este **nunca é aberto por nenhum workflow deste reusable** → morto (§8.1) |

As 4 tabelas do inventário são `rpg produto duplicar` (bUANK), `tbl nome produto duplicar` (bUAPO),
`rpg fornecedorescotacao duplicar` (bUANL) e `Table A` (bUARq).

---

## 3. Dados

Buscas e listas, em linguagem de negócio, com o elemento que as faz:

| # | Elemento | Em negócio | Expressão |
|---|---|---|---|
| 1 | `alerta nf repetida` (bTeZN) — 2 condicionais | "esse fornecedor já tem uma entrega com esse mesmo número de NF?" | `Search(Tbl.Entregas: QualFornecedor = Entrega.QualFornecedor AND NumNfFornecedor = ipt numero nf AND StatusEntrega ≠ Cancelado AND _id ≠ Entrega._id AND QualOrcamentoFornecedor ≠ Entrega.QualOrcamentoFornecedor):count ≥ 1`. Roda **no navegador, a cada digitação**, varrendo `Tbl.Entregas` inteira. A última restrição exclui de propósito as entregas do **mesmo** orçamento — uma NF só pode se repetir entre entregas parceladas da mesma linha de pedido |
| 2 | `upf boletos` (bTiDt0) | "boletos já anexados nesta entrega" | `initial = Entrega.BoletoArquivos` (lista de arquivos, máx. 4) |
| 3 | `Text L` (bTiPT) | "forma de pagamento combinada com o cliente" | `Entrega.QualPedido.PrazoRecebComissoes:display` — lista de `Opt.ParcelasReceber` |
| 4 | `dd add grupo produto` (bTiaF) | "tipos de produto cadastrados" | `Search(Tbl.ProdutosGrupo; sort NomeGrupo)` (tabela `tbl_produtossubgrupo`) |
| 5 | `dd add modelo produto` (bTiaL) | "produtos ativos daquele tipo" | `Search(Tbl.ProdutosModelo: QualGrupoProduto = grupo escolhido AND Ativo = True; sort NomeModelo)` |
| 6 | `dd add condicao` (bTiaX) | "condições que aquele produto aceita" | `Produto.QuaisCondicoes` (`Opt.ProdutosCondicao`: Novo, Usado, Seminovo) |
| 7 | `dd add linha` (bTiae) | "linhas que aquele produto aceita" | `Produto.QuaisLinhas` (`Opt.ProdutosLinhas`: Primeira, Segunda, Terceira, Usado) |
| 8 | busca de ICMS em bTiea | "alíquota de ICMS da UF de origem para a UF de destino" | `Search(Tbl.IcmsEstados):filtered(Destino = orçamento.QualEnderecoDestino.QualUfOpt AND Origem = orçamento.QualEnderecoOrigem.QualUfOpt):first_element:cpo.AliquotaIcms`. **`Search` sem restrição + `:filtered` no navegador**: baixa a tabela toda e filtra no cliente (§8.4) |
| 9 | `ipt buscacliente copiar` (bUAKo) | "clientes ativos, por nome" | `Search(Tbl.GrupoCliFor: QualTipoCliFor = Cliente AND Ativo = True; sort NomeCliFor)`, campo de busca `cpo_nomecliente_text`, até 25 sugestões, aceita valor fora da lista |
| 10 | `dd enderecoentregacliente copiar` (bUALB) | "endereços do cliente escolhido" | `Search(Tbl.EnderecosCliFor: QualGrupoCliFor = cliente escolhido)` — exibe `NOME - endereço - Município/UF`. **Não filtra endereço de entrega nem bloqueado** ([DÚVIDA 10.11]) |
| 11 | `rd empresa megabox copiar` (bUALT) | "empresa emissora" | `All(Opt.EmpresaMegabox)`: Megabox / Paletes Brasil |
| 12 | `ip num orcamento copiar` (bUAKd) | "próximo número de cotação" | `Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1)` — traz **todas** as cotações só para ler o último número |
| 13 | `rpg produto duplicar` (bUANK) | "itens do pedido que está sendo duplicado" | `Pedido.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto`. Vem pela lista de orçamentos do pedido, então **um item com mais de um orçamento aparece repetido** ([DÚVIDA 10.12]) |
| 14 | `rpg fornecedorescotacao duplicar` (bUANL) | "o fornecedor vencedor daquele item" | `Item.QuaisOrcamentosForncededores:filtered(Vencedor = True)` |
| 15 | `indica fornecedores` (bUAPf) | rótulo "Qtd de fornecedores dessa cotação" | `El[rpg fornecedorescotacao duplicar]:get_list_data:count` — mas a tabela já está filtrada por `Vencedor = True`, então **o número é sempre 0 ou 1** (§8.1) |
| 16 | `indica vencedor` (bUAPg) | "quem venceu a cotação daquele item" | `Item.QuaisOrcamentosForncededores:filtered(Vencedor = True):first_element:QualFornecedor:NomeCliFor` — **mesma busca do #14, repetida** em 2 condicionais e no `title` (§8.2) |
| 17 | `ip valorminimo` (bUAOv) | "menor valor líquido entre os orçamentos listados" | `rpg fornecedorescotacao duplicar:get_list_data:ValorVendaLiquido:min` — com a tabela filtrada pelo vencedor, é o próprio valor do vencedor |
| 18 | `Image A` (bUAKu) | foto do cliente escolhido | `ipt buscacliente copiar:get_data:cpo.Foto`; 2 condicionais caem num SVG de `svgrepo.com` (domínio externo, §7) |

O `AnexaNf` também lê, sem busca, a cadeia `Entrega.QualPedido.EmailCliente.Email` /
`.NomeContato` (destinatário do e-mail), `Entrega.QualPedido.NumeroPedido`,
`Entrega.QualOrcamentoFornecedor.QualCotacaoProduto.QualProduto.NomeModelo` e
`Entrega.QualOrcamentoFornecedor.QtdVenda` (corpo do e-mail), e `CurrentUser:email`,
`CurrentUser.NomeModelo`, `CurrentUser.CopiaPedido` (remetente, cópia e cópia oculta).

---

## 4. Funcionalidades e regras de negócio

### 4.1 Abrir e fechar o diálogo de entrega (`AnexaNf`)

- **Abrir/fechar**: WF **bTbux** (clique em `botao anexa nf`) → `ToggleElement` (bTbuy) em `GroupFocus A`. É um
  *toggle*: o mesmo clique fecha. A trava de perfil está na condicional do grupo (§1).
- **Cancelar (entrega não cancelada)**: WF **bTcBK** → `HideElement` (bTcBQ) + `ResetGroup` (bTcQP). Descarta o que
  foi digitado, mas **não desfaz upload**: arquivo enviado pelo `FileInput` já está no CDN.
- **Cancelar (entrega cancelada)**: WF **bTcrF** → `HideElement` (bTcrK) + `ResetGroup` (bTcrL). Idêntico a bTcBK
  (§8.2).
- **Botão "Cancela" da variante financeiro** (`bUEqu0`): **sem workflow** — não fecha nada (§8.1, [DÚVIDA 10.4]).
- **WF bTiEL0** (`ButtonClicked` em `Text I`, o rótulo "Envia nota fiscal e/ou boleto para o cliente"): **zero ações**.
  Workflow vazio; provavelmente sobra de uma tentativa de fazer o texto alternar o checkbox (§8.1).

### 4.2 Anexar a NF do fornecedor

Campos: `ipt numero nf` (bTbvK), `ipt data nf` (bTcZP), `upf anexanota` (bTbvE, até 5 MB) e o checkbox
`tgg nao emite nf` (bTiFr0). Regras:

- Marcar "Fornecedor não emite nota fiscal" desobriga e desabilita os três (3 condicionais). O valor vai para
  `Entrega.NaoEmiteNF` em bTcRM / bTcZW — mas **não** em bUErF0 (§4.3).
- O aviso de NF repetida (`alerta nf repetida`, §3 #1) é **só visual**: nenhum workflow o consulta, nada impede
  gravar a NF duplicada.
- **Abrir a NF anexada**: WF **bTepV** → `OpenURL` (bTepb) com `Entrega.ArquivoNfFornecedor:url` e
  `open_in_new_tab=True`. É a URL pública do CDN do Bubble (§7).

### 4.3 Gravar: "saiu para entrega", NF, boletos e substituto de férias

São **três** workflows de gravação, escolhidos por condição e por página. Os três gravam via `ChangeThing` na própria
entrega (`to_change=Parent`) e **escondem o popup antes de gravar** (o `HideElement` é sempre o passo 1).

**(a) WF bTcRH — "Gravar" fora do financeiro, com o interruptor LIGADO** (`tgg saiuentrega:get_AAI = true`):

1. `HideElement` (bTcRN) em `GroupFocus A`.
2. `ChangeThing` (bTcRM) na entrega: `ArquivoNfFornecedor = upf anexanota`, `NumNfFornecedor = ipt numero nf`,
   **`StatusEntrega = Opt.Etapas.Em Entrega`**, `SaiuEntrega = tgg saiuentrega:get_AAI`,
   `DtEmissaoNf = ipt data nf`, `BoletoArquivos = upf boletos`,
   `NotaBoletoEnviada = tgg envianota primeiravez`, `NaoEmiteNF = tgg nao emite nf`.
3. `SendEmail` (bTiFG0) — §4.5.
4. `ResetInputs` (bThGA).
5. `ChangeThing` (bTyBZ) **SÓ SE** `ResultOfStep[bTcRM].QualVendedor.FeriasPeriod` contém
   `ResultOfStep[bTcRM].DataEntrega` (a data **prevista**): `QualVendedorSubstituto = QualVendedor.QualVendedorSubstituto`.
   Mesma regra que aparece em `vendas.md` §5 (bTyAt, bUEtu, bTcXd) e no backend `AtribuirVendedorSubstituto` (bUBpN).

**(b) WF bTcZR — "Gravar" fora do financeiro, com o interruptor DESLIGADO** (`get_AAI = false`): igual ao (a), com
duas diferenças — **`StatusEntrega = Opt.Etapas.Pedido`** (bTcZW, ou seja, volta a entrega para "Pedido") e um
`PauseWFClient` (bTepJ) antes do e-mail. Ações: bTcZX, bTcZW, bTepJ, bTiFB0, bThFz, bTyBe.

**(c) WF bUErF0 — "Gravar" na página `financeiro`**, disparado pelo clique no **grupo** `gp grava financeiro`
(bUEqo0), não no botão. Condição: `tgg saiuentrega:get_AAI = true`. Ações: bUErH0 (esconde), bUErL0 (grava),
bUErM0 (e-mail), bUErN0 (reset), bUErR0 (substituto). Diferenças em relação a (a):

- **não grava `StatusEntrega`** (correto: a entrega já está no Financeiro e não deve voltar);
- **não grava `SaiuEntrega`** nem **`NaoEmiteNF`** — o interruptor é lido só como condição e o valor nunca é
  persistido nessa variante ([DÚVIDA 10.5]);
- **não existe a variante com o interruptor desligado**: na página `financeiro`, se `tgg saiuentrega` estiver em
  falso, clicar em Gravar **não faz nada** — nem NF, nem boletos, nem e-mail. E como `Group E` (bTcAr) está escondido
  quando `StatusEntrega = Financeiro`, o usuário **não vê** o interruptor para ligá-lo: vale o estado inicial
  `AAD = Entrega.SaiuEntrega`. Logo uma entrega que chegou ao Financeiro com `SaiuEntrega = false` **não consegue
  receber NF nem boleto pela página financeiro** ([DÚVIDA 10.5]).

**Resumo do efeito do interruptor "Saiu para entrega"** — é ele que move a entrega dentro de `Opt.Etapas`:

| Interruptor | Página | `StatusEntrega` gravado | WF |
|---|---|---|---|
| ligado | vendas (qualquer ≠ financeiro) | `Em Entrega` | bTcRH |
| desligado | vendas (qualquer ≠ financeiro) | `Pedido` | bTcZR |
| ligado | financeiro | *não alterado* | bUErF0 |
| desligado | financeiro | — (nenhum workflow roda) | — |

### 4.4 Anexar boletos e registrar o motivo de cancelamento

- **Boletos**: `upf boletos` (bTiDt0, plugin `multifileupload`, máx. 4) grava em `Entrega.BoletoArquivos` nos três
  workflows de gravação. Não há validação de tipo nem de tamanho (o `max_size=5` MB é só do `FileInput` da NF).
  O **comprovante de entrega** (`Entrega.ComprovanteEntrega`) **não** é tratado aqui: ele é anexado na confirmação de
  entrega (`vendas.md` §4.8) e no diálogo financeiro (`financeiro-reusables.md` §4.3). Este reusable não o toca.
- **Entrega cancelada**: WF **bTcon** (clique em `Button Gravarcancelado`) → `ChangeThing` (bTcot)
  `MotivoCancelamento = ipt motivocancela` e depois `HideElement` (bTcou). Aqui a ordem é **invertida** (grava,
  depois esconde) e nada mais é gravado: NF, boletos e envio ficam de fora.

### 4.5 O e-mail de nota fiscal e boleto ao cliente

Ação `SendEmail` presente nos três workflows (bTiFG0 em bTcRH, bTiFB0 em bTcZR, bUErM0 em bUErF0) — **três cópias
idênticas** (§8.2). Usa o SendGrid nativo do Bubble (`integracoes.md`: `usa SendGrid: True`).

| Campo | Valor |
|---|---|
| `to` | `El[GroupFocus A]:get_group_data:cpo.QualPedido:cpo.EmailCliente:cpo.Email` (contato de e-mail do pedido) |
| `cc` | `CurrentUser:email` |
| `bcc` | `CurrentUser:cpo.CopiaPedido` (campo de texto livre do usuário, `cpo_copiaoculta_text`) |
| `replyTo` / `sender_name` | `CurrentUser:email` / `CurrentUser:cpo.NomeModelo:to_capitalized_words` (`different_reply_to=True`) |
| `subject` | `Nota fiscal e Boleto - (Pedido núm {Pedido.NumeroPedido})` |
| `body` | "Olá {Pedido.EmailCliente.NomeContato maiúsculo}"; "Segue anexo nota fiscal e boleto referente ao pedido {NumeroPedido} ({Produto.NomeModelo} - {orçamento.QtdVenda})"; assinatura com o nome do usuário e o bloco de telefones do Grupo Mega Box em `[color=#8555e2]` |
| anexos | 5 posições: `upf anexanota:get_data`, `upf boletos:first_element`, `:specific_item(2)`, `:specific_item(3)`, `:last_element` |

Regras e problemas:

- **A condição de envio está com a precedência errada.** No mapa:
  `El[tgg envianota primeiravez]:get_data :or_(Parent:cpo.NotaBoletoEnviada:is_true) :and_(El[tgg envianota segundavez]:get_data)`.
  O Bubble avalia da esquerda para a direita, sem precedência: `((primeiravez OR jaEnviada) AND segundavez)`.
  Como `tgg envianota segundavez` só aparece **depois** de `NotaBoletoEnviada = true`, no **primeiro** envio ele vale
  falso e **o e-mail não sai**, mesmo com "Envia nota fiscal e/ou boleto" marcado. Na prática só o **reenvio**
  dispara e-mail. O defeito está nas três cópias — é o achado mais importante da §4 ([DÚVIDA 10.7]).
- A lista de anexos tem **5 posições fixas** para 1 NF + 4 boletos. Com menos de 4 boletos, `specific_item(2/3)` e
  `last_element` vêm vazios ou repetem (com 1 boleto, `first_element` e `last_element` são o mesmo arquivo).
- `NotaBoletoEnviada` é gravado a partir de `tgg envianota primeiravez`, que está **vinculado ao próprio campo**.
  No reenvio o grupo da primeira vez está escondido e o checkbox lê `true`, então o campo fica `true` para sempre:
  **não há registro de quantos envios houve nem de quando** ([DÚVIDA 10.7]).
- `bcc` sai de um campo de texto livre, sem validação de e-mail.

### 4.6 Adicionar e editar item do pedido (`AddEdita Produtos`)

**Adicionar — WF bTibg** (clique em `Icon add produto`; `workflow_disabled=False` explícito no mapa), 7 ações:

1. **`NewThing` bTicQ** — cria o item `Tbl.CotacaoProdutos` com `Condicao`, `Linha`, `Medida`, `qtd` dos inputs,
   `QualProdutoGrupo` e `QualProduto` dos dropdowns, e — do pedido em `var_qualpedido_` — `QualCliente` e
   **`QualCotacao = var_qualpedido_:cpo.QualCotacao`**. Não define `QualEnderecoDestino`.
2. **`NewThing` bTicR** — cria o orçamento `Tbl.OrcFornecedoresCotacao` já como **`Vencedor = True`** e
   `QualVendedor = CurrentUser`, com:
   - `QualCotacao = ResultOfStep[bTicQ]:cpo.QualCotacao`, `QualCotacaoProduto = ResultOfStep[bTicQ]`;
   - `QtdVenda`, `Condicao`, `Linha`, `Medida` iguais aos do item;
   - `QualEnderecoDestino = var_qualpedido_:cpo.QuaisOrcamentosFonecedores:first_element:cpo.QualEnderecoDestino`
     (o destino é copiado do **primeiro** orçamento do pedido);
   - `QualEnderecoOrigem = var_qualpedido_:cpo.QualPrimeiroFornecedor` e
     **`QualEndereçoCobrança = var_qualpedido_:cpo.QualPrimeiroFornecedor`** (o endereço de cobrança recebe o
     endereço do **fornecedor**, não do cliente — comparar com o `DuplicarPedido`, §4.7 e [DÚVIDA 10.13]);
   - `QualFornecedor = var_qualpedido_:cpo.QualPrimeiroFornecedor:cpo.QualGrupoCliFor`;
   - todos os valores monetários, tributos, frete e `QualProposta` explicitamente **vazios**.
3. **`ChangeThing` bTiea** no orçamento criado: `TributosICMS` (= `cpo.TotalBonusExtra - deleted` no mapa) recebe a
   alíquota de `Tbl.IcmsEstados` para o par origem×destino, e **`TributoPISCOFINS` recebe `0.0925` fixo** (§5.2).
4. **`ChangeThing` bTicX** — acrescenta o orçamento a `var_qualpedido_:cpo.QuaisOrcamentosFonecedores`.
5. `ResetInputs` (bTicV) e 6. `HideElement` (bTicW) no próprio reusable.
7. **`ScheduleAPIEvent` bTieH** — agenda `AdicionarFornecedores` (**bTNrd**) com `linha`, `medida`, `condicao`,
   `qtd laco=1`, `fila laco=1`, `vendedor=CurrentUser`, `orcamentoproduto = ResultOfStep[bTicQ]`,
   `destino = pedido.QuaisOrcamentosFonecedores:first_element:QualEnderecoDestino` e
   `origens = pedido.QuaisOrcamentosFonecedores:first_element:QualEnderecoOrigem:convert_to_list` (**uma** origem).

**Consequência (achado):** bTNrd cria **outro** `Tbl.OrcFornecedoresCotacao` para a mesma origem — ou o passo bThgz0
(quando o regime tributário da origem **não** é Lucro Real/Presumido, ou está vazio) ou o passo bTNri (quando origem
**e** destino são Lucro Real/Presumido). Logo o item nasce com **dois orçamentos** para o mesmo fornecedor: o de bTicR
(marcado vencedor, com as alíquotas de bTiea) e o de bTNrd (sem `QualCotacao`, sem `Vencedor`). Pior: o passo bTOTf0
de bTNrd grava `Item.QuaisOrcamentosForncededores = ResultOfStep` — a lista do item passa a apontar **só para a cópia
de bTNrd**, e o orçamento vencedor de bTicR fica fora dela (chega ao item apenas pela FK `QualCotacaoProduto`).
Como `rpg fornecedorescotacao duplicar` e as tabelas da página leem a **lista**, o vencedor pode simplesmente não
aparecer. Ver §8.3 e [DÚVIDA 10.14].

Se **nenhum** dos dois `SÓ SE` de bTNrd bater (origem Lucro Real/Presumido com destino de outro regime), bTNrd não
cria nada e o passo bTOTf0 grava `QuaisOrcamentosForncededores = ∅`, **esvaziando a lista do item**.

**Editar — WF bTibP** (clique em `Icon salvar produto`), 5 ações:

1. **`ChangeThing` bTibU** no **item** (`to_change=Parent`): `Condicao`, `Linha`, `Medida`, `qtd`,
   `QualProdutoGrupo`, `QualProduto`.
2. **`ChangeThing` bTigL** no **orçamento** (`to_change=El[Reusable …]:get_group_data`): **só `QtdVenda`**.
   Ou seja, alterar condição, linha, medida ou o produto **não** atualiza o orçamento — ele fica com
   `Condicao`/`Linha`/`Medida`/`QualProdutoModelo` antigos, e são esses os campos que a proposta e o pedido exibem.
   É o segundo achado desta seção ([DÚVIDA 10.15]).
3. **`ScheduleAPIEvent` bTibZ** — agenda `CalculaFornecedoresLista` (**bTPFh**) com
   `par.OrcamentosFornecedores = El[Reusable …]:get_group_data:convert_to_list`, isto é, **apenas o orçamento
   editado**. Os orçamentos irmãos do mesmo item (outros fornecedores) continuam com a quantidade velha e, por
   consequência, com bruto/comissão/tributos/líquido calculados sobre ela.
4. `ResetGroup` (bTibb) e 5. `HideElement` (bTieb).

Nenhuma das duas variantes valida quantidade > 0, nem se o produto escolhido aceita a condição/linha marcada
(os dropdowns já restringem as opções, mas nada reconfere na gravação), nem se o item pertence ao pedido informado.

**Cadastro de produto a partir do diálogo:**

- WF **bTiax** (clique na imagem `abre cadastro produtos`) → `ShowElement` (bTibC) em `pop.CadastroProdutos A`;
- WF **bTigj** (clique no `Group A` bTiZp, o grupo que envolve a mesma imagem) → `ShowElement` (bTigp), idêntico;
- WF **bTibH** (clique no `Icon edita produto`) → `ShowElement` (bTibJ) + `DisplayGroupData` (bTibN) com
  `dd add modelo produto:get_data`: abre o cadastro **no produto selecionado**. Se nenhum produto está escolhido, abre
  vazio (sem `Only when`).
- WF **bTigv** (`PopupClosed` no próprio reusable) → `ResetGroup` (bTigx): limpa os campos ao fechar.

O `pop.CadastroProdutos` em si está especificado em `specs/paginas/cadastros.md`.

### 4.7 Duplicar pedido como nova cotação (`DuplicarPedido`)

**Marcar / desmarcar item** — dois workflows no mesmo `btn seleciona produto` (bUARe), distinguidos pela condição:

- WF **bUAaL** — `SÓ SE CurrentUser.TempOrcamentoProdutos :not_contains(item)` → `MakeChangeCurrentUser` (bUAaR)
  em `cpo.TempOrcamentoProdutos` com o item da linha: **acrescenta**.
- WF **bUAaT** — `SÓ SE CurrentUser.TempOrcamentoProdutos :contains(item)` → `MakeChangeCurrentUser` (bUAaY)
  no mesmo campo com o mesmo item: **remove**.

O mapa imprime as duas ações exatamente iguais (`cpo.TempOrcamentoProdutos = Ancestor[TableCrossAxis]`) porque o
decompilador não preserva o operador `:plus item` / `:minus item` do Bubble; a condição de cada workflow deixa a
intenção inequívoca, mas o operador em si é [DÚVIDA 10.16]. **A seleção é gravada no banco, no usuário** — não é
estado de tela: sobrevive ao fechamento do diálogo e ao logout, e é a mesma lista do carrinho da cotação nova (§8.3).

**Expandir / recolher os fornecedores do item** — dois workflows idênticos, um por elemento clicável:

- WF **bUAWJ** (clique no `Text B` "Produto / Fornecedor", bUASl): `ToggleElement` em
  `rpg fornecedorescotacao duplicar` (bUAWL), em `txt titulo icms` (bUAWP) e em `txt titulo piscofins` (bUAWQ).
- WF **bUAWh** (clique no `Icon B` chevron, bUAPx): as mesmas três ações (bUAWj, bUAWn, bUAWo).

Ao abrir a sub-tabela, todos os inputs de resumo do produto se escondem (condicional
`El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False`, repetida em 8 inputs) e o chevron vira
`chevron-up`. Duplicação pura (§8.2).

**Trocar o vencedor — os dois workflows estão inalcançáveis:**

- WF **bUAVr** — `SÓ SE Ancestor[TableCrossAxis].Vencedor:is_true` → `ChangeThing` (bUAVt) `Vencedor = False`.
- WF **bUAVy** — `SÓ SE ... Vencedor:is_false` → `ChangeThing` (bUAWD) `Vencedor = False` no **atual vencedor da
  lista** e `ChangeThing` (bUAWE) `Vencedor = True` no clicado.

Por que não funcionam: (i) o troféu `Icon B` (bUAOq) tem `button_disabled=True` no padrão e **nenhuma condicional que
o habilite** — as três condicionais existentes só mudam ícone, cor e `title`; (ii) a tabela que os hospeda já está
filtrada por `Vencedor = True`, então a condição de bUAVy **nunca** pode ser verdadeira; (iii) se bUAVr rodasse,
deixaria o item **sem vencedor** e a linha desapareceria da tabela filtrada. E os dois escreveriam no orçamento **do
pedido original**, não numa cópia — alterariam o pedido que se está apenas duplicando. §8.1.

**Trocar o tipo de frete — WF bUAUk** (`InputChanged` em `dd tipofrete copiar`, `SÓ SE This ≠ CIF Informado`):
`ChangeThing` (bUAUp) zera `ValorFrete` no orçamento e `ScheduleAPIEvent` (bUAUq) agenda `CalculaFornecedoresLista`
(bTPFh) com esse orçamento. **Inalcançável**: `dd tipofrete copiar` (bUAOL) é `disabled=True` sem condicional que o
habilite, como todos os inputs daquela tabela. Se rodasse, escreveria no orçamento do pedido original. §8.1.

**Gravar — WF bTzte** (clique em `btn gravarcotacao`), 7 ações. É o coração do reusable:

1. **`CopyListOfThings` bUAem** — copia `CurrentUser.TempOrcamentoProdutos` (tipo `custom.tbl_orcamentoprodutos`):
   **cópias novas dos itens** selecionados.
2. **`ChangeListOfThings` bUAfn** nas cópias: `QualCliente = ipt buscacliente copiar`,
   `QualEnderecoDestino = dd enderecoentregacliente copiar`, `QuaisOrcamentosForncededores = ∅`.
   **`QualCotacao` não é limpo** → as cópias continuam apontando para a cotação **antiga** ([DÚVIDA 10.17]).
3. **`CopyListOfThings` bUAer** — copia
   `CurrentUser.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores:filtered(Vencedor = True)`
   (tipo `custom.tbl_orcamentfornecedores`): **cópias dos orçamentos vencedores**.
4. **`ChangeListOfThings` bUAfi** nas cópias de orçamento:
   `QualEnderecoDestino = dd enderecoentregacliente copiar`,
   **`QualEndereçoCobrança = dd enderecoentregacliente copiar`** (o endereço de entrega do cliente vira endereço de
   cobrança — o oposto do que bTicR faz na criação, §4.6 e [DÚVIDA 10.13]) e `QualCotacaoProduto = ∅`.
   **Não** limpa `QualCotacao`, **nem `QualProposta`, nem `QuaisEntregas`**: a cópia do orçamento nasce amarrada à
   proposta e às **entregas do pedido original** ([DÚVIDA 10.18]). Também mantém o `QualVendedor` original, que pode
   ser outro vendedor.
5. **`ScheduleAPIEvent` bUAeh** — agenda `VicularOcamentoCopiaAoProdutoCopia` (**bUAeU**) com
   `qtd = TempOrcamentoProdutos:count`, `fila = 1`, `produtos = ResultOfStep[bUAem]`,
   `orcamentos = ResultOfStep[bUAer]`, `dtvalidade = ip data validade copiar`, `currentuser = CurrentUser`,
   `empresamega = rd empresa megabox copiar`.
6. `HideElement` (bUAgd) e 7. `ResetGroup` (bUAgf) no reusable.

**O que o backend bUAeU faz** (`mapa/backend-workflows.md`), recursivamente, uma volta por item:

1. `ChangeThing` bUAey: `produtos:specific_item(fila).QuaisOrcamentosForncededores = orcamentos:specific_item(fila)`;
2. `ChangeThing` bUAfu: `orcamentos:specific_item(fila).QualCotacaoProduto = ResultOfStep[bUAey]` — fecha o par;
3. `ScheduleAPIEvent` bUAfD, **SÓ SE `fila < qtd`**: repete com `fila + 1`;
4. `NewThing` bUAfd, **SÓ SE `fila ≥ qtd`**: cria a `Tbl.Cotacao` com `Arquivado = False`,
   **`CotacaoEtapa = Opt.Etapas.Cotação`**, `CotacaoNum = Search(Tbl.Cotacao):last_element:cpo.CotacaoNum:plus(1)`,
   `CotacaoStatus = Em andamento`, `DataValidade = dtvalidade`, `EmpresaMegabox = empresamega`,
   `QuaisProdutos = produtos`, `QualVendedor = currentuser` e
   `QualCliente = ResultOfStep[bUAfu]:cpo.QualEnderecoDestino:cpo.QualGrupoCliFor`;
5. `ChangeThing` bUAfz, **SÓ SE `fila ≥ qtd`**: limpa `currentuser.TempOrcamentoProdutos`.

Achados desta cadeia, em ordem de gravidade:

- **A etapa contradiz a tela.** O aviso `Text J` promete "o pedido será criado na etapa PROPOSTA"; o backend cria em
  **`Cotação`** e **não cria proposta nenhuma** (`QuaisPropostas` e `QualPedido` ficam vazios).
  A tela mente para o usuário ([DÚVIDA 10.2]).
- **O pareamento é por índice.** bUAey / bUAfu casam `produtos[fila]` com `orcamentos[fila]` supondo que as duas
  listas saíram na mesma ordem. `orcamentos` vem de `:QuaisOrcamentosForncededores:filtered(Vencedor = True)` sobre a
  lista de itens: **um item sem vencedor não gera linha** e **um item com dois vencedores gera duas**. Em qualquer dos
  casos as listas desalinham e o orçamento de um produto é colado em outro. O botão Gravar só exige "≥ 1 item
  selecionado" — **nada exige que cada item tenha exatamente um vencedor** ([DÚVIDA 10.19]).
- **A `Tbl.Cotacao` nova não é amarrada às cópias.** bUAfd grava `QuaisProdutos = produtos`, mas nenhuma ação grava
  `item.QualCotacao` nem `orcamento.QualCotacao` com a cotação nova: as cópias seguem apontando para a cotação do
  pedido original (passos 2 e 4 de bTzte). A nova cotação só tem o vínculo pelo lado da lista.
- **O `QualCliente` da cotação é inferido** do último orçamento da recursão
  (`QualEnderecoDestino.QualGrupoCliFor`), não do cliente escolhido no autocomplete.
- **A recursão é o laço.** Uma chamada de backend por item, com `ScheduleAPIEvent` sem atraso, e o `NewThing` da
  cotação depende de a última volta terminar. Nada é transacional: se uma volta falhar, ficam itens e orçamentos
  copiados **sem cotação nenhuma** — órfãos permanentes no banco.
- **bUAeU está exposto sem autenticação** (`expose=True, auth_unecessary=True, ignore_privacy_rules=True`) — §6 e §7.

**Cancelar — WF bUAgB** (clique em `btn cancelacotacao`): `HideElement` (bUAgH) + `ResetGroup` (bUAgM).
**Não limpa `User.TempOrcamentoProdutos`**: a seleção fica gravada no usuário, reaparece na próxima abertura e polui
o carrinho da cotação nova (§8.3).

**Abrir a agenda de endereços — WF bUAMz**: `ShowElement` (bUANE) em `pop.AgendaEnderecos A` + `SetCustomState`
(bUANF) `var_qualgrupoclifor_ = ipt buscacliente copiar:get_data`. Já especificado em
`specs/paginas/enderecos-e-contatos.md` (contrato do estado `var_qualgrupoclifor_`); listado aqui só para fechar a
cobertura dos 10 workflows do arquivo.

---

## 5. Cálculos e valores

O `AnexaNf` **não calcula nada** — só grava campos e datas. Todo o dinheiro destes reusables está no
`AddEdita Produtos` e no `DuplicarPedido`, e sempre no `Tbl.OrcFornecedoresCotacao`. Os nomes de campo seguem o
glossário do cabeçalho.

### 5.1 A cadeia `CalculaFornecedoresLista` (bTPFh) — 6 ações, nesta ordem

Disparada por bTibZ (editar item, §4.6) e por bUAUq (frete, §4.7, inalcançável). Fórmulas literais do mapa:

| # | Ação | Fórmula |
|---|---|---|
| 1 | bTPGA | `ValorVendaBruto = QtdVenda × ValorVendaUnit + ValorFrete` |
| 2 | bTPFo | `ValorComissaoBruto = QtdVenda × ValorComissaoUnit` |
| 3 | bTPFt | `ValorPISCOFINS = QtdVenda × ValorVendaUnit × TributoPISCOFINS` |
| 4 | bTPFv | `ValorICMS = QtdVenda × ValorVendaUnit × TributosICMS` |
| 5 | bTPGF | `ValorVendaLiquido = ValorVendaBruto − ValorICMS − ValorPISCOFINS` |
| 6 | bTeYL | `ValorUnitLiquido = ValorVendaLiquido ÷ QtdVenda` |

Observações que mudam o resultado:

- ICMS e PIS/COFINS incidem sobre `QtdVenda × ValorVendaUnit` (**sem** o frete), mas o bruto **inclui** o frete.
  Logo o líquido carrega o frete integral, sem tributo — regra deliberada ou não, é o que está no mapa.
- `ValorUnitLiquido` é uma divisão: com `QtdVenda = 0` o Bubble devolve vazio/erro silencioso.
- A cadeia é **assíncrona** (`ScheduleAPIEvent`): a tela mostra o valor velho até o backend terminar
  (`vendas.md` §8.3).
- `ValorIPI` e `TributoIPI` existem na tabela e **nunca são calculados** por esta cadeia.

### 5.2 Alíquotas gravadas ao adicionar um item (bTiea, §4.6)

- `TributosICMS` (`cpo_tributos_number`) =
  `Search(Tbl.IcmsEstados):filtered(Destino = orçamento.QualEnderecoDestino.QualUfOpt AND Origem = orçamento.QualEnderecoOrigem.QualUfOpt):first_element:cpo.AliquotaIcms`.
  Se o par origem×destino não existir na tabela, `first_element` vem vazio → **alíquota vazia** → `ValorICMS = 0`,
  sem nenhum aviso.
- `TributoPISCOFINS` (`cpo_tributopiscofinsb_number`) = **`0.0925` chumbado no workflow** (9,25%). O mesmo número
  aparece chumbado no backend `AdicionarFornecedores` (bTNri) — dois lugares para mudar se a alíquota mudar
  ([DÚVIDA 10.20]).
- O passo bThgz0 de `AdicionarFornecedores` (origem fora do Lucro Real/Presumido) grava `TributosICMS = ∅` e
  `TributoPISCOFINS = ∅` **de propósito**: fornecedor do Simples/MEI não gera crédito. É a regra fiscal do negócio, e
  vale a pena preservá-la explicitamente no banco novo.

### 5.3 O que o `DuplicarPedido` mostra e o que copia

Os valores da tela são **leitura**, não cálculo: `ValorVendaBruto`, `ValorComissaoBruto`, `ValorVendaLiquido`,
`ValorVendaUnit`, `ValorComissaoUnit`, `ValorFrete`, `ValorPISCOFINS` e `TipoFrete` do orçamento vencedor, mais dois
compostos no próprio input:

- `ipt calculotributo copiar` (bUAOS) = `ValorPISCOFINS + ValorICMS` — "Total Tributos", somado **no navegador**;
- `ip valorminimo` (bUAOv) = `mín(ValorVendaLiquido)` da lista exibida, usado só para pintar de verde o menor líquido
  (condicional de `ip totalliquido copiar` bUAOw).

`CopyListOfThings` copia **todos** os campos, valores monetários incluídos: a cotação duplicada nasce com preço,
comissão e tributos **congelados na data do pedido original**, sem recálculo e sem revalidar a alíquota de ICMS para o
novo par origem×destino — e o destino **mudou** (bUAfi grava o endereço do novo cliente). Isto é: **o ICMS da cotação
duplicada está errado sempre que a UF de destino do novo cliente for diferente da do pedido original**, e nenhuma
ação de bTzte ou de bUAeU agenda `CalculaFornecedoresLista`. É o achado de dinheiro mais grave desta spec
([DÚVIDA 10.21]).

### 5.4 Numeração da cotação

Dois cálculos diferentes para o mesmo número:

- na tela, `ip num orcamento copiar` (bUAKd) = `Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1)`;
- no backend, bUAfd = `Search(Tbl.Cotacao):last_element:cpo.CotacaoNum:plus(1)`.

O primeiro pega o último item da **lista de números**, o segundo o número da **última cotação** — a ordenação padrão
do Bubble é por data de criação, então as duas expressões podem divergir se algum número foi digitado fora de ordem.
E, de qualquer forma, "último + 1" **não é atômico**: dois usuários duplicando ao mesmo tempo geram o mesmo número.
Na base nova é `sequence`/`identity` (já apontado em `vendas.md` §8.3).

### 5.5 Exatidão, e o que exige teste

Regra 10 do `CLAUDE.md`: dinheiro é `numeric`, nunca `float`. Hoje **todos** estes campos são `number` do Bubble
(ponto flutuante IEEE-754), e os produtos `Qtd × Unit × alíquota` acumulam erro antes de qualquer arredondamento.

Precisam de teste no app novo:

1. `ValorVendaBruto`, `ValorComissaoBruto`, `ValorICMS`, `ValorPISCOFINS`, `ValorVendaLiquido`, `ValorUnitLiquido` —
   a cadeia inteira da §5.1, com `numeric(14,4)` no cálculo e arredondamento explícito a 2 casas nos totais.
2. `ValorUnitLiquido` com `QtdVenda = 0` (divisão por zero) e com quantidade que não divide o líquido em centavos
   inteiros (verificar `Σ unitário × qtd = total`).
3. Alíquota de ICMS ausente para o par origem×destino: erro explícito, não zero silencioso.
4. `TributoPISCOFINS = 9,25%` como parâmetro com vigência, e o caso "origem Simples/MEI ⇒ alíquotas nulas" (§5.2).
5. A duplicação (§5.3): o ICMS **tem** de ser recalculado para o novo destino; teste comparando cotação duplicada
   entre UFs diferentes com uma cotação criada do zero para o mesmo cliente.
6. Frete `CIF Informado` vs. os outros dois tipos (zera `ValorFrete`) e seu efeito no bruto e no líquido.

---

## 6. Integrações e backend workflows

| Recurso | Onde é chamado | O que faz | Observação |
|---|---|---|---|
| **`SendEmail`** (SendGrid nativo do Bubble) | bTiFG0 (bTcRH), bTiFB0 (bTcZR), bUErM0 (bUErF0) | e-mail de NF+boleto ao cliente, até 5 anexos | `integracoes.md`: `usa SendGrid: True`. Sem fila, sem registro de envio, sem tratamento de falha; a condição de disparo está errada (§4.5) |
| **`CalculaFornecedoresLista`** (bTPFh) | bTibZ (editar item) e bUAUq (frete, inalcançável) | recalcula bruto, comissão, ICMS, PIS/COFINS, líquido e unitário líquido (§5.1) | não declara `expose`; a Workflow API do app está ligada (`integracoes.md`), logo presume-se público |
| **`AdicionarFornecedores`** (bTNrd) | bTieH (adicionar item) | cria um orçamento por endereço de origem, conforme o regime tributário, e agenda a si mesmo com `fila + 1` | recursão de 1 s por origem; aqui é chamado com **uma** origem. Duplica o orçamento que bTicR acabou de criar (§4.6) |
| **`VicularOcamentoCopiaAoProdutoCopia`** (bUAeU) | bUAeh (duplicar pedido) | pareia item↔orçamento copiados, recursivamente, e no fim cria a `Tbl.Cotacao` nova e limpa o carrinho do usuário (§4.7) | **`expose=True, auth_unecessary=True, ignore_privacy_rules=True`** — ver abaixo |
| **`multifileupload`** (plugin) | `upf boletos` (bTiDt0) | upload de até 4 boletos | arquivos vão para o CDN público do Bubble (§7) |
| **Plugin `1680110374647x249108010620944400`** v1.5.13 | `tgg saiuentrega` (bTcRd) | interruptor "Saiu para entrega"; escrita em `AAD`, leitura em `get_AAI` | dependência de terceiro para um booleano; no app novo é um `<input type=checkbox>` estilizado (§8.3) |
| CDN do Bubble e `svgrepo.com` | `abre cadastro produtos` (bTiZt), `Image A` (bUAKu, bUALX) | ícones e logos das empresas emissoras | URLs absolutas chumbadas nas condicionais; no app novo vão para `public/` ou para uma tabela `empresas_emissoras` |

### Risco: `VicularOcamentoCopiaAoProdutoCopia` (bUAeU) está exposto sem autenticação

As três props juntas — `expose=True`, `auth_unecessary=True`, `ignore_privacy_rules=True` — significam que **qualquer
pessoa com a URL do endpoint dispara este workflow, sem login, ignorando as regras de privacidade**. E ele escreve:

- altera `QuaisOrcamentosForncededores` de qualquer `Tbl.CotacaoProdutos` passado no parâmetro `produtos` (bUAey);
- altera `QualCotacaoProduto` de qualquer `Tbl.OrcFornecedoresCotacao` passado em `orcamentos` (bUAfu);
- **cria uma `Tbl.Cotacao`** com número, validade, empresa emissora, cliente e vendedor à escolha de quem chamar
  (bUAfd) — `Tbl.Cotacao` é uma das 18 tabelas **sem nenhuma regra de privacidade**;
- **limpa `TempOrcamentoProdutos` de qualquer usuário** passado em `currentuser` (bUAfz), ou seja, apaga o carrinho de
  compras de um vendedor qualquer no meio do trabalho dele;
- e reagenda a si mesmo (bUAfD) com `fila + 1` enquanto `fila < qtd`: chamar com `qtd` alto é um **amplificador** —
  uma requisição vira N execuções de backend.

Este é o item **§2.1** de `specs/00-achados-de-seguranca.md`, que já registra o achado e pede a auditoria dos 28
backend workflows no editor. Ações, sem repetir o que está lá: (1) trocar `expose` para falso **antes do corte**, ou
fechar o app Bubble ao público; (2) no app novo, a duplicação é uma server action autenticada, numa transação, com o
`vendedor` vindo da sessão e nunca do parâmetro (§9.3).

---

## 7. Segurança e privacidade

O que já está consolidado em `specs/00-achados-de-seguranca.md` **não se repete aqui**: o backend exposto é o §2.1
de lá (resumido na §6 acima), as 18 tabelas sem regra de privacidade são o §2.2, o auto-binding é o §2.3 e o que o
app novo tem de impor é o §3. Abaixo só o que estes três reusables acrescentam.

### 7.1 Anexos: NF, boletos e comprovante abrem por URL pública de CDN

`Tbl.Entregas` guarda `ArquivoNfFornecedor` (`file`), `BoletoArquivos` (`list.file`), `BoletoFile` (`file`) e
`ComprovanteEntrega` (`file`). No Bubble, um `file` é uma URL do CDN (`*.cdn.bubble.io/f…`) **sem assinatura e sem
expiração**: quem tiver o link abre o arquivo, logado ou não, para sempre. O WF **bTepV** literalmente faz
`OpenURL(Entrega.ArquivoNfFornecedor:url)` numa aba nova — a URL passa pelo navegador, pelo histórico e por qualquer
extensão instalada. A regra `everyone` de `Tbl.Entregas` ainda tem **`view_attachments: true`** e `search_for: true`,
então a URL também é obtível pela Data API sem autenticação.

O que vaza: nota fiscal do fornecedor (CNPJ, valores, itens, condições comerciais), **boleto bancário** (linha
digitável, código de barras, sacado, cedente — um boleto vazado é um boleto que pode ser pago por engano ou usado
em fraude de troca de boleto) e comprovante de entrega (assinatura e, com frequência, documento de quem recebeu).

**No app novo:** bucket **privado** do Supabase Storage (`entregas/{entrega_id}/nf/…`, `…/boletos/…`,
`…/comprovante/…`), política de Storage espelhando a RLS da entrega, e **URL assinada de vida curta** gerada por
server action a cada abertura (nunca URL persistida em coluna). A coluna guarda o *path*, não a URL. O upload passa
pelo servidor, que valida tipo (PDF/XML/imagem), tamanho e quantidade — hoje o `max_size=5` MB é do componente e o
`upf boletos` não valida nada. Antes do corte: inventariar quantos arquivos de NF/boleto/comprovante já estão no CDN
público, porque migrar o arquivo **não** invalida o link antigo do Bubble.

### 7.2 Auto-binding inerte, mas concedido

Os 6 campos da sub-tabela do `DuplicarPedido` (`ip valorvenda`, `ip valorcomissao`, `dd tipofrete`, `ip valorfrete`,
`ip icms`, `ip piscofins`) e o `Input qtd copiar` são `auto_binding: True` **e** `disabled=True`. Desabilitado é
propriedade de tela: a permissão está na regra `auto binding` da tabela, e vale para qualquer logado por qualquer
caminho (achado §2.3 de lá). Aqui a nota específica é que a tela dá a impressão de leitura, e não é.

### 7.3 Dados pessoais e de terceiros no e-mail

O `SendEmail` da §4.5 monta `to` a partir do contato do pedido, `cc` com o e-mail do usuário logado e `bcc` com
`CurrentUser.CopiaPedido`, um **campo de texto livre** — nada valida o endereço nem impede pôr um destinatário
externo permanente na cópia oculta de todos os e-mails de NF. Os anexos são as URLs públicas da §7.1 (o SendGrid
baixa do CDN). No app novo: destinatários vindos de contatos cadastrados, cópia oculta em tabela de configuração
com nome e responsável, anexos lidos do bucket privado pelo servidor, e log de envio (`email_outbox`).

### 7.4 Sem trava de servidor em nada

Os três reusables gravam direto do navegador (`ChangeThing`, `MakeChangeCurrentUser`, `CopyListOfThings`). Não há
verificação de que o usuário é o vendedor do pedido, de que a entrega pertence ao pedido, de que o item pertence à
cotação, nem de perfil (a única condicional de perfil é a de abrir o `AnexaNf`, §1). Qualquer logado muda a NF, o
status e os boletos de **qualquer** entrega e duplica **qualquer** pedido de qualquer vendedor. No app novo tudo isso
é server action com RLS por `vendedor_id`/`vendedor_substituto_id` e hierarquia (§9.3).

### 7.5 Fuga de informação por busca no cliente

O alerta de NF repetida (§3 #1) e a busca de ICMS (§3 #8) rodam **no navegador** varrendo tabelas inteiras.
Além do custo, a resposta traz para o cliente linhas de entregas de outros vendedores e a tabela de alíquotas
completa. No app novo viram consulta no servidor com `EXISTS` / função (§9.4).

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto

**`pop.AnexaNf`:**
- WF **bTiEL0** (`ButtonClicked` em `Text I`): **zero ações**.
- `HTML D` (bTcnb): oculto ao carregar, **nenhuma condicional o mostra**.
- `Button Cancela naocancelado` (bUEqu0, variante financeiro): **nenhum workflow** — o usuário clica e nada acontece.
- O texto padrão "Novo Produto"/rótulos cobertos por condicionais que sempre disparam.
- `gp caminhaoinvertido` (bTcmx0) duplica os dois SVGs só para perder as condicionais de cor: um único conjunto com
  uma condicional a mais resolveria.
- A entrega em `Opt.Etapas.Concluído` não renderiza caminhão nem `Icon C`: o diálogo fica **inalcançável** nessa
  etapa ([DÚVIDA 10.8]). `Concluído` também não é usado no fluxo de vendas (`vendas.md` §8.3).

**`pop.AddEdita Produtos`:**
- WFs **bTiax** e **bTigj** fazem exatamente a mesma coisa em elementos sobrepostos (a imagem e o grupo que a contém):
  um deles sobra, e clicar na imagem provavelmente dispara os dois.
- O backend `AdicionarProdutos` (bTNin) faz o mesmo que o passo bTicQ e **não é chamado** por este reusable.

**`pop.DuplicarPedido`:**
- O diálogo inteiro: o `Icon GZZZ` que dispara bUAdY **nunca fica visível** (`vendas.md` §8.1). Os 229 elementos,
  10 workflows e 4 tabelas estão em produção sem caminho de acesso.
- WFs **bUAVr** e **bUAVy** (trocar vencedor): troféu `button_disabled=True` sem condicional que habilite, e a
  condição de bUAVy é impossível na tabela filtrada por `Vencedor = True` (§4.7).
- WF **bUAUk** (tipo de frete): `dd tipofrete copiar` é `disabled=True` sem condicional que habilite.
- `btn abrir todos` (bUASm): oculto ao carregar, sem condicional.
- `pop.CadastroProdutos A` (bUAYm): instanciado e **nunca aberto** por nenhum workflow deste arquivo.
- `indica fornecedores` (bUAPf): conta uma lista já filtrada pelo vencedor — mostra sempre 0 ou 1 sob o rótulo
  "Qtd de fornecedores dessa cotação".
- `Table A` (bUARq) com `group_type="option.opt_a__oclifor"`: cabeçalho tipado como um option set que não tem nada a
  ver (`Opt.AçãoCliFor`).
- `TableCrossAxis` bUANV e bUARw: linhas-modelo ocultas, com `fixed_number_repeating_axis_count=0`.

### 8.2 Duplicação

- **Três `SendEmail` idênticos** (bTiFG0, bTiFB0, bUErM0), cada um com corpo, assinatura, telefones e as 5 posições de
  anexo repetidos por extenso. Uma mudança de telefone exige editar 3 lugares — e o app inteiro repete esse bloco em
  ~12 lugares (`vendas.md` §8.2). No app novo: **um** template de e-mail parametrizado.
- **Três workflows de gravação** (bTcRH, bTcZR, bUErF0) que diferem em 3 campos. Uma server action
  `salvarAnexosEntrega(entregaId, dados, { saiuParaEntrega, contexto })` cobre os três.
- **Dois rodapés** (`gp grava naocancelado` e `gp grava financeiro`) com os **mesmos 8 conjuntos de condicionais** de
  "está sujo", copiados literalmente. No app novo é um `formState.isDirty`.
- **Dois botões "Cancela"** com workflows idênticos (bTcBK e bTcrF) e um terceiro sem workflow (bUEqu0).
- `AddEdita Produtos`: **bTiax ≡ bTigj**.
- `DuplicarPedido`: **bUAWJ ≡ bUAWh** (mesmas 3 ações de toggle); a busca
  `QuaisOrcamentosForncededores:filtered(Vencedor = True)` aparece no `data_source` da sub-tabela, nas 2 condicionais
  do troféu, no `title` do troféu e em 8 inputs de resumo — **12 vezes** na mesma linha de tabela.
- A busca de alíquota de ICMS aparece em bTiea (aqui), no backend bTNri e nos inputs da página (`vendas.md` §8.2):
  uma função `aliquota_icms(uf_origem, uf_destino)`.
- A regra do vendedor substituto aparece **3 vezes só neste arquivo** (bTyBZ, bTyBe, bUErR0), mais 3 em `vendas.md` e
  1 no backend bUBpN: vira trigger/função no banco (§9.4).

### 8.3 Gambiarras

- **`Page.Current Page Name` como parâmetro de comportamento.** O `AnexaNf` decide qual rodapé mostrar, se mostra o
  "não emite NF" e se respeita a trava de perfil **pelo nome da página que o hospeda** (5 condicionais + 1 workflow).
  No app novo: prop explícita (`contexto: "vendas" | "financeiro"`) e permissão verificada no servidor.
- **Seleção de itens em `User.TempOrcamentoProdutos`.** É o mesmo campo do carrinho da cotação nova
  (`vendas.md` §8.3). Consequências reais: (i) abrir o `DuplicarPedido` e marcar itens **injeta esses itens no
  carrinho** de uma cotação nova em andamento, e vice-versa; (ii) `bUAgB` (Cancelar) **não limpa** a lista, então a
  seleção sobrevive; (iii) só o fim da recursão de bUAeU limpa (bUAfz), então se a recursão falhar a lista fica presa;
  (iv) é compartilhada entre abas e dispositivos do mesmo usuário. No app novo: seleção em estado de cliente
  (`useState`/`searchParams`), e nada gravado até o `submit`.
- **Gravar por cópia de registro** (`CopyListOfThings`) em vez de montar o registro novo: a cópia arrasta todos os
  campos, inclusive `QualCotacao`, `QualProposta`, `QuaisEntregas` e valores monetários congelados (§4.7, §5.3).
  No app novo: `INSERT … SELECT` com a lista **explícita** de colunas a copiar, numa transação.
- **Recursão de backend como laço** (`bUAeU`, `bTNrd`): substituída por `INSERT … SELECT` e por `generate_series`
  quando houver laço de verdade.
- **Pareamento por índice de duas listas** (bUAey/bUAfu) em vez de FK: no banco novo o par item↔orçamento é FK, criada
  no mesmo `INSERT`.
- **Interruptor de plugin de terceiro** para um booleano (`tgg saiuentrega`, leitura por `get_AAI`), com o valor
  inicial vindo do campo e sem estado intermediário: `<input type="checkbox">` controlado.
- **Input oculto como variável** (`ip valorminimo` bUAOv): calcular na view/no componente.
- **Cor `#108f66` embutida em 2 SVGs** e URLs de CDN chumbadas em 3 imagens: tokens do tema e assets locais.
- **Esconder o popup antes de gravar** (o `HideElement` é o passo 1 dos três workflows de gravação): o usuário não vê
  erro nenhum se a gravação falhar. No app novo: estado de envio, e fecha depois do sucesso.
- **Alerta que não trava** (NF repetida): validação de verdade, com `unique` parcial no banco (§9.4), e a decisão
  explícita sobre quando a repetição é legítima ([DÚVIDA 10.10]).
- **Alíquota chumbada no código** (`0.0925`, em dois lugares).
- **Dois campos de lista com grafia diferente** para a mesma relação (`QuaisOrcamentosFonecedores` no pedido,
  `QuaisOrcamentosForncededores` no item) e listas bidirecionais: no banco novo só FK do lado filho
  (`vendas.md` §8.3).
- **Nomes de campo mortos ainda em uso** (`TotalBonusExtra - deleted`, `TotalComissaoVendedor` como alíquota de
  PIS/COFINS): renomear na migração para `aliquota_icms` e `aliquota_pis_cofins`, e não carregar o nome antigo.

### 8.4 Otimizações para o banco novo

- **Anexos da entrega em tabela própria** `entrega_arquivos(entrega_id, tipo, path, nome, tamanho, mime, criado_por,
  criado_em)` com `tipo ∈ (nf_fornecedor, boleto, comprovante, nf_megabox)`, em vez de um `file` e uma
  `list.file` na entrega. Resolve o limite de 4 boletos, dá auditoria e faz o "conte quantos boletos" ser um `count`.
- **Envio de e-mail registrado**: `entrega_envios(entrega_id, tipo, para, cc, bcc, enviado_em, status, erro)` em vez
  do booleano `NotaBoletoEnviada`. Primeiro envio, reenvio e falha passam a ser contáveis (§4.5).
- **Etapa da entrega como enum próprio** (`Opt.Etapas` hoje serve cotação, pedido e entrega ao mesmo tempo):
  `entrega_status ∈ (pendente, em_entrega, entregue, financeiro, cancelada)`, com a transição
  `pedido → em_entrega` feita por uma função, não por um interruptor de tela.
- **Valores do orçamento como colunas geradas ou view** `v_orcamento_valores` (bruto, comissão bruta, ICMS,
  PIS/COFINS, líquido, unitário líquido), `numeric(14,4)`, arredondamento explícito nos totais — elimina a cadeia
  assíncrona de bTPFh (§5.1) e o "valor velho na tela".
- **`icms_aliquotas(uf_origem, uf_destino)` com PK** e função `aliquota_icms(origem, destino)` que **erra** quando não
  encontra, em vez de devolver vazio.
- **`parametros_fiscais(vigencia_inicio, aliquota_pis_cofins)`**: tira o `0.0925` do código.
- **Índice único parcial** `UNIQUE (cotacao_item_id) WHERE vencedor` — garante um vencedor por item e mata a classe de
  bug que o pareamento por índice do `DuplicarPedido` explora (§4.7). Já proposto em `vendas.md` §8.4; aqui ganha a
  justificativa da duplicação.
- **`UNIQUE (fornecedor_id, numero_nf)` parcial** (`WHERE status <> 'cancelada'`), com a exceção documentada para
  entregas do mesmo item de pedido (a regra que a busca do `alerta nf repetida` já embute) — ver [DÚVIDA 10.10].
- **Duplicação de cotação como uma função SQL** `duplicar_cotacao(pedido_id, cliente_id, endereco_destino_id,
  validade, empresa)` numa transação, que insere itens e orçamentos com colunas explícitas e **recalcula** os valores
  para o novo destino (§5.3).
- **`numero_cotacao` como `sequence`/`identity`**, nunca "último + 1" (§5.4).
- **Trigger de vendedor substituto**: `BEFORE INSERT OR UPDATE ON entregas` aplica a regra de férias uma vez, no
  banco, em vez das 7 cópias espalhadas (§8.2).
- **RLS**: vendedor vê e altera a entrega/pedido em que é `vendedor_id` ou `vendedor_substituto_id`; Financeiro e
  Diretoria veem tudo; só Diretoria altera entrega já em `financeiro` (é a regra que a condicional de `botao anexa nf`
  tenta impor no navegador, §1).

---

## 9. Proposta para o app novo

### 9.1 Rotas e diálogos

Os três são diálogos, não páginas. Seguem o padrão de rota interceptada/paralela de `vendas.md` §9.1 (link
compartilhável, "voltar" fecha), e o **mesmo diálogo** é reaproveitado pelo financeiro:

| Diálogo | Rota | Aberto de |
|---|---|---|
| Anexos e saída da entrega | `vendas/@modal/entrega/[id]/anexos` e `financeiro/@modal/entrega/[id]/anexos` | linha de entrega do pedido (vendas) e linha de conta a receber (financeiro). A prop `contexto` substitui o `Page.Current Page Name` (§8.3) |
| Item do pedido | `vendas/@modal/pedido/[id]/item/novo` e `vendas/@modal/pedido/[id]/item/[itemId]` | botão "Novo Produto" e lápis da linha do item (`vendas.md` §4.6) |
| Duplicar pedido | `vendas/@modal/pedido/[id]/duplicar` | menu do cartão de pedido — **com o botão visível**, ao contrário de hoje (§8.1) |

Cadastro de produto continua sendo o diálogo de `specs/paginas/cadastros.md`, aberto por cima (rota aninhada
`.../item/novo/produto`), com um único gatilho (hoje são dois, §8.2).

### 9.2 Componentes

- **`EntregaAnexosDialog`** — props `{ entregaId, contexto: "vendas" | "financeiro" }`. Subcomponentes:
  `NfFornecedorForm` (número, data, arquivo, "não emite NF"), `BoletosUpload` (n arquivos, não 4),
  `SaiuParaEntregaSwitch` (checkbox próprio, sem plugin), `EnvioNotaBoletoBlock` (primeiro envio / reenvio, com o
  histórico de envios da §8.4), `MotivoCancelamentoForm`. Um único rodapé, com `isDirty` derivado do form.
- **`EntregaCaminhaoBadge`** — o gatilho: ícone de caminhão (SVG local, cor por token), estado por `entrega.status` e
  `entrega.saiu_entrega`, `disabled` por permissão vinda do servidor. Substitui os 5 blocos HTML e o `Icon C` (§2.1).
- **`PedidoItemDialog`** — props `{ pedidoId, itemId? }`. Um só formulário para adicionar e editar (`itemId`
  ausente = adicionar), com `TipoProdutoSelect`, `ProdutoSelect` (dependente do tipo, só ativos),
  `CondicaoSelect` / `LinhaSelect` (dependentes do produto, com a regra "Usado ⇒ linha Usado"), `QtdInput`,
  `MedidaInput`. Recálculo mostrado na hora, calculado no servidor.
- **`DuplicarPedidoDialog`** — `ClienteAutocomplete`, `EnderecoEntregaSelect` (+ atalho para `AgendaEnderecos`),
  `EmpresaEmissoraRadio`, `ValidadeDateInput` (padrão hoje + 2), `ItensDuplicarTabela` (seleção em estado de
  cliente, não no banco) com `OrcamentoVencedorLinha` expansível, e um **aviso correto** sobre a etapa em que a
  cotação nasce (§4.7). O botão só habilita quando há cliente + endereço + ≥ 1 item **e cada item tem exatamente um
  vencedor**.
- Reaproveitados: `AgendaEnderecos`, `CadastroProduto` (outras specs).

### 9.3 Server actions (todas validam sessão, propriedade/perfil e rodam em transação)

- `salvarAnexosEntrega(entregaId, { numeroNf, dataEmissaoNf, naoEmiteNf, saiuParaEntrega, motivoCancelamento },
  { contexto })` — substitui bTcRH, bTcZR, bUErF0 e bTcon. Aplica a transição de status
  (`saiuParaEntrega ⇒ em_entrega`, senão `pedido`) **só** quando o contexto permite, reaplica a regra do vendedor
  substituto (ou deixa o trigger fazer, §8.4) e valida a NF repetida de verdade.
- `anexarArquivoEntrega(entregaId, tipo, file)` / `removerArquivoEntrega(arquivoId)` — upload pelo servidor, com
  validação de mime/tamanho/quantidade, gravando em bucket privado (§7.1).
- `urlAssinadaArquivoEntrega(arquivoId)` — devolve URL assinada de vida curta; substitui o `OpenURL` de bTepV.
- `enviarNotaBoleto(entregaId, { reenvio })` — enfileira o e-mail (`email_outbox`), registra em `entrega_envios` e
  anexa do bucket privado. **Condição de envio explícita**, sem a precedência quebrada da §4.5.
- `adicionarItemPedido(pedidoId, { tipoId, produtoId, condicao, linha, qtd, medida })` — substitui bTibg **inteiro**:
  insere item **e** os orçamentos por origem em um só `INSERT … SELECT` (sem o orçamento duplicado da §4.6),
  resolve a alíquota de ICMS por função e a de PIS/COFINS por parâmetro, e devolve os valores já calculados.
- `editarItemPedido(itemId, { … })` — substitui bTibP, propagando condição/linha/medida/produto **para os
  orçamentos** (hoje só a quantidade vai, §4.6) e recalculando **todos** os orçamentos do item.
- `removerItemPedido(itemId)` — já previsto em `vendas.md` §9.3 (`removerItem`); citado aqui porque o diálogo é o
  mesmo.
- `definirVencedor(orcamentoId)` — a ação que bUAVr/bUAVy tentavam fazer, com o índice único parcial garantindo um
  vencedor por item (§8.4). Já listada em `vendas.md` §9.3.
- `duplicarPedidoComoCotacao(pedidoId, { clienteId, enderecoDestinoId, itemIds[], validade, empresa })` — substitui
  bTzte **e** o backend bUAeU: uma transação que cria a cotação, insere os itens e os orçamentos vencedores com
  colunas explícitas, **recalcula** valores e ICMS para o novo destino, e não copia proposta nem entregas
  (§4.7, §5.3). O vendedor vem da sessão. Valida antes que cada item tenha exatamente um vencedor.

### 9.4 SQL / views

Índices que impõem no banco as duas regras que hoje só existem (mal) na tela:

- `create unique index cotacao_item_vencedor_uniq on cotacao_item_orcamentos (cotacao_item_id) where vencedor;`
  — um vencedor por item; mata a classe de bug do pareamento por índice (§4.7).
- `create unique index entregas_nf_fornecedor_uniq on entregas (fornecedor_id, numero_nf,
  cotacao_item_orcamento_id) where status <> cancelada and numero_nf is not null;`
  — a regra que a busca do `alerta nf repetida` já embute (§3 #1), agora bloqueando de verdade. A exceção por
  `cotacao_item_orcamento_id` preserva a NF repetida entre entregas parceladas da mesma linha de pedido
  ([DÚVIDA 10.10]).

Views e funções:

- **`v_orcamento_valores`** (ou colunas geradas) com as 6 fórmulas da §5.1 em `numeric(14,4)`.
- **`aliquota_icms(uf_origem, uf_destino) returns numeric`** — levanta exceção quando o par não existe (§5.2).
- **`fn_entrega_substituto()`** — trigger `BEFORE INSERT OR UPDATE ON entregas` com a regra de férias (§8.2).
- **`v_entrega_anexos`** — por entrega: tem NF?, quantos boletos, tem comprovante, último envio de nota/boleto.
  Alimenta os contadores que hoje a página `financeiro` monta com `BoletoArquivos:count`.
- **`fn_duplicar_cotacao(...)`** — a transação da §8.4, chamada pela server action.
- **`exists_nf_duplicada(fornecedor_id, numero_nf, entrega_id)`** — a validação da §3 #1 no servidor, com `EXISTS` e
  índice em `(fornecedor_id, numero_nf)`, em vez da varredura no navegador (§7.5).

### 9.5 Tabelas envolvidas

| Nova (proposta) | Bubble hoje | Papel nesta spec |
|---|---|---|
| `entregas` | `Tbl.Entregas` (`tbl_entregas`) | tudo o que o `AnexaNf` grava (§2.1) |
| `entrega_arquivos` | `Entregas.ArquivoNfFornecedor`, `BoletoArquivos`, `BoletoFile`, `ComprovanteEntrega` | anexos, em tabela e bucket privado (§7.1, §8.4) |
| `entrega_envios` | `Entregas.NotaBoletoEnviada` | histórico de envio de NF/boleto (§4.5, §8.4) |
| `cotacoes` | `Tbl.Cotacao` (`tbl_orcamento`) | criada por bUAeU ao duplicar (§4.7) |
| `cotacao_itens` | `Tbl.CotacaoProdutos` (`tbl_orcamentoprodutos`) | criado/editado pelo `AddEdita Produtos`, copiado pelo `DuplicarPedido` |
| `cotacao_item_orcamentos` | `Tbl.OrcFornecedoresCotacao` (`tbl_orcamentfornecedores`) | orçamento por fornecedor; onde está todo o dinheiro (§5) |
| `pedidos` | `Tbl.Pedido` (`tbl_pedidos`) | contrato de entrada dos dois últimos reusables; lista `QuaisOrcamentosFonecedores` |
| `icms_aliquotas` | `Tbl.IcmsEstados` | alíquota por origem×destino (§5.2) |
| `parametros_fiscais` | — (hoje a alíquota está no código) | alíquota de PIS/COFINS com vigência (§5.2) |
| `enderecos_clifor` | `Tbl.EnderecosCliFor` | destino, origem e cobrança |
| `grupos_clifor` | `Tbl.GrupoCliFor` | cliente e fornecedor |
| `produtos_tipo` / `produtos` | `Tbl.ProdutosGrupo` (`tbl_produtossubgrupo`) / `Tbl.ProdutosModelo` (`tbl_produtos`) | dropdowns do `AddEdita Produtos` (atenção à inversão de nomes, cabeçalho) |
| `usuarios` | `User` | `CopiaPedido`, `FeriasPeriod`, `QualVendedorSubstituto`, `QualPerfil`. **`TempOrcamentoProdutos` não existe** no modelo novo (§8.3) |

---

## 10. Dúvidas

Numeradas como `10.n` e citadas assim ao longo da spec. Cada uma traz a recomendação padrão a seguir enquanto não
houver resposta (regra 1 do `CLAUDE.md`).

1. **[DÚVIDA 10.1]** Os nomes `cpo.TotalBonusExtra - deleted` e `cpo.TotalComissaoVendedor` impressos pelo mapa são,
   pelos ids, `cpo_tributos_number` (`TributosICMS`) e `cpo_tributopiscofinsb_number` (`TributoPISCOFINS`) —
   é o que o cabeçalho desta spec assume. `financeiro-reusables.md` [DÚVIDA 21] leu os mesmos nomes como campos
   inexistentes (e, por consequência, ICMS e PIS/COFINS zerados). *Recomendação:* confirmar no editor do Bubble qual
   campo cada id representa antes de escrever a migration; até lá, tratar como alíquotas reais (§5.1) e **não**
   assumir zero, porque bTiea grava valores neles.
2. **[DÚVIDA 10.2]** O aviso da tela diz que a duplicação cria o pedido na etapa **PROPOSTA**; o backend bUAeU cria
   uma `Tbl.Cotacao` na etapa **Cotação**, sem proposta e sem pedido. Qual é o comportamento desejado?
   *Recomendação:* manter o que o código faz (nasce como **cotação**) e corrigir o texto da tela; se o negócio quiser
   pular direto para proposta, isso é uma decisão nova, não migração.
3. **[DÚVIDA 10.3]** No `AnexaNf`, alterar **só** a data de emissão da NF não habilita o botão Gravar (não há
   condicional comparando `DtEmissaoNf` com `ipt data nf`). É intencional? *Recomendação:* não — no app novo o
   `isDirty` cobre todos os campos do formulário.
4. **[DÚVIDA 10.4]** Na variante `financeiro`, o WF de gravação está no **grupo** `gp grava financeiro` (bUEqo0) e o
   botão "Cancela" (bUEqu0) **não tem workflow**. Clicar em qualquer lugar do rodapé grava, inclusive no botão que
   parece cancelar. Confirmar que é bug. *Recomendação:* tratar como bug; no app novo, um handler por botão.
5. **[DÚVIDA 10.5]** Ainda na variante `financeiro`: bUErF0 exige `tgg saiuentrega = true`, não persiste `SaiuEntrega`
   nem `NaoEmiteNF`, e não existe variante para o interruptor desligado — logo uma entrega que chegou ao Financeiro
   com `SaiuEntrega = false` não consegue receber NF nem boleto por ali. O Financeiro reclama disso hoje?
   *Recomendação:* no app novo, uma única ação que grava NF/boletos **sem** depender do interruptor, e a transição de
   status só quando o contexto e o perfil permitem.
6. **[DÚVIDA 10.6]** Ao adicionar item ao pedido (bTibg), nada acrescenta o novo item a
   `Cotacao.QuaisProdutos` — só `Pedido.QuaisOrcamentosFonecedores` é atualizado (bTicX). A cotação do pedido fica
   sem o item novo na lista? *Recomendação:* sim, é lacuna; no banco novo a relação é FK
   (`cotacao_itens.cotacao_id`) e o problema desaparece.
7. **[DÚVIDA 10.7]** A condição do `SendEmail` (§4.5) resolve, pela precedência do Bubble, para
   `((primeiravez OR jaEnviada) AND segundavez)`, o que impede o **primeiro** envio. O e-mail de NF+boleto funciona
   hoje na prática? *Recomendação:* confirmar com quem usa (é a pergunta mais urgente desta spec). No app novo a
   condição é explícita: envia quando o usuário pedir, seja primeiro envio ou reenvio, e cada envio fica registrado.
8. **[DÚVIDA 10.8]** Com `StatusEntrega = Concluído`, nenhum gatilho do `AnexaNf` é renderizado (nem caminhão, nem
   `Icon C`) — o diálogo fica inalcançável. `Concluído` é usado para entregas? *Recomendação:* não usar essa etapa
   para entregas (o enum novo é próprio da entrega, §8.4); se for usada, o gatilho tem de existir.
9. **[DÚVIDA 10.9]** O conteúdo do `HTML D` (bTcnb, 52 caracteres) não foi preservado pelo mapa e o elemento nunca é
   exibido. *Recomendação:* ignorar; se for necessário, conferir no editor antes do corte.
10. **[DÚVIDA 10.10]** A busca de NF repetida exclui de propósito as entregas do **mesmo** orçamento
    (`QualOrcamentoFornecedor ≠ ...`): a mesma NF pode se repetir entre entregas parceladas da mesma linha de pedido,
    mas não entre linhas diferentes do mesmo fornecedor. A regra é essa? *Recomendação:* sim — é o que o índice único
    parcial da §9.4 reproduz; validar com o Financeiro antes de bloquear de fato, porque hoje é só um aviso.
11. **[DÚVIDA 10.11]** `dd enderecoentregacliente copiar` lista **todos** os endereços do cliente, sem filtrar por
    tipo (entrega) nem excluir endereço bloqueado. *Recomendação:* filtrar por endereço de entrega e não bloqueado,
    como as demais telas de vendas fazem.
12. **[DÚVIDA 10.12]** A tabela de itens do `DuplicarPedido` sai de
    `Pedido.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto`: um item com mais de um orçamento no pedido aparece
    **repetido**. Confirmar se acontece na base real. *Recomendação:* listar os itens do pedido direto (FK), com
    `distinct`, e marcar quais têm vencedor.
13. **[DÚVIDA 10.13]** `QualEndereçoCobrança` recebe o endereço **do fornecedor** ao adicionar item (bTicR) e o
    endereço de **entrega do cliente** ao duplicar (bUAfi). Qual é o correto? *Recomendação:* é o endereço de
    faturamento do **cliente**; tratar o valor de bTicR como bug e confirmar o efeito no financeiro antes de migrar.
14. **[DÚVIDA 10.14]** Adicionar item cria **dois** orçamentos para o mesmo fornecedor (bTicR + `AdicionarFornecedores`
    bTNrd), e o passo bTOTf0 sobrescreve `Item.QuaisOrcamentosForncededores` com apenas o de bTNrd — deixando o
    vencedor fora da lista. Isso é visível na tela hoje (item que "não tem vencedor")? *Recomendação:* tratar como
    bug; no app novo é um único `INSERT … SELECT` que já marca o vencedor (§9.3).
15. **[DÚVIDA 10.15]** Editar o item (bTibP) propaga para o orçamento **apenas** `QtdVenda`; condição, linha, medida e
    produto ficam divergentes entre item e orçamento. Qual dos dois a proposta e o pedido devem mostrar?
    *Recomendação:* o item é a fonte; no app novo esses campos não se duplicam no orçamento (ou são propagados na
    mesma transação).
16. **[DÚVIDA 10.16]** As ações bUAaR e bUAaY aparecem idênticas no mapa porque o decompilador não preserva o
    operador `:plus item` / `:minus item`. *Recomendação:* ler pela condição (bUAaL acrescenta, bUAaT remove); no app
    novo é seleção em estado de cliente e a dúvida deixa de existir.
17. **[DÚVIDA 10.17]** As cópias de item e de orçamento do `DuplicarPedido` mantêm `QualCotacao` apontando para a
    cotação **antiga**, e nada grava a cotação nova nesses campos. Isso quebra relatórios por cotação?
    *Recomendação:* tratar como bug; na função nova a FK é gravada na mesma transação.
18. **[DÚVIDA 10.18]** As cópias de orçamento mantêm `QualProposta` e **`QuaisEntregas`** do pedido original — a
    cotação nova nasce ligada às entregas velhas. Existem casos assim na base? *Recomendação:* auditar antes do corte
    (`cotacao_item_orcamentos` com entrega de outra cotação) e, na migração, zerar esses vínculos.
19. **[DÚVIDA 10.19]** O pareamento item↔orçamento de bUAeU é **por índice** nas duas listas; item sem vencedor ou com
    dois vencedores desalinha tudo. Confirmar se há itens sem vencedor em pedidos reais. *Recomendação:* exigir
    exatamente um vencedor por item, com o índice único parcial da §9.4, e bloquear a duplicação antes de começar.
20. **[DÚVIDA 10.20]** A alíquota de PIS/COFINS de **9,25%** está chumbada em dois lugares (bTiea e o backend bTNri).
    Ela varia por empresa emissora, por regime ou no tempo? *Recomendação:* parâmetro com vigência em
    `parametros_fiscais`, iniciando em 9,25%, **com teste** (regra 10 do `CLAUDE.md`).
21. **[DÚVIDA 10.21]** Ao duplicar, os valores são copiados sem recálculo, **inclusive o ICMS**, mesmo quando a UF de
    destino do novo cliente é diferente da do pedido original. O usuário espera preço congelado ou preço recalculado?
    *Recomendação:* recalcular ICMS e PIS/COFINS pelo novo par origem×destino sempre, e manter preço unitário e
    comissão do original (que é o motivo de duplicar), avisando na tela quando a alíquota mudar.
22. **[DÚVIDA 10.22]** O `DuplicarPedido` está inalcançável na interface (`Icon GZZZ` nunca visível) — o recurso deve
    voltar no app novo ou foi abandonado de propósito? *Recomendação:* reimplementar (o valor comercial é claro:
    recompra), já corrigido conforme 10.2, 10.17, 10.18, 10.19 e 10.21; decisão final é do usuário.
23. **[DÚVIDA 10.23]** Quem pode alterar NF, boletos e status de uma entrega já em `Financeiro`? A condicional de
    `botao anexa nf` diz "só hierarquia 1", mas é anulada na página `financeiro` para qualquer perfil.
    *Recomendação:* Diretoria e perfil Financeiro; vendedor não. Impor na RLS e na server action (§8.4, §9.3).
24. **[DÚVIDA 10.24]** Quantos boletos, de fato? O componente limita a 4 e o e-mail tem 5 posições fixas de anexo.
    *Recomendação:* sem limite fixo no banco (`entrega_arquivos`), limite configurável na tela, e anexos do e-mail
    montados a partir da lista real.

---

## 11. Cobertura — todos os 25 workflows

Conferido por script sobre o mapa: `grep '^#### WF' mapa/reusable-pop.AnexaNf.md` = **9**,
`... reusable-pop.AddEdita_Produtos.md` = **6**, `... reusable-pop.DuplicarPedido.md` = **10** → **25**, igual à soma
do `00-inventario.md` (9 + 6 + 10). Os 25 ids do mapa e os 25 ids desta tabela batem exatamente: nenhum id do mapa
ficou de fora e nenhum id desta tabela foi inventado (a conferência está reproduzida no fim da seção).

### 11.1 `pop.AnexaNf` (bTbua) — 9 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTbux | Clique `botao anexa nf` (bTmJL0) | `ToggleElement` (bTbuy) no popup `GroupFocus A` — abre e fecha o diálogo da entrega | 2.1, 4.1 |
| 2 | bTcBK | Clique `Button Cancela naocancelado` (bTcAI) | esconde (bTcBQ) e reseta (bTcQP) o popup; descarta o digitado, não desfaz upload | 4.1 |
| 3 | bTcRH | Clique `Button Gravar não cancelado`, **interruptor ligado** | grava NF, data, arquivo, boletos, "não emite NF", `NotaBoletoEnviada`, `SaiuEntrega` e **`StatusEntrega = Em Entrega`** (bTcRM); e-mail NF+boleto (bTiFG0); reset (bThGA); vendedor substituto de férias (bTyBZ) | 4.3(a), 4.5 |
| 4 | bTcZR | Clique `Button Gravar não cancelado`, **interruptor desligado** | igual ao anterior, mas **`StatusEntrega = Pedido`** (bTcZW) e com `PauseWFClient` (bTepJ) antes do e-mail (bTiFB0); reset (bThFz); substituto (bTyBe) | 4.3(b), 4.5 |
| 5 | bTcon | Clique `Button Gravarcancelado` (bTcoh) | grava `MotivoCancelamento` (bTcot) e depois esconde (bTcou) — nada mais é gravado | 4.4 |
| 6 | bTcrF | Clique `Button Cancela cancelado` (bTcoi) | esconde (bTcrK) e reseta (bTcrL); idêntico a bTcBK | 4.1, 8.2 |
| 7 | bTepV | Clique `btn abrir nota` (bTepP) | `OpenURL` (bTepb) com `Entrega.ArquivoNfFornecedor:url` em nova aba — **URL pública de CDN** | 4.2, 7.1 |
| 8 | bTiEL0 | Clique `Text I` ("Envia nota fiscal e/ou boleto para o cliente") | **zero ações** — workflow vazio, código morto | 4.1, 8.1 |
| 9 | bUErF0 | Clique no **grupo** `gp grava financeiro` (bUEqo0), interruptor ligado | variante da página `financeiro`: grava NF, data, arquivo, boletos e `NotaBoletoEnviada` (bUErL0) **sem** tocar em `StatusEntrega`, `SaiuEntrega` e `NaoEmiteNF`; e-mail (bUErM0); reset (bUErN0); substituto (bUErR0) | 4.3(c), 10.4, 10.5 |

### 11.2 `pop.AddEdita Produtos` (bTiZh) — 6 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 10 | bTiax | Clique `Image abre cadastro produtos` (bTiZt) | `ShowElement` (bTibC) em `pop.CadastroProdutos A` | 2.2, 4.6 |
| 11 | bTibH | Clique `Icon edita produto` (bTiaM) | abre o cadastro de produtos (bTibJ) **no produto selecionado** (`DisplayGroupData` bTibN com `dd add modelo produto`) | 4.6 |
| 12 | bTibP | Clique `Icon salvar produto` (bTiar) — modo editar | grava o item (bTibU: condição, linha, medida, qtd, tipo, produto), grava **só `QtdVenda`** no orçamento (bTigL), agenda `CalculaFornecedoresLista` bTPFh só para esse orçamento (bTibZ), reseta (bTibb) e esconde (bTieb) | 4.6, 5.1, 10.15 |
| 13 | bTibg | Clique `Icon add produto` (bTiav) — modo adicionar | cria o item (bTicQ) e o orçamento **já vencedor** (bTicR), grava alíquota de ICMS da tabela e PIS/COFINS 9,25% (bTiea), anexa o orçamento ao pedido (bTicX), reseta (bTicV), esconde (bTicW) e agenda `AdicionarFornecedores` bTNrd (bTieH) — que **cria um segundo orçamento** para o mesmo fornecedor | 4.6, 5.2, 10.14 |
| 14 | bTigj | Clique `Group A` (bTiZp) | `ShowElement` (bTigp) em `pop.CadastroProdutos A` — **idêntico a bTiax**, no grupo que envolve a mesma imagem | 8.1, 8.2 |
| 15 | bTigv | `PopupClosed` no próprio reusable | `ResetGroup` (bTigx): limpa os campos ao fechar | 2.2, 4.6 |

### 11.3 `pop.DuplicarPedido` (bUAJN) — 10 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 16 | bUAMz | Clique `Icon A` (bUALF, agenda de endereços) | abre `pop.AgendaEnderecos A` (bUANE) e passa o cliente no estado `var_qualgrupoclifor_` (bUANF). **Já especificado em `specs/paginas/enderecos-e-contatos.md`** | 4.7 |
| 17 | bUAUk | `InputChanged` em `dd tipofrete copiar` (bUAOL), `SÓ SE ≠ CIF Informado` | zeraria `ValorFrete` (bUAUp) e agendaria `CalculaFornecedoresLista` bTPFh (bUAUq) — **inalcançável**: o dropdown é `disabled` sem condicional que habilite, e escreveria no orçamento do pedido original | 4.7, 8.1 |
| 18 | bUAVr | Clique no troféu `Icon B` (bUAOq), `SÓ SE Vencedor:is_true` | tiraria o vencedor (bUAVt `Vencedor = False`) — **inalcançável**: troféu `button_disabled=True` sem condicional que habilite | 4.7, 8.1 |
| 19 | bUAVy | Clique no troféu `Icon B` (bUAOq), `SÓ SE Vencedor:is_false` | tiraria o vencedor atual (bUAWD) e marcaria o clicado (bUAWE) — **impossível**: a tabela já é filtrada por `Vencedor = True` | 4.7, 8.1 |
| 20 | bUAWJ | Clique `Text B` "Produto / Fornecedor" (bUASl) | alterna a sub-tabela de fornecedores (bUAWL) e os títulos ICMS (bUAWP) e PIS/COFINS (bUAWQ) | 4.7, 8.2 |
| 21 | bUAWh | Clique `Icon B` chevron (bUAPx) | as mesmas três ações (bUAWj, bUAWn, bUAWo) — **idêntico a bUAWJ** | 4.7, 8.2 |
| 22 | bUAaL | Clique `btn seleciona produto` (bUARe), `SÓ SE não contém` | **acrescenta** o item a `User.TempOrcamentoProdutos` (bUAaR) — seleção gravada no banco, no usuário | 4.7, 8.3, 10.16 |
| 23 | bUAaT | Clique `btn seleciona produto` (bUARe), `SÓ SE contém` | **remove** o item de `User.TempOrcamentoProdutos` (bUAaY) | 4.7, 8.3, 10.16 |
| 24 | bTzte | Clique `btn gravarcotacao` "Duplicar Pedido" (bUAXd) | copia os itens selecionados (bUAem) e ajusta cliente/destino, zerando a lista de orçamentos (bUAfn); copia os orçamentos **vencedores** (bUAer) e ajusta destino e cobrança, zerando o vínculo com o item (bUAfi); agenda `VicularOcamentoCopiaAoProdutoCopia` bUAeU (bUAeh), que pareia por índice e cria a `Tbl.Cotacao` nova; esconde (bUAgd) e reseta (bUAgf) | 4.7, 5.3, 6, 10.17–10.21 |
| 25 | bUAgB | Clique `btn cancelacotacao` (bUAXf) | esconde (bUAgH) e reseta (bUAgM) — **não limpa `User.TempOrcamentoProdutos`**, a seleção fica gravada | 4.7, 8.3 |

### Conferência por script

```
$ grep -c '^#### WF' mapa/reusable-pop.AnexaNf.md           # 9
$ grep -c '^#### WF' mapa/reusable-pop.AddEdita_Produtos.md  # 6
$ grep -c '^#### WF' mapa/reusable-pop.DuplicarPedido.md     # 10
                                                            # total 25
```

Ids do mapa, na ordem em que aparecem:

- `AnexaNf` (9): bTbux · bTcBK · bTcRH · bTcZR · bTcon · bTcrF · bTepV · bTiEL0 · bUErF0
- `AddEdita Produtos` (6): bTiax · bTibH · bTibP · bTibg · bTigj · bTigv
- `DuplicarPedido` (10): bUAMz · bUAUk · bUAVr · bUAVy · bUAWJ · bUAWh · bUAaL · bUAaT · bTzte · bUAgB

Conferência feita comparando esta lista com a coluna `WF` das três tabelas acima: **25 = 25**, diferença simétrica
vazia nos dois sentidos. Dos 25, 24 eram os apontados como não cobertos pelo checksum; o 25º (bUAMz) já estava coberto
em `specs/paginas/enderecos-e-contatos.md` e aparece aqui para fechar o arquivo.
