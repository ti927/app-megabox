# Spec funcional — Cadastros de clientes/fornecedores e produtos

Fonte: `mapa/pagina-cadastros.md` (`bUCWN0` — 141 elementos · 31 workflows · 41 ações · 46 condicionais · 3 tabelas · 1 estado customizado),
`mapa/reusable-pop.CadastroCliFor.md` (`bTgrH` — 134 el · 32 WF · 50 ações · 40 condicionais · 1 popup),
`mapa/reusable-pop.CadastroProdutos.md` (`bTgZS` — 111 el · 10 WF · 22 ações · 20 condicionais),
`mapa/reusable-pop.BloquearClifor.md` (`bTvUD` — 33 el · 4 WF · 5 ações),
`mapa/reusable-pop.AnexosClifor.md` (`bTjcT` — 58 el · 7 WF · 11 ações · 3 estados customizados).
Total coberto: **84 workflows**.
Apoio: `mapa/data-types.md`, `mapa/option-sets.md`, `mapa/backend-workflows.md`, `mapa/integracoes.md`,
`mapa/reusable-tool.MenuConfig.md` (quem abre o quê). Consultei `mapa/pagina-cadastros_old.md` **apenas** para
entender a evolução de dois filtros (§8.1) — está marcado onde usei.

**Se esta spec e o mapa discordarem, o mapa manda.**

Glossário desta spec:
- **Grupo CliFor** = registro de `Tbl.GrupoCliFor` (`tbl_clientes`). É a **matriz/razão-mãe**: nome, foto, carteira, tipo
  (Cliente ou Fornecedor), e as listas de endereços, contatos e anexos. Não tem CNPJ.
- **Filial** = registro de `Tbl.EnderecosCliFor` (`tbl_enderecosclifor`). É quem tem **CNPJ/CPF, IE, IM, regime tributário,
  endereço e UF**. Um grupo tem 1..N filiais. **Toda regra fiscal é da filial, não do grupo.**
- **Bloquear** = marcar `EnderecosCliFor.cpo.Liberado = false` com um motivo. Não é o mesmo que "inativar".
- **Inativar** = `cpo.Ativo = false`, no grupo, na filial ou no contato.
- **Produto** = registro de `Tbl.ProdutosModelo` (`tbl_produtos`), classificado por Tipo → Grupo e ligado às filiais
  fornecedoras que o fabricam.

---

## 1. Propósito e quem usa

O módulo cobre três coisas:

1. **Página `cadastros`** — a lista-mestra de clientes e fornecedores. Busca, filtra, seleciona um grupo, mostra as filiais
   e os contatos dele, troca a carteira (vendedor dono), liga/desliga `Ativo`, abre anexos, abre bloqueio de filiais e abre
   o histórico de conversas.
2. **`pop.CadastroCliFor`** — a **versão anterior** da mesma tela, em popup. Faz quase tudo o que a página faz, mais o
   histórico de conversas embutido (`pop historico`) e a preferência "expandir todos os cartões". Ainda está instanciada
   (`tool.MenuConfig` bTjxk e bTgyf, `pagina-vendas` bThVR), mas o item de menu "Cliente / Fornecedor" **não a abre mais**:
   `tool.MenuConfig` WF bTgyl faz `ChangePage` para a página `cadastros` em aba nova. Ver §8.1.
3. **`pop.CadastroProdutos`** — cadastro de produtos (modelo), aberto pelo menu de configurações
   (`tool.MenuConfig` WF bTghQ, opção `Opt.MenuConfig.Cadastro Produtos`) e pela página `vendas` (bThEB/bThEI) quando o
   vendedor precisa criar/editar um modelo no meio de uma cotação.

Mais dois popups de apoio, ambos no escopo: **`pop.BloquearClifor`** (bloqueio/liberação de filiais) e
**`pop.AnexosClifor`** (documentos do cliente/fornecedor **e** do usuário).

**Quem usa:** Comercial (vendedores, na própria carteira), Financeiro, Administrativo/Diretoria. O cadastro é a base do
resto do sistema — cotação, pedido, entrega, contas a receber e a pagar apontam para grupo, filial e produto.

### Controle de acesso de fato (só no navegador)

Não existe checagem no carregamento da página nem regra de banco. Tudo é aparência:

- **Entrada na página:** `Opt.MenuConfig.Cliente / Fornecedor` declara `opt_hierarquia = 3`, e o texto do submenu
  (`tool.MenuConfig`, `btn submenu`) só fica habilitado se a linha de `Tbl.ConfigSistema` com
  `QualMenuConfig = Cliente / Fornecedor` listar o departamento, o perfil ou o próprio usuário. Quem digitar `/cadastros`
  entra assim mesmo. Não há redirecionamento de usuário deslogado.
- **Criar fornecedor:** `btn novo fornecedor` nasce `button_disabled=True` e só é habilitado por condicional.
  As duas telas **divergem**:
  - página `cadastros` (bUCYe0): Diretor **ou** Gerente **ou** `QualDepto = Financeiro` **ou** `QualPerfil = Analista`;
  - `pop.CadastroCliFor` (bTgrd): Diretor **ou** Gerente **ou** `QualDepto = Financeiro` (sem Analista).
- **Criar cliente:** `btn novo cliente` não tem restrição nenhuma.
- **Inativar fornecedor:** o `Switch A` de `gp ativo` recebe `AAK=True` (bloqueado) quando
  `QualPerfil.hierarquia > 2` **e** o registro é Fornecedor (bUCXd0 na página, bTgrx no popup). Ou seja, Analista (3) e
  Operador (4) não desligam fornecedor; qualquer um desliga cliente.
- **Apagar anexo (linha):** ícone habilitado só para `QualPerfil.hierarquia ≤ 2` (Diretor/Gerente) — `bTjdn`.
- **Apagar anexos (cabeçalho, em massa):** ícone `bTjdU` **não tem nenhuma restrição** e WF bTjeL apaga a lista inteira
  sem confirmação. É o furo mais grave da tela (§7).
- **Ver anexo:** a lista de anexos do cliente é filtrada por `TipoAnexo.DeptosVisualizam contains CurrentUser.QualDepto`
  (condicional de `rpg anexos`, bTjcw). É filtro de vitrine: o dado trafega para o navegador de qualquer jeito.
- **Editar histórico de conversa** (`pop.CadastroCliFor`, `gp edita historico por cliente` bTjMj): visível só se o grupo
  é da carteira do usuário **ou** o usuário é Diretor.
- **Contadores de depuração** (`Text B` bUCbG0 na página, `Text N` bTmGP no popup) aparecem só com `CurrentUser.IsDev`.

---

## 2. Estrutura da tela

### 2.1 Página `cadastros` — layout (de cima para baixo)

1. **Cabeçalho** `tool.Cabecalho A` (bUCbL0) — publica `var_showmenu_` e `var_showhistorico_`.
2. **Menu lateral** `tool.MenuPaginas A` (bUCbS0), visível quando `cabecalho.var_showmenu_ = true`.
3. **Painel de histórico** `tool.Historico A` (bUCbT0), visível quando `cabecalho.var_showhistorico_ = true`.
4. **Título** `gp titulo pagina` (bUCbA0): "Cadastros de {tipo escolhido no rádio}". Dentro dele fica o
   **RG invisível `rpg buscaenderecos a`** (bUCbF0) — não é lista visível, é a **busca de verdade** (§3.1).
5. **`gp content`** → **`gp clifor`**:
   - **`gp filtros clifor`**: rádio `rad tipo clifor` (Cliente/Fornecedor), checkbox "Clientes sem carteira"
     (`Checkbox cliente sem carteira` bUEow), botões `btn novo cliente` e `btn novo fornecedor`.
   - **`Group Q`** (bUEpV): dois contadores globais — "Clientes ativos" e "Fornecedores ativos" (duas buscas `:count`
     independentes de qualquer filtro).
   - **Tabela `rpg grupoclifor`** (bUCYX0) — a lista de grupos. Cabeçalho fixo (`TableCrossAxis` bUCXn0) com ordenação,
     campo de busca, filtro de UF e filtro ativo/inativo. Linhas (bUCXh0) com: índice, foto+nome+situação de contrato,
     carteira, comentários/última conversa, anexos, bloquear, ativo.
6. **`gp cadastros`** (bUCYr0) — o painel de detalhe do grupo selecionado (`var_cliforselecionado_`), com a tabela de
   **endereços** (`rpg enderecos` bUCZm0) e a de **contatos** (`rpg contatos` bUCYv0). Visível quando há seleção; a
   condicional `CurrentUser.ExpandirCadastroClifor:is_true → is_visible=True` o força aberto.

### 2.2 Popups e reusables

| Elemento | Reusable | Onde está | Abre com | Escopo |
|---|---|---|---|---|
| `pop.AddEditaEndereço A` (bUCbH0) | `pop.AddEditaEndereço` | página `cadastros` | WF bUCcl0, bUCcr0, bUCcf0, bUCcZ0 | **fora** — outro agente |
| `pop.AddEditaContato A` (bUCbM0) | `pop.AddEditaContato` | página `cadastros` | WF bUCdE0, bUCdL0 | **fora** — outro agente |
| `pop.AgendaEnderecos A` (bTgxX) | `pop.AgendaEnderecos` | `pop.CadastroCliFor` | WF bTguM, bTguY, bTgvh, bTgxA | **fora** — outro agente |
| `pop.AgendaContatos A` (bTgxR) | `pop.AgendaContatos` | `pop.CadastroCliFor` | WF bTgvC, bTgvZ | **fora** — outro agente |
| `pop.HistoricoConversas A` (bUCbN0) | `pop.HistoricoConversas` | página `cadastros` | WF bUCdt0 | fora (histórico) |
| `pop historico` (bTgxd) | popup interno | `pop.CadastroCliFor` | WF bTgur; fecha WF bTgyV | **dentro** — §4.7 |
| `pop.AnexosClifor A` (bUCbR0 / bTjgf) | `pop.AnexosClifor` | ambas | WF bUCdn0 / bTjgZ | **dentro** — §4.6 |
| `pop.BloquearClifor A` (bUCbX0 / bTvZf) | `pop.BloquearClifor` | ambas | WF bUCeM0 / bTvZl | **dentro** — §4.5 |
| `pop.CadastroProdutos A` | `pop.CadastroProdutos` | `tool.MenuConfig` (bTghX), `pagina-vendas` (bThDp), `pop.DuplicarPedido` (bUAYm) | `tool.MenuConfig` WF bTghQ; vendas bThEB/bThEI | **dentro** — §4.8 |
| `pop.CadastroUsuarios A` | `pop.CadastroUsuarios` | `tool.MenuConfig` | WF bTgqz | **fora** — outro agente (mas usa `pop.AnexosClifor` no modo "Usuário", §4.6) |

**Dependências que este módulo só abre, sem descrever:** `pop.AddEditaEndereço` / `pop.AgendaEnderecos` criam o **grupo e a
filial** (inclusive no caminho "Novo Cliente" e "Novo Fornecedor" — ver §4.1), `pop.AddEditaContato` / `pop.AgendaContatos`
cuidam dos contatos, e `pop.CadastroUsuarios` cuida dos usuários.

### 2.3 Parâmetros de URL

**Nenhum.** Nem a página `cadastros` nem os quatro reusables leem ou escrevem parâmetro de URL. Todo o estado é
custom state ou preferência gravada no usuário (§2.4). Não dá para mandar link para um cliente.

### 2.4 Estados customizados e preferências

| Onde | Estado | Tipo | Para quê |
|---|---|---|---|
| `Página cadastros` | `var_cliforselecionado_` | `Tbl.GrupoCliFor` | grupo selecionado; alimenta `gp cadastros` e o destaque da linha |
| `pop.CadastroCliFor` | `var_qualendereco_` | `Tbl.EnderecosCliFor` | filial "em foco"; filtra `rpg contatos clifor` e deixa a linha em negrito |
| `pop.CadastroProdutos` | `var_quaisfornecedores_` | lista de `Tbl.EnderecosCliFor` | fornecedores escolhidos **antes** de o produto existir |
| `pop.AnexosClifor` | `var_tipoanexo_` | `Opt.TipoAnexo` | decide o modo da tela: "Cliente/Fornecedor" ou "Usuário" |
| `pop.AnexosClifor` | `var_qualclifor_` | `Tbl.GrupoCliFor` | grupo dono dos anexos |
| `pop.AnexosClifor` | `var_qualusuario_` | `User` | usuário dono dos anexos (modo Usuário) |

