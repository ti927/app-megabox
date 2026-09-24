# Spec funcional — Formulários públicos: avaliação de venda e NPS

Fonte: `mapa/pagina-formulariovenda.md` (Bubble `bUEGh0` — 42 elementos · 23 workflows · 25 ações · 49 condicionais ·
2 estados customizados · 0 popups · 1 repeating group) e `mapa/pagina-formularionps.md` (Bubble `bUDcp` — 29 elementos ·
12 workflows · 13 ações · 27 condicionais · 2 estados customizados · 0 popups · 1 repeating group).
Total desta spec: **35 workflows** (23 + 12).

Apoio: `mapa/data-types.md` (`Tbl.PesquisaRespostas` = `tbl_pesquisaposvenda`, `Tbl.PesquisaNps` = `tbl_pesquisanps`,
`Tbl.GrupoCliFor` = `tbl_clientes`), `mapa/option-sets.md` (`Opt.TipoPesquisa`, `Opt.Smtp`),
`mapa/backend-workflows.md` (`EnviarEmailsGeral` bTnvb0), `mapa/integracoes.md`,
e — só para saber quem manda o link — `mapa/pagina-vendas.md` (WF bTfPH, ações bUEjU/bUEoF; ação bUESz) e
`mapa/pagina-sac.md` (WF bUDcQ ação bUDcW; WF bUDcb ação bUDzn).

**Se esta spec e o mapa discordarem, o mapa manda.**

Correção de inventário: o enunciado do módulo falava em "1 popup" por página. Em `mapa/00-inventario.md` a coluna
com valor 1 é **Repeating groups**; Popups = 0 nas duas páginas. Nenhuma das duas tem popup.

Glossário:
- **Resposta** = registro de `Tbl.PesquisaRespostas` (`tbl_pesquisaposvenda`, 14 campos). É ao mesmo tempo o **convite**
  (criado sem notas, `Respondida` vazio) e a **resposta** (`Respondida = true`).
- **Pesquisa** = registro de `Tbl.PesquisaNps` (`tbl_pesquisanps`): só nome e lista de respostas. Serve de "campanha" de NPS.
- **Pós-venda** = `Opt.TipoPesquisa.Pós-Venda` (`p_s_venda`); **NPS** = `Opt.TipoPesquisa.NPS` (`nps`).
  O option set tem uma terceira opção, `SAC` (`sac`), que nenhuma das duas páginas grava.

---

## 1. Propósito e quem usa

As duas páginas são **do cliente final**, não do time. São abertas por link recebido por e-mail, **sem login**, em
`https://grupomegabox.bubbleapps.io/formulariovenda?...` e `.../formularionps?...`.

### 1.1 `formulariovenda` — avaliação pós-venda

Pesquisa de duas notas (atendimento e produto) mais comentário livre.
**Quem recebe e quando:** o contato de e-mail do cliente, no momento em que o vendedor **finaliza o pedido** na página
`vendas` (WF bTfPH, ação 5 = bUEjU). O e-mail "Seu pedido foi finalizado ✅ | Vamos programar as próximas entregas?"
vai com cópia para o vendedor e termina com "👉 Avalie nosso atendimento: …/formulariovenda?id=…&pdd…".
Existe um segundo caminho de finalização (ação bUESz, disparada só se `Switch C` estiver ligado) que manda o mesmo
corpo de e-mail com o link **sem** o trecho `&pdd` — ver 6.1.

### 1.2 `formularionps` — NPS

Pesquisa de **uma** nota (0–10) mais comentário livre.
**Quem recebe e quando:** o contato escolhido do cliente, quando alguém do SAC/Ouvidoria clica em "Enviar Email" na
linha da lista de respostas da pesquisa (página `sac`, WF bUDcb, ação bUDzn). O e-mail "Avaliação NPS - Megabox" leva
"👉 https://…/formularionps?id=<id da resposta>".
O registro de resposta **já existe** antes do envio: é criado no SAC ao adicionar o cliente à campanha
(WF bUDcQ, ação bUDcW: `QualCliente` + `QualPesquisa`, sem notas). O link é para **esse** registro.

### 1.3 Controle de acesso de fato

- **Página pública.** Não há workflow de carregamento (`PageLoaded`) em nenhuma das duas, logo não há checagem de
  usuário, de token, de validade nem de "já respondeu". Nenhum elemento depende de `CurrentUser`.
- **O que identifica o respondente:** só o parâmetro `id` da URL, que é um **_id de registro do Bubble**:
  - `formulariovenda`: `UrlParam("id" as custom.tbl_clientes)` → identifica o **cliente** (`Tbl.GrupoCliFor`), não o pedido.
  - `formularionps`: `UrlParam("id" as custom.tbl_pesquisaposvenda)` → identifica a **resposta/convite**.
- **O que impede alguém de responder pelos outros: nada.** O id não é secreto (o app expõe a Data API —
  `integracoes.md`: "expõe Data API: True"), não expira, não é de uso único e não é conferido contra nenhum segredo.
  Trocar o `id` na barra de endereço basta para gravar uma resposta em nome de outro cliente. Ver seção 7.
- **Não há identificação do respondente-pessoa**: nem nome, nem e-mail, nem qual contato do cliente respondeu.
  O que fica gravado é o cliente (pós-venda) ou o convite (NPS).

---

## 2. Estrutura da tela

### 2.1 Layout — `formulariovenda`

De fora para dentro (árvore do mapa):

1. **`Group A` (bUEHj0)** — fundo da página inteira. `group_type = custom.tbl_postagens`,
   `data_source = Search(custom.tbl_postagens):first_element`, imagem de fundo (foto hospedada no CDN do Bubble).
   `custom.tbl_postagens` **não existe** em `data-types.md`: é busca morta (ver 8.1).
2. **`Group A` (bUEHX0)** — o formulário. Condicional única: `quando El[Group A]:is_visible → is_visible = False`
   (esconder o formulário quando o grupo de agradecimento aparecer — ver 4.9 e [DÚVIDA 5]).
   - **`Text A` (bUEHT0)** — "Olá! / Sua opinião é muito importante para nós!".
   - **`Group A` (bUEHS0)** — `group_type = custom.tbl_contatos`, **sem data source**. Tipo também inexistente em
     `data-types.md`. É só um contêiner.
     - **`Group A` (bUEGn0)** — bloco "atendimento":
       - `txt2` (bUEHM0): "Em uma escala de 0 a 10, qual nota você atribui para o nosso atendimento?"
       - `gp nota equipe` (bUEGo0): 11 botões `Button 0 ent` … `Button 10 ent` (ícone estrela), ids
         bUEGt0, bUEGu0, bUEGv0, bUEGz0, bUEHA0, bUEHB0, bUEHF0, bUEGp0, bUEHH0, bUEHL0, bUEHG0.
     - `txt2` (bUELC0): "Em uma escala de 0 a 10, qual nota você atribui para a qualidade do produto?"
     - `gp nota equipe` (bUEIr0): 11 botões `Button 0 ent 2` … `Button 10 ent.2`, ids
       bUEIx0, bUEIy0, bUEIz0, bUEJD0, bUEJE0, bUEJF0, bUEJJ0, bUEIt0, bUEJL0, bUEJP0, bUEJK0.
     - `txt multiIn2` (bUEGi0): "Comentários Adicionais e Sugestões".
     - `Group A` (bUEHN0) → **`ipt coments` (bUEHR0)**, MultiLineInput, placeholder "Escreva aqui", `mandatory = False`.
     - **`Button A` (bUEGj0)** — "Enviar" (ícone `fa fa-send`). **Sem condicional**: nunca é desabilitado.
