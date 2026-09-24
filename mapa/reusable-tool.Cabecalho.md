# Reusable: `tool.Cabecalho` (bTIVb)

Estados customizados: `var_colorhex_` : text; `var_showmenu_` : boolean; `var_qualsubmenu_` : Opt.MenuConfig; `var_numberpadding_` : number; `var_showhistorico_` : boolean

Resumo: 47 elementos · 9 workflows · 14 ações · 11 condicionais · 7 estados customizados
Elementos por tipo: Group 11, Text 10, Icon 4, CustomElement 3, Image 3, Popup 2, TableCrossAxis 2, TableCell 2, Button 2, Table 1, TableMainAxis 1, PictureInput 1, Input 1, Plugin[1680110374647x249108010620944400]/AAC 1, FloatingGroup 1, Plugin[1642683387367x708220519175946200]/AAC 1, HTML 1

## Árvore de elementos

- **CustomElement** `pop.AgendaContatos A` (bTeHn) — USA Reusable pop.AgendaContatos · props: custom_id="bTPQa0"
- **CustomElement** `pop.AgendaEnderecos A` (bTeHt) — USA Reusable pop.AgendaEnderecos · props: custom_id="bTPJL"
- **Popup** `pop historico` (bTejp) — props: group_type="custom.tbl_clientes", vertical_centering=True
  - **Icon** `Icon Q` (bTenH) — props: icon="material outlined close", vertical_centering=True
  - **Text** `Text P` (bTenN) — text: "Histórico de conversas"
  - **Table** `Table H` (bTejv) — data_source: Search(Tbl.Historico: cpo.QualCliente equals Parent; sort Created Date desc) · props: group_type="custom.tbl_historico", vertical_centering=True
    - **TableMainAxis** `TableMainAxis O` (bTekr) — props: axis_index=0
    - **TableCrossAxis** `TableCrossAxis H` (bTekx) — props: axis_index=0
      - **TableCell** `Cell V` (bTelB) — props: cell_main_axis_id="bTekr"
        - **Group** `gp qual grupo clifor` (bTelP) — data_source: El[pop historico]:get_group_data · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Group** `Group I` (bTelZ) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
            - **PictureInput** `upi novocliente logo` (bTela) — placeholder: "LOGO" · props: src="{Parent:cpo.Foto}"
          - **Input** `ipt nome grupoclifor` (bTelU) — placeholder: "Nome cliente / fornecedor" · content: "{Parent:cpo.NomeCliFor:to_uppercase}" · props: vertical_centering=True, border_style_top="none", border_style_left="none", four_border_style=True, placeholder_color="var(--color_bTHGl_default)", border_style_right="none", border_style_bottom="none", border_roundness_left=0, border_roundness_right=0
            - ⟂ quando This:get_data:is_empty → border_style_bottom="solid"
            - ⟂ quando This:is_hovered:or_(This:is_focused) → background_style="bgcolor", bgcolor="var(--color_bTHGr_default)"
    - **TableCrossAxis** `TableCrossAxis H` (bTelH) — props: axis_index=1, cross_axis_repeat=True, fixed_number_repeating_axis=True, fixed_number_repeating_axis_count=3
      - **TableCell** `Cell V` (bTelI) — props: cell_main_axis_id="bTekr"
        - **Image** `Image C` (bTemL) — props: stretch_or_rescale="zoom", src="{Ancestor[TableCrossAxis]:Created By:cpo.Foto}"
        - **Group** `Group L` (bTemR) — props: vertical_centering=True
          - **Group** `Group J` (bTelm) — props: vertical_centering=True
            - **Text** `Text R` (bTelr) — text: "Criado: {Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
            - **Text** `Text R` (bTels) — text: "Modificado: {Ancestor[TableCrossAxis]:Modified Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}" · props: font_alignment="right"
          - **Text** `Text Z` (bTelx) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao}"
          - **Group** `Group K` (bTemD) — props: vertical_centering=True
            - **Text** `Text AZ` (bTemJ) — text: "Vendedor: {Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}"
