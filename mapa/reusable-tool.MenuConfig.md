# Reusable: `tool.MenuConfig` (bTggV)


Resumo: 17 elementos · 7 workflows · 14 ações · 4 condicionais · 0 estados customizados
Elementos por tipo: CustomElement 6, Icon 2, TableCrossAxis 2, TableCell 2, Group 1, GroupFocus 1, Table 1, Text 1, TableMainAxis 1

## Árvore de elementos

- **CustomElement** `pop.ConfigSistema A` (bToKJ0) — USA Reusable pop.ConfigSistema · props: custom_id="bToDT0"
- **CustomElement** `pop.CadastroCliFor A` (bTjxk) — USA Reusable pop.CadastroCliFor · props: custom_id="bTgrH"
- **Group** `Group A` (bTghu) — props: vertical_centering=True
  - **Icon** `Icon A` (bTgga) — props: icon="material outlined settings"
  - **Icon** `Icon B` (bTggg) — props: icon="material outlined arrow_drop_down"
- **CustomElement** `pop.CadastroUsuarios A` (bTgoG) — USA Reusable pop.CadastroUsuarios · props: custom_id="bTgiN"
- **CustomElement** `pop.CadastroProdutos A` (bTghX) — USA Reusable pop.CadastroProdutos · props: custom_id="bTgZS"
- **CustomElement** `pop.CadastroClienteFornecedor A` (bTgyf) — USA Reusable pop.CadastroCliFor · props: custom_id="bTgrH"
- **CustomElement** `pop.MinhasConfigs A` (bThAv) — USA Reusable pop.ConfigUsuario · props: custom_id="bTgyx"
- **GroupFocus** `GroupFocus A` (bTggm) — props: vertical_centering=True, reference="bTggg", offset_top=10, offset_left=-250
  - **Table** `rpg categorias` (bTggy) — data_source: All(Opt.MenuConfig):sorted(descending=False, sort_field="ordem") · props: group_type="option.opt_submenu", unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
    - **TableCrossAxis** `TableCrossAxis A` (bTghD) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bTghE) — props: cell_main_axis_id="bTghL"
        - **Text** `btn submenu` (bTghF) — text: "{Ancestor[TableCrossAxis]:display}" · props: button_disabled=True
          - ⟂ quando This:is_hovered → font_size=18
          - ⟂ quando Search(Tbl.ConfigSistema: cpo.QualMenuConfig equals Ancestor[TableCrossAxis]):first_element:cpo.QuaisDeptos:contains(CurrentUser:cpo.QualDepto) → font_color="var(--color_primary_default)", button_disabled=False
          - ⟂ quando Search(Tbl.ConfigSistema: cpo.QualMenuConfig equals Ancestor[TableCrossAxis]):first_element:cpo.QuaisPerfis:contains(CurrentUser:cpo.QualPerfil) → font_color="var(--color_primary_default)", button_disabled=False
          - ⟂ quando Search(Tbl.ConfigSistema: cpo.QualMenuConfig equals Ancestor[TableCrossAxis]):first_element:cpo.QuaisUsuarios:contains(CurrentUser) → font_color="var(--color_primary_default)", button_disabled=False
    - **TableCrossAxis** `TableCrossAxis A` (bTghJ) — oculto ao carregar · props: axis_index=0
      - **TableCell** `Cell A` (bTghK) — props: cell_main_axis_id="bTghL"
    - **TableMainAxis** `TableMainAxis A` (bTghL) — props: axis_index=0

## Workflows

#### WF bTghQ — ButtonClicked em El[btn submenu]
- condição: Ancestor[TableCrossAxis]:equals(Opt.MenuConfig.Cadastro Produtos)
1. **ShowElement** [bTghd] alvo El[pop.CadastroProdutos A]
2. **HideElement** [bTghh] alvo El[GroupFocus A]

#### WF bTgiF — ButtonClicked em El[Group A]
1. **ToggleElement** [bTgiM] alvo El[GroupFocus A]

#### WF bTgqz — ButtonClicked em El[btn submenu]
- condição: Ancestor[TableCrossAxis]:equals(Opt.MenuConfig.Cadastro Usuários)
1. **ShowElement** [bTgrB] alvo El[pop.CadastroUsuarios A]
2. **HideElement** [bTgrF] alvo El[GroupFocus A]

#### WF bTgyl — ButtonClicked em El[btn submenu]
- condição: Ancestor[TableCrossAxis]:equals(Opt.MenuConfig.Cliente / Fornecedor)
1. **HideElement** [bTgyr] alvo El[GroupFocus A]
2. **ChangePage** [bTxxz] alvo El[Página cadastros] · open_in_new_tab=True

#### WF bThCh — ButtonClicked em El[btn submenu]
- condição: Ancestor[TableCrossAxis]:equals(Opt.MenuConfig.Configurações de Usuário)
1. **DisplayGroupData** [bThCp] alvo El[pop.MinhasConfigs A] · data_source=CurrentUser
2. **ShowElement** [bThCj] alvo El[pop.MinhasConfigs A]
3. **HideElement** [bThCn] alvo El[GroupFocus A]

#### WF bTvIg — ButtonClicked em El[btn submenu]
- condição: Ancestor[TableCrossAxis]:equals(Opt.MenuConfig.FollowUp de Pedidos)
1. **HideElement** [bTvIm] alvo El[GroupFocus A]
2. **ChangePage** [bTvIr] alvo El[Página historico] · open_in_new_tab=True

#### WF bToKP0 — ButtonClicked em El[btn submenu]
- condição: Ancestor[TableCrossAxis]:equals(Opt.MenuConfig.Configurações de Sistema)
1. **ShowElement** [bToKV0] alvo El[pop.ConfigSistema A]
2. **HideElement** [bToKW0] alvo El[GroupFocus A]
