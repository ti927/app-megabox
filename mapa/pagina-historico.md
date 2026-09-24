# Pagina: `historico` (bTsPV)

Estados customizados: `var_editaapagar_` : Tbl.ContasPagar; `var_editapedido_` : Tbl.Pedido; `var_editacotacao_` : Tbl.Cotacao; `var_editaentrega_` : Tbl.Entregas; `var_editareceber_` : Tbl.ContasReceber; `var_editaorcamento_` : Tbl.OrcFornecedoresCotacao

Resumo: 281 elementos · 58 workflows · 98 ações · 94 condicionais · 6 estados customizados
Elementos por tipo: Group 99, Text 65, Input 28, Icon 22, Button 18, Dropdown 12, DateInput 9, RepeatingGroup 7, AutocompleteDropdown 5, SEM_TIPO 4, FileInput 3, Image 2, CustomElement 2, Popup 1, select2-MultiDropdown 1, Alert 1, FloatingGroup 1, Plugin[1648823245313x509054419018711040]/AAC 1

## Árvore de elementos

- **Popup** `pop add areceber na entrega` (bUBjf) — props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Text** `Text O` (bUBjx) — text: "Indique o Codigo ID da conta a receber que deseja adicionar à entrega"
  - **Input** `ipt id a receber` (bUBjl) — props: vertical_centering=True
  - **Button** `Button C` (bUBjr) — text: "Gravar" · props: icon="fa fa-star-o", vertical_centering=True
