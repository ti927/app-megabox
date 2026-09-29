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

**O índice único parcial entre ativos também não resolve** — medido depois, e derruba a
recomendação anterior:

| Recorte | Documentos repetidos | Linhas |
|---|---:|---:|
| Todos os 5.840 endereços | 283 | 627 |
| Só os 5.374 ativos | 121 | 258 |
| Ativos **e** com documento de 11 ou 14 dígitos | **120** | **250** |

Ou seja, a duplicata não está concentrada nos inativos: 120 pares de filiais **ativas** com
o mesmo CNPJ. Qualquer índice único quebra a carga.

**Decisão adotada para a fatia 2** (reversível por migration quando a limpeza terminar):
índice **não único** em `documento`, mais uma view `v_clifor_documento_duplicado` que
lista os casos para o Comercial trabalhar. O `create unique index` entra numa migration
posterior, quando a view voltar vazia. É o caminho que o plano previa para B1 sem resposta
(`03` §2), agora com o número que faltava.

Os 23 documentos de tamanho inválido continuam precisando de tratamento na carga: ou o
`check documento_bate_com_tipo` de `02` §3.2 afrouxa, ou a linha entra com documento nulo
e um aviso no relatório.

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

São três, e todas têm a mesma raiz: **a Data API fala por nome, o mapa decompilado fala por
id.** Já estão tratadas em `tools/carregar-supabase.mjs`, mas valem para qualquer coisa que
leia o Bubble.

1. **Campo vem pelo nome de exibição.** `cpo.CnpjCpf`, não `cpo_cnpjcpf_text`. Ler pelo id
   devolve `undefined` em silêncio — a primeira execução do relatório de conflitos informou
   "zero conflito" justamente porque não leu nada. Qualquer contagem que dê zero merece
   desconfiança antes de comemoração.

2. **Option set vem pelo rótulo, não pela chave.** O campo `Frete` devolve `"CIF Incluso"`,
   não `cif_incluso`. Traduzir só por `chave_bubble` perde todo valor de lista fixa. O
   carregador indexa pelas duas formas, sem acento e sem caixa.

3. **Campo vazio é omitido do JSON.** O Bubble não devolve a chave quando o valor é nulo.
   Conferir o de-para contra o primeiro registro dá falso positivo em todo campo opcional —
   a conferência tem de olhar todas as linhas e só reclamar do que não aparece em nenhuma.

4. **O id do próprio Bubble pode estar errado.** No option set de UF, a chave de **Paraná é
   `pf`**, não `pr`. A API manda o rótulo `"PR"`, que não bate nem com `pf` nem com "Paraná", e
   401 filiais ficavam sem UF. O carregador passou a indexar também a sigla, que é a identidade
   real da linha.

E duas que não são da Data API, mas do **modo relatório** — que dizia "0 avisos" e deixava a carga
morrer no primeiro lote, porque só conferia a tradução:

5. **Enum do Postgres não aceita o rótulo.** `"Cliente"` ≠ `'cliente'`. O de-para declara a lista
   de valores do enum e confere antes de gravar.

6. **O Bubble não tem campo obrigatório; o esquema novo tem.** 12 grupos sem nome foram achados só
   quando o `insert` recusou. O de-para declara as colunas `not null`, e a linha que não as tem é
   descartada e contada — inventar nome de cliente é pior que dizer quantos ficaram de fora. Pela
   mesma razão a FK obrigatória (`grupo_id`) passou a ser resolvida **antes** do insert, e não numa
   segunda passada.

---

### Achados da carga de produtos (28/09/2026)

Carregados: 5 tipos, 12 grupos, 133 produtos, 85 versões, 171 ligações de linha, 143 de condição e
2.282 de fornecedor. Três coisas que o dado mostrou e que são **decisão de negócio**:

- **[DÚVIDA] 19 ligações produto → filial apontam para filial de CLIENTE**, contra a regra "o
  endereço tem de ser de fornecedor" (`specs/paginas/cadastros.md` §9.5). Como a regra fica na
  server action, a carga gravou os pares como estão. *Recomendação padrão:* manter, e a tela de
  produto mostrar o aviso; limpar é trabalho do Comercial.
