# Reusable: `pop.DuplicarPedido` (bUAJN)


Resumo: 229 elementos · 10 workflows · 24 ações · 43 condicionais · 0 estados customizados
Elementos por tipo: TableCell 70, Text 40, TableMainAxis 35, Group 28, Input 22, Icon 10, TableCrossAxis 8, Table 4, Image 3, CustomElement 2, Dropdown 2, Button 2, AutocompleteDropdown 1, RadioButtons 1, DateInput 1

## Árvore de elementos

- **CustomElement** `pop.AgendaEnderecos A` (bUAYg) — USA Reusable pop.AgendaEnderecos · props: floating_reference="top", custom_id="bTPJL", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.CadastroProdutos A` (bUAYm) — USA Reusable pop.CadastroProdutos · props: floating_reference="top", custom_id="bTgZS", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Group** `Group A` (bUAJP) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento"
  - **Group** `Group A` (bUAKW) — data_source: Parent · props: group_type="custom.tbl_orcamento"
    - **Group** `Group A` (bUAKX) — data_source: Parent · props: group_type="custom.tbl_orcamento"
      - **Group** `Group D` (bUAbC) — props: vertical_centering=True
        - **Text** `Text C` (bUAaq) — text: "Duplicar Pedido"
        - **Text** `Text E` (bUAaw) — text: "Siga as orientações ao lado"
      - **Group** `g Input` (bUAKb) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text A` (bUAKc) — text: "Cotação núm." · props: font_alignment="center"
        - **Input** `ip num orcamento copiar` (bUAKd) — placeholder: "" · content: Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1) · content_format: "int_number" · props: font_alignment="center", disabled=True
    - **Group** `Group A` (bUAKi) — data_source: Parent · props: group_type="custom.tbl_orcamento"
      - **Image** `Image A` (bUAKu) — props: src="{El[ipt buscacliente copiar]:get_data:cpo.Foto}", editor_preview_image="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1730482424502x336125780431834300/landscape-placeholder%5B1%5D.svg"
        - ⟂ quando El[ipt buscacliente copiar]:get_data:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - ⟂ quando El[ipt buscacliente copiar]:get_data:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `g Input` (bUAKj) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text A` (bUAKt) — text: "Cliente"
        - **Group** `gp add novo cliente` (bUAKn) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **AutocompleteDropdown** `ipt buscacliente copiar` (bUAKo) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Buscar cliente" · props: mandatory=True, unique_id="upper", ac_list_max=25, field_to_search="cpo_nomecliente_text", border_style_top="none", allow_not_in_list=True, border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)"
      - **Group** `Group A` (bUAKv) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
        - **Text** `Text A` (bUAKz) — text: "Endereço de entrega:" · props: vertical_centering=True
        - **Group** `Group A` (bUALA) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Dropdown** `dd enderecoentregacliente copiar` (bUALB) — data_source: Search(Tbl.EnderecosCliFor: cpo.QualGrupoCliFor equals El[ipt buscacliente copiar]:get_data) · placeholder: "Selecione o destino" · props: mandatory=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words}/{InjectedValue:cpo.UF:to_uppercase}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
          - **Icon** `Icon A` (bUALF) — props: icon="material outlined contact_mail"
            - ⟂ quando El[ipt buscacliente copiar]:get_data:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
    - **Group** `Group A` (bUALG) — data_source: Parent · props: group_type="custom.tbl_orcamento"
      - **Image** `Image A` (bUALX) — props: src="", button_disabled=True
        - ⟂ quando El[rd empresa megabox copiar]:get_data:equals(Opt.EmpresaMegabox.Megabox) → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1714500060178x676720324417465700/favicon%20megabox.png?_gl=1*z46kre*_gcl_au*OTk0Nzk3NzI0LjE3MTM3OTAwNTM.*_ga*NjI4NzMxNjM2LjE3MDYwMTA5MDU.*_ga_BFPVR2DEE2*MTcxNzE1NTcxNC44MC4xLjE3MTcxOTEzNDguNjAuMC4w"
        - ⟂ quando El[rd empresa megabox copiar]:get_data:equals(Opt.EmpresaMegabox.Paletes Brasil) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1717206119850x663794755204967700/aaa%20WhatsApp%20Image%202024-05-31%20at%2018.58.20.png"
      - **RadioButtons** `rd empresa megabox copiar` (bUALT) — data_source: All(Opt.EmpresaMegabox) · props: mandatory=True, default=Opt.EmpresaMegabox.Megabox, unique_id="rdempresas", dynamic_type="option.opt_empresamegabox", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
      - **Group** `g Input` (bUALY) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text A` (bUALZ) — text: "Data cotação"
        - **Input** `ip data orcamento copiar` (bUALd) — placeholder: "" · content: "{Page.Current Date/Time:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: disabled=True
      - **Group** `g DateTimePicker` (bUALH) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text A` (bUALL) — text: "Data Validade"
        - **DateInput** `ip data validade copiar` (bUALM) — content: Page.Current Date/Time:plus_days(2) · props: mandatory=True, border_style_left="none", four_border_style=True, border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
          - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_style_bottom="solid"
      - **Group** `g Input` (bUALN) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text A` (bUALR) — text: "Vendedor"
        - **Input** `ip vendedor copiar` (bUALS) — placeholder: "" · content: "{CurrentUser:cpo.NomeModelo:to_capitalized_words}" · props: disabled=True
  - **Group** `gp add produto` (bUAJT) — props: group_type="custom.tbl_orcamentoprodutos"
    - **Group** `Group F` (bUAbV) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Text** `Text D` (bUAbg) — text: "1" · props: font_alignment="center", vertical_centering=True
      - **Group** `Group F` (bUAba) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Group** `Group H` (bUAcE) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
          - **Icon** `Icon D` (bUAby) — props: icon="material outlined person", vertical_centering=True
          - **Text** `Text F` (bUAbb) — text: "Selecione o cliente"
        - **Text** `Text F` (bUAbf) — text: "Indique qual cliente está fazendo a compra"
    - **Text** `Text K` (bUAdp) — text: "" · props: border_color_left="var(--color_bTHGl_default)", border_style_left="solid", four_border_style=True
    - **Group** `Group G` (bUAbl) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Text** `Text G` (bUAbt) — text: "2" · props: font_alignment="center", vertical_centering=True
      - **Group** `Group G` (bUAbn) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Group** `Group I` (bUAcP) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
          - **Icon** `Icon E` (bUAcV) — props: icon="material outlined shopping_cart", vertical_centering=True
          - **Text** `Text H` (bUAcR) — text: "Escolha os produtos"
        - **Text** `Text G` (bUAbs) — text: "Marque os produtos que vai compor o novo pedido"
    - **Text** `Text L` (bUAdv) — text: "" · props: border_color_left="var(--color_bTHGl_default)", border_style_left="solid", four_border_style=True
    - **Group** `Group J` (bUAcX) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Text** `Text I` (bUAcn) — text: "3" · props: font_alignment="center", vertical_centering=True
      - **Group** `Group J` (bUAcc) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Group** `Group J` (bUAch) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
          - **Icon** `Icon F` (bUAcj) — props: icon="material outlined assignment_late", vertical_centering=True
          - **Text** `Text I` (bUAci) — text: "Revisão e ajustes"
        - **Text** `Text I` (bUAcd) — text: "Se os produtos estão com quantidade/valor incorreto, será possivel alterar depois de duplicar"
    - **Text** `Text M` (bUAeB) — text: "" · props: vertical_centering=False, border_color_left="var(--color_bTHGl_default)", border_style_left="solid", four_border_style=False
    - **Group** `Group E` (bUAdF) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Icon** `Icon G` (bUAdH) — props: icon="material outlined info", vertical_centering=True
      - **Text** `Text J` (bUAdG) — text: "[b]Importante[/b]: O pedido será criado na etapa PROPOSTA. Será necessário enviar a proposta para o cliente aceitar."
