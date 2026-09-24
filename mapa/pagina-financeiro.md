# Pagina: `financeiro` (bTpCB)


Resumo: 648 elementos · 76 workflows · 134 ações · 176 condicionais · 1 estados customizados
Elementos por tipo: Text 248, Group 162, TableCell 72, Icon 46, TableMainAxis 36, TableCrossAxis 10, Button 10, CustomElement 8, Input 6, Dropdown 6, PictureInput 5, Table 5, Popup 4, HTML 4, DateInput 3, AutocompleteDropdown 3, Image 2, Plugin[1680110374647x249108010620944400]/AAC 2, select2-MultiDropdown 2, MultiLineInput 2, Plugin[1648430145817x673906689668022300]/AAc 2, RepeatingGroup 2, Plugin[1680110374647x249108010620944400]/AAx 2, Plugin[1642683387367x708220519175946200]/AAC 2, FileInput 1, RadioButtons 1, Plugin[1648823245313x509054419018711040]/AAC 1, Alert 1

## Árvore de elementos

- **CustomElement** `pop.EditaContasReceberNew A` (bTsCB1) — USA Reusable pop.EditaContasReceberNew · props: floating_reference="top", custom_id="bTrot", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Popup** `pop baixar recebiveis` (bTqzf) — props: vertical_centering=True
  - estado customizado `var_showalert_` : boolean
  - **Group** `Group VZ` (bTrLq) — props: vertical_centering=True
    - **Text** `Text H` (bTrLe) — text: "Baixar contas a receber" · props: font_alignment="center"
      - ⟂ quando El[pop baixar recebiveis]:custom.var_showalert_:is_true → text="[fa]spinner fa-pulse[/fa]  Aguarde, gravando registros. Não feche essa janela.", font_color="var(--color_alert_default)"
    - **Icon** `Icon N` (bTrLk) — props: icon="material outlined close", vertical_centering=True
  - **Group** `Group L` (bTrFj) — props: vertical_centering=True
    - **Group** `gp lista ou recibo` (bTqyj) — props: vertical_centering=True
      - **Group** `gp recibo` (bTqvp) — props: vertical_centering=True, unique_id="corporecibo"
        - ⟂ quando El[tgg gerar recibo]:get_AAI:is_false → is_visible=False
        - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → is_visible=True
        - **Group** `Group NZZZ` (bTqxm) — props: vertical_centering=True
          - **Image** `Image B` (bTqxn) — props: src="{Opt.EmpresaMegabox.Megabox:logo_horizontal}", use_aspect_ratio=True, aspect_ratio_width=4
          - **Group** `Group NZZZ` (bTqxr) — props: vertical_centering=True
            - **Text** `Text RZZZ` (bTqxs) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
            - **Text** `Text RZZZ` (bTqxt) — text: "[b]Email[/b]: {CurrentUser:email:to_lowercase}"
            - **Text** `Text RZZZ` (bTqxx) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
        - **Group** `Group NZZZ` (bTqyX) — props: vertical_centering=True
          - **Text** `Text RZZZ` (bTqyb) — text: "Declaração de recebimento"
          - **Text** `Text RZZZ` (bTqyE) — text: "{El[ipt dt nf recibo megabox]:get_data:format_date(formatting_type="custom", custom_format="dddd, dd \"de\" mmm \"de\" yyyy")}" · props: font_alignment="right"
        - **Group** `Group NZZZ` (bTqyc) — props: vertical_centering=True
          - **Group** `Group WZZZ` (bTrPB) — props: vertical_centering=True
            - **Text** `Text RZZZ` (bTqyd) — text: "RECIBO Nº: {El[ipt num nfrecibo megabox]:get_data}" · props: vertical_centering=False
            - **Text** `Text XZZZ` (bTrOv) — text: "A [b]MEGABOX LOGÍSTIDA LTDA[/b], empresa portadora do [b]CNPJ 39.667.615/0001-01[/b], declara para todo e qualquer fim, que recebeu de [b]{El[dd cnpj forncedor recibo]:get_data:cpo.Razao:to_uppercase}[/b], empresa portadora do [b]CNPJ {El[dd cnpj forncedor recibo]:get_data:cpo.CnpjCpf:to_uppercase}[/b], o valor total de {Text("{CurrentUser:cpo.SelecionadosReceber:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")} referente às vendas abaixo discriminadas." · props: vertical_centering=False
          - **Group** `Group NZZZ` (bTqyK) — data_source: El[dd cnpj forncedor recibo]:get_data:cpo.QualGrupoCliFor · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTqyR) — placeholder: "" · props: src="{Parent:cpo.Foto}", private=False, disabled=True
              - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **Group** `Group NZZZ` (bTqyL) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
              - **Text** `Text RZZZ` (bTqyP) — text: "[b]Fornecedor[/b]: {Text("{El[dd cnpj forncedor recibo]:get_data:cpo.Razao:to_uppercase}")}"
              - **Text** `Text RZZZ` (bTqyQ) — text: "[b]CNPJ:[/b] {Text("{El[dd cnpj forncedor recibo]:get_data:cpo.CnpjCpf:to_uppercase}")}"
        - **Group** `Group NZZZ` (bTqyJ) — props: vertical_centering=True
        - **Group** `Group NZZZ` (bTqyV) — props: vertical_centering=True
          - **Text** `Text RZZZ` (bTqyW) — text: "Detalhamento do recebimento:"
        - **Text** `Text RZZZ` (bTqyF) — text: "[b]Resumo da cobrança: [/b]⏎[b]Quantidade:[/b] {CurrentUser:cpo.SelecionadosReceber:count}⏎[b]Valor total em vendas:[/b] {CurrentUser:cpo.SelecionadosReceber:cpo.ValorTotal:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎[b]Valor total em comissões[/b]:  {CurrentUser:cpo.SelecionadosReceber:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
        - **Table** `rpg entregas do produto` (bTqvt) — data_source: CurrentUser:cpo.SelecionadosReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
          - **TableCrossAxis** `TableCrossAxis E` (bTqwX) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell M` (bTqwr) — props: cell_main_axis_id="bTqvv"
              - **Text** `Text RZZZ` (bTqwv) — oculto ao carregar · text: "{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QtdVenda} - {Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}⏎"
              - **HTML** `HTML C` (bUFFz) — html(12706 chars)
            - **TableCell** `Cell M` (bTqwY) — props: cell_main_axis_id="bTqvu"
              - **Group** `Group NZZZ` (bTqwZ) — props: vertical_centering=True
                - **Text** `Text RZZZ` (bTqwd) — text: "Dt Pedido"
                - **Text** `Text RZZZ` (bTqwe) — text: "{Ancestor[TableCrossAxis]:cpo.DataPedido:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
              - **Group** `Group NZZZ` (bTqwl) — props: vertical_centering=True
                - **Text** `Text RZZZ` (bTqwp) — text: "Dt entrega"
                - **Text** `Text RZZZ` (bTqwq) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
              - **Group** `Group NZZZ` (bTqwf) — props: vertical_centering=True
                - **Text** `Text RZZZ` (bTqwj) — text: "Dt vcto"
                - **Text** `Text RZZZ` (bTqwk) — text: "{Ancestor[TableCrossAxis]:cpo.DataVencimento:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
                  - ⟂ quando Page.Current Date/Time:greater_than(Ancestor[TableCrossAxis]:cpo.DataVencimento) → font_color="var(--color_bTHHQ_default)", font_weight="600"
            - **TableCell** `Cell M` (bTqww) — props: cell_main_axis_id="bTqxf"
              - **Group** `Group NZZZ` (bTqwx) — props: vertical_centering=True
                - **Text** `Text RZZZ` (bTqxB) — text: "Vlr Venda UN"
                - **Text** `Text RZZZ` (bTqxC) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="right"
              - **Group** `Group NZZZ` (bTqxD) — props: vertical_centering=True
                - **Text** `Text RZZZ` (bTqxH) — text: "Vlr Venda TT"
                - **Text** `Text RZZZ` (bTqxI) — text: "{Ancestor[TableCrossAxis]:cpo.ValorTotal:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="right"
              - **Group** `Group NZZZ` (bTqxJ) — props: vertical_centering=True
                - **Text** `Text RZZZ` (bTqxN) — text: "Vlr Comissão"
                - **Text** `Text RZZZ` (bTqxO) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="right"
            - **TableCell** `Cell M` (bTqxP) — props: cell_main_axis_id="bTqxg"
              - **Text** `Text RZZZ` (bTqxT) — oculto ao carregar · text: "{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}" · props: font_alignment="center"
            - **TableCell** `Cell M` (bTqxU) — props: cell_main_axis_id="bTqxh"
              - **PictureInput** `upi novocliente logo` (bTqxV) — placeholder: "" · props: src="{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **TableCell** `Cell M` (bTqxZ) — props: cell_main_axis_id="bTqxl"
              - **Text** `Text RZZZ` (bTqxa) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text RZZZ` (bTqxb) — text: "Pedido número: {Ancestor[TableCrossAxis]:cpo.QualPedido:cpo.NumeroPedido:to_uppercase}"
          - **TableMainAxis** `TableMainAxis I` (bTqvu) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis I` (bTqvv) — props: axis_index=3
          - **TableCrossAxis** `TableCrossAxis E` (bTqvz) — props: axis_index=0
            - **TableCell** `Cell M` (bTqwA) — props: cell_main_axis_id="bTqvu"
              - **Text** `Text RZZZ` (bTqwB) — text: "Datas" · props: font_alignment="center"
            - **TableCell** `Cell M` (bTqwF) — props: cell_main_axis_id="bTqvv"
              - **Text** `Text RZZZ` (bTqwG) — text: "Qtd/Produto/NF" · props: font_alignment="center"
            - **TableCell** `Cell M` (bTqwH) — props: cell_main_axis_id="bTqxf"
              - **Text** `Text RZZZ` (bTqwL) — text: "Valores" · props: font_alignment="center"
            - **TableCell** `Cell M` (bTqwM) — props: cell_main_axis_id="bTqxg"
              - **Text** `Text RZZZ` (bTqwN) — text: "NF" · props: font_alignment="center"
            - **TableCell** `Cell M` (bTqwR) — props: cell_main_axis_id="bTqxh"
            - **TableCell** `Cell M` (bTqwS) — props: cell_main_axis_id="bTqxl"
              - **Text** `Text RZZZ` (bTqwT) — text: "Cliente / Pedido" · props: font_alignment="center"
          - **TableMainAxis** `TableMainAxis I` (bTqxf) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis I` (bTqxg) — props: axis_index=4
          - **TableMainAxis** `TableMainAxis I` (bTqxh) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis I` (bTqxl) — props: axis_index=0
      - **Group** `gp lista receber` (bTpOB) — props: vertical_centering=True
        - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → is_visible=False
        - ⟂ quando El[tgg gerar recibo]:get_AAI:is_false → is_visible=True
        - **Text** `Text Z` (bTpPt) — text: "Contas a baixar"
        - **Table** `rpg baixar receber` (bTpOC) — data_source: CurrentUser:cpo.SelecionadosReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
          - **TableMainAxis** `TableMainAxis C` (bTpOD) — props: axis_index=2
          - **TableMainAxis** `TableMainAxis C` (bTpOH) — props: axis_index=8
          - **TableCrossAxis** `TableCrossAxis B` (bTpOI) — props: axis_index=0, make_sticky=True
            - **TableCell** `Cell D` (bTpOJ) — props: cell_main_axis_id="bTpOD"
              - **Text** `Text Z` (bTpON) — text: "Datas"
            - **TableCell** `Cell D` (bTpOO) — props: cell_main_axis_id="bTpOH"
              - **Text** `Text Z` (bTpOP) — text: "Valor comissão⏎{El[rpg baixar receber]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎" · props: font_alignment="center"
            - **TableCell** `Cell D` (bTpOT) — props: cell_main_axis_id="bTpPj"
              - **Text** `Text Z` (bTpOU) — text: "Valor venda⏎{El[rpg baixar receber]:get_list_data:cpo.ValorTotal:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell D` (bTpOV) — props: cell_main_axis_id="bTpPn"
              - **Text** `Text Z` (bTpOZ) — text: "Fornecedor⏎Núm NF"
            - **TableCell** `Cell E` (bTpOa) — props: cell_main_axis_id="bTpPo"
            - **TableCell** `Cell I` (bTpOb) — props: cell_main_axis_id="bTpPp"
              - **Text** `Text AZ` (bTpOf) — text: "Nome cliente⏎Núm pedido⏎"
          - **TableCrossAxis** `TableCrossAxis B` (bTpOg) — props: axis_index=1, cross_axis_repeat=True
            - **TableCell** `Cell D` (bTpOh) — props: cell_main_axis_id="bTpOD"
              - **Group** `Group LZZ` (bTpOl) — props: vertical_centering=True
                - **Text** `Text NZZ` (bTpOm) — text: "Dt Pedido"
                - **Text** `Text NZZ` (bTpOn) — text: "{Ancestor[TableCrossAxis]:cpo.DataPedido:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
              - **Group** `Group NZZ` (bTpOr) — props: vertical_centering=True
                - **Text** `Text OZZ` (bTpOs) — text: "Dt prev entrega"
                - **Text** `Text OZZ` (bTpOt) — text: "{Ancestor[TableCrossAxis]:cpo.DataPrevEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
              - **Group** `Group PZZ` (bTpPD) — props: vertical_centering=True
                - **Text** `Text QZZ` (bTpPE) — text: "Dt entrega"
                - **Text** `Text QZZ` (bTpPF) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
              - **Group** `Group OZZ` (bTpOx) — props: vertical_centering=True
                - **Text** `Text PZZ` (bTpOy) — text: "Dt vcto"
                - **Text** `Text PZZ` (bTpOz) — text: "{Ancestor[TableCrossAxis]:cpo.DataVencimento:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
                  - ⟂ quando Page.Current Date/Time:greater_than(Ancestor[TableCrossAxis]:cpo.DataVencimento) → font_color="var(--color_bTHHQ_default)", font_weight="600"
            - **TableCell** `Cell D` (bTpPJ) — props: cell_main_axis_id="bTpOH"
              - **Text** `Text Z` (bTpPK) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell D` (bTpPL) — props: cell_main_axis_id="bTpPj"
              - **Text** `Text Z` (bTpPP) — text: "{Ancestor[TableCrossAxis]:cpo.ValorTotal:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="center"
            - **TableCell** `Cell D` (bTpPQ) — props: cell_main_axis_id="bTpPn"
              - **Text** `Text Z` (bTpPR) — text: "{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text MZZ` (bTpPW) — text: "{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_capitalized_words}"
              - **Text** `Text KZZ` (bTpPV) — text: "{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}"
            - **TableCell** `Cell H` (bTpPX) — props: cell_main_axis_id="bTpPo"
              - **PictureInput** `upi novocliente logo` (bTpPb) — placeholder: "" · props: src="{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            - **TableCell** `Cell J` (bTpPc) — props: cell_main_axis_id="bTpPp"
              - **Text** `Text BZ` (bTpPd) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text IZZ` (bTpPi) — text: "{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_capitalized_words}"
              - **Text** `Text CZ` (bTpPh) — text: "Pedido número: {Ancestor[TableCrossAxis]:cpo.QualPedido:cpo.NumeroPedido:to_uppercase}"
          - **TableMainAxis** `TableMainAxis C` (bTpPj) — props: axis_index=7
          - **TableMainAxis** `TableMainAxis C` (bTpPn) — props: axis_index=1
          - **TableMainAxis** `TableMainAxis E` (bTpPo) — props: axis_index=0
          - **TableMainAxis** `TableMainAxis F` (bTpPp) — props: axis_index=0
    - **Group** `gp dados recibemento` (bTpPu) — props: vertical_centering=True
      - **Group** `gp gerar recibo simnao` (bTqvd) — props: vertical_centering=True
        - **Plugin[1680110374647x249108010620944400]/AAC** `tgg gerar recibo` (bTqvR) — props: AAH="var(--color_primary_default)", AAP=0, AAR=0
        - **Text** `Text K` (bTqvX) — text: "Gerar recibo no lugar da nota fiscal"
      - **Group** `Group AZZZ` (bTqvJ) — props: vertical_centering=True
        - **Group** `gp num recibo/nf` (bTpPv) — props: vertical_centering=True
          - **Text** `Text F` (bTpPz) — text: "Número NF Megabox"
            - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → text="Número Recibo Megabox"
          - **Input** `ipt num nfrecibo megabox` (bTpQA) — placeholder: "000000" · props: mandatory=False
            - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → content="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 17):first_element:cpo.ValorNumero:plus(1)}", bgcolor="var(--color_bTHGh_default)", disabled=True
        - **Group** `Group K` (bTpQB) — props: vertical_centering=True
          - **Text** `Text G` (bTpQF) — text: "Anexo NF Megabox"
            - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → text="Anexo Recibo Megabox"
          - **Group** `Group AZ` (bTpQG) — props: vertical_centering=True
            - ⟂ quando This:is_hovered:or_(El[ipt anexo nf megabox]:is_focused) → border_color="var(--color_primary_default)"
            - **FileInput** `ipt anexo nf megabox` (bTpQL) — placeholder: "Selecione o arquivo (máx 2mb)" · props: mandatory=False, font_alignment="left", max_size=2
              - ⟂ quando This:get_loading_status → placeholder="Aguarde..."
              - ⟂ quando This:get_data:is_empty → font_color="var(--color_bTHGl_default)"
              - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → placeholder="Rebibo gerado automaticamente", bgcolor="var(--color_bTHGh_default)", disabled=True
            - **Text** `Text O` (bTpQH) — oculto ao carregar · text: "[fa]spinner fa-pulse[/fa]" · props: font_alignment="center"
              - ⟂ quando El[ipt anexo nf megabox]:get_loading_status → is_visible=True
      - **Group** `Group PZZZ` (bTqzG) — props: vertical_centering=True
        - **Text** `Text SZZZ` (bTqzA) — text: "CNPJ fornecedor do recibo:"
        - **Dropdown** `dd cnpj forncedor recibo` (bTqyu) — data_source: CurrentUser:cpo.SelecionadosReceber:first_element:cpo.QualFornecedor:cpo.QuaisEnderecos:filtered(constraints={0={key="cpo_ativo_boolean", value=True, constraint_type="equals"}}) · placeholder: "Selecione" · props: vertical_centering=True, disabled=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase} (cnpj: {InjectedValue:cpo.CnpjCpf})"
          - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → mandatory=True, bgcolor="var(--color_primary_contrast_default)", disabled=False
      - **Group** `Group UZZZ` (bTrOH) — props: vertical_centering=True
        - **Group** `Group MZZ` (bTpQM) — props: vertical_centering=True
          - **Text** `Text JZZ` (bTpQN) — text: "Data NF Megabox"
            - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → text="Data Recibo Megabox"
          - **DateInput** `ipt dt nf recibo megabox` (bTpQR) — props: mandatory=True, show_month_year_picker=True
        - **Group** `Group QZZ` (bTpQS) — props: vertical_centering=True
          - **Text** `Text RZZ` (bTpQT) — text: "Data recbto. banco"
          - **DateInput** `ipt dt receb bancocaixa` (bTpQX) — props: mandatory=True, show_month_year_picker=True
        - **Group** `Group RZZ` (bTpQY) — props: vertical_centering=True
          - **Text** `Text SZZ` (bTpQZ) — text: "Data baixa sistema"
          - **DateInput** `ipt dt baixa sistema` (bTpQd) — content: Page.Current Date/Time · props: mandatory=True, disabled=True
      - **Group** `gp enviar recibo email simnao` (bTrMg) — props: vertical_centering=True
        - **Plugin[1680110374647x249108010620944400]/AAC** `tgg enviar email recibo` (bTrMl) — props: AAH="var(--color_primary_default)", AAL="var(--color_bTHGh_default)", AAP=0, AAR=0
          - ⟂ quando El[tgg gerar recibo]:get_AAI:is_false → AAD=False, AAK=True
          - ⟂ quando El[tgg gerar recibo]:get_AAI:is_true → AAD=False, AAK=False
        - **Text** `Text TZZZ` (bTrMm) — text: "Enviar recibo para o fornecedor"
      - **Group** `Group VZZZ` (bTrOT) — props: vertical_centering=True
        - **Group** `Group RZZZ` (bTrMr) — props: vertical_centering=True
          - **Text** `Text UZZZ` (bTrMt) — text: "Email para:"
          - **Group** `Group RZZZ` (bTrMx) — props: vertical_centering=True
            - **Dropdown** `dd email para recibo` (bTrMy) — data_source: El[dd cnpj forncedor recibo]:get_data:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione um email" · props: mandatory=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_uppercase} - {InjectedValue:cpo.Email:to_lowercase}"
              - ⟂ quando El[tgg enviar email recibo]:get_AAI:is_false → bgcolor="var(--color_bTHGh_default)", disabled=True
            - **Icon** `Icon IZ` (bTrMz) — props: icon="material outlined contact_phone"
        - **Group** `gp email fornecedor copy` (bTrNE) — props: vertical_centering=True
          - **Text** `Text VZZZ` (bTrNJ) — text: "Enviar cópia para:"
          - **select2-MultiDropdown** `ipt email cc recibo` (bTrNK) — data_source: El[dd cnpj forncedor recibo]:get_data:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione multiplos emails" · props: tag_bgcolor="var(--color_primary_contrast_default)", dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", tag_delete_color="var(--color_primary_default)", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email}"
            - ⟂ quando El[tgg enviar email recibo]:get_AAI:is_false → bgcolor="var(--color_bTHGh_default)", disabled=True
      - **Group** `Group TZZZ` (bTrNP) — props: vertical_centering=True
        - **Text** `Text WZZZ` (bTrNR) — text: "Corpo do email:"
        - **MultiLineInput** `ipt email corpo recibo` (bTrNV) — placeholder: "" · content: "Olá {El[dd email para recibo]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Segue anexo nosso [b]recibo número {El[ipt num nfrecibo megabox]:get_data}[/b] referente ao último recebimento.⏎⏎Agradecemos mais uma vez a parceria, e em caso de dúvidas entre em contato.⏎⏎{CurrentUser:cpo.NomeModelo:to_uppercase}⏎{CurrentUser:cpo.EmailLoginTexto}" · props: mandatory=True, vertical_centering=True, unique_id="remodela"
          - ⟂ quando El[tgg enviar email recibo]:get_AAI:is_false → bgcolor="var(--color_bTHGh_default)", disabled=True
        - **Plugin[1648430145817x673906689668022300]/AAc** `PDF/IMG recibo` (bTrNW)
        - **Button** `Button I` (bTpQe) — text: "Baixar Contas" · props: icon="material outlined receipt_long", vertical_centering=True, button_type="label_icon"
- **Popup** `pop oculto` (bTrRq) — props: vertical_centering=True
  - **RepeatingGroup** `rpg a pagar geral` (bTrRk) — props: group_type="custom.tbl_contasreceber1", rows=1, separator_style="none"
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data entrega):and_(UrlParam("pagar" as boolean):is_true) → data_source=Search(Tbl.ContasPagar: cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor); ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data vencimento):and_(UrlParam("pagar" as boolean):is_true) → data_source=Search(Tbl.ContasPagar: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.DataVencimento gte UrlParam("datainicio" as date) AND cpo.DataVencimento lte UrlParam("datafim" as date) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor); ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data pedido):and_(UrlParam("pagar" as boolean):is_true) → data_source=Search(Tbl.ContasPagar: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor); ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data NF Megabox):and_(UrlParam("pagar" as boolean):is_true) → data_source=Search(Tbl.ContasPagar: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.DataNfMegabox gte UrlParam("datainicio" as date) AND cpo.DataNfMegabox lte UrlParam("datafim" as date) AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor); ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data baixa sistema):and_(UrlParam("pagar" as boolean):is_true) → data_source=Search(Tbl.ContasPagar: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.DataBaixaSistema gte UrlParam("datainicio" as date) AND cpo.DataBaixaSistema lte UrlParam("datafim" as date) AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor); ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data recebto banco):and_(UrlParam("pagar" as boolean):is_true) → data_source=Search(Tbl.ContasPagar: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.DataRecebimentoBancocaixa gte UrlParam("datainicio" as date) AND cpo.DataRecebimentoBancocaixa lte UrlParam("datafim" as date) AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor); ignore empty)
  - **RepeatingGroup** `rpg a receber geral` (bTrRe) — props: group_type="custom.tbl_contasreceber", rows=1, separator_style="none"
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data entrega):and_(UrlParam("receber" as boolean):is_true) → data_source=Search(Tbl.ContasReceber: cpo.DataEntrega gte UrlParam("datainicio" as date) AND cpo.DataEntrega lte UrlParam("datafim" as date) AND cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor) AND cpo.Arquivado equals False; ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data vencimento):and_(UrlParam("receber" as boolean):is_true) → data_source=Search(Tbl.ContasReceber: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.DataVencimento gte UrlParam("datainicio" as date) AND cpo.DataVencimento lte UrlParam("datafim" as date) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor) AND cpo.Arquivado equals False; ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data pedido):and_(UrlParam("receber" as boolean):is_true) → data_source=Search(Tbl.ContasReceber: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.DataPedido gte UrlParam("datainicio" as date) AND cpo.DataPedido lte UrlParam("datafim" as date) AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor) AND cpo.Arquivado equals False; ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data NF Megabox):and_(UrlParam("receber" as boolean):is_true) → data_source=Search(Tbl.ContasReceber: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.DataNfMegabox gte UrlParam("datainicio" as date) AND cpo.DataNfMegabox lte UrlParam("datafim" as date) AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor) AND cpo.Arquivado equals False; ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data baixa sistema):and_(UrlParam("receber" as boolean):is_true) → data_source=Search(Tbl.ContasReceber: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.DataBaixaSistema gte UrlParam("datainicio" as date) AND cpo.DataBaixaSistema lte UrlParam("datafim" as date) AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor) AND cpo.Arquivado equals False; ignore empty)
    - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data recebto banco):and_(UrlParam("receber" as boolean):is_true) → data_source=Search(Tbl.ContasReceber: cpo.QualCliente equals UrlParam("cliente" as custom.tbl_clientes) AND cpo.QualFornecedor equals UrlParam("fornecedor" as custom.tbl_clientes) AND cpo.CobrancaNum equals UrlParam("numcobranca" as number) AND cpo.StatusFinanceiro equals UrlParam("statusfinanceiro" as option.opt_statusfinanceiro) AND cpo.QualVendedor equals UrlParam("vendedor" as user) AND cpo.NumNfFornecedor text contains string "{UrlParam("fornecedornf" as text)}" AND cpo.NumNfMegabox equals "{UrlParam("megaboxnf" as number)}" AND cpo.NumeroPedido equals "{UrlParam("numpedido" as number)}" AND cpo.QualOrigem equals UrlParam("filialfornecedor" as custom.tbl_enderecosclifor) AND cpo.QualDestino equals UrlParam("filialcliente" as custom.tbl_enderecosclifor) AND cpo.Arquivado equals False AND cpo.DataRecebimentoBancocaixa is_not_empty ∅ AND cpo.DataRecebimentoBancocaixa gte UrlParam("datainicio" as date) AND cpo.DataRecebimentoBancocaixa lte UrlParam("datafim" as date); ignore empty)
    - ⟂ quando El[dd arquivados]:get_data:equals(Text("Sim")) → data_source=Search(Tbl.ContasReceber: cpo.Arquivado equals True)
- **CustomElement** `tool.Historico A` (bTpQl) — USA Reusable tool.Historico · oculto ao carregar · props: custom_id="bTdrv", floating_reference_horizontal_resp="right"
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showhistorico_:is_false → is_visible=False
- **CustomElement** `pop.HistoricosContaReceber A` (bTpQp) — USA Reusable pop.HistoricosContaReceber · props: custom_id="bTlza"
- **Group** `gp elmentos aplicativo` (bTpKG)
  - **Group** `Group B` (bTpIt) — props: vertical_centering=True
    - **Group** `gp pagar receber` (bTplF) — props: vertical_centering=True
      - **Group** `Group EZZZ` (bTpkj) — props: vertical_centering=True
        - **Plugin[1680110374647x249108010620944400]/AAx** `chk receber` (bTpkX) — props: AAg=UrlParam("receber" as boolean), AAh="var(--color_primary_default)", AAi="var(--color_primary_contrast_default)", AAj="var(--color_primary_contrast_default)", AAo="var(--color_bTHGl_default)", ABD="var(--color_primary_contrast_default)", ABE="var(--color_bTHGl_default)", ABI=3
        - **Text** `Text MZZZ` (bTpkd) — text: "Lista a receber"
      - **Group** `Group FZZZ` (bTpku) — props: vertical_centering=True
        - **Plugin[1680110374647x249108010620944400]/AAx** `chk pagar` (bTpkz) — props: AAg=UrlParam("pagar" as boolean), AAh="var(--color_primary_default)", AAi="var(--color_primary_contrast_default)", AAj="var(--color_primary_contrast_default)", AAo="var(--color_bTHGl_default)", ABD="var(--color_primary_contrast_default)", ABE="var(--color_bTHGl_default)", ABI=3
        - **Text** `Text NZZZ` (bTplA) — text: "Lista a pagar"
    - **Group** `gp botoes` (bTpJz) — props: vertical_centering=True
      - **Group** `Group YZZZ` (bTrRH) — props: vertical_centering=True
        - **Button** `btn enviar cobranca` (bTpKA) — text: "Enviar Cobrança" · props: icon="material outlined send", vertical_centering=True, icon_size=16, button_gap=4, button_type="label_icon", title_attribute="ENVIAR COBRANÇA DE CONTAS A RECEBER", border_color_top="var(--color_bTHGl_default)", border_style_top="solid", border_color_left="var(--color_bTHGl_default)", border_style_left="solid", four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=5, border_roundness_right=0
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:count:less_than(1):or_(El[dd filterfinanceiro filialfornecedor]:get_data:is_empty) → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
          - ⟂ quando This:is_hovered → icon="material filled send", letter_spacing=0, font_weight="600"
        - **Button** `btn baixar cr` (bTpKB) — text: "Baixar Contas a Receber" · props: icon="material outlined receipt_long", vertical_centering=True, icon_size=16, button_gap=4, button_type="label_icon", title_attribute="BAIXAR CONTAS A RECEBER"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:count:less_than(1) → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
          - ⟂ quando This:is_hovered → icon="material filled receipt_long", letter_spacing=0, font_weight="600"
        - **Button** `btn relatorio cr` (bTrRB) — text: "Relatório contas a receber" · props: icon="material outlined format_list_bulleted", vertical_centering=True, icon_size=16, button_gap=4, button_type="label_icon", title_attribute="MAIL COM LISTA DE CONTAS A PAGAR", border_color_top="var(--color_bTHGl_default)", border_style_top="solid", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_style_right="solid", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=5
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:count:less_than(1) → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
          - ⟂ quando This:is_hovered → letter_spacing=0, font_weight="600"
      - **Group** `Group ZZZZ` (bTrRT) — props: vertical_centering=True
        - **Button** `btn baixar cp` (bTrPt) — text: "Baixar Contas a Pagar" · props: icon="material outlined receipt_long", vertical_centering=True, icon_size=16, button_gap=4, button_type="label_icon", title_attribute="BAIXAR CONTAS A RECEBER", border_color_top="var(--color_bTHGl_default)", border_style_top="solid", border_color_left="var(--color_bTHGl_default)", border_style_left="solid", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_style_right="solid", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=5, border_roundness_right=0
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:count:less_than(1) → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
          - ⟂ quando This:is_hovered → icon="material filled receipt_long", letter_spacing=0, font_weight="600"
        - **Button** `btn relatorio cp` (bTpsB) — text: "Relatório contas a pagar" · props: icon="material outlined format_list_bulleted", vertical_centering=True, icon_size=16, button_gap=4, button_type="label_icon", title_attribute="MAIL COM LISTA DE CONTAS A PAGAR", border_color_top="var(--color_bTHGl_default)", border_style_top="solid", four_border_style=True, border_color_right="var(--color_bTHGl_default)", border_style_right="solid", border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=5
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:count:less_than(1) → font_color="var(--color_bTHGl_default)", icon_color="var(--color_bTHGl_default)", button_disabled=True
          - ⟂ quando This:is_hovered → letter_spacing=0, font_weight="600"
      - **Button** `Button limparfiltros` (bTpKF) — text: "Limpar Filtros" · props: icon="material outlined filter_alt_off", icon_size=16, button_gap=4, button_type="label_icon", title_attribute="LIMPAR FILTROS"
        - ⟂ quando This:is_hovered → icon="material filled filter_alt_off", letter_spacing=0, font_weight="600"
    - **RadioButtons** `RadioButtons A` (bTpIy) — data_source: All(Opt.TiposData) · props: mandatory=True, columns=3, default=Opt.TiposData.all values:filtered(constraints={0={key="_advanced_search_constraint", value=UrlParam("dtfiltro" as None):equals(InjectedValue:display), constraint_type=∅}}):first_element, dynamic_type="option.opt_entregavcto", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
    - **Plugin[1642683387367x708220519175946200]/AAC** `Scrollbar cr` (bTrSH) — props: AAD="remodelacr", AAE=7
    - **Plugin[1642683387367x708220519175946200]/AAC** `Scrollbar cp` (bTrSN) — props: AAD="remodelacp", AAE=7
  - **Group** `gp filtros financeiro` (bTpIr) — props: vertical_centering=True
    - **Group** `Group IZ` (bTpGz) — props: vertical_centering=True
      - **Text** `Text DZ` (bTpHG) — text: "Intervalo de data"
      - **Group** `Group N` (bTpHA) — props: vertical_centering=True
        - **Plugin[1648823245313x509054419018711040]/AAC** `dtr filterfinanceiro data` (bTpHF) — props: padding_horizontal=5, padding_vertical=10, AAD=UrlParam("datainicio" as date):to_range(UrlParam("datafim" as date)), AAG="pt-BR", AAH="DD/MM/YY", AAK=True, AAM=2, AAN=2, AAP="Aplicar", AAQ="Cancelar", AAS=False, AAf="{UrlParam("datainicio" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")} - {UrlParam("datafim" as date):format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
          - ⟂ quando This:is_hovered → 
        - **Icon** `btn periodointegral` (bTpHB) — props: icon="material regular event_repeat", vertical_centering=True, button_disabled=True, title_attribute="Filtra data: Todo historico"
          - ⟂ quando El[dd filterfinanceiro CLIENTE]:get_data:is_not_empty:or_(El[dd filterfinanceiro fornecedor]:get_data:is_not_empty):or_(El[dd filterfinanceiro status]:get_data:is_not_empty) → icon_color="var(--color_primary_default)", button_disabled=False
    - **Group** `Group SZ` (bTpIV) — props: vertical_centering=True
      - **Text** `Text PZ` (bTpIZ) — text: "Núm pedido"
      - **Group** `gp filter numeropedido` (bTpIa) — props: group_type="number", vertical_centering=True
        - **Input** `dd filterfinanceiro numpedido` (bTpIb) — placeholder: "Número cobrança" · content: UrlParam("numpedido" as number) · content_format: "int_number" · props: placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `reset filter numcobranca` (bTpIf) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro numpedido]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group JZ` (bTpHH) — props: vertical_centering=True
      - **Text** `Text IZ` (bTpHL) — text: "Cliente"
      - **Group** `gp filter cliente` (bTpHM) — props: vertical_centering=True
        - **AutocompleteDropdown** `dd filterfinanceiro CLIENTE` (bTpHN) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente; sort cpo.NomeCliFor) · placeholder: "Cliente" · props: default=UrlParam("cliente" as custom.tbl_clientes), field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `reset filter cliente` (bTpHR) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro CLIENTE]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group KZ` (bTpHS) — props: vertical_centering=True
      - **Text** `Text JZ` (bTpHT) — text: "Grupo Fornecedor"
      - **Group** `gp filter fornecedor` (bTpHX) — props: vertical_centering=True
        - **AutocompleteDropdown** `dd filterfinanceiro fornecedor` (bTpHY) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor AND cpo.Ativo equals True; sort cpo.NomeCliFor) · placeholder: "Grupo Fornecedor" · props: default=UrlParam("fornecedor" as custom.tbl_clientes), field_to_search="cpo_nomecliente_text", placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `reset filter fornecedor` (bTpHZ) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro fornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group XZZ` (bTpIg) — props: vertical_centering=True
      - **Text** `Text YZZ` (bTpIh) — text: "Filial Fornecedor"
      - **Group** `gp filter filial fornecedor` (bTpIl) — props: vertical_centering=True
        - **Dropdown** `dd filterfinanceiro filialfornecedor` (bTpIm) — data_source: El[rpg a receber geral]:get_list_data:cpo.QualOrigem:sorted(descending=False, sort_field="cpo_nomeendere_o_text") · placeholder: "Filial Fornecedor" · props: default=UrlParam("filialfornecedor" as custom.tbl_enderecosclifor), dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", computed_value="number", placeholder_color="var(--color_bTHGl_default)", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} ({InjectedValue:cpo.CnpjCpf})"
        - **Icon** `reset filter fornecedor` (bTpIn) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro filialfornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group LZ` (bTpHd) — props: vertical_centering=True
      - **Text** `Text KZ` (bTpHe) — text: "Vendedor"
      - **Group** `gp filter vendedor` (bTpHf) — props: vertical_centering=True
        - **AutocompleteDropdown** `dd filterfinanceiro vendedor` (bTpHj) — data_source: Search(User: cpo.Ativo equals True; sort cpo.NomeModelo) · placeholder: "Vendedor" · props: default=UrlParam("vendedor" as user), field_to_search="cpo_nome_text", placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `reset filter vendedor` (bTpHk) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro vendedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group MZ` (bTpHl) — props: vertical_centering=True
      - **Text** `Text LZ` (bTpHp) — text: "Num NF Fornecedor"
      - **Group** `gp filter nf fornecedor` (bTpHq) — props: group_type="number", vertical_centering=True
        - **Input** `dd filterfinanceiro NFfornecedor` (bTpHr) — placeholder: "Fornecedor NF" · content: "{UrlParam("fornecedornf" as number)}" · props: placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `reset filter nf fornecedor` (bTpHv) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro NFfornecedor]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group NZ` (bTpHw) — props: vertical_centering=True
      - **Text** `Text MZ` (bTpHx) — text: "Num NF Megabox"
      - **Group** `gp filter nf megabox` (bTpIB) — props: group_type="number", vertical_centering=True
        - **Input** `dd filterfinanceiro numcobranca` (bTpIC) — placeholder: "Megabox NF" · content: "{UrlParam("megaboxnf" as number)}" · props: placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `reset filter nf megabox` (bTpID) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro numcobranca]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group OZ` (bTpIH) — props: vertical_centering=True
      - **Text** `Text NZ` (bTpII) — text: "Núm cobrança"
      - **Group** `gp filter numerocobranca` (bTpIJ) — props: group_type="number", vertical_centering=True
        - **Input** `dd filterfinanceiro numcobranca` (bTpIN) — placeholder: "Número cobrança" · content: UrlParam("numcobranca" as number) · content_format: "int_number" · props: placeholder_color="var(--color_bTHGl_default)"
        - **Icon** `reset filter numcobranca` (bTpIO) — props: icon="material outlined filter_alt_off", vertical_centering=True, button_disabled=False
          - ⟂ quando El[dd filterfinanceiro numcobranca]:get_data:is_not_empty → icon_color="var(--color_bTHHJ_default)"
    - **Group** `Group PZ` (bTpIP) — props: vertical_centering=True
      - **Text** `Text OZ` (bTpIT) — text: "Status recebimento"
      - **Dropdown** `dd filterfinanceiro status` (bTpIU) — data_source: All(Opt.StatusFinanceiro) · placeholder: "Status" · props: default=UrlParam("statusfinanceiro" as option.opt_statusfinanceiro), vertical_centering=True, dynamic_type="option.opt_statusfinanceiro", choices_style="dynamic", option_display_expression="{InjectedValue:display:to_uppercase}"
    - **Group** `Group BZZZZ` (bUFEO) — props: vertical_centering=True
      - **Text** `Text DZZZZ` (bUFET) — text: "Arquivados"
      - **Dropdown** `dd arquivados` (bUFEU) — placeholder: "Sim/Não" · props: choices="Sim\nNão", vertical_centering=True, dynamic_type="boolean", choices_style="static", computed_value="text", option_display_expression=""
  - **Group** `gp receber` (bTple) — props: vertical_centering=True
    - ⟂ quando UrlParam("receber" as boolean):is_true → is_visible=True
    - ⟂ quando UrlParam("receber" as boolean):is_false → is_visible=False
    - **Table** `rpg receber` (bTpGv) — data_source: CurrentUser:cpo.SelecionadosReceber:merged_with(El[rpg a receber geral]:get_list_data) · props: group_type="custom.tbl_contasreceber", vertical_centering=True, unique_id="remodelacr", vertical_separator_color="var(--color_surface_default)", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=4
      - **TableCrossAxis** `TableCrossAxis A` (bTpFn) — props: axis_index=1, cross_axis_repeat=True
        - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.12)"
        - ⟂ quando CurrentUser:cpo_tempcobrarentregas_list_custom_tbl_entregas:contains(Ancestor[TableCrossAxis]) → 
        - **TableCell** `Cell A` (bTpCC) — props: cell_main_axis_id="bTpFr"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group KZZ` (bTpCD) — props: vertical_centering=True
            - **Icon** `filtrar vendedor` (bTpqL) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text A` (bTpCI) — text: "Vendedor: "
            - **Text** `Text ZZZ` (bTpCJ) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_capitalized_words}")}"
          - **Group** `Group F` (bTpCN) — props: vertical_centering=True
            - **Icon** `filtrar pedido` (bTpqb) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text A` (bTpCO) — text: "[b]Núm Pedido[/b]: "
            - **Text** `Text AZZZ` (bTpCP) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumeroPedido}")}"
            - **Icon** `abri pedido` (bTsMb) — props: icon="material outlined open_in_new", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
          - **Text** `Text YZZZ` (bTvJc) — text: "Entrega: {Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:_id:to_uppercase}")}"
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_false → is_visible=False
          - **Text** `Text ZZZZ` (bTvJi) — text: "CR: {Text("{Ancestor[TableCrossAxis]:_id}")}"
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_false → is_visible=False
        - **TableCell** `Cell A` (bTpCT) — props: cell_main_axis_id="bTpGh"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group W` (bTpCU) — props: vertical_centering=True
            - **Text** `Text A` (bTpCV) — text: "Dt Pedido"
              - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data pedido) → font_color="var(--color_alert_default)"
            - **Text** `Text R` (bTpCZ) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataPedido:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
          - **Group** `Group X` (bTpCa) — oculto ao carregar · props: vertical_centering=True
            - **Text** `Text A` (bTpCb) — text: "Dt prev entrega"
            - **Text** `Text S` (bTpCf) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataPrevEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
          - **Group** `Group Y` (bTpCg) — props: vertical_centering=True
            - **Text** `Text A` (bTpCh) — text: "Dt vcto"
              - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data vencimento) → font_color="var(--color_bTHHJ_default)"
            - **Text** `Text T` (bTpCl) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataVencimento:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
              - ⟂ quando Page.Current Date/Time:greater_than(Ancestor[TableCrossAxis]:cpo.DataVencimento):and_(Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.A receber)) → font_color="var(--color_bTHHQ_default)", font_weight="600"
          - **Group** `Group Z` (bTpCm) — props: vertical_centering=True
            - **Text** `Text A` (bTpCn) — text: "Dt entrega"
              - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data entrega) → font_color="var(--color_bTHHJ_default)"
            - **Text** `Text U` (bTpCr) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
        - **TableCell** `Cell A` (bTpCs) — props: cell_main_axis_id="bTpGi"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group JZZ` (bTpCt) — props: vertical_centering=True
            - **Icon** `filtrar cliente` (bTpCx) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text A` (bTpCy) — text: "Grupo: "
            - **Text** `Text BZZZ` (bTpCz) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}"
          - **Group** `Group V` (bTpDD) — props: vertical_centering=True
            - **Text** `Text CZZZ` (bTpDF) — text: "Filial: "
            - **Text** `Text N` (bTpDE) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_capitalized_words}")}"
          - **Group** `Group BZZZ` (bTpDJ) — props: vertical_centering=True
            - **Text** `Text A` (bTpDK) — text: "[b]Contato[/b]: "
            - **Text** `Text DZZZ` (bTpDL) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualPedido:cpo.EmailCliente:cpo.NomeContato:to_capitalized_words}")}"
        - **TableCell** `Cell A` (bTpDP) — props: cell_main_axis_id="bTpGj"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group BZ` (bTpDQ) — props: vertical_centering=True
            - **Text** `Text A` (bTpDR) — text: "Vlr Venda UN"
            - **Text** `Text W` (bTpDV) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
          - **Group** `Group CZ` (bTpDW) — props: vertical_centering=True
            - **Text** `Text A` (bTpDX) — text: "Vlr Venda TT"
            - **Text** `Text X` (bTpDb) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorTotal:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
          - **Group** `Group DZ` (bTpDc) — props: vertical_centering=True
            - **Text** `Text A` (bTpDd) — text: "Vlr Comissão"
            - **Text** `Text Y` (bTpDh) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
        - **TableCell** `Cell A` (bTpDi) — props: cell_main_axis_id="bTpGn"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group IZZ` (bTpDn) — props: vertical_centering=True
            - **Icon** `filtrar fornecedor` (bTpDo) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("fornecedor" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualFornecedor) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text A` (bTpDp) — text: "Grupo: "
            - **Text** `Text EZZZ` (bTpDt) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}")}"
          - **Group** `Group U` (bTpDu) — props: vertical_centering=True
            - **Text** `Text M` (bTpDv) — text: "Filial: "
            - **Text** `Text FZZZ` (bTpDz) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_capitalized_words}")}"
          - **Text** `Text A` (bTpDj) — text: "[b]Prod.[/b]: {Text("{Ancestor[TableCrossAxis]:cpo.Qtd} - {Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_capitalized_words}")}"
        - **TableCell** `Cell A` (bTpEA) — props: cell_main_axis_id="bTpGo"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group QZ` (bTpEB) — props: vertical_centering=True
            - **Icon** `open cobranca pdf copy` (bTpEL) — oculto ao carregar · props: icon="material filled info", vertical_centering=True, unique_id="NFARQUIVO", button_disabled=True, title_attribute="essa conta a receber foi importada"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Importado:is_true → is_visible=True
            - **Text** `Text A` (bTpEF) — text: "[b]NF Fornec:[/b] "
            - **Text** `Text GZZZ` (bTpEH) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumNfFornecedor}")}"
            - **Icon** `open nf fornecedor` (bTpEG) — props: icon="material outlined attach_file", vertical_centering=True, unique_id="NFARQUIVO"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.ArquivoNfFornecedor:is_empty → icon_color="var(--color_bTHGl_default)"
          - **Group** `Group TZ` (bTpEM) — props: vertical_centering=True
            - **Text** `Text QZ` (bTpEN) — text: "[b]Boletos:[/b] "
            - **Text** `Text HZZZ` (bTpES) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:count}")}"
            - **CustomElement** `pop.AnexaNf A` (bUEqi0) — USA Reusable pop.AnexaNf · data_source: Ancestor[TableCrossAxis]:cpo.QualEntrega · props: floating_reference="top", custom_id="bTbua", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
            - **Icon** `open boletos` (bTpER) — oculto ao carregar · props: icon="material outlined attach_file", vertical_centering=True, unique_id="NFARQUIVO"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.ArquivoNfFornecedor:is_empty → icon_color="var(--color_bTHGl_default)"
          - **Group** `Group CZZZ` (bTpET) — props: vertical_centering=True
            - **Text** `Text A` (bTpEX) — text: "[b]Dt Nf:[/b] "
            - **Text** `Text IZZZ` (bTpEY) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.DtEmissaoNf:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
        - **TableCell** `Cell A` (bTpEZ) — props: cell_main_axis_id="bTpGp"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group GZ` (bTpEd) — props: vertical_centering=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → border_color="var(--color_bTHHX_default)", bgcolor="var(--color_bTHHW_default)", border_style="solid"
            - **HTML** `HTML A` (bTpEe) — html(360 chars) · props: vertical_centering=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → icon="material outlined price_check", html="<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#108f66"><path d="M260-361v-40H160v-80h200v-80H200q-17 0-28.5-11.5T160-601v-160q0-17 11.5-28.5T200-801h60v-40h80v40h100v80H240v80h160q17 0 28.5 11.5T440-601v160q0 17-11.5 28.5T400-401h-60v40h-80Zm298 240L388-291l56-56 114 114 226-226 56 56-282 282Z"/></svg>", icon_color="var(--color_bTHHX_default)"
            - **Text** `Text B` (bTpEf) — text: "{Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:display}" · props: font_alignment="center"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → font_color="var(--color_bTHHX_default)"
          - **Group** `Group D` (bTpEj) — props: vertical_centering=True, border_color_top="var(--color_bTHHJ_default)", border_style_top="solid", border_color_left="var(--color_bTHHJ_default)", border_style_left="solid", four_border_style=True, border_color_right="var(--color_bTHHJ_default)", border_style_right="solid", border_color_bottom="var(--color_bTHHJ_default)", border_style_bottom="solid", border_roundness_left=16, border_roundness_right=16
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisHistoricos:count:less_than(1) → is_visible=True
            - **Text** `Text Current row's Tbl.Co` (bTpEk) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisHistoricos:last_element:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy/ - HH:MM")}"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisHistoricos:count:less_than(1) → text="{∅}Adicionar Hist", is_visible=True
            - **Text** `txt msgem` (bTpEl) — oculto ao carregar · text: "{Ancestor[TableCrossAxis]:cpo.QuaisHistoricos:last_element:cpo.Descricao}"
        - **TableCell** `Cell C` (bTpEp) — props: cell_main_axis_id="bTpGt"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Text** `Text OZZZ` (bTpmy) — text: "{Text("{CellIndex} / {El[rpg receber]:get_list_data:count}")}" · props: font_alignment="center"
          - **Group** `Group KZZZ` (bTpnF) — props: vertical_centering=True
            - **Icon** `btn arquivar` (bUFDM) — props: icon="material outlined archive", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1) → icon_color="var(--color_bTHGl_default)"
              - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2, title_attribute="{∅}Arquivar cobrança "
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_true → is_visible=False
            - **Icon** `btn desarquivar` (bUFEt) — props: icon="material outlined unarchive", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1) → icon_color="var(--color_bTHGl_default)"
              - ⟂ quando This:is_hovered → boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2, title_attribute="{∅}Desarquivar cobrança "
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Arquivado:is_false → is_visible=False
            - **Icon** `bt edita contas receber` (bTpEr) — props: icon="material outlined mode_edit", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Icon** `Icon B` (bTpEq) — props: icon="material outlined check_box_outline_blank", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
        - **TableCell** `Cell G` (bTpEv) — props: cell_main_axis_id="bTpGu"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group ZZZ` (bTpFP) — props: vertical_centering=True
            - **Group** `Group E` (bTpFT) — props: vertical_centering=True
              - **Text** `Text E` (bTpFV) — text: "[b]Cobrança núm:[/b] "
              - **Text** `Text JZZZ` (bTpFZ) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.CobrancaNum}")}"
              - **Icon** `open cobranca pdf` (bTpFU) — props: icon="material outlined attach_file", vertical_centering=True, unique_id="NFARQUIVO", button_disabled=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualCobranca:cpo.AnexoFile:is_not_empty:or_(Ancestor[TableCrossAxis]:cpo.QualCobranca:cpo.AnexoLink:is_not_empty) → icon_color="var(--color_primary_default)", button_disabled=False
            - **Group** `Group RZ` (bTpFa) — props: vertical_centering=True
              - **Text** `Text P` (bTpFb) — text: "[b]Nf Receb[/b]. "
              - **Text** `Text KZZZ` (bTpFg) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumNfMegabox}")}"
              - **Icon** `open nf recebimento` (bTpFf) — props: icon="material outlined attach_file", vertical_centering=True, unique_id="NFARQUIVO", button_disabled=True
                - ⟂ quando Ancestor[TableCrossAxis]:cpo.AnexoNfMegabox:is_not_empty → icon_color="var(--color_primary_default)", button_disabled=False
            - **Group** `Group VZZ` (bTpFh) — props: vertical_centering=True
              - **Text** `Text V` (bTpFl) — text: "[b]Quem baixou:[/b] "
              - **Text** `Text XZZ` (bTpFm) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QuemBaixou:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}")}"
          - **Group** `Group YZZ` (bTpEw) — props: vertical_centering=True
            - **Group** `Group SZZ` (bTpEx) — props: vertical_centering=True
              - **Text** `Text Q` (bTpFB) — text: "[b]Dt NF/Recibo:[/b] "
                - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data NF Megabox) → font_color="var(--color_bTHHJ_default)"
              - **Text** `Text UZZ` (bTpFC) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataNfMegabox:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
            - **Group** `Group TZZ` (bTpFD) — props: vertical_centering=True
              - **Text** `Text LZZ` (bTpFH) — text: "[b]Dt Receb Banco:[/b] "
                - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data recebto banco) → font_color="var(--color_bTHHJ_default)"
              - **Text** `Text VZZ` (bTpFI) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataRecebimentoBancocaixa:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
            - **Group** `Group UZZ` (bTpFJ) — props: vertical_centering=True
              - **Text** `Text TZZ` (bTpFN) — text: "[b]Dt Baixa Sistema:[/b] "
                - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data baixa sistema) → font_color="var(--color_bTHHJ_default)"
              - **Text** `Text WZZ` (bTpFO) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataBaixaSistema:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
      - **TableMainAxis** `TableMainAxis A` (bTpFr) — props: axis_index=1
      - **TableCrossAxis** `TableCrossAxis A` (bTpFs) — props: axis_index=0, make_sticky=True
        - **TableCell** `Cell A` (bTpFt) — props: cell_main_axis_id="bTpFr"
          - **Text** `Text A` (bTpFx) — text: "Vendedor⏎Núm pedido"
        - **TableCell** `Cell A` (bTpFy) — props: cell_main_axis_id="bTpGh"
          - **Text** `Text A` (bTpFz) — text: "Datas" · props: font_alignment="center"
        - **TableCell** `Cell A` (bTpGD) — props: cell_main_axis_id="bTpGi"
          - **Text** `Text A` (bTpGE) — text: "Cliente⏎Contato"
        - **TableCell** `Cell A` (bTpGF) — props: cell_main_axis_id="bTpGj"
          - **Text** `Text A` (bTpGJ) — text: "Valores"
        - **TableCell** `Cell A` (bTpGK) — props: cell_main_axis_id="bTpGn"
          - **Text** `Text A` (bTpGL) — text: "Fornecedor⏎Produto"
        - **TableCell** `Cell A` (bTpGP) — props: cell_main_axis_id="bTpGo"
          - **Text** `Text A` (bTpGQ) — text: "NF Fornecedor⏎Dt NF Fornecedor"
        - **TableCell** `Cell A` (bTpGR) — props: cell_main_axis_id="bTpGp"
          - **Text** `Text EZZ` (bTpGV) — text: "Status⏎Último histórico"
        - **TableCell** `Cell B` (bTpGW) — props: cell_main_axis_id="bTpGt"
          - **Icon** `Icon D` (bTpGb) — props: icon="material outlined check_box", vertical_centering=True, title_attribute="marca todos"
          - **Icon** `Icon C` (bTpGX) — props: icon="material outlined check_box_outline_blank", vertical_centering=True, title_attribute="desmarca todos"
        - **TableCell** `Cell F` (bTpGc) — props: cell_main_axis_id="bTpGu"
          - **Text** `Text C` (bTpGd) — text: "NF Recebimento⏎Dt NF Recebimento"
      - **TableMainAxis** `TableMainAxis A` (bTpGh) — props: axis_index=13
      - **TableMainAxis** `TableMainAxis A` (bTpGi) — props: axis_index=8
      - **TableMainAxis** `TableMainAxis A` (bTpGj) — props: axis_index=14
      - **TableMainAxis** `TableMainAxis A` (bTpGn) — props: axis_index=12
      - **TableMainAxis** `TableMainAxis A` (bTpGo) — props: axis_index=15
      - **TableMainAxis** `TableMainAxis A` (bTpGp) — props: axis_index=19
      - **TableMainAxis** `TableMainAxis B` (bTpGt) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis D` (bTpGu) — props: axis_index=18
  - **Group** `gp pagar` (bTpll) — props: vertical_centering=True
    - ⟂ quando UrlParam("pagar" as boolean):is_true → is_visible=True
    - ⟂ quando UrlParam("pagar" as boolean):is_false → is_visible=False
    - **Table** `rpg pagar` (bTpdN) — data_source: CurrentUser:cpo.SelecionadosPagar:merged_with(El[rpg a pagar geral]:get_list_data) · props: group_type="custom.tbl_contasreceber1", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_surface_default)", horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=4
      - **TableCrossAxis** `TableCrossAxis C` (bTpgz) — props: axis_index=1, cross_axis_repeat=True
        - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.12)"
        - ⟂ quando CurrentUser:cpo_tempcobrarentregas_list_custom_tbl_entregas:contains(Ancestor[TableCrossAxis]) → 
        - **TableCell** `Cell K` (bTpdO) — props: cell_main_axis_id="bTphD"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpdP) — props: vertical_centering=True
            - **Icon** `filtrar vendedor` (bTpqo) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text LZZZ` (bTpdU) — text: "Vendedor: "
            - **Text** `Text LZZZ` (bTpdV) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_capitalized_words}")}"
          - **Group** `Group DZZZ` (bTpdZ) — props: vertical_centering=True
            - **Icon** `filtrar pedido` (bTprB) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text LZZZ` (bTpda) — text: "[b]Núm Pedido[/b]: "
            - **Text** `Text LZZZ` (bTpdb) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.NumeroPedido}")}"
          - **Text** `Text AZZZZ` (bTvJo) — text: "Entrega: {Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:_id:to_uppercase}")}"
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_false → is_visible=False
          - **Text** `Text BZZZZ` (bTvJu) — text: "CR: {Text("{Ancestor[TableCrossAxis]:_id}")}"
            - ⟂ quando CurrentUser:cpo.IsDev:is_true → is_visible=True
            - ⟂ quando CurrentUser:cpo.IsDev:is_false → is_visible=False
        - **TableCell** `Cell K` (bTpdf) — props: cell_main_axis_id="bTpht"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpdg) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpdh) — text: "Dt Pedido"
              - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data pedido) → font_color="var(--color_alert_default)"
            - **Text** `Text LZZZ` (bTpdl) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataPedido:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
          - **Group** `Group DZZZ` (bTpds) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpdt) — text: "Dt vcto"
              - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data vencimento) → font_color="var(--color_bTHHJ_default)"
            - **Text** `Text LZZZ` (bTpdx) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataVencimento:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
              - ⟂ quando Page.Current Date/Time:greater_than(Ancestor[TableCrossAxis]:cpo.DataVencimento):and_(Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.A receber)) → font_color="var(--color_bTHHQ_default)", font_weight="600"
          - **Group** `Group DZZZ` (bTpdy) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpdz) — text: "Dt entrega"
              - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data entrega) → font_color="var(--color_bTHHJ_default)"
            - **Text** `Text LZZZ` (bTpeD) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
        - **TableCell** `Cell K` (bTpeE) — props: cell_main_axis_id="bTphu"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpeF) — props: vertical_centering=True
            - **Icon** `filtrar cliente` (bTpeJ) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("cliente" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualCliente) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text LZZZ` (bTpeK) — text: "Grupo: "
            - **Text** `Text LZZZ` (bTpeL) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}")}"
          - **Group** `Group DZZZ` (bTpeP) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpeR) — text: "Filial: "
            - **Text** `Text LZZZ` (bTpeQ) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_capitalized_words}")}"
          - **Group** `Group DZZZ` (bTpeV) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpeW) — text: "[b]Contato[/b]: "
            - **Text** `Text LZZZ` (bTpeX) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualPedido:cpo.EmailCliente:cpo.NomeContato:to_uppercase}")}"
        - **TableCell** `Cell K` (bTpeb) — props: cell_main_axis_id="bTphv"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpec) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTped) — text: "Vlr Venda UN"
            - **Text** `Text LZZZ` (bTpeh) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
          - **Group** `Group DZZZ` (bTpei) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpej) — text: "Vlr Venda TT"
            - **Text** `Text LZZZ` (bTpen) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.ValorTotal:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
          - **Group** `Group DZZZ` (bTpeo) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpep) — text: "Vlr Comissão"
            - **Text** `Text LZZZ` (bTpet) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}"
        - **TableCell** `Cell K` (bTpeu) — props: cell_main_axis_id="bTphz"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpez) — props: vertical_centering=True
            - **Icon** `filtrar fornecedor` (bTpfA) — props: icon="material outlined filter_alt", vertical_centering=True, title_attribute="Filtrar esse fornecedor"
              - ⟂ quando UrlParam("fornecedor" as custom.tbl_clientes):equals(Ancestor[TableCrossAxis]:cpo.QualFornecedor) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Text** `Text LZZZ` (bTpfB) — text: "Grupo: "
            - **Text** `Text LZZZ` (bTpfF) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}")}"
          - **Group** `Group DZZZ` (bTpfG) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpfH) — text: "Filial: "
            - **Text** `Text LZZZ` (bTpfL) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_capitalized_words}")}"
          - **Text** `Text LZZZ` (bTpev) — text: "[b]Prod.[/b]: {Text("{Ancestor[TableCrossAxis]:cpo.Qtd} - {Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}")}"
        - **TableCell** `Cell K` (bTpfM) — props: cell_main_axis_id="bTpiA"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpfN) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpfR) — text: "[b]NF Fornec:[/b] "
            - **Text** `Text LZZZ` (bTpfT) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.NumNfFornecedor}")}"
            - **Icon** `open nf fornecedor` (bTpfS) — props: icon="material outlined attach_file", vertical_centering=True, unique_id="NFARQUIVO"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.ArquivoNfFornecedor:is_empty → icon_color="var(--color_bTHGl_default)"
            - **Icon** `open cobranca pdf copy` (bTpfX) — oculto ao carregar · props: icon="material filled info", vertical_centering=True, unique_id="NFARQUIVO", button_disabled=True, title_attribute="essa conta a pagar foi gerada retroativamente"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.Importado:is_true → is_visible=True
          - **Group** `Group DZZZ` (bTpfY) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpfZ) — text: "[b]Boletos:[/b] "
            - **Text** `Text LZZZ` (bTpfe) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:count}")}"
            - **Icon** `open boletos` (bTpfd) — props: icon="material outlined attach_file", vertical_centering=True, unique_id="NFARQUIVO"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.ArquivoNfFornecedor:is_empty → icon_color="var(--color_bTHGl_default)"
          - **Group** `Group DZZZ` (bTpff) — props: vertical_centering=True
            - **Text** `Text LZZZ` (bTpfj) — text: "[b]Dt Nf:[/b] "
            - **Text** `Text LZZZ` (bTpfk) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.DtEmissaoNf:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
        - **TableCell** `Cell K` (bTpfl) — props: cell_main_axis_id="bTpiB"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpfp) — props: vertical_centering=True
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → border_color="var(--color_bTHHX_default)", bgcolor="var(--color_bTHHW_default)", border_style="solid"
            - **HTML** `HTML B` (bTpfq) — html(360 chars) · props: vertical_centering=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → icon="material outlined price_check", html="<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#108f66"><path d="M260-361v-40H160v-80h200v-80H200q-17 0-28.5-11.5T160-601v-160q0-17 11.5-28.5T200-801h60v-40h80v40h100v80H240v80h160q17 0 28.5 11.5T440-601v160q0 17-11.5 28.5T400-401h-60v40h-80Zm298 240L388-291l56-56 114 114 226-226 56 56-282 282Z"/></svg>", icon_color="var(--color_bTHHX_default)"
            - **Text** `Text LZZZ` (bTpfr) — text: "{Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:display}" · props: font_alignment="center"
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.StatusFinanceiro:equals(Opt.StatusFinanceiro.Recebido) → font_color="var(--color_bTHHX_default)"
          - **Group** `Group DZZZ` (bTpfv) — props: vertical_centering=True, border_color_top="var(--color_bTHHJ_default)", border_style_top="solid", border_color_left="var(--color_bTHHJ_default)", border_style_left="solid", four_border_style=True, border_color_right="var(--color_bTHHJ_default)", border_style_right="solid", border_color_bottom="var(--color_bTHHJ_default)", border_style_bottom="solid", border_roundness_left=16, border_roundness_right=16
            - ⟂ quando Ancestor[TableCrossAxis]:cpo.QuaisHistoricos:count:less_than(1) → is_visible=False
            - **Text** `Text Current row's Tbl.Co` (bTpfw) — text: "{Ancestor[TableCrossAxis]:cpo.QuaisHistoricos:last_element:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy/ - HH:MM")}"
            - **Text** `txt msgem` (bTpfx) — oculto ao carregar · text: "{Ancestor[TableCrossAxis]:cpo.QuaisHistoricos:last_element:cpo.Descricao}"
        - **TableCell** `Cell K` (bTpgB) — props: cell_main_axis_id="bTpiF"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Text** `Text PZZZ` (bTpnQ) — text: "{Text("{CellIndex} / {El[rpg pagar]:get_list_data:count}")}" · props: font_alignment="center"
          - **Group** `Group LZZZ` (bTpnX) — props: vertical_centering=True
            - **Icon** `bt edita contas pagar` (bTpgD) — props: icon="material outlined mode_edit", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(1) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **Icon** `Icon EZ` (bTpgC) — props: icon="material outlined check_box_outline_blank", vertical_centering=True
              - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → icon="material outlined check_box"
        - **TableCell** `Cell K` (bTpgH) — props: cell_main_axis_id="bTpiG"
          - ⟂ quando CellIndex:modulo(2):equals(1) → bgcolor="rgba(var(--color_bTHGs_default_rgb), 0.08)"
          - ⟂ quando CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis]) → bgcolor="var(--color_bTHHF_default)"
          - **Group** `Group DZZZ` (bTpgI) — props: vertical_centering=True
            - **Group** `Group DZZZ` (bTpgP) — props: vertical_centering=True
              - **Text** `Text LZZZ` (bTpgT) — text: "[b]Dt Pagto Banco:[/b] "
                - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data recebto banco) → font_color="var(--color_bTHHJ_default)"
              - **Text** `Text LZZZ` (bTpgU) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataRecebimentoBancocaixa:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
            - **Group** `Group DZZZ` (bTpgV) — props: vertical_centering=True
              - **Text** `Text LZZZ` (bTpgZ) — text: "[b]Dt Baixa Sistema:[/b] "
                - ⟂ quando UrlParam("dtfiltro" as option.opt_entregavcto):equals(Opt.TiposData.Data baixa sistema) → font_color="var(--color_bTHHJ_default)"
              - **Text** `Text LZZZ` (bTpga) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.DataBaixaSistema:format_date(formatting_type="custom", custom_format="dd/mm/yy")}")}"
            - **Group** `Group DZZZ` (bTpgt) — props: vertical_centering=True
              - **Text** `Text LZZZ` (bTpgx) — text: "[b]Quem baixou:[/b] "
              - **Text** `Text LZZZ` (bTpgy) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QuemBaixou:cpo.NomeModelo:split_by(separator=" "):first_element:to_capitalized_words}")}"
      - **TableMainAxis** `TableMainAxis G` (bTphD) — props: axis_index=1
      - **TableCrossAxis** `TableCrossAxis C` (bTphE) — props: axis_index=0, make_sticky=True
        - **TableCell** `Cell K` (bTphF) — props: cell_main_axis_id="bTphD"
          - **Text** `Text LZZZ` (bTphJ) — text: "Vendedor⏎Núm pedido"
        - **TableCell** `Cell K` (bTphK) — props: cell_main_axis_id="bTpht"
          - **Text** `Text LZZZ` (bTphL) — text: "Datas" · props: font_alignment="center"
        - **TableCell** `Cell K` (bTphP) — props: cell_main_axis_id="bTphu"
          - **Text** `Text LZZZ` (bTphQ) — text: "Cliente⏎Contato"
        - **TableCell** `Cell K` (bTphR) — props: cell_main_axis_id="bTphv"
          - **Text** `Text LZZZ` (bTphV) — text: "Valores"
          - **Text** `Text QZZZ` (bTprv) — text: ""
        - **TableCell** `Cell K` (bTphW) — props: cell_main_axis_id="bTphz"
          - **Text** `Text LZZZ` (bTphX) — text: "Fornecedor⏎Produto"
        - **TableCell** `Cell K` (bTphb) — props: cell_main_axis_id="bTpiA"
          - **Text** `Text LZZZ` (bTphc) — text: "NF Fornecedor⏎Dt NF Fornecedor"
        - **TableCell** `Cell K` (bTphd) — props: cell_main_axis_id="bTpiB"
          - **Text** `Text LZZZ` (bTphh) — text: "Status⏎Último histórico"
        - **TableCell** `Cell K` (bTphi) — props: cell_main_axis_id="bTpiF"
          - **Icon** `Icon EZ` (bTphn) — props: icon="material outlined check_box", vertical_centering=True, title_attribute="marca todos"
          - **Icon** `Icon EZ` (bTphj) — props: icon="material outlined check_box_outline_blank", vertical_centering=True, title_attribute="desmarca todos"
        - **TableCell** `Cell K` (bTpho) — props: cell_main_axis_id="bTpiG"
          - **Text** `Text LZZZ` (bTphp) — text: "Info Pagamento⏎"
      - **TableMainAxis** `TableMainAxis G` (bTpht) — props: axis_index=13
      - **TableMainAxis** `TableMainAxis G` (bTphu) — props: axis_index=8
      - **TableMainAxis** `TableMainAxis G` (bTphv) — props: axis_index=14
      - **TableMainAxis** `TableMainAxis G` (bTphz) — props: axis_index=12
      - **TableMainAxis** `TableMainAxis G` (bTpiA) — props: axis_index=15
      - **TableMainAxis** `TableMainAxis G` (bTpiB) — props: axis_index=19
      - **TableMainAxis** `TableMainAxis G` (bTpiF) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis G` (bTpiG) — props: axis_index=18
  - **Group** `Group XZZZ` (bTrPh) — props: vertical_centering=True
    - **Group** `gp card vencidos` (bTpIz)
      - ⟂ quando UrlParam("showvencidos" as None):equals("yes") → background_style="bgcolor", bgcolor="var(--color_bTnzY0_default)"
      - **Icon** `Icon X` (bTpJD) — props: icon="material outlined monetization_on", vertical_centering=True
      - **Group** `Group HZZ` (bTpJE) — props: vertical_centering=True
        - **Text** `Text HZZ` (bTpJF) — text: "A receber vencidos ({Text("{Search(Tbl.ContasReceber: cpo.DataVencimento gte Date(1577847600000) AND cpo.DataVencimento lte Page.Current Date/Time:change_hours(23):change_minutes(59):change_seconds(59) AND cpo.StatusFinanceiro equals Opt.StatusFinanceiro.A receber):cpo.valorcomissao:count}")})"
        - **Text** `Text HZZ` (bTpJJ) — text: "{Text("{Search(Tbl.ContasReceber: cpo.DataVencimento gte Date(1577847600000) AND cpo.DataVencimento lte Page.Current Date/Time:change_hours(23):change_minutes(59):change_seconds(59) AND cpo.StatusFinanceiro equals Opt.StatusFinanceiro.A receber):cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: vertical_centering=False
    - **Group** `gp cards receber` (bTpvP) — props: vertical_centering=True
      - **Group** `Group Q` (bTpJV)
        - **Icon** `Icon H` (bTpJW) — props: icon="material outlined format_list_bulleted", vertical_centering=True
        - **Group** `Group Q` (bTpJX) — props: vertical_centering=True
          - **Text** `Text J` (bTpJb) — text: "Receber listado ({Text("{El[rpg a receber geral]:get_list_data:count}")})"
          - **Text** `Text J` (bTpJc) — text: "{Text("{El[rpg receber]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: vertical_centering=False
            - ⟂ quando El[rpg receber]:get_list_data:count:less_than(1) → text="{∅}R$ 0,00"
      - **Group** `Group S` (bTpJo)
        - ⟂ quando CurrentUser:cpo.SelecionadosReceber:count:greater_or_equal_than(1) → background_style="bgcolor", bgcolor="var(--color_bTnzY0_default)"
        - **Icon** `Icon J` (bTpJp) — props: icon="material outlined checklist"
        - **Group** `Group S` (bTpJt) — props: vertical_centering=True
          - **Text** `Text L` (bTpJu) — text: "Receber selecionado ({Text("{CurrentUser:cpo.SelecionadosReceber:count}")})"
          - **Text** `Text L` (bTpJv) — text: "{Text("{CurrentUser:cpo.SelecionadosReceber:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: vertical_centering=False
            - ⟂ quando CurrentUser:cpo.SelecionadosReceber:count:less_than(1) → text="{∅}R$ 0,00"
    - **Group** `gp cards pagar` (bTpva) — props: vertical_centering=True
      - **Group** `Group O` (bTpuj)
        - **Icon** `Icon E` (bTpul) — props: icon="material outlined format_list_bulleted", vertical_centering=True
        - **Group** `Group O` (bTpup) — props: vertical_centering=True
          - **Text** `Text D` (bTpuq) — text: "Pagar listado ({Text("{El[rpg a pagar geral]:get_list_data:count}")})"
          - **Text** `Text D` (bTpur) — text: "{Text("{El[rpg pagar]:get_list_data:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: vertical_centering=False
            - ⟂ quando El[rpg pagar]:get_list_data:count:less_than(1) → text="{∅}R$ 0,00"
      - **Group** `Group P` (bTpuw)
        - ⟂ quando CurrentUser:cpo.SelecionadosPagar:count:greater_or_equal_than(1) → background_style="bgcolor", bgcolor="var(--color_bTnzY0_default)"
        - **Icon** `Icon I` (bTpvB) — props: icon="material outlined checklist"
        - **Group** `Group P` (bTpvC) — props: vertical_centering=True
          - **Text** `Text I` (bTpvD) — text: "Pagar selecionado ({Text("{Text("{CurrentUser:cpo.SelecionadosPagar:count}")}")})"
          - **Text** `Text I` (bTpvH) — text: "{Text("{CurrentUser:cpo.SelecionadosPagar:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: vertical_centering=False
            - ⟂ quando CurrentUser:cpo.SelecionadosPagar:count:less_than(1) → text="{∅}R$ 0,00"
- **CustomElement** `pop.AgendaContatos A` (bTpQk) — USA Reusable pop.AgendaContatos · props: custom_id="bTPQa0"
- **CustomElement** `reus cabecalho A` (bTpNp) — USA Reusable tool.Cabecalho · props: custom_id="bTIVb"
- **CustomElement** `tool.DashMenu A` (bTpQf) — USA Reusable tool.MenuPaginas · oculto ao carregar · props: custom_id="bTeRP"
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_true → is_visible=True
  - ⟂ quando El[reus cabecalho A]:custom.var_showmenu_:is_false → is_visible=False
- **CustomElement** `pop.ConfirmaEntrega A` (bTpQj) — USA Reusable pop.EditaContasReceber · props: custom_id="bTiin"
- **Alert** `alt processando` (bTpQq) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! " · props: at_to_top=True
- **Popup** `pop envia cobranca new` (bTpNl) — props: vertical_centering=True
  - **Group** `Group WZ` (bTpNd) — props: vertical_centering=True
    - **Icon** `Icon U` (bTpNf) — props: icon="material outlined close", vertical_centering=True
    - **Group** `gp alert gravando` (bTpNj) — oculto ao carregar · props: vertical_centering=True
      - ⟂ quando El[txt titulo]:is_visible → is_visible=False
      - ⟂ quando El[txt titulo]:isnt_visible → is_visible=True
      - **Text** `Text DZZ` (bTpNk) — text: "[fa]spinner fa-pulse[/fa] Aguarde, gravando registros. Não feche essa janela! "
    - **Text** `txt titulo` (bTpNe) — text: "Cobrança de Fornecedores" · props: font_alignment="center"
  - **Group** `Group WZ` (bTpNY) — props: vertical_centering=True
    - **Group** `gp corpo cobrança` (bTpMv) — props: vertical_centering=True, unique_id="corpocobranca"
      - **Group** `Group XZ` (bTpMD) — props: vertical_centering=True
        - **Image** `Image A` (bTpME) — props: src="{Opt.EmpresaMegabox.Megabox:logo_horizontal}", use_aspect_ratio=True, aspect_ratio_width=4
        - **Group** `Group XZ` (bTpMF) — props: vertical_centering=True
          - **Text** `Text SZ` (bTpMJ) — text: "[b]Consultor[/b]: {CurrentUser:cpo.NomeModelo:to_uppercase}"
          - **Text** `Text SZ` (bTpMK) — text: "[b]Email[/b]: {CurrentUser:email:to_lowercase}"
          - **Text** `Text SZ` (bTpML) — text: "(11) 3509-4670⏎(62) 3142-5356 (Região DDD 62)⏎0800-591-0248 (Demais localidades)⏎(62) 99383-7165 Whatsapp"
      - **Group** `Group XZ` (bTpMP) — props: vertical_centering=True
        - **Group** `Group XZ` (bTpMQ) — props: vertical_centering=True
          - **Text** `Text SZ` (bTpMR) — text: "Cobrança núm: "
          - **Input** `ipt numero cobranca` (bUBbP) — placeholder: "" · content: Search(Tbl.Cobrancas):count:plus(1) · content_format: "int_number" · props: mandatory=True, vertical_centering=True, disabled=True, not_submit_on_enter=True
        - **Text** `Text SZ` (bTpMV) — text: "{Page.Current Date/Time:format_date(formatting_type="dddd, mmmm d, yyyy")}" · props: font_alignment="right"
      - **Group** `Group XZ` (bTpMX) — props: vertical_centering=True
        - **Group** `Group XZ` (bTpMb) — data_source: El[dd filterfinanceiro fornecedor]:get_data · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **PictureInput** `upi novocliente logo` (bTpMi) — placeholder: "" · props: src="{Parent:cpo.Foto}", private=False, disabled=True
            - ⟂ quando Parent:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - **Group** `Group XZ` (bTpMc) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **Text** `Text SZ` (bTpMd) — text: "[b]Fornecedor[/b]: {Parent:cpo.NomeCliFor:to_uppercase}"
            - **Text** `Text SZ` (bTpMh) — text: "[b]A/C:[/b] {El[dd email de cobranca new]:get_data:cpo.NomeContato:to_capitalized_words}"
      - **Group** `Group XZ` (bTpMj) — props: vertical_centering=True
        - **Text** `Text SZ` (bTpMn) — text: "Detalhamento da cobrança:"
      - **Text** `Text UZ` (bTpMW) — text: "[b]Resumo da cobrança: [/b]⏎[b]Quantidade:[/b] {CurrentUser:cpo.SelecionadosReceber:count}⏎[b]Valor total em vendas:[/b] {CurrentUser:cpo.SelecionadosReceber:group_by(groupings={0={fn="exact", end=∅, start=∅, message="cpo_qualentrega_custom_tbl_entregas", interval=∅, information=∅, filling_gaps=∅}}, aggregations={0={fn="median", message="cpo_valorreceber_number"}}):agg0:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}⏎[b]Valor total em comissões[/b]:  {CurrentUser:cpo.SelecionadosReceber:cpo.valorcomissao:sum:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}"
      - **Table** `rpg entregas do produto` (bTpKH) — data_source: CurrentUser:cpo.SelecionadosReceber · props: group_type="custom.tbl_contasreceber", vertical_centering=True, unique_id="remodela", vertical_separator_color="var(--color_primary_contrast_default)", vertical_separator_width=2, horizontal_separator_color="var(--color_primary_contrast_default)", horizontal_separator_width=2
        - **TableMainAxis** `TableMainAxis H` (bTpKL) — props: axis_index=2
        - **TableMainAxis** `TableMainAxis H` (bTpKM) — props: axis_index=3
        - **TableCrossAxis** `TableCrossAxis D` (bTpKN) — props: axis_index=0
          - **TableCell** `Cell L` (bTpKR) — props: cell_main_axis_id="bTpKL"
            - **Text** `Text TZ` (bTpKS) — text: "Datas" · props: font_alignment="center"
          - **TableCell** `Cell L` (bTpKT) — props: cell_main_axis_id="bTpKM"
            - **Text** `Text TZ` (bTpKX) — text: "Qtd/Produto" · props: font_alignment="center"
          - **TableCell** `Cell L` (bTpKY) — props: cell_main_axis_id="bTpLt"
            - **Text** `Text TZ` (bTpKZ) — text: "Valores" · props: font_alignment="center"
          - **TableCell** `Cell L` (bTpKd) — props: cell_main_axis_id="bTpLx"
            - **Text** `Text TZ` (bTpKe) — text: "NF" · props: font_alignment="center"
          - **TableCell** `Cell L` (bTpKf) — props: cell_main_axis_id="bTpLy"
          - **TableCell** `Cell L` (bTpKj) — props: cell_main_axis_id="bTpLz"
            - **Text** `Text TZ` (bTpKk) — text: "Cliente / Pedido" · props: font_alignment="center"
        - **TableCrossAxis** `TableCrossAxis D` (bTpKl) — props: axis_index=1, cross_axis_repeat=True
          - **TableCell** `Cell L` (bTpKp) — props: cell_main_axis_id="bTpKL"
            - **Group** `Group YZ` (bTpKq) — props: vertical_centering=True
              - **Text** `Text VZ` (bTpKr) — text: "Dt Pedido"
              - **Text** `Text VZ` (bTpKv) — text: "{Ancestor[TableCrossAxis]:cpo.DataPedido:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
            - **Group** `Group BZZ` (bTpLC) — props: vertical_centering=True
              - **Text** `Text YZ` (bTpLD) — text: "Dt entrega"
              - **Text** `Text YZ` (bTpLH) — text: "{Ancestor[TableCrossAxis]:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
            - **Group** `Group AZZ` (bTpKw) — props: vertical_centering=True
              - **Text** `Text XZ` (bTpKx) — text: "Dt vcto"
              - **Text** `Text XZ` (bTpLB) — text: "{Ancestor[TableCrossAxis]:cpo.DataVencimento:format_date(formatting_type="custom", custom_format="dd/mm/yy")}"
                - ⟂ quando Page.Current Date/Time:greater_than(Ancestor[TableCrossAxis]:cpo.DataVencimento) → font_color="var(--color_bTHHQ_default)", font_weight="600"
          - **TableCell** `Cell L` (bTpLI) — props: cell_main_axis_id="bTpKM"
            - **Text** `Text Current row's Tbl.Co` (bTpLJ) — text: "{Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QtdVenda} - {Ancestor[TableCrossAxis]:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase}"
            - **HTML** `HTML D` (bUFHN0) — html(961 chars)
          - **TableCell** `Cell L` (bTpLN) — props: cell_main_axis_id="bTpLt"
            - **Group** `Group ZZ` (bTpLO) — props: vertical_centering=True
              - **Text** `Text ZZ` (bTpLP) — text: "Vlr Venda UN"
              - **Text** `Text ZZ` (bTpLT) — text: "{Ancestor[TableCrossAxis]:cpo.ValorUnit:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="right"
            - **Group** `Group CZZ` (bTpLU) — props: vertical_centering=True
              - **Text** `Text AZZ` (bTpLV) — text: "Vlr Venda TT"
              - **Text** `Text AZZ` (bTpLZ) — text: "{Ancestor[TableCrossAxis]:cpo.ValorTotal:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="right"
            - **Group** `Group DZZ` (bTpLa) — props: vertical_centering=True
              - **Text** `Text BZZ` (bTpLb) — text: "Vlr Comissão"
              - **Text** `Text BZZ` (bTpLf) — text: "{Ancestor[TableCrossAxis]:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}" · props: font_alignment="right"
            - **Group** `Group AZZZZ` (bUBrj) — props: vertical_centering=True
              - **Text** `Text CZZZZ` (bUBrl) — text: "Vlr Com. UN"
              - **Text** `aaa comiss unitario` (bUBrp) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.ValorComissaoUnitario:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")}")}" · props: font_alignment="right"
          - **TableCell** `Cell L` (bTpLg) — props: cell_main_axis_id="bTpLx"
            - **Text** `Text TZ` (bTpLh) — text: "{Text("{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.NumNfFornecedor}")}" · props: font_alignment="center"
          - **TableCell** `Cell L` (bTpLl) — props: cell_main_axis_id="bTpLy"
            - **PictureInput** `upi novocliente logo` (bTpLm) — placeholder: "" · props: src="{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
              - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          - **TableCell** `Cell L` (bTpLn) — props: cell_main_axis_id="bTpLz"
            - **Text** `Text TZ` (bTpLr) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
            - **Text** `Text TZ` (bTpLs) — text: "Pedido número: {Ancestor[TableCrossAxis]:cpo.QualPedido:cpo.NumeroPedido:to_uppercase}"
        - **TableMainAxis** `TableMainAxis H` (bTpLt) — props: axis_index=7
        - **TableMainAxis** `TableMainAxis H` (bTpLx) — props: axis_index=4
        - **TableMainAxis** `TableMainAxis H` (bTpLy) — props: axis_index=0
        - **TableMainAxis** `TableMainAxis H` (bTpLz) — props: axis_index=0
      - **Group** `Group XZ` (bTpMo) — props: vertical_centering=True
        - **Text** `Text SZ` (bTpMp) — text: "Mais observações:"
      - **Group** `Group XZ` (bTpMt) — props: vertical_centering=True
        - **Text** `Text SZ` (bTpMu) — text: "Se por acaso, algum cliente da relação não tiver realizado o pagamento, nos informe que realizaremos a cobrança de imediato e iremos retirar o cliente devedor da relação.⏎⏎Segue abaixo os dados bancários para pagamento: ⏎⏎Dados bancários:⏎MEGA BOX LOGISTICA LTDA⏎ITAÚ: Agencia: 0656  Conta: 98797-1⏎CNPJ: 39.667.615/0001-01⏎Chave PIX CNPJ: 39667615000101" · props: vertical_centering=False
    - **Group** `Group WZ` (bTpMz) — props: vertical_centering=True
      - **Group** `Group WZ` (bTpNA) — props: vertical_centering=True
        - **Text** `Text RZ` (bTpNB) — text: "Email para:"
        - **Group** `Group FZZ` (bTpNF) — props: vertical_centering=True
          - **Dropdown** `dd email de cobranca new` (bTpNG) — data_source: El[dd filterfinanceiro filialfornecedor]:get_data:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione um email" · props: mandatory=True, dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeContato:to_uppercase} - {InjectedValue:cpo.Email:to_lowercase}"
          - **Icon** `Icon V` (bTpNH) — props: icon="material outlined contact_phone"
      - **Group** `gp email fornecedor copy` (bTpNS) — props: vertical_centering=True
        - **Text** `Text CZZ` (bTpNT) — text: "Enviar cópia para:"
        - **select2-MultiDropdown** `ipt cc email fornecedor` (bTpNX) — data_source: El[dd filterfinanceiro filialfornecedor]:get_data:cpo.QualGrupoCliFor:cpo.QuaisContatos · placeholder: "Selecione multiplos emails" · props: tag_bgcolor="var(--color_primary_contrast_default)", dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", tag_font_color="var(--color_primary_default)", tag_border_color="var(--color_primary_default)", tag_delete_color="var(--color_primary_default)", option_display_expression="{InjectedValue:cpo.NomeContato:to_capitalized_words} - {InjectedValue:cpo.Email}"
      - **Group** `Group WZ` (bTpNL) — props: vertical_centering=True
        - **Text** `Text RZ` (bTpNM) — text: "Corpo do email:"
        - **MultiLineInput** `ipt corpo email cobranca` (bTpNN) — placeholder: "" · content: "Olá {El[dd email de cobranca new]:get_data:cpo.NomeContato:to_uppercase}⏎⏎Segue em anexo o relatório das comissões dos nossos clientes que já realizaram os pagamentos para vocês.⏎⏎Se por acaso, algum cliente da relação não tiver realizado o pagamento, peço por gentileza que nos informe que realizaremos a cobrança de imediato e iremos retirar o cliente devedor da relação.⏎⏎Segue abaixo os dados bancários para pagamento: ⏎⏎Dados bancários:⏎MEGA BOX LOGISTICA LTDA⏎ITAÚ⏎CNPJ: 39.667.615/0001-01⏎Agencia: 0656  Conta: 98797-1⏎Chave PIX CNPJ: 39667615000101⏎⏎Em caso de dúvidas entre em contato⏎⏎{CurrentUser:cpo.NomeModelo:to_uppercase}⏎{CurrentUser:cpo.EmailContato}" · props: mandatory=True, vertical_centering=True, unique_id="remodela"
        - **Plugin[1648430145817x673906689668022300]/AAc** `PDF/IMG cobranca` (bTpNR)
  - **Button** `Button H` (bTpNZ) — text: "Enviar" · props: vertical_centering=True
