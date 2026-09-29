# Sistema visual (v2)

Pedido do dono: "refazer os visuais do app por completo, mas seguindo as ideias de layout do
bubble, mantendo o mesmo lugar em que os componentes estão e padrão de cores parecido".

Leitura dessa frase, que orienta todas as decisões abaixo:

- **Lugar das coisas é do Bubble.** Cabeçalho com hambúrguer à esquerda, logo ao centro e usuário
  à direita; filtros no topo; kanban de 4 colunas em vendas; ficha em popup. Nada muda de posição.
- **Cor é do Bubble, afinada.** Azul de ação, laranja de "salvar em edição", verde de vencedor,
  vermelho de cancelado, lilás de chip, azul-claro #EEF3FB de linha. Cada cor foi ajustada só o
  necessário para passar WCAG AA — nenhuma troca de matiz.
- **O que muda é a execução:** tipografia, espaçamento, estados (hover, foco, desabilitado,
  carregando), tema escuro e layout de celular, que o Bubble não tem.

Fonte da verdade do código: `estilos/tokens.css` (tokens), `estilos/base.css` (elementos),
`estilos/componentes.css` (peças compartilhadas), `app/(app)/casca.css` (cabeçalho e menu) e um
CSS por rota. Sem Tailwind (CLAUDE.md, Stack). Referência do Bubble:
`specs/bubble/02-telas-e-design.md` e as capturas de `design/capturas/` (fora do git, ver
`design/LEIA-ME.md`).

## Regras de uso

1. **Só token.** Rota não escreve cor hexadecimal, peso numérico nem duração solta. Exceção
   documentada: o gradiente do avatar do cabeçalho (`casca.css`), que é marca.
2. **Nome antigo continua valendo.** `--sombra`, `--sombra-alta` etc. são apelidos dos novos.
3. **Cor com significado nunca sozinha.** Selo e aviso sempre têm texto; o troféu tem
   `aria-label`; o cartão cancelado diz "Cancelado".
4. **Claro e escuro são o mesmo sistema.** O escuro redefine os mesmos nomes; `tokens.css` tem
   duas cópias idênticas (`[data-tema='escuro']` e `prefers-color-scheme`) — mantê-las iguais.
5. **Ícone é SVG**, nunca emoji: emoji não obedece à paleta nem ao tema. Onde o markup ainda
   tem emoji (troféu da ficha de vendas), o CSS esconde o glifo (`font-size: 0`) e desenha o
   SVG por `mask` na cor do token, sem mexer no markup nem no nome acessível.

## Paleta

### Claro

| Token | Valor | Papel | Origem no Bubble |
|---|---|---|---|
| `--azul` | #2c66e0 | ação primária, link, valor, data | #3D78F3, um passo mais escuro |
| `--azul-escuro` | #2154c2 | hover/pressionado; azul sobre fundo tingido | — |
| `--azul-vivo` | #3d78f3 | anel de foco, gráfico | o azul original |
| `--azul-claro` | #eef3fb | fundo de linha, cartão de item | #EEF3FB (igual) |
| `--azul-medio` | #dfe8f8 | linha em hover / selecionada | — |
| `--lilas` | #e4e0f6 | chip, selo de status, avatar | lilás dos chips |
| `--lilas-cabeca` | #e7e5f0 | cabeçalho de tabela e de coluna do kanban | cinza-lilás das tabelas |
| `--roxo` | #7030a0 | marca (cubo), número de meta | cubo do logo |
| `--verde` / `--verde-fundo` | #177a45 / #e5f4eb | líquido, vencedor, concluído | verde |
| `--vermelho` / `--vermelho-fundo` | #c0362c / #fbeceb | vencido, tributo, cancelado, destrutivo | vermelho |
| `--laranja` | #f5a623 | preenchimento de "Salvar"/"Arquivar", borda de alerta | #F5A623 (igual) |
| `--laranja-texto` / `--laranja-fundo` | #955800 / #fdf3e2 | texto de alerta sobre claro | — |
| `--sobre-laranja` | #2b1d00 | texto sobre o laranja sólido | — |
| `--fundo` / `--fundo-2` / `--superficie` | #fff / #f5f7fb / #fff | página, calha, cartão | branco |
| `--cabecalho-fundo` | #f1f6f5 | faixa do cabeçalho | cinza-esverdeado claro |
| `--texto` / `--texto-2` / `--texto-3` | #1c2230 / #4f586a / #626b7e | texto, secundário, terciário | — |
| `--borda` / `--borda-forte` / `--borda-campo` | #e1e5ec / #c3cad6 / #8c95a6 | divisória, contorno, campo | — |

### Escuro

