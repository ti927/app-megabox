# Visão geral — app MegaBox

Escrito em 25/09/2026. É o primeiro arquivo a ler do projeto: o que a empresa faz, quem usa o quê, e
como um pedido nasce e morre. Não substitui nenhuma spec — **aponta** para elas. Detalhe de tela está
em `specs/paginas/` (14 arquivos, ~11 mil linhas), detalhe de banco em
`specs/02-modelo-de-dados-proposto.md`.

Nomes de tabela usados aqui são os canônicos de `02` §2. Nomes de página entre crases são os do
Bubble; rotas com `/` são as propostas nas §9/§10 das specs.

---

## 1. O negócio em uma página

O Grupo MegaBox vende embalagens e logística (caixas, paletes) de **terceiros**. Ele não estoca nem
fatura a mercadoria: **intermedeia**. O vendedor monta uma cotação para o cliente, pede orçamento a
vários fornecedores, escolhe um vencedor por produto, manda proposta, transforma em pedido — e o
**fornecedor entrega e fatura direto para o cliente**. A MegaBox ganha **comissão do fornecedor**
(`specs/paginas/vendas.md` §1 e glossário).

Isso atravessa o sistema inteiro e explica os nomes que parecem trocados:

| Termo na tela | O que é de verdade |
|---|---|
| **Contas a receber** (CR) | comissão que o **fornecedor** deve à MegaBox por uma entrega confirmada. Uma linha por prazo de recebimento escolhido (`vendas.md` §5.5) |
| **Contas a pagar** (CP) | comissão que a MegaBox deve ao **vendedor**: 3% da comissão da entrega (`vendas.md` §5.6, `financeiro-reusables.md` §5.4) |
| **Valor de venda** (bruto/líquido) | o que o fornecedor fatura ao cliente. Entra no sistema como base de cálculo e de relatório; esse dinheiro **não** passa pela MegaBox |
| **Faturado / realizado** nas metas | comissão realizada no período, não receita de mercadoria (`metas.md` §5) |

Duas empresas emissoras convivem na mesma base: Megabox e Paletes Brasil (`02` §2,
`empresas_emissoras`).

Dois avisos que mudam a leitura de qualquer número:

- **"Líquido" hoje não é líquido.** O cálculo de ICMS e PIS/COFINS do Bubble roda sobre um campo
  excluído e dá sempre zero, então `ValorVendaLiquido = ValorVendaBruto` em toda a base. A migração
  não pode recalcular o histórico sem mudar números que o negócio vê (`04` §1, bloqueio B5).
- **Dinheiro é calculado no navegador e gravado por auto-binding**, sem workflow, sem transação e sem
  autoria (`00-achados-de-seguranca.md`, resumo). No app novo isso vira função SQL com teste
  (`CLAUDE.md` regra 10).

---

## 2. Os módulos

