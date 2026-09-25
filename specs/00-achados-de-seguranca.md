# Achados de segurança do Bubble `grupomegabox`

Consolidado em 24/09/2026, a partir do mapa decompilado (`mapa/`) e das 12 specs funcionais de
`specs/paginas/`. Cada item cita a fonte no mapa, que é o que permite conferir.

Este arquivo existe porque os achados nasceram espalhados por doze specs e alguns **não esperam o
corte**: são credenciais em circulação e dado pessoal legível por qualquer pessoa na internet hoje.
A separação abaixo é por urgência, não por gravidade.

> Nenhum valor de segredo é transcrito aqui. Onde há credencial, cito só o campo que a guarda.

---

## Resumo em uma linha

O app expõe Data API e Workflow API; **18 das 34 tabelas não têm regra de privacidade nenhuma** e
as outras 16 têm `everyone` com `view_all`/`search_for`; a senha dos usuários é gravada em texto
puro num desses campos; e a autorização do sistema é CSS. Dinheiro é calculado no navegador e
gravado direto no banco por auto-binding, sem workflow, sem transação e sem autoria.

---

## 0. Verificado ao vivo em 25/09/2026

O restante deste arquivo foi escrito a partir das privacy rules do mapa decompilado. Estes
dois itens foram **confirmados contra o app em produção**, com requisição real. Nenhum
conteúdo de registro foi lido ou gravado — só as contagens abaixo.

### 0.1 A Data API responde sem nenhuma autenticação

`GET https://grupomegabox.bubbleapps.io/api/1.1/obj/<tipo>?limit=1`, **sem cabeçalho
`Authorization`**, devolve HTTP 200 com dado:

| Tipo | Registros acessíveis |
|---|---|
| `tbl.cotacao` | 5.954 |
| `tbl.grupoclifor` | 4.743 |
| `user` | 31 |

`user` é o que dói: `mapa/data-types.md` mostra que o tipo carrega `cpo.PassTexto` — a senha
em texto puro (§1.2). Ou seja, **qualquer pessoa na internet lê nome, e-mail, CPF, RG e senha
de todos os 31 usuários**, sem credencial nenhuma, e a carteira inteira de clientes junto.

Isto eleva o §1.2 de "toda senha deve ser considerada comprometida" a fato consumado, e
transforma o §2.7 ("o Bubble continua no ar depois do corte?") na decisão mais urgente do
projeto — não do corte.

### 0.2 `/api/1.1/meta` é público e entrega o mapa da API

Mesma requisição sem autenticação devolve o esquema completo: os **29 data types com todos os
campos** e os **24 endpoints da Workflow API com seus parâmetros**. É o índice que torna o
§0.1 trivial de explorar e o §2.1 (backend workflow exposto) fácil de encontrar.

### 0.3 O que fazer, em ordem

1. Em Settings → API do Bubble, **desmarcar a exposição pública** dos data types, ou pôr o app
   em modo que exija autenticação na Data API.
2. Só então tratar as credenciais do §1.
3. Reavaliar o §2.7: enquanto o Bubble estiver no ar assim, nada do que se faça no app novo
   protege este dado.

> Nota de escopo: `tools/extrair-bubble.mjs` depende desta mesma API para a migração. Fechar a
> exposição pública **não** atrapalha — a extração usa `BUBBLE_API_KEY`, e passar a exigir a
> chave é justamente o comportamento correto.

---

## 1. Agir agora (credencial em circulação)

### 1.1 Senha do Gmail de disparo, em texto puro num option set
`mapa/option-sets.md` → `Opt.Smtp` (`opt_smtp`), opção `GmailMegabox`: atributos `smtp`, `user`,
`porta`, `security` e **`senha`**, com a senha de aplicativo do Google preenchida. A conta é
`noreply.megabox@gmail.com`.

Por que é grave: **option set do Bubble é baixado pelo navegador**. Não é um segredo de servidor
que escapou — é um valor público desde sempre, para qualquer visitante do app. É consumida em
`mapa/backend-workflows.md`, `EnviarEmailsGeral` (bTnvb0), ação bUBma, parâmetros `AAU`–`AAY`.

