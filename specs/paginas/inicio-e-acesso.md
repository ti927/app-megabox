# Spec funcional — Entrada, autenticação e painel inicial

Fonte: `mapa/pagina-index.md` (bTGYf — 27 elementos · 5 workflows · 7 ações · 12 condicionais),
`mapa/pagina-inicio.md` (bTHHt — 144 elementos · 3 workflows · 4 ações · 5 condicionais · 1 popup · 2 RGs/Tables · 1 HTML),
`mapa/pagina-loginrealizado.md` (bUCSX — 4 elementos · 1 workflow · 4 ações),
`mapa/pagina-reset_pw.md` (AAL — 12 elementos · 0 workflows · 4 condicionais),
`mapa/pagina-404.md` (AAU — 3 elementos · 0 workflows).
Total: **9 workflows** (5 + 3 + 1 + 0 + 0).

Apoio: `mapa/data-types.md` (`User`, `Tbl.ConfigSistema`, `Tbl.PerfilUsuario`, `Tbl.EnderecosCliFor`, `Tbl.Entregas`),
`mapa/option-sets.md` (`Opt.PerfilUsuario`, `Opt.DeptoUsuario`, `Opt.MenuPaginas`, `Opt.MenuConfig`, `Opt.Etapas`),
`mapa/backend-workflows.md` (`RefreshTokenGoogle` bUCKC), `mapa/integracoes.md` (API `LeituraGmail` bUCHx),
`mapa/reusable-tool.Cabecalho.md`, `mapa/reusable-tool.MenuPaginas.md`, `mapa/reusable-pop.CadastroUsuarios.md`,
`mapa/reusable-pop.ConfigUsuario.md`, `mapa/reusable-pop.ConfigSistema.md`.

**Se esta spec e o mapa discordarem, o mapa manda.**

Glossário:
- **Login mestre** — modo do `index` em que o usuário digita e-mail e senha (checkbox "Administrador" marcado).
- **Usuário fixado** — modo em que o `index` faz login com credenciais gravadas no `localStorage` daquele computador
  (checkbox "Administrador" desmarcado). Ver §4.2 e §7.
- **PassTexto** — campo `User.cpo.PassTexto` (`cpo_passtexto_text`, tipo `text`): a **senha do usuário em texto puro**,
  gravada no banco pelo cadastro de usuários (WF bTgml/bTgpl) e lida pelo "fixar usuário".
- **Hierarquia** — atributo numérico de `Opt.PerfilUsuario`: Diretor 1, Gerente 2, Analista 3, Operador 4 (menor = mais poder).

---

## 1. Propósito e quem usa

### 1.1 `index` — tela de entrada (rota `/`)
Única porta de entrada. Dois modos de login no mesmo cartão (§4.1 e §4.2) e um aviso de "versão de testes".
Quem usa: todos os usuários. Não há cadastro público, não há "criar conta", não há "esqueci minha senha":
usuários nascem em `pop.CadastroUsuarios` (WF bTgml, `CreateUserAccount`), operado por quem tem acesso ao menu
de configurações.

### 1.2 `inicio` — "painel inicial" (rota `/inicio`)
Apesar do nome e de ser o item de ordem 1 do menu (`Opt.MenuPaginas.Inicio`, `hierarquia=4`,
`DepartamentosAcessiveis = [Comercial, Financeiro, Operação, Administrativo]`), **não é um painel de indicadores**.
São duas ferramentas administrativas empilhadas:
1. `gp ajuste enquadramento tributario` (bTHTE) — planilha para preencher o **regime tributário** dos endereços de
   cliente/fornecedor em massa. Está `oculto ao carregar` e **nenhum workflow o exibe** → na prática está morto (§8.1).
2. `gp ajuste enderecos` (bTisF) — apesar do nome, é o **pivô de comissões por fornecedor e por mês** (§3.2 e §5).
   É o único bloco visível da página.

Quem usa: quem chega pelo menu. Não há restrição de perfil dentro da página.

### 1.3 `loginrealizado` — retorno do consentimento Google (rota `/loginrealizado`)
Não tem nada a ver com o login do app. É a `redirect_uri` do OAuth do Google usado para **ler a caixa de e-mail
(Gmail, escopo `gmail.readonly`)**. Abre numa janela pop-up disparada de `pop.ConfigSistema` (ação bUCSA,
`window.open`), troca o `code` por token, grava o token em `Tbl.ConfigSistema` (`CodigoConfig = 21`) e se fecha
sozinha em 2 segundos. Quem usa: quem conecta a conta Google nas configurações de sistema.

### 1.4 `reset_pw` — trocar a senha (rota `/reset_pw`)
Página **boilerplate do Bubble, em inglês, com 0 workflows**: "New password", "Confirm new password" e um botão
"Confirm" que **não dispara nada**. As 4 condicionais são só de borda (foco e inválido). Ninguém no app linka para ela.
Ou seja: o app **não tem fluxo de troca de senha pelo próprio usuário** (§4.4).

### 1.5 `404` (rota `/404`)
Boilerplate do Bubble, em inglês, 3 elementos, nenhum workflow, texto que ainda cita "Bubble Pro".

### 1.6 Controle de acesso de fato (só no navegador)

Este é o ponto central do módulo. Hoje **não existe controle de acesso no servidor**:

1. **Nenhuma página tem guarda de sessão.** Não há um só workflow "Page loaded → quando Current User não está logado →
   ir para index". Digitar `/inicio`, `/vendas`, `/financeiro`, `/cadastros` na barra de endereços **abre a página**,
   logado ou não. A busca no mapa não encontra nenhum `ChangePage → Página index` além dos dois de logout
   (`tool.Cabecalho` bTKRL/bTKRM e `tool.MenuPaginas` bTeRi/bTeRj).
2. **O único "bloqueio" é o link do menu.** Em `tool.MenuPaginas` a RG (bTeRW) lista
   `All(Opt.MenuPaginas)` menos "Configurações", e o link de cada item só fica habilitado (`link_disabled=False`)
   por duas condicionais:
   - `Search(Tbl.ConfigSistema: QualPagina = Parent):first_element:QuaisDeptos contains CurrentUser.QualDepto`, ou
   - `Search(Tbl.ConfigSistema: QualPagina = Parent):first_element:QuaisPerfis contains CurrentUser.QualPerfil`.
   É aparência: o item continua listado e a rota continua acessível por URL. `tool.MenuConfig` faz o mesmo
   para o submenu de configurações.
3. **Os atributos do option set não são usados.** `Opt.MenuPaginas` tem `hierarquia` e `DepartamentosAcessiveis`
   preenchidos (ex.: `Fluxo Financeiro` = hierarquia 2, deptos Financeiro+Administrativo; `Metas & Vendas` = hierarquia 2,
   só Administrativo; `Manutenção` = hierarquia 1), mas quem decide em runtime é `Tbl.ConfigSistema`
   (grupo `Opt.GrupoDeConfigsSistema.Permissões de Acesso`, campos `QuaisDeptos`/`QuaisPerfis`/`QuaisUsuarios`).
   Duas fontes de verdade para a mesma regra.
4. **Usuário inativo não é barrado no login.** `tool.Cabecalho` WF bTKRG ("Do when condition is true",
   `CurrentUser.Ativo = false`) faz `LogOut` + ir para `index`. Só roda **depois** que uma página com cabeçalho
   carregou; o `index` não tem cabeçalho, então o login de um usuário inativo é concluído e só depois desfeito.
5. **A proteção real seria a privacidade de dados do Bubble — e ela está aberta.** `User`, `Tbl.ConfigSistema`,
   `Tbl.EnderecosCliFor` e `Tbl.Entregas` (as tabelas deste módulo) têm regra `everyone` com `view_all: true` e
   `search_for: true`, e o app expõe a Data API (`integracoes.md`: "expõe Data API: True"). Ver §7.

---

## 2. Estrutura da tela

### 2.1 `index`
Layout de cima para baixo, dentro de `gp elments` (bTGyP):
1. `Group Header` (bTGyR) → `Image A` (bTGyW): logo. Duas condicionais trocam a imagem conforme
   `Page.Website Home` contenha ou não `"test"` (logo "teste megabox" × "live megabox").
