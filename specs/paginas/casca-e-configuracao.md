# Spec funcional — Casca do app, configuração e usuários

Fonte: `mapa/reusable-tool.Cabecalho.md` (bTIVb · 47 el · 9 WF · 14 ações · 11 cond.),
`mapa/reusable-tool.MenuPaginas.md` (bTeRP · 64 el · 7 WF · 15 ações · 11 cond.),
`mapa/reusable-tool.MenuConfig.md` (bTggV · 17 el · 7 WF · 14 ações · 4 cond.),
`mapa/reusable-pop.ConfigSistema.md` (bToDT0 · 204 el · 14 WF · 16 ações · 19 cond. · 5 RGs/tabelas),
`mapa/reusable-pop.ConfigUsuario.md` (bTgyx · 49 el · 1 WF · 1 ação · 5 cond.),
`mapa/reusable-pop.CadastroUsuarios.md` (bTgiN · 266 el · 30 WF · 59 ações · 37 cond. · 4 RGs/tabelas).
Total coberto: **68 workflows**.
Apoio: `mapa/data-types.md` (User, Tbl.ConfigSistema, Tbl.NiveisVendedores, Tbl.PerfilUsuario),
`mapa/option-sets.md` (Opt.MenuPaginas, Opt.MenuConfig, Opt.PerfilUsuario, Opt.DeptoUsuario,
Opt.GrupoDeConfigsSistema, Opt.FiltrosGmail, Opt.Smtp, Opt.SimNão, Opt.TipoAnexo, Opt.UFs),
`mapa/backend-workflows.md` (bUBmh, bUBpN, bUCKC, bTiKu0, bTkso2), `mapa/integracoes.md`,
`mapa/pagina-index.md` (login, para entender "fixar usuário").

**Se esta spec e o mapa discordarem, o mapa manda.**

Glossário:
- **Casca (shell)** = `tool.Cabecalho` + `tool.MenuPaginas` + `tool.MenuConfig`: aparecem em todas as páginas do app.
- **Hierarquia** = atributo numérico de `Opt.PerfilUsuario` (Diretor 1, Gerente 2, Analista 3, Operador 4). Menor = mais poder.
- **Departamento** = `Opt.DeptoUsuario` (Administrativo, Financeiro, Comercial, Operação). Os ids internos não batem com
  o rótulo: Administrativo = `diretoria`, Comercial = `licita__o`, Operação = `geral`.
- **Linha de permissão** = registro de `Tbl.ConfigSistema` que guarda, para uma página ou um item de configuração,
  as listas `QuaisDeptos` / `QuaisPerfis` / `QuaisUsuarios`.
- **Carteira** = conjunto de clientes (`Tbl.GrupoCliFor`) cujo campo `QualCarteira` aponta para um usuário.

---

## 1. Propósito e quem usa

| Reusable | Papel |
|---|---|
| `tool.Cabecalho` (bTIVb) | Barra fixa do topo: logo, botão do menu lateral, foto/nome/perfil do usuário logado, engrenagem de configuração (embute `tool.MenuConfig`), botão do painel de histórico de conversas, popup de histórico do cliente, popup genérico de confirmação (reset de senha). É também o **guarda de sessão**: derruba usuário inativo (WF bTKRG). |
| `tool.MenuPaginas` (bTeRP) | Menu lateral com os módulos do sistema (lista de `Opt.MenuPaginas`), botão "Comunicar Bug" (abre popup com formulário e lista de bugs vindos de outro app Bubble) e botão "Logout". |
| `tool.MenuConfig` (bTggV) | Menu suspenso da engrenagem: lista de `Opt.MenuConfig`; cada item abre um popup de configuração/cadastro ou navega para outra página. Hospeda os popups `pop.ConfigSistema`, `pop.CadastroUsuarios`, `pop.CadastroProdutos`, `pop.CadastroCliFor` e `pop.ConfigUsuario`. |
| `pop.ConfigSistema` (bToDT0) | Painel de configuração global: níveis de vendedor (metas e comissões), **permissões de acesso às páginas**, **permissões de acesso às configurações**, cópia oculta de e-mails, numeração de recibos, contador diário de e-mails, chave SMTP próprio e integração Gmail (tokens OAuth). |
| `pop.ConfigUsuario` (bTgyx) | "Configurações do Usuário": o próprio usuário edita seus dados pessoais, foto, página de início e os endereços que recebem cópia de propostas/pedidos/cancelamentos. Tudo por *auto-binding* (salva ao digitar). |
| `pop.CadastroUsuarios` (bTgiN) | Administração de usuários: lista/filtra, cria, edita, ativa/inativa, define perfil e departamento, nível de vendedor, férias e vendedor substituto, contatos pessoais, reseta senha, troca e-mail de login, "fixa" usuário no computador, gerencia a carteira de clientes e os documentos do usuário. |

**Quem usa:** todos os usuários logados veem `tool.Cabecalho` + `tool.MenuPaginas` + a engrenagem.
`pop.ConfigUsuario` é de qualquer um sobre si mesmo. `pop.ConfigSistema` e `pop.CadastroUsuarios` são de
administração — na prática Diretoria (hierarquia 1) e, para alguns botões, o departamento Financeiro.

### Controle de acesso de fato (só no navegador)

Não existe nenhuma verificação de servidor. Tudo o que segue acontece no cliente e pode ser contornado
digitando a URL da página ou chamando a Data API do Bubble (que está exposta — ver §7).

1. **Sessão.** A única checagem é `tool.Cabecalho` WF **bTKRG**: `ConditionTrue` com condição
   `CurrentUser.Ativo is false` → `LogOut` + vai para `index`. Ou seja: **usuário deslogado não é expulso de
   página nenhuma** (o Bubble mostra a página vazia), e usuário **ativo** nunca é conferido contra perfil ou departamento.
2. **Menu de páginas.** O link de cada item (`tool.MenuPaginas`, elemento `Link A`) nasce com
   `link_disabled=True` e só é habilitado por três condicionais equivalentes, quando a linha de
   `Tbl.ConfigSistema` com `QualPagina = item` contém o departamento do usuário (`QuaisDeptos`), o perfil
   (`QuaisPerfis`) **ou** o próprio usuário (`QuaisUsuarios`). Quem não passa vê o item cinza e não clicável —
   mas a página continua acessível pela URL.
3. **Menu de configuração.** Mesma mecânica em `tool.MenuConfig`, elemento `btn submenu`
   (`button_disabled=True` por padrão), contra a linha com `QualMenuConfig = item`.
4. **Dentro de `pop.CadastroUsuarios`** (condicionais de elemento, sem bloqueio no servidor):
   - Editar usuário (`btn edita usuario`): desabilitado quando `CurrentUser.QualPerfil:hierarquia ≠ 1`,
     **exceto** por uma condicional com nome de pessoa fixo no código (`CurrentUser.NomeModelo equals
     "gabriella mesquita de sousa"` → habilita).
   - Resetar senha (`btn reset senha`) e fixar usuário (`Icon B`): desabilitados se
     `CurrentUser.QualPerfil ≠ Diretor`.
   - Documentos do usuário (`Icon A`): habilitado se `hierarquia = 1` **ou** departamento = Financeiro.
   - Trocar e-mail de login (`Icon N`): desabilitado se `hierarquia > 1`.
   - **Sem restrição nenhuma:** o switch Ativo/Inativo da lista, o botão "Novo Usuário", a carteira de clientes,
     os contatos pessoais e o botão Gravar.
5. **Dentro de `pop.ConfigSistema`:** só o bloco de tokens do Gmail (`gp dados token`) é condicionado a
   `CurrentUser.QualPerfil = Diretor`. Todo o resto — inclusive a tabela que define **quem acessa o quê** —
   está aberto a quem conseguir abrir o popup, e é gravado por *auto-binding* (sem botão Salvar).
6. **Atributos declarativos que ninguém usa:** `Opt.MenuPaginas.hierarquia`,
   `Opt.MenuPaginas.DepartamentosAcessiveis`, `Opt.MenuConfig.Hierarquia` e
   `Opt.MenuConfig.perfilmenorigual` existem, mas nenhuma condicional ou workflow os lê. A regra real está
   toda em `Tbl.ConfigSistema` (dados), não no option set.

---

## 2. Estrutura

### 2.1 `tool.Cabecalho` (bTIVb)

**Contrato de entrada:** nenhum. A página só insere `USA Reusable tool.Cabecalho` e depois **lê os estados
customizados dele** para decidir o que mostrar (é o cabeçalho que controla o menu lateral e o painel de
histórico das páginas hospedeiras).

**Estados customizados (7):**
| Estado | Tipo | Uso |
|---|---|---|
| `var_showmenu_` | boolean | menu lateral aberto/fechado; as páginas mostram `tool.MenuPaginas` quando é true |
| `var_showhistorico_` | boolean | painel `tool.Historico` aberto/fechado |
| `var_qualsubmenu_` | `Opt.MenuConfig` | declarado, **nunca escrito nem lido** |
| `var_colorhex_` | text | declarado, **nunca usado** |
| `var_numberpadding_` | number | declarado, **nunca usado** |
| `var_tipoalerta_` (em `pop alerta geral`) | `Opt.tipoalerta` | qual texto/ação o popup de confirmação executa; só existe o valor `resetar_senha` |
| `var_qualusuario_` (em `pop alerta geral`) | User | alvo do reset de senha |

**Layout (`FloatingGroup ftg cabecalho`, bTIVd):**
- `gp menu` → ícone `btn menu` (bTIVj), que troca de `menu` para `menu_open` quando `var_showmenu_` é true;
  plugin de barra de rolagem (1642683387367, alvo `remodela`); HTML oculto `Redutor Toggles` (50 chars, sem uso aparente).
- Logo `Image A` (bTIVn): três fontes. A base é uma URL fixa do CDN; se `Page.Website Home` contém "test",
  usa o logo "teste megabox"; se não contém, usa o "live megabox". É como o app sinaliza ambiente de teste
  (o fundo do cabeçalho também muda: condicional em bTIVd).
- `gp logomarcas copy`: foto do usuário (`CurrentUser.Foto`, com imagem padrão quando vazia), nome
  (`NomeModelo` capitalizado) e perfil (`QualPerfil:display`); `tool.MenuConfig A` (bTgho, engrenagem);
  ícone `btn show historicos` (bTeAM).
- `btn show historicos` ganha **alerta visual**: quando existe pelo menos 1 cliente da carteira do usuário
  (`Tbl.GrupoCliFor: QualCarteira = CurrentUser`) com `UltimoHistoricoData ≤ hoje − 15 dias`, o ícone fica
  vermelho, gira e mostra a dica "Você possui clientes sem interação com prazo maior/igual a 15 dias".
- **Popup `pop historico`** (bTejp, tipo `Tbl.GrupoCliFor`): título "Histórico de conversas", foto e nome do
  cliente e uma tabela (`Table H`, bTejv) com os registros de `Tbl.Historico` do cliente, mais recentes primeiro,
  em 3 colunas fixas: data de criação/modificação, descrição e vendedor.
- **Popup `pop alerta geral`** (bTIpV): confirmação genérica "Você tem certeza?" com texto de reset de senha,
  checkbox "Envia credenciais por email" (`chk envia email`) e botões Cancela/Confirmar.
- Também embute `pop.AgendaContatos` (bTeHn) e `pop.AgendaEnderecos` (bTeHt), que não têm gatilho neste reusable.

### 2.2 `tool.MenuPaginas` (bTeRP)

**Contrato de entrada:** nenhum. A visibilidade é decidida pela página hospedeira a partir de
`tool.Cabecalho.var_showmenu_`. Não tem estado customizado próprio.

**Layout:**
- `RepeatingGroup A` (bTeRW) — fonte: `All(Opt.MenuPaginas)` ordenado por `ordem` crescente,
  **menos** `Opt.MenuPaginas.configura__es` (opção que não existe mais no option set — referência morta).
  Cada linha é um `Link A` (bTeRX) com `url = {Website Home}{item.página}`, desabilitado por padrão;
  hover aumenta a fonte; a página atual recebe barra colorida à esquerda
  (`Page.Current Page Name equals item.página`). As três condicionais de liberação estão em §1.
- `Button bugreport` (bTkgj2) "Comunicar Bug" → abre `pop bug report`.
- `Button A` (bTeRb) "Logout".
- **Popup `pop bug report`** (bTkgp2), com dois modos exclusivos:
  - `gp dados report` (bTkgv2, tipo `Tbl.BugReport`, oculto ao carregar): título (máx 75 caracteres,
    obrigatório), "Local do sistema" (dropdown de `Opt.PartesDoSistema`, obrigatório), anexo
    (`FileInput`, imagem ou vídeo até 16 MB, com ícone de pré-visualização), descrição obrigatória,
    botões Enviar/Cancela.
  - `gp lista reports` (bTkoB2): botão "Novo Bug" e tabela `rpg listabugs` (bTkhf2) alimentada pelo
    **App Connector** (outro app Bubble, "GestaoLure"), filtrando cartões de um painel fixo por id.
    Colunas: Detalhamento (descrição fatiada por `|`), Status (etapa do cartão), Data/Usuário,
    Respostas (RG de comentários) e Anexos (RG com link para download).

