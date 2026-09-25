# Dúvidas consolidadas

226 itens `[DÚVIDA]` levantados pelas 14 specs de `specs/paginas/`, reunidos aqui por tema e por
urgência. Cada spec já traz a **recomendação padrão** do seu item; este arquivo não a repete —
aponta para a origem.

Como ler o status:

| Status | Significa |
|---|---|
| **BLOQUEIA** | nenhuma migration de dado roda antes da resposta |
| **RESPONDIDA** | a referência visual (`specs/bubble/02-telas-e-design.md`) ou o próprio mapa respondeu |
| **DECIDIDA** | `specs/02-modelo-de-dados-proposto.md` já arbitrou; a resposta pode reverter a decisão |
| **ABERTA** | segue a recomendação padrão da spec de origem até alguém dizer o contrário |

Regra que continua valendo (`mapa/LEIA-ME.md`): **o mapa manda**. Onde a resposta de negócio
contradisser o mapa, o que muda é o app novo, não a leitura do app velho.

---

## 1. As que bloqueiam a carga (eram cinco, são quatro)

Repetidas de `specs/02-modelo-de-dados-proposto.md` §8.1, porque é aqui que se procura.

| # | Pergunta | Origem | O que trava |
|---|---|---|---|
| B1 | CNPJ/CPF deve ser único? E nome de produto dentro do grupo? | `cadastros` 9 e 10 | **MEDIDO em 25/09** — ver §1.1. Há 283 documentos repetidos. Continua bloqueando: agora é decisão, não incógnita |
| B2 | Qual é a regra oficial de `RankingVendas`? | `relatorios` 7, `metas` 3 | define `v_ranking_metas`. As duas páginas calculam diferente hoje |
| B3 | Em que escala estão `ComissaoPadrao` e `ComissaoMetaBatida` — 0,10 é 10% ou 0,10%? | `metas` 7 | define o tipo e a conversão de `niveis_vendedor` |
| B4 | Os 3% da comissão do vendedor são fixos para todos? | `financeiro-reusables` 23, `rotinas` 7 | se vierem do nível, `contas_pagar.percentual` deixa de ser default e vira lookup |
| ~~B5~~ | ~~Quais são as fórmulas reais de ICMS e PIS/COFINS?~~ **RESOLVIDA em 25/09/2026** | `financeiro-reusables` 21, `enderecos-e-contatos` 9, `vendas-reusables` 10.1 | Não bloqueia mais. Ver abaixo |

### 1.1 B1 e B6 medidos contra a base real (25/09/2026)

`node tools/conferir-conflitos.mjs` baixa os tipos pela Data API e conta. O relatório
completo fica em `bruto/00-conflitos.md`, fora do git. O que ele achou:

**B1 — `enderecos_clifor.documento` NÃO pode ser único como está.**

| | |
|---|---:|
| Endereços (filiais) | 5.840 |
| Com documento preenchido | 5.814 |
| Documentos distintos | 5.470 |
| **Documentos repetidos** | **283** |
| Linhas envolvidas | 627 |
| Documento com tamanho ≠ 11 e ≠ 14 | 23 |

Um caso chama atenção: **20 endereços com o documento `"·"` (1 caractere)** — lixo de
cadastro, não CNPJ. Os outros 282 são repetições legítimas de 2 ou 3 filiais com o mesmo
documento, que é o padrão de "mesma empresa cadastrada duas vezes".

Três caminhos, e a escolha é de negócio:
1. **Documento não é único.** Aceita o que existe, e a deduplicação vira trabalho contínuo
   do Comercial. Menor atrito, mantém o defeito.
2. **Deduplicar antes da carga.** 283 casos para revisar — factível, mas ninguém pode fazer
   isso sem conhecer os clientes.
3. **Índice único parcial, só entre ativos** (`where ativo`). Resolve o caso comum (a
   duplicata costuma estar inativa) sem exigir mutirão. **É a recomendação.**

Em qualquer caso, os 23 documentos com tamanho inválido reprovam no
`check documento_bate_com_tipo` de `02` §3.2 e precisam de tratamento na carga: ou o check
afrouxa, ou a linha entra com documento nulo e um aviso.

**B1 — `produtos (nome, grupo_id)`:** 11 combinações repetidas. Volume pequeno, dá para
deduplicar antes da carga.

**B6 — RESOLVIDA. Não era decisão, era dado.** As 22 linhas de `ConfigSistema` trazem 14 de
permissão, que são a matriz real em produção hoje:

