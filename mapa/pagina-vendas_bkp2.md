# Pagina: `vendas_bkp2` (bTyBj)

Estados customizados: `var_showalert_` : boolean; `var_a__ovendas_` : Opt.Ações; `var_usaroldpdf_` : boolean; `var_a__oor_amento_` : Opt.Ações; `var_todosetapacotacao_` : boolean; `var_todosfornecedores_` : boolean

Resumo: 1269 elementos · 160 workflows · 371 ações · 369 condicionais · 16 estados customizados
Elementos por tipo: Text 344, TableCell 234, Group 229, TableMainAxis 115, Icon 88, Input 62, TableCrossAxis 43, Button 34, Dropdown 22, Table 21, Image 17, CustomElement 12, Popup 10, MultiLineInput 7, PictureInput 6, DateInput 5, AutocompleteDropdown 3, RepeatingGroup 2, FileInput 2, select2-MultiDropdown 2, Plugin[1680110374647x249108010620944400]/AAC 2, Plugin[1648430145817x673906689668022300]/AAc 2, HTML 2, Plugin[1648823245313x509054419018711040]/AAC 1, Plugin[1753875729878x276985643861016580]/AAC 1, RadioButtons 1, Link 1, Checkbox 1

## Árvore de elementos

- **Popup** `pop.ArquivaCotação` (bTyxl) — props: group_type="custom.tbl_orcamento", vertical_centering=True
  - **Text** `Text CZZZZZZZZZ` (bTyyD) — text: "Arquivando Cotação" · props: font_alignment="center"
  - **Group** `Group MZZZZZZ` (bTyxp) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Group** `Group MZZZZZZ` (bTyxx) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Image** `Image Q` (bTyyB) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
        - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
    - **Group** `Group MZZZZZZ` (bTyxq) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - **Text** `Text BZZZZZZZZZ` (bTyxr) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}- Nº {Parent:cpo.CotacaoNum}"
      - **Text** `Text BZZZZZZZZZ` (bTyxv) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
      - **Text** `Text BZZZZZZZZZ` (bTyxw) — text: "[b]Dt Cotação[/b]: {Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
  - **Dropdown** `dd selecione o motivo` (bTyyC) — data_source: All(Opt.MotivoArquivamento):sorted(descending=False, sort_field="display") · placeholder: "Selecione o motivo" · props: mandatory=True, default=Parent:cpo.MotivoArquivamento, vertical_centering=True, dynamic_type="option.opt_motivoarquivamento", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Button** `Button CZ` (bTyyH) — text: "Arquivar" · props: icon="material outlined archive", icon_size=18, button_type="label_icon"
- **Group** `gp content` (bTyov) — props: vertical_centering=True
  - **Group** `gp tabs` (bTynp) — props: vertical_centering=True
    - **Group** `Group XZZZZZ` (bTynu) — props: vertical_centering=True
      - **Text** `Text QZZZZZZZZ` (bTynv) — text: "Data criação (Cotação e Pedido)"
      - **Group** `gp filter datapedido` (bTynz)
        - **Plugin[1648823245313x509054419018711040]/AAC** `RangePicker A` (bTyoB) — props: padding_horizontal=6, padding_vertical=15, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAH="DD/MM/YY", AAM=2, AAN=2, AAP="Aplicar", AAQ="Cancelar", AAR=False, AAS=False, AAf="DD/MM/YYYY - DD/MM/YYYY"
          - ⟂ quando This:is_hovered → 
        - **Icon** `Icon H` (bTyoA) — props: icon="material two-tone event_repeat", vertical_centering=True
    - **Group** `Group BZZZZZZ` (bTyoZ) — props: vertical_centering=True
      - **Text** `Text RZZZZZZZZ` (bTyod) — text: "Vendedor"
      - **Group** `gp filtervendedor` (bTyoe)
        - **Dropdown** `dd filter vendedor` (bTyof) — data_source: Search(User; sort cpo.NomeModelo) · placeholder: "Vendedor" · props: default=UrlParam("vendedor" as user), vertical_centering=True, dynamic_type="user", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
          - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) → default=CurrentUser, disabled=True
        - **Icon** `Icon EZZ` (bTyoj) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[dd filter vendedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group YZZZZZ` (bTyoF) — props: vertical_centering=True
      - **Text** `Text SZZZZZZZZ` (bTyoG) — text: "Número pedido"
      - **Group** `gp filter numpedido` (bTyoH)
        - **Input** `ipt filter numpedido` (bTyoL) — placeholder: "Número pedido" · content: "{UrlParam("numeropedido" as None)}" · props: placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `Icon Q` (bTyoM) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[ipt filter numpedido]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group IZZZZZZ` (bTyok) — props: vertical_centering=True
      - **Text** `Text XZZZZZZZZ` (bTyol) — text: "Cliente"
      - **Group** `gp filter cliente` (bTyop)
        - **AutocompleteDropdown** `ipt filter cliente` (bTyoq) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Nome Cliente" · props: default=UrlParam("cliente" as custom.tbl_clientes), field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `Icon EZZZ` (bTyor) — props: icon="material outlined close", vertical_centering=True
          - ⟂ quando El[ipt filter cliente]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group AZZZZZZ` (bTyoN) — props: vertical_centering=True
      - **Button** `btn cotacao arquivada` (bTyoR) — text: "cotações arquivadas" · props: icon="material outlined archive", icon_size=18, button_type="label_icon", title_attribute="Exibe cotações arquivadas: {UrlParam("cotacaoarquivada" as boolean)}"
        - ⟂ quando UrlParam("cotacaoarquivada" as boolean):is_true → icon="material filled archive", font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn data crescente` (bTyoS) — text: "data crescente" · props: icon="fa fa-sort-numeric-asc", icon_size=14, button_type="label_icon", title_attribute="Ordem +novo pro +antigo: {UrlParam("ordemdecrescente" as boolean)}"
        - ⟂ quando UrlParam("ordemdecrescente" as boolean):is_false → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn expandir cartoes` (bTyoT) — text: "expandir cartões" · props: icon="fa fa-angle-double-down", icon_size=16, button_type="label_icon", title_attribute="Expande todos cartões"
        - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn pedidosconcluidos` (bTyoX) — text: "exibe concluídos" · props: icon="fa fa-flag-checkered", icon_size=16, button_type="label_icon", title_attribute="Exibe pedidos concluidos"
        - ⟂ quando UrlParam("pedidosconcluidos" as boolean):is_true → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
      - **Button** `btn entregascanceladas` (bTyoY) — text: "exibe cancelados" · props: icon="material outlined event_busy", icon_size=16, button_type="label_icon", title_attribute="Exibe pedidos e entregas canceladas"
        - ⟂ quando UrlParam("etapapedido" as option.opt_etapas):display:equals("Cancelado") → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)"
    - **Button** `btn nova cotação` (bTynt) — text: "Cotação" · props: icon="fa fa-plus", vertical_centering=True, icon_size=16, button_type="label_icon"
  - **Table** `Table etapas` (bTyno) — data_source: All(Opt.Etapas) · props: group_type="option.opt_etapas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=4, horizontal_separator_style="none"
    - **TableCrossAxis** `TableCrossAxis J` (bTyml) — props: axis_index=2, cross_axis_repeat=True, fixed_number_repeating_axis=True
      - **TableCell** `Cell LZZZ` (bTyiN) — props: cell_main_axis_id="bTymm"
        - **Table** `rpg cardscotacao` (bTyiR) — data_source: Search(Tbl.Cotacao: cpo.CotacaoEtapa equals Opt.Etapas.Cotação AND cpo.Arquivado equals UrlParam("cotacaoarquivada" as boolean) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.CotacaoNum equals UrlParam("numeropedido" as number) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_orcamento", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis AZZ` (bTyiS) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis K` (bTyiT) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell QZZZ` (bTyiX) — props: cell_main_axis_id="bTyiS"
              - **Group** `gp card cotacao` (bTyiY) — props: vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → bgcolor="var(--color_bTHGh_default)"
                - **Group** `Group RZ` (bTyiZ) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group CZZZZZZ` (bTyix) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image N` (bTyjB) — props: src="{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group SZ` (bTyid) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text PZZZZ` (bTyie) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}- Nº {Ancestor[TableCrossAxis]:cpo.CotacaoNum}"
                    - **Text** `Text QZZZZ` (bTyif) — text: "[b]Vendedor[/b]: {Ancestor[TableCrossAxis]:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text ZZ` (bTyij) — text: "[b]Dt Cotação[/b]: {Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                    - **Group** `Group Tbl.Cotacao` (bTyik) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → is_visible=True
                      - **Button** `btn retira pedido` (bTyil) — text: "{Parent:cpo.MotivoArquivamento:display}" · props: icon="ionic outlined archive", font_alignment="left", icon_size=16, button_type="label_icon", title_attribute="retira o pedido da lista após entregas feitas e/ou canceladas"
                        - ⟂ quando Parent:cpo.MotivoArquivamento:is_empty → text="{∅}Motivo não disponível"
                  - **Group** `Group ZZ` (bTyip) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `btn edita orcamento` (bTyiw) — props: icon="material outlined edit", title_attribute="Editar cotação"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true:and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                    - **Group** `btn addedita proposta` (bTyiq) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → button_disabled=True
                      - ⟂ quando El[ipt cartão contaproduto]:get_data:greater_or_equal_than(1):and_(El[ipt cartao contavencedor]:get_data:greater_or_equal_than(1)) → is_visible=True
                      - **Icon** `ico proposta` (bTyir) — props: icon="material filled receipt", title_attribute="Propostas dessa cotação: {Ancestor[TableCrossAxis]:cpo.QuaisPropostas:count}"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → icon_color="var(--color_bTHGl_default)"
                      - **Text** `Text UZZZZ` (bTyiv) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisPropostas:count}" · props: font_alignment="center"
                - **Group** `gp resumo cotacao` (bTyjC) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Group** `Group UZ` (bTyjD) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica fornecedores` (bTyjI) — props: icon="fa fa-shopping-cart", vertical_centering=True, title_attribute="Qtd de fornecedores dessa cotação"
                    - **Text** `Text RZZZZ` (bTyjH) — text: "{Parent:cpo.QuaisProdutos:count}  produtos no carrinho"
                  - **Group** `Group VZ` (bTyjJ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica vencedor` (bTyjO) — props: icon="fa fa-trophy", vertical_centering=True
                    - **Text** `Text SZZZZ` (bTyjN) — text: "{Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count}  produtos possuem vencedores"
                  - **Group** `Group WZ` (bTyjP) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Icon** `indica vencedor` (bTyjV) — props: icon="fa fa-file-text", vertical_centering=True
                    - **Text** `Text TZZZZ` (bTyjU) — text: "{Parent:cpo.QuaisPropostas:count} propostas enviadas"
                    - **Icon** `btn arquivar` (bTyjT) — props: icon="material filled archive", title_attribute="Arquivar cotação"
                      - ⟂ quando Parent:cpo.Arquivado:is_true → icon="material filled unarchive", icon_color="var(--color_bTHGs_default)", title_attribute="Desarquivar cotação{∅}"
                - **Input** `ipt cartão contaproduto` (bTyjZ) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisProdutos:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                - **Input** `ipt cartao contavencedor` (bTyja) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
          - **TableCrossAxis** `TableCrossAxis K` (bTyjb) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell QZZZ` (bTyjf) — props: cell_main_axis_id="bTyiS"
      - **TableCell** `Cell LZZZ` (bTyjg) — props: cell_main_axis_id="bTymn"
        - **Table** `rpg cardspedidos` (bTyjh) — data_source: Search(Tbl.Pedido: cpo.PedidoFinalizado equals UrlParam("pedidosconcluidos" as boolean) AND _id {'type': 'Empty'} UrlParam("filtrafinanceiro" as custom.tbl_pedidos):_id AND _id {'type': 'Empty'} UrlParam("filtraentrega" as custom.tbl_pedidos):_id AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualEtapa equals UrlParam("etapapedido" as option.opt_etapas) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_pedidos", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis KZZ` (bTyjl) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis P` (bTyjm) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell HZZZZ` (bTyjn) — props: cell_main_axis_id="bTyjl"
              - **Group** `gp card pedido` (bTyjr) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:equals(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count)) → bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                - ⟂ quando UrlParam("filtrapedido" as None):equals(Ancestor[TableCrossAxis]:_id):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])) → boxshadow_spread=2
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEtapa:equals(Opt.Etapas.Cancelado) → bgcolor="rgba(var(--color_destructive_default_rgb), 0.05)"
                - **Icon** `chk filtrapedido` (bTyki) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
                  - ⟂ quando UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Parent)) → is_visible=False
                - **Group** `Group RZZ` (bTyjs) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group DZZZZZZ` (bTykW) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image K` (bTykX) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group RZZ` (bTyjt) — data_source: Ancestor[TableCrossAxis]:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTyjy) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:cpo.NumeroPedido}" · props: vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTyjx) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text TZZZZZZZZ` (bTyjz) — text: "[b]Dt Pedido[/b]: {Parent:cpo.QualPedido:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                    - **Text** `Text DZZZZZZZZZ` (bTykL) — oculto ao carregar · text: "[b]Cancelado[/b]: {Ancestor[TableCrossAxis]:cpo.MotivoCancelamento}" · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEtapa:equals(Opt.Etapas.Cancelado) → is_visible=True
                    - **Group** `Group CZZZZZ` (bTykD) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(El[ipt cartao contaentregas]:get_data:equals(El[ipt cartão entragasconcluidas]:get_data)) → is_visible=True
                      - **Input** `ipt cartao contaentregas` (bTykF) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                      - **Input** `ipt cartão entragasconcluidas` (bTykE) — oculto ao carregar · content: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
                      - **Text** `Text WZZZZZZ` (bTykK) — text: "Entregas concluidas"
                      - **Button** `btn retira pedido` (bTykJ) — text: "retira pedido" · props: icon="material outlined playlist_remove", icon_size=22, button_type="label_icon", title_attribute="retira o pedido da lista após entregas feitas e/ou canceladas"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.PedidoFinalizado:is_true → is_visible=False
                  - **Group** `Group RZZ` (bTykP) — props: vertical_centering=True
                    - **Icon** `Icon fa fa-star-o` (bTykV) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Text("Os valores desse pedido foram alterados pelo financeiro pelo seguinte motivo: {Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores}")}"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores:is_not_empty → is_visible=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteraValores:is_empty → is_visible=False
                    - **Icon** `btn edita pedido` (bTykQ) — props: icon="material outlined edit", title_attribute="editar pedido"
                    - **Icon** `ico cancela pedido` (bTykR) — props: icon="material outlined event_busy", title_attribute="cancelar todo o pedido e entregas"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:equals(Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                - **RepeatingGroup** `rpg show produtos pedido` (bTykb) — oculto ao carregar · data_source: Parent:cpo.QuaisEntregas · props: group_type="custom.tbl_entregas", separator_style="none", fixed_rows=False, cell_min_height_css="25px"
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Group** `Group RZZ` (bTykc) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Text** `indica vencedor` (bTykh) — text: "{Parent:cpo.QtdEntrega}" · props: font_alignment="center", vertical_centering=True
                    - **Text** `Text EZZZZZZ` (bTykd) — text: "{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                      - ⟂ quando Parent:cpo.SaiuEntrega:is_true:and_(Parent:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → text="{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - NF: {Parent:cpo.NumNfFornecedor}", font_color="var(--color_bTHHX_default)", font_weight="600"
                      - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - NF: {Parent:cpo.NumNfFornecedor}", font_color="var(--color_bTHHQ_default)", font_weight="600"
          - **TableCrossAxis** `TableCrossAxis P` (bTykj) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell HZZZZ` (bTykn) — props: cell_main_axis_id="bTyjl"
      - **TableCell** `Cell LZZZ` (bTyko) — props: cell_main_axis_id="bTymr"
        - **Table** `rpg cardsentregas` (bTykp) — data_source: Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DtPedido gte UrlParam("datainicio" as date) AND cpo.DtPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty) · props: group_type="custom.tbl_entregas", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes") → data_source=Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.dtentrega gte UrlParam("datainicio" as date) AND cpo.dtentrega lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualVendedor equals UrlParam("vendedor" as user); sort Created Date desc, ignore empty)
          - **TableMainAxis** `TableMainAxis NZZ` (bTykt) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis R` (bTyku) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell LZZZZ` (bTykv) — props: cell_main_axis_id="bTykt"
              - **Group** `gp card entrega` (bTykz) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → bgcolor="rgba(var(--color_destructive_default_rgb), 0.05)"
                - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → boxshadow_spread=2
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → bgcolor="var(--color_bTHHW_default)"
                - **Icon** `chk filtraentrega` (bTylf) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido) → icon="material outlined check_box"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:cpo.QualPedido)) → is_visible=False
                - **Group** `Group OZZZ` (bTylA) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - **Group** `Group EZZZZZZ` (bTylX) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Image** `Image L` (bTylY) — props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group OZZZ` (bTylB) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text UZZZZZZ` (bTylF) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:cpo.NumeroPedido} - NF: {Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: vertical_centering=True
                    - **Text** `Text UZZZZZZ` (bTylG) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text UZZZZZZZZ` (bTylH) — text: "[b]Dt Pedido[/b]: {Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                      - ⟂ quando UrlParam("pedidosconcluidos" as None):equals("yes") → text="[b]Dt Entrega:[/b] {Ancestor[TableCrossAxis]:cpo.dtentrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
                    - **Text** `Text EZZZZZZZZZ` (bTylL) — oculto ao carregar · text: "[b]Cancelado[/b]: {Ancestor[TableCrossAxis]:cpo.MotivoCancelamento}" · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → is_visible=True
                  - **Group** `Group OZZZ` (bTylM) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                    - **Icon** `Icon fa fa-star-o` (bTylT) — props: icon="fa fa-info-circle", vertical_centering=True, title_attribute="{Text("Os valores desse pedido foram alterados pelo financeiro pelo seguinte motivo: {Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores}")}"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_not_empty → is_visible=True
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.MotivoAlteracaoValores:is_empty → is_visible=False
                    - **Icon** `btn edita pedido` (bTylN) — props: icon="material outlined edit", title_attribute="edita pedido"
                      - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                    - **Group** `Group PZZZ` (bTylR) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
                      - ⟂ quando This:is_hovered → boxshadow_blur=2
                      - **Image** `ico proposta` (bTylS) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268292968x358240139627571200/truck-ramp-box-solid%20blue.svg"
                        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268301221x827639874525786900/truck-ramp-box-solid%20grey.svg", button_disabled=True
                        - ⟂ quando Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1)) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733268301221x827639874525786900/truck-ramp-box-solid%20grey.svg", button_disabled=True
                - **Group** `gp detalhes entrega` (bTylZ) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_entregas", vertical_centering=True
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Text** `indica vencedor` (bTyle) — text: "{Parent:cpo.QtdEntrega}" · props: font_alignment="center", vertical_centering=True
                  - **Text** `Text UZZZZZZ` (bTyld) — text: "{Parent:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
          - **TableCrossAxis** `TableCrossAxis R` (bTylj) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell LZZZZ` (bTylk) — props: cell_main_axis_id="bTykt"
      - **TableCell** `Cell NZZZ` (bTyll) — props: cell_main_axis_id="bTynK"
        - **Table** `rpg cardsfinanceiro` (bTylp) — data_source: Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}" AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_qualentrega_custom_tbl_entregas", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="sum", message="cpo_valorcomissao_number"}}) · props: group_type="struct.eyJjYXB0aW9uIjoiR3JvdXBpbmciLCJkZWZpbml0aW9uIjp7Imdyb3VwaW5nMCI6WyJjcG8uUXVhbEVudHJlZ2EiLCJjdXN0b20udGJsX2VudHJlZ2FzIl0sImFnZzAiOlsic3VtIG9mIGNwby5WYWxvckNvbWlzc2FvIiwibnVtYmVyIl19fQ==", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis SZZ` (bTylq) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis T` (bTylr) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell TZZZZ` (bTylv) — props: cell_main_axis_id="bTylq"
              - **Group** `gp card financeio` (bTylw) — data_source: Ancestor[TableCrossAxis]:grouping0 · props: group_type="custom.tbl_entregas", vertical_centering=True
                - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido):or_(UrlParam("filtraentregas" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)):or_(UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)) → boxshadow_spread=2
                - **Icon** `chk filtrafinanceiro` (bTymU) — props: icon="material outlined check_box_outline_blank"
                  - ⟂ quando UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido):or_(UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)) → is_visible=False
                  - ⟂ quando UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido) → icon="material outlined check_box"
                - **Group** `Group YZZZ` (bTylx) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
                  - **Group** `Group FZZZZZZ` (bTymP) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Image** `Image M` (bTymT) — props: src="{Parent:cpo.QualCliente:cpo.Foto}"
                      - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  - **Group** `Group YZZZ` (bTymB) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
                    - **Text** `Text LZZZZZZZ` (bTymC) — text: "{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words} - Nº {Ancestor[TableCrossAxis]:grouping0:cpo.NumeroPedido} - NF: {Ancestor[TableCrossAxis]:grouping0:cpo.NumNfFornecedor}" · props: vertical_centering=True
                    - **Text** `Text LZZZZZZZ` (bTymD) — text: "[b]Vendedor[/b]: {Parent:Created By:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}" · props: vertical_centering=True
                    - **Text** `Text VZZZZZZZZ` (bTymH) — text: "[b]Dt Pedido[/b]: {Parent:cpo.QualPedido:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=True
                  - **Group** `Group YZZZ` (bTymI) — props: vertical_centering=True
                    - **Icon** `btn edita pedido` (bTymO) — props: icon="material outlined edit", title_attribute="edita contas a receber"
                    - **Group** `btn entregafeita` (bTymJ) — props: vertical_centering=True
                      - **Icon** `ico proposta` (bTymN) — props: icon="material filled request_quote", title_attribute="Propostas dessa cotação: "
                - **RepeatingGroup** `rpg show contasreceber` (bTymV) — oculto ao carregar · data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", separator_style="none", fixed_rows=False, cell_min_height_css="25px"
                  - ⟂ quando UrlParam("expandircartoes" as boolean):is_true → is_visible=True
                  - **Group** `Group SZZZZZ` (bTymZ) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
                    - **Text** `indica vencedor` (bTymf) — text: "{Parent:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", vertical_centering=True
                      - ⟂ quando Parent:cpo.DataVencimento:less_than(Page.Current Date/Time):and_(Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.A receber)) → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
                      - ⟂ quando Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → border_color="var(--color_bTHHX_default)", font_color="var(--color_bTHHX_default)"
                    - **Text** `Text OZZZZZZZZ` (bTymb) — text: "{Parent:cpo.DataVencimento:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {Parent:cpo.QualOrcamentoFornecedor:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}"
                      - ⟂ quando Parent:cpo.DataVencimento:less_than(Page.Current Date/Time):and_(Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.A receber)) → font_color="var(--color_bTHHQ_default)"
                      - ⟂ quando Parent:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → font_color="var(--color_bTHHX_default)"
                    - **Icon** `Icon GZZZ` (bTyma) — props: icon="material outlined open_in_new", vertical_centering=True
                      - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → is_visible=False
          - **TableCrossAxis** `TableCrossAxis T` (bTymg) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell TZZZZ` (bTymh) — props: cell_main_axis_id="bTylq"
    - **TableMainAxis** `TableMainAxis XZ` (bTymm) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis XZ` (bTymn) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis XZ` (bTymr) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis J` (bTyms) — props: axis_index=0
      - **TableCell** `Cell LZZZ` (bTymt) — props: cell_main_axis_id="bTymm"
        - **Text** `Text KZZZZ` (bTymx) — text: "Cotação"
      - **TableCell** `Cell LZZZ` (bTymy) — props: cell_main_axis_id="bTymn"
        - **Text** `Text LZZZZ` (bTymz) — text: "Pedido"
      - **TableCell** `Cell LZZZ` (bTynD) — props: cell_main_axis_id="bTymr"
        - **Text** `Text MZZZZ` (bTynE) — text: "Entrega"
      - **TableCell** `Cell MZZZ` (bTynF) — props: cell_main_axis_id="bTynK"
        - **Text** `Text NZZZZ` (bTynJ) — text: "Financeiro"
    - **TableMainAxis** `TableMainAxis YZ` (bTynK) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis L` (bTynL) — props: axis_index=1
      - **TableCell** `Cell RZZZ` (bTynP) — props: cell_main_axis_id="bTymm"
        - **Text** `Text XZZZZ` (bTynQ) — text: "{Search(Tbl.Cotacao: cpo.CotacaoEtapa equals Opt.Etapas.Cotação AND Created By equals El[dd filter vendedor]:get_data AND cpo.Arquivado equals UrlParam("cotacaoarquivada" as boolean); sort Created Date desc, ignore empty):count} cotações {∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTynR) — props: cell_main_axis_id="bTymn"
        - **Text** `Text XZZZZZZ` (bTynV) — text: "{Search(Tbl.Pedido: Created By equals UrlParam("vendedor" as user) AND cpo.PedidoFinalizado equals UrlParam("pedidosconcluidos" as boolean) AND _id {'type': 'Empty'} UrlParam("filtrafinanceiro" as custom.tbl_pedidos):_id AND _id {'type': 'Empty'} UrlParam("filtraentrega" as custom.tbl_pedidos):_id AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as None)}" AND cpo.QualEtapa equals UrlParam("etapapedido" as option.opt_etapas) AND Created Date gte UrlParam("datainicio" as date) AND Created Date lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):count} pedidos{∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTynW) — props: cell_main_axis_id="bTymr"
        - **Text** `Text PZZZZZZZZ` (bTynX) — oculto ao carregar · text: "Total Faturado: ⏎{Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date); sort Created Date desc, ignore empty):cpo.ValorVendaLiquido:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}{∅}{∅}" · props: font_alignment="center"
        - **Text** `Text FZZZZZZZZZ` (bTynb) — oculto ao carregar · text: " {Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.DtPedido gte UrlParam("datainicio" as date) AND cpo.DtPedido lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes); sort Created Date desc, ignore empty):count} Entregas{∅}{∅}" · props: font_alignment="center"
        - **Text** `Text GZZZZZZZZZ` (bTync) — oculto ao carregar · text: "Total Comissão: ⏎{Search(Tbl.Entregas: cpo.SaiuEntrega equals True AND cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualPedido equals UrlParam("filtrafinanceiro" as custom.tbl_pedidos) AND Created By equals UrlParam("vendedor" as user) AND cpo.StatusEntrega equals UrlParam("etapaentrega" as option.opt_etapas) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date); sort Created Date desc, ignore empty):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}{∅}{∅}" · props: font_alignment="center"
      - **TableCell** `Cell RZZZ` (bTynd) — props: cell_main_axis_id="bTynK"
        - **Text** `Text G` (bTynh) — text: "{∅}"
        - **Text** `Text H` (bTyni) — text: "Total Faturado: ⏎{Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}"; sort Created Date desc, ignore empty):cpo.ValorTotal:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
        - **Text** `Text I` (bTynj) — text: "Total comissão: ⏎{Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}"; sort Created Date desc, ignore empty):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
        - **Text** `Text ZZZZZZZZZ` (bTynn) — text: "Total Vencidos: ⏎R$ {Search(Tbl.ContasReceber: cpo.QualPedido equals UrlParam("filtrapedido" as custom.tbl_pedidos) AND cpo.QualEntrega equals UrlParam("filtraentrega" as custom.tbl_entregas) AND Created By equals UrlParam("vendedor" as user) AND cpo.NumeroPedido equals "{UrlParam("numeropedido" as number)}" AND cpo.DataVencimento gte UrlParam("datainicio" as date) AND cpo.DataVencimento lte UrlParam("datafim" as date) AND cpo.StatusFinanceiro equals Opt.StatusFinanceiro.A receber; ignore empty):cpo.valorcomissao:sum:format_number(formatting_type="number", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
          - ⟂ quando CurrentUser:cpo.QualPerfil:not_equals(Opt.PerfilUsuario.Diretor) → is_visible=False
- **CustomElement** `pop.CadastroClienteFornecedor A` (bTyuj) — USA Reusable pop.CadastroCliFor · props: custom_id="bTgrH"
- **Popup** `pop edita produtos do pedido` (bTyuk) — props: group_type="custom.tbl_pedidos", vertical_centering=True
  - **Group** `Group JZZZZZ` (bTyxd) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Text** `Text CZZZZZZZZ` (bTyxe) — text: "Edita Produtos" · props: font_alignment="center"
    - **Icon** `Icon HZZ` (bTyxf) — props: icon="material outlined close", vertical_centering=True
  - **Button** `Button BZ` (bTyxj) — text: "Novo Produto" · props: vertical_centering=True
  - **Table** `rpg fornecedoresprodutos` (bTyul) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
    - **TableMainAxis** `TableMainAxis VZ` (bTyup) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis VZ` (bTyuq) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis VZ` (bTyur) — props: axis_index=4
    - **TableCrossAxis** `TableCrossAxis U` (bTyuv) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell Z` (bTyuw) — props: cell_main_axis_id="bTyup"
        - **Text** `Text FZZZZ` (bTyux) — text: "Produto"
      - **TableCell** `Cell Z` (bTyvB) — props: cell_main_axis_id="bTyuq"
        - **Text** `Text GZZZZ` (bTyvC) — text: "Qtd"
      - **TableCell** `Cell Z` (bTyvD) — props: cell_main_axis_id="bTyur"
        - **Text** `Text HZZZZ` (bTyvH) — text: "Valor Comiss"
      - **TableCell** `Cell Z` (bTyvI) — props: cell_main_axis_id="bTyxL"
        - **Text** `Text OZZZZ` (bTyvJ) — text: "Tipo Frete"
      - **TableCell** `Cell Z` (bTyvN) — props: cell_main_axis_id="bTyxM"
        - **Text** `Text NZZZZZZZ` (bTyvO) — text: "Valor Frete"
      - **TableCell** `Cell Z` (bTyvP) — props: cell_main_axis_id="bTyxN"
        - **Text** `Text QZZZZZZZ` (bTyvT) — text: "Aliq. ICMS" · props: font_alignment="center"
        - **Text** `Text XZZZZZZZ` (bTyvU) — text: "Aliq. PISCOFINS" · props: font_alignment="center"
        - **Text** `Text YZZZZZZZ` (bTyvV) — text: "Total Tributos" · props: font_alignment="center"
      - **TableCell** `Cell Z` (bTyvZ) — props: cell_main_axis_id="bTyxR"
        - **Text** `Text OZZZZZZZ` (bTyva) — text: "Total Bruto"
      - **TableCell** `Cell Z` (bTyvb) — props: cell_main_axis_id="bTyxS"
        - **Text** `Text AZZZZZZZZ` (bTyvf) — text: "Comiss Bruto"
      - **TableCell** `Cell OZZZZ` (bTyvl) — props: cell_main_axis_id="bTyxX"
      - **TableCell** `Cell WZZZZ` (bTyvm) — props: cell_main_axis_id="bTyxY"
      - **TableCell** `Cell Z` (bTyvn) — props: cell_main_axis_id="bTyxZ"
        - **Text** `Text ZZZZZZZZ` (bTyvr) — text: "Total Liq"
      - **TableCell** `Cell HZZZ` (bTyvg) — props: cell_main_axis_id="bTyxT"
        - **Text** `Text BZZZZZZZZ` (bTyvh) — text: "Valor Unit"
    - **TableCrossAxis** `TableCrossAxis U` (bTyvs) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell Z` (bTyvt) — props: cell_main_axis_id="bTyup"
        - **Group** `Group SZZZZZZ` (bTyvy) — props: vertical_centering=True
          - **Text** `Text DZZZZ` (bTyvz) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
          - **Text** `Text DZZZZ` (bTywD) — text: "{Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Condicao:display}"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:is_empty → text="{∅}Falta regime tributário"
          - **Text** `Text WZZZZZZZZ` (bTywE) — oculto ao carregar · text: "Esse produto possui entrega(s) lançadas e não pode ser editado"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=True
        - **Icon** `Icon M` (bTyvx) — props: icon="material outlined calculate", vertical_centering=True, title_attribute="recalcula valores do pedido"
      - **TableCell** `Cell Z` (bTywF) — props: cell_main_axis_id="bTyuq"
        - **Input** `ip valorvenda` (bTywJ) — placeholder: "000" · auto_binding: True · content_format: "int_number" · props: font_alignment="center", word_spacing=-0.5, unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_qtdvenda_number"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTywK) — props: cell_main_axis_id="bTyur"
        - **Input** `ip valorcomissao` (bTywL) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTywP) — props: cell_main_axis_id="bTyxL"
        - **Dropdown** `dd tipofrete` (bTywQ) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, default=Opt.TipoFrete.FOB, font_alignment="center", word_spacing=-0.5, bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTywR) — props: cell_main_axis_id="bTyxM"
        - **Input** `ip valorfrete` (bTywV) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando El[dd tipofrete]:get_data:not_equals(Opt.TipoFrete.CIF Informado) → content=0, bgcolor="var(--color_bTHGh_default)", disabled=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **TableCell** `Cell Z` (bTywW) — props: cell_main_axis_id="bTyxN"
        - **Group** `Group IZZZZZ` (bTywc) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
          - **Input** `ip icms` (bTywh) — placeholder: "ICMS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
            - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → content=Search(Tbl.IcmsEstados):filtered(constraints={0={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoDestino:cpo.UF:equals(InjectedValue:cpo.Destino:display), constraint_type=∅}, 1={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoOrigem:cpo.UF:equals(InjectedValue:cpo.Origem:display), constraint_type=∅}}):first_element:cpo.AliquotaIcms
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
          - **Icon** `Icon BZZZ` (bTywd) — props: icon="material outlined search"
        - **Input** `ip piscofins` (bTywb) — placeholder: "PIS/COFINS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", word_spacing=-0.5, bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=True, border_roundness_left=0
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
        - **Input** `ipt calculotributo` (bTywX) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS:plus(Ancestor[TableCrossAxis]:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell Z` (bTywi) — props: cell_main_axis_id="bTyxR"
        - **Input** `ip totalbruto` (bTywj) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell Z` (bTywn) — props: cell_main_axis_id="bTyxS"
        - **Input** `ip totalcomissao` (bTywo) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell PZZZZ` (bTywu) — props: cell_main_axis_id="bTyxX"
        - **Icon** `Icon IZZ` (bTywv) — props: icon="material outlined delete", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=False
        - **Group** `Group HZZZZZZ` (bTywz) — oculto ao carregar · props: vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → is_visible=True
          - **Image** `ico proposta` (bTyxA) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1736191361739x755453739650058900/entrega%20concluida.svg"
      - **TableCell** `Cell QZZZZ` (bTyxB) — props: cell_main_axis_id="bTyxY"
        - **Icon** `Icon JZZ` (bTyxF) — props: icon="material outlined edit", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}Esse produto possui entrega(s) lançadas e não pode ser editado"
      - **TableCell** `Cell Z` (bTyxG) — props: cell_main_axis_id="bTyxZ"
        - **Input** `ip totalliquido` (bTyxH) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → disabled=True
      - **TableCell** `Cell IZZZ` (bTywp) — props: cell_main_axis_id="bTyxT"
        - **Input** `ip valorvenda` (bTywt) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", word_spacing=-0.5, unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", always_show_decimals=True
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:greater_or_equal_than(1) → bgcolor="var(--color_bTHGh_default)", disabled=True
    - **TableMainAxis** `TableMainAxis VZ` (bTyxL) — props: axis_index=5
    - **TableMainAxis** `TableMainAxis VZ` (bTyxM) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis VZ` (bTyxN) — props: axis_index=7
    - **TableMainAxis** `TableMainAxis VZ` (bTyxR) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis VZ` (bTyxS) — props: axis_index=10
    - **TableMainAxis** `TableMainAxis QZZ` (bTyxX) — props: axis_index=11
    - **TableMainAxis** `TableMainAxis UZZ` (bTyxY) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis VZ` (bTyxZ) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis ZZ` (bTyxT) — props: axis_index=3
