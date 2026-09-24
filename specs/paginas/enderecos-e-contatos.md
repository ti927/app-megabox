# Spec funcional — grupo de reusables "Endereços e contatos"

Fonte: `mapa/reusable-pop.AgendaEnderecos.md` (bTPJL — 191 el · 22 WF · 55 ações · 109 cond · 6 estados),
`mapa/reusable-pop.AddEditaEndereço.md` (bTxcQ — 164 el · 20 WF · 57 ações · 100 cond · 5 estados),
`mapa/reusable-pop.AgendaContatos.md` (bTPQa0 — 52 el · 6 WF · 13 ações · 20 cond · 2 estados),
`mapa/reusable-pop.AddEditaContato.md` (bTxnz — 30 el · 4 WF · 14 ações · 15 cond · 2 estados),
`mapa/reusable-tool.EnderecoCobranca.md` (bTbWm — 6 el · 3 WF · 3 ações · 2 cond),
`mapa/reusable-tool.EnderecoEntrega.md` (bTbjh — 6 el · 3 WF · 3 ações · 2 cond),
`mapa/reusable-tool.EnderecoFornecedor.md` (bThmz1 — 6 el · 3 WF · 3 ações · 1 cond).
Total: **61 workflows**.

Apoio: `data-types.md` (Tbl.EnderecosCliFor, Tbl.ContatoCliFor, Tbl.GrupoCliFor, Tbl.IcmsEstados,
Tbl.OrcFornecedoresCotacao), `option-sets.md`, `backend-workflows.md` (`copiainfoaddparafilial` bTmQp,
`copiainfoaddparafilial_copy` bTnzH1, `CopiarEndereçosOrcamentoParaContasReceber` bToWv0,
`AdicionarFornecedores` bTNrd, `CalculaFornecedoresLista` bTPFh), `integracoes.md`, e as páginas/reusables
que os hospedam (`pagina-vendas.md`, `pagina-cadastros.md`, `pagina-financeiro.md`,
`reusable-pop.CadastroCliFor.md`, `reusable-tool.Cabecalho.md`, `reusable-pop.DuplicarPedido.md`,
`reusable-pop.EditaContasReceberNew.md`).

**Se esta spec e o mapa discordarem, o mapa manda.**

Glossário:
- **Grupo CliFor** = `Tbl.GrupoCliFor` (`tbl_clientes`): a pessoa jurídica "guarda-chuva" (cliente **ou**
  fornecedor, conforme `cpo.QualTipoCliFor`). Não tem endereço próprio.
- **Endereço / filial** = `Tbl.EnderecosCliFor` (`tbl_enderecosclifor`): é ao mesmo tempo o **endereço** e o
  **CNPJ/filial**. Razão social, inscrições, regime tributário, CEP, UF e geolocalização ficam aqui, não no
  grupo. É este registro que o pedido referencia como origem, destino e cobrança.
- **Contato** = `Tbl.ContatoCliFor` (`tbl_contatoclifor`): pessoa (nome, telefone, e-mail, cargo) ligada ao
  grupo e, opcionalmente, a um endereço.
- **Destravar campos** = botão que habilita os inputs do cadastro de endereço, que nascem `disabled=True`.

---

## 1. Propósito e quem usa

Sete componentes reutilizáveis que cobrem todo o cadastro de endereços/filiais e de contatos de clientes e
fornecedores, e a escolha desses endereços dentro de um orçamento:

| Reusable | Papel |
|---|---|
| `pop.AgendaEnderecos` (bTPJL) | Painel "Catálogo de Endereços": lista as filiais do grupo e edita/cria filial **e** o próprio grupo. Serve também de tela de **novo cliente** e **novo fornecedor** (cria grupo + primeira filial numa tacada). |
| `pop.AddEditaEndereço` (bTxcQ) | **Clone popup** do anterior, sem a lista de filiais. Usado pela página `cadastros`. |
| `pop.AgendaContatos` (bTPQa0) | "Catálogo de Contatos": lista os contatos do grupo e cria/edita contato. |
| `pop.AddEditaContato` (bTxnz) | **Clone popup** do anterior, sem a lista de contatos. Usado pela página `cadastros`. |
| `tool.EnderecoCobranca` (bTbWm) | Botão + lista suspensa que escolhe o **endereço de faturamento do cliente** numa linha de orçamento-fornecedor. |
| `tool.EnderecoEntrega` (bTbjh) | Idem, para o **endereço de entrega do cliente**. |
| `tool.EnderecoFornecedor` (bThmz1) | Idem, para o **endereço de origem (filial do fornecedor)**. |

**Quem abre cada um** (os três `tool.*` não são abertos: ficam embutidos na linha da tabela de orçamento):

| Hospedeiro | O que abre | Workflows |
|---|---|---|
| `pagina-vendas` (instância `pop.AgendaEnderecos A` bTPNO) | Agenda de endereços | bTPQO, bTcbO, bTcjZ, bTeiV, bTfLG, bTzcV0 (listar/editar) · bTeyi (Novo Cliente) · bThVe (Novo Fornecedor) |
| `pagina-vendas` (instância `pop.AgendaContatos A` bTPVF0) | Agenda de contatos | bTPJB, bTbnk, bTcZi, bTfAN, bTfAV |
| `pagina-vendas` (linhas do orçamento) | os três `tool.Endereco*` | embutidos: bThnd1 (fornecedor), bTbkL (entrega), bTbYF (cobrança) |
| `pagina-cadastros` | `pop.AddEditaEndereço A` (bUCbH0) e `pop.AddEditaContato A` (bUCbM0) | bUCcZ0, bUCcf0, bUCcl0, bUCcr0 · bUCdE0, bUCdL0 |
| `pagina-financeiro` | Agenda de contatos (escolher e-mails do fornecedor) | bTpUT, bTrNb |
| `reusable-tool.Cabecalho` | Agenda de endereços e de contatos | instâncias bTeHt / bTeHn |
| `reusable-pop.CadastroCliFor` | Agenda de endereços e de contatos | bTguM, bTguY, bTgvh, bTgxA · bTgvC, bTgvZ |
| `reusable-pop.DuplicarPedido` | Agenda de endereços | bUAMz |
| `reusable-pop.EditaContasReceberNew` | Agenda de contatos | bTsKw, bTsLD |

**Perfis:** vendedores (montando cotação/pedido), Comercial e Financeiro (cadastro), Diretoria/Gerência
(destravar campos de fornecedor). `Opt.PerfilUsuario` = Diretor(1), Gerente(2), Analista(3), Operador(4);
`Opt.DeptoUsuario` = Administrativo, Financeiro, Comercial, Operação.

### Controle de acesso de fato (só no navegador)

Não há verificação de servidor em lugar nenhum. Tudo o que existe é condicional de elemento:

- **`pop.AgendaEnderecos`**
  - `btn novo endereço cliente` (bTPNs) nasce `button_disabled=True` e só libera se o grupo for **Cliente**
    (`cpo.QualTipoCliFor = Cliente`) **ou** se `CurrentUser.QualPerfil.hierarquia ≤ 2` **ou**
    `CurrentUser.QualDepto = Financeiro`. Na prática: fornecedor só ganha filial nova por Diretor, Gerente ou
    Financeiro.
  - `Button E` "Destravar Campos" (bTmOH0): mesma regra, com `hierarquia ≤ 2`.
- **`pop.AddEditaEndereço`**: `Button E` (bTxef) usa **`hierarquia ≤ 3`** — o clone é mais permissivo que o
  original (Analista destrava aqui e não lá). Divergência, ver §8.3.
- **`pop.AgendaContatos` / `pop.AddEditaContato`**: **nenhuma** restrição. Qualquer usuário logado cria, edita
  e inativa contato de qualquer cliente ou fornecedor.
- **`tool.Endereco*`**: **nenhuma** restrição. Qualquer usuário que enxergue a linha do orçamento troca origem,
  destino e cobrança — o que muda a alíquota de ICMS e a distância (§5).
- As privacy rules do Bubble são `everyone` com `view_all` e `search_for` em `Tbl.EnderecosCliFor`,
  `Tbl.ContatoCliFor` e `Tbl.GrupoCliFor`, e `auto_binding` liberado para qualquer usuário logado em
  `cpo_ativo_boolean` (e também em `cpo_bloqueado_boolean`, `cpo_bloqueadomotivo_text`,
  `cpo_qualregimetributario_*` e `cpo_qualgrupoclifor_*` nos endereços). Ou seja: **o banco está aberto** e os
  switches "Ativo" escrevem direto, sem workflow.

---

## 2. Estrutura

### 2.1 `pop.AgendaEnderecos` (bTPJL)

Painel de tela inteira (não é popup: fecha com `HideElement`), em faixas:

1. **Cabeçalho** `Group O` (bTeMf): título `Text A` (bTPJN), que muda conforme `var_a__oclifor_` — "Catálogo de
   Endereços" / "Novo endereço do {tipo}" / "Edita endereço do {tipo}" / "Novo Cliente" / "Novo Fornecedor" —
   e `ico fechar` (bTeMZ).
2. **Bloco do grupo** `gp qual grupo clifor` (bTPJT), alimentado por `var_qualgrupoclifor_`: logo
   (`upi novocliente logo` bTPJZ, com imagem-placeholder quando vazia), link de busca do logo no Google Imagens
   (`Link A` bTeLL), nome (`ipt nome grupoclifor` bTPJY), **Captação** (`dd captacao` bTrmT) e **Carteira**
   (`dd carteira` bTeKx, todos os `User`) — os dois escondidos quando o grupo é Fornecedor —, toggle
   **Grupo ativo** (`tgg grupoativo` bTmVn) e `btn novo endereço cliente` (bTPNs).
3. **Abas** `gp tabs` (bTkGS): "Informações de Cadastro" (`Text O` bTkGX) e "Informações Adicionais"
   (`Text N` bTkGF), que mostram/escondem `show dados cadastrais` (bTkGZ) e `show dados adicionais` (bTkFu).
4. **Formulário da filial** `gp dados endereco clifor` (bTPPS), alimentado por `var_qualendereco_`, visível só
   quando `var_a__oclifor_` é Novo Endereço, Edita Endereço ou Novo Cliente. Campos em §2.3.
