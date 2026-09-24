# Pagina: `cadastros_old` (bTwGL)

Estados customizados: `var_cliforselecionado_` : Tbl.GrupoCliFor

Resumo: 135 elementos · 32 workflows · 42 ações · 42 condicionais · 1 estados customizados
Elementos por tipo: Text 33, Group 25, TableCell 20, TableMainAxis 10, CustomElement 8, Icon 8, TableCrossAxis 6, Dropdown 5, Button 4, Table 3, Plugin[1680110374647x249108010620944400]/AAC 3, RadioButtons 2, Image 2, Plugin[1753734310015x839297739754045400]/AAC 2, AutocompleteDropdown 2, RepeatingGroup 1, Input 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho A` (bTxmv) — USA Reusable tool.Cabecalho · props: floating_reference="top", custom_id="bTIVb", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.AddEditaEndereço A` (bTxmp) — USA Reusable pop.AddEditaEndereço · props: floating_reference="top", custom_id="bTxcQ", param_bTxnD=El[pop.AddEditaEndereço A]:custom.var_qualgrupoclifor_, floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.AddEditaContato A` (bTxpT) — USA Reusable pop.AddEditaContato · props: floating_reference="top", custom_id="bTxnz", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.HistoricoConversas A` (bTxwU) — USA Reusable pop.HistoricoConversas · props: floating_reference="top", custom_id="bTxuV", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.AnexosClifor A` (bTxwn) — USA Reusable pop.AnexosClifor · props: floating_reference="top", custom_id="bTjcT", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `tool.MenuPaginas A` (bTxxn) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: floating_reference="top", custom_id="bTeRP", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **CustomElement** `tool.Historico A` (bTxxt) — USA Reusable tool.Historico · oculto ao carregar · props: floating_reference="top", custom_id="bTdrv", floating_reference_horizontal="none", floating_reference_horizontal_resp="right"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showhistorico_:is_true → is_visible=True
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showhistorico_:is_false → is_visible=False
- **CustomElement** `pop.BloquearClifor A` (bTxyx0) — USA Reusable pop.BloquearClifor · props: floating_reference="top", custom_id="bTvUD", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Group** `gp titulo pagina` (bTxRd) — props: vertical_centering=True
  - **Text** `Text B` (bTxRf) — text: "Cadastros de {El[rad tipo clifor]:get_data:display}" · props: font_alignment="left"
  - **Text** `Text B` (bTxRk) — oculto ao carregar · text: "{El[rpg buscaenderecos]:get_list_data:count}"
    - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
  - **RepeatingGroup** `rpg buscaenderecos` (bTxRj) — data_source: Search(Tbl.EnderecosCliFor: cpo.NomeEndereco text contains string "{El[src busca proxima]:get_data}" AND cpo.TipoClifor equals El[rad tipo clifor]:get_data AND cpo.CnpjCpf equals "{El[src busca cnpj]:get_data:cpo.CnpjCpf}" AND cpo.QualUfOpt equals El[dd estado ]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty) · props: group_type="custom.tbl_enderecosclifor", separator_style="none"
- **Group** `gp content` (bTxSB) — props: vertical_centering=True
  - **Group** `gp clifor` (bTxSH) — props: vertical_centering=True
    - **Group** `gp filtros clifor` (bTxQh) — props: vertical_centering=True
      - **Group** `Group A` (bTxRB)
        - **Text** `Text A` (bTxRG) — text: "Exibir lista de:"
        - **RadioButtons** `rad tipo clifor` (bTxRF) — data_source: All(opt.TipoCliFor) · props: mandatory=True, columns=2, default=CurrentUser:cpo.FiltraTipoClifor, dynamic_type="option.opt_tipoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
      - **Group** `Group A` (bTxRH)
      - **Group** `Group A` (bTxRN)
      - **Group** `Group A` (bTxQj) — props: vertical_centering=True
        - **Button** `btn novo cliente` (bTxQn) — text: "Cliente" · props: icon="fa fa-plus", vertical_centering=True, icon_size=12, button_gap=4, button_type="label_icon"
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → is_visible=True
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
        - **Button** `btn novo fornecedor` (bTxQo) — text: "Fornecedor" · props: icon="fa fa-plus", vertical_centering=True, icon_size=12, button_gap=4, button_type="label_icon", button_disabled=True
          - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor):or_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Gerente)):or_(CurrentUser:cpo.QualDepto:equals(Opt.DeptoUsuario.Financeiro):or_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Analista))) → bgcolor="var(--color_primary_default)", button_disabled=False
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → is_visible=True
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → is_visible=False
    - **Table** `rpg grupoclifor` (bTxSg) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[rad tipo clifor]:get_data AND cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.NomeCliFor text contains "{El[src busca proxima]:get_data}" AND cpo.Captacao equals El[dd captacao]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty):merged_with(El[rpg buscaenderecos]:get_list_data:cpo.QualGrupoCliFor) · props: group_type="custom.tbl_clientes", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=6
      - ⟂ quando El[radio busca]:get_data:equals("Busca exata") → data_source=Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[rad tipo clifor]:get_data AND cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.NomeCliFor equals "{El[src busca exata]:get_data:cpo.NomeCliFor}"; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty)
      - ⟂ quando El[radio busca]:get_data:equals("Busca Cnpj") → data_source=El[rpg buscaenderecos]:get_list_data:cpo.QualGrupoCliFor
      - **TableCrossAxis** `TableCrossAxis A` (bTxTp) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
        - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.06)"
        - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.06)"
        - ⟂ quando El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis]):and_(El[Página cadastros_old]:custom.var_cliforselecionado_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.16)"
        - ⟂ quando El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis]):and_(El[Página cadastros_old]:custom.var_cliforselecionado_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.16)"
        - **TableCell** `Cell A` (bTxTt) — props: cell_main_axis_id="bTxTc"
          - ⟂ quando ∅ → 
          - **Group** `gp numero indice` (bTxaM) — props: vertical_centering=True
            - **Text** `Text C` (bTxVf) — text: "{Text("{CellIndex}")}" · props: font_alignment="center"
            - **Text** `Text L` (bTxYl) — text: "{Text("{Ancestor[Table]:get_list_data:count}")}" · props: font_alignment="center"
        - **TableCell** `Cell A` (bTxTu) — props: cell_main_axis_id="bTxTd"
          - **Group** `gp nomeclifor` (bTxVr) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Image** `Image A` (bTxVt) — props: src="{Parent:cpo.Foto}"
              - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `gp showdetalhes` (bTxVx) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
              - **Text** `Text D` (bTxVz) — text: "{Text("{Parent:cpo.NomeCliFor:to_uppercase}")}"
              - **Text** `Text D` (bTxWE) — text: "Não contém contrato de parceria"
                - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=False
                - ⟂ quando Search(Tbl.Anexos: cpo.QualClifor equals Parent AND cpo.TipoAnexo equals Opt.TipoAnexo.Contrato de parceria):count:greater_or_equal_than(1) → is_visible=False
              - **Text** `Text D` (bTxWF) — text: "Contém: {Text("{Parent:cpo.QuaisEnderecos:count}")} Endereços | {Text("{Parent:cpo.QuaisContatos:count}")} Contatos"
              - **Text** `Text D` (bTxVy) — text: "Criado em: {Text("{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
              - **Text** `Text D` (bTxWD) — text: "Por: {Text("{Parent:Created By:cpo.NomeModelo:to_capitalized_words}")}"
          - **Group** `gp carteira` (bTxou) — props: vertical_centering=True
            - **Group** `Group D` (bTxWK) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
              - **Text** `Text E` (bTxWP) — text: "Carteira "
              - **Dropdown** `Dropdown B` (bTxWQ) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualDepto not equal Opt.DeptoUsuario.Financeiro AND cpo.QualDepto not equal Opt.DeptoUsuario.Operação; sort cpo.NomeModelo) · placeholder: "Selecione usuáro" · auto_binding: True · props: bind_field="cpo_qualcarteira_user", dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
            - **Group** `Group G` (bTxWV) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
              - **Group** `Group G` (bTxWh) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
                - **Icon** `Icon B` (bTxWi) — props: icon="material outlined comment", vertical_centering=True
                - **Text** `Text F` (bTxWj) — oculto ao carregar · text: "" · props: font_alignment="center"
              - **Group** `Group G` (bTxWX) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
                - **Text** `Text F` (bTxWb) — text: "Ultima conversa: "
                - **Text** `Text F` (bTxWc) — oculto ao carregar · text: "{Text("{Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
                  - ⟂ quando Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:is_not_empty → is_visible=True
                - **Text** `Text F` (bTxWd) — oculto ao carregar · text: "{Text("{Page.Current Date/Time:minus(Parent:cpo.UltimoHistoricoData):to_days:format_number(decimal_place=0)}")} dias"
                  - ⟂ quando Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:is_not_empty → is_visible=True
          - **Group** `gp anexos` (bTxWo) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Icon** `Icon C` (bTxWu) — props: icon="bootstrap file-earmark-plus-fill", vertical_centering=True
            - **Text** `Text G` (bTxWt) — text: "Anexos: {Parent:cpo.QuaisAnexos:count}" · props: font_alignment="center"
          - **Group** `gp bloquear` (bTxWz) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Icon** `bt bloquear grupo` (bTxXF) — props: icon="material outlined block", vertical_centering=True
            - **Text** `Text H` (bTxXB) — text: "Bloquear" · props: font_alignment="center"
          - **Group** `gp ativo` (bTxXH) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Group** `Group J` (bTxXN) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
              - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTxXR) — auto_binding: False · props: AAD=Parent:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
                - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2):and_(Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → AAK=True
            - **Text** `Text I` (bTxXM) — text: "Ativo: {Parent:cpo.Ativo}" · props: font_alignment="center"
      - **TableMainAxis** `TableMainAxis A` (bTxTc) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis A` (bTxTd) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis A` (bTxTi) — props: axis_index=0, make_sticky=True, cross_axis_repeat=False
        - **TableCell** `Cell A` (bTxTj) — props: cell_main_axis_id="bTxTc"
          - **Dropdown** `dd sort grupoclifor` (bTxXq) — oculto ao carregar · data_source: Opt.OrdenarCampos.all values · props: default=Opt.OrdenarCampos.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:display:equals(El[icontoggle sort]:get_AAQ), constraint_type=∅}}):first_element, vertical_centering=True, dynamic_type="option.opt_ordenarcampos", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
          - **Plugin[1753734310015x839297739754045400]/AAC** `icontoggle sort` (bTxXj) — props: AAD=Opt.OrdenarCampos.all values:display, AAE="{Opt.OrdenarCampos.all values:first_element:display}", AAG=Opt.OrdenarCampos.all values:iconname, AAH=Opt.OrdenarCampos.all values:iconcolor, AAI=Opt.OrdenarCampos.all values:iconstyle, AAJ=Opt.OrdenarCampos.all values:iconfill, AAL=21, AAT=19
          - **Text** `Text J` (bTxXw) — text: "{Text("{El[dd sort grupoclifor]:get_data:display}")}" · props: font_alignment="center"
        - **TableCell** `Cell A` (bTxTn) — props: cell_main_axis_id="bTxTd"
          - **Group** `gp busca cliente` (bTxQt) — props: vertical_centering=True
            - **Input** `src busca proxima` (bTxQu) — placeholder: "Busca próxima" · props: unique_id="fuzzy"
              - ⟂ quando El[radio busca]:get_data:equals("Busca próxima") → is_visible=True
              - ⟂ quando El[radio busca]:get_data:not_equals("Busca próxima") → is_visible=False
            - **AutocompleteDropdown** `src busca exata` (bTxQz) — data_source: Search(Tbl.GrupoCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.QualTipoCliFor equals El[rad tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty) · placeholder: "Busca exata" · props: unique_id="fuzzy", field_to_search="cpo_nomecliente_text"
              - ⟂ quando El[radio busca]:get_data:equals("Busca exata") → is_visible=True
              - ⟂ quando El[radio busca]:get_data:not_equals("Busca exata") → is_visible=False
            - **AutocompleteDropdown** `src busca cnpj` (bUBht) — data_source: Search(Tbl.EnderecosCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty) · placeholder: "Busca Cnpj" · props: unique_id="fuzzy", field_to_search="cpo_cnpjcpf_text"
              - ⟂ quando El[radio busca]:get_data:equals("Busca Cnpj") → is_visible=True
              - ⟂ quando El[radio busca]:get_data:not_equals("Busca Cnpj") → is_visible=False
            - **Icon** `Icon A` (bTxQv) — props: icon="material outlined close", vertical_centering=True, button_disabled=True
              - ⟂ quando El[src busca proxima]:get_data:is_not_empty:or_(El[src busca exata]:get_data:is_not_empty):or_(El[src busca cnpj]:get_data:is_not_empty) → icon_color="var(--color_primary_default)", button_disabled=False
            - **RadioButtons** `radio busca` (bTxRA) — props: mandatory=True, columns=3, choices="Busca exata\nBusca próxima\nBusca Cnpj", default="{CurrentUser:cpo.BuscaExataProxima}", computed_value="text", use_dynamic_columns=False
          - **Dropdown** `dd captacao` (bTxRX) — data_source: All(Opt.CaptacaoCliente) · placeholder: "Captação" · props: mandatory=True, vertical_centering=True, dynamic_type="option.opt_captacaocliente", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
          - **Dropdown** `dd estado ` (bUCWH) — data_source: All(Opt.UFs) · placeholder: "Estado" · props: mandatory=False, vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:uf_texto}"
          - **Group** `Group N` (bUBhX) — props: vertical_centering=True
            - **Dropdown** `dd filter cliforativo` (bTxYa) — oculto ao carregar · data_source: Opt.SimNão.all values · props: default=Opt.SimNão.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:icon_state:equals(El[IconToggle(MultiState) B]:get_AAQ), constraint_type=∅}}):first_element, vertical_centering=True, dynamic_type="option.opt_simn_o", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
            - **Plugin[1753734310015x839297739754045400]/AAC** `IconToggle(MultiState) B` (bTxYN) — props: AAD=Opt.SimNão.all values:icon_state, AAE="{Opt.SimNão.all values:icon_state:last_element}", AAF=False, AAG=Opt.SimNão.all values:icon_name, AAH=Opt.SimNão.all values:icon_color, AAI=Opt.SimNão.all values:icon_mode, AAJ=Opt.SimNão.all values:icon_fill, AAL=19, AAT=31
            - **Text** `Text K` (bTxYU) — text: "{Text("{El[dd filter cliforativo]:get_data:display}")}" · props: font_alignment="center"
  - **Group** `gp cadastros` (bTxOl) — data_source: El[Página cadastros_old]:custom.var_cliforselecionado_ · props: group_type="custom.tbl_clientes", vertical_centering=True
    - ⟂ quando CurrentUser:cpo.ExpandirCadastroClifor:is_true → is_visible=True
    - **Group** `gp nomeclifor` (bTxbx) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Image** `Image B` (bTxbz) — props: src="{Parent:cpo.Foto}"
        - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `gp showdetalhes` (bTxcD) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Icon** `Icon E` (bTxwy) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando Parent:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
        - **Text** `Text M` (bTxcF) — text: "{Text("{Parent:cpo.NomeCliFor:to_uppercase}")}"
        - **Text** `Text M` (bTxcK) — text: "Não contém contrato de parceria"
          - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=False
          - ⟂ quando Search(Tbl.Anexos: cpo.QualClifor equals Parent AND cpo.TipoAnexo equals Opt.TipoAnexo.Contrato de parceria):count:greater_or_equal_than(1) → is_visible=False
        - **Text** `Text M` (bTxcL) — text: "Contém: {Text("{El[rpg enderecos]:get_list_data:count}")} Endereços | {Text("{El[rpg contatos]:get_list_data:count}")} Contatos"
        - **Text** `Text M` (bTxcE) — text: "Criado em: {Text("{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
        - **Text** `Text M` (bTxcJ) — text: "Por: {Text("{Parent:Created By:cpo.NomeModelo:to_capitalized_words}")}"
    - **Table** `rpg enderecos` (bTxPg) — data_source: Parent:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, unique_id="", vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
      - **TableCrossAxis** `TableCrossAxis O` (bTxPh) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell O` (bTxPl) — props: cell_main_axis_id="bTxQR"
          - **Icon** `btn edita endereço cliente` (bTxPm) — props: icon="material outlined edit", button_disabled=False
          - **Icon** `Icon O` (bTxPn) — props: icon="material outlined my_location"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `Switch enderecos` (bTxPr) — auto_binding: False · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
        - **TableCell** `Cell O` (bTxPs) — props: cell_main_axis_id="bTxQV"
          - **Text** `tx cidade endereco` (bTxPt) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Endereco:to_capitalized_words}")} - {Text("{Ancestor[TableCrossAxis]:cpo.Municipio:to_capitalized_words}")}/{Text("{Ancestor[TableCrossAxis]:cpo.QualUfOpt:display}")}"
        - **TableCell** `Cell O` (bTxPx) — props: cell_main_axis_id="bTxQW"
          - **Text** `tx nome endereco` (bTxPy) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}")}"
        - **TableCell** `Cell O` (bTxPz) — props: cell_main_axis_id="bTxQX"
          - **Text** `tx cidade endereco` (bTxQD) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.CnpjCpf}")}"
      - **TableCrossAxis** `TableCrossAxis O` (bTxQE) — props: axis_index=0
        - **TableCell** `Cell O` (bTxQF) — props: cell_main_axis_id="bTxQR"
          - **Button** `btn novo endereço cliente` (bTxQJ) — text: "Novo" · props: icon="material outlined add", icon_size=16, button_gap=4, button_type="label_icon"
            - ⟂ quando El[gp cadastros]:get_group_data:is_empty → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGl_default)", button_disabled=True
        - **TableCell** `Cell O` (bTxQK) — props: cell_main_axis_id="bTxQV"
        - **TableCell** `Cell O` (bTxQL) — props: cell_main_axis_id="bTxQW"
          - **Text** `Text O` (bTxQP) — text: "Endereços do cliente"
        - **TableCell** `Cell O` (bTxQQ) — props: cell_main_axis_id="bTxQX"
      - **TableMainAxis** `TableMainAxis O` (bTxQR) — props: axis_index=3
      - **TableMainAxis** `TableMainAxis O` (bTxQV) — props: axis_index=2
      - **TableMainAxis** `TableMainAxis O` (bTxQW) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis O` (bTxQX) — props: axis_index=1
    - **Table** `rpg contatos` (bTxOp) — data_source: Parent:cpo.QuaisContatos · props: group_type="custom.tbl_contatoclifor", vertical_centering=True, unique_id="", vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
      - **TableCrossAxis** `TableCrossAxis O` (bTxOq) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell O` (bTxOr) — props: cell_main_axis_id="bTxPZ"
          - **Icon** `btn edita contato cliente` (bTxOv) — props: icon="material outlined edit"
          - **Plugin[1680110374647x249108010620944400]/AAC** `Switch contatos` (bTxOw) — auto_binding: False · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
        - **TableCell** `Cell O` (bTxOx) — props: cell_main_axis_id="bTxPa"
          - **Text** `Text O` (bTxPB) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Telefone:to_capitalized_words}")}"
        - **TableCell** `Cell O` (bTxPC) — props: cell_main_axis_id="bTxPb"
          - **Text** `Text O` (bTxPD) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NomeContato:to_capitalized_words}")}⏎[size=1]{Text("{Ancestor[TableCrossAxis]:cpo.Cargo:to_capitalized_words}")}[/size]"
        - **TableCell** `Cell O` (bTxPH) — props: cell_main_axis_id="bTxPf"
          - **Text** `Text O` (bTxPI) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Email:to_lowercase}")}"
      - **TableCrossAxis** `TableCrossAxis O` (bTxPJ) — props: axis_index=0
        - **TableCell** `Cell O` (bTxPN) — props: cell_main_axis_id="bTxPZ"
          - **Button** `btn novo contato` (bTxyT) — text: "Novo" · props: icon="material outlined add", icon_size=16, button_gap=4, button_type="label_icon"
            - ⟂ quando El[gp cadastros]:get_group_data:is_empty → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGl_default)", button_disabled=True
        - **TableCell** `Cell O` (bTxPP) — props: cell_main_axis_id="bTxPa"
        - **TableCell** `Cell O` (bTxPT) — props: cell_main_axis_id="bTxPb"
          - **Text** `Text O` (bTxPU) — text: "Contatos do cliente"
        - **TableCell** `Cell O` (bTxPV) — props: cell_main_axis_id="bTxPf"
      - **TableMainAxis** `TableMainAxis O` (bTxPZ) — props: axis_index=4
      - **TableMainAxis** `TableMainAxis O` (bTxPa) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis O` (bTxPb) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis O` (bTxPf) — props: axis_index=2