3. **`Group A` (bUEHY0)** — agradecimento, **oculto ao carregar**: logo "Lure" (bUEHZ0) + "Obrigado pela atenção.
   Sua opinião é fundamental pra nossa melhoria." (bUEHd0). Nenhum workflow o exibe (ver 4.9).
4. **`RepeatingGroup Tbl.Contatos` (bUEHe0)** — oculto ao carregar, `Search(custom.tbl_contatos)`, célula com um texto
   vazio (bUEHf0). Elemento morto que mesmo assim dispara a busca.
5. **`FloatingGroup ftg cabecalho` (bUEHk0)** → `Image B` (bUEHl0), logo MegaBox, com 2 condicionais:
   `Page.Website Home contains "test"` → logo de teste; `not_contains("test")` → logo live.

### 2.2 Layout — `formularionps`

Mesma estrutura, com **um** bloco de nota:
`Group A` (bUDeg, fundo/`tbl_postagens`) › `Group A` (bUDgH, formulário, mesma condicional) › `Text A` (bUDgG, saudação)
› `Group A` (bUDgF, `tbl_contatos`) › `Group A` (bUDet) › `txt2` (bUDfV) "Em uma escala de 0 a 10, qual nota você atribui
para o **nosso serviço**?" › `gp nota equipe` (bUDex) com 11 botões (bUDez, bUDfD, bUDfE, bUDfF, bUDfJ, bUDfK, bUDfL,
bUDey, bUDfQ, bUDfR, bUDfP) › `txt multiIn2` (bUDhI) › `Group A` (bUDfz) › `ipt coments` (bUDgB) › `Button A` (bUDeh,
"Enviar"). Mais `Group A` (bUDgL) de agradecimento oculto (logo Lure bUDgM + texto bUDgN),
`RepeatingGroup Tbl.Contatos` (bUDgR) oculto e `ftg cabecalho` (bUDge) com `Image B` (bUDhD).

### 2.3 Popups

**Não existem.** As duas páginas têm 0 popups. O único feedback visual após o envio é um **toast** do plugin
`1658328157117x953686184769617900` (v1.2.0), ação `AAT` com texto "Resposta enviada!" — ações bUEHv0 e bUDnB.

### 2.4 Parâmetros de URL (o ponto crítico)

| Página | Param | Tipo lido | Quem preenche | Uso |
|---|---|---|---|---|
| `formulariovenda` | `id` | `custom.tbl_clientes` (`Tbl.GrupoCliFor`) | e-mail pós-venda, `?id={Parent:cpo.QualCliente:_id}` | localizar/criar a resposta do cliente (bUEHr0, bUEjf) |
| `formulariovenda` | `pdd` | `text` | e-mail pós-venda, `&pdd{Parent:cpo.QualVendedor:_id}` — **sem `=`** | gravado cru em `cpo.QualVendedor` (texto) |
| `formularionps` | `id` | `custom.tbl_pesquisaposvenda` (`Tbl.PesquisaRespostas`) | e-mail do SAC, `?id={Ancestor[TableCrossAxis]:_id}` | localizar a resposta a atualizar (bUDhU) |

Observações:
- `pdd` carrega o **vendedor**, não o pedido, apesar do nome. O campo destino `cpo.QualVendedor` é `text`, não referência
  a `User` — qualquer string entra.
- O link sai como `…?id=<cliente>&pdd<vendedor>`, sem o `=`. **Isso quebra o parâmetro** — ver [DÚVIDA 1] e 8.3.
- Nenhum parâmetro de token, assinatura, validade ou pedido. O pedido avaliado **não** é identificado em lugar nenhum:
  `cpo.QualPedido` existe no data type e nunca é gravado por estas páginas.

### 2.5 Estados customizados

As duas páginas declaram os mesmos dois estados **na própria página** (`El[Página formulariovenda]` / `El[Página formularionps]`):

| Estado | Tipo | Onde é escrito | Onde é lido |
|---|---|---|---|
| `notaentrega_` | number | 11 WFs de clique (um por nota) | 22 condicionais dos botões; gravado em `cpo.NotaAtendimento` (pós-venda) / `cpo.NotaNps` (NPS) |
| `notaproduto_` | number | 11 WFs de clique — **só em `formulariovenda`** | 22 condicionais dos botões; gravado em `cpo.NotaProduto` |

`formularionps` declara `notaproduto_` mas **nunca usa** (estado morto — 8.1).
Nenhum dos dois tem valor inicial: antes do primeiro clique estão vazios (≠ 0).
O nome `notaentrega_` não corresponde ao campo gravado: vai para `NotaAtendimento` (e `NotaNps`), enquanto
`cpo.NotaEntrega` do data type nunca é escrito por estas páginas.

### 2.6 Condicionais (49 + 27) — o que cada uma faz

| Bloco | `formulariovenda` | `formularionps` |
|---|---|---|
| Botões de nota: `estado = N` → botão pintado (fundo primário, texto de contraste, sem borda) | 22 | 11 |
| Botões de nota: `is_hovered AND estado ≠ N` → fundo cinza claro | 22 | 11 |
| Formulário: `El[Group A]:is_visible` → esconde | 1 | 1 |
| `ipt coments`: `is_focused` → borda/sombra azul; `isnt_valid` → borda/sombra vermelha | 2 | 2 |
| Logo do cabeçalho: `Website Home contains/not_contains "test"` | 2 | 2 |
| **Total** | **49** ✅ | **27** ✅ |

**Não há nenhuma condicional de validação de envio.** O `isnt_valid` do `ipt coments` só pinta a borda, e o campo é
`mandatory = False`, então nunca fica inválido. O botão "Enviar" não tem condicional nem "Only when".

---

## 3. Dados

### 3.1 O que a página busca

`formulariovenda`
- `Search(custom.tbl_postagens):first_element` — data source do grupo de fundo. Tipo inexistente: devolve nada.
- `Search(custom.tbl_contatos)` — data source do repeating group oculto. Tipo inexistente: devolve nada.
- Na gravação (bUEHr0): `Search(Tbl.PesquisaRespostas)` **sem restrição**, com `:filtered` por constraint avançado
  (`InjectedValue:cpo.QualCliente:_id equals UrlParam("id"):_id`) e `:first_element`. Constraint avançado no Bubble é
  filtro **no navegador**: a tabela inteira de respostas desce para o cliente anônimo. Ver 7.3.
- Na condição do bUEjf: `Search(Tbl.PesquisaRespostas: cpo.QualCliente equals UrlParam("id" as custom.tbl_clientes)):first_element:_id:is_empty`
  — mesma pergunta, agora como restrição de servidor. Duas buscas para a mesma coisa (8.2).