5. **Aviso de CNPJ repetido** `gp alerta cnpj existente` (bTiBg) — §4.4.
6. **Botões** `gp buttons` (bTPLt): `btn gravar novo endereço` (bTPLz, visível nos modos "Novo *"),
   `btn salvar endereco` (bTPPp, visível em Edita Endereço) e `btn cancela endereco` (bTPLv).
7. **Lista de filiais** `rpg enderecos clifor` (bTPNT) — §3.1.

**Contrato de entrada** (o hospedeiro *não* usa `Display data`; escreve estados customizados):

| Estado | Tipo | Quem escreve | Para quê |
|---|---|---|---|
| `var_qualgrupoclifor_` | Tbl.GrupoCliFor | hospedeiro (vendas bTPQO/bTcbO/bTcjZ/bTeiV/bTfLG/bTzcV0; CadastroCliFor bTgxA; DuplicarPedido bUAMz) | **obrigatório**: sem ele a lista some e a gravação fica sem dono |
| `var_a__oclifor_` | Opt.AçãoCliFor | hospedeiro (Novo Cliente: vendas bTeyi, CadastroCliFor bTguM; Novo Fornecedor: vendas bThVe, CadastroCliFor bTguY) ou WF interno | decide título, visibilidade do formulário e **qual** WF de gravação dispara |
| `var_qualendereco_` | Tbl.EnderecosCliFor | interno (bTPOJ, bTiCY) ou hospedeiro (CadastroCliFor bTgvh) | filial em edição |
| `var_destravarcampos_` | boolean | hospedeiro (bTguM, bTguY) ou `Button E` | habilita os inputs |
| `var_quaisprodutos_` | lista de Tbl.ProdutosModelo | interno (bTmMd, bTmNR) | produtos do fornecedor **antes** de a filial existir |

**Contrato de saída:** grava direto em `Tbl.EnderecosCliFor` e `Tbl.GrupoCliFor` (§4). Devolve ao hospedeiro
`var_recemcadastrado_` (Tbl.GrupoCliFor), setado na ação bTezX (WF bTeKD) quando um **cliente novo** é criado;
a página `vendas` lê esse estado para já selecionar o cliente recém-criado no autocomplete
(`pagina-vendas.md:1032`) e depois o limpa (ação bTezY).

**Condicionais que importam:** todos os inputs do formulário nascem `disabled=True` e só ficam editáveis com
`var_destravarcampos_ = true`; o toggle "filial ativa" (bTmVL0) vem marcado por padrão em Novo Cliente / Novo
Fornecedor / Novo Endereço; o bloco "esquerda" das informações adicionais só aparece para **cliente** e o bloco
"direita" (produtos) só para **fornecedor**.

### 2.2 `pop.AddEditaEndereço` (bTxcQ)

Popup com **o mesmo formulário**, elemento por elemento (`Group O` bTxih, `gp qual grupo clifor` bTxiu,
`gp tabs` bTxig, `gp dados endereco clifor` bTxcP, `gp alerta cnpj existente` bTxfD, `gp buttons` bTxet).
Diferenças reais em relação ao 2.1:

- **Não tem** a lista `rpg enderecos clifor` nem o `btn novo endereço cliente`: quem lista é a página
  `cadastros`.
- **Não tem** o estado `var_recemcadastrado_` (5 estados em vez de 6).
- Todo WF de gravar/salvar/cancelar termina com `HideElement` do próprio popup (ações bTxnx, bTxnl, bTxnn,
  bTxns, bTxjl).
- Ao criar **cliente novo** grava um `Tbl.Historico` "Cliente criado/Endereço adicionado" e carimba
  `cpo.UltimoHistoricoData` no grupo (WF bTxkU, ações bUCVe e bUEpg) — o original **não** faz isso.
- Tem um WF `PopupClosed` **vazio** (bTxnJ).
- O "Destravar Campos" libera para `hierarquia ≤ 3` (contra ≤ 2 no original).
- A instância da página `cadastros` declara a propriedade exposta
  `param_bTxnD = El[pop.AddEditaEndereço A]:custom.var_qualgrupoclifor_` — propriedade alimentada pelo próprio
  estado do reusable (circular, §8.3).

**Contrato de entrada:** idêntico ao 2.1 (mesmos cinco estados). A página `cadastros` escreve tudo de uma vez:
bUCcZ0 (Edita Endereço + `var_qualendereco_` + `var_qualgrupoclifor_`), bUCcf0 (Novo Endereço +
`var_qualgrupoclifor_ = El[gp cadastros]:get_group_data` + `var_destravarcampos_ = true`), bUCcl0 (Novo
Cliente + destravar), bUCcr0 (Novo Fornecedor).

### 2.3 O formulário de endereço (comum a 2.1 e 2.2)

**Aba "Informações de Cadastro"** (`show dados cadastrais`):

| Campo na tela | Elemento (Agenda / AddEdita) | Grava em | Obrigatório |
|---|---|---|---|
| Filial ativa (toggle) | `tgg filial ativa` bTmVL0 / bTxej | `cpo.Ativo` | — |
| Identificação do Endereço | `ipt novo cliente id endereço` bTPJj / bTxcX | `cpo.NomeEndereco` | — |
| Cpf/Cnpj + rádio CPF/CNPJ | `ipt novo cliente cnpj` bTPKP / bTxdF · `RadioButtons cpfcnpj` bTeIt / bTxdE | `cpo.CnpjCpf`, `cpo.TipoPessoa` | sim |
| Insc Estadual | `ipt novocliente insc estadual` bTPKH / bTxcz | `cpo.InscEstadual` | — |
| Insc Municipal | `ipt novocliente insc municipal` bTPKB / bTxct | `cpo.InscMunicipal` | — |
| Regime Tributário | `ipt novocliente regime` bTPJv / bTxcn | `cpo.QualRegimeTributario` | sim (default Lucro Real/Presumido em Novo Cliente) |
| Razão Social | `ipt novocliente razao` bTPKg / bTxdS | `cpo.Razao` | sim |
| Nome Fantasia ou Nome Completo | `ipt novocliente fantasia` bTPKa / bTxdM | `cpo.Fantasia` | sim |
| CEP (máscara `00000-000`) | `ipt novocliente cep` bTPLE / bTxdl | `cpo.Cep` | sim |
| Endereço (logradouro e número) | `ipt novocliente endereco` bTPKy / bTxdf | `cpo.Endereco` | sim |
| Complemento | `ipt novocliente complemento` bTPKs / bTxdZ | `cpo.Complemento` | — |
| Bairro | `ipt novocliente bairro` bTPLc / bTxeN | `cpo.Bairro` | — |
| Município | `ipt novocliente municipio` bTPLW / bTxeD | `cpo.Municipio` | sim |
| (oculto) UF em texto | `ipt busca uf api` bTkEI / bTxeI | nada — só alimenta o dropdown de UF | — |
| UF | `ipt novocliente opt.uf` bTPLQ / bTxdx | `cpo.QualUfOpt` **e** `cpo.UF` (texto, via `:uf_texto`) | sim |
| Localização (Google Places) | `ipt novocliente localizacao` bTPLn / bTxeZ | `cpo.Localizacaoo` (`geographic_address`) | — |

**Aba "Informações Adicionais"** (`show dados adicionais`), dois blocos mutuamente exclusivos:

- **`esquerda`** — só quando o grupo/filial é **Cliente**: toggle Corporativo (`chk corporativo` →
  `cpo.Corporativo`), Nome Comprador (`ipt comprador`), Capacidade de compra (`ipt capacidade`), Demanda
  (`ipt demanda`), Frete (`dd frete`, `Opt.TipoFrete`: FOB / CIF Informado / CIF Incluso) e Observação
  (`ipt observacao`).
- **`direita`** — só quando é **Fornecedor**: autocomplete "Buscar produto" (`ipt qual produto`, busca
  `Tbl.ProdutosModelo` ativos por `cpo_nome_text`), botão de adicionar (`Button D`) e a tabela "Produtos desse
  fornecedor" (`Table B`) com ícone de remover (`Icon F`).

### 2.4 `pop.AgendaContatos` (bTPQa0)

1. Cabeçalho `Group E` (bTeJk) com título variável e `Icon A` (bTeJM).
2. Bloco do grupo `gp qual grupo clifor` (bTPTr0): logo (só leitura), nome e `btn novo contato cliente`
   (bTPSw0), visível apenas quando `var_a__oclifor_` está vazio.
3. Formulário `dp dados contato` (bTPQs0), alimentado por `var_qualcontato_`, visível só quando
   `var_a__oclifor_` **não** está vazio: Nome (obrigatório), Telefone com `RadioButtons tipo telefone clifor`
   (`Opt.TipoTelefone`: Sac / Fixo / Celular) e máscara que muda com o tipo — Celular `(00) 0 0000-0000`,
   Fixo `(00) 0000-0000`, Sac `0000-000-0000` —, Email (formato e-mail), Cargo/Depto e
   "Vinculado ao endereço:" (`dd qual endereco` bTPRh0, opções = `QuaisEnderecos` do grupo).
4. Botões `Group C` (bTPTz0): Gravar (só em Novo Contato), Salvar (só em Edita Contato) e Cancela.
5. Tabela `rpg contatos clifor` (bTPSX0) — §3.3 —, visível só quando `var_a__oclifor_` está vazio (formulário e
   lista nunca aparecem juntos).

**Contrato de entrada:** o grupo vem por **`Display data`** (`DisplayGroupData` no `Group E`, tipo
`custom.tbl_clientes`) — diferente da agenda de endereços, que usa estado. Opcionalmente o hospedeiro já
posiciona `var_a__oclifor_` e `var_qualcontato_` (CadastroCliFor bTgvC). **Contrato de saída:** grava em
`Tbl.ContatoCliFor` e no `cpo.QuaisContatos` do grupo; não devolve estado nenhum ao hospedeiro.

### 2.5 `pop.AddEditaContato` (bTxnz)

