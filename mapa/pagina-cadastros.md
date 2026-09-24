# Pagina: `cadastros` (bUCWN0)

Estados customizados: `var_cliforselecionado_` : Tbl.GrupoCliFor

Resumo: 141 elementos · 31 workflows · 41 ações · 46 condicionais · 1 estados customizados
Elementos por tipo: Text 36, Group 27, TableCell 20, TableMainAxis 10, Icon 9, CustomElement 8, TableCrossAxis 6, Button 4, Dropdown 4, Table 3, Plugin[1680110374647x249108010620944400]/AAC 3, RadioButtons 2, Image 2, Plugin[1753734310015x839297739754045400]/AAC 2, AutocompleteDropdown 2, RepeatingGroup 1, Checkbox 1, Input 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho A` (bUCbL0) — USA Reusable tool.Cabecalho · props: floating_reference="top", custom_id="bTIVb", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.AddEditaEndereço A` (bUCbH0) — USA Reusable pop.AddEditaEndereço · props: floating_reference="top", custom_id="bTxcQ", param_bTxnD=El[pop.AddEditaEndereço A]:custom.var_qualgrupoclifor_, floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.AddEditaContato A` (bUCbM0) — USA Reusable pop.AddEditaContato · props: floating_reference="top", custom_id="bTxnz", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.HistoricoConversas A` (bUCbN0) — USA Reusable pop.HistoricoConversas · props: floating_reference="top", custom_id="bTxuV", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.AnexosClifor A` (bUCbR0) — USA Reusable pop.AnexosClifor · props: floating_reference="top", custom_id="bTjcT", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `tool.MenuPaginas A` (bUCbS0) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: floating_reference="top", custom_id="bTeRP", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **CustomElement** `tool.Historico A` (bUCbT0) — USA Reusable tool.Historico · oculto ao carregar · props: floating_reference="top", custom_id="bTdrv", floating_reference_horizontal="none", floating_reference_horizontal_resp="right"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showhistorico_:is_true → is_visible=True
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showhistorico_:is_false → is_visible=False
- **CustomElement** `pop.BloquearClifor A` (bUCbX0) — USA Reusable pop.BloquearClifor · props: floating_reference="top", custom_id="bTvUD", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Group** `gp titulo pagina` (bUCbA0) — props: vertical_centering=True
  - **Text** `Text B` (bUCbB0) — text: "Cadastros de {El[rad tipo clifor]:get_data:display}" · props: font_alignment="left"
  - **Text** `Text B` (bUCbG0) — oculto ao carregar · text: "{El[rpg buscaenderecos a]:get_list_data:count}"
    - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
  - **RepeatingGroup** `rpg buscaenderecos a` (bUCbF0) — props: group_type="custom.tbl_enderecosclifor", separator_style="none"
    - ⟂ quando El[radio busca]:get_data:equals("Busca exata") → data_source=Search(Tbl.EnderecosCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.QualUfOpt equals El[dd estado ]:get_data AND cpo.TipoClifor equals El[rad tipo clifor]:get_data AND cpo.QualGrupoCliFor equals El[src busca exata]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty)
    - ⟂ quando El[radio busca]:get_data:equals("Busca Cnpj") → data_source=Search(Tbl.EnderecosCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.QualUfOpt equals El[dd estado ]:get_data AND cpo.CnpjCpf equals "{El[src busca cnpj]:get_data:cpo.CnpjCpf}" AND cpo.TipoClifor equals El[rad tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty)
    - ⟂ quando El[radio busca]:get_data:equals("Busca próxima") → data_source=Search(Tbl.EnderecosCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.QualNomeGrupoCliFor text contains "{El[src busca proxima]:get_data}" AND cpo.QualUfOpt equals El[dd estado ]:get_data AND cpo.TipoClifor equals El[rad tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty)
    - ⟂ quando El[Checkbox cliente sem carteira]:get_data → data_source=Search(Tbl.EnderecosCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.QualUfOpt equals El[dd estado ]:get_data AND cpo.TipoClifor equals El[rad tipo clifor]:get_data AND cpo.QualGrupoCliFor equals El[src busca exata]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualGrupoCliFor:cpo.QualCarteira:is_empty, constraint_type=∅}})
- **Group** `gp content` (bUCaz0) — props: vertical_centering=True
  - **Group** `gp clifor` (bUCYq0) — props: vertical_centering=True
    - **Group** `gp filtros clifor` (bUCYY0) — props: vertical_centering=True
      - **Group** `Group A` (bUCYk0)
        - **Text** `Text A` (bUCYp0) — text: "Exibir lista de:"
        - **RadioButtons** `rad tipo clifor` (bUCYl0) — data_source: All(opt.TipoCliFor) · props: mandatory=True, columns=2, default=CurrentUser:cpo.FiltraTipoClifor, dynamic_type="option.opt_tipoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
      - **Group** `Group P` (bUEor) — props: vertical_centering=True
        - **Checkbox** `Checkbox cliente sem carteira` (bUEow) — label: "" · props: vertical_centering=True
        - **Icon** `Icon F` (bUEox) — props: icon="material outlined person_off", vertical_centering=True
        - **Text** `Text N` (bUEpB) — text: "Clientes sem carteira"
      - **Group** `Group A` (bUCYf0)
      - **Group** `Group A` (bUCYj0)
      - **Group** `Group A` (bUCYZ0) — props: vertical_centering=True
        - **Button** `btn novo cliente` (bUCYd0) — text: "Cliente" · props: icon="fa fa-plus", vertical_centering=True, icon_size=12, button_gap=4, button_type="label_icon"
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → is_visible=True
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
        - **Button** `btn novo fornecedor` (bUCYe0) — text: "Fornecedor" · props: icon="fa fa-plus", vertical_centering=True, icon_size=12, button_gap=4, button_type="label_icon", button_disabled=True
          - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor):or_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Gerente)):or_(CurrentUser:cpo.QualDepto:equals(Opt.DeptoUsuario.Financeiro):or_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Analista))) → bgcolor="var(--color_primary_default)", button_disabled=False
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → is_visible=True
          - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → is_visible=False
    - **Group** `Group Q` (bUEpV)
      - **Text** `Text P` (bUEpJ) — text: "Clientes ativos: {Search(Tbl.GrupoCliFor: cpo.Ativo equals True AND cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente):count}"
      - **Text** `Text Q` (bUEpP) — text: "Fornecedores ativos: {Search(Tbl.GrupoCliFor: cpo.Ativo equals True AND cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor):count}"
    - **Table** `rpg grupoclifor` (bUCYX0) — data_source: El[rpg buscaenderecos a]:get_list_data:cpo.QualGrupoCliFor:unique · props: group_type="custom.tbl_clientes", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=6
      - **TableCrossAxis** `TableCrossAxis A` (bUCXh0) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
        - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.06)"
        - ⟂ quando El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.06)"
        - ⟂ quando El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis]):and_(El[Página cadastros]:custom.var_cliforselecionado_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.16)"
        - ⟂ quando El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis]):and_(El[Página cadastros]:custom.var_cliforselecionado_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.16)"
        - **TableCell** `Cell A` (bUCWO0) — props: cell_main_axis_id="bUCXi0"
          - ⟂ quando ∅ → 
          - **Group** `gp numero indice` (bUCWP0) — props: vertical_centering=True
            - **Text** `Text C` (bUCWT0) — text: "{Text("{CellIndex}")}" · props: font_alignment="center"
            - **Text** `Text L` (bUCWU0) — text: "{Text("{Ancestor[Table]:get_list_data:count}")}" · props: font_alignment="center"
        - **TableCell** `Cell A` (bUCWV0) — props: cell_main_axis_id="bUCXj0"
          - **Group** `gp nomeclifor` (bUCWZ0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Image** `Image A` (bUCWa0) — props: src="{Parent:cpo.Foto}"
              - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `gp showdetalhes` (bUCWb0) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
              - **Text** `Text D` (bUCWg0) — text: "{Text("{Parent:cpo.NomeCliFor:to_uppercase}")}"
              - **Text** `Text D` (bUCWl0) — text: "Não contém contrato de parceria"
                - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=False
                - ⟂ quando Search(Tbl.Anexos: cpo.QualClifor equals Parent AND cpo.TipoAnexo equals Opt.TipoAnexo.Contrato de parceria):count:greater_or_equal_than(1):and_(Parent:cpo.NãoFazContratoParceria:is_false) → text="Contrato de parceria anexo", font_color="var(--color_bTHHX_default)"
                - ⟂ quando Parent:cpo.NãoFazContratoParceria → text="Não faz contrato de parceria", font_color="var(--color_bTHHQ_default)"
                - ⟂ quando Search(Tbl.Anexos: cpo.QualClifor equals Parent AND cpo.TipoAnexo equals Opt.TipoAnexo.Contrato de parceria):count:less_than(1):and_(Parent:cpo.NãoFazContratoParceria:is_false) → text="Não contém contrato de parceria", font_color="var(--color_bTHHJ_default)"
              - **Text** `Text D` (bUCWm0) — text: "Contém: {Text("{Parent:cpo.QuaisEnderecos:count}")} Endereços | {Text("{Parent:cpo.QuaisContatos:count}")} Contatos"
              - **Text** `Text D` (bUCWf0) — text: "Criado em: {Text("{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
              - **Text** `Text D` (bUCWh0) — text: "Por: {Text("{Parent:Created By:cpo.NomeModelo:to_capitalized_words}")}"
          - **Group** `gp carteira` (bUCWn0) — props: vertical_centering=True
            - **Group** `Group D` (bUCXF0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
              - **Text** `Text E` (bUCXJ0) — text: "Carteira "
              - **Dropdown** `Dropdown B` (bUCXK0) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualDepto not equal Opt.DeptoUsuario.Financeiro AND cpo.QualDepto not equal Opt.DeptoUsuario.Operação; sort cpo.NomeModelo) · placeholder: "Selecione usuáro" · auto_binding: True · props: bind_field="cpo_qualcarteira_user", dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
            - **Group** `Group G` (bUCWr0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
              - **Group** `Group G` (bUCWz0) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
                - **Icon** `Icon B` (bUCXD0) — props: icon="material outlined comment", vertical_centering=True
                - **Text** `Text F` (bUCXE0) — oculto ao carregar · text: "" · props: font_alignment="center"
              - **Group** `Group G` (bUCWs0) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
                - **Text** `Text F` (bUCWt0) — text: "Ultima conversa: "
                - **Text** `Text F` (bUCWx0) — oculto ao carregar · text: "{Text("{Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
                  - ⟂ quando Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:is_not_empty → is_visible=True
                - **Text** `Text F` (bUCWy0) — oculto ao carregar · text: "{Text("{Page.Current Date/Time:minus(Parent:cpo.UltimoHistoricoData):to_days:format_number(decimal_place=0)}")} dias"
                  - ⟂ quando Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:is_not_empty → is_visible=True
          - **Group** `gp anexos` (bUCXL0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Icon** `Icon C` (bUCXQ0) — props: icon="bootstrap file-earmark-plus-fill", vertical_centering=True
            - **Text** `Text G` (bUCXP0) — text: "Anexos: {Parent:cpo.QuaisAnexos:count}" · props: font_alignment="center"
          - **Group** `gp bloquear` (bUCXR0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Icon** `bt bloquear grupo` (bUCXW0) — props: icon="material outlined block", vertical_centering=True
            - **Text** `Text H` (bUCXV0) — text: "Bloquear" · props: font_alignment="center"
          - **Group** `gp ativo` (bUCXX0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Group** `Group J` (bUCXc0) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
              - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bUCXd0) — auto_binding: False · props: AAD=Parent:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
                - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2):and_(Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → AAK=True
            - **Text** `Text I` (bUCXb0) — text: "Ativo: {Parent:cpo.Ativo}" · props: font_alignment="center"
      - **TableMainAxis** `TableMainAxis A` (bUCXi0) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis A` (bUCXj0) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis A` (bUCXn0) — props: axis_index=0, make_sticky=True, cross_axis_repeat=False
        - **TableCell** `Cell A` (bUCXo0) — props: cell_main_axis_id="bUCXi0"
          - **Dropdown** `dd sort grupoclifor` (bUCXt0) — oculto ao carregar · data_source: Opt.OrdenarCampos.all values · props: default=Opt.OrdenarCampos.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:display:equals(El[icontoggle sort]:get_AAQ), constraint_type=∅}}):first_element, vertical_centering=True, dynamic_type="option.opt_ordenarcampos", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
          - **Plugin[1753734310015x839297739754045400]/AAC** `icontoggle sort` (bUCXp0) — props: AAD=Opt.OrdenarCampos.all values:display, AAE="{Opt.OrdenarCampos.all values:first_element:display}", AAG=Opt.OrdenarCampos.all values:iconname, AAH=Opt.OrdenarCampos.all values:iconcolor, AAI=Opt.OrdenarCampos.all values:iconstyle, AAJ=Opt.OrdenarCampos.all values:iconfill, AAL=21, AAT=19
          - **Text** `Text J` (bUCXu0) — text: "{Text("{El[dd sort grupoclifor]:get_data:display}")}" · props: font_alignment="center"
        - **TableCell** `Cell A` (bUCXv0) — props: cell_main_axis_id="bUCXj0"
          - **Group** `gp busca cliente` (bUCXz0) — props: vertical_centering=True
            - **Input** `src busca proxima` (bUCYA0) — placeholder: "Busca próxima" · props: unique_id="fuzzy"
              - ⟂ quando El[radio busca]:get_data:equals("Busca próxima") → is_visible=True
              - ⟂ quando El[radio busca]:get_data:not_equals("Busca próxima") → is_visible=False
            - **AutocompleteDropdown** `src busca exata` (bUCYF0) — data_source: Search(Tbl.GrupoCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.QualTipoCliFor equals El[rad tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty) · placeholder: "Busca exata" · props: unique_id="fuzzy", field_to_search="cpo_nomecliente_text"
              - ⟂ quando El[radio busca]:get_data:equals("Busca exata") → is_visible=True
              - ⟂ quando El[radio busca]:get_data:not_equals("Busca exata") → is_visible=False
            - **AutocompleteDropdown** `src busca cnpj` (bUCYG0) — data_source: Search(Tbl.EnderecosCliFor: cpo.Ativo equals El[dd filter cliforativo]:get_data:boolean AND cpo.TipoClifor equals El[rad tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd sort grupoclifor]:get_data:nomecampo}", ignore empty) · placeholder: "Busca Cnpj" · props: unique_id="fuzzy", field_to_search="cpo_cnpjcpf_text"
              - ⟂ quando El[radio busca]:get_data:equals("Busca Cnpj") → is_visible=True
              - ⟂ quando El[radio busca]:get_data:not_equals("Busca Cnpj") → is_visible=False
            - **Icon** `Icon A` (bUCYB0) — props: icon="material outlined close", vertical_centering=True, button_disabled=True
              - ⟂ quando El[src busca proxima]:get_data:is_not_empty:or_(El[src busca exata]:get_data:is_not_empty):or_(El[src busca cnpj]:get_data:is_not_empty) → icon_color="var(--color_primary_default)", button_disabled=False
            - **RadioButtons** `radio busca` (bUCYH0) — props: mandatory=True, columns=3, choices="Busca exata\nBusca próxima\nBusca Cnpj", default="{CurrentUser:cpo.BuscaExataProxima}", computed_value="text", use_dynamic_columns=False
          - **Dropdown** `dd estado ` (bUCYT0) — data_source: All(Opt.UFs) · placeholder: "Estado" · props: mandatory=False, vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:uf_texto}"
          - **Group** `Group N` (bUCYM0) — props: vertical_centering=True
            - **Dropdown** `dd filter cliforativo` (bUCYN0) — oculto ao carregar · data_source: Opt.SimNão.all values · props: default=Opt.SimNão.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:icon_state:equals(El[IconToggle(MultiState) B]:get_AAQ), constraint_type=∅}}):first_element, vertical_centering=True, dynamic_type="option.opt_simn_o", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
            - **Plugin[1753734310015x839297739754045400]/AAC** `IconToggle(MultiState) B` (bUCYR0) — props: AAD=Opt.SimNão.all values:icon_state, AAE="{Opt.SimNão.all values:icon_state:last_element}", AAF=False, AAG=Opt.SimNão.all values:icon_name, AAH=Opt.SimNão.all values:icon_color, AAI=Opt.SimNão.all values:icon_mode, AAJ=Opt.SimNão.all values:icon_fill, AAL=19, AAT=31
            - **Text** `Text K` (bUCYS0) — text: "{Text("{El[dd filter cliforativo]:get_data:display}")}" · props: font_alignment="center"
  - **Group** `gp cadastros` (bUCYr0) — data_source: El[Página cadastros]:custom.var_cliforselecionado_ · props: group_type="custom.tbl_clientes", vertical_centering=True
    - ⟂ quando CurrentUser:cpo.ExpandirCadastroClifor:is_true → is_visible=True
    - **Group** `gp nomeclifor` (bUCah0) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Image** `Image B` (bUCai0) — props: src="{Parent:cpo.Foto}"
        - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `gp showdetalhes` (bUCaj0) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Icon** `Icon E` (bUCau0) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando Parent:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
        - **Text** `Text M` (bUCao0) — text: "{Text("{Parent:cpo.NomeCliFor:to_uppercase}")}"
        - **Text** `Text M` (bUCat0) — text: "Não contém contrato de parceria"
          - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=False
          - ⟂ quando Search(Tbl.Anexos: cpo.QualClifor equals Parent AND cpo.TipoAnexo equals Opt.TipoAnexo.Contrato de parceria):count:greater_or_equal_than(1) → is_visible=False
        - **Text** `Text M` (bUCav0) — text: "Contém: {Text("{El[rpg enderecos]:get_list_data:count}")} Endereços | {Text("{El[rpg contatos]:get_list_data:count}")} Contatos"
        - **Text** `Text M` (bUCan0) — text: "Criado em: {Text("{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
        - **Text** `Text M` (bUCap0) — text: "Por: {Text("{Parent:Created By:cpo.NomeModelo:to_capitalized_words}")}"
    - **Table** `rpg enderecos` (bUCZm0) — data_source: Parent:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, unique_id="", vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
      - **TableCrossAxis** `TableCrossAxis O` (bUCZn0) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell O` (bUCZr0) — props: cell_main_axis_id="bUCaX0"
          - **Icon** `btn edita endereço cliente` (bUCZs0) — props: icon="material outlined edit", button_disabled=False
          - **Icon** `Icon O` (bUCZt0) — props: icon="material outlined my_location"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `Switch enderecos` (bUCZx0) — auto_binding: False · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
        - **TableCell** `Cell O` (bUCZy0) — props: cell_main_axis_id="bUCab0"
          - **Text** `tx cidade endereco` (bUCZz0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Endereco:to_capitalized_words}")} - {Text("{Ancestor[TableCrossAxis]:cpo.Municipio:to_capitalized_words}")}/{Text("{Ancestor[TableCrossAxis]:cpo.QualUfOpt:display}")}"
        - **TableCell** `Cell O` (bUCaD0) — props: cell_main_axis_id="bUCac0"
          - **Text** `tx nome endereco` (bUCaE0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}")}"
        - **TableCell** `Cell O` (bUCaF0) — props: cell_main_axis_id="bUCad0"
          - **Text** `tx cidade endereco` (bUCaJ0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.CnpjCpf}")}"
      - **TableCrossAxis** `TableCrossAxis O` (bUCaK0) — props: axis_index=0
        - **TableCell** `Cell O` (bUCaL0) — props: cell_main_axis_id="bUCaX0"
          - **Button** `btn novo endereço cliente` (bUCaP0) — text: "Novo" · props: icon="material outlined add", icon_size=16, button_gap=4, button_type="label_icon"
            - ⟂ quando El[gp cadastros]:get_group_data:is_empty → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGl_default)", button_disabled=True
        - **TableCell** `Cell O` (bUCaQ0) — props: cell_main_axis_id="bUCab0"
        - **TableCell** `Cell O` (bUCaR0) — props: cell_main_axis_id="bUCac0"
          - **Text** `Text O` (bUCaV0) — text: "Endereços do cliente"
        - **TableCell** `Cell O` (bUCaW0) — props: cell_main_axis_id="bUCad0"
      - **TableMainAxis** `TableMainAxis O` (bUCaX0) — props: axis_index=3
      - **TableMainAxis** `TableMainAxis O` (bUCab0) — props: axis_index=2
      - **TableMainAxis** `TableMainAxis O` (bUCac0) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis O` (bUCad0) — props: axis_index=1
    - **Table** `rpg contatos` (bUCYv0) — data_source: Parent:cpo.QuaisContatos · props: group_type="custom.tbl_contatoclifor", vertical_centering=True, unique_id="", vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
      - **TableCrossAxis** `TableCrossAxis O` (bUCYw0) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell O` (bUCYx0) — props: cell_main_axis_id="bUCZf0"
          - **Icon** `btn edita contato cliente` (bUCZB0) — props: icon="material outlined edit"
          - **Plugin[1680110374647x249108010620944400]/AAC** `Switch contatos` (bUCZC0) — auto_binding: False · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
        - **TableCell** `Cell O` (bUCZD0) — props: cell_main_axis_id="bUCZg0"
          - **Text** `Text O` (bUCZH0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Telefone:to_capitalized_words}")}"
        - **TableCell** `Cell O` (bUCZI0) — props: cell_main_axis_id="bUCZh0"
          - **Text** `Text O` (bUCZJ0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NomeContato:to_capitalized_words}")}⏎[size=1]{Text("{Ancestor[TableCrossAxis]:cpo.Cargo:to_capitalized_words}")}[/size]"
        - **TableCell** `Cell O` (bUCZN0) — props: cell_main_axis_id="bUCZl0"
          - **Text** `Text O` (bUCZO0) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.Email:to_lowercase}")}"
      - **TableCrossAxis** `TableCrossAxis O` (bUCZP0) — props: axis_index=0
        - **TableCell** `Cell O` (bUCZT0) — props: cell_main_axis_id="bUCZf0"
          - **Button** `btn novo contato` (bUCZU0) — text: "Novo" · props: icon="material outlined add", icon_size=16, button_gap=4, button_type="label_icon"
            - ⟂ quando El[gp cadastros]:get_group_data:is_empty → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGl_default)", button_disabled=True
        - **TableCell** `Cell O` (bUCZV0) — props: cell_main_axis_id="bUCZg0"
        - **TableCell** `Cell O` (bUCZZ0) — props: cell_main_axis_id="bUCZh0"
          - **Text** `Text O` (bUCZa0) — text: "Contatos do cliente"
        - **TableCell** `Cell O` (bUCZb0) — props: cell_main_axis_id="bUCZl0"
      - **TableMainAxis** `TableMainAxis O` (bUCZf0) — props: axis_index=4
      - **TableMainAxis** `TableMainAxis O` (bUCZg0) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis O` (bUCZh0) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis O` (bUCZl0) — props: axis_index=2

