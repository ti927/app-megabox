# Pagina: `vendas` (bTJrH)

Estados customizados: `var_showalert_` : boolean; `var_a__ovendas_` : Opt.Ações; `var_usaroldpdf_` : boolean; `var_a__oor_amento_` : Opt.Ações; `var_ultimotblpedido_` : Tbl.Pedido; `var_todosetapacotacao_` : boolean; `var_todosfornecedores_` : boolean; `var_ultimoemailcliente_` : text

Resumo: 1311 elementos · 167 workflows · 387 ações · 390 condicionais · 18 estados customizados
Elementos por tipo: Text 352, Group 247, TableCell 234, TableMainAxis 115, Icon 96, Input 62, TableCrossAxis 43, Button 35, Dropdown 25, Table 21, Image 18, CustomElement 13, Popup 10, MultiLineInput 7, PictureInput 6, DateInput 5, AutocompleteDropdown 3, Plugin[1680110374647x249108010620944400]/AAC 3, RepeatingGroup 2, FileInput 2, select2-MultiDropdown 2, Plugin[1648430145817x673906689668022300]/AAc 2, HTML 2, Plugin[1648823245313x509054419018711040]/AAC 1, multifileupload-MultiFileInput 1, Plugin[1680110374647x249108010620944400]/AAx 1, RadioButtons 1, Link 1, Checkbox 1

## Árvore de elementos

- **Popup** `pop.ArquivaCotação` (bTlCd) — props: group_type="custom.tbl_orcamento", vertical_centering=True
  - **Text** `Text CZZZZZZZZZ` (bTlDP) — text: "Arquivando Cotação" · props: font_alignment="center"
  - **Group** `Group MZZZZZZ` (bTlCj) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Group** `Group MZZZZZZ` (bTlDD) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Image** `Image Q` (bTlDH) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
        - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
    - **Group** `Group MZZZZZZ` (bTlCl) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Text** `Text BZZZZZZZZZ` (bTlCp) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}- Nº {Parent:cpo.CotacaoNum}"
      - **Text** `Text BZZZZZZZZZ` (bTlCq) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
      - **Text** `Text BZZZZZZZZZ` (bTlCr) — text: "[b]Dt Cotação[/b]: {Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
  - **Dropdown** `dd selecione o motivo` (bTlDJ) — data_source: All(Opt.MotivoArquivamento):sorted(descending=False, sort_field="display") · placeholder: "Selecione o motivo" · props: mandatory=True, default=Parent:cpo.MotivoArquivamento, vertical_centering=True, dynamic_type="option.opt_motivoarquivamento", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Button** `Button CZ` (bTlDV) — text: "Arquivar" · props: icon="material outlined archive", icon_size=18, button_type="label_icon"
- **CustomElement** `pop.DuplicarPedido A` (bUAdS) — USA Reusable pop.DuplicarPedido · props: floating_reference="top", custom_id="bUAJN", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Group** `gp content` (bTdHf) — props: vertical_centering=True
  - **Group** `gp tabs` (bTJyX) — props: vertical_centering=True
    - **Group** `Group XZZZZZ` (bTiUf) — props: vertical_centering=True
      - **Text** `Text QZZZZZZZZ` (bTiUN) — text: "Data criação (Cotação e Pedido)"
      - **Group** `gp filter datapedido` (bTiWv)
        - **Plugin[1648823245313x509054419018711040]/AAC** `RangePicker A` (bTiXd) — props: padding_horizontal=6, padding_vertical=15, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAH="DD/MM/YY", AAM=2, AAN=2, AAP="Aplicar", AAQ="Cancelar", AAR=False, AAS=False, AAf="DD/MM/YYYY - DD/MM/YYYY"
          - ⟂ quando This:is_hovered → 
        - **Icon** `Icon H` (bTiWh) — props: icon="material two-tone event_repeat", vertical_centering=True
    - **Group** `Group BZZZZZZ` (bTiXj) — props: vertical_centering=True
      - **Text** `Text RZZZZZZZZ` (bTiXl) — text: "Vendedor"
      - **Group** `gp filtervendedor` (bTiXp)
        - **Dropdown** `dd filter vendedor` (bTiXq) — data_source: Search(User; sort cpo.NomeModelo) · placeholder: "Vendedor" · props: default=UrlParam("vendedor" as user), vertical_centering=True, dynamic_type="user", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
          - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) → default=CurrentUser, disabled=True
        - **Icon** `Icon EZZ` (bTiXr) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[dd filter vendedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group YZZZZZ` (bTiUq) — props: vertical_centering=True
      - **Text** `Text SZZZZZZZZ` (bTiUZ) — text: "Número pedido"
      - **Group** `gp filter numpedido` (bTcwa0)
        - **Input** `ipt filter numpedido` (bTcwH0) — placeholder: "Número pedido" · content: "{UrlParam("numeropedido" as None)}" · props: placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `Icon Q` (bTcwU0) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[ipt filter numpedido]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group IZZZZZZ` (bTjPh) — props: vertical_centering=True
      - **Text** `Text XZZZZZZZZ` (bTjPj) — text: "Cliente"
      - **Group** `gp filter cliente` (bTjPn)
        - **AutocompleteDropdown** `ipt filter cliente` (bTjPo) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Nome Cliente" · props: default=UrlParam("cliente" as custom.tbl_clientes), field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `Icon EZZZ` (bTjPp) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[ipt filter cliente]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group AZZZZZZ` (bTiXM) — props: vertical_centering=True
      - **Button** `btn cotacao arquivada` (bTaTT) — text: "cotações arquivadas" · props: icon="material outlined archive", icon_size=18, button_type="label_icon", title_attribute="Exibe cotações arquivadas: {UrlParam("cotacaoarquivada" as boolean)}"
        - ⟂ quando UrlParam("cotacaoarquivada" as boolean):is_true → icon="material filled archive", font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn data crescente` (bTaTx) — text: "data crescente" · props: icon="fa fa-sort-numeric-asc", icon_size=14, button_type="label_icon", title_attribute="Ordem +novo pro +antigo: {UrlParam("ordemdecrescente" as boolean)}"
        - ⟂ quando UrlParam("ordemdecrescente" as boolean):is_false → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn expandir cartoes` (bTaGh) — text: "expandir cartões" · props: icon="fa fa-angle-double-down", icon_size=16, button_type="label_icon", title_attribute="Expande todos cartões"
        - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn pedidosconcluidos` (bTfTJ0) — text: "exibe concluídos" · props: icon="fa fa-flag-checkered", icon_size=16, button_type="label_icon", title_attribute="Exibe pedidos concluidos"
        - ⟂ quando UrlParam("pedidosconcluidos" as boolean):is_true → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn entregascanceladas` (bTiVJ) — text: "exibe cancelados" · props: icon="material outlined event_busy", icon_size=16, button_type="label_icon", title_attribute="Exibe pedidos e entregas canceladas"
        - ⟂ quando UrlParam("etapapedido" as option.opt_etapas):display:equals("Cancelado") → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
    - **Button** `btn nova cotação` (bTJyc) — text: "Cotação" · props: icon="fa fa-plus", vertical_centering=True, icon_size=16, button_type="label_icon"
  - **Table** `Table etapas` (bTPsX) — data_source: All(Opt.Etapas) · props: group_type="option.opt_etapas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=4, horizontal_separator_style="none"
    - **TableCrossAxis** `TableCrossAxis J` (bTPtj) — props: axis_index=2, cross_axis_repeat=True, fixed_number_repeating_axis=True
      - **TableCell** `Cell LZZZ` (bTPtk) — props: cell_main_axis_id="bTPtT"
        - **Table** `rpg cardscotacao` (bTPwA) — data_source: Search(Tbl.Cotacao: cpo.CotacaoEtapa equals Opt.Etapas.Cotação AND cpo.Arquivado equals UrlParam("cotacaoarquivada" as boolean) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.CotacaoNum equals UrlParam("numeropedido" as number) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_orcamento", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes"):and_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor)) → data_source=Search(Tbl.Cotacao: cpo.CotacaoEtapa not equal Opt.Etapas.Cancelado AND cpo.Arquivado equals UrlParam("cotacaoarquivada" as boolean) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.CotacaoNum equals UrlParam("numeropedido" as number) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty)
          - **TableMainAxis** `TableMainAxis AZZ` (bTPxB) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis K` (bTPxJ) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell QZZZ` (bTPxP) — props: cell_main_axis_id="bTPxB"
              - **Group** `gp card cotacao` (bTPzX) — props: vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → bgcolor="var(--color_bTHGh_default)"
                - **Group** `Group RZ` (bTPxm) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group CZZZZZZ` (bTihZ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image N` (bTPxs) — props: src="{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group SZ` (bTPyK) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text PZZZZ` (bTPxy) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}- Nº {Ancestor[TableCrossAxis]:cpo.CotacaoNum}"
                    - **Text** `Text QZZZZ` (bTPyE) — text: "[b]Vendedor[/b]: {Ancestor[TableCrossAxis]:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text ZZ` (bTihB) — text: "[b]Dt Cotação[/b]: {Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                    - **Group** `Group Tbl.Cotacao` (bTlDr) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → is_visible=True
                      - **Button** `btn retira pedido` (bTlDx) — text: "{Parent:cpo.MotivoArquivamento:display}" · props: icon="ionic outlined archive", font_alignment="left", icon_size=16, button_type="label_icon", title_attribute="retira o pedido da lista após entregas feitas e/ou canceladas"
                        - ⟂ quando Parent:cpo.MotivoArquivamento:is_empty → text="{∅}Motivo não disponível"
                  - **Group** `Group ZZ` (bTQBt) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `btn edita orcamento` (bTQBJ) — props: icon="material outlined edit", title_attribute="Editar cotação"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true:and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                    - **Group** `btn addedita proposta` (bTQBX) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → button_disabled=True
                      - ⟂ quando El[ipt cartão contaproduto]:get_data:greater_or_equal_than(1):and_(El[ipt cartao contavencedor]:get_data:greater_or_equal_than(1)) → is_visible=True
                      - **Icon** `ico proposta` (bTQBc) — props: icon="material filled receipt", title_attribute="Propostas dessa cotação: {Ancestor[TableCrossAxis]:cpo.QuaisPropostas:count}"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → icon_color="var(--color_bTHGl_default)"
                      - **Text** `Text UZZZZ` (bTQBd) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisPropostas:count}" · props: font_alignment="center"
                - **Group** `gp resumo cotacao` (bTPyb) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Group** `Group UZ` (bTPyt) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica fornecedores` (bTPyz) — props: icon="fa fa-shopping-cart", vertical_centering=True, title_attribute="Qtd de fornecedores dessa cotação"
                    - **Text** `Text RZZZZ` (bTPyv) — text: "{Parent:cpo.QuaisProdutos:count}  produtos no carrinho"
                  - **Group** `Group VZ` (bTPzB) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica vencedor` (bTPzH) — props: icon="fa fa-trophy", vertical_centering=True
                    - **Text** `Text SZZZZ` (bTPzG) — text: "{Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count}  produtos possuem vencedores"
                  - **Group** `Group WZ` (bTPzM) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica vencedor` (bTPzS) — props: icon="fa fa-file-text", vertical_centering=True
                    - **Text** `Text TZZZZ` (bTPzR) — text: "{Parent:cpo.QuaisPropostas:count} propostas enviadas"
                    - **Icon** `btn arquivar` (bTaPc) — props: icon="material filled archive", title_attribute="Arquivar cotação"
                      - ⟂ quando Parent:cpo.Arquivado:is_true → icon="material filled unarchive", icon_color="var(--color_bTHGs_default)", title_attribute="Desarquivar cotação{∅}"
                - **Input** `ipt cartão contaproduto` (bTcui) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisProdutos:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                - **Input** `ipt cartao contavencedor` (bTcuo) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
          - **TableCrossAxis** `TableCrossAxis K` (bTPxC) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell QZZZ` (bTPxI) — props: cell_main_axis_id="bTPxB"
      - **TableCell** `Cell LZZZ` (bTPtl) — props: cell_main_axis_id="bTPtX"
        - **Table** `rpg cardspedidos` (bTbYj) — data_source: Search(Tbl.Pedido: cpo.PedidoFinalizado equals UrlParam("pedidosconcluidos" as boolean) AND _id {'type': 'Empty'} UrlParam("filtrafinanceiro" as custom.tbl_pedidos):_id AND _id {'type': 'Empty'} UrlParam("filtraentrega" as custom.tbl_pedidos):_id AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualEtapa equals UrlParam("etapapedido" as option.opt_etapas) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_pedidos", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis KZZ` (bTbYl) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis P` (bTbYp) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell HZZZZ` (bTbYq) — props: cell_main_axis_id="bTbYl"
              - **Group** `gp card pedido` (bTbYr) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:equals(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count)) → bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                - ⟂ quando UrlParam("filtrapedido" as None):equals(Ancestor[TableCrossAxis]:_id):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])) → boxshadow_spread=2
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEtapa:equals(Opt.Etapas.Cancelado) → bgcolor="rgba(var(--color_destructive_default_rgb), 0.05)"
                - **Icon** `chk filtrapedido` (bTclb0) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
                  - ⟂ quando UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Parent)) → is_visible=False
                - **Group** `Group RZZ` (bTbYv) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group DZZZZZZ` (bTihg) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image K` (bTbYw) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group RZZ` (bTbYx) — data_source: Ancestor[TableCrossAxis]:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTbZB) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:cpo.NumeroPedido}" · props: vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTbZC) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text TZZZZZZZZ` (bTihH) — text: "[b]Dt Pedido[/b]: {Parent:cpo.QualPedido:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                    - **Text** `Text DZZZZZZZZZ` (bTlYx0) — oculto ao carregar · text: "[b]Cancelado[/b]: {Ancestor[TableCrossAxis]:cpo.MotivoCancelamento}" · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEtapa:equals(Opt.Etapas.Cancelado) → is_visible=True
                    - **Group** `Group CZZZZZ` (bTfSB) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(El[ipt cartao contaentregas]:get_data:equals(El[ipt cartão entragasconcluidas]:get_data)) → is_visible=True
                      - **Input** `ipt cartao contaentregas` (bTldR) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                      - **Input** `ipt cartão entragasconcluidas` (bTldX) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                      - **Text** `Text WZZZZZZ` (bTbzH) — text: "Entregas concluidas"
                      - **Dropdown** `dd qual cliente email` (bUEjZ) — data_source: Parent:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Qual email cliente?" · props: mandatory=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.Email}"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.PedidoFinalizado:is_true → is_visible=False
                      - **Button** `btn retira pedido` (bTfPB) — text: "retira pedido" · props: icon="material outlined playlist_remove", icon_size=22, button_type="label_icon", title_attribute="retira o pedido da lista após entregas feitas e/ou canceladas"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.PedidoFinalizado:is_true → is_visible=False
                  - **Group** `Group RZZ` (bTbZH) — props: vertical_centering=True
                    - **Icon** `Icon fa fa-star-o` (bTsCt1) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Text("Os valores desse pedido foram alterados pelo financeiro pelo seguinte motivo: {Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores}")}"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores:is_not_empty → is_visible=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores:is_empty → is_visible=False
                    - **Icon** `btn edita pedido` (bTbZO) — props: icon="material outlined edit", title_attribute="editar pedido"
                    - **Icon** `Icon GZZZ` (bTzlT) — oculto ao carregar · props: icon="material outlined copy_all", vertical_centering=True, title_attribute="Duplicar Cotação"
                - **Group** `gp produtos pedido` (bUAgS) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **RepeatingGroup** `rpg show produtos pedido` (bTbaW) — data_source: Parent:cpo.QuaisEntregas · props: group_type="custom.tbl_entregas", separator_style="none", fixed_rows=False, cell_min_height_css="25px"
                    - **Group** `Group RZZ` (bTbZf) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                      - **Text** `indica vencedor` (bTbZl) — text: "{Parent:cpo.QtdEntrega}" · props: font_alignment="center", vertical_centering=True
                      - **Text** `Text EZZZZZZ` (bTbZh) — text: "{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                        - ⟂ quando Parent:cpo.SaiuEntrega:is_true:and_(Parent:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → text="{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - NF: {Parent:cpo.NumNfFornecedor}", font_color="var(--color_bTHHX_default)", font_weight="600"
                        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - NF: {Parent:cpo.NumNfFornecedor}", font_color="var(--color_bTHHQ_default)", font_weight="600"
                  - **Icon** `ico cancela pedido` (bTbZJ) — props: icon="material outlined event_busy", title_attribute="cancelar todo o pedido e entregas"
                    - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:equals(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **TableCrossAxis** `TableCrossAxis P` (bTbZm) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell HZZZZ` (bTbZn) — props: cell_main_axis_id="bTbYl"
      - **TableCell** `Cell LZZZ` (bTPtp) — props: cell_main_axis_id="bTPtY"
        - **Table** `rpg cardsentregas` (bTbxZ) — data_source: Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DtPedido gte UrlParam("datainicio" as date) AND cpo.DtPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_entregas", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes") → data_source=Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty)
          - **TableMainAxis** `TableMainAxis NZZ` (bTbxb) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis R` (bTbxf) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell LZZZZ` (bTbxg) — props: cell_main_axis_id="bTbxb"
              - **Group** `gp card entrega` (bTbxh) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → bgcolor="rgba(var(--color_destructive_default_rgb), 0.05)"
                - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → boxshadow_spread=2
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → bgcolor="var(--color_bTHHW_default)"
                - **Icon** `chk filtraentrega` (bTckg) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido) → icon="material outlined check_box"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → is_visible=False
                - **Group** `Group OZZZ` (bTbxl) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - **Group** `Group EZZZZZZ` (bTihn) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Image** `Image L` (bTbxm) — props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group OZZZ` (bTbxn) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text UZZZZZZ` (bTbxr) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:cpo.NumeroPedido} - NF: {Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: vertical_centering=True
                    - **Text** `Text UZZZZZZ` (bTbxs) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text UZZZZZZZZ` (bTihN) — text: "[b]Dt Pedido[/b]: {Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                      - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes") → text="[b]Dt Entrega:[/b] {Ancestor[TableCrossAxis]:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
                    - **Text** `Text EZZZZZZZZZ` (bTlZD0) — oculto ao carregar · text: "[b]Cancelado[/b]: {Ancestor[TableCrossAxis]:cpo.MotivoCancelamento}" · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=True
                  - **Group** `Group OZZZ` (bTbxx) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Icon** `Icon fa fa-star-o` (bTsDD1) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Text("Os valores desse pedido foram alterados pelo financeiro pelo seguinte motivo: {Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores}")}"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_not_empty → is_visible=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_empty → is_visible=False
                    - **Icon** `btn edita pedido` (bTbyE) — props: icon="material outlined edit", title_attribute="edita pedido"
                      - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                    - **Group** `Group PZZZ` (bThEU) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                      - ⟂ quando This:is_hovered → boxshadow_blur=2
                      - **Image** `ico proposta` (bTbxz) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268292968x358240139627571200/truck-ramp-box-solid%20blue.svg"
                        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268301221x827639874525786900/truck-ramp-box-solid%20grey.svg", button_disabled=True
                        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268301221x827639874525786900/truck-ramp-box-solid%20grey.svg", button_disabled=True
                - **Group** `gp detalhes entrega` (bTbyJ) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Text** `indica vencedor` (bTbyL) — text: "{Parent:cpo.QtdEntrega}" · props: font_alignment="center", vertical_centering=True
                  - **Text** `Text UZZZZZZ` (bTbyK) — text: "{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
          - **TableCrossAxis** `TableCrossAxis R` (bTbyP) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell LZZZZ` (bTbyQ) — props: cell_main_axis_id="bTbxb"
      - **TableCell** `Cell NZZZ` (bTPuD) — props: cell_main_axis_id="bTPtr"
        - **Table** `rpg cardsentregas` (bTzTB) — data_source: Search(Tbl.Entregas: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DtPedido gte UrlParam("datainicio" as date) AND cpo.DtPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualVendedorSubstituto equals UrlParam("vendedor" as user) AND cpo.StatusEntrega not equal Opt.Etapas.Financeiro AND cpo.StatusEntrega not equal Opt.Etapas.Cancelado; sort Created Date desc, ignore empty) · props: group_type="custom.tbl_entregas", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis SZZ` (bTzTD) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis T` (bTzTH) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell TZZZZ` (bTzTI) — props: cell_main_axis_id="bTzTD"
              - **Group** `gp card entrega` (bTzTJ) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → bgcolor="rgba(var(--color_destructive_default_rgb), 0.05)"
                - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → boxshadow_spread=2
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → bgcolor="var(--color_bTHHW_default)"
                - **Icon** `chk filtraentrega` (bTzTs) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido) → icon="material outlined check_box"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → is_visible=False
                - **Group** `Group YZZZ` (bTzTN) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - **Group** `Group YZZZ` (bTzTh) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Image** `Image M` (bTzTl) — props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group YZZZ` (bTzTO) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text LZZZZZZZ` (bTzTP) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:cpo.NumeroPedido} - NF: {Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: vertical_centering=True
                    - **Text** `Text LZZZZZZZ` (bTzTT) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text LZZZZZZZ` (bTzTU) — text: "[b]Dt Pedido[/b]: {Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                      - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes") → text="[b]Dt Entrega:[/b] {Ancestor[TableCrossAxis]:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
                    - **Text** `Text LZZZZZZZ` (bTzTV) — oculto ao carregar · text: "[b]Cancelado[/b]: {Ancestor[TableCrossAxis]:cpo.MotivoCancelamento}" · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=True
                  - **Group** `Group YZZZ` (bTzTZ) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Icon** `Icon fa fa-star-o` (bTzTg) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Text("Os valores desse pedido foram alterados pelo financeiro pelo seguinte motivo: {Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores}")}"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_not_empty → is_visible=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_empty → is_visible=False
                    - **Icon** `btn edita pedido` (bTzTa) — props: icon="material outlined edit", title_attribute="edita pedido"
                      - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                    - **Group** `Group YZZZ` (bTzTb) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                      - ⟂ quando This:is_hovered → boxshadow_blur=2
                      - **Image** `ico proposta` (bTzTf) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268292968x358240139627571200/truck-ramp-box-solid%20blue.svg"
                        - ⟂ quando Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Em Entrega) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268301221x827639874525786900/truck-ramp-box-solid%20grey.svg", button_disabled=True
                - **Group** `gp detalhes entrega` (bTzTm) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Text** `indica vencedor` (bTzTr) — text: "{Parent:cpo.QtdEntrega}" · props: font_alignment="center", vertical_centering=True
                  - **Text** `Text LZZZZZZZ` (bTzTn) — text: "{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
          - **TableCrossAxis** `TableCrossAxis T` (bTzTt) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell TZZZZ` (bTzTx) — props: cell_main_axis_id="bTzTD"
    - **TableMainAxis** `TableMainAxis XZ` (bTPtT) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis XZ` (bTPtX) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis XZ` (bTPtY) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis J` (bTPtZ) — props: axis_index=0
      - **TableCell** `Cell LZZZ` (bTPtd) — props: cell_main_axis_id="bTPtT"
        - **Text** `Text KZZZZ` (bTPuz) — text: "Cotação"
      - **TableCell** `Cell LZZZ` (bTPte) — props: cell_main_axis_id="bTPtX"
        - **Text** `Text LZZZZ` (bTPvF) — text: "Pedido"
      - **TableCell** `Cell LZZZ` (bTPtf) — props: cell_main_axis_id="bTPtY"
        - **Text** `Text MZZZZ` (bTPvP) — text: "Entregas Próprias"
      - **TableCell** `Cell MZZZ` (bTPtx) — props: cell_main_axis_id="bTPtr"
        - **Text** `Text NZZZZ` (bTPvW) — text: "Entregas Substituto"
    - **TableMainAxis** `TableMainAxis YZ` (bTPtr) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis L` (bTQrh) — props: axis_index=1
      - **TableCell** `Cell RZZZ` (bTQsF) — props: cell_main_axis_id="bTPtT"
        - **Text** `Text XZZZZ` (bTZAt) — text: "{Search(Tbl.Cotacao: cpo.CotacaoEtapa equals Opt.Etapas.Cotação AND cpo.Arquivado equals UrlParam("cotacaoarquivada" as boolean) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.CotacaoNum equals UrlParam("numeropedido" as number) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty):count} cotações {∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTQsG) — props: cell_main_axis_id="bTPtX"
        - **Text** `Text XZZZZZZ` (bTcwB0) — text: "{Search(Tbl.Pedido: Created By equals UrlParam("vendedor" as user) AND cpo.PedidoFinalizado equals UrlParam("pedidosconcluidos" as boolean) AND _id {'type': 'Empty'} UrlParam("filtrafinanceiro" as custom.tbl_pedidos):_id AND _id {'type': 'Empty'} UrlParam("filtraentrega" as custom.tbl_pedidos):_id AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualEtapa equals UrlParam("etapapedido" as option.opt_etapas) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):count} pedidos{∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTQsH) — props: cell_main_axis_id="bTPtY"
        - **Text** `Text PZZZZZZZZ` (bTiTo) — oculto ao carregar · text: "Total Faturado: ⏎{Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date); sort Created Date desc, ignore empty):cpo.ValorVendaLiquido:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}{∅}{∅}" · props: font_alignment="center"
        - **Text** `Text FZZZZZZZZZ` (bTlhr) — oculto ao carregar · text: " {Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.DtPedido gte UrlParam("datainicio" as date) AND cpo.DtPedido lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):count} Entregas{∅}{∅}" · props: font_alignment="center"
        - **Text** `Text GZZZZZZZZZ` (bTliD) — oculto ao carregar · text: "Total Comissão: ⏎{Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date); sort Created Date desc, ignore empty):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}{∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTQsL) — props: cell_main_axis_id="bTPtr"
        - **Text** `Text G` (bTeXo) — text: "{∅}"
- **CustomElement** `pop.CadastroClienteFornecedor A` (bThVR) — USA Reusable pop.CadastroCliFor · props: custom_id="bTgrH"
- **Popup** `pop edita produtos do pedido` (bThqj) — props: group_type="custom.tbl_pedidos", vertical_centering=True
  - **Group** `Group JZZZZZ` (bThxP) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Text** `Text CZZZZZZZZ` (bThxD) — text: "Edita Produtos" · props: font_alignment="center"
    - **Icon** `Icon HZZ` (bThxJ) — props: icon="material outlined close", vertical_centering=True
  - **Button** `Button BZ` (bTicc) — text: "Novo Produto" · props: vertical_centering=True
  - **Table** `rpg fornecedoresprodutos` (bThqp) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
    - **TableMainAxis** `TableMainAxis VZ` (bThqr) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis VZ` (bThqv) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis VZ` (bThqw) — props: axis_index=4
    - **TableCrossAxis** `TableCrossAxis U` (bThqx) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell Z` (bThrB) — props: cell_main_axis_id="bThqr"
        - **Text** `Text FZZZZ` (bThvF) — text: "Produto"
      - **TableCell** `Cell Z` (bThrC) — props: cell_main_axis_id="bThqv"
        - **Text** `Text GZZZZ` (bThvP) — text: "Qtd"
      - **TableCell** `Cell Z` (bThrD) — props: cell_main_axis_id="bThqw"
        - **Text** `Text HZZZZ` (bThvV) — text: "Valor Comiss"
      - **TableCell** `Cell Z` (bThrH) — props: cell_main_axis_id="bThsb"
        - **Text** `Text OZZZZ` (bThvb) — text: "Tipo Frete"
      - **TableCell** `Cell Z` (bThrI) — props: cell_main_axis_id="bThsc"
        - **Text** `Text NZZZZZZZ` (bThvh) — text: "Valor Frete"
      - **TableCell** `Cell Z` (bThrJ) — props: cell_main_axis_id="bThsd"
        - **Text** `Text QZZZZZZZ` (bThvt) — text: "Aliq. ICMS" · props: font_alignment="center"
        - **Text** `Text XZZZZZZZ` (bThvz) — text: "Aliq. PISCOFINS" · props: font_alignment="center"
        - **Text** `Text YZZZZZZZ` (bThwF) — text: "Total Tributos" · props: font_alignment="center"
      - **TableCell** `Cell Z` (bThrN) — props: cell_main_axis_id="bThsh"
        - **Text** `Text OZZZZZZZ` (bThwL) — text: "Total Bruto"
      - **TableCell** `Cell Z` (bThrP) — props: cell_main_axis_id="bThsj"
        - **Text** `Text AZZZZZZZZ` (bThwX) — text: "Comiss Bruto"
      - **TableCell** `Cell OZZZZ` (bTidR) — props: cell_main_axis_id="bTidL"
      - **TableCell** `Cell WZZZZ` (bTifc) — props: cell_main_axis_id="bTifQ"
      - **TableCell** `Cell Z` (bThrU) — props: cell_main_axis_id="bThso"
        - **Text** `Text ZZZZZZZZ` (bThwR) — text: "Total Liq"
      - **TableCell** `Cell HZZZ` (bThwp) — props: cell_main_axis_id="bThwj"
        - **Text** `Text BZZZZZZZZ` (bThwr) — text: "Valor Unit"
    - **TableCrossAxis** `TableCrossAxis U` (bThrV) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell Z` (bThrZ) — props: cell_main_axis_id="bThqr"
        - **Group** `Group SZZZZZZ` (bToYC) — props: vertical_centering=True
          - **Text** `Text DZZZZ` (bThra) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
          - **Text** `Text DZZZZ` (bThrb) — text: "{Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Condicao:display}"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:is_empty → text="{∅}Falta regime tributário"
          - **Text** `Text WZZZZZZZZ` (bTiqI) — oculto ao carregar · text: "Esse produto possui entrega(s) lançadas e não pode ser editado"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=True
        - **Icon** `Icon M` (bToXv) — props: icon="material outlined calculate", vertical_centering=True, title_attribute="recalcula valores do pedido"
      - **TableCell** `Cell Z` (bThrf) — props: cell_main_axis_id="bThqv"
        - **Input** `ip valorvenda` (bThrg) — placeholder: "000" · auto_binding: True · content_format: "int_number" · props: font_alignment="center", word_spacing=-0.5, unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_qtdvenda_number"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bThrh) — props: cell_main_axis_id="bThqw"
        - **Input** `ip valorcomissao` (bThrl) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bThrm) — props: cell_main_axis_id="bThsb"
        - **Dropdown** `dd tipofrete` (bThrn) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, default=Opt.TipoFrete.FOB, font_alignment="center", word_spacing=-0.5, bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bThrr) — props: cell_main_axis_id="bThsc"
        - **Input** `ip valorfrete` (bThrs) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando El[dd tipofrete]:get_data:not_equals(Opt.TipoFrete.CIF Informado) → content=0, bgcolor="var(--color_bTHGh_default)", disabled=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bThrt) — props: cell_main_axis_id="bThsd"
        - **Group** `Group IZZZZZ` (bThrz) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
          - **Input** `ip icms` (bThsE) — placeholder: "ICMS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
            - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → content=Search(Tbl.IcmsEstados):filtered(constraints={0={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoDestino:cpo.UF:equals(InjectedValue:cpo.Destino:display), constraint_type=∅}, 1={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoOrigem:cpo.UF:equals(InjectedValue:cpo.Origem:display), constraint_type=∅}}):first_element:cpo.AliquotaIcms
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
          - **Icon** `Icon BZZZ` (bThsD) — props: icon="material outlined search"
        - **Input** `ip piscofins` (bThry) — placeholder: "PIS/COFINS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=True, border_roundness_left=0
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
        - **Input** `ipt calculotributo` (bThrx) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS:plus(Ancestor[TableCrossAxis]:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell Z` (bThsF) — props: cell_main_axis_id="bThsh"
        - **Input** `ip totalbruto` (bThsJ) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell Z` (bThsP) — props: cell_main_axis_id="bThsj"
        - **Input** `ip totalcomissao` (bThsQ) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell PZZZZ` (bTidX) — props: cell_main_axis_id="bTidL"
        - **Icon** `Icon IZZ` (bTidp) — props: icon="material outlined delete", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=False
        - **Group** `Group HZZZZZZ` (bTiqB) — oculto ao carregar · props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=True
          - **Image** `ico proposta` (bTiqD) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1736191361739x755453739650058900/entrega%20concluida.svg"
      - **TableCell** `Cell QZZZZ` (bTifW) — props: cell_main_axis_id="bTifQ"
        - **Icon** `Icon JZZ` (bTifu) — props: icon="material outlined edit", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}Esse produto possui entrega(s) lançadas e não pode ser editado"
      - **TableCell** `Cell Z` (bThsW) — props: cell_main_axis_id="bThso"
        - **Input** `ip totalliquido` (bThsX) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell IZZZ` (bThww) — props: cell_main_axis_id="bThwj"
        - **Input** `ip valorvenda` (bThxB) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
    - **TableMainAxis** `TableMainAxis VZ` (bThsb) — props: axis_index=5
    - **TableMainAxis** `TableMainAxis VZ` (bThsc) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis VZ` (bThsd) — props: axis_index=7
    - **TableMainAxis** `TableMainAxis VZ` (bThsh) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis VZ` (bThsj) — props: axis_index=10
    - **TableMainAxis** `TableMainAxis QZZ` (bTidL) — props: axis_index=11
    - **TableMainAxis** `TableMainAxis UZZ` (bTifQ) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis VZ` (bThso) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis ZZ` (bThwj) — props: axis_index=3
- **CustomElement** `pop.AddEdita Produtos A` (bTicE) — USA Reusable pop.AddEdita Produtos · props: custom_id="bTiZh"
- **CustomElement** `pop.CadastroProdutos A` (bThDp) — USA Reusable pop.CadastroProdutos · props: custom_id="bTgZS"
- **CustomElement** `tool.Historico A` (bTeAe) — USA Reusable tool.Historico · oculto ao carregar · props: custom_id="bTdrv", floating_reference_horizontal_resp="right"
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_false → is_visible=False
- **CustomElement** `tool.DashMenu A` (bTeRp) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **Popup** `pop confirma entrega` (bTcVt) — props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Group** `Group YZZZZ` (bTfHd) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Text** `Text IZZZZZZZ` (bTcWh) — text: "Confirma entrega"
    - **Text** `Text YZZZZZZ` (bTfHX) — text: "Nota Núm: {Text("{Parent:cpo.NumNfFornecedor}")}" · props: font_alignment="right"
  - **Group** `Group ZZZZZ` (bTfJD) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `Group EZZZZZZZ` (bUBrN) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Icon** `Icon OZZZ` (bUBrT) — props: icon="feather truck", vertical_centering=True
      - **Text** `Text UZZZZZZZ` (bUBrS) — text: "Dados da entrega"
    - **Group** `gp qual grupo clifor` (bTcWn) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **PictureInput** `upi novocliente logo` (bTcWp) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
        - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `Group VZZZ` (bTcWt) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - **Text** `Text JZZZZZZZ` (bTcWu) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
        - **Text** `Text JZZZZZZZ` (bTcWv) — text: "[b]Cotação número[/b] {Parent:cpo.QualCotacao:cpo.CotacaoNum}  - [b]Proposta número[/b] {Parent:cpo.QualProposta:cpo.PropostaNum}"
        - **Text** `Text ZZZZZZZ` (bTfHo) — text: "[b]Condição negociada[/b]: {Parent:cpo.QualPedido:cpo.PrazoRecebComissoes:display}"
        - **Text** `Text LZZZZZZZZZ` (bTrlz) — text: "[b]Forma pagto[/b]: {Parent:cpo.QualPedido:cpo.FormaPagto:display}"
    - **Table** `rpg entregas do produto` (bTfFG) — data_source: Parent:convert_to_list · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
      - **TableMainAxis** `TableMainAxis G` (bTfFH) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis G` (bTfFL) — props: axis_index=2
      - **TableMainAxis** `TableMainAxis G` (bTfFM) — props: axis_index=3
      - **TableCrossAxis** `TableCrossAxis S` (bTfFN) — props: axis_index=0
        - **TableCell** `Cell L` (bTfFR) — props: cell_main_axis_id="bTfFH"
          - **Text** `Text TZZZ` (bTfFS) — text: "Dt prev. entrega" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfFT) — props: cell_main_axis_id="bTfFL"
          - **Text** `Text TZZZ` (bTfFX) — text: "Qtd entrega" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfFe) — props: cell_main_axis_id="bTfFM"
          - **Text** `Text TZZZ` (bTfFf) — text: "Comissão " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfFk) — props: cell_main_axis_id="bTfGx"
          - **Text** `Text TZZZ` (bTfFl) — text: "Valor bruto " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfFq) — props: cell_main_axis_id="bTfGy"
          - **Text** `Text TZZZ` (bTfFr) — text: "Valor líq " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfGC) — props: cell_main_axis_id="bTfHE"
          - **Text** `Text TZZZ` (bTfGD) — text: "Núm NF " · props: font_alignment="center"
      - **TableCrossAxis** `TableCrossAxis S` (bTfGH) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell L` (bTfGI) — props: cell_main_axis_id="bTfFH"
          - **Text** `Text VZZZ` (bTfHK) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfGN) — props: cell_main_axis_id="bTfFL"
          - **Text** `Text JZZZZ` (bTfHQ) — text: "{Ancestor[TableCrossAxis]:cpo.QtdEntrega}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfGT) — props: cell_main_axis_id="bTfFM"
          - **Text** `Text TZZZ` (bTfGU) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfGV) — props: cell_main_axis_id="bTfGx"
          - **Text** `Text TZZZ` (bTfGZ) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfGa) — props: cell_main_axis_id="bTfGy"
          - **Text** `Text TZZZ` (bTfGb) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTfGr) — props: cell_main_axis_id="bTfHE"
          - **Text** `Text TZZZ` (bTfGs) — text: "{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: font_alignment="center"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
      - **TableMainAxis** `TableMainAxis G` (bTfGx) — props: axis_index=4
      - **TableMainAxis** `TableMainAxis G` (bTfGy) — props: axis_index=5
      - **TableMainAxis** `TableMainAxis G` (bTfHE) — props: axis_index=6
  - **Group** `Group AZZZZZZZ` (bUBqQ) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `Group BZZZZZZZ` (bUBqn) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Icon** `Icon X` (bUBqb) — props: icon="material outlined receipt_long", vertical_centering=True
      - **Text** `Text RZZZZZZZZZ` (bUBqh) — text: "Criar previsão de recebimentos"
    - **Group** `Group XZZZZ` (bTfEp) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Group** `g DateTimePicker` (bTcWF) — data_source: Parent · props: group_type="custom.tbl_entregas"
        - **Text** `Text HZZZZZZZ` (bTcWJ) — text: "Data de entrega"
        - **DateInput** `dt dataentrega realizada` (bTcWK) — placeholder: "dd/mm/yy" · content: Page.Current Date/Time · props: mandatory=True, overwrite_placeholder=True
      - **Group** `g FileUploader` (bTcWL) — data_source: Parent · props: group_type="custom.tbl_entregas"
        - **Text** `Text HZZZZZZZ` (bTcWP) — text: "Comprovante entrega"
        - **FileInput** `upf comprovanteentrega realizada` (bTcWR) — placeholder: "Máx 5mb" · props: font_alignment="left", src="{Parent:cpo.ComprovanteEntrega}", max_size=5
          - ⟂ quando This:get_loading_status:is_true → placeholder="Aguarde, carregando..."
      - **Group** `g FileUploader copy` (bTezd) — data_source: Parent · props: group_type="custom.tbl_entregas"
        - **Text** `Text E` (bTezj) — text: "Qtd parcelas"
        - **select2-MultiDropdown** `dd qtd parcelas receber` (bTfIp) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · props: default=Parent:cpo.QualPedido:cpo.PrazoRecebComissoes, tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", tag_font_color="var(--color_primary_default)", limit_selection=4, tag_border_color="var(--color_primary_default)", tag_delete_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
      - **Button** `Button EZ` (bTfDB) — text: "Recebimentos" · props: icon="material outlined add", icon_size=16, button_gap=4, button_type="label_icon", title_attribute="Adicionar parcelas"
        - ⟂ quando El[dd qtd parcelas receber]:get_data:count:less_than(1) → bgcolor="var(--color_bTHGl_default)", button_disabled=True
        - ⟂ quando El[rpg previsao contas receber]:get_list_data:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGl_default)", button_disabled=True
    - **Group** `gp retira pedido listagem copy 2` (bUBqF) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Icon** `Icon MZZZ` (bUBqL) — props: icon="material outlined info"
      - **Text** `Text QZZZZZZZZZ` (bUBqK) — text: "Não é possivel criar novos recebimentos se já existe algum recebimento previsto abaixo."
  - **Group** `Group CZZZZZZZ` (bUBqv) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `Group DZZZZZZZ` (bUBrF) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Icon** `Icon NZZZ` (bUBrL) — props: icon="material outlined receipt_long", vertical_centering=True
      - **Text** `Text SZZZZZZZZZ` (bUBrH) — text: "Previsão de recebimentos"
    - **Table** `rpg previsao contas receber` (bTfAf) — data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True
      - **TableMainAxis** `TableMainAxis A` (bTfBb) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis A` (bTfBc) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis A` (bTfBh) — props: axis_index=0
        - **TableCell** `Cell A` (bTfBi) — props: cell_main_axis_id="bTfBb"
          - **Text** `Text F` (bTfBz) — text: "Vencimento"
        - **TableCell** `Cell A` (bTfBj) — props: cell_main_axis_id="bTfBc"
          - **Text** `Text RZZZ` (bTfCF) — text: "Valor"
        - **TableCell** `Cell A` (bTfBn) — props: cell_main_axis_id="bTfBd"
        - **TableCell** `Cell B` (bTfDr) — props: cell_main_axis_id="bTfDl"
          - **Text** `Text SZZZ` (bTfEP) — text: "Prazo"
      - **TableCrossAxis** `TableCrossAxis A` (bTfBo) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell A` (bTfBp) — props: cell_main_axis_id="bTfBb"
          - **DateInput** `Date/TimePicker F` (bTfCd) — auto_binding: True · props: vertical_centering=True, bind_field="cpo_datavencimento_date"
        - **TableCell** `Cell A` (bTfBt) — props: cell_main_axis_id="bTfBc"
          - **Input** `Input JZ` (bTfCj) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: vertical_centering=True, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
        - **TableCell** `Cell A` (bTfBu) — props: cell_main_axis_id="bTfBd"
          - **Icon** `Icon W` (bTfCX) — props: icon="material outlined delete_forever", vertical_centering=True
        - **TableCell** `Cell K` (bTfDx) — props: cell_main_axis_id="bTfDl"
          - **Dropdown** `dd prazo a vencer` (bTfEV) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, bind_field="cpo_qualprazo_option_opt_parcelasreceber", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
      - **TableMainAxis** `TableMainAxis A` (bTfBd) — props: axis_index=3
      - **TableMainAxis** `TableMainAxis F` (bTfDl) — props: axis_index=0
  - **Group** `Group FZZZZZZZ` (bUBrY) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `Group WZZZ` (bTcXG) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Button** `btn confirmaentrega` (bTcWW) — text: "Gravar" · props: button_disabled=True
        - ⟂ quando Parent:cpo.QuaisContasReceber:count:greater_or_equal_than(1):and_(El[dt dataentrega realizada]:get_data:is_not_empty):and_(El[dd qtd parcelas receber]:get_data:count:greater_or_equal_than(1)) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
      - **Button** `btn cencela confirmaentrega` (bTcXA) — text: "Cancela"
    - **Group** `gp retira pedido listagem copy` (bTcXR) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
      - **Icon** `Icon ZZZ` (bTcXY) — props: icon="material outlined info"
      - **Text** `Text KZZZZZZZ` (bTcXT) — text: "Ao confirmar a entrega, esse cartão será movido para FINANCEIRO e as contas a receber serão criadas. Confira os dados os dados com atenção."
- **CustomElement** `reus cabecalho A` (bTJyt) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `pop.AgendaContatos A` (bTPVF0) — USA Reusable pop.AgendaContatos · props: custom_id="bTPQa0"
- **Popup** `pop cancelar entrega e pedido` (bTPXu0) — props: vertical_centering=True
  - estado customizado `var_qualpedido_` : Tbl.Pedido
  - estado customizado `var_qualentrega_` : Tbl.Entregas
  - estado customizado `var_a__ocancelamento_` : Opt.Ações
  - **Icon** `Icon T` (bTeaR) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group TZZZZ` (bTeeX) — data_source: El[pop cancelar entrega e pedido]:custom.var_qualpedido_ · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Group** `Group OZZZZ` (bTebf) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - **Group** `Group QZ` (bTeZl) — props: vertical_centering=True
        - **Icon** `Icon RZZ` (bTPYT0) — props: icon="material outlined warning"
        - **Text** `Text TZZ` (bTPYA0) — text: "ATENÇÃO!" · props: font_alignment="center"
      - **Text** `Text UZZZ` (bTPYG0) — text: "Você está cancelando um pedido/entrega.⏎Para prosseguir preencha o motivo do cancelamento." · props: font_alignment="center"
      - **Input** `Input EZ` (bTeZt) — placeholder: "Motivo cancelamento" · content: "{∅}" · props: mandatory=True, vertical_centering=True
      - **Group** `Group NZZZZ` (bTebX) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Group** `Group LZZZZ` (bTebB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `chk informa cancelamento cliente` (bTeap) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text M` (bTeav) — text: "Envia e-mail informando [color=#000000]cliente.[/color]"
        - **Group** `Group MZZZZ` (bTebM) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `chk informa cancelamento fornecedor` (bTebR) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text N` (bTebS) — text: "Envia e-mail informando fornecedor"
      - **Button** `Button L` (bTPYZ0) — text: "Cancela Pedido/Entrega"
    - **Group** `Group RZZZZ` (bTeeB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_false → is_visible=False
      - **Group** `gp email cliente` (bTecJ) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text U` (bTecT) — text: "Email do Cliente:"
        - **Group** `Group PZZZZ` (bTecN) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento cliente` (bTecO) — data_source: Parent:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailCliente, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon GZ` (bTecP) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email cliente` (bTecg) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTecl) — text: "Corpo do e-mail do cliente:"
        - **MultiLineInput** `ipt corpo cancelamento cliente` (bTeel) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido) → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido [/b] {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega) → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
    - **Group** `Group SZZZZ` (bTeeM) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_false → is_visible=False
      - **Group** `gp email fornecedor` (bTecB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text U` (bTecI) — text: "Email do fornecedor:"
        - **Group** `Group PZZZZ` (bTecC) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento fornecedor` (bTecD) — data_source: Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailFornecedor, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon HZ` (bTecH) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email fornecedor` (bTeca) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTecf) — text: "Corpo do e-mail do fornecedor:"
        - **MultiLineInput** `ipt corpo cancelamento fornecedor` (bTech) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido) → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido[/b]  {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega) → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
