# Spec funcional — página `vendas` (Fluxo de Vendas)

Fonte: `mapa/pagina-vendas.md` (id da página `bTJrH`; 1.311 elementos, 167 workflows, 387 ações, 390 condicionais, 10 popups, 21 tabelas, 2 RGs, 2 HTML). Apoio: `backend-workflows.md`, `data-types.md`, `option-sets.md`, `integracoes.md`, reusables `pop.AnexaNf`, `pop.AddEdita Produtos`, `pop.DuplicarPedido`, `tool.Endereco*`, `tool.Cabecalho`, `tool.MenuPaginas`.
Se esta spec e o mapa discordarem, o mapa manda.

### Nota sobre nomes de campos no mapa

O decompilador resolveu alguns ids de campo pelo nome de **outro** data type que usa o mesmo id. Nesta spec uso o nome real (coluna da direita):

| Tipo | Nome que aparece no mapa | Campo real (id) |
|---|---|---|
| OrcFornecedoresCotacao | `cpo.valorcomissao` | `ValorComissaoUnit` (`cpo_valorcomissao_number`) |
| OrcFornecedoresCotacao | `cpo.TotalComissaoVendedor` | `TributoPISCOFINS` — alíquota PIS/COFINS (`cpo_tributopiscofinsb_number`) |
| OrcFornecedoresCotacao | `cpo.TotalBonusExtra - deleted` | `TributosICMS` — alíquota ICMS (`cpo_tributos_number`) |
| Entregas | `cpo.DataEntrega` | `DtPrevEntrega` — data **prevista** (`cpo_dataentrega_date`) |
| Entregas | `cpo.dtentrega` | `DtEntrega` — data **real** (`cpo_dtentrega_date`) |
| Entregas | `cpo.valorcomissao` | `ValorComissaoBruto` (`cpo_valorcomissao_number`) |
| Entregas | `cpo.NumeroPedido` | `NumeroEntrega` (`cpo_numeropedido_text`), recebe o nº do pedido |
| CotacaoProdutos | `cpo.qtd` / `cpo.QualProduto` | `Qtd` / `QualProdutoModelo` |
| Pedido | `cpo.CorpoEmail` | `CorpoEmailFornecedor` (`cpo_corpoemail_text`) |
| ContasReceber | `cpo.valorcomissao` | `ValorComissao` |

Também: `=` em campo lista no mapa não distingue "definir", "adicionar" ou "remover". Onde isso muda a regra, marquei [DÚVIDA].

Glossário do negócio (deduzido dos fluxos): a MegaBox **intermedeia** a venda. O fornecedor fatura direto para o cliente, e a MegaBox ganha **comissão** do fornecedor. "Contas a receber", nesta página, é a comissão que o fornecedor deve à MegaBox. "Contas a pagar" é a comissão do vendedor (3% da comissão da entrega).

---

## 1. Propósito e quem usa

**Propósito.** É o quadro comercial (kanban) do ciclo **cotação → proposta → pedido → entregas → confirmação de entrega (gera contas a receber e a pagar)**. Nele o vendedor:
- monta cotações com vários produtos e vários fornecedores por produto e escolhe um vencedor por produto;
- gera propostas em PDF e as envia por e-mail ao cliente;
- transforma uma proposta enviada em pedido, formaliza o pedido por e-mail ao cliente e ao fornecedor e agenda as entregas;
- acompanha as entregas até confirmá-las. A confirmação cria as parcelas de comissão a receber e a comissão do vendedor.

**Quem usa.** Departamento Comercial (vendedores), com gerência e diretoria acompanhando. O item de menu "Fluxo de Vendas" (`Opt.MenuPaginas.licita__o`, página `vendas`, hierarquia 4) é liberado por `ConfigSistema.QuaisDeptos`/`QuaisPerfis` (reusable `tool.MenuPaginas`, condicionais das linhas 79–80).

**Controle de acesso de fato (só no navegador):**
- A página não tem checagem própria. Quem digita a URL entra. `tool.Cabecalho` (WF bTKRG) só desloga usuário inativo.
- Perfil (`Opt.PerfilUsuario.hierarquia`: Diretor 1, Gerente 2, Analista 3, Operador 4):
  - hierarquia > 2 (Analista/Operador): no carregamento a URL recebe `vendedor=<próprio id>` (WF bTKAD, ação bTiYV), e o filtro de vendedor fica travado nele (condicional de `dd filter vendedor`). Se o usuário trocar o parâmetro na URL, vê os dados de outro vendedor.
  - Diretor: com `pedidosconcluidos=yes`, vê cotações de todas as etapas menos Cancelado (condicional de `rpg cardscotacao`). Pode clicar em "recalcular entrega" com a entrega já em Financeiro (condicional de `force calc`).
  - hierarquia > 1 (todos menos Diretor): não edita cotação arquivada (condicional de `btn edita orcamento`) nem abre a confirmação/edição de entrega já em Financeiro (condicionais de `btn edita pedido`/`ico proposta` nos cartões de entrega).
  - Editar os produtos do pedido (ícone `Icon FZZ`): só quem criou o pedido ou o Diretor.
  - `CurrentUser.IsDev`: mostra campos de depuração (`ipt comissao dos orcamentos`, `ipt soma comissao das entregas`, `ipt difereca comissao`, `ipt pedido contaentrega`, `ipt pedido entregasconcluidas`).

---

## 2. Estrutura da tela

### 2.1 Layout geral
- `reus cabecalho A` (tool.Cabecalho) no topo. No carregamento, o submenu fica em `Opt.MenuConfig.sub_licita__o_1` (WF bTKAD, ação bTKAH).
- `tool.DashMenu A` (tool.MenuPaginas) e `tool.Historico A` (tool.Historico): painéis que aparecem conforme `var_showmenu_` / `var_showhistorico_` do cabeçalho.
- `gp content`:
  - `gp tabs`: barra de filtros e botões (2.2).
  - `Table etapas`: quadro de 4 colunas sobre `All(Opt.Etapas)`. As colunas são fixas: **Cotação | Pedido | Entregas Próprias | Entregas Substituto**. A linha 1 tem os títulos, a linha 2 os contadores e a linha 3 os cartões.

### 2.2 Filtros e parâmetros de URL
Todos os filtros vivem na URL. Cada mudança chama `ChangePage` na própria página, mantendo os demais parâmetros.

| Parâmetro | Controle | Valores / padrão (WF bTKAD) | Efeito |
|---|---|---|---|
| `datainicio`, `datafim` | `RangePicker A` (plugin 1648823245313…) + ícone `Icon H` (volta ao mês corrente) | Padrão: `User.UltimoDateRange` se existir (ação bTdJn). Senão, dia 1 00:00 até "dia 31" 23:59:59 do mês atual (ação bTiiF) | Filtra por data de criação (cotações/pedidos) ou por data do pedido/entrega (entregas). Ao escolher, grava `User.UltimoDateRange` (WF bTiYD) |
| `vendedor` | `dd filter vendedor` (todos os Users, por nome) + `Icon EZZ` limpa | Forçado ao próprio usuário se hierarquia > 2 (ação bTiYV) | Cotação/pedido/entrega própria por `QualVendedor`. Entregas substituto por `QualVendedorSubstituto` |
| `numeropedido` | `ipt filter numpedido` + `Icon Q` limpa | vazio | Cotação por `CotacaoNum`, pedido por `NumeroPedido`, entrega por `NumeroEntrega` |
| `cliente` | `ipt filter cliente` (GrupoCliFor tipo Cliente e ativo, busca por nome) + `Icon EZZZ` limpa | vazio | Todas as colunas |
| `cotacaoarquivada` | botão "cotações arquivadas" | `no` | Coluna Cotação mostra só arquivadas (`yes`) ou só não arquivadas (`no`) |
| `ordemdecrescente` | botão "data crescente" | `yes` | **Nenhuma busca usa** (todas ordenam por data de criação decrescente). Botão sem efeito |
| `expandircartoes` | botão "expandir cartões" | `no` | `yes` mostra o resumo/detalhe de todos os cartões |
| `pedidosconcluidos` | botão "exibe concluídos" | `no` | Coluna Pedido: `PedidoFinalizado = yes/no`. Ao ligar, `etapaentrega=Financeiro` (WF bTiWJ). Ao desligar, `etapaentrega=Em Entrega` (WF bTfTb0) |
| `etapapedido` | botão "exibe cancelados" | `Pedido` | Alterna `Pedido` ↔ `Cancelado` e, junto, `etapaentrega` `Em Entrega` ↔ `Cancelado` (WFs bTiWQ/bTiWX) |
| `etapaentrega` | (derivado dos botões acima) | `Em Entrega` | Coluna Entregas Próprias por `StatusEntrega` |
| `filtrapedido` | checkbox no cartão de pedido | vazio | Entregas Próprias/Substituto só desse pedido. Destaca o cartão |
| `filtraentrega` | checkbox no cartão de entrega | vazio | Coluna Pedido só com o pedido dessa entrega |
| `filtrafinanceiro` | nenhum controle nesta página (só é limpo) | vazio | Filtra pedido e entregas. Presumo que venha de link de outra página [DÚVIDA] |

Botão "+ Cotação" (`btn nova cotação`) abre o popup de cotação em modo Nova.

### 2.3 Cartões

**Cartão de cotação** (`gp card cotacao`, fundo cinza se arquivada)
- Foto do cliente (placeholder se vazio), "Cliente – Nº CotacaoNum", vendedor (primeiro nome de quem criou), data da cotação (dd/mm/yy).
- Se arquivada: botão com o motivo do arquivamento ("Motivo não disponível" se vazio). O clique reabre o popup de arquivamento (WF bTlYI).
- Ícones: editar (desabilitado se arquivada e hierarquia > 1); proposta com contador de propostas. O ícone de proposta só aparece com ≥1 produto e ≥1 vencedor, contados pelos inputs ocultos `ipt cartão contaproduto`/`ipt cartao contavencedor`, e fica desabilitado se arquivada.
- Resumo (clique no cartão alterna, WF bTQAy; ou `expandircartoes=yes`): "N produtos no carrinho", "N produtos possuem vencedores", "N propostas enviadas" (na verdade conta todas as propostas) e ícone arquivar/desarquivar.

**Cartão de pedido** (`gp card pedido`)
- Fundo verde claro se todas as entregas estão "concluídas" (`Opt.Etapas.concluido` = Financeiro, Concluído ou Cancelado). Fundo vermelho claro se o pedido está Cancelado. Sombra se filtrado.
- Checkbox `chk filtrapedido`, escondido quando o filtro ativo é por entrega ou financeiro.
- Foto, "Cliente – Nº NumeroPedido", vendedor (criador da cotação), "Dt Pedido" (data de criação de `Cotacao.QualPedido`), "Cancelado: motivo" quando cancelado.
- Quando todas as entregas estão concluídas: "Entregas concluidas", dropdown "Qual email cliente?" (contatos do cliente) e botão "retira pedido" (WF bTfPH). Os dois somem se o pedido já está finalizado.
- Ícones: info (tooltip com `MotivoAlteraValores` quando o financeiro alterou valores), editar pedido (WF bTbZy), duplicar (`Icon GZZZ`, oculto e sem condicional que o mostre — ver seção 8).
- Detalhe (clique alterna, WF bTbai): lista das entregas com qtd, data prevista, produto e NF. Azul/negrito se "Em Entrega" e saiu; vermelho se Cancelado. Ícone "cancelar todo o pedido" (WF bTejh), desabilitado quando todas as entregas estão concluídas.

**Cartão de entrega própria** (`gp card entrega` bTbxh) e **de substituto** (bTzTJ)
- Fundo vermelho se Cancelado, azul (`bTHHW`) se Financeiro. Checkbox `chk filtraentrega`.
- "Cliente – Nº pedido – NF", vendedor, "Dt Pedido:" com a **data prevista de entrega** (rótulo errado). Com `pedidosconcluidos=yes` vira "Dt Entrega:" com a data real. "Cancelado: motivo" quando cancelado. Ícone info com `MotivoAlteracaoValores`.
- Ícones: editar pedido (abre o pedido da entrega; desabilitado se Financeiro e hierarquia > 1) e caminhão "confirmar entrega" (abre `pop confirma entrega`).
  - Própria: caminhão cinza/desabilitado se Cancelado, ou se Financeiro e hierarquia > 1.
  - Substituto: só habilitado se `StatusEntrega = Em Entrega`.
- Detalhe (clique alterna, WFs bTiFL0/bTzTz): qtd, data prevista, produto.

### 2.4 Popups e reusables