`formularionps`
- Mesmas duas buscas mortas (`tbl_postagens`, `tbl_contatos`).
- Na gravação (bUDhU): `Search(Tbl.PesquisaRespostas: _id {'type': 'Empty'} UrlParam("id" as custom.tbl_pesquisaposvenda):_id):first_element`.
  Segue a leitura já registrada em `specs/paginas/vendas.md` (dúvida 13): `{'type': 'Empty'}` = **igual a**.
  É uma busca por `_id` do registro que o próprio parâmetro **já é** — redundante (8.3).

**Nenhuma das duas páginas exibe qualquer dado do cliente, do pedido ou da pesquisa.** Todos os textos são fixos.

### 3.2 O que a página grava — `Tbl.PesquisaRespostas` (`tbl_pesquisaposvenda`)

| Campo | Tipo | `formulariovenda` | `formularionps` |
|---|---|---|---|
| `cpo.NotaAtendimento` | number | ✍ estado `notaentrega_` | — |
| `cpo.NotaProduto` | number | ✍ estado `notaproduto_` | — |
| `cpo.NotaNps` | number | — | ✍ estado `notaentrega_` |
| `cpo.NotaEntrega` | number | — | — (nunca gravado por ninguém no mapa) |
| `cpo.CriticasSugestoes` | text | ✍ `ipt coments` | ✍ `ipt coments` |
| `cpo.Respondida` | boolean | ✍ `true` | ✍ `true` |
| `cpo.TipoResposta` | `Opt.TipoPesquisa` | ✍ `Pós-Venda` | ✍ `NPS` |
| `cpo.QualVendedor` | **text** | ✍ `"{UrlParam("pdd" as text)}"` | — |
| `cpo.QualCliente` | `tbl_clientes` | ✍ só no NewThing (bUEjf) | — (vem do convite do SAC) |
| `cpo.QualPesquisa` | `tbl_pesquisanps` | — | — (vem do convite do SAC) |
| `cpo.QualPedido` | `tbl_pedidos` | — | — |
| `cpo.QualFornecedor` / `QualFilialFornecedor` / `QualFilialCliente` | refs | — | — |

Ou seja: a resposta pós-venda **não fica ligada ao pedido que a originou** e **não entra em nenhuma campanha**
(`QualPesquisa` vazio) — por isso ela não aparece nos contadores por pesquisa do SAC, só na tabela
`Search(Tbl.PesquisaRespostas: cpo.TipoResposta equals Pós-Venda)` (`Table D`, sac bUEMt0).

---

## 4. Funcionalidades e regras de negócio

### 4.1 Abrir o formulário pós-venda com link válido

Não há workflow de carregamento. A página monta com: fundo, saudação, dois blocos de 11 botões (nenhum selecionado,
porque os estados nascem vazios), caixa de comentários vazia e botão "Enviar" ativo.
O parâmetro `id` só é lido **no clique de Enviar**; abrir a página não valida nada e não marca nada.

### 4.2 Abrir o formulário NPS com link válido

Idem, com um bloco de 11 botões. O registro de resposta já existe (criado no SAC, ação bUDcW) e continua com
`Respondida` vazio até o envio.

### 4.3 Link inválido, ausente ou expirado

**Não existe tratamento.** Comportamento de hoje, deduzido das ações:

| Situação | `formulariovenda` | `formularionps` |
|---|---|---|
| `id` ausente ou inválido | bUEHr0 não acha alvo e não altera nada; bUEjf **cria** um registro com `QualCliente` vazio (a condição busca respostas com cliente vazio) — lixo no banco [DÚVIDA 3] | bUDhU não acha alvo: **nada é gravado** |
| Link antigo / já respondido | regrava por cima (4.8) | regrava por cima (4.8) |
| Link "expirado" | conceito não existe: o link vale para sempre | idem |

Nos dois casos o toast "Resposta enviada!" aparece **do mesmo jeito** (bUEHv0/bUDnB são passo final incondicional).
O cliente é informado de sucesso mesmo quando nada foi gravado.

### 4.4 Escolher as notas

Cada botão tem um workflow de uma ação só (`SetCustomState` na página). O clique é **imediato e sem confirmação**;
clicar de novo em outro número troca a nota; **não há como desmarcar** (nenhum workflow limpa o estado).

`formulariovenda` — atendimento (estado `notaentrega_`):
bUEIb0→0, bUEIB0→1, bUEHw0→2, bUEID0→3, bUEII0→4, bUEIN0→5, bUEIl0→6, bUEIP0→7, bUEIU0→8, bUEIZ0→9, bUEIg0→10.

`formulariovenda` — produto (estado `notaproduto_`):
bUEJb0→0, bUEJi0→1, bUEJp0→2, bUEJz0→3, bUEKG0→4, bUEKN0→5, bUEKX0→6, bUEJR0→7, bUEKl0→8, bUEKv0→9, bUEKe0→10.

`formularionps` — serviço (estado `notaentrega_`):
bUDjG→0, bUDhh→1, bUDhZ→2, bUDhr→3, bUDhy→4, bUDiF→5, bUDjX→6, bUDiP→7, bUDid→8, bUDin→9, bUDjN→10.

Bug de aparência: o botão `Button 1 ent.2` (bUEIy0, nota 1 de **produto**) tem a condicional de hover comparando
`custom.notaentrega_:not_equals(1)` em vez de `notaproduto_`. O realce de mouse fica errado quando a nota de
**atendimento** é 1. Só visual.

### 4.5 Validar campos

**Não há validação nenhuma.** Nem no cliente, nem na ação:
- "Enviar" não tem "Only when" e nunca é desabilitado;
- as notas podem estar vazias — grava `NotaAtendimento`/`NotaProduto`/`NotaNps` vazios, com `Respondida = true`;
- o comentário é opcional (`mandatory = False`) e sem limite de tamanho;
- `pdd` entra sem validação de formato (campo texto livre).

### 4.6 Gravar a resposta — pós-venda (WF bUEHq0, clique em `Button A` bUEGj0)

1. **bUEHr0 — ChangeThing** sobre
   `Search(Tbl.PesquisaRespostas):filtered(QualCliente:_id = UrlParam("id"):_id):first_element`.
   Grava `CriticasSugestoes`, `Respondida = true`, `TipoResposta = Pós-Venda`, `NotaAtendimento = notaentrega_`,
   `NotaProduto = notaproduto_`, `QualVendedor = "{UrlParam("pdd" as text)}"`.
   Roda **sempre**, sem "Only when". Se não houver registro, não faz nada.
2. **bUEjf — NewThing** `Tbl.PesquisaRespostas`, **só se**
   `Search(Tbl.PesquisaRespostas: QualCliente equals UrlParam("id")):first_element:_id:is_empty`.
   Grava os mesmos campos mais `QualCliente = UrlParam("id")`.
3. **bUEHv0 — toast** "Resposta enviada!".

Consequências (todas verificáveis no mapa, todas indesejadas):
- **Uma resposta por cliente, para sempre.** A busca não filtra por pedido, por data nem por `Respondida = false`.
  A segunda venda para o mesmo cliente **sobrescreve** a avaliação da primeira. O histórico se perde.