- **CustomElement** `pop.AddEdita Produtos A` (bTyxk) — USA Reusable pop.AddEdita Produtos · props: custom_id="bTiZh"
- **CustomElement** `pop.CadastroProdutos A` (bTyuf) — USA Reusable pop.CadastroProdutos · props: custom_id="bTgZS"
- **CustomElement** `tool.Historico A` (bTyud) — USA Reusable tool.Historico · oculto ao carregar · props: custom_id="bTdrv", floating_reference_horizontal_resp="right"
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_false → is_visible=False
- **CustomElement** `tool.DashMenu A` (bTyue) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **Popup** `pop confirma entrega` (bTyrN) — props: group_type="custom.tbl_entregas", vertical_centering=True
  - **Group** `Group YZZZZ` (bTysr) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Text** `Text IZZZZZZZ` (bTyss) — text: "Confirma entrega"
    - **Text** `Text YZZZZZZ` (bTyst) — text: "Nota Núm: {Parent:cpo.NumNfFornecedor}" · props: font_alignment="right"
  - **Group** `Group ZZZZZ` (bTysx) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Text** `Text UZZZZZZZ` (bTyuZ) — text: "Dados da Entrega"
    - **Group** `gp qual grupo clifor` (bTysy) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **PictureInput** `upi novocliente logo` (bTysz) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
        - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `Group VZZZ` (bTytD) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
        - **Text** `Text JZZZZZZZ` (bTytE) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
        - **Text** `Text JZZZZZZZ` (bTytF) — text: "[b]Cotação número[/b] {Parent:cpo.QualCotacao:cpo.CotacaoNum}  - [b]Proposta número[/b] {Parent:cpo.QualProposta:cpo.PropostaNum}"
        - **Text** `Text ZZZZZZZ` (bTytJ) — text: "[b]Condição negociada[/b]: {Parent:cpo.QualPedido:cpo.PrazoRecebComissoes:display}"
        - **Text** `Text LZZZZZZZZZ` (bTytK) — text: "[b]Forma pagto[/b]: {Parent:cpo.QualPedido:cpo.FormaPagto:display}"
    - **Table** `rpg entregas do produto` (bTytL) — data_source: Parent:convert_to_list · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
      - **TableMainAxis** `TableMainAxis G` (bTytP) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis G` (bTytQ) — props: axis_index=2
      - **TableMainAxis** `TableMainAxis G` (bTytR) — props: axis_index=3
      - **TableCrossAxis** `TableCrossAxis S` (bTytV) — props: axis_index=0
        - **TableCell** `Cell L` (bTytW) — props: cell_main_axis_id="bTytP"
          - **Text** `Text TZZZ` (bTytX) — text: "Dt prev. entrega" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTytb) — props: cell_main_axis_id="bTytQ"
          - **Text** `Text TZZZ` (bTytc) — text: "Qtd entrega" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTytd) — props: cell_main_axis_id="bTytR"
          - **Text** `Text TZZZ` (bTyth) — text: "Comissão " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTyti) — props: cell_main_axis_id="bTyuT"
          - **Text** `Text TZZZ` (bTytj) — text: "Valor bruto " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTytn) — props: cell_main_axis_id="bTyuX"
          - **Text** `Text TZZZ` (bTyto) — text: "Valor líq " · props: font_alignment="center"
        - **TableCell** `Cell L` (bTytp) — props: cell_main_axis_id="bTyuY"
          - **Text** `Text TZZZ` (bTytt) — text: "Núm NF " · props: font_alignment="center"
      - **TableCrossAxis** `TableCrossAxis S` (bTytu) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell L` (bTytv) — props: cell_main_axis_id="bTytP"
          - **Text** `Text VZZZ` (bTytz) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTyuA) — props: cell_main_axis_id="bTytQ"
          - **Text** `Text JZZZZ` (bTyuB) — text: "{Ancestor[TableCrossAxis]:cpo.QtdEntrega}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTyuF) — props: cell_main_axis_id="bTytR"
          - **Text** `Text TZZZ` (bTyuG) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTyuH) — props: cell_main_axis_id="bTyuT"
          - **Text** `Text TZZZ` (bTyuL) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTyuM) — props: cell_main_axis_id="bTyuX"
          - **Text** `Text TZZZ` (bTyuN) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
        - **TableCell** `Cell L` (bTyuR) — props: cell_main_axis_id="bTyuY"
          - **Text** `Text TZZZ` (bTyuS) — text: "{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: font_alignment="center"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
      - **TableMainAxis** `TableMainAxis G` (bTyuT) — props: axis_index=4
      - **TableMainAxis** `TableMainAxis G` (bTyuX) — props: axis_index=5
      - **TableMainAxis** `TableMainAxis G` (bTyuY) — props: axis_index=6
  - **Group** `Group XZZZZ` (bTysU) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Group** `g DateTimePicker` (bTysV) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text HZZZZZZZ` (bTysZ) — text: "Data de entrega"
      - **DateInput** `dt dataentrega realizada` (bTysa) — placeholder: "dd/mm/yy" · content: Page.Current Date/Time · props: mandatory=True, overwrite_placeholder=True
    - **Group** `g FileUploader` (bTysb) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text HZZZZZZZ` (bTysg) — text: "Comprovante entrega"
      - **FileInput** `upf comprovanteentrega realizada` (bTysf) — placeholder: "Máx 5mb" · props: font_alignment="left", src="{Parent:cpo.ComprovanteEntrega}", max_size=5
        - ⟂ quando This:get_loading_status:is_true → placeholder="Aguarde, carregando..."
    - **Group** `g FileUploader copy` (bTysh) — data_source: Parent · props: group_type="custom.tbl_entregas"
      - **Text** `Text E` (bTysm) — text: "Qtd parcelas"
      - **select2-MultiDropdown** `dd qtd parcelas receber` (bTysl) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · props: default=Parent:cpo.QualPedido:cpo.PrazoRecebComissoes, tag_bgcolor="var(--color_bTHGr_default)", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", tag_font_color="var(--color_primary_default)", limit_selection=4, tag_border_color="var(--color_primary_default)", tag_delete_color="var(--color_primary_default)", option_display_expression="{InjectedValue:display}"
    - **Icon** `Icon X` (bTysn) — props: icon="material outlined event", title_attribute="Adicionar parcelas"
      - ⟂ quando El[dd qtd parcelas receber]:get_data:count:less_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
  - **Table** `Table A` (bTyrd) — data_source: Parent:cpo.QuaisContasReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **TableMainAxis** `TableMainAxis A` (bTyre) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis A` (bTyrf) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis A` (bTyrj) — props: axis_index=0
      - **TableCell** `Cell A` (bTyrk) — props: cell_main_axis_id="bTyre"
        - **Text** `Text F` (bTyrl) — text: "Vencimento"
      - **TableCell** `Cell A` (bTyrp) — props: cell_main_axis_id="bTyrf"
        - **Text** `Text RZZZ` (bTyrq) — text: "Valor"
      - **TableCell** `Cell A` (bTyrr) — props: cell_main_axis_id="bTysP"
      - **TableCell** `Cell B` (bTyrv) — props: cell_main_axis_id="bTysT"
        - **Text** `Text SZZZ` (bTyrw) — text: "Prazo"
    - **TableCrossAxis** `TableCrossAxis A` (bTyrx) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bTysB) — props: cell_main_axis_id="bTyre"
        - **DateInput** `Date/TimePicker F` (bTysC) — auto_binding: True · props: vertical_centering=True, bind_field="cpo_datavencimento_date"
      - **TableCell** `Cell A` (bTysD) — props: cell_main_axis_id="bTyrf"
        - **Input** `Input JZ` (bTysH) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: vertical_centering=True, bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
      - **TableCell** `Cell A` (bTysI) — props: cell_main_axis_id="bTysP"
        - **Icon** `Icon W` (bTysJ) — props: icon="material outlined delete_forever", vertical_centering=True
      - **TableCell** `Cell K` (bTysN) — props: cell_main_axis_id="bTysT"
        - **Dropdown** `dd prazo a vencer` (bTysO) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, bind_field="cpo_qualprazo_option_opt_parcelasreceber", dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **TableMainAxis** `TableMainAxis A` (bTysP) — props: axis_index=3
    - **TableMainAxis** `TableMainAxis F` (bTysT) — props: axis_index=0
  - **Group** `gp retira pedido listagem copy` (bTyrX) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Icon** `Icon ZZZ` (bTyrZ) — props: icon="material outlined info"
    - **Text** `Text KZZZZZZZ` (bTyrY) — text: "Ao confirmar a entrega, esse cartão será movido para FINANCEIRO e as contas a receber serão criadas. ⏎Confira os dados os dados com atenção"
  - **Group** `Group WZZZ` (bTyrR) — data_source: Parent · props: group_type="custom.tbl_entregas", vertical_centering=True
    - **Button** `btn confirmaentrega` (bTyrS) — text: "Gravar" · props: button_disabled=True
      - ⟂ quando Parent:cpo.QuaisContasReceber:count:greater_or_equal_than(1):and_(El[dt dataentrega realizada]:get_data:is_not_empty):and_(El[dd qtd parcelas receber]:get_data:count:greater_or_equal_than(1)) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", button_disabled=False
    - **Button** `btn cencela confirmaentrega` (bTyrT) — text: "Cancela"
- **CustomElement** `reus cabecalho A` (bTyqP) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `pop.AgendaContatos A` (bTyyZ) — USA Reusable pop.AgendaContatos · props: custom_id="bTPQa0"
- **Popup** `pop cancelar entrega e pedido` (bTyqL) — props: vertical_centering=True
  - estado customizado `var_qualpedido_` : Tbl.Pedido
  - estado customizado `var_qualentrega_` : Tbl.Entregas
  - estado customizado `var_a__ocancelamento_` : Opt.Ações
  - **Icon** `Icon T` (bTyow) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group TZZZZ` (bTyox) — data_source: El[pop cancelar entrega e pedido]:custom.var_qualpedido_ · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Group** `Group OZZZZ` (bTypB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - **Group** `Group QZ` (bTypC) — props: vertical_centering=True
        - **Icon** `Icon RZZ` (bTypD) — props: icon="material outlined warning"
        - **Text** `Text TZZ` (bTypH) — text: "ATENÇÃO!" · props: font_alignment="center"
      - **Text** `Text UZZZ` (bTypI) — text: "Você está cancelando um pedido/entrega.⏎Para prosseguir preencha o motivo do cancelamento." · props: font_alignment="center"
      - **Input** `Input EZ` (bTypJ) — placeholder: "Motivo cancelamento" · content: "{∅}" · props: mandatory=True, vertical_centering=True
      - **Group** `Group NZZZZ` (bTypN) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Group** `Group LZZZZ` (bTypO) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `chk informa cancelamento cliente` (bTypP) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text M` (bTypT) — text: "Envia e-mail informando [color=#000000]cliente.[/color]"
        - **Group** `Group MZZZZ` (bTypU) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1680110374647x249108010620944400]/AAC** `chk informa cancelamento fornecedor` (bTypV) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
          - **Text** `Text N` (bTypZ) — text: "Envia e-mail informando fornecedor"
      - **Button** `Button L` (bTypa) — text: "Cancela Pedido/Entrega"
    - **Group** `Group RZZZZ` (bTypb) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_false → is_visible=False
      - **Group** `gp email cliente` (bTypf) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text U` (bTypm) — text: "Email do Cliente:"
        - **Group** `Group PZZZZ` (bTypg) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento cliente` (bTyph) — data_source: Parent:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailCliente, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[chk informa cancelamento cliente]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon GZ` (bTypl) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email cliente` (bTypn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTyps) — text: "Corpo do e-mail do cliente:"
        - **MultiLineInput** `ipt corpo cancelamento cliente` (bTypr) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido) → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido [/b] {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega) → content="Prezado(a) {Parent:cpo.EmailCliente:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎O cancelamento foi processado com sucesso e todas as devidas atualizações foram feitas em nosso sistema.⏎⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Agradecemos a oportunidade e esperamos poder atendê-lo(a) novamente no futuro.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
    - **Group** `Group SZZZZ` (bTypt) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_false → is_visible=False
      - **Group** `gp email fornecedor` (bTypx) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text U` (bTyqE) — text: "Email do fornecedor:"
        - **Group** `Group PZZZZ` (bTypy) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Dropdown** `dd email cancelamento fornecedor` (bTypz) — data_source: Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailFornecedor, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
            - ⟂ quando El[chk informa cancelamento fornecedor]:get_AAI:is_true → mandatory=True
          - **Icon** `Icon HZ` (bTyqD) — props: icon="material outlined contact_phone"
      - **Group** `gp corpo email fornecedor` (bTyqF) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Text** `Text Corpo do e-mail ` (bTyqK) — text: "Corpo do e-mail do fornecedor:"
        - **MultiLineInput** `ipt corpo cancelamento fornecedor` (bTyqJ) — placeholder: "" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido) → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento do [b]pedido[/b]  {Text("[b]Número[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.NumeroPedido} - [b]Produtos[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.QtdVenda:sum} - [b]Valores[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualpedido_:cpo.QuaisOrcamentosFonecedores:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
          - ⟂ quando El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega) → content="Prezado(a) {Parent:cpo.EmailFornecedor:cpo.NomeContato:to_uppercase}.⏎⏎⏎Segue o cancelamento da entrega do [b]pedido número [/b]{Text("{Parent:cpo.NumeroPedido}: [b]Data entrega[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")} - [b]Qtd[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.QtdEntrega} - [b]Valor[/b]: {El[pop cancelar entrega e pedido]:custom.var_qualentrega_:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎")} conforme solicitado.⏎⏎Peço por gentileza que não seja enviado nenhuma carga sem nosso consentimento.⏎⏎Caso tenha qualquer dúvida ou precise de mais informações, estamos à disposição!⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
- **Popup** `pop consulta icms` (bTyqR) — props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
  - **Group** `Group IZ` (bTyrH) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
    - **Dropdown** `dd Origem` (bTyrL) — data_source: All(Opt.UFs):sorted(descending=False, sort_field="display") · placeholder: "Origem" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **Dropdown** `dd Destino` (bTyrM) — data_source: All(Opt.UFs):sorted(descending=False, sort_field="display") · placeholder: "Destino" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Table** `Table H` (bTyqV) — data_source: Search(Tbl.IcmsEstados: cpo.Origem equals El[dd Origem]:get_data AND cpo.Destino equals El[dd Destino]:get_data; ignore empty) · props: group_type="custom.tbl_icmsestados", vertical_centering=True
    - **TableMainAxis** `TableMainAxis K` (bTyqW) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis K` (bTyqX) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis K` (bTyqb) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis H` (bTyqc) — props: axis_index=0
      - **TableCell** `Cell Q` (bTyqd) — props: cell_main_axis_id="bTyqW"
        - **Text** `Text Y` (bTyqh) — text: "Origem"
      - **TableCell** `Cell Q` (bTyqi) — props: cell_main_axis_id="bTyqX"
        - **Text** `Text AZ` (bTyqj) — text: "Destino"
      - **TableCell** `Cell Q` (bTyqn) — props: cell_main_axis_id="bTyqb"
        - **Text** `Text IZ` (bTyqo) — text: "Alíquota"
    - **TableCrossAxis** `TableCrossAxis H` (bTyqp) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell Q` (bTyqt) — props: cell_main_axis_id="bTyqW"
        - **Text** `Text WZZZ` (bTyqv) — text: "{Ancestor[TableCrossAxis]:cpo.Origem:display}" · props: font_alignment="center"
        - **Text** `Text KZ` (bTyqu) — text: "{∅}"
      - **TableCell** `Cell Q` (bTyqz) — props: cell_main_axis_id="bTyqX"
        - **Text** `Text XZZZ` (bTyrA) — text: "{Ancestor[TableCrossAxis]:cpo.Destino:display}" · props: font_alignment="center"
      - **TableCell** `Cell Q` (bTyrB) — props: cell_main_axis_id="bTyqb"
        - **Input** `Input KZ` (bTyrG) — placeholder: "" · auto_binding: True · content_format: "percentage" · props: mandatory=True, vertical_centering=True, bind_field="cpo_aliquotaicms_number", decimal_place=2
        - **Icon** `Icon IZ` (bTyrF) — props: icon="material outlined content_copy"
- **CustomElement** `pop.AgendaEnderecos A` (bTyqQ) — USA Reusable pop.AgendaEnderecos · props: custom_id="bTPJL"
- **Popup** `pop add fornecedor` (bTyFD) — props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
  - estado customizado `var_distanciamaiormenor_` : boolean
  - estado customizado `varfornecedoresselecionados_` : list.custom.tbl_enderecosclifor (lista)
  - **Icon** `btn fecar add fornecedores` (bTyEX) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group N` (bTyEY) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
    - **Group** `Group M` (bTyEZ) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Group** `Group G` (bTyEd) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Image** `Image B` (bTyEe) — props: src="{El[ipt buscacliente]:get_data:cpo.Foto}"
          - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Text** `Text Q` (bTyEf) — text: "{El[ipt buscacliente]:get_data:cpo.NomeCliFor:to_capitalized_words}"
      - **Group** `Group C` (bTyEj) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Text** `Text R` (bTyEk) — text: "{Parent:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
        - **Text** `Text T` (bTyEl) — text: "{Parent:cpo.Condicao:display} - {Parent:cpo.Linha:display} - {Parent:cpo.Medida}" · props: vertical_centering=True
    - **Group** `Group HZZZZZ` (bTyEp) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
      - **Group** `Group AZZZZ` (bTyEq) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
        - **Text** `Text MZZZZZZZ` (bTyEr) — text: "Endereço de entrega:"
        - **Group** `Group BZZZZ` (bTyEv) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True
          - **Dropdown** `dd end destino` (bTyEx) — data_source: Parent:cpo.QualCliente:cpo.QuaisEnderecos · placeholder: "Selecione endereço" · props: default=Parent:cpo.QualEnderecoDestino, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Complemento:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words} - {InjectedValue:cpo.QualUfOpt:display}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon HZZZ` (bTyFB) — props: icon="material outlined gps_fixed", button_disabled=True
            - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty → icon_color="var(--color_primary_default)", button_disabled=False
          - **Icon** `Icon JZ` (bTyEw) — props: icon="material outlined contact_mail"
      - **Button** `btn novofornecedor` (bTyFC) — text: "Novo Fornecedor" · props: icon="material filled factory", icon_size=20, button_type="label_icon"
  - **Table** `rpg cotacao fornecedores` (bTyBk) — data_source: Search(Tbl.EnderecosCliFor: cpo.Municipio equals "{El[dd filtercidade fornecedores]:get_data}" AND cpo.TipoClifor equals opt.TipoCliFor.Fornecedor AND cpo.QualUfOpt equals El[dd filterUF fornecedores]:get_data AND cpo.QualGrupoCliFor equals El[dd filternome fornecedores]:get_data AND cpo.Ativo equals True AND cpo.NomeEndereco text contains "{El[dd filterID fornecedores]:get_data}"; ignore empty):minus_list(Parent:cpo.QuaisOrcamentosForncededores:cpo.QualEnderecoOrigem) · props: group_type="custom.tbl_enderecosclifor", vertical_centering=True, unique_id="rpgaddfornecedores"
    - **TableMainAxis** `TableMainAxis J` (bTyBl) — props: axis_index=1
    - **TableMainAxis** `TableMainAxis J` (bTyBp) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis J` (bTyBq) — props: axis_index=5
    - **TableCrossAxis** `TableCrossAxis D` (bTyBr) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell P` (bTyBv) — props: cell_main_axis_id="bTyBl"
        - **Group** `gp filternome fornecedores` (bTyBw) — props: vertical_centering=True
          - **AutocompleteDropdown** `dd filternome fornecedores` (bTyBx) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Nome Fornecedor" · props: vertical_centering=True, field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGm_default)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon CZZ` (bTyCB) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filternome fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell P` (bTyCC) — props: cell_main_axis_id="bTyBp"
        - **Group** `gp filtercidade fornecedores` (bTyCD) — props: vertical_centering=True
          - **Dropdown** `dd filtercidade fornecedores` (bTyCH) — data_source: El[rpg cotacao fornecedores]:get_list_data:cpo.Municipio:unique:sorted(descending=False) · placeholder: "Cidade" · props: vertical_centering=True, dynamic_type="text", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:to_uppercase}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon S` (bTyCI) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filtercidade fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell P` (bTyCJ) — props: cell_main_axis_id="bTyBq"
        - **Text** `Text X` (bTyCN) — text: "Endereço"
      - **TableCell** `Cell U` (bTyCO) — props: cell_main_axis_id="bTyEF"
      - **TableCell** `Cell S` (bTyCP) — props: cell_main_axis_id="bTyEG"
      - **TableCell** `Cell W` (bTyCT) — props: cell_main_axis_id="bTyEH"
        - **Text** `Text Z` (bTyCU) — text: "Última cotação / Valor Unit" · props: font_alignment="center"
      - **TableCell** `Cell UZZZZ` (bTyCV) — props: cell_main_axis_id="bTyEL"
        - **Group** `gp filterUF fornecedores` (bTyCZ) — props: vertical_centering=True
          - **Dropdown** `dd filterUF fornecedores` (bTyCa) — data_source: All(Opt.UFs) · placeholder: "UF" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGm_default)", option_display_expression="{InjectedValue:display}"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon DZZ` (bTyCb) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filterUF fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
      - **TableCell** `Cell ZZZZZ` (bTyCs) — props: cell_main_axis_id="bTyES"
        - **Text** `Text MZZZZZZZZZ` (bTyCt) — text: "Regime tributário" · props: font_alignment="center"
      - **TableCell** `Cell M` (bTyCf) — props: cell_main_axis_id="bTyEM"
        - **Text** `sort distance` (bTyCg) — text: "Distancia para entrega  [fa]chevron-up[/fa]"
          - ⟂ quando El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_false → text="Distancia para entrega  [fa]chevron-down[/fa]"
      - **TableCell** `Cell XZZZZ` (bTyCh) — props: cell_main_axis_id="bTyEN", cell_cross_axis_index=0
      - **TableCell** `Cell O` (bTyCl) — props: cell_main_axis_id="bTyER"
        - **Group** `gp filterID fornecedores` (bTyCm) — props: vertical_centering=True
          - **Input** `dd filterID fornecedores` (bTyCn) — placeholder: "Identificador Endereço" · props: vertical_centering=True, placeholder_color="var(--color_bTHGm_default)"
            - ⟂ quando This:is_hovered → 
            - ⟂ quando This:is_focused → 
            - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Icon** `Icon FZ` (bTyCr) — props: icon="material filled filter_alt_off", vertical_centering=True
            - ⟂ quando El[dd filterID fornecedores]:get_data:is_not_empty → icon_color="var(--color_alert_default)"
    - **TableCrossAxis** `TableCrossAxis D` (bTyCx) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell P` (bTyCy) — props: cell_main_axis_id="bTyBl"
        - **Image** `Image H` (bTyDD) — props: src="{Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Foto}"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Text** `Text BZ` (bTyCz) — text: "{Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor:cpo.NomeCliFor:to_capitalized_words}"
      - **TableCell** `Cell P` (bTyDE) — props: cell_main_axis_id="bTyBp"
        - **Text** `Text CZ` (bTyDF) — text: "{Ancestor[TableCrossAxis]:cpo.Municipio:to_capitalized_words}"
      - **TableCell** `Cell P` (bTyDJ) — props: cell_main_axis_id="bTyBq"
        - **Text** `Text DZ` (bTyDK) — text: "{Ancestor[TableCrossAxis]:cpo.Endereco:to_capitalized_words}" · props: unique_id="kmdistancia"
      - **TableCell** `Cell T` (bTyDL) — props: cell_main_axis_id="bTyEF"
        - **Icon** `Icon AZZ` (bTyDP) — props: icon="material outlined contact_mail"
        - **Icon** `Icon BZZ` (bTyDQ) — props: icon="material outlined my_location"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **TableCell** `Cell V` (bTyDR) — props: cell_main_axis_id="bTyEG"
        - **Icon** `Icon IZZZ` (bTyDV) — props: icon="material outlined check_box_outline_blank"
          - ⟂ quando El[pop add fornecedor]:custom.varfornecedoresselecionados_:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Liberado:is_false → button_disabled=True
      - **TableCell** `Cell Y` (bTyDW) — props: cell_main_axis_id="bTyEH"
        - **Text** `Text JZ` (bTyDX) — text: "{Search(Tbl.OrcFornecedoresCotacao: cpo.QualCotacaoProduto equals El[pop add fornecedor]:get_group_data AND cpo.QualFornecedor equals Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor):last_element:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
      - **TableCell** `Cell VZZZZ` (bTyDb) — props: cell_main_axis_id="bTyEL"
        - **Text** `Text RZZZZZZZ` (bTyDc) — text: "{Ancestor[TableCrossAxis]:cpo.UF:to_uppercase}" · props: font_alignment="center"
      - **TableCell** `Cell AZZZZZ` (bTyEA) — props: cell_main_axis_id="bTyES"
        - **Text** `Text NZZZZZZZZZ` (bTyEB) — text: "{Ancestor[TableCrossAxis]:cpo.QualRegimeTributario:display}"
      - **TableCell** `Cell N` (bTyDd) — props: cell_main_axis_id="bTyEM"
        - **Group** `Group LZZZZZZ` (bTyDi) — props: vertical_centering=True
          - **Text** `Text WZZZZZZZ` (bTyDj) — text: "{Ancestor[TableCrossAxis]:cpo.Localizacaoo:distance_from(unit="kms", origin_address=El[dd end destino]:get_data:cpo.Localizacaoo):format_number(formatting_type="number", decimal_place=1)}" · props: unique_id="distancia"
            - ⟂ quando El[dd end destino]:get_data:is_empty:or_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="{∅}0", is_visible=True
          - **Text** `Text WZZZZZZZ` (bTyDn) — text: " km do cliente" · props: unique_id="kmdistancia"
        - **Text** `Text AZZZZZZZZZ` (bTyDh) — text: "km"
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_not_empty) → text="(cliente sem localização)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="(fornecedor sem localição)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_empty) → text="(cliente e fornecedor sem localização)", is_visible=True
          - ⟂ quando El[dd end destino]:get_data:cpo.Localizacaoo:is_not_empty:and_(Ancestor[TableCrossAxis]:cpo.Localizacaoo:is_not_empty) → is_visible=False
      - **TableCell** `Cell YZZZZ` (bTyDo) — props: cell_main_axis_id="bTyEN", cell_cross_axis_index=1
        - **Plugin[1753875729878x276985643861016580]/AAC** `IconToggle(BooleanFree) A` (bTyDp) — auto_binding: False · props: AAD=Ancestor[TableCrossAxis]:cpo.Liberado, AAE=" check_circle", AAF=" cancel", AAI=21
        - **Text** `Text ZZZZZZ` (bTyDt) — text: "LIBERADO" · props: font_alignment="center"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.Liberado:is_false → text="BLOQUEADO"
        - **Text** `Text OZZZZZZZZZ` (bTyDu) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.LiberadoMotivo}")}" · props: font_alignment="center"
      - **TableCell** `Cell X` (bTyDv) — props: cell_main_axis_id="bTyER"
        - **Text** `Text CZZZZ` (bTyDz) — text: "{Ancestor[TableCrossAxis]:cpo.NomeEndereco:to_capitalized_words}"
    - **TableMainAxis** `TableMainAxis L` (bTyEF) — props: axis_index=9
    - **TableMainAxis** `TableMainAxis M` (bTyEG) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis N` (bTyEH) — props: axis_index=7
    - **TableMainAxis** `TableMainAxis TZZ` (bTyEL) — props: axis_index=3
    - **TableMainAxis** `Column I` (bTyES) — props: axis_index=8
    - **TableMainAxis** `TableMainAxis H` (bTyEM) — props: axis_index=6
    - **TableMainAxis** `TableMainAxis VZZ` (bTyEN) — props: axis_index=10
    - **TableMainAxis** `TableMainAxis UZ` (bTyER) — props: axis_index=2
  - **Button** `Button E` (bTyET) — text: "Adicionar Fornecedores" · props: vertical_centering=True
