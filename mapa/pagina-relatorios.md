# Pagina: `relatorios` (bUBLO)

Estados customizados: `var_pesquisando_` : boolean

Resumo: 32 elementos · 10 workflows · 26 ações · 13 condicionais · 1 estados customizados
Elementos por tipo: Group 11, Text 7, CustomElement 4, Button 4, HTML 4, RadioButtons 1, Plugin[1648823245313x509054419018711040]/AAC 1

## Árvore de elementos

- **CustomElement** `tool.Cabecalho A` (bUBQR) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `pop.ConfigSistema A` (bUBWM) — USA Reusable pop.ConfigSistema · props: floating_reference="top", custom_id="bToDT0", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **CustomElement** `tool.MenuPaginas A` (bUBQS) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[tool.Cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
- **CustomElement** `pop.CadastroUsuarios A` (bUBWL) — USA Reusable pop.CadastroUsuarios · props: floating_reference="top", custom_id="bTgiN", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Group** `Group G` (bUEsN)
  - **Button** `Button A` (bUEsB) — text: "Relatório de Cotação" · props: icon="material outlined star_border", font_alignment="center", font_family="var(--font_default)", four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=0
    - ⟂ quando This:is_hovered → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
    - ⟂ quando El[Gp Cotação]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
  - **Button** `Button C` (bUEya) — text: "Relatório de Prospecção" · props: icon="material outlined star_border", border_color_bottom="var(--color_bTHGl_default)"
    - ⟂ quando El[Gp Prospecção]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
  - **Button** `Button B` (bUEsH) — text: "Outros Relatórios" · props: icon="material outlined star_border", border_color_bottom="var(--color_bTHGl_default)"
    - ⟂ quando El[Gp Relatatórios]:is_visible → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
- **Group** `Gp Cotação` (bUEsV)
  - **HTML** `HTML C` (bUErv) — html(54434 chars)
- **Group** `Gp Relatatórios` (bUEsf) — oculto ao carregar
  - **Group** `Group C` (bUBQT)
    - **Group** `Group E` (bUBgI) — props: vertical_centering=True
      - **Text** `Text B` (bUBgC) — text: "Modelo de relatório"
      - **Group** `Group D` (bUBfv) — props: vertical_centering=True
        - **RadioButtons** `rad relatorios` (bUBcj) — props: columns=3, choices="Produtos\nClientes\nFornecedores", default="Clientes", computed_value="text", use_dynamic_columns=False
    - **Group** `Group F` (bUBga) — props: vertical_centering=True
      - **Text** `Text E` (bUBgT) — text: "Intervalo de entrega"
      - **Plugin[1648823245313x509054419018711040]/AAC** `RangePicker A` (bUBQX) — props: padding_vertical=12, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAK=True, AAM=2, AAN=2, AAS=False, AAf="{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {UrlParam("datafim" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
    - **Group** `gp pesquisar` (bUBgn) — oculto ao carregar · props: vertical_centering=True
      - ⟂ quando El[Página relatorios]:custom.var_pesquisando_:is_true → bgcolor="var(--color_bTHGl_default)"
      - **Text** `Text F` (bUBgt) — text: "[fa]search[/fa]  Pesquisar"
        - ⟂ quando El[Página relatorios]:custom.var_pesquisando_:is_true → text="[fa]spinner fa-pulse[/fa]  Aguarde"
    - **Button** `Button D` (bUFBl) — text: "Pesquisar" · props: icon="material outlined search", button_type="label_icon"
  - **Group** `gp relat produto` (bUBQM) — props: group_type="text", name="Group Dashboard"
    - ⟂ quando El[rad relatorios]:get_data:equals("Produtos") → is_visible=True
    - ⟂ quando El[rad relatorios]:get_data:not_equals("Produtos") → is_visible=False
    - **Text** `Text C` (bUBfZ) — text: "Relatório de Entregas (Produto X Cliente X Fornecedor)"
    - **HTML** `relat por produto` (bUBNe) — html(35456 chars) · props: vertical_centering=True
    - **Text** `txt relat produtos` (bUBQL) — text: "{Parent}" · props: unique_id="matrix-data"
  - **Group** `gp relat clientes` (bUBen) — props: group_type="text", vertical_centering=True
    - ⟂ quando El[rad relatorios]:get_data:equals("Produtos") → is_visible=False
    - ⟂ quando El[rad relatorios]:get_data:not_equals("Produtos") → is_visible=True
    - **Text** `Text D` (bUBfl) — text: "Relatorio"
      - ⟂ quando El[rad relatorios]:get_data:equals("Clientes") → text="Relatório de Entregas (Clientes X Mês)"
      - ⟂ quando El[rad relatorios]:get_data:equals("Fornecedores") → text="Relatório de Entregas (Fornecedores X Mês)"
    - **HTML** `relat por cliente` (bUBdO) — html(35650 chars) · props: vertical_centering=True
    - **Text** `txt relat clientes` (bUBdZ) — text: "{Parent}" · props: unique_id="clientes-matrix-data"
- **Group** `Gp Prospecção` (bUEuT) — oculto ao carregar
  - **HTML** `HTML D` (bUEyT) — html(35680 chars)

## Workflows

#### WF bUBWj — PageLoaded
1. **Plugin[1558770956236x539499438875082750]/AAC** [bUBWk] 
2. **ChangePage** [bUBWp] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min:change_hours(0):change_minutes(0):change_seconds(0)}"}}, keep_current_page_params=True
3. **ChangePage** [bUBWq] alvo El[Current page] · SÓ SE UrlParam("datafim" as date):is_empty · add_parameters=True, url_parameters={0={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
4. **TriggerCustomEvent** [bUBWr] custom_event="bUBYW"

#### WF bUBWv — Plugin[1648823245313x509054419018711040]/AAd em El[RangePicker A]
1. **MakeChangeCurrentUser** [bUBWw] campos: cpo.UltimoDateRange = This:get_AAF:min:to_range(This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59))
2. **ChangePage** [bUBWx] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min:change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bUBYW — CustomEvent «CalculaRanking»
- props: event_name="SortByNumber"
1. **ChangeListOfThings** [bUBYX] campos: cpo.RankingVendas = Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Financeiro AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.QualVendedor equals InjectedValue:cpo.QualVendedor):cpo.valorcomissao:sum:divide(InjectedValue:cpo.ValorMeta) · to_change=Search(Tbl.MetasMensais: cpo.DataFim gte UrlParam("datafim" as date) AND cpo.DataInicio lte UrlParam("datainicio" as date) AND cpo.TipoMeta equals Opt.TipoMeta.Regular; sort cpo.DataInicio), type_to_change="custom.tbl_metasmensais"
2. **ChangeListOfThings** [bUBYb] campos: cpo.RankingVendas = Search(Tbl.Entregas: cpo.StatusEntrega equals Opt.Etapas.Financeiro AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.QualVendedorSubstituto equals InjectedValue:cpo.QualVendedor):cpo.valorcomissao:sum:divide(InjectedValue:cpo.ValorMeta) · to_change=Search(Tbl.MetasMensais: cpo.DataFim gte UrlParam("datafim" as date) AND cpo.DataInicio lte UrlParam("datainicio" as date) AND cpo.TipoMeta equals Opt.TipoMeta.Substituição; sort cpo.DataInicio), type_to_change="custom.tbl_metasmensais"

