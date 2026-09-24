# Pagina: `rotinas` (bTeSL)


Resumo: 116 elementos · 39 workflows · 34 ações · 17 condicionais · 1 estados customizados
Elementos por tipo: Button 38, Group 19, Text 19, Input 7, Icon 6, TableCell 6, TableMainAxis 3, CustomElement 2, RepeatingGroup 2, Plugin[1609444246883x924984661248573400]/AAD 2, Dropdown 2, AutocompleteDropdown 2, TableCrossAxis 2, Plugin[1578535742499x577397265006067700]/AAn 1, RadioButtons 1, Table 1, Checkbox 1, Popup 1, Alert 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho` (bTeSS) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `tool.MenuPaginas A` (bToTF) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[tool.Cabecalho]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[tool.Cabecalho]:custom.var_showmenu_:is_false → is_visible=False
- **Group** `gp elmentos aplicativo` (bTeSM) — props: unique_id="documento"
  - ⟂ quando El[tool.Cabecalho]:custom.var_showmenu_:is_true → margin_left=250
  - **Group** `Group J` (bTexP) — props: vertical_centering=True
    - **Plugin[1578535742499x577397265006067700]/AAn** `PDFGenerator A` (bTmZk)
    - **Icon** `anterior` (bTexD) — props: icon="material outlined arrow_back", vertical_centering=True
    - **Icon** `proxima` (bTexJ) — props: icon="material outlined arrow_forward", vertical_centering=True
    - **Button** `Button A` (bTeyD) — text: "nome clifor maiusculo" · props: vertical_centering=True
    - **Button** `Button E` (bThkx) — text: "cliente lucro real" · props: vertical_centering=True
    - **Button** `Button F` (bTiEW0) — text: "copiar boleto unico das entregas para lista de boletos" · props: vertical_centering=True
    - **Button** `Button G` (bTiPn) — text: "gravar fornecedor CONTAS RECEBER" · props: vertical_centering=True
    - **Button** `Button H` (bTiTP) — text: "copia NF venda p/ contas receber" · props: vertical_centering=True
    - **Button** `Button I` (bTjLg) — text: "preenche dt ultimo historico vazio" · props: vertical_centering=True
    - **Button** `Button L` (bTjNF) — text: "atualiza dt ultimo historico" · props: vertical_centering=True
    - **Button** `Button K` (bTjLs) — text: "copia NF venda p/ contas receber" · props: vertical_centering=True
    - **Button** `Button J` (bTjLm) — text: "copia NF venda p/ contas receber" · props: vertical_centering=True
    - **Button** `Button M` (bTjQY) — text: "clientes carteira julio" · props: vertical_centering=True
    - **Button** `Button N` (bTjRf) — text: "atribui clifor aos enderecos" · props: vertical_centering=True
    - **Button** `Button O` (bTkRh) — text: "copiar email login para email contato" · props: vertical_centering=True
    - **Button** `Button P` (bTmGt) — text: "importar contas receber"
    - **Button** `Button Q` (bTmII) — text: "att receber importado"
    - **Button** `Button R` (bTmPn0) — text: "desativar enderecos cujo clifo desativado"
    - **Button** `Button S` (bTmQZ) — text: "copiar info adicionald do clifor para filial"
    - **Button** `Button W` (bTnyt1) — text: "copiar info adicional do clifor para 1A  filial"
    - **Button** `Button T` (bTmUH0) — text: "deletar a receber importados"
    - **Button** `Button U` (bTmZY) — text: "testar pdf" · props: vertical_centering=True
    - **Button** `Button V` (bTnwB0) — text: "copiar configs smtp p/ tds usuarios" · props: vertical_centering=True
    - **Button** `Button X` (bToPB0) — text: "tirar email adm das copias do usuario, colocar somente usuario" · props: vertical_centering=True
    - **Button** `Button Y` (bToTz) — text: "copiar data nfmegabox para data recebimentobanco" · props: vertical_centering=True
    - **Button** `Button Z` (bToWj0) — text: "copiar endereços pedido para contas receber" · props: vertical_centering=True
    - **Button** `Button AZ` (bTpoA) — text: "gerar comissoes passadas" · props: vertical_centering=True
    - **Button** `Button BZ` (bTpoR) — text: "corrigir valor comissao" · props: vertical_centering=True
    - **Button** `Button CZ` (bTprX) — text: "tirar nota 1102 das contas a receber" · props: vertical_centering=True
    - **Button** `Button DZ` (bTtjc) — text: "atribuir CRIADOR ao VENDEDOR" · props: vertical_centering=True
    - **Button** `Button EZ` (bTveL) — text: "atribuir liberado = yes para endereços " · props: icon="material outlined star_border", vertical_centering=True
    - **Button** `Button FZ` (bTvez) — text: "atribuir ativo = yes grupoclifor vazio" · props: icon="material outlined star_border", vertical_centering=True
    - **Button** `Button GZ` (bTvmV) — text: "atribui clientes ativo = yes para ativos=não" · props: icon="material outlined star_border", vertical_centering=True
    - **Button** `Button HZ` (bUAhn) — text: "atribuir modelo produto ao orcamento" · props: icon="material outlined star_border", vertical_centering=True
  - **RepeatingGroup** `rpg contas importadas` (bTmGn) — props: group_type="custom.tbl_contasreceberimportado"
  - **Icon** `Icon E` (bThhx) — props: icon="material outlined mail_outline", vertical_centering=True
  - **RepeatingGroup** `rpg enderecos clifor` (bTeqS) — props: group_type="custom.tbl_enderecosclifor", separator_style="none", fixed_rows=False, cell_min_height_css="85px"
    - **Group** `Group A` (bTetf) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
      - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.1)"
      - **Group** `g Input` (bTetl) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text A` (bTeuB) — text: "Cpf/Cnpj"
        - **Group** `Group B` (bTetq) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Group** `Group B` (bTetr) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
            - **Input** `ipt novo cliente cnpj` (bTetv) — placeholder: "Somente números" · content: "{Parent:cpo.CnpjCpf}" · props: unique_id="cnpj"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cpf) → placeholder="000.000.000-00", unique_id="{∅}cpf"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cnpj) → placeholder="00.000.000-0000/00", unique_id="{∅}cnpj"
            - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput cnpj` (bTetx) — props: AAE="cnpj", AAo=True
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cpf) → AAE="{∅}cpf", AAF="{∅}000.000.000-00"
              - ⟂ quando El[RadioButtons cpfcnpj]:get_data:equals(Opt.TipoPessoa.cnpj) → AAE="{∅}cnpj", AAF="{∅}00.000.000-0000/00"
            - **RadioButtons** `RadioButtons cpfcnpj` (bTetw) — data_source: All(Opt.TipoPessoa) · props: mandatory=True, columns=2, default=Parent:cpo.TipoPessoa, dynamic_type="option.opt_tipopessoa", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
              - ⟂ quando Parent:is_empty → default=Opt.TipoPessoa.cnpj
      - **Group** `g Input` (bTeuV) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text C` (bTeub) — text: "Endereço"
        - **Input** `ipt novocliente endereco` (bTeua) — placeholder: "Logradouro  e número" · content: "{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.logradouro:to_capitalized_words} - {API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.numero:to_capitalized_words} {El[MaskInput cnpj]:get_AAW}"
        - **Text** `Text I` (bTewN) — text: "{Parent:cpo.Endereco}"
      - **Group** `g Input` (bTeug) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text D` (bTeum) — text: "Complemento"
        - **Input** `ipt novocliente complemento` (bTeul) — placeholder: "Quadra, lote, casa, referência" · content: "{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.complemento:to_capitalized_words}"
        - **Text** `Text J` (bTewT) — text: "{Parent:cpo.Complemento}"
      - **Group** `g Input` (bTeur) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text E` (bTeux) — text: "Bairro"
        - **Input** `ipt novocliente bairro` (bTeut) — placeholder: "Nome do bairro" · content: "{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.bairro:to_capitalized_words}"
        - **Text** `Text K` (bTewZ) — text: "{Parent:cpo.Bairro}"
      - **Group** `g Input` (bTeuz) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text F` (bTevF) — text: "Município"
        - **Input** `ipt novocliente municipio` (bTevE) — placeholder: "Município ou Cidade" · content: "{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.municipio:to_capitalized_words}"
        - **Text** `Text L` (bTewf) — text: "{Parent:cpo.Municipio}"
      - **Group** `g Input` (bTevK) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text G` (bTevQ) — text: "UF"
        - **Dropdown** `ipt novocliente uf` (bTevP) — data_source: All(Opt.UFs) · placeholder: "Sigla do estado" · props: default=Opt.UFs.all values:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:uf_texto:equals(API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cep": {"entries": {"0": {"next": {"type": "Message", "name": "get_data", "is_slidable": false}, "properties": {"element_id": "bTPLE"}, "type": "GetElement", "is_slidable": false}}, "type": "TextExpression"}, "url_params_cnpj": {"entrie):_p_body.uf), constraint_type=∅}}):first_element, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
        - **Text** `Text M` (bTewl) — text: "{Parent:cpo.QualUfOpt:display}"
      - **Group** `g Input copy 2` (bTeuD) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Group** `Group C` (bTeuJ) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **Text** `Text B` (bTeuO) — text: "CEP"
          - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput cep` (bTeuN) — props: AAE="cep", AAF="00000-000", AAo=True
        - **Input** `ipt novocliente cep` (bTeuI) — placeholder: "00000-000" · content: "{API({"provider": "1602683113110x702948442872479700.AAF", "url_params_cnpj": {"entries": {"0": {"next": {"next": {"next": {"next": {"properties": {"find": {"entries": {"0": "/"}, "type": "TextExpression"}}, "type": "Message", "name": "find_replace", "is_slidable": true}, "properties": {"find": {"entries"):_p_body.cep:find_replace(find=".")}" · props: unique_id="cep"
        - **Text** `Text N` (bTewr) — text: "{Parent:cpo.Cep}"
      - **Group** `g Input` (bTevV) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor"
        - **Text** `Text H` (bTevX) — text: "Localização"
        - **Group** `Group I` (bTevb) — data_source: Parent · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True
          - **AutocompleteDropdown** `ipt novocliente localizacao` (bTevc) — placeholder: "Busque pela localização do Google" · props: default=El[ipt novocliente cep]:get_data:find_replace(find="."), choices_style="geographic_places"
        - **Text** `Text O` (bTewx) — text: "{Parent:cpo.Localizacaoo}"
    - **Icon** `Icon B` (bTevh) — props: icon="material outlined save", vertical_centering=True
  - **Table** `Table A` (bThfN) — props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **TableMainAxis** `TableMainAxis A` (bThgJ) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis A` (bThgK) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis A` (bThgL) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis A` (bThgP) — props: axis_index=0
      - **TableCell** `Cell A` (bThgQ) — props: cell_main_axis_id="bThgJ"
        - **Dropdown** `Dropdown B` (bThgh) — data_source: Search(User) · props: vertical_centering=True, dynamic_type="user", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeModelo}"
        - **Button** `Button B` (bThgn) — props: vertical_centering=True
      - **TableCell** `Cell A` (bThgR) — props: cell_main_axis_id="bThgK"
      - **TableCell** `Cell A` (bThgV) — props: cell_main_axis_id="bThgL"
    - **TableCrossAxis** `TableCrossAxis A` (bThgW) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=True, fixed_number_repeating_axis_count=3
      - **TableCell** `Cell A` (bThgX) — props: cell_main_axis_id="bThgJ"
      - **TableCell** `Cell A` (bThgb) — props: cell_main_axis_id="bThgK"
      - **TableCell** `Cell A` (bThgc) — props: cell_main_axis_id="bThgL"
  - **Group** `Group K` (bTkDF) — props: vertical_centering=True
    - **Group** `gp busca cliente` (bTkDL) — props: vertical_centering=True
      - **Input** `src busca chave` (bTkDM) — placeholder: "Input" · props: unique_id="fuzzy"
        - ⟂ quando El[chk buscaexata]:get_data → is_visible=False
        - ⟂ quando El[chk buscaexata]:get_not_data → is_visible=True
      - **AutocompleteDropdown** `src busca exata` (bTkDR) — data_source: Search(Tbl.GrupoCliFor: cpo.Ativo equals El[dd ativos]:get_data:boolean AND cpo.QualTipoCliFor equals El[dd tipo clifor]:get_data; sort _dynamic_sort_field desc, sort dinâmico "{El[dd ordem]:get_data:nomecampo}", ignore empty) · placeholder: "Searchbox" · props: unique_id="fuzzy", field_to_search="cpo_nomecliente_text"
        - ⟂ quando El[chk buscaexata]:get_data → is_visible=True
        - ⟂ quando El[chk buscaexata]:get_not_data → is_visible=False
      - **Icon** `Icon F` (bTkDN) — props: icon="material outlined close", vertical_centering=True
    - **Checkbox** `chk buscaexata` (bTkDH) — label: "Busca exata" · props: vertical_centering=True
  - **Group** `Mo/yr selector dash` (bUCUt) — props: border_color_top="rgba(255, 255, 255, 1)", border_style_top="none", nonant_alignment="bb", border_color_left="rgba(255, 255, 255, 1)", border_style_left="none", four_border_style=False, border_color_right="rgba(255, 255, 255, 1)", border_style_right="none", border_color_bottom="rgba(255, 255, 255, 1)", border_style_bottom="none"
    - estado customizado `window_` : number
    - **Button** `Button IZ` (bUCUu) — text: "Monthly" · props: font_family="var(--font_default)", border_color_top="rgba(255, 255, 255, 1)", border_style_top="none", border_color_left="rgba(255, 255, 255, 1)", border_style_left="none", four_border_style=False, border_color_right="rgba(255, 255, 255, 1)", border_style_right="none", border_color_bottom="rgba(255, 255, 255, 1)", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando El[Mo/yr selector dash]:custom.window_:equals(1) → font_color="rgba(255,255,255,1)", bgcolor="var(--color_primary_default)"
      - ⟂ quando This:is_hovered → font_color="rgba(0, 102, 255, 1)", bgcolor="rgba(255,255,255,0.5)"
    - **Button** `Button IZ` (bUCUv) — text: "Yearly" · props: font_family="var(--font_default)", border_color_top="rgba(255, 255, 255, 1)", border_style_top="none", border_color_left="rgba(255, 255, 255, 1)", border_style_left="none", four_border_style=False, border_color_right="rgba(255, 255, 255, 1)", border_style_right="none", border_color_bottom="rgba(255, 255, 255, 1)", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando El[Mo/yr selector dash]:custom.window_:equals(2) → font_color="rgba(255,255,255,1)", background_style="bgcolor", bgcolor="var(--color_primary_default)"
      - ⟂ quando This:is_hovered → font_color="rgba(0, 102, 255, 1)", background_style="bgcolor", bgcolor="rgba(255,255,255,0.5)"
  - **Group** `Group N` (bUCVS) — props: group_type="text", border_color_top="rgba(255, 255, 255, 1)", border_style_top="none", border_color_left="rgba(255, 255, 255, 1)", border_style_left="none", four_border_style=False, border_color_right="rgba(255, 255, 255, 1)", border_style_right="none", border_color_bottom="rgba(255, 255, 255, 1)", border_style_bottom="none"
    - **Button** `Button JZ` (bUCVT) — text: "Create" · props: font_family="var(--font_default)", border_color_top="rgba(255, 255, 255, 1)", border_style_top="none", border_color_left="rgba(255, 255, 255, 1)", border_style_left="none", four_border_style=True, border_color_right="rgba(255, 255, 255, 1)", border_style_right="none", border_color_bottom="rgba(255, 255, 255, 1)", border_style_bottom="none", border_roundness_left=8, border_roundness_right=0
    - **Button** `Button JZ` (bUCVX) — text: "Cancel" · props: font_family="var(--font_default)", border_color_top="rgba(255, 255, 255, 1)", border_style_top="none", border_color_left="rgba(255, 255, 255, 1)", border_style_left="none", four_border_style=True, border_color_right="rgba(255, 255, 255, 1)", border_style_right="none", border_color_bottom="rgba(255, 255, 255, 1)", border_style_bottom="none", border_roundness_left=0, border_roundness_right=8
