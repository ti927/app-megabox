# Pagina: `formulariovenda` (bUEGh0)

Estados customizados: `notaentrega_` : number; `notaproduto_` : number

Resumo: 42 elementos · 23 workflows · 25 ações · 49 condicionais · 2 estados customizados
Elementos por tipo: Button 23, Group 8, Text 6, Image 2, MultiLineInput 1, RepeatingGroup 1, FloatingGroup 1

## Árvore de elementos

- **Group** `Group A` (bUEHj0) — data_source: Search(custom.tbl_postagens):first_element · props: group_type="custom.tbl_postagens", vertical_centering=True, background_image="//7ea8427accaf5ecdce05be89219a9f2c.cdn.bubble.io/f1751394819169x729310123411675600/Imagem%20do%20WhatsApp%20de%202025-07-01%20%C3%A0%28s%29%2015.33.23_e249b1b3.jpg"
  - **Group** `Group A` (bUEHX0) — props: vertical_centering=True
    - ⟂ quando El[Group A]:is_visible → is_visible=False
    - **Text** `Text A` (bUEHT0) — text: "Olá!⏎Sua opinião é muito importante para nós!" · props: font_alignment="left"
    - **Group** `Group A` (bUEHS0) — props: group_type="custom.tbl_contatos", vertical_centering=True
      - **Group** `Group A` (bUEGn0)
        - **Text** `txt2` (bUEHM0) — text: "Em uma escala de 0 a 10, qual nota você atribui para o nosso atendimento?" · props: font_alignment="left", vertical_centering=True
        - **Group** `gp nota equipe` (bUEGo0) — props: vertical_centering=True
          - **Button** `Button 0 ent` (bUEGt0) — text: "0" · props: icon="ionic outline star", vertical_centering=True, button_type="label", nonant_alignment="ab"
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(0) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(0)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 1 ent` (bUEGu0) — text: "1" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(1) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(1)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 2 ent` (bUEGv0) — text: "2" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(2) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(2)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 3 ent` (bUEGz0) — text: "3" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(3) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(3)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 4 ent` (bUEHA0) — text: "4" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(4) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(4)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 5 ent` (bUEHB0) — text: "5" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(5) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(5)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 6 ent` (bUEHF0) — text: "6" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(6) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(6)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 7 ent` (bUEGp0) — text: "7" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(7) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(7)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 8 ent` (bUEHH0) — text: "8" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(8) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(8)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 9 ent` (bUEHL0) — text: "9" · props: icon="ionic outline star", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(9) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(9)) → bgcolor="rgba(243,244,246,1)"
          - **Button** `Button 10 ent` (bUEHG0) — text: "10" · props: icon="ionic outline star", font_alignment="center", vertical_centering=True
            - ⟂ quando El[Página formulariovenda]:custom.notaentrega_:equals(10) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
            - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(10)) → bgcolor="rgba(243,244,246,1)"
      - **Text** `txt2` (bUELC0) — text: "Em uma escala de 0 a 10, qual nota você atribui para a qualidade do produto?" · props: font_alignment="left", vertical_centering=True
      - **Group** `gp nota equipe` (bUEIr0) — props: vertical_centering=True
        - **Button** `Button 0 ent 2` (bUEIx0) — text: "0" · props: icon="ionic outline star", vertical_centering=True, button_type="label", nonant_alignment="ab"
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(0) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(0)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 1 ent.2` (bUEIy0) — text: "1" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(1) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaentrega_:not_equals(1)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 2 ent.2` (bUEIz0) — text: "2" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(2) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(2)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 3 ent.2` (bUEJD0) — text: "3" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(3) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(3)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 4 ent.2` (bUEJE0) — text: "4" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(4) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(4)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 5 ent.2` (bUEJF0) — text: "5" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(5) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(5)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 6 ent.2` (bUEJJ0) — text: "6" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(6) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(6)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 7 ent.2` (bUEIt0) — text: "7" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(7) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(7)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 8 ent.2` (bUEJL0) — text: "8" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(8) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(8)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 9 ent.2` (bUEJP0) — text: "9" · props: icon="ionic outline star", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(9) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(9)) → bgcolor="rgba(243,244,246,1)"
        - **Button** `Button 10 ent.2` (bUEJK0) — text: "10" · props: icon="ionic outline star", font_alignment="center", vertical_centering=True
          - ⟂ quando El[Página formulariovenda]:custom.notaproduto_:equals(10) → font_color="var(--color_primary_contrast_default)", bgcolor="var(--color_primary_default)", border_style="none"
          - ⟂ quando This:is_hovered:and_(El[Página formulariovenda]:custom.notaproduto_:not_equals(10)) → bgcolor="rgba(243,244,246,1)"
      - **Text** `txt multiIn2` (bUEGi0) — text: "Comentários Adicionais e Sugestões" · props: font_alignment="left", vertical_centering=True
      - **Group** `Group A` (bUEHN0) — props: vertical_centering=True
        - **MultiLineInput** `ipt coments` (bUEHR0) — placeholder: "Escreva aqui" · props: mandatory=False, vertical_centering=True
          - ⟂ quando This:is_focused → border_color="#52A8EC", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=6, boxshadow_color="#52A8EC"
          - ⟂ quando This:isnt_valid → border_color="#FF0000", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=6, boxshadow_color="#FF0000"
      - **Button** `Button A` (bUEGj0) — text: "Enviar" · props: icon="fa fa-send", button_type="label"
  - **Group** `Group A` (bUEHY0) — oculto ao carregar · props: vertical_centering=True
    - **Image** `Image A` (bUEHZ0) — props: src="//7ea8427accaf5ecdce05be89219a9f2c.cdn.bubble.io/f1744311959418x431378770463250100/Logo%20Lure%20oficial.png", nonant_alignment="bb", use_aspect_ratio=True, aspect_ratio_width=3193, aspect_ratio_height=710, responsive_alignment="left"
    - **Text** `Text A` (bUEHd0) — text: "Obrigado pela atenção. Sua opinião é fundamental pra nossa melhoria.⏎" · props: font_alignment="center", nonant_alignment="bc"
  - **RepeatingGroup** `RepeatingGroup Tbl.Contatos` (bUEHe0) — oculto ao carregar · data_source: Search(custom.tbl_contatos) · props: group_type="custom.tbl_contatos", cell_min_height_css="56px"
    - **Text** `Text A` (bUEHf0) — text: ""