| Módulo | O que resolve | Bubble | Spec | Rota proposta |
|---|---|---|---|---|
| **Acesso e casca** | login, sessão, menu lateral, engrenagem, configuração de sistema e de usuário, cadastro de usuários, permissões de página | `index`, `reset_pw`, `loginrealizado`, `tool.Cabecalho`, `tool.MenuPaginas`, `tool.MenuConfig`, `pop.ConfigSistema`, `pop.ConfigUsuario`, `pop.CadastroUsuarios` | `inicio-e-acesso.md`, `casca-e-configuracao.md` | `/login`, `/nova-senha`, `app/(app)/layout.tsx`, `/config/perfil`, `/admin/usuarios`, `/admin/configuracoes` |
| **Painel inicial** | apesar do nome, não é painel de indicadores: é o pivô de comissões por fornecedor e mês | `inicio` | `inicio-e-acesso.md` §1.2 | `/inicio` |
| **Cadastro cliente/fornecedor** | lista-mestra de `grupos_clifor`, carteira do vendedor, ativo/bloqueio, anexos | `cadastros`, `pop.CadastroCliFor`, `pop.BloquearClifor`, `pop.AnexosClifor` | `cadastros.md` | `/cadastros` |
| **Endereços e contatos** | filiais (`enderecos_clifor` — onde moram CNPJ, inscrições e regime tributário) e contatos; escolha de origem/entrega/cobrança na linha de orçamento | `pop.AgendaEnderecos`, `pop.AddEditaEndereço`, `pop.AgendaContatos`, `pop.AddEditaContato`, `tool.EnderecoCobranca/Entrega/Fornecedor` | `enderecos-e-contatos.md` | diálogos sobre `/cadastros` |
| **Produtos** | produto (modelo), tipo, grupo e os fornecedores que o fornecem | `pop.CadastroProdutos` | `cadastros.md` §1.3 | `/produtos` |
| **Ciclo comercial** | o kanban: cotação → proposta → pedido → entregas → confirmação | `vendas`, `pop.AnexaNf`, `pop.ArquivaCotação`, `pop.AddEdita Produtos` | `vendas.md` | `/vendas` |
| **Financeiro** | CR e CP: filtro, cobrança, baixa, recibo, estorno, arquivamento | `financeiro`, `pop.EditaContasReceberNew`, `pop.EditaContasReceber`, `pop.HistoricosContaReceber` | `financeiro.md`, `financeiro-reusables.md` | `/financeiro` |
| **Metas e comissão** | meta mensal por vendedor, realizado, ranking, fechamento e comissão | `metas` | `metas.md` | `/metas`, `/metas/entregas` |
| **Histórico e follow-up** | conserto de um pedido inteiro no lugar (a ferramenta de correção) e a agenda de interações com o cliente | `historico`, `historico_full`, `tool.Historico` | `historico.md` | `/pedidos/[numero]/followup`, `/crm/historico`, `/historico?numpedido=` (compatibilidade) |
| **SAC e NPS** | chamados de pós-venda, indicadores, campanhas NPS, leitura do pós-venda | `sac`, `pop.HistoricoConversas`, `pop.RespostasEmails` | `sac.md` | `/sac/chamados`, `/sac/relatorios`, `/sac/pesquisas`, `/sac/pos-venda` |
| **Formulários públicos** | o cliente final responde, sem login | `formulariovenda`, `formularionps` | `formularios-publicos.md` | `/pesquisa/[token]` (+ rotas de compatibilidade) |
| **Relatórios** | matrizes de entrega por produto, cliente e fornecedor, e dois relatórios em bloco HTML | `relatorios` | `relatorios.md` | `/relatorios` |
| **Manutenção** | 38 botões de correção em massa; não é tela de operação | `rotinas` | `rotinas.md` | `/admin/rotinas` |

Fora de escopo (páginas de backup não linkadas): `vendas_bkp`, `vendas_bkp2`, `metas_bkp`,
`cadastros_old`, `testes` (`CLAUDE.md`).

---

## 3. Perfis e o que cada um faz

### 3.1 Os quatro perfis (`Opt.PerfilUsuario`, atributo `hierarquia`)

| Perfil | Hierarquia | O que faz de fato |
|---|---|---|
| **Diretor** | 1 | Tudo. É o único que edita vencimento, prazo e valor de parcela de CR/CP, apaga parcela e estorna baixa (`financeiro-reusables.md` §1); edita cotação arquivada e reabre entrega já no Financeiro (`vendas.md` §1); cancela fechamento de meta (`metas.md` §4.12); é o perfil declarado da página de Manutenção (`rotinas.md` §1) |
| **Gerente** | 2 | Acompanha: vê o kanban e as metas de todos os vendedores. Não edita o financeiro |
| **Analista** | 3 | Vendedor. No kanban a URL recebe `vendedor=<próprio id>` e o filtro fica travado nele (`vendas.md` §1) |
| **Operador** | 4 | Mesmo tratamento do Analista. Em `relatorios` **vê a empresa inteira**: não há filtro por vendedor em lugar nenhum da página (`relatorios.md` §1) |

### 3.2 Os quatro departamentos (`Opt.DeptoUsuario`)

As chaves do Bubble mentem. Ao ler o mapa ou escrever a carga, use esta tabela
(`mapa/option-sets.md`):

| Rótulo | Chave no Bubble | Abrange |
|---|---|---|
| Comercial | **`licita__o`** | Vendas, Marketing, P&D, Qualidade |
| Financeiro | `financeiro` | Finanças, contábil, contas a pagar/receber, cobrança |
| Operação | **`geral`** | Estoque, logística, conferência, frota |
| Administrativo | `diretoria` | RH, Compras, TI, Jurídico, Processos |

