# Spec funcional — página `sac` (Bubble `bUCjn`)

Fonte: `mapa/pagina-sac.md` (378 elementos · 27 workflows · 56 ações · 103 condicionais · 3 popups · 3 RGs · 4 tabelas · 2 HTML · 1 estado customizado).
Apoio: `mapa/reusable-pop.RespostasEmails.md` (28 el · 2 WF · 2 ações · 2 condicionais), `mapa/reusable-pop.HistoricoConversas.md`
(23 el · 3 WF · 7 ações · 7 condicionais), `data-types.md`, `option-sets.md`, `backend-workflows.md` (`EnviarEmailsGeral` bTnvb0),
`integracoes.md`, `pagina-formularionps.md`, `pagina-formulariovenda.md`, `reusable-tool.Cabecalho.md`, `reusable-tool.MenuPaginas.md`.

**Se esta spec e o mapa discordarem, o mapa manda.**

Glossário:
- **Protocolo / chamado** = registro de `Tbl.SacProtocolo` (`tbl_sac`, 18 campos): uma ocorrência de pós-venda aberta contra um
  cliente/fornecedor, com tipo, prioridade, status, responsável, pedido, entregas, filial, anexos e descrição.
- **Interação** = registro de `Tbl.SacHistorico` (`tbl_sachistorico`, 3 campos): um andamento do protocolo, marcado ou não como
  "visível para o cliente" (o que dispara e-mail ao contato).
- **Pesquisa** = registro de `Tbl.PesquisaNps` (`tbl_pesquisanps`): uma campanha nominada de NPS.
- **Resposta** = registro de `Tbl.PesquisaRespostas` (`tbl_pesquisaposvenda`, 14 campos): um convite enviado a um cliente e, se ele
  responder, as notas e comentários. Serve tanto para NPS quanto para Pós-Venda (`cpo.TipoResposta`).
- **Histórico de conversas** = registro de `Tbl.Historico` (`tbl_historico`): anotação de atendimento por cliente, sem protocolo —
  é o reusable `pop.HistoricoConversas`, usado hoje na página `cadastros`, não em `sac`.

---

## 1. Propósito e quem usa

Tela "Suporte de Vendas & NPS". Reúne quatro assuntos em quatro abas de uma página só:

1. **Chamados** — dashboard de protocolos de pós-venda: listar, filtrar, abrir um protocolo novo, editar, registrar interações
   (com e-mail opcional ao cliente) e excluir logicamente.
2. **Relatórios** — indicadores do SAC em dois blocos HTML com Chart.js (volume por tipo de ocorrência etc.).
3. **Gestão NPS** — criar campanhas de pesquisa, montar a lista de clientes a pesquisar, disparar o e-mail com o link do
   formulário público e acompanhar quem respondeu, com nota e comentário.
4. **Pós-Venda** — leitura das respostas da pesquisa automática de pós-venda (preenchidas na página pública `formulariovenda`),
   com notas de atendimento e de produto.

Dois componentes do mesmo módulo **não estão nesta página** e precisam de destino no app novo:
- `pop.HistoricoConversas` (bTxuV) — histórico de conversas por cliente; instanciado em `pagina-cadastros` (bUCbN0) e em
  `cadastros_old` (fora de escopo).
- `pop.RespostasEmails` (bUBss) — leitor de caixa de e-mail via API do Gmail; instanciado em `pagina-index` (bUCAY) e dentro de
  `reusable-pop.ConfigSistema` (bUCGq).

**Quem usa:** Ouvidoria/SAC e Diretoria. O corpo dos e-mails se assina "Ouvidoria – Grupo Megabox" (WF bUDcb, WF bUDth).

### Controle de acesso de fato (só no navegador)

- **Não há guarda nenhuma no carregamento.** A página não tem workflow `PageLoaded` e não lê nenhum parâmetro de URL
  (`UrlParam` aparece 0 vez em `mapa/pagina-sac.md`). Quem digitar `/sac` entra, logado ou não.
- O único controle é o link do menu: em `tool.MenuPaginas`, `Link A` (bTeRX) nasce `link_disabled=True` e só é habilitado se a
  linha de `Tbl.ConfigSistema` com `QualPagina = sac` listar o departamento, o perfil ou o usuário
  (`QuaisDeptos`/`QuaisPerfis`/`QuaisUsuarios`). O item `Opt.MenuPaginas."Suporte de Vendas & Nps"` (`sac___nps`) tem só
  `{"p_gina": "sac"}` — **sem `hierarquia` e sem `DepartamentosAcessiveis`**, ao contrário dos outros itens do menu.
- Dentro da página, a única regra é `CurrentUser:cpo.QualPerfil = Opt.PerfilUsuario.Diretor`:
  - Os 4 botões de aba (`Button F/G/H/O`) têm condicional `quando perfil = Diretor → is_visible=True`, mas **nenhum deles está
    "oculto ao carregar"**. A condicional é inócua: as abas Relatórios, Gestão NPS e Pós-Venda aparecem para todo mundo.
  - Todos os campos do formulário do protocolo (`dd ocorrencia`, `dd prioridade`, `dd status`, `rad tipo clifor`, `dd pedido`,
    `dd entregas`, `dd qualclifor`, `dd qualfilial`, `dd responsável`, `ipt anexos`, `ipt obs`) e a caixa de nova interação
    (`MultilineInput B`) ficam `disabled=True` para quem não é Diretor.
  - **Os botões não ficam desabilitados:** "Gravar" (`Button D`), "Salvar" (`Button Salvar`), "Registrar" (`Button N`), a lixeira
    (`Icon V`) e os ícones de adicionar/remover contato da pesquisa funcionam para qualquer usuário logado.
  - A tabela de chamados troca a busca inteira para não-Diretor (só os chamados em que ele é `QualResponsável`) — ver 3.1, com a
    ressalva de que essa mesma condicional anula os filtros da barra.

---

## 2. Estrutura da tela

### 2.1 Layout de cima para baixo

1. **Cabeçalho** `tool.Cabecalho A` (bUCuN, `USA Reusable tool.Cabecalho`, flutuante no topo) — fornece o estado `var_showmenu_`.
2. **Menu lateral** `tool.MenuPaginas A` (bUCuZ), oculto ao carregar, visível quando `tool.Cabecalho A:var_showmenu_ = true`.
3. `Group General` (bUCke):
   - **Barra de abas** `Group Nav Buttons` (bUCux): `Button F` "Chamados" (bUCvJ), `Button G` "Relatórios" (bUCvL),
     `Button H` "Gestão NPS" (bUCvR), `Button O` "Pós-Venda" (bUELN0). A aba ativa é sublinhada por condicional que lê
     `El[Group X]:is_visible`.
   - **Aba Chamados** `Group Chamados` (bUCvX) — única visível ao carregar:
     - Cabeçalho "Dashboard de Chamados" / "Gestão centralizada de protocolos de pós-venda" + `Button A` "Novo Chamado" (bUCkH).
     - Barra de filtros `Group A` (bUCjp): `Input A` (bUClD, busca por nome do grupo cliente/fornecedor), `dd status` (bUDNP),
       `dd prioridade` (bUDNV) e `Button B` "Limpar" (bUCln).
     - Tabela `tbl Chamados` (bUClt), 9 colunas: PROTOCOLO, CLIENTE (CNPJ), PEDIDO, TIPO, PRIORIDADE, STATUS, RESPONSÁVEL,
       coluna de ação `col.Botoes` (bUDMa0, "Detalhes") e coluna da lixeira `Icon V` (bUEFb2).
   - **Aba Relatórios** `Group Relatórios` (bUDDt), oculta ao carregar: título "Indicadores e Métricas" / "Visão geral de
     desempenho"; grupo de filtros `Group Y` (bUDEF) **também oculto ao carregar e sem nenhum workflow que o mostre**
     (contém o date range `dd data grafico` bUDEQ e o campo "Departamento" `ipt.email` bUDHp); `Group DZ` (bUDGb) com
     `HTML A` (bUDGP, 9.409 caracteres) e `HTML B` (bUDGV, 4.520 caracteres) + o RG morto
     `rpg sac protocolos (filtrar data)` (bUEDF).
   - **Aba Gestão NPS** `Group Gestão NPS` (bUCyb), oculta ao carregar: seletor `dd pesquisa` (bUDQE) + `Button E`
     "Nova Pesquisa NPS" (bUCyh); três cards (NPS Atual, Total de Respostas, Média da Avaliação); campo "Buscar" `ipt.email`
     (bUDCX, morto); dois switches — `Switch B` "NPS Respostas" (bUDUR) e `Switch Contatos` (bUDWX); tabela de respostas
     `Table B` (bUCzL) e, ao lado, `gp contatos` (bUDlp) com a tabela `rpg adicionar contatos` (bUDXv).
   - **RG oculto** `rpg contatos` (bUEAF) — fonte de dados de `rpg adicionar contatos`.
   - **Aba Pós-Venda** `Group Pós - Venda` (bUELT0), oculta ao carregar: "Gestão de Respostas do Pós-Venda" + `Table D` (bUEMt0),
     6 colunas (DATA, CLIENTE, QUAL VENDEDORA, STATUS, notas/observação, RESPOSTAS).