2. `Card Log In` (bTIQx) — **visível só quando a URL NÃO contém "test"**. Na versão de testes ele começa escondido
   e só aparece pelo WF bTePd (§4.6). Conteúdo:
   - `Group E` (bTfRR): checkbox `chk admin` (plugin `1680110374647.../AAC`) + texto "Administrador".
   - `Gp login mestre` (bTIRB) — `oculto ao carregar`; visível quando `chk admin` está marcado:
     - `email login mestre` (bTIRH): input, `content_format="email"`, placeholder `usuario@email.com`.
     - `senha login mestre` (bTIRT): input, `content_format="password"`, `mandatory=True`,
       `not_submit_on_enter=True` (Enter **não** envia o formulário).
     - `Group Checkbox and Link` (bTIRN): grupo **vazio** — onde estariam "lembrar-me" e "esqueci a senha".
   - `Text G` (bThhN0): "Bem-vindo de volta {primeiro item do localStorage em maiúsculas}!" — visível quando
     `chk admin` está **desmarcado**.
   - `Text E` (bThhe): `oculto ao carregar`, imprime as três posições do `localStorage`
     (**nome, e-mail e senha**) em três linhas. Ver §7.
   - `Group Buttons` (bTIRU) → `btn login` (bTfQv): texto "ENTRAR", que vira "Entrar (Testes)" ou "Entrar (Live)"
     conforme a URL.
   - `Text C` (bTfND): `oculto ao carregar`, data/hora atual `dd/mm/yy - HH:MM`.
   - `LocalStorage A` (bTfQD): elemento do plugin `1617739938396...` (armazenamento local do navegador).
3. `Group B` (bTePR) — **visível só quando a URL contém "test"**: aviso "Você está acessando a versão de testes…",
   `Link A` (bTePF) para `https://grupomegabox.bubbleapps.io/` (versão live) e `Text D` (bTePL)
   "Quero acessar a VERSÃO DE TESTES" (WF bTePd).
4. `Text H` (bTvDh0): texto vazio (`{∅}`) — resto de edição.
5. `pop.RespostasEmails A` (bUCAY): **instância do reusable `pop.RespostasEmails` flutuando na tela de login**,
   e esse reusable contém dentro dele `pop.CadastroUsuarios A` (bUBwi) — o cadastro de usuários inteiro. Ver §7.3.

Sem popups próprios, sem parâmetros de URL lidos, sem estados customizados.

### 2.2 `inicio`
1. `tool.Cabecalho A` (bTeUi) — USA `tool.Cabecalho`; publica os estados `var_showmenu_` e `var_showhistorico_`.
2. `tool.DashMenu A` (bTeUD) — USA `tool.MenuPaginas`; `oculto ao carregar`, visível quando
   `cabecalho.var_showmenu_ = true`.
3. `gp ajuste enquadramento tributario` (bTHTE) — `oculto ao carregar`, **sem workflow que o mostre**:
   - `RadioButtons A` (bTheB0): `All(opt.TipoCliFor)`, default **Fornecedor**.
   - `RadioButtons B` (bTheH0): "Oculta preenchidos" / "Exibe todos" (default "Exibe todos").
   - `Table A` (bThVv0): planilha de endereços (§3.1), com cabeçalho fixo (`make_sticky`) contendo o
     autocomplete `SearchBox A` (busca em `Tbl.GrupoCliFor` por `cpo_nomecliente_text`), o `Dropdown B` de UF
     (`All(Opt.UFs)`) e os rótulos MUNICIPIO, CEP, FANTASIA, CNPJ, ENDERECO, COMPLEMENTO, REGIME TRIBUTARIO.
   - `Icon B` (bThek0): "×" que limpa a busca (WF bThfB0).
   - `HTML A` (bThfI0): bloco HTML de **2 caracteres** — lixo.
4. `gp ajuste enderecos` (bTisF) — visível:
   - `ipt filter dtinicio` (bUBFN): data, default = dia 1 do mês corrente (`Current Date/Time:change_date(1)`).
   - `ipt filter dtfim` (bUBFT): data, default = último dia do mesmo mês (`dtinicio + 1 mês, dia 1, −1 dia`).
   - `Icon H` (bTlHn): "limpar filtro de data" (WF bTlIx).
   - `rpg entregas` (bUBFZ): RG de `Tbl.Entregas` (§3.2) — fonte de dados do pivô.
   - `Table B` (bUAxV): pivô fornecedor × 12 meses (§3.2 e §5).
5. `pop apagar registro` (bTHtP0): popup de confirmação "Você está tentando apagar um registro…" —
   **nenhum workflow o abre** (código morto, o mesmo boilerplate encontrado em `financeiro`).
6. `alt processando` (bTHsk0): alerta "Aguarde, gravando registros. Não feche essa janela!" — **nunca acionado**.

Parâmetros de URL: a página **não lê nenhum**; o WF bTlIx **grava** `clienteplanilha` (valor vazio) na URL e
ninguém lê esse parâmetro. Sem estados customizados próprios.

### 2.3 `loginrealizado`
`Group text content` (bUCSY) com logo, "Login Realizado" e "Essa página fechará em alguns segundos".
Parâmetro de URL: **`code`** (código de autorização do Google). Sem popups, sem estados.

### 2.4 `reset_pw`
`Group Reset Password` (bTGyM0) → cabeçalho "Reset your password" → `Card Reset Password` com `Input B` (bTGyp0)
"New password" e `Input B` (bTGyj0) "Confirm new password" (ambos `password`, `mandatory=True`,
`not_submit_on_enter=True`) e `Button B` (bTGyw0) "Confirm". As 4 condicionais são apenas visuais (borda azul no
foco, vermelha se inválido). **Não há condicional comparando as duas senhas** e não há workflow.

### 2.5 `404`
`Group text content` (bTGky) → "Oops! 404 error" + parágrafo em inglês. Nada mais.

---

## 3. Dados

O "painel inicial" não mostra indicador nenhum de vendas, metas ou pendências. Mostra duas listas:

### 3.1 Planilha de regime tributário (`Table A`, bloco oculto)
Fonte: `Search(Tbl.EnderecosCliFor: TipoClifor = RadioButtons A AND QualGrupoCliFor = SearchBox A AND
QualUfOpt = Dropdown B; sort cpo.Razao, ignore empty)`.
Condicional: quando `RadioButtons B = "Oculta preenchidos"`, acrescenta `QualRegimeTributario is empty`.

Colunas (ordem dos `TableMainAxis`): Razão (0), Fantasia (1), CNPJ/CPF (2), Endereço (3), Complemento (4), CEP (5),
Município (6), UF (7), Regime tributário (8). Todas as células são `Input` **desabilitados** exibindo o valor em
maiúsculas — exceto a última, `Dropdown A` (bThcn0) sobre `All(opt.RegimeTributario)`, com
**`auto_binding = True`** em `cpo_qualregimetributario_option_opt_regimetributario`: escolher no dropdown
**grava direto no banco**, sem botão, sem confirmação e sem registro de quem mudou.

### 3.2 Pivô de comissões (`rpg entregas` + `Table B`, bloco visível)
- `rpg entregas` (bUBFZ): `Search(Tbl.Entregas: cpo.dtentrega >= ipt filter dtinicio AND
  cpo.dtentrega <= ipt filter dtfim AND cpo.StatusEntrega = Opt.Etapas.Financeiro)`.
  Ou seja: **entregas cuja etapa já é "Financeiro"**, no intervalo de datas escolhido.
- `Table B` (bUAxV): fonte = `rpg entregas:get_list_data:cpo.QualOrcamentoFornecedor:group_by(...)`,
  agrupando por `cpo.QualEnderecoOrigem` (a **filial do fornecedor**, um `Tbl.EnderecosCliFor`) e agregando
  `sum` de `cpo.ValorComissaoBruto`.