### 2.3 `tool.MenuConfig` (bTggV)

**Contrato de entrada:** nenhum; é instanciado dentro de `tool.Cabecalho`. Sem estado customizado.

**Layout:** `Group A` (bTghu) com os ícones engrenagem + seta; `GroupFocus A` (bTggm) ancorado na seta
(offset 10 / −250) contendo `rpg categorias` (bTggy) = `All(Opt.MenuConfig)` ordenado por `ordem`.
Cada célula é o texto `btn submenu` (bTghF), desabilitado por padrão e liberado pelas três condicionais
de `Tbl.ConfigSistema` descritas em §1.
Embute os popups: `pop.ConfigSistema` (bToKJ0), `pop.CadastroUsuarios` (bTgoG), `pop.CadastroProdutos`
(bTghX), `pop.ConfigUsuario` (bThAv, chamado "pop.MinhasConfigs") e **duas** instâncias do mesmo
`pop.CadastroCliFor` (bTjxk e bTgyf) — nenhuma delas é aberta por workflow deste reusable (§8.1).

### 2.4 `pop.ConfigSistema` (bToDT0)

**Contrato de entrada:** nenhum; abre por `ShowElement` (WF bToKP0). Não recebe dado; cada bloco faz a
própria busca. Sem estado customizado. Os grupos têm `group_type="user"` sem fonte de dados — herança
inútil (§8.1).

**Blocos (todos com cabeçalho clicável que expande/recolhe e ícone de seta que inverte):**
1. `NIVEIS VENDEDORES` (bTpwb) → tabela `rpg NiveisVendedor` (bTpwj), oculta ao carregar. Cada linha é um
   registro de `Tbl.NiveisVendedores` **editado por auto-binding** nas colunas: Nome (`NomeNivel`),
   Meta venda (`MetaVenda`, moeda), Comissão padrão (`ComissaoPadrao`/`cpo_fatorpremiacao_number`, % com 3 casas),
   Comissão meta batida (`ComissaoMetaBatida`/`cpo_metabonus_number`, % com 3 casas), Qtd p/ subir nível
   (`QtdMetaBatida`/`cpo_mediasobenivel_number`, inteiro) e uma coluna com as fotos dos vendedores ativos daquele nível
   (`rpg vendedores do nivel`, bTqCF). Botão "Novo Nível" (`Button A`, bTqAw) aparece junto com a tabela.
2. `ACESSO A MODULOS` (bToDV0) → tabela `rpg acessomodulos` (bToGJ0): linhas de `Tbl.ConfigSistema` com
   `NomeConfig = "Permissões de acesso às páginas"`, ordenadas por `CodigoConfig`. Colunas: nome do módulo
   (`QualPagina:display`) e três multi-selects com auto-binding — Quais departamentos, Quais perfis, Quais usuários.
3. `ACESSO A CONFIGURACOES` (bToPP0) → tabela `rpg acessoconfig` (bToPZ0): linhas com
   `NomeConfig = "Permissão de acesso às configurações"`; coluna 1 é `QualMenuConfig:display`; mesmas três colunas de seleção.
4. `COPIA DE EMAILS` (bToEu0) → tabela `rpg copiaemails` (bToNR0): linhas com
   `QualGrupoConfig = Opt.GrupoDeConfigsSistema.Cópia de emails`, ordem `CodigoConfig` desc. Colunas: nome do
   envio automático (`NomeConfig`) e "Quais usuários" recebem cópia oculta.
5. `CONTROLE RECIBOS` (bTxzT0) → linha única `CodigoConfig = 17`; input inteiro com auto-binding no campo
   `ValorNumero` = numeração atual dos recibos de recebimento (usada pela página `financeiro`).
6. `RESPOSTAS EMAILS` (bUCFJ) → "Emails e respostas (Gmail)": tabela `rpg RespostasEmails` (bUCFV) que
   consulta a API do Gmail (`LeituraGmail.ListarMail`) filtrada pelo dropdown `Dd filtro emails`
   (`Opt.FiltrosGmail`, default "Caixa de saída"); para cada mensagem, uma segunda chamada (`LerMail`) mostra
   labels, data/hora (corrigida em −3 h), De, Para, Cc, Cco, Assunto e código, mais um HTML com o corpo.
   Abaixo, `gp dados token` — visível **só para Diretor** — mostra o `code` da URL e os campos da linha
   `CodigoConfig = 21`: data/hora do token, expiração, **access token** e **refresh token** em texto puro na
   tela, com botões "Limpar Token", "Login Aba" e "Login Popup".
7. `CONTROLE EMAILS` (bUBlp) → linha `CodigoConfig = 19`: "Qtd e-mails do dia" (`ValorNumero`, input
   desabilitado), toggle "Fazer contagem diária" (`ValorBoolean2`) e toggle "SMTP próprio" (`ValorBoolean1`).
   Embute `pop.RespostasEmails` (bUCGq) e `pop.CadastroUsuarios` (bTqCV).

**Observação sobre os inputs dos níveis:** as cinco colunas editáveis têm `content` apontando para
`Ancestor[TableCrossAxis]:cpo.NomeNivel` (copiar/colar), mas o que vale é o `bind_field` — quem salva é o
auto-binding, não o `content`. O texto exibido antes do foco pode ficar errado (§8.3).

### 2.5 `pop.ConfigUsuario` (bTgyx)

**Contrato de entrada:** recebe o dado por `DisplayGroupData` (WF bThCh do `tool.MenuConfig`), sempre com
`CurrentUser`. Todo o conteúdo é um `Group F` (bThBz) do tipo `user` alimentado por `Parent`.
Sem estado customizado. **Todos os campos são auto-binding: não há botão Salvar nem Cancelar.**

| Bloco | Campos (campo do banco) |
|---|---|
| Dados Pessoais | Foto (`cpo_foto_image`), Nome (`cpo_nome_text`, obrigatório), **Página de início** (dropdown `All(Opt.MenuPaginas)` → `cpo_qualpaginainicial_option_opt_menu`, obrigatório) |
| Documentos/contato | CPF (máscara `000.000.000-00`), RG, Endereço, Cidade, Estado (`Opt.UFs`), Telefone (máscara `(00) 0 0000-0000`) |
| Enviar E-mails | "Enviar cópia de propostas para" (`cpo_copiaocultaproposta_text`), "de pedidos" (`cpo_copiaoculta_text`), "de cancelamentos" (`cpo_copiaocultacancelamentos_text`) — texto livre, "endereços separados por vírgula" |

As três condicionais de borda vermelha nesses inputs testam `UsaEmailPessoal - deleted` e
`SmtpEndereco - deleted`, **campos já excluídos** do data type: condicional morta (§8.1).

### 2.6 `pop.CadastroUsuarios` (bTgiN)

**Contrato de entrada:** nenhum — abre por `ShowElement` (WF bTgqz do `tool.MenuConfig`, WF bTqCz/bTqnx do
`pop.ConfigSistema`) e monta a lista sozinho. O grupo de formulário `gp ddados usuario` (bTgik) é que recebe
dado: vazio = criação, preenchido = edição (`DisplayGroupData`, WF bTgnV).

**Estado customizado:** `var_contatosusuario_` (lista de texto) — segura os contatos digitados **antes** do
usuário existir.

**Layout:**
- **Modo lista** (`Group B`, bTgoM, visível quando o formulário está escondido): filtros Nome
  (autocomplete sobre `Search(User)`), Departamento, Perfil, "Filtrar ativos" (radio `Opt.SimNão`, default
  "Ativos") e o botão "Novo Usuário"; abaixo, a tabela `rpg usuarios` (bTgkj) com colunas Foto, Nome,
  Email real MEGABOX (`EmailContato`), **Email falso de login** (`email`), Departamento, Perfil,
  Nível vendedor, Ativo (switch) e Ações.
  Ações por linha: editar (lápis), carteira de clientes (carteira), documentos do usuário (`note_add`),
  resetar senha (`lock_reset`), fixar usuário neste computador (`install_desktop`).
  A foto fica com uma imagem "inativo" quando `Ativo = false`.
- **Modo formulário** (`gp ddados usuario`): título muda para "Novo Usuário"/"Edita Usuário".
  - *Dados Usuário*: foto, Nome ("Utilize apenas Nome Sobrenome", obrigatório), **Email MEGABOX**
    (`EmailContato`, obrigatório), **Email de login (automático)** — desabilitado sempre; na criação é
    calculado como `nome sem acento` com espaços trocados por ponto, minúsculo, mais o domínio corporativo
    fixo; na edição mostra o e-mail atual e só o ícone `Icon N` permite trocar. Dropdowns obrigatórios
    "Qual departamento" (`Opt.DeptoUsuario`, mostra o rótulo + a descrição) e "Qual perfil"
    (`Opt.PerfilUsuario`); dropdown opcional "Nível vendedor" (`Tbl.NiveisVendedores`, exibe nome + meta).
  - *Dados pessoais*: CPF (máscara), RG, Endereço, Cidade, Estado, Telefone (máscara).
  - *Férias e substituto*: toggle "Indicar substituto de férias" (`tgg indica substituto`) que habilita e
    torna obrigatórios Férias início, Férias fim (mínimo = início + 1 dia) e Substituto
    (usuários ativos **que não sejam** do departamento Financeiro nem Operação).
  - *Contatos pessoais*: Nome contato + Telefone contato + ícone salvar; tabela dos contatos já gravados,
    cada um uma string `nome;telefone`, com ícone de excluir.
  - *Botões*: Gravar/Salvar, Cancela e checkbox "Envia credenciais por e-mail" (desabilitado na edição).
- **Popup `pop carteira`** (bTkKl, tipo user): dois lados. À esquerda "Lista de Clientes" (`rpg clientes sem
  carteira`) com busca por nome, filtro "Carteira atual" (dropdown de usuários) e checkbox "Exibir somente
  clientes sem carteira" (que zera e desabilita o filtro de carteira); seta `≫` move o cliente para a carteira.
  À direita "Carteira de {usuário}" (`rpg carteira`) com contador e `×` para remover. Ambas as tabelas
  mostram a contagem na primeira coluna do cabeçalho.
- **Popup `pop ResetSenha`** (bTgov): confirmação, toggle "Enviar novas credenciais por email"
  (o texto do aviso muda conforme o toggle), Confirmar/Cancela.
- **Popup `pop FixarUsuario`** (bTkRv): confirmação de gravar o usuário **neste computador**, com elemento
  `LocalStorage B` (plugin 1617739938396).
- **Popup `pop AlterarEmail`** (bTktN): e-mail atual (desabilitado), novo e-mail, botão "Alterar Email".
- Embute `pop.AnexosClifor` (bTkMd) para os documentos do usuário.

---

## 3. Dados

### 3.1 Listas e buscas

| Onde | Busca | Observação |
|---|---|---|
| `tool.MenuPaginas` `RepeatingGroup A` | `All(Opt.MenuPaginas)` ordenado por `ordem`, menos a opção inexistente `configura__es` | option set, vai inteiro para o navegador |
| `tool.MenuPaginas` `Link A` (3 condicionais) | `Search(Tbl.ConfigSistema: QualPagina = item):first_element` → `QuaisDeptos` / `QuaisPerfis` / `QuaisUsuarios` | **3 buscas por linha do menu**, repetidas a cada render |
| `tool.MenuPaginas` `rpg listabugs` | App Connector: cartões de um painel fixo do app "GestaoLure" | id do painel embutido no filtro |
| `tool.MenuConfig` `rpg categorias` | `All(Opt.MenuConfig)` ordenado por `ordem` | idem menu de páginas |
| `tool.MenuConfig` `btn submenu` (3 cond.) | `Search(Tbl.ConfigSistema: QualMenuConfig = item):first_element` → mesmas 3 listas | 3 buscas por item |
| `tool.Cabecalho` alerta de histórico | `Search(Tbl.GrupoCliFor: QualCarteira = CurrentUser AND UltimoHistoricoData ≤ hoje−15d):count ≥ 1` | roda em toda página |
| `tool.Cabecalho` `Table H` | `Search(Tbl.Historico: QualCliente = Parent; Created Date desc)` | histórico de conversas do cliente |
| `ConfigSistema` `rpg NiveisVendedor` | `Search(Tbl.NiveisVendedores; sort Ordem)` | |
| `ConfigSistema` `rpg vendedores do nivel` | `Search(User: QualNivelVendedor = nível AND Ativo = true)` | uma busca por linha |
| `ConfigSistema` `rpg acessomodulos` | `Search(Tbl.ConfigSistema: NomeConfig = "Permissões de acesso às páginas"; sort CodigoConfig)` | filtro por **texto literal** |
| `ConfigSistema` `rpg acessoconfig` | `Search(Tbl.ConfigSistema: NomeConfig = "Permissão de acesso às configurações"; sort CodigoConfig)` | idem |
| `ConfigSistema` `rpg copiaemails` | `Search(Tbl.ConfigSistema: QualGrupoConfig = Cópia de emails; sort CodigoConfig desc)` | aqui usa option set, não texto |
| `ConfigSistema` "Quais usuários" (3 lugares) | `Search(User: Ativo = true AND QualPerfil not in linha.QuaisPerfis AND QualDepto not in linha.QuaisDeptos; sort NomeModelo)` | tira quem já entra por perfil/depto |
| `ConfigSistema` recibos / e-mails / token | `Search(Tbl.ConfigSistema: CodigoConfig = 17 / 19 / 21):first_element` | linhas identificadas por **número mágico** |
| `CadastroUsuarios` `rpg usuarios` | `Search(User: NomeModelo = filtro AND QualDepto = filtro AND QualPerfil = filtro AND Ativo = radio; sort NomeModelo, ignore empty)` | |
| `CadastroUsuarios` `rpg carteira` | `Search(Tbl.GrupoCliFor: TipoCliFor = Cliente AND QualCarteira = usuário AND NomeCliFor = busca)` | |
| `CadastroUsuarios` `rpg clientes sem carteira` | `Search(... QualCarteira ≠ usuário AND QualCarteira = filtro AND Ativo = true)`; com o checkbox marcado troca para `QualCarteira is empty` | |
| `CadastroUsuarios` `dd nivel vendedor` | `Search(Tbl.NiveisVendedores)` | |
| `CadastroUsuarios` `ipt substituto` | `Search(User: Ativo = true AND QualDepto ≠ Financeiro AND QualDepto ≠ Operação)` | |
| `ConfigUsuario` "Página de início" | `All(Opt.MenuPaginas)` | sem filtrar pelo que o usuário pode ver |

