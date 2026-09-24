# Reusable: `pop.ConfigSistema` (bToDT0)


Resumo: 204 elementos · 14 workflows · 16 ações · 19 condicionais · 0 estados customizados
Elementos por tipo: Text 50, TableCell 36, Group 29, Icon 23, TableMainAxis 18, TableCrossAxis 10, Input 7, Plugin[1498171554228x105618760361836540]/AAC 7, select2-MultiDropdown 7, Table 5, Button 4, CustomElement 2, Plugin[1680110374647x249108010620944400]/AAC 2, RepeatingGroup 1, Image 1, Dropdown 1, HTML 1

## Árvore de elementos

- **CustomElement** `pop.RespostasEmails A` (bUCGq) — USA Reusable pop.RespostasEmails · props: floating_reference="top", custom_id="bUBss", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.CadastroUsuarios A` (bTqCV) — USA Reusable pop.CadastroUsuarios · props: custom_id="bTgiN"
- **Group** `TITULO` (bToEi0) — props: group_type="user", vertical_centering=True
  - **Group** `Group C` (bToEn0) — props: vertical_centering=True
    - **Text** `Text C` (bToEo0) — text: "Configurações do Sistema" · props: font_alignment="center"
  - **Icon** `Icon A` (bToEj0) — props: icon="material outlined close", vertical_centering=True
- **Group** `NIVEIS VENDEDORES` (bTpwb) — props: group_type="user", vertical_centering=True
  - **Group** `gp toggle rpgemails` (bTpwd) — props: vertical_centering=True
    - **Icon** `Icon L` (bTquf) — props: icon="material outlined support_agent", vertical_centering=True
    - **Text** `Text F` (bTpwh) — text: "Niveis de vendedor"
    - **Icon** `Icon J` (bTpwi) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
      - ⟂ quando El[rpg NiveisVendedor]:is_visible → icon="material outlined keyboard_arrow_up"
  - **Button** `Button A` (bTqAw) — oculto ao carregar · text: "Novo Nível" · props: icon="material outlined add", vertical_centering=True, icon_size=16, button_type="label_icon", button_horiz_alignment="flex-end"
  - **Table** `rpg NiveisVendedor` (bTpwj) — oculto ao carregar · data_source: Search(Tbl.NiveisVendedores; sort cpo.Ordem) · props: group_type="custom.tbl_niveisvendedores", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_bTHGr_default)", horizontal_separator_color="var(--color_bTHGr_default)"
    - **TableMainAxis** `Column C` (bTpxR) — props: axis_index=6
    - **TableMainAxis** `Column E` (bTpyZ) — props: axis_index=7
    - **TableMainAxis** `Column F` (bTqBb) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis E` (bTpwn) — props: axis_index=0
    - **TableCrossAxis** `TableCrossAxis D` (bTpwo) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell G` (bTpxX) — props: cell_main_axis_id="bTpxR"
        - **Text** `Text I` (bTpzn) — text: "Comissão meta batida"
      - **TableCell** `Cell K` (bTpyf) — props: cell_main_axis_id="bTpyZ"
        - **Text** `Text O` (bTqAB) — text: "Qtd p/ subir nível"
      - **TableCell** `Cell M` (bTqBh) — props: cell_main_axis_id="bTqBb"
      - **TableCell** `Cell F` (bTpwp) — props: cell_main_axis_id="bTpwn"
        - **Text** `Text F` (bTpwt) — text: "Nome"
      - **TableCell** `Cell F` (bTpwu) — props: cell_main_axis_id="bTpxM"
        - **Text** `Text F` (bTpwz) — text: "Meta venda"
      - **TableCell** `Cell O` (bTqXR) — props: cell_main_axis_id="bTqXL"
        - **Text** `Text P` (bTqXW) — text: "Comissão padrão"
    - **TableCrossAxis** `TableCrossAxis D` (bTpxB) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell H` (bTpxd) — props: cell_main_axis_id="bTpxR"
        - **Input** `Input C` (bTqAS) — placeholder: "0,000%" · content: "{Ancestor[TableCrossAxis]:cpo.NomeNivel}" · auto_binding: True · content_format: "percentage" · props: font_alignment="right", vertical_centering=True, bind_field="cpo_metabonus_number", decimal_place=3, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando This:is_hovered:or_(This:is_focused) → bgcolor="var(--color_bTHGh_default)"
          - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
      - **TableCell** `Cell L` (bTpyl) — props: cell_main_axis_id="bTpyZ"
        - **Input** `Input E` (bTqAj) — placeholder: "00" · content: "{Ancestor[TableCrossAxis]:cpo.NomeNivel}" · auto_binding: True · content_format: "int_number" · props: font_alignment="right", vertical_centering=True, bind_field="cpo_mediasobenivel_number", currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando This:is_hovered:or_(This:is_focused) → bgcolor="var(--color_bTHGh_default)"
          - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
      - **TableCell** `Cell N` (bTqBn) — props: cell_main_axis_id="bTqBb"
        - **RepeatingGroup** `rpg vendedores do nivel` (bTqCF) — data_source: Search(User: cpo.QualNivelVendedor equals Ancestor[TableCrossAxis] AND cpo.Ativo equals True) · props: group_type="user", rows=1, separator_style="none", fixed_columns=False, show_all_items=True, cell_min_width_css="35px"
          - **Image** `Image A` (bTqCL) — props: stretch_or_rescale="zoom", src="{Parent:cpo.Foto}", title_attribute="{Parent:cpo.NomeModelo:to_uppercase}"
        - **Icon** `Icon K` (bTqnr) — props: icon="phosphor fill users-three", vertical_centering=True
          - ⟂ quando El[rpg vendedores do nivel]:get_list_data:count:greater_or_equal_than(1) → is_visible=False
          - ⟂ quando El[rpg vendedores do nivel]:get_list_data:count:less_than(1) → is_visible=True
      - **TableCell** `Cell F` (bTpxF) — props: cell_main_axis_id="bTpwn"
        - **Input** `Input A` (bTpzh) — placeholder: "Nome do nível" · content: "{Ancestor[TableCrossAxis]:cpo.NomeNivel}" · auto_binding: True · props: vertical_centering=True, bind_field="cpo_nomenivel_text", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando This:is_hovered:or_(This:is_focused) → bgcolor="var(--color_bTHGh_default)"
          - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
      - **TableCell** `Cell F` (bTpxH) — props: cell_main_axis_id="bTpxM"
        - **Input** `Input B` (bTqAL) — placeholder: "R$ 0,00" · content: "{Ancestor[TableCrossAxis]:cpo.NomeNivel}" · auto_binding: True · content_format: "currency" · props: font_alignment="right", vertical_centering=True, bind_field="cpo_metavenda_number", currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando This:is_hovered:or_(This:is_focused) → bgcolor="var(--color_bTHGh_default)"
          - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
      - **TableCell** `Cell P` (bTqXb) — props: cell_main_axis_id="bTqXL"
        - **Input** `Input F` (bTqXd) — placeholder: "0,000%" · content: "{Ancestor[TableCrossAxis]:cpo.NomeNivel}" · auto_binding: True · content_format: "percentage" · props: font_alignment="right", vertical_centering=True, bind_field="cpo_fatorpremiacao_number", decimal_place=3, placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando This:is_hovered:or_(This:is_focused) → bgcolor="var(--color_bTHGh_default)"
          - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
    - **TableMainAxis** `Column D` (bTpxM) — props: axis_index=1
    - **TableMainAxis** `Column E copy` (bTqXL) — props: axis_index=5