- **Popup** `pop apagar registro` (bTpQr) — props: border_color_top="var(--color_bTHHQ_default)", border_style_top="solid", border_width_top=5, four_border_style=True, border_roundness_left=10, border_roundness_right=10
  - **Icon** `Icon A` (bTpQv) — props: icon="fa fa-exclamation-triangle"
  - **Text** `Text EZ` (bTpQw) — text: "Atenção!" · props: font_alignment="center"
  - **Text** `Text FZ` (bTpQx) — text: "Você está tentando apagar um registro de seu banco e dados." · props: font_alignment="center"
  - **Text** `Text GZ` (bTpRB) — text: "Esta ação não pode ser revertida!" · props: font_alignment="center"
  - **Text** `Text HZ` (bTpRC) — text: "Deseja continuar?" · props: font_alignment="center"
  - **Button** `Button C` (bTpRD) — text: "SIM"
  - **Button** `Button D` (bTpRH) — text: "NÃO"

## Workflows

#### WF bTpRI — ButtonClicked em El[Icon B]
- condição: CurrentUser:cpo.SelecionadosReceber:not_contains(Ancestor[TableCrossAxis])
1. **MakeChangeCurrentUser** [bTpRJ] campos: cpo.SelecionadosReceber = Ancestor[TableCrossAxis]