### 2.2 Popups e reusables

| Elemento | Tipo | Dado | Para quê |
|---|---|---|---|
| `Pop Novo Chamado` (bUCqT) | Popup | `custom.tbl_sac` | Criar e editar protocolo; duas abas internas: `Group Protocolo` (bUDoE) e `Group HistoricoSac` (bUDoX) |
| `pop novapesquisa` (bUDNv) | Popup | `custom.tbl_configuracoes` (tipo errado — grava `Tbl.PesquisaNps`) | Criar campanha de pesquisa NPS |
| `Popup B` (bUDNj) | Popup | — | **Vazio, sem conteúdo e sem workflow.** Código morto |
| `tool.Cabecalho A` (bUCuN) | Reusable | — | Cabeçalho, estado `var_showmenu_` |
| `tool.MenuPaginas A` (bUCuZ) | Reusable | — | Menu lateral e a única checagem de acesso |
| `Link A` (bUDGJ) | Link | — | **Sem URL, sem texto, sem workflow.** Código morto |
| `pop.HistoricoConversas` (bTxuV) | Reusable do módulo, **fora desta página** | `custom.tbl_clientes` via `get_group_data` | Histórico de conversas por cliente (usado em `cadastros`) |
| `pop.RespostasEmails` (bUBss) | Reusable do módulo, **fora desta página** | API Gmail | Leitura da caixa de e-mail (usado em `index` e em `pop.ConfigSistema`) |

Abas internas do `Pop Novo Chamado`: `Button L` "Protocolo" (bUDnh) e `Button M` "Histórico" (bUDnn). `Button M` some quando
`El[Pop Novo Chamado]:get_group_data:is_empty` (protocolo ainda não existe). No rodapé: `Button C` "Cancelar" (bUCtl), `Button D`
"Gravar" (bUCtr, visível só quando o popup está sem dado) e `Button Salvar` (bUDSr, visível só quando tem dado).

### 2.3 Parâmetros de URL

**Nenhum.** A página não lê nem escreve parâmetro de URL. Todo o estado (aba aberta, filtro, protocolo selecionado) é
`ShowElement`/`HideElement` e `DisplayGroupData` — some no F5 e não é linkável.

Fora da página, dois parâmetros importam para o módulo:
- `formularionps?id=<PesquisaRespostas._id>` — link enviado no e-mail de NPS (WF bUDcb).
- `formulariovenda?id=<GrupoCliFor._id>&pdd=<texto do vendedor>` — origem das respostas de Pós-Venda.

### 2.4 Estado customizado

- `coluna_respostas_` (boolean, na página). Ligado/desligado por `Switch B` (WFs bUDmF2 / bUDmN2). Controla a visibilidade da
  coluna "RESPOSTAS" em **duas** tabelas: `Column G` (bUDUp) de `Table B` (Gestão NPS) e `Column G` (bUEOT0) de `Table D`
  (Pós-Venda). Como o switch só existe na aba Gestão NPS, a coluna de notas do Pós-Venda só aparece se o usuário passar antes
  pela outra aba e ligar o switch.

---

## 3. Dados

### 3.1 Tabela de chamados — `tbl Chamados` (bUClt)

Base: todos os protocolos cujo `cpo.Ativo` está **vazio** (`Search(Tbl.SacProtocolo: cpo.Ativo is_empty)`), sem ordenação
declarada. Quatro condicionais **substituem a busca inteira** (não somam filtros), na ordem em que estão no mapa:

1. `Input A` preenchido → `Search(Tbl.SacProtocolo):filtered(QualGrupoCliFor:NomeCliFor em maiúsculas contém o texto digitado)`.
2. `dd status` preenchido → `Search(Tbl.SacProtocolo: QualStatusChamado = escolhido)`.
3. `dd prioridade` preenchido → `Search(Tbl.SacProtocolo: QualPrioridade = escolhido)`.
4. `CurrentUser:cpo.QualPerfil ≠ Diretor` → `Search(Tbl.SacProtocolo: cpo.QualResponsável = CurrentUser)`.

Consequências de fato, que a tela nova **não** deve reproduzir:
- Filtros não combinam: escolher status e prioridade juntos mostra só o resultado da prioridade.
- Nenhuma das quatro condicionais mantém `Ativo is_empty` → **chamados "excluídos" voltam a aparecer** assim que alguém digita
  no filtro, escolhe um status ou simplesmente não é Diretor.
- Como a condicional 4 é a última, para o não-Diretor as três primeiras nunca valem: **os filtros da barra não funcionam para
  ele**, e ele vê inclusive os chamados excluídos em que é responsável.

Colunas e coloração: PRIORIDADE pinta de vermelho (Alta), laranja (Média) e azul (Baixa); STATUS pinta os quatro valores de
`opt.StatusChamado` (Em aberto, Em análise, Pendente de informações, Resolvido).

### 3.2 Formulário do protocolo (`Pop Novo Chamado`)

| Campo | Elemento | Fonte |
|---|---|---|
| Nº do protocolo | `dd n° protocolo` (bUDLB0), desabilitado | `get_group_data:cpo.NumeroProtocoloNum`; quando o popup está vazio, mostra `Search(Tbl.SacProtocolo):last_element:cpo.NumeroProtocoloNum + 1` |
| Tipo de ocorrência | `dd ocorrencia` (bUDKJ0) | `All(Opt.TipoOcorrencia)` — 6 opções |
| Prioridade | `dd prioridade` (bUDKP0) | `All(opt.prioridade)` — 3 opções |
| Status | `dd status` (bUDLX0) | `All(opt.StatusChamado)` — 4 opções |
| Cliente ou fornecedor | `rad tipo clifor` (bUDLe0) | `All(opt.TipoCliFor)`; default = tipo do grupo do protocolo, ou "Cliente" se o popup estiver vazio |
| Nº do pedido | `dd pedido` (bUCrf), autocomplete | `Search(Tbl.Pedido; ignore empty)` por `cpo_numerocotacao_text` |
| Quais entregas | `dd entregas` (bUDKD0), multi | `El[dd pedido]:get_data:cpo.QuaisEntregas`, rotuladas "Dt Prev / Qtd / Nf" |
| Cliente/Fornecedor | `dd qualclifor` (bUCrI), autocomplete | `Search(Tbl.GrupoCliFor: cpo.Ativo = true)` por `cpo_nomecliente_text`; se o popup está vazio e há pedido escolhido, pré-carrega o cliente do pedido ou o fornecedor do primeiro orçamento do pedido, conforme o rádio |
| Qual filial | `dd qualfilial` (bUDLM0) | `Search(Tbl.EnderecosCliFor: cpo.QualGrupoCliFor = El[dd qualclifor])`, exibindo "NOME / CNPJ" |
| Responsável | `dd responsável` (bUDKV0) | `Search(User: cpo.Ativo = true; sort cpo.NomeModelo)` |
| Anexos | `ipt anexos` (bUCtX) | multi-upload, máx. 10 arquivos |
| Descrição | `ipt obs` (bUCtL) | obrigatório |

### 3.3 Interações do protocolo

`RepeatingGroup C` (bUDsj): `Search(Tbl.SacHistorico: cpo.QualProtocolo = El[Pop Novo Chamado]:get_group_data)`, **sem ordenação
declarada**. Cada linha mostra data/hora de criação, o texto, e o selo "Visível ao cliente" quando `cpo.VisivelCliente = true`.

Caixa de nova interação: `MultilineInput B` (bUDsx), toggle `tgg visivel cliente` (bUDuz) e, só quando o toggle está ligado,
o seletor `dd qual email` (bUECZ) — `Search(Tbl.GrupoCliFor: _id = protocolo:cpo.QualGrupoCliFor:_id):cpo.QuaisContatos`, exibindo
o `cpo.Email` de cada contato.

### 3.4 Relatórios

- `HTML B` (bUDGV) — "Volume por Tipo de Ocorrência" (Chart.js 4.4.1 por CDN). Seis barras, uma por opção de
  `Opt.TipoOcorrencia`, cada uma um `Search(Tbl.SacProtocolo):filtered(tipo = X):count` separado.
- `HTML A` (bUDGP, 9.409 caracteres) — conteúdo não exportado no mapa (ver Dúvida 1).
- `rpg sac protocolos (filtrar data)` (bUEDF) — `Search(Tbl.SacProtocolo)` **sem filtro nenhum**, oculto e sem uso. Apesar do
  nome, não filtra data.

### 3.5 Gestão NPS