Preferências gravadas **no registro do usuário** (persistem entre sessões e abas):
`cpo.FiltraTipoClifor` (Cliente/Fornecedor), `cpo.BuscaExataProxima` (modo de busca), `cpo.OrdenarCampos` (ordem),
`cpo.ExpandirCadastroClifor` (cartões expandidos). Gravadas pelos WF bTmGV, bTmFa, bTjlT, bTmFn/bTmFx — **só no
`pop.CadastroCliFor`**. A página `cadastros` **lê** as quatro como default mas **não grava nenhuma** (§8.1).

---

## 3. Dados

### 3.1 A busca-base da página: um RG invisível de endereços

A lista de clientes **não** é uma busca de clientes. É `rpg buscaenderecos a` (bUCbF0), um RepeatingGroup de
`Tbl.EnderecosCliFor` sem altura útil, e a tabela `rpg grupoclifor` (bUCYX0) usa
`El[rpg buscaenderecos a]:get_list_data:cpo.QualGrupoCliFor:unique` como fonte. Isto é: **busca-se filial e sobe-se para o
grupo**, para que um filtro de UF ou de CNPJ funcione.

O RG tem quatro fontes alternativas, escolhidas por condicional (a última que casar vence):

| Modo (`radio busca`) | Filtros aplicados |
|---|---|
| **Busca exata** | `Ativo = dd filter cliforativo` **e** `QualUfOpt = dd estado` **e** `TipoClifor = rad tipo clifor` **e** `QualGrupoCliFor = grupo escolhido no autocomplete` |
| **Busca Cnpj** | idem, trocando o grupo por `CnpjCpf = CNPJ escolhido no autocomplete` |
| **Busca próxima** | `Ativo` **e** `QualNomeGrupoCliFor contém texto digitado` **e** `QualUfOpt` **e** `TipoClifor` |
| **Checkbox "Clientes sem carteira"** | igual ao "Busca exata", mais `:filtered(QualGrupoCliFor.QualCarteira is_empty)` |

Ordenação: campo dinâmico vindo de `Opt.OrdenarCampos` (`dd sort grupoclifor`), `desc`, `ignore empty`.
`Opt.OrdenarCampos` só tem duas opções — "Recente" (`Created Date`, desc) e "Alfabética" (`cpo.NomeCliFor`, asc) — e o
atributo `Descending` de cada opção **não é usado**: a ordenação é sempre `desc`.

Campos de busca:
- `src busca exata` (bUCYF0) — autocomplete sobre `Tbl.GrupoCliFor` filtrando `Ativo` e `QualTipoCliFor`, procurando em
  `cpo_nomecliente_text`.
- `src busca cnpj` (bUCYG0) — autocomplete sobre `Tbl.EnderecosCliFor`, procurando em `cpo_cnpjcpf_text`.
- `src busca proxima` (bUCYA0) — texto livre.
- `dd estado` (bUCYT0) — `Opt.UFs` (27 opções), opcional.
- `dd filter cliforativo` (bUCYN0) — `Opt.SimNão` (Ativos / Inativos / Todos); o valor usado é o atributo `Boolean`, que em
  "Todos" é vazio — daí o `ignore empty` na busca.

### 3.2 Linha da tabela de grupos (`rpg grupoclifor` bUCYX0)

Cada linha mostra, do grupo (`Ancestor[TableCrossAxis]`):
- **Índice** `gp numero indice` — "posição / total".
- **Foto** (`cpo.Foto`, com placeholder svgrepo quando vazia) e **nome** em maiúsculas.
- **Situação do contrato de parceria** (`Text D` bUCWl0) — só para Fornecedor. Três estados:
  - `NãoFazContratoParceria = true` → "Não faz contrato de parceria";
  - existe ≥ 1 `Tbl.Anexos` com `TipoAnexo = Contrato de parceria` e `NãoFaz... = false` → "Contrato de parceria anexo";
  - senão → "Não contém contrato de parceria".
  **São duas buscas em `Tbl.Anexos` por linha renderizada.**
- "Contém: N Endereços | M Contatos" — `cpo.QuaisEnderecos:count` e `cpo.QuaisContatos:count`.
- "Criado em" (`Created Date`) e "Por" (`Created By.NomeModelo`).
- **Carteira** (`gp carteira`, só Cliente): dropdown `Dropdown B` (bUCXK0) com **auto-binding** em
  `cpo_qualcarteira_user`. Opções = usuários ativos **exceto** os dos departamentos Financeiro e Operação, ordenados por
  `NomeModelo`. No `pop.CadastroCliFor` o mesmo dropdown (bTgsD) lista **todos** os usuários ativos — divergência.
- **Comentários e última conversa** (só Cliente): ícone que abre o histórico, texto "Ultima conversa: dd/mm/yy" e
  "N dias" desde `cpo.UltimoHistoricoData`. A data exibida vem de `Search(Tbl.Historico: QualCliente = grupo):last_element`,
  **outra busca por linha**, enquanto o "N dias" usa o campo desnormalizado `UltimoHistoricoData` — as duas podem divergir.
- **Anexos** (`gp anexos`): "Anexos: {QuaisAnexos:count}".
- **Bloquear** (`gp bloquear`): ícone que abre `pop.BloquearClifor`.
- **Ativo** (`gp ativo`): switch com `bind_field=cpo_ativo_boolean` (mas `auto_binding: False` — quem grava é o WF bUCbZ0).

Cor de fundo da linha: verde-ish para Cliente, laranja-ish para Fornecedor, mais saturado quando é o grupo selecionado.

### 3.3 Painel de detalhe (`gp cadastros` bUCYr0)

- **Endereços** `rpg enderecos` (bUCZm0) — fonte `grupo.QuaisEnderecos` (a **lista** do grupo, não uma busca).
  Colunas: ações (editar, abrir no mapa, switch ativo), "Endereço - Município/UF", nome da filial, CNPJ/CPF.
  O ícone de mapa fica desabilitado quando `cpo.Localizacaoo` está vazio.
- **Contatos** `rpg contatos` (bUCYv0) — fonte `grupo.QuaisContatos`. Colunas: ações (editar, switch ativo), telefone,
  nome + cargo, e-mail.
- Os botões "Novo" de cada tabela ficam desabilitados quando não há grupo selecionado.

### 3.4 Listas do `pop.CadastroCliFor`

- `rpg clientes` (bTgrf) — fonte composta: `Search(GrupoCliFor: tipo, ativo, NomeCliFor contém texto, Captacao)`
  `:merged_with(rpg buscaenderecos:QualGrupoCliFor)` `:filtered(Ativo = filtro)` `:unique`. No modo "Busca exata" troca
  por uma busca só com `NomeCliFor = nome escolhido`.
- `rpg buscaenderecos` (bTmFT) — RG invisível de `EnderecosCliFor` filtrando `NomeEndereco contém texto` e `TipoClifor`.
  **Não filtra `Ativo` nem UF** (a página faz).
- `rpg enderecos clifor` (bTgtQ) e `rpg contatos clifor` (bTgsZ) — endereços e contatos do grupo; os contatos são
  filtrados por `QualEndereço = var_qualendereco_` (ignore empty), então clicar numa filial filtra os contatos dela.
- Filtro extra que a página não tem: `dd captacao` (bTrns) sobre `Opt.CaptacaoCliente` (Rd, Telefone, Email, Digisac, N/A).

### 3.5 Listas do `pop.CadastroProdutos`

- `rpg modelo produto` (bTgcB) — `Search(Tbl.ProdutosModelo: NomeModelo = escolhido, QualTipoProduto, QualGrupoProduto,
  Ativo; sort NomeModelo, ignore empty)`. Colunas: Grupo, Tipo, Modelo, ícone do tipo, Condição, Linha,
  "Qtd Fornecedores" e ações (editar, switch ativo com auto-binding).
- `rpg fornecedores do produto` (bTgar) — `produto.QuaisFornecedoresFiliais`; quando não há produto (modo novo), troca
  para o custom state `var_quaisfornecedores_`.
- `src filter produto` (bTgbu) — autocomplete de `Tbl.ProdutosModelo` procurando em `cpo_nome_text`,
  **ordenado por `cpo.NomeCliFor`, campo que não existe em `ProdutosModelo`** (§8.1).
- `src filter produto tipo` / `src filter produto grupo` — `Tbl.ProdutosTipo` e `Tbl.ProdutosGrupo`, o segundo dependente
  do primeiro (`QualTipoProduto = tipo escolhido`).
- `ipt add fornecedor` (bTgan) — autocomplete de `EnderecosCliFor` com `TipoClifor = Fornecedor` e `Ativo = true`.

### 3.6 Listas do `pop.AnexosClifor`

`rpg anexos` (bTjcw) tem duas fontes por condicional:
- modo **Usuário**: `var_qualusuario_.QuaisAnexos`, sem filtro;
- modo **Cliente/Fornecedor**: `var_qualclifor_.QuaisAnexos:filtered(TipoAnexo.DeptosVisualizam contains
  CurrentUser.QualDepto)`.

`dd tipodocumento` (bTjck) lista `Opt.TipoAnexo` filtrado por `QualCadastro` igual ao do modo corrente, ordenado por
`display`. `dd qualendereco` (bTjep) lista as filiais **ativas** do grupo, exibidas como
"NOME - Endereço - Município/UF (CNPJ)".

### 3.7 Lista do `pop.BloquearClifor`

`Table A` (bTvUO) — `grupo.QuaisEnderecos`, sem filtro de ativo. Colunas: Filial (nome + CNPJ + endereço),
"Motivo do bloqueio/liberação" (`MultilineInput B`, **auto-binding** em `cpo_bloqueadomotivo_text`) e
"Liberado s/n" (ícone verde/vermelho + texto SIM/NÃO).

---

## 4. Funcionalidades e regras de negócio

### 4.1 Criar cliente e criar fornecedor

**Esta tela não cria o registro.** Ela só abre o popup de endereço no modo certo; quem cria o `GrupoCliFor` e a primeira
`EnderecosCliFor` é `pop.AddEditaEndereço` / `pop.AgendaEnderecos` (fora do escopo).

Página `cadastros`:
- **Novo cliente** — WF **bUCcl0**: (bUCcm0) mostra `pop.AddEditaEndereço A`; (bUCcn0) grava
  `var_a__oclifor_ = Opt.AçãoCliFor.Novo Cliente` e `var_destravarcampos_ = true`.
- **Novo fornecedor** — WF **bUCcr0**: (bUCcs0) mostra o popup; (bUCct0) grava
  `var_a__oclifor_ = Opt.AçãoCliFor.Novo Fornecedor`. **Não grava `var_destravarcampos_`** — o caminho de cliente
  destrava os campos e o de fornecedor não. Divergência a confirmar (§10).

`pop.CadastroCliFor`:
- **Novo cliente** — WF **bTguM**: (bTguR) reseta `pop.AgendaEnderecos A`; (bTguS) grava
  `Novo Cliente` + `var_destravarcampos_ = true` + `var_qualgrupoclifor_ = vazio`; (bTguT) mostra.
- **Novo fornecedor** — WF **bTguY**: idêntico, com `Novo Fornecedor` (bTgud, bTgue, bTguf). Aqui **os dois**
  destravam campos.

**O que distingue cliente de fornecedor**, na prática:

