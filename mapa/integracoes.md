# Integrações (API Connector, App Connector, plugins)

Valores privados e cabeçalhos de autenticação omitidos.

## API `EstudoDePedidos` (bTpnn) — auth: ?
- chamada `API Call` (bTpno) · POST  · usar como: data · tipo de dado: ?
## API `LeituraGmail` (bUCHx) — auth: ?
- chamada `ListarMail` (bUCHy) · GET https://gmail.googleapis.com/gmail/v1/users/me/messages · usar como: data · tipo de dado: ?
  - parâmetros: maxResults, q
- chamada `LerMail` (bUCIK) · GET https://gmail.googleapis.com/gmail/v1/users/me/messages/[id] · usar como: data · tipo de dado: ?
- chamada `ObterToken2` (bUCQn) · POST https://oauth2.googleapis.com/token · usar como: action · tipo de dado: ?
  - parâmetros: client_id, client_secret, refresh_token, grant_type, redirect_uri
- chamada `RefreshToken2` (bUCRD) · POST https://oauth2.googleapis.com/token · usar como: action · tipo de dado: ?
  - parâmetros: client_id, client_secret, refresh_token, grant_type, access_type
- chamada `AbrirAnexo` (bUCTN) · GET https://gmail.googleapis.com/gmail/v1/users/me/messages/[messageId]/attachments/[atachmentid] · usar como: data · tipo de dado: ?
## API `GestaoLure` (bTlZL0) — auth: private_key_header
- chamada `GetCartoes(Action)` (bTleD) · GET https://gestaolure.bubbleapps.io/api/1.1/obj/Tbl.FunilCartao · usar como: action · tipo de dado: ?
  - parâmetros: QualEtapa, QualProjeto, QualPainel
- chamada `GetCartoes(Data)` (bTlZP0) · GET https://gestaolure.bubbleapps.io/api/1.1/obj/Tbl.FunilCartao · usar como: data · tipo de dado: ?
- chamada `CriarCartao` (bTlZQ0) · POST https://gestaolure.bubbleapps.io/api/1.1/wf/MegaBoxBugReport · usar como: action · tipo de dado: ?
  - parâmetros: Nomecartao, Descricao, Anexo, ParteSistema, Usuario

## App Connector (outros apps Bubble)
- bTksj2: app `?` · meta_data, name, calls, domain, is_oauth, match_versions

## Plugins instalados (id → versão)
- google: True
- chartjs: True
- select2: True
- dbconnector: True
- appconnector: True
- apiconnector2: True
- multifileupload: True
- 1488796042609x768734193128308700: 2.1.4
- 1497473108162x748255442121523200: 2.38.0
- 1498171554228x105618760361836540: 1.40.0
- 1519170218471x969128757943861200: 1.4.1
- 1543086664409x454646894723334140: 5.20.0
- 1558770956236x539499438875082750: 1.0.0
- 1583324666271x739637822593433600: 2.7.0
- 1602683113110x702948442872479700: 3.1.0
- 1609444246883x924984661248573400: 2.0.0
- 1617739938396x841575603972341800: 2.0.0
- 1637245706387x132899110531629060: 2.4.3
- 1642683387367x708220519175946200: 3.0.0
- 1648430145817x673906689668022300: 2.0.0
- 1648823245313x509054419018711040: 1.3.1
- 1658181838561x862832580805263400: 1.3.0
- 1658328157117x953686184769617900: 1.2.0
- 1680110374647x249108010620944400: 1.5.13
- 1685525155901x838124401560125400: 1.5.0
- 1691509762858x752107234800435200: 1.3.0
- 1695154888178x650605687409999900: 1.1.0
- 1748450415915x955078042637566000: 1.0.0
- 1752755029481x786229441209303000: 1.0.7
- 1753734310015x839297739754045400: 1.0.3
- 1753875729878x276985643861016580: 1.0.1

## Outras configurações
- idioma: pt_br · expõe Data API: True · expõe Workflow API: True · usa SendGrid: True · Google appid configurado: True