- `dd pesquisa` (bUDQE): `Search(Tbl.PesquisaNps)`, rótulo `cpo.NomePesquisa`.
- Cards (ver 5): três `Search(Tbl.PesquisaRespostas: cpo.QualPesquisa = pesquisa escolhida)` com variações.
- `Table B` (bUCzL): `Search(Tbl.PesquisaRespostas: cpo.QualPesquisa = dd pesquisa)`. Condicional: `Input F` (bUEGb0, dentro do
  cabeçalho da coluna CLIENTE) preenchido → mesma busca com `:filtered(QualCliente:NomeCliFor contém o texto)`.
  Colunas: DATA (`Created Date`), CLIENTE, STATUS (`Button K`: "Sem resposta" / "Respondido" quando `cpo.Respondida = true`),
  contato + botão "Enviar Email" (`dd qual email contato` bUDcj + `col.Botoes` bUDVT), RESPOSTAS (Nota NPS e Observação,
  coluna condicionada a `coluna_respostas_`) e a lixeira `ico add retira contato` (bUEEL2).
- `rpg contatos` (bUEAF), oculto: `Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor = opt.TipoCliFor.Cliente):unique`.
- `rpg adicionar contatos` (bUDXv): pega a lista acima e filtra no navegador por
  `_id is_contained_by_list(Search(Tbl.Pedido: Modified Date ≥ hoje − 3 meses):cpo.QualCliente:_id)` — "clientes com pedido mexido
  nos últimos 90 dias". Condicional: `Input C` preenchido → `Search(Tbl.GrupoCliFor):unique:filtered(nome contém…)`, que **perde**
  tanto o filtro de tipo Cliente quanto o de 90 dias. Colunas: NOME, EMAIL (e-mails dos contatos separados por vírgula),
  TELEFONE e o botão de adicionar (`ico add retira contato` bUDZc). A linha fica cinza e o botão desabilitado quando o cliente
  já está na pesquisa selecionada (`_id is_contained_by_list(Search(PesquisaRespostas: QualPesquisa = dd pesquisa):QualCliente:_id)`).

### 3.6 Pós-Venda

`Table D` (bUEMt0): `Search(Tbl.PesquisaRespostas: cpo.TipoResposta = Opt.TipoPesquisa.Pós-Venda)`. Condicional: `Input G`
preenchido → `Search(Tbl.PesquisaRespostas: cpo.QualPesquisa = El[dd pesquisa]:get_data):filtered(nome do cliente contém…)`
— copiada da aba NPS: ao buscar, **perde o filtro de Pós-Venda** e passa a filtrar pela campanha NPS escolhida na outra aba
(normalmente vazia). Colunas: DATA, CLIENTE, QUAL VENDEDORA (`cpo.QualPedido:cpo.QualVendedor:cpo.NomeModelo`), STATUS,
RESPOSTAS (Nota NPS/Observação, condicionada a `coluna_respostas_`) e Nota Atendimento / Nota Produto / Observação.
`Input H` "QUAL VENDEDORA" (bUEoZ) está no cabeçalho mas **não filtra nada**.

### 3.7 Histórico de conversas (reusable `pop.HistoricoConversas`)

`Table A` (bTxuj): `Search(Tbl.Historico: cpo.QualCliente = Parent; sort Created Date desc)` — o cliente vem do
`get_group_data` do reusable. O cabeçalho mostra logo e nome do cliente. Cada linha mostra a foto de quem criou (com dois
fallbacks: avatar genérico quando não há vendedor, "usuário inativo" quando `Created By:cpo.Ativo = false`), datas de criação e
de modificação, a descrição e o vendedor. O bloco de edição `gp edita historico por cliente` (bTxvB) só aparece quando o cliente
é da carteira do usuário (`get_group_data:cpo.QualCarteira = CurrentUser`) **ou** o usuário é Diretor.

### 3.8 Respostas de e-mail (reusable `pop.RespostasEmails`)

`rpg RespostasEmails` (bUBvT) é uma Table alimentada **direto pela API do Gmail**: `apiconnector2.bUCHx.bUCHy` (`ListarMail`,
`GET https://gmail.googleapis.com/gmail/v1/users/me/messages`), com `q` vindo do multi-dropdown `Multidropdown A` (bUCDF) sobre
`All(Opt.FiltrosGmail)` (9 filtros: `is:sent`, `is:inbox`, `is:trash`, `is:spam`, `is:unread`, `is:read`, `newer_than:1d`,
`older_than:1y`, `from:mailer-daemon`), default = o primeiro. A tabela tem **10 linhas fixas**
(`fixed_number_repeating_axis_count=10`) e cada linha faz **uma chamada `LerMail` por célula** (`apiconnector2.bUCHx.bUCIK`,
`GET .../messages/[id]`) para obter `internalDate` e `labelIds` — a data é convertida com `plus_hours(-3)` chumbado.

---

## 4. Funcionalidades e regras de negócio

### 4.1 Trocar de aba

Quatro workflows idênticos em estrutura, cada um com `ToggleElement` na sua aba e `HideElement` nas outras três:
- WF bUDHE (`Button F` "Chamados"): ações bUDHJ, bUDHK (toggle Chamados), bUDHL, bUERl.
- WF bUDGm (`Button G` "Relatórios"): bUDGs (toggle Relatórios), bUDGx, bUDGz, bUERn.
- WF bUDHQ (`Button H` "Gestão NPS"): bUDHV, bUDHW, bUDHX (toggle NPS), bUERs.
- WF bUESK (`Button O` "Pós-Venda"): bUESP, bUESQ, bUESR, bUESV (toggle Pós-Venda).

É `Toggle`, não `Show`: clicar de novo na aba ativa esconde tudo e a tela fica em branco.

### 4.2 Abrir, fechar e navegar no protocolo

- **Novo chamado:** WF bUCtx, ação bUCuD — `ShowElement` no `Pop Novo Chamado` **sem limpar o dado anterior**; quem confia no
  reset do fechamento (WF bUDTP) fica bem, quem fechou por "Cancelar" (WF bUDKb0) não.
- **Abrir um chamado existente:** WF bUDMn0 no `col.Botoes` (bUDMa0) da linha — ação bUDMt0 mostra o popup e bUDMy0 faz
  `DisplayGroupData` com `Ancestor[TableCrossAxis]` (a linha clicada).
- **Fechar pelo X:** WF bUCwT, ação bUCwZ — só esconde.
- **Fechar por "Cancelar":** WF bUDKb0, ação bUDKh0 — só esconde, **sem reset**.
- **Popup fechado (evento nativo, qualquer forma):** WF bUDTP, ação bUDTV — `ResetGroup` no popup.
- **Aba "Histórico" dentro do popup:** WF bUDuJ (bUDuP mostra `Group HistoricoSac`, bUDuR esconde `Group Protocolo`).
- **Aba "Protocolo":** WF bUDud (bUDuj mostra `Group Protocolo`, bUDuo esconde `Group HistoricoSac`).

### 4.3 Filtrar a lista de chamados

Os filtros agem por condicional da tabela (3.1), sem workflow. "Limpar" é WF bUDNb, ação bUDNh: `ResetGroup` em `Group A`
(bUCjp), o grupo que contém os três controles.

Detalhe copiado errado: `dd status` (bUDNP) e `dd prioridade` (bUDNV) **da barra de filtros** têm como valor padrão
`El[Pop Novo Chamado]:get_group_data:cpo.QualStatusChamado` e `:Cpo.QualPrioridade` — ou seja, o filtro da lista nasce com o
status e a prioridade do protocolo aberto no popup.

### 4.4 Criar e editar protocolo

**Criar — WF bUDKj0 (`Button D` "Gravar"):**
1. Ação bUDKp0 — `NewThing Tbl.SacProtocolo` com: `cpo.Anexos`, `cpo.Descricao`, `cpo.QuaisEntregas`, `cpo.QualFilial`,
   `cpo.QualGrupoCliFor`, `cpo.QualPedido`, `Cpo.QualPrioridade`, `cpo.QualResponsável`, `cpo.QualStatusChamado`,
   `cpo.QualTipoOcorrencia` e `cpo.NumeroProtocoloNum = Search(Tbl.SacProtocolo):last_element:cpo.NumeroProtocoloNum + 1`.
2. Ação bUDLZ0 — toast "Criado com sucesso" (plugin 1658328157117).
3. Ação bUECh — `ResetGroup` no popup. 4. Ação bUECf — esconde o popup.
5. Ação bUECt — **SÓ SE** `ResultOfStep[bUDKp0]:cpo.QualStatusChamado = opt.StatusChamado.Em aberto` → grava
   `cpo.DataAberto = agora`.

Problemas a não repetir: a numeração é lida no navegador (`last_element + 1`, de uma busca sem ordenação) — duas abas abertas
geram o mesmo número; `cpo.Ativo` nasce vazio (é o que faz o registro aparecer na lista, ver 4.10); se o chamado for criado com
status diferente de "Em aberto", **`DataAberto` fica vazio para sempre**.

