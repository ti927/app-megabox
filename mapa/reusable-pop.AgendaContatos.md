# Reusable: `pop.AgendaContatos` (bTPQa0)

Estados customizados: `var_a__oclifor_` : Opt.AçãoCliFor; `var_qualcontato_` : Tbl.ContatoCliFor

Resumo: 52 elementos · 6 workflows · 13 ações · 20 condicionais · 2 estados customizados
Elementos por tipo: Group 11, Text 10, TableCell 8, Input 5, TableMainAxis 4, Icon 3, Button 3, TableCrossAxis 2, PictureInput 1, Plugin[1609444246883x924984661248573400]/AAD 1, RadioButtons 1, Dropdown 1, Table 1, Plugin[1680110374647x249108010620944400]/AAC 1

## Árvore de elementos

- **Group** `Group E` (bTeJk) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **Text** `Text A` (bTPTl0) — text: "Catálogo de Contatos" · props: font_alignment="center"
    - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Contato Cliente) → text="Edita contato do cliente"
    - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Contato Cliente) → text="Novo contato do cliente"
  - **Icon** `Icon A` (bTeJM) — props: icon="material outlined close", vertical_centering=True
- **Group** `gp qual grupo clifor` (bTPTr0) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **PictureInput** `upi novocliente logo` (bTPTx0) — placeholder: "" · props: src="{Parent:cpo.Foto}"
    - ⟂ quando Parent:cpo.Foto:is_empty → background_style="image", background_image="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
  - **Input** `ipt nome grupoclifor` (bTPTt0) — placeholder: "" · content: "{Parent:cpo.NomeCliFor:to_uppercase}" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
  - **Icon** `btn novo contato cliente` (bTPSw0) — props: icon="material outlined add_ic_call"
    - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:is_empty → is_visible=True
    - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:is_not_empty → is_visible=False