- **Contaminação com o NPS.** Se o SAC já criou um convite/resposta de NPS para esse cliente (ação bUDcW), o
  passo 1 pega **esse** registro (é o `first_element`) e o converte em `Pós-Venda`, mantendo `QualPesquisa` —
  a campanha de NPS passa a contar como respondida uma linha que não é dela. [DÚVIDA 4]
- **`first_element` sem ordenação**: com mais de um registro do mesmo cliente, qual é alterado é indefinido.
- **Passo 2 depende do estado antes do passo 1**; como o passo 1 não cria nada, o efeito prático é
  "altera se existe, cria se não existe" — só que escrito na ordem inversa da natural.

### 4.7 Gravar a resposta — NPS (WF bUDhO, clique em `Button A` bUDeh)

1. **bUDhU — ChangeThing** sobre `Search(Tbl.PesquisaRespostas: _id = UrlParam("id"):_id):first_element`.
   Grava `CriticasSugestoes`, `NotaNps = notaentrega_`, `Respondida = true`, `TipoResposta = NPS`.
2. **bUDnB — toast** "Resposta enviada!".

Não cria registro: se o convite foi apagado (o SAC tem o ícone de lixeira na lista, WF bUEER2), o link vira inócuo e
o cliente ainda vê "Resposta enviada!".

### 4.8 Resposta duplicada

Não existe bloqueio. Reabrir o link e enviar de novo **regrava** o mesmo registro (pós-venda e NPS), inclusive
esvaziando os campos cujos estados estiverem vazios naquela sessão. Não há `Respondida = false` como condição, nem
data de resposta (só o `Modified Date` do Bubble, que nem é exibido). Nada registra quantas vezes foi respondido.

### 4.9 Tela de agradecimento

**Ela nunca aparece.** O grupo de agradecimento (bUEHY0 / bUDgL) está "oculto ao carregar" e **nenhuma das 38 ações**
é `ShowElement` — as únicas ações existentes são `SetCustomState` (33), `ChangeThing` (2), `NewThing` (1) e o
toast do plugin (2). A condicional do formulário (`quando El[Group A]:is_visible → is_visible = False`) aponta para
um "Group A" que nunca fica visível, então o formulário também nunca some.
Efeito real: depois de enviar, o cliente continua na mesma tela preenchida, com o toast "Resposta enviada!" —
e pode clicar "Enviar" outra vez. [DÚVIDA 5]

---

## 5. Cálculos e valores

**As páginas não calculam nada.** Elas só guardam números inteiros de 0 a 10 (sem validação de faixa, porque a faixa
vem dos botões).

Cálculo existente, fora destas páginas (página `sac`, texto `Text Y` bUDCM, citado aqui porque é o destino do dado):

```
"NPS" exibido = soma(NotaNps das respostas da pesquisa com Respondida = true)
                ÷ contagem(mesmas respostas)
(condicional bUDCM: se o resultado for vazio, exibe 0)
```

Isso é a **média aritmética das notas**, não o índice NPS. **Não existe em lugar nenhum do mapa** a classificação
promotor / neutro / detrator, nem o cálculo `%promotores − %detratores`. As notas de pós-venda
(`NotaAtendimento`, `NotaProduto`) não entram em nenhuma média — só aparecem linha a linha no SAC (bUERH0, bUERb0).

Para o app novo (proposta, não regra do Bubble — ver [DÚVIDA 6]):
- promotor: nota 9–10 · neutro (passivo): 7–8 · detrator: 0–6 (faixas padrão de mercado);
- `NPS = round(100 * (promotores − detratores) / total_respondidas)`, inteiro de −100 a 100;
- manter, ao lado, a **média** de hoje, para não quebrar a comparação com os números atuais;
- `smallint`/`numeric` no banco; nunca `float`. A divisão do índice é a única conta, e tem teste.

---

## 6. Integrações e backend workflows

### 6.1 E-mails de disparo (entram nesta spec porque montam o link)

| Origem | Ação | Destino / conteúdo |
|---|---|---|
| `vendas`, WF bTfPH ("btn retira pedido" = finalizar pedido), passo 5 | **bUEjU** `ScheduleAPIEvent` → `EnviarEmailsGeral` (bTnvb0) | `to` = e-mail do contato escolhido (`dd qual cliente email`), `cc` = e-mail do vendedor, assunto "Seu pedido foi finalizado ✅…", corpo com `…/formulariovenda?id={QualCliente:_id}&pdd{QualVendedor:_id}`, `reply` = e-mail do usuário logado, `sender` = "[Megabox] <primeiro nome do usuário>" |
| `vendas`, mesmo fluxo, passo 7 | **bUEoF** `NewThing Tbl.Historico` | registra no histórico do cliente o corpo do e-mail — mas com o link **sem** `&pdd`. O histórico não serve para recuperar o vendedor |
| `vendas`, popup de entregas, `SÓ SE El[Switch C] is_true` | **bUESz** `ScheduleAPIEvent` → bTnvb0 | mesmo corpo, link **sem `&pdd`**, sem `cc` do vendedor e com `sender` "[Megabox]" sem nome |
| `sac`, WF bUDcb (clique em "Enviar Email" na linha da resposta) | **bUDzn** `ScheduleAPIEvent` → bTnvb0 | `to` = e-mail do contato (`dd qual email contato`), assunto "Avaliação NPS - Megabox", corpo com `…/formularionps?id={resposta:_id}` |
| `sac`, WF bUDcQ | **bUDcW** `NewThing Tbl.PesquisaRespostas` | cria o convite (`QualCliente`, `QualPesquisa`) que o link do NPS vai apontar |

`EnviarEmailsGeral` (bTnvb0, `backend-workflows.md`): se `ConfigSistema[CodigoConfig=19].ValorBoolean1` for **false**,
envia por `SendEmail` (SendGrid, `integracoes.md`: "usa SendGrid: True"); se for **true**, envia pelo plugin
`1752755029481x786229441209303000` por SMTP com as credenciais do option set `Opt.Smtp.GmailMegabox`. Em qualquer caso
incrementa `ValorNumero` da mesma config (contador de envios).

### 6.2 E-mails de retorno

**Não existem.** Nenhuma das duas páginas dispara `ScheduleAPIEvent`, notificação ou e-mail ao responder. Ninguém do
time é avisado de uma nota baixa ou de um comentário — a descoberta é manual, abrindo a tela do SAC.
Nenhum backend workflow lê `Tbl.PesquisaRespostas`.

### 6.3 Plugins usados nas páginas

| Plugin | Onde | O que faz |
|---|---|---|
| `1658328157117x953686184769617900` v1.2.0, ação `AAT` | bUEHv0, bUDnB | toast "Resposta enviada!" |

Nenhum outro. Não há captcha, analytics, nem antifraude.

---

## 7. Segurança e privacidade

Esta é a parte mais séria do módulo: **duas páginas anônimas que escrevem no banco de produção.**

### 7.1 O que protege hoje

