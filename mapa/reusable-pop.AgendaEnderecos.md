# Reusable: `pop.AgendaEnderecos` (bTPJL)

Estados customizados: `var_a__oclifor_` : Opt.AçãoCliFor; `var_qualendereco_` : Tbl.EnderecosCliFor; `var_quaisprodutos_` : list.custom.tbl_produtos (lista); `var_destravarcampos_` : boolean; `var_qualgrupoclifor_` : Tbl.GrupoCliFor; `var_recemcadastrado_` : Tbl.GrupoCliFor

Resumo: 191 elementos · 22 workflows · 55 ações · 109 condicionais · 6 estados customizados
Elementos por tipo: Group 59, Text 47, TableCell 20, Input 16, TableMainAxis 10, Icon 6, Button 6, TableCrossAxis 6, Dropdown 5, Plugin[1680110374647x249108010620944400]/AAC 4, Table 3, Plugin[1609444246883x924984661248573400]/AAD 2, AutocompleteDropdown 2, PictureInput 1, Link 1, RadioButtons 1, Image 1, MultiLineInput 1

## Árvore de elementos

- **Group** `Group O` (bTeMf) — props: vertical_centering=True
  - **Text** `Text A` (bTPJN) — text: "Catálogo de Endereços" · props: font_alignment="center"
    - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor)) → text="{El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:display:split_by(separator=" "):first_element} endereço do {El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor:display}"
    - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente) → text="Novo Cliente"
    - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor) → text="Novo Fornecedor"
  - **Icon** `ico fechar` (bTeMZ) — props: icon="material outlined close", vertical_centering=True