**Ação:** revogar a senha de aplicativo no Google e emitir outra. No app novo, credencial de SMTP
é variável de ambiente do servidor (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`), nunca tabela nem
option set.

> Observação de escopo: este valor também está em `mapa/option-sets.md`, arquivo versionado neste
> repositório, que é público. Decisão registrada do dono do projeto em 24/09/2026: publicar como
> está. A rotação da credencial é o que neutraliza a exposição.

### 1.2 Senha de todos os usuários legível sem autenticação
`mapa/data-types.md` → `User`, campo `cpo.PassTexto` (`cpo_passtexto_text`, tipo `text`), e regra de
privacidade `everyone` — condição *todos*, inclusive deslogado — com `view_all: true` e
`search_for: true`. `mapa/integracoes.md` confirma `expõe Data API: True`.

Consequência: `GET /api/1.1/obj/user` devolve nome, e-mail, CPF, RG, endereço, telefone, perfil
**e a senha em claro** de todos os usuários, sem credencial nenhuma.

Onde a senha é gravada: `specs/paginas/casca-e-configuracao.md` §4 — criação de usuário
(WF bTgml) e resets (bTgpl, bTfQL). E `specs/paginas/inicio-e-acesso.md` §4 mostra que
`reset_pw` **não tem workflow nenhum**: o usuário nunca trocou a própria senha, então as senhas em
circulação são as temporárias geradas no cadastro.

**Ação:** tratar **toda** senha atual como comprometida. Nenhuma migra. Convite/reset pelo Supabase
Auth para 100% das contas, e orientação para trocar a senha em qualquer outro serviço onde ela tenha
sido reaproveitada. No modelo novo a tabela `usuarios` **não tem coluna de senha**
(`specs/paginas/inicio-e-acesso.md` §9.4).

### 1.3 Tokens do Google em tabela pública, exibidos em tela
`mapa/backend-workflows.md` → `RefreshTokenGoogle` (bUCKC) grava `access_token` em
`ConfigSistema[CodigoConfig=21].ValorTexto1` e lê o `refresh_token` de `ValorTexto2`.
`mapa/data-types.md` → `Tbl.ConfigSistema` tem regra `everyone` com `view_all`/`search_for`.
`specs/paginas/casca-e-configuracao.md` §7 registra que os valores aparecem na própria tela.

O `client_id`/`client_secret` do OAuth ficam no API Connector (`mapa/integracoes.md`, API
`LeituraGmail` bUCHx, chamadas `ObterToken2`/`RefreshToken2`), que no Bubble é resolvido no cliente.

**Ação:** revogar o refresh token e o client secret no Google Cloud. No app novo, token de
integração vai para tabela com RLS **e nenhuma policy** (só `service_role`), nunca para tela.

### 1.4 Chave do App Connector "GestaoLure"
`mapa/integracoes.md` → API `GestaoLure` (bTlZL0), auth `private_key_header`, apontando para
`gestaolure.bubbleapps.io`. É uma chave de outro app da casa.

**Ação:** rotacionar junto, e conferir se o app `gestaolure` tem o mesmo problema de privacidade.

### 1.5 Chave da API do Bubble usada no mapeamento
`docs/plano-de-migracao.md` §7 registra que a chave foi colada em chat e passou pelo sandbox do
Zapier. **Ação:** rotacionar depois da extração final, no corte.

---

## 2. Fechar no Bubble antes do corte (dado exposto)

### 2.1 Backend workflow público que escreve no banco
`mapa/backend-workflows.md` → `VicularOcamentoCopiaAoProdutoCopia` (bUAeU), props
`expose=True, auth_unecessary=True, ignore_privacy_rules=True`. Qualquer pessoa com a URL dispara,
sem autenticação e ignorando privacidade, e o passo bUAfd **cria uma `Tbl.Cotacao`**.

Dos 28 backend workflows, só `AtribuirCriadorVendedor` (bTtji), `AtribuirModeloProdutoOrcamento`
(bUAhf), `ResetContagemEmails` (bUBmh) e `AtribuirVendedorSubstituto` (bUBpN) declaram
`expose=False`. Os demais não declaram nada, com a Workflow API ligada —
`specs/paginas/rotinas.md` [DÚVIDA 8] pede auditoria item a item no editor.

### 2.2 As 18 tabelas sem regra de privacidade nenhuma
Levantadas por script sobre `mapa/data-types.md`:

`Tbl.Anexos` · `Tbl.BugReport` · `Tbl.Chamado` · `Tbl.cnpjformatado` · `Tbl.Cobrancas` ·
`Tbl.ContasReceberImportado` · `Tbl.Cotacao` · `Tbl.Historico` · `Tbl.MetaAdicional` ·
`Tbl.MetasFechadas` · `Tbl.MetasMensais` · `Tbl.PerfilUsuario` · `Tbl.PesquisaNps` ·
`Tbl.PesquisaRespostas` · `Tbl.ProdutosGrupo` · `Tbl.ProdutosTipo` · `Tbl.SacHistorico` ·
`Tbl.SacProtocolo`

Casos que doem mais:
- **`Tbl.Historico`** guarda o corpo completo de e-mails de prospecção em `Descricao`
  (`specs/paginas/historico.md` §7) — histórico comercial inteiro em leitura aberta.
- **`Tbl.Anexos`** aponta para arquivos que abrem por URL pública de CDN do Bubble, contrato social
  e documento pessoal incluídos (`specs/paginas/cadastros.md` §7).
- **`Tbl.MetasFechadas` / `Tbl.MetasMensais`** expõem meta, realizado e comissão de cada vendedor
  (`specs/paginas/metas.md` §7).
- **`Tbl.PesquisaRespostas`** expõe nota e comentário livre de cada cliente
  (`specs/paginas/sac.md` §7).

A única tabela com regra restritiva no app inteiro é `Tbl.Propostas`
(`everyone` com `view_all: false`).

### 2.3 Auto-binding: qualquer logado grava no banco sem workflow
`auto_binding: true` com `binding_fields` na regra `autobinding` de `mapa/data-types.md`. Os campos
liberados incluem, literalmente:

| Tabela | Campos graváveis direto | Por que importa |
|---|---|---|
| `Tbl.ConfigSistema` | `QuaisDeptos`, `QuaisPerfis`, `QuaisUsuarios` | **é a tabela de permissão**: qualquer logado se dá acesso a qualquer página |
| `Tbl.ContasReceber` | `QualPrazo`, `DataVencimento`, `ValorComissao` | altera valor e vencimento de conta a receber |
| `Tbl.ContasPagar` | `DataVencimento` | altera vencimento de comissão a pagar |
| `Tbl.OrcFornecedoresCotacao` | `TributosICMS` (`cpo_tributos_number`), `ValorComissaoUnit`, `ValorPISCOFINS` | altera alíquota e comissão do orçamento |
| `Tbl.IcmsEstados` | `AliquotaIcms` | altera a alíquota de ICMS de toda origem × destino |
| `Tbl.NiveisVendedores` | `MetaVenda`, `ComissaoMetaBatida`, `ComissaoPadrao`, `QuaisVendedores` | altera meta e percentual de comissão |
| `Tbl.EnderecosCliFor` | `Liberado` (`cpo_bloqueado_boolean`), `LiberadoMotivo`, `QualRegimeTributario` | desbloqueia cliente e muda o regime fiscal |
| `Tbl.GrupoCliFor` | `Ativo`, `QualCarteira` | transfere carteira de cliente |
| `Tbl.Entregas` | `QtdEntrega`, `DtEntrega`, `NumNfFornecedor`, arquivos | altera a base do cálculo da comissão |
| `Tbl.Pedido` | `PedidoFinalizado` (`cpo_entregasdespachadas_boolean`), OC, e-mails | finaliza pedido |
| `User` | `Ativo` (na regra `everyone`, condição *todos*) | |

Nada disso passa por workflow: não há validação, não há registro de quem alterou, não há
transação.

### 2.4 Senha guardada no navegador
`specs/paginas/casca-e-configuracao.md` §7 e `specs/paginas/inicio-e-acesso.md` §4: "fixar usuário"
(WF bTkSX, ação bTkSd) grava `nome|email|senha` no `localStorage` a partir de `PassTexto`, e
`index` WF bTfRk faz `LogOut` + `LogIn` com essa senha em claro. O logout não limpa a chave, e o
elemento `Text E` (bThhe) chega a renderizar a senha na tela de login.

### 2.5 Formulários públicos sem token
`specs/paginas/formularios-publicos.md` §7: `formulariovenda` e `formularionps` não têm token, nem
prazo, nem uso único — o identificador é o `_id` do Bubble (do cliente e da resposta,
respectivamente). Com a Data API aberta dá para listar os ids e responder em nome de qualquer
cliente, em massa. Pior: a ação bUEHr0 usa `Search(Tbl.PesquisaRespostas)` sem restrição, então
**as notas e os comentários livres de todos os clientes descem para o navegador anônimo**.

### 2.6 Rotinas destrutivas sem trava
`specs/paginas/rotinas.md` §7: a página `/rotinas` não tem guarda alguma além de CSS no menu, e
nenhum botão pede confirmação ou checa perfil. Entre elas, `Button CZ` (bTprj) estorna **todas** as
baixas de contas a receber sem filtro, e bTmUN0 apaga pedidos, entregas e propostas.
`specs/paginas/cadastros.md` §7: WF bTjeL apaga **todos** os anexos de um cliente num clique, sem
confirmação e sem restrição de perfil — enquanto apagar **um** exige hierarquia ≤ 2.

### 2.7 O Bubble continua no ar depois do corte?
Enquanto estiver, tudo acima continua valendo. `specs/paginas/inicio-e-acesso.md` [DÚVIDA 17].
**Recomendação padrão:** no corte, desligar a Data API e a Workflow API e restringir as privacy
rules, mesmo mantendo o app acessível para consulta.

---

## 3. O que o app novo tem de impor (não é migração, é reconstrução)

Deriva direto das regras 3, 4 e 10 do `CLAUDE.md` e detalha o que cada spec propôs na sua §9.

1. **RLS ligada em toda tabela na primeira migration**, com policy explícita. Nenhuma tabela nasce
   sem policy; `integracao_tokens` nasce com RLS e **nenhuma** policy (só `service_role`).
2. **Autorização no servidor, não no menu.** A liberação por option set no navegador vira
   `permissoes_pagina` + as funções `fn_tem_hierarquia`, `fn_usuario_ativo` e
   `fn_pode_acessar_pagina` (`security definer`, `search_path = ''`) usadas pelas policies das
   demais tabelas. Hierarquia: Diretor 1, Gerente 2, Analista 3, Operador 4.
3. **Zero senha no banco de aplicação.** Supabase Auth; `usuarios` referencia `auth.users`.
4. **Nenhum segredo em tabela.** Variável de ambiente para credencial de serviço; token de
   integração em tabela sem policy. `service_role` nunca sai do servidor, nada de
   `NEXT_PUBLIC_` em chave de servidor (`CLAUDE.md` regra 4).
5. **Dinheiro só no servidor.** Todo cálculo de comissão, meta, parcela e ICMS em função SQL ou
   server action, em `numeric`, dentro de transação, com teste. Nunca a partir de valor que veio
   da tela — hoje `metas` cria a conta a pagar com o número que está no input
   (`specs/paginas/metas.md` §5).
6. **Arquivo em bucket privado** do Supabase Storage, com URL assinada de vida curta. NF, boleto,
   comprovante, contrato social e documento pessoal nunca em URL pública.
7. **Auditoria imutável.** Trilha em tabela própria com UPDATE/DELETE revogados. Hoje o histórico é
   o oposto: editar sobrescreve o texto **e troca o autor**
   (`specs/paginas/historico.md` §7, `specs/paginas/cadastros.md` [DÚVIDA 18]).
8. **Formulário público por token opaco** com prazo e uso único (`token_hash`), gravação por server
   action, `anon` sem policy de leitura, limite de tentativas.
9. **Rotina destrutiva com trava tripla:** perfil, confirmação explícita e dry-run com relatório
   antes de aplicar.
10. **Nenhum nome de pessoa em código.** Hoje há condicionais que liberam acesso por nome próprio
    fixo (`specs/paginas/metas.md` §7, `specs/paginas/casca-e-configuracao.md` [DÚVIDA 4]).

---

## 4. Rastreabilidade

| Achado | Spec de origem | Fonte no mapa |
|---|---|---|
| Senha SMTP em option set | `formularios-publicos`, `casca-e-configuracao`, `sac` | `option-sets.md` → `Opt.Smtp`; `backend-workflows.md` bTnvb0/bUBma |
| `PassTexto` público | `inicio-e-acesso`, `casca-e-configuracao` | `data-types.md` → `User` |
| Tokens do Google | `casca-e-configuracao`, `inicio-e-acesso`, `sac` | `backend-workflows.md` bUCKC; `integracoes.md` bUCHx |
| Backend WF exposto | `rotinas`, `vendas` | `backend-workflows.md` bUAeU |
| Tabelas sem privacy rule | `sac`, `metas`, `historico`, `cadastros` | `data-types.md` (script) |
| Auto-binding em dinheiro | `financeiro`, `metas`, `enderecos-e-contatos` | `data-types.md` (`binding_fields`) |
| Senha no `localStorage` | `casca-e-configuracao`, `inicio-e-acesso` | `reusable-pop.CadastroUsuarios.md` bTkSX; `pagina-index.md` bTfRk |
| Formulário sem token | `formularios-publicos` | `pagina-formulariovenda.md`, `pagina-formularionps.md` |
| Rotina destrutiva sem trava | `rotinas`, `cadastros` | `pagina-rotinas.md` bTprj; `backend-workflows.md` bTmUN0 |
| Comissão calculada na tela | `metas` | `pagina-metas.md` bTwAj/bTzXn |
