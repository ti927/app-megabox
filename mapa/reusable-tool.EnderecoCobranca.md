# Reusable: `tool.EnderecoCobranca` (bTbWm)


Resumo: 6 elementos · 3 workflows · 3 ações · 2 condicionais · 0 estados customizados
Elementos por tipo: Text 2, GroupFocus 1, RepeatingGroup 1, Icon 1, HTML 1

## Árvore de elementos

- **GroupFocus** `GroupFocus A` (bTbXD) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, reference="bTbWr", offset_left=-575
  - **Text** `Text B` (bTbYd) — text: "Selecione o CNPJ / Endereço a faturar"
  - **RepeatingGroup** `RepeatingGroup A` (bTbXJ) — data_source: Parent:cpo.QualCotacao:cpo.QualCliente:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", separator_style="dashed", fixed_rows=False, cell_min_height_css="45px"
    - **Icon** `Icon A` (bTbXV) — props: icon="material outlined radio_button_unchecked"
      - ⟂ quando Parent:equals(El[Reusable tool.EnderecoCobranca]:get_group_data:cpo.QualEndereçoCobrança) → icon="material outlined radio_button_checked"
    - **Text** `Text A` (bTbXP) — text: "{Parent:cpo.NomeEndereco:to_capitalized_words} - {Parent:cpo.Bairro:to_capitalized_words} - {Parent:cpo.Municipio:to_capitalized_words} - {Parent:cpo.UF:to_uppercase} - {Parent:cpo.CnpjCpf}"
- **HTML** `btn show enderecos` (bTbWr) — html(537 chars)
  - ⟂ quando Parent:cpo.QualEndereçoCobrança:is_not_empty → html="<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#108f66"><path d="M220.78-392.22h374.39l94.18-94.17H220.78v94.17Zm0-145.37h265.46v-94.17H220.78v94.17Zm-61.76-165.93v384.82h362.63L416.48-213.52H53.85V-808.7H894.3v222.77H789.13v-117.59H159.02ZM918.2-457.95q6.1 6.35 6.1 14.64 0 8.29-6.67 15.18l-31.8 33.28-91.31-91.06 32.05-33.29q6.9-6.67 15.44-6.67 8.55 0 15.45 6.67l60.74 61.25ZM514.24-114.57v-91.19L772.57-464.2l91.54 91.07-258.44 258.56h-91.43ZM159.02-703.52V-318.7v-384.82Z"/></svg>", icon_color="var(--color_bTHHX_default)"

## Workflows

#### WF bTbXb — ButtonClicked em El[Icon A]
- condição: El[Reusable tool.EnderecoCobranca]:get_group_data:cpo.QualEndereçoCobrança:not_equals(Parent)
1. **ChangeThing** [bTbXh] campos: cpo.QualEndereçoCobrança = Parent · to_change=El[Reusable tool.EnderecoCobranca]:get_group_data

#### WF bTbXi — ButtonClicked em El[Icon A]
- condição: El[Reusable tool.EnderecoCobranca]:get_group_data:cpo.QualEndereçoCobrança:equals(Parent)
1. **ChangeThing** [bTbXn] campos: cpo.QualEndereçoCobrança = ∅ · to_change=El[Reusable tool.EnderecoCobranca]:get_group_data

#### WF bTbXp — ButtonClicked em El[Reusable tool.EnderecoCobranca]
1. **ToggleElement** [bTbXz] alvo El[GroupFocus A]