**Editar — WF bUDSx (`Button Salvar`):**
1. Ação bUDTF — `ChangeThing` nos mesmos 10 campos, sobre `El[Pop Novo Chamado]:get_group_data`.
2. Ação bUEAb3 — toast "Alterado com sucesso!". 3. bUEAd3 esconde o popup. 4. bUECm faz `ResetGroup`.
5. Ação bUECy — **SÓ SE** o status resultante for `Resolvido` → grava `cpo.DataFechado = agora`.
6. Ação bUEDD — grava `Cpo.TempoResolução = ResultOfStep[bUECy]:cpo.DataFechado − ResultOfStep[bUECy]:cpo.DataAberto`
   sobre `ResultOfStep[bUECy]`.

Observações: o passo 6 não tem condição, mas depende do resultado do passo 5 — quando o chamado não é resolvido,
`ResultOfStep[bUECy]` é vazio e o passo não grava nada. Quando é resolvido mas `DataAberto` está vazio (caso acima), o tempo de
resolução é calculado contra data vazia. Nada **desfaz** `DataFechado`/`TempoResolução` se o status voltar de "Resolvido" para
"Em aberto". O número do protocolo não é reescrito na edição (correto).

### 4.5 Registrar interação no protocolo — WF bUDth (`Button N` "Registrar")

1. Ação bUDtn — `NewThing Tbl.SacHistorico` com `cpo.DescricaoHistorico` (texto de `MultilineInput B`),
   `cpo.QualProtocolo = El[Pop Novo Chamado]:get_group_data` e `cpo.VisivelCliente = tgg visivel cliente`.
2. Ação bUDtz — toast "Registrado com sucesso!".
3. Ação bUDzl — **SÓ SE** `tgg visivel cliente = true` → `ScheduleAPIEvent` do backend `EnviarEmailsGeral` (bTnvb0) para
   `agora`, com `to = El[dd qual email]:get_data:cpo.Email`, `sender = "Megabox"`,
   `subject = "Atualização do seu atendimento – SAC"` e corpo contendo o nº do protocolo, o texto da interação e o status atual
   do chamado. **Sem `reply`** (ao contrário do e-mail de NPS, 4.9).
4. Ação bUECr — `ResetGroup` em `Group Nova interação`.

Não há validação de texto vazio nem de e-mail escolhido: com o toggle ligado e nenhum contato selecionado, o backend é agendado
com destinatário vazio.

### 4.6 Mostrar/ocultar a coluna de respostas

- WF bUDmF2 — evento do plugin toggle (1680110374647, `AAJ`) em `Switch B`, condição `This:get_AAI:is_true`; ação bUDmX2 grava
  `coluna_respostas_ = true` na página.
- WF bUDmN2 — mesmo evento, condição `is_false`; ação bUDnf grava `false`.

### 4.7 Criar campanha de pesquisa NPS

- **Abrir:** WF bUDPD (`Button E` "Nova Pesquisa NPS"), ação bUDPJ — mostra `pop novapesquisa`.
- **Fechar:** WF bUEAL (`Icon I`), ação bUEAR.
- **Gravar:** WF bUDPr (`btn gravar pesquisa nps`) — ação bUDPx faz `NewThing Tbl.PesquisaNps` com **só**
  `cpo.NomePesquisa = El[ipt titulo pesquisa]:get_data`; ação bUEAi3 esconde o popup.

O popup foi desenhado para mais do que faz: `Group KZ` (bUDOf) traz o toggle "Copiar contatos da última pesquisa"
(`tgg copia pesquisa` bUDOl), os campos "Última pesquisa" e "Qtd contatos" (`ipt ultima pesquisa` bUDOr/bUDOx, os dois vazios e
desabilitados) e o aviso "Aguarde, criando pesquisa! Não feche essa janela!" (`alerta criando pesquisa` bUDOX). Todo esse grupo
está **oculto ao carregar e nada o exibe** — a cópia de contatos nunca foi implementada.

### 4.8 Montar a lista de contatos da pesquisa

- **Adicionar** — WF bUDcQ, disparado pelo `ico add retira contato` (bUDZc) de `rpg adicionar contatos`:
  ação bUDcW faz `NewThing Tbl.PesquisaRespostas` com `cpo.QualCliente = Ancestor[TableCrossAxis]` (o cliente da linha) e
  `cpo.QualPesquisa = El[dd pesquisa]:get_data`; ação bUEEe2 dá o toast "Adicionado a lista de respostas com sucesso".
  O registro nasce **sem `cpo.TipoResposta`** e sem `cpo.Respondida = false` (fica vazio, que o Bubble lê como falso).
- **Remover** — WF bUEER2, disparado pelo `ico add retira contato` (bUEEL2) da `Table B`: ação bUEEX2 faz `DeleteThing` no
  `Ancestor[TableCrossAxis]` (a resposta) e bUEEZ2 dá o toast "Removido da lista de respostas com sucesso".
  **Apaga de verdade, sem confirmação**, inclusive uma resposta já preenchida pelo cliente.

Os dois elementos têm o mesmo nome (`ico add retira contato`), o que torna a leitura do mapa ambígua — ver Dúvida 3.

### 4.9 Disparar o e-mail da pesquisa NPS — WF bUDcb (`col.Botoes` bUDVT, "Enviar Email")

Ação única bUDzn: `ScheduleAPIEvent` do backend `EnviarEmailsGeral` (bTnvb0) para `agora`, com
`to = El[dd qual email contato]:get_data:cpo.Email`, `cc = ""`, `reply = CurrentUser:cpo.EmailContato`, `sender = "Megabox"`,
`subject = "Avaliação NPS - Megabox"` e corpo fixo da Ouvidoria contendo o link
`https://grupomegabox.bubbleapps.io/formularionps?id={Ancestor[TableCrossAxis]:_id}` — o `_id` da própria linha de
`Tbl.PesquisaRespostas`.

Não há registro de que o e-mail foi enviado (nem data, nem contador, nem status "convite enviado"): clicar duas vezes manda dois
e-mails e a tela não mostra diferença. O `dd qual email contato` não tem valor padrão — se o usuário não escolher o contato, o
e-mail vai para destinatário vazio.

**O que o cliente faz com o link** (página `formularionps`, fora do escopo desta tela, WF bUDhO): ao responder, o registro
apontado pelo `id` da URL recebe `cpo.NotaNps`, `cpo.CriticasSugestoes`, `cpo.Respondida = true` e
`cpo.TipoResposta = Opt.TipoPesquisa.NPS`. É isso que faz a linha virar "Respondido" na `Table B`.

### 4.10 Excluir chamado — três workflows no mesmo clique (`Icon V`, bUEFb2)

O ícone de lixeira da tabela de chamados dispara **três** workflows:
- WF bUEFh2, ação bUEFn2 — `ChangeThing cpo.Ativo = False` no `Ancestor[TableCrossAxis]`. É a exclusão lógica de fato: como a
  busca base pede `Ativo is_empty`, o registro some da lista (mas volta com qualquer filtro — ver 3.1).
- WF bUEFs2, ação bUEFy2 — `ChangeThing` no mesmo registro **sem nenhum campo**: só atualiza `Modified Date`. Inócuo.
- WF bUEGD2 — **sem ações**. Vazio.

Não há confirmação, não há registro de quem excluiu nem quando, e a ação não é restrita a Diretor.

### 4.11 Menu lateral — WF bUCuf

Condição `El[Reusable tool.Cabecalho]:custom.var_showmenu_:is_false`; ação bUCuh grava `var_showmenu_ = true`. É uma **cópia
solta** do WF bTIWB de `tool.Cabecalho`, que já trata o clique no mesmo `btn menu` (bTIVj) — e o par que fecha o menu
(WF bTIWw) não foi copiado. Não reproduzir: o cabeçalho já resolve.

### 4.12 Histórico de conversas por cliente (reusable `pop.HistoricoConversas`)

- **Fechar:** WF bTxve, ação bTxvj.
- **Criar anotação** — WF bTxvl, condição `El[gp edita historico por cliente]:get_group_data:is_empty` (linha em branco):
  ação bTxvq cria `Tbl.Historico` com `cpo.Descricao`, `cpo.QualCliente = get_group_data do reusable` e
  `cpo.QualVendedor = CurrentUser`; bTxvr reseta o grupo; bTxvv reseta os inputs; bTxvw grava
  `cpo.UltimoHistoricoData = agora` **no cliente** (`Tbl.GrupoCliFor`).
- **Editar anotação** — WF bTxwB, condição `get_group_data:is_not_empty`: ação bTxwD regrava `cpo.Descricao`, `cpo.QualCliente` e
  `cpo.QualVendedor = CurrentUser` (ou seja, **a edição rouba a autoria** para quem editou); bTxwH reseta o grupo.
  Aqui o `UltimoHistoricoData` do cliente **não** é atualizado — assimetria com o fluxo de criação.

