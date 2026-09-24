# Spec funcional — reusables de edição de contas a receber (`financeiro`)

Fonte: `mapa/reusable-pop.EditaContasReceberNew.md` (bTrot — 204 elementos · 23 workflows · 55 ações · 43 condicionais · 8 estados customizados · 2 popups · 3 tabelas · 2 HTML),
`mapa/reusable-pop.EditaContasReceber.md` (bTiin — 112 elementos · 9 workflows · 15 ações · 22 condicionais · 1 popup · 2 tabelas · 1 HTML),
`mapa/reusable-pop.HistoricosContaReceber.md` (bTlza — 49 elementos · 4 workflows · 10 ações · 5 condicionais · 1 tabela).
Total coberto: **365 elementos · 36 workflows · 80 ações · 70 condicionais**.
Apoio: `data-types.md` (`Tbl.ContasReceber` 40 campos, `Tbl.ContasPagar` 41 campos em `tbl_contasreceber1`, `Tbl.Entregas`,
`Tbl.OrcFornecedoresCotacao`, `Tbl.Pedido`, `Tbl.Historico`, `Tbl.Cobrancas`), `option-sets.md`
(`Opt.ParcelasReceber`, `Opt.StatusFinanceiro`, `Opt.TiposData`, `Opt.PerfilUsuario`),
`backend-workflows.md` (`CriarContasReceber` bTfDZ, `CriarContasPagar` bToYh, `CalcularValoresEntregas` bTbPH,
`CalculaFornecedoresLista` bTPFh, `EnviarEmailsGeral` bTnvb0, `CopiarEndereçosOrcamentoParaContasReceber` bToWv0),
`integracoes.md`, e o hospedeiro `mapa/pagina-financeiro.md`.

**Se esta spec e o mapa discordarem, o mapa manda.**

Esta spec complementa `specs/paginas/financeiro.md` e **não a repete**: baixa, cobrança, recibo, filtros, cards,
arquivamento e relatórios estão lá (§4.3 a §4.10, §5). Aqui está só o que estes três reusables fazem.

Glossário (igual ao de `financeiro.md`):
- **CR** = `Tbl.ContasReceber` (`tbl_contasreceber`) — comissão que a MegaBox recebe **do fornecedor**.
- **CP** = `Tbl.ContasPagar` (`tbl_contasreceber1`) — comissão a **pagar ao vendedor** (3% da comissão da entrega).
- **Entrega** = `Tbl.Entregas`; **orçamento** = `Tbl.OrcFornecedoresCotacao` (linha vencedora do fornecedor).
- **Nome de campo ambíguo no mapa** (o decompilador deriva o nome do id): em `Tbl.Entregas`,
  `cpo.dtentrega` = `cpo_dtentrega_date` = **data real de entrega**, e `cpo.DataEntrega` = `cpo_dataentrega_date` =
  **data prevista de entrega** (`cpo.DtPrevEntrega`). Em `Tbl.Entregas`, `cpo.valorcomissao` = `cpo_valorcomissao_number`
  = `cpo.ValorComissaoBruto`; em `Tbl.OrcFornecedoresCotacao`, `cpo.valorcomissao` = `cpo.ValorComissaoUnit` (**unitário**);
  em CR/CP, `cpo.valorcomissao` = `cpo.ValorComissao`. Essa colisão de nomes é a origem de vários erros da §8.3.

---

## 1. Propósito e quem usa

| Reusable | Papel | Quem abre / de onde |
|---|---|---|
| `pop.EditaContasReceberNew` (bTrot) | Diálogo único de manutenção financeira de **uma entrega**: corrige os dados da entrega (data, quantidade, comissão unitária, número e arquivo da NF do fornecedor), refaz as parcelas de CR e a CP do vendedor, ajusta vencimento/prazo/valor de cada parcela, estorna, apaga parcelas e cancela a entrega ou o pedido inteiro. | Instância `pop.EditaContasReceberNew A` (bTsCB1) na página `financeiro`. Abriam-no os WF **bTpTH** (lápis da linha CR) e **bTvIt** (lápis da linha CP), **ambos com `workflow_disabled=True`** (ver `financeiro.md` §4.10 e §8.1). Hoje o lápis vai para a página `historico` (WF bTvIN). **O diálogo está inalcançável na produção.** |
| `pop.EditaContasReceber` (bTiin) | Versão **anterior** do mesmo diálogo, mais enxuta: mostra a entrega em modo leitura e traz uma janela dedicada para alterar a comissão unitária com motivo obrigatório. | Instância `pop.ConfirmaEntrega A` (bTpQj) na página `financeiro`. **Nenhum workflow a exibe** (`financeiro.md` §2.2) — código morto (§8.1). |
| `pop.HistoricosContaReceber` (bTlza) | Histórico (anotações) de **uma CR**: lista, inclui (opcionalmente também no fornecedor), edita. | Três hospedeiros: página `financeiro` (bTpQp, WF bTpUs e bTpVc — ver `financeiro.md` §4.9), `pop.EditaContasReceberNew` (bTrtI, WF bTruD e bTsBq1) e `pop.EditaContasReceber` (bTmCO, WF bTltB). |

Perfis de negócio: Financeiro e Diretoria. `Opt.PerfilUsuario` = Diretor(hierarquia 1), Gerente(2), Analista(3), Operador(4).

### Controle de acesso de fato (só no navegador)

Nada nestes reusables é verificado no servidor. As travas são **condicionais de elemento** e um estado de cliente:

1. **`var_liberaedicao_`** (estado booleano do reusable, WF bTryq1 liga / bTsOz desliga pelo `Button D`): destrava os
   inputs da linha da entrega (`ipt dtentrega` bTruh, `ipt qtd entrega` bTruo, `ipt comissaounit` bTruv, `ipt numnf` bTrqZ,
   `upf arquivo nf` bTrqh — todos com `disabled=True` no padrão e `disabled=False` na condicional). É estado de cliente: qualquer
   pessoa o altera pelo devtools, e nenhum workflow o reconfere antes de gravar.
2. **`CurrentUser:cpo.QualPerfil:hierarquia:equals(1)`** (só Diretor) libera, nas linhas de CR e CP: `dt vencimento`
   (bTrsA / bTsCZ1), `dd prazo a vencer` (bTrsZ), a lixeira (`btn deletar recebimento` bTrsS / `btn deletar pagamento` bTsAR1)
   e o estorno (`btn mudar status recebimento` bTrsT / `btn mudar status pagamentos` bTsAV1) — sempre combinado com
   `StatusFinanceiro ≠ Recebido` (para editar/apagar) ou `= Recebido` (para estornar).
   Na versão antiga a regra era `hierarquia ≤ 1` para `Input numnf` (bTlid) e `upf nf fornecedor` (bTlij).
3. **`ipt valor a receber`** (bTrsG, CR; bTsAJ1, CP) fica `disabled=True` **sem nenhuma condicional que o habilite** —
   e ainda assim grava, porque tem `auto_binding: True` (§7).
4. **`btn comentarios recebimento`** (bTrsX) e o clipe da NF (`Icon A` bTrqb) são liberados para **qualquer** usuário.
5. No `pop.HistoricosContaReceber`, editar/apagar uma anotação exige `Created By = CurrentUser OR QualPerfil = Diretor`
   (condicionais bTmBF e bTmBe) — também só no navegador.

---

## 2. Estrutura

### 2.1 `pop.EditaContasReceberNew` (bTrot)

**Contrato de entrada:** o hospedeiro faz `DisplayGroupData` com **um `Tbl.Entregas`** e depois `ShowElement`
(na página: `Ancestor[TableCrossAxis]:cpo.QualEntrega`, isto é, a entrega da CR/CP clicada — ações bTpTL/bTpTM e bTvIy/bTvIz).
O grupo raiz `Group A` (bTrou) é `group_type="custom.tbl_entregas"` com `data_source: Parent`; **todos** os grupos de
primeiro nível repetem esse tipo. Não há parâmetro de URL nem estado de entrada além disso.

**O que grava** (detalhe na §4): `Tbl.Entregas` (dtentrega, QtdEntrega, NumNfFornecedor, ArquivoNfFornecedor,
MotivoAlteracaoValores, ComprovanteEntrega, StatusEntrega, MotivoCancelamento, QuaisContasReceber, QuaisContasPagar),
`Tbl.OrcFornecedoresCotacao` (ValorComissaoUnit e, via bTPFh, os derivados), `Tbl.Pedido` (MotivoAlteraValores,
PrazoRecebComissoes, QualEtapa, MotivoCancelamento), `Tbl.ContasReceber` e `Tbl.ContasPagar` (cria, apaga, vencimento,
prazo, valor, status, estorno) e — pelo reusable aninhado — `Tbl.Historico` e `Tbl.GrupoCliFor`.

**Layout, de cima para baixo:**

| Bloco | Elementos | Conteúdo |
|---|---|---|
| Cabeçalho | `Group A` bTrou | "Edita recebimentos e pagamentos"; "Nota Núm: {Entrega.NumNfFornecedor}" (bTroz); X de fechar `btn fecha addedita financeiro` (bTsDL1 → WF bTsDR1) |
| Dados da entrega | `Group B` bTrpA | Logo do cliente (`upi novocliente logo` bTrpF, `src = Entrega.QualCotacao.QualCliente.Foto`, placeholder svgrepo quando `Entrega.QualCliente.Foto` vazio — lê **dois caminhos diferentes** para o mesmo cliente, ver §10.16); nome do cliente; "Cotação número N - Proposta número N"; "Condição negociada: {Pedido.PrazoRecebComissoes:display}"; `Button D` "Alterar"/"Cancela" (cadeado ↔ cadeado aberto, WF bTryq1/bTsOz) e `Button E` "Cancelar" (abre o cancelamento, WF bTsLO) |
| Tabela da entrega | `rpg entregas do produto` bTrpN | Uma linha só (`data_source: Parent:convert_to_list`). Colunas: Dt entrega, Qtd entrega, **Comissão Unit**, Comissão a receber, Núm NF, (coluna do disquete), Anexo NF |
| Contas a receber | `Group F` bTrqy + `rpg ContasReceber` bTrrW | Comprovante de entrega (upload auto-bound), "Qtd parcelas" (`dd qtd parcelas receber` bTrrQ), botão `Button B` "Recebimentos"; tabela das parcelas (`Entrega.QuaisContasReceber`) |
| Contas a pagar | `Group M` bTrzD1 + `rpg ContasReceber` bTrzZ1 | Botão `Button H` "Pagamentos"; tabela `Entrega.QuaisContasPagar` (tipo `custom.tbl_contasreceber1`). **A tabela tem o mesmo nome da de CR** (§10.14) |
| Rodapé | `Group E` bTrqt | `btn cencela confirmaentrega` "Fechar" (WF bTrtZ) |
| Reusables aninhados | bTsLb, bTrtI | `pop.AgendaContatos` (WF bTsKw/bTsLD) e `pop.HistoricosContaReceber` (WF bTruD/bTsBq1) |

**Estados customizados (8):**

| Onde | Estado | Tipo | Para quê |
|---|---|---|---|
| reusable | `var_liberaedicao_` | boolean | destrava os inputs da linha da entrega |
| `pop alerta alteracao` (bTrsr) | `var_numnf_` | text | valor digitado, copiado pelo WF bTrwl |
| " | `dt_entrega_` | date | " |
| " | `var_arquivonf_` | file | " |
| " | `var_qtdentrega_` | number | " |
| " | `var_valorcomissao_` | number | comissão unitária digitada |
| `pop cancelar entrega e pedido` (bTsIl) | `var_qualpedido_` | `Tbl.Pedido` | alvo do cancelamento |
| " | `var_qualentrega_` | `Tbl.Entregas` | " |

**Popups internos (2):**
- **`pop alerta alteracao`** (bTrsr, tipo `custom.tbl_entregas`): aviso em três frases — "Você está alterando dados da
  entrega que interferem nas contas a receber e a pagar", "As contas a receber e a pagar serão **completamente redefinidas**",
  "Essa operação não pode ser desfeita! Você tem certeza?" — + `ipt motivo altera comissao` (bTrtC, `mandatory=True`)
  e os botões `btn gravar entregas` "SIM" (WF bTrtm) / `Button G` "NÃO".