#### WF bTpRN — ButtonClicked em El[Icon B]
- condição: CurrentUser:cpo.SelecionadosReceber:contains(Ancestor[TableCrossAxis])
1. **MakeChangeCurrentUser** [bTpRO] campos: cpo.SelecionadosReceber = Ancestor[TableCrossAxis]

#### WF bTpRP — ButtonClicked em El[Icon D]
1. **MakeChangeCurrentUser** [bTpRT] campos: cpo.SelecionadosReceber = El[rpg receber]:get_list_data

#### WF bTpRU — ButtonClicked em El[Icon C]
1. **MakeChangeCurrentUser** [bTpRV] campos: cpo.SelecionadosReceber = El[rpg receber]:get_list_data

#### WF bTpRZ — PageLoaded
1. **Plugin[1558770956236x539499438875082750]/AAC** [bTpRa] 
2. **ChangePage** [bTpRb] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):and_(CurrentUser:cpo.UltimoDateRange:is_not_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{CurrentUser:cpo.UltimoDateRange:min}"}, 1={key="datafim", value="{CurrentUser:cpo.UltimoDateRange:max}"}}, keep_current_page_params=True
3. **ChangePage** [bTpRf] alvo El[Current page] · SÓ SE UrlParam("datainicio" as date):is_empty:and_(UrlParam("datafim" as date):is_empty):or_(CurrentUser:cpo.UltimoDateRange:is_empty) · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True
4. **ChangePage** [bTpRg] alvo El[Current page] · SÓ SE UrlParam("dtfiltro" as option.opt_entregavcto):is_empty · add_parameters=True, url_parameters={0={key="dtfiltro", value="{Opt.TiposData.Data entrega:display}{∅}"}}, keep_current_page_params=True
5. **ChangePage** [bTplv] alvo El[Current page] · SÓ SE UrlParam("receber" as text):is_empty · add_parameters=True, url_parameters={0={key="receber", value="yes{∅}"}}, keep_current_page_params=True
6. **ChangePage** [bTpmf] alvo El[Current page] · SÓ SE UrlParam("pagar" as text):is_empty · add_parameters=True, url_parameters={0={key="pagar", value="no{∅}"}}, keep_current_page_params=True

#### WF bTpRh — ButtonClicked em El[btn baixar cr]
1. **ShowElement** [bTrFr] alvo El[pop baixar recebiveis]

#### WF bTpRm — InputChanged em El[dd filterfinanceiro fornecedor]
1. **ChangePage** [bTpRn] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTpRr — InputChanged em El[dd filterfinanceiro status]
1. **ChangePage** [bTpRs] alvo El[Current page] · add_parameters=True, url_parameters={0={key="statusfinanceiro", value="{This:get_data:display}"}}, keep_current_page_params=True

#### WF bTpRt — InputChanged em El[dd filterfinanceiro status]
- condição: This:get_data:is_empty:and_(El[dd filterfinanceiro CLIENTE]:get_data:is_empty):and_(El[dd filterfinanceiro fornecedor]:get_data:is_empty)
1. **ChangePage** [bTpRx] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Page.Current Date/Time:change_date(1):change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_date(31):change_hours(23):change_minutes(59):change_seconds(59)}"}, 2={key="statusfinanceiro", value="{This:get_data:display}"}}, keep_current_page_params=True