- **Table** `rpg produto duplicar` (bUANK) — data_source: Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=4, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=10
  - **TableCrossAxis** `TableCrossAxis A` (bUARf) — props: axis_index=1, cross_axis_repeat=True
    - **TableCell** `Cell A` (bUARN) — props: cell_main_axis_id="bUARj"
      - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Table** `tbl nome produto duplicar` (bUAPO) — props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, vertical_separator_style="none", horizontal_separator_style="none"
        - **TableMainAxis** `TableMainAxis A` (bUAPP) — props: axis_index=2
        - **TableCrossAxis** `TableCrossAxis A` (bUAPT) — props: axis_index=0
          - **TableCell** `Cell A` (bUAPU) — props: cell_main_axis_id="bUAPP"
            - **Image** `Image B` (bUAPV) — props: src="{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.QualTipoProduto:cpo.Icon}"
            - **Group** `Group B` (bUAPZ) — props: vertical_centering=True
              - **Text** `Text B` (bUAPa) — text: "{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
              - **Text** `Text B` (bUAPb) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}" · props: vertical_centering=True
            - **Text** `indica fornecedores` (bUAPf) — text: "{El[rpg fornecedorescotacao duplicar]:get_list_data:count}" · props: font_alignment="center", title_attribute="Qtd de fornecedores dessa cotação"
            - **Icon** `indica vencedor` (bUAPg) — props: icon="fa fa-trophy", title_attribute="Vencedor dessa cotação: {Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.QualFornecedor:cpo.NomeCliFor:to_capitalized_words}"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:greater_or_equal_than(1) → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:less_than(1) → is_visible=False
          - **TableCell** `Cell A` (bUAPh) — props: cell_main_axis_id="bUAQu"
            - **Input** `ip totalbruto copiar` (bUAPl) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
          - **TableCell** `Cell A` (bUAPm) — props: cell_main_axis_id="bUAQv"
          - **TableCell** `Cell A` (bUAPr) — props: cell_main_axis_id="bUAQz"
            - **Input** `ip totalcomissao copiar` (bUAPs) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
          - **TableCell** `Cell A` (bUAPt) — props: cell_main_axis_id="bUARA"
            - **Icon** `Icon B` (bUAPx) — props: icon="fa fa-chevron-down"
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → icon="fa fa-chevron-up"
          - **TableCell** `Cell A` (bUAPy) — props: cell_main_axis_id="bUARB"
            - **Input** `ip totalliquido copiar` (bUAPz) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
          - **TableCell** `Cell A` (bUAQD) — props: cell_main_axis_id="bUARF"
            - **Input** `ip totalbruto copiar` (bUAQE) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaUnit · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
          - **TableCell** `Cell A` (bUAQF) — props: cell_main_axis_id="bUARG"
            - **Input** `ip totalbruto copiar` (bUAQJ) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.valorcomissao · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
          - **TableCell** `Cell A` (bUAQK) — props: cell_main_axis_id="bUARH"
            - **Input** `ip totalbruto copiar` (bUAQL) — placeholder: "" · content: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.TipoFrete:display}" · props: font_alignment="center", disabled=True, placeholder_color="var(--color_bTHGl_default)"
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
          - **TableCell** `Cell A` (bUAQP) — props: cell_main_axis_id="bUARL"
            - **Input** `ip totalbruto copiar` (bUAQQ) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorFrete · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
          - **TableCell** `Cell A` (bUAQR) — props: cell_main_axis_id="bUARM"
            - **Input** `ip totalbruto copiar` (bUAQV) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorPISCOFINS · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando El[rpg fornecedorescotacao duplicar]:is_visible → is_visible=False
        - **TableCrossAxis** `TableCrossAxis A` (bUAQW) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell A` (bUAQX) — props: cell_main_axis_id="bUAPP"
          - **TableCell** `Cell A` (bUAQb) — props: cell_main_axis_id="bUAQu"
          - **TableCell** `Cell A` (bUAQc) — props: cell_main_axis_id="bUAQv"
          - **TableCell** `Cell A` (bUAQd) — props: cell_main_axis_id="bUAQz"
          - **TableCell** `Cell A` (bUAQh) — props: cell_main_axis_id="bUARA"
          - **TableCell** `Cell A` (bUAQi) — props: cell_main_axis_id="bUARB"
          - **TableCell** `Cell A` (bUAQj) — props: cell_main_axis_id="bUARF"
          - **TableCell** `Cell A` (bUAQn) — props: cell_main_axis_id="bUARG"
          - **TableCell** `Cell A` (bUAQo) — props: cell_main_axis_id="bUARH"
          - **TableCell** `Cell A` (bUAQp) — props: cell_main_axis_id="bUARL"
          - **TableCell** `Cell A` (bUAQt) — props: cell_main_axis_id="bUARM"
        - **TableMainAxis** `TableMainAxis A` (bUAQu) — props: axis_index=8
        - **TableMainAxis** `TableMainAxis A` (bUAQv) — props: axis_index=11
        - **TableMainAxis** `TableMainAxis A` (bUAQz) — props: axis_index=10
        - **TableMainAxis** `TableMainAxis A` (bUARA) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis A` (bUARB) — props: axis_index=9
        - **TableMainAxis** `TableMainAxis A` (bUARF) — props: axis_index=3
        - **TableMainAxis** `TableMainAxis A` (bUARG) — props: axis_index=4
        - **TableMainAxis** `TableMainAxis A` (bUARH) — props: axis_index=5
        - **TableMainAxis** `TableMainAxis A` (bUARL) — props: axis_index=6
        - **TableMainAxis** `TableMainAxis A` (bUARM) — props: axis_index=7
      - **Table** `rpg fornecedorescotacao duplicar` (bUANL) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}) · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_color="rgba(var(--color_surface_default_rgb), 0)", vertical_separator_width=4, horizontal_separator_color="var(--color_surface_default)", horizontal_separator_width=2
        - **TableMainAxis** `TableMainAxis A` (bUANP) — props: axis_index=1
        - **TableMainAxis** `TableMainAxis A` (bUANQ) — props: axis_index=2
        - **TableMainAxis** `TableMainAxis A` (bUANR) — props: axis_index=3
        - **TableCrossAxis** `TableCrossAxis A` (bUANV) — oculto ao carregar · props: axis_index=0
          - **TableCell** `Cell A` (bUANW) — props: cell_main_axis_id="bUANP"
          - **TableCell** `Cell A` (bUANX) — props: cell_main_axis_id="bUANQ"
          - **TableCell** `Cell A` (bUANb) — props: cell_main_axis_id="bUANR"
          - **TableCell** `Cell A` (bUANc) — props: cell_main_axis_id="bUAOx"
          - **TableCell** `Cell A` (bUANd) — props: cell_main_axis_id="bUAPB"
          - **TableCell** `Cell A` (bUANh) — props: cell_main_axis_id="bUAPC"
          - **TableCell** `Cell A` (bUANi) — props: cell_main_axis_id="bUAPD"
          - **TableCell** `Cell A` (bUANj) — props: cell_main_axis_id="bUAPH"
          - **TableCell** `Cell A` (bUANn) — props: cell_main_axis_id="bUAPI"
          - **TableCell** `Cell A` (bUANo) — props: cell_main_axis_id="bUAPJ"
          - **TableCell** `Cell A` (bUANp) — props: cell_main_axis_id="bUAPN"
        - **TableCrossAxis** `TableCrossAxis A` (bUANt) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell A` (bUANu) — props: cell_main_axis_id="bUANP"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Text** `Text B` (bUANv) — text: "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.UF:to_uppercase}"
            - **Text** `Text B` (bUANz) — text: "{Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:display:to_capitalized_words}"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:is_empty → text="{∅}Falta regime tributário"
          - **TableCell** `Cell A` (bUAOA) — props: cell_main_axis_id="bUANQ"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Input** `ip valorvenda copiar` (bUAOB) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", disabled=True, unique_id="", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", always_show_decimals=True
          - **TableCell** `Cell A` (bUAOF) — props: cell_main_axis_id="bUANR"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Input** `ip valorcomissao copiar` (bUAOG) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", disabled=True, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
          - **TableCell** `Cell A` (bUAOH) — props: cell_main_axis_id="bUAOx"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Dropdown** `dd tipofrete copiar` (bUAOL) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, font_alignment="center", disabled=True, bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - **TableCell** `Cell A` (bUAOM) — props: cell_main_axis_id="bUAPB"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Input** `ip valorfrete copiar` (bUAON) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", disabled=True, bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
              - ⟂ quando El[dd tipofrete copiar]:get_data:not_equals(Opt.TipoFrete.CIF Informado) → content=0, bgcolor="var(--color_bTHGh_default)", disabled=True
          - **TableCell** `Cell A` (bUAOR) — props: cell_main_axis_id="bUAPC"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Group** `Group B` (bUAOX) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
              - **Input** `ip icms copiar` (bUAOZ) — placeholder: "ICMS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", disabled=True, bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
            - **Input** `ip piscofins copiar` (bUAOT) — placeholder: "PIS/COFINS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", disabled=True, bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=True, border_roundness_left=0
            - **Input** `ipt calculotributo copiar` (bUAOS) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS:plus(Ancestor[TableCrossAxis]:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **TableCell** `Cell A` (bUAOd) — props: cell_main_axis_id="bUAPD"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Input** `ip totalbruto copiar` (bUAOe) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **TableCell** `Cell A` (bUAOf) — props: cell_main_axis_id="bUAPH"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
          - **TableCell** `Cell A` (bUAOk) — props: cell_main_axis_id="bUAPI"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Input** `ip totalcomissao copiar` (bUAOl) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **TableCell** `Cell A` (bUAOp) — props: cell_main_axis_id="bUAPJ"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Icon** `Icon B` (bUAOq) — props: icon="bootstrap trophy", button_disabled=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → icon="bootstrap trophy-fill", icon_color="var(--color_bTHHX_default)"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:less_than(0.01) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.valorcomissao:less_than(0.01) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
          - **TableCell** `Cell A` (bUAOr) — props: cell_main_axis_id="bUAPN"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
            - **Input** `ip totalliquido copiar` (bUAOw) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:equals(El[ip valorminimo]:get_data) → font_color="var(--color_bTHHX_default)"
            - **Input** `ip valorminimo` (bUAOv) — oculto ao carregar · placeholder: "R$ 0,00" · content: El[rpg fornecedorescotacao duplicar]:get_list_data:cpo.ValorVendaLiquido:min · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
        - **TableMainAxis** `TableMainAxis A` (bUAOx) — props: axis_index=4
        - **TableMainAxis** `TableMainAxis A` (bUAPB) — props: axis_index=5
        - **TableMainAxis** `TableMainAxis A` (bUAPC) — props: axis_index=6
        - **TableMainAxis** `TableMainAxis A` (bUAPD) — props: axis_index=7
        - **TableMainAxis** `TableMainAxis A` (bUAPH) — props: axis_index=10
        - **TableMainAxis** `TableMainAxis A` (bUAPI) — props: axis_index=9
        - **TableMainAxis** `TableMainAxis A` (bUAPJ) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis A` (bUAPN) — props: axis_index=8
    - **TableCell** `Cell A` (bUARR) — props: cell_main_axis_id="bUARk"
      - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Input** `Input qtd copiar` (bUARS) — placeholder: "000" · auto_binding: True · content_format: "int_number" · props: font_alignment="center", disabled=True, bind_field="cpo_qtd_number"
    - **TableCell** `Cell A` (bUARd) — props: cell_main_axis_id="bUATu"
      - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Icon** `btn seleciona produto` (bUARe) — props: icon="material outlined check_box_outline_blank", title_attribute="Destino desse produto"
        - ⟂ quando CurrentUser:cpo.TempOrcamentoProdutos:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
  - **TableMainAxis** `TableMainAxis A` (bUARj) — props: axis_index=4
  - **TableMainAxis** `TableMainAxis A` (bUARk) — props: axis_index=3
  - **TableCrossAxis** `TableCrossAxis A` (bUARl) — props: axis_index=0, make_sticky=True
    - **TableCell** `Cell A` (bUARp) — props: cell_main_axis_id="bUARj"
      - **Table** `Table A` (bUARq) — props: group_type="option.opt_a__oclifor", vertical_centering=True, vertical_separator_color="var(--color_surface_default)", vertical_separator_width=4, horizontal_separator_style="none"
        - **TableMainAxis** `TableMainAxis A` (bUARr) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis A` (bUARv) — props: axis_index=9
        - **TableCrossAxis** `TableCrossAxis A` (bUARw) — oculto ao carregar · props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=True, fixed_number_repeating_axis_count=0
          - **TableCell** `Cell A` (bUARx) — props: cell_main_axis_id="bUARr"
          - **TableCell** `Cell A` (bUASB) — props: cell_main_axis_id="bUARv"
          - **TableCell** `Cell A` (bUASC) — props: cell_main_axis_id="bUAST"
          - **TableCell** `Cell A` (bUASD) — props: cell_main_axis_id="bUASU"
          - **TableCell** `Cell A` (bUASH) — props: cell_main_axis_id="bUASV"
          - **TableCell** `Cell A` (bUASI) — props: cell_main_axis_id="bUASZ"
          - **TableCell** `Cell A` (bUASJ) — props: cell_main_axis_id="bUASa"
          - **TableCell** `Cell A` (bUASN) — props: cell_main_axis_id="bUASb"
          - **TableCell** `Cell A` (bUASO) — props: cell_main_axis_id="bUASf"
          - **TableCell** `Cell A` (bUASP) — props: cell_main_axis_id="bUATd"
        - **TableMainAxis** `TableMainAxis A` (bUAST) — props: axis_index=1
        - **TableMainAxis** `TableMainAxis A` (bUASU) — props: axis_index=2
        - **TableMainAxis** `TableMainAxis A` (bUASV) — props: axis_index=3
        - **TableMainAxis** `TableMainAxis A` (bUASZ) — props: axis_index=4
        - **TableMainAxis** `TableMainAxis A` (bUASa) — props: axis_index=5
        - **TableMainAxis** `TableMainAxis A` (bUASb) — props: axis_index=6
        - **TableMainAxis** `TableMainAxis A` (bUASf) — props: axis_index=8
        - **TableCrossAxis** `TableCrossAxis A` (bUASg) — props: axis_index=0
          - **TableCell** `Cell A` (bUASh) — props: cell_main_axis_id="bUARr"
            - **Icon** `btn abrir todos` (bUASm) — oculto ao carregar · props: icon="material outlined keyboard_double_arrow_down"
            - **Text** `Text B` (bUASl) — text: "Produto / Fornecedor"
          - **TableCell** `Cell A` (bUASn) — props: cell_main_axis_id="bUARv"
          - **TableCell** `Cell A` (bUASr) — props: cell_main_axis_id="bUAST"
            - **Text** `Text B` (bUASs) — text: "Produto Unit." · props: font_alignment="center"
          - **TableCell** `Cell A` (bUASt) — props: cell_main_axis_id="bUASU"
            - **Text** `Text B` (bUASx) — text: "Comissão Unit." · props: font_alignment="center"
          - **TableCell** `Cell A` (bUASy) — props: cell_main_axis_id="bUASV"
            - **Text** `Text B` (bUASz) — text: "Tipo Frete" · props: font_alignment="center"
          - **TableCell** `Cell A` (bUATD) — props: cell_main_axis_id="bUASZ"
            - **Text** `Text B` (bUATE) — text: "Valor Frete" · props: font_alignment="center"
          - **TableCell** `Cell A` (bUATF) — props: cell_main_axis_id="bUASa"
            - **Text** `txt titulo icms` (bUATJ) — oculto ao carregar · text: "ICMS" · props: font_alignment="center"
            - **Text** `txt titulo piscofins` (bUATK) — oculto ao carregar · text: "PIS/COFINS" · props: font_alignment="center"
            - **Text** `Text B` (bUATL) — text: "Aliq. ICMS" · props: font_alignment="center"
            - **Text** `Text B` (bUATP) — text: "Aliq. PISCOFINS" · props: font_alignment="center"
            - **Text** `Text B` (bUATQ) — text: "Total Tributos" · props: font_alignment="center"
          - **TableCell** `Cell A` (bUATR) — props: cell_main_axis_id="bUASb"
            - **Text** `Text B` (bUATV) — text: "Total Bruto" · props: font_alignment="center"
          - **TableCell** `Cell A` (bUATW) — props: cell_main_axis_id="bUASf"
            - **Text** `Text B` (bUATX) — text: "Total Comiss." · props: font_alignment="center"
          - **TableCell** `Cell A` (bUATb) — props: cell_main_axis_id="bUATd"
            - **Text** `Text B` (bUATc) — text: "Total Líq" · props: font_alignment="center"
        - **TableMainAxis** `TableMainAxis A` (bUATd) — props: axis_index=7
    - **TableCell** `Cell A` (bUATh) — props: cell_main_axis_id="bUARk"
      - **Text** `Text B` (bUATi) — text: "QTD" · props: font_alignment="center"
    - **TableCell** `Cell A` (bUATo) — props: cell_main_axis_id="bUATu"
  - **TableMainAxis** `TableMainAxis A` (bUATu) — props: axis_index=-1
- **Group** `Group C` (bUAXY) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
  - **Button** `btn gravarcotacao` (bUAXd) — text: "Duplicar Pedido" · props: vertical_centering=True
    - ⟂ quando El[ipt buscacliente copiar]:get_data:is_empty:or_(El[dd enderecoentregacliente copiar]:get_data:is_empty):or_(CurrentUser:cpo.TempOrcamentoProdutos:count:less_than(1)) → bgcolor="var(--color_bTHGl_default)", button_disabled=True
  - **Button** `btn cancelacotacao` (bUAXf) — text: "Cancela"

## Workflows

#### WF bUAMz — ButtonClicked em El[Icon A]
1. **ShowElement** [bUANE] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bUANF] alvo El[pop.AgendaEnderecos A] · value=El[ipt buscacliente copiar]:get_data, custom_state="custom.var_qualgrupoclifor_"

#### WF bUAUk — InputChanged em El[dd tipofrete copiar]
- condição: This:get_data:not_equals(Opt.TipoFrete.CIF Informado)
1. **ChangeThing** [bUAUp] campos: cpo.ValorFrete = ∅ · to_change=Ancestor[TableCrossAxis]
2. **ScheduleAPIEvent** [bUAUq] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bUAVr — ButtonClicked em El[Icon B]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_true
1. **ChangeThing** [bUAVt] campos: cpo.Vencedor = False · to_change=Ancestor[TableCrossAxis]

#### WF bUAVy — ButtonClicked em El[Icon B]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_false
1. **ChangeThing** [bUAWD] campos: cpo.Vencedor = False · to_change=El[rpg fornecedorescotacao duplicar]:get_list_data:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element
2. **ChangeThing** [bUAWE] campos: cpo.Vencedor = True · to_change=Ancestor[TableCrossAxis]

#### WF bUAWJ — ButtonClicked em El[Text B]
1. **ToggleElement** [bUAWL] alvo El[rpg fornecedorescotacao duplicar]
2. **ToggleElement** [bUAWP] alvo El[txt titulo icms]
3. **ToggleElement** [bUAWQ] alvo El[txt titulo piscofins]

#### WF bUAWh — ButtonClicked em El[Icon B]
1. **ToggleElement** [bUAWj] alvo El[rpg fornecedorescotacao duplicar]
2. **ToggleElement** [bUAWn] alvo El[txt titulo icms]
3. **ToggleElement** [bUAWo] alvo El[txt titulo piscofins]

#### WF bUAaL — ButtonClicked em El[btn seleciona produto]
- condição: CurrentUser:cpo.TempOrcamentoProdutos:not_contains(Ancestor[TableCrossAxis])
1. **MakeChangeCurrentUser** [bUAaR] campos: cpo.TempOrcamentoProdutos = Ancestor[TableCrossAxis]

#### WF bUAaT — ButtonClicked em El[btn seleciona produto]
- condição: CurrentUser:cpo.TempOrcamentoProdutos:contains(Ancestor[TableCrossAxis])
1. **MakeChangeCurrentUser** [bUAaY] campos: cpo.TempOrcamentoProdutos = Ancestor[TableCrossAxis]

#### WF bTzte — ButtonClicked em El[btn gravarcotacao]
1. **CopyListOfThings** [bUAem] to_copy=CurrentUser:cpo.TempOrcamentoProdutos, type_to_copy="custom.tbl_orcamentoprodutos"
2. **ChangeListOfThings** [bUAfn] campos: cpo.QualCliente = El[ipt buscacliente copiar]:get_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente copiar]:get_data; cpo.QuaisOrcamentosForncededores = ∅ · to_change=ResultOfStep[bUAem], type_to_change="custom.tbl_orcamentoprodutos"
3. **CopyListOfThings** [bUAer] to_copy=CurrentUser:cpo.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}), type_to_copy="custom.tbl_orcamentfornecedores"
4. **ChangeListOfThings** [bUAfi] campos: cpo.QualEnderecoDestino = El[dd enderecoentregacliente copiar]:get_data; cpo.QualEndereçoCobrança = El[dd enderecoentregacliente copiar]:get_data; cpo.QualCotacaoProduto = ∅ · to_change=ResultOfStep[bUAer], type_to_change="custom.tbl_orcamentfornecedores"
5. **ScheduleAPIEvent** [bUAeh] date=Page.Current Date/Time, api_event="bUAeU", _wf_param_qtd=CurrentUser:cpo.TempOrcamentoProdutos:count, _wf_param_fila=1, _wf_param_produtos=ResultOfStep[bUAem], _wf_param_dtvalidade=El[ip data validade copiar]:get_data, _wf_param_orcamentos=ResultOfStep[bUAer], _wf_param_currentuser=CurrentUser, _wf_param_empresamega=El[rd empresa megabox copiar]:get_data
6. **HideElement** [bUAgd] alvo El[Reusable pop.DuplicarPedido]
7. **ResetGroup** [bUAgf] alvo El[Reusable pop.DuplicarPedido]

#### WF bUAgB — ButtonClicked em El[btn cancelacotacao]
1. **HideElement** [bUAgH] alvo El[Reusable pop.DuplicarPedido]
2. **ResetGroup** [bUAgM] alvo El[Reusable pop.DuplicarPedido]