- **FloatingGroup** `ftg cabecalho` (bUEHk0)
  - **Image** `Image B` (bUEHl0) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1709057835539x565943182404211600/megabox.png", use_aspect_ratio=True, aspect_ratio_width=1663, aspect_ratio_height=405
    - ⟂ quando Page.Website Home:contains("test") → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044200551x887996330380476000/teste%20megabox.png"
    - ⟂ quando Page.Website Home:not_contains("test") → src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044223302x453225914685393860/live%20megabox.png"

## Workflows

#### WF bUEHq0 — ButtonClicked em El[Button A]
1. **ChangeThing** [bUEHr0] campos: cpo.CriticasSugestoes = "{El[ipt coments]:get_data}"; cpo.Respondida = True; cpo.TipoResposta = Opt.TipoPesquisa.Pós-Venda; cpo.NotaAtendimento = El[Página formulariovenda]:custom.notaentrega_; cpo.NotaProduto = El[Página formulariovenda]:custom.notaproduto_; cpo.QualVendedor = "{UrlParam("pdd" as text)}" · to_change=Search(Tbl.PesquisaRespostas):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualCliente:_id:equals(UrlParam("id" as custom.tbl_clientes):_id), constraint_type=∅}}):first_element
2. **NewThing** [bUEjf] tipo Tbl.PesquisaRespostas · SÓ SE Search(Tbl.PesquisaRespostas: cpo.QualCliente equals UrlParam("id" as custom.tbl_clientes)):first_element:_id:is_empty · campos: cpo.CriticasSugestoes = "{El[ipt coments]:get_data}"; cpo.NotaAtendimento = El[Página formulariovenda]:custom.notaentrega_; cpo.NotaProduto = El[Página formulariovenda]:custom.notaproduto_; cpo.QualCliente = UrlParam("id" as custom.tbl_clientes); cpo.Respondida = True; cpo.TipoResposta = Opt.TipoPesquisa.Pós-Venda; cpo.QualVendedor = "{UrlParam("pdd" as text)}"
3. **Plugin[1658328157117x953686184769617900]/AAT** [bUEHv0] AAF="Resposta enviada!"