- **`pop cancelar entrega e pedido`** (bTsIl): motivo obrigatório (`MultilineInput B` bTsIz), toggle
  `tgg cancela pedido` (bTsLs) que muda o cancelamento de "só esta entrega" para "o pedido inteiro" — só faz sentido
  porque o texto avisa "O pedido original contém apenas essa entrega agendada" —, toggles `tgg informa cancelamento cliente`
  (bTsJF) e `... fornecedor` (bTsJL) que revelam destinatário (dropdowns bTsJX/bTsJp, com ícone de agenda bTsKw/bTsLD)
  e o corpo do e-mail pré-montado (bTsJh/bTsJz, quatro textos fixos com telefones e assinatura — §8.2), e os botões
  `Button J` "SIM" (WF bTsKN ou bTsKe, conforme o toggle) / `Button I` "NÃO" (WF bTsOm). `Icon I` bTsIm fecha (WF bTsKG).

**Condicionais que valem regra** (43 no total; as visuais de responsividade foram omitidas do mapa):
- Cabeçalho "Comissão Unit" (bTrpj) fica **negrito e vermelho** quando
  `Entrega.ValorComissaoBruto ≠ soma de ValorComissao das CRs` — é o único alerta de divergência de dinheiro da tela (§5.6).
- `Button D` vira "Cancela" com cadeado aberto quando `var_liberaedicao_` é verdadeiro.
- `Button B` "Recebimentos" fica desabilitado quando `dd qtd parcelas receber` tem menos de 1 opção.
  `Button H` "Pagamentos" **não tem condicional** — sempre clicável (§8.3).
- Grupo do motivo (`Group J` bTrsL na CR, `Group M` bTsAK1 na CP) só aparece quando `MotivoAlteraComissao` não está vazio;
  mostra ícone de informação + o texto do motivo.
- Célula de status (`Group D` bTrse / `Group M` bTsAd1): fundo e borda verdes e o SVG do bloco HTML quando
  `StatusFinanceiro = Recebido`. A tabela de CP usa a mesma comparação com **`Recebido`**, embora a CP nasça
  `A pagar` (`financeiro.md` §10 já registra essa dúvida).
- `Icon A` (clipe, bTrqb) troca para spinner enquanto `upf arquivo nf` carrega.
- `btn comentarios pagamento` (bTsAW1) é `oculto ao carregar` e **não tem condicional que o mostre** → invisível (§8.1).
- Textos "SIM" e "NÃO" do cancelamento (bTsJQ/bTsNr) **ambos** viram "Cancela Pedido" quando o toggle está ligado (§8.3).

**Blocos HTML (2):** `HTML A` (bTrsf, célula de status da CR) e `HTML B` (bTsAh1, célula de status da CP). Ambos têm
360 caracteres e, na condicional `StatusFinanceiro = Recebido`, recebem o **mesmo** SVG inline 18×18 `#108f66`
("price_check", nota com cifrão e visto). São **só decoração** — nenhum dado, nenhum script, nenhum id de ancoragem.
No app novo viram um ícone do design system.

### 2.2 `pop.EditaContasReceber` (bTiin) — versão anterior

**Contrato de entrada:** idêntico — `DisplayGroupData` com um `Tbl.Entregas` + `ShowElement`. Nenhum hospedeiro faz isso hoje.

**Diferenças de layout em relação à versão nova:**
- A tabela da entrega é **leitura pura** (textos, não inputs) e tem duas colunas que a nova perdeu:
  **Valor bruto** (`Entrega.ValorVendaBruto`) e **Valor líq** (`Entrega.ValorVendaLiquido`). O cabeçalho da comissão
  chama-se "Comissão **Total**" (bTijk) e a data, "Dt prev. entrega" (mostra `cpo.DataEntrega`, a **prevista**).
- `Input numnf` (bTlid) e `upf nf fornecedor` (bTlij) têm **`auto_binding: True`** e são liberados por
  `hierarquia ≤ 1` — grava direto no banco, sem o aviso de redefinição (§7).
- Existe `dt dataentrega realizada` (bTikr, `mandatory=True`, auto-bound em `cpo_dtentrega_date`): a data real de entrega
  é digitada aqui **antes** de gerar as parcelas, e é ela que o WF bTimY manda ao backend.
- Há um popup próprio, **`pop altera valor comissao`** (bTlpL, tipo `custom.tbl_contasreceber`): "Novo valor comissão
  unitário" (`ipt nova comissao unit` bTlpR, `mandatory=True`, 5 decimais, default = `CR.QualOrcamentoFornecedor.ValorComissaoUnit`),
  "Motivo alteração" (`ipt motivo altera comissao` bTlpX, `mandatory=True`, pré-carregado com `CR.MotivoAlteraComissao`)
  e `Button C` "Gravar" (WF bTlqO). Aberto pelo lápis `Icon D` (bTlpF, WF bTlqg).
- Não há tabela de contas a pagar, não há cancelamento de entrega/pedido, não há `var_liberaedicao_` (0 estados customizados).
- `Icon D` (bTlpF) tem uma condicional **invertida**: só habilita o lápis quando
  `StatusFinanceiro = Recebido AND hierarquia > 1` — ou seja, só quem **não** é Diretor edita, e só depois de recebida (§8.1).

**Bloco HTML (1):** `HTML A` (bTlWL) — o mesmo SVG verde da §2.1.

### 2.3 `pop.HistoricosContaReceber` (bTlza)

**Contrato de entrada:** `DisplayGroupData` com **um `Tbl.ContasReceber`** + `ShowElement`. O grupo raiz `Group A` (bTlzf)
é `group_type="custom.tbl_contasreceber"`. **Não aceita `Tbl.ContasPagar`** (tipo diferente, `tbl_contasreceber1`) —
é por isso que o botão de comentários da CP é inútil (§4.10, §10.15).

**Layout:** cabeçalho "Históricos Financeiros" + X (`Icon A` bTlzh, WF bTmCH); bloco do **cliente**
(logo `CR.QualCliente.Foto`, nome `CR.QualCotacao.QualCliente.NomeCliFor`, "Unidade" e "CNPJ" de
`CR.QualOrcamentoFornecedor.QualEnderecoDestino`); bloco do **fornecedor** (logo `CR.QualFornecedor.Foto`, nome, unidade e
CNPJ de `QualEnderecoOrigem`) com o checkbox `chk grava no fornecedor` (bTmAb) "Grava historico também para o fornecedor";
grupo de edição `gp edita historico` (bTmCx, tipo `custom.tbl_historico`) com `ipt descricao historico` (bTmAd);
`Button A` (bTmAh) que é "Enviar" (ícone send) quando o grupo de edição está vazio e "Salvar" (ícone save, cor de destaque)
quando está preenchido; e a tabela `Table A` (bTmAj).

**Estados customizados:** nenhum. O "modo edição" é o dado carregado no grupo `gp edita historico` — é o que as
condicionais do `Button A` e os WF bTmBk/bTmDL testam.

**Sem popup e sem HTML.** Não oferece `Historico.AnexoFile` nem `AnexoLink`, embora os campos existam — e é o
**único** lugar do app que preenche `Historico.QualDepto` (ver `specs/paginas/historico.md` §4.12 e a dúvida 16 dela).

---

## 3. Dados

| Elemento | Lista / busca | Em linguagem de negócio |
|---|---|---|
| `rpg entregas do produto` (bTrpN, New) e (bTijR, antiga) | `Parent:convert_to_list` | A própria entrega recebida no contrato de entrada, transformada em lista de um item só para poder usar o layout de tabela. Não há busca. |
| `rpg ContasReceber` (bTrrW, New; bTilJ, antiga) | `Parent:cpo.QuaisContasReceber` | As parcelas de comissão a receber **daquela entrega**, na ordem em que a lista foi montada pelo backend (`CriarContasReceber` bTfDZ passo bTfDg). Não há ordenação por vencimento — a ordem visual é a ordem de gravação. |
| `rpg ContasReceber` (bTrzZ1, New) | `Parent:cpo.QuaisContasPagar` | As comissões a pagar ao vendedor daquela entrega (normalmente uma). Mesma observação de ordem. |
| `dd qtd parcelas receber` (bTrrQ / bTikz) | `All(Opt.ParcelasReceber)`, `limit_selection=4`, auto-bound em `Pedido.PrazoRecebComissoes` | Quais prazos de recebimento foram negociados (ex.: 10/15/21/30 dd). **Seleção múltipla que grava no pedido** assim que muda. |
| `dd prazo a vencer` (bTrsZ / bTilv) | `All(Opt.ParcelasReceber)`, `mandatory=True`, default `CR.QualPrazo`, auto-bound em `CR.QualPrazo` | O prazo daquela parcela. |
| `Table A` (bTmAj, Historicos) | `Parent:cpo.QuaisHistoricos:sorted(descending, "Created Date")` | As anotações daquela conta, da mais nova para a mais antiga. |
| `dd email cancelamento cliente` (bTsJX) | `Pedido.QualCliente.QuaisContatos`, default `Pedido.EmailCliente` | Contatos do cliente, exibidos "Nome - email". |
| `dd email cancelamento fornecedor` (bTsJp) | `Pedido.EmailFornecedor.QualGrupoCliFor.QuaisContatos`, default `Pedido.EmailFornecedor` | Contatos do grupo do fornecedor (derivados do contato já gravado no pedido). |
| bcc dos e-mails de cancelamento | `Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8)` (cliente) e `equals 9` (fornecedor), `:first_element:cpo.QuaisUsuarios:cpo.EmailContato` | Listas de usuários em cópia oculta, configuráveis. `financeiro.md` §6 documenta a config 10 (cobrança/recibo); aqui são **8 e 9** [DÚVIDA §10.19]. |

Não há nenhuma busca `Search` por CR ou CP nestes reusables: tudo vem pela lista da entrega. É a única parte do
financeiro que não faz busca no navegador.

---

## 4. Funcionalidades e regras de negócio

### 4.1 Abrir e fechar a conta (New)

O hospedeiro passa a **entrega** e mostra o reusable (na página: bTpTL+bTpTM ou bTvIy+bTvIz, ambos desativados).
Fechar tem dois caminhos idênticos: o X do cabeçalho (**WF bTsDR1**: `HideElement` bTsDW1 + `ResetGroup` bTsDX1) e o
botão "Fechar" do rodapé (**WF bTrtZ**: bTrta + bTrtb). O `ResetGroup` limpa os inputs e os estados customizados —
inclusive `var_liberaedicao_`. Na versão antiga, **WF bTinU** (bTinZ, bTina) faz o mesmo.

Nada é gravado ao abrir e nada é registrado sobre quem abriu.

### 4.2 Destravar a edição da entrega (New)

`Button D` tem dois workflows mutuamente exclusivos sobre o mesmo botão:
- **WF bTryq1** (condição `var_liberaedicao_:is_false`) → `SetCustomState` bTryw1 = **True**: os cinco inputs da linha
  da entrega ficam editáveis, com fundo branco.
- **WF bTsOz** (condição `var_liberaedicao_:is_true`) → `SetCustomState` bTsPE = **False**: volta a travar.

Isso é **só aparência**: nada impede o usuário de gravar com o cadeado fechado (o WF bTrtm não checa o estado), e o
disquete da linha (`btn gravar entrega`) não tem condicional de visibilidade.

### 4.3 Alterar os dados da entrega — e refazer todo o financeiro dela (New)

Fluxo em duas etapas, porque mexer na entrega redefine CR e CP.

**Etapa 1 — confirmar (WF bTrwl, disquete `btn gravar entrega` bTrwf):**
1. `ShowElement` bTryF1 → abre `pop alerta alteracao`.
2. `DisplayGroupData` bTryH1 → passa a entrega ao popup.
3. `SetCustomState` bTryS1 → copia, de uma vez, os cinco inputs para os estados do popup:
   `var_qtdentrega_` ← `ipt qtd entrega`; `var_arquivonf_` ← `upf arquivo nf`; `dt_entrega_` ← `ipt dtentrega`;
   `var_numnf_` ← `ipt numnf`; `var_valorcomissao_` ← `ipt comissaounit`.