| Elemento | Tipo | Dado | Para quê |
|---|---|---|---|
| `pop add edita cotacao` (bTNaG) | Popup | Cotacao | Criar/editar cotação e o carrinho de produtos × fornecedores |
| `pop add fornecedor` (bTNjw) | Popup | CotacaoProdutos | Escolher fornecedores (endereços) para orçar um produto |
| `pop consulta icms` (bTPaz) | Popup | — | Consultar/editar a alíquota de ICMS por UF de origem × destino |
| `pop add edita propostas` (bTOrR) | Popup | Cotacao | Histórico de propostas, criar/editar/enviar proposta, virar pedido |
| `pop add edita pedido` (bTatj) | Popup | Pedido | Pedido ao fornecedor: e-mails, OC, entregas, formalização |
| `pop edita produtos do pedido` (bThqj) | Popup | Pedido | Editar quantidades/valores dos itens do pedido |
| `pop confirma entrega` (bTcVt) | Popup | Entregas | Confirmar a entrega e gerar a previsão de recebimentos |
| `pop cancelar entrega e pedido` (bTPXu0) | Popup | — (estados) | Cancelar entrega ou pedido, com e-mails |
| `pop.ArquivaCotação` (bTlCd) | Popup | Cotacao | Arquivar com motivo |
| `pop apagar registro` (bTJzl) | Popup | — | Confirmação genérica "SIM/NÃO", **sem workflows** (morto) |
| `pop.DuplicarPedido A` | Reusable | Pedido | Duplicar pedido como nova cotação (só abre pelo ícone oculto) |
| `pop.CadastroClienteFornecedor A` | Reusable pop.CadastroCliFor | — | Nenhum WF da página o abre [DÚVIDA] |
| `pop.AddEdita Produtos A` | Reusable | OrcFornecedor | Adicionar/editar produto dentro de um pedido |
| `pop.CadastroProdutos A` | Reusable | ProdutosModelo | Cadastro de produto |
| `pop.AgendaContatos A` | Reusable | GrupoCliFor | Agenda de contatos do cliente/fornecedor |
| `pop.AgendaEnderecos A` | Reusable | (estado `var_qualgrupoclifor_`) | Endereços, novo cliente ou novo fornecedor (`var_a__oclifor_`) |
| `tool.AnexaNf A` | Reusable pop.AnexaNf (por entrega) | Entregas | Anexar NF/boletos e marcar "saiu para entrega" |
| `tool.EnderecoFornecedor/Entrega/Cobranca A` | Reusables | OrcFornecedor | Escolher endereço de origem/entrega/cobrança do item do pedido |

### 2.5 Estados customizados

| Onde | Estado | Uso |
|---|---|---|
| Página | `var_a__ovendas_` (Opt.Ações) | Nova Cotação / Edita Cotação: controla título, botões, fonte do carrinho e ICMS padrão |
| Página | `var_a__oor_amento_` (Opt.Ações) | Novo Produto / Edita Produto no formulário de produto do carrinho |
| Página | `var_todosfornecedores_` | Expandir as listas de fornecedores de todos os produtos do carrinho |
| Página | `var_ultimotblpedido_`, `var_ultimoemailcliente_` | Último pedido fechado e e-mail (usados só pelo WF desativado bUESt) |
| Página | `var_showalert_`, `var_usaroldpdf_`, `var_todosetapacotacao_` | `var_showalert_` recebe false em bTiKL0. Os outros dois não são usados |
| `pop add fornecedor` | `varfornecedoresselecionados_` (lista EnderecosCliFor), `var_distanciamaiormenor_` | Seleção de fornecedores; ordenação por distância |
| `pop add edita propostas` | `var_acaocotacao_` (Nova/Edita/Exibe Proposta), `var_exibeproposta_`, `var_enviamailproposta_` | Modo do popup; proposta selecionada; `var_enviamailproposta_` é gravado e nunca lido |
| `pop add edita pedido` | `var_acaocotacao_` (Novo/Edita Pedido), `var_deletarentregas_` (lista) | Modo; entregas marcadas para apagar |
| `pop cancelar entrega e pedido` | `var_qualpedido_`, `var_qualentrega_`, `var_a__ocancelamento_` | Alvo e tipo do cancelamento |

### 2.6 Popup de cotação (`pop add edita cotacao`)
- Cabeçalho: título "Nova Cotação"/"Edita Cotação"; checkbox "Pedido de Amostra" (`Cotacao.Amostra`); "Cotação núm." (somente leitura; na nova, último `CotacaoNum` + 1).
- Cliente: autocomplete de clientes ativos (desabilitado na edição) e ícone "novo cliente" (WF bTeyi). Se `pop.AgendaEnderecos` acabou de cadastrar um cliente, ele vira o padrão.
- "Endereço de entrega": endereços do cliente, com ícone da agenda de endereços (WF bTcjZ).
- Empresa emissora: rádio `Opt.EmpresaMegabox` (Megabox/Paletes Brasil, padrão Megabox), com logo. "Data cotação" (hoje na nova). "Data Validade" (padrão hoje + 2 dias, obrigatória). "Vendedor".
- Formulário de produto (`gp add produto`): Tipo produto (ProdutosGrupo) → Produto (ProdutosModelo do grupo, ativos) → Condição (`produto.QuaisCondicoes`) → Linha (`produto.QuaisLinhas`; padrão "Usado" se a condição for Usado) → Qtd → "Medida, descrição ou obs.". Ícones: carrinho (adicionar) ou disquete (salvar edição), lápis (editar cadastro do produto), paleta (abrir cadastro de produtos).
- Carrinho (`rpg produto orcamento`): na nova, `User.TempOrcamentoProdutos`; na edição, `Cotacao.QuaisProdutos` + `TempOrcamentoProdutos`. Por produto:
  - Linha-resumo: ícone do tipo, NOME, "condição – linha – medida", nº de fornecedores, troféu com o nome do vencedor. Com a lista fechada, mostra também os valores do vencedor: total bruto, comissão bruta, total líquido, unitário, comissão unitária, tipo e valor de frete, valor PIS/COFINS. Ícones de excluir produto e de expandir.
  - Colunas à direita: Qtd editável; fábrica "Adiciona fornecedor para orçar"; alfinete "Destino desse produto" (verde se tem destino; **sem workflow**); lápis editar produto.
  - Sub-tabela `rpg fornecedorescotacao` (oculta; abre pelo nome/chevron ou por "abrir todos"): "FORNECEDOR – UF" + regime tributário (ou "Falta regime tributário"), Produto Unit., Comissão Unit., Tipo Frete, Valor Frete (editável só se "CIF Informado"; senão 0), Aliq. ICMS (lupa → consulta ICMS), Aliq. PIS/COFINS, Total Tributos, Total Bruto, lixeira, Total Comiss., troféu vencedor, Total Líq. O Total Líq. fica verde quando é o **menor líquido** entre os fornecedores do produto. Linha do vencedor com fundo verde.
- Rodapé: "Gravar Cotação" (nova), "Salvar Cotação" (edição), "Cancela".

### 2.7 Popup de fornecedores (`pop add fornecedor`)
- Cabeçalho: cliente (foto/nome), produto e "condição – linha – medida". "Endereço de entrega" (endereços do cliente, padrão o destino do produto) com ícone GPS (abre Google Maps, WF bTkep) e agenda (WF bTcbO). Botão "Novo Fornecedor" (WF bThVe).
- Tabela `rpg cotacao fornecedores` (ver 3.4). Colunas: seleção (bloqueada com ícone se `Liberado = false`), fornecedor (foto + nome do grupo), identificador do endereço, UF, "Última cotação / Valor Unit", distância em km até o endereço de entrega (ou "(cliente sem localização)" / "(fornecedor sem localição)" / "(cliente e fornecedor sem localização)"), regime tributário, endereço, cidade, ícones agenda de endereços e Google Maps, LIBERADO/BLOQUEADO + motivo.
- Filtros no cabeçalho da tabela: nome do fornecedor, cidade (valores únicos da lista), UF, identificador (contém), regime tributário, cada um com ícone de limpar. Cabeçalho "Distancia para entrega ▲/▼" ordena (plugin 1685525155901…).
- Botão "Adicionar Fornecedores" (WF bTNrX).

### 2.8 Popup de propostas (`pop add edita propostas`)
- Esquerda, pré-visualização (vira o PDF):
  - `gp exibe proposta`: proposta já gravada que foi selecionada. Mostra um alerta ("já enviada, não permite edição" / "não enviada, ainda permite edição") e o botão "editar cotação".
  - `gp nova proposta`: estado atual da cotação (itens vencedores) com alerta e o botão "editar cotação".
  - Conteúdo das duas: logo da empresa emissora, consultor, e-mail (o da empresa se Paletes Brasil), telefones fixos, "Proposta núm: CotacaoNum/n", data por extenso, cliente, A/C, CNPJ, telefone, cidade. Depois vêm o aviso sobre crédito de ICMS/PIS/COFINS/IPI por regime, a tabela de itens (Qtd, Descrição, Preço unit. líquido, Frete, Aliq. ICMS, Aliq. PIS/COFINS, Preço unit. bruto, Valor total bruto com soma no cabeçalho), as condições (validade, pagamento, destinos, data prevista, CNPJ de faturamento do fornecedor se escolhido, informações adicionais) e o texto fixo de condições gerais (paletes usados/novos, Chapatex, frete CIF/descarga, pagamento).
- Direita (`gp historico propostas`): cliente e nº da cotação, botão "+ Proposta".
  - Formulário (modo Nova/Edita) em dois blocos:
    - Dados do e-mail: e-mail do cliente (contatos ativos), e-mails cópia (padrão `User.CopiaProposta` na nova), anexos (até 9), corpo do e-mail (modelo).
    - Dados da proposta: CNPJ do cliente (endereços ativos do cliente), CNPJ do fornecedor (endereços do fornecedor do 1º vencedor), condição de pagamento (padrão "Mediante analise do financeiro"), data prevista de entrega, informações adicionais.
  - Ajuda que aparece ao passar o mouse nos botões. Botões Gravar / Gravar e Enviar / Cancela (nova) ou Salvar / Salvar e Enviar / Cancela (edição).
  - Tabela de propostas (ordem: mais nova primeiro): seleção por rádio, Núm, fornecedores, produtos com valor unitário. Ações:
    - lápis: editar, só se não enviada;
    - clipe: abrir PDF;
    - avião: visível se não enviada, **sem workflow**;
    - reenviar: visível se enviada;
    - carrinho "transformar em pedido": habilitado só se a proposta estiver selecionada e enviada.
- `gp proposta a anexar` guarda o elemento do plugin PDF (`PDF/IMG PROPOSTA`).

### 2.9 Popup de pedido (`pop add edita pedido`)
- Faixa "Aguarde, gravando registros. Não feche essa janela!" (`gp alert gravando`).
- `gp pedido corpoarquivo` (id `corpopedido`, vira o PDF do pedido):
  - logo da empresa, consultor, e-mail, telefones, "Pedido núm: CotacaoNum/PropostaNum", data de hoje;
  - por item: dados de faturamento do **fornecedor** (razão, CNPJ, endereço de origem), "Enviar para" (endereço de entrega completo com CNPJ e IE; em vermelho "Selecione um endereço pra entrega" se vazio), "Faturar para" (endereço de cobrança, mesma regra), linha do produto (qtd, unit. líquido, frete, alíquotas, unit. bruto, total bruto) e sub-tabela de entregas (data, qtd, valor bruto);
  - bloco "Informações adicionais": nº da OC, informações adicionais, condições de pagamento (prazos + forma) e texto fixo de condições gerais.
- Formulário (`gp itens pedido`):
  - Switch oculto "Enviar email para próxima compra?".
  - Cabeçalho do cliente com ícone da agenda de endereços (WF bTeiV) e botão recolher (WF bTeiI).
  - Coluna esquerda: e-mail do cliente (contatos ativos; obrigatório se formalizar), CC do cliente (padrão `User.CopiaPedido` no novo), corpo para o cliente (modelo), e-mail do fornecedor (contatos ativos dos fornecedores dos itens), CC do fornecedor, corpo para o fornecedor (modelo com comissão unitária por produto e total).
  - Coluna direita: anexo da OC do cliente (máx. 3 MB) com ícone abrir, nº da OC, informações adicionais, condições de pagamento (multi-seleção `Opt.ParcelasReceber` + forma de pagamento `Opt.FormaPgto`, obrigatória).
- Tabela de itens (`rpg pedido OrçFornecedores`): cabeçalho com lápis (editar produtos; só criador do pedido ou Diretor) e `tool.EnderecoFornecedor`. Por item: produto, Qtd, Comissão bruta (vermelha se há divergência), `tool.EnderecoEntrega`, frete, botão HTML "+ entrega" (recolhe quando falta 0), Valor bruto, Tributos (ICMS+IPI+PIS/COFINS), Valor líquido, `tool.EnderecoCobranca`.
- Sub-tabela de entregas do item. Cor da linha: marcada para apagar, Em Entrega, Cancelado, Financeiro. Colunas:
  - data prevista (editável se não saiu);
  - calculadora "refaz cálculo" + qtd (editável se não saiu);
  - comissão, bruto, líquido (riscados se cancelada);
  - `tool.AnexaNf`;
  - cancelar entrega (visível se saiu; desabilitado se Financeiro/Cancelado) ou checkbox "apagar" (se não saiu);
  - "Nf: nº" (clique abre o arquivo) + clipe, "Boletos (n)" + clipe, "Etapa: status".
- Rodapé da sub-tabela: "Qtd entrega: soma", "Falta", "Comissão soma" e "Falta", "Valor bruto soma" e "Falta", "Valor líq soma" e "Falta" (em vermelho se ≠ 0), lixeira para apagar as marcadas.
- Alertas: divergência de comissão; "Existem entregas sem data prevista"; "Todas entregas já foram concluídas e/ou canceladas. Deseja retirar esse pedido da lista?" com botão "retira pedido"; link "pdf pedido" (se existe arquivo).
- Rodapé: Gravar/Cancela (novo) ou Salvar/Cancela (edição). Checkbox "Formalizar pedido por e-mail (cliente e fornecedor)", que vira "Reenviar…" se já formalizado. Fica desmarcado e desabilitado quando há divergência e o pedido ainda não foi formalizado, ou quando falta data e o pedido já foi formalizado.
- `gp gerador pdf` guarda o plugin `old PDF/IMG PEDIDO`. Ícone fechar (WF bTbqZ0).