- **Popup** `pop alerta geral` (bTIpV) — props: greyout_color="rgba(0,0,0,0.6)"
  - estado customizado `var_tipoalerta_` : option.opt_tipoalerta
  - estado customizado `var_qualusuario_` : User
  - **Group** `Group F` (bTIpa) — props: four_border_style=True, border_color_bottom="rgba(228, 230, 239, 1)", border_style_bottom="solid"
    - **Text** `Text M` (bTIpb) — text: "Você tem certeza?"
    - **Icon** `Icon S` (bTIpf) — props: icon="material outlined close"
  - **Text** `Text M` (bTIph) — text: "⏎Você está prestes a resetar a senha do usuário ⏎⏎Ao confirmar, o usuário será derrubado do sistema e receberá um email com uma senha temporária.⏎⏎Ao fazer login, o usuário deverá cadastrar uma nova senha.⏎⏎Deseja continuar?⏎"
    - ⟂ quando El[pop alerta geral]:custom.var_tipoalerta_:equals(option.opt_tipoalerta.resetar_senha) → text="⏎Você está prestes a resetar a senha do usuário ⏎⏎Ao confirmar, o usuário será derrubado do sistema e receberá um email com uma senha temporária.⏎⏎Ao fazer login, o usuário deverá cadastrar uma nova senha.⏎⏎Deseja continuar?⏎"
  - **Group** `Group R` (bTfSh) — props: vertical_centering=True
    - **Plugin[1680110374647x249108010620944400]/AAC** `chk envia email` (bTfSU) — props: AAH="var(--color_bTHGl_default)", AAP=0, AAR=0
    - **Text** `Text FZZ` (bTfSb) — text: "Envia credenciais por email"
  - **Group** `Group F` (bTIpl) — props: border_color_top="rgba(228, 230, 239, 1)", border_style_top="solid", four_border_style=True
    - **Button** `Button F` (bTIpm) — text: "Cancela"
    - **Button** `Button L` (bTIpn) — text: "Confirmar" · props: icon="fa fa-exclamation-triangle", vertical_centering=True, icon_size=22, button_type="label_icon", font_family="Poppins"
      - ⟂ quando This:is_hovered:or_(This:is_pressed) → background_style="bgcolor", bgcolor="rgba(217, 33, 78, 1)"
      - ⟂ quando This:isnt_clickable → bgcolor="rgba(241, 65, 108, 0.5)"
- **FloatingGroup** `ftg cabecalho` (bTIVd)
  - ⟂ quando Page.Website Home:contains("test") → bgcolor="var(--color_bTHHW_default)"
  - **Group** `gp menu` (bTIVi)
    - **Icon** `btn menu` (bTIVj) — props: icon="material outlined menu"
      - ⟂ quando El[Reusable tool.Cabecalho]:custom.var_showmenu_:is_true → icon="material outlined menu_open"
    - **Plugin[1642683387367x708220519175946200]/AAC** `Scrollbar E` (bTaij0) — props: AAD="remodela", AAE=8
    - **HTML** `Redutor Toggles` (bTcAZ) — oculto ao carregar · html(50 chars) · props: responsive_alignment="right"
  - **Image** `Image A` (bTIVn) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1709057835539x565943182404211600/megabox.png", use_aspect_ratio=True, aspect_ratio_width=1663, aspect_ratio_height=405
    - ⟂ quando Page.Website Home:contains("test") → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044200551x887996330380476000/teste%20megabox.png"
    - ⟂ quando Page.Website Home:not_contains("test") → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044223302x453225914685393860/live%20megabox.png"
  - **Group** `gp logomarcas copy` (bTIVo)
    - **Image** `Image A` (bTIVz) — props: src="{CurrentUser:cpo.Foto}"
      - ⟂ quando CurrentUser:cpo.Foto:is_empty → src="//af413fbfa1b3c2f571ab72a6adce53b3.cdn.bubble.io/f1706038028984x883453430704861400/user.png"
    - **Group** `Group A` (bTIVt)
      - **Text** `Text A` (bTIVu) — text: "{CurrentUser:cpo.NomeModelo:to_capitalized_words}"
      - **Text** `Text A` (bTIVv) — text: "{CurrentUser:cpo.QualPerfil:display:to_capitalized_words}"
    - **CustomElement** `tool.MenuConfig A` (bTgho) — USA Reusable tool.MenuConfig · props: custom_id="bTggV"
    - **Icon** `btn show historicos` (bTeAM) — props: icon="material outlined insert_comment", unique_id="rotate"
      - ⟂ quando Search(Tbl.GrupoCliFor: cpo.QualCarteira equals CurrentUser AND cpo.UltimoHistoricoData lte Page.Current Date/Time:plus_days(-15)):count:greater_or_equal_than(1) → icon="material outlined insert_comment", icon_color="var(--color_alert_default)", spin_icon=True, title_attribute="{∅}Você possui clientes sem interação com prazo maior/igual a 15 dias"