| Alvo | Tipo | Departamentos | Perfis |
|---|---|---|---|
| Inicio | página | Administrativo, Financeiro | Diretor |
| Fluxo de Vendas | página | Administrativo, Financeiro, Comercial, Operação | Diretor |
| Fluxo Financeiro | página | Administrativo, Financeiro | Diretor, Analista |
| Metas & Vendas | página | Administrativo, Financeiro, Comercial, Operação | Diretor |
| Manutenção | página | — | — (2 usuários nomeados) |
| Relatórios | página | — | Diretor |
| Suporte de Vendas & Nps | página | — | Diretor (+2 usuários nomeados) |
| Configurações de Usuário | config | — | Diretor, Gerente, Analista, Operador |
| Cadastro Usuários | config | — | Diretor, Gerente, Analista |
| Cliente / Fornecedor | config | Administrativo | Diretor, Gerente, Analista, Operador |
| Cadastro Produtos | config | — | Diretor, Gerente, Analista |
| Configurações de Sistema | config | — | Diretor |
| FollowUp de Pedidos | config | — | Diretor |

Duas observações que mudam o seed de `permissoes_pagina`: **Relatórios aparece duas vezes**
(linha duplicada no Bubble, mesma regra), e **Manutenção não tem perfil nem departamento** —
o acesso é por dois usuários nomeados. Como `/rotinas` é a página que dispara rotinas
destrutivas, manter a concessão nominal é o comportamento certo, e não o padrão de "perfil 1".

### Armadilha achada ao medir

A Data API devolve os campos pelo **nome de exibição** (`cpo.CnpjCpf`), não pelo id interno
(`cpo_cnpjcpf_text`) que `mapa/data-types.md` e o de-para de `02` §10 usam. Ler pelo id
devolve `undefined` em silêncio — a primeira execução deste relatório informou "zero
conflito" justamente porque não leu nada. **O carregador da Fase C tem de mapear por nome de
exibição**, e qualquer contagem que dê zero merece desconfiança antes de comemoração.

---

### B5 foi respondida pela leitura do mapa — e a resposta era o contrário

Registrado porque o erro custou caro e pode voltar. Três specs (`financeiro-reusables` 21,
`enderecos-e-contatos` 9 e, por propagação, `02` e este arquivo) concluíram que o ICMS e o
PIS/COFINS eram calculados sobre **campo excluído** e davam **sempre zero**, logo que
`ValorVendaLiquido = ValorVendaBruto` em toda a base. **Isso está errado.**

A causa: os ids `cpo_tributos_number` e `cpo_tributopiscofinsb_number` são usados por **dois** data
types. Em `Tbl.MetasFechadas` eles são `TotalBonusExtra - deleted` e `TotalComissaoVendedor`; em
`Tbl.OrcFornecedoresCotacao` são `TributosICMS` e `TributoPISCOFINS`, e **não estão excluídos**. O
decompilador rotulou os campos do orçamento com os nomes da meta, e o "- deleted" veio junto.

A prova está em `mapa/backend-workflows.md`, `AdicionarFornecedores` (bTNri): num `NewThing` de
`Tbl.OrcFornecedoresCotacao`, ele grava nesses campos a alíquota de ICMS buscada em
`Tbl.IcmsEstados` por UF de origem × destino, e `0.0925` de PIS/COFINS. Ninguém grava alíquota num
campo morto.

`specs/paginas/vendas.md` tinha isto certo desde o começo, na nota de campos do cabeçalho.
`specs/paginas/vendas-reusables.md` [DÚVIDA 10.1] levantou o conflito, o que permitiu conferir.

**Lição para as próximas leituras do mapa:** um campo marcado `- deleted` pode ser só o nome de
outro data type que divide o id. Confira sempre **quem grava** nele antes de concluir que está
morto — `mapa/LEIA-ME.md` regra 2 existe para isso.

**O que sobrou aberto, e é menor:** os 9,25% estão chumbados em dois lugares e precisam de
parâmetro com vigência; e falta confirmar o que deve acontecer quando origem e destino não são
ambos Lucro Real/Presumido, caso em que as alíquotas hoje ficam vazias e os tributos dão zero
(`vendas` 3). Nenhum dos dois bloqueia a carga.

---

## 2. Respondidas pela referência visual

`specs/bubble/02-telas-e-design.md` (Claude in Chrome) viu as telas renderizadas e fechou dúvidas
que o mapa decompilado não alcançava, porque o Bubble não exporta o conteúdo de bloco HTML.