### 4.13 Leitor de e-mails (reusable `pop.RespostasEmails`)

- WF bUBzD, ação bUBzE — fecha o reusable.
- WF bUBzW, ação bUBzX — `ToggleElement` na tabela `rpg RespostasEmails`; o ícone `Icon J` vira seta para cima quando a tabela
  está visível.

A lista em si não tem workflow: é a chamada de API renderizada direto na Table (ver 3.8 e 6).

---

## 5. Cálculos e valores

**Não há dinheiro nesta tela.** Os únicos números são notas de 0 a 10 e um intervalo de tempo. Ainda assim, todos devem ser
exatos no banco novo (`smallint` para notas, `numeric` para médias, `interval` para tempo — nunca `float`).

| O que | Fórmula literal no Bubble | Onde |
|---|---|---|
| Número do protocolo | `Search(Tbl.SacProtocolo):last_element:cpo.NumeroProtocoloNum + 1` | WF bUDKj0 ação bUDKp0 e `dd n° protocolo` bUDLB0 |
| Tempo de resolução | `cpo.DataFechado − cpo.DataAberto` (tipo `dateinterval`) | WF bUDSx ação bUEDD |
| "NPS Atual" (card `Text W` bUDBX) | `Search(PesquisaRespostas: QualPesquisa = pesquisa):count` | aba Gestão NPS |
| "Total de Respostas" (`Text X` bUDBz) | `Search(PesquisaRespostas: QualPesquisa = pesquisa AND Respondida = true):count` | aba Gestão NPS |
| "Média da Avaliação" (`Text Y` bUDCM) | `Search(…Respondida = true):cpo.NotaNps:sum ÷ Search(…Respondida = true):count`; condicional mostra "0" quando o resultado é vazio | aba Gestão NPS |
| Volume por tipo (gráfico) | um `Search(Tbl.SacProtocolo):filtered(tipo = X):count` por barra, 6 buscas | `HTML B` bUDGV |
| Data do e-mail lido | `Date(10800000):plus_seconds(internalDate):plus_hours(-3)` | `Text B` bUCBZ, reusable `pop.RespostasEmails` |

Erros de rótulo e de conta que a tela nova precisa corrigir:
- **"NPS Atual" não é NPS**: é a contagem de convites da campanha (respondidos ou não). O NPS de verdade é
  `%promotores (9–10) − %detratores (0–6)`.
- **"Média da Avaliação"** divide por zero quando ninguém respondeu; o Bubble devolve vazio e a condicional escreve "0".
- **O gráfico ignora o período** em 5 das 6 barras: só a barra "Falta de material" (opção `Pedido incompleto`) inclui a restrição
  `Created Date is_contained_by_list(El[dd data grafico]:get_AAe)`. E o filtro de data está num grupo que nunca aparece (2.1).
- O gráfico rotula a 4ª barra como "Falta de material", mas a opção de `Opt.TipoOcorrencia` se chama "Pedido incompleto"
  (slug `falta_de_material`). Só há 3 cores para 6 barras, e o eixo Y tem `max: 50` fixo — passando de 50 chamados de um tipo,
  a barra sai do gráfico.
- As buscas do gráfico não excluem chamados com `Ativo = false`.

---

## 6. Integrações e backend workflows

**`EnviarEmailsGeral` (bTnvb0)** — único backend usado pela página, agendado duas vezes (WF bUDth ação bUDzl; WF bUDcb ação
bUDzn). Aceita `to`, `cc`, `bcc`, `sender`, `reply`, `subject`, `body` e `anexo1..anexo10`. Internamente:
1. Ação bTnvd0 — `SendEmail` nativo (SendGrid; `usa SendGrid: True` em `integracoes.md`) **SÓ SE**
   `Tbl.ConfigSistema` com `CodigoConfig = 19` tiver `ValorBoolean1 = false`.
2. Ação bUBma — **SÓ SE** `ValorBoolean1 = true` → plugin SMTP (1752755029481) usando `Opt.Smtp.GmailMegabox`
   (`smtp`, `porta0`, `user`, **`senha`**, `security`).
3. Ação bUBmf — incrementa `cpo.ValorNumero` da mesma linha de config (contador de envios).

**API Gmail `LeituraGmail` (bUCHx)** — usada só pelo reusable `pop.RespostasEmails`:
`ListarMail` (bUCHy, `GET /gmail/v1/users/me/messages`, parâmetros `maxResults` e `q`), `LerMail` (bUCIK, `GET .../messages/[id]`),
`AbrirAnexo` (bUCTN), `ObterToken2` (bUCQn) e `RefreshToken2` (bUCRD) — os dois últimos em
`POST https://oauth2.googleapis.com/token` com `client_id`, `client_secret` e `refresh_token`.

**Páginas públicas que alimentam o módulo** (não são desta tela, mas o módulo depende delas):
- `formularionps` (bUDcp) — WF bUDhO grava nota NPS, comentário, `Respondida = true` e `TipoResposta = NPS` no registro apontado
  por `UrlParam("id")`.
- `formulariovenda` (ações bUEHr0 / bUEjf) — grava `NotaAtendimento`, `NotaProduto`, comentário, `Respondida = true`,
  `TipoResposta = Pós-Venda` e `cpo.QualVendedor` **como texto** (`UrlParam("pdd" as text)`), criando o registro se o cliente
  ainda não tiver um.

**Plugins usados na página:** 1658328157117 (toasts), 1680110374647 (toggle/switch: `Switch B`, `Switch Contatos`,
`tgg visivel cliente`, `tgg copia pesquisa`), 1648823245313 (date range `dd data grafico`), `multifileupload` (`ipt anexos`),
`select2` (`dd entregas`, `Multidropdown A`), `chartjs`/HTML com Chart.js 4.4.1 por CDN.

---

## 7. Segurança e privacidade

1. **As quatro tabelas do módulo estão sem regra de privacidade nenhuma** e todas marcadas "exposto na API":
   `Tbl.SacProtocolo`, `Tbl.SacHistorico`, `Tbl.PesquisaNps` e `Tbl.PesquisaRespostas` (`data-types.md`). O app expõe Data API e
   Workflow API (`integracoes.md`). `Tbl.GrupoCliFor` tem regra `everyone` com `view_all`, `search_for` e `view_attachments`.
   Na prática: reclamações de clientes, descrições de ocorrência, anexos, notas de NPS e críticas estão legíveis de fora.
2. **Página sem guarda.** Sem `PageLoaded`, sem checagem de perfil, sem redirecionamento de deslogado. `/sac` é aberto.
3. **Permissões só visuais.** Os campos ficam `disabled` para não-Diretor, mas Gravar, Salvar, Registrar, a lixeira e os botões de
   adicionar/remover contato não. Como o `disabled` é do navegador, nem ele é barreira real.
4. **Link de pesquisa sem token.** `formularionps?id=<_id da resposta>` é o único segredo. Com a Data API aberta, os `_id` de
   `Tbl.PesquisaRespostas` são listáveis — dá para responder pesquisa por qualquer cliente, em massa, e distorcer o NPS.
   Vale o mesmo para `formulariovenda?id=<_id do cliente>&pdd=<texto>`, onde o vendedor vem por parâmetro de texto.