### 3.2 Mapa de navegação completo — menu de páginas (`Opt.MenuPaginas`)

A coluna "Quem vê hoje" é **dado**, não código: vem da linha de `Tbl.ConfigSistema` com aquele `QualPagina`
(listas `QuaisDeptos`/`QuaisPerfis`/`QuaisUsuarios`). O mapa não traz o conteúdo das linhas. A coluna
"Declarado no option set" traz os atributos `hierarquia` e `DepartamentosAcessiveis`, que **não são lidos por
nada** — servem no máximo como intenção original.

| Ordem | Item (menu) | Página / rota | Declarado no option set (não usado) | Quem vê hoje |
|---|---|---|---|---|
| 1 | Inicio | `inicio` | hierarquia 4; deptos: Comercial, Financeiro, Operação, Administrativo | linha ConfigSistema de `inicio` |
| 2 | Fluxo de Vendas | `vendas` | hierarquia 4; os 4 departamentos | linha ConfigSistema de `vendas` |
| 3 | Fluxo Financeiro | `financeiro` | hierarquia 2; Financeiro e Administrativo | linha ConfigSistema de `financeiro` |
| 5 | Metas & Vendas | `metas` | hierarquia 2; só Administrativo | linha ConfigSistema de `metas` |
| 6 | Manutenção | `rotinas` | hierarquia 1; sem departamentos | linha ConfigSistema de `rotinas` |
| — | Relatórios | `relatorios` | **sem `ordem`, sem hierarquia, sem departamentos** | linha ConfigSistema de `relatorios` |
| — | Suporte de Vendas & Nps | `sac` | **sem `ordem`, sem hierarquia, sem departamentos** | linha ConfigSistema de `sac` |

Notas: a `ordem` 4 não existe (item removido); os dois itens sem `ordem` caem no início/fim da ordenação de
forma indefinida; a lista ainda subtrai `Opt.MenuPaginas.configura__es`, opção que não existe mais.
As páginas `formulariovenda`, `formularionps`, `reset_pw`, `loginrealizado`, `index`, `404` e `historico_full`
não estão no menu (são atingidas por URL, e-mail ou redirecionamento).

### 3.3 Mapa de navegação completo — menu de configuração (`Opt.MenuConfig`)

| Ordem | Item | Abre | Como (WF) | Declarado (não usado) |
|---|---|---|---|---|
| 1 | Configurações de Usuário | popup `pop.ConfigUsuario` com `CurrentUser` | bThCh | Hierarquia 4 |
| 2 | Configurações de Sistema | popup `pop.ConfigSistema` | bToKP0 | Hierarquia 1 |
| 3 | Cadastro Usuários | popup `pop.CadastroUsuarios` | bTgqz | Hierarquia 2 e `perfilmenorigual = diretoria` |
| 4 | Cadastro Produtos | popup `pop.CadastroProdutos` | bTghQ | Hierarquia 3 |
| 5 | Cliente / Fornecedor | página `cadastros`, **em nova aba** | bTgyl | Hierarquia 3 |
| 6 | FollowUp de Pedidos | página `historico`, **em nova aba** | bTvIg | Hierarquia 2 |

Em todos os casos o `GroupFocus` do menu é fechado junto. Quem libera cada item é a linha de
`Tbl.ConfigSistema` com `QualMenuConfig` igual ao item (mesmas três listas).

### 3.4 Linhas conhecidas de `Tbl.ConfigSistema`

`Tbl.ConfigSistema` é uma tabela chave-valor genérica (15 campos: `NomeConfig`, `CodigoConfig`,
`QualGrupoConfig`, `QualPagina`, `QualMenuConfig`, `QuaisDeptos`, `QuaisPerfis`, `QuaisUsuarios`,
`ValorTexto1/2`, `ValorNumero`, `ValorBoolean1/2`, `ValorDataHora1/2`). Os códigos citados no app inteiro:

| CodigoConfig | Uso | Onde aparece |
|---|---|---|
| 5, 6, 7, 8, 9, 10 | cópias ocultas de e-mail por tipo de envio (grupo "Cópia de emails") | `rpg copiaemails`, páginas `vendas`/`financeiro` |
| 17 | contador de recibos de recebimento (`ValorNumero`) | `CONTROLE RECIBOS`, página `financeiro` |
| 19 | e-mails enviados no dia (`ValorNumero`), contagem diária ligada (`ValorBoolean2`), SMTP próprio (`ValorBoolean1`) | `CONTROLE EMAILS`, backend `ResetContagemEmails` |
| 21 | **tokens do Google**: access token (`ValorTexto1`), refresh token (`ValorTexto2`), obtido em (`ValorDataHora1`), expira em (`ValorDataHora2`), `expires_in` (`ValorNumero`) | `gp dados token`, backend `RefreshTokenGoogle` |
| (sem código fixo) | uma linha por página (`QualPagina`) e uma por item de configuração (`QualMenuConfig`) com as listas de permissão | `rpg acessomodulos`, `rpg acessoconfig`, menus |

---

## 4. Funcionalidades e regras de negócio

### 4.1 Abrir e fechar o menu lateral — `tool.Cabecalho`

- **WF bTIWB** (clique em `btn menu`, condição `var_showmenu_ is false`) → ação `SetCustomState` **bTIWv**:
  `var_showmenu_ = true`.
- **WF bTIWw** (mesmo clique, condição `var_showmenu_ is true`) → `SetCustomState` **bTIXB**: `false`.
  São dois workflows para um toggle (§8.2). O ícone troca para `menu_open` por condicional; a página
  hospedeira é que mostra/esconde `tool.MenuPaginas`.

### 4.2 Abrir e fechar o painel de histórico — `tool.Cabecalho`

- **WF bTeAp** (clique em `btn show historicos`, `var_showhistorico_ is false`) → `SetCustomState` **bTeAv** = true.
- **WF bTeAw** (mesmo clique, `is true`) → `SetCustomState` **bTeBB** = false.
- **WF bTenT** (clique no `Icon Q` do `pop historico`) → `HideElement` **bTenZ**: fecha o popup de histórico
  de conversas do cliente. Quem **abre** esse popup são as páginas hospedeiras, não o cabeçalho.

### 4.3 Deslogar usuário inativo — `tool.Cabecalho`

- **WF bTKRG** — evento `ConditionTrue` com condição `CurrentUser.Ativo is false`:
  1. `LogOut` **bTKRL**; 2. `ChangePage` **bTKRM** para a página `index`.
  É a única proteção de sessão do app inteiro, e roda **no navegador**: quem estiver com a aba aberta e for
  inativado cai na tela de login; quem chamar a Data API não é afetado.

### 4.4 Sair do sistema — `tool.MenuPaginas`

- **WF bTeRd** (clique em `Button A` "Logout"): 1. `LogOut` **bTeRi**; 2. `ChangePage` **bTeRj** → `index`.
  Observação: o app tem "fixar usuário" (§4.16), que deixa e-mail e senha no `localStorage`; o logout **não**
  limpa esse armazenamento, então a tela `index` continua oferecendo login automático.

### 4.5 Navegar entre páginas — `tool.MenuPaginas`

Não há workflow: a navegação é um `<a href>` (`Link A`) montado com `Website Home + item.página`.
O item só é clicável se uma das três condicionais de permissão for verdadeira (§1.2). Efeitos:
- nenhuma navegação passa por verificação de servidor;
- o item da página atual ganha a barra colorida à esquerda;
- as três buscas de permissão rodam para **cada** item, em **cada** página (§8.4).

### 4.6 Comunicar bug — `tool.MenuPaginas`

1. **WF bTkqF2** (clique em `Button bugreport`) → `ShowElement` **bTkqL2**: abre `pop bug report`.
2. **WF bTkoV2** (clique em `Button D` "Novo Bug") → `ShowElement` **bTkob2** (formulário) +
   `HideElement` **bTkof2** (lista).
3. **WF bTkoJ2** (clique em `Button C` "Enviar"):
   1. `apiconnector2-bTlZL0.bTlZQ0` **bTlae0** — POST `CriarCartao` no app "GestaoLure" com
      Anexo (URL do arquivo), Usuário (primeiro nome do `CurrentUser` em maiúsculas), Descrição, Nome do
      cartão (título) e Parte do sistema;
   2. `ResetInputs` **bTkoT2**; 3. `HideElement` **bTkoU2** (formulário); 4. `ShowElement` **bTkrf2** (lista);
   5. `apiconnector2-bTlZL0.bTleD` **bTlfo** — `GetCartoes(Action)` com `QualEtapa` vazio, só para atualizar a lista.
   Não há validação de erro da API nem mensagem de sucesso.
4. **WF bTkqd2** (clique em `Button E` "Cancela"): `ResetGroup` **bTkqj2** + `HideElement` **bTkqk2** +
   `ShowElement` **bTkql2** (volta para a lista).
5. **WF bTksb2** (clique no `Icon G`, olho) → `OpenURL` **bTksi2** em nova aba com o anexo que está no input.
6. **WF bTlgp** (clique no `Text V`, nome do anexo na lista) → `OpenURL` **bTlgv** em nova aba com o link do
   anexo do cartão.

### 4.7 Abrir o menu de configuração e trocar de submenu — `tool.MenuConfig`

- **WF bTgiF** (clique em `Group A`, a engrenagem) → `ToggleElement` **bTgiM** no `GroupFocus A`.
- Cada item do submenu tem **um workflow próprio**, todos no mesmo elemento `btn submenu`, diferenciados pela
  condição `Ancestor[TableCrossAxis] equals <opção>`:

| WF | Condição (item) | Ações |
|---|---|---|
| bThCh | Configurações de Usuário | `DisplayGroupData` **bThCp** (`pop.MinhasConfigs` ← `CurrentUser`), `ShowElement` **bThCj**, `HideElement` **bThCn** (fecha o menu) |
| bToKP0 | Configurações de Sistema | `ShowElement` **bToKV0** (`pop.ConfigSistema`), `HideElement` **bToKW0** |
| bTgqz | Cadastro Usuários | `ShowElement` **bTgrB** (`pop.CadastroUsuarios`), `HideElement` **bTgrF** |
| bTghQ | Cadastro Produtos | `ShowElement` **bTghd** (`pop.CadastroProdutos`), `HideElement` **bTghh** |
| bTgyl | Cliente / Fornecedor | `HideElement` **bTgyr**, `ChangePage` **bTxxz** → página `cadastros` em nova aba |
| bTvIg | FollowUp de Pedidos | `HideElement` **bTvIm**, `ChangePage` **bTvIr** → página `historico` em nova aba |

Nenhum desses workflows confere permissão: a única barreira é o `button_disabled` da condicional.

### 4.8 Editar as próprias preferências — `pop.ConfigUsuario`

Não há workflow de gravação: **todos** os campos são auto-binding no registro `User` exibido
(`CurrentUser`, vindo de bThCh). Cada tecla grava. Campos: foto, nome, página de início, CPF, RG, endereço,
cidade, UF, telefone e os três endereços de cópia oculta (proposta, pedido, cancelamento).
- **WF bThCK** (clique no `Icon A`) → `HideElement` **bThCQ**: fecha o popup. É o único workflow do reusable.
- Consequências: não existe cancelar/desfazer; não existe validação de CPF/telefone além da máscara visual;
  o campo "Página de início" aceita qualquer item de `Opt.MenuPaginas`, inclusive páginas que o usuário não
  pode abrir. O mapa **não mostra** quem lê `QualPaginaInicial` no redirecionamento pós-login ([DÚVIDA 6]).