- **Group** `gp qual grupo clifor` (bTPJT) — data_source: El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_ · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **Group** `Group KZ` (bTrnT) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
    - **Group** `Group N` (bTeLR) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **PictureInput** `upi novocliente logo` (bTPJZ) — placeholder: "" · props: src="{Parent:cpo.Foto}"
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:is_empty → disabled=True
        - ⟂ quando Parent:cpo.Foto:is_empty → background_style="image", background_image="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Link** `Link A` (bTeLL) — props: linktype="url", icon="fa fa-search", open_in_new_tab=True, vertical_centering=True, url="{∅}https://www.google.com/search?q={El[ipt nome grupoclifor]:get_data} logo&udm=2&tbs=ic:trans", show_icon=True
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:is_empty → is_visible=False
    - **Input** `ipt nome grupoclifor` (bTPJY) — placeholder: "Nome cliente / fornecedor" · content: "{Parent:cpo.NomeCliFor:to_uppercase}" · props: mandatory=True, vertical_centering=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:get_data:is_empty → border_style_bottom="solid"
      - ⟂ quando This:is_hovered:or_(This:is_focused) → background_style="bgcolor", bgcolor="var(--color_primary_contrast_default)"
      - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → disabled=False
  - **Group** `Group IZ` (bTrmq) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
    - **Group** `Group JZ` (bTrnD) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Group** `Group HZ` (bTrmN) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor):or_(Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
        - **Text** `Text AZ` (bTrmS) — text: "Captação:"
        - **Dropdown** `dd captacao` (bTrmT) — data_source: All(Opt.CaptacaoCliente) · placeholder: "Selecione forma" · props: default=Parent:cpo.Captacao, dynamic_type="option.opt_captacaocliente", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `Group J` (bTeKr) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor):or_(Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
        - **Text** `Text J` (bTeKt) — text: "Carteira: "
        - **Dropdown** `dd carteira` (bTeKx) — data_source: Search(User; sort cpo.NomeModelo) · placeholder: "Selecione usuáro" · props: default=Parent:cpo.QualCarteira, dynamic_type="user", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group LZ` (bTrnf) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Group** `Group GZ` (bTmVh) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:is_empty → is_visible=False
        - **Text** `Text Z` (bTmVt) — text: "Grupo ativo: "
        - **Group** `Group GZ` (bTmVj) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg grupoativo` (bTmVn) — auto_binding: False · props: AAD=Parent:cpo.Ativo, AAH="var(--color_primary_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean", nonant_alignment="ab"
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → AAD=True
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → AAD=True
          - **Text** `Text Z` (bTmVo) — text: "SIM" · props: font_alignment="center", nonant_alignment="ab"
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_false → is_visible=False
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_true → is_visible=True
          - **Text** `Text Z` (bTmVp) — text: "NÃO" · props: font_alignment="center", nonant_alignment="cb"
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_false → is_visible=True
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_true → is_visible=False
      - **Icon** `btn novo endereço cliente` (bTPNs) — props: icon="material filled add_location_alt", button_disabled=True
        - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → icon_color="var(--color_primary_default)", button_disabled=False
        - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(2):or_(CurrentUser:cpo.QualDepto:equals(Opt.DeptoUsuario.Financeiro)) → icon_color="var(--color_primary_default)", button_disabled=False
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:is_empty → is_visible=True
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:is_not_empty → is_visible=False
- **Group** `gp tabs` (bTkGS) — props: vertical_centering=True
  - ⟂ quando El[gp dados endereco clifor]:is_visible → is_visible=True
  - ⟂ quando El[gp dados endereco clifor]:isnt_visible → is_visible=False
  - **Text** `Text O` (bTkGX) — text: "Informações de Cadastro" · props: font_alignment="center", vertical_centering=True, four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="none"
    - ⟂ quando El[show dados cadastrais]:is_visible → border_color_top="var(--color_bTHGl_default)", border_style_top="solid", border_color_left="var(--color_bTHGl_default)", border_style_left="solid", border_color_right="var(--color_bTHGl_default)", border_style_right="solid"
    - ⟂ quando El[show dados adicionais]:is_visible → background_style="bgcolor", bgcolor="var(--color_bTHGh_default)", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid"
  - **Text** `Text N` (bTkGF) — text: "Informações Adicionais" · props: font_alignment="center", vertical_centering=True, four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="none", border_roundness_right=5
    - ⟂ quando El[show dados adicionais]:is_visible → border_color_top="var(--color_bTHGl_default)", border_style_top="solid", border_color_left="var(--color_bTHGl_default)", border_style_left="solid", border_color_right="var(--color_bTHGl_default)", border_style_right="solid"
    - ⟂ quando El[show dados cadastrais]:is_visible → background_style="bgcolor", bgcolor="var(--color_bTHGh_default)", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid"
- **Group** `gp dados endereco clifor` (bTPPS) — data_source: El[Reusable pop.AgendaEnderecos]:custom.var_qualendereco_ · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, border_color_left="var(--color_bTHGl_default)", border_style_left="solid", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_style_right="solid", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=10
  - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor)):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → is_visible=True
  - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:is_empty → is_visible=False
  - **Group** `show dados cadastrais` (bTkGZ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - **Group** `Group EZ` (bTmVE0) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `Group FZ` (bTmVW0) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Text** `Text Y` (bTmVJ0) — text: "Filial ativa:"
        - **Group** `Group EZ` (bTmVK0) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg filial ativa` (bTmVL0) — props: AAD=Parent:cpo.Ativo, AAH="var(--color_primary_default)", AAP=0, AAR=0, nonant_alignment="ab"
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → AAD=True
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → AAD=True
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor)) → AAD=True
          - **Text** `Text Y` (bTmVP0) — text: "SIM" · props: font_alignment="center", nonant_alignment="ab"
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_false → is_visible=False
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_true → is_visible=True
          - **Text** `Text Y` (bTmVQ0) — text: "NÃO" · props: font_alignment="center", nonant_alignment="cb"
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_false → is_visible=True
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_true → is_visible=False
      - **Button** `Button E` (bTmOH0) — text: "Destravar Campos" · props: icon="material outlined lock_open", icon_size=16, button_type="label_icon", button_disabled=True
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → font_color="#FFFFFF", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
        - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente):or_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Cliente)) → button_disabled=False
        - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(2):or_(CurrentUser:cpo.QualDepto:equals(Opt.DeptoUsuario.Financeiro)) → button_disabled=False
    - **Group** `g Input` (bTPJe) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
      - **Text** `Text B` (bTPJk) — text: "Identificação do Endereço"
      - **Group** `Group X` (bTjbz) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Input** `ipt novo cliente id endereço` (bTPJj) — placeholder: "Ex: Matriz, Filial, Depósito, etc." · content: "{Parent:cpo.NomeEndereco:to_capitalized_words}" · props: disabled=True
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group C` (bTPJp) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input` (bTPKJ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTPKN) — text: "Cpf/Cnpj"
        - **Group** `Group C` (bTPKO) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Group** `Group L` (bTeIz) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
            - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)"
            - **Input** `ipt novo cliente cnpj` (bTPKP) — placeholder: "Somente números" · content: "{Parent:cpo.CnpjCpf}" · props: mandatory=True, disabled=True, unique_id="cnpj"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cpf) → placeholder="000.000.000-00", unique_id="{∅}cpf"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cnpj) → placeholder="00.000.000-0000/00", unique_id="{∅}cnpj"
              - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
            - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput cnpj` (bTPVZ0) — props: AAE="", AAF="", AAo=True
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cpf) → AAE="{∅}cpf", AAF="{∅}000.000.000-00"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cnpj) → AAE="{∅}cnpj", AAF="{∅}00.000.000-0000/00"
            - **RadioButtons** `RadioButtons cpfcnpj` (bTeIt) — data_source: All(Opt.TipoPessoa) · props: mandatory=True, columns=2, default=Parent:cpo.TipoPessoa, disabled=True, dynamic_type="option.opt_tipopessoa", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
              - ⟂ quando Parent:is_empty → default=Opt.TipoPessoa.cnpj
              - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → disabled=False
      - **Group** `g Input` (bTPKD) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTPKI) — text: "Insc Estadual"
        - **Input** `ipt novocliente insc estadual` (bTPKH) — placeholder: "00000000" · content: "{Parent:cpo.InscEstadual:to_uppercase}" · props: disabled=True
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTPJx) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTPKC) — text: "Insc Municipal"
        - **Input** `ipt novocliente insc municipal` (bTPKB) — placeholder: "00000000" · content: "{Parent:cpo.InscMunicipal:to_uppercase}" · props: disabled=True
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input copy 3` (bTPJr) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTPJw) — text: "Regime Tributário"
        - **Dropdown** `ipt novocliente regime` (bTPJv) — data_source: All(opt.RegimeTributario) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualRegimeTributario, disabled=True, dynamic_type="option.opt_regimetributario", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente) → default=opt.RegimeTributario.Lucro Real/Presumido
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group D` (bTPKU) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input` (bTPKf) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text D` (bTPKh) — text: "Razão Social"
        - **Input** `ipt novocliente razao` (bTPKg) — placeholder: "Razão social" · content: "{Parent:cpo.Razao:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando El[gp dados endereco clifor]:get_group_data:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.nome:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTPKZ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text D` (bTPKb) — text: "Nome Fantasia ou Nome Completo"
        - **Input** `ipt novocliente fantasia` (bTPKa) — placeholder: "Nome Fantasia ou Nome Completo" · content: "{Parent:cpo.Fantasia:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando El[gp dados endereco clifor]:get_group_data:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.fantasia:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group E` (bTPKm) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input copy 2` (bTPLD) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Group** `Group K` (bTPWC0) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Text** `Text E` (bTPLF) — text: "CEP"
          - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput cep` (bTPVq0) — props: AAE="cep", AAF="00000-000", AAo=True
        - **Input** `ipt novocliente cep` (bTPLE) — placeholder: "00000-000" · content: "{Parent:cpo.Cep}" · props: mandatory=True, disabled=True, unique_id="cep"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.cep:find_replace(find=".")}"
          - ⟂ quando Parent:is_not_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty):and_(Parent:cpo.Cep:is_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.cep:find_replace(find=".")}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTPKx) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text E` (bTPKz) — text: "Endereço"
        - **Input** `ipt novocliente endereco` (bTPKy) — placeholder: "Logradouro  e número" · content: "{Parent:cpo.Endereco:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_logradouro:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.logradouro:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.Endereco:is_empty):and_(Parent:cpo.CnpjCpf:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.logradouro:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.Endereco:is_empty):and_(Parent:cpo.CnpjCpf:is_empty):and_(Parent:cpo.Cep:is_not_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_logradouro:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTPKr) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text E` (bTPKt) — text: "Complemento"
        - **Input** `ipt novocliente complemento` (bTPKs) — placeholder: "Quadra, lote, casa, referência" · content: "{Parent:cpo.Complemento:to_capitalized_words}" · props: disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_complemento:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.complemento:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty):and_(Parent:cpo.Complemento:is_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.complemento:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group F` (bTPLK) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input` (bTPLb) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text F` (bTPLd) — text: "Bairro"
        - **Input** `ipt novocliente bairro` (bTPLc) — placeholder: "Nome do bairro" · content: "{Parent:cpo.Bairro:to_capitalized_words}" · props: disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_bairro:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.bairro:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty):and_(Parent:cpo.Bairro:is_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.bairro:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTPLV) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text F` (bTPLX) — text: "Município"
        - **Input** `ipt novocliente municipio` (bTPLW) — placeholder: "Município ou Cidade" · content: "{Parent:cpo.Municipio:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_localidade:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.municipio:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
        - **Input** `ipt busca uf api` (bTkEI) — oculto ao carregar · placeholder: "Município ou Cidade" · content: "{Parent:cpo.Municipio:to_capitalized_words}" · props: mandatory=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_localidade:to_uppercase}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.uf:to_uppercase}"
      - **Group** `g Input` (bTPLP) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text F` (bTPLR) — text: "UF"
        - **Dropdown** `ipt novocliente opt.uf` (bTPLQ) — data_source: All(Opt.UFs) · placeholder: "Sigla do estado" · props: mandatory=True, default=Parent:cpo.QualUfOpt, disabled=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_uf:to_capitalized_words}", default=Opt.UFs.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:uf_texto:equals(API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}}):_p_uf), constraint_type=∅}}):first_element
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.uf:to_uppercase}", default=Opt.UFs.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:uf_texto:equals(El[ipt busca uf api]:get_data), constraint_type=∅}}):first_element
          - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `g Input` (bTPLi) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
      - **Text** `Text G` (bTPLo) — text: "Localização"
      - **Group** `Group P` (bTerl) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Group** `Group Q` (bTezB) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **AutocompleteDropdown** `ipt novocliente localizacao` (bTPLn) — placeholder: "Busque pela localização do Google" · props: default=Parent:cpo.Localizacaoo, disabled=True, choices_style="geographic_places"
            - ⟂ quando Parent:cpo.Localizacaoo:is_empty:or_(Parent:is_empty) → default=El[ipt novocliente cep]:get_data
            - ⟂ quando Parent:cpo.Localizacaoo:is_not_empty:and_(Parent:cpo.Localizacaoo:is_not_empty):and_(El[ipt novocliente cep]:get_data:is_not_empty) → default=El[ipt novocliente cep]:get_data:find_replace(find="."):find_replace(find="-")
            - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
          - **Image** `Image A` (bTeyv) — props: src="https://img.icons8.com/?size=512&id=32215&format=png"
  - **Group** `show dados adicionais` (bTkFu) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - **Group** `esquerda` (bTkFR) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → is_visible=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Cliente)) → is_visible=True
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
      - **Group** `g Dropdown` (bTkEZ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Group** `Group AZ` (bTkHh) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Text** `Text M` (bTkEa) — text: "Corporativo: "
          - **Group** `Group DZ` (bTmQL) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
            - **Plugin[1680110374647x249108010620944400]/AAC** `chk corporativo` (bTkHb) — props: AAD=Parent:cpo.Corporativo, AAH="var(--color_primary_default)", AAP=0, AAR=0, nonant_alignment="ab"
            - **Text** `Text S` (bTmQF) — text: "SIM" · props: font_alignment="center", nonant_alignment="ab"
              - ⟂ quando El[chk corporativo]:get_AAI:is_false → is_visible=False
              - ⟂ quando El[chk corporativo]:get_AAI:is_true → is_visible=True
            - **Text** `Text T` (bTmQT) — text: "NÃO" · props: font_alignment="center", nonant_alignment="cb"
              - ⟂ quando El[chk corporativo]:get_AAI:is_false → is_visible=True
              - ⟂ quando El[chk corporativo]:get_AAI:is_true → is_visible=False
      - **Group** `g Input` (bTkET) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTkEU) — text: "Nome Comprador"
        - **Input** `ipt comprador` (bTkEV) — placeholder: "Digite " · content: "{Parent:cpo.NomeComprador}"
      - **Group** `g Input` (bTkEl) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTkEm) — text: "Capacidade de compra"
        - **Input** `ipt capacidade` (bTkEn) — placeholder: "Digite " · content: "{Parent:cpo.CapacidadeCompra}"
      - **Group** `Group Y` (bTmJo) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Group** `g Input` (bTkEr) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
          - **Text** `Text M` (bTkEs) — text: "Demanda"
          - **Input** `ipt demanda` (bTkEt) — placeholder: "Digite " · content: "{Parent:cpo.Demanda}"
        - **Group** `g Dropdown` (bTkEx) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
          - **Text** `Text M` (bTkEy) — text: "Frete"
          - **Dropdown** `dd frete` (bTkEz) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · props: default=Parent:cpo.Frete, dynamic_type="option.opt_tipofrete", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:display}"
      - **Group** `g MultilineInput` (bTkFJ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTkFK) — text: "Observação"
        - **MultiLineInput** `ipt observacao` (bTkFL) — placeholder: "Digite" · content: "{Parent:cpo.Observacoes}"
    - **Group** `direita` (bTkFh) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → is_visible=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente)) → is_visible=False
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=True
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Cliente)) → is_visible=False
      - **Group** `g Input` (bTkEf) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTkEg) — text: "Buscar produto"
        - **Group** `Group BZ` (bTmLn) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **AutocompleteDropdown** `ipt qual produto` (bTkEh) — data_source: Search(Tbl.ProdutosModelo: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Digite " · props: field_to_search="cpo_nome_text"
          - **Button** `Button D` (bTmLh) — props: icon="material outlined save", vertical_centering=True, icon_size=18, button_type="icon"
      - **Group** `Group CZ` (bTmMF) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Text** `Text Q` (bTmLy) — text: "Produtos desse fornecedor"
        - **Table** `Table B` (bTmJz) — data_source: Parent:cpo.QuaisProdutos · props: group_type="custom.tbl_produtos", vertical_centering=True
          - ⟂ quando Parent:is_empty → data_source=El[Reusable pop.AgendaEnderecos]:custom.var_quaisprodutos_
          - **TableMainAxis** `TableMainAxis C` (bTmKv) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis C` (bTmKw) — props: axis_index=1
          - **TableCrossAxis** `TableCrossAxis B` (bTmLB) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell D` (bTmLC) — props: cell_main_axis_id="bTmKv"
            - **TableCell** `Cell D` (bTmLD) — props: cell_main_axis_id="bTmKw"
          - **TableCrossAxis** `TableCrossAxis B` (bTmLI) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell D` (bTmLJ) — props: cell_main_axis_id="bTmKv"
              - **Text** `Text P` (bTmLZ) — text: "{Ancestor[TableCrossAxis]:cpo.NomeModelo:to_capitalized_words}"
            - **TableCell** `Cell D` (bTmLN) — props: cell_main_axis_id="bTmKw"
              - **Icon** `Icon F` (bTmLT) — props: icon="material outlined delete", vertical_centering=True
  - **Group** `gp alerta cnpj existente` (bTiBt) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - ⟂ quando El[rpg busca cnpj]:get_list_data:count:greater_or_equal_than(1):and_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Edita Endereço CliFor)) → is_visible=True
    - **Icon** `Icon E` (bTiBn) — props: icon="material outlined warning", vertical_centering=True
    - **Group** `Group S` (bTiCH) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Text** `Text K` (bTiBh) — text: "[b]LEIA COM ATENÇÃO! [/b]⏎Você pode continuar cadastrando esse CNPJ, mas ele já existe no(s) seguinte(s)⏎cliente(s)/fornecedore(s): "
      - **Table** `rpg busca cnpj` (bTmRf) — data_source: Search(Tbl.EnderecosCliFor: cpo.CnpjCpf equals "{El[ipt novo cliente cnpj]:get_data}") · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **TableMainAxis** `TableMainAxis E` (bTmSb) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis E` (bTmSc) — props: axis_index=1
        - **TableCrossAxis** `TableCrossAxis C` (bTmSh) — oculto ao carregar · props: axis_index=0
          - **TableCell** `Cell G` (bTmSi) — props: cell_main_axis_id="bTmSb"
          - **TableCell** `Cell G` (bTmSj) — props: cell_main_axis_id="bTmSc"
          - **TableCell** `Cell H` (bTmTd) — props: cell_main_axis_id="bTmTX"
        - **TableCrossAxis** `TableCrossAxis C` (bTmSo) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell G` (bTmSp) — props: cell_main_axis_id="bTmSb"
            - **Text** `Text U` (bTmSz) — text: "Grupo: {Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.NomeCliFor:to_uppercase}"
            - **Text** `Text V` (bTmTF) — text: "Grupo ativo: {Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Ativo:format_boolean(formatting_for_true="SIM", formatting_for_false="NÃO")}"
          - **TableCell** `Cell G` (bTmSt) — props: cell_main_axis_id="bTmSc"
            - **Text** `Text W` (bTmTL) — text: "Filial: {Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
            - **Text** `Text X` (bTmTR) — text: "Filial ativa: {Ancestor[TableCrossAxis]:cpo.Ativo:format_boolean(formatting_for_true="SIM", formatting_for_false="NÃO")}"
          - **TableCell** `Cell I` (bTmTj) — props: cell_main_axis_id="bTmTX"
            - **Button** `Button C` (bTiCS) — text: "Editar Cadastro" · props: icon="material outlined mode_edit", icon_size=16, button_type="label_icon"
        - **TableMainAxis** `Column C` (bTmTX) — props: axis_index=2
      - **Text** `Text L` (bTiCB) — text: "Deseja visualizar e/ou editar esse cadastro?"
  - **Group** `gp buttons` (bTPLt) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - **Button** `btn gravar novo endereço` (bTPLz) — text: "Gravar" · props: button_disabled=False
      - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → is_visible=True
      - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor) → is_visible=False
    - **Button** `btn salvar endereco` (bTPPp) — text: "Salvar"
      - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → is_visible=False
      - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor) → is_visible=True
    - **Button** `btn cancela endereco` (bTPLv) — text: "Cancela"
      - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor) → border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)"