Praticamente nada. O único "segredo" é o `_id` do Bubble na URL (`<timestamp>x<18 dígitos>`), que:
- **não é secreto** — o app declara `expõe Data API: True` e `Tbl.PesquisaRespostas`, `Tbl.GrupoCliFor`,
  `Tbl.Pedido` etc. estão "exposto na API". Com regra de privacidade `everyone` com `view_all` + `search_for`
  (o padrão observado nos demais tipos em `data-types.md`), qualquer um lista os ids de clientes e de respostas
  por `GET /api/1.1/obj/…` e monta os links que quiser;
- **não expira** e **não é de uso único**;
- **não é validado** contra o pedido, o contato ou a data.

Para `Tbl.PesquisaRespostas` o mapa **não lista regra de privacidade nenhuma** (as seções de privacidade aparecem só
onde há papel configurado) — [DÚVIDA 7]: confirmar no editor. De todo jeito o comportamento atual exige leitura,
criação e alteração anônimas, então a tabela está aberta para escrita anônima.

### 7.2 Quem consegue o quê com o link

| Ação | Quem consegue |
|---|---|
| Responder pelo cliente X | qualquer pessoa que descubra/adivinhe o `_id` do cliente (ou o pegue na Data API) |
| Responder de novo e apagar a avaliação real | quem tiver o link, sempre (4.8) |
| Estragar a avaliação de um vendedor/cliente concorrente | idem — as notas entram sem nenhuma checagem |
| Escrever texto livre arbitrário em `CriticasSugestoes` e em `QualVendedor` | qualquer um; `QualVendedor` é `text`, sem validação |
| Encher a tabela de registros (`NewThing` sem cliente) | qualquer um, chamando a página com `id` vazio (4.3) |

### 7.3 Que dado fica exposto

- **A tabela inteira de respostas vai para o navegador do respondente anônimo.** A ação bUEHr0 usa
  `Search(Tbl.PesquisaRespostas)` **sem restrição** + `:filtered` com constraint avançado; no Bubble, constraint
  avançado é avaliado no cliente. Todas as notas e **todos os comentários livres de todos os clientes** trafegam para
  quem abrir o formulário pós-venda.
- Comentário livre é campo onde o cliente escreve o que quiser, inclusive nome de pessoa, telefone e reclamação
  nominal de funcionário: é **dado pessoal de terceiros** entregue a qualquer visitante.
- Pela Data API os `_id` e os campos de cliente/pedido continuam legíveis sem autenticação.
- Fora da página, mas do mesmo circuito: o option set `Opt.Smtp.GmailMegabox` guarda usuário e **senha de app do
  Gmail em texto puro**; option sets são baixados pelo navegador em toda página do app. A senha deve ser revogada e
  substituída por segredo de servidor na migração (mesma observação de `specs/paginas/financeiro.md` §7.4).

### 7.4 O que o app novo tem de fazer

1. **Token opaco, não id de registro.** Uma tabela `pesquisa_convite` com `token_hash` (sha-256 de 32 bytes aleatórios
   em base64url; o token puro só existe no e-mail), `expira_em` (padrão 30 dias) e `respondido_em`.
   A URL vira `/pesquisa/<token>` — sem `id`, sem `pdd`, sem nada mais.
2. **Nada de escrita a partir do navegador.** Leitura e gravação só por **server action** (Next.js, região `gru1`),
   com o cliente Supabase de `service_role` **criado no servidor** (`SUPABASE_SERVICE_ROLE_KEY`, nunca `NEXT_PUBLIC_`).
3. **RLS ligada e negando o anônimo.** `pesquisa`, `pesquisa_convite`, `pesquisa_resposta` e `pesquisa_resposta_item`
   com RLS habilitada e **sem policy alguma para `anon`**; leitura só para perfis do SAC/Comercial/Diretoria.
   O anônimo nunca fala com o Postgres: fala com a server action.
4. **Uso único e prazo.** A gravação valida, na mesma transação: convite existe, não expirou, `respondido_em is null`.
   Depois de gravar, marca `respondido_em = now()`. Reabrir o link mostra "esta pesquisa já foi respondida" —
   nunca reescreve. Link expirado/inexistente → 404 público, sem dizer o motivo (não confirmar existência de id).
5. **Limite de tentativas.** Contador por token e por IP (janela de 10 min); após N tentativas inválidas, 429.
   O token de 32 bytes já é inviável de adivinhar; o limite protege contra flood de respostas e spam no comentário.
6. **Nada de dado de terceiro na página.** Mostrar no máximo o primeiro nome do cliente e o número do pedido que o
   próprio token resolve; nunca listar outras respostas. Sanitizar e limitar o comentário (ex.: 2.000 caracteres).
7. **Auditoria.** Gravar `respondido_em`, `ip_hash` e `user_agent` na resposta; informar na própria página o uso do
   dado e o responsável pelo tratamento (LGPD).
8. **Vendedor e pedido vêm do banco, não da URL.** O convite já sabe qual pedido e qual vendedor — assim o problema
   do `&pdd` desaparece por construção.

---

## 8. Não reproduzir e oportunidades de otimização

### 8.1 Código morto

- **Tipos inexistentes**: `custom.tbl_postagens` (grupo de fundo bUEHj0/bUDeg, com `Search(...):first_element`) e
  `custom.tbl_contatos` (grupo bUEHS0/bUDgF e repeating groups bUEHe0/bUDgR) **não existem** em `data-types.md`.
  São duas buscas inúteis por carregamento de página, em página pública.
- **Repeating group oculto** `Tbl.Contatos` (bUEHe0/bUDgR) com uma célula de texto vazio: nunca exibido, nunca lido.
- **Tela de agradecimento** (bUEHY0/bUDgL) e sua condicional: nunca exibidas (4.9).
- **Estado `notaproduto_` em `formularionps`**: declarado, nunca escrito nem lido.
- **Campo `cpo.NotaEntrega`** de `Tbl.PesquisaRespostas`: nenhum ponto do mapa grava ou lê. Não migrar.
- **`src` padrão do logo** (bUEHl0/bUDhD): as duas condicionais (`contains "test"` / `not_contains "test"`) cobrem
  todos os casos, então a imagem padrão nunca é usada.
- **Opção `Opt.TipoPesquisa.SAC`**: nenhuma das páginas grava.

### 8.2 Duplicação

- **As duas páginas são a mesma página.** `formularionps` é `formulariovenda` sem o bloco "produto". Mesma árvore,
  mesmos nomes de elemento, mesmos textos, mesmos estados, mesmo toast. Qualquer correção hoje precisa ser feita duas
  vezes — e já divergiu (o `pdd` só existe numa; a busca por `_id` só na outra).
- **33 workflows de uma ação só** (22 + 11) que diferem apenas pela constante 0–10. No app novo é **um** componente
  de nota com um `onChange`.
- **44 + 22 condicionais de botão** idênticas: viram uma classe CSS com `aria-checked`.
- **Duas buscas para a mesma pergunta** dentro de bUEHq0 (bUEHr0 usa `:filtered` avançado, bUEjf usa restrição de
  servidor).
- **Corpo do e-mail pós-venda escrito por extenso em três lugares** (bUEjU, bUESz, bUEoF), já divergentes no link.
  No app novo: um template só.

### 8.3 Gambiarras