- **Popup** `pop add edita propostas` (bTyOn) — props: group_type="custom.tbl_orcamento", vertical_centering=True
  - estado customizado `var_acaocotacao_` : Opt.Ações
  - estado customizado `var_exibeproposta_` : Tbl.Propostas
  - estado customizado `var_enviamailproposta_` : boolean
  - **Group** `gp modelo proposta` (bTyOl) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Group** `gp exibe proposta` (bTyLZ) — oculto ao carregar · data_source: El[gp add edita proposta]:get_group_data · props: group_type="custom.tbl_propostas", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → data_source=El[pop add edita propostas]:custom.var_exibeproposta_, is_visible=True
      - **Group** `gp alerta exibe proposta` (bTyLP) — props: vertical_centering=True
        - **Icon** `Icon PZZ` (bTyLT) — props: icon="material filled sd_card_alert"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_true → icon="report"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_false → icon="sim_card_alert.outline"
        - **Text** `Text EZZZZZ` (bTyLU) — text: "Alerta sobre a proposta exibida"
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_true → text="A proposta selecionada já foi enviada e não permite edição.⏎Caso precise alterar valores edite a cotação e crie uma nova proposta."
          - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:cpo.PropostaEnviada:is_false → text="A proposta selecionada [b]NÃO [/b]foi enviada e [b]AINDA [/b]permite edição de informações.⏎Caso precise alterar valores edite a cotação antes de enviar essa proposta."
        - **Button** `btn proposta editacotacao` (bTyLV) — text: "editar cotação" · props: icon="feather edit", vertical_centering=True, icon_size=12, button_type="label_icon"
          - ⟂ quando This:is_pressed → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGx_default)"
          - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
      - **Group** `gp corpo exibe proposta` (bTyLO) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - **Group** `Group IZZ` (bTyIP) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Image** `Image J` (bTyIT) — props: src="{Parent:cpo.QualCotacao:cpo.EmpresaMegabox:logo_horizontal}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group IZZ` (bTyIU) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text DZZZZZ` (bTyIV) — text: "[b]Consultor[/b]: {Parent:Created By:cpo.NomeModelo:to_capitalized_words}"
            - **Text** `Text DZZZZZ` (bTyIZ) — text: "[b]Email[/b]: {Parent:Created By:cpo.EmailContato}"
              - ⟂ quando Parent:cpo.QualCotacao:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email:[/b] {Parent:cpo.QualCotacao:cpo.EmpresaMegabox:email}"
            - **Text** `Text DZZZZZ` (bTyIa) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group IZZ` (bTyIb) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group IZZ` (bTyIf) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text DZZZZZ` (bTyIg) — text: "Proposta núm: {Parent:cpo.QualCotacao:cpo.CotacaoNum}/"
            - **Input** `ipt proposta numero` (bTyIh) — placeholder: "" · content: Parent:cpo.PropostaNum · content_format: "int_number" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
          - **Text** `Text DZZZZZ` (bTyIl) — text: "{Parent:Created Date:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Group** `Group IZZ` (bTyIm) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group NZZZZZ` (bTyIn) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTyJD) — placeholder: "" · props: src="{Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.Foto}", private=False, disabled=True
              - ⟂ quando Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `Group MZZZZZ` (bTyIr) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text DZZZZZ` (bTyIs) — text: "[b]Cliente[/b]: {Parent:cpo.FaturarPara:cpo.QualGrupoCliFor:cpo.NomeCliFor}"
              - **Text** `Text DZZZZZ` (bTyIt) — text: "[b]A/C:[/b] {Parent:cpo.EnviarPara:cpo.NomeContato}"
              - **Text** `Text DZZZZZ` (bTyIx) — text: "[b]CNPJ:[/b] {Parent:cpo.FaturarPara:cpo.CnpjCpf}"
              - **Text** `Text DZZZZZ` (bTyIy) — text: "[b]Telefone:[/b] {Parent:cpo.EnviarPara:cpo.Telefone}"
              - **Text** `Text DZZZZZ` (bTyIz) — text: "[b]Cidade:[/b] {Parent:cpo.FaturarPara:cpo.Municipio:to_capitalized_words}/{Parent:cpo.FaturarPara:cpo.UF:to_uppercase}"
          - **Text** `Text DZZZZZ` (bTyJE) — text: "- Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será possivel considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do enquadramento tributário de sua empresa.⏎- Se positivo, o VALOR LIQUIDO poderá ser considerado para fins de comparação com outras cotações, pois sua empresa se CREDITA desses impostos.[ul][li]Empresa de Lucro Real: Pode creditar de ICMS, PIS/COFINS e IPI[/li]⏎[li]Empresa de Lucro Presumido: Pode se creditar apenas do ICMS[/li]⏎[li]Empresa do Simples Nacional: Não pode se creditar desses impostos[/li]⏎[/ul]⏎-Em caso de dúvidas procure seu departamento fiscal/contábil⏎"
        - **Group** `Group IZZ` (bTyJF) — props: vertical_centering=True
          - **Text** `Text DZZZZZ` (bTyJJ) — text: "Itens da proposta:"
        - **Table** `rpg itens orcamento` (bTyJK) — data_source: Parent:cpo.QuaisOrcamentosFornecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
          - **TableMainAxis** `TableMainAxis CZZ` (bTyJQ) — props: axis_index=5
          - **TableCrossAxis** `TableCrossAxis M` (bTyJR) — props: axis_index=0
            - **TableCell** `Cell UZZZ` (bTyJc) — props: cell_main_axis_id="bTyJQ"
              - **Text** `Text L` (bTyJd) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyJh) — props: cell_main_axis_id="bTyKl"
              - **Text** `Text DZZZZZ` (bTyJi) — text: "Qtd" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyJj) — props: cell_main_axis_id="bTyKp"
              - **Text** `Text DZZZZZ` (bTyJn) — text: "Descrição"
            - **TableCell** `Cell UZZZ` (bTyJo) — props: cell_main_axis_id="bTyKq"
              - **Text** `Text J` (bTyJp) — text: "PREÇO UNITÁRIO⏎Líquido de Impostos⏎(PIS/COFINS/IPI)" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyJt) — props: cell_main_axis_id="bTyKr"
              - **Text** `Text K` (bTyJu) — text: "Alíquota⏎ICMS" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyJv) — props: cell_main_axis_id="bTyKv"
              - **Text** `Text DZZZZZ` (bTyJz) — text: "PREÇO UNITÁRIO BRUTO⏎(Impostos Incluso)⏎" · props: font_alignment="center"
            - **TableCell** `Cell C` (bTyJV) — props: cell_main_axis_id="bTyJL"
              - **Text** `Text HZZ` (bTyJW) — text: "VALOR TOTAL BRUTO⏎{El[rpg itens orcamento]:get_list_data:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell MZZZZ` (bTyJX) — props: cell_main_axis_id="bTyJP"
              - **Text** `Text GZZZZZZZZ` (bTyJb) — text: "Frete" · props: font_alignment="center"
          - **TableCrossAxis** `TableCrossAxis M` (bTyKA) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell UZZZ` (bTyKM) — props: cell_main_axis_id="bTyJQ"
              - **Text** `Text DZZZZZ` (bTyKN) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyKR) — props: cell_main_axis_id="bTyKl"
              - **Text** `Text DZZZZZ` (bTyKS) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyKT) — props: cell_main_axis_id="bTyKp"
              - **Text** `Text DZZZZZ` (bTyKX) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
              - **Text** `Text DZZZZZ` (bTyKY) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}"
            - **TableCell** `Cell UZZZ` (bTyKZ) — props: cell_main_axis_id="bTyKq"
              - **Text** `Text DZZZZZ` (bTyKd) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyKe) — props: cell_main_axis_id="bTyKr"
              - **Text** `Text DZZZZZ` (bTyKf) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell UZZZ` (bTyKj) — props: cell_main_axis_id="bTyKv"
              - **Text** `Text DZZZZZ` (bTyKk) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell D` (bTyKB) — props: cell_main_axis_id="bTyJL"
              - **Text** `Text ZZZ` (bTyKF) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell NZZZZ` (bTyKG) — props: cell_main_axis_id="bTyJP"
              - **Text** `Text HZZZZZZZZ` (bTyKL) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}⏎" · props: font_alignment="center"
              - **Text** `Text IZZZZZZZZ` (bTyKH) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis CZZ` (bTyKl) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis CZZ` (bTyKp) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis CZZ` (bTyKq) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis CZZ` (bTyKr) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis CZZ` (bTyKv) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis B` (bTyJL) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis PZZ` (bTyJP) — props: axis_index=3
        - **Group** `Group IZZ` (bTyKw) — props: vertical_centering=True
          - **Text** `Text DZZZZZ` (bTyKx) — text: "Condições da proposta:"
        - **Group** `Group IZZ` (bTyLB) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Text** `Text DZZZZZ` (bTyLC) — text: "[b]Validade[/b]: {Parent:cpo.QualCotacao:cpo.DataValidade:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTyLI) — text: "[b]Condições de pagamento:[/b] {Parent:cpo.CondicaoPgto}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTyLJ) — text: "[b]Destinos:[/b] {Parent:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualEnderecoDestino:cpo.Municipio:to_uppercase} - {InjectedValue:cpo.QualEnderecoDestino:cpo.UF:to_uppercase}", delimiter=" ")}" · props: vertical_centering=False
          - **Text** `Text DZZZZZ` (bTyLN) — text: "[b]Data prevista entrega:[/b] {Parent:cpo.DtPrevEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yyyy")}" · props: vertical_centering=False
          - **Text** `Text JZZZZZZZZZ` (bTyLH) — text: "[b]Informações adicionais:[/b] {El[ipt infoadicional]:get_data}" · props: vertical_centering=False
          - **Text** `Text AZZZZZZ` (bTyLD) — text: "⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
    - **Group** `gp nova proposta` (bTyOh) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → is_visible=False
      - **Group** `gp alerta nova proposta` (bTyOa) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
        - **Icon** `Icon QZZ` (bTyOb) — props: icon="material outlined info"
        - **Text** `Text ZZZZ` (bTyOf) — text: "Os valores da proposta abaixo exibem a [b]situação atual da cotação[/b][b].[/b]⏎Se os valores exibidos estão incorretos [b]edite a cotação[/b] antes de criar uma nova proposta."
        - **Button** `btn proposta editacotacao` (bTyOg) — text: "editar cotação" · props: icon="feather edit", vertical_centering=True, icon_size=12, button_type="label_icon"
          - ⟂ quando This:is_pressed → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGx_default)"
          - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
      - **Group** `gp corpo novaproposta` (bTyOZ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True, unique_id="novaproposta"
        - **Group** `Group R` (bTyLa) — props: vertical_centering=True
          - **Image** `Image D` (bTyLb) — props: src="{El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:logoimagem:imgix_treatment(fm="png")}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group S` (bTyLf) — props: vertical_centering=True
            - **Text** `Text CZZ` (bTyLg) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
            - **Text** `Text FZZ` (bTyLh) — text: "[b]Email[/b]: {CurrentUser:cpo.EmailContato:to_lowercase}"
              - ⟂ quando El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email:[/b] {El[pop add edita propostas]:get_group_data:cpo.EmpresaMegabox:email}"
            - **Text** `Text GZZ` (bTyLl) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group T` (bTyLm) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Group** `Group FZZ` (bTyLn) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Text** `Text IZZ` (bTyLr) — text: "Proposta núm: {Parent:cpo.CotacaoNum}/"
            - **Input** `ipt proposta numero` (bTyLs) — placeholder: "" · content: El[pop add edita propostas]:get_group_data:cpo.QuaisPropostas:count:plus(1) · content_format: "int_number" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
              - ⟂ quando This:is_hovered → 
              - ⟂ quando This:is_focused → 
              - ⟂ quando This:isnt_valid → font_color="var(--color_bTHHQ_default)"
          - **Text** `Text OZZ` (bTyLt) — text: "{Page.Current Date/Time:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Group** `Group U` (bTyLx) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Group** `Group PZZZZZ` (bTyLy) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTyML) — placeholder: "" · props: src="{Parent:cpo.QualCliente:cpo.Foto:imgix_treatment(fm="png")}", private=False, disabled=True
              - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `Group OZZZZZ` (bTyLz) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
              - **Text** `Text JZZ` (bTyMD) — text: "[b]Cliente[/b]: {Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text KZZ` (bTyME) — text: "[b]A/C:[/b] {El[dd email para]:get_data:cpo.NomeContato:to_capitalized_words}"
              - **Text** `Text MZZ` (bTyMF) — text: "[b]CNPJ:[/b] {El[dd faturar para]:get_data:cpo.CnpjCpf}"
              - **Text** `Text PZZ` (bTyMJ) — text: "[b]Telefone:[/b] {El[dd email para]:get_data:cpo.Telefone}"
              - **Text** `Text QZZ` (bTyMK) — text: "[b]Cidade:[/b] {El[dd faturar para]:get_data:cpo.Municipio:to_uppercase}/{El[dd faturar para]:get_data:cpo.UF:to_uppercase}"
            - **Text** `Text RZZ` (bTyMP) — text: "- Caso o cliente classifique os produtos do orçamento como matéria prima ou material de embalagem será possivel considerar o crédito de ICMS, PIS/COFINS e/ou IPI destacados ABAIXO, porém, dependerá do enquadramento tributário de sua empresa.⏎- Se positivo, o VALOR LIQUIDO poderá ser considerado para fins de comparação com outras cotações, pois sua empresa se CREDITA desses impostos.[ul][li]Empresa de Lucro Real: Pode creditar de ICMS, PIS/COFINS e IPI[/li]⏎[li]Empresa de Lucro Presumido: Pode se creditar apenas do ICMS[/li]⏎[li]Empresa do Simples Nacional: Não pode se creditar desses impostos[/li]⏎[/ul]⏎-Em caso de dúvidas procure seu departamento fiscal/contábil⏎"
        - **Group** `Group X` (bTyMQ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text SZZ` (bTyMR) — text: "Itens da proposta:"
        - **Table** `rpg itens orcamento` (bTyMV) — data_source: Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}) · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
          - **TableMainAxis** `TableMainAxis NZ` (bTyMb) — props: axis_index=5
          - **TableCrossAxis** `TableCrossAxis G` (bTyMc) — props: axis_index=0
            - **TableCell** `Cell UZZ` (bTyMn) — props: cell_main_axis_id="bTyMb"
              - **Text** `Text YZZ` (bTyMo) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center"
            - **TableCell** `Cell VZZ` (bTyMp) — props: cell_main_axis_id="bTyNw"
              - **Text** `Text UZZ` (bTyMt) — text: "Qtd" · props: font_alignment="center"
            - **TableCell** `Cell BZZZ` (bTyMu) — props: cell_main_axis_id="bTyNx"
              - **Text** `Text VZZ` (bTyMv) — text: "Descrição"
            - **TableCell** `Cell ZZZ` (bTyMz) — props: cell_main_axis_id="bTyOB"
              - **Text** `Text FZZZ` (bTyNA) — text: "PREÇO UNITÁRIO⏎(Líquido de Impostos)" · props: font_alignment="center"
            - **TableCell** `Cell DZZZ` (bTyNB) — props: cell_main_axis_id="bTyOC"
              - **Text** `Text XZZ` (bTyNF) — text: "Alíquota⏎ICMS" · props: font_alignment="center"
            - **TableCell** `Cell EZZZ` (bTyNG) — props: cell_main_axis_id="bTyOD"
              - **Text** `Text IZZZ` (bTyNH) — text: "PREÇO UNITÁRIO BRUTO⏎(Impostos Incluso)⏎" · props: font_alignment="center"
            - **TableCell** `Cell E` (bTyMd) — props: cell_main_axis_id="bTyMW"
              - **Text** `Text BZZZ` (bTyMh) — text: "VALOR TOTAL BRUTO⏎{El[rpg itens orcamento]:get_list_data:cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell OZZZ` (bTyMi) — props: cell_main_axis_id="bTyMX"
              - **Text** `Text DZZZZZZZZ` (bTyMj) — text: "Frete" · props: font_alignment="center"
          - **TableCrossAxis** `TableCrossAxis G` (bTyNL) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell UZZ` (bTyNX) — props: cell_main_axis_id="bTyMb"
              - **Text** `Text HZZZ` (bTyNY) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell YZZ` (bTyNZ) — props: cell_main_axis_id="bTyNw"
              - **Text** `Text DZZZ` (bTyNd) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
            - **TableCell** `Cell AZZZ` (bTyNe) — props: cell_main_axis_id="bTyNx"
              - **Text** `Text EZZZ` (bTyNf) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}"
              - **Text** `Text PZZZ` (bTyNj) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}"
            - **TableCell** `Cell CZZZ` (bTyNk) — props: cell_main_axis_id="bTyOB"
              - **Text** `Text WZZ` (bTyNl) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell FZZZ` (bTyNp) — props: cell_main_axis_id="bTyOC"
              - **Text** `Text GZZZ` (bTyNq) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell GZZZ` (bTyNr) — props: cell_main_axis_id="bTyOD"
              - **Text** `Text AZZZ` (bTyNv) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:divide(Ancestor[TableCrossAxis]:cpo.QtdVenda):format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell H` (bTyNM) — props: cell_main_axis_id="bTyMW"
              - **Text** `Text CZZZ` (bTyNN) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell PZZZ` (bTyNR) — props: cell_main_axis_id="bTyMX"
              - **Text** `Text EZZZZZZZZ` (bTyNT) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}⏎" · props: font_alignment="center"
              - **Text** `Text FZZZZZZZZ` (bTyNS) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis PZ` (bTyNw) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis QZ` (bTyNx) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis RZ` (bTyOB) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis SZ` (bTyOC) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis TZ` (bTyOD) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis C` (bTyMW) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis OZZ` (bTyMX) — props: axis_index=3
        - **Group** `Group Y` (bTyOH) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text LZZZ` (bTyOI) — text: "Condições da proposta:"
        - **Group** `Group Z` (bTyOJ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text MZZZ` (bTyON) — text: "[b]Validade[/b]: {Parent:cpo.DataValidade:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTyOT) — text: "[b]Condições de pagamento:[/b] {El[ipt condicao pagto]:get_data}" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTyOU) — text: "[b]Destinos:[/b] {Parent:cpo.QuaisProdutos:format_as_text(content="{InjectedValue:cpo.QualEnderecoDestino:cpo.Municipio:to_uppercase} - {InjectedValue:cpo.QualEnderecoDestino:cpo.UF:to_uppercase}", delimiter=" ")}⏎" · props: vertical_centering=False
          - **Text** `Text MZZZ` (bTyOV) — text: "[b]Data prevista entrega:[/b] {El[dt prevista entrega]:get_data:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: vertical_centering=False
          - **Text** `Text BZZZZ` (bTyOO) — text: "[b]Informações adicionais:[/b] {El[ipt infoadicional]:get_data}" · props: vertical_centering=False
          - **Text** `Text KZZZZZZZZZ` (bTyOP) — text: "⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
  - **Group** `gp historico propostas` (bTyIO) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Text** `Text IZZZZ` (bTyIN) — text: "Propostas do Cliente" · props: font_alignment="center"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta) → text="Nova proposta do cliente"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → text="Edita proposta do cliente"
    - **Group** `gp qual grupo clifor` (bTyHw) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente · props: group_type="custom.tbl_clientes"
      - **PictureInput** `upi novocliente logo` (bTyHx) — placeholder: "" · props: src="{Parent:cpo.Foto}", private=False, disabled=True
        - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
      - **Group** `Group HZZ` (bTyIB) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Text** `Text BZZZZZ` (bTyIC) — text: "{Parent:cpo.NomeCliFor:to_uppercase}"
        - **Text** `Text CZZZZZ` (bTyID) — text: "Cotação número {El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}"
    - **Button** `Button M` (bTyIH) — text: "Nova Proposta" · props: vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=False
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta) → bgcolor="var(--color_bTHGl_default)", button_disabled=True
    - **Group** `gp add edita proposta` (bTyFH) — props: group_type="custom.tbl_propostas"
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:is_empty:or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta)) → is_visible=False
      - **Group** `Group WZZZZZ` (bTyFf) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - **Group** `Group GZ` (bTyGL) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group V` (bTyGP) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text LZZ` (bTyGW) — text: "Email do cliente:"
            - **Group** `Group FZ` (bTyGQ) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Dropdown** `dd email para` (bTyGV) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.EnviarPara, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color="var(--color_bTHGs_default)"
              - **Icon** `Icon KZ` (bTyGR) — props: icon="material outlined contact_mail"
          - **Group** `Group GZZ` (bTyGX) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text AZZZZZ` (bTyGd) — text: "Emails cópia:"
            - **Group** `Group GZZ` (bTyGb) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Input** `ipt emails copia` (bTyGc) — placeholder: "Emails separados por ;" · content: "{Parent:cpo.EmailsCopia}" · props: mandatory=False
          - **Group** `Group CZ` (bTyGh) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text QZZZ` (bTyGj) — text: "Corpo do e-mail "
            - **MultiLineInput** `ipt corpoemail` (bTyGi) — placeholder: "" · content: "{Parent:cpo.CorpoEmail}" · props: unique_id="remodela"
              - ⟂ quando Parent:cpo.CorpoEmail:is_empty → content="Olá {El[dd email para]:get_data:cpo.NomeContato:to_capitalized_words}⏎⏎Em resposta à sua solicitação de orçamento para [b]{El[pop add edita propostas]:get_group_data:cpo.QuaisProdutos:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}, [/b] temos o prazer de apresentar nossa proposta.⏎⏎Agradecemos seu interesse em nossos produtos/serviços.⏎⏎Acreditamos que nossa proposta atende às suas necessidades e expectativas. ⏎⏎Estamos à disposição para esclarecer quaisquer dúvidas e fornecer mais informações.⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]"
        - **Group** `Group EZZZZZ` (bTyFg) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
          - **Group** `Group W` (bTyFh) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text NZZ` (bTyFr) — text: "Faturar para:"
            - **Group** `Group HZ` (bTyFl) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Dropdown** `dd faturar para` (bTyFn) — data_source: El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.QuaisEnderecos · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.FaturarPara, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} - {InjectedValue:cpo.Fantasia:to_lowercase:to_capitalized_words} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.CnpjCpf}"
                - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)", bgcolor="var(--color_bTHHP_default)"
                - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color="var(--color_bTHGs_default)"
              - **Icon** `Icon LZ` (bTyFm) — props: icon="material outlined contact_mail"
          - **Group** `Group VZZZZZ` (bTyFy) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Group** `Group AZ` (bTyFz) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text NZZZ` (bTyGE) — text: "Condição de pgto:"
              - **Input** `ipt condicao pagto` (bTyGD) — placeholder: "00 dd" · content: "{Parent:cpo.CondicaoPgto}"
                - ⟂ quando Parent:cpo.CondicaoPgto:is_empty → content="{∅}Mediante analise do financeiro"
            - **Group** `Group BZ` (bTyGF) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
              - **Text** `Text OZZZ` (bTyGK) — text: "Dt prevista entrega:"
              - **DateInput** `dt prevista entrega` (bTyGJ) — placeholder: "dd/mm/aa" · content: Parent:cpo.DtPrevEntrega · props: overwrite_placeholder=True
          - **Group** `Group DZZZZZ` (bTyFs) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
            - **Text** `Text V` (bTyFx) — text: "Informações adicionais:"
            - **MultiLineInput** `ipt infoadicional` (bTyFt) — placeholder: "" · content: "{Parent:cpo.InfoAdicional}" · props: unique_id="remodela"
      - **Group** `Group AZZ` (bTyFZ) — oculto ao carregar · props: vertical_centering=True
        - ⟂ quando El[btn proposta salvar]:is_hovered:or_(El[btn proposta salvarenviar]:is_hovered):or_(El[btn proposta gravar]:is_hovered):or_(El[btn proposta gravarenviar]:is_hovered) → is_visible=True
        - **Icon** `Icon MZZ` (bTyFa) — props: icon="material outlined info"
        - **Text** `Text VZZZZ` (bTyFb) — text: ""
          - ⟂ quando El[btn proposta gravar]:is_hovered:or_(El[btn proposta salvar]:is_hovered) → text=""Gravar" significa que a proposta [b]não será enviada[/b] nesse momento. Os dados [b]acima[/b] podem ser alteradas até o momento que a proposta for enviada."
          - ⟂ quando El[btn proposta gravarenviar]:is_hovered:or_(El[btn proposta salvarenviar]:is_hovered) → text=""Gravar e Enviar" significa que a proposta [b]será enviada[/b] nesse momento. Após enviada a proposta não pode ser alterada. Se houver necessidade será necessário criar uma nova proposta."
      - **Group** `Group DZ` (bTyFI) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta) → is_visible=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → is_visible=False
        - **Button** `btn proposta gravar` (bTyFJ) — text: "Gravar" · props: vertical_centering=True
        - **Button** `btn proposta gravarenviar` (bTyFN) — text: "Gravar e Enviar" · props: vertical_centering=True
        - **Button** `btn proposta cancelagravar` (bTyFO) — text: "Cancela"
      - **Group** `Group LZ` (bTyFP) — data_source: Parent · props: group_type="custom.tbl_propostas", vertical_centering=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta) → is_visible=True
        - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:not_equals(Opt.Ações.Edita Proposta) → is_visible=False
        - **Button** `btn proposta salvar` (bTyFT) — text: "Salvar"
        - **Button** `btn proposta salvarenviar` (bTyFU) — text: "Salvar e Enviar"
        - **Button** `btn proposta cancelasalvar` (bTyFV) — text: "Cancela"
    - **Table** `Table I` (bTyGn) — data_source: Parent:cpo.QuaisPropostas:sorted(descending=True, sort_field="Created Date") · props: group_type="custom.tbl_propostas", vertical_centering=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:is_empty:or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Exibe Proposta)) → is_visible=True
      - ⟂ quando El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Nova Proposta):or_(El[pop add edita propostas]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Proposta)) → is_visible=False
      - **TableMainAxis** `TableMainAxis O` (bTyGo) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis I` (bTyGp) — props: axis_index=0
        - **TableCell** `Cell R` (bTyGt) — props: cell_main_axis_id="bTyGo"
          - **Text** `Text AZZZZ` (bTyGu) — text: "Fornecedor"
        - **TableCell** `Cell JZZZ` (bTyGv) — props: cell_main_axis_id="bTyHp"
        - **TableCell** `Cell SZZZ` (bTyGz) — props: cell_main_axis_id="bTyHq"
          - **Text** `Text ZZZZZ` (bTyHA) — text: "Núm"
        - **TableCell** `Cell VZZZ` (bTyHB) — props: cell_main_axis_id="bTyHr"
        - **TableCell** `Cell XZZZ` (bTyHF) — props: cell_main_axis_id="bTyHv"
          - **Text** `Text GZZZZZ` (bTyHG) — text: "Produtos"
      - **TableCrossAxis** `TableCrossAxis I` (bTyHH) — props: axis_index=1, cross_axis_repeat=True
        - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_primary_default_rgb), 0.08)"
        - **TableCell** `Cell R` (bTyHL) — props: cell_main_axis_id="bTyGo"
          - **Text** `Text EZZZZ` (bTyHM) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}", delimiter="⏎")}"
        - **TableCell** `Cell KZZZ` (bTyHN) — props: cell_main_axis_id="bTyHp"
          - **Icon** `Icon MZ` (bTyHR) — props: icon="material outlined edit", title_attribute="editar proposta (somente se não foi enviada) "
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Icon** `Icon NZ` (bTyHT) — props: icon="material outlined attach_file", title_attribute="visualizar proposta enviada"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.AquivoProposta:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Icon** `Icon OZ` (bTyHS) — props: icon="material outlined send", title_attribute="Proposta enviada? {Ancestor[TableCrossAxis]:cpo.PropostaEnviada}"
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → is_visible=False
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_false → is_visible=True
          - **Group** `Group D` (bTyHY) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_propostas", vertical_centering=True
            - ⟂ quando This:is_hovered → boxshadow_style="outset", boxshadow_blur=2
            - **Image** `btn reenviar proposta` (bTyHZ) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1729685584587x372935738891563500/resend.svg", title_attribute="reenviar proposta"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true → is_visible=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_false → is_visible=False
          - **Icon** `Icon KZZZ` (bTyHX) — props: icon="material outlined shopping_cart_checkout", button_disabled=True, title_attribute="transformar proposta em pedido"
            - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]):and_(Ancestor[TableCrossAxis]:cpo.PropostaEnviada:is_true) → icon_color="var(--color_primary_default)", button_disabled=False
        - **TableCell** `Cell TZZZ` (bTyHd) — props: cell_main_axis_id="bTyHq"
          - **Text** `Text YZZZZ` (bTyHe) — text: "{Ancestor[TableCrossAxis]:cpo.PropostaNum}"
        - **TableCell** `Cell WZZZ` (bTyHf) — props: cell_main_axis_id="bTyHr"
          - **Icon** `seleciona proposta` (bTyHj) — props: icon="material outlined radio_button_unchecked"
            - ⟂ quando El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis]) → icon="material outlined radio_button_checked"
        - **TableCell** `Cell YZZZ` (bTyHk) — props: cell_main_axis_id="bTyHv"
          - **Text** `Text FZZZZZ` (bTyHl) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:format_as_text(content="{InjectedValue:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - {InjectedValue:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}", delimiter="⏎")}"
      - **TableMainAxis** `TableMainAxis WZ` (bTyHp) — props: axis_index=7
      - **TableMainAxis** `TableMainAxis BZZ` (bTyHq) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis DZZ` (bTyHr) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis EZZ` (bTyHv) — props: axis_index=3
    - **Group** `gp proposta a anexar` (bTyII) — props: group_type="custom.tbl_propostas", vertical_centering=True
      - **Plugin[1648430145817x673906689668022300]/AAc** `PDF/IMG PROPOSTA` (bTyIJ)
  - **Icon** `Icon OZZ` (bTyOm) — props: icon="material outlined close"