- **Table** `rpg enderecos clifor` (bTPNT) — data_source: El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
  - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_:is_empty → is_visible=False
  - ⟂ quando El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_:is_not_empty → is_visible=True
  - **TableCrossAxis** `TableCrossAxis A` (bTPNV) — props: axis_index=1, cross_axis_repeat=True
    - **TableCell** `Cell A` (bTPNZ) — props: cell_main_axis_id="bTPNz"
      - **Icon** `btn edita endereço cliente` (bTPNa) — props: icon="material outlined edit", button_disabled=False
        - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2
      - **Icon** `Icon D` (bTPNb) — props: icon="material outlined my_location"
        - ⟂ quando Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
    - **TableCell** `Cell A` (bTPNg) — props: cell_main_axis_id="bTPOD"
      - **Text** `tx cidade endereco` (bTPNh) — text: "{Ancestor[TableCrossAxis]:cpo.Municipio:to_capitalized_words}/{Ancestor[TableCrossAxis]:cpo.UF:to_uppercase}"
    - **TableCell** `Cell A` (bTPNl) — props: cell_main_axis_id="bTPOE"
      - **Text** `tx nome endereco` (bTPNm) — text: "{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
    - **TableCell** `Cell B` (bTPWT0) — props: cell_main_axis_id="bTPWN0"
      - **Text** `tx cidade endereco` (bTPWr0) — text: "{Ancestor[TableCrossAxis]:cpo.CnpjCpf:to_capitalized_words}"
    - **TableCell** `Cell E` (bTmOh0) — props: cell_main_axis_id="bTmOb0"
      - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTeNJ) — auto_binding: True · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
  - **TableCrossAxis** `TableCrossAxis A` (bTPNn) — props: axis_index=0
    - **TableCell** `Cell A` (bTPNr) — props: cell_main_axis_id="bTPNz"
    - **TableCell** `Cell A` (bTPNt) — props: cell_main_axis_id="bTPOD"
    - **TableCell** `Cell A` (bTPNx) — props: cell_main_axis_id="bTPOE"
      - **Text** `Text H` (bTPNy) — text: "Endereços do cliente"
    - **TableCell** `Cell C` (bTPWZ0) — props: cell_main_axis_id="bTPWN0"
    - **TableCell** `Cell F` (bTmOn0) — props: cell_main_axis_id="bTmOb0"
      - **Text** `Text R` (bTmPJ0) — text: "Ativo"
  - **TableMainAxis** `TableMainAxis A` (bTPNz) — props: axis_index=3
  - **TableMainAxis** `TableMainAxis A` (bTPOD) — props: axis_index=1
  - **TableMainAxis** `TableMainAxis A` (bTPOE) — props: axis_index=0
  - **TableMainAxis** `TableMainAxis B` (bTPWN0) — props: axis_index=2
  - **TableMainAxis** `Column E` (bTmOb0) — props: axis_index=4