- Colunas: "Fornecedor" + os 12 meses (Janeiro…Dezembro). Linha = `grouping0:cpo.NomeEndereco`.
- Cada célula de mês refaz **no navegador** o filtro sobre `rpg entregas`
  (`QualOrcamentoFornecedor:QualEnderecoOrigem = grupo da linha` **e** `dtentrega:extract month = N`) e soma
  `cpo.valorcomissao`, formatado `R$ 0.000,00`. Ver §5.

Tipos envolvidos: `Tbl.Entregas`, `Tbl.OrcamentFornecedores` (via `QualOrcamentoFornecedor`),
`Tbl.EnderecosCliFor` (origem), `Tbl.GrupoCliFor` (no autocomplete), `Opt.Etapas`, `Opt.UFs`,
`opt.TipoCliFor`, `opt.RegimeTributario`.

---

## 4. Funcionalidades e regras de negócio

### 4.1 Login mestre — e-mail e senha digitados (WF bTfRZ)
Gatilho: clique em `btn login`, **condição do workflow** `chk admin:get_AAI:is_true`.
1. **LogIn** [bTfRf] — `email = El[email login mestre]`, `password = El[senha login mestre]`,
   `remember_email = False`, `stay_logged_in = False` (a sessão morre ao fechar o navegador; não há "continuar conectado").
2. **ChangePage** [bTfRj] — vai para a página **`vendas`**, sempre, para todo perfil.

Observações:
- Não há verificação de `User.Ativo`, de perfil ou de departamento nesse workflow.
- Não há normalização do e-mail digitado (o cadastro grava `EmailLoginTexto` em minúsculas, mas aqui o texto vai como veio).
- `User.QualPaginaInicial` existe e é editável pelo próprio usuário em `pop.ConfigUsuario` (dropdown bTgzc,
  auto-binding em `cpo_qualpaginainicial_option_opt_menu`), **mas o login ignora esse campo**. Ver [DÚVIDA 4].

### 4.2 Login de "usuário fixado" — senha vinda do `localStorage` (WF bTfNP + WF bTfRk)
1. **WF bTfNP — PageLoaded**: ação `Plugin[1617739938396...]/ABX` [bTfQJ] no elemento `LocalStorage A`, chave
   `"nome|email|senha"`. Lê do `localStorage` do navegador uma lista de 3 itens: nome, e-mail e **senha em texto puro**.
2. Com `chk admin` desmarcado, o cartão mostra "Bem-vindo de volta {nome}!" e o botão "ENTRAR".
3. **WF bTfRk — clique em `btn login`, condição `chk admin is_false`**:
   1. **LogOut** [bThmc] — derruba qualquer sessão anterior.
   2. **LogIn** [bTfRp] — `email = localStorage item 2`, `password = localStorage item 3`.
   3. **ChangePage** [bTfRq] — página `vendas`.

Quem grava esse `localStorage`: `pop.CadastroUsuarios`, WF bTkSX ("Fixar usuário", ação bTkSd) e o WF bTgno
(desativado, ação bTgnu), ambos escrevendo a chave `nome|email|senha` com o valor
`{NomeModelo}|{email}|{cpo.PassTexto}` — a senha em texto puro lida do registro do usuário.
O texto do popup confirma a intenção: *"o usuário poderá fazer login sem saber a senha somente neste computador"*.

### 4.3 Erro de login
**Não existe tratamento.** Nenhum dos dois workflows tem "Only when", passo de validação, elemento de mensagem de erro
ou `Terminate`. Credencial errada cai na mensagem genérica do runtime do Bubble; usuário inativo entra e só é derrubado
depois, na primeira página com `tool.Cabecalho` (WF bTKRG). Ver [DÚVIDA 3] e §7.

### 4.4 Esqueci a senha / reset
Não existe autoatendimento:
- `index` não tem link "esqueci minha senha" (o grupo `Group Checkbox and Link` bTIRN está vazio).
- `reset_pw` tem os campos e o botão, mas **0 workflows**: o botão "Confirm" não faz nada.
- O reset real é feito **por outro usuário**, em dois lugares que fazem a mesma coisa:
  - `pop.CadastroUsuarios` WF bTgpl: `SetTemporaryPassword` [bTgpn] → `ChangeThing` [bTgpr] gravando a senha
    temporária em **`cpo.PassTexto`** → `SendEmail` [bTgps] (opcional) com "Email login" e "**Senha:**" em claro,
    com cópia oculta para quem executou.
  - `tool.Cabecalho` WF bTfQL: `SetTemporaryPassword` [bTfQQ] → `ChangeThing` [bTfQR] em `cpo.PassTexto` →
    `SendEmail` [bTfQV] idêntico, com cópia para quem executou.
  - O popup avisa que, se o e-mail não for enviado, *"você precisa fixar o usuário em algum computador"* (§4.2).
- O e-mail pede "cadastre nova senha assim que entrar", **mas não há tela para isso**: `pop.ConfigUsuario`
  não tem campo de senha (os inputs chamados "ipt smtp senha" ali são, na verdade, campos de cópia oculta de e-mail).

### 4.5 Criação de usuário (contexto obrigatório para a migração)
`pop.CadastroUsuarios` WF bTgml: `CreateUserAccount` [bTgmn] (e-mail = `ipt email de login`, grava `Ativo=True`,
`QualPerfil`, `QualDepto`, `NomeModelo`, etc.) → `SetTemporaryPassword` [bTgmr] →
`ChangeThing` [bTkRu] gravando a senha temporária em **`cpo.PassTexto`** → `SendEmail` [bTgms] com a senha em claro.
Consequência para a migração: **o banco atual guarda a senha em texto puro de todo usuário criado por esse fluxo**.

### 4.6 Chaveamento teste × produção (WF bTePd e WF bTePk)
- **WF bTePd** — clique em `Text D` ("Quero acessar a VERSÃO DE TESTES"): `ShowElement` [bTePj] em `Card Log In`.
  É o que permite logar na versão de testes, onde o cartão nasce escondido pela condicional de
  `Page.Website Home:contains("test")`.
- **WF bTePk** — clique em `Link A`: **workflow sem nenhuma ação**. A navegação para a versão live acontece pela
  propriedade `url` do próprio Link (`https://grupomegabox.bubbleapps.io/`), não pelo workflow. Workflow vazio.

### 4.7 Logout
Não está em nenhuma das cinco páginas deste módulo; está nos dois reusables da moldura, duplicado:
- `tool.MenuPaginas` WF bTeRd: `LogOut` [bTeRi] → `ChangePage` [bTeRj] para `index`.
- `tool.Cabecalho` WF bTKRG (gatilho "Do when `CurrentUser.Ativo` is false"): `LogOut` [bTKRL] →
  `ChangePage` [bTKRM] para `index`. É o **único** ponto do app que trata usuário inativo.

### 4.8 Redirecionamento pós-login
Sempre `vendas` (bTfRj e bTfRq). Não há bifurcação por perfil, por departamento, nem uso de
`User.QualPaginaInicial`. Um Operador do Financeiro cai na mesma tela que um Diretor; o menu apenas desabilita
os links que a `ConfigSistema` não liberou (§1.6).

### 4.9 Conexão com o Google / `loginrealizado` (WF bUCSv)
Gatilho: "Do when condition is true" — `UrlParam("code") is not empty`. Sem checar login, sem checar perfil.
1. `apiconnector2-bUCHx.bUCQn` [bUCSx] — chamada **ObterToken2** (`POST https://oauth2.googleapis.com/token`),
   passando `code` (da URL) e `redirect_uri` montada conforme a versão (test → `/version-test/{página atual}`,
   live → `/{página atual}`). `client_id`, `client_secret` e `grant_type` estão fixos na configuração da chamada.
2. `ChangeThing` [bUCTB] no registro de `Tbl.ConfigSistema` com `CodigoConfig = 21`:
   `ValorTexto1 = access_token`, `ValorDataHora1 = agora`, `ValorNumero = expires_in`,
   **`ValorTexto2 = token_type`**, `ValorDataHora2 = agora + expires_in`.
