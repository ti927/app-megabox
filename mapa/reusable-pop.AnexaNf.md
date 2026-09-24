# Reusable: `pop.AnexaNf` (bTbua)


Resumo: 59 elementos · 9 workflows · 24 ações · 50 condicionais · 0 estados customizados
Elementos por tipo: Group 23, Text 12, Button 6, HTML 5, Checkbox 3, Icon 3, Input 2, Popup 1, DateInput 1, FileInput 1, multifileupload-MultiFileInput 1, Plugin[1680110374647x249108010620944400]/AAC 1

## Árvore de elementos

- **Popup** `GroupFocus A` (bTbuf) — data_source: Parent · props: group_type="custom.tbl_entregas"
  - **Text** `Text B` (bTbum) — text: "Informações de entrega" · props: font_alignment="center"
  - **Group** `Group I` (bTcnr) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - ⟂ quando Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado) → is_visible=True
    - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=False
    - **Group** `gp envia arquivos segunda vez copy` (bTiFp0) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - ⟂ quando Page.Current Page Name:not_equals("financeiro") → is_visible=True
      - **Checkbox** `tgg nao emite nf` (bTiFr0) — label: "" · props: contents="dynamic_state", dynamic=Parent:cpo.NaoEmiteNF
      - **Text** `Text K` (bTiFv0) — text: "Fornecedor não emite nota fiscal"
    - **Group** `Group N` (bTefV) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Group** `Group M` (bTefH) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - **Group** `Group B` (bTbwx) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
          - **Text** `Text C` (bTbwq) — text: "Núm nota fiscal"
          - **Input** `ipt numero nf` (bTbvK) — placeholder: "Número NF" · content: "{Parent:cpo.NumNfFornecedor}" · props: mandatory=True, not_submit_on_enter=True
            - ⟂ quando El[tgg nao emite nf]:get_data → mandatory=False, bgcolor="var(--color_bTHGh_default)", disabled=True
        - **Group** `Group F` (bTcZJ) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
          - **Text** `Text E` (bTcZL) — text: "Data nota fiscal"
          - **DateInput** `ipt data nf` (bTcZP) — content: Parent:cpo.DtEmissaoNf · props: mandatory=True
            - ⟂ quando El[tgg nao emite nf]:get_data → mandatory=False, bgcolor="var(--color_bTHGh_default)", disabled=True
      - **Text** `alerta nf repetida` (bTeZN) — text: "* Já existe NF com esse número para esse fornecedor"
        - ⟂ quando Search(Tbl.Entregas: cpo.QualFornecedor equals Parent:cpo.QualFornecedor AND cpo.NumNfFornecedor equals "{El[ipt numero nf]:get_data}" AND cpo.StatusEntrega not equal Opt.Etapas.Cancelado AND _id not equal Parent:_id AND cpo.QualOrcamentoFornecedor not equal Parent:cpo.QualOrcamentoFornecedor):count:greater_or_equal_than(1) → is_visible=True
        - ⟂ quando Search(Tbl.Entregas: cpo.QualFornecedor equals Parent:cpo.QualFornecedor AND cpo.NumNfFornecedor equals "{El[ipt numero nf]:get_data}" AND cpo.StatusEntrega not equal Opt.Etapas.Cancelado AND _id not equal Parent:_id AND cpo.QualOrcamentoFornecedor not equal Parent:cpo.QualOrcamentoFornecedor):count:less_than(1) → is_visible=False
    - **Group** `gp anexa nota` (bTbwf) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Text** `Text A` (bTbwZ) — text: "Anexar nota fiscal"
        - ⟂ quando El[upf anexanota]:get_loading_status:is_true → text="Arquivo NF [fa]spinner fa-pulse[/fa]"
      - **Group** `gp upfnota` (bTbzp) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - **FileInput** `upf anexanota` (bTbvE) — placeholder: "Selecione arquivo de NF" · props: mandatory=True, font_alignment="left", vertical_centering=True, src="{Parent:cpo.ArquivoNfFornecedor}", max_size=5, unique_id="upfnota"
          - ⟂ quando This:get_loading_status:is_true → placeholder="Aguarde. Carregando..."
          - ⟂ quando This:is_focused → 
          - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - ⟂ quando El[tgg nao emite nf]:get_data → mandatory=False, font_color="var(--color_bTHGl_default)", bgcolor="var(--color_bTHGh_default)", disabled=True
        - **Icon** `btn abrir nota` (bTepP) — props: icon="material outlined open_in_new", vertical_centering=True
          - ⟂ quando El[upf anexanota]:get_data:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
    - **Group** `Group O` (bTefg) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Group** `Group S` (bTfTt) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - **Group** `Group L` (bTeVq) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
          - **Text** `Text G` (bTeVv) — text: "Anexar boletos"
          - **multifileupload-MultiFileInput** `upf boletos` (bTiDt0) — props: vertical_centering=True, initial=Parent:cpo.BoletoArquivos, message="  Selecione arquivo(s) de boleto", max_files=4, unique_id="remodela"
          - **Group** `Group U` (bTiPf) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
            - **Icon** `Icon B` (bTiPZ) — props: icon="material regular info", vertical_centering=True
            - **Text** `Text L` (bTiPT) — text: "Forma de pgto combinada: {Parent:cpo.QualPedido:cpo.PrazoRecebComissoes:display}"
    - **Group** `Group P` (bTefr) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Group** `gp envia arquivos primeira vez` (bTegK) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_true → is_visible=False
        - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_false → is_visible=True
        - **Checkbox** `tgg envianota primeiravez` (bTeWb) — label: "" · props: contents="dynamic_state", dynamic=Parent:cpo.NotaBoletoEnviada
        - **Text** `Text I` (bTefz) — text: "Envia nota fiscal e/ou boleto para o cliente"
      - **Group** `gp envia arquivos segunda vez` (bTiEj0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_true → is_visible=True
        - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_false → is_visible=False
        - **Checkbox** `tgg envianota segundavez` (bTiEo0) — label: ""
        - **Text** `Text J` (bTiEp0) — text: "Re-envia nota fiscal e/ou boleto para o cliente"
      - **Group** `Group E` (bTcAr) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → is_visible=False
        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Concluído) → is_visible=False
        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=False
        - **Plugin[1680110374647x249108010620944400]/AAC** `tgg saiuentrega` (bTcRd) — props: AAD=Parent:cpo.SaiuEntrega, AAG="rgba(53,206,97,1)", AAH="var(--color_bTHGl_default)", AAO="rgba(0,0,0,10)", AAP=0, AAR=0, ABC=True
        - **Text** `Text D` (bTcAl) — text: "Saiu para entrega"
  - **Group** `Group J` (bTcoE) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - ⟂ quando Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado) → is_visible=False
    - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=True
    - **Text** `Text F` (bTcoJ) — text: "Motivo cancelamento"
    - **Input** `ipt motivocancela` (bTcoK) — placeholder: "" · content: "{Parent:cpo.MotivoCancelamento}" · props: vertical_centering=True, not_submit_on_enter=True
  - **Group** `gp grava naocancelado` (bTcAO) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - ⟂ quando Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado):and_(Page.Current Page Name:not_equals("financeiro")) → is_visible=True
    - **Button** `Button Gravar não cancelado` (bTbvQ) — text: "Gravar" · props: vertical_centering=True, button_disabled=True
      - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_true:and_(El[tgg envianota segundavez]:get_data) → bgcolor="var(--color_primary_default)", button_disabled=False
      - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_false:and_(El[tgg envianota primeiravez]:get_data) → bgcolor="var(--color_primary_default)", button_disabled=False
      - ⟂ quando Parent:cpo.ArquivoNfFornecedor:url:not_equals(El[upf anexanota]:get_data) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.NumNfFornecedor:not_equals(El[ipt numero nf]:get_data) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.SaiuEntrega:is_true:and_(El[tgg saiuentrega]:get_AAI:is_false) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.SaiuEntrega:is_false:and_(El[tgg saiuentrega]:get_AAI:is_true) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.BoletoArquivos:count:not_equals(El[upf boletos]:get_data:count) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.MotivoCancelamento:not_equals(El[ipt motivocancela]:get_data) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
    - **Button** `Button Cancela naocancelado` (bTcAI) — text: "Cancela"
  - **Group** `gp grava financeiro` (bUEqo0) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - ⟂ quando Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado):and_(Page.Current Page Name:equals("financeiro")) → is_visible=True
    - **Button** `Button Gravar financeiro` (bUEqt0) — text: "Gravar" · props: vertical_centering=True, button_disabled=True
      - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_true:and_(El[tgg envianota segundavez]:get_data) → bgcolor="var(--color_primary_default)", button_disabled=False
      - ⟂ quando Parent:cpo.NotaBoletoEnviada:is_false:and_(El[tgg envianota primeiravez]:get_data) → bgcolor="var(--color_primary_default)", button_disabled=False
      - ⟂ quando Parent:cpo.ArquivoNfFornecedor:url:not_equals(El[upf anexanota]:get_data) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.NumNfFornecedor:not_equals(El[ipt numero nf]:get_data) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.SaiuEntrega:is_true:and_(El[tgg saiuentrega]:get_AAI:is_false) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.SaiuEntrega:is_false:and_(El[tgg saiuentrega]:get_AAI:is_true) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.BoletoArquivos:count:not_equals(El[upf boletos]:get_data:count) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
      - ⟂ quando Parent:cpo.MotivoCancelamento:not_equals(El[ipt motivocancela]:get_data) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
    - **Button** `Button Cancela naocancelado` (bUEqu0) — text: "Cancela"
  - **Group** `gp grava cancelado` (bTcoc) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=True
    - **Button** `Button Gravarcancelado` (bTcoh) — text: "Gravar" · props: vertical_centering=True, button_disabled=True
      - ⟂ quando Parent:cpo.MotivoCancelamento:not_equals(El[ipt motivocancela]:get_data) → bgcolor="var(--color_bTHGs_default)", button_disabled=False
    - **Button** `Button Cancela cancelado` (bTcoi) — text: "Cancela"
