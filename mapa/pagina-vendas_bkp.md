# Pagina: `vendas_bkp` (bTtmP)

Estados customizados: `var_showalert_` : boolean; `var_a__ovendas_` : Opt.Ações; `var_usaroldpdf_` : boolean; `var_a__oor_amento_` : Opt.Ações; `var_todosetapacotacao_` : boolean; `var_todosfornecedores_` : boolean

Resumo: 1266 elementos · 160 workflows · 369 ações · 367 condicionais · 16 estados customizados
Elementos por tipo: Text 343, TableCell 234, Group 229, TableMainAxis 115, Icon 88, Input 61, TableCrossAxis 43, Button 34, Dropdown 22, Table 21, Image 17, CustomElement 12, Popup 10, MultiLineInput 7, PictureInput 6, DateInput 5, AutocompleteDropdown 3, RepeatingGroup 2, FileInput 2, select2-MultiDropdown 2, Plugin[1680110374647x249108010620944400]/AAC 2, Plugin[1648430145817x673906689668022300]/AAc 2, HTML 2, Plugin[1648823245313x509054419018711040]/AAC 1, RadioButtons 1, Link 1, Checkbox 1

## Árvore de elementos

- **Popup** `pop.ArquivaCotação` (bTuiL) — props: group_type="custom.tbl_orcamento", vertical_centering=True
  - **Text** `Text CZZZZZZZZZ` (bTuid) — text: "Arquivando Cotação" · props: font_alignment="center"
  - **Group** `Group MZZZZZZ` (bTuiP) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Group** `Group MZZZZZZ` (bTuiX) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Image** `Image Q` (bTuib) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
        - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
    - **Group** `Group MZZZZZZ` (bTuiQ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Text** `Text BZZZZZZZZZ` (bTuiR) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}- Nº {Parent:cpo.CotacaoNum}"
      - **Text** `Text BZZZZZZZZZ` (bTuiV) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
      - **Text** `Text BZZZZZZZZZ` (bTuiW) — text: "[b]Dt Cotação[/b]: {Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
  - **Dropdown** `dd selecione o motivo` (bTuic) — data_source: All(Opt.MotivoArquivamento):sorted(descending=False, sort_field="display") · placeholder: "Selecione o motivo" · props: mandatory=True, default=Parent:cpo.MotivoArquivamento, vertical_centering=True, dynamic_type="option.opt_motivoarquivamento", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Button** `Button CZ` (bTuih) — text: "Arquivar" · props: icon="material outlined archive", icon_size=18, button_type="label_icon"
- **Group** `gp content` (bTuZV) — props: vertical_centering=True
  - **Group** `gp tabs` (bTuYP) — props: vertical_centering=True
    - **Group** `Group XZZZZZ` (bTuYU) — props: vertical_centering=True
      - **Text** `Text QZZZZZZZZ` (bTuYV) — text: "Data criação (Cotação e Pedido)"
      - **Group** `gp filter datapedido` (bTuYZ)
        - **Plugin[1648823245313x509054419018711040]/AAC** `RangePicker A` (bTuYb) — props: padding_horizontal=6, padding_vertical=15, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAH="DD/MM/YY", AAM=2, AAN=2, AAP="Aplicar", AAQ="Cancelar", AAR=False, AAS=False, AAf="DD/MM/YYYY - DD/MM/YYYY"
          - ⟂ quando This:is_hovered → 
        - **Icon** `Icon H` (bTuYa) — props: icon="material two-tone event_repeat", vertical_centering=True
    - **Group** `Group BZZZZZZ` (bTuYz) — props: vertical_centering=True
      - **Text** `Text RZZZZZZZZ` (bTuZD) — text: "Vendedor"
      - **Group** `gp filtervendedor` (bTuZE)
        - **Dropdown** `dd filter vendedor` (bTuZF) — data_source: Search(User; sort cpo.NomeModelo) · placeholder: "Vendedor" · props: default=UrlParam("vendedor" as user), vertical_centering=True, dynamic_type="user", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
          - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) → default=CurrentUser, disabled=True
        - **Icon** `Icon EZZ` (bTuZJ) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[dd filter vendedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group YZZZZZ` (bTuYf) — props: vertical_centering=True
      - **Text** `Text SZZZZZZZZ` (bTuYg) — text: "Número pedido"
      - **Group** `gp filter numpedido` (bTuYh)
        - **Input** `ipt filter numpedido` (bTuYl) — placeholder: "Número pedido" · content: "{UrlParam("numeropedido" as None)}" · props: placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `Icon Q` (bTuYm) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[ipt filter numpedido]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group IZZZZZZ` (bTuZK) — props: vertical_centering=True
      - **Text** `Text XZZZZZZZZ` (bTuZL) — text: "Cliente"
      - **Group** `gp filter cliente` (bTuZP)
        - **AutocompleteDropdown** `ipt filter cliente` (bTuZQ) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Nome Cliente" · props: default=UrlParam("cliente" as custom.tbl_clientes), field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `Icon EZZZ` (bTuZR) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[ipt filter cliente]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group AZZZZZZ` (bTuYn) — props: vertical_centering=True
      - **Button** `btn cotacao arquivada` (bTuYr) — text: "cotações arquivadas" · props: icon="material outlined archive", icon_size=18, button_type="label_icon", title_attribute="Exibe cotações arquivadas: {UrlParam("cotacaoarquivada" as boolean)}"
        - ⟂ quando UrlParam("cotacaoarquivada" as boolean):is_true → icon="material filled archive", font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn data crescente` (bTuYs) — text: "data crescente" · props: icon="fa fa-sort-numeric-asc", icon_size=14, button_type="label_icon", title_attribute="Ordem +novo pro +antigo: {UrlParam("ordemdecrescente" as boolean)}"
        - ⟂ quando UrlParam("ordemdecrescente" as boolean):is_false → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn expandir cartoes` (bTuYt) — text: "expandir cartões" · props: icon="fa fa-angle-double-down", icon_size=16, button_type="label_icon", title_attribute="Expande todos cartões"
        - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn pedidosconcluidos` (bTuYx) — text: "exibe concluídos" · props: icon="fa fa-flag-checkered", icon_size=16, button_type="label_icon", title_attribute="Exibe pedidos concluidos"
        - ⟂ quando UrlParam("pedidosconcluidos" as boolean):is_true → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn entregascanceladas` (bTuYy) — text: "exibe cancelados" · props: icon="material outlined event_busy", icon_size=16, button_type="label_icon", title_attribute="Exibe pedidos e entregas canceladas"
        - ⟂ quando UrlParam("etapapedido" as option.opt_etapas):display:equals("Cancelado") → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
    - **Button** `btn nova cotação` (bTuYT) — text: "Cotação" · props: icon="fa fa-plus", vertical_centering=True, icon_size=16, button_type="label_icon"
  - **Table** `Table etapas` (bTuYO) — data_source: All(Opt.Etapas) · props: group_type="option.opt_etapas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=4, horizontal_separator_style="none"
    - **TableCrossAxis** `TableCrossAxis J` (bTuXL) — props: axis_index=2, cross_axis_repeat=True, fixed_number_repeating_axis=True
      - **TableCell** `Cell LZZZ` (bTuSn) — props: cell_main_axis_id="bTuXM"
        - **Table** `rpg cardscotacao` (bTuSr) — data_source: Search(Tbl.Cotacao: cpo.CotacaoEtapa equals Opt.Etapas.Cotação AND Created By equals UrlParam("vendedor" as user) AND cpo.Arquivado equals UrlParam("cotacaoarquivada" as boolean) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.CotacaoNum equals UrlParam("numeropedido" as number) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_orcamento", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis AZZ` (bTuSs) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis K` (bTuSt) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell QZZZ` (bTuSx) — props: cell_main_axis_id="bTuSs"
              - **Group** `gp card cotacao` (bTuSy) — props: vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → bgcolor="var(--color_bTHGh_default)"
                - **Group** `Group RZ` (bTuSz) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group CZZZZZZ` (bTuTX) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image N` (bTuTb) — props: src="{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group SZ` (bTuTD) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text PZZZZ` (bTuTE) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}- Nº {Ancestor[TableCrossAxis]:cpo.CotacaoNum}"
                    - **Text** `Text QZZZZ` (bTuTF) — text: "[b]Vendedor[/b]: {Ancestor[TableCrossAxis]:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text ZZ` (bTuTJ) — text: "[b]Dt Cotação[/b]: {Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                    - **Group** `Group Tbl.Cotacao` (bTuTK) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → is_visible=True
                      - **Button** `btn retira pedido` (bTuTL) — text: "{Parent:cpo.MotivoArquivamento:display}" · props: icon="ionic outlined archive", font_alignment="left", icon_size=16, button_type="label_icon", title_attribute="retira o pedido da lista após entregas feitas e/ou canceladas"
                        - ⟂ quando Parent:cpo.MotivoArquivamento:is_empty → text="{∅}Motivo não disponível"
                  - **Group** `Group ZZ` (bTuTP) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `btn edita orcamento` (bTuTW) — props: icon="material outlined edit", title_attribute="Editar cotação"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true:and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                    - **Group** `btn addedita proposta` (bTuTQ) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → button_disabled=True
                      - ⟂ quando El[ipt cartão contaproduto]:get_data:greater_or_equal_than(1):and_(El[ipt cartao contavencedor]:get_data:greater_or_equal_than(1)) → is_visible=True
                      - **Icon** `ico proposta` (bTuTR) — props: icon="material filled receipt", title_attribute="Propostas dessa cotação: {Ancestor[TableCrossAxis]:cpo.QuaisPropostas:count}"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → icon_color="var(--color_bTHGl_default)"
                      - **Text** `Text UZZZZ` (bTuTV) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisPropostas:count}" · props: font_alignment="center"
                - **Group** `gp resumo cotacao` (bTuTc) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Group** `Group UZ` (bTuTd) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica fornecedores` (bTuTi) — props: icon="fa fa-shopping-cart", vertical_centering=True, title_attribute="Qtd de fornecedores dessa cotação"
                    - **Text** `Text RZZZZ` (bTuTh) — text: "{Parent:cpo.QuaisProdutos:count}  produtos no carrinho"
                  - **Group** `Group VZ` (bTuTj) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica vencedor` (bTuTo) — props: icon="fa fa-trophy", vertical_centering=True
                    - **Text** `Text SZZZZ` (bTuTn) — text: "{Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count}  produtos possuem vencedores"
                  - **Group** `Group WZ` (bTuTp) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica vencedor` (bTuTv) — props: icon="fa fa-file-text", vertical_centering=True
                    - **Text** `Text TZZZZ` (bTuTu) — text: "{Parent:cpo.QuaisPropostas:count} propostas enviadas"
                    - **Icon** `btn arquivar` (bTuTt) — props: icon="material filled archive", title_attribute="Arquivar cotação"
                      - ⟂ quando Parent:cpo.Arquivado:is_true → icon="material filled unarchive", icon_color="var(--color_bTHGs_default)", title_attribute="Desarquivar cotação{∅}"
                - **Input** `ipt cartão contaproduto` (bTuTz) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisProdutos:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                - **Input** `ipt cartao contavencedor` (bTuUA) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
          - **TableCrossAxis** `TableCrossAxis K` (bTuUB) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell QZZZ` (bTuUF) — props: cell_main_axis_id="bTuSs"
      - **TableCell** `Cell LZZZ` (bTuUG) — props: cell_main_axis_id="bTuXN"
        - **Table** `rpg cardspedidos` (bTuUH) — data_source: Search(Tbl.Pedido: Created By equals UrlParam("vendedor" as user) AND cpo.PedidoFinalizado equals UrlParam("pedidosconcluidos" as boolean) AND _id {'type': 'Empty'} UrlParam("filtrafinanceiro" as custom.tbl_pedidos):_id AND _id {'type': 'Empty'} UrlParam("filtraentrega" as custom.tbl_pedidos):_id AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualEtapa equals UrlParam("etapapedido" as option.opt_etapas) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_pedidos", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis KZZ` (bTuUL) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis P` (bTuUM) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell HZZZZ` (bTuUN) — props: cell_main_axis_id="bTuUL"
              - **Group** `gp card pedido` (bTuUR) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:equals(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count)) → bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                - ⟂ quando UrlParam("filtrapedido" as None):equals(Ancestor[TableCrossAxis]:_id):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])) → boxshadow_spread=2
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEtapa:equals(Opt.Etapas.Cancelado) → bgcolor="rgba(var(--color_destructive_default_rgb), 0.05)"
                - **Icon** `chk filtrapedido` (bTuVI) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
                  - ⟂ quando UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Parent)) → is_visible=False
                - **Group** `Group RZZ` (bTuUS) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group DZZZZZZ` (bTuUw) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image K` (bTuUx) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group RZZ` (bTuUT) — data_source: Ancestor[TableCrossAxis]:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTuUY) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:cpo.NumeroPedido}" · props: vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTuUX) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text TZZZZZZZZ` (bTuUZ) — text: "[b]Dt Pedido[/b]: {Parent:cpo.QualPedido:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                    - **Text** `Text DZZZZZZZZZ` (bTuUl) — oculto ao carregar · text: "[b]Cancelado[/b]: {Ancestor[TableCrossAxis]:cpo.MotivoCancelamento}" · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEtapa:equals(Opt.Etapas.Cancelado) → is_visible=True
                    - **Group** `Group CZZZZZ` (bTuUd) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(El[ipt cartao contaentregas]:get_data:equals(El[ipt cartão entragasconcluidas]:get_data)) → is_visible=True
                      - **Input** `ipt cartao contaentregas` (bTuUf) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                      - **Input** `ipt cartão entragasconcluidas` (bTuUe) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                      - **Text** `Text WZZZZZZ` (bTuUk) — text: "Entregas concluidas"
                      - **Button** `btn retira pedido` (bTuUj) — text: "retira pedido" · props: icon="material outlined playlist_remove", icon_size=22, button_type="label_icon", title_attribute="retira o pedido da lista após entregas feitas e/ou canceladas"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.PedidoFinalizado:is_true → is_visible=False
                  - **Group** `Group RZZ` (bTuUp) — props: vertical_centering=True
                    - **Icon** `Icon fa fa-star-o` (bTuUv) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Text("Os valores desse pedido foram alterados pelo financeiro pelo seguinte motivo: {Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores}")}"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores:is_not_empty → is_visible=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores:is_empty → is_visible=False
                    - **Icon** `btn edita pedido` (bTuUq) — props: icon="material outlined edit", title_attribute="editar pedido"
                    - **Icon** `ico cancela pedido` (bTuUr) — props: icon="material outlined event_busy", title_attribute="cancelar todo o pedido e entregas"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:equals(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                - **RepeatingGroup** `rpg show produtos pedido` (bTuVB) — oculto ao carregar · data_source: Parent:cpo.QuaisEntregas · props: group_type="custom.tbl_entregas", separator_style="none", fixed_rows=False, cell_min_height_css="25px"
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Group** `Group RZZ` (bTuVC) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `indica vencedor` (bTuVH) — text: "{Parent:cpo.QtdEntrega}" · props: font_alignment="center", vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTuVD) — text: "{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                      - ⟂ quando Parent:cpo.SaiuEntrega:is_true:and_(Parent:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → text="{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - NF: {Parent:cpo.NumNfFornecedor}", font_color="var(--color_bTHHX_default)", font_weight="600"
                      - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - NF: {Parent:cpo.NumNfFornecedor}", font_color="var(--color_bTHHQ_default)", font_weight="600"
          - **TableCrossAxis** `TableCrossAxis P` (bTuVJ) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell HZZZZ` (bTuVN) — props: cell_main_axis_id="bTuUL"
      - **TableCell** `Cell LZZZ` (bTuVO) — props: cell_main_axis_id="bTuXR"
        - **Table** `rpg cardsentregas` (bTuVP) — data_source: Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DtPedido gte UrlParam("datainicio" as date) AND cpo.DtPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_entregas", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes") → data_source=Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty)
          - **TableMainAxis** `TableMainAxis NZZ` (bTuVT) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis R` (bTuVU) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell LZZZZ` (bTuVV) — props: cell_main_axis_id="bTuVT"
              - **Group** `gp card entrega` (bTuVZ) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → bgcolor="rgba(var(--color_destructive_default_rgb), 0.05)"
                - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → boxshadow_spread=2
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → bgcolor="var(--color_bTHHW_default)"
                - **Icon** `chk filtraentrega` (bTuWF) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido) → icon="material outlined check_box"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → is_visible=False
                - **Group** `Group OZZZ` (bTuVa) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - **Group** `Group EZZZZZZ` (bTuVx) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Image** `Image L` (bTuVy) — props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group OZZZ` (bTuVb) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text UZZZZZZ` (bTuVf) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:cpo.NumeroPedido} - NF: {Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: vertical_centering=True
                    - **Text** `Text UZZZZZZ` (bTuVg) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text UZZZZZZZZ` (bTuVh) — text: "[b]Dt Pedido[/b]: {Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                      - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes") → text="[b]Dt Entrega:[/b] {Ancestor[TableCrossAxis]:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
                    - **Text** `Text EZZZZZZZZZ` (bTuVl) — oculto ao carregar · text: "[b]Cancelado[/b]: {Ancestor[TableCrossAxis]:cpo.MotivoCancelamento}" · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=True
                  - **Group** `Group OZZZ` (bTuVm) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Icon** `Icon fa fa-star-o` (bTuVt) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Text("Os valores desse pedido foram alterados pelo financeiro pelo seguinte motivo: {Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores}")}"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_not_empty → is_visible=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_empty → is_visible=False
                    - **Icon** `btn edita pedido` (bTuVn) — props: icon="material outlined edit", title_attribute="edita pedido"
                      - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                    - **Group** `Group PZZZ` (bTuVr) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                      - ⟂ quando This:is_hovered → boxshadow_blur=2
                      - **Image** `ico proposta` (bTuVs) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268292968x358240139627571200/truck-ramp-box-solid%20blue.svg"
                        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268301221x827639874525786900/truck-ramp-box-solid%20grey.svg", button_disabled=True
                        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268301221x827639874525786900/truck-ramp-box-solid%20grey.svg", button_disabled=True
                - **Group** `gp detalhes entrega` (bTuVz) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Text** `indica vencedor` (bTuWE) — text: "{Parent:cpo.QtdEntrega}" · props: font_alignment="center", vertical_centering=True
                  - **Text** `Text UZZZZZZ` (bTuWD) — text: "{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
          - **TableCrossAxis** `TableCrossAxis R` (bTuWJ) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell LZZZZ` (bTuWK) — props: cell_main_axis_id="bTuVT"
      - **TableCell** `Cell NZZZ` (bTuWL) — props: cell_main_axis_id="bTuXk"
        - **Table** `rpg cardsfinanceiro` (bTuWP) — data_source: Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}" AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_qualentrega_custom_tbl_entregas", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="sum", message="cpo_valorcomissao_number"}}) · props: group_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbEVudHJlZ2EiLCJjdXN0b20udGJsX2VudHJlZ2FzIl0sImFnZzAiOlsic3VtIG9mIGNwby5WYWxvckNvbWlzc2FvIiwibnVtYmVyIl19fQ==", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis SZZ` (bTuWQ) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis T` (bTuWR) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell TZZZZ` (bTuWV) — props: cell_main_axis_id="bTuWQ"
              - **Group** `gp card financeio` (bTuWW) — data_source: Ancestor[TableCrossAxis]:grouping0 · props: group_type="custom.tbl_entregas", vertical_centering=True
                - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido):or_(UrlParam("filtraentregas" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)) → boxshadow_spread=2
                - **Icon** `chk filtrafinanceiro` (bTuWu) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)) → is_visible=False
                  - ⟂ quando UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido) → icon="material outlined check_box"
                - **Group** `Group YZZZ` (bTuWX) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group FZZZZZZ` (bTuWp) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image M` (bTuWt) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group YZZZ` (bTuWb) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text LZZZZZZZ` (bTuWc) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:grouping0:cpo.NumeroPedido} - NF: {Ancestor[TableCrossAxis]:grouping0:cpo.NumNfFornecedor}" · props: vertical_centering=True
                    - **Text** `Text LZZZZZZZ` (bTuWd) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text VZZZZZZZZ` (bTuWh) — text: "[b]Dt Pedido[/b]: {Parent:cpo.QualPedido:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                  - **Group** `Group YZZZ` (bTuWi) — props: vertical_centering=True
                    - **Icon** `btn edita pedido` (bTuWo) — props: icon="material outlined edit", title_attribute="edita contas a receber"
                    - **Group** `btn entregafeita` (bTuWj) — props: vertical_centering=True
                      - **Icon** `ico proposta` (bTuWn) — props: icon="material filled request_quote", title_attribute="Propostas dessa cotação: "
                - **RepeatingGroup** `rpg show contasreceber` (bTuWv) — oculto ao carregar · data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", separator_style="none", fixed_rows=False, cell_min_height_css="25px"
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Group** `Group SZZZZZ` (bTuWz) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                    - **Text** `indica vencedor` (bTuXF) — text: "{Parent:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", vertical_centering=True
                      - ⟂ quando Parent:cpo.DataVencimento:less_than(Page.Current Date/Time):and_(Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.A receber)) → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
                      - ⟂ quando Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → border_color="var(--color_bTHHX_default)", font_color="var(--color_bTHHX_default)"
                    - **Text** `Text OZZZZZZZZ` (bTuXB) — text: "{Parent:cpo.DataVencimento:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}"
                      - ⟂ quando Parent:cpo.DataVencimento:less_than(Page.Current Date/Time):and_(Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.A receber)) → font_color="var(--color_bTHHQ_default)"
                      - ⟂ quando Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → font_color="var(--color_bTHHX_default)"
                    - **Icon** `Icon GZZZ` (bTuXA) — props: icon="material outlined open_in_new", vertical_centering=True
                      - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → is_visible=False
          - **TableCrossAxis** `TableCrossAxis T` (bTuXG) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell TZZZZ` (bTuXH) — props: cell_main_axis_id="bTuWQ"
    - **TableMainAxis** `TableMainAxis XZ` (bTuXM) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis XZ` (bTuXN) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis XZ` (bTuXR) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis J` (bTuXS) — props: axis_index=0
      - **TableCell** `Cell LZZZ` (bTuXT) — props: cell_main_axis_id="bTuXM"
        - **Text** `Text KZZZZ` (bTuXX) — text: "Cotação"
      - **TableCell** `Cell LZZZ` (bTuXY) — props: cell_main_axis_id="bTuXN"
        - **Text** `Text LZZZZ` (bTuXZ) — text: "Pedido"
      - **TableCell** `Cell LZZZ` (bTuXd) — props: cell_main_axis_id="bTuXR"
        - **Text** `Text MZZZZ` (bTuXe) — text: "Entrega"
      - **TableCell** `Cell MZZZ` (bTuXf) — props: cell_main_axis_id="bTuXk"
        - **Text** `Text NZZZZ` (bTuXj) — text: "Financeiro"
    - **TableMainAxis** `TableMainAxis YZ` (bTuXk) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis L` (bTuXl) — props: axis_index=1
      - **TableCell** `Cell RZZZ` (bTuXp) — props: cell_main_axis_id="bTuXM"
        - **Text** `Text XZZZZ` (bTuXq) — text: "{Search(Tbl.Cotacao: cpo.CotacaoEtapa equals Opt.Etapas.Cotação AND Created By equals El[dd filter vendedor]:get_data AND cpo.Arquivado equals UrlParam("cotacaoarquivada" as boolean); sort Created Date desc, ignore empty):count} cotações {∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTuXr) — props: cell_main_axis_id="bTuXN"
        - **Text** `Text XZZZZZZ` (bTuXv) — text: "{Search(Tbl.Pedido: Created By equals UrlParam("vendedor" as user) AND cpo.PedidoFinalizado equals UrlParam("pedidosconcluidos" as boolean) AND _id {'type': 'Empty'} UrlParam("filtrafinanceiro" as custom.tbl_pedidos):_id AND _id {'type': 'Empty'} UrlParam("filtraentrega" as custom.tbl_pedidos):_id AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualEtapa equals UrlParam("etapapedido" as option.opt_etapas) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):count} pedidos{∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTuXw) — props: cell_main_axis_id="bTuXR"
        - **Text** `Text PZZZZZZZZ` (bTuXx) — text: "Total Faturado: ⏎{Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date); sort Created Date desc, ignore empty):cpo.ValorVendaLiquido:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}{∅}{∅}" · props: font_alignment="center"
        - **Text** `Text FZZZZZZZZZ` (bTuYB) — text: " {Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.DtPedido gte UrlParam("datainicio" as date) AND cpo.DtPedido lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):count} Entregas{∅}{∅}" · props: font_alignment="center"
        - **Text** `Text GZZZZZZZZZ` (bTuYC) — text: "Total Comissão: ⏎{Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date); sort Created Date desc, ignore empty):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}{∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTuYD) — props: cell_main_axis_id="bTuXk"
        - **Text** `Text G` (bTuYH) — text: "{∅}"
        - **Text** `Text H` (bTuYI) — text: "Total Faturado: ⏎{Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}"; sort Created Date desc, ignore empty):cpo.ValorTotal:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
        - **Text** `Text I` (bTuYJ) — text: "Total comissão: ⏎{Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}"; sort Created Date desc, ignore empty):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
        - **Text** `Text ZZZZZZZZZ` (bTuYN) — text: "Total Vencidos: ⏎R$ {Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}" AND cpo.DataVencimento gte UrlParam("datainicio" as date) AND cpo.DataVencimento lte UrlParam("datafim" as date) AND cpo.StatusFinanceiro equals Opt.StatusFinanceiro.A receber; ignore empty):cpo.valorcomissao:sum:format_number(formatting_type="number", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
          - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → is_visible=False
- **CustomElement** `pop.CadastroClienteFornecedor A` (bTufJ) — USA Reusable pop.CadastroCliFor · props: custom_id="bTgrH"
- **Popup** `pop edita produtos do pedido` (bTufK) — props: group_type="custom.tbl_pedidos", vertical_centering=True
  - **Group** `Group JZZZZZ` (bTuiD) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Text** `Text CZZZZZZZZ` (bTuiE) — text: "Edita Produtos" · props: font_alignment="center"
    - **Icon** `Icon HZZ` (bTuiF) — props: icon="material outlined close", vertical_centering=True
  - **Button** `Button BZ` (bTuiJ) — text: "Novo Produto" · props: vertical_centering=True
  - **Table** `rpg fornecedoresprodutos` (bTufL) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
    - **TableMainAxis** `TableMainAxis VZ` (bTufP) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis VZ` (bTufQ) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis VZ` (bTufR) — props: axis_index=4
    - **TableCrossAxis** `TableCrossAxis U` (bTufV) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell Z` (bTufW) — props: cell_main_axis_id="bTufP"
        - **Text** `Text FZZZZ` (bTufX) — text: "Produto"
      - **TableCell** `Cell Z` (bTufb) — props: cell_main_axis_id="bTufQ"
        - **Text** `Text GZZZZ` (bTufc) — text: "Qtd"
      - **TableCell** `Cell Z` (bTufd) — props: cell_main_axis_id="bTufR"
        - **Text** `Text HZZZZ` (bTufh) — text: "Valor Comiss"
      - **TableCell** `Cell Z` (bTufi) — props: cell_main_axis_id="bTuhl"
        - **Text** `Text OZZZZ` (bTufj) — text: "Tipo Frete"
      - **TableCell** `Cell Z` (bTufn) — props: cell_main_axis_id="bTuhm"
        - **Text** `Text NZZZZZZZ` (bTufo) — text: "Valor Frete"
      - **TableCell** `Cell Z` (bTufp) — props: cell_main_axis_id="bTuhn"
        - **Text** `Text QZZZZZZZ` (bTuft) — text: "Aliq. ICMS" · props: font_alignment="center"
        - **Text** `Text XZZZZZZZ` (bTufu) — text: "Aliq. PISCOFINS" · props: font_alignment="center"
        - **Text** `Text YZZZZZZZ` (bTufv) — text: "Total Tributos" · props: font_alignment="center"
      - **TableCell** `Cell Z` (bTufz) — props: cell_main_axis_id="bTuhr"
        - **Text** `Text OZZZZZZZ` (bTugA) — text: "Total Bruto"
      - **TableCell** `Cell Z` (bTugB) — props: cell_main_axis_id="bTuhs"
        - **Text** `Text AZZZZZZZZ` (bTugF) — text: "Comiss Bruto"
      - **TableCell** `Cell OZZZZ` (bTugL) — props: cell_main_axis_id="bTuhx"
      - **TableCell** `Cell WZZZZ` (bTugM) — props: cell_main_axis_id="bTuhy"
      - **TableCell** `Cell Z` (bTugN) — props: cell_main_axis_id="bTuhz"
        - **Text** `Text ZZZZZZZZ` (bTugR) — text: "Total Liq"
      - **TableCell** `Cell HZZZ` (bTugG) — props: cell_main_axis_id="bTuht"
        - **Text** `Text BZZZZZZZZ` (bTugH) — text: "Valor Unit"
    - **TableCrossAxis** `TableCrossAxis U` (bTugS) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell Z` (bTugT) — props: cell_main_axis_id="bTufP"
        - **Group** `Group SZZZZZZ` (bTugY) — props: vertical_centering=True
          - **Text** `Text DZZZZ` (bTugZ) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
          - **Text** `Text DZZZZ` (bTugd) — text: "{Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Condicao:display}"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:is_empty → text="{∅}Falta regime tributário"
          - **Text** `Text WZZZZZZZZ` (bTuge) — oculto ao carregar · text: "Esse produto possui entrega(s) lançadas e não pode ser editado"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=True
        - **Icon** `Icon M` (bTugX) — props: icon="material outlined calculate", vertical_centering=True, title_attribute="recalcula valores do pedido"
      - **TableCell** `Cell Z` (bTugf) — props: cell_main_axis_id="bTufQ"
        - **Input** `ip valorvenda` (bTugj) — placeholder: "000" · auto_binding: True · content_format: "int_number" · props: font_alignment="center", word_spacing=-0.5, unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_qtdvenda_number"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTugk) — props: cell_main_axis_id="bTufR"
        - **Input** `ip valorcomissao` (bTugl) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTugp) — props: cell_main_axis_id="bTuhl"
        - **Dropdown** `dd tipofrete` (bTugq) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, default=Opt.TipoFrete.FOB, font_alignment="center", word_spacing=-0.5, bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTugr) — props: cell_main_axis_id="bTuhm"
        - **Input** `ip valorfrete` (bTugv) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando El[dd tipofrete]:get_data:not_equals(Opt.TipoFrete.CIF Informado) → content=0, bgcolor="var(--color_bTHGh_default)", disabled=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTugw) — props: cell_main_axis_id="bTuhn"
        - **Group** `Group IZZZZZ` (bTuhC) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
          - **Input** `ip icms` (bTuhH) — placeholder: "ICMS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
            - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → content=Search(Tbl.IcmsEstados):filtered(constraints={0={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoDestino:cpo.UF:equals(InjectedValue:cpo.Destino:display), constraint_type=∅}, 1={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoOrigem:cpo.UF:equals(InjectedValue:cpo.Origem:display), constraint_type=∅}}):first_element:cpo.AliquotaIcms
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
          - **Icon** `Icon BZZZ` (bTuhD) — props: icon="material outlined search"
        - **Input** `ip piscofins` (bTuhB) — placeholder: "PIS/COFINS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=True, border_roundness_left=0
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
        - **Input** `ipt calculotributo` (bTugx) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS:plus(Ancestor[TableCrossAxis]:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell Z` (bTuhI) — props: cell_main_axis_id="bTuhr"
        - **Input** `ip totalbruto` (bTuhJ) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell Z` (bTuhN) — props: cell_main_axis_id="bTuhs"
        - **Input** `ip totalcomissao` (bTuhO) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell PZZZZ` (bTuhU) — props: cell_main_axis_id="bTuhx"
        - **Icon** `Icon IZZ` (bTuhV) — props: icon="material outlined delete", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=False
        - **Group** `Group HZZZZZZ` (bTuhZ) — oculto ao carregar · props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=True
          - **Image** `ico proposta` (bTuha) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1736191361739x755453739650058900/entrega%20concluida.svg"
      - **TableCell** `Cell QZZZZ` (bTuhb) — props: cell_main_axis_id="bTuhy"
        - **Icon** `Icon JZZ` (bTuhf) — props: icon="material outlined edit", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}Esse produto possui entrega(s) lançadas e não pode ser editado"
      - **TableCell** `Cell Z` (bTuhg) — props: cell_main_axis_id="bTuhz"
        - **Input** `ip totalliquido` (bTuhh) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell IZZZ` (bTuhP) — props: cell_main_axis_id="bTuht"
        - **Input** `ip valorvenda` (bTuhT) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
    - **TableMainAxis** `TableMainAxis VZ` (bTuhl) — props: axis_index=5
    - **TableMainAxis** `TableMainAxis VZ` (bTuhm) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis VZ` (bTuhn) — props: axis_index=7
    - **TableMainAxis** `TableMainAxis VZ` (bTuhr) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis VZ` (bTuhs) — props: axis_index=10
    - **TableMainAxis** `TableMainAxis QZZ` (bTuhx) — props: axis_index=11
    - **TableMainAxis** `TableMainAxis UZZ` (bTuhy) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis VZ` (bTuhz) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis ZZ` (bTuht) — props: axis_index=3
- **CustomElement** `pop.AddEdita Produtos A` (bTuiK) — USA Reusable pop.AddEdita Produtos · props: custom_id="bTiZh"
- **CustomElement** `pop.CadastroProdutos A` (bTufF) — USA Reusable pop.CadastroProdutos · props: custom_id="bTgZS"
- **CustomElement** `tool.Historico A` (bTufD) — USA Reusable tool.Historico · oculto ao carregar · props: custom_id="bTdrv", floating_reference_horizontal_resp="right"
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_false → is_visible=False
- **CustomElement** `tool.DashMenu A` (bTufE) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **Popup** `pop confirma entrega` (bTubn) — props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Group** `Group YZZZZ` (bTudR) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Text** `Text IZZZZZZZ` (bTudS) — text: "Confirma entrega"
    - **Text** `Text YZZZZZZ` (bTudT) — text: "Nota Núm: {Parent:cpo.NumNfFornecedor}" · props: font_alignment="right"
  - **Group** `Group ZZZZZ` (bTudX) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Text** `Text UZZZZZZZ` (bTuez) — text: "Dados da Entrega"
    - **Group** `gp qual grupo clifor` (bTudY) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **PictureInput** `upi novocliente logo` (bTudZ) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
        - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `Group VZZZ` (bTudd) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - **Text** `Text JZZZZZZZ` (bTude) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
        - **Text** `Text JZZZZZZZ` (bTudf) — text: "[b]Cotação número[/b] {Parent:cpo.QualCotacao:cpo.CotacaoNum}  - [b]Proposta número[/b] {Parent:cpo.QualProposta:cpo.PropostaNum}"
        - **Text** `Text ZZZZZZZ` (bTudj) — text: "[b]Condição negociada[/b]: {Parent:cpo.QualPedido:cpo.PrazoRecebComissoes:display}"
        - **Text** `Text LZZZZZZZZZ` (bTudk) — text: "[b]Forma pagto[/b]: {Parent:cpo.QualPedido:cpo.FormaPagto:display}"
    - **Table** `rpg entregas do produto` (bTudl) — data_source: Parent:convert_to_list · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
      - **TableMainAxis** `TableMainAxis G` (bTudp) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis G` (bTudq) — props: axis_index=2
      - **TableMainAxis** `TableMainAxis G` (bTudr) — props: axis_index=3
      - **TableCrossAxis** `TableCrossAxis S` (bTudv) — props: axis_index=0
        - **TableCell** `Cell L` (bTudw) — props: cell_main_axis_id="bTudp"
          - **Text** `Text TZZZ` (bTudx) — text: "Dt prev. entrega" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTueB) — props: cell_main_axis_id="bTudq"
          - **Text** `Text TZZZ` (bTueC) — text: "Qtd entrega" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTueD) — props: cell_main_axis_id="bTudr"
          - **Text** `Text TZZZ` (bTueH) — text: "Comissão " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTueI) — props: cell_main_axis_id="bTuet"
          - **Text** `Text TZZZ` (bTueJ) — text: "Valor bruto " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTueN) — props: cell_main_axis_id="bTuex"
          - **Text** `Text TZZZ` (bTueO) — text: "Valor líq " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTueP) — props: cell_main_axis_id="bTuey"
          - **Text** `Text TZZZ` (bTueT) — text: "Núm NF " · props: font_alignment="center"
      - **TableCrossAxis** `TableCrossAxis S` (bTueU) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell L` (bTueV) — props: cell_main_axis_id="bTudp"
          - **Text** `Text VZZZ` (bTueZ) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTuea) — props: cell_main_axis_id="bTudq"
          - **Text** `Text JZZZZ` (bTueb) — text: "{Ancestor[TableCrossAxis]:cpo.QtdEntrega}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTuef) — props: cell_main_axis_id="bTudr"
          - **Text** `Text TZZZ` (bTueg) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTueh) — props: cell_main_axis_id="bTuet"
          - **Text** `Text TZZZ` (bTuel) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTuem) — props: cell_main_axis_id="bTuex"
          - **Text** `Text TZZZ` (bTuen) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTuer) — props: cell_main_axis_id="bTuey"
          - **Text** `Text TZZZ` (bTues) — text: "{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: font_alignment="center"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
      - **TableMainAxis** `TableMainAxis G` (bTuet) — props: axis_index=4
      - **TableMainAxis** `TableMainAxis G` (bTuex) — props: axis_index=5
      - **TableMainAxis** `TableMainAxis G` (bTuey) — props: axis_index=6
  - **Group** `Group XZZZZ` (bTucu) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `g DateTimePicker` (bTucv) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text HZZZZZZZ` (bTucz) — text: "Data de entrega"
      - **DateInput** `dt dataentrega realizada` (bTudA) — placeholder: "dd/mm/yy" · content: Page.Current Date/Time · props: mandatory=True, overwrite_placeholder=True
    - **Group** `g FileUploader` (bTudB) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text HZZZZZZZ` (bTudG) — text: "Comprovante entrega"
      - **FileInput** `upf comprovanteentrega realizada` (bTudF) — placeholder: "Máx 5mb" · props: font_alignment="left", src="{Parent:cpo.ComprovanteEntrega}", max_size=5
        - ⟂ quando This:get_loading_status:is_true → placeholder="Aguarde, carregando..."
    - **Group** `g FileUploader copy` (bTudH) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text E` (bTudM) — text: "Qtd parcelas"
      - **select2-MultiDropdown** `dd qtd parcelas receber` (bTudL) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · props: default=Parent:cpo.QualPedido:cpo.PrazoRecebComissoes, tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", tag_font_color="var(--color_primary_default)", limit_selection=4, tag_border_color="var(--color_primary_default)", tag_delete_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
    - **Icon** `Icon X` (bTudN) — props: icon="material outlined event", title_attribute="Adicionar parcelas"
      - ⟂ quando El[dd qtd parcelas receber]:get_data:count:less_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
  - **Table** `Table A` (bTucD) — data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **TableMainAxis** `TableMainAxis A` (bTucE) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis A` (bTucF) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis A` (bTucJ) — props: axis_index=0
      - **TableCell** `Cell A` (bTucK) — props: cell_main_axis_id="bTucE"
        - **Text** `Text F` (bTucL) — text: "Vencimento"
      - **TableCell** `Cell A` (bTucP) — props: cell_main_axis_id="bTucF"
        - **Text** `Text RZZZ` (bTucQ) — text: "Valor"
      - **TableCell** `Cell A` (bTucR) — props: cell_main_axis_id="bTucp"
      - **TableCell** `Cell B` (bTucV) — props: cell_main_axis_id="bTuct"
        - **Text** `Text SZZZ` (bTucW) — text: "Prazo"
    - **TableCrossAxis** `TableCrossAxis A` (bTucX) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bTucb) — props: cell_main_axis_id="bTucE"
        - **DateInput** `Date/TimePicker F` (bTucc) — auto_binding: True · props: vertical_centering=True, bind_field="cpo_datavencimento_date"
      - **TableCell** `Cell A` (bTucd) — props: cell_main_axis_id="bTucF"
        - **Input** `Input JZ` (bTuch) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: vertical_centering=True, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
      - **TableCell** `Cell A` (bTuci) — props: cell_main_axis_id="bTucp"
        - **Icon** `Icon W` (bTucj) — props: icon="material outlined delete_forever", vertical_centering=True
      - **TableCell** `Cell K` (bTucn) — props: cell_main_axis_id="bTuct"
        - **Dropdown** `dd prazo a vencer` (bTuco) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, bind_field="cpo_qualprazo_option_opt_parcelasreceber", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **TableMainAxis** `TableMainAxis A` (bTucp) — props: axis_index=3
    - **TableMainAxis** `TableMainAxis F` (bTuct) — props: axis_index=0
  - **Group** `gp retira pedido listagem copy` (bTubx) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Icon** `Icon ZZZ` (bTubz) — props: icon="material outlined info"
    - **Text** `Text KZZZZZZZ` (bTuby) — text: "Ao confirmar a entrega, esse cartão será movido para FINANCEIRO e as contas a receber serão criadas. ⏎Confira os dados os dados com atenção"
  - **Group** `Group WZZZ` (bTubr) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Button** `btn confirmaentrega` (bTubs) — text: "Gravar" · props: button_disabled=True
      - ⟂ quando Parent:cpo.QuaisContasReceber:count:greater_or_equal_than(1):and_(El[dt dataentrega realizada]:get_data:is_not_empty):and_(El[dd qtd parcelas receber]:get_data:count:greater_or_equal_than(1)) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
    - **Button** `btn cencela confirmaentrega` (bTubt) — text: "Cancela"
- **CustomElement** `reus cabecalho A` (bTuap) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `pop.AgendaContatos A` (bTuiz) — USA Reusable pop.AgendaContatos · props: custom_id="bTPQa0"
- **Popup** `pop cancelar entrega e pedido` (bTual) — props: vertical_centering=True
  - estado customizado `var_qualpedido_` : Tbl.Pedido
  - estado customizado `var_qualentrega_` : Tbl.Entregas
  - estado customizado `var_a__ocancelamento_` : Opt.Ações
  - **Icon** `Icon T` (bTuZW) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group TZZZZ` (bTuZX) — data_source: El[pop cancelar entrega e pedido]:custom.var_qualpedido_ · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Group** `Group OZZZZ` (bTuZb) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - **Group** `Group QZ` (bTuZc) — props: vertical_centering=True
        - **Icon** `Icon RZZ` (bTuZd) — props: icon="material outlined warning"
        - **Text** `Text TZZ` (bTuZh) — text: "ATENÇÃO!" · props: font_alignment="center"
      - **Text** `Text UZZZ` (bTuZi) — text: "Você está cancelando um pedido/entrega.⏎Para prosseguir preencha o motivo do cancelamento." · props: font_alignment="center"
      - **Input** `Input EZ` (bTuZj) — placeholder: "Motivo cancelamento" · content: "{∅}" · props: mandatory=True, vertical_centering=True
      - **Group** `Group NZZZZ` (bTuZn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Group** `Group LZZZZ` (bTuZo) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `chk informa cancelamento cliente` (bTuZp) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text M` (bTuZt) — text: "Envia e-mail informando [color=#000000]cliente.[/color]"
        - **Group** `Group MZZZZ` (bTuZu) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `chk informa cancelamento fornecedor` (bTuZv) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text N` (bTuZz) — text: "Envia e-mail informando fornecedor"
      - **Button** `Button L` (bTuaA) — text: "Cancela Pedido/Entrega"
    - **Group** `Group RZZZZ` (bTuaB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_false → is_visible=False
      - **Group** `gp email cliente` (bTuaF) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text U` (bTuaM) — text: "Email do Cliente:"
        - **Group** `Group PZZZZ` (bTuaG) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento cliente` (bTuaH) — data_source: Parent:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailCliente, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon GZ` (bTuaL) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email cliente` (bTuaN) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTuaS) — text: "Corpo do e-mail do cliente:"
        - **MultiLineInput** `ipt corpo cancelamento cliente` (bTuaR) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido) → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido [/b] {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega) → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
    - **Group** `Group SZZZZ` (bTuaT) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_false → is_visible=False
      - **Group** `gp email fornecedor` (bTuaX) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text U` (bTuae) — text: "Email do fornecedor:"
        - **Group** `Group PZZZZ` (bTuaY) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento fornecedor` (bTuaZ) — data_source: Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailFornecedor, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon HZ` (bTuad) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email fornecedor` (bTuaf) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTuak) — text: "Corpo do e-mail do fornecedor:"
        - **MultiLineInput** `ipt corpo cancelamento fornecedor` (bTuaj) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido) → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido[/b]  {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega) → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
