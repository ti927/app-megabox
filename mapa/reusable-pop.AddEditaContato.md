# Reusable: `pop.AddEditaContato` (bTxnz)

Estados customizados: `var_a__oclifor_` : Opt.AçãoCliFor; `var_qualcontato_` : Tbl.ContatoCliFor

Resumo: 30 elementos · 4 workflows · 14 ações · 15 condicionais · 2 estados customizados
Elementos por tipo: Group 11, Text 6, Input 5, Button 3, Icon 1, PictureInput 1, Plugin[1609444246883x924984661248573400]/AAD 1, RadioButtons 1, Dropdown 1

## Árvore de elementos

- **Group** `Group E` (bTxpY) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **Text** `Text A` (bTxpd) — text: "Catálogo de Contatos" · props: font_alignment="center"
    - ⟂ quando El[Reusable pop.AddEditaContato]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Contato Cliente) → text="Edita contato do cliente"
    - ⟂ quando El[Reusable pop.AddEditaContato]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Contato Cliente) → text="Novo contato do cliente"
  - **Icon** `Icon A` (bTxpZ) — props: icon="material outlined close", vertical_centering=True
- **Group** `gp qual grupo clifor` (bTxrQ) — data_source: Parent · props: group_type="custom.tbl_clientes", vertical_centering=True
  - **PictureInput** `upi novocliente logo` (bTxrW) — placeholder: "" · props: src="{Parent:cpo.Foto}"
    - ⟂ quando Parent:cpo.Foto:is_empty → background_style="image", background_image="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
  - **Input** `ipt nome grupoclifor` (bTxrR) — placeholder: "" · content: "{Parent:cpo.NomeCliFor:to_uppercase}" · props: vertical_centering=True, placeholder_color="var(--color_bTHGl_default)"
- **Group** `dp dados contato` (bTxpe) — data_source: El[Reusable pop.AddEditaContato]:custom.var_qualcontato_ · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
  - **Group** `g Input` (bTxpf) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTxpj) — text: "Nome"
    - **Input** `ipt novo contato nome` (bTxpk) — placeholder: "Nome" · content: "{Parent:cpo.NomeContato:to_capitalized_words}" · props: mandatory=True
  - **Group** `g Input` (bTxqD) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Group** `Group D` (bTxqH) — data_source: Parent · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
      - **Text** `Text D` (bTxqI) — text: "Telefone" · props: vertical_centering=True
    - **Group** `Group D` (bTxqJ) — data_source: Parent · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
      - **Input** `ipt novo contato telefone` (bTxqO) — placeholder: "(99) 9 9999-9999" · content: "{Parent:cpo.Telefone}" · props: unique_id="celular"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Fixo) → placeholder="(99) 9999-9999", unique_id="{∅}Fixo"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Celular) → placeholder="(99) 9 9999-9999", unique_id="{∅}Celular"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Sac) → placeholder="9999-999-9999", unique_id="{∅}Sac"
      - **Plugin[1609444246883x924984661248573400]/AAD** `MaskInput telefone` (bTxqP) — props: AAE="ver condicional", AAF=""
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Celular) → AAE="{∅}Celular", AAF="{∅}(00) 0 0000-0000"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Fixo) → AAE="{∅}Fixo", AAF="{∅}(00) 0000-0000"
        - ⟂ quando El[tipo telefone clifor]:get_data:equals(Opt.TipoTelefone.Sac) → AAE="{∅}Sac", AAF="{∅}0000-000-0000"
      - **RadioButtons** `tipo telefone clifor` (bTxqN) — data_source: All(Opt.TipoTelefone) · props: columns=3, default=Parent:cpo.TipoTelefone, dynamic_type="option.opt_tipotelefone", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
        - ⟂ quando Parent:is_empty → default=Opt.TipoTelefone.Celular
  - **Group** `g Input` (bTxpl) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTxpp) — text: "Email"
    - **Input** `ipt novo contato email` (bTxpq) — placeholder: "nome@email.com" · content: "{Parent:cpo.Email:to_lowercase}" · content_format: "email"
  - **Group** `g Input` (bTxpr) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTxpv) — text: "Cargo / Depto"
    - **Input** `ipt novo contato cargo` (bTxpw) — placeholder: "Comprador" · content: "{Parent:cpo.Cargo:to_capitalized_words}"
  - **Group** `g Input copy 6` (bTxpx) — data_source: Parent · props: group_type="custom.tbl_contatoclifor"
    - **Text** `Text B` (bTxqB) — text: "Vinculado ao endereço:"
    - **Dropdown** `dd qual endereco` (bTxqC) — data_source: El[Reusable pop.AddEditaContato]:get_group_data:cpo.QuaisEnderecos · placeholder: "Selecione" · props: default=Parent:cpo.QualEndereço, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_uppercase}"
  - **Group** `Group C` (bTxqT) — data_source: Parent · props: group_type="custom.tbl_contatoclifor", vertical_centering=True
    - **Button** `btn gravar novo contato` (bTxqU) — text: "Gravar"
      - ⟂ quando El[Reusable pop.AddEditaContato]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Novo Contato Cliente) → is_visible=True
      - ⟂ quando El[Reusable pop.AddEditaContato]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Novo Contato Cliente) → is_visible=False
    - **Button** `btn salvar contato` (bTxqZ) — text: "Salvar"
      - ⟂ quando El[Reusable pop.AddEditaContato]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Contato Cliente) → is_visible=True
      - ⟂ quando El[Reusable pop.AddEditaContato]:custom.var_a__oclifor_:not_equals(Opt.AçãoCliFor.Edita Contato Cliente) → is_visible=False
    - **Button** `btn cancela novo contato` (bTxqV) — text: "Cancela"
      - ⟂ quando El[Reusable pop.AddEditaContato]:custom.var_a__oclifor_:equals(Opt.AçãoCliFor.Edita Contato Cliente) → text="Cancela", border_color="var(--color_bTHHJ_default)", font_color="var(--color_bTHHJ_default)", bgcolor="var(--color_bTHHF_default)", border_style="solid"