- **[DÚVIDA] 18 produtos só têm fornecedor na lista por GRUPO** (`QuaisFornecedores`), que a
  decisão de `02` §3.2 descarta em favor da lista por filial. Eles entraram **sem fornecedor**.
  *Recomendação padrão:* aceitar a perda e cadastrar a filial pela tela; a alternativa é ligar
  automaticamente à filial principal do grupo, o que pode ligar a filial errada.
- **55 ligações de fornecedor ficaram de fora** porque apontam para 10 filiais descartadas na carga
  do cadastro (sem UF, sem regime ou documento inválido). Entram sozinhas numa recarga depois que
  essas filiais forem corrigidas.

Fotos de produto (30) e ícones de tipo (4) ainda são URL do CDN do Bubble e não foram carregados:
entram no passo de arquivos, junto de `anexos`, copiados para o Storage privado.

Armadilha do carregador: `alterado_em` vindo do Bubble só vale no primeiro insert — numa recarga o
trigger `fn_set_alterado` sobrescreve com a hora da carga.

---

### Carga das vendas (28/09/2026) — bloqueada pela chave da API

Carregados: **5.948 cotações, 2.229 pedidos, 2.323 prazos de pedido.** Próximo número de cotação:
5968 (`setval` feito). Sete números de cotação se repetiam no Bubble (corrida do "último + 1"): a
mais antiga manteve o número, as outras receberam 5961–5967.

**Bloqueio (ação do dono):** `BUBBLE_API_KEY` vazia no `.env`. Sem ela a Data API responde como
"everyone", e a privacidade do Bubble devolve **0 linhas** em `tbl.cotacaoprodutos` e
`tbl.propostas` — logo 0 itens, 0 orçamentos, 0 propostas e 0 entregas. Colocar a chave de admin no
`.env` e rodar
`node tools/carregar-supabase.mjs --baixar --tipos tbl.cotacao,tbl.cotacaoprodutos,tbl.orcfornecedorescotacao,tbl.propostas,tbl.pedido,tbl.entregas`
(primeiro com `--relatorio`).

Decisões do carregador que valem quando esses tipos entrarem — **[DÚVIDA]** para o negócio conferir:

- **Valor de orçamento não é o do Bubble, é o recalculado.** Bruto, ICMS e PIS/COFINS são colunas
  geradas; a carga grava as alíquotas históricas (para não usar a tabela de ICMS de hoje), mas o
  bruto gerado soma 2.202.926.479,23 contra 2.201.429.443,05 no Bubble, com 220 linhas divergentes.
- **Entrega preserva o TOTAL do Bubble** (é o que virou conta a receber): bruto idêntico ao centavo
  na simulação; líquido −0,10 e comissão −15,94 no agregado, por arredondamento a 2 casas.
- 30 entregas canceladas com quantidade 0 têm total no Bubble (470.871,40) e nenhuma conta a
  receber: vão a 0.
- 12.888 cópias de orçamento feitas pela proposta vinham todas como "vencedoras": entram como não
  vencedoras. Em 488 itens com mais de um vencedor, fica o alterado por último.
- 430 entregas cujo orçamento é de outra cotação que a do pedido são descartadas e contadas (o
  trigger as recusaria).
- 7 entregas canceladas sem motivo recebem "(sem motivo no Bubble)".
- O substituto de férias histórico (68 entregas) é preservado por um passo em modo réplica.

Efeito colateral já ocorrido: a segunda rodada (teste de idempotência) regravou `alterado_em` de
cotações e pedidos com a hora da carga (o trigger `fn_set_alterado`). Restaurar a partir do Bubble
exige desligar triggers, o que não foi feito sem autorização.

---

### Financeiro e metas no banco (28/09/2026) — decisões a conferir

