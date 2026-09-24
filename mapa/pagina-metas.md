# Pagina: `metas` (bTvoX)


Resumo: 304 elementos · 33 workflows · 56 ações · 38 condicionais · 0 estados customizados
Elementos por tipo: Text 76, Group 59, TableCell 46, TableMainAxis 23, Icon 21, Input 20, Image 8, Button 6, TableCrossAxis 6, Dropdown 6, CustomElement 4, Popup 4, HTML 4, RepeatingGroup 4, Table 3, chartjs-LineBarChart 3, AutocompleteDropdown 2, DateInput 2, Plugin[1648823245313x509054419018711040]/AAC 2, Plugin[1658181838561x862832580805263400]/AAC 2, Plugin[1691509762858x752107234800435200]/AAC 1, FloatingGroup 1, Plugin[1680110374647x249108010620944400]/AAC 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho A` (bTvtF) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **Popup** `pop entregas` (bTvtb) — props: vertical_centering=True
  - ⟂ quando UrlParam("popentregas" as boolean):is_true → 
  - **Plugin[1691509762858x752107234800435200]/AAC** `ExportTable A` (bUEUb0)
  - **Icon** `Icon J` (bTvwX) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group RZ` (bUFGX)
    - **Button** `Button F` (bUETv) — text: "Exportar para excel" · props: icon="bootstrap filetype-csv", vertical_centering=True, button_type="label_icon"
    - **HTML** `HTML D` (bUFGN) — html(12416 chars) · props: unique_id="rg-relatorio"
  - **Table** `rpg detalha entregas vendedor` (bTvtc) — props: group_type="custom.tbl_entregas", vertical_centering=True, unique_id="grupoentregas"
    - ⟂ quando UrlParam("detalhaentregas" as option.opt_tipometa):equals(Opt.TipoMeta.Regular) → data_source=El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_vendedor_user", value=UrlParam("vendedor" as user), constraint_type="equals"}, 1={key="cpo_numeropedido_text", value="{UrlParam("numpedido" as None)}", constraint_type="equals"}, 2={key="cpo_nftexto_text", value="{UrlParam("numnf" as None)}", constraint_type="equals"}, 3={key="cpo_qualcliente_custom_tbl_clientes", value=UrlParam("cliente" as custom.tbl_clientes), constraint_type="equals"}, 4={key="cpo_qualfornecedor_custom_tbl_clientes", value=UrlParam("fornecedor" as custom.tbl_clientes), constraint_type="equals"}, 5={key="cpo_qualvendedorsubstituto_user", constraint_type="is_empty"}}, descending=False, sort_field="cpo_dataentrega_date", ignore_empty_constraints=True)
    - ⟂ quando UrlParam("detalhaentregas" as option.opt_tipometa):equals(Opt.TipoMeta.Substituição) → data_source=El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_numeropedido_text", value="{UrlParam("numpedido" as None)}", constraint_type="equals"}, 1={key="cpo_nftexto_text", value="{UrlParam("numnf" as None)}", constraint_type="equals"}, 2={key="cpo_qualcliente_custom_tbl_clientes", value=UrlParam("cliente" as custom.tbl_clientes), constraint_type="equals"}, 3={key="cpo_qualfornecedor_custom_tbl_clientes", value=UrlParam("fornecedor" as custom.tbl_clientes), constraint_type="equals"}, 4={key="cpo_qualvendedorsubstituto_user", value=UrlParam("vendedor" as user), constraint_type="equals"}}, descending=False, sort_field="cpo_dataentrega_date", ignore_empty_constraints=True)
    - **TableMainAxis** `TableMainAxis I` (bTvtd) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis I` (bTvth) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis B` (bTvti) — props: axis_index=0, make_sticky=True, button_disabled=False, cross_axis_repeat=False
      - **TableCell** `Cell P` (bTvtj) — props: cell_main_axis_id="bTvtd"
        - **Text** `Text V` (bTvtn) — text: "Qtd"
      - **TableCell** `Cell P` (bTvto) — props: cell_main_axis_id="bTvth"
        - **Group** `gp filter fornecedor` (bTvtp) — props: vertical_centering=True
          - **AutocompleteDropdown** `dd filtra fornecedor` (bTvtt) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor) · placeholder: "Fornecedor" · props: default=UrlParam("fornecedor" as custom.tbl_clientes), vertical_centering=True, choices_style="dynamic", field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon E` (bTvtu) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra fornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell Q` (bTvtv) — props: cell_main_axis_id="bTvwJ"
        - **Group** `gp filter vendedor` (bTvtz) — props: vertical_centering=True
          - **Dropdown** `dd filtra filtravendedor` (bTvuA) — data_source: Search(User: cpo.Ativo equals True) · placeholder: "Vendedor" · props: default=UrlParam("vendedor" as user), vertical_centering=True, dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGn_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon G` (bTvuB) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra filtravendedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell S` (bTvuF) — props: cell_main_axis_id="bTvwK"
        - **Text** `Text G` (bTvuG) — text: "Produto"
      - **TableCell** `Cell U` (bTvuH) — props: cell_main_axis_id="bTvwL"
        - **Text** `Text DZ` (bTvuL) — text: "Valor comissão" · props: font_alignment="right"
        - **Text** `Text OZ` (bTvuM) — text: "Total: {Text("{El[rpg detalha entregas vendedor]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
      - **TableCell** `Cell W` (bTvuN) — props: cell_main_axis_id="bTvwP"
        - **Text** `Text EZ` (bTvuR) — text: "Comissão unit" · props: font_alignment="right"
      - **TableCell** `Cell Y` (bTvuS) — props: cell_main_axis_id="bTvwQ"
        - **Group** `gp filter numnf` (bTvuT) — props: vertical_centering=True
          - **Input** `dd filtra numnf` (bTvuX) — placeholder: "Nf fornecedor" · content: "{∅}" · props: limit_number_of_characters=False, vertical_centering=True, placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon H` (bTvuY) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra numnf]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell AZ` (bTvuZ) — props: cell_main_axis_id="bTvwR", cell_cross_axis_index=0
        - **Text** `Text Y` (bTvud) — text: "Data entrega"
      - **TableCell** `Cell CZ` (bTvue) — props: cell_main_axis_id="bTvwV", cell_cross_axis_index=0
        - **Group** `gp filtra numpedido` (bTvuf) — props: vertical_centering=True
          - **Input** `dd filtra num pedido` (bTvuj) — placeholder: "Num pedido" · props: limit_number_of_characters=False, vertical_centering=True, placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon I` (bTvuk) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra num pedido]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
      - **TableCell** `Cell EZ` (bTvul) — props: cell_main_axis_id="bTvwW", cell_cross_axis_index=0
        - **Group** `gp filter cliente` (bTvup) — props: vertical_centering=True
          - **AutocompleteDropdown** `dd filtra cliente` (bTvuq) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente) · placeholder: "Cliente" · props: default=UrlParam("cliente" as custom.tbl_clientes), vertical_centering=True, choices_style="dynamic", field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGn_default)"
            - ⟂ quando This:is_focused → placeholder_color="var(--color_bTHGl_default)"
          - **Icon** `Icon F` (bTvur) — props: icon="material outlined filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtra cliente]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **TableCrossAxis** `TableCrossAxis B` (bTvuv) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
      - **TableCell** `Cell P` (bTvuw) — props: cell_main_axis_id="bTvtd"
        - **Text** `Text HZ` (bTvux) — text: "{Text("{CellIndex}/{El[rpg detalha entregas vendedor]:get_list_data:count}")}"
      - **TableCell** `Cell P` (bTvvB) — props: cell_main_axis_id="bTvth"
        - **Group** `Group R` (bTvvC) — props: vertical_centering=True
          - **Icon** `filtrar fornecedor` (bTvvD) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
            - ⟂ quando UrlParam("fornecedor" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualFornecedor) → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Text** `Text FZ` (bTvvH) — text: "Grupo: "
          - **Text** `Text FZ` (bTvvI) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}")}"
        - **Group** `Group S` (bTvvJ) — props: vertical_centering=True
          - **Text** `Text IZ` (bTvvN) — text: "Filial: "
          - **Text** `Text IZ` (bTvvO) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_capitalized_words}")}"
      - **TableCell** `Cell R` (bTvvP) — props: cell_main_axis_id="bTvwJ"
        - **Text** `Text JZ` (bTvvT) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}")}"
      - **TableCell** `Cell T` (bTvvU) — props: cell_main_axis_id="bTvwK"
        - **Text** `Text LZ` (bTvvV) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}")}"
      - **TableCell** `Cell V` (bTvvZ) — props: cell_main_axis_id="bTvwL"
        - **Text** `Text KZ` (bTvva) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
      - **TableCell** `Cell X` (bTvvb) — props: cell_main_axis_id="bTvwP"
        - **Text** `Text MZ` (bTvvf) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorComissaoUnitario:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
      - **TableCell** `Cell Z` (bTvvg) — props: cell_main_axis_id="bTvwQ"
        - **Text** `Text NZ` (bTvvh) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}")}"
      - **TableCell** `Cell BZ` (bTvvl) — props: cell_main_axis_id="bTvwR", cell_cross_axis_index=1
        - **Text** `Text GZ` (bTvvm) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
      - **TableCell** `Cell DZ` (bTvvn) — props: cell_main_axis_id="bTvwV", cell_cross_axis_index=1
        - **Text** `Text QZ` (bTvvr) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumeroPedido}")}"
      - **TableCell** `Cell FZ` (bTvvs) — props: cell_main_axis_id="bTvwW", cell_cross_axis_index=1
        - **Group** `Group P` (bTvvt) — props: vertical_centering=True
          - **Icon** `filtrar cliente` (bTvvx) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
            - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Text** `Text W` (bTvvy) — text: "Grupo: "
          - **Text** `Text W` (bTvvz) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}"
        - **Group** `Group Q` (bTvwD) — props: vertical_centering=True
          - **Text** `Text X` (bTvwF) — text: "Filial: "
          - **Text** `Text X` (bTvwE) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_capitalized_words}")}"
    - **TableMainAxis** `Column D` (bTvwJ) — props: axis_index=4
    - **TableMainAxis** `Column E` (bTvwK) — props: axis_index=5
    - **TableMainAxis** `Column F` (bTvwL) — props: axis_index=7
    - **TableMainAxis** `Column G` (bTvwP) — props: axis_index=6
    - **TableMainAxis** `Column H` (bTvwQ) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis O` (bTvwR) — props: axis_index=1
    - **TableMainAxis** `Column H copy` (bTvwV) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis Q` (bTvwW) — props: axis_index=3
  - **Button** `Button A` (bTvwb) — text: "Fechar" · props: icon="material outlined close", button_type="label_icon"
- **Popup** `pop oculto` (bTvtE) — props: vertical_centering=True
- **Popup** `pop.AddEdita MetasMensais` (bTvyI) — props: group_type="user", vertical_centering=True
  - **Group** `Group JZ` (bTwAL) — props: vertical_centering=True
    - **Text** `Text RZZ` (bTwAM) — text: "Metas Mensais" · props: font_alignment="center"
    - **Icon** `Icon R` (bTwAN) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group IZ` (bTvyJ) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Group** `g Form` (bTvyN)
      - **Group** `g Input` (bTvyU)
        - **Text** `Text HZZ` (bTvyV) — text: "Data inicio"
        - **DateInput** `dt inicio metamensal` (bTvyZ) — content: UrlParam("datainicio" as date) · props: mandatory=True, date_format="custom", custom_format="dd/mmm/yy"
      - **Group** `g Input` (bTvyO)
        - **Text** `Text HZZ` (bTvyP) — text: "Data fim"
        - **DateInput** `dt final metamensal` (bTvyT) — content: UrlParam("datafim" as date) · props: mandatory=True, date_format="custom", custom_format="dd/mmm/yy"
      - **Group** `g Input` (bTvya)
        - **Text** `Text HZZ` (bTvyb) — text: "Vendedor"
        - **Group** `Group M` (bTzVx) — props: vertical_centering=True
          - **Dropdown** `dd vendedor metamensal` (bTvyf) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualDepto not equal Opt.DeptoUsuario.Operação AND cpo.QualDepto not equal Opt.DeptoUsuario.Financeiro; sort cpo.NomeModelo) · placeholder: "Selecione" · props: mandatory=True, dynamic_type="user", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
          - **Icon** `Icon B` (bTzVr) — props: icon="phosphor fill users-three", vertical_centering=True
      - **Group** `g Input` (bTvyg)
        - **Text** `Text HZZ` (bTvyh) — text: "Nível"
        - **Group** `Group N` (bTzWx) — props: vertical_centering=True
          - **Dropdown** `dd nivel metamensal` (bTvyl) — data_source: Search(Tbl.NiveisVendedores; sort cpo.Ordem) · placeholder: "Selecione" · props: mandatory=True, default=El[dd vendedor metamensal]:get_data:cpo.QualNivelVendedor, dynamic_type="custom.tbl_niveisvendedores", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeNivel:to_uppercase}"
          - **Icon** `Icon L` (bTzWn) — props: icon="ionic filled podium", vertical_centering=True
      - **Group** `g Input copy 4` (bTzUz)
        - **Text** `Text U` (bTzVB) — text: "Tipo de meta"
        - **Dropdown** `dd tipometa` (bTzVF) — data_source: All(Opt.TipoMeta) · placeholder: "Selecione" · props: mandatory=True, dynamic_type="option.opt_tipometa", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
      - **Group** `g Input` (bTvym)
        - **Text** `Text HZZ` (bTvyn) — text: "Valor"
        - **Input** `ipt valo metamensal` (bTvyr) — placeholder: "R$ 0,00" · content: El[dd nivel metamensal]:get_data:cpo.MetaVenda · content_format: "currency" · props: mandatory=True, currency_symbol="R$ ", always_show_decimals=True
      - **Button** `Button C` (bTvys) — text: "Gravar" · props: font_alignment="center", vertical_centering=True, font_family="var(--font_default)"
        - ⟂ quando This:is_hovered:or_(This:is_pressed) → border_color="#9DA9E8", background_style="bgcolor", bgcolor="rgba(0, 149, 232, 1)"
        - ⟂ quando This:isnt_clickable → border_color="#6C7FEB", bgcolor="rgba(134, 193, 255, 1)"
    - **Table** `rpg metas mensais` (bTvyt) — data_source: Search(Tbl.MetasMensais: cpo.DataInicio gte El[dd filtro data metasmensais]:get_AAF:min AND cpo.DataFim lte El[dd filtro data metasmensais]:get_AAF:max AND cpo.QualVendedor equals El[dd filtro vendedor metasmensais]:get_data AND cpo.QualNivel equals El[dd filtro nível metasmensais]:get_data; sort cpo.DataInicio, ignore empty) · props: group_type="custom.tbl_metasmensais", vertical_centering=True
      - **TableMainAxis** `TableMainAxis T` (bTvyx) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis T` (bTvyy) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis T` (bTvyz) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis D` (bTvzD) — props: axis_index=0, cross_axis_repeat=False
        - **TableCell** `Cell JZ` (bTvzE) — props: cell_main_axis_id="bTvyx"
          - **Group** `gp filtro data metasmensais` (bTvzF) — props: vertical_centering=True
            - **Plugin[1648823245313x509054419018711040]/AAC** `dd filtro data metasmensais` (bTvzJ) — props: AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="en-US", AAH="DD/MMM/YYYY", AAR=False, AAS=False, AAf="dd/mm/yy-dd/mm/yy"
            - **Icon** `bt reset filter datas metasmensais` (bTvzK) — props: icon="material outlined filter_alt_off", vertical_centering=True
        - **TableCell** `Cell JZ` (bTvzL) — props: cell_main_axis_id="bTvyy"
          - **Group** `gp filtro vendedor metasmensais` (bTvzP) — props: vertical_centering=True
            - **Dropdown** `dd filtro vendedor metasmensais` (bTvzR) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualDepto not equal Opt.DeptoUsuario.Operação AND cpo.QualDepto not equal Opt.DeptoUsuario.Financeiro; sort cpo.NomeModelo) · placeholder: "Vendedor" · props: mandatory=True, vertical_centering=True, dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
            - **Icon** `bt reset filter vendedor metasmensais` (bTvzQ) — props: icon="material outlined filter_alt_off", vertical_centering=True
              - ⟂ quando El[dd filtro vendedor metasmensais]:get_data:is_not_empty → icon_color="var(--color_primary_default)"
        - **TableCell** `Cell JZ` (bTvzV) — props: cell_main_axis_id="bTvyz"
          - **Group** `gp filtro nível metasmensais` (bTvzW) — props: vertical_centering=True
            - **Dropdown** `dd filtro nível metasmensais` (bTvzb) — data_source: Search(Tbl.NiveisVendedores; sort cpo.Ordem) · placeholder: "Nível" · props: mandatory=True, vertical_centering=True, dynamic_type="custom.tbl_niveisvendedores", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:cpo.NomeNivel:to_uppercase}"
            - **Icon** `bt reset nivel metasmensais` (bTvzX) — props: icon="material outlined filter_alt_off", vertical_centering=True
              - ⟂ quando El[dd filtro nível metasmensais]:get_data:is_not_empty → icon_color="var(--color_primary_default)"
        - **TableCell** `Cell KZ` (bTvzc) — props: cell_main_axis_id="bTwAG"
          - **Text** `Text LZZ` (bTvzd) — text: "{Text("{El[rpg metas mensais]:get_list_data:cpo.ValorMeta:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
        - **TableCell** `Cell OZ` (bTvzh) — props: cell_main_axis_id="bTwAH"
      - **TableCrossAxis** `TableCrossAxis D` (bTvzi) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
        - **TableCell** `Cell JZ` (bTvzj) — props: cell_main_axis_id="bTvyx"
          - **Text** `Text MZZ` (bTvzn) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataInicio:format_date(formatting_type="custom", custom_format="dd/mmm/yy")}")}"
          - **Text** `Text NZZ` (bTvzo) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataFim:format_date(formatting_type="custom", custom_format="dd/mmm/yy")}")}"
        - **TableCell** `Cell JZ` (bTvzp) — props: cell_main_axis_id="bTvyy"
          - **Text** `Text OZZ` (bTvzt) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}")}"
          - **Text** `Text IZZ` (bTzVH) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.TipoMeta:display:to_uppercase}")}"
        - **TableCell** `Cell JZ` (bTvzu) — props: cell_main_axis_id="bTvyz"
          - **Text** `Text PZZ` (bTvzv) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.NomeNivel:to_uppercase}")}"
        - **TableCell** `Cell LZ` (bTvzz) — props: cell_main_axis_id="bTwAG"
          - **Text** `Text QZZ` (bTwAA) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorMeta:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
        - **TableCell** `Cell QZ` (bTwAB) — props: cell_main_axis_id="bTwAH"
          - **Icon** `Icon Q` (bTwAF) — props: icon="material regular delete", vertical_centering=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualMetaFechada:is_not_empty → icon="material outlined task_alt", icon_color="var(--color_success_default)", button_disabled=True, title_attribute="{∅}Essa meta já foi fechada"
      - **TableMainAxis** `Column D` (bTwAG) — props: axis_index=3
      - **TableMainAxis** `Column F` (bTwAH) — props: axis_index=5
- **Popup** `pop apaga meta fechada` (bTzix) — props: group_type="custom.tbl_metasmensais", vertical_centering=True
  - **Group** `Group OZ` (bTzkB) — props: vertical_centering=True
    - **Icon** `Icon P` (bTzjD) — props: icon="material rounded warning", vertical_centering=True
    - **Text** `Text UZ` (bTzjJ) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text VZ` (bTzjP) — text: "Você está apagando as metas fechadas desse vendedor." · props: font_alignment="center"
  - **Text** `Text WZ` (bTzjV) — text: "Essa ação não pode ser revertida!⏎" · props: font_alignment="center"
  - **Text** `Text XZ` (bTzjb) — text: "Deseja continuar?" · props: font_alignment="center"
  - **Group** `Group GZ` (bTzjt) — props: vertical_centering=True
    - **Button** `Button D` (bTzjh) — text: "SIM" · props: icon="material outlined star_border", vertical_centering=True
    - **Button** `Button E` (bTzjn) — text: "NÃO" · props: icon="material outlined star_border", vertical_centering=True
