# Reusable: `pop.EditaContasReceberNew` (bTrot)

Estados customizados: `var_liberaedicao_` : boolean

Resumo: 204 elementos · 23 workflows · 55 ações · 43 condicionais · 8 estados customizados
Elementos por tipo: Text 54, Group 39, TableCell 34, TableMainAxis 17, Icon 13, Button 10, TableCrossAxis 6, Input 5, MultiLineInput 4, Table 3, DateInput 3, Dropdown 3, Plugin[1680110374647x249108010620944400]/AAC 3, CustomElement 2, Popup 2, FileInput 2, HTML 2, PictureInput 1, select2-MultiDropdown 1

## Árvore de elementos

- **CustomElement** `pop.AgendaContatos A` (bTsLb) — USA Reusable pop.AgendaContatos · props: floating_reference="top", custom_id="bTPQa0", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.HistoricosContaReceber A` (bTrtI) — USA Reusable pop.HistoricosContaReceber · props: custom_id="bTlza"
- **Group** `Group A` (bTrou) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text A` (bTrov) — text: "Edita recebimentos e pagamentos"
  - **Text** `Text A` (bTroz) — text: "Nota Núm: {Text("{Parent:cpo.NumNfFornecedor}")}" · props: font_alignment="left"
  - **Icon** `btn fecha addedita financeiro` (bTsDL1) — props: icon="material outlined close", vertical_centering=True