## Workflows

#### WF bTxYC — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch A]
1. **ChangeThing** [bTxYI] campos: cpo.Ativo = This:get_AAI · to_change=Parent
2. **ChangeListOfThings** [bTxyF] campos: cpo.Ativo = This:get_AAI · to_change=Parent:cpo.QuaisEnderecos, type_to_change="custom.tbl_enderecosclifor"

#### WF bTxZu — ButtonClicked em El[gp nomeclifor]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxaA] alvo El[Página cadastros_old] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bTxaF — ButtonClicked em El[gp nomeclifor]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxaH] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxaX — ButtonClicked em El[gp numero indice]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxad] alvo El[Página cadastros_old] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bTxaf — ButtonClicked em El[gp numero indice]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxak] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxap — ButtonClicked em El[gp anexos]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxav] alvo El[Página cadastros_old] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bTxax — ButtonClicked em El[gp anexos]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxbC] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxbH — ButtonClicked em El[gp bloquear]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxbJ] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxbO — ButtonClicked em El[gp bloquear]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxbT] alvo El[Página cadastros_old] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bTxbV — ButtonClicked em El[gp ativo]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxba] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxbf — ButtonClicked em El[gp ativo]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxbh] alvo El[Página cadastros_old] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bTxbm — ButtonClicked em El[Icon A]
1. **ResetGroup** [bTxbs] alvo El[gp busca cliente]