- **Group** `botao anexa nf` (bTmJL0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - ⟂ quando This:get_group_data:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → button_disabled=True
  - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(Page.Current Page Name:equals("financeiro")) → button_disabled=False
  - **HTML** `HTML D` (bTcnb) — oculto ao carregar · html(52 chars) · props: vertical_centering=True
  - **Group** `gp caminhaonormal` (bTcmH0) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Pedir):or_(Parent:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)):or_(Parent:cpo.StatusEntrega:equals(Opt.Etapas.Pedido)) → is_visible=True
    - **HTML** `btn fumacinha` (bTbvW) — html(201 chars)
      - ⟂ quando Parent:cpo.SaiuEntrega:is_true:and_(Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado)) → html="<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#108f66"><path d="M800-80v-800h80v800h-80ZM320-280v-120h400v120H320ZM80-560v-120h640v120H80Z"/></svg>", icon_color="var(--color_bTHHX_default)"
    - **HTML** `btn show enderecos` (bTbub) — html(576 chars)
      - ⟂ quando Parent:cpo.SaiuEntrega:is_true:and_(Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado)) → html="<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#108f66"><path d="M240-160q-50 0-85-35t-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T280-280q0-17-11.5-28.5T240-320q-17 0-28.5 11.5T200-280q0 17 11.5 28.5T240-240ZM120-360h32q17-18 39-29t49-11q27 0 49 11t39 29h272v-360H120v360Zm600 120q17 0 28.5-11.5T760-280q0-17-11.5-28.5T720-320q-17 0-28.5 11.5T680-280q0 17 11.5 28.5T720-240Zm-40-200h170l-90-120h-80v120ZM360-540Z"/></svg>", icon_color="var(--color_bTHHX_default)"
  - **Group** `gp caminhaoinvertido` (bTcmx0) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True, unique_id="caminhao"
    - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=True
    - **HTML** `btn fumacinha` (bTcnC0) — html(201 chars)
    - **HTML** `btn show enderecos` (bTcnD0) — html(576 chars)
  - **Icon** `Icon C` (bTmJF0) — oculto ao carregar · props: icon="material outlined thumb_up", vertical_centering=True
    - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → is_visible=True
    - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(Page.Current Page Name:equals("financeiro")) → icon="material outlined attach_file", icon_color="var(--color_primary_default)"

