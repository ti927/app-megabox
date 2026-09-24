# Pagina: `sac` (bUCjn)

Estados customizados: `coluna_respostas_` : boolean

Resumo: 378 elementos · 27 workflows · 56 ações · 103 condicionais · 1 estados customizados
Elementos por tipo: Group 106, Text 92, TableCell 50, Icon 32, TableMainAxis 25, Button 16, Input 12, Dropdown 10, TableCrossAxis 8, Plugin[1680110374647x249108010620944400]/AAC 4, Table 4, Popup 3, RepeatingGroup 3, CustomElement 2, AutocompleteDropdown 2, MultiLineInput 2, HTML 2, RadioButtons 1, select2-MultiDropdown 1, multifileupload-MultiFileInput 1, Link 1, Plugin[1648823245313x509054419018711040]/AAC 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho A` (bUCuN) — USA Reusable tool.Cabecalho · props: floating_reference="top", custom_id="bTIVb", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Popup** `Pop Novo Chamado` (bUCqT) — props: group_type="custom.tbl_sac", vertical_centering=True, greyout_color="rgba(0,0,0,0.6)"
  - **Group** `Group Barra Superior` (bUCvj) — props: vertical_centering=True
    - **Icon** `Icon A` (bUCwN) — props: icon="fa fa-close", vertical_centering=True
      - ⟂ quando This:is_hovered → icon_color="rgba(255,0,0,1)"
  - **Group** `Group U` (bUCvp) — props: group_type="custom.tbl_sac", vertical_centering=True
    - **Group** `Group Tabs` (bUDnt) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
      - **Button** `Button L` (bUDnh) — text: "Protocolo" · props: icon="feather star", font_alignment="center", font_family="var(--font_default)", four_border_style=True, border_color_bottom="var(--color_bTGyQ_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=0
        - ⟂ quando This:is_hovered → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
        - ⟂ quando El[Group Protocolo]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - **Button** `Button M` (bUDnn) — text: "Histórico" · props: icon="feather star", font_alignment="center", font_family="var(--font_default)", four_border_style=True, border_color_bottom="var(--color_bTGyQ_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=0
        - ⟂ quando This:is_hovered → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
        - ⟂ quando El[Group HistoricoSac]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
        - ⟂ quando El[Pop Novo Chamado]:get_group_data:is_empty → is_visible=False
    - **Group** `Group Protocolo` (bUDoE) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
      - **Group** `Group XZ` (bUDmj1) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
        - **Group** `Group I` (bUCqr) — props: vertical_centering=True
          - **Text** `Text M` (bUCqZ) — text: "Protocolo SAC"
          - **Text** `Text N` (bUCqf) — text: "Registre e edite atendimentos ao cliente"
        - **Group** `Group GZ` (bUDKz0) — props: vertical_centering=True
          - **Text** `Text MZ` (bUDLA0) — text: "N° do Protocolo" · props: font_alignment="right"
          - **Input** `dd n° protocolo` (bUDLB0) — placeholder: "Protocolo" · content: "{El[Pop Novo Chamado]:get_group_data:cpo.NumeroProtocoloNum:format_number(formatting_type="number", decimal_place=0, decimal_separator="point", thousand_separator="dot")}" · props: font_alignment="right", disabled=True, computed_value="number"
            - ⟂ quando El[Pop Novo Chamado]:get_group_data:is_empty → content="{Search(Tbl.SacProtocolo):last_element:cpo.NumeroProtocoloNum:plus(1)}"
      - **Group** `Group H` (bUDwy0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
        - **Group** `Group LZZ` (bUDyj0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
          - **Icon** `Icon P` (bUDyd0) — props: icon="material outlined assistant_photo", vertical_centering=True
          - **Text** `Text MZZ` (bUDxt0) — text: "Situação do Chamado"
        - **Group** `Group KZZ` (bUDxz0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
          - **Group** `Group M` (bUCsD) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text Q` (bUCsE) — text: "Tipo de Ocorrência"
            - **Dropdown** `dd ocorrencia` (bUDKJ0) — data_source: All(Opt.TipoOcorrencia) · placeholder: "Escolha uma opção..." · props: mandatory=True, default=El[Pop Novo Chamado]:get_group_data:cpo.QualTipoOcorrencia, dynamic_type="option.opt_tipoocorrencia", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
          - **Group** `Group M` (bUCrx) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text Q` (bUCry) — text: "Prioridade"
            - **Dropdown** `dd prioridade` (bUDKP0) — data_source: All(opt.prioridade) · placeholder: "Escolha uma opção..." · props: mandatory=True, default=El[Pop Novo Chamado]:get_group_data:Cpo.QualPrioridade, dynamic_type="option.opt_prioridade", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
          - **Group** `Group IZ` (bUDLR0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text OZ` (bUDLT0) — text: "Status "
            - **Dropdown** `dd status` (bUDLX0) — data_source: All(opt.StatusChamado) · placeholder: "Escolha uma opção..." · props: mandatory=True, default=El[Pop Novo Chamado]:get_group_data:cpo.QualStatusChamado, dynamic_type="option.opt_statuslure", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
      - **Group** `Group IZZ` (bUDxK0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
        - **Group** `Group MZZ` (bUDyr0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
          - **Icon** `Icon Q` (bUDyx0) — props: icon="material outlined person", vertical_centering=True
          - **Text** `Text NZZ` (bUDyw0) — text: "Identificação do Chamado"
        - **RadioButtons** `rad tipo clifor` (bUDLe0) — data_source: All(opt.TipoCliFor) · props: columns=2, choices="Fornecedor\nCliente", default=Parent:cpo.QualGrupoCliFor:cpo.QualTipoCliFor, dynamic_type="option.opt_tipoclifor", choices_style="dynamic", computed_value="text", use_dynamic_columns=True, option_display_expression="{InjectedValue:display}"
          - ⟂ quando Parent:is_empty → default=opt.TipoCliFor.Cliente
          - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
        - **Group** `Group L` (bUCrh) — props: group_type="custom.tbl_sac", vertical_centering=True
          - **Group** `Group K` (bUCrZ) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text P` (bUCrb) — text: "Número do Pedido"
            - **AutocompleteDropdown** `dd pedido` (bUCrf) — data_source: Search(Tbl.Pedido; ignore empty) · placeholder: "Busque número pedido" · props: default=El[Pop Novo Chamado]:get_group_data:cpo.QualPedido, choices_style="dynamic", field_to_search="cpo_numerocotacao_text"
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
          - **Group** `Group FZ` (bUDJm0) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text LZ` (bUDJr0) — text: "Quais entregas"
            - **select2-MultiDropdown** `dd entregas` (bUDKD0) — data_source: El[dd pedido]:get_data:cpo.QuaisEntregas · placeholder: "Escolha as entregas" · props: default=El[Pop Novo Chamado]:get_group_data:cpo.QuaisEntregas, dynamic_type="custom.tbl_entregas", choices_style="dynamic", tag_border_color="var(--color_bTHGl_default)", option_display_expression="Dt Prev: {InjectedValue:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - Qtd: {InjectedValue:cpo.QtdEntrega} - Nf: {InjectedValue:cpo.NumNfFornecedor}"
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
          - **Group** `Group J` (bUCrO) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text O` (bUCrC) — text: "Cliente/Fornecedor"
            - **AutocompleteDropdown** `dd qualclifor` (bUCrI) — data_source: Search(Tbl.GrupoCliFor: cpo.Ativo equals True) · placeholder: "Busque o {El[rad tipo clifor]:get_data:display}" · auto_binding: False · props: mandatory=True, default=El[Pop Novo Chamado]:get_group_data:cpo.QualGrupoCliFor, choices_style="dynamic", field_to_search="cpo_nomecliente_text"
              - ⟂ quando Parent:is_empty:and_(El[dd pedido]:get_data:is_not_empty):and_(El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Cliente)) → default=Search(Tbl.Pedido: _id {'type': 'Empty'} El[dd pedido]:get_data:_id):first_element:cpo.QualCliente
              - ⟂ quando Parent:is_empty:and_(El[dd pedido]:get_data:is_not_empty):and_(El[rad tipo clifor]:get_data:equals(opt.TipoCliFor.Fornecedor)) → default=Search(Tbl.Pedido: _id {'type': 'Empty'} El[dd pedido]:get_data:_id):first_element:cpo.QuaisOrcamentosFonecedores:first_element:cpo.QualFornecedor
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
          - **Group** `Group HZ` (bUDLG0) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text NZ` (bUDLL0) — text: "Qual filial"
            - **Dropdown** `dd qualfilial` (bUDLM0) — data_source: Search(Tbl.EnderecosCliFor: cpo.QualGrupoCliFor equals El[dd qualclifor]:get_data) · placeholder: "Escolha uma opção..." · props: mandatory=True, default=El[Pop Novo Chamado]:get_group_data:cpo.QualFilial, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase} / {InjectedValue:cpo.CnpjCpf}"
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
      - **Group** `Group M` (bUCrs) — props: group_type="custom.tbl_sac", vertical_centering=True
        - **Group** `Group JZZ` (bUDxi0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
          - **Group** `Group NZZ` (bUDzC0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
            - **Icon** `Icon R` (bUDzI0) — props: icon="material outlined newspaper", vertical_centering=True
            - **Text** `Text OZZ` (bUDzH0) — text: "Dados do chamado"
          - **Group** `Group N` (bUCsV) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text R` (bUCsW) — text: "Responsável"
            - **Dropdown** `dd responsável` (bUDKV0) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Escolha uma opção..." · props: mandatory=True, default=El[Pop Novo Chamado]:get_group_data:cpo.QualResponsável, dynamic_type="user", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
              - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
          - **Group** `Group O` (bUCtB) — props: group_type="custom.tbl_sac", vertical_centering=True
            - **Group** `Group P` (bUCtS) — props: group_type="custom.tbl_sac", vertical_centering=True
              - **Text** `Text T` (bUCtT) — text: "Anexos"
              - **multifileupload-MultiFileInput** `ipt anexos` (bUCtX) — props: padding_horizontal=6, padding_vertical=6, initial=El[Pop Novo Chamado]:get_group_data:cpo.Anexos, message="Clique para selecionar os arquivos", max_files=10
                - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
            - **Group** `Group O` (bUCtG) — props: group_type="custom.tbl_sac", vertical_centering=True
              - **Text** `Text S` (bUCtH) — text: "Descrição detalhada"
              - **MultiLineInput** `ipt obs` (bUCtL) — placeholder: "Digite aqui..." · content: "{El[Pop Novo Chamado]:get_group_data:cpo.Descricao}" · props: mandatory=True
                - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
    - **Group** `Group HistoricoSac` (bUDoX) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
      - **Group** `Group AZZ` (bUDqb) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
        - **Group** `Group AZZ` (bUDqf) — props: vertical_centering=True
          - **Text** `Text VZ` (bUDqh) — text: "Histórico"
          - **Text** `Text VZ` (bUDqg) — text: "Interface geral de históricos para esse atendimento"
        - **Group** `Group AZZ` (bUDql) — props: vertical_centering=True
          - **Text** `Text VZ` (bUDqm) — text: "N° do Protocolo" · props: font_alignment="right"
          - **Input** `dd n° protocolo` (bUDqn) — placeholder: "Protocolo" · content: "{El[Pop Novo Chamado]:get_group_data:cpo.NumeroProtocoloNum:format_number(formatting_type="number", decimal_place=0, decimal_separator="point", thousand_separator="dot")}" · props: font_alignment="right", disabled=True, computed_value="number"
      - **Group** `Group BZZ` (bUDsp) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
        - **Group** `Group Nova interação` (bUEBF0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
          - **Group** `Group QZZ` (bUEBT0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
            - **Icon** `Icon S` (bUEBN0) — props: icon="feather plus-circle", vertical_centering=True
              - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2
            - **Text** `Text DZZ` (bUDtD) — text: "Nova interação"
          - **MultiLineInput** `MultilineInput B` (bUDsx) — placeholder: "Digite aqui...⏎" · props: vertical_centering=True, border_style_top="none", border_style_left="none", four_border_style=False, border_style_right="none"
            - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → disabled=True
          - **Dropdown** `dd qual email` (bUECZ) — oculto ao carregar · data_source: Search(Tbl.GrupoCliFor: _id {'type': 'Empty'} El[Pop Novo Chamado]:get_group_data:cpo.QualGrupoCliFor:_id):cpo.QuaisContatos · placeholder: "Qual email do cliente?" · props: dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.Email}"
            - ⟂ quando El[tgg visivel cliente ]:get_AAI:is_true → is_visible=True
          - **Group** `Group EZZ` (bUDvR) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
            - **Group** `Group DZZ` (bUDuv) — props: vertical_centering=True
              - **Text** `Text JZZ` (bUDvA) — text: "Visível para o cliente"
              - **Plugin[1680110374647x249108010620944400]/AAC** `tgg visivel cliente ` (bUDuz) — props: AAE="rgba(255,255,255,1)", AAH="rgba(199,199,199,1)", AAO="rgba(255,255,255,1)", AAQ="rgba(255,255,255,1)"
                - ⟂ quando This:is_hovered → AAG="rgba(60,165,109,1)", AAH="rgba(181,181,181,1)"
            - **Button** `Button N` (bUDtU) — text: "Registrar " · props: icon="feather star", vertical_centering=True
        - **Group** `Group OZZ` (bUEAu0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True
          - **Group** `Group AZZ` (bUDqs) — props: group_type="custom.tbl_sac", vertical_centering=True, four_border_style=False, border_color_bottom="rgba(212,212,212,1)", border_style_bottom="solid"
            - **Icon** `Icon N` (bUDsd) — props: icon="feather message-square", vertical_centering=True
              - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2
            - **Text** `Text CZZ` (bUDsR) — text: "Interações"
          - **Group** `Group RZZ` (bUEBe0) — data_source: Parent · props: group_type="custom.tbl_sac", vertical_centering=True, overflow_scroll=True
            - **RepeatingGroup** `RepeatingGroup C` (bUDsj) — data_source: Search(Tbl.SacHistorico: cpo.QualProtocolo equals El[Pop Novo Chamado]:get_group_data) · props: group_type="custom.tbl_sachistorico", separator_style="none", fixed_rows=False, four_border_style=False, border_color_bottom="rgba(213,213,213,1)", border_style_bottom="solid", cell_min_height_css="56px"
              - **Group** `Group FZZ` (bUDvZ) — data_source: Parent · props: group_type="custom.tbl_sachistorico", vertical_centering=True
                - ⟂ quando This:is_hovered → border_color="var(--color_primary_default)"
                - **Group** `Group HZZ` (bUDvx) — data_source: Parent · props: group_type="custom.tbl_sachistorico", vertical_centering=True
                  - **Group** `Group SZZ` (bUEBx0) — data_source: Parent · props: group_type="custom.tbl_sachistorico", vertical_centering=True
                    - **Icon** `Icon T` (bUEBr0) — props: icon="feather clock", vertical_centering=True
                    - **Text** `Text KZZ` (bUDvL) — text: "{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy, HH:MM")}"
                  - **Group** `Group GZZ` (bUDvr) — oculto ao carregar · props: vertical_centering=True
                    - ⟂ quando Parent:cpo.VisivelCliente:is_true → is_visible=True
                    - **Icon** `Icon O` (bUDwO) — props: icon="feather eye", vertical_centering=True
                    - **Text** `Text LZZ` (bUDwI) — text: "Visível ao cliente"
                - **Text** `Text IZZ` (bUDtb) — text: "{Parent:cpo.DescricaoHistorico}"
    - **Group** `Group Q` (bUCtf) — props: vertical_centering=True
      - **Button** `Button C` (bUCtl) — text: "Cancelar" · props: icon="feather star"
      - **Button** `Button D` (bUCtr) — oculto ao carregar · text: "Gravar" · props: icon="feather star", vertical_centering=True
        - ⟂ quando El[Pop Novo Chamado]:get_group_data:is_empty → is_visible=True
      - **Button** `Button Salvar` (bUDSr) — oculto ao carregar · text: "Salvar" · props: icon="feather star"
        - ⟂ quando El[Pop Novo Chamado]:get_group_data:is_not_empty → is_visible=True
- **Popup** `Popup B` (bUDNj) — props: vertical_centering=True
- **Link** `Link A` (bUDGJ) — props: vertical_centering=True, no_html=True
  - ⟂ quando This:is_hovered → font_color="#205f82"
  - ⟂ quando This:is_pressed → font_color="#134B70"
- **Group** `Group General` (bUCke) — props: vertical_centering=True
  - **Group** `Group Nav Buttons` (bUCux) — props: vertical_centering=True
    - **Button** `Button F` (bUCvJ) — text: "Chamados" · props: icon="feather star", font_alignment="center", font_family="var(--font_default)", four_border_style=True, border_color_bottom="var(--color_bTGyQ_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:is_hovered → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - ⟂ quando El[Group Chamados]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
    - **Button** `Button G` (bUCvL) — text: "Relatórios" · props: icon="feather star"
      - ⟂ quando El[Group Relatórios]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → is_visible=True
    - **Button** `Button H` (bUCvR) — text: "Gestão NPS" · props: icon="feather star", font_alignment="center", font_family="var(--font_default)", four_border_style=True, border_color_bottom="var(--color_bTGyQ_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:is_hovered → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - ⟂ quando El[Group Gestão NPS]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → is_visible=True
    - **Button** `Button O` (bUELN0) — text: "Pós-Venda" · props: icon="feather star", font_alignment="center", font_family="var(--font_default)", four_border_style=True, border_color_bottom="var(--color_bTGyQ_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:is_hovered → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - ⟂ quando El[Group Pós - Venda]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → is_visible=True
  - **Group** `Group Chamados` (bUCvX) — props: vertical_centering=True
    - **Group** `Group C` (bUCkY) — props: vertical_centering=True
      - **Group** `Group B` (bUCkN) — props: vertical_centering=True
        - **Text** `Text A` (bUCjv) — text: "Dashboard de Chamados"
        - **Text** `Text B` (bUCkB) — text: "Gestão centralizada de protocolos de pós-venda"
      - **Button** `Button A` (bUCkH) — text: "Novo Chamado" · props: icon="bootstrap plus-lg", font_alignment="center", vertical_centering=True, textshadow=False, button_type="label_icon", font_family="var(--font_default)"
        - ⟂ quando This:is_hovered → boxshadow_vertical=6, bgcolor="rgba(26,98,255,0.8)", boxshadow_blur=12, boxshadow_color="rgba(2,68,247,0.25)"
    - **Group** `Group A` (bUCjp) — props: vertical_centering=True
      - **Group** `Group E` (bUClJ) — props: vertical_centering=True
        - **Text** `Text C` (bUCkx) — text: "Buscar"
        - **Input** `Input A` (bUClD) — placeholder: "Nome do grupo cliente/fornecedor" · content: "" · props: vertical_centering=True
      - **Group** `Group G` (bUClf) — props: vertical_centering=True
        - **Text** `Text E` (bUCll) — text: "Status"
        - **Dropdown** `dd status` (bUDNP) — data_source: All(opt.StatusChamado) · placeholder: "Escolha uma opção..." · props: default=El[Pop Novo Chamado]:get_group_data:cpo.QualStatusChamado, dynamic_type="option.opt_statuslure", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
      - **Group** `Group F` (bUClU) — props: vertical_centering=True
        - **Text** `Text D` (bUCla) — text: "Prioridade"
        - **Dropdown** `dd prioridade` (bUDNV) — data_source: All(opt.prioridade) · placeholder: "Escolha uma opção..." · props: default=El[Pop Novo Chamado]:get_group_data:Cpo.QualPrioridade, dynamic_type="option.opt_prioridade", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
      - **Button** `Button B` (bUCln) — text: "Limpar" · props: icon="feather filter", vertical_centering=True, button_type="label_icon"
        - ⟂ quando This:is_pressed → bgcolor="rgba(226,226,226,1)"
        - ⟂ quando This:is_hovered → bgcolor="rgba(217,217,217,1)"
    - **Table** `tbl Chamados` (bUClt) — data_source: Search(Tbl.SacProtocolo: cpo.Ativo is_empty ∅) · props: group_type="custom.tbl_sac", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="rgba(240,240,240,1)", horizontal_separator_style="solid"
      - ⟂ quando El[Input A]:get_data:is_not_empty → data_source=Search(Tbl.SacProtocolo):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualGrupoCliFor:cpo.NomeCliFor:to_uppercase:contains(Text("{El[Input A]:get_data:to_uppercase}")), constraint_type=∅}})
      - ⟂ quando El[dd status]:get_data:is_not_empty → data_source=Search(Tbl.SacProtocolo: cpo.QualStatusChamado equals El[dd status]:get_data)
      - ⟂ quando El[dd prioridade]:get_data:is_not_empty → data_source=Search(Tbl.SacProtocolo: Cpo.QualPrioridade equals El[dd prioridade]:get_data)
      - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → data_source=Search(Tbl.SacProtocolo: cpo.QualResponsável equals CurrentUser)
      - **TableMainAxis** `TableMainAxis A` (bUCmp) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis A` (bUCmt) — props: axis_index=2
      - **TableMainAxis** `TableMainAxis A` (bUCmu) — props: axis_index=6
      - **TableCrossAxis** `TableCrossAxis A` (bUCmv) — props: axis_index=0, cross_axis_repeat=False
        - **TableCell** `Cell A` (bUCmz) — props: cell_main_axis_id="bUCmp"
          - **Text** `Text F` (bUCpd) — text: "PROTOCOLO"
        - **TableCell** `Cell A` (bUCnA) — props: cell_main_axis_id="bUCmt"
          - **Text** `Text H` (bUCpp) — text: "PEDIDO"
        - **TableCell** `Cell A` (bUCnB) — props: cell_main_axis_id="bUCmu"
          - **Text** `Text L` (bUCqN) — text: "RESPONSÁVEL"
        - **TableCell** `Cell B` (bUCnT) — props: cell_main_axis_id="bUCnN"
          - **Text** `Text G` (bUCpj) — text: "CLIENTE (CNPJ) "
        - **TableCell** `Cell D` (bUCnx) — props: cell_main_axis_id="bUCnr"
          - **Text** `Text I` (bUCpv) — text: "TIPO"
        - **TableCell** `Cell F` (bUCob) — props: cell_main_axis_id="bUCoV"
          - **Text** `Text J` (bUCqB) — text: "PRIORIDADE"
        - **TableCell** `Cell H` (bUCpF) — props: cell_main_axis_id="bUCoz"
          - **Text** `Text K` (bUCqH) — text: "STATUS"
        - **TableCell** `Cell O` (bUDLq0) — props: cell_main_axis_id="bUDLk0"
        - **TableCell** `Cell X` (bUEEx2) — props: cell_main_axis_id="bUEEr2"
      - **TableCrossAxis** `TableCrossAxis A` (bUCnF) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
        - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(247,247,247,1)"
        - **TableCell** `Cell A` (bUCnG) — props: cell_main_axis_id="bUCmp"
          - **Text** `Text DZ` (bUDIF) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumeroProtocoloNum}")}"
        - **TableCell** `Cell A` (bUCnH) — props: cell_main_axis_id="bUCmt"
          - **Text** `Text FZ` (bUDIR) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualPedido:cpo.NumeroPedido}")}"
        - **TableCell** `Cell A` (bUCnL) — props: cell_main_axis_id="bUCmu"
          - **Text** `Text JZ` (bUDIv) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualResponsável:cpo.NomeModelo:to_uppercase}")}"
        - **TableCell** `Cell C` (bUCnZ) — props: cell_main_axis_id="bUCnN"
          - **Text** `Text EZ` (bUDIL) — text: ""
          - **Text** `Text KZ` (bUDJN) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.NomeCliFor}")}"
        - **TableCell** `Cell E` (bUCoD) — props: cell_main_axis_id="bUCnr"
          - **Text** `Text GZ` (bUDIX) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualTipoOcorrencia:display}")}"
        - **TableCell** `Cell G` (bUCoh) — props: cell_main_axis_id="bUCoV"
          - **Text** `Text HZ` (bUDId) — text: "{Text("{Ancestor[TableCrossAxis]:Cpo.QualPrioridade:display}")}"
            - ⟂ quando Ancestor[TableCrossAxis]:Cpo.QualPrioridade:equals(opt.prioridade.Alta) → border_color="rgba(255,57,57,1)", font_color="rgba(255,255,255,1)", bgcolor="rgba(255,57,57,1)"
            - ⟂ quando Ancestor[TableCrossAxis]:Cpo.QualPrioridade:equals(opt.prioridade.Média) → border_color="var(--color_alert_default)", font_color="rgba(255,255,255,1)", bgcolor="var(--color_alert_default)"
            - ⟂ quando Ancestor[TableCrossAxis]:Cpo.QualPrioridade:equals(opt.prioridade.Baixa) → border_color="var(--color_primary_default)", font_color="rgba(255,255,255,1)", bgcolor="var(--color_primary_default)"
        - **TableCell** `Cell I` (bUCpL) — props: cell_main_axis_id="bUCoz"
          - **Text** `Text IZ` (bUDIj) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualStatusChamado:display}")}"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualStatusChamado:equals(opt.StatusChamado.Em análise) → border_color="var(--color_bTHHD_default)", font_color="var(--color_bTHHD_default)", bgcolor="var(--color_primary_contrast_default)"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualStatusChamado:equals(opt.StatusChamado.Em aberto) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", bgcolor="var(--color_primary_contrast_default)"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualStatusChamado:equals(opt.StatusChamado.Resolvido) → border_color="var(--color_bTHHX_default)", font_color="var(--color_bTHHX_default)", bgcolor="var(--color_primary_contrast_default)"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualStatusChamado:equals(opt.StatusChamado.Pendente de informações) → border_color="var(--color_alert_default)", font_color="var(--color_alert_default)", bgcolor="rgba(255,255,255,1)"
        - **TableCell** `Cell P` (bUDLw0) — props: cell_main_axis_id="bUDLk0"
          - **Group** `col.Botoes` (bUDMa0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_sac", vertical_centering=True
            - **Text** `Text PZ` (bUDMl0) — text: "Detalhes"
              - ⟂ quando El[col.Botoes]:is_hovered → font_weight="500"
            - **Icon** `IconEdit` (bUDMg0) — props: icon="phosphor outlined pencil-simple", vertical_centering=True, button_disabled=False, title_attribute="Editar"
              - ⟂ quando El[col.Botoes]:is_hovered → icon_color="rgba(40, 100, 216, 1)"
            - **Icon** `IconAlterarEmail` (bUDMh0) — oculto ao carregar · props: icon="material outlined mark_email_unread", vertical_centering=True, button_disabled=False, title_attribute="Alterar e-mail do funcionário"
            - **Icon** `IconCancel` (bUDMf0) — oculto ao carregar · props: icon="material outlined cancel", vertical_centering=True, button_disabled=False, title_attribute="Cancelar alterações"
        - **TableCell** `Cell Y` (bUEFD2) — props: cell_main_axis_id="bUEEr2"
          - **Icon** `Icon V` (bUEFb2) — props: icon="phosphor outlined trash-simple", vertical_centering=True
            - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, icon_color="var(--color_bTHHQ_default)", boxshadow_blur=2
      - **TableMainAxis** `Column B` (bUCnN) — props: axis_index=1
      - **TableMainAxis** `Column D` (bUCnr) — props: axis_index=3
      - **TableMainAxis** `Column E` (bUCoV) — props: axis_index=4
      - **TableMainAxis** `Column F` (bUCoz) — props: axis_index=5
      - **TableMainAxis** `Column H` (bUDLk0) — props: axis_index=7
      - **TableMainAxis** `Column I` (bUEEr2) — props: axis_index=8
  - **Group** `Group Relatórios` (bUDDt) — oculto ao carregar · props: vertical_centering=True
    - **Group** `Group Y` (bUDDy) — props: vertical_centering=True
      - **Group** `Group Y` (bUDED) — props: vertical_centering=True
        - **Text** `Text BZ` (bUDEE) — text: "Indicadores e Métricas"
        - **Text** `Text CZ` (bUDHc) — text: "Visão geral de desempenho"
    - **Group** `Group Y` (bUDEF) — oculto ao carregar · props: vertical_centering=True
      - **Group** `Group Y` (bUDEJ) — props: vertical_centering=True
        - **Text** `Text BZ` (bUDEK) — text: "Período"
        - **Group** `Group Y` (bUDEL) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_color="var(--color_bTJfr1_default)"
          - **Icon** `Icon F` (bUDEP) — props: icon="material outlined calendar_today", vertical_centering=True, button_disabled=True
          - **Plugin[1648823245313x509054419018711040]/AAC** `dd data grafico` (bUDEQ) — props: font_alignment="center", AAG="pt-BR", AAO=False, AAP="Aplicar", AAQ="Cancelar", AAR=False, AAS=False, AAX=True, AAf="Escolha a data", font_family="var(--font_default)"
      - **Group** `Group Y` (bUDER) — props: vertical_centering=True
        - **Text** `Text BZ` (bUDEW) — text: "Departamento"
        - **Group** `Group EZ` (bUDHj) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_color="var(--color_bTJfr1_default)"
          - ⟂ quando El[ipt.email]:is_focused → border_color="var(--color_bTJfr1_default)"
          - **Icon** `Icon G` (bUDHo) — props: icon="material outlined category", vertical_centering=True, button_disabled=True
          - **Input** `ipt.email` (bUDHp) — placeholder: "CNPJ/Endereço" · content_format: "text" · props: vertical_centering=True, font_family="var(--font_default)", placeholder_color="rgba(var(--color_text_default_rgb), 0.36)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → 
    - **Group** `Group DZ` (bUDGb) — props: vertical_centering=True
      - **HTML** `HTML A` (bUDGP) — html(9409 chars) · props: vertical_centering=True
      - **RepeatingGroup** `rpg sac protocolos (filtrar data) ` (bUEDF) — oculto ao carregar · data_source: Search(Tbl.SacProtocolo) · props: group_type="custom.tbl_sac", cell_min_height_css="56px"
      - **HTML** `HTML B` (bUDGV) — html(4520 chars) · props: vertical_centering=True
        - ⟂ quando El[dd data grafico]:get_AAF:is_empty → html="<!DOCTYPE html>⏎<html lang="pt-BR">⏎<head>⏎  <meta charset="UTF-8"/>⏎  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>⏎  <style>⏎    * { margin: 0; padding: 0; box-sizing: border-box; }⏎    html, body { width: 100%; height: 100%; background: #fff; font-family: 'Segoe UI', sans-serif; }⏎    .card {⏎      width: 100%; height: 100%;⏎      display: flex; flex-direction: column;⏎      padding: 20px 24px 16px;⏎      border-radius: 12px;⏎      box-shadow: 0 2px 12px rgba(0,0,0,0.08);⏎      background: #fff;⏎    }⏎    .title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 12px; }⏎    .chart-wrap { flex: 1; position: relative; min-height: 0; }⏎  </style>⏎</head>⏎<body>⏎  <div class="card">⏎    <div class="title">Volume por Tipo de Ocorrência</div>⏎    <div class="chart-wrap">⏎      <canvas id="volumeChart"></canvas>⏎    </div>⏎  </div>⏎  <script>⏎    (function() {⏎      var s = document.createElement('script');⏎      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';⏎      s.onload = function() {⏎        var ctx = document.getElementById('volumeChart').getContext('2d');⏎        new Chart(ctx, {⏎          type: 'bar',⏎          data: {⏎            labels: ['Qualidade','Atraso','Divergência de Pedido', 'Falta de material','Financeiro','Outro'],⏎            datasets: [{⏎              data: [{Text("{Search(Tbl.SacProtocolo):filtered(constraints={0={key="cpo_qualtipoocorrencia_option_opt_tipoocorrencia", value=Opt.TipoOcorrencia.Qualidade, constraint_type="equals"}}):count}")}, {Text("{Search(Tbl.SacProtocolo):filtered(constraints={0={key="cpo_qualtipoocorrencia_option_opt_tipoocorrencia", value=Opt.TipoOcorrencia.Atraso, constraint_type="equals"}}):count}")}, {Text("{Search(Tbl.SacProtocolo):filtered(constraints={0={key="cpo_qualtipoocorrencia_option_opt_tipoocorrencia", value=Opt.TipoOcorrencia.Divergência de Pedido, constraint_type="equals"}}):count}")},{Text("{Search(Tbl.SacProtocolo):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:Created Date:is_contained_by_list(El[dd data grafico]:get_AAe), constraint_type=∅}, 1={key="cpo_qualtipoocorrencia_option_opt_tipoocorrencia", value=Opt.TipoOcorrencia.Pedido incompleto, constraint_type="equals"}}):count}")},{Text("{Search(Tbl.SacProtocolo):filtered(constraints={0={key="cpo_qualtipoocorrencia_option_opt_tipoocorrencia", value=Opt.TipoOcorrencia.Financeiro, constraint_type="equals"}}):count}")},{Text("{Search(Tbl.SacProtocolo):filtered(constraints={0={key="cpo_qualtipoocorrencia_option_opt_tipoocorrencia", value=Opt.TipoOcorrencia.Outro, constraint_type="equals"}}):count}")}],⏎              backgroundColor: ['#5B5BD6', '#2DBD7E', '#F5A623'],⏎              borderRadius: 4,⏎              borderSkipped: false,⏎              barPercentage: 0.5,⏎              categoryPercentage: 0.6⏎            }]⏎          },⏎          options: {⏎            responsive: true,⏎            maintainAspectRatio: false,⏎            plugins: {⏎              legend: { display: false },⏎              tooltip: {⏎                backgroundColor: '#fff',⏎                borderColor: '#ddd',⏎                borderWidth: 1,⏎                titleColor: '#333',⏎                bodyColor: '#555',⏎                padding: 10,⏎                callbacks: { label: function(c){ return ' ' + c.parsed.y; } }⏎              }⏎            },⏎            scales: {⏎              x: {⏎                grid: { display: false },⏎                ticks: { color: '#888', font: { size: 11 } },⏎                border: { display: false }⏎              },⏎              y: {⏎                min: 0, max: 50,⏎                ticks: { stepSize: 1, color: '#888', font: { size: 11 } },⏎                grid: { color: '#f0f0f0' },⏎                border: { display: false }⏎              }⏎            }⏎          }⏎        });⏎      };⏎      document.head.appendChild(s);⏎    })();⏎  </script>⏎</body>⏎</html>"
  - **Group** `Group Gestão NPS` (bUCyb) — oculto ao carregar · props: vertical_centering=True
    - **Group** `Group V` (bUCyd) — props: vertical_centering=True
      - **Group** `Group V` (bUCyi) — props: vertical_centering=True
        - **Text** `Text U` (bUCyj) — text: "Gestão de Pesquisa de Satisfação"
    - **Group** `Group OZ` (bUDTu) — props: vertical_centering=True
      - **Group** `Group NZ` (bUDPz) — props: vertical_centering=True
        - **Text** `Text RZ` (bUDQF) — text: "Qual pesquisa?"
        - **Dropdown** `dd pesquisa` (bUDQE) — data_source: Search(Tbl.PesquisaNps) · placeholder: "Escolha uma pesquisa" · props: dynamic_type="custom.tbl_pesquisanps", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomePesquisa}"
      - **Button** `Button E` (bUCyh) — text: "Nova Pesquisa NPS" · props: icon="bootstrap plus-lg", font_alignment="center", vertical_centering=True, textshadow=False, button_type="label_icon", font_family="var(--font_default)"
        - ⟂ quando This:is_hovered → boxshadow_vertical=6, bgcolor="rgba(var(--color_primary_default_rgb), 0.8)", boxshadow_blur=12, boxshadow_color="rgba(2,68,247,0.25)"
    - **Group** `Group Z` (bUDAn) — props: vertical_centering=True
      - **Group** `Group W` (bUDAV) — props: vertical_centering=True
        - **Icon** `Icon B` (bUDBL) — props: icon="material outlined auto_graph", vertical_centering=True
          - ⟂ quando El[dd pesquisa]:get_data:is_empty → icon_color="rgba(158,158,158,1)", bgcolor="rgba(231,231,231,1)"
        - **Group** `Group AZ` (bUDBd) — props: vertical_centering=True
          - **Text** `Text V` (bUDBR) — text: "NPS Atual"
          - **Text** `Text W` (bUDBX) — text: "{Text("{Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data):count}")}"
      - **Group** `Group BZ` (bUDBo) — props: vertical_centering=True
        - **Icon** `Icon C` (bUDBt) — props: icon="material outlined people", vertical_centering=True
          - ⟂ quando El[dd pesquisa]:get_data:is_empty → icon_color="rgba(158,158,158,1)", bgcolor="rgba(231,231,231,1)"
        - **Group** `Group BZ` (bUDBu) — props: vertical_centering=True
          - **Text** `Text X` (bUDBv) — text: "Total de Respostas"
          - **Text** `Text X` (bUDBz) — text: "{Text("{Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data AND cpo.Respondida equals True):count}")}"
      - **Group** `Group CZ` (bUDCB) — props: vertical_centering=True
        - **Icon** `Icon D` (bUDCG) — props: icon="material outlined auto_graph", vertical_centering=True
          - ⟂ quando El[dd pesquisa]:get_data:is_empty → icon_color="rgba(158,158,158,1)", bgcolor="rgba(231,231,231,1)"
        - **Group** `Group CZ` (bUDCH) — props: vertical_centering=True
          - **Text** `Text Y` (bUDCL) — text: "Média da Avaliação"
          - **Text** `Text Y` (bUDCM) — text: "{Text("{Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data AND cpo.Respondida equals True):cpo.NotaNps:sum:divide(Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data AND cpo.Respondida equals True):count)}")}"
            - ⟂ quando Text("{Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data AND cpo.Respondida equals True):cpo.NotaNps:sum:divide(Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data AND cpo.Respondida equals True):count)}"):is_empty → text="{∅}0"
    - **Group** `Group V` (bUCyo) — props: vertical_centering=True
      - **Group** `Group V` (bUCyp) — props: vertical_centering=True
        - **Text** `Text U` (bUCyu) — text: "Buscar"
        - **Group** `Group X` (bUDCR) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_color="var(--color_bTJfr1_default)"
          - ⟂ quando El[ipt.email]:is_focused → border_color="var(--color_bTJfr1_default)"
          - **Icon** `Icon E` (bUDCT) — props: icon="material outlined search", vertical_centering=True, button_disabled=True
          - **Input** `ipt.email` (bUDCX) — placeholder: "CNPJ/Endereço" · content_format: "text" · props: vertical_centering=True, font_family="var(--font_default)", placeholder_color="rgba(var(--color_text_default_rgb), 0.36)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → 
    - **Group** `Group UZ` (bUDWd) — props: vertical_centering=True
      - **Group** `Group PZ` (bUDUX) — props: vertical_centering=True
        - **Text** `Text Z` (bUDUF) — text: "NPS Respostas"
        - **Plugin[1680110374647x249108010620944400]/AAC** `Switch B` (bUDUR) — props: AAE="rgba(255,255,255,1)", AAH="rgba(199,199,199,1)", AAO="rgba(255,255,255,1)", AAQ="rgba(255,255,255,1)"
      - **Group** `Group TZ` (bUDWV) — props: vertical_centering=True
        - **Text** `Text AZ` (bUDWb) — text: "Contatos"
        - **Plugin[1680110374647x249108010620944400]/AAC** `Switch Contatos ` (bUDWX) — props: AAE="rgba(255,255,255,1)", AAH="rgba(199,199,199,1)", AAO="rgba(255,255,255,1)", AAQ="rgba(255,255,255,1)"
          - ⟂ quando El[dd pesquisa]:get_data:is_empty → AAK=True
    - **Group** `Group VZ` (bUDlh) — props: vertical_centering=True
      - **Table** `Table B` (bUCzL) — data_source: Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data) · props: group_type="custom.tbl_pesquisaposvenda", vertical_centering=True, vertical_separator_style="none", horizontal_separator_style="solid"
        - ⟂ quando El[Input F]:get_data:is_not_empty → data_source=Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:contains(Text("{El[Input F]:get_data:to_uppercase}")), constraint_type=∅}})
        - **TableMainAxis** `TableMainAxis F` (bUCzM) — props: axis_index=0
        - **TableCrossAxis** `TableCrossAxis B` (bUCzS) — props: axis_index=0, cross_axis_repeat=False
          - ⟂ quando El[dd pesquisa]:get_data:is_empty → bgcolor="rgba(175,175,175,0.95)"
          - **TableCell** `Cell J` (bUCzT) — props: cell_main_axis_id="bUCzM"
            - **Text** `Text U` (bUCzX) — text: "DATA"
          - **TableCell** `Cell J` (bUCzf) — props: cell_main_axis_id="bUDAN"
            - **Input** `Input F` (bUEGb0) — placeholder: "CLIENTE (CNPJ) " · props: vertical_centering=True, placeholder_color="rgba(255,255,255,1)"
              - ⟂ quando This:is_focused → background_style="bgcolor", bgcolor="rgba(136,173,255,1)"
          - **TableCell** `Cell K` (bUDRf) — props: cell_main_axis_id="bUDRZ"
            - **Text** `Text UZ` (bUDUj) — text: "STATUS "
          - **TableCell** `Cell Q` (bUDSJ) — props: cell_main_axis_id="bUDSD"
          - **TableCell** `Cell T` (bUDVB) — props: cell_main_axis_id="bUDUp"
            - **Text** `Text YZ` (bUDVg) — text: "RESPOSTAS"
          - **TableCell** `Cell U` (bUEDt2) — props: cell_main_axis_id="bUEDh2"
        - **TableCrossAxis** `TableCrossAxis B` (bUCzw) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=0
          - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(245,245,245,1)"
          - **TableCell** `Cell J` (bUCzx) — props: cell_main_axis_id="bUCzM"
            - **Text** `Text SZ` (bUDQh) — text: "{Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format=" dd/mm/yy HH:MM")}"
          - **TableCell** `Cell J` (bUDAD) — props: cell_main_axis_id="bUDAN"
            - **Text** `txt nome clifor respostas` (bUDQv) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor}"
          - **TableCell** `Cell L` (bUDRl) — props: cell_main_axis_id="bUDRZ"
            - **Button** `Button K` (bUDWP) — text: "Sem resposta" · props: icon="material outlined radio_button_unchecked", vertical_centering=True, icon_size=15, button_gap=4, button_type="label_icon"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Respondida:is_true → text="Respondido", icon="material outlined check_circle", border_color="var(--color_success_default)", font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_success_default)"
          - **TableCell** `Cell R` (bUDSP) — props: cell_main_axis_id="bUDSD"
            - **Dropdown** `dd qual email contato` (bUDcj) — data_source: Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Email para contato" · props: vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.Email}"
            - **Group** `col.Botoes` (bUDVT) — props: vertical_centering=True
              - **Text** `Text WZ` (bUDVb) — text: "Enviar Email"
                - ⟂ quando El[col.Botoes]:is_hovered → font_weight="500"
              - **Icon** `IconEdit` (bUDVZ) — props: icon="feather mail", vertical_centering=True, button_disabled=False, title_attribute="Editar"
                - ⟂ quando El[col.Botoes]:is_hovered → icon_color="rgba(40, 100, 216, 1)"
              - **Icon** `IconAlterarEmail` (bUDVa) — oculto ao carregar · props: icon="material outlined mark_email_unread", vertical_centering=True, button_disabled=False, title_attribute="Alterar e-mail do funcionário"
              - **Icon** `IconCancel` (bUDVV) — oculto ao carregar · props: icon="material outlined cancel", vertical_centering=True, button_disabled=False, title_attribute="Cancelar alterações"
          - **TableCell** `Cell S` (bUDUv) — props: cell_main_axis_id="bUDUp"
            - **Group** `Group RZ` (bUDVt) — props: vertical_centering=True
              - **Icon** `Icon K` (bUDVz) — props: icon="material outlined star", vertical_centering=True
              - **Text** `Text AZZ` (bUDVy) — text: "Nota NPS: {Text("{Ancestor[TableCrossAxis]:cpo.NotaNps}")}"
            - **Group** `Group SZ` (bUDlW) — props: vertical_centering=True
              - **Icon** `Icon L` (bUDlc) — props: icon="fontawesome-6 outlined comments", vertical_centering=True
              - **Text** `Text ZZ` (bUDlb) — text: "Observação: {Text("{Ancestor[TableCrossAxis]:cpo.CriticasSugestoes}")}"
          - **TableCell** `Cell N` (bUEDn2) — props: cell_main_axis_id="bUEDh2"
            - **Icon** `ico add retira contato` (bUEEL2) — props: icon="phosphor outlined trash-simple", vertical_centering=True
              - ⟂ quando This:is_hovered → title_attribute="{∅}Retirar contato da lista de resposta"
              - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, icon_color="var(--color_destructive_default)", boxshadow_blur=2
        - **TableMainAxis** `Column B` (bUDAN) — props: axis_index=1
        - **TableMainAxis** `Column E` (bUDRZ) — props: axis_index=2
        - **TableMainAxis** `Column F` (bUDSD) — props: axis_index=3
        - **TableMainAxis** `Column G` (bUDUp) — oculto ao carregar · props: axis_index=5
          - ⟂ quando El[Página sac]:custom.coluna_respostas_:is_true → is_visible=True
        - **TableMainAxis** `Column E` (bUEDh2) — props: axis_index=4
      - **Group** `gp contatos` (bUDlp) — oculto ao carregar · props: vertical_centering=True, overflow_scroll=True
        - ⟂ quando El[Switch Contatos ]:get_AAI:is_true → is_visible=True
        - **Table** `rpg adicionar contatos` (bUDXv) — data_source: El[rpg contatos]:get_list_data:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:_id:is_contained_by_list(Search(Tbl.Pedido: Modified Date gte Page.Current Date/Time:plus_months(-3)):cpo.QualCliente:_id), constraint_type=∅}}) · props: group_type="custom.tbl_clientes", vertical_centering=True
          - ⟂ quando El[Input C]:get_data:is_not_empty → data_source=Search(Tbl.GrupoCliFor):unique:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.NomeCliFor:to_uppercase:contains(Text("{El[Input C]:get_data:to_uppercase}")), constraint_type=∅}})
          - **TableMainAxis** `Column E` (bUDbJ) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis H` (bUDYD) — props: axis_index=5
          - **TableCrossAxis** `TableCrossAxis C` (bUDYH) — props: axis_index=0, make_sticky=True, cross_axis_repeat=False
            - **TableCell** `Cell V` (bUDbP) — props: cell_main_axis_id="bUDbJ"
              - **Text** `Text EZZ` (bUDbr) — text: "EMAIL "
            - **TableCell** `Cell M` (bUDYV) — props: cell_main_axis_id="bUDYD"
              - **Text** `Text FZZ` (bUDbx) — text: "TELEFONE"
            - **TableCell** `Cell M` (bUDYm) — props: cell_main_axis_id="bUDZj"
              - **Icon** `Icon M` (bUDYn) — props: icon="material outlined person_add_alt_1", vertical_centering=True
            - **TableCell** `Cell M` (bUDYs) — props: cell_main_axis_id="bUDZn", cell_cross_axis_index=0
              - **Input** `Input C` (bUDlz) — placeholder: "NOME " · props: vertical_centering=True, placeholder_color="rgba(255,255,255,1)"
                - ⟂ quando This:is_focused → background_style="bgcolor", bgcolor="rgba(136,173,255,1)"
          - **TableCrossAxis** `TableCrossAxis C` (bUDYz) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=3
            - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(252,252,252,1)"
            - ⟂ quando Ancestor[TableCrossAxis]:_id:is_contained_by_list(Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data):cpo.QualCliente:_id) → bgcolor="rgba(231,231,231,1)"
            - **TableCell** `Cell W` (bUDbV) — props: cell_main_axis_id="bUDbJ"
              - **Text** `Text GZZ` (bUDcD) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisContatos:cpo.Email:split_by(separator=",")}"
            - **TableCell** `Cell M` (bUDZQ) — props: cell_main_axis_id="bUDYD"
              - **Text** `Text HZZ` (bUDcK) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisContatos:cpo.Telefone}"
            - **TableCell** `Cell M` (bUDZb) — props: cell_main_axis_id="bUDZj"
              - **Icon** `ico add retira contato` (bUDZc) — props: icon="material outlined keyboard_double_arrow_left", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:_id:is_contained_by_list(Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data):cpo.QualCliente:_id) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **TableCell** `Cell M` (bUDZd) — props: cell_main_axis_id="bUDZn", cell_cross_axis_index=1
              - **Text** `Text XZ` (bUDZv) — text: "{Ancestor[TableCrossAxis]:cpo.NomeCliFor}"
          - **TableMainAxis** `Column G` (bUDZj) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis H` (bUDZn) — props: axis_index=2
  - **RepeatingGroup** `rpg contatos` (bUEAF) — oculto ao carregar · data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente):unique · props: group_type="custom.tbl_clientes", cell_min_height_css="56px"
  - **Group** `Group Pós - Venda` (bUELT0) — oculto ao carregar · props: vertical_centering=True
    - **Group** `Group CZZ` (bUELU0) — props: vertical_centering=True
      - **Group** `Group CZZ` (bUELV0) — props: vertical_centering=True
        - **Text** `Text BZZ` (bUELZ0) — text: "Gestão de Respostas do Pós-Venda"
    - **Group** `Group CZZ` (bUEMp0) — props: vertical_centering=True
      - **Table** `Table D` (bUEMt0) — data_source: Search(Tbl.PesquisaRespostas: cpo.TipoResposta equals Opt.TipoPesquisa.Pós-Venda) · props: group_type="custom.tbl_pesquisaposvenda", vertical_centering=True, vertical_separator_style="none", horizontal_separator_style="solid"
        - ⟂ quando El[Input G]:get_data:is_not_empty → data_source=Search(Tbl.PesquisaRespostas: cpo.QualPesquisa equals El[dd pesquisa]:get_data):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:contains(Text("{El[Input G]:get_data:to_uppercase}")), constraint_type=∅}})
        - **TableMainAxis** `TableMainAxis O` (bUEMu0) — props: axis_index=0
        - **TableCrossAxis** `TableCrossAxis D` (bUEMv0) — props: axis_index=0, cross_axis_repeat=False
          - **TableCell** `Cell Z` (bUEMz0) — props: cell_main_axis_id="bUEMu0"
            - **Text** `Text BZZ` (bUENA0) — text: "DATA"
          - **TableCell** `Cell Z` (bUENB0) — props: cell_main_axis_id="bUEON0"
            - **Input** `Input G` (bUENF0) — placeholder: "CLIENTE (CNPJ) " · props: vertical_centering=True, placeholder_color="rgba(255,255,255,1)"
              - ⟂ quando This:is_focused → background_style="bgcolor", bgcolor="rgba(136,173,255,1)"
          - **TableCell** `Cell Z` (bUENG0) — props: cell_main_axis_id="bUEOO0"
            - **Text** `Text BZZ` (bUENH0) — text: "STATUS "
          - **TableCell** `Cell Z` (bUENM0) — props: cell_main_axis_id="bUEOT0"
            - **Text** `Text BZZ` (bUENN0) — text: "RESPOSTAS"
          - **TableCell** `Cell CZ` (bUEoN) — props: cell_main_axis_id="bUEoH"
            - **Input** `Input H` (bUEoZ) — placeholder: "QUAL VENDEDORA" · props: vertical_centering=True, placeholder_color="rgba(255,255,255,1)"
              - ⟂ quando This:is_focused → background_style="bgcolor", bgcolor="rgba(136,173,255,1)"
          - **TableCell** `Cell BZ` (bUEQk0) — props: cell_main_axis_id="bUEQY0"
        - **TableCrossAxis** `TableCrossAxis D` (bUENS0) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=False, fixed_number_repeating_axis_count=0
          - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(245,245,245,1)"
          - **TableCell** `Cell Z` (bUENT0) — props: cell_main_axis_id="bUEMu0"
            - **Text** `Text BZZ` (bUENX0) — text: "{Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format=" dd/mm/yy HH:MM")}"
          - **TableCell** `Cell Z` (bUENY0) — props: cell_main_axis_id="bUEON0"
            - **Text** `txt nome clifor respostas` (bUENZ0) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor}"
          - **TableCell** `Cell Z` (bUENd0) — props: cell_main_axis_id="bUEOO0"
            - **Button** `Button P` (bUENe0) — text: "Sem resposta" · props: icon="material outlined radio_button_unchecked", vertical_centering=True, icon_size=15, button_gap=4, button_type="label_icon"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Respondida:is_true → text="Respondido", icon="material outlined check_circle", border_color="var(--color_success_default)", font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_success_default)"
          - **TableCell** `Cell Z` (bUENv0) — props: cell_main_axis_id="bUEOT0"
            - **Group** `Group CZZ` (bUENw0) — props: vertical_centering=True
              - **Icon** `Icon W` (bUEOB0) — props: icon="material outlined star", vertical_centering=True
              - **Text** `Text BZZ` (bUENx0) — text: "Nota NPS: {Text("{Ancestor[TableCrossAxis]:cpo.NotaNps}")}"
            - **Group** `Group CZZ` (bUEOC0) — props: vertical_centering=True
              - **Icon** `Icon W` (bUEOH0) — props: icon="fontawesome-6 outlined comments", vertical_centering=True
              - **Text** `Text BZZ` (bUEOD0) — text: "Observação: {Text("{Ancestor[TableCrossAxis]:cpo.CriticasSugestoes}")}"
          - **TableCell** `Cell DZ` (bUEoT) — props: cell_main_axis_id="bUEoH"
            - **Text** `txt nome clifor respostas` (bUEof) — text: "{Ancestor[TableCrossAxis]:cpo.QualPedido:cpo.QualVendedor:cpo.NomeModelo}"
          - **TableCell** `Cell AZ` (bUEQe0) — props: cell_main_axis_id="bUEQY0"
            - **Group** `Group WZZ` (bUESb) — props: vertical_centering=True
              - **Group** `Group TZZ` (bUERC0) — props: vertical_centering=True
                - **Icon** `Icon X` (bUERI0) — props: icon="material outlined star", vertical_centering=True
                - **Text** `Text PZZ` (bUERH0) — text: "Nota Atendimento: {Text("{Ancestor[TableCrossAxis]:cpo.NotaAtendimento}")}"
              - **Group** `Group VZZ` (bUERZ0) — props: vertical_centering=True
                - **Icon** `Icon Z` (bUERf0) — props: icon="material outlined star", vertical_centering=True
                - **Text** `Text RZZ` (bUERb0) — text: "Nota Produto: {Text("{Ancestor[TableCrossAxis]:cpo.NotaProduto}")}"
            - **Group** `Group UZZ` (bUERN0) — props: vertical_centering=True
              - **Icon** `Icon Y` (bUERT0) — props: icon="material regular mode_comment", vertical_centering=True
              - **Text** `Text QZZ` (bUERP0) — text: "Observação: {Text("{Ancestor[TableCrossAxis]:cpo.CriticasSugestoes}")}"
        - **TableMainAxis** `Column B` (bUEON0) — props: axis_index=1
        - **TableMainAxis** `Column E` (bUEOO0) — props: axis_index=3
        - **TableMainAxis** `Column G` (bUEOT0) — oculto ao carregar · props: axis_index=5
          - ⟂ quando El[Página sac]:custom.coluna_respostas_:is_true → is_visible=True
        - **TableMainAxis** `Column C` (bUEoH) — props: axis_index=2
        - **TableMainAxis** `Column D` (bUEQY0) — props: axis_index=4