- **Popup** `pop consulta icms` (bTuar) — props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
  - **Group** `Group IZ` (bTubh) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
    - **Dropdown** `dd Origem` (bTubl) — data_source: All(Opt.UFs):sorted(descending=False, sort_field="display") · placeholder: "Origem" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **Dropdown** `dd Destino` (bTubm) — data_source: All(Opt.UFs):sorted(descending=False, sort_field="display") · placeholder: "Destino" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Table** `Table H` (bTuav) — data_source: Search(Tbl.IcmsEstados: cpo.Origem equals El[dd Origem]:get_data AND cpo.Destino equals El[dd Destino]:get_data; ignore empty) · props: group_type="custom.tbl_icmsestados", vertical_centering=True
    - **TableMainAxis** `TableMainAxis K` (bTuaw) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis K` (bTuax) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis K` (bTubB) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis H` (bTubC) — props: axis_index=0
      - **TableCell** `Cell Q` (bTubD) — props: cell_main_axis_id="bTuaw"
        - **Text** `Text Y` (bTubH) — text: "Origem"
      - **TableCell** `Cell Q` (bTubI) — props: cell_main_axis_id="bTuax"
        - **Text** `Text AZ` (bTubJ) — text: "Destino"
      - **TableCell** `Cell Q` (bTubN) — props: cell_main_axis_id="bTubB"
        - **Text** `Text IZ` (bTubO) — text: "Alíquota"
    - **TableCrossAxis** `TableCrossAxis H` (bTubP) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell Q` (bTubT) — props: cell_main_axis_id="bTuaw"
        - **Text** `Text WZZZ` (bTubV) — text: "{Ancestor[TableCrossAxis]:cpo.Origem:display}" · props: font_alignment="center"
        - **Text** `Text KZ` (bTubU) — text: "{∅}"
      - **TableCell** `Cell Q` (bTubZ) — props: cell_main_axis_id="bTuax"
        - **Text** `Text XZZZ` (bTuba) — text: "{Ancestor[TableCrossAxis]:cpo.Destino:display}" · props: font_alignment="center"
      - **TableCell** `Cell Q` (bTubb) — props: cell_main_axis_id="bTubB"
        - **Input** `Input KZ` (bTubg) — placeholder: "" · auto_binding: True · content_format: "percentage" · props: mandatory=True, vertical_centering=True, bind_field="cpo_aliquotaicms_number", decimal_place=2
        - **Icon** `Icon IZ` (bTubf) — props: icon="material outlined content_copy"