## Workflows

#### WF bTPMB — ButtonClicked em El[btn cancela endereco]
1. **HideElement** [bTeMX] alvo El[Reusable pop.AgendaEnderecos] · SÓ SE El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente):or_(El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor))
2. **SetCustomState** [bTPMH] alvo El[Reusable pop.AgendaEnderecos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={value=False, custom_state="custom.var_destravarcampos_"}}
3. **ResetGroup** [bTPQJ] alvo El[gp dados endereco clifor]

#### WF bTPMe — ButtonClicked em El[btn salvar endereco]
- props: event_color="orange"
1. **ChangeThing** [bTPMk] campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data:to_lowercase}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data:to_uppercase}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualNomeGrupoCliFor = "{Parent:cpo.QualGrupoCliFor:cpo.NomeCliFor}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.TipoClifor = El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.Ativo = El[tgg filial ativa]:get_AAI · to_change=El[gp dados endereco clifor]:get_group_data
2. **ChangeThing** [bTeOi] campos: cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data:to_uppercase}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.Captacao = El[dd captacao]:get_data; cpo.Ativo = El[tgg grupoativo]:get_AAI · to_change=ResultOfStep[bTPMk]:cpo.QualGrupoCliFor
3. **ResetInputs** [bTmMz] 
4. **ResetGroup** [bTPQH] alvo El[gp dados endereco clifor]
5. **SetCustomState** [bTPMq] alvo El[Reusable pop.AgendaEnderecos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={value=∅, custom_state="custom.var_quaisprodutos_"}, 2={value=False, custom_state="custom.var_destravarcampos_"}}
6. **ResetGroup** [bTkIP] alvo El[show dados adicionais]
7. **ChangeListOfThings** [bTmNL] campos: cpo.QuaisFornecedoresFiliais = ResultOfStep[bTPMk] · to_change=ResultOfStep[bTPMk]:cpo.QuaisProdutos, type_to_change="custom.tbl_produtos"