- **CustomElement** `tool.MenuPaginas A` (bUCuZ) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **Popup** `pop novapesquisa` (bUDNv) — props: group_type="custom.tbl_configuracoes", vertical_centering=True, greyout_color="rgba(0,0,0,0.6)", four_border_style=False
  - **Group** `Group MZ` (bUDPh) — props: vertical_centering=True
    - **Icon** `Icon I` (bUDOF) — props: icon="fa fa-close", vertical_centering=True
      - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, icon_color="var(--color_destructive_default)", boxshadow_blur=2
  - **Group** `Group LZ` (bUDPO) — data_source: Parent · props: group_type="custom.tbl_configuracoes", vertical_centering=True
    - **Group** `Group KZ` (bUDOA) — data_source: Parent · props: group_type="custom.tbl_configuracoes", vertical_centering=True
      - **Text** `Text QZ` (bUDOB) — text: "Nova Pesquisa"
    - **Group** `g Form` (bUDOG) — data_source: Parent · props: group_type="custom.tbl_configuracoes"
      - **Group** `g Input` (bUDOY) — data_source: Parent · props: group_type="custom.tbl_configuracoes"
        - **Text** `Text QZ` (bUDOZ) — text: "Titulo pesquisa"
        - **Input** `ipt titulo pesquisa` (bUDOd) — placeholder: "Escreva aqui" · content: "" · props: mandatory=True
      - **Group** `Group KZ` (bUDOf) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_configuracoes", vertical_centering=True
        - **Group** `Group KZ` (bUDOj) — data_source: Parent · props: group_type="custom.tbl_configuracoes", vertical_centering=True
          - **Text** `Text QZ` (bUDOk) — text: "Copiar contatos da última pesquisa" · props: font_alignment="left"
          - **Plugin[1680110374647x249108010620944400]/AAC** `tgg copia pesquisa` (bUDOl) — props: AAG="var(--color_primary_default)", AAH="var(--color_primary_contrast_default)", AAK=False, AAO="var(--color_primary_default)", AAP=1, AAR=0, ABB="var(--color_primary_default)"
        - **Group** `g Input copy 3` (bUDOp) — data_source: Parent · props: group_type="custom.tbl_configuracoes"
          - **Group** `gp ultima pesquisa` (bUDOq) — props: vertical_centering=True
            - **Text** `Text QZ` (bUDOv) — text: "Última pesquisa: "
            - **Input** `ipt ultima pesquisa` (bUDOr) — placeholder: "" · content: "" · content_format: "text" · props: mandatory=False, font_alignment="right", disabled=True
          - **Group** `gp ultima pesquisa copy` (bUDOw) — props: vertical_centering=True
            - **Text** `Text QZ` (bUDPB) — text: "Qtd contatos:"
            - **Input** `ipt ultima pesquisa` (bUDOx) — placeholder: "" · content: "" · content_format: "text" · props: mandatory=False, font_alignment="right", disabled=True
      - **Text** `alerta criando pesquisa` (bUDOX) — oculto ao carregar · text: "[fa]spinner fa-pulse[/fa] Aguarde, criando pesquisa! ⏎Não feche essa janela!" · props: vertical_centering=True
    - **Button** `btn gravar pesquisa nps` (bUDON) — text: "Gravar NPS" · props: font_alignment="center", vertical_centering=True, font_family="var(--font_default)"