| Dúvida | Origem | Resposta |
|---|---|---|
| O que mostram `HTML A`, `HTML C` (só Diretor) e `HTML D` de metas? | `metas` 10 | `HTML A` = **Análise de Entregas** (3 cartões: realizadas, em andamento, canceladas, com modal de detalhe por barra). `HTML C` = **Relatório Anual de Vendas**, com 4 abas (Resumo do ano, Metas e comissões, Análises, Detalhamento), 6 KPIs e exportação CSV. `HTML D` = o `rg-relatorio` que hospeda essas abas |
| O que mostram `HTML C` e `HTML D` de relatórios? | `relatorios` 1 | `HTML C` = **Relatório de Cotação**: 5 KPIs, indicadores de performance, 4 gráficos (donut de status, funil de conversão, conversão por vendedor, série temporal), ranking e tabela de detalhamento. `HTML D` = **Relatório de Prospecção**: 5 KPIs, destaques do mês, ranking de prospecção e volume diário |
| Existe exportação nos relatórios? | `relatorios` 2 | **No relatório anual de metas, sim** ("Exportar CSV"). Nos dois HTML de relatórios, **não** — só "Atualizar dados". O popup de comissões do vendedor tem "Exportar para excel" e "Imprimir" |
| Os 3 gráficos de metas estão prontos e ocultos? | `metas` 13 | A aba "Análises" existe e tem carrossel de gráficos, mas **apareceram em branco** na captura. Ou seja: estão ligados e quebrados, não ocultos |
| Como o usuário vê erro de credencial? | `inicio-e-acesso` 3 | A referência visual não capturou erro de login; segue ABERTA |
| A tela de agradecimento do formulário aparece? | `formularios-publicos` 7 | As capturas de `formulariovenda` e `formularionps` mostram só o formulário. Confirma a leitura do mapa: **nunca aparece** |
| O "gp ajuste enquadramento tributario" foi abandonado? | `inicio-e-acesso` 6 | Não aparece em nenhuma captura de `inicio`. Confirma: inalcançável |
| Páginas internas são acessíveis sem login? | `inicio-e-acesso` (§7 da spec) | **Correção importante:** as capturas mostram que `/vendas` e as demais **redirecionam para a `index`** sem sessão. O mapa não tem esse workflow, então a proteção é do próprio Bubble. `formulariovenda` e `formularionps` abrem sem login, como esperado |

### 2.1 Um achado novo, que não era dúvida de ninguém

A captura `relatorios-05-aba-outros-inicial` mostra o título do relatório **sobreposto a uma
mensagem de erro de tempo esgotado (Timeout)**, e continua igual depois de clicar em Pesquisar. Ou
seja: a aba "Outros Relatórios" **não funciona hoje**. Isso confirma na prática o que
`specs/paginas/relatorios.md` §8.4 previu pela leitura do código — somar no navegador a partir de um
`innerText` não escala — e reforça a decisão de `02` §5 de mover essas matrizes para função SQL
chamada por RPC.

---

## 3. Dúvidas que aparecem em mais de uma spec

Mesma pergunta, vista de ângulos diferentes. Responder uma resolve todas.

| Tema | Onde aparece | Observação |
|---|---|---|
| **O que faz o plugin `1558770956236…/AAC` no carregamento** | `financeiro` 2, `historico` 2, `inicio-e-acesso` 1, `metas` 9, `relatorios` 5, `vendas` 14 | Está no PageLoaded de **seis** páginas. Recomendação unânime: não reproduzir até identificar no editor |
| **`=` em campo de lista: adicionar ou substituir?** | `cadastros` 7, `enderecos-e-contatos` 3, `financeiro` 1, `financeiro-reusables` 18, `vendas` 6 | Limitação do decompilador, não do app. No modelo novo a questão **desaparece**: lista vira FK ou tabela de ligação (`02` §1.5) |
| **`ValorTotal` da conta a receber não é rateado** | `vendas` 10, `financeiro-reusables` 3 | DECIDIDA em `02` §2.1.2 (passa a ratear). A resposta pode reverter |
| **Numeração: cotação, pedido e entrega são o mesmo número?** | `vendas` 19, `rotinas` 5, `historico` 1, `relatorios` 9 | Impede `unique` em `pedidos.numero` e quebra o link `historico?numpedido=` |
| **UF tem duas fontes (`UF` texto × `QualUfOpt`)** | `cadastros` 22, `enderecos-e-contatos` (§de-para), `relatorios` 4 | DECIDIDA em `02` §3.2: option set vence, texto é fallback, com relatório de divergência |
| **Mesma entrega contando em duas metas** | `metas` 12, `vendas` 9 | DECIDIDA em `02` §3.5: índice único impede. Gera comissão em dobro hoje |
| **Editar histórico troca o autor** | `cadastros` 18, `sac` 16, `historico` (§7) | DECIDIDA em `02` §2.1.4: `historicos` vira append-only |
| **Backends expostos na Workflow API sem autenticação** | `vendas` 18, `rotinas` 8, `inicio-e-acesso` 13, `sac` 12 | Consolidado em `specs/00-achados-de-seguranca.md` §2.1. Exige auditoria item a item no editor |
| **Qual status de entrega conta como "realizado"** | `metas` 1, `relatorios` 3, `inicio-e-acesso` 9 | Hoje só `Financeiro`, por igualdade. Entrega que avança para `Concluído` **some** do realizado |
| **O link `&pdd<id>` sem `=`** | `vendas` 20, `formularios-publicos` 1 | **RESPONDIDA** pela spec de formulários: procede, e o vendedor é gravado vazio |
| **ICMS calculado sobre campo excluído** | `enderecos-e-contatos` 9, `financeiro-reusables` 21 | É a B5 |