Armadilha: `diretoria` é a chave do **departamento Administrativo** em `Opt.DeptoUsuario` **e** a
chave do **perfil Diretor** em `Opt.PerfilUsuario`. São option sets diferentes com a mesma chave; a
carga resolve cada ponteiro pelo seu set (`02` §2.1.7, coluna `chave_bubble`).

### 3.3 O que o Bubble controla hoje: praticamente nada

- **Única checagem do app inteiro:** `tool.Cabecalho` WF bTKRG desloga quem tem `Ativo = false`.
  Perfil e departamento nunca são conferidos (`casca-e-configuracao.md` §1).
- **O menu é a "autorização".** O link de cada página nasce `link_disabled=True` e só é habilitado se
  a linha de `Tbl.ConfigSistema` daquela página listar o departamento, o perfil ou o próprio usuário.
  É um link desabilitado, não uma guarda: quem digita a URL entra (`metas.md` §1, `sac.md` §1,
  `relatorios.md` §1, `financeiro.md` §1).
- Os atributos `hierarquia` e `DepartamentosAcessiveis` de `Opt.MenuPaginas` existem e **ninguém os
  lê** (`02` §9).
- Dentro das telas, as travas são condicionais de elemento (`button_disabled`, ícone cinza) e estado
  de cliente — alteráveis pelo devtools. Há campo desabilitado que grava de qualquer forma, porque
  tem auto-binding (`financeiro-reusables.md` §1).
- Duas condicionais liberam acesso por **nome próprio fixo** em código (`00` §3.10).
- E abaixo de tudo isso: 18 das 34 tabelas sem regra de privacidade nenhuma, as outras 16 com
  `everyone`/`view_all`, e a Data API exposta — o dado é legível sem login (`00`, resumo).
- Uma correção da referência visual: as páginas internas **redirecionam para a `index`** sem sessão.
  Isso é proteção do próprio Bubble, não do app; não há workflow que faça (`04` §2).

### 3.4 O que o app novo impõe

Autorização de verdade, no servidor: `permissoes_pagina` (a tabela que substitui a liberação por
option set no navegador) mais as funções `fn_pode_acessar_pagina(slug)`, `fn_tem_hierarquia(n)` e
`fn_usuario_ativo()`, todas `security definer` com `search_path = ''`, usadas pelas policies das
demais tabelas. RLS ligada em **toda** tabela desde a primeira migration, com policy explícita
(`00` §3.1–3.2, `02` §7, fatia 0 de `02` §11). O grupo de rotas `app/(app)/` carrega sessão, perfil e
menu já filtrado no layout (`inicio-e-acesso.md` §10).

---

## 4. O fluxo principal, ponta a ponta

```
cadastro do cliente
      │
      ▼
   COTAÇÃO ──── orçamento por fornecedor (1 por filial de origem) ──── vencedor (1 por item)
      │
      ▼
   PROPOSTA (cópia congelada dos vencedores) ──► PDF + e-mail ao cliente
      │
      ▼
   PEDIDO ──► formalizar: PDF + e-mail ao fornecedor e ao cliente
      │
      ▼
   ENTREGAS (uma por remessa de um item)
      │
      ├─ "saiu para entrega": NF, boletos → Em Entrega
      │
      ▼
   CONFIRMAÇÃO DA ENTREGA  ◄── é aqui que o dinheiro nasce
      │
      ├──► CONTAS A RECEBER: 1 parcela por prazo, comissão ÷ N  → cobrança → baixa → recibo
      │
      └──► CONTAS A PAGAR: 3% da comissão da entrega, vence dia 5 do mês seguinte
                    │
                    ▼
            META FECHADA (congela o realizado do período) ──► comissão do vendedor
```

Etapa por etapa. "Dispara" é o que acontece sem ninguém pedir.

