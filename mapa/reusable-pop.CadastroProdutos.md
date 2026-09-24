# Reusable: `pop.CadastroProdutos` (bTgZS)

Estados customizados: `var_quaisfornecedores_` : list.custom.tbl_enderecosclifor (lista)

Resumo: 111 elementos · 10 workflows · 22 ações · 20 condicionais · 1 estados customizados
Elementos por tipo: Text 26, Group 25, TableCell 20, TableMainAxis 10, Icon 4, Dropdown 4, TableCrossAxis 4, PictureInput 4, Button 3, select2-MultiDropdown 2, AutocompleteDropdown 2, Table 2, Input 1, MultiLineInput 1, RadioButtons 1, Image 1, Plugin[1680110374647x249108010620944400]/AAC 1

## Árvore de elementos

- **Group** `Group C` (bTgfd) — props: vertical_centering=True
  - **Text** `Text A` (bTgbi) — text: "Cadastro de Produtos" · props: font_alignment="center"
    - ⟂ quando El[gp dados do produto]:is_visible:and_(El[gp dados do produto]:get_group_data:is_not_empty) → text="Edita Produto"
    - ⟂ quando El[gp dados do produto]:is_visible:and_(El[gp dados do produto]:get_group_data:is_empty) → text="Novo Produto"
  - **Icon** `Icon C` (bTgfX) — props: icon="material outlined close", vertical_centering=True