| | Cliente | Fornecedor |
|---|---|---|
| Campo que decide | `GrupoCliFor.QualTipoCliFor = opt.TipoCliFor.Cliente` (e `EnderecosCliFor.TipoClifor`, cópia) | `... = Fornecedor` |
| Botão de criação | livre | exige Diretor/Gerente/Financeiro (e Analista na página) |
| Carteira (`QualCarteira`) | mostrada e editável | grupo `Group D`/`Group B` escondido |
| Histórico de conversas | mostrado | escondido |
| Contrato de parceria | não se aplica (texto escondido) | três estados, §3.2 |
| Inativar | qualquer perfil | só `hierarquia ≤ 2` |
| Cor da linha | `bTHGs` (verde) | `bTHHX` (laranja) |
| Papel no resto do sistema | destino da venda (`QualEnderecoDestino`) | origem (`QualEnderecoOrigem`), fabricante de produtos |

O tipo é gravado **em dois lugares** (`GrupoCliFor.QualTipoCliFor` e `EnderecosCliFor.TipoClifor`) e nada garante que
fiquem iguais (§8.4).

### 4.2 Selecionar / desselecionar um grupo

Onze workflows fazem a mesma coisa, em pares, um por área clicável da linha:

| Área | Seleciona (se ≠ atual) | Limpa (se = atual) |
|---|---|---|
| nome/foto `gp nomeclifor` | **bUCbf0** (bUCbj0) | **bUCbk0** (bUCbl0) |
| índice `gp numero indice` | **bUCbp0** (bUCbq0) | **bUCbr0** (bUCbv0) |
| anexos `gp anexos` | **bUCbw0** (bUCbx0) | **bUCcB0** (bUCcC0) |
| bloquear `gp bloquear` | **bUCcI0** (bUCcJ0) | **bUCcD0** (bUCcH0) |
| ativo `gp ativo` | **bUCcP0** (bUCcT0) | **bUCcN0** (bUCcO0) |
| carteira `gp carteira` | **bUCcx0** (bUCcy0) | **bUCcz0** (bUCdD0) |

Todos gravam (ou apagam) `Página cadastros.var_cliforselecionado_`. Há ainda **bUCeL0** (clique em `gp nomeclifor`,
**sem ação nenhuma**) e **bUCdz0** (bUCeA0 — o "X" do card de detalhe limpa a seleção).

A seleção também é limpa por qualquer mudança de contexto: **bUCdd0** (bUCdh0 — troca do rádio Cliente/Fornecedor),
**bUCdW0** (bUCdX0 — troca do toggle ativo/inativo) e **bUCdb0** (bUCdc0 — troca do toggle de ordenação).

No `pop.CadastroCliFor` o equivalente é o par **bTguk** (bTgup — `ToggleElement` em `gp endereços+contatos`) para
expandir o cartão, e quatro WF para focar uma filial: **bTgwK**/**bTgwD** (clique em `tx cidade endereco`,
seta/limpa `var_qualendereco_`) e **bTgwb**/**bTgwR** (idem em `tx nome endereco`). Focar uma filial filtra os contatos
dela (§3.4).

### 4.3 Limpar a busca

- Página: WF **bUCcU0** (bUCcV0) — `ResetGroup` em `gp busca cliente`, o que devolve os três campos de busca ao default.
  O ícone "X" só fica habilitado quando algum dos três tem conteúdo.
- Popup: WF **bThmR** (bThmX) — mesmo `ResetGroup` em `gp busca cliente`.

### 4.4 Ativar e inativar

**Grupo (página)** — WF **bUCbZ0**, disparado pelo switch:
1. (bUCbd0) `GrupoCliFor.Ativo = valor do switch`;
2. (bUCbe0) **cascata**: a mesma flag em **todas** as `QuaisEnderecos` do grupo.

**Grupo (`pop.CadastroCliFor`)** — dois workflows no **mesmo** switch, que rodam juntos:
- **bTmPW0**: (bTvTd) grava `Ativo` **e** `UltimoQue(Des)ativou = CurrentUser`; (bTmPc0) cascata nas filiais.
- **bTmPd0**, só quando o switch foi ligado: (bTmPi0) força `Ativo = true` em todas as filiais.
  Sobrepõe o passo anterior no caminho "ligar" — redundante (§8.2).

A página **não grava `UltimoQue(Des)ativou`**; o popup grava. Quem usar a página perde a auditoria.

**Filial** — WF **bUCeB0** (bUCeF0) na página e, no popup, o switch autobinded `Switch enderecos` (bTgtb) mais o
WF **bTmGc**: se o grupo tem **exatamente uma** filial (`QuaisEnderecos:count = 1`), (bTmGi) replica o valor para o
**grupo**. Regra útil e que só existe no popup.

**Contato** — WF **bUCeG0** (bUCeH0) na página; no popup é autobinding puro (`Switch contatos` bTgsg), sem workflow.

**Produto** — switch autobinded (`Switch A` bTgcX, `cpo_ativo_boolean`), sem workflow.

### 4.5 Bloquear e desbloquear filiais (`pop.BloquearClifor`)

Aberto pelo ícone "Bloquear" da linha: WF **bUCeM0** na página (bUCeN0 mostra, bUCeR0 passa o grupo) e WF **bTvZl** no
popup (bTvZr, bTvZw).

Regras:
- O bloqueio é **da filial**, campo `cpo.Liberado` (id real `cpo_bloqueado_boolean` — nome invertido, §8.3) e o motivo
  em `cpo.LiberadoMotivo` (id `cpo_bloqueadomotivo_text`).
- **Bloquear todas as filiais** — WF **bTvYp**: (bTvYv) em **todas** as `QuaisEnderecos` do grupo grava
  `LiberadoMotivo = texto digitado` e `Liberado = false`; (bTvZA) limpa os inputs. O aviso na tela é explícito:
  *"Caso precise bloquear todas filiais, basta digitar o motivo no campo abaixo e clicar em 'Bloquear Grupo'.
  **Não funciona para desbloqueio**"*. Não há botão de liberar em massa.
- **Alternar uma filial** — WF **bUBbb** (bUBbh: `Liberado = false`, quando estava liberada) e WF **bUBbj**
  (bUBbo: `Liberado = true`, quando estava bloqueada). **Nenhum dos dois exige motivo** e nenhum limpa o motivo antigo ao
  liberar — o texto do bloqueio anterior fica pendurado no registro.
- O **motivo por filial** é gravado por **auto-binding** do `MultilineInput B` (bTvXO) direto no banco, sem workflow,
  a cada digitação/blur.
- `GrupoCliFor` também tem `cpo.Liberado` e `cpo.LiberadoMotivo`. **Nada neste módulo escreve neles.**
- Fechar: WF **bTxzI0** (bTxzO0).
- Não há registro de quem bloqueou nem quando (§8.4).

### 4.6 Anexos (`pop.AnexosClifor`)

O popup atende **dois cadastros** no mesmo componente, decidido pelo atributo `QualCadastro` do `Opt.TipoAnexo` guardado
em `var_tipoanexo_`: "Cliente/Fornecedor" ou "Usuário". O título é "Documentos do {QualCadastro}".

Abertura:
- Página `cadastros`, WF **bUCdn0**: (bUCdo0) mostra; (bUCdp0) grava `var_qualclifor_ = grupo da linha` e
  `var_tipoanexo_ = Opt.TipoAnexo.Alvará de Funcionamento`.
- `pop.CadastroCliFor`, WF **bTjgZ**: (bTjgl) mostra; (bTkOE) grava `var_tipoanexo_ = Alvará de Funcionamento` e
  `var_qualclifor_ = Parent`.
- `pop.CadastroUsuarios` (fora de escopo) abre no modo "Usuário" preenchendo `var_qualusuario_`.

O tipo "Alvará de Funcionamento" é só **semente do modo** — serve para o `:qualcadastro` dar "Cliente/Fornecedor" e para o
`dd tipodocumento` já vir posicionado. Não significa que o anexo será um alvará.

**Gravar anexo, modo Cliente/Fornecedor** — WF **bTjdz** (condição `qualcadastro = "Cliente/Fornecedor"`):
1. (bTjeE) cria `Tbl.Anexos` com `AnexoFile` = arquivo, `QualClifor` = grupo, `QualOrigem` = filial escolhida,
   `TipoAnexo` = tipo escolhido;
2. (bTjeF) limpa os inputs;
3. (bTjeJ) adiciona o anexo em `EnderecosCliFor.QuaisAnexos` da filial;
4. (bTjgC) adiciona o anexo em `GrupoCliFor.QuaisAnexos`.

Ou seja, **a mesma relação é gravada três vezes** (FK no anexo + duas listas) (§8.4).

**Gravar anexo, modo Usuário** — WF **bTkNr**: (bTkNt) cria `Tbl.Anexos` com `AnexoFile`, `TipoAnexo` e `QualUsuario`;
(bTkNx) limpa; (bTkNz) adiciona em `User.QuaisAnexos`. Sem endereço (o `dd qualendereco` fica `mandatory=false`).

**Abrir anexo** — WF **bTjec** (bTjeh): `OpenURL` na URL do arquivo, em aba nova. **URL pública do CDN** (§7).

**Apagar anexo (linha)** — WF **bTjeV** (bTjeX): `DeleteThing` no anexo da linha. **Não remove das listas
`QuaisAnexos`** do grupo, da filial nem do usuário — sobra referência quebrada. Ícone só para `hierarquia ≤ 2`.

**Apagar TODOS os anexos (cabeçalho)** — WF **bTjeL** (bTjeQ): `DeleteListOfThings` sobre `rpg anexos:get_list_data`,
isto é, tudo o que está listado. **Sem confirmação, sem restrição de perfil.** Ver §7 e §8.1.

**Contrato de parceria:** o switch `Switch A` (bUFCt), rotulado "Fornecedor **não** faz contrato de parceria", grava por
auto-binding em `cpo_fazcontratoparceria_boolean` (campo cujo rótulo no data type é `cpo.NãoFazContratoParceria`). É esse
valor que alimenta os três estados do §3.2. O nome do campo é o oposto do rótulo (§8.3).

Restrições do upload: `max_size = 3` (MB) no `upf documento`; tipo e endereço são obrigatórios no modo Cliente/Fornecedor.

Fechar: WF **bTjhX** (bTjhd). WF **bTkNl** (`PopupOpened`) está **vazio**.

### 4.7 Histórico de conversas

- Página `cadastros`: WF **bUCdt0** — (bUCdu0) mostra `pop.HistoricoConversas A`; (bUCdv0) passa o grupo. O componente é
  de outro módulo; aqui só se registra a abertura.
- `pop.CadastroCliFor` tem o histórico **embutido** (`pop historico` bTgxd), aberto pelo WF **bTgur**
  (bTguw passa o grupo, bTgux mostra) e fechado pelo WF **bTgyV** (bTgya).
  - Lista: `Search(Tbl.Historico: QualCliente = grupo; sort Created Date desc)`.
  - **Novo histórico** — WF **bTjNv** (quando não há registro em edição): (bTjNx) cria `Tbl.Historico` com
    `Descricao`, `QualCliente` = grupo, `QualVendedor` = usuário; (bTjOB) reseta o grupo de edição; (bTjOC) limpa inputs;
    (bTjOD) grava `GrupoCliFor.UltimoHistoricoData = agora`.
  - **Editar histórico** — WF **bTjOI** (quando há registro em edição): (bTjON) regrava `Descricao`, `QualCliente` e
    `QualVendedor` no registro existente; (bTjOO) reseta. **Não atualiza `UltimoHistoricoData`** e **troca o vendedor do
    histórico pelo usuário que editou** — apaga a autoria original.
  - O campo `GrupoCliFor.UltimoHistoricoMsg` existe e **ninguém escreve nele** neste módulo.
  - Editar só aparece para o dono da carteira ou para Diretor (§1).

### 4.8 Cadastro de produtos (`pop.CadastroProdutos`)

O popup tem dois modos, decididos por `El[gp dados do produto]:get_group_data` estar vazio (novo) ou preenchido (edição).
O título muda por condicional: "Cadastro de Produtos" → "Novo Produto" / "Edita Produto".