- **Popup** `pop apagar registro` (bTeTa) — props: border_color_top="var(--color_bTHHQ_default)", border_style_top="solid", border_width_top=5, four_border_style=True, border_roundness_left=10, border_roundness_right=10
  - **Icon** `Icon A` (bTeTb) — props: icon="fa fa-exclamation-triangle"
  - **Text** `Text EZ` (bTeTf) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text FZ` (bTeTg) — text: "Você está tentando apagar um registro de seu banco e dados." · props: font_alignment="center"
  - **Text** `Text GZ` (bTeTh) — text: "Esta ação não pode ser revertida!" · props: font_alignment="center"
  - **Text** `Text HZ` (bTeTl) — text: "Deseja continuar?" · props: font_alignment="center"
  - **Button** `Button C` (bTeTm) — text: "SIM"
  - **Button** `Button D` (bTeTn) — text: "NÃO"
- **Alert** `alt processando` (bTeTZ) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! " · props: at_to_top=True

## Workflows

#### WF bTeTs — PageLoaded
1. **SetCustomState** [bTeTt] alvo El[tool.Cabecalho] · value=Opt.MenuConfig.submenu1, custom_state="custom.var_qualsubmenu_"

#### WF bTevn — ButtonClicked em El[Icon B]
1. **ChangeThing** [bTevt] campos: cpo.Bairro = "{El[ipt novocliente bairro]:get_data}"; cpo.Cep = "{El[ipt novocliente cep]:get_data}"; cpo.Complemento = "{El[ipt novocliente complemento]:get_data}"; cpo.Endereco = "{El[ipt novocliente endereco]:get_data}"; cpo.Localizacaoo = El[ipt novocliente localizacao]:get_data; cpo.Municipio = "{El[ipt novocliente municipio]:get_data}"; cpo.QualUfOpt = El[ipt novocliente uf]:get_data; cpo.UF = "{El[ipt novocliente uf]:get_data:uf_texto}" · to_change=Parent

#### WF bTexg — ButtonClicked em El[proxima]

#### WF bTexr — ButtonClicked em El[anterior]

#### WF bTeyJ — ButtonClicked em El[Button A]
1. **ChangeListOfThings** [bTeyP] campos: cpo.NomeCliFor = "{InjectedValue:cpo.NomeCliFor:to_uppercase}" · to_change=Search(Tbl.GrupoCliFor), type_to_change="custom.tbl_clientes"

#### WF bThhp — ButtonClicked em El[Icon E]
1. **Plugin[1729605241035x687450859189043200]/AAt** [bThhv] 

#### WF bThiD — ButtonClicked em El[Icon E]

#### WF bThlD — ButtonClicked em El[Button E]
1. **ChangeListOfThings** [bThlI] campos: cpo.QualRegimeTributario = opt.RegimeTributario.Lucro Real/Presumido · to_change=Search(Tbl.EnderecosCliFor: cpo.TipoClifor equals opt.TipoCliFor.Cliente), type_to_change="custom.tbl_enderecosclifor"

#### WF bTiPt — ButtonClicked em El[Button G]
1. **ChangeListOfThings** [bTiPz] campos: cpo.QualFornecedor = InjectedValue:cpo.QualEntrega:cpo.QualFornecedor · to_change=Search(Tbl.ContasReceber), type_to_change="custom.tbl_contasreceber"

#### WF bTiTV — ButtonClicked em El[Button H]
1. **ChangeListOfThings** [bTiTb] campos: cpo.NumNfFornecedor = "{InjectedValue:cpo.QualEntrega:cpo.NumNfFornecedor}" · to_change=Search(Tbl.ContasReceber), type_to_change="custom.tbl_contasreceber"

#### WF bTjLy — ButtonClicked em El[Button L]
1. **ChangeListOfThings** [bTjME] campos: cpo.UltimoHistoricoData = Search(Tbl.Historico: cpo.QualCliente equals InjectedValue):last_element:Created Date · to_change=Search(Tbl.GrupoCliFor), type_to_change="custom.tbl_clientes"

#### WF bTjMt — ButtonClicked em El[Button I]
1. **ChangeListOfThings** [bTjMv] campos: cpo.UltimoHistoricoData = InjectedValue:Created Date · to_change=Search(Tbl.GrupoCliFor: cpo.UltimoHistoricoData is_empty ∅), type_to_change="custom.tbl_clientes"

#### WF bTjQe — ButtonClicked em El[Button M]
1. **ChangeListOfThings** [bTjQk] campos: cpo.QualCarteira = CurrentUser · to_change=Search(Tbl.GrupoCliFor), type_to_change="custom.tbl_clientes"

#### WF bTjRl — ButtonClicked em El[Button N]
1. **ChangeListOfThings** [bTjRs] campos: cpo.QualGrupoCliFor = Search(Tbl.GrupoCliFor: cpo.QuaisEnderecos contains InjectedValue):first_element · to_change=Search(Tbl.EnderecosCliFor), type_to_change="custom.tbl_enderecosclifor"

#### WF bTkDT — ButtonClicked em El[Icon F]
1. **ResetGroup** [bTkDY] alvo El[gp busca cliente]

#### WF bTkRn — ButtonClicked em El[Button O]
1. **ChangeListOfThings** [bTkRt] campos: cpo.EmailContato = "{InjectedValue:email}" · to_change=Search(User), type_to_change="user"

#### WF bTmGz — ButtonClicked em El[Button P]
1. **ScheduleAPIEvent** [bTmHe] date=Page.Current Date/Time, api_event="bTmHF", _wf_param_qtd=El[rpg contas importadas]:get_list_data:count, _wf_param_fila=1, _wf_param_contasreceber=El[rpg contas importadas]:get_list_data

#### WF bTmIO — ButtonClicked em El[Button Q]
1. **ScheduleAPIEvent** [bTmIU] date=Page.Current Date/Time, api_event="bTmHw"

#### WF bTmQf — ButtonClicked em El[Button S]
1. **ScheduleAPIEvent** [bTmQx] date=Page.Current Date/Time, api_event="bTmQp"

#### WF bTmZe — ButtonClicked em El[Button U]
1. **Plugin[1578535742499x577397265006067700]/AAt** [bTmZq] 

#### WF bToUF — ButtonClicked em El[Button Y]
1. **ScheduleAPIEvent** [bToUL] date=Page.Current Date/Time, api_event="bToTt"

#### WF bTpoG — ButtonClicked em El[Button AZ]
1. **ScheduleAPIEvent** [bTpoM] date=Page.Current Date/Time, api_event="bTpni", _wf_param_qtd=Search(Tbl.ContasReceber):count, _wf_param_fila=1, _wf_param_quaisentregas=Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Financeiro)

#### WF bTpoX — ButtonClicked em El[Button BZ]
1. **ScheduleAPIEvent** [bTprr] date=Page.Current Date/Time, api_event="bTpop", _wf_param_quaiscomissoes=Search(Tbl.ContasPagar)

#### WF bTprd — ButtonClicked em El[Button CZ]
1. **ScheduleAPIEvent** [bTprp] date=Page.Current Date/Time, api_event="bTprj"

#### WF bTtkx — ButtonClicked em El[Button DZ]
1. **ScheduleAPIEvent** [bTtlD] date=Page.Current Date/Time, api_event="bTtji"

#### WF bTveR — ButtonClicked em El[Button EZ]
1. **ChangeListOfThings** [bTveX] campos: cpo.Liberado = True · to_change=Search(Tbl.EnderecosCliFor), type_to_change="custom.tbl_enderecosclifor"

#### WF bTvfF — ButtonClicked em El[Button FZ]
1. **ChangeListOfThings** [bTvfL] campos: cpo.Ativo = True · to_change=Search(Tbl.GrupoCliFor: cpo.Ativo is_empty ∅), type_to_change="custom.tbl_clientes"

#### WF bTvmb — ButtonClicked em El[Button GZ]

#### WF bTvmh — ButtonClicked em El[Button GZ]

#### WF bUAht — ButtonClicked em El[Button HZ]
1. **ScheduleAPIEvent** [bUAhz] date=Page.Current Date/Time, api_event="bUAhf"

#### WF bUCVB — ButtonClicked em El[Button IZ]
1. **SetCustomState** [bUCVF] alvo El[Mo/yr selector dash] · value=1, custom_state="custom.window_"

#### WF bUCVL — ButtonClicked em El[Button IZ]
1. **SetCustomState** [bUCVM] alvo El[Mo/yr selector dash] · value=2, custom_state="custom.window_"

#### WF bTiEc0 — ButtonClicked em El[Button F]
1. **ChangeListOfThings** [bTiEi0] campos: cpo.BoletoArquivos = "{InjectedValue:cpo.BoletoFile}" · to_change=Search(Tbl.Entregas), type_to_change="custom.tbl_entregas"

#### WF bTmPt0 — ButtonClicked em El[Button R]
1. **ChangeListOfThings** [bTmPz0] campos: cpo.Ativo = InjectedValue:cpo.QualGrupoCliFor:cpo.Ativo · to_change=Search(Tbl.EnderecosCliFor), type_to_change="custom.tbl_enderecosclifor"

#### WF bTmUn0 — ButtonClicked em El[Button T]
1. **ScheduleAPIEvent** [bTmUt0] date=Page.Current Date/Time, api_event="bTmUN0"

#### WF bTnwH0 — ButtonClicked em El[Button V]
1. **ChangeListOfThings** [bTnwN0] campos: cpo.CopiaPedido = "contato@grupomegabox.com.br; financeiro@grupomegabox.com.br;{InjectedValue:cpo.EmailContato}{∅}" · to_change=Search(User), type_to_change="user"

#### WF bTnyz1 — ButtonClicked em El[Button W] «1a filial Button copiar info adicional»
1. **ScheduleAPIEvent** [bTnzF1] date=Page.Current Date/Time, api_event="bTnzH1"

#### WF bToPH0 — ButtonClicked em El[Button X]
1. **ChangeListOfThings** [bToPN0] campos: cpo.CopiaCancelamentos = "{InjectedValue:cpo.EmailContato}"; cpo.CopiaPedido = "{InjectedValue:cpo.EmailContato}"; cpo.CopiaProposta = "{InjectedValue:cpo.EmailContato}" · to_change=Search(User), type_to_change="user"

#### WF bToWp0 — ButtonClicked em El[Button Z]
1. **ScheduleAPIEvent** [bToXB0] date=Page.Current Date/Time, api_event="bToWv0"
