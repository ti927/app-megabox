# Reusable: `pop.AnexosClifor` (bTjcT)

Estados customizados: `var_tipoanexo_` : Opt.TipoAnexo; `var_qualclifor_` : Tbl.GrupoCliFor; `var_qualusuario_` : User

Resumo: 58 elementos · 7 workflows · 11 ações · 17 condicionais · 3 estados customizados
Elementos por tipo: Text 16, Group 12, TableCell 10, Icon 5, TableMainAxis 5, Image 3, Dropdown 2, TableCrossAxis 2, Plugin[1680110374647x249108010620944400]/AAC 1, FileInput 1, Table 1

## Árvore de elementos

- **Group** `Group C` (bTjhP) — props: vertical_centering=True
  - **Text** `Text H` (bTjhD) — text: "Documentos do {El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro}" · props: font_alignment="center"
  - **Icon** `Icon C` (bTjhJ) — props: icon="material outlined close", vertical_centering=True
- **Group** `gp nomeclifor` (bTkZZ) — data_source: El[Reusable pop.AnexosClifor]:custom.var_qualclifor_ · props: group_type="custom.tbl_clientes", vertical_centering=True
  - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Usuário") → is_visible=False
  - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Cliente/Fornecedor") → is_visible=True
  - **Image** `Image B` (bTkZb) — props: src="{Parent:cpo.Foto}"
    - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
  - **Group** `gp showdetalhes` (bTkZf) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
    - **Text** `Text J` (bTkZh) — text: "{Parent:cpo.NomeCliFor:to_uppercase}"
- **Group** `gp nomeusuario` (bTkZr) — data_source: El[Reusable pop.AnexosClifor]:custom.var_qualusuario_ · props: group_type="user", vertical_centering=True
  - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Usuário") → is_visible=True
  - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Cliente/Fornecedor") → is_visible=False
  - **Image** `Image C` (bTkZt) — props: src="{Parent:cpo.Foto}"
    - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
  - **Group** `gp showdetalhes` (bTkZx) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Text** `Text K` (bTkZy) — text: "{Parent:cpo.NomeModelo:to_uppercase:to_uppercase}"
- **Group** `Group G` (bUFDA) — data_source: El[Reusable pop.AnexosClifor]:custom.var_qualclifor_ · props: group_type="custom.tbl_clientes"
  - **Text** `Text M` (bUFCV) — text: "Fornecedor [b][u]não[/u][/b] faz contrato de parceira "
  - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bUFCt) — auto_binding: True · props: AAD=El[gp showdetalhes]:get_group_data:cpo.NãoFazContratoParceria, AAG="rgba(34,176,100,1)", AAH="rgba(199,199,199,1)", AAO="rgba(255,255,255,1)", AAQ="rgba(255,255,255,1)", bind_field="cpo_fazcontratoparceria_boolean"
- **Group** `Group A` (bTjcY) — props: vertical_centering=True
  - **Text** `Text A` (bTjcr) — text: "Novo documento"
  - **Group** `Group A` (bTjcd) — props: vertical_centering=True
    - **Group** `Group A` (bTjcf) — props: vertical_centering=True
      - **Text** `Text A` (bTjcj) — text: "Tipo do documento"
      - **Dropdown** `dd tipodocumento` (bTjck) — data_source: All(Opt.TipoAnexo):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:qualcadastro:equals(El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro), constraint_type=∅}}):sorted(descending=False, sort_field="display") · placeholder: "Selecione" · props: mandatory=True, vertical_centering=True, dynamic_type="option.opt_anexosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **Group** `Group A` (bTjcl) — props: vertical_centering=True
      - **Text** `Text A` (bTjcp) — text: "Upload documento"
      - **Group** `Group D` (bTjht) — props: vertical_centering=True
        - **FileInput** `upf documento` (bTjhh) — placeholder: "Buscar Arquivo" · props: mandatory=True, font_alignment="left", max_size=3
          - ⟂ quando This:get_loading_status → placeholder="Aguarde..."
          - ⟂ quando This:get_data:is_empty → font_color="var(--color_bTHGl_default)"
        - **Text** `Text I` (bTjhn) — oculto ao carregar · text: "[fa]spinner fa-pulse[/fa]" · props: font_alignment="center"
          - ⟂ quando El[upf documento]:get_loading_status → is_visible=True
    - **Group** `Group B` (bTjej) — props: vertical_centering=True
      - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Usuário") → is_visible=False
      - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Cliente/Fornecedor") → is_visible=True
      - **Text** `Text C` (bTjeo) — text: "Pertence a qual endereço"
      - **Dropdown** `dd qualendereco` (bTjep) — data_source: El[Reusable pop.AnexosClifor]:custom.var_qualclifor_:cpo.QuaisEnderecos:filtered(constraints={0={key="cpo_ativo_boolean", value=True, constraint_type="equals"}}) · placeholder: "Selecione" · props: mandatory=True, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase} - {∅}{InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words}/{InjectedValue:cpo.UF:to_uppercase} ({InjectedValue:cpo.CnpjCpf})"
        - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Usuário") → mandatory=False
    - **Icon** `Icon A` (bTjce) — props: icon="material outlined save", vertical_centering=True