### 4.9 Editar a configuração do sistema — `pop.ConfigSistema`

Também é quase todo auto-binding, sem botão Salvar. Workflows:

- **WF bToFx0** (clique `Icon A`) → `HideElement` **bToGB0**: fecha o popup.
- **WF bToQt** (clique no cabeçalho `gp toggle rpgmodulos`) → `ToggleElement` **bToQz** na tabela de acesso a módulos.
- **WF bToRe** (cabeçalho `gp toggle rpgconfig`) → `ToggleElement` **bToRk** na tabela de acesso às configurações.
- **WF bToRl** (cabeçalho `gp toggle rpgemails`) → `ToggleElement` **bToRr** na tabela de cópia de e-mails.
- **WF bUCGG** (cabeçalho do bloco Gmail) → `ToggleElement` **bUCGL** no grupo `gp show emails`.
- **WF bTqBO** (cabeçalho dos níveis) → `ToggleElement` **bTqBU** (tabela) + `ToggleElement` **bTqBZ** (botão "Novo Nível").

**Permissões (o coração da configuração):** editar as listas *Quais departamentos*, *Quais perfis* e
*Quais usuários* nas tabelas `rpg acessomodulos` e `rpg acessoconfig` é um auto-binding direto nos campos
`cpo_quaisdeptos_list_option_opt_deptousuario`, `cpo_quaisperfis_list_option_opt_perfilusuario` e
`cpo_quaisusuarios_list_user` da linha de `Tbl.ConfigSistema`. Efeito imediato, sem log, sem confirmação, e
a regra de privacidade `autobinding` do data type permite isso a **qualquer usuário logado** (§7).

**Níveis de vendedor:**
- **WF bTqBD** (clique em "Novo Nível") → `NewThing` **bTqBJ** em `Tbl.NiveisVendedores` com
  `Ordem = Search(NiveisVendedores):Ordem:max + 1`. Cria a linha vazia; nome, meta e comissões são
  preenchidos depois por auto-binding.
- **WF bTqCz** (clique na foto de um vendedor do nível) → `ShowElement` **bTqDF**: abre `pop.CadastroUsuarios`.
- **WF bTqnx** (clique no `Icon K`, mostrado quando o nível não tem nenhum vendedor) → `ShowElement` **bTqoD**:
  abre o mesmo cadastro. Nenhum dos dois passa qual usuário deveria ser editado (§8.3).

**Controle de e-mails:**
- **WF bUBoX** (toggle "SMTP próprio") → `ChangeThing` **bUBod**: `ValorBoolean1 = valor do toggle` na linha 19.
- **WF bUBoF** (toggle "Fazer contagem diária"):
  1. `ChangeThing` **bUBoL**: `ValorBoolean2 = valor do toggle` na linha 19;
  2. `ScheduleAPIEvent` **bUBoN**: agenda o backend `ResetContagemEmails` (bUBmh) para **amanhã às 00:00**.
  O agendamento acontece mesmo quando o toggle é **desligado** — não há `SÓ SE` (§8.3).

**Integração Gmail:**
- **WF bUCGT** (botão "Login Aba", oculto ao carregar) → `OpenURL` **bUCHB** em nova aba para o consentimento
  OAuth do Google, com `client_id` escrito no workflow, `redirect_uri` = a própria página, escopo
  `gmail.readonly`, `access_type=offline`.
- **WF bUCRu** (botão "Login Popup") → ação de plugin JavaScript **bUCSA** que abre a mesma URL numa janela
  600×700, com `redirect_uri` fixo na página `loginrealizado` (versão live ou test conforme o domínio).
- **WF bUCJH** (botão "Limpar Token") → `ChangeThing` **bUCJN** na linha `CodigoConfig = 21`, zerando
  `ValorTexto1`, `ValorTexto2`, `ValorDataHora1`, `ValorDataHora2` e `ValorNumero`.
- A troca do `code` por token e a renovação ficam fora deste reusable: página `loginrealizado` e backend
  `RefreshTokenGoogle` (bUCKC) — §6.

### 4.10 Listar e filtrar usuários — `pop.CadastroUsuarios`

Sem workflow: a tabela `rpg usuarios` reage direto aos quatro filtros (nome, departamento, perfil, radio
Ativos/Inativos/Todos, com `ignore empty`). A opção "Todos" do `Opt.SimNão` não tem `Boolean`, então o filtro
`Ativo = radio:boolean` fica vazio e é ignorado — é assim que "Todos" funciona.

### 4.11 Criar usuário

- **WF bTgmD** (clique em `btn novo usuario`) → `ShowElement` **bTgoZ** no `gp ddados usuario` **sem** dado
  → o grupo entra em modo criação (título "Novo Usuário").
- **WF bTkQn0** (`InputChanged` em `ipt nome novo usuario`) — **workflow sem nenhuma ação** (§8.1). O e-mail
  de login "automático" é calculado por condicional do próprio input, não por este workflow.
- **WF bTgml** (clique em `btn gravar novo usuario`, condição `gp ddados usuario` **vazio**):
  1. `CreateUserAccount` **bTgmn** com `email` = o e-mail de login gerado e os campos:
     `Ativo = true`, `EmailLoginTexto`, `Foto`, `NomeModelo` (minúsculo), `QualPerfil`, `QualDepto`,
     `Telefone`, `Cpf`, `Rg`, `Endereço`, `Cidade`, `uf`, `ContatosPessoais` (do estado
     `var_contatosusuario_`), `EmailContato`, `QualNivelVendedor`, `FeriasInicio` (00:00),
     `FeriasFim` (**00:00** — na edição é 23:59:59, divergência §8.3), `FeriasPeriod` (intervalo início→fim 23:59:59),
     `QualVendedorSubstituto`;
  2. `SetTemporaryPassword` **bTgmr** — gera a senha temporária;
  3. `ChangeThing` **bTkRu** no usuário criado: **`PassTexto` = a senha em texto puro** e as três cópias
     ocultas (`CopiaPedido`, `CopiaCancelamentos`, `CopiaProposta`) iguais ao `EmailContato`;
  4. `SendEmail` **bTgms** — `SÓ SE` o checkbox "Envia credenciais" estiver marcado **e**
     `CurrentUser.UsaEmailPessoal - deleted is false` (campo excluído — a condição é sempre verdadeira, §8.3);
     manda para o `EmailContato` o e-mail de login e a senha, remetente "Sistema MegaBox";
  5. `ResetInputs` **bTgmt**; 6. `HideElement` **bTkQH0**.
- **Validação existente:** só os `mandatory` dos inputs (nome, e-mail MegaBox, e-mail de login, departamento,
  perfil; férias e substituto ficam obrigatórios com o toggle ligado). **Não há** verificação de e-mail
  duplicado (o texto do `pop AlterarEmail` avisa "nenhum e-mail de login pode repetir" mas nada checa),
  nem de CPF válido, nem de quem pode criar um usuário, nem de qual perfil quem cria pode atribuir —
  qualquer usuário logado que abra o popup pode criar um **Diretor**.
- **Diferença importante:** na criação o e-mail de login é derivado do nome (sem acento, espaços → ponto,
  minúsculo) + domínio corporativo fixo, e é **desabilitado**; o "Email MEGABOX" (`EmailContato`) é o
  endereço real que recebe as mensagens. A tabela chama um de "Email real MEGABOX" e o outro de
  "Email falso de login".

### 4.12 Editar usuário

- **WF bTgnV** (clique em `btn edita usuario`): `DisplayGroupData` **bTgnX** (`gp ddados usuario` ← linha da
  tabela) + `ShowElement` **bTkQJ0**.
- **WF bTgmZ** (clique em Gravar, condição `gp ddados usuario` **não vazio**):
  1. `ChangeThing` **bTgmb** no usuário exibido, gravando `Foto`, `NomeModelo`, `QualPerfil`, `QualDepto`,
     `Cpf`, `Rg`, `Endereço`, `Cidade`, `uf`, `Telefone`, `EmailContato`, `QualNivelVendedor`,
     `FeriasFim` (23:59:59), `FeriasInicio` (00:00), `FeriasPeriod`, `QualVendedorSubstituto`.
     **Não grava** `ContatosPessoais` (isso é feito na hora, §4.15) nem o e-mail de login;
  2. `ResetInputs` **bTgmf**; 3. `ResetGroup` **bTkQN0**; 4. `HideElement` **bTkQI0**;
  5. `ScheduleAPIEvent` **bUBpV** — `SÓ SE` o toggle "Indicar substituto de férias" estiver ligado:
     dispara o backend `AtribuirVendedorSubstituto` (bUBpN) com `Vendedor` (o `Parent` do grupo),
     `Substituto`, `DataInicio` e `DataFim` — ver §6.
- **WF bTgmN** (clique em Cancela): `ResetGroup` **bTgmT** + `HideElement` **bTgod**.
- **WF bTgqn** (clique no `Icon C`, fechar o popup): `ResetGroup` **bTgqp** no formulário + `HideElement`
  **bTgqt** no reusable inteiro.

### 4.13 Ativar / inativar usuário

- **WF bTzWZ** (mudança do `Switch A` na coluna "Ativo" da lista) → `ChangeThing` **bTzWf**:
  `Ativo = valor do switch` na linha da tabela. **Sem confirmação e sem restrição de perfil.**
  Efeito colateral: quem estiver logado cai por `tool.Cabecalho` WF bTKRG na próxima avaliação da condição.

### 4.14 Definir perfil, departamento e nível de vendedor

Não há workflow dedicado: os dropdowns `dd perfil novo usuario` (`Opt.PerfilUsuario`),
`dd dpto novo usuario` (`Opt.DeptoUsuario`) e `dd nivel vendedor` (`Tbl.NiveisVendedores`) são lidos pelo
Gravar (WF bTgml na criação, bTgmZ na edição). Consequências de negócio:
- o **perfil** determina a `hierarquia` usada em várias telas e entra nas listas `QuaisPerfis` da permissão;
- o **departamento** entra nas listas `QuaisDeptos`;
- o **nível de vendedor** liga o usuário à meta e às comissões (`Tbl.NiveisVendedores`), usadas nas páginas
  `metas` e `financeiro`; a tabela `Tbl.NiveisVendedores` ainda tem o campo `QuaisVendedores` (lista de users),
  que é o **caminho inverso** do `User.QualNivelVendedor` e não é escrito por estes workflows (§8.2).

### 4.15 Férias, vendedor substituto e contatos pessoais

- O toggle `tgg indica substituto` só controla habilitação/obrigatoriedade dos três campos (condicionais);
  não tem workflow.
- Ao gravar (bTgmZ), além dos campos de férias, o `ScheduleAPIEvent` **bUBpV** dispara
  `AtribuirVendedorSubstituto` (bUBpN), que faz `ChangeListOfThings` em **todas as entregas** do vendedor com
  `DataEntrega` dentro do período de férias, trocando `QualVendedorSubstituto`. Isso é o que redireciona
  comissão/atendimento durante as férias.
- Na **criação** (bTgml) esse agendamento **não acontece** — só na edição (§8.3).
- Contatos pessoais (lista de strings `nome;telefone`):
  - **WF bTkcs** (clique em `gravar contato usuario`, condição `Parent is empty`, isto é, usuário ainda não
    existe): `SetCustomState` **bTkcy** acrescenta `nome;telefone` ao estado `var_contatosusuario_`;
    `ResetInputs` **bTkcz**. O estado é gravado no `CreateUserAccount`.
  - **WF bTkdD** (mesmo clique, `Parent is not empty`): `ChangeThing` **bTkdL** grava
    `ContatosPessoais = "nome;telefone"` — o mapa mostra **atribuição**, não acréscimo, o que apagaria os
    contatos anteriores ([DÚVIDA 3]).
  - **WF bTkeF** (clique no `Icon M`, lixeira): `ChangeThing` **bTked** grava
    `ContatosPessoais = "{Ancestor[TableCrossAxis]}"` no usuário — de novo uma atribuição, que **deixaria só
    o contato clicado** em vez de removê-lo. Bug provável ([DÚVIDA 3]).

### 4.16 Senha, fixação no computador e troca de e-mail de login

**Resetar senha (dois caminhos idênticos):**
- Em `pop.CadastroUsuarios`: **WF bTgnd** (clique em `btn reset senha`) → `SetCustomState` **bTgni**
  (`pop ResetSenha.var_qualusuario_` = linha) + `ShowElement` **bTgnj**.
  **WF bTgpl** (Confirmar): 1. `SetTemporaryPassword` **bTgpn**; 2. `ChangeThing` **bTgpr** grava
  `PassTexto` = senha em texto puro; 3. `SendEmail` **bTgps** `SÓ SE` o toggle de credenciais estiver ligado,
  para o `EmailContato`, com **cco para o próprio usuário logado**; 4. `HideElement` **bTgpt**;
  5. `ResetGroup` **bTgpx**. Fechar: **WF bTgpU** (`Icon D`) e **WF bTgpb** (botão Cancela), ambos `HideElement`.