O popup exige o **motivo** (`ipt motivo altera comissao` bTrtC, `mandatory=True`). Como o gatilho é um botão, o Bubble
bloqueia o clique enquanto o campo obrigatório estiver vazio — **validação de navegador apenas**, sem equivalente no servidor.

**Etapa 2 — gravar (WF bTrtm, `btn gravar entregas` "SIM"), 12 ações na ordem do mapa:**

| # | Ação | O que faz |
|---|---|---|
| 1 | `ChangeThing` **bTsCm1** | `Entrega.QualOrcamentoFornecedor.ValorComissaoUnit = var_valorcomissao_` — a comissão unitária digitada para **esta** entrega é gravada no **orçamento do fornecedor**, que vale para todas as entregas daquela linha (§10.6) |
| 2 | `ScheduleAPIEvent` **bTsCr1** | agenda `CalculaFornecedoresLista` (bTPFh) para o orçamento alterado → recalcula ValorVendaBruto, ValorComissaoBruto, PIS/COFINS, ICMS, ValorVendaLiquido, ValorUnitLiquido (§5.1) |
| 3 | `ChangeThing` **bTryM1** | na entrega: `dtentrega` = `dt_entrega_`; `QtdEntrega` = `var_qtdentrega_`; `ArquivoNfFornecedor` = `var_arquivonf_`; `NumNfFornecedor` = `var_numnf_`; `MotivoAlteracaoValores` = texto do motivo |
| 4 | `ChangeThing` **bTsDJ1** | `Entrega.QualPedido.MotivoAlteraValores` = `Entrega.MotivoAlteracaoValores` (o motivo sobe para o pedido, sobrescrevendo o motivo anterior do pedido) |
| 5 | `HideElement` **bTrtt** | fecha o aviso |
| 6 | `ScheduleAPIEvent` **bTsCh1** | agenda `CalcularValoresEntregas` (bTbPH) para a entrega → recalcula comissão unitária/bruta e valores de venda da entrega (§5.2) |
| 7 | `DeleteListOfThings` **bTryX1** | **apaga todas as CRs** da entrega (`tbl_contasreceber`) |
| 8 | `DeleteListOfThings` **bTrye1** | **apaga todas as CPs** da entrega (`tbl_contasreceber1`) |
| 9 | `ScheduleAPIEvent` **bTryZ1** | agenda `CriarContasReceber` (bTfDZ) com `Qtd` = `Pedido.PrazoRecebComissoes:count`, `Fila` = 1, `Prazos` = `Pedido.PrazoRecebComissoes`, `DtEntrega` = `ResultOfStep[bTryM1]:cpo.dtentrega` (data **real**), `QualEntrega` = a entrega |
| 10 | `ScheduleAPIEvent` **bTryj1** | agenda `CriarContasPagar` (bToYh) com `DtEntrega` = `Parent:cpo.DataEntrega` (data **prevista** — divergente do passo 9, §10.4) |
| 11 | `ResetGroup` **bTryl1** | limpa o aviso |
| 12 | `SetCustomState` **bTrzB1** | `var_liberaedicao_` = False (volta a travar) |

Consequências de negócio, todas no mapa:
- **Apaga e recria.** As parcelas perdem id, histórico (`QuaisHistoricos`), cobrança vinculada (`QualCobranca`,
  `QuaisCobrancas`), anexo/nº de NF MegaBox e — o mais grave — **o status `Recebido` e os dados da baixa**
  (`DataBaixaSistema`, `QuemBaixou`, `DataRecebimentoBancocaixa`). Uma comissão já recebida volta a existir como parcela
  em aberto, e a CR apagada desaparece dos relatórios e dos recibos já emitidos (§7, §10.9).
- **Corrida entre passos assíncronos.** Os passos 2, 6, 9 e 10 são `ScheduleAPIEvent` com `date = agora`: o Bubble não
  garante ordem entre eles nem com os passos 7/8 do navegador. `CriarContasReceber` (9) divide
  `Entrega.ValorComissaoBruto`, valor que só é recalculado por `CalcularValoresEntregas` (6). Se 9 rodar antes de 6
  terminar, **as novas parcelas nascem com a comissão antiga** (§8.3).
- O motivo é gravado em `Entrega.MotivoAlteracaoValores` e o backend o copia para `CR.MotivoAlteraComissao` (bTfDb) e
  `CP.MotivoAlteraComissao` (bToYn) — é assim que o ícone de informação da coluna de valores se acende.
  **Não há registro de quem alterou nem de qual era o valor antes.**

### 4.4 Editar valor da comissão e vencimento de uma parcela

| Caminho | Onde | Como grava | Pede motivo? | Registra autoria? |
|---|---|---|---|---|
| `ipt valor a receber` (bTrsG, CR) | New, coluna Valores | **auto-binding** em `cpo_valorcomissao_number` — grava no banco ao sair do campo, **sem workflow** | **Não** | Não |
| `ipt valor a receber` (bTsAJ1, CP) | New, coluna Valores | auto-binding em `cpo_valorcomissao_number`, **campo fora dos `binding_fields` de `ContasPagar`** → o servidor **recusa** a gravação silenciosamente (§7.4) | Não | Não |
| `dt vencimento` (bTrsA CR / bTsCZ1 CP) | New | auto-binding em `cpo_datavencimento_date` | Não | Não |
| `dd prazo a vencer` (bTrsZ) | New | auto-binding em `cpo_qualprazo_...` **e** o **WF bTrtU** | Não | Não |
| `pop altera valor comissao` (bTlpR + bTlpX → **WF bTlqO**) | **só na versão antiga** | workflow explícito, recalculando a cadeia inteira (§5.5) | **Sim, obrigatório** | Não (só o texto do motivo) |

**WF bTrtU** (`InputChanged` em `dd prazo a vencer`) → `ChangeThing` bTrtV:
`CR.DataVencimento = agora + dd prazo a vencer.diasprazonumero` **dias**.
A base é **a data de hoje**, não a data de entrega — diferente da criação (§5.3). Trocar o prazo de uma parcela antiga
empurra o vencimento para frente sem aviso. O WF **bTimp** (bTimr) da versão antiga é idêntico.
Opções de `Opt.ParcelasReceber` sem `diasprazonumero` (ex.: `49dd`) deixam o vencimento **igual a hoje** (§10.13).

O aviso de "dados que interferem nas contas" (§4.3) **não aparece** em nenhum destes caminhos: a comissão da parcela,
que é o dinheiro da empresa, é editável por auto-binding sem motivo, sem confirmação e sem autoria — o oposto do que
o próprio popup declara ser necessário.

### 4.5 Renegociar / parcelar

**Contas a receber — `Button B` "Recebimentos" (WF bTrtN):** uma única ação, `ScheduleAPIEvent` bTrtO, que agenda
`CriarContasReceber` (bTfDZ) com `Qtd` = `dd qtd parcelas receber:count`, `Fila` = 1,
`Prazos` = os prazos selecionados, `DtEntrega` = `Entrega.dtentrega` (real), `QualEntrega` = a entrega.
O backend cria **uma CR por prazo** (recursão pelo passo bTfIl) e vai acrescentando à lista `Entrega.QuaisContasReceber`.

- O dropdown é **auto-bound em `Pedido.PrazoRecebComissoes`**: escolher prazos aqui **já reescreve a condição negociada
  do pedido** (que o cabeçalho exibe e que o WF bTrtm passo 9 relê), antes de qualquer clique no botão, para todas as
  entregas daquele pedido (§10.20).
- **Não apaga o que já existe.** Clicar duas vezes cria parcelas duplicadas; a única pista é o cabeçalho
  "Comissão Unit" ficar vermelho (§5.6).
- Limite de 4 prazos (`limit_selection=4`).

Na versão antiga, **WF bTimY** (bTimd) faz o mesmo, com `DtEntrega` vindo do input `dt dataentrega realizada`.

**Contas a pagar — `Button H` "Pagamentos" (WF bTsBL1):** `ScheduleAPIEvent` bTsBR1 agenda `CriarContasPagar` (bToYh)
com `DtEntrega` = `Entrega.DataEntrega` (**prevista**). Cria **uma** CP por clique, sem limite, sem condicional de
habilitação e sem verificar se já existe — é o caminho mais fácil de duplicar comissão de vendedor no app atual.

### 4.6 Apagar uma parcela

- **WF bTrtP** (`btn deletar recebimento` bTrsS) → `DeleteThing` bTrtT na CR da linha.
- **WF bTsBT1** (`btn deletar pagamento` bTsAR1) → `DeleteThing` bTsBZ1 na CP da linha.
- **WF bTimf** (`Icon B` bTilt, versão antiga) → `DeleteThing` bTimk.

Exclusão **física**, sem confirmação, sem motivo e sem rastro. A única proteção é a condicional
(`StatusFinanceiro ≠ Recebido` e Diretor) — contornável. Nada reequilibra as parcelas restantes: apagar 1 de 4 parcelas
deixa a soma 25% menor que a comissão da entrega (o cabeçalho fica vermelho, §5.6).

### 4.7 Estornar (desfazer a baixa)

A **baixa** não acontece aqui — é a página `financeiro` que marca `Recebido` e grava NF/recibo MegaBox
(`financeiro.md` §4.4 e §4.5). Estes reusables só **desfazem**:

- **WF bTrtf** (`btn mudar status recebimento` bTrsT, título "Estornar recebimento") → `ChangeThing` bTrtg na CR:
  `StatusFinanceiro = Opt.StatusFinanceiro.A receber`; `DataEstorno = agora`; `QuemEstornou = CurrentUser`.
  **Não limpa** `DataBaixaSistema`, `QuemBaixou`, `DataRecebimentoBancocaixa`, `DataNfMegabox`, `NumNfMegabox` nem
  `AnexoNfMegabox`: a conta volta a "A receber" carregando os dados da baixa anterior e pode ser baixada de novo,
  sobrescrevendo-os. Não existe tabela de baixas/estornos — o histórico de uma conta baixada duas vezes é irrecuperável.
- **WF bTlWR** (versão antiga, bTlWX): idêntico.
- **WF bTsBe1** (`btn mudar status pagamentos` bTsAV1) → `ChangeThing` bTsBk1 na CP:
  `StatusFinanceiro = Opt.StatusFinanceiro.A pagar` — **e nada mais**. Não grava `DataEstorno` nem `QuemEstornou`,
  embora `ContasPagar` tenha os dois campos (§10.11).

Não há confirmação e não há registro em `Historico`.

### 4.8 NF do fornecedor (e por que não é a NF MegaBox)

Nesta tela a NF que se anexa é a **NF do fornecedor**, guardada na **entrega**:
`Entrega.NumNfFornecedor` (`ipt numnf` bTrqZ) e `Entrega.ArquivoNfFornecedor` (`upf arquivo nf` bTrqh) — ambos gravados
pelo WF bTrtm passo 3, com o aviso de redefinição. O texto da célula (bTrqg) mostra "Arquivo.{extensão}" quando há
arquivo e "Sem NF" quando não há. O clipe abre o arquivo:

- **WF bTrth** → `OpenURL` bTrtl, `open_in_new_tab`, `url = Entrega.ArquivoNfFornecedor` (URL pública do CDN, §7.7).
- **WF bTliv** (versão antiga, bTljB): idêntico.

O **comprovante de entrega** (`upf comprovanteentrega realizada` bTrrK, máx. 5 MB) é auto-bound em
`Entrega.ComprovanteEntrega` — grava direto, sem workflow e sem o aviso.

A **NF MegaBox** (`CR.NumNfMegabox`, `CR.DataNfMegabox`, `CR.AnexoNfMegabox`, `CR.DataRecebimentoBancocaixa`) **não é
tocada por nenhum destes 36 workflows**: quem a grava é a baixa da página `financeiro` (§4.4/§4.5 de `financeiro.md`).
No app novo os dois conceitos devem ter nomes distintos na tela (§9.2). O reusable `pop.AnexaNf` também não é usado aqui.