- **`&pdd<id>` sem `=`** (bUEjU): o vendedor nunca chega à página — ver [DÚVIDA 1]. E, pior, o `ChangeThing` grava
  `QualVendedor = ""` por cima do que houvesse.
- **`QualVendedor` é `text`** recebendo um `_id` de `User` pela URL: referência disfarçada de string, sem integridade.
- **`Search(...: _id = param):first_element`** (bUDhU) quando o parâmetro **já é** o registro tipado.
- **`first_element` sem ordenação** nas duas gravações: qual registro é alterado é indefinido.
- **"Altera, depois cria se não existia"** (bUEHr0 antes de bUEjf), em vez de "acha ou cria".
- **Resposta atrelada ao cliente e não ao pedido/convite**: uma avaliação por cliente para sempre (4.6).
- **Toast de sucesso incondicional**: mente quando nada foi gravado (4.3).
- **Hover do botão 1 de produto comparando `notaentrega_`** (bUEIy0).
- **Sem validação de envio**: resposta com notas vazias e `Respondida = true` é aceita.
- **Detecção de ambiente por `Page.Website Home contains "test"`** para trocar o logo: no app novo é variável de
  ambiente.

### 8.4 Otimizações

- **Uma rota, dois tipos.** Uma única rota pública parametrizada pelo tipo da pesquisa (`pos_venda` | `nps`), com as
  perguntas vindas do banco. Acrescentar uma pergunta deixa de ser "duplicar a página".
- **Perguntas como dados** (`pesquisa_resposta_item`) em vez de colunas fixas `NotaAtendimento`/`NotaProduto`/`NotaNps`.
  Se a operação preferir simplicidade, manter as três colunas — ver [DÚVIDA 8].
- **Convite com token** (7.4) resolve, de uma vez, identificação, expiração, uso único e ligação com pedido/vendedor.
- **Unicidade no banco**: `unique (convite_id)` em `pesquisa_resposta` torna a resposta duplicada impossível, sem
  depender de workflow.
- **Faixa no banco**: `check (nota between 0 and 10)`.
- **Apuração em view SQL** (`vw_nps_apuracao`), não em texto de tela com `sum ÷ count`: a divisão por zero e a
  classificação promotor/neutro/detrator ficam num lugar só, testável.
- **Notificação de nota baixa**: gatilho para avisar o SAC quando a nota ≤ 6 (hoje ninguém é avisado — 6.2).
- **Índices**: `pesquisa_convite(token_hash)` único, `pesquisa_convite(pedido_id)`, `pesquisa_convite(cliente_id)`.

---

## 9. Proposta para o app novo

### 9.1 Rotas públicas (fora do grupo autenticado)

- `app/(publico)/pesquisa/[token]/page.tsx` — Server Component. Resolve o token no servidor e decide o que renderizar:
  formulário (pós-venda ou NPS, conforme o convite), "já respondida" ou 404. Sem layout autenticado, sem menu,
  sem cabeçalho do app. `export const dynamic = 'force-dynamic'`, metadata `robots: noindex`.
- `app/(publico)/pesquisa/[token]/obrigado/page.tsx` — agradecimento de verdade (o que o Bubble tem e nunca mostra),
  para onde a server action redireciona.
- `app/(publico)/pesquisa/invalido/page.tsx` — mensagem neutra para token inexistente/expirado.
- **Compatibilidade**: `app/(publico)/formulariovenda/route.ts` e `app/(publico)/formularionps/route.ts` —
  respondem aos links antigos já enviados por e-mail com uma página explicando que o link venceu e como pedir outro.
  Não aceitar gravação por id de cliente, em hipótese alguma.
- Middleware: o grupo `(publico)` fica **fora** da checagem de sessão; o resto do app continua exigindo login.

### 9.2 Componentes

- `PesquisaForm` — cliente; recebe `perguntas[]` e o token; um estado por pergunta; envia pela server action com
  `useFormStatus` (botão desabilitado enquanto envia).
- `NotaSelector` — os 11 botões 0–10 como um `role="radiogroup"` com `aria-checked`, navegável por teclado
  (setas + Home/End), respondendo a clique e a toque. Substitui os 33 workflows e as 66 condicionais.
- `ComentarioInput` — textarea com contador e limite (2.000 caracteres).
- `PesquisaConcluida` — estado "já respondida" e agradecimento.
- `MarcaCabecalho` — logo por variável de ambiente, não por `Website Home contains "test"`.
- Tema claro/escuro e largura de celular obrigatórios no QA (regra 7 do `CLAUDE.md`): a maioria abre no telefone.

### 9.3 Server actions

| Ação | Regra |
|---|---|
| `carregarPesquisa(token)` (server, no `page.tsx`) | `service_role`; acha o convite por `token_hash`; devolve tipo, perguntas, primeiro nome do cliente e se já foi respondida. Nunca devolve id de cliente/pedido ao navegador |
| `responderPesquisa({ token, respostas[], comentario })` | zod (nota inteira 0–10, comentário ≤ 2.000); transação: trava o convite (`select … for update`), valida não expirado e `respondido_em is null`, insere `pesquisa_resposta` + itens, marca `respondido_em`, grava `ip_hash`/`user_agent`; erro específico para "já respondida" e "expirada"; `redirect` para `/obrigado` |
| `criarConvitePosVenda({ pedido_id, contato_id })` | chamada ao finalizar o pedido (equivalente a bUEjU); grava pedido, cliente e **vendedor** (do pedido, não da URL); enfileira o e-mail |
| `criarConviteNps({ pesquisa_id, cliente_id, contato_id })` | equivalente ao WF bUDcQ/bUDcW do SAC |
| `reenviarConvite({ convite_id })` (autenticada, SAC/Comercial) | gera token novo, invalida o anterior, enfileira e-mail |
| rate limit | por `token` e por `ip_hash`, janela curta; 429 sem detalhar o motivo |

### 9.4 SQL