#### WF bTpRy — Plugin[1648823245313x509054419018711040]/AAd em El[dtr filterfinanceiro data]
1. **MakeChangeCurrentUser** [bTpRz] campos: cpo.UltimoDateRange = This:get_AAF
2. **ChangePage** [bTpSD] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{This:get_AAF:min:change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{This:get_AAF:max:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTpSE — ButtonClicked em El[btn periodointegral]
1. **ChangePage** [bTpSF] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Date(1704078000000)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_hours(23):change_minutes(59):change_seconds(59)}"}}, keep_current_page_params=True

#### WF bTpSJ — InputChanged em El[RadioButtons A]
1. **ResetGroup** [bTpml] alvo El[gp receber]
2. **ResetGroup** [bTpmh] alvo El[gp pagar]
3. **ChangePage** [bTpSK] alvo El[Current page] · add_parameters=True, url_parameters={0={key="dtfiltro", value="{This:get_data:display}"}}, keep_current_page_params=True

#### WF bTpSL — ButtonClicked em El[reset filter cliente]
1. **ResetGroup** [bTpSP] alvo El[gp filter cliente]
2. **ChangePage** [bTpSQ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{∅}"}}, keep_current_page_params=True

#### WF bTpSR — InputChanged em El[dd filterfinanceiro CLIENTE]
1. **ChangePage** [bTpSV] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTpSW — ButtonClicked em El[reset filter fornecedor]
1. **ResetGroup** [bTpSX] alvo El[gp filter fornecedor]
2. **ChangePage** [bTpSb] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTpSc — ButtonClicked em El[Button limparfiltros]
1. **MakeChangeCurrentUser** [bTpSd] campos: cpo.SelecionadosReceber = ∅; cpo.SelecionadosPagar = ∅
2. **ResetGroup** [bTpSh] alvo El[gp filtros financeiro]
3. **ChangePage** [bTpSi] alvo El[Current page] · add_parameters=True, url_parameters={0={key="receber", value="{UrlParam("receber" as None)}"}, 1={key="pagar", value="{UrlParam("pagar" as None)}"}}, keep_current_page_params=False

#### WF bTpSj — ButtonClicked em El[reset filter numcobranca]
1. **ResetGroup** [bTpSn] alvo El[gp filter numerocobranca]
2. **ChangePage** [bTpSo] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numcobranca", value="{∅}"}}, keep_current_page_params=True

#### WF bTpSp — InputChanged em El[dd filterfinanceiro numcobranca]
1. **ChangePage** [bTpSt] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numcobranca", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTpSu — ButtonClicked em El[btn enviar cobranca]
1. **ShowElement** [bTpSv] alvo El[pop envia cobranca new]

#### WF bTpSz — InputChanged em El[dd filterfinanceiro vendedor]
1. **ChangePage** [bTpTA] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTpTB — ButtonClicked em El[reset filter vendedor]
1. **ResetGroup** [bTpTF] alvo El[gp filter vendedor]
2. **ChangePage** [bTpTG] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{∅}"}}, keep_current_page_params=True

#### WF bTpTH — ButtonClicked em El[bt edita contas receber]
- props: workflow_disabled=True
1. **DisplayGroupData** [bTpTL] alvo El[pop.EditaContasReceberNew A] · data_source=Ancestor[TableCrossAxis]:cpo.QualEntrega
2. **ShowElement** [bTpTM] alvo El[pop.EditaContasReceberNew A]

#### WF bTpTN — InputChanged em El[dd filterfinanceiro NFfornecedor]
1. **ChangePage** [bTpTR] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedornf", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTpTS — InputChanged em El[dd filterfinanceiro numcobranca]
1. **ChangePage** [bTpTT] alvo El[Current page] · add_parameters=True, url_parameters={0={key="megaboxnf", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTpTX — ButtonClicked em El[reset filter nf fornecedor]
1. **ResetGroup** [bTpTY] alvo El[gp filter nf fornecedor]
2. **ChangePage** [bTpTZ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedornf", value="{∅}"}}, keep_current_page_params=True

#### WF bTpTd — ButtonClicked em El[reset filter nf megabox]
1. **ResetGroup** [bTpTe] alvo El[gp filter nf megabox]
2. **ChangePage** [bTpTf] alvo El[Current page] · add_parameters=True, url_parameters={0={key="megaboxnf", value="{∅}"}}, keep_current_page_params=True

#### WF bTpTj — ButtonClicked em El[open nf fornecedor]
1. **OpenURL** [bTpTk] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.ArquivoNfFornecedor}"

#### WF bTpTl — InputChanged em El[dd filterfinanceiro numpedido]
1. **ChangePage** [bTpTp] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bTpTq — ButtonClicked em El[reset filter numcobranca]
1. **ResetGroup** [bTpTr] alvo El[gp filter numeropedido]
2. **ChangePage** [bTpTv] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{∅}"}}, keep_current_page_params=True

#### WF bTpTw — ButtonClicked em El[open boletos]
- props: workflow_disabled=True
1. **OpenURL** [bTpTx] SÓ SE Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(1):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(1)}"
2. **OpenURL** [bTpUB] SÓ SE Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(2):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(2)}"
3. **OpenURL** [bTpUC] SÓ SE Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(3):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(3)}"
4. **OpenURL** [bTpUD] SÓ SE Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(4):is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.BoletoArquivos:specific_item(4)}"