- **Group** `dp dados contato` (bTPQs0) — data_source: El[Reusable pop.AgendaContatos]:custom.var_qualcontato_ · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
  - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:is_empty → is_visible=False
  - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:is_not_empty → is_visible=True
  - **Group** `g Input` (bTPQx0) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTPQy0) — text: "Nome"
    - **Input** `ipt novo contato nome` (bTPQz0) — placeholder: "Nome" · content: "{Parent:cpo.NomeContato:to_capitalized_words}" · props: mandatory=True
  - **Group** `g Input` (bTeID) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Group** `Group D` (bTeIF) — data_source: Parent · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
      - **Text** `Text D` (bTeIJ) — text: "Telefone" · props: vertical_centering=True
    - **Group** `Group D` (bTeIK) — data_source: Parent · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
      - **Input** `ipt novo contato telefone` (bTeIP) — placeholder: "(99) 9 9999-9999" · content: "{Parent:cpo.Telefone}"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Fixo) → placeholder="(99) 9999-9999", unique_id="{∅}Fixo"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Celular) → placeholder="(99) 9 9999-9999", unique_id="{∅}Celular"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Sac) → placeholder="9999-999-9999", unique_id="{∅}Sac"
      - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput telefone` (bTeIR) — props: AAE="ver condicional", AAF=""
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Celular) → AAE="{∅}Celular", AAF="{∅}(00) 0 0000-0000"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Fixo) → AAE="{∅}Fixo", AAF="{∅}(00) 0000-0000"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Sac) → AAE="{∅}Sac", AAF="{∅}0000-000-0000"
      - **RadioButtons** `tipo telefone clifor` (bTeIL) — data_source: All(Opt.TipoTelefone) · props: columns=3, default=Parent:cpo.TipoTelefone, dynamic_type="option.opt_tipotelefone", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
  - **Group** `g Input` (bTPRL0) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTPRP0) — text: "Email"
    - **Input** `ipt novo contato email` (bTPRQ0) — placeholder: "nome@email.com" · content: "{Parent:cpo.Email:to_lowercase}" · content_format: "email"
  - **Group** `g Input` (bTPRR0) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTPRV0) — text: "Cargo / Depto"
    - **Input** `ipt novo contato cargo` (bTPRW0) — placeholder: "Comprador" · content: "{Parent:cpo.Cargo:to_capitalized_words}"
  - **Group** `g Input copy 6` (bTPRc0) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTPRd0) — text: "Vinculado ao endereço:"
    - **Dropdown** `dd qual endereco` (bTPRh0) — data_source: El[Reusable pop.AgendaContatos]:get_group_data:cpo.QuaisEnderecos · placeholder: "Selecione" · props: default=Parent:cpo.QualEndereço, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase}"
  - **Group** `Group C` (bTPTz0) — data_source: Parent · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
    - **Button** `btn gravar novo contato` (bTPRX0) — text: "Gravar"
      - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Contato Cliente) → is_visible=True
      - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Novo Contato Cliente) → is_visible=False
    - **Button** `btn salvar contato` (bTPUK0) — text: "Salvar"
      - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Contato Cliente) → is_visible=True
      - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Edita Contato Cliente) → is_visible=False
    - **Button** `btn cancela novo contato` (bTPRb0) — text: "Cancela"
      - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Contato Cliente) → text="Cancela", border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)", border_style="solid"
- **Table** `rpg contatos clifor` (bTPSX0) — data_source: Parent:cpo.QuaisContatos:filtered(ignore_empty_constraints=True) · props: group_type="custom.tbl_contatoclifor", vertical_centering=True, vertical_separator_style="none", horizontal_separator_color="var(--color_bTHGl_default)"
  - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:is_empty → is_visible=True
  - ⟂ quando El[Reusable pop.AgendaContatos]:custom.var_a__oclifor_:is_not_empty → is_visible=False
  - **TableCrossAxis** `TableCrossAxis A` (bTPSZ0) — props: axis_index=1, cross_axis_repeat=True
    - **TableCell** `Cell A` (bTPSd0) — props: cell_main_axis_id="bTPTH0"
      - **Icon** `btn edita contato cliente` (bTPSe0) — props: icon="material outlined edit"
      - **Plugin[1680110374647x249108010620944400]/AAC** `Switch A` (bTeir0) — auto_binding: True · props: AAD=Ancestor[TableCrossAxis]:cpo.Ativo, AAH="var(--color_bTHGl_default)", AAP=0, AAR=0, bind_field="cpo_ativo_boolean"
    - **TableCell** `Cell A` (bTPSf0) — props: cell_main_axis_id="bTPTI0"
      - **Text** `Text C` (bTPSj0) — text: "{Ancestor[TableCrossAxis]:cpo.Telefone:to_capitalized_words}"
    - **TableCell** `Cell A` (bTPSk0) — props: cell_main_axis_id="bTPTJ0"
      - **Text** `Text C` (bTPSl0) — text: "{Ancestor[TableCrossAxis]:cpo.NomeContato:to_capitalized_words}⏎[size=1]{Ancestor[TableCrossAxis]:cpo.Cargo:to_capitalized_words}[/size]"
    - **TableCell** `Cell A` (bTPSp0) — props: cell_main_axis_id="bTPTN0"
      - **Text** `Text C` (bTPSq0) — text: "{Ancestor[TableCrossAxis]:cpo.Email:to_lowercase}"
  - **TableCrossAxis** `TableCrossAxis A` (bTPSr0) — props: axis_index=0
    - **TableCell** `Cell A` (bTPSv0) — props: cell_main_axis_id="bTPTH0"
    - **TableCell** `Cell A` (bTPSx0) — props: cell_main_axis_id="bTPTI0"
    - **TableCell** `Cell A` (bTPTB0) — props: cell_main_axis_id="bTPTJ0"
      - **Text** `Text C` (bTPTC0) — text: "Contatos do cliente"
    - **TableCell** `Cell A` (bTPTD0) — props: cell_main_axis_id="bTPTN0"
  - **TableMainAxis** `TableMainAxis A` (bTPTH0) — props: axis_index=4
  - **TableMainAxis** `TableMainAxis A` (bTPTI0) — props: axis_index=1
  - **TableMainAxis** `TableMainAxis A` (bTPTJ0) — props: axis_index=0
  - **TableMainAxis** `TableMainAxis A` (bTPTN0) — props: axis_index=2

## Workflows

#### WF bTeJv — ButtonClicked em El[Icon A]
1. **SetCustomState** [bTeKB] alvo El[Reusable pop.AgendaContatos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
2. **HideElement** [bTeKC] alvo El[Reusable pop.AgendaContatos]

#### WF bTPRj0 — ButtonClicked em El[btn gravar novo contato]
- props: event_color="blue"
1. **NewThing** [bTPRo0] tipo Tbl.ContatoCliFor · campos: cpo.Cargo = "{El[ipt novo contato cargo]:get_data:to_lowercase}"; cpo.Email = "{El[ipt novo contato email]:get_data:to_lowercase}"; cpo.NomeContato = "{El[ipt novo contato nome]:get_data:to_lowercase}"; cpo.QualGrupoCliFor = El[Reusable pop.AgendaContatos]:get_group_data; cpo.Telefone = "{El[ipt novo contato telefone]:get_data}"; cpo.QualEndereço = El[dd qual endereco]:get_data; cpoTipoClifor = El[Reusable pop.AgendaContatos]:get_group_data:cpo.QualTipoCliFor; cpo.TipoTelefone = El[tipo telefone clifor]:get_data
2. **ChangeThing** [bTPRu0] campos: cpo.QuaisContatos = ResultOfStep[bTPRo0] · to_change=ResultOfStep[bTPRo0]:cpo.QualGrupoCliFor
3. **SetCustomState** [bTPUu0] alvo El[Reusable pop.AgendaContatos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
4. **ResetGroup** [bTPUo0] alvo El[dp dados contato]

#### WF bTPRz0 — ButtonClicked em El[btn salvar contato]
- props: event_color="orange"
1. **ChangeThing** [bTPSB0] campos: cpo.Cargo = "{El[ipt novo contato cargo]:get_data:to_lowercase}"; cpo.Email = "{El[ipt novo contato email]:get_data:to_lowercase}"; cpo.NomeContato = "{El[ipt novo contato nome]:get_data:to_lowercase}"; cpo.Telefone = "{El[ipt novo contato telefone]:get_data}"; cpo.QualEndereço = El[dd qual endereco]:get_data; cpoTipoClifor = El[Reusable pop.AgendaContatos]:get_group_data:cpo.QualTipoCliFor; cpo.TipoTelefone = El[tipo telefone clifor]:get_data · to_change=Parent
2. **SetCustomState** [bTPSG0] alvo El[Reusable pop.AgendaContatos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
3. **ResetGroup** [bTPUQ0] alvo El[dp dados contato]

#### WF bTPSL0 — ButtonClicked em El[btn cancela novo contato]
1. **SetCustomState** [bTPSN0] alvo El[Reusable pop.AgendaContatos] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
2. **ResetGroup** [bTPUz0] alvo El[dp dados contato]

#### WF bTPTP0 — ButtonClicked em El[btn edita contato cliente]
1. **SetCustomState** [bTPTU0] alvo El[Reusable pop.AgendaContatos] · value=Opt.AçãoCliFor.Edita Contato Cliente, custom_state="custom.var_a__oclifor_", custom_states_values={0={value=Ancestor[TableCrossAxis], custom_state="custom.var_qualcontato_"}}

#### WF bTPTa0 — ButtonClicked em El[btn novo contato cliente]
1. **SetCustomState** [bTPTf0] alvo El[Reusable pop.AgendaContatos] · value=Opt.AçãoCliFor.Novo Contato Cliente, custom_state="custom.var_a__oclifor_"
