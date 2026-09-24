# Reusable: `tool.EnderecoFornecedor` (bThmz1)


Resumo: 6 elementos · 3 workflows · 3 ações · 1 condicionais · 0 estados customizados
Elementos por tipo: Text 2, Icon 2, GroupFocus 1, RepeatingGroup 1

## Árvore de elementos

- **GroupFocus** `GroupFocus A` (bThnB1) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, reference="bThnA1", offset_left=-575
  - **Text** `Text B` (bThnL1) — text: "Selecione o endereço do fornecedor"
  - **RepeatingGroup** `RepeatingGroup A` (bThnF1) — data_source: Parent:cpo.QualFornecedor:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", separator_style="dashed", fixed_rows=False, cell_min_height_css="45px"
    - **Icon** `Icon B` (bThnH1) — props: icon="material outlined radio_button_unchecked"
      - ⟂ quando Parent:equals(El[Reusable tool.EnderecoFornecedor]:get_group_data:cpo.QualEnderecoOrigem) → icon="material outlined radio_button_checked"
    - **Text** `Text A` (bThnG1) — text: "{Parent:cpo.NomeEndereco:to_capitalized_words} - {Parent:cpo.Bairro:to_capitalized_words} - {Parent:cpo.Municipio:to_capitalized_words} - {Parent:cpo.UF:to_uppercase} - {Parent:cpo.CnpjCpf}"
- **Icon** `btn show enderecos` (bThnA1) — props: icon="material outlined factory"

## Workflows

#### WF bThnM1 — ButtonClicked em El[Icon B]
- condição: El[Reusable tool.EnderecoFornecedor]:get_group_data:cpo.QualEnderecoOrigem:not_equals(Parent)
1. **ChangeThing** [bThnN1] campos: cpo.QualEnderecoOrigem = Parent · to_change=El[Reusable tool.EnderecoFornecedor]:get_group_data

#### WF bThnR1 — ButtonClicked em El[Icon B]
- condição: El[Reusable tool.EnderecoFornecedor]:get_group_data:cpo.QualEnderecoOrigem:equals(Parent)
1. **ChangeThing** [bThnS1] campos: cpo.QualEnderecoOrigem = ∅ · to_change=El[Reusable tool.EnderecoFornecedor]:get_group_data

#### WF bThnT1 — ButtonClicked em El[Reusable tool.EnderecoFornecedor]
1. **ToggleElement** [bThnX1] alvo El[GroupFocus A]