| # | Etapa | Quem | Onde | O que grava | Dispara |
|---|---|---|---|---|---|
| 1 | Cadastro do cliente | Vendedor | `cadastros`, ou "Novo Cliente" dentro de `vendas` | `grupos_clifor` + primeira filial `enderecos_clifor` + `contatos_clifor` | — (`cadastros.md` §1, `enderecos-e-contatos.md` §1) |
| 2 | Cotação | Vendedor | popup "Nova Cotação" em `vendas` | `cotacoes` + uma `cotacao_itens` por produto do carrinho; número = último + 1 | nada. O carrinho fica em `User.TempOrcamentoProdutos` até gravar (`vendas.md` §4.2) |
| 3 | Orçamento por fornecedor | Vendedor marca as filiais fornecedoras | popup de fornecedores, dentro do carrinho | uma `orcamentos_fornecedor` por filial de origem | backend `AdicionarFornecedores`: ICMS pela tabela `IcmsEstados` (UF destino × UF origem) e PIS/COFINS 9,25% **só** quando origem **e** destino são Lucro Real/Presumido. Se só a origem é, **nenhum orçamento é criado** (`vendas.md` §4.3, bug) |
| 4 | Vencedor | Vendedor | troféu na linha do orçamento | `vencedor` num orçamento por item | desmarca o vencedor anterior do mesmo item (`vendas.md` §4.3) |
| 5 | Proposta | Vendedor | popup "Propostas do Cliente" | `propostas` + **cópia congelada** dos orçamentos vencedores (`proposta_itens`) — snapshot proposital, não recalcula depois (`02` §1.6) | gera o PDF e **envia o e-mail ao cliente mesmo nos botões "Gravar"/"Salvar"**, porque a condição de envio nunca é lida (bTnvj0 — bug, `vendas.md` §4.5); grava `historicos` |
| 6 | Pedido | Vendedor, sobre proposta **enviada** | mesmo popup → "Pedido ao Fornecedor" | `pedidos` + itens copiados da proposta; `cotacoes.etapa = Pedir`, e o cartão sai da coluna Cotação | — (`vendas.md` §4.6) |
| 7 | Formalizar o pedido | Vendedor (marca o checkbox) | popup do pedido | prazos, e-mails, arquivo da OC, `pedido_formalizado`. A forma de pagamento **não** é gravada quando formaliza (bug) | PDF; e-mail ao fornecedor e, 15 s depois, ao cliente; e põe **todas** as entregas do pedido em `Pedido`, inclusive as já em Financeiro — a cada reenvio (`vendas.md` §4.6, risco) |
| 8 | Agendar entregas | Vendedor | popup do pedido, por item | uma `entregas` por remessa, com data prevista e vendedor = **criador da cotação** | substituto de férias: se o período de férias do vendedor contém a data prevista, grava o substituto (bTyAt, `vendas.md` §4.6) |
| 9 | Saiu para entrega | Vendedor / Operação | `pop.AnexaNf`, por entrega | NF do fornecedor, arquivo, boletos → `StatusEntrega = Em Entrega` | e-mail opcional NF+boleto ao cliente (`vendas.md` §4.7) |
| 10 | **Confirmar a entrega** | Vendedor | popup "Confirma entrega" | data real, comprovante, `StatusEntrega = Financeiro` | **o gatilho do dinheiro**: `CriarContasReceber` cria uma CR por prazo escolhido (comissão ÷ N, sem arredondar) e `CriarContasPagar` cria a CP do vendedor (3%, vence dia 5 do mês seguinte). Diretor pode reabrir e gravar de novo, criando **outra** CP (`vendas.md` §4.8 e §5.5–5.6, bug) |
| 11 | Cobrança | Financeiro | `financeiro` | número de cobrança + PDF | e-mail ao fornecedor com as CRs selecionadas (`financeiro.md` §4.3) |
| 12 | Baixa da CR | Financeiro | `financeiro` | baixa com NF MegaBox anexada **ou** recibo numerado gerado pelo sistema | e-mail opcional do recibo ao fornecedor (`financeiro.md` §4.4–4.5) |
| 13 | Fechar a meta | Diretoria / Gerência | `metas` | `metas_fechadas` congela o realizado e a comissão do período e carimba as entregas | cria **outra** `contas_pagar`, com o valor que estava no input da tela, vencimento +10 dias (`metas.md` §4.11) |
| 14 | Pagar a comissão | Financeiro | `financeiro` | baixa da CP | relatório de comissões a pagar por e-mail (`financeiro.md` §4.6–4.7) |
| 15 | Finalizar o pedido | Vendedor | cartão de pedido em `vendas` | `pedido_finalizado` em todas as entregas e no pedido | e-mail pós-venda com o link do formulário público de avaliação (`vendas.md` §4.6, `formularios-publicos.md` §1.1) |

### 4.1 Quatro coisas que só se vê olhando o fluxo inteiro

