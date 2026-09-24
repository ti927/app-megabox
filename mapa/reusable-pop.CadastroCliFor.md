# Reusable: `pop.CadastroCliFor` (bTgrH)

Estados customizados: `var_qualendereco_` : Tbl.EnderecosCliFor

Resumo: 134 elementos · 32 workflows · 50 ações · 40 condicionais · 1 estados customizados
Elementos por tipo: Text 33, Group 27, TableCell 18, Icon 12, TableMainAxis 9, TableCrossAxis 6, Dropdown 5, CustomElement 4, Table 3, Button 3, Plugin[1680110374647x249108010620944400]/AAC 3, Input 2, Image 2, RepeatingGroup 2, Popup 1, PictureInput 1, MultiLineInput 1, AutocompleteDropdown 1, RadioButtons 1

## Árvore de elementos

- **CustomElement** `pop.BloquearClifor A` (bTvZf) — USA Reusable pop.BloquearClifor · props: floating_reference="top", custom_id="bTvUD", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `pop.AgendaEnderecos A` (bTgxX) — USA Reusable pop.AgendaEnderecos · props: custom_id="bTPJL"
- **CustomElement** `pop.AnexosClifor A` (bTjgf) — USA Reusable pop.AnexosClifor · props: custom_id="bTjcT"
- **CustomElement** `pop.AgendaContatos A` (bTgxR) — USA Reusable pop.AgendaContatos · props: custom_id="bTPQa0"
- **Popup** `pop historico` (bTgxd) — props: group_type="custom.tbl_clientes", vertical_centering=True
  - **Icon** `Icon B` (bTgyP) — props: icon="material outlined close", vertical_centering=True
  - **Text** `Text B` (bTgyT) — text: "Histórico de conversas"
  - **Table** `Table B` (bTgxf) — data_source: Search(Tbl.Historico: cpo.QualCliente equals Parent; sort Created Date desc) · props: group_type="custom.tbl_historico", vertical_centering=True
    - **TableMainAxis** `TableMainAxis B` (bTgxj) — props: axis_index=0
    - **TableCrossAxis** `TableCrossAxis B` (bTgxk) — props: axis_index=0
      - **TableCell** `Cell B` (bTgxl) — props: cell_main_axis_id="bTgxj"
        - **Group** `gp qual grupo clifor` (bTgxp) — data_source: El[pop historico]:get_group_data · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Group** `Group C` (bTgxr) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTgxv) — placeholder: "LOGO" · props: src="{Parent:cpo.Foto}"
              - ⟂ quando Parent:cpo.Foto:is_empty → background_style="image", background_image="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - **Input** `ipt nome grupoclifor` (bTgxq) — placeholder: "Nome cliente / fornecedor" · content: "{Parent:cpo.NomeCliFor:to_uppercase}" · props: vertical_centering=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:get_data:is_empty → border_style_bottom="solid"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → background_style="bgcolor", bgcolor="var(--color_bTHGr_default)"
        - **Group** `gp edita historico por cliente` (bTjMj) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_historico", vertical_centering=True
          - ⟂ quando El[pop historico]:get_group_data:cpo.QualCarteira:equals(CurrentUser) → is_visible=True
          - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → is_visible=True
          - **MultiLineInput** `ipt descricao historico cli` (bTjNM) — placeholder: "Descrição do atendimento" · content: "{Parent:cpo.Descricao}" · props: vertical_centering=True
          - **Icon** `btn grava historico individual` (bTjNp) — props: icon="material outlined save", vertical_centering=True
    - **TableCrossAxis** `TableCrossAxis B` (bTgxw) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell B` (bTgxx) — props: cell_main_axis_id="bTgxj"
        - **Image** `Image B` (bTgyB) — props: stretch_or_rescale="zoom", src="{Ancestor[TableCrossAxis]:Created By:cpo.Foto}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualVendedor:is_empty → src="//21d85b5f34b72c2c9bea3d9d45458bb7.cdn.bubble.io/f1698174961133x403443266892573600/aa149071.png"
          - ⟂ quando Ancestor[TableCrossAxis]:Created By:cpo.Ativo:is_false → src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fs3.amazonaws.com%2Fappforest_uf%2Ff1664476260407x848551234117814900%2Funnamed.png?w=48&h=48&auto=compress&fit=max"
        - **Group** `Group C` (bTgyC) — props: vertical_centering=True
          - **Group** `Group C` (bTgyD) — props: vertical_centering=True
            - **Text** `Text B` (bTgyH) — text: "Criado: {Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
            - **Text** `Text B` (bTgyI) — text: "Modificado: {Ancestor[TableCrossAxis]:Modified Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}" · props: font_alignment="right"
          - **Text** `Text B` (bTgyJ) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao}"
          - **Group** `Group C` (bTgyN) — props: vertical_centering=True
            - **Text** `Text B` (bTgyO) — text: "Vendedor: {Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}"
- **Icon** `Icon C` (bThDR) — props: icon="material outlined close", vertical_centering=True
- **Group** `Group D` (bThDX) — props: vertical_centering=True
  - **RepeatingGroup** `rpg buscaenderecos` (bTmFT) — data_source: Search(Tbl.EnderecosCliFor: cpo.NomeEndereco text contains string "{El[src busca chave]:get_data}" AND cpo.TipoClifor equals El[dd tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd ordem]:get_data:nomecampo}") · props: group_type="custom.tbl_enderecosclifor", separator_style="none"
  - **Text** `Text N` (bTmGP) — oculto ao carregar · text: "{El[rpg buscaenderecos]:get_list_data:count}"
    - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
  - **Text** `Text C` (bThDL) — text: "Cadastro de {El[dd tipo clifor]:get_data:display}" · props: font_alignment="center"
- **Group** `gp tools` (bTgrS) — props: vertical_centering=True
  - **Group** `gp busca cliente` (bThmD) — props: vertical_centering=True
    - **Icon** `Icon D` (bThmL) — props: icon="material outlined close", vertical_centering=True, button_disabled=True
      - ⟂ quando El[src busca chave]:get_data:is_not_empty:or_(El[src busca exata]:get_data:is_not_empty) → icon_color="var(--color_primary_default)", button_disabled=False
    - **Input** `src busca chave` (bTgrY) — placeholder: "Busca próxima" · props: unique_id="fuzzy"
      - ⟂ quando El[radio busca]:get_data:equals("Busca exata") → is_visible=False
      - ⟂ quando El[radio busca]:get_data:equals("Busca próxima") → is_visible=True
    - **AutocompleteDropdown** `src busca exata` (bTkCL) — data_source: Search(Tbl.GrupoCliFor: cpo.Ativo equals El[dd ativos]:get_data:boolean AND cpo.QualTipoCliFor equals El[dd tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd ordem]:get_data:nomecampo}", ignore empty) · placeholder: "Busca exata" · props: unique_id="fuzzy", field_to_search="cpo_nomecliente_text"
      - ⟂ quando El[radio busca]:get_data:equals("Busca exata") → is_visible=True
      - ⟂ quando El[radio busca]:get_data:equals("Busca próxima") → is_visible=False
    - **RadioButtons** `radio busca` (bTkgJ1) — props: mandatory=True, columns=2, choices="Busca exata\nBusca próxima", default="{CurrentUser:cpo.BuscaExataProxima}", computed_value="text"
  - **Group** `Group F` (bThnv)
    - **Text** `Text D` (bThoC) — text: "Exibir lista de:"
    - **Dropdown** `dd tipo clifor` (bTgrZ) — data_source: All(opt.TipoCliFor) · placeholder: "Selecione" · props: mandatory=True, default=CurrentUser:cpo.FiltraTipoClifor, dynamic_type="option.opt_tipoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Group** `Group G` (bThoI)
    - **Text** `Text E` (bThoO) — text: "Exibir cadastros:"
    - **Dropdown** `dd ativos` (bThoN) — data_source: All(Opt.SimNão) · placeholder: "Selecione" · props: mandatory=True, default=Opt.SimNão.Todos, dynamic_type="option.opt_simn_o", choices_style="dynamic", option_display_expression="{InjectedValue:ativo_inativo}"
  - **Group** `Group J` (bTjkt)
    - **Text** `Text G` (bTjkz) — text: "Exibir ordem:"
    - **Dropdown** `dd ordem` (bTjkv) — data_source: All(Opt.OrdenarCampos):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:local:equals("CadastroClifor"), constraint_type=∅}}) · placeholder: "Selecione" · props: mandatory=True, default=CurrentUser:cpo.OrdenarCampos, dynamic_type="option.opt_ordenarcampos", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Group** `Group O` (bTroF) — props: vertical_centering=True
    - **Text** `Text O` (bTroV) — text: "Exibir captação:"
    - **Dropdown** `dd captacao` (bTrns) — data_source: All(Opt.CaptacaoCliente) · placeholder: "Selecione" · props: mandatory=True, vertical_centering=True, dynamic_type="option.opt_captacaocliente", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
  - **Button** `btn expandir cartoes` (bTmFh) — text: "expandir todos" · props: icon="fa fa-angle-double-down", icon_size=16, button_type="label_icon", title_attribute="Expande todos cartões"
    - ⟂ quando CurrentUser:cpo.ExpandirCadastroClifor:is_true → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_surface_default)", bgcolor="var(--color_primary_default)"
  - **Group** `Group N` (bTjxZ) — props: vertical_centering=True
    - **Button** `btn novo cliente` (bTgrX) — text: "Cliente" · props: icon="fa fa-plus", vertical_centering=True, icon_size=16, button_type="label_icon"
      - ⟂ quando El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → is_visible=True
      - ⟂ quando El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
    - **Button** `btn novo fornecedor` (bTgrd) — text: "Fornecedor" · props: icon="fa fa-plus", vertical_centering=True, icon_size=16, button_type="label_icon", button_disabled=True
      - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor):or_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Gerente)):or_(CurrentUser:cpo.QualDepto:equals(Opt.DeptoUsuario.Financeiro)) → bgcolor="var(--color_primary_default)", button_disabled=False
      - ⟂ quando El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → is_visible=True
      - ⟂ quando El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente) → is_visible=False
- **RepeatingGroup** `rpg clientes` (bTgrf) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[dd tipo clifor]:get_data AND cpo.Ativo equals El[dd ativos]:get_data:boolean AND cpo.NomeCliFor text contains "{El[src busca chave]:get_data}" AND cpo.Captacao equals El[dd captacao]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd ordem]:get_data:nomecampo}", ignore empty):merged_with(El[rpg buscaenderecos]:get_list_data:cpo.QualGrupoCliFor):filtered(constraints={0={key="cpo_ativo_boolean", value=El[dd ativos]:get_data:boolean, constraint_type="equals"}}, ignore_empty_constraints=True):unique · props: group_type="custom.tbl_clientes", separator_style="none", unique_id="", fixed_rows=False, cell_min_height_css="55px"
  - ⟂ quando El[radio busca]:get_data:equals("Busca exata") → data_source=Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[dd tipo clifor]:get_data AND cpo.Ativo equals El[dd ativos]:get_data:boolean AND cpo.NomeCliFor equals "{El[src busca exata]:get_data:cpo.NomeCliFor}"; sort _dynamic_sort_field desc, sort dinâmico "{El[dd ordem]:get_data:nomecampo}", ignore empty)
  - **Group** `gp nome clifor` (bTgrk) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
    - ⟂ quando CellIndex:modulo(2):equals(1):and_(El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
    - ⟂ quando CellIndex:modulo(2):not_equals(1):and_(El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.04)"
    - ⟂ quando CellIndex:modulo(2):equals(1):and_(El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
    - ⟂ quando CellIndex:modulo(2):not_equals(1):and_(El[dd tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.04)"
    - **Group** `Group Tbl.GrupoCliFor` (bTgrl) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - **Text** `Text K` (bTjmH) — text: "{CellIndex}/{El[rpg clientes]:get_list_data:count}" · props: font_alignment="center"
      - **Group** `gp nomeclifor` (bTgrp) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Image** `Image A` (bTgrr) — props: src="{Parent:cpo.Foto}"
          - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Group** `gp showdetalhes` (bTjlL) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Text** `Text A` (bTgrq) — text: "[fa]chevron-down[/fa]  {Parent:cpo.NomeCliFor:to_uppercase}"
            - ⟂ quando El[gp endereços+contatos]:is_visible → text="[fa]chevron-up[/fa] {Parent:cpo.NomeCliFor:to_uppercase}"
          - **Text** `Text F` (bTjmZ) — text: "Não contém contrato de parceria"
            - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=False
            - ⟂ quando Search(Tbl.Anexos: cpo.QualClifor equals Parent AND cpo.TipoAnexo equals Opt.TipoAnexo.Contrato de parceria):count:greater_or_equal_than(1) → is_visible=False
          - **Text** `Text M` (bTkfx1) — text: "Contém: {El[rpg enderecos clifor]:get_list_data:count} Endereços | {El[rpg contatos clifor]:get_list_data:count} Contatos"
          - **Text** `Text H` (bTjlF) — text: "Criado em: {Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
          - **Text** `Text L` (bTjmN) — text: "Por: {Parent:Created By:cpo.NomeModelo:to_capitalized_words}"
      - **Group** `Group B` (bTgsB) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=True
        - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
        - **Text** `Text A` (bTgsC) — text: "Carteira "
        - **Dropdown** `Dropdown A` (bTgsD) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Selecione usuáro" · auto_binding: True · props: bind_field="cpo_qualcarteira_user", dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
      - **Group** `Group B` (bTgsH) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Cliente) → is_visible=True
        - ⟂ quando Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor) → is_visible=False
        - **Group** `Group B` (bTgsP) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Icon** `Icon A` (bTgsT) — props: icon="material outlined comment", vertical_centering=True
          - **Text** `Text A` (bTgsU) — text: "{Search(Tbl.Historico: cpo.QualCliente equals Parent):count}" · props: font_alignment="center"
        - **Group** `Group B` (bTgsI) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Text** `Text A` (bTgsJ) — text: "Ultima conversa: "
          - **Text** `Text A` (bTgsN) — oculto ao carregar · text: "{Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
            - ⟂ quando Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:is_not_empty → is_visible=True
          - **Text** `Text A` (bTgsO) — oculto ao carregar · text: "{Page.Current Date/Time:minus(Parent:cpo.UltimoHistoricoData):to_days:format_number(decimal_place=0)} dias"
            - ⟂ quando Search(Tbl.Historico: cpo.QualCliente equals Parent):last_element:Created Date:is_not_empty → is_visible=True
      - **Group** `gp ativo` (bTgrv) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Group** `Group M` (bTjlx) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTgrx) — auto_binding: False · props: AAD=Parent:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
            - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2):and_(Parent:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor)) → AAK=True
        - **Text** `Text J` (bTjlr) — text: "Ativo: {Parent:cpo.Ativo}" · props: font_alignment="center"
      - **Group** `Group L` (bTjlj) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Icon** `Icon F` (bTjgT) — props: icon="bootstrap file-earmark-plus-fill", vertical_centering=True
        - **Text** `Text I` (bTjld) — text: "Anexos: {Parent:cpo.QuaisAnexos:count}" · props: font_alignment="center"
      - **Group** `Group H` (bTvTv) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Icon** `bt bloquear grupo` (bTvUB) — props: icon="material outlined block", vertical_centering=True
        - **Text** `Text P` (bTvTx) — text: "Bloquear" · props: font_alignment="center"
    - **Group** `gp endereços+contatos` (bTgsV) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
      - ⟂ quando CurrentUser:cpo.ExpandirCadastroClifor:is_true → is_visible=True
      - **Table** `rpg enderecos clifor` (bTgtQ) — data_source: Parent:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
        - **TableCrossAxis** `TableCrossAxis A` (bTgtR) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell A` (bTgtV) — props: cell_main_axis_id="bTguB"
            - **Icon** `btn edita endereço cliente` (bTgtW) — props: icon="material outlined edit", button_disabled=False
            - **Icon** `Icon A` (bTgtX) — props: icon="material outlined my_location"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Plugin[1680110374647x249108010620944400]/AAC** `Switch enderecos` (bTgtb) — auto_binding: True · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
          - **TableCell** `Cell A` (bTgtc) — props: cell_main_axis_id="bTguF"
            - **Text** `tx cidade endereco` (bTgtd) — text: "{Ancestor[TableCrossAxis]:cpo.Endereco:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.Municipio:to_capitalized_words}/{Ancestor[TableCrossAxis]:cpo.QualUfOpt:display}"
              - ⟂ quando El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_:equals(Ancestor[TableCrossAxis]) → bold=True
          - **TableCell** `Cell A` (bTgth) — props: cell_main_axis_id="bTguG"
            - **Text** `tx nome endereco` (bTgti) — text: "{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
              - ⟂ quando El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_:equals(Ancestor[TableCrossAxis]) → bold=True
          - **TableCell** `Cell A` (bTgtj) — props: cell_main_axis_id="bTguH"
            - **Text** `tx cidade endereco` (bTgtn) — text: "{Ancestor[TableCrossAxis]:cpo.CnpjCpf}"
              - ⟂ quando El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_:equals(Ancestor[TableCrossAxis]) → bold=True
        - **TableCrossAxis** `TableCrossAxis A` (bTgto) — props: axis_index=0
          - **TableCell** `Cell A` (bTgtp) — props: cell_main_axis_id="bTguB"
            - **Icon** `btn novo endereço cliente` (bTgtt) — props: icon="material filled contact_mail"
          - **TableCell** `Cell A` (bTgtu) — props: cell_main_axis_id="bTguF"
          - **TableCell** `Cell A` (bTgtv) — props: cell_main_axis_id="bTguG"
            - **Text** `Text A` (bTgtz) — text: "Endereços do cliente"
          - **TableCell** `Cell A` (bTguA) — props: cell_main_axis_id="bTguH"
        - **TableMainAxis** `TableMainAxis A` (bTguB) — props: axis_index=3
        - **TableMainAxis** `TableMainAxis A` (bTguF) — props: axis_index=2
        - **TableMainAxis** `TableMainAxis A` (bTguG) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis A` (bTguH) — props: axis_index=1
      - **Table** `rpg contatos clifor` (bTgsZ) — data_source: Parent:cpo.QuaisContatos:filtered(constraints={0={key="cpo_qualendere_o_custom_tbl_enderecosclifor", value=El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_, constraint_type="equals"}}, ignore_empty_constraints=True) · props: group_type="custom.tbl_contatoclifor", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
        - **TableCrossAxis** `TableCrossAxis A` (bTgsa) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell A` (bTgsb) — props: cell_main_axis_id="bTgtJ"
            - **Icon** `btn edita contato cliente` (bTgsf) — props: icon="material outlined edit"
            - **Plugin[1680110374647x249108010620944400]/AAC** `Switch contatos` (bTgsg) — auto_binding: True · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
          - **TableCell** `Cell A` (bTgsh) — props: cell_main_axis_id="bTgtK"
            - **Text** `Text A` (bTgsl) — text: "{Ancestor[TableCrossAxis]:cpo.Telefone:to_capitalized_words}"
          - **TableCell** `Cell A` (bTgsm) — props: cell_main_axis_id="bTgtL"
            - **Text** `Text A` (bTgsn) — text: "{Ancestor[TableCrossAxis]:cpo.NomeContato:to_capitalized_words}⏎[size=1]{Ancestor[TableCrossAxis]:cpo.Cargo:to_capitalized_words}[/size]"
          - **TableCell** `Cell A` (bTgsr) — props: cell_main_axis_id="bTgtP"
            - **Text** `Text A` (bTgss) — text: "{Ancestor[TableCrossAxis]:cpo.Email:to_lowercase}"
        - **TableCrossAxis** `TableCrossAxis A` (bTgst) — props: axis_index=0
          - **TableCell** `Cell A` (bTgsx) — props: cell_main_axis_id="bTgtJ"
            - **Icon** `btn novo contato cliente` (bTgsy) — props: icon="material filled contact_phone"
          - **TableCell** `Cell A` (bTgsz) — props: cell_main_axis_id="bTgtK"
          - **TableCell** `Cell A` (bTgtD) — props: cell_main_axis_id="bTgtL"
            - **Text** `Text A` (bTgtE) — text: "Contatos do cliente"
          - **TableCell** `Cell A` (bTgtF) — props: cell_main_axis_id="bTgtP"
        - **TableMainAxis** `TableMainAxis A` (bTgtJ) — props: axis_index=4
        - **TableMainAxis** `TableMainAxis A` (bTgtK) — props: axis_index=1
        - **TableMainAxis** `TableMainAxis A` (bTgtL) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis A` (bTgtP) — props: axis_index=2

## Workflows

#### WF bTguM — ButtonClicked em El[btn novo cliente]
1. **ResetGroup** [bTguR] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTguS] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Cliente, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=True, custom_state="custom.var_destravarcampos_"}, 1={value=∅, custom_state="custom.var_qualgrupoclifor_"}}
3. **ShowElement** [bTguT] alvo El[pop.AgendaEnderecos A]

#### WF bTguY — ButtonClicked em El[btn novo fornecedor]
1. **ResetGroup** [bTgud] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTgue] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Fornecedor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=True, custom_state="custom.var_destravarcampos_"}, 1={value=∅, custom_state="custom.var_qualgrupoclifor_"}}
3. **ShowElement** [bTguf] alvo El[pop.AgendaEnderecos A]

#### WF bTguk — ButtonClicked em El[gp showdetalhes]
1. **ToggleElement** [bTgup] alvo El[gp endereços+contatos]

#### WF bTgur — ButtonClicked em El[Icon A]
1. **DisplayGroupData** [bTguw] alvo El[pop historico] · data_source=Parent
2. **ShowElement** [bTgux] alvo El[pop historico]

#### WF bTgvC — ButtonClicked em El[btn edita contato cliente]
1. **DisplayGroupData** [bTgvH] alvo El[pop.AgendaContatos A] · data_source=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor
2. **SetCustomState** [bTgvI] alvo El[pop.AgendaContatos A] · value=Opt.AçãoCliFor.Edita Contato Cliente, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualcontato_"}}
3. **ShowElement** [bTgvJ] alvo El[pop.AgendaContatos A]

#### WF bTgvO — ButtonClicked em El[btn novo contato cliente]
- props: workflow_disabled=True
1. **SetCustomState** [bTgvT] alvo El[bTIgI] · value=Opt.AçãoCliFor.Novo Contato Cliente, custom_state="custom.cpo_a__oclifor_"
2. **DisplayGroupData** [bTgvU] alvo El[bTMYk] · data_source=El[gp endereços+contatos]:get_group_data

#### WF bTgvZ — ButtonClicked em El[btn novo contato cliente]
- props: workflow_disabled=False
1. **DisplayGroupData** [bTgvb] alvo El[pop.AgendaContatos A] · data_source=El[gp endereços+contatos]:get_group_data
2. **ShowElement** [bTgvf] alvo El[pop.AgendaContatos A]

#### WF bTgvh — ButtonClicked em El[btn edita endereço cliente]
1. **SetCustomState** [bTgvm] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Edita Endereço CliFor, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"}, 1={value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"}}
2. **ShowElement** [bTgvr] alvo El[pop.AgendaEnderecos A]

#### WF bTgvt — ButtonClicked em El[Icon A]
1. **OpenURL** [bTgvy] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.Localizacaoo:google_map_link}&zoom=15"

#### WF bTgwD — ButtonClicked em El[tx cidade endereco]
- condição: El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_:equals(Ancestor[TableCrossAxis])
- props: workflow_disabled=False
1. **SetCustomState** [bTgwF] alvo El[Reusable pop.CadastroCliFor] · custom_state="custom.var_qualendereco_"

#### WF bTgwK — ButtonClicked em El[tx cidade endereco]
- condição: El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_:not_equals(Ancestor[TableCrossAxis])
- props: workflow_disabled=False
1. **SetCustomState** [bTgwP] alvo El[Reusable pop.CadastroCliFor] · value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"

#### WF bTgwR — ButtonClicked em El[tx nome endereco]
- condição: El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTgwW] alvo El[Reusable pop.CadastroCliFor] · custom_state="custom.var_qualendereco_"

#### WF bTgwb — ButtonClicked em El[tx nome endereco]
- condição: El[Reusable pop.CadastroCliFor]:custom.var_qualendereco_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTgwd] alvo El[Reusable pop.CadastroCliFor] · value=Ancestor[TableCrossAxis], custom_state="custom.var_qualendereco_"

#### WF bTgwi — ButtonClicked em El[tx cidade endereco]
1. **Plugin[1609444246883x924984661248573400]/AAQ** [bTgwn] AAP="{Ancestor[TableCrossAxis]:cpo.CnpjCpf}"

#### WF bTgwp — ButtonClicked em El[btn novo endereço cliente]
- props: workflow_disabled=True
1. **SetCustomState** [bTgwu] alvo El[bTIgI] · value=Opt.AçãoCliFor.Novo Endereço CliFor, custom_state="custom.cpo_a__oclifor_"
2. **DisplayGroupData** [bTgwv] alvo El[bTKuD] · data_source=El[gp endereços+contatos]:get_group_data

#### WF bTgxA — ButtonClicked em El[btn novo endereço cliente]
- props: workflow_disabled=False
1. **SetCustomState** [bTmFN] alvo El[pop.AgendaEnderecos A] · value=El[gp endereços+contatos]:get_group_data, custom_state="custom.var_qualgrupoclifor_", custom_states_values={0={custom_state="custom.var_a__oclifor_"}, 1={value=∅, custom_state="custom.var_qualendereco_"}}
2. **ShowElement** [bTgxG] alvo El[pop.AgendaEnderecos A]

#### WF bTgyV — ButtonClicked em El[Icon B]
1. **HideElement** [bTgya] alvo El[pop historico]

#### WF bThDf — ButtonClicked em El[Icon C]
1. **HideElement** [bThDl] alvo El[Reusable pop.CadastroCliFor]

#### WF bThmR — ButtonClicked em El[Icon D]
1. **ResetGroup** [bThmX] alvo El[gp busca cliente]

#### WF bTjNv — ButtonClicked em El[btn grava historico individual]
- condição: El[gp edita historico por cliente]:get_group_data:is_empty
1. **NewThing** [bTjNx] tipo Tbl.Historico · campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[pop historico]:get_group_data; cpo.QualVendedor = CurrentUser
2. **ResetGroup** [bTjOB] alvo El[gp edita historico por cliente]
3. **ResetInputs** [bTjOC] 
4. **ChangeThing** [bTjOD] campos: cpo.UltimoHistoricoData = Page.Current Date/Time · to_change=El[pop historico]:get_group_data

#### WF bTjOI — ButtonClicked em El[btn grava historico individual]
- condição: El[gp edita historico por cliente]:get_group_data:is_not_empty
1. **ChangeThing** [bTjON] campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[pop historico]:get_group_data; cpo.QualVendedor = CurrentUser · to_change=El[gp edita historico por cliente]:get_group_data
2. **ResetGroup** [bTjOO] alvo El[gp edita historico por cliente]

#### WF bTjgZ — ButtonClicked em El[Icon F]
1. **ShowElement** [bTjgl] alvo El[pop.AnexosClifor A]
2. **SetCustomState** [bTkOE] alvo El[pop.AnexosClifor A] · value=Opt.TipoAnexo.Alvará de Funcionamento, custom_state="custom.var_tipoanexo_", custom_states_values={0={value=Parent, custom_state="custom.var_qualclifor_"}}

#### WF bTjlT — InputChanged em El[dd ordem]
1. **MakeChangeCurrentUser** [bTjlZ] campos: cpo.OrdenarCampos = This:get_data

#### WF bTmFa — InputChanged em El[radio busca]
1. **MakeChangeCurrentUser** [bTmFg] campos: cpo.BuscaExataProxima = "{This:get_data}"

#### WF bTmFn — ButtonClicked em El[btn expandir cartoes]
- condição: CurrentUser:cpo.ExpandirCadastroClifor:is_false
1. **MakeChangeCurrentUser** [bTmFt] campos: cpo.ExpandirCadastroClifor = True

#### WF bTmFx — ButtonClicked em El[btn expandir cartoes]
- condição: CurrentUser:cpo.ExpandirCadastroClifor:is_true
1. **MakeChangeCurrentUser** [bTmFz] campos: cpo.ExpandirCadastroClifor = False

#### WF bTmGV — InputChanged em El[dd tipo clifor]
1. **MakeChangeCurrentUser** [bTmGb] campos: cpo.FiltraTipoClifor = This:get_data

#### WF bTmGc — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch enderecos]
- condição: Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.QuaisEnderecos:count:equals(1)
1. **ChangeThing** [bTmGi] campos: cpo.Ativo = This:get_AAI · to_change=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor

#### WF bTvZl — ButtonClicked em El[bt bloquear grupo]
1. **ShowElement** [bTvZr] alvo El[pop.BloquearClifor A]
2. **DisplayGroupData** [bTvZw] alvo El[pop.BloquearClifor A] · data_source=Parent

#### WF bUEuM — InputChanged em El[Dropdown A]

#### WF bTmPW0 — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch A]
1. **ChangeThing** [bTvTd] campos: cpo.UltimoQue(Des)ativou = CurrentUser; cpo.Ativo = This:get_AAI · to_change=Parent
2. **ChangeListOfThings** [bTmPc0] campos: cpo.Ativo = This:get_AAI · to_change=Parent:cpo.QuaisEnderecos, type_to_change="custom.tbl_enderecosclifor"

#### WF bTmPd0 — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch A]
- condição: This:get_AAI:is_true
1. **ChangeListOfThings** [bTmPi0] campos: cpo.Ativo = True · to_change=Parent:cpo.QuaisEnderecos, type_to_change="custom.tbl_enderecosclifor"