- **Popup** `pop add edita cotacao` (bTyYD) — props: group_type="custom.tbl_orcamento"
  - **Group** `Group B` (bTyXn) — data_source: Parent · props: group_type="custom.tbl_orcamento"
    - **Group** `Group CZZ` (bTyWf) — data_source: Parent · props: group_type="custom.tbl_orcamento"
      - **Group** `Group L` (bTyWj) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Text** `Text WZ` (bTyWq) — text: "Nova Cotação" · props: vertical_centering=False
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → text="Nova Cotação"
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → text="Edita Cotação"
        - **Group** `g Input` (bTyWk) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTyWl) — text: "Cotação núm." · props: font_alignment="center"
          - **Input** `ip num orcamento` (bTyWp) — placeholder: "" · content: Parent:cpo.CotacaoNum · content_format: "int_number" · props: font_alignment="center", disabled=True
            - ⟂ quando Parent:is_empty → content=Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1)
      - **Group** `Group K` (bTyWr) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Image** `Image A` (bTyXD) — props: src="{El[ipt buscacliente]:get_data:cpo.Foto}", editor_preview_image="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1730482424502x336125780431834300/landscape-placeholder%5B1%5D.svg"
          - ⟂ quando El[ipt buscacliente]:get_data:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - ⟂ quando El[ipt buscacliente]:get_data:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Group** `g Input` (bTyWv) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTyXC) — text: "Cliente"
          - **Group** `gp add novo cliente` (bTyWw) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **AutocompleteDropdown** `ipt buscacliente` (bTyWx) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Buscar cliente" · props: mandatory=True, default=Parent:cpo.QualCliente, unique_id="upper", ac_list_max=25, field_to_search="cpo_nomecliente_text", border_style_top="none", allow_not_in_list=True, border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
              - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
              - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)"
              - ⟂ quando Parent:is_not_empty → disabled=True
              - ⟂ quando El[pop.AgendaEnderecos A]:custom.var_recemcadastrado_:is_not_empty → default=El[pop.AgendaEnderecos A]:custom.var_recemcadastrado_
            - **Icon** `Icon V` (bTyXB) — props: icon="material filled person_add"
              - ⟂ quando Parent:is_not_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
        - **Group** `Group FZZZZ` (bTyXH) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - **Text** `Text SZZZZZZZ` (bTyXI) — text: "Endereço de entrega:" · props: vertical_centering=True
          - **Group** `Group FZZZZ` (bTyXJ) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Dropdown** `dd enderecoentregacliente` (bTyXN) — data_source: Search(Tbl.EnderecosCliFor: cpo.QualGrupoCliFor equals El[ipt buscacliente]:get_data) · placeholder: "Selecione o destino" · props: mandatory=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.Municipio:to_capitalized_words}/{InjectedValue:cpo.UF:to_uppercase}"
              - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
              - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
            - **Icon** `Icon PZ` (bTyXO) — props: icon="material outlined contact_mail"
              - ⟂ quando El[ipt buscacliente]:get_data:is_empty → icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **Group** `Group J` (bTyXP) — data_source: Parent · props: group_type="custom.tbl_orcamento"
        - **Image** `Image G` (bTyXg) — props: src="", button_disabled=True
          - ⟂ quando El[rd empresa megabox]:get_data:equals(Opt.EmpresaMegabox.Megabox) → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1714500060178x676720324417465700/favicon%20megabox.png?_gl=1*z46kre*_gcl_au*OTk0Nzk3NzI0LjE3MTM3OTAwNTM.*_ga*NjI4NzMxNjM2LjE3MDYwMTA5MDU.*_ga_BFPVR2DEE2*MTcxNzE1NTcxNC44MC4xLjE3MTcxOTEzNDguNjAuMC4w"
          - ⟂ quando El[rd empresa megabox]:get_data:equals(Opt.EmpresaMegabox.Paletes Brasil) → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1717206119850x663794755204967700/aaa%20WhatsApp%20Image%202024-05-31%20at%2018.58.20.png"
        - **RadioButtons** `rd empresa megabox` (bTyXf) — data_source: All(Opt.EmpresaMegabox) · props: mandatory=True, default=Parent:cpo.EmpresaMegabox, unique_id="rdempresas", dynamic_type="option.opt_empresamegabox", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
          - ⟂ quando Parent:is_empty → default=Opt.EmpresaMegabox.Megabox
        - **Group** `g Input` (bTyXh) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTyXl) — text: "Data cotação"
          - **Input** `ip data orcamento` (bTyXm) — placeholder: "" · content: "{Parent:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: disabled=True
            - ⟂ quando Parent:is_empty → content="{Page.Current Date/Time:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
        - **Group** `g DateTimePicker` (bTyXT) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTyXU) — text: "Data Validade"
          - **DateInput** `ip data validade` (bTyXV) — content: Parent:cpo.DataValidade · props: mandatory=True, border_style_left="none", four_border_style=True, border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando Parent:is_empty → content=Page.Current Date/Time:plus_days(2)
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_style_bottom="solid"
        - **Group** `g Input` (bTyXZ) — data_source: Parent · props: group_type="custom.tbl_orcamento"
          - **Text** `Text O` (bTyXa) — text: "Vendedor"
          - **Input** `ip vendedor` (bTyXb) — placeholder: "" · content: "{Parent:Created By:cpo.NomeModelo:to_capitalized_words}" · props: disabled=True
            - ⟂ quando Parent:is_empty → content="{CurrentUser:cpo.NomeModelo:to_capitalized_words}"
    - **Group** `gp add produto` (bTyVc) — props: group_type="custom.tbl_orcamentoprodutos"
      - **Group** `Group E` (bTyWY) — props: group_type="custom.tbl_orcamento"
        - **Text** `Text WZZZZ` (bTyWZ) — text: "Novo Produto" · props: vertical_centering=False
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__oor_amento_:equals(Opt.Ações.Novo Produto) → text="Adicionar produto ao carrinho"
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__oor_amento_:equals(Opt.Ações.Edita Produto) → text="Edita produto do carrinho"
        - **Group** `Group FZZZZZ` (bTyWd) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
          - ⟂ quando This:is_hovered → boxshadow_blur=2
          - **Image** `abre cadastro produtos` (bTyWe) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1733341112464x836081496925408500/pallet-solid%20blue.svg", title_attribute="Cadastro de produtos"
      - **Group** `Group DZZ` (bTyVd) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
        - **Group** `g Dropdown` (bTyVh) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTyVi) — text: "Tipo Produto"
          - **Dropdown** `dd add grupo produto` (bTyVj) — data_source: Search(Tbl.ProdutosGrupo; sort cpo.NomeGrupo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProdutoGrupo, dynamic_type="custom.tbl_produtossubgrupo", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeGrupo:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Dropdown` (bTyVn) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTyVo) — text: "Produto"
          - **Dropdown** `dd add modelo produto` (bTyVp) — data_source: Search(Tbl.ProdutosModelo: cpo.QualGrupoProduto equals El[dd add grupo produto]:get_data AND cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.QualProduto, dynamic_type="custom.tbl_produtos", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:cpo.NomeModelo:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Icon** `edita produto` (bTyVt) — props: icon="material outlined edit", vertical_centering=True, title_attribute="Editar produto"
      - **Group** `Group EZZ` (bTyVu) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
        - **Group** `g Dropdown` (bTyVv) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTyWA) — text: "Condição"
          - **Dropdown** `dd add condicao` (bTyVz) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisCondicoes · placeholder: "Selecione" · props: mandatory=True, default=Parent:cpo.Condicao, dynamic_type="option.opt_produtoscondicao", choices_style="dynamic", computed_value="number", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Dropdown` (bTyWB) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTyWF) — text: "Linha"
          - **Dropdown** `dd add linha` (bTyWG) — data_source: El[dd add modelo produto]:get_data:cpo.QuaisLinhas · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.Linha, dynamic_type="option.opt_produtoslinhas", choices_style="dynamic", computed_value="text", border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0, option_display_expression="{InjectedValue:display:to_capitalized_words}"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
            - ⟂ quando El[dd add condicao]:get_data:equals(Opt.ProdutosCondicao.Usado) → default=Opt.ProdutosLinhas.Usado
        - **Group** `g Input` (bTyWH) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTyWL) — text: "Qtd"
          - **Input** `ip add qtd` (bTyWM) — placeholder: "000" · content: Parent:cpo.qtd · content_format: "int_number" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Group** `g Input` (bTyWN) — data_source: Parent · props: group_type="custom.tbl_orcamentoprodutos"
          - **Text** `Text O` (bTyWR) — text: "Medida, descrição ou obs."
          - **Input** `ip add medida` (bTyWS) — placeholder: "00 x 00" · content: "{Parent:cpo.Medida}" · props: mandatory=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_color_bottom="var(--color_bTHGl_default)", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:is_hovered:or_(This:is_focused) → border_color_bottom="var(--color_bTHGs_default)"
            - ⟂ quando This:isnt_valid → placeholder_color="var(--color_bTHHP_default)", border_color_bottom="var(--color_bTHHQ_default)", border_width_bottom=2
        - **Icon** `add produto` (bTyWX) — props: icon="fa fa-cart-arrow-down"
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__oor_amento_:equals(Opt.Ações.Novo Produto) → is_visible=True
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__oor_amento_:not_equals(Opt.Ações.Novo Produto) → is_visible=False
        - **Icon** `salvar produto` (bTyWT) — props: icon="material outlined save"
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__oor_amento_:equals(Opt.Ações.Edita Produto) → is_visible=True
          - ⟂ quando El[Página vendas_bkp2]:custom.var_a__oor_amento_:not_equals(Opt.Ações.Edita Produto) → is_visible=False
  - **Table** `rpg produto orcamento` (bTyVb) — data_source: CurrentUser:cpo.TempOrcamentoProdutos · props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=4, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=10
    - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → data_source=Parent:cpo.QuaisProdutos:merged_with(CurrentUser:cpo.TempOrcamentoProdutos)
    - **TableCrossAxis** `TableCrossAxis B` (bTyTL) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell F` (bTySt) — props: cell_main_axis_id="bTyTM"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Table** `tbl nome produto` (bTyQr) — props: group_type="custom.tbl_orcamentoprodutos", vertical_centering=True, vertical_separator_style="none", horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis HZ` (bTyQv) — props: axis_index=2
          - **TableCrossAxis** `TableCrossAxis F` (bTyQw) — props: axis_index=0
            - **TableCell** `Cell JZZ` (bTyQx) — props: cell_main_axis_id="bTyQv"
              - **Image** `Image I` (bTyRB) — props: src="{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.QualTipoProduto:cpo.Icon}"
              - **Group** `Group F` (bTyRC) — props: vertical_centering=True
                - **Text** `Text P` (bTyRD) — text: "{Ancestor[TableCrossAxis]:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                - **Text** `Text UZ` (bTyRH) — text: "{Ancestor[TableCrossAxis]:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.Medida}" · props: vertical_centering=True
              - **Text** `indica fornecedores` (bTyRI) — text: "{El[rpg fornecedorescotacao]:get_list_data:count}" · props: font_alignment="center", title_attribute="Qtd de fornecedores dessa cotação"
              - **Icon** `indica vencedor` (bTyRJ) — props: icon="fa fa-trophy", title_attribute="Vencedor dessa cotação: {Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.QualFornecedor:cpo.NomeCliFor:to_capitalized_words}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:greater_or_equal_than(1) → is_visible=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count:less_than(1) → is_visible=False
            - **TableCell** `Cell JZZ` (bTyRN) — props: cell_main_axis_id="bTySX"
              - **Input** `ip totalbruto` (bTyRO) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell JZZ` (bTyRP) — props: cell_main_axis_id="bTySb"
              - **Icon** `btn remove orcamentoproduto` (bTyRT) — props: icon="material outlined delete_forever"
            - **TableCell** `Cell JZZ` (bTyRU) — props: cell_main_axis_id="bTySc"
              - **Input** `ip totalcomissao` (bTyRV) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell JZZ` (bTyRZ) — props: cell_main_axis_id="bTySd"
              - **Icon** `Icon B` (bTyRa) — props: icon="fa fa-chevron-down"
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → icon="fa fa-chevron-up"
            - **TableCell** `Cell JZZ` (bTyRb) — props: cell_main_axis_id="bTySh"
              - **Input** `ip totalliquido` (bTyRf) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell KZZ` (bTyRg) — props: cell_main_axis_id="bTySi"
              - **Input** `ip totalbruto copy 4` (bTyRh) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorVendaUnit · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell MZZ` (bTyRl) — props: cell_main_axis_id="bTySj"
              - **Input** `ip totalbruto copy 3` (bTyRm) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.valorcomissao · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell OZZ` (bTyRn) — props: cell_main_axis_id="bTySn"
              - **Input** `ip totalbruto copy 5` (bTyRr) — placeholder: "" · content: "{Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.TipoFrete:display}" · props: font_alignment="center", disabled=True, placeholder_color="var(--color_bTHGl_default)"
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell QZZ` (bTyRs) — props: cell_main_axis_id="bTySo"
              - **Input** `ip totalbruto copy 2` (bTyRt) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorFrete · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
            - **TableCell** `Cell SZZ` (bTyRx) — props: cell_main_axis_id="bTySp"
              - **Input** `ip totalbruto copy` (bTyRy) — placeholder: "" · content: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element:cpo.ValorPISCOFINS · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando El[rpg fornecedorescotacao]:is_visible → is_visible=False
          - **TableCrossAxis** `TableCrossAxis F` (bTyRz) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell JZZ` (bTySD) — props: cell_main_axis_id="bTyQv"
            - **TableCell** `Cell JZZ` (bTySE) — props: cell_main_axis_id="bTySX"
            - **TableCell** `Cell JZZ` (bTySF) — props: cell_main_axis_id="bTySb"
            - **TableCell** `Cell JZZ` (bTySJ) — props: cell_main_axis_id="bTySc"
            - **TableCell** `Cell JZZ` (bTySK) — props: cell_main_axis_id="bTySd"
            - **TableCell** `Cell JZZ` (bTySL) — props: cell_main_axis_id="bTySh"
            - **TableCell** `Cell LZZ` (bTySP) — props: cell_main_axis_id="bTySi"
            - **TableCell** `Cell NZZ` (bTySQ) — props: cell_main_axis_id="bTySj"
            - **TableCell** `Cell PZZ` (bTySR) — props: cell_main_axis_id="bTySn"
            - **TableCell** `Cell RZZ` (bTySV) — props: cell_main_axis_id="bTySo"
            - **TableCell** `Cell TZZ` (bTySW) — props: cell_main_axis_id="bTySp"
          - **TableMainAxis** `TableMainAxis HZ` (bTySX) — props: axis_index=8
          - **TableMainAxis** `TableMainAxis HZ` (bTySb) — props: axis_index=11
          - **TableMainAxis** `TableMainAxis HZ` (bTySc) — props: axis_index=10
          - **TableMainAxis** `TableMainAxis HZ` (bTySd) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis HZ` (bTySh) — props: axis_index=9
          - **TableMainAxis** `TableMainAxis IZ` (bTySi) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis JZ` (bTySj) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis KZ` (bTySn) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis LZ` (bTySo) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis MZ` (bTySp) — props: axis_index=7
        - **Table** `rpg fornecedorescotacao` (bTyOr) — oculto ao carregar · data_source: Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, vertical_separator_color="rgba(var(--color_surface_default_rgb), 0)", vertical_separator_width=4, horizontal_separator_color="var(--color_surface_default)", horizontal_separator_width=2
          - ⟂ quando El[Página vendas_bkp2]:custom.var_todosfornecedores_:is_true → is_visible=True
          - **TableMainAxis** `TableMainAxis I` (bTyOs) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis I` (bTyOt) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis I` (bTyOx) — props: axis_index=3
          - **TableCrossAxis** `TableCrossAxis C` (bTyOy) — oculto ao carregar · props: axis_index=0
            - **TableCell** `Cell J` (bTyOz) — props: cell_main_axis_id="bTyOs"
            - **TableCell** `Cell J` (bTyPD) — props: cell_main_axis_id="bTyOt"
            - **TableCell** `Cell J` (bTyPE) — props: cell_main_axis_id="bTyOx"
            - **TableCell** `Cell CZ` (bTyPF) — props: cell_main_axis_id="bTyQd"
            - **TableCell** `Cell EZ` (bTyPJ) — props: cell_main_axis_id="bTyQe"
            - **TableCell** `Cell GZ` (bTyPK) — props: cell_main_axis_id="bTyQf"
            - **TableCell** `Cell IZ` (bTyPL) — props: cell_main_axis_id="bTyQj"
            - **TableCell** `Cell KZ` (bTyPP) — props: cell_main_axis_id="bTyQk"
            - **TableCell** `Cell MZ` (bTyPQ) — props: cell_main_axis_id="bTyQl"
            - **TableCell** `Cell DZZ` (bTyPR) — props: cell_main_axis_id="bTyQp"
            - **TableCell** `Cell HZZ` (bTyPV) — props: cell_main_axis_id="bTyQq"
          - **TableCrossAxis** `TableCrossAxis C` (bTyPW) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell J` (bTyPX) — props: cell_main_axis_id="bTyOs"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Text** `Text S` (bTyPb) — text: "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.UF:to_uppercase}"
              - **Text** `Text RZ` (bTyPc) — text: "{Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:display:to_capitalized_words}"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoOrigem:cpo.QualRegimeTributario:is_empty → text="{∅}Falta regime tributário"
            - **TableCell** `Cell J` (bTyPd) — props: cell_main_axis_id="bTyOt"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorvenda` (bTyPh) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", unique_id="{Ancestor[TableCrossAxis]:_id}", bind_field="cpo_valorvenda_number", currency_symbol="R$ ", always_show_decimals=True
            - **TableCell** `Cell J` (bTyPi) — props: cell_main_axis_id="bTyOx"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorcomissao` (bTyPj) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", bind_field="cpo_valorcomissao_number", currency_symbol="R$ ", always_show_decimals=True
            - **TableCell** `Cell DZ` (bTyPn) — props: cell_main_axis_id="bTyQd"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Dropdown** `dd tipofrete` (bTyPo) — data_source: All(Opt.TipoFrete) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, font_alignment="center", bind_field="cpo_tipofrete_option_opt_tipofrete", dynamic_type="option.opt_tipofrete", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
            - **TableCell** `Cell FZ` (bTyPp) — props: cell_main_axis_id="bTyQe"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip valorfrete` (bTyPt) — placeholder: "R$ 0,00" · auto_binding: True · content_format: "currency" · props: font_alignment="center", bind_field="cpo_valorfrete_number", currency_symbol="R$ ", always_show_decimals=True
                - ⟂ quando El[dd tipofrete]:get_data:not_equals(Opt.TipoFrete.CIF Informado) → content=0, bgcolor="var(--color_bTHGh_default)", disabled=True
            - **TableCell** `Cell HZ` (bTyPu) — props: cell_main_axis_id="bTyQf"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Group** `Group JZ` (bTyQA) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Input** `ip icms` (bTyQF) — placeholder: "ICMS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", bind_field="cpo_tributos_number", decimal_place=1, border_color_top="var(--color_bTHGl_default)", border_color_left="var(--color_bTHGl_default)", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_color_bottom="var(--color_bTHGl_default)", border_roundness_right=0
                  - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → content=Search(Tbl.IcmsEstados):filtered(constraints={0={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoDestino:cpo.UF:equals(InjectedValue:cpo.Destino:display), constraint_type=∅}, 1={key="_advanced_search_constraint", value=Parent:cpo.QualEnderecoOrigem:cpo.UF:equals(InjectedValue:cpo.Origem:display), constraint_type=∅}}):first_element:cpo.AliquotaIcms
                - **Icon** `Icon TZZ` (bTyQB) — props: icon="material outlined search"
              - **Input** `ip piscofins` (bTyPz) — placeholder: "PIS/COFINS %" · auto_binding: True · content_format: "percentage" · props: font_alignment="center", bind_field="cpo_tributopiscofinsb_number", decimal_place=2, four_border_style=True, border_roundness_left=0
              - **Input** `ipt calculotributo` (bTyPv) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS:plus(Ancestor[TableCrossAxis]:cpo.ValorICMS) · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell JZ` (bTyQG) — props: cell_main_axis_id="bTyQj"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalbruto` (bTyQH) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell LZ` (bTyQL) — props: cell_main_axis_id="bTyQk"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Icon** `btn remove orcamento fornecedor` (bTyQM) — props: icon="material outlined delete"
            - **TableCell** `Cell NZ` (bTyQN) — props: cell_main_axis_id="bTyQl"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalcomissao` (bTyQR) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
            - **TableCell** `Cell EZZ` (bTyQS) — props: cell_main_axis_id="bTyQp"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Icon** `Icon P` (bTyQT) — props: icon="bootstrap trophy"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → icon="bootstrap trophy-fill", icon_color="var(--color_bTHHX_default)"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:less_than(0.01) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.valorcomissao:less_than(0.01) → icon_color="var(--color_bTHGl_default)", button_disabled=True, title_attribute="{∅}falta valor de venda ou valor de comissão"
            - **TableCell** `Cell IZZ` (bTyQX) — props: cell_main_axis_id="bTyQq"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Vencedor:is_true → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.08)"
              - **Input** `ip totalliquido` (bTyQZ) — placeholder: "R$ 0,00" · content: Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:equals(El[ip valorminimo]:get_data) → font_color="var(--color_bTHHX_default)"
              - **Input** `ip valorminimo` (bTyQY) — oculto ao carregar · placeholder: "R$ 0,00" · content: El[rpg fornecedorescotacao]:get_list_data:cpo.ValorVendaLiquido:min · content_format: "currency" · props: font_alignment="center", disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
          - **TableMainAxis** `TableMainAxis Q` (bTyQd) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis R` (bTyQe) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis S` (bTyQf) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis T` (bTyQj) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis U` (bTyQk) — props: axis_index=10
          - **TableMainAxis** `TableMainAxis V` (bTyQl) — props: axis_index=9
          - **TableMainAxis** `TableMainAxis EZ` (bTyQp) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis GZ` (bTyQq) — props: axis_index=8
      - **TableCell** `Cell F` (bTySu) — props: cell_main_axis_id="bTyTN"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Input** `Input B` (bTySv) — placeholder: "000" · auto_binding: True · content_format: "int_number" · props: font_alignment="center", bind_field="cpo_qtd_number"
      - **TableCell** `Cell I` (bTySz) — props: cell_main_axis_id="bTyVV"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn adiciona fornecedor` (bTyTA) — props: icon="material outlined factory", title_attribute="Adiciona fornecedor para orçar"
      - **TableCell** `Cell BZ` (bTyTB) — props: cell_main_axis_id="bTyVW"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn adiciona destino` (bTyTF) — props: icon="material outlined pin_drop", title_attribute="Destino desse produto"
          - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:is_not_empty → icon_color="var(--color_bTHHX_default)"
      - **TableCell** `Cell XZZ` (bTyTG) — props: cell_main_axis_id="bTyVX"
        - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
        - **Icon** `btn edita produto` (bTyTH) — props: icon="material outlined edit", title_attribute="Destino desse produto"
    - **TableMainAxis** `TableMainAxis D` (bTyTM) — props: axis_index=4
    - **TableMainAxis** `TableMainAxis D` (bTyTN) — props: axis_index=3
    - **TableCrossAxis** `TableCrossAxis B` (bTyTR) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell F` (bTyTS) — props: cell_main_axis_id="bTyTM"
        - **Table** `Table E` (bTyTT) — props: group_type="option.opt_a__oclifor", vertical_centering=True, vertical_separator_color="var(--color_surface_default)", vertical_separator_width=4, horizontal_separator_style="none"
          - **TableMainAxis** `TableMainAxis W` (bTyTX) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis W` (bTyTY) — props: axis_index=9
          - **TableCrossAxis** `TableCrossAxis E` (bTyTZ) — oculto ao carregar · props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=True, fixed_number_repeating_axis_count=0
            - **TableCell** `Cell OZ` (bTyTd) — props: cell_main_axis_id="bTyTX"
            - **TableCell** `Cell OZ` (bTyTe) — props: cell_main_axis_id="bTyTY"
            - **TableCell** `Cell QZ` (bTyTf) — props: cell_main_axis_id="bTyTw"
            - **TableCell** `Cell SZ` (bTyTj) — props: cell_main_axis_id="bTyTx"
            - **TableCell** `Cell UZ` (bTyTk) — props: cell_main_axis_id="bTyUB"
            - **TableCell** `Cell WZ` (bTyTl) — props: cell_main_axis_id="bTyUC"
            - **TableCell** `Cell YZ` (bTyTp) — props: cell_main_axis_id="bTyUD"
            - **TableCell** `Cell AZZ` (bTyTq) — props: cell_main_axis_id="bTyUH"
            - **TableCell** `Cell CZZ` (bTyTr) — props: cell_main_axis_id="bTyUI"
            - **TableCell** `Cell FZZ` (bTyTv) — props: cell_main_axis_id="bTyVJ"
          - **TableMainAxis** `TableMainAxis X` (bTyTw) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis Y` (bTyTx) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis Z` (bTyUB) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis AZ` (bTyUC) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis BZ` (bTyUD) — props: axis_index=5
          - **TableMainAxis** `TableMainAxis CZ` (bTyUH) — props: axis_index=6
          - **TableMainAxis** `TableMainAxis DZ` (bTyUI) — props: axis_index=8
          - **TableCrossAxis** `TableCrossAxis E` (bTyUJ) — props: axis_index=0
            - **TableCell** `Cell OZ` (bTyUN) — props: cell_main_axis_id="bTyTX"
              - **Icon** `btn abrir todos` (bTyUP) — props: icon="material outlined keyboard_double_arrow_down"
                - ⟂ quando El[Página vendas_bkp2]:custom.var_todosfornecedores_:is_true → icon="material outlined keyboard_double_arrow_up"
              - **Text** `Text LZ` (bTyUO) — text: "Produto / Fornecedor"
            - **TableCell** `Cell OZ` (bTyUT) — props: cell_main_axis_id="bTyTY"
            - **TableCell** `Cell PZ` (bTyUU) — props: cell_main_axis_id="bTyTw"
              - **Text** `Text NZ` (bTyUV) — text: "Produto Unit." · props: font_alignment="center"
            - **TableCell** `Cell RZ` (bTyUZ) — props: cell_main_axis_id="bTyTx"
              - **Text** `Text OZ` (bTyUa) — text: "Comissão Unit." · props: font_alignment="center"
            - **TableCell** `Cell TZ` (bTyUb) — props: cell_main_axis_id="bTyUB"
              - **Text** `Text PZ` (bTyUf) — text: "Tipo Frete" · props: font_alignment="center"
            - **TableCell** `Cell VZ` (bTyUg) — props: cell_main_axis_id="bTyUC"
              - **Text** `Text QZ` (bTyUh) — text: "Valor Frete" · props: font_alignment="center"
            - **TableCell** `Cell XZ` (bTyUl) — props: cell_main_axis_id="bTyUD"
              - **Text** `txt titulo icms` (bTyUm) — oculto ao carregar · text: "ICMS" · props: font_alignment="center"
              - **Text** `txt titulo piscofins` (bTyUn) — oculto ao carregar · text: "PIS/COFINS" · props: font_alignment="center"
              - **Text** `Text BZZ` (bTyUr) — text: "Aliq. ICMS" · props: font_alignment="center"
              - **Text** `Text A` (bTyUs) — text: "Aliq. PISCOFINS" · props: font_alignment="center"
              - **Text** `Text B` (bTyUt) — text: "Total Tributos" · props: font_alignment="center"
            - **TableCell** `Cell ZZ` (bTyUx) — props: cell_main_axis_id="bTyUH"
              - **Text** `Text SZ` (bTyUy) — text: "Total Bruto" · props: font_alignment="center"
            - **TableCell** `Cell BZZ` (bTyUz) — props: cell_main_axis_id="bTyUI"
              - **Text** `Text VZ` (bTyVD) — text: "Total Comiss." · props: font_alignment="center"
            - **TableCell** `Cell GZZ` (bTyVE) — props: cell_main_axis_id="bTyVJ"
              - **Text** `Text XZ` (bTyVF) — text: "Total Líq" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis FZ` (bTyVJ) — props: axis_index=7
      - **TableCell** `Cell F` (bTyVK) — props: cell_main_axis_id="bTyTN"
        - **Text** `Text MZ` (bTyVL) — text: "QTD" · props: font_alignment="center"
      - **TableCell** `Cell G` (bTyVP) — props: cell_main_axis_id="bTyVV"
      - **TableCell** `Cell AZ` (bTyVQ) — props: cell_main_axis_id="bTyVW"
      - **TableCell** `Cell WZZ` (bTyVR) — props: cell_main_axis_id="bTyVX"
    - **TableMainAxis** `TableMainAxis E` (bTyVV) — props: axis_index=2
    - **TableMainAxis** `TableMainAxis P` (bTyVW) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis OZ` (bTyVX) — props: axis_index=-1
  - **Group** `Group BZZ` (bTyXr) — data_source: Parent · props: group_type="custom.tbl_orcamento", vertical_centering=True
    - **Button** `btn gravarcotacao` (bTyXs) — text: "Gravar Cotação" · props: vertical_centering=True
      - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação) → is_visible=True
      - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:not_equals(Opt.Ações.Nova Cotação) → is_visible=False
    - **Button** `btn salvarcotacao` (bTyXt) — text: "Salvar Cotação"
      - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → is_visible=True
      - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:not_equals(Opt.Ações.Edita Cotação) → is_visible=False
    - **Button** `btn cancelacotacao` (bTyXx) — text: "Cancela"
      - ⟂ quando El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação) → border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)"
    - **Input** `ipt contaproduto` (bTyXy) — oculto ao carregar · content: Parent:cpo.QuaisProdutos:count · content_format: "int_number" · props: vertical_centering=True
    - **Input** `ipt contavencedor` (bTyXz) — oculto ao carregar · content: Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):count · content_format: "int_number" · props: vertical_centering=True
- **Popup** `pop apagar registro` (bTyyI) — props: border_color_top="var(--color_bTHHQ_default)", border_style_top="solid", border_width_top=5, four_border_style=True, border_roundness_left=10, border_roundness_right=10
  - **Icon** `Icon A` (bTyyJ) — props: icon="fa fa-exclamation-triangle"
  - **Text** `Text EZ` (bTyyN) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text FZ` (bTyyO) — text: "Você está tentando apagar um registro de seu banco e dados." · props: font_alignment="center"
  - **Text** `Text GZ` (bTyyP) — text: "Esta ação não pode ser revertida!" · props: font_alignment="center"
  - **Text** `Text HZ` (bTyyT) — text: "Deseja continuar?" · props: font_alignment="center"
  - **Button** `Button C` (bTyyU) — text: "SIM"
  - **Button** `Button D` (bTyyV) — text: "NÃO"