### 4.9 Cancelar a entrega ou o pedido (só na versão New)

**Abrir (WF bTsLO):** `ShowElement` bTsLU + `SetCustomState` bTsLZ → `var_qualpedido_` = `Entrega.QualPedido`,
`var_qualentrega_` = a entrega.
**Fechar:** `Icon I` → **WF bTsKG** (`HideElement` bTsKL); `Button I` "NÃO" → **WF bTsOm** (bTsOs + `ResetGroup` bTsOx).
**Agenda de contatos:** **WF bTsKw** → `DisplayGroupData` bTsLB do **cliente** no `pop.AgendaContatos`
— **sem `ShowElement`**, ou seja, o popup não abre (§10.17); **WF bTsLD** → `DisplayGroupData` bTsLI do grupo do
fornecedor (bTsJn… `Pedido.EmailFornecedor.QualGrupoCliFor`) + `ShowElement` bTsLJ, que abre.
(Esses dois já constam de `specs/paginas/enderecos-e-contatos.md`, tabela de hospedeiros.)

**Cancelar só a entrega — WF bTsKN** (condição `tgg cancela pedido:is_false`, `event_color="red"`), 7 ações:
1. `ChangeThing` bTsKS na entrega: `StatusEntrega = Opt.Etapas.Cancelado`; `MotivoCancelamento` = texto digitado;
   **`QtdEntrega = 0`**.
2. `ScheduleAPIEvent` bTsKT (só se avisar cliente) → `EnviarEmailsGeral` bTnvb0; assunto
   "Cancelamento Entrega: {pedido} - Produtos: … - Cliente: …"; bcc = usuários da `ConfigSistema` código **8** + a cópia
   pessoal do usuário; reply-to = e-mail do usuário; remetente "[Megabox] PRIMEIRONOME".
3. `ScheduleAPIEvent` bTsKX (só se avisar fornecedor), 15 s depois; bcc = usuários da config **9**.
4. `ResetInputs` bTsKY · 5. `HideElement` bTsKZ.
6. `DeleteListOfThings` **bTsOV** → apaga **todas as CRs** da entrega.
7. `DeleteListOfThings` **bTsOa** → apaga **todas as CPs** da entrega.

**Cancelar o pedido inteiro — WF bTsKe** (condição `tgg cancela pedido:is_true`), 8 ações:
1. `ChangeThing` bTsKj no pedido: `QualEtapa = Opt.Etapas.Cancelado`; `MotivoCancelamento` = motivo.
2–3. mesmos dois e-mails, com assunto "Cancelamento Pedido: …".
4. `ChangeListOfThings` bTsKp em **todas** as entregas do pedido: `MotivoCancelamento` e
   `StatusEntrega = Cancelado`.
5. `ResetInputs` bTsKq · 6. `HideElement` bTsKr.
7–8. `DeleteListOfThings` **bTsOf** e **bTsOh** → apagam as CRs e as CPs de **todas** as entregas do pedido.

Regras críticas: as exclusões **não testam `StatusFinanceiro`** — comissões já recebidas (e já declaradas em recibo) são
apagadas junto; e o cancelamento do pedido **não zera** `QtdEntrega` das entregas (o cancelamento individual zera),
deixando os dois caminhos com resultado diferente. Os e-mails passam
`mailpessoal = CurrentUser:cpo.UsaEmailPessoal - deleted`, um campo **excluído** → sempre vazio (§8.3).

### 4.10 Histórico da conta (`pop.HistoricosContaReceber`)

**Abrir:** **WF bTruD** (`btn comentarios recebimento` bTrsX) → `ShowElement` bTruE + `DisplayGroupData` bTruF com a **CR**
da linha — liberado para qualquer usuário. **WF bTltB** (versão antiga, bTltH + bTltI) é igual.
**WF bTsBq1** (`btn comentarios pagamento`) faz **só** `ShowElement` bTsBv1, **sem `DisplayGroupData`**: abriria o popup
com o dado da última conta exibida (ou vazio) — e o botão está oculto de qualquer modo (§8.1).
**Fechar:** **WF bTmCH** → `HideElement` bTmCN.

**Incluir (WF bTmBk, `Button A` "Enviar", condição `gp edita historico` vazio), 6 ações:**
1. `NewThing` **bTmBp** `Tbl.Historico`: `Descricao` = texto digitado; `QualDepto` = `CurrentUser.QualDepto`;
   `QualVendedor` = `CurrentUser`; `QualClifor` = `CR.QualCliente`; `QualUnidade` = `CR.QualOrcamentoFornecedor.QualEnderecoDestino`.
2. `ChangeThing` **bTmBx** no cliente (`CR.QualCliente`): `UltimoHistoricoData` = data de criação do histórico;
   `UltimoHistoricoMsg` = o histórico.
3. `NewThing` **bTmCr** (só se `chk grava no fornecedor`): segundo `Tbl.Historico`, igual, mas
   `QualClifor` = `CR.QualFornecedor` e `QualUnidade` = `QualEnderecoOrigem`.
4. `ChangeThing` **bTmBv** (só se o checkbox) no fornecedor: `UltimoHistoricoData`/`UltimoHistoricoMsg` =
   **`ResultOfStep[bTmBp]`**, isto é, o histórico do **cliente** e não o do fornecedor criado no passo 3 (§10.12).
5. `ChangeThing` **bTmBq**: `CR.QuaisHistoricos = ResultOfStep[bTmBp]` — só o histórico do cliente é amarrado à conta;
   o do fornecedor fica órfão. O mapa mostra `=` (substitui) e não "add" [DÚVIDA §10.18].
6. `ResetInputs` bTmCB.

**Editar:** **WF bTmDE** (`Icon B` lápis bTmBF) → `DisplayGroupData` bTmDK carrega a anotação em `gp edita historico`
(o botão passa a "Salvar"). **WF bTmDL** (`Button A`, condição grupo **não** vazio) → `ChangeThing` bTmDd grava só
`Descricao` e `ResetGroup` bTmDi sai do modo edição. Não grava data de edição nem quem editou.

**Apagar:** o ícone de lixeira `Icon B` (bTmBe) existe, é habilitado por condicional para o autor ou para o Diretor —
e **não tem workflow nenhum**: clicar não faz nada (§8.1, §10.10). `financeiro.md` §4.9 descreve "editar/apagar";
pelo mapa, apagar não está implementado.

### 4.11 Arquivar

Não acontece nestes reusables. `ContasReceber.Arquivado` é gravado pelos WF **bUFDT** e **bUFFD** da página `financeiro`
(`financeiro.md` §4.8). Registre-se aqui um achado de modelo: **`Tbl.ContasPagar` não tem o campo `Arquivado`** — a CP não
pode ser arquivada nem hoje nem depois, embora os dois tipos sejam listados lado a lado.

---

## 5. Cálculos e valores

Toda a aritmética abaixo roda em **float** (o Bubble não tem decimal) e o resultado é gravado no banco. No app novo tudo
isto é `numeric` (§9.4). "Entrega.ComissaoBruto" abaixo é `Tbl.Entregas.ValorComissaoBruto` (`cpo_valorcomissao_number`).

### 5.1 Cadeia do orçamento do fornecedor — `CalculaFornecedoresLista` (bTPFh), disparada pelo passo bTsCr1 de bTrtm

```
orc.ValorVendaBruto      = orc.QtdVenda × orc.ValorVendaUnit + orc.ValorFrete            (bTPGA)
orc.ValorComissaoBruto   = orc.QtdVenda × orc.ValorComissaoUnit                          (bTPFo)
orc.ValorPISCOFINS       = orc.QtdVenda × orc.ValorVendaUnit × orc.TotalComissaoVendedor (bTPFt)
orc.ValorICMS            = orc.QtdVenda × orc.ValorVendaUnit × orc.TotalBonusExtra       (bTPFv)
orc.ValorVendaLiquido    = orc.ValorVendaBruto − orc.ValorICMS − orc.ValorPISCOFINS      (bTPGF)
orc.ValorUnitLiquido     = orc.ValorVendaLiquido ÷ orc.QtdVenda                          (bTeYL)
```

`cpo.TotalBonusExtra` é um campo **excluído** e `cpo.TotalComissaoVendedor` não aparece na lista de campos de
`Tbl.OrcFornecedoresCotacao` do mapa: **ICMS e PIS/COFINS do orçamento resultam sempre 0/vazio**, e portanto
`ValorVendaLiquido = ValorVendaBruto`. É a base do "Valor líq" que a versão antiga exibia (§2.2) e dos valores líquidos
copiados para a entrega (§5.2). **Exige teste e definição da fórmula real de ICMS** (§10.21).

### 5.2 Cadeia da entrega — `CalcularValoresEntregas` (bTbPH), disparada pelo passo bTsCh1 de bTrtm

```
entrega.ValorComissaoUnitario     = orc.ValorComissaoUnit                                     (bToSg)
entrega.ComissaoBruto             = entrega.ValorComissaoUnitario × entrega.QtdEntrega         (bTmIt0)
entrega.ValorVendaBruto           = orc.ValorVendaBruto ÷ orc.QtdVenda × entrega.QtdEntrega    (bToSl)
entrega.ValorVendaBrutoUnitario   = orc.ValorVendaBruto ÷ orc.QtdVenda                         (bToSn)
entrega.ValorVendaLiquido         = orc.ValorVendaLiquido ÷ orc.QtdVenda × entrega.QtdEntrega   (bToSs)
entrega.ValorVendaLiquidoUnitario = orc.ValorUnitLiquido                                       (bToSx)
```

### 5.3 Contas a receber — `CriarContasReceber` (bTfDZ), passo bTfDb, uma chamada por parcela

```
CR.ValorComissao   = entrega.ComissaoBruto ÷ Param.Qtd        ← Param.Qtd é o NÚMERO DE PARCELAS
CR.ValorTotal      = entrega.ValorVendaBruto                  ← valor da venda INTEIRO, não rateado
CR.ValorUnit       = entrega.ValorVendaBruto ÷ entrega.QtdEntrega
CR.Qtd             = entrega.QtdEntrega                       ← quantidade entregue (nome colide com Param.Qtd)
CR.DataVencimento  = Param.DtEntrega + Prazos[Fila].diasprazonumero dias
CR.QualPrazo       = Prazos[Fila]
CR.QualVendedor    = entrega.QualCotacao's Created By          ← quem criou a cotação, não entrega.QualVendedor
CR.MotivoAlteraComissao = entrega.MotivoAlteracaoValores
```

Recursão: o passo **bTfIl** reagenda o próprio bTfDZ com `Fila + 1` enquanto `Fila < Qtd`, criando uma CR por prazo.
Os parâmetros `dtvcto` e `PrazoDias` que bTfIl passa **não existem** na assinatura de bTfDZ → são ignorados; o vencimento
de cada parcela é sempre `DtEntrega + dias do prazo daquela parcela` (não é cumulativo).

Dois achados de dinheiro:
- **`CR.ValorTotal` não é rateado**: com 4 parcelas, a soma de `ValorTotal` das CRs é **4× o valor da venda**. A página
  `financeiro` soma exatamente esse campo em "Valor venda" do popup de baixa e em "total em vendas" do recibo
  (`financeiro.md` §3.5 e §5) → o documento entregue ao fornecedor **infla a venda pelo número de parcelas**.
- **`CR.StatusFinanceiro` não é atribuído** por bTfDb: as parcelas nascem com **status vazio** (só o importador bTmHH
  grava `A receber`). Como todas as condicionais da tela testam `≠ Recebido`, o vazio se comporta como "em aberto", mas
  os filtros por status da página `financeiro` não o pegam (§10.7). `CR.Arquivado` e `CR.ValorComissaoUnitario`
  também nascem vazios — o segundo nunca é gravado por ninguém.

### 5.4 Contas a pagar — `CriarContasPagar` (bToYh), passo bToYn