- **CustomElement** `pop.AgendaEnderecos A` (bTuaq) — USA Reusable pop.AgendaEnderecos · props: custom_id="bTPJL"
- **Popup** `pop add fornecedor` (bTtph) — props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
  - estado customizado `var_distanciamaiormenor_` : boolean
  - estado customizado `varfornecedoresselecionados_` : list.custom.tbl_enderecosclifor (lista)
  - **Icon** `btn fecar add fornecedores` (bTtoy) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group N` (bTtoz) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
    - **Group** `Group M` (bTtpD) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Group** `Group G` (bTtpE) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Image** `Image B` (bTtpF) — props: src="{El[ipt buscacliente]:get_data:cpo.Foto}"
          - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Text** `Text Q` (bTtpJ) — text: "{El[ipt buscacliente]:get_data:cpo.NomeCliFor:to_capitalized_words}"
      - **Group** `Group C` (bTtpK) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Text** `Text R` (bTtpL) — text: "{Parent:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
        - **Text** `Text T` (bTtpP) — text: "{Parent:cpo.Condicao:display} - {Parent:cpo.Linha:display} - {Parent:cpo.Medida}" · props: vertical_centering=True
    - **Group** `Group HZZZZZ` (bTtpQ) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Group** `Group AZZZZ` (bTtpR) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Text** `Text MZZZZZZZ` (bTtpV) — text: "Endereço de entrega:"
        - **Group** `Group BZZZZ` (bTtpW) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
          - **Dropdown** `dd end destino` (bTtpb) — data_source: Parent:cpo.QualCliente:cpo.QuaisEnderecos · placeholder: "Selecione endereço" · props: default=Parent:cpo.QualEnderecoDestino, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Complemento:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words} - {InjectedValue:cpo.QualUfOpt:display}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon HZZZ` (bTtpc) — props: icon="material outlined gps_fixed", button_disabled=True
            - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty → icon_color="var(--color_primary_default)", button_disabled=False
          - **Icon** `Icon JZ` (bTtpX) — props: icon="material outlined contact_mail"
      - **Button** `btn novofornecedor` (bTtpd) — text: "Novo Fornecedor" · props: icon="material filled factory", icon_size=20, button_type="label_icon"
  - **Table** `rpg cotacao fornecedores` (bTtmQ) — data_source: Search(Tbl.EnderecosCliFor: cpo.Municipio equals "{El[dd filtercidade fornecedores]:get_data}" AND cpo.TipoClifor equals opt.TipoCliFor.Fornecedor AND cpo.QualUfOpt equals El[dd filterUF fornecedores]:get_data AND cpo.QualGrupoCliFor equals El[dd filternome fornecedores]:get_data AND cpo.Ativo equals True AND cpo.NomeEndereco text contains "{El[dd filterID fornecedores]:get_data}"; ignore empty):minus_list(Parent:cpo.QuaisOrcamentosForncededores:cpo.QualEnderecoOrigem) · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, unique_id="rpgaddfornecedores"
    - **TableMainAxis** `TableMainAxis J` (bTtmR) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis J` (bTtmV) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis J` (bTtmW) — props: axis_index=5
    - **TableCrossAxis** `TableCrossAxis D` (bTtmX) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell P` (bTtmb) — props: cell_main_axis_id="bTtmR"
        - **Group** `gp filternome fornecedores` (bTtmc) — props: vertical_centering=True
          - **AutocompleteDropdown** `dd filternome fornecedores` (bTtmd) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Nome Fornecedor" · props: vertical_centering=True, field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGm_default)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon CZZ` (bTtmh) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filternome fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell P` (bTtmi) — props: cell_main_axis_id="bTtmV"
        - **Group** `gp filtercidade fornecedores` (bTtmj) — props: vertical_centering=True
          - **Dropdown** `dd filtercidade fornecedores` (bTtmn) — data_source: El[rpg cotacao fornecedores]:get_list_data:cpo.Municipio:unique:sorted(descending=False) · placeholder: "Cidade" · props: vertical_centering=True, dynamic_type="text", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:to_uppercase}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon S` (bTtmo) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtercidade fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell P` (bTtmp) — props: cell_main_axis_id="bTtmW"
        - **Text** `Text X` (bTtmt) — text: "Endereço"
      - **TableCell** `Cell U` (bTtmu) — props: cell_main_axis_id="bTtog"
      - **TableCell** `Cell S` (bTtmv) — props: cell_main_axis_id="bTtoh"
      - **TableCell** `Cell W` (bTtmz) — props: cell_main_axis_id="bTtol"
        - **Text** `Text Z` (bTtnA) — text: "Última cotação / Valor Unit" · props: font_alignment="center"
      - **TableCell** `Cell UZZZZ` (bTtnB) — props: cell_main_axis_id="bTtom"
        - **Group** `gp filterUF fornecedores` (bTtnF) — props: vertical_centering=True
          - **Dropdown** `dd filterUF fornecedores` (bTtnG) — data_source: All(Opt.UFs) · placeholder: "UF" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:display}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon DZZ` (bTtnH) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filterUF fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell ZZZZZ` (bTtnY) — props: cell_main_axis_id="bTtot"
        - **Text** `Text MZZZZZZZZZ` (bTtnZ) — text: "Regime tributário" · props: font_alignment="center"
      - **TableCell** `Cell M` (bTtnL) — props: cell_main_axis_id="bTton"
        - **Text** `sort distance` (bTtnM) — text: "Distancia para entrega  [fa]chevron-up[/fa]"
          - ⟂ quando El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_false → text="Distancia para entrega  [fa]chevron-down[/fa]"
      - **TableCell** `Cell O` (bTtnN) — props: cell_main_axis_id="bTtor"
        - **Group** `gp filterID fornecedores` (bTtnR) — props: vertical_centering=True
          - **Input** `dd filterID fornecedores` (bTtnS) — placeholder: "Identificador Endereço" · props: vertical_centering=True, placeholder_color="var(--color_bTHGm_default)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon FZ` (bTtnT) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filterID fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell XZZZZ` (bTtnX) — props: cell_main_axis_id="bTtos"
    - **TableCrossAxis** `TableCrossAxis D` (bTtnd) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell P` (bTtne) — props: cell_main_axis_id="bTtmR"
        - **Image** `Image H` (bTtnj) — props: src="{Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Foto}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Text** `Text BZ` (bTtnf) — text: "{Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.NomeCliFor:to_capitalized_words}"
      - **TableCell** `Cell P` (bTtnk) — props: cell_main_axis_id="bTtmV"
        - **Text** `Text CZ` (bTtnl) — text: "{Ancestor[TableCrossAxis]:cpo.Municipio:to_capitalized_words}"
      - **TableCell** `Cell P` (bTtnp) — props: cell_main_axis_id="bTtmW"
        - **Text** `Text DZ` (bTtnq) — text: "{Ancestor[TableCrossAxis]:cpo.Endereco:to_capitalized_words}" · props: unique_id="kmdistancia"
      - **TableCell** `Cell T` (bTtnr) — props: cell_main_axis_id="bTtog"
        - **Icon** `Icon AZZ` (bTtnv) — props: icon="material outlined contact_mail"
        - **Icon** `Icon BZZ` (bTtnw) — props: icon="material outlined my_location"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **TableCell** `Cell V` (bTtnx) — props: cell_main_axis_id="bTtoh"
        - **Icon** `Icon IZZZ` (bTtoB) — props: icon="material outlined check_box_outline_blank"
          - ⟂ quando El[pop add fornecedor]:custom.varfornecedoresselecionados_:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
      - **TableCell** `Cell Y` (bTtoC) — props: cell_main_axis_id="bTtol"
        - **Text** `Text JZ` (bTtoD) — text: "{Search(Tbl.OrcFornecedoresCotacao: cpo.QualCotacaoProduto equals El[pop add fornecedor]:get_group_data AND cpo.QualFornecedor equals Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor):last_element:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
      - **TableCell** `Cell VZZZZ` (bTtoH) — props: cell_main_axis_id="bTtom"
        - **Text** `Text RZZZZZZZ` (bTtoI) — text: "{Ancestor[TableCrossAxis]:cpo.UF:to_uppercase}" · props: font_alignment="center"
      - **TableCell** `Cell AZZZZZ` (bTtob) — props: cell_main_axis_id="bTtot"
        - **Text** `Text NZZZZZZZZZ` (bTtof) — text: "{Ancestor[TableCrossAxis]:cpo.QualRegimeTributario:display}"
      - **TableCell** `Cell N` (bTtoJ) — props: cell_main_axis_id="bTton"
        - **Group** `Group LZZZZZZ` (bTtoO) — props: vertical_centering=True
          - **Text** `Text WZZZZZZZ` (bTtoP) — text: "{Ancestor[TableCrossAxis]:cpo.Localizacaoo:distance_from(unit="kms", origin_address=El[dd end destino]:get_data:cpo.Localizacaoo):format_number(formatting_type="percentage", decimal_place=1)}" · props: unique_id="distancia"
            - ⟂ quando El[dd end destino]:get_data:is_empty:or_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="{∅}0", is_visible=True
          - **Text** `Text WZZZZZZZ` (bTtoT) — text: " km do cliente" · props: unique_id="kmdistancia"
        - **Text** `Text AZZZZZZZZZ` (bTtoN) — text: "km"
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_not_empty) → text="(cliente sem localização)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="(fornecedor sem localição)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="(cliente e fornecedor sem localização)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_not_empty) → is_visible=False
      - **TableCell** `Cell X` (bTtoU) — props: cell_main_axis_id="bTtor"
        - **Text** `Text CZZZZ` (bTtoV) — text: "{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
      - **TableCell** `Cell YZZZZ` (bTtoZ) — props: cell_main_axis_id="bTtos"
        - **Text** `Text ZZZZZZ` (bTtoa) — text: "Ativo: {Ancestor[TableCrossAxis]:cpo.Ativo}"
    - **TableMainAxis** `TableMainAxis L` (bTtog) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis M` (bTtoh) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis N` (bTtol) — props: axis_index=7
    - **TableMainAxis** `TableMainAxis TZZ` (bTtom) — props: axis_index=3
    - **TableMainAxis** `Column I` (bTtot) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis H` (bTton) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis UZ` (bTtor) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis VZZ` (bTtos) — props: axis_index=10
  - **Button** `Button E` (bTtox) — text: "Adicionar Fornecedores" · props: vertical_centering=True
- **Popup** `pop add edita propostas` (bTtzR) — props: group_type="custom.tbl_orcamento", vertical_centering=True
  - estado customizado `var_acaocotacao_` : Opt.Ações
  - estado customizado `var_exibeproposta_` : Tbl.Propostas
  - estado customizado `var_enviamailproposta_` : boolean
  - **Group** `gp modelo proposta` (bTtzM) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Group** `gp exibe proposta` (bTtwA) — oculto ao carregar · data_source: El[gp add edita proposta]:get_group_data · props: group_type="custom.tbl_propostas", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → data_source=El[pop add edita propostas]:custom.var_exibeproposta_, is_visible=True
      - **Group** `gp alerta exibe proposta` (bTtvt) — props: vertical_centering=True
        - **Icon** `Icon PZZ` (bTtvu) — props: icon="material filled sd_card_alert"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_true → icon="report"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_false → icon="sim_card_alert.outline"
        - **Text** `Text EZZZZZ` (bTtvv) — text: "Alerta sobre a proposta exibida"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_true → text="A proposta selecionada já foi enviada e não permite edição.⏎Caso precise alterar valores edite a cotação e crie uma nova proposta."
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_false → text="A proposta selecionada [b]NÃO [/b]foi enviada e [b]AINDA [/b]permite edição de informações.⏎Caso precise alterar valores edite a cotação antes de enviar essa proposta."
        - **Button** `btn proposta editacotacao` (bTtvz) — text: "editar cotação" · props: icon="feather edit", vertical_centering=True, icon_size=12, button_type="label_icon"
          - ⟂ quando This:is_pressed → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGx_default)"
          - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
      - **Group** `gp corpo exibe proposta` (bTtvp) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - **Group** `Group IZZ` (bTtst) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Image** `Image J` (bTtsu) — props: src="{Parent:cpo.QualCotacao:cpo.EmpresaMegabox:logo_horizontal}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group IZZ` (bTtsv) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text DZZZZZ` (bTtsz) — text: "[b]Consultor[/b]: {Parent:Created By:cpo.NomeModelo:to_capitalized_words}"
            - **Text** `Text DZZZZZ` (bTttA) — text: "[b]Email[/b]: {Parent:Created By:cpo.EmailContato}"
              - ⟂ quando Parent:cpo.QualCotacao:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email:[/b] {Parent:cpo.QualCotacao:cpo.EmpresaMegabox:email}"
            - **Text** `Text DZZZZZ` (bTttB) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group IZZ` (bTttF) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group IZZ` (bTttG) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text DZZZZZ` (bTttH) — text: "Proposta núm: {Parent:cpo.QualCotacao:cpo.CotacaoNum}/"
            - **Input** `ipt proposta numero` (bTttL) — placeholder: "" · content: Parent:cpo.PropostaNum · content_format: "int_number" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
          - **Text** `Text DZZZZZ` (bTttM) — text: "{Parent:Created Date:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Group** `Group IZZ` (bTttN) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group NZZZZZ` (bTttR) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTtte) — placeholder: "" · props: src="{Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.Foto}", private=False, disabled=True
              - ⟂ quando Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `Group MZZZZZ` (bTttS) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text DZZZZZ` (bTttT) — text: "[b]Cliente[/b]: {Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.NomeCliFor}"
              - **Text** `Text DZZZZZ` (bTttX) — text: "[b]A/C:[/b] {Parent:cpo.EnviarPara:cpo.NomeContato}"
              - **Text** `Text DZZZZZ` (bTttY) — text: "[b]CNPJ:[/b] {Parent:cpo.FaturarPara:cpo.CnpjCpf}"
              - **Text** `Text DZZZZZ` (bTttZ) — text: "[b]Telefone:[/b] {Parent:cpo.EnviarPara:cpo.Telefone}"
              - **Text** `Text DZZZZZ` (bTttd) — text: "[b]Cidade:[/b] {Parent:cpo.FaturarPara:cpo.Municipio:to_capitalized_words}/{Parent:cpo.FaturarPara:cpo.UF:to_uppercase}"
          - **Text** `Text DZZZZZ` (bTttf) — text: "- Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será possivel considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do enquadramento tributário de sua empresa.⏎- Se positivo, o VALOR LIQUIDO poderá ser considerado para fins de comparação com outras cotações, pois sua empresa se CREDITA desses impostos.[ul][li]Empresa de Lucro Real: Pode creditar de ICMS, PIS/COFINS e IPI[/li]⏎[li]Empresa de Lucro Presumido: Pode se creditar apenas do ICMS[/li]⏎[li]Empresa do Simples Nacional: Não pode se creditar desses impostos[/li]⏎[/ul]⏎-Em caso de dúvidas procure seu departamento fiscal/contábil⏎"
        - **Group** `Group IZZ` (bTttj) — props: vertical_centering=True
          - **Text** `Text DZZZZZ` (bTttk) — text: "Itens da proposta:"
        - **Table** `rpg itens orcamento` (bTttl) — data_source: Parent:cpo.QuaisOrcamentosFornecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
          - **TableMainAxis** `TableMainAxis CZZ` (bTttr) — props: axis_index=5
          - **TableCrossAxis** `TableCrossAxis M` (bTttv) — props: axis_index=0
            - **TableCell** `Cell UZZZ` (bTtuD) — props: cell_main_axis_id="bTttr"
              - **Text** `Text L` (bTtuH) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtuI) — props: cell_main_axis_id="bTtvP"
              - **Text** `Text DZZZZZ` (bTtuJ) — text: "Qtd" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtuN) — props: cell_main_axis_id="bTtvQ"
              - **Text** `Text DZZZZZ` (bTtuO) — text: "Descrição"
            - **TableCell** `Cell UZZZ` (bTtuP) — props: cell_main_axis_id="bTtvR"
              - **Text** `Text J` (bTtuT) — text: "PREÇO UNITÁRIO⏎Líquido de Impostos⏎(PIS/COFINS/IPI)" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtuU) — props: cell_main_axis_id="bTtvV"
              - **Text** `Text K` (bTtuV) — text: "Alíquota⏎ICMS" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtuZ) — props: cell_main_axis_id="bTtvW"
              - **Text** `Text DZZZZZ` (bTtua) — text: "PREÇO UNITÁRIO BRUTO⏎(Impostos Incluso)⏎" · props: font_alignment="center"
            - **TableCell** `Cell C` (bTttw) — props: cell_main_axis_id="bTttp"
              - **Text** `Text HZZ` (bTttx) — text: "VALOR TOTAL BRUTO⏎{El[rpg itens orcamento]:get_list_data:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell MZZZZ` (bTtuB) — props: cell_main_axis_id="bTttq"
              - **Text** `Text GZZZZZZZZ` (bTtuC) — text: "Frete" · props: font_alignment="center"
          - **TableCrossAxis** `TableCrossAxis M` (bTtub) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell UZZZ` (bTtun) — props: cell_main_axis_id="bTttr"
              - **Text** `Text DZZZZZ` (bTtur) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtus) — props: cell_main_axis_id="bTtvP"
              - **Text** `Text DZZZZZ` (bTtut) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtux) — props: cell_main_axis_id="bTtvQ"
              - **Text** `Text DZZZZZ` (bTtuy) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
              - **Text** `Text DZZZZZ` (bTtuz) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}"
            - **TableCell** `Cell UZZZ` (bTtvD) — props: cell_main_axis_id="bTtvR"
              - **Text** `Text DZZZZZ` (bTtvE) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtvF) — props: cell_main_axis_id="bTtvV"
              - **Text** `Text DZZZZZ` (bTtvJ) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTtvK) — props: cell_main_axis_id="bTtvW"
              - **Text** `Text DZZZZZ` (bTtvL) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell D` (bTtuf) — props: cell_main_axis_id="bTttp"
              - **Text** `Text ZZZ` (bTtug) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell NZZZZ` (bTtuh) — props: cell_main_axis_id="bTttq"
              - **Text** `Text HZZZZZZZZ` (bTtum) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}⏎" · props: font_alignment="center"
              - **Text** `Text IZZZZZZZZ` (bTtul) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis CZZ` (bTtvP) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis CZZ` (bTtvQ) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis CZZ` (bTtvR) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis CZZ` (bTtvV) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis CZZ` (bTtvW) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis B` (bTttp) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis PZZ` (bTttq) — props: axis_index=3
        - **Group** `Group IZZ` (bTtvX) — props: vertical_centering=True
          - **Text** `Text DZZZZZ` (bTtvb) — text: "Condições da proposta:"
        - **Group** `Group IZZ` (bTtvc) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Text** `Text DZZZZZ` (bTtvd) — text: "[b]Validade[/b]: {Parent:cpo.QualCotacao:cpo.DataValidade:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTtvj) — text: "[b]Condições de pagamento:[/b] {Parent:cpo.CondicaoPgto}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTtvn) — text: "[b]Destinos:[/b] {Parent:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualEnderecoDestino:cpo.Municipio:to_uppercase} - {InjectedValue:cpo.QualEnderecoDestino:cpo.UF:to_uppercase}", delimiter=" ")}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTtvo) — text: "[b]Data prevista entrega:[/b] {Parent:cpo.DtPrevEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yyyy")}" · props: vertical_centering=False
          - **Text** `Text JZZZZZZZZZ` (bTtvi) — text: "[b]Informações adicionais:[/b] {El[ipt infoadicional]:get_data}" · props: vertical_centering=False
          - **Text** `Text AZZZZZZ` (bTtvh) — text: "⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
    - **Group** `gp nova proposta` (bTtzL) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → is_visible=False
      - **Group** `gp alerta nova proposta` (bTtzB) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
        - **Icon** `Icon QZZ` (bTtzF) — props: icon="material outlined info"
        - **Text** `Text ZZZZ` (bTtzG) — text: "Os valores da proposta abaixo exibem a [b]situação atual da cotação[/b][b].[/b]⏎Se os valores exibidos estão incorretos [b]edite a cotação[/b] antes de criar uma nova proposta."
        - **Button** `btn proposta editacotacao` (bTtzH) — text: "editar cotação" · props: icon="feather edit", vertical_centering=True, icon_size=12, button_type="label_icon"
          - ⟂ quando This:is_pressed → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGx_default)"
          - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
      - **Group** `gp corpo novaproposta` (bTtzA) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True, unique_id="novaproposta"
        - **Group** `Group R` (bTtwB) — props: vertical_centering=True
          - **Image** `Image D` (bTtwF) — props: src="{El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:logoimagem:imgix_treatment(fm="png")}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group S` (bTtwG) — props: vertical_centering=True
            - **Text** `Text CZZ` (bTtwH) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
            - **Text** `Text FZZ` (bTtwL) — text: "[b]Email[/b]: {CurrentUser:cpo.EmailContato:to_lowercase}"
              - ⟂ quando El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email:[/b] {El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:email}"
            - **Text** `Text GZZ` (bTtwM) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group T` (bTtwN) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Group** `Group FZZ` (bTtwR) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Text** `Text IZZ` (bTtwS) — text: "Proposta núm: {Parent:cpo.CotacaoNum}/"
            - **Input** `ipt proposta numero` (bTtwT) — placeholder: "" · content: El[pop add edita propostas]:get_group_data:cpo.QuaisPropostas:count:plus(1) · content_format: "int_number" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
              - ⟂ quando This:is_hovered → 
              - ⟂ quando This:is_focused → 
              - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Text** `Text OZZ` (bTtwX) — text: "{Page.Current Date/Time:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Group** `Group U` (bTtwY) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Group** `Group PZZZZZ` (bTtwZ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTtwp) — placeholder: "" · props: src="{Parent:cpo.QualCliente:cpo.Foto:imgix_treatment(fm="png")}", private=False, disabled=True
              - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `Group OZZZZZ` (bTtwd) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
              - **Text** `Text JZZ` (bTtwe) — text: "[b]Cliente[/b]: {Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text KZZ` (bTtwf) — text: "[b]A/C:[/b] {El[dd email para]:get_data:cpo.NomeContato:to_capitalized_words}"
              - **Text** `Text MZZ` (bTtwj) — text: "[b]CNPJ:[/b] {El[dd faturar para]:get_data:cpo.CnpjCpf}"
              - **Text** `Text PZZ` (bTtwk) — text: "[b]Telefone:[/b] {El[dd email para]:get_data:cpo.Telefone}"
              - **Text** `Text QZZ` (bTtwl) — text: "[b]Cidade:[/b] {El[dd faturar para]:get_data:cpo.Municipio:to_uppercase}/{El[dd faturar para]:get_data:cpo.UF:to_uppercase}"
            - **Text** `Text RZZ` (bTtwq) — text: "- Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será possivel considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do enquadramento tributário de sua empresa.⏎- Se positivo, o VALOR LIQUIDO poderá ser considerado para fins de comparação com outras cotações, pois sua empresa se CREDITA desses impostos.[ul][li]Empresa de Lucro Real: Pode creditar de ICMS, PIS/COFINS e IPI[/li]⏎[li]Empresa de Lucro Presumido: Pode se creditar apenas do ICMS[/li]⏎[li]Empresa do Simples Nacional: Não pode se creditar desses impostos[/li]⏎[/ul]⏎-Em caso de dúvidas procure seu departamento fiscal/contábil⏎"
        - **Group** `Group X` (bTtwr) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text SZZ` (bTtwv) — text: "Itens da proposta:"
        - **Table** `rpg itens orcamento` (bTtww) — data_source: Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}) · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
          - **TableMainAxis** `TableMainAxis NZ` (bTtxC) — props: axis_index=5
          - **TableCrossAxis** `TableCrossAxis G` (bTtxD) — props: axis_index=0
            - **TableCell** `Cell UZZ` (bTtxO) — props: cell_main_axis_id="bTtxC"
              - **Text** `Text YZZ` (bTtxP) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center"
            - **TableCell** `Cell VZZ` (bTtxT) — props: cell_main_axis_id="bTtyX"
              - **Text** `Text UZZ` (bTtxU) — text: "Qtd" · props: font_alignment="center"
            - **TableCell** `Cell BZZZ` (bTtxV) — props: cell_main_axis_id="bTtyb"
              - **Text** `Text VZZ` (bTtxZ) — text: "Descrição"
            - **TableCell** `Cell ZZZ` (bTtxa) — props: cell_main_axis_id="bTtyc"
              - **Text** `Text FZZZ` (bTtxb) — text: "PREÇO UNITÁRIO⏎(Líquido de Impostos)" · props: font_alignment="center"
            - **TableCell** `Cell DZZZ` (bTtxf) — props: cell_main_axis_id="bTtyd"
              - **Text** `Text XZZ` (bTtxg) — text: "Alíquota⏎ICMS" · props: font_alignment="center"
            - **TableCell** `Cell EZZZ` (bTtxh) — props: cell_main_axis_id="bTtyh"
              - **Text** `Text IZZZ` (bTtxl) — text: "PREÇO UNITÁRIO BRUTO⏎(Impostos Incluso)⏎" · props: font_alignment="center"
            - **TableCell** `Cell E` (bTtxH) — props: cell_main_axis_id="bTtwx"
              - **Text** `Text BZZZ` (bTtxI) — text: "VALOR TOTAL BRUTO⏎{El[rpg itens orcamento]:get_list_data:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell OZZZ` (bTtxJ) — props: cell_main_axis_id="bTtxB"
              - **Text** `Text DZZZZZZZZ` (bTtxN) — text: "Frete" · props: font_alignment="center"
          - **TableCrossAxis** `TableCrossAxis G` (bTtxm) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell UZZ` (bTtxy) — props: cell_main_axis_id="bTtxC"
              - **Text** `Text HZZZ` (bTtxz) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell YZZ` (bTtyD) — props: cell_main_axis_id="bTtyX"
              - **Text** `Text DZZZ` (bTtyE) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
            - **TableCell** `Cell AZZZ` (bTtyF) — props: cell_main_axis_id="bTtyb"
              - **Text** `Text EZZZ` (bTtyJ) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
              - **Text** `Text PZZZ` (bTtyK) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}"
            - **TableCell** `Cell CZZZ` (bTtyL) — props: cell_main_axis_id="bTtyc"
              - **Text** `Text WZZ` (bTtyP) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell FZZZ` (bTtyQ) — props: cell_main_axis_id="bTtyd"
              - **Text** `Text GZZZ` (bTtyR) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell GZZZ` (bTtyV) — props: cell_main_axis_id="bTtyh"
              - **Text** `Text AZZZ` (bTtyW) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:divide(Ancestor[TableCrossAxis]:cpo.QtdVenda):format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell H` (bTtxn) — props: cell_main_axis_id="bTtwx"
              - **Text** `Text CZZZ` (bTtxr) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell PZZZ` (bTtxs) — props: cell_main_axis_id="bTtxB"
              - **Text** `Text EZZZZZZZZ` (bTtxx) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}⏎" · props: font_alignment="center"
              - **Text** `Text FZZZZZZZZ` (bTtxt) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis PZ` (bTtyX) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis QZ` (bTtyb) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis RZ` (bTtyc) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis SZ` (bTtyd) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis TZ` (bTtyh) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis C` (bTtwx) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis OZZ` (bTtxB) — props: axis_index=3
        - **Group** `Group Y` (bTtyi) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text LZZZ` (bTtyj) — text: "Condições da proposta:"
        - **Group** `Group Z` (bTtyn) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text MZZZ` (bTtyo) — text: "[b]Validade[/b]: {Parent:cpo.DataValidade:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTtyu) — text: "[b]Condições de pagamento:[/b] {El[ipt condicao pagto]:get_data}" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTtyv) — text: "[b]Destinos:[/b] {Parent:cpo.QuaisProdutos:format_as_text(content="{InjectedValue:cpo.QualEnderecoDestino:cpo.Municipio:to_uppercase} - {InjectedValue:cpo.QualEnderecoDestino:cpo.UF:to_uppercase}", delimiter=" ")}⏎" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTtyz) — text: "[b]Data prevista entrega:[/b] {El[dt prevista entrega]:get_data:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text BZZZZ` (bTtyp) — text: "[b]Informações adicionais:[/b] {El[ipt infoadicional]:get_data}" · props: vertical_centering=False
          - **Text** `Text KZZZZZZZZZ` (bTtyt) — text: "⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
  - **Group** `gp historico propostas` (bTtsp) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Text** `Text IZZZZ` (bTtso) — text: "Propostas do Cliente" · props: font_alignment="center"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta) → text="Nova proposta do cliente"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → text="Edita proposta do cliente"
    - **Group** `gp qual grupo clifor` (bTtsX) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente · props: group_type="custom.tbl_clientes"
      - **PictureInput** `upi novocliente logo` (bTtsb) — placeholder: "" · props: src="{Parent:cpo.Foto}", private=False, disabled=True
        - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `Group HZZ` (bTtsc) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Text** `Text BZZZZZ` (bTtsd) — text: "{Parent:cpo.NomeCliFor:to_uppercase}"
        - **Text** `Text CZZZZZ` (bTtsh) — text: "Cotação número {El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}"
    - **Button** `Button M` (bTtsi) — text: "Nova Proposta" · props: vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=False
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → bgcolor="var(--color_bTHGl_default)", button_disabled=True
    - **Group** `gp add edita proposta` (bTtpi) — props: group_type="custom.tbl_propostas"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:is_empty:or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta)) → is_visible=False
      - **Group** `Group WZZZZZ` (bTtqG) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - **Group** `Group GZ` (bTtqp) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group V` (bTtqq) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text LZZ` (bTtqx) — text: "Email do cliente:"
            - **Group** `Group FZ` (bTtqr) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Dropdown** `dd email para` (bTtqw) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.EnviarPara, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color="var(--color_bTHGs_default)"
              - **Icon** `Icon KZ` (bTtqv) — props: icon="material outlined contact_mail"
          - **Group** `Group GZZ` (bTtrB) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text AZZZZZ` (bTtrH) — text: "Emails cópia:"
            - **Group** `Group GZZ` (bTtrC) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Input** `ipt emails copia` (bTtrD) — placeholder: "Emails separados por ;" · content: "{Parent:cpo.EmailsCopia}" · props: mandatory=False
          - **Group** `Group CZ` (bTtrI) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text QZZZ` (bTtrN) — text: "Corpo do e-mail "
            - **MultiLineInput** `ipt corpoemail` (bTtrJ) — placeholder: "" · content: "{Parent:cpo.CorpoEmail}" · props: unique_id="remodela"
              - ⟂ quando Parent:cpo.CorpoEmail:is_empty → content="Olá {El[dd email para]:get_data:cpo.NomeContato:to_capitalized_words}⏎⏎Em resposta à sua solicitação de orçamento para [b]{El[pop add edita propostas]:get_group_data:cpo.QuaisProdutos:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}, [/b] temos o prazer de apresentar nossa proposta.⏎⏎Agradecemos seu interesse em nossos produtos/serviços.⏎⏎Acreditamos que nossa proposta atende às suas necessidades e expectativas. ⏎⏎Estamos à disposição para esclarecer quaisquer dúvidas e fornecer mais informações.⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
        - **Group** `Group EZZZZZ` (bTtqH) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group W` (bTtqL) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text NZZ` (bTtqS) — text: "Faturar para:"
            - **Group** `Group HZ` (bTtqM) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Dropdown** `dd faturar para` (bTtqR) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.QuaisEnderecos · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.FaturarPara, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} - {InjectedValue:cpo.Fantasia:to_lowercase:to_capitalized_words} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.CnpjCpf}"
                - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color="var(--color_bTHGs_default)"
              - **Icon** `Icon LZ` (bTtqN) — props: icon="material outlined contact_mail"
          - **Group** `Group VZZZZZ` (bTtqZ) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Group** `Group AZ` (bTtqd) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text NZZZ` (bTtqf) — text: "Condição de pgto:"
              - **Input** `ipt condicao pagto` (bTtqe) — placeholder: "00 dd" · content: "{Parent:cpo.CondicaoPgto}"
                - ⟂ quando Parent:cpo.CondicaoPgto:is_empty → content="{∅}Mediante analise do financeiro"
            - **Group** `Group BZ` (bTtqj) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text OZZZ` (bTtql) — text: "Dt prevista entrega:"
              - **DateInput** `dt prevista entrega` (bTtqk) — placeholder: "dd/mm/aa" · content: Parent:cpo.DtPrevEntrega · props: overwrite_placeholder=True
          - **Group** `Group DZZZZZ` (bTtqT) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text V` (bTtqY) — text: "Informações adicionais:"
            - **MultiLineInput** `ipt infoadicional` (bTtqX) — placeholder: "" · content: "{Parent:cpo.InfoAdicional}" · props: unique_id="remodela"
      - **Group** `Group AZZ` (bTtqA) — oculto ao carregar · props: vertical_centering=True
        - ⟂ quando El[btn proposta salvar]:is_hovered:or_(El[btn proposta salvarenviar]:is_hovered):or_(El[btn proposta gravar]:is_hovered):or_(El[btn proposta gravarenviar]:is_hovered) → is_visible=True
        - **Icon** `Icon MZZ` (bTtqB) — props: icon="material outlined info"
        - **Text** `Text VZZZZ` (bTtqF) — text: ""
          - ⟂ quando El[btn proposta gravar]:is_hovered:or_(El[btn proposta salvar]:is_hovered) → text=""Gravar" significa que a proposta [b]não será enviada[/b] nesse momento. Os dados [b]acima[/b] podem ser alteradas até o momento que a proposta for enviada."
          - ⟂ quando El[btn proposta gravarenviar]:is_hovered:or_(El[btn proposta salvarenviar]:is_hovered) → text=""Gravar e Enviar" significa que a proposta [b]será enviada[/b] nesse momento. Após enviada a proposta não pode ser alterada. Se houver necessidade será necessário criar uma nova proposta."
      - **Group** `Group DZ` (bTtpj) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta) → is_visible=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → is_visible=False
        - **Button** `btn proposta gravar` (bTtpn) — text: "Gravar" · props: vertical_centering=True
        - **Button** `btn proposta gravarenviar` (bTtpo) — text: "Gravar e Enviar" · props: vertical_centering=True
        - **Button** `btn proposta cancelagravar` (bTtpp) — text: "Cancela"
      - **Group** `Group LZ` (bTtpt) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → is_visible=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:not_equals(Opt.Ações.Edita Proposta) → is_visible=False
        - **Button** `btn proposta salvar` (bTtpu) — text: "Salvar"
        - **Button** `btn proposta salvarenviar` (bTtpv) — text: "Salvar e Enviar"
        - **Button** `btn proposta cancelasalvar` (bTtpz) — text: "Cancela"
    - **Table** `Table I` (bTtrO) — data_source: Parent:cpo.QuaisPropostas:sorted(descending=True, sort_field="Created Date") · props: group_type="custom.tbl_propostas", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:is_empty:or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta)) → is_visible=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=False
      - **TableMainAxis** `TableMainAxis O` (bTtrP) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis I` (bTtrT) — props: axis_index=0
        - **TableCell** `Cell R` (bTtrU) — props: cell_main_axis_id="bTtrP"
          - **Text** `Text AZZZZ` (bTtrV) — text: "Fornecedor"
        - **TableCell** `Cell JZZZ` (bTtrZ) — props: cell_main_axis_id="bTtsQ"
        - **TableCell** `Cell SZZZ` (bTtra) — props: cell_main_axis_id="bTtsR"
          - **Text** `Text ZZZZZ` (bTtrb) — text: "Núm"
        - **TableCell** `Cell VZZZ` (bTtrf) — props: cell_main_axis_id="bTtsV"
        - **TableCell** `Cell XZZZ` (bTtrg) — props: cell_main_axis_id="bTtsW"
          - **Text** `Text GZZZZZ` (bTtrh) — text: "Produtos"
      - **TableCrossAxis** `TableCrossAxis I` (bTtrl) — props: axis_index=1, cross_axis_repeat=True
        - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_primary_default_rgb), 0.08)"
        - **TableCell** `Cell R` (bTtrm) — props: cell_main_axis_id="bTtrP"
          - **Text** `Text EZZZZ` (bTtrn) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}", delimiter="⏎")}"
        - **TableCell** `Cell KZZZ` (bTtrr) — props: cell_main_axis_id="bTtsQ"
          - **Icon** `Icon MZ` (bTtrs) — props: icon="material outlined edit", title_attribute="editar proposta (somente se não foi enviada) "
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Icon** `Icon NZ` (bTtrx) — props: icon="material outlined attach_file", title_attribute="visualizar proposta enviada"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.AquivoProposta:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Icon** `Icon OZ` (bTtrt) — props: icon="material outlined send", title_attribute="Proposta enviada? {Ancestor[TableCrossAxis]:cpo.PropostaEnviada}"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → is_visible=False
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_false → is_visible=True
          - **Group** `Group D` (bTtrz) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_propostas", vertical_centering=True
            - ⟂ quando This:is_hovered → boxshadow_style="outset", boxshadow_blur=2
            - **Image** `btn reenviar proposta` (bTtsD) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1729685584587x372935738891563500/resend.svg", title_attribute="reenviar proposta"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_false → is_visible=False
          - **Icon** `Icon O` (bTtry) — oculto ao carregar · props: icon="material outlined shopping_cart_checkout", title_attribute="transformar proposta em pedido"
            - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]):and_(Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true) → is_visible=True
        - **TableCell** `Cell TZZZ` (bTtsE) — props: cell_main_axis_id="bTtsR"
          - **Text** `Text YZZZZ` (bTtsF) — text: "{Ancestor[TableCrossAxis]:cpo.PropostaNum}"
        - **TableCell** `Cell WZZZ` (bTtsJ) — props: cell_main_axis_id="bTtsV"
          - **Icon** `seleciona proposta` (bTtsK) — props: icon="material outlined radio_button_unchecked"
            - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]) → icon="material outlined radio_button_checked"
        - **TableCell** `Cell YZZZ` (bTtsL) — props: cell_main_axis_id="bTtsW"
          - **Text** `Text FZZZZZ` (bTtsP) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - {InjectedValue:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}", delimiter="⏎")}"
      - **TableMainAxis** `TableMainAxis WZ` (bTtsQ) — props: axis_index=7
      - **TableMainAxis** `TableMainAxis BZZ` (bTtsR) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis DZZ` (bTtsV) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis EZZ` (bTtsW) — props: axis_index=3
    - **Group** `gp proposta a anexar` (bTtsj) — props: group_type="custom.tbl_propostas", vertical_centering=True
      - **Plugin[1648430145817x673906689668022300]/AAc** `PDF/IMG PROPOSTA` (bTtsn)
  - **Icon** `Icon OZZ` (bTtzN) — props: icon="material outlined close"