## Workflows

#### WF bUCtx — ButtonClicked em El[Button A]
1. **ShowElement** [bUCuD] alvo El[Pop Novo Chamado]

#### WF bUCuf — ButtonClicked em El[btn menu]
- condição: El[Reusable tool.Cabecalho]:custom.var_showmenu_:is_false
1. **SetCustomState** [bUCuh] alvo El[Reusable tool.Cabecalho] · value=True, custom_state="custom.var_showmenu_"

#### WF bUCwT — ButtonClicked em El[Icon A]
1. **HideElement** [bUCwZ] alvo El[Pop Novo Chamado]

#### WF bUDGm — ButtonClicked em El[Button G]
- props: event_color="blue"
1. **ToggleElement** [bUDGs] alvo El[Group Relatórios]
2. **HideElement** [bUDGx] alvo El[Group Chamados]
3. **HideElement** [bUDGz] alvo El[Group Gestão NPS]
4. **HideElement** [bUERn] alvo El[Group Pós - Venda]

#### WF bUDHE — ButtonClicked em El[Button F]
- props: event_color="blue"
1. **HideElement** [bUDHJ] alvo El[Group Relatórios]
2. **ToggleElement** [bUDHK] alvo El[Group Chamados]
3. **HideElement** [bUDHL] alvo El[Group Gestão NPS]
4. **HideElement** [bUERl] alvo El[Group Pós - Venda]