Migrations `010_financeiro`, `011_metas` e `016_financeiro_equipe`. O detalhe e a fonte no mapa de
cada decisão estão nos cabeçalhos dos arquivos (D1..D14 na 010, D1..D11 na 011).

**Como as quatro pendências de negócio ficaram isoladas — mudar é trocar UM lugar:**

- **B4 (os 3% do vendedor):** só em `fn_percentual_comissao_vendedor(vendedor, data)`, que devolve
  0,0300. Percentual por nível ou por vigência = trocar o corpo dessa função.
- **B3 (escala de ComissaoPadrao/MetaBatida):** colunas guardam FRAÇÃO, com check 0..1. Se "0,10"
  no Bubble for 0,10% e não 10%, muda só a conversão da carga — e o check recusa carga na escala
  errada, então o erro não passa calado.
- **B2 (ranking):** tudo em `v_ranking_metas`, seguindo a regra da página metas.
- **Duas origens de conta a pagar** (entrega confirmada × fechamento de meta): o banco **impede a
  duplicata** sem escolher a regra — toda CP declara em `conta_pagar_entregas` as entregas que paga,
  único por (entrega, vendedor); a segunda origem recebe erro. Qual gera fica em parâmetro:
  `fn_confirmar_entrega(..., p_gerar_conta_pagar)` e `fn_fechar_meta(..., p_gerar_conta_pagar)`.

**Desvios conscientes de `02`:**

- `metas_fechadas` é 1:1 com a meta mensal, não `unique(vendedor, competência)`: quem tem meta
  Regular e de Substituição no mesmo mês não conseguiria fechar a segunda.
- NF da MegaBox mora na **baixa**, não na conta; as 14 cópias de dados da entrega que o Bubble
  replicava na conta saem e vêm por view.
- Conta a pagar vence dia 5 do mês seguinte à entrega **real** (o Bubble usa a prevista).
- Metas: leitura hierarquia ≤ 2 ou o próprio, não ≤ 3 como no mapa — com ≤ 3 um Analista veria a
  meta dos outros com realizado zerado (as entregas dos outros não são visíveis a ele).

**[DÚVIDA] Quem é a equipe financeira.** A regra padrão de `02` §7.3 (hierarquia ≤ 2 ou o próprio)
deixava um Analista do departamento Financeiro sem ver conta de vendedor nenhum — a equipe não
trabalharia. A 016 define equipe financeira = página `financeiro` **e** departamento Administrativo
ou Financeiro (é o que a matriz B6 concede no Bubble), com acesso a entregas, contas a receber e a
pagar de todos. **Não** reproduz o alargamento do Bubble em que "perfil Analista" (de qualquer
departamento, inclusive Comercial) abre o financeiro e vê a comissão de todos. *Recomendação
padrão:* manter assim; se algum Analista fora do Financeiro precisar operar contas, ele entra por
concessão nominal.

---

### SAC (28/09/2026)

- **[DÚVIDA] Quem só tem a página `sac` não enxerga pedidos e entregas** (as policies da 008/009
  exigem a página `vendas`), então não consegue abrir protocolo ligado a pedido. Hoje quem tem `sac`
  é o Diretor (vê tudo) e dois usuários nomeados. *Recomendação padrão:* se a Ouvidoria não tiver
  `vendas`, criar leitura por uma VIEW estreita (número do pedido, cliente, datas e quantidade da
  entrega — sem valores nem comissão), e não liberar as tabelas inteiras.
- A tela deixa quem tem a página `sac` emitir link de pesquisa e incluir/cancelar convites; a spec
  (§9.3) diz "Diretoria". *Recomendação padrão:* manter com a página, que no Bubble já é restrita.
- Limpeza de teste: o agente do SAC apagou 16 linhas de `auditoria` dos protocolos de teste com a
  conexão de dono do banco. Era só dado de teste, mas contorna o "auditoria não se apaga". Regra a
  partir daqui: teste deixa a trilha em `auditoria`, como os demais.

---

### Relatórios (28/09/2026) — fórmulas a validar