- **Table** `rpg anexos` (bTjcw) — props: group_type="custom.tbl_anexos", vertical_centering=True, unique_id="remodela"
  - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Usuário") → data_source=El[Reusable pop.AnexosClifor]:custom.var_qualusuario_:cpo.QuaisAnexos
  - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Cliente/Fornecedor") → data_source=El[Reusable pop.AnexosClifor]:custom.var_qualclifor_:cpo.QuaisAnexos:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.TipoAnexo:deptosvisualizam:contains(CurrentUser:cpo.QualDepto), constraint_type=∅}}, ignore_empty_constraints=True)
  - **TableMainAxis** `TableMainAxis A` (bTjdB) — props: axis_index=1
  - **TableMainAxis** `TableMainAxis A` (bTjdC) — props: axis_index=2
  - **TableCrossAxis** `TableCrossAxis A` (bTjdH) — props: axis_index=0, make_sticky=True
    - **TableCell** `Cell A` (bTjdI) — props: cell_main_axis_id="bTjdB"
    - **TableCell** `Cell A` (bTjdJ) — props: cell_main_axis_id="bTjdC"
      - **Text** `Text B` (bTjdN) — text: "Tipo de documento"
    - **TableCell** `Cell A` (bTjdT) — props: cell_main_axis_id="bTjdt"
      - **Icon** `Icon B` (bTjdU) — props: icon="material outlined delete_forever", vertical_centering=True
    - **TableCell** `Cell A` (bTjdV) — props: cell_main_axis_id="bTjdx"
    - **TableCell** `Cell B` (bTjfl) — props: cell_main_axis_id="bTjff"
      - **Text** `Text D` (bTjfq) — text: "Endereço do documento"
  - **TableCrossAxis** `TableCrossAxis A` (bTjdZ) — props: axis_index=1, cross_axis_repeat=True
    - **TableCell** `Cell A` (bTjda) — props: cell_main_axis_id="bTjdB"
      - **Image** `Image A` (bTjdb) — props: src="{Ancestor[TableCrossAxis]:cpo.AnexoFile}"
      - **Text** `Text L` (bTkaE) — text: "arquivo.{Ancestor[TableCrossAxis]:cpo.AnexoFile:file_name:split_by(separator="."):last_element}"
    - **TableCell** `Cell A` (bTjdf) — props: cell_main_axis_id="bTjdC"
      - **Text** `Text B` (bTjdg) — text: "{Ancestor[TableCrossAxis]:cpo.TipoAnexo:display}"
    - **TableCell** `Cell A` (bTjdm) — props: cell_main_axis_id="bTjdt"
      - **Icon** `Icon B` (bTjdn) — props: icon="material outlined delete_outline", vertical_centering=True, button_disabled=True
        - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(2) → icon_color="var(--color_bTHHQ_default)", button_disabled=False
    - **TableCell** `Cell A` (bTjdr) — props: cell_main_axis_id="bTjdx"
      - **Icon** `Icon B` (bTjds) — props: icon="material outlined open_in_new", vertical_centering=True
    - **TableCell** `Cell C` (bTjfv) — props: cell_main_axis_id="bTjff"
      - **Text** `Text Current row's Tbl.An` (bTjfx) — text: "[b]Id Endereço[/b]: {Ancestor[TableCrossAxis]:cpo.QualOrigem:cpo.NomeEndereco:to_capitalized_words}"
      - **Text** `Text Current row's Tbl.An copy` (bTjgr) — text: "[b]Endereço[/b]: {Ancestor[TableCrossAxis]:cpo.QualOrigem:cpo.Endereco:to_capitalized_words} {Ancestor[TableCrossAxis]:cpo.QualOrigem:cpo.Municipio:to_uppercase}/{Ancestor[TableCrossAxis]:cpo.QualOrigem:cpo.QualUfOpt:display}"
      - **Text** `Text Current row's Tbl.An copy 2` (bTjgx) — text: "[b]Cnpj[/b]: {Ancestor[TableCrossAxis]:cpo.QualOrigem:cpo.CnpjCpf}"
  - **TableMainAxis** `Column D` (bTjdt) — props: axis_index=5
  - **TableMainAxis** `Column E` (bTjdx) — props: axis_index=0
  - **TableMainAxis** `TableMainAxis B` (bTjff) — props: axis_index=3
    - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Usuário") → is_visible=False
    - ⟂ quando El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Cliente/Fornecedor") → is_visible=True

