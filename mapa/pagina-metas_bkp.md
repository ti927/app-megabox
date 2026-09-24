# Pagina: `metas_bkp` (bTqGX)


Resumo: 308 elementos · 29 workflows · 46 ações · 32 condicionais · 0 estados customizados
Elementos por tipo: Text 82, TableCell 56, Group 53, TableMainAxis 28, Icon 21, Input 16, Image 9, TableCrossAxis 8, Dropdown 6, Popup 4, Table 4, RepeatingGroup 4, Button 3, chartjs-LineBarChart 3, CustomElement 2, AutocompleteDropdown 2, DateInput 2, Plugin[1648823245313x509054419018711040]/AAC 2, FloatingGroup 1, Plugin[1680110374647x249108010620944400]/AAC 1, Plugin[1658181838561x862832580805263400]/AAC 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho A` (bTqXE) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **Popup** `pop entregas` (bTrTJ) — props: vertical_centering=True
  - ⟂ quando UrlParam("popentregas" as boolean):is_true → 
  - **Icon** `Icon J` (bTriz0) — props: icon="material outlined close", vertical_centering=True
  - **Table** `rpg entregas vendedor` (bTrTP) — data_source: El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_vendedor_user", value=UrlParam("vendedor" as user), constraint_type="equals"}, 1={key="cpo_numeropedido_text", value="{UrlParam("numpedido" as None)}", constraint_type="equals"}, 2={key="cpo_nftexto_text", value="{UrlParam("numnf" as None)}", constraint_type="equals"}, 3={key="cpo_qualcliente_custom_tbl_clientes", value=UrlParam("cliente" as custom.tbl_clientes), constraint_type="equals"}, 4={key="cpo_qualfornecedor_custom_tbl_clientes", value=UrlParam("fornecedor" as custom.tbl_clientes), constraint_type="equals"}}, descending=False, sort_field="cpo_dataentrega_date", ignore_empty_constraints=True) · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **TableMainAxis** `TableMainAxis I` (bTrUM) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis I` (bTrUN) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis B` (bTrUR) — props: axis_index=0, make_sticky=True, button_disabled=False, cross_axis_repeat=False
      - **TableCell** `Cell P` (bTrUT) — props: cell_main_axis_id="bTrUM"
        - **Text** `Text V` (bTrXj) — text: "Qtd"
      - **TableCell** `Cell P` (bTrUX) — props: cell_main_axis_id="bTrUN"
        - **Group** `gp filter fornecedor` (bTrgA0) — props: vertical_centering=True
          - **AutocompleteDropdown** `dd filtra fornecedor` (bTrcV) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor) · placeholder: "Fornecedor" · props: default=UrlParam("fornecedor" as custom.tbl_clientes), vertical_centering=True, choices_style="dynamic", field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon E` (bTrfW0) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra fornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell Q` (bTrUp) — props: cell_main_axis_id="bTrUj"
        - **Group** `gp filter vendedor` (bTrhh0) — props: vertical_centering=True
          - **Dropdown** `dd filtra filtravendedor` (bTraF) — data_source: Search(User: cpo.Ativo equals True) · placeholder: "Vendedor" · props: default=UrlParam("vendedor" as user), vertical_centering=True, dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGn_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon G` (bTrhT0) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra filtravendedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell S` (bTrVT) — props: cell_main_axis_id="bTrVN"
        - **Text** `Text G` (bTrXd) — text: "Produto"
      - **TableCell** `Cell U` (bTrVx) — props: cell_main_axis_id="bTrVr"
        - **Text** `Text DZ` (bTrYP) — text: "Valor comissao" · props: font_alignment="right"
        - **Text** `Text OZ` (bTraT) — text: "Total: {Text("{El[rpg entregas vendedor]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
      - **TableCell** `Cell W` (bTrWb) — props: cell_main_axis_id="bTrWV"
        - **Text** `Text EZ` (bTrYZ) — text: "Comissao unit" · props: font_alignment="right"
      - **TableCell** `Cell Y` (bTrXF) — props: cell_main_axis_id="bTrWz"
        - **Group** `gp filter numnf` (bTriJ0) — props: vertical_centering=True
          - **Input** `dd filtra numnf` (bTraw) — placeholder: "Nf fornecedor" · content: "{∅}" · props: vertical_centering=True, placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon H` (bTrhs0) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra numnf]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell AZ` (bTraf) — props: cell_main_axis_id="bTraZ", cell_cross_axis_index=0
        - **Text** `Text Y` (bTrak) — text: "Data entrega"
      - **TableCell** `Cell CZ` (bTrbO) — props: cell_main_axis_id="bTrbI", cell_cross_axis_index=0
        - **Group** `gp filtra numpedido` (bTrii0) — props: vertical_centering=True
          - **Input** `dd filtra num pedido` (bTrbf) — placeholder: "Num pedido" · props: vertical_centering=True, placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon I` (bTriR0) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra num pedido]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell EZ` (bTrcE) — props: cell_main_axis_id="bTrby", cell_cross_axis_index=0
        - **Group** `gp filter cliente` (bTrhC0) — props: vertical_centering=True
          - **AutocompleteDropdown** `dd filtra cliente` (bTrbC) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente) · placeholder: "Cliente" · props: default=UrlParam("cliente" as custom.tbl_clientes), vertical_centering=True, choices_style="dynamic", field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon F` (bTrgl0) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra cliente]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **TableCrossAxis** `TableCrossAxis B` (bTrUY) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
      - **TableCell** `Cell P` (bTrUd) — props: cell_main_axis_id="bTrUM"
        - **Text** `Text HZ` (bTrYx) — text: "{Text("{CellIndex}/{El[rpg entregas vendedor]:get_list_data:count}")}"
      - **TableCell** `Cell P` (bTrUe) — props: cell_main_axis_id="bTrUN"
        - **Group** `Group R` (bTreD0) — props: vertical_centering=True
          - **Icon** `filtrar fornecedor` (bTreI0) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
            - ⟂ quando UrlParam("fornecedor" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualFornecedor) → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Text** `Text FZ` (bTreJ0) — text: "Grupo: "
          - **Text** `Text FZ` (bTreN0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}")}"
        - **Group** `Group S` (bTreZ0) — props: vertical_centering=True
          - **Text** `Text IZ` (bTreb0) — text: "Filial: "
          - **Text** `Text IZ` (bTref0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_capitalized_words}")}"
      - **TableCell** `Cell R` (bTrUv) — props: cell_main_axis_id="bTrUj"
        - **Text** `Text JZ` (bTrZL) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}")}"
      - **TableCell** `Cell T` (bTrVZ) — props: cell_main_axis_id="bTrVN"
        - **Text** `Text LZ` (bTrZc) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}")}"
      - **TableCell** `Cell V` (bTrWD) — props: cell_main_axis_id="bTrVr"
        - **Text** `Text KZ` (bTrZV) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
      - **TableCell** `Cell X` (bTrWh) — props: cell_main_axis_id="bTrWV"
        - **Text** `Text MZ` (bTrZo) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorComissaoUnitario:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
      - **TableCell** `Cell Z` (bTrXL) — props: cell_main_axis_id="bTrWz"
        - **Text** `Text NZ` (bTrZv) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}")}"
      - **TableCell** `Cell BZ` (bTrap) — props: cell_main_axis_id="bTraZ", cell_cross_axis_index=1
        - **Text** `Text GZ` (bTrar) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
      - **TableCell** `Cell DZ` (bTrbV) — props: cell_main_axis_id="bTrbI", cell_cross_axis_index=1
        - **Text** `Text QZ` (bTrba) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumeroPedido}")}"
      - **TableCell** `Cell FZ` (bTrcL) — props: cell_main_axis_id="bTrby", cell_cross_axis_index=1
        - **Group** `Group P` (bTrdG0) — props: vertical_centering=True
          - **Icon** `filtrar cliente` (bTrdL0) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
            - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Text** `Text W` (bTrdM0) — text: "Grupo: "
          - **Text** `Text W` (bTrdN0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}"
        - **Group** `Group Q` (bTrdZ0) — props: vertical_centering=True
          - **Text** `Text X` (bTrdf0) — text: "Filial: "
          - **Text** `Text X` (bTrde0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_capitalized_words}")}"
    - **TableMainAxis** `Column D` (bTrUj) — props: axis_index=4
    - **TableMainAxis** `Column E` (bTrVN) — props: axis_index=5
    - **TableMainAxis** `Column F` (bTrVr) — props: axis_index=7
    - **TableMainAxis** `Column G` (bTrWV) — props: axis_index=6
    - **TableMainAxis** `Column H` (bTrWz) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis O` (bTraZ) — props: axis_index=1
    - **TableMainAxis** `Column H copy` (bTrbI) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis Q` (bTrby) — props: axis_index=3
  - **Button** `Button A` (bTrjS0) — text: "Fechar" · props: icon="material outlined close", button_type="label_icon"