#### WF bUDHQ — ButtonClicked em El[Button H]
- props: event_color="blue"
1. **HideElement** [bUDHV] alvo El[Group Relatórios]
2. **HideElement** [bUDHW] alvo El[Group Chamados]
3. **ToggleElement** [bUDHX] alvo El[Group Gestão NPS]
4. **HideElement** [bUERs] alvo El[Group Pós - Venda]

#### WF bUDNb — ButtonClicked em El[Button B]
1. **ResetGroup** [bUDNh] alvo El[Group A]

#### WF bUDPD — ButtonClicked em El[Button E]
1. **ShowElement** [bUDPJ] alvo El[pop novapesquisa]

#### WF bUDPr — ButtonClicked em El[btn gravar pesquisa nps]
1. **NewThing** [bUDPx] tipo Tbl.PesquisaNps · campos: cpo.NomePesquisa = "{El[ipt titulo pesquisa]:get_data}"
2. **HideElement** [bUEAi3] alvo El[pop novapesquisa]

#### WF bUDSx — ButtonClicked em El[Button Salvar]
1. **ChangeThing** [bUDTF] campos: cpo.Anexos = El[ipt anexos]:get_data; cpo.Descricao = "{El[ipt obs]:get_data}"; cpo.QuaisEntregas = El[dd entregas]:get_data; cpo.QualFilial = El[dd qualfilial]:get_data; cpo.QualGrupoCliFor = El[dd qualclifor]:get_data; cpo.QualPedido = El[dd pedido]:get_data; Cpo.QualPrioridade = El[dd prioridade]:get_data; cpo.QualResponsável = El[dd responsável]:get_data; cpo.QualStatusChamado = El[dd status]:get_data; cpo.QualTipoOcorrencia = El[dd ocorrencia]:get_data · to_change=El[Pop Novo Chamado]:get_group_data
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUEAb3] AAF="Alterado com sucesso!"
3. **HideElement** [bUEAd3] alvo El[Pop Novo Chamado]
4. **ResetGroup** [bUECm] alvo El[Pop Novo Chamado]
5. **ChangeThing** [bUECy] SÓ SE ResultOfStep[bUDTF]:cpo.QualStatusChamado:equals(opt.StatusChamado.Resolvido) · campos: cpo.DataFechado = Page.Current Date/Time · to_change=ResultOfStep[bUDTF]
6. **ChangeThing** [bUEDD] campos: Cpo.TempoResolução = ResultOfStep[bUECy]:cpo.DataFechado:minus(ResultOfStep[bUECy]:cpo.DataAberto) · to_change=ResultOfStep[bUECy]