- **Popup** `pop consulta icms` (bTPaz) — props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
  - **Group** `Group IZ` (bTPeF) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
    - **Dropdown** `dd Origem` (bTPdt) — data_source: All(Opt.UFs):sorted(descending=False, sort_field="display") · placeholder: "Origem" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **Dropdown** `dd Destino` (bTPdz) — data_source: All(Opt.UFs):sorted(descending=False, sort_field="display") · placeholder: "Destino" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Table** `Table H` (bTPbL) — data_source: Search(Tbl.IcmsEstados: cpo.Origem equals El[dd Origem]:get_data AND cpo.Destino equals El[dd Destino]:get_data; ignore empty) · props: group_type="custom.tbl_icmsestados", vertical_centering=True
    - **TableMainAxis** `TableMainAxis K` (bTPcH) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis K` (bTPcI) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis K` (bTPcJ) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis H` (bTPcN) — props: axis_index=0
      - **TableCell** `Cell Q` (bTPcO) — props: cell_main_axis_id="bTPcH"
        - **Text** `Text Y` (bTPcf) — text: "Origem"
      - **TableCell** `Cell Q` (bTPcP) — props: cell_main_axis_id="bTPcI"
        - **Text** `Text AZ` (bTPcl) — text: "Destino"
      - **TableCell** `Cell Q` (bTPcT) — props: cell_main_axis_id="bTPcJ"
        - **Text** `Text IZ` (bTPcs) — text: "Alíquota"
    - **TableCrossAxis** `TableCrossAxis H` (bTPcU) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell Q` (bTPcV) — props: cell_main_axis_id="bTPcH"
        - **Text** `Text WZZZ` (bTPdW) — text: "{Ancestor[TableCrossAxis]:cpo.Origem:display}" · props: font_alignment="center"
        - **Text** `Text KZ` (bTPcz) — text: "{∅}"
      - **TableCell** `Cell Q` (bTPcZ) — props: cell_main_axis_id="bTPcI"
        - **Text** `Text XZZZ` (bTPdc) — text: "{Ancestor[TableCrossAxis]:cpo.Destino:display}" · props: font_alignment="center"
      - **TableCell** `Cell Q` (bTPca) — props: cell_main_axis_id="bTPcJ"
        - **Input** `Input KZ` (bTfKV) — placeholder: "" · auto_binding: True · content_format: "percentage" · props: mandatory=True, vertical_centering=True, bind_field="cpo_aliquotaicms_number", decimal_place=2
        - **Icon** `Icon IZ` (bTPfT) — props: icon="material outlined content_copy"