- **Popup** `pop alerta alteracao` (bTrsr) — props: group_type="custom.tbl_entregas", vertical_centering=True
  - estado customizado `var_numnf_` : text
  - estado customizado `dt_entrega_` : date
  - estado customizado `var_arquivonf_` : file
  - estado customizado `var_qtdentrega_` : number
  - estado customizado `var_valorcomissao_` : number
  - **Icon** `Icon D` (bTrwy) — props: icon="material outlined warning", vertical_centering=True
  - **Text** `Text I` (bTrxE) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text N` (bTrxK) — text: "Você está alterando [b][color=#fab515]dados da entrega[/color][/b] que interferem nas [b][color=#fab515]contas a receber e a pagar[/color][/b]." · props: font_alignment="center"
  - **Text** `Text O` (bTrxQ) — text: "As contas [b][color=#fab515] a receber e a pagar[/color][/b] serão [b][color=#fab515]completamente redefinidas[/color][/b]." · props: font_alignment="center"
  - **Text** `Text P` (bTrxW) — text: "Essa operação não pode ser desfeita!" · props: font_alignment="center"
  - **Text** `Text Q` (bTrxc) — text: "Você tem certeza?" · props: font_alignment="center"
  - **Group** `Group H` (bTrtB) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Text** `Text J` (bTrtD) — text: "Motivo alteração:"
    - **MultiLineInput** `ipt motivo altera comissao` (bTrtC) — placeholder: "Motivo de alterar comissão⏎" · content: "" · props: mandatory=True, vertical_centering=True
  - **Group** `Group G` (bTrxu) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Button** `btn gravar entregas` (bTrtH) — text: "SIM"
    - **Button** `Button G` (bTrxo) — text: "NÃO"
- **Group** `Group B` (bTrpA) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text B` (bTrqs) — text: "Dados da Entrega"
  - **Group** `gp qual grupo clifor` (bTrpB) — data_source: Parent · props: group_type="custom.tbl_entregas"
    - **PictureInput** `upi novocliente logo` (bTrpF) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
    - **Group** `Group B` (bTrpG) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Text** `Text B` (bTrpH) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
      - **Text** `Text B` (bTrpL) — text: "[b]Cotação número[/b] {Parent:cpo.QualCotacao:cpo.CotacaoNum}  - [b]Proposta número[/b] {Parent:cpo.QualProposta:cpo.PropostaNum}"
      - **Text** `Text B` (bTrpM) — text: "[b]Condição negociada[/b]: {Parent:cpo.QualPedido:cpo.PrazoRecebComissoes:display}"
    - **Group** `Group L` (bTruW) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Button** `Button D` (bTruK) — text: "Alterar" · props: icon="feather lock", vertical_centering=True, icon_size=15, button_type="label_icon"
        - ⟂ quando El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_true → text="Cancela", icon="feather unlock", font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `Button E` (bTruQ) — text: "Cancelar" · props: icon="material outlined cancel", icon_size=16, button_type="label_icon"
  - **Table** `rpg entregas do produto` (bTrpN) — data_source: Parent:convert_to_list · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
    - **TableMainAxis** `TableMainAxis A` (bTrpR) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis A` (bTrpS) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis A` (bTrpT) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis A` (bTrpX) — props: axis_index=0
      - **TableCell** `Cell A` (bTrpY) — props: cell_main_axis_id="bTrpR"
        - **Text** `Text B` (bTrpZ) — text: "Dt entrega" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTrpd) — props: cell_main_axis_id="bTrpS"
        - **Text** `Text B` (bTrpe) — text: "Qtd entrega" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTrpf) — props: cell_main_axis_id="bTrpT"
        - **Text** `Text B` (bTrpj) — text: "Comissão Unit" · props: font_alignment="center"
          - ⟂ quando El[Reusable pop.EditaContasReceberNew]:get_group_data:cpo.valorcomissao:not_equals(El[rpg ContasReceber]:get_list_data:cpo.valorcomissao:sum) → bold=True, font_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell A` (bTrpk) — props: cell_main_axis_id="bTrql"
        - **Text** `Text B` (bTrpl) — text: "Comissão a receber" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTrpr) — props: cell_main_axis_id="bTrqn"
        - **Text** `Text B` (bTrpv) — text: "Núm NF " · props: font_alignment="center"
      - **TableCell** `Cell G` (bTrwH) — props: cell_main_axis_id="bTrwB"
      - **TableCell** `Cell E` (bTrpw) — props: cell_main_axis_id="bTrqr"
        - **Text** `Text H` (bTrpx) — text: "Anexo NF" · props: font_alignment="center"
          - ⟂ quando ∅ → 
    - **TableCrossAxis** `TableCrossAxis A` (bTrqB) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bTrqC) — props: cell_main_axis_id="bTrpR"
        - **DateInput** `ipt dtentrega` (bTruh) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.dtentrega · auto_binding: False · props: font_alignment="center", vertical_centering=True, disabled=True, bind_field="cpo_dtentrega_date", date_format="custom", custom_format="dd/mm/yy", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_true → font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
      - **TableCell** `Cell A` (bTrqH) — props: cell_main_axis_id="bTrpS"
        - **Input** `ipt qtd entrega` (bTruo) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QtdEntrega · auto_binding: False · content_format: "int_number" · props: font_alignment="center", vertical_centering=True, disabled=True, bind_field="cpo_qtdentrega_number", placeholder_color="var(--color_bTHGl_default)", not_submit_on_enter=True
          - ⟂ quando El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_true → font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
      - **TableCell** `Cell A` (bTrqJ) — props: cell_main_axis_id="bTrpT"
        - **Input** `ipt comissaounit` (bTruv) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoUnitario · auto_binding: False · content_format: "float_number" · props: font_alignment="center", vertical_centering=True, disabled=True, bind_field="cpo_nftexto_text", decimal_place=6, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", not_submit_on_enter=True, always_show_decimals=True
          - ⟂ quando El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_true → font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
      - **TableCell** `Cell A` (bTrqO) — props: cell_main_axis_id="bTrql"
        - **Text** `Text B` (bTrqP) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
      - **TableCell** `Cell A` (bTrqV) — props: cell_main_axis_id="bTrqn"
        - **Input** `ipt numnf` (bTrqZ) — placeholder: "" · content: "{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · auto_binding: False · props: font_alignment="center", vertical_centering=True, disabled=True, bind_field="cpo_nftexto_text", placeholder_color="var(--color_bTHGl_default)", not_submit_on_enter=True
          - ⟂ quando El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_true → font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
      - **TableCell** `Cell H` (bTrwN) — props: cell_main_axis_id="bTrwB"
        - **Button** `btn gravar entrega` (bTrwf) — props: icon="fa fa-save", icon_size=16, button_type="icon"
      - **TableCell** `Cell F` (bTrqa) — props: cell_main_axis_id="bTrqr"
        - **Group** `Group K` (bTrqf) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
          - **Text** `Text M` (bTrqg) — text: "Arquivo.???" · props: font_alignment="center", nonant_alignment="bb"
            - ⟂ quando El[upf arquivo nf]:get_data:is_not_empty → text="Arquivo.{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor:file_name:split_by(separator="."):last_element}{∅}", font_color="var(--color_bTHGs_default)"
            - ⟂ quando El[upf arquivo nf]:get_data:is_empty → text="Sem NF", font_color="var(--color_bTHGl_default)"
          - **FileInput** `upf arquivo nf` (bTrqh) — placeholder: "" · auto_binding: False · props: vertical_centering=True, src="{Parent:cpo.ArquivoNfFornecedor}", disabled=True, bind_field="cpo_nfarquivo_file", nonant_alignment="bb"
            - ⟂ quando El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_true → font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
        - **Icon** `Icon A` (bTrqb) — props: icon="material outlined attach_file", vertical_centering=True
          - ⟂ quando El[upf arquivo nf]:get_loading_status → icon="fa fa-spinner", spin_icon=True, button_disabled=True
    - **TableMainAxis** `TableMainAxis A` (bTrql) — props: axis_index=3
    - **TableMainAxis** `TableMainAxis A` (bTrqn) — props: axis_index=4
    - **TableMainAxis** `Column G` (bTrwB) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis D` (bTrqr) — props: axis_index=5
- **Group** `Group F` (bTrqy) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text F` (bTrsq) — text: "Contas a receber desta entrega"
  - **Group** `Group C` (bTrqz) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `g FileUploader` (bTrrJ) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text C` (bTrrL) — text: "Comprovante entrega"
      - **FileInput** `upf comprovanteentrega realizada` (bTrrK) — placeholder: "Máx 5mb" · auto_binding: True · props: font_alignment="left", src="{Parent:cpo.ComprovanteEntrega}", max_size=5, bind_field="cpo_comprovanteentrega_file"
        - ⟂ quando This:get_loading_status:is_true → placeholder="Aguarde, carregando..."
    - **Group** `g FileUploader copy` (bTrrP) — data_source: Parent:cpo.QualPedido · props: group_type="custom.tbl_pedidos"
      - **Text** `Text C` (bTrrR) — text: "Qtd parcelas"
      - **select2-MultiDropdown** `dd qtd parcelas receber` (bTrrQ) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · auto_binding: True · props: bind_field="cpo_prazorecebcomissoes_list_option_opt_parcelasreceber", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", tag_font_color="var(--color_primary_default)", limit_selection=4, tag_border_color="var(--color_primary_default)", tag_delete_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
    - **Button** `Button B` (bTrrV) — text: "Recebimentos" · props: icon="fa fa-plus", icon_size=16, button_type="label_icon", title_attribute="Adicionar parcelas"
      - ⟂ quando El[dd qtd parcelas receber]:get_data:count:less_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
  - **Table** `rpg ContasReceber` (bTrrW) — data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **TableMainAxis** `TableMainAxis B` (bTrrX) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis B` (bTrrb) — props: axis_index=4
    - **TableCrossAxis** `TableCrossAxis B` (bTrrc) — props: axis_index=0
      - **TableCell** `Cell B` (bTrrd) — props: cell_main_axis_id="bTrrX"
        - **Text** `Text D` (bTrrh) — text: "Vencimentos"
      - **TableCell** `Cell B` (bTrri) — props: cell_main_axis_id="bTrrb"
        - **Text** `Text D` (bTrrj) — text: "Valores (total: {Text("{El[rpg ContasReceber]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")})"
      - **TableCell** `Cell B` (bTrrn) — props: cell_main_axis_id="bTrsk"
      - **TableCell** `Cell B` (bTrro) — props: cell_main_axis_id="bTrsl"
        - **Text** `Text D` (bTrrp) — text: "Prazos"
      - **TableCell** `Cell C` (bTrrt) — props: cell_main_axis_id="bTrsp"
        - **Text** `Text E` (bTrru) — text: "Status"
    - **TableCrossAxis** `TableCrossAxis B` (bTrrv) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell B` (bTrrz) — props: cell_main_axis_id="bTrrX"
        - **DateInput** `dt vencimento` (bTrsA) — content: Ancestor[TableCrossAxis]:cpo.DataVencimento · auto_binding: True · props: vertical_centering=True, disabled=True, bind_field="cpo_datavencimento_date"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → font_color="var(--color_primary_default)", bgcolor="var(--color_bTHGh_default)", disabled=False
      - **TableCell** `Cell B` (bTrsB) — props: cell_main_axis_id="bTrrb"
        - **Group** `Group I` (bTrsF) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_contasreceber", vertical_centering=True
          - **Input** `ipt valor a receber` (bTrsG) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: vertical_centering=True, disabled=True, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
        - **Group** `Group J` (bTrsL) — props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao:is_not_empty → is_visible=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao:is_empty → is_visible=False
          - **Text** `Text K` (bTrsM) — text: "[fa]info-circle[/fa]"
          - **Text** `Text L` (bTrsN) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao}")}"
      - **TableCell** `Cell B` (bTrsR) — props: cell_main_axis_id="bTrsk"
        - **Icon** `btn deletar recebimento` (bTrsS) — props: icon="material outlined delete_forever", button_disabled=True, title_attribute="Apaga conta a a receber"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → icon_color="var(--color_bTHHQ_default)", button_disabled=False
        - **Icon** `btn mudar status recebimento` (bTrsT) — props: icon="material outlined published_with_changes", button_disabled=True, title_attribute="Estornar recebimento"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → icon_color="var(--color_bTHGs_default)", button_disabled=False
        - **Icon** `btn comentarios recebimento` (bTrsX) — props: icon="material outlined comment", button_disabled=False, title_attribute="Edita historicos dessa conta a receber"
      - **TableCell** `Cell B` (bTrsY) — props: cell_main_axis_id="bTrsl"
        - **Dropdown** `dd prazo a vencer` (bTrsZ) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, default=Ancestor[TableCrossAxis]:cpo.QualPrazo, disabled=True, bind_field="cpo_qualprazo_option_opt_parcelasreceber", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → font_color="var(--color_primary_default)", bgcolor="var(--color_bTHGh_default)", disabled=False
      - **TableCell** `Cell D` (bTrsd) — props: cell_main_axis_id="bTrsp"
        - **Group** `Group D` (bTrse) — props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → border_color="var(--color_bTHHX_default)", bgcolor="var(--color_bTHHW_default)", border_style="solid"
          - **HTML** `HTML A` (bTrsf) — html(360 chars) · props: vertical_centering=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → icon="material outlined price_check", html="<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#108f66"><path d="M260-361v-40H160v-80h200v-80H200q-17 0-28.5-11.5T160-601v-160q0-17 11.5-28.5T200-801h60v-40h80v40h100v80H240v80h160q17 0 28.5 11.5T440-601v160q0 17-11.5 28.5T400-401h-60v40h-80Zm298 240L388-291l56-56 114 114 226-226 56 56-282 282Z"/></svg>", icon_color="var(--color_bTHHX_default)"
          - **Text** `Text G` (bTrsj) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:display}")}" · props: font_alignment="center"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → font_color="var(--color_bTHHX_default)"
    - **TableMainAxis** `TableMainAxis B` (bTrsk) — props: axis_index=5
    - **TableMainAxis** `TableMainAxis B` (bTrsl) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis C` (bTrsp) — props: axis_index=0
- **Group** `Group M` (bTrzD1) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text R` (bTsAp1) — text: "Contas a pagar desta entrega"
  - **Group** `Group M` (bTrzI1) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Button** `Button H` (bTrzV1) — text: "Pagamentos" · props: icon="fa fa-plus", icon_size=16, button_type="label_icon", title_attribute="Adicionar parcelas", button_horiz_alignment="flex-end"
  - **Table** `rpg ContasReceber` (bTrzZ1) — data_source: Parent:cpo.QuaisContasPagar · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
    - **TableMainAxis** `TableMainAxis F` (bTrza1) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis F` (bTrzb1) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis C` (bTrzf1) — props: axis_index=0
      - **TableCell** `Cell I` (bTrzg1) — props: cell_main_axis_id="bTrza1"
        - **Text** `Text R` (bTrzh1) — text: "Vendedor"
      - **TableCell** `Cell I` (bTrzl1) — props: cell_main_axis_id="bTrzb1"
        - **Text** `Text R` (bTrzm1) — text: "Valores (total: {Text("{El[rpg ContasReceber]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")})"
      - **TableCell** `Cell I` (bTrzn1) — props: cell_main_axis_id="bTsAj1"
      - **TableCell** `Cell I` (bTrzt1) — props: cell_main_axis_id="bTsAo1"
        - **Text** `Text R` (bTrzx1) — text: "Status"
      - **TableCell** `Cell J` (bTsCN1) — props: cell_main_axis_id="bTsCH1", cell_cross_axis_index=0
        - **Text** `Text S` (bTsCP1) — text: "Vencimento"
    - **TableCrossAxis** `TableCrossAxis C` (bTrzy1) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell I` (bTrzz1) — props: cell_main_axis_id="bTrza1"
        - **Text** `Text T` (bTsCb1) — text: "{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}" · props: font_alignment="left"
      - **TableCell** `Cell I` (bTsAE1) — props: cell_main_axis_id="bTrzb1"
        - **Input** `ipt valor a receber` (bTsAJ1) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: vertical_centering=True, disabled=True, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
        - **Group** `Group M` (bTsAK1) — props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao:is_not_empty → is_visible=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao:is_empty → is_visible=False
          - **Text** `Text R` (bTsAL1) — text: "[fa]info-circle[/fa]"
          - **Text** `Text R` (bTsAP1) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.MotivoAlteraComissao}")}"
      - **TableCell** `Cell I` (bTsAQ1) — props: cell_main_axis_id="bTsAj1"
        - **Icon** `btn deletar pagamento` (bTsAR1) — props: icon="material outlined delete_forever", button_disabled=True, title_attribute="Apaga conta a a receber"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → icon_color="var(--color_bTHHQ_default)", button_disabled=False
        - **Icon** `btn mudar status pagamentos` (bTsAV1) — props: icon="material outlined published_with_changes", button_disabled=True, title_attribute="Estornar recebimento"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → icon_color="var(--color_bTHGs_default)", button_disabled=False
        - **Icon** `btn comentarios pagamento` (bTsAW1) — oculto ao carregar · props: icon="material outlined comment", button_disabled=False, title_attribute="Edita historicos dessa conta a receber"
      - **TableCell** `Cell I` (bTsAc1) — props: cell_main_axis_id="bTsAo1"
        - **Group** `Group M` (bTsAd1) — props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → border_color="var(--color_bTHHX_default)", bgcolor="var(--color_bTHHW_default)", border_style="solid"
          - **HTML** `HTML B` (bTsAh1) — html(360 chars) · props: vertical_centering=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → icon="material outlined price_check", html="<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#108f66"><path d="M260-361v-40H160v-80h200v-80H200q-17 0-28.5-11.5T160-601v-160q0-17 11.5-28.5T200-801h60v-40h80v40h100v80H240v80h160q17 0 28.5 11.5T440-601v160q0 17-11.5 28.5T400-401h-60v40h-80Zm298 240L388-291l56-56 114 114 226-226 56 56-282 282Z"/></svg>", icon_color="var(--color_bTHHX_default)"
          - **Text** `Text R` (bTsAi1) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:display}")}" · props: font_alignment="center"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → font_color="var(--color_bTHHX_default)"
      - **TableCell** `Cell K` (bTsCU1) — props: cell_main_axis_id="bTsCH1", cell_cross_axis_index=1
        - **DateInput** `dt vencimento` (bTsCZ1) — content: Ancestor[TableCrossAxis]:cpo.DataVencimento · auto_binding: True · props: vertical_centering=True, disabled=True, bind_field="cpo_datavencimento_date"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:not_equals(Opt.StatusFinanceiro.Recebido):and_(CurrentUser:cpo.QualPerfil:hierarquia:equals(1)) → font_color="var(--color_primary_default)", bgcolor="var(--color_bTHGh_default)", disabled=False
    - **TableMainAxis** `TableMainAxis F` (bTsAj1) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis F` (bTsAo1) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis G` (bTsCH1) — props: axis_index=2