Migration `017_relatorios`: tudo agregado no banco (no Bubble era JavaScript no navegador, com
timeout em produção). Detalhe em D1..D9 no cabeçalho do arquivo.

- **[DÚVIDA] Qual status de entrega conta como venda.** Relatórios contam só "Financeiro" (5); as
  metas (011) contam "Financeiro" e "Concluído" (5 e 6). Os números de relatório e de meta podem
  divergir até a Diretoria decidir. *Recomendação padrão:* igualar ao das metas ({5, 6}), que é o
  que paga comissão. Está em parâmetro (`p_status`), a troca é de uma linha.
- **[DÚVIDA] Fórmulas das abas Cotação e Prospecção foram DEFINIDAS aqui**, porque o mapa não
  contém o conteúdo dos blocos HTML embutidos do Bubble: "virou pedido" = etapa ≥ 2; conversão =
  pedidos ÷ cotações do período; faturamento = soma dos orçamentos vencedores. Precisam ser
  conferidas pela Diretoria contra o que ela vê hoje no Bubble.
- Ranking: continua um só, o `v_ranking_metas` da 011 (o relatório não cria outro).
- Período obrigatório e de no máximo 24 meses; vendedor comum vê no ranking só a própria linha.

---

### Arquivos no Storage (28/09/2026) — decisões da 018

Migration `018_arquivos`: 5 buckets privados (`anexos`, `produtos`, `entregas`, `usuarios`,
`clifor`), caminho `<bucket>/<id da linha dona>/<uuid>.<ext>` com CHECK em toda coluna `*_path`,
URL assinada de 60–300 s (`lib/arquivos.ts`). Medido: a Data API **anônima** devolve os 761 anexos
com URL do CDN — o vazamento de `00` §2.2 está aberto hoje, para qualquer um.

- **Filtro de departamento virou policy** de `anexos` (e, por ela, do bucket): vale para todo
  perfil, Diretor incluído, como o `contains(CurrentUser:cpo.QualDepto)` do `pop.AnexosClifor`.
  Consequência: "Comprovante de Endereço" não tem departamento nenhum (003 e Bubble) → ninguém o
  lê. *Se a Diretoria quiser exceção por perfil, é uma linha na policy.*
- **[DÚVIDA] Anexo de USUÁRIO** (RG, CPF, contracheque, exames): no Bubble qualquer logado vê.
  *Adotado:* o dono ou hierarquia ≤ 2 (mesma regra do dado pessoal de `usuarios` na 001), somado
  ao filtro de departamento.
- **Anexo de cliente tem grupo E filial no Bubble**; `anexos.dono_unico` (006) aceita um só. A
  cópia grava a **filial** (`endereco_id`), que é mais específica — o grupo se deduz dela. A tela
  lista os anexos do grupo por `grupo_id = X or endereco_id in (filiais de X)`.
- **Tipos recusados:** `.html` (2 anexos no Bubble) e SVG não entram — são página/imagem com
  script servidas do domínio do Storage. Os 2 ficam no Bubble e estão no relatório da cópia.
- Objeto é imutável e ninguém apaga pela sessão (sem policy de UPDATE/DELETE em
  `storage.objects`): remover e trocar arquivo é server action com service_role, depois de
  conferir a permissão (mesmo raciocínio do delete de `anexos` na 006). Ainda não existe — entra
  com a tela.
- Arquivos de entrega (5.261 no Bubble) esperam a carga das entregas; `tools/copiar-arquivos-bubble.mjs
  --so entregas` roda depois dela.

---

### Anexos e fotos nas telas (29/09/2026)

- Envio de anexo: a **filial é obrigatória** quando o grupo tem filial ativa (como no Bubble,
  bTjdz); sem filial ativa, o anexo fica ligado ao próprio grupo.
- Fotos de lista: assinadas **em lote** para a página visível (`lib/arquivos-lote.ts`, uma chamada
  `createSignedUrls` com a sessão; a policy do bucket confere cada objeto). `urlsAssinadas` faria
  duas chamadas por foto — ~100 por página na instância Micro.