## Workflows

#### WF bTjdz — ButtonClicked em El[Icon A]
- condição: El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Cliente/Fornecedor")
1. **NewThing** [bTjeE] tipo Tbl.Anexos · campos: cpo.AnexoFile = "{El[upf documento]:get_data}"; cpo.QualClifor = El[Reusable pop.AnexosClifor]:custom.var_qualclifor_; cpo.QualOrigem = El[dd qualendereco]:get_data; cpo.TipoAnexo = El[dd tipodocumento]:get_data
2. **ResetInputs** [bTjeF] 
3. **ChangeThing** [bTjeJ] campos: cpo.QuaisAnexos = ResultOfStep[bTjeE] · to_change=ResultOfStep[bTjeE]:cpo.QualOrigem
4. **ChangeThing** [bTjgC] campos: cpo.QuaisAnexos = ResultOfStep[bTjeE] · to_change=ResultOfStep[bTjeE]:cpo.QualClifor

#### WF bTjeL — ButtonClicked em El[Icon B]
1. **DeleteListOfThings** [bTjeQ] to_delete=El[rpg anexos]:get_list_data, type_to_delete="custom.tbl_anexos"

#### WF bTjeV — ButtonClicked em El[Icon B]
1. **DeleteThing** [bTjeX] to_delete=Ancestor[TableCrossAxis]

#### WF bTjec — ButtonClicked em El[Icon B]
1. **OpenURL** [bTjeh] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.AnexoFile}"

#### WF bTjhX — ButtonClicked em El[Icon C]
1. **HideElement** [bTjhd] alvo El[Reusable pop.AnexosClifor]

#### WF bTkNl — PopupOpened em El[Reusable pop.AnexosClifor]

#### WF bTkNr — ButtonClicked em El[Icon A]
- condição: El[Reusable pop.AnexosClifor]:custom.var_tipoanexo_:qualcadastro:equals("Usuário")
1. **NewThing** [bTkNt] tipo Tbl.Anexos · campos: cpo.AnexoFile = "{El[upf documento]:get_data}"; cpo.TipoAnexo = El[dd tipodocumento]:get_data; cpo.QualUsuario = El[Reusable pop.AnexosClifor]:custom.var_qualusuario_
2. **ResetInputs** [bTkNx] 
3. **ChangeThing** [bTkNz] campos: cpo.QuaisAnexos = ResultOfStep[bTkNt] · to_change=ResultOfStep[bTkNt]:cpo.QualUsuario
