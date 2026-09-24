# Reusable: `pop.BloquearClifor` (bTvUD)


Resumo: 33 elementos · 4 workflows · 5 ações · 2 condicionais · 0 estados customizados
Elementos por tipo: Text 10, TableCell 6, Group 5, Icon 3, TableMainAxis 3, MultiLineInput 2, TableCrossAxis 2, Button 1, Table 1

## Árvore de elementos

- **Group** `Group D` (bTvZN) — props: vertical_centering=True
  - **Text** `Text I` (bTvZT) — text: "Bloquear Filiais" · props: font_alignment="center"
  - **Icon** `Icon A` (bTvZZ) — props: icon="material outlined close", vertical_centering=True
- **Group** `Group C` (bTvZF) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **Group** `Group A` (bTvVi) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
    - **Group** `Group E` (bUBcM) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Icon** `Icon C` (bUBcG) — props: icon="fa fa-info-circle", vertical_centering=True
      - **Text** `Text J` (bUBbt) — text: "Caso precise bloquear todas filiais, basta digitar o motivo no campo abaixo e clicar em "Bloquear Grupo". Não funciona para desbloqueio."
    - **Group** `Group B` (bTvWG) — props: vertical_centering=True
      - **Text** `Text B` (bTvVu) — text: "Motivo do bloqueio:"
      - **MultiLineInput** `ipt motivo bloquear` (bTvVo) — placeholder: "Digite o motivo"
    - **Button** `Button A` (bTvWA) — text: "Bloquear Todas Filiais" · props: icon="material outlined block", vertical_centering=True, icon_size=16, button_type="label_icon"
  - **Table** `Table A` (bTvUO) — data_source: Parent:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - **TableMainAxis** `TableMainAxis A` (bTvVK) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis A` (bTvVL) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis A` (bTvVP) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis A` (bTvVQ) — props: axis_index=0, cross_axis_repeat=False
      - **TableCell** `Cell A` (bTvVR) — props: cell_main_axis_id="bTvVK"
        - **Text** `Text A` (bTvWR) — text: "Filial"
      - **TableCell** `Cell A` (bTvVV) — props: cell_main_axis_id="bTvVL"
        - **Text** `Text C` (bTvWX) — text: "Motivo do bloqueio/liberação"
      - **TableCell** `Cell A` (bTvVW) — props: cell_main_axis_id="bTvVP"
        - **Text** `Text D` (bTvWe) — text: "Liberado s/n"
    - **TableCrossAxis** `TableCrossAxis A` (bTvVX) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
      - **TableCell** `Cell A` (bTvVb) — props: cell_main_axis_id="bTvVK"
        - **Text** `Text E` (bTvWl) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}")}"
        - **Text** `Text F` (bTvWv) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.CnpjCpf:to_capitalized_words}")}"
        - **Text** `Text G` (bTvXB) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Endereco:to_capitalized_words}")}"
      - **TableCell** `Cell A` (bTvVc) — props: cell_main_axis_id="bTvVL"
        - **MultiLineInput** `MultilineInput B` (bTvXO) — placeholder: "Digite o motivo" · auto_binding: True · props: bind_field="cpo_bloqueadomotivo_text"
      - **TableCell** `Cell A` (bTvVd) — props: cell_main_axis_id="bTvVP"
        - **Icon** `Icon B` (bUBbV) — props: icon="fa fa-check-circle", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Liberado:is_false → icon="fa fa-times-circle", icon_color="var(--color_bTHHQ_default)"
          - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2
        - **Text** `Text H` (bTvYb) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Liberado:format_boolean(formatting_for_true="SIM", formatting_for_false="NÃO")}")}" · props: font_alignment="center"

## Workflows

#### WF bTvYp — ButtonClicked em El[Button A]
1. **ChangeListOfThings** [bTvYv] campos: cpo.LiberadoMotivo = "{El[ipt motivo bloquear]:get_data}"; cpo.Liberado = False · to_change=Parent:cpo.QuaisEnderecos, type_to_change="custom.tbl_enderecosclifor"
2. **ResetInputs** [bTvZA] 

#### WF bUBbb — ButtonClicked em El[Icon B]
- condição: Ancestor[TableCrossAxis]:cpo.Liberado:is_true
1. **ChangeThing** [bUBbh] campos: cpo.Liberado = False · to_change=Ancestor[TableCrossAxis]

#### WF bUBbj — ButtonClicked em El[Icon B]
- condição: Ancestor[TableCrossAxis]:cpo.Liberado:is_false
1. **ChangeThing** [bUBbo] campos: cpo.Liberado = True · to_change=Ancestor[TableCrossAxis]

#### WF bTxzI0 — ButtonClicked em El[Icon A]
1. **HideElement** [bTxzO0] alvo El[Reusable pop.BloquearClifor]