### 2.10 Demais popups
- `pop edita produtos do pedido`: título "Edita Produtos", fechar, botão "Novo Produto". A tabela lista os itens do pedido: produto + "linha – condição" (ou "Falta regime tributário"), aviso "possui entrega(s) lançadas e não pode ser editado", ícone recalcular, Qtd, Valor Unit, Valor Comiss (unit.), Tipo Frete (padrão FOB), Valor Frete, Aliq. ICMS (+ lupa), Aliq. PIS/COFINS, Total Tributos, Total Bruto, Comiss Bruto, lixeira, lápis, Total Líq. Tudo fica desabilitado se o item tem ≥1 entrega.
- `pop confirma entrega`: "Confirma entrega – Nota Núm". Mostra os dados da entrega (cliente, nº cotação/proposta, condição negociada = prazos do pedido, forma de pagamento) e uma tabela com a própria entrega (data prevista, qtd, comissão, bruto, líquido, NF). Bloco "Criar previsão de recebimentos": data de entrega (padrão agora, obrigatória), comprovante (máx. 5 MB), qtd de parcelas (multi-seleção até 4 de `Opt.ParcelasReceber`, padrão = prazos do pedido), botão "Recebimentos". Esse botão fica desabilitado sem parcelas ou se já existe previsão, com o aviso "Não é possível criar novos recebimentos se já existe algum recebimento previsto". Bloco "Previsão de recebimentos": tabela editável (Prazo, Vencimento, Valor, excluir). Botões Gravar (habilitado com ≥1 recebimento, data e ≥1 parcela) e Cancela. Aviso: "Ao confirmar, o cartão vai para FINANCEIRO e as contas a receber serão criadas".
- `pop cancelar entrega e pedido`: "ATENÇÃO!", motivo (obrigatório), checkboxes "Envia e-mail informando cliente/fornecedor". Cada checkbox mostra dropdown de e-mail (padrão `Pedido.EmailCliente`/`EmailFornecedor`, com agenda de contatos) e corpo pré-preenchido conforme o tipo (Cancela Pedido ou Cancela Entrega). Botão "Cancela Pedido/Entrega" e fechar.
- `pop consulta icms`: dropdowns Origem/Destino (UFs). Tabela `IcmsEstados` filtrada, com alíquota **editável** (auto-binding) e ícone copiar.
- `pop.ArquivaCotação`: cliente, nº, vendedor, data; dropdown motivo (`Opt.MotivoArquivamento`, obrigatório); botão Arquivar.

---

## 3. Dados (listas e buscas em linguagem de negócio)

Todas as buscas usam "ignore empty": filtro com parâmetro vazio é ignorado.

### 3.1 Coluna Cotação — `rpg cardscotacao`
Cotações na etapa **Cotação**, com `Arquivado` = `cotacaoarquivada`, criadas entre `datainicio` e `datafim`, com nº = `numeropedido`, cliente e vendedor (`QualVendedor`) dos filtros. Ordem: mais recente primeiro.
Exceção: se `pedidosconcluidos = yes` **e** o usuário é Diretor, a etapa passa a ser "diferente de Cancelado" (inclui Pedir etc.).
Contador (`Text XZZZZ`): repete a mesma busca e mostra `count` + " cotações".

### 3.2 Coluna Pedido — `rpg cardspedidos`
Pedidos com `PedidoFinalizado` = `pedidosconcluidos`, `QualEtapa` = `etapapedido`, criados no período, `NumeroPedido` = `numeropedido`, cliente e vendedor (`QualVendedor`). Quando `filtrafinanceiro`/`filtraentrega` estão preenchidos, só o pedido indicado (o mapa mostra o operador do `_id` como `{'type': 'Empty'}` — [DÚVIDA]: presumo "igual a"). Ordem: mais recente primeiro.
Contador (`Text XZZZZZZ`): mesma busca, mas filtra vendedor por **`Created By`** em vez de `QualVendedor`. Pode divergir da lista.

### 3.3 Coluna Entregas Próprias — `rpg cardsentregas` (bTbxZ)
Entregas que **já saíram** (`SaiuEntrega = true`), do pedido em `filtrapedido`/`filtrafinanceiro`, com `StatusEntrega` = `etapaentrega`, cliente, `DtPedido` no período, `NumeroEntrega` = `numeropedido` e `QualVendedor` = vendedor. Ordem: criação decrescente.
Com `pedidosconcluidos = yes`, o período passa a ser a **data real de entrega** (`DtEntrega`).
Totais no cabeçalho (`Total Faturado` = soma de `ValorVendaLiquido`, "N Entregas", `Total Comissão` = soma da comissão): ocultos e sem condicional que os mostre. Estão mortos e ainda filtram por `Created By`.

### 3.4 Coluna Entregas Substituto — `rpg cardsentregas` (bTzTB)
Entregas em que o vendedor filtrado é o **substituto** (`QualVendedorSubstituto`), com status diferente de Financeiro e de Cancelado (sem exigir "saiu"), do pedido filtrado, cliente, `DtPedido` no período e nº. Ordem: criação decrescente. Sem contador.

### 3.5 Carrinho da cotação
- `rpg produto orcamento`: na nova, os produtos temporários do usuário (`User.TempOrcamentoProdutos`); na edição, os produtos da cotação somados aos temporários.
- `rpg fornecedorescotacao`: orçamentos de fornecedor do produto (`CotacaoProdutos.QuaisOrcamentosForncededores`).
- `ip valorminimo` (oculto): menor `ValorVendaLiquido` da sub-lista, usado para pintar o mais barato.

### 3.6 Fornecedores para orçar (`rpg cotacao fornecedores`)
Endereços de clientes/fornecedores com tipo **Fornecedor**, ativos, cujo `QuaisProdutos` contém o produto do item e que batem com os filtros (cidade, UF, grupo, identificador contém, regime tributário). **Menos** os endereços que já são origem de algum orçamento do item.
"Última cotação" (`rpg orcamentos passados`, oculto): todos os orçamentos de fornecedor do mesmo produto-modelo com frete **FOB**. Por linha, pega o último do mesmo endereço de origem e mostra `ValorVendaUnit` (2 casas). A busca não tem data nem ordenação; "último" é o último da lista devolvida [DÚVIDA].
Distância: `Localizacao` do fornecedor até `Localizacao` do endereço de entrega, em km com 1 casa.

### 3.7 Propostas
- Tabela: `Cotacao.QuaisPropostas`, ordem decrescente de criação.
- Itens da proposta exibida: `Proposta.QuaisOrcamentosFornecedores` (cópia fixa).
- Itens da nova proposta: orçamentos **vencedores** de todos os produtos da cotação (estado atual).
- Destinos: cidade–UF do destino de cada item, separados por espaço.

### 3.8 Pedido
- Itens: `Pedido.QuaisOrcamentosFonecedores`.
- Entregas por item: `OrcFornecedor.QuaisEntregas` (no PDF, em ordem de data prevista).
- E-mails do fornecedor: contatos ativos de todos os fornecedores dos itens.
- Somas por item: Σ `QtdEntrega` (todas); Σ comissão, bruto e líquido **só das entregas não canceladas**.
- Divergência (alerta): Σ `ComissaoBruto` dos itens − Σ comissão de **todas** as entregas do pedido, canceladas incluídas.
- "Entregas sem data": entregas do pedido com data prevista vazia.
- "Todas concluídas": ≥1 entrega concluída e total de entregas = total concluídas. `ipt pedido contaentrega` usa `:filtered` sem restrição, isto é, todas as entregas.

### 3.9 Confirmação de entrega
- `rpg entregas do produto`: só a entrega em questão.
- `rpg previsao contas receber`: `Entrega.QuaisContasReceber`.

### 3.10 ICMS
- `pop consulta icms`: `IcmsEstados` com Origem = UF escolhida e Destino = UF escolhida.
- Padrão do campo ICMS na nova cotação: primeiro `IcmsEstados` com destino = UF do endereço de destino e origem = UF do endereço de origem (compara `display` da opção com o texto `UF`).

---

## 4. Funcionalidades e regras de negócio

### 4.1 Carregamento e filtros
- Parâmetros padrão no carregamento: WF bTKAD, ações bTdJn, bTiiF, bTiVU, bTiVZ, bTiVb, bTiVg, bTiYV, bTjRt, bTjRx (tabela 2.2). A ação 2 (bTcoz) chama o plugin 1558770956236… sem parâmetros [DÚVIDA: o que faz].
- A condição de bTiiF é `datainicio vazio E datafim vazio OU UltimoDateRange vazio`. O Bubble avalia da esquerda para a direita, então um usuário sem `UltimoDateRange` tem **sempre** as datas da URL trocadas pelo mês corrente. Isso parece bug. Na regra nova: usar a URL quando existir; senão, o último período do usuário; senão, o mês corrente.
- Período: WF bTiYD grava `User.UltimoDateRange` e ajusta a URL. WF bTiWn volta ao mês corrente.
- Vendedor: bTiYP (troca) e bTiYa (limpa). Cliente: bTjPu e bTjQB. Número: bTcwN0 e bTcwl0.
- Botões de alternância: arquivadas (bTaTZ/bTaTj), data crescente (bTaUD/bTaUN, sem efeito), expandir (bTiVy/bTaGu), concluídos (bTiWJ/bTfTb0, também mudam `etapaentrega`), cancelados (bTiWQ/bTiWX, mudam `etapapedido` e `etapaentrega`).
- Filtros cruzados por checkbox. Marcar um pedido zera `filtraentrega` e `filtrafinanceiro`, e vice-versa:
  - pedido marca/desmarca: bTcsp, bTcsw;
  - entrega própria marca/desmarca: bTcsf, bTctN;
  - entrega substituto marca/desmarca: bTzUd, bTzUn.
- Expandir/recolher cartão: cotação bTQAy, pedido bTbai, entrega bTiFL0/bTzTz.

### 4.2 Cotação: criar, editar, cancelar
- **Abrir nova** (WF bTOOI): limpa o popup, `var_a__ovendas_ = Nova Cotação`, `var_a__oor_amento_ = Novo Produto`, mostra.
  - Ao abrir em modo Nova com itens temporários sobrando (WF bTcal): apaga os orçamentos (bTcbr) e os produtos (bTcbs) temporários de uma sessão anterior.
- **Abrir edição**: pelo cartão (WF bTQBP), ou pelo botão "editar cotação" do popup de propostas, com a proposta exibida (bTcvX) ou com o grupo do popup (bTcvp). Mostra a cotação, `Edita Cotação`, `Novo Produto`.
- **Adicionar produto ao carrinho**:
  - Nova (WF bTNjj, só se `Nova Cotação`): cria `CotacaoProdutos` (condição, linha, medida, qtd, produto, cliente, grupo, destino = endereço de entrega escolhido) já no banco (bTNjp) e adiciona a `User.TempOrcamentoProdutos` (bTNrv0).
  - Edição (WF bTOir0, só se `Edita Cotação`): igual, mas já com `QualCotacao` (bTOiw0, bTOjZ0).
  - As duas limpam o formulário.
- **Editar produto do carrinho**: lápis (WF bTOhp0) carrega o produto no formulário e muda para `Edita Produto`. Salvar (WF bTOiR0) atualiza o produto (bTOiX0), copia a qtd para `QtdVenda` de todos os orçamentos dele (bTOip0), agenda o recálculo `CalculaFornecedoresLista` (bTPHU) e volta para Novo Produto.
- **Alterar Qtd na linha do carrinho** (WF bTOYp0): grava `Qtd` (bTOYv0), `QtdVenda` em todos os orçamentos (bTOZB0) e agenda o recálculo (bTPGL).
- **Remover produto** (WF bTOSp0): apaga os orçamentos do produto (bTOSz0), tira o produto da lista temporária (bTOTF0; o mapa mostra `=`, interpreto como "remover") e apaga o produto (bTOTA0).
- **Gravar cotação nova** (WF bTOTR0):
  - bTOTX0 cria `Cotacao`: validade, `CotacaoNum` = último nº + 1, status "Em andamento", produtos = lista do carrinho, cliente, empresa, `QualVendedor` = usuário, `Amostra`.
  - `CotacaoEtapa` não é gravada. Presumo valor padrão "Cotação" no campo [DÚVIDA], senão a cotação não apareceria na coluna.
  - bTOff0 grava `QualCotacao`/`QualCliente` nos produtos; bTbYN grava `QualCotacao` nos orçamentos.
  - bTaJJ dispara o evento "fechar pop cotacao" (bTaIm); depois esconde o popup e limpa `var_recemcadastrado_` da agenda.
- **Salvar cotação editada** (WF bTOjP0):
  - bTOjb0 grava validade, `QuaisProdutos = TempOrcamentoProdutos`, cliente, empresa e amostra. [DÚVIDA] Se for "definir", a cotação perde os produtos que já tinha; presumo "adicionar lista".
  - Dispara bTaIm (bTaJQ) e grava `QualCotacao` nos orçamentos dos produtos da lista (bTbYY).
- **Cancelar** (WF bTOOP): apaga os produtos temporários (bTOjt0; os orçamentos deles ficam órfãos) e dispara bTaIm. Na edição, o que já foi auto-gravado nos produtos existentes (qtd, valores, vencedor) **não é desfeito**.
- **Evento "fechar pop cotacao"** (WF bTaIm): zera os estados da página, limpa os popups de cotação e fornecedor e esvazia `User.TempOrcamentoProdutos`.
- **Novo cliente** (WF bTeyi): abre a agenda de endereços em modo `Novo Cliente`. Agenda de endereços do cliente escolhido: WF bTcjZ.
- **Cadastro de produto**: editar o produto selecionado (WF bThDv) ou abrir o cadastro (WF bThED).

### 4.3 Orçamentos por fornecedor (dentro do carrinho)
- **Abrir seleção de fornecedores** (WF bTNrz0): popup com o produto da linha.
  - Ao abrir (WF bTcct): ordena a tabela pelo texto de id `kmdistancia`. É o id do texto de endereço, não da distância [DÚVIDA]. Ordenar por distância: bTccd (crescente → decrescente) e bTcdG (volta).
  - Marcar/desmarcar fornecedor: bTNrD e bTNrK. Endereço com `Liberado = false` não pode ser marcado.
  - Filtros: limpar nome bTfOS, cidade bTcxu0, UF bTfOk, identificador bThlm0, regime bUCUR.
  - Agenda de endereços do fornecedor: bTfLG. Mapa: bTfMg (fornecedor) e bTkep (cliente). Agenda de endereços do cliente: bTcbO. Novo fornecedor: bThVe (`Novo Fornecedor`). Fechar: bTchZ.
