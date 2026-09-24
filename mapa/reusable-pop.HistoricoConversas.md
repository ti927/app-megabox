# Reusable: `pop.HistoricoConversas` (bTxuV)


Resumo: 23 elementos · 3 workflows · 7 ações · 7 condicionais · 0 estados customizados
Elementos por tipo: Group 6, Text 5, Icon 2, TableCrossAxis 2, TableCell 2, Table 1, TableMainAxis 1, PictureInput 1, Input 1, MultiLineInput 1, Image 1

## Árvore de elementos

- **Icon** `Icon A` (bTxuX) — props: icon="material outlined close", vertical_centering=True
- **Text** `Text A` (bTxud) — text: "Histórico de conversas"
- **Table** `Table A` (bTxuj) — data_source: Search(Tbl.Historico: cpo.QualCliente equals Parent; sort Created Date desc) · props: group_type="custom.tbl_historico", vertical_centering=True
  - **TableMainAxis** `TableMainAxis A` (bTxuo) — props: axis_index=0
  - **TableCrossAxis** `TableCrossAxis A` (bTxup) — props: axis_index=0
    - **TableCell** `Cell A` (bTxut) — props: cell_main_axis_id="bTxuo"
      - **Group** `gp qual grupo clifor` (bTxuu) — data_source: El[Reusable pop.HistoricoConversas]:get_group_data · props: group_type="custom.tbl_clientes", vertical_centering=True
        - **Group** `Group A` (bTxuz) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **PictureInput** `upi novocliente logo` (bTxvA) — placeholder: "LOGO" · props: src="{Parent:cpo.Foto}"
            - ⟂ quando Parent:cpo.Foto:is_empty → background_style="image", background_image="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
        - **Input** `ipt nome grupoclifor` (bTxuv) — placeholder: "Nome cliente / fornecedor" · content: "{Parent:cpo.NomeCliFor:to_uppercase}" · props: vertical_centering=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
          - ⟂ quando This:get_data:is_empty → border_style_bottom="solid"
          - ⟂ quando This:is_hovered:or_(This:is_focused) → background_style="bgcolor", bgcolor="var(--color_bTHGr_default)"
      - **Group** `gp edita historico por cliente` (bTxvB) — oculto ao carregar · data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_historico", vertical_centering=True
        - ⟂ quando El[Reusable pop.HistoricoConversas]:get_group_data:cpo.QualCarteira:equals(CurrentUser) → is_visible=True
        - ⟂ quando CurrentUser:cpo.QualPerfil:equals(Opt.PerfilUsuario.Diretor) → is_visible=True
        - **MultiLineInput** `ipt descricao historico cli` (bTxvF) — placeholder: "Descrição do atendimento" · content: "{Parent:cpo.Descricao}" · props: vertical_centering=True
        - **Icon** `btn grava historico individual` (bTxvG) — props: icon="material outlined save", vertical_centering=True
  - **TableCrossAxis** `TableCrossAxis A` (bTxvH) — props: axis_index=1, cross_axis_repeat=True
    - **TableCell** `Cell A` (bTxvL) — props: cell_main_axis_id="bTxuo"
      - **Image** `Image A` (bTxvM) — props: stretch_or_rescale="zoom", src="{Ancestor[TableCrossAxis]:Created By:cpo.Foto}"
        - ⟂ quando Ancestor[TableCrossAxis]:cpo.QualVendedor:is_empty → src="//21d85b5f34b72c2c9bea3d9d45458bb7.cdn.bubble.io/f1698174961133x403443266892573600/aa149071.png"
        - ⟂ quando Ancestor[TableCrossAxis]:Created By:cpo.Ativo:is_false → src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fs3.amazonaws.com%2Fappforest_uf%2Ff1664476260407x848551234117814900%2Funnamed.png?w=48&h=48&auto=compress&fit=max"
      - **Group** `Group A` (bTxvN) — props: vertical_centering=True
        - **Group** `Group A` (bTxvR) — props: vertical_centering=True
          - **Text** `Text B` (bTxvS) — text: "Criado: {Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
          - **Text** `Text B` (bTxvT) — text: "Modificado: {Ancestor[TableCrossAxis]:Modified Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}" · props: font_alignment="right"
        - **Text** `Text B` (bTxvX) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao}"
        - **Group** `Group A` (bTxvY) — props: vertical_centering=True
          - **Text** `Text B` (bTxvZ) — text: "Vendedor: {Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}"

## Workflows

#### WF bTxve — ButtonClicked em El[Icon A]
1. **HideElement** [bTxvj] alvo El[Reusable pop.HistoricoConversas]

#### WF bTxvl — ButtonClicked em El[btn grava historico individual]
- condição: El[gp edita historico por cliente]:get_group_data:is_empty
1. **NewThing** [bTxvq] tipo Tbl.Historico · campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[Reusable pop.HistoricoConversas]:get_group_data; cpo.QualVendedor = CurrentUser
2. **ResetGroup** [bTxvr] alvo El[gp edita historico por cliente]
3. **ResetInputs** [bTxvv] 
4. **ChangeThing** [bTxvw] campos: cpo.UltimoHistoricoData = Page.Current Date/Time · to_change=El[Reusable pop.HistoricoConversas]:get_group_data

#### WF bTxwB — ButtonClicked em El[btn grava historico individual]
- condição: El[gp edita historico por cliente]:get_group_data:is_not_empty
1. **ChangeThing** [bTxwD] campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[Reusable pop.HistoricoConversas]:get_group_data; cpo.QualVendedor = CurrentUser · to_change=El[gp edita historico por cliente]:get_group_data
2. **ResetGroup** [bTxwH] alvo El[gp edita historico por cliente]