#### WF bTpUH — ButtonClicked em El[Button H]
- props: event_color="purple"
1. **ScrollToElement** [bTpUI] alvo El[gp alert gravando]
2. **HideElement** [bTpUJ] alvo El[txt titulo]
3. **Plugin[1648430145817x673906689668022300]/AAL** [bTpUN] alvo El[PDF/IMG cobranca] · AAM="corpocobranca", AAO=800, AAP=1100, AAQ="cobranca _numero{El[ipt numero cobranca]:get_data}__{El[dd filterfinanceiro filialfornecedor]:get_data:cpo.NomeEndereco:to_lowercase}", AAf=False

#### WF bTpUO — ButtonClicked em El[Icon U]
1. **HideElement** [bTpUP] alvo El[pop envia cobranca new]

#### WF bTpUT — ButtonClicked em El[Icon V]
1. **ShowElement** [bTpUU] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTpUV] alvo El[pop.AgendaContatos A] · data_source=El[dd filterfinanceiro filialfornecedor]:get_data:cpo.QualGrupoCliFor

#### WF bTpUZ — Plugin[1648430145817x673906689668022300]/AAY em El[PDF/IMG cobranca]
- props: event_color="purple"
1. **NewThing** [bTpUa] tipo Tbl.Cobrancas · campos: cpo.NumeroCobranca = El[ipt numero cobranca]:get_data; cpo.QualFornecedor = El[dd filterfinanceiro fornecedor]:get_data; cpo.AnexoLink = "{This:get_AAb}"; cpo.QuaisContasReceber = CurrentUser:cpo.SelecionadosReceber
2. **ChangeListOfThings** [bTpUb] campos: cpo.QualCobranca = ResultOfStep[bTpUa]; cpo.CobrancaNum = ResultOfStep[bTpUa]:cpo.NumeroCobranca · to_change=CurrentUser:cpo.SelecionadosReceber, type_to_change="custom.tbl_contasreceber"
3. **MakeChangeCurrentUser** [bTpUf] campos: cpo.SelecionadosReceber = ∅
4. **ScheduleAPIEvent** [bTpUg] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{El[ipt cc email fornecedor]:get_data:cpo.Email}", _wf_param_to="{El[dd email de cobranca new]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 10):cpo.QuaisUsuarios:cpo.EmailContato}", _wf_param_body="{El[ipt corpo email cobranca]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_anexo1="{ResultOfStep[bTpUa]:cpo.AnexoLink}", _wf_param_sender="[Megabox] {CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}", _wf_param_subject="{Text("Cobrança número {ResultOfStep[bTpUa]:cpo.NumeroCobranca}")}", _wf_param_atachments="{This:get_AAb}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
5. **ShowElement** [bTpUh] alvo El[txt titulo]
6. **NewThing** [bTpUl] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Enviado email de cobrança número {ResultOfStep[bTpUa]:cpo.NumeroCobranca} contendo relatório anexo de contas a receber")}"; cpo.QualCliente = ResultOfStep[bTpUa]:cpo.QualFornecedor; cpo.QualVendedor = CurrentUser; cpo.AnexoLink = "{This:get_AAb}"
7. **HideElement** [bTpUn] alvo El[pop envia cobranca new]
8. **ResetGroup** [bTpUr] alvo El[pop envia cobranca new]

#### WF bTpUs — ButtonClicked em El[Group D]
1. **ToggleElement** [bTpUt] alvo El[txt msgem]
2. **ShowElement** [bUFAN] alvo El[pop.HistoricosContaReceber A]
3. **DisplayGroupData** [bUFAS] alvo El[pop.HistoricosContaReceber A] · data_source=Ancestor[TableCrossAxis]

#### WF bTpUx — ButtonClicked em El[open cobranca pdf]
1. **OpenURL** [bTpUy] SÓ SE Ancestor[TableCrossAxis]:cpo.QualCobranca:cpo.AnexoLink:is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualCobranca:cpo.AnexoLink}"
2. **OpenURL** [bTpUz] SÓ SE Ancestor[TableCrossAxis]:cpo.QualCobranca:cpo.AnexoFile:is_not_empty · open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualCobranca:cpo.AnexoFile}"