- Em `tool.Cabecalho`: **WF bTfQL** (botão Confirmar do `pop alerta geral`, condição
  `var_tipoalerta_ = resetar_senha`): 1. `SetTemporaryPassword` **bTfQQ**; 2. `ChangeThing` **bTfQR**
  (`PassTexto`); 3. `SendEmail` **bTfQV** `SÓ SE` o checkbox, para o **e-mail de login** do usuário, com
  cópia (cc) para quem está logado; 4. `HideElement` **bTfQW**; 5. `ResetGroup` **bTfQX**.
  Fechar: **WF bTIps** (`Icon S`) e **WF bTIpz** (botão Cancela), ambos `HideElement` **bTIpx**/**bTIqE**.
  Nada neste reusable **abre** `pop alerta geral` nem escreve `var_tipoalerta_`/`var_qualusuario_`:
  quem aciona são as páginas hospedeiras ([DÚVIDA 1]).

**Fixar usuário no computador:**
- **WF bTkSk** (clique no `Icon B` da lista): `SetCustomState` **bTkSx** (`pop FixarUsuario.var_qualusuario_`)
  + `ShowElement` **bTkTB**.
- **WF bTkSX** (botão "Fixar Usuário"): 1. ação de plugin **bTkSZ** (limpa/prepara o `LocalStorage B`);
  2. ação **bTkSd** grava no `localStorage` do navegador as chaves `nome|email|senha` com
  **primeiro nome, e-mail de login e `PassTexto` (senha em texto puro)**; 3. toast **bTkSe**
  "Usuário gravado neste computador"; 4. `HideElement` **bTkSj**.
- **WF bTkTC** (botão Cancela) → `HideElement` **bTkTI**.
- **WF bTgno** — mesma gravação de `nome|email|senha` a partir da linha da tabela, mas com
  `workflow_disabled = True`: **código morto** (§8.1).
- A página `index` (WF bTfNP/bTfRk) lê exatamente essas chaves e faz `LogIn` com a senha armazenada:
  é assim que o "fixar" funciona — e é por isso que a senha precisa estar em texto puro no banco (§7).

**Trocar o e-mail de login:**
- **WF bTkuy** (clique no `Icon N`, ao lado do e-mail de login): `ShowElement` **bTkvE** +
  `SetCustomState` **bTkvF** (`pop AlterarEmail.var_qualusuario_` = `Parent`, o usuário em edição).
- **WF bTkuH** (botão "Alterar Email"): 1. `ChangeEmailForAnotherUser` **bTkuN** com o novo e-mail digitado;
  2. `ResetInputs` **bTkut**; 3. `HideElement` **bTkux**. Sem checar duplicidade nem formato além do
  `content_format: email`; o aviso lembra que um usuário "fixado" precisa ser fixado de novo.
- Fechar: **WF bTkvJ** (botão Cancela) e **WF bTkvQ** (`Icon O`), ambos `HideElement` **bTkvP**/**bTkvW**.

### 4.17 Carteira de clientes do usuário

- **WF bTkMS** (clique no `Icon F`, carteira): `ShowElement` **bTkMY** + `DisplayGroupData` **bTkMZ**
  (`pop carteira` ← usuário da linha). Ordem invertida (mostra antes de ter dado) — inofensivo, mas §8.3.
- **WF bTkZP** (clique na seta `≫` da lista da esquerda): `ChangeThing` **bTkZV** no cliente:
  `QualCarteira = usuário do popup`. Transfere o cliente de uma carteira para outra **sem confirmação e sem
  histórico** de quem transferiu.
- **WF bTkLo** (clique no `×` da carteira): `ChangeThing` **bTkLt**: `QualCarteira = vazio`.
- **WF bTkVL** (`Icon H`) → `ResetGroup` **bTkVR**: limpa a busca por nome de cliente.
- **WF bTkYj** (`Icon K`) → `ResetGroup` **bTkYp**: limpa o filtro "Carteira atual".
- **WF bTkVr** (`Icon I`) → `HideElement` **bTkVx**: fecha o `pop carteira`.
- Observação: `User.CarteiraClientes` (lista no usuário) existe no data type e **não é atualizado** por estes
  workflows — a verdade é o `QualCarteira` do cliente (§8.2).

### 4.18 Documentos do usuário

- **WF bTkMq** (clique no `Icon A`, `note_add`): `ShowElement` **bTkNh** no `pop.AnexosClifor` +
  `SetCustomState` **bTkOJ** definindo `var_tipoanexo_ = Opt.TipoAnexo.Contracheque` e
  `var_qualusuario_ = usuário da linha`. O tipo já entra fixo em "Contracheque", embora `Opt.TipoAnexo` tenha
  12 tipos marcados como `QualCadastro = "Usuário"` (RG, CPF, contratos, exames, PIS, conta bancária...).
  O detalhe do popup de anexos está fora do escopo desta spec.

---

## 5. Cálculos e valores

Praticamente não há cálculo nestes reusables — o que existe é contador e comparação:

| Valor | Como é obtido hoje | Observação |
|---|---|---|
| Alerta "clientes sem interação" | `count(GrupoCliFor onde QualCarteira = CurrentUser e UltimoHistoricoData ≤ hoje − 15 dias) ≥ 1` | limite 15 dias fixo no código |
| Ordem do novo nível de vendedor | `max(NiveisVendedores.Ordem) + 1` no navegador (WF bTqBD) | corrida entre dois cliques simultâneos |
| Meta / comissões do nível | `MetaVenda` (moeda), `ComissaoPadrao` e `ComissaoMetaBatida` (percentuais com 3 casas), `QtdMetaBatida` (inteiro) | são **dinheiro e percentual**: `numeric`, com teste (regra 10 do CLAUDE.md) |
| Contador de recibos | `ConfigSistema[17].ValorNumero`, editado à mão no popup e incrementado pela página `financeiro` | numeração de documento no navegador |
| Contador de e-mails do dia | `ConfigSistema[19].ValorNumero`, zerado todo dia 00:00 pelo backend `ResetContagemEmails` | o próprio backend se reagenda |
| Expiração do token Google | `ValorDataHora2 = agora + expires_in` (backend `RefreshTokenGoogle`) | o backend se reagenda para a data de expiração |
| Data/hora dos e-mails do Gmail | `internalDate / 1000` em segundos sobre uma base fixa, `− 3 h` | fuso somado à mão em vez de `America/Sao_Paulo` |
| Contagens das tabelas de carteira | `get_list_data:count` das próprias tabelas | contagem no cliente |
| E-mail de login sugerido | nome sem acento → espaços viram `.` → minúsculo → `@` domínio corporativo | sem checar duplicidade |
| Férias | início 00:00:00, fim 23:59:59 (na criação, fim 00:00:00) e `FeriasPeriod` como intervalo | três campos para o mesmo dado |

---

## 6. Integrações e backend workflows

| Item | Onde é usado | O que faz |
|---|---|---|
| **App Connector "GestaoLure"** (`bTlZL0`, auth `private_key_header`) | `tool.MenuPaginas` WF bTkoJ2 e a tabela `rpg listabugs` | `CriarCartao` (POST `/wf/MegaBoxBugReport`) cria o cartão de bug em outro app Bubble; `GetCartoes` lista os cartões, comentários e anexos. A chave privada fica na configuração do API Connector do Bubble. |
| **API `LeituraGmail`** (`bUCHx`) | bloco "Emails e respostas" do `pop.ConfigSistema` | `ListarMail` (GET `users/me/messages`, parâmetros `q` e `maxResults`), `LerMail` (GET `messages/{id}`), `AbrirAnexo`, `ObterToken2` e `RefreshToken2` (POST `oauth2.googleapis.com/token` com `client_id`, `client_secret`, `refresh_token`). Escopo pedido: `gmail.readonly`. |
| **OAuth Google** | WF bUCGT (nova aba) e bUCRu (popup via JavaScript) | leva o usuário ao consentimento e volta com `code`; a troca do `code` por tokens acontece na página `loginrealizado` (fora desta spec) e grava na linha `ConfigSistema[21]`. |
| **Backend `RefreshTokenGoogle` (bUCKC)** | agendado por si mesmo | chama `RefreshToken2` com o refresh token da linha 21, grava novo `access_token`, `ValorDataHora1 = agora`, `ValorNumero = expires_in`, `ValorDataHora2 = agora + expires_in`, e se reagenda para a expiração. |
| **Backend `ResetContagemEmails` (bUBmh)** (`expose=False`) | agendado por WF bUBoF e por si mesmo | zera `ConfigSistema[19].ValorNumero` e se reagenda para o dia seguinte 00:00. |
| **Backend `AtribuirVendedorSubstituto` (bUBpN)** (`expose=False`) | agendado por WF bTgmZ (passo bUBpV) | parâmetros `Vendedor`, `Substituto`, `DataInicio`, `DataFim`; `ChangeListOfThings` em `Tbl.Entregas` com `DataEntrega` no período e `QualVendedor = Vendedor`, setando `QualVendedorSubstituto`. |
| **Backend `EnviarEmailUsuario` (bTiKu0)** | — | **vazio**, sem ações e sem quem chame (§8.1). |
| **Backend `BugReport` (bTkso2)** | — | **vazio** (o bug report real vai pelo App Connector). |
| **E-mail transacional** | `SendEmail` em bTgml, bTgpl, bTfQL | envio pelo motor do Bubble (o app usa SendGrid, conforme `integracoes.md`), remetente "Sistema MegaBox". Existe ainda `Opt.Smtp.GmailMegabox` com credenciais de SMTP próprio, ligado ao toggle `ValorBoolean1` da linha 19. |
| **Plugins relevantes** | 1617739938396 (LocalStorage — fixar usuário), 1680110374647 (toggle/switch), 1609444246883 (máscara de input), 1695154888178 (remover acentos), 1658328157117 (toast), 1498171554228 (tooltip), 1488796042609 (JavaScript), 1642683387367 (scrollbar), select2 (multi-dropdown) | — |

O app tem **Data API e Workflow API expostas** (`integracoes.md`).

---

## 7. Segurança e privacidade

Esta é a seção que mais importa: estes reusables concentram autenticação, autorização e segredos, e hoje
**tudo roda no navegador, sobre um banco aberto**.

### 7.1 Campos sensíveis que estão no banco do Bubble

| Tabela / campo | O que guarda | Situação |
|---|---|---|
| `User.PassTexto` (`cpo_passtexto_text`) | **senha do usuário em texto puro** — gravada em bTgml (criação), bTgpl e bTfQL (reset) e lida para "fixar usuário" | pior problema do app. Precisa desaparecer: no Supabase a senha é hash gerido pelo Auth e não existe campo equivalente |
| `ConfigSistema[21].ValorTexto1` | **access token** do Google | exibido em tela para Diretor |
| `ConfigSistema[21].ValorTexto2` | **refresh token** do Google (não expira) | exibido em tela para Diretor |
| `Opt.Smtp.GmailMegabox` (atributos `user`, `senha`, `smtp`, `porta`, `security`) | conta e **senha de app do Gmail** num **option set** | option set inteiro vai para o navegador de qualquer visitante — **segredo exposto no banco do Bubble: rotacionar no corte** |
| `client_id` do OAuth Google | escrito dentro dos workflows bUCGT e bUCRu | não é segredo por definição, mas fixa o app no código; `client_secret` fica na configuração do API Connector |
| Chave do App Connector "GestaoLure" | `private_key_header` | fica no Bubble; precisa virar variável de ambiente no app novo |
| `User.Cpf`, `Rg`, `Endereço`, `Cidade`, `Telefone`, `Foto`, `ContatosPessoais` | dados pessoais (LGPD) | ver 7.2 |
| `ConfigSistema` grupo "Cópia de emails" e `User.CopiaProposta/CopiaPedido/CopiaCancelamentos` | endereços que recebem cópia oculta de documentos comerciais | quem editar redireciona cópia de proposta/pedido para fora da empresa |
| Documentos do usuário (`Tbl.Anexos`, tipos Contracheque, RG, CPF, PIS, exames, conta bancária) | arquivos pessoais e trabalhistas | arquivos do Bubble ficam com URL pública e permanente no CDN |

### 7.2 O que vai para o navegador hoje

1. **`User` é público.** A regra de privacidade `everyone` do data type `User` tem `view_all: true`,
   `search_for: true` e `view_attachments: true`, e o app expõe a Data API. Ou seja: **qualquer pessoa, mesmo
   deslogada**, consegue listar todos os usuários com nome, e-mail, CPF, RG, endereço, telefone, perfil,
   departamento, férias **e `PassTexto`**. Isso é comprometimento total do sistema.
2. **`Tbl.ConfigSistema` é público** (`everyone` com `view_all`/`search_for`), o que inclui os
   **tokens do Google** e a matriz de permissões. Além disso a regra `autobinding` dá `auto_binding: true`
   a **qualquer usuário logado** nos campos `cpo_quaisdeptos_...`, `cpo_quaisperfis_...`,
   `cpo_quaisusuarios_...`, `cpo_nomeconfig_text` e `cpo_bolean_boolean` — qualquer um pode **se dar acesso a
   qualquer página** editando a própria linha de permissão, sem nem abrir o popup.