- **Popup** `pop add edita pedido` (bTyiM) — props: group_type="custom.tbl_pedidos", vertical_centering=True
  - estado customizado `var_acaocotacao_` : Opt.Ações
  - estado customizado `var_deletarentregas_` : list.custom.tbl_entregas (lista)
  - **Group** `Group QZZZ` (bTyiH) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
    - **Group** `gp alert gravando` (bTyiF) — oculto ao carregar · props: vertical_centering=True
      - **Text** `Text TZZZZZZ` (bTyiG) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! "
    - **Group** `Group LZZZ` (bTyiB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
      - **Group** `gp pedido corpoarquivo` (bTybJ) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True, unique_id="corpopedido"
        - **Group** `Group EZ` (bTyal) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Image** `Image C` (bTyam) — props: src="{Parent:cpo.QualCotacao:cpo.EmpresaMegabox:logoimagem:imgix_treatment(fm="png")}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group EZ` (bTyan) — data_source: Parent:cpo.QualCotacao · props: group_type="custom.tbl_orcamento", vertical_centering=True
            - **Text** `Text DZZ` (bTyar) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
            - **Text** `Text DZZ` (bTyas) — text: "[b]Email[/b]: {CurrentUser:cpo.EmailContato:to_lowercase}"
              - ⟂ quando Parent:cpo.EmpresaMegabox:equals(Opt.EmpresaMegabox.Paletes Brasil) → text="[b]Email[/b]: {Parent:cpo.EmpresaMegabox:email}"
            - **Text** `Text DZZ` (bTyat) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group EZ` (bTyax) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Text** `Text DZZ` (bTyay) — text: "Pedido núm: {Parent:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}"
          - **Text** `Text DZZ` (bTyaz) — text: "{Page.Current Date/Time:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
        - **Table** `rpg exibe itens pedido` (bTyah) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=4
          - **TableCrossAxis** `TableCrossAxis Q` (bTyaZ) — props: axis_index=0
            - **TableCell** `Cell IZZZZ` (bTyaa) — props: cell_main_axis_id="bTyag"
              - **Group** `Group EZZZ` (bTyab) — props: vertical_centering=True
                - **Text** `Text PZZZZZZ` (bTyaf) — text: "Detalhes do pedido"
          - **TableCrossAxis** `TableCrossAxis Q` (bTyaV) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell IZZZZ` (bTyaU) — props: cell_main_axis_id="bTyag"
              - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
              - **Group** `Group SZZ` (bTyaI) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group LZZZZZ` (bTyaJ) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text DZZZZZZ` (bTyaN) — text: "Dados de faturamento"
                  - **Text** `Text BZZZZZZ` (bTyaO) — text: "[b]Razão[/b]: {Parent:cpo.QualEnderecoOrigem:cpo.Razao:to_uppercase}"
                  - **Text** `Text BZZZZZZ` (bTyaP) — text: "[b]CNPJ:[/b]  {Parent:cpo.QualEnderecoOrigem:cpo.CnpjCpf:to_uppercase}"
                  - **Text** `Text BZZZZZZ` (bTyaT) — text: "[b]Endereço:[/b]  {Parent:cpo.QualEnderecoOrigem:cpo.Endereco:to_uppercase} - {Parent:cpo.QualEnderecoOrigem:cpo.Municipio:to_uppercase} - {Parent:cpo.QualEnderecoOrigem:cpo.QualUfOpt:display}"
              - **Group** `gp D A D O S C L I E N T E` (bTyZR) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group GZZZZZZ` (bTyZl) — props: vertical_centering=True
                  - **PictureInput** `upi novocliente logo` (bTyZp) — placeholder: "" · props: src="{Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.QualGrupoCliFor:cpo.Foto:imgix_treatment(fm="png")}", private=False, disabled=True
                    - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.QualGrupoCliFor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                - **Group** `Group XZZ` (bTyZd) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group CZZZ` (bTyZf) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **Icon** `Icon YZZ` (bTyZk) — props: icon="material filled pin_drop"
                      - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → icon_color="var(--color_bTHHQ_default)"
                    - **Text** `Text KZZZZZZ` (bTyZj) — text: "Enviar para:"
                      - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → font_color="var(--color_bTHHQ_default)"
                  - **Text** `Text KZZZZZZ` (bTyZe) — text: "Razão: {Parent:cpo.QualEnderecoDestino:cpo.Razao:to_capitalized_words}⏎Endereço: {Parent:cpo.QualEnderecoDestino:cpo.Endereco:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.Complemento:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.Municipio:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.UF:to_uppercase} - {Parent:cpo.QualEnderecoDestino:cpo.Cep}⏎Cnpj: {Ancestor[TableCrossAxis]:cpo.QualEnderecoDestino:cpo.CnpjCpf}⏎Insc.Est: {Parent:cpo.QualEnderecoDestino:cpo.InscEstadual}"
                    - ⟂ quando Parent:cpo.QualEnderecoDestino:is_empty → text="{∅}Selecione um endereço pra entrega"
                - **Group** `Group VZZ` (bTyZS) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Group** `Group DZZZ` (bTyZX) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                    - **HTML** `HTML B` (bTyZZ) — html(392 chars) · props: vertical_centering=True
                      - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → html="<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#b72d3a"><path d="M240-396h372l72-72H240v72Zm0-144h240v-72H240v72Zm-72-156v384h360l-72 72H96v-528h768v192h-72v-120H168Zm715.57 238.83q4.43 4.46 4.43 9.82 0 5.35-5 10.35l-31 32-63-63 31-32q4.77-5 10.5-5t10.5 5l42.57 42.83ZM528-144v-63.13L768-447l63 63-239.87 240H528ZM168-696v384-384Z"/></svg>"
                    - **Text** `Text JZZZZZZ` (bTyZY) — text: "Faturar para:"
                      - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → font_color="var(--color_bTHHQ_default)"
                  - **Text** `Text JZZZZZZ` (bTyZT) — text: "Razão: {Parent:cpo.QualEndereçoCobrança:cpo.Razao:to_capitalized_words}⏎Endereço: {Parent:cpo.QualEndereçoCobrança:cpo.Endereco:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.Complemento:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.Municipio:to_capitalized_words} - {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.UF:to_uppercase} - {Parent:cpo.QualEndereçoCobrança:cpo.Cep}⏎Cnpj: {Ancestor[TableCrossAxis]:cpo.QualEndereçoCobrança:cpo.CnpjCpf}⏎Insc.Est: {Parent:cpo.QualEndereçoCobrança:cpo.InscEstadual}"
                    - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_empty → text="{∅}Selecione um endereço de cobrança"
              - **Group** `Group ZZZ` (bTyZq) — props: vertical_centering=True
                - **Text** `Text GZZZZZZ` (bTyZr) — text: "Produtos"
                - **Text** `Text GZZZZZZ` (bTyZv) — text: "Qtd" · props: font_alignment="center"
                - **Text** `Text GZZZZZZ` (bTyZw) — text: "VALOR UNITÁRIO⏎Líquido de impostos" · props: font_alignment="center"
                - **Text** `Text DZZZZZZZ` (bTyZx) — text: "Frete" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZZZZZZ` (bTyaH) — text: "Alíquota⏎ICMS" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text C` (bTyaC) — text: "Alíquota⏎PIS/COFINS" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text EZZZZZZZ` (bTyaB) — text: "VALOR UNIT BRUTO⏎(Impostos Incluso)" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZ` (bTyaD) — text: "VALOR TOTAL BRUTO" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
              - **Group** `Group TZZ` (bTyYE) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group TZZ` (bTyYF) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text GZZZZZZ` (bTyYJ) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
                  - **Text** `Text GZZZZZZ` (bTyYK) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Medida}"
                - **Text** `Text GZZZZZZ` (bTyYP) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda}" · props: font_alignment="center"
                - **Text** `Text GZZZZZZ` (bTyYL) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnitLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
                - **Group** `Group KZZZZZ` (bTyYX) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text FZZZZZZZ` (bTyYb) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                  - **Text** `Text LZZZZZZZZ` (bTyYc) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZZZZZZ` (bTyYW) — text: "{Ancestor[TableCrossAxis]:cpo.TotalBonusExtra - deleted:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text D` (bTyYR) — text: "{Ancestor[TableCrossAxis]:cpo.TotalComissaoVendedor:format_number(formatting_type="percentage", decimal_place=2, decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text GZZZZZZZ` (bTyYQ) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZ` (bTyYV) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
              - **Group** `linha orcamentofornecedor` (bTyYd) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:less_than(1) → is_visible=False
                - **Table** `rpg entregas do produto` (bTyYh) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisEntregas:sorted(descending=False, sort_field="cpo_dataentrega_date") · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
                  - **TableMainAxis** `TableMainAxis LZZ` (bTyYi) — props: axis_index=0
                  - **TableMainAxis** `TableMainAxis LZZ` (bTyYj) — props: axis_index=1
                  - **TableCrossAxis** `TableCrossAxis Q` (bTyYn) — props: axis_index=0
                    - **TableCell** `Cell IZZZZ` (bTyYo) — props: cell_main_axis_id="bTyYi"
                      - **Text** `Text GZZZZZZ` (bTyYp) — text: "Data entrega" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTyYt) — props: cell_main_axis_id="bTyYj"
                      - **Text** `Text GZZZZZZ` (bTyYu) — text: "Qtd entrega" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTyYv) — props: cell_main_axis_id="bTyZN"
                      - **Text** `Text GZZZZZZ` (bTyYz) — text: "Valor bruto " · props: font_alignment="center"
                  - **TableCrossAxis** `TableCrossAxis Q` (bTyZA) — props: axis_index=1, cross_axis_repeat=True
                    - **TableCell** `Cell IZZZZ` (bTyZB) — props: cell_main_axis_id="bTyYi"
                      - **Text** `Text GZZZZZZ` (bTyZF) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTyZG) — props: cell_main_axis_id="bTyYj"
                      - **Text** `Text IZZZZZZ` (bTyZH) — text: "{Ancestor[TableCrossAxis]:cpo.QtdEntrega}" · props: font_alignment="center"
                    - **TableCell** `Cell IZZZZ` (bTyZL) — props: cell_main_axis_id="bTyZN"
                      - **Text** `Text HZZZZZZ` (bTyZM) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
                  - **TableMainAxis** `TableMainAxis LZZ` (bTyZN) — props: axis_index=3
          - **TableMainAxis** `TableMainAxis LZZ` (bTyag) — props: axis_index=1
        - **Group** `Group EZ` (bTybD) — props: vertical_centering=True
          - **Text** `Text DZZ` (bTybE) — text: "Informações adicionais"
        - **Text** `Text TZZZZZZZ` (bTybF) — text: "[color=#fab515][b][size=2]Número da Ordem de compra: {El[ipt pedido ordemcompra numero]:get_data}[/size][/b][/color]⏎⏎[b][size=2]Informações adicionais: {El[ipt pedido infoadd]:get_data}[/size][/b] ⏎⏎[b][size=2]Condições de pagamento: {El[dd parcelas receb comissao]:get_data:display} - {El[dd formapagto]:get_data:display}[/size][/b]⏎⏎[b]Informações importantes sobre Paletes Usados[/b]⏎- Podem apresentar desgaste natural, incluindo rachaduras, farpas e pregos rebatidos.⏎- Variam conforme a origem, fabricação e montagem, podendo ser de eucalipto ou pinus.⏎- Madeira pode apresentar rachaduras naturais, sem comprometer a resistência.⏎- É necessário realizar testes para confirmar que atendem às necessidades do cliente.⏎- Cargas serão enviadas desenlonadas e podem sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio (um encaixado dentro do outro).⏎- A descarga será de responsabilidade do cliente.⏎⏎[b]Informações importantes sobre Paletes Novos[/b]⏎- Podem ser de madeira aplainada (lisa) ou bruta (com imperfeições).⏎- Eucalipto pode ter rachaduras naturais, sem comprometer a qualidade.⏎- Pinus pode desenvolver mofo ao longo do tempo se não for seco em estufa.⏎- Cargas serão desenlonadas, podendo sofrer exposição à umidade. Caso seja necessário paletes secos, solicitar previamente.⏎- Paletes serão entrelaçados no envio.⏎- A descarga será de responsabilidade do cliente.⏎- Para paletes fora de medida, recomenda-se o envio de amostra para teste.⏎⏎[b]Informações sobre Recebimento de Chapatex[/b]⏎- A mercadoria deve ser avaliada no ato do recebimento, pois não será aceita devolução posteriormente.⏎⏎[b]Informações sobre Frete CIF e Descarga[/b]⏎- Caso o cliente escolha frete CIF, a descarga será de sua responsabilidade.⏎- Atrasos na descarga podem gerar custos adicionais, variando entre R$ 300,00 e R$ 1.800,00 por dia, conforme a capacidade do veículo.⏎- O prazo máximo para carga e descarga é 5 horas. Após esse período, aplica-se cobrança conforme a tabela vigente.⏎⏎[b]Informações sobre Pagamento[/b]:⏎- Alterações na forma de pagamento devem ser solicitadas formalmente com mínimo de 7 dias de antecedência.⏎- Depósitos não autorizados podem não ser identificados, resultando no protesto automático do boleto pelo banco.⏎- Despesas financeiras como multa, juros e custos cartorários serão de responsabilidade do cliente."
      - **Group** `gp itens pedido` (bTyiA) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
        - **Group** `Group TZZZZZ` (bTyhh) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Text** `Text DZZ` (bTyhi) — text: "Pedido ao Fornecedor" · props: font_alignment="center"
        - **Group** `gp qual cliente` (bTyez) — data_source: Parent · props: group_type="custom.tbl_pedidos"
          - **PictureInput** `upi novocliente logo` (bTyfA) — placeholder: "" · props: src="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
            - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - **Group** `Group EZ` (bTyfB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Text** `Text DZZ` (bTyfF) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
            - **Text** `Text DZZ` (bTyfG) — text: "Cotação número {Parent:cpo.QualCotacao:cpo.CotacaoNum} Proposta número {Parent:cpo.QualProposta:cpo.PropostaNum}"
          - **Icon** `Icon WZ` (bTyfL) — props: icon="material outlined contact_mail"
          - **Icon** `hide dados do pedido` (bTyfH) — props: icon="material outlined vertical_align_top"
            - ⟂ quando El[dados do pedido]:isnt_visible → icon="material outlined vertical_align_bottom"
        - **Group** `dados do pedido` (bTyfM) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp coluna esquerda` (bTyfw) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Group** `gp mail cliente` (bTygV) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Group** `gp email cliente` (bTygZ) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text NZZZZZZ` (bTygg) — text: "Email do Cliente:"
                - **Group** `Group ZZZZ` (bTyga) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                  - **Dropdown** `dd pedido emailcliente` (bTygb) — data_source: Parent:cpo.QualCotacao:cpo.QualCliente:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailCliente, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                    - ⟂ quando El[chk formalizar]:get_data → mandatory=True
                  - **Icon** `Icon YZ` (bTygf) — props: icon="material outlined contact_phone"
              - **Group** `gp email cliente copy` (bTygn) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text MZZZZZZZZ` (bTygr) — text: "CC e-mail cliente:"
                - **Input** `ipt cc email cliente` (bTygs) — placeholder: "Emails separados por ;" · props: mandatory=False
                  - ⟂ quando El[chk formalizar]:get_data → mandatory=True
              - **Group** `gp corpo email cliente` (bTygh) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text Corpo do e-mail ` (bTygm) — text: "Corpo do e-mail do cliente:"
                - **MultiLineInput** `ipt pedido corpoemailcliente` (bTygl) — placeholder: "" · content: "Olá {El[dd pedido emailcliente]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Gostaríamos de agradecer pela oportunidade de atendê-lo(a) e, conforme discutido em nossas interações anteriores, estamos formalizando o pedido.⏎⏎Se houver alguma observação relevante ou condições especiais a serem consideradas, por favor, nos avise.⏎⏎Solicitamos a gentileza de confirmar o recebimento deste e-mail.⏎⏎Estamos à disposição para esclarecer quaisquer dúvidas ou realizar ajustes necessários.⏎⏎Agradecemos mais uma vez pela confiança depositada em nossa empresa e estamos ansiosos para continuar nossa parceria!⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]⏎" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
                  - ⟂ quando This:is_focused → border_color="var(--color_bTHGs_default)"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
            - **Group** `gp mail fornecedor` (bTyfx) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Group** `gp email fornecedor` (bTygB) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text MZZZZZZ` (bTygI) — text: "Email do fornecedor:"
                - **Group** `Group KZZZ` (bTygC) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                  - **Dropdown** `dd pedido emailfornecedor` (bTygD) — data_source: El[rpg pedido OrçFornecedores]:get_list_data:cpo.QualFornecedor:cpo.QuaisContatos · placeholder: "Selecione" · props: mandatory=False, default=Parent:cpo.EmailFornecedor, vertical_centering=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email:to_lowercase}"
                    - ⟂ quando El[chk formalizar]:get_data → mandatory=True
                  - **Icon** `Icon XZ` (bTygH) — props: icon="material outlined contact_phone"
              - **Group** `gp email fornecedor copy` (bTygP) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text NZZZZZZZZ` (bTygT) — text: "CC email fornecedor:"
                - **Input** `ipt cc email fornecedor` (bTygU) — placeholder: "Emails separados por ;" · props: mandatory=False
                  - ⟂ quando El[chk formalizar]:get_data → mandatory=True
              - **Group** `gp corpo pedidoemail fornecedor` (bTygJ) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **Text** `Text Corpo do e-mail ` (bTygO) — text: "Corpo do e-mail do fornecedor:"
                - **MultiLineInput** `ipt pedido corpoemailfornecedor` (bTygN) — placeholder: "" · content: "Olá {El[dd pedido emailfornecedor]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Segue abaixo observações importantes sobre o pedido: ⏎⏎Todas as informações sobre o cliente consta no anexo do pedido. Caso precise de mais alguma informação peço por gentileza que nos solicite⏎⏎Lembrando que a comissão do pedido obedece os seguintes critérios:⏎⏎{Parent:cpo.QuaisOrcamentosFonecedores:format_as_text(content="{InjectedValue:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - comissão unitário {InjectedValue:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="comma")}", delimiter="⏎")}⏎⏎Totalizando a comissão em {Parent:cpo.QuaisOrcamentosFonecedores:cpo.ValorComissaoBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎⏎[b]Informações importantes:[/b]⏎O setor financeiro entrará em contato para negociar a forma de pagamento, que poderá ser por boleto bancário ou depósito. Caso prefira, você também pode enviar um e-mail diretamente para: financeiro@grupomegabox.com.br.⏎⏎Se o boleto for emitido, mas o pagamento for realizado via PIX ou depósito, solicitamos que a baixa seja feita imediatamente. Isso evita o encaminhamento do boleto ao cartório e a consequente geração de encargos como custas cartorárias, multas e juros.⏎⏎Ressaltamos que o Grupo MegaBox não se responsabiliza por eventuais encargos decorrentes da ausência de baixa do boleto.⏎⏎Conforme informado no início da parceria, a responsabilidade pela análise e liberação de crédito é inteiramente do FORNECEDOR. A MegaBox não realiza nem se responsabiliza por essa análise cadastral.⏎⏎Em casos de atrasos ou antecipações nas entregas, pedimos que o vendedor responsável seja informado com antecedência, para que possa comunicar o cliente e evitar custos desnecessários com frete.⏎⏎Agradecemos pela confiança e parceria com o Grupo MegaBox.⏎⏎⏎Atenciosamente...⏎{CurrentUser:cpo.NomeModelo:to_capitalized_words}⏎⏎[color=#8555e2]Grupo Mega Box – Solução Comercial⏎(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 whatsapp[/color]" · props: unique_id="remodela", placeholder_color="var(--color_bTHGl_default)"
                  - ⟂ quando This:is_focused → border_color="var(--color_bTHGs_default)"
                  - ⟂ quando This:isnt_valid → border_color="var(--color_bTHHQ_default)", font_color="var(--color_bTHHQ_default)"
          - **Group** `gp coluna direita` (bTyfN) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - **Group** `gp anexo ordem` (bTyfX) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text DZZ` (bTyfY) — text: "Anexo ordem de compra cliente:"
              - **Group** `Group JZZZZ` (bTyfZ) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **FileInput** `upf pedido ordemcompra file` (bTyfd) — placeholder: "Selecione o arquivo (máx 3mb)" · props: mandatory=False, font_alignment="left", src="{Parent:cpo.OrdemCompraArquivo}", max_size=3
                - **Icon** `Icon R` (bTyfe) — props: icon="material outlined open_in_new"
                  - ⟂ quando El[upf pedido ordemcompra file]:get_data:is_not_empty → is_visible=True
                  - ⟂ quando El[upf pedido ordemcompra file]:get_data:is_empty → is_visible=True
            - **Group** `gp num ordem` (bTyff) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text DZZ` (bTyfj) — text: "Núm ordem de compra cliente:"
              - **Input** `ipt pedido ordemcompra numero` (bTyfk) — placeholder: "000000" · content: "{Parent:cpo.OrdemComrpaNum}" · props: mandatory=False
            - **Group** `gp informacoes adicionais` (bTyfR) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
              - **Text** `Text RZZZZZZ` (bTyfT) — text: "Informações adicionais no pedido:"
              - **MultiLineInput** `ipt pedido infoadd` (bTyfS) — placeholder: "" · content: "{Parent:cpo.InformacoesAdd}" · props: unique_id="remodela"
            - **Group** `g FileUploader copy` (bTyfl) — data_source: Parent · props: group_type="custom.tbl_pedidos"
              - **Text** `Text VZZZZZZZ` (bTyfv) — text: "Condições de pagamento:"
              - **Group** `Group TZZZZZZ` (bTyfp) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
                - **select2-MultiDropdown** `dd parcelas receb comissao` (bTyfr) — data_source: All(Opt.ParcelasReceber) · placeholder: "Selecione" · props: default=Parent:cpo.PrazoRecebComissoes, dynamic_type="option.opt_parcelasreceber", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
                - **Dropdown** `dd formapagto` (bTyfq) — data_source: All(Opt.FormaPgto) · placeholder: "Pix, boleto, transferência" · props: default=Parent:cpo.FormaPagto, vertical_centering=True, dynamic_type="option.opt_formapgto", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
        - **Table** `rpg pedido OrçFornecedores` (bTyev) — data_source: Parent:cpo.QuaisOrcamentosFonecedores · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=10
          - **TableCrossAxis** `TableCrossAxis N` (bTyeo) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell ZZZZ` (bTyen) — props: cell_main_axis_id="bTyeu"
              - **Group** `Group WZZ` (bTyeL) — props: vertical_centering=True
                - **Icon** `Icon FZZ` (bTyei) — props: icon="material outlined mode_edit", vertical_centering=True, button_disabled=True, title_attribute="Edite quantidade e valores dos produtos antes de informar entregas"
                  - ⟂ quando CurrentUser:equals(El[pop add edita pedido]:get_group_data:Created By) → icon_color="var(--color_primary_default)", button_disabled=False
                  - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → icon_color="var(--color_primary_default)", button_disabled=False
                - **Text** `Text DZZ` (bTyeP) — text: "Produtos & Fornecedor" · props: word_spacing=-0.5
                - **CustomElement** `tool.EnderecoFornecedor A` (bTyej) — USA Reusable tool.EnderecoFornecedor · data_source: Ancestor[TableCrossAxis] · props: custom_id="bThmz1"
                - **Text** `Text MZZZZZ` (bTyeQ) — text: "Qtd" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text EZZ` (bTyeR) — text: "Comissão" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text OZZZZZZ` (bTyeh) — text: " " · props: font_alignment="center"
                - **Text** `Text LZZZZZ` (bTyeV) — text: "Frete" · props: font_alignment="center", word_spacing=-0.5
                - **Text** `Text CZZZZZZ` (bTyeW) — text: " " · props: font_alignment="center"
                - **Text** `Text NZZZZZ` (bTyeX) — text: "Valor Bruto" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text KZZZZZ` (bTyeb) — text: "Tributos" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTyec) — text: "Valor líq" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text TZZZZZ` (bTyed) — text: "Faturar ⏎para:" · props: font_alignment="center", word_spacing=-0.5
              - **Group** `Group UZZ` (bTydg) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - **Group** `Group NZZ` (bTyeE) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                  - **Text** `Text DZZ` (bTyeF) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}" · props: word_spacing=-0.5
                  - **Text** `Text HZZZZZ` (bTyeJ) — text: "{Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Condicao:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Linha:display} - {Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto:cpo.Medida}" · props: word_spacing=-0.5
                - **Text** `Text DZZ` (bTydn) — text: "{Ancestor[TableCrossAxis]:cpo.QtdVenda:format_number(decimal_place=0, thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text JZZZZZ` (bTydr) — text: "{Ancestor[TableCrossAxis]:cpo.ValorComissaoBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                  - ⟂ quando El[gp alerta divergencia comissao]:is_visible → font_color="var(--color_bTHHQ_default)"
                - **CustomElement** `tool.EnderecoEntrega A` (bTyeK) — USA Reusable tool.EnderecoEntrega · data_source: Parent · props: custom_id="bTbjh"
                - **Group** `Group OZZ` (bTydh) — props: vertical_centering=True
                  - **Text** `Text DZZ` (bTydl) — text: "{Ancestor[TableCrossAxis]:cpo.TipoFrete:display}" · props: font_alignment="center", word_spacing=-0.5
                  - **Text** `Text IZZZZZ` (bTydm) — text: "{Ancestor[TableCrossAxis]:cpo.ValorFrete:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                - **Group** `btn add entrega no pedido` (bTydy) — props: vertical_centering=True
                  - **HTML** `htm botao entrega` (bTydz) — html(534 chars)
                    - ⟂ quando El[linha orcamentofornecedor]:get_group_data:cpo.QtdVenda:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum):equals(0) → min_height_css="0px"
                - **Text** `Text DZZ` (bTyds) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, border_color_left="var(--color_primary_contrast_default)", border_style_left="solid", border_width_left=2, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTydt) — text: "{Ancestor[TableCrossAxis]:cpo.ValorICMS:plus(Ancestor[TableCrossAxis]:cpo.ValorIPI):plus(Ancestor[TableCrossAxis]:cpo.ValorPISCOFINS):format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **Text** `Text DZZ` (bTydx) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5, four_border_style=True, border_color_right="var(--color_primary_contrast_default)", border_style_right="solid", border_width_right=2
                - **CustomElement** `tool.EnderecoCobranca A` (bTyeD) — USA Reusable tool.EnderecoCobranca · data_source: Parent · props: custom_id="bTbWm"
              - **Group** `linha orcamentofornecedor` (bTydf) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisEntregas:count:less_than(1) → is_visible=False
                - **Table** `rpg entregas do produto` (bTydb) — data_source: Ancestor[TableCrossAxis]:cpo.QuaisEntregas · props: group_type="custom.tbl_entregas", vertical_centering=True, vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
                  - **TableCrossAxis** `TableCrossAxis O` (bTycG) — props: axis_index=1, cross_axis_repeat=True
                    - **TableCell** `Cell AZZZZ` (bTybK) — props: cell_main_axis_id="bTycH"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHJ_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **DateInput** `ipt entrega dataprevista` (bTybL) — placeholder: "___/___/____" · content: Ancestor[TableCrossAxis]:cpo.DataEntrega · auto_binding: True · props: font_alignment="center", vertical_centering=True, word_spacing=-0.5, bind_field="cpo_dataentrega_date", overwrite_placeholder=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → bgcolor="var(--color_bTHGh_default)", disabled=True
                    - **TableCell** `###Cell 1C` (bTybP) — props: cell_main_axis_id="bTycL"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHJ_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Icon** `force calc` (bTybQ) — props: icon="material outlined calculate", title_attribute="Refaz o cálculo dos valores dessa entrega"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro) → icon_color="var(--color_bTHGl_default)", button_disabled=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro):and_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor)) → button_disabled=False
                      - **Input** `ipt entrega qtd` (bTybR) — placeholder: "000" · content: Ancestor[TableCrossAxis]:cpo.QtdEntrega · auto_binding: True · content_format: "int_number" · props: mandatory=False, font_alignment="center", vertical_centering=True, word_spacing=-0.5, bind_field="cpo_qtdentrega_number", show_thousands=True, not_submit_on_enter=False, have_a_numerical_range=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → bgcolor="var(--color_bTHGh_default)", disabled=True
                    - **TableCell** `Cell AZZZZ` (bTybV) — props: cell_main_axis_id="bTycM"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text VZZZZZ` (bTybW) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell CZZZZ` (bTybX) — props: cell_main_axis_id="bTydT"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text WZZZZZ` (bTybb) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.ValorVendaBruto:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell EZZZZ` (bTybc) — props: cell_main_axis_id="bTydU"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Text** `Text XZZZZZ` (bTybd) — text: "{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado) → text="[s]{Ancestor[TableCrossAxis]:cpo.ValorVendaLiquido:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/s]", font_color="var(--color_bTHHQ_default)"
                    - **TableCell** `Cell KZZZZ` (bTybh) — props: cell_main_axis_id="bTydV"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **CustomElement** `tool.AnexaNf A` (bTybi) — USA Reusable pop.AnexaNf · data_source: Ancestor[TableCrossAxis] · props: custom_id="bTbua", unique_id="toolsaiuentrega"
                    - **TableCell** `Cell GZZZZ` (bTybj) — props: cell_main_axis_id="bTydZ"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Icon** `btn cancelanetrega` (bTybo) — props: icon="material outlined event_busy", vertical_centering=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:not_equals(Opt.Etapas.Financeiro)) → is_visible=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_false → is_visible=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → icon_color="var(--color_bTHGl_default)", is_visible=True, button_disabled=True
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → icon_color="var(--color_bTHGl_default)", is_visible=True, button_disabled=True
                        - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2
                      - **Icon** `chk entrega pra deletar` (bTybn) — props: icon="material outlined check_box_outline_blank"
                        - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true → is_visible=False
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_false → is_visible=True
                    - **TableCell** `Cell SZZZZ` (bTybp) — props: cell_main_axis_id="bTyda"
                      - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis]) → background_style="bgcolor", bgcolor="rgba(var(--color_alert_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Em Entrega)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.05)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → background_style="bgcolor", bgcolor="var(--color_bTHHP_default)"
                      - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)) → background_style="bgcolor", bgcolor="rgba(var(--color_bTHHX_default_rgb), 0.05)"
                      - **Group** `gp notas` (bTybt) — props: vertical_centering=True
                        - **Text** `Text BZZZZZZZ` (bTybu) — text: "Nf: {Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: word_spacing=-0.5
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                        - **Icon** `Icon DZZZ` (bTybv) — props: icon="material outlined attach_file", vertical_centering=True
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor:is_empty → icon_color="var(--color_bTHGl_default)"
                      - **Group** `gp boletos` (bTybz) — props: vertical_centering=True
                        - **Text** `Text YZZZZZZZZ` (bTycA) — text: "Boletos ({Ancestor[TableCrossAxis]:cpo.BoletoArquivos:count})" · props: word_spacing=-0.5
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                        - **Icon** `Icon FZZZ` (bTycB) — props: icon="material outlined attach_file", vertical_centering=True
                          - ⟂ quando Ancestor[TableCrossAxis]:cpo.BoletoArquivos:count:less_than(1) → icon_color="var(--color_bTHGl_default)"
                      - **Text** `Text LZZZZZZ` (bTycF) — text: "Etapa: {Ancestor[TableCrossAxis]:cpo.StatusEntrega:display}" · props: word_spacing=-0.5
                        - ⟂ quando Ancestor[TableCrossAxis]:cpo.SaiuEntrega:is_true:and_(Ancestor[TableCrossAxis]:cpo.StatusEntrega:equals(Opt.Etapas.Cancelado)) → font_color="var(--color_bTHHQ_default)"
                  - **TableMainAxis** `TableMainAxis GZZ` (bTycH) — props: axis_index=1
                  - **TableMainAxis** `TableMainAxis GZZ` (bTycL) — props: axis_index=2
                  - **TableMainAxis** `TableMainAxis GZZ` (bTycM) — props: axis_index=3
                  - **TableCrossAxis** `TableCrossAxis O` (bTycN) — props: axis_index=0
                    - **TableCell** `Cell AZZZZ` (bTycR) — props: cell_main_axis_id="bTycH"
                      - **Text** `Text OZZZZZ` (bTycS) — text: "Dt prev. entrega" · props: font_alignment="center", word_spacing=-0.5
                    - **TableCell** `Cell AZZZZ` (bTycT) — props: cell_main_axis_id="bTycL"
                      - **Text** `Text PZZZZZ` (bTycX) — text: "Qtd entrega: {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group SZZZ` (bTycY) — props: vertical_centering=True
                        - **Text** `Text UZZZZZ` (bTycZ) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltaqtd]:get_data:greater_than(0):or_(El[ipt faltaqtd]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltaqtd` (bTycd) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.QtdVenda:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:cpo.QtdEntrega:sum) · content_format: "int_number" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, show_thousands=True, placeholder_color="var(--color_bTHGl_default)"
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell AZZZZ` (bTyce) — props: cell_main_axis_id="bTycM"
                      - **Text** `Text QZZZZZ` (bTycf) — text: "Comissão {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group PZZZZZZ` (bTycj) — props: vertical_centering=True
                        - **Text** `Text HZZZZZZZZZ` (bTyck) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltacomissao]:get_data:greater_than(0):or_(El[ipt faltacomissao]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltacomissao` (bTycl) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorComissaoBruto:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.valorcomissao:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell BZZZZ` (bTycp) — props: cell_main_axis_id="bTydT"
                      - **Text** `Text RZZZZZ` (bTycq) — text: "Valor bruto {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaBruto:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group QZZZZZZ` (bTycr) — props: vertical_centering=True
                        - **Text** `Text IZZZZZZZZZ` (bTycv) — text: "Falta: " · props: word_spacing=-0.5
                          - ⟂ quando El[ipt faltabruto]:get_data:greater_than(0):or_(El[ipt faltabruto]:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                        - **Input** `ipt faltabruto` (bTycw) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorVendaBruto:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaBruto:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell DZZZZ` (bTycx) — props: cell_main_axis_id="bTydU"
                      - **Text** `Text SZZZZZ` (bTydB) — text: "Valor líq {El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaLiquido:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center", word_spacing=-0.5
                      - **Group** `Group RZZZZZZ` (bTydC) — props: vertical_centering=True
                        - **Text** `Text YZZZZZ` (bTydD) — text: "Falta: " · props: word_spacing=-0.5
                        - **Input** `ipt faltaliquido` (bTydH) — placeholder: "" · content: El[linha orcamentofornecedor]:get_group_data:cpo.ValorVendaLiquido:minus(El[linha orcamentofornecedor]:get_group_data:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="not equal"}}):cpo.ValorVendaLiquido:sum) · content_format: "currency" · props: vertical_centering=True, word_spacing=-0.5, disabled=True, currency_symbol="R$ ", placeholder_color="var(--color_bTHGl_default)", always_show_decimals=True
                          - ⟂ quando This:get_data:greater_than(0):or_(This:get_data:less_than(0)) → font_color="var(--color_bTHHQ_default)", font_weight="500"
                    - **TableCell** `Cell JZZZZ` (bTydI) — props: cell_main_axis_id="bTydV"
                    - **TableCell** `Cell FZZZZ` (bTydJ) — props: cell_main_axis_id="bTydZ"
                      - **Icon** `Icon VZZ` (bTydN) — props: icon="material outlined delete_outline", button_disabled=True
                        - ⟂ quando El[pop add edita pedido]:custom.var_deletarentregas_:count:greater_or_equal_than(1) → icon_color="var(--color_bTHHQ_default)", button_disabled=False
                    - **TableCell** `Cell RZZZZ` (bTydO) — props: cell_main_axis_id="bTyda"
                      - **Text** `Text AZZZZZZZ` (bTydP) — text: "Núm NF " · props: font_alignment="center", word_spacing=-0.5
                  - **TableMainAxis** `TableMainAxis HZZ` (bTydT) — props: axis_index=4
                  - **TableMainAxis** `TableMainAxis IZZ` (bTydU) — props: axis_index=5
                  - **TableMainAxis** `TableMainAxis MZZ` (bTydV) — props: axis_index=7
                  - **TableMainAxis** `TableMainAxis JZZ` (bTydZ) — props: axis_index=0
                  - **TableMainAxis** `TableMainAxis RZZ` (bTyda) — props: axis_index=6
          - **TableCrossAxis** `TableCrossAxis N` (bTyep) — props: axis_index=0
            - **TableCell** `Cell ZZZZ` (bTyet) — props: cell_main_axis_id="bTyeu"
          - **TableMainAxis** `TableMainAxis FZZ` (bTyeu) — props: axis_index=1
        - **Group** `gp alerta divergencia comissao` (bTyhP) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - ⟂ quando El[ipt difereca comissao]:get_data:greater_than(0):or_(El[ipt difereca comissao]:get_data:less_than(0)) → is_visible=True
          - **Icon** `Icon WZZ` (bTyhX) — props: icon="material outlined info"
          - **Text** `Text VZZZZZZ` (bTyhQ) — text: "Existe uma diferença de [b]{El[ipt difereca comissao]:get_data:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}[/b] na comissão das entregas agendadas. Recalcule os valores antes de enviar o pedido."
          - **Input** `ipt comissao dos orcamentos` (bTyhR) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisOrcamentosFonecedores:cpo.ValorComissaoBruto:sum · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Input** `ipt soma comissao das entregas` (bTyhV) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:cpo.valorcomissao:sum · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Input** `ipt difereca comissao` (bTyhW) — oculto ao carregar · placeholder: "" · content: El[ipt comissao dos orcamentos]:get_data:minus(El[ipt soma comissao das entregas]:get_data) · content_format: "int_number" · props: vertical_centering=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
        - **Group** `gp alerta falta data entrega` (bTyhb) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - ⟂ quando Parent:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_dataentrega_date", value=∅, constraint_type="is_empty"}}):count:greater_or_equal_than(1) → is_visible=True
          - **Icon** `Icon CZZZ` (bTyhd) — props: icon="material outlined info"
          - **Text** `Text SZZZZZZ` (bTyhc) — text: "Existem entregas sem data prevista."
        - **Group** `gp alerta conclusaopedido` (bTyhj) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp retira pedido listagem copy` (bTyhn) — oculto ao carregar · data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando Parent:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count:greater_than(0):and_(El[ipt pedido contaentrega]:get_data:equals(El[ipt pedido entregasconcluidas]:get_data)) → is_visible=True
            - **Icon** `Icon XZZ` (bTyhp) — props: icon="material outlined info"
            - **Text** `Text CZZZZZZZ` (bTyho) — text: "Todas entregas já foram concluidas e/ou canceladas. Deseja retirar esse pedido da lista de pedidos? "
            - **Button** `Button P` (bTyht) — text: "retira pedido" · props: icon="material outlined playlist_remove", vertical_centering=True, icon_size=16, button_type="label_icon"
              - ⟂ quando This:is_hovered → font_color="var(--color_primary_contrast_default)", icon_color="var(--color_primary_contrast_default)", bgcolor="var(--color_bTHGt_default)"
            - **Input** `ipt pedido contaentrega` (bTyhv) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:filtered:count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
            - **Input** `ipt pedido entregasconcluidas` (bTyhu) — oculto ao carregar · placeholder: "" · content: Parent:cpo.QuaisEntregas:filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.StatusEntrega:concluido:is_true, constraint_type=∅}}):count · content_format: "int_number" · props: font_alignment="center", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
          - **Link** `Link A` (bTyhz) — text: "[fa]file-pdf-o[/fa]   pdf pedido" · props: linktype="url", open_in_new_tab=True, vertical_centering=True, url="{Parent:cpo.PedidoArquivo}", show_icon=False, unique_id="linkpedido"
            - ⟂ quando Parent:cpo.PedidoArquivo:is_not_empty → is_visible=True
            - ⟂ quando Parent:cpo.PedidoArquivo:is_empty → is_visible=False
        - **Group** `Group MZZ` (bTygt) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Group** `gp salvar` (bTygx) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Pedido) → is_visible=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido) → is_visible=False
            - **Button** `btn pedido salvar` (bTygz) — text: "Salvar"
            - **Button** `btn pedido cancelarsalvar` (bTygy) — text: "Cancela"
          - **Group** `gp gravar` (bTyhD) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Novo Pedido) → is_visible=True
            - ⟂ quando El[pop add edita pedido]:custom.var_acaocotacao_:equals(Opt.Ações.Edita Pedido) → is_visible=False
            - **Button** `btn pedido gravar` (bTyhF) — text: "Gravar" · props: vertical_centering=True
            - **Button** `btn pedido cancelargravar` (bTyhE) — text: "Cancela"
          - **Checkbox** `chk formalizar` (bTyhJ) — label: "Formalizar pedido por e-mail (cliente e fornecedor)" · props: vertical_centering=True
            - ⟂ quando Parent:cpo.PedidoFormalizado:is_true → label="Reenviar pedido por e-mail (cliente e fornecedor)"
            - ⟂ quando El[gp alerta divergencia comissao]:is_visible:and_(Parent:cpo.PedidoFormalizado:is_false) → contents="unchecked", label="Formalizar pedido por e-mail (existe inconsistencia de data/qtd)", disabled=True
            - ⟂ quando El[gp alerta falta data entrega]:is_visible:and_(Parent:cpo.PedidoFormalizado:is_true) → contents="unchecked", label="Reenviar pedido por e-mail (existe inconsistencia de data/qtd)", disabled=True
        - **Group** `gp gerador pdf` (bTyhK) — data_source: Parent · props: group_type="custom.tbl_pedidos", vertical_centering=True
          - **Plugin[1648430145817x673906689668022300]/AAc** `old PDF/IMG PEDIDO` (bTyhL)
  - **Icon** `btn pedido fecharjanela` (bTyiL) — props: icon="material outlined close"