#### WF bUDTP — PopupClosed em El[Pop Novo Chamado]
1. **ResetGroup** [bUDTV] alvo El[Pop Novo Chamado]

#### WF bUDcQ — ButtonClicked em El[ico add retira contato]
1. **NewThing** [bUDcW] tipo Tbl.PesquisaRespostas · campos: cpo.QualCliente = Ancestor[TableCrossAxis]; cpo.QualPesquisa = El[dd pesquisa]:get_data
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUEEe2] AAF="Adicionado a lista de respostas com sucesso"

#### WF bUDcb — ButtonClicked em El[col.Botoes]
1. **ScheduleAPIEvent** [bUDzn] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="", _wf_param_to="{El[dd qual email contato]:get_data:cpo.Email}", _wf_param_body="Olá, tudo bem? Aqui é da equipe de Ouvidoria do Grupo Megabox!Queremos ouvir você! Sua opinião é muito importante para continuarmos melhorando nossos serviços e oferecendo a melhor experiência possível.Preparamos uma pesquisa rápida de satisfação (leva menos de 1 minuto) e gostaríamos muito da sua participação:👉 https://grupomegabox.bubbleapps.io/formularionps?id={Ancestor[TableCrossAxis]:_id}⏎⏎Sua resposta faz toda a diferença para nós!⏎⏎Desde já, agradecemos pelo seu tempo e confiança. Se quiser compartilhar algo além da pesquisa, será um prazer te ouvir.⏎⏎Atenciosamente,⏎Ouvidoria – Grupo Megabox", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="Megabox", _wf_param_subject="Avaliação NPS - Megabox"