1. **Existem duas origens de conta a pagar.** A etapa 10 cria uma CP por entrega (3%) e a etapa 13
   cria outra CP pelo fechamento da meta. As duas sobrevivem, e a mesma entrega pode ser fechada na
   meta Regular de um vendedor **e** na de Substituição de outro: comissão em dobro
   (`metas.md` §8.3). O modelo novo corrige com `unique (entrega_id, vendedor_id)` em `contas_pagar`
   e um índice único em `meta_fechada_entregas (entrega_id)` (`02` §3.5). Como as duas origens
   conversam depois disso é ponto a fechar com o Financeiro.
2. **Cancelar não estorna.** Cancelar uma entrega zera a quantidade mas não recalcula os valores; a
   comissão fica gravada. Cancelar o pedido cancela todas as entregas e **não estorna** CR nem CP de
   entregas que já estavam em Financeiro (`vendas.md` §4.9, risco).
3. **Só `Financeiro` conta como realizado**, por igualdade. Entrega que avança para `Concluído`
   **desaparece** do realizado das metas e dos relatórios (`04` §3).
4. **A numeração se repete.** `CotacaoNum` é "último + 1" de uma busca sem ordenação (sujeito a
   corrida) e `NumeroPedido` é o `CotacaoNum` como texto — então vários pedidos da mesma cotação têm
   o mesmo número, e é isso que impede `unique` em `pedidos.numero` (`vendas.md` §5.7, `02` §8.2).

---

## 5. Os fluxos secundários

**Cadastro de cliente/fornecedor e produto.** Um `grupos_clifor` é cliente **ou** fornecedor pelo
campo `tipo`; a filial (`enderecos_clifor`) é quem tem CNPJ, inscrições e regime tributário — e o
regime é o que decide se o orçamento leva ICMS. Produto tem tipo, grupo e a lista de fornecedores que
o fornecem. `cadastros.md`, `enderecos-e-contatos.md`.

**Cobrança e baixa.** Seleção de CRs → PDF + e-mail ao fornecedor com número de cobrança; depois
baixa com NF MegaBox ou recibo numerado automático. Hoje a baixa é um punhado de colunas que o
cancelamento apaga sem rastro, inclusive de comissão já declarada em recibo; no modelo novo `baixas`
e `estornos` são tabelas próprias (`financeiro.md` §4.3–4.6, `financeiro-reusables.md` §4,
`02` §2.1.3).

**SAC e pesquisa de satisfação.** Chamados de pós-venda com interações e e-mail opcional ao cliente;
campanhas NPS que criam a resposta **antes** de enviar o convite; e a leitura das respostas do
pós-venda automático. O formulário que o cliente responde é público, sem login, hoje endereçado pelo
id do registro na URL. `sac.md`, `formularios-publicos.md`.

