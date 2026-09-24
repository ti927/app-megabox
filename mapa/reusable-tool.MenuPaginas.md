# Reusable: `tool.MenuPaginas` (bTeRP)


Resumo: 64 elementos · 7 workflows · 15 ações · 11 condicionais · 0 estados customizados
Elementos por tipo: Text 21, Group 10, TableCell 10, Button 5, TableMainAxis 5, RepeatingGroup 3, TableCrossAxis 2, Popup 1, Input 1, Dropdown 1, Icon 1, FileInput 1, MultiLineInput 1, Table 1, Link 1

## Árvore de elementos

- **Popup** `pop bug report` (bTkgp2) — props: vertical_centering=True
  - **Group** `gp dados report` (bTkgv2) — oculto ao carregar · props: group_type="custom.cpo_bugreport"
    - **Group** `Group C` (bTkjp2) — data_source: Parent · props: group_type="custom.cpo_bugreport", vertical_centering=True
      - **Group** `Group B` (bTkjd2) — data_source: Parent · props: group_type="custom.cpo_bugreport", vertical_centering=True
        - **Group** `g Input` (bTkhG2) — data_source: Parent · props: group_type="custom.cpo_bugreport"
          - **Text** `Text A` (bTkhH2) — text: "Titulo"
          - **Input** `ipt titulo` (bTkhL2) — placeholder: "Breve descrição" · content: "{Parent:cpo.Titulo}" · props: limit_number_of_characters=True, mandatory=True, character_limit=75
        - **Group** `g Dropdown` (bTkhA2) — data_source: Parent · props: group_type="custom.cpo_bugreport"
          - **Text** `Text A` (bTkhB2) — text: "Local do sistema"
          - **Dropdown** `itp partesistema` (bTkhF2) — data_source: All(Opt.PartesDoSistema) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.ParteDoSistema, dynamic_type="option.opt_localdosistema", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
        - **Group** `g FileUploader` (bTkhS2) — data_source: Parent · props: group_type="custom.cpo_bugreport"
          - **Text** `Text A` (bTkhT2) — text: "Anexo"
          - **Group** `Group K` (bTkrr2) — data_source: Parent · props: group_type="custom.cpo_bugreport", vertical_centering=True
            - **Icon** `Icon G` (bTksV2) — props: icon="material outlined remove_red_eye", vertical_centering=True, button_disabled=True
              - ⟂ quando El[ipt anexo]:get_data:is_not_empty → icon_color="var(--color_primary_default)", button_disabled=False
            - **FileInput** `ipt anexo` (bTkhY2) — placeholder: "Imagem ou Video (máx 16mb)" · props: mandatory=True, font_alignment="left", src="{Parent:cpo.AnexoFile}", max_size=16
              - ⟂ quando This:get_data:is_empty → font_color="var(--color_bTHGl_default)"
              - ⟂ quando This:get_loading_status → placeholder="Carregando..."
            - **Text** `Text C` (bTkrl2) — oculto ao carregar · text: "[fa]spinner fa-pulse[/fa]" · props: font_alignment="center"
              - ⟂ quando El[ipt anexo]:get_loading_status → is_visible=True
      - **Group** `g MultilineInput` (bTkhM2) — data_source: Parent · props: group_type="custom.cpo_bugreport"
        - **Text** `Text A` (bTkhN2) — text: "Descrição"
        - **MultiLineInput** `ipt descricao` (bTkhR2) — placeholder: "Faça uma descrição detalhada de como o erro ocorreu. Apenas dizer o que é o erro não ajuda na solução." · content: "{Parent:cpo.Descricao}" · props: mandatory=True
    - **Group** `Group I` (bTkqS2) — data_source: Parent · props: group_type="custom.cpo_bugreport", vertical_centering=True
      - **Button** `Button C` (bTkhd2) — text: "Enviar" · props: icon="material outlined send", icon_size=16, button_type="label_icon"
        - ⟂ quando Parent:is_empty → is_visible=True
        - ⟂ quando Parent:is_not_empty → is_visible=False
      - **Button** `Button E` (bTkqM2) — text: "Cancela" · props: icon="material outlined close", icon_size=16, button_type="label_icon"
  - **Group** `gp lista reports` (bTkoB2) — props: group_type="api.appconnector.bTksj2_tbl.funilcartao", vertical_centering=True
    - **Button** `Button D` (bTkkd2) — text: "Novo Bug" · props: icon="fa fa-bug", vertical_centering=True, icon_size=16, button_type="label_icon"
    - **Table** `rpg listabugs` (bTkhf2) — data_source: API({"constraints": {"0": {"key": "cpo_qualpainel_custom_tbl_biblioteca", "value": {"entries": {"0": "1740600547953x148513321315991550", "1": {"type": "Empty"}}, "type": "TextExpression"}, "constraint_type": "equals"}}, "descending": true, "sort_field": "Created Date", "provider": "appconnector.bTksn2"}):results · props: group_type="api.appconnector.bTksj2_tbl.funilcartao", vertical_centering=True, unique_id="remodela"
      - **TableMainAxis** `TableMainAxis A` (bTkif2) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis A` (bTkih2) — props: axis_index=0, make_sticky=True
        - **TableCell** `Cell A` (bTkim2) — props: cell_main_axis_id="bTkif2"
          - **Text** `Text P` (bTlcW0) — text: "Detalhamento"
        - **TableCell** `Cell D` (bTklh2) — props: cell_main_axis_id="bTklb2"
          - **Text** `Text N` (bTlcK0) — text: "Status"
        - **TableCell** `Cell H` (bTkmc2) — props: cell_main_axis_id="bTkmW2"
          - **Text** `Text B` (bTlci0) — text: "Data/Usuário"
        - **TableCell** `Cell B` (bTlbZ0) — props: cell_main_axis_id="bTlbT0"
          - **Text** `Text M` (bTlcE0) — text: "Respostas"
        - **TableCell** `Cell K` (bTlgL) — props: cell_main_axis_id="bTlgF"
          - **Text** `Text T` (bTlgN) — text: "Anexos"
      - **TableCrossAxis** `TableCrossAxis A` (bTkir2) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell A` (bTkit2) — props: cell_main_axis_id="bTkif2"
          - **Text** `Text K` (bTknB2) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao:split_by(separator="|"):first_element}" · props: border_color_top="var(--color_bTHGz_default)", border_style_top="solid", border_color_left="var(--color_bTHGz_default)", border_style_left="solid", four_border_style=True, border_color_right="var(--color_bTHGz_default)", border_style_right="solid", border_color_bottom="var(--color_bTHGz_default)", border_style_bottom="solid", border_roundness_left=11, border_roundness_right=11
          - **Text** `Text J` (bTkmv2) — text: "{Ancestor[TableCrossAxis]:opt_nometarefa_text:to_capitalized_words}"
          - **Text** `Text S` (bTldG0) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao:split_by(separator="|"):specific_item(2)}"
        - **TableCell** `Cell E` (bTklr2) — props: cell_main_axis_id="bTklb2"
          - **Text** `Text E` (bTknN2) — text: ""
          - **Text** `Text F` (bTlbB0) — text: "{API({"constraints": {"0": {"key": "cpo_quaisatividades_list_custom_tbl_tarefas", "value": {"entries": {"0": {"next": {"type": "Message", "name": "_id", "is_slidable": false}, "properties": {"fetch_data": true, "ancestor_type": "TableCrossAxis"}, "type": "ElementAncestor", "is_slidable": false}}, "type":):results:first_element:cpo_nomeetapa_text}"
        - **TableCell** `Cell I` (bTkmj2) — props: cell_main_axis_id="bTkmW2"
          - **Text** `Text I` (bTkmp2) — text: "{Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
          - **Text** `Text L` (bTlby0) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao:split_by(separator="|"):last_element}"
        - **TableCell** `Cell C` (bTlbl0) — props: cell_main_axis_id="bTlbT0"
          - **Text** `Text H` (bTlbn0) — text: ""
          - **RepeatingGroup** `RepeatingGroup C` (bTlgw) — data_source: API({"constraints": {"0": {"key": "cpo_tipocomunicacaotexto_text", "value": {"entries": {"0": "Comentário", "1": {"type": "Empty"}}, "type": "TextExpression"}, "constraint_type": "equals"}, "1": {"key": "cpo_qualtarefa_custom_tbl_tarefas", "value": {"entries": {"0": {"next": {"type": "Message", "name": ):results · props: group_type="api.appconnector.bTksj2_tbl.comunicacao", separator_style="dotted", unique_id="remodela", fixed_rows=False, cell_min_height_css="35px"
            - **Text** `Text D` (bTlhB) — text: "{Parent:cpo_mensagem_text}⏎[size=1][b]{Parent:Created By:cpo_qualconsultor_custom_tbl_consultores1:cpo_pessoalnomesobrenome_text:to_capitalized_words}[/b][/size]"
        - **TableCell** `Cell L` (bTlgS) — props: cell_main_axis_id="bTlgF"
          - **RepeatingGroup** `RepeatingGroup B` (bTlgd) — data_source: Ancestor[TableCrossAxis]:cpo_quaisanexos_list_custom_tbl_ilustracoes · props: group_type="api.appconnector.bTksj2_tbl.anexos", separator_style="dotted", unique_id="remodela", fixed_rows=False, cell_min_height_css="35px"
            - **Text** `Text V` (bTlgj) — text: "{Parent:cpo_nomearquivo_text}"
          - **Text** `Text U` (bTlgX) — text: ""
      - **TableMainAxis** `TableMainAxis C` (bTklb2) — props: axis_index=5
      - **TableMainAxis** `TableMainAxis E` (bTkmW2) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis B` (bTlbT0) — props: axis_index=6
      - **TableMainAxis** `TableMainAxis G` (bTlgF) — props: axis_index=7
- **RepeatingGroup** `RepeatingGroup A` (bTeRW) — data_source: All(Opt.MenuPaginas):sorted(descending=False, sort_field="ordem"):minus_element(Opt.MenuPaginas.configura__es) · props: group_type="option.opt_menu", separator_style="none", fixed_rows=False, cell_min_height_css="45px"
  - **Link** `Link A` (bTeRX) — text: "{Parent:display}" · props: linktype="url", vertical_centering=True, url="{Page.Website Home}{Parent:p_gina}", link_disabled=True, four_border_style=True
    - ⟂ quando This:is_hovered → font_size=22
    - ⟂ quando Page.Current Page Name:equals(Parent:p_gina) → border_color_left="var(--color_primary_default)", border_style_left="solid", border_width_left=5
    - ⟂ quando Search(Tbl.ConfigSistema: cpo.QualPagina equals Parent):first_element:cpo.QuaisDeptos:contains(CurrentUser:cpo.QualDepto) → font_color="var(--color_bTHGs_default)", link_disabled=False
    - ⟂ quando Search(Tbl.ConfigSistema: cpo.QualPagina equals Parent):first_element:cpo.QuaisPerfis:contains(CurrentUser:cpo.QualPerfil) → font_color="var(--color_bTHGs_default)", link_disabled=False
    - ⟂ quando Search(Tbl.ConfigSistema: cpo.QualPagina equals Parent):first_element:cpo.QuaisUsuarios:contains(CurrentUser) → font_color="var(--color_bTHGs_default)", link_disabled=False
- **Button** `Button bugreport` (bTkgj2) — text: "Comunicar Bug" · props: icon="material outlined bug_report", button_type="label_icon"
- **Button** `Button A` (bTeRb) — text: "Logout" · props: icon="material outlined exit_to_app", button_type="label_icon"

## Workflows

#### WF bTeRd — ButtonClicked em El[Button A]
1. **LogOut** [bTeRi] 
2. **ChangePage** [bTeRj] alvo El[Página index]

#### WF bTlgp — ButtonClicked em El[Text V]
1. **OpenURL** [bTlgv] open_in_new_tab=True, url="{Parent:cpo_link_text}"

#### WF bTkoJ2 — ButtonClicked em El[Button C]
1. **apiconnector2-bTlZL0.bTlZQ0** [bTlae0] params_Anexo="{El[ipt anexo]:get_data:url}", params_Usuario="{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}", params_Descricao="{El[ipt descricao]:get_data}", params_Nomecartao="{El[ipt titulo]:get_data}", params_ParteSistema="{El[itp partesistema]:get_data:display}"
2. **ResetInputs** [bTkoT2] 
3. **HideElement** [bTkoU2] alvo El[gp dados report]
4. **ShowElement** [bTkrf2] alvo El[gp lista reports]
5. **apiconnector2-bTlZL0.bTleD** [bTlfo] params_QualEtapa="{∅}"

#### WF bTkoV2 — ButtonClicked em El[Button D]
1. **ShowElement** [bTkob2] alvo El[gp dados report]
2. **HideElement** [bTkof2] alvo El[gp lista reports]

#### WF bTkqF2 — ButtonClicked em El[Button bugreport]
1. **ShowElement** [bTkqL2] alvo El[pop bug report]

#### WF bTkqd2 — ButtonClicked em El[Button E]
1. **ResetGroup** [bTkqj2] alvo El[gp dados report]
2. **HideElement** [bTkqk2] alvo El[gp dados report]
3. **ShowElement** [bTkql2] alvo El[gp lista reports]

#### WF bTksb2 — ButtonClicked em El[Icon G]
1. **OpenURL** [bTksi2] open_in_new_tab=True, url="{El[ipt anexo]:get_data}"