#### WF bUDth — ButtonClicked em El[Button N]
1. **NewThing** [bUDtn] tipo Tbl.SacHistorico · campos: cpo.DescricaoHistorico = "{El[MultilineInput B]:get_data}"; cpo.QualProtocolo = El[Pop Novo Chamado]:get_group_data; cpo.VisivelCliente = El[tgg visivel cliente ]:get_AAI
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUDtz] AAF="Registrado com sucesso!"
3. **ScheduleAPIEvent** [bUDzl] SÓ SE El[tgg visivel cliente ]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="", _wf_param_to="{El[dd qual email]:get_data:cpo.Email}", _wf_param_body="Olá, tudo bem?Somos da equipe de Ouvidoria do Grupo Megabox.Estamos entrando em contato para informar que houve uma atualização no seu atendimento. Seguem os detalhes do seu protocolo:📌 Protocolo: {ResultOfStep[bUDtn]:cpo.QualProtocolo:cpo.NumeroProtocoloNum}⏎📄 Atualização: {ResultOfStep[bUDtn]:cpo.DescricaoHistorico}⏎🔄 Status atual: {El[Pop Novo Chamado]:get_group_data:cpo.QualStatusChamado:display}⏎⏎Agradecemos pela sua paciência e por nos dar a oportunidade de melhorar a sua experiência conosco.⏎⏎Se precisar de mais alguma informação, ficamos à disposição.⏎⏎Atenciosamente,⏎Ouvidoria - Grupo Megabox", _wf_param_sender="Megabox", _wf_param_subject="Atualização do seu atendimento – SAC"
4. **ResetGroup** [bUECr] alvo El[Group Nova interação]

