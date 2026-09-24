# Reusable: `pop.CadastroUsuarios` (bTgiN)

Estados customizados: `var_contatosusuario_` : list.text (lista)

Resumo: 266 elementos · 30 workflows · 59 ações · 37 condicionais · 4 estados customizados
Elementos por tipo: Group 66, Text 59, TableCell 38, TableMainAxis 19, Icon 18, Input 12, Button 9, TableCrossAxis 8, Dropdown 8, Popup 4, Table 4, Plugin[1680110374647x249108010620944400]/AAC 4, AutocompleteDropdown 3, Image 3, Plugin[1609444246883x924984661248573400]/AAD 3, DateInput 2, CustomElement 1, PictureInput 1, Plugin[1695154888178x650605687409999900]/AAC 1, Checkbox 1, RadioButtons 1, Plugin[1617739938396x841575603972341800]/ACX 1

## Árvore de elementos

- **Popup** `pop carteira` (bTkKl) — props: group_type="user", vertical_centering=True
  - **Group** `Group P` (bTkVd) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Text** `Text O` (bTkVj) — text: "Configuração da carteira de {Parent:cpo.NomeModelo:to_capitalized_words}" · props: font_alignment="center"
      - ⟂ quando El[gp ddados usuario]:is_visible:and_(El[gp ddados usuario]:get_group_data:is_not_empty) → text="Edita Usuário"
      - ⟂ quando El[gp ddados usuario]:is_visible:and_(El[gp ddados usuario]:get_group_data:is_empty) → text="Novo Usuário"
    - **Icon** `Icon I` (bTkVf) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group K` (bTkKr) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Group** `Group R` (bTkWr) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Group** `Group S` (bTkWz) — data_source: Parent · props: group_type="user", vertical_centering=True
        - **Text** `Text Q` (bTkXQ) — text: "Lista de Clientes"
        - **Table** `rpg clientes sem carteira` (bTkWB) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.QualCarteira not equal Parent AND cpo.NomeCliFor equals "{El[busca cliente carteira]:get_data:cpo.NomeCliFor}" AND cpo.QualCarteira equals El[dd filtra carteira]:get_data AND cpo.Ativo equals True; sort cpo.NomeCliFor, ignore empty) · props: group_type="custom.tbl_clientes", vertical_centering=True, unique_id="remodela"
          - ⟂ quando El[chk clientes sem carteira]:get_AAI:is_true → data_source=Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.QualCarteira is_empty Parent AND cpo.NomeCliFor equals "{El[busca cliente carteira]:get_data:cpo.NomeCliFor}" AND cpo.Ativo equals True; sort cpo.NomeCliFor, ignore empty)
          - **TableMainAxis** `Column C` (bTkXc) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis E` (bTkWD) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis E` (bTkWH) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis E` (bTkWI) — props: axis_index=3
          - **TableCrossAxis** `TableCrossAxis A` (bTkWJ) — props: axis_index=0, make_sticky=True
            - **TableCell** `Cell G` (bTkWN) — props: cell_main_axis_id="bTkWD"
              - **Text** `Text P` (bTkWO) — text: "{El[rpg clientes sem carteira]:get_list_data:count}" · props: font_alignment="center"
            - **TableCell** `Cell G` (bTkWP) — props: cell_main_axis_id="bTkWH"
              - **Group** `gp busca cliente carteira` (bTkWT) — props: vertical_centering=True
                - **AutocompleteDropdown** `busca cliente carteira` (bTkWU) — data_source: Search(Tbl.GrupoCliFor: _id in El[rpg clientes sem carteira]:get_list_data:_id) · placeholder: "Nome cliente" · props: vertical_centering=True, no_language=True, field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGn_default)"
                  - ⟂ quando This:is_hovered:or_(This:is_focused) → placeholder_color="var(--color_bTHGl_default)"
                - **Icon** `Icon J` (bTkWV) — props: icon="material outlined filter_alt_off", vertical_centering=True
                  - ⟂ quando El[busca cliente carteira]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
            - **TableCell** `Cell G` (bTkWZ) — props: cell_main_axis_id="bTkWI"
            - **TableCell** `Cell H` (bTkXi) — props: cell_main_axis_id="bTkXc"
              - **Group** `gp busca vendedor` (bTkYS) — props: vertical_centering=True
                - **Dropdown** `dd filtra carteira` (bTkYX) — data_source: Search(User: _id not equal El[pop carteira]:get_group_data:_id; sort cpo.NomeModelo, ignore empty) · placeholder: "Carteira atual" · props: dynamic_type="user", choices_style="dynamic", placeholder_color="var(--color_bTHGn_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
                  - ⟂ quando El[chk clientes sem carteira]:get_AAI:is_true → default=∅, disabled=True
                - **Icon** `Icon K` (bTkYY) — props: icon="material outlined filter_alt_off", vertical_centering=True
                  - ⟂ quando El[dd filtra carteira]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
          - **TableCrossAxis** `TableCrossAxis A` (bTkWa) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell G` (bTkWb) — props: cell_main_axis_id="bTkWD"
              - **Image** `Image A` (bTkWf) — props: src="{Ancestor[TableCrossAxis]:cpo.Foto}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Foto:is_empty → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1730482618814x763376970390763100/landscape-placeholder%5B1%5D.svg?_gl=1*vwjmqu*_gcl_au*OTEzNzY3NTE0LjE3MzQ2NDQzNjU.*_ga*MjE0NTg5NTAyNy4xNzMyMTE2NjU2*_ga_BFPVR2DEE2*MTc0MDQ4MzkzNy41NC4xLjE3NDA1MDY0MDEuNjAuMC4w"
            - **TableCell** `Cell G` (bTkWg) — props: cell_main_axis_id="bTkWH"
              - **Text** `Text P` (bTkWh) — text: "{Ancestor[TableCrossAxis]:cpo.NomeCliFor:to_uppercase}"
            - **TableCell** `Cell G` (bTkWl) — props: cell_main_axis_id="bTkWI"
              - **Icon** `Icon J` (bTkWm) — props: icon="material outlined keyboard_double_arrow_right", vertical_centering=True, title_attribute="Adiciona cliente na carteira {El[pop carteira]:get_group_data:cpo.NomeModelo:to_capitalized_words}"
            - **TableCell** `Cell I` (bTkXo) — props: cell_main_axis_id="bTkXc"
              - **Text** `Text S` (bTkYd) — text: "{Ancestor[TableCrossAxis]:cpo.QualCarteira:cpo.NomeModelo:to_capitalized_words}"
        - **Group** `Group V` (bTkZH) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `chk clientes sem carteira` (bTkYv) — props: AAH="var(--color_bTHGs_default)", AAP=0, AAR=0
          - **Text** `Text T` (bTkZB) — text: "Exibir somente clientes sem carteira"
      - **Group** `Group T` (bTkXJ) — data_source: Parent · props: group_type="user", vertical_centering=True
        - **Text** `Text R` (bTkXW) — text: "Carteira de {Parent:cpo.NomeModelo:to_capitalized_words}"
        - **Table** `rpg carteira` (bTkKt) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.QualCarteira equals Parent AND cpo.NomeCliFor equals "{El[busca cliente carteira]:get_data:cpo.NomeCliFor}"; sort cpo.NomeCliFor, ignore empty) · props: group_type="custom.tbl_clientes", vertical_centering=True, unique_id="remodela"
          - **TableMainAxis** `TableMainAxis C` (bTkKx) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis C` (bTkKy) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis C` (bTkKz) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis C` (bTkLD) — props: axis_index=0, make_sticky=True
            - **TableCell** `Cell C` (bTkLE) — props: cell_main_axis_id="bTkKx"
              - **Text** `Text N` (bTkUt) — text: "{El[rpg carteira]:get_list_data:count}" · props: font_alignment="center"
            - **TableCell** `Cell C` (bTkLF) — props: cell_main_axis_id="bTkKy"
              - **Group** `gp busca cliente carteira` (bTkVS) — props: vertical_centering=True
                - **AutocompleteDropdown** `busca cliente carteira` (bTkUz) — data_source: Search(Tbl.GrupoCliFor: _id in El[rpg carteira]:get_list_data:_id) · placeholder: "Nome cliente" · props: vertical_centering=True, no_language=True, field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGn_default)"
                  - ⟂ quando This:is_hovered:or_(This:is_focused) → placeholder_color="var(--color_bTHGl_default)"
                - **Icon** `Icon H` (bTkVF) — props: icon="material outlined filter_alt_off", vertical_centering=True
                  - ⟂ quando El[busca cliente carteira]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
            - **TableCell** `Cell C` (bTkLK) — props: cell_main_axis_id="bTkKz"
          - **TableCrossAxis** `TableCrossAxis C` (bTkLL) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell C` (bTkLP) — props: cell_main_axis_id="bTkKx"
              - **Image** `Image C` (bTkLQ) — props: src="{Ancestor[TableCrossAxis]:cpo.Foto}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Foto:is_empty → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1730482618814x763376970390763100/landscape-placeholder%5B1%5D.svg?_gl=1*vwjmqu*_gcl_au*OTEzNzY3NTE0LjE3MzQ2NDQzNjU.*_ga*MjE0NTg5NTAyNy4xNzMyMTE2NjU2*_ga_BFPVR2DEE2*MTc0MDQ4MzkzNy41NC4xLjE3NDA1MDY0MDEuNjAuMC4w"
            - **TableCell** `Cell C` (bTkLR) — props: cell_main_axis_id="bTkKy"
              - **Text** `Text G` (bTkLV) — text: "{Ancestor[TableCrossAxis]:cpo.NomeCliFor:to_uppercase}"
            - **TableCell** `Cell C` (bTkLW) — props: cell_main_axis_id="bTkKz"
              - **Icon** `Icon E` (bTkLX) — props: icon="material outlined close", vertical_centering=True, title_attribute="Remove cliente da carteira {El[pop carteira]:get_group_data:cpo.NomeModelo:to_capitalized_words}"
- **CustomElement** `pop.AnexosClifor A` (bTkMd) — USA Reusable pop.AnexosClifor · props: custom_id="bTjcT"
- **Group** `Group E` (bTgqc) — props: vertical_centering=True
  - **Text** `Text E` (bTgqi) — text: "Cadastro de Usuários" · props: font_alignment="center"
    - ⟂ quando El[gp ddados usuario]:is_visible:and_(El[gp ddados usuario]:get_group_data:is_not_empty) → text="Edita Usuário"
    - ⟂ quando El[gp ddados usuario]:is_visible:and_(El[gp ddados usuario]:get_group_data:is_empty) → text="Novo Usuário"
  - **Icon** `Icon C` (bTgqh) — props: icon="material outlined close", vertical_centering=True
- **Group** `gp ddados usuario` (bTgik) — props: group_type="user"
  - ⟂ quando This:get_group_data:is_not_empty → is_visible=True
  - ⟂ quando This:get_group_data:is_empty → is_visible=False
  - **Group** `Group A` (bTgip) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Text** `Text A` (bTgjg) — text: "Dados Usuário"
    - **Group** `Group G` (bTkPR) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Group** `g PictureUploader` (bTgjb) — data_source: Parent · props: group_type="user"
        - **PictureInput** `upi foto novo usuário` (bTgjf) — placeholder: "" · props: src="{Parent:cpo.Foto}"
          - ⟂ quando This:is_focused:or_(This:is_hovered):or_(This:is_pressed) → boxshadow_color="rgba(181, 181, 195, 1)"
          - ⟂ quando This:isnt_valid → boxshadow_color="rgba(241, 65, 108, 1)"
      - **Group** `gp dados usuario` (bTkPw) — data_source: Parent · props: group_type="user", vertical_centering=True
        - **Group** `g Input` (bTgjC) — data_source: Parent · props: group_type="user"
          - **Text** `Text A` (bTgjH) — text: "Nome"
          - **Input** `ipt nome novo usuario` (bTgjD) — placeholder: "Utilize apenas "Nome Sobrenome"" · content: "{Parent:cpo.NomeModelo:to_capitalized_words}" · props: mandatory=True, not_submit_on_enter=True
        - **Group** `Group A` (bTgjB) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Group** `g Input copy` (bTgjI) — data_source: Parent · props: group_type="user"
            - **Text** `Text A` (bTgjN) — text: "Email MEGABOX"
            - **Input** `ipt email de contato` (bTgjJ) — placeholder: "usuario@email.com" · content: "{Parent:cpo.EmailContato:to_lowercase}" · content_format: "email" · props: mandatory=True, not_submit_on_enter=True
          - **Group** `g Input copy 2` (bTkQO0) — data_source: Parent · props: group_type="user"
            - **Group** `Group JZ` (bTqFb) — data_source: Parent · props: group_type="user", vertical_centering=True
              - **Text** `Text J` (bTkQU0) — text: "Email de login (automático)"
              - **Plugin[1695154888178x650605687409999900]/AAC** `Accentremover A` (bTkQz0) — props: AAD="{El[ipt nome novo usuario]:get_data}"
            - **Group** `Group X` (bTktF) — data_source: Parent · props: group_type="user", vertical_centering=True
              - **Input** `ipt email de login` (bTkQT0) — placeholder: "usuario@email.com" · content: "{Parent:email:to_lowercase}" · content_format: "email" · props: mandatory=True, placeholder_color="var(--color_bTHGl_default)", not_submit_on_enter=True
                - ⟂ quando El[gp ddados usuario]:get_group_data:is_not_empty → font_color="var(--color_bTHGm_default)", bgcolor="var(--color_bTHGh_default)", disabled=True
                - ⟂ quando El[gp ddados usuario]:get_group_data:is_empty → content="{El[Accentremover A]:get_AAE:find_replace(find=" ", replace="."):to_lowercase}@grupomegabox.com.br", font_color="var(--color_bTHGm_default)", bgcolor="var(--color_bTHGh_default)", disabled=True
              - **Icon** `Icon N` (bTksz) — props: icon="material outlined change_circle", vertical_centering=True, title_attribute="Alterar email de login"
                - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
        - **Group** `Group A` (bTgjO) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Group** `g Dropdown` (bTgjP) — data_source: Parent · props: group_type="user"
            - **Text** `Text A` (bTgjU) — text: "Qual departamento"
            - **Dropdown** `dd dpto novo usuario` (bTgjT) — data_source: All(Opt.DeptoUsuario) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualDepto, dynamic_type="option.opt_deptousuario", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:display:to_capitalized_words} (Ex: {InjectedValue:descri__o})"
          - **Group** `g Dropdown` (bTgjV) — data_source: Parent · props: group_type="user"
            - **Text** `Text A` (bTgja) — text: "Qual perfil"
            - **Dropdown** `dd perfil novo usuario` (bTgjZ) — data_source: All(Opt.PerfilUsuario) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualPerfil, dynamic_type="option.opt_perfilusuario", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:display:to_capitalized_words}"
        - **Group** `Group DZ` (bTqCb) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Group** `g Dropdown` (bTqCd) — data_source: Parent · props: group_type="user"
            - **Text** `Text AZ` (bTqCi) — text: "Nível vendedor"
            - **Dropdown** `dd nivel vendedor` (bTqCh) — data_source: Search(Tbl.NiveisVendedores) · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.QualNivelVendedor, dynamic_type="custom.tbl_niveisvendedores", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:cpo.NomeNivel:to_capitalized_words} (Meta: {InjectedValue:cpo.MetaVenda:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")})"
      - **Group** `gp dados pessoa` (bTkJL) — data_source: Parent · props: group_type="user"
        - **Group** `Group I` (bTkKC) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Group** `g Input` (bTkJN) — data_source: Parent · props: group_type="user"
            - **Group** `Group KZ` (bTqFn) — data_source: Parent · props: group_type="user", vertical_centering=True
              - **Text** `Text F` (bTkJR) — text: "CPF"
              - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput B` (bTkOK) — props: AAE="cpf", AAF="000.000.000-00"
            - **Input** `ipt cpf` (bTkJS) — placeholder: "Digite" · content: "{Parent:cpo.Cpf}" · props: unique_id="cpf", not_submit_on_enter=True
          - **Group** `g Input` (bTkJT) — data_source: Parent · props: group_type="user"
            - **Text** `Text F` (bTkJX) — text: "RG"
            - **Input** `ipt rg` (bTkJY) — placeholder: "Digite" · content: "{Parent:cpo.Rg:to_uppercase}" · props: not_submit_on_enter=True
        - **Group** `g Input` (bTkJZ) — data_source: Parent · props: group_type="user"
          - **Text** `Text F` (bTkJd) — text: "Endereço"
          - **Input** `ipt endereco` (bTkJe) — placeholder: "Digite" · content: "{Parent:cpo.Endereço:to_uppercase}" · props: not_submit_on_enter=True
        - **Group** `Group J` (bTkKN) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Group** `g Input` (bTkJf) — data_source: Parent · props: group_type="user"
            - **Text** `Text F` (bTkJj) — text: "Cidade"
            - **Input** `ipt cidade` (bTkJk) — placeholder: "Digite" · content: "{Parent:cpo.Cidade:to_uppercase}" · props: not_submit_on_enter=True
          - **Group** `g Input` (bTkJl) — data_source: Parent · props: group_type="user"
            - **Text** `Text F` (bTkJp) — text: "Estado"
            - **Dropdown** `ipt uf` (bTkJq) — data_source: All(Opt.UFs) · placeholder: "Selecione" · props: default=Parent:cpo.uf, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
        - **Group** `g Input` (bTkJr) — data_source: Parent · props: group_type="user"
          - **Group** `Group LZ` (bTqFv) — data_source: Parent · props: group_type="user", vertical_centering=True
            - **Text** `Text F` (bTkJv) — text: "Telefone"
            - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput A` (bTkKV) — props: AAE="foneusuario", AAF="(00) 0 0000-0000"
          - **Input** `ipt telefone` (bTkJw) — placeholder: "Digite" · content: "{Parent:cpo.Telefone}" · props: unique_id="foneusuario", not_submit_on_enter=True
      - **Group** `gp contatos` (bTkaK) — data_source: Parent · props: group_type="user"
        - **Group** `Group PZ` (bUBpC) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg indica substituto` (bUBoj) — props: AAE="var(--color_primary_contrast_default)", AAG="var(--color_primary_default)", AAH="var(--color_primary_contrast_default)", AAL="var(--color_background_default)", AAM="var(--color_bTHGl_default)", AAO="var(--color_primary_default)", AAR=0, ABB="var(--color_primary_default)", ABN="var(--color_primary_contrast_default)", ABO="var(--color_background_default)"
          - **Text** `Text JZ` (bUBow) — text: "Indicar substituto de férias"
        - **Group** `Group NZ` (bTyAV) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Group** `g Input` (bTyAX) — data_source: Parent · props: group_type="user"
            - **Text** `Text HZ` (bTyAc) — text: "Férias início"
            - **DateInput** `ipt feriasinicio` (bTyAb) — placeholder: "Nome" · content: Parent:cpo.FeriasInicio · props: mandatory=False, disabled=True, unique_id="cpf"
              - ⟂ quando El[tgg indica substituto]:get_AAI:is_true → mandatory=True, bgcolor="var(--color_primary_contrast_default)", disabled=False
          - **Group** `g Input` (bTyAd) — data_source: Parent · props: group_type="user"
            - **Text** `Text HZ` (bTyAi) — text: "Férias fim"
            - **DateInput** `ipt feriasfim` (bTyAn) — placeholder: "(00) 0 0000-0000" · content: Parent:cpo.FeriasFim · props: mandatory=False, disabled=True, min_date=El[ipt feriasinicio]:get_data:plus_days(1), unique_id="fonecontato"
              - ⟂ quando El[tgg indica substituto]:get_AAI:is_true → mandatory=True, bgcolor="var(--color_primary_contrast_default)", disabled=False
          - **Group** `g Input copy 3` (bTyBM) — data_source: Parent · props: group_type="user"
            - **Text** `Text IZ` (bTyBS) — text: "Substituto"
            - **Dropdown** `ipt substituto` (bTyBR) — data_source: Search(User: cpo.Ativo equals True AND cpo.QualDepto not equal Opt.DeptoUsuario.Financeiro AND cpo.QualDepto not equal Opt.DeptoUsuario.Operação) · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.QualVendedorSubstituto, disabled=True, unique_id="fonecontato", dynamic_type="user", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase} {InjectedValue:cpo.NomeModelo:split_by(separator=" "):last_element:to_uppercase}"
              - ⟂ quando El[tgg indica substituto]:get_AAI:is_true → mandatory=True, bgcolor="var(--color_primary_contrast_default)", disabled=False
        - **Group** `Group W` (bTkaP) — data_source: Parent · props: group_type="user", vertical_centering=True
          - **Group** `g Input` (bTkaQ) — data_source: Parent · props: group_type="user"
            - **Text** `Text U` (bTkaV) — text: "Nome contato"
            - **Input** `ipt nomecontato` (bTkaR) — placeholder: "Nome" · props: mandatory=True, unique_id="cpf", not_submit_on_enter=True
          - **Group** `g Input` (bTkaW) — data_source: Parent · props: group_type="user"
            - **Group** `Group MZ` (bTqGH) — data_source: Parent · props: group_type="user", vertical_centering=True
              - **Text** `Text U` (bTkaX) — text: "Telefone contato"
              - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput C` (bTkeS) — props: AAE="fonecontato", AAF="(00) 0 0000-0000"
            - **Input** `ipt telefonecontato` (bTkab) — placeholder: "(00) 0 0000-0000" · props: mandatory=True, unique_id="fonecontato", not_submit_on_enter=True
          - **Icon** `gravar contato usuario` (bTkcf) — props: icon="material outlined save", vertical_centering=True
        - **Table** `Table D` (bTkbL) — data_source: Parent:cpo.ContatosPessoais · props: group_type="text", vertical_centering=True, unique_id="remodela"
          - ⟂ quando Parent:is_empty → data_source=El[Reusable pop.CadastroUsuarios]:custom.var_contatosusuario_
          - **TableMainAxis** `Column C` (bTkdV) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis G` (bTkcH) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis G` (bTkcI) — props: axis_index=1
          - **TableCrossAxis** `TableCrossAxis D` (bTkcN) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell J` (bTkcO) — props: cell_main_axis_id="bTkcH"
            - **TableCell** `Cell J` (bTkcP) — props: cell_main_axis_id="bTkcI"
            - **TableCell** `Cell K` (bTkdb) — props: cell_main_axis_id="bTkdV"
          - **TableCrossAxis** `TableCrossAxis D` (bTkcU) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell J` (bTkcV) — props: cell_main_axis_id="bTkcH"
              - **Text** `Text V` (bTkcm) — text: "{Text("{Ancestor[TableCrossAxis]:split_by(separator=";"):first_element:to_uppercase}")}"
            - **TableCell** `Cell J` (bTkcZ) — props: cell_main_axis_id="bTkcI"
              - **Text** `Text W` (bTkdP) — text: "{Text("{Ancestor[TableCrossAxis]:split_by(separator=";"):last_element:to_uppercase}")}"
            - **TableCell** `Cell L` (bTkdh) — props: cell_main_axis_id="bTkdV"
              - **Icon** `Icon M` (bTkdz) — props: icon="material outlined delete", vertical_centering=True
    - **Group** `gp botoes` (bTkfg) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Group** `Group A` (bTgir) — data_source: Parent · props: group_type="user", vertical_centering=True
        - **Button** `btn gravar novo usuario` (bTgiw) — text: "Gravar"
          - ⟂ quando El[gp ddados usuario]:get_group_data:is_not_empty → text="Salvar", bgcolor="var(--color_bTHHJ_default)"
        - **Button** `btn cancela novo usuario copy` (bTgiv) — text: "Cancela"
          - ⟂ quando El[gp ddados usuario]:get_group_data:is_not_empty → border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)"
      - **Group** `Group C` (bTgqL) — data_source: Parent · props: group_type="user", vertical_centering=True
        - **Checkbox** `chk envia credenciais novo usuario` (bTgoe) — label: "" · props: vertical_centering=True
          - ⟂ quando El[gp ddados usuario]:get_group_data:is_not_empty → disabled=True
        - **Text** `Text D` (bTgqF) — text: "Envia credenciais por e-mail"
          - ⟂ quando El[gp ddados usuario]:get_group_data:is_not_empty → font_color="var(--color_bTHGl_default)"
- **Group** `Group B` (bTgoM) — props: vertical_centering=True
  - ⟂ quando El[gp ddados usuario]:is_visible → is_visible=False
  - **Group** `Group FZ` (bTqDl) — props: vertical_centering=True
    - **Text** `Text CZ` (bTqDe) — text: "Nome usuário"
    - **AutocompleteDropdown** `ipt filtra nome usuario` (bTgoT) — data_source: Search(User) · placeholder: "Busca nome" · props: vertical_centering=True, no_language=True, field_to_search="cpo_nome_text"
  - **Group** `Group GZ` (bTqED) — props: vertical_centering=True
    - **Text** `Text DZ` (bTqDw) — text: "Departamento"
    - **Dropdown** `dd filtra depto usario` (bTqDH) — data_source: All(Opt.DeptoUsuario):sorted(descending=False, sort_field="display") · placeholder: "Departamento" · props: dynamic_type="option.opt_deptousuario", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Group** `Group HZ` (bTqEV) — props: vertical_centering=True
    - **Text** `Text EZ` (bTqEO) — text: "Perfil"
    - **Dropdown** `dd filtra perfil usuario` (bTqDN) — data_source: All(Opt.PerfilUsuario):sorted(descending=False, sort_field="display") · placeholder: "Perfil" · props: dynamic_type="option.opt_perfilusuario", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Group** `Group IZ` (bTqEh) — props: vertical_centering=True
    - **Text** `Text BZ` (bTqDZ) — text: "Filtrar ativos"
    - **Group** `Group EZ` (bTqDT) — props: vertical_centering=True
      - **RadioButtons** `rad ativos` (bTqDY) — data_source: All(Opt.SimNão) · props: columns=3, default=Opt.SimNão.Ativos, dynamic_type="option.opt_simn_o", choices_style="dynamic", option_display_expression="{InjectedValue:ativo_inativo}"
  - **Button** `btn novo usuario` (bTgie) — text: "Novo Usuário" · props: vertical_centering=True
- **Popup** `pop ResetSenha` (bTgov) — props: greyout_color="rgba(0,0,0,0.6)"
  - estado customizado `var_qualusuario_` : User
  - **Group** `Group F` (bTgpH) — props: four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid"
    - **Text** `Text C` (bTgpI) — text: "Você tem certeza?"
    - **Icon** `Icon D` (bTgpJ) — props: icon="material outlined close"
  - **Group** `Group D` (bTgpB) — props: vertical_centering=True, four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid"
    - **Plugin[1680110374647x249108010620944400]/AAC** `tgg resetsenha enviarcredenciais` (bTkTJ) — props: AAH="var(--color_bTHGl_default)", AAP=0, AAR=0
    - **Text** `Text C` (bTgpC) — text: "Enviar novas credenciais por email"
  - **Text** `Text C` (bTgox) — text: "Você está prestes a resetar a senha do usuário⏎⏎Ao confirmar, o usuário será derrubado do sistema e [color=#fab515][b]receberá um email com uma senha temporária[/b][/color].⏎⏎Ao fazer login, o [color=#fab515][b]recomende o usuário a[/b][b] cadastrar uma nova senha[/b][/color].⏎⏎Deseja continuar?⏎"
    - ⟂ quando El[tgg resetsenha enviarcredenciais]:get_AAI:is_false → text="Você está prestes a resetar a senha do usuário⏎⏎Ao confirmar, o usuário será derrubado do sistema e uma nova senha será criada, [b][color=#fab515]mas ele NÃO receberá um email com as credenciais[/color][/b]⏎⏎Você [color=#fab515][b]precisa fixar o usuário em algum computador[/b][/color] para ele fazer login.⏎⏎Deseja continuar?⏎"
  - **Group** `Group D` (bTgpN) — props: border_color_top="var(--color_bTHGl_default)", border_style_top="solid", four_border_style=True
    - **Button** `Button C` (bTgpP) — text: "Confirmar" · props: icon="fa fa-exclamation-triangle", button_type="label_icon"
    - **Button** `Button C` (bTgpO) — text: "Cancela"
- **Popup** `pop FixarUsuario` (bTkRv) — props: greyout_color="rgba(0,0,0,0.6)"
  - estado customizado `var_qualusuario_` : User
  - **Group** `Group F` (bTkSH) — props: four_border_style=True, border_color_bottom="rgba(228, 230, 239, 1)", border_style_bottom="solid"
    - **Text** `Text M` (bTkSL) — text: "Você tem certeza?"
    - **Icon** `Icon G` (bTkSM) — props: icon="material outlined close"
  - **Text** `Text M` (bTkSA) — text: "Você está [b][color=#fab515]fixando[/color][/b] um usuário neste computador:⏎⏎[b][color=#fab515]USUÁRIO[/color]: {El[pop FixarUsuario]:custom.var_qualusuario_:email}[/b]⏎⏎Isso significa que o usuário poderá fazer login sem saber a senha [color=#fab515][b]somente [/b][b]neste computador[/b][/color].⏎⏎[b][color=#fab515]Se ele não souber a senha, não poderá fazer login em outro computador[/color][/b].⏎⏎Deseja continuar?⏎"
  - **Group** `Group N` (bTkSN) — props: border_color_top="rgba(228, 230, 239, 1)", border_style_top="solid", four_border_style=True
    - **Button** `Button fixar usuário` (bTkSS) — text: "Fixar Usuário" · props: icon="material outlined install_desktop", button_type="label_icon"
    - **Plugin[1617739938396x841575603972341800]/ACX** `LocalStorage B` (bTkTT)
    - **Button** `Button D` (bTkSR) — text: "Cancela"
- **Popup** `pop AlterarEmail` (bTktN) — props: greyout_color="rgba(0,0,0,0.6)"
  - estado customizado `var_qualusuario_` : User
  - **Group** `Group F` (bTktT) — props: four_border_style=True, border_color_bottom="rgba(228, 230, 239, 1)", border_style_bottom="solid"
    - **Text** `Text X` (bTktX) — text: "Você tem certeza?"
    - **Icon** `Icon O` (bTktY) — props: icon="material outlined close"
  - **Text** `Text X` (bTktS) — text: "Você está alterando o [b][color=#fab515]e-mail de login[/color][/b] desse usuário.⏎⏎Utilize essa função somente [b][color=#fab515]se precisa passar esse e-mail[/color][/b] para outro usuário.⏎⏎Lembre-se que nenhum e-mail de login pode repetir.⏎⏎Se este usuário [b][color=#fab515]está fixado [/color][/b]em  algum computador, ele [b][color=#fab515]deverá ser fixado novamente[/color][/b].⏎⏎"
  - **Group** `Group AZ` (bTktw) — props: vertical_centering=True
    - **Group** `Group BZ` (bTkua) — props: vertical_centering=True
      - **Text** `Text Y` (bTkuO) — text: "Email atual"
      - **Input** `ipt emailatual` (bTktk) — placeholder: "{El[pop AlterarEmail]:custom.var_qualusuario_:email}" · content: "{El[pop AlterarEmail]:custom.var_qualusuario_:email}" · content_format: "email" · props: mandatory=True, vertical_centering=True, disabled=True, not_submit_on_enter=True
    - **Group** `Group CZ` (bTkul) — props: vertical_centering=True
      - **Text** `Text Z` (bTkuU) — text: "Novo email"
      - **Input** `ipt novoemail` (bTktq) — placeholder: "Novo email" · content_format: "email" · props: mandatory=True, vertical_centering=True, not_submit_on_enter=True
  - **Group** `Group Z` (bTktZ) — props: border_color_top="rgba(228, 230, 239, 1)", border_style_top="solid", four_border_style=True
    - **Button** `Button fixar usuário` (bTktf) — text: "Alterar Email" · props: icon="material outlined change_circle", button_type="label_icon"
    - **Button** `Button E` (bTkte) — text: "Cancela"
- **Table** `rpg usuarios` (bTgkj) — data_source: Search(User: cpo.NomeModelo equals "{El[ipt filtra nome usuario]:get_data:cpo.NomeModelo}" AND cpo.QualDepto equals El[dd filtra depto usario]:get_data AND cpo.QualPerfil equals El[dd filtra perfil usuario]:get_data AND cpo.Ativo equals El[rad ativos]:get_data:boolean; sort cpo.NomeModelo, ignore empty) · props: group_type="user", vertical_centering=True, unique_id="remodela"
  - **TableMainAxis** `Column G` (bTkOV) — props: axis_index=8
  - **TableMainAxis** `TableMainAxis B` (bTgko) — props: axis_index=2
  - **TableMainAxis** `TableMainAxis B` (bTgkp) — props: axis_index=7
  - **TableMainAxis** `TableMainAxis B` (bTgkt) — props: axis_index=1
  - **TableCrossAxis** `TableCrossAxis B` (bTgku) — props: axis_index=1, cross_axis_repeat=True
    - **TableCell** `Cell B` (bTgkv) — props: cell_main_axis_id="bTgko"
      - **Text** `Text B` (bTgkz) — text: "{Ancestor[TableCrossAxis]:cpo.EmailContato:to_lowercase}"
    - **TableCell** `Cell B` (bTglA) — props: cell_main_axis_id="bTgkp"
      - **Icon** `btn edita usuario` (bTglB) — props: icon="material outlined edit", button_disabled=False, title_attribute="Edita usuário"
        - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:not_equals(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
        - ⟂ quando CurrentUser:cpo.NomeModelo:equals("gabriella mesquita de sousa") → icon_color="#6676F2", button_disabled=False
      - **Icon** `Icon F` (bTkMM) — props: icon="phosphor bold wallet", vertical_centering=True, title_attribute="Carteira de clientes"
      - **Icon** `Icon A` (bTkMG) — props: icon="material outlined note_add", vertical_centering=True, button_disabled=True, title_attribute="Documentos do usuário"
        - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:equals(1):or_(CurrentUser:cpo.QualDepto:equals(Opt.DeptoUsuario.Financeiro)) → icon_color="var(--color_bTHGs_default)", button_disabled=False
      - **Icon** `btn reset senha` (bTglF) — props: icon="material outlined lock_reset", title_attribute="Resetar senha"
        - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **Icon** `Icon B` (bTglH) — props: icon="material outlined install_desktop", title_attribute="Fixar usuário neste computador"
        - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → icon_color="var(--color_bTHGl_default)", button_disabled=True
    - **TableCell** `Cell B` (bTglL) — props: cell_main_axis_id="bTgkt"
      - **Text** `Text B` (bTglM) — text: "{Ancestor[TableCrossAxis]:cpo.NomeModelo:to_capitalized_words}"
    - **TableCell** `Cell B` (bTglN) — props: cell_main_axis_id="bTglw"
      - **Text** `Text B` (bTglR) — text: "{Ancestor[TableCrossAxis]:cpo.QualPerfil:display:to_capitalized_words}"
    - **TableCell** `Cell B` (bTglS) — props: cell_main_axis_id="bTglx"
      - **Text** `Text B` (bTglT) — text: "{Ancestor[TableCrossAxis]:cpo.QualDepto:display:to_capitalized_words}"
    - **TableCell** `Cell B` (bTglX) — props: cell_main_axis_id="bTgmB"
      - **Image** `Image B` (bTglY) — props: stretch_or_rescale="zoom", src="{Ancestor[TableCrossAxis]:cpo.Foto}"
        - ⟂ quando Ancestor[TableCrossAxis]:cpo.Foto:is_empty → src="//21d85b5f34b72c2c9bea3d9d45458bb7.cdn.bubble.io/f1698174961133x403443266892573600/aa149071.png"
        - ⟂ quando Ancestor[TableCrossAxis]:cpo.Ativo:is_false → src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fs3.amazonaws.com%2Fappforest_uf%2Ff1664476260407x848551234117814900%2Funnamed.png?w=48&h=48&auto=compress&fit=max"
    - **TableCell** `Cell A` (bTkOb) — props: cell_main_axis_id="bTkOV"
      - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTglG) — auto_binding: False · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo1_boolean"
    - **TableCell** `Cell M` (bTqFJ) — props: cell_main_axis_id="bTqFD"
      - **Text** `Text FZ` (bTqFL) — text: "{Ancestor[TableCrossAxis]:cpo.QualNivelVendedor:cpo.NomeNivel:to_capitalized_words}"
    - **TableCell** `Cell E` (bTkRL0) — props: cell_main_axis_id="bTkRF0"
      - **Text** `Text K` (bTkRQ0) — text: "{Ancestor[TableCrossAxis]:email:to_lowercase}"
  - **TableCrossAxis** `TableCrossAxis B` (bTglZ) — props: axis_index=0, make_sticky=True
    - **TableCell** `Cell B` (bTgld) — props: cell_main_axis_id="bTgko"
      - **Text** `Text B` (bTgle) — text: "Email real MEGABOX"
    - **TableCell** `Cell B` (bTglf) — props: cell_main_axis_id="bTgkp"
      - **Text** `Text I` (bTkPG) — text: "Ações"
    - **TableCell** `Cell B` (bTglj) — props: cell_main_axis_id="bTgkt"
      - **Text** `Text B` (bTglk) — text: "Nome"
    - **TableCell** `Cell B` (bTgll) — props: cell_main_axis_id="bTglw"
      - **Text** `Text B` (bTglp) — text: "Perfil"
    - **TableCell** `Cell B` (bTglq) — props: cell_main_axis_id="bTglx"
      - **Text** `Text B` (bTglr) — text: "Departamento"
    - **TableCell** `Cell B` (bTglv) — props: cell_main_axis_id="bTgmB"
    - **TableCell** `Cell D` (bTkOh) — props: cell_main_axis_id="bTkOV"
      - **Text** `Text H` (bTkPA) — text: "Ativo" · props: font_alignment="center"
    - **TableCell** `Cell N` (bTqFQ) — props: cell_main_axis_id="bTqFD"
      - **Text** `Text GZ` (bTqFV) — text: "Nível vendedor"
    - **TableCell** `Cell F` (bTkRV0) — props: cell_main_axis_id="bTkRF0"
      - **Text** `Text L` (bTkRX0) — text: "Email falso de login"
  - **TableMainAxis** `TableMainAxis B` (bTglw) — props: axis_index=5
  - **TableMainAxis** `TableMainAxis B` (bTglx) — props: axis_index=4
  - **TableMainAxis** `TableMainAxis B` (bTgmB) — props: axis_index=0
  - **TableMainAxis** `TableMainAxis I` (bTqFD) — props: axis_index=6
  - **TableMainAxis** `TableMainAxis D` (bTkRF0) — props: axis_index=3

## Workflows

#### WF bTgmD — ButtonClicked em El[btn novo usuario]
1. **ShowElement** [bTgoZ] alvo El[gp ddados usuario]

#### WF bTgmN — ButtonClicked em El[btn cancela novo usuario copy]
1. **ResetGroup** [bTgmT] alvo El[gp ddados usuario]
2. **HideElement** [bTgod] alvo El[gp ddados usuario]

#### WF bTgmZ — ButtonClicked em El[btn gravar novo usuario]
- condição: El[gp ddados usuario]:get_group_data:is_not_empty
- props: event_color="orange"
1. **ChangeThing** [bTgmb] campos: cpo.Foto = "{El[upi foto novo usuário]:get_data}"; cpo.NomeModelo = "{El[ipt nome novo usuario]:get_data:to_lowercase}"; cpo.QualPerfil = El[dd perfil novo usuario]:get_data; cpo.QualDepto = El[dd dpto novo usuario]:get_data; cpo.Cpf = "{El[ipt cpf]:get_data}"; cpo.Rg = "{El[ipt rg]:get_data}"; cpo.Endereço = "{El[ipt endereco]:get_data:to_lowercase}"; cpo.Cidade = "{El[ipt cidade]:get_data}"; cpo.uf = El[ipt uf]:get_data; cpo.Telefone = "{El[ipt telefone]:get_data}"; cpo.EmailContato = "{El[ipt email de contato]:get_data}"; cpo.QualNivelVendedor = El[dd nivel vendedor]:get_data; cpo.FeriasFim = El[ipt feriasfim]:get_data:change_hours(23):change_minutes(59):change_seconds(59); cpo.FeriasInicio = El[ipt feriasinicio]:get_data:change_hours(0):change_minutes(0):change_seconds(0); cpo.FeriasPeriod = El[ipt feriasinicio]:get_data:to_range(El[ipt feriasfim]:get_data:change_hours(23):change_minutes(59):change_seconds(59)); cpo.QualVendedorSubstituto = El[ipt substituto]:get_data · to_change=El[gp ddados usuario]:get_group_data
2. **ResetInputs** [bTgmf] 
3. **ResetGroup** [bTkQN0] alvo El[gp ddados usuario]
4. **HideElement** [bTkQI0] alvo El[gp ddados usuario]
5. **ScheduleAPIEvent** [bUBpV] SÓ SE El[tgg indica substituto]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bUBpN", _wf_param_DataFim=El[ipt feriasfim]:get_data:change_hours(23):change_minutes(59):change_seconds(59), _wf_param_Vendedor=Parent, _wf_param_DataInicio=El[ipt feriasinicio]:get_data:change_hours(0):change_minutes(0):change_seconds(0), _wf_param_Substituto=El[ipt substituto]:get_data

#### WF bTgml — ButtonClicked em El[btn gravar novo usuario]
- condição: El[gp ddados usuario]:get_group_data:is_empty
- props: event_color="blue"
1. **CreateUserAccount** [bTgmn] campos: cpo.Ativo = True; cpo.EmailLoginTexto = "{El[ipt email de login]:get_data:to_lowercase}"; cpo.Foto = "{El[upi foto novo usuário]:get_data}"; cpo.NomeModelo = "{El[ipt nome novo usuario]:get_data:to_lowercase}"; cpo.QualPerfil = El[dd perfil novo usuario]:get_data; cpo.QualDepto = El[dd dpto novo usuario]:get_data; cpo.Telefone = "{El[ipt telefone]:get_data}"; cpo.Cpf = "{El[ipt cpf]:get_data}"; cpo.Rg = "{El[ipt rg]:get_data}"; cpo.Endereço = "{El[ipt endereco]:get_data:to_lowercase}"; cpo.Cidade = "{El[ipt cidade]:get_data:to_lowercase}"; cpo.uf = El[ipt uf]:get_data; cpo.ContatosPessoais = El[Reusable pop.CadastroUsuarios]:custom.var_contatosusuario_; cpo.EmailContato = "{El[ipt email de contato]:get_data:to_lowercase}"; cpo.QualNivelVendedor = El[dd nivel vendedor]:get_data; cpo.FeriasFim = El[ipt feriasfim]:get_data:change_hours(0):change_minutes(0):change_seconds(0); cpo.FeriasInicio = El[ipt feriasinicio]:get_data:change_hours(0):change_minutes(0):change_seconds(0); cpo.FeriasPeriod = El[ipt feriasinicio]:get_data:to_range(El[ipt feriasfim]:get_data:change_hours(23):change_minutes(59):change_seconds(59)); cpo.QualVendedorSubstituto = El[ipt substituto]:get_data · email=El[ipt email de login]:get_data
2. **SetTemporaryPassword** [bTgmr] user=ResultOfStep[bTgmn]
3. **ChangeThing** [bTkRu] campos: cpo.PassTexto = "{ResultOfStep[bTgmr]}"; cpo.CopiaPedido = "{InjectedValue:cpo.EmailContato}"; cpo.CopiaCancelamentos = "{InjectedValue:cpo.EmailContato}"; cpo.CopiaProposta = "{InjectedValue:cpo.EmailContato}" · to_change=ResultOfStep[bTgmn]
4. **SendEmail** [bTgms] SÓ SE El[chk envia credenciais novo usuario]:get_data:and_(CurrentUser:cpo.UsaEmailPessoal - deleted:is_false) · to="{ResultOfStep[bTgmn]:cpo.EmailContato}", body="⏎⏎⏎[size=3]Olá [b]{ResultOfStep[bTgmn]:cpo.NomeModelo:to_capitalized_words}[/b]![/size]⏎⏎[size=3]Você foi cadastrado no sistema da [b]MegaBox[/b].[/size]⏎⏎[size=3]Acesse {Page.Website Home} e faça login com as seguintes credenciais:[/size]⏎⏎[size=3][b]Email de login:[/b] {ResultOfStep[bTgmn]:email}[/size]⏎[size=3][b]Senha:[/b] {ResultOfStep[bTgmr]}[/size]⏎⏎[size=3]Bem vindo ao sistema MegaBox![/size]", subject="Novo Usuario", sender_name="Sistema MegaBox"
5. **ResetInputs** [bTgmt] 
6. **HideElement** [bTkQH0] alvo El[gp ddados usuario]

#### WF bTgnV — ButtonClicked em El[btn edita usuario]
1. **DisplayGroupData** [bTgnX] alvo El[gp ddados usuario] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTkQJ0] alvo El[gp ddados usuario]

#### WF bTgnd — ButtonClicked em El[btn reset senha]
1. **SetCustomState** [bTgni] alvo El[pop ResetSenha] · value=Ancestor[TableCrossAxis], custom_state="custom.var_qualusuario_"
2. **ShowElement** [bTgnj] alvo El[pop ResetSenha]

#### WF bTgno — ButtonClicked em El[Icon B]
- props: event_color="blue", workflow_disabled=True
1. **Plugin[1617739938396x841575603972341800]/ABo** [bTgnt] alvo El[bTgqW]
2. **Plugin[1617739938396x841575603972341800]/ACe** [bTgnu] alvo El[bTgqW] · ACg="nome|email|senha", ACh="{Ancestor[TableCrossAxis]:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words} {Ancestor[TableCrossAxis]:cpo.NomeModelo:split_by(separator=" "):last_element:to_uppercase}|{Ancestor[TableCrossAxis]:email}|{Ancestor[TableCrossAxis]:cpo.PassTexto}"
3. **Plugin[1658328157117x953686184769617900]/AAT** [bTgnv] AAF="Usuário gravado neste computador: ⏎{Ancestor[TableCrossAxis]:email}", AAJ="var(--color_bTHHX_default)"

#### WF bTgpU — ButtonClicked em El[Icon D]
1. **HideElement** [bTgpZ] alvo El[pop ResetSenha]

#### WF bTgpb — ButtonClicked em El[Button C]
1. **HideElement** [bTgpg] alvo El[pop ResetSenha]

#### WF bTgpl — ButtonClicked em El[Button C]
- props: workflow_disabled=False
1. **SetTemporaryPassword** [bTgpn] user=El[pop ResetSenha]:custom.var_qualusuario_
2. **ChangeThing** [bTgpr] campos: cpo.PassTexto = "{ResultOfStep[bTgpn]}" · to_change=El[pop ResetSenha]:custom.var_qualusuario_
3. **SendEmail** [bTgps] SÓ SE El[tgg resetsenha enviarcredenciais]:get_AAI:is_true · to="{El[pop ResetSenha]:custom.var_qualusuario_:cpo.EmailContato}", body="⏎⏎⏎[size=3]Olá [b]{El[pop ResetSenha]:custom.var_qualusuario_:cpo.NomeModelo:to_capitalized_words}[/b]![/size]⏎⏎[size=3]Sua senha foi redefinida no sistema MegaBox.[/size]⏎⏎[size=3]Acesse {Page.Website Home} e faça login com as seguintes credenciais:[/size]⏎⏎[size=3][b]Email login:[/b] {El[pop ResetSenha]:custom.var_qualusuario_:email}[/size]⏎[size=3][b]Senha:[/b] {ResultOfStep[bTgpn]}[/size]⏎⏎[size=3][b]Cadastre nova senha assim que entrar.[/b][/size]⏎⏎[size=3]Bem vindo ao sistema MegaBox![/size]", subject="Nova Senha", bcc="{CurrentUser:email}", sender_name="Sistema MegaBox"
4. **HideElement** [bTgpt] alvo El[pop ResetSenha]
5. **ResetGroup** [bTgpx] alvo El[pop ResetSenha]

#### WF bTgqn — ButtonClicked em El[Icon C]
1. **ResetGroup** [bTgqp] alvo El[gp ddados usuario]
2. **HideElement** [bTgqt] alvo El[Reusable pop.CadastroUsuarios]

#### WF bTkLo — ButtonClicked em El[Icon E]
1. **ChangeThing** [bTkLt] campos: cpo.QualCarteira = ∅ · to_change=Ancestor[TableCrossAxis]

#### WF bTkMS — ButtonClicked em El[Icon F]
1. **ShowElement** [bTkMY] alvo El[pop carteira]
2. **DisplayGroupData** [bTkMZ] alvo El[pop carteira] · data_source=Ancestor[TableCrossAxis]

#### WF bTkMq — ButtonClicked em El[Icon A]
1. **ShowElement** [bTkNh] alvo El[pop.AnexosClifor A]
2. **SetCustomState** [bTkOJ] alvo El[pop.AnexosClifor A] · value=Opt.TipoAnexo.Contracheque, custom_state="custom.var_tipoanexo_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualusuario_"}}

#### WF bTkSX — ButtonClicked em El[Button fixar usuário]
- props: event_color="cyan"
1. **Plugin[1617739938396x841575603972341800]/ABo** [bTkSZ] alvo El[LocalStorage B]
2. **Plugin[1617739938396x841575603972341800]/ACe** [bTkSd] alvo El[LocalStorage B] · ACg="nome|email|senha", ACh="{El[pop FixarUsuario]:custom.var_qualusuario_:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words} |{El[pop FixarUsuario]:custom.var_qualusuario_:email}|{El[pop FixarUsuario]:custom.var_qualusuario_:cpo.PassTexto}"
3. **Plugin[1658328157117x953686184769617900]/AAT** [bTkSe] AAF="Usuário gravado neste computador: ⏎{El[pop FixarUsuario]:custom.var_qualusuario_:email}", AAJ="var(--color_bTHHX_default)"
4. **HideElement** [bTkSj] alvo El[pop FixarUsuario]

#### WF bTkSk — ButtonClicked em El[Icon B]
- props: event_color="blue", workflow_disabled=False
1. **SetCustomState** [bTkSx] alvo El[pop FixarUsuario] · value=Ancestor[TableCrossAxis], custom_state="custom.var_qualusuario_"
2. **ShowElement** [bTkTB] alvo El[pop FixarUsuario]

#### WF bTkTC — ButtonClicked em El[Button D]
1. **HideElement** [bTkTI] alvo El[pop FixarUsuario]

#### WF bTkVL — ButtonClicked em El[Icon H]
1. **ResetGroup** [bTkVR] alvo El[gp busca cliente carteira]

#### WF bTkVr — ButtonClicked em El[Icon I]
1. **HideElement** [bTkVx] alvo El[pop carteira]

#### WF bTkYj — ButtonClicked em El[Icon K]
1. **ResetGroup** [bTkYp] alvo El[gp busca vendedor]

#### WF bTkZP — ButtonClicked em El[Icon J]
1. **ChangeThing** [bTkZV] campos: cpo.QualCarteira = El[pop carteira]:get_group_data · to_change=Ancestor[TableCrossAxis]

#### WF bTkcs — ButtonClicked em El[gravar contato usuario]
- condição: Parent:is_empty
1. **SetCustomState** [bTkcy] alvo El[Reusable pop.CadastroUsuarios] · value=El[Reusable pop.CadastroUsuarios]:custom.var_contatosusuario_:plus_element(Text("{El[ipt nomecontato]:get_data:to_lowercase};{El[ipt telefonecontato]:get_data}")), custom_state="custom.var_contatosusuario_"
2. **ResetInputs** [bTkcz] 

#### WF bTkdD — ButtonClicked em El[gravar contato usuario]
- condição: Parent:is_not_empty
1. **ChangeThing** [bTkdL] campos: cpo.ContatosPessoais = "{Text("{El[ipt nomecontato]:get_data:to_lowercase};{El[ipt telefonecontato]:get_data}")}" · to_change=Parent
2. **ResetInputs** [bTkdJ] 

#### WF bTkeF — ButtonClicked em El[Icon M]
1. **ChangeThing** [bTked] campos: cpo.ContatosPessoais = "{Ancestor[TableCrossAxis]}" · to_change=El[gp ddados usuario]:get_group_data

#### WF bTkuH — ButtonClicked em El[Button fixar usuário]
1. **ChangeEmailForAnotherUser** [bTkuN] user=El[pop AlterarEmail]:custom.var_qualusuario_, new_email=El[ipt novoemail]:get_data
2. **ResetInputs** [bTkut] 
3. **HideElement** [bTkux] alvo El[pop AlterarEmail]

#### WF bTkuy — ButtonClicked em El[Icon N]
1. **ShowElement** [bTkvE] alvo El[pop AlterarEmail]
2. **SetCustomState** [bTkvF] alvo El[pop AlterarEmail] · value=Parent, custom_state="custom.var_qualusuario_"

#### WF bTkvJ — ButtonClicked em El[Button E]
1. **HideElement** [bTkvP] alvo El[pop AlterarEmail]

#### WF bTkvQ — ButtonClicked em El[Icon O]
1. **HideElement** [bTkvW] alvo El[pop AlterarEmail]

#### WF bTzWZ — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch A]
1. **ChangeThing** [bTzWf] campos: cpo.Ativo = This:get_AAI · to_change=Ancestor[TableCrossAxis]

#### WF bTkQn0 — InputChanged em El[ipt nome novo usuario]