#### WF bTxnU — ButtonClicked em El[btn edita endereço cliente]
1. **ShowElement** [bTxna] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bTxnf] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Edita Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"}, 1={value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"}}

#### WF bTxnh — ButtonClicked em El[btn novo endereço cliente]
1. **ShowElement** [bTxoF] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bTxoK] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Novo Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=El[gp cadastros]:get_group_data, custom_state="custom.var_qualgrupoclifor_"}, 1={value=True, custom_state="custom.var_destravarcampos_"}}

#### WF bTxoP — ButtonClicked em El[btn novo cliente]
1. **ShowElement** [bTxoV] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bTxoc] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Novo Cliente, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=True, custom_state="custom.var_destravarcampos_"}}

#### WF bTxoh — ButtonClicked em El[btn novo fornecedor]
1. **ShowElement** [bTxon] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bTxop] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Novo Fornecedor, custom_state="custom.var_a__oclifor_"

#### WF bTxpF — ButtonClicked em El[gp carteira]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxpH] alvo El[Página cadastros_old] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bTxpM — ButtonClicked em El[gp carteira]
- condição: El[Página cadastros_old]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTxpR] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxsT — ButtonClicked em El[btn novo contato]
1. **ShowElement** [bTxsZ] alvo El[pop.AddEditaContato A]
2. **DisplayGroupData** [bTxsj] alvo El[pop.AddEditaContato A] · data_source=El[gp cadastros]:get_group_data
3. **SetCustomState** [bTxse] alvo El[pop.AddEditaContato A] · value=Opt.AçãoCliFor.Novo Contato Cliente, custom_state="custom.var_a__oclifor_"