```sql
-- campanha / pesquisa (substitui Tbl.PesquisaNps)
create table pesquisa (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  tipo          text not null check (tipo in ('pos_venda','nps','sac')),
  ativa         boolean not null default true,
  criada_em     timestamptz not null default now()
);

-- convite: é o que o link representa
create table pesquisa_convite (
  id            uuid primary key default gen_random_uuid(),
  pesquisa_id   uuid not null references pesquisa(id),
  cliente_id    uuid not null references grupos_clifor(id),
  contato_id    uuid references contatos_clifor(id),
  pedido_id     uuid references pedidos(id),          -- pós-venda: o pedido avaliado
  vendedor_id   uuid references usuarios(id),         -- vem do pedido, nunca da URL
  token_hash    bytea not null unique,                -- sha-256 do token; token puro só no e-mail
  criado_em     timestamptz not null default now(),
  expira_em     timestamptz not null default (now() + interval '30 days'),
  enviado_em    timestamptz,
  respondido_em timestamptz,
  cancelado_em  timestamptz
);
create index on pesquisa_convite (pesquisa_id);
create index on pesquisa_convite (cliente_id);
create index on pesquisa_convite (pedido_id);

-- resposta: 1 por convite, garantida pelo banco
create table pesquisa_resposta (
  id            uuid primary key default gen_random_uuid(),
  convite_id    uuid not null unique references pesquisa_convite(id),
  comentario    text check (char_length(comentario) <= 2000),
  respondido_em timestamptz not null default now(),
  ip_hash       bytea,
  user_agent    text
);

-- itens: uma linha por pergunta respondida
create table pesquisa_resposta_item (
  resposta_id   uuid not null references pesquisa_resposta(id) on delete cascade,
  chave         text not null check (chave in ('atendimento','produto','nps')),
  nota          smallint not null check (nota between 0 and 10),
  primary key (resposta_id, chave)
);

alter table pesquisa                enable row level security;
alter table pesquisa_convite        enable row level security;
alter table pesquisa_resposta       enable row level security;
alter table pesquisa_resposta_item  enable row level security;
-- nenhuma policy para anon: o público só chega por server action com service_role.
-- policies de select/insert só para perfis SAC / Comercial / Diretoria.

-- apuração: índice NPS de verdade + a média que o SAC mostra hoje
create view vw_nps_apuracao as
select p.id                                                    as pesquisa_id,
       p.nome,
       count(*)                                                as respondidas,
       count(*) filter (where i.nota >= 9)                      as promotores,
       count(*) filter (where i.nota between 7 and 8)           as neutros,
       count(*) filter (where i.nota <= 6)                      as detratores,
       round(100.0 * (count(*) filter (where i.nota >= 9)
                    - count(*) filter (where i.nota <= 6))
             / nullif(count(*), 0))                             as nps,
       round(avg(i.nota), 2)                                    as media_nota  -- compatível com o número atual
  from pesquisa p
  join pesquisa_convite       c on c.pesquisa_id = p.id
  join pesquisa_resposta      r on r.convite_id  = c.id
  join pesquisa_resposta_item i on i.resposta_id = r.id and i.chave = 'nps'
 group by p.id, p.nome;
```

Carga a partir do Bubble: `Tbl.PesquisaRespostas` com `Respondida = true` vira `pesquisa_convite` + `pesquisa_resposta`
(+ itens a partir de `NotaNps`, `NotaAtendimento`, `NotaProduto`); com `Respondida` vazio vira convite pendente já
**expirado** (não reabrir link antigo). `QualVendedor` (texto) tenta casar com `usuarios.id`; como o `&pdd` está
quebrado, espere o campo vazio na quase totalidade das linhas — ver [DÚVIDA 1].

### 9.5 Tabelas envolvidas

`pesquisa`, `pesquisa_convite`, `pesquisa_resposta`, `pesquisa_resposta_item`, `email_outbox` (fila de envio),
e, por referência: `pedidos`, `grupos_clifor`, `contatos_clifor`, `usuarios`, `config_sistema` (chave de envio de
e-mail), `historicos` (o registro que hoje é feito pela ação bUEoF).

---

## 10. Dúvidas

1. **[DÚVIDA] O link `&pdd<id>` (sem `=`) quebra o parâmetro do vendedor? — Sim, procede.**
   O e-mail (ação bUEjU) monta `…/formulariovenda?id={cliente}&pdd{vendedor}`. Numa query string, cada par é separado
   por `&` e chave/valor por `=`; o trecho `pdd1751…x…` é lido como uma **chave** chamada `pdd1751…x…` com valor vazio,
   e não como `pdd` = `1751…x…`. O `Get pdd from page URL` da página devolve **vazio**, então:
   - a ação bUEHr0 grava `cpo.QualVendedor = ""` — e, quando o registro já existia com vendedor, **apaga** o valor;
   - a ação bUEjf cria o registro com `QualVendedor` vazio.
   Nada recupera o dado depois: o segundo caminho de envio (bUESz) não inclui `pdd`, e o histórico (bUEoF) grava o
   link já sem ele. **Recomendação padrão:** confirmar no banco que `cpo.QualVendedor` está vazio em praticamente
   todas as respostas de pós-venda; não migrar esse campo como fonte confiável; no app novo o vendedor vem do pedido
   ligado ao convite; e, se a operação continuar no Bubble até o corte, corrigir para `&pdd=`.
2. **[DÚVIDA] O parâmetro se chama `pdd` mas carrega o vendedor** (`{Parent:cpo.QualVendedor:_id}`) e é gravado num
   campo `text` chamado `QualVendedor`. Era para ser o **pedido** (`pdd` = pedido) e alguém trocou a expressão?
   *Recomendação:* tratar como vendedor (é o que o mapa mostra) e, no app novo, gravar **os dois** (pedido e vendedor),
   já que o convite conhece ambos.
3. **[DÚVIDA] Abrir `formulariovenda` sem `id` (ou com id inválido) e enviar** cria um registro com `QualCliente`
   vazio? A condição de bUEjf busca respostas com cliente vazio, o que sugere que sim, e que o banco pode já ter lixo
   desse tipo. *Recomendação:* conferir quantos registros de `tbl_pesquisaposvenda` têm `QualCliente` vazio; no app
   novo, token inválido → 404, sem gravar nada.
4. **[DÚVIDA] Pós-venda sobrescrevendo NPS.** A ação bUEHr0 pega a **primeira** resposta do cliente, sem filtrar tipo
   nem `Respondida`. Se o SAC já tinha criado um convite de NPS para esse cliente (bUDcW), ele vira `Pós-Venda` e
   entra na contagem da campanha. Isso é conhecido/aceito? *Recomendação:* tratar como bug; no app novo cada convite
   é independente e a resposta é única por convite.
5. **[DÚVIDA] A tela de agradecimento nunca aparece.** O grupo está oculto ao carregar e nenhum dos 35 workflows tem
   `ShowElement`; a condicional `quando El[Group A]:is_visible → is_visible = False` aponta para um dos vários
   elementos chamados "Group A" e o mapa não desambigua. Confirmar no editor se o alvo é o grupo de agradecimento.
   *Recomendação:* o comportamento desejado é o óbvio — após enviar, esconder o formulário e mostrar o agradecimento;
   no app novo isso vira `redirect` para `/pesquisa/<token>/obrigado`.
6. **[DÚVIDA] Qual é o "NPS" oficial da MegaBox?** Hoje o SAC exibe a **média** das notas (bUDCM), não o índice.
   Faixas promotor/neutro/detrator não existem no mapa. *Recomendação:* adotar 9–10 / 7–8 / 0–6 e o índice
   `%promotores − %detratores`, mostrando a média ao lado durante a transição.
7. **[DÚVIDA] Regras de privacidade de `tbl_pesquisaposvenda`.** O mapa não lista nenhuma para esse tipo, enquanto
   outros tipos têm `everyone` com `view_all`/`search_for`. Conferir no editor do Bubble se o anônimo realmente pode
   ler e escrever a tabela (o comportamento das páginas exige que possa). *Recomendação:* assumir que sim e tratar a
   tabela como comprometida; no app novo, RLS negando o anônimo desde a primeira migration.
8. **[DÚVIDA] Modelo das notas no banco novo:** três colunas fixas (`nota_atendimento`, `nota_produto`, `nota_nps`) ou
   itens por pergunta (proposta 9.4)? *Recomendação:* itens por pergunta — o Bubble já mostra que perguntas novas
   aparecem, e a saída lá foi duplicar a página inteira.
