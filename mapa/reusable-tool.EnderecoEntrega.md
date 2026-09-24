# Reusable: `tool.EnderecoEntrega` (bTbjh)


Resumo: 6 elementos · 3 workflows · 3 ações · 2 condicionais · 0 estados customizados
Elementos por tipo: Text 2, GroupFocus 1, RepeatingGroup 1, Icon 1, HTML 1

## Árvore de elementos

- **GroupFocus** `GroupFocus A` (bTbjn) — data_source: Parent · props: group_type="custom.tbl_orcamentfornecedores", vertical_centering=True, reference="bTbjj", offset_left=-575
  - **Text** `Text B` (bTbju) — text: "Selecione o endereço de entrega"
  - **RepeatingGroup** `RepeatingGroup A` (bTbjo) — data_source: Parent:cpo.QualCotacao:cpo.QualCliente:cpo.QuaisEnderecos · props: group_type="custom.tbl_enderecosclifor", separator_style="dashed", fixed_rows=False, cell_min_height_css="45px"
    - **Icon** `Icon A` (bTbjt) — props: icon="material outlined radio_button_unchecked"
      - ⟂ quando Parent:equals(El[Reusable tool.EnderecoEntrega]:get_group_data:cpo.QualEnderecoDestino) → icon="material outlined radio_button_checked"
    - **Text** `Text A` (bTbjp) — text: "{Parent:cpo.NomeEndereco:to_capitalized_words} - {Parent:cpo.Bairro:to_capitalized_words} - {Parent:cpo.Municipio:to_capitalized_words} - {Parent:cpo.UF:to_uppercase} - {Parent:cpo.CnpjCpf}"
- **HTML** `btn show enderecos` (bTbjj) — html(526 chars)
  - ⟂ quando Parent:cpo.QualEnderecoDestino:is_not_empty → html="<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#108f66"><path d="M480-326q103-72 149.5-142.5T676-610q0-85.63-54.83-140.82-54.84-55.18-141-55.18Q394-806 339-750.82 284-695.63 284-610q0 72 46.5 142T480-326Zm0 133Q323-296 250.5-399T178-610q0-133 84.5-217.5T480-912q133 0 217.5 84.5T782-610q0 108-72.5 211T480-193Zm0-328q38 0 64-26.14 26-26.15 26-62.86 0-37.54-26-64.27Q518-701 480-701t-64 26.62q-26 26.62-26 64Q390-573 416-547t64 26ZM168-48v-105h624v105H168Zm312-562Z"/></svg>", icon_color="var(--color_bTHHX_default)"

## Workflows

#### WF bTbjv — ButtonClicked em El[Icon A]
- condição: El[Reusable tool.EnderecoEntrega]:get_group_data:cpo.QualEnderecoDestino:not_equals(Parent)
1. **ChangeThing** [bTbjz] campos: cpo.QualEnderecoDestino = Parent · to_change=El[Reusable tool.EnderecoEntrega]:get_group_data

#### WF bTbkA — ButtonClicked em El[Icon A]
- condição: El[Reusable tool.EnderecoEntrega]:get_group_data:cpo.QualEnderecoDestino:equals(Parent)
1. **ChangeThing** [bTbkB] campos: cpo.QualEnderecoDestino = ∅ · to_change=El[Reusable tool.EnderecoEntrega]:get_group_data

#### WF bTbkF — ButtonClicked em El[Reusable tool.EnderecoEntrega]
1. **ToggleElement** [bTbkG] alvo El[GroupFocus A]