## Workflows

#### WF bTyya — PageLoaded
1. **SetCustomState** [bTyyb] alvo El[reus cabecalho A] · value=Opt.MenuConfig.sub_licita__o_1, custom_state="custom.var_qualsubmenu_"
2. **Plugin[1558770956236x539499438875082750]/AAC** [bTyyf] 
3. **ChangePage** [bTyyg] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):and_(CurrentUser:cpo.UltimoDateRange:is_not_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min}"}, 1={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max}"}}, keep_current_page_params=True
4. **ChangePage** [bTyyh] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):or_(CurrentUser:cpo.UltimoDateRange:is_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
5. **ChangePage** [bTyyl] alvo El[Current page] · SÓ SE UrlParam("cotacaoarquivada" as text):is_empty · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="{∅}no"}}, keep_current_page_params=True
6. **ChangePage** [bTyym] alvo El[Current page] · SÓ SE UrlParam("ordemdecrescente" as text):is_empty · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}yes"}}, keep_current_page_params=True
7. **ChangePage** [bTyyn] alvo El[Current page] · SÓ SE UrlParam("expandircartoes" as text):is_empty · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}no"}}, keep_current_page_params=True
8. **ChangePage** [bTyyr] alvo El[Current page] · SÓ SE UrlParam("pedidosconcluidos" as None):is_empty · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}no"}}, keep_current_page_params=True
9. **ChangePage** [bTyys] alvo El[Current page] · SÓ SE CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) · add_parameters=True, url_parameters={0={key="vendedor", value="{CurrentUser:_id}"}}, keep_current_page_params=True
10. **ChangePage** [bTyyt] alvo El[Current page] · SÓ SE UrlParam("etapapedido" as option.opt_etapas):is_empty · add_parameters=True, url_parameters={0={key="etapapedido", value="{Opt.Etapas.Pedido:display}"}}, keep_current_page_params=True
11. **ChangePage** [bTyyx] alvo El[Current page] · SÓ SE UrlParam("etapaentrega" as option.opt_etapas):is_empty · add_parameters=True, url_parameters={0={key="etapaentrega", value="{Opt.Etapas.Em Entrega:display}"}}, keep_current_page_params=True

#### WF bTyyy — ButtonClicked em El[add produto]
- condição: El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação)
- props: workflow_disabled=False
1. **NewThing** [bTyyz] tipo Tbl.CotacaoProdutos · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data
2. **MakeChangeCurrentUser** [bTyzD] campos: cpo.TempOrcamentoProdutos = ResultOfStep[bTyyz]
3. **ResetGroup** [bTyzE] alvo El[gp add produto]

#### WF bTyzF — ButtonClicked em El[Icon IZZZ]
- condição: El[pop add fornecedor]:custom.varfornecedoresselecionados_:not_contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTyzJ] alvo El[pop add fornecedor] · value=El[pop add fornecedor]:custom.varfornecedoresselecionados_:plus_element(Ancestor[TableCrossAxis]), custom_state="custom.varfornecedoresselecionados_"

#### WF bTyzK — ButtonClicked em El[Icon IZZZ]
- condição: El[pop add fornecedor]:custom.varfornecedoresselecionados_:contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTyzL] alvo El[pop add fornecedor] · value=El[pop add fornecedor]:custom.varfornecedoresselecionados_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.varfornecedoresselecionados_"

#### WF bTyzP — ButtonClicked em El[Button E]
1. **ScheduleAPIEvent** [bTyzQ] date=Page.Current Date/Time, api_event="bTNrd", _wf_param_linha=El[pop add fornecedor]:get_group_data:cpo.Linha, _wf_param_medida="{El[pop add fornecedor]:get_group_data:cpo.Medida}", _wf_param_destino=El[dd end destino]:get_data, _wf_param_origens=El[pop add fornecedor]:custom.varfornecedoresselecionados_, _wf_param_condicao=El[pop add fornecedor]:get_group_data:cpo.Condicao, _wf_param_qtd laco=El[pop add fornecedor]:custom.varfornecedoresselecionados_:count, _wf_param_vendedor=CurrentUser, _wf_param_fila laco=1, _wf_param_orcamentoproduto=El[pop add fornecedor]:get_group_data
2. **SetCustomState** [bTyzR] alvo El[pop add fornecedor] · custom_state="custom.varfornecedoresselecionados_"
3. **HideElement** [bTyzV] alvo El[pop add fornecedor]

#### WF bTyzW — ButtonClicked em El[btn nova cotação]
- props: workflow_disabled=False
1. **ResetGroup** [bTyzX] alvo El[pop add edita cotacao]
2. **SetCustomState** [bTyzb] alvo El[Página vendas_bkp2] · value=Opt.Ações.Nova Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTyzc] alvo El[pop add edita cotacao]

#### WF bTyzd — ButtonClicked em El[btn cancelacotacao]
- props: event_color="brown"
1. **DeleteListOfThings** [bTyzh] to_delete=CurrentUser:cpo.TempOrcamentoProdutos, type_to_delete="custom.tbl_orcamentoprodutos"
2. **TriggerCustomEvent** [bTyzi] custom_event="bTzFW"
3. **HideElement** [bTyzj] alvo El[pop add edita cotacao]

#### WF bTyzn — ButtonClicked em El[btn adiciona fornecedor]
1. **DisplayGroupData** [bTyzo] alvo El[pop add fornecedor] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTyzp] alvo El[pop add fornecedor]

#### WF bTyzt — InputChanged em El[dd tipofrete]
- condição: This:get_data:not_equals(Opt.TipoFrete.CIF Informado)
1. **ChangeThing** [bTyzu] campos: cpo.ValorFrete = ∅ · to_change=Ancestor[TableCrossAxis]
2. **ScheduleAPIEvent** [bTyzv] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTyzz — ButtonClicked em El[btn remove orcamentoproduto]
1. **DeleteListOfThings** [bTzAA] to_delete=El[rpg fornecedorescotacao]:get_list_data, type_to_delete="custom.tbl_orcamentfornecedores"
2. **MakeChangeCurrentUser** [bTzAB] campos: cpo.TempOrcamentoProdutos = Ancestor[TableCrossAxis]
3. **DeleteThing** [bTzAF] to_delete=Ancestor[TableCrossAxis]

#### WF bTzAG — ButtonClicked em El[btn remove orcamento fornecedor]
1. **Plugin[1689356815386x980566006617866200]/AAC** [bTzAH] 
2. **DeleteThing** [bTzAL] to_delete=Ancestor[TableCrossAxis]

#### WF bTzAM — ButtonClicked em El[btn gravarcotacao]
- props: event_color="blue"
1. **NewThing** [bTzAN] tipo Tbl.Cotacao · campos: cpo.DataValidade = El[ip data validade]:get_data; cpo.CotacaoNum = Search(Tbl.Cotacao):cpo.CotacaoNum:last_element:plus(1); cpo.CotacaoStatus = Opt.CotacaoStatus.Em andamento; cpo.QuaisProdutos = El[rpg produto orcamento]:get_list_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.EmpresaMegabox = El[rd empresa megabox]:get_data; cpo.QualVendedor = CurrentUser
2. **ChangeListOfThings** [bTzAR] campos: cpo.QualCotacao = ResultOfStep[bTzAN]; cpo.QualCliente = ResultOfStep[bTzAN]:cpo.QualCliente · to_change=CurrentUser:cpo.TempOrcamentoProdutos, type_to_change="custom.tbl_orcamentoprodutos"
3. **ChangeListOfThings** [bTzAS] campos: cpo.QualCotacao = ResultOfStep[bTzAN] · to_change=CurrentUser:cpo.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
4. **TriggerCustomEvent** [bTzAT] custom_event="bTzFW"
5. **HideElement** [bTzAX] alvo El[pop add edita cotacao]
6. **SetCustomState** [bTzAY] alvo El[pop.AgendaEnderecos A] · custom_state="custom.var_recemcadastrado_"

#### WF bTzAZ — ButtonClicked em El[Icon P]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_true
1. **ChangeThing** [bTzAd] campos: cpo.Vencedor = False · to_change=Ancestor[TableCrossAxis]

#### WF bTzAe — ButtonClicked em El[Icon P]
- condição: Ancestor[TableCrossAxis]:cpo.Vencedor:is_false
1. **ChangeThing** [bTzAf] campos: cpo.Vencedor = False · to_change=El[rpg fornecedorescotacao]:get_list_data:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}):first_element
2. **ChangeThing** [bTzAj] campos: cpo.Vencedor = True · to_change=Ancestor[TableCrossAxis]

