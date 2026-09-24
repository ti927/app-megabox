# Pagina: `inicio` (bTHHt)


Resumo: 144 elementos · 3 workflows · 4 ações · 5 condicionais · 0 estados customizados
Elementos por tipo: TableCell 44, Text 39, TableMainAxis 22, Input 8, Group 7, TableCrossAxis 4, Icon 3, CustomElement 2, RadioButtons 2, Table 2, Dropdown 2, DateInput 2, Button 2, AutocompleteDropdown 1, HTML 1, RepeatingGroup 1, Popup 1, Alert 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho A` (bTeUi) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `tool.DashMenu A` (bTeUD) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **Group** `gp ajuste enquadramento tributario` (bTHTE) — oculto ao carregar
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → margin_left=250
  - **Group** `Group A` (bTheN0) — props: vertical_centering=True
    - **RadioButtons** `RadioButtons A` (bTheB0) — data_source: All(opt.TipoCliFor) · props: default=opt.TipoCliFor.Fornecedor, dynamic_type="option.opt_tipoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **RadioButtons** `RadioButtons B` (bTheH0) — props: choices="Oculta preenchidos\nExibe todos", default="Exibe todos", computed_value="text"
  - **Table** `Table A` (bThVv0) — data_source: Search(Tbl.EnderecosCliFor: cpo.TipoClifor equals El[RadioButtons A]:get_data AND cpo.QualGrupoCliFor equals El[SearchBox A]:get_data AND cpo.QualUfOpt equals El[Dropdown B]:get_data; sort cpo.Razao, ignore empty) · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, vertical_separator_color="var(--color_bTHGl_default)", horizontal_separator_color="var(--color_bTHGl_default)"
    - ⟂ quando El[RadioButtons B]:get_data:equals("Oculta preenchidos") → data_source=Search(Tbl.EnderecosCliFor: cpo.TipoClifor equals El[RadioButtons A]:get_data AND cpo.QualGrupoCliFor equals El[SearchBox A]:get_data AND cpo.QualUfOpt equals El[Dropdown B]:get_data AND cpo.QualRegimeTributario is_empty ∅; sort cpo.Razao, ignore empty)
    - **TableMainAxis** `TableMainAxis A` (bThWr0) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis A` (bThWs0) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis A` (bThWt0) — props: axis_index=7
    - **TableCrossAxis** `TableCrossAxis A` (bThWx0) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell A` (bThWy0) — props: cell_main_axis_id="bThWr0"
        - **Group** `Group B` (bTheq0) — props: vertical_centering=True
          - **AutocompleteDropdown** `SearchBox A` (bTheY0) — data_source: Search(Tbl.GrupoCliFor) · placeholder: "Busca cliente/fornecedor" · props: vertical_centering=True, no_language=True, field_to_search="cpo_nomecliente_text"
          - **Icon** `Icon B` (bThek0) — props: icon="material outlined close", vertical_centering=True
      - **TableCell** `Cell A` (bThWz0) — props: cell_main_axis_id="bThWs0"
        - **Text** `Text G` (bThdj0) — text: "MUNICIPIO"
      - **TableCell** `Cell A` (bThXD0) — props: cell_main_axis_id="bThWt0"
        - **Dropdown** `Dropdown B` (bThee0) — data_source: All(Opt.UFs) · placeholder: "filtro UF" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
      - **TableCell** `Cell B` (bThXh0) — props: cell_main_axis_id="bThXb0"
        - **Text** `Text F` (bThdd0) — text: "CEP"
      - **TableCell** `Cell D` (bThYL0) — props: cell_main_axis_id="bThYF0"
        - **Text** `Text B` (bThdF0) — text: "FANTASIA"
      - **TableCell** `Cell F` (bThYp0) — props: cell_main_axis_id="bThYj0"
        - **Text** `Text C` (bThdL0) — text: "CNPJ"
      - **TableCell** `Cell H` (bThZT0) — props: cell_main_axis_id="bThZN0"
        - **Text** `Text D` (bThdR0) — text: "ENDERECO"
      - **TableCell** `Cell J` (bThZx0) — props: cell_main_axis_id="bThZr0"
        - **Text** `Text E` (bThdX0) — text: "COMPLEMENTO"
      - **TableCell** `Cell L` (bThbd0) — props: cell_main_axis_id="bThbX0"
        - **Text** `Text I` (bThdv0) — text: "REGIME TRIBUTARIO"
    - **TableCrossAxis** `TableCrossAxis A` (bThXE0) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bThXF0) — props: cell_main_axis_id="bThWr0"
        - **Input** `Input A` (bThXV0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.Razao:to_uppercase}" · content: "{Ancestor[TableCrossAxis]:cpo.Razao:to_uppercase}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell A` (bThXJ0) — props: cell_main_axis_id="bThWs0"
        - **Input** `Input G` (bThbL0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.Municipio:to_uppercase}" · content: "{Ancestor[TableCrossAxis]:cpo.Municipio:to_uppercase}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell A` (bThXK0) — props: cell_main_axis_id="bThWt0"
        - **Input** `Input H` (bThbR0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.QualUfOpt:display}" · content: "{Ancestor[TableCrossAxis]:cpo.QualUfOpt:display}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell C` (bThXn0) — props: cell_main_axis_id="bThXb0"
        - **Input** `Input F` (bThbF0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.Cep:to_uppercase}" · content: "{Ancestor[TableCrossAxis]:cpo.Cep:to_uppercase}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell E` (bThYR0) — props: cell_main_axis_id="bThYF0"
        - **Input** `Input B` (bThaV0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.Fantasia:to_uppercase}" · content: "{Ancestor[TableCrossAxis]:cpo.Fantasia:to_uppercase}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell G` (bThYv0) — props: cell_main_axis_id="bThYj0"
        - **Input** `Input E` (bThaz0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.CnpjCpf:to_uppercase}" · content: "{Ancestor[TableCrossAxis]:cpo.CnpjCpf:to_uppercase}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell I` (bThZZ0) — props: cell_main_axis_id="bThZN0"
        - **Input** `Input C` (bThab0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.Endereco:to_uppercase}" · content: "{Ancestor[TableCrossAxis]:cpo.Endereco:to_uppercase}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell K` (bThaD0) — props: cell_main_axis_id="bThZr0"
        - **Input** `Input D` (bThah0) — placeholder: "{Ancestor[TableCrossAxis]:cpo.Complemento:to_uppercase}" · content: "{Ancestor[TableCrossAxis]:cpo.Complemento:to_uppercase}" · props: vertical_centering=True, disabled=True
      - **TableCell** `Cell M` (bThbj0) — props: cell_main_axis_id="bThbX0"
        - **Dropdown** `Dropdown A` (bThcn0) — data_source: All(opt.RegimeTributario) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, vertical_centering=True, bind_field="cpo_qualregimetributario_option_opt_regimetributario", dynamic_type="option.opt_regimetributario", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
    - **TableMainAxis** `TableMainAxis B` (bThXb0) — props: axis_index=5
    - **TableMainAxis** `TableMainAxis C` (bThYF0) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis D` (bThYj0) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis E` (bThZN0) — props: axis_index=3
    - **TableMainAxis** `TableMainAxis F` (bThZr0) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis G` (bThbX0) — props: axis_index=8
  - **HTML** `HTML A` (bThfI0) — html(2 chars) · props: vertical_centering=True