- **Group** `gp elmentos aplicativo` (bTscq)
  - **RepeatingGroup** `rpg cotacao` (bTsvH0) — data_source: Search(Tbl.Cotacao: cpo.Arquivado equals False AND cpo.CotacaoNum equals UrlParam("numpedido" as number)) · props: group_type="custom.tbl_orcamento", separator_color="var(--color_primary_contrast_default)", separator_style="none", separator_width=4, opacity=100, fixed_rows=False, auto_fit_row=False, border_color_left="var(--color_text_default)", border_style_left="solid", border_width_left=5, four_border_style=True, cell_min_height_css="87px", border_roundness_left=5
    - **Group** `gp card cotacao` (bTsvg0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Button** `btn edita cotacao` (bTswE0) — text: "Edita cotação" · props: icon="feather unlock", icon_size=19, button_type="icon", title_attribute="Editar cotação"
        - ⟂ quando El[Página historico]:custom.var_editacotacao_:equals(Parent) → font_color="var(--color_primary_default)", icon_color="var(--color_primary_contrast_default)", background_style="bgcolor", bgcolor="var(--color_primary_default)"
      - **Group** `Group E` (bTswF0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
        - **Image** `Image C` (bTswJ0) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
          - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `Group E` (bTsvl0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
        - **Group** `Group F` (bTswt0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **SEM_TIPO** `` (None) — props: group_type="custom.tbl_orcamento"
            - **SEM_TIPO** `` (None) — data_source: All(Opt.CotacaoStatus) · props: default=Parent:cpo.CotacaoStatus, dynamic_type="option.opt_orcamentostatus"
          - **Group** `Group L` (bTvHw0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Group** `Group UZ` (bUCfb0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
              - **Text** `Text A` (bTsvr0) — text: "[b]Dt Cotação[/b]: {Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
              - **Icon** `Icon O` (bUCfV0) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Parent:_id}"
            - **Text** `Text A` (bTsvm0) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}- Nº {Parent:cpo.CotacaoNum}" · props: vertical_centering=True
          - **Group** `Group K` (bTvHY0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Text** `Text B` (bTswn0) — text: "Vendedor"
            - **Dropdown** `dd vendedor cotacao` (bTswh0) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "" · props: mandatory=True, default=Parent:cpo.QualVendedor, disabled=True, dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
              - ⟂ quando El[Página historico]:custom.var_editacotacao_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", bgcolor="var(--color_primary_contrast_default)", disabled=False
          - **SEM_TIPO** `` (None)
      - **RepeatingGroup** `RepeatingGroup A` (bUCed0) — data_source: Parent:cpo.QuaisPropostas · props: group_type="custom.tbl_propostas", fixed_rows=False, cell_min_height_css="15px"
        - **Text** `Text AZ` (bUCej0) — text: "Proposta {Parent:cpo.PropostaNum}"
      - **Group** `Group O` (bTsxf0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
        - **Button** `btn grava cotacao` (bTsxT0) — text: "Grava cotação" · props: icon="material outlined check_box", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
          - ⟂ quando El[Página historico]:custom.var_editacotacao_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
        - **Button** `btn grava cotacao historico` (bTsxZ0) — text: "Grava histórico" · props: icon="material outlined library_add_check", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
          - ⟂ quando El[Página historico]:custom.var_editacotacao_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
    - **Group** `gp arvore pedido` (bTtOp0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Icon** `Icon bootstrap cart-fill` (bTtUt0) — props: icon="bootstrap cart-fill", vertical_centering=True
        - ⟂ quando El[rpg pedidos]:is_visible → is_visible=True
        - ⟂ quando El[rpg pedidos]:isnt_visible → is_visible=False
      - **RepeatingGroup** `rpg pedidos` (bTsvZ0) — data_source: Parent:cpo.QualPedido:convert_to_list · props: group_type="custom.tbl_pedidos", separator_color="var(--color_primary_contrast_default)", separator_style="none", separator_width=4, fixed_rows=False, border_color_left="var(--color_primary_default)", border_style_left="solid", border_width_left=5, four_border_style=True, cell_min_height_css="86px", border_roundness_left=5
        - ⟂ quando This:get_list_data:count:less_than(1) → is_visible=False
        - **Group** `gp card pedido` (bTsxv0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Button** `btn edita pedido` (bTsys0) — text: "Edita cotação" · props: icon="feather unlock", icon_size=19, button_type="icon", title_attribute="Editar cotação"
            - ⟂ quando El[Página historico]:custom.var_editapedido_:equals(Parent) → font_color="var(--color_primary_default)", icon_color="var(--color_primary_contrast_default)", background_style="bgcolor", bgcolor="var(--color_primary_default)"
          - **Group** `Group P` (bTsya0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Image** `Image D` (bTsyb0) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
              - ⟂ quando Parent:cpo.QuaisOrcamentosFonecedores:first_element:cpo.QualFornecedor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - **Group** `Group P` (bTsxx0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Text** `Text C` (bTsyP0) — oculto ao carregar · text: "[b]Cancelado[/b]: {Parent:cpo.MotivoCancelamento}" · props: vertical_centering=True
              - ⟂ quando Parent:cpo.QualEtapa:equals(Opt.Etapas.Cancelado) → is_visible=True
            - **Group** `Group J` (bTvFy0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Group** `Group VZ` (bUCgD0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text C` (bTsyC0) — text: "Pedido núm: {Parent:cpo.NumeroPedido}" · props: vertical_centering=True
                - **Icon** `Icon R` (bUCfx0) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Parent:_id}"
              - **Text** `Text C` (bTsyD0) — text: "[b]Dt Pedido[/b]: {Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
            - **SEM_TIPO** `` (None)
            - **Group** `g FileUploader copy` (bTvFa0) — data_source: Parent · props: group_type="custom.tbl_pedidos"
              - **Text** `Text F` (bTvFl0) — text: "Condições de pagamento:"
              - **Group** `Group B` (bTvFf0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **select2-MultiDropdown** `dd parcelas pedido` (bTvFh0) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · props: default=Parent:cpo.PrazoRecebComissoes, disabled=True, dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", placeholder_color="var(--color_bTHGh_default)", option_display_expression="{InjectedValue:display}"
                  - ⟂ quando El[Página historico]:custom.var_editapedido_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", bgcolor="var(--color_primary_contrast_default)", disabled=False
                - **Dropdown** `dd formapagto pedido` (bTvFg0) — data_source: All(Opt.FormaPgto) · placeholder: "Pix, boleto, transferência" · props: default=Parent:cpo.FormaPagto, vertical_centering=True, disabled=True, dynamic_type="option.opt_formapgto", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
                  - ⟂ quando El[Página historico]:custom.var_editapedido_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", bgcolor="var(--color_primary_contrast_default)", disabled=False
          - **Group** `Group R` (bTsyz0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Button** `btn grava pedido` (bTszE0) — text: "Grava pedido" · props: icon="material outlined check_box", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
              - ⟂ quando El[Página historico]:custom.var_editapedido_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
        - **Group** `gp arvore orcamentos` (bTtUz0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Icon** `Icon C` (bTtVG0) — props: icon="bootstrap box-fill", vertical_centering=True
            - ⟂ quando El[rpg orcamentos]:is_visible → is_visible=True
            - ⟂ quando El[rpg orcamentos]:isnt_visible → is_visible=False
          - **RepeatingGroup** `rpg orcamentos` (bTszK0) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", separator_color="var(--color_primary_contrast_default)", separator_style="none", separator_width=4, fixed_rows=False, border_color_left="var(--color_bTHGz_default)", border_style_left="solid", border_width_left=5, four_border_style=True, cell_min_height_css="85px", border_roundness_left=5
            - ⟂ quando This:get_list_data:count:less_than(1) → is_visible=False
            - **Group** `gp card orcamentos` (bTszz0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
              - **Button** `btn edita orcamento` (bTszV1) — text: "Edita cotação" · props: icon="feather unlock", icon_size=19, button_type="icon", title_attribute="Editar cotação"
                - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → font_color="var(--color_primary_default)", icon_color="var(--color_primary_contrast_default)", background_style="bgcolor", bgcolor="var(--color_primary_default)"
              - **Group** `Group BZZ` (bUCih0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `gp titulo` (bTszn0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group WZ` (bUCgc0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text E` (bTszp0) — text: "{Text("{Parent:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}")}" · props: vertical_centering=True
                    - **Icon** `Icon T` (bUCgW0) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Parent:cpo.QualProdutoModelo:_id}"
                  - **Group** `Group XZ` (bUChG0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Group** `Group YZ` (bUCjJ0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                      - **Text** `Text BZ` (bUCix0) — text: "Origem: "
                      - **AutocompleteDropdown** `src endereco origem` (bUChZ0) — data_source: Search(Tbl.EnderecosCliFor: cpo.Ativo equals True AND cpo.TipoClifor equals opt.TipoCliFor.Fornecedor; sort cpo.NomeEndereco) · placeholder: "" · props: default=Parent:cpo.QualEnderecoOrigem, vertical_centering=True, no_language=True, choices_style="dynamic", field_to_search="cpo_nomeendere_o_text"
                        - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                    - **Icon** `Icon W` (bUCjh0) — props: icon="material outlined arrow_right_alt", vertical_centering=True
                    - **Group** `Group ZZ` (bUCjV0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                      - **Text** `Text CZ` (bUCjD0) — text: "Destino: "
                      - **AutocompleteDropdown** `src endereco destino` (bUChx0) — data_source: Search(Tbl.EnderecosCliFor: cpo.Ativo equals True AND cpo.TipoClifor equals opt.TipoCliFor.Cliente; sort cpo.NomeEndereco) · placeholder: "" · props: default=Parent:cpo.QualEnderecoDestino, vertical_centering=True, no_language=True, choices_style="dynamic", field_to_search="cpo_nomeendere_o_text"
                        - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                - **Group** `gp campos` (bUCiC0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group W` (bTtCX0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text I` (bTtCL0) — text: "Quantidade"
                    - **Input** `ip oct qtd` (bTtAH0) — placeholder: "000" · content: Parent:cpo.QtdVenda · auto_binding: False · content_format: "int_number" · props: font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", placeholder_color="var(--color_bTHGl_default)"
                      - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group X` (bTtCi0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text J` (bTtCn0) — text: "Valor venda unit."
                    - **Input** `ip oct valor unit` (bTtAN0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorVendaUnit · auto_binding: False · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                      - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group Y` (bTtCu0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text L` (bTtCz0) — text: "Valor comiss unit."
                    - **Input** `ip oct comiss unit` (bTtAT0) — placeholder: "R$ 0,00" · content: Parent:cpo.valorcomissao · auto_binding: False · content_format: "float_number" · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", decimal_place=6, currency_symbol="R$ ", always_show_decimals=True
                      - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group Z` (bTtDG0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text M` (bTtDL0) — text: "Tipo frete"
                    - **Dropdown** `dd tipofrete` (bTtAZ0) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: False · props: mandatory=True, default=Parent:cpo.TipoFrete, font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
                      - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group BZ` (bTtDS0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text N` (bTtDX0) — text: "Valor frete"
                    - **Input** `ip oct valorfrete` (bTtAf0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorFrete · auto_binding: False · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
                      - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group CZ` (bTtDe0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text P` (bTtDj0) — text: "Alíquota ICMS"
                    - **Input** `ip icms` (bTtAl0) — placeholder: "ICMS %" · content: Parent:cpo.TotalBonusExtra - deleted · auto_binding: False · content_format: "percentage" · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=False, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
                      - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group DZ` (bTtDq0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text Q` (bTtDv0) — text: "Alíquota PIS"
                    - **Input** `ip piscofins` (bTtAr0) — placeholder: "PIS/COFINS %" · content: Parent:cpo.TotalComissaoVendedor · auto_binding: False · content_format: "percentage" · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=False, border_roundness_left=0
                      - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group GZ` (bTtEC0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text R` (bTtEH0) — text: "Total tributos"
                    - **Input** `ipt calculotributo` (bTtAx0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorPISCOFINS:plus(Parent:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                  - **Group** `Group QZ` (bTtEO0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text S` (bTtET0) — text: "Valor venda bruto"
                    - **Input** `ip totalbruto` (bTtBD0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                  - **Group** `Group RZ` (bTtEa0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text T` (bTtEf0) — text: "Valor venda liquido"
                    - **Input** `ip totalliquido` (bTtBJ0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                  - **Group** `Group TZ` (bTtEm0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Text** `Text U` (bTtEr0) — text: "Valor comiss bruto"
                    - **Input** `ip totalcomissao` (bTtBP0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
              - **Group** `gp botoes` (bTtNZ0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Button** `btn grava orçmento` (bTtNb0) — text: "Grava orçmto" · props: icon="material outlined check_box", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                  - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
                - **Button** `btn grava orçmnto historico` (bTtNf0) — text: "Grava histórico" · props: icon="material outlined library_add_check", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                  - ⟂ quando El[Página historico]:custom.var_editaorcamento_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
            - **Group** `gp arvore entregas` (bTtac0) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
              - **Icon** `Icon D` (bTtaj0) — props: icon="fa fa-truck", vertical_centering=True
                - ⟂ quando El[rpg entregas]:is_visible → is_visible=True
                - ⟂ quando El[rpg entregas]:isnt_visible → is_visible=False
              - **RepeatingGroup** `rpg entregas` (bTtBV0) — data_source: Parent:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_nftexto_text", value="{El[dd filterfinanceiro NFfornecedor]:get_data}", constraint_type="equals"}}, ignore_empty_constraints=True) · props: group_type="custom.tbl_entregas", separator_color="var(--color_primary_contrast_default)", separator_style="solid", separator_width=4, fixed_rows=False, border_color_left="var(--color_bTHHJ_default)", border_style_left="solid", border_width_left=5, four_border_style=True, cell_min_height_css="85px", border_roundness_left=5
                - ⟂ quando This:get_list_data:count:less_than(1) → is_visible=False
                - **Group** `gp card entregas` (bTtBb0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - **Button** `btn edita entrega` (bTtBm0) — text: "Edita cotação" · props: icon="feather unlock", icon_size=19, button_type="icon", title_attribute="Editar cotação"
                    - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → font_color="var(--color_primary_default)", icon_color="var(--color_primary_contrast_default)", background_style="bgcolor", bgcolor="var(--color_primary_default)"
                  - **Icon** `copy id entrega` (bUBid) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Parent:_id}"
                    - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
                    - ⟂ quando CurrentUser:cpo.IsDev:is_false → is_visible=False
                  - **Icon** `Icon N` (bUBjZ) — props: icon="fa fa-dollar", vertical_centering=True
                  - **Group** `Group ZZZ` (bTtIP0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text LZZ` (bTtIR0) — text: "Vendedor"
                    - **Dropdown** `ipt etg vendedor` (bTtIV0) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Vendedor" · auto_binding: False · props: default=Parent:cpo.QualVendedor, font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group A` (bUBpx) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text Z` (bUBpz) — text: "Substituto"
                    - **Dropdown** `ipt etg vendedor substituto` (bUBqD) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Vendedor" · auto_binding: False · props: default=Parent:cpo.QualVendedorSubstituto, font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group HZZ` (bTtGd0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text V` (bTtGf0) — text: "Quantidade"
                    - **Input** `ipt etg qtd` (bTtGj0) — placeholder: "000" · content: Parent:cpo.QtdEntrega · auto_binding: False · content_format: "int_number" · props: font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", placeholder_color="var(--color_bTHGl_default)"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group IZZ` (bTtGl0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text W` (bTtGq0) — text: "Valor venda unit"
                    - **Input** `ipt etg valor unit` (bTtGr0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorVendaBrutoUnitario · auto_binding: False · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_valorvenda_number", decimal_place=6, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group JZZ` (bTtGw0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text X` (bTtHB0) — text: "valor Comiss. unit"
                    - **Input** `ipt etg comiss unit` (bTtHC0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorComissaoUnitario · auto_binding: False · content_format: "float_number" · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", decimal_place=6, currency_symbol="R$ ", always_show_decimals=True
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group FZ` (bTvKj) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text K` (bTvKl) — text: "Valor comiss receber"
                    - **Input** `ipt calculotributo` (bTvKp) — placeholder: "R$ 0,00" · content: Parent:cpo.valorcomissao · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                  - **Group** `Group KZZ` (bTtHH0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text Y` (bTtHJ0) — text: "Dt prev entrega"
                    - **DateInput** `ipt etg dt preventrega` (bTtHN0) — placeholder: "R$ 0,00" · content: Parent:cpo.DataEntrega · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group SZZ` (bTtHP0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text QZ` (bTtHU0) — text: "Dt entrega"
                    - **DateInput** `ipt etg dt entrega` (bTtHV0) — placeholder: "R$ 0,00" · content: Parent:cpo.dtentrega · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group TZZ` (bTtHa0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text EZZ` (bTtHf0) — text: "Dt NF fornecedor"
                    - **DateInput** `ipt etg dt nf fornecedor` (bTtHg0) — placeholder: "R$ 0,00" · content: Parent:cpo.DtEmissaoNf · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group UZZ` (bTtHl0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text FZZ` (bTtHn0) — text: "Núm. NF fornecedor"
                    - **Input** `ipt etg numnf fornecedor` (bTtHr0) — placeholder: "00000" · content: "{Parent:cpo.NumNfFornecedor}" · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group VZZ` (bTtHt0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text GZZ` (bTtHy0) — text: "Arq. NF fornecedor"
                    - **FileInput** `ipt etg arq nf fornecedor` (bTtHz0) — placeholder: "Arquivo" · auto_binding: False · props: font_alignment="left", vertical_centering=True, word_spacing=-0.5, src="{Parent:cpo.ArquivoNfFornecedor}", disabled=True, bind_field="cpo_valorcomissao_number"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group YZZ` (bTtIE0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `Text HZZ` (bTtIJ0) — text: "Status"
                    - **Dropdown** `ipt etg status` (bTtIK0) — data_source: All(Opt.Etapas) · placeholder: "Status" · auto_binding: False · props: default=Parent:cpo.StatusEntrega, font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", dynamic_type="option.opt_etapas", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:display}"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                  - **Group** `Group DZZZ` (bTtNh0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Button** `btn grava entrega` (bTtNm0) — text: "Grava entrega" · props: icon="material outlined check_box", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
                    - **Button** `btn grava entrega historico` (bTtNn0) — text: "Grava histórico" · props: icon="material outlined library_add_check", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                      - ⟂ quando El[Página historico]:custom.var_editaentrega_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
                - **Group** `gp arvore receber` (bTteZ0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - **Icon** `Icon bootstrap coin` (bTtfr0) — oculto ao carregar · props: icon="bootstrap coin", vertical_centering=True
                    - ⟂ quando El[rpg areceber]:is_visible → is_visible=True
                    - ⟂ quando El[rpg areceber]:isnt_visible → is_visible=False
                  - **RepeatingGroup** `rpg areceber` (bTtIb0) — oculto ao carregar · data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", separator_color="var(--color_primary_contrast_default)", separator_style="solid", separator_width=4, fixed_rows=False, border_color_left="var(--color_bTHHX_default)", border_style_left="solid", border_width_left=5, four_border_style=True, cell_min_height_css="85px", border_roundness_left=5
                    - ⟂ quando This:get_list_data:count:less_than(1) → is_visible=False
                    - **Group** `gp card areceber` (bTtIh0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                      - **Button** `btn edita receber` (bTtIj0) — text: "Edita cotação" · props: icon="feather unlock", icon_size=19, button_type="icon", title_attribute="Editar cotação"
                        - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → font_color="var(--color_primary_default)", icon_color="var(--color_primary_contrast_default)", background_style="bgcolor", bgcolor="var(--color_primary_default)"
                      - **Icon** `copy id receber` (bUBiw) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Parent:_id}"
                        - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
                        - ⟂ quando CurrentUser:cpo.IsDev:is_false → is_visible=False
                      - **Group** `Group D` (bTtJp0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtJq0) — text: "Vendedor"
                        - **Dropdown** `ipt rec vendedor` (bTtJr0) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Vendedor" · auto_binding: False · props: default=Parent:cpo.QualVendedor, font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group D` (bTtJF0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtJG0) — text: "Dt vencimento"
                        - **DateInput** `ip rec dt vcto` (bTtJH0) — placeholder: "R$ 0,00" · content: Parent:cpo.DataVencimento · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group D` (bTtIt0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtIu0) — text: "Valor comiss unit"
                        - **Input** `ip rec valor unit` (bTtIv0) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorComissaoUnitario · auto_binding: False · content_format: "float_number" · props: font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_valorvenda_number", decimal_place=6, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group CZZ` (bUFGv1) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text EZ` (bUFGx1) — text: "Valor venda total"
                        - **Input** `ip rec valor unit` (bUFHB1) — placeholder: "R$ 0,00" · content: Parent:cpo.ValorTotal · auto_binding: False · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_valorvenda_number", decimal_place=6, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                      - **Group** `Group I` (bTvHN0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text D` (bTvHS0) — text: "Valor comiss receber"
                        - **Input** `ipt calculotributo` (bTvHT0) — placeholder: "R$ 0,00" · content: Parent:cpo.valorcomissao · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                      - **Group** `Group D` (bTtJL0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtJM0) — text: "Dt receb banco"
                        - **DateInput** `ipt rec dt recb banco` (bTtJN0) — placeholder: "R$ 0,00" · content: Parent:cpo.DataRecebimentoBancocaixa · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group D` (bTtJR0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtJS0) — text: "Dt NF megabox"
                        - **DateInput** `ipt rec dtnfmegabox` (bTtJT0) — placeholder: "R$ 0,00" · content: Parent:cpo.DataNfMegabox · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group D` (bTtJX0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtJY0) — text: "Núm. NF megabox"
                        - **Input** `ipt rec numnfmegabox` (bTtJZ0) — placeholder: "00000" · content: "{Parent:cpo.AnexoNfMegabox}" · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group Q` (bTvKA) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text G` (bTvKF) — text: "Núm. NF fornecedor"
                        - **Input** `ipt rec numnffornecedor` (bTvKG) — placeholder: "00000" · content: "{Parent:cpo.NumNfFornecedor}" · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group D` (bTtJd0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtJe0) — text: "Arq. NF fornecedor"
                        - **FileInput** `ipt rec filenfmegabox` (bTtJf0) — placeholder: "Arquivo" · auto_binding: False · props: font_alignment="left", vertical_centering=True, word_spacing=-0.5, src="{Parent:cpo.AnexoNfMegabox}", disabled=True, bind_field="cpo_valorcomissao_number"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group D` (bTtJj0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Text** `Text TZZ` (bTtJk0) — text: "Status"
                        - **Dropdown** `ipt rec statusfinanceiro` (bTtJl0) — data_source: All(Opt.StatusFinanceiro):minus_element(Opt.StatusFinanceiro.A pagar):minus_element(Opt.StatusFinanceiro.Pago) · placeholder: "Status" · auto_binding: False · props: default=Parent:cpo.StatusFinanceiro, font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", dynamic_type="option.opt_statusfinanceiro", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:display}"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group IZZZ` (bTtNs0) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                        - **Button** `btn grava receber` (bTtNx0) — text: "Grava a receber" · props: icon="material outlined check_box", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
                        - **Button** `btn del receber` (bTvFI0) — text: "Deletar a receber" · props: icon="material outlined delete_outline", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                          - ⟂ quando El[Página historico]:custom.var_editareceber_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHHQ_default)", button_disabled=False
                - **Group** `rp arvore pagar` (bTtfx0) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - **Icon** `Icon H` (bTtgE0) — oculto ao carregar · props: icon="bootstrap coin", vertical_centering=True
                    - ⟂ quando El[rpg apagar]:is_visible → is_visible=True
                    - ⟂ quando El[rpg apagar]:isnt_visible → is_visible=False
                  - **RepeatingGroup** `rpg apagar` (bTtLP0) — oculto ao carregar · data_source: Parent:cpo.QuaisContasPagar · props: group_type="custom.tbl_contasreceber1", separator_color="var(--color_primary_contrast_default)", separator_style="solid", separator_width=4, fixed_rows=False, border_color_left="var(--color_bTHHQ_default)", border_style_left="solid", border_width_left=5, four_border_style=True, cell_min_height_css="85px", border_roundness_left=5
                    - ⟂ quando This:get_list_data:count:less_than(1) → is_visible=False
                    - **Group** `gp card a pagar` (bTtLR0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                      - **Button** `btn edita pagar` (bTtLV0) — text: "Edita cotação" · props: icon="feather unlock", icon_size=19, button_type="icon", title_attribute="Editar cotação"
                        - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → font_color="var(--color_primary_default)", icon_color="var(--color_primary_contrast_default)", background_style="bgcolor", bgcolor="var(--color_primary_default)"
                      - **Icon** `copy id receber` (bUBjJ) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Parent:_id}"
                        - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
                        - ⟂ quando CurrentUser:cpo.IsDev:is_false → is_visible=False
                      - **Group** `Group BZZZ` (bTtMM0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtMN0) — text: "Vendedor"
                        - **Dropdown** `ipt gar vendedor` (bTtMR0) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Vendedor" · auto_binding: False · props: default=Parent:cpo.QualVendedor, font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", dynamic_type="user", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group BZZZ` (bTtLc0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtLd0) — text: "Dt vencimento"
                        - **DateInput** `ip gar dt vcto` (bTtLh0) — placeholder: "R$ 0,00" · content: Parent:cpo.DataVencimento · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group BZZZ` (bTtLW0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtLX0) — text: "Valor comissão vendedor"
                        - **Input** `ip gar valor unit` (bTtLb0) — placeholder: "R$ 0,00" · content: Parent:cpo.valorcomissao · auto_binding: False · content_format: "currency" · props: font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group BZZZ` (bTtLi0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtLj0) — text: "Dt receb banco"
                        - **DateInput** `ipt gar dt recb banco` (bTtLn0) — placeholder: "R$ 0,00" · content: Parent:cpo.DataRecebimentoBancocaixa · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group BZZZ` (bTtLo0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtLp0) — text: "Dt NF megabox"
                        - **DateInput** `ipt gar dtnfmegabox` (bTtLt0) — placeholder: "R$ 0,00" · content: Parent:cpo.DataNfMegabox · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number", date_format="custom", custom_format="dd/mm/yy"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group BZZZ` (bTtLu0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtLv0) — text: "Núm. NF megabox"
                        - **Input** `ipt gar numnfmegabox` (bTtLz0) — placeholder: "00000" · content: "{Parent:cpo.AnexoNfMegabox}" · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group AZ` (bTvKT) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text H` (bTvKY) — text: "Núm. NF fornecedor"
                        - **Input** `ipt gar numnffornecedor` (bTvKZ) — placeholder: "00000" · content: "{Parent:cpo.NumNfFornecedor}" · auto_binding: False · props: font_alignment="left", word_spacing=-0.5, disabled=True, bind_field="cpo_valorcomissao_number"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group BZZZ` (bTtMA0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtMB0) — text: "Arq. NF fornecedor"
                        - **FileInput** `ipt gar filenfmegabox` (bTtMF0) — placeholder: "Arquivo" · auto_binding: False · props: font_alignment="left", vertical_centering=True, word_spacing=-0.5, src="{Parent:cpo.AnexoNfMegabox}", disabled=True, bind_field="cpo_valorcomissao_number"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group BZZZ` (bTtMG0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Text** `Text UZZ` (bTtMH0) — text: "Status"
                        - **Dropdown** `ipt gar statusfinanceiro` (bTtML0) — data_source: All(Opt.StatusFinanceiro):minus_element(Opt.StatusFinanceiro.A receber):minus_element(Opt.StatusFinanceiro.Recebido) · placeholder: "Status" · auto_binding: False · props: default=Parent:cpo.StatusFinanceiro, font_alignment="left", word_spacing=-0.5, disabled=True, unique_id="", bind_field="cpo_qtdvenda_number", dynamic_type="option.opt_statusfinanceiro", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:display}"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → border_color="var(--color_primary_default)", font_color="var(--color_primary_default)", background_style="bgcolor", bgcolor="#FFFFFF", disabled=False
                      - **Group** `Group JZZZ` (bTtOD0) — data_source: Parent · props: group_type="custom.tbl_contasreceber1", vertical_centering=True
                        - **Button** `btn grava pagar` (bTtOF0) — text: "Grava a pagar" · props: icon="material outlined check_box", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
                        - **Button** `btn del pagar` (bTvFO0) — text: "Deletar a pagar" · props: icon="material outlined delete_outline", icon_size=16, button_gap=5, button_type="label_icon", button_disabled=True, title_attribute="Editar cotação"
                          - ⟂ quando El[Página historico]:custom.var_editaapagar_:equals(Parent) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHHQ_default)", button_disabled=False
- **CustomElement** `reus cabecalho A` (bTsnF) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `tool.DashMenu A` (bTsnJ) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **Alert** `alt processando` (bTsnR) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! " · props: at_to_top=True
- **FloatingGroup** `gp filtros financeiro` (bTsSD) — props: vertical_centering=True
  - **Group** `Group IZ` (bTsQL) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text DZ` (bTsQS) — text: "Intervalo de data"
    - **Group** `Group N` (bTsQM) — props: vertical_centering=True
      - **Plugin[1648823245313x509054419018711040]/AAC** `dtr filterfinanceiro data` (bTsQR) — props: padding_horizontal=5, padding_vertical=10, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAH="DD/MM/YY", AAK=True, AAM=2, AAN=2, AAP="Aplicar", AAQ="Cancelar", AAS=False, AAf="{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {UrlParam("datafim" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
        - ⟂ quando This:is_hovered → 
      - **Icon** `btn periodointegral` (bTsQN) — props: icon="material regular event_repeat", vertical_centering=True, button_disabled=True, title_attribute="Filtra data: Todo historico"
        - ⟂ quando El[dd filterfinanceiro CLIENTE]:get_data:is_not_empty:or_(El[dd filterfinanceiro fornecedor]:get_data:is_not_empty):or_(El[dd filterfinanceiro status]:get_data:is_not_empty) → icon_color="var(--color_primary_default)", button_disabled=False
  - **Group** `Group SZ` (bTsRh) — props: vertical_centering=True
    - **Text** `Text PZ` (bTsRl) — text: "Núm pedido"
    - **Group** `gp filter numeropedido` (bTsRm) — props: group_type="number", vertical_centering=True
      - **Input** `dd filterfinanceiro numpedido` (bTsRn) — placeholder: "Número cobrança" · content: UrlParam("numpedido" as number) · content_format: "int_number" · props: placeholder_color="var(--color_bTHGl_default)"
      - **Icon** `reset filter numcobranca` (bTsRr) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro numpedido]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group JZ` (bTsQT) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text IZ` (bTsQX) — text: "Cliente"
    - **Group** `gp filter cliente` (bTsQY) — props: vertical_centering=True
      - **AutocompleteDropdown** `dd filterfinanceiro CLIENTE` (bTsQZ) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente; sort cpo.NomeCliFor) · placeholder: "Cliente" · props: default=UrlParam("cliente" as custom.tbl_clientes), field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGl_default)"
      - **Icon** `reset filter cliente` (bTsQd) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro CLIENTE]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group KZ` (bTsQe) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text JZ` (bTsQf) — text: "Grupo Fornecedor"
    - **Group** `gp filter fornecedor` (bTsQj) — props: vertical_centering=True
      - **AutocompleteDropdown** `dd filterfinanceiro fornecedor` (bTsQk) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Grupo Fornecedor" · props: default=UrlParam("fornecedor" as custom.tbl_clientes), field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGl_default)"
      - **Icon** `reset filter fornecedor` (bTsQl) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro fornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group XZZ` (bTsRs) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text YZZ` (bTsRt) — text: "Filial Fornecedor"
    - **Group** `gp filter filial fornecedor` (bTsRx) — props: vertical_centering=True
      - **Dropdown** `dd filterfinanceiro filialfornecedor` (bTsRy) — data_source: El[dd filterfinanceiro fornecedor]:get_data:cpo.QuaisEnderecos · placeholder: "Filial Fornecedor" · props: default=UrlParam("filialfornecedor" as custom.tbl_enderecosclifor), dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} ({InjectedValue:cpo.CnpjCpf})"
      - **Icon** `reset filter fornecedor` (bTsRz) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro filialfornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group LZ` (bTsQp) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text KZ` (bTsQq) — text: "Vendedor"
    - **Group** `gp filter vendedor` (bTsQr) — props: vertical_centering=True
      - **AutocompleteDropdown** `dd filterfinanceiro vendedor` (bTsQv) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Vendedor" · props: default=UrlParam("vendedor" as user), field_to_search="cpo_nome_text", placeholder_color="var(--color_bTHGl_default)"
      - **Icon** `reset filter vendedor` (bTsQw) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro vendedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group MZ` (bTsQx) — props: vertical_centering=True
    - **Text** `Text LZ` (bTsRB) — text: "Num NF Fornecedor"
    - **Group** `gp filter nf fornecedor` (bTsRC) — props: group_type="number", vertical_centering=True
      - **Input** `dd filterfinanceiro NFfornecedor` (bTsRD) — placeholder: "Fornecedor NF" · content: "{UrlParam("fornecedornf" as number)}" · props: placeholder_color="var(--color_bTHGl_default)"
      - **Icon** `reset filter nf fornecedor` (bTsRH) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro NFfornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group NZ` (bTsRI) — props: vertical_centering=True
    - **Text** `Text MZ` (bTsRJ) — text: "Num NF Megabox"
    - **Group** `gp filter nf megabox` (bTsRN) — props: group_type="number", vertical_centering=True
      - **Input** `dd filterfinanceiro numcobranca` (bTsRO) — placeholder: "Megabox NF" · content: "{UrlParam("megaboxnf" as number)}" · props: placeholder_color="var(--color_bTHGl_default)"
      - **Icon** `reset filter nf megabox` (bTsRP) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro numcobranca]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group OZ` (bTsRT) — oculto ao carregar · props: vertical_centering=True
    - **Text** `Text NZ` (bTsRU) — text: "Núm cobrança"
    - **Group** `gp filter numerocobranca` (bTsRV) — props: group_type="number", vertical_centering=True
      - **Input** `dd filterfinanceiro numcobranca` (bTsRZ) — placeholder: "Número cobrança" · content: UrlParam("numcobranca" as number) · content_format: "int_number" · props: placeholder_color="var(--color_bTHGl_default)"
      - **Icon** `reset filter numcobranca` (bTsRa) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
        - ⟂ quando El[dd filterfinanceiro numcobranca]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
  - **Group** `Group PZ` (bTsRb) — props: vertical_centering=True
    - **Text** `Text OZ` (bTsRf) — text: "Status recebimento"
    - **Dropdown** `dd filterfinanceiro status` (bTsRg) — data_source: All(Opt.StatusFinanceiro) · placeholder: "Status" · props: default=UrlParam("statusfinanceiro" as option.opt_statusfinanceiro), vertical_centering=True, dynamic_type="option.opt_statusfinanceiro", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_uppercase}"

## Workflows

#### WF bTsoB — PageLoaded
1. **Plugin[1558770956236x539499438875082750]/AAC** [bTsoF] 
2. **ChangePage** [bTsoG] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):and_(CurrentUser:cpo.UltimoDateRange:is_not_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min}"}, 1={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max}"}}, keep_current_page_params=True
3. **ChangePage** [bTsoH] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):or_(CurrentUser:cpo.UltimoDateRange:is_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
4. **ChangePage** [bTsoL] alvo El[Current page] · SÓ SE UrlParam("dtfiltro" as option.opt_entregavcto):is_empty · add_parameters=True, url_parameters={0={key="dtfiltro", value="{Opt.TiposData.Data entrega:display}{∅}"}}, keep_current_page_params=True
5. **ChangePage** [bTsoM] alvo El[Current page] · SÓ SE UrlParam("receber" as text):is_empty · add_parameters=True, url_parameters={0={key="receber", value="yes{∅}"}}, keep_current_page_params=True
6. **ChangePage** [bTsoN] alvo El[Current page] · SÓ SE UrlParam("pagar" as text):is_empty · add_parameters=True, url_parameters={0={key="pagar", value="no{∅}"}}, keep_current_page_params=True

#### WF bTsoT — InputChanged em El[dd filterfinanceiro fornecedor]
1. **ChangePage** [bTsoX] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTsoY — InputChanged em El[dd filterfinanceiro status]
1. **ChangePage** [bTsoZ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="statusfinanceiro", value="{This:get_data:display}"}}, keep_current_page_params=True

#### WF bTsod — InputChanged em El[dd filterfinanceiro status]
- condição: This:get_data:is_empty:and_(El[dd filterfinanceiro CLIENTE]:get_data:is_empty):and_(El[dd filterfinanceiro fornecedor]:get_data:is_empty)
1. **ChangePage** [bTsoe] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}, 2={key="statusfinanceiro", value="{This:get_data:display}"}}, keep_current_page_params=True

#### WF bTsof — Plugin[1648823245313x509054419018711040]/AAd em El[dtr filterfinanceiro data]
1. **MakeChangeCurrentUser** [bTsoj] campos: cpo.UltimoDateRange = This:get_AAF
2. **ChangePage** [bTsok] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min:change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTsol — ButtonClicked em El[btn periodointegral]
1. **ChangePage** [bTsop] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Date(1704078000000)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTsox — ButtonClicked em El[reset filter cliente]
1. **ResetGroup** [bTspB] alvo El[gp filter cliente]
2. **ChangePage** [bTspC] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{∅}"}}, keep_current_page_params=True

#### WF bTspD — InputChanged em El[dd filterfinanceiro CLIENTE]
1. **ChangePage** [bTspH] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTspI — ButtonClicked em El[reset filter fornecedor]
1. **ResetGroup** [bTspJ] alvo El[gp filter fornecedor]
2. **ChangePage** [bTspN] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTspV — ButtonClicked em El[reset filter numcobranca]
1. **ResetGroup** [bTspZ] alvo El[gp filter numerocobranca]
2. **ChangePage** [bTspa] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numcobranca", value="{∅}"}}, keep_current_page_params=True

#### WF bTspb — InputChanged em El[dd filterfinanceiro numcobranca]
1. **ChangePage** [bTspf] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numcobranca", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTspl — InputChanged em El[dd filterfinanceiro vendedor]
1. **ChangePage** [bTspm] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTspn — ButtonClicked em El[reset filter vendedor]
1. **ResetGroup** [bTspr] alvo El[gp filter vendedor]
2. **ChangePage** [bTsps] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTspz — InputChanged em El[dd filterfinanceiro NFfornecedor]
1. **ChangePage** [bTsqD] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedornf", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTsqE — InputChanged em El[dd filterfinanceiro numcobranca]
1. **ChangePage** [bTsqF] alvo El[Current page] · add_parameters=True, url_parameters={0={key="megaboxnf", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTsqJ — ButtonClicked em El[reset filter nf fornecedor]
1. **ResetGroup** [bTsqK] alvo El[gp filter nf fornecedor]
2. **ChangePage** [bTsqL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedornf", value="{∅}"}}, keep_current_page_params=True

#### WF bTsqP — ButtonClicked em El[reset filter nf megabox]
1. **ResetGroup** [bTsqQ] alvo El[gp filter nf megabox]
2. **ChangePage** [bTsqR] alvo El[Current page] · add_parameters=True, url_parameters={0={key="megaboxnf", value="{∅}"}}, keep_current_page_params=True

#### WF bTsqX — InputChanged em El[dd filterfinanceiro numpedido]
1. **ChangePage** [bTsqb] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTsqc — ButtonClicked em El[reset filter numcobranca]
1. **ResetGroup** [bTsqd] alvo El[gp filter numeropedido]
2. **ChangePage** [bTsqh] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{∅}"}}, keep_current_page_params=True

#### WF bTsul — SEM_TIPO

#### WF bTthX — ButtonClicked em El[btn edita cotacao]
- condição: El[Página historico]:custom.var_editacotacao_:is_not_empty
1. **SetCustomState** [bTthd] alvo El[Página historico] · custom_state="custom.var_editacotacao_"

#### WF bTthf — ButtonClicked em El[btn edita pedido]
- condição: El[Página historico]:custom.var_editapedido_:is_empty
1. **SetCustomState** [bTthl] alvo El[Página historico] · value=Parent, custom_state="custom.var_editapedido_"

#### WF bTthq — ButtonClicked em El[btn edita cotacao]
- condição: El[Página historico]:custom.var_editacotacao_:is_empty
1. **SetCustomState** [bTthv] alvo El[Página historico] · value=Parent, custom_state="custom.var_editacotacao_"

#### WF bTthx — ButtonClicked em El[btn edita pedido]
- condição: El[Página historico]:custom.var_editapedido_:is_not_empty
1. **SetCustomState** [bTtiC] alvo El[Página historico] · custom_state="custom.var_editapedido_"

#### WF bTtiH — ButtonClicked em El[btn edita orcamento]
- condição: El[Página historico]:custom.var_editaorcamento_:is_empty
1. **SetCustomState** [bTtiJ] alvo El[Página historico] · value=Parent, custom_state="custom.var_editaorcamento_"

#### WF bTtiO — ButtonClicked em El[btn edita orcamento]
- condição: El[Página historico]:custom.var_editaorcamento_:is_not_empty
1. **SetCustomState** [bTtiT] alvo El[Página historico] · custom_state="custom.var_editaorcamento_"

#### WF bTtiV — ButtonClicked em El[btn edita entrega]
- condição: El[Página historico]:custom.var_editaentrega_:is_empty
1. **SetCustomState** [bTtia] alvo El[Página historico] · value=Parent, custom_state="custom.var_editaentrega_"

#### WF bTtif — ButtonClicked em El[btn edita entrega]
- condição: El[Página historico]:custom.var_editaentrega_:is_not_empty
1. **SetCustomState** [bTtih] alvo El[Página historico] · custom_state="custom.var_editaentrega_"

#### WF bTtim — ButtonClicked em El[btn edita receber]
- condição: El[Página historico]:custom.var_editareceber_:is_empty
1. **SetCustomState** [bTtir] alvo El[Página historico] · value=Parent, custom_state="custom.var_editareceber_"

#### WF bTtit — ButtonClicked em El[btn edita receber]
- condição: El[Página historico]:custom.var_editareceber_:is_not_empty
1. **SetCustomState** [bTtiy] alvo El[Página historico] · custom_state="custom.var_editareceber_"

#### WF bTtjD — ButtonClicked em El[btn edita pagar]
- condição: El[Página historico]:custom.var_editaapagar_:is_empty
1. **SetCustomState** [bTtjF] alvo El[Página historico] · value=Parent, custom_state="custom.var_editaapagar_"

#### WF bTtjK — ButtonClicked em El[btn edita pagar]
- condição: El[Página historico]:custom.var_editaapagar_:is_not_empty
1. **SetCustomState** [bTtjP] alvo El[Página historico] · custom_state="custom.var_editaapagar_"

#### WF bTtjR — ButtonClicked em El[btn grava cotacao]
1. **ChangeThing** [bTtjX] campos: cpo.QualVendedor = El[dd vendedor cotacao]:get_data · to_change=Parent
2. **SetCustomState** [bTtkM] alvo El[Página historico] · custom_state="custom.var_editacotacao_"

#### WF bTtkR — ButtonClicked em El[btn grava cotacao historico]
1. **ChangeThing** [bTtkX] campos: cpo.QualVendedor = El[dd vendedor cotacao]:get_data · to_change=Parent
2. **ChangeListOfThings** [bTtkZ] campos: cpo.QualVendedor = El[dd vendedor cotacao]:get_data · to_change=Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
3. **ChangeListOfThings** [bTtke] campos: cpo.QualVendedor = El[dd vendedor cotacao]:get_data · to_change=Parent:cpo.QualPedido:convert_to_list, type_to_change="custom.tbl_pedidos"
4. **ChangeListOfThings** [bTtkj] campos: cpo.QualVendedor = El[dd vendedor cotacao]:get_data · to_change=Parent:cpo.QualPedido:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **ChangeListOfThings** [bTtkl] campos: cpo.QualVendedor = El[dd vendedor cotacao]:get_data · to_change=Parent:cpo.QualPedido:cpo.QuaisEntregas:cpo.QuaisContasReceber, type_to_change="custom.tbl_contasreceber"
6. **ChangeListOfThings** [bTtkq] campos: cpo.QualVendedor = El[dd vendedor cotacao]:get_data · to_change=Parent:cpo.QualPedido:cpo.QuaisEntregas:cpo.QuaisContasPagar, type_to_change="custom.tbl_contasreceber1"
7. **SetCustomState** [bTtkv] alvo El[Página historico] · custom_state="custom.var_editacotacao_"

#### WF bTtlI — ButtonClicked em El[btn grava orçmento]
1. **ChangeThing** [bTtlO] campos: cpo.QtdVenda = El[ip oct qtd]:get_data; cpo.ValorVendaUnit = El[ip oct valor unit]:get_data; cpo.valorcomissao = El[ip oct comiss unit]:get_data; cpo.TipoFrete = El[dd tipofrete]:get_data; cpo.ValorFrete = El[ip oct valorfrete]:get_data; cpo.TotalBonusExtra - deleted = El[ip icms]:get_data; cpo.TotalComissaoVendedor = El[ip icms]:get_data; cpo.QualEnderecoOrigem = El[src endereco origem]:get_data; cpo.QualFornecedor = El[src endereco origem]:get_data:cpo.QualGrupoCliFor; cpo.QualEnderecoDestino = El[src endereco destino]:get_data · to_change=Parent
2. **ScheduleAPIEvent** [bTtlT] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Parent:convert_to_list

#### WF bTtlV — ButtonClicked em El[btn grava orçmnto historico]
1. **ChangeThing** [bTtlb] campos: cpo.QtdVenda = El[ip oct qtd]:get_data; cpo.ValorVendaUnit = El[ip oct valor unit]:get_data; cpo.valorcomissao = El[ip oct comiss unit]:get_data; cpo.TipoFrete = El[dd tipofrete]:get_data; cpo.ValorFrete = El[ip oct valorfrete]:get_data; cpo.TotalBonusExtra - deleted = El[ip icms]:get_data; cpo.TotalComissaoVendedor = El[ip icms]:get_data; cpo.QualEnderecoOrigem = El[src endereco origem]:get_data; cpo.QualFornecedor = El[src endereco origem]:get_data:cpo.QualGrupoCliFor; cpo.QualEnderecoDestino = El[src endereco destino]:get_data · to_change=Parent
2. **ScheduleAPIEvent** [bTtlg] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Parent:convert_to_list
3. **ChangeListOfThings** [bTtmK] campos: cpo.ValorVendaBrutoUnitario = El[ip oct valor unit]:get_data; cpo.ValorComissaoUnitario = El[ip oct comiss unit]:get_data · to_change=Parent:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
4. **ScheduleAPIEvent** [bTtll] date=Page.Current Date/Time, api_event="bTtln", _wf_param_par^{p1}Qtd=Parent:cpo.QuaisEntregas:count, _wf_param_par^{p1}Fila=1, _wf_param_par^{p1}QuaisEntregas=Parent:cpo.QuaisEntregas

#### WF bUBij — ButtonClicked em El[copy id entrega]
1. **Plugin[1497473108162x748255442121523200]/AAU** [bUBir] AAg="{Parent:_id}"

#### WF bUBjC — ButtonClicked em El[copy id receber]
1. **Plugin[1497473108162x748255442121523200]/AAU** [bUBjH] AAg="{Parent:_id}"

#### WF bUBjP — ButtonClicked em El[copy id receber]
1. **Plugin[1497473108162x748255442121523200]/AAU** [bUBjU] AAg="{Parent:_id}"

#### WF bUBkV — ButtonClicked em El[Button C]
1. **ChangeThing** [bUBkb] campos: cpo.QuaisContasReceber = Search(Tbl.ContasReceber: _id {'type': 'Empty'} El[ipt id a receber]:get_data):first_element · to_change=Parent
2. **ChangeThing** [bUBkn] campos: cpo.QualEntrega = Parent · to_change=Search(Tbl.ContasReceber: _id {'type': 'Empty'} El[ipt id a receber]:get_data):first_element
3. **ResetInputs** [bUBkd] 
4. **HideElement** [bUBki] alvo El[pop add areceber na entrega]

#### WF bUBkp — ButtonClicked em El[Icon N]
1. **ShowElement** [bUBkv] alvo El[pop add areceber na entrega]
2. **DisplayGroupData** [bUBlA] alvo El[pop add areceber na entrega] · data_source=Parent

#### WF bTsur — InputChanged em El[dd filterfinanceiro filialfornecedor]
1. **ChangePage** [bTsuv] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filialfornecedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTsuw — ButtonClicked em El[reset filter fornecedor]
1. **ResetGroup** [bTsux] alvo El[gp filter filial fornecedor]
2. **ChangePage** [bTsvB] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filialfornecedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTtMT0 — ButtonClicked em El[gp card cotacao]
1. **ToggleElement** [bTtMZ0] alvo El[rpg pedidos]

#### WF bTtMe0 — ButtonClicked em El[gp card pedido]
1. **ToggleElement** [bTtMk0] alvo El[rpg orcamentos]

#### WF bTtMp0 — ButtonClicked em El[gp card orcamentos]
1. **ToggleElement** [bTtMv0] alvo El[rpg entregas]

#### WF bTtMx0 — ButtonClicked em El[gp card entregas]
1. **ToggleElement** [bTtND0] alvo El[rpg areceber]
2. **ToggleElement** [bTtNI0] alvo El[rpg apagar]

#### WF bTvDn0 — ButtonClicked em El[btn grava entrega]
1. **ChangeThing** [bTvDt0] campos: cpo.QualVendedor = El[ipt etg vendedor]:get_data; cpo.QtdEntrega = El[ipt etg qtd]:get_data; cpo.ValorVendaBrutoUnitario = El[ipt etg valor unit]:get_data; cpo.ValorComissaoUnitario = El[ipt etg comiss unit]:get_data; cpo.DataEntrega = El[ipt etg dt preventrega]:get_data; cpo.dtentrega = El[ipt etg dt entrega]:get_data; cpo.DtEmissaoNf = El[ipt etg dt nf fornecedor]:get_data; cpo.NumNfFornecedor = "{El[ipt etg numnf fornecedor]:get_data}"; cpo.ArquivoNfFornecedor = "{El[ipt etg arq nf fornecedor]:get_data}"; cpo.StatusEntrega = El[ipt etg status]:get_data; cpo.QualVendedorSubstituto = El[ipt etg vendedor substituto]:get_data · to_change=Parent
2. **ChangeThing** [bTvKr] campos: cpo.valorcomissao = InjectedValue:cpo.ValorComissaoUnitario:times(InjectedValue:cpo.QtdEntrega); cpo.ValorVendaBruto = InjectedValue:cpo.ValorVendaBrutoUnitario:times(InjectedValue:cpo.QtdEntrega); cpo.ValorVendaLiquido = InjectedValue:cpo.ValorVendaLiquidoUnitario:times(InjectedValue:cpo.QtdEntrega) · to_change=Parent
3. **ChangeListOfThings** [bUBiY] campos: cpo.QualVendedor = El[ipt etg vendedor]:get_data; cpo.NumNfFornecedor = "{Parent:cpo.NumNfFornecedor}"; cpo.NumNfFornecedor = "{Parent:cpo.ArquivoNfFornecedor}"; cpo.DataEntrega = Parent:cpo.dtentrega · to_change=Parent:cpo.QuaisContasReceber, type_to_change="custom.tbl_contasreceber"
4. **SetCustomState** [bTvDv0] alvo El[Página historico] · custom_state="custom.var_editaentrega_"

#### WF bTvEA0 — ButtonClicked em El[btn grava entrega historico]
1. **ChangeThing** [bTvEG0] campos: cpo.QualVendedor = El[ipt etg vendedor]:get_data; cpo.QtdEntrega = El[ipt etg qtd]:get_data; cpo.ValorVendaBrutoUnitario = El[ipt etg valor unit]:get_data; cpo.ValorComissaoUnitario = El[ipt etg comiss unit]:get_data; cpo.DataEntrega = El[ipt etg dt preventrega]:get_data; cpo.dtentrega = El[ipt etg dt entrega]:get_data; cpo.DtEmissaoNf = El[ipt etg dt nf fornecedor]:get_data; cpo.NumNfFornecedor = "{El[ipt etg numnf fornecedor]:get_data}"; cpo.ArquivoNfFornecedor = "{El[ipt etg arq nf fornecedor]:get_data}"; cpo.StatusEntrega = El[ipt etg status]:get_data; cpo.QualVendedorSubstituto = El[ipt etg vendedor substituto]:get_data · to_change=Parent
2. **ChangeThing** [bTvdH] campos: cpo.valorcomissao = Parent:cpo.QtdEntrega:times(Parent:cpo.ValorComissaoUnitario) · to_change=Parent
3. **ChangeListOfThings** [bTvEN0] campos: cpo.QualVendedor = El[ipt etg vendedor]:get_data; cpo.ValorComissaoUnitario = El[ipt etg comiss unit]:get_data; cpo.valorcomissao = Parent:cpo.valorcomissao:divide(Parent:cpo.QuaisContasReceber:count); cpo.NumNfFornecedor = "{Parent:cpo.NumNfFornecedor}"; cpo.NumNfFornecedor = "{Parent:cpo.ArquivoNfFornecedor}"; cpo.DataEntrega = Parent:cpo.dtentrega; cpo.ValorUnit = Parent:cpo.ValorVendaBrutoUnitario; cpo.ValorTotal = Parent:cpo.ValorVendaBrutoUnitario:times(Parent:cpo.QtdEntrega) · to_change=Parent:cpo.QuaisContasReceber, type_to_change="custom.tbl_contasreceber"
4. **SetCustomState** [bTvEX0] alvo El[Página historico] · custom_state="custom.var_editaentrega_"

#### WF bTvEZ0 — ButtonClicked em El[btn grava receber]
1. **ChangeThing** [bTvEf0] campos: cpo.QualVendedor = El[ipt rec vendedor]:get_data; cpo.DataVencimento = El[ip rec dt vcto]:get_data; cpo.ValorComissaoUnitario = El[ip rec valor unit]:get_data; cpo.valorcomissao = El[ip rec valor unit]:get_data:times(Parent:cpo.QualEntrega:cpo.QtdEntrega); cpo.DataRecebimentoBancocaixa = El[ipt rec dt recb banco]:get_data; cpo.DataNfMegabox = El[ipt rec dtnfmegabox]:get_data; cpo.NumNfMegabox = "{El[ipt rec numnfmegabox]:get_data}"; cpo.AnexoNfMegabox = "{El[ipt rec filenfmegabox]:get_data}"; cpo.StatusFinanceiro = El[ipt rec statusfinanceiro]:get_data; cpo.NumNfFornecedor = "{El[ipt rec numnffornecedor]:get_data}" · to_change=Parent
2. **SetCustomState** [bTvEp0] alvo El[Página historico] · custom_state="custom.var_editareceber_"

#### WF bTvEr0 — ButtonClicked em El[btn grava pagar]
1. **ChangeThing** [bTvEw0] campos: cpo.QualVendedor = El[ipt gar vendedor]:get_data; cpo.DataVencimento = El[ip gar dt vcto]:get_data; cpo.ValorComissaoUnitario = El[ip gar valor unit]:get_data; cpo.valorcomissao = El[ip gar valor unit]:get_data:times(Parent:cpo.QualEntrega:cpo.QtdEntrega); cpo.DataRecebimentoBancocaixa = El[ipt gar dt recb banco]:get_data; cpo.DataNfMegabox = El[ipt gar dtnfmegabox]:get_data; cpo.NumNfMegabox = "{El[ipt gar numnfmegabox]:get_data}"; cpo.AnexoNfMegabox = "{El[ipt gar filenfmegabox]:get_data}"; cpo.StatusFinanceiro = El[ipt gar statusfinanceiro]:get_data; cpo.NumNfFornecedor = "{El[ipt gar numnffornecedor]:get_data}" · to_change=Parent
2. **SetCustomState** [bTvEx0] alvo El[Página historico] · custom_state="custom.var_editaapagar_"

#### WF bTvGV0 — ButtonClicked em El[btn grava pedido]
1. **ChangeThing** [bTvGd0] campos: cpo.PrazoRecebComissoes = El[dd parcelas pedido]:get_data; cpo.FormaPagto = El[dd formapagto pedido]:get_data · to_change=Parent
2. **SetCustomState** [bTvGi0] alvo El[Página historico] · custom_state="custom.var_editapedido_"

#### WF bTvGn0 — ButtonClicked em El[btn del receber]
1. **DeleteThing** [bTvGt0] to_delete=Parent
2. **SetCustomState** [bTvGv0] alvo El[Página historico] · custom_state="custom.var_editareceber_"

#### WF bTvHA0 — ButtonClicked em El[btn del pagar]
1. **DeleteThing** [bTvHG0] to_delete=Parent
2. **SetCustomState** [bTvHL0] alvo El[Página historico] · custom_state="custom.var_editaapagar_"

#### WF bUCeq0 — ButtonClicked em El[Text AZ]
1. **OpenURL** [bUCfI0] open_in_new_tab=True, url="{Parent:cpo.AquivoProposta}"

#### WF bUCfm0 — ButtonClicked em El[Icon O]
1. **Plugin[1497473108162x748255442121523200]/AAU** [bUCfs0] AAg="{Parent:_id}"

#### WF bUCgL0 — ButtonClicked em El[Icon R]
1. **Plugin[1497473108162x748255442121523200]/AAU** [bUCgR0] AAg="{Parent:_id}"

#### WF bUCgn0 — ButtonClicked em El[Icon T]
1. **Plugin[1497473108162x748255442121523200]/AAU** [bUCgv0] AAg="{Parent:cpo.QualProdutoModelo:_id}"
