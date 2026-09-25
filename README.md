# app-megabox

Reconstrução do app Bubble `grupomegabox` (Grupo MegaBox) em Next.js + Supabase + Vercel, tudo em São Paulo.

## Por onde começar

| Você quer | Leia |
|---|---|
| entender o negócio e os módulos | `specs/01-visao-geral.md` |
| trabalhar no projeto | `CLAUDE.md` (regras não negociáveis) |
| entender uma tela específica | `specs/paginas/<modulo>.md` |
| mexer no banco | `specs/02-modelo-de-dados-proposto.md` |
| começar a construir | `specs/03-plano-de-construcao.md` |
| saber onde o projeto parou | `docs/estado-do-projeto.md` |
| ler o app Bubble decompilado | `mapa/LEIA-ME.md` |

## Estado (25/09/2026)

**Mapeamento fechado.** O app Bubble está decompilado em `mapa/` e coberto por 14 specs funcionais
em `specs/paginas/` — 11 mil linhas, com a cobertura de cada workflow conferida por
`tools/conferir-cobertura.py` contra `mapa/00-inventario.md`.

**Banco especificado, não criado.** `specs/02-modelo-de-dados-proposto.md` define 58 tabelas e o
de-para dos 34 data types e 36 option sets. O projeto Supabase `megabox` existe e está **vazio** —
a regra 2 do `CLAUDE.md` proíbe tocar no banco antes do mapeamento, e cinco pendências de negócio
ainda bloqueiam a carga (`specs/04-duvidas.md` §1).

**App não iniciado.**

## Atenção

`specs/00-achados-de-seguranca.md` lista **cinco credenciais a rotacionar** no app Bubble atual e
registra que toda senha de usuário deve ser considerada comprometida. Isso não espera o corte.

As capturas de tela do app não estão neste repositório: contêm dado real de cliente e o
repositório é público. Ver `design/LEIA-ME.md`.