3. **`Tbl.NiveisVendedores` é público** e tem `auto_binding` liberado para qualquer logado nos campos de
   meta e comissão — qualquer pessoa pode mudar a própria comissão.
4. **Senha no `localStorage`.** "Fixar usuário" grava `nome|email|senha` em texto puro no navegador
   (WF bTkSX) e a página de login autentica com isso (pagina-index WF bTfRk). Quem usar aquele computador
   entra como o usuário fixado, e o logout não limpa o armazenamento.
5. **Senha por e-mail.** bTgml, bTgpl e bTfQL mandam a senha temporária por e-mail em texto puro, com
   cópia/cco para quem disparou o reset.
6. **Permissão é cosmética.** Todo o controle de menu é `link_disabled` / `button_disabled` no cliente.
   Digitar a URL abre a página; a Data API ignora a tela. As páginas não checam sessão — só `tool.Cabecalho`
   derruba quem está `Ativo = false`.
7. **Escalada de privilégio trivial.** `pop.CadastroUsuarios` deixa criar usuário com perfil **Diretor**,
   trocar o perfil de qualquer um, inativar qualquer um e trocar e-mail de login, sem nenhuma verificação
   de servidor. A condicional que "protege" a edição tem uma exceção com **nome de pessoa fixo no código**.
8. **Nenhum log.** Não existe trilha de quem mudou permissão, quem resetou senha, quem inativou usuário,
   quem transferiu carteira ou quem alterou meta/comissão.
9. **Dados do Gmail na tela.** O bloco de respostas lista mensagens da caixa corporativa (remetente,
   destinatários, assunto, corpo em HTML) para quem abrir o `pop.ConfigSistema`; só o bloco de tokens é
   restrito a Diretor.

### 7.3 O que a spec exige do app novo

- Autenticação exclusivamente pelo Supabase Auth; **nenhum campo de senha** na tabela de perfil.
  Substituir "fixar usuário" por sessão persistente legítima (cookie de refresh do Supabase) ou magic link —
  nunca senha em `localStorage` ([DÚVIDA 5]).
- Autorização no **servidor**: toda página protegida por checagem no layout/middleware e toda escrita por
  server action que valida o perfil; RLS em todas as tabelas usando a função de permissão (§9.4).
- Quem pode administrar usuário, permissão e configuração precisa ser um papel explícito, não uma condicional
  de ícone. Atribuir perfil igual ou superior ao próprio deve ser proibido.
- Segredos (SMTP, client secret do Google, chave do GestaoLure) em `.env`/variáveis da Vercel; a tabela de
  configuração guarda **referência**, nunca valor. Tokens OAuth em tabela própria, sem `select` para o
  cliente, e nunca renderizados na tela.
- **Rotacionar no corte:** senha de app do Gmail (`Opt.Smtp.GmailMegabox`), refresh token do Google,
  chave do App Connector, e **forçar redefinição de senha de todos os usuários** (as senhas atuais estão
  legíveis no banco do Bubble).
- Documentos pessoais em Storage privado com URL assinada e política por perfil.
- Log de auditoria (quem, quando, o quê) para permissão, perfil, ativação, reset de senha, carteira e
  meta/comissão.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto

- `tool.Cabecalho`: estados `var_colorhex_`, `var_numberpadding_` e `var_qualsubmenu_` nunca lidos nem escritos;
  HTML `Redutor Toggles` oculto; `pop.AgendaContatos A` e `pop.AgendaEnderecos A` embutidos sem gatilho;
  `pop alerta geral` sem nada que o abra dentro do reusable.
- `tool.MenuPaginas`: `minus_element(Opt.MenuPaginas.configura__es)` sobre uma opção que não existe mais;
  itens "Relatórios" e "Suporte de Vendas & Nps" sem `ordem`; colunas `Text E`, `Text H`, `Text U`
  (textos vazios) na tabela de bugs.
- `tool.MenuConfig`: **duas** instâncias do mesmo `pop.CadastroCliFor` (bTjxk e bTgyf), nenhuma aberta por
  workflow; `TableCrossAxis` bTghJ oculta.
- `pop.ConfigSistema`: grupos com `group_type="user"` sem fonte; botão "Login Aba" (bUCGN) oculto ao carregar,
  mas com workflow ativo (bUCGT).
- `pop.ConfigUsuario`: três condicionais sobre `UsaEmailPessoal - deleted` e `SmtpEndereco - deleted`
  (campos excluídos do data type) — nunca disparam.
- `pop.CadastroUsuarios`: **WF bTgno** com `workflow_disabled = True` (duplicata de bTkSX);
  **WF bTkQn0** sem nenhuma ação; `Opt.tipoalerta` não aparece em `option-sets.md` ([DÚVIDA 1]).
- Backends `EnviarEmailUsuario` (bTiKu0) e `BugReport` (bTkso2) sem ações.
- Campos do `User` já excluídos e ainda referenciados: `SmtpEndereco`, `SmtpPorta`, `SmtpSenha`,
  `StmpLogin`, `UsaEmailPessoal`.
- `Tbl.PerfilUsuario` (1 campo, só aponta para o option set) — tabela sem uso aparente.

### 8.2 Duplicação

- **Toggle em dois workflows** (bTIWB/bTIWw e bTeAp/bTeAw): um `ToggleElement`/um estado resolvem.
- **Reset de senha implementado duas vezes**: `tool.Cabecalho` bTfQL (envia para `email`, cc para quem
  disparou) e `pop.CadastroUsuarios` bTgpl (envia para `EmailContato`, cco para quem disparou). Textos,
  destinatários e tipo de cópia diferentes para a mesma operação.
- **Gravação no `localStorage` duas vezes**: bTkSX (ativo) e bTgno (desativado).
- **Seis workflows quase iguais** em `tool.MenuConfig`, um por item do submenu, variando só o alvo.
- **Três tabelas de permissão** (`acessomodulos`, `acessoconfig`, `copiaemails`) com a mesma estrutura de
  colunas e o mesmo multi-select "Quais usuários" repetido três vezes com a mesma busca.
- **Duas representações de cada relação:** `User.QualNivelVendedor` × `NiveisVendedores.QuaisVendedores`;
  `GrupoCliFor.QualCarteira` × `User.CarteiraClientes`; `User.Foto`/nome repetidos em toda tabela.
  Só um lado é mantido pelos workflows — o outro apodrece.
- **Férias em três campos** (`FeriasInicio`, `FeriasFim`, `FeriasPeriod`).
- **E-mail em três campos** (`email` do Bubble, `EmailLoginTexto` e `EmailContato`), com `EmailLoginTexto`
  gravado só na criação e nunca atualizado por `ChangeEmailForAnotherUser` — fica **desatualizado** depois de
  uma troca de e-mail.
- Nomes de elemento repetidos dentro do mesmo reusable (`gp toggle rpgemails` aparece 5 vezes em
  `pop.ConfigSistema`; `Icon B`, `Button C`, `Button fixar usuário`, `g Input` em `pop.CadastroUsuarios`),
  o que torna o mapa e a manutenção ambíguos.

### 8.3 Gambiarras e prováveis bugs

1. **Permissão no option set + na tabela.** `Opt.MenuPaginas.hierarquia`/`DepartamentosAcessiveis` e
   `Opt.MenuConfig.Hierarquia`/`perfilmenorigual` descrevem uma regra que ninguém aplica; a regra real está
   em linhas de `Tbl.ConfigSistema` encontradas por **texto literal** (`NomeConfig = "Permissões de acesso às
   páginas"`) — qualquer acento ou espaço trocado quebra a tabela em silêncio.
2. **Linhas de configuração por número mágico** (`CodigoConfig = 17 / 19 / 21`).
3. **Inputs dos níveis de vendedor com `content` errado**: as cinco colunas mostram `NomeNivel` em vez do
   valor do próprio campo; só o `bind_field` está certo.
4. **`ScheduleAPIEvent` sem condição** em bUBoF: agenda a contagem diária mesmo ao **desligar** o toggle.
5. **Substituto de férias só é aplicado na edição** (bTgmZ), nunca na criação (bTgml).
6. **`FeriasFim` gravado com 00:00:00 na criação** e 23:59:59 na edição.
7. **Contatos pessoais**: bTkdD e bTkeF usam atribuição em vez de acrescentar/remover da lista ([DÚVIDA 3]).
8. **`SÓ SE` sempre verdadeiro** em bTgms (`UsaEmailPessoal - deleted is false` sobre campo excluído).
9. **Condicional com nome de pessoa fixo** ("gabriella mesquita de sousa") liberando a edição de usuários.
10. **Abrir `pop.CadastroUsuarios` a partir do nível (bTqCz/bTqnx) sem dizer qual usuário** — abre a lista
    inteira, sem filtro pelo nível clicado.
11. **`DisplayGroupData` depois do `ShowElement`** em bTkMS (popup aparece antes do dado).
12. **Data do Gmail com `−3 h` somado à mão** em vez de fuso.
13. **`ChangeThing` no cliente sem transação** na transferência de carteira (bTkZP/bTkLo).
14. **`Ordem = max + 1` calculado no navegador** (bTqBD).
15. **Logo/fundo do cabeçalho decididos por `Website Home contains "test"`** — ambiente inferido da URL,
    com três condicionais concorrentes na mesma imagem.
16. **Domínio de e-mail corporativo fixo** na condicional do input de login.
17. **Limite de 15 dias** do alerta de histórico fixo no código.

### 8.4 Otimizações para o app novo

- **A liberação de menu por option set no navegador tem de virar autorização no servidor.**
  Uma tabela `paginas` (slug, rótulo, ordem, ícone) + `permissoes_pagina` (página × perfil/departamento/usuário)
  no Postgres; o servidor monta o menu **já filtrado** (sem item cinza) e a mesma função decide se a rota
  pode ser aberta e se a RLS libera a tabela. O cliente nunca recebe a matriz de permissão inteira.
- **Segredo tem de sair da tabela e ir para variável de ambiente.** `config_sistema` fica só com parâmetros
  de negócio (contadores, cópias ocultas, flags); SMTP, client secret e chave de parceiro em `.env`;
  tokens OAuth numa tabela `integracao_tokens` sem `select` para o cliente.
- **Option sets viram tabelas**: `perfis` (com `hierarquia`), `departamentos`, `paginas`, `itens_config`.
  `Opt.UFs` pode virar `char(2)` com `check`. Continuar tratando perfil/departamento como constante do código
  impede que a regra vá para a RLS.
- **Um formulário de permissão só**: a mesma tela edita páginas e itens de configuração, porque a estrutura é
  idêntica — só muda o alvo.
- **Auto-binding vira formulário com salvar explícito** (server action + validação zod + revalidate), porque
  hoje cada tecla é uma escrita no banco de produção e não existe cancelar.
- **Trocar as três listas (`QuaisDeptos`/`QuaisPerfis`/`QuaisUsuarios`) por linhas** numa tabela de ligação —
  listas dentro do registro forçam ler o registro inteiro para saber se alguém tem acesso.
- **Carteira**: uma FK `carteira_usuario_id` em `clientes` (índice), sem lista espelhada no usuário, com
  log de transferência.
- **Contatos pessoais**: tabela `usuario_contatos` (nome, telefone), não uma lista de strings `nome;telefone`.
- **Férias**: uma coluna `daterange` (ou duas `date` com `check`), não três campos.
- **Contadores** (recibo, e-mails do dia) viram `sequence` e `count(*)` sobre o log de envio.
- **Níveis de vendedor**: `numeric(14,2)` para meta e `numeric(6,3)` para percentuais, com teste (regra 10).
- **Menu montado no servidor** elimina as 3 buscas × 7 itens (+ 3 × 6 do submenu) que hoje rodam em cada
  carregamento de cada página.
- **Alerta de "clientes sem interação"**: view/consulta com o limite de dias em configuração, não fixo.
- **Auditoria**: tabela `auditoria` alimentada por trigger nas mudanças de perfil, permissão, ativação,
  carteira e valores de nível.

---

## 9. Proposta para o app novo

### 9.1 Layout e rotas

- `app/(app)/layout.tsx` — **shell** do app: Server Component que carrega a sessão, o perfil do usuário
  (`fn_meu_perfil`) e o menu já filtrado (`fn_menu_do_usuario`). Redireciona para `/login` se não há sessão e
  se o usuário está inativo (substitui bTKRG, agora no servidor). Renderiza `<AppHeader>`, `<SideMenu>` e o
  conteúdo. Cada página protegida também confere a permissão (defesa em profundidade), porque o layout não é
  garantia em todas as navegações.
