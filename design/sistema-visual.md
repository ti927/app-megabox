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

### Revisão de 29/09/2026 — feedback do Diretor

| Pedido (literal) | O que virou |
|---|---|
| "não tem tema claro e escuro (apenas escuro)" | seletor claro / escuro / sistema no cabeçalho, gravado em cookie (seção **Tema**) |
| "tema escuro deve ser preto com roxo e não esse azul neon horrível" | escuro refeito: fundos preto/grafite quase neutros e **roxo MegaBox** como cor de ação (seção **Paleta → Escuro**) |
| "não tenha medo dos componentes se expandirem para a tela toda … aplicativo web, não mobile" | desktop-first: casca sem `max-width`, menu aberto por padrão em tela larga, margem de página pequena (seção **Layout**) |
| "faça os menus ocuparem mais espaço na tela" | menu lateral 18rem, itens de 46 px com ícone da página, fonte 16 px |
| fonte "pouco clara nas metas" | IBM Plex Sans no lugar da Source Sans 3 (seção **Tipografia**) |
| "não use emojis, use ícones" | `lucide-react` + `componentes/icone.tsx` (seção **Ícones**) |
| "colete todas as logos do site oficial" | `public/marca/` com origem em `public/marca/LEIA-ME.md`; logo real no cabeçalho, login e favicon |

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
   **`--azul` é o nome do token de AÇÃO, não uma promessa de matiz:** no claro é azul (Bubble),
   no escuro é roxo. Rota nunca testa o tema para escolher cor; usa o token.
5. **Ícone é `lucide-react`**, nunca emoji nem glifo de texto (seção **Ícones**).
6. **Nada de `max-width` em contêiner de página.** Largura limitada só em texto corrido
   (`max-width: var(--medida)`) e em diálogo.

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
| `--roxo` | #720187 | ícone de atalho, número de meta, selo "info" | roxo do cubo medido no logo oficial |
| `--marca` / `--sobre-marca` | #720187 / #fff | avatar, opção ligada do seletor de tema | idem |
| `--verde` / `--verde-fundo` | #177a45 / #e5f4eb | líquido, vencedor, concluído | verde |
| `--vermelho` / `--vermelho-fundo` | #c0362c / #fbeceb | vencido, tributo, cancelado, destrutivo | vermelho |
| `--laranja` | #f5a623 | preenchimento de "Salvar"/"Arquivar", borda de alerta | #F5A623 (igual) |
| `--laranja-texto` / `--laranja-fundo` | #955800 / #fdf3e2 | texto de alerta sobre claro | — |
| `--sobre-laranja` | #2b1d00 | texto sobre o laranja sólido | — |
| `--fundo` / `--fundo-2` / `--superficie` | #fff / #f5f7fb / #fff | página, calha, cartão | branco |
| `--cabecalho-fundo` | #f1f6f5 | faixa do cabeçalho | cinza-esverdeado claro |
| `--texto` / `--texto-2` / `--texto-3` | #1c2230 / #4f586a / #626b7e | texto, secundário, terciário | — |
| `--borda` / `--borda-forte` / `--borda-campo` | #e1e5ec / #c3cad6 / #8c95a6 | divisória, contorno, campo | — |

### Escuro — preto/grafite + roxo MegaBox