#### WF bUEHw0 — ButtonClicked em El[Button 2 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEHx0] alvo El[Página formulariovenda] · value=2, custom_state="custom.notaentrega_"

#### WF bUEIB0 — ButtonClicked em El[Button 1 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIC0] alvo El[Página formulariovenda] · value=1, custom_state="custom.notaentrega_"

#### WF bUEID0 — ButtonClicked em El[Button 3 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIH0] alvo El[Página formulariovenda] · value=3, custom_state="custom.notaentrega_"

#### WF bUEII0 — ButtonClicked em El[Button 4 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIJ0] alvo El[Página formulariovenda] · value=4, custom_state="custom.notaentrega_"

#### WF bUEIN0 — ButtonClicked em El[Button 5 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIO0] alvo El[Página formulariovenda] · value=5, custom_state="custom.notaentrega_"

#### WF bUEIP0 — ButtonClicked em El[Button 7 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIT0] alvo El[Página formulariovenda] · value=7, custom_state="custom.notaentrega_"

#### WF bUEIU0 — ButtonClicked em El[Button 8 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIV0] alvo El[Página formulariovenda] · value=8, custom_state="custom.notaentrega_"

#### WF bUEIZ0 — ButtonClicked em El[Button 9 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIa0] alvo El[Página formulariovenda] · value=9, custom_state="custom.notaentrega_"

#### WF bUEIb0 — ButtonClicked em El[Button 0 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIf0] alvo El[Página formulariovenda] · value=0, custom_state="custom.notaentrega_"

#### WF bUEIg0 — ButtonClicked em El[Button 10 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIh0] alvo El[Página formulariovenda] · value=10, custom_state="custom.notaentrega_"

#### WF bUEIl0 — ButtonClicked em El[Button 6 ent]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEIm0] alvo El[Página formulariovenda] · value=6, custom_state="custom.notaentrega_"

#### WF bUEJR0 — ButtonClicked em El[Button 7 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEJW0] alvo El[Página formulariovenda] · value=7, custom_state="custom.notaproduto_"

#### WF bUEJb0 — ButtonClicked em El[Button 0 ent 2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEJd0] alvo El[Página formulariovenda] · value=0, custom_state="custom.notaproduto_"

#### WF bUEJi0 — ButtonClicked em El[Button 1 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEJn0] alvo El[Página formulariovenda] · value=1, custom_state="custom.notaproduto_"

#### WF bUEJp0 — ButtonClicked em El[Button 2 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEJu0] alvo El[Página formulariovenda] · value=2, custom_state="custom.notaproduto_"

#### WF bUEJz0 — ButtonClicked em El[Button 3 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEKB0] alvo El[Página formulariovenda] · value=3, custom_state="custom.notaproduto_"

#### WF bUEKG0 — ButtonClicked em El[Button 4 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEKL0] alvo El[Página formulariovenda] · value=4, custom_state="custom.notaproduto_"

#### WF bUEKN0 — ButtonClicked em El[Button 5 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEKS0] alvo El[Página formulariovenda] · value=5, custom_state="custom.notaproduto_"

#### WF bUEKX0 — ButtonClicked em El[Button 6 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEKZ0] alvo El[Página formulariovenda] · value=6, custom_state="custom.notaproduto_"

#### WF bUEKe0 — ButtonClicked em El[Button 10 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEKj0] alvo El[Página formulariovenda] · value=10, custom_state="custom.notaproduto_"

#### WF bUEKl0 — ButtonClicked em El[Button 8 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEKq0] alvo El[Página formulariovenda] · value=8, custom_state="custom.notaproduto_"

#### WF bUEKv0 — ButtonClicked em El[Button 9 ent.2]
- props: wf_folder="bUDjB"
1. **SetCustomState** [bUEKx0] alvo El[Página formulariovenda] · value=9, custom_state="custom.notaproduto_"