Mesmos nomes. Azul vira #7aa5ff com texto **escuro** por cima (`--sobre-azul` #0b1220), porque
branco sobre azul claro não passa; superfícies #11141b (fundo), #161a23 (calha), #1b202a (cartão).

## Contraste medido

Razão WCAG 2.x, calculada pela luminância relativa (script em Python, fórmula da WCAG, sem
arredondar antes do fim). Texto normal exige 4,5:1; texto grande e componente de interface
(borda de campo, anel de foco), 3:1.

### Claro

| Primeiro plano | Fundo | Razão | Uso |
|---|---|---|---|
| `--texto` #1c2230 | `--fundo` #fff | **15,90** | corpo |
| `--texto` | `--cabecalho-fundo` #f1f6f5 | **14,57** | nome no cabeçalho |
| `--texto-2` #4f586a | #fff | **7,15** | rótulo, meta |
| `--texto-2` | `--azul-claro` #eef3fb | **6,42** | meta dentro de linha |
| `--texto-2` | `--lilas-cabeca` #e7e5f0 | **5,74** | cabeçalho de tabela, contador de coluna |
| `--texto-3` #626b7e | #fff | **5,35** | placeholder, nota |
| `--texto-3` | `--azul-claro` | **4,80** | nota dentro de linha |
| `--texto-3` | `--fundo-2` #f5f7fb | **4,99** | nota na calha |
| branco | `--azul` #2c66e0 | **5,14** | botão primário, pílula ligada, avatar |
| branco | `--azul-escuro` #2154c2 | **6,75** | botão primário em hover |
| `--azul` | #fff | **5,14** | link, botão secundário, data |
| `--azul` | `--azul-claro` | **4,62** | botão secundário em hover, pílula de quantidade |
| `--azul-escuro` | `--azul-medio` #dfe8f8 | **5,47** | texto azul em linha com hover |
| `--azul-escuro` | `--lilas` #e4e0f6 | **5,24** | carteira na linha selecionada (cadastros) |
| `--roxo` #7030a0 | #fff | **8,02** | título de cartão de metas |
| `--roxo` | `--lilas` | **6,22** | selo "info", avatar de cliente |
| `--verde` #177a45 | #fff / `--verde-fundo` | **5,38** / **4,73** | vencedor, "ok" |
| `--vermelho` #c0362c | #fff / `--vermelho-fundo` | **5,52** / **4,81** | cancelado, erro |
| `--laranja-texto` #955800 | `--laranja-fundo` #fdf3e2 | **5,20** | selo e aviso de alerta |
| `--sobre-laranja` #2b1d00 | `--laranja` #f5a623 | **8,10** | "Salvar Cotação", "Arquivar" |
| `--borda-campo` #8c95a6 | #fff | **3,02** | contorno de campo (1.4.11) |
| `--azul-vivo` #3d78f3 | #fff | **4,05** | anel de foco (1.4.11) |

### Escuro

| Primeiro plano | Fundo | Razão |
|---|---|---|
| `--texto` #e7eaf0 | `--fundo` #11141b / `--superficie` #1b202a | **15,29** / **13,54** |
| `--texto-2` #aab1c0 | `--superficie` | **7,59** |
| `--texto-2` | `--lilas-cabeca` #262a3a | **6,62** |
| `--texto-3` #8f97a8 | `--superficie` / `--fundo-2` | **5,56** / **5,94** |
| `--sobre-azul` #0b1220 | `--azul` #7aa5ff | **7,72** |
| `--azul` | `--superficie` / `--azul-claro` #1a2438 | **6,73** / **6,39** |
| `--roxo` #c197e6 | `--lilas` #2d2946 | **5,82** |
| `--verde` #5cc98c | `--verde-fundo` #14291d | **7,47** |
| `--vermelho` #ff8a80 | `--vermelho-fundo` #321c1a | **6,99** |
| `--laranja-texto` #f3bf6a | `--laranja-fundo` #2f2515 | **8,93** |
| `--sobre-laranja` | `--laranja` #f0b453 | **8,88** |
| `--borda-campo` #687186 | `--superficie` | **3,34** |
| `--azul-vivo` #7aa5ff | `--fundo` | **7,59** |

### Pares que NÃO passam — e o que se faz

| Par | Razão | Tratamento |
|---|---|---|
| `--azul` sobre `--azul-medio` | 4,17 | a linha em hover redefine `--azul: var(--azul-escuro)` (produtos, sac); o botão "Sair" usa `--azul-escuro` no hover |
| `--azul` sobre `--lilas` | 3,99 | linha selecionada de cadastros usa `--azul-escuro` na carteira |
| `--laranja` sobre claro | ~2 | laranja nunca é texto sobre claro: texto usa `--laranja-texto` |
| branco sobre `--laranja` | ~2 | o texto do botão laranja é `--sobre-laranja` |

