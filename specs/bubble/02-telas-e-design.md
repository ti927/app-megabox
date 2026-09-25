# Telas do app Bubble — Grupo MegaBox (versão de teste)

Registro visual para a migração. A estrutura (elementos, workflows e regras) está no export do app. Este documento cobre só **como cada tela aparece**. Não há dados de clientes no texto, e as capturas mostram a tela como estava.

> **Status: COMPLETO** (feito em 2 sessões). Todas as 14 páginas foram percorridas. Popups que não abri estão listados com o motivo.

## Resumo

| Página | Nº de capturas | Popups fotografados | Popups que não consegui abrir (e por quê) |
|---|---|---|---|
| index (login) | 4 | — (página sem popups) | — |
| reset_pw | 2 | — | — |
| loginrealizado | 1 | — | — |
| inicio | 7 | Bugs (lista), Novo Bug | — (o popup da página é o de Bugs, que vem do menu lateral) |
| vendas | 16 | Nova Cotação / Edita Cotação, Propostas do Cliente, Pedido ao Fornecedor, Confirma entrega, Arquivando Cotação, Atenção (cancelar pedido), Novo Cliente (2 abas) | "+ Proposta" e o lápis cinza da proposta (podem criar ou alterar registro); seletor de anexos; os demais só aparecem depois de ações que gravam |
| financeiro | 6 | Históricos Financeiros | Baixa de recebíveis (sai de "Baixar Contas a Receber", que está na lista de botões proibidos); Cobrança ("Enviar Cobrança" fica desabilitado e também é proibido); Recibo (não achei um gatilho que não grave) |
| metas | 10 | Metas Mensais, Atenção (apagar metas fechadas), Detalhe de comissões do vendedor, e o modal de entregas do gráfico (HTML, não é popup do Bubble) | Fechar meta (✓ verde): pode gravar direto, então não cliquei |
| historico | 5 | — | O popup da página provavelmente sai de "Grava histórico" (botão de gravação) |
| sac | 7 | Protocolo SAC, Nova Pesquisa NPS | Detalhe/edição de chamado (a lista de chamados está vazia) |
| cadastros | 8 | Novo endereço do Cliente, Novo contato do cliente, Histórico de conversas (o "Novo Cliente" é o mesmo de vendas-14) | Anexos do cadastro (o clique no ícone não abriu nada visível); Bloquear e o toggle Ativo gravam direto |
| relatorios | 6 | — (o "Ver ranking" abre dentro da página) | — |
| rotinas | 2 | — | O popup não foi aberto: todos os botões da página disparam rotinas de manutenção. É uma página de gambiarras internas e não entra no design da migração. |
| formulariovenda | 3 | — | — |
| formularionps | 3 | — | — |

**Total: 80 capturas.**

**Páginas públicas:** `formulariovenda` e `formularionps` abrem normalmente **sem login**, iguais à versão logada. As páginas internas (ex.: `/vendas`) redirecionam para a `index` quando não há login.

## Como as capturas foram feitas (ler antes de usar as imagens)

- A extensão do Chrome não salva prints em arquivo. Por isso, cada captura é uma **renderização do DOM da página** (biblioteca html-to-image, injetada só no navegador). Nada foi gravado no app.
- A largura desktop real ficou em **1438 px** (1422 px nas capturas da 2ª sessão, a partir de cadastros-04), não 1440: é o máximo da janela com o painel lateral aberto.
- **390 px (celular):** o Chrome não abre janela com menos de ~500 px. Então abri uma janela auxiliar e forcei a largura da página em 390 px. O layout reflui de verdade, mas é uma simulação, não um celular real.
- **Diferenças conhecidas da renderização:**
  - logos de clientes e alguns ícones hospedados fora do app (que bloqueiam cópia) aparecem como **quadrados cinza**;
  - em algumas capturas, campos de filtro vazios mostram o placeholder em azul em vez de cinza (corrigido a partir de `financeiro-02`), e ícones de funil às vezes quebram para baixo do campo;
  - em `financeiro`, o rótulo laranja "Dt entrega" aparece sobreposto à data.

  **O texto deste documento é a referência.** A imagem serve de apoio.
- Popups em páginas longas foram capturados só na área visível, com o topo da página ao fundo.

Nomes: `design/capturas/<pagina>-<nn>-<estado>.png`.

---

## Elementos globais (todas as páginas internas)

**Cabeçalho** (faixa de ~60 px, fundo cinza-esverdeado muito claro, largura total):
- esquerda: ícone hambúrguer azul-violeta (Material "menu"); com o menu aberto, vira "menu_open";
- centro: logo "megabox" (cubo roxo + texto cinza-escuro), com "TESTE" em roxo espaçado acima (marca do ambiente de teste);
- direita: avatar circular com iniciais em gradiente, nome do usuário em negrito e cargo abaixo em cinza, engrenagem azul com caret (menu de configurações) e ícone de balão azul (o clique não mostrou mudança).

**Menu lateral:** gaveta branca de ~245 px que empurra o conteúdo.
- Itens em texto azul: Inicio, Fluxo de Vendas, Fluxo Financeiro, Metas & Vendas, Manutenção, Relatórios, Suporte de Vendas & Nps.
- O item ativo tem uma barra vertical azul à esquerda.
- No rodapé ficam 2 botões com contorno azul e fundo lilás-claro: "Comunicar Bug" (ícone de inseto) e "Logout".

**Menu da engrenagem:** dropdown branco com sombra.
- Itens em azul: Configurações de Usuário, Configurações de Sistema, Cadastro Usuários, Cadastro Produtos, Cliente / Fornecedor, FollowUp de Pedidos.
- Hover: o item fica azul mais escuro e um pouco maior.

**Seletor de data** (pickadate, preso ao `<html>`):
- cartão branco com sombra;
- ◀ ▶ + selects de ano e mês;
- grade de dom a sáb; dia escolhido com fundo azul sólido; hoje marcado com um triângulo azul no canto; dias de outros meses em cinza-claro;
- rodapé: "hoje", "limpar" (traço vermelho) e "fechar".

**Padrões de campo:**
- rótulo pequeno cinza acima do campo, borda cinza-clara arredondada;
- valores de data em azul;
- ícone "funil com X" dentro do campo para limpar o filtro (fica amarelo quando o filtro está ativo).

**Paleta recorrente:**