- Limite de envio: 4 MB (`bodySizeLimit` em `next.config.ts`), acima dos 3 MB do Bubble e dentro do
  teto de 4,5 MB da Vercel.
- Apagar anexo: um por vez, hierarquia ≤ 2, com confirmação. O "apagar todos" do Bubble (bTjeL) não
  foi reproduzido.

---

### Carga final das vendas (29/09/2026) — com a chave da API

Carregados: 5.957 cotações, 10.045 itens, 24.189 orçamentos (7.479 vencedores), 7.764 propostas,
10.787 itens de proposta, 2.235 pedidos, 2.329 prazos, 3.610 entregas. Próxima cotação: 5978.

Quatro decisões do carregador que **substituem** as anteriores — **[DÚVIDA]** para conferir:

1. **Item de cotação compartilhado é clonado** (substitui "430 entregas descartadas"). Ao editar
   uma cotação, o Bubble (bTOjb0) grava na lista de produtos itens de OUTRA cotação, e a proposta
   (bThFu) copia os vencedores deles. Com a chave, o descarte seria de 696 entregas (19%), todas
   de propostas válidas. Agora: 434 itens clonados na cotação que os usa (`bubble_id` sintético
   `<item>@<cotação>`), 675 orçamentos apontando para o clone, **0 entregas descartadas** por isso.
2. **Proposta com número repetido na mesma cotação é renumerada** (27, 18 enviadas): fica com o
   número a que tem pedido, depois a enviada, depois a mais antiga.
3. Números de cotação 5961–5967, dados a repetidas na carga anterior, foram devolvidos ao dono
   legado; 6 cotações renumeradas para 5972–5977.
4. Orçamento sem produto, destino ou vendedor herda do item ou da cotação (20 recuperados).

Conferência de dinheiro (só linhas carregadas): entregas — bruto −470.871,40, exatamente as 30
canceladas com quantidade 0 (decisão anterior); comissão −15,94 de arredondamento. Orçamentos —
bruto +1.309.849,90 em 207 linhas, quase todo (+1.468.199,90 em 99) porque o Bubble somava frete
fora de "CIF Informado" (regra D1 da 007). **Diretoria: confirmar que a regra do frete é a certa.**

Pendente: 883 propostas sem número (rascunhos abandonados, nenhuma enviada) ficaram fora;
cópia dos arquivos de entrega parou em ~316 de 5.153 com a queda do banco — retomar com
`node tools/copiar-arquivos-bubble.mjs --so entregas --paralelo 1 --lote 200 --pausa-lote 60`.

---

### Relatórios refeitos a partir do HTML original (29/09/2026)

O HTML dos relatórios estava no export bruto (`grupomegabox.bubble`, fora do git): o
`tools/decompile.py` nunca exportou o conteúdo de elementos HTML, por isso o `mapa/` não o tinha e as
fórmulas de Cotação/Prospecção tinham sido DEFINIDAS por nós (seção "Relatórios" acima). Agora seguem
o original, com as diferenças documentadas como R1–R9 no cabeçalho de `db/021_relatorios_graficos.sql`:

- **Cotação:** "virou pedido" = etapa Pedir; "em cotação" inclui arquivadas; taxa = pedidos ativos ÷
  cotações ativas; ranking por conversão; histórico de janeiro ao mês escolhido. Mês em horário de São
  Paulo (o HTML usava UTC).
- **Prospecção:** "enviadas" contam pela data de CRIAÇÃO da proposta — a carga preencheu `enviada_em` em
  só 1 de 7.574, e a regra da 017 deixava a aba quase vazia. "Clientes" = só da carteira do vendedor.
- **Mantido de propósito:** ticket médio, faturamento e tempo de fechamento com a nossa definição (o HTML
  procurava campos que não existem e mostrava "sem dados" e "0,0 dias").
- Gráficos com Recharts (SVG, cores por token, acompanham o tema).

**[DÚVIDA]** Diretoria: conferir os números das abas Cotação e Prospecção contra o que via no Bubble.

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