- **Group** `ACESSO A MODULOS` (bToDV0) — props: vertical_centering=True
  - **Group** `gp toggle rpgmodulos` (bToQh) — props: vertical_centering=True
    - **Icon** `Icon M` (bTqul) — props: icon="material outlined menu", vertical_centering=True
    - **Text** `Text A` (bToDZ0) — text: "Acesso aos módulos do sistema"
    - **Icon** `Icon G` (bToQb) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
      - ⟂ quando El[rpg acessomodulos]:is_visible → icon="material outlined keyboard_arrow_up"
  - **Table** `rpg acessomodulos` (bToGJ0) — oculto ao carregar · data_source: Search(Tbl.ConfigSistema: cpo.NomeConfig equals "Permissões de acesso às páginas{∅}"; sort cpo.CodigoConfig) · props: group_type="custom.cpo_configsistema", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_bTHGr_default)", horizontal_separator_color="var(--color_bTHGr_default)"
    - **TableMainAxis** `TableMainAxis A` (bToHF0) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis A` (bToHJ0) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis A` (bToHK0) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis A` (bToHL0) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell A` (bToHP0) — props: cell_main_axis_id="bToHF0"
        - **Text** `Text B` (bToHd0) — text: "Módulos do sistema"
      - **TableCell** `Cell A` (bToHQ0) — props: cell_main_axis_id="bToHJ0"
        - **Text** `Text J` (bToIN0) — text: "Quais departamentos"
        - **Icon** `Icon B` (bToIw0) — props: icon="material regular help", vertical_centering=True, unique_id="quaisdepartamentos"
        - **Plugin[1498171554228x105618760361836540]/AAC** `tip departamento` (bToKh0) — props: AAE="Indique os departamentos que terão acesso aos módulos. ⏎⏎Todos usuários do departamento terão acesso.", AAJ=False, AAN="quaisdepartamentos", ABS=True, ABT="var(--color_bTHGh_default)", ABU="var(--color_bTHGn_default)", ABV="var(--color_bTHGn_default)", ABZ="13", ABa="Lato", ABp="1"
      - **TableCell** `Cell A` (bToHR0) — props: cell_main_axis_id="bToHK0"
        - **Text** `Text K` (bToIX0) — text: "Quais perfis"
        - **Icon** `Icon C` (bToJC0) — props: icon="material regular help", vertical_centering=True, unique_id="quaisperfis"
        - **Plugin[1498171554228x105618760361836540]/AAC** `tip perfil` (bToKb0) — props: AAE="Indique os perfis que terão acesso aos módulos. ⏎⏎Todos usuários do perfil terão acesso.", AAJ=False, AAN="quaisperfis", ABS=True, ABT="var(--color_bTHGh_default)", ABU="var(--color_bTHGn_default)", ABV="var(--color_bTHGn_default)", ABZ="13", ABa="Lato", ABp="1"
      - **TableCell** `Cell B` (bToHp0) — props: cell_main_axis_id="bToHj0"
        - **Text** `Text L` (bToIe0) — text: "Quais usuários"
        - **Icon** `Icon D` (bToJP0) — props: icon="material regular help", vertical_centering=True, unique_id="quaisusuarios"
        - **Plugin[1498171554228x105618760361836540]/AAC** `tip usuario` (bToJZ0) — props: AAE="Indique usuários específicos que não fazem parte dos departamentos ou perfis já indicados.", AAJ=False, AAN="quaisusuarios", ABS=True, ABT="var(--color_bTHGh_default)", ABU="var(--color_bTHGn_default)", ABV="var(--color_bTHGn_default)", ABZ="13", ABa="Lato", ABp="1"
    - **TableCrossAxis** `TableCrossAxis A` (bToHV0) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bToHW0) — props: cell_main_axis_id="bToHF0"
        - **Text** `Text M` (bToJf0) — text: "{Ancestor[TableCrossAxis]:cpo.QualPagina:display}"
      - **TableCell** `Cell A` (bToHX0) — props: cell_main_axis_id="bToHJ0"
        - **select2-MultiDropdown** `Multidropdown A` (bToJl0) — data_source: All(Opt.DeptoUsuario) · placeholder: "Selecione vários" · auto_binding: True · props: bind_field="cpo_quaisdeptos_list_option_opt_deptousuario", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_deptousuario", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
      - **TableCell** `Cell A` (bToHb0) — props: cell_main_axis_id="bToHK0"
        - **select2-MultiDropdown** `Multidropdown B` (bToJr0) — data_source: All(Opt.PerfilUsuario) · placeholder: "Selecione vários" · auto_binding: True · props: bind_field="cpo_quaisperfis_list_option_opt_perfilusuario", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_perfilusuario", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
      - **TableCell** `Cell C` (bToHv0) — props: cell_main_axis_id="bToHj0"
        - **select2-MultiDropdown** `Multidropdown C` (bToJy0) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualPerfil not in Ancestor[TableCrossAxis]:cpo.QuaisPerfis AND cpo.QualDepto not in Ancestor[TableCrossAxis]:cpo.QuaisDeptos; sort cpo.NomeModelo) · placeholder: "Selecione vários" · auto_binding: True · props: bind_field="cpo_quaisusuarios_list_user", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="user", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", option_display_expression="{Text("{InjectedValue:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words} {InjectedValue:cpo.NomeModelo:split_by(separator=" "):last_element:truncated(1):to_capitalized_words} ({InjectedValue:cpo.QualDepto:display} / {InjectedValue:cpo.QualPerfil:display})")}"
    - **TableMainAxis** `Column D` (bToHj0) — props: axis_index=3
