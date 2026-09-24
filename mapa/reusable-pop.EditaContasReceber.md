# Reusable: `pop.EditaContasReceber` (bTiin)


Resumo: 112 elementos · 9 workflows · 15 ações · 22 condicionais · 0 estados customizados
Elementos por tipo: Text 32, TableCell 24, Group 16, TableMainAxis 12, Icon 5, TableCrossAxis 4, Input 3, Button 3, Table 2, FileInput 2, DateInput 2, CustomElement 1, Popup 1, MultiLineInput 1, PictureInput 1, select2-MultiDropdown 1, Dropdown 1, HTML 1

## Árvore de elementos

- **CustomElement** `pop.HistoricosContaReceber A` (bTmCO) — USA Reusable pop.HistoricosContaReceber · props: custom_id="bTlza"
- **Group** `Group A` (bTiip) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text A` (bTiiu) — text: "Edita Contas a Receber"
  - **Text** `Text A` (bTiiv) — text: "Nota Núm: {Parent:cpo.NumNfFornecedor}" · props: font_alignment="right"
- **Popup** `pop altera valor comissao` (bTlpL) — props: group_type="custom.tbl_contasreceber", vertical_centering=True
  - **Group** `Group G` (bTlpj) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **Text** `Text I` (bTlpd) — text: "Novo valor comissão unitário:"
    - **Input** `ipt nova comissao unit` (bTlpR) — placeholder: "R$ 0,00" · content: Parent:cpo.QualOrcamentoFornecedor:cpo.valorcomissao · content_format: "float_number" · props: mandatory=True, vertical_centering=True, decimal_place=5, show_thousands=True, not_submit_on_enter=True
  - **Group** `Group H` (bTlpx) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **Text** `Text J` (bTlpr) — text: "Motivo alteração:"
    - **MultiLineInput** `ipt motivo altera comissao` (bTlpX) — placeholder: "Motivo de alterar comissão" · content: "{Parent:cpo.MotivoAlteraComissao}" · props: mandatory=True, vertical_centering=True
  - **Button** `Button C` (bTlqI) — text: "Gravar" · props: vertical_centering=True
- **Group** `Group B` (bTijA) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text B` (bTikf) — text: "Dados da Entrega"
  - **Group** `gp qual grupo clifor` (bTijF) — data_source: Parent · props: group_type="custom.tbl_entregas"
    - **PictureInput** `upi novocliente logo` (bTijG) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
    - **Group** `Group B` (bTijH) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Text** `Text B` (bTijL) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
      - **Text** `Text B` (bTijM) — text: "[b]Cotação número[/b] {Parent:cpo.QualCotacao:cpo.CotacaoNum}  - [b]Proposta número[/b] {Parent:cpo.QualProposta:cpo.PropostaNum}"
      - **Text** `Text B` (bTijN) — text: "[b]Condição negociada[/b]: {Parent:cpo.QualPedido:cpo.PrazoRecebComissoes:display}"
  - **Table** `rpg entregas do produto` (bTijR) — data_source: Parent:convert_to_list · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
    - **TableMainAxis** `TableMainAxis A` (bTijS) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis A` (bTijT) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis A` (bTijX) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis A` (bTijY) — props: axis_index=0
      - **TableCell** `Cell A` (bTijZ) — props: cell_main_axis_id="bTijS"
        - **Text** `Text B` (bTijd) — text: "Dt prev. entrega" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTije) — props: cell_main_axis_id="bTijT"
        - **Text** `Text B` (bTijf) — text: "Qtd entrega" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTijj) — props: cell_main_axis_id="bTijX"
        - **Text** `Text B` (bTijk) — text: "Comissão Total" · props: font_alignment="center"
          - ⟂ quando El[Reusable pop.EditaContasReceber]:get_group_data:cpo.valorcomissao:not_equals(El[rpg ContasReceber]:get_list_data:cpo.valorcomissao:sum) → bold=True, font_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell A` (bTijl) — props: cell_main_axis_id="bTikZ"
        - **Text** `Text B` (bTijp) — text: "Valor bruto " · props: font_alignment="center"
      - **TableCell** `Cell A` (bTijq) — props: cell_main_axis_id="bTika"
        - **Text** `Text B` (bTijr) — text: "Valor líq " · props: font_alignment="center"
      - **TableCell** `Cell A` (bTijv) — props: cell_main_axis_id="bTikb"
        - **Text** `Text B` (bTijw) — text: "Núm NF " · props: font_alignment="center"
      - **TableCell** `Cell E` (bTliP) — props: cell_main_axis_id="bTliJ"
        - **Text** `Text H` (bTliR) — text: "Anexo NF" · props: font_alignment="center"
          - ⟂ quando ∅ → 
    - **TableCrossAxis** `TableCrossAxis A` (bTijx) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bTikB) — props: cell_main_axis_id="bTijS"
        - **Text** `Text B` (bTikC) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTikD) — props: cell_main_axis_id="bTijT"
        - **Text** `Text B` (bTikH) — text: "{Ancestor[TableCrossAxis]:cpo.QtdEntrega}" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTikI) — props: cell_main_axis_id="bTijX"
        - **Text** `Text B` (bTikJ) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
          - ⟂ quando El[Reusable pop.EditaContasReceber]:get_group_data:cpo.valorcomissao:not_equals(El[rpg ContasReceber]:get_list_data:cpo.valorcomissao:sum) → bold=True, font_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell A` (bTikN) — props: cell_main_axis_id="bTikZ"
        - **Text** `Text B` (bTikO) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTikP) — props: cell_main_axis_id="bTika"
        - **Text** `Text B` (bTikT) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTikU) — props: cell_main_axis_id="bTikb"
        - **Input** `Input numnf` (bTlid) — placeholder: "" · content: "{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · auto_binding: True · props: font_alignment="center", vertical_centering=True, disabled=True, bind_field="cpo_nftexto_text", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(1) → disabled=False
          - ⟂ quando This:is_focused → font_color="var(--color_bTHGs_default)", background_style="bgcolor", bgcolor="#FFFFFF"
      - **TableCell** `Cell F` (bTliW) — props: cell_main_axis_id="bTliJ"
        - **Group** `Group K` (bTmEd) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
          - **Text** `Text M` (bTmEX) — text: "Arquivo.???" · props: font_alignment="center", nonant_alignment="bb"
            - ⟂ quando El[upf nf fornecedor]:get_data:is_not_empty → text="Arquivo.{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor:file_name:split_by(separator="."):last_element}{∅}", font_color="var(--color_bTHGs_default)"
            - ⟂ quando El[upf nf fornecedor]:get_data:is_empty → text="Sem NF", font_color="var(--color_bTHGl_default)"
          - **FileInput** `upf nf fornecedor` (bTlij) — placeholder: "" · auto_binding: True · props: vertical_centering=True, disabled=True, bind_field="cpo_nfarquivo_file", nonant_alignment="bb"
            - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(1) → disabled=False
        - **Icon** `Icon A` (bTlip) — props: icon="material outlined attach_file", vertical_centering=True
          - ⟂ quando El[upf nf fornecedor]:get_loading_status → icon="fa fa-spinner", spin_icon=True, button_disabled=True
    - **TableMainAxis** `TableMainAxis A` (bTikZ) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis A` (bTika) — props: axis_index=5
    - **TableMainAxis** `TableMainAxis A` (bTikb) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis D` (bTliJ) — props: axis_index=7
- **Group** `Group F` (bTlWb) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text F` (bTlWj) — text: "Contas a receber desta entrega"
  - **Group** `Group C` (bTikh) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `g DateTimePicker` (bTikm) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text C` (bTikn) — text: "Data de entrega"
      - **DateInput** `dt dataentrega realizada` (bTikr) — placeholder: "dd/mm/yy" · auto_binding: True · props: mandatory=True, bind_field="cpo_dtentrega_date", overwrite_placeholder=True
    - **Group** `g FileUploader` (bTiks) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text C` (bTikx) — text: "Comprovante entrega"
      - **FileInput** `upf comprovanteentrega realizada` (bTikt) — placeholder: "Máx 5mb" · auto_binding: True · props: font_alignment="left", src="{Parent:cpo.ComprovanteEntrega}", max_size=5, bind_field="cpo_comprovanteentrega_file"
        - ⟂ quando This:get_loading_status:is_true → placeholder="Aguarde, carregando..."
    - **Group** `g FileUploader copy` (bTiky) — data_source: Parent:cpo.QualPedido · props: group_type="custom.tbl_pedidos"
      - **Text** `Text C` (bTilD) — text: "Qtd parcelas"
      - **select2-MultiDropdown** `dd qtd parcelas receber` (bTikz) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · auto_binding: True · props: bind_field="cpo_prazorecebcomissoes_list_option_opt_parcelasreceber", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", tag_font_color="var(--color_primary_default)", limit_selection=4, tag_border_color="var(--color_primary_default)", tag_delete_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
    - **Button** `Button B` (bTilE) — text: "Add Parcelas" · props: icon="material outlined event", button_type="label_icon", title_attribute="Adicionar parcelas"
      - ⟂ quando El[dd qtd parcelas receber]:get_data:count:less_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
  - **Table** `rpg ContasReceber` (bTilJ) — data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **TableMainAxis** `TableMainAxis B` (bTilL) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis B` (bTilP) — props: axis_index=4
    - **TableCrossAxis** `TableCrossAxis B` (bTilQ) — props: axis_index=0
      - **TableCell** `Cell B` (bTilR) — props: cell_main_axis_id="bTilL"
        - **Text** `Text D` (bTilV) — text: "Vencimentos"
      - **TableCell** `Cell B` (bTilW) — props: cell_main_axis_id="bTilP"
        - **Text** `Text D` (bTilX) — text: "Valores (total: {El[rpg ContasReceber]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")})"
      - **TableCell** `Cell B` (bTilb) — props: cell_main_axis_id="bTilz"
      - **TableCell** `Cell B` (bTilc) — props: cell_main_axis_id="bTimA"
        - **Text** `Text D` (bTild) — text: "Prazos"
      - **TableCell** `Cell C` (bTioE) — props: cell_main_axis_id="bTing"
        - **Text** `Text E` (bTioc) — text: "Status"
    - **TableCrossAxis** `TableCrossAxis B` (bTilh) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell B` (bTili) — props: cell_main_axis_id="bTilL"
        - **DateInput** `dt vencimento` (bTilj) — content: Ancestor[TableCrossAxis]:cpo.DataVencimento · auto_binding: True · props: vertical_centering=True, disabled=True, bind_field="cpo_datavencimento_date"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → font_color="var(--color_primary_default)", bgcolor="var(--color_bTHGh_default)", disabled=False
      - **TableCell** `Cell B` (bTiln) — props: cell_main_axis_id="bTilP"
        - **Group** `Group I` (bTmDv) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_contasreceber", vertical_centering=True
          - **Input** `ipt valor a receber` (bTilo) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: vertical_centering=True, disabled=True, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
          - **Icon** `Icon D` (bTlpF) — props: icon="material outlined edit", vertical_centering=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=False
        - **Group** `Group J` (bTmEM) — props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao:is_not_empty → is_visible=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao:is_empty → is_visible=False
          - **Text** `Text K` (bTmDp) — text: "[fa]info-circle[/fa]"
          - **Text** `Text L` (bTmEG) — text: "{Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao}"
      - **TableCell** `Cell B` (bTilp) — props: cell_main_axis_id="bTilz"
        - **Icon** `Icon B` (bTilt) — props: icon="material outlined delete_forever", button_disabled=True, title_attribute="Apaga conta a a receber"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → icon_color="var(--color_bTHHQ_default)", button_disabled=False
        - **Icon** `Icon mudar status` (bTlWD) — props: icon="material outlined published_with_changes", button_disabled=True, title_attribute="Estornar recebimento"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → icon_color="var(--color_bTHGs_default)", button_disabled=False
        - **Icon** `Icon mudar status copy` (bTlqr) — props: icon="material outlined comment", button_disabled=False, title_attribute="Edita historicos dessa conta a receber"
      - **TableCell** `Cell B` (bTilu) — props: cell_main_axis_id="bTimA"
        - **Dropdown** `dd prazo a vencer` (bTilv) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, default=Ancestor[TableCrossAxis]:cpo.QualPrazo, disabled=True, bind_field="cpo_qualprazo_option_opt_parcelasreceber", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → font_color="var(--color_primary_default)", bgcolor="var(--color_bTHGh_default)", disabled=False
      - **TableCell** `Cell D` (bTioK) — props: cell_main_axis_id="bTing"
        - **Group** `Group D` (bTlWJ) — props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → border_color="var(--color_bTHHX_default)", bgcolor="var(--color_bTHHW_default)", border_style="solid"
          - **HTML** `HTML A` (bTlWL) — html(360 chars) · props: vertical_centering=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → icon="material outlined price_check", html="<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#108f66"><path d="M260-361v-40H160v-80h200v-80H200q-17 0-28.5-11.5T160-601v-160q0-17 11.5-28.5T200-801h60v-40h80v40h100v80H240v80h160q17 0 28.5 11.5T440-601v160q0 17-11.5 28.5T400-401h-60v40h-80Zm298 240L388-291l56-56 114 114 226-226 56 56-282 282Z"/></svg>", icon_color="var(--color_bTHHX_default)"
          - **Text** `Text G` (bTlWP) — text: "{Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:display}" · props: font_alignment="center"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → font_color="var(--color_bTHHX_default)"
    - **TableMainAxis** `TableMainAxis B` (bTilz) — props: axis_index=5
    - **TableMainAxis** `TableMainAxis B` (bTimA) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis C` (bTing) — props: axis_index=0
- **Group** `Group E` (bTimN) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Button** `btn cencela confirmaentrega` (bTimT) — text: "Fechar"

## Workflows

#### WF bTimY — ButtonClicked em El[Button B]
1. **ScheduleAPIEvent** [bTimd] date=Page.Current Date/Time, api_event="bTfDZ", _wf_param_Qtd=El[dd qtd parcelas receber]:get_data:count, _wf_param_Fila=1, _wf_param_Prazos=El[dd qtd parcelas receber]:get_data, _wf_param_DtEntrega=El[dt dataentrega realizada]:get_data, _wf_param_QualEntrega=Parent

#### WF bTimf — ButtonClicked em El[Icon B]
1. **DeleteThing** [bTimk] to_delete=Ancestor[TableCrossAxis]

#### WF bTimp — InputChanged em El[dd prazo a vencer]
1. **ChangeThing** [bTimr] campos: cpo.DataVencimento = Page.Current Date/Time:plus_days(This:get_data:diasprazonumero) · to_change=Ancestor[TableCrossAxis]

#### WF bTinU — ButtonClicked em El[btn cencela confirmaentrega]
1. **HideElement** [bTinZ] alvo El[Reusable pop.EditaContasReceber]
2. **ResetGroup** [bTina] alvo El[Reusable pop.EditaContasReceber]

#### WF bTlWR — ButtonClicked em El[Icon mudar status]
1. **ChangeThing** [bTlWX] campos: cpo.StatusFinanceiro = Opt.StatusFinanceiro.A receber; cpo.DataEstorno = Page.Current Date/Time; cpo.QuemEstornou = CurrentUser · to_change=Ancestor[TableCrossAxis]

#### WF bTliv — ButtonClicked em El[Icon A]
1. **OpenURL** [bTljB] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTlqO — ButtonClicked em El[Button C]
1. **ChangeThing** [bTlqa] campos: cpo.valorcomissao = El[ipt nova comissao unit]:get_data; cpo.ValorComissaoBruto = El[ipt nova comissao unit]:get_data:times(InjectedValue:cpo.QtdVenda) · to_change=Parent:cpo.QualOrcamentoFornecedor
2. **ChangeThing** [bTlqZ] campos: cpo.valorcomissao = ResultOfStep[bTlqa]:cpo.valorcomissao:times(Parent:cpo.QualEntrega:cpo.QtdEntrega) · to_change=Parent:cpo.QualEntrega
3. **ChangeListOfThings** [bTlqU] campos: cpo.MotivoAlteraComissao = "{El[ipt motivo altera comissao]:get_data}"; cpo.valorcomissao = Parent:cpo.QualEntrega:cpo.valorcomissao:divide(Parent:cpo.QualEntrega:cpo.QuaisContasReceber:count) · to_change=Parent:cpo.QualEntrega:cpo.QuaisContasReceber, type_to_change="custom.tbl_contasreceber"
4. **HideElement** [bTlqf] alvo El[pop altera valor comissao]

#### WF bTlqg — ButtonClicked em El[Icon D]
1. **ShowElement** [bTlqm] alvo El[pop altera valor comissao]
2. **DisplayGroupData** [bTlqn] alvo El[pop altera valor comissao] · data_source=Ancestor[TableCrossAxis]

#### WF bTltB — ButtonClicked em El[Icon mudar status copy]
1. **ShowElement** [bTltH] alvo El[pop.HistoricosContaReceber A]
2. **DisplayGroupData** [bTltI] alvo El[pop.HistoricosContaReceber A] · data_source=Ancestor[TableCrossAxis]