**Abrir em branco** — WF **bTgfA** (bTgfT): mostra `gp dados do produto` sem dado → modo novo.
**Abrir para editar** — WF **bTgfH**: (bTgfM) exibe o produto da linha no reusable; (bThkq) mostra `gp dados do produto`.
**Cancelar** — WF **bTgep**: (bTgeu) reseta o reusable; (bTgiR) esconde `gp dados do produto`.
**Fechar** — WF **bTgfl**: (bTgfr) reseta `gp dados do produto`; (bTgfv) esconde o reusable.

Campos: Nome Modelo (obrigatório), Qual Tipo (obrigatório, `Tbl.ProdutosTipo`), Qual Grupo (obrigatório,
`Tbl.ProdutosGrupo` **filtrado pelo tipo escolhido**), Qual Condição (multi, `Opt.ProdutosCondicao`: Novo/Usado/Seminovo),
Qual Linha (multi, `Opt.ProdutosLinhas`: Primeira/Segunda/Terceira Linha, Usado), Descrição, e quatro fotos
(Superior, Inferior, Frontal, Lateral).

**Hierarquia de classificação:** `ProdutosTipo` (pai, tem ícone) → `ProdutosGrupo` (filho, aponta o tipo em
`QualTipoProduto`) → `ProdutosModelo` (aponta os dois). **Não existe tela para criar Tipo ou Grupo** em lugar nenhum do
mapa (§10). Cuidado com os ids: `Tbl.ProdutosTipo` é a tabela `tbl_produtosgrupo` e `Tbl.ProdutosGrupo` é
`tbl_produtossubgrupo` — os nomes foram trocados em alguma refatoração (§8.3).

**Gravar produto novo** — WF **bTgeR** (condição: sem produto carregado):
1. (bTgeW) cria `Tbl.ProdutosModelo` com `Ativo = true`, descrição, as quatro fotos,
   **`NomeModelo` gravado em minúsculas** (`:to_lowercase`), tipo, grupo, condições, linhas e
   `QuaisFornecedoresFiliais` = o custom state `var_quaisfornecedores_`;
2. (bTgeX) em `produto.QuaisVersoesProduto`, grava `QualProdutoModelo = produto` — **lista vazia num produto recém-criado,
   passo sem efeito**;
3. (bTmPV0) em cada filial de `QuaisFornecedoresFiliais`, grava `QuaisProdutos = produto` (lado inverso da relação);
4. (bTgeb) reseta o reusable; (bTmNx0) limpa `var_quaisfornecedores_`.

**Gravar edição** — WF **bTged**: (bTgei) regrava descrição, fotos, nome (de novo em minúsculas), tipo, grupo, condições e
linhas; (bTgej) reseta. **Não regrava `QuaisFornecedoresFiliais`** — os fornecedores já foram gravados um a um (abaixo).

**Adicionar fornecedor ao produto:**
- modo novo — WF **bTgdm**: (bTmNq) `var_quaisfornecedores_ = var_quaisfornecedores_ :plus_element(filial escolhida)`;
  (bTgdr) reseta o campo. Nada vai ao banco até gravar.
- modo edição — WF **bTgdt**: (bTmPR0) na **filial**, `QuaisProdutos = produto`; (bTgdy) no **produto**,
  `QuaisFornecedoresFiliais = filial`; (bTgdz) reseta o campo. Grava direto, sem passar pelo botão "Salvar".

**Remover fornecedor do produto:**
- modo novo — WF **bTgeE**: (bTmNw0) `:minus_element(filial da linha)`.
- modo edição — WF **bTgeK**: (bTmPQ0) na filial, `QuaisProdutos = produto`; (bTgeP) no produto,
  `QuaisFornecedoresFiliais = filial`. **O mapa mostra `=` nos dois passos, igual ao "adicionar"** — o operador de lista
  (add/remove) não foi decompilado. Pela intenção do botão (ícone `delete`) é remover em ambos (§10).

Campo morto: `ProdutosModelo.cpo.QuaisFornecedores` (lista de `GrupoCliFor`) aparece na tabela como
`cpo.QuaisFornecedores - deleted:count` na coluna "Qtd Fornecedores" — o contador exibido é o do campo **excluído**, ou
seja, mostra zero para tudo que foi cadastrado pela relação nova (§8.1).

### 4.9 Preferências do usuário (só no `pop.CadastroCliFor`)

- **bTjlT** (bTjlZ) — muda `dd ordem` → `User.OrdenarCampos`.
- **bTmFa** (bTmFg) — muda `radio busca` → `User.BuscaExataProxima`.
- **bTmGV** (bTmGb) — muda `dd tipo clifor` → `User.FiltraTipoClifor`.
- **bTmFn** (bTmFt) / **bTmFx** (bTmFz) — botão "expandir todos" liga/desliga `User.ExpandirCadastroClifor`.
  Esse booleano força `is_visible=true` no painel de detalhe **da página** também.

### 4.10 Atalhos diversos

- **Abrir no mapa** — WF **bTgvt** (bTgvy): `OpenURL` em `{Localizacaoo:google_map_link}&zoom=15`, aba nova. Na página
  `cadastros` o ícone `Icon O` (bUCZt0) existe com a mesma condicional de habilitação, mas **não tem workflow**.
- **Copiar CNPJ** — WF **bTgwi** (bTgwn): ação `AAQ` do plugin `1609444246883x924984661248573400` com
  `AAP = CNPJ da filial`. Pelo padrão de uso é "copiar para a área de transferência" (§10).
- **Endereços e contatos** — a abertura dos popups de endereço e contato está descrita nos WF bUCcZ0, bUCcf0, bUCdE0,
  bUCdL0 (página) e bTgvh, bTgxA, bTgvC, bTgvZ (popup); o conteúdo deles é de outro agente. Registre-se só o contrato:
  quem abre passa `var_a__oclifor_` (`Opt.AçãoCliFor`), `var_qualgrupoclifor_`, `var_qualendereco_`/`var_qualcontato_`
  e, às vezes, `var_destravarcampos_`.

### 4.11 Validações — o que existe hoje

Muito pouco, e nada no servidor:

| Regra | Existe? |
|---|---|
| CNPJ/CPF obrigatório | não neste módulo (é do popup de endereço) |
| CNPJ/CPF **único** | **não** — nenhuma busca por duplicidade em lugar nenhum do mapa |
| Dígito verificador de CNPJ/CPF | **não há** validação nem integração de consulta (§6) |
| Inscrição estadual | campo texto livre `cpo.InscEstadual`; **nenhuma validação**. O tipo de anexo "Inscrição Estadual" existe, mas é documento, não validação |
| Inscrição municipal | idem (`cpo.InscMunicipal`, id `cpo_instmunicipal_text` — com erro de digitação) |
| Regime tributário | `cpo.QualRegimeTributario` (`opt.RegimeTributario`: Lucro Real/Presumido, Simples Nacional, Mei/Autonomo). **Nenhuma validação e nenhuma obrigatoriedade aqui.** É consumido no backend `AdicionarFornecedores` (bTNrd): só quando **origem e destino** são "Lucro Real/Presumido" é que se calcula ICMS e comissão de 9,25%; caso contrário, o orçamento nasce sem esses valores (§6) |
| Tipo de pessoa | `cpo.TipoPessoa` (`Opt.TipoPessoa`: cpf/cnpj) existe na filial; **nada nesta tela o usa** |
| Nome do produto único | **não** — e o nome é gravado em minúsculas, o que facilitaria um índice único |
| Tipo e Grupo do produto | `mandatory=True` nos dropdowns (validação de navegador) |
| Arquivo do anexo | `mandatory=True`, `max_size=3` MB (navegador) |
| Motivo do bloqueio | **não é obrigatório** no toggle por filial |

---

## 5. Cálculos e valores

**Não há dinheiro neste módulo.** Os únicos números calculados são contagens e uma diferença de datas, todas feitas
**no navegador**, linha a linha:

| Onde | Expressão | Observação |
|---|---|---|
| `Text P` (bUEpJ) | `Search(GrupoCliFor: Ativo = true AND QualTipoCliFor = Cliente):count` | busca global, ignora os filtros da tela |
| `Text Q` (bUEpP) | idem para Fornecedor | idem |
| `gp numero indice` | `CellIndex` / `Ancestor[Table]:get_list_data:count` | — |
| "Contém: N Endereços \| M Contatos" | `QuaisEnderecos:count` / `QuaisContatos:count` | conta o tamanho da lista, inclusive inativos |
| "Anexos: N" | `QuaisAnexos:count` | — |
| Situação do contrato | dois `Search(Tbl.Anexos)` `:count` por linha | §3.2 |
| "N dias" sem conversa | `Page.Current Date/Time :minus(UltimoHistoricoData) :to_days :format_number(0)` | inteiro truncado; se `UltimoHistoricoData` está vazio, o resultado é sem sentido (mas o texto só aparece se existir histórico) |
| "Qtd Fornecedores" do produto | `QuaisFornecedores - deleted:count` | campo excluído → sempre 0 (§8.1) |

Campos que **parecem** número e são **texto**: `cpo.CapacidadeCompra` (grupo e filial) e `cpo.Demanda`. `cpo.IdCliforAntigo`
é `number` (código do sistema anterior).

---

## 6. Integrações e backend workflows

**Nenhuma integração de consulta de CNPJ ou de CEP.** `mapa/integracoes.md` lista só `EstudoDePedidos`, `LeituraGmail`
(Gmail API + OAuth) e `GestaoLure` (bug report para outro app Bubble). Não há ReceitaWS, BrasilAPI, ViaCEP ou similar. O
CNPJ e o endereço são **digitados à mão**. A geolocalização (`cpo.Localizacaoo`, `geographic_address`) vem do widget de
endereço do Bubble (plugin `google`), usada só para o link do Google Maps (WF bTgvt).

Plugins usados neste módulo:
- `1680110374647x249108010620944400` (v1.5.13) — o **Switch** (`/AAC`); evento `/AAJ` = "mudou"; `AAI` = valor;
  `AAK` = desabilitado.
- `1753734310015x839297739754045400` (v1.0.3) — **IconToggle multi-estado**; evento `/AAR`; usado nos toggles de
  ordenação e de ativo/inativo da página.
- `1609444246883x924984661248573400` (v2.0.0) — ação `/AAQ` no WF bTgwi (copiar CNPJ, §10).
- `select2` — os multi-dropdowns de Condição e Linha do produto.

**Backend workflows (`mapa/backend-workflows.md`) que tocam este módulo:**

| APIEvent | O que faz | Relevância |
|---|---|---|
| `copiainfoaddparafilial` (bTmQp) | copia `CapacidadeCompra`, `Corporativo`, `Demanda`, `Frete`, `NomeComprador`, `Observacoes` do **grupo** para as filiais dos grupos com **exatamente 1** endereço | script de migração de uma vez só; **não recriar** (§8.1) |
| `copiainfoaddparafilial_copy` (bTnzH1) | o mesmo para grupos com **mais de 1** endereço, e depois de novo só para o primeiro | cópia do anterior; **não recriar** |
| `AdicionarFornecedores` (bTNrd) | ao montar o orçamento, usa `EnderecosCliFor.QualRegimeTributario` da origem e do destino para decidir se há ICMS (`Tbl.IcmsEstados` por UF origem→destino) e comissão 9,25% | **consumidor** do regime tributário: é por isso que esse campo da filial não pode ficar vazio |
| `AdicionarProdutos` (bTNin) | cria `CotacaoProdutos` a partir de `ProdutosModelo` | consumidor do cadastro de produtos |
| `AtribuirModeloProdutoOrcamento` (bUAhf) | preenche `QualProdutoModelo` em **todos** os `OrcFornecedoresCotacao` | correção retroativa; não recriar |

Nenhum backend workflow é disparado por esta tela. Tudo aqui é gravação direta do navegador.

---

## 7. Segurança e privacidade

O cadastro guarda **dado pessoal** (nome, e-mail, telefone e cargo de contatos; foto e documentos de usuários) e
**documento fiscal** (CNPJ/CPF, inscrição estadual e municipal, regime tributário, contrato social, dados bancários,
cartão CNPJ, CND, sintegra). Hoje está tudo aberto:

**Como está no Bubble**
- `Tbl.GrupoCliFor`, `Tbl.EnderecosCliFor`, `Tbl.ContatoCliFor`, `Tbl.ProdutosModelo`, `Tbl.ProdutoVersao` têm regra de
  privacidade **`everyone`** com `view_all: true` e `search_for: true` — **sem condição alguma**. Com
  `expõe Data API: True` (integracoes.md), a base de clientes, CNPJs e contatos é legível por qualquer requisição à
  Data API.
- `Tbl.Anexos` **não tem regra de privacidade declarada** no mapa. Os arquivos ficam em URL pública de CDN
  (`OpenURL` direto no `AnexoFile`, WF bTjec) — quem tiver o link lê o contrato social sem estar logado.
- **Auto-binding** liberado em campos sensíveis para qualquer usuário logado:
  `GrupoCliFor`: `cpo_ativo_boolean`, `cpo_qualcarteira_user`, `cpo_fazcontratoparceria_boolean`;
  `EnderecosCliFor`: `cpo_ativo_boolean`, `cpo_qualregimetributario_...`, `cpo_qualgrupoclifor_...`,
  `cpo_bloqueado_boolean`, `cpo_bloqueadomotivo_text`;
  `ContatoCliFor`: `cpo_ativo_boolean`. Auto-binding grava **sem passar por workflow**: quem trocar a carteira,
  o regime tributário ou liberar uma filial bloqueada no navegador consegue, e não fica registro de quem foi.
- O botão de apagar anexos em massa (bTjeL) não tem restrição de perfil.
- O filtro por departamento dos anexos (`DeptosVisualizam`) roda no navegador.

**O que o app novo precisa ter**
1. **RLS ligada em todas as tabelas do módulo** desde a primeira migration: `grupos_clifor`, `enderecos_clifor`,
   `contatos_clifor`, `anexos`, `produtos`, `produtos_tipo`, `produtos_grupo`, `produto_fornecedor`, `historicos`.
   Nenhuma delas pode ficar com `USING (true)` para `anon`.
2. **Leitura:** usuário autenticado e ativo. Vendedor enxerga tudo que hoje enxerga (a tela não restringe por carteira),
   mas **anexo** é filtrado por `tipo_anexo.deptos_visualizam @> array[usuario.departamento]` **no servidor** — política
   RLS, não `:filtered`.
3. **Escrita:**
   - criar/editar fornecedor: perfil Diretor, Gerente, Analista ou departamento Financeiro (unificar a divergência do §1);
   - inativar fornecedor: `hierarquia ≤ 2`;
   - bloquear/liberar filial: perfil a definir (§10), sempre com motivo e registro de autor/data;
   - apagar anexo: `hierarquia ≤ 2`, **um por vez**, com confirmação. **Apagar em massa não vai para o app novo**;
   - trocar carteira: não pode ser auto-binding anônimo — server action com registro de quem trocou.
4. **Arquivos:** bucket **privado** no Supabase Storage, acesso por **URL assinada de curta duração** gerada no servidor.
   Nunca URL pública. Limite de tamanho no servidor também (hoje só no navegador).
5. **Nada de `service_role` no cliente.** Toda gravação passa por server action.
6. **Não expor ao navegador** o que a tela não mostra: a listagem deve vir por view com as colunas necessárias, não um
   `select *` de `enderecos_clifor` (que carrega CNPJ, IE, IM e observações de todo mundo para montar um combo).
7. **Auditoria:** `criado_por`, `criado_em`, `alterado_por`, `alterado_em` em todas as tabelas do módulo, e tabela
   `clifor_bloqueios` com histórico (hoje só sobra o último motivo).
8. **LGPD:** contatos e documentos de usuários são dado pessoal. Prever expurgo/anonimização e registro de acesso a anexo.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto e restos

- **WF vazios:** `bUCdV0` (SEM_TIPO), `bUCeL0` (clique em `gp nomeclifor` sem ação), `bUEuM` (InputChanged no dropdown de
  carteira), `bTkNl` (PopupOpened do `pop.AnexosClifor`).
- **WF desativados** (`workflow_disabled=True`): `bTgvO` e `bTgwp`, versões antigas de "novo contato" e "novo endereço"
  que apontam para elementos que não existem mais (`bTIgI`, `bTMYk`, `bTKuD`) e para o custom state
  `custom.cpo_a__oclifor_` (grafia antiga).
- **`pop.CadastroCliFor` inteiro** é a tela anterior da página `cadastros`: 134 elementos e **32 workflows** duplicando o
  que a página faz. O menu já manda para a página (`tool.MenuConfig` WF bTgyl). Ele continua instanciado duas vezes no
  próprio `tool.MenuConfig` (bTjxk e bTgyf) e uma vez em `pagina-vendas` (bThVR), sem nada que o mostre. **Não portar.**
  Portar só o que **existe nele e não existe na página** (ver 8.2).
- **Apagar todos os anexos** (bTjeL, ícone bTjdU): botão de destruição em massa sem confirmação nem perfil. **Não portar.**
- **Campo excluído em uso:** a coluna "Qtd Fornecedores" lê `cpo.QuaisFornecedores - deleted:count`, sempre 0.
- **Ordenação impossível:** `src filter produto` (bTgbu) ordena `Tbl.ProdutosModelo` por `cpo.NomeCliFor`, campo que não
  existe nessa tabela.
- **Condicionais contraditórias:** `gp busca produto` (bTgbn) e `rpg modelo produto` (bTgcB) têm a **mesma** condição
  (`gp dados do produto:is_visible`) mandando `is_visible=True` e `is_visible=False`. A primeira deveria ser
  `is_not_visible`. Refazer como "lista **ou** formulário", não os dois com condicionais.
- **Condicional vazia:** `Cell A` (bUCWO0) tem `⟂ quando ∅ →`.
- **Ícone sem workflow:** `Icon O` (bUCZt0), o "abrir no mapa" da página `cadastros`, tem a condicional de
  habilitação mas nenhum WF — na página, o mapa não abre (no popup abre, WF bTgvt).
- **Passo sem efeito:** bTgeX grava `QualProdutoModelo` na lista `QuaisVersoesProduto` de um produto recém-criado
  (sempre vazia).
- **Backend de migração:** `copiainfoaddparafilial` e `copiainfoaddparafilial_copy` são scripts de uma vez só (e um é
  cópia literal do outro, com um passo a mais redundante). Não recriar; a duplicação de dados que eles espalharam some
  com o modelo novo (§8.4).
- **Filtro perdido na migração da tela** (verificado em `mapa/pagina-cadastros_old.md`, usado só para isto): a página
  antiga tinha `dd captacao` com WF `bTxuK`, filtro por `Opt.CaptacaoCliente`; a página nova trocou esse filtro pelo
  checkbox "Clientes sem carteira" e **perdeu o filtro de captação**, que continua existindo no `pop.CadastroCliFor`
  (`dd captacao` bTrns). O campo `GrupoCliFor.Captacao` continua no banco. Decidir em §10.
- **Textos e nomes repetidos:** "Endereços do cliente"/"Contatos do cliente" aparecem também no cartão de fornecedor;
  dezenas de elementos chamados `Text A`, `Group A`, `Cell A`, `Icon B`.
- **Placeholder errado:** `upi novocliente logo` ("LOGO") num input que na verdade edita a foto de um grupo existente.

### 8.2 Duplicação

- **Onze pares de workflow espelhados** na página (§4.2) só para "seleciona se diferente / limpa se igual". No app novo é
  uma linha: `setSelecionado(id === selecionado ? null : id)`.
- **Duas telas para o mesmo cadastro** (página `cadastros` × `pop.CadastroCliFor`), com regras **divergentes**:
  perfis que criam fornecedor, escopo do dropdown de carteira, gravação de `UltimoQue(Des)ativou`, cascata de ativação
  quando há uma filial só, gravação das preferências do usuário, filtro de captação, filtro de UF. **Uma tela só**, com a
  união das regras (§10 decide cada divergência).
- **Dois workflows no mesmo switch** (`bTmPW0` + `bTmPd0`), o segundo refazendo o que o primeiro já fez.
- **Quatro workflows** (`bTgwD`, `bTgwK`, `bTgwR`, `bTgwb`) para focar/desfocar uma filial, dois por coluna clicável.
- **Dois workflows por botão do cadastro de produtos** (add/cut fornecedor, gravar), separados só por "tem produto ou
  não". No app novo, uma server action com `upsert`.
- **Duas buscas globais de contagem** (`Text P`, `Text Q`) que poderiam vir da mesma consulta da lista.
- **Duas buscas em `Tbl.Anexos` por linha** só para decidir o texto do contrato de parceria.
- **Busca de última conversa duplicada:** a data vem de `Search(Historico):last_element` e os dias de
  `UltimoHistoricoData`.

### 8.3 Gambiarras e nomes que enganam

| O que se vê | O que é de fato |
|---|---|
| `GrupoCliFor.cpo.Observacoes` | id `cpo_codcliente_text` — era o **código do cliente** e virou observações. **Não existe código de cliente hoje** |
| `EnderecosCliFor.cpo.Liberado` | id `cpo_bloqueado_boolean`. `Liberado = true` significa "não bloqueado" |
| `EnderecosCliFor.cpo.LiberadoMotivo` | id `cpo_bloqueadomotivo_text` — é o motivo do **bloqueio** |
| `GrupoCliFor.cpo.NãoFazContratoParceria` | id `cpo_fazcontratoparceria_boolean` — o id diz o oposto do rótulo |
| `Tbl.ProdutosTipo` | tabela `tbl_produtosgrupo` |
| `Tbl.ProdutosGrupo` | tabela `tbl_produtossubgrupo` |
| `Tbl.ProdutosModelo` | tabela `tbl_produtos`; o campo "nome" é `cpo_nome_text` |
| `EnderecosCliFor.cpo.InscMunicipal` | id `cpo_instmunicipal_text` (erro de digitação) |
| `Tbl.Anexos.cpo.QualEndereco` | os workflows chamam o campo de `cpo.QualOrigem` |
| `Tbl.cnpjformatado` | tabela auxiliar com `cnpj formatado` + `qual grupoclifor`, resto de alguma deduplicação manual |
| `EnderecosCliFor.cpo.QualNomeGrupoCliFor` | cópia em texto do nome do grupo, só para a "busca próxima" funcionar |
| Dropdown "carteira" com auto-binding | troca o dono da carteira **sem workflow e sem registro** |
| `MultilineInput B` do bloqueio com auto-binding | grava o motivo do bloqueio a cada tecla |
| `Opt.OrdenarCampos` tem `Descending` | e a busca ignora, usando sempre `desc` |
| `Opt.TipoAnexo` "Alvará de Funcionamento" | é usado como **semente de modo** do popup, não como tipo do anexo |

### 8.4 Otimizações para o banco novo

**Option set → tabela:**
- `Opt.UFs` (27) → tabela `ufs(sigla, nome)`, FK em `enderecos_clifor.uf`. Hoje UF está **duas vezes** na filial
  (`cpo.UF` texto **e** `cpo.QualUfOpt` option set) e as duas são usadas em lugares diferentes (a tela usa a option,
  o backend de ICMS usa o texto).
- `Opt.TipoAnexo` (26) → tabela `tipos_anexo(codigo, descricao, qual_cadastro, deptos_visualizam)`. É a que mais pede:
  tem atributos, cresce com o tempo e serve de regra de visibilidade.
- `Opt.ProdutosCondicao`, `Opt.ProdutosLinhas`, `opt.RegimeTributario`, `Opt.CaptacaoCliente`, `Opt.TipoFrete`,
  `Opt.TipoTelefone` → tabelas pequenas de domínio (ou enums, se nunca mudarem; `TipoAnexo` e `UFs` **não** podem ser enum).
