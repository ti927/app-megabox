# Reusable: `pop.HistoricosContaReceber` (bTlza)


Resumo: 49 elementos · 4 workflows · 10 ações · 5 condicionais · 0 estados customizados
Elementos por tipo: Group 16, Text 12, TableCell 6, Icon 3, TableMainAxis 3, PictureInput 2, TableCrossAxis 2, Checkbox 1, MultiLineInput 1, Button 1, Table 1, Image 1

## Árvore de elementos

- **Group** `Group A` (bTlzf) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
  - **Text** `Text A` (bTlzl) — text: "Históricos Financeiros" · props: font_alignment="center"
  - **Icon** `Icon A` (bTlzh) — props: icon="material outlined close", vertical_centering=True
- **Group** `Group B` (bTlzn) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
  - **Group** `Group B` (bTlzs) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **Group** `Group B` (bTlzt) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
      - **Group** `gp qual grupo clifor` (bTmAD) — data_source: Parent · props: group_type="custom.tbl_contasreceber"
        - **PictureInput** `upi novocliente logo` (bTmAE) — placeholder: "" · props: src="{Parent:cpo.QualCliente:cpo.Foto}", private=False, disabled=True
          - ⟂ quando Parent:cpo.QualCliente:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Group** `Group B` (bTmAF) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
          - **Text** `Text B` (bTmAJ) — text: "{Parent:cpo.QualCotacao:cpo.QualCliente:cpo.NomeCliFor:to_capitalized_words}"
          - **Text** `Text B` (bTmAK) — text: "[b]Unidade[/b] {Parent:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.NomeEndereco:to_capitalized_words}⏎[b]CNPJ[/b]: {Parent:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino:cpo.CnpjCpf}"
    - **Group** `Group B` (bTmAL) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
      - **Group** `Group B` (bTmAX) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
        - **Checkbox** `chk grava no fornecedor` (bTmAb) — label: "" · props: vertical_centering=True
        - **Text** `Text B` (bTmAc) — text: "Grava historico também para o fornecedor"
      - **Group** `gp qual grupo clifor copy` (bTmAP) — data_source: Parent · props: group_type="custom.tbl_contasreceber"
        - **PictureInput** `upi novocliente logo` (bTmAQ) — placeholder: "" · props: src="{Parent:cpo.QualFornecedor:cpo.Foto}", private=False, disabled=True
          - ⟂ quando Parent:cpo.QualFornecedor:cpo.Foto:is_empty → src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Group** `Group B` (bTmAR) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
          - **Text** `Text B` (bTmAV) — text: "{Parent:cpo.QualFornecedor:cpo.NomeCliFor:to_capitalized_words}"
          - **Text** `Text B` (bTmAW) — text: "[b]Unidade:[/b] {Parent:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.NomeEndereco:to_capitalized_words}⏎[b]CNPJ[/b]: {Parent:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem:cpo.CnpjCpf}"
    - **Group** `gp edita historico` (bTmCx) — props: group_type="custom.tbl_historico", vertical_centering=True
      - **MultiLineInput** `ipt descricao historico` (bTmAd) — placeholder: "Digite o historico da conversa" · content: "{Parent:cpo.Descricao}" · props: vertical_centering=True
    - **Button** `Button A` (bTmAh) — text: "Enviar" · props: icon="material outlined send", button_type="label_icon"
      - ⟂ quando El[gp edita historico]:get_group_data:is_not_empty → text="Salvar", icon="material outlined save", bgcolor="var(--color_bTHHJ_default)"
  - **Group** `Group B` (bTmAi) — data_source: Parent · props: group_type="custom.tbl_contasreceber", vertical_centering=True
    - **Text** `Text B` (bTmBf) — text: "Históricos"
    - **Table** `Table A` (bTmAj) — data_source: Parent:cpo.QuaisHistoricos:sorted(descending=True, sort_field="Created Date") · props: group_type="custom.tbl_historico", vertical_centering=True, unique_id="remodela"
      - **TableMainAxis** `TableMainAxis A` (bTmAn) — props: axis_index=0
      - **TableMainAxis** `TableMainAxis A` (bTmAo) — props: axis_index=1
      - **TableMainAxis** `TableMainAxis A` (bTmAp) — props: axis_index=2
      - **TableCrossAxis** `TableCrossAxis A` (bTmAt) — props: axis_index=0
        - **TableCell** `Cell A` (bTmAu) — props: cell_main_axis_id="bTmAn"
        - **TableCell** `Cell A` (bTmAv) — props: cell_main_axis_id="bTmAo"
        - **TableCell** `Cell A` (bTmAz) — props: cell_main_axis_id="bTmAp"
      - **TableCrossAxis** `TableCrossAxis A` (bTmBA) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell A` (bTmBB) — props: cell_main_axis_id="bTmAn"
          - **Icon** `Icon B` (bTmBF) — props: icon="material outlined mode_edit", vertical_centering=True, button_disabled=True
            - ⟂ quando Ancestor[TableCrossAxis]:Created By:equals(CurrentUser):or_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor)) → icon_color="var(--color_bTHGs_default)", button_disabled=False
        - **TableCell** `Cell A` (bTmBG) — props: cell_main_axis_id="bTmAo"
          - **Image** `Image A` (bTmBZ) — props: src="{Ancestor[TableCrossAxis]:Created By:cpo.Foto}"
          - **Group** `Group B` (bTmBH) — props: vertical_centering=True
            - **Group** `Group B` (bTmBT) — props: vertical_centering=True
              - **Text** `Text B` (bTmBX) — text: "Data: "
              - **Text** `Text B` (bTmBY) — text: "{Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
            - **Group** `Group B` (bTmBN) — props: vertical_centering=True
              - **Text** `Text B` (bTmBR) — text: "Usuário: "
              - **Text** `Text B` (bTmBS) — text: "{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}"
            - **Group** `Group B` (bTmBL) — props: vertical_centering=True
              - **Text** `Text B` (bTmBM) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao}"
        - **TableCell** `Cell A` (bTmBd) — props: cell_main_axis_id="bTmAp"
          - **Icon** `Icon B` (bTmBe) — props: icon="material outlined delete", vertical_centering=True, button_disabled=True
            - ⟂ quando Ancestor[TableCrossAxis]:Created By:equals(CurrentUser):or_(CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor)) → icon_color="var(--color_bTHHQ_default)", button_disabled=False

## Workflows

#### WF bTmBk — ButtonClicked em El[Button A]
- condição: El[gp edita historico]:get_group_data:is_empty
1. **NewThing** [bTmBp] tipo Tbl.Historico · campos: cpo.Descricao = "{El[ipt descricao historico]:get_data}"; cpo.QualDepto = CurrentUser:cpo.QualDepto; cpo.QualVendedor = CurrentUser; cpo.QualCliente = Parent:cpo.QualCliente; cpo.QualUnidade = Parent:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoDestino
2. **ChangeThing** [bTmBx] campos: cpo.UltimoHistoricoData = ResultOfStep[bTmBp]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTmBp] · to_change=Parent:cpo.QualCliente
3. **NewThing** [bTmCr] tipo Tbl.Historico · SÓ SE El[chk grava no fornecedor]:get_data · campos: cpo.Descricao = "{El[ipt descricao historico]:get_data}"; cpo.QualDepto = CurrentUser:cpo.QualDepto; cpo.QualVendedor = CurrentUser; cpo.QualCliente = Parent:cpo.QualFornecedor; cpo.QualUnidade = Parent:cpo.QualOrcamentoFornecedor:cpo.QualEnderecoOrigem
4. **ChangeThing** [bTmBv] SÓ SE El[chk grava no fornecedor]:get_data · campos: cpo.UltimoHistoricoData = ResultOfStep[bTmBp]:Created Date; cpo.UltimoHistoricoMsg = ResultOfStep[bTmBp] · to_change=Parent:cpo.QualFornecedor
5. **ChangeThing** [bTmBq] campos: cpo.QuaisHistoricos = ResultOfStep[bTmBp] · to_change=Parent
6. **ResetInputs** [bTmCB] 

#### WF bTmCH — ButtonClicked em El[Icon A]
1. **HideElement** [bTmCN] alvo El[Reusable pop.HistoricosContaReceber]

#### WF bTmDE — ButtonClicked em El[Icon B]
1. **DisplayGroupData** [bTmDK] alvo El[gp edita historico] · data_source=Ancestor[TableCrossAxis]

#### WF bTmDL — ButtonClicked em El[Button A]
- condição: El[gp edita historico]:get_group_data:is_not_empty
1. **ChangeThing** [bTmDd] campos: cpo.Descricao = "{El[ipt descricao historico]:get_data}" · to_change=El[gp edita historico]:get_group_data
2. **ResetGroup** [bTmDi] alvo El[gp edita historico]