- **Group** `Group E` (bTrqt) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Button** `btn cencela confirmaentrega` (bTrqx) — text: "Fechar"
- **Popup** `pop cancelar entrega e pedido` (bTsIl) — props: vertical_centering=True
  - estado customizado `var_qualpedido_` : Tbl.Pedido
  - estado customizado `var_qualentrega_` : Tbl.Entregas
  - **Icon** `Icon I` (bTsIm) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group O` (bTsIn) — data_source: El[pop cancelar entrega e pedido]:custom.var_qualpedido_ · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Group** `Group O` (bTsIr) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - **Group** `Group O` (bTsIs) — props: vertical_centering=True
        - **Icon** `Icon I` (bTsIt) — props: icon="material outlined warning"
        - **Text** `Text V` (bTsIx) — text: "ATENÇÃO!" · props: font_alignment="center"
      - **Group** `Group Q` (bTsNG) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text V` (bTsIy) — text: "Você está cancelando uma entrega.⏎" · props: font_alignment="left"
        - **Text** `Text U` (bTsMu) — text: "Para cancelar é preciso informar um motivo." · props: font_alignment="left"
        - **MultiLineInput** `MultilineInput B` (bTsIz) — placeholder: "Motivo cancelamento" · content: "{∅}" · props: mandatory=True
      - **Group** `Group P` (bTsML) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text X` (bTsLz) — text: "O pedido original contém apenas essa entrega agendada." · props: font_alignment="left"
        - **Text** `Text Y` (bTsNA) — text: "Se essa entrega não for realizada no futuro, o pedido precisa ser cancelado." · props: font_alignment="left"
        - **Group** `Group N` (bTsLn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg cancela pedido` (bTsLs) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text W` (bTsLt) — text: "Cancelar pedido"
      - **Group** `Group S` (bTsNf) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text BZ` (bTsPJ) — text: "Você pode informar o cancelamento para cliente e fornecedor através de email." · props: font_alignment="left"
        - **Group** `Group O` (bTsJE) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg informa cancelamento cliente` (bTsJF) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text V` (bTsJJ) — text: "Envia e-mail informando [color=#000000]cliente.[/color]"
        - **Group** `Group O` (bTsJK) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg informa cancelamento fornecedor` (bTsJL) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text V` (bTsJP) — text: "Envia e-mail informando fornecedor"
      - **Group** `Group T` (bTsON) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Z` (bTsNx) — text: "Essa ação não pode ser defeita." · props: font_alignment="left"
        - **Text** `Text AZ` (bTsOH) — text: "Você tem certeza?" · props: font_alignment="left"
      - **Group** `Group R` (bTsNS) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Button** `Button J` (bTsJQ) — text: "SIM"
          - ⟂ quando El[tgg cancela pedido]:get_AAI:is_true → text="Cancela Pedido"
        - **Button** `Button I` (bTsNr) — text: "NÃO"
          - ⟂ quando El[tgg cancela pedido]:get_AAI:is_true → text="Cancela Pedido"
    - **Group** `Group O` (bTsJR) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[tgg informa cancelamento cliente]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[tgg informa cancelamento cliente]:get_AAI:is_false → is_visible=False
      - **Group** `gp email cliente` (bTsJV) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text V` (bTsJc) — text: "Email do Cliente:"
        - **Group** `Group O` (bTsJW) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento cliente` (bTsJX) — data_source: Parent:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailCliente, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[tgg informa cancelamento cliente]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon I` (bTsJb) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email cliente` (bTsJd) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTsJi) — text: "Corpo do e-mail do cliente:"
        - **MultiLineInput** `ipt corpo cancelamento cliente` (bTsJh) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[tgg cancela pedido]:get_AAI:is_true → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido [/b] {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[tgg cancela pedido]:get_AAI:is_false → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
    - **Group** `Group O` (bTsJj) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[tgg informa cancelamento fornecedor]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[tgg informa cancelamento fornecedor]:get_AAI:is_false → is_visible=False
      - **Group** `gp email fornecedor` (bTsJn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text V` (bTsJu) — text: "Email do fornecedor:"
        - **Group** `Group O` (bTsJo) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento fornecedor` (bTsJp) — data_source: Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailFornecedor, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[tgg informa cancelamento fornecedor]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon I` (bTsJt) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email fornecedor` (bTsJv) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTsKA) — text: "Corpo do e-mail do fornecedor:"
        - **MultiLineInput** `ipt corpo cancelamento fornecedor` (bTsJz) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[tgg cancela pedido]:get_AAI:is_true → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido[/b]  {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[tgg cancela pedido]:get_AAI:is_false → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"

## Workflows

#### WF bTrtN — ButtonClicked em El[Button B]
1. **ScheduleAPIEvent** [bTrtO] date=Page.Current Date/Time, api_event="bTfDZ", _wf_param_Qtd=El[dd qtd parcelas receber]:get_data:count, _wf_param_Fila=1, _wf_param_Prazos=El[dd qtd parcelas receber]:get_data, _wf_param_DtEntrega=Parent:cpo.dtentrega, _wf_param_QualEntrega=Parent

#### WF bTrtP — ButtonClicked em El[btn deletar recebimento]
1. **DeleteThing** [bTrtT] to_delete=Ancestor[TableCrossAxis]

#### WF bTrtU — InputChanged em El[dd prazo a vencer]
1. **ChangeThing** [bTrtV] campos: cpo.DataVencimento = Page.Current Date/Time:plus_days(This:get_data:diasprazonumero) · to_change=Ancestor[TableCrossAxis]

#### WF bTrtZ — ButtonClicked em El[btn cencela confirmaentrega]
1. **HideElement** [bTrta] alvo El[Reusable pop.EditaContasReceberNew]
2. **ResetGroup** [bTrtb] alvo El[Reusable pop.EditaContasReceberNew]

#### WF bTrtf — ButtonClicked em El[btn mudar status recebimento]
1. **ChangeThing** [bTrtg] campos: cpo.StatusFinanceiro = Opt.StatusFinanceiro.A receber; cpo.DataEstorno = Page.Current Date/Time; cpo.QuemEstornou = CurrentUser · to_change=Ancestor[TableCrossAxis]

#### WF bTrth — ButtonClicked em El[Icon A]
1. **OpenURL** [bTrtl] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTrtm — ButtonClicked em El[btn gravar entregas]
1. **ChangeThing** [bTsCm1] campos: cpo.valorcomissao = El[pop alerta alteracao]:custom.var_valorcomissao_ · to_change=Parent:cpo.QualOrcamentoFornecedor
2. **ScheduleAPIEvent** [bTsCr1] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=ResultOfStep[bTsCm1]:convert_to_list
3. **ChangeThing** [bTryM1] campos: cpo.dtentrega = El[pop alerta alteracao]:custom.dt_entrega_; cpo.QtdEntrega = El[pop alerta alteracao]:custom.var_qtdentrega_; cpo.ArquivoNfFornecedor = "{El[pop alerta alteracao]:custom.var_arquivonf_}"; cpo.NumNfFornecedor = "{El[pop alerta alteracao]:custom.var_numnf_}"; cpo.MotivoAlteracaoValores = "{El[ipt motivo altera comissao]:get_data}" · to_change=Parent
4. **ChangeThing** [bTsDJ1] campos: cpo.MotivoAlteraValores = "{Parent:cpo.MotivoAlteracaoValores}" · to_change=Parent:cpo.QualPedido
5. **HideElement** [bTrtt] alvo El[pop alerta alteracao]
6. **ScheduleAPIEvent** [bTsCh1] date=Page.Current Date/Time, api_event="bTbPH", _wf_param_par^{p1}QualEntrega=Parent
7. **DeleteListOfThings** [bTryX1] to_delete=Parent:cpo.QuaisContasReceber, type_to_delete="custom.tbl_contasreceber"
8. **DeleteListOfThings** [bTrye1] to_delete=Parent:cpo.QuaisContasPagar, type_to_delete="custom.tbl_contasreceber1"
9. **ScheduleAPIEvent** [bTryZ1] date=Page.Current Date/Time, api_event="bTfDZ", _wf_param_Qtd=Parent:cpo.QualPedido:cpo.PrazoRecebComissoes:count, _wf_param_Fila=1, _wf_param_Prazos=Parent:cpo.QualPedido:cpo.PrazoRecebComissoes, _wf_param_DtEntrega=ResultOfStep[bTryM1]:cpo.dtentrega, _wf_param_QualEntrega=Parent
10. **ScheduleAPIEvent** [bTryj1] date=Page.Current Date/Time, api_event="bToYh", _wf_param_DtEntrega=Parent:cpo.DataEntrega, _wf_param_QualEntrega=Parent
11. **ResetGroup** [bTryl1] alvo El[pop alerta alteracao]
12. **SetCustomState** [bTrzB1] alvo El[Reusable pop.EditaContasReceberNew] · value=False, custom_state="custom.var_liberaedicao_"

#### WF bTruD — ButtonClicked em El[btn comentarios recebimento]
1. **ShowElement** [bTruE] alvo El[pop.HistoricosContaReceber A]
2. **DisplayGroupData** [bTruF] alvo El[pop.HistoricosContaReceber A] · data_source=Ancestor[TableCrossAxis]

#### WF bTrwl — ButtonClicked em El[btn gravar entrega]
1. **ShowElement** [bTryF1] alvo El[pop alerta alteracao]
2. **DisplayGroupData** [bTryH1] alvo El[pop alerta alteracao] · data_source=Ancestor[TableCrossAxis]
3. **SetCustomState** [bTryS1] alvo El[pop alerta alteracao] · value=El[ipt qtd entrega]:get_data, custom_state="custom.var_qtdentrega_", custom_states_values={0={value=El[upf arquivo nf]:get_data, custom_state="custom.var_arquivonf_"}, 1={value=El[ipt dtentrega]:get_data, custom_state="custom.dt_entrega_"}, 2={value=El[ipt numnf]:get_data, custom_state="custom.var_numnf_"}, 3={value=El[ipt comissaounit]:get_data, custom_state="custom.var_valorcomissao_"}}

#### WF bTsKG — ButtonClicked em El[Icon I]
1. **HideElement** [bTsKL] alvo El[pop cancelar entrega e pedido]

#### WF bTsKN — ButtonClicked em El[Button J]
- condição: El[tgg cancela pedido]:get_AAI:is_false
- props: event_color="red"
1. **ChangeThing** [bTsKS] campos: cpo.StatusEntrega = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[MultilineInput B]:get_data}"; cpo.QtdEntrega = 0 · to_change=El[pop cancelar entrega e pedido]:custom.var_qualentrega_
2. **ScheduleAPIEvent** [bTsKT] SÓ SE El[tgg informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTsKX] SÓ SE El[tgg informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ResetInputs** [bTsKY] 
5. **HideElement** [bTsKZ] alvo El[pop cancelar entrega e pedido]
6. **DeleteListOfThings** [bTsOV] to_delete=ResultOfStep[bTsKS]:cpo.QuaisContasReceber, type_to_delete="custom.tbl_contasreceber"
7. **DeleteListOfThings** [bTsOa] to_delete=ResultOfStep[bTsKS]:cpo.QuaisContasPagar, type_to_delete="custom.tbl_contasreceber1"

#### WF bTsKe — ButtonClicked em El[Button J]
- condição: El[tgg cancela pedido]:get_AAI:is_true
- props: event_color="red"
1. **ChangeThing** [bTsKj] campos: cpo.QualEtapa = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[MultilineInput B]:get_data}" · to_change=El[pop cancelar entrega e pedido]:custom.var_qualpedido_
2. **ScheduleAPIEvent** [bTsKk] SÓ SE El[tgg informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTsKl] SÓ SE El[tgg informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ChangeListOfThings** [bTsKp] campos: cpo.MotivoCancelamento = "{ResultOfStep[bTsKj]:cpo.MotivoCancelamento}"; cpo.StatusEntrega = Opt.Etapas.Cancelado · to_change=ResultOfStep[bTsKj]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **ResetInputs** [bTsKq] 
6. **HideElement** [bTsKr] alvo El[pop cancelar entrega e pedido]
7. **DeleteListOfThings** [bTsOf] to_delete=ResultOfStep[bTsKj]:cpo.QuaisEntregas:cpo.QuaisContasReceber, type_to_delete="custom.tbl_contasreceber"
8. **DeleteListOfThings** [bTsOh] to_delete=ResultOfStep[bTsKj]:cpo.QuaisEntregas:cpo.QuaisContasPagar, type_to_delete="custom.tbl_contasreceber1"

#### WF bTsKw — ButtonClicked em El[Icon I]
1. **DisplayGroupData** [bTsLB] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.QualCliente

#### WF bTsLD — ButtonClicked em El[Icon I]
1. **DisplayGroupData** [bTsLI] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor
2. **ShowElement** [bTsLJ] alvo El[pop.AgendaContatos A]

#### WF bTsLO — ButtonClicked em El[Button E]
1. **ShowElement** [bTsLU] alvo El[pop cancelar entrega e pedido]
2. **SetCustomState** [bTsLZ] alvo El[pop cancelar entrega e pedido] · value=Parent:cpo.QualPedido, custom_state="custom.var_qualpedido_", custom_states_values={0={value=Parent, custom_state="custom.var_qualentrega_"}}

#### WF bTsOm — ButtonClicked em El[Button I]
1. **HideElement** [bTsOs] alvo El[pop cancelar entrega e pedido]
2. **ResetGroup** [bTsOx] alvo El[pop cancelar entrega e pedido]

#### WF bTsOz — ButtonClicked em El[Button D]
- condição: El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_true
1. **SetCustomState** [bTsPE] alvo El[Reusable pop.EditaContasReceberNew] · value=False, custom_state="custom.var_liberaedicao_"

#### WF bTryq1 — ButtonClicked em El[Button D]
- condição: El[Reusable pop.EditaContasReceberNew]:custom.var_liberaedicao_:is_false
1. **SetCustomState** [bTryw1] alvo El[Reusable pop.EditaContasReceberNew] · value=True, custom_state="custom.var_liberaedicao_"

#### WF bTsBL1 — ButtonClicked em El[Button H]
1. **ScheduleAPIEvent** [bTsBR1] date=Page.Current Date/Time, api_event="bToYh", _wf_param_DtEntrega=Parent:cpo.DataEntrega, _wf_param_QualEntrega=Parent

#### WF bTsBT1 — ButtonClicked em El[btn deletar pagamento]
1. **DeleteThing** [bTsBZ1] to_delete=Ancestor[TableCrossAxis]

#### WF bTsBe1 — ButtonClicked em El[btn mudar status pagamentos]
1. **ChangeThing** [bTsBk1] campos: cpo.StatusFinanceiro = Opt.StatusFinanceiro.A pagar · to_change=Ancestor[TableCrossAxis]

#### WF bTsBq1 — ButtonClicked em El[btn comentarios pagamento]
1. **ShowElement** [bTsBv1] alvo El[pop.HistoricosContaReceber A]

#### WF bTsDR1 — ButtonClicked em El[btn fecha addedita financeiro]
1. **HideElement** [bTsDW1] alvo El[Reusable pop.EditaContasReceberNew]
2. **ResetGroup** [bTsDX1] alvo El[Reusable pop.EditaContasReceberNew]