3. `ScheduleAPIEvent` [bUCTD] — agenda o backend workflow `RefreshTokenGoogle` (bUCKC) para o instante da expiração.
4. `Plugin[1488796042609...]/AAg` [bUCTC] — JavaScript: se a janela tem `window.opener`, `window.close()` após 2 s.

Bug: `RefreshTokenGoogle` (bUCKC) manda `params_refresh_token = ConfigSistema[21].ValorTexto2`, que o passo 2
preencheu com o **`token_type`** (`"Bearer"`), não com o `refresh_token`. O refresh não pode funcionar como está.
Ver [DÚVIDA 12].

### 4.10 404
Sem comportamento. É só texto; o Bubble serve essa página para rota inexistente.

---

## 5. Cálculos e valores

O único cálculo do módulo está no pivô de `inicio` (§3.2):

| O quê | Como é hoje |
|---|---|
| Linha do pivô | `group_by` das entregas filtradas pela filial de origem do orçamento do fornecedor (`QualOrcamentoFornecedor.QualEnderecoOrigem`) |
| Agregação declarada no agrupamento | `sum` de `cpo.ValorComissaoBruto` — **calculada e nunca exibida** |
| Valor exibido em cada célula | `rpg entregas:filtered(origem = linha AND mês da dtentrega = N):cpo.valorcomissao:sum` |
| Formato | `R$ #.##0,00` (2 casas, vírgula decimal, ponto de milhar) |
| Universo | só entregas com `StatusEntrega = Opt.Etapas.Financeiro` e `dtentrega` dentro do intervalo dos dois filtros |

Problemas de cálculo a corrigir no app novo:
- **Bruto × líquido**: o agrupamento soma `ValorComissaoBruto`, as células somam `valorcomissao`. Dois conceitos
  diferentes na mesma tabela. Ver [DÚVIDA 7].
- **O ano é ignorado**: as colunas são "mês 1..12" via `extract month`, sem o ano. Se o filtro de datas cruzar
  dois anos, janeiro de 2025 e janeiro de 2026 caem na mesma coluna. E, com o default (mês corrente),
  11 das 12 colunas ficam sempre em R$ 0,00. Ver [DÚVIDA 8].
- **144 filtragens no navegador**: 12 meses × N fornecedores, cada uma varrendo a lista inteira de entregas.
- Não há linha de total, coluna de total, nem comparação com meta.

---

## 6. Integrações e backend workflows

| Item | Onde | O que faz |
|---|---|---|
| Plugin `1617739938396...` (LocalStorage) | `index` (`LocalStorage A`, ações ABX/ACe/ABo) | lê/grava a chave `nome\|email\|senha` no navegador (§4.2) |
| Plugin `1680110374647.../AAC` | `index` (`chk admin`) | checkbox "Administrador" |
| Plugin `1558770956236.../AAC` | `inicio` WF bTIaV, único passo do PageLoaded | **não identificado** — ver [DÚVIDA 1]. O mesmo plugin aparece no PageLoaded de `financeiro` (bTpRa) |
| Plugin `1488796042609...` (Toolbox / Run JavaScript) | `loginrealizado` ação bUCTC; `pop.ConfigSistema` ação bUCSA | fecha a janela pop-up; abre a janela de consentimento do Google |
| API `LeituraGmail` (bUCHx), chamada `ObterToken2` (bUCQn) | `loginrealizado` WF bUCSv | troca `code` por `access_token` (§4.9) |
| API `LeituraGmail`, chamada `RefreshToken2` (bUCRD) | backend `RefreshTokenGoogle` (bUCKC) | renova o token e se reagenda |
| `Tbl.ConfigSistema` `CodigoConfig = 21` | `loginrealizado`, bUCKC, `pop.ConfigSistema` | **armazena o token do Google numa linha de tabela comum**; `pop.ConfigSistema` exibe `ValorTexto1`/`ValorTexto2` na tela (textos bUCLh/bUCSR) e tem um botão que zera tudo (ação bUCJN) |
| SendGrid (`integracoes.md`: "usa SendGrid: True") | `pop.CadastroUsuarios` bTgms/bTgps, `tool.Cabecalho` bTfQV | envia credenciais e senhas temporárias por e-mail |

Nenhum backend workflow é disparado pelo login, pelo logout ou pelo `inicio`.
As páginas deste módulo não chamam `GestaoLure` nem o App Connector.

---

## 7. Segurança e privacidade

Esta seção é o motivo de o módulo existir. O que segue não é opinião: é o que o mapa mostra.

### 7.1 Onde a senha trafega e onde ela para
1. **Senha em texto puro no banco.** `User.cpo.PassTexto` (`cpo_passtexto_text`, `text`) recebe a senha temporária
   gerada por `SetTemporaryPassword` na criação (bTkRu) e em todo reset (bTgpr, bTfQR). Enquanto o usuário não
   trocar a senha — e **não existe tela para trocar** (§4.4) — `PassTexto` é a senha válida da conta.
2. **A tabela `User` é pública.** Regra de privacidade `everyone` (condição: *todos*, inclusive deslogado) com
   `view_all: true`, `search_for: true`, `auto_binding: true` (em `cpo_ativo1_boolean`). O app expõe a Data API.
   Conclusão direta: **`GET /api/1.1/obj/user` devolve a lista de usuários com `cpo_passtexto_text`, `email`,
   CPF, RG, telefone e endereço — sem autenticação**. Isto é um vazamento de credenciais, não um risco teórico.
   A segunda regra (`User's own data`, para logado) não reduz nada, porque a primeira já libera tudo.
3. **Senha em texto puro no navegador.** O "fixar usuário" grava `nome|email|senha` no `localStorage` da máquina
   (bTkSd), e o `index` a lê no PageLoaded (bTfQJ) e a usa no `LogIn` (bTfRp). Qualquer pessoa com acesso àquele
   computador — ou qualquer script na origem — lê a senha. O elemento `Text E` (bThhe) chega a **renderizar a senha
   na página de login** (está oculto, mas o valor existe no cliente).
4. **Senha em texto puro por e-mail.** Os três `SendEmail` (bTgms, bTgps, bTfQV) mandam "Email login" e "Senha"
   no corpo da mensagem, com cópia/cópia oculta para quem executou a ação.
5. **Senha digitada.** No login mestre a senha vai no `LogIn` do Bubble (HTTPS, tratada pelo runtime) — esse é o
   único ponto do fluxo que se comporta como o esperado.

### 7.2 O que o Bubble valida no servidor e o que só valida no navegador
| Validação | Onde acontece hoje |
|---|---|
| Senha confere com a conta | **Servidor** (ação `LogIn` do Bubble). É a única checagem de servidor do módulo. |
| Usuário está ativo | **Navegador**, e só depois do login (`tool.Cabecalho` bTKRG). O login em si não olha `Ativo`. |
| Usuário pode abrir a página X | **Navegador**, e só como aparência (`link_disabled` no menu, §1.6). |
| Usuário pode editar regime tributário em massa (`inicio`) | **Nenhuma**: auto-binding direto no banco para qualquer logado. |
| Usuário pode ver comissões de todos os fornecedores (`inicio`) | **Nenhuma**. |
| Usuário pode trocar o token do Google | **Nenhuma**: `loginrealizado` só testa se `code` não está vazio. |
| Confirmação de senha em `reset_pw` | **Nenhuma** (nem no navegador: não há condicional comparando os dois campos). |

### 7.3 Páginas acessíveis por URL sem checagem
- **Todas.** Nenhuma página do app redireciona o anônimo. `/inicio`, `/vendas`, `/financeiro`, `/metas`,
  `/cadastros`, `/rotinas`, `/relatorios`, `/sac`, `/historico` abrem.
  O que aparece na tela depende só das regras de privacidade — que estão abertas.
- `/loginrealizado?code=…` executa o WF bUCSv para quem quer que a abra: dá para **sobrescrever o token do Google
  da empresa** com o token de uma conta qualquer, ou disparar a chamada de troca repetidamente.
- O token do Google fica em `Tbl.ConfigSistema`, que também tem regra `everyone` com `view_all` e `search_for`:
  o `access_token` do Gmail da empresa é legível pela Data API, sem login.