#### WF bUBaV — ButtonClicked em El[Button D]
- condição: El[rad relatorios]:get_data:equals("Produtos")
1. **SetCustomState** [bUBaz] alvo El[Página relatorios] · value=True, custom_state="custom.var_pesquisando_"
2. **DisplayGroupData** [bUBab] alvo El[gp relat produto] · data_source=Search(Tbl.Entregas: cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.StatusEntrega equals Opt.Etapas.Financeiro):format_as_text(content="[{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualProdutoModelo:cpo.NomeModelo:to_uppercase}] | [{InjectedValue:cpo.QtdEntrega:format_number(decimal_place=2)}] | [{InjectedValue:cpo.ValorVendaBrutoUnitario:format_number(decimal_place=2)}] | [{InjectedValue:cpo.ValorComissaoUnitario:format_number(decimal_place=2)}] | [{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_uppercase}] | [{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.QualUfOpt:display:to_uppercase}] | [{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_uppercase}] | [{InjectedValue:cpo.ValorVendaBruto:format_number(decimal_place=2)}] | [{InjectedValue:cpo.valorcomissao:format_number(decimal_place=2)}]|[{Text("{Page.Website Home}historico?numpedido={InjectedValue:cpo.NumeroPedido}")}]", delimiter="⏎")
3. **SetCustomState** [bUBbE] alvo El[Página relatorios] · value=False, custom_state="custom.var_pesquisando_"