---

## 4. Por tema

Os itens que não são bloqueio nem repetição, agrupados pelo tipo de decisão que exigem. A coluna
"peso" diz o que está em jogo: **dinheiro**, **acesso**, **dado** (integridade), **fluxo** (regra de
negócio) ou **escopo** (portar ou não).

### 4.1 Dinheiro

| Origem | Pergunta | Peso |
|---|---|---|
| `financeiro-reusables` 2 | Trocar o prazo rebaseia o vencimento em **hoje** ou na data de entrega? | dinheiro |
| `financeiro-reusables` 4 | Vencimento da CP usa data prevista e o da CR a real. Proposital? | dinheiro |
| `financeiro-reusables` 5 | O rateio em parcelas é sempre igual, ou há 50/30/20? | dinheiro |
| `financeiro-reusables` 6 | Editar a comissão de **uma** entrega sobrescreve o orçamento inteiro | dinheiro |
| `financeiro-reusables` 9 | Cancelar apaga CR e CP já recebidas e declaradas em recibo | dinheiro |
| `financeiro-reusables` 13 | `Opt.ParcelasReceber` inconsistente (`49dd` sem dias → vencimento vira hoje) | dinheiro |
| `financeiro` 15 | O recibo soma comissões, não vendas. Confirmar | dinheiro |
| `metas` 6 | Cancelar fechamento apaga conta a pagar já baixada | dinheiro |
| `metas` 16 | Piso de R$ 80.000 e multiplicador 1,25 da meta coletiva continuam valendo? | dinheiro |
| `metas` 17 | Prazo de 10 dias do vencimento da comissão é regra ou chute? | dinheiro |
| `vendas` 3 | Origem Lucro Real e cliente em outro regime: nenhum orçamento é criado | dinheiro |
| `vendas` 11 | Preço unitário da proposta: com ou sem frete? | dinheiro |
| `vendas` 12 | Divergência de comissão inclui entregas canceladas? | dinheiro |
| `inicio-e-acesso` 7 | O pivô soma `ValorComissaoBruto` no grupo e `valorcomissao` na célula | dinheiro |

### 4.2 Acesso e autorização

| Origem | Pergunta |
|---|---|
| `cadastros` 2, 4 | Quem cria fornecedor? Quem bloqueia filial? (hoje ninguém é barrado) |
| `casca-e-configuracao` 2 | Qual é o conteúdo real das linhas de permissão do `ConfigSistema` — **necessário para a carga da fatia 0** |
| `casca-e-configuracao` 4 | A condicional que libera edição por **nome de pessoa em código** é permanente? |
| `casca-e-configuracao` 10 | O menu esconde o que não pode abrir, ou mostra cinza? |
| `casca-e-configuracao` 11 | Quem cria usuário e qual perfil máximo pode atribuir? |
| `metas` 18 | Quem pode fechar meta, sem os dois nomes em código? |
| `relatorios` 8 | Analista/Operador vê relatório de todos os vendedores? |
| `historico` 13, 14 | Quem usa o FollowUp? Apagar CR/CP continua existindo nessa tela? |
| `sac` 5 | Campos ficam `disabled` para não-Diretor, mas os botões não. Qual é a regra? |
| `inicio-e-acesso` 13, 16 | Quem conecta a conta Google? Quem tem `IsDev` e o que libera? |
| `formularios-publicos` 13, 14 | Prazo de validade do link; reenvio usa o mesmo ou token novo? |

### 4.3 Integridade de dado