- **Adicionar fornecedores** (WF bTNrX): agenda `AdicionarFornecedores` (bTNrd, ação bTNru0) com linha, medida, condição, destino (endereço de entrega escolhido no popup), lista de origens selecionadas, quantidade, fila = 1, vendedor e produto. Depois zera a seleção e fecha. O backend percorre as origens uma a uma, agendando a si mesmo com +1 s:
  - origem **não** é Lucro Real/Presumido (ou está vazia): cria o orçamento **sem alíquotas** (ação bThgz0);
  - origem **e** destino são Lucro Real/Presumido: cria com ICMS = tabela `IcmsEstados` (UF destino × UF origem) e PIS/COFINS = **9,25%** (ação bTNri);
  - origem Lucro Real/Presumido com destino em outro regime: **nenhum orçamento é criado**. Parece bug [DÚVIDA].
  - Em todos os casos o orçamento recebe produto, `QtdVenda` = qtd do produto, vendedor, linha, condição, medida, origem, destino e fornecedor (grupo da origem). É anexado ao produto (bTOTf0).
- **Editar valores** (auto-binding nos inputs): valor unitário, comissão unitária, frete, ICMS % e PIS/COFINS %. Cada mudança espera 1 s e agenda `CalculaFornecedoresLista` para o orçamento: WFs bTOXZ0, bTOXg0, bTPGv, bTOXn0, bTOnP.
- **Tipo de frete** (WF bTOSi0): se ≠ "CIF Informado", zera `ValorFrete` (bTOSo0) e recalcula (bTPHa). O campo de frete só aceita digitação com "CIF Informado".
- **Vencedor** (um por produto):
  - bTOUP0: desmarca o vencedor atual da sub-lista (bTOUa0) e marca este (bTOUU0).
  - bTOUI0: desmarca.
  - O troféu fica desabilitado se valor unitário < 0,01 ou comissão unitária < 0,01, **exceto** quando a cotação é "Pedido de Amostra".
- **Excluir orçamento** (WF bTOTH0): plugin 1689356815386… (não consta nos plugins instalados; talvez confirmação) e apaga o orçamento.
- **Mostrar/ocultar fornecedores**: pelo nome (bTOWv0) ou pelo chevron (bTOZp0), cada um alterna a sub-tabela e os títulos ICMS/PIS. "Abrir todos": bTaJv e bTaKF.
- **Consulta ICMS**: lupa no carrinho (bTPfZ) ou no pedido (bThtq). Copiar alíquota (bTPfs): plugins de clipboard (1659259586969…) e toast "Valor de alíquota copiada". A alíquota da tabela é **editável** direto no popup.

### 4.4 Arquivamento de cotação
- Arquivar (WF bTaPi, se não arquivada): abre `pop.ArquivaCotação`. Arquivar (WF bTlDb): `Arquivado = true` e motivo (bTlDh).
- Trocar o motivo de uma arquivada: botão do motivo no cartão (WF bTlYI).
- Desarquivar (WF bTaTq, se arquivada): `Arquivado = false` e motivo vazio (bTaTv).

### 4.5 Propostas
- **Abrir** (WF bTQBi): limpa `var_acaocotacao_`, mostra a cotação no popup. Fechar: WF bTaPQ.
- **Selecionar proposta** (rádio): bTagt entra em `Exibe Proposta` com a proposta escolhida; bTahD desseleciona.
- **Nova proposta** (WF bTPoC):
  - `Nova Proposta`;
  - bThFu **copia** os orçamentos vencedores de todos os produtos da cotação, e a proposta fica com um retrato congelado dos itens;
  - bThFW cria `Propostas` (itens = cópias, cotação, vendedor);
  - bThFb grava `QualProposta` nas cópias e mostra no formulário.
  - A proposta **não** entra em `Cotacao.QuaisPropostas` até ser gravada.
- **Editar proposta não enviada** (WF bTPmK): `Edita Proposta` com a proposta da linha.
- **Gravar** (WF bTmXN; o bTPHt é a versão antiga, desativada):
  - bTmXT grava condição de pagamento, corpo do e-mail, data prevista, e-mails cópia, contato, endereço de faturamento, informações adicionais e número. **Não** grava anexos nem CNPJ do fornecedor (o bTPHt gravava).
  - bTmXU grava `QualEndereçoCobrança` = endereço de faturamento em todos os itens da proposta.
  - bTmXZ adiciona a proposta à cotação.
  - bTmXa gera o PDF do grupo `novaproposta`. Nome do arquivo: `NOMECLIENTESEMESPACOS<CotacaoNum>-<PropostaNum>`.
  - Limpa o modo e o formulário.
- **Gravar e Enviar** (WF bTPDr0):
  - bThFd grava o mesmo que Gravar, mais anexos, CNPJ do fornecedor e `PropostaEnviada = true`.
  - bTjCC cria `Historico` "Proposta número X/Y enviada ao cliente no email …"; bTkgh2 atualiza `UltimoHistoricoData/Msg` do cliente.
  - Depois: endereço de cobrança nos itens (bTbgD), adiciona à cotação (bTPrU), PDF (bTaSd).
- **Salvar** (edição, WF bTPhF): grava tudo, inclusive anexos e CNPJ do fornecedor (atribuído duas vezes), mais cobrança nos itens (bTbfm) e PDF (bTaSn).
- **Salvar e Enviar** (WF bTPhL): igual, mais `PropostaEnviada = true`. Não grava o CNPJ do fornecedor e não cria histórico.
- **PDF gravado** (WF bTnvj0, evento do plugin): `AquivoProposta` = arquivo (bTnvo0) e **sempre** agenda o e-mail (bTnvu0). A condição `var_enviamailproposta_` nunca é lida, então "Gravar"/"Salvar" (sem enviar) também dispara o e-mail ao cliente [DÚVIDA forte: confirmar com o usuário; na regra nova, só enviar nos botões "…e Enviar"].
- **Cancelar proposta nova** (WF bTPoa): tira `QualProposta` das cópias (bThFt; as cópias ficam órfãs), apaga a proposta (bThFp), limpa. **Cancelar edição** (WF bTPol): só limpa.
- **Ver PDF** (WF bTPoz): abre `AquivoProposta` em nova aba.
- **Reenviar** (WF bTiOx0): dispara o evento "Enviar Email Proposta" (WF bTaLf) e mostra o toast "Proposta re-enviada com sucesso". O bTaLf passa o arquivo no parâmetro `atachments`, que **não existe** no backend `EnviarEmailsGeral`, e não passa `anexo1`. O reenvio sai **sem o PDF** e sem os anexos [DÚVIDA/bug].
- **Agenda de contatos/endereços**: contato do cliente (bTPJB), endereços do cliente (bTPQO), endereços do fornecedor do 1º vencedor (bTzcV0).
- **Fechar o popup** (WF bUESn): vazio.

### 4.6 Pedido: criar, editar, formalizar
- **Transformar proposta em pedido** (WF bTbFt; só proposta selecionada e enviada):
  - bTbNB cria `Pedido`:
    - itens = cópias da proposta; cotação; proposta;
    - `NumeroPedido` = `CotacaoNum` **como texto**, então vários pedidos da mesma cotação repetem o número;
    - cliente e `QualClienteTexto`;
    - `InformacoesAdd` = informações adicionais da proposta;
    - `QualPrimeiroFornecedor` = origem do 1º item;
    - `QualVendedor` = usuário.
  - bTbZt muda a cotação para `CotacaoEtapa = Pedir` e `QualPedido` = pedido, e o cartão sai da coluna Cotação.
  - Abre o popup em `Novo Pedido`.
  - `Pedido.QualEtapa` não é gravado [DÚVIDA: valor padrão "Pedido"?].
- **Abrir edição**: cartão de pedido (bTbZy), cartão de entrega própria (bTcJT), cartão de entrega substituto (bTzUJ). Todos em modo `Edita Pedido`.
- **Adicionar entrega a um item** (WF bTbOt), ação bTbOz cria `Entregas` com:
  - cotação, item, proposta, pedido;
  - data prevista = `Proposta.DtPrevEntrega`;
  - `NumeroEntrega` = nº do pedido e `DtPedido` = criação do pedido;
  - textos de cliente e fornecedor;
  - `QualVendedor` = **criador da cotação**;
  - cliente e fornecedor;
  - **sem qtd e sem status**.
  - Depois: anexa ao pedido (bTbQb) e ao item (bTbQf).
  - Substituto de férias (bTyAt): se o período de férias do vendedor contém a data prevista, `QualVendedorSubstituto` = substituto dele.
- **Editar data prevista** (WF bUEti): grava a data (bUEtp) e reaplica a regra do substituto de férias (bUEtu).
- **Editar qtd da entrega** (WF bTbPN): agenda `CalcularValoresEntregas` (bTbPT) e reinicia o corpo do e-mail do fornecedor (bTnxO0), porque o texto tem as comissões. Recalcular manualmente (WF bTcSZ): o mesmo.
- **Apagar entregas que ainda não saíram**: marcar/desmarcar (bTbuB/bTbuI) e apagar as marcadas (WF bTbxI: bTbxO apaga, bTbxP zera a lista).
- **Editar itens do pedido** (lápis, WF bThxh): abre `pop edita produtos do pedido`. Fechar: bThxa.
  - Dentro dele, cada input (qtd/valor unit., comissão, tipo frete, frete, ICMS, PIS/COFINS) agenda o recálculo: bThst, bThtB, bThtM (tipo de frete ≠ CIF Informado também zera o frete, bThtR), bThtX, bThtx, bThtf. Recalcular manual: bToYN.
  - Há dois inputs chamados `ip valorvenda` (Qtd bThrg e Valor Unit bThxB) e um só WF (bThst). [DÚVIDA] qual dos dois dispara o recálculo.
  - Novo produto no pedido (WF bTicz): abre `pop.AddEdita Produtos` com o pedido. Esse reusable cria o produto e o orçamento, calcula ICMS pela tabela e PIS/COFINS de 9,25%, e agenda `AdicionarFornecedores` (ver reusable).
  - Editar item (bTigA). Excluir item sem entregas (WF bTidv): apaga o produto da cotação (bTieB) e o orçamento (bTieC).
- **Gravar/Salvar sem formalizar** (WFs bTblt, bTbmF; condição: checkbox desmarcado):
  - Grava corpo do fornecedor, e-mail do cliente, e-mail do fornecedor, informações adicionais, **arquivo** da OC, nº da OC, corpo do cliente, prazos, **forma de pagamento**, CC do cliente e CC do fornecedor.
  - Fecha e limpa.
  - As duas são idênticas; só muda o botão.
- **Gravar/Salvar formalizando** (WFs bTcqO e bTbnL; condição: checkbox marcado):
  - Mostra "gravando" e rola até ele.
  - Grava os mesmos campos com `PedidoFormalizado = true`, mas **sem a forma de pagamento** (bTcqV/bTcpk). Parece bug [DÚVIDA].
  - Põe **todas** as entregas do pedido em `StatusEntrega = Pedido` (bTcqZ/bTcqJ), inclusive as que já estão Em Entrega, Financeiro ou Cancelado. Isso acontece em cada reenvio [DÚVIDA/risco].
  - Gera o PDF do grupo `corpopedido`. Nome: `NOMECLIENTE_PEDIDO<CotacaoNum>/<PropostaNum>`.
  - Limpa os inputs.
  - Só bTcqO (Gravar) cria `Historico` "Pedido número N enviado ao cliente no email …" (bTjBw) e atualiza o último histórico do cliente (bTkgd2).
- **PDF do pedido gravado** (WF bTiKL0):
  - `PedidoArquivo` = arquivo (bTiKQ0).
  - E-mail ao **fornecedor** (bTnxT0): to = `EmailFornecedor`, cc = CC do fornecedor, bcc = usuários da config 7, anexos = PDF + os 9 anexos da proposta.
  - E-mail ao **cliente** 15 s depois (bTnxU0): to = `EmailCliente`, cc = CC do cliente, bcc = config 6, anexos = PDF (+ OC só no parâmetro inexistente `atachments`).
  - Fecha o popup e o alerta.
- **Cancelar pedido novo** (WF bTbrC0): fecha, volta a cotação para `Cotação` e esvazia `QualPedido` (bTcad), apaga o pedido (bTcae). Entregas criadas nesse meio-tempo ficam órfãs.
- **Cancelar edição** (bTbrN0): fecha. **Fechar pelo X** (bTbqZ0): guarda o pedido e o e-mail do cliente em estados da página e fecha.
- **Ao fechar o popup** (WF bUESt, **desativado**): mandaria o e-mail "pedido finalizado" se alguma entrega estivesse em Financeiro e `ContaEmail ≠ 1`, e marcaria `ContaEmail = 1`.
- **Retirar pedido da lista (finalizar)**:
  - Pelo cartão (WF bTfPH):
    - marca `PedidoFinalizado = true` em **todas** as entregas (bTfPJ) e no pedido (bTfPN);
    - envia ao contato escolhido o e-mail pós-venda "Seu pedido foi finalizado ✅ | Vamos programar as próximas entregas?", com cc para o vendedor e link de avaliação `formulariovenda?id=<cliente>&pdd<vendedor>` (bUEjU; falta o `=`);
    - atualiza `UltimoHistoricoData` do cliente (bUEnz) e cria o `Historico` com o texto do e-mail (bUEoF).
  - Pelo popup do pedido (WF bTcrj): marca `PedidoFinalizado` **só nas entregas canceladas** (bTcru) e no pedido (bTcrp). Não manda e-mail. As regras divergem [DÚVIDA].