- A tela de login carrega o reusable `pop.RespostasEmails`, que embute `pop.CadastroUsuarios` — o componente que
  lista usuários, reseta senhas e fixa credenciais. Componente administrativo entregue ao navegador do anônimo.
- `/version-test/...` é a mesma aplicação, com dados reais antigos, protegida apenas por obscuridade.

### 7.4 O que o app novo tem de impor **no servidor**
1. **Autenticação pelo Supabase Auth.** Senha só existe como hash gerenciado pelo GoTrue. **Não haverá coluna de
   senha** em tabela de aplicação: `PassTexto` não é migrado, é destruído.
2. **`middleware.ts` com `@supabase/ssr`** renovando o cookie de sessão e barrando qualquer rota fora de
   `/login`, `/esqueci-senha`, `/nova-senha` e das páginas de erro; anônimo vai para `/login?next=<rota>`.
3. **Checagem de sessão no servidor em cada rota protegida** (`supabase.auth.getUser()` no layout do grupo
   `(app)`), nunca `getSession()` do cliente. A permissão de página é consultada no banco, não no menu.
4. **RLS ligada em toda tabela desde a primeira migration**, com política escrita em função de
   `auth.uid()` e da hierarquia do perfil (§9.4). A tabela de perfis é `select` só para o próprio usuário e para
   hierarquia ≤ 2; `insert`/`delete` só por `service_role`.
5. **Usuário inativo bloqueado no login** (server action) *e* na RLS (`fn_usuario_ativo()` nas políticas),
   não no cabeçalho.
6. **Convite/reset por link de uso único do Supabase**, com expiração, sem senha no corpo do e-mail e sem cópia
   para terceiros. Troca de senha em tela própria, exigindo a senha atual (ou o token de recuperação).
7. **Rate limit e log** em login, reset e convite (tabela `log_acesso`: quem, quando, IP, resultado).
8. **`SUPABASE_SERVICE_ROLE_KEY` só no servidor** (convite e criação de usuário via Admin API em server action);
   no cliente, apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
