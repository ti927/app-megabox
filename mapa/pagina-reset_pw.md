# Pagina: `reset_pw` (AAL)


Resumo: 12 elementos · 0 workflows · 0 ações · 4 condicionais · 0 estados customizados
Elementos por tipo: Group 6, Text 3, Input 2, Button 1

## Árvore de elementos

- **Group** `Group Reset Password` (bTGyM0)
  - **Text** `Text Header` (bTGyx0) — text: "Reset your password" · props: font_alignment="center"
  - **Group** `Group Container` (bTGyQ0)
    - **Group** `Card Reset Password` (bTGyf0)
      - **Group** `Group Content` (bTGyg0)
        - **Group** `Group Password` (bTGyn0)
          - **Text** `Text B` (bTGyo0) — text: "New password"
          - **Input** `Input B` (bTGyp0) — placeholder: "********" · content_format: "password" · props: mandatory=True, not_submit_on_enter=True
            - ⟂ quando This:is_focused → border_color="#52A8EC", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2, boxshadow_color="#52A8EC"
            - ⟂ quando This:isnt_valid → border_color="#FF0000", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2, boxshadow_color="#FF0000"
        - **Group** `Group Confirm Password` (bTGyh0)
          - **Text** `Text B` (bTGyi0) — text: "Confirm new password"
          - **Input** `Input B` (bTGyj0) — placeholder: "********" · content_format: "password" · props: mandatory=True, not_submit_on_enter=True
            - ⟂ quando This:is_focused → border_color="#52A8EC", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2, boxshadow_color="#52A8EC"
            - ⟂ quando This:isnt_valid → border_color="#FF0000", boxshadow_horizontal=0, boxshadow_style="outset", boxshadow_vertical=0, boxshadow_blur=2, boxshadow_color="#FF0000"
      - **Button** `Button B` (bTGyw0) — text: "Confirm"

## Workflows