#### WF bTPOJ — ButtonClicked em El[btn edita endereço cliente]
1. **SetCustomState** [bTPOQ] alvo El[Reusable pop.AgendaEnderecos] · value=Opt.AçãoCliFor.Edita Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"}, 1={value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"}}

#### WF bTPOV — ButtonClicked em El[Icon D]
1. **OpenURL** [bTPOX] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.Localizacaoo:google_map_link}"

#### WF bTPPH — ButtonClicked em El[btn novo endereço cliente]
1. **SetCustomState** [bTPPM] alvo El[Reusable pop.AgendaEnderecos] · value=Opt.AçãoCliFor.Novo Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=True, custom_state="custom.var_destravarcampos_"}}

#### WF bTeKD — ButtonClicked em El[btn gravar novo endereço]
- condição: El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)
- props: event_color="blue", workflow_disabled=False
1. **NewThing** [bTeKg] tipo Tbl.GrupoCliFor · campos: cpo.Ativo = El[tgg grupoativo]:get_AAI; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data:to_uppercase}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.QualTipoCliFor = opt.TipoCliFor.Cliente; cpo.Captacao = El[dd captacao]:get_data
2. **NewThing** [bTeKU] tipo Tbl.EnderecosCliFor · campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_uppercase:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualGrupoCliFor = ResultOfStep[bTeKg]; cpo.QualNomeGrupoCliFor = "{ResultOfStep[bTeKg]:cpo.NomeCliFor}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.Principal = True; cpo.Ativo = El[tgg filial ativa]:get_AAI; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.TipoClifor = ResultOfStep[bTeKg]:cpo.QualTipoCliFor; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.QuaisProdutos = El[Reusable pop.AgendaEnderecos]:custom.var_quaisprodutos_
3. **ChangeThing** [bTeKV] campos: cpo.QuaisEnderecos = ResultOfStep[bTeKU] · to_change=ResultOfStep[bTeKg]
4. **ResetGroup** [bTeKZ] alvo El[gp dados endereco clifor]
5. **SetCustomState** [bTvnD] alvo El[Reusable pop.AgendaEnderecos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={value=ResultOfStep[bTeKg], custom_state="custom.var_qualgrupoclifor_"}, 2={value=∅, custom_state="custom.var_quaisprodutos_"}, 3={value=False, custom_state="custom.var_destravarcampos_"}}
6. **SetCustomState** [bTezX] alvo El[Reusable pop.AgendaEnderecos] · value=ResultOfStep[bTeKg], custom_state="custom.var_recemcadastrado_"
7. **ResetGroup** [bTkIF] alvo El[show dados adicionais]