- **Popup** `pop oculto` (bTqUR) — props: vertical_centering=True
- **Popup** `pop addedita meta adicional` (bTvLx) — props: group_type="user", vertical_centering=True
  - **Group** `Group User` (bTvMR) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Group** `Group BZ` (bTvQp) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Image** `Image I` (bTvMD) — props: stretch_or_rescale="zoom", src="{Parent:cpo.Foto}"
      - **Group** `Group M` (bTvMJ) — data_source: Parent · props: group_type="user", vertical_centering=True
        - **Text** `Text PZ` (bTvML) — text: "{Text("{Parent:cpo.NomeModelo:to_capitalized_words}")}"
        - **Text** `Text PZ` (bTvMP) — text: "{Text("{Parent:cpo.QualNivelVendedor:cpo.NomeNivel:to_capitalized_words}")}"
    - **Icon** `Icon P` (bTvQf) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group CZ` (bTvRD) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Text** `Text AZZ` (bTvPo) — text: "Criando metas adicionais no período:  "
    - **Text** `Text DZZ` (bTvQx) — text: "{Text("{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="dd/mmm/yyyy")}")} a {Text("{UrlParam("datafim" as date):format_date(formatting_type="custom", custom_format="dd/mmm/yyyy")}")}"
  - **Group** `Group Y` (bTvPV) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Text** `Text GZZ` (bTvdt) — text: "Qual nível e valor da meta adicional"
    - **Group** `Group GZ` (bTvdz) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Dropdown** `ipt qual nivel` (bTvdn) — data_source: Search(Tbl.NiveisVendedores; sort cpo.NomeNivel) · placeholder: "Nível" · props: mandatory=True, dynamic_type="custom.tbl_niveisvendedores", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeNivel}"
      - **Input** `ipt valor meta add` (bTvPJ) — placeholder: "R$ 0,00" · content_format: "currency" · props: mandatory=True, vertical_centering=True, currency_symbol="R$ ", always_show_decimals=True
        - ⟂ quando This:get_data:less_than(0) → font_color="var(--color_bTHHQ_default)"
      - **Icon** `Icon N` (bTvPP) — props: icon="ionic filled save", vertical_centering=True
  - **Table** `Table C` (bTvMo) — data_source: Search(Tbl.MetaAdicional: cpo.QualUsuario equals Parent AND cpo.DataFim equals UrlParam("datafim" as date) AND cpo.DataInicio equals UrlParam("datainicio" as date)) · props: group_type="custom.tbl_metaadicional", vertical_centering=True
    - **TableMainAxis** `TableMainAxis S` (bTvNk) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis S` (bTvNl) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis S` (bTvNp) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis C` (bTvNq) — props: axis_index=0, cross_axis_repeat=False
      - **TableCell** `Cell IZ` (bTvNr) — props: cell_main_axis_id="bTvNk"
        - **Text** `Text UZ` (bTvOI) — text: "Data"
      - **TableCell** `Cell IZ` (bTvNv) — props: cell_main_axis_id="bTvNl"
        - **Text** `Text VZ` (bTvOO) — text: "Valor"
      - **TableCell** `Cell IZ` (bTvNw) — props: cell_main_axis_id="bTvNp"
    - **TableCrossAxis** `TableCrossAxis C` (bTvNx) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
      - **TableCell** `Cell IZ` (bTvOB) — props: cell_main_axis_id="bTvNk"
        - **Text** `Text WZ` (bTvOf) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataInicio:format_date(formatting_type="custom", custom_format="dd/mmm/yy")}")}" · props: font_alignment="left"
        - **Text** `Text XZ` (bTvOl) — text: "a" · props: font_alignment="left"
        - **Text** `Text YZ` (bTvOr) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataFim:format_date(formatting_type="custom", custom_format="dd/mmm/yy")}")}" · props: font_alignment="left"
      - **TableCell** `Cell IZ` (bTvOC) — props: cell_main_axis_id="bTvNl"
        - **Text** `Text ZZ` (bTvOx) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Valor:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Valor:less_than(0) → font_color="var(--color_bTHHQ_default)"
      - **TableCell** `Cell IZ` (bTvOD) — props: cell_main_axis_id="bTvNp"
        - **Icon** `Icon M` (bTvPD) — props: icon="material outlined delete", vertical_centering=True
  - **Group** `Group Z` (bTvQA) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Group** `Group AZ` (bTvQR) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Icon** `Icon O` (bTvPu) — props: icon="material filled info", vertical_centering=True
      - **Text** `Text BZZ` (bTvQL) — text: "Importante:"
    - **Text** `Text SZ` (bTvMc) — text: "Se alguém vai [b]assumir[/b] meta de outro vendedor, insira um valor positivo."
    - **Text** `Text CZZ` (bTvQZ) — text: "Se alguém vai [b]perder[/b] meta para outro vendedor, insira valor negativo."