#### WF bUDuJ — ButtonClicked em El[Button M]
1. **ShowElement** [bUDuP] alvo El[Group HistoricoSac]
2. **HideElement** [bUDuR] alvo El[Group Protocolo]

#### WF bUDud — ButtonClicked em El[Button L]
1. **ShowElement** [bUDuj] alvo El[Group Protocolo]
2. **HideElement** [bUDuo] alvo El[Group HistoricoSac]

#### WF bUEAL — ButtonClicked em El[Icon I]
1. **HideElement** [bUEAR] alvo El[pop novapesquisa]

#### WF bUESK — ButtonClicked em El[Button O]
- props: event_color="blue"
1. **HideElement** [bUESP] alvo El[Group Relatórios]
2. **HideElement** [bUESQ] alvo El[Group Chamados]
3. **HideElement** [bUESR] alvo El[Group Gestão NPS]
4. **ToggleElement** [bUESV] alvo El[Group Pós - Venda]

#### WF bUDKb0 — ButtonClicked em El[Button C]
1. **HideElement** [bUDKh0] alvo El[Pop Novo Chamado]

#### WF bUDKj0 — ButtonClicked em El[Button D]
1. **NewThing** [bUDKp0] tipo Tbl.SacProtocolo · campos: cpo.Anexos = El[ipt anexos]:get_data; cpo.Descricao = "{El[ipt obs]:get_data}"; cpo.NumeroProtocoloNum = Search(Tbl.SacProtocolo):last_element:cpo.NumeroProtocoloNum:plus(1); cpo.QuaisEntregas = El[dd entregas]:get_data; cpo.QualFilial = El[dd qualfilial]:get_data; cpo.QualGrupoCliFor = El[dd qualclifor]:get_data; cpo.QualPedido = El[dd pedido]:get_data; Cpo.QualPrioridade = El[dd prioridade]:get_data; cpo.QualResponsável = El[dd responsável]:get_data; cpo.QualStatusChamado = El[dd status]:get_data; cpo.QualTipoOcorrencia = El[dd ocorrencia]:get_data
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUDLZ0] AAF="Criado com sucesso"
3. **ResetGroup** [bUECh] alvo El[Pop Novo Chamado]
4. **HideElement** [bUECf] alvo El[Pop Novo Chamado]
5. **ChangeThing** [bUECt] SÓ SE ResultOfStep[bUDKp0]:cpo.QualStatusChamado:equals(opt.StatusChamado.Em aberto) · campos: cpo.DataAberto = Page.Current Date/Time · to_change=ResultOfStep[bUDKp0]