#### WF bTpVD — ButtonClicked em El[gp card vencidos]
1. **ChangePage** [bTpVE] alvo El[Current page] · add_parameters=True, url_parameters={0={key="datainicio", value="{Date(1641006000000)}"}, 1={key="datafim", value="{Page.Current Date/Time:change_hours(23):change_minutes(59):change_seconds(59)}"}, 2={key="statusfinanceiro", value="{Opt.StatusFinanceiro.A receber:display}"}, 3={key="dtfiltro", value="{Opt.TiposData.Data vencimento:display}"}, 4={key="showvencidos", value="yes{∅}"}, 5={key="receber", value="yes"}, 6={key="pagar", value="no{∅}"}}, keep_current_page_params=True

#### WF bTpVF — ButtonClicked em El[filtrar fornecedor]
1. **ChangePage** [bTpVJ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{Ancestor[TableCrossAxis]:cpo.QualFornecedor:_id}"}}, keep_current_page_params=True

#### WF bTpVK — ButtonClicked em El[filtrar cliente]
1. **ChangePage** [bTpVL] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{Ancestor[TableCrossAxis]:cpo.QualCliente:_id}"}}, keep_current_page_params=True

#### WF bTpVP — ButtonClicked em El[Button I]
- condição: El[tgg gerar recibo]:get_AAI:is_false
1. **ScrollToElement** [bTvTM] alvo El[Página financeiro]
2. **SetCustomState** [bTvSt] alvo El[pop baixar recebiveis] · value=True, custom_state="custom.var_showalert_"
3. **ChangeListOfThings** [bTpVQ] campos: cpo.DataNfMegabox = El[ipt dt nf recibo megabox]:get_data; cpo.NumNfMegabox = "{El[ipt num nfrecibo megabox]:get_data}"; cpo.StatusFinanceiro = Opt.StatusFinanceiro.Recebido; cpo.AnexoNfMegabox = "{El[ipt anexo nf megabox]:get_data}"; cpo.DataBaixaSistema = Page.Current Date/Time; cpo.QuemBaixou = CurrentUser; cpo.DataRecebimentoBancocaixa = El[ipt dt receb bancocaixa]:get_data · to_change=CurrentUser:cpo.SelecionadosReceber, type_to_change="custom.tbl_contasreceber"
4. **ResetInputs** [bTpVR] 
5. **SetCustomState** [bTvTA] alvo El[pop baixar recebiveis] · value=False, custom_state="custom.var_showalert_"
6. **HideElement** [bTvTF] alvo El[pop baixar recebiveis]

#### WF bTpVX — ButtonClicked em El[open nf recebimento]
1. **OpenURL** [bTpVb] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.AnexoNfMegabox}"

