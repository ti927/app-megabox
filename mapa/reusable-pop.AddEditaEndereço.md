# Reusable: `pop.AddEditaEndereço` (bTxcQ)

Estados customizados: `var_a__oclifor_` : Opt.AçãoCliFor; `var_qualendereco_` : Tbl.EnderecosCliFor; `var_quaisprodutos_` : list.custom.tbl_produtos (lista); `var_destravarcampos_` : boolean; `var_qualgrupoclifor_` : Tbl.GrupoCliFor

Resumo: 164 elementos · 20 workflows · 57 ações · 100 condicionais · 5 estados customizados
Elementos por tipo: Group 59, Text 42, Input 16, TableCell 10, Button 6, Dropdown 5, TableMainAxis 5, TableCrossAxis 4, Icon 3, Plugin[1680110374647x249108010620944400]/AAC 3, Plugin[1609444246883x924984661248573400]/AAD 2, AutocompleteDropdown 2, Table 2, PictureInput 1, Link 1, RadioButtons 1, MultiLineInput 1, Image 1

## Árvore de elementos

- **Group** `Group O` (bTxih) — props: vertical_centering=True
  - **Text** `Text A` (bTxij) — text: "Catálogo de Endereços" · props: font_alignment="center"
    - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor):or_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor)) → text="{El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:display:split_by(separator=" "):first_element} endereço do {El[Reusable pop.AddEditaEndereço]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor:display}"
    - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente) → text="Novo Cliente"
    - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor) → text="Novo Fornecedor"
  - **Icon** `ico fechar` (bTxii) — props: icon="material outlined close", vertical_centering=True