## Workflows

#### WF bUCbZ0 — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch A]
1. **ChangeThing** [bUCbd0] campos: cpo.Ativo = This:get_AAI · to_change=Parent
2. **ChangeListOfThings** [bUCbe0] campos: cpo.Ativo = This:get_AAI · to_change=Parent:cpo.QuaisEnderecos, type_to_change="custom.tbl_enderecosclifor"

#### WF bUCbf0 — ButtonClicked em El[gp nomeclifor]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCbj0] alvo El[Página cadastros] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bUCbk0 — ButtonClicked em El[gp nomeclifor]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCbl0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCbp0 — ButtonClicked em El[gp numero indice]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCbq0] alvo El[Página cadastros] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bUCbr0 — ButtonClicked em El[gp numero indice]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCbv0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCbw0 — ButtonClicked em El[gp anexos]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCbx0] alvo El[Página cadastros] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bUCcB0 — ButtonClicked em El[gp anexos]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCcC0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCcD0 — ButtonClicked em El[gp bloquear]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCcH0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCcI0 — ButtonClicked em El[gp bloquear]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCcJ0] alvo El[Página cadastros] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bUCcN0 — ButtonClicked em El[gp ativo]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCcO0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCcP0 — ButtonClicked em El[gp ativo]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCcT0] alvo El[Página cadastros] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bUCcU0 — ButtonClicked em El[Icon A]
1. **ResetGroup** [bUCcV0] alvo El[gp busca cliente]