- **Popup** `pop add edita cotacao` (bTuId) — props: group_type="custom.tbl_orcamento"
  - **Group** `Group B` (bTuIN) — data_source: Parent · props: group_type="custom.tbl_orcamento"
    - **Group** `Group CZZ` (bTuHF) — data_source: Parent · props: group_type="custom.tbl_orcamento"
      - **Group** `Group L` (bTuHJ) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text WZ` (bTuHQ) — text: "Nova Cotação" · props: vertical_centering=False
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → text="Nova Cotação"
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → text="Edita Cotação"
        - **Group** `g Input` (bTuHK) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTuHL) — text: "Cotação núm." · props: font_alignment="center"
          - **Input** `ip num orcamento` (bTuHP) — placeholder: "" · content: Parent:cpo.CotacaoNum · content_format: "int_number" · props: font_alignment="center", disabled=True
            - ⟂ quando Parent:is_empty → content=Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1)
      - **Group** `Group K` (bTuHR) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Image** `Image A` (bTuHd) — props: src="{El[ipt buscacliente]:get_data:cpo.Foto}", editor_preview_image="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1730482424502x336125780431834300/landscape-placeholder%5B1%5D.svg"
          - ⟂ quando El[ipt buscacliente]:get_data:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - ⟂ quando El[ipt buscacliente]:get_data:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Group** `g Input` (bTuHV) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTuHc) — text: "Cliente"
          - **Group** `gp add novo cliente` (bTuHW) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **AutocompleteDropdown** `ipt buscacliente` (bTuHX) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Buscar cliente" · props: mandatory=True, default=Parent:cpo.QualCliente, unique_id="upper", ac_list_max=25, field_to_search="cpo_nomecliente_text", border_style_top="none", allow_not_in_list=True, border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
              - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
              - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)"
              - ⟂ quando Parent:is_not_empty → disabled=True
              - ⟂ quando El[pop.AgendaEnderecos A]:custom.var_recemcadastrado_:is_not_empty → default=El[pop.AgendaEnderecos A]:custom.var_recemcadastrado_
            - **Icon** `Icon V` (bTuHb) — props: icon="material filled person_add"
              - ⟂ quando Parent:is_not_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
        - **Group** `Group FZZZZ` (bTuHh) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text SZZZZZZZ` (bTuHi) — text: "Endereço de entrega:" · props: vertical_centering=True
          - **Group** `Group FZZZZ` (bTuHj) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Dropdown** `dd enderecoentregacliente` (bTuHn) — data_source: Search(Tbl.EnderecosCliFor: cpo.QualGrupoCliFor equals El[ipt buscacliente]:get_data) · placeholder: "Selecione o destino" · props: mandatory=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words}/{InjectedValue:cpo.UF:to_uppercase}"
              - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
              - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
            - **Icon** `Icon PZ` (bTuHo) — props: icon="material outlined contact_mail"
              - ⟂ quando El[ipt buscacliente]:get_data:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **Group** `Group J` (bTuHp) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Image** `Image G` (bTuIG) — props: src="", button_disabled=True
          - ⟂ quando El[rd empresa megabox]:get_data:equals(Opt.EmpresaMegabox.Megabox) → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1714500060178x676720324417465700/favicon%20megabox.png?_gl=1*z46kre*_gcl_au*OTk0Nzk3NzI0LjE3MTM3OTAwNTM.*_ga*NjI4NzMxNjM2LjE3MDYwMTA5MDU.*_ga_BFPVR2DEE2*MTcxNzE1NTcxNC44MC4xLjE3MTcxOTEzNDguNjAuMC4w"
          - ⟂ quando El[rd empresa megabox]:get_data:equals(Opt.EmpresaMegabox.Paletes Brasil) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1717206119850x663794755204967700/aaa%20WhatsApp%20Image%202024-05-31%20at%2018.58.20.png"
        - **RadioButtons** `rd empresa megabox` (bTuIF) — data_source: All(Opt.EmpresaMegabox) · props: mandatory=True, default=Parent:cpo.EmpresaMegabox, unique_id="rdempresas", dynamic_type="option.opt_empresamegabox", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Parent:is_empty → default=Opt.EmpresaMegabox.Megabox
        - **Group** `g Input` (bTuIH) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTuIL) — text: "Data cotação"
          - **Input** `ip data orcamento` (bTuIM) — placeholder: "" · content: "{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: disabled=True
            - ⟂ quando Parent:is_empty → content="{Page.Current Date/Time:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
        - **Group** `g DateTimePicker` (bTuHt) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTuHu) — text: "Data Validade"
          - **DateInput** `ip data validade` (bTuHv) — content: Parent:cpo.DataValidade · props: mandatory=True, border_style_left="none", four_border_style=True, border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando Parent:is_empty → content=Page.Current Date/Time:plus_days(2)
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_style_bottom="solid"
        - **Group** `g Input` (bTuHz) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTuIA) — text: "Vendedor"
          - **Input** `ip vendedor` (bTuIB) — placeholder: "" · content: "{Parent:Created By:cpo.NomeModelo:to_capitalized_words}" · props: disabled=True
            - ⟂ quando Parent:is_empty → content="{CurrentUser:cpo.NomeModelo:to_capitalized_words}"
    - **Group** `gp add produto` (bTuGC) — props: group_type="custom.tbl_orcamentoprodutos"
      - **Group** `Group E` (bTuGy) — props: group_type="custom.tbl_orcamento"
        - **Text** `Text WZZZZ` (bTuGz) — text: "Novo Produto" · props: vertical_centering=False
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__oor_amento_:equals(Opt.Ações.Novo Produto) → text="Adicionar produto ao carrinho"
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__oor_amento_:equals(Opt.Ações.Edita Produto) → text="Edita produto do carrinho"
        - **Group** `Group FZZZZZ` (bTuHD) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - ⟂ quando This:is_hovered → boxshadow_blur=2
          - **Image** `abre cadastro produtos` (bTuHE) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733341112464x836081496925408500/pallet-solid%20blue.svg", title_attribute="Cadastro de produtos"
      - **Group** `Group DZZ` (bTuGD) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
        - **Group** `g Dropdown` (bTuGH) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTuGI) — text: "Tipo Produto"
          - **Dropdown** `dd add grupo produto` (bTuGJ) — data_source: Search(Tbl.ProdutosGrupo; sort cpo.NomeGrupo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProdutoGrupo, dynamic_type="custom.tbl_produtossubgrupo", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeGrupo:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Dropdown` (bTuGN) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTuGO) — text: "Produto"
          - **Dropdown** `dd add modelo produto` (bTuGP) — data_source: Search(Tbl.ProdutosModelo: cpo.QualGrupoProduto equals El[dd add grupo produto]:get_data AND cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProduto, dynamic_type="custom.tbl_produtos", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Icon** `edita produto` (bTuGT) — props: icon="material outlined edit", vertical_centering=True, title_attribute="Editar produto"
      - **Group** `Group EZZ` (bTuGU) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
        - **Group** `g Dropdown` (bTuGV) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTuGa) — text: "Condição"
          - **Dropdown** `dd add condicao` (bTuGZ) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisCondicoes · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.Condicao, dynamic_type="option.opt_produtoscondicao", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Dropdown` (bTuGb) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTuGf) — text: "Linha"
          - **Dropdown** `dd add linha` (bTuGg) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisLinhas · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.Linha, dynamic_type="option.opt_produtoslinhas", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
            - ⟂ quando El[dd add condicao]:get_data:equals(Opt.ProdutosCondicao.Usado) → default=Opt.ProdutosLinhas.Usado
        - **Group** `g Input` (bTuGh) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTuGl) — text: "Qtd"
          - **Input** `ip add qtd` (bTuGm) — placeholder: "000" · content: Parent:cpo.qtd · content_format: "int_number" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Input` (bTuGn) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTuGr) — text: "Medida, descrição ou obs."
          - **Input** `ip add medida` (bTuGs) — placeholder: "00 x 00" · content: "{Parent:cpo.Medida}" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Icon** `add produto` (bTuGx) — props: icon="fa fa-cart-arrow-down"
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__oor_amento_:equals(Opt.Ações.Novo Produto) → is_visible=True
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__oor_amento_:not_equals(Opt.Ações.Novo Produto) → is_visible=False
        - **Icon** `salvar produto` (bTuGt) — props: icon="material outlined save"
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__oor_amento_:equals(Opt.Ações.Edita Produto) → is_visible=True
          - ⟂ quando El[Página vendas_bkp]:custom.var_a__oor_amento_:not_equals(Opt.Ações.Edita Produto) → is_visible=False
  - **Table** `rpg produto orcamento` (bTuGB) — data_source: CurrentUser:cpo.TempOrcamentoProdutos · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=4, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=10
    - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → data_source=Parent:cpo.QuaisProdutos:merged_with(CurrentUser:cpo.TempOrcamentoProdutos)
    - **TableCrossAxis** `TableCrossAxis B` (bTuDl) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell F` (bTuDT) — props: cell_main_axis_id="bTuDm"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Table** `tbl nome produto` (bTuBR) — props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis HZ` (bTuBV) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis F` (bTuBW) — props: axis_index=0
            - **TableCell** `Cell JZZ` (bTuBX) — props: cell_main_axis_id="bTuBV"
              - **Image** `Image I` (bTuBb) — props: src="{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.QualTipoProduto:cpo.Icon}"
              - **Group** `Group F` (bTuBc) — props: vertical_centering=True
                - **Text** `Text P` (bTuBd) — text: "{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                - **Text** `Text UZ` (bTuBh) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}" · props: vertical_centering=True
              - **Text** `indica fornecedores` (bTuBi) — text: "{El[rpg fornecedoresprodutos]:get_list_data:count}" · props: font_alignment="center", title_attribute="Qtd de fornecedores dessa cotação"
              - **Icon** `indica vencedor` (bTuBj) — props: icon="fa fa-trophy", title_attribute="Vencedor dessa cotação: {Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.QualFornecedor:cpo.NomeCliFor:to_capitalized_words}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:greater_or_equal_than(1) → is_visible=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:less_than(1) → is_visible=False
            - **TableCell** `Cell JZZ` (bTuBn) — props: cell_main_axis_id="bTuCx"
              - **Input** `ip totalbruto` (bTuBo) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
            - **TableCell** `Cell JZZ` (bTuBp) — props: cell_main_axis_id="bTuDB"
              - **Icon** `btn remove orcamentoproduto` (bTuBt) — props: icon="material outlined delete_forever"
            - **TableCell** `Cell JZZ` (bTuBu) — props: cell_main_axis_id="bTuDC"
              - **Input** `ip totalcomissao` (bTuBv) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
            - **TableCell** `Cell JZZ` (bTuBz) — props: cell_main_axis_id="bTuDD"
              - **Icon** `Icon B` (bTuCA) — props: icon="fa fa-chevron-down"
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → icon="fa fa-chevron-up"
            - **TableCell** `Cell JZZ` (bTuCB) — props: cell_main_axis_id="bTuDH"
              - **Input** `ip totalliquido` (bTuCF) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
            - **TableCell** `Cell KZZ` (bTuCG) — props: cell_main_axis_id="bTuDI"
              - **Input** `ip totalbruto copy 4` (bTuCH) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaUnit · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
            - **TableCell** `Cell MZZ` (bTuCL) — props: cell_main_axis_id="bTuDJ"
              - **Input** `ip totalbruto copy 3` (bTuCM) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.valorcomissao · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
            - **TableCell** `Cell OZZ` (bTuCN) — props: cell_main_axis_id="bTuDN"
              - **Input** `ip totalbruto copy 5` (bTuCR) — placeholder: "" · content: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.TipoFrete:display}" · props: font_alignment="center", disabled=True, placeholder_color="var(--color_bTHGl_default)"
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
            - **TableCell** `Cell QZZ` (bTuCS) — props: cell_main_axis_id="bTuDO"
              - **Input** `ip totalbruto copy 2` (bTuCT) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorFrete · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
            - **TableCell** `Cell SZZ` (bTuCX) — props: cell_main_axis_id="bTuDP"
              - **Input** `ip totalbruto copy` (bTuCY) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorPISCOFINS · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedoresprodutos]:is_visible → is_visible=False
          - **TableCrossAxis** `TableCrossAxis F` (bTuCZ) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell JZZ` (bTuCd) — props: cell_main_axis_id="bTuBV"
            - **TableCell** `Cell JZZ` (bTuCe) — props: cell_main_axis_id="bTuCx"
            - **TableCell** `Cell JZZ` (bTuCf) — props: cell_main_axis_id="bTuDB"
            - **TableCell** `Cell JZZ` (bTuCj) — props: cell_main_axis_id="bTuDC"
            - **TableCell** `Cell JZZ` (bTuCk) — props: cell_main_axis_id="bTuDD"
            - **TableCell** `Cell JZZ` (bTuCl) — props: cell_main_axis_id="bTuDH"
            - **TableCell** `Cell LZZ` (bTuCp) — props: cell_main_axis_id="bTuDI"
            - **TableCell** `Cell NZZ` (bTuCq) — props: cell_main_axis_id="bTuDJ"
            - **TableCell** `Cell PZZ` (bTuCr) — props: cell_main_axis_id="bTuDN"
            - **TableCell** `Cell RZZ` (bTuCv) — props: cell_main_axis_id="bTuDO"
            - **TableCell** `Cell TZZ` (bTuCw) — props: cell_main_axis_id="bTuDP"
          - **TableMainAxis** `TableMainAxis HZ` (bTuCx) — props: axis_index=8
          - **TableMainAxis** `TableMainAxis HZ` (bTuDB) — props: axis_index=11
          - **TableMainAxis** `TableMainAxis HZ` (bTuDC) — props: axis_index=10
          - **TableMainAxis** `TableMainAxis HZ` (bTuDD) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis HZ` (bTuDH) — props: axis_index=9
          - **TableMainAxis** `TableMainAxis IZ` (bTuDI) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis JZ` (bTuDJ) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis KZ` (bTuDN) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis LZ` (bTuDO) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis MZ` (bTuDP) — props: axis_index=7
        - **Table** `rpg fornecedoresprodutos` (bTtzS) — oculto ao carregar · data_source: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_color="rgba(var(--color_surface_default_rgb), 0)", vertical_separator_width=4, horizontal_separator_color="var(--color_surface_default)", horizontal_separator_width=2
          - ⟂ quando El[Página vendas_bkp]:custom.var_todosfornecedores_:is_true → is_visible=True
          - **TableMainAxis** `TableMainAxis I` (bTtzT) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis I` (bTtzX) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis I` (bTtzY) — props: axis_index=3
          - **TableCrossAxis** `TableCrossAxis C` (bTtzZ) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell J` (bTtzd) — props: cell_main_axis_id="bTtzT"
            - **TableCell** `Cell J` (bTtze) — props: cell_main_axis_id="bTtzX"
            - **TableCell** `Cell J` (bTtzf) — props: cell_main_axis_id="bTtzY"
            - **TableCell** `Cell CZ` (bTtzj) — props: cell_main_axis_id="bTuBD"
            - **TableCell** `Cell EZ` (bTtzk) — props: cell_main_axis_id="bTuBE"
            - **TableCell** `Cell GZ` (bTtzl) — props: cell_main_axis_id="bTuBF"
            - **TableCell** `Cell IZ` (bTtzp) — props: cell_main_axis_id="bTuBJ"
            - **TableCell** `Cell KZ` (bTtzq) — props: cell_main_axis_id="bTuBK"
            - **TableCell** `Cell MZ` (bTtzr) — props: cell_main_axis_id="bTuBL"
            - **TableCell** `Cell DZZ` (bTtzv) — props: cell_main_axis_id="bTuBP"
            - **TableCell** `Cell HZZ` (bTtzw) — props: cell_main_axis_id="bTuBQ"
          - **TableCrossAxis** `TableCrossAxis C` (bTtzx) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell J` (bTuAB) — props: cell_main_axis_id="bTtzT"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Text** `Text S` (bTuAC) — text: "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.UF:to_uppercase}"
              - **Text** `Text RZ` (bTuAD) — text: "{Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:display:to_capitalized_words}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:is_empty → text="{∅}Falta regime tributário"
            - **TableCell** `Cell J` (bTuAH) — props: cell_main_axis_id="bTtzX"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorvenda` (bTuAI) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", always_show_decimals=True
            - **TableCell** `Cell J` (bTuAJ) — props: cell_main_axis_id="bTtzY"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorcomissao` (bTuAN) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
            - **TableCell** `Cell DZ` (bTuAO) — props: cell_main_axis_id="bTuBD"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Dropdown** `dd tipofrete` (bTuAP) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, font_alignment="center", bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
            - **TableCell** `Cell FZ` (bTuAT) — props: cell_main_axis_id="bTuBE"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorfrete` (bTuAU) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
                - ⟂ quando El[dd tipofrete]:get_data:not_equals(Opt.TipoFrete.CIF Informado) → content=0, bgcolor="var(--color_bTHGh_default)", disabled=True
            - **TableCell** `Cell HZ` (bTuAV) — props: cell_main_axis_id="bTuBF"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Group** `Group JZ` (bTuAb) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Input** `ip icms` (bTuAg) — placeholder: "ICMS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
                  - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → content=Search(Tbl.IcmsEstados):filtered(constraints={0={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoDestino:cpo.UF:equals(InjectedValue:cpo.Destino:display), constraint_type=∅}, 1={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoOrigem:cpo.UF:equals(InjectedValue:cpo.Origem:display), constraint_type=∅}}):first_element:cpo.AliquotaIcms
                - **Icon** `Icon TZZ` (bTuAf) — props: icon="material outlined search"
              - **Input** `ip piscofins` (bTuAa) — placeholder: "PIS/COFINS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=True, border_roundness_left=0
              - **Input** `ipt calculotributo` (bTuAZ) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS:plus(Ancestor[TableCrossAxis]:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell JZ` (bTuAh) — props: cell_main_axis_id="bTuBJ"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalbruto` (bTuAl) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell LZ` (bTuAm) — props: cell_main_axis_id="bTuBK"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Icon** `btn remove orcamento fornecedor` (bTuAn) — props: icon="material outlined delete"
            - **TableCell** `Cell NZ` (bTuAr) — props: cell_main_axis_id="bTuBL"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalcomissao` (bTuAs) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell EZZ` (bTuAt) — props: cell_main_axis_id="bTuBP"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Icon** `Icon P` (bTuAx) — props: icon="bootstrap trophy"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → icon="bootstrap trophy-fill", icon_color="var(--color_bTHHX_default)"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:less_than(0.01) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.valorcomissao:less_than(0.01) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
            - **TableCell** `Cell IZZ` (bTuAy) — props: cell_main_axis_id="bTuBQ"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalliquido` (bTuAz) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:greater_or_equal_than(0.01):and_(Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:equals(El[rpg fornecedoresprodutos]:get_list_data:filtered(constraints={0={key="cpo_valorvendaliquido_number", value=0.01, constraint_type="gte"}}):cpo.ValorVendaLiquido:min)) → font_color="var(--color_bTHHX_default)"
          - **TableMainAxis** `TableMainAxis Q` (bTuBD) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis R` (bTuBE) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis S` (bTuBF) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis T` (bTuBJ) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis U` (bTuBK) — props: axis_index=10
          - **TableMainAxis** `TableMainAxis V` (bTuBL) — props: axis_index=9
          - **TableMainAxis** `TableMainAxis EZ` (bTuBP) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis GZ` (bTuBQ) — props: axis_index=8
      - **TableCell** `Cell F` (bTuDU) — props: cell_main_axis_id="bTuDn"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Input** `Input B` (bTuDV) — placeholder: "000" · auto_binding: True · content_format: "int_number" · props: font_alignment="center", bind_field="cpo_qtd_number"
      - **TableCell** `Cell I` (bTuDZ) — props: cell_main_axis_id="bTuFv"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn adiciona fornecedor` (bTuDa) — props: icon="material outlined factory", title_attribute="Adiciona fornecedor para orçar"
      - **TableCell** `Cell BZ` (bTuDb) — props: cell_main_axis_id="bTuFw"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn adiciona destino` (bTuDf) — props: icon="material outlined pin_drop", title_attribute="Destino desse produto"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:is_not_empty → icon_color="var(--color_bTHHX_default)"
      - **TableCell** `Cell XZZ` (bTuDg) — props: cell_main_axis_id="bTuFx"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn edita produto` (bTuDh) — props: icon="material outlined edit", title_attribute="Destino desse produto"
    - **TableMainAxis** `TableMainAxis D` (bTuDm) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis D` (bTuDn) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis B` (bTuDr) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell F` (bTuDs) — props: cell_main_axis_id="bTuDm"
        - **Table** `Table E` (bTuDt) — props: group_type="option.opt_a__oclifor", vertical_centering=True, vertical_separator_color="var(--color_surface_default)", vertical_separator_width=4, horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis W` (bTuDx) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis W` (bTuDy) — props: axis_index=9
          - **TableCrossAxis** `TableCrossAxis E` (bTuDz) — oculto ao carregar · props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=True, fixed_number_repeating_axis_count=0
            - **TableCell** `Cell OZ` (bTuED) — props: cell_main_axis_id="bTuDx"
            - **TableCell** `Cell OZ` (bTuEE) — props: cell_main_axis_id="bTuDy"
            - **TableCell** `Cell QZ` (bTuEF) — props: cell_main_axis_id="bTuEW"
            - **TableCell** `Cell SZ` (bTuEJ) — props: cell_main_axis_id="bTuEX"
            - **TableCell** `Cell UZ` (bTuEK) — props: cell_main_axis_id="bTuEb"
            - **TableCell** `Cell WZ` (bTuEL) — props: cell_main_axis_id="bTuEc"
            - **TableCell** `Cell YZ` (bTuEP) — props: cell_main_axis_id="bTuEd"
            - **TableCell** `Cell AZZ` (bTuEQ) — props: cell_main_axis_id="bTuEh"
            - **TableCell** `Cell CZZ` (bTuER) — props: cell_main_axis_id="bTuEi"
            - **TableCell** `Cell FZZ` (bTuEV) — props: cell_main_axis_id="bTuFj"
          - **TableMainAxis** `TableMainAxis X` (bTuEW) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis Y` (bTuEX) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis Z` (bTuEb) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis AZ` (bTuEc) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis BZ` (bTuEd) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis CZ` (bTuEh) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis DZ` (bTuEi) — props: axis_index=8
          - **TableCrossAxis** `TableCrossAxis E` (bTuEj) — props: axis_index=0
            - **TableCell** `Cell OZ` (bTuEn) — props: cell_main_axis_id="bTuDx"
              - **Icon** `btn abrir todos` (bTuEp) — props: icon="material outlined keyboard_double_arrow_down"
                - ⟂ quando El[Página vendas_bkp]:custom.var_todosfornecedores_:is_true → icon="material outlined keyboard_double_arrow_up"
              - **Text** `Text LZ` (bTuEo) — text: "Produto / Fornecedor"
            - **TableCell** `Cell OZ` (bTuEt) — props: cell_main_axis_id="bTuDy"
            - **TableCell** `Cell PZ` (bTuEu) — props: cell_main_axis_id="bTuEW"
              - **Text** `Text NZ` (bTuEv) — text: "Produto Unit." · props: font_alignment="center"
            - **TableCell** `Cell RZ` (bTuEz) — props: cell_main_axis_id="bTuEX"
              - **Text** `Text OZ` (bTuFA) — text: "Comissão Unit." · props: font_alignment="center"
            - **TableCell** `Cell TZ` (bTuFB) — props: cell_main_axis_id="bTuEb"
              - **Text** `Text PZ` (bTuFF) — text: "Tipo Frete" · props: font_alignment="center"
            - **TableCell** `Cell VZ` (bTuFG) — props: cell_main_axis_id="bTuEc"
              - **Text** `Text QZ` (bTuFH) — text: "Valor Frete" · props: font_alignment="center"
            - **TableCell** `Cell XZ` (bTuFL) — props: cell_main_axis_id="bTuEd"
              - **Text** `txt titulo icms` (bTuFM) — oculto ao carregar · text: "ICMS" · props: font_alignment="center"
              - **Text** `txt titulo piscofins` (bTuFN) — oculto ao carregar · text: "PIS/COFINS" · props: font_alignment="center"
              - **Text** `Text BZZ` (bTuFR) — text: "Aliq. ICMS" · props: font_alignment="center"
              - **Text** `Text A` (bTuFS) — text: "Aliq. PISCOFINS" · props: font_alignment="center"
              - **Text** `Text B` (bTuFT) — text: "Total Tributos" · props: font_alignment="center"
            - **TableCell** `Cell ZZ` (bTuFX) — props: cell_main_axis_id="bTuEh"
              - **Text** `Text SZ` (bTuFY) — text: "Total Bruto" · props: font_alignment="center"
            - **TableCell** `Cell BZZ` (bTuFZ) — props: cell_main_axis_id="bTuEi"
              - **Text** `Text VZ` (bTuFd) — text: "Total Comiss." · props: font_alignment="center"
            - **TableCell** `Cell GZZ` (bTuFe) — props: cell_main_axis_id="bTuFj"
              - **Text** `Text XZ` (bTuFf) — text: "Total Líq" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis FZ` (bTuFj) — props: axis_index=7
      - **TableCell** `Cell F` (bTuFk) — props: cell_main_axis_id="bTuDn"
        - **Text** `Text MZ` (bTuFl) — text: "QTD" · props: font_alignment="center"
      - **TableCell** `Cell G` (bTuFp) — props: cell_main_axis_id="bTuFv"
      - **TableCell** `Cell AZ` (bTuFq) — props: cell_main_axis_id="bTuFw"
      - **TableCell** `Cell WZZ` (bTuFr) — props: cell_main_axis_id="bTuFx"
    - **TableMainAxis** `TableMainAxis E` (bTuFv) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis P` (bTuFw) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis OZ` (bTuFx) — props: axis_index=-1
  - **Group** `Group BZZ` (bTuIR) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Button** `btn gravarcotacao` (bTuIS) — text: "Gravar Cotação" · props: vertical_centering=True
      - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → is_visible=True
      - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:not_equals(Opt.Ações.Nova Cotação) → is_visible=False
    - **Button** `btn salvarcotacao` (bTuIT) — text: "Salvar Cotação"
      - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → is_visible=True
      - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:not_equals(Opt.Ações.Edita Cotação) → is_visible=False
    - **Button** `btn cancelacotacao` (bTuIX) — text: "Cancela"
      - ⟂ quando El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)"
    - **Input** `ipt contaproduto` (bTuIY) — oculto ao carregar · content: Parent:cpo.QuaisProdutos:count · content_format: "int_number" · props: vertical_centering=True
    - **Input** `ipt contavencedor` (bTuIZ) — oculto ao carregar · content: Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count · content_format: "int_number" · props: vertical_centering=True
- **Popup** `pop apagar registro` (bTuii) — props: border_color_top="var(--color_bTHHQ_default)", border_style_top="solid", border_width_top=5, four_border_style=True, border_roundness_left=10, border_roundness_right=10
  - **Icon** `Icon A` (bTuij) — props: icon="fa fa-exclamation-triangle"
  - **Text** `Text EZ` (bTuin) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text FZ` (bTuio) — text: "Você está tentando apagar um registro de seu banco e dados." · props: font_alignment="center"
  - **Text** `Text GZ` (bTuip) — text: "Esta ação não pode ser revertida!" · props: font_alignment="center"
  - **Text** `Text HZ` (bTuit) — text: "Deseja continuar?" · props: font_alignment="center"
  - **Button** `Button C` (bTuiu) — text: "SIM"
  - **Button** `Button D` (bTuiv) — text: "NÃO"