Mesmos nomes. O escuro anterior (fundos azulados #11141b e ação #7aa5ff) foi o "azul neon" que o
Diretor recusou. Agora:

| Token | Valor | Papel |
|---|---|---|
| `--fundo` / `--fundo-2` / `--superficie` | #0f0f11 / #141417 / #1a1a1e | página, calha, cartão — cinzas quase neutros, sem tinta azul |
| `--cabecalho-fundo` / `--menu-fundo` | #121214 / #131316 | casca |
| `--borda` / `--borda-forte` / `--borda-campo` | #2a2a30 / #3b3b43 / #6e6e7a | divisória, contorno, campo |
| `--texto` / `--texto-2` / `--texto-3` | #ececf1 / #b6b6c0 / #9696a2 | — |
| `--azul` (ação) | **#a66be3** | roxo MegaBox clareado para ler sobre preto |
| `--azul-escuro` (hover) | #bb8cee | no escuro o hover CLAREIA |
| `--azul-vivo` (foco) | #b07ce8 | anel de foco |
| `--sobre-azul` | #160a22 | texto sobre o roxo: branco sobre roxo claro não passa AA |
| `--azul-claro` / `--azul-medio` | #231a2e / #2e2240 | linha tingida de roxo / hover e selecionado |
| `--lilas` / `--lilas-cabeca` | #2c2238 / #1f1d25 | chip / cabeçalho de tabela (grafite com fio de lilás) |
| `--roxo` / `--marca` | #cfa6f2 / #a66be3 | — |

Verde, vermelho e laranja continuam os mesmos do escuro anterior (já passavam).

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
| `--texto` #ececf1 | `--fundo` #0f0f11 / `--superficie` #1a1a1e | **16,26** / **14,73** |
| `--texto` | `--lilas-cabeca` #1f1d25 / `--azul-medio` #2e2240 | **14,15** / **12,57** |
| `--texto-2` #b6b6c0 | `--superficie` / `--lilas-cabeca` | **8,63** / **8,28** |
| `--texto-3` #9696a2 | `--superficie` / `--fundo-2` / `--azul-claro` | **5,93** / **6,29** / **5,71** |
| `--sobre-azul` #160a22 | `--azul` #a66be3 / `--azul-escuro` #bb8cee | **5,30** / **7,36** |
| `--azul` #a66be3 | `--fundo` / `--superficie` / `--menu-fundo` / `--azul-claro` | **5,32** / **4,82** / **5,15** / **4,63** |
| `--azul-escuro` #bb8cee | `--azul-medio` / `--lilas` | **5,71** / **5,81** |
| `--roxo` #cfa6f2 | `--lilas` #2c2238 / `--superficie` | **7,46** / **8,58** |
| `--verde` #5cc98c | `--verde-fundo` #14291d | **7,47** |
| `--vermelho` #ff8a80 | `--vermelho-fundo` #321c1a | **6,99** |
| `--laranja-texto` #f3bf6a | `--laranja-fundo` #2f2515 | **8,93** |
| `--sobre-laranja` | `--laranja` #f0b453 | **8,88** |
| `--borda-campo` #6e6e7a | `--superficie` | **3,45** |
| `--azul-vivo` #b07ce8 | `--fundo` | **6,29** |
| logo escuro: cubo #b07ce8 | `--cabecalho-fundo` #121214 | **6,14** (o roxo original #720187 daria 1,84) |

No claro, o roxo novo: `--roxo` #720187 sobre #fff / `--lilas` / `--cabecalho-fundo` /
`--azul-claro` = **10,15** / **7,87** / **9,30** / **9,11**; branco sobre `--marca` = **10,15**.

### Pares que NÃO passam — e o que se faz

| Par | Razão | Tratamento |
|---|---|---|
| `--azul` sobre `--azul-medio` | 4,17 (claro) / 4,11 (escuro) | a linha em hover redefine `--azul: var(--azul-escuro)` (produtos, sac); o botão "Sair" usa `--azul-escuro` no hover |
| `--azul` sobre `--lilas` | 3,99 (claro) / 4,19 (escuro) | linha selecionada de cadastros usa `--azul-escuro` na carteira |
| `--laranja` sobre claro | ~2 | laranja nunca é texto sobre claro: texto usa `--laranja-texto` |
| branco sobre `--laranja` | ~2 | o texto do botão laranja é `--sobre-laranja` |

Correções desta revisão: `--texto-3` desceu de #677083 para #626b7e (dava 4,46:1 sobre
`--azul-claro`); o gradiente do avatar começa em #2c66e0 em vez de #3d78f3 (branco 5,14:1).

## Tipografia

**IBM Plex Sans** (via `next/font`, `app/layout.tsx`, pesos 400/500/600/700). Troca feita na
revisão de 29/09: o Diretor achou a fonte "pouco clara" nas metas. A Source Sans 3 tem
traço fino e algarismos estreitos; a Plex foi desenhada para interface de sistema — I, l e 1
distintos, 0 e O distintos, aberturas largas, algarismos tabulares de verdade — e fica firme em
13–14 px, que é o corpo das tabelas. Dinheiro alinha na coluna sem fonte monoespaçada
(`font-variant-numeric: tabular-nums` em valores, contadores e pílulas).

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

## Tema (claro / escuro / sistema)

- **Seletor:** `componentes/seletor-tema.tsx`, três botões de ícone (sol, lua, monitor) num
  `role="radiogroup"` no cabeçalho, à esquerda do avatar. No celular (≤ 48rem) ele sai do
  cabeçalho e aparece no rodapé do menu lateral. Também está no canto de `/entrar`.
- **Persistência:** cookie `mb-tema` = `claro` | `escuro`, `Path=/`, `SameSite=Lax`, 1 ano.
  "Sistema" apaga o cookie. Lógica pura e testada em `componentes/tema.ts` (+ `tema.test.ts`).
- **Sem piscar:** `app/layout.tsx` lê o cookie no servidor e já escreve
  `<html data-tema="claro|escuro">`. Sem cookie, não há atributo e vale `prefers-color-scheme`.
  O clique só troca o atributo e grava o cookie — sem recarregar.
- **CSS:** `:root[data-tema='escuro']` e `@media (prefers-color-scheme: dark) :root:not([data-tema='claro'])`
  carregam a mesma lista de tokens (`estilos/tokens.css`). Regra de tela que precise diferir por
  tema (não deveria) segue o mesmo par de seletores — veja a troca de logo em
  `estilos/componentes.css`, seção "marca".