- **Group** `gp ajuste enderecos` (bTisF)
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → margin_left=250
  - **Group** `Group C` (bTiuE) — props: vertical_centering=True
    - **Group** `Group D` (bTkzx) — props: vertical_centering=True
      - **Text** `Text N` (bTkzf) — text: "Intervalo datas"
      - **Group** `gp filter data` (bTlHt) — props: vertical_centering=True
        - **DateInput** `ipt filter dtinicio` (bUBFN) — content: Page.Current Date/Time:change_date(1) · props: vertical_centering=True, show_month_year_picker=True
        - **DateInput** `ipt filter dtfim` (bUBFT) — content: El[ipt filter dtinicio]:get_data:plus_months(1):change_date(1):plus_days(-1) · props: vertical_centering=True, show_month_year_picker=True
        - **Icon** `Icon H` (bTlHn) — props: icon="material outline filter_alt_off", vertical_centering=True
    - **RepeatingGroup** `rpg entregas` (bUBFZ) — data_source: Search(Tbl.Entregas: cpo.dtentrega gte El[ipt filter dtinicio]:get_data AND cpo.dtentrega lte El[ipt filter dtfim]:get_data AND cpo.StatusEntrega equals Opt.Etapas.Financeiro) · props: group_type="custom.tbl_entregas", cell_min_height_css="56px"
  - **Table** `Table B` (bUAxV) — data_source: El[rpg entregas]:get_list_data:cpo.QualOrcamentoFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_qualenderecoorigem_custom_tbl_enderecosclifor", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="sum", message="cpo_valorcomissaobruto_number"}}) · props: group_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbEVuZGVyZWNvT3JpZ2VtIiwiY3VzdG9tLnRibF9lbmRlcmVjb3NjbGlmb3IiXSwiYWdnMCI6WyJzdW0gb2YgY3BvLlZhbG9yQ29taXNzYW9CcnV0byIsIm51bWJlciJdfX0=", vertical_centering=True
    - **TableMainAxis** `TableMainAxis H` (bUAyR) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis H` (bUAyS) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis H` (bUAyT) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis B` (bUAyX) — props: axis_index=0, cross_axis_repeat=False
      - **TableCell** `Cell N` (bUAyY) — props: cell_main_axis_id="bUAyR"
        - **Text** `Text A` (bUBFf) — text: "Fornecedor"
      - **TableCell** `Cell N` (bUAyZ) — props: cell_main_axis_id="bUAyS"
        - **Text** `Text J` (bUBFs) — text: "Janeiro"
      - **TableCell** `Cell N` (bUAyd) — props: cell_main_axis_id="bUAyT"
        - **Text** `Text K` (bUBFz) — text: "Fevereiro"
      - **TableCell** `Cell O` (bUAyv) — props: cell_main_axis_id="bUAyp"
        - **Text** `Text L` (bUBGJ) — text: "Março"
      - **TableCell** `Cell Q` (bUAzZ) — props: cell_main_axis_id="bUAzT"
        - **Text** `Text R` (bUBGv) — text: "Agosto"
      - **TableCell** `Cell U` (bUAzh) — props: cell_main_axis_id="bUAzV"
        - **Text** `Text P` (bUBGh) — text: "Junho"
      - **TableCell** `Cell S` (bUAzr) — props: cell_main_axis_id="bUAzl"
        - **Text** `Text Q` (bUBGo) — text: "Julho"
      - **TableCell** `Cell W` (bUAzz) — props: cell_main_axis_id="bUAzt"
        - **Text** `Text O` (bUBGX) — text: "Maio"
      - **TableCell** `Cell Z` (bUBAV) — props: cell_main_axis_id="bUBAL"
        - **Text** `Text M` (bUBGQ) — text: "Abril"
      - **TableCell** `Cell CZ` (bUBAz) — props: cell_main_axis_id="bUBAt"
        - **Text** `Text V` (bUBHd) — text: "Dezembro"
      - **TableCell** `Cell EZ` (bUBBR) — props: cell_main_axis_id="bUBBL"
        - **Text** `Text U` (bUBHT) — text: "Novembro"
      - **TableCell** `Cell GZ` (bUBBj) — props: cell_main_axis_id="bUBBd"
        - **Text** `Text T` (bUBHM) — text: "Outubro"
      - **TableCell** `Cell IZ` (bUBCB) — props: cell_main_axis_id="bUBBv"
        - **Text** `Text S` (bUBHF) — text: "Setembro"
    - **TableCrossAxis** `TableCrossAxis B` (bUAye) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
      - **TableCell** `Cell N` (bUAyf) — props: cell_main_axis_id="bUAyR"
        - **Text** `Text H` (bUBFl) — text: "{Text("{Ancestor[TableCrossAxis]:grouping0:cpo.NomeEndereco}")}"
      - **TableCell** `Cell N` (bUAyj) — props: cell_main_axis_id="bUAyS"
        - **Text** `Text W` (bUBHp) — text: ""
        - **Text** `Text X` (bUBHv) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(1), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell N` (bUAyk) — props: cell_main_axis_id="bUAyT"
        - **Text** `Text Y` (bUBIB) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(2), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell P` (bUAzB) — props: cell_main_axis_id="bUAyp"
        - **Text** `Text Z` (bUBII) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(3), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell R` (bUAzf) — props: cell_main_axis_id="bUAzT"
        - **Text** `Text IZ` (bUBIx) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(8), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell V` (bUAzn) — props: cell_main_axis_id="bUAzV"
        - **Text** `Text CZ` (bUBIg) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(6), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell T` (bUAzx) — props: cell_main_axis_id="bUAzl"
        - **Text** `Text DZ` (bUBIn) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(7), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell X` (bUBAF) — props: cell_main_axis_id="bUAzt"
        - **Text** `Text BZ` (bUBIZ) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(5), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell Y` (bUBAK) — props: cell_main_axis_id="bUBAL"
        - **Text** `Text AZ` (bUBIP) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(4), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell DZ` (bUBBF) — props: cell_main_axis_id="bUBAt"
        - **Text** `Text MZ` (bUBJc) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(12), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell FZ` (bUBBX) — props: cell_main_axis_id="bUBBL"
        - **Text** `Text LZ` (bUBJV) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(11), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell HZ` (bUBBp) — props: cell_main_axis_id="bUBBd"
        - **Text** `Text KZ` (bUBJL) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(10), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
      - **TableCell** `Cell JZ` (bUBCH) — props: cell_main_axis_id="bUBBv"
        - **Text** `Text JZ` (bUBJE) — text: "{Text("{El[rpg entregas]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:equals(Ancestor[TableCrossAxis]:grouping0), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.dtentrega:extract_from_date(component_to_extract="month"):equals(9), constraint_type=∅}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
    - **TableMainAxis** `Column D` (bUAyp) — props: axis_index=3
    - **TableMainAxis** `Column E` (bUAzT) — props: axis_index=8
    - **TableMainAxis** `Column E` (bUAzV) — props: axis_index=6
    - **TableMainAxis** `Column E` (bUAzl) — props: axis_index=7
    - **TableMainAxis** `Column E` (bUAzt) — props: axis_index=5
    - **TableMainAxis** `Column E` (bUBAL) — props: axis_index=4
    - **TableMainAxis** `Column J` (bUBAt) — props: axis_index=12
    - **TableMainAxis** `Column J` (bUBBL) — props: axis_index=11
    - **TableMainAxis** `Column J` (bUBBd) — props: axis_index=10
    - **TableMainAxis** `Column J` (bUBBv) — props: axis_index=9
- **Popup** `pop apagar registro` (bTHtP0) — props: border_color_top="var(--color_bTHHQ_default)", border_style_top="solid", border_width_top=5, four_border_style=True, border_roundness_left=10, border_roundness_right=10
  - **Icon** `Icon A` (bTHtV0) — props: icon="fa fa-exclamation-triangle"
  - **Text** `Text EZ` (bTHtb0) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text FZ` (bTHth0) — text: "Você está tentando apagar um registro de seu banco e dados." · props: font_alignment="center"
  - **Text** `Text GZ` (bTHtn0) — text: "Esta ação não pode ser revertida!" · props: font_alignment="center"
  - **Text** `Text HZ` (bTHtt0) — text: "Deseja continuar?" · props: font_alignment="center"
  - **Button** `Button C` (bTHuF0) — text: "SIM"
  - **Button** `Button D` (bTHuL0) — text: "NÃO"
- **Alert** `alt processando` (bTHsk0) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! " · props: at_to_top=True

## Workflows

#### WF bTIaV — PageLoaded
1. **Plugin[1558770956236x539499438875082750]/AAC** [bTlNt] 

#### WF bTlIx — ButtonClicked em El[Icon H]
1. **ResetGroup** [bTlJD] alvo El[gp filter data]
2. **ChangePage** [bTlNc] alvo El[Current page] · add_parameters=True, url_parameters={0={key="clienteplanilha", value="{∅}"}}, keep_current_page_params=True

#### WF bThfB0 — ButtonClicked em El[Icon B]
1. **ResetGroup** [bThfH0] alvo El[Group B]