- Rotas do shell e da configuração:
  | Rota | Conteúdo |
  |---|---|
  | `/inicio`, `/vendas`, `/financeiro`, `/metas`, `/relatorios`, `/rotinas`, `/sac` | módulos, com os mesmos slugs de hoje (links antigos continuam funcionando) |
  | `/config/perfil` | preferências do próprio usuário (ex-`pop.ConfigUsuario`) |
  | `/admin/usuarios` | lista de usuários (ex-modo lista do `pop.CadastroUsuarios`) |
  | `/admin/usuarios/novo` e `/admin/usuarios/[id]` | formulário de criação/edição |
  | `/admin/usuarios/[id]/carteira` | carteira de clientes |
  | `/admin/usuarios/[id]/documentos` | documentos do usuário |
  | `/admin/configuracoes` | configuração do sistema, com abas: Permissões de página · Permissões de configuração · Níveis de vendedor · Cópia de e-mails · Contadores · Integrações |
  | `/admin/bugs` | comunicar bug e lista (mantendo a integração atual) |
- Manter os popups como *dialogs* onde faz sentido (carteira, reset de senha, alterar e-mail), mas com URL
  própria para poder linkar e para o servidor validar.

### 9.2 Componentes

- `AppHeader` — logo (com selo de ambiente vindo de variável, não da URL), nome/foto/perfil, `ConfigMenu`,
  botão do painel de histórico, sino de "clientes sem interação" (contagem vinda do servidor).
- `SideMenu` — recebe a lista já filtrada; marca a rota atual; sem item desabilitado.
- `ConfigMenu` — dropdown com os itens de configuração permitidos.
- `BugReportDialog` + `BugList`.
- `UsuariosTable` (filtros nome/departamento/perfil/situação, switch de ativo com confirmação),
  `UsuarioForm` (dados, acesso, férias/substituto, contatos), `CarteiraTransfer` (duas listas + busca),
  `ResetSenhaDialog`, `AlterarEmailDialog`, `DocumentosUsuario`.
- `PermissoesMatrix` (uma tela para páginas e outra para itens de configuração, mesmo componente),
  `NiveisVendedorTable` (edição com salvar explícito), `CopiaEmailsTable`, `ContadoresForm`,
  `IntegracoesPanel` (status do token do Google: conectado/expira em — **nunca o valor do token**).
- `MinhasPreferenciasForm` (dados pessoais, página inicial restrita às páginas permitidas, e-mails de cópia
  com validação de lista de endereços).

### 9.3 Server actions

| Ação | Regra |
|---|---|
| `criarUsuario(dados)` | exige permissão `usuarios.criar`; valida nome, CPF, e-mail único; **proíbe atribuir perfil de hierarquia menor que a do autor**; cria em `auth.users` via Admin API com senha aleatória; cria `perfis_usuario`; dispara convite/redefinição de senha por e-mail (nunca envia senha em texto) |
| `atualizarUsuario(id, dados)` | mesma checagem de hierarquia; não permite editar o próprio perfil/departamento; registra auditoria |
| `definirSituacaoUsuario(id, ativo)` | exige permissão; revoga as sessões do usuário ao inativar; auditoria |
| `definirPerfilEDepartamento(id, perfil, depto)` | ação separada e auditada (é escalada de privilégio) |
| `definirNivelVendedor(id, nivelId)` | exige permissão de metas |
| `definirFeriasESubstituto(id, inicio, fim, substitutoId)` | valida `fim > inicio`, substituto ativo e fora de Financeiro/Operação; reatribui as entregas do período em **uma transação** (substitui o backend bUBpN) |
| `resetarSenha(id)` | só perfil autorizado; usa o fluxo de recuperação do Supabase (link com expiração); nunca grava nem envia senha |
| `alterarEmailLogin(id, novoEmail)` | valida unicidade; usa a Admin API; auditoria |
| `transferirCarteira({clienteIds, deUsuarioId, paraUsuarioId})` | transação + log; valida que o destino é vendedor ativo |
| `salvarContatoUsuario` / `removerContatoUsuario` | linhas em `usuario_contatos` |
| `salvarPermissoesPagina(paginaId, {deptos, perfis, usuarios})` | **só administrador**; auditoria obrigatória; impede remover a própria permissão de administrar |
| `salvarPermissoesConfig(itemId, …)` | idem |
| `salvarNivelVendedor(id, {nome, meta, comissaoPadrao, comissaoMetaBatida, qtdMetaBatida, ordem})` | valores `numeric`, teste obrigatório; `ordem` via sequence/transação |
| `salvarCopiaEmails(configId, usuarioIds)` | valida endereços |
| `salvarPreferenciasUsuario(dados)` | só sobre o próprio registro; página inicial limitada às páginas permitidas |
| `salvarContadores({recibos})` | auditado (numeração de documento fiscal) |
| `conectarGoogle()` / `desconectarGoogle()` | troca o `code`, grava em `integracao_tokens` (sem `select` para o cliente); a renovação vira cron da Vercel |
| `enviarBugReport(dados)` | chama o parceiro com a chave vinda do ambiente |

### 9.4 SQL

```sql
-- perfil ligado a auth.users
create table public.usuarios (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome          text not null,
  email_contato citext not null,
  perfil_id     smallint not null references public.perfis(id),
  departamento_id smallint not null references public.departamentos(id),
  nivel_vendedor_id uuid references public.niveis_vendedor(id),
  ativo         boolean not null default true,
  foto_path     text,
  cpf           text, rg text, endereco text, cidade text, uf char(2),
  telefone      text,
  pagina_inicial_id smallint references public.paginas(id),
  ferias        daterange,
  substituto_id uuid references public.usuarios(id),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
-- sem nenhuma coluna de senha: a autenticação é do Supabase Auth

create table public.perfis (        -- ex-Opt.PerfilUsuario
  id smallint primary key, slug text unique not null,
  nome text not null, hierarquia smallint not null
);
create table public.departamentos ( -- ex-Opt.DeptoUsuario
  id smallint primary key, slug text unique not null,
  nome text not null, descricao text
);
create table public.paginas (       -- ex-Opt.MenuPaginas
  id smallint primary key, slug text unique not null,
  rotulo text not null, rota text not null,
  ordem smallint not null, tipo text not null default 'pagina'  -- 'pagina' | 'config'
);

-- permissão por página/perfil (uma linha por concessão, não lista dentro do registro)
create table public.permissoes_pagina (
  pagina_id       smallint not null references public.paginas(id) on delete cascade,
  perfil_id       smallint references public.perfis(id) on delete cascade,
  departamento_id smallint references public.departamentos(id) on delete cascade,
  usuario_id      uuid     references public.usuarios(id) on delete cascade,
  constraint um_alvo check (num_nonnulls(perfil_id, departamento_id, usuario_id) = 1)
);
create unique index on public.permissoes_pagina (pagina_id, perfil_id) where perfil_id is not null;
create unique index on public.permissoes_pagina (pagina_id, departamento_id) where departamento_id is not null;
create unique index on public.permissoes_pagina (pagina_id, usuario_id) where usuario_id is not null;

-- função usada pelas políticas de RLS das demais tabelas
create or replace function public.tem_acesso_pagina(p_slug text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from public.usuarios u
      join public.paginas  p on p.slug = p_slug
      left join public.permissoes_pagina pp
             on pp.pagina_id = p.id
            and (pp.perfil_id = u.perfil_id
              or pp.departamento_id = u.departamento_id
              or pp.usuario_id = u.id)
     where u.id = auth.uid() and u.ativo and pp.pagina_id is not null
  );
$$;

create or replace function public.eh_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.usuarios u join public.perfis pf on pf.id = u.perfil_id
                  where u.id = auth.uid() and u.ativo and pf.hierarquia = 1);
$$;

-- exemplo de uso nas outras tabelas (regra 3 do CLAUDE.md)
alter table public.contas_receber enable row level security;
create policy cr_leitura on public.contas_receber for select
  to authenticated using (public.tem_acesso_pagina('financeiro'));

alter table public.usuarios enable row level security;
create policy usuarios_leitura_basica on public.usuarios for select
  to authenticated using (true);                      -- colunas sensíveis ficam numa view restrita
create policy usuarios_edita_proprio on public.usuarios for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid()
    and perfil_id = (select perfil_id from public.usuarios where id = auth.uid())
    and departamento_id = (select departamento_id from public.usuarios where id = auth.uid())
    and ativo = (select ativo from public.usuarios where id = auth.uid()));
create policy usuarios_admin on public.usuarios for all
  to authenticated using (public.eh_admin()) with check (public.eh_admin());

alter table public.permissoes_pagina enable row level security;
create policy permissoes_admin on public.permissoes_pagina for all
  to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- configuração do sistema SEM segredo
create table public.config_sistema (
  chave      text primary key,      -- 'contador_recibo', 'contagem_diaria_emails', 'smtp_proprio'
  valor      jsonb not null,
  descricao  text,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references public.usuarios(id)
);
comment on table public.config_sistema is
  'Só parâmetros de negócio. Chave de API, senha e token NUNCA entram aqui: .env / integracao_tokens.';

create table public.niveis_vendedor (
  id uuid primary key default gen_random_uuid(),
  nome text not null, ordem smallint not null unique,
  meta_venda            numeric(14,2) not null default 0,
  comissao_padrao       numeric(6,3)  not null default 0,
  comissao_meta_batida  numeric(6,3)  not null default 0,
  qtd_meta_batida       smallint      not null default 0
);

create table public.integracao_tokens (   -- sem select para o cliente
  provedor text primary key,
  access_token text, refresh_token text,
  obtido_em timestamptz, expira_em timestamptz
);
alter table public.integracao_tokens enable row level security;  -- nenhuma policy: só service_role

create table public.auditoria (
  id bigserial primary key, quando timestamptz not null default now(),
  quem uuid references public.usuarios(id), acao text not null,
  alvo_tabela text, alvo_id text, antes jsonb, depois jsonb
);

create sequence public.seq_recibo;
```

Índices: `usuarios(ativo)`, `usuarios(perfil_id)`, `usuarios(departamento_id)`,
`usuarios(nivel_vendedor_id)`, `permissoes_pagina(pagina_id)`, `clientes(carteira_usuario_id)`,
`auditoria(quando desc)`, `auditoria(alvo_tabela, alvo_id)`.

### 9.5 Tabelas envolvidas

`auth.users` (Supabase Auth), `usuarios`, `perfis`, `departamentos`, `paginas`, `permissoes_pagina`,
`niveis_vendedor`, `usuario_contatos`, `usuario_documentos` (+ Storage privado), `config_sistema`,
`config_copia_email` (config × usuários que recebem cópia), `integracao_tokens`, `auditoria`,
`clientes` (campo `carteira_usuario_id`), `entregas` (campo `vendedor_substituto_id`),
`bug_reports` (se a integração com o app parceiro for internalizada).

---

## 10. Dúvidas

1. **[DÚVIDA]** `Opt.tipoalerta` não aparece em `mapa/option-sets.md`, e nada dentro de `tool.Cabecalho` abre
   `pop alerta geral` nem escreve `var_tipoalerta_`/`var_qualusuario_`. Quem dispara esse reset de senha, e
   existe outro tipo de alerta além de `resetar_senha`?
   *Recomendação:* tratar como duplicata do reset de `pop.CadastroUsuarios` e **não reproduzir**; um único
   fluxo de redefinição de senha, no servidor.
2. **[DÚVIDA]** Qual é o conteúdo real das linhas de `Tbl.ConfigSistema` de permissão (quais departamentos,
   perfis e usuários hoje veem cada página e cada item de configuração)? O mapa traz a estrutura, não os dados.
   *Recomendação:* extrair essas linhas na carga e transformá-las em `permissoes_pagina`; revisar item a item
   com a Diretoria antes do corte, porque hoje qualquer logado pode ter alterado a matriz.
3. **[DÚVIDA]** Contatos pessoais: bTkdD (salvar contato de usuário existente) e bTkeF (lixeira) fazem
   atribuição na lista `ContatosPessoais`, o que sobrescreveria/deixaria só um item. É bug ou o mapa perdeu o
   operador `:plus_element` / `:minus_element`?
   *Recomendação:* implementar como acrescentar e remover linhas em `usuario_contatos`.
4. **[DÚVIDA]** A condicional que libera a edição de usuário para `NomeModelo = "gabriella mesquita de sousa"`
   é uma exceção permanente ou um remendo?
   *Recomendação:* virar permissão nomeada (`usuarios.editar`) concedida à pessoa, sem nome no código.
5. **[DÚVIDA]** "Fixar usuário neste computador" atende um caso real (máquina compartilhada de expedição/balcão
   sem o usuário saber a senha)? O que substitui isso?
   *Recomendação:* sessão persistente do Supabase no dispositivo + PIN por usuário, ou conta compartilhada de
   operação com perfil mínimo. **Nunca** senha em `localStorage`.
6. **[DÚVIDA]** Quem lê `User.QualPaginaInicial`? Nenhum workflow destes seis reusables usa o campo.
   *Recomendação:* usar como destino do redirecionamento pós-login, limitado às páginas permitidas; se a
   preferida não for permitida, cair em `/inicio`.