9. **Segredos do Google** (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`) em variáveis de ambiente e o
   `refresh_token` em tabela com RLS fechada a `service_role`, **nunca** numa tabela lida pelo cliente. O callback
   do Google valida `state` e exige sessão de Diretor.
10. **Nada de credencial em `localStorage`.** O recurso "usuário fixado" não é reproduzido (§8.3); se o negócio
    precisar de máquina compartilhada, a substituição é sessão longa por dispositivo confiável, nunca senha guardada.
11. **Ao migrar: revogar tudo.** Toda senha atual deve ser considerada comprometida (esteve legível na Data API).
    Senha nova obrigatória para 100% dos usuários; o token do Google precisa ser revogado e refeito.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto
- `index` WF bTePk (clique no `Link A`): workflow **sem ações**.
- `index` `Text H` (bTvDh0): texto vazio `{∅}`. `Text C` (bTfND): relógio oculto que nunca é exibido.
- `index` `Group Checkbox and Link` (bTIRN): grupo vazio (era "lembrar-me" / "esqueci a senha").
- `inicio` `gp ajuste enquadramento tributario` (bTHTE) inteiro: `oculto ao carregar` e sem workflow que o mostre —
  a planilha de regime tributário, o `SearchBox A`, o `Dropdown B`, o `Icon B` e o WF bThfB0 são inalcançáveis.
- `inicio` `pop apagar registro` (bTHtP0) e `alt processando` (bTHsk0): nenhum workflow os aciona.
- `inicio` `HTML A` (bThfI0): 2 caracteres.
- `inicio` parâmetro de URL `clienteplanilha` (gravado por bTlIx): ninguém lê.
- `inicio` agregação `sum(ValorComissaoBruto)` do `group_by`: calculada e nunca mostrada.
- `reset_pw` inteira: 12 elementos e um botão sem workflow.
- `404`: texto boilerplate em inglês citando "Bubble Pro".
- `pop.CadastroUsuarios` WF bTgno: `workflow_disabled=True` — versão antiga do "fixar usuário".

### 8.2 Duplicação
- **Logout em dois lugares** com o mesmo par de ações (`tool.MenuPaginas` bTeRd e `tool.Cabecalho` bTKRG).
- **Reset de senha em dois lugares** com passos idênticos (`pop.CadastroUsuarios` bTgpl e `tool.Cabecalho` bTfQL),
  incluindo o mesmo corpo de e-mail copiado.
- **Dois modos de login** na mesma tela fazendo a mesma coisa por caminhos diferentes (bTfRZ e bTfRk).
- **Duas fontes de permissão**: atributos `hierarquia`/`DepartamentosAcessiveis` de `Opt.MenuPaginas` e
  `Opt.MenuConfig` × registros de `Tbl.ConfigSistema` do grupo "Permissões de Acesso". Só a segunda é usada.
- **Dois cadastros de perfil**: o option set `Opt.PerfilUsuario` e a tabela `Tbl.PerfilUsuario` (`tbl_perfilusuario2`),
  que tem **um único campo** (`QualOptPerfil`) apontando para o option set. Tabela sem razão de existir.
- **Três campos de e-mail no usuário**: `email` (do Bubble), `cpo.EmailLoginTexto` e `cpo.EmailContato`, mais
  `CopiaPedido`/`CopiaProposta`/`CopiaCancelamentos`, todos preenchidos com o mesmo valor na criação (bTkRu).
- 12 células de mês no pivô com a mesma expressão gigante, mudando só o número do mês.

### 8.3 Gambiarras (não reproduzir de jeito nenhum)
- **Senha em texto puro** em `User.PassTexto`, no `localStorage` e no corpo do e-mail (§7.1).
- **"Fixar usuário"**: login sem conhecer a senha, amarrado a um navegador. Substituir por sessão longa/dispositivo
  confiável, se o negócio precisar.
- **Checkbox "Administrador"** como seletor de modo de autenticação: não é permissão, é um interruptor de fluxo.
- **Detecção de ambiente por string na URL** (`Page.Website Home:contains("test")`) espalhada em condicionais de
  imagem, visibilidade, texto de botão e montagem de `redirect_uri`. No app novo: variável de ambiente.
- **Token OAuth guardado numa tabela genérica de configuração** com colunas `ValorTexto1`/`ValorTexto2`, exibido na
  tela de configurações e legível pela Data API.
- **`window.close()` por JavaScript injetado** para encerrar o fluxo OAuth.
- **Auto-binding direto no banco** no dropdown de regime tributário: sem confirmação, sem validação, sem auditoria.
- **Cálculo do pivô no navegador**, 12 varreduras por fornecedor.
- **Usuário inativo tratado depois do login**, por um "Do when" de cabeçalho.

### 8.4 Otimizações
- `Opt.PerfilUsuario` → tabela `perfis` com `hierarquia` (Diretor 1, Gerente 2, Analista 3, Operador 4), usada
  diretamente nas policies de RLS de **todo** o banco.
- `Opt.DeptoUsuario` → tabela `departamentos`; `Opt.MenuPaginas`/`Opt.MenuConfig` → tabela `paginas`
  (código, rota, nome, ordem, ícone) + `permissoes_pagina` (página × perfil/departamento/usuário), substituindo
  os registros de `ConfigSistema` do grupo "Permissões de Acesso".
- Preferências do usuário (`QualPaginaInicial`, `Menu`, `SubMenuConfig`, `OrdenarCampos`, `FiltraTipoClifor`,
  `ExpandirCadastroClifor`, `BuscaExataProxima`, `UltimoDateRange`) → uma tabela `usuario_preferencias`
  (ou coluna `jsonb`), fora da tabela de identidade.
- Campos de trabalho que hoje moram no `User` (`TempOrcamentoProdutos`, `SelecionadosPagar`, `SelecionadosReceber`,
  `QuaisMetasFechadas`, `CarteiraClientes`, `QuaisEntregas`, `QuaisAnexos`) → tabelas de ligação ou estado de cliente.
  A tabela de usuário deve ficar pequena: identidade, perfil, departamento, status.
- Campos mortos a não migrar: `SmtpEndereco`, `SmtpPorta`, `SmtpSenha`, `StmpLogin`, `UsaEmailPessoal`
  (marcados "deleted" no mapa) e **`PassTexto`**.
- Pivô de comissões → **view/função SQL** (`fn_comissoes_por_fornecedor_mes(ano)`) com `date_trunc('month', dt_entrega)`
  e `sum(valor_comissao)` em `numeric(14,2)`, uma consulta só, filtrando `status_entrega = 'financeiro'`.
  Índices: `entregas(dt_entrega, status_entrega)` e `orcamentos_fornecedor(endereco_origem_id)`.
- Regime tributário: sair do "painel inicial" e virar campo do cadastro de cliente/fornecedor, com um relatório
  "endereços sem regime tributário" para a limpeza em massa (com trilha de auditoria).
- 404 e páginas de erro em português, no padrão visual do app (`app/not-found.tsx`, `app/error.tsx`).

---

## 9. Proposta para o app novo

### 9.1 Rotas
| Rota | Tipo | Observação |
|---|---|---|
| `middleware.ts` | Middleware | `@supabase/ssr` `updateSession`: renova o cookie e barra anônimo. `matcher` cobre tudo menos `_next`, estáticos, `/login`, `/esqueci-senha`, `/nova-senha`, `/auth/*`. Anônimo → `/login?next=<pathname+search>` |
| `app/(publico)/login/page.tsx` | Server Component + form client | Substitui `index`. Se já há sessão, `redirect()` para a página inicial do usuário. Sem "modo administrador", sem `localStorage` |
| `app/(publico)/esqueci-senha/page.tsx` | idem | Pede o e-mail, dispara `resetPasswordForEmail`. Resposta **sempre** igual, com ou sem conta (não revelar existência) |
| `app/(publico)/nova-senha/page.tsx` | idem | Substitui `reset_pw`, **em português**. Consome o token de recuperação/convite; exige senha + confirmação iguais e política mínima |
| `app/auth/callback/route.ts` | Route Handler | `exchangeCodeForSession` (PKCE) dos links de convite/recuperação; redireciona para `next` validado (mesma origem) |
| `app/(app)/layout.tsx` | Server Component | **Grupo de rotas protegido**: `getUser()`, carrega perfil/departamento/ativo, monta o menu com as páginas permitidas e injeta o contexto. Usuário inativo → `signOut()` + `/login?motivo=inativo`. `senha_definida_em is null` → desvia para `/nova-senha` |
| `app/(app)/inicio/page.tsx` | Server Component | Pivô de comissões (§3.2/§5), com filtro de **ano** na URL (`?ano=`) |
| `app/(app)/**` | — | Todas as demais telas (vendas, financeiro, metas, …) ficam dentro do mesmo grupo protegido |
| `app/not-found.tsx` / `app/error.tsx` | — | Substituem `404` |
| `app/api/google/callback/route.ts` | Route Handler | Substitui `loginrealizado`: valida `state`, exige sessão de Diretor, troca o `code` no servidor e guarda o `refresh_token` cifrado. Nada de janela pop-up fechada por JavaScript |

Sem rota equivalente a "usuário fixado".

### 9.2 Componentes
- `FormularioLogin` (client, `useActionState`): e-mail, senha, botão, erro inline, estado "entrando…".
- `CampoSenha` com "mostrar/ocultar" e, na definição de senha, medidor de força e confirmação.
- `FormularioEsqueciSenha`, `FormularioNovaSenha`, `FormularioTrocarSenha` (na área logada).
- `AvisoAmbiente` — faixa "ambiente de homologação" quando `NEXT_PUBLIC_AMBIENTE !== 'producao'` (substitui o
  `contains("test")`).
- `MenuLateral` (recebe do servidor a lista de páginas permitidas — não renderiza item bloqueado) e
  `BotaoSair` (server action `sair`).
- `GuardaPerfil` / helper `podeVer(perfilMinimo)` só para **esconder** UI; a decisão real é a RLS.
- `TabelaComissoesFornecedorMes` (server-rendered, dados prontos da função SQL) e `FiltroAno`.
- `TabelaRegimeTributarioPendente` (se a ferramenta for mantida) — edição por server action, não auto-binding.

### 9.3 Server actions
| Action | Regra |
|---|---|
| `entrar({email, senha})` | zod; `signInWithPassword`; se `usuarios.ativo = false` → `signOut()` + erro "usuário inativo"; rate limit por e-mail+IP; grava `log_acesso`; erro genérico ("e-mail ou senha inválidos") para credencial errada e para conta inexistente; redireciona conforme §9.3.1 |
| `sair()` | `signOut()`, limpa cookies, `redirect('/login')` |
| `solicitarResetSenha({email})` | rate limit; `resetPasswordForEmail(email, {redirectTo: /auth/callback?next=/nova-senha})`; mensagem idêntica sempre |
| `definirNovaSenha({senha, confirmacao})` | exige sessão de recuperação/convite; senha ≥ 10 caracteres, ≠ e-mail; `updateUser({password})`; marca `usuarios.senha_definida_em = now()`; registra em `log_acesso` |
| `trocarPropriaSenha({senhaAtual, nova})` | revalida a senha atual antes de trocar |
| `convidarUsuario({email, nome, perfilId, departamentoId})` | **só Diretor** (hierarquia ≤ 1); usa `service_role` no servidor: `auth.admin.inviteUserByEmail` (ou `createUser` + `generateLink('invite')`); cria a linha em `usuarios`; e-mail contém **link**, nunca senha |
| `reenviarConvite(usuarioId)` / `forcarResetSenha(usuarioId)` | só Diretor; gera `recovery link`; nunca expõe senha; grava quem pediu |
| `ativarDesativarUsuario(usuarioId, ativo)` | só Diretor; desativar também invalida as sessões (`auth.admin.signOut`) |
| `definirPaginaInicial(paginaCodigo)` | grava em `usuario_preferencias` |

#### 9.3.1 Redirecionamento pós-login (regra nova, explícita)
1. `next` da querystring, se for rota interna **e** permitida ao usuário; senão
2. `usuario_preferencias.pagina_inicial`, se o usuário ainda tiver permissão nela; senão
3. a primeira página permitida na ordem de `paginas.ordem`; senão
4. `/inicio` com aviso "sem páginas liberadas — procure a diretoria".

Isso preserva o hábito atual (a maioria cai em `/vendas`, liberada a todos os departamentos) e passa a respeitar
`QualPaginaInicial`, que hoje o Bubble ignora.

### 9.4 SQL

```sql
-- 1. Perfis (de Opt.PerfilUsuario) e departamentos (de Opt.DeptoUsuario)
create table public.perfis (
  id          smallint primary key,          -- = hierarquia
  codigo      text not null unique,          -- diretoria | gerencia | colaborador | operador
  nome        text not null
);
insert into public.perfis (id, codigo, nome) values
  (1,'diretoria','Diretor'), (2,'gerencia','Gerente'),
  (3,'colaborador','Analista'), (4,'operador','Operador');

create table public.departamentos (
  id        smallint generated always as identity primary key,
  codigo    text not null unique,            -- diretoria | financeiro | licitacao | geral
  nome      text not null,
  descricao text
);

-- 2. Perfil da aplicação ligado ao Supabase Auth (1:1 com auth.users)
create table public.usuarios (
  id                uuid primary key references auth.users(id) on delete cascade,
  nome              text not null,
  email_login       text not null unique,     -- de User.cpo.EmailLoginTexto (= auth.users.email)
  email_contato     text,
  perfil_id         smallint not null references public.perfis(id),
  departamento_id   smallint references public.departamentos(id),
  ativo             boolean not null default true,
  is_dev            boolean not null default false,
  telefone          text, cpf text, rg text,
  foto_url          text,
  senha_definida_em timestamptz,              -- null = ainda usa a senha provisória do convite
  criado_em         timestamptz not null default now(),
  bubble_user_id    text unique               -- rastreia a origem na carga; some depois do corte
);
-- sem coluna de senha. PassTexto nao e migrado.

-- 3. Hierarquia: a funcao que TODAS as outras tabelas vao usar nas policies
create or replace function public.fn_hierarquia_atual()
returns smallint
language sql stable security definer set search_path = ''
as $$
  select u.perfil_id from public.usuarios u
  where u.id = (select auth.uid()) and u.ativo
$$;

create or replace function public.fn_tem_hierarquia(minimo smallint)
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.fn_hierarquia_atual(), 99) <= minimo $$;
-- fn_tem_hierarquia(1) = so Diretor; (2) = Diretor e Gerente; (4) = qualquer usuario ativo.

create or replace function public.fn_usuario_ativo()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.usuarios u
                     where u.id = (select auth.uid()) and u.ativo) $$;

-- 4. Permissao de pagina (substitui ConfigSistema "Permissoes de Acesso")
create table public.paginas (
  codigo text primary key,                    -- inicio | vendas | financeiro | metas | ...
  nome   text not null,
  rota   text not null,
  ordem  smallint not null,
  ativo  boolean not null default true
);
create table public.permissoes_pagina (
  pagina_codigo   text not null references public.paginas(codigo) on delete cascade,
  perfil_id       smallint references public.perfis(id),
  departamento_id smallint references public.departamentos(id),
  usuario_id      uuid references public.usuarios(id) on delete cascade,
  check (num_nonnulls(perfil_id, departamento_id, usuario_id) = 1)
);

create or replace function public.fn_pode_acessar_pagina(p_codigo text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.permissoes_pagina pp
    join public.usuarios u on u.id = (select auth.uid()) and u.ativo
    where pp.pagina_codigo = p_codigo
      and (pp.usuario_id = u.id or pp.perfil_id = u.perfil_id
           or pp.departamento_id = u.departamento_id)
  )
$$;

-- 5. RLS desde a primeira migration
alter table public.usuarios          enable row level security;
alter table public.perfis            enable row level security;
alter table public.departamentos     enable row level security;
alter table public.paginas           enable row level security;
alter table public.permissoes_pagina enable row level security;

create policy usuarios_select on public.usuarios for select to authenticated
  using (id = (select auth.uid()) or public.fn_tem_hierarquia(2));
create policy usuarios_update_proprio on public.usuarios for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy usuarios_update_diretor on public.usuarios for update to authenticated
  using (public.fn_tem_hierarquia(1)) with check (public.fn_tem_hierarquia(1));
-- insert/delete de usuarios: nenhuma policy -> so service_role (server action de convite).

create policy perfis_leitura on public.perfis for select to authenticated using (true);
create policy deptos_leitura on public.departamentos for select to authenticated using (true);
create policy paginas_leitura on public.paginas for select to authenticated using (true);
create policy permissoes_leitura on public.permissoes_pagina for select to authenticated
  using (usuario_id = (select auth.uid()) or public.fn_tem_hierarquia(2));
create policy permissoes_escrita on public.permissoes_pagina for all to authenticated
  using (public.fn_tem_hierarquia(1)) with check (public.fn_tem_hierarquia(1));

-- 6. Gatilho: impedir que o usuario mude o proprio perfil/ativo
create or replace function public.trg_usuarios_protege_campos()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.fn_tem_hierarquia(1) then
    new.perfil_id       := old.perfil_id;
    new.departamento_id := old.departamento_id;
    new.ativo           := old.ativo;
    new.is_dev          := old.is_dev;
  end if;
  return new;
end $$;
create trigger usuarios_protege_campos before update on public.usuarios
  for each row execute function public.trg_usuarios_protege_campos();
```

**Padrão para o resto do banco** (é aqui que este módulo paga por si): toda tabela de negócio recebe
`enable row level security` e policies escritas com `public.fn_usuario_ativo()`,
`public.fn_tem_hierarquia(n)` e `public.fn_pode_acessar_pagina('<pagina>')` — por exemplo,
`contas_receber` só para quem pode acessar `financeiro`; alterações destrutivas exigindo
`fn_tem_hierarquia(2)`. As funções são `security definer` com `search_path = ''` para não disparar
recursão de RLS ao consultar `usuarios` dentro das próprias policies.

#### 9.4.1 Migração das contas do Bubble para o Supabase Auth
As senhas do Bubble **não migram** — e, mesmo que `PassTexto` desse para copiá-las, não seriam usadas:
estiveram legíveis na Data API (§7.1), portanto são todas consideradas comprometidas.

Roteiro (script em `tools/`, rodando no servidor, com `SUPABASE_SERVICE_ROLE_KEY`):
1. Exportar os `User` do Bubble com `email`, `EmailLoginTexto`, `NomeModelo`, `QualPerfil`, `QualDepto`,
   `Ativo`, `Telefone`, `Cpf`, `Rg`, `Foto`, `_id`.
2. Para cada um: `auth.admin.createUser({ email, email_confirm: true, password: <32 bytes aleatórios,
   descartado>, user_metadata: { nome } })` e `insert into usuarios (...)` com `bubble_user_id = _id`,
   `senha_definida_em = null`, `ativo = <Ativo>`. Usuários com `Ativo = false` entram desativados e **sem convite**.
3. De-para de perfil (`Opt.PerfilUsuario` → `perfis.id`): `diretoria → 1` (Diretor), `gerencia → 2` (Gerente),
   `colaborador → 3` (Analista), `operador → 4` (Operador). O id **é** a hierarquia, então as policies passam a ler
   direto o número que o option set já usava. De-para de departamento (`Opt.DeptoUsuario`):
   `diretoria → Administrativo`, `financeiro → Financeiro`, `licitacao → Comercial`, `geral → Operação`
   (os códigos do Bubble não batem com os rótulos — copiar o código, não o nome).
4. Convite: `auth.admin.generateLink({ type: 'invite' })` por usuário ativo, e-mail com **link de uso único**
   válido por 24 h, redirecionando para `/nova-senha`. Sem senha no corpo.
5. Enquanto `senha_definida_em is null`, o layout protegido força o desvio para `/nova-senha`.
6. Reconvite em lote para quem não definir a senha até o corte; no dia do corte, o app Bubble é fechado.
7. `PassTexto` **não tem coluna de destino**. O campo não deve ser exportado para arquivo intermediário; se aparecer
   no dump, o dump é apagado depois da carga.
8. Depois do corte: revogar a senha de app do Gmail e o `refresh_token` do Google, e apagar `ConfigSistema[21]`.

### 9.5 Tabelas
`usuarios` (1:1 com `auth.users`), `perfis`, `departamentos`, `paginas`, `permissoes_pagina`,
`usuario_preferencias` (página inicial, ordenações, último período, filtros salvos), `log_acesso`
(login, logout, reset, convite, falha — quem, quando, IP, resultado), `integracoes_oauth`
(provedor, conta, `refresh_token` cifrado, expiração — RLS fechada, acesso só por `service_role`).
Tabelas lidas pelo `/inicio`: `entregas`, `orcamentos_fornecedor`, `enderecos_clifor`, `grupos_clifor`
(somente leitura, via função SQL).

---

## 10. Dúvidas

1. **[DÚVIDA]** `inicio` WF bTIaV: qual é o plugin `1558770956236.../AAC` chamado no PageLoaded (também presente em
   `financeiro`, bTpRa)? *Recomendação:* não reproduzir até identificar; provavelmente utilitário de layout/scroll.
2. **[DÚVIDA]** O checkbox "Administrador" (`chk admin`) é usado por quem, e com que frequência? *Recomendação:*
   o app novo tem um único fluxo de login com e-mail e senha; o modo "usuário fixado" não é reproduzido (§8.3).
3. **[DÚVIDA]** Como o usuário vê hoje um erro de credencial (o mapa não mostra tratamento)? *Recomendação:*
   assumir mensagem genérica do Bubble e implementar erro inline padronizado, sem revelar se o e-mail existe.
4. **[DÚVIDA]** O login sempre vai para `vendas` e ignora `User.QualPaginaInicial`, que o próprio usuário configura.
   É intencional? *Recomendação:* implementar a regra de §9.3.1 (respeitar a preferência, com fallback).
5. **[DÚVIDA]** A página `inicio` é o item 1 do menu, mas o login não passa por ela e seu conteúdo é ferramenta
   administrativa. Ela deve continuar sendo "a primeira tela"? *Recomendação:* manter a rota `/inicio` só com o
   pivô de comissões e **não** usá-la como destino padrão do login.
6. **[DÚVIDA]** `gp ajuste enquadramento tributario` está oculto e inalcançável: foi abandonado ou alguém o exibe
   por outro caminho? *Recomendação:* não migrar a planilha; o regime tributário passa a ser campo do cadastro de
   cliente/fornecedor, com relatório de pendências.
7. **[DÚVIDA]** No pivô, o agrupamento soma `ValorComissaoBruto` e as células somam `valorcomissao`. Qual é o número
   que a diretoria usa? *Recomendação:* `valorcomissao` (é o que aparece na tela hoje), com coluna separada para o bruto.
8. **[DÚVIDA]** O pivô agrupa por mês sem ano e o filtro default cobre só o mês corrente (11 colunas zeradas).
   O correto é "12 meses do ano X"? *Recomendação:* sim — filtro por ano, colunas de janeiro a dezembro, com totais.
9. **[DÚVIDA]** O pivô só conta entregas com `StatusEntrega = Opt.Etapas.Financeiro`. Essa é a definição de "comissão
   realizada"? *Recomendação:* manter a regra e deixá-la explícita no título da tela.
10. **[DÚVIDA]** O parâmetro de URL `clienteplanilha` (gravado por bTlIx) é lido por algum link externo/planilha?
    *Recomendação:* descartar.
11. **[DÚVIDA]** A "versão de testes" (`Website Home contains "test"`) precisa continuar existindo depois da migração?
    *Recomendação:* ambiente separado (preview da Vercel + projeto Supabase de staging), sem chaveamento em runtime.
12. **[DÚVIDA]** O refresh do token do Google alguma vez funcionou? `loginrealizado` grava `token_type` em
    `ValorTexto2` e `RefreshTokenGoogle` (bUCKC) lê `ValorTexto2` como `refresh_token`. *Recomendação:* tratar como
    bug; no app novo guardar `refresh_token` de verdade, cifrado, fora do alcance do cliente.
13. **[DÚVIDA]** Quem pode conectar a conta Google (hoje qualquer um que abra `/loginrealizado?code=…`)?
    *Recomendação:* só Diretor, com validação de `state` e sessão no servidor.
14. **[DÚVIDA]** Existem usuários sem `QualPerfil` ou sem `QualDepto` no banco atual, e o que fazer com eles na carga?
    *Recomendação:* importar como Operador (hierarquia 4) e **desativados**, para conferência manual antes do corte.
15. **[DÚVIDA]** `auth.users.email` deve receber `User.email` ou `User.cpo.EmailLoginTexto` (há três campos de e-mail)?
    *Recomendação:* `EmailLoginTexto` em minúsculas como e-mail de login; `EmailContato` fica como dado de contato.
16. **[DÚVIDA]** Quem hoje tem `User.IsDev = true` e o que isso libera fora deste módulo? *Recomendação:* migrar como
    `is_dev`, alterável só por `service_role`, e usar apenas para exibir ids técnicos.
17. **[DÚVIDA]** Depois do corte, o Bubble continua no ar em modo leitura? Se sim, `PassTexto` e a Data API aberta
    continuam expostos. *Recomendação:* antes de qualquer coisa, fechar as regras de privacidade do app Bubble e
    limpar `PassTexto`, **independentemente** do cronograma da migração.

---

## 11. Cobertura — todos os 9 workflows

### `index` (bTGYf) — 5 workflows
| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTePd | Clique em `Text D` ("Quero acessar a VERSÃO DE TESTES") | `ShowElement` [bTePj] no `Card Log In` — libera o login na versão de testes | 4.6 |
| 2 | bTePk | Clique em `Link A` ("acessar a versão Live") | **workflow vazio**; a navegação vem da propriedade `url` do link | 4.6 / 8.1 |
| 3 | bTfNP | PageLoaded | Plugin LocalStorage [bTfQJ] lê a chave `nome\|email\|senha` do navegador | 4.2 / 7.1 |
| 4 | bTfRZ | Clique em `btn login`, com `chk admin` marcado | `LogIn` [bTfRf] com e-mail/senha digitados → `ChangePage` [bTfRj] para `vendas` | 4.1 / 4.8 |
| 5 | bTfRk | Clique em `btn login`, com `chk admin` desmarcado | `LogOut` [bThmc] → `LogIn` [bTfRp] com e-mail e **senha do localStorage** → `ChangePage` [bTfRq] para `vendas` | 4.2 / 7.1 |

### `inicio` (bTHHt) — 3 workflows
| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 6 | bTIaV | PageLoaded | Ação de plugin `1558770956236.../AAC` [bTlNt] — não identificada | 6 / [DÚVIDA 1] |
| 7 | bTlIx | Clique em `Icon H` (limpar filtro de data) | `ResetGroup` [bTlJD] em `gp filter data` (volta ao mês corrente) → `ChangePage` [bTlNc] para a própria página gravando `clienteplanilha` vazio na URL | 3.2 / 8.1 |
| 8 | bThfB0 | Clique em `Icon B` (× da busca de cliente/fornecedor) | `ResetGroup` [bThfH0] em `Group B` — limpa o autocomplete da planilha tributária (bloco oculto: inalcançável) | 3.1 / 8.1 |

### `loginrealizado` (bUCSX) — 1 workflow
| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 9 | bUCSv | "Do when" — `UrlParam("code")` não vazio | `ObterToken2` [bUCSx] troca o code por token → `ChangeThing` [bUCTB] grava access_token/expiração em `ConfigSistema[21]` → `ScheduleAPIEvent` [bUCTD] agenda `RefreshTokenGoogle` (bUCKC) → JavaScript [bUCTC] fecha a janela em 2 s | 4.9 / 6 / 7.3 |

### Páginas sem workflow
| Página | Id | Conteúdo | Tratamento |
|---|---|---|---|
| `reset_pw` | AAL | 12 elementos; 4 condicionais só de borda (foco/inválido); botão "Confirm" **sem workflow** | §1.4, §4.4 — refeita como `/nova-senha` (§9.1) |
| `404` | AAU | 3 elementos; texto boilerplate do Bubble em inglês | §1.5 — refeita como `app/not-found.tsx` em português |

### Workflows de fora destas páginas citados na spec (contexto obrigatório do módulo)
| Origem | WF / ação | Por que aparece aqui |
|---|---|---|
| `tool.MenuPaginas` | WF bTeRd (`LogOut` bTeRi + `ChangePage` bTeRj) | único botão de sair do app |
| `tool.MenuPaginas` | RG bTeRW + condicionais de `link_disabled` | todo o controle de acesso do app |
| `tool.Cabecalho` | WF bTKRG (`LogOut` bTKRL + `ChangePage` bTKRM) | único tratamento de usuário inativo |
| `tool.Cabecalho` | WF bTfQL (bTfQQ/bTfQR/bTfQV) | reset de senha gravando `PassTexto` e enviando senha por e-mail |
| `pop.CadastroUsuarios` | WF bTgml (bTgmn/bTgmr/bTkRu/bTgms) | criação de conta + gravação de `PassTexto` |
| `pop.CadastroUsuarios` | WF bTgpl (bTgpn/bTgpr/bTgps) | reset de senha (duplicado do bTfQL) |
| `pop.CadastroUsuarios` | WF bTkSX (bTkSd) e bTgno (desativado) | "fixar usuário": grava `nome\|email\|senha` no localStorage |
| `pop.ConfigUsuario` | dropdown bTgzc (auto-binding `QualPaginaInicial`) | preferência de página inicial ignorada pelo login |
| `pop.ConfigSistema` | ações bUCHB / bUCSA / bUCJN | abre o consentimento Google e zera `ConfigSistema[21]` |
| `backend-workflows.md` | `RefreshTokenGoogle` (bUCKC), ações bUCRR/bUCKZ/bUCKg | renovação do token agendada pelo WF bUCSv |