#### WF bUCcZ0 — ButtonClicked em El[btn edita endereço cliente]
1. **ShowElement** [bUCca0] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bUCcb0] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Edita Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"}, 1={value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"}}

#### WF bUCcf0 — ButtonClicked em El[btn novo endereço cliente]
1. **ShowElement** [bUCcg0] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bUCch0] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Novo Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=El[gp cadastros]:get_group_data, custom_state="custom.var_qualgrupoclifor_"}, 1={value=True, custom_state="custom.var_destravarcampos_"}}

#### WF bUCcl0 — ButtonClicked em El[btn novo cliente]
1. **ShowElement** [bUCcm0] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bUCcn0] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Novo Cliente, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=True, custom_state="custom.var_destravarcampos_"}}

#### WF bUCcr0 — ButtonClicked em El[btn novo fornecedor]
1. **ShowElement** [bUCcs0] alvo El[pop.AddEditaEndereço A]
2. **SetCustomState** [bUCct0] alvo El[pop.AddEditaEndereço A] · value=Opt.AçãoCliFor.Novo Fornecedor, custom_state="custom.var_a__oclifor_"

#### WF bUCcx0 — ButtonClicked em El[gp carteira]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCcy0] alvo El[Página cadastros] · value=Ancestor[TableCrossAxis], custom_state="custom.var_cliforselecionado_"