#### WF bTpVc — ButtonClicked em El[txt msgem]
1. **ShowElement** [bTpVd] alvo El[pop.HistoricosContaReceber A]
2. **DisplayGroupData** [bTpVh] alvo El[pop.HistoricosContaReceber A] · data_source=Ancestor[TableCrossAxis]

#### WF bTpiM — ButtonClicked em El[Icon EZ]
1. **MakeChangeCurrentUser** [bTpiR] campos: cpo.SelecionadosPagar = El[rpg pagar]:get_list_data

#### WF bTpiT — ButtonClicked em El[Icon EZ]
1. **MakeChangeCurrentUser** [bTpiY] campos: cpo.SelecionadosPagar = El[rpg pagar]:get_list_data

#### WF bTpid — ButtonClicked em El[filtrar cliente]
1. **ChangePage** [bTpif] alvo El[Current page] · add_parameters=True, url_parameters={0={key="cliente", value="{Ancestor[TableCrossAxis]:cpo.QualCliente:_id}"}}, keep_current_page_params=True

#### WF bTpik — ButtonClicked em El[filtrar fornecedor]
1. **ChangePage** [bTpip] alvo El[Current page] · add_parameters=True, url_parameters={0={key="fornecedor", value="{Ancestor[TableCrossAxis]:cpo.QualFornecedor:_id}"}}, keep_current_page_params=True

