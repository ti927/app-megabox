# Pagina: `index` (bTGYf)


Resumo: 27 elementos · 5 workflows · 7 ações · 12 condicionais · 0 estados customizados
Elementos por tipo: Group 10, Text 9, Input 2, CustomElement 1, Image 1, Plugin[1680110374647x249108010620944400]/AAC 1, Button 1, Plugin[1617739938396x841575603972341800]/ACX 1, Link 1

## Árvore de elementos

- **CustomElement** `pop.RespostasEmails A` (bUCAY) — USA Reusable pop.RespostasEmails · props: floating_reference="top", custom_id="bUBss", floating_reference_horizontal="none", floating_reference_horizontal_resp="left"
- **Group** `gp elments` (bTGyP) — props: group_type="text"
  - **Group** `Group Header` (bTGyR)
    - **Image** `Image A` (bTGyW) — props: src="//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1709057904861x528566418642194300/megabox.png", use_aspect_ratio=True, aspect_ratio_width=399, aspect_ratio_height=97
      - ⟂ quando Page.Website Home:contains("test") → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044200551x887996330380476000/teste%20megabox.png?_gl=1*50dw6g*_gcl_au*ODY3MzMzMDMzLjE3MjQ1MTAzNjE.*_ga*MTE3OTQzMTU2Ni4xNzI0NTEwMzYx*_ga_BFPVR2DEE2*MTcyODAzOTI0NC4yOS4xLjE3MjgwNDQyODAuMzcuMC4w"
      - ⟂ quando Page.Website Home:not_contains("test") → src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1728044223302x453225914685393860/live%20megabox.png?_gl=1*138lntk*_gcl_au*ODY3MzMzMDMzLjE3MjQ1MTAzNjE.*_ga*MTE3OTQzMTU2Ni4xNzI0NTEwMzYx*_ga_BFPVR2DEE2*MTcyODAzOTI0NC4yOS4xLjE3MjgwNDQyOTguMTkuMC4w"
  - **Group** `Card Log In` (bTIQx)
    - ⟂ quando Page.Website Home:contains("test") → is_visible=False
    - ⟂ quando Page.Website Home:not_contains("test") → is_visible=True
    - **Group** `Group E` (bTfRR) — props: vertical_centering=True
      - **Plugin[1680110374647x249108010620944400]/AAC** `chk admin` (bTfRF) — props: AAH="var(--color_bTHGl_default)", AAP=0, AAR=0
      - **Text** `Text F` (bTfRL) — text: "Administrador"
    - **Group** `Gp login mestre` (bTIRB) — oculto ao carregar
      - ⟂ quando El[chk admin]:get_AAI:is_true → is_visible=True
      - ⟂ quando El[chk admin]:get_AAI:is_false → is_visible=False
      - **Group** `Group Email` (bTIRC)
        - **Text** `Text A` (bTIRD) — text: "Email"
        - **Input** `email login mestre` (bTIRH) — placeholder: "usuario@email.com" · content_format: "email"
      - **Group** `Group Password` (bTIRI)
        - **Text** `Text A` (bTIRJ) — text: "Senha"
        - **Input** `senha login mestre` (bTIRT) — placeholder: "********" · content_format: "password" · props: mandatory=True, not_submit_on_enter=True
        - **Group** `Group Checkbox and Link` (bTIRN)
    - **Text** `Text G` (bThhN0) — text: "Bem-vindo de volta {El[LocalStorage A]:get_ACV:first_element:to_uppercase}!" · props: font_alignment="center"
      - ⟂ quando El[chk admin]:get_AAI:is_true → is_visible=False
      - ⟂ quando El[chk admin]:get_AAI:is_false → is_visible=True
    - **Text** `Text E` (bThhe) — oculto ao carregar · text: "{El[LocalStorage A]:get_ACV:first_element}⏎{El[LocalStorage A]:get_ACV:specific_item(2)}⏎{El[LocalStorage A]:get_ACV:specific_item(3)}" · props: font_alignment="center"
    - **Group** `Group Buttons` (bTIRU)
      - **Button** `btn login` (bTfQv) — text: "ENTRAR"
        - ⟂ quando Page.Website Home:contains("test") → text="Entrar (Testes)"
        - ⟂ quando Page.Website Home:not_contains("test") → text="Entrar (Live)"
    - **Text** `Text C` (bTfND) — oculto ao carregar · text: "{Page.Current Date/Time:format_date(formatting_type="custom", custom_format="dd/mm/yy  - HH:MM")}"
    - **Plugin[1617739938396x841575603972341800]/ACX** `LocalStorage A` (bTfQD)
  - **Group** `Group B` (bTePR) — props: vertical_centering=True
    - ⟂ quando Page.Website Home:contains("test") → is_visible=True
    - ⟂ quando Page.Website Home:not_contains("test") → is_visible=False
    - **Text** `Text B` (bTeOz) — text: "Você está acessando a versão de testes do sistema Megabox. Essa versão contém dados desatualizados e instabilidade." · props: font_alignment="center"
    - **Link** `Link A` (bTePF) — text: "Clique [b][color=#0000ff]AQUI[/color][/b] para acessar a versão Live" · props: linktype="url", url="https://grupomegabox.bubbleapps.io/"
    - **Text** `Text D` (bTePL) — text: "Quero acessar a [color=#0000ff][b]VERSÃO DE TESTES[/b][/color]."
  - **Text** `Text H` (bTvDh0) — text: "{∅}"

## Workflows

#### WF bTePd — ButtonClicked em El[Text D]
1. **ShowElement** [bTePj] alvo El[Card Log In]

#### WF bTePk — ButtonClicked em El[Link A]

#### WF bTfNP — PageLoaded
1. **Plugin[1617739938396x841575603972341800]/ABX** [bTfQJ] alvo El[LocalStorage A] · ABY="nome|email|senha"

#### WF bTfRZ — ButtonClicked em El[btn login]
- condição: El[chk admin]:get_AAI:is_true
1. **LogIn** [bTfRf] email=El[email login mestre]:get_data, password=El[senha login mestre]:get_data, remember_email=False, stay_logged_in=False
2. **ChangePage** [bTfRj] alvo El[Página vendas]

#### WF bTfRk — ButtonClicked em El[btn login]
- condição: El[chk admin]:get_AAI:is_false
1. **LogOut** [bThmc] 
2. **LogIn** [bTfRp] email=El[LocalStorage A]:get_ACV:specific_item(2), password=El[LocalStorage A]:get_ACV:specific_item(3), remember_email=False, stay_logged_in=False
3. **ChangePage** [bTfRq] alvo El[Página vendas]