#### WF bUCcz0 — ButtonClicked em El[gp carteira]
- condição: El[Página cadastros]:custom.var_cliforselecionado_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bUCdD0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCdE0 — ButtonClicked em El[btn novo contato]
1. **ShowElement** [bUCdF0] alvo El[pop.AddEditaContato A]
2. **DisplayGroupData** [bUCdJ0] alvo El[pop.AddEditaContato A] · data_source=El[gp cadastros]:get_group_data
3. **SetCustomState** [bUCdK0] alvo El[pop.AddEditaContato A] · value=Opt.AçãoCliFor.Novo Contato Cliente, custom_state="custom.var_a__oclifor_"

#### WF bUCdL0 — ButtonClicked em El[btn edita contato cliente]
1. **ShowElement** [bUCdP0] alvo El[pop.AddEditaContato A]
2. **DisplayGroupData** [bUCdQ0] alvo El[pop.AddEditaContato A] · data_source=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor
3. **SetCustomState** [bUCdR0] alvo El[pop.AddEditaContato A] · value=Opt.AçãoCliFor.Edita Contato Cliente, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualcontato_"}}

#### WF bUCdV0 — SEM_TIPO

#### WF bUCdW0 — Plugin[1753734310015x839297739754045400]/AAR em El[IconToggle(MultiState) B]
1. **SetCustomState** [bUCdX0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCdb0 — Plugin[1753734310015x839297739754045400]/AAR em El[icontoggle sort]
1. **SetCustomState** [bUCdc0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCdd0 — InputChanged em El[rad tipo clifor]
1. **SetCustomState** [bUCdh0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCdn0 — ButtonClicked em El[Icon C]
1. **ShowElement** [bUCdo0] alvo El[pop.AnexosClifor A]
2. **SetCustomState** [bUCdp0] alvo El[pop.AnexosClifor A] · value=Parent, custom_state="custom.var_qualclifor_", custom_states_values={0={value=Opt.TipoAnexo.Alvará de Funcionamento, custom_state="custom.var_tipoanexo_"}}

#### WF bUCdt0 — ButtonClicked em El[Icon B]
1. **ShowElement** [bUCdu0] alvo El[pop.HistoricoConversas A]
2. **DisplayGroupData** [bUCdv0] alvo El[pop.HistoricoConversas A] · data_source=Parent

#### WF bUCdz0 — ButtonClicked em El[Icon E]
1. **SetCustomState** [bUCeA0] alvo El[Página cadastros] · custom_state="custom.var_cliforselecionado_"

#### WF bUCeB0 — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch enderecos]
1. **ChangeThing** [bUCeF0] campos: cpo.Ativo = This:get_AAI · to_change=Ancestor[TableCrossAxis]

#### WF bUCeG0 — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch contatos]
1. **ChangeThing** [bUCeH0] campos: cpo.Ativo = This:get_AAI · to_change=Ancestor[TableCrossAxis]

#### WF bUCeL0 — ButtonClicked em El[gp nomeclifor]

#### WF bUCeM0 — ButtonClicked em El[bt bloquear grupo]
1. **ShowElement** [bUCeN0] alvo El[pop.BloquearClifor A]
2. **DisplayGroupData** [bUCeR0] alvo El[pop.BloquearClifor A] · data_source=Parent