5. **Segredo exposto.** `Opt.Smtp.GmailMegabox` guarda usuário e senha SMTP em option set (option sets vão inteiros para o
   navegador). O `client_secret` e o `refresh_token` do Gmail estão no API Connector do lado do cliente. Revogar as duas
   credenciais na migração e mover para variáveis de servidor (`SMTP_USER`, `SMTP_PASS`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REFRESH_TOKEN` em `.env`, nunca `NEXT_PUBLIC_`).
6. **Caixa de e-mail inteira no navegador.** O reusable `pop.RespostasEmails` lê `users/me/messages` com a conta da empresa e
   renderiza o corpo em dois blocos HTML — qualquer usuário que abra o popup vê a caixa toda, sem filtro por assunto ou cliente.
7. **Exclusão sem rastro.** A lixeira (WF bUEFh2) e o `DeleteThing` da resposta de pesquisa (WF bUEER2) não registram autor,
   data nem motivo; o `DeleteThing` é irreversível.
8. **Anexos públicos.** `ipt anexos` (até 10 arquivos por chamado) sobe para o CDN do Bubble com URL pública e permanente.
9. **Dados pessoais em tela:** e-mail e telefone de contatos de clientes, nome do responsável, foto do usuário, CNPJ das filiais,
   e o texto livre das reclamações.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto ou inócuo

- WF bUEGD2 (`Icon V`) — **sem nenhuma ação**.
- WF bUEFs2 (`Icon V`) — `ChangeThing` sem campos: só toca `Modified Date`.
- WF bUCuf (`btn menu`) — cópia do WF bTIWB de `tool.Cabecalho`, e sem o par que fecha o menu.
- `Popup B` (bUDNj) — popup vazio, sem workflow. `Link A` (bUDGJ) — link sem URL, sem texto e sem workflow.
- `rpg sac protocolos (filtrar data)` (bUEDF) — RG oculto que carrega **todos** os protocolos e não é lido por ninguém.
- `rpg contatos` (bUEAF) — RG oculto usado como "variável" para alimentar `rpg adicionar contatos`.
- Condicional `perfil = Diretor → is_visible=True` nos botões `Button G`, `Button H` e `Button O`: os botões já nascem visíveis,
  a condicional não esconde nada de ninguém.
- Grupo de filtros dos Relatórios `Group Y` (bUDEF), oculto ao carregar e sem nenhum workflow que o mostre — junto com ele ficam
  inalcançáveis o date range `dd data grafico` (bUDEQ, que o gráfico consulta) e o campo "Departamento" (`ipt.email` bUDHp).
- Campo "Buscar" da aba NPS (`ipt.email` bUDCX) e `Input H` "QUAL VENDEDORA" (bUEoZ) — não são lidos por nenhuma fonte de dados.
- `Group KZ` (bUDOf) do `pop novapesquisa` — toggle "Copiar contatos da última pesquisa", "Última pesquisa", "Qtd contatos" e o
  aviso "Não feche essa janela": tudo oculto, nunca exibido, nunca implementado.
- Ícones `IconAlterarEmail` e `IconCancel` (bUDMh0/bUDMf0 e bUDVa/bUDVV), ocultos, com `title` "Alterar e-mail do funcionário" —
  restos de outra tela.
- `Text EZ` (bUDIL) e `Text A` (bUBzz) — textos vazios em célula de tabela.
- `Tbl.PesquisaNps.cpo.QuaisRespostas` (lista) nunca é preenchido; a ligação real é `PesquisaRespostas.QualPesquisa`.
- `Tbl.SacProtocolo` tem 3 campos marcados como excluídos ainda no esquema: `cpo.TempoResolução` (versão `date`),
  `cpo.NumeroProtocoloText`, `cpo.QualEntrega` (substituído por `QuaisEntregas`).

### 8.2 Duplicação

- `dd status` e `dd prioridade` existem duas vezes cada (filtro bUDNP/bUDNV e formulário bUDLX0/bUDKP0), com o mesmo nome — e as
  do filtro herdam o valor do protocolo aberto.
- `ipt.email` é o nome de dois inputs diferentes (bUDHp nos Relatórios, bUDCX no NPS), e nenhum dos dois é e-mail.
- `ico add retira contato` nomeia dois elementos com efeitos opostos (bUDZc cria, bUEEL2 apaga); `col.Botoes` nomeia dois grupos
  com workflows diferentes (bUDMa0 abre o chamado, bUDVT manda e-mail).
- `Table B` (NPS) e `Table D` (Pós-Venda) são a mesma tabela com colunas trocadas — inclusive a condicional de busca do Pós-Venda
  foi copiada da do NPS e ficou errada (3.6).
- Os quatro workflows de aba (bUDGm, bUDHE, bUDHQ, bUESK) são o mesmo código quatro vezes.
- O card "Média da Avaliação" repete a mesma busca **quatro** vezes (duas no valor, duas na condicional).
- As seis barras do gráfico são seis buscas completas na tabela de protocolos, disparadas a cada render.

### 8.3 Gambiarras

- Numeração de protocolo por `last_element + 1` no navegador, sem ordenação e sem transação (4.4).
- Exclusão lógica por `Ativo = false` combinada com busca `Ativo is_empty`: funciona por acidente e vaza em todos os filtros (3.1).
- Filtros que **substituem** a busca em vez de somar restrições, com a regra de perfil como última condicional, anulando as outras.
- `TempoResolução` calculado em ação separada, dependente do `ResultOfStep` de uma ação condicional.
- `Date(10800000):plus_seconds(...):plus_hours(-3)` para converter a data do Gmail — fuso chumbado.
- Tabela do Gmail com 10 linhas fixas e uma chamada `LerMail` por célula (2 células × 10 linhas = 20 chamadas por abertura).
- `rpg adicionar contatos` cruzando a lista de clientes com todos os pedidos dos últimos 3 meses **no navegador**, e a coloração
  de cada linha fazendo mais uma busca em `PesquisaRespostas`.
- Corpo dos e-mails (texto, emojis, assinatura e a URL `grupomegabox.bubbleapps.io`) chumbado dentro da ação do workflow.

### 8.4 Otimizações para o banco novo

- **`sac_protocolos`** (de `tbl_sac`): `numero_protocolo` por `sequence`/`identity` do Postgres, com `unique`;
  `excluido_em timestamptz` + `excluido_por uuid` + `motivo` no lugar do `ativo boolean` de três estados (true/false/vazio);
  `aberto_em` preenchido sempre na criação, não condicionado ao status; `fechado_em` limpo por trigger quando o status sai de
  "resolvido".
- **`tempo_resolucao` vira coluna gerada / view** (`fechado_em - aberto_em`), nunca campo gravado à mão.
- **Option sets viram tabelas de domínio** com `codigo` estável: `sac_tipo_ocorrencia` (6), `sac_prioridade` (3),
  `sac_status_chamado` (4 — o id no Bubble é `opt_statuslure`, herança de outro app), `tipo_clifor` (2), `tipo_pesquisa` (3),
  `perfil_usuario` (4, com `hierarquia`), `gmail_filtros` (9, com a expressão `q`).
- **`sac_protocolo_entregas`** (tabela de ligação) no lugar da lista `cpo.QuaisEntregas`; **`sac_protocolo_anexos`** no lugar de
  `cpo.Anexos` (`list.file`), com nome original, tipo, tamanho e quem subiu; arquivos em bucket privado do Supabase Storage com
  URL assinada.
- **`sac_interacoes`** (de `tbl_sachistorico`) com `protocolo_id`, `visivel_cliente`, `criado_por`, `criado_em` e — novo —
  `email_enviado_em`, `email_destinatario`, `email_status`, para a tela poder mostrar se o cliente foi avisado.
- **`pesquisas`** (de `tbl_pesquisanps`) e **`pesquisa_respostas`** (de `tbl_pesquisaposvenda`) com FK `pesquisa_id`
  (some a lista `QuaisRespostas`); `token uuid` único e indexado no lugar do `_id` na URL do formulário, com `expira_em` e
  `respondida_em`; `convite_enviado_em` + `convites_enviados` para não mandar o mesmo e-mail duas vezes;
  `vendedor_id uuid` (FK para usuários) no lugar do texto `cpo.QualVendedor`; `pedido_id` preenchido no convite, para a coluna
  "Qual vendedora" do Pós-Venda funcionar; `unique (pesquisa_id, cliente_id)` para não duplicar convite.
- **Notas**: `smallint` com `check (nota between 0 and 10)`. Médias e NPS por **função SQL** (`fn_nps(pesquisa_id)` devolvendo
  promotores, neutros, detratores, nps e média em `numeric`), não por `sum ÷ count` no navegador.
- **Views**: `vw_sac_chamados_lista` (protocolo + cliente + pedido + responsável já resolvidos, para a tabela);
  `vw_sac_indicadores` (volume por tipo/status/prioridade e tempo médio de resolução por período, uma consulta no lugar das
  6 buscas do gráfico); `vw_clientes_pesquisaveis` (clientes ativos com pedido nos últimos 90 dias, hoje calculado no navegador).
- **Índices**: `(status)`, `(prioridade)`, `(tipo_ocorrencia)`, `(responsavel_id)`, `(grupo_clifor_id)`, `(pedido_id)`,
  `(aberto_em)`, `(excluido_em)`; trigram em `grupos_clifor.nome` para o filtro "contém"; em respostas,
  `(pesquisa_id, respondida)`, `(tipo_resposta, criado_em)` e `unique (token)`.
- **Histórico de conversas** (`tbl_historico`): FK `cliente_id`, `autor_id` **imutável** na edição (hoje a edição rouba a autoria)
  e `ultimo_historico_em` do cliente atualizado por trigger nos dois caminhos (hoje só a criação atualiza).
- **Leitor de Gmail**: sair da leitura direta no navegador. Sincronizar por rota de servidor (`/api/gmail/sync`) com o token
  guardado no servidor, gravando as mensagens numa tabela `emails_recebidos`, com paginação real no lugar das 10 linhas fixas.
- **Abas viram rotas** (`/sac/chamados`, `/sac/relatorios`, …) e filtros viram `searchParams` — hoje nada é linkável nem
  sobrevive ao F5.
- **RLS desde a primeira migration** nas tabelas do módulo: leitura de chamado para Diretoria/SAC e para o responsável;
  escrita conforme 9.3; respostas de pesquisa graváveis só pela rota pública que valida o token.

---

## 9. Proposta para o app novo

### 9.1 Rotas (App Router)

| Rota | O que é |
|---|---|
| `/sac` | redireciona para `/sac/chamados` |
| `/sac/chamados` | lista de protocolos; `searchParams`: `q`, `status`, `prioridade`, `responsavel`, `pagina` |
| `/sac/chamados/novo` | formulário de abertura (modal interceptado) |
| `/sac/chamados/[id]` | protocolo: aba `?aba=protocolo` (padrão) e `?aba=historico` |
| `/sac/relatorios` | indicadores; `searchParams`: `de`, `ate`, `tipo` |
| `/sac/pesquisas` | campanhas NPS; `searchParams`: `pesquisa`, `q` |
| `/sac/pesquisas/[id]/contatos` | montagem da lista de convidados |
| `/sac/pos-venda` | respostas do pós-venda; `searchParams`: `q`, `vendedor`, `de`, `ate` |
| `/pesquisa/[token]` | formulário público de NPS (substitui `formularionps?id=`) |
| `/clientes/[id]/conversas` | histórico de conversas (hoje `pop.HistoricoConversas`, na página `cadastros`) |

### 9.2 Componentes

- `SacTabs` — navegação por rota, sem toggle (corrige o "clicar de novo e sumir tudo").
- `ChamadosFiltros` — busca com debounce, selects de status/prioridade/responsável; escreve em `searchParams`, **combinando**.
- `ChamadosTabela` — server component paginado; `StatusBadge` e `PrioridadeBadge` com as cores de hoje.
- `ChamadoForm` — formulário com os 12 campos de 3.2; `PedidoAutocomplete`, `CliForAutocomplete`,
  `EntregasMultiSelect` (dependente do pedido), `FilialSelect` (dependente do cliente).
- `ChamadoAnexos` — upload para Supabase Storage privado, máx. 10 arquivos, com validação de tipo e tamanho.
- `InteracaoForm` + `InteracaoTimeline` — texto, toggle "visível ao cliente", seletor de contato **obrigatório quando o toggle
  está ligado**, e selo "e-mail enviado em …".
- `ConfirmarExclusao` — diálogo com motivo, hoje inexistente.
- `NpsCards` (NPS real, total de convites, respondidos, média), `NpsRespostasTabela`, `NovaPesquisaDialog`,
  `ContatosPesquisaPicker` (lista já filtrada no servidor, com estado "já convidado").
- `RelatoriosCharts` — gráficos com dados vindos de `vw_sac_indicadores`, respeitando o período (sem Chart.js por CDN dentro de
  bloco HTML).
- `ConversasCliente` — lista + edição de anotações, com a regra de carteira/Diretor de 3.7.

### 9.3 Server actions

| Ação | Faz | Quem pode |
|---|---|---|
| `criarChamado` | insere em `sac_protocolos`, número por sequence, `aberto_em = now()` | SAC e Diretoria |
| `atualizarChamado` | atualiza campos; ao entrar em "resolvido" grava `fechado_em`; ao sair, limpa | Diretoria; responsável só status e descrição (ver Dúvida 5) |
| `excluirChamado` | grava `excluido_em`, `excluido_por`, `motivo` | Diretoria |
| `registrarInteracao` | insere em `sac_interacoes`; se `visivel_cliente`, enfileira o e-mail e grava `email_enviado_em` | SAC e Diretoria |
| `criarPesquisa` | insere em `pesquisas` (e, se pedido, copia os convidados da última — ver Dúvida 6) | Diretoria |
| `adicionarConvidado` / `removerConvidado` | insere/remove em `pesquisa_respostas` com `token` gerado; remoção bloqueada se já respondida | Diretoria |
| `enviarConvitePesquisa` | enfileira o e-mail com o link `/pesquisa/[token]`, grava `convite_enviado_em` e incrementa `convites_enviados` | Diretoria |
| `responderPesquisa` | rota pública validando `token` não expirado e ainda não respondido | qualquer um com o token |
| `salvarConversaCliente` | insere/atualiza `cliente_conversas`, preservando o autor original | dono da carteira ou Diretoria |

Envio de e-mail: uma rota de servidor (`/api/email/enviar`) com fila e retry, template versionado (assunto, corpo, assinatura
"Ouvidoria – Grupo Megabox") e log por mensagem — substitui o `ScheduleAPIEvent` de `EnviarEmailsGeral` com o corpo chumbado.

### 9.4 Consultas / views SQL

- `vw_sac_chamados_lista` — protocolo com cliente, filial, pedido, responsável e rótulos já resolvidos; filtra `excluido_em is null`.
- `vw_sac_indicadores(de, ate)` — volume por tipo, por status e por prioridade; tempo médio e mediano de resolução; backlog aberto.
- `fn_nps(pesquisa_id)` — promotores, neutros, detratores, `nps numeric`, `media numeric`, total de convites e de respostas.
- `vw_clientes_pesquisaveis` — clientes ativos com pedido nos últimos 90 dias, já marcando quem está numa pesquisa dada.
- `vw_pos_venda_respostas` — respostas de pós-venda com pedido, vendedor (FK) e notas.

### 9.5 Tabelas envolvidas

Do módulo: `sac_protocolos`, `sac_protocolo_entregas`, `sac_protocolo_anexos`, `sac_interacoes`, `pesquisas`,
`pesquisa_respostas`, `cliente_conversas` (de `tbl_historico`), `emails_recebidos` (novo, do leitor de Gmail) e
`email_envios` (log).
De fora: `usuarios` (`User`), `grupos_clifor` (`Tbl.GrupoCliFor`), `clifor_contatos` (`Tbl.ContatoCliFor`),
`clifor_enderecos` (`Tbl.EnderecosCliFor`), `pedidos` (`Tbl.Pedido`), `entregas` (`Tbl.Entregas`),
`config_sistema` (`Tbl.ConfigSistema` — código 19 e o controle de acesso ao menu).
Tabelas de domínio: `sac_tipo_ocorrencia`, `sac_prioridade`, `sac_status_chamado`, `tipo_pesquisa`, `tipo_clifor`, `perfil_usuario`.

---

## 10. Dúvidas

1. **[DÚVIDA]** O conteúdo de `HTML A` (bUDGP, 9.409 caracteres) não foi exportado no mapa. Que indicador ele mostra?
   *Recomendação:* conferir no editor Bubble antes de construir a aba Relatórios; até lá, montar o painel com volume por tipo,
   por status, por prioridade e tempo médio de resolução, todos vindos de `vw_sac_indicadores` e respeitando o período.
2. **[DÚVIDA]** O filtro de período e o campo "Departamento" dos Relatórios estão num grupo que nunca aparece, e o gráfico só
   aplica o período numa das 6 barras. O filtro deveria estar visível?
   *Recomendação:* sim — expor período (padrão: mês corrente) e aplicar a **todos** os números. "Departamento" não tem campo
   correspondente em `Tbl.SacProtocolo`; trocar por filtro de responsável e de tipo de ocorrência.
3. **[DÚVIDA]** Dois elementos chamados `ico add retira contato` (bUDZc e bUEEL2) e dois `col.Botoes` (bUDMa0 e bUDVT): o mapa
   não diz qual workflow está em qual. A leitura adotada (bUDcQ→bUDZc, bUEER2→bUEEL2, bUDMn0→bUDMa0, bUDcb→bUDVT) vem do
   texto dos toasts e do tipo do `Ancestor`.
   *Recomendação:* adotar essa leitura e confirmar no editor antes do corte.
4. **[DÚVIDA]** A lixeira do chamado grava `Ativo = false`, mas a lista busca `Ativo is_empty` e os filtros não repetem a
   restrição. Excluídos devem sumir sempre?
   *Recomendação:* sim — `excluido_em is null` na view, valendo para todos os filtros, e um filtro explícito "mostrar excluídos"
   só para Diretoria.
5. **[DÚVIDA]** Só Diretor edita o chamado (todos os campos ficam `disabled`), mas os botões Gravar/Salvar/Registrar/Excluir não
   são bloqueados. Qual é a regra real? Um analista do SAC deve poder abrir chamado e registrar interação?
   *Recomendação:* perfil Diretor e um novo papel "SAC" podem abrir chamado e registrar interação; o responsável pode mudar
   status e registrar interação nos seus chamados; excluir só Diretoria. Validar tudo em server action + RLS.
6. **[DÚVIDA]** "Copiar contatos da última pesquisa" está desenhado e nunca foi ligado. Manter?
   *Recomendação:* manter, é útil — ao criar a campanha, oferecer copiar os convidados da última pesquisa, feito numa única
   instrução SQL.
7. **[DÚVIDA]** "NPS Atual" mostra a contagem de convites, não o NPS.
   *Recomendação:* trocar por quatro cards — Convites, Respondidos, NPS (`%9–10 − %0–6`) e Nota média — via `fn_nps`.
8. **[DÚVIDA]** Remover um contato da pesquisa apaga o registro de verdade (WF bUEER2), inclusive respostas já dadas.
   *Recomendação:* bloquear a remoção quando `respondida = true`; para não respondidas, exclusão lógica.
9. **[DÚVIDA]** A coluna "QUAL VENDEDORA" do Pós-Venda lê `QualPedido:QualVendedor:NomeModelo`, mas `formulariovenda` grava
   `cpo.QualVendedor` como **texto** e nunca preenche `QualPedido` — a coluna é sempre vazia.
   *Recomendação:* gravar `pedido_id` e `vendedor_id` no convite e ler dali; migrar o texto atual por casamento de nome, com
   relatório dos que não casarem.
10. **[DÚVIDA]** A busca por cliente na aba Pós-Venda troca o filtro `TipoResposta = Pós-Venda` por `QualPesquisa = dd pesquisa`.
    Bug ou intenção?
    *Recomendação:* tratar como bug — a busca deve somar ao filtro de tipo, não substituí-lo.
11. **[DÚVIDA]** Não há registro de convite enviado: clicar duas vezes em "Enviar Email" manda dois e-mails.
    *Recomendação:* gravar `convite_enviado_em`/`convites_enviados`, mostrar a data na linha e pedir confirmação no reenvio.
12. **[DÚVIDA]** O link da pesquisa usa o `_id` do registro, sem token e sem prazo, com a Data API aberta.
    *Recomendação:* `token uuid` único, prazo de 30 dias e um uso; rota pública validando o token.
13. **[DÚVIDA]** `cpo.DataAberto` só é gravado quando o chamado nasce "Em aberto"; chamados criados em outro status ficam sem
    data de abertura e com tempo de resolução calculado contra vazio.
    *Recomendação:* gravar `aberto_em = now()` sempre na criação e recalcular o tempo por coluna gerada.
14. **[DÚVIDA]** Nada desfaz `DataFechado`/`TempoResolução` quando o status volta de "Resolvido" para aberto.
    *Recomendação:* limpar `fechado_em` por trigger ao sair do status "resolvido".
15. **[DÚVIDA]** O leitor de Gmail (`pop.RespostasEmails`) mostra a caixa inteira da conta da empresa a quem abrir o popup, e o
    filtro é uma expressão `q` crua do Gmail. Quem deveria ver isso, e para quê?
    *Recomendação:* restringir à Diretoria e ao SAC, sincronizar no servidor, e ligar cada mensagem ao cliente/protocolo pelo
    remetente, em vez de expor a caixa toda.
16. **[DÚVIDA]** A edição de anotação em `pop.HistoricoConversas` (WF bTxwB) sobrescreve `cpo.QualVendedor` com quem editou, e
    não atualiza `UltimoHistoricoData` do cliente (a criação atualiza).
    *Recomendação:* manter o autor original, gravar `editado_por`/`editado_em` e atualizar `ultimo_historico_em` nos dois casos.
17. **[DÚVIDA]** O item de menu `Opt.MenuPaginas."Suporte de Vendas & Nps"` não tem `hierarquia` nem
    `DepartamentosAcessiveis`, ao contrário dos outros. Foi esquecimento?
    *Recomendação:* tratar como esquecimento e exigir perfil SAC/Diretoria, com a checagem no servidor.
18. **[DÚVIDA]** Não há ordenação declarada nem na tabela de chamados nem na lista de interações.
    *Recomendação:* chamados por prioridade desc + `aberto_em` desc; interações por `criado_em` asc (conversa), com paginação.

---

## 11. Cobertura — todos os 27 workflows da página `sac`

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bUCtx | Clique `Button A` "Novo Chamado" | mostra `Pop Novo Chamado` (sem limpar) | 4.2 |
| 2 | bUCuf | Clique `btn menu` (do cabeçalho) | abre o menu lateral — cópia do WF bTIWB de `tool.Cabecalho` | 4.11 / 8.1 |
| 3 | bUCwT | Clique `Icon A` (X do popup) | esconde `Pop Novo Chamado` | 4.2 |
| 4 | bUDGm | Clique `Button G` "Relatórios" | alterna a aba Relatórios, esconde as outras três | 4.1 |
| 5 | bUDHE | Clique `Button F` "Chamados" | alterna a aba Chamados, esconde as outras três | 4.1 |
| 6 | bUDHQ | Clique `Button H` "Gestão NPS" | alterna a aba Gestão NPS, esconde as outras três | 4.1 |
| 7 | bUESK | Clique `Button O` "Pós-Venda" | alterna a aba Pós-Venda, esconde as outras três | 4.1 |
| 8 | bUDNb | Clique `Button B` "Limpar" | `ResetGroup` na barra de filtros (`Group A`) | 4.3 |
| 9 | bUDKj0 | Clique `Button D` "Gravar" | cria `Tbl.SacProtocolo`, numera por `last_element+1`, grava `DataAberto` se status = Em aberto | 4.4 |
| 10 | bUDSx | Clique `Button Salvar` | atualiza o protocolo, grava `DataFechado` se Resolvido e calcula `TempoResolução` | 4.4 |
| 11 | bUDKb0 | Clique `Button C` "Cancelar" | esconde o popup sem resetar | 4.2 |
| 12 | bUDTP | `PopupClosed` em `Pop Novo Chamado` | `ResetGroup` no popup | 4.2 |
| 13 | bUDMn0 | Clique `col.Botoes` (bUDMa0, "Detalhes") | mostra o popup com o protocolo da linha | 4.2 |
| 14 | bUDud | Clique `Button L` "Protocolo" | mostra `Group Protocolo`, esconde `Group HistoricoSac` | 4.2 |
| 15 | bUDuJ | Clique `Button M` "Histórico" | mostra `Group HistoricoSac`, esconde `Group Protocolo` | 4.2 |
| 16 | bUDth | Clique `Button N` "Registrar" | cria `Tbl.SacHistorico` e, se "visível ao cliente", agenda o e-mail de atualização | 4.5 |
| 17 | bUDmF2 | `Switch B` ligado (plugin 1680110374647) | `coluna_respostas_ = true` | 4.6 |
| 18 | bUDmN2 | `Switch B` desligado | `coluna_respostas_ = false` | 4.6 |
| 19 | bUDPD | Clique `Button E` "Nova Pesquisa NPS" | mostra `pop novapesquisa` | 4.7 |
| 20 | bUDPr | Clique `btn gravar pesquisa nps` | cria `Tbl.PesquisaNps` só com o título e fecha o popup | 4.7 |
| 21 | bUEAL | Clique `Icon I` | esconde `pop novapesquisa` | 4.7 |
| 22 | bUDcQ | Clique `ico add retira contato` (bUDZc) | cria `Tbl.PesquisaRespostas` (cliente + pesquisa) e avisa | 4.8 |
| 23 | bUEER2 | Clique `ico add retira contato` (bUEEL2) | `DeleteThing` na resposta e avisa | 4.8 |
| 24 | bUDcb | Clique `col.Botoes` (bUDVT, "Enviar Email") | agenda `EnviarEmailsGeral` com o link `formularionps?id=…` | 4.9 |
| 25 | bUEFh2 | Clique `Icon V` (lixeira) | `cpo.Ativo = False` no chamado da linha | 4.10 |
| 26 | bUEFs2 | Clique `Icon V` (lixeira) | `ChangeThing` **sem campos** — inócuo | 4.10 / 8.1 |
| 27 | bUEGD2 | Clique `Icon V` (lixeira) | **workflow vazio, sem ações** | 4.10 / 8.1 |

Total: **27 workflows**, igual a `mapa/00-inventario.md` (`sac`: 378 elementos · 27 workflows · 56 ações · 103 condicionais ·
3 popups · 3 RGs · 4 tabelas · 2 HTML). As 56 ações estão todas citadas nas seções 4.1 a 4.11.

### Cobertura dos reusables do módulo

| # | WF | Reusable | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|---|
| 1 | bTxve | `pop.HistoricoConversas` | Clique `Icon A` | esconde o reusable | 4.12 |
| 2 | bTxvl | `pop.HistoricoConversas` | Clique `btn grava historico individual` (linha em branco) | cria `Tbl.Historico` e atualiza `UltimoHistoricoData` do cliente | 4.12 |
| 3 | bTxwB | `pop.HistoricoConversas` | Clique `btn grava historico individual` (linha existente) | regrava a anotação e sobrescreve o autor | 4.12 |
| 4 | bUBzD | `pop.RespostasEmails` | Clique `Icon A` | esconde o reusable | 4.13 |
| 5 | bUBzW | `pop.RespostasEmails` | Clique `gp toggle rpgemails` | alterna a tabela `rpg RespostasEmails` | 4.13 |

Bate com `00-inventario.md`: `pop.HistoricoConversas` 3 WF / 7 ações; `pop.RespostasEmails` 2 WF / 2 ações.