#### WF bUDMn0 — ButtonClicked em El[col.Botoes]
1. **ShowElement** [bUDMt0] alvo El[Pop Novo Chamado]
2. **DisplayGroupData** [bUDMy0] alvo El[Pop Novo Chamado] · data_source=Ancestor[TableCrossAxis]

#### WF bUDmF2 — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch B]
- condição: This:get_AAI:is_true
1. **SetCustomState** [bUDmX2] alvo El[Página sac] · value=True, custom_state="custom.coluna_respostas_"

#### WF bUDmN2 — Plugin[1680110374647x249108010620944400]/AAJ em El[Switch B]
- condição: This:get_AAI:is_false
1. **SetCustomState** [bUDnf] alvo El[Página sac] · value=False, custom_state="custom.coluna_respostas_"

#### WF bUEER2 — ButtonClicked em El[ico add retira contato]
1. **DeleteThing** [bUEEX2] to_delete=Ancestor[TableCrossAxis]
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUEEZ2] AAF="Removido da lista de respostas com sucesso"

#### WF bUEFh2 — ButtonClicked em El[Icon V]
1. **ChangeThing** [bUEFn2] campos: cpo.Ativo = False · to_change=Ancestor[TableCrossAxis]

#### WF bUEFs2 — ButtonClicked em El[Icon V]
1. **ChangeThing** [bUEFy2] to_change=Ancestor[TableCrossAxis]

#### WF bUEGD2 — ButtonClicked em El[Icon V]