## Layout (desktop-first)

O app é de mesa (pedido do Diretor). A casca:

- **Cabeçalho** 60 px: hambúrguer à esquerda, logo oficial (44 px de altura, link para o início)
  ao centro, seletor de tema + avatar + nome/perfil + engrenagem à direita.
- **Menu lateral** `--largura-menu` (18rem), **aberto por padrão** em tela > 64rem e fechado em
  tela estreita; o hambúrguer alterna. Itens de 46 px, 16 px, com o ícone da página.
- **Conteúdo** ocupa toda a largura restante, com `--margem-pagina` (24 px) de respiro.
  **Nenhum `max-width` na casca nem em `estilos/`.** As telas não devem pôr `max-width` no
  contêiner da página (`.cadastros`, `.metas` etc.) — tabelas e kanban usam a largura toda.
  Limite só texto corrido (`max-width: var(--medida)`, 72ch) e diálogos.

Pendência (fora da casca): `produtos.css`, `sac.css`, `rotinas.css` (80rem) e
`cadastros.css`/`metas.css`/`relatorios.css` (80–90rem) ainda limitam o contêiner da página;
quem é dono de cada rota remove.

## Ícones

Biblioteca única: **`lucide-react`** (traço de 2 px, grade de 24, licença ISC). Emoji e glifo de
texto (☰ ⚙ ✕ ▾ ▴ ← → 🏆 🛒 🚚 ⚠ ✓) estão proibidos como ícone de interface: não obedecem à
paleta nem ao tema e cada sistema operacional os desenha de um jeito. (Em texto de dados, "×" de
multiplicação e "→" de intervalo são tipografia, não ícone — podem ficar.)

**Como usar:** `componentes/icone.tsx`.

```tsx
import { Pencil, Trophy, X } from 'lucide-react'
import { Icone } from '@/componentes/icone'

<button className="botao-texto"><Icone icone={Pencil} tamanho={16} /> Editar</button>
<button className="dialogo-fechar" aria-label="Fechar"><Icone icone={X} tamanho={20} /></button>
<span className="item-vencedor"><Icone icone={Trophy} rotulo="Vencedor" /> {nome}</span>
```

- **Tamanho:** 16 em botão/pílula/tabela, 18 padrão, 20 em menu e botão só-ícone, 24 no
  cabeçalho e em título (o tipo de `tamanho` só aceita 14/16/18/20/24).
- **Cor:** o ícone herda `currentColor`; pinte o elemento pai com token.
- **Acessibilidade:** decorativo por padrão (`aria-hidden`). Botão só com ícone leva
  `aria-label` no BOTÃO. Ícone que é a única informação fora de botão leva `rotulo`.
- **Mesmo conceito, mesmo ícone** em todo o app:

| Conceito | lucide | Glifo que substitui |
|---|---|---|
| fechar diálogo | `X` | ✕ × |
| abrir / fechar menu | `Menu` / `PanelLeftClose` | ☰ |
| configurações | `Settings` + `ChevronDown` | ⚙ ▾ |
| expandir / recolher | `ChevronDown` / `ChevronUp` | ▾ ▴ |
| anterior / próxima | `ChevronLeft` / `ChevronRight` | ← → |
| editar | `Pencil` | ✎ |
| adicionar (+ Cotação, + Cliente) | `Plus` | + |
| vencedor | `Trophy` | 🏆 |
| itens da cotação | `ShoppingCart` | 🛒 |
| entrega / NF de saída | `Truck` | 🚚 |
| documento / proposta | `FileText` | 📄 |
| alerta | `TriangleAlert` | ⚠ |
| concluído / copiado | `Check` | ✓ |
| arquivar | `Archive` | — |
| cancelar pedido | `Ban` | — |
| ordenar por data | `ArrowUpDown` | — |
| período / data | `CalendarDays` | — |
| sair | `LogOut` | — |
| páginas do menu | `iconePagina(slug)` em `componentes/icones-paginas.ts` | — |

- **`.dialogo-fechar` com "✕" antigo:** enquanto a tela não troca o markup, o CSS compartilhado
  esconde o glifo e desenha o `X` do lucide por máscara. Ao pôr `<Icone icone={X} />` dentro do
  botão, a máscara desliga sozinha (`:not(:has(svg))`).

## Marca

`componentes/marca.tsx` mostra o logo oficial (`public/marca/`, origem e derivações em
`public/marca/LEIA-ME.md`): uma imagem por tema, trocada por CSS. `tamanho` = altura em px
(cabeçalho 44, login 72, formulário público 32). Favicon e ícone iOS em `app/layout.tsx`.
O cubo SVG desenhado à mão da v2 saiu: logo é arquivo oficial, não redesenho.