- **Arquivos e agenda**:
  - Abrir OC: bTcxQ0. Abrir NF: bTcRp (texto), bTjTx (clipe). Abrir boletos: bTjjH, até 4 abas. Baixar PDF do pedido: bTiLN0 (plugin de download).
  - Agenda de contatos do fornecedor: bTbnk. Do cliente: bTcZi. Endereços do cliente: bTeiV. Recolher dados: bTeiI.
- **Duplicar pedido** (WF bUAdY): abre `pop.DuplicarPedido`. O ícone nunca aparece (oculto, sem condicional), então na prática o fluxo está morto nesta página.

### 4.7 Saída para entrega (reusable `pop.AnexaNf`, por entrega)
Não é workflow desta página, mas define as etapas que a página filtra:
- "Saiu para entrega" ligado: grava NF, arquivo, data de emissão, boletos, "não emite NF" e `StatusEntrega = Em Entrega`, e opcionalmente manda o e-mail NF+boleto ao cliente.
- Desligado: `StatusEntrega = Pedido`.
- Nos dois casos reaplica a regra do substituto de férias.

### 4.8 Confirmação de entrega (vai para o Financeiro)
- **Abrir**: caminhão do cartão próprio (bTcYr) ou substituto (bTzUV).
- **Gerar previsão** (WF bTfDP): agenda `CriarContasReceber` (bTfDZ) com as parcelas escolhidas, a data de entrega informada e a entrega. O backend cria uma `ContasReceber` por prazo, recursivamente (fórmulas na seção 5) e anexa em `Entrega.QuaisContasReceber`.
- **Ajustar a previsão** (auto-binding de vencimento e valor):
  - Trocar o prazo (WF bTfEb) recalcula o vencimento como **hoje** + dias do prazo, e não a partir da data de entrega (diferente do backend).
  - Excluir parcela: WF bTfEi.
- **Gravar** (WF bTcXd):
  - bTcXj grava a data real de entrega, o comprovante e `StatusEntrega = Financeiro`;
  - bToYx agenda `CriarContasPagar` (bToYh), a comissão do vendedor;
  - fecha;
  - bTyBX reaplica a regra do substituto de férias pela data **prevista**.
  - Diretor pode reabrir uma entrega em Financeiro e gravar de novo. Cada gravação cria **outra** conta a pagar (duplicidade) [DÚVIDA/bug].
- **Cancelar**:
  - Se a entrega ainda não está em Financeiro (WF bTcXk): fecha e **apaga** as contas a receber previstas (bTfJy).
  - Se já está (WF bTfJz): só fecha.

### 4.9 Cancelamento de entrega e de pedido
- **Abrir**:
  - Entrega que já saiu e não está cancelada (WF bTcjx): alvo = entrega e o pedido dela, `Cancela Entrega`.
  - Pedido (WF bTejh): alvo = pedido, `Cancela Pedido`.
  - Fechar: bTeai.
- **Agenda de contatos**: fornecedor (bTfAN). Cliente (bTfAV) só troca o dado da agenda e **não a mostra** (falta o Show).
- **Confirmar cancelamento de entrega** (WF bTeZz):
  - bTeaF: entrega `Cancelado`, motivo, `QtdEntrega = 0`. Os valores não são recalculados; a comissão continua gravada.
  - E-mail opcional ao cliente (bTnxa0): cc `User.CopiaCancelamentos`, bcc config 8 + cópia de cancelamentos.
  - E-mail opcional ao fornecedor +15 s (bTnxb0): bcc config 9.
  - Assunto "Cancelamento Entrega: <nº> - Produtos: … - Cliente/Fornecedor: …".
- **Confirmar cancelamento de pedido** (WF bTejF):
  - bTejK: pedido `QualEtapa = Cancelado` + motivo.
  - E-mails opcionais: cliente (bTnxg0) e fornecedor +15 s (bTnxl0; bcc config 9 + cópia de cancelamentos). Assunto "Cancelamento Pedido: …".
  - bTejW: todas as entregas `Cancelado` com o mesmo motivo. Não zera qtd e **não estorna** contas a receber/pagar de entregas que já estavam em Financeiro [DÚVIDA/risco].
- O ícone de cancelar pedido fica desabilitado só quando **todas** as entregas estão concluídas.

---

## 5. Cálculos e valores

Nenhum arredondamento é aplicado no cálculo; os números são float do Bubble. A exibição usa 2 casas (moeda R$, vírgula decimal, ponto de milhar) e porcentagem com 2 casas (ICMS 1 casa no input).

### 5.1 Orçamento do fornecedor — backend `CalculaFornecedoresLista` (bTPFh), por item, em sequência
```
ValorVendaBruto    = QtdVenda × ValorVendaUnit + ValorFrete              (bTPGA)
ValorComissaoBruto = QtdVenda × ValorComissaoUnit                        (bTPFo)
ValorPISCOFINS     = QtdVenda × ValorVendaUnit × TributoPISCOFINS        (bTPFt)
ValorICMS          = QtdVenda × ValorVendaUnit × TributosICMS            (bTPFv)
ValorVendaLiquido  = ValorVendaBruto − ValorICMS − ValorPISCOFINS        (bTPGF)
ValorUnitLiquido   = ValorVendaLiquido ÷ QtdVenda                        (bTeYL)
```
- Frete só entra no bruto com "CIF Informado". Nos outros tipos o frete é zerado (bTOSo0/bThtR). Os impostos não incidem sobre o frete.
- "Total Tributos" na tela = `ValorPISCOFINS + ValorICMS`. No pedido: `ValorICMS + ValorIPI + ValorPISCOFINS`. `ValorIPI` nunca é calculado nesta página.
- Alíquotas iniciais: veja 4.3 (9,25% PIS/COFINS e ICMS da tabela, só quando origem e destino são Lucro Real/Presumido).
- Qtd 0 → divisão por zero no unitário líquido.
- Destaque do mais barato: `ValorVendaLiquido = min(ValorVendaLiquido dos orçamentos do produto)`.

### 5.2 Proposta
- "VALOR TOTAL BRUTO" = Σ `ValorVendaBruto` dos itens.
- "PREÇO UNITÁRIO BRUTO": na pré-visualização **nova** = `ValorVendaBruto ÷ QtdVenda` (inclui frete); na proposta **exibida** e no pedido = `ValorVendaUnit` (sem frete). Divergência a decidir [DÚVIDA].
- Nº sugerido = quantidade de propostas da cotação + 1 (editável). Nº exibido "CotacaoNum/PropostaNum".

### 5.3 Entrega — backend `CalcularValoresEntregas` (bTbPH)
```
ValorComissaoUnitario     = Orc.ValorComissaoUnit                          (bToSg)
ValorComissaoBruto        = ValorComissaoUnitario × QtdEntrega             (bTmIt0)
ValorVendaBruto           = Orc.ValorVendaBruto ÷ Orc.QtdVenda × QtdEntrega (bToSl)
ValorVendaBrutoUnitario   = Orc.ValorVendaBruto ÷ Orc.QtdVenda             (bToSn)
ValorVendaLiquido         = Orc.ValorVendaLiquido ÷ Orc.QtdVenda × QtdEntrega (bToSs)
ValorVendaLiquidoUnitario = Orc.ValorUnitLiquido                           (bToSx)
```
O frete entra rateado por quantidade no bruto da entrega.

### 5.4 Saldos do item no pedido
```
Falta qtd      = Orc.QtdVenda − Σ QtdEntrega (todas as entregas)
Falta comissão = Orc.ValorComissaoBruto − Σ comissão (entregas ≠ Cancelado)
Falta bruto    = Orc.ValorVendaBruto   − Σ bruto (entregas ≠ Cancelado)
Falta líquido  = Orc.ValorVendaLiquido − Σ líquido (entregas ≠ Cancelado)
Divergência do pedido = Σ Orc.ValorComissaoBruto − Σ comissão de TODAS as entregas do pedido
```
A divergência inclui as canceladas; os saldos não. Unificar.

### 5.5 Contas a receber (comissão da MegaBox) — backend `CriarContasReceber` (bTfDZ), uma por prazo escolhido (N = nº de prazos)
```
DataVencimento = DtEntrega(informada) + Prazo[i].DiasPrazoNumero
ValorComissao  = Entrega.ValorComissaoBruto ÷ N
ValorTotal     = Entrega.ValorVendaBruto          (valor cheio, repetido em cada parcela)
ValorUnit      = Entrega.ValorVendaBruto ÷ Entrega.QtdEntrega
Qtd            = Entrega.QtdEntrega
DataEntrega    = DtEntrega informada; DataPrevEntrega = Entrega.DtPrevEntrega
QualVendedor   = criador da cotação
```
Também copia cotação, entrega, item, pedido, proposta, data do pedido, prazo, cliente, nº, fornecedor, NF, origem, destino e motivo de alteração.
- A divisão por N não arredonda, então a soma das parcelas pode diferir em centavos.
- O prazo "49dd" não tem `DiasPrazoNumero`: vencimento = data de entrega.
- A recursão passa `dtvcto`/`PrazoDias`, que não são parâmetros declarados (ignorados).
- Na tela, trocar o prazo recalcula o vencimento = **hoje** + dias (bTfEb).

### 5.6 Contas a pagar (comissão do vendedor) — backend `CriarContasPagar` (bToYh)
```
ValorComissao  = Entrega.ValorComissaoBruto × 0,03          (3%)
DataVencimento = dia 5 do mês seguinte à data real de entrega  (DtEntrega + 1 mês, dia := 5)
ValorTotal     = Entrega.ValorVendaBruto   (atribuído 2×; a 1ª, comissão ÷ QtdVenda, é sobrescrita)
ValorUnit      = bruto ÷ QtdEntrega; StatusFinanceiro = "A pagar"; QualPrazo = vazio
```

### 5.7 Numeração e datas
- `CotacaoNum` = `CotacaoNum` do "último" registro de uma busca sem ordenação + 1 (bTOTX0; mesma expressão no campo da tela). Sujeito a corrida e a ordem indefinida.
- `NumeroPedido` = `CotacaoNum` (texto). O PDF do pedido mostra "CotacaoNum/PropostaNum".
- Validade padrão = agora + 2 dias. Data da confirmação padrão = agora.
- Mês corrente = `change_date(1)` 00:00:00 até `change_date(31)` 23:59:59. Em meses com menos de 31 dias o fim transborda para o mês seguinte (ex.: fevereiro termina em 3/mar) [bug].
- Formatos: dd/mm/yy nos cartões; "dddd, mmmm d, yyyy" na proposta/pedido; dd/mm/yyyy na data prevista da proposta exibida.
- Distância: `distance_from` em km, 1 casa.
- Vendedor substituto: se `QualVendedor.FeriasPeriod` contém `DtPrevEntrega`, então `QualVendedorSubstituto = QualVendedor.QualVendedorSubstituto` (bTyAt, bUEtu, bTyBX e o reusable AnexaNf).

---

## 6. Integrações e backend workflows

### 6.1 Backend workflows agendados (ScheduleAPIEvent)
| Backend | Disparado por (WF/ação) | O que faz |
|---|---|---|
| `AdicionarFornecedores` (bTNrd) | bTNrX/bTNru0; reusable AddEdita Produtos | Cria orçamentos por origem, recursivo +1 s |
| `CalculaFornecedoresLista` (bTPFh) | bTOSi0/bTPHa, bTOXZ0/bTPHZ, bTOnP/bTPHh, bTPGv/bTPHr, bTOXg0/bTPHm, bTOXn0/bTPHf, bTOYp0/bTPGL, bTOiR0/bTPHU, bThst/bThsz, bThtB/bThtH, bThtM/bThtS, bThtX/bThtd, bThtf/bThtl, bThtx/bThuD, bToYN/bToYT | Recalcula os valores do orçamento (5.1) |
| `CalcularValoresEntregas` (bTbPH) | bTbPN/bTbPT, bTcSZ/bTcSf | Recalcula os valores da entrega (5.3) |
| `CriarContasReceber` (bTfDZ) | bTfDP/bTfDV | Parcelas de comissão a receber (5.5) |
| `CriarContasPagar` (bToYh) | bTcXd/bToYx | Comissão do vendedor (5.6) |
| `EnviarEmailsGeral` (bTnvb0) | bTaLf/bTnxZ0, bTnvj0/bTnvu0, bTiKL0/bTnxT0+bTnxU0, bTeZz/bTnxa0+bTnxb0, bTejF/bTnxg0+bTnxl0, bTfPH/bUEjU, (bUESt/bUESz desativado) | Envia o e-mail. Se `ConfigSistema[19].ValorBoolean1` = false, usa o SendEmail nativo (SendGrid); se true, usa o plugin SMTP 1752755029481… com a conta Gmail de `Opt.Smtp.GmailMegabox`. Soma 1 no contador `ConfigSistema[19].ValorNumero` (zerado diariamente por `ResetContagemEmails`) |

### 6.2 E-mails
| E-mail | Para | Cópia | Cópia oculta (ConfigSistema) | Anexos |
|---|---|---|---|---|
| Proposta (bTnvu0) | contato `EnviarPara` | `EmailsCopia` | código 5 | PDF + até 9 anexos |
| Reenvio de proposta (bTnxZ0) | idem | idem | código 5 | nenhum (bug do parâmetro) |
| Pedido ao fornecedor (bTnxT0) | `EmailFornecedor` | `EmailFornecedorCC` | código 7 | PDF + 9 anexos da proposta |
| Pedido ao cliente (bTnxU0, +15 s) | `EmailCliente` | `EmailClienteCC` | código 6 | PDF |
| Cancelamento ao cliente | escolhido no popup | `User.CopiaCancelamentos` | código 8 + cópia de cancelamentos | — |
| Cancelamento ao fornecedor (+15 s) | escolhido | `User.CopiaCancelamentos` | código 9 (+ cópia no de pedido) | — |
| Pós-venda "pedido finalizado" (bUEjU) | contato escolhido no cartão | vendedor do pedido | — | — |

