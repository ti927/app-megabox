# Reusable: `pop.ConfigUsuario` (bTgyx)


Resumo: 49 elementos · 1 workflows · 1 ações · 5 condicionais · 0 estados customizados
Elementos por tipo: Group 20, Text 14, Input 9, Plugin[1609444246883x924984661248573400]/AAD 2, Dropdown 2, Icon 1, PictureInput 1

## Árvore de elementos

- **Group** `Group F` (bThBz) — data_source: Parent · props: group_type="user", vertical_centering=True
  - **Group** `Group C` (bTkUd) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput B` (bTkUX) — props: AAE="cpf", AAF="000.000.000-00"
    - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput A` (bTkUR) — props: AAE="telefone", AAF="(00) 0 0000-0000"
    - **Text** `Text C` (bThBn) — text: "Configurações do Usuário" · props: font_alignment="center"
  - **Icon** `Icon A` (bThBt) — props: icon="material outlined close", vertical_centering=True
- **Group** `Group A` (bTgyz) — data_source: Parent · props: group_type="user", vertical_centering=True
  - **Text** `Text A` (bTgzE) — text: "Dados Pessoais"
  - **Group** `Group E` (bThBa) — data_source: Parent · props: group_type="user", vertical_centering=True
    - **Group** `g PictureUploader` (bTgzR) — data_source: Parent · props: group_type="user"
      - **PictureInput** `PictureUploader A` (bTgzW) — placeholder: "" · auto_binding: True · props: src="{Parent:cpo.Foto}", bind_field="cpo_foto_image"
        - ⟂ quando This:is_focused:or_(This:is_hovered):or_(This:is_pressed) → boxshadow_color="rgba(181, 181, 195, 1)"
        - ⟂ quando Parent:cpo.Foto:is_empty → background_style="image", background_image="//21d85b5f34b72c2c9bea3d9d45458bb7.cdn.bubble.io/f1698174961133x403443266892573600/aa149071.png"
    - **Group** `g Input` (bTgzF) — data_source: Parent · props: group_type="user"
      - **Text** `Text A` (bTgzJ) — text: "Nome"
      - **Input** `Input A` (bTgzK) — placeholder: "" · auto_binding: True · props: mandatory=True, bind_field="cpo_nome_text"
    - **Group** `g Dropdown` (bTgzX) — data_source: Parent · props: group_type="user"
      - **Text** `Text A` (bTgzb) — text: "Página de início"
      - **Dropdown** `Dropdown A` (bTgzc) — data_source: All(Opt.MenuPaginas) · placeholder: "Selecione" · auto_binding: True · props: mandatory=True, bind_field="cpo_qualpaginainicial_option_opt_menu", dynamic_type="option.opt_menu", choices_style="dynamic", computed_value="text", option_display_expression="{InjectedValue:display}"
  - **Group** `g Form` (bTkTZ) — data_source: Parent · props: group_type="user"
    - **Group** `Group B` (bTkTb) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Group** `g Input` (bTkTf) — data_source: Parent · props: group_type="user"
        - **Text** `Text B` (bTkTh) — text: "CPF"
        - **Input** `ipt cpf` (bTkTg) — placeholder: "Digite" · auto_binding: True · props: unique_id="cpf", bind_field="cpo_cpf_text"
      - **Group** `g Input` (bTkTl) — data_source: Parent · props: group_type="user"
        - **Text** `Text B` (bTkTm) — text: "RG"
        - **Input** `ipt rg` (bTkTn) — placeholder: "Digite" · auto_binding: True · props: bind_field="cpo_rg_text"
    - **Group** `g Input` (bTkUK) — data_source: Parent · props: group_type="user"
      - **Text** `Text B` (bTkUL) — text: "Endereço"
      - **Input** `ipt endereco` (bTkUP) — placeholder: "Digite" · auto_binding: True · props: bind_field="cpo_endere_o_text"
    - **Group** `Group B` (bTkTr) — data_source: Parent · props: group_type="user", vertical_centering=True
      - **Group** `g Input` (bTkTs) — data_source: Parent · props: group_type="user"
        - **Text** `Text B` (bTkTt) — text: "Cidade"
        - **Input** `ipt cidade` (bTkTx) — placeholder: "Digite" · auto_binding: True · props: bind_field="cpo_cidade_text"
      - **Group** `g Input` (bTkTy) — data_source: Parent · props: group_type="user"
        - **Text** `Text B` (bTkTz) — text: "Estado"
        - **Dropdown** `ipt uf` (bTkUD) — data_source: All(Opt.UFs) · placeholder: "Selecione" · auto_binding: True · props: bind_field="cpo_uf_option_opt_ufs", dynamic_type="option.opt_ufs", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
      - **Group** `g Input` (bTkUE) — data_source: Parent · props: group_type="user"
        - **Text** `Text B` (bTkUF) — text: "Telefone"
        - **Input** `ipt telefone` (bTkUJ) — placeholder: "Digite" · auto_binding: True · props: unique_id="telefone", bind_field="cpo_telefone_text"
- **Group** `gp atutentic copy` (bThiJ) — data_source: Parent · props: group_type="user", vertical_centering=True
  - **Text** `Text F` (bThiO) — text: "Enviar E-mails"
  - **Group** `g Input copy 7` (bTjPV) — data_source: Parent · props: group_type="user"
    - **Text** `Text I` (bTjPX) — text: "Enviar cópia de [b]propostas [/b]para:"
    - **Input** `ipt smtp senha` (bTjPb) — placeholder: "Endereços de email separados por vírgula" · auto_binding: True · props: mandatory=False, bind_field="cpo_copiaocultaproposta_text"
      - ⟂ quando Parent:cpo.UsaEmailPessoal - deleted:is_true:and_(Parent:cpo.SmtpEndereco - deleted:is_empty) → border_color="var(--color_bTHHQ_default)"
  - **Group** `g Input copy 8` (bTnyX1) — data_source: Parent · props: group_type="user"
    - **Text** `Text D` (bTnyc1) — text: "Enviar cópia de [b]pedidos [/b]para:"
    - **Input** `ipt smtp senha` (bTnyd1) — placeholder: "Endereços de email separados por vírgula" · auto_binding: True · props: mandatory=False, bind_field="cpo_copiaoculta_text"
      - ⟂ quando Parent:cpo.UsaEmailPessoal - deleted:is_true:and_(Parent:cpo.SmtpEndereco - deleted:is_empty) → border_color="var(--color_bTHHQ_default)"
  - **Group** `g Input copy 9` (bTnyi1) — data_source: Parent · props: group_type="user"
    - **Text** `Text E` (bTnyn1) — text: "Enviar cópia de [b]cancelamentos [/b]para:"
    - **Input** `ipt smtp senha` (bTnyo1) — placeholder: "Endereços de email separados por vírgula" · auto_binding: True · props: mandatory=False, bind_field="cpo_copiaocultacancelamentos_text"
      - ⟂ quando Parent:cpo.UsaEmailPessoal - deleted:is_true:and_(Parent:cpo.SmtpEndereco - deleted:is_empty) → border_color="var(--color_bTHHQ_default)"

## Workflows

#### WF bThCK — ButtonClicked em El[Icon A]
1. **HideElement** [bThCQ] alvo El[Reusable pop.ConfigUsuario]