Correções desta revisão: `--texto-3` desceu de #677083 para #626b7e (dava 4,46:1 sobre
`--azul-claro`); o gradiente do avatar começa em #2c66e0 em vez de #3d78f3 (branco 5,14:1).

## Tipografia

**Source Sans 3** (via `next/font`, `app/layout.tsx`): humanista como o Lato do Bubble, mais
legível em corpo pequeno e com algarismos tabulares de verdade — dinheiro alinha na coluna sem
fonte monoespaçada (`font-variant-numeric: tabular-nums` em valores, contadores e pílulas).

Escala 1,2 (terça menor), ancorada em 16 px:

| Token | Tamanho | Uso |
|---|---|---|
| `--t-xs` | 13 px | rótulo de campo, meta, selo, contador |
| `--t-sm` | 14 px | tabela, cartão, controles |
| `--t-md` | 16 px | corpo; título de cartão do kanban; campo no celular (evita zoom no iOS) |
| `--t-lg` | 20 px | título de seção, de diálogo e de coluna do kanban |
| `--t-xl` | 26 px | título de página (`h1`) |

Pesos: 400 corpo, `--peso-medio` 600 (rótulo, botão, "Vendedor:"), `--peso-forte` 700 (títulos,
nome de cliente em CAIXA ALTA — a caixa alta é do Bubble e fica, porque é o nome como o usuário
reconhece o cartão).

## Espaço, forma e elevação

- **Espaço, escala de 4:** `--e1` 4 · `--e2` 8 · `--e3` 12 · `--e4` 16 · `--e5` 24 · `--e6` 32 ·
  `--e7` 48 px.
- **Raio com papel:** `--raio-p` 4 (miniatura), `--raio` 6 (campo, botão), `--raio-g` 10
  (cartão, coluna, diálogo), `--raio-pilula` (selo, pílula de filtro, avatar).
- **Elevação:** `--sombra-1` cartão parado, `--sombra-2` cartão em hover / menu, `--sombra-3`
  diálogo. No escuro as sombras ficam mais densas porque sombra clara não aparece.
- **Alvo de toque:** controles com 40 px no desktop e 44 px até 48rem.

## Estados

| Estado | Regra |
|---|---|
| Hover | fundo um tom acima (`--azul-claro` em secundário/texto, `--azul-escuro` em primário); cartão sobe para `--sombra-2` e borda `--borda-forte` |
| Foco (teclado) | `:focus-visible` com contorno 2 px `--azul-vivo` e deslocamento 2 px; campo usa borda azul + `--anel` |
| Pressionado | `translateY(1px)`; pílula de filtro ligada = azul sólido (`aria-pressed`) |
| Selecionado | linha `aria-current` em `--lilas` (cadastros) ou `--azul-medio` |
| Desabilitado | opacidade 0,5 e `cursor: not-allowed`; campo somente leitura em `--fundo-2` |
| Carregando | `aria-busy` no botão (cursor de progresso); lista/kanban com `data-pendente` em 55 % de opacidade; esqueleto só enquanto não há dado |
| Erro | `aria-invalid` deixa a borda vermelha; `.aviso[data-tom='erro']` com faixa à esquerda |
| Movimento | 120 ms (`--dur-1`) em hover, 200 ms (`--dur-2`) em diálogo; tudo zerado em `prefers-reduced-motion` |

## Vendas (kanban e ficha)

Layout do Bubble mantido por inteiro (vendas-01, -02, -04): filtros com pílulas de contorno azul
e "+ Cotação" azul sólido à direita; quatro colunas iguais, cada uma rolando sozinha; cartão com
avatar à esquerda, NOME - Nº em caixa alta, "Vendedor:" e "Dt …:" com rótulo em negrito, lápis
azul à direita. O que o CSS novo faz:

- cabeçalho da coluna em `--lilas-cabeca`, título 20 px e contador tabular abaixo;
- cartão com `--sombra-1`, sobe no hover; avatar lilás com iniciais em roxo (o logo do cliente
  não existe no banco novo);
- as três linhas do cartão expandido (carrinho roxo, troféu verde, documento azul) viram ícones
  SVG em círculo tingido, no lugar de emoji;
- pílula de quantidade com largura mínima e algarismos tabulares;
- ficha: tabela de orçamentos com cabeçalho `--lilas-cabeca`, hover de linha, linha vencedora em
  `--verde-fundo` (também no hover); troféu em círculo — contorno cinza ou verde cheio;
- celular: o quadro rola na horizontal dentro de si, uma coluna por vez com encaixe (o Bubble
  espreme as colunas até o texto ficar vertical).