Remetente "[Megabox] PRIMEIRONOME" (proposta: "[MegaBox]"); responder para = `User.EmailContato`. Os assuntos juntam nº, produtos distintos (agrupados por nome) e cliente ou fornecedor. Os corpos são textos-modelo editáveis na tela, com assinatura e telefones fixos no texto. Os parâmetros `mailpessoal` apontam para um campo excluído (`UsaEmailPessoal - deleted`).

### 6.3 Plugins
| Plugin | Uso nesta página |
|---|---|
| 1648430145817… (PDF/IMG) | Gera PDF de um grupo da tela (`AAL`) e dispara "Element Saved" (`AAY`, arquivo em `AAb`): proposta (`PDF/IMG PROPOSTA`) e pedido (`old PDF/IMG PEDIDO`) |
| 1648823245313… | Seletor de período (`RangePicker A`) |
| 1680110374647… | Checkbox/switch customizados (amostra, e-mails de cancelamento, "próxima compra") |
| select2, multifileupload | Multi-seleção de prazos; até 9 anexos da proposta |
| 1685525155901… | Ordena a tabela de fornecedores pelo texto de um elemento (id `distancia`/`kmdistancia`) |
| 1658328157117… | Toast |
| 1659259586969… | Copiar para a área de transferência (não aparece na lista de instalados) [DÚVIDA] |
| 1583324666271… | Download do PDF do pedido |
| 1558770956236… | Ação no carregamento, sem parâmetros [DÚVIDA] |
| 1689356815386… | Ação antes de excluir orçamento (não aparece na lista de instalados) [DÚVIDA] |

Outros: Google Maps (`google_map_link`, `distance_from` com geocodificação dos endereços); link externo fixo `https://grupomegabox.bubbleapps.io/formulariovenda`.

---

## 7. Segurança e privacidade

1. **Privacy rules abertas**: `Entregas`, `Pedido`, `OrcFornecedoresCotacao`, `ContasReceber`, `ConfigSistema` e `IcmsEstados` têm regra `everyone` com `view_all` e `search_for` = true, e a Data API está exposta. Um visitante **não logado** lê pedidos, valores, comissões, e-mails de contato, arquivos de NF, boletos e OC. `CotacaoProdutos` permite ver sem logar (não permite buscar). Só `Propostas` é fechada para anônimo.
2. **Restrição de vendedor só na URL**: Analista/Operador veem só os próprios dados porque o parâmetro `vendedor` é forçado no carregamento. Trocar a URL mostra os dados de todos. O mesmo vale para as permissões do Diretor, que são só visuais (ícones desabilitados). Na regra nova, aplicar no banco (RLS) e nas server actions.
3. **Senha do SMTP em option set**: `Opt.Smtp.GmailMegabox` guarda usuário e **senha de app** do Gmail em texto (ver `option-sets.md`). Option sets vão para o navegador, então a senha está exposta a qualquer visitante. **Rotacionar já** e guardar em segredo do servidor.
4. **Backend de e-mail genérico**: `EnviarEmailsGeral` recebe `to/cc/bcc/body/anexos` livres. Se estiver exposto na Workflow API sem autenticação, é um relay aberto [DÚVIDA: conferir `expose` desse WF]. Na regra nova, e-mails só por server action autenticada, com destinatários tirados do banco.
5. **Tabela de ICMS editável** por qualquer logado no popup de consulta (auto-binding). Os mesmos auto-bindings deixam editar valores de orçamentos, entregas e contas a receber direto do navegador, sem validação no servidor.
6. **Arquivos públicos**: uploads de OC, NF, boletos, comprovante de entrega, anexos e PDFs de proposta/pedido ficam em URLs públicas do CDN do Bubble (`private=False`). Na regra nova: bucket privado + URL assinada.
7. **Dados pessoais**: e-mails e telefones de contatos, CNPJ/IE, endereços. O link de avaliação expõe `_id` do cliente e do vendedor.
8. Campos de depuração visíveis para `IsDev`. O campo excluído `User.PassTexto` (senha em texto) existe no User; não é usado aqui, mas deve sair na migração.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto ou inócuo
- WF **bTPHt** (Gravar proposta antigo, `workflow_disabled`), substituído por bTmXN.
- WF **bUESt** (e-mail ao fechar pedido, desativado) e o switch oculto "Enviar email para próxima compra?" + estados `var_ultimotblpedido_`/`var_ultimoemailcliente_` (alimentados só por bTbqZ0).
- WFs **vazios**: bUESn (fechar propostas), bUEzt (input `ip totalbruto copy 3`).
- **bUAdY** (duplicar pedido): o ícone `Icon GZZZ` nunca fica visível.
- Elementos sem workflow: `btn adiciona destino`, ícone "enviar" da proposta (`Icon OZ`), `pop apagar registro` (SIM/NÃO sem ação), `pop.CadastroClienteFornecedor A` (nunca aberto pela página).
- Parâmetro `ordemdecrescente` + botão "data crescente" (bTaUD/bTaUN): nenhuma busca usa.
- Totais ocultos da coluna Entregas Próprias (três buscas extras) e o `Text G` vazio da coluna Substituto.
- Estados `var_usaroldpdf_`, `var_todosetapacotacao_`, `var_enviamailproposta_` (gravado, nunca lido).
- `Icon R` (abrir OC) com as duas condicionais `is_visible=True`.

### 8.2 Duplicação
- 12 WFs de "input mudou → pausa 1 s → recalcula" (6 no carrinho, 6 no pedido). Viram **uma** função de cálculo no servidor, chamada por uma server action `atualizarOrcamento`, ou colunas geradas.
- Pares de WF para alternar um booleano (arquivadas, expandir, concluídos, cancelados, abrir todos, vencedor, seleção, filtros por checkbox, ordenação por distância): um toggle cada.
- Gravar e Salvar do pedido (bTblt ≡ bTbmF, bTcqO ≈ bTbnL) e as 4 variantes de gravar/salvar proposta: uma action `salvarProposta({enviar})` e uma `salvarPedido({formalizar})`, com os **mesmos campos** (hoje cada variante grava um subconjunto diferente: forma de pagamento, CNPJ do fornecedor, anexos, histórico).
- Três jeitos de abrir o pedido (cartão de pedido, entrega própria, substituto) e dois de abrir a confirmação de entrega.
- Regra do vendedor substituto espalhada em bTbOt, bUEti, bTcXd, AnexaNf (3×) e no backend `AtribuirVendedorSubstituto`: vira trigger/função no banco.
- Busca de ICMS repetida (inputs do carrinho, do pedido, backend, reusable): uma função `aliquota_icms(uf_origem, uf_destino)`.
- Textos fixos (condições gerais de paletes/Chapatex/frete/pagamento, aviso de crédito de impostos, assinatura e telefones) repetidos em ~12 lugares: tabela de modelos/config por empresa emissora.
- Busca da coluna Cotação repetida no contador; contador de pedidos com critério diferente da lista.

### 8.3 Gambiarras
- **Carrinho em `User.TempOrcamentoProdutos`**: grava produtos e orçamentos no banco antes de a cotação existir. Deixa órfãos (cancelar não apaga orçamentos; abrir de novo apaga "o que sobrou") e é compartilhado entre abas do mesmo usuário. Na regra nova: criar a cotação como **rascunho** logo no início (`status = rascunho`), com FK normal. Cancelar = apagar em cascata.
- **Número da cotação** por "último + 1": trocar por `sequence`/identity. `NumeroPedido` como cópia textual: número próprio do pedido ou FK.
- Recálculo assíncrono com `PauseWFClient 1000` e backend agendado: a tela mostra valor velho até o backend terminar. Trocar por cálculo síncrono no servidor ou colunas geradas.
- Recursão de backend (`AdicionarFornecedores`, `CriarContasReceber`) para iterar lista: `INSERT … SELECT` numa transação.
- PDF gerado no navegador a partir do DOM (plugin) e e-mail disparado pelo evento "PDF salvo": gerar PDF no servidor (template React → PDF) e enviar numa fila, com status de envio registrado.
- Parâmetros de e-mail `anexo1..anexo10`: tabela `anexos` e lista de anexos por mensagem.
- Cópias ocultas por "ConfigSistema código N" (5, 6, 7, 8, 9, 19): tabela de configuração nomeada (`config_email_copias(tipo, usuario_id)`).
- `Opt.Etapas` serve para cotação, pedido e entrega ao mesmo tempo (a cotação usa "Pedir"; a entrega usa Pedido/Em Entrega/Financeiro/Cancelado; "Concluído" nunca é usado aqui): enums separados por entidade.
- Listas bidirecionais (Cotacao.QuaisProdutos ↔ CotacaoProdutos.QualCotacao; Pedido.QuaisEntregas ↔ Entregas.QualPedido; Orc.QuaisEntregas; Entrega.QuaisContasReceber; Cotacao.QuaisPropostas): só FK do lado filho.
- Campos denormalizados em Entregas/Pedido (`QualClienteTexto`, `QualFornecedTexto`, `NumeroEntrega`, `DtPedido`, `QualCotacao`, `QualProposta`, `QualCliente`, `QualFornecedor`): derivar por join/view.
- Snapshot da proposta por **cópia** de OrcFornecedores (a mesma tabela dos orçamentos): tabela própria `proposta_itens` (congelada), e `pedido_itens` apontando para ela.
- Inputs ocultos usados como variáveis (`ipt cartão contaproduto`, `ipt contavencedor`, `ip valorminimo`, `ipt faltaqtd`, `ipt difereca comissao` etc.): calcular na view.

### 8.4 Otimizações para o banco novo
- `cotacao_itens` e `cotacao_item_orcamentos`, com **índice único parcial** `(cotacao_item_id) WHERE vencedor` para garantir um vencedor por produto.
- Colunas geradas (ou view `v_orcamento_valores`) para bruto, comissão bruta, ICMS, PIS/COFINS, líquido e unitário líquido. Tipo `numeric(14,4)` com arredondamento explícito a 2 casas nos totais.
- View `v_pedido_item_saldo`: Σ entregas, faltas e divergência, com regra única para canceladas.
- Views dos cartões: `v_kanban_cotacoes` (nº de produtos, vencedores, propostas), `v_kanban_pedidos` (entregas, concluídas, todas concluídas), `v_kanban_entregas` (própria/substituto).
- Parcelas: tabela `prazos(dias)` em vez de option set, com o "49dd" corrigido. Função `gerar_contas_receber(entrega, prazos[], data_entrega)` que distribui os centavos na última parcela.
- Função `confirmar_entrega(...)` numa transação única: status + contas a receber + conta a pagar, idempotente (não duplica ao regravar).
- `cancelar_pedido(...)`: cancela as entregas e trata as contas já geradas (regra a decidir).
- Endereços com `geography(Point)` (PostGIS) para calcular distância no banco e ordenar pela distância de verdade.
- `icms_aliquotas(uf_origem, uf_destino) PK`, editável só por perfil autorizado.
- RLS: vendedor vê o que é seu (`vendedor_id` ou `vendedor_substituto_id`); gerente/diretor veem tudo.

---

## 9. Proposta para o app novo

### 9.1 Rotas (Next.js App Router)
- `app/(app)/vendas/page.tsx`: server component. Lê `searchParams` (mesmos nomes: `datainicio`, `datafim`, `vendedor`, `numero`, `cliente`, `arquivadas`, `expandir`, `concluidos`, `etapaPedido`, `etapaEntrega`, `pedido`, `entregaPedido`) e busca as 4 colunas em paralelo nas views. O vendedor efetivo é imposto no servidor (hierarquia > 2 → só o próprio).
- Diálogos por rota interceptada/paralela (link compartilhável, voltar fecha):
  - `vendas/@modal/cotacao/nova`, `cotacao/[id]`;
  - `cotacao/[id]/item/[itemId]/fornecedores`;
  - `cotacao/[id]/propostas` (+ `?proposta=<id>`);
  - `pedido/[id]`, `pedido/[id]/itens`;
  - `entrega/[id]/confirmar`;
  - `cancelar?pedido=|entrega=`;
  - `icms`.

### 9.2 Componentes
- `KanbanVendas`, com 4 colunas e contadores: `CardCotacao`, `CardPedido`, `CardEntrega` (variante própria/substituto).
- `FiltrosVendas`: período com `UltimoDateRange` persistido, vendedor, cliente, nº e toggles.
- `CotacaoEditor`: cabeçalho, `ItemForm`, `CarrinhoTabela` > `OrcamentosFornecedorTabela` com destaque do menor líquido e seletor de vencedor.
- `SeletorFornecedores`: filtros, distância e última cotação FOB.
- `PropostasPainel`: lista, `PropostaPreview` (mesmo componente para tela e PDF) e `PropostaForm`.
- `PedidoEditor`: e-mails, OC, prazos/forma, `PedidoItens` > `EntregasItem` com saldos e alertas, `PedidoPreview` para o PDF.
- `ConfirmarEntregaDialog` (prévia das parcelas). `CancelamentoDialog` (modelos de e-mail). `ArquivarCotacaoDialog`. `IcmsConsulta`.
- Reaproveitados de outras specs: `AgendaContatos`, `AgendaEnderecos`, `CadastroProduto`, `AnexaNf`, `EnderecoPicker`.

