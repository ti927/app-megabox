# Reusable: `pop.RespostasEmails` (bUBss)


Resumo: 28 elementos · 2 workflows · 2 ações · 2 condicionais · 0 estados customizados
Elementos por tipo: TableCell 6, Text 5, Group 4, Icon 3, TableMainAxis 3, TableCrossAxis 2, HTML 2, CustomElement 1, Table 1, select2-MultiDropdown 1

## Árvore de elementos

- **CustomElement** `pop.CadastroUsuarios A` (bUBwi) — USA Reusable pop.CadastroUsuarios · props: custom_id="bTgiN"
- **Group** `TITULO` (bUBuL) — props: group_type="user", vertical_centering=True
  - **Group** `Group C` (bUBuN) — props: vertical_centering=True
    - **Text** `Text C` (bUBuR) — text: "Respostas Emails" · props: font_alignment="center"
  - **Icon** `Icon A` (bUBuM) — props: icon="material outlined close", vertical_centering=True
- **Group** `RESPOSTAS EMAILS` (bUBvH) — props: group_type="user", vertical_centering=True
  - **Group** `gp toggle rpgemails` (bUBvI) — props: vertical_centering=True
    - **Icon** `Icon L` (bUBvO) — props: icon="material outlined mark_email_unread", vertical_centering=True
    - **Text** `Text F` (bUBvJ) — text: "Respostas automáticas de emails"
    - **Icon** `Icon J` (bUBvN) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
      - ⟂ quando El[rpg RespostasEmails]:is_visible → icon="material outlined keyboard_arrow_up"
  - **Table** `rpg RespostasEmails` (bUBvT) — oculto ao carregar · data_source: API({"params_q": {"entries": {"0": "", "1": {"next": {"next": {"type": "Message", "name": "display", "is_slidable": false}, "type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bUCDF"}, "type": "GetElement", "is_slidable": false}, "2": ""}, "type": "TextExpression"):_api_c2_messages · props: group_type="api.apiconnector2.bUCHx.bUCHy.messages", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_bTHGr_default)", horizontal_separator_color="var(--color_bTHGr_default)"
    - **TableMainAxis** `TableMainAxis E` (bUBvb) — props: axis_index=0
    - **TableCrossAxis** `TableCrossAxis D` (bUBvf) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell F` (bUBvt) — props: cell_main_axis_id="bUBvb"
        - **select2-MultiDropdown** `Multidropdown A` (bUCDF) — data_source: All(Opt.FiltrosGmail) · placeholder: "Filtros" · props: default=All(Opt.FiltrosGmail):limit_to(1), vertical_centering=True, dynamic_type="option.opt_filtrosgmail", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando This:is_focused → border_color="#52A8EC", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=6, boxshadow_color="#52A8EC"
      - **TableCell** `Cell A` (bUCCF) — props: cell_main_axis_id="bUCBz", cell_cross_axis_index=0
      - **TableCell** `Cell C` (bUCDv) — props: cell_main_axis_id="bUCDp", cell_cross_axis_index=0
    - **TableCrossAxis** `TableCrossAxis D` (bUBwD) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=True, fixed_number_repeating_axis_count=10
      - **TableCell** `Cell F` (bUBwX) — props: cell_main_axis_id="bUBvb"
        - **Text** `Text A` (bUBzz) — text: ""
        - **Text** `Text B` (bUCBZ) — text: "{Date(10800000):plus_seconds(API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_internalDate:convert_to_number):plus_hours(-3)}"
        - **Text** `Text D` (bUCDL) — text: "{API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_labelIds}"
      - **TableCell** `Cell B` (bUCCL) — props: cell_main_axis_id="bUCBz", cell_cross_axis_index=1
        - **HTML** `HTML B` (bUCCQ) — html(2166 chars) · props: vertical_centering=True
      - **TableCell** `Cell D` (bUCEB) — props: cell_main_axis_id="bUCDp", cell_cross_axis_index=1
        - **HTML** `HTML C` (bUCED) — html(332 chars) · props: vertical_centering=True
    - **TableMainAxis** `Column F copy` (bUCBz) — props: axis_index=3
    - **TableMainAxis** `Column F copy` (bUCDp) — props: axis_index=2

## Workflows

#### WF bUBzD — ButtonClicked em El[Icon A]
1. **HideElement** [bUBzE] alvo El[Reusable pop.RespostasEmails]

#### WF bUBzW — ButtonClicked em El[gp toggle rpgemails]
1. **ToggleElement** [bUBzX] alvo El[rpg RespostasEmails]