| Origem | Pergunta |
|---|---|
| `cadastros` 5, 6 | Liberar não limpa o motivo; `GrupoCliFor.Liberado` nunca é escrito |
| `cadastros` 12, 13 | Regime tributário é obrigatório? Inscrição estadual é validada? |
| `cadastros` 14 | Campos duplicados grupo↔filial: quem é o dono? |
| `enderecos-e-contatos` 1 | **Endereço padrão** — DECIDIDA em `02` §2.1.8; a carga precisa escolher um por grupo |
| `enderecos-e-contatos` 5, 6, 7 | `ativo` do contato nasce vazio; endereço inativo continua selecionável; cascata reativa tudo |
| `financeiro-reusables` 7 | CR nasce com status vazio — DECIDIDA em `02` §3.4 (`not null`) |
| `financeiro-reusables` 11 | Estorno de CP não grava data nem autor |
| `historico` 11 | Cliente nunca contatado não aparece em "Sem interação" |
| `sac` 13, 14 | `DataAberto` só gravado em um caso; nada desfaz `DataFechado` |
| `inicio-e-acesso` 14, 15 | Usuários sem perfil/depto na carga; qual e-mail vira `auth.users.email` |

### 4.4 Regra de fluxo

| Origem | Pergunta |
|---|---|
| `vendas` 1 | "Gravar" proposta dispara e-mail sem "Enviar". Intencional? |
| `vendas` 4 | Formalizar põe **todas** as entregas em "Pedido", inclusive entregues e canceladas |
| `vendas` 7 | Finalizar pedido: cartão e popup fazem coisas diferentes |
| `vendas` 8 | Cancelar pedido com entregas em Financeiro: o que fazer com CR/CP? |
| `metas` 1, 4, 5 | Status que entram; entregas vinculadas na meta de Substituição; período do fechamento |
| `metas` 19 | Meta mensal precisa coincidir com mês-calendário? |
| `historico` 3, 4 | Diferença entre "Grava X" e "Grava histórico"; marcar `Recebido` conta como baixa? |
| `historico` 6 | Corte de "sem interação": 15 dias num lugar, 15/30/30/90 em outro |
| `sac` 7 | "NPS Atual" mostra contagem de convites, não NPS |
| `formularios-publicos` 6, 8, 12 | Pós-venda sobrescreve NPS; qual é o NPS oficial; como apurar pós-venda |

### 4.5 Escopo: portar ou não

| Origem | Pergunta |
|---|---|
| `cadastros` 8 | Não existe tela para criar Tipo e Grupo de produto — o app novo precisa de uma |
| `cadastros` 15, 17, 23 | Filtro de captação volta? Dois históricos de conversa? `pop.CadastroCliFor` morre? |
| `casca-e-configuracao` 5, 7, 16 | "Fixar usuário" tem caso real? Leitor de Gmail é usado? Bug report continua no app parceiro? |
| `financeiro` 5, 6 | Onde as CPs são baixadas hoje? "Relatório contas a receber" (WF vazio) deveria fazer o quê? |
| `financeiro-reusables` 1, 24 | Diálogo inalcançável ainda é desejado? `pop.EditaContasReceber` pode ser excluída? |
| `metas` 11, 15 | `MetaAdicional` e `RankingVenda*` podem morrer? "Subir Nível" vira ação? |
| `rotinas` 11, 14, 15 | Workflows vazios; editor inline ainda é usado; **qual rotina ainda roda hoje** |
| `inicio-e-acesso` 5, 11 | `inicio` continua sendo a primeira tela? A "versão de testes" continua existindo? |
| `sac` 6 | "Copiar contatos da última pesquisa" nunca foi ligado. Manter? |

---

## 5. O que fazer com este arquivo

1. **Responder a seção 1 primeiro.** Sem ela não há carga, e sem carga não há tela com dado real.
2. **Responder a seção 4.2 antes da fatia 0** (`02` §11): a fundação de acesso depende de saber
   quem pode o quê, e o conteúdo atual das linhas de permissão do `ConfigSistema` só existe no
   banco do Bubble.
3. Ao responder, **promover a resposta para a spec de origem** (a seção 10 dela) e marcar aqui como
   RESPONDIDA, com a data. A spec de página continua sendo a fonte; este arquivo é o índice.
4. O que ninguém responder segue com a **recomendação padrão** já registrada. Nenhum item fica
   parado esperando: `CLAUDE.md` regra 1.

### Origem dos 226 itens

| Spec | Itens |
|---|---|
| `financeiro-reusables` | 24 |
| `cadastros` | 23 |
| `vendas` | 20 |
| `metas` | 19 |
| `sac` | 18 |
| `casca-e-configuracao`, `inicio-e-acesso` | 17 cada |
| `historico` | 16 |
| `enderecos-e-contatos`, `financeiro`, `formularios-publicos`, `rotinas` | 15 cada |
| `relatorios` | 12 |

`vendas-reusables` ainda não entrou na contagem (spec em produção).