## Workflows

#### WF bTIWB — ButtonClicked em El[btn menu]
- condição: El[Reusable tool.Cabecalho]:custom.var_showmenu_:is_false
1. **SetCustomState** [bTIWv] alvo El[Reusable tool.Cabecalho] · value=True, custom_state="custom.var_showmenu_"

#### WF bTIWw — ButtonClicked em El[btn menu]
- condição: El[Reusable tool.Cabecalho]:custom.var_showmenu_:is_true
1. **SetCustomState** [bTIXB] alvo El[Reusable tool.Cabecalho] · value=False, custom_state="custom.var_showmenu_"

#### WF bTIps — ButtonClicked em El[Icon S]
1. **HideElement** [bTIpx] alvo El[pop alerta geral]

#### WF bTIpz — ButtonClicked em El[Button F]
1. **HideElement** [bTIqE] alvo El[pop alerta geral]

#### WF bTKRG — ConditionTrue
- condição: CurrentUser:cpo.Ativo:is_false
1. **LogOut** [bTKRL] 
2. **ChangePage** [bTKRM] alvo El[Página index]

#### WF bTeAp — ButtonClicked em El[btn show historicos]
- condição: El[Reusable tool.Cabecalho]:custom.var_showhistorico_:is_false
1. **SetCustomState** [bTeAv] alvo El[Reusable tool.Cabecalho] · value=True, custom_state="custom.var_showhistorico_"

#### WF bTeAw — ButtonClicked em El[btn show historicos]
- condição: El[Reusable tool.Cabecalho]:custom.var_showhistorico_:is_true
1. **SetCustomState** [bTeBB] alvo El[Reusable tool.Cabecalho] · value=False, custom_state="custom.var_showhistorico_"

#### WF bTenT — ButtonClicked em El[Icon Q]
1. **HideElement** [bTenZ] alvo El[pop historico]

#### WF bTfQL — ButtonClicked em El[Button L]
- condição: El[pop alerta geral]:custom.var_tipoalerta_:equals(option.opt_tipoalerta.resetar_senha)
- props: workflow_disabled=False
1. **SetTemporaryPassword** [bTfQQ] user=El[pop alerta geral]:custom.var_qualusuario_
2. **ChangeThing** [bTfQR] campos: cpo.PassTexto = "{ResultOfStep[bTfQQ]}" · to_change=El[pop alerta geral]:custom.var_qualusuario_
3. **SendEmail** [bTfQV] SÓ SE El[chk envia email]:get_AAI:is_true · cc="{CurrentUser:email}", to="{El[pop alerta geral]:custom.var_qualusuario_:email}", body="⏎⏎⏎[size=3]Olá [b]{El[pop alerta geral]:custom.var_qualusuario_:cpo.NomeModelo:to_capitalized_words}[/b]![/size]⏎⏎[size=3]Sua senha foi redefinida no sistema MegaBox.[/size]⏎⏎[size=3]Acesse {Page.Website Home} e faça login com as seguintes credenciais:[/size]⏎⏎[size=3][b]Email:[/b] {El[pop alerta geral]:custom.var_qualusuario_:email}[/size]⏎[size=3][b]Senha:[/b] {ResultOfStep[bTfQQ]}[/size]⏎⏎[size=3][b]Cadastre nova senha assim que entrar.[/b][/size]⏎⏎[size=3]Bem vindo ao sistema MegaBox![/size]", subject="Nova Senha", sender_name="Sistema MegaBox"
4. **HideElement** [bTfQW] alvo El[pop alerta geral]
5. **ResetGroup** [bTfQX] alvo El[pop alerta geral]