```
CP.ValorComissao   = entrega.ComissaoBruto × 0,03             ← os 3% do vendedor, literal no workflow
CP.ValorTotal      = entrega.ComissaoBruto ÷ orc.QtdVenda     ← ATRIBUÍDO E DEPOIS SOBRESCRITO
CP.ValorTotal      = entrega.ValorVendaBruto                  ← valor final
CP.ValorUnit       = entrega.ValorVendaBruto ÷ entrega.QtdEntrega
CP.Qtd             = entrega.QtdEntrega
CP.DataVencimento  = Param.DtEntrega + 1 mês, dia 5           (plus_months(1):change_date(5))
CP.QualPrazo       = ∅
CP.StatusFinanceiro = Opt.StatusFinanceiro.A pagar
CP.QualVendedor    = entrega.QualCotacao's Created By
```

`Param.DtEntrega` vem da **data prevista** quando o disparo é bTsBL1 ou bTryj1 (§4.5, §4.3). O mesmo 3% aparece
também em `CriarComissoesPassadas` (bTpol) e `CorrigirValorComissaoPagar` (bTpor) — três cópias do mesmo número (§8.2).
`CP.ValorComissaoUnitario` não é gravado por bToYh (só por bTpol).

### 5.5 Regra que existe **apenas** na versão antiga — `WF bTlqO`

```
orc.ValorComissaoUnit   = ipt nova comissao unit                                   (bTlqa)
orc.ValorComissaoBruto  = ipt nova comissao unit × orc.QtdVenda                    (bTlqa)
entrega.ComissaoBruto   = orc.ValorComissaoUnit(novo) × entrega.QtdEntrega         (bTlqZ)
para cada CR da entrega:
  CR.MotivoAlteraComissao = ipt motivo altera comissao
  CR.ValorComissao        = entrega.ComissaoBruto ÷ count(entrega.QuaisContasReceber)  (bTlqU)
```

É o **único** lugar do app que redistribui a comissão pelas parcelas **sem apagá-las**: preserva id, status, histórico e
cobrança das CRs. A versão nova trocou isso por "apaga tudo e recria" (§4.3). O passo bTlqU relê
`Parent:cpo.QualEntrega:cpo.valorcomissao` gravado no passo anterior — encadeamento frágil, mas dentro do mesmo workflow.
No app novo, **esta é a regra a reproduzir** (§9.3), não a da versão nova.

### 5.6 Conferência exibida na tela

```
divergência  ⟺  entrega.ComissaoBruto ≠ Σ CR.ValorComissao
```
Quando verdadeira, o cabeçalho "Comissão Unit" (bTrpj; na antiga bTijk e a própria célula bTikJ) fica **negrito e
vermelho**. É o único controle de integridade financeira da tela — e é só cor.
O cabeçalho da coluna de valores mostra `"Valores (total: Σ CR.ValorComissao)"` (bTrrj).
**Na tabela de contas a pagar o mesmo texto (bTrzm1) referencia `El[rpg ContasReceber]`** — nome repetido nas duas
tabelas, logo o total exibido acima das CPs é provavelmente o total das CRs (§10.14).

### 5.7 Arredondamento, exatidão e o que precisa de teste

- As duas divisões que definem quanto se recebe — `÷ Param.Qtd` (§5.3) e `÷ count(CRs)` (§5.5) — produzem dízimas
  (ex.: R$ 1.000,00 ÷ 3). Em float, **Σ parcelas ≠ comissão da entrega** e a tela acusa divergência (§5.6) numa
  situação legítima. No app novo: `numeric(14,2)` por parcela, com a **sobra na última** (`fn_valor_parcela`, §9.4).
- `ipt comissaounit` (bTruv) exibe **6 casas** (`decimal_place=6`, `always_show_decimals`) e `ipt nova comissao unit`
  (bTlpR) **5 casas**, enquanto `ipt valor a receber` exibe 2. Comissão unitária precisa de mais casas que o valor
  da parcela: no novo, `comissao_unitaria numeric(14,6)` e `valor numeric(14,2)`.
- **Cálculos com teste obrigatório** (regra 10 do `CLAUDE.md`):
  1. rateio da comissão em N parcelas, incluindo dízima e sobra (§5.3);
  2. redistribuição sem recriar parcelas (§5.5);
  3. os 3% da comissão do vendedor, inclusive quando a comissão da entrega muda (§5.4);
  4. `DataVencimento` na criação (`data de entrega + dias`) **e** na troca de prazo (§4.4) — hoje divergem;
  5. `DataVencimento` da CP (`data de entrega + 1 mês, dia 5`), com meses de 28/30/31 dias;
  6. cadeia orçamento → entrega quando `QtdEntrega` ou `QtdVenda` mudam (§5.1, §5.2);
  7. ICMS/PIS-COFINS do orçamento depois de definida a fórmula real (§10.21);
  8. invariante `Σ parcelas abertas + Σ parcelas baixadas = comissão da entrega` (§9.4).
- **Campos redundantes hoje (valor derivável)** — candidatos a coluna gerada, view ou remoção:
  | Campo | Derivável de |
  |---|---|
  | `CR/CP.ValorUnit` | `ValorTotal ÷ Qtd` |
  | `CR/CP.ValorTotal` | `entrega.ValorVendaBruto` (cópia, e errada quando há parcelas — §5.3) |
  | `CR/CP.Qtd` | `entrega.QtdEntrega` |
  | `CR/CP.DataEntrega`, `DataPrevEntrega`, `DataPedido`, `NumeroPedido`, `NumNfFornecedor`, `QualCliente`, `QualFornecedor`, `QualCotacao`, `QualProposta`, `QualPedido`, `QualOrigem`, `QualDestino`, `QualVendedor`, `MotivoAlteraComissao` | tudo alcançável por `QualEntrega` (são 14 cópias por registro, mantidas por 4 workflows diferentes) |
  | `entrega.ComissaoBruto` | `ValorComissaoUnitario × QtdEntrega` |
  | `entrega.ValorVendaBrutoUnitario`, `ValorVendaLiquidoUnitario` | orçamento |
  | `orc.ValorComissaoBruto` | `QtdVenda × ValorComissaoUnit` |
  | `CR.ValorComissaoUnitario`, `CR.CobrancaNum`, `CR.GerouReciboRecebimento`, `CP.QuaisEntregas`, `CP.QualMetaFechada`, `CP.opt.MotivoAlterarComissao` (excluído) | nunca gravados por estes fluxos |

---

## 6. Integrações e backend workflows

| O quê | Disparado em | Detalhe |
|---|---|---|
| `CriarContasReceber` (**bTfDZ**) | WF bTrtN (bTrtO), WF bTrtm (bTryZ1), WF bTimY (bTimd) | Cria uma CR por prazo, recursivamente (bTfIl). Fórmulas em §5.3. Parâmetros `dtvcto`/`PrazoDias` de bTfIl não existem na assinatura → ignorados |
| `CriarContasPagar` (**bToYh**) | WF bTsBL1 (bTsBR1), WF bTrtm (bTryj1) | Cria **uma** CP, 3% da comissão da entrega, vencimento no dia 5 do mês seguinte. Fórmulas em §5.4 |
| `CalcularValoresEntregas` (**bTbPH**) | WF bTrtm (bTsCh1) | Recalcula os valores da entrega a partir do orçamento (§5.2) |
| `CalculaFornecedoresLista` (**bTPFh**) | WF bTrtm (bTsCr1) | Recalcula os valores do orçamento (§5.1) |
| `EnviarEmailsGeral` (**bTnvb0**) | WF bTsKN (bTsKT cliente, bTsKX fornecedor +15 s), WF bTsKe (bTsKk, bTsKl) | SendGrid ou SMTP Gmail conforme `ConfigSistema[19].ValorBoolean1` — detalhe e o achado do segredo em `financeiro.md` §6 e §7.4. bcc pelas configs **8** (cliente) e **9** (fornecedor). `mailpessoal` vem de campo excluído |
| `CopiarEndereçosOrcamentoParaContasReceber` (**bToWv0**) | **não é chamado por estes reusables** | Script avulso: `ChangeListOfThings` em `Search(Tbl.ContasReceber)` **sem filtro** (bToXA0), regravando `QualOrigem`/`QualDestino` de **toda** a base a partir do orçamento. Foi a correção de uma migração; no app novo esses campos não existem (são derivados, §5.7) e o script não se reproduz |
| `pop.AgendaContatos` (reusable bTsLb) | WF bTsKw, bTsLD | Escolher o contato do cliente/fornecedor para o e-mail de cancelamento — ver `specs/paginas/enderecos-e-contatos.md` |
| `pop.HistoricosContaReceber` (reusable bTrtI / bTmCO) | WF bTruD, bTsBq1, bTltB | §4.10 |
| Plugin `1680110374647x249108010620944400` (toggle) | `tgg cancela pedido` bTsLs, `tgg informa cancelamento cliente` bTsJF, `... fornecedor` bTsJL | `get_AAI` = valor do toggle; condiciona qual WF do `Button J` roda |
| API Connector | — | **nenhuma** chamada nestes reusables |

---

## 7. Segurança e privacidade

Este é o achado central da spec: **as contas a receber e a pagar são graváveis por qualquer usuário logado, sem
workflow, sem validação e sem autoria.**

1. **Leitura aberta a todos, inclusive deslogados.** `Tbl.ContasReceber` e `Tbl.ContasPagar` têm regra de privacidade
   `everyone` (condição: todos) com `view_all: true`, `search_for: true` e `view_attachments: true`, e os dois tipos estão
   **expostos na Data API**. Qualquer pessoa lê todas as comissões da empresa, valores de venda, CNPJs, números de NF e os
   anexos. Mesmo problema já registrado em `financeiro.md` §7.1 — aqui vale para a escrita.
2. **Escrita liberada por auto-binding.** A segunda regra de privacidade (`autobinding`, condição
   `CurrentUser:logged_in`) traz `auto_binding: true` com `binding_fields`:
   - `Tbl.ContasReceber`: **`cpo_qualprazo_option_opt_parcelasreceber`, `cpo_datavencimento_date`, `cpo_valorcomissao_number`**;
   - `Tbl.ContasPagar`: **`cpo_datavencimento_date`** apenas.

   Isto significa que **qualquer usuário logado altera o prazo, o vencimento e o valor da comissão a receber direto no
   banco**, sem passar por workflow: os elementos `dd prazo a vencer` (bTrsZ), `dt vencimento` (bTrsA / bTsCZ1) e
   `ipt valor a receber` (bTrsG) têm `auto_binding: True` e gravam ao perder o foco. Não há motivo obrigatório, não há
   confirmação, não há `DataEstorno`/`QuemEstornou`/`QuemBaixou` equivalente para alteração, e **nada registra quem mudou
   o quê**. O mesmo vale por auto-binding em `Tbl.Entregas` (`cpo_comprovanteentrega_file`, `cpo_qtdentrega_number`,
   `cpo_dtentrega_date`, `cpo_nftexto_text`, `cpo_nfarquivo_file` — lista truncada no mapa), em `Tbl.Pedido`
   (`cpo_prazorecebcomissoes_...`, §10.22) e em `Tbl.OrcFornecedoresCotacao` (`cpo_valorcomissao_number`, isto é, a
   **comissão unitária**).
3. **As travas visíveis são todas condicionais de navegador.** `var_liberaedicao_` é estado de cliente;
   `hierarquia = 1` é comparação feita no navegador; `disabled=True` é propriedade de elemento. A privacy rule do banco
   **não** restringe por perfil — só por "estar logado". Quem sabe usar o devtools ou a Data API ignora as três.
4. **Uma gravação falha em silêncio.** `ipt valor a receber` da tabela de CP (bTsAJ1) tem auto-binding em
   `cpo_valorcomissao_number`, campo **fora** dos `binding_fields` de `ContasPagar`: o servidor recusa, o campo volta ao
   valor antigo e o usuário acredita ter alterado a comissão do vendedor. Pior que a gravação indevida da CR, porque é
   silencioso nos dois sentidos.
5. **Exclusão física de dinheiro, sem rastro.** `DeleteThing` em CR (bTrtT) e CP (bTsBZ1); `DeleteListOfThings` em
   bTrtm (bTryX1, bTrye1) e nos cancelamentos (bTsOV, bTsOa, bTsOf, bTsOh). Os cancelamentos **não checam o status**:
   apagam parcelas já `Recebido`, inclusive as que constam de recibos e cobranças já emitidos ao fornecedor.
   Não existe log, lixeira, exclusão lógica nem tabela de baixas — o valor simplesmente desaparece dos relatórios.