- **Popup** `pop.AddEdita MetasMensais` (bTvet) — props: group_type="user", vertical_centering=True
  - **Group** `Group JZ` (bTvlN) — props: vertical_centering=True
    - **Text** `Text RZZ` (bTvlT) — text: "Metas Mensais" · props: font_alignment="center"
    - **Icon** `Icon R` (bTvlZ) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group IZ` (bTvjg) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Group** `g Form` (bTvfX)
      - **Group** `g Input` (bTvfZ)
        - **Text** `Text HZZ` (bTvfd) — text: "Data inicio"
        - **DateInput** `dt inicio metamensal` (bTvfe) — content: UrlParam("datainicio" as date) · props: mandatory=True, date_format="custom", custom_format="dd/mmm/yy"
      - **Group** `g Input` (bTvff)
        - **Text** `Text HZZ` (bTvfj) — text: "Data fim"
        - **DateInput** `dt final metamensal` (bTvfk) — content: UrlParam("datafim" as date) · props: mandatory=True, date_format="custom", custom_format="dd/mmm/yy"
      - **Group** `g Input` (bTvfl)
        - **Text** `Text HZZ` (bTvfp) — text: "Vendedor"
        - **Dropdown** `dd vendedor metamensal` (bTvfq) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualDepto not equal Opt.DeptoUsuario.Operação AND cpo.QualDepto not equal Opt.DeptoUsuario.Financeiro; sort cpo.NomeModelo) · placeholder: "Selecione" · props: mandatory=True, dynamic_type="user", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
      - **Group** `g Input` (bTvfr)
        - **Text** `Text HZZ` (bTvfv) — text: "Nível"
        - **Dropdown** `dd nivel metamensal` (bTvfw) — data_source: Search(Tbl.NiveisVendedores; sort cpo.Ordem) · placeholder: "Selecione" · props: mandatory=True, default=El[dd vendedor metamensal]:get_data:cpo.QualNivelVendedor, dynamic_type="custom.tbl_niveisvendedores", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeNivel:to_uppercase}"
      - **Group** `g Input` (bTvfx)
        - **Text** `Text HZZ` (bTvgB) — text: "Valor"
        - **Input** `ipt valo metamensal` (bTvgC) — placeholder: "R$ 0,00" · content: El[dd nivel metamensal]:get_data:cpo.MetaVenda · content_format: "currency" · props: mandatory=True, currency_symbol="R$ ", always_show_decimals=True
      - **Button** `Button C` (bTvgD) — text: "Gravar" · props: font_alignment="center", vertical_centering=True, font_family="var(--font_default)"
        - ⟂ quando This:is_hovered:or_(This:is_pressed) → border_color="#9DA9E8", background_style="bgcolor", bgcolor="rgba(0, 149, 232, 1)"
        - ⟂ quando This:isnt_clickable → border_color="#6C7FEB", bgcolor="rgba(134, 193, 255, 1)"
    - **Table** `rpg metas mensais` (bTvgf) — data_source: Search(Tbl.MetasMensais: cpo.DataInicio equals El[dd filtro data metasmensais]:get_AAF:min AND cpo.DataFim equals El[dd filtro data metasmensais]:get_AAF:max AND cpo.QualVendedor equals El[dd filtro vendedor metasmensais]:get_data AND cpo.QualNivel equals El[dd filtro nível metasmensais]:get_data; sort cpo.DataInicio, ignore empty) · props: group_type="custom.tbl_metasmensais", vertical_centering=True
      - **TableMainAxis** `TableMainAxis T` (bTvhb) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis T` (bTvhc) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis T` (bTvhd) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis D` (bTvhh) — props: axis_index=0, cross_axis_repeat=False
        - **TableCell** `Cell JZ` (bTvhi) — props: cell_main_axis_id="bTvhb"
          - **Group** `gp filtro data metasmensais` (bTvoF) — props: vertical_centering=True
            - **Plugin[1648823245313x509054419018711040]/AAC** `dd filtro data metasmensais` (bTvlf) — props: AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="en-US", AAH="DD/MMM/YYYY", AAR=False, AAS=False, AAf="dd/mm/yy-dd/mm/yy"
            - **Icon** `bt reset filter datas metasmensais` (bTvnp) — props: icon="material outlined filter_alt_off", vertical_centering=True
        - **TableCell** `Cell JZ` (bTvhj) — props: cell_main_axis_id="bTvhc"
          - **Group** `gp filtro vendedor metasmensais` (bTvlx) — props: vertical_centering=True
            - **Dropdown** `dd filtro vendedor metasmensais` (bTvll) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualDepto not equal Opt.DeptoUsuario.Operação AND cpo.QualDepto not equal Opt.DeptoUsuario.Financeiro; sort cpo.NomeModelo) · placeholder: "Vendedor" · props: mandatory=True, vertical_centering=True, dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
            - **Icon** `bt reset filter vendedor metasmensais` (bTvlr) — props: icon="material outlined filter_alt_off", vertical_centering=True
              - ⟂ quando El[dd filtro vendedor metasmensais]:get_data:is_not_empty → icon_color="var(--color_primary_default)"
        - **TableCell** `Cell JZ` (bTvhn) — props: cell_main_axis_id="bTvhd"
          - **Group** `gp filtro nível metasmensais` (bTvmI) — props: vertical_centering=True
            - **Dropdown** `dd filtro nível metasmensais` (bTvmO) — data_source: Search(Tbl.NiveisVendedores; sort cpo.Ordem) · placeholder: "Nível" · props: mandatory=True, vertical_centering=True, dynamic_type="custom.tbl_niveisvendedores", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:cpo.NomeNivel:to_uppercase}"
            - **Icon** `bt reset nivel metasmensais` (bTvmN) — props: icon="material outlined filter_alt_off", vertical_centering=True
              - ⟂ quando El[dd filtro nível metasmensais]:get_data:is_not_empty → icon_color="var(--color_primary_default)"
        - **TableCell** `Cell KZ` (bTviF) — props: cell_main_axis_id="bTvhz"
          - **Text** `Text LZZ` (bTvkL) — text: "{Text("{El[rpg metas mensais]:get_list_data:cpo.ValorMeta:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
        - **TableCell** `Cell OZ` (bTvjN) — props: cell_main_axis_id="bTvjH"
      - **TableCrossAxis** `TableCrossAxis D` (bTvho) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
        - **TableCell** `Cell JZ` (bTvhp) — props: cell_main_axis_id="bTvhb"
          - **Text** `Text MZZ` (bTvkb) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataInicio:format_date(formatting_type="custom", custom_format="dd/mmm/yy")}")}"
          - **Text** `Text NZZ` (bTvki) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataFim:format_date(formatting_type="custom", custom_format="dd/mmm/yy")}")}"
        - **TableCell** `Cell JZ` (bTvht) — props: cell_main_axis_id="bTvhc"
          - **Text** `Text OZZ` (bTvko) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}")}"
        - **TableCell** `Cell JZ` (bTvhu) — props: cell_main_axis_id="bTvhd"
          - **Text** `Text PZZ` (bTvkz) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.NomeNivel:to_uppercase}")}"
        - **TableCell** `Cell LZ` (bTviL) — props: cell_main_axis_id="bTvhz"
          - **Text** `Text QZZ` (bTvlG) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorMeta:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
        - **TableCell** `Cell QZ` (bTvjJ) — props: cell_main_axis_id="bTvjH"
          - **Icon** `Icon Q` (bTvkV) — props: icon="material regular delete", vertical_centering=True
      - **TableMainAxis** `Column D` (bTvhz) — props: axis_index=3
      - **TableMainAxis** `Column F` (bTvjH) — props: axis_index=5
