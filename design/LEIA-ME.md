# Referência visual do Bubble

## `capturas/` não está no git — de propósito

As 80 capturas de tela de `design/capturas/` **não são versionadas**. Elas foram feitas no app real
(ambiente de teste, que tem cópia dos dados de produção) e contêm dado pessoal e comercial:

- razão social e nome de clientes reais, em lista;
- CNPJ de cliente;
- nome e telefone de contatos;
- nome e cargo de funcionários;
- o tamanho da base (contadores de clientes e fornecedores ativos).

Este repositório é **público**. Publicar as capturas seria vazar a carteira de clientes do Grupo
MegaBox. Por isso `design/capturas/` está no `.gitignore`.

Quem for trabalhar no projeto descompacta `megabox-capturas.zip` na raiz do repositório:

```
python -c "import zipfile; zipfile.ZipFile('../megabox-capturas.zip').extractall('.')"
```

O zip fica fora do git, junto com o `.bubble`.

## O texto é a referência, a imagem é apoio

`specs/bubble/02-telas-e-design.md` descreve cada tela em palavras e **não** contém dado de cliente
(conferido por varredura de CNPJ, CPF, telefone e nomes). É ele que vale como especificação de
desenho. As imagens servem para conferir detalhe visual que o texto não alcança.

Isso também importa porque as capturas não são fotos: são renderizações do DOM feitas pela extensão
do Chrome (html-to-image), com diferenças conhecidas — logo de cliente vira quadrado cinza,
placeholder às vezes sai azul, e em `financeiro` o rótulo "Dt entrega" fica sobreposto à data. O
próprio documento lista essas diferenças.

## Como usar no QA

`CLAUDE.md` regra 7 pede QA por captura de tela (claro, escuro, celular) antes de entregar tela. A
comparação é contra estas capturas **e** contra o texto da spec da página, não só contra o print.

Atenção ao mobile: o app Bubble **não tem layout móvel** (exceto parcialmente o SAC). As capturas de
390 px mostram tabelas espremidas até o texto ficar vertical. Não é o alvo a reproduzir — é o
problema a resolver.