### 9.3 Server actions (todas validam perfil/propriedade e rodam em transação)
- Cotação: `criarCotacaoRascunho`, `salvarCotacao`, `descartarRascunho`, `arquivarCotacao(motivo)`, `desarquivarCotacao`.
- Itens e orçamentos: `adicionarItem`, `editarItem`, `removerItem`, `adicionarFornecedores(itemId, enderecoIds[], destinoId)`, `atualizarOrcamento(id, campos)` (recalcula na hora), `removerOrcamento`, `definirVencedor(orcamentoId | null)`.
- Proposta: `criarProposta(cotacaoId)` (snapshot dos vencedores), `salvarProposta(id, dados, {enviar})`, `descartarProposta`, `reenviarProposta`.
- Pedido: `criarPedidoDeProposta(propostaId)` (só se enviada), `salvarPedido(id, dados, {formalizar})`, `descartarPedidoNovo`, `editarItensPedido`, `adicionarEntrega(itemId)`, `atualizarEntrega(id, {data, qtd})`, `apagarEntregas(ids)`, `recalcularEntrega`, `finalizarPedido(id, {emailPosVenda, contatoId})`.
- Entrega e cancelamento: `gerarPrevisaoRecebimentos(entregaId, prazos, dataEntrega)`, `confirmarEntrega(entregaId, dados)` (cria contas a receber e a pagar sem duplicar), `cancelarEntrega(id, motivo, emails)`, `cancelarPedido(id, motivo, emails)`.
- Apoio: `atualizarAliquotaIcms` (perfil restrito), `salvarPeriodoUsuario`.
- Documentos: PDF gerado no servidor, gravado em bucket privado do Supabase Storage; e-mail via fila (tabela `email_outbox` + worker/cron) com log de envio. O controle de cota diária substitui o contador do `ConfigSistema 19`.

### 9.4 Consultas/views SQL
- `v_kanban_cotacoes`: cotação + cliente + vendedor + `qtd_itens`, `qtd_itens_com_vencedor`, `qtd_propostas`, `pode_propor = qtd_itens ≥ 1 AND qtd_itens_com_vencedor ≥ 1`.
- `v_kanban_pedidos`: pedido + cliente + vendedor + `qtd_entregas`, `qtd_concluidas`, `todas_concluidas`, `data_pedido`.
- `v_kanban_entregas`: entrega + pedido + cliente + produto + `vendedor_efetivo` (própria/substituto).
- `v_orcamento_valores` (ou colunas geradas); `v_pedido_item_saldo`; `v_pedido_divergencia`.
- `v_ultima_cotacao_fob(produto_id, endereco_id)`: último valor unitário FOB, ordenado por data.
- `fornecedores_para_item(item_id, filtros)`: endereços de fornecedor ativos que fornecem o produto, excluindo os já orçados, com `distancia_km` (PostGIS).
- Funções: `calc_orcamento(...)`, `aliquota_icms(uf_o, uf_d)`, `aplicar_vendedor_substituto()` (trigger em `entregas`), `gerar_contas_receber(...)`, `gerar_conta_pagar(...)`, `proximo_numero_cotacao()` (sequence).

### 9.5 Tabelas envolvidas (modelo alvo, a detalhar no remodelamento)
`cotacoes`, `cotacao_itens`, `cotacao_item_orcamentos`, `propostas`, `proposta_itens`, `pedidos`, `pedido_itens` (ou reuso de `proposta_itens`), `entregas`, `entrega_arquivos` (NF, boletos, comprovante), `contas_receber`, `contas_pagar`, `historico_cliente`, `icms_aliquotas`, `prazos_pagamento`, `motivos_arquivamento`, `empresas_emissoras` (logo, e-mail e textos de condições), `email_outbox`/`email_anexos`, `config_email_copias`; apoio: `clientes_fornecedores` (grupo), `enderecos`, `contatos`, `produtos`, `produto_grupos`, `usuarios` (perfil, férias, substituto, e-mails de cópia, último período).

---

## 10. Dúvidas

1. [DÚVIDA] "Gravar"/"Salvar" proposta (sem "Enviar") também dispara o e-mail ao cliente (bTnvj0 não checa `var_enviamailproposta_`). É intencional?
2. [DÚVIDA] O reenvio de proposta (bTaLf) sai sem anexo, porque o parâmetro `atachments` não existe no backend. Confirmar o comportamento atual e o desejado.
3. [DÚVIDA] `AdicionarFornecedores`: com origem Lucro Real/Presumido e cliente em outro regime, nenhum orçamento é criado. Qual a regra de alíquotas nesse caso?
4. [DÚVIDA] Formalizar pedido não grava a forma de pagamento (bTcqV/bTcpk) e põe **todas** as entregas em "Pedido", inclusive as já entregues ou canceladas, a cada reenvio. É bug?
5. [DÚVIDA] `Cotacao.CotacaoEtapa` e `Pedido.QualEtapa` não são gravados na criação. Há valor padrão no data type (Cotação/Pedido)?
6. [DÚVIDA] `Salvar Cotação` (bTOjb0) define ou adiciona `QuaisProdutos`?
7. [DÚVIDA] Finalizar pedido: pelo cartão marca todas as entregas e manda e-mail pós-venda; pelo popup marca só as canceladas e não manda e-mail. Qual é a regra?
8. [DÚVIDA] Cancelar pedido com entregas já em Financeiro: o que fazer com as contas a receber/pagar geradas?
9. [DÚVIDA] Regravar a confirmação de uma entrega em Financeiro (Diretor) cria outra conta a pagar. Deve bloquear ou atualizar?
10. [DÚVIDA] Contas a receber: `ValorTotal` recebe o bruto cheio em cada parcela. É informativo ou deveria ser rateado? E o vencimento parte da data de entrega (backend) ou de hoje (edição na tela)?
11. [DÚVIDA] Preço unitário bruto da proposta: com frete (pré-visualização nova) ou sem frete (proposta exibida/pedido)?
12. [DÚVIDA] Divergência de comissão deve incluir entregas canceladas?
13. [DÚVIDA] O operador `{'type': 'Empty'}` no filtro de `_id` da coluna Pedido: presumo "igual a". E quem preenche `filtrafinanceiro` (outra página?).
14. [DÚVIDA] Plugins 1558770956236… (carregamento), 1689356815386… (antes de excluir orçamento) e 1659259586969… (copiar): o que fazem e se ainda estão instalados.
15. [DÚVIDA] `bThst`: qual dos dois inputs `ip valorvenda` do popup de itens do pedido (Qtd ou Valor Unit) dispara o recálculo. O outro não recalcula.
16. [DÚVIDA] Ordenação ao abrir o popup de fornecedores usa o id `kmdistancia` (texto do endereço), não `distancia`. É engano?
17. [DÚVIDA] O ICMS padrão no input (condicional com Nova Cotação) só aparece na tela; é gravado sem o usuário mexer?
18. [DÚVIDA] `EnviarEmailsGeral` está exposto na Workflow API sem autenticação?
19. [DÚVIDA] "Pedido número" repete o número da cotação. Uma cotação pode gerar mais de um pedido? Como distinguir?
20. [DÚVIDA] O link de avaliação no e-mail pós-venda (`&pdd<id>`, sem `=`) quebra o parâmetro do vendedor na página `formulariovenda`?

---