Clone popup do 2.4 **sem a tabela de contatos** (30 elementos contra 52) e sem o `btn novo contato cliente`.
Cada WF termina com `HideElement` do popup (ações bTxsw, bTxsr, bTxsp, bTxrc). Contrato de entrada igual
(Display data + `var_a__oclifor_` + `var_qualcontato_`); a página `cadastros` escreve os três em bUCdE0 (novo)
e bUCdL0 (edita).

Diferença de comportamento: no clone o `RadioButtons tipo telefone clifor` (bTxqN) tem a condicional
"quando vazio → default Celular"; no original (bTeIL) essa condicional **não existe**.

### 2.6 `tool.EnderecoCobranca` (bTbWm), `tool.EnderecoEntrega` (bTbjh), `tool.EnderecoFornecedor` (bThmz1)

Os três são o **mesmo componente** com outro rótulo, outro ícone e outro campo de destino:

| | Cobrança | Entrega | Fornecedor |
|---|---|---|---|
| Título | "Selecione o CNPJ / Endereço a faturar" | "Selecione o endereço de entrega" | "Selecione o endereço do fornecedor" |
| Lista (`RepeatingGroup A`) | `Parent.QualCotacao.QualCliente.QuaisEnderecos` | idem | `Parent.QualFornecedor.QuaisEnderecos` |
| Campo gravado | `cpo.QualEndereçoCobrança` | `cpo.QualEnderecoDestino` | `cpo.QualEnderecoOrigem` |
| Botão | HTML com SVG (nota fiscal); fica verde quando preenchido | HTML com SVG (pin); fica verde quando preenchido | `Icon` material `factory` — **sem** condicional de "preenchido" |

Estrutura comum: `GroupFocus A` ancorado no botão (`offset_left=-575`), com o título, o RG dos endereços e, em
cada linha, um rádio (`radio_button_unchecked` / `_checked`) mais o texto
`Nome - Bairro - Município - UF - CNPJ`.

**Contrato de entrada:** `Display data` do próprio reusable = **uma linha de `Tbl.OrcFornecedoresCotacao`**
(`custom.tbl_orcamentfornecedores`). Em `vendas` isso é `Ancestor[TableCrossAxis]` (fornecedor, bThnd1) ou
`Parent` (entrega bTbkL e cobrança bTbYF). **Contrato de saída:** escreve o campo da tabela acima **direto no
registro**, sem confirmação. Não tem estado customizado nem evento publicado.

---

## 3. Dados

### 3.1 Lista de filiais — `rpg enderecos clifor` (bTPNT, em `pop.AgendaEnderecos`)

> Todas as filiais que constam na **lista** `QuaisEnderecos` do grupo escolhido (`var_qualgrupoclifor_`), sem
> filtro e sem ordenação. Some inteira quando não há grupo escolhido.

Colunas: ações (lápis `btn edita endereço cliente` bTPNa + alvo `Icon D` bTPNb, cinza e desabilitado quando a
filial não tem `Localizacaoo`), "Município/UF", "Nome do endereço", "CNPJ" e o switch "Ativo" (`Switch A`
bTeNJ, **auto-binding** em `cpo_ativo_boolean`). Cabeçalho fixo: "Endereços do cliente" — mesmo quando o grupo
é fornecedor.

### 3.2 Busca de CNPJ repetido — `rpg busca cnpj` (bTmRf / bTxfL)

> Todas as filiais (de qualquer grupo) cujo `cpo.CnpjCpf` seja **exatamente igual** ao que está sendo digitado
> no campo de CNPJ.

Mostra grupo, se o grupo está ativo, nome da filial, se a filial está ativa, e um botão "Editar Cadastro".

### 3.3 Lista de contatos — `rpg contatos clifor` (bTPSX0, em `pop.AgendaContatos`)

> Todos os contatos que constam na lista `QuaisContatos` do grupo exibido — o `:filtered` do elemento está
> **sem restrição** (`ignore_empty_constraints=True`), então contatos inativos também aparecem.

Colunas: lápis (`btn edita contato cliente` bTPSe0) + switch Ativo (`Switch A` bTeir0, auto-binding em
`cpo_ativo_boolean`), Telefone, Nome + Cargo (em duas linhas) e E-mail. Cabeçalho: "Contatos do cliente".

### 3.4 Listas de endereço dos três `tool.Endereco*`

> Todos os endereços do cliente da cotação (cobrança e entrega) ou do fornecedor da linha (origem), pela
> **lista** `QuaisEnderecos` do grupo. Sem ordenação e **sem filtrar por `Ativo`** — filial inativa continua
> selecionável.

### 3.5 Listas auxiliares

- `dd carteira` (bTeKx / bTxiB): todos os `User`, ordenados por `cpo.NomeModelo` — **sem filtrar inativos**.
- `ipt qual produto` (bTkEh / bTxha): `Tbl.ProdutosModelo` com `cpo.Ativo = true`, ordenados por
  `cpo.NomeModelo`.
- `dd qual endereco` (bTPRh0 / bTxqC): `QuaisEnderecos` do grupo do contato.
- `dd captacao` (bTrmT): todas as opções de `Opt.CaptacaoCliente`; `dd frete` (bTkEz / bTxge): `Opt.TipoFrete`;
  `ipt novocliente opt.uf`: `Opt.UFs` (27 opções, atributo `uf_texto`).

---

## 4. Funcionalidades e regras de negócio

### 4.1 Abrir a agenda de endereços e escolher o que fazer

- O hospedeiro mostra o reusable e escreve `var_qualgrupoclifor_`; a lista §3.1 aparece. `var_a__oclifor_`
  vazio = modo "só lista".
- **Novo endereço** — WF **bTPPH** (ação bTPPM): `var_a__oclifor_ = Novo Endereço CliFor` e
  `var_destravarcampos_ = true` (já abre editável).
- **Editar endereço** — WF **bTPOJ** (ação bTPOQ), pelo lápis da linha: `var_a__oclifor_ = Edita Endereço
  CliFor`, `var_qualendereco_` = a linha e `var_qualgrupoclifor_` = o grupo da linha. **Não** destrava os
  campos: para alterar qualquer coisa é preciso clicar em "Destravar Campos".
- **Editar a partir do aviso de CNPJ repetido** — WF **bTiCY** (ação bTiCf) / **bTxlR** (bTxlV): mesma coisa,
  mas com a filial encontrada na busca §3.2 — ou seja, o usuário salta para o cadastro de **outro** grupo.
- **Abrir o mapa** — WF **bTPOV** (ação bTPOX) abre `cpo.Localizacaoo:google_map_link` em nova aba a partir da
  lista; WF **bTezM** (bTjcS) / **bTxlP** (bTxlQ) fazem o mesmo a partir do ícone ao lado do campo de
  localização, só quando o campo está preenchido.
- **Trocar de aba** — WF **bTmEq** / **bTmFB** (e **bTxlb** / **bTxlh**) mostram uma e escondem a outra. WF
  **bTkHT** (ação bTkHZ) / **bTxlW** (bTxlX), no `gp tabs`, faz um `ToggleElement` de `show dados cadastrais` —
  ver §8.1.
- **Destravar/travar campos** — par de WFs **bTmON0** / **bTmOU0** (e **bTxmZ** / **bTxme**): liga e desliga
  `var_destravarcampos_`.
- **Fechar** — par **bTeMq** / **bTeMw** (e **bTxkz** / **bTxlF**): o primeiro dá `ResetGroup` no reusable
  inteiro e limpa produtos/endereço/grupo; o segundo esconde o reusable, limpa `var_qualendereco_` e reseta o
  formulário. Os dois estão no **mesmo** clique do `ico fechar`, sem condição — ver §8.1.

### 4.2 Criar e editar endereço

Quatro caminhos de gravação, escolhidos pela condição do WF sobre `var_a__oclifor_`:

**a) Novo Cliente — WF bTeKD (Agenda) / bTxkU (AddEdita)**
1. `NewThing` **Tbl.GrupoCliFor** (bTeKg / bTxkV): `Ativo` (toggle), `Foto`, `NomeCliFor` em MAIÚSCULAS,
   `QualCarteira`, `Captacao` e `QualTipoCliFor = Cliente`.
2. `NewThing` **Tbl.EnderecosCliFor** (bTeKU / bTxkZ) com todos os campos do §2.3, mais: `QualGrupoCliFor` = o
   grupo recém-criado, `QualNomeGrupoCliFor` = o nome dele (cópia em texto), `TipoClifor` = o tipo do grupo,
   `QuaisProdutos` = `var_quaisprodutos_` e **`Principal = True`**.
3. `ChangeThing` no grupo (bTeKV / bTxka): `QuaisEnderecos` = o endereço criado.
4. *(só no clone)* `NewThing` **Tbl.Historico** "Cliente criado/Endereço adicionado" (bUCVe) e `ChangeThing`
   `UltimoHistoricoData = agora` (bUEpg).
5. Reset do formulário e das abas; limpa `var_qualendereco_`, `var_quaisprodutos_` e `var_destravarcampos_`.
   No original, `var_qualgrupoclifor_` recebe o grupo novo e `var_recemcadastrado_` também (ações bTvnD e
   bTezX); no clone `var_qualgrupoclifor_` é apenas limpo e o popup fecha (bTxnl).

**b) Novo Fornecedor — WF bTeLc (ações bTeMF, bTmMu, bTeMH…) / bTxkl (bTxkm, bTxkn, bTxkr…)**
Igual ao (a), com `QualTipoCliFor = Fornecedor`, `NomeCliFor` **sem** `to_uppercase`, sem histórico, e com um
passo a mais: `ChangeListOfThings` (bTmNG / bTxky) que escreve `cpo.QuaisFornecedoresFiliais` = a filial nova
em **cada produto** de `QuaisProdutos` — é o lado inverso da ligação produto↔filial.

**c) Novo Endereço em grupo existente — WF bTPMM (Agenda) / bTxmM (AddEdita)**
1. `NewThing` **Tbl.EnderecosCliFor** (bTmMp / bTxmN), com `QualGrupoCliFor = var_qualgrupoclifor_`,
   `QualNomeGrupoCliFor` copiado do input de nome, `Principal = True` e `Ativo` repetido duas vezes na mesma
   ação (§8.1).