#### WF bTpir — ButtonClicked em El[open nf fornecedor]
1. **OpenURL** [bTpiw] open_in_new_tab=True, url="{Ancestor[TableCrossAxis]:cpo.QualEntrega:cpo.ArquivoNfFornecedor}"

#### WF bTpjB — ButtonClicked em El[open boletos]

#### WF bTpjO — ButtonClicked em El[Group DZZZ]
1. **ToggleElement** [bTpjT] alvo El[txt msgem]

#### WF bTpjg — ButtonClicked em El[Icon EZ]
- condição: CurrentUser:cpo.SelecionadosPagar:not_contains(Ancestor[TableCrossAxis])
1. **MakeChangeCurrentUser** [bTpjl] campos: cpo.SelecionadosPagar = Ancestor[TableCrossAxis]

#### WF bTpjn — ButtonClicked em El[Icon EZ]
- condição: CurrentUser:cpo.SelecionadosPagar:contains(Ancestor[TableCrossAxis])
1. **MakeChangeCurrentUser** [bTpjs] campos: cpo.SelecionadosPagar = Ancestor[TableCrossAxis]

#### WF bTpjx — ButtonClicked em El[bt edita contas pagar]
1. **ChangePage** [bTvJE] alvo El[Página historico] · open_in_new_tab=True, add_parameters=True, url_parameters={0={key="numpedido", value="{Ancestor[TableCrossAxis]:cpo.NumeroPedido}"}}

#### WF bTplx — Plugin[1680110374647x249108010620944400]/AAf em El[chk receber]
- condição: UrlParam("receber" as None):equals("yes")
1. **ChangePage** [bTpmD] alvo El[Current page] · add_parameters=True, url_parameters={0={key="receber", value="{∅}no"}}, keep_current_page_params=True

#### WF bTpmH — Plugin[1680110374647x249108010620944400]/AAf em El[chk receber]
- condição: UrlParam("receber" as None):equals("no")
1. **ChangePage** [bTpmJ] alvo El[Current page] · add_parameters=True, url_parameters={0={key="receber", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTpmO — Plugin[1680110374647x249108010620944400]/AAf em El[chk pagar]
- condição: UrlParam("pagar" as None):equals("yes")
1. **ChangePage** [bTpmU] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pagar", value="{∅}no"}}, keep_current_page_params=True

#### WF bTpmV — Plugin[1680110374647x249108010620944400]/AAf em El[chk pagar]
- condição: UrlParam("pagar" as None):equals("no")
1. **ChangePage** [bTpma] alvo El[Current page] · add_parameters=True, url_parameters={0={key="pagar", value="{∅}yes"}}, keep_current_page_params=True

#### WF bTpqR — ButtonClicked em El[filtrar vendedor]
1. **ChangePage** [bTpqW] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{Ancestor[TableCrossAxis]:cpo.QualVendedor:_id}"}}, keep_current_page_params=True

#### WF bTpqh — ButtonClicked em El[filtrar pedido]
1. **ChangePage** [bTpqj] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{Ancestor[TableCrossAxis]:cpo.NumeroPedido}"}}, keep_current_page_params=True

#### WF bTpqu — ButtonClicked em El[filtrar vendedor]
1. **ChangePage** [bTpqz] alvo El[Current page] · add_parameters=True, url_parameters={0={key="vendedor", value="{Ancestor[TableCrossAxis]:cpo.QualVendedor:_id}"}}, keep_current_page_params=True

#### WF bTprH — ButtonClicked em El[filtrar pedido]
1. **ChangePage** [bTprM] alvo El[Current page] · add_parameters=True, url_parameters={0={key="numpedido", value="{Ancestor[TableCrossAxis]:cpo.NumeroPedido}"}}, keep_current_page_params=True

#### WF bTpsH — ButtonClicked em El[btn relatorio cp]
1. **ScheduleAPIEvent** [bTpud] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{CurrentUser:cpo.EmailContato}", _wf_param_body="{Text("Lista de comissões a pagar:⏎⏎{CurrentUser:cpo.SelecionadosPagar:format_as_text(content="[b]Cliente[/b]: {InjectedValue:cpo.QualCliente:cpo.NomeCliFor:to_uppercase} - [b]Destino[/b]: {InjectedValue:cpo.QualDestino:cpo.NomeEndereco:to_uppercase} [b]Num pedido: [/b]{InjectedValue:cpo.DataPedido:format_date(formatting_type="custom", custom_format="dd/mmm/yy")} - [b]Dt Entrega:[/b] {InjectedValue:cpo.DataEntrega:format_date(formatting_type="custom", custom_format="dd/mmm/yy")} - [b]Produto:[/b] {InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.QualProduto:cpo.NomeModelo:to_uppercase} - [b]Qtd:[/b] {InjectedValue:cpo.QualOrcamentoFornecedor:cpo.QualCotacaoProduto:cpo.qtd} - [b]Comisssão Megabox:[/b] {InjectedValue:cpo.QualEntrega:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")} - [b]Comissão Vendedor:[/b] {InjectedValue:cpo.valorcomissao:format_number(formatting_type="currency", decimal_place=2, currency_symbol="R$ ", decimal_separator="comma", thousand_separator="dot")} - [b]Data/Núm Nf:[/b] {InjectedValue:cpo.QualEntrega:cpo.DtEmissaoNf:format_date(formatting_type="custom", custom_format="dd/mmm/yy")} - {InjectedValue:cpo.NumNfFornecedor}", delimiter="⏎")}")}", _wf_param_anexo1="", _wf_param_sender="{CurrentUser:cpo.NomeModelo:to_uppercase}", _wf_param_subject="Lista comissões", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
2. **Plugin[1658328157117x953686184769617900]/AAT** [bTpsO] AAF="Email enviado para {CurrentUser:cpo.EmailContato}. Confira caixa de spam."
3. **MakeChangeCurrentUser** [bTpsP] campos: cpo.SelecionadosPagar = ∅

#### WF bTrMB — ButtonClicked em El[Icon N]
1. **HideElement** [bTrMH] alvo El[pop baixar recebiveis]
2. **ResetGroup** [bTrMJ] alvo El[pop baixar recebiveis]

#### WF bTrMV — Plugin[1680110374647x249108010620944400]/AAJ em El[tgg gerar recibo]
1. **ResetGroup** [bTrMb] alvo El[gp num recibo/nf]
2. **ResetGroup** [bTrOk] alvo El[gp enviar recibo email simnao]

#### WF bTrNb — ButtonClicked em El[Icon IZ]
1. **ShowElement** [bTrNd] alvo El[pop.AgendaContatos A]
2. **DisplayGroupData** [bTrNh] alvo El[pop.AgendaContatos A] · data_source=El[dd cnpj forncedor recibo]:get_data:cpo.QualGrupoCliFor

#### WF bTrNj — Plugin[1648430145817x673906689668022300]/AAY em El[PDF/IMG recibo]
- props: event_color="purple"
1. **ChangeListOfThings** [bTrNp] campos: cpo.AnexoNfMegabox = "{This:get_AAb}" · to_change=CurrentUser:cpo.SelecionadosReceber, type_to_change="custom.tbl_contasreceber"
2. **MakeChangeCurrentUser** [bTrNt] campos: cpo.SelecionadosReceber = ∅
3. **ScheduleAPIEvent** [bTrNu] SÓ SE El[tgg enviar email recibo]:get_AAI:is_true · date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_cc="{El[ipt email cc recibo]:get_data:cpo.Email}", _wf_param_to="{El[dd email para recibo]:get_data:cpo.Email}", _wf_param_bcc="{Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 10):cpo.QuaisUsuarios:cpo.EmailContato}", _wf_param_body="{El[ipt email corpo recibo]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_anexo1="{This:get_AAb}", _wf_param_sender="[Megabox] {CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}", _wf_param_subject="{Text("Rebibo número {El[ipt num nfrecibo megabox]:get_data}")}", _wf_param_atachments="{This:get_AAb}", _wf_param_mailpessoal=CurrentUser:cpo.UsaEmailPessoal - deleted
4. **NewThing** [bTrNz] tipo Tbl.Historico · campos: cpo.Descricao = "{Text("Enviado email de recibo número {El[ipt num nfrecibo megabox]:get_data} contendo lista de contas recebidas")}"; cpo.QualCliente = ResultOfStep[bTrNp]:cpo.QualFornecedor:first_element; cpo.QualVendedor = CurrentUser; cpo.AnexoLink = "{This:get_AAb}"; cpo.QualUnidade = El[dd cnpj forncedor recibo]:get_data
5. **ChangeThing** [bTrOA] campos: cpo.UltimoHistoricoData = ResultOfStep[bTrNz]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTrNz] · to_change=ResultOfStep[bTrNz]:cpo.QualCliente
6. **SetCustomState** [bTvTH] alvo El[pop baixar recebiveis] · value=False, custom_state="custom.var_showalert_"
7. **ChangeThing** [bTvTT] campos: cpo.ValorNumero = El[ipt num nfrecibo megabox]:get_data:convert_to_number · to_change=Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 17):first_element
8. **HideElement** [bTrOB] alvo El[pop baixar recebiveis]
9. **ResetGroup** [bTrOF] alvo El[pop baixar recebiveis]

#### WF bTrPJ — ButtonClicked em El[Button I]
- condição: El[tgg gerar recibo]:get_AAI:is_true
1. **ScrollToElement** [bTvTR] alvo El[Página financeiro]
2. **SetCustomState** [bTvSv] alvo El[pop baixar recebiveis] · value=True, custom_state="custom.var_showalert_"
3. **ChangeListOfThings** [bTrPO] campos: cpo.DataNfMegabox = El[ipt dt nf recibo megabox]:get_data; cpo.NumNfMegabox = "{El[ipt num nfrecibo megabox]:get_data}"; cpo.StatusFinanceiro = Opt.StatusFinanceiro.Recebido; cpo.DataBaixaSistema = Page.Current Date/Time; cpo.QuemBaixou = CurrentUser; cpo.DataRecebimentoBancocaixa = El[ipt dt receb bancocaixa]:get_data · to_change=CurrentUser:cpo.SelecionadosReceber, type_to_change="custom.tbl_contasreceber"
4. **ChangeThing** [bUFHZ1] campos: cpo.ValorNumero = El[ipt num nfrecibo megabox]:get_data:convert_to_number · to_change=Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 17):first_element
5. **Plugin[1648430145817x673906689668022300]/AAL** [bTrPU] alvo El[PDF/IMG recibo] · AAM="corporecibo", AAO=800, AAP=1000, AAQ="ReciboNum: {Text("{ResultOfStep[bTrPO]:first_element:cpo.NumNfMegabox}")} - Fornecedor: {Text("{ResultOfStep[bTrPO]:first_element:cpo.QualFornecedor:cpo.NomeCliFor:to_uppercase}")}", AAf=False, ABA=0

#### WF bTrSm — SEM_TIPO

#### WF bTsMh — ButtonClicked em El[abri pedido]
1. **ChangePage** [bTsMn] alvo El[Página vendas] · open_in_new_tab=True, add_parameters=True, url_parameters={0={key="datainicio", value="{Ancestor[TableCrossAxis]:cpo.DataPedido:change_hours(0):change_minutes(0):change_seconds(0)}"}, 1={key="datafim", value="{Ancestor[TableCrossAxis]:cpo.DataPedido:change_hours(23):change_minutes(59):change_seconds(59)}"}, 2={key="numeropedido", value="{Ancestor[TableCrossAxis]:cpo.NumeroPedido}"}}, keep_current_page_params=False

#### WF bTvIN — ButtonClicked em El[bt edita contas receber]
- props: workflow_disabled=False
1. **ChangePage** [bTvIV] alvo El[Página historico] · open_in_new_tab=True, add_parameters=True, url_parameters={0={key="numpedido", value="{Ancestor[TableCrossAxis]:cpo.NumeroPedido}"}}

#### WF bTvIt — ButtonClicked em El[bt edita contas pagar]
- props: workflow_disabled=True
1. **DisplayGroupData** [bTvIy] alvo El[pop.EditaContasReceberNew A] · data_source=Ancestor[TableCrossAxis]:cpo.QualEntrega
2. **ShowElement** [bTvIz] alvo El[pop.EditaContasReceberNew A]

#### WF bUFDT — ButtonClicked em El[btn arquivar]
1. **ChangeThing** [bUFDd] campos: cpo.Arquivado = True · to_change=Ancestor[TableCrossAxis]
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUFEr] AAF="Arquivado com sucesso", AAL="Top Right"

#### WF bUFEH — ButtonClicked em El[btn relatorio cr]

#### WF bUFEf — InputChanged em El[dd arquivados]
1. **ChangePage** [bUFEm] alvo El[Current page] · add_parameters=True, url_parameters={0={key="arquivado", value="{This:get_data}"}}, keep_current_page_params=True

#### WF bUFFD — ButtonClicked em El[btn desarquivar]
1. **ChangeThing** [bUFFK] campos: cpo.Arquivado = False · to_change=Ancestor[TableCrossAxis]
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUFFP] AAF="Desarquivado com sucesso!"

#### WF bTpVi — InputChanged em El[dd filterfinanceiro filialfornecedor]
1. **ChangePage** [bTpVj] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filialfornecedor", value="{This:get_data:_id}"}}, keep_current_page_params=True

#### WF bTpVn — ButtonClicked em El[reset filter fornecedor]
1. **ResetGroup** [bTpVo] alvo El[gp filter filial fornecedor]
2. **ChangePage** [bTpVp] alvo El[Current page] · add_parameters=True, url_parameters={0={key="filialfornecedor", value="{∅}"}}, keep_current_page_params=True
