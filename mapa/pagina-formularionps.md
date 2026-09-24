# Pagina: `formularionps` (bUDcp)

Estados customizados: `notaentrega_` : number; `notaproduto_` : number

Resumo: 29 elementos · 12 workflows · 13 ações · 27 condicionais · 2 estados customizados
Elementos por tipo: Button 12, Group 7, Text 5, Image 2, MultiLineInput 1, RepeatingGroup 1, FloatingGroup 1

## Árvore de elementos

- **Group** `Group A` (bUDeg) — data_source: Search(custom.tbl_postagens):first_element · props: group_type="custom.tbl_postagens", vertical_centering=True, background_image="//7ea8427accaf5ecdce05be89219a9f2c.cdn.bubble.io/f1751394819169x729310123411675600/Imagem%20do%20WhatsApp%20de%202025-07-01%20%C3%A0%28s%29%2015.33.23_e249b1b3.jpg"
  - **Group** `Group A` (bUDgH) — props: vertical_centering=True
    - ⟂ quando El[Group A]:is_visible → is_visible=False
    - **Text** `Text A` (bUDgG) — text: "Olá!⏎Sua opinião é muito importante para nós!" · props: font_alignment="left"
    - **Group** `Group A` (bUDgF) — props: group_type="custom.tbl_contatos", vertical_centering=True
      - **Group** `Group A` (bUDet)
        - **Text** `txt2` (bUDfV) — text: "Em uma escala de 0 a 10, qual nota você atribui para o nosso serviço?" · props: font_alignment="left", vertical_centering=True
        - **Group** `gp nota equipe` (bUDex) — props: vertical_centering=True
          - **Button** `Button 0 ent` (bUDez) — text: "0" · props: icon="ionic outline star", vertical_centering=True, button_type="label", nonant_alignment="ab"
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(0) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(0)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 1 ent` (bUDfD) — text: "1" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(1) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(1)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 2 ent` (bUDfE) — text: "2" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(2) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(2)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 3 ent` (bUDfF) — text: "3" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(3) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(3)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 4 ent` (bUDfJ) — text: "4" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(4) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(4)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 5 ent` (bUDfK) — text: "5" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(5) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(5)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 6 ent` (bUDfL) — text: "6" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(6) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(6)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 7 ent` (bUDey) — text: "7" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(7) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(7)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 8 ent` (bUDfQ) — text: "8" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(8) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(8)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 9 ent` (bUDfR) — text: "9" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(9) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(9)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 10 ent` (bUDfP) — text: "10" · props: icon="ionic outline star", font_alignment="center", vertical_centering=True
            - ⟂ quando El[Página formularionps]:custom.notaentrega_:equals(10) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formularionps]:custom.notaentrega_:not_equals(10)) → bgcolor="rgba(243,244,246,1)"
      - **Text** `txt multiIn2` (bUDhI) — text: "Comentários Adicionais e Sugestões" · props: font_alignment="left", vertical_centering=True
      - **Group** `Group A` (bUDfz) — props: vertical_centering=True
        - **MultiLineInput** `ipt coments` (bUDgB) — placeholder: "Escreva aqui" · props: mandatory=False, vertical_centering=True
          - ⟂ quando This:is_focused → border_color="#52A8EC", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=6, boxshadow_color="#52A8EC"
          - ⟂ quando This:isnt_valid → border_color="#FF0000", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=6, boxshadow_color="#FF0000"
      - **Button** `Button A` (bUDeh) — text: "Enviar" · props: icon="fa fa-send", button_type="label"
  - **Group** `Group A` (bUDgL) — oculto ao carregar · props: vertical_centering=True
    - **Image** `Image A` (bUDgM) — props: src="//7ea8427accaf5ecdce05be89219a9f2c.cdn.bubble.io/f1744311959418x431378770463250100/Logo%20Lure%20oficial.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=3193, aspect_ratio_height=710, responsive_alignment="left"
    - **Text** `Text A` (bUDgN) — text: "Obrigado pela atenção. Sua opinião é fundamental pra nossa melhoria.⏎" · props: font_alignment="center", nonant_alignment="bc"
  - **RepeatingGroup** `RepeatingGroup Tbl.Contatos` (bUDgR) — oculto ao carregar · data_source: Search(custom.tbl_contatos) · props: group_type="custom.tbl_contatos", cell_min_height_css="56px"
    - **Text** `Text A` (bUDgS) — text: ""
- **FloatingGroup** `ftg cabecalho` (bUDge)
  - **Image** `Image B` (bUDhD) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1709057835539x565943182404211600/megabox.png", use_aspect_ratio=True, aspect_ratio_width=1663, aspect_ratio_height=405
    - ⟂ quando Page.Website Home:contains("test") → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044200551x887996330380476000/teste%20megabox.png"
    - ⟂ quando Page.Website Home:not_contains("test") → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044223302x453225914685393860/live%20megabox.png"

## Workflows

#### WF bUDhO — ButtonClicked em El[Button A]
1. **ChangeThing** [bUDhU] campos: cpo.CriticasSugestoes = "{El[ipt coments]:get_data}"; cpo.NotaNps = El[Página formularionps]:custom.notaentrega_; cpo.Respondida = True; cpo.TipoResposta = Opt.TipoPesquisa.NPS · to_change=Search(Tbl.PesquisaRespostas: _id {'type': 'Empty'} UrlParam("id" as custom.tbl_pesquisaposvenda):_id):first_element
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUDnB] AAF="Resposta enviada!"

#### WF bUDhZ — ButtonClicked em El[Button 2 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDhf] alvo El[Página formularionps] · value=2, custom_state="custom.notaentrega_"

#### WF bUDhh — ButtonClicked em El[Button 1 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDhm] alvo El[Página formularionps] · value=1, custom_state="custom.notaentrega_"

#### WF bUDhr — ButtonClicked em El[Button 3 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDht] alvo El[Página formularionps] · value=3, custom_state="custom.notaentrega_"

#### WF bUDhy — ButtonClicked em El[Button 4 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDiD] alvo El[Página formularionps] · value=4, custom_state="custom.notaentrega_"

#### WF bUDiF — ButtonClicked em El[Button 5 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDiK] alvo El[Página formularionps] · value=5, custom_state="custom.notaentrega_"

#### WF bUDiP — ButtonClicked em El[Button 7 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDiR] alvo El[Página formularionps] · value=7, custom_state="custom.notaentrega_"

#### WF bUDid — ButtonClicked em El[Button 8 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDii] alvo El[Página formularionps] · value=8, custom_state="custom.notaentrega_"

#### WF bUDin — ButtonClicked em El[Button 9 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDip] alvo El[Página formularionps] · value=9, custom_state="custom.notaentrega_"

#### WF bUDjG — ButtonClicked em El[Button 0 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDjL] alvo El[Página formularionps] · value=0, custom_state="custom.notaentrega_"

#### WF bUDjN — ButtonClicked em El[Button 10 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDjS] alvo El[Página formularionps] · value=10, custom_state="custom.notaentrega_"

#### WF bUDjX — ButtonClicked em El[Button 6 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUDjZ] alvo El[Página formularionps] · value=6, custom_state="custom.notaentrega_"