#### WF bTzAk — ButtonClicked em El[Text P]
1. **ToggleElement** [bTzAl] alvo El[rpg fornecedorescotacao]
2. **ToggleElement** [bTzAp] alvo El[txt titulo icms]
3. **ToggleElement** [bTzAq] alvo El[txt titulo piscofins]

#### WF bTzAr — InputChanged em El[ip valorvenda]
1. **PauseWFClient** [bTzAv] length=1000
2. **ScheduleAPIEvent** [bTzAw] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzBs — InputChanged em El[ip valorcomissao]
1. **PauseWFClient** [bTzBt] length=1000
2. **ScheduleAPIEvent** [bTzBx] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzBy — InputChanged em El[ip icms]
1. **PauseWFClient** [bTzBz] length=1000
2. **ScheduleAPIEvent** [bTzCD] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzCE — InputChanged em El[Input B]
1. **ChangeThing** [bTzCF] campos: cpo.qtd = This:get_data · to_change=Ancestor[TableCrossAxis]
2. **ChangeListOfThings** [bTzCJ] campos: cpo.QtdVenda = This:get_data · to_change=Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
3. **ScheduleAPIEvent** [bTzCK] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosForncededores

#### WF bTzCL — ButtonClicked em El[Icon B]
1. **ToggleElement** [bTzCP] alvo El[rpg fornecedorescotacao]
2. **ToggleElement** [bTzCQ] alvo El[txt titulo icms]
3. **ToggleElement** [bTzCR] alvo El[txt titulo piscofins]

#### WF bTzAx — InputChanged em El[ip piscofins]
1. **PauseWFClient** [bTzBB] length=1000
2. **ScheduleAPIEvent** [bTzBC] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzBD — InputChanged em El[ip valorfrete]
1. **PauseWFClient** [bTzBH] 
2. **ScheduleAPIEvent** [bTzBI] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzBJ — ButtonClicked em El[btn proposta gravar]
- props: event_color="blue", workflow_disabled=True
1. **SetCustomState** [bTzBN] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTzBO] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.AnexosDiversos = El[bTzZJ]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTzBP] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTzBO]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTzBT] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTzBO]
5. **ChangeThing** [bTzBU] campos: cpo.QuaisPropostas = ResultOfStep[bTzBO] · to_change=El[pop add edita propostas]:get_group_data
6. **Plugin[1648430145817x673906689668022300]/AAL** [bTzBV] alvo El[PDF/IMG PROPOSTA] · AAM="corponovaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTzBO]:cpo.PropostaNum}", AAf=False
7. **SetCustomState** [bTzBZ] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
8. **ResetGroup** [bTzBa] alvo El[gp add edita proposta]

#### WF bTzBb — ButtonClicked em El[Icon KZ]
1. **ShowElement** [bTzBf] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTzBg] alvo El[pop.AgendaContatos A] · data_source=El[pop add edita propostas]:get_group_data:cpo.QualCliente

#### WF bTzBh — ButtonClicked em El[Icon LZ]
1. **ShowElement** [bTzBl] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzBm] alvo El[pop.AgendaEnderecos A] · value=El[pop add edita propostas]:get_group_data:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTzBn — ButtonClicked em El[Icon TZZ]
1. **ShowElement** [bTzBr] alvo El[pop consulta icms]

#### WF bTzDZ — ButtonClicked em El[Icon IZ]
1. **Plugin[1659259586969x934092730321338400]/AAD** [bTzDd] 
2. **Plugin[1658328157117x953686184769617900]/AAT** [bTzDe] AAF="Valor de alíquota copiada", AAG=3000

#### WF bTzDf — ButtonClicked em El[btn proposta salvar]
- props: event_color="orange"
1. **SetCustomState** [bTzDj] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTzDk] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTzDl] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTzDk]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTzDp] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTzDk]
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTzDq] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTzDk]:cpo.PropostaNum}", AAf=False
6. **SetCustomState** [bTzDr] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
7. **ResetGroup** [bTzDv] alvo El[gp add edita proposta]

#### WF bTzDw — ButtonClicked em El[btn proposta salvarenviar]
- props: event_color="orange", workflow_disabled=False
1. **SetCustomState** [bTzDx] alvo El[pop add edita propostas] · value=True, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTzEB] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.PropostaEnviada = True · to_change=Parent
3. **ChangeListOfThings** [bTzEC] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTzEB]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTzED] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTzEB]
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTzEH] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTzEB]:cpo.PropostaNum}", AAf=False
6. **SetCustomState** [bTzEI] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
7. **ResetGroup** [bTzEJ] alvo El[gp add edita proposta]

#### WF bTzEN — ButtonClicked em El[Icon MZ]
1. **SetCustomState** [bTzEO] alvo El[pop add edita propostas] · value=Opt.Ações.Edita Proposta, custom_state="custom.var_acaocotacao_"
2. **DisplayGroupData** [bTzEP] alvo El[gp add edita proposta] · data_source=Ancestor[TableCrossAxis]

#### WF bTzET — ButtonClicked em El[Button M]
1. **SetCustomState** [bTzEU] alvo El[pop add edita propostas] · value=Opt.Ações.Nova Proposta, custom_state="custom.var_acaocotacao_"
2. **CopyListOfThings** [bTzEV] to_copy=Parent:cpo.QuaisProdutos:cpo.QuaisOrcamentosForncededores:filtered(constraints={0={key="cpo_vencedor_boolean", value=True, constraint_type="equals"}}), type_to_copy="custom.tbl_orcamentfornecedores"
3. **NewThing** [bTzEZ] tipo Tbl.Propostas · campos: cpo.QuaisOrcamentosFornecedores = ResultOfStep[bTzEV]; cpo.QualCotacao = Parent; cpo.QualVendedor = CurrentUser
4. **ChangeListOfThings** [bTzEa] campos: cpo.QualProposta = ResultOfStep[bTzEZ] · to_change=ResultOfStep[bTzEV], type_to_change="custom.tbl_orcamentfornecedores"
5. **DisplayGroupData** [bTzEb] alvo El[gp add edita proposta] · data_source=ResultOfStep[bTzEZ]

#### WF bTzEf — ButtonClicked em El[btn proposta cancelagravar]
1. **ChangeListOfThings** [bTzEg] campos: cpo.QualProposta = ∅ · to_change=Parent:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
2. **DeleteThing** [bTzEh] to_delete=Parent
3. **ResetGroup** [bTzEl] alvo El[gp add edita proposta]
4. **SetCustomState** [bTzEm] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"

#### WF bTzEn — ButtonClicked em El[btn proposta cancelasalvar]
1. **ResetGroup** [bTzEr] alvo El[gp add edita proposta]
2. **SetCustomState** [bTzEs] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"

#### WF bTzEt — ButtonClicked em El[Icon NZ]
1. **OpenURL** [bTzEx] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.AquivoProposta}"

#### WF bTzEy — ButtonClicked em El[gp card cotacao]
1. **ToggleElement** [bTzEz] alvo El[gp resumo cotacao]

#### WF bTzCV — ButtonClicked em El[btn edita produto]
1. **DisplayGroupData** [bTzCW] alvo El[gp add produto] · data_source=Ancestor[TableCrossAxis]
2. **SetCustomState** [bTzCX] alvo El[Página vendas_bkp2] · value=Opt.Ações.Edita Produto, custom_state="custom.var_a__oor_amento_"

#### WF bTzCb — ButtonClicked em El[salvar produto]
1. **ChangeThing** [bTzCc] campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data · to_change=Parent
2. **ChangeListOfThings** [bTzCd] campos: cpo.QtdVenda = ResultOfStep[bTzCc]:cpo.qtd · to_change=Parent:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
3. **ScheduleAPIEvent** [bTzCh] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Parent:cpo.QuaisOrcamentosForncededores
4. **SetCustomState** [bTzCi] alvo El[Página vendas_bkp2] · value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"
5. **ResetGroup** [bTzCj] alvo El[gp add produto]

#### WF bTzCn — ButtonClicked em El[add produto]
- condição: El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Edita Cotação)
- props: workflow_disabled=False
1. **NewThing** [bTzCo] tipo Tbl.CotacaoProdutos · campos: cpo.Condicao = El[dd add condicao]:get_data; cpo.Linha = El[dd add linha]:get_data; cpo.Medida = "{El[ip add medida]:get_data}"; cpo.qtd = El[ip add qtd]:get_data; cpo.QualProduto = El[dd add modelo produto]:get_data; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.QualProdutoGrupo = El[dd add grupo produto]:get_data; cpo.QualCotacao = El[pop add edita cotacao]:get_group_data; cpo.QualEnderecoDestino = El[dd enderecoentregacliente]:get_data
2. **MakeChangeCurrentUser** [bTzCp] campos: cpo.TempOrcamentoProdutos = ResultOfStep[bTzCo]
3. **ResetGroup** [bTzCt] alvo El[gp add produto]

#### WF bTzCu — ButtonClicked em El[btn salvarcotacao]
- props: event_color="orange"
1. **ChangeThing** [bTzCv] campos: cpo.DataValidade = El[ip data validade]:get_data; cpo.QuaisProdutos = CurrentUser:cpo.TempOrcamentoProdutos; cpo.QualCliente = El[ipt buscacliente]:get_data; cpo.EmpresaMegabox = El[rd empresa megabox]:get_data · to_change=El[pop add edita cotacao]:get_group_data
2. **TriggerCustomEvent** [bTzCz] custom_event="bTzFW"
3. **ChangeListOfThings** [bTzDA] campos: cpo.QualCotacao = El[pop add edita cotacao]:get_group_data · to_change=El[rpg produto orcamento]:get_list_data:cpo.QuaisOrcamentosForncededores, type_to_change="custom.tbl_orcamentfornecedores"
4. **HideElement** [bTzDB] alvo El[pop add edita cotacao]

#### WF bTzDF — ButtonClicked em El[btn proposta gravarenviar]
- props: event_color="blue", workflow_disabled=False
1. **SetCustomState** [bTzDG] alvo El[pop add edita propostas] · value=True, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTzDH] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data; cpo.PropostaEnviada = True · to_change=Parent
3. **NewThing** [bTzDL] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Proposta número {ResultOfStep[bTzDH]:cpo.QualCotacao:cpo.CotacaoNum}/{ResultOfStep[bTzDH]:cpo.PropostaNum} enviada ao cliente no email {ResultOfStep[bTzDH]:cpo.EnviarPara:cpo.Email}")}"; cpo.QualCliente = ResultOfStep[bTzDH]:cpo.QualCotacao:cpo.QualCliente; cpo.QualVendedor = CurrentUser
4. **ChangeThing** [bTzDM] campos: cpo.UltimoHistoricoData = ResultOfStep[bTzDL]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTzDL] · to_change=ResultOfStep[bTzDL]:cpo.QualCliente
5. **ChangeListOfThings** [bTzDN] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTzDH]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
6. **ChangeThing** [bTzDR] campos: cpo.QuaisPropostas = ResultOfStep[bTzDH] · to_change=El[pop add edita propostas]:get_group_data
7. **DisplayGroupData** [bTzDS] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTzDH]
8. **Plugin[1648430145817x673906689668022300]/AAL** [bTzDT] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTzDH]:cpo.PropostaNum}", AAf=False
9. **SetCustomState** [bTzDX] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
10. **ResetGroup** [bTzDY] alvo El[gp add edita proposta]

#### WF bTzFD — ButtonClicked em El[btn edita orcamento]
1. **DisplayGroupData** [bTzFE] alvo El[pop add edita cotacao] · data_source=Ancestor[TableCrossAxis]
2. **SetCustomState** [bTzFF] alvo El[Página vendas_bkp2] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTzFJ] alvo El[pop add edita cotacao]

#### WF bTzFK — ButtonClicked em El[btn addedita proposta]
1. **SetCustomState** [bTzFL] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
2. **DisplayGroupData** [bTzFP] alvo El[pop add edita propostas] · data_source=Ancestor[TableCrossAxis]
3. **ShowElement** [bTzFQ] alvo El[pop add edita propostas]

#### WF bTzFR — ButtonClicked em El[btn expandir cartoes]
- condição: UrlParam("expandircartoes" as text):equals("yes")
1. **ChangePage** [bTzFV] alvo El[Current page] · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}no"}}, keep_current_page_params=True

#### WF bTzFW — CustomEvent
- props: event_name="fechar pop cotacao", event_color="purple"
1. **SetCustomState** [bTzFX] alvo El[Página vendas_bkp2] · custom_state="custom.var_a__oor_amento_", custom_states_values={0={value=∅, custom_state="custom.var_a__ovendas_"}}
2. **ResetGroup** [bTzFb] alvo El[pop add edita cotacao]
3. **ResetGroup** [bTzFc] alvo El[pop add fornecedor]
4. **MakeChangeCurrentUser** [bTzFd] campos: cpo.TempOrcamentoProdutos = ∅

#### WF bTzFh — ButtonClicked em El[btn abrir todos]
- condição: El[Página vendas_bkp2]:custom.var_todosfornecedores_:is_false
1. **SetCustomState** [bTzFi] alvo El[Página vendas_bkp2] · value=True, custom_state="custom.var_todosfornecedores_"

#### WF bTzFj — ButtonClicked em El[btn abrir todos]
- condição: El[Página vendas_bkp2]:custom.var_todosfornecedores_:is_true
1. **SetCustomState** [bTzFn] alvo El[Página vendas_bkp2] · value=False, custom_state="custom.var_todosfornecedores_"

#### WF bTzFo — CustomEvent
- props: event_name="Enviar Email Proposta", parameters={0={is_list=False, btype_id="custom.tbl_propostas", optional=False, param_id="bTaLh", param_name="par.QualProposta"}}, event_color="purple"
1. **ScheduleAPIEvent** [bTzFp] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{WFParam.par.QualProposta:cpo.EmailsCopia}", _wf_param_to="{WFParam.par.QualProposta:cpo.EnviarPara:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 5):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaProposta)}", _wf_param_body="{WFParam.par.QualProposta:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Orçamento: {Text("{WFParam.par.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{WFParam.par.QualProposta:cpo.PropostaNum}")} - Produtos: {Text("{WFParam.par.QualProposta:cpo.QuaisOrcamentosFornecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{WFParam.par.QualProposta:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}")}", _wf_param_atachments="{WFParam.par.QualProposta:cpo.AquivoProposta:url}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted

#### WF bTzFt — ButtonClicked em El[Icon OZZ]
1. **HideElement** [bTzFu] alvo El[pop add edita propostas]
2. **ResetGroup** [bTzFv] alvo El[pop add edita propostas]

#### WF bTzFz — ButtonClicked em El[btn arquivar]
- condição: Parent:cpo.Arquivado:is_false
1. **ShowElement** [bTzGA] alvo El[pop.ArquivaCotação]
2. **DisplayGroupData** [bTzGB] alvo El[pop.ArquivaCotação] · data_source=Parent

#### WF bTzGF — ButtonClicked em El[btn cotacao arquivada]
- condição: UrlParam("cotacaoarquivada" as text):equals("no")
1. **ChangePage** [bTzGG] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="yes"}}, keep_current_page_params=True

#### WF bTzGH — ButtonClicked em El[btn cotacao arquivada]
- condição: UrlParam("cotacaoarquivada" as text):equals("yes")
1. **ChangePage** [bTzGL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cotacaoarquivada", value="no"}}, keep_current_page_params=True

#### WF bTzGM — ButtonClicked em El[btn arquivar]
- condição: Parent:cpo.Arquivado:is_true
1. **ChangeThing** [bTzGN] campos: cpo.Arquivado = False; cpo.MotivoArquivamento = ∅ · to_change=Parent

#### WF bTzGR — ButtonClicked em El[btn data crescente]
- condição: UrlParam("ordemdecrescente" as text):equals("yes")
1. **ChangePage** [bTzGS] alvo El[Current page] · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}no"}}, keep_current_page_params=True

#### WF bTzGT — ButtonClicked em El[btn data crescente]
- condição: UrlParam("ordemdecrescente" as text):equals("no")
1. **ChangePage** [bTzGX] alvo El[Current page] · add_parameters=True, url_parameters={0={key="ordemdecrescente", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTzGY — ButtonClicked em El[seleciona proposta]
- condição: El[pop add edita propostas]:custom.var_exibeproposta_:not_equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTzGZ] alvo El[pop add edita propostas] · value=Opt.Ações.Exibe Proposta, custom_state="custom.var_acaocotacao_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_exibeproposta_"}}

#### WF bTzGd — ButtonClicked em El[seleciona proposta]
- condição: El[pop add edita propostas]:custom.var_exibeproposta_:equals(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTzGe] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_", custom_states_values={0={custom_state="custom.var_exibeproposta_"}}

#### WF bTzGf — ButtonClicked em El[Icon KZZZ] «btn criapedido»
- props: event_color="green"
1. **NewThing** [bTzGj] tipo Tbl.Pedido · campos: cpo.QuaisOrcamentosFonecedores = Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores; cpo.QualCotacao = Ancestor[TableCrossAxis]:cpo.QualCotacao; cpo.QualProposta = Ancestor[TableCrossAxis]; cpo.NumeroPedido = "{Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.CotacaoNum}"; cpo.QualCliente = Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.QualCliente; cpo.QualClienteTexto = "{Ancestor[TableCrossAxis]:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor}"; cpo.InformacoesAdd = "{Ancestor[TableCrossAxis]:cpo.InfoAdicional}"; cpo.QualPrimeiroFornecedor = Ancestor[TableCrossAxis]:cpo.QuaisOrcamentosFornecedores:first_element:cpo.QualEnderecoOrigem; cpo.QualVendedor = CurrentUser
2. **ChangeThing** [bTzGk] campos: cpo.CotacaoEtapa = Opt.Etapas.Pedir; cpo.QualPedido = ResultOfStep[bTzGj] · to_change=Ancestor[TableCrossAxis]:cpo.QualCotacao
3. **DisplayGroupData** [bTzGl] alvo El[pop add edita pedido] · data_source=ResultOfStep[bTzGj]
4. **SetCustomState** [bTzGp] alvo El[pop add edita pedido] · value=Opt.Ações.Novo Pedido, custom_state="custom.var_acaocotacao_"
5. **ShowElement** [bTzGq] alvo El[pop add edita pedido]

#### WF bTzGr — ButtonClicked em El[btn add entrega no pedido]
1. **NewThing** [bTzGv] tipo Tbl.Entregas · campos: cpo.QualCotacao = Ancestor[TableCrossAxis]:cpo.QualCotacao; cpo.QualOrcamentoFornecedor = Ancestor[TableCrossAxis]; cpo.QualProposta = El[pop add edita pedido]:get_group_data:cpo.QualProposta; cpo.DataEntrega = El[pop add edita pedido]:get_group_data:cpo.QualProposta:cpo.DtPrevEntrega; cpo.QualPedido = El[pop add edita pedido]:get_group_data; cpo.NumeroPedido = "{El[pop add edita pedido]:get_group_data:cpo.NumeroPedido}"; cpo.DtPedido = El[pop add edita pedido]:get_group_data:Created Date; cpo.QualClienteTexto = "{El[pop add edita pedido]:get_group_data:cpo.QualCliente:cpo.NomeCliFor}"; cpo.QualFornecedTexto = "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor}"; cpo.QualVendedor = El[pop add edita pedido]:get_group_data:cpo.QualCotacao:Created By; cpo.QualCliente = El[pop add edita pedido]:get_group_data:cpo.QualCliente; cpo.QualFornecedor = Ancestor[TableCrossAxis]:cpo.QualFornecedor
2. **ChangeThing** [bTzGw] campos: cpo.QuaisEntregas = ResultOfStep[bTzGv] · to_change=ResultOfStep[bTzGv]:cpo.QualPedido
3. **ChangeThing** [bTzGx] campos: cpo.QuaisEntregas = ResultOfStep[bTzGv] · to_change=Ancestor[TableCrossAxis]
4. **ChangeThing** [bTzHB] SÓ SE ResultOfStep[bTzGv]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(ResultOfStep[bTzGv]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = InjectedValue:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=ResultOfStep[bTzGv]

#### WF bTzHC — InputChanged em El[ipt entrega qtd]
1. **ScheduleAPIEvent** [bTzHD] date=Page.Current Date/Time, api_event="bTbPH", _wf_param_par^{p1}QualEntrega=Ancestor[TableCrossAxis]
2. **ResetGroup** [bTzHH] alvo El[gp corpo pedidoemail fornecedor]

#### WF bTzHI — ButtonClicked em El[btn edita pedido]
1. **DisplayGroupData** [bTzHJ] alvo El[pop add edita pedido] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTzHN] alvo El[pop add edita pedido]
3. **SetCustomState** [bTzHO] alvo El[pop add edita pedido] · value=Opt.Ações.Edita Pedido, custom_state="custom.var_acaocotacao_"

#### WF bTzHP — ButtonClicked em El[gp card pedido]
1. **ToggleElement** [bTzHT] alvo El[rpg show produtos pedido]

#### WF bTzHU — ButtonClicked em El[btn pedido gravar]
- condição: El[chk formalizar]:get_not_data
- props: event_color="blue"
1. **ChangeThing** [bTzHV] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.FormaPagto = El[dd formapagto]:get_data · to_change=Parent
2. **HideElement** [bTzHZ] alvo El[pop add edita pedido]
3. **ResetGroup** [bTzHa] alvo El[pop add edita pedido]

#### WF bTzHb — ButtonClicked em El[btn pedido salvar]
- condição: El[chk formalizar]:get_not_data
- props: event_color="orange"
1. **ChangeThing** [bTzHf] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data; cpo.FormaPagto = El[dd formapagto]:get_data · to_change=Parent
2. **HideElement** [bTzHg] alvo El[pop add edita pedido]
3. **ResetGroup** [bTzHh] alvo El[pop add edita pedido]

#### WF bTzHl — ButtonClicked em El[btn pedido salvar]
- condição: El[chk formalizar]:get_data
- props: event_color="orange", workflow_disabled=False
1. **ShowElement** [bTzHm] alvo El[gp alert gravando]
2. **ScrollToElement** [bTzHn] alvo El[gp alert gravando] · offset=-100
3. **ChangeThing** [bTzHr] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PedidoFormalizado = True; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data · to_change=Parent
4. **ChangeListOfThings** [bTzHs] campos: cpo.StatusEntrega = Opt.Etapas.Pedido · to_change=ResultOfStep[bTzHr]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTzHt] alvo El[old PDF/IMG PEDIDO] · AAM="corpopedido", AAO=800, AAP=1100, AAQ="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:find_replace(find=" "):to_uppercase}_PEDIDO{Parent:cpo.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}", AAf=False
6. **ResetInputs** [bTzHx] 

#### WF bTzHy — ButtonClicked em El[Icon XZ]
1. **ShowElement** [bTzHz] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTzID] alvo El[pop.AgendaContatos A] · data_source=El[rpg pedido OrçFornecedores]:get_list_data:cpo.QualFornecedor:first_element

#### WF bTzIE — ButtonClicked em El[chk entrega pra deletar]
- condição: El[pop add edita pedido]:custom.var_deletarentregas_:not_contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTzIF] alvo El[pop add edita pedido] · value=El[pop add edita pedido]:custom.var_deletarentregas_:plus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_deletarentregas_"

#### WF bTzIJ — ButtonClicked em El[chk entrega pra deletar]
- condição: El[pop add edita pedido]:custom.var_deletarentregas_:contains(Ancestor[TableCrossAxis])
1. **SetCustomState** [bTzIK] alvo El[pop add edita pedido] · value=El[pop add edita pedido]:custom.var_deletarentregas_:minus_element(Ancestor[TableCrossAxis]), custom_state="custom.var_deletarentregas_"

#### WF bTzIL — ButtonClicked em El[Icon VZZ]
1. **DeleteListOfThings** [bTzIP] to_delete=El[pop add edita pedido]:custom.var_deletarentregas_, type_to_delete="custom.tbl_entregas"
2. **SetCustomState** [bTzIQ] alvo El[pop add edita pedido] · custom_state="custom.var_deletarentregas_"

#### WF bTzIR — ButtonClicked em El[btn edita pedido]
1. **DisplayGroupData** [bTzIV] alvo El[pop add edita pedido] · data_source=Parent:cpo.QualPedido
2. **ShowElement** [bTzIW] alvo El[pop add edita pedido]
3. **SetCustomState** [bTzIX] alvo El[pop add edita pedido] · value=Opt.Ações.Edita Pedido, custom_state="custom.var_acaocotacao_"

#### WF bTzIb — ButtonClicked em El[Text BZZZZZZZ]
1. **OpenURL** [bTzIc] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTzId — ButtonClicked em El[force calc]
- props: event_color="purple"
1. **ScheduleAPIEvent** [bTzIh] date=Page.Current Date/Time, api_event="bTbPH", _wf_param_par^{p1}QualEntrega=Ancestor[TableCrossAxis]
2. **ResetGroup** [bTzIi] alvo El[gp corpo pedidoemail fornecedor]

#### WF bTzIj — ButtonClicked em El[btn confirmaentrega]
- props: event_color="purple"
1. **ChangeThing** [bTzIn] campos: cpo.dtentrega = El[dt dataentrega realizada]:get_data; cpo.ComprovanteEntrega = "{El[upf comprovanteentrega realizada]:get_data}"; cpo.StatusEntrega = Opt.Etapas.Financeiro · to_change=Parent
2. **ScheduleAPIEvent** [bTzIo] date=Page.Current Date/Time, api_event="bToYh", _wf_param_DtEntrega=ResultOfStep[bTzIn]:cpo.dtentrega, _wf_param_QualEntrega=ResultOfStep[bTzIn]
3. **HideElement** [bTzIp] alvo El[pop confirma entrega]
4. **ResetGroup** [bTzIt] alvo El[pop confirma entrega]
5. **ChangeThing** [bTzIu] SÓ SE ResultOfStep[bTzIn]:cpo.QualVendedor:cpo.FeriasPeriod:range_contains_point(ResultOfStep[bTzIn]:cpo.DataEntrega) · campos: cpo.QualVendedorSubstituto = InjectedValue:cpo.QualVendedor:cpo.QualVendedorSubstituto · to_change=ResultOfStep[bTzIn]

#### WF bTzIv — ButtonClicked em El[btn cencela confirmaentrega]
- condição: Parent:cpo.StatusEntrega:not_equals(Opt.Etapas.Financeiro)
1. **HideElement** [bTzIz] alvo El[pop confirma entrega]
2. **ResetGroup** [bTzJA] alvo El[pop confirma entrega]
3. **DeleteListOfThings** [bTzJB] to_delete=Parent:cpo.QuaisContasReceber, type_to_delete="custom.tbl_contasreceber"

#### WF bTzJZ — ButtonClicked em El[ico proposta]
1. **DisplayGroupData** [bTzJd] alvo El[pop confirma entrega] · data_source=Parent
2. **ShowElement** [bTzJe] alvo El[pop confirma entrega]

#### WF bTzJf — ButtonClicked em El[Icon YZ]
1. **ShowElement** [bTzJj] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTzJk] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.QualCotacao:cpo.QualCliente

#### WF bTzJl — PopupOpened em El[pop add edita cotacao]
- condição: El[Página vendas_bkp2]:custom.var_a__ovendas_:equals(Opt.Ações.Nova Cotação):and_(CurrentUser:cpo.TempOrcamentoProdutos:count:greater_or_equal_than(1))
1. **DeleteListOfThings** [bTzJp] to_delete=CurrentUser:cpo.TempOrcamentoProdutos:cpo.QuaisOrcamentosForncededores, type_to_delete="custom.tbl_orcamentfornecedores"
2. **DeleteListOfThings** [bTzJq] to_delete=CurrentUser:cpo.TempOrcamentoProdutos, type_to_delete="custom.tbl_orcamentoprodutos"

#### WF bTzJr — ButtonClicked em El[Icon JZ]
1. **ShowElement** [bTzJv] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzJw] alvo El[pop.AgendaEnderecos A] · value=Parent:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTzJF — ButtonClicked em El[btn pedido fecharjanela]
1. **ResetGroup** [bTzJG] alvo El[pop add edita pedido]
2. **HideElement** [bTzJH] alvo El[pop add edita pedido]

#### WF bTzJL — ButtonClicked em El[btn pedido cancelargravar]
- props: event_color="green"
1. **ResetGroup** [bTzJM] alvo El[pop add edita pedido]
2. **HideElement** [bTzJN] alvo El[pop add edita pedido]
3. **ChangeThing** [bTzJR] campos: cpo.CotacaoEtapa = Opt.Etapas.Cotação; cpo.QualPedido = ∅ · to_change=Parent:cpo.QualCotacao
4. **DeleteThing** [bTzJS] to_delete=Parent

#### WF bTzJT — ButtonClicked em El[btn pedido cancelarsalvar]
1. **ResetGroup** [bTzJX] alvo El[pop add edita pedido]
2. **HideElement** [bTzJY] alvo El[pop add edita pedido]

#### WF bTzJx — ButtonClicked em El[sort distance]
- condição: El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_false
1. **SetCustomState** [bTzKB] alvo El[pop add fornecedor] · value=True, custom_state="custom.var_distanciamaiormenor_"
2. **Plugin[1685525155901x838124401560125400]/AAC** [bTzKC] AAD="distancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTzKD — PopupOpened em El[pop add fornecedor]
1. **Plugin[1685525155901x838124401560125400]/AAC** [bTzKH] AAD="kmdistancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTzKI — ButtonClicked em El[sort distance]
- condição: El[pop add fornecedor]:custom.var_distanciamaiormenor_:is_true
1. **SetCustomState** [bTzKJ] alvo El[pop add fornecedor] · value=False, custom_state="custom.var_distanciamaiormenor_"
2. **Plugin[1685525155901x838124401560125400]/AAC** [bTzKN] AAD="distancia", AAE="rpgaddfornecedores", AAF=El[pop add fornecedor]:custom.var_distanciamaiormenor_, AAP=True

