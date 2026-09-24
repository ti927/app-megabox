# Reusable: `pop.AddEdita Produtos` (bTiZh)

Estados customizados: `var_qualpedido_` : Tbl.Pedido

Resumo: 28 elementos · 6 workflows · 17 ações · 20 condicionais · 1 estados customizados
Elementos por tipo: Group 10, Text 7, Dropdown 4, Icon 3, Input 2, CustomElement 1, Image 1

## Árvore de elementos

- **CustomElement** `pop.CadastroProdutos A` (bTicJ) — USA Reusable pop.CadastroProdutos · props: custom_id="bTgZS"
- **Group** `Group A` (bTiZj) — data_source: Parent:cpo.QualCotacaoProduto · props: group_type="custom.tbl_orcamentoprodutos"
  - **Text** `Text A` (bTiZo) — text: "Novo Produto" · props: vertical_centering=False
    - ⟂ quando Parent:is_empty → text="Adicionar produto ao pedido"
    - ⟂ quando Parent:is_not_empty → text="Edita produto do pedido"
  - **Group** `Group A` (bTiZp) — props: vertical_centering=True
    - ⟂ quando This:is_hovered → boxshadow_blur=2
    - **Image** `abre cadastro produtos` (bTiZt) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733341112464x836081496925408500/pallet-solid%20blue.svg", title_attribute="Cadastro de produtos"