6. **Estorno reversível sem histórico.** §4.7: a conta volta a "A receber" mantendo NF/recibo MegaBox e dados da baixa,
   que a próxima baixa sobrescreve. A CP nem grava data/autor do estorno.
7. **Arquivos públicos e permanentes.** `upf arquivo nf` (NF do fornecedor), `upf comprovanteentrega realizada`
   (comprovante de entrega) e os `PictureInput` (`private=False`) ficam com URL pública no CDN do Bubble, e os WF bTrth /
   bTliv abrem essa URL crua em nova aba. Quem tiver o link acessa sem login, para sempre.
8. **E-mail em nome da empresa disparado do navegador.** bTsKN/bTsKe montam corpo, assunto, remetente "[Megabox] NOME",
   reply-to e **bcc** (configs 8 e 9) no cliente e agendam o envio — qualquer logado envia comunicado de cancelamento a
   cliente e fornecedor. O segredo SMTP fica em option set (detalhe em `financeiro.md` §7.4).
9. **Dados pessoais em tela:** nome/e-mail de contatos do cliente e do fornecedor, CNPJ das filiais, nome do consultor.
10. **Única autoria existente em todo o conjunto:** `Historico.QualVendedor = CurrentUser` e `Created By`/`Created Date`
    do `Tbl.Historico` (§4.10). Ou seja: registra-se quem escreveu uma anotação, mas não quem mudou a comissão.
11. **Sem transação.** Os 12 passos de bTrtm apagam CR/CP no navegador e recriam por eventos agendados. Se a aba fechar
    entre os passos 7/8 e 9/10, **a entrega fica sem nenhuma conta a receber nem a pagar** e ninguém é avisado.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto

- **`pop.EditaContasReceber` (bTiin) inteiro: deve morrer.** Está instanciado em `pagina-financeiro` como
  `pop.ConfirmaEntrega A` (bTpQj) e **nenhum workflow o exibe** (`financeiro.md` §2.2). Os 9 workflows (bTimY, bTimf,
  bTimp, bTinU, bTlWR, bTliv, bTlqO, bTlqg, bTltB) são inalcançáveis.
  **Regras que só existem nele** e precisam sobreviver à exclusão:
  1. **Alterar a comissão unitária por workflow explícito, com motivo obrigatório, redistribuindo pelas parcelas sem
     apagá-las** (bTlqg + bTlqO, §5.5) — é a regra que o app novo deve implementar (§9.3).
  2. Data real de entrega como campo **obrigatório** preenchido antes de gerar as parcelas
     (`dt dataentrega realizada` bTikr, `mandatory=True`).
  3. Exibição de **Valor bruto** e **Valor líquido** da entrega (colunas bTikO e bTikT), perdidas na versão nova.
  4. Liberação de edição por `hierarquia ≤ 1` (inclui Diretor **e** qualquer perfil de hierarquia menor que 1 — não
     existe) em `Input numnf` e `upf nf fornecedor`.
  Nada disso se reproduz **como está**: a condicional do lápis (bTlpF) é invertida — habilita só quando
  `StatusFinanceiro = Recebido AND hierarquia > 1`, ou seja, apenas para **não**-diretores e apenas **depois** de recebida.
- **`pop.EditaContasReceberNew` está inalcançável hoje.** Os únicos WF que o abriam (bTpTH e bTvIt) têm
  `workflow_disabled=True` (`financeiro.md` §4.10, §8.1). Os 23 workflows existem, mas nenhum usuário chega a eles pela
  interface — esta spec descreve a **função a reconstruir**, não uma tela em uso. Antes de portar, confirmar com o
  negócio se a função ainda é desejada (§10.1).
- **`btn comentarios pagamento` (bTsAW1) + WF bTsBq1:** o ícone é `oculto ao carregar` e não tem condicional que o
  mostre; o workflow faz `ShowElement` sem `DisplayGroupData`; e o reusable de destino é tipado em `tbl_contasreceber`,
  incompatível com CP. Morto em três camadas.
- **Lixeira do histórico (bTmBe):** habilitada por condicional, **sem workflow**. Botão que não faz nada.
- **WF bTsKw:** `DisplayGroupData` sem `ShowElement` — o ícone de agenda do cliente não abre nada.
- **Célula/coluna vazias:** `Cell G` (bTrwH) e `Column G` (bTrwB) só existem para abrigar o disquete;
  `TableCell Cell B` (bTrrn) e `Cell I` (bTrzn1) são cabeçalhos sem texto; a condicional `⟂ quando ∅ →` de `Text H`
  (bTrpx / bTliR) é vazia.
- **`CopiarEndereçosOrcamentoParaContasReceber` (bToWv0):** script de correção em massa sem filtro; não reproduzir (§6).
- Campos nunca gravados: `CR.ValorComissaoUnitario`, `CR.GerouReciboRecebimento` (já anotado em `financeiro.md` §4.5),
  `CP.QuaisEntregas`, `CP.QualMetaFechada`, `CP.opt.MotivoAlterarComissao` (excluído),
  `CP.QualPrazo` (sempre ∅ por bToYn).

### 8.2 Duplicação

- **Duas tabelas com o mesmo nome** `rpg ContasReceber` (bTrrW para CR, bTrzZ1 para CP) — e uma expressão
  (bTrzm1) que referencia o nome ambíguo (§5.6, §10.14).
- **Dois inputs com o mesmo nome** `ipt valor a receber` (bTrsG, bTsAJ1) e **três** ícones `Icon I` diferentes
  (bTsIm fecha o popup, bTsIt é o alerta, bTsJb/bTsJt abrem a agenda) — impossível ler o workflow pelo nome do elemento.
- **Célula de status replicada 3×**: o mesmo SVG de 360 caracteres e a mesma condicional em `HTML A` (bTrsf),
  `HTML B` (bTsAh1) e `HTML A` da versão antiga (bTlWL).
- **Bloco "Dados da Entrega" duplicado** entre as duas versões (logo, nome, cotação/proposta, condição negociada) —
  mesmos textos, ids diferentes.
- **Ícone de motivo duplicado** (`Group J` bTrsL na CR, `Group M` bTsAK1 na CP), mesmas duas condicionais.
- **Quatro corpos de e-mail fixos** (cliente×fornecedor × pedido×entrega: bTsJh e bTsJz, duas condicionais cada) com
  telefones, assinatura e cores repetidos — 4 cópias do mesmo texto institucional.
- **Os 3% do vendedor em três lugares**: bToYn, bTpol (`CriarComissoesPassadas`) e bTpor (`CorrigirValorComissaoPagar`).
- **A criação de CR em dois lugares**: bTfDb (fluxo normal) e bTmHH (`CriarContasReceberImportadas`), com conjuntos de
  campos diferentes — é por isso que só o importado tem `StatusFinanceiro` (§5.3).
- **14 campos copiados da entrega para cada CR e CP** (§5.7), mantidos por quatro workflows distintos.

### 8.3 Gambiarras

- **Apagar e recriar para editar.** bTrtm destrói CR e CP (passos 7/8) e pede ao backend para recriá-las (9/10),
  perdendo id, baixa, cobrança, histórico e status. O caminho correto já existia na versão antiga (§5.5).
- **Corrida entre eventos agendados.** Passos 2, 6, 9 e 10 de bTrtm com `date = agora`, sem ordem garantida; o passo 9
  depende do resultado do passo 6 (§4.3). Igualmente, bTlqU relê o valor gravado por bTlqZ.
- **`ResultOfStep` de evento agendado**: bTsCr1 usa `ResultOfStep[bTsCm1]:convert_to_list` — depende do commit do passo 1.
- **Recursão de um registro por chamada** (bTfIl, bTmHZ, bTpnz) no lugar de um `INSERT ... SELECT`.
- **Parâmetros inexistentes** passados a bTfDZ (`dtvcto`, `PrazoDias`) — código que parecia calcular vencimento
  cumulativo e não calcula.
- **`ValorTotal` atribuído duas vezes** no mesmo `NewThing` (bToYn) — a primeira fórmula
  (`comissão ÷ QtdVenda`) é morta e enganosa.
- **Fórmulas sobre campos excluídos**: ICMS do orçamento usa `TotalBonusExtra - deleted` (bTPFv); os e-mails de
  cancelamento usam `UsaEmailPessoal - deleted`.
- **`bind_field` errado herdado de copiar-colar**: `ipt comissaounit` (bTruv) declara
  `bind_field="cpo_nftexto_text"` (campo de **texto**) e `ipt dtentrega` (bTruh) declara `cpo_dtentrega_date` —
  só não estraga porque `auto_binding` é False nesses dois.
- **Cinco estados customizados para carregar cinco inputs** de um grupo para o popup ao lado (bTryS1), em vez de o
  popup ler os inputs.
- **`0.03` literal no workflow** em lugar de parâmetro (§5.4) — e a MegaBox tem `Tbl.NiveisVendedores`, que sugere
  percentual por nível.
- **Data base inconsistente**: CR usa a data **real** de entrega, CP usa a **prevista** (§5.3, §5.4); trocar o prazo
  usa **hoje** (§4.4).
- **Botões "SIM" e "NÃO" com o mesmo rótulo** "Cancela Pedido" quando o toggle está ligado (bTsJQ, bTsNr).
- **Cancelar entrega zera `QtdEntrega`; cancelar pedido não** (§4.9).
- **Dois caminhos de leitura para o mesmo cliente** no logo: `src` usa `QualCotacao.QualCliente.Foto`, a condicional usa
  `QualCliente.Foto` (bTrpF, bTijG).

### 8.4 Otimizações para o banco novo

1. **Dinheiro em `numeric`**: `numeric(14,2)` para valores de parcela e `numeric(14,6)` para unitários; nunca float.
2. **Parcelas como cronograma de verdade**: `contas_receber(entrega_id, parcela_num, parcelas_total, prazo_dias,
   data_vencimento, valor numeric(14,2))`, com `UNIQUE(entrega_id, parcela_num)` e
   `CHECK (valor >= 0)`. Isso mata a duplicação por clique duplo (§4.5) e dá ordem estável à tabela (§3).
3. **Derivados viram view/coluna gerada**, não cópia: os 14 campos da §5.7 saem das tabelas e entram em
   `vw_contas_receber_lista` (já prevista em `financeiro.md` §9.4).
4. **`Opt.ParcelasReceber` → tabela `prazos_recebimento(id, rotulo, dias int NOT NULL, ativo bool)`**: o option set atual
   tem 22 opções, `12dd` duplicada (uma excluída), `49dd` **sem** `diasprazonumero` e `qtdparcelasnumero` incoerente
   (`28dd` → 4, `30dd` → 5). Com `dias NOT NULL` o bug do vencimento = hoje deixa de existir (§4.4).
5. **`Opt.StatusFinanceiro` → enum + default**: `status contas_status NOT NULL DEFAULT 'a_receber'` na CR e
   `'a_pagar'` na CP; fim do status vazio (§5.3). Status de CP e de CR **separados** (hoje as condicionais da CP testam
   `Recebido`).
6. **Baixa e estorno em tabelas próprias**: `baixas(conta_id, tipo, numero_nf, data_nf, data_banco, anexo, quem, quando)`
   e `estornos(baixa_id, motivo, quem, quando)`; a conta guarda só o status. Resolve §4.7 e o buraco de auditoria.
7. **Auditoria por trigger**: `auditoria_valores(tabela, registro_id, campo, valor_antes, valor_depois, motivo,
   usuario_id, em)` alimentada por trigger em `contas_receber`, `contas_pagar`, `entregas` e `orcamentos_fornecedor`.
   Motivo **NOT NULL** quando o campo alterado é de dinheiro ou de vencimento.
8. **Sem exclusão física de dinheiro**: `cancelada_em`, `cancelada_por`, `motivo_cancelamento`; `RULE`/política que
   impede cancelar parcela com baixa.