#### WF bTxsl — ButtonClicked em El[btn edita contato cliente]
1. **ShowElement** [bTxtD] alvo El[pop.AddEditaContato A]
2. **DisplayGroupData** [bTxtI] alvo El[pop.AddEditaContato A] · data_source=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor
3. **SetCustomState** [bTxtN] alvo El[pop.AddEditaContato A] · value=Opt.AçãoCliFor.Edita Contato Cliente, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualcontato_"}}

#### WF bTxtV — SEM_TIPO

#### WF bTxtb — Plugin[1753734310015x839297739754045400]/AAR em El[IconToggle(MultiState) B]
1. **SetCustomState** [bTxtm] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxtr — Plugin[1753734310015x839297739754045400]/AAR em El[icontoggle sort]
1. **SetCustomState** [bTxtx] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxtz — InputChanged em El[rad tipo clifor]
1. **SetCustomState** [bTxuF] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxuK — InputChanged em El[dd captacao]
1. **SetCustomState** [bTxuQ] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxwJ — ButtonClicked em El[Icon C]
1. **ShowElement** [bTxwP] alvo El[pop.AnexosClifor A]
2. **SetCustomState** [bTxwt] alvo El[pop.AnexosClifor A] · value=Parent, custom_state="custom.var_qualclifor_", custom_states_values={0={value=Opt.TipoAnexo.Alvará de Funcionamento, custom_state="custom.var_tipoanexo_"}}

#### WF bTxwa — ButtonClicked em El[Icon B]
1. **ShowElement** [bTxwg] alvo El[pop.HistoricoConversas A]
2. **DisplayGroupData** [bTxwl] alvo El[pop.HistoricoConversas A] · data_source=Parent

#### WF bTxxE — ButtonClicked em El[Icon E]
1. **SetCustomState** [bTxxP] alvo El[Página cadastros_old] · custom_state="custom.var_cliforselecionado_"

#### WF bTxxR — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch enderecos]
1. **ChangeThing** [bTxxX] campos: cpo.Ativo = This:get_AAI · to_change=Ancestor[TableCrossAxis]

#### WF bTxxc — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch contatos]
1. **ChangeThing** [bTxxi] campos: cpo.Ativo = This:get_AAI · to_change=Ancestor[TableCrossAxis]

#### WF bTxye — ButtonClicked em El[gp nomeclifor]

#### WF bTxyp0 — ButtonClicked em El[bt bloquear grupo]
1. **ShowElement** [bTxyv0] alvo El[pop.BloquearClifor A]
2. **DisplayGroupData** [bTxzD0] alvo El[pop.BloquearClifor A] · data_source=Parent