#### WF bTzKO — ButtonClicked em El[btn fecar add fornecedores]
1. **HideElement** [bTzKP] alvo El[pop add fornecedor]

#### WF bTzKT — ButtonClicked em El[Icon PZ]
1. **ShowElement** [bTzKU] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzKV] alvo El[pop.AgendaEnderecos A] · value=El[ipt buscacliente]:get_data, custom_state="custom.var_qualgrupoclifor_"

#### WF bTzKZ — ButtonClicked em El[btn cancelanetrega]
- condição: Ancestor[TableCrossAxis]:cpo.StatusEntrega:not_equals(Opt.Etapas.Cancelado)
1. **SetCustomState** [bTzKa] alvo El[pop cancelar entrega e pedido] · value=Ancestor[TableCrossAxis], custom_state="custom.var_qualentrega_", custom_states_values={0={value=Ancestor[TableCrossAxis]:cpo.QualPedido, custom_state="custom.var_qualpedido_"}, 1={value=Opt.Ações.Cancela Entrega, custom_state="custom.var_a__ocancelamento_"}}
2. **ShowElement** [bTzKb] alvo El[pop cancelar entrega e pedido]

#### WF bTzKf — ButtonClicked em El[btn pedido gravar]
- condição: El[chk formalizar]:get_data
- props: event_color="blue", workflow_disabled=False
1. **ShowElement** [bTzKg] alvo El[gp alert gravando]
2. **ScrollToElement** [bTzKh] alvo El[gp alert gravando] · offset=-100
3. **ChangeThing** [bTzKl] campos: cpo.CorpoEmail = "{El[ipt pedido corpoemailfornecedor]:get_data}"; cpo.EmailCliente = El[dd pedido emailcliente]:get_data; cpo.EmailFornecedor = El[dd pedido emailfornecedor]:get_data; cpo.InformacoesAdd = "{El[ipt pedido infoadd]:get_data}"; cpo.OrdemCompraArquivo = "{El[upf pedido ordemcompra file]:get_data}"; cpo.OrdemComrpaNum = "{El[ipt pedido ordemcompra numero]:get_data}"; cpo.CorpoEmailCliente = "{El[ipt pedido corpoemailcliente]:get_data}"; cpo.PedidoFormalizado = True; cpo.PrazoRecebComissoes = El[dd parcelas receb comissao]:get_data · to_change=Parent
4. **ChangeListOfThings** [bTzKm] campos: cpo.StatusEntrega = Opt.Etapas.Pedido · to_change=ResultOfStep[bTzKl]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTzKn] alvo El[old PDF/IMG PEDIDO] · AAM="corpopedido", AAO=800, AAP=1100, AAQ="{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:find_replace(find=" "):to_uppercase}_PEDIDO{Parent:cpo.QualProposta:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.QualProposta:cpo.PropostaNum}", AAf=False
6. **ResetInputs** [bTzKr] 
7. **NewThing** [bTzKs] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Pedido número {ResultOfStep[bTzKl]:cpo.NumeroPedido} enviado ao cliente no email {ResultOfStep[bTzKl]:cpo.EmailCliente:cpo.Email}")}"; cpo.QualCliente = ResultOfStep[bTzKl]:cpo.QualCliente; cpo.QualVendedor = CurrentUser
8. **ChangeThing** [bTzKt] campos: cpo.UltimoHistoricoData = ResultOfStep[bTzKs]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTzKs] · to_change=ResultOfStep[bTzKs]:cpo.QualCliente

#### WF bTzKx — ButtonClicked em El[Button P]
1. **ChangeListOfThings** [bTzKy] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QuaisEntregas:filtered(constraints={0={key="cpo_statusentrega_option_opt_etapas", value=Opt.Etapas.Cancelado, constraint_type="equals"}}), type_to_change="custom.tbl_entregas"
2. **ChangeThing** [bTzKz] campos: cpo.PedidoFinalizado = True · to_change=Parent
3. **ResetGroup** [bTzLD] alvo El[pop add edita pedido]
4. **HideElement** [bTzLE] alvo El[pop add edita pedido]

#### WF bTzLF — ButtonClicked em El[chk filtrafinanceiro]
- condição: UrlParam("filtrafinanceiro" as custom.tbl_pedidos):not_equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTzLJ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrafinanceiro", value="{Parent:cpo.QualPedido:_id}"}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtraentrega", value="{∅}"}}, keep_current_page_params=True

#### WF bTzLK — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):not_equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTzLL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value="{Parent:cpo.QualPedido:_id}"}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTzLP — ButtonClicked em El[chk filtrapedido]
- condição: UrlParam("filtrapedido" as custom.tbl_pedidos):not_equals(Ancestor[TableCrossAxis])
- props: event_color="brown"
1. **ChangePage** [bTzLQ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrapedido", value="{Parent:_id}"}, 1={key="filtraentrega", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTzLR — ButtonClicked em El[chk filtrapedido]
- condição: UrlParam("filtrapedido" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis])
- props: event_color="brown"
1. **ChangePage** [bTzLV] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrapedido", value=""}, 1={key="filtraentrega", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTzLW — ButtonClicked em El[chk filtrafinanceiro]
- condição: UrlParam("filtrafinanceiro" as custom.tbl_pedidos):equals(Ancestor[TableCrossAxis]:grouping0:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTzLX] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtrafinanceiro", value=""}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtraentrega", value="{∅}"}}, keep_current_page_params=True

#### WF bTzLb — ButtonClicked em El[chk filtraentrega]
- condição: UrlParam("filtraentrega" as custom.tbl_pedidos):equals(Parent:cpo.QualPedido)
- props: event_color="brown"
1. **ChangePage** [bTzLc] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filtraentrega", value=""}, 1={key="filtrapedido", value="{∅}"}, 2={key="filtrafinanceiro", value="{∅}"}}, keep_current_page_params=True

#### WF bTzLd — ButtonClicked em El[btn proposta editacotacao]
1. **DisplayGroupData** [bTzLh] alvo El[pop add edita cotacao] · data_source=Parent
2. **SetCustomState** [bTzLi] alvo El[Página vendas_bkp2] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTzLj] alvo El[pop add edita cotacao]

#### WF bTzLn — ButtonClicked em El[btn proposta editacotacao]
1. **DisplayGroupData** [bTzLo] alvo El[pop add edita cotacao] · data_source=El[pop add edita propostas]:get_group_data
2. **SetCustomState** [bTzLp] alvo El[Página vendas_bkp2] · value=Opt.Ações.Edita Cotação, custom_state="custom.var_a__ovendas_", custom_states_values={0={value=Opt.Ações.Novo Produto, custom_state="custom.var_a__oor_amento_"}}
3. **ShowElement** [bTzLt] alvo El[pop add edita cotacao]

#### WF bTzMp — InputChanged em El[ipt filter numpedido]
1. **ChangePage** [bTzMq] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numeropedido", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTzMr — ButtonClicked em El[Icon Q]
1. **ResetGroup** [bTzMv] alvo El[gp filter numpedido]
2. **ChangePage** [bTzMw] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numeropedido", value="{∅}"}}, keep_current_page_params=True

#### WF bTzMx — ButtonClicked em El[Icon R]
1. **OpenURL** [bTzNB] open_in_new_tab=True, url="{Parent:cpo.OrdemCompraArquivo}"

#### WF bTzNC — ButtonClicked em El[Icon S]
1. **ResetGroup** [bTzND] alvo El[gp filtercidade fornecedores]

#### WF bTzLu — ButtonClicked em El[Button L]
- condição: El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Entrega)
- props: event_color="red"
1. **ChangeThing** [bTzLv] campos: cpo.StatusEntrega = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[Input EZ]:get_data}"; cpo.QtdEntrega = 0 · to_change=El[pop cancelar entrega e pedido]:custom.var_qualentrega_
2. **ScheduleAPIEvent** [bTzLz] SÓ SE El[chk informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTzMA] SÓ SE El[chk informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Entrega: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ResetInputs** [bTzMB] 
5. **HideElement** [bTzMF] alvo El[pop cancelar entrega e pedido]

#### WF bTzMG — ButtonClicked em El[Icon T]
1. **HideElement** [bTzMH] alvo El[pop cancelar entrega e pedido]

#### WF bTzML — ButtonClicked em El[hide dados do pedido]
1. **ToggleElement** [bTzMM] alvo El[dados do pedido]

#### WF bTzMN — ButtonClicked em El[Icon WZ]
1. **ShowElement** [bTzMR] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzMS] alvo El[pop.AgendaEnderecos A] · value=Parent:cpo.QualCotacao:cpo.QualCliente, custom_state="custom.var_qualgrupoclifor_"

#### WF bTzMT — ButtonClicked em El[Button L]
- condição: El[pop cancelar entrega e pedido]:custom.var_a__ocancelamento_:equals(Opt.Ações.Cancela Pedido)
- props: event_color="red"
1. **ChangeThing** [bTzMX] campos: cpo.QualEtapa = Opt.Etapas.Cancelado; cpo.MotivoCancelamento = "{El[Input EZ]:get_data}" · to_change=El[pop cancelar entrega e pedido]:custom.var_qualpedido_
2. **ScheduleAPIEvent** [bTzMY] SÓ SE El[chk informa cancelamento cliente]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento cliente]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 8):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento cliente]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTzMZ] SÓ SE El[chk informa cancelamento fornecedor]:get_AAI:is_true · date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_to="{El[dd email cancelamento fornecedor]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 9):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaCancelamentos)}", _wf_param_body="{El[ipt corpo cancelamento fornecedor]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Cancelamento Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_uppercase}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **ChangeListOfThings** [bTzMd] campos: cpo.MotivoCancelamento = "{ResultOfStep[bTzMX]:cpo.MotivoCancelamento}"; cpo.StatusEntrega = Opt.Etapas.Cancelado · to_change=ResultOfStep[bTzMX]:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
5. **ResetInputs** [bTzMe] 
6. **HideElement** [bTzMf] alvo El[pop cancelar entrega e pedido]

#### WF bTzMj — ButtonClicked em El[ico cancela pedido]
1. **SetCustomState** [bTzMk] alvo El[pop cancelar entrega e pedido] · value=Opt.Ações.Cancela Pedido, custom_state="custom.var_a__ocancelamento_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualpedido_"}, 1={value=∅, custom_state="custom.var_qualentrega_"}}
2. **ShowElement** [bTzMl] alvo El[pop cancelar entrega e pedido]

#### WF bTzNH — ButtonClicked em El[Icon V]
1. **ResetGroup** [bTzNI] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzNJ] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Cliente, custom_state="custom.var_a__oclifor_"
3. **ShowElement** [bTzNN] alvo El[pop.AgendaEnderecos A]

#### WF bTzNO — ButtonClicked em El[Icon HZ]
1. **DisplayGroupData** [bTzNP] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.EmailFornecedor:cpo.QualGrupoCliFor
2. **ShowElement** [bTzNT] alvo El[pop.AgendaContatos A]

#### WF bTzNU — ButtonClicked em El[Icon GZ]
1. **DisplayGroupData** [bTzNV] alvo El[pop.AgendaContatos A] · data_source=Parent:cpo.QualCliente

#### WF bTzNZ — ButtonClicked em El[Icon X]
1. **ScheduleAPIEvent** [bTzNa] date=Page.Current Date/Time, api_event="bTfDZ", _wf_param_Qtd=El[dd qtd parcelas receber]:get_data:count, _wf_param_Fila=1, _wf_param_Prazos=El[dd qtd parcelas receber]:get_data, _wf_param_DtEntrega=El[dt dataentrega realizada]:get_data, _wf_param_QualEntrega=Parent

#### WF bTzNb — InputChanged em El[dd prazo a vencer]
1. **ChangeThing** [bTzNf] campos: cpo.DataVencimento = Page.Current Date/Time:plus_days(This:get_data:diasprazonumero) · to_change=Ancestor[TableCrossAxis]

#### WF bTzNg — ButtonClicked em El[Icon W]
1. **DeleteThing** [bTzNh] to_delete=Ancestor[TableCrossAxis]

#### WF bTzNl — ButtonClicked em El[btn cencela confirmaentrega]
- condição: Parent:cpo.StatusEntrega:equals(Opt.Etapas.Financeiro)
1. **HideElement** [bTzNm] alvo El[pop confirma entrega]
2. **ResetGroup** [bTzNn] alvo El[pop confirma entrega]

#### WF bTzNr — ButtonClicked em El[Icon AZZ]
1. **ShowElement** [bTzNs] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzNt] alvo El[pop.AgendaEnderecos A] · value=Ancestor[TableCrossAxis]:cpo.QualGrupoCliFor, custom_state="custom.var_qualgrupoclifor_"

#### WF bTzNx — ButtonClicked em El[Icon BZZ]
1. **OpenURL** [bTzNy] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.Localizacaoo:google_map_link}"

#### WF bTzNz — ButtonClicked em El[Icon CZZ]
1. **ResetGroup** [bTzOD] alvo El[gp filternome fornecedores]

#### WF bTzOE — ButtonClicked em El[Icon DZZ]
1. **ResetGroup** [bTzOF] alvo El[gp filterUF fornecedores]

#### WF bTzOJ — ButtonClicked em El[edita produto]
1. **ShowElement** [bTzOK] alvo El[pop.CadastroProdutos A]
2. **DisplayGroupData** [bTzOL] alvo El[pop.CadastroProdutos A] · data_source=El[dd add modelo produto]:get_data

#### WF bTzOP — ButtonClicked em El[abre cadastro produtos]
1. **ShowElement** [bTzOQ] alvo El[pop.CadastroProdutos A]

#### WF bTzSB — ButtonClicked em El[btn pedidosconcluidos]
- condição: UrlParam("pedidosconcluidos" as text):equals("yes")
1. **ChangePage** [bTzSF] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}no"}, 1={key="etapaentrega", value="{∅}Em Entrega"}}, keep_current_page_params=True

#### WF bTzOR — ButtonClicked em El[btn novofornecedor]
1. **ResetGroup** [bTzOV] alvo El[pop.AgendaEnderecos A]
2. **SetCustomState** [bTzOW] alvo El[pop.AgendaEnderecos A] · value=Opt.AçãoCliFor.Novo Fornecedor, custom_state="custom.var_a__oclifor_"
3. **ShowElement** [bTzOX] alvo El[pop.AgendaEnderecos A]

#### WF bTzOb — InputChanged em El[ip valorvenda]
1. **PauseWFClient** [bTzOc] length=1000
2. **ScheduleAPIEvent** [bTzOd] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzOh — InputChanged em El[ip valorcomissao]
1. **PauseWFClient** [bTzOi] length=1000
2. **ScheduleAPIEvent** [bTzOj] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzOn — InputChanged em El[dd tipofrete]
- condição: This:get_data:not_equals(Opt.TipoFrete.CIF Informado)
1. **ChangeThing** [bTzOo] campos: cpo.ValorFrete = ∅ · to_change=Ancestor[TableCrossAxis]
2. **ScheduleAPIEvent** [bTzOp] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzOt — InputChanged em El[ip valorfrete]
1. **PauseWFClient** [bTzOu] 
2. **ScheduleAPIEvent** [bTzOv] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzOz — InputChanged em El[ip piscofins]
1. **PauseWFClient** [bTzPA] length=1000
2. **ScheduleAPIEvent** [bTzPB] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzPF — ButtonClicked em El[Icon BZZZ]
1. **ShowElement** [bTzPG] alvo El[pop consulta icms]

#### WF bTzPH — InputChanged em El[ip icms]
1. **PauseWFClient** [bTzPL] length=1000
2. **ScheduleAPIEvent** [bTzPM] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzPN — ButtonClicked em El[Icon HZZ]
1. **HideElement** [bTzPR] alvo El[pop edita produtos do pedido]

#### WF bTzPS — ButtonClicked em El[Icon FZZ]
- props: workflow_disabled=False
1. **DisplayGroupData** [bTzPT] alvo El[pop edita produtos do pedido] · data_source=El[pop add edita pedido]:get_group_data
2. **ShowElement** [bTzPX] alvo El[pop edita produtos do pedido]

#### WF bTzPY — ButtonClicked em El[btn expandir cartoes]
- condição: UrlParam("expandircartoes" as text):equals("no")
1. **ChangePage** [bTzPZ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="expandircartoes", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTzPd — ButtonClicked em El[btn pedidosconcluidos]
- condição: UrlParam("pedidosconcluidos" as text):equals("no")
1. **ChangePage** [bTzPe] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pedidosconcluidos", value="{∅}yes"}, 1={key="etapaentrega", value="{∅}Financeiro"}}, keep_current_page_params=True

#### WF bTzPf — ButtonClicked em El[btn entregascanceladas]
- condição: UrlParam("etapapedido" as option.opt_etapas):display:equals("Pedido")
1. **ChangePage** [bTzPj] alvo El[Current page] · add_parameters=True, url_parameters={0={key="etapapedido", value="{Opt.Etapas.Cancelado:display}"}, 1={key="etapaentrega", value="{Opt.Etapas.Cancelado:display}"}}, keep_current_page_params=True

#### WF bTzPk — ButtonClicked em El[btn entregascanceladas]
- condição: UrlParam("etapapedido" as option.opt_etapas):display:equals("Cancelado")
1. **ChangePage** [bTzPl] alvo El[Current page] · add_parameters=True, url_parameters={0={key="etapapedido", value="Pedido"}, 1={key="etapaentrega", value="{∅}Em Entrega"}}, keep_current_page_params=True

#### WF bTzSG — ButtonClicked em El[Icon FZ]
1. **ResetGroup** [bTzSH] alvo El[gp filterID fornecedores]

#### WF bTzSL — ButtonClicked em El[gp card entrega]
1. **ToggleElement** [bTzSM] alvo El[gp detalhes entrega]

#### WF bTzSN — ButtonClicked em El[gp card financeio]
1. **ToggleElement** [bTzSR] alvo El[rpg show contasreceber]

#### WF bTzSS — Plugin[1648430145817x673906689668022300]/AAY em El[old PDF/IMG PEDIDO] «PDF/IMG PEDIDO Element Saved»
- props: event_color="cyan", workflow_disabled=False
1. **ChangeThing** [bTzST] campos: cpo.PedidoArquivo = "{This:get_AAb}" · to_change=Parent
2. **ScheduleAPIEvent** [bTzSX] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailFornecedorCC}", _wf_param_to="{Parent:cpo.EmailFornecedor:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 7):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaPedido)}", _wf_param_body="{Parent:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Fornecedor: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualFornecedor:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nomecliente_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")}", _wf_param_atachments="{Text("{Parent:cpo.PedidoArquivo:url}⏎")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
3. **ScheduleAPIEvent** [bTzSY] date=Page.Current Date/Time:plus_seconds(15), api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailClienteCC}", _wf_param_to="{Parent:cpo.EmailCliente:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 6):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaPedido)}", _wf_param_body="{Parent:cpo.CorpoEmailCliente}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Pedido: {Text("{Parent:cpo.NumeroPedido}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFonecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}")}", _wf_param_atachments="{Text("{Parent:cpo.PedidoArquivo:url}⏎{Parent:cpo.OrdemCompraArquivo:url}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **HideElement** [bTzSZ] alvo El[pop add edita pedido]
5. **SetCustomState** [bTzSd] alvo El[Página vendas_bkp2] · value=False, custom_state="custom.var_showalert_"
6. **HideElement** [bTzSe] alvo El[gp alert gravando]

#### WF bTzSf — ButtonClicked em El[Link A]
1. **Plugin[1583324666271x739637822593433600]/AAJ** [bTzSj] AAK="{Parent:cpo.PedidoArquivo}", AAL="linkpedido", AAM=False

#### WF bTzSk — ButtonClicked em El[btn reenviar proposta]
- props: workflow_disabled=False
1. **TriggerCustomEvent** [bTzSl] arguments={0={param_id="bTaLh", arg_value=Parent}}, custom_event="bTzFo"
2. **Plugin[1658328157117x953686184769617900]/AAT** [bTzSp] AAF="Proposta re-enviada com sucesso", AAJ="var(--color_primary_default)"

#### WF bTzPp — ButtonClicked em El[Icon H]
1. **ChangePage** [bTzPq] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTzPr — Plugin[1648823245313x509054419018711040]/AAd em El[RangePicker A]
1. **MakeChangeCurrentUser** [bTzPv] campos: cpo.UltimoDateRange = This:get_AAF
2. **ChangePage** [bTzPw] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min}"}, 1={key="datafim", value="{This:get_AAF:max}"}}, keep_current_page_params=True

#### WF bTzPx — InputChanged em El[dd filter vendedor]
1. **ChangePage** [bTzQB] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTzQC — ButtonClicked em El[Icon EZZ]
1. **ResetGroup** [bTzQD] alvo El[gp filtervendedor]
2. **ChangePage** [bTzQH] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTzQI — ButtonClicked em El[Button BZ]
1. **ShowElement** [bTzQJ] alvo El[pop.AddEdita Produtos A]
2. **SetCustomState** [bTzQN] alvo El[pop.AddEdita Produtos A] · value=Parent, custom_state="custom.var_qualpedido_"

#### WF bTzQO — ButtonClicked em El[Icon IZZ]
1. **DeleteThing** [bTzQP] to_delete=Ancestor[TableCrossAxis]:cpo.QualCotacaoProduto
2. **DeleteThing** [bTzQT] to_delete=Ancestor[TableCrossAxis]

#### WF bTzQU — ButtonClicked em El[Icon JZZ]
1. **DisplayGroupData** [bTzQV] alvo El[pop.AddEdita Produtos A] · data_source=Ancestor[TableCrossAxis]
2. **ShowElement** [bTzQZ] alvo El[pop.AddEdita Produtos A]

#### WF bTzQa — InputChanged em El[ipt filter cliente]
1. **ChangePage** [bTzQb] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTzQf — ButtonClicked em El[Icon EZZZ]
1. **ResetGroup** [bTzQg] alvo El[gp filter cliente]
2. **ChangePage** [bTzQh] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{∅}"}}, keep_current_page_params=True

#### WF bTzQl — ButtonClicked em El[Icon DZZZ]
1. **OpenURL** [bTzQm] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.ArquivoNfFornecedor}"

#### WF bTzQn — ButtonClicked em El[Icon FZZZ]
1. **OpenURL** [bTzQr] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(1):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(1)}"
2. **OpenURL** [bTzQs] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(2):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(2)}"
3. **OpenURL** [bTzQt] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(3):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(3)}"
4. **OpenURL** [bTzQx] SÓ SE Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(4):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.BoletoArquivos:specific_item(4)}"

#### WF bTzQy — ButtonClicked em El[Text ZZZZZZZZZ]
1. **ChangePage** [bTzQz] alvo El[Página financeiro] · open_in_new_tab=True, add_parameters=True, url_parameters={0={key="datainicio", value="{UrlParam("datainicio" as date)}"}, 1={key="datafim", value="{UrlParam("datafim" as date)}"}, 2={key="statusfinanceiro", value="{Opt.StatusFinanceiro.A receber:display}"}, 3={key="vendedor", value="{UrlParam("vendedor" as user):_id}"}, 4={key="cliente", value="{UrlParam("cliente" as custom.tbl_clientes):_id}"}, 5={key="numpedido", value="{UrlParam("numeropedido" as number)}"}, 6={key="dtfiltro", value="{Opt.TiposData.Data vencimento:display}"}}

#### WF bTzRD — ButtonClicked em El[Icon GZZZ]
1. **ChangePage** [bTzRE] alvo El[Página financeiro] · open_in_new_tab=True, add_parameters=True, url_parameters={0={key="numpedido", value="{Parent:cpo.NumeroPedido}"}, 1={key="datainicio", value="{UrlParam("datainicio" as date)}"}, 2={key="dtafim", value="{UrlParam("datafim" as date)}"}}

#### WF bTzRF — ButtonClicked em El[Icon HZZZ]
1. **OpenURL** [bTzRJ] open_in_new_tab=True, url="{El[dd end destino]:get_data:cpo.Localizacaoo:google_map_link}"

#### WF bTzRK — ButtonClicked em El[Button CZ]
1. **ChangeThing** [bTzRL] campos: cpo.Arquivado = True; cpo.MotivoArquivamento = El[dd selecione o motivo]:get_data · to_change=Parent
2. **HideElement** [bTzRP] alvo El[pop.ArquivaCotação]

#### WF bTzRQ — ButtonClicked em El[btn retira pedido]
1. **ShowElement** [bTzRR] alvo El[pop.ArquivaCotação]
2. **DisplayGroupData** [bTzRV] alvo El[pop.ArquivaCotação] · data_source=Parent

#### WF bTzRW — ButtonClicked em El[btn retira pedido]
1. **ChangeListOfThings** [bTzRX] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QualPedido:cpo.QuaisEntregas, type_to_change="custom.tbl_entregas"
2. **ChangeThing** [bTzRb] campos: cpo.PedidoFinalizado = True · to_change=Parent:cpo.QualPedido
3. **ResetGroup** [bTzRc] alvo El[pop add edita pedido]
4. **HideElement** [bTzRd] alvo El[pop add edita pedido]

#### WF bTzRh — ButtonClicked em El[btn proposta gravar]
- props: event_color="blue", workflow_disabled=False
1. **SetCustomState** [bTzRi] alvo El[pop add edita propostas] · value=False, custom_state="custom.var_enviamailproposta_"
2. **ChangeThing** [bTzRj] campos: cpo.CondicaoPgto = "{El[ipt condicao pagto]:get_data}"; cpo.CorpoEmail = "{El[ipt corpoemail]:get_data}"; cpo.DtPrevEntrega = El[dt prevista entrega]:get_data; cpo.EmailsCopia = "{El[ipt emails copia]:get_data}"; cpo.EnviarPara = El[dd email para]:get_data; cpo.FaturarPara = El[dd faturar para]:get_data; cpo.InfoAdicional = "{El[ipt infoadicional]:get_data}"; cpo.PropostaNum = El[ipt proposta numero]:get_data · to_change=Parent
3. **ChangeListOfThings** [bTzRn] campos: cpo.QualEndereçoCobrança = El[dd faturar para]:get_data · to_change=ResultOfStep[bTzRj]:cpo.QuaisOrcamentosFornecedores, type_to_change="custom.tbl_orcamentfornecedores"
4. **DisplayGroupData** [bTzRo] alvo El[gp proposta a anexar] · data_source=ResultOfStep[bTzRj]
5. **ChangeThing** [bTzRp] campos: cpo.QuaisPropostas = ResultOfStep[bTzRj] · to_change=El[pop add edita propostas]:get_group_data
6. **Plugin[1648430145817x673906689668022300]/AAL** [bTzRt] alvo El[PDF/IMG PROPOSTA] · AAM="novaproposta", AAO=800, AAP=1100, AAQ="{El[pop add edita propostas]:get_group_data:cpo.QualCliente:cpo.NomeCliFor:to_uppercase:find_replace(find=" ")}{El[pop add edita propostas]:get_group_data:cpo.CotacaoNum}-{ResultOfStep[bTzRj]:cpo.PropostaNum}", AAf=False
7. **SetCustomState** [bTzRu] alvo El[pop add edita propostas] · custom_state="custom.var_acaocotacao_"
8. **ResetGroup** [bTzRv] alvo El[gp add edita proposta]

#### WF bTzRz — ButtonClicked em El[Icon M]
1. **ScheduleAPIEvent** [bTzSA] date=Page.Current Date/Time, api_event="bTPFh", _wf_param_par^{p1}OrcamentosFornecedores=Ancestor[TableCrossAxis]:convert_to_list

#### WF bTzSq — Plugin[1648430145817x673906689668022300]/AAY em El[PDF/IMG PROPOSTA]
- props: event_color="purple", workflow_disabled=False
1. **ChangeThing** [bTzSr] campos: cpo.AquivoProposta = "{This:get_AAb}" · to_change=El[gp proposta a anexar]:get_group_data
2. **ScheduleAPIEvent** [bTzSv] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{Parent:cpo.EmailsCopia}", _wf_param_to="{Parent:cpo.EnviarPara:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 5):first_element:cpo.QuaisUsuarios:cpo.EmailContato:plus_element(CurrentUser:cpo.CopiaProposta)}", _wf_param_body="{Parent:cpo.CorpoEmail}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[MegaBox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="Orçamento: {Text("{Parent:cpo.QualCotacao:cpo.CotacaoNum}/{Parent:cpo.PropostaNum}")} - Produtos: {Text("{Parent:cpo.QuaisOrcamentosFornecedores:cpo.QualCotacaoProduto:cpo.QualProduto:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_nome_text", interval=∅, information=∅, filling_gaps=∅}}):grouping0:to_capitalized_words}")} - Cliente: {Text("{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}", _wf_param_atachments="{Text("{Parent:cpo.AnexosDiversos:url}{∅},{Parent:cpo.AquivoProposta:url}")}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