- **Popup** `pop add edita pedido` (bTuSm) — props: group_type="custom.tbl_pedidos", vertical_centering=True
  - estado customizado `var_acaocotacao_` : Opt.Ações
  - estado customizado `var_deletarentregas_` : list.custom.tbl_entregas (lista)
  - **Group** `Group QZZZ` (bTuSh) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Group** `gp alert gravando` (bTuSf) — oculto ao carregar · props: vertical_centering=True
      - **Text** `Text TZZZZZZ` (bTuSg) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! "
    - **Group** `Group LZZZ` (bTuSb) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - **Group** `gp pedido corpoarquivo` (bTuLj) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True, unique_id="corpopedido"
        - **Group** `Group EZ` (bTuLL) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Image** `Image C` (bTuLM) — props: src="{Parent:cpo.QualCotacao:cpo.EmpresaMegabox:logoimagem:imgix_treatment(fm="png")}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group EZ` (bTuLN) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Text** `Text DZZ` (bTuLR) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
            - **Text** `Text DZZ` (bTuLS) — text: "[b]Email[/b]: {CurrentUser:cpo.EmailContato:to_lowercase}"
              - ⟂ quando Parent:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email[/b]: {Parent:cpo.EmpresaMegabox:email}"
            - **Text** `Text DZZ` (bTuLT) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group EZ` (bTuLX) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Text** `Text DZZ` (bTuLY) — text: "Pedido núm: {Parent:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}"
          - **Text** `Text DZZ` (bTuLZ) — text: "{Page.Current Date/Time:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Table** `rpg exibe itens pedido` (bTuLH) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=4
          - **TableCrossAxis** `TableCrossAxis Q` (bTuKz) — props: axis_index=0
            - **TableCell** `Cell IZZZZ` (bTuLA) — props: cell_main_axis_id="bTuLG"
              - **Group** `Group EZZZ` (bTuLB) — props: vertical_centering=True
                - **Text** `Text PZZZZZZ` (bTuLF) — text: "Detalhes do pedido"
          - **TableCrossAxis** `TableCrossAxis Q` (bTuKv) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell IZZZZ` (bTuKu) — props: cell_main_axis_id="bTuLG"
              - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
              - **Group** `Group SZZ` (bTuKi) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group LZZZZZ` (bTuKj) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text DZZZZZZ` (bTuKn) — text: "Dados de faturamento"
                  - **Text** `Text BZZZZZZ` (bTuKo) — text: "[b]Razão[/b]: {Parent:cpo.QualEnderecoOrigem:cpo.Razao:to_uppercase}"
                  - **Text** `Text BZZZZZZ` (bTuKp) — text: "[b]CNPJ:[/b]  {Parent:cpo.QualEnderecoOrigem:cpo.CnpjCpf:to_uppercase}"
                  - **Text** `Text BZZZZZZ` (bTuKt) — text: "[b]Endereço:[/b]  {Parent:cpo.QualEnderecoOrigem:cpo.Endereco:to_uppercase} - {Parent:cpo.QualEnderecoOrigem:cpo.Municipio:to_uppercase} - {Parent:cpo.QualEnderecoOrigem:cpo.QualUfOpt:display}"
              - **Group** `gp D A D O S C L I E N T E` (bTuJr) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group GZZZZZZ` (bTuKL) — props: vertical_centering=True
                  - **PictureInput** `upi novocliente logo` (bTuKP) — placeholder: "" · props: src="{Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.QualGrupoCliFor:cpo.Foto:imgix_treatment(fm="png")}", private=False, disabled=True
                    - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                - **Group** `Group XZZ` (bTuKD) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group CZZZ` (bTuKF) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Icon** `Icon YZZ` (bTuKK) — props: icon="material filled pin_drop"
                      - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → icon_color="var(--color_bTHHQ_default)"
                    - **Text** `Text KZZZZZZ` (bTuKJ) — text: "Enviar para:"
                      - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → font_color="var(--color_bTHHQ_default)"
                  - **Text** `Text KZZZZZZ` (bTuKE) — text: "Razão: {Parent:cpo.QualEnderecoDestino:cpo.Razao:to_capitalized_words}⏎Endereço: {Parent:cpo.QualEnderecoDestino:cpo.Endereco:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.Complemento:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.Municipio:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.UF:to_uppercase} - {Parent:cpo.QualEnderecoDestino:cpo.Cep}⏎Cnpj: {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.CnpjCpf}⏎Insc.Est: {Parent:cpo.QualEnderecoDestino:cpo.InscEstadual}"
                    - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → text="{∅}Selecione um endereço pra entrega"
                - **Group** `Group VZZ` (bTuJs) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group DZZZ` (bTuJx) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **HTML** `HTML B` (bTuJz) — html(392 chars) · props: vertical_centering=True
                      - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → html="<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#b72d3a"><path d="M240-396h372l72-72H240v72Zm0-144h240v-72H240v72Zm-72-156v384h360l-72 72H96v-528h768v192h-72v-120H168Zm715.57 238.83q4.43 4.46 4.43 9.82 0 5.35-5 10.35l-31 32-63-63 31-32q4.77-5 10.5-5t10.5 5l42.57 42.83ZM528-144v-63.13L768-447l63 63-239.87 240H528ZM168-696v384-384Z"/></svg>"
                    - **Text** `Text JZZZZZZ` (bTuJy) — text: "Faturar para:"
                      - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → font_color="var(--color_bTHHQ_default)"
                  - **Text** `Text JZZZZZZ` (bTuJt) — text: "Razão: {Parent:cpo.QualEndereçoCobrança:cpo.Razao:to_capitalized_words}⏎Endereço: {Parent:cpo.QualEndereçoCobrança:cpo.Endereco:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.Complemento:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.Municipio:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.UF:to_uppercase} - {Parent:cpo.QualEndereçoCobrança:cpo.Cep}⏎Cnpj: {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.CnpjCpf}⏎Insc.Est: {Parent:cpo.QualEndereçoCobrança:cpo.InscEstadual}"
                    - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → text="{∅}Selecione um endereço de cobrança"
              - **Group** `Group ZZZ` (bTuKQ) — props: vertical_centering=True
                - **Text** `Text GZZZZZZ` (bTuKR) — text: "Produtos"
                - **Text** `Text GZZZZZZ` (bTuKV) — text: "Qtd" · props: font_alignment="center"
                - **Text** `Text GZZZZZZ` (bTuKW) — text: "VALOR UNITÁRIO⏎Líquido de impostos" · props: font_alignment="center"
                - **Text** `Text DZZZZZZZ` (bTuKX) — text: "Frete" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZZZZZZ` (bTuKh) — text: "Alíquota⏎ICMS" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text C` (bTuKc) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text EZZZZZZZ` (bTuKb) — text: "VALOR UNIT BRUTO⏎(Impostos Incluso)" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZ` (bTuKd) — text: "VALOR TOTAL BRUTO" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
              - **Group** `Group TZZ` (bTuIe) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group TZZ` (bTuIf) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text GZZZZZZ` (bTuIj) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                  - **Text** `Text GZZZZZZ` (bTuIk) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Medida}"
                - **Text** `Text GZZZZZZ` (bTuIp) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
                - **Text** `Text GZZZZZZ` (bTuIl) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
                - **Group** `Group KZZZZZ` (bTuIx) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text FZZZZZZZ` (bTuJB) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                  - **Text** `Text LZZZZZZZZ` (bTuJC) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZZZZZZ` (bTuIw) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text D` (bTuIr) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text GZZZZZZZ` (bTuIq) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZ` (bTuIv) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
              - **Group** `linha orcamentofornecedor` (bTuJD) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:less_than(1) → is_visible=False
                - **Table** `rpg entregas do produto` (bTuJH) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:sorted(descending=False, sort_field="cpo_dataentrega_date") · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
                  - **TableMainAxis** `TableMainAxis LZZ` (bTuJI) — props: axis_index=0
                  - **TableMainAxis** `TableMainAxis LZZ` (bTuJJ) — props: axis_index=1
                  - **TableCrossAxis** `TableCrossAxis Q` (bTuJN) — props: axis_index=0
                    - **TableCell** `Cell IZZZZ` (bTuJO) — props: cell_main_axis_id="bTuJI"
                      - **Text** `Text GZZZZZZ` (bTuJP) — text: "Data entrega" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTuJT) — props: cell_main_axis_id="bTuJJ"
                      - **Text** `Text GZZZZZZ` (bTuJU) — text: "Qtd entrega" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTuJV) — props: cell_main_axis_id="bTuJn"
                      - **Text** `Text GZZZZZZ` (bTuJZ) — text: "Valor bruto " · props: font_alignment="center"
                  - **TableCrossAxis** `TableCrossAxis Q` (bTuJa) — props: axis_index=1, cross_axis_repeat=True
                    - **TableCell** `Cell IZZZZ` (bTuJb) — props: cell_main_axis_id="bTuJI"
                      - **Text** `Text GZZZZZZ` (bTuJf) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTuJg) — props: cell_main_axis_id="bTuJJ"
                      - **Text** `Text IZZZZZZ` (bTuJh) — text: "{Ancestor[TableCrossAxis]:cpo.QtdEntrega}" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTuJl) — props: cell_main_axis_id="bTuJn"
                      - **Text** `Text HZZZZZZ` (bTuJm) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
                  - **TableMainAxis** `TableMainAxis LZZ` (bTuJn) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis LZZ` (bTuLG) — props: axis_index=1
        - **Group** `Group EZ` (bTuLd) — props: vertical_centering=True
          - **Text** `Text DZZ` (bTuLe) — text: "Informações adicionais"
        - **Text** `Text TZZZZZZZ` (bTuLf) — text: "[color=#fab515][b][size=2]Número da Ordem de compra: {El[ipt pedido ordemcompra numero]:get_data}[/size][/b][/color]⏎⏎[b][size=2]Informações adicionais: {El[ipt pedido infoadd]:get_data}[/size][/b] ⏎⏎[b][size=2]Condições de pagamento: {El[dd parcelas receb comissao]:get_data:display} - {El[dd formapagto]:get_data:display}[/size][/b]⏎⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
      - **Group** `gp itens pedido` (bTuSa) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Group** `Group TZZZZZ` (bTuSH) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Text** `Text DZZ` (bTuSI) — text: "Pedido ao Fornecedor" · props: font_alignment="center"
        - **Group** `gp qual cliente` (bTuPZ) — data_source: Parent · props: group_type="custom.tbl_pedidos"
          - **PictureInput** `upi novocliente logo` (bTuPa) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
            - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - **Group** `Group EZ` (bTuPb) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Text** `Text DZZ` (bTuPf) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
            - **Text** `Text DZZ` (bTuPg) — text: "Cotação número {Parent:cpo.QualCotacao:cpo.CotacaoNum} Proposta número {Parent:cpo.QualProposta:cpo.PropostaNum}"
          - **Icon** `Icon WZ` (bTuPl) — props: icon="material outlined contact_mail"
          - **Icon** `hide dados do pedido` (bTuPh) — props: icon="material outlined vertical_align_top"
            - ⟂ quando El[dados do pedido]:isnt_visible → icon="material outlined vertical_align_bottom"
        - **Group** `dados do pedido` (bTuPm) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp coluna esquerda` (bTuQW) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Group** `gp mail cliente` (bTuQv) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Group** `gp email cliente` (bTuQz) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text NZZZZZZ` (bTuRG) — text: "Email do Cliente:"
                - **Group** `Group ZZZZ` (bTuRA) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                  - **Dropdown** `dd pedido emailcliente` (bTuRB) — data_source: Parent:cpo.QualCotacao:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailCliente, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                    - ⟂ quando El[chk formalizar]:get_data → mandatory=True
                  - **Icon** `Icon YZ` (bTuRF) — props: icon="material outlined contact_phone"
              - **Group** `gp email cliente copy` (bTuRN) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text MZZZZZZZZ` (bTuRR) — text: "CC e-mail cliente:"
                - **Input** `ipt cc email cliente` (bTuRS) — placeholder: "Emails separados por ;" · props: mandatory=False
                  - ⟂ quando El[chk formalizar]:get_data → mandatory=True
              - **Group** `gp corpo email cliente` (bTuRH) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text Corpo do e-mail ` (bTuRM) — text: "Corpo do e-mail do cliente:"
                - **MultiLineInput** `ipt pedido corpoemailcliente` (bTuRL) — placeholder: "" · content: "Olá {El[dd pedido emailcliente]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Gostaríamos de agradecer pela oportunidade de atendê-lo(a) e, conforme discutido em nossas interações anteriores, estamos formalizando o pedido.⏎⏎Se houver alguma observação relevante ou condições especiais a serem consideradas, por favor, nos avise.⏎⏎Solicitamos a gentileza de confirmar o recebimento deste e-mail.⏎⏎Estamos à disposição para esclarecer quaisquer dúvidas ou realizar ajustes necessários.⏎⏎Agradecemos mais uma vez pela confiança depositada em nossa empresa e estamos ansiosos para continuar nossa parceria!⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]⏎" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
                  - ⟂ quando This:is_focused → border_color="var(--color_bTHGs_default)"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
            - **Group** `gp mail fornecedor` (bTuQX) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Group** `gp email fornecedor` (bTuQb) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text MZZZZZZ` (bTuQi) — text: "Email do fornecedor:"
                - **Group** `Group KZZZ` (bTuQc) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                  - **Dropdown** `dd pedido emailfornecedor` (bTuQd) — data_source: El[rpg pedido OrçFornecedores]:get_list_data:cpo.QualFornecedor:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailFornecedor, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                    - ⟂ quando El[chk formalizar]:get_data → mandatory=True
                  - **Icon** `Icon XZ` (bTuQh) — props: icon="material outlined contact_phone"
              - **Group** `gp email fornecedor copy` (bTuQp) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text NZZZZZZZZ` (bTuQt) — text: "CC email fornecedor:"
                - **Input** `ipt cc email fornecedor` (bTuQu) — placeholder: "Emails separados por ;" · props: mandatory=False
                  - ⟂ quando El[chk formalizar]:get_data → mandatory=True
              - **Group** `gp corpo pedidoemail fornecedor` (bTuQj) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text Corpo do e-mail ` (bTuQo) — text: "Corpo do e-mail do fornecedor:"
                - **MultiLineInput** `ipt pedido corpoemailfornecedor` (bTuQn) — placeholder: "" · content: "Olá {El[dd pedido emailfornecedor]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Segue abaixo observações importantes sobre o pedido: ⏎⏎Todas as informações sobre o cliente consta no anexo do pedido. Caso precise de mais alguma informação peço por gentileza que nos solicite⏎⏎Lembrando que a comissão do pedido obedece os seguintes critérios:⏎⏎{Parent:cpo.QuaisOrcamentosFonecedores:format_as_text(content="{InjectedValue:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - comissão unitário {InjectedValue:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="comma")}", delimiter="⏎")}⏎⏎Totalizando a comissão em {Parent:cpo.QuaisOrcamentosFonecedores:cpo.ValorComissaoBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎⏎[b]Informações importantes:[/b]⏎O setor financeiro entrará em contato para negociar a forma de pagamento, que poderá ser por boleto bancário ou depósito. Caso prefira, você também pode enviar um e-mail diretamente para: financeiro@grupomegabox.com.br.⏎⏎Se o boleto for emitido, mas o pagamento for realizado via PIX ou depósito, solicitamos que a baixa seja feita imediatamente. Isso evita o encaminhamento do boleto ao cartório e a consequente geração de encargos como custas cartorárias, multas e juros.⏎⏎Ressaltamos que o Grupo MegaBox não se responsabiliza por eventuais encargos decorrentes da ausência de baixa do boleto.⏎⏎Conforme informado no início da parceria, a responsabilidade pela análise e liberação de crédito é inteiramente do FORNECEDOR. A MegaBox não realiza nem se responsabiliza por essa análise cadastral.⏎⏎Em casos de atrasos ou antecipações nas entregas, pedimos que o vendedor responsável seja informado com antecedência, para que possa comunicar o cliente e evitar custos desnecessários com frete.⏎⏎Agradecemos pela confiança e parceria com o Grupo MegaBox.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
                  - ⟂ quando This:is_focused → border_color="var(--color_bTHGs_default)"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
          - **Group** `gp coluna direita` (bTuPn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Group** `gp anexo ordem` (bTuPx) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text DZZ` (bTuPy) — text: "Anexo ordem de compra cliente:"
              - **Group** `Group JZZZZ` (bTuPz) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **FileInput** `upf pedido ordemcompra file` (bTuQD) — placeholder: "Selecione o arquivo (máx 3mb)" · props: mandatory=False, font_alignment="left", src="{Parent:cpo.OrdemCompraArquivo}", max_size=3
                - **Icon** `Icon R` (bTuQE) — props: icon="material outlined open_in_new"
                  - ⟂ quando El[upf pedido ordemcompra file]:get_data:is_not_empty → is_visible=True
                  - ⟂ quando El[upf pedido ordemcompra file]:get_data:is_empty → is_visible=True
            - **Group** `gp num ordem` (bTuQF) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text DZZ` (bTuQJ) — text: "Núm ordem de compra cliente:"
              - **Input** `ipt pedido ordemcompra numero` (bTuQK) — placeholder: "000000" · content: "{Parent:cpo.OrdemComrpaNum}" · props: mandatory=False
            - **Group** `gp informacoes adicionais` (bTuPr) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text RZZZZZZ` (bTuPt) — text: "Informações adicionais no pedido:"
              - **MultiLineInput** `ipt pedido infoadd` (bTuPs) — placeholder: "" · content: "{Parent:cpo.InformacoesAdd}" · props: unique_id="remodela"
            - **Group** `g FileUploader copy` (bTuQL) — data_source: Parent · props: group_type="custom.tbl_pedidos"
              - **Text** `Text VZZZZZZZ` (bTuQV) — text: "Condições de pagamento:"
              - **Group** `Group TZZZZZZ` (bTuQP) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **select2-MultiDropdown** `dd parcelas receb comissao` (bTuQR) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · props: default=Parent:cpo.PrazoRecebComissoes, dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
                - **Dropdown** `dd formapagto` (bTuQQ) — data_source: All(Opt.FormaPgto) · placeholder: "Pix, boleto, transferência" · props: default=Parent:cpo.FormaPagto, vertical_centering=True, dynamic_type="option.opt_formapgto", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
        - **Table** `rpg pedido OrçFornecedores` (bTuPV) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=10
          - **TableCrossAxis** `TableCrossAxis N` (bTuPO) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell ZZZZ` (bTuPN) — props: cell_main_axis_id="bTuPU"
              - **Group** `Group WZZ` (bTuOl) — props: vertical_centering=True
                - **Icon** `Icon FZZ` (bTuPI) — props: icon="material outlined mode_edit", vertical_centering=True, button_disabled=True, title_attribute="Edite quantidade e valores dos produtos antes de informar entregas"
                  - ⟂ quando CurrentUser:equals(El[pop add edita pedido]:get_group_data:Created By) → icon_color="var(--color_primary_default)", button_disabled=False
                  - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → icon_color="var(--color_primary_default)", button_disabled=False
                - **Text** `Text DZZ` (bTuOp) — text: "Produtos & Fornecedor" · props: word_spacing=-0.5
                - **CustomElement** `tool.EnderecoFornecedor A` (bTuPJ) — USA Reusable tool.EnderecoFornecedor · data_source: Ancestor[TableCrossAxis] · props: custom_id="bThmz1"
                - **Text** `Text MZZZZZ` (bTuOq) — text: "Qtd" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text EZZ` (bTuOr) — text: "Comissão" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text OZZZZZZ` (bTuPH) — text: " " · props: font_alignment="center"
                - **Text** `Text LZZZZZ` (bTuOv) — text: "Frete" · props: font_alignment="center", word_spacing=-0.5
                - **Text** `Text CZZZZZZ` (bTuOw) — text: " " · props: font_alignment="center"
                - **Text** `Text NZZZZZ` (bTuOx) — text: "Valor Bruto" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZZZ` (bTuPB) — text: "Tributos" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTuPC) — text: "Valor líq" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text TZZZZZ` (bTuPD) — text: "Faturar ⏎para:" · props: font_alignment="center", word_spacing=-0.5
              - **Group** `Group UZZ` (bTuOG) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group NZZ` (bTuOe) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text DZZ` (bTuOf) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}" · props: word_spacing=-0.5
                  - **Text** `Text HZZZZZ` (bTuOj) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Medida}" · props: word_spacing=-0.5
                - **Text** `Text DZZ` (bTuON) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda:format_number(decimal_place=0, thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZZZ` (bTuOR) — text: "{Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                  - ⟂ quando El[gp alerta divergencia comissao]:is_visible → font_color="var(--color_bTHHQ_default)"
                - **CustomElement** `tool.EnderecoEntrega A` (bTuOk) — USA Reusable tool.EnderecoEntrega · data_source: Parent · props: custom_id="bTbjh"
                - **Group** `Group OZZ` (bTuOH) — props: vertical_centering=True
                  - **Text** `Text DZZ` (bTuOL) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}" · props: font_alignment="center", word_spacing=-0.5
                  - **Text** `Text IZZZZZ` (bTuOM) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                - **Group** `btn add entrega no pedido` (bTuOY) — props: vertical_centering=True
                  - **HTML** `htm botao entrega` (bTuOZ) — html(534 chars)
                    - ⟂ quando El[linha orcamentofornecedor]:get_group_data:cpo.QtdVenda:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum):equals(0) → min_height_css="0px"
                - **Text** `Text DZZ` (bTuOS) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTuOT) — text: "{Ancestor[TableCrossAxis]:cpo.ValorICMS:plus(Ancestor[TableCrossAxis]:cpo.ValorIPI):plus(Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS):format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTuOX) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **CustomElement** `tool.EnderecoCobranca A` (bTuOd) — USA Reusable tool.EnderecoCobranca · data_source: Parent · props: custom_id="bTbWm"
              - **Group** `linha orcamentofornecedor` (bTuOF) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:less_than(1) → is_visible=False
                - **Table** `rpg entregas do produto` (bTuOB) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisEntregas · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
                  - **TableCrossAxis** `TableCrossAxis O` (bTuMg) — props: axis_index=1, cross_axis_repeat=True
                    - **TableCell** `Cell AZZZZ` (bTuLk) — props: cell_main_axis_id="bTuMh"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHJ_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **DateInput** `ipt entrega dataprevista` (bTuLl) — placeholder: "___/___/____" · content: Ancestor[TableCrossAxis]:cpo.DataEntrega · auto_binding: True · props: font_alignment="center", vertical_centering=True, word_spacing=-0.5, bind_field="cpo_dataentrega_date", overwrite_placeholder=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → bgcolor="var(--color_bTHGh_default)", disabled=True
                    - **TableCell** `###Cell 1C` (bTuLp) — props: cell_main_axis_id="bTuMl"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHJ_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Icon** `force calc` (bTuLq) — props: icon="material outlined calculate", title_attribute="Refaz o cálculo dos valores dessa entrega"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor)) → button_disabled=False
                      - **Input** `ipt entrega qtd` (bTuLr) — placeholder: "000" · content: Ancestor[TableCrossAxis]:cpo.QtdEntrega · auto_binding: True · content_format: "int_number" · props: mandatory=False, font_alignment="center", vertical_centering=True, word_spacing=-0.5, bind_field="cpo_qtdentrega_number", show_thousands=True, not_submit_on_enter=False, have_a_numerical_range=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → bgcolor="var(--color_bTHGh_default)", disabled=True
                    - **TableCell** `Cell AZZZZ` (bTuLv) — props: cell_main_axis_id="bTuMm"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text VZZZZZ` (bTuLw) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell CZZZZ` (bTuLx) — props: cell_main_axis_id="bTuNt"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text WZZZZZ` (bTuMB) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell EZZZZ` (bTuMC) — props: cell_main_axis_id="bTuNu"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text XZZZZZ` (bTuMD) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell KZZZZ` (bTuMH) — props: cell_main_axis_id="bTuNv"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **CustomElement** `tool.AnexaNf A` (bTuMI) — USA Reusable pop.AnexaNf · data_source: Ancestor[TableCrossAxis] · props: custom_id="bTbua", unique_id="toolsaiuentrega"
                    - **TableCell** `Cell GZZZZ` (bTuMJ) — props: cell_main_axis_id="bTuNz"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Icon** `btn cancelanetrega` (bTuMO) — props: icon="material outlined event_busy", vertical_centering=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:not_equals(Opt.Etapas.Financeiro)) → is_visible=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_false → is_visible=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → icon_color="var(--color_bTHGl_default)", is_visible=True, button_disabled=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → icon_color="var(--color_bTHGl_default)", is_visible=True, button_disabled=True
                        - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2
                      - **Icon** `chk entrega pra deletar` (bTuMN) — props: icon="material outlined check_box_outline_blank"
                        - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → is_visible=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_false → is_visible=True
                    - **TableCell** `Cell SZZZZ` (bTuMP) — props: cell_main_axis_id="bTuOA"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Group** `gp notas` (bTuMT) — props: vertical_centering=True
                        - **Text** `Text BZZZZZZZ` (bTuMU) — text: "Nf: {Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: word_spacing=-0.5
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                        - **Icon** `Icon DZZZ` (bTuMV) — props: icon="material outlined attach_file", vertical_centering=True
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor:is_empty → icon_color="var(--color_bTHGl_default)"
                      - **Group** `gp boletos` (bTuMZ) — props: vertical_centering=True
                        - **Text** `Text YZZZZZZZZ` (bTuMa) — text: "Boletos ({Ancestor[TableCrossAxis]:cpo.BoletoArquivos:count})" · props: word_spacing=-0.5
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                        - **Icon** `Icon FZZZ` (bTuMb) — props: icon="material outlined attach_file", vertical_centering=True
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.BoletoArquivos:count:less_than(1) → icon_color="var(--color_bTHGl_default)"
                      - **Text** `Text LZZZZZZ` (bTuMf) — text: "Etapa: {Ancestor[TableCrossAxis]:cpo.StatusEntrega:display}" · props: word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                  - **TableMainAxis** `TableMainAxis GZZ` (bTuMh) — props: axis_index=1
                  - **TableMainAxis** `TableMainAxis GZZ` (bTuMl) — props: axis_index=2
                  - **TableMainAxis** `TableMainAxis GZZ` (bTuMm) — props: axis_index=3
                  - **TableCrossAxis** `TableCrossAxis O` (bTuMn) — props: axis_index=0
                    - **TableCell** `Cell AZZZZ` (bTuMr) — props: cell_main_axis_id="bTuMh"
                      - **Text** `Text OZZZZZ` (bTuMs) — text: "Dt prev. entrega" · props: font_alignment="center", word_spacing=-0.5
                    - **TableCell** `Cell AZZZZ` (bTuMt) — props: cell_main_axis_id="bTuMl"
                      - **Text** `Text PZZZZZ` (bTuMx) — text: "Qtd entrega: {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group SZZZ` (bTuMy) — props: vertical_centering=True
                        - **Text** `Text UZZZZZ` (bTuMz) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltaqtd]:get_data:greater_than(0):or_(El[ipt faltaqtd]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltaqtd` (bTuND) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.QtdVenda:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum) · content_format: "int_number" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell AZZZZ` (bTuNE) — props: cell_main_axis_id="bTuMm"
                      - **Text** `Text QZZZZZ` (bTuNF) — text: "Comissão {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group PZZZZZZ` (bTuNJ) — props: vertical_centering=True
                        - **Text** `Text HZZZZZZZZZ` (bTuNK) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltacomissao]:get_data:greater_than(0):or_(El[ipt faltacomissao]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltacomissao` (bTuNL) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorComissaoBruto:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.valorcomissao:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell BZZZZ` (bTuNP) — props: cell_main_axis_id="bTuNt"
                      - **Text** `Text RZZZZZ` (bTuNQ) — text: "Valor bruto {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group QZZZZZZ` (bTuNR) — props: vertical_centering=True
                        - **Text** `Text IZZZZZZZZZ` (bTuNV) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltabruto]:get_data:greater_than(0):or_(El[ipt faltabruto]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltabruto` (bTuNW) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorVendaBruto:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaBruto:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell DZZZZ` (bTuNX) — props: cell_main_axis_id="bTuNu"
                      - **Text** `Text SZZZZZ` (bTuNb) — text: "Valor líq {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaLiquido:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group RZZZZZZ` (bTuNc) — props: vertical_centering=True
                        - **Text** `Text YZZZZZ` (bTuNd) — text: "Falta: " · props: word_spacing=-0.5
                        - **Input** `ipt faltaliquido` (bTuNh) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorVendaLiquido:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaLiquido:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell JZZZZ` (bTuNi) — props: cell_main_axis_id="bTuNv"
                    - **TableCell** `Cell FZZZZ` (bTuNj) — props: cell_main_axis_id="bTuNz"
                      - **Icon** `Icon VZZ` (bTuNn) — props: icon="material outlined delete_outline", button_disabled=True
                        - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:count:greater_or_equal_than(1) → icon_color="var(--color_bTHHQ_default)", button_disabled=False
                    - **TableCell** `Cell RZZZZ` (bTuNo) — props: cell_main_axis_id="bTuOA"
                      - **Text** `Text AZZZZZZZ` (bTuNp) — text: "Núm NF " · props: font_alignment="center", word_spacing=-0.5
                  - **TableMainAxis** `TableMainAxis HZZ` (bTuNt) — props: axis_index=4
                  - **TableMainAxis** `TableMainAxis IZZ` (bTuNu) — props: axis_index=5
                  - **TableMainAxis** `TableMainAxis MZZ` (bTuNv) — props: axis_index=7
                  - **TableMainAxis** `TableMainAxis JZZ` (bTuNz) — props: axis_index=0
                  - **TableMainAxis** `TableMainAxis RZZ` (bTuOA) — props: axis_index=6
          - **TableCrossAxis** `TableCrossAxis N` (bTuPP) — props: axis_index=0
            - **TableCell** `Cell ZZZZ` (bTuPT) — props: cell_main_axis_id="bTuPU"
          - **TableMainAxis** `TableMainAxis FZZ` (bTuPU) — props: axis_index=1
        - **Group** `gp alerta divergencia comissao` (bTuRp) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - ⟂ quando El[ipt difereca comissao]:get_data:greater_than(0):or_(El[ipt difereca comissao]:get_data:less_than(0)) → is_visible=True
          - **Icon** `Icon WZZ` (bTuRx) — props: icon="material outlined info"
          - **Text** `Text VZZZZZZ` (bTuRq) — text: "Existe uma diferença de [b]{El[ipt difereca comissao]:get_data:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/b] na comissão das entregas agendadas. Recalcule os valores antes de enviar o pedido."
          - **Input** `ipt comissao dos orcamentos` (bTuRr) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisOrcamentosFonecedores:cpo.ValorComissaoBruto:sum · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Input** `ipt soma comissao das entregas` (bTuRv) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:cpo.valorcomissao:sum · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Input** `ipt difereca comissao` (bTuRw) — oculto ao carregar · placeholder: "" · content: El[ipt comissao dos orcamentos]:get_data:minus(El[ipt soma comissao das entregas]:get_data) · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
        - **Group** `gp alerta falta data entrega` (bTuSB) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - ⟂ quando Parent:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_dataentrega_date", value=∅, constraint_type="is_empty"}}):count:greater_or_equal_than(1) → is_visible=True
          - **Icon** `Icon CZZZ` (bTuSD) — props: icon="material outlined info"
          - **Text** `Text SZZZZZZ` (bTuSC) — text: "Existem entregas sem data prevista."
        - **Group** `gp alerta conclusaopedido` (bTuSJ) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp retira pedido listagem copy` (bTuSN) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando Parent:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(El[ipt pedido contaentrega]:get_data:equals(El[ipt pedido entregasconcluidas]:get_data)) → is_visible=True
            - **Icon** `Icon XZZ` (bTuSP) — props: icon="material outlined info"
            - **Text** `Text CZZZZZZZ` (bTuSO) — text: "Todas entregas já foram concluidas e/ou canceladas. Deseja retirar esse pedido da lista de pedidos? "
            - **Button** `Button P` (bTuST) — text: "retira pedido" · props: icon="material outlined playlist_remove", vertical_centering=True, icon_size=16, button_type="label_icon"
              - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
            - **Input** `ipt pedido contaentrega` (bTuSV) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:filtered:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
            - **Input** `ipt pedido entregasconcluidas` (bTuSU) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Link** `Link A` (bTuSZ) — text: "[fa]file-pdf-o[/fa]   pdf pedido" · props: linktype="url", open_in_new_tab=True, vertical_centering=True, url="{Parent:cpo.PedidoArquivo}", show_icon=False, unique_id="linkpedido"
            - ⟂ quando Parent:cpo.PedidoArquivo:is_not_empty → is_visible=True
            - ⟂ quando Parent:cpo.PedidoArquivo:is_empty → is_visible=False
        - **Group** `Group MZZ` (bTuRT) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp salvar` (bTuRX) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Pedido) → is_visible=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido) → is_visible=False
            - **Button** `btn pedido salvar` (bTuRZ) — text: "Salvar"
            - **Button** `btn pedido cancelarsalvar` (bTuRY) — text: "Cancela"
          - **Group** `gp gravar` (bTuRd) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido) → is_visible=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Pedido) → is_visible=False
            - **Button** `btn pedido gravar` (bTuRf) — text: "Gravar" · props: vertical_centering=True
            - **Button** `btn pedido cancelargravar` (bTuRe) — text: "Cancela"
          - **Checkbox** `chk formalizar` (bTuRj) — label: "Formalizar pedido por e-mail (cliente e fornecedor)" · props: vertical_centering=True
            - ⟂ quando Parent:cpo.PedidoFormalizado:is_true → label="Reenviar pedido por e-mail (cliente e fornecedor)"
            - ⟂ quando El[gp alerta divergencia comissao]:is_visible:and_(Parent:cpo.PedidoFormalizado:is_false) → contents="unchecked", label="Formalizar pedido por e-mail (existe inconsistencia de data/qtd)", disabled=True
            - ⟂ quando El[gp alerta falta data entrega]:is_visible:and_(Parent:cpo.PedidoFormalizado:is_true) → contents="unchecked", label="Reenviar pedido por e-mail (existe inconsistencia de data/qtd)", disabled=True
        - **Group** `gp gerador pdf` (bTuRk) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1648430145817x673906689668022300]/AAc** `old PDF/IMG PEDIDO` (bTuRl)
  - **Icon** `btn pedido fecharjanela` (bTuSl) — props: icon="material outlined close"

## Workflows

#### WF bTujA — PageLoaded
1. **SetCustomState** [bTujB] alvo El[reus cabecalho A] · value=Opt.MenuConfig.sub_licita__o_1, custom_state="custom.var_qualsubmenu_"
2. **Plugin[1558770956236x539499438875082750]/AAC** [bTujF] 
3. **ChangePage** [bTujG] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):and_(CurrentUser:cpo.UltimoDateRange:is_not_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min}"}, 1={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max}"}}, keep_current_page_params=True
4. **ChangePage** [bTujH] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):or_(CurrentUser:cpo.UltimoDateRange:is_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
5. **ChangePage** [bTujL] alvo El[Current page] · SÓ SE UrlParam("cotacaoarquivada" as text):is_empty · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="{∅}no"}}, keep_current_page_params=True
6. **ChangePage** [bTujM] alvo El[Current page] · SÓ SE UrlParam("ordemdecrescente" as text):is_empty · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}yes"}}, keep_current_page_params=True
7. **ChangePage** [bTujN] alvo El[Current page] · SÓ SE UrlParam("expandircartoes" as text):is_empty · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}no"}}, keep_current_page_params=True
8. **ChangePage** [bTujR] alvo El[Current page] · SÓ SE UrlParam("pedidosconcluidos" as None):is_empty · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}no"}}, keep_current_page_params=True
9. **ChangePage** [bTujS] alvo El[Current page] · SÓ SE CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) · add_parameters=True, url_parameters={0={key="vendedor", value="{CurrentUser:_id}"}}, keep_current_page_params=True
10. **ChangePage** [bTujT] alvo El[Current page] · SÓ SE UrlParam("etapapedido" as option.opt_etapas):is_empty · add_parameters=True, url_parameters={0={key="etapapedido", value="{Opt.Etapas.Pedido:display}"}}, keep_current_page_params=True
11. **ChangePage** [bTujX] alvo El[Current page] · SÓ SE UrlParam("etapaentrega" as option.opt_etapas):is_empty · add_parameters=True, url_parameters={0={key="etapaentrega", value="{Opt.Etapas.Em Entrega:display}"}}, keep_current_page_params=True

#### WF bTujY — ButtonClicked em El[add produto]
- condição: El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação)
- props: workflow_disabled=False
1. **NewThing** [bTujZ] tipo Tbl.CotacaoProdutos · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data
2. **MakeChangeCurrentUser** [bTujd] campos: cpo.TempOrcamentoProdutos = ResultOfStep[bTujZ]
3. **ResetGroup** [bTuje] alvo El[gp add produto]

#### WF bTujf — ButtonClicked em El[Icon IZZZ]
- condição: El[pop add fornecedor]:custom.varfornecedoresselecionados_:not_contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTujj] alvo El[pop add fornecedor] · value=El[pop add fornecedor]:custom.varfornecedoresselecionados_:plus_element(Ancestor[TableCrossAxis]), custom_state="custom.varfornecedoresselecionados_"

#### WF bTujk — ButtonClicked em El[Icon IZZZ]
- condição: El[pop add fornecedor]:custom.varfornecedoresselecionados_:contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTujl] alvo El[pop add fornecedor] · value=El[pop add fornecedor]:custom.varfornecedoresselecionados_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.varfornecedoresselecionados_"

#### WF bTujp — ButtonClicked em El[Button E]
1. **ScheduleAPIEvent** [bTujq] date=Page.Current Date/Time, api_event="bTNrd", _wf_param_linha=El[pop add fornecedor]:get_group_data:cpo.Linha, _wf_param_medida="{El[pop add fornecedor]:get_group_data:cpo.Medida}", _wf_param_destino=El[dd end destino]:get_data, _wf_param_origens=El[pop add fornecedor]:custom.varfornecedoresselecionados_, _wf_param_condicao=El[pop add fornecedor]:get_group_data:cpo.Condicao, _wf_param_qtd laco=El[pop add fornecedor]:custom.varfornecedoresselecionados_:count, _wf_param_vendedor=CurrentUser, _wf_param_fila laco=1, _wf_param_orcamentoproduto=El[pop add fornecedor]:get_group_data
2. **SetCustomState** [bTujr] alvo El[pop add fornecedor] · custom_state="custom.varfornecedoresselecionados_"
3. **HideElement** [bTujv] alvo El[pop add fornecedor]

#### WF bTujw — ButtonClicked em El[btn nova cotação]
- props: workflow_disabled=False
1. **ResetGroup** [bTujx] alvo El[pop add edita cotacao]
2. **SetCustomState** [bTukB] alvo El[Página vendas_bkp] · value=Opt.Ações.Nova Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTukC] alvo El[pop add edita cotacao]

#### WF bTukD — ButtonClicked em El[btn cancelacotacao]
- props: event_color="brown"
1. **DeleteListOfThings** [bTukH] to_delete=CurrentUser:cpo.TempOrcamentoProdutos, type_to_delete="custom.tbl_orcamentoprodutos"
2. **TriggerCustomEvent** [bTukI] custom_event="bTupw"
3. **HideElement** [bTukJ] alvo El[pop add edita cotacao]

#### WF bTukN — ButtonClicked em El[btn adiciona fornecedor]
1. **DisplayGroupData** [bTukO] alvo El[pop add fornecedor] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTukP] alvo El[pop add fornecedor]

#### WF bTukT — InputChanged em El[dd tipofrete]
- condição: This:get_data:not_equals(Opt.TipoFrete.CIF Informado)
1. **ChangeThing** [bTukU] campos: cpo.ValorFrete = ∅ · to_change=Ancestor[TableCrossAxis]
2. **ScheduleAPIEvent** [bTukV] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTukZ — ButtonClicked em El[btn remove orcamentoproduto]
1. **DeleteListOfThings** [bTuka] to_delete=El[rpg fornecedoresprodutos]:get_list_data, type_to_delete="custom.tbl_orcamentfornecedores"
2. **MakeChangeCurrentUser** [bTukb] campos: cpo.TempOrcamentoProdutos = Ancestor[TableCrossAxis]
3. **DeleteThing** [bTukf] to_delete=Ancestor[TableCrossAxis]

#### WF bTukg — ButtonClicked em El[btn remove orcamento fornecedor]
1. **Plugin[1689356815386x980566006617866200]/AAC** [bTukh] 
2. **DeleteThing** [bTukl] to_delete=Ancestor[TableCrossAxis]

#### WF bTukm — ButtonClicked em El[btn gravarcotacao]
- props: event_color="blue"
1. **NewThing** [bTukn] tipo Tbl.Cotacao · campos: cpo.DataValidade = El[ip data validade]:get_data; cpo.CotacaoNum = Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1); cpo.CotacaoStatus = Opt.CotacaoStatus.Em andamento; cpo.QuaisProdutos = El[rpg produto orcamento]:get_list_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.EmpresaMegabox = El[rd empresa megabox]:get_data
2. **ChangeListOfThings** [bTukr] campos: cpo.QualCotacao = ResultOfStep[bTukn]; cpo.QualCliente = ResultOfStep[bTukn]:cpo.QualCliente · to_change=CurrentUser:cpo.TempOrcamentoProdutos, type_to_change="custom.tbl_orcamentoprodutos"
3. **ChangeListOfThings** [bTuks] campos: cpo.QualCotacao = ResultOfStep[bTukn] · to_change=CurrentUser:cpo.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
4. **TriggerCustomEvent** [bTukt] custom_event="bTupw"
5. **HideElement** [bTukx] alvo El[pop add edita cotacao]
6. **SetCustomState** [bTuky] alvo El[pop.AgendaEnderecos A] · custom_state="custom.var_recemcadastrado_"

#### WF bTukz — ButtonClicked em El[Icon P]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_true
1. **ChangeThing** [bTulD] campos: cpo.Vencedor = False · to_change=Ancestor[TableCrossAxis]

#### WF bTulE — ButtonClicked em El[Icon P]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_false
1. **ChangeThing** [bTulF] campos: cpo.Vencedor = False · to_change=El[rpg fornecedoresprodutos]:get_list_data:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element
2. **ChangeThing** [bTulJ] campos: cpo.Vencedor = True · to_change=Ancestor[TableCrossAxis]

#### WF bTulK — ButtonClicked em El[Text P]
1. **ToggleElement** [bTulL] alvo El[rpg fornecedoresprodutos]
2. **ToggleElement** [bTulP] alvo El[txt titulo icms]
3. **ToggleElement** [bTulQ] alvo El[txt titulo piscofins]

#### WF bTulR — InputChanged em El[ip valorvenda]
1. **PauseWFClient** [bTulV] length=1000
2. **ScheduleAPIEvent** [bTulW] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTumS — InputChanged em El[ip valorcomissao]
1. **PauseWFClient** [bTumT] length=1000
2. **ScheduleAPIEvent** [bTumX] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTumY — InputChanged em El[ip icms]
1. **PauseWFClient** [bTumZ] length=1000
2. **ScheduleAPIEvent** [bTumd] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTume — InputChanged em El[Input B]
1. **ChangeThing** [bTumf] campos: cpo.qtd = This:get_data · to_change=Ancestor[TableCrossAxis]
2. **ChangeListOfThings** [bTumj] campos: cpo.QtdVenda = This:get_data · to_change=Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
3. **ScheduleAPIEvent** [bTumk] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores

#### WF bTuml — ButtonClicked em El[Icon B]
1. **ToggleElement** [bTump] alvo El[rpg fornecedoresprodutos]
2. **ToggleElement** [bTumq] alvo El[txt titulo icms]
3. **ToggleElement** [bTumr] alvo El[txt titulo piscofins]

#### WF bTulX — InputChanged em El[ip piscofins]
1. **PauseWFClient** [bTulb] length=1000
2. **ScheduleAPIEvent** [bTulc] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTuld — InputChanged em El[ip valorfrete]
1. **PauseWFClient** [bTulh] 
2. **ScheduleAPIEvent** [bTuli] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTulj — ButtonClicked em El[btn proposta gravar]
- props: event_color="blue", workflow_disabled=True
1. **SetCustomState** [bTuln] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTulo] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTulp] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTulo]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTult] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTulo]
5. **ChangeThing** [bTulu] campos: cpo.QuaisPropostas = ResultOfStep[bTulo] · to_change=El[pop add edita propostas]:get_group_data
6. **Plugin[1648430145817x673906689668022300]/AAL** [bTulv] alvo El[PDF/IMG PROPOSTA] · AAM="corponovaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTulo]:cpo.PropostaNum}", AAf=False
7. **SetCustomState** [bTulz] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
8. **ResetGroup** [bTumA] alvo El[gp add edita proposta]

#### WF bTumB — ButtonClicked em El[Icon KZ]
1. **ShowElement** [bTumF] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTumG] alvo El[pop.AgendaContatos A] · data_source=El[pop add edita propostas]:get_group_data:cpo.QualCliente

#### WF bTumH — ButtonClicked em El[Icon LZ]
1. **ShowElement** [bTumL] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTumM] alvo El[pop.AgendaEnderecos A] · value=El[pop add edita propostas]:get_group_data:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTumN — ButtonClicked em El[Icon TZZ]
1. **ShowElement** [bTumR] alvo El[pop consulta icms]

#### WF bTunz — ButtonClicked em El[Icon IZ]
1. **Plugin[1659259586969x934092730321338400]/AAD** [bTuoD] 
2. **Plugin[1658328157117x953686184769617900]/AAT** [bTuoE] AAF="Valor de alíquota copiada", AAG=3000

#### WF bTuoF — ButtonClicked em El[btn proposta salvar]
- props: event_color="orange"
1. **SetCustomState** [bTuoJ] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTuoK] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTuoL] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTuoK]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTuoP] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTuoK]
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTuoQ] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTuoK]:cpo.PropostaNum}", AAf=False
6. **SetCustomState** [bTuoR] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
7. **ResetGroup** [bTuoV] alvo El[gp add edita proposta]

#### WF bTuoW — ButtonClicked em El[btn proposta salvarenviar]
- props: event_color="orange", workflow_disabled=False
1. **SetCustomState** [bTuoX] alvo El[pop add edita propostas] · value=True, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTuob] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.PropostaEnviada = True · to_change=Parent
3. **ChangeListOfThings** [bTuoc] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTuob]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTuod] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTuob]
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTuoh] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTuob]:cpo.PropostaNum}", AAf=False
6. **SetCustomState** [bTuoi] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
7. **ResetGroup** [bTuoj] alvo El[gp add edita proposta]

#### WF bTuon — ButtonClicked em El[Icon MZ]
1. **SetCustomState** [bTuoo] alvo El[pop add edita propostas] · value=Opt.Ações.Edita Proposta, custom_state="custom.var_acaocotacao_"
2. **DisplayGroupData** [bTuop] alvo El[gp add edita proposta] · data_source=Ancestor[TableCrossAxis]

#### WF bTuot — ButtonClicked em El[Button M]
1. **SetCustomState** [bTuou] alvo El[pop add edita propostas] · value=Opt.Ações.Nova Proposta, custom_state="custom.var_acaocotacao_"
2. **CopyListOfThings** [bTuov] to_copy=Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}), type_to_copy="custom.tbl_orcamentfornecedores"
3. **NewThing** [bTuoz] tipo Tbl.Propostas · campos: cpo.QuaisOrcamentosFornecedores = ResultOfStep[bTuov]; cpo.QualCotacao = Parent
4. **ChangeListOfThings** [bTupA] campos: cpo.QualProposta = ResultOfStep[bTuoz] · to_change=ResultOfStep[bTuov], type_to_change="custom.tbl_orcamentfornecedores"
5. **DisplayGroupData** [bTupB] alvo El[gp add edita proposta] · data_source=ResultOfStep[bTuoz]

#### WF bTupF — ButtonClicked em El[btn proposta cancelagravar]
1. **ChangeListOfThings** [bTupG] campos: cpo.QualProposta = ∅ · to_change=Parent:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
2. **DeleteThing** [bTupH] to_delete=Parent
3. **ResetGroup** [bTupL] alvo El[gp add edita proposta]
4. **SetCustomState** [bTupM] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"

#### WF bTupN — ButtonClicked em El[btn proposta cancelasalvar]
1. **ResetGroup** [bTupR] alvo El[gp add edita proposta]
2. **SetCustomState** [bTupS] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"

#### WF bTupT — ButtonClicked em El[Icon NZ]
1. **OpenURL** [bTupX] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.AquivoProposta}"

#### WF bTupY — ButtonClicked em El[gp card cotacao]
1. **ToggleElement** [bTupZ] alvo El[gp resumo cotacao]

#### WF bTumv — ButtonClicked em El[btn edita produto]
1. **DisplayGroupData** [bTumw] alvo El[gp add produto] · data_source=Ancestor[TableCrossAxis]
2. **SetCustomState** [bTumx] alvo El[Página vendas_bkp] · value=Opt.Ações.Edita Produto, custom_state="custom.var_a__oor_amento_"

#### WF bTunB — ButtonClicked em El[salvar produto]
1. **ChangeThing** [bTunC] campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data · to_change=Parent
2. **ChangeListOfThings** [bTunD] campos: cpo.QtdVenda = ResultOfStep[bTunC]:cpo.qtd · to_change=Parent:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
3. **ScheduleAPIEvent** [bTunH] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Parent:cpo.QuaisOrcamentosForncededores
4. **SetCustomState** [bTunI] alvo El[Página vendas_bkp] · value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"
5. **ResetGroup** [bTunJ] alvo El[gp add produto]

#### WF bTunN — ButtonClicked em El[add produto]
- condição: El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação)
- props: workflow_disabled=False
1. **NewThing** [bTunO] tipo Tbl.CotacaoProdutos · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualCotacao = El[pop add edita cotacao]:get_group_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data
2. **MakeChangeCurrentUser** [bTunP] campos: cpo.TempOrcamentoProdutos = ResultOfStep[bTunO]
3. **ResetGroup** [bTunT] alvo El[gp add produto]

#### WF bTunU — ButtonClicked em El[btn salvarcotacao]
- props: event_color="orange"
1. **ChangeThing** [bTunV] campos: cpo.DataValidade = El[ip data validade]:get_data; cpo.QuaisProdutos = CurrentUser:cpo.TempOrcamentoProdutos; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.EmpresaMegabox = El[rd empresa megabox]:get_data · to_change=El[pop add edita cotacao]:get_group_data
2. **TriggerCustomEvent** [bTunZ] custom_event="bTupw"
3. **ChangeListOfThings** [bTuna] campos: cpo.QualCotacao = El[pop add edita cotacao]:get_group_data · to_change=El[rpg produto orcamento]:get_list_data:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
4. **HideElement** [bTunb] alvo El[pop add edita cotacao]

#### WF bTunf — ButtonClicked em El[btn proposta gravarenviar]
- props: event_color="blue", workflow_disabled=False
1. **SetCustomState** [bTung] alvo El[pop add edita propostas] · value=True, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTunh] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.PropostaEnviada = True · to_change=Parent
3. **NewThing** [bTunl] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Proposta número {ResultOfStep[bTunh]:cpo.QualCotacao:cpo.CotacaoNum}/{ResultOfStep[bTunh]:cpo.PropostaNum} enviada ao cliente no email {ResultOfStep[bTunh]:cpo.EnviarPara:cpo.Email}")}"; cpo.QualCliente = ResultOfStep[bTunh]:cpo.QualCotacao:cpo.QualCliente; cpo.QualVendedor = CurrentUser
4. **ChangeThing** [bTunm] campos: cpo.UltimoHistoricoData = ResultOfStep[bTunl]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTunl] · to_change=ResultOfStep[bTunl]:cpo.QualCliente
5. **ChangeListOfThings** [bTunn] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTunh]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
6. **ChangeThing** [bTunr] campos: cpo.QuaisPropostas = ResultOfStep[bTunh] · to_change=El[pop add edita propostas]:get_group_data
7. **DisplayGroupData** [bTuns] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTunh]
8. **Plugin[1648430145817x673906689668022300]/AAL** [bTunt] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTunh]:cpo.PropostaNum}", AAf=False
9. **SetCustomState** [bTunx] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
10. **ResetGroup** [bTuny] alvo El[gp add edita proposta]

#### WF bTupd — ButtonClicked em El[btn edita orcamento]
1. **DisplayGroupData** [bTupe] alvo El[pop add edita cotacao] · data_source=Ancestor[TableCrossAxis]
2. **SetCustomState** [bTupf] alvo El[Página vendas_bkp] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTupj] alvo El[pop add edita cotacao]

#### WF bTupk — ButtonClicked em El[btn addedita proposta]
1. **SetCustomState** [bTupl] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
2. **DisplayGroupData** [bTupp] alvo El[pop add edita propostas] · data_source=Ancestor[TableCrossAxis]
3. **ShowElement** [bTupq] alvo El[pop add edita propostas]

#### WF bTupr — ButtonClicked em El[btn expandir cartoes]
- condição: UrlParam("expandircartoes" as text):equals("yes")
1. **ChangePage** [bTupv] alvo El[Current page] · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}no"}}, keep_current_page_params=True

#### WF bTupw — CustomEvent
- props: event_name="fechar pop cotacao", event_color="purple"
1. **SetCustomState** [bTupx] alvo El[Página vendas_bkp] · custom_state="custom.var_a__oor_amento_", custom_states_values={0={value=∅, custom_state="custom.var_a__ovendas_"}}
2. **ResetGroup** [bTuqB] alvo El[pop add edita cotacao]
3. **ResetGroup** [bTuqC] alvo El[pop add fornecedor]
4. **MakeChangeCurrentUser** [bTuqD] campos: cpo.TempOrcamentoProdutos = ∅

#### WF bTuqH — ButtonClicked em El[btn abrir todos]
- condição: El[Página vendas_bkp]:custom.var_todosfornecedores_:is_false
1. **SetCustomState** [bTuqI] alvo El[Página vendas_bkp] · value=True, custom_state="custom.var_todosfornecedores_"

#### WF bTuqJ — ButtonClicked em El[btn abrir todos]
- condição: El[Página vendas_bkp]:custom.var_todosfornecedores_:is_true
1. **SetCustomState** [bTuqN] alvo El[Página vendas_bkp] · value=False, custom_state="custom.var_todosfornecedores_"

#### WF bTuqO — CustomEvent
- props: event_name="Enviar Email Proposta", parameters={0={is_list=False, btype_id="custom.tbl_propostas", optional=False, param_id="bTaLh", param_name="par.QualProposta"}}, event_color="purple"
1. **ScheduleAPIEvent** [bTuqP] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{WFParam.par.QualProposta:cpo.EmailsCopia}", _wf_param_to="{WFParam.par.QualProposta:cpo.EnviarPara:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 5):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaProposta)}", _wf_param_body="{WFParam.par.QualProposta:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Orçamento: {Text("{WFParam.par.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{WFParam.par.QualProposta:cpo.PropostaNum}")} - Produtos: {Text("{WFParam.par.QualProposta:cpo.QuaisOrcamentosFornecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{WFParam.par.QualProposta:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}")}", _wf_param_atachments="{WFParam.par.QualProposta:cpo.AquivoProposta:url}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted

#### WF bTuqT — ButtonClicked em El[Icon OZZ]
1. **HideElement** [bTuqU] alvo El[pop add edita propostas]
2. **ResetGroup** [bTuqV] alvo El[pop add edita propostas]

#### WF bTuqZ — ButtonClicked em El[btn arquivar]
- condição: Parent:cpo.Arquivado:is_false
1. **ShowElement** [bTuqa] alvo El[pop.ArquivaCotação]
2. **DisplayGroupData** [bTuqb] alvo El[pop.ArquivaCotação] · data_source=Parent

#### WF bTuqf — ButtonClicked em El[btn cotacao arquivada]
- condição: UrlParam("cotacaoarquivada" as text):equals("no")
1. **ChangePage** [bTuqg] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="yes"}}, keep_current_page_params=True

#### WF bTuqh — ButtonClicked em El[btn cotacao arquivada]
- condição: UrlParam("cotacaoarquivada" as text):equals("yes")
1. **ChangePage** [bTuql] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="no"}}, keep_current_page_params=True

#### WF bTuqm — ButtonClicked em El[btn arquivar]
- condição: Parent:cpo.Arquivado:is_true
1. **ChangeThing** [bTuqn] campos: cpo.Arquivado = False; cpo.MotivoArquivamento = ∅ · to_change=Parent

#### WF bTuqr — ButtonClicked em El[btn data crescente]
- condição: UrlParam("ordemdecrescente" as text):equals("yes")
1. **ChangePage** [bTuqs] alvo El[Current page] · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}no"}}, keep_current_page_params=True

#### WF bTuqt — ButtonClicked em El[btn data crescente]
- condição: UrlParam("ordemdecrescente" as text):equals("no")
1. **ChangePage** [bTuqx] alvo El[Current page] · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTuqy — ButtonClicked em El[seleciona proposta]
- condição: El[pop add edita propostas]:custom.var_exibeproposta_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTuqz] alvo El[pop add edita propostas] · value=Opt.Ações.Exibe Proposta, custom_state="custom.var_acaocotacao_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_exibeproposta_"}}

#### WF bTurD — ButtonClicked em El[seleciona proposta]
- condição: El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTurE] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_", custom_states_values={0={custom_state="custom.var_exibeproposta_"}}

#### WF bTurF — ButtonClicked em El[Icon O] «btn criapedido»
- props: event_color="green"
1. **NewThing** [bTurJ] tipo Tbl.Pedido · campos: cpo.QuaisOrcamentosFonecedores = Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores; cpo.QualCotacao = Ancestor[TableCrossAxis]:cpo.QualCotacao; cpo.QualProposta = Ancestor[TableCrossAxis]; cpo.NumeroPedido = "{Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.CotacaoNum}"; cpo.QualCliente = Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.QualCliente; cpo.QualClienteTexto = "{Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor}"; cpo.InformacoesAdd = "{Ancestor[TableCrossAxis]:cpo.InfoAdicional}"; cpo.QualPrimeiroFornecedor = Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:first_element:cpo.QualEnderecoOrigem
2. **ChangeThing** [bTurK] campos: cpo.CotacaoEtapa = Opt.Etapas.Pedir; cpo.QualPedido = ResultOfStep[bTurJ] · to_change=Ancestor[TableCrossAxis]:cpo.QualCotacao
3. **DisplayGroupData** [bTurL] alvo El[pop add edita pedido] · data_source=ResultOfStep[bTurJ]
4. **SetCustomState** [bTurP] alvo El[pop add edita pedido] · value=Opt.Ações.Novo Pedido, custom_state="custom.var_acaocotacao_"
5. **ShowElement** [bTurQ] alvo El[pop add edita pedido]

#### WF bTurR — ButtonClicked em El[btn add entrega no pedido]
1. **NewThing** [bTurV] tipo Tbl.Entregas · campos: cpo.QualCotacao = Ancestor[TableCrossAxis]:cpo.QualCotacao; cpo.QualOrcamentoFornecedor = Ancestor[TableCrossAxis]; cpo.QualProposta = El[pop add edita pedido]:get_group_data:cpo.QualProposta; cpo.DataEntrega = El[pop add edita pedido]:get_group_data:cpo.QualProposta:cpo.DtPrevEntrega; cpo.QualPedido = El[pop add edita pedido]:get_group_data; cpo.NumeroPedido = "{El[pop add edita pedido]:get_group_data:cpo.NumeroPedido}"; cpo.DtPedido = El[pop add edita pedido]:get_group_data:Created Date; cpo.QualClienteTexto = "{El[pop add edita pedido]:get_group_data:cpo.QualCliente:cpo.NomeCliFor}"; cpo.QualFornecedTexto = "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor}"; cpo.QualVendedor = El[pop add edita pedido]:get_group_data:cpo.QualCotacao:Created By; cpo.QualCliente = El[pop add edita pedido]:get_group_data:cpo.QualCliente; cpo.QualFornecedor = Ancestor[TableCrossAxis]:cpo.QualFornecedor
2. **ChangeThing** [bTurW] campos: cpo.QuaisEntregas = ResultOfStep[bTurV] · to_change=ResultOfStep[bTurV]:cpo.QualPedido
3. **ChangeThing** [bTurX] campos: cpo.QuaisEntregas = ResultOfStep[bTurV] · to_change=Ancestor[TableCrossAxis]

#### WF bTurb — InputChanged em El[ipt entrega qtd]
1. **ScheduleAPIEvent** [bTurc] date=Page.Current Date/Time, api_event="bTbPH", _wf_param_par^{p1}QualEntrega=Ancestor[TableCrossAxis]
2. **ResetGroup** [bTurd] alvo El[gp corpo pedidoemail fornecedor]

#### WF bTurh — ButtonClicked em El[btn edita pedido]
1. **DisplayGroupData** [bTuri] alvo El[pop add edita pedido] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTurj] alvo El[pop add edita pedido]
3. **SetCustomState** [bTurn] alvo El[pop add edita pedido] · value=Opt.Ações.Edita Pedido, custom_state="custom.var_acaocotacao_"

#### WF bTuro — ButtonClicked em El[gp card pedido]
1. **ToggleElement** [bTurp] alvo El[rpg show produtos pedido]

#### WF bTurt — ButtonClicked em El[btn pedido gravar]
- condição: El[chk formalizar]:get_not_data
- props: event_color="blue"
1. **ChangeThing** [bTuru] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.FormaPagto = El[dd formapagto]:get_data · to_change=Parent
2. **HideElement** [bTurv] alvo El[pop add edita pedido]
3. **ResetGroup** [bTurz] alvo El[pop add edita pedido]

#### WF bTusA — ButtonClicked em El[btn pedido salvar]
- condição: El[chk formalizar]:get_not_data
- props: event_color="orange"
1. **ChangeThing** [bTusB] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.FormaPagto = El[dd formapagto]:get_data · to_change=Parent
2. **HideElement** [bTusF] alvo El[pop add edita pedido]
3. **ResetGroup** [bTusG] alvo El[pop add edita pedido]

#### WF bTusH — ButtonClicked em El[btn pedido salvar]
- condição: El[chk formalizar]:get_data
- props: event_color="orange", workflow_disabled=False
1. **ShowElement** [bTusL] alvo El[gp alert gravando]
2. **ScrollToElement** [bTusM] alvo El[gp alert gravando] · offset=-100
3. **ChangeThing** [bTusN] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PedidoFormalizado = True; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data · to_change=Parent
4. **ChangeListOfThings** [bTusR] campos: cpo.StatusEntrega = Opt.Etapas.Pedido · to_change=ResultOfStep[bTusN]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTusS] alvo El[old PDF/IMG PEDIDO] · AAM="corpopedido", AAO=800, AAP=1100, AAQ="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:find_replace(find=" "):to_uppercase}_PEDIDO{Parent:cpo.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}", AAf=False
6. **ResetInputs** [bTusT] 

#### WF bTusX — ButtonClicked em El[Icon XZ]
1. **ShowElement** [bTusY] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTusZ] alvo El[pop.AgendaContatos A] · data_source=El[rpg pedido OrçFornecedores]:get_list_data:cpo.QualFornecedor:first_element

#### WF bTusd — ButtonClicked em El[chk entrega pra deletar]
- condição: El[pop add edita pedido]:custom.var_deletarentregas_:not_contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTuse] alvo El[pop add edita pedido] · value=El[pop add edita pedido]:custom.var_deletarentregas_:plus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_deletarentregas_"

#### WF bTusf — ButtonClicked em El[chk entrega pra deletar]
- condição: El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTusj] alvo El[pop add edita pedido] · value=El[pop add edita pedido]:custom.var_deletarentregas_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_deletarentregas_"

#### WF bTusk — ButtonClicked em El[Icon VZZ]
1. **DeleteListOfThings** [bTusl] to_delete=El[pop add edita pedido]:custom.var_deletarentregas_, type_to_delete="custom.tbl_entregas"
2. **SetCustomState** [bTusp] alvo El[pop add edita pedido] · custom_state="custom.var_deletarentregas_"

#### WF bTusq — ButtonClicked em El[btn edita pedido]
1. **DisplayGroupData** [bTusr] alvo El[pop add edita pedido] · data_source=Parent:cpo.QualPedido
2. **ShowElement** [bTusv] alvo El[pop add edita pedido]
3. **SetCustomState** [bTusw] alvo El[pop add edita pedido] · value=Opt.Ações.Edita Pedido, custom_state="custom.var_acaocotacao_"

#### WF bTusx — ButtonClicked em El[Text BZZZZZZZ]
1. **OpenURL** [bTutB] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTutC — ButtonClicked em El[force calc]
- props: event_color="purple"
1. **ScheduleAPIEvent** [bTutD] date=Page.Current Date/Time, api_event="bTbPH", _wf_param_par^{p1}QualEntrega=Ancestor[TableCrossAxis]
2. **ResetGroup** [bTutH] alvo El[gp corpo pedidoemail fornecedor]

#### WF bTutI — ButtonClicked em El[btn confirmaentrega]
- props: event_color="purple"
1. **ChangeThing** [bTutJ] campos: cpo.dtentrega = El[dt dataentrega realizada]:get_data; cpo.ComprovanteEntrega = "{El[upf comprovanteentrega realizada]:get_data}"; cpo.StatusEntrega = Opt.Etapas.Financeiro · to_change=Parent
2. **ScheduleAPIEvent** [bTutN] date=Page.Current Date/Time, api_event="bToYh", _wf_param_DtEntrega=ResultOfStep[bTutJ]:cpo.dtentrega, _wf_param_QualEntrega=ResultOfStep[bTutJ]
3. **HideElement** [bTutO] alvo El[pop confirma entrega]
4. **ResetGroup** [bTutP] alvo El[pop confirma entrega]

#### WF bTutT — ButtonClicked em El[btn cencela confirmaentrega]
- condição: Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Financeiro)
1. **HideElement** [bTutU] alvo El[pop confirma entrega]
2. **ResetGroup** [bTutV] alvo El[pop confirma entrega]
3. **DeleteListOfThings** [bTutZ] to_delete=Parent:cpo.QuaisContasReceber, type_to_delete="custom.tbl_contasreceber"

#### WF bTutx — ButtonClicked em El[ico proposta]
1. **DisplayGroupData** [bTuty] alvo El[pop confirma entrega] · data_source=Parent
2. **ShowElement** [bTutz] alvo El[pop confirma entrega]

#### WF bTuuD — ButtonClicked em El[Icon YZ]
1. **ShowElement** [bTuuE] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTuuF] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.QualCotacao:cpo.QualCliente

#### WF bTuuJ — PopupOpened em El[pop add edita cotacao]
- condição: El[Página vendas_bkp]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação):and_(CurrentUser:cpo.TempOrcamentoProdutos:count:greater_or_equal_than(1))
1. **DeleteListOfThings** [bTuuK] to_delete=CurrentUser:cpo.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores, type_to_delete="custom.tbl_orcamentfornecedores"
2. **DeleteListOfThings** [bTuuL] to_delete=CurrentUser:cpo.TempOrcamentoProdutos, type_to_delete="custom.tbl_orcamentoprodutos"

#### WF bTuuP — ButtonClicked em El[Icon JZ]
1. **ShowElement** [bTuuQ] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTuuR] alvo El[pop.AgendaEnderecos A] · value=Parent:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTuta — ButtonClicked em El[btn pedido fecharjanela]
1. **ResetGroup** [bTutb] alvo El[pop add edita pedido]
2. **HideElement** [bTutf] alvo El[pop add edita pedido]

#### WF bTutg — ButtonClicked em El[btn pedido cancelargravar]
- props: event_color="green"
1. **ResetGroup** [bTuth] alvo El[pop add edita pedido]
2. **HideElement** [bTutl] alvo El[pop add edita pedido]
3. **ChangeThing** [bTutm] campos: cpo.CotacaoEtapa = Opt.Etapas.Cotação; cpo.QualPedido = ∅ · to_change=Parent:cpo.QualCotacao
4. **DeleteThing** [bTutn] to_delete=Parent

#### WF bTutr — ButtonClicked em El[btn pedido cancelarsalvar]
1. **ResetGroup** [bTuts] alvo El[pop add edita pedido]
2. **HideElement** [bTutt] alvo El[pop add edita pedido]

#### WF bTuuV — ButtonClicked em El[sort distance]
- condição: El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_false
1. **SetCustomState** [bTuuW] alvo El[pop add fornecedor] · value=True, custom_state="custom.var_distanciamaiormenor_"
2. **Plugin[1685525155901x838124401560125400]/AAC** [bTuuX] AAD="distancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTuub — PopupOpened em El[pop add fornecedor]
1. **Plugin[1685525155901x838124401560125400]/AAC** [bTuuc] AAD="kmdistancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTuud — ButtonClicked em El[sort distance]
- condição: El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_true
1. **SetCustomState** [bTuuh] alvo El[pop add fornecedor] · value=False, custom_state="custom.var_distanciamaiormenor_"
2. **Plugin[1685525155901x838124401560125400]/AAC** [bTuui] AAD="distancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTuuj — ButtonClicked em El[btn fecar add fornecedores]
1. **HideElement** [bTuun] alvo El[pop add fornecedor]

#### WF bTuuo — ButtonClicked em El[Icon PZ]
1. **ShowElement** [bTuup] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTuut] alvo El[pop.AgendaEnderecos A] · value=El[ipt buscacliente]:get_data, custom_state="custom.var_qualgrupoclifor_"

#### WF bTuuu — ButtonClicked em El[btn cancelanetrega]
- condição: Ancestor[TableCrossAxis]:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado)
1. **SetCustomState** [bTuuv] alvo El[pop cancelar entrega e pedido] · value=Ancestor[TableCrossAxis], custom_state="custom.var_qualentrega_", custom_states_values={0={value=Ancestor[TableCrossAxis]:cpo.QualPedido, custom_state="custom.var_qualpedido_"}, 1={value=Opt.Ações.Cancela Entrega, custom_state="custom.var_a__ocancelamento_"}}
2. **ShowElement** [bTuuz] alvo El[pop cancelar entrega e pedido]

#### WF bTuvA — ButtonClicked em El[btn pedido gravar]
- condição: El[chk formalizar]:get_data
- props: event_color="blue", workflow_disabled=False
1. **ShowElement** [bTuvB] alvo El[gp alert gravando]
2. **ScrollToElement** [bTuvF] alvo El[gp alert gravando] · offset=-100
3. **ChangeThing** [bTuvG] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PedidoFormalizado = True; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data · to_change=Parent
4. **ChangeListOfThings** [bTuvH] campos: cpo.StatusEntrega = Opt.Etapas.Pedido · to_change=ResultOfStep[bTuvG]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTuvL] alvo El[old PDF/IMG PEDIDO] · AAM="corpopedido", AAO=800, AAP=1100, AAQ="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:find_replace(find=" "):to_uppercase}_PEDIDO{Parent:cpo.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}", AAf=False
6. **ResetInputs** [bTuvM] 
7. **NewThing** [bTuvN] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Pedido número {ResultOfStep[bTuvG]:cpo.NumeroPedido} enviado ao cliente no email {ResultOfStep[bTuvG]:cpo.EmailCliente:cpo.Email}")}"; cpo.QualCliente = ResultOfStep[bTuvG]:cpo.QualCliente; cpo.QualVendedor = CurrentUser
8. **ChangeThing** [bTuvR] campos: cpo.UltimoHistoricoData = ResultOfStep[bTuvN]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTuvN] · to_change=ResultOfStep[bTuvN]:cpo.QualCliente

#### WF bTuvS — ButtonClicked em El[Button P]
1. **ChangeListOfThings** [bTuvT] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="equals"}}), type_to_change="custom.tbl_entregas"
2. **ChangeThing** [bTuvX] campos: cpo.PedidoFinalizado = True · to_change=Parent
3. **ResetGroup** [bTuvY] alvo El[pop add edita pedido]
4. **HideElement** [bTuvZ] alvo El[pop add edita pedido]

#### WF bTuvd — ButtonClicked em El[chk filtrafinanceiro]
- condição: UrlParam("filtrafinanceiro" as custom.tbl_pedidos):not_equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTuve] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrafinanceiro", value="{Parent:cpo.QualPedido:_id}"}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtraentrega", value="{∅}"}}, keep_current_page_params=True

#### WF bTuvf — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):not_equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTuvj] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value="{Parent:cpo.QualPedido:_id}"}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTuvk — ButtonClicked em El[chk filtrapedido]
- condição: UrlParam("filtrapedido" as custom.tbl_pedidos):not_equals(Ancestor[TableCrossAxis])
- props: event_color="brown"
1. **ChangePage** [bTuvl] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrapedido", value="{Parent:_id}"}, 1={key="filtraentrega", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTuvp — ButtonClicked em El[chk filtrapedido]
- condição: UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])
- props: event_color="brown"
1. **ChangePage** [bTuvq] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrapedido", value=""}, 1={key="filtraentrega", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTuvr — ButtonClicked em El[chk filtrafinanceiro]
- condição: UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTuvv] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrafinanceiro", value=""}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtraentrega", value="{∅}"}}, keep_current_page_params=True

#### WF bTuvw — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTuvx] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value=""}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTuwB — ButtonClicked em El[btn proposta editacotacao]
1. **DisplayGroupData** [bTuwC] alvo El[pop add edita cotacao] · data_source=Parent
2. **SetCustomState** [bTuwD] alvo El[Página vendas_bkp] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTuwH] alvo El[pop add edita cotacao]

#### WF bTuwI — ButtonClicked em El[btn proposta editacotacao]
1. **DisplayGroupData** [bTuwJ] alvo El[pop add edita cotacao] · data_source=El[pop add edita propostas]:get_group_data
2. **SetCustomState** [bTuwN] alvo El[Página vendas_bkp] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTuwO] alvo El[pop add edita cotacao]

#### WF bTuxK — InputChanged em El[ipt filter numpedido]
1. **ChangePage** [bTuxL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numeropedido", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTuxP — ButtonClicked em El[Icon Q]
1. **ResetGroup** [bTuxQ] alvo El[gp filter numpedido]
2. **ChangePage** [bTuxR] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numeropedido", value="{∅}"}}, keep_current_page_params=True

#### WF bTuxV — ButtonClicked em El[Icon R]
1. **OpenURL** [bTuxW] open_in_new_tab=True, url="{Parent:cpo.OrdemCompraArquivo}"

#### WF bTuxX — ButtonClicked em El[Icon S]
1. **ResetGroup** [bTuxb] alvo El[gp filtercidade fornecedores]

#### WF bTuwP — ButtonClicked em El[Button L]
- condição: El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega)
- props: event_color="red"
1. **ChangeThing** [bTuwT] campos: cpo.StatusEntrega = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[Input EZ]:get_data}"; cpo.QtdEntrega = 0 · to_change=El[pop cancelar entrega e pedido]:custom.var_qualentrega_
2. **ScheduleAPIEvent** [bTuwU] SÓ SE El[chk informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTuwV] SÓ SE El[chk informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ResetInputs** [bTuwZ] 
5. **HideElement** [bTuwa] alvo El[pop cancelar entrega e pedido]

#### WF bTuwb — ButtonClicked em El[Icon T]
1. **HideElement** [bTuwf] alvo El[pop cancelar entrega e pedido]

#### WF bTuwg — ButtonClicked em El[hide dados do pedido]
1. **ToggleElement** [bTuwh] alvo El[dados do pedido]

#### WF bTuwl — ButtonClicked em El[Icon WZ]
1. **ShowElement** [bTuwm] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTuwn] alvo El[pop.AgendaEnderecos A] · value=Parent:cpo.QualCotacao:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTuwr — ButtonClicked em El[Button L]
- condição: El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido)
- props: event_color="red"
1. **ChangeThing** [bTuws] campos: cpo.QualEtapa = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[Input EZ]:get_data}" · to_change=El[pop cancelar entrega e pedido]:custom.var_qualpedido_
2. **ScheduleAPIEvent** [bTuwt] SÓ SE El[chk informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTuwx] SÓ SE El[chk informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ChangeListOfThings** [bTuwy] campos: cpo.MotivoCancelamento = "{ResultOfStep[bTuws]:cpo.MotivoCancelamento}"; cpo.StatusEntrega = Opt.Etapas.Cancelado · to_change=ResultOfStep[bTuws]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **ResetInputs** [bTuwz] 
6. **HideElement** [bTuxD] alvo El[pop cancelar entrega e pedido]

#### WF bTuxE — ButtonClicked em El[ico cancela pedido]
1. **SetCustomState** [bTuxF] alvo El[pop cancelar entrega e pedido] · value=Opt.Ações.Cancela Pedido, custom_state="custom.var_a__ocancelamento_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualpedido_"}, 1={value=∅, custom_state="custom.var_qualentrega_"}}
2. **ShowElement** [bTuxJ] alvo El[pop cancelar entrega e pedido]

#### WF bTuxc — ButtonClicked em El[Icon V]
1. **ResetGroup** [bTuxd] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTuxh] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Cliente, custom_state="custom.var_a__oclifor_"
3. **ShowElement** [bTuxi] alvo El[pop.AgendaEnderecos A]

#### WF bTuxj — ButtonClicked em El[Icon HZ]
1. **DisplayGroupData** [bTuxn] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor
2. **ShowElement** [bTuxo] alvo El[pop.AgendaContatos A]

#### WF bTuxp — ButtonClicked em El[Icon GZ]
1. **DisplayGroupData** [bTuxt] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.QualCliente

#### WF bTuxu — ButtonClicked em El[Icon X]
1. **ScheduleAPIEvent** [bTuxv] date=Page.Current Date/Time, api_event="bTfDZ", _wf_param_Qtd=El[dd qtd parcelas receber]:get_data:count, _wf_param_Fila=1, _wf_param_Prazos=El[dd qtd parcelas receber]:get_data, _wf_param_DtEntrega=El[dt dataentrega realizada]:get_data, _wf_param_QualEntrega=Parent

#### WF bTuxz — InputChanged em El[dd prazo a vencer]
1. **ChangeThing** [bTuyA] campos: cpo.DataVencimento = Page.Current Date/Time:plus_days(This:get_data:diasprazonumero) · to_change=Ancestor[TableCrossAxis]

#### WF bTuyB — ButtonClicked em El[Icon W]
1. **DeleteThing** [bTuyF] to_delete=Ancestor[TableCrossAxis]

#### WF bTuyG — ButtonClicked em El[btn cencela confirmaentrega]
- condição: Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)
1. **HideElement** [bTuyH] alvo El[pop confirma entrega]
2. **ResetGroup** [bTuyL] alvo El[pop confirma entrega]

#### WF bTuyM — ButtonClicked em El[Icon AZZ]
1. **ShowElement** [bTuyN] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTuyR] alvo El[pop.AgendaEnderecos A] · value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"

#### WF bTuyS — ButtonClicked em El[Icon BZZ]
1. **OpenURL** [bTuyT] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.Localizacaoo:google_map_link}"

#### WF bTuyX — ButtonClicked em El[Icon CZZ]
1. **ResetGroup** [bTuyY] alvo El[gp filternome fornecedores]

#### WF bTuyZ — ButtonClicked em El[Icon DZZ]
1. **ResetGroup** [bTuyd] alvo El[gp filterUF fornecedores]

#### WF bTuye — ButtonClicked em El[edita produto]
1. **ShowElement** [bTuyf] alvo El[pop.CadastroProdutos A]
2. **DisplayGroupData** [bTuyj] alvo El[pop.CadastroProdutos A] · data_source=El[dd add modelo produto]:get_data

#### WF bTuyk — ButtonClicked em El[abre cadastro produtos]
1. **ShowElement** [bTuyl] alvo El[pop.CadastroProdutos A]

#### WF bTvCZ — ButtonClicked em El[btn pedidosconcluidos]
- condição: UrlParam("pedidosconcluidos" as text):equals("yes")
1. **ChangePage** [bTvCa] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}no"}, 1={key="etapaentrega", value="{∅}Em Entrega"}}, keep_current_page_params=True

#### WF bTuyp — ButtonClicked em El[btn novofornecedor]
1. **ResetGroup** [bTuyq] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTuyr] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Fornecedor, custom_state="custom.var_a__oclifor_"
3. **ShowElement** [bTuyv] alvo El[pop.AgendaEnderecos A]

#### WF bTuyw — InputChanged em El[ip valorvenda]
1. **PauseWFClient** [bTuyx] length=1000
2. **ScheduleAPIEvent** [bTuzB] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTuzC — InputChanged em El[ip valorcomissao]
1. **PauseWFClient** [bTuzD] length=1000
2. **ScheduleAPIEvent** [bTuzH] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTuzI — InputChanged em El[dd tipofrete]
- condição: This:get_data:not_equals(Opt.TipoFrete.CIF Informado)
1. **ChangeThing** [bTuzJ] campos: cpo.ValorFrete = ∅ · to_change=Ancestor[TableCrossAxis]
2. **ScheduleAPIEvent** [bTuzN] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTuzO — InputChanged em El[ip valorfrete]
1. **PauseWFClient** [bTuzP] 
2. **ScheduleAPIEvent** [bTuzT] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTuzU — InputChanged em El[ip piscofins]
1. **PauseWFClient** [bTuzV] length=1000
2. **ScheduleAPIEvent** [bTuzZ] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTuza — ButtonClicked em El[Icon BZZZ]
1. **ShowElement** [bTuzb] alvo El[pop consulta icms]

#### WF bTuzf — InputChanged em El[ip icms]
1. **PauseWFClient** [bTuzg] length=1000
2. **ScheduleAPIEvent** [bTuzh] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTuzl — ButtonClicked em El[Icon HZZ]
1. **HideElement** [bTuzm] alvo El[pop edita produtos do pedido]

#### WF bTuzn — ButtonClicked em El[Icon FZZ]
- props: workflow_disabled=False
1. **DisplayGroupData** [bTuzr] alvo El[pop edita produtos do pedido] · data_source=El[pop add edita pedido]:get_group_data
2. **ShowElement** [bTuzs] alvo El[pop edita produtos do pedido]

#### WF bTuzt — ButtonClicked em El[btn expandir cartoes]
- condição: UrlParam("expandircartoes" as text):equals("no")
1. **ChangePage** [bTuzx] alvo El[Current page] · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTuzy — ButtonClicked em El[btn pedidosconcluidos]
- condição: UrlParam("pedidosconcluidos" as text):equals("no")
1. **ChangePage** [bTuzz] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}yes"}, 1={key="etapaentrega", value="{∅}Financeiro"}}, keep_current_page_params=True

#### WF bTvAD — ButtonClicked em El[btn entregascanceladas]
- condição: UrlParam("etapapedido" as option.opt_etapas):display:equals("Pedido")
1. **ChangePage** [bTvAE] alvo El[Current page] · add_parameters=True, url_parameters={0={key="etapapedido", value="{Opt.Etapas.Cancelado:display}"}, 1={key="etapaentrega", value="{Opt.Etapas.Cancelado:display}"}}, keep_current_page_params=True

#### WF bTvAF — ButtonClicked em El[btn entregascanceladas]
- condição: UrlParam("etapapedido" as option.opt_etapas):display:equals("Cancelado")
1. **ChangePage** [bTvAJ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="etapapedido", value="Pedido"}, 1={key="etapaentrega", value="{∅}Em Entrega"}}, keep_current_page_params=True

#### WF bTvCb — ButtonClicked em El[Icon FZ]
1. **ResetGroup** [bTvCf] alvo El[gp filterID fornecedores]

#### WF bTvCg — ButtonClicked em El[gp card entrega]
1. **ToggleElement** [bTvCh] alvo El[gp detalhes entrega]

#### WF bTvCl — ButtonClicked em El[gp card financeio]
1. **ToggleElement** [bTvCm] alvo El[rpg show contasreceber]

#### WF bTvCn — Plugin[1648430145817x673906689668022300]/AAY em El[old PDF/IMG PEDIDO] «PDF/IMG PEDIDO Element Saved»
- props: event_color="cyan", workflow_disabled=False
1. **ChangeThing** [bTvCr] campos: cpo.PedidoArquivo = "{This:get_AAb}" · to_change=Parent
2. **ScheduleAPIEvent** [bTvCs] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailFornecedorCC}", _wf_param_to="{Parent:cpo.EmailFornecedor:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 7):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaPedido)}", _wf_param_body="{Parent:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")}", _wf_param_atachments="{Text("{Parent:cpo.PedidoArquivo:url}⏎")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTvCt] date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailClienteCC}", _wf_param_to="{Parent:cpo.EmailCliente:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 6):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaPedido)}", _wf_param_body="{Parent:cpo.CorpoEmailCliente}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}")}", _wf_param_atachments="{Text("{Parent:cpo.PedidoArquivo:url}⏎{Parent:cpo.OrdemCompraArquivo:url}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **HideElement** [bTvCx] alvo El[pop add edita pedido]
5. **SetCustomState** [bTvCy] alvo El[Página vendas_bkp] · value=False, custom_state="custom.var_showalert_"
6. **HideElement** [bTvCz] alvo El[gp alert gravando]

#### WF bTvDD — ButtonClicked em El[Link A]
1. **Plugin[1583324666271x739637822593433600]/AAJ** [bTvDE] AAK="{Parent:cpo.PedidoArquivo}", AAL="linkpedido", AAM=False

#### WF bTvDF — ButtonClicked em El[btn reenviar proposta]
- props: workflow_disabled=False
1. **TriggerCustomEvent** [bTvDJ] arguments={0={param_id="bTaLh", arg_value=Parent}}, custom_event="bTuqO"
2. **Plugin[1658328157117x953686184769617900]/AAT** [bTvDK] AAF="Proposta re-enviada com sucesso", AAJ="var(--color_primary_default)"

#### WF bTvAK — ButtonClicked em El[Icon H]
1. **ChangePage** [bTvAL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTvAP — Plugin[1648823245313x509054419018711040]/AAd em El[RangePicker A]
1. **MakeChangeCurrentUser** [bTvAQ] campos: cpo.UltimoDateRange = This:get_AAF
2. **ChangePage** [bTvAR] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min}"}, 1={key="datafim", value="{This:get_AAF:max}"}}, keep_current_page_params=True

#### WF bTvAV — InputChanged em El[dd filter vendedor]
1. **ChangePage** [bTvAW] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTvAX — ButtonClicked em El[Icon EZZ]
1. **ResetGroup** [bTvAb] alvo El[gp filtervendedor]
2. **ChangePage** [bTvAc] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTvAd — ButtonClicked em El[Button BZ]
1. **ShowElement** [bTvAh] alvo El[pop.AddEdita Produtos A]
2. **SetCustomState** [bTvAi] alvo El[pop.AddEdita Produtos A] · value=Parent, custom_state="custom.var_qualpedido_"

#### WF bTvAj — ButtonClicked em El[Icon IZZ]
1. **DeleteThing** [bTvAn] to_delete=Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto
2. **DeleteThing** [bTvAo] to_delete=Ancestor[TableCrossAxis]

#### WF bTvAp — ButtonClicked em El[Icon JZZ]
1. **DisplayGroupData** [bTvAt] alvo El[pop.AddEdita Produtos A] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTvAu] alvo El[pop.AddEdita Produtos A]

#### WF bTvAv — InputChanged em El[ipt filter cliente]
1. **ChangePage** [bTvAz] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTvBA — ButtonClicked em El[Icon EZZZ]
1. **ResetGroup** [bTvBB] alvo El[gp filter cliente]
2. **ChangePage** [bTvBF] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{∅}"}}, keep_current_page_params=True

#### WF bTvBG — ButtonClicked em El[Icon DZZZ]
1. **OpenURL** [bTvBH] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTvBL — ButtonClicked em El[Icon FZZZ]
1. **OpenURL** [bTvBM] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(1):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(1)}"
2. **OpenURL** [bTvBN] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(2):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(2)}"
3. **OpenURL** [bTvBR] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(3):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(3)}"
4. **OpenURL** [bTvBS] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(4):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(4)}"

#### WF bTvBT — ButtonClicked em El[Text ZZZZZZZZZ]
1. **ChangePage** [bTvBX] alvo El[Página financeiro] · open_in_new_tab=True, add_parameters=True, url_parameters={0={key="datainicio", value="{UrlParam("datainicio" as date)}"}, 1={key="datafim", value="{UrlParam("datafim" as date)}"}, 2={key="statusfinanceiro", value="{Opt.StatusFinanceiro.A receber:display}"}, 3={key="vendedor", value="{UrlParam("vendedor" as user):_id}"}, 4={key="cliente", value="{UrlParam("cliente" as custom.tbl_clientes):_id}"}, 5={key="numpedido", value="{UrlParam("numeropedido" as number)}"}, 6={key="dtfiltro", value="{Opt.TiposData.Data vencimento:display}"}}

#### WF bTvBY — ButtonClicked em El[Icon GZZZ]
1. **ChangePage** [bTvBZ] alvo El[Página financeiro] · open_in_new_tab=True, add_parameters=True, url_parameters={0={key="numpedido", value="{Parent:cpo.NumeroPedido}"}, 1={key="datainicio", value="{UrlParam("datainicio" as date)}"}, 2={key="dtafim", value="{UrlParam("datafim" as date)}"}}

#### WF bTvBd — ButtonClicked em El[Icon HZZZ]
1. **OpenURL** [bTvBe] open_in_new_tab=True, url="{El[dd end destino]:get_data:cpo.Localizacaoo:google_map_link}"

#### WF bTvBf — ButtonClicked em El[Button CZ]
1. **ChangeThing** [bTvBj] campos: cpo.Arquivado = True; cpo.MotivoArquivamento = El[dd selecione o motivo]:get_data · to_change=Parent
2. **HideElement** [bTvBk] alvo El[pop.ArquivaCotação]

#### WF bTvBl — ButtonClicked em El[btn retira pedido]
1. **ShowElement** [bTvBp] alvo El[pop.ArquivaCotação]
2. **DisplayGroupData** [bTvBq] alvo El[pop.ArquivaCotação] · data_source=Parent

#### WF bTvBr — ButtonClicked em El[btn retira pedido]
1. **ChangeListOfThings** [bTvBv] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QualPedido:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
2. **ChangeThing** [bTvBw] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QualPedido
3. **ResetGroup** [bTvBx] alvo El[pop add edita pedido]
4. **HideElement** [bTvCB] alvo El[pop add edita pedido]

#### WF bTvCC — ButtonClicked em El[btn proposta gravar]
- props: event_color="blue", workflow_disabled=False
1. **SetCustomState** [bTvCD] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTvCH] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTvCI] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTvCH]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTvCJ] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTvCH]
5. **ChangeThing** [bTvCN] campos: cpo.QuaisPropostas = ResultOfStep[bTvCH] · to_change=El[pop add edita propostas]:get_group_data
6. **Plugin[1648430145817x673906689668022300]/AAL** [bTvCO] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTvCH]:cpo.PropostaNum}", AAf=False
7. **SetCustomState** [bTvCP] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
8. **ResetGroup** [bTvCT] alvo El[gp add edita proposta]

#### WF bTvCU — ButtonClicked em El[Icon M]
1. **ScheduleAPIEvent** [bTvCV] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTvDL — Plugin[1648430145817x673906689668022300]/AAY em El[PDF/IMG PROPOSTA]
- props: event_color="purple", workflow_disabled=False
1. **ChangeThing** [bTvDP] campos: cpo.AquivoProposta = "{This:get_AAb}" · to_change=El[gp proposta a anexar]:get_group_data
2. **ScheduleAPIEvent** [bTvDQ] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailsCopia}", _wf_param_to="{Parent:cpo.EnviarPara:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 5):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaProposta)}", _wf_param_body="{Parent:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[MegaBox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Orçamento: {Text("{Parent:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.PropostaNum}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFornecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_atachments="{Parent:cpo.AquivoProposta:url}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