2. `ChangeThing` no **grupo** (bTeOp / bTxmR): além de `QuaisEnderecos`, regrava `NomeCliFor`, `QualCarteira`,
   `Foto`, `Captacao` e `Ativo` — **adicionar uma filial reescreve o cadastro do grupo** com o que estiver na
   tela.
3. Reset, limpeza de estados e `ChangeListOfThings` de `QuaisFornecedoresFiliais` nos produtos (bTmNB / bTxmY).

**d) Editar (Salvar) — WF bTPMe (Agenda) / bTxjr (AddEdita)**
1. `ChangeThing` na filial (bTPMk / bTxjv) com todos os campos do §2.3. Aqui `CnpjCpf` vai em **MAIÚSCULAS** e
   os demais textos em minúsculas; `QualNomeGrupoCliFor` é recopiado do nome do grupo; `TipoClifor` vem de
   `var_qualgrupoclifor_.QualTipoCliFor`.
2. `ChangeThing` no grupo (bTeOi / bTxjw): `NomeCliFor`, `QualCarteira`, `Foto`, `Captacao` e `Ativo`.
3. `ResetInputs`, resets de grupo, limpeza de estados e `ChangeListOfThings` de `QuaisFornecedoresFiliais`
   (bTmNL / bTxkH). No clone, fecha o popup (bTxnx).

**e) Cancelar — WF bTPMB / bTxjk**: limpa estados e reseta o formulário. No original o `HideElement` (ação
bTeMX) está condicionado a `var_a__oclifor_` ser Novo Cliente ou Novo Fornecedor — cancelar um "Novo Endereço"
**não fecha** o painel; no clone o popup sempre fecha (bTxjl).

**Validação:** nenhuma no workflow. O que existe é `mandatory=True` em CNPJ, Regime, Razão, Fantasia, CEP,
Endereço, Município, UF e no nome do grupo — checagem de formulário do Bubble, que nem chega a bloquear os WFs
de gravação (que não têm "Only when"). Não há dígito verificador de CNPJ/CPF, nem checagem de CEP existente,
nem bloqueio de duplicidade (§4.4 apenas avisa).

### 4.3 Preenchimento automático por CEP e por CNPJ

Não há botão "buscar CEP": as chamadas estão em **condicionais de conteúdo dos inputs**, o que faz o navegador
chamar a API enquanto o usuário digita. Duas fontes (ids em `integracoes.md`):

- **Plugin `1519170218471x969128757943861200` ação `AAC`** (v1.4.1) — consulta por **CEP** (`url_params_cep` =
  o que está em `ipt novocliente cep`). Devolve `_p_logradouro`, `_p_complemento`, `_p_bairro`,
  `_p_localidade`, `_p_uf` (formato ViaCEP).
- **Plugin `1602683113110x702948442872479700` ação `AAF`** (v3.1.0) — consulta por **CNPJ**
  (`url_params_cnpj` = o que está em `ipt novo cliente cnpj`, com `/`, `.` e `-` removidos). Devolve
  `_p_body.nome`, `.fantasia`, `.cep`, `.logradouro`, `.complemento`, `.bairro`, `.municipio`, `.uf`.

Regra de precedência, campo a campo (condicionais de `ipt novocliente razao` bTxdS, `fantasia` bTxdM, `cep`
bTxdl, `endereco` bTxdf, `complemento` bTxdZ, `bairro` bTxeN, `municipio` bTxeD, `busca uf api` bTxeI e
`opt.uf` bTxdx — e os equivalentes bTPKg, bTPKa, bTPLE, bTPKy, bTPKs, bTPLc, bTPLW, bTkEI, bTPLQ na Agenda):

1. Se **há CNPJ digitado**, tudo (razão, fantasia, CEP, logradouro, complemento, bairro, município, UF) vem da
   consulta por CNPJ.
2. Se **não há CNPJ e há CEP**, logradouro, complemento, bairro, município e UF vêm da consulta por CEP.
3. Só preenche campo que esteja **vazio** (`Parent:is_empty` ou o campo correspondente do registro vazio) — num
   registro já salvo, campo em branco é recompletado pela API toda vez que a tela abre.
4. A UF chega como texto; o input oculto `ipt busca uf api` guarda esse texto e o dropdown
   `ipt novocliente opt.uf` acha a opção de `Opt.UFs` cujo `uf_texto` é igual
   (`:filtered(...):first_element`).
5. A localização (`ipt novocliente localizacao`, Google Places) tem default = `cpo.Localizacaoo` e, quando
   vazio, default = **o texto do CEP** — a geolocalização é resolvida pelo CEP, não pelo endereço completo.

### 4.4 Aviso de CNPJ já cadastrado

`gp alerta cnpj existente` (bTiBg / bTxfD) aparece quando `rpg busca cnpj` (§3.2) devolve **1 ou mais** linhas
e `var_a__oclifor_` **não** é "Edita Endereço CliFor". Texto: *"LEIA COM ATENÇÃO! Você pode continuar
cadastrando esse CNPJ, mas ele já existe no(s) seguinte(s) cliente(s)/fornecedore(s)"*. É **só aviso** — nada
impede gravar. O botão "Editar Cadastro" leva para o cadastro achado (WF bTiCY / bTxlR).

### 4.5 Endereço padrão (`Principal`)

`cpo.Principal` é gravado **`True` em toda filial criada** (ações bTeKU, bTmMu, bTmMp, bTxkZ, bTxkn, bTxmN),
não tem controle na tela e **nenhum elemento, condicional ou workflow do mapa inteiro lê esse campo**. Ou
seja: hoje não existe endereço padrão de fato — a ideia está no banco e não foi implementada. Ver §10
[DÚVIDA 1].

### 4.6 Inativar filial e inativar grupo

- **Na lista de filiais:** o switch `Switch A` (bTeNJ) é **auto-binding** em `cpo_ativo_boolean` — grava no
  banco na hora, sem workflow, sem confirmação e sem registro de quem fez.
- **No formulário:** o toggle `tgg filial ativa` só é lido nas ações de gravar/salvar (§4.2).
- **Cascata:** WF **bTmVv** (ação bTmWB) / **bTxmH** (bTxmL), disparado pelo evento do plugin no toggle "Grupo
  ativo", faz `ChangeListOfThings` `cpo.Ativo` = o novo valor em **todas** as filiais do grupo
  (`Parent:cpo.QuaisEnderecos`). Desativar um grupo desativa todas as filiais; reativar reativa todas,
  inclusive as que estavam inativas de propósito.
- Não existe exclusão de endereço em lugar nenhum: só inativação.

### 4.7 Produtos do fornecedor (dentro do cadastro de endereço)

- **Adicionar** — par **bTmMV** / **bTmMd** (e **bTxln** / **bTxlt**): se está **editando** uma filial
  existente, grava direto (`cpo.QuaisProdutos` = o produto escolhido, ações bTmMb / bTxlo); se é filial nova
  (ainda sem registro), acumula no estado `var_quaisprodutos_` com `:plus_element` (bTmMo / bTxlu). Nos dois
  casos, `ResetInputs` no fim.
- **Remover** — par **bTmNR** / **bTxlz** (filial ainda não gravada: `:minus_element` no estado) e **bTmNf** /
  **bTxmB** (filial gravada: duas `ChangeThing` que gravam `QuaisFornecedoresFiliais` no produto e
  `QuaisProdutos` na filial — ver §8.1: o efeito parece ser de **adicionar**, não de remover).

### 4.8 Contatos — listar, criar, editar, inativar

- **Abrir:** o hospedeiro faz `Display data` do grupo e mostra o reusable. Com `var_a__oclifor_` vazio, vê-se a
  lista §3.3.
- **Novo contato** — WF **bTPTa0** (ação bTPTf0): `var_a__oclifor_ = Novo Contato Cliente`. O formulário
  aparece e a tabela some. (No clone `pop.AddEditaContato` não existe esse botão: quem escolhe a ação é o
  hospedeiro.)
- **Editar contato** — WF **bTPTP0** (ação bTPTU0): `var_a__oclifor_ = Edita Contato Cliente` e
  `var_qualcontato_` = a linha clicada.
- **Gravar novo** — WF **bTPRj0** (Agenda) / **bTxrd** (AddEdita):
  1. `NewThing` **Tbl.ContatoCliFor** (bTPRo0 / bTxrh): `NomeContato`, `Email` e `Cargo` em **minúsculas**,
     `Telefone` como digitado (com máscara), `TipoTelefone`, `QualEndereço` (do dropdown), `QualGrupoCliFor` =
     o grupo exibido e `cpoTipoClifor` = `QualTipoCliFor` do grupo.
  2. `ChangeThing` no grupo (bTPRu0 / bTxri): `cpo.QuaisContatos` = o contato criado.
  3. Limpa `var_a__oclifor_` / `var_qualcontato_` e reseta `dp dados contato`. No clone, fecha o popup (bTxsw).
  - `cpo.ativo` **não é preenchido** na criação: o contato nasce com o booleano vazio (§10 [DÚVIDA 5]).
- **Salvar edição** — WF **bTPRz0** (ação bTPSB0) / **bTxro** (bTxrp): `ChangeThing` no contato com os mesmos
  campos, menos `QualGrupoCliFor`. O alvo é `Parent`, isto é, o contato exibido por `dp dados contato`, que é
  `var_qualcontato_`.
- **Cancelar** — WF **bTPSL0** / **bTxrv**: limpa estados e reseta o formulário (o clone também fecha, bTxsp).
- **Fechar** — WF **bTeJv** / **bTxrX**: limpa estados e esconde o reusable.
- **Inativar contato:** switch auto-binding `Switch A` (bTeir0) na lista — grava direto em `cpo_ativo_boolean`,
  sem workflow. Como a lista não filtra por ativo (§3.3), o contato inativo continua aparecendo.
- Não há exclusão de contato, nem marcação de "contato principal" na tela — o campo `cpo.EmailPrincipal` existe
  em `Tbl.ContatoCliFor` e **não é usado** por nenhum destes sete reusables.

### 4.9 Escolher endereço de cobrança, entrega e origem no orçamento

Os três componentes têm o mesmo trio de workflows:

| Ação | Cobrança | Entrega | Fornecedor |
|---|---|---|---|
| Abrir/fechar a lista (`ToggleElement` do `GroupFocus`) | **bTbXp** (ação bTbXz) | **bTbkF** (bTbkG) | **bThnT1** (bThnX1) |
| Selecionar (linha **≠** a atual) | **bTbXb** (bTbXh) | **bTbjv** (bTbjz) | **bThnM1** (bThnN1) |
| Desmarcar (linha **=** a atual) | **bTbXi** (bTbXn) | **bTbkA** (bTbkB) | **bThnR1** (bThnS1) |

Regra: clicar no rádio de um endereço diferente grava esse endereço no campo correspondente da linha de
`Tbl.OrcFornecedoresCotacao`; clicar no que já está marcado **apaga** o campo (grava vazio). A gravação é
imediata, no registro real, sem confirmação e sem recalcular nada — quem recalcula ICMS e distância é a página
`vendas` (§5). O `GroupFocus` não fecha sozinho depois da escolha.

---

## 5. Cálculos e valores

Estes componentes **não calculam nada**. O que eles gravam é entrada de dois cálculos que vivem fora deles.

### 5.1 Distância em km (página `vendas`)

`pagina-vendas.md:654`, texto `Text WZZZZZZZ` (bTfKu):

> `Ancestor[TableCrossAxis]:cpo.Localizacaoo:distance_from(unit="kms", origin_address=El[dd end destino]:get_data:cpo.Localizacaoo):format_number(decimal_place=1)` + `" km do cliente"`

Ou seja: **distância em linha reta** entre o `cpo.Localizacaoo` (`geographic_address`, vindo do Google Places —
§4.3 item 5) da **filial do fornecedor** e o do **endereço de entrega do cliente**, com uma casa decimal.
A ordenação da lista de fornecedores por distância usa o plugin `1685525155901x838124401560125400` sobre o
`unique_id="kmdistancia"` (WF bTccd / bTcdG de `vendas`) — ordena o **texto do DOM**, não o número.

Consequências para esta spec: se a filial não tiver `Localizacaoo` preenchida não há distância (e o ícone de
mapa da lista §3.1 fica desabilitado); como a localização é derivada do CEP, a precisão é de CEP, não de
número.

### 5.2 CEP/UF → alíquota de ICMS

A alíquota **não** está no endereço: está em `Tbl.IcmsEstados` (`cpo.Origem` e `cpo.Destino`, ambos `Opt.UFs`,
e `cpo.AliquotaIcms`, número). O endereço entra com a UF:

> `Search(Tbl.IcmsEstados):filtered(Destino = QualEnderecoDestino.UF AND Origem = QualEnderecoOrigem.UF):first_element:cpo.AliquotaIcms`
> (`pagina-vendas.md:323` e `:1219`; a mesma matriz aparece em `Table H` bTPbL e em
> `reusable-pop.AddEdita_Produtos` ação bTiea)

Portanto: o `tool.EnderecoFornecedor` define a **origem** e o `tool.EnderecoEntrega` define o **destino** da
matriz de ICMS. Trocar qualquer um dos dois muda a alíquota do orçamento. Note que a busca usa `cpo.UF` (o
campo **texto**) comparado com `Origem/Destino:display`, e não `cpo.QualUfOpt` (a option), apesar de os dois
serem gravados juntos (§2.3).

O **regime tributário do endereço** (não o do grupo) decide se o ICMS é considerado: o backend
`AdicionarFornecedores` (bTNrd) cria a linha de orçamento por dois caminhos — um quando a origem **não** é
"Lucro Real/Presumido" ou está vazia (ação bThgz0) e outro quando origem **e** destino são "Lucro
Real/Presumido" (ação bTNri).

O valor em reais sai depois, no backend `CalculaFornecedoresLista` (bTPFh), ação bTPFv:
`ValorICMS = QtdVenda × ValorVendaUnit × TotalBonusExtra` (campo marcado como *deleted* no mapa — §10
[DÚVIDA 9]).

### 5.3 Conversões de texto na gravação

Não é cálculo, mas é determinístico e precisa de teste: praticamente todo campo de texto é gravado
`:to_lowercase` e exibido `:to_capitalized_words`; `NomeCliFor` vai `to_uppercase` para cliente e **cru** para
fornecedor (ações bTeKg × bTeMF); `CnpjCpf` vai `to_uppercase` no Salvar e cru no Gravar; `Complemento` passa
por `:to_uppercase:to_lowercase` (cadeia sem efeito).

---

## 6. Integrações e backend workflows

| O quê | Id | Onde | Papel |
|---|---|---|---|
| Consulta de **CEP** | plugin `1519170218471x969128757943861200` ação `AAC` (v1.4.1) | condicionais de endereço, complemento, bairro, município e UF | preenche endereço a partir do CEP (§4.3) |
| Consulta de **CNPJ** | plugin `1602683113110x702948442872479700` ação `AAF` (v3.1.0) | condicionais de razão, fantasia, CEP, endereço, complemento, bairro, município e UF | preenche cadastro a partir do CNPJ (§4.3) |
| **Máscaras** de input | plugin `1609444246883x924984661248573400` elemento `AAD` (v2.0.0) | `MaskInput cnpj`, `MaskInput cep`, `MaskInput telefone` | cpf/cnpj, `00000-000`, telefone por tipo |
| **Toggle/switch** | plugin `1680110374647x249108010620944400` elemento `AAC`, evento `AAJ` (v1.5.13) | `tgg grupoativo`, `tgg filial ativa`, `chk corporativo`, `Switch A` das duas listas | os `Switch A` usam **auto-binding** (escrita direta no banco) |
| **Google Places** | `choices_style="geographic_places"` (Google appid configurado, `integracoes.md`) | `ipt novocliente localizacao` | alimenta `cpo.Localizacaoo` e o `google_map_link` |
| Ordenação por distância | plugin `1685525155901x838124401560125400` | página `vendas` (fora do escopo) | consome o que estes componentes gravam |

**Backend workflows relacionados** (nenhum é chamado por estes sete reusables — são rotinas avulsas):

- `copiainfoaddparafilial` (bTmQp) e `copiainfoaddparafilial_copy` (bTnzH1): copiam `CapacidadeCompra`,
  `Corporativo`, `Demanda`, `Frete`, `NomeComprador` e `Observacoes` **do grupo para as filiais** — resquício
  de quando esses campos moravam no grupo. Hoje os dois lugares têm os mesmos campos (§8.2).
- `CopiarEndereçosOrcamentoParaContasReceber` (bToWv0): carimba `QualDestino` / `QualOrigem` nas contas a
  receber a partir do orçamento — desnormalização dos endereços escolhidos em §4.9.
- `AdicionarFornecedores` (bTNrd): usa o regime tributário da origem e do destino (§5.2).
- `CalculaFornecedoresLista` (bTPFh): calcula `ValorICMS` (§5.2).

---

## 7. Segurança e privacidade

Endereço, CNPJ/CPF, inscrições, telefone, e-mail, nome e cargo de contato são **dado pessoal e cadastral de
terceiros** (LGPD). Hoje:

1. `Tbl.EnderecosCliFor`, `Tbl.ContatoCliFor` e `Tbl.GrupoCliFor` têm privacy rule `everyone` com `view_all` e
   `search_for` — e a Data API está exposta (`expõe Data API: True`). A base de clientes e fornecedores, com
   CNPJ, endereço e contatos, é legível de fora.
2. `auto_binding` está liberado para **qualquer usuário logado** em `cpo_ativo_boolean` (endereços e contatos),
   `cpo_bloqueado_boolean`, `cpo_bloqueadomotivo_text`, `cpo_qualregimetributario_*` e `cpo_qualgrupoclifor_*`.
   Os dois switches "Ativo" das listas escrevem por esse caminho — sem workflow, sem log, sem permissão.
3. As restrições de perfil (§1) são só `button_disabled` no navegador. Nenhuma gravação tem "Only when".
4. As consultas de CEP e CNPJ saem **do navegador do usuário**, com a chave do plugin embutida, e disparam a
   cada digitação (§4.3) — exposição de chave e de volume de consulta.
5. Nenhuma alteração de cadastro deixa rastro de autor (só `pop.AddEditaEndereço` grava um `Tbl.Historico`, e
   apenas na criação de cliente).

**No app novo:**

- RLS ligada em `enderecos_clifor`, `contatos_clifor` e `grupos_clifor` desde a primeira migration. Política
  mínima: `SELECT` para usuário autenticado e ativo; `INSERT` / `UPDATE` só por server action, com o papel do
  usuário conferido **no servidor** (a regra de hoje: filial de fornecedor só para hierarquia ≤ 2 ou
  departamento Financeiro — §10 [DÚVIDA 2]).
- Nada de auto-binding: "ativar/inativar" vira server action que grava `ativo`, `inativado_em`, `inativado_por`.
- CNPJ, CPF, inscrições, telefone e e-mail nunca em log nem em URL; consultas de CNPJ/CEP só pelo servidor
  (rota interna), com a chave em variável de ambiente de servidor (`CEP_API_KEY`, `CNPJ_API_KEY` — nomes a
  definir; nunca `NEXT_PUBLIC_`), com cache e limite de chamadas.
- Data API pública desligada; leitura só por sessão autenticada.
- Auditoria de cadastro (quem criou/alterou/inativou endereço e contato, e quando).
- Foto do grupo em Storage privado, com URL assinada.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto, workflows redundantes e defeitos

- **`cpo.Principal` nunca lido** (§4.5): gravado `True` em toda filial e ignorado pelo app inteiro.
- **`cpo.EmailPrincipal`** (em `Tbl.ContatoCliFor` e em `Tbl.GrupoCliFor`) nunca é escrito nem lido por estes
  componentes.
- **WF `PopupClosed` bTxnJ vazio** em `pop.AddEditaEndereço`.
- **Dois WFs no mesmo clique do `ico fechar`**, sem condição (bTeMq + bTeMw; bTxkz + bTxlF): um reseta o
  reusable inteiro e limpa `var_qualgrupoclifor_`, o outro esconde e reseta só o formulário. Ordem indefinida.