#### WF bUBcv — ButtonClicked em El[Button D]
- condição: El[rad relatorios]:get_data:equals("Clientes")
1. **SetCustomState** [bUBcx] alvo El[Página relatorios] · value=True, custom_state="custom.var_pesquisando_"
2. **DisplayGroupData** [bUBdB] alvo El[gp relat clientes] · data_source=Search(Tbl.Entregas: cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.StatusEntrega equals Opt.Etapas.Financeiro):format_as_text(content="[{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_uppercase}] | [{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.UF:to_uppercase}] | [{InjectedValue:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yyyy")}] | [{InjectedValue:cpo.valorcomissao:format_number(decimal_place=2)}] | [{Text("{Page.Website Home}historico?numpedido={InjectedValue:cpo.NumeroPedido}")}]", delimiter="⏎")
3. **SetCustomState** [bUBdC] alvo El[Página relatorios] · value=False, custom_state="custom.var_pesquisando_"

#### WF bUBfH — ButtonClicked em El[Button D]
- condição: El[rad relatorios]:get_data:equals("Fornecedores")
1. **SetCustomState** [bUBfM] alvo El[Página relatorios] · value=True, custom_state="custom.var_pesquisando_"
2. **DisplayGroupData** [bUBfN] alvo El[gp relat clientes] · data_source=Search(Tbl.Entregas: cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.StatusEntrega equals Opt.Etapas.Financeiro):format_as_text(content="[{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_uppercase}] | [{InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.UF:to_uppercase}] | [{InjectedValue:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yyyy")}] | [{InjectedValue:cpo.valorcomissao:format_number(decimal_place=2)}] | [{Text("{Page.Website Home}historico?numpedido={InjectedValue:cpo.NumeroPedido}")}]", delimiter="⏎")
3. **SetCustomState** [bUBfR] alvo El[Página relatorios] · value=False, custom_state="custom.var_pesquisando_"

#### WF bUEsr — ButtonClicked em El[Button A]
1. **HideElement** [bUEsx] alvo El[Gp Relatatórios]
2. **ShowElement** [bUEsz] alvo El[Gp Cotação]
3. **HideElement** [bUEzD] alvo El[Gp Prospecção]

#### WF bUEtE — ButtonClicked em El[Button B]
1. **ShowElement** [bUEtJ] alvo El[Gp Relatatórios]
2. **HideElement** [bUEtK] alvo El[Gp Cotação]
3. **HideElement** [bUEzF] alvo El[Gp Prospecção]

#### WF bUEyh — ButtonClicked em El[Button C]
1. **ShowElement** [bUEyr] alvo El[Gp Prospecção]
2. **HideElement** [bUEyt] alvo El[Gp Relatatórios]
3. **HideElement** [bUEyy] alvo El[Gp Cotação]

#### WF bUFBb — ButtonClicked em El[Text F]