#### WF bTeLc — ButtonClicked em El[btn gravar novo endereço]
- condição: El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)
- props: event_color="blue"
1. **NewThing** [bTeMF] tipo Tbl.GrupoCliFor · campos: cpo.Ativo = El[tgg grupoativo]:get_AAI; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.QualTipoCliFor = opt.TipoCliFor.Fornecedor; cpo.Captacao = El[dd captacao]:get_data
2. **NewThing** [bTmMu] tipo Tbl.EnderecosCliFor · campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_uppercase:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualGrupoCliFor = ResultOfStep[bTeMF]; cpo.QualNomeGrupoCliFor = "{ResultOfStep[bTeMF]:cpo.NomeCliFor}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.Principal = True; cpo.Ativo = El[tgg filial ativa]:get_AAI; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.TipoClifor = ResultOfStep[bTeMF]:cpo.QualTipoCliFor; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.QuaisProdutos = El[Reusable pop.AgendaEnderecos]:custom.var_quaisprodutos_
3. **ChangeThing** [bTeMH] campos: cpo.QuaisEnderecos = ResultOfStep[bTmMu] · to_change=ResultOfStep[bTeMF]
4. **ResetGroup** [bTeML] alvo El[gp dados endereco clifor]
5. **SetCustomState** [bTeMM] alvo El[Reusable pop.AgendaEnderecos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={value=ResultOfStep[bTeMF], custom_state="custom.var_qualgrupoclifor_"}, 2={value=∅, custom_state="custom.var_quaisprodutos_"}, 3={value=False, custom_state="custom.var_destravarcampos_"}}
6. **ResetGroup** [bTkIL] alvo El[show dados adicionais]
7. **ChangeListOfThings** [bTmNG] campos: cpo.QuaisFornecedoresFiliais = ResultOfStep[bTmMu] · to_change=ResultOfStep[bTmMu]:cpo.QuaisProdutos, type_to_change="custom.tbl_produtos"