9. **[DÚVIDA] `cpo.NotaEntrega` existe no data type e nunca é gravado** por nenhuma página do mapa. Foi substituído por
   `NotaAtendimento` (o estado ainda se chama `notaentrega_`)? *Recomendação:* não migrar o campo; conferir antes se
   há dado histórico nele.
10. **[DÚVIDA] A resposta pós-venda não entra em nenhuma campanha** (`QualPesquisa` vazio) e não aponta para o pedido
    (`QualPedido` vazio). Como o negócio quer apurar pós-venda: por período, por vendedor, por pedido?
    *Recomendação:* por pedido (o convite já tem), com recortes por vendedor e período.
11. **[DÚVIDA] Prazo de validade do link.** Não existe hoje. *Recomendação:* 30 dias corridos a partir do envio,
    com reenvio pelo SAC gerando token novo.
12. **[DÚVIDA] Reenvio de convite ao mesmo cliente/pedido**: a operação quer "lembrete" com o mesmo link ou sempre
    token novo? *Recomendação:* token novo a cada envio, invalidando o anterior (rastreia quantos lembretes foram
    precisos).
13. **[DÚVIDA] A resposta deve avisar alguém?** Hoje ninguém é notificado (6.2). *Recomendação:* e-mail ao SAC e ao
    vendedor quando qualquer nota ≤ 6, e resumo semanal.

---

## 11. Cobertura — todos os 35 workflows

### `formulariovenda` (bUEGh0) — 23 workflows, 25 ações

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 1 | bUEHq0 | Clique `Button A` (bUEGj0, "Enviar") | bUEHr0 altera a 1ª resposta do cliente da URL (notas, comentário, `Respondida`, `TipoResposta = Pós-Venda`, `QualVendedor` = `pdd`); bUEjf cria a resposta se o cliente não tiver nenhuma; bUEHv0 mostra o toast "Resposta enviada!" | 4.6, 4.8, 7 |
| 2 | bUEIb0 | Clique `Button 0 ent` (ação bUEIf0) | `notaentrega_` = 0 | 4.4 |
| 3 | bUEIB0 | Clique `Button 1 ent` (bUEIC0) | `notaentrega_` = 1 | 4.4 |
| 4 | bUEHw0 | Clique `Button 2 ent` (bUEHx0) | `notaentrega_` = 2 | 4.4 |
| 5 | bUEID0 | Clique `Button 3 ent` (bUEIH0) | `notaentrega_` = 3 | 4.4 |
| 6 | bUEII0 | Clique `Button 4 ent` (bUEIJ0) | `notaentrega_` = 4 | 4.4 |
| 7 | bUEIN0 | Clique `Button 5 ent` (bUEIO0) | `notaentrega_` = 5 | 4.4 |
| 8 | bUEIl0 | Clique `Button 6 ent` (bUEIm0) | `notaentrega_` = 6 | 4.4 |
| 9 | bUEIP0 | Clique `Button 7 ent` (bUEIT0) | `notaentrega_` = 7 | 4.4 |
| 10 | bUEIU0 | Clique `Button 8 ent` (bUEIV0) | `notaentrega_` = 8 | 4.4 |
| 11 | bUEIZ0 | Clique `Button 9 ent` (bUEIa0) | `notaentrega_` = 9 | 4.4 |
| 12 | bUEIg0 | Clique `Button 10 ent` (bUEIh0) | `notaentrega_` = 10 | 4.4 |
| 13 | bUEJb0 | Clique `Button 0 ent 2` (bUEJd0) | `notaproduto_` = 0 | 4.4 |
| 14 | bUEJi0 | Clique `Button 1 ent.2` (bUEJn0) | `notaproduto_` = 1 (hover com condicional errada — 4.4) | 4.4 |
| 15 | bUEJp0 | Clique `Button 2 ent.2` (bUEJu0) | `notaproduto_` = 2 | 4.4 |
| 16 | bUEJz0 | Clique `Button 3 ent.2` (bUEKB0) | `notaproduto_` = 3 | 4.4 |
| 17 | bUEKG0 | Clique `Button 4 ent.2` (bUEKL0) | `notaproduto_` = 4 | 4.4 |
| 18 | bUEKN0 | Clique `Button 5 ent.2` (bUEKS0) | `notaproduto_` = 5 | 4.4 |
| 19 | bUEKX0 | Clique `Button 6 ent.2` (bUEKZ0) | `notaproduto_` = 6 | 4.4 |
| 20 | bUEJR0 | Clique `Button 7 ent.2` (bUEJW0) | `notaproduto_` = 7 | 4.4 |
| 21 | bUEKl0 | Clique `Button 8 ent.2` (bUEKq0) | `notaproduto_` = 8 | 4.4 |
| 22 | bUEKv0 | Clique `Button 9 ent.2` (bUEKx0) | `notaproduto_` = 9 | 4.4 |
| 23 | bUEKe0 | Clique `Button 10 ent.2` (bUEKj0) | `notaproduto_` = 10 | 4.4 |

Ações: 3 (WF 1) + 22 (WFs 2–23) = **25** ✅

### `formularionps` (bUDcp) — 12 workflows, 13 ações

| # | WF | Evento / elemento | O que faz | Seção |
|---|---|---|---|---|
| 24 | bUDhO | Clique `Button A` (bUDeh, "Enviar") | bUDhU altera a resposta cujo `_id` = `id` da URL (`NotaNps`, comentário, `Respondida`, `TipoResposta = NPS`); bUDnB mostra o toast "Resposta enviada!" | 4.7, 4.8, 7 |
| 25 | bUDjG | Clique `Button 0 ent` (ação bUDjL) | `notaentrega_` = 0 | 4.4 |
| 26 | bUDhh | Clique `Button 1 ent` (bUDhm) | `notaentrega_` = 1 | 4.4 |
| 27 | bUDhZ | Clique `Button 2 ent` (bUDhf) | `notaentrega_` = 2 | 4.4 |
| 28 | bUDhr | Clique `Button 3 ent` (bUDht) | `notaentrega_` = 3 | 4.4 |
| 29 | bUDhy | Clique `Button 4 ent` (bUDiD) | `notaentrega_` = 4 | 4.4 |
| 30 | bUDiF | Clique `Button 5 ent` (bUDiK) | `notaentrega_` = 5 | 4.4 |
| 31 | bUDjX | Clique `Button 6 ent` (bUDjZ) | `notaentrega_` = 6 | 4.4 |
| 32 | bUDiP | Clique `Button 7 ent` (bUDiR) | `notaentrega_` = 7 | 4.4 |
| 33 | bUDid | Clique `Button 8 ent` (bUDii) | `notaentrega_` = 8 | 4.4 |
| 34 | bUDin | Clique `Button 9 ent` (bUDip) | `notaentrega_` = 9 | 4.4 |
| 35 | bUDjN | Clique `Button 10 ent` (bUDjS) | `notaentrega_` = 10 | 4.4 |

Ações: 2 (WF 24) + 11 (WFs 25–35) = **13** ✅

**Total: 35 de 35 workflows, 38 de 38 ações.**