7. **[DÚVIDA]** O bloco "Emails e respostas (Gmail)" é usado no dia a dia ou foi experimento? Ele lê a caixa
   corporativa inteira dentro da tela de configuração.
   *Recomendação:* não migrar no corte; manter só o envio de e-mail pelo app. Se for necessário, tela própria
   com permissão específica e sem exibir token.
8. **[DÚVIDA]** O toggle "SMTP próprio" (`ConfigSistema[19].ValorBoolean1`) ainda tem efeito? O caminho de
   SMTP do usuário foi removido (campos `Smtp*` do `User` estão excluídos) e `Opt.Smtp` tem credencial única.
   *Recomendação:* eliminar a bifurcação; um provedor de e-mail configurado por ambiente.
9. **[DÚVIDA]** Contagem diária de e-mails (config 19): existe limite a respeitar (cota do provedor)? O app
   conta mas não bloqueia nada.
   *Recomendação:* substituir por `count(*)` sobre o log de envio e alertar ao se aproximar da cota contratada.
10. **[DÚVIDA]** O menu deve **esconder** o que o usuário não pode abrir, em vez de mostrar cinza?
    *Recomendação:* esconder (o menu cinza hoje revela a existência dos módulos e não impede o acesso por URL).
11. **[DÚVIDA]** Quem pode criar usuário e qual o perfil máximo que pode atribuir? Hoje não há regra.
    *Recomendação:* só hierarquia 1 (Diretor) cria e atribui perfil; ninguém atribui hierarquia menor ou igual
    à própria; Financeiro mantém só o acesso aos documentos do usuário.
12. **[DÚVIDA]** "Novo Nível" cria a linha vazia direto no banco (bTqBD). Deve virar formulário com validação
    (nome obrigatório, meta > 0)?
    *Recomendação:* sim — criar só após preencher, com `ordem` por sequence.
13. **[DÚVIDA]** A transferência de cliente entre carteiras precisa de histórico/motivo (hoje é um clique sem
    registro)?
    *Recomendação:* registrar em `auditoria` com data, quem transferiu, de quem para quem.
14. **[DÚVIDA]** O alerta de "clientes sem interação" usa 15 dias fixos. É a política oficial?
    *Recomendação:* parâmetro em `config_sistema` com default 15.
15. **[DÚVIDA]** A tabela `Tbl.PerfilUsuario` (um único campo apontando para o option set) tem algum uso vivo?
    *Recomendação:* descartar; `perfis` substitui.
16. **[DÚVIDA]** O bug report continua indo para o app parceiro "GestaoLure" depois da migração?
    *Recomendação:* manter a integração no corte (chave no `.env`) e reavaliar depois.
17. **[DÚVIDA]** Os itens "Relatórios" e "Suporte de Vendas & Nps" não têm `ordem` nem departamentos
    declarados. Qual a posição correta no menu?
    *Recomendação:* definir `ordem` explícita para todos os itens ao carregar `paginas`.

---

## 11. Cobertura — todos os 68 workflows

### `tool.Cabecalho` (9)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bTIWB | Clique `btn menu` (menu fechado) | `var_showmenu_ = true` | 4.1 |
| 2 | bTIWw | Clique `btn menu` (menu aberto) | `var_showmenu_ = false` | 4.1 |
| 3 | bTIps | Clique `Icon S` (`pop alerta geral`) | fecha o popup de confirmação | 4.16 |
| 4 | bTIpz | Clique `Button F` "Cancela" | fecha o popup de confirmação | 4.16 |
| 5 | bTKRG | `ConditionTrue` — `CurrentUser.Ativo is false` | `LogOut` + vai para `index` (única guarda de sessão) | 4.3 |
| 6 | bTeAp | Clique `btn show historicos` (fechado) | `var_showhistorico_ = true` | 4.2 |
| 7 | bTeAw | Clique `btn show historicos` (aberto) | `var_showhistorico_ = false` | 4.2 |
| 8 | bTenT | Clique `Icon Q` (`pop historico`) | fecha o histórico de conversas do cliente | 4.2 |
| 9 | bTfQL | Clique `Button L` "Confirmar" (tipo = resetar senha) | senha temporária, grava `PassTexto`, e-mail opcional com cc para quem disparou, fecha e reseta | 4.16 · 7 |

### `tool.MenuPaginas` (7)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 10 | bTeRd | Clique `Button A` "Logout" | `LogOut` + vai para `index` | 4.4 |
| 11 | bTlgp | Clique `Text V` (nome do anexo na lista de bugs) | abre o anexo em nova aba | 4.6 |
| 12 | bTkoJ2 | Clique `Button C` "Enviar" (bug) | cria o cartão no app parceiro, limpa o formulário, volta para a lista e a recarrega | 4.6 · 6 |
| 13 | bTkoV2 | Clique `Button D` "Novo Bug" | mostra o formulário, esconde a lista | 4.6 |
| 14 | bTkqF2 | Clique `Button bugreport` "Comunicar Bug" | abre o popup de bug | 4.6 |
| 15 | bTkqd2 | Clique `Button E` "Cancela" | reseta e esconde o formulário, mostra a lista | 4.6 |
| 16 | bTksb2 | Clique `Icon G` (olho) | abre o arquivo do input de anexo em nova aba | 4.6 |

### `tool.MenuConfig` (7)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 17 | bTghQ | Clique `btn submenu` = Cadastro Produtos | abre `pop.CadastroProdutos`, fecha o menu | 3.3 · 4.7 |
| 18 | bTgiF | Clique `Group A` (engrenagem) | abre/fecha o `GroupFocus` do submenu | 4.7 |
| 19 | bTgqz | Clique `btn submenu` = Cadastro Usuários | abre `pop.CadastroUsuarios`, fecha o menu | 3.3 · 4.7 |
| 20 | bTgyl | Clique `btn submenu` = Cliente / Fornecedor | fecha o menu e abre a página `cadastros` em nova aba | 3.3 · 4.7 |
| 21 | bThCh | Clique `btn submenu` = Configurações de Usuário | carrega `CurrentUser` no `pop.ConfigUsuario`, abre, fecha o menu | 3.3 · 4.7 · 4.8 |
| 22 | bTvIg | Clique `btn submenu` = FollowUp de Pedidos | fecha o menu e abre a página `historico` em nova aba | 3.3 · 4.7 |
| 23 | bToKP0 | Clique `btn submenu` = Configurações de Sistema | abre `pop.ConfigSistema`, fecha o menu | 3.3 · 4.7 |

### `pop.ConfigSistema` (14)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 24 | bToFx0 | Clique `Icon A` | fecha o popup de configuração | 4.9 |
| 25 | bToQt | Clique no cabeçalho "Acesso aos módulos" | abre/fecha a tabela de permissão de páginas | 4.9 |
| 26 | bToRe | Clique no cabeçalho "Acesso às configurações" | abre/fecha a tabela de permissão de configurações | 4.9 |
| 27 | bToRl | Clique no cabeçalho "Cópia oculta de emails" | abre/fecha a tabela de cópia de e-mails | 4.9 |
| 28 | bTqBD | Clique `Button A` "Novo Nível" | cria nível de vendedor com `Ordem = max + 1` | 4.9 · 5 |
| 29 | bTqBO | Clique no cabeçalho "Niveis de vendedor" | abre/fecha a tabela de níveis e o botão "Novo Nível" | 4.9 |
| 30 | bTqCz | Clique na foto de um vendedor do nível | abre `pop.CadastroUsuarios` (sem filtrar o usuário) | 4.9 · 8.3 |
| 31 | bTqnx | Clique `Icon K` (nível sem vendedores) | abre `pop.CadastroUsuarios` | 4.9 · 8.3 |
| 32 | bUBoF | Toggle "Fazer contagem diária" | grava `ValorBoolean2` (config 19) e agenda `ResetContagemEmails` para amanhã 00:00 | 4.9 · 6 |
| 33 | bUBoX | Toggle "SMTP próprio" | grava `ValorBoolean1` (config 19) | 4.9 |
| 34 | bUCGG | Clique no cabeçalho "Emails e respostas (Gmail)" | abre/fecha o bloco de e-mails | 4.9 |
| 35 | bUCGT | Clique `Button B` "Login Aba" | abre o consentimento OAuth do Google em nova aba | 4.9 · 6 · 7 |
| 36 | bUCJH | Clique `Button D` "Limpar Token" | zera access token, refresh token, datas e `expires_in` da config 21 | 4.9 · 7 |
| 37 | bUCRu | Clique `Button C` "Login Popup" | JavaScript abre o consentimento OAuth em janela 600×700 | 4.9 · 6 · 7 |

### `pop.ConfigUsuario` (1)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 38 | bThCK | Clique `Icon A` | fecha o popup (o resto da tela é auto-binding, sem workflow) | 4.8 |

### `pop.CadastroUsuarios` (30)

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 39 | bTgmD | Clique `btn novo usuario` | abre o formulário vazio (modo criação) | 4.11 |
| 40 | bTgmN | Clique `btn cancela novo usuario copy` | reseta e fecha o formulário | 4.12 |
| 41 | bTgmZ | Clique Gravar (formulário **com** dado) | atualiza o usuário e, se o toggle de férias estiver ligado, agenda `AtribuirVendedorSubstituto` | 4.12 · 4.15 |
| 42 | bTgml | Clique Gravar (formulário **sem** dado) | cria a conta, gera senha temporária, grava `PassTexto` e cópias ocultas, envia credenciais por e-mail | 4.11 · 7 |
| 43 | bTgnV | Clique `btn edita usuario` (lápis) | carrega o usuário no formulário e abre | 4.12 |
| 44 | bTgnd | Clique `btn reset senha` | guarda o usuário alvo e abre `pop ResetSenha` | 4.16 |
| 45 | bTgno | Clique `Icon B` — **workflow desativado** | gravaria nome/e-mail/senha no `localStorage` (duplicata de bTkSX) | 8.1 |
| 46 | bTgpU | Clique `Icon D` | fecha `pop ResetSenha` | 4.16 |
| 47 | bTgpb | Clique `Button C` "Cancela" | fecha `pop ResetSenha` | 4.16 |
| 48 | bTgpl | Clique `Button C` "Confirmar" | senha temporária, grava `PassTexto`, e-mail opcional com cco para quem disparou, fecha e reseta | 4.16 · 7 |
| 49 | bTgqn | Clique `Icon C` (fechar) | reseta o formulário e fecha o reusable inteiro | 4.12 |
| 50 | bTkLo | Clique `Icon E` (×, na carteira) | tira o cliente da carteira (`QualCarteira` vazio) | 4.17 |
| 51 | bTkMS | Clique `Icon F` (carteira) | abre `pop carteira` com o usuário da linha | 4.17 |
| 52 | bTkMq | Clique `Icon A` (documentos) | abre `pop.AnexosClifor` com tipo Contracheque e o usuário da linha | 4.18 |
| 53 | bTkSX | Clique "Fixar Usuário" | grava nome, e-mail e **senha em texto puro** no `localStorage`, avisa e fecha | 4.16 · 7 |
| 54 | bTkSk | Clique `Icon B` (fixar) | guarda o usuário alvo e abre `pop FixarUsuario` | 4.16 |
| 55 | bTkTC | Clique `Button D` "Cancela" | fecha `pop FixarUsuario` | 4.16 |
| 56 | bTkVL | Clique `Icon H` | limpa a busca por nome de cliente (lado carteira) | 4.17 |
| 57 | bTkVr | Clique `Icon I` | fecha `pop carteira` | 4.17 |
| 58 | bTkYj | Clique `Icon K` | limpa o filtro "Carteira atual" | 4.17 |
| 59 | bTkZP | Clique `Icon J` (seta ≫) | põe o cliente na carteira do usuário do popup | 4.17 |
| 60 | bTkcs | Clique salvar contato (usuário ainda não existe) | acrescenta `nome;telefone` ao estado `var_contatosusuario_` | 4.15 |
| 61 | bTkdD | Clique salvar contato (usuário existente) | grava `ContatosPessoais` (atribuição — possível bug) | 4.15 · 8.3 |
| 62 | bTkeF | Clique `Icon M` (lixeira do contato) | grava `ContatosPessoais` com o item clicado (possível bug) | 4.15 · 8.3 |
| 63 | bTkuH | Clique "Alterar Email" | `ChangeEmailForAnotherUser` com o novo e-mail, limpa e fecha | 4.16 |
| 64 | bTkuy | Clique `Icon N` (trocar e-mail) | abre `pop AlterarEmail` com o usuário em edição | 4.16 |
| 65 | bTkvJ | Clique `Button E` "Cancela" | fecha `pop AlterarEmail` | 4.16 |
| 66 | bTkvQ | Clique `Icon O` | fecha `pop AlterarEmail` | 4.16 |
| 67 | bTzWZ | Muda `Switch A` (coluna Ativo) | grava `Ativo` no usuário da linha, sem confirmação nem restrição | 4.13 · 7 |
| 68 | bTkQn0 | `InputChanged` em `ipt nome novo usuario` | **sem ações** (o e-mail de login é calculado por condicional) | 8.1 |