## Workflows

#### WF bTxrX — ButtonClicked em El[Icon A]
1. **SetCustomState** [bTxrb] alvo El[Reusable pop.AddEditaContato] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
2. **HideElement** [bTxrc] alvo El[Reusable pop.AddEditaContato]

#### WF bTxrd — ButtonClicked em El[btn gravar novo contato]
- props: event_color="blue"
1. **NewThing** [bTxrh] tipo Tbl.ContatoCliFor · campos: cpo.Cargo = "{El[ipt novo contato cargo]:get_data:to_lowercase}"; cpo.Email = "{El[ipt novo contato email]:get_data:to_lowercase}"; cpo.NomeContato = "{El[ipt novo contato nome]:get_data:to_lowercase}"; cpo.QualGrupoCliFor = El[Reusable pop.AddEditaContato]:get_group_data; cpo.Telefone = "{El[ipt novo contato telefone]:get_data}"; cpo.QualEndereço = El[dd qual endereco]:get_data; cpoTipoClifor = El[Reusable pop.AddEditaContato]:get_group_data:cpo.QualTipoCliFor; cpo.TipoTelefone = El[tipo telefone clifor]:get_data
2. **ChangeThing** [bTxri] campos: cpo.QuaisContatos = ResultOfStep[bTxrh] · to_change=ResultOfStep[bTxrh]:cpo.QualGrupoCliFor
3. **SetCustomState** [bTxrj] alvo El[Reusable pop.AddEditaContato] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
4. **ResetGroup** [bTxrn] alvo El[dp dados contato]
5. **HideElement** [bTxsw] alvo El[Reusable pop.AddEditaContato]

#### WF bTxro — ButtonClicked em El[btn salvar contato]
- props: event_color="orange"
1. **ChangeThing** [bTxrp] campos: cpo.Cargo = "{El[ipt novo contato cargo]:get_data:to_lowercase}"; cpo.Email = "{El[ipt novo contato email]:get_data:to_lowercase}"; cpo.NomeContato = "{El[ipt novo contato nome]:get_data:to_lowercase}"; cpo.Telefone = "{El[ipt novo contato telefone]:get_data}"; cpo.QualEndereço = El[dd qual endereco]:get_data; cpoTipoClifor = El[Reusable pop.AddEditaContato]:get_group_data:cpo.QualTipoCliFor; cpo.TipoTelefone = El[tipo telefone clifor]:get_data · to_change=Parent
2. **SetCustomState** [bTxrt] alvo El[Reusable pop.AddEditaContato] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
3. **ResetGroup** [bTxru] alvo El[dp dados contato]
4. **HideElement** [bTxsr] alvo El[Reusable pop.AddEditaContato]

#### WF bTxrv — ButtonClicked em El[btn cancela novo contato]
1. **SetCustomState** [bTxrz] alvo El[Reusable pop.AddEditaContato] · custom_state="custom.var_a__oclifor_", custom_states_values={0={value=∅, custom_state="custom.var_qualcontato_"}}
2. **ResetGroup** [bTxsA] alvo El[dp dados contato]
3. **HideElement** [bTxsp] alvo El[Reusable pop.AddEditaContato]