- **`gp tabs` com `ToggleElement`** (bTkHT / bTxlW): o clique na faixa das abas alterna
  `show dados cadastrais` e briga com os WFs de cada aba (bTmEq / bTmFB, bTxlb / bTxlh). Dá para acabar com as
  duas abas visíveis, ou nenhuma.
- **Remoção de produto que parece adição** (bTmNf / ações bTmPP0+bTmNp e bTxmB / bTxmF+bTxmG): as duas
  `ChangeThing` gravam `QuaisFornecedoresFiliais` = a filial no produto e `QuaisProdutos` = o produto na
  filial; o mapa não mostra `:minus_element`. Ver §10 [DÚVIDA 4].
- **Campo repetido na mesma ação:** `cpo.Ativo` aparece duas vezes em bTmMp e em bTxmN.
- **Salvar endereço reescreve o grupo** (ações bTeOi, bTeOp, bTxjw, bTxmR) com o que estiver nos inputs do
  cabeçalho — se a tela foi aberta por um caminho em que o input carregou vazio, apaga nome/carteira/foto do
  grupo.
- **`ChangeListOfThings` em `QuaisFornecedoresFiliais`** roda mesmo quando o cadastro é de cliente (produtos
  sempre vazio) — chamada inútil em todo salvamento.
- **Cabeçalhos fixos errados:** "Endereços do cliente" e "Contatos do cliente" mesmo quando é fornecedor;
  título padrão "Catálogo de Contatos" em tela que é de edição.
- **Busca de usuários sem filtro de ativo** em `dd carteira`.
- **Listas de endereço dos `tool.*` sem filtro de `Ativo`** (§3.4): filial inativa continua selecionável no
  pedido.
- **Sem confirmação em ação destrutiva:** desmarcar o endereço de entrega/cobrança/origem (bTbXi, bTbkA,
  bThnR1) apaga o campo do orçamento com um clique.
- **Cadeia sem efeito** `:to_uppercase:to_lowercase` no complemento.
- **Elementos com nome repetido** dentro do mesmo reusable (`g Input`, `Group D`, `Text B`, `Text C`,
  `Group EZ`, `Switch A`, `Button D`) — ruim para manutenção e para teste automatizado.

### 8.2 Duplicação

- **`pop.AgendaEnderecos` × `pop.AddEditaEndereço`**: 191 × 164 elementos, 109 × 100 condicionais, formulário
  idêntico. Diferem em: lista de filiais, `var_recemcadastrado_`, `HideElement` no fim, histórico na criação de
  cliente e o limite de hierarquia do "Destravar Campos". **Um** componente resolve os dois.
- **`pop.AgendaContatos` × `pop.AddEditaContato`**: mesma história (52 × 30 elementos).
- **`tool.EnderecoCobranca` × `tool.EnderecoEntrega` × `tool.EnderecoFornecedor`**: 6 elementos cada, 3
  workflows cada, **idênticos** a menos de três parâmetros (título, ícone, campo gravado) e da origem da lista
  (cliente da cotação × fornecedor da linha). São 18 elementos e 9 workflows para um componente só.
- **Relação em dois lugares:** `EnderecosCliFor.QualGrupoCliFor` (FK) **e** `GrupoCliFor.QuaisEnderecos`
  (lista); `ContatoCliFor.QualGrupoCliFor` **e** `GrupoCliFor.QuaisContatos`. As duas pontas são mantidas à mão
  em cada WF de gravação — qualquer falha deixa endereço órfão da lista (e invisível, porque as telas leem a
  lista, não a FK).
- **Relação produto↔filial em dois lugares:** `EnderecosCliFor.QuaisProdutos` e
  `ProdutosModelo.QuaisFornecedoresFiliais`.
- **UF em dois campos:** `cpo.UF` (texto) e `cpo.QualUfOpt` (option) — o ICMS usa o texto, o formulário usa a
  option.
- **Nome do grupo copiado** em `cpo.QualNomeGrupoCliFor` (texto), além da FK; e `cpo.TipoClifor` no endereço /
  `cpoTipoClifor` no contato copiam `QualTipoCliFor` do grupo.
- **Campos comerciais duplicados grupo × filial:** `CapacidadeCompra`, `Corporativo`, `Demanda`, `Frete`,
  `NomeComprador`, `Observacoes`, `Liberado`, `LiberadoMotivo` existem nos dois tipos — daí os backend WFs
  `copiainfoaddparafilial` (§6).
- **Aviso de CNPJ repetido** implementado duas vezes (bTiBg / bTxfD), com o mesmo texto e a mesma busca.

### 8.3 Gambiarras

- **API chamada de dentro de condicional de conteúdo de input** (§4.3): consulta a cada tecla, sem debounce,
  sem tratamento de erro, sem estado "não encontrado", com a chave no cliente. E, em registro já gravado,
  **reescreve** na tela o que a API diz sempre que o campo do banco estiver vazio.
- **Input oculto `ipt busca uf api`** existindo só para transportar a sigla da UF até o dropdown.
- **`geographic_address` derivado do CEP** (default do autocomplete = texto do CEP) — a distância em km do
  módulo de vendas nasce dessa aproximação.
- **Campos `disabled` por padrão + botão "Destravar Campos"** como sucedâneo de permissão: é só visual.
- **`param_bTxnD` da instância em `cadastros`** definido como o próprio `var_qualgrupoclifor_` do reusable —
  propriedade que se alimenta de si mesma.
- **Divergência de permissão entre clones** (≤ 2 no original, ≤ 3 no clone) — o mesmo cadastro tem duas regras,
  dependendo de qual tela abriu.
- **Pares de workflows no mesmo botão com condições opostas** (destravar/travar, selecionar/desmarcar,
  adicionar/acumular, remover/desvincular): 12 dos 61 workflows são metades de um `if`.
- **`ResetInputs` global** (ações bTmMz, bTxjx) em vez de limpar o grupo certo.
- **HTML inline com SVG** como botão em `tool.EnderecoCobranca` e `tool.EnderecoEntrega` (e `Icon` comum no
  `tool.EnderecoFornecedor` — por isso este não muda de cor quando preenchido).
- **`GroupFocus` posicionado por `offset_left=-575`** (pixel fixo) nos três `tool.*`.

### 8.4 Otimizações para o app novo

- **Uma tabela `enderecos_clifor`** com FK `grupo_id` e **sem** a lista espelho; as telas passam a fazer
  `select ... where grupo_id = $1 and ativo` com índice — acaba o risco de endereço órfão.
- Idem para `contatos_clifor` (FK `grupo_id`, FK opcional `endereco_id`).
- Produto↔filial vira **tabela de ligação** `fornecedor_produtos (endereco_id, produto_id)` com PK composta.
- `QualNomeGrupoCliFor`, `TipoClifor` (endereço) e `cpoTipoClifor` (contato) saem: vêm por join.
- **UF** vira `char(2)` com `check` (ou enum) — um campo só; `Opt.UFs` vira domínio, não option set no cliente.
- `Tbl.IcmsEstados` vira `icms_aliquotas (uf_origem, uf_destino, aliquota numeric(5,4))` com PK composta e
  função `fn_aliquota_icms(uf_origem, uf_destino)` — dinheiro em `numeric`, com teste (regra 10 do CLAUDE.md).
- **Geolocalização com PostGIS**: `localizacao geography(Point, 4326)` + índice GIST; distância por
  `ST_Distance(a, b)/1000` em km, calculada **no banco**, e ordenação da lista de fornecedores por número — não
  por texto do DOM. Geocodificação feita **uma vez**, no servidor, ao salvar o endereço (e a partir do
  logradouro + número + município + UF, não do CEP puro).
- **CEP e CNPJ por rota de servidor**, com cache (`cep_cache` / `cnpj_cache` ou cache HTTP), disparo por
  `blur`/botão, preenchendo o formulário **uma vez** e nunca sobrescrevendo campo já salvo.
- **Endereço padrão de verdade:** `principal boolean` com índice único parcial
  `unique (grupo_id) where principal` — ou colunas separadas `padrao_cobranca` / `padrao_entrega`.
- **Inativação com rastro:** `ativo`, `inativado_em`, `inativado_por`; cascata grupo→filiais explícita e
  reversível (guardar `inativado_por_cascata` para não reativar o que foi inativado individualmente).
- **Validação no servidor:** dígito verificador de CNPJ/CPF, CEP com 8 dígitos, e-mail, telefone por tipo
  (`Opt.TipoTelefone` vira enum), aviso de CNPJ duplicado conferido no servidor.
- **Normalização de texto no banco** (`citext` ou coluna gerada `lower(unaccent(...))` para busca), guardando o
  texto como o usuário digitou — acaba a dança `to_lowercase` / `to_capitalized_words`.
- Campos comerciais (`capacidade_compra`, `corporativo`, `demanda`, `frete`, `nome_comprador`, `observacoes`)
  ficam **só na filial**; o grupo herda por view quando precisar — os dois backend WFs de cópia somem.
- Índices: `enderecos_clifor (grupo_id, ativo)`, `(cnpj_cpf)`, `(uf)`, `(municipio)`, GIST em `localizacao`;
  `contatos_clifor (grupo_id, ativo)`, `(endereco_id)`.

---

## 9. Proposta para o app novo

### 9.1 Rotas e diálogos

Estes não são páginas: são **diálogos** montados sobre rotas paralelas, para funcionarem de dentro de `vendas`,
`cadastros` e `financeiro` sem perder o estado da tela hospedeira.

- `app/(app)/cadastros/@dialog/grupos/[grupoId]/enderecos/page.tsx` — agenda de endereços (lista + formulário).
- `app/(app)/cadastros/@dialog/grupos/[grupoId]/enderecos/[enderecoId]/page.tsx` — edição de uma filial.
- `app/(app)/cadastros/@dialog/grupos/[grupoId]/enderecos/novo/page.tsx` — nova filial.
- `app/(app)/cadastros/@dialog/grupos/novo/page.tsx` — novo cliente/fornecedor (grupo + primeira filial), com
  `?tipo=cliente|fornecedor`.
- `app/(app)/cadastros/@dialog/grupos/[grupoId]/contatos/page.tsx` (+ `/[contatoId]`, `/novo`).
- Os seletores de endereço do orçamento **não** têm rota: são popovers dentro da linha da tabela de `vendas`.