- **CustomElement** `tool.MenuPaginas A` (bTqYA) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
- **FloatingGroup** `FloatingGroup A` (bTqKB)
  - **Plugin[1648823245313x509054419018711040]/AAC** `RangePicker A` (bTqmo) — props: padding_vertical=12, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAK=True, AAM=2, AAN=2, AAS=False, AAf="{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {UrlParam("datafim" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
  - **RepeatingGroup** `rpg entregas gerais` (bTqUF) — data_source: Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Financeiro AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date)) · props: group_type="custom.tbl_entregas", separator_style="none"
  - **Group** `Group O` (bTqpD) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text S` (bTqoV) — text: "Entregas"
    - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTqoP) — props: AAG="var(--color_primary_default)", AAH="var(--color_primary_default)"
    - **Text** `Text T` (bTqob) — text: "Comissões"
  - **Button** `Button B` (bTveh) — text: "Criar Metas" · props: icon="phosphor outlined trophy", vertical_centering=True, button_type="label_icon", button_horiz_alignment="space-between"
- **Group** `Group Dashboard` (bTqLF) — props: name="Group Dashboard"
  - **Group** `Group F` (bTqYr) — props: vertical_centering=True
    - **Group** `Group E` (bTqYl) — props: vertical_centering=True
      - **Group** `Group G` (bTqiO) — props: vertical_centering=True
        - **Group** `Group J` (bTrkg) — data_source: El[rpg ranking vendedores]:get_list_data:specific_item(2) · props: group_type="user", vertical_centering=True, nonant_alignment="bb"
          - **Image** `Image E` (bTrks) — props: stretch_or_rescale="zoom", src="{Parent:cpo.Foto}"
          - **Group** `Group J` (bTrkl) — data_source: Parent · props: group_type="user", vertical_centering=True
            - **Text** `Text N` (bTrkm) — text: "{Text("{Parent:cpo.NomeModelo:to_uppercase:truncated(20)}")}" · props: font_alignment="center"
            - **Text** `Text N` (bTrkn) — text: "{Text("{Parent:cpo.QualNivelVendedor:cpo.NomeNivel}")}" · props: font_alignment="center"
            - **Text** `Text N` (bTrkr) — text: "{Text("{Parent:cpo.RankingVendaRegular:format_number(formatting_type="percentage", decimal_place=0)}")}" · props: font_alignment="center"
        - **Image** `Image B` (bTqhT) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1745969927438x134316970951988690/prata.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=967, aspect_ratio_height=1582
      - **Group** `Group H` (bTqiV) — props: vertical_centering=True
        - **Group** `Group L` (bTqlg) — data_source: El[rpg ranking vendedores]:get_list_data:specific_item(1) · props: group_type="user", vertical_centering=True, nonant_alignment="bb"
          - **Image** `Image F` (bTqlr) — props: stretch_or_rescale="zoom", src="{Parent:cpo.Foto}"
          - **Group** `Group L` (bTqll) — data_source: Parent · props: group_type="user", vertical_centering=True
            - **Text** `Text O` (bTqlm) — text: "{Text("{Parent:cpo.NomeModelo:to_uppercase:truncated(20)}")}" · props: font_alignment="center"
            - **Text** `Text O` (bTqln) — text: "{Text("{Parent:cpo.QualNivelVendedor:cpo.NomeNivel}")}" · props: font_alignment="center"
            - **Text** `Text RZ` (bTrjp) — text: "{Text("{Parent:cpo.RankingVendaRegular:format_number(formatting_type="percentage", decimal_place=0)}")}" · props: font_alignment="center"
        - **Image** `Image C` (bTqhr) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1745968558317x753392388689268900/ouro.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=80, aspect_ratio_height=127
      - **Group** `Group I` (bTqif) — props: vertical_centering=True
        - **Group** `Group K` (bTrkx) — data_source: El[rpg ranking vendedores]:get_list_data:specific_item(3) · props: group_type="user", vertical_centering=True, nonant_alignment="bb"
          - **Image** `Image G` (bTrlJ) — props: stretch_or_rescale="zoom", src="{Parent:cpo.Foto}"
          - **Group** `Group K` (bTrkz) — data_source: Parent · props: group_type="user", vertical_centering=True
            - **Text** `Text P` (bTrlD) — text: "{Text("{Parent:cpo.NomeModelo:to_uppercase:truncated(20)}")}" · props: font_alignment="center"
            - **Text** `Text P` (bTrlE) — text: "{Text("{Parent:cpo.QualNivelVendedor:cpo.NomeNivel}")}" · props: font_alignment="center"
            - **Text** `Text P` (bTrlF) — text: "{Text("{Parent:cpo.RankingVendaRegular:format_number(formatting_type="percentage", decimal_place=0)}")}" · props: font_alignment="center"
        - **Image** `Image D` (bTqhx) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1745968566904x224722329074366500/bronze.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=969, aspect_ratio_height=1582
    - **Group** `Group Statistics` (bTqJj) — props: name="Group Statistics", lock_in_editor=False
      - **Icon** `Icon K` (bTrlL) — props: icon="feather refresh-ccw", vertical_centering=True
      - **RepeatingGroup** `rpg ranking vendedores` (bTqkx) — data_source: Search(User: cpo.QualNivelVendedor is_not_empty ∅ AND cpo.Ativo equals True; sort cpo.RankingVendaRegular desc) · props: group_type="user", separator_style="none", unique_id="rankingmeta", fixed_rows=False, fixed_columns=False, show_all_items=True, cell_min_width_css="250px"
        - ⟂ quando El[Switch A]:get_AAI:is_false → is_visible=True
        - ⟂ quando El[Switch A]:get_AAI:is_true → is_visible=False
        - **Group** `Group C` (bTqlD) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Text** `Text R` (bTqla) — text: "{CellIndex}º"
          - **Image** `Image H` (bTqlJ) — props: stretch_or_rescale="zoom", src="{Parent:cpo.Foto}"
          - **Group** `Group D` (bTqlP) — data_source: Parent · props: group_type="user", vertical_centering=True
            - **Text** `Text K` (bTqlU) — text: "{Text("{Parent:cpo.NomeModelo:to_uppercase}")}"
            - **Text** `Text K` (bTqlV) — text: "{Text("{El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_vendedor_user", value=Parent, constraint_type="equals"}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
            - **Text** `Text TZ` (bTrkB) — text: "{Parent:cpo.RankingVendaRegular:format_number(formatting_type="percentage", decimal_place=0)}" · props: font_alignment="center", unique_id="percentmeta"
  - **Group** `gp painel metas` (bTqIi) — props: name="Group Table"
    - **Table** `rpg metas` (bTqOv) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualNivelVendedor is_not_empty ∅; sort cpo.NomeModelo) · props: group_type="user", vertical_centering=True
      - **TableMainAxis** `TableMainAxis A` (bTqPr) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis A` (bTqPw) — props: axis_index=8
      - **TableCrossAxis** `TableCrossAxis A` (bTqPx) — props: axis_index=0
        - **TableCell** `Cell A` (bTqQB) — props: cell_main_axis_id="bTqPr"
          - **Text** `Text A` (bTqSq) — text: "Vendedor"
        - **TableCell** `Cell A` (bTqQD) — props: cell_main_axis_id="bTqPw"
          - **Text** `Text H` (bTqTy) — text: "Status nível" · props: font_alignment="right"
        - **TableCell** `Cell B` (bTqQV) — props: cell_main_axis_id="bTqQP"
          - **Text** `Text B` (bTqTC) — text: "Meta" · props: font_alignment="right"
        - **TableCell** `Cell D` (bTqQz) — props: cell_main_axis_id="bTqQt"
          - **Text** `Text C` (bTqTJ) — text: "Valor faturado" · props: font_alignment="right"
        - **TableCell** `Cell F` (bTqRd) — props: cell_main_axis_id="bTqRX"
          - **Text** `Text D` (bTqTT) — text: "% da meta" · props: font_alignment="right"
        - **TableCell** `Cell H` (bTqSH) — props: cell_main_axis_id="bTqSB"
          - **Text** `Text E` (bTqTa) — text: "Premiação" · props: font_alignment="right"
        - **TableCell** `Cell L` (bTqSx) — props: cell_main_axis_id="bTqSf"
          - **Text** `Text F` (bTqTh) — text: "Bonus" · props: font_alignment="right"
        - **TableCell** `Cell J` (bTqnX) — props: cell_main_axis_id="bTqnR"
          - **Text** `Text M` (bTqnZ) — text: "Fechar" · props: font_alignment="right"
        - **TableCell** `Cell N` (bTqsn) — props: cell_main_axis_id="bTqsh"
          - **Text** `Text Z` (bTqsp) — text: "Média 3 meses" · props: font_alignment="right"
        - **TableCell** `Cell GZ` (bTvLN) — props: cell_main_axis_id="bTvLH", cell_cross_axis_index=0
          - **Text** `Text U` (bTvLP) — text: "Meta adicional" · props: font_alignment="right"
      - **TableCrossAxis** `TableCrossAxis A` (bTqQH) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell A` (bTqQI) — props: cell_main_axis_id="bTqPr"
          - **Image** `Image A` (bTqUb) — props: stretch_or_rescale="zoom", src="{Ancestor[TableCrossAxis]:cpo.Foto}"
          - **Group** `Group A` (bTqVf) — props: vertical_centering=True
            - **Text** `Text I` (bTqUn) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NomeModelo:to_capitalized_words}")}"
            - **Text** `Text J` (bTqVZ) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualNivelVendedor:cpo.NomeNivel:to_capitalized_words}")}"
        - **TableCell** `Cell A` (bTqQN) — props: cell_main_axis_id="bTqPw"
          - **Text** `Text L` (bTqYM) — text: "Manter Nível"
            - ⟂ quando El[Ipt media]:get_data:greater_than(Ancestor[TableCrossAxis]:cpo.QualNivelVendedor:cpo.QtdMetaBatida) → text="Subir Nível", border_color="var(--color_bTHHX_default)", font_color="var(--color_bTHHX_default)", bgcolor="var(--color_bTHHW_default)"
        - **TableCell** `Cell C` (bTqQb) — props: cell_main_axis_id="bTqQP"
          - **Input** `Ipt meta` (bTqUh) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QualNivelVendedor:cpo.MetaVenda · content_format: "currency" · props: font_alignment="center", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
        - **TableCell** `Cell E` (bTqRF) — props: cell_main_axis_id="bTqQt"
          - **Input** `Ipt valor faturado` (bTqUu) — placeholder: "" · content: El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_vendedor_user", value=Ancestor[TableCrossAxis], constraint_type="equals"}}):cpo.valorcomissao:sum · content_format: "currency" · props: font_alignment="center", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **Icon** `btn ver entregas` (bTrTD) — props: icon="material outlined open_in_new", vertical_centering=True
        - **TableCell** `Cell G` (bTqRj) — props: cell_main_axis_id="bTqRX"
          - **Plugin[1658181838561x862832580805263400]/AAC** `Progress-Bar A` (bTqnG) — props: AAF=El[Ipt valor faturado]:get_data:times(100):divide(El[Ipt total meta]:get_data), AAH="horizontal", AAL=10, AAM="var(--color_bTHHJ_default)", AAN=10, AAO="var(--color_bTHGy_default)", AAP="var(--color_bTHHJ_default)", AAQ=20, AAR="300", AAS="custom", AAT=100, AAX=0, AAY="linear", AAa="var(--color_bTHGh_default)", AAd=55
            - ⟂ quando El[Ipt % da meta A]:get_data:greater_or_equal_than(0.5):and_(El[Ipt % da meta A]:get_data:less_than(1)) → AAM="var(--color_primary_default)", AAP="var(--color_bTHGs_default)"
            - ⟂ quando El[Ipt % da meta A]:get_data:greater_or_equal_than(1) → AAM="var(--color_bTHHX_default)", AAP="var(--color_bTHHX_default)"
          - **Input** `Ipt % da meta A` (bTqWx) — oculto ao carregar · placeholder: "" · content: El[Ipt valor faturado]:get_data:divide(El[Ipt total meta]:get_data) · content_format: "float_number" · props: font_alignment="center", vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
          - **Input** `Ipt total meta` (bTvLr) — oculto ao carregar · placeholder: "" · content: El[Ipt meta]:get_data:plus(El[Ipt meta adicional]:get_data) · content_format: "float_number" · props: font_alignment="center", vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
        - **TableCell** `Cell I` (bTqSN) — props: cell_main_axis_id="bTqSB"
          - **Input** `Ipt valor premiação` (bTqVL) — placeholder: "" · content: 0 · content_format: "currency" · props: font_alignment="center", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - ⟂ quando El[Ipt % da meta A]:get_data:greater_than(1) → content=El[Ipt valor faturado]:get_data:times(Ancestor[TableCrossAxis]:cpo.QualNivelVendedor:cpo.ComissaoPadrao)
          - **Group** `Group FZ` (bTvdb) — props: vertical_centering=True
            - **Input** `bateu so nivel proprio` (bTvdJ) — oculto ao carregar · placeholder: "" · content: "no" · content_format: "text" · props: font_alignment="center", vertical_centering=True, disabled=True, decimal_place=6, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
              - ⟂ quando El[Ipt valor faturado]:get_data:less_or_equal_than(El[Ipt meta]:get_data) → content="{∅}yes"
            - **Input** `bateu so nivel extra` (bTvdP) — oculto ao carregar · placeholder: "" · content: "no" · content_format: "text" · props: font_alignment="center", vertical_centering=True, disabled=True, decimal_place=6, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
              - ⟂ quando ∅ → 
            - **Input** `tateu nivel prioprio+extra` (bTvdV) — oculto ao carregar · placeholder: "" · content: "no" · content_format: "text" · props: font_alignment="center", vertical_centering=True, disabled=True, decimal_place=6, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
        - **TableCell** `Cell K` (bTqSr) — props: cell_main_axis_id="bTqSf"
          - **Input** `Ipt valor bonus` (bTqVS) — placeholder: "" · content: 0 · content_format: "currency" · props: font_alignment="center", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - ⟂ quando El[Ipt valor faturado]:get_data:greater_than(Ancestor[TableCrossAxis]:cpo.QualNivelVendedor:cpo.ComissaoMetaBatida) → content=Ancestor[TableCrossAxis]:cpo.QualNivelVendedor:cpo.old_ValorBonus
        - **TableCell** `Cell M` (bTqne) — props: cell_main_axis_id="bTqnR"
          - **RepeatingGroup** `rpg entregas vendedor` (bTqqR) — oculto ao carregar · data_source: El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_vendedor_user", value=Ancestor[TableCrossAxis], constraint_type="equals"}}) · props: group_type="custom.tbl_entregas", separator_style="none"
          - **Icon** `Icon A` (bTqnl) — props: icon="material outlined add_task", vertical_centering=True, button_disabled=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisMetasFechadas:filtered(constraints={0={key="cpo_datainicio_date", value=UrlParam("datainicio" as date):change_hours(0):change_minutes(0):change_seconds(0), constraint_type="gte"}, 1={key="cpo_datafim_date", value=UrlParam("datafim" as date):change_hours(23):change_minutes(59):change_seconds(59), constraint_type="lte"}}):count:greater_or_equal_than(1) → icon="bootstrap clipboard-check-fill", icon_color="var(--color_bTHHX_default)", button_disabled=True, title_attribute="{Text("Já existe uma meta fechada dentro do periodo selecionado")}"
            - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor):and_(Ancestor[TableCrossAxis]:cpo.QuaisMetasFechadas:filtered(constraints={0={key="cpo_datainicio_date", value=UrlParam("datainicio" as date):change_hours(0):change_minutes(0):change_seconds(0), constraint_type="gte"}, 1={key="cpo_datafim_date", value=UrlParam("datafim" as date):change_hours(23):change_minutes(59):change_seconds(59), constraint_type="lte"}}):count:less_than(1)) → icon_color="var(--color_primary_default)", button_disabled=False
        - **TableCell** `Cell O` (bTqsu) — props: cell_main_axis_id="bTqsh"
          - **RepeatingGroup** `rpg metasfechadas` (bTqtf) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisMetasFechadas:list_from(El[Ipt  metafechada -2]:get_data):sorted(descending=True, sort_field="cpo_datainicio_date") · props: group_type="custom.tbl_orcfornecedorescotacao", separator_style="none", unique_id="esconde", fixed_rows=False, cell_min_height_css="18px"
            - **Text** `Text AZ` (bTqtl) — text: "{Text("{Parent:cpo.MesNome}")}"
            - **Text** `Text BZ` (bTqtr) — text: "{Text("{Parent:cpo.TotalComissaoMegabox:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
          - **Group** `Group U` (bTqtx) — props: vertical_centering=True
            - **Text** `Text CZ` (bTquD) — text: "Média"
            - **Input** `Ipt media` (bTquC) — placeholder: "" · content: El[rpg metasfechadas]:get_list_data:cpo.TotalComissaoMegabox:average · content_format: "currency" · props: font_alignment="right", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **Input** `Ipt  metafechada -2` (bTquO) — oculto ao carregar · placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisMetasFechadas:count:minus(2) · content_format: "int_number" · props: font_alignment="center", vertical_centering=True, disabled=True, placeholder_color="var(--color_bTHGl_default)"
        - **TableCell** `Cell HZ` (bTvLU) — props: cell_main_axis_id="bTvLH", cell_cross_axis_index=1
          - **Input** `Ipt meta adicional` (bTvLZ) — placeholder: "" · content: Search(Tbl.MetaAdicional: cpo.QualUsuario equals Ancestor[TableCrossAxis] AND cpo.DataInicio equals UrlParam("datainicio" as date) AND cpo.DataFim equals UrlParam("datafim" as date)):first_element:cpo.Valor · content_format: "currency" · props: font_alignment="center", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - ⟂ quando This:get_data:less_than(0) → font_color="var(--color_bTHHQ_default)"
          - **Icon** `btn add meta adicional` (bTvLb) — props: icon="material outlined add_box", vertical_centering=True
      - **TableMainAxis** `Column B` (bTqQP) — props: axis_index=1
      - **TableMainAxis** `Column C` (bTqQt) — props: axis_index=3
      - **TableMainAxis** `Column D` (bTqRX) — props: axis_index=4
      - **TableMainAxis** `Column E` (bTqSB) — props: axis_index=5
      - **TableMainAxis** `Column F` (bTqSf) — props: axis_index=6
      - **TableMainAxis** `TableMainAxis G` (bTqnR) — props: axis_index=9
      - **TableMainAxis** `TableMainAxis H` (bTqsh) — props: axis_index=7
      - **TableMainAxis** `Column B copy` (bTvLH) — props: axis_index=2
  - **Group** `Group Graphs` (bTqHN) — data_source: CurrentUser · props: group_type="user", name="Group Graphs"
    - **Group** `Group Graphs` (bTqHD) — props: name="Group Graphs"
      - **Group** `Group Graph_2` (bTqGw) — props: name="Group Graph_2"
        - **Text** `Text Q` (bTqGr) — text: "Entregas realizadas (por data de entrega)" · props: name="Text Q", font_family="var(--font_bTnzZ0_default_default)"
        - **chartjs-LineBarChart** `Line/BarChart B` (bTqqe) — data_source: El[rpg entregas gerais]:get_list_data:group_by(groupings={0={fn="exact", end=UrlParam("datafim" as date):change_hours(23):change_minutes(59):change_seconds(59), start=UrlParam("datainicio" as date):change_hours(0):change_minutes(0):change_seconds(0), message="cpo_vendedor_user", interval=1, information=∅, filling_gaps=True}}, aggregations={0={fn="count", message="cpo_valorcomissao_number"}}) · props: formatting_type="number", name="Line/BarChart A", chart_type="Bar", decimal_place=0, series1_color="var(--color_bTHHE_default)", currency_symbol="R$ ", data_points_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbFZlbmRlZG9yIiwidXNlciJdLCJhZ2cwIjpbImNvdW50IiwibnVtYmVyIl19fQ==", label_expression="{Text("{InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):first_element} {InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):last_element:truncated(1)}")} ({InjectedValue:agg0})", decimal_separator="comma", series1_fillColor="var(--color_bTHGy_default)", customize_tooltips=True, scaleShowGridLines=True, thousand_separator="dot", y_value_expression=InjectedValue:agg0
      - **Group** `Group DZ` (bTvSQ) — props: name="Group Graph_2"
        - **Text** `Text EZZ` (bTvSW) — text: "Entregas em andamento (por data prevista de entrega)" · props: name="Text Q", font_family="var(--font_bTnzZ0_default_default)"
        - **chartjs-LineBarChart** `Line/BarChart A` (bTvSV) — data_source: Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Em Entrega AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date)):group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_vendedor_user", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="count", message=∅}}) · props: formatting_type="number", name="Line/BarChart A", chart_type="Bar", decimal_place=0, series1_color="var(--color_bTHHE_default)", currency_symbol="R$ ", data_points_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbFZlbmRlZG9yIiwidXNlciJdLCJhZ2cwIjpbImNvdW50IiwibnVtYmVyIl19fQ==", label_expression="{Text("{InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):first_element} {InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):last_element:truncated(1)}")} ({InjectedValue:agg0})", decimal_separator="comma", series1_fillColor="var(--color_bTHGy_default)", customize_tooltips=True, scaleShowGridLines=True, thousand_separator="dot", y_value_expression=InjectedValue:agg0
      - **Group** `Group EZ` (bTvSb) — props: name="Group Graph_2"
        - **Text** `Text FZZ` (bTvSh) — text: " Entregas canceladas (por data prevista de entrega)" · props: name="Text Q", font_family="var(--font_bTnzZ0_default_default)"
        - **chartjs-LineBarChart** `Line/BarChart C` (bTvSd) — data_source: Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Cancelado AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date)):group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_vendedor_user", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="count", message=∅}}) · props: formatting_type="number", name="Line/BarChart A", chart_type="Bar", decimal_place=0, series1_color="var(--color_bTHHE_default)", currency_symbol="R$ ", data_points_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbFZlbmRlZG9yIiwidXNlciJdLCJhZ2cwIjpbImNvdW50IiwibnVtYmVyIl19fQ==", label_expression="{Text("{InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):first_element} {InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):last_element:truncated(1)}")} ({InjectedValue:agg0})", decimal_separator="comma", series1_fillColor="var(--color_bTHGy_default)", customize_tooltips=True, scaleShowGridLines=True, thousand_separator="dot", y_value_expression=InjectedValue:agg0

## Workflows

#### WF bTqpP — PageLoaded
1. **Plugin[1558770956236x539499438875082750]/AAC** [bTrct0] 
2. **ShowElement** [bTrcd0] alvo El[pop entregas] · SÓ SE UrlParam("popentregas" as boolean):is_true
3. **ChangePage** [bTqpX] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):and_(CurrentUser:cpo.UltimoDateRange:is_not_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min}"}, 1={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max}"}}, keep_current_page_params=True
4. **ChangePage** [bTqpc] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):or_(CurrentUser:cpo.UltimoDateRange:is_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
5. **TriggerCustomEvent** [bTrkZ] custom_event="bTrkJ"

#### WF bTqph — Plugin[1648823245313x509054419018711040]/AAd em El[RangePicker A]
1. **MakeChangeCurrentUser** [bTqpn] campos: cpo.UltimoDateRange = This:get_AAF
2. **ChangePage** [bTqpp] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min:change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTqqG — ButtonClicked em El[Icon A]
1. **NewThing** [bTqqM] tipo Tbl.MetasFechadas · campos: cpo.DataFim = UrlParam("datafim" as date):change_hours(23):change_minutes(59):change_seconds(59); cpo.DataInicio = UrlParam("datainicio" as date):change_hours(0):change_minutes(0):change_seconds(0); cpo.QuaisContasPagar = El[rpg entregas vendedor]:get_list_data:cpo.QuaisContasPagar; cpo.QuaisContasReceber = El[rpg entregas vendedor]:get_list_data:cpo.QuaisContasReceber; cpo.QuaisEntregas = El[rpg entregas vendedor]:get_list_data; cpo.QualVendedor = Ancestor[TableCrossAxis]; cpo.TotalComissaoMegabox = El[Ipt valor faturado]:get_data; cpo.TotalComissaoVendedor = El[Ipt valor premiação]:get_data; cpo.AnoNumero = UrlParam("datainicio" as date):extract_from_date(component_to_extract="year"); cpo.MesNome = "{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="mmmm")}"; cpo.MesNumero = UrlParam("datainicio" as date):extract_from_date(component_to_extract="month")
2. **ChangeThing** [bTqqX] campos: cpo.QuaisMetasFechadas = ResultOfStep[bTqqM] · to_change=Ancestor[TableCrossAxis]
3. **ResetGroup** [bTqqZ] alvo El[gp painel metas]

#### WF bTraL — ButtonClicked em El[btn ver entregas]
1. **ChangePage** [bTrcb0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="popentregas", value="{∅}yes"}, 1={key="vendedor", value="{Ancestor[TableCrossAxis]:_id}"}}, keep_current_page_params=True

#### WF bTrkJ — CustomEvent
- props: event_name="SortByNumber"
1. **PauseWFClient** [bTrkU] length=6000
2. **ChangeListOfThings** [bTrkb] campos: cpo.RankingVendaRegular = Search(Tbl.Entregas: cpo.QualVendedor equals InjectedValue AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date)):cpo.valorcomissao:sum:plus(Search(Tbl.MetaAdicional: cpo.QualUsuario equals InjectedValue AND cpo.DataInicio gte UrlParam("datainicio" as date) AND cpo.DataFim lte UrlParam("datafim" as date)):cpo.Valor:sum):divide(InjectedValue:cpo.QualNivelVendedor:cpo.MetaVenda) · to_change=El[rpg ranking vendedores]:get_list_data, type_to_change="user"

#### WF bTrlR — ButtonClicked em El[Icon K]
1. **TriggerCustomEvent** [bTrlX] custom_event="bTrkJ"

#### WF bTvPd — ButtonClicked em El[Icon N]
1. **NewThing** [bTvPj] tipo Tbl.MetaAdicional · campos: cpo.DataFim = UrlParam("datafim" as date); cpo.DataInicio = UrlParam("datainicio" as date); cpo.QualUsuario = Parent; cpo.Valor = El[ipt valor meta add]:get_data; cpo.QualNivel = El[ipt qual nivel]:get_data

#### WF bTvRO — ButtonClicked em El[btn add meta adicional]
1. **ShowElement** [bTvRU] alvo El[pop addedita meta adicional]
2. **DisplayGroupData** [bTvRZ] alvo El[pop addedita meta adicional] · data_source=Ancestor[TableCrossAxis]

#### WF bTvRb — ButtonClicked em El[Icon P]
1. **HideElement** [bTvRh] alvo El[pop addedita meta adicional]

#### WF bTvRm — ButtonClicked em El[Icon M]
1. **DeleteThing** [bTvRs] to_delete=Ancestor[TableCrossAxis]

#### WF bTven — ButtonClicked em El[Button B]
1. **ShowElement** [bTvoN] alvo El[pop.AddEdita MetasMensais]

#### WF bTvnJ — ButtonClicked em El[bt reset filter vendedor metasmensais]
1. **ResetGroup** [bTvnP] alvo El[gp filtro vendedor metasmensais]

#### WF bTvnR — ButtonClicked em El[bt reset nivel metasmensais]
1. **ResetGroup** [bTvnX] alvo El[gp filtro nível metasmensais]

#### WF bTvnc — ButtonClicked em El[Button C]
1. **NewThing** [bTvni] tipo Tbl.MetasMensais · campos: cpo.DataFim = El[dt final metamensal]:get_data; cpo.DataInicio = El[dt inicio metamensal]:get_data; cpo.QualNivel = El[dd nivel metamensal]:get_data; cpo.QualVendedor = El[dd vendedor metamensal]:get_data; cpo.ValorMeta = El[ipt valo metamensal]:get_data
2. **ResetInputs** [bTvnn] 

#### WF bTvnv — ButtonClicked em El[bt reset filter datas metasmensais]
1. **ResetGroup** [bTvoA] alvo El[gp filtro data metasmensais]

#### WF bTrci0 — InputChanged em El[dd filtra filtravendedor]
1. **ChangePage** [bTrco0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTrdS0 — ButtonClicked em El[filtrar cliente]
1. **ChangePage** [bTrdX0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{Ancestor[TableCrossAxis]:cpo.QualCliente:_id}"}}, keep_current_page_params=True

#### WF bTreP0 — ButtonClicked em El[filtrar fornecedor]
1. **ChangePage** [bTreU0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{Ancestor[TableCrossAxis]:cpo.QualFornecedor:_id}"}}, keep_current_page_params=True

#### WF bTreh0 — InputChanged em El[dd filtra cliente]
1. **ChangePage** [bTren0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTres0 — InputChanged em El[dd filtra numnf]
1. **ChangePage** [bTrey0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numnf", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTrfD0 — InputChanged em El[dd filtra num pedido]
1. **ChangePage** [bTrfJ0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTrfL0 — InputChanged em El[dd filtra fornecedor]
1. **ChangePage** [bTrfR0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTrgR0 — ButtonClicked em El[Icon E]
1. **ResetGroup** [bTrgX0] alvo El[gp filter fornecedor]
2. **ChangePage** [bTrgZ0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value=""}}, keep_current_page_params=True

#### WF bTrgr0 — ButtonClicked em El[Icon F]
1. **ResetGroup** [bTrgw0] alvo El[gp filter cliente]
2. **ChangePage** [bTrgx0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value=""}}, keep_current_page_params=True

#### WF bTrhZ0 — ButtonClicked em El[Icon G]
1. **ResetGroup** [bTrhb0] alvo El[gp filter vendedor]
2. **ChangePage** [bTrhf0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value=""}}, keep_current_page_params=True

#### WF bTrhy0 — ButtonClicked em El[Icon H]
1. **ResetGroup** [bTriD0] alvo El[gp filter numnf]
2. **ChangePage** [bTriE0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numnf", value=""}}, keep_current_page_params=True

#### WF bTriX0 — ButtonClicked em El[Icon I]
1. **ResetGroup** [bTric0] alvo El[gp filtra numpedido]
2. **ChangePage** [bTrid0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value=""}}, keep_current_page_params=True

#### WF bTrjF0 — ButtonClicked em El[Icon J]
1. **HideElement** [bTrjL0] alvo El[pop entregas]
2. **ChangePage** [bTrjN0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="popentregas", value="{∅}"}, 1={key="vendedor", value="{∅}"}, 2={key="numnf", value="{∅}"}, 3={key="numpedido", value="{∅}"}, 4={key="cliente", value="{∅}"}, 5={key="fornecedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTrjY0 — ButtonClicked em El[Button A]
1. **HideElement** [bTrjd0] alvo El[pop entregas]
2. **ChangePage** [bTrje0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="popentregas", value="{∅}"}, 1={key="vendedor", value="{∅}"}, 2={key="numnf", value="{∅}"}, 3={key="numpedido", value="{∅}"}, 4={key="cliente", value="{∅}"}, 5={key="fornecedor", value="{∅}"}}, keep_current_page_params=True