- **Group** `gp qual grupo clifor` (bTxit) — data_source: El[Reusable pop.AddEditaEndereço]:custom.var_qualgrupoclifor_ · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **Group** `Group KZ` (bTxjZ) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
    - **Group** `Group N` (bTxjd) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **PictureInput** `upi novocliente logo` (bTxje) — placeholder: "" · props: src="{Parent:cpo.Foto}"
        - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:is_empty → disabled=True
        - ⟂ quando Parent:cpo.Foto:is_empty → background_style="image", background_image="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Link** `Link A` (bTxjf) — props: linktype="url", icon="fa fa-search", open_in_new_tab=True, vertical_centering=True, url="{∅}https://www.google.com/search?q={El[ipt nome grupoclifor]:get_data} logo&udm=2&tbs=ic:trans", show_icon=True
        - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:is_empty → is_visible=False
    - **Input** `ipt nome grupoclifor` (bTxjj) — placeholder: "Nome cliente / fornecedor" · content: "{Parent:cpo.NomeCliFor:to_uppercase}" · props: mandatory=True, vertical_centering=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:get_data:is_empty → border_style_bottom="solid"
      - ⟂ quando This:is_hovered:or_(This:is_focused) → background_style="bgcolor", bgcolor="var(--color_primary_contrast_default)"
      - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → disabled=False
  - **Group** `Group IZ` (bTxiu) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
    - **Group** `Group JZ` (bTxiv) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Group** `Group HZ` (bTxiz) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor):or_(Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
        - **Text** `Text AZ` (bTxjA) — text: "Captação:"
        - **Dropdown** `dd captacao` (bTxjB) — data_source: All(Opt.CaptacaoCliente) · placeholder: "Selecione forma" · props: default=Parent:cpo.Captacao, dynamic_type="option.opt_captacaocliente", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `Group J` (bTxjF) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor):or_(Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
        - **Text** `Text J` (bTxjG) — text: "Carteira: "
        - **Dropdown** `dd carteira` (bTxjH) — data_source: Search(User; sort cpo.NomeModelo) · placeholder: "Selecione usuáro" · props: default=Parent:cpo.QualCarteira, dynamic_type="user", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group LZ` (bTxjL) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Group** `Group GZ` (bTxjM) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:is_empty → is_visible=False
        - **Text** `Text Z` (bTxjX) — text: "Grupo ativo: "
        - **Group** `Group GZ` (bTxjN) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg grupoativo` (bTxjR) — auto_binding: False · props: AAD=Parent:cpo.Ativo, AAH="var(--color_primary_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean", nonant_alignment="ab"
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → AAD=True
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → AAD=True
          - **Text** `Text Z` (bTxjS) — text: "SIM" · props: font_alignment="center", nonant_alignment="ab"
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_false → is_visible=False
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_true → is_visible=True
          - **Text** `Text Z` (bTxjT) — text: "NÃO" · props: font_alignment="center", nonant_alignment="cb"
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_false → is_visible=True
            - ⟂ quando El[tgg grupoativo]:get_AAI:is_true → is_visible=False
- **Group** `gp tabs` (bTxin) — props: vertical_centering=True
  - ⟂ quando El[gp dados endereco clifor]:is_visible → is_visible=True
  - ⟂ quando El[gp dados endereco clifor]:isnt_visible → is_visible=False
  - **Text** `Text O` (bTxio) — text: "Informações de Cadastro" · props: font_alignment="center", vertical_centering=True, four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="none"
    - ⟂ quando El[show dados cadastrais]:is_visible → border_color_top="var(--color_bTHGl_default)", border_style_top="solid", border_color_left="var(--color_bTHGl_default)", border_style_left="solid", border_color_right="var(--color_bTHGl_default)", border_style_right="solid"
    - ⟂ quando El[show dados adicionais]:is_visible → background_style="bgcolor", bgcolor="var(--color_bTHGh_default)", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid"
  - **Text** `Text N` (bTxip) — text: "Informações Adicionais" · props: font_alignment="center", vertical_centering=True, four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="none", border_roundness_right=5
    - ⟂ quando El[show dados adicionais]:is_visible → border_color_top="var(--color_bTHGl_default)", border_style_top="solid", border_color_left="var(--color_bTHGl_default)", border_style_left="solid", border_color_right="var(--color_bTHGl_default)", border_style_right="solid"
    - ⟂ quando El[show dados cadastrais]:is_visible → background_style="bgcolor", bgcolor="var(--color_bTHGh_default)", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid"
- **Group** `gp dados endereco clifor` (bTxhf) — data_source: El[Reusable pop.AddEditaEndereço]:custom.var_qualendereco_ · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, border_color_left="var(--color_bTHGl_default)", border_style_left="solid", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_style_right="solid", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=10
  - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor):or_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor)):or_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → is_visible=True
  - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:is_empty → is_visible=False
  - **Group** `show dados cadastrais` (bTxes) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - **Group** `Group EZ` (bTxeb) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `Group FZ` (bTxeg) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Text** `Text Y` (bTxer) — text: "Filial ativa:"
        - **Group** `Group EZ` (bTxeh) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg filial ativa` (bTxel) — props: AAD=Parent:cpo.Ativo, AAH="var(--color_primary_default)", AAP=0, AAR=0, nonant_alignment="ab"
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → AAD=True
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → AAD=True
            - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor)) → AAD=True
          - **Text** `Text Y` (bTxem) — text: "SIM" · props: font_alignment="center", nonant_alignment="ab"
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_false → is_visible=False
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_true → is_visible=True
          - **Text** `Text Y` (bTxen) — text: "NÃO" · props: font_alignment="center", nonant_alignment="cb"
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_false → is_visible=True
            - ⟂ quando El[tgg filial ativa]:get_AAI:is_true → is_visible=False
      - **Button** `Button E` (bTxef) — text: "Destravar Campos" · props: icon="material outlined lock_open", icon_size=16, button_type="label_icon", button_disabled=True
        - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → font_color="#FFFFFF", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
        - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente):or_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Cliente)) → button_disabled=False
        - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:less_or_equal_than(3):or_(CurrentUser:cpo.QualDepto:equals(Opt.DeptoUsuario.Financeiro)) → button_disabled=False
    - **Group** `g Input` (bTxcR) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
      - **Text** `Text B` (bTxcV) — text: "Identificação do Endereço"
      - **Group** `Group X` (bTxcW) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Input** `ipt novo cliente id endereço` (bTxcX) — placeholder: "Ex: Matriz, Filial, Depósito, etc." · content: "{Parent:cpo.NomeEndereco:to_capitalized_words}" · props: disabled=True
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group C` (bTxcb) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input` (bTxcu) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTxdG) — text: "Cpf/Cnpj"
        - **Group** `Group C` (bTxcv) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Group** `Group L` (bTxcz) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
            - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)"
            - **Input** `ipt novo cliente cnpj` (bTxdA) — placeholder: "Somente números" · content: "{Parent:cpo.CnpjCpf}" · props: mandatory=True, disabled=True, unique_id="cnpj"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cpf) → placeholder="000.000.000-00", unique_id="{∅}cpf"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cnpj) → placeholder="00.000.000-0000/00", unique_id="{∅}cnpj"
              - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
            - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput cnpj` (bTxdF) — props: AAE="", AAF="", AAo=True
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cpf) → AAE="{∅}cpf", AAF="{∅}000.000.000-00"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cnpj) → AAE="{∅}cnpj", AAF="{∅}00.000.000-0000/00"
            - **RadioButtons** `RadioButtons cpfcnpj` (bTxdB) — data_source: All(Opt.TipoPessoa) · props: mandatory=True, columns=2, default=Parent:cpo.TipoPessoa, disabled=True, dynamic_type="option.opt_tipopessoa", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
              - ⟂ quando Parent:is_empty → default=Opt.TipoPessoa.cnpj
              - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → disabled=False
      - **Group** `g Input` (bTxco) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTxct) — text: "Insc Estadual"
        - **Input** `ipt novocliente insc estadual` (bTxcp) — placeholder: "00000000" · content: "{Parent:cpo.InscEstadual:to_uppercase}" · props: disabled=True
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTxci) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTxcn) — text: "Insc Municipal"
        - **Input** `ipt novocliente insc municipal` (bTxcj) — placeholder: "00000000" · content: "{Parent:cpo.InscMunicipal:to_uppercase}" · props: disabled=True
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input copy 3` (bTxcc) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTxch) — text: "Regime Tributário"
        - **Dropdown** `ipt novocliente regime` (bTxcd) — data_source: All(opt.RegimeTributario) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualRegimeTributario, disabled=True, dynamic_type="option.opt_regimetributario", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente) → default=opt.RegimeTributario.Lucro Real/Presumido
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group D` (bTxdH) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input` (bTxdR) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text D` (bTxdT) — text: "Razão Social"
        - **Input** `ipt novocliente razao` (bTxdS) — placeholder: "Razão social" · content: "{Parent:cpo.Razao:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando El[gp dados endereco clifor]:get_group_data:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.nome:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTxdL) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text D` (bTxdN) — text: "Nome Fantasia ou Nome Completo"
        - **Input** `ipt novocliente fantasia` (bTxdM) — placeholder: "Nome Fantasia ou Nome Completo" · content: "{Parent:cpo.Fantasia:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando El[gp dados endereco clifor]:get_group_data:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.fantasia:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group E` (bTxdX) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input copy 2` (bTxdk) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Group** `Group K` (bTxdp) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Text** `Text E` (bTxdr) — text: "CEP"
          - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput cep` (bTxdq) — props: AAE="cep", AAF="00000-000", AAo=True
        - **Input** `ipt novocliente cep` (bTxdl) — placeholder: "00000-000" · content: "{Parent:cpo.Cep}" · props: mandatory=True, disabled=True, unique_id="cep"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.cep:find_replace(find=".")}"
          - ⟂ quando Parent:is_not_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty):and_(Parent:cpo.Cep:is_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.cep:find_replace(find=".")}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTxde) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text E` (bTxdj) — text: "Endereço"
        - **Input** `ipt novocliente endereco` (bTxdf) — placeholder: "Logradouro  e número" · content: "{Parent:cpo.Endereco:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_logradouro:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.logradouro:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.Endereco:is_empty):and_(Parent:cpo.CnpjCpf:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.logradouro:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.Endereco:is_empty):and_(Parent:cpo.CnpjCpf:is_empty):and_(Parent:cpo.Cep:is_not_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_logradouro:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTxdY) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text E` (bTxdd) — text: "Complemento"
        - **Input** `ipt novocliente complemento` (bTxdZ) — placeholder: "Quadra, lote, casa, referência" · content: "{Parent:cpo.Complemento:to_capitalized_words}" · props: disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_complemento:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.complemento:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty):and_(Parent:cpo.Complemento:is_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.complemento:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
    - **Group** `Group F` (bTxdv) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `g Input` (bTxeJ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text F` (bTxeO) — text: "Bairro"
        - **Input** `ipt novocliente bairro` (bTxeN) — placeholder: "Nome do bairro" · content: "{Parent:cpo.Bairro:to_capitalized_words}" · props: disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_bairro:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.bairro:to_capitalized_words}"
          - ⟂ quando Parent:is_not_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty):and_(Parent:cpo.Bairro:is_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.bairro:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `g Input` (bTxeC) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text F` (bTxeH) — text: "Município"
        - **Input** `ipt novocliente municipio` (bTxeD) — placeholder: "Município ou Cidade" · content: "{Parent:cpo.Municipio:to_capitalized_words}" · props: mandatory=True, disabled=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_localidade:to_capitalized_words}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.municipio:to_capitalized_words}"
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
        - **Input** `ipt busca uf api` (bTxeI) — oculto ao carregar · placeholder: "Município ou Cidade" · content: "{Parent:cpo.Municipio:to_capitalized_words}" · props: mandatory=True
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_localidade:to_uppercase}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.uf:to_uppercase}"
      - **Group** `g Input` (bTxdw) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text F` (bTxeB) — text: "UF"
        - **Dropdown** `ipt novocliente opt.uf` (bTxdx) — data_source: All(Opt.UFs) · placeholder: "Sigla do estado" · props: mandatory=True, default=Parent:cpo.QualUfOpt, disabled=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Parent:is_empty:and_(El[ipt novocliente cep]:get_data:is_not_empty):and_(El[ipt novo cliente cnpj]:get_data:is_empty) → content="{API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_uf:to_capitalized_words}", default=Opt.UFs.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:uf_texto:equals(API({"provider": "1519170218471x969128757943861200.AAC", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTxdl"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}}):_p_uf), constraint_type=∅}}):first_element
          - ⟂ quando Parent:is_empty:and_(El[ipt novo cliente cnpj]:get_data:is_not_empty) → content="{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.uf:to_uppercase}", default=Opt.UFs.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:uf_texto:equals(El[ipt busca uf api]:get_data), constraint_type=∅}}):first_element
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
  - **Group** `show dados adicionais` (bTxfu) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - **Group** `esquerda` (bTxfv) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)) → is_visible=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Cliente)) → is_visible=True
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=False
      - **Group** `g Dropdown` (bTxgF) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Group** `Group AZ` (bTxgG) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Text** `Text M` (bTxgH) — text: "Corporativo: "
          - **Group** `Group DZ` (bTxgL) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
            - **Plugin[1680110374647x249108010620944400]/AAC** `chk corporativo` (bTxgM) — props: AAD=Parent:cpo.Corporativo, AAH="var(--color_primary_default)", AAP=0, AAR=0, nonant_alignment="ab"
            - **Text** `Text S` (bTxgN) — text: "SIM" · props: font_alignment="center", nonant_alignment="ab"
              - ⟂ quando El[chk corporativo]:get_AAI:is_false → is_visible=False
              - ⟂ quando El[chk corporativo]:get_AAI:is_true → is_visible=True
            - **Text** `Text T` (bTxgR) — text: "NÃO" · props: font_alignment="center", nonant_alignment="cb"
              - ⟂ quando El[chk corporativo]:get_AAI:is_false → is_visible=True
              - ⟂ quando El[chk corporativo]:get_AAI:is_true → is_visible=False
      - **Group** `g Input` (bTxfz) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTxgA) — text: "Nome Comprador"
        - **Input** `ipt comprador` (bTxgB) — placeholder: "Digite " · content: "{Parent:cpo.NomeComprador}"
      - **Group** `g Input` (bTxgf) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTxgj) — text: "Capacidade de compra"
        - **Input** `ipt capacidade` (bTxgk) — placeholder: "Digite " · content: "{Parent:cpo.CapacidadeCompra}"
      - **Group** `Group Y` (bTxgS) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Group** `g Input` (bTxgT) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
          - **Text** `Text M` (bTxgX) — text: "Demanda"
          - **Input** `ipt demanda` (bTxgY) — placeholder: "Digite " · content: "{Parent:cpo.Demanda}"
        - **Group** `g Dropdown` (bTxgZ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
          - **Text** `Text M` (bTxgd) — text: "Frete"
          - **Dropdown** `dd frete` (bTxge) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · props: default=Parent:cpo.Frete, dynamic_type="option.opt_tipofrete", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:display}"
      - **Group** `g MultilineInput` (bTxgl) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTxgp) — text: "Observação"
        - **MultiLineInput** `ipt observacao` (bTxgq) — placeholder: "Digite" · content: "{Parent:cpo.Observacoes}"
    - **Group** `direita` (bTxgr) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → is_visible=True
      - ⟂ quando Parent:is_empty:and_(El[Reusable pop.AddEditaEndereço]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente)) → is_visible=False
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Fornecedor)) → is_visible=True
      - ⟂ quando Parent:is_not_empty:and_(Parent:cpo.TipoClifor:equals(opt.TipoCliFor.Cliente)) → is_visible=False
      - **Group** `g Input` (bTxhU) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text M` (bTxhb) — text: "Buscar produto"
        - **Group** `Group BZ` (bTxhV) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **AutocompleteDropdown** `ipt qual produto` (bTxha) — data_source: Search(Tbl.ProdutosModelo: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Digite " · props: field_to_search="cpo_nome_text"
          - **Button** `Button D` (bTxhZ) — props: icon="material outlined save", vertical_centering=True, icon_size=18, button_type="icon"
      - **Group** `Group CZ` (bTxgv) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **Text** `Text Q` (bTxgw) — text: "Produtos desse fornecedor"
        - **Table** `Table B` (bTxgx) — data_source: Parent:cpo.QuaisProdutos · props: group_type="custom.tbl_produtos", vertical_centering=True
          - ⟂ quando Parent:is_empty → data_source=El[Reusable pop.AddEditaEndereço]:custom.var_quaisprodutos_
          - **TableMainAxis** `TableMainAxis C` (bTxhB) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis C` (bTxhC) — props: axis_index=1
          - **TableCrossAxis** `TableCrossAxis B` (bTxhD) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell D` (bTxhH) — props: cell_main_axis_id="bTxhB"
            - **TableCell** `Cell D` (bTxhI) — props: cell_main_axis_id="bTxhC"
          - **TableCrossAxis** `TableCrossAxis B` (bTxhJ) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell D` (bTxhN) — props: cell_main_axis_id="bTxhB"
              - **Text** `Text P` (bTxhO) — text: "{Ancestor[TableCrossAxis]:cpo.NomeModelo:to_capitalized_words}"
            - **TableCell** `Cell D` (bTxhP) — props: cell_main_axis_id="bTxhC"
              - **Icon** `Icon F` (bTxhT) — props: icon="material outlined delete", vertical_centering=True
  - **Group** `gp alerta cnpj existente` (bTxfD) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - ⟂ quando El[rpg busca cnpj]:get_list_data:count:greater_or_equal_than(1):and_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Edita Endereço CliFor)) → is_visible=True
    - **Icon** `Icon E` (bTxfE) — props: icon="material outlined warning", vertical_centering=True
    - **Group** `Group S` (bTxfF) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Text** `Text K` (bTxfJ) — text: "[b]LEIA COM ATENÇÃO! [/b]⏎Você pode continuar cadastrando esse CNPJ, mas ele já existe no(s) seguinte(s)⏎cliente(s)/fornecedore(s): "
      - **Table** `rpg busca cnpj` (bTxfL) — data_source: Search(Tbl.EnderecosCliFor: cpo.CnpjCpf equals "{El[ipt novo cliente cnpj]:get_data}") · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **TableMainAxis** `TableMainAxis E` (bTxfP) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis E` (bTxfQ) — props: axis_index=1
        - **TableCrossAxis** `TableCrossAxis C` (bTxfR) — oculto ao carregar · props: axis_index=0
          - **TableCell** `Cell G` (bTxfV) — props: cell_main_axis_id="bTxfP"
          - **TableCell** `Cell G` (bTxfW) — props: cell_main_axis_id="bTxfQ"
          - **TableCell** `Cell H` (bTxfX) — props: cell_main_axis_id="bTxft"
        - **TableCrossAxis** `TableCrossAxis C` (bTxfb) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell G` (bTxfc) — props: cell_main_axis_id="bTxfP"
            - **Text** `Text U` (bTxfd) — text: "Grupo: {Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.NomeCliFor:to_uppercase}"
            - **Text** `Text V` (bTxfh) — text: "Grupo ativo: {Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Ativo:format_boolean(formatting_for_true="SIM", formatting_for_false="NÃO")}"
          - **TableCell** `Cell G` (bTxfi) — props: cell_main_axis_id="bTxfQ"
            - **Text** `Text W` (bTxfj) — text: "Filial: {Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
            - **Text** `Text X` (bTxfn) — text: "Filial ativa: {Ancestor[TableCrossAxis]:cpo.Ativo:format_boolean(formatting_for_true="SIM", formatting_for_false="NÃO")}"
          - **TableCell** `Cell I` (bTxfo) — props: cell_main_axis_id="bTxft"
            - **Button** `Button C` (bTxfp) — text: "Editar Cadastro" · props: icon="material outlined mode_edit", icon_size=16, button_type="label_icon"
        - **TableMainAxis** `Column C` (bTxft) — props: axis_index=2
      - **Text** `Text L` (bTxfK) — text: "Deseja visualizar e/ou editar esse cadastro?"
  - **Group** `g Input` (bTxeP) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
    - **Text** `Text G` (bTxeT) — text: "Localização"
    - **Group** `Group P` (bTxeU) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - **Group** `Group Q` (bTxeV) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
        - **AutocompleteDropdown** `ipt novocliente localizacao` (bTxeZ) — placeholder: "Busque pela localização do Google" · props: default=Parent:cpo.Localizacaoo, disabled=True, choices_style="geographic_places"
          - ⟂ quando Parent:cpo.Localizacaoo:is_empty:or_(Parent:is_empty) → default=El[ipt novocliente cep]:get_data
          - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true → bgcolor="var(--color_primary_contrast_default)", disabled=False
        - **Image** `Image A` (bTxea) — props: src="https://img.icons8.com/?size=512&id=32215&format=png"
  - **Group** `gp buttons` (bTxet) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
    - **Button** `btn gravar novo endereço` (bTxey) — text: "Gravar" · props: button_disabled=False
      - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor):or_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)):or_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → is_visible=True
      - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor) → is_visible=False
    - **Button** `btn salvar endereco` (bTxez) — text: "Salvar"
      - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor):or_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)):or_(El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)) → is_visible=False
      - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor) → is_visible=True
    - **Button** `btn cancela endereco` (bTxex) — text: "Cancela"
      - ⟂ quando El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor) → border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)"

## Workflows

#### WF bTxjk — ButtonClicked em El[btn cancela endereco]
1. **SetCustomState** [bTxjp] alvo El[Reusable pop.AddEditaEndereço] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={value=False, custom_state="custom.var_destravarcampos_"}, 2={value=∅, custom_state="custom.var_quaisprodutos_"}, 3={value=∅, custom_state="custom.var_qualgrupoclifor_"}}
2. **ResetGroup** [bTxjq] alvo El[gp dados endereco clifor]
3. **HideElement** [bTxjl] alvo El[Reusable pop.AddEditaEndereço]

#### WF bTxjr — ButtonClicked em El[btn salvar endereco]
- props: event_color="orange"
1. **ChangeThing** [bTxjv] campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data:to_lowercase}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data:to_uppercase}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualNomeGrupoCliFor = "{Parent:cpo.QualGrupoCliFor:cpo.NomeCliFor}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.TipoClifor = El[Reusable pop.AddEditaEndereço]:custom.var_qualgrupoclifor_:cpo.QualTipoCliFor; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.Ativo = El[tgg filial ativa]:get_AAI · to_change=El[gp dados endereco clifor]:get_group_data
2. **ChangeThing** [bTxjw] campos: cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data:to_uppercase}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.Captacao = El[dd captacao]:get_data; cpo.Ativo = El[tgg grupoativo]:get_AAI · to_change=ResultOfStep[bTxjv]:cpo.QualGrupoCliFor
3. **ResetInputs** [bTxjx] 
4. **SetCustomState** [bTxkC] alvo El[Reusable pop.AddEditaEndereço] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={value=∅, custom_state="custom.var_quaisprodutos_"}, 2={value=False, custom_state="custom.var_destravarcampos_"}}
5. **ResetGroup** [bTxkD] alvo El[show dados adicionais]
6. **ChangeListOfThings** [bTxkH] campos: cpo.QuaisFornecedoresFiliais = ResultOfStep[bTxjv] · to_change=ResultOfStep[bTxjv]:cpo.QuaisProdutos, type_to_change="custom.tbl_produtos"
7. **ResetGroup** [bTxkB] alvo El[gp dados endereco clifor]
8. **HideElement** [bTxnx] alvo El[Reusable pop.AddEditaEndereço]

#### WF bTxkU — ButtonClicked em El[btn gravar novo endereço]
- condição: El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Cliente)
- props: event_color="blue", workflow_disabled=False
1. **NewThing** [bTxkV] tipo Tbl.GrupoCliFor · campos: cpo.Ativo = El[tgg grupoativo]:get_AAI; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data:to_uppercase}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.QualTipoCliFor = opt.TipoCliFor.Cliente; cpo.Captacao = El[dd captacao]:get_data
2. **NewThing** [bTxkZ] tipo Tbl.EnderecosCliFor · campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_uppercase:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualGrupoCliFor = ResultOfStep[bTxkV]; cpo.QualNomeGrupoCliFor = "{ResultOfStep[bTxkV]:cpo.NomeCliFor}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.Principal = True; cpo.Ativo = El[tgg filial ativa]:get_AAI; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.TipoClifor = ResultOfStep[bTxkV]:cpo.QualTipoCliFor; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.QuaisProdutos = El[Reusable pop.AddEditaEndereço]:custom.var_quaisprodutos_
3. **ChangeThing** [bTxka] campos: cpo.QuaisEnderecos = ResultOfStep[bTxkZ] · to_change=ResultOfStep[bTxkV]
4. **NewThing** [bUCVe] tipo Tbl.Historico · campos: cpo.Descricao = "Cliente criado/Endereço adicionado{∅}"; cpo.QualCliente = ResultOfStep[bTxkV]
5. **ChangeThing** [bUEpg] campos: cpo.UltimoHistoricoData = Page.Current Date/Time · to_change=ResultOfStep[bTxkV]
6. **ResetGroup** [bTxkb] alvo El[gp dados endereco clifor]
7. **SetCustomState** [bTxkf] alvo El[Reusable pop.AddEditaEndereço] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={custom_state="custom.var_qualgrupoclifor_"}, 2={value=∅, custom_state="custom.var_quaisprodutos_"}, 3={value=False, custom_state="custom.var_destravarcampos_"}}
8. **ResetGroup** [bTxkh] alvo El[show dados adicionais]
9. **HideElement** [bTxnl] alvo El[Reusable pop.AddEditaEndereço]

#### WF bTxkl — ButtonClicked em El[btn gravar novo endereço]
- condição: El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Fornecedor)
- props: event_color="blue"
1. **NewThing** [bTxkm] tipo Tbl.GrupoCliFor · campos: cpo.Ativo = El[tgg grupoativo]:get_AAI; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.QualTipoCliFor = opt.TipoCliFor.Fornecedor; cpo.Captacao = El[dd captacao]:get_data
2. **NewThing** [bTxkn] tipo Tbl.EnderecosCliFor · campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_uppercase:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualGrupoCliFor = ResultOfStep[bTxkm]; cpo.QualNomeGrupoCliFor = "{ResultOfStep[bTxkm]:cpo.NomeCliFor}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.Principal = True; cpo.Ativo = El[tgg filial ativa]:get_AAI; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.TipoClifor = ResultOfStep[bTxkm]:cpo.QualTipoCliFor; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.QuaisProdutos = El[Reusable pop.AddEditaEndereço]:custom.var_quaisprodutos_
3. **ChangeThing** [bTxkr] campos: cpo.QuaisEnderecos = ResultOfStep[bTxkn] · to_change=ResultOfStep[bTxkm]
4. **ResetGroup** [bTxks] alvo El[gp dados endereco clifor]
5. **SetCustomState** [bTxkt] alvo El[Reusable pop.AddEditaEndereço] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={custom_state="custom.var_qualgrupoclifor_"}, 2={value=∅, custom_state="custom.var_quaisprodutos_"}, 3={value=False, custom_state="custom.var_destravarcampos_"}}
6. **ResetGroup** [bTxkx] alvo El[show dados adicionais]
7. **ChangeListOfThings** [bTxky] campos: cpo.QuaisFornecedoresFiliais = ResultOfStep[bTxkn] · to_change=ResultOfStep[bTxkn]:cpo.QuaisProdutos, type_to_change="custom.tbl_produtos"
8. **HideElement** [bTxnn] alvo El[Reusable pop.AddEditaEndereço]

#### WF bTxkz — ButtonClicked em El[ico fechar]
1. **ResetGroup** [bTxlD] alvo El[Reusable pop.AddEditaEndereço]
2. **SetCustomState** [bTxlE] alvo El[Reusable pop.AddEditaEndereço] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_quaisprodutos_"}, 1={value=∅, custom_state="custom.var_qualendereco_"}, 2={value=∅, custom_state="custom.var_qualgrupoclifor_"}}

#### WF bTxlF — ButtonClicked em El[ico fechar]
1. **HideElement** [bTxlJ] alvo El[Reusable pop.AddEditaEndereço]
2. **SetCustomState** [bTxlK] alvo El[Reusable pop.AddEditaEndereço] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}}
3. **ResetGroup** [bTxlL] alvo El[gp dados endereco clifor]

#### WF bTxlP — ButtonClicked em El[Image A]
- condição: El[ipt novocliente localizacao]:get_data:is_not_empty
1. **OpenURL** [bTxlQ] open_in_new_tab=True, url="{El[ipt novocliente localizacao]:get_data:google_map_link}"

#### WF bTxlR — ButtonClicked em El[Button C]
1. **SetCustomState** [bTxlV] alvo El[Reusable pop.AddEditaEndereço] · value=Opt.AçãoCliFor.Edita Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"}, 1={value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"}}

#### WF bTxlW — ButtonClicked em El[gp tabs]
1. **ToggleElement** [bTxlX] alvo El[show dados cadastrais]

#### WF bTxlb — ButtonClicked em El[Text O]
1. **ShowElement** [bTxlc] alvo El[show dados cadastrais]
2. **HideElement** [bTxld] alvo El[show dados adicionais]

#### WF bTxlh — ButtonClicked em El[Text N]
1. **ShowElement** [bTxli] alvo El[show dados adicionais]
2. **HideElement** [bTxlj] alvo El[show dados cadastrais]

#### WF bTxln — ButtonClicked em El[Button D]
- condição: El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Endereço CliFor)
1. **ChangeThing** [bTxlo] campos: cpo.QuaisProdutos = El[ipt qual produto]:get_data · to_change=Parent
2. **ResetInputs** [bTxlp] 

#### WF bTxlt — ButtonClicked em El[Button D]
- condição: El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Edita Endereço CliFor)
1. **SetCustomState** [bTxlu] alvo El[Reusable pop.AddEditaEndereço] · value=El[Reusable pop.AddEditaEndereço]:custom.var_quaisprodutos_:plus_element(El[ipt qual produto]:get_data), custom_state="custom.var_quaisprodutos_"
2. **ResetInputs** [bTxlv] 

#### WF bTxlz — ButtonClicked em El[Icon F]
- condição: El[gp dados endereco clifor]:get_group_data:is_empty
1. **SetCustomState** [bTxmA] alvo El[Reusable pop.AddEditaEndereço] · value=El[Reusable pop.AddEditaEndereço]:custom.var_quaisprodutos_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_quaisprodutos_"

#### WF bTxmB — ButtonClicked em El[Icon F]
- condição: El[gp dados endereco clifor]:get_group_data:is_not_empty
1. **ChangeThing** [bTxmF] campos: cpo.QuaisFornecedoresFiliais = El[gp dados endereco clifor]:get_group_data · to_change=Ancestor[TableCrossAxis]
2. **ChangeThing** [bTxmG] campos: cpo.QuaisProdutos = Ancestor[TableCrossAxis] · to_change=El[gp dados endereco clifor]:get_group_data

#### WF bTxmH — Plugin[1680110374647x249108010620944400]/AAJ em El[tgg grupoativo]
1. **ChangeListOfThings** [bTxmL] campos: cpo.Ativo = This:get_AAI · to_change=Parent:cpo.QuaisEnderecos, type_to_change="custom.tbl_enderecosclifor"

#### WF bTxmM — ButtonClicked em El[btn gravar novo endereço]
- condição: El[Reusable pop.AddEditaEndereço]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Endereço CliFor)
- props: event_color="blue", workflow_disabled=False
1. **NewThing** [bTxmN] tipo Tbl.EnderecosCliFor · campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data:to_lowercase}"; cpo.Cep = "{El[ipt novocliente cep]:get_data}"; cpo.CnpjCpf = "{El[ipt novo cliente cnpj]:get_data}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data:to_uppercase:to_lowercase}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data:to_lowercase}"; cpo.Fantasia = "{El[ipt novocliente fantasia]:get_data:to_lowercase}"; cpo.InscEstadual = "{El[ipt novocliente insc estadual]:get_data:to_lowercase}"; cpo.InscMunicipal = "{El[ipt novocliente insc municipal]:get_data:to_lowercase}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data:to_lowercase}"; cpo.NomeEndereco = "{El[ipt novo cliente id endereço]:get_data:to_lowercase}"; cpo.QualNomeGrupoCliFor = "{El[ipt nome grupoclifor]:get_data}"; cpo.QualRegimeTributario = El[ipt novocliente regime]:get_data; cpo.Razao = "{El[ipt novocliente razao]:get_data:to_lowercase}"; cpo.UF = "{El[ipt novocliente opt.uf]:get_data:uf_texto}"; cpo.Principal = True; cpo.Ativo = El[tgg filial ativa]:get_AAI; cpo.QualUfOpt = El[ipt novocliente opt.uf]:get_data; cpo.TipoPessoa = El[RadioButtons cpfcnpj]:get_data; cpo.CapacidadeCompra = "{El[ipt capacidade]:get_data}"; cpo.Corporativo = El[chk corporativo]:get_AAI; cpo.Demanda = "{El[ipt demanda]:get_data}"; cpo.Frete = El[dd frete]:get_data; cpo.NomeComprador = "{El[ipt comprador]:get_data}"; cpo.Observacoes = "{El[ipt observacao]:get_data}"; cpo.QuaisProdutos = El[Reusable pop.AddEditaEndereço]:custom.var_quaisprodutos_; cpo.QualGrupoCliFor = El[Reusable pop.AddEditaEndereço]:custom.var_qualgrupoclifor_; cpo.Ativo = El[tgg filial ativa]:get_AAI
2. **ChangeThing** [bTxmR] campos: cpo.NomeCliFor = "{El[ipt nome grupoclifor]:get_data}"; cpo.QualCarteira = El[dd carteira]:get_data; cpo.Foto = "{El[upi novocliente logo]:get_data}"; cpo.QuaisEnderecos = ResultOfStep[bTxmN]; cpo.Captacao = El[dd captacao]:get_data; cpo.Ativo = El[tgg grupoativo]:get_AAI · to_change=ResultOfStep[bTxmN]:cpo.QualGrupoCliFor
3. **ResetGroup** [bTxmS] alvo El[gp dados endereco clifor]
4. **ResetGroup** [bTxmT] alvo El[show dados adicionais]
5. **SetCustomState** [bTxmX] alvo El[Reusable pop.AddEditaEndereço] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualendereco_"}, 1={custom_state="custom.var_qualgrupoclifor_"}, 2={value=∅, custom_state="custom.var_quaisprodutos_"}, 3={value=False, custom_state="custom.var_destravarcampos_"}}
6. **ChangeListOfThings** [bTxmY] campos: cpo.QuaisFornecedoresFiliais = ResultOfStep[bTxmN] · to_change=ResultOfStep[bTxmN]:cpo.QuaisProdutos, type_to_change="custom.tbl_produtos"
7. **HideElement** [bTxns] alvo El[Reusable pop.AddEditaEndereço]

#### WF bTxnJ — PopupClosed em El[Reusable pop.AddEditaEndereço]

#### WF bTxmZ — ButtonClicked em El[Button E]
- condição: El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_false
1. **SetCustomState** [bTxmd] alvo El[Reusable pop.AddEditaEndereço] · value=True, custom_state="custom.var_destravarcampos_"

#### WF bTxme — ButtonClicked em El[Button E]
- condição: El[Reusable pop.AddEditaEndereço]:custom.var_destravarcampos_:is_true
1. **SetCustomState** [bTxmf] alvo El[Reusable pop.AddEditaEndereço] · value=False, custom_state="custom.var_destravarcampos_"