**Histórico e follow-up.** Duas coisas com o mesmo nome: a página `historico` ("FollowUp de
Pedidos") é a ferramenta de **conserto** — abre um pedido inteiro pelo número e corrige qualquer
registro da árvore em cascata, sem passar pelos fluxos de `vendas` e `financeiro`; o painel
`tool.Historico` é a **agenda do vendedor**, com as interações com o cliente e o disparo de e-mail
de prospecção. `historico.md`.

**Metas.** Meta mensal por vendedor (Regular ou Substituição), nível do vendedor, acompanhamento do
atingimento, ranking e fechamento. Fechar a meta é a operação mais importante da página e hoje roda
inteira no navegador, sem transação. `metas.md`.

**Relatórios.** Três matrizes de entrega (produto × cliente × fornecedor, cliente × mês,
fornecedor × mês) montadas **no navegador** a partir de um texto achatado — a aba "Outros
Relatórios" hoje estoura por timeout e não funciona. Mais dois relatórios em bloco HTML autocontido
que nenhum workflow alimenta. `relatorios.md`, `04` §2.1.

**Manutenção.** 38 botões de correção em massa, backfill e exclusão sobre tabelas inteiras, quase
sempre sem filtro, sem confirmação e sem log. É a página mais perigosa do app. No novo, rotina
destrutiva só com trava tripla: perfil, confirmação explícita e dry-run com relatório. `rotinas.md`,
`00` §3.9.

---

## 6. O que muda do Bubble para o app novo

O Bubble é a fonte do **comportamento**, não do desenho do banco. A lista curta do que deixa de ser
como é hoje — o detalhe está em `specs/00-achados-de-seguranca.md` §3 e em `02`:

1. **Autorização de verdade**, no servidor: `permissoes_pagina` + funções de RLS, no lugar do link de
   menu desabilitado (`00` §3.2).
2. **RLS em toda tabela desde a primeira migration**, com policy explícita (`00` §3.1, `02` §7).
3. **Dinheiro só no servidor**, em `numeric`, dentro de transação e com teste: comissão, meta,
   parcela e ICMS. Nunca a partir do valor que veio da tela (`00` §3.5, `02` §5).
4. **Zero senha e zero segredo no banco.** Supabase Auth; credencial em variável de ambiente; token
   de integração em tabela sem policy (`00` §3.3–3.4).
5. **Auditoria imutável.** `historicos` append-only: correção é nova linha, não `UPDATE`. Hoje editar
   um histórico sobrescreve o texto e troca o autor (`02` §2.1.4).
6. **Arquivo em bucket privado**, com URL assinada de vida curta. Hoje NF, boleto, contrato social e
   documento pessoal abrem por URL de CDN sem autenticação (`00` §3.6, `02` §1.8).
7. **Formulário público por token opaco**, com prazo e uso único, no lugar do id do registro na URL
   (`00` §3.8).
8. **Relatório agregado em SQL**, por RPC, no lugar de ~90 KB de JavaScript somando no navegador
   (`02` §5).
9. **Campo calculado sai da tela:** coluna gerada, view ou trigger. Snapshot (proposta e pedido)
   continua sendo snapshot, de propósito (`02` §1.6).
10. **Listas do Bubble desaparecem:** viram FK ou tabela de ligação (`02` §1.5).

Cinco perguntas ainda **bloqueiam a carga de dados** (unicidade de documento e de nome de produto,
regra oficial do ranking, escala das comissões do nível, se os 3% são fixos, e as fórmulas reais de
ICMS/PIS-COFINS). Estão em `02` §8.1 e `specs/04-duvidas.md` §1. Onde uma regra é dúvida aberta,
siga a recomendação padrão registrada na spec de origem — não escolha em silêncio.

---

## 7. Como navegar a documentação

Leia por seção, nunca o arquivo inteiro: `mapa/pagina-vendas.md` tem ~2.500 linhas e
`specs/paginas/vendas.md` ~900 (`CLAUDE.md`, economia de contexto).

| Se você quer… | Leia, nesta ordem |
|---|---|
| **entender o sistema** | este arquivo; depois a §1 da spec do módulo que interessa |
| **entender uma tela** | `specs/paginas/<modulo>.md`: §1 (propósito e acesso), §2 (estrutura), §4 (workflows), §5 (fórmulas), §8 (o que não reproduzir). A aparência está em `specs/bubble/02-telas-e-design.md`, com as imagens em `design/capturas/` |
| **conferir uma regra de negócio** | `mapa/pagina-*.md` / `mapa/reusable-*.md` pelo id do workflow que a spec citou. **O mapa manda**; `mapa/LEIA-ME.md` tem a notação |
| **mexer no banco** | `02` §1 (convenções) → §2 (nomes canônicos e decisões) → §3 (esquema, por módulo) → §4 (listas fixas) → §5 (views e funções) → §6 (índices) → §7 (RLS) → §10 (de-para Bubble→novo) |
| **construir uma tela** | `02` §11 (ordem das fatias; a fatia 2 é a tela-modelo) + a §9/§10 da spec da página, que já traz rotas, server actions e arquivos |
| **saber o que está inseguro** | `specs/00-achados-de-seguranca.md`: §1 age agora, §2 fecha antes do corte, §3 o que o app novo impõe |
| **saber o que ainda não foi decidido** | `specs/04-duvidas.md`: §1 bloqueios, §2 o que a referência visual respondeu, §3 dúvidas repetidas em várias specs, §4 por tema |
| **saber a ordem do trabalho e o corte** | `specs/03-plano-de-construcao.md` (em produção) e `docs/plano-de-migracao.md`, que traz o que deu errado no app_capital |
| **saber onde o projeto parou** | `docs/estado-do-projeto.md` |
| **ver o banco atual** | `mapa/data-types.md` (34 data types, 444 campos), `mapa/option-sets.md` (36), `mapa/backend-workflows.md` (28), `mapa/integracoes.md`, e as contagens de checksum em `mapa/00-inventario.md` |