- **CustomElement** `pop.ConfigSistema A` (bTzWh) — USA Reusable pop.ConfigSistema · props: floating_reference="top", custom_id="bToDT0", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `tool.MenuPaginas A` (bTvtJ) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
- **CustomElement** `pop.CadastroUsuarios A` (bTzWO) — USA Reusable pop.CadastroUsuarios · props: floating_reference="top", custom_id="bTgiN", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **FloatingGroup** `FloatingGroup A` (bTvtK)
  - **Plugin[1648823245313x509054419018711040]/AAC** `RangePicker A` (bTvtL) — props: padding_vertical=12, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAK=True, AAM=2, AAN=2, AAS=False, AAf="{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {UrlParam("datafim" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
  - **RepeatingGroup** `rpg entregas gerais` (bTvtP) — data_source: Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Financeiro AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date)) · props: group_type="custom.tbl_entregas", separator_style="none"
  - **Group** `Group O` (bTvtQ) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text S` (bTvtR) — text: "Entregas"
    - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTvtV) — props: AAG="var(--color_primary_default)", AAH="var(--color_primary_default)"
    - **Text** `Text T` (bTvtW) — text: "Comissões"
  - **Button** `Button B` (bTvtX) — text: "Criar Metas" · props: icon="phosphor outlined trophy", vertical_centering=True, button_type="label_icon", button_horiz_alignment="space-between"
- **Group** `Group Dashboard` (bTvtD) — props: name="Group Dashboard"
  - **Group** `Group F` (bTvsf) — props: vertical_centering=True
    - **Group** `Group E` (bTvrM) — props: vertical_centering=True
      - **Group** `Group G` (bTvrN) — props: vertical_centering=True
        - **Group** `Group J` (bTvrS) — data_source: El[rpg ranking vendedores]:get_list_data:specific_item(2) · props: group_type="custom.tbl_metasmensais", vertical_centering=True, nonant_alignment="bb"
          - **Image** `Image E` (bTvrd) — props: stretch_or_rescale="zoom", src="{Parent:cpo.QualVendedor:cpo.Foto}"
          - **Group** `Group J` (bTvrT) — data_source: Parent · props: group_type="custom.tbl_metasmensais", vertical_centering=True
            - **Text** `Text N` (bTvrX) — text: "{Text("{Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase} {Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):last_element:to_uppercase}")}" · props: font_alignment="center"
            - **Text** `Text N` (bTvrY) — text: "{Text("{Parent:cpo.QualNivel:cpo.NomeNivel}")}" · props: font_alignment="center"
            - **Text** `Text N` (bTvrZ) — text: "{Text("{Parent:cpo.RankingVendas:format_number(formatting_type="percentage", decimal_place=1, decimal_separator="comma")}")}" · props: font_alignment="center"
        - **Image** `Image B` (bTvrR) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1745969927438x134316970951988690/prata.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=967, aspect_ratio_height=1582
      - **Group** `Group H` (bTvre) — props: vertical_centering=True
        - **Group** `Group K` (bTzYH0) — data_source: El[rpg ranking vendedores]:get_list_data:specific_item(1) · props: group_type="custom.tbl_metasmensais", vertical_centering=True, nonant_alignment="bb"
          - **Image** `Image F` (bTzYT0) — props: stretch_or_rescale="zoom", src="{Parent:cpo.QualVendedor:cpo.Foto}"
          - **Group** `Group K` (bTzYM0) — data_source: Parent · props: group_type="custom.tbl_metasmensais", vertical_centering=True
            - **Text** `Text F` (bTzYN0) — text: "{Text("{Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase} {Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):last_element:to_uppercase}")}" · props: font_alignment="center"
            - **Text** `Text F` (bTzYR0) — text: "{Text("{Parent:cpo.QualNivel:cpo.NomeNivel}")}" · props: font_alignment="center"
            - **Text** `Text F` (bTzYS0) — text: "{Text("{Parent:cpo.RankingVendas:format_number(formatting_type="percentage", decimal_place=1, decimal_separator="comma")}")}" · props: font_alignment="center"
        - **Image** `Image C` (bTvrf) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1745968558317x753392388689268900/ouro.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=80, aspect_ratio_height=127
      - **Group** `Group I` (bTvrv) — props: vertical_centering=True
        - **Group** `Group L` (bTzYY0) — data_source: El[rpg ranking vendedores]:get_list_data:specific_item(3) · props: group_type="custom.tbl_metasmensais", vertical_centering=True, nonant_alignment="bb"
          - **Image** `Image G` (bTzYk0) — props: stretch_or_rescale="zoom", src="{Parent:cpo.QualVendedor:cpo.Foto}"
          - **Group** `Group L` (bTzYd0) — data_source: Parent · props: group_type="custom.tbl_metasmensais", vertical_centering=True
            - **Text** `Text O` (bTzYe0) — text: "{Text("{Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase} {Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):last_element:to_uppercase}")}" · props: font_alignment="center"
            - **Text** `Text O` (bTzYf0) — text: "{Text("{Parent:cpo.QualNivel:cpo.NomeNivel}")}" · props: font_alignment="center"
            - **Text** `Text O` (bTzYj0) — text: "{Text("{Parent:cpo.RankingVendas:format_number(formatting_type="percentage", decimal_place=1, decimal_separator="comma")}")}" · props: font_alignment="center"
        - **Image** `Image D` (bTvrw) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1745968566904x224722329074366500/bronze.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=969, aspect_ratio_height=1582
    - **Group** `Group Statistics` (bTvsJ) — props: name="Group Statistics", lock_in_editor=False
      - **Icon** `Icon K` (bTvsb) — props: icon="feather refresh-ccw", vertical_centering=True
      - **Group** `Group Z` (bTzfg) — props: vertical_centering=True
        - **Icon** `Icon M` (bTzfz) — props: icon="material filled diversity_1", vertical_centering=True
        - **Group** `Group Z` (bTzfm) — props: vertical_centering=True
          - **Group** `Group BZ` (bTzhT0) — props: vertical_centering=True
            - **Text** `Text RZ` (bTzhN0) — text: "Meta: "
            - **Input** `ipt meta coletiva` (bTzgt0) — placeholder: "" · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
              - ⟂ quando El[ipt venda menos1]:get_data:plus(El[ipt venda menos2]:get_data):plus(El[ipt venda menos3]:get_data):divide(3):times(1.25):less_than(80000) → content=80000
              - ⟂ quando El[ipt venda menos1]:get_data:plus(El[ipt venda menos2]:get_data):plus(El[ipt venda menos3]:get_data):divide(3):times(1.25):greater_than(80000) → content=El[ipt venda menos1]:get_data:plus(El[ipt venda menos2]:get_data):plus(El[ipt venda menos3]:get_data):divide(3):times(1.25)
          - **Group** `Group CZ` (bTzhk0) — props: vertical_centering=True
            - **Text** `Text SZ` (bTzhe0) — text: "Faturado: "
            - **Input** `ipt faturado coletivo` (bTzhB0) — placeholder: "" · content: El[rpg entregas gerais]:get_list_data:filtered:cpo.valorcomissao:sum · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Group** `Group QZ` (bUFBD) — props: vertical_centering=True
            - **Text** `Text PZ` (bUFBJ) — text: "Meta Diária:"
            - **HTML** `HTML B` (bUFBU) — html(23501 chars)
        - **Plugin[1658181838561x862832580805263400]/AAC** `Progress-Bar B` (bTzhH0) — props: AAF=El[ipt faturado coletivo]:get_data:times(100):divide(El[ipt meta coletiva]:get_data):floor, AAH="horizontal", AAL=10, AAM="var(--color_bTHHJ_default)", AAN=10, AAO="var(--color_bTHGy_default)", AAP="var(--color_bTHHJ_default)", AAQ=20, AAR="300", AAS="custom", AAT=100, AAX=0, AAY="linear", AAa="var(--color_bTHGh_default)", AAd=55
        - **Group** `Group Y` (bTzeq) — props: vertical_centering=True
          - **Input** `ipt mes menos1` (bTzdc0) — placeholder: "" · content: "{UrlParam("datainicio" as date):plus_months(-1):format_date(formatting_type="custom", custom_format="mmmm")}" · content_format: "text" · props: font_alignment="right", vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Input** `ipt mes menos2` (bTzdi0) — placeholder: "" · content: "{UrlParam("datainicio" as date):plus_months(-2):format_date(formatting_type="custom", custom_format="mmmm")}" · content_format: "text" · props: font_alignment="right", vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Input** `ipt mes menos3` (bTzdo0) — placeholder: "" · content: "{UrlParam("datainicio" as date):plus_months(-3):format_date(formatting_type="custom", custom_format="mmmm")}" · content_format: "text" · props: font_alignment="right", vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
        - **Group** `Group AZ` (bTzgJ) — props: vertical_centering=True
          - **Input** `ipt venda menos1` (bTzgL) — placeholder: "" · content: Search(Tbl.MetasFechadas: cpo.DataInicio gte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-1) AND cpo.DataFim lte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_seconds(-1); sort cpo.DataInicio desc):cpo.TotalComissaoMegabox:sum · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Input** `ipt venda menos2` (bTzgP) — placeholder: "" · content: Search(Tbl.MetasFechadas: cpo.DataInicio gte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-2) AND cpo.DataFim lte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-1):plus_seconds(-1); sort cpo.DataInicio desc):cpo.TotalComissaoMegabox:sum · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Input** `ipt venda menos3` (bTzgQ) — placeholder: "" · content: Search(Tbl.MetasFechadas: cpo.DataInicio gte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-3) AND cpo.DataFim lte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-2):plus_seconds(-1); sort cpo.DataInicio desc):cpo.TotalComissaoMegabox:sum · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Input** `ipt venda menos1 copy ` (bUCVp) — oculto ao carregar · placeholder: "" · content: Search(Tbl.MetasFechadas: cpo.DataInicio gte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-1) AND cpo.DataFim lte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_seconds(-1); sort cpo.DataInicio desc):cpo.TotalComissaoMegabox:sum · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Input** `ipt venda menos2 copy` (bUCVv) — oculto ao carregar · placeholder: "" · content: Search(Tbl.MetasFechadas: cpo.DataInicio gte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-2) AND cpo.DataFim lte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-1):plus_seconds(-1); sort cpo.DataInicio desc):cpo.TotalComissaoMegabox:sum · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
          - **Input** `ipt venda menos3 copy` (bUCWB) — oculto ao carregar · placeholder: "" · content: Search(Tbl.MetasFechadas: cpo.DataInicio gte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-3) AND cpo.DataFim lte UrlParam("datainicio" as date):rounded_down(component_to_extract="month"):plus_months(-2):plus_seconds(-1); sort cpo.DataInicio desc):cpo.TotalComissaoMegabox:sum · content_format: "currency" · props: vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, currency_symbol="R$ ", always_show_decimals=True
      - **RepeatingGroup** `rpg ranking vendedores` (bTvsN) — data_source: Search(Tbl.MetasMensais: cpo.DataFim lte UrlParam("datafim" as date) AND cpo.DataInicio gte UrlParam("datainicio" as date); sort cpo.RankingVendas desc) · props: group_type="custom.tbl_metasmensais", separator_style="none", unique_id="rankingmeta", fixed_rows=False, fixed_columns=False, show_all_items=True, cell_min_width_css="250px"
        - **Group** `Group C` (bTvsO) — data_source: Parent · props: group_type="custom.tbl_metasmensais", vertical_centering=True
          - **Text** `Text R` (bTvsa) — text: "{CellIndex}º"
          - **Image** `Image H` (bTvsP) — props: stretch_or_rescale="zoom", src="{Parent:cpo.QualVendedor:cpo.Foto}"
          - **Group** `Group D` (bTvsT) — data_source: Parent · props: group_type="custom.tbl_metasmensais", vertical_centering=True
            - **Text** `Text K` (bTvsU) — text: "{Text("{Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase} {Parent:cpo.QualVendedor:cpo.NomeModelo:split_by(separator=" "):last_element:to_uppercase}")}"
            - **Text** `Text P` (bTzdJ0) — text: "{Text("{Parent:cpo.TipoMeta:display}")}" · props: font_alignment="center", unique_id="percentmeta"
            - **Text** `Text TZ` (bTvsZ) — text: "{Text("{Parent:cpo.RankingVendas:format_number(formatting_type="percentage", decimal_place=1, decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="center", unique_id="percentmeta"
  - **Group** `gp painel metas` (bTvrL) — props: name="Group Table"
    - **Table** `rpg metas` (bTvrH) — data_source: Search(Tbl.MetasMensais: cpo.DataFim lte UrlParam("datafim" as date) AND cpo.DataInicio gte UrlParam("datainicio" as date); sort cpo.DataInicio) · props: group_type="custom.tbl_metasmensais", vertical_centering=True
      - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(3) → data_source=Search(Tbl.MetasMensais: cpo.DataFim lte UrlParam("datafim" as date) AND cpo.DataInicio gte UrlParam("datainicio" as date); sort cpo.DataInicio)
      - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(3) → data_source=Search(Tbl.MetasMensais: cpo.DataFim lte UrlParam("datafim" as date) AND cpo.DataInicio gte UrlParam("datainicio" as date) AND cpo.QualVendedor equals CurrentUser; sort cpo.DataInicio)
      - **TableMainAxis** `TableMainAxis A` (bTvoY) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis A` (bTvoZ) — props: axis_index=8
      - **TableCrossAxis** `TableCrossAxis A` (bTvod) — props: axis_index=0
        - **TableCell** `Cell A` (bTvoe) — props: cell_main_axis_id="bTvoY"
          - **Text** `Text A` (bTvof) — text: "Vendedor"
        - **TableCell** `Cell A` (bTvoj) — props: cell_main_axis_id="bTvoZ"
          - **Text** `Text H` (bTvok) — text: "Status nível" · props: font_alignment="right"
        - **TableCell** `Cell B` (bTvol) — props: cell_main_axis_id="bTvqt"
          - **Text** `Text B` (bTvop) — text: "Meta" · props: font_alignment="right"
        - **TableCell** `Cell D` (bTvoq) — props: cell_main_axis_id="bTvqu"
          - **Text** `Text C` (bTvor) — text: "Valor faturado" · props: font_alignment="right"
        - **TableCell** `Cell F` (bTvov) — props: cell_main_axis_id="bTvqv"
          - **Text** `Text D` (bTvow) — text: "% da meta" · props: font_alignment="right"
        - **TableCell** `Cell H` (bTvox) — props: cell_main_axis_id="bTvqz"
          - **Text** `Text E` (bTvpB) — text: "Comissão de vendas" · props: font_alignment="right"
        - **TableCell** `Cell J` (bTvpH) — props: cell_main_axis_id="bTvrB"
          - **Text** `Text M` (bTvpI) — text: "Fechar" · props: font_alignment="right"
        - **TableCell** `Cell N` (bTvpJ) — props: cell_main_axis_id="bTvrF"
          - **Text** `Text Z` (bTvpN) — text: "Qtd meses p/ subir nível" · props: font_alignment="right"
      - **TableCrossAxis** `TableCrossAxis A` (bTvpT) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell A` (bTvpU) — props: cell_main_axis_id="bTvoY"
          - **Image** `Image A` (bTvpV) — props: stretch_or_rescale="zoom", src="{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.Foto}"
          - **Group** `Group A` (bTvpZ) — props: vertical_centering=True
            - **Text** `Text I` (bTvpa) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}")}"
            - **Text** `Text J` (bTvpb) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.NomeNivel:to_capitalized_words}")}"
        - **TableCell** `Cell A` (bTvpf) — props: cell_main_axis_id="bTvoZ"
          - **Text** `Text L` (bTvpg) — text: "Manter Nível"
            - ⟂ quando El[Ipt media]:get_data:greater_than(Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.MetaVenda):and_(El[rpg metasfechadas]:get_list_data:count:equals(Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.QtdMetaBatida)) → text="Subir Nível", border_color="var(--color_bTHHX_default)", font_color="var(--color_bTHHX_default)", bgcolor="var(--color_bTHHW_default)"
        - **TableCell** `Cell C` (bTvph) — props: cell_main_axis_id="bTvqt"
          - **Input** `Ipt meta` (bTvpl) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.ValorMeta · content_format: "currency" · props: font_alignment="left", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **Text** `Text JZZ` (bTzVN) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.TipoMeta:display:to_uppercase}")}"
        - **TableCell** `Cell E` (bTvpm) — props: cell_main_axis_id="bTvqu"
          - **Input** `Ipt valor faturado` (bTvpn) — placeholder: "" · content_format: "currency" · props: font_alignment="center", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.TipoMeta:equals(Opt.TipoMeta.Regular) → content=El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_vendedor_user", value=Ancestor[TableCrossAxis]:cpo.QualVendedor, constraint_type="equals"}, 1={key="cpo_qualvendedorsubstituto_user", constraint_type="is_empty"}}):cpo.valorcomissao:sum
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.TipoMeta:equals(Opt.TipoMeta.Substituição) → content=El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_qualvendedorsubstituto_user", value=Ancestor[TableCrossAxis]:cpo.QualVendedor, constraint_type="equals"}}):cpo.valorcomissao:sum
          - **Icon** `btn ver entregas` (bTziB) — props: icon="material outlined open_in_new", vertical_centering=True
        - **TableCell** `Cell G` (bTvps) — props: cell_main_axis_id="bTvqv"
          - **Plugin[1658181838561x862832580805263400]/AAC** `Progress-Bar A` (bTvpx) — props: AAF=El[Ipt valor faturado]:get_data:times(100):divide(El[Ipt meta]:get_data):floor, AAH="horizontal", AAL=10, AAM="var(--color_bTHHJ_default)", AAN=10, AAO="var(--color_bTHGy_default)", AAP="var(--color_bTHHJ_default)", AAQ=20, AAR="300", AAS="custom", AAT=100, AAX=0, AAY="linear", AAa="var(--color_bTHGh_default)", AAd=55
            - ⟂ quando El[Ipt % da meta A]:get_data:greater_or_equal_than(0.5):and_(El[Ipt % da meta A]:get_data:less_than(1)) → AAM="var(--color_primary_default)", AAP="var(--color_bTHGs_default)"
            - ⟂ quando El[Ipt % da meta A]:get_data:greater_or_equal_than(1) → AAM="var(--color_bTHHX_default)", AAP="var(--color_bTHHX_default)"
          - **Input** `Ipt % da meta A` (bTvpt) — oculto ao carregar · placeholder: "" · content: El[Ipt valor faturado]:get_data:divide(El[Ipt meta]:get_data) · content_format: "float_number" · props: font_alignment="center", vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
        - **TableCell** `Cell I` (bTvpz) — props: cell_main_axis_id="bTvqz"
          - **Input** `Ipt valor comissao` (bTvqD) — placeholder: "R$ 0,00" · content_format: "currency" · props: font_alignment="center", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - ⟂ quando El[Ipt % da meta A]:get_data:greater_or_equal_than(1) → content=El[Ipt valor faturado]:get_data:times(Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.ComissaoMetaBatida)
            - ⟂ quando El[Ipt % da meta A]:get_data:less_than(1) → content=El[Ipt valor faturado]:get_data:times(Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.ComissaoPadrao)
          - **Group** `Group FZ` (bTvqE) — props: vertical_centering=True
            - **Input** `Ipt fator comissao` (bTzVX) — oculto ao carregar · placeholder: "" · content_format: "float_number" · props: font_alignment="center", vertical_centering=True, disabled=True, decimal_place=2, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
              - ⟂ quando El[Ipt % da meta A]:get_data:greater_or_equal_than(1) → content=Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.ComissaoMetaBatida
              - ⟂ quando El[Ipt % da meta A]:get_data:less_than(1) → content=Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.ComissaoMetaBatida
        - **TableCell** `Cell M` (bTvqQ) — props: cell_main_axis_id="bTvrB"
          - **RepeatingGroup** `rpg entregas vendedor` (bTvqV) — oculto ao carregar · data_source: El[rpg entregas gerais]:get_list_data:filtered(constraints={0={key="cpo_vendedor_user", value=Ancestor[TableCrossAxis]:cpo.QualVendedor, constraint_type="equals"}}) · props: group_type="custom.tbl_entregas", separator_style="none"
          - **Icon** `btn fechar meta` (bTvqR) — props: icon="material outlined add_task", vertical_centering=True, button_disabled=True
            - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(1):or_(CurrentUser:cpo.NomeModelo:equals("gabriella mesquita de sousa")):or_(CurrentUser:cpo.NomeModelo:equals("danielle cristine silva reis")) → icon_color="var(--color_primary_default)", button_disabled=False
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualMetaFechada:is_not_empty → icon="material outlined task_alt", icon_color="var(--color_bTHHX_default)", button_disabled=True
          - **Icon** `btn cancela fechamento meta` (bTzir) — oculto ao carregar · props: icon="material outlined restore", vertical_centering=True, button_disabled=False
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualMetaFechada:is_not_empty:and_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor)) → icon_color="var(--color_bTHHQ_default)", is_visible=True
        - **TableCell** `Cell O` (bTvqW) — props: cell_main_axis_id="bTvrF"
          - **RepeatingGroup** `rpg metasfechadas` (bTvqX) — data_source: Search(Tbl.MetasFechadas: cpo.QualVendedor equals Ancestor[TableCrossAxis]:cpo.QualVendedor; sort cpo.DataInicio desc):limit_to(Ancestor[TableCrossAxis]:cpo.QualNivel:cpo.QtdMetaBatida) · props: group_type="custom.tbl_orcfornecedorescotacao", separator_style="none", unique_id="esconde", fixed_rows=False, cell_min_height_css="18px"
            - **Text** `Text AZ` (bTvqb) — text: "{Text("{Parent:cpo.MesNome}")}"
            - **Text** `Text BZ` (bTvqc) — text: "{Text("{Parent:cpo.TotalComissaoMegabox:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
          - **Group** `Group U` (bTvqd) — props: vertical_centering=True
            - **Text** `Text CZ` (bTvqi) — text: "Média"
            - **Input** `Ipt media` (bTvqh) — placeholder: "" · content: El[rpg metasfechadas]:get_list_data:cpo.TotalComissaoMegabox:average · content_format: "currency" · props: font_alignment="right", vertical_centering=True, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
      - **TableMainAxis** `Column B` (bTvqt) — props: axis_index=1
      - **TableMainAxis** `Column C` (bTvqu) — props: axis_index=3
      - **TableMainAxis** `Column D` (bTvqv) — props: axis_index=4
      - **TableMainAxis** `Column E` (bTvqz) — props: axis_index=5
      - **TableMainAxis** `TableMainAxis G` (bTvrB) — props: axis_index=9
      - **TableMainAxis** `TableMainAxis H` (bTvrF) — props: axis_index=7
  - **Group** `Group Graphs` (bTvsg) — data_source: CurrentUser · props: group_type="user", name="Group Graphs"
    - **Group** `Group Graphs` (bTvsh) — props: name="Group Graphs"
      - **Group** `Group PZ` (bUEzd) — oculto ao carregar
        - **Group** `Group Graph_2` (bTvsx) — props: name="Group Graph_2"
          - **Text** `Text Q` (bTvsz) — text: "Entregas realizadas (por data de entrega)" · props: name="Text Q", font_family="var(--font_bTnzZ0_default_default)"
          - **chartjs-LineBarChart** `Line/BarChart B` (bTvsy) — data_source: El[rpg entregas gerais]:get_list_data:group_by(groupings={0={fn="exact", end=UrlParam("datafim" as date):change_hours(23):change_minutes(59):change_seconds(59), start=UrlParam("datainicio" as date):change_hours(0):change_minutes(0):change_seconds(0), message="cpo_vendedor_user", interval=1, information=∅, filling_gaps=True}}, aggregations={0={fn="count", message="cpo_valorcomissao_number"}}) · props: formatting_type="number", name="Line/BarChart A", chart_type="Bar", decimal_place=0, series1_color="var(--color_bTHHE_default)", currency_symbol="R$ ", data_points_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbFZlbmRlZG9yIiwidXNlciJdLCJhZ2cwIjpbImNvdW50IiwibnVtYmVyIl19fQ==", label_expression="{Text("{InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):first_element} {InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):last_element:truncated(1)}")} ({InjectedValue:agg0})", decimal_separator="comma", series1_fillColor="var(--color_bTHGy_default)", customize_tooltips=True, scaleShowGridLines=True, thousand_separator="dot", y_value_expression=InjectedValue:agg0
        - **Group** `Group DZ` (bTvsl) — props: name="Group Graph_2"
          - **Text** `Text EZZ` (bTvsn) — text: "Entregas em andamento (por data prevista de entrega)" · props: name="Text Q", font_family="var(--font_bTnzZ0_default_default)"
          - **chartjs-LineBarChart** `Line/BarChart A` (bTvsm) — data_source: Search(Tbl.Entregas: cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date) AND cpo.StatusEntrega not equal Opt.Etapas.Cancelado AND cpo.StatusEntrega not equal Opt.Etapas.Financeiro):group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_vendedor_user", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="count", message=∅}, 1={fn="sum", message="cpo_valorcomissao_number"}}) · props: formatting_type="number", name="Line/BarChart A", chart_type="Bar", decimal_place=0, series1_color="var(--color_bTHHE_default)", currency_symbol="R$ ", data_points_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbFZlbmRlZG9yIiwidXNlciJdLCJhZ2cwIjpbImNvdW50IiwibnVtYmVyIl0sImFnZzEiOlsic3VtIG9mIGNwby5WYWxvckNvbWlzc2FvQnJ1dG8iLCJudW1iZXIiXX19", label_expression="{Text("{InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):first_element} {InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):last_element:truncated(1)}")} ({InjectedValue:agg0})", decimal_separator="comma", series1_fillColor="var(--color_bTHGy_default)", customize_tooltips=True, scaleShowGridLines=True, thousand_separator="dot", y_value_expression=InjectedValue:agg0
        - **Group** `Group EZ` (bTvsr) — props: name="Group Graph_2"
          - **Text** `Text FZZ` (bTvst) — text: " Entregas canceladas (por data prevista de entrega)" · props: name="Text Q", font_family="var(--font_bTnzZ0_default_default)"
          - **chartjs-LineBarChart** `Line/BarChart C` (bTvss) — data_source: Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Cancelado AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date)):group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_vendedor_user", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="count", message=∅}}) · props: formatting_type="number", name="Line/BarChart A", chart_type="Bar", decimal_place=0, series1_color="var(--color_bTHHE_default)", currency_symbol="R$ ", data_points_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbFZlbmRlZG9yIiwidXNlciJdLCJhZ2cwIjpbImNvdW50IiwibnVtYmVyIl19fQ==", label_expression="{Text("{InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):first_element} {InjectedValue:grouping0:cpo.NomeModelo:to_uppercase:split_by(separator=" "):last_element:truncated(1)}")} ({InjectedValue:agg0})", decimal_separator="comma", series1_fillColor="var(--color_bTHGy_default)", customize_tooltips=True, scaleShowGridLines=True, thousand_separator="dot", y_value_expression=InjectedValue:agg0
    - **HTML** `HTML A` (bUEzP) — html(30430 chars)
  - **HTML** `HTML C` (bUFCJ) — oculto ao carregar · html(90181 chars)
    - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(1) → is_visible=True

## Workflows

#### WF bTwAR — PageLoaded
1. **Plugin[1558770956236x539499438875082750]/AAC** [bTwAS] 
2. **ShowElement** [bTwAT] alvo El[pop entregas] · SÓ SE UrlParam("detalhaentregas" as option.opt_tipometa):is_not_empty
3. **ChangePage** [bTzeX] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min:change_hours(0):change_minutes(0):change_seconds(0)}"}}, keep_current_page_params=True
4. **ChangePage** [bTzeZ] alvo El[Current page] · SÓ SE UrlParam("datafim" as date):is_empty · add_parameters=True, url_parameters={0={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
5. **TriggerCustomEvent** [bUAhU] custom_event="bTwAv"

#### WF bTwAd — Plugin[1648823245313x509054419018711040]/AAd em El[RangePicker A]
1. **MakeChangeCurrentUser** [bTwAe] campos: cpo.UltimoDateRange = This:get_AAF:min:to_range(This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59))
2. **ChangePage** [bTwAf] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min:change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTwAj — ButtonClicked em El[btn fechar meta]
1. **NewThing** [bTwAk] tipo Tbl.MetasFechadas · campos: cpo.DataFim = UrlParam("datafim" as date); cpo.DataInicio = UrlParam("datainicio" as date); cpo.QuaisContasReceber = El[rpg entregas vendedor]:get_list_data:cpo.QuaisContasReceber; cpo.QuaisEntregas = El[rpg entregas vendedor]:get_list_data; cpo.TotalComissaoMegabox = El[Ipt valor faturado]:get_data; cpo.TotalComissaoVendedor = El[Ipt valor comissao]:get_data; cpo.AnoNumero = UrlParam("datainicio" as date):extract_from_date(component_to_extract="year"); cpo.MesNome = "{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="mmmm")}"; cpo.MesNumero = UrlParam("datainicio" as date):extract_from_date(component_to_extract="month"); cpo.QualVendedor = Ancestor[TableCrossAxis]:cpo.QualVendedor
2. **NewThing** [bTzXn] tipo Tbl.ContasPagar · campos: cpo.DataVencimento = Page.Current Date/Time:plus_days(10); cpo.QualVendedor = ResultOfStep[bTwAk]:cpo.QualVendedor; cpo.StatusFinanceiro = Opt.StatusFinanceiro.A pagar; cpo.valorcomissao = ResultOfStep[bTwAk]:cpo.TotalComissaoVendedor; cpo.ValorTotal = ResultOfStep[bTwAk]:cpo.TotalComissaoMegabox; cpo.QuaisEntregas = ResultOfStep[bTwAk]:cpo.QuaisEntregas; cpo.QualMetaFechada = ResultOfStep[bTwAk]
3. **ChangeThing** [bTzlB] campos: cpo.QuaisContasPagar = ResultOfStep[bTzXn] · to_change=ResultOfStep[bTwAk]
4. **ChangeThing** [bTzXt0] campos: cpo.QualMetaFechada = ResultOfStep[bTwAk] · to_change=Ancestor[TableCrossAxis]
5. **ChangeListOfThings** [bTzdP0] campos: cpo.QualMetaFechada = ResultOfStep[bTwAk] · to_change=ResultOfStep[bTwAk]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
6. **ResetGroup** [bTwAp] alvo El[gp painel metas]

#### WF bTwBV — ButtonClicked em El[Button B]
1. **ShowElement** [bTwBZ] alvo El[pop.AddEdita MetasMensais]

#### WF bTwBa — ButtonClicked em El[bt reset filter vendedor metasmensais]
1. **ResetGroup** [bTwBb] alvo El[gp filtro vendedor metasmensais]

#### WF bTwBf — ButtonClicked em El[bt reset nivel metasmensais]
1. **ResetGroup** [bTwBg] alvo El[gp filtro nível metasmensais]

#### WF bTwBh — ButtonClicked em El[Button C]
1. **NewThing** [bTwBl] tipo Tbl.MetasMensais · campos: cpo.DataFim = El[dt final metamensal]:get_data; cpo.DataInicio = El[dt inicio metamensal]:get_data; cpo.QualNivel = El[dd nivel metamensal]:get_data; cpo.QualVendedor = El[dd vendedor metamensal]:get_data; cpo.ValorMeta = El[ipt valo metamensal]:get_data; cpo.TipoMeta = El[dd tipometa]:get_data
2. **ResetInputs** [bTwBm] 

#### WF bTwBn — ButtonClicked em El[bt reset filter datas metasmensais]
1. **ResetGroup** [bTwBr] alvo El[gp filtro data metasmensais]

#### WF bTzVj — ButtonClicked em El[Icon R]
1. **HideElement** [bTzVp] alvo El[pop.AddEdita MetasMensais]

#### WF bTzWI — ButtonClicked em El[Icon B]
1. **ShowElement** [bTzWU] alvo El[pop.CadastroUsuarios A]

#### WF bTzXF — ButtonClicked em El[Icon L]
1. **ShowElement** [bTzXL] alvo El[pop.ConfigSistema A]

#### WF bTwBB — ButtonClicked em El[Icon K]
1. **TriggerCustomEvent** [bTwBC] custom_event="bTwAv"

#### WF bTziN — ButtonClicked em El[btn ver entregas]
1. **ChangePage** [bTziP] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{Ancestor[TableCrossAxis]:cpo.QualVendedor:_id}"}, 1={key="detalhaentregas", value="{Ancestor[TableCrossAxis]:cpo.TipoMeta:display}"}}, keep_current_page_params=True

#### WF bTzkM — ButtonClicked em El[btn cancela fechamento meta]
1. **ShowElement** [bTzkS] alvo El[pop apaga meta fechada]
2. **DisplayGroupData** [bTzkX] alvo El[pop apaga meta fechada] · data_source=Ancestor[TableCrossAxis]

#### WF bTzkZ — ButtonClicked em El[Button D]
1. **DeleteListOfThings** [bTzkw] to_delete=El[pop apaga meta fechada]:get_group_data:cpo.QualMetaFechada:cpo.QuaisContasPagar, type_to_delete="custom.tbl_contasreceber1"
2. **DeleteThing** [bTzkk] to_delete=El[pop apaga meta fechada]:get_group_data:cpo.QualMetaFechada
3. **HideElement** [bTzlO] alvo El[pop apaga meta fechada]

#### WF bTzlD — ButtonClicked em El[Button E]
1. **HideElement** [bTzlJ] alvo El[pop apaga meta fechada]

#### WF bTwAv — CustomEvent «CalculaRanking»
- props: event_name="SortByNumber"
1. **ChangeListOfThings** [bUAhB] campos: cpo.RankingVendas = Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Financeiro AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.QualVendedor equals InjectedValue:cpo.QualVendedor AND cpo.QualVendedorSubstituto is_empty ∅):cpo.valorcomissao:sum:divide(InjectedValue:cpo.ValorMeta) · to_change=Search(Tbl.MetasMensais: cpo.DataFim lte UrlParam("datafim" as date) AND cpo.DataInicio gte UrlParam("datainicio" as date) AND cpo.TipoMeta equals Opt.TipoMeta.Regular AND cpo.QualMetaFechada is_empty ∅; sort cpo.DataInicio), type_to_change="custom.tbl_metasmensais"
2. **ChangeListOfThings** [bUAhP] campos: cpo.RankingVendas = Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Financeiro AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.QualVendedorSubstituto equals InjectedValue:cpo.QualVendedor):cpo.valorcomissao:sum:divide(InjectedValue:cpo.ValorMeta) · to_change=Search(Tbl.MetasMensais: cpo.DataFim lte UrlParam("datafim" as date) AND cpo.DataInicio gte UrlParam("datainicio" as date) AND cpo.TipoMeta equals Opt.TipoMeta.Substituição; sort cpo.DataInicio), type_to_change="custom.tbl_metasmensais"

#### WF bUEUB — ButtonClicked em El[Button F]
1. **Plugin[1691509762858x752107234800435200]/AAF** [bUEUh0] alvo El[ExportTable A] · AAH="grupoentregas", AAI="bordero"
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUEUJ] AAF="Salvo como Excel com sucesso!"

#### WF bTwBs — InputChanged em El[dd filtra filtravendedor]
1. **ChangePage** [bTwBt] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTwBx — ButtonClicked em El[filtrar cliente]
1. **ChangePage** [bTwBy] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{Ancestor[TableCrossAxis]:cpo.QualCliente:_id}"}}, keep_current_page_params=True

#### WF bTwBz — ButtonClicked em El[filtrar fornecedor]
1. **ChangePage** [bTwCD] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{Ancestor[TableCrossAxis]:cpo.QualFornecedor:_id}"}}, keep_current_page_params=True

#### WF bTwCE — InputChanged em El[dd filtra cliente]
1. **ChangePage** [bTwCF] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTwCJ — InputChanged em El[dd filtra numnf]
1. **ChangePage** [bTwCK] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numnf", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTwCL — InputChanged em El[dd filtra num pedido]
1. **ChangePage** [bTwCP] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTwCQ — InputChanged em El[dd filtra fornecedor]
1. **ChangePage** [bTwCR] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTwCV — ButtonClicked em El[Icon E]
1. **ResetGroup** [bTwCW] alvo El[gp filter fornecedor]
2. **ChangePage** [bTwCX] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value=""}}, keep_current_page_params=True

#### WF bTwCb — ButtonClicked em El[Icon F]
1. **ResetGroup** [bTwCc] alvo El[gp filter cliente]
2. **ChangePage** [bTwCd] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value=""}}, keep_current_page_params=True

#### WF bTwCh — ButtonClicked em El[Icon G]
1. **ResetGroup** [bTwCi] alvo El[gp filter vendedor]
2. **ChangePage** [bTwCj] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value=""}}, keep_current_page_params=True

#### WF bTwCn — ButtonClicked em El[Icon H]
1. **ResetGroup** [bTwCo] alvo El[gp filter numnf]
2. **ChangePage** [bTwCp] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numnf", value=""}}, keep_current_page_params=True

#### WF bTwCt — ButtonClicked em El[Icon I]
1. **ResetGroup** [bTwCu] alvo El[gp filtra numpedido]
2. **ChangePage** [bTwCv] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value=""}}, keep_current_page_params=True

#### WF bTwCz — ButtonClicked em El[Icon J]
1. **HideElement** [bTwDA] alvo El[pop entregas]
2. **ChangePage** [bTwDB] alvo El[Current page] · add_parameters=True, url_parameters={0={key="detalhaentregas", value="{∅}"}, 1={key="vendedor", value="{∅}"}, 2={key="numnf", value="{∅}"}, 3={key="numpedido", value="{∅}"}, 4={key="cliente", value="{∅}"}, 5={key="fornecedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTwDF — ButtonClicked em El[Button A]
1. **HideElement** [bTwDG] alvo El[pop entregas]
2. **ChangePage** [bTwDH] alvo El[Current page] · add_parameters=True, url_parameters={0={key="detalhaentregas", value="{∅}"}, 1={key="vendedor", value="{∅}"}, 2={key="numnf", value="{∅}"}, 3={key="numpedido", value="{∅}"}, 4={key="cliente", value="{∅}"}, 5={key="fornecedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTzdR0 — ButtonClicked em El[Icon Q]
1. **DeleteThing** [bTzdX0] to_delete=Ancestor[TableCrossAxis]