9. **Uma transação no lugar de eventos em cadeia**: recalcular orçamento → entrega → parcelas dentro de uma função SQL
   (`fn_reprogramar_comissoes_entrega`), eliminando as corridas da §8.3.
10. **Invariante como `CHECK`/teste**: `Σ valor das parcelas de uma entrega = comissão da entrega`; o alerta vermelho
    da §5.6 deixa de ser cor e passa a ser impossível.
11. **Arquivos em Storage privado** com URL assinada; `Arquivado` também para contas a pagar (§4.11).
12. **Percentual do vendedor em parâmetro** (`parametros.percentual_comissao_vendedor` ou por nível em
    `niveis_vendedores`), com vigência.

---

## 9. Proposta para o app novo

### 9.1 Rotas e diálogos

Nenhuma rota nova: são diálogos sobre `app/(app)/financeiro`.
- `/financeiro?entrega=<uuid>` → `<DialogEditarContasEntrega>` (equivalente de `pop.EditaContasReceberNew`).
  Server Component carrega a entrega com suas parcelas; o diálogo é Client Component.
- `/financeiro?conta=<uuid>&tipo=receber|pagar&aba=historicos` → `<DialogHistoricosConta>`, o mesmo componente que
  `financeiro.md` §9.2 já prevê (abrir pela pílula de último histórico ou pelo botão de comentários).
- `/financeiro?entrega=<uuid>&acao=cancelar` → `<DialogCancelarEntrega>`.
- Guarda no layout/middleware: sessão + permissão de página (`permissoes_pagina`), como em `financeiro.md` §9.1.

### 9.2 Componentes

- `DialogEditarContasEntrega` — seções "Dados da entrega", "Contas a receber", "Contas a pagar"; o cadeado
  (`Button D`) vira um botão "Editar dados da entrega" que **habilita o formulário e nada mais** (a permissão é
  reconferida no servidor).
- `FormEntregaFinanceiro` — data real de entrega (obrigatória), quantidade, comissão unitária, número e arquivo da NF
  **do fornecedor** (rótulo explícito, para não confundir com a NF MegaBox da baixa — §4.8), comprovante de entrega;
  submit abre `ConfirmarReprogramacao`.
- `ConfirmarReprogramacao` — o aviso de `pop alerta alteracao`, com **pré-visualização do antes/depois das parcelas**
  (o Bubble não mostra) e motivo obrigatório (mín. 10 caracteres), validado também no servidor.
- `TabelaParcelasReceber` / `TabelaContaPagar` — colunas vencimento, prazo, valor, status, ações; **cada célula editável
  é um campo controlado que chama uma server action**, nunca auto-binding; linha com baixa fica somente-leitura e mostra
  NF/recibo e quem baixou.
- `ResumoConferenciaComissao` — no lugar do cabeçalho vermelho: "comissão da entrega R$ X · soma das parcelas R$ Y ·
  diferença R$ Z", com botão "reequilibrar parcelas".
- `DialogCancelarEntrega` — motivo obrigatório, escolha entrega × pedido com o efeito listado em texto
  ("N parcelas em aberto serão canceladas; 2 parcelas já recebidas **impedem** o cancelamento"), toggles de aviso a
  cliente/fornecedor com pré-visualização do e-mail (templates versionados, não texto em condicional).
- `DialogHistoricosConta` — lista, incluir (com "gravar também no fornecedor"), editar e **apagar** (o que falta hoje).
- `BadgeStatusFinanceiro`, `IconeMotivoAlteracao` — substituem os dois blocos HTML e as condicionais repetidas.

### 9.3 Server actions

Todas: Server Action com `'use server'`, validação zod, **trava de perfil no servidor**, **uma transação** e **registro
de quem alterou o quê** em `auditoria_valores`. `service_role` nunca sai do servidor (`CLAUDE.md` §4).

| Ação | Trava de perfil | Transação e regras |
|---|---|---|
| `reprogramarComissoesEntrega({entregaId, dtEntrega, qtdEntrega, comissaoUnitaria, numNf, arquivoNf, motivo})` | Diretor **ou** Gerente do Financeiro | Recusa se qualquer parcela da entrega tiver baixa (oferece estornar primeiro). Numa transação: grava a entrega; recalcula orçamento e entrega (`fn_recalcular_entrega`); **reequilibra** as parcelas abertas por `fn_valor_parcela` **sem apagá-las** (§5.5); recria só as que faltarem; grava CP; insere N linhas de auditoria com valor antes/depois, motivo e usuário. Substitui bTrtm inteiro |
| `alterarComissaoParcela({contaId, valor, motivo})` | Diretor ou Financeiro | Recusa parcela com baixa ou cancelada; `valor > 0`; motivo obrigatório; auditoria. Substitui o auto-binding de `ipt valor a receber` (§7.2) |
| `alterarVencimentoParcela({contaId, data, motivo})` | idem | `data >= data_entrega`; auditoria. Substitui o auto-binding de `dt vencimento` |
| `alterarPrazoParcela({contaId, prazoId, motivo})` | idem | Recalcula `data_vencimento = data_entrega + prazos.dias` (**não** "hoje" — §4.4); auditoria |
| `gerarParcelasReceber({entregaId, prazoIds[]})` | Financeiro | **Idempotente**: recusa se já existirem parcelas (hoje duplica, §4.5). Cria N parcelas com `parcela_num`, rateio com sobra na última, status `a_receber` |
| `gerarContaPagar({entregaId})` | Financeiro | Idempotente por `(entrega_id, vendedor_id)`; percentual vindo de parâmetro; vencimento sobre a **data real** de entrega |
| `cancelarParcela({contaId, motivo})` | Diretor | **Exclusão lógica**; recusa se houver baixa; auditoria |
| `estornarBaixa({contaId, motivo})` | Diretor | Numa transação: move os dados da baixa para `estornos`, **limpa** NF/recibo/data de banco da conta, status volta a `a_receber`/`a_pagar`, grava `quem_estornou`/`quando` **nas duas** tabelas (hoje a CP não grava, §4.7) |
| `cancelarEntrega({entregaId, motivo, cancelarPedido, avisarCliente, avisarFornecedor})` | Diretor | Recusa se existir parcela com baixa (hoje apaga, §7.5). Cancelamento lógico da entrega (e do pedido + suas entregas, se pedido); parcelas abertas viram `cancelada`; e-mails **enfileirados** em `email_outbox` (nunca montados no cliente); auditoria |
| `salvarHistoricoConta({contaId, tipo, descricao, tambemNoFornecedor})` | qualquer usuário com acesso à página | Cria histórico do cliente e, se pedido, do fornecedor — **cada um atualizando o `ultimo_historico` do seu próprio grupo** (corrige bTmBv, §10.12); liga **os dois** à conta |
| `editarHistorico({id, descricao})` / `excluirHistorico({id})` | autor ou Diretor (checado no servidor) | Exclusão lógica; grava `editado_em`/`editado_por` |

### 9.4 SQL / views

- `fn_valor_parcela(total numeric, n int, i int) returns numeric` — rateio exato: `round(total/n, 2)` nas i<n e
  `total - soma das anteriores` na última. **Com teste** (§5.7).
- `fn_recalcular_entrega(entrega_id uuid)` — cadeia das §5.1/§5.2 em `numeric`, numa transação.
- `fn_reprogramar_comissoes_entrega(entrega_id uuid, motivo text, usuario uuid)` — o substituto de bTrtm:
  recalcula, reequilibra parcelas abertas, cria/ajusta a CP e grava auditoria. Nada de eventos agendados.
- `vw_conferencia_comissao_entrega` — `entrega_id, comissao_entrega, soma_parcelas, diferenca`, com
  `WHERE diferenca <> 0` como alerta operacional (substitui o cabeçalho vermelho, §5.6).
- `vw_parcelas_entrega` — parcelas + prazo + status + baixa + último histórico (lateral join), para a tabela do diálogo.
- `vw_historico_conta` — histórico da conta com autor, foto e data.
- `trg_auditoria_contas` — trigger `AFTER UPDATE` em `contas_receber`, `contas_pagar`, `entregas` e
  `orcamentos_fornecedor` gravando campo, antes, depois, motivo (de variável de sessão), usuário.
- Constraint `chk_parcela_valor_positivo`, `UNIQUE(entrega_id, parcela_num)`, e política que recusa `UPDATE` de valor
  em parcela com baixa.
- **RLS em todas** (regra 3 do `CLAUDE.md`): leitura para quem tem permissão na página Financeiro; escrita em
  `contas_receber`/`contas_pagar` só por `SECURITY DEFINER` das funções acima, nunca direto do cliente — o oposto do
  auto-binding de hoje (§7.2).

### 9.5 Tabelas envolvidas

`entregas`, `contas_receber`, `contas_pagar`, `parcelas`* (se o cronograma virar tabela própria), `baixas`, `estornos`,
`prazos_recebimento`, `orcamentos_fornecedor`, `pedidos`, `propostas`, `cotacoes`, `historicos`, `grupos_clifor`,
`enderecos_clifor`, `contatos_clifor`, `usuarios` (perfil, departamento, nível), `niveis_vendedores`,
`auditoria_valores`, `email_outbox`, `config_sistema` (listas de cópia oculta 8 e 9), `permissoes_pagina`.
Compartilhadas com `financeiro.md` §9.5 — **um único esquema**, não dois.

---

## 10. Dúvidas

1. **[DÚVIDA]** O diálogo de edição está inalcançável (aberturas bTpTH e bTvIt desativadas). A função ainda é
   desejada? *Recomendação padrão:* reconstruir, porque é o único lugar que corrige comissão e parcelas, mas com trava de
   perfil no servidor e sem apagar contas baixadas.
2. **[DÚVIDA]** Ao trocar o prazo, a base do vencimento deve ser **hoje** (bTrtV/bTimr) ou a **data de entrega**
   (bTfDb)? *Recomendação:* data de entrega, igual à criação; mostrar a data calculada antes de gravar.
3. **[DÚVIDA]** `CR.ValorTotal` recebe o valor da venda **inteiro** em cada parcela (§5.3), e a página `financeiro`
   soma esse campo no recibo. É intencional? *Recomendação:* não; o valor da venda fica na entrega e a parcela guarda
   só a comissão — corrigir também os totais de `financeiro.md` §3.5.
4. **[DÚVIDA]** O vencimento da CP é calculado sobre a data **prevista** de entrega (`cpo.DataEntrega` em bTsBL1 e
   bTryj1) e o da CR sobre a **real** (`cpo.dtentrega`). *Recomendação:* usar a data real nas duas.
5. **[DÚVIDA]** O rateio da comissão em parcelas é sempre **igual** (`÷ Qtd`)? Há caso de parcelas desiguais
   (ex.: 50/30/20)? *Recomendação:* manter iguais, com a sobra de centavos na última, e deixar a edição manual por ação
   auditada.
6. **[DÚVIDA]** Editar a comissão unitária de **uma** entrega sobrescreve a comissão unitária do **orçamento inteiro**
   (bTsCm1), afetando as outras entregas da mesma linha sem recalculá-las. *Recomendação:* alterar só a entrega; mexer no
   orçamento é operação separada, na tela de vendas.
7. **[DÚVIDA]** `CriarContasReceber` (bTfDb) não grava `StatusFinanceiro`: as parcelas nascem com status **vazio**.
   Qual status vale? *Recomendação:* `A receber` no ato da criação, e enum `NOT NULL DEFAULT` no banco novo.
8. **[DÚVIDA]** Alterar comissão/vencimento por auto-binding não pede motivo, mas o popup de alteração da entrega exige.
   Qual é a regra? *Recomendação:* motivo obrigatório em **toda** alteração de valor ou vencimento.
9. **[DÚVIDA]** Cancelar entrega/pedido apaga CR e CP **sem checar status** (bTsOV, bTsOa, bTsOf, bTsOh), inclusive as
   já recebidas e declaradas em recibo. *Recomendação:* bloquear o cancelamento quando houver baixa e nunca apagar
   fisicamente.