- **Group** `ACESSO A CONFIGURACOES` (bToPP0) — props: vertical_centering=True
  - **Group** `gp toggle rpgconfig` (bToRL) — props: vertical_centering=True
    - **Icon** `Icon N` (bTqus) — props: icon="material outlined settings", vertical_centering=True
    - **Text** `Text G` (bToRN) — text: "Acesso às configurações do sistema"
    - **Icon** `Icon H` (bToRR) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
      - ⟂ quando El[rpg acessoconfig]:is_visible → icon="material outlined keyboard_arrow_up"
  - **Table** `rpg acessoconfig` (bToPZ0) — oculto ao carregar · data_source: Search(Tbl.ConfigSistema: cpo.NomeConfig equals "Permissão de acesso às configurações{∅}"; sort cpo.CodigoConfig) · props: group_type="custom.cpo_configsistema", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_bTHGr_default)", horizontal_separator_color="var(--color_bTHGr_default)"
    - **TableMainAxis** `TableMainAxis D` (bToPa0) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis D` (bToPb0) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis D` (bToPf0) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis C` (bToPg0) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell E` (bToPh0) — props: cell_main_axis_id="bToPa0"
        - **Text** `Text E` (bToPl0) — text: "Cadastro/Configuração"
      - **TableCell** `Cell E` (bToPm0) — props: cell_main_axis_id="bToPb0"
        - **Text** `Text E` (bToPn0) — text: "Quais departamentos"
        - **Icon** `Icon F` (bToPr0) — props: icon="material regular help", vertical_centering=True, unique_id="configdepartamentos"
        - **Plugin[1498171554228x105618760361836540]/AAC** `tip departamento` (bToSD) — props: AAE="Indique os departamentos que terão acesso aos módulos. ⏎⏎Todos usuários do departamento terão acesso.", AAJ=False, AAN="configdepartamentos", ABS=True, ABT="var(--color_bTHGh_default)", ABU="var(--color_bTHGn_default)", ABV="var(--color_bTHGn_default)", ABZ="13", ABa="Lato", ABp="1"
      - **TableCell** `Cell E` (bToPs0) — props: cell_main_axis_id="bToPf0"
        - **Text** `Text E` (bToPt0) — text: "Quais perfis"
        - **Icon** `Icon F` (bToPx0) — props: icon="material regular help", vertical_centering=True, unique_id="configperfis"
        - **Plugin[1498171554228x105618760361836540]/AAC** `tip perfil` (bToSJ) — props: AAE="Indique os perfis que terão acesso aos módulos. ⏎⏎Todos usuários do perfil terão acesso.", AAJ=False, AAN="configperfis", ABS=True, ABT="var(--color_bTHGh_default)", ABU="var(--color_bTHGn_default)", ABV="var(--color_bTHGn_default)", ABZ="13", ABa="Lato", ABp="1"
      - **TableCell** `Cell E` (bToPy0) — props: cell_main_axis_id="bToQW0"
        - **Text** `Text E` (bToPz0) — text: "Quais usuários"
        - **Icon** `Icon F` (bToQD0) — props: icon="material regular help", vertical_centering=True, unique_id="configusuarios"
        - **Plugin[1498171554228x105618760361836540]/AAC** `tip usuario` (bToSP) — props: AAE="Indique usuários específicos que não fazem parte dos departamentos ou perfis já indicados.", AAJ=False, AAN="configusuarios", ABS=True, ABT="var(--color_bTHGh_default)", ABU="var(--color_bTHGn_default)", ABV="var(--color_bTHGn_default)", ABZ="13", ABa="Lato", ABp="1"
    - **TableCrossAxis** `TableCrossAxis C` (bToQE0) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell E` (bToQF0) — props: cell_main_axis_id="bToPa0"
        - **Text** `Text E` (bToQJ0) — text: "{Ancestor[TableCrossAxis]:cpo.QualMenuConfig:display}"
      - **TableCell** `Cell E` (bToQK0) — props: cell_main_axis_id="bToPb0"
        - **select2-MultiDropdown** `Multidropdown E` (bToQL0) — data_source: All(Opt.DeptoUsuario) · placeholder: "Selecione vários" · auto_binding: True · props: bind_field="cpo_quaisdeptos_list_option_opt_deptousuario", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_deptousuario", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
      - **TableCell** `Cell E` (bToQP0) — props: cell_main_axis_id="bToPf0"
        - **select2-MultiDropdown** `Multidropdown E` (bToQQ0) — data_source: All(Opt.PerfilUsuario) · placeholder: "Selecione vários" · auto_binding: True · props: bind_field="cpo_quaisperfis_list_option_opt_perfilusuario", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_perfilusuario", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
      - **TableCell** `Cell E` (bToQR0) — props: cell_main_axis_id="bToQW0"
        - **select2-MultiDropdown** `Multidropdown E` (bToQV0) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualPerfil not in Ancestor[TableCrossAxis]:cpo.QuaisPerfis AND cpo.QualDepto not in Ancestor[TableCrossAxis]:cpo.QuaisDeptos; sort cpo.NomeModelo) · placeholder: "Selecione vários" · auto_binding: True · props: bind_field="cpo_quaisusuarios_list_user", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="user", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", option_display_expression="{Text("{InjectedValue:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words} {InjectedValue:cpo.NomeModelo:split_by(separator=" "):last_element:truncated(1):to_capitalized_words} ({InjectedValue:cpo.QualDepto:display} / {InjectedValue:cpo.QualPerfil:display})")}"
    - **TableMainAxis** `Column D` (bToQW0) — props: axis_index=3
- **Group** `COPIA DE EMAILS` (bToEu0) — props: group_type="user", vertical_centering=True
  - **Group** `gp toggle rpgemails` (bToRT) — props: vertical_centering=True
    - **Icon** `Icon O` (bTquz) — props: icon="material outlined alternate_email", vertical_centering=True
    - **Text** `Text H` (bToRY) — text: "Definir cópia oculta de emails"
    - **Icon** `Icon I` (bToRZ) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
      - ⟂ quando El[rpg copiaemails]:is_visible → icon="material outlined keyboard_arrow_up"
  - **Table** `rpg copiaemails` (bToNR0) — oculto ao carregar · data_source: Search(Tbl.ConfigSistema: cpo.QualGrupoConfig equals Opt.GrupoDeConfigsSistema.Cópia de emails; sort cpo.CodigoConfig desc) · props: group_type="custom.cpo_configsistema", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_bTHGr_default)", horizontal_separator_color="var(--color_bTHGr_default)"
    - **TableMainAxis** `TableMainAxis C` (bToNW0) — props: axis_index=0
    - **TableCrossAxis** `TableCrossAxis B` (bToNc0) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell D` (bToNd0) — props: cell_main_axis_id="bToNW0"
        - **Text** `Text D` (bToNh0) — text: "Envio automático de emails"
      - **TableCell** `Cell D` (bToNu0) — props: cell_main_axis_id="bToOS0"
        - **Text** `Text D` (bToNv0) — text: "Quais usuários"
        - **Icon** `Icon E` (bToNz0) — props: icon="material regular help", vertical_centering=True, unique_id="quaisemails"
        - **Plugin[1498171554228x105618760361836540]/AAC** `tip quaisemails` (bToOX0) — props: AAE="Indique quais usuários devem receber copia dos emails no momento do envio automático", AAJ=False, AAN="quaisemails", ABS=True, ABT="var(--color_bTHGh_default)", ABU="var(--color_bTHGn_default)", ABV="var(--color_bTHGn_default)", ABZ="13", ABa="Lato", ABp="1"
    - **TableCrossAxis** `TableCrossAxis B` (bToOA0) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell D` (bToOB0) — props: cell_main_axis_id="bToNW0"
        - **Text** `Text D` (bToOF0) — text: "{Ancestor[TableCrossAxis]:cpo.NomeConfig}"
      - **TableCell** `Cell D` (bToON0) — props: cell_main_axis_id="bToOS0"
        - **select2-MultiDropdown** `Multidropdown D` (bToOR0) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualPerfil not in Ancestor[TableCrossAxis]:cpo.QuaisPerfis AND cpo.QualDepto not in Ancestor[TableCrossAxis]:cpo.QuaisDeptos; sort cpo.NomeModelo) · placeholder: "Selecione vários" · auto_binding: True · props: bind_field="cpo_quaisusuarios_list_user", tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="user", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", option_display_expression="{Text("{InjectedValue:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words} {InjectedValue:cpo.NomeModelo:split_by(separator=" "):last_element:truncated(1):to_capitalized_words} ({InjectedValue:cpo.EmailContato})")}"
    - **TableMainAxis** `Column D` (bToOS0) — props: axis_index=3
- **Group** `CONTROLE RECIBOS` (bTxzT0) — data_source: Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 17):first_element · props: group_type="custom.cpo_configsistema", vertical_centering=True
  - **Group** `gp toggle rpgemails` (bTxzV0) — data_source: Parent · props: group_type="custom.cpo_configsistema", vertical_centering=True
    - **Icon** `Icon P` (bTxzb0) — props: icon="phosphor outlined numpad", vertical_centering=True
    - **Text** `Text Q` (bTxzZ0) — text: "Númeração de recibos: "
    - **Input** `Input G` (bTyAK0) — placeholder: "" · content: Parent:cpo.ValorNumero · auto_binding: True · content_format: "int_number" · props: mandatory=True, vertical_centering=True, bind_field="cpo_contadorrecibosrecebimento_number"
- **Group** `RESPOSTAS EMAILS` (bUCFJ) — props: group_type="user", vertical_centering=True
  - **Group** `gp toggle rpgemails` (bUCFL) — props: vertical_centering=True
    - **Icon** `Icon V` (bUCFR) — props: icon="material outlined mark_email_unread", vertical_centering=True
    - **Text** `Text W` (bUCFP) — text: "Emails e respostas (Gmail)"
    - **Icon** `Icon V` (bUCFQ) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
      - ⟂ quando El[rpg RespostasEmails]:is_visible → icon="material outlined keyboard_arrow_up"
  - **Group** `gp show emails` (bUCOV) — oculto ao carregar · data_source: Parent · props: group_type="user", vertical_centering=True
    - **Table** `rpg RespostasEmails` (bUCFV) — data_source: API({"params_q": {"entries": {"0": "", "1": {"next": {"next": {"type": "Message", "name": "labels", "is_slidable": false}, "type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bUCFj"}, "type": "GetElement", "is_slidable": false}, "2": ""}, "type": "TextExpression"}):_api_c2_messages · props: group_type="api.apiconnector2.bUCHx.bUCHy.messages", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
      - **TableMainAxis** `TableMainAxis G` (bUCFb) — props: axis_index=0
      - **TableCrossAxis** `TableCrossAxis E` (bUCFc) — props: axis_index=0, make_sticky=True
        - **TableCell** `Cell I` (bUCFi) — props: cell_main_axis_id="bUCFb"
          - **Text** `Text V` (bUCTl) — text: "Filtro de emails"
          - **Dropdown** `Dd filtro emails` (bUCFj) — data_source: All(Opt.FiltrosGmail) · placeholder: "Selecione" · props: default=Opt.FiltrosGmail.Caixa de saída, dynamic_type="option.opt_filtrosgmail", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
        - **TableCell** `Cell J` (bUCPq) — props: cell_main_axis_id="bUCPk", cell_cross_axis_index=0
      - **TableCrossAxis** `TableCrossAxis E` (bUCFn) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=10
        - **TableCell** `Cell I` (bUCFv) — props: cell_main_axis_id="bUCFb"
          - **Text** `Text W` (bUCGB) — text: "{API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_labelIds}"
          - **Group** `Group T` (bUCOJ) — props: vertical_centering=True
            - **Text** `Text W` (bUCGA) — text: "[b]Data/Hora: [/b]"
            - **Text** `Text FZ` (bUCOD) — text: "{Text("{Date(10800000):plus_seconds(API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_internalDate:convert_to_number:divide(1000)):plus_hours(-3)}")}"
          - **Text** `Text GZ` (bUCOj) — text: "[b]De[/b]: {Text("{API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_payload.headers:filtered(constraints={0={key="_api_c2_name", value="From{∅}", constraint_type="equals"}}):_api_c2_value}")}"
          - **Text** `Text KZ` (bUCRc) — text: "[b]Para[/b]: {Text("{API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_payload.headers:filtered(constraints={0={key="_api_c2_name", value="To{∅}", constraint_type="equals"}}):_api_c2_value}")}"
          - **Text** `Text HZ` (bUCOp) — text: "[b]Cc[/b]: {Text("{API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_payload.headers:filtered(constraints={0={key="_api_c2_name", value="Cc{∅}", constraint_type="equals"}}):_api_c2_value}")}"
          - **Text** `Text IZ` (bUCOv) — text: "[b]Cco[/b]: {Text("{API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_payload.headers:filtered(constraints={0={key="_api_c2_name", value="Cco{∅}", constraint_type="equals"}}):_api_c2_value}")}"
          - **Text** `Text JZ` (bUCRW) — text: "[b]Assunto[/b]:  {Text("{API({"provider": "apiconnector2.bUCHx.bUCIK", "url_params_id": {"entries": {"0": {"next": {"type": "Message", "name": "_api_c2_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type": "TextExpression"}, ):_api_c2_payload.headers:filtered(constraints={0={key="_api_c2_name", value="Subject{∅}", constraint_type="equals"}}):_api_c2_value}")}"
          - **Text** `Text U` (bUCTZ) — text: "[b]Codigo[/b]:  {Text("{Ancestor[TableCrossAxis]:_api_c2_id}")}"
        - **TableCell** `Cell Q` (bUCPw) — props: cell_main_axis_id="bUCPk", cell_cross_axis_index=1
          - **HTML** `HTML B` (bUCQB) — html(2673 chars) · props: vertical_centering=True
      - **TableMainAxis** `Column F copy 2` (bUCPk) — props: axis_index=2
    - **Group** `gp dados token` (bUCNm) — data_source: Parent · props: group_type="user", vertical_centering=True
      - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → is_visible=True
      - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → is_visible=False
      - **Group** `Group X` (bUCNT) — data_source: Parent · props: group_type="user", vertical_centering=True
        - **Group** `Group S` (bUCMH) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Text** `Text X` (bUCHD) — text: "Login code: "
          - **Text** `Text BZ` (bUCMB) — text: "{Text("{UrlParam("code" as None)}")}"
        - **Group** `Group U` (bUCMY) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Text** `Text CZ` (bUCMS) — text: "Token Data/Hora: "
          - **Text** `Text Y` (bUCHn) — text: "{Text("{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 21):first_element:cpo.ValorDataHora1:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}")}"
        - **Group** `Group V` (bUCMq) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Text** `Text DZ` (bUCMj) — text: "Token Expires in: "
          - **Text** `Text AZ` (bUCLn) — text: "{Text("{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 21):first_element:cpo.ValorDataHora2:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}")}"
        - **Group** `Group W` (bUCNI) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Text** `Text EZ` (bUCNB) — text: "Access Token: "
          - **Text** `Text Z` (bUCLh) — text: "{Text("{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 21):first_element:cpo.ValorTexto1}")}"
        - **Group** `Group AZ` (bUCSL) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Text** `Text MZ` (bUCSN) — text: "Refresh Token: "
          - **Text** `Text MZ` (bUCSR) — text: "{Text("{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 21):first_element:cpo.ValorTexto2}")}"
      - **Group** `Group R` (bUCKl) — props: vertical_centering=True
        - **Button** `Button D` (bUCJB) — text: "Limpar Token" · props: icon="fa fa-eraser", icon_size=14, button_gap=6, button_type="label_icon", button_horiz_alignment="center"
        - **Button** `Button B` (bUCGN) — oculto ao carregar · text: "Login Aba" · props: icon="fa fa-google", vertical_centering=True, icon_size=14, button_gap=6, button_type="label_icon", button_horiz_alignment="center"
        - **Button** `Button C` (bUCRo) — text: "Login Popup" · props: icon="fa fa-google", vertical_centering=True, icon_size=14, button_gap=6, button_type="label_icon", button_horiz_alignment="center"
- **Group** `CONTROLE EMAILS` (bUBlp) — data_source: Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 19):first_element · props: group_type="custom.cpo_configsistema", vertical_centering=True
  - **Group** `Group N` (bUBnR) — data_source: Parent · props: group_type="custom.cpo_configsistema", vertical_centering=True
    - **Group** `gp toggle rpgemails` (bUBlr) — data_source: Parent · props: group_type="custom.cpo_configsistema", vertical_centering=True
      - **Icon** `Icon Q` (bUBlw) — props: icon="material regular mark_email_read", vertical_centering=True
      - **Text** `Text N` (bUBlv) — text: "Qtd e-mails do dia:"
      - **Input** `Input D` (bUBlx) — placeholder: "" · content: Parent:cpo.ValorNumero · auto_binding: True · content_format: "int_number" · props: mandatory=True, vertical_centering=True, disabled=True, bind_field="cpo_contadorrecibosrecebimento_number"
    - **Group** `gp toggle rpgemails copy 3` (bUBmx) — data_source: Parent · props: group_type="custom.cpo_configsistema", vertical_centering=True
      - **Icon** `Icon S` (bUBnD) — props: icon="material outlined 10k", vertical_centering=True
      - **Text** `Text T` (bUBmz) — text: "Fazer contagem diária:"
      - **Plugin[1680110374647x249108010620944400]/AAC** `tgg contagem diária` (bUBnE) — props: AAD=Parent:cpo.ValorBoolean2, AAH="var(--color_primary_default)", AAP=0, AAR=0
      - **Text** `Text T` (bUBnF) — text: "{Text("{Parent:cpo.ValorBoolean2:format_boolean(formatting_for_true="SIM", formatting_for_false="NÃO")}")}"
    - **Group** `gp toggle rpgemails copy 2` (bUBmC) — data_source: Parent · props: group_type="custom.cpo_configsistema", vertical_centering=True
      - **Icon** `Icon R` (bUBmI) — props: icon="material outlined markunread_mailbox", vertical_centering=True
      - **Text** `Text R` (bUBmH) — text: "SMPT próprio:"
      - **Plugin[1680110374647x249108010620944400]/AAC** `tgg smtp proprio` (bUBmO) — props: AAD=Parent:cpo.ValorBoolean1, AAH="var(--color_primary_default)", AAP=0, AAR=0
      - **Text** `Text S` (bUBmU) — text: "{Text("{Parent:cpo.ValorBoolean1:format_boolean(formatting_for_true="SIM", formatting_for_false="NÃO")}")}"

## Workflows

#### WF bToFx0 — ButtonClicked em El[Icon A]
1. **HideElement** [bToGB0] alvo El[Reusable pop.ConfigSistema]

#### WF bToQt — ButtonClicked em El[gp toggle rpgmodulos]
1. **ToggleElement** [bToQz] alvo El[rpg acessomodulos]

#### WF bToRe — ButtonClicked em El[gp toggle rpgconfig]
1. **ToggleElement** [bToRk] alvo El[rpg acessoconfig]

#### WF bToRl — ButtonClicked em El[gp toggle rpgemails]
1. **ToggleElement** [bToRr] alvo El[rpg copiaemails]

#### WF bTqBD — ButtonClicked em El[Button A]
1. **NewThing** [bTqBJ] tipo Tbl.NiveisVendedores · campos: cpo.Ordem = Search(Tbl.NiveisVendedores):cpo.Ordem:max:plus(1)

#### WF bTqBO — ButtonClicked em El[gp toggle rpgemails]
1. **ToggleElement** [bTqBU] alvo El[rpg NiveisVendedor]
2. **ToggleElement** [bTqBZ] alvo El[Button A]

#### WF bTqCz — ButtonClicked em El[Image A]
1. **ShowElement** [bTqDF] alvo El[pop.CadastroUsuarios A]

#### WF bTqnx — ButtonClicked em El[Icon K]
1. **ShowElement** [bTqoD] alvo El[pop.CadastroUsuarios A]

#### WF bUBoF — Plugin[1680110374647x249108010620944400]/AAJ em El[tgg contagem diária]
1. **ChangeThing** [bUBoL] campos: cpo.ValorBoolean2 = This:get_AAI · to_change=Parent
2. **ScheduleAPIEvent** [bUBoN] date=Page.Current Date/Time:plus_days(1):change_hours(0):change_minutes(0):change_seconds(0), api_event="bUBmh"

#### WF bUBoX — Plugin[1680110374647x249108010620944400]/AAJ em El[tgg smtp proprio]
1. **ChangeThing** [bUBod] campos: cpo.ValorBoolean1 = This:get_AAI · to_change=Parent

#### WF bUCGG — ButtonClicked em El[gp toggle rpgemails]
1. **ToggleElement** [bUCGL] alvo El[gp show emails]

#### WF bUCGT — ButtonClicked em El[Button B]
1. **OpenURL** [bUCHB] open_in_new_tab=True, url="https://accounts.google.com/o/oauth2/v2/auth?client_id=237739610628-gq88l0f7qcdois7mqj5o3q9te3i3mdt8.apps.googleusercontent.com&redirect_uri={Page.Website Home}{Page.Current Page Name}&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly&access_type=offline&prompt=select_account%20consent"

#### WF bUCJH — ButtonClicked em El[Button D]
1. **ChangeThing** [bUCJN] campos: cpo.ValorTexto1 = "{∅}"; cpo.ValorTexto2 = "{∅}"; cpo.ValorDataHora1 = ∅; cpo.ValorNumero = ∅; cpo.ValorDataHora2 = ∅ · to_change=Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 21):first_element

#### WF bUCRu — ButtonClicked em El[Button C]
1. **Plugin[1488796042609x768734193128308700]/AAg** [bUCSA] AAh="var url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=237739610628-gq88l0f7qcdois7mqj5o3q9te3i3mdt8.apps.googleusercontent.com&redirect_uri={Page.Website Home:contains("test"):format_boolean(formatting_for_true="https://grupomegabox.bubbleapps.io/version-test/loginrealizado", formatting_for_false="https://grupomegabox.bubbleapps.io/loginrealizado")}&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly&access_type=offline&prompt=select_account%20consent"; // Pode inserir dinamicamente pelo Bubble⏎var w = 600;⏎var h = 700;⏎var left = (screen.width/2)-(w/2);⏎var top = (screen.height/2)-(h/2);⏎⏎window.open(url, "GoogleLogin", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);"