- **CustomElement** `pop.AgendaEnderecos A` (bTPNO) — USA Reusable pop.AgendaEnderecos · props: custom_id="bTPJL"
- **Popup** `pop add fornecedor` (bTNjw) — props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
  - estado customizado `var_distanciamaiormenor_` : boolean
  - estado customizado `varfornecedoresselecionados_` : list.custom.tbl_enderecosclifor (lista)
  - **Icon** `btn fecar add fornecedores` (bTchT) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group N` (bTcuJ) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
    - **Group** `Group M` (bTcty) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Group** `Group G` (bTOeV0) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Image** `Image B` (bTOed0) — props: src="{El[ipt buscacliente]:get_data:cpo.Foto}"
          - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Text** `Text Q` (bTOei0) — text: "{El[ipt buscacliente]:get_data:cpo.NomeCliFor:to_capitalized_words}"
        - **RepeatingGroup** `rpg orcamentos passados` (bUAiP) — data_source: Search(Tbl.OrcFornecedoresCotacao: cpo.QualProdutoModelo equals El[pop add fornecedor]:get_group_data:cpo.QualProduto AND cpo.TipoFrete equals Opt.TipoFrete.FOB; ignore empty) · props: group_type="custom.tbl_orcamentfornecedores", separator_style="none", cell_min_height_css="56px"
      - **Group** `Group C` (bTNlu) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Text** `Text R` (bTNlc) — text: "{Parent:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
        - **Text** `Text T` (bTOeo0) — text: "{Parent:cpo.Condicao:display} - {Parent:cpo.Linha:display} - {Parent:cpo.Medida}" · props: vertical_centering=True
    - **Group** `Group HZZZZZ` (bThkf) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Group** `Group AZZZZ` (bTcaR) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Text** `Text MZZZZZZZ` (bTcaL) — text: "Endereço de entrega:"
        - **Group** `Group BZZZZ` (bTcbD) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
          - **Dropdown** `dd end destino` (bTeor) — data_source: Parent:cpo.QualCliente:cpo.QuaisEnderecos · placeholder: "Selecione endereço" · props: default=Parent:cpo.QualEnderecoDestino, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Complemento:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words} - {InjectedValue:cpo.QualUfOpt:display}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon HZZZ` (bTkej) — props: icon="material outlined gps_fixed", button_disabled=True
            - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty → icon_color="var(--color_primary_default)", button_disabled=False
          - **Icon** `Icon JZ` (bTcax) — props: icon="material outlined contact_mail"
      - **Button** `btn novofornecedor` (bThUu) — text: "Novo Fornecedor" · props: icon="material filled factory", icon_size=20, button_type="label_icon"
  - **Table** `rpg cotacao fornecedores` (bTNkC) — data_source: Search(Tbl.EnderecosCliFor: cpo.Municipio equals "{El[dd filtercidade fornecedores]:get_data}" AND cpo.TipoClifor equals opt.TipoCliFor.Fornecedor AND cpo.QualUfOpt equals El[dd filterUF fornecedores]:get_data AND cpo.QualGrupoCliFor equals El[dd filternome fornecedores]:get_data AND cpo.Ativo equals True AND cpo.NomeEndereco text contains "{El[dd filterID fornecedores]:get_data}" AND cpo.QuaisProdutos contains Parent:cpo.QualProduto AND cpo.QualRegimeTributario equals El[dd filter regime triburario]:get_data; ignore empty):minus_list(Parent:cpo.QuaisOrcamentosForncededores:cpo.QualEnderecoOrigem) · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, unique_id="rpgaddfornecedores"
    - **TableMainAxis** `TableMainAxis J` (bTNky) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis J` (bTNkz) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis J` (bTNlD) — props: axis_index=5
    - **TableCrossAxis** `TableCrossAxis D` (bTNlE) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell P` (bTNlF) — props: cell_main_axis_id="bTNky"
        - **Group** `gp filternome fornecedores` (bTfOH) — props: vertical_centering=True
          - **AutocompleteDropdown** `dd filternome fornecedores` (bTfOM) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Nome Fornecedor" · props: vertical_centering=True, field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGm_default)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon CZZ` (bTfON) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filternome fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell P` (bTNlJ) — props: cell_main_axis_id="bTNkz"
        - **Group** `gp filtercidade fornecedores` (bTcxj0) — props: vertical_centering=True
          - **Dropdown** `dd filtercidade fornecedores` (bTcxX0) — data_source: El[rpg cotacao fornecedores]:get_list_data:cpo.Municipio:unique:sorted(descending=False) · placeholder: "Cidade" · props: vertical_centering=True, dynamic_type="text", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:to_uppercase}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon S` (bTcxd0) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtercidade fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell P` (bTNlK) — props: cell_main_axis_id="bTNlD"
        - **Text** `Text X` (bTNob) — text: "Endereço"
      - **TableCell** `Cell U` (bTNnC) — props: cell_main_axis_id="bTNmk"
      - **TableCell** `Cell S` (bTNnN) — props: cell_main_axis_id="bTNnH"
      - **TableCell** `Cell W` (bTNnr) — props: cell_main_axis_id="bTNnl"
        - **Text** `Text Z` (bTNpp) — text: "Última cotação / Valor Unit" · props: font_alignment="center"
      - **TableCell** `Cell UZZZZ` (bTcgj) — props: cell_main_axis_id="bTcgd"
        - **Group** `gp filterUF fornecedores` (bTfOZ) — props: vertical_centering=True
          - **Dropdown** `dd filterUF fornecedores` (bTfOe) — data_source: All(Opt.UFs) · placeholder: "UF" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:display}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon DZZ` (bTfOf) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filterUF fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell ZZZZZ` (bTrvL0) — props: cell_main_axis_id="bTrvF0"
        - **Group** `gp filter regime tributario` (bUCUJ) — props: vertical_centering=True
          - **Dropdown** `dd filter regime triburario` (bUCUL) — data_source: All(opt.RegimeTributario) · placeholder: "Regime Tributario" · props: vertical_centering=True, dynamic_type="option.opt_regimetributario", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:display}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon PZZZ` (bUCUP) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filter regime triburario]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell M` (bTfKh) — props: cell_main_axis_id="bTfKb"
        - **Text** `sort distance` (bTfKj) — text: "Distancia para entrega  [fa]chevron-up[/fa]"
          - ⟂ quando El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_false → text="Distancia para entrega  [fa]chevron-down[/fa]"
      - **TableCell** `Cell XZZZZ` (bTvcX) — props: cell_main_axis_id="bTvcR", cell_cross_axis_index=0
      - **TableCell** `Cell O` (bThlT0) — props: cell_main_axis_id="bThlN0"
        - **Group** `gp filterID fornecedores` (bThlV0) — props: vertical_centering=True
          - **Input** `dd filterID fornecedores` (bThlZ0) — placeholder: "Identificador Endereço" · props: vertical_centering=True, placeholder_color="var(--color_bTHGm_default)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon FZ` (bThla0) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filterID fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
    - **TableCrossAxis** `TableCrossAxis D` (bTNlL) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell P` (bTNlP) — props: cell_main_axis_id="bTNky"
        - **Image** `Image H` (bTaLT) — props: src="{Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Foto}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Text** `Text BZ` (bTNqH) — text: "{Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.NomeCliFor:to_capitalized_words}"
      - **TableCell** `Cell P` (bTNlQ) — props: cell_main_axis_id="bTNkz"
        - **Text** `Text CZ` (bTNqN) — text: "{Ancestor[TableCrossAxis]:cpo.Municipio:to_capitalized_words}"
      - **TableCell** `Cell P` (bTNlR) — props: cell_main_axis_id="bTNlD"
        - **Text** `Text DZ` (bTNqU) — text: "{Ancestor[TableCrossAxis]:cpo.Endereco:to_capitalized_words}" · props: unique_id="kmdistancia"
      - **TableCell** `Cell T` (bTNmw) — props: cell_main_axis_id="bTNmk"
        - **Icon** `Icon AZZ` (bTfLA) — props: icon="material outlined contact_mail"
        - **Icon** `Icon BZZ` (bTfMH) — props: icon="material outlined my_location"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **TableCell** `Cell V` (bTNnT) — props: cell_main_axis_id="bTNnH"
        - **Icon** `Icon IZZZ` (bTNpB) — props: icon="material outlined check_box_outline_blank"
          - ⟂ quando El[pop add fornecedor]:custom.varfornecedoresselecionados_:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Liberado:is_false → icon="material outlined block", icon_color="var(--color_bTHHQ_default)", button_disabled=True
      - **TableCell** `Cell Y` (bTNnn) — props: cell_main_axis_id="bTNnl"
        - **Text** `Text JZ` (bTNqr) — text: "{El[rpg orcamentos passados]:get_list_data:filtered(constraints={0={key="cpo_qualenderecoorigem_custom_tbl_enderecosclifor", value=Ancestor[TableCrossAxis], constraint_type="equals"}}):last_element:cpo.ValorVendaUnit:format_number(decimal_place=2, decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
      - **TableCell** `Cell VZZZZ` (bTcgp) — props: cell_main_axis_id="bTcgd"
        - **Text** `Text RZZZZZZZ` (bTchN) — text: "{Ancestor[TableCrossAxis]:cpo.UF:to_uppercase}" · props: font_alignment="center"
      - **TableCell** `Cell AZZZZZ` (bTrvR0) — props: cell_main_axis_id="bTrvF0"
        - **Text** `Text NZZZZZZZZZ` (bTrvq0) — text: "{Ancestor[TableCrossAxis]:cpo.QualRegimeTributario:display}"
      - **TableCell** `Cell N` (bTfKp) — props: cell_main_axis_id="bTfKb"
        - **Group** `Group LZZZZZZ` (bTkfD) — props: vertical_centering=True
          - **Text** `Text WZZZZZZZ` (bTfKu) — text: "{Ancestor[TableCrossAxis]:cpo.Localizacaoo:distance_from(unit="kms", origin_address=El[dd end destino]:get_data:cpo.Localizacaoo):format_number(formatting_type="number", decimal_place=1)}" · props: unique_id="distancia"
            - ⟂ quando El[dd end destino]:get_data:is_empty:or_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="{∅}0", is_visible=True
          - **Text** `Text WZZZZZZZ` (bTfKv) — text: " km do cliente" · props: unique_id="kmdistancia"
        - **Text** `Text AZZZZZZZZZ` (bTkex) — text: "km"
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_not_empty) → text="(cliente sem localização)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="(fornecedor sem localição)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="(cliente e fornecedor sem localização)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_not_empty) → is_visible=False
      - **TableCell** `Cell YZZZZ` (bTvcd) — props: cell_main_axis_id="bTvcR", cell_cross_axis_index=1
        - **Icon** `Icon LZZZ` (bUAiJ) — props: icon="material outlined task_alt", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Liberado:is_false → icon="material outlined block", icon_color="var(--color_destructive_default)"
        - **Text** `Text ZZZZZZ` (bTvcr) — text: "LIBERADO" · props: font_alignment="center"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Liberado:is_false → text="BLOQUEADO"
        - **Text** `Text OZZZZZZZZZ` (bTvcx) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.LiberadoMotivo}")}" · props: font_alignment="center"
      - **TableCell** `Cell X` (bThlf0) — props: cell_main_axis_id="bThlN0"
        - **Text** `Text CZZZZ` (bThlh0) — text: "{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
    - **TableMainAxis** `TableMainAxis L` (bTNmk) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis M` (bTNnH) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis N` (bTNnl) — props: axis_index=7
    - **TableMainAxis** `TableMainAxis TZZ` (bTcgd) — props: axis_index=3
    - **TableMainAxis** `Column I` (bTrvF0) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis H` (bTfKb) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis VZZ` (bTvcR) — props: axis_index=10
    - **TableMainAxis** `TableMainAxis UZ` (bThlN0) — props: axis_index=2
  - **Button** `Button E` (bTNrR) — text: "Adicionar Fornecedores" · props: vertical_centering=True
- **Popup** `pop add edita propostas` (bTOrR) — props: group_type="custom.tbl_orcamento", vertical_centering=True
  - estado customizado `var_acaocotacao_` : Opt.Ações
  - estado customizado `var_exibeproposta_` : Tbl.Propostas
  - estado customizado `var_enviamailproposta_` : boolean
  - **Group** `gp modelo proposta` (bTahV) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Group** `gp exibe proposta` (bTahL) — oculto ao carregar · data_source: El[gp add edita proposta]:get_group_data · props: group_type="custom.tbl_propostas", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → data_source=El[pop add edita propostas]:custom.var_exibeproposta_, is_visible=True
      - **Group** `gp alerta exibe proposta` (bTahd) — props: vertical_centering=True
        - **Icon** `Icon PZZ` (bTahi) — props: icon="material filled sd_card_alert"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_true → icon="report"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_false → icon="sim_card_alert.outline"
        - **Text** `Text EZZZZZ` (bTahj) — text: "Alerta sobre a proposta exibida"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_true → text="A proposta selecionada já foi enviada e não permite edição.⏎Caso precise alterar valores edite a cotação e crie uma nova proposta."
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_false → text="A proposta selecionada [b]NÃO [/b]foi enviada e [b]AINDA [/b]permite edição de informações.⏎Caso precise alterar valores edite a cotação antes de enviar essa proposta."
        - **Button** `btn proposta editacotacao` (bTcvj) — text: "editar cotação" · props: icon="feather edit", vertical_centering=True, icon_size=12, button_type="label_icon"
          - ⟂ quando This:is_pressed → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGx_default)"
          - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
      - **Group** `gp corpo exibe proposta` (bTacB) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - **Group** `Group IZZ` (bTacF) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Image** `Image J` (bTacG) — props: src="{Parent:cpo.QualCotacao:cpo.EmpresaMegabox:logo_horizontal}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group IZZ` (bTacH) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text DZZZZZ` (bTacL) — text: "[b]Consultor[/b]: {Parent:Created By:cpo.NomeModelo:to_capitalized_words}"
            - **Text** `Text DZZZZZ` (bTacM) — text: "[b]Email[/b]: {Parent:Created By:cpo.EmailContato}"
              - ⟂ quando Parent:cpo.QualCotacao:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email:[/b] {Parent:cpo.QualCotacao:cpo.EmpresaMegabox:email}"
            - **Text** `Text DZZZZZ` (bTacN) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group IZZ` (bTacS) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group IZZ` (bTacT) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text DZZZZZ` (bTacX) — text: "Proposta núm: {Parent:cpo.QualCotacao:cpo.CotacaoNum}/"
            - **Input** `ipt proposta numero` (bTacY) — placeholder: "" · content: Parent:cpo.PropostaNum · content_format: "int_number" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
          - **Text** `Text DZZZZZ` (bTacZ) — text: "{Parent:Created Date:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Group** `Group IZZ` (bTacd) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group NZZZZZ` (bTiAO) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bThzr) — placeholder: "" · props: src="{Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.Foto}", private=False, disabled=True
              - ⟂ quando Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `Group MZZZZZ` (bThzx) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text DZZZZZ` (bTace) — text: "[b]Cliente[/b]: {Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.NomeCliFor}"
              - **Text** `Text DZZZZZ` (bTacf) — text: "[b]A/C:[/b] {Parent:cpo.EnviarPara:cpo.NomeContato}"
              - **Text** `Text DZZZZZ` (bTacj) — text: "[b]CNPJ:[/b] {Parent:cpo.FaturarPara:cpo.CnpjCpf}"
              - **Text** `Text DZZZZZ` (bTack) — text: "[b]Telefone:[/b] {Parent:cpo.EnviarPara:cpo.Telefone}"
              - **Text** `Text DZZZZZ` (bTacl) — text: "[b]Cidade:[/b] {Parent:cpo.FaturarPara:cpo.Municipio:to_capitalized_words}/{Parent:cpo.FaturarPara:cpo.UF:to_uppercase}"
          - **Text** `Text DZZZZZ` (bTacp) — text: "- Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será possivel considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do enquadramento tributário de sua empresa.⏎- Se positivo, o VALOR LIQUIDO poderá ser considerado para fins de comparação com outras cotações, pois sua empresa se CREDITA desses impostos.[ul][li]Empresa de Lucro Real: Pode creditar de ICMS, PIS/COFINS e IPI[/li]⏎[li]Empresa de Lucro Presumido: Pode se creditar apenas do ICMS[/li]⏎[li]Empresa do Simples Nacional: Não pode se creditar desses impostos[/li]⏎[/ul]⏎-Em caso de dúvidas procure seu departamento fiscal/contábil⏎"
        - **Group** `Group IZZ` (bTacq) — props: vertical_centering=True
          - **Text** `Text DZZZZZ` (bTacr) — text: "Itens da proposta:"
        - **Table** `rpg itens orcamento` (bTacv) — data_source: Parent:cpo.QuaisOrcamentosFornecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
          - **TableMainAxis** `TableMainAxis CZZ` (bTacx) — props: axis_index=5
          - **TableCrossAxis** `TableCrossAxis M` (bTadC) — props: axis_index=0
            - **TableCell** `Cell UZZZ` (bTadH) — props: cell_main_axis_id="bTacx"
              - **Text** `Text L` (bTeYZ) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTadO) — props: cell_main_axis_id="bTaeh"
              - **Text** `Text DZZZZZ` (bTadP) — text: "Qtd" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTadT) — props: cell_main_axis_id="bTaei"
              - **Text** `Text DZZZZZ` (bTadU) — text: "Descrição"
            - **TableCell** `Cell UZZZ` (bTadV) — props: cell_main_axis_id="bTaej"
              - **Text** `Text J` (bTeYN) — text: "PREÇO UNITÁRIO⏎Líquido de Impostos⏎(PIS/COFINS/IPI)" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTada) — props: cell_main_axis_id="bTaen"
              - **Text** `Text K` (bTeYT) — text: "Alíquota⏎ICMS" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTadf) — props: cell_main_axis_id="bTaeo"
              - **Text** `Text DZZZZZ` (bTadg) — text: "PREÇO UNITÁRIO BRUTO⏎(Impostos Incluso)⏎" · props: font_alignment="center"
            - **TableCell** `Cell C` (bTegz) — props: cell_main_axis_id="bTegt"
              - **Text** `Text HZZ` (bTehB) — text: "VALOR TOTAL BRUTO⏎{El[rpg itens orcamento]:get_list_data:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell MZZZZ` (bThyb) — props: cell_main_axis_id="bThyV"
              - **Text** `Text GZZZZZZZZ` (bThyd) — text: "Frete" · props: font_alignment="center"
          - **TableCrossAxis** `TableCrossAxis M` (bTadm) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell UZZZ` (bTads) — props: cell_main_axis_id="bTacx"
              - **Text** `Text DZZZZZ` (bTadt) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTaeE) — props: cell_main_axis_id="bTaeh"
              - **Text** `Text DZZZZZ` (bTaeF) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTaeJ) — props: cell_main_axis_id="bTaei"
              - **Text** `Text DZZZZZ` (bTaeK) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
              - **Text** `Text DZZZZZ` (bTaeL) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}"
            - **TableCell** `Cell UZZZ` (bTaeP) — props: cell_main_axis_id="bTaej"
              - **Text** `Text DZZZZZ` (bTaeQ) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTaeR) — props: cell_main_axis_id="bTaen"
              - **Text** `Text DZZZZZ` (bTaeV) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTaeX) — props: cell_main_axis_id="bTaeo"
              - **Text** `Text DZZZZZ` (bTaeb) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell D` (bTehG) — props: cell_main_axis_id="bTegt"
              - **Text** `Text ZZZ` (bTehL) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell NZZZZ` (bThyi) — props: cell_main_axis_id="bThyV"
              - **Text** `Text HZZZZZZZZ` (bThyn) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}⏎" · props: font_alignment="center"
              - **Text** `Text IZZZZZZZZ` (bThyp) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis CZZ` (bTaeh) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis CZZ` (bTaei) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis CZZ` (bTaej) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis CZZ` (bTaen) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis CZZ` (bTaeo) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis B` (bTegt) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis PZZ` (bThyV) — props: axis_index=3
        - **Group** `Group IZZ` (bTaet) — props: vertical_centering=True
          - **Text** `Text DZZZZZ` (bTaeu) — text: "Condições da proposta:"
        - **Group** `Group IZZ` (bTaev) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Text** `Text DZZZZZ` (bTaez) — text: "[b]Validade[/b]: {Parent:cpo.QualCotacao:cpo.DataValidade:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTafA) — text: "[b]Condições de pagamento:[/b] {Parent:cpo.CondicaoPgto}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTafB) — text: "[b]Destinos:[/b] {Parent:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualEnderecoDestino:cpo.Municipio:to_uppercase} - {InjectedValue:cpo.QualEnderecoDestino:cpo.UF:to_uppercase}", delimiter=" ")}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTafF) — text: "[b]Data prevista entrega:[/b] {Parent:cpo.DtPrevEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yyyy")}" · props: vertical_centering=False
          - **Text** `Text PZZZZZZZZZ` (bTziU) — text: "[b]CNPJ faturamento:[/b] {El[dd cnpj fornecedor]:get_data:cpo.CnpjCpf} - {El[dd cnpj fornecedor]:get_data:cpo.Razao}" · props: vertical_centering=False
            - ⟂ quando El[dd cnpj fornecedor]:get_data:is_not_empty → is_visible=True
            - ⟂ quando El[dd cnpj fornecedor]:get_data:is_empty → is_visible=False
          - **Text** `Text JZZZZZZZZZ` (bTpwK) — text: "[b]Informações adicionais:[/b] {El[ipt infoadicional]:get_data}" · props: vertical_centering=False
          - **Text** `Text AZZZZZZ` (bTpwD) — text: "⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
    - **Group** `gp nova proposta` (bTPnl) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → is_visible=False
      - **Group** `gp alerta nova proposta` (bTPoP) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
        - **Icon** `Icon QZZ` (bTPoJ) — props: icon="material outlined info"
        - **Text** `Text ZZZZ` (bTPhl) — text: "Os valores da proposta abaixo exibem a [b]situação atual da cotação[/b][b].[/b]⏎Se os valores exibidos estão incorretos [b]edite a cotação[/b] antes de criar uma nova proposta."
        - **Button** `btn proposta editacotacao` (bTcvG) — text: "editar cotação" · props: icon="feather edit", vertical_centering=True, icon_size=12, button_type="label_icon"
          - ⟂ quando This:is_pressed → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGx_default)"
          - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
      - **Group** `gp corpo novaproposta` (bTOrX) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True, unique_id="novaproposta"
        - **Group** `Group R` (bTOrj) — props: vertical_centering=True
          - **Image** `Image D` (bTOrv) — props: src="{El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:logoimagem:imgix_treatment(fm="png")}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group S` (bTOsH) — props: vertical_centering=True
            - **Text** `Text CZZ` (bTOsN) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
            - **Text** `Text FZZ` (bTOsT) — text: "[b]Email[/b]: {CurrentUser:cpo.EmailContato:to_lowercase}"
              - ⟂ quando El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email:[/b] {El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:email}"
            - **Text** `Text GZZ` (bTOsZ) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group T` (bTOsl) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Group** `Group FZZ` (bTaOH) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Text** `Text IZZ` (bTOsr) — text: "Proposta núm: {Parent:cpo.CotacaoNum}/"
            - **Input** `ipt proposta numero` (bTaOB) — placeholder: "" · content: El[pop add edita propostas]:get_group_data:cpo.QuaisPropostas:count:plus(1) · content_format: "int_number" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
              - ⟂ quando This:is_hovered → 
              - ⟂ quando This:is_focused → 
              - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Text** `Text OZZ` (bTOtv0) — text: "{Page.Current Date/Time:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Group** `Group U` (bTOsx0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Group** `Group PZZZZZ` (bTiBP) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTiBJ) — placeholder: "" · props: src="{Parent:cpo.QualCliente:cpo.Foto:imgix_treatment(fm="png")}", private=False, disabled=True
              - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `Group OZZZZZ` (bTiAs) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
              - **Text** `Text JZZ` (bTOsz0) — text: "[b]Cliente[/b]: {Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text KZZ` (bTOtE0) — text: "[b]A/C:[/b] {El[dd email para]:get_data:cpo.NomeContato:to_capitalized_words}"
              - **Text** `Text MZZ` (bTOth0) — text: "[b]CNPJ:[/b] {El[dd faturar para]:get_data:cpo.CnpjCpf}"
              - **Text** `Text PZZ` (bTOuB0) — text: "[b]Telefone:[/b] {El[dd email para]:get_data:cpo.Telefone}"
              - **Text** `Text QZZ` (bTOuH0) — text: "[b]Cidade:[/b] {El[dd faturar para]:get_data:cpo.Municipio:to_uppercase}/{El[dd faturar para]:get_data:cpo.UF:to_uppercase}"
            - **Text** `Text RZZ` (bTiBX) — text: "- Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será possivel considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do enquadramento tributário de sua empresa.⏎- Se positivo, o VALOR LIQUIDO poderá ser considerado para fins de comparação com outras cotações, pois sua empresa se CREDITA desses impostos.[ul][li]Empresa de Lucro Real: Pode creditar de ICMS, PIS/COFINS e IPI[/li]⏎[li]Empresa de Lucro Presumido: Pode se creditar apenas do ICMS[/li]⏎[li]Empresa do Simples Nacional: Não pode se creditar desses impostos[/li]⏎[/ul]⏎-Em caso de dúvidas procure seu departamento fiscal/contábil⏎"
        - **Group** `Group X` (bTOuT0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text SZZ` (bTOuY0) — text: "Itens da proposta:"
        - **Table** `rpg itens orcamento` (bTOue0) — data_source: Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}) · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
          - **TableMainAxis** `TableMainAxis NZ` (bTOvb0) — props: axis_index=5
          - **TableCrossAxis** `TableCrossAxis G` (bTOvg0) — props: axis_index=0
            - **TableCell** `Cell UZZ` (bTOvl0) — props: cell_main_axis_id="bTOvb0"
              - **Text** `Text YZZ` (bTOyT0) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center"
            - **TableCell** `Cell VZZ` (bTOwE0) — props: cell_main_axis_id="bTOvy0"
              - **Text** `Text UZZ` (bTOxl0) — text: "Qtd" · props: font_alignment="center"
            - **TableCell** `Cell BZZZ` (bTOwu0) — props: cell_main_axis_id="bTOwc0"
              - **Text** `Text VZZ` (bTOxv0) — text: "Descrição"
            - **TableCell** `Cell ZZZ` (bTOwt0) — props: cell_main_axis_id="bTOwn0"
              - **Text** `Text FZZZ` (bTPAk0) — text: "PREÇO UNITÁRIO⏎(Líquido de Impostos)" · props: font_alignment="center"
            - **TableCell** `Cell DZZZ` (bTOxX0) — props: cell_main_axis_id="bTOxR0"
              - **Text** `Text XZZ` (bTOyJ0) — text: "Alíquota⏎ICMS" · props: font_alignment="center"
            - **TableCell** `Cell EZZZ` (bTOyn0) — props: cell_main_axis_id="bTOyh0"
              - **Text** `Text IZZZ` (bTehk) — text: "PREÇO UNITÁRIO BRUTO⏎(Impostos Incluso)⏎" · props: font_alignment="center"
            - **TableCell** `Cell E` (bTehT) — props: cell_main_axis_id="bTehN"
              - **Text** `Text BZZZ` (bTehY) — text: "VALOR TOTAL BRUTO⏎{El[rpg itens orcamento]:get_list_data:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell OZZZ` (bThxy) — props: cell_main_axis_id="bThxs"
              - **Text** `Text DZZZZZZZZ` (bThyD) — text: "Frete" · props: font_alignment="center"
          - **TableCrossAxis** `TableCrossAxis G` (bTOvn0) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell UZZ` (bTOvs0) — props: cell_main_axis_id="bTOvb0"
              - **Text** `Text HZZZ` (bTPBB0) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell YZZ` (bTOwK0) — props: cell_main_axis_id="bTOvy0"
              - **Text** `Text DZZZ` (bTPAN0) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
            - **TableCell** `Cell AZZZ` (bTOwo0) — props: cell_main_axis_id="bTOwc0"
              - **Text** `Text EZZZ` (bTPAX0) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
              - **Text** `Text PZZZ` (bTPCb0) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}"
            - **TableCell** `Cell CZZZ` (bTOwz0) — props: cell_main_axis_id="bTOwn0"
              - **Text** `Text WZZ` (bTOyC0) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell FZZZ` (bTOxB0) — props: cell_main_axis_id="bTOxR0"
              - **Text** `Text GZZZ` (bTPAr0) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell GZZZ` (bTOyt0) — props: cell_main_axis_id="bTOyh0"
              - **Text** `Text AZZZ` (bTehq) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:divide(Ancestor[TableCrossAxis]:cpo.QtdVenda):format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell H` (bTehd) — props: cell_main_axis_id="bTehN"
              - **Text** `Text CZZZ` (bTehf) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell PZZZ` (bThyF) — props: cell_main_axis_id="bThxs"
              - **Text** `Text EZZZZZZZZ` (bThyK) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}⏎" · props: font_alignment="center"
              - **Text** `Text FZZZZZZZZ` (bThyP) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis PZ` (bTOvy0) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis QZ` (bTOwc0) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis RZ` (bTOwn0) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis SZ` (bTOxR0) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis TZ` (bTOyh0) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis C` (bTehN) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis OZZ` (bThxs) — props: axis_index=3
        - **Group** `Group Y` (bTPBg0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text LZZZ` (bTPBl0) — text: "Condições da proposta:"
        - **Group** `Group Z` (bTPBn0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text MZZZ` (bTPBs0) — text: "[b]Validade[/b]: {Parent:cpo.DataValidade:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTPBt0) — text: "[b]Condições de pagamento:[/b] {El[ipt condicao pagto]:get_data}" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTPBy0) — text: "[b]Destinos:[/b] {Parent:cpo.QuaisProdutos:format_as_text(content="{InjectedValue:cpo.QualEnderecoDestino:cpo.Municipio:to_uppercase} - {InjectedValue:cpo.QualEnderecoDestino:cpo.UF:to_uppercase}", delimiter=" ")}⏎" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTPBz0) — text: "[b]Data prevista entrega:[/b] {El[dt prevista entrega]:get_data:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text ZZZZZZZZZ` (bTzhv) — text: "[b]CNPJ faturamento:[/b] {El[dd cnpj fornecedor]:get_data:cpo.CnpjCpf} - {El[dd cnpj fornecedor]:get_data:cpo.Razao}" · props: vertical_centering=False
            - ⟂ quando El[dd cnpj fornecedor]:get_data:is_not_empty → is_visible=True
            - ⟂ quando El[dd cnpj fornecedor]:get_data:is_empty → is_visible=False
          - **Text** `Text BZZZZ` (bThEx) — text: "[b]Informações adicionais:[/b] {El[ipt infoadicional]:get_data}" · props: vertical_centering=False
          - **Text** `Text KZZZZZZZZZ` (bTpwQ) — text: "⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
  - **Group** `gp historico propostas` (bTPmv) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Text** `Text IZZZZ` (bTPnT) — text: "Propostas do Cliente" · props: font_alignment="center"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta) → text="Nova proposta do cliente"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → text="Edita proposta do cliente"
    - **Group** `Group XZZZZZZ` (bTzcx0) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Group** `gp qual grupo clifor` (bTPnZ) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente · props: group_type="custom.tbl_clientes"
        - **PictureInput** `upi novocliente logo` (bTPnf) — placeholder: "" · props: src="{Parent:cpo.Foto}", private=False, disabled=True
          - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Group** `Group HZZ` (bTaTL) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Text** `Text BZZZZZ` (bTaSz) — text: "{Parent:cpo.NomeCliFor:to_uppercase}"
          - **Text** `Text CZZZZZ` (bTaTF) — text: "Cotação número {El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}"
      - **Button** `Button M` (bTPnw) — text: "Proposta" · props: icon="fa fa-plus", vertical_centering=True, icon_size=16, button_type="label_icon"
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=False
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → bgcolor="var(--color_bTHGl_default)", button_disabled=True
    - **Group** `gp add edita proposta` (bTPgD) — props: group_type="custom.tbl_propostas"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:is_empty:or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta)) → is_visible=False
      - **Group** `Group WZZZZZ` (bTzbB) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - **Group** `Group UZZZZZZ` (bTzbj) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Icon** `Icon O` (bTzbX) — props: icon="material outlined attach_email", vertical_centering=True
          - **Text** `Text I` (bTzbd) — text: "Dados do email"
        - **Group** `Group VZZZZZ` (bTzif) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group EZZZZZ` (bTzaL) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Group** `Group V` (bTOtW0) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text LZZ` (bTOtQ0) — text: "Email do cliente:"
              - **Group** `Group FZ` (bTPIb) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
                - **Dropdown** `dd email para` (bTOtK0) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.QuaisContatos:filtered(constraints={0={key="cpo_ativo_boolean", value=True, constraint_type="equals"}}) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.EnviarPara, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                  - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color="var(--color_bTHGs_default)"
                - **Icon** `btn edita contato cliente` (bTPID) — props: icon="material outlined contact_phone"
            - **Group** `Group GZZ` (bTaRN) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text AZZZZZ` (bTaRV) — text: "Emails cópia:"
              - **Group** `Group GZZ` (bTaRP) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
                - **Input** `ipt emails copia` (bTaRU) — placeholder: "Emails separados por ;" · content: "{Parent:cpo.EmailsCopia}" · props: mandatory=False
                  - ⟂ quando Parent:cpo.EmailsCopia:is_empty:and_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta)) → content="{CurrentUser:cpo.CopiaProposta}"
          - **Group** `Group SZZZZZ` (bTzai) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text H` (bTzac) — text: "Anexos: (máx 9 itens)"
            - **multifileupload-MultiFileInput** `upf anexosdiversos` (bTzaW) — props: padding_horizontal=5, vertical_centering=True, initial=Parent:cpo.AnexosDiversos, message="Clique para  selecionar anexos", max_files=9
          - **Group** `Group CZ` (bTPCn0) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text QZZZ` (bTPCt0) — text: "Corpo do e-mail "
            - **MultiLineInput** `ipt corpoemail` (bTPCp0) — placeholder: "" · content: "Olá {El[dd email para]:get_data:cpo.NomeContato:to_capitalized_words}⏎⏎Em resposta à sua solicitação de orçamento para [b]{El[gp add edita proposta]:get_group_data:cpo.QuaisOrcamentosFornecedores:cpo.QualProdutoModelo:cpo.NomeModelo}, [/b] temos o prazer de apresentar nossa proposta.⏎⏎Agradecemos seu interesse em nossos produtos/serviços.⏎⏎Acreditamos que nossa proposta atende às suas necessidades e expectativas. ⏎⏎Estamos à disposição para esclarecer quaisquer dúvidas e fornecer mais informações.⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]" · props: unique_id="remodela"
      - **Group** `Group FZZZZZZ` (bTzbM) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - **Group** `Group VZZZZZZ` (bTzbr) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Icon** `Icon Y` (bTzbx) — props: icon="material outlined document_scanner", vertical_centering=True
          - **Text** `Text OZZZZZZZZ` (bTzbw) — text: "Dados da proposta"
        - **Group** `Group GZ` (bTzZz) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group W` (bTOtn0) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text NZZ` (bTOtt0) — text: "Cnpj cliente:"
            - **Group** `Group HZ` (bTPIt) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Dropdown** `dd faturar para` (bTOtp0) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.QuaisEnderecos:filtered(constraints={0={key="cpo_ativo_boolean", value=True, constraint_type="equals"}}) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.FaturarPara, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} - {InjectedValue:cpo.Fantasia:to_lowercase:to_capitalized_words} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.CnpjCpf}"
                - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color="var(--color_bTHGs_default)"
              - **Icon** `btn edita endereco cliente` (bTPIj) — props: icon="material outlined contact_mail"
          - **Group** `Group WZZZZZZ` (bTzcI0) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text VZZZZZZZZ` (bTzcT0) — text: "Cnpj fornecedor:"
            - **Group** `Group WZZZZZZ` (bTzcN0) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Dropdown** `dd cnpj fornecedor` (bTzcP0) — data_source: El[pop add edita propostas]:get_group_data:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.QualFornecedor:cpo.QuaisEnderecos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.FaturarPara, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} - {InjectedValue:cpo.CnpjCpf}"
                - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                - ⟂ quando This:is_hovered:or_(This:is_focused) → 
              - **Icon** `btn edita endereco fornecedor` (bTzcO0) — props: icon="material outlined contact_mail"
          - **Group** `Group AZ` (bTPCF0) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text NZZZ` (bTPCL0) — text: "Condição de pgto:"
            - **Input** `ipt condicao pagto` (bTPCK0) — placeholder: "00 dd" · content: "{Parent:cpo.CondicaoPgto}"
              - ⟂ quando Parent:cpo.CondicaoPgto:is_empty → content="{∅}Mediante analise do financeiro"
          - **Group** `Group BZ` (bTPCQ0) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text OZZZ` (bTPCW0) — text: "Dt prevista entrega:"
            - **DateInput** `dt prevista entrega` (bTPCV0) — placeholder: "dd/mm/aa" · content: Parent:cpo.DtPrevEntrega · props: overwrite_placeholder=True
        - **Group** `Group DZZZZZ` (bThEb) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Text** `Text V` (bThEh) — text: "Informações adicionais:"
          - **MultiLineInput** `ipt infoadicional` (bThEg) — placeholder: "" · content: "{Parent:cpo.InfoAdicional}" · props: unique_id="remodela"
      - **Group** `Group AZZ` (bTQCH) — oculto ao carregar · props: vertical_centering=True
        - ⟂ quando El[btn proposta salvar]:is_hovered:or_(El[btn proposta salvarenviar]:is_hovered):or_(El[btn proposta gravar]:is_hovered):or_(El[btn proposta gravarenviar]:is_hovered) → is_visible=True
        - **Icon** `Icon MZZ` (bTQCM) — props: icon="material outlined info"
        - **Text** `Text VZZZZ` (bTQCN) — text: ""
          - ⟂ quando El[btn proposta gravar]:is_hovered:or_(El[btn proposta salvar]:is_hovered) → text=""Gravar" significa que a proposta [b]não será enviada[/b] nesse momento. Os dados [b]acima[/b] podem ser alteradas até o momento que a proposta for enviada."
          - ⟂ quando El[btn proposta gravarenviar]:is_hovered:or_(El[btn proposta salvarenviar]:is_hovered) → text=""Gravar e Enviar" significa que a proposta [b]será enviada[/b] nesse momento. Após enviada a proposta não pode ser alterada. Se houver necessidade será necessário criar uma nova proposta."
      - **Group** `Group DZ` (bTPEf) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta) → is_visible=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → is_visible=False
        - **Button** `btn proposta gravar` (bTPEN) — text: "Gravar" · props: vertical_centering=True
        - **Button** `btn proposta gravarenviar` (bTPET) — text: "Gravar e Enviar" · props: vertical_centering=True
        - **Button** `btn proposta cancelagravar` (bTPEZ) — text: "Cancela"
      - **Group** `Group LZ` (bTPgt) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → is_visible=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:not_equals(Opt.Ações.Edita Proposta) → is_visible=False
        - **Button** `btn proposta salvar` (bTPgv) — text: "Salvar"
        - **Button** `btn proposta salvarenviar` (bTPgz) — text: "Salvar e Enviar"
        - **Button** `btn proposta cancelasalvar` (bTPhA) — text: "Cancela"
    - **Table** `Table I` (bTPiO) — data_source: Parent:cpo.QuaisPropostas:sorted(descending=True, sort_field="Created Date") · props: group_type="custom.tbl_propostas", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:is_empty:or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta)) → is_visible=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=False
      - **TableMainAxis** `TableMainAxis O` (bTPjK) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis I` (bTPjQ) — props: axis_index=0
        - **TableCell** `Cell R` (bTPjR) — props: cell_main_axis_id="bTPjK"
          - **Text** `Text AZZZZ` (bTPjn) — text: "Fornecedor"
        - **TableCell** `Cell JZZZ` (bTPkd) — props: cell_main_axis_id="bTPkX"
        - **TableCell** `Cell SZZZ` (bTaNR) — props: cell_main_axis_id="bTaNL"
          - **Text** `Text ZZZZZ` (bTaNv) — text: "Núm"
        - **TableCell** `Cell VZZZ` (bTagP) — props: cell_main_axis_id="bTagJ"
        - **TableCell** `Cell XZZZ` (bTahz0) — props: cell_main_axis_id="bTaht0"
          - **Text** `Text GZZZZZ` (bTaid0) — text: "Produtos"
      - **TableCrossAxis** `TableCrossAxis I` (bTPjX) — props: axis_index=1, cross_axis_repeat=True
        - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_primary_default_rgb), 0.08)"
        - **TableCell** `Cell R` (bTPjb) — props: cell_main_axis_id="bTPjK"
          - **Text** `Text EZZZZ` (bTPlT) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}", delimiter="⏎")}"
        - **TableCell** `Cell KZZZ` (bTPkj) — props: cell_main_axis_id="bTPkX"
          - **Icon** `Icon MZ` (bTPly) — props: icon="material outlined edit", title_attribute="editar proposta (somente se não foi enviada) "
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Icon** `Icon NZ` (bTPot) — props: icon="material outlined attach_file", title_attribute="visualizar proposta enviada"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.AquivoProposta:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Icon** `Icon OZ` (bTPmE) — props: icon="material outlined send", title_attribute="Proposta enviada? {Ancestor[TableCrossAxis]:cpo.PropostaEnviada}"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → is_visible=False
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_false → is_visible=True
          - **Group** `Group D` (bTeVZ) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_propostas", vertical_centering=True
            - ⟂ quando This:is_hovered → boxshadow_style="outset", boxshadow_blur=2
            - **Image** `btn reenviar proposta` (bTeVF) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1729685584587x372935738891563500/resend.svg", title_attribute="reenviar proposta"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_false → is_visible=False
          - **Icon** `Icon KZZZ` (bTaVJ) — props: icon="material outlined shopping_cart_checkout", button_disabled=True, title_attribute="transformar proposta em pedido"
            - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]):and_(Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true) → icon_color="var(--color_primary_default)", button_disabled=False
        - **TableCell** `Cell TZZZ` (bTaNX) — props: cell_main_axis_id="bTaNL"
          - **Text** `Text YZZZZ` (bTaNp) — text: "{Ancestor[TableCrossAxis]:cpo.PropostaNum}"
        - **TableCell** `Cell WZZZ` (bTagV) — props: cell_main_axis_id="bTagJ"
          - **Icon** `seleciona proposta` (bTagn) — props: icon="material outlined radio_button_unchecked"
            - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]) → icon="material outlined radio_button_checked"
        - **TableCell** `Cell YZZZ` (bTaiF0) — props: cell_main_axis_id="bTaht0"
          - **Text** `Text FZZZZZ` (bTaiX0) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - {InjectedValue:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}", delimiter="⏎")}"
      - **TableMainAxis** `TableMainAxis WZ` (bTPkX) — props: axis_index=7
      - **TableMainAxis** `TableMainAxis BZZ` (bTaNL) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis DZZ` (bTagJ) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis EZZ` (bTaht0) — props: axis_index=3
    - **Group** `gp proposta a anexar` (bTPqM) — props: group_type="custom.tbl_propostas", vertical_centering=True
      - **Plugin[1648430145817x673906689668022300]/AAc** `PDF/IMG PROPOSTA` (bTPDx0)
  - **Icon** `Icon OZZ` (bTaPK) — props: icon="material outlined close"
- **Popup** `pop add edita cotacao` (bTNaG) — props: group_type="custom.tbl_orcamento"
  - **Group** `Group B` (bTNbb) — data_source: Parent · props: group_type="custom.tbl_orcamento"
    - **Group** `Group CZZ` (bTaHF) — data_source: Parent · props: group_type="custom.tbl_orcamento"
      - **Group** `Group L` (bTOQl) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text WZ` (bTOQT) — text: "Nova Cotação" · props: vertical_centering=False
          - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → text="Nova Cotação"
          - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → text="Edita Cotação"
        - **Group** `Group IZZZZZZZ` (bUEtP) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Plugin[1680110374647x249108010620944400]/AAx** `CustomCheckbox A` (bUEtV) — props: AAg=Parent:Cpo.Amostra, AAj="rgba(237,237,237,1)", AAl="rgba(238,238,238,1)", AAo="rgba(198,198,198,1)", AAp=2, ABD="rgba(255,239,239,1)"
          - **Text** `Text TZZZZZZZZZ` (bUEtR) — text: "Pedido de Amostra"
        - **Group** `g Input` (bTNaL) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTNaM) — text: "Cotação núm." · props: font_alignment="center"
          - **Input** `ip num orcamento` (bTNaN) — placeholder: "" · content: Parent:cpo.CotacaoNum · content_format: "int_number" · props: font_alignment="center", disabled=True
            - ⟂ quando Parent:is_empty → content=Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1)
      - **Group** `Group K` (bTOOm) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Image** `Image A` (bTOQZ) — props: src="{El[ipt buscacliente]:get_data:cpo.Foto}", editor_preview_image="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1730482424502x336125780431834300/landscape-placeholder%5B1%5D.svg"
          - ⟂ quando El[ipt buscacliente]:get_data:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - ⟂ quando El[ipt buscacliente]:get_data:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Group** `g Input` (bTNaR) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTNaS) — text: "Cliente"
          - **Group** `gp add novo cliente` (bTeyX) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **AutocompleteDropdown** `ipt buscacliente` (bTNaT) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Buscar cliente" · props: mandatory=True, default=Parent:cpo.QualCliente, unique_id="upper", ac_list_max=25, field_to_search="cpo_nomecliente_text", border_style_top="none", allow_not_in_list=True, border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
              - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
              - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)"
              - ⟂ quando Parent:is_not_empty → disabled=True
              - ⟂ quando El[pop.AgendaEnderecos A]:custom.var_recemcadastrado_:is_not_empty → default=El[pop.AgendaEnderecos A]:custom.var_recemcadastrado_
            - **Icon** `Icon V` (bTeyQ) — props: icon="material filled person_add"
              - ⟂ quando Parent:is_not_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
        - **Group** `Group FZZZZ` (bTcjM) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text SZZZZZZZ` (bTcjR) — text: "Endereço de entrega:" · props: vertical_centering=True
          - **Group** `Group FZZZZ` (bTcjS) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Dropdown** `dd enderecoentregacliente` (bTcjT) — data_source: Search(Tbl.EnderecosCliFor: cpo.QualGrupoCliFor equals El[ipt buscacliente]:get_data) · placeholder: "Selecione o destino" · props: mandatory=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words}/{InjectedValue:cpo.UF:to_uppercase}"
              - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
              - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
            - **Icon** `Icon PZ` (bTcjX) — props: icon="material outlined contact_mail"
              - ⟂ quando El[ipt buscacliente]:get_data:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **Group** `Group J` (bTOOa) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Image** `Image G` (bTaKZ) — props: src="", button_disabled=True
          - ⟂ quando El[rd empresa megabox]:get_data:equals(Opt.EmpresaMegabox.Megabox) → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1714500060178x676720324417465700/favicon%20megabox.png?_gl=1*z46kre*_gcl_au*OTk0Nzk3NzI0LjE3MTM3OTAwNTM.*_ga*NjI4NzMxNjM2LjE3MDYwMTA5MDU.*_ga_BFPVR2DEE2*MTcxNzE1NTcxNC44MC4xLjE3MTcxOTEzNDguNjAuMC4w"
          - ⟂ quando El[rd empresa megabox]:get_data:equals(Opt.EmpresaMegabox.Paletes Brasil) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1717206119850x663794755204967700/aaa%20WhatsApp%20Image%202024-05-31%20at%2018.58.20.png"
        - **RadioButtons** `rd empresa megabox` (bTaKR) — data_source: All(Opt.EmpresaMegabox) · props: mandatory=True, default=Parent:cpo.EmpresaMegabox, unique_id="rdempresas", dynamic_type="option.opt_empresamegabox", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Parent:is_empty → default=Opt.EmpresaMegabox.Megabox
        - **Group** `g Input` (bTNaX) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTNaY) — text: "Data cotação"
          - **Input** `ip data orcamento` (bTNaZ) — placeholder: "" · content: "{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: disabled=True
            - ⟂ quando Parent:is_empty → content="{Page.Current Date/Time:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
        - **Group** `g DateTimePicker` (bTNad) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTNae) — text: "Data Validade"
          - **DateInput** `ip data validade` (bTNaf) — content: Parent:cpo.DataValidade · props: mandatory=True, border_style_left="none", four_border_style=True, border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando Parent:is_empty → content=Page.Current Date/Time:plus_days(2)
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_style_bottom="solid"
        - **Group** `g Input` (bTNaj) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTNak) — text: "Vendedor"
          - **Input** `ip vendedor` (bTNal) — placeholder: "" · content: "{Parent:Created By:cpo.NomeModelo:to_capitalized_words}" · props: disabled=True
            - ⟂ quando Parent:is_empty → content="{CurrentUser:cpo.NomeModelo:to_capitalized_words}"
    - **Group** `gp add produto` (bTOMF) — props: group_type="custom.tbl_orcamentoprodutos"
      - **Group** `Group E` (bTaID) — props: group_type="custom.tbl_orcamento"
        - **Text** `Text WZZZZ` (bTaIO) — text: "Novo Produto" · props: vertical_centering=False
          - ⟂ quando El[Página vendas]:custom.var_a__oor_amento_:equals(Opt.Ações.Novo Produto) → text="Adicionar produto ao carrinho"
          - ⟂ quando El[Página vendas]:custom.var_a__oor_amento_:equals(Opt.Ações.Edita Produto) → text="Edita produto do carrinho"
        - **Group** `Group FZZZZZ` (bThUn) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - ⟂ quando This:is_hovered → boxshadow_blur=2
          - **Image** `abre cadastro produtos` (bTgZM) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733341112464x836081496925408500/pallet-solid%20blue.svg", title_attribute="Cadastro de produtos"
      - **Group** `Group DZZ` (bTaHd) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
        - **Group** `g Dropdown` (bTNap) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTNaq) — text: "Tipo Produto"
          - **Dropdown** `dd add grupo produto` (bTNar) — data_source: Search(Tbl.ProdutosGrupo; sort cpo.NomeGrupo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProdutoGrupo, dynamic_type="custom.tbl_produtossubgrupo", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeGrupo:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Dropdown` (bTNav) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTNaw) — text: "Produto"
          - **Dropdown** `dd add modelo produto` (bTNax) — data_source: Search(Tbl.ProdutosModelo: cpo.QualGrupoProduto equals El[dd add grupo produto]:get_data AND cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProduto, dynamic_type="custom.tbl_produtos", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Icon** `edita produto` (bThEO) — props: icon="material outlined edit", vertical_centering=True, title_attribute="Editar produto"
      - **Group** `Group EZZ` (bTaHl) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
        - **Group** `g Dropdown` (bTNbB) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTNbC) — text: "Condição"
          - **Dropdown** `dd add condicao` (bTNgr) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisCondicoes · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.Condicao, dynamic_type="option.opt_produtoscondicao", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Dropdown` (bTNbH) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTNbI) — text: "Linha"
          - **Dropdown** `dd add linha` (bTNbJ) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisLinhas · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.Linha, dynamic_type="option.opt_produtoslinhas", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
            - ⟂ quando El[dd add condicao]:get_data:equals(Opt.ProdutosCondicao.Usado) → default=Opt.ProdutosLinhas.Usado
        - **Group** `g Input` (bTNbT) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTNbU) — text: "Qtd"
          - **Input** `ip add qtd` (bTNbV) — placeholder: "000" · content: Parent:cpo.qtd · content_format: "int_number" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Input` (bTNbN) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTNbO) — text: "Medida, descrição ou obs."
          - **Input** `ip add medida` (bTNbP) — placeholder: "00 x 00" · content: "{Parent:cpo.Medida}" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Icon** `add produto` (bTNge) — props: icon="fa fa-cart-arrow-down"
          - ⟂ quando El[Página vendas]:custom.var_a__oor_amento_:equals(Opt.Ações.Novo Produto) → is_visible=True
          - ⟂ quando El[Página vendas]:custom.var_a__oor_amento_:not_equals(Opt.Ações.Novo Produto) → is_visible=False
        - **Icon** `salvar produto` (bTOOy) — props: icon="material outlined save"
          - ⟂ quando El[Página vendas]:custom.var_a__oor_amento_:equals(Opt.Ações.Edita Produto) → is_visible=True
          - ⟂ quando El[Página vendas]:custom.var_a__oor_amento_:not_equals(Opt.Ações.Edita Produto) → is_visible=False
  - **Table** `rpg produto orcamento` (bTNcK) — data_source: CurrentUser:cpo.TempOrcamentoProdutos · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=4, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=10
    - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → data_source=Parent:cpo.QuaisProdutos:merged_with(CurrentUser:cpo.TempOrcamentoProdutos)
    - **TableCrossAxis** `TableCrossAxis B` (bTNdT) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell F` (bTNdX) — props: cell_main_axis_id="bTNdG"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Table** `tbl nome produto` (bTOUm0) — props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis HZ` (bTOUr0) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis F` (bTOUx0) — props: axis_index=0
            - **TableCell** `Cell JZZ` (bTOUy0) — props: cell_main_axis_id="bTOUr0"
              - **Image** `Image I` (bTaLZ) — props: src="{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.QualTipoProduto:cpo.Icon}"
              - **Group** `Group F` (bTOaI0) — props: vertical_centering=True
                - **Text** `Text P` (bTNhB) — text: "{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                - **Text** `Text UZ` (bTODV) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}" · props: vertical_centering=True
              - **Text** `indica fornecedores` (bTOZw0) — text: "{El[rpg fornecedorescotacao]:get_list_data:count}" · props: font_alignment="center", title_attribute="Qtd de fornecedores dessa cotação"
              - **Icon** `indica vencedor` (bTOaU) — props: icon="fa fa-trophy", title_attribute="Vencedor dessa cotação: {Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.QualFornecedor:cpo.NomeCliFor:to_capitalized_words}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:greater_or_equal_than(1) → is_visible=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:less_than(1) → is_visible=False
            - **TableCell** `Cell JZZ` (bTOVK0) — props: cell_main_axis_id="bTOWY0"
              - **Input** `ip totalbruto` (bTOWA0) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell JZZ` (bTOVL0) — props: cell_main_axis_id="bTOWZ0"
              - **Icon** `btn remove orcamentoproduto` (bTOEk) — props: icon="material outlined delete_forever"
            - **TableCell** `Cell JZZ` (bTOVP0) — props: cell_main_axis_id="bTOWd0"
              - **Input** `ip totalcomissao` (bTOWH0) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
                - ⟂ quando El[CustomCheckbox A]:get_AAw:is_true → mandatory=False
            - **TableCell** `Cell JZZ` (bTOVQ0) — props: cell_main_axis_id="bTOWe0"
              - **Icon** `Icon B` (bTOWM0) — props: icon="fa fa-chevron-down"
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → icon="fa fa-chevron-up"
            - **TableCell** `Cell JZZ` (bTOVR0) — props: cell_main_axis_id="bTOWf0"
              - **Input** `ip totalliquido` (bTOWR0) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell KZZ` (bTOal0) — props: cell_main_axis_id="bTOaf0"
              - **Input** `ip totalbruto copy 4` (bTOdx0) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaUnit · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell MZZ` (bTObP0) — props: cell_main_axis_id="bTObJ0"
              - **Input** `ip totalbruto copy 3` (bTOdn0) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.valorcomissao · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell OZZ` (bTObt0) — props: cell_main_axis_id="bTObn0"
              - **Input** `ip totalbruto copy 5` (bTOeL0) — placeholder: "" · content: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.TipoFrete:display}" · props: font_alignment="center", disabled=True, placeholder_color="var(--color_bTHGl_default)"
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell QZZ` (bTOcX0) — props: cell_main_axis_id="bTOcR0"
              - **Input** `ip totalbruto copy 2` (bTOdg0) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorFrete · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell SZZ` (bTOdB0) — props: cell_main_axis_id="bTOcv0"
              - **Input** `ip totalbruto copy` (bTOdZ0) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorPISCOFINS · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
          - **TableCrossAxis** `TableCrossAxis F` (bTOVV0) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell JZZ` (bTOVW0) — props: cell_main_axis_id="bTOUr0"
            - **TableCell** `Cell JZZ` (bTOVz0) — props: cell_main_axis_id="bTOWY0"
            - **TableCell** `Cell JZZ` (bTOWB0) — props: cell_main_axis_id="bTOWZ0"
            - **TableCell** `Cell JZZ` (bTOWG0) — props: cell_main_axis_id="bTOWd0"
            - **TableCell** `Cell JZZ` (bTOWL0) — props: cell_main_axis_id="bTOWe0"
            - **TableCell** `Cell JZZ` (bTOWN0) — props: cell_main_axis_id="bTOWf0"
            - **TableCell** `Cell LZZ` (bTOar0) — props: cell_main_axis_id="bTOaf0"
            - **TableCell** `Cell NZZ` (bTObV0) — props: cell_main_axis_id="bTObJ0"
            - **TableCell** `Cell PZZ` (bTObz0) — props: cell_main_axis_id="bTObn0"
            - **TableCell** `Cell RZZ` (bTOcd0) — props: cell_main_axis_id="bTOcR0"
            - **TableCell** `Cell TZZ` (bTOdH0) — props: cell_main_axis_id="bTOcv0"
          - **TableMainAxis** `TableMainAxis HZ` (bTOWY0) — props: axis_index=8
          - **TableMainAxis** `TableMainAxis HZ` (bTOWZ0) — props: axis_index=11
          - **TableMainAxis** `TableMainAxis HZ` (bTOWd0) — props: axis_index=10
          - **TableMainAxis** `TableMainAxis HZ` (bTOWe0) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis HZ` (bTOWf0) — props: axis_index=9
          - **TableMainAxis** `TableMainAxis IZ` (bTOaf0) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis JZ` (bTObJ0) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis KZ` (bTObn0) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis LZ` (bTOcR0) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis MZ` (bTOcv0) — props: axis_index=7
        - **Table** `rpg fornecedorescotacao` (bTNwH) — oculto ao carregar · data_source: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_color="rgba(var(--color_surface_default_rgb), 0)", vertical_separator_width=4, horizontal_separator_color="var(--color_surface_default)", horizontal_separator_width=2
          - ⟂ quando El[Página vendas]:custom.var_todosfornecedores_:is_true → is_visible=True
          - **TableMainAxis** `TableMainAxis I` (bTNxD) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis I` (bTNxE) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis I` (bTNxF) — props: axis_index=3
          - **TableCrossAxis** `TableCrossAxis C` (bTNxJ) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell J` (bTNxK) — props: cell_main_axis_id="bTNxD"
            - **TableCell** `Cell J` (bTNxL) — props: cell_main_axis_id="bTNxE"
            - **TableCell** `Cell J` (bTNxP) — props: cell_main_axis_id="bTNxF"
            - **TableCell** `Cell CZ` (bTNyB) — props: cell_main_axis_id="bTNxv"
            - **TableCell** `Cell EZ` (bTNyf) — props: cell_main_axis_id="bTNyZ"
            - **TableCell** `Cell GZ` (bTOAK) — props: cell_main_axis_id="bTOAE"
            - **TableCell** `Cell IZ` (bTOBj) — props: cell_main_axis_id="bTOBd"
            - **TableCell** `Cell KZ` (bTOCN) — props: cell_main_axis_id="bTOCH"
            - **TableCell** `Cell MZ` (bTODh) — props: cell_main_axis_id="bTODb"
            - **TableCell** `Cell DZZ` (bTONR0) — props: cell_main_axis_id="bTONL0"
            - **TableCell** `Cell HZZ` (bTORy0) — props: cell_main_axis_id="bTORs0"
          - **TableCrossAxis** `TableCrossAxis C` (bTNxQ) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell J` (bTNxR) — props: cell_main_axis_id="bTNxD"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Text** `Text S` (bTNxb) — text: "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.UF:to_uppercase}"
              - **Text** `Text RZ` (bTONv0) — text: "{Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:display:to_capitalized_words}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:is_empty → text="{∅}Falta regime tributário"
            - **TableCell** `Cell J` (bTNxV) — props: cell_main_axis_id="bTNxE"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorvenda` (bTNzJ) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", always_show_decimals=True
            - **TableCell** `Cell J` (bTNxW) — props: cell_main_axis_id="bTNxF"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorcomissao` (bTNzP) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
            - **TableCell** `Cell DZ` (bTNyH) — props: cell_main_axis_id="bTNxv"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Dropdown** `dd tipofrete` (bTOAo) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, font_alignment="center", bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
            - **TableCell** `Cell FZ` (bTNyl) — props: cell_main_axis_id="bTNyZ"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorfrete` (bTNzZ) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
                - ⟂ quando El[dd tipofrete]:get_data:not_equals(Opt.TipoFrete.CIF Informado) → content=0, bgcolor="var(--color_bTHGh_default)", disabled=True
            - **TableCell** `Cell HZ` (bTOAQ) — props: cell_main_axis_id="bTOAE"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Group** `Group JZ` (bTPfh) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Input** `ip icms` (bTOCx) — placeholder: "ICMS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
                  - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → content=Search(Tbl.IcmsEstados):filtered(constraints={0={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoDestino:cpo.UF:equals(InjectedValue:cpo.Destino:display), constraint_type=∅}, 1={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoOrigem:cpo.UF:equals(InjectedValue:cpo.Origem:display), constraint_type=∅}}):first_element:cpo.AliquotaIcms
                - **Icon** `Icon TZZ` (bTPat) — props: icon="material outlined search"
              - **Input** `ip piscofins` (bTOnD) — placeholder: "PIS/COFINS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=True, border_roundness_left=0
              - **Input** `ipt calculotributo` (bTOES) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS:plus(Ancestor[TableCrossAxis]:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell JZ` (bTOBp) — props: cell_main_axis_id="bTOBd"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalbruto` (bTODE) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell LZ` (bTOCT) — props: cell_main_axis_id="bTOCH"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Icon** `btn remove orcamento fornecedor` (bTODL) — props: icon="material outlined delete"
            - **TableCell** `Cell NZ` (bTODn) — props: cell_main_axis_id="bTODb"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalcomissao` (bTOEL) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell EZZ` (bTONX0) — props: cell_main_axis_id="bTONL0"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Icon** `icon ganhador ` (bTOUC0) — props: icon="bootstrap trophy"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → icon="bootstrap trophy-fill", icon_color="var(--color_bTHHX_default)"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:less_than(0.01):and_(El[CustomCheckbox A]:get_AAw:is_false) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.valorcomissao:less_than(0.01):and_(El[CustomCheckbox A]:get_AAw:is_false) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
                - ⟂ quando El[CustomCheckbox A]:get_AAw:is_true → icon_color="var(--color_primary_default)", button_disabled=False
            - **TableCell** `Cell IZZ` (bTOSE0) — props: cell_main_axis_id="bTORs0"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalliquido` (bTOSc0) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:equals(El[ip valorminimo]:get_data) → font_color="var(--color_bTHHX_default)"
              - **Input** `ip valorminimo` (bTvJP) — oculto ao carregar · placeholder: "R$ 0,00" · content: El[rpg fornecedorescotacao]:get_list_data:cpo.ValorVendaLiquido:min · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **TableMainAxis** `TableMainAxis Q` (bTNxv) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis R` (bTNyZ) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis S` (bTOAE) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis T` (bTOBd) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis U` (bTOCH) — props: axis_index=10
          - **TableMainAxis** `TableMainAxis V` (bTODb) — props: axis_index=9
          - **TableMainAxis** `TableMainAxis EZ` (bTONL0) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis GZ` (bTORs0) — props: axis_index=8
      - **TableCell** `Cell F` (bTNdY) — props: cell_main_axis_id="bTNdH"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Input** `Input B` (bTNjq) — placeholder: "000" · auto_binding: True · content_format: "int_number" · props: font_alignment="center", bind_field="cpo_qtd_number"
      - **TableCell** `Cell I` (bTNer) — props: cell_main_axis_id="bTNef"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn adiciona fornecedor` (bTNhN) — props: icon="material outlined factory", title_attribute="Adiciona fornecedor para orçar"
      - **TableCell** `Cell BZ` (bTNsX0) — props: cell_main_axis_id="bTNsL0"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn adiciona destino` (bTNhT) — props: icon="material outlined pin_drop", title_attribute="Destino desse produto"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:is_not_empty → icon_color="var(--color_bTHHX_default)"
      - **TableCell** `Cell XZZ` (bTOhQ0) — props: cell_main_axis_id="bTOhE0"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn edita produto` (bTOhi0) — props: icon="material outlined edit", title_attribute="Destino desse produto"
    - **TableMainAxis** `TableMainAxis D` (bTNdG) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis D` (bTNdH) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis B` (bTNdM) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell F` (bTNdN) — props: cell_main_axis_id="bTNdG"
        - **Table** `Table E` (bTOFB) — props: group_type="option.opt_a__oclifor", vertical_centering=True, vertical_separator_color="var(--color_surface_default)", vertical_separator_width=4, horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis W` (bTOFx) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis W` (bTOFy) — props: axis_index=9
          - **TableCrossAxis** `TableCrossAxis E` (bTOGK) — oculto ao carregar · props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=True, fixed_number_repeating_axis_count=0
            - **TableCell** `Cell OZ` (bTOGL) — props: cell_main_axis_id="bTOFx"
            - **TableCell** `Cell OZ` (bTOGP) — props: cell_main_axis_id="bTOFy"
            - **TableCell** `Cell QZ` (bTOGh) — props: cell_main_axis_id="bTOGV"
            - **TableCell** `Cell SZ` (bTOHL) — props: cell_main_axis_id="bTOGz"
            - **TableCell** `Cell UZ` (bTOHp) — props: cell_main_axis_id="bTOHd"
            - **TableCell** `Cell WZ` (bTOIT) — props: cell_main_axis_id="bTOIH"
            - **TableCell** `Cell YZ` (bTOIx) — props: cell_main_axis_id="bTOIl"
            - **TableCell** `Cell AZZ` (bTOJb) — props: cell_main_axis_id="bTOJP"
            - **TableCell** `Cell CZZ` (bTOKF) — props: cell_main_axis_id="bTOJt"
            - **TableCell** `Cell FZZ` (bTORU0) — props: cell_main_axis_id="bTORO0"
          - **TableMainAxis** `TableMainAxis X` (bTOGV) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis Y` (bTOGz) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis Z` (bTOHd) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis AZ` (bTOIH) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis BZ` (bTOIl) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis CZ` (bTOJP) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis DZ` (bTOJt) — props: axis_index=8
          - **TableCrossAxis** `TableCrossAxis E` (bTOGD) — props: axis_index=0
            - **TableCell** `Cell OZ` (bTOGE) — props: cell_main_axis_id="bTOFx"
              - **Icon** `btn abrir todos` (bTaJp) — props: icon="material outlined keyboard_double_arrow_down"
                - ⟂ quando El[Página vendas]:custom.var_todosfornecedores_:is_true → icon="material outlined keyboard_double_arrow_up"
              - **Text** `Text LZ` (bTNsq0) — text: "Produto / Fornecedor"
            - **TableCell** `Cell OZ` (bTOGF) — props: cell_main_axis_id="bTOFy"
            - **TableCell** `Cell PZ` (bTOGb) — props: cell_main_axis_id="bTOGV"
              - **Text** `Text NZ` (bTNzg) — text: "Produto Unit." · props: font_alignment="center"
            - **TableCell** `Cell RZ` (bTOHF) — props: cell_main_axis_id="bTOGz"
              - **Text** `Text OZ` (bTNzm) — text: "Comissão Unit." · props: font_alignment="center"
            - **TableCell** `Cell TZ` (bTOHj) — props: cell_main_axis_id="bTOHd"
              - **Text** `Text PZ` (bTNzs) — text: "Tipo Frete" · props: font_alignment="center"
            - **TableCell** `Cell VZ` (bTOIN) — props: cell_main_axis_id="bTOIH"
              - **Text** `Text QZ` (bTNzy) — text: "Valor Frete" · props: font_alignment="center"
            - **TableCell** `Cell XZ` (bTOIr) — props: cell_main_axis_id="bTOIl"
              - **Text** `txt titulo icms` (bTOCr) — oculto ao carregar · text: "ICMS" · props: font_alignment="center"
              - **Text** `txt titulo piscofins` (bTOnd) — oculto ao carregar · text: "PIS/COFINS" · props: font_alignment="center"
              - **Text** `Text BZZ` (bTOnj) — text: "Aliq. ICMS" · props: font_alignment="center"
              - **Text** `Text A` (bTdiL0) — text: "Aliq. PISCOFINS" · props: font_alignment="center"
              - **Text** `Text B` (bTdiR0) — text: "Total Tributos" · props: font_alignment="center"
            - **TableCell** `Cell ZZ` (bTOJV) — props: cell_main_axis_id="bTOJP"
              - **Text** `Text SZ` (bTOCl) — text: "Total Bruto" · props: font_alignment="center"
            - **TableCell** `Cell BZZ` (bTOJz) — props: cell_main_axis_id="bTOJt"
              - **Text** `Text VZ` (bTOEF) — text: "Total Comiss." · props: font_alignment="center"
            - **TableCell** `Cell GZZ` (bTORa0) — props: cell_main_axis_id="bTORO0"
              - **Text** `Text XZ` (bTOSW0) — text: "Total Líq" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis FZ` (bTORO0) — props: axis_index=7
      - **TableCell** `Cell F` (bTNdR) — props: cell_main_axis_id="bTNdH"
        - **Text** `Text MZ` (bTNsw0) — text: "QTD" · props: font_alignment="center"
      - **TableCell** `Cell G` (bTNel) — props: cell_main_axis_id="bTNef"
      - **TableCell** `Cell AZ` (bTNsR0) — props: cell_main_axis_id="bTNsL0"
      - **TableCell** `Cell WZZ` (bTOhK0) — props: cell_main_axis_id="bTOhE0"
    - **TableMainAxis** `TableMainAxis E` (bTNef) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis P` (bTNsL0) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis OZ` (bTOhE0) — props: axis_index=-1
  - **Group** `Group BZZ` (bTaGD) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Button** `btn gravarcotacao` (bTOMz) — text: "Gravar Cotação" · props: vertical_centering=True
      - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → is_visible=True
      - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:not_equals(Opt.Ações.Nova Cotação) → is_visible=False
    - **Button** `btn salvarcotacao` (bTOMt) — text: "Salvar Cotação"
      - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → is_visible=True
      - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:not_equals(Opt.Ações.Edita Cotação) → is_visible=False
    - **Button** `btn cancelacotacao` (bTONF) — text: "Cancela"
      - ⟂ quando El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)"
    - **Input** `ipt contaproduto` (bTcuu) — oculto ao carregar · content: Parent:cpo.QuaisProdutos:count · content_format: "int_number" · props: vertical_centering=True
    - **Input** `ipt contavencedor` (bTcvA) — oculto ao carregar · content: Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count · content_format: "int_number" · props: vertical_centering=True