- **Group** `Group B` (bTiZv) — data_source: Parent:cpo.QualCotacaoProduto · props: group_type="custom.tbl_orcamentoprodutos"
  - **Group** `g Dropdown` (bTiaA) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
    - **Text** `Text B` (bTiaB) — text: "Tipo Produto"
    - **Dropdown** `dd add grupo produto` (bTiaF) — data_source: Search(Tbl.ProdutosGrupo; sort cpo.NomeGrupo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProdutoGrupo, dynamic_type="custom.tbl_produtossubgrupo", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeGrupo:to_capitalized_words}"
      - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
      - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
  - **Group** `g Dropdown` (bTiaG) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
    - **Text** `Text B` (bTiaH) — text: "Produto"
    - **Dropdown** `dd add modelo produto` (bTiaL) — data_source: Search(Tbl.ProdutosModelo: cpo.QualGrupoProduto equals El[dd add grupo produto]:get_data AND cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProduto, dynamic_type="custom.tbl_produtos", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
      - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
      - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
  - **Icon** `edita produto` (bTiaM) — props: icon="material outlined edit", vertical_centering=True, title_attribute="Editar produto"
- **Group** `Group C` (bTiaR) — data_source: Parent:cpo.QualCotacaoProduto · props: group_type="custom.tbl_orcamentoprodutos"
  - **Group** `g Dropdown` (bTiaT) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
    - **Text** `Text C` (bTiaY) — text: "Condição"
    - **Dropdown** `dd add condicao` (bTiaX) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisCondicoes · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.Condicao, dynamic_type="option.opt_produtoscondicao", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
      - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
      - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
  - **Group** `g Dropdown` (bTiaZ) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
    - **Text** `Text C` (bTiad) — text: "Linha"
    - **Dropdown** `dd add linha` (bTiae) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisLinhas · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.Linha, dynamic_type="option.opt_produtoslinhas", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
      - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
      - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
      - ⟂ quando El[dd add condicao]:get_data:equals(Opt.ProdutosCondicao.Usado) → default=Opt.ProdutosLinhas.Usado
  - **Group** `g Input` (bTiaf) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
    - **Text** `Text C` (bTiaj) — text: "Qtd"
    - **Input** `ip add qtd` (bTiak) — placeholder: "000" · content: Parent:cpo.qtd · content_format: "int_number" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
      - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
  - **Group** `g Input` (bTial) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
    - **Text** `Text C` (bTiap) — text: "Medida, descrição ou obs."
    - **Input** `ip add medida` (bTiaq) — placeholder: "00 x 00" · content: "{Parent:cpo.Medida}" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
      - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
  - **Icon** `add produto` (bTiav) — props: icon="fa fa-cart-arrow-down"
    - ⟂ quando Parent:is_empty → is_visible=True
    - ⟂ quando Parent:is_not_empty → is_visible=False
  - **Icon** `salvar produto` (bTiar) — props: icon="material outlined save"
    - ⟂ quando Parent:is_not_empty → is_visible=True
    - ⟂ quando Parent:is_empty → is_visible=False

## Workflows

#### WF bTiax — ButtonClicked em El[abre cadastro produtos]
1. **ShowElement** [bTibC] alvo El[pop.CadastroProdutos A]

#### WF bTibH — ButtonClicked em El[edita produto]
1. **ShowElement** [bTibJ] alvo El[pop.CadastroProdutos A]
2. **DisplayGroupData** [bTibN] alvo El[pop.CadastroProdutos A] · data_source=El[dd add modelo produto]:get_data

#### WF bTibP — ButtonClicked em El[salvar produto]
1. **ChangeThing** [bTibU] campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data · to_change=Parent
2. **ChangeThing** [bTigL] campos: cpo.QtdVenda = El[ip add qtd]:get_data · to_change=El[Reusable pop.AddEdita Produtos]:get_group_data
3. **ScheduleAPIEvent** [bTibZ] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=El[Reusable pop.AddEdita Produtos]:get_group_data:convert_to_list
4. **ResetGroup** [bTibb] alvo El[Reusable pop.AddEdita Produtos]
5. **HideElement** [bTieb] alvo El[Reusable pop.AddEdita Produtos]

#### WF bTibg — ButtonClicked em El[add produto]
- props: workflow_disabled=False
1. **NewThing** [bTicQ] tipo Tbl.CotacaoProdutos · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualCliente = El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QualCliente; cpo.QualCotacao = El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QualCotacao; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data
2. **NewThing** [bTicR] tipo Tbl.OrcFornecedoresCotacao · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.FreteFracionado = ∅; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.QtdVenda = El[ip add qtd]:get_data; cpo.QualCotacao = ResultOfStep[bTicQ]:cpo.QualCotacao; cpo.QualCotacaoProduto = ResultOfStep[bTicQ]; cpo.QualEnderecoDestino = El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:first_element:cpo.QualEnderecoDestino; cpo.QualEnderecoOrigem = El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QualPrimeiroFornecedor; cpo.QualEndereçoCobrança = El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QualPrimeiroFornecedor; cpo.QualFornecedor = El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QualPrimeiroFornecedor:cpo.QualGrupoCliFor; cpo.QualProposta = ∅; cpo.TipoFrete = ∅; cpo.TotalComissaoMegabox = ∅; cpo.TotalComissaoVendedor = ∅; cpo.TotalBonusExtra - deleted = ∅; cpo.ValorComissaoBruto = ∅; cpo.valorcomissao = ∅; cpo.ValorFrete = ∅; cpo.ValorICMS = ∅; cpo.ValorIPI = ∅; cpo.ValorPISCOFINS = ∅; cpo.ValorUnitLiquido = ∅; cpo.ValorVendaBruto = ∅; cpo.ValorVendaLiquido = ∅; cpo.ValorVendaUnit = ∅; cpo.Vencedor = True; cpo.QualVendedor = CurrentUser
3. **ChangeThing** [bTiea] campos: cpo.TotalBonusExtra - deleted = Search(Tbl.IcmsEstados):filtered(constraints={0={key="cpo_destino_option_opt_ufs", value=ResultOfStep[bTicR]:cpo.QualEnderecoDestino:cpo.QualUfOpt, constraint_type="equals"}, 1={key="cpo_origem_option_opt_ufs", value=ResultOfStep[bTicR]:cpo.QualEnderecoOrigem:cpo.QualUfOpt, constraint_type="equals"}}):first_element:cpo.AliquotaIcms; cpo.TotalComissaoVendedor = 0.0925 · to_change=ResultOfStep[bTicR]
4. **ChangeThing** [bTicX] campos: cpo.QuaisOrcamentosFonecedores = ResultOfStep[bTicR] · to_change=El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_
5. **ResetInputs** [bTicV] 
6. **HideElement** [bTicW] alvo El[Reusable pop.AddEdita Produtos]
7. **ScheduleAPIEvent** [bTieH] date=Page.Current Date/Time, api_event="bTNrd", _wf_param_linha=El[dd add linha]:get_data, _wf_param_medida="{El[ip add medida]:get_data}", _wf_param_destino=El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:first_element:cpo.QualEnderecoDestino, _wf_param_origens=El[Reusable pop.AddEdita Produtos]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:first_element:cpo.QualEnderecoOrigem:convert_to_list, _wf_param_condicao=El[dd add condicao]:get_data, _wf_param_qtd laco=1, _wf_param_vendedor=CurrentUser, _wf_param_fila laco=1, _wf_param_orcamentoproduto=ResultOfStep[bTicQ]

#### WF bTigj — ButtonClicked em El[Group A]
1. **ShowElement** [bTigp] alvo El[pop.CadastroProdutos A]

#### WF bTigv — PopupClosed em El[Reusable pop.AddEdita Produtos]
1. **ResetGroup** [bTigx] alvo El[Reusable pop.AddEdita Produtos]