## 11. Cobertura (167 workflows)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTKAD | PageLoaded | Define submenu, período padrão, parâmetros padrão e força o vendedor | 4.1 |
| 2 | bTNjj | Clique `add produto` (Nova Cotação) | Cria produto temporário no carrinho | 4.2 |
| 3 | bTNrD | Clique `Icon IZZZ` (não selecionado) | Marca fornecedor na seleção | 4.3 |
| 4 | bTNrK | Clique `Icon IZZZ` (selecionado) | Desmarca fornecedor | 4.3 |
| 5 | bTNrX | Clique `Button E` "Adicionar Fornecedores" | Agenda AdicionarFornecedores e fecha | 4.3, 6.1 |
| 6 | bTOOI | Clique `btn nova cotação` | Abre popup em Nova Cotação | 4.2 |
| 7 | bTOOP | Clique `btn cancelacotacao` | Apaga temporários e fecha | 4.2 |
| 8 | bTNrz0 | Clique `btn adiciona fornecedor` | Abre seleção de fornecedores do produto | 4.3 |
| 9 | bTOSi0 | Mudou `dd tipofrete` (carrinho) | Zera frete se ≠ CIF Informado e recalcula | 4.3, 5.1 |
| 10 | bTOSp0 | Clique `btn remove orcamentoproduto` | Remove produto e seus orçamentos | 4.2 |
| 11 | bTOTH0 | Clique `btn remove orcamento fornecedor` | Plugin + apaga orçamento | 4.3 |
| 12 | bTOTR0 | Clique `btn gravarcotacao` | Cria a cotação e vincula os itens | 4.2 |
| 13 | bTOUI0 | Clique `icon ganhador` (é vencedor) | Desmarca vencedor | 4.3 |
| 14 | bTOUP0 | Clique `icon ganhador` (não é) | Troca o vencedor do produto | 4.3 |
| 15 | bTOWv0 | Clique `Text P` (nome do produto) | Alterna a lista de fornecedores | 4.3 |
| 16 | bTOXZ0 | Mudou `ip valorvenda` (carrinho) | Pausa e recalcula orçamento | 4.3, 6.1 |
| 17 | bTOnP | Mudou `ip piscofins` (carrinho) | Pausa e recalcula | 4.3, 6.1 |
| 18 | bTPGv | Mudou `ip valorfrete` (carrinho) | Pausa e recalcula | 4.3, 6.1 |
| 19 | bTPHt | Clique `btn proposta gravar` (desativado) | Versão antiga de gravar proposta | 4.5, 8.1 |
| 20 | bTPJB | Clique `btn edita contato cliente` | Abre agenda de contatos do cliente | 4.5 |
| 21 | bTPQO | Clique `btn edita endereco cliente` | Abre agenda de endereços do cliente | 4.5 |
| 22 | bTPfZ | Clique `Icon TZZ` | Abre consulta ICMS (carrinho) | 4.3 |
| 23 | bTOXg0 | Mudou `ip valorcomissao` (carrinho) | Pausa e recalcula | 4.3, 6.1 |
| 24 | bTOXn0 | Mudou `ip icms` (carrinho) | Pausa e recalcula | 4.3, 6.1 |
| 25 | bTOYp0 | Mudou `Input B` (qtd do produto) | Grava qtd no produto e nos orçamentos e recalcula | 4.2 |
| 26 | bTOZp0 | Clique `Icon B` (chevron) | Alterna a lista de fornecedores | 4.3 |
| 27 | bTOhp0 | Clique `btn edita produto` | Carrega produto no formulário (Edita Produto) | 4.2 |
| 28 | bTOiR0 | Clique `salvar produto` | Salva produto, propaga qtd e recalcula | 4.2 |
| 29 | bTOir0 | Clique `add produto` (Edita Cotação) | Cria produto já ligado à cotação | 4.2 |
| 30 | bTOjP0 | Clique `btn salvarcotacao` | Salva a cotação editada | 4.2 |
| 31 | bTPDr0 | Clique `btn proposta gravarenviar` | Grava, marca enviada, histórico, PDF | 4.5 |
| 32 | bTPfs | Clique `Icon IZ` (copiar) | Copia alíquota e mostra toast | 4.3 |
| 33 | bTPhF | Clique `btn proposta salvar` | Salva proposta editada e gera PDF | 4.5 |
| 34 | bTPhL | Clique `btn proposta salvarenviar` | Salva, marca enviada e gera PDF | 4.5 |
| 35 | bTPmK | Clique `Icon MZ` (editar proposta) | Entra em Edita Proposta | 4.5 |
| 36 | bTPoC | Clique `Button M` "+ Proposta" | Copia vencedores e cria proposta | 4.5 |
| 37 | bTPoa | Clique `btn proposta cancelagravar` | Descarta proposta nova | 4.5 |
| 38 | bTPol | Clique `btn proposta cancelasalvar` | Cancela edição de proposta | 4.5 |
| 39 | bTPoz | Clique `Icon NZ` | Abre PDF da proposta | 4.5 |
| 40 | bTQAy | Clique `gp card cotacao` | Alterna resumo do cartão | 4.1 |
| 41 | bTQBP | Clique `btn edita orcamento` | Abre cotação em Edita Cotação | 4.2 |
| 42 | bTQBi | Clique `btn addedita proposta` | Abre popup de propostas | 4.5 |
| 43 | bTaGu | Clique `btn expandir cartoes` (yes) | `expandircartoes=no` | 4.1 |
| 44 | bTaIm | CustomEvent "fechar pop cotacao" | Limpa estados, popups e temporários | 4.2 |
| 45 | bTaJv | Clique `btn abrir todos` (fechado) | Abre todas as listas de fornecedores | 4.3 |
| 46 | bTaKF | Clique `btn abrir todos` (aberto) | Fecha todas | 4.3 |
| 47 | bTaLf | CustomEvent "Enviar Email Proposta" | Agenda e-mail da proposta (reenvio) | 4.5, 6.2 |
| 48 | bTaPQ | Clique `Icon OZZ` | Fecha popup de propostas | 4.5 |
| 49 | bTaPi | Clique `btn arquivar` (não arquivada) | Abre popup de arquivamento | 4.4 |
| 50 | bTaTZ | Clique `btn cotacao arquivada` (no) | `cotacaoarquivada=yes` | 4.1 |
| 51 | bTaTj | Clique `btn cotacao arquivada` (yes) | `cotacaoarquivada=no` | 4.1 |
| 52 | bTaTq | Clique `btn arquivar` (arquivada) | Desarquiva | 4.4 |
| 53 | bTaUD | Clique `btn data crescente` (yes) | `ordemdecrescente=no` (sem efeito) | 4.1, 8.1 |
| 54 | bTaUN | Clique `btn data crescente` (no) | `ordemdecrescente=yes` (sem efeito) | 4.1, 8.1 |
| 55 | bTagt | Clique `seleciona proposta` (outra) | Exibe a proposta | 4.5 |
| 56 | bTahD | Clique `seleciona proposta` (a mesma) | Desseleciona | 4.5 |
| 57 | bTbFt | Clique `Icon KZZZ` (criar pedido) | Cria pedido, cotação vai para Pedir | 4.6 |
| 58 | bTbOt | Clique `btn add entrega no pedido` | Cria entrega do item | 4.6 |
| 59 | bTbPN | Mudou `ipt entrega qtd` | Recalcula valores da entrega | 4.6, 5.3 |
| 60 | bTbZy | Clique `btn edita pedido` (cartão pedido) | Abre pedido em edição | 4.6 |
| 61 | bTbai | Clique `gp card pedido` | Alterna detalhe do cartão | 4.1 |
| 62 | bTblt | Clique `btn pedido gravar` (sem formalizar) | Grava pedido e fecha | 4.6 |
| 63 | bTbmF | Clique `btn pedido salvar` (sem formalizar) | Grava pedido e fecha | 4.6 |
| 64 | bTbnL | Clique `btn pedido salvar` (formalizar) | Grava, formaliza, status Pedido, PDF | 4.6 |
| 65 | bTbnk | Clique `Icon XZ` | Agenda de contatos do fornecedor | 4.6 |
| 66 | bTbuB | Clique `chk entrega pra deletar` (não marcada) | Marca para apagar | 4.6 |
| 67 | bTbuI | Clique `chk entrega pra deletar` (marcada) | Desmarca | 4.6 |
| 68 | bTbxI | Clique `Icon VZZ` | Apaga entregas marcadas | 4.6 |
| 69 | bTcJT | Clique `btn edita pedido` (entrega própria) | Abre pedido da entrega | 4.6 |
| 70 | bTcRp | Clique `Text BZZZZZZZ` (Nf) | Abre arquivo da NF | 4.6 |
| 71 | bTcSZ | Clique `force calc` | Recalcula entrega | 4.6, 5.3 |
| 72 | bTcXd | Clique `btn confirmaentrega` | Entrega vai para Financeiro e gera conta a pagar | 4.8, 5.6 |
| 73 | bTcXk | Clique `btn cencela confirmaentrega` (≠ Financeiro) | Fecha e apaga previsões | 4.8 |
| 74 | bTbqZ0 | Clique `btn pedido fecharjanela` | Guarda último pedido e fecha | 4.6 |
| 75 | bTbrC0 | Clique `btn pedido cancelargravar` | Descarta pedido novo e volta a cotação | 4.6 |
| 76 | bTbrN0 | Clique `btn pedido cancelarsalvar` | Fecha sem salvar | 4.6 |
| 77 | bTcYr | Clique `ico proposta` (caminhão, própria) | Abre confirmação de entrega | 4.8 |
| 78 | bTcZi | Clique `Icon YZ` | Agenda de contatos do cliente (pedido) | 4.6 |
| 79 | bTcal | PopupOpened `pop add edita cotacao` | Apaga temporários antigos (Nova) | 4.2 |
| 80 | bTcbO | Clique `Icon JZ` | Agenda de endereços do cliente (fornecedores) | 4.3 |
| 81 | bTccd | Clique `sort distance` (asc) | Ordena por distância decrescente | 4.3 |
| 82 | bTcct | PopupOpened `pop add fornecedor` | Ordena tabela ao abrir | 4.3 |
| 83 | bTcdG | Clique `sort distance` (desc) | Ordena por distância crescente | 4.3 |
| 84 | bTchZ | Clique `btn fecar add fornecedores` | Fecha popup de fornecedores | 4.3 |
| 85 | bTcjZ | Clique `Icon PZ` | Agenda de endereços do cliente (cotação) | 4.2 |
| 86 | bTcjx | Clique `btn cancelanetrega` | Abre cancelamento de entrega | 4.9 |
| 87 | bTcqO | Clique `btn pedido gravar` (formalizar) | Grava, formaliza, status Pedido, PDF, histórico | 4.6 |
| 88 | bTcrj | Clique `Button P` (retira pedido, popup) | Finaliza pedido (só entregas canceladas marcadas) | 4.6 |
| 89 | bTcsf | Clique `chk filtraentrega` (própria, marcar) | Filtra pelo pedido da entrega | 4.1 |
| 90 | bTcsp | Clique `chk filtrapedido` (marcar) | Filtra entregas do pedido | 4.1 |
| 91 | bTcsw | Clique `chk filtrapedido` (desmarcar) | Limpa filtro | 4.1 |
| 92 | bTctN | Clique `chk filtraentrega` (própria, desmarcar) | Limpa filtro | 4.1 |
| 93 | bTcvX | Clique `btn proposta editacotacao` (exibida) | Abre cotação em edição | 4.2 |
| 94 | bTcvp | Clique `btn proposta editacotacao` (nova) | Abre cotação em edição | 4.2 |
| 95 | bTeZz | Clique `Button L` (Cancela Entrega) | Cancela entrega e manda e-mails | 4.9 |
| 96 | bTeai | Clique `Icon T` | Fecha popup de cancelamento | 4.9 |
| 97 | bTeiI | Clique `hide dados do pedido` | Recolhe dados do pedido | 4.6 |
| 98 | bTeiV | Clique `Icon WZ` | Agenda de endereços do cliente (pedido) | 4.6 |
| 99 | bTejF | Clique `Button L` (Cancela Pedido) | Cancela pedido e entregas e manda e-mails | 4.9 |
| 100 | bTejh | Clique `ico cancela pedido` | Abre cancelamento de pedido | 4.9 |
| 101 | bTcwN0 | Mudou `ipt filter numpedido` | `numeropedido` na URL | 4.1 |
| 102 | bTcwl0 | Clique `Icon Q` | Limpa filtro de número | 4.1 |
| 103 | bTcxQ0 | Clique `Icon R` | Abre arquivo da OC | 4.6 |
| 104 | bTcxu0 | Clique `Icon S` | Limpa filtro de cidade (fornecedores) | 4.3 |
| 105 | bTeyi | Clique `Icon V` | Novo cliente (agenda de endereços) | 4.2 |
| 106 | bTfAN | Clique `Icon HZ` | Agenda de contatos do fornecedor (cancelamento) | 4.9 |
| 107 | bTfAV | Clique `Icon GZ` | Troca dado da agenda do cliente (não mostra) | 4.9 |
| 108 | bTfDP | Clique `Button EZ` "Recebimentos" | Agenda CriarContasReceber | 4.8, 5.5 |
| 109 | bTfEb | Mudou `dd prazo a vencer` | Vencimento = hoje + dias do prazo | 4.8, 5.5 |
| 110 | bTfEi | Clique `Icon W` | Apaga parcela prevista | 4.8 |
| 111 | bTfJz | Clique `btn cencela confirmaentrega` (Financeiro) | Só fecha | 4.8 |
| 112 | bTfLG | Clique `Icon AZZ` | Agenda de endereços do fornecedor | 4.3 |
| 113 | bTfMg | Clique `Icon BZZ` | Abre fornecedor no Google Maps | 4.3 |
| 114 | bTfOS | Clique `Icon CZZ` | Limpa filtro nome fornecedor | 4.3 |
| 115 | bTfOk | Clique `Icon DZZ` | Limpa filtro UF | 4.3 |
| 116 | bThDv | Clique `edita produto` | Abre cadastro do produto selecionado | 4.2 |
| 117 | bThED | Clique `abre cadastro produtos` | Abre cadastro de produtos | 4.2 |
| 118 | bThVe | Clique `btn novofornecedor` | Novo fornecedor (agenda de endereços) | 4.3 |
| 119 | bThst | Mudou `ip valorvenda` (pedido) | Pausa e recalcula item do pedido | 4.6, 6.1 |
| 120 | bThtB | Mudou `ip valorcomissao` (pedido) | Pausa e recalcula | 4.6, 6.1 |
| 121 | bThtM | Mudou `dd tipofrete` (pedido) | Zera frete se ≠ CIF Informado e recalcula | 4.6, 5.1 |
| 122 | bThtX | Mudou `ip valorfrete` (pedido) | Pausa e recalcula | 4.6, 6.1 |
| 123 | bThtf | Mudou `ip piscofins` (pedido) | Pausa e recalcula | 4.6, 6.1 |
| 124 | bThtq | Clique `Icon BZZZ` | Abre consulta ICMS (pedido) | 4.3 |
| 125 | bThtx | Mudou `ip icms` (pedido) | Pausa e recalcula | 4.6, 6.1 |
| 126 | bThxa | Clique `Icon HZZ` | Fecha edição de itens do pedido | 4.6 |
| 127 | bThxh | Clique `Icon FZZ` | Abre edição de itens do pedido | 4.6 |
| 128 | bTiVy | Clique `btn expandir cartoes` (no) | `expandircartoes=yes` | 4.1 |
| 129 | bTiWJ | Clique `btn pedidosconcluidos` (no) | Concluídos = yes, etapa entrega Financeiro | 4.1 |
| 130 | bTiWQ | Clique `btn entregascanceladas` (Pedido) | Mostra cancelados | 4.1 |
| 131 | bTiWX | Clique `btn entregascanceladas` (Cancelado) | Volta a Pedido/Em Entrega | 4.1 |
| 132 | bTiWn | Clique `Icon H` | Período = mês corrente | 4.1 |
| 133 | bTiYD | Plugin RangePicker (AAd) | Grava UltimoDateRange e período na URL | 4.1 |
| 134 | bTiYP | Mudou `dd filter vendedor` | `vendedor` na URL | 4.1 |
| 135 | bTiYa | Clique `Icon EZZ` | Limpa vendedor | 4.1 |
| 136 | bTicz | Clique `Button BZ` "Novo Produto" (pedido) | Abre AddEdita Produtos com o pedido | 4.6 |
| 137 | bTidv | Clique `Icon IZZ` | Exclui item do pedido (produto + orçamento) | 4.6 |
| 138 | bTigA | Clique `Icon JZZ` | Edita item do pedido (AddEdita Produtos) | 4.6 |
| 139 | bTjPu | Mudou `ipt filter cliente` | `cliente` na URL | 4.1 |
| 140 | bTjQB | Clique `Icon EZZZ` | Limpa cliente | 4.1 |
| 141 | bTjTx | Clique `Icon DZZZ` | Abre arquivo da NF | 4.6 |
| 142 | bTjjH | Clique `Icon FZZZ` | Abre até 4 boletos | 4.6 |
| 143 | bTkep | Clique `Icon HZZZ` | Abre endereço do cliente no Google Maps | 4.3 |
| 144 | bTlDb | Clique `Button CZ` "Arquivar" | Arquiva com motivo | 4.4 |
| 145 | bTlYI | Clique `btn retira pedido` (motivo no cartão de cotação) | Reabre popup de arquivamento | 4.4 |
| 146 | bTfPH | Clique `btn retira pedido` (cartão de pedido) | Finaliza pedido, e-mail pós-venda, histórico | 4.6, 6.2 |
| 147 | bTmXN | Clique `btn proposta gravar` | Grava proposta, adiciona à cotação, PDF | 4.5 |
| 148 | bToYN | Clique `Icon M` | Recalcula item do pedido | 4.6 |
| 149 | bTzTz | Clique `gp card entrega` (substituto) | Alterna detalhe | 4.1 |
| 150 | bTzUJ | Clique `btn edita pedido` (substituto) | Abre pedido da entrega | 4.6 |
| 151 | bTzUV | Clique `ico proposta` (caminhão, substituto) | Abre confirmação de entrega | 4.8 |
| 152 | bTzUd | Clique `chk filtraentrega` (substituto, marcar) | Filtra pelo pedido | 4.1 |
| 153 | bTzUn | Clique `chk filtraentrega` (substituto, desmarcar) | Limpa filtro | 4.1 |
| 154 | bUAdY | Clique `Icon GZZZ` (duplicar) | Abre DuplicarPedido (ícone nunca visível) | 4.6, 8.1 |
| 155 | bUCUR | Clique `Icon PZZZ` | Limpa filtro de regime tributário | 4.3 |
| 156 | bUESn | PopupClosed `pop add edita propostas` | Vazio | 4.5, 8.1 |
| 157 | bUESt | PopupClosed `pop add edita pedido` (desativado) | E-mail "pedido finalizado" | 4.6, 8.1 |
| 158 | bUEti | Mudou `ipt entrega dataprevista` | Grava data prevista e substituto | 4.6, 5.7 |
| 159 | bUEzt | Mudou `ip totalbruto copy 3` | Vazio | 8.1 |
| 160 | bTfTb0 | Clique `btn pedidosconcluidos` (yes) | Concluídos = no, etapa entrega Em Entrega | 4.1 |
| 161 | bThlm0 | Clique `Icon FZ` | Limpa filtro identificador | 4.3 |
| 162 | bTiFL0 | Clique `gp card entrega` (própria) | Alterna detalhe | 4.1 |
| 163 | bTiKL0 | Plugin PDF salvo (`old PDF/IMG PEDIDO`) | Grava PDF do pedido e manda e-mails a fornecedor e cliente | 4.6, 6.2 |
| 164 | bTiLN0 | Clique `Link A` "pdf pedido" | Baixa o PDF do pedido | 4.6 |
| 165 | bTiOx0 | Clique `btn reenviar proposta` | Dispara reenvio e mostra toast | 4.5 |
| 166 | bTnvj0 | Plugin PDF salvo (`PDF/IMG PROPOSTA`) | Grava PDF da proposta e manda e-mail | 4.5, 6.2 |
| 167 | bTzcV0 | Clique `btn edita endereco fornecedor` | Agenda de endereços do fornecedor vencedor | 4.5 |