Um único conjunto de rotas atende o que hoje são quatro reusables (agenda + clone popup, endereços e contatos).

### 9.2 Componentes

- `AgendaEnderecos({ grupoId })` — lista + ações; usa `EnderecoForm`.
- `EnderecoForm({ grupoId, enderecoId?, modo: 'novo-grupo' | 'nova-filial' | 'edita', tipoCliFor })` — as duas
  abas ("Cadastro" / "Adicional"), a aba adicional trocando de bloco conforme cliente/fornecedor. Sem
  "destravar campos": o campo é editável se a permissão permite, senão vem `readOnly`.
- `BuscaCepCnpj` — hook + ação que preenche o formulário a partir de CEP ou CNPJ, disparado por `blur` ou
  botão, com estados de carregando/erro/não encontrado, e **sem** sobrescrever o que o usuário digitou.
- `AvisoCnpjDuplicado({ cnpj })` — server component que consulta e lista onde o CNPJ já existe.
- `SeletorProdutosFornecedor` — autocomplete + lista, funcionando com filial já salva ou ainda em rascunho.
- `AgendaContatos({ grupoId })` e `ContatoForm({ grupoId, contatoId?, enderecos })`.
- **`SeletorEndereco`** — *um* componente parametrizado que substitui os três `tool.Endereco*`:
  ```ts
  type SeletorEnderecoProps = {
    orcamentoFornecedorId: string
    campo: 'cobranca' | 'entrega' | 'origem'  // decide rótulo, ícone e coluna gravada
    grupoId: string                           // cliente da cotação ou fornecedor da linha
    valorAtual: string | null
    permiteLimpar?: boolean                   // hoje: sempre true (clique no marcado limpa)
  }
  ```
  Rótulo, ícone e coluna saem de um mapa de configuração; a lista vem de uma só consulta
  (`listarEnderecosDoGrupo(grupoId, { apenasAtivos: true })`); limpar pede confirmação.
- `MapaLink({ endereco })` — abre o mapa (hoje `google_map_link`), desabilitado sem coordenada.

### 9.3 Server actions

| Ação | Regra |
|---|---|
| `criarGrupoComEndereco({ tipo, grupo, endereco })` | transação: cria grupo + filial (`principal = true`) + histórico "Cliente criado/Endereço adicionado"; valida CNPJ/CPF, CEP e obrigatórios; geocodifica no servidor |
| `criarEndereco({ grupoId, endereco })` | valida permissão (filial de fornecedor: hierarquia ≤ 2 ou dept. Financeiro — [DÚVIDA 2]); **não** altera o grupo |
| `atualizarEndereco({ enderecoId, endereco })` | idem; grava só a filial |
| `atualizarGrupo({ grupoId, grupo })` | ação separada — deixa de ser efeito colateral de salvar endereço |
| `definirEnderecoPrincipal({ enderecoId })` | um por grupo (índice único parcial) — [DÚVIDA 1] |
| `alternarAtivoEndereco({ enderecoId, ativo, motivo? })` | substitui o auto-binding; grava quem/quando |
| `alternarAtivoGrupo({ grupoId, ativo })` | cascata explícita nas filiais, em transação |
| `vincularProdutoFornecedor` / `desvincularProdutoFornecedor({ enderecoId, produtoId })` | tabela de ligação; resolve a ambiguidade do §8.1 |
| `criarContato` / `atualizarContato({ grupoId, contato })` | valida e-mail e telefone por `tipo_telefone`; `ativo = true` na criação |
| `alternarAtivoContato({ contatoId, ativo })` | substitui o auto-binding |
| `definirEnderecoDoOrcamento({ orcamentoFornecedorId, campo, enderecoId \| null })` | **uma** action para os três `tool.*`; valida que o endereço pertence ao grupo certo (cliente da cotação para cobrança/entrega, fornecedor da linha para origem) e está ativo; recalcula ICMS e distância na mesma transação |
| `consultarCep(cep)` / `consultarCnpj(cnpj)` | rota de servidor com cache; chave em variável de ambiente de servidor |

### 9.4 Consultas e views SQL

- `vw_enderecos_clifor`: filial + grupo (nome, tipo, ativo) + UF/município normalizados + `principal` +
  coordenada — base das listas e dos seletores.
- `fn_listar_enderecos_do_grupo(grupo_id, apenas_ativos)`: usada pelos três modos do `SeletorEndereco`.
- **PostGIS**:
  ```sql
  alter table enderecos_clifor add column localizacao geography(Point, 4326);
  create index enderecos_clifor_localizacao_idx on enderecos_clifor using gist (localizacao);

  create or replace function fn_distancia_km(origem uuid, destino uuid)
  returns numeric language sql stable as $func$
    select round((st_distance(o.localizacao, d.localizacao) / 1000)::numeric, 1)
    from enderecos_clifor o, enderecos_clifor d
    where o.id = origem and d.id = destino
  $func$;
  ```
  e `vw_orcamento_fornecedor_distancia` expondo a distância já calculada, para a tabela de `vendas` ordenar por
  número (substitui o plugin de ordenação por texto).
- `fn_aliquota_icms(uf_origem char(2), uf_destino char(2)) returns numeric` — lookup em `icms_aliquotas`, em
  `numeric`, com teste de unidade (regra 10).
- `vw_contatos_clifor`: contato + grupo + filial vinculada, com `ativo` explícito.
- `fn_cnpj_duplicado(cnpj text)`: grupos/filiais que já usam aquele CNPJ (o aviso do §4.4).

### 9.5 Tabelas envolvidas

`grupos_clifor`, `enderecos_clifor`, `contatos_clifor`, `fornecedor_produtos` (ligação), `produtos_modelo`,
`icms_aliquotas`, `orcamentos_fornecedor` (colunas `endereco_origem_id`, `endereco_destino_id`,
`endereco_cobranca_id`), `cotacoes`, `historicos`, `usuarios` (perfil, departamento, hierarquia),
`cep_cache` / `cnpj_cache` (opcionais) e auditoria de cadastro.
RLS ligada em todas; escrita só por server action; Storage privado para a foto do grupo.

---

## 10. Dúvidas

1. **[DÚVIDA] Endereço padrão.** `cpo.Principal` é gravado `True` em toda filial e nunca lido (§4.5).
   *Recomendação:* implementar de verdade — `principal` único por grupo, marcado na criação da primeira filial
   e trocável na tela; usar como default nos três seletores do orçamento.
2. **[DÚVIDA] Regra de permissão para endereço de fornecedor.** Os clones divergem (hierarquia ≤ 2 na Agenda,
   ≤ 3 no popup) e não há regra de servidor (§1, §8.3).
   *Recomendação:* valer a mais restritiva (hierarquia ≤ 2 **ou** departamento Financeiro), conferida no
   servidor, para criar/editar filial de fornecedor; cliente livre para qualquer usuário ativo.
3. **[DÚVIDA] Operador de lista nas gravações.** O mapa mostra `=` em `cpo.QuaisEnderecos = ResultOfStep[...]`
   (ações bTeKV, bTeMH, bTeOp, bTxka, bTxkr, bTxmR) e `cpo.QuaisContatos = ...` (bTPRu0, bTxri) — no Bubble
   isso pode ser "add" ou "set".
   *Recomendação:* presumir **add**; na migração isso deixa de existir (FK, §8.4), mas a **carga** precisa
   conferir se algum grupo perdeu filiais por um "set" mal configurado.
4. **[DÚVIDA] Remover produto de filial gravada** (bTmNf / bTxmB): as duas ações parecem **adicionar** o
   vínculo, não remover (§8.1).
   *Recomendação:* tratar a lixeira como **remover** o vínculo nos dois sentidos (é o que o ícone diz) e
   confirmar no editor Bubble antes da carga.
5. **[DÚVIDA] `ativo` do contato nasce vazio** — nenhuma ação de criação preenche `cpo.ativo` (§4.8), e a lista
   não filtra por ele.
   *Recomendação:* contato novo nasce `ativo = true`; na carga, tratar `null` como ativo.
6. **[DÚVIDA] Endereço inativo continua selecionável** nos três `tool.*` (§3.4) e continua listado nas agendas.
   *Recomendação:* esconder inativos dos seletores do orçamento (com opção "mostrar inativos") e manter na
   agenda com marcação visual; não quebrar pedidos antigos que já apontam para filial inativa.
7. **[DÚVIDA] Cascata de "grupo ativo"** (bTmVv / bTxmH) reativa **todas** as filiais, inclusive as inativadas
   individualmente.
   *Recomendação:* desativar em cascata marcando `inativado_por_cascata` e, ao reativar, reativar só essas.
8. **[DÚVIDA] Salvar endereço regrava o grupo** (§8.1). É intencional (tela única) ou efeito colateral?
   *Recomendação:* separar as duas gravações (`atualizarEndereco` × `atualizarGrupo`) e só gravar o grupo se o
   usuário mexeu no bloco do grupo.
9. **[DÚVIDA] `ValorICMS` usa `cpo.TotalBonusExtra - deleted`** (backend ação bTPFv, §5.2) — campo marcado como
   excluído no Bubble, usado como se fosse a alíquota.
   *Recomendação:* no app novo, `valor_icms = qtd × valor_unit × fn_aliquota_icms(uf_origem, uf_destino)`, com
   teste; confirmar com o Financeiro antes de migrar os valores históricos.
10. **[DÚVIDA] Precisão da geolocalização.** Hoje ela é resolvida pelo CEP (§4.3 item 5) e a distância é em
    linha reta (§5.1).
    *Recomendação:* geocodificar o endereço completo no servidor ao salvar e manter linha reta (`ST_Distance`);
    distância rodoviária só se o negócio pedir, porque custa chamada de API por par.
11. **[DÚVIDA] Provedor das APIs de CEP e CNPJ.** O mapa só traz os ids dos plugins
    (`1519170218471…`, `1602683113110…`); o formato das respostas indica ViaCEP e uma API de CNPJ da Receita.
    *Recomendação:* padronizar em ViaCEP (ou BrasilAPI) + BrasilAPI/ReceitaWS, com cache no banco; confirmar
    contrato e limite antes do corte.