- **Group** `gp dados do produto` (bTgZX) — data_source: Parent · props: group_type="custom.tbl_produtos"
  - ⟂ quando El[Reusable pop.CadastroProdutos]:get_group_data:is_not_empty → is_visible=True
  - ⟂ quando El[Reusable pop.CadastroProdutos]:get_group_data:is_empty → is_visible=False
  - **Group** `gp linha` (bTgZZ) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
    - **Group** `gp coluna A` (bTgaN) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
      - **Group** `gp nome` (bTgab) — data_source: Parent · props: group_type="custom.tbl_produtos"
        - **Text** `Text A` (bTgaf) — text: "Nome Modelo"
        - **Input** `ipt novo produto modelo` (bTgag) — content: "{Parent:cpo.NomeModelo:to_capitalized_words}" · props: mandatory=True
      - **Group** `gp tipo grupo` (bTgaO) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
        - **Group** `g Dropdown` (bTgaP) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgaT) — text: "Qual Tipo"
          - **Dropdown** `dd novo produto tipo` (bTgaU) — data_source: Search(Tbl.ProdutosTipo; sort cpo.NomeTipo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualTipoProduto, dynamic_type="custom.tbl_produtosgrupo", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:cpo.NomeTipo:to_capitalized_words}"
        - **Group** `g Dropdown` (bTgaV) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgaZ) — text: "Qual Grupo"
          - **Dropdown** `dd novo produto grupo` (bTgaa) — data_source: Search(Tbl.ProdutosGrupo: cpo.QualTipoProduto equals El[dd novo produto tipo]:get_data; sort cpo.NomeGrupo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualGrupoProduto, dynamic_type="custom.tbl_produtossubgrupo", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:cpo.NomeGrupo:to_capitalized_words}"
      - **Group** `gp tipo grupo copy 2` (bTgbP) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
        - **Group** `g Dropdown` (bTgbQ) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgbR) — text: "Qual Condição"
          - **select2-MultiDropdown** `dd novo produto condicao` (bTgbV) — data_source: All(Opt.ProdutosCondicao) · placeholder: "Selecione" · props: default=Parent:cpo.QuaisCondicoes, dynamic_type="option.opt_produtoscondicao", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_capitalized_words}"
        - **Group** `g Dropdown` (bTgbW) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgbX) — text: "Qual Linha"
          - **select2-MultiDropdown** `dd novo produto linha` (bTgbb) — data_source: All(Opt.ProdutosLinhas) · placeholder: "Selecione" · props: default=Parent:cpo.QuaisLinhas, dynamic_type="option.opt_produtoslinhas", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_capitalized_words}"
      - **Group** `gp add fornecedor` (bTgah) — data_source: Parent · props: group_type="custom.tbl_produtos"
        - **Group** `Group A` (bTgal) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
          - **AutocompleteDropdown** `ipt add fornecedor` (bTgan) — data_source: Search(Tbl.EnderecosCliFor: cpo.TipoClifor equals opt.TipoCliFor.Fornecedor AND cpo.Ativo equals True; sort cpo.NomeEndereco) · placeholder: "Adicionar fabricante desse produto" · props: field_to_search="cpo_nomeendere_o_text"
          - **Icon** `btn add fornecedor` (bTgam) — props: icon="material outlined save"
            - ⟂ quando El[ipt add fornecedor]:get_data:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **Table** `rpg fornecedores do produto` (bTgar) — data_source: Parent:cpo.QuaisFornecedoresFiliais · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, unique_id="remodela"
        - ⟂ quando Parent:is_empty → data_source=El[Reusable pop.CadastroProdutos]:custom.var_quaisfornecedores_
        - **TableMainAxis** `TableMainAxis A` (bTgas) — props: axis_index=0
        - **TableCrossAxis** `TableCrossAxis A` (bTgat) — props: axis_index=0, make_sticky=True
          - **TableCell** `Cell A` (bTgax) — props: cell_main_axis_id="bTgas"
            - **Text** `Text A` (bTgay) — text: "Fabricantes desse produto"
          - **TableCell** `Cell A` (bTgaz) — props: cell_main_axis_id="bTgbL"
        - **TableCrossAxis** `TableCrossAxis A` (bTgbD) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell A` (bTgbE) — props: cell_main_axis_id="bTgas"
            - **Text** `Text A` (bTgbF) — text: "{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
          - **TableCell** `Cell A` (bTgbJ) — props: cell_main_axis_id="bTgbL"
            - **Icon** `btn cut fornecedor` (bTgbK) — props: icon="material outlined delete"
        - **TableMainAxis** `TableMainAxis A` (bTgbL) — props: axis_index=2
    - **Group** `gp coluna B` (bTgZd) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
      - **Group** `gp descricao` (bTgaH) — data_source: Parent · props: group_type="custom.tbl_produtos"
        - **Text** `Text A` (bTgaI) — text: "Descrição"
        - **MultiLineInput** `ipt novo produto descrição` (bTgaJ) — placeholder: "Descrição do modelo" · content: "{Parent:cpo.Descricao}"
      - **Group** `gp pictures A` (bTgZe) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
        - **Group** `gp superior` (bTgZf) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgZj) — text: "Foto Superior"
          - **PictureInput** `upi novo produto superior` (bTgZk) — placeholder: "Anexar Foto" · props: src="{Parent:cpo.FotoSuperior}"
        - **Group** `gp inferior` (bTgZl) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgZp) — text: "Foto Inferior"
          - **PictureInput** `upi novo produto inferior` (bTgZq) — placeholder: "Anexar Foto" · props: src="{Parent:cpo.FotoInferior}"
      - **Group** `gp pictures B` (bTgZr) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
        - **Group** `gp frontal` (bTgaB) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgaC) — text: "Foto Frontal"
          - **PictureInput** `ipt novo produto frontal` (bTgaD) — placeholder: "Anexar Foto" · props: src="{Parent:cpo.FotoFrontal}"
        - **Group** `gp lateral` (bTgZv) — data_source: Parent · props: group_type="custom.tbl_produtos"
          - **Text** `Text A` (bTgZw) — text: "Foto Lateral"
          - **PictureInput** `upi novo produto lateral` (bTgZx) — placeholder: "Anexar Foto" · props: src="{Parent:cpo.FotoLateral}"
  - **Group** `Group A` (bTgbc) — data_source: Parent · props: group_type="custom.tbl_produtos", vertical_centering=True
    - **Button** `btn gravar novo produto` (bTgbd) — text: "Gravar"
      - ⟂ quando El[gp dados do produto]:get_group_data:is_not_empty → text="Salvar", bgcolor="var(--color_bTHHJ_default)"
    - **Button** `btn gravar novo produto copy` (bTgbh) — text: "Cancela"
      - ⟂ quando El[gp dados do produto]:get_group_data:is_not_empty → text="Cancela", border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)"
- **Group** `gp busca produto` (bTgbn) — props: vertical_centering=True
  - ⟂ quando El[gp dados do produto]:is_visible → is_visible=True
  - ⟂ quando El[gp dados do produto]:is_visible → is_visible=False
  - **Group** `Group B` (bTgbt) — props: vertical_centering=True
    - **AutocompleteDropdown** `src filter produto` (bTgbu) — data_source: Search(Tbl.ProdutosModelo; sort cpo.NomeCliFor) · placeholder: "Busca Produto" · props: no_language=True, field_to_search="cpo_nome_text"
    - **Dropdown** `src filter produto tipo` (bTgbv) — data_source: Search(Tbl.ProdutosTipo; sort cpo.NomeTipo) · placeholder: "Filtro tipo produto" · props: dynamic_type="custom.tbl_produtosgrupo", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeTipo:to_capitalized_words}"
    - **Dropdown** `src filter produto grupo` (bTgbz) — data_source: Search(Tbl.ProdutosGrupo: cpo.QualTipoProduto equals El[src filter produto tipo]:get_data; sort cpo.NomeGrupo) · placeholder: "Filtro grupo produto" · props: dynamic_type="custom.tbl_produtossubgrupo", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeGrupo:to_capitalized_words}"
    - **Group** `Group D` (bThof) — props: vertical_centering=True
      - **Text** `Text C` (bThol) — text: "Ativos" · props: vertical_centering=True
      - **RadioButtons** `rad ativos` (bThoh) — data_source: All(Opt.SimNão) · props: columns=3, default=Opt.SimNão.Ativos, dynamic_type="option.opt_simn_o", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Button** `btn novo cliente` (bTgbp) — text: "Novo Produto" · props: vertical_centering=True
- **Table** `rpg modelo produto` (bTgcB) — data_source: Search(Tbl.ProdutosModelo: cpo.NomeModelo equals "{El[src filter produto]:get_data:cpo.NomeModelo}" AND cpo.QualTipoProduto equals El[src filter produto tipo]:get_data AND cpo.QualGrupoProduto equals El[src filter produto grupo]:get_data AND cpo.Ativo equals El[rad ativos]:get_data:boolean; sort cpo.NomeModelo, ignore empty) · props: group_type="custom.tbl_produtos", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=8
  - ⟂ quando El[gp dados do produto]:is_visible → is_visible=True
  - ⟂ quando El[gp dados do produto]:is_visible → is_visible=False
  - **TableMainAxis** `TableMainAxis B` (bTgcG) — props: axis_index=3
  - **TableMainAxis** `TableMainAxis B` (bTgcL) — props: axis_index=2
  - **TableCrossAxis** `TableCrossAxis B` (bTgcM) — props: axis_index=1, cross_axis_repeat=True
    - **TableCell** `Cell B` (bTgcN) — props: cell_main_axis_id="bTgcG"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Text** `Text B` (bTgcR) — text: "{Ancestor[TableCrossAxis]:cpo.QualGrupoProduto:cpo.NomeGrupo:to_capitalized_words}"
    - **TableCell** `Cell B` (bTgcY) — props: cell_main_axis_id="bTgcL"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Text** `Text B` (bTgcZ) — text: "{Ancestor[TableCrossAxis]:cpo.QualTipoProduto:cpo.NomeTipo:to_capitalized_words}"
    - **TableCell** `Cell B` (bTgcd) — props: cell_main_axis_id="bTgda"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Text** `Text B` (bTgce) — text: "{Ancestor[TableCrossAxis]:cpo.NomeModelo:to_capitalized_words}"
    - **TableCell** `Cell B` (bTgcf) — props: cell_main_axis_id="bTgdb"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Image** `Image A` (bTgcj) — props: src="{Ancestor[TableCrossAxis]:cpo.QualTipoProduto:cpo.Icon}"
    - **TableCell** `Cell B` (bTgck) — props: cell_main_axis_id="bTgdf"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Text** `Text B` (bTgcl) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisCondicoes:display:to_capitalized_words}"
    - **TableCell** `Cell B` (bTgcp) — props: cell_main_axis_id="bTgdg"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Text** `Text B` (bTgcq) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisLinhas:display:to_capitalized_words}"
    - **TableCell** `Cell B` (bTgcr) — props: cell_main_axis_id="bTgdh"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Text** `Text B` (bTgcv) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisFornecedores - deleted:count}" · props: font_alignment="center"
    - **TableCell** `Cell B` (bTgcS) — props: cell_main_axis_id="bTgcH"
      - ⟂ quando CellIndex:modulo(2):equals(1) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
      - **Icon** `btn edita produto` (bTgcT) — props: icon="material outlined edit"
      - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTgcX) — auto_binding: True · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGs_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
  - **TableCrossAxis** `TableCrossAxis B` (bTgcw) — props: axis_index=0, make_sticky=True
    - **TableCell** `Cell B` (bTgcx) — props: cell_main_axis_id="bTgcG"
      - **Text** `Text B` (bTgdB) — text: "Grupo"
    - **TableCell** `Cell B` (bTgdD) — props: cell_main_axis_id="bTgcL"
      - **Text** `Text B` (bTgdH) — text: "Tipo"
    - **TableCell** `Cell B` (bTgdI) — props: cell_main_axis_id="bTgda"
      - **Text** `Text B` (bTgdJ) — text: "Modelo"
    - **TableCell** `Cell B` (bTgdN) — props: cell_main_axis_id="bTgdb"
    - **TableCell** `Cell B` (bTgdO) — props: cell_main_axis_id="bTgdf"
      - **Text** `Text B` (bTgdP) — text: "Condição"
    - **TableCell** `Cell B` (bTgdT) — props: cell_main_axis_id="bTgdg"
      - **Text** `Text B` (bTgdU) — text: "Linha"
    - **TableCell** `Cell B` (bTgdV) — props: cell_main_axis_id="bTgdh"
      - **Text** `Text B` (bTgdZ) — text: "Qtd Fornecedores" · props: font_alignment="center"
    - **TableCell** `Cell B` (bTgdC) — props: cell_main_axis_id="bTgcH"
  - **TableMainAxis** `TableMainAxis B` (bTgda) — props: axis_index=1
  - **TableMainAxis** `TableMainAxis B` (bTgdb) — props: axis_index=0
  - **TableMainAxis** `TableMainAxis B` (bTgdf) — props: axis_index=4
  - **TableMainAxis** `TableMainAxis B` (bTgdg) — props: axis_index=5
  - **TableMainAxis** `TableMainAxis B` (bTgdh) — props: axis_index=7
  - **TableMainAxis** `TableMainAxis B` (bTgcH) — props: axis_index=8

## Workflows

#### WF bTgdm — ButtonClicked em El[btn add fornecedor]
- condição: El[gp dados do produto]:get_group_data:is_empty
- props: event_color="blue"
1. **SetCustomState** [bTmNq] alvo El[Reusable pop.CadastroProdutos] · value=El[Reusable pop.CadastroProdutos]:custom.var_quaisfornecedores_:plus_element(El[ipt add fornecedor]:get_data), custom_state="custom.var_quaisfornecedores_"
2. **ResetGroup** [bTgdr] alvo El[gp add fornecedor]

#### WF bTgdt — ButtonClicked em El[btn add fornecedor]
- condição: El[gp dados do produto]:get_group_data:is_not_empty
- props: event_color="orange"
1. **ChangeThing** [bTmPR0] campos: cpo.QuaisProdutos = El[gp dados do produto]:get_group_data · to_change=El[ipt add fornecedor]:get_data
2. **ChangeThing** [bTgdy] campos: cpo.QuaisFornecedoresFiliais = El[ipt add fornecedor]:get_data · to_change=Parent
3. **ResetGroup** [bTgdz] alvo El[gp add fornecedor]

#### WF bTgeE — ButtonClicked em El[btn cut fornecedor]
- condição: El[gp dados do produto]:get_group_data:is_empty
- props: event_color="blue"
1. **SetCustomState** [bTmNw0] alvo El[Reusable pop.CadastroProdutos] · value=El[Reusable pop.CadastroProdutos]:custom.var_quaisfornecedores_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_quaisfornecedores_"

#### WF bTgeK — ButtonClicked em El[btn cut fornecedor]
- condição: El[gp dados do produto]:get_group_data:is_not_empty
- props: event_color="orange"
1. **ChangeThing** [bTmPQ0] campos: cpo.QuaisProdutos = El[gp dados do produto]:get_group_data · to_change=Ancestor[TableCrossAxis]
2. **ChangeThing** [bTgeP] campos: cpo.QuaisFornecedoresFiliais = Ancestor[TableCrossAxis] · to_change=El[gp dados do produto]:get_group_data

#### WF bTgeR — ButtonClicked em El[btn gravar novo produto]
- condição: El[gp dados do produto]:get_group_data:is_empty
- props: event_color="blue"
1. **NewThing** [bTgeW] tipo Tbl.ProdutosModelo · campos: cpo.Ativo = True; cpo.Descricao = "{El[ipt novo produto descrição]:get_data}"; cpo.FotoFrontal = "{El[ipt novo produto frontal]:get_data}"; cpo.FotoInferior = "{El[upi novo produto inferior]:get_data}"; cpo.FotoLateral = "{El[upi novo produto lateral]:get_data}"; cpo.FotoSuperior = "{El[upi novo produto superior]:get_data}"; cpo.NomeModelo = "{El[ipt novo produto modelo]:get_data:to_lowercase}"; cpo.QualGrupoProduto = El[dd novo produto grupo]:get_data; cpo.QualTipoProduto = El[dd novo produto tipo]:get_data; cpo.QuaisCondicoes = El[dd novo produto condicao]:get_data; cpo.QuaisLinhas = El[dd novo produto linha]:get_data; cpo.QuaisFornecedoresFiliais = El[Reusable pop.CadastroProdutos]:custom.var_quaisfornecedores_
2. **ChangeListOfThings** [bTgeX] campos: cpo.QualProdutoModelo = ResultOfStep[bTgeW] · to_change=ResultOfStep[bTgeW]:cpo.QuaisVersoesProduto, type_to_change="custom.tbl_produtovers_o"
3. **ChangeListOfThings** [bTmPV0] campos: cpo.QuaisProdutos = ResultOfStep[bTgeW] · to_change=ResultOfStep[bTgeW]:cpo.QuaisFornecedoresFiliais, type_to_change="custom.tbl_enderecosclifor"
4. **ResetGroup** [bTgeb] alvo El[Reusable pop.CadastroProdutos]
5. **SetCustomState** [bTmNx0] alvo El[Reusable pop.CadastroProdutos] · custom_state="custom.var_quaisfornecedores_"

#### WF bTged — ButtonClicked em El[btn gravar novo produto]
- condição: El[gp dados do produto]:get_group_data:is_not_empty
- props: event_color="orange"
1. **ChangeThing** [bTgei] campos: cpo.Descricao = "{El[ipt novo produto descrição]:get_data}"; cpo.FotoFrontal = "{El[ipt novo produto frontal]:get_data}"; cpo.FotoInferior = "{El[upi novo produto inferior]:get_data}"; cpo.FotoLateral = "{El[upi novo produto lateral]:get_data}"; cpo.FotoSuperior = "{El[upi novo produto superior]:get_data}"; cpo.NomeModelo = "{El[ipt novo produto modelo]:get_data:to_lowercase}"; cpo.QualGrupoProduto = El[dd novo produto grupo]:get_data; cpo.QualTipoProduto = El[dd novo produto tipo]:get_data; cpo.QuaisCondicoes = El[dd novo produto condicao]:get_data; cpo.QuaisLinhas = El[dd novo produto linha]:get_data · to_change=Parent
2. **ResetGroup** [bTgej] alvo El[Reusable pop.CadastroProdutos]

#### WF bTgep — ButtonClicked em El[btn gravar novo produto copy]
1. **ResetGroup** [bTgeu] alvo El[Reusable pop.CadastroProdutos]
2. **HideElement** [bTgiR] alvo El[gp dados do produto]

#### WF bTgfA — ButtonClicked em El[btn novo cliente]
1. **ShowElement** [bTgfT] alvo El[gp dados do produto]

#### WF bTgfl — ButtonClicked em El[Icon C]
1. **ResetGroup** [bTgfr] alvo El[gp dados do produto]
2. **HideElement** [bTgfv] alvo El[Reusable pop.CadastroProdutos]

#### WF bTgfH — ButtonClicked em El[btn edita produto]
1. **DisplayGroupData** [bTgfM] alvo El[Reusable pop.CadastroProdutos] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bThkq] alvo El[gp dados do produto]
