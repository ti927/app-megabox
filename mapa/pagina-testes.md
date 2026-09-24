# Pagina: `testes` (bUAiV)


Resumo: 17 elementos · 0 workflows · 0 ações · 0 condicionais · 0 estados customizados
Elementos por tipo: TableCell 6, TableMainAxis 3, Text 3, TableCrossAxis 2, Dropdown 1, Table 1, Image 1

## Árvore de elementos

- **Dropdown** `Dropdown A` (bUAjx) — data_source: All(opt.TipoCliFor) · props: vertical_centering=True, dynamic_type="option.opt_tipoclifor", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
- **Table** `Table A` (bUAiX) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[Dropdown A]:get_data; ignore empty) · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **TableMainAxis** `TableMainAxis A` (bUAjT) — props: axis_index=0
  - **TableMainAxis** `TableMainAxis A` (bUAjX) — props: axis_index=1
  - **TableMainAxis** `TableMainAxis A` (bUAjY) — props: axis_index=2
  - **TableCrossAxis** `TableCrossAxis A` (bUAjZ) — props: axis_index=0, make_sticky=True, cross_axis_repeat=False
    - **TableCell** `Cell A` (bUAjd) — props: cell_main_axis_id="bUAjT"
      - **Text** `Text C` (bUAkZ) — text: "{Ancestor[Table]:get_list_data:count}"
    - **TableCell** `Cell A` (bUAje) — props: cell_main_axis_id="bUAjX"
    - **TableCell** `Cell A` (bUAjf) — props: cell_main_axis_id="bUAjY"
  - **TableCrossAxis** `TableCrossAxis A` (bUAjj) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
    - **TableCell** `Cell A` (bUAjk) — props: cell_main_axis_id="bUAjT"
      - **Text** `Text B` (bUAkN) — text: "{CellIndex}"
    - **TableCell** `Cell A` (bUAjl) — props: cell_main_axis_id="bUAjX"
      - **Image** `Image A` (bUAkH) — props: src="{Ancestor[TableCrossAxis]:cpo.Foto}"
    - **TableCell** `Cell A` (bUAjp) — props: cell_main_axis_id="bUAjY"
      - **Text** `Text A` (bUAjr) — text: "{Ancestor[TableCrossAxis]:cpo.NomeCliFor}"

## Workflows