12. **[DÚVIDA] Campos comerciais no grupo × na filial** e os backend WFs de cópia (§6, §8.2): qual é a fonte da
    verdade hoje?
    *Recomendação:* a **filial**; o grupo deixa de ter esses campos e as rotinas de cópia somem.
13. **[DÚVIDA] `EmailPrincipal` do contato e do grupo** nunca é usado por estes componentes, mas o Financeiro
    escolhe e-mails pela agenda de contatos.
    *Recomendação:* marcar um contato como principal por grupo (flag no contato) e usá-lo como destinatário
    default de cobrança e de pedido.
14. **[DÚVIDA] Títulos fixos das listas** ("Endereços do cliente" / "Contatos do cliente") quando o grupo é
    fornecedor.
    *Recomendação:* rótulo dinâmico pelo `tipo` do grupo.
15. **[DÚVIDA] `param_bTxnD`** (propriedade exposta de `pop.AddEditaEndereço`, ligada ao próprio estado do
    reusable) — qual era a intenção?
    *Recomendação:* ignorar; no app novo o grupo vem por prop/rota.

---

## 11. Cobertura — todos os 61 workflows

### `pop.AgendaEnderecos` (bTPJL) — 22

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTPMB | Clique `btn cancela endereco` | esconde (só em Novo Cliente/Fornecedor), limpa estados, reseta o formulário | 4.2e |
| 2 | bTPMe | Clique `btn salvar endereco` | salva a filial e regrava o grupo; reseta e limpa estados | 4.2d |
| 3 | bTPOJ | Clique `btn edita endereço cliente` (lista) | entra em modo Edita Endereço com a filial e o grupo da linha | 4.1 |
| 4 | bTPOV | Clique `Icon D` (lista) | abre o Google Maps da filial em nova aba | 4.1 |
| 5 | bTPPH | Clique `btn novo endereço cliente` | entra em modo Novo Endereço, já destravado | 4.1 |
| 6 | bTeKD | Clique `btn gravar novo endereço` (Novo Cliente) | cria grupo Cliente + filial, liga os dois, guarda `var_recemcadastrado_` | 4.2a |
| 7 | bTeLc | Clique `btn gravar novo endereço` (Novo Fornecedor) | cria grupo Fornecedor + filial, liga os dois e os produtos | 4.2b |
| 8 | bTeMq | Clique `ico fechar` | reseta o reusable inteiro e limpa produtos/endereço/grupo | 4.1 / 8.1 |
| 9 | bTeMw | Clique `ico fechar` | esconde o reusable, limpa `var_qualendereco_`, reseta o formulário | 4.1 / 8.1 |
| 10 | bTezM | Clique `Image A` (ao lado da localização) | abre o Google Maps da localização digitada | 4.1 |
| 11 | bTiCY | Clique `Button C` (aviso de CNPJ repetido) | abre em edição a filial já existente encontrada | 4.4 |
| 12 | bTkHT | Clique `gp tabs` | alterna `show dados cadastrais` (conflita com as abas) | 8.1 |
| 13 | bTmEq | Clique `Text O` ("Informações de Cadastro") | mostra cadastro, esconde adicionais | 4.1 |
| 14 | bTmFB | Clique `Text N` ("Informações Adicionais") | mostra adicionais, esconde cadastro | 4.1 |
| 15 | bTmMV | Clique `Button D` (modo Edita Endereço) | grava o produto direto na filial | 4.7 |
| 16 | bTmMd | Clique `Button D` (demais modos) | acumula o produto em `var_quaisprodutos_` | 4.7 |
| 17 | bTmNR | Clique `Icon F` (filial ainda não gravada) | tira o produto de `var_quaisprodutos_` | 4.7 |
| 18 | bTmNf | Clique `Icon F` (filial gravada) | grava o vínculo produto↔filial nos dois sentidos (dúvida 4) | 4.7 / 8.1 |
| 19 | bTmVv | Evento do toggle `tgg grupoativo` | replica o "ativo" do grupo em todas as filiais | 4.6 |
| 20 | bTPMM | Clique `btn gravar novo endereço` (Novo Endereço) | cria a filial no grupo atual e regrava o grupo | 4.2c |
| 21 | bTmON0 | Clique `Button E` (travado) | `var_destravarcampos_ = true` | 4.1 |
| 22 | bTmOU0 | Clique `Button E` (destravado) | `var_destravarcampos_ = false` | 4.1 |

### `pop.AddEditaEndereço` (bTxcQ) — 20

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 23 | bTxjk | Clique `btn cancela endereco` | limpa estados, reseta o formulário e **fecha** o popup | 4.2e |
| 24 | bTxjr | Clique `btn salvar endereco` | salva a filial, regrava o grupo, reseta e fecha | 4.2d |
| 25 | bTxkU | Clique `btn gravar novo endereço` (Novo Cliente) | cria grupo + filial, grava histórico "Cliente criado/Endereço adicionado" e fecha | 4.2a / 2.2 |
| 26 | bTxkl | Clique `btn gravar novo endereço` (Novo Fornecedor) | cria grupo Fornecedor + filial + vínculo de produtos e fecha | 4.2b |
| 27 | bTxkz | Clique `ico fechar` | reseta o reusable e limpa produtos/endereço/grupo | 4.1 / 8.1 |
| 28 | bTxlF | Clique `ico fechar` | esconde, limpa `var_qualendereco_`, reseta o formulário | 4.1 / 8.1 |
| 29 | bTxlP | Clique `Image A` | abre o Google Maps da localização digitada | 4.1 |
| 30 | bTxlR | Clique `Button C` (aviso de CNPJ repetido) | abre em edição a filial já existente | 4.4 |
| 31 | bTxlW | Clique `gp tabs` | alterna `show dados cadastrais` | 8.1 |
| 32 | bTxlb | Clique `Text O` | mostra cadastro, esconde adicionais | 4.1 |
| 33 | bTxlh | Clique `Text N` | mostra adicionais, esconde cadastro | 4.1 |
| 34 | bTxln | Clique `Button D` (modo Edita Endereço) | grava o produto direto na filial | 4.7 |
| 35 | bTxlt | Clique `Button D` (demais modos) | acumula o produto no estado | 4.7 |
| 36 | bTxlz | Clique `Icon F` (filial não gravada) | tira o produto do estado | 4.7 |
| 37 | bTxmB | Clique `Icon F` (filial gravada) | grava o vínculo produto↔filial nos dois sentidos (dúvida 4) | 4.7 / 8.1 |
| 38 | bTxmH | Evento do toggle `tgg grupoativo` | replica o "ativo" do grupo nas filiais | 4.6 |
| 39 | bTxmM | Clique `btn gravar novo endereço` (Novo Endereço) | cria filial no grupo atual, regrava o grupo e fecha | 4.2c |
| 40 | bTxnJ | `PopupClosed` do próprio reusable | **vazio** — sem ação | 8.1 |
| 41 | bTxmZ | Clique `Button E` (travado) | destrava os campos | 4.1 |
| 42 | bTxme | Clique `Button E` (destravado) | trava os campos | 4.1 |

### `pop.AgendaContatos` (bTPQa0) — 6

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 43 | bTeJv | Clique `Icon A` (fechar) | limpa `var_a__oclifor_` / `var_qualcontato_` e esconde o reusable | 4.8 |
| 44 | bTPRj0 | Clique `btn gravar novo contato` | cria o contato, liga ao grupo, limpa estados e reseta o formulário | 4.8 |
| 45 | bTPRz0 | Clique `btn salvar contato` | atualiza o contato em edição, limpa estados e reseta | 4.8 |
| 46 | bTPSL0 | Clique `btn cancela novo contato` | limpa estados e reseta o formulário | 4.8 |
| 47 | bTPTP0 | Clique `btn edita contato cliente` (lista) | entra em Edita Contato com a linha clicada | 4.8 |
| 48 | bTPTa0 | Clique `btn novo contato cliente` | entra em Novo Contato | 4.8 |

### `pop.AddEditaContato` (bTxnz) — 4

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 49 | bTxrX | Clique `Icon A` (fechar) | limpa estados e esconde o popup | 4.8 / 2.5 |
| 50 | bTxrd | Clique `btn gravar novo contato` | cria o contato, liga ao grupo, limpa, reseta e **fecha** | 4.8 / 2.5 |
| 51 | bTxro | Clique `btn salvar contato` | atualiza o contato, limpa, reseta e fecha | 4.8 / 2.5 |
| 52 | bTxrv | Clique `btn cancela novo contato` | limpa, reseta e fecha | 4.8 / 2.5 |

### `tool.EnderecoCobranca` (bTbWm) — 3

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 53 | bTbXb | Clique `Icon A` (linha ≠ a atual) | grava `QualEndereçoCobrança` = o endereço clicado | 4.9 |
| 54 | bTbXi | Clique `Icon A` (linha = a atual) | **apaga** `QualEndereçoCobrança` | 4.9 |
| 55 | bTbXp | Clique no próprio reusable (botão SVG) | abre/fecha o `GroupFocus` com a lista | 4.9 |

### `tool.EnderecoEntrega` (bTbjh) — 3

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 56 | bTbjv | Clique `Icon A` (linha ≠ a atual) | grava `QualEnderecoDestino` = o endereço clicado | 4.9 |
| 57 | bTbkA | Clique `Icon A` (linha = a atual) | **apaga** `QualEnderecoDestino` | 4.9 |
| 58 | bTbkF | Clique no próprio reusable (botão SVG) | abre/fecha o `GroupFocus` com a lista | 4.9 |

### `tool.EnderecoFornecedor` (bThmz1) — 3

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 59 | bThnM1 | Clique `Icon B` (linha ≠ a atual) | grava `QualEnderecoOrigem` = o endereço clicado | 4.9 |
| 60 | bThnR1 | Clique `Icon B` (linha = a atual) | **apaga** `QualEnderecoOrigem` | 4.9 |
| 61 | bThnT1 | Clique no próprio reusable (ícone `factory`) | abre/fecha o `GroupFocus` com a lista | 4.9 |

**Conferência:** 22 + 20 + 6 + 4 + 3 + 3 + 3 = **61 workflows** — bate com `mapa/00-inventario.md`.