| Cor | Onde aparece |
|---|---|
| Azul (#3D78F3 aprox.) | Ações primárias, links e valores |
| Amarelo/laranja (#F5A623 aprox.) | Salvar em popups de edição, alertas e "Dt entrega" |
| Vermelho | Vencido, tributos, cancelado e ações destrutivas |
| Verde | Líquido, vencedor, concluído e toggles ligados |
| Lilás | Chips e status |
| Azul-claro #EEF3FB | Fundo de linhas e cartões |

**Mobile:** o app não tem layout móvel, com exceção parcial do SAC. As tabelas espremem as colunas até o texto ficar vertical (uma letra por linha), e não há rolagem horizontal.

---

## loginrealizado

### loginrealizado-01-inicial
- **Como chegar:** URL direta (depois do login).
- **Arranjo:** página branca sem cabeçalho, com tudo centralizado:
  - logo "GRUPO megabox SOLUÇÃO COMERCIAL" (roxo + cinza);
  - título "Login Realizado" em azul-marinho negrito (~28 px);
  - texto pequeno "Essa página fechará em alguns segundos".

---

## inicio

### inicio-01-inicial
- **Filtro:** campo "Intervalo datas" (duas datas no mesmo campo + funil-x azul) e um ícone de lista cinza ao lado (o clique não tem efeito visível).
- **Matriz Fornecedor × meses:** colunas Fornecedor | Janeiro … Dezembro.
  - Cabeçalho em cinza-escuro pequeno; linhas separadas por traços finos.
  - A coluna Fornecedor é estreita, e nomes longos quebram em várias linhas.
  - As células mostram valor em R$ (cinza) só nos meses com dado. Não há cor de destaque.

### inicio-02-menu-lateral
- **Como chegar:** hambúrguer.
- Mostra o menu lateral descrito em "Elementos globais". O conteúdo desloca para a direita.

### inicio-03-menu-configuracoes
- **Como chegar:** engrenagem.
- Mostra o dropdown de configurações.

### inicio-04-popup-bugs
- **Como chegar:** menu lateral → "Comunicar Bug".
- **Popup:** modal branco de ~670 px sobre fundo escurecido.
  - Botão azul sólido "Novo Bug" (inseto) no canto superior direito.
  - Tabela com cabeçalho cinza-claro: Data/Usuário | Detalhamento | Status | Respostas | Anexos.
  - Detalhamento: chip lilás com o local do sistema, título em negrito e descrição cinza.
  - Status: ícone de avião de papel + "Enviado".
  - Anexos: link azul com o nome do arquivo.
  - Barra de rolagem vertical própria.

### inicio-05-popup-novo-bug
- **Como chegar:** "Novo Bug".
- **Formulário em 2 colunas:**
  - esquerda: Título; Local do sistema (select: Cadastro de clientes, Cadastro de usuário, Cadastro de produto, Etapa de Cotação/Proposta/Pedido/Entrega/Financeiro, Kanban de vendas, Histórico de clientes); Anexo ("Imagem ou Vídeo (máx 16mb)", ícone de olho);
  - direita: Descrição (textarea alta, borda azul quando em foco).
- **Botões ao centro:** "Enviar" (azul sólido, ícone de avião) e "Cancela" (contorno azul, ícone X). "Cancela" volta para a lista.

### inicio-06-seletor-data
- **Como chegar:** clique no campo de datas.
- Mostra o seletor de data descrito em "Elementos globais".

### inicio-07-mobile-390
- O cabeçalho quebra em 2 linhas: o hambúrguer fica sozinho, e nome, engrenagem e chat descem. O logo e o avatar somem.
- O filtro cabe na largura.
- A matriz de 13 colunas fica ilegível: cabeçalhos e nomes aparecem em texto vertical.

---

## vendas

### vendas-01-inicial
- **Barra de filtros:**
  - Data criação (Cotação e Pedido): intervalo com ícone de calendário azul;
  - Vendedor: dropdown com X;
  - Número pedido e Cliente: inputs com X.
- **5 botões-pílula** com contorno azul e ícone: "cotações arquivadas" (caixa), "data crescente" (ordenar 1-9), "expandir cartões" (chevrons duplos), "exibe concluídos" (bandeira), "exibe cancelados" (x em quadrado). Ligado = azul sólido com texto branco.
- **Botão à direita:** azul sólido "+ Cotação".
- **Kanban com 4 colunas iguais**, cada uma com cabeçalho cinza-claro e contador:
  - "Cotação — 134 cotações";
  - "Pedido — 27 pedidos";
  - "Entregas Próprias";
  - "Entregas Substituto".

  Cada coluna rola sozinha, com uma barra cinza fina.
- **Cartão** (branco, sombra leve, cantos arredondados):
  - logo circular do cliente;
  - título em CAIXA ALTA negrito "CLIENTE - Nº 5760" (nas entregas, acrescenta "- NF: 2920");
  - linhas "Vendedor:" e "Dt Cotação / Dt Pedido:" com rótulo em negrito;
  - lápis azul à direita.
- **Por coluna:**
  - Cotação: ícone de documento azul com contador numérico (nº de propostas);
  - Pedido e Entregas: checkbox azul no canto superior esquerdo;
  - Entregas: ícone de caminhão (azul = entrega própria com NF; cinza = pendente).
- **Clique no corpo do cartão:** expande só aquele cartão. Hover: sem mudança perceptível.

### vendas-02-cartoes-expandidos
- **Como chegar:** "expandir cartões".
- **Cartões de Cotação** ganham 3 linhas, cada uma com um ícone circular colorido:
  - carrinho roxo: "N produtos no carrinho";
  - troféu verde: "N produtos possuem vencedores";
  - documento azul: "N propostas enviadas";

  e um quadradinho amarelo (arquivar) à direita.
- **Cartões de Pedido e Entrega** ganham a lista de itens: pílula com contorno azul com a quantidade + "dd/mm/aa - DESCRIÇÃO". O cartão de Pedido também ganha um calendário vermelho (cancelar).

### vendas-03-popup-nova-cotacao
- **Como chegar:** "+ Cotação".
- **Modal** de ~1340 px.
- **Cartão esquerdo:**
  - "Nova Cotação" + checkbox "Pedido de Amostra";
  - "Cotação núm." no canto;
  - avatar cinza + "Cliente: Buscar cliente" (sublinhado) + ícone azul de adicionar pessoa;
  - select "Endereço de entrega" + ícone de cartão cinza;
  - logo roxo + rádios "Megabox" / "Paletes Brasil";
  - Data cotação, Data Validade (azul) e Vendedor.
- **Cartão direito "Adicionar produto ao carrinho":**
  - ícone de paletes azul;
  - selects Tipo Produto, Produto (+ lápis azul), Condição e Linha;
  - Qtd; "Medida, descrição ou obs.";
  - ícone de carrinho com + azul.
- **Tabela do carrinho** (cabeçalho cinza-lilás): QTD | Produto / Fornecedor | Produto Unit. | Comissão Unit. | Tipo Frete | Valor Frete | Aliq. ICMS | Aliq. PISCOFINS | Total Tributos | Total Bruto | Total Líq | Total Comiss.
- **Rodapé:** "Gravar Cotação" (azul) e "Cancela" (contorno).
- **Validação:** o lápis de Produto sem produto escolhido deixa o sublinhado do campo vermelho. Esse estado não saiu na captura.

### vendas-04-popup-edita-cotacao
- **Como chegar:** lápis de um cartão de Cotação.
- Mesmo modal, com o título "Edita Cotação".
- **Linha de produto** (fundo azul-claro):
  - ícones à esquerda: lápis azul, pino verde, fábrica azul;
  - QTD num input;
  - chevron ▾ + nome em CAIXA ALTA + subtítulo cinza;
  - círculo lilás com o nº de fornecedores; troféu verde;
  - lixeira vermelha.
- **Sub-linhas por fornecedor:**
  - troféu verde (vencedor) ou cinza;
  - nome + regime tributário em cinza;
  - inputs com contorno azul-claro;
  - **Total Tributos em vermelho** e **Total Líq em verde** na linha vencedora (que tem fundo azul-esverdeado).
- **Rodapé:** "Salvar Cotação" (amarelo sólido) e "Cancela" (contorno amarelo).

### vendas-05-popup-propostas
- **Como chegar:** ícone de documento com contador no cartão de Cotação.
- **Faixa (i) azul no topo:** "Os valores da proposta abaixo exibem a situação atual da cotação…" + pílula "editar cotação".
- **Esquerda:** prévia da proposta em formato de folha A4.
  - Logo e bloco do consultor.
  - Barras de seção cinza-escuro com texto branco: "Proposta núm. …", "Itens da proposta", "Condições da proposta".
  - Tabela: Qtd | Descrição | Preço unit. (líquido) | Frete | Alíquota ICMS | Alíquota PIS/COFINS | Preço unit. bruto | Valor total bruto.
  - Textos informativos longos.
- **Direita:**
  - "Propostas do Cliente", X azul;
  - logo + nome + "Cotação número";
  - botão azul "+ Proposta";
  - tabela: rádio | Núm | Fornecedor | Produtos | ícones (lápis, clipe, enviar, carrinho).

### vendas-06-popup-pedido-fornecedor
- **Como chegar:** lápis de um cartão de Pedido.
- **Modal quase em tela cheia**, que rola junto com a página.
- **Esquerda:** prévia do pedido (folha).
  - Barra "Pedido núm."; Detalhes/Dados de faturamento.
  - Bloco azul-claro com "Enviar para" (pino verde) e "Faturar para" (ícone de nota verde).
  - Tabela de produtos e sub-tabela Data entrega | Qtd entrega | Valor bruto.
  - "Informações adicionais", com o "Número da Ordem de compra" em laranja.
- **Direita:**
  - "Pedido ao Fornecedor", X azul, ícones de imagem e "T";
  - logo + nome + "Cotação número X Proposta número Y".
- **Grade de campos:**
  - Email do Cliente / Email do fornecedor (com ícone de cartão);
  - CC e-mail cliente / CC e-mail fornecedor;
  - Anexo ordem de compra (+ abrir); Núm ordem de compra cliente;
  - Corpo do e-mail do cliente / fornecedor (textareas com texto azul);
  - Informações adicionais no pedido;
  - Condições de pagamento (tag "× 28dd" com setas) + "Pix, boleto…".
- **Tabela do item** (cabeçalho cinza) + sub-tabela de entregas:
  - colunas: lixeira | Dt prev. entrega | Qtd entrega | Comissão | Valor bruto | Valor líq, com "Falta:" embaixo de cada | Núm NF;
  - linha com checkbox, data, calculadora, qtd, "Nf:/Etapa:" em azul e caminhão azul.
- **Pílula** "pdf pedido".
- **Rodapé:** "Salvar" (amarelo), "Cancela" (contorno amarelo) e checkbox "Reenviar pedido por e-mail (cliente e fornecedor)".
- O lápis de Entregas Substituto abre o mesmo modal.

### vendas-07-popup-pedido-entrega-parcial
- **Como chegar:** lápis de um cartão de Entregas Próprias.
- O mesmo modal, com entrega parcial:
  - os valores "Falta:" ficam **vermelhos**;
  - o Valor líq do item fica vermelho;
  - na linha de entrega, calendário vermelho e caminhão verde;
  - a prévia lista várias linhas de entrega.

### vendas-08-popup-confirma-entrega
- **Como chegar:** ícone de caminhão azul num cartão de Entregas.
- **Modal** de ~560 px: "Confirma entrega" à esquerda e "Nota Núm: …" em negrito à direita.
- **3 blocos** com fundo azul-acinzentado claro:
  1. **Dados da entrega:** logo, nome, cotação/proposta, condição, forma de pagamento e mini-tabela.
  2. **Criar previsão de recebimentos:** Data de entrega, Comprovante ("Máx 5mb"), Qtd parcelas (tag), botão azul "+ Recebimentos" e aviso com (i) amarelo: "Não é possível criar novos recebimentos se já existe algum recebimento previsto abaixo."
  3. **Previsão de recebimentos:** tabela Prazo | Vencimento | Valor.
- **Rodapé:** "Gravar" (cinza, desabilitado) e "Cancela" (contorno azul).

### vendas-09-cotacoes-arquivadas
- **Como chegar:** "cotações arquivadas" ligado.
- A coluna Cotação conta 37 cartões, com **fundo cinza**.
- Cada cartão ganha uma pílula lilás com o motivo do arquivamento (ex.: "Erro ou mudança de dados").

### vendas-10-exibe-concluidos
- Os cartões concluídos ficam com **fundo verde-claro** e texto verde "Entregas concluídas".
- As entregas mostram "Dt Entrega:".

### vendas-11-exibe-cancelados
- Os cartões ficam com **fundo rosa** e a linha "Cancelado: MOTIVO".
- Um dos cartões mostra o campo "Qual email cli…" e a pílula "retira pedido".

### vendas-12-popup-arquivar-cotacao
- **Como chegar:** quadradinho amarelo no cartão de Cotação expandido.
- **Modal** de ~420 px "Arquivando Cotação":
  - mini-cartão da cotação;
  - select de motivo (Demora no atendimento, Erro ou mudança de dados, Fechou com outro fornecedor, Não aprovado pelo financeiro, Pesquisa de preço, Preço alto, Sem demanda);
  - botão amarelo "Arquivar".
- Fecha com Esc.

### vendas-13-popup-cancelar-pedido
- **Como chegar:** calendário vermelho no cartão de Pedido expandido.
- **Alerta:**
  - triângulo amarelo + "ATENÇÃO!" em amarelo;
  - texto: "Você está cancelando um pedido/entrega…";
  - input "Motivo cancelamento";
  - 2 toggles azuis ligados: "Envia e-mail informando cliente" e "Envia e-mail informando fornecedor";
  - botão amarelo "Cancela Pedido/Entrega";
  - X para fechar.

### vendas-14-popup-novo-cliente-cadastro
- **Como chegar:** ícone de adicionar pessoa no modal Nova Cotação.
- **Modal empilhado** "Novo Cliente" (~780 px, X azul).
- **Bloco cinza no topo:**
  - avatar + lupa;
  - "Nome cliente / fornecedor";
  - selects Captação e Carteira;
  - toggle verde "Grupo ativo: SIM".
- **Abas em estilo pasta:** "Informações de Cadastro" | "Informações Adicionais".
- **Aba Cadastro:**
  - toggle "Filial ativa";
  - pílula "🔒 Destravar Campos" (os campos vêm travados);
  - Identificação do Endereço;
  - Cpf/Cnpj (rádios); Insc Estadual; Insc Municipal; Regime Tributário (azul);
  - Razão Social; Nome Fantasia;
  - CEP; Endereço; Complemento; Bairro; Município; UF;
  - Localização (Google) + ícone do Maps.
- **Rodapé:** "Gravar" (azul) e "Cancela".

### vendas-15-popup-novo-cliente-adicionais
- **Esquerda:**
  - toggle azul "Corporativo: NÃO";
  - Nome Comprador; Capacidade de compra;
  - Demanda + Frete;
  - Observação.
- **Direita:**
  - "Buscar produto" + botão azul quadrado com disquete;
  - caixa "Produtos desse fornecedor".

### vendas-17-mobile-390
- Os filtros truncam; as pílulas quebram em 3 linhas.
- As 4 colunas ficam com ~45 px, e os títulos quebram por sílaba.
- Os cartões viram texto vertical.
- (Nessa carga, os contadores vieram com outro filtro de data.)

---

## financeiro

### financeiro-01-inicial
- **Topo:**
  - checkboxes "Lista a receber" (marcado) e "Lista a pagar";
  - 6 rádios de tipo de data: Data entrega, Data vencimento, Data pedido, Data NF Megabox, Data recebto banco, Data baixa sistema.
- **Grupos de botões segmentados** (desabilitados = texto cinza-claro):
  - [Enviar Cobrança | Baixar Contas a Receber | Relatório contas a receber];
  - [Baixar Contas a Pagar | Relatório contas a pagar];
  - "Limpar Filtros" com contorno azul.
- **11 filtros:** Intervalo de data, Núm pedido, Cliente, Grupo Fornecedor, Filial Fornecedor, Vendedor, Num NF Fornecedor, Num NF Megabox, Núm cobrança, Status recebimento (select), Arquivados (Sim/Não).
- **Tabela "a receber"** (cabeçalho cinza-lilás, 2 linhas):
  - colunas: [☑ ☐] | Vendedor / Núm pedido | Cli | For (estreitas demais, texto letra a letra) | Datas | Valores | NF Fornecedor / Dt NF | NF Recebimento / Dt NF Recebimento | Status / Último histórico (fora da área visível em 1440 px);
  - linhas altas (~240 px) com fundo azul-claro;
  - coluna 1: "1 / 172" + ícones de arquivar, lápis e checkbox;
  - funil azul (filtrar por este) e ícone de abrir;
  - Dt vcto em **vermelho** quando vencida; rótulo "Dt entrega" em **laranja**;
  - clipes azuis (arquivo existe) ou cinza (sem arquivo).
- **Rodapé fixo** (azul-claro):
  - "A receber vencidos…" (roxo);
  - "Receber listado (172)" e "Receber selecionado" (verdes);
  - "Pagar listado" e "Pagar selecionado" (vermelhos).

### financeiro-02-rolagem-horizontal-status
- Com a tabela rolada até o fim, a coluna Status mostra a pílula lilás "S↘ A receber" e a pílula com contorno amarelo "Adicionar Hist".
- Hover na linha: o fundo azul fica mais forte.

### financeiro-03-popup-historicos-financeiros
- **Como chegar:** "Adicionar Hist".
- **Modal** de ~980 px, com X azul.
- **Esquerda:**
  - cartão do cliente (avatar, nome, Unidade, CNPJ);
  - checkbox "Grava histórico também para o fornecedor" + cartão do fornecedor;
  - textarea "Digite o histórico da conversa";
  - botão azul "Enviar".
- **Direita:** caixa "Históricos" com a lista.

### financeiro-04-linha-selecionada
- Com o checkbox da linha marcado:
  - a linha fica com fundo **amarelo-creme**;
  - "Baixar Contas a Receber" e "Relatório contas a receber" ficam azuis (habilitados);
  - "Receber selecionado (1)" ganha uma caixa de destaque.

### financeiro-05-listas-receber-e-pagar
- Com "Lista a pagar" marcado, aparecem 2 tabelas empilhadas.
- **Tabela a pagar:** Vendedor / Núm pedido | Cliente / Contato | Fornecedor / Produto | Datas | Valores | NF Fornecedor | Info Pagamento | Status (pílula lilás "A pagar").
- As linhas não têm o ícone de arquivar.
- "Pagar listado" aparece em vermelho.

**Observado:** o lápis da linha abre `/historico` em **nova aba**, já filtrado pelo pedido. O clipe abre o PDF da NF em nova aba.

### financeiro-06-mobile-390
- Os botões quebram em 4 linhas.
- Os 11 filtros viram colunas de ~10 px, com rótulos sobrepostos.
- Nenhuma lista carregou (as duas vieram desmarcadas nessa sessão).
- Os totais do rodapé ficam empilhados na vertical.

---

## metas

Página longa (~3.000 px). Abaixo do cabeçalho há uma faixa fixa com o período (texto azul) à esquerda e o botão azul "Criar Metas" à direita.

### metas-01-inicial (página inteira, aba "Resumo do ano")

**Pódio:** 3 escudos verticais.
- 1º no centro e mais alto, **laranja**;
- 2º à esquerda, **prata** com borda verde-água;
- 3º à direita, **bronze/vermelho**.

Cada escudo tem losangos no topo e na base, foto circular, NOME em branco, nível e %. No canto superior direito há um ícone de atualizar azul.

**Cartão da equipe:**
- ícone de grupo roxo;
- Meta / Faturado / Meta Diária (roxo, truncados);
- anel laranja "84/100";
- "Meta não atingida" em vermelho;
- os 3 meses anteriores em roxo.

**Grade 2×3 de ranking:** "1º" + foto + NOME + nível + %.

**Tabela por vendedor:** Vendedor (foto + nome + nível) | Meta (+ REGULAR / SUBSTITUIÇÃO) | Valor faturado (+ ícone de abrir) | % da meta (anel azul ou laranja) | Comissão | Qtd meses p/ subir nível | Status nível (pílula lilás "Manter Nível") | Fechar (✓ verde + relógio vermelho).

**ANÁLISE DE ENTREGAS** (HTML embutido, com visual mais moderno):
- ícone roxo + etiqueta laranja "VERSION-TEST"; botão "↻ Atualizar";
- 3 cartões:
  - Realizadas: barras **roxas**;
  - Em andamento: barras **azuis**;
  - Canceladas: barra **vermelha**, mini-cards rosados;
- cada cartão tem mini-cards de total e comissão, e o rodapé "clique para detalhar".

**Relatório Anual de Vendas** (HTML):
- etiqueta "ambiente de teste"; pílula "atualizado às…"; botões "Exportar CSV" (branco) e "Atualizar dados" (azul);
- filtros: ANO, VENDEDOR, BASE DO FATURAMENTO, VALOR CONSIDERADO, BUSCAR VENDEDOR;
- abas: Resumo do ano | Metas e comissões | Análises | Detalhamento (ativa = fundo azul-claro).

**Aba Resumo do ano:**
- 6 KPIs com borda esquerda colorida:
  - azul: faturamento (com "↓98,1% vs 2025" em vermelho), meta acumulada, média mensal;
  - verde: comissão;
  - laranja: em aberto;
  - vermelho: cancelado.
- Tabela "Fechamento mensal":
  - "% da meta" em etiqueta vermelha (abaixo de ~70%) ou amarela (~70–99%);
  - Cancelado em vermelho;
  - mês corrente com fundo creme + "EM ABERTO" em laranja;
  - linha Total em negrito;
  - rolagem horizontal.
- À direita: "Faturamento médio" (por trimestre) e "Referências do ano" (a linha da meta do mês destacada em azul).

### metas-02-relatorio-aba-metas-comissoes
- Matriz Mês × vendedor, com 3 linhas por mês: META / ATINGIU / COMISSÃO.
- ATINGIU aparece em etiqueta **vermelha** (abaixo da meta) ou **verde**; COMISSÃO em verde.
- Alternador no topo: "Formato planilha | Mapa de calor".

### metas-03-relatorio-mapa-de-calor
- Valores abreviados (R$ 21k) com fundo em tons de **azul** proporcionais ao valor; linha Total.
- Abaixo, "Vendedor × mês" com os segmentos Atingido | Meta | % da meta | Comissão.

### metas-04-relatorio-aba-analises
- Carrossel "Faturamento mês a mês", com alternador "Ano a ano | Por etapa", setas circulares ‹ › (hover = azul sólido) e 6 pontos de paginação.
- **Nesta sessão, os gráficos apareceram em branco** em todos os slides.

### metas-05-relatorio-aba-detalhamento
- "Vendas detalhadas": tabela ordenável (⇕).
- Colunas: Entrega | Data | Vendedor | Status entrega (etiqueta cinza) | Status financeiro (etiqueta cinza) | Venda bruta | Venda líquida | Comissão | Origem (etiqueta laranja "mês em andamento").

### metas-06-popup-metas-mensais
- **Como chegar:** "Criar Metas".
- **Esquerda:** formulário com Data início, Data fim, Vendedor (+ ícone de grupo), Nível (+ ícone de pódio), Tipo de meta, Valor e "Gravar" (azul-claro, desabilitado).
- **Direita:** tabela com filtros-funil no cabeçalho e o total em R$.
  - Linhas: período | VENDEDOR (+ tipo) | NÍVEL | R$ | ✓ verde.

### metas-07-popup-apagar-metas-fechadas
- **Como chegar:** relógio vermelho da coluna Fechar.
- **Alerta:**
  - triângulo vermelho + "Atenção!";
  - texto: "Você está apagando as metas fechadas desse vendedor. Essa ação não pode ser revertida! Deseja continuar?";
  - "SIM" (vermelho sólido) e "NÃO" (contorno). Fechei com NÃO.

### metas-08-popup-detalhe-comissoes-vendedor
- **Como chegar:** ícone de abrir ao lado do Valor faturado.
- **Topo:** botões azuis "Exportar para excel" e "Imprimir".
- **Tabela** com funis no cabeçalho: Qtd (1/25…) | Data entrega | Fornecedor | Cliente | Vendedor (filtro ativo em azul) | Produto | Comissão unit | Valor comissão (total no cabeçalho) | Nf fornecedor | Num pedido.
- Botão "✕ Fechar".

### metas-09-modal-entregas-da-barra
- **Como chegar:** clique numa barra da Análise de Entregas. Modal do HTML, não do Bubble.
- **Conteúdo:**
  - ⊗ vermelho + "Nome — entregas canceladas";
  - X em quadrado cinza;
  - busca com borda azul + pílula "1 entrega";
  - tabela Nº entrega | Fornecedor/Cliente | Data | Valor venda;
  - rodapé com os totais (a comissão perdida em vermelho).

### metas-10-mobile-390
- Cabeçalho e faixa de período se sobrepõem; "Criar Metas" fica cortado.
- O pódio vira círculos vazios.
- A tabela fica com o texto na vertical.

---

## historico

### historico-01-inicial
- **Sem parâmetro:** só 4 filtros de mesma largura: Núm pedido, Num NF Fornecedor, Num NF Megabox e Status recebimento (A RECEBER, RECEBIDO, A PAGAR, PAGO).
- O resto da página fica em branco (estado vazio sem mensagem).

### historico-03-pedido-carregado
- **Como chegar:** lápis da linha em /financeiro. O campo Núm pedido vem preenchido em azul, com o funil amarelo (filtro ativo).
- **Árvore com recuo** e barras verticais coloridas à esquerda:
  - **Cotação** (barra azul-marinho): cadeado, avatar, "Dt Cotação ⓘ", CLIENTE Nº, select Vendedor, links "Proposta 1/2", botões "Grava cotação" / "Grava histórico".
  - **Pedido** (barra azul, carrinho): "Pedido núm ⓘ", Dt Pedido, Condições de pagamento, "Grava pedido".
  - **Item** (barra **roxa**, ícone de caixa): NOME ⓘ; "Origem → Destino"; inputs de quantidade, valores, frete e alíquotas; totais em negrito; "Grava orçmto" / "Grava histórico".
  - **Entrega** (barra **amarela**, fundo creme, caminhão laranja + $ verde): vendedor/substituto, quantidades, valores, datas, NF, arquivo e Status; "Grava entrega" / "Grava histórico".
- Todos os "Grava…" ficam **cinza** enquanto o bloco está travado.
- Campos estreitos cortam os valores.
- O ⓘ não mostrou nada no clique nem no hover.

### historico-04-bloco-destravado
- **Como chegar:** cadeado da cotação.
- O cadeado vira um quadrado azul sólido; o select ganha borda azul; "Grava cotação" e "Grava histórico" ficam **azuis**.
- Travei de novo sem gravar.

### historico-02-mobile-390 (sem filtro) e historico-05-mobile-390-pedido
- Sem filtro: os 4 filtros ficam espremidos.
- Com o pedido: os blocos empilham parcialmente, os botões "Grava…" descem, os inputs dos itens ficam cortados à direita e o logo do cabeçalho é cortado.

---

## sac

Visual mais moderno que o resto do app: abas sublinhadas e cabeçalhos de tabela em azul arredondado.

### sac-01-inicial (aba Chamados)
- **Abas:** Chamados | Relatórios | Gestão NPS | Pós-Venda (ativa = texto azul + sublinhado grosso).
- **Topo:** "Dashboard de Chamados" + subtítulo em itálico; botão azul "+ Novo Chamado".
- **Cartão de filtros:** Buscar (largo), Status, Prioridade, botão "▽ Limpar".
- **Cabeçalho da tabela:** pílula **azul sólido** com texto branco em caixa alta: PROTOCOLO | CLIENTE (CNPJ) | PEDIDO | TIPO | PRIORIDADE | STATUS | RESPONSÁVEL.
- Lista vazia, sem mensagem.

### sac-02-popup-protocolo-sac
- **Como chegar:** "+ Novo Chamado".
- **Modal** de ~620 px com barra superior **azul** e X branco; aba "Protocolo".
- **Topo:** "Protocolo SAC" + "Registre e edite atendimentos…"; "Nº do Protocolo" em azul.
- **3 seções em cartão:**
  1. **Situação:** Tipo de Ocorrência (Atraso, Divergência de Pedido, Pedido incompleto, Financeiro, Qualidade, Outro), Prioridade (Baixa/Média/Alta), Status (Em aberto, Em análise, Pendente de informações, Resolvido).
  2. **Identificação:** rádios Cliente/Fornecedor, Número do Pedido, Quais entregas, Cliente/Fornecedor, Qual filial.
  3. **Dados:** Responsável, Anexos ("Clique para selecionar os arquivos" em azul), Descrição detalhada.
- **Rodapé:** "Cancelar" e "Gravar" (azul).

### sac-03-aba-relatorios
- "Indicadores e Métricas".
- "SLA Médio de Resolução": linha suavizada roxo-azulada com área lilás, marcadores brancos, Y em dias e X de Jan a Dez.
- "Volume por Tipo de Ocorrência": barras roxo-azuladas arredondadas por categoria.

### sac-04-aba-gestao-nps
- "Gestão de Pesquisa de Satisfação": select "Qual pesquisa?" e botão azul "+ Nova Pesquisa NPS".
- 3 KPI cards com ícone em círculo cinza: NPS Atual, Total de Respostas, Média da Avaliação.
- Busca com lupa azul.
- Toggles "NPS Respostas" e "Contatos": ligado = **verde**, e a tabela ganha a coluna RESPOSTAS.
- Tabela com cabeçalho **cinza**.

### sac-05-popup-nova-pesquisa-nps
- Modal pequeno (~290 px): barra azul com X; campo "Título pesquisa"; botão azul de largura total "Gravar NPS".

### sac-06-aba-pos-venda
- "Gestão de Respostas do Pós-Venda": cabeçalho azul DATA | CLIENTE (CNPJ) | QUAL VENDEDORA | STATUS.
- Status em pílula **verde-escura** "✓ Respondido".
- Notas com ★ amarela ("Nota Atendimento", "Nota Produto") e ícone de balão azul "Observação: …".
- Hover na linha: fundo cinza-claro. Os nomes carregam alguns segundos depois da tabela.

### sac-07-mobile-390
- É a página que melhor se adapta: as abas quebram em 2 linhas, título e botão empilham, e os filtros ficam lado a lado, truncados.

---

## cadastros

### cadastros-01-inicial
- **Título:** "Cadastros de" (vira "Cadastros de Cliente" ou "Cadastros de Fornecedor" conforme o tipo escolhido).
- **Cartão esquerdo:**
  - grupo com borda "Exibir lista de:" e rádios Cliente / Fornecedor;
  - checkbox com ícone "Clientes sem carteira";
  - botões azuis "+ Cliente" e "+ Fornecedor" (só aparece o do tipo escolhido);
  - contadores "Clientes ativos: N" (roxo) e "Fornecedores ativos: N" (azul);
  - linha de busca: ícone de calendário "Recente" (alterna para "Alfabética"), caixa com X e rádios Busca exata / Busca próxima / Busca Cnpj, select Estado, ícone "Todos".
- **Atenção:** o campo de texto da busca **só aparece depois de escolher um dos rádios de busca**. Antes disso não há onde digitar, e a lista fica vazia, sem mensagem.
- **Cartão direito (detalhe):**
  - bloco cinza com avatar, "Não contém contrato de parceria" em **laranja**, "Contém: 0 Endereços | 0 Contatos", Criado em / Por, e X;
  - seções "Endereços do cliente" e "Contatos do cliente", cada uma com o botão "+ Novo" (cinza e desabilitado enquanto não há registro selecionado).

### cadastros-02-lista-clientes-busca
- **Como chegar:** Cliente + "Busca próxima" + texto.
- A lista rola dentro do cartão. Cada item (fundo azul-claro, cantos arredondados) tem:
  - nº sequencial / total;
  - avatar circular;
  - NOME em caixa alta negrito, "Contém: N Endereços | N Contatos", "Criado em", "Por";
  - select azul "Carteira" (vendedor);
  - ícone de balão azul + "Ultima conversa: data" + "N dias";
  - ícone de documento azul "Anexos: N";
  - ícone ⊘ vermelho "Bloquear";
  - toggle **verde** "Ativo: sim".

### cadastros-03-cliente-selecionado
- **Como chegar:** clique no item.
- O item fica com o fundo azul mais forte.
- **Painel direito preenchido:** nome do cliente em azul e X **laranja**.
- **Endereços:** linha com razão social, CNPJ, local, lápis azul, ícone ⊙ cinza e toggle verde. O botão "+ Novo" fica **azul**.
- **Contatos:** nome, telefone, lápis e toggle verde.

### cadastros-04-popup-novo-endereco
- **Como chegar:** "+ Novo" em Endereços.
- É o mesmo componente do "Novo Cliente" (vendas-14), com:
  - título "Novo endereço do Cliente";
  - nome do cliente em azul, sem campo editável;
  - Carteira preenchida (borda azul);
  - "Destravar Campos" como botão **azul sólido**.

### cadastros-05-popup-novo-contato
- **Como chegar:** "+ Novo" em Contatos.
- **Modal** de ~590 px "Novo contato do cliente" (X azul):
  - avatar + nome do cliente em azul;
  - Nome;
  - Telefone com os rádios Sac / Fixo / Celular (Celular marcado);
  - Email; Cargo / Depto; "Vinculado ao endereço:" (select).
- **Botões:** "Gravar" (azul) e "Cancela" (contorno).

### cadastros-06-popup-historico-conversas
- **Como chegar:** ícone de balão "Ultima conversa" num item.
- **Modal** de ~780 px "Histórico de conversas" (X azul):
  - avatar + nome do cliente em azul;
  - campo "Descrição do atendimento" + ícone de disquete azul;
  - lista de mensagens com separadores: foto do vendedor à esquerda; "Criado: data - hora" e "Modificado: data - hora" (à direita); texto da conversa; "Vendedor: NOME" em cinza pequeno.
  - Registros automáticos (ex.: "Cliente criado/Endereço adicionado") aparecem com um avatar genérico.

### cadastros-07-lista-fornecedores
- **Como chegar:** rádio Fornecedor.
- O título muda para "Cadastros de Fornecedor" e só aparece o botão "+ Fornecedor".
- Os itens **não têm** a coluna Carteira nem "Ultima conversa".
- Fornecedor com contrato: **fundo verde-claro** e texto verde "Contrato de parceria anexo".

### cadastros-08-mobile-390
- O cabeçalho sobrepõe o título.
- Os dois cartões ficam lado a lado, estreitos, e os controles empilham.
- O painel de detalhe fica com o texto na vertical.

---

## relatorios

Página com 3 abas sublinhadas (ativa = azul): Relatório de Cotação | Relatório de Prospecção | Outros Relatórios. As duas primeiras são HTML embutido, com visual moderno (cartões brancos arredondados e ícones em quadrados coloridos).

### relatorios-01-inicial-vazio
- **Cabeçalho:** ícone de documento azul + "Relatório de Cotações" / "Análise completa — Tbl.Cotacao"; pílula "Não atualizado" (ícone de calendário); botão azul "↻ Atualizar Dados".
- **Cartão de filtros:** ícone "FILTROS" + selects MÊS, ANO, ARQUIVADO e VENDEDOR (rótulos em caixa alta com ícone); botão azul "🔍 Aplicar Filtros"; à direita, caixa lilás "(i) Taxa de Conversão — Pedidos + Cotações Ativas…".
- **Estado vazio:** "(i) Selecione os filtros e clique em Aplicar Filtros." Os KPIs aparecem com um traço colorido no lugar do número.

### relatorios-02-cotacao-filtros-aplicados (página inteira)
- "Aplicar Filtros" mostra "✓ N registro(s) carregados." em verde, e a pílula passa a mostrar data e hora.
- **5 KPIs** com ícone em quadrado de fundo pastel: Total de Cotações (azul), Em Cotação (azul), Virou Pedido (**verde**, carrinho), Arquivadas (**vermelho**, pasta), Taxa de Conversão (**roxo**, com "?" de ajuda).
- **INDICADORES DE PERFORMANCE** (seção recolhível, botão "−"):
  - "Melhor Vendedor do Mês" com 3 mini-cards de borda esquerda colorida: MAIOR FATURAMENTO (verde), MAIOR VOLUME DE COTAÇÕES (azul), MELHOR CONVERSÃO (roxo);
  - cards Ticket Médio ($ verde), Tempo Médio de Fechamento (relógio azul) e Conversão vs Mês Anterior (roxo, "↓ 26 p.p." em vermelho).
- **ANÁLISE GRÁFICA:** 4 cartões, cada um com uma etiqueta do tipo de gráfico:
  - "Status das Cotações" (Donut azul);
  - "Funil de Conversão" (funil em faixas azuis + barra final verde, com o texto "Conversão: 14,3%…");
  - "Conversão por Vendedor" (barras horizontais, a melhor em verde);
  - "Conversão ao Longo do Tempo" (linha roxa com área lilás e o comparativo com o mês anterior embaixo).

  Depois vêm "Motivo de Arquivamento" (pizza cinza com o estado "Sem arquivamentos") e "Cotações por Vendedor" (barras horizontais azuis + total).
- **DETALHAMENTO:** "Cotações do Período" + contador em pílula.
  - Tabela com cabeçalho **azul sólido** e ícones: # | Nº Cotação | Etapa | Status | Arquivado | Motivo Arq. | Validade | Vendedor.
  - Etapa em etiqueta: "Cotação" azul-claro ou "Pedir" verde.
  - Arquivado: etiqueta verde "Não".

### relatorios-03-ranking-aberto
- O botão "Ver ranking" vira "× Ocultar ranking" e abre, dentro do cartão, a tabela # | Vendedor | Cotações | Ativas | Pedidos | Conversão (roxo) | Faturamento.
- A posição fica num quadrado colorido (1º amarelo).

### relatorios-04-aba-prospeccao (página inteira)
- "Relatório de Prospecção" com ícone de alvo; pílula verde "● Atualizado hh:mm"; botão azul "Atualizar dados".
- Filtros: MÊS, ANO, VENDEDOR.
- **5 KPIs:** Enviadas (avião azul), Clientes (verde), Carteira (laranja), Média/dia (vermelho) e Cobertura (anel de progresso roxo).
- **"Destaques do mês":** 3 cards com barra superior colorida (laranja, azul, roxo), avatar com iniciais, nome e número grande.
- **"Ranking de Prospecção":** # (quadrado colorido) | Vendedor (avatar colorido com iniciais) | Propostas | Clientes (verde) | Carteira | Cobertura (barra de progresso com ponto vermelho + %) | Média/dia (fonte monoespaçada).
- **"Volume diário":** barras azuis por dia útil, com o rodapé "Pico: dia X · N propostas" e "Média: N/dia · N dias úteis".

### relatorios-05-aba-outros-inicial
- Esta aba é Bubble "puro", no estilo antigo.
- "Modelo de relatório": rádios Produtos / Clientes / Fornecedores; "Intervalo de entrega" (datas em azul); botão azul arredondado "🔍 Pesquisar".
- **Defeito visível:** o título "Relatório de Entregas (Clientes X Mês)" aparece **sobreposto** a uma mensagem de erro de tempo esgotado ("… (Timeout)"). Continua igual depois de clicar em Pesquisar.

### relatorios-06-mobile-390
- O relatório de cotações (HTML) é responsivo: os filtros empilham, e botões e cards ocupam a largura toda.
- As abas e o cabeçalho do Bubble se sobrepõem no topo.

---

## rotinas — página de manutenção (não migrar como tela)

Segundo o Julio, é uma página de gambiarras internas. Fica registrada só para constar.

### rotinas-01-inicial
- Uma parede de ~30 botões azuis de largura variável, alinhados em fluxo. Os rótulos são nomes de rotinas de correção de dados (ex.: "nome clifor maiusculo", "copia NF venda p/ contas receber"). Dois são **amarelos** e três têm estilo contorno/claro.
- No canto: "m el" e setas ← →.
- Abaixo:
  - uma caixa vazia;
  - um ícone de envelope;
  - um separador;
  - um select "Choose an option…" + botão "…edit me…" (elementos-modelo do Bubble não editados);
  - 3 colunas vazias;
  - um input com X e o checkbox "Busca exata";
  - um alternador "Monthly / Yearly";
  - a barra "Create / Cancel".

  É tudo resto de testes.
- **Nenhum botão foi clicado.**

### rotinas-02-mobile-390
- Os botões empilham.

---

## formulariovenda (público)

### formulariovenda-01-inicial
- Cabeçalho próprio, só com o logo centralizado sobre faixa cinza-clara com sombra. Fundo da página cinza-claro.
- **Cartão branco centralizado** (~590 px, cantos bem arredondados, sombra):
  - "Olá! / Sua opinião é muito importante para nós!";
  - 2 perguntas de escala 0–10 (atendimento e qualidade do produto), cada uma com 11 **círculos com contorno azul-escuro** e o número dentro (hover sem mudança visível);
  - "Comentários Adicionais e Sugestões" (textarea "Escreva aqui");
  - botão azul de largura total "Enviar".

### formulariovenda-02-mobile-390
- O cartão ocupa a largura toda.
- Os círculos quebram em duas linhas.

### formulariovenda-03-sem-login
- Idêntica à versão logada: a página é **pública**.

## formularionps (público)

### formularionps-01-inicial
- Mesmo layout de formulariovenda, com **uma** pergunta só: "…qual nota você atribui para o nosso serviço?" + comentários + "Enviar".

### formularionps-02-mobile-390
- Mesmo comportamento do mobile de formulariovenda.

### formularionps-03-sem-login
- Idêntica à versão logada: a página é **pública**.

---

## index (login) e reset_pw

### index-01-aviso-versao-teste
- **Como chegar:** Logout (ou abrir a raiz `/version-test/`).
- Página branca, com tudo centralizado:
  - logo grande "TESTE megabox";
  - texto cinza "Você está acessando a versão de testes do sistema Megabox. Essa versão contém dados desatualizados e instabilidade.";
  - "Clique **AQUI** para acessar a versão Live";
  - "Quero acessar a **VERSÃO DE TESTES**." (links em azul-escuro negrito).

### index-02-cartao-login
- **Como chegar:** "VERSÃO DE TESTES".
- Sobre o texto de aviso aparece um cartão branco com sombra leve:
  - toggle **cinza** "Administrador";
  - "Bem-vindo de volta !";
  - botão azul de largura total "Entrar (Testes)".

### index-03-login-administrador
- **Como chegar:** toggle "Administrador" ligado (fica **verde**).
- O cartão ganha os campos Email ("usuario@email.com", borda azul em foco) e Senha, acima de "Entrar (Testes)".
- Não há link "esqueci a senha" visível.

### index-04-mobile-390
- Tudo centralizado e empilhado. Funciona razoavelmente.

### reset_pw-01-inicial
- Faixa central com fundo azul-acinzentado claro, sobre fundo branco.
- Título "Reset your password" (em inglês, azul-marinho negrito).
- Cartão branco com "New password" e "Confirm new password" (placeholder de asteriscos) e botão azul "Confirm".
- É a página padrão do Bubble, sem tradução.

### reset_pw-02-mobile-390
- O cartão ocupa a largura toda.

---

## Pendências

1. Refazer `vendas-01` com a correção dos placeholders (hoje aparecem em azul).
2. Popups que não abri, com o motivo, estão na tabela-resumo.

## Ações feitas durante a sessão que você deve saber

- Cliquei uma vez no ícone de atualizar (setas) do pódio em /metas.
- Cliquei no chip "A receber" de uma linha em /financeiro. Não abriu nada, só destacou a linha.
- Marquei e desmarquei o checkbox de uma linha em /financeiro.
- Abri e fechei /historico pelo lápis.
- Destravei e travei o cadeado de uma cotação em /historico.
- Na 2ª sessão: em /relatorios cliquei em "Aplicar Filtros" (a pílula passou de "Não atualizado" para data e hora) e em "Pesquisar" (Outros Relatórios). Em /cadastros usei a busca e selecionei um cliente.
- Para fotografar index, reset_pw e os formulários sem login, **saí da conta (Logout)**. Você precisa entrar de novo.
- Não cliquei em nenhum Salvar, Gravar, Enviar, Excluir, Arquivar, Baixar, Duplicar ou Confirmar.
- Ficaram no navegador, na origem do app: as chaves de `localStorage` `__bc` e `__histurl`, o banco IndexedDB `capdb` (com as capturas) e uma janela auxiliar pequena ("capmobile"). Posso limpar tudo quando as imagens estiverem salvas.
