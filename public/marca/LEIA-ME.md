# Marca do Grupo MegaBox

Imagens públicas de marca, coletadas do site oficial <https://www.grupomegabox.com.br/> em
29/09/2026. Só logo e símbolo — nenhuma foto de produto, cliente ou pessoa.

Varredura feita: HTML da home, os 15 pacotes JS/CSS do Next.js do site (`/_next/static/chunks/`),
o JSON-LD (`"logo"`), as tags `<link rel="icon">` e os caminhos convencionais (`/icon.png`,
`/apple-icon.png`, `/apple-touch-icon.png`, `/manifest.json`, variantes "branco"). O site só
publica **um** logo (claro), **um** símbolo e o favicon. Não há versão para fundo escuro nem
logos de outras empresas do grupo (nenhuma "Paletes Brasil" ou similar no site); as demais
imagens de `/imagens_megabox/` são fotos de produto (paletes, empilhadeira), bandeiras de idioma
e banners — fora do escopo de marca.

## Arquivos originais (baixados sem alteração)

| Arquivo | URL de origem | Tamanho | Uso no site |
|---|---|---|---|
| `logo-megabox.webp` | `https://www.grupomegabox.com.br/imagens_megabox/logo_megabox.webp` | 437 × 174 | logo do cabeçalho e rodapé; `"logo"` do JSON-LD |
| `logo-megabox.png` | `https://www.grupomegabox.com.br/imagens_megabox/logo_megabox.png` | 437 × 174 | mesmo logo em PNG |
| `simbolo-megabox.png` | `https://www.grupomegabox.com.br/imagens_megabox/logo%20minimalista.png` | 118 × 109 | símbolo (cubo) sozinho |
| `favicon.ico` | `https://www.grupomegabox.com.br/favicon.ico` | 118 × 109 | favicon do site |

Cores medidas nos pixels do logo: roxo do cubo **#720187**, cinza do letreiro **#4B4B4D**.

## Derivados (gerados aqui a partir dos originais)

| Arquivo | Como | Uso no app |
|---|---|---|
| `logo-megabox-claro.png` | `logo-megabox.png` recortado na caixa do desenho (+4 px), 394 × 106 | cabeçalho, login e formulário público no tema claro |
| `logo-megabox-escuro.png` | o recorte acima com o cinza do letreiro trocado por #ECECF1 e o roxo do cubo por #B07CE8 (o roxo original dá 1,84:1 sobre preto; o novo, 6,14:1) | os mesmos lugares no tema escuro |
| `simbolo-megabox-32.png`, `simbolo-megabox-180.png` | símbolo centralizado num quadrado e reduzido | ícone PNG da aba e ícone da tela inicial do iOS |

O site não publica logo para fundo escuro; a variante escura é derivação nossa, mantendo o
desenho e trocando só as duas cores. Se o marketing tiver o arquivo vetorial oficial (SVG/AI)
ou uma versão negativa aprovada, substitua os dois PNGs mantendo os nomes — `componentes/marca.tsx`
só depende da proporção 394 × 106 (ajuste `LARGURA`/`ALTURA` lá se mudar).

Onde aparece: `componentes/marca.tsx` (cabeçalho da casca, `/entrar`, layout do formulário
público) e `app/layout.tsx` (`metadata.icons`).