#### WF bTeMq — ButtonClicked em El[ico fechar]
1. **ResetGroup** [bTeyt] alvo El[Reusable pop.AgendaEnderecos]
2. **SetCustomState** [bTmVD0] alvo El[Reusable pop.AgendaEnderecos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_quaisprodutos_"}, 1={value=∅, custom_state="custom.var_qualendereco_"}, 2={value=∅, custom_state="custom.var_qualgrupoclifor_"}}

#### WF bTeMw — ButtonClicked em El[ico fechar]
1. **HideElement** [bTeNB] alvo El[Reusable pop.AgendaEnderecos]
2. **SetCustomState** [bTeNC] alvo El[Reusable pop.AgendaEnderecos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}}
3. **ResetGroup** [bTeND] alvo El[gp dados endereco clifor]

#### WF bTezM — ButtonClicked em El[Image A]
- condição: El[ipt novocliente localizacao]:get_data:is_not_empty
1. **OpenURL** [bTjcS] open_in_new_tab=True, url="{El[ipt novocliente localizacao]:get_data:google_map_link}"

#### WF bTiCY — ButtonClicked em El[Button C]
1. **SetCustomState** [bTiCf] alvo El[Reusable pop.AgendaEnderecos] · value=Opt.AçãoCliFor.Edita Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"}, 1={value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"}}

#### WF bTkHT — ButtonClicked em El[gp tabs]
1. **ToggleElement** [bTkHZ] alvo El[show dados cadastrais]

