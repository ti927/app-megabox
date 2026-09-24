# Como ler o mapa decompilado do Bubble (grupomegabox)

Cada arquivo `pagina-*.md` / `reusable-*.md` foi gerado por `tools/decompile.py` a partir do export
`.bubble` do app. **Ele é completo**: todo elemento, condicional e workflow do app está lá. A spec
funcional que você escreve fica em cima dele — se a spec e o mapa discordarem, o mapa manda.

## Contexto do projeto

- Grupo MegaBox: empresa de logística/embalagens (caixas) que vende produtos de fornecedores a
  clientes. O app Bubble cobre cotação/orçamento → proposta → pedido → entregas → contas a receber
  e a pagar (inclusive comissões de vendedores) → metas de vendas, SAC/NPS, cadastros.
- Estamos migrando o app **completo** para Next.js (App Router, TypeScript) + Supabase (Postgres 17,
  São Paulo) + Vercel (gru1). O Bubble é a fonte do **comportamento**, não do desenho do banco:
  o banco vai ser remodelado **depois** deste mapeamento, aproveitando as otimizações que você
  apontar. Telas e fluxos continuam reconhecíveis para quem usa hoje.
- Páginas de backup fora de escopo (não linkadas em lugar nenhum): `vendas_bkp`, `vendas_bkp2`,
  `metas_bkp`, `cadastros_old`, `testes`. Não mapeie. Use-as só se precisar entender a
  evolução de uma regra.

## Notação do mapa

| Notação | Significa no Bubble |
|---|---|
| `El[nome]` | "elemento *nome*" (GetElement). `El[Página x]` = a página x |
| `Parent` | "Parent group's Thing" |
| `Ancestor[TableCrossAxis]` / `Ancestor[...]` | "Current row's / Current cell's Thing" numa Table ou RG |
| `This` | "This element" |
| `CurrentUser` | Current User |
| `Page.X` | dado de página (Current Page Width, Current date/time, Website home…) |
| `UrlParam("x" as tipo)` | Get x from page URL |
| `Search(Tipo: campo op valor AND …; sort …)` | Do a search for |
| `:mensagem(args)` | operador encadeado (`:filtered`, `:count`, `:sum`, `:format_date`…) |
| `Opt.Set.Valor` / `All(Opt.Set)` | option set |
| `ResultOfStep[id]` | Result of step X (id da ação) |
| `Param.x` / `WFParam.x` | parâmetro de backend workflow / de custom event |
| `⟂ quando COND → props` | conditional do elemento (responsivo por largura foi omitido) |
| `oculto ao carregar` | "This element is visible on page load" desmarcado |
| `SÓ SE` | "Only when" da ação |
| `USA Reusable X` | instância de reusable element (o mapa dele está em `reusable-X.md`) |
| `Plugin[id]/AAx` | elemento ou ação de plugin (ids em `integracoes.md`) |
| `apiconnector2-<api>.<call>` | chamada do API Connector (`integracoes.md`) |
| `ScheduleAPIEvent` | agenda um backend workflow (`backend-workflows.md`) |

Arquivos de apoio: `00-inventario.md` (contagens — o checksum), `data-types.md`,
`option-sets.md`, `backend-workflows.md`, `integracoes.md`.

## Regras

1. Não invente regra de negócio. Se o mapa não deixa claro, escreva **[DÚVIDA]** e siga.
2. Cite o id do workflow (`WF bTpRh`) e da ação quando descrever uma regra — é o que permite
   conferir depois.
3. Aponte o que **não** deve ser reproduzido (duplicação, workflow morto, busca repetida,
   cálculo no navegador, segredo exposto) e o que pode virar **otimização** no banco novo
   (campo calculado → view/função SQL, lista → tabela de ligação, option set → tabela, etc.).
4. Nenhum dado de cliente aparece no mapa (é só a estrutura); não tente buscar dados reais.
5. Escreva em português, direto, sem enfeite.