## Workflows

#### WF bTbux — ButtonClicked em El[botao anexa nf]
1. **ToggleElement** [bTbuy] alvo El[GroupFocus A]

#### WF bTcBK — ButtonClicked em El[Button Cancela naocancelado]
1. **HideElement** [bTcBQ] alvo El[GroupFocus A]
2. **ResetGroup** [bTcQP] alvo El[GroupFocus A]

#### WF bTcRH — ButtonClicked em El[Button Gravar não cancelado]
- condição: El[tgg saiuentrega]:get_AAI:is_true
1. **HideElement** [bTcRN] alvo El[GroupFocus A]
2. **ChangeThing** [bTcRM] campos: cpo.ArquivoNfFornecedor = "{El[upf anexanota]:get_data}"; cpo.NumNfFornecedor = "{El[ipt numero nf]:get_data}"; cpo.StatusEntrega = Opt.Etapas.Em Entrega; cpo.SaiuEntrega = El[tgg saiuentrega]:get_AAI; cpo.DtEmissaoNf = El[ipt data nf]:get_data; cpo.BoletoArquivos = El[upf boletos]:get_data; cpo.NotaBoletoEnviada = El[tgg envianota primeiravez]:get_data; cpo.NaoEmiteNF = El[tgg nao emite nf]:get_data · to_change=Parent
3. **SendEmail** [bTiFG0] SÓ SE El[tgg envianota primeiravez]:get_data:or_(Parent:cpo.NotaBoletoEnviada:is_true):and_(El[tgg envianota segundavez]:get_data) · cc="{CurrentUser:email}", to="{El[GroupFocus A]:get_group_data:cpo.QualPedido:cpo.EmailCliente:cpo.Email}", body="Olá {Parent:cpo.QualPedido:cpo.EmailCliente:cpo.NomeContato:to_uppercase}⏎⏎Segue anexo nota fiscal e boleto referente ao pedido {Parent:cpo.QualPedido:cpo.NumeroPedido} ({Text("{Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QtdVenda}")})⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]", subject="Nota fiscal e Boleto - (Pedido núm {Parent:cpo.QualPedido:cpo.NumeroPedido})", bcc="{CurrentUser:cpo.CopiaPedido}", replyTo="{CurrentUser:email}", sender_name="{CurrentUser:cpo.NomeModelo:to_capitalized_words}", different_reply_to=True, list_of_attachments={0={value="{El[upf anexanota]:get_data}"}, 1={value="{El[upf boletos]:get_data:first_element}"}, 2={value="{El[upf boletos]:get_data:specific_item(2)}"}, 3={value="{El[upf boletos]:get_data:specific_item(3)}"}, 4={value="{El[upf boletos]:get_data:last_element}"}}
4. **ResetInputs** [bThGA] 
5. **ChangeThing** [bTyBZ] SÓ SE ResultOfStep[bTcRM]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(ResultOfStep[bTcRM]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = InjectedValue:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=ResultOfStep[bTcRM]

#### WF bTcZR — ButtonClicked em El[Button Gravar não cancelado]
- condição: El[tgg saiuentrega]:get_AAI:is_false
1. **HideElement** [bTcZX] alvo El[GroupFocus A]
2. **ChangeThing** [bTcZW] campos: cpo.ArquivoNfFornecedor = "{El[upf anexanota]:get_data}"; cpo.NumNfFornecedor = "{El[ipt numero nf]:get_data}"; cpo.StatusEntrega = Opt.Etapas.Pedido; cpo.SaiuEntrega = El[tgg saiuentrega]:get_AAI; cpo.DtEmissaoNf = El[ipt data nf]:get_data; cpo.NotaBoletoEnviada = El[tgg envianota primeiravez]:get_data; cpo.BoletoArquivos = El[upf boletos]:get_data; cpo.NaoEmiteNF = El[tgg nao emite nf]:get_data · to_change=Parent
3. **PauseWFClient** [bTepJ] 
4. **SendEmail** [bTiFB0] SÓ SE El[tgg envianota primeiravez]:get_data:or_(Parent:cpo.NotaBoletoEnviada:is_true):and_(El[tgg envianota segundavez]:get_data) · cc="{CurrentUser:email}", to="{El[GroupFocus A]:get_group_data:cpo.QualPedido:cpo.EmailCliente:cpo.Email}", body="Olá {Parent:cpo.QualPedido:cpo.EmailCliente:cpo.NomeContato:to_uppercase}⏎⏎Segue anexo nota fiscal e boleto referente ao pedido {Parent:cpo.QualPedido:cpo.NumeroPedido} ({Text("{Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QtdVenda}")})⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]", subject="Nota fiscal e Boleto - (Pedido núm {Parent:cpo.QualPedido:cpo.NumeroPedido})", bcc="{CurrentUser:cpo.CopiaPedido}", replyTo="{CurrentUser:email}", sender_name="{CurrentUser:cpo.NomeModelo:to_capitalized_words}", different_reply_to=True, list_of_attachments={0={value="{El[upf anexanota]:get_data}"}, 1={value="{El[upf boletos]:get_data:first_element}"}, 2={value="{El[upf boletos]:get_data:specific_item(2)}"}, 3={value="{El[upf boletos]:get_data:specific_item(3)}"}, 4={value="{El[upf boletos]:get_data:last_element}"}}
5. **ResetInputs** [bThFz] 
6. **ChangeThing** [bTyBe] SÓ SE ResultOfStep[bTcZW]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(ResultOfStep[bTcZW]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = InjectedValue:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=ResultOfStep[bTcZW]

#### WF bTcon — ButtonClicked em El[Button Gravarcancelado]
1. **ChangeThing** [bTcot] campos: cpo.MotivoCancelamento = "{El[ipt motivocancela]:get_data}" · to_change=Parent
2. **HideElement** [bTcou] alvo El[GroupFocus A]

#### WF bTcrF — ButtonClicked em El[Button Cancela cancelado]
1. **HideElement** [bTcrK] alvo El[GroupFocus A]
2. **ResetGroup** [bTcrL] alvo El[GroupFocus A]

#### WF bTepV — ButtonClicked em El[btn abrir nota]
1. **OpenURL** [bTepb] open_in_new_tab=True, url="{Parent:cpo.ArquivoNfFornecedor:url}"

#### WF bTiEL0 — ButtonClicked em El[Text I]

#### WF bUErF0 — ButtonClicked em El[gp grava financeiro]
- condição: El[tgg saiuentrega]:get_AAI:is_true
1. **HideElement** [bUErH0] alvo El[GroupFocus A]
2. **ChangeThing** [bUErL0] campos: cpo.ArquivoNfFornecedor = "{El[upf anexanota]:get_data}"; cpo.NumNfFornecedor = "{El[ipt numero nf]:get_data}"; cpo.DtEmissaoNf = El[ipt data nf]:get_data; cpo.BoletoArquivos = El[upf boletos]:get_data; cpo.NotaBoletoEnviada = El[tgg envianota primeiravez]:get_data · to_change=Parent
3. **SendEmail** [bUErM0] SÓ SE El[tgg envianota primeiravez]:get_data:or_(Parent:cpo.NotaBoletoEnviada:is_true):and_(El[tgg envianota segundavez]:get_data) · cc="{CurrentUser:email}", to="{El[GroupFocus A]:get_group_data:cpo.QualPedido:cpo.EmailCliente:cpo.Email}", body="Olá {Parent:cpo.QualPedido:cpo.EmailCliente:cpo.NomeContato:to_uppercase}⏎⏎Segue anexo nota fiscal e boleto referente ao pedido {Parent:cpo.QualPedido:cpo.NumeroPedido} ({Text("{Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QtdVenda}")})⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]", subject="Nota fiscal e Boleto - (Pedido núm {Parent:cpo.QualPedido:cpo.NumeroPedido})", bcc="{CurrentUser:cpo.CopiaPedido}", replyTo="{CurrentUser:email}", sender_name="{CurrentUser:cpo.NomeModelo:to_capitalized_words}", different_reply_to=True, list_of_attachments={0={value="{El[upf anexanota]:get_data}"}, 1={value="{El[upf boletos]:get_data:first_element}"}, 2={value="{El[upf boletos]:get_data:specific_item(2)}"}, 3={value="{El[upf boletos]:get_data:specific_item(3)}"}, 4={value="{El[upf boletos]:get_data:last_element}"}}
4. **ResetInputs** [bUErN0] 
5. **ChangeThing** [bUErR0] SÓ SE ResultOfStep[bUErL0]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(ResultOfStep[bUErL0]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = InjectedValue:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=ResultOfStep[bUErL0]
