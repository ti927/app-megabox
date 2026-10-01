# 07 — Desempenho da ficha de vendas e aviso de ação

Frente `w/perf` (01/10/2026). Decisões tomadas e por quê. As medições são reproduzíveis com
`node scripts/medir-ficha-vendas.mjs` (só leitura) e, no navegador, com `SUPABASE_LOG_TEMPO=1`.

## 1. Causas

**Lentidão (carrinho, troféu, enviar proposta).** Toda action da ficha fazia `revalidatePath('/vendas')`.
Isso re-renderizava layout + página + a ficha INTEIRA: ~37 consultas em rajada por clique (cabeçalho →
9 consultas → contatos, mais as 7 listas dos selects, as opções e o usuário três vezes). Propostas,
pedidos e o documento passam pela RLS em cascata (propostas → cotações → entregas…): o plano tem
milhares de subplanos e só o **planejamento** custa 90–190 ms de CPU por consulta. No Micro, a rajada
enfileira e as consultas passam de 8 s.

**"Parte desta cotação não carregou…".** Era o 57014 (statement timeout) dessas consultas na rajada —
visto no log do Postgres e reproduzido no navegador (propostas/pedidos/documento com 500 em 8–16 s).

**Lista de propostas sumindo depois de enviar.** O envio revalidava; a releitura de propostas caía
em 57014 e a ficha trocava a lista por `[]` ("Nenhuma proposta"). Se o que caía era o cabeçalho,
`buscarFicha` devolvia `null` e a tela dizia "Esta cotação não existe ou não é sua".

## 2. Números (mesma cotação de teste, LURE CLIENTE nº 5049, build de produção local)

| Clique | Antes | Depois |
|---|---|---|
| Abrir a ficha (aba Cotação) | 7,0–10,0 s · 38 consultas | 0,7–1,4 s · 30 consultas |
| Troféu (marcar/desmarcar) | 8,0–13,2 s · 37 consultas, com 57014 | 0,6–1,0 s · 9 consultas |
| Quantidade do item | 12,5–19,0 s · 37 consultas, com 57014 | 0,7–0,8 s · 9 consultas |
| Aba Propostas | não carregou (57014) | 1,9 s · 21 consultas |

`medir-ficha-vendas.mjs`, perfil 1: "antes" (rajada do revalidate) mediana 1,7 s e máx 9,2 s;
"depois" (carrinho relido) mediana 0,47 s.

## 3. Decisões

1. **As actions do carrinho não revalidam.** `adicionarItem`, `adicionarOrcamento`, `definirVencedor`,
   `alterarQtdItem`, `editarItem`, `excluirItem`, `editarOrcamento` e `excluirOrcamento` devolvem
   `carrinho` (itens + orçamentos relidos, 3 consultas). A tela troca só isso (`aplicarCarrinho`).
   Arquivar, desarquivar e "Pedido de Amostra" continuam revalidando (mudam o cabeçalho e são raros).
   Gravar, descartar e criar fecham a ficha, e fechar já refaz o quadro.
2. **A ficha é lida por partes** (`lib/vendas-ficha.ts`, `consultas.ts`). Todas as partes saem em
   paralelo, a partir do id da cotação. Na aba Cotação só vão carrinho, orçamentos e destinos;
   propostas, pedidos, entregas, contatos e documento só vão com a aba deles. **A aba está na URL**
   (trocar de aba navega), então a releitura depois de uma action do fluxo traz as partes certas.
3. **Parte que falha não vira lista vazia.** Erro transitório tem uma retentativa. Se falhar de novo,
   a tela fica com o último valor bom da parte (`mesclarFicha`), avisa qual parte não carregou e
   oferece "Tentar de novo" (relê no servidor, sem recarregar a página). Cabeçalho que cai num
   refresh mantém a ficha que está na tela; na primeira abertura, a mensagem é "não carregou agora",
   e não "não existe".
4. **O troféu é otimista** (mesma regra de `fn_definir_vencedor`). O banco confirma; recusa sem
   carrinho relido desfaz o troféu.
5. **As listas dos selects** (produtos, condições…) são pedidas uma vez por sessão da tela, não mais
   a cada render.
6. **`usuarioAtual` com `cache`** (uma leitura por requisição) e `exigirAcesso` com a RPC em
   paralelo. Antes eram 3× getUser + usuarios por render.
7. **Sem migration.** Os índices já cobrem as consultas. O custo restante é o planejamento da RLS em
   cascata (ver §5).

## 4. Aviso de ação (toast)

`componentes/aviso-acao.tsx`, montado no layout `(app)`. API:

- `useAcao().executar(rotulo, fn)` — para fluxos que não são `useActionState`;
- `useActionStateComAviso(acao, rotulo | (form) => rotulo)` — troca direta de
  `useActionState(acao, {})`.

O "Salvando…" entra numa microtarefa para escapar do escopo da transição. Sem isso, dentro de uma
action ele só apareceria no fim.

Já aplicado: carrinho, orçamentos, troféu, quantidade, gravar/descartar/amostra, arquivar
(vendas), cadastros (grupo, filial, contato, anexos), financeiro (baixas, cobrança, estorno, arquivo,
entrega) e SAC (chamado, interação, pesquisa, convites).

**Pendente — fluxo (proposta, pedido, entregas).** Esses arquivos são da frente `w/proposta` e não
foram tocados aqui. Para aplicar, troque em `proposta-tela.tsx`, `pedido-tela.tsx` e `entregas.tsx`
`useActionState(salvarProposta, {})` por
`useActionStateComAviso(salvarProposta, (f) => (f.get('acao') === 'enviar' ? 'Enviando proposta…' : 'Gravando proposta…'))`,
e assim por diante (criarProposta "Criando proposta…", criarPedido "Transformando em pedido…",
salvarPedido "Gravando pedido…", entregas "Gravando entrega…"). As actions de `acoes-fluxo.ts`
continuam revalidando. Com a ficha por partes e a aba na URL, isso agora custa uma releitura da
página sem o quadro, e uma parte que cair mantém o valor anterior.

## 5. Pendências

- **RLS em cascata.** As policies de leitura das tabelas filhas (`propostas`, `proposta_itens`,
  `pedidos`, `pedido_prazos`, `orcamentos_fornecedor`, `cotacao_itens`) fazem `EXISTS` em `cotacoes`,
  que tem 4 policies, duas com `EXISTS` em `entregas`, que também tem RLS. Uma consulta de 1 linha de
  pedidos gasta ~190 ms só planejando. Reescrever com função auxiliar é mudança de segurança e
  precisa da suíte RLS e de medir os relatórios (que varrem milhares de linhas). Fica para uma frente
  própria.
- `acoes-fluxo.ts` ainda revalida a página a cada gravação do fluxo (ver §4).