10. **[DÚVIDA]** A lixeira do histórico (bTmBe) está habilitada e não tem workflow. Apagar anotação é permitido?
    *Recomendação:* sim, exclusão lógica pelo autor ou Diretor, com registro.
11. **[DÚVIDA]** O estorno da CP (bTsBe1) não grava `DataEstorno` nem `QuemEstornou`, embora os campos existam.
    *Recomendação:* gravar nos dois tipos.
12. **[DÚVIDA]** O passo bTmBv grava o `UltimoHistoricoMsg` do **fornecedor** com o histórico do **cliente**
    (`ResultOfStep[bTmBp]` em vez de bTmCr). Bug ou intenção? *Recomendação:* bug; cada grupo aponta para o seu histórico.
13. **[DÚVIDA]** `Opt.ParcelasReceber` tem `49dd` **sem** `diasprazonumero` (vencimento vira "hoje"), `12dd` duplicada
    e `qtdparcelasnumero` incoerente (`28dd` → 4, `30dd` → 5). Qual é a lista válida? *Recomendação:* tabela
    `prazos_recebimento` com `dias NOT NULL`, revisada com o Financeiro antes da carga.
14. **[DÚVIDA]** O total exibido acima da tabela de contas a **pagar** (bTrzm1) referencia `El[rpg ContasReceber]`, nome
    usado pelas duas tabelas — está somando as CRs? *Recomendação:* cada tabela soma a si mesma.
15. **[DÚVIDA]** Contas a pagar devem ter histórico? Hoje o botão está oculto, sem dado, e o reusable é tipado em
    `tbl_contasreceber`. *Recomendação:* sim, histórico polimórfico `(tipo_conta, conta_id)`.
16. **[DÚVIDA]** O logo do cliente lê `Entrega.QualCotacao.QualCliente.Foto` no `src` e `Entrega.QualCliente.Foto` na
    condicional (bTrpF/bTijG). Qual é o cliente correto da entrega? *Recomendação:* o da própria entrega
    (`Entrega.QualCliente`), com a cotação como fallback.
17. **[DÚVIDA]** WF bTsKw faz `DisplayGroupData` na agenda de contatos do cliente **sem** `ShowElement` — o popup não
    abre. Deveria abrir? *Recomendação:* sim, igual ao do fornecedor (bTsLD).
18. **[DÚVIDA]** `CR.QuaisHistoricos = ResultOfStep[bTmBp]` (bTmBq): o mapa mostra `=`; é "adicionar" ou "substituir"?
    Se for substituir, cada nova anotação apaga o vínculo das anteriores. *Recomendação:* relação 1:N no banco novo,
    sem lista (mesma dúvida de `financeiro.md` §10 sobre operadores de lista).
19. **[DÚVIDA]** Os bcc dos e-mails de cancelamento vêm das configs `CodigoConfig = 8` (cliente) e `9` (fornecedor) —
    quais são os nomes/propósitos? *Recomendação:* documentar em `pop.ConfigSistema` e manter, registrando o envio.
20. **[DÚVIDA]** `dd qtd parcelas receber` grava `Pedido.PrazoRecebComissoes` por auto-binding, mudando a condição
    negociada do pedido para **todas** as entregas. O parcelamento é do pedido ou da entrega?
    *Recomendação:* do pedido como padrão, com possibilidade de sobrepor por entrega, e alteração por ação auditada.
21. **[DÚVIDA]** `orc.ValorICMS` é calculado sobre `TotalBonusExtra` (campo **excluído**) e `ValorPISCOFINS` sobre
    `TotalComissaoVendedor` (inexistente no mapa) → ambos zero, logo `ValorVendaLiquido = ValorVendaBruto`. Quais são as
    fórmulas reais de ICMS e PIS/COFINS? *Recomendação:* usar `Tbl.IcmsEstados` por UF de origem/destino e alíquota de
    PIS/COFINS em parâmetro; **com teste** (regra 10 do `CLAUDE.md`).
22. **[DÚVIDA]** A lista `binding_fields` de `Tbl.Pedido` e `Tbl.Entregas` está **truncada** no mapa. Confirmar no
    editor se `cpo_prazorecebcomissoes_...` e os campos da entrega estão liberados para auto-binding.
    *Recomendação:* assumir que estão (é o que a tela usa) e fechar tudo no app novo.
23. **[DÚVIDA]** O percentual de 3% da comissão do vendedor é fixo para todos? Existe `Tbl.NiveisVendedores`.
    *Recomendação:* parâmetro com vigência, por nível do vendedor; manter 3% como valor inicial.
24. **[DÚVIDA]** `pop.EditaContasReceber` (bTiin) pode ser excluída do app? *Recomendação:* sim, depois de portar a
    regra de redistribuição da §5.5 e as colunas de valor bruto/líquido (§8.1).

---

## 11. Cobertura — todos os 36 workflows

Conferido por `grep '^#### WF' mapa/reusable-pop.EditaContasReceberNew.md` (23), `... EditaContasReceber.md` (9) e
`... HistoricosContaReceber.md` (4) = **36**, igual ao `00-inventario.md`.

### 11.1 `pop.EditaContasReceberNew` (bTrot) — 23 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTrtN | Clique `Button B` "Recebimentos" | agenda `CriarContasReceber` bTfDZ com os prazos do dropdown e a data **real** de entrega (bTrtO) | 4.5, 5.3 |
| 2 | bTrtP | Clique `btn deletar recebimento` | apaga fisicamente a CR da linha (bTrtT) | 4.6 |
| 3 | bTrtU | Mudou `dd prazo a vencer` | `CR.DataVencimento = hoje + dias do prazo` (bTrtV) | 4.4, 5.7 |
| 4 | bTrtZ | Clique `btn cencela confirmaentrega` "Fechar" | esconde e reseta o reusable (bTrta, bTrtb) | 4.1 |
| 5 | bTrtf | Clique `btn mudar status recebimento` | estorna a CR: status `A receber`, `DataEstorno`, `QuemEstornou` (bTrtg) | 4.7 |
| 6 | bTrth | Clique `Icon A` (clipe) | abre `Entrega.ArquivoNfFornecedor` em nova aba (bTrtl) | 4.8 |
| 7 | bTrtm | Clique `btn gravar entregas` "SIM" | grava a entrega e **refaz CR e CP** — 12 ações, inclui bTPFh, bTbPH, bTfDZ, bToYh e duas exclusões em lote | 4.3, 5.1–5.4 |
| 8 | bTruD | Clique `btn comentarios recebimento` | abre `pop.HistoricosContaReceber` com a CR (bTruE, bTruF) | 4.10 |
| 9 | bTrwl | Clique `btn gravar entrega` (disquete) | abre `pop alerta alteracao` com a entrega e copia os 5 inputs para estados (bTryF1, bTryH1, bTryS1) | 4.3 |
| 10 | bTsKG | Clique `Icon I` (X do cancelamento) | esconde `pop cancelar entrega e pedido` (bTsKL) | 4.9 |
| 11 | bTsKN | Clique `Button J` "SIM" (toggle pedido **off**) | cancela **só a entrega** (status, motivo, `QtdEntrega = 0`), envia e-mails a cliente/fornecedor e **apaga CR e CP** (bTsKS…bTsOa) | 4.9, 7.5 |
| 12 | bTsKe | Clique `Button J` "SIM" (toggle pedido **on**) | cancela o **pedido** e todas as entregas, envia e-mails e **apaga CR e CP de todas** (bTsKj…bTsOh) | 4.9, 7.5 |
| 13 | bTsKw | Clique `Icon I` (agenda contatos do cliente) | passa o cliente ao `pop.AgendaContatos` — **sem abrir o popup** (bTsLB) | 4.9, 8.1 |
| 14 | bTsLD | Clique `Icon I` (agenda contatos do fornecedor) | passa o grupo do fornecedor e abre o `pop.AgendaContatos` (bTsLI, bTsLJ) | 4.9 |
| 15 | bTsLO | Clique `Button E` "Cancelar" | abre o cancelamento com pedido e entrega nos estados (bTsLU, bTsLZ) | 4.9 |
| 16 | bTsOm | Clique `Button I` "NÃO" | esconde e reseta o cancelamento (bTsOs, bTsOx) | 4.9 |
| 17 | bTsOz | Clique `Button D` (quando `var_liberaedicao_` = true) | **trava** a edição da linha da entrega (bTsPE) | 4.2 |
| 18 | bTryq1 | Clique `Button D` (quando `var_liberaedicao_` = false) | **destrava** a edição da linha da entrega (bTryw1) | 4.2 |
| 19 | bTsBL1 | Clique `Button H` "Pagamentos" | agenda `CriarContasPagar` bToYh com a data **prevista** de entrega (bTsBR1); sem limite e sem checar duplicidade | 4.5, 5.4 |
| 20 | bTsBT1 | Clique `btn deletar pagamento` | apaga fisicamente a CP da linha (bTsBZ1) | 4.6 |
| 21 | bTsBe1 | Clique `btn mudar status pagamentos` | CP volta a `A pagar` — **sem** data nem autor do estorno (bTsBk1) | 4.7 |
| 22 | bTsBq1 | Clique `btn comentarios pagamento` | `ShowElement` do histórico **sem passar a conta**; botão oculto e tipo incompatível → morto (bTsBv1) | 4.10, 8.1 |
| 23 | bTsDR1 | Clique `btn fecha addedita financeiro` (X) | esconde e reseta o reusable (bTsDW1, bTsDX1) | 4.1 |

### 11.2 `pop.EditaContasReceber` (bTiin) — 9 workflows (versão anterior, sem gatilho)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 24 | bTimY | Clique `Button B` "Add Parcelas" | agenda `CriarContasReceber` bTfDZ usando a data de `dt dataentrega realizada` (bTimd) | 4.5, 8.1 |
| 25 | bTimf | Clique `Icon B` (lixeira) | apaga a CR da linha (bTimk) | 4.6, 8.1 |
| 26 | bTimp | Mudou `dd prazo a vencer` | `CR.DataVencimento = hoje + dias do prazo` (bTimr) | 4.4, 8.1 |
| 27 | bTinU | Clique `btn cencela confirmaentrega` | esconde e reseta o reusable (bTinZ, bTina) | 4.1, 8.1 |
| 28 | bTlWR | Clique `Icon mudar status` | estorna a CR: status, `DataEstorno`, `QuemEstornou` (bTlWX) | 4.7, 8.1 |
| 29 | bTliv | Clique `Icon A` (clipe) | abre a NF do fornecedor em nova aba (bTljB) | 4.8, 8.1 |
| 30 | bTlqO | Clique `Button C` "Gravar" | **regra exclusiva desta versão:** grava nova comissão unitária no orçamento, recalcula a comissão bruta da entrega e **redistribui pelas CRs existentes** com o motivo, sem apagá-las (bTlqa, bTlqZ, bTlqU, bTlqf) | 5.5, 8.1, 9.3 |
| 31 | bTlqg | Clique `Icon D` (lápis) | abre `pop altera valor comissao` com a CR (bTlqm, bTlqn); condicional de habilitação **invertida** | 4.4, 8.1 |
| 32 | bTltB | Clique `Icon mudar status copy` | abre `pop.HistoricosContaReceber` com a CR (bTltH, bTltI) | 4.10, 8.1 |

### 11.3 `pop.HistoricosContaReceber` (bTlza) — 4 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 33 | bTmBk | Clique `Button A` "Enviar" (grupo de edição vazio) | cria histórico no cliente (+ um no fornecedor se marcado), atualiza `UltimoHistorico*` dos dois grupos e amarra **só o do cliente** à conta (bTmBp, bTmBx, bTmCr, bTmBv, bTmBq, bTmCB) | 4.10 |
| 34 | bTmCH | Clique `Icon A` (X) | fecha o popup de históricos (bTmCN) | 4.10 |
| 35 | bTmDE | Clique `Icon B` (lápis) | carrega a anotação em `gp edita historico` (modo edição) (bTmDK) | 4.10 |
| 36 | bTmDL | Clique `Button A` "Salvar" (grupo de edição preenchido) | grava a nova `Descricao` e sai do modo edição (bTmDd, bTmDi) | 4.10 |
</content>
</invoke>