#### WF bTmEq — ButtonClicked em El[Text O]
1. **ShowElement** [bTmEw] alvo El[show dados cadastrais]
2. **HideElement** [bTmEx] alvo El[show dados adicionais]

#### WF bTmFB — ButtonClicked em El[Text N]
1. **ShowElement** [bTmFH] alvo El[show dados adicionais]
2. **HideElement** [bTmFI] alvo El[show dados cadastrais]

#### WF bTmMV — ButtonClicked em El[Button D]
- condição: El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor)
1. **ChangeThing** [bTmMb] campos: cpo.QuaisProdutos = El[ipt qual produto]:get_data · to_change=Parent
2. **ResetInputs** [bTmMc] 

#### WF bTmMd — ButtonClicked em El[Button D]
- condição: El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Edita Endereço CliFor)
1. **SetCustomState** [bTmMo] alvo El[Reusable pop.AgendaEnderecos] · value=El[Reusable pop.AgendaEnderecos]:custom.var_quaisprodutos_:plus_element(El[ipt qual produto]:get_data), custom_state="custom.var_quaisprodutos_"
2. **ResetInputs** [bTmMj] 

#### WF bTmNR — ButtonClicked em El[Icon F]
- condição: El[gp dados endereco clifor]:get_group_data:is_empty
1. **SetCustomState** [bTmNe] alvo El[Reusable pop.AgendaEnderecos] · value=El[Reusable pop.AgendaEnderecos]:custom.var_quaisprodutos_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_quaisprodutos_"

#### WF bTmNf — ButtonClicked em El[Icon F]
- condição: El[gp dados endereco clifor]:get_group_data:is_not_empty
1. **ChangeThing** [bTmPP0] campos: cpo.QuaisFornecedoresFiliais = El[gp dados endereco clifor]:get_group_data · to_change=Ancestor[TableCrossAxis]
2. **ChangeThing** [bTmNp] campos: cpo.QuaisProdutos = Ancestor[TableCrossAxis] · to_change=El[gp dados endereco clifor]:get_group_data

#### WF bTmVv — Plugin[1680110374647x249108010620944400]/AAJ em El[tgg grupoativo]
1. **ChangeListOfThings** [bTmWB] campos: cpo.Ativo = This:get_AAI · to_change=Parent:cpo.QuaisEnderecos, type_to_change="custom.tbl_enderecosclifor"

#### WF bTPMM — ButtonClicked em El[btn gravar novo endereço]
- condição: El[Reusable pop.AgendaEnderecos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor)
- props: event_color="blue", workflow_disabled=False
1. **NewThing** [bTmMp] tipo Tbl.EnderecosCliFor · campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_uppercase:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualNomeGrupoCliFor = "{El[ipt nome grupoclifor]:get_data}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.Principal = True; cpo.Ativo = El[tgg filial ativa]:get_AAI; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.QuaisProdutos = El[Reusable pop.AgendaEnderecos]:custom.var_quaisprodutos_; cpo.QualGrupoCliFor = El[Reusable pop.AgendaEnderecos]:custom.var_qualgrupoclifor_; cpo.Ativo = El[tgg filial ativa]:get_AAI
2. **ChangeThing** [bTeOp] campos: cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.QuaisEnderecos = ResultOfStep[bTmMp]; cpo.Captacao = El[dd captacao]:get_data; cpo.Ativo = El[tgg grupoativo]:get_AAI · to_change=ResultOfStep[bTmMp]:cpo.QualGrupoCliFor
3. **ResetGroup** [bTPUb0] alvo El[gp dados endereco clifor]
4. **ResetGroup** [bTkIJ] alvo El[show dados adicionais]
5. **SetCustomState** [bTPMZ] alvo El[Reusable pop.AgendaEnderecos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={value=ResultOfStep[bTmMp]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"}, 2={value=∅, custom_state="custom.var_quaisprodutos_"}, 3={value=False, custom_state="custom.var_destravarcampos_"}}
6. **ChangeListOfThings** [bTmNB] campos: cpo.QuaisFornecedoresFiliais = ResultOfStep[bTmMp] · to_change=ResultOfStep[bTmMp]:cpo.QuaisProdutos, type_to_change="custom.tbl_produtos"

#### WF bTmON0 — ButtonClicked em El[Button E]
- condição: El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_false
1. **SetCustomState** [bTmOT0] alvo El[Reusable pop.AgendaEnderecos] · value=True, custom_state="custom.var_destravarcampos_"

#### WF bTmOU0 — ButtonClicked em El[Button E]
- condição: El[Reusable pop.AgendaEnderecos]:custom.var_destravarcampos_:is_true
1. **SetCustomState** [bTmOZ0] alvo El[Reusable pop.AgendaEnderecos] · value=False, custom_state="custom.var_destravarcampos_"