- **Popup** `pop apagar registro` (bTJzl) — props: border_color_top="var(--color_bTHHQ_default)", border_style_top="solid", border_width_top=5, four_border_style=True, border_roundness_left=10, border_roundness_right=10
  - **Icon** `Icon A` (bTJzp) — props: icon="fa fa-exclamation-triangle"
  - **Text** `Text EZ` (bTJzq) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text FZ` (bTJzr) — text: "Você está tentando apagar um registro de seu banco e dados." · props: font_alignment="center"
  - **Text** `Text GZ` (bTJzv) — text: "Esta ação não pode ser revertida!" · props: font_alignment="center"
  - **Text** `Text HZ` (bTJzw) — text: "Deseja continuar?" · props: font_alignment="center"
  - **Button** `Button C` (bTJzx) — text: "SIM"
  - **Button** `Button D` (bTKAB) — text: "NÃO"
- **Popup** `pop add edita pedido` (bTatj) — props: group_type="custom.tbl_pedidos", vertical_centering=True
  - estado customizado `var_acaocotacao_` : Opt.Ações
  - estado customizado `var_deletarentregas_` : list.custom.tbl_entregas (lista)
  - **Group** `Group QZZZ` (bTcBR) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Group** `gp alert gravando` (bTbpv0) — oculto ao carregar · props: vertical_centering=True
      - **Text** `Text TZZZZZZ` (bTbqB0) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! "
    - **Group** `Group LZZZ` (bTbpn0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - **Group** `gp pedido corpoarquivo` (bTbDd) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True, unique_id="corpopedido"
        - **Group** `Group EZ` (bTbAY) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Image** `Image C` (bTbAZ) — props: src="{Parent:cpo.QualCotacao:cpo.EmpresaMegabox:logoimagem:imgix_treatment(fm="png")}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group EZ` (bTbAd) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Text** `Text DZZ` (bTbAe) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
            - **Text** `Text DZZ` (bTbAf) — text: "[b]Email[/b]: {CurrentUser:cpo.EmailContato:to_lowercase}"
              - ⟂ quando Parent:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email[/b]: {Parent:cpo.EmpresaMegabox:email}"
            - **Text** `Text DZZ` (bTbAj) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group EZ` (bTbAl) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Text** `Text DZZ` (bTbAq) — text: "Pedido núm: {Parent:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}"
          - **Text** `Text DZZ` (bTbAv) — text: "{Page.Current Date/Time:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Table** `rpg exibe itens pedido` (bTbap) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=4
          - **TableCrossAxis** `TableCrossAxis Q` (bTbbR) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell IZZZZ` (bTbbS) — props: cell_main_axis_id="bTbdV"
              - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
              - **Group** `Group SZZ` (bTbTH) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group LZZZZZ` (bThze) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text DZZZZZZ` (bTbTx) — text: "Dados de faturamento"
                  - **Text** `Text BZZZZZZ` (bTbTJ) — text: "[b]Razão[/b]: {Parent:cpo.QualEnderecoOrigem:cpo.Razao:to_uppercase}"
                  - **Text** `Text BZZZZZZ` (bTbTO) — text: "[b]CNPJ:[/b]  {Parent:cpo.QualEnderecoOrigem:cpo.CnpjCpf:to_uppercase}"
                  - **Text** `Text BZZZZZZ` (bTbTP) — text: "[b]Endereço:[/b]  {Parent:cpo.QualEnderecoOrigem:cpo.Endereco:to_uppercase} - {Parent:cpo.QualEnderecoOrigem:cpo.Municipio:to_uppercase} - {Parent:cpo.QualEnderecoOrigem:cpo.QualUfOpt:display}"
              - **Group** `gp D A D O S C L I E N T E` (bTbfC) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group GZZZZZZ` (bTiiX) — props: vertical_centering=True
                  - **PictureInput** `upi novocliente logo` (bTiZb) — placeholder: "" · props: src="{Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.QualGrupoCliFor:cpo.Foto:imgix_treatment(fm="png")}", private=False, disabled=True
                    - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                - **Group** `Group XZZ` (bTbev) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group CZZZ` (bTbjE) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Icon** `Icon YZZ` (bTbiy) — props: icon="material filled pin_drop"
                      - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → icon_color="var(--color_bTHHQ_default)"
                    - **Text** `Text KZZZZZZ` (bTbew) — text: "Enviar para:"
                      - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → font_color="var(--color_bTHHQ_default)"
                  - **Text** `Text KZZZZZZ` (bTbex) — text: "Razão: {Parent:cpo.QualEnderecoDestino:cpo.Razao:to_capitalized_words}⏎Endereço: {Parent:cpo.QualEnderecoDestino:cpo.Endereco:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.Complemento:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.Municipio:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.UF:to_uppercase} - {Parent:cpo.QualEnderecoDestino:cpo.Cep}⏎Cnpj: {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.CnpjCpf}⏎Insc.Est: {Parent:cpo.QualEnderecoDestino:cpo.InscEstadual}"
                    - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → text="{∅}Selecione um endereço pra entrega"
                - **Group** `Group VZZ` (bTbeY) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group DZZZ` (bTbjW) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **HTML** `HTML B` (bTbjP) — html(392 chars) · props: vertical_centering=True
                      - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → html="<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#b72d3a"><path d="M240-396h372l72-72H240v72Zm0-144h240v-72H240v72Zm-72-156v384h360l-72 72H96v-528h768v192h-72v-120H168Zm715.57 238.83q4.43 4.46 4.43 9.82 0 5.35-5 10.35l-31 32-63-63 31-32q4.77-5 10.5-5t10.5 5l42.57 42.83ZM528-144v-63.13L768-447l63 63-239.87 240H528ZM168-696v384-384Z"/></svg>"
                    - **Text** `Text JZZZZZZ` (bTbeZ) — text: "Faturar para:"
                      - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → font_color="var(--color_bTHHQ_default)"
                  - **Text** `Text JZZZZZZ` (bTbed) — text: "Razão: {Parent:cpo.QualEndereçoCobrança:cpo.Razao:to_capitalized_words}⏎Endereço: {Parent:cpo.QualEndereçoCobrança:cpo.Endereco:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.Complemento:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.Municipio:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.UF:to_uppercase} - {Parent:cpo.QualEndereçoCobrança:cpo.Cep}⏎Cnpj: {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.CnpjCpf}⏎Insc.Est: {Parent:cpo.QualEndereçoCobrança:cpo.InscEstadual}"
                    - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → text="{∅}Selecione um endereço de cobrança"
              - **Group** `Group ZZZ` (bTbgR) — props: vertical_centering=True
                - **Text** `Text GZZZZZZ` (bTbaz) — text: "Produtos"
                - **Text** `Text GZZZZZZ` (bTbbA) — text: "Qtd" · props: font_alignment="center"
                - **Text** `Text GZZZZZZ` (bTbbG) — text: "VALOR UNITÁRIO⏎Líquido de impostos" · props: font_alignment="center"
                - **Text** `Text DZZZZZZZ` (bTcUv) — text: "Frete" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZZZZZZ` (bThyv) — text: "Alíquota⏎ICMS" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text C` (bTeYl) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text EZZZZZZZ` (bTcVB) — text: "VALOR UNIT BRUTO⏎(Impostos Incluso)" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZ` (bTehw) — text: "VALOR TOTAL BRUTO" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
              - **Group** `Group TZZ` (bTbbT) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group TZZ` (bTbbX) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text GZZZZZZ` (bTbbY) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                  - **Text** `Text GZZZZZZ` (bTbbZ) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Medida}"
                - **Text** `Text GZZZZZZ` (bTbbj) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
                - **Text** `Text GZZZZZZ` (bTbbl) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
                - **Group** `Group KZZZZZ` (bThzN) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text FZZZZZZZ` (bTcVH) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                  - **Text** `Text LZZZZZZZZ` (bThzH) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZZZZZZ` (bThzB) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text D` (bTeYr) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text GZZZZZZZ` (bTcVN) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZ` (bTeiC) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
              - **Group** `linha orcamentofornecedor` (bTbbx) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:less_than(1) → is_visible=False
                - **Table** `rpg entregas do produto` (bTbcB) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:sorted(descending=False, sort_field="cpo_dataentrega_date") · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
                  - **TableMainAxis** `TableMainAxis LZZ` (bTbcC) — props: axis_index=0
                  - **TableMainAxis** `TableMainAxis LZZ` (bTbcD) — props: axis_index=1
                  - **TableCrossAxis** `TableCrossAxis Q` (bTbcI) — props: axis_index=0
                    - **TableCell** `Cell IZZZZ` (bTbcJ) — props: cell_main_axis_id="bTbcC"
                      - **Text** `Text GZZZZZZ` (bTbcN) — text: "Data entrega" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTbcO) — props: cell_main_axis_id="bTbcD"
                      - **Text** `Text GZZZZZZ` (bTbcP) — text: "Qtd entrega" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTbca) — props: cell_main_axis_id="bTbdP"
                      - **Text** `Text GZZZZZZ` (bTbcb) — text: "Valor bruto " · props: font_alignment="center"
                  - **TableCrossAxis** `TableCrossAxis Q` (bTbcn) — props: axis_index=1, cross_axis_repeat=True
                    - **TableCell** `Cell IZZZZ` (bTbcr) — props: cell_main_axis_id="bTbcC"
                      - **Text** `Text GZZZZZZ` (bTbdE) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTbct) — props: cell_main_axis_id="bTbcD"
                      - **Text** `Text IZZZZZZ` (bTbeM) — text: "{Ancestor[TableCrossAxis]:cpo.QtdEntrega}" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTbdD) — props: cell_main_axis_id="bTbdP"
                      - **Text** `Text HZZZZZZ` (bTbeF) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
                  - **TableMainAxis** `TableMainAxis LZZ` (bTbdP) — props: axis_index=3
          - **TableCrossAxis** `TableCrossAxis Q` (bTbau) — props: axis_index=0
            - **TableCell** `Cell IZZZZ` (bTbav) — props: cell_main_axis_id="bTbdV"
              - **Group** `Group EZZZ` (bTbkT) — props: vertical_centering=True
                - **Text** `Text PZZZZZZ` (bTbkY) — text: "Detalhes do pedido"
          - **TableMainAxis** `TableMainAxis LZZ` (bTbdV) — props: axis_index=1
        - **Group** `Group EZ` (bTbDM) — props: vertical_centering=True
          - **Text** `Text DZZ` (bTbDN) — text: "Informações adicionais"
        - **Text** `Text TZZZZZZZ` (bTcjk) — text: "[color=#fab515][b][size=2]Número da Ordem de compra: {El[ipt pedido ordemcompra numero]:get_data}[/size][/b][/color]⏎⏎[b][size=2]Informações adicionais: {El[ipt pedido infoadd]:get_data}[/size][/b] ⏎⏎[b][size=2]Condições de pagamento: {El[dd parcelas receb comissao]:get_data:display} - {El[dd formapagto]:get_data:display}[/size][/b]⏎⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
      - **Group** `gp itens pedido` (bTaxH) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Group** `Group HZZZZZZZ` (bUETk) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Text** `Text MZZZZZZZZZ` (bUETe) — text: "Enviar email para próxima compra?"
          - **Plugin[1680110374647x249108010620944400]/AAC** `Switch C` (bUETY) — props: AAD=True, AAG="rgba(79,255,160,1)", AAH="rgba(199,199,199,1)", AAK=True, AAO="rgba(255,255,255,1)", AAQ="rgba(255,255,255,1)"
        - **Group** `Group TZZZZZ` (bTiLF0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Text** `Text DZZ` (bTaxG) — text: "Pedido ao Fornecedor" · props: font_alignment="center"
        - **Group** `gp qual cliente` (bTawp) — data_source: Parent · props: group_type="custom.tbl_pedidos"
          - **PictureInput** `upi novocliente logo` (bTawt) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
            - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - **Group** `Group EZ` (bTawu) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Text** `Text DZZ` (bTawv) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
            - **Text** `Text DZZ` (bTawz) — text: "Cotação número {Parent:cpo.QualCotacao:cpo.CotacaoNum} Proposta número {Parent:cpo.QualProposta:cpo.PropostaNum}"
          - **Icon** `Icon WZ` (bTeiP) — props: icon="material outlined contact_mail"
          - **Icon** `hide dados do pedido` (bTegh) — props: icon="material outlined vertical_align_top"
            - ⟂ quando El[dados do pedido]:isnt_visible → icon="material outlined vertical_align_bottom"
        - **Group** `dados do pedido` (bTcgL) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp coluna esquerda` (bTcfo) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Group** `gp mail cliente` (bTcqr) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Group** `gp email cliente` (bTbhA) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text NZZZZZZ` (bTbhH) — text: "Email do Cliente:"
                - **Group** `Group ZZZZ` (bTcZt) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                  - **Dropdown** `dd pedido emailcliente` (bTbhG) — data_source: Parent:cpo.QualCotacao:cpo.QualCliente:cpo.QuaisContatos:filtered(constraints={0={key="cpo_ativo_boolean", value=True, constraint_type="equals"}}) · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailCliente, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                    - ⟂ quando El[chk formalizar]:get_data → mandatory=True
                  - **Icon** `Icon YZ` (bTcZc) — props: icon="material outlined contact_phone"
              - **Group** `gp email cliente copy` (bTiCv0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text MZZZZZZZZ` (bTiDD0) — text: "CC e-mail cliente:"
                - **Input** `ipt cc email cliente` (bTiDB0) — placeholder: "Emails separados por ;" · content: "{Parent:cpo.EmailClienteCC}" · props: limit_number_of_characters=False, mandatory=False
                  - ⟂ quando Parent:cpo.EmailClienteCC:is_empty:and_(El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido)) → content="{CurrentUser:cpo.CopiaPedido}"
              - **Group** `gp corpo email cliente` (bTcex) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text Corpo do e-mail ` (bTcfD) — text: "Corpo do e-mail do cliente:"
                - **MultiLineInput** `ipt pedido corpoemailcliente` (bTcez) — placeholder: "" · content: "Olá {El[dd pedido emailcliente]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Gostaríamos de agradecer pela oportunidade de atendê-lo(a) e, conforme discutido em nossas interações anteriores, estamos formalizando o pedido.⏎⏎Se houver alguma observação relevante ou condições especiais a serem consideradas, por favor, nos avise.⏎⏎Solicitamos a gentileza de confirmar o recebimento deste e-mail.⏎⏎Estamos à disposição para esclarecer quaisquer dúvidas ou realizar ajustes necessários.⏎⏎Agradecemos mais uma vez pela confiança depositada em nossa empresa e estamos ansiosos para continuar nossa parceria!⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]⏎" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
                  - ⟂ quando This:is_focused → border_color="var(--color_bTHGs_default)"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
            - **Group** `gp mail fornecedor` (bTcfd) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Group** `gp email fornecedor` (bTbgn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text MZZZZZZ` (bTbgv) — text: "Email do fornecedor:"
                - **Group** `Group KZZZ` (bTbnv) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                  - **Dropdown** `dd pedido emailfornecedor` (bTbgu) — data_source: El[rpg pedido OrçFornecedores]:get_list_data:cpo.QualFornecedor:cpo.QuaisContatos:filtered(constraints={0={key="cpo_ativo_boolean", value=True, constraint_type="equals"}}) · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailFornecedor, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                    - ⟂ quando El[chk formalizar]:get_data → mandatory=True
                  - **Icon** `Icon XZ` (bTbne) — props: icon="material outlined contact_phone"
              - **Group** `gp email fornecedor copy` (bTiDI0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text NZZZZZZZZ` (bTiDT0) — text: "CC email fornecedor:"
                - **Input** `ipt cc email fornecedor` (bTiDO0) — placeholder: "Emails separados por ;" · content: "{Parent:cpo.EmailFornecedorCC}" · props: limit_number_of_characters=False, mandatory=False
                  - ⟂ quando Parent:cpo.EmailFornecedorCC:is_empty:and_(El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido)) → content="{CurrentUser:cpo.CopiaPedido}"
              - **Group** `gp corpo pedidoemail fornecedor` (bTbkl) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text Corpo do e-mail ` (bTbkr) — text: "Corpo do e-mail do fornecedor:"
                - **MultiLineInput** `ipt pedido corpoemailfornecedor` (bTbkq) — placeholder: "" · content: "Olá {El[dd pedido emailfornecedor]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Segue abaixo observações importantes sobre o pedido: ⏎⏎Todas as informações sobre o cliente consta no anexo do pedido. Caso precise de mais alguma informação peço por gentileza que nos solicite⏎⏎Lembrando que a comissão do pedido obedece os seguintes critérios:⏎⏎{Parent:cpo.QuaisOrcamentosFonecedores:format_as_text(content="{InjectedValue:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - comissão unitário {InjectedValue:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="comma")}", delimiter="⏎")}⏎⏎Totalizando a comissão em {Parent:cpo.QuaisOrcamentosFonecedores:cpo.ValorComissaoBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎⏎[b]Informações importantes:[/b]⏎O setor financeiro entrará em contato para negociar a forma de pagamento, que poderá ser por boleto bancário ou depósito. Caso prefira, você também pode enviar um e-mail diretamente para: financeiro@grupomegabox.com.br.⏎⏎Se o boleto for emitido, mas o pagamento for realizado via PIX ou depósito, solicitamos que a baixa seja feita imediatamente. Isso evita o encaminhamento do boleto ao cartório e a consequente geração de encargos como custas cartorárias, multas e juros.⏎⏎Ressaltamos que o Grupo MegaBox não se responsabiliza por eventuais encargos decorrentes da ausência de baixa do boleto.⏎⏎Conforme informado no início da parceria, a responsabilidade pela análise e liberação de crédito é inteiramente do FORNECEDOR. A MegaBox não realiza nem se responsabiliza por essa análise cadastral.⏎⏎Em casos de atrasos ou antecipações nas entregas, pedimos que o vendedor responsável seja informado com antecedência, para que possa comunicar o cliente e evitar custos desnecessários com frete.⏎⏎Agradecemos pela confiança e parceria com o Grupo MegaBox.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
                  - ⟂ quando This:is_focused → border_color="var(--color_bTHGs_default)"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
          - **Group** `gp coluna direita` (bTcgA) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Group** `gp anexo ordem` (bTato) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text DZZ` (bTatv) — text: "Anexo ordem de compra cliente:"
              - **Group** `Group JZZZZ` (bTcxF0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **FileInput** `upf pedido ordemcompra file` (bTatu) — placeholder: "Selecione o arquivo (máx 3mb)" · props: mandatory=False, font_alignment="left", src="{Parent:cpo.OrdemCompraArquivo}", max_size=3
                - **Icon** `Icon R` (bTcwz0) — props: icon="material outlined open_in_new"
                  - ⟂ quando El[upf pedido ordemcompra file]:get_data:is_not_empty → is_visible=True
                  - ⟂ quando El[upf pedido ordemcompra file]:get_data:is_empty → is_visible=True
            - **Group** `gp num ordem` (bTaux) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text DZZ` (bTavD) — text: "Núm ordem de compra cliente:"
              - **Input** `ipt pedido ordemcompra numero` (bTavC) — placeholder: "000000" · content: "{Parent:cpo.OrdemComrpaNum}" · props: mandatory=False
            - **Group** `gp informacoes adicionais` (bTbkw) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text RZZZZZZ` (bTblC) — text: "Informações adicionais no pedido:"
              - **MultiLineInput** `ipt pedido infoadd` (bTblB) — placeholder: "" · content: "{Parent:cpo.InformacoesAdd}" · props: unique_id="remodela"
            - **Group** `g FileUploader copy` (bTfIL) — data_source: Parent · props: group_type="custom.tbl_pedidos"
              - **Text** `Text VZZZZZZZ` (bTfIY) — text: "Condições de pagamento:"
              - **Group** `Group TZZZZZZ` (bTrlo) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **select2-MultiDropdown** `dd parcelas receb comissao` (bTfIX) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · props: default=Parent:cpo.PrazoRecebComissoes, dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
                - **Dropdown** `dd formapagto` (bTrli) — data_source: All(Opt.FormaPgto) · placeholder: "Pix, boleto, transferência" · props: mandatory=True, default=Parent:cpo.FormaPagto, vertical_centering=True, dynamic_type="option.opt_formapgto", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:display}"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                  - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color="var(--color_bTHGs_default)"
        - **Table** `rpg pedido OrçFornecedores` (bTavH) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=10
          - **TableCrossAxis** `TableCrossAxis N` (bTavs) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell ZZZZ` (bTawV) — props: cell_main_axis_id="bTawj"
              - **Group** `Group WZZ` (bTbhY) — props: vertical_centering=True
                - **Icon** `Icon FZZ` (bThqd) — props: icon="material outlined mode_edit", vertical_centering=True, button_disabled=True, title_attribute="Edite quantidade e valores dos produtos antes de informar entregas"
                  - ⟂ quando CurrentUser:equals(El[pop add edita pedido]:get_group_data:Created By) → icon_color="var(--color_primary_default)", button_disabled=False
                  - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → icon_color="var(--color_primary_default)", button_disabled=False
                - **Text** `Text DZZ` (bTavl) — text: "Produtos & Fornecedor" · props: word_spacing=-0.5
                - **CustomElement** `tool.EnderecoFornecedor A` (bThnd1) — USA Reusable tool.EnderecoFornecedor · data_source: Ancestor[TableCrossAxis] · props: custom_id="bThmz1"
                - **Text** `Text MZZZZZ` (bTbHT) — text: "Qtd" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text EZZ` (bTbEN) — text: "Comissão" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text OZZZZZZ` (bTbis) — text: " " · props: font_alignment="center"
                - **Text** `Text LZZZZZ` (bTbHJ) — text: "Frete" · props: font_alignment="center", word_spacing=-0.5
                - **Text** `Text CZZZZZZ` (bTbWN) — text: " " · props: font_alignment="center"
                - **Text** `Text NZZZZZ` (bTbHs) — text: "Valor Bruto" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZZZ` (bTbGr) — text: "Tributos" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTavf) — text: "Valor líq" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text TZZZZZ` (bTbWa) — text: "Faturar ⏎para:" · props: font_alignment="center", word_spacing=-0.5
              - **Group** `Group UZZ` (bTbIb) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group NZZ` (bTbGF) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text DZZ` (bTawW) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}" · props: word_spacing=-0.5
                  - **Text** `Text HZZZZZ` (bTbET) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Medida}" · props: word_spacing=-0.5
                - **Text** `Text DZZ` (bTavx) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda:format_number(decimal_place=0, thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZZZ` (bTbEf) — text: "{Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                  - ⟂ quando El[gp alerta divergencia comissao]:is_visible → font_color="var(--color_bTHHQ_default)"
                - **CustomElement** `tool.EnderecoEntrega A` (bTbkL) — USA Reusable tool.EnderecoEntrega · data_source: Parent · props: custom_id="bTbjh"
                - **Group** `Group OZZ` (bTbGR) — props: vertical_centering=True
                  - **Text** `Text DZZ` (bTawd) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}" · props: font_alignment="center", word_spacing=-0.5
                  - **Text** `Text IZZZZZ` (bTbEZ) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                - **Group** `btn add entrega no pedido` (bTbOj) — props: vertical_centering=True
                  - **HTML** `htm botao entrega` (bTbOP) — html(534 chars)
                    - ⟂ quando El[linha orcamentofornecedor]:get_group_data:cpo.QtdVenda:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum):equals(0) → min_height_css="0px"
                - **Text** `Text DZZ` (bTavz) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTawE) — text: "{Ancestor[TableCrossAxis]:cpo.ValorICMS:plus(Ancestor[TableCrossAxis]:cpo.ValorIPI):plus(Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS):format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTawJ) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **CustomElement** `tool.EnderecoCobranca A` (bTbYF) — USA Reusable tool.EnderecoCobranca · data_source: Parent · props: custom_id="bTbWm"
              - **Group** `linha orcamentofornecedor` (bTbRo) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:less_than(1) → is_visible=False
                - **Table** `rpg entregas do produto` (bTbIu) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisEntregas · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
                  - **TableCrossAxis** `TableCrossAxis O` (bTbKD) — props: axis_index=1, cross_axis_repeat=True
                    - **TableCell** `Cell AZZZZ` (bTbKH) — props: cell_main_axis_id="bTbJq"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHJ_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **DateInput** `ipt entrega dataprevista` (bTbKO) — placeholder: "___/___/____" · content: Ancestor[TableCrossAxis]:cpo.DataEntrega · auto_binding: False · props: font_alignment="center", vertical_centering=True, word_spacing=-0.5, bind_field="cpo_dataentrega_date", overwrite_placeholder=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → bgcolor="var(--color_bTHGh_default)", disabled=True
                    - **TableCell** `###Cell 1C` (bTbKI) — props: cell_main_axis_id="bTbJr"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHJ_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Icon** `force calc` (bTcST) — props: icon="material outlined calculate", title_attribute="Refaz o cálculo dos valores dessa entrega"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor)) → button_disabled=False
                      - **Input** `ipt entrega qtd` (bTbKa) — placeholder: "000" · content: Ancestor[TableCrossAxis]:cpo.QtdEntrega · auto_binding: True · content_format: "int_number" · props: mandatory=False, font_alignment="center", vertical_centering=True, word_spacing=-0.5, bind_field="cpo_qtdentrega_number", show_thousands=True, not_submit_on_enter=False, have_a_numerical_range=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → bgcolor="var(--color_bTHGh_default)", disabled=True
                    - **TableCell** `Cell AZZZZ` (bTbKJ) — props: cell_main_axis_id="bTbJv"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text VZZZZZ` (bTbRK) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell CZZZZ` (bTbKy) — props: cell_main_axis_id="bTbKm"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text WZZZZZ` (bTbRR) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell EZZZZ` (bTbLc) — props: cell_main_axis_id="bTbLQ"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text XZZZZZ` (bTbRb) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell KZZZZ` (bTbrl) — props: cell_main_axis_id="bTbrZ"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **CustomElement** `tool.AnexaNf A` (bTbvn) — USA Reusable pop.AnexaNf · data_source: Ancestor[TableCrossAxis] · props: custom_id="bTbua", unique_id="toolsaiuentrega"
                    - **TableCell** `Cell GZZZZ` (bTbtT) — props: cell_main_axis_id="bTbtH"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Icon** `btn cancelanetrega` (bTcjq) — props: icon="material outlined event_busy", vertical_centering=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:not_equals(Opt.Etapas.Financeiro)) → is_visible=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_false → is_visible=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → icon_color="var(--color_bTHGl_default)", is_visible=True, button_disabled=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → icon_color="var(--color_bTHGl_default)", is_visible=True, button_disabled=True
                        - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2
                      - **Icon** `chk entrega pra deletar` (bTbtv) — props: icon="material outlined check_box_outline_blank"
                        - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → is_visible=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_false → is_visible=True
                    - **TableCell** `Cell SZZZZ` (bTcPN) — props: cell_main_axis_id="bTcPB"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Group** `gp notas` (bTjTp) — props: vertical_centering=True
                        - **Text** `Text BZZZZZZZ` (bTcPl) — text: "Nf: {Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: word_spacing=-0.5
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                        - **Icon** `Icon DZZZ` (bTjTj) — props: icon="material outlined attach_file", vertical_centering=True
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor:is_empty → icon_color="var(--color_bTHGl_default)"
                      - **Group** `gp boletos` (bTjiR) — props: vertical_centering=True
                        - **Text** `Text YZZZZZZZZ` (bTjiT) — text: "Boletos ({Ancestor[TableCrossAxis]:cpo.BoletoArquivos:count})" · props: word_spacing=-0.5
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                        - **Icon** `Icon FZZZ` (bTjiX) — props: icon="material outlined attach_file", vertical_centering=True
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.BoletoArquivos:count:less_than(1) → icon_color="var(--color_bTHGl_default)"
                      - **Text** `Text LZZZZZZ` (bTclJ0) — text: "Etapa: {Ancestor[TableCrossAxis]:cpo.StatusEntrega:display}" · props: word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                  - **TableMainAxis** `TableMainAxis GZZ` (bTbJq) — props: axis_index=1
                  - **TableMainAxis** `TableMainAxis GZZ` (bTbJr) — props: axis_index=2
                  - **TableMainAxis** `TableMainAxis GZZ` (bTbJv) — props: axis_index=3
                  - **TableCrossAxis** `TableCrossAxis O` (bTbJw) — props: axis_index=0
                    - **TableCell** `Cell AZZZZ` (bTbJx) — props: cell_main_axis_id="bTbJq"
                      - **Text** `Text OZZZZZ` (bTbKU) — text: "Dt prev. entrega" · props: font_alignment="center", word_spacing=-0.5
                    - **TableCell** `Cell AZZZZ` (bTbKB) — props: cell_main_axis_id="bTbJr"
                      - **Text** `Text PZZZZZ` (bTbKg) — text: "Qtd entrega: {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group SZZZ` (bTcSI) — props: vertical_centering=True
                        - **Text** `Text UZZZZZ` (bTcSC) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltaqtd]:get_data:greater_than(0):or_(El[ipt faltaqtd]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltaqtd` (bTcRw) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.QtdVenda:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum) · content_format: "int_number" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell AZZZZ` (bTbKC) — props: cell_main_axis_id="bTbJv"
                      - **Text** `Text QZZZZZ` (bTbMF) — text: "Comissão {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group PZZZZZZ` (bTnwX0) — props: vertical_centering=True
                        - **Text** `Text HZZZZZZZZZ` (bTnwZ0) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltacomissao]:get_data:greater_than(0):or_(El[ipt faltacomissao]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltacomissao` (bTnwd0) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorComissaoBruto:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.valorcomissao:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell BZZZZ` (bTbKs) — props: cell_main_axis_id="bTbKm"
                      - **Text** `Text RZZZZZ` (bTbMT) — text: "Valor bruto {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group QZZZZZZ` (bTnwq0) — props: vertical_centering=True
                        - **Text** `Text IZZZZZZZZZ` (bTnwv0) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltabruto]:get_data:greater_than(0):or_(El[ipt faltabruto]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltabruto` (bTnww0) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorVendaBruto:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaBruto:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell DZZZZ` (bTbLW) — props: cell_main_axis_id="bTbLQ"
                      - **Text** `Text SZZZZZ` (bTbMk) — text: "Valor líq {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaLiquido:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group RZZZZZZ` (bTnxC0) — props: vertical_centering=True
                        - **Text** `Text YZZZZZ` (bTnxH0) — text: "Falta: " · props: word_spacing=-0.5
                        - **Input** `ipt faltaliquido` (bTnxI0) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorVendaLiquido:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaLiquido:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell JZZZZ` (bTbrf) — props: cell_main_axis_id="bTbrZ"
                    - **TableCell** `Cell FZZZZ` (bTbtN) — props: cell_main_axis_id="bTbtH"
                      - **Icon** `Icon VZZ` (bTbtB) — props: icon="material outlined delete_outline", button_disabled=True
                        - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:count:greater_or_equal_than(1) → icon_color="var(--color_bTHHQ_default)", button_disabled=False
                    - **TableCell** `Cell RZZZZ` (bTcPH) — props: cell_main_axis_id="bTcPB"
                      - **Text** `Text AZZZZZZZ` (bTcPf) — text: "Núm NF " · props: font_alignment="center", word_spacing=-0.5
                  - **TableMainAxis** `TableMainAxis HZZ` (bTbKm) — props: axis_index=4
                  - **TableMainAxis** `TableMainAxis IZZ` (bTbLQ) — props: axis_index=5
                  - **TableMainAxis** `TableMainAxis MZZ` (bTbrZ) — props: axis_index=7
                  - **TableMainAxis** `TableMainAxis JZZ` (bTbtH) — props: axis_index=0
                  - **TableMainAxis** `TableMainAxis RZZ` (bTcPB) — props: axis_index=6
          - **TableCrossAxis** `TableCrossAxis N` (bTavO) — props: axis_index=0
            - **TableCell** `Cell ZZZZ` (bTavh) — props: cell_main_axis_id="bTawj"
          - **TableMainAxis** `TableMainAxis FZZ` (bTawj) — props: axis_index=1
        - **Group** `gp alerta divergencia comissao` (bTctU) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - ⟂ quando El[ipt difereca comissao]:get_data:greater_than(0):or_(El[ipt difereca comissao]:get_data:less_than(0)) → is_visible=True
          - **Icon** `Icon WZZ` (bTcUF) — props: icon="material outlined info"
          - **Text** `Text VZZZZZZ` (bTbyV) — text: "Existe uma diferença de [b]{El[ipt difereca comissao]:get_data:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/b] na comissão das entregas agendadas. Recalcule os valores antes de enviar o pedido."
          - **Input** `ipt comissao dos orcamentos` (bTcTW) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisOrcamentosFonecedores:cpo.ValorComissaoBruto:sum · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Input** `ipt soma comissao das entregas` (bTegV) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:cpo.valorcomissao:sum · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Input** `ipt difereca comissao` (bTegb) — oculto ao carregar · placeholder: "" · content: El[ipt comissao dos orcamentos]:get_data:minus(El[ipt soma comissao das entregas]:get_data) · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
        - **Group** `gp alerta falta data entrega` (bTctf) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - ⟂ quando Parent:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_dataentrega_date", value=∅, constraint_type="is_empty"}}):count:greater_or_equal_than(1) → is_visible=True
          - **Icon** `Icon CZZZ` (bTiiR) — props: icon="material outlined info"
          - **Text** `Text SZZZZZZ` (bTcth) — text: "Existem entregas sem data prevista."
        - **Group** `gp alerta conclusaopedido` (bTiMI0) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp retira pedido listagem copy` (bTcTc) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando Parent:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(El[ipt pedido contaentrega]:get_data:equals(El[ipt pedido entregasconcluidas]:get_data)) → is_visible=True
            - **Icon** `Icon XZZ` (bTcUL) — props: icon="material outlined info"
            - **Text** `Text CZZZZZZZ` (bTcTh) — text: "Todas entregas já foram concluidas e/ou canceladas. Deseja retirar esse pedido da lista de pedidos? "
            - **Button** `Button P` (bTcrd) — text: "retira pedido" · props: icon="material outlined playlist_remove", vertical_centering=True, icon_size=16, button_type="label_icon"
              - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
            - **Input** `ipt pedido contaentrega` (bTldv) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:filtered:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
            - **Input** `ipt pedido entregasconcluidas` (bTldp) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Link** `Link A` (bTiKz0) — text: "[fa]file-pdf-o[/fa]   pdf pedido" · props: linktype="url", open_in_new_tab=True, vertical_centering=True, url="{Parent:cpo.PedidoArquivo}", show_icon=False, unique_id="linkpedido"
            - ⟂ quando Parent:cpo.PedidoArquivo:is_not_empty → is_visible=True
            - ⟂ quando Parent:cpo.PedidoArquivo:is_empty → is_visible=False
        - **Group** `Group MZZ` (bTcrR) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp salvar` (bTblV) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Pedido) → is_visible=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido) → is_visible=False
            - **Button** `btn pedido salvar` (bTblb) — text: "Salvar"
            - **Button** `btn pedido cancelarsalvar` (bTbla) — text: "Cancela"
          - **Group** `gp gravar` (bTblh) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido) → is_visible=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Pedido) → is_visible=False
            - **Button** `btn pedido gravar` (bTbln) — text: "Gravar" · props: vertical_centering=True
            - **Button** `btn pedido cancelargravar` (bTblm) — text: "Cancela"
          - **Checkbox** `chk formalizar` (bTcpN) — label: "Formalizar pedido por e-mail (cliente e fornecedor)" · props: vertical_centering=True
            - ⟂ quando Parent:cpo.PedidoFormalizado:is_true → label="Reenviar pedido por e-mail (cliente e fornecedor)"
            - ⟂ quando El[gp alerta divergencia comissao]:is_visible:and_(Parent:cpo.PedidoFormalizado:is_false) → contents="unchecked", label="Formalizar pedido por e-mail (existe inconsistencia de data/qtd)", disabled=True
            - ⟂ quando El[gp alerta falta data entrega]:is_visible:and_(Parent:cpo.PedidoFormalizado:is_true) → contents="unchecked", label="Reenviar pedido por e-mail (existe inconsistencia de data/qtd)", disabled=True
        - **Group** `gp gerador pdf` (bTmXn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1648430145817x673906689668022300]/AAc** `old PDF/IMG PEDIDO` (bTaxF)
  - **Icon** `btn pedido fecharjanela` (bTbDp) — props: icon="material outlined close"

## Workflows

#### WF bTKAD — PageLoaded
1. **SetCustomState** [bTKAH] alvo El[reus cabecalho A] · value=Opt.MenuConfig.sub_licita__o_1, custom_state="custom.var_qualsubmenu_"
2. **Plugin[1558770956236x539499438875082750]/AAC** [bTcoz] 
3. **ChangePage** [bTdJn] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):and_(CurrentUser:cpo.UltimoDateRange:is_not_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min}"}, 1={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max}"}}, keep_current_page_params=True
4. **ChangePage** [bTiiF] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):or_(CurrentUser:cpo.UltimoDateRange:is_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
5. **ChangePage** [bTiVU] alvo El[Current page] · SÓ SE UrlParam("cotacaoarquivada" as text):is_empty · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="{∅}no"}}, keep_current_page_params=True
6. **ChangePage** [bTiVZ] alvo El[Current page] · SÓ SE UrlParam("ordemdecrescente" as text):is_empty · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}yes"}}, keep_current_page_params=True
7. **ChangePage** [bTiVb] alvo El[Current page] · SÓ SE UrlParam("expandircartoes" as text):is_empty · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}no"}}, keep_current_page_params=True
8. **ChangePage** [bTiVg] alvo El[Current page] · SÓ SE UrlParam("pedidosconcluidos" as None):is_empty · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}no"}}, keep_current_page_params=True
9. **ChangePage** [bTiYV] alvo El[Current page] · SÓ SE CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) · add_parameters=True, url_parameters={0={key="vendedor", value="{CurrentUser:_id}"}}, keep_current_page_params=True
10. **ChangePage** [bTjRt] alvo El[Current page] · SÓ SE UrlParam("etapapedido" as option.opt_etapas):is_empty · add_parameters=True, url_parameters={0={key="etapapedido", value="{Opt.Etapas.Pedido:display}"}}, keep_current_page_params=True
11. **ChangePage** [bTjRx] alvo El[Current page] · SÓ SE UrlParam("etapaentrega" as option.opt_etapas):is_empty · add_parameters=True, url_parameters={0={key="etapaentrega", value="{Opt.Etapas.Em Entrega:display}"}}, keep_current_page_params=True

#### WF bTNjj — ButtonClicked em El[add produto]
- condição: El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação)
- props: workflow_disabled=False
1. **NewThing** [bTNjp] tipo Tbl.CotacaoProdutos · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data
2. **MakeChangeCurrentUser** [bTNrv0] campos: cpo.TempOrcamentoProdutos = ResultOfStep[bTNjp]
3. **ResetGroup** [bTOUl0] alvo El[gp add produto]

#### WF bTNrD — ButtonClicked em El[Icon IZZZ]
- condição: El[pop add fornecedor]:custom.varfornecedoresselecionados_:not_contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTNrJ] alvo El[pop add fornecedor] · value=El[pop add fornecedor]:custom.varfornecedoresselecionados_:plus_element(Ancestor[TableCrossAxis]), custom_state="custom.varfornecedoresselecionados_"

#### WF bTNrK — ButtonClicked em El[Icon IZZZ]
- condição: El[pop add fornecedor]:custom.varfornecedoresselecionados_:contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTNrP] alvo El[pop add fornecedor] · value=El[pop add fornecedor]:custom.varfornecedoresselecionados_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.varfornecedoresselecionados_"

#### WF bTNrX — ButtonClicked em El[Button E]
1. **ScheduleAPIEvent** [bTNru0] date=Page.Current Date/Time, api_event="bTNrd", _wf_param_linha=El[pop add fornecedor]:get_group_data:cpo.Linha, _wf_param_medida="{El[pop add fornecedor]:get_group_data:cpo.Medida}", _wf_param_destino=El[dd end destino]:get_data, _wf_param_origens=El[pop add fornecedor]:custom.varfornecedoresselecionados_, _wf_param_condicao=El[pop add fornecedor]:get_group_data:cpo.Condicao, _wf_param_qtd laco=El[pop add fornecedor]:custom.varfornecedoresselecionados_:count, _wf_param_vendedor=CurrentUser, _wf_param_fila laco=1, _wf_param_orcamentoproduto=El[pop add fornecedor]:get_group_data
2. **SetCustomState** [bTOnz0] alvo El[pop add fornecedor] · custom_state="custom.varfornecedoresselecionados_"
3. **HideElement** [bTNtP0] alvo El[pop add fornecedor]

#### WF bTOOI — ButtonClicked em El[btn nova cotação]
- props: workflow_disabled=False
1. **ResetGroup** [bTirz] alvo El[pop add edita cotacao]
2. **SetCustomState** [bTOOO] alvo El[Página vendas] · value=Opt.Ações.Nova Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTaFr] alvo El[pop add edita cotacao]

#### WF bTOOP — ButtonClicked em El[btn cancelacotacao]
- props: event_color="brown"
1. **DeleteListOfThings** [bTOjt0] to_delete=CurrentUser:cpo.TempOrcamentoProdutos, type_to_delete="custom.tbl_orcamentoprodutos"
2. **TriggerCustomEvent** [bTaJX] custom_event="bTaIm"
3. **HideElement** [bTaGb] alvo El[pop add edita cotacao]

#### WF bTNrz0 — ButtonClicked em El[btn adiciona fornecedor]
1. **DisplayGroupData** [bTNsF0] alvo El[pop add fornecedor] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTNsG0] alvo El[pop add fornecedor]

#### WF bTOSi0 — InputChanged em El[dd tipofrete]
- condição: This:get_data:not_equals(Opt.TipoFrete.CIF Informado)
1. **ChangeThing** [bTOSo0] campos: cpo.ValorFrete = ∅ · to_change=Ancestor[TableCrossAxis]
2. **ScheduleAPIEvent** [bTPHa] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTOSp0 — ButtonClicked em El[btn remove orcamentoproduto]
1. **DeleteListOfThings** [bTOSz0] to_delete=El[rpg fornecedorescotacao]:get_list_data, type_to_delete="custom.tbl_orcamentfornecedores"
2. **MakeChangeCurrentUser** [bTOTF0] campos: cpo.TempOrcamentoProdutos = Ancestor[TableCrossAxis]
3. **DeleteThing** [bTOTA0] to_delete=Ancestor[TableCrossAxis]

#### WF bTOTH0 — ButtonClicked em El[btn remove orcamento fornecedor]
1. **Plugin[1689356815386x980566006617866200]/AAC** [bTOmO] 
2. **DeleteThing** [bTOTN0] to_delete=Ancestor[TableCrossAxis]

#### WF bTOTR0 — ButtonClicked em El[btn gravarcotacao]
- props: event_color="blue"
1. **NewThing** [bTOTX0] tipo Tbl.Cotacao · campos: cpo.DataValidade = El[ip data validade]:get_data; cpo.CotacaoNum = Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1); cpo.CotacaoStatus = Opt.CotacaoStatus.Em andamento; cpo.QuaisProdutos = El[rpg produto orcamento]:get_list_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.EmpresaMegabox = El[rd empresa megabox]:get_data; cpo.QualVendedor = CurrentUser; Cpo.Amostra = El[CustomCheckbox A]:get_AAw
2. **ChangeListOfThings** [bTOff0] campos: cpo.QualCotacao = ResultOfStep[bTOTX0]; cpo.QualCliente = ResultOfStep[bTOTX0]:cpo.QualCliente · to_change=CurrentUser:cpo.TempOrcamentoProdutos, type_to_change="custom.tbl_orcamentoprodutos"
3. **ChangeListOfThings** [bTbYN] campos: cpo.QualCotacao = ResultOfStep[bTOTX0] · to_change=CurrentUser:cpo.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
4. **TriggerCustomEvent** [bTaJJ] custom_event="bTaIm"
5. **HideElement** [bTaGc] alvo El[pop add edita cotacao]
6. **SetCustomState** [bTezY] alvo El[pop.AgendaEnderecos A] · custom_state="custom.var_recemcadastrado_"

#### WF bTOUI0 — ButtonClicked em El[icon ganhador ]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_true
1. **ChangeThing** [bTOUO0] campos: cpo.Vencedor = False · to_change=Ancestor[TableCrossAxis]

#### WF bTOUP0 — ButtonClicked em El[icon ganhador ]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_false
1. **ChangeThing** [bTOUa0] campos: cpo.Vencedor = False · to_change=El[rpg fornecedorescotacao]:get_list_data:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element
2. **ChangeThing** [bTOUU0] campos: cpo.Vencedor = True · to_change=Ancestor[TableCrossAxis]

#### WF bTOWv0 — ButtonClicked em El[Text P]
1. **ToggleElement** [bTOXB0] alvo El[rpg fornecedorescotacao]
2. **ToggleElement** [bTOnp] alvo El[txt titulo icms]
3. **ToggleElement** [bTOnt] alvo El[txt titulo piscofins]

#### WF bTOXZ0 — InputChanged em El[ip valorvenda]
1. **PauseWFClient** [bTOmU] length=1000
2. **ScheduleAPIEvent** [bTPHZ] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTOnP — InputChanged em El[ip piscofins]
1. **PauseWFClient** [bTOnR] length=1000
2. **ScheduleAPIEvent** [bTPHh] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTPGv — InputChanged em El[ip valorfrete]
1. **PauseWFClient** [bTPHD] 
2. **ScheduleAPIEvent** [bTPHr] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTPHt — ButtonClicked em El[btn proposta gravar]
- props: event_color="blue", workflow_disabled=True
1. **SetCustomState** [bTezq] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bThFc] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.AnexosDiversos = El[upf anexosdiversos]:get_data; cpo.QualCnpjFornecedor = El[dd cnpj fornecedor]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTbgK] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bThFc]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTPrs] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bThFc]
5. **ChangeThing** [bTPgi] campos: cpo.QuaisPropostas = ResultOfStep[bThFc] · to_change=El[pop add edita propostas]:get_group_data
6. **Plugin[1648430145817x673906689668022300]/AAL** [bTPgj] alvo El[PDF/IMG PROPOSTA] · AAM="corponovaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bThFc]:cpo.PropostaNum}", AAf=False
7. **SetCustomState** [bTPhR] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
8. **ResetGroup** [bTPrx] alvo El[gp add edita proposta]

#### WF bTPJB — ButtonClicked em El[btn edita contato cliente]
1. **ShowElement** [bTPVL0] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTPVM0] alvo El[pop.AgendaContatos A] · data_source=El[pop add edita propostas]:get_group_data:cpo.QualCliente

#### WF bTPQO — ButtonClicked em El[btn edita endereco cliente]
1. **ShowElement** [bTPQU] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTmGE] alvo El[pop.AgendaEnderecos A] · value=El[pop add edita propostas]:get_group_data:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTPfZ — ButtonClicked em El[Icon TZZ]
1. **ShowElement** [bTPfg] alvo El[pop consulta icms]

#### WF bTOXg0 — InputChanged em El[ip valorcomissao]
1. **PauseWFClient** [bTOmm] length=1000
2. **ScheduleAPIEvent** [bTPHm] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTOXn0 — InputChanged em El[ip icms]
1. **PauseWFClient** [bTOmt] length=1000
2. **ScheduleAPIEvent** [bTPHf] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTOYp0 — InputChanged em El[Input B]
1. **ChangeThing** [bTOYv0] campos: cpo.qtd = This:get_data · to_change=Ancestor[TableCrossAxis]
2. **ChangeListOfThings** [bTOZB0] campos: cpo.QtdVenda = This:get_data · to_change=Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
3. **ScheduleAPIEvent** [bTPGL] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores

#### WF bTOZp0 — ButtonClicked em El[Icon B]
1. **ToggleElement** [bTOZv0] alvo El[rpg fornecedorescotacao]
2. **ToggleElement** [bTOqX] alvo El[txt titulo icms]
3. **ToggleElement** [bTOqb] alvo El[txt titulo piscofins]

#### WF bTOhp0 — ButtonClicked em El[btn edita produto]
1. **DisplayGroupData** [bTOhv0] alvo El[gp add produto] · data_source=Ancestor[TableCrossAxis]
2. **SetCustomState** [bTOhz0] alvo El[Página vendas] · value=Opt.Ações.Edita Produto, custom_state="custom.var_a__oor_amento_"

#### WF bTOiR0 — ButtonClicked em El[salvar produto]
1. **ChangeThing** [bTOiX0] campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data · to_change=Parent
2. **ChangeListOfThings** [bTOip0] campos: cpo.QtdVenda = ResultOfStep[bTOiX0]:cpo.qtd · to_change=Parent:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
3. **ScheduleAPIEvent** [bTPHU] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Parent:cpo.QuaisOrcamentosForncededores
4. **SetCustomState** [bTOiZ0] alvo El[Página vendas] · value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"
5. **ResetGroup** [bTOij0] alvo El[gp add produto]

#### WF bTOir0 — ButtonClicked em El[add produto]
- condição: El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação)
- props: workflow_disabled=False
1. **NewThing** [bTOiw0] tipo Tbl.CotacaoProdutos · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualCotacao = El[pop add edita cotacao]:get_group_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data
2. **MakeChangeCurrentUser** [bTOjZ0] campos: cpo.TempOrcamentoProdutos = ResultOfStep[bTOiw0]
3. **ResetGroup** [bTOjB0] alvo El[gp add produto]

#### WF bTOjP0 — ButtonClicked em El[btn salvarcotacao]
- props: event_color="orange"
1. **ChangeThing** [bTOjb0] campos: cpo.DataValidade = El[ip data validade]:get_data; cpo.QuaisProdutos = CurrentUser:cpo.TempOrcamentoProdutos; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.EmpresaMegabox = El[rd empresa megabox]:get_data; Cpo.Amostra = El[CustomCheckbox A]:get_AAw · to_change=El[pop add edita cotacao]:get_group_data
2. **TriggerCustomEvent** [bTaJQ] custom_event="bTaIm"
3. **ChangeListOfThings** [bTbYY] campos: cpo.QualCotacao = El[pop add edita cotacao]:get_group_data · to_change=El[rpg produto orcamento]:get_list_data:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
4. **HideElement** [bTaGd] alvo El[pop add edita cotacao]

#### WF bTPDr0 — ButtonClicked em El[btn proposta gravarenviar]
- props: event_color="blue", workflow_disabled=False
1. **SetCustomState** [bTezw] alvo El[pop add edita propostas] · value=True, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bThFd] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.PropostaEnviada = True; cpo.AnexosDiversos = El[upf anexosdiversos]:get_data; cpo.QualCnpjFornecedor = El[dd cnpj fornecedor]:get_data · to_change=Parent
3. **NewThing** [bTjCC] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Proposta número {ResultOfStep[bThFd]:cpo.QualCotacao:cpo.CotacaoNum}/{ResultOfStep[bThFd]:cpo.PropostaNum} enviada ao cliente no email {ResultOfStep[bThFd]:cpo.EnviarPara:cpo.Email}")}"; cpo.QualCliente = ResultOfStep[bThFd]:cpo.QualCotacao:cpo.QualCliente; cpo.QualVendedor = CurrentUser
4. **ChangeThing** [bTkgh2] campos: cpo.UltimoHistoricoData = ResultOfStep[bTjCC]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTjCC] · to_change=ResultOfStep[bTjCC]:cpo.QualCliente
5. **ChangeListOfThings** [bTbgD] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bThFd]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
6. **ChangeThing** [bTPrU] campos: cpo.QuaisPropostas = ResultOfStep[bThFd] · to_change=El[pop add edita propostas]:get_group_data
7. **DisplayGroupData** [bTPqZ] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bThFd]
8. **Plugin[1648430145817x673906689668022300]/AAL** [bTaSd] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bThFd]:cpo.PropostaNum}", AAf=False
9. **SetCustomState** [bTPrh] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
10. **ResetGroup** [bTmbt] alvo El[gp add edita proposta]

#### WF bTPfs — ButtonClicked em El[Icon IZ]
1. **Plugin[1659259586969x934092730321338400]/AAD** [bTPfy] 
2. **Plugin[1658328157117x953686184769617900]/AAT** [bTPfz] AAF="Valor de alíquota copiada", AAG=3000

#### WF bTPhF — ButtonClicked em El[btn proposta salvar]
- props: event_color="orange"
1. **SetCustomState** [bTezr] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bThFi] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.AnexosDiversos = El[upf anexosdiversos]:get_data; cpo.QualCnpjFornecedor = El[dd cnpj fornecedor]:get_data; cpo.QualCnpjFornecedor = El[dd cnpj fornecedor]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTbfm] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bThFi]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTPsD] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bThFi]
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTaSn] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bThFi]:cpo.PropostaNum}", AAf=False
6. **SetCustomState** [bTPhx] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
7. **ResetGroup** [bTPsF] alvo El[gp add edita proposta]

#### WF bTPhL — ButtonClicked em El[btn proposta salvarenviar]
- props: event_color="orange", workflow_disabled=False
1. **SetCustomState** [bTfAB] alvo El[pop add edita propostas] · value=True, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bThFn] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.PropostaEnviada = True; cpo.AnexosDiversos = El[upf anexosdiversos]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTbft] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bThFn]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTPqk] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bThFn]
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTaSu] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bThFn]:cpo.PropostaNum}", AAf=False
6. **SetCustomState** [bTPpj] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
7. **ResetGroup** [bTPqp] alvo El[gp add edita proposta]

#### WF bTPmK — ButtonClicked em El[Icon MZ]
1. **SetCustomState** [bTPmQ] alvo El[pop add edita propostas] · value=Opt.Ações.Edita Proposta, custom_state="custom.var_acaocotacao_"
2. **DisplayGroupData** [bTPmR] alvo El[gp add edita proposta] · data_source=Ancestor[TableCrossAxis]

#### WF bTPoC — ButtonClicked em El[Button M]
1. **SetCustomState** [bTPoI] alvo El[pop add edita propostas] · value=Opt.Ações.Nova Proposta, custom_state="custom.var_acaocotacao_"
2. **CopyListOfThings** [bThFu] to_copy=Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}), type_to_copy="custom.tbl_orcamentfornecedores"
3. **NewThing** [bThFW] tipo Tbl.Propostas · campos: cpo.QuaisOrcamentosFornecedores = ResultOfStep[bThFu]; cpo.QualCotacao = Parent; cpo.QualVendedor = CurrentUser
4. **ChangeListOfThings** [bThFb] campos: cpo.QualProposta = ResultOfStep[bThFW] · to_change=ResultOfStep[bThFu], type_to_change="custom.tbl_orcamentfornecedores"
5. **DisplayGroupData** [bThFX] alvo El[gp add edita proposta] · data_source=ResultOfStep[bThFW]

#### WF bTPoa — ButtonClicked em El[btn proposta cancelagravar]
1. **ChangeListOfThings** [bThFt] campos: cpo.QualProposta = ∅ · to_change=Parent:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
2. **DeleteThing** [bThFp] to_delete=Parent
3. **ResetGroup** [bTPoh] alvo El[gp add edita proposta]
4. **SetCustomState** [bTPog] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"

#### WF bTPol — ButtonClicked em El[btn proposta cancelasalvar]
1. **ResetGroup** [bTPor] alvo El[gp add edita proposta]
2. **SetCustomState** [bTPos] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"

#### WF bTPoz — ButtonClicked em El[Icon NZ]
1. **OpenURL** [bTPpJ] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.AquivoProposta}"

#### WF bTQAy — ButtonClicked em El[gp card cotacao]
1. **ToggleElement** [bTQBF] alvo El[gp resumo cotacao]

#### WF bTQBP — ButtonClicked em El[btn edita orcamento]
1. **DisplayGroupData** [bTQBR] alvo El[pop add edita cotacao] · data_source=Ancestor[TableCrossAxis]
2. **SetCustomState** [bTQBV] alvo El[Página vendas] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTaGQ] alvo El[pop add edita cotacao]

#### WF bTQBi — ButtonClicked em El[btn addedita proposta]
1. **SetCustomState** [bTafv] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
2. **DisplayGroupData** [bTQBn] alvo El[pop add edita propostas] · data_source=Ancestor[TableCrossAxis]
3. **ShowElement** [bTQBo] alvo El[pop add edita propostas]

#### WF bTaGu — ButtonClicked em El[btn expandir cartoes]
- condição: UrlParam("expandircartoes" as text):equals("yes")
1. **ChangePage** [bTiVx] alvo El[Current page] · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}no"}}, keep_current_page_params=True

#### WF bTaIm — CustomEvent
- props: event_name="fechar pop cotacao", event_color="purple"
1. **SetCustomState** [bTaIr] alvo El[Página vendas] · custom_state="custom.var_a__oor_amento_", custom_states_values={0={value=∅, custom_state="custom.var_a__ovendas_"}}
2. **ResetGroup** [bTaIt] alvo El[pop add edita cotacao]
3. **ResetGroup** [bTaIy] alvo El[pop add fornecedor]
4. **MakeChangeCurrentUser** [bTaJD] campos: cpo.TempOrcamentoProdutos = ∅

#### WF bTaJv — ButtonClicked em El[btn abrir todos]
- condição: El[Página vendas]:custom.var_todosfornecedores_:is_false
1. **SetCustomState** [bTaKB] alvo El[Página vendas] · value=True, custom_state="custom.var_todosfornecedores_"

#### WF bTaKF — ButtonClicked em El[btn abrir todos]
- condição: El[Página vendas]:custom.var_todosfornecedores_:is_true
1. **SetCustomState** [bTaKH] alvo El[Página vendas] · value=False, custom_state="custom.var_todosfornecedores_"

#### WF bTaLf — CustomEvent
- props: event_name="Enviar Email Proposta", parameters={0={is_list=False, btype_id="custom.tbl_propostas", optional=False, param_id="bTaLh", param_name="par.QualProposta"}}, event_color="purple"
1. **ScheduleAPIEvent** [bTnxZ0] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{WFParam.par.QualProposta:cpo.EmailsCopia}", _wf_param_to="{WFParam.par.QualProposta:cpo.EnviarPara:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 5):first_element:cpo.QuaisUsuarios:cpo.EmailContato}", _wf_param_body="{WFParam.par.QualProposta:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Orçamento: {Text("{WFParam.par.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{WFParam.par.QualProposta:cpo.PropostaNum}")} - Produtos: {Text("{WFParam.par.QualProposta:cpo.QuaisOrcamentosFornecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{WFParam.par.QualProposta:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}")}", _wf_param_atachments="{WFParam.par.QualProposta:cpo.AquivoProposta:url}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted

#### WF bTaPQ — ButtonClicked em El[Icon OZZ]
1. **HideElement** [bTaPW] alvo El[pop add edita propostas]
2. **ResetGroup** [bTaPb] alvo El[pop add edita propostas]

#### WF bTaPi — ButtonClicked em El[btn arquivar]
- condição: Parent:cpo.Arquivado:is_false
1. **ShowElement** [bTlDm] alvo El[pop.ArquivaCotação]
2. **DisplayGroupData** [bTlDn] alvo El[pop.ArquivaCotação] · data_source=Parent

#### WF bTaTZ — ButtonClicked em El[btn cotacao arquivada]
- condição: UrlParam("cotacaoarquivada" as text):equals("no")
1. **ChangePage** [bTiVl] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="yes"}}, keep_current_page_params=True

#### WF bTaTj — ButtonClicked em El[btn cotacao arquivada]
- condição: UrlParam("cotacaoarquivada" as text):equals("yes")
1. **ChangePage** [bTiVm] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="no"}}, keep_current_page_params=True

#### WF bTaTq — ButtonClicked em El[btn arquivar]
- condição: Parent:cpo.Arquivado:is_true
1. **ChangeThing** [bTaTv] campos: cpo.Arquivado = False; cpo.MotivoArquivamento = ∅ · to_change=Parent

#### WF bTaUD — ButtonClicked em El[btn data crescente]
- condição: UrlParam("ordemdecrescente" as text):equals("yes")
1. **ChangePage** [bTiVr] alvo El[Current page] · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}no"}}, keep_current_page_params=True

#### WF bTaUN — ButtonClicked em El[btn data crescente]
- condição: UrlParam("ordemdecrescente" as text):equals("no")
1. **ChangePage** [bTiVs] alvo El[Current page] · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTagt — ButtonClicked em El[seleciona proposta]
- condição: El[pop add edita propostas]:custom.var_exibeproposta_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTagz] alvo El[pop add edita propostas] · value=Opt.Ações.Exibe Proposta, custom_state="custom.var_acaocotacao_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_exibeproposta_"}}

#### WF bTahD — ButtonClicked em El[seleciona proposta]
- condição: El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTahF] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_", custom_states_values={0={custom_state="custom.var_exibeproposta_"}}

#### WF bTbFt — ButtonClicked em El[Icon KZZZ] «btn criapedido»
- props: event_color="green"
1. **NewThing** [bTbNB] tipo Tbl.Pedido · campos: cpo.QuaisOrcamentosFonecedores = Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores; cpo.QualCotacao = Ancestor[TableCrossAxis]:cpo.QualCotacao; cpo.QualProposta = Ancestor[TableCrossAxis]; cpo.NumeroPedido = "{Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.CotacaoNum}"; cpo.QualCliente = Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.QualCliente; cpo.QualClienteTexto = "{Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor}"; cpo.InformacoesAdd = "{Ancestor[TableCrossAxis]:cpo.InfoAdicional}"; cpo.QualPrimeiroFornecedor = Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:first_element:cpo.QualEnderecoOrigem; cpo.QualVendedor = CurrentUser
2. **ChangeThing** [bTbZt] campos: cpo.CotacaoEtapa = Opt.Etapas.Pedir; cpo.QualPedido = ResultOfStep[bTbNB] · to_change=Ancestor[TableCrossAxis]:cpo.QualCotacao
3. **DisplayGroupData** [bTbNC] alvo El[pop add edita pedido] · data_source=ResultOfStep[bTbNB]
4. **SetCustomState** [bTbNI] alvo El[pop add edita pedido] · value=Opt.Ações.Novo Pedido, custom_state="custom.var_acaocotacao_"
5. **ShowElement** [bTbNJ] alvo El[pop add edita pedido]

#### WF bTbOt — ButtonClicked em El[btn add entrega no pedido]
1. **NewThing** [bTbOz] tipo Tbl.Entregas · campos: cpo.QualCotacao = Ancestor[TableCrossAxis]:cpo.QualCotacao; cpo.QualOrcamentoFornecedor = Ancestor[TableCrossAxis]; cpo.QualProposta = El[pop add edita pedido]:get_group_data:cpo.QualProposta; cpo.DataEntrega = El[pop add edita pedido]:get_group_data:cpo.QualProposta:cpo.DtPrevEntrega; cpo.QualPedido = El[pop add edita pedido]:get_group_data; cpo.NumeroPedido = "{El[pop add edita pedido]:get_group_data:cpo.NumeroPedido}"; cpo.DtPedido = El[pop add edita pedido]:get_group_data:Created Date; cpo.QualClienteTexto = "{El[pop add edita pedido]:get_group_data:cpo.QualCliente:cpo.NomeCliFor}"; cpo.QualFornecedTexto = "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor}"; cpo.QualVendedor = El[pop add edita pedido]:get_group_data:cpo.QualCotacao:Created By; cpo.QualCliente = El[pop add edita pedido]:get_group_data:cpo.QualCliente; cpo.QualFornecedor = Ancestor[TableCrossAxis]:cpo.QualFornecedor
2. **ChangeThing** [bTbQb] campos: cpo.QuaisEntregas = ResultOfStep[bTbOz] · to_change=ResultOfStep[bTbOz]:cpo.QualPedido
3. **ChangeThing** [bTbQf] campos: cpo.QuaisEntregas = ResultOfStep[bTbOz] · to_change=Ancestor[TableCrossAxis]
4. **ChangeThing** [bTyAt] SÓ SE ResultOfStep[bTbOz]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(ResultOfStep[bTbOz]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = InjectedValue:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=ResultOfStep[bTbOz]

#### WF bTbPN — InputChanged em El[ipt entrega qtd]
1. **ScheduleAPIEvent** [bTbPT] date=Page.Current Date/Time, api_event="bTbPH", _wf_param_par^{p1}QualEntrega=Ancestor[TableCrossAxis]
2. **ResetGroup** [bTnxO0] alvo El[gp corpo pedidoemail fornecedor]

#### WF bTbZy — ButtonClicked em El[btn edita pedido]
1. **DisplayGroupData** [bTbaE] alvo El[pop add edita pedido] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTbaF] alvo El[pop add edita pedido]
3. **SetCustomState** [bTbaJ] alvo El[pop add edita pedido] · value=Opt.Ações.Edita Pedido, custom_state="custom.var_acaocotacao_"

#### WF bTbai — ButtonClicked em El[gp card pedido]
1. **ToggleElement** [bTban] alvo El[gp produtos pedido]

#### WF bTblt — ButtonClicked em El[btn pedido gravar]
- condição: El[chk formalizar]:get_not_data
- props: event_color="blue"
1. **ChangeThing** [bTcpr] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.FormaPagto = El[dd formapagto]:get_data; cpo.EmailClienteCC = "{El[ipt cc email cliente]:get_data}"; cpo.EmailFornecedorCC = "{El[ipt cc email fornecedor]:get_data}" · to_change=Parent
2. **HideElement** [bTbmD] alvo El[pop add edita pedido]
3. **ResetGroup** [bTbmE] alvo El[pop add edita pedido]

#### WF bTbmF — ButtonClicked em El[btn pedido salvar]
- condição: El[chk formalizar]:get_not_data
- props: event_color="orange"
1. **ChangeThing** [bTbmK] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.FormaPagto = El[dd formapagto]:get_data; cpo.EmailClienteCC = "{El[ipt cc email cliente]:get_data}"; cpo.EmailFornecedorCC = "{El[ipt cc email fornecedor]:get_data}" · to_change=Parent
2. **HideElement** [bTbmL] alvo El[pop add edita pedido]
3. **ResetGroup** [bTbmP] alvo El[pop add edita pedido]

#### WF bTbnL — ButtonClicked em El[btn pedido salvar]
- condição: El[chk formalizar]:get_data
- props: event_color="orange", workflow_disabled=False
1. **ShowElement** [bTbqL0] alvo El[gp alert gravando]
2. **ScrollToElement** [bTmaP] alvo El[gp alert gravando] · offset=-100
3. **ChangeThing** [bTcpk] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PedidoFormalizado = True; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.EmailClienteCC = "{El[ipt cc email cliente]:get_data}"; cpo.EmailFornecedorCC = "{El[ipt cc email fornecedor]:get_data}" · to_change=Parent
4. **ChangeListOfThings** [bTcqJ] campos: cpo.StatusEntrega = Opt.Etapas.Pedido · to_change=ResultOfStep[bTcpk]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTbnR] alvo El[old PDF/IMG PEDIDO] · AAM="corpopedido", AAO=800, AAP=1100, AAQ="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:find_replace(find=" "):to_uppercase}_PEDIDO{Parent:cpo.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}", AAf=False
6. **ResetInputs** [bThFL] 

#### WF bTbnk — ButtonClicked em El[Icon XZ]
1. **ShowElement** [bTbnp] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTbnq] alvo El[pop.AgendaContatos A] · data_source=El[rpg pedido OrçFornecedores]:get_list_data:cpo.QualFornecedor:first_element

#### WF bTbuB — ButtonClicked em El[chk entrega pra deletar]
- condição: El[pop add edita pedido]:custom.var_deletarentregas_:not_contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTbuH] alvo El[pop add edita pedido] · value=El[pop add edita pedido]:custom.var_deletarentregas_:plus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_deletarentregas_"

#### WF bTbuI — ButtonClicked em El[chk entrega pra deletar]
- condição: El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTbuN] alvo El[pop add edita pedido] · value=El[pop add edita pedido]:custom.var_deletarentregas_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_deletarentregas_"

#### WF bTbxI — ButtonClicked em El[Icon VZZ]
1. **DeleteListOfThings** [bTbxO] to_delete=El[pop add edita pedido]:custom.var_deletarentregas_, type_to_delete="custom.tbl_entregas"
2. **SetCustomState** [bTbxP] alvo El[pop add edita pedido] · custom_state="custom.var_deletarentregas_"

#### WF bTcJT — ButtonClicked em El[btn edita pedido]
1. **DisplayGroupData** [bTcpF] alvo El[pop add edita pedido] · data_source=Parent:cpo.QualPedido
2. **ShowElement** [bTcpG] alvo El[pop add edita pedido]
3. **SetCustomState** [bTcqf] alvo El[pop add edita pedido] · value=Opt.Ações.Edita Pedido, custom_state="custom.var_acaocotacao_"

#### WF bTcRp — ButtonClicked em El[Text BZZZZZZZ]
1. **OpenURL** [bTcRv] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTcSZ — ButtonClicked em El[force calc]
- props: event_color="purple"
1. **ScheduleAPIEvent** [bTcSf] date=Page.Current Date/Time, api_event="bTbPH", _wf_param_par^{p1}QualEntrega=Ancestor[TableCrossAxis]
2. **ResetGroup** [bTnxN0] alvo El[gp corpo pedidoemail fornecedor]

#### WF bTcXd — ButtonClicked em El[btn confirmaentrega]
- props: event_color="purple"
1. **ChangeThing** [bTcXj] campos: cpo.dtentrega = El[dt dataentrega realizada]:get_data; cpo.ComprovanteEntrega = "{El[upf comprovanteentrega realizada]:get_data}"; cpo.StatusEntrega = Opt.Etapas.Financeiro · to_change=Parent
2. **ScheduleAPIEvent** [bToYx] date=Page.Current Date/Time, api_event="bToYh", _wf_param_DtEntrega=ResultOfStep[bTcXj]:cpo.dtentrega, _wf_param_QualEntrega=ResultOfStep[bTcXj]
3. **HideElement** [bTcXq] alvo El[pop confirma entrega]
4. **ResetGroup** [bTcXr] alvo El[pop confirma entrega]
5. **ChangeThing** [bTyBX] SÓ SE ResultOfStep[bTcXj]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(ResultOfStep[bTcXj]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = InjectedValue:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=ResultOfStep[bTcXj]

#### WF bTcXk — ButtonClicked em El[btn cencela confirmaentrega]
- condição: Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Financeiro)
1. **HideElement** [bTcXv] alvo El[pop confirma entrega]
2. **ResetGroup** [bTcXw] alvo El[pop confirma entrega]
3. **DeleteListOfThings** [bTfJy] to_delete=Parent:cpo.QuaisContasReceber, type_to_delete="custom.tbl_contasreceber"

#### WF bTbqZ0 — ButtonClicked em El[btn pedido fecharjanela]
1. **SetCustomState** [bUEjN] alvo El[Página vendas] · value=Parent, custom_state="custom.var_ultimotblpedido_", custom_states_values={0={value=El[dd pedido emailcliente]:get_data:cpo.Email, custom_state="custom.var_ultimoemailcliente_"}}
2. **ResetGroup** [bTbqx0] alvo El[pop add edita pedido]
3. **HideElement** [bTbrB0] alvo El[pop add edita pedido]

#### WF bTbrC0 — ButtonClicked em El[btn pedido cancelargravar]
- props: event_color="green"
1. **ResetGroup** [bTbrH0] alvo El[pop add edita pedido]
2. **HideElement** [bTbrI0] alvo El[pop add edita pedido]
3. **ChangeThing** [bTcad] campos: cpo.CotacaoEtapa = Opt.Etapas.Cotação; cpo.QualPedido = ∅ · to_change=Parent:cpo.QualCotacao
4. **DeleteThing** [bTcae] to_delete=Parent

#### WF bTbrN0 — ButtonClicked em El[btn pedido cancelarsalvar]
1. **ResetGroup** [bTbrP0] alvo El[pop add edita pedido]
2. **HideElement** [bTbrT0] alvo El[pop add edita pedido]

#### WF bTcYr — ButtonClicked em El[ico proposta]
1. **DisplayGroupData** [bTcYx] alvo El[pop confirma entrega] · data_source=Parent
2. **ShowElement** [bTcYy] alvo El[pop confirma entrega]

#### WF bTcZi — ButtonClicked em El[Icon YZ]
1. **ShowElement** [bTcZn] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTcZo] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.QualCotacao:cpo.QualCliente

#### WF bTcal — PopupOpened em El[pop add edita cotacao]
- condição: El[Página vendas]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação):and_(CurrentUser:cpo.TempOrcamentoProdutos:count:greater_or_equal_than(1))
1. **DeleteListOfThings** [bTcbr] to_delete=CurrentUser:cpo.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores, type_to_delete="custom.tbl_orcamentfornecedores"
2. **DeleteListOfThings** [bTcbs] to_delete=CurrentUser:cpo.TempOrcamentoProdutos, type_to_delete="custom.tbl_orcamentoprodutos"

#### WF bTcbO — ButtonClicked em El[Icon JZ]
1. **ShowElement** [bTcbU] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTmGF] alvo El[pop.AgendaEnderecos A] · value=Parent:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTccd — ButtonClicked em El[sort distance]
- condição: El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_false
1. **SetCustomState** [bTcdB] alvo El[pop add fornecedor] · value=True, custom_state="custom.var_distanciamaiormenor_"
2. **Plugin[1685525155901x838124401560125400]/AAC** [bTccj] AAD="distancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTcct — PopupOpened em El[pop add fornecedor]
1. **Plugin[1685525155901x838124401560125400]/AAC** [bTccv] AAD="kmdistancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTcdG — ButtonClicked em El[sort distance]
- condição: El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_true
1. **SetCustomState** [bTcdL] alvo El[pop add fornecedor] · value=False, custom_state="custom.var_distanciamaiormenor_"
2. **Plugin[1685525155901x838124401560125400]/AAC** [bTcdM] AAD="distancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTchZ — ButtonClicked em El[btn fecar add fornecedores]
1. **HideElement** [bTchf] alvo El[pop add fornecedor]

#### WF bTcjZ — ButtonClicked em El[Icon PZ]
1. **ShowElement** [bTcjf] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTmGJ] alvo El[pop.AgendaEnderecos A] · value=El[ipt buscacliente]:get_data, custom_state="custom.var_qualgrupoclifor_"

#### WF bTcjx — ButtonClicked em El[btn cancelanetrega]
- condição: Ancestor[TableCrossAxis]:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado)
1. **SetCustomState** [bTejD] alvo El[pop cancelar entrega e pedido] · value=Ancestor[TableCrossAxis], custom_state="custom.var_qualentrega_", custom_states_values={0={value=Ancestor[TableCrossAxis]:cpo.QualPedido, custom_state="custom.var_qualpedido_"}, 1={value=Opt.Ações.Cancela Entrega, custom_state="custom.var_a__ocancelamento_"}}
2. **ShowElement** [bTejE] alvo El[pop cancelar entrega e pedido]

#### WF bTcqO — ButtonClicked em El[btn pedido gravar]
- condição: El[chk formalizar]:get_data
- props: event_color="blue", workflow_disabled=False
1. **ShowElement** [bTcqT] alvo El[gp alert gravando]
2. **ScrollToElement** [bTmaO] alvo El[gp alert gravando] · offset=-100
3. **ChangeThing** [bTcqV] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PedidoFormalizado = True; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.EmailClienteCC = "{El[ipt cc email cliente]:get_data}"; cpo.EmailFornecedorCC = "{El[ipt cc email fornecedor]:get_data}" · to_change=Parent
4. **ChangeListOfThings** [bTcqZ] campos: cpo.StatusEntrega = Opt.Etapas.Pedido · to_change=ResultOfStep[bTcqV]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTcqa] alvo El[old PDF/IMG PEDIDO] · AAM="corpopedido", AAO=800, AAP=1100, AAQ="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:find_replace(find=" "):to_uppercase}_PEDIDO{Parent:cpo.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}", AAf=False
6. **ResetInputs** [bThFR] 
7. **NewThing** [bTjBw] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Pedido número {ResultOfStep[bTcqV]:cpo.NumeroPedido} enviado ao cliente no email {ResultOfStep[bTcqV]:cpo.EmailCliente:cpo.Email}")}"; cpo.QualCliente = ResultOfStep[bTcqV]:cpo.QualCliente; cpo.QualVendedor = CurrentUser
8. **ChangeThing** [bTkgd2] campos: cpo.UltimoHistoricoData = ResultOfStep[bTjBw]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTjBw] · to_change=ResultOfStep[bTjBw]:cpo.QualCliente

#### WF bTcrj — ButtonClicked em El[Button P]
1. **ChangeListOfThings** [bTcru] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="equals"}}), type_to_change="custom.tbl_entregas"
2. **ChangeThing** [bTcrp] campos: cpo.PedidoFinalizado = True · to_change=Parent
3. **ResetGroup** [bTcrz] alvo El[pop add edita pedido]
4. **HideElement** [bTcsA] alvo El[pop add edita pedido]

#### WF bTcsf — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):not_equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTcsl] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value="{Parent:cpo.QualPedido:_id}"}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTcsp — ButtonClicked em El[chk filtrapedido]
- condição: UrlParam("filtrapedido" as custom.tbl_pedidos):not_equals(Ancestor[TableCrossAxis])
- props: event_color="brown"
1. **ChangePage** [bTcsv] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrapedido", value="{Parent:_id}"}, 1={key="filtraentrega", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTcsw — ButtonClicked em El[chk filtrapedido]
- condição: UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])
- props: event_color="brown"
1. **ChangePage** [bTctB] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrapedido", value=""}, 1={key="filtraentrega", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTctN — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTctP] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value=""}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTcvX — ButtonClicked em El[btn proposta editacotacao]
1. **DisplayGroupData** [bTcvZ] alvo El[pop add edita cotacao] · data_source=Parent
2. **SetCustomState** [bTcvd] alvo El[Página vendas] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTcve] alvo El[pop add edita cotacao]

#### WF bTcvp — ButtonClicked em El[btn proposta editacotacao]
1. **DisplayGroupData** [bTcvr] alvo El[pop add edita cotacao] · data_source=El[pop add edita propostas]:get_group_data
2. **SetCustomState** [bTcvv] alvo El[Página vendas] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTcvw] alvo El[pop add edita cotacao]

#### WF bTeZz — ButtonClicked em El[Button L]
- condição: El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega)
- props: event_color="red"
1. **ChangeThing** [bTeaF] campos: cpo.StatusEntrega = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[Input EZ]:get_data}"; cpo.QtdEntrega = 0 · to_change=El[pop cancelar entrega e pedido]:custom.var_qualentrega_
2. **ScheduleAPIEvent** [bTnxa0] SÓ SE El[chk informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{CurrentUser:cpo.CopiaCancelamentos}", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTnxb0] SÓ SE El[chk informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_cc="{CurrentUser:cpo.CopiaCancelamentos}", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ResetInputs** [bTeaK] 
5. **HideElement** [bTeaL] alvo El[pop cancelar entrega e pedido]

#### WF bTeai — ButtonClicked em El[Icon T]
1. **HideElement** [bTeao] alvo El[pop cancelar entrega e pedido]

#### WF bTeiI — ButtonClicked em El[hide dados do pedido]
1. **ToggleElement** [bTeiO] alvo El[dados do pedido]

#### WF bTeiV — ButtonClicked em El[Icon WZ]
1. **ShowElement** [bTeia] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTmGK] alvo El[pop.AgendaEnderecos A] · value=Parent:cpo.QualCotacao:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTejF — ButtonClicked em El[Button L]
- condição: El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido)
- props: event_color="red"
1. **ChangeThing** [bTejK] campos: cpo.QualEtapa = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[Input EZ]:get_data}" · to_change=El[pop cancelar entrega e pedido]:custom.var_qualpedido_
2. **ScheduleAPIEvent** [bTnxg0] SÓ SE El[chk informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{CurrentUser:cpo.CopiaCancelamentos}", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTnxl0] SÓ SE El[chk informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_cc="{CurrentUser:cpo.CopiaCancelamentos}", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ChangeListOfThings** [bTejW] campos: cpo.MotivoCancelamento = "{ResultOfStep[bTejK]:cpo.MotivoCancelamento}"; cpo.StatusEntrega = Opt.Etapas.Cancelado · to_change=ResultOfStep[bTejK]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **ResetInputs** [bTejQ] 
6. **HideElement** [bTejR] alvo El[pop cancelar entrega e pedido]

#### WF bTejh — ButtonClicked em El[ico cancela pedido]
1. **SetCustomState** [bTejn] alvo El[pop cancelar entrega e pedido] · value=Opt.Ações.Cancela Pedido, custom_state="custom.var_a__ocancelamento_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualpedido_"}, 1={value=∅, custom_state="custom.var_qualentrega_"}}
2. **ShowElement** [bTejo] alvo El[pop cancelar entrega e pedido]

#### WF bTcwN0 — InputChanged em El[ipt filter numpedido]
1. **ChangePage** [bTcwT0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numeropedido", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTcwl0 — ButtonClicked em El[Icon Q]
1. **ResetGroup** [bTcwx0] alvo El[gp filter numpedido]
2. **ChangePage** [bTcws0] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numeropedido", value="{∅}"}}, keep_current_page_params=True

#### WF bTcxQ0 — ButtonClicked em El[Icon R]
1. **OpenURL** [bTcxW0] open_in_new_tab=True, url="{Parent:cpo.OrdemCompraArquivo}"

#### WF bTcxu0 — ButtonClicked em El[Icon S]
1. **ResetGroup** [bTcyA0] alvo El[gp filtercidade fornecedores]

#### WF bTeyi — ButtonClicked em El[Icon V]
1. **ResetGroup** [bTezT] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTeyo] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Cliente, custom_state="custom.var_a__oclifor_"
3. **ShowElement** [bTeyp] alvo El[pop.AgendaEnderecos A]

#### WF bTfAN — ButtonClicked em El[Icon HZ]
1. **DisplayGroupData** [bTfAT] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor
2. **ShowElement** [bTfAU] alvo El[pop.AgendaContatos A]

#### WF bTfAV — ButtonClicked em El[Icon GZ]
1. **DisplayGroupData** [bTfAb] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.QualCliente

#### WF bTfDP — ButtonClicked em El[Button EZ]
1. **ScheduleAPIEvent** [bTfDV] date=Page.Current Date/Time, api_event="bTfDZ", _wf_param_Qtd=El[dd qtd parcelas receber]:get_data:count, _wf_param_Fila=1, _wf_param_Prazos=El[dd qtd parcelas receber]:get_data, _wf_param_DtEntrega=El[dt dataentrega realizada]:get_data, _wf_param_QualEntrega=Parent

#### WF bTfEb — InputChanged em El[dd prazo a vencer]
1. **ChangeThing** [bTfEh] campos: cpo.DataVencimento = Page.Current Date/Time:plus_days(This:get_data:diasprazonumero) · to_change=Ancestor[TableCrossAxis]

#### WF bTfEi — ButtonClicked em El[Icon W]
1. **DeleteThing** [bTfEo] to_delete=Ancestor[TableCrossAxis]

#### WF bTfJz — ButtonClicked em El[btn cencela confirmaentrega]
- condição: Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)
1. **HideElement** [bTfKE] alvo El[pop confirma entrega]
2. **ResetGroup** [bTfKF] alvo El[pop confirma entrega]

#### WF bTfLG — ButtonClicked em El[Icon AZZ]
1. **ShowElement** [bTfLR] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTmGL] alvo El[pop.AgendaEnderecos A] · value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"

#### WF bTfMg — ButtonClicked em El[Icon BZZ]
1. **OpenURL** [bTfMm] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.Localizacaoo:google_map_link}"

#### WF bTfOS — ButtonClicked em El[Icon CZZ]
1. **ResetGroup** [bTfOX] alvo El[gp filternome fornecedores]

#### WF bTfOk — ButtonClicked em El[Icon DZZ]
1. **ResetGroup** [bTfOp] alvo El[gp filterUF fornecedores]

#### WF bThDv — ButtonClicked em El[edita produto]
1. **ShowElement** [bThEB] alvo El[pop.CadastroProdutos A]
2. **DisplayGroupData** [bThkL] alvo El[pop.CadastroProdutos A] · data_source=El[dd add modelo produto]:get_data

#### WF bThED — ButtonClicked em El[abre cadastro produtos]
1. **ShowElement** [bThEI] alvo El[pop.CadastroProdutos A]

#### WF bThVe — ButtonClicked em El[btn novofornecedor]
1. **ResetGroup** [bThVj] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bThVk] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Fornecedor, custom_state="custom.var_a__oclifor_"
3. **ShowElement** [bThVl] alvo El[pop.AgendaEnderecos A]

#### WF bThst — InputChanged em El[ip valorvenda]
1. **PauseWFClient** [bThsv] length=1000
2. **ScheduleAPIEvent** [bThsz] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bThtB — InputChanged em El[ip valorcomissao]
1. **PauseWFClient** [bThtG] length=1000
2. **ScheduleAPIEvent** [bThtH] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bThtM — InputChanged em El[dd tipofrete]
- condição: This:get_data:not_equals(Opt.TipoFrete.CIF Informado)
1. **ChangeThing** [bThtR] campos: cpo.ValorFrete = ∅ · to_change=Ancestor[TableCrossAxis]
2. **ScheduleAPIEvent** [bThtS] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bThtX — InputChanged em El[ip valorfrete]
1. **PauseWFClient** [bThtZ] 
2. **ScheduleAPIEvent** [bThtd] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bThtf — InputChanged em El[ip piscofins]
1. **PauseWFClient** [bThtk] length=1000
2. **ScheduleAPIEvent** [bThtl] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bThtq — ButtonClicked em El[Icon BZZZ]
1. **ShowElement** [bThtv] alvo El[pop consulta icms]

#### WF bThtx — InputChanged em El[ip icms]
1. **PauseWFClient** [bThuC] length=1000
2. **ScheduleAPIEvent** [bThuD] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bThxa — ButtonClicked em El[Icon HZZ]
1. **HideElement** [bThxg] alvo El[pop edita produtos do pedido]

#### WF bThxh — ButtonClicked em El[Icon FZZ]
- props: workflow_disabled=False
1. **DisplayGroupData** [bThxn] alvo El[pop edita produtos do pedido] · data_source=El[pop add edita pedido]:get_group_data
2. **ShowElement** [bThxr] alvo El[pop edita produtos do pedido]

#### WF bTiVy — ButtonClicked em El[btn expandir cartoes]
- condição: UrlParam("expandircartoes" as text):equals("no")
1. **ChangePage** [bTiWD] alvo El[Current page] · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTiWJ — ButtonClicked em El[btn pedidosconcluidos]
- condição: UrlParam("pedidosconcluidos" as text):equals("no")
1. **ChangePage** [bTiWL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}yes"}, 1={key="etapaentrega", value="{∅}Financeiro"}}, keep_current_page_params=True

#### WF bTiWQ — ButtonClicked em El[btn entregascanceladas]
- condição: UrlParam("etapapedido" as option.opt_etapas):display:equals("Pedido")
1. **ChangePage** [bTiWW] alvo El[Current page] · add_parameters=True, url_parameters={0={key="etapapedido", value="{Opt.Etapas.Cancelado:display}"}, 1={key="etapaentrega", value="{Opt.Etapas.Cancelado:display}"}}, keep_current_page_params=True

#### WF bTiWX — ButtonClicked em El[btn entregascanceladas]
- condição: UrlParam("etapapedido" as option.opt_etapas):display:equals("Cancelado")
1. **ChangePage** [bTiWc] alvo El[Current page] · add_parameters=True, url_parameters={0={key="etapapedido", value="Pedido"}, 1={key="etapaentrega", value="{∅}Em Entrega"}}, keep_current_page_params=True

#### WF bTiWn — ButtonClicked em El[Icon H]
1. **ChangePage** [bTiYN] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTiYD — Plugin[1648823245313x509054419018711040]/AAd em El[RangePicker A]
1. **MakeChangeCurrentUser** [bTiiE] campos: cpo.UltimoDateRange = This:get_AAF
2. **ChangePage** [bTiYI] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min}"}, 1={key="datafim", value="{This:get_AAF:max}"}}, keep_current_page_params=True

#### WF bTiYP — InputChanged em El[dd filter vendedor]
1. **ChangePage** [bTiYZ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTiYa — ButtonClicked em El[Icon EZZ]
1. **ResetGroup** [bTkgc2] alvo El[gp filtervendedor]
2. **ChangePage** [bTiYg] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTicz — ButtonClicked em El[Button BZ]
1. **ShowElement** [bTidF] alvo El[pop.AddEdita Produtos A]
2. **SetCustomState** [bTidH] alvo El[pop.AddEdita Produtos A] · value=Parent, custom_state="custom.var_qualpedido_"

#### WF bTidv — ButtonClicked em El[Icon IZZ]
1. **DeleteThing** [bTieB] to_delete=Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto
2. **DeleteThing** [bTieC] to_delete=Ancestor[TableCrossAxis]

#### WF bTigA — ButtonClicked em El[Icon JZZ]
1. **DisplayGroupData** [bTigG] alvo El[pop.AddEdita Produtos A] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTigH] alvo El[pop.AddEdita Produtos A]

#### WF bTjPu — InputChanged em El[ipt filter cliente]
1. **ChangePage** [bTjQA] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTjQB — ButtonClicked em El[Icon EZZZ]
1. **ResetGroup** [bTjQH] alvo El[gp filter cliente]
2. **ChangePage** [bTjQL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{∅}"}}, keep_current_page_params=True

#### WF bTjTx — ButtonClicked em El[Icon DZZZ]
1. **OpenURL** [bTjUH] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTjjH — ButtonClicked em El[Icon FZZZ]
1. **OpenURL** [bTjjO] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(1):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(1)}"
2. **OpenURL** [bTjjP] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(2):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(2)}"
3. **OpenURL** [bTjjU] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(3):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(3)}"
4. **OpenURL** [bTjjZ] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(4):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(4)}"

#### WF bTkep — ButtonClicked em El[Icon HZZZ]
1. **OpenURL** [bTkew] open_in_new_tab=True, url="{El[dd end destino]:get_data:cpo.Localizacaoo:google_map_link}"

#### WF bTlDb — ButtonClicked em El[Button CZ]
1. **ChangeThing** [bTlDh] campos: cpo.Arquivado = True; cpo.MotivoArquivamento = El[dd selecione o motivo]:get_data · to_change=Parent
2. **HideElement** [bTlDl] alvo El[pop.ArquivaCotação]

#### WF bTlYI — ButtonClicked em El[btn retira pedido]
1. **ShowElement** [bTlYg] alvo El[pop.ArquivaCotação]
2. **DisplayGroupData** [bTlYh] alvo El[pop.ArquivaCotação] · data_source=Parent

#### WF bTfPH — ButtonClicked em El[btn retira pedido]
1. **ChangeListOfThings** [bTfPJ] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QualPedido:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
2. **ChangeThing** [bTfPN] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QualPedido
3. **ResetGroup** [bTfPO] alvo El[pop add edita pedido]
4. **HideElement** [bTfPP] alvo El[pop add edita pedido]
5. **ScheduleAPIEvent** [bUEjU] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.EmailContato}", _wf_param_to="{El[dd qual cliente email]:get_data:cpo.Email}", _wf_param_body="Olá, tudo bem?⏎⏎Informamos que o seu pedido foi finalizado com sucesso.⏎⏎Aproveitamos para apoiar você na continuidade da sua operação. Se fizer sentido, podemos programar antecipadamente seus próximos pedidos e entregas, garantindo mais agilidade, disponibilidade de estoque e melhor planejamento logístico.⏎⏎Também convidamos você a conhecer mais sobre nossas soluções acessando nosso site:⏎👉 www.grupomegabox.com.br⏎⏎O Grupo Megabox oferece uma linha completa de soluções para o seu negócio:⏎⏎Paletes⏎Chapatex⏎Estruturas metálicas⏎Porta-paletes⏎Racks e gaiolas⏎Serviços de reforma de paletes⏎Locação de paletes⏎Recuperação de paletes diretamente na base dos clientes⏎⏎Nosso objetivo é gerar redução de custos, organização operacional e ganho de eficiência para sua empresa.⏎⏎Se quiser, é só responder este e-mail ou falar com nosso time para já deixarmos tudo programado.⏎⏎E para nós é muito importante evoluir sempre:⏎👉 Avalie nosso atendimento: https://grupomegabox.bubbleapps.io/formulariovenda?id={Parent:cpo.QualCliente:_id}&pdd{Parent:cpo.QualVendedor:_id}                                                     Sua opinião é fundamental para continuarmos melhorando nossos serviços.Seguimos à disposição!Atenciosamente,Equipe ComercialGrupo Megabox", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject=" Seu pedido foi finalizado ✅ | Vamos programar as próximas entregas?"
6. **ChangeThing** [bUEnz] campos: cpo.UltimoHistoricoData = Page.Current Date/Time · to_change=Ancestor[TableCrossAxis]:cpo.QualCliente
7. **NewThing** [bUEoF] tipo Tbl.Historico · campos: cpo.QualCliente = Ancestor[TableCrossAxis]:cpo.QualCliente; cpo.Descricao = "Email enviado: Olá, tudo bem?Informamos que o seu pedido foi finalizado com sucesso.Aproveitamos para apoiar você na continuidade da sua operação. Se fizer sentido, podemos programar antecipadamente seus próximos pedidos e entregas, garantindo mais agilidade, disponibilidade de estoque e melhor planejamento logístico.Também convidamos você a conhecer mais sobre nossas soluções acessando nosso site:👉 www.grupomegabox.com.brO Grupo Megabox oferece uma linha completa de soluções para o seu negócio:PaletesChapatexEstruturas metálicasPorta-paletesRacks e gaiolasServiços de reforma de paletesLocação de paletesRecuperação de paletes diretamente na base dos clientesNosso objetivo é gerar redução de custos, organização operacional e ganho de eficiência para sua empresa.Se quiser, é só responder este e-mail ou falar com nosso time para já deixarmos tudo programado.E para nós é muito importante evoluir sempre:👉 Avalie nosso atendimento: https://grupomegabox.bubbleapps.io/formulariovenda?id={Parent:cpo.QualCliente:_id}Sua opinião é fundamental para continuarmos melhorando nossos serviços.Seguimos à disposição!Atenciosamente,Equipe ComercialGrupo Megabox"; cpo.QualVendedor = Ancestor[TableCrossAxis]:cpo.QualVendedor

#### WF bTmXN — ButtonClicked em El[btn proposta gravar]
- props: event_color="blue", workflow_disabled=False
1. **SetCustomState** [bTmXP] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTmXT] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTmXU] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTmXT]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTmXV] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTmXT]
5. **ChangeThing** [bTmXZ] campos: cpo.QuaisPropostas = ResultOfStep[bTmXT] · to_change=El[pop add edita propostas]:get_group_data
6. **Plugin[1648430145817x673906689668022300]/AAL** [bTmXa] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTmXT]:cpo.PropostaNum}", AAf=False
7. **SetCustomState** [bTmXb] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
8. **ResetGroup** [bTmXf] alvo El[gp add edita proposta]

#### WF bToYN — ButtonClicked em El[Icon M]
1. **ScheduleAPIEvent** [bToYT] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzTz — ButtonClicked em El[gp card entrega]
1. **ToggleElement** [bTzUE] alvo El[gp detalhes entrega]

#### WF bTzUJ — ButtonClicked em El[btn edita pedido]
1. **DisplayGroupData** [bTzUL] alvo El[pop add edita pedido] · data_source=Parent:cpo.QualPedido
2. **ShowElement** [bTzUP] alvo El[pop add edita pedido]
3. **SetCustomState** [bTzUQ] alvo El[pop add edita pedido] · value=Opt.Ações.Edita Pedido, custom_state="custom.var_acaocotacao_"

#### WF bTzUV — ButtonClicked em El[ico proposta]
1. **DisplayGroupData** [bTzUX] alvo El[pop confirma entrega] · data_source=Parent
2. **ShowElement** [bTzUb] alvo El[pop confirma entrega]

#### WF bTzUd — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):not_equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTzUi] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value="{Parent:cpo.QualPedido:_id}"}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTzUn — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTzUp] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value=""}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bUAdY — ButtonClicked em El[Icon GZZZ]
1. **ShowElement** [bUAde] alvo El[pop.DuplicarPedido A]
2. **DisplayGroupData** [bUAdj] alvo El[pop.DuplicarPedido A] · data_source=Ancestor[TableCrossAxis]

#### WF bUCUR — ButtonClicked em El[Icon PZZZ]
1. **ResetGroup** [bUCUW] alvo El[gp filter regime tributario]

#### WF bUESn — PopupClosed em El[pop add edita propostas]

#### WF bUESt — PopupClosed em El[pop add edita pedido]
- condição: El[Página vendas]:custom.var_ultimotblpedido_:cpo.QuaisEntregas:cpo.StatusEntrega:contains(Opt.Etapas.Financeiro):and_(El[Página vendas]:custom.var_ultimotblpedido_:cpo.ContaEmail:not_equals(1))
- props: workflow_disabled=True
1. **ScheduleAPIEvent** [bUESz] SÓ SE El[Switch C]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="", _wf_param_to="{This:get_group_data:cpo.EmailCliente:cpo.Email}", _wf_param_body="Olá, tudo bem?⏎⏎Informamos que o seu pedido foi finalizado com sucesso.⏎⏎Aproveitamos para apoiar você na continuidade da sua operação. Se fizer sentido, podemos programar antecipadamente seus próximos pedidos e entregas, garantindo mais agilidade, disponibilidade de estoque e melhor planejamento logístico.⏎⏎Também convidamos você a conhecer mais sobre nossas soluções acessando nosso site:⏎👉 www.grupomegabox.com.br⏎⏎O Grupo Megabox oferece uma linha completa de soluções para o seu negócio:⏎⏎Paletes⏎Chapatex⏎Estruturas metálicas⏎Porta-paletes⏎Racks e gaiolas⏎Serviços de reforma de paletes⏎Locação de paletes⏎Recuperação de paletes diretamente na base dos clientes⏎⏎Nosso objetivo é gerar redução de custos, organização operacional e ganho de eficiência para sua empresa.⏎⏎Se quiser, é só responder este e-mail ou falar com nosso time para já deixarmos tudo programado.⏎⏎E para nós é muito importante evoluir sempre:⏎👉 Avalie nosso atendimento: https://grupomegabox.bubbleapps.io/formulariovenda?id={This:get_group_data:cpo.QualCliente:_id}⏎⏎Sua opinião é fundamental para continuarmos melhorando nossos serviços.⏎⏎Seguimos à disposição!⏎⏎Atenciosamente,⏎Equipe Comercial⏎Grupo Megabox", _wf_param_sender="[Megabox]{∅}", _wf_param_subject=" Seu pedido foi finalizado ✅ | Vamos programar as próximas entregas?"
2. **ChangeThing** [bUEjP] campos: cpo.ContaEmail = 1 · to_change=El[Página vendas]:custom.var_ultimotblpedido_

#### WF bUEti — InputChanged em El[ipt entrega dataprevista]
1. **ChangeThing** [bUEtp] campos: cpo.DataEntrega = This:get_data · to_change=Ancestor[TableCrossAxis]
2. **ChangeThing** [bUEtu] SÓ SE Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(Ancestor[TableCrossAxis]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=Ancestor[TableCrossAxis]

#### WF bUEzt — InputChanged em El[ip totalbruto copy 3]

#### WF bTfTb0 — ButtonClicked em El[btn pedidosconcluidos]
- condição: UrlParam("pedidosconcluidos" as text):equals("yes")
1. **ChangePage** [bTiWF] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}no"}, 1={key="etapaentrega", value="{∅}Em Entrega"}}, keep_current_page_params=True

#### WF bThlm0 — ButtonClicked em El[Icon FZ]
1. **ResetGroup** [bThls0] alvo El[gp filterID fornecedores]

#### WF bTiFL0 — ButtonClicked em El[gp card entrega]
1. **ToggleElement** [bTiFR0] alvo El[gp detalhes entrega]

#### WF bTiKL0 — Plugin[1648430145817x673906689668022300]/AAY em El[old PDF/IMG PEDIDO] «PDF/IMG PEDIDO Element Saved»
- props: event_color="cyan", workflow_disabled=False
1. **ChangeThing** [bTiKQ0] campos: cpo.PedidoArquivo = "{This:get_AAb}" · to_change=Parent
2. **ScheduleAPIEvent** [bTnxT0] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailFornecedorCC}", _wf_param_to="{Parent:cpo.EmailFornecedor:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 7):first_element:cpo.QuaisUsuarios:cpo.EmailContato}", _wf_param_body="{Parent:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_anexo1="{Parent:cpo.PedidoArquivo}", _wf_param_anexo2="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(2)}", _wf_param_anexo3="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(3)}", _wf_param_anexo4="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(4)}", _wf_param_anexo5="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(5)}", _wf_param_anexo6="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(6)}", _wf_param_anexo7="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(7)}", _wf_param_anexo8="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(8)}", _wf_param_anexo9="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(9)}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_anexo10="{Parent:cpo.QualProposta:cpo.AnexosDiversos:specific_item(1)}", _wf_param_subject="Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")}", _wf_param_atachments="{Text("{Parent:cpo.PedidoArquivo:url}⏎")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTnxU0] date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailClienteCC}", _wf_param_to="{Parent:cpo.EmailCliente:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 6):first_element:cpo.QuaisUsuarios:cpo.EmailContato}", _wf_param_body="{Parent:cpo.CorpoEmailCliente}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_anexo1="{Parent:cpo.PedidoArquivo}", _wf_param_anexo2="{∅}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}")}", _wf_param_atachments="{Text("{Parent:cpo.PedidoArquivo:url}⏎{Parent:cpo.OrdemCompraArquivo:url}⏎")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **HideElement** [bTiKb0] alvo El[pop add edita pedido]
5. **SetCustomState** [bTiKc0] alvo El[Página vendas] · value=False, custom_state="custom.var_showalert_"
6. **HideElement** [bTiKd0] alvo El[gp alert gravando]

#### WF bTiLN0 — ButtonClicked em El[Link A]
1. **Plugin[1583324666271x739637822593433600]/AAJ** [bTiLX0] AAK="{Parent:cpo.PedidoArquivo}", AAL="linkpedido", AAM=False

#### WF bTiOx0 — ButtonClicked em El[btn reenviar proposta]
- props: workflow_disabled=False
1. **TriggerCustomEvent** [bTnxs0] arguments={0={param_id="bTaLh", arg_value=Parent}}, custom_event="bTaLf"
2. **Plugin[1658328157117x953686184769617900]/AAT** [bTiPH0] AAF="Proposta re-enviada com sucesso", AAJ="var(--color_primary_default)"

#### WF bTnvj0 — Plugin[1648430145817x673906689668022300]/AAY em El[PDF/IMG PROPOSTA]
- props: event_color="purple", workflow_disabled=False
1. **ChangeThing** [bTnvo0] campos: cpo.AquivoProposta = "{This:get_AAb}" · to_change=El[gp proposta a anexar]:get_group_data
2. **ScheduleAPIEvent** [bTnvu0] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailsCopia}", _wf_param_to="{Parent:cpo.EnviarPara:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 5):first_element:cpo.QuaisUsuarios:cpo.EmailContato}", _wf_param_body="{Parent:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_anexo1="{Parent:cpo.AquivoProposta}", _wf_param_anexo2="{Parent:cpo.AnexosDiversos:specific_item(1):url}", _wf_param_anexo3="{Parent:cpo.AnexosDiversos:specific_item(2):url}", _wf_param_anexo4="{Parent:cpo.AnexosDiversos:specific_item(3):url}", _wf_param_anexo5="{Parent:cpo.AnexosDiversos:specific_item(4):url}", _wf_param_anexo6="{Parent:cpo.AnexosDiversos:specific_item(5):url}", _wf_param_anexo7="{Parent:cpo.AnexosDiversos:specific_item(6):url}", _wf_param_anexo8="{Parent:cpo.AnexosDiversos:specific_item(7):url}", _wf_param_anexo9="{Parent:cpo.AnexosDiversos:specific_item(8):url}", _wf_param_sender="[MegaBox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_anexo10="{Parent:cpo.AnexosDiversos:specific_item(9):url}", _wf_param_subject="Orçamento: {Text("{Parent:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.PropostaNum}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFornecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_atachments="{Parent:cpo.AquivoProposta}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted

#### WF bTzcV0 — ButtonClicked em El[btn edita endereco fornecedor]
1. **ShowElement** [bTzca0] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzcb0] alvo El[pop.AgendaEnderecos A] · value=El[pop add edita propostas]:get_group_data:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.QualFornecedor, custom_state="custom.var_qualgrupoclifor_"