- `opt.TipoCliFor` e `Opt.TipoPessoa` → enum (`tipo_clifor`, `tipo_pessoa`), são estáveis.
- `Opt.SimNão` e `Opt.OrdenarCampos` **não viram nada**: são artifício de interface (tri-state de filtro e ordenação).

**Lista do Bubble → tabela de ligação / FK:**
- `GrupoCliFor.QuaisEnderecos` → some. `enderecos_clifor.grupo_id` (FK) já é a relação.
- `GrupoCliFor.QuaisContatos` → some. `contatos_clifor.grupo_id`.
- `GrupoCliFor.QuaisAnexos` e `EnderecosCliFor.QuaisAnexos` → somem. `anexos.grupo_id` / `anexos.endereco_id`.
  Hoje a mesma relação é gravada **três vezes** (WF bTjdz) e nada as mantém em sincronia quando se apaga (WF bTjeV).
- `ProdutosModelo.QuaisFornecedoresFiliais` ↔ `EnderecosCliFor.QuaisProdutos` → **uma** tabela de ligação
  `produto_fornecedor(produto_id, endereco_id)` com PK composta. Hoje são duas listas mantidas à mão em quatro workflows.
- `ProdutosModelo.QuaisFornecedores` (lista de grupos) → **apagar**, já está marcada como excluída.
- `ProdutosModelo.QuaisCondicoes` e `QuaisLinhas` (listas de option) → `produto_condicao` e `produto_linha`
  (tabelas de ligação) ou arrays de enum, se nunca precisarem de atributo.
- `ProdutosModelo.QuaisVersoesProduto` ↔ `ProdutoVersao.QualModeloProduto` → só a FK.
- `User.QuaisAnexos` → `anexos.usuario_id`.

**Campo calculado → view:**
- "Clientes ativos" / "Fornecedores ativos" → `vw_clifor_resumo` (ou uma contagem na mesma consulta da lista).
- "N Endereços | M Contatos | N Anexos" → colunas agregadas em `vw_clifor_lista` (`count(*) filter (where ativo)`).
- Situação do contrato de parceria → coluna calculada na view:
  `case when nao_faz_contrato then 'nao_faz' when exists(anexo tipo contrato) then 'anexo' else 'sem' end`.
- Última conversa e dias sem contato → `lateral join` no `historicos` mais recente. **Apagar**
  `UltimoHistoricoData` e `UltimoHistoricoMsg` (desnormalizações que já divergem da busca, §3.2).
- `EnderecosCliFor.QualNomeGrupoCliFor` → **apagar**; o nome vem do join, e a "busca próxima" vira `ILIKE`/trigram.
- Contagem de fornecedores do produto → `count(*)` na view, não campo.

**Outras:**
- Os campos que `copiainfoaddparafilial` espalhou do grupo para as filiais (`CapacidadeCompra`, `Corporativo`, `Demanda`,
  `Frete`, `NomeComprador`, `Observacoes`) existem **nos dois lados**. Decidir um dono (§10): proposta = **filial**, com
  o grupo servindo de default na criação. Idem `cpo.Liberado`/`LiberadoMotivo` (proposta: **filial**, o grupo não usa) e
  `TipoClifor` (proposta: **grupo**, a filial herda por join).
- `IdCliforAntigo` vira `codigo_legado` (index, não único — pode repetir entre filiais do mesmo grupo).
- `Tbl.cnpjformatado` não migra.
- Bloqueio vira tabela de histórico (`clifor_bloqueios`), com a filial guardando só o estado corrente.
- Texto que é número: `CapacidadeCompra` e `Demanda` — conferir o conteúdo real antes de migrar (§10).

---

## 9. Proposta para o app novo

### 9.1 Rotas

- `app/(app)/cadastros/page.tsx` — Server Component. Lista de clientes/fornecedores. Diferente de hoje, **estado na URL**
  (hoje não há nenhum parâmetro, §2.3), validado com zod:
  `?tipo=cliente|fornecedor` · `?q=` (texto) · `?modo=nome|cnpj|proximo` · `?uf=` · `?ativo=sim|nao|todos` ·
  `?semCarteira=1` · `?captacao=` · `?ordem=recente|nome` · `?sel=<uuid do grupo>`.
  Defaults vindos de `user_preferences` (tipo, modo de busca, ordem, expandir).
- `app/(app)/cadastros/[grupoId]/page.tsx` — opcional, para link direto ao grupo (hoje impossível). Alternativa: só o
  `?sel=`.
- `app/(app)/produtos/page.tsx` — cadastro de produtos como **página**, não popup (hoje é popup do menu de configurações
  e da tela de vendas). Mantém-se um `DialogCadastroProduto` reaproveitável para o fluxo de cotação em `vendas`.
- Layout `(app)` checa sessão e permissão de página numa tabela `permissoes_pagina` (regra do menu de hoje), no servidor.

### 9.2 Componentes

- `CliforFiltros` — rádio Cliente/Fornecedor, três modos de busca, UF, ativo/inativo, "sem carteira", captação, ordenação.
  Tudo escreve na URL (`router.replace`, sem scroll).
- `CliforTabela` — a lista de grupos (TanStack Table, virtualizada). Linha com foto, nome, situação do contrato,
  contadores, seletor de carteira, atalhos de anexo/bloqueio/histórico e switch de ativo. Clique em qualquer área
  seleciona/desseleciona (substitui os 12 WF do §4.2).
- `CliforDetalhe` — painel do grupo selecionado: `TabelaEnderecos` e `TabelaContatos`, com os botões "Novo" e "Editar"
  que chamam os diálogos de **outro módulo** (endereços e contatos).
- `DialogBloquearFiliais` — porta do `pop.BloquearClifor`: bloqueio em massa com motivo obrigatório e toggle por filial
  **também com motivo obrigatório** (corrige §4.5).
- `DialogAnexos` — porta do `pop.AnexosClifor`, dois modos (clifor / usuário) por prop, não por option set.
  Sem botão de apagar em massa; apagar linha com confirmação.
- `DialogHistoricoConversas` — o `pop historico` do `pop.CadastroCliFor` (a página hoje delega ao
  `pop.HistoricoConversas`, de outro módulo; unificar — §10).
- `ProdutoForm` (nome, tipo, grupo dependente, condições, linhas, descrição, 4 fotos) + `ProdutoFornecedores`
  (autocomplete de filiais fornecedoras, lista removível) + `ProdutosTabela`.
- `SeletorCarteira` — server action, não auto-binding.
- `UploadArquivo` — valida tipo e tamanho **no servidor**, grava em bucket privado.

### 9.3 Server actions

| Ação | Regra |
|---|---|
| `alterarCarteira(grupoId, usuarioId)` | só perfis autorizados; registra `alterado_por`/`alterado_em`; substitui o auto-binding |
| `definirAtivoGrupo(grupoId, ativo)` | transação: grava no grupo, cascateia para as filiais, registra `ultimo_que_desativou` (o que hoje só o popup faz). Fornecedor só com `hierarquia ≤ 2` |
| `definirAtivoEndereco(enderecoId, ativo)` | se o grupo tem **uma** filial, propaga para o grupo (regra do WF bTmGc, hoje só no popup) |
| `definirAtivoContato(contatoId, ativo)` | — |
| `definirNaoFazContratoParceria(grupoId, valor)` | só Fornecedor |
| `bloquearFiliais({grupoId, motivo})` | transação: `liberado=false` + motivo em todas as filiais; insere linhas em `clifor_bloqueios` |
| `alternarBloqueioFilial({enderecoId, liberado, motivo})` | **motivo obrigatório nos dois sentidos**; insere em `clifor_bloqueios`; limpa o motivo corrente ao liberar |
| `anexarDocumento({grupoId ou usuarioId, enderecoId?, tipoAnexoId, arquivo})` | valida tipo/tamanho no servidor, grava no bucket privado, insere `anexos` (uma FK, sem listas) |
| `excluirAnexo(anexoId)` | `hierarquia ≤ 2`; apaga registro **e** o objeto do Storage; confirmação no cliente |
| `urlAssinadaAnexo(anexoId)` | checa `deptos_visualizam` no servidor e devolve URL assinada curta |
| `registrarHistorico({grupoId, descricao})` / `editarHistorico(id, descricao)` | editar **não** troca o vendedor original (corrige §4.7) |
| `salvarProduto({id?, ...})` | `upsert`; nome normalizado (`lower(trim())`); valida que `grupo.tipo_id = tipo_id` |
| `vincularFornecedorProduto(produtoId, enderecoId)` / `desvincularFornecedorProduto(...)` | `insert`/`delete` na tabela de ligação (substitui bTgdm/bTgdt/bTgeE/bTgeK) |
| `definirAtivoProduto(produtoId, ativo)` | — |
| `salvarPreferenciasCadastro({tipo, modoBusca, ordem, expandir, captacao})` | `user_preferences` |

Todas com zod na entrada, checagem de permissão no servidor e retorno tipado; `revalidatePath` na rota.

### 9.4 Consultas e views SQL

- **`vw_clifor_lista`** — uma linha por grupo, já com: `tipo`, `nome`, `ativo`, `foto`, `carteira_id`/`carteira_nome`,
  `qtd_enderecos`, `qtd_enderecos_ativos`, `qtd_contatos`, `qtd_anexos`, `situacao_contrato_parceria`
  (`nao_faz` | `anexo` | `sem`), `ultima_conversa_em`, `dias_sem_conversa`, `criado_em`, `criado_por_nome`.
  Substitui o RG invisível, as duas buscas de anexo por linha e a busca de histórico por linha.
- **`fn_clifor_busca(p_tipo, p_texto, p_modo, p_uf, p_ativo, p_sem_carteira, p_captacao, p_ordem)`** — devolve
  `vw_clifor_lista` filtrada. O filtro por UF e por CNPJ vira `EXISTS (select 1 from enderecos_clifor e where
  e.grupo_id = g.id and ...)`, não `distinct` sobre endereços. "Busca próxima" = `unaccent(nome) ILIKE '%'||p_texto||'%'`
  com índice trigram.
- **`vw_enderecos_clifor`** — filial + nome do grupo + UF por extenso + estado do bloqueio + qtd de anexos.
- **`vw_produtos_lista`** — produto + tipo + grupo + ícone do tipo + `count` de fornecedores (da tabela de ligação) +
  condições e linhas agregadas.
- **`vw_anexos_visiveis`** — anexos com o `tipo_anexo` resolvido; a RLS aplica `deptos_visualizam`.
- **Contadores do topo:** `select tipo, count(*) filter (where ativo) from grupos_clifor group by tipo` — uma consulta,
  não duas buscas por render.

### 9.5 Tabelas, chaves e índices

Como o cadastro é a base do resto do sistema, as chaves abaixo são o contrato:

```
grupos_clifor
  id                uuid pk default gen_random_uuid()
  tipo              tipo_clifor not null           -- enum: cliente | fornecedor
  nome              text not null
  ativo             boolean not null default true
  foto_url          text
  carteira_id       uuid references usuarios(id)   -- só cliente
  captacao_id       smallint references captacoes(id)
  nao_faz_contrato_parceria boolean not null default false
  observacoes       text                            -- era cpo_codcliente_text
  codigo_legado     integer                         -- do Bubble / sistema antigo
  criado_em/por, alterado_em/por
  UNIQUE (lower(unaccent(nome)), tipo)              -- evita "MEGA BOX" e "Mega Box" duplicados
  INDEX (tipo, ativo), INDEX (carteira_id) WHERE tipo='cliente',
  INDEX GIN trigram em unaccent(nome)

enderecos_clifor
  id                uuid pk
  grupo_id          uuid not null references grupos_clifor(id) on delete restrict
  nome_endereco     text not null                   -- "filial X"
  documento         text not null                   -- só dígitos, CNPJ ou CPF
  tipo_pessoa       tipo_pessoa not null            -- enum: cpf | cnpj (derivável do tamanho)
  insc_estadual     text
  insc_municipal    text
  regime_tributario_id smallint not null references regimes_tributarios(id)
  cep, logradouro, numero, complemento, bairro, municipio
  uf                char(2) not null references ufs(sigla)
  localizacao       geography(point)                 -- opcional
  ativo             boolean not null default true
  liberado          boolean not null default true    -- false = bloqueada
  liberado_motivo   text
  principal         boolean not null default false
  corporativo       boolean not null default false
  frete_id          smallint references tipos_frete(id)
  capacidade_compra text, demanda text, nome_comprador text, observacoes text
  codigo_legado     integer
  UNIQUE (documento)                                 -- índice único global: um CNPJ, uma filial
  UNIQUE (grupo_id) WHERE principal                  -- uma matriz por grupo
  INDEX (grupo_id), INDEX (uf), INDEX (ativo, liberado),
  INDEX GIN trigram em documento                     -- para a "busca por CNPJ"
  CHECK (regime/UF coerentes com tipo_pessoa)

contatos_clifor      -- módulo vizinho; aqui só a FK
  id, grupo_id not null, endereco_id null references enderecos_clifor(id), ...
  INDEX (grupo_id), INDEX (endereco_id)

tipos_anexo
  id smallint pk, codigo text unique, descricao text,
  qual_cadastro text not null,                       -- 'clifor' | 'usuario'
  deptos_visualizam smallint[] not null
anexos
  id uuid pk
  tipo_anexo_id smallint not null references tipos_anexo(id)
  grupo_id    uuid references grupos_clifor(id) on delete cascade
  endereco_id uuid references enderecos_clifor(id) on delete set null
  usuario_id  uuid references usuarios(id) on delete cascade
  storage_path text not null, nome_arquivo text, tamanho_bytes bigint, mime text
  criado_em/por
  CHECK ((grupo_id is not null) <> (usuario_id is not null))   -- ou clifor ou usuário
  INDEX (grupo_id, tipo_anexo_id), INDEX (endereco_id), INDEX (usuario_id)

clifor_bloqueios      -- histórico; hoje não existe
  id, endereco_id not null, liberado boolean not null, motivo text not null,
  em timestamptz not null default now(), por uuid not null references usuarios(id)
  INDEX (endereco_id, em desc)

produtos_tipo   id smallint pk, nome text not null, icone_url text, UNIQUE(lower(nome))
produtos_grupo  id smallint pk, tipo_id smallint not null references produtos_tipo(id),
                nome text not null, UNIQUE (tipo_id, lower(nome))
produtos
  id uuid pk
  nome        text not null                          -- guardar normalizado (lower/trim)
  tipo_id     smallint not null references produtos_tipo(id)
  grupo_id    smallint not null references produtos_grupo(id)
  descricao   text
  foto_superior_url, foto_inferior_url, foto_frontal_url, foto_lateral_url
  ativo boolean not null default true
  criado_em/por, alterado_em/por
  UNIQUE (lower(unaccent(nome)), grupo_id)
  CHECK: trigger ou FK composta garantindo produtos_grupo.tipo_id = produtos.tipo_id
  INDEX (tipo_id, grupo_id, ativo), INDEX GIN trigram em nome
produto_fornecedor
  produto_id uuid references produtos(id) on delete cascade
  endereco_id uuid references enderecos_clifor(id) on delete cascade
  PRIMARY KEY (produto_id, endereco_id)
  INDEX (endereco_id)
  CHECK/trigger: o endereço tem de ser de um grupo tipo 'fornecedor'
produto_condicao(produto_id, condicao_id) / produto_linha(produto_id, linha_id)  -- PK composta
produtos_versao  id, produto_id not null, nome text, ativo boolean

ufs(sigla char(2) pk, nome text)
regimes_tributarios / captacoes / tipos_frete / condicoes_produto / linhas_produto  -- id + nome
historicos  id, grupo_id, endereco_id, vendedor_id, descricao, criado_em  -- INDEX (grupo_id, criado_em desc)
user_preferences  usuario_id pk, tipo_clifor_padrao, modo_busca, ordem, expandir_cadastro, captacao
```

**Os dois índices únicos que precisam de decisão antes da migration:** `enderecos_clifor.documento` e
`produtos (nome, grupo_id)`. A base do Bubble não os tem, então é provável que existam duplicatas — a carga precisa de um
relatório de conflito antes (§10, e `specs/03-plano-de-construcao.md`).

RLS: todas as tabelas acima com `enable row level security` na mesma migration que as cria; leitura para usuário
autenticado e ativo, escrita conforme §7; `anexos` com política extra de `deptos_visualizam`.

---

## 10. Dúvidas

1. **[DÚVIDA]** "Novo fornecedor" na página `cadastros` (WF bUCcr0) **não** grava `var_destravarcampos_ = true`, ao
   contrário de "Novo cliente" (bUCcn0) e das duas versões do popup (bTguS, bTgue). É bug ou o cadastro de fornecedor
   deve começar com campos travados?
   *Recomendação padrão: é bug — destravar nos dois casos.*
2. **[DÚVIDA]** Quem pode criar fornecedor? A página inclui Analista; o `pop.CadastroCliFor` não.
   *Recomendação padrão: valer a regra da página (Diretor, Gerente, Analista ou departamento Financeiro), que é a tela viva.*
3. **[DÚVIDA]** O dropdown de carteira da página exclui os departamentos Financeiro e Operação; o do popup lista todos os
   usuários ativos.
   *Recomendação padrão: valer a regra da página — carteira só para Comercial e Administrativo.*
4. **[DÚVIDA]** Quem pode **bloquear/liberar** filial? Não há nenhuma restrição hoje, nem no botão nem no auto-binding do
   motivo.
   *Recomendação padrão: `hierarquia ≤ 2` (Diretor/Gerente) ou departamento Financeiro, com motivo obrigatório e registro
   de autor/data em `clifor_bloqueios`.*
5. **[DÚVIDA]** Liberar uma filial (WF bUBbj) **não** limpa `LiberadoMotivo`; o motivo do bloqueio anterior fica no
   registro. O motivo deve virar histórico e o campo corrente ser limpo?
   *Recomendação padrão: sim — `clifor_bloqueios` guarda tudo, o campo corrente só vale enquanto bloqueada.*
6. **[DÚVIDA]** `GrupoCliFor.Liberado` / `LiberadoMotivo` existem e ninguém escreve neles. Bloqueio é sempre por filial?
   *Recomendação padrão: sim — bloqueio só em `enderecos_clifor`; apagar os campos do grupo.*
7. **[DÚVIDA]** Operador de lista nos WF bTgeK (bTmPQ0, bTgeP) — "remover fornecedor do produto" aparece no mapa como
   `campo = valor`, idêntico ao "adicionar" (bTgdt).
   *Recomendação padrão: é `remove` nos dois passos; no app novo é `delete` na tabela de ligação e a ambiguidade some.*
8. **[DÚVIDA]** Existe tela para criar **Tipo** e **Grupo** de produto? Não achei nenhuma em todo o mapa; os dropdowns só
   listam.
   *Recomendação padrão: criar um CRUD simples em `/produtos/classificacao`, restrito a `hierarquia ≤ 2`.*
9. **[DÚVIDA]** CNPJ/CPF deve ser **único** no sistema? Hoje nada impede duas filiais com o mesmo documento.
   *Recomendação padrão: único global em `enderecos_clifor.documento` (só dígitos), com relatório de duplicatas antes da
   carga e validação de dígito verificador na entrada.*
10. **[DÚVIDA]** Nome do produto deve ser único (dentro do grupo)? É gravado em minúsculas, o que sugere que sim.
    *Recomendação padrão: único por `(grupo_id, nome normalizado)`.*
11. **[DÚVIDA]** Deve existir um **código de cliente/fornecedor** visível ao usuário? O campo `cpo_codcliente_text` foi
    reaproveitado como observações e `IdCliforAntigo` guarda o código do sistema anterior.
    *Recomendação padrão: criar `codigo` sequencial por tipo (`CLI-0001` / `FOR-0001`), único, exibido na lista, e manter
    `codigo_legado` só para conferência da carga.*
12. **[DÚVIDA]** Regime tributário é **obrigatório** na filial? O backend `AdicionarFornecedores` (bTNrd) muda o cálculo
    de ICMS e comissão conforme o regime, e trata "vazio" como "não Lucro Real".
    *Recomendação padrão: obrigatório em filial de fornecedor; opcional em cliente até o primeiro pedido.*
13. **[DÚVIDA]** Inscrição estadual: deve ser validada (formato por UF) ou obrigatória para quem é Lucro Real/Presumido?
    Hoje é texto livre sem nenhuma checagem.
    *Recomendação padrão: obrigatória quando `tipo_pessoa = cnpj` e regime ≠ MEI/Autônomo, aceitando "ISENTO"; validação
    de formato por UF fica para depois, como aviso e não como bloqueio.*
14. **[DÚVIDA]** Os campos duplicados grupo↔filial (`CapacidadeCompra`, `Corporativo`, `Demanda`, `Frete`,
    `NomeComprador`, `Observacoes`) — quem é o dono?
    *Recomendação padrão: a **filial**; o grupo só sugere o valor ao criar a primeira filial. Os backends
    `copiainfoaddparafilial*` não migram.*
15. **[DÚVIDA]** O filtro de **captação** (`Opt.CaptacaoCliente`), que existe no `pop.CadastroCliFor` e existia na página
    antiga, deve voltar à página nova? O campo `GrupoCliFor.Captacao` continua no banco.
    *Recomendação padrão: sim, voltar como filtro opcional — o dado é preenchido e ninguém consegue mais filtrar por ele.*
16. **[DÚVIDA]** O checkbox "Clientes sem carteira" tem condicional no mesmo RG dos três modos de busca, sem prioridade
    declarada. Ele é um **filtro adicional** (combina com o texto digitado) ou um **modo exclusivo**?
    *Recomendação padrão: filtro adicional, combinável com os demais.*
17. **[DÚVIDA]** Existem **dois** históricos de conversa: `pop historico` embutido no `pop.CadastroCliFor` (com edição) e
    `pop.HistoricoConversas` aberto pela página (WF bUCdt0). São a mesma coisa?
    *Recomendação padrão: unificar num componente só, com a regra de edição do `pop historico` (dono da carteira ou
    Diretor). O outro agente que cuidar de `pop.HistoricoConversas` precisa saber disto.*
18. **[DÚVIDA]** Editar histórico (WF bTjOI) sobrescreve `QualVendedor` com quem editou, apagando a autoria.
    *Recomendação padrão: é bug — manter o autor original e registrar `alterado_por`.*
19. **[DÚVIDA]** Plugin `1609444246883x924984661248573400` ação `/AAQ` no WF bTgwi, recebendo o CNPJ: é "copiar para a
    área de transferência"?
    *Recomendação padrão: sim — no app novo, `navigator.clipboard.writeText` com aviso de confirmação.*
20. **[DÚVIDA]** O limite de 3 MB por anexo (`upf documento`) vale? E quais extensões são aceitas (o mapa não diz)?
    *Recomendação padrão: 10 MB, aceitando PDF, JPG, PNG e WEBP, validado no servidor.*
21. **[DÚVIDA]** `CapacidadeCompra` e `Demanda` são `text`. Guardam número, faixa ou descrição livre?
    *Recomendação padrão: inspecionar os dados na extração; se forem valores, virar `numeric`; se forem faixas, virar
    tabela de domínio.*
22. **[DÚVIDA]** A UF da filial existe duas vezes (`cpo.UF` texto e `cpo.QualUfOpt` option set) e as duas são usadas —
    a tela usa a option, o cálculo de ICMS usa o texto. Há divergência entre elas na base?
    *Recomendação padrão: uma coluna só (`uf char(2)` com FK), conferindo divergências na carga.*
23. **[DÚVIDA]** O `pop.CadastroCliFor` pode ser desligado de vez (não portar)? Ele ainda está instanciado em
    `pagina-vendas` (bThVR), sem workflow que o mostre no trecho mapeado.
    *Recomendação padrão: não portar; confirmar com quem usa a tela de vendas antes do corte.*

---

## 11. Cobertura — todos os 84 workflows

### 11.1 `mapa/pagina-cadastros.md` — 31 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bUCbZ0 | Switch `Switch A` mudou (linha do grupo) | grava `Ativo` no grupo e cascateia para todas as filiais | 4.4 |
| 2 | bUCbf0 | Clique `gp nomeclifor` (≠ selecionado) | seleciona o grupo | 4.2 |
| 3 | bUCbk0 | Clique `gp nomeclifor` (= selecionado) | limpa a seleção | 4.2 |
| 4 | bUCbp0 | Clique `gp numero indice` (≠) | seleciona o grupo | 4.2 |
| 5 | bUCbr0 | Clique `gp numero indice` (=) | limpa a seleção | 4.2 |
| 6 | bUCbw0 | Clique `gp anexos` (≠) | seleciona o grupo | 4.2 |
| 7 | bUCcB0 | Clique `gp anexos` (=) | limpa a seleção | 4.2 |
| 8 | bUCcD0 | Clique `gp bloquear` (=) | limpa a seleção | 4.2 |
| 9 | bUCcI0 | Clique `gp bloquear` (≠) | seleciona o grupo | 4.2 |
| 10 | bUCcN0 | Clique `gp ativo` (=) | limpa a seleção | 4.2 |
| 11 | bUCcP0 | Clique `gp ativo` (≠) | seleciona o grupo | 4.2 |
| 12 | bUCcU0 | Clique `Icon A` (X da busca) | reseta `gp busca cliente` | 4.3 |
| 13 | bUCcZ0 | Clique `btn edita endereço cliente` | abre `pop.AddEditaEndereço` em "Edita Endereço CliFor" com filial e grupo | 4.10 |
| 14 | bUCcf0 | Clique `btn novo endereço cliente` | abre `pop.AddEditaEndereço` em "Novo Endereço CliFor", grupo selecionado, campos destravados | 4.10 |
| 15 | bUCcl0 | Clique `btn novo cliente` | abre `pop.AddEditaEndereço` em "Novo Cliente", campos destravados | 4.1 |
| 16 | bUCcr0 | Clique `btn novo fornecedor` | abre `pop.AddEditaEndereço` em "Novo Fornecedor" (sem destravar campos) | 4.1 |
| 17 | bUCcx0 | Clique `gp carteira` (≠) | seleciona o grupo | 4.2 |
| 18 | bUCcz0 | Clique `gp carteira` (=) | limpa a seleção | 4.2 |
| 19 | bUCdE0 | Clique `btn novo contato` | abre `pop.AddEditaContato` em "Novo Contato Cliente" com o grupo selecionado | 4.10 |
| 20 | bUCdL0 | Clique `btn edita contato cliente` | abre `pop.AddEditaContato` em "Edita Contato Cliente" com grupo e contato | 4.10 |
| 21 | bUCdV0 | — (SEM_TIPO) | **vazio** | 8.1 |
| 22 | bUCdW0 | IconToggle ativo/inativo mudou | limpa a seleção | 4.2 |
| 23 | bUCdb0 | IconToggle de ordenação mudou | limpa a seleção | 4.2 |
| 24 | bUCdd0 | Muda `rad tipo clifor` | limpa a seleção | 4.2 |
| 25 | bUCdn0 | Clique `Icon C` (anexos) | abre `pop.AnexosClifor` com o grupo e tipo semente "Alvará de Funcionamento" | 4.6 |
| 26 | bUCdt0 | Clique `Icon B` (comentário) | abre `pop.HistoricoConversas` com o grupo | 4.7 |
| 27 | bUCdz0 | Clique `Icon E` (X do card) | limpa a seleção | 4.2 |
| 28 | bUCeB0 | Switch `Switch enderecos` mudou | grava `Ativo` na filial | 4.4 |
| 29 | bUCeG0 | Switch `Switch contatos` mudou | grava `Ativo` no contato | 4.4 |
| 30 | bUCeL0 | Clique `gp nomeclifor` | **sem ação** | 8.1 |
| 31 | bUCeM0 | Clique `bt bloquear grupo` | abre `pop.BloquearClifor` com o grupo | 4.5 |

### 11.2 `mapa/reusable-pop.CadastroCliFor.md` — 32 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 32 | bTguM | Clique `btn novo cliente` | reseta e abre `pop.AgendaEnderecos` em "Novo Cliente", campos destravados, sem grupo | 4.1 |
| 33 | bTguY | Clique `btn novo fornecedor` | idem em "Novo Fornecedor" | 4.1 |
| 34 | bTguk | Clique `gp showdetalhes` | abre/fecha `gp endereços+contatos` do cartão | 4.2 |
| 35 | bTgur | Clique `Icon A` (comentário) | abre `pop historico` com o grupo | 4.7 |
| 36 | bTgvC | Clique `btn edita contato cliente` | abre `pop.AgendaContatos` em "Edita Contato Cliente" | 4.10 |
| 37 | bTgvO | Clique `btn novo contato cliente` | **desativado** — versão antiga, elementos inexistentes | 8.1 |
| 38 | bTgvZ | Clique `btn novo contato cliente` | abre `pop.AgendaContatos` com o grupo do cartão | 4.10 |
| 39 | bTgvh | Clique `btn edita endereço cliente` | abre `pop.AgendaEnderecos` em "Edita Endereço CliFor" com filial e grupo | 4.10 |
| 40 | bTgvt | Clique `Icon A` (my_location) | abre o Google Maps na localização da filial, aba nova | 4.10 |
| 41 | bTgwD | Clique `tx cidade endereco` (= em foco) | limpa `var_qualendereco_` | 4.2 |
| 42 | bTgwK | Clique `tx cidade endereco` (≠) | grava `var_qualendereco_` (filtra os contatos da filial) | 4.2 |
| 43 | bTgwR | Clique `tx nome endereco` (= em foco) | limpa `var_qualendereco_` | 4.2 |
| 44 | bTgwb | Clique `tx nome endereco` (≠) | grava `var_qualendereco_` | 4.2 |
| 45 | bTgwi | Clique `tx cidade endereco` | plugin 1609444246883 `/AAQ` com o CNPJ da filial (copiar) | 4.10 |
| 46 | bTgwp | Clique `btn novo endereço cliente` | **desativado** — versão antiga | 8.1 |
| 47 | bTgxA | Clique `btn novo endereço cliente` | abre `pop.AgendaEnderecos` com o grupo, limpando ação e filial | 4.10 |
| 48 | bTgyV | Clique `Icon B` | fecha `pop historico` | 4.7 |
| 49 | bThDf | Clique `Icon C` | fecha o reusable `pop.CadastroCliFor` | 2.2 |
| 50 | bThmR | Clique `Icon D` (X da busca) | reseta `gp busca cliente` | 4.3 |
| 51 | bTjNv | Clique `btn grava historico individual` (sem registro em edição) | cria `Tbl.Historico`, limpa os campos e grava `UltimoHistoricoData` no grupo | 4.7 |
| 52 | bTjOI | Clique `btn grava historico individual` (com registro) | regrava descrição/cliente/**vendedor** no histórico existente | 4.7 |
| 53 | bTjgZ | Clique `Icon F` (anexos) | abre `pop.AnexosClifor` com o grupo e tipo semente | 4.6 |
| 54 | bTjlT | Muda `dd ordem` | grava `User.OrdenarCampos` | 4.9 |
| 55 | bTmFa | Muda `radio busca` | grava `User.BuscaExataProxima` | 4.9 |
| 56 | bTmFn | Clique `btn expandir cartoes` (estava falso) | `User.ExpandirCadastroClifor = true` | 4.9 |
| 57 | bTmFx | Clique `btn expandir cartoes` (estava verdadeiro) | `User.ExpandirCadastroClifor = false` | 4.9 |
| 58 | bTmGV | Muda `dd tipo clifor` | grava `User.FiltraTipoClifor` | 4.9 |
| 59 | bTmGc | Switch `Switch enderecos` mudou (grupo com 1 filial só) | replica `Ativo` para o grupo | 4.4 |
| 60 | bTvZl | Clique `bt bloquear grupo` | abre `pop.BloquearClifor` com o grupo | 4.5 |
| 61 | bUEuM | Muda `Dropdown A` (carteira) | **vazio** (a gravação é por auto-binding) | 8.1 |
| 62 | bTmPW0 | Switch `Switch A` mudou | grava `Ativo` + `UltimoQue(Des)ativou` no grupo e cascateia às filiais | 4.4 |
| 63 | bTmPd0 | Switch `Switch A` mudou (ligado) | força `Ativo = true` em todas as filiais (redundante) | 4.4 / 8.2 |

### 11.3 `mapa/reusable-pop.CadastroProdutos.md` — 10 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 64 | bTgdm | Clique `btn add fornecedor` (produto novo) | adiciona a filial ao custom state `var_quaisfornecedores_` | 4.8 |
| 65 | bTgdt | Clique `btn add fornecedor` (produto existente) | grava a relação nos dois lados (filial↔produto) direto no banco | 4.8 |
| 66 | bTgeE | Clique `btn cut fornecedor` (produto novo) | remove a filial do custom state | 4.8 |
| 67 | bTgeK | Clique `btn cut fornecedor` (produto existente) | desfaz a relação nos dois lados (operador ambíguo no mapa) | 4.8 / 10 |
| 68 | bTgeR | Clique `btn gravar` (produto novo) | cria `ProdutosModelo` (nome em minúsculas), liga fornecedores, reseta e limpa o state | 4.8 |
| 69 | bTged | Clique `btn gravar` (produto existente) | regrava os campos do produto (sem mexer nos fornecedores) | 4.8 |
| 70 | bTgep | Clique `btn gravar novo produto copy` (Cancela) | reseta e esconde o formulário | 4.8 |
| 71 | bTgfA | Clique `btn novo cliente` ("Novo Produto") | mostra o formulário vazio | 4.8 |
| 72 | bTgfl | Clique `Icon C` | reseta o formulário e fecha o reusable | 4.8 |
| 73 | bTgfH | Clique `btn edita produto` | carrega o produto da linha e mostra o formulário | 4.8 |

### 11.4 `mapa/reusable-pop.BloquearClifor.md` — 4 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 74 | bTvYp | Clique `Button A` ("Bloquear Todas Filiais") | grava motivo e `Liberado = false` em **todas** as filiais do grupo; limpa os inputs | 4.5 |
| 75 | bUBbb | Clique `Icon B` (filial liberada) | bloqueia a filial (`Liberado = false`), sem exigir motivo | 4.5 |
| 76 | bUBbj | Clique `Icon B` (filial bloqueada) | libera a filial (`Liberado = true`), sem limpar o motivo | 4.5 |
| 77 | bTxzI0 | Clique `Icon A` | fecha o popup | 4.5 |

### 11.5 `mapa/reusable-pop.AnexosClifor.md` — 7 workflows

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 78 | bTjdz | Clique `Icon A` (salvar), modo Cliente/Fornecedor | cria `Tbl.Anexos` (arquivo, grupo, filial, tipo), limpa e adiciona o anexo às listas da filial e do grupo | 4.6 |
| 79 | bTjeL | Clique `Icon B` (cabeçalho) | **apaga todos os anexos listados**, sem confirmação nem restrição | 4.6 / 8.1 |
| 80 | bTjeV | Clique `Icon B` (linha) | apaga o anexo da linha (sem tirar das listas) | 4.6 |
| 81 | bTjec | Clique `Icon B` (open_in_new) | abre o arquivo pela URL pública, aba nova | 4.6 / 7 |
| 82 | bTjhX | Clique `Icon C` | fecha o popup | 4.6 |
| 83 | bTkNl | PopupOpened no reusable | **vazio** | 8.1 |
| 84 | bTkNr | Clique `Icon A` (salvar), modo Usuário | cria `Tbl.Anexos` (arquivo, tipo, usuário), limpa e adiciona à lista do usuário | 4.6 |

**Total: 31 + 32 + 10 + 4 + 7 = 84 workflows.**
