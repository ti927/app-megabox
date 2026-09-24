# Reusable: `tool.Historico` (bTdrv)

Estados customizados: `id_clifor_` : Tbl.GrupoCliFor; `var_modeloemail_` : text; `var_tabhistorico_` : number

Resumo: 262 elementos · 38 workflows · 61 ações · 73 condicionais · 3 estados customizados
Elementos por tipo: Group 82, Text 61, Icon 33, TableCell 24, TableMainAxis 12, TableCrossAxis 12, Dropdown 8, Table 6, Image 6, Button 5, MultiLineInput 4, AutocompleteDropdown 3, Checkbox 2, RadioButtons 2, Input 2

## Árvore de elementos

- **Group** `Group ZZ` (bUEhj0) — props: vertical_centering=True
  - ⟂ quando Page.Current Page Name:equals("vendas") → is_visible=False
  - **Group** `Group CZ` (bUEVV) — props: vertical_centering=True
    - **Button** `Button B` (bUEVJ) — text: "Histórico" · props: icon="material outlined star_border", font_alignment="center", font_family="var(--font_default)", four_border_style=True, border_color_bottom="var(--color_bTHGl_default)", border_style_bottom="solid", border_roundness_left=0, border_roundness_right=0
      - ⟂ quando This:is_hovered → font_color="var(--color_primary_default)", border_color_bottom="var(--color_primary_default)", border_width_bottom=5
      - ⟂ quando El[Group Historico]:is_visible → font_color="var(--color_primary_default)", button_disabled=True, border_color_bottom="var(--color_primary_default)", border_width_bottom=5
    - **Button** `Button Email` (bUEVP) — text: "Emails" · props: icon="material outlined star_border", border_color_bottom="var(--color_bTHGl_default)"
      - ⟂ quando El[Group Email]:is_visible → font_color="var(--color_primary_default)", button_disabled=True, border_color_bottom="var(--color_primary_default)", border_width_bottom=5
  - **Button** `Button E` (bUEhV0) — text: " Voltar para vendas" · props: icon="material outlined star_border", vertical_centering=True
- **Group** `Group Email` (bUEVd) — oculto ao carregar · props: vertical_centering=True
  - **Group** `Group EZ` (bUEVj) — props: vertical_centering=True
    - **Group** `Group HZ` (bUEWR) — props: vertical_centering=True
      - **Icon** `Icon M` (bUEWL) — props: icon="material outlined filter_alt", vertical_centering=True
      - **Text** `Text U` (bUEWF) — text: "Filtros "
    - **Group** `Group LZ` (bUEXl0) — props: vertical_centering=True
      - **Group** `Group JZ` (bUEWp) — props: vertical_centering=True
        - **Icon** `Icon N` (bUEWv) — props: icon="material outlined people", vertical_centering=True
        - **Text** `Text W` (bUEWr) — text: "Carteira do vendedor "
      - **Dropdown** `dd carteira 2 copy` (bUEhz0) — data_source: Search(User: cpo.IsDev equals False; sort cpo.NomeModelo) · placeholder: "Escolha o vendedor " · props: vertical_centering=True, dynamic_type="user", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.NomeModelo}"
    - **Group** `Group sem carteira` (bUEXH0) — props: vertical_centering=True
      - **Checkbox** `Checkbox cliente sem carteira` (bUEXO0) — label: "" · props: vertical_centering=True
      - **Icon** `Icon O` (bUEXU0) — props: icon="material outlined person_off", vertical_centering=True
      - **Text** `Text X` (bUEXf0) — text: "Clientes sem carteira"
    - **Group** `Group MZ` (bUEXz0) — oculto ao carregar · props: vertical_centering=True
      - **Group** `Group NZ` (bUEYP0) — props: vertical_centering=True
        - **Group** `Group NZ` (bUEYR0) — props: vertical_centering=True
          - **Text** `Text Z` (bUEYV0) — text: "Estado "
        - **Dropdown** `Dropdown G` (bUEYX0) — data_source: All(Opt.UFs) · placeholder: "Escolha o estado" · props: vertical_centering=True, dynamic_type="option.opt_ufs", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:display}"
    - **Group** `Group utlimos meses` (bUEYc0) — props: vertical_centering=True
      - **Checkbox** `check ultimos 3 meses` (bUEYh0) — label: "" · props: vertical_centering=True
      - **Icon** `Icon Q` (bUEYi0) — props: icon="material outlined calendar_today", vertical_centering=True
      - **Text** `Text AZ` (bUEYj0) — text: "Compraram nos últimos 3 meses"
    - **Group** `Group QZ` (bUEZF0) — props: vertical_centering=True
      - **Group** `Group PZ` (bUEYo0) — props: vertical_centering=True
        - **Icon** `Icon R` (bUEYu0) — props: icon="phosphor outlined clock", vertical_centering=True
        - **Text** `Text BZ` (bUEYt0) — text: "Sem contato há mais de:"
      - **RadioButtons** `RadioButtons B` (bUEYz0) — props: columns=4, choices="-\n15d\n30d\n+1m", computed_value="text"
  - **Group** `Group FZ` (bUEVp) — props: vertical_centering=True
    - **Table** `rpg clientes historico` (bUEaU0) — data_source: Search(Tbl.GrupoCliFor: cpo.QualCarteira equals El[dd carteira 2 copy]:get_data AND cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.NomeCliFor:contains(Text("{El[input busca cliente]:get_data:to_uppercase}")), constraint_type=∅}}) · props: group_type="custom.tbl_clientes", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
      - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:equals(1) → is_visible=True
      - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:not_equals(1) → is_visible=False
      - ⟂ quando El[Checkbox cliente sem carteira]:get_data → data_source=Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True; ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.NomeCliFor:contains(Text("{El[input busca cliente]:get_data:to_uppercase}")), constraint_type=∅}, 1={key="_advanced_search_constraint", value=InjectedValue:cpo.QualCarteira:is_empty, constraint_type=∅}})
      - ⟂ quando El[check ultimos 3 meses]:get_data → data_source=Search(Tbl.GrupoCliFor: Modified Date less than Page.Current Date/Time:plus_months(-3) AND cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.UltimoHistoricoData less than Page.Current Date/Time:plus_months(-3) AND cpo.Ativo equals True AND cpo.QualCarteira equals El[dd carteira 2 copy]:get_data; ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.NomeCliFor:contains(Text("{El[input busca cliente]:get_data:to_uppercase}")), constraint_type=∅}})
      - ⟂ quando El[RadioButtons B]:get_data:equals("15d") → data_source=Search(Tbl.GrupoCliFor: cpo.UltimoHistoricoData less than Page.Current Date/Time:plus_days(-15) AND cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True AND cpo.QualCarteira equals El[dd carteira 2 copy]:get_data; ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.NomeCliFor:contains(Text("{El[input busca cliente]:get_data:to_uppercase}")), constraint_type=∅}})
      - ⟂ quando El[RadioButtons B]:get_data:equals("30d") → data_source=Search(Tbl.GrupoCliFor: cpo.UltimoHistoricoData less than Page.Current Date/Time:plus_days(-30) AND cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True AND cpo.QualCarteira equals El[dd carteira 2 copy]:get_data; ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.NomeCliFor:contains(Text("{El[input busca cliente]:get_data:to_uppercase}")), constraint_type=∅}})
      - ⟂ quando El[RadioButtons B]:get_data:equals("+1m") → data_source=Search(Tbl.GrupoCliFor: cpo.UltimoHistoricoData less than Page.Current Date/Time:plus_days(-30) AND cpo.QualTipoCliFor equals opt.TipoCliFor.Cliente AND cpo.Ativo equals True AND cpo.QualCarteira equals El[dd carteira 2 copy]:get_data; ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.NomeCliFor:contains(Text("{El[input busca cliente]:get_data:to_uppercase}")), constraint_type=∅}})
      - **TableMainAxis** `TableMainAxis G` (bUEaZ0) — props: axis_index=0
      - **TableCrossAxis** `TableCrossAxis E` (bUEaa0) — props: axis_index=0
        - **TableCell** `Cell I` (bUEab0) — props: cell_main_axis_id="bUEaZ0"
          - **Group** `gp buscaclientehistorico` (bUEaf0) — props: vertical_centering=True
            - **Icon** `Icon T` (bUEag0) — props: icon="material outlined search", vertical_centering=True
            - **Input** `input busca cliente` (bUEal0) — placeholder: "Busca {El[rad tipoclifor]:get_data:display}" · props: mandatory=False, vertical_centering=True
            - **Icon** `Icon T` (bUEah0) — props: icon="material outlined close", vertical_centering=True
      - **TableCrossAxis** `TableCrossAxis E` (bUEam0) — props: axis_index=1, cross_axis_repeat=True
        - **TableCell** `Cell I` (bUEan0) — props: cell_main_axis_id="bUEaZ0"
          - **Group** `gp cliente` (bUEar0) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
            - ⟂ quando El[Reusable tool.Historico]:custom.id_clifor_:equals(Ancestor[TableCrossAxis]) → border_color="var(--color_primary_default)", border_width=2, border_style="solid"
            - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(240,240,240,1)"
            - **Group** `gp nome cliente` (bUEas0) — props: vertical_centering=True
              - **Image** `Image E` (bUEat0) — props: src="{Ancestor[TableCrossAxis]:cpo.Foto}", button_disabled=True
              - **Group** `Group TZ` (bUEay0) — props: vertical_centering=True, button_disabled=True
                - **Text** `Text Y` (bUEaz0) — text: "{Ancestor[TableCrossAxis]:cpo.NomeCliFor:to_uppercase}" · props: button_disabled=True
                - **Text** `Text Y` (bUEbD0) — text: "{Text("Último Histórico: {Page.Current Date/Time:minus(Ancestor[TableCrossAxis]:cpo.UltimoHistoricoData):to_days:round(0)} dias")}" · props: button_disabled=True
                  - ⟂ quando Ancestor[TableCrossAxis]:Created Date:less_than(Page.Current Date/Time:plus_days(15)):and_(Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]):count:equals(0)) → text="{∅}Cliente/Forncedor criado recentemente!"
                - **Text** `Text NZ` (bUFHf0) — text: "Na carteira de: {Ancestor[TableCrossAxis]:cpo.QualCarteira:cpo.NomeModelo:split_by(separator=" "):first_element} {Ancestor[TableCrossAxis]:cpo.QualCarteira:cpo.NomeModelo:split_by(separator=" "):specific_item(2)}⏎⏎"
                - **Dropdown** `Dropdown H` (bUErX) — data_source: Search(Tbl.ContatoCliFor: cpo.QualGrupoCliFor equals Ancestor[TableCrossAxis]):cpo.Email · placeholder: "Email padrão:" · props: default=Search(Tbl.ContatoCliFor: cpo.QualGrupoCliFor equals Ancestor[TableCrossAxis]):first_element:cpo.EmailPrincipal, dynamic_type="text", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue}"
              - **Icon** `icon email` (bUEij0) — props: icon="ionic outlined mail", vertical_centering=True
                - ⟂ quando This:is_hovered → background_style="bgcolor", bgcolor="rgba(247,247,247,1)"
                - ⟂ quando This:is_pressed → boxshadow_style="inset", boxshadow_color="rgba(209,209,209,1)", boxshadow_spread=3
  - **Group** `Group GZ` (bUEVv) — props: vertical_centering=True
    - **Group** `Group VZ` (bUEeb0) — props: vertical_centering=True
      - **Group** `Group RZ` (bUEdz0) — props: vertical_centering=True
        - **Icon** `Icon P` (bUEeF0) — props: icon="material outlined email", vertical_centering=True
        - **Text** `Text DZ` (bUEeE0) — text: "Mensagem"
    - **Group** `Group SZ` (bUEiH0) — props: vertical_centering=True
      - **Group** `Group SZ` (bUEiM0) — props: vertical_centering=True
        - **Text** `Text CZ` (bUEiN0) — text: "Qual email?"
      - **Dropdown** `ipt qual email` (bUEiR0) — data_source: El[Reusable tool.Historico]:custom.id_clifor_:cpo.QuaisContatos · placeholder: "Escolher email " · props: dynamic_type="custom.tbl_contatoclifor", choices_style="dynamic", computed_value="number", option_display_expression="{InjectedValue:cpo.Email}"
        - ⟂ quando Search(Tbl.ContatoCliFor: cpo.QualGrupoCliFor equals El[Reusable tool.Historico]:custom.id_clifor_):first_element:cpo.EmailPrincipal:is_not_empty → default=Search(Tbl.ContatoCliFor: cpo.QualGrupoCliFor equals El[Reusable tool.Historico]:custom.id_clifor_):first_element, option_display_expression="{InjectedValue:cpo.EmailPrincipal}"
    - **Group** `Group HZZ` (bUEnn)
      - **Group** `Group EZZ` (bUEkh)
        - **Group** `Group S` (bUEjl) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_width=3, background_style="bgcolor", bgcolor="rgba(248,248,248,1)"
          - **Icon** `Icon U` (bUElT) — oculto ao carregar · props: icon="ionic outline star"
            - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("1") → is_visible=True
          - **Text** `Text EZ` (bUEjn) — text: "Modelo Padrão"
        - **Group** `Group UZ` (bUEjs) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_width=3, background_style="bgcolor", bgcolor="rgba(248,248,248,1)"
          - **Icon** `Icon V` (bUElZ) — oculto ao carregar · props: icon="ionic outline star"
            - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("2") → is_visible=True
          - **Text** `Text HZ` (bUEjx) — text: "Chapatex"
        - **Group** `Group AZZ` (bUEjz) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_width=3, background_style="bgcolor", bgcolor="rgba(248,248,248,1)"
          - **Icon** `Icon W` (bUElf) — oculto ao carregar · props: icon="ionic outline star"
            - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("3") → is_visible=True
          - **Text** `Text IZ` (bUEkE) — text: "Palete de Plástico"
        - **Group** `Group BZZ` (bUElM) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_width=3, background_style="bgcolor", bgcolor="rgba(248,248,248,1)"
          - **Icon** `Icon X` (bUEll) — oculto ao carregar · props: icon="ionic outline star"
            - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("4") → is_visible=True
          - **Text** `Text JZ` (bUElR) — text: "Porta Palete"
      - **Group** `Group FZZ` (bUEkt)
        - **Group** `Group CZZ` (bUEkQ) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_width=3, background_style="bgcolor", bgcolor="rgba(248,248,248,1)"
          - **Icon** `Icon Y` (bUElr) — oculto ao carregar · props: icon="ionic outline star"
            - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("5") → is_visible=True
          - **Text** `Text KZ` (bUEkV) — text: "Lógistica Reversa"
        - **Group** `Group DZZ` (bUEkX) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_width=3, background_style="bgcolor", bgcolor="rgba(248,248,248,1)"
          - **Icon** `Icon Z` (bUElx) — oculto ao carregar · props: icon="ionic outline star"
            - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("6") → is_visible=True
          - **Text** `Text LZ` (bUEkc) — text: "Palete de Metal"
        - **Group** `Group GZZ` (bUElF) — props: vertical_centering=True
          - ⟂ quando This:is_hovered → border_width=3, background_style="bgcolor", bgcolor="rgba(248,248,248,1)"
          - **Icon** `Icon AZ` (bUEmD) — oculto ao carregar · props: icon="ionic outline star"
            - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("7") → is_visible=True
          - **Text** `Text MZ` (bUElH) — text: "Resgate"
    - **Group** `Group WZ` (bUEej0) — props: vertical_centering=True
      - **Group** `Group WZ` (bUEeo0) — props: vertical_centering=True
        - **Text** `Text FZ` (bUEep0) — text: "Assunto"
      - **Input** `ipt assunto` (bUEeu0) — placeholder: "Assunto do email" · content: "Sua empresa utiliza paletes? Temos a solução ideal!" · props: computed_value="number"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("2") → content="{∅}REDUZA PERDAS E PROTEJA SUA CARGA COM CHAPATEX DE QUALIDADE"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("3") → content="{∅}MAIS HIGIENE, DURABILIDADE E EFICIÊNCIA PARA SUA OPERAÇÃO"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("4") → content="{∅}OTIMIZE SEU ARMAZÉM COM PORTA-PALETES DE ALTA PERFORMANCE"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("5") → content="{∅}LOGÍSTICA REVERSA INTELIGENTE: ECONOMIA, SUSTENTABILIDADE E EFICIÊNCIA PARA SUA EMPRESA"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("6") → content="{∅}PALETES METÁLICOS: MÁXIMA RESISTÊNCIA E SEGURANÇA PARA SUA OPERAÇÃO"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("7") → content="{∅}Ainda faz sentido conversarmos?"
    - **Group** `Group XZ` (bUEez0) — props: vertical_centering=True
      - **Group** `Group XZ` (bUEfB0) — props: vertical_centering=True
        - **Text** `Text GZ` (bUEfF0) — text: "Corpo do email"
      - **MultiLineInput** `ipt email` (bUEfG0) — placeholder: "Escolha o vendedor " · content: "Olá, tudo bem?⏎⏎VOCÊ USA PALETES?⏎⏎É um prazer ter a sua atenção!⏎⏎Gostaríamos de apresentar o Grupo MegaBox, especialista em soluções para logística, armazenagem e movimentação de cargas em todo o Brasil.⏎⏎Nossos produtos e serviços:⏎⏎* Paletes de madeira, plástico e metal (novos, usados e reformados);⏎* Palete PBR;⏎* Palete One Way / descartável;⏎* Palete tratado HT (ISPM 15);⏎* Palete europeu (EUR);⏎* Chapatex e separadores logísticos;⏎* Papelão para embalagens industriais;⏎* Porta-paletes e estruturas de armazenagem;⏎* Sistema Drive-in;⏎* Racks metálicos industriais;⏎* Gaiolas aramadas para armazenagem;⏎* Estrados metálicos;⏎* Compra, venda, locação, reforma e reciclagem.⏎⏎Com mais de 5 anos de experiência no mercado, oferecemos atendimento consultivo, agilidade na entrega e produtos de alta qualidade para empresas de diversos segmentos.⏎⏎⏎Nossos diferenciais:⏎⏎✅ Atendimento nacional;⏎✅ Estoque rotativo;⏎✅ Logística eficiente;⏎✅ Melhor custo-benefício;⏎✅ Atendimento consultivo e humanizado.⏎⏎Estamos à disposição para enviar um orçamento sem compromisso e será um prazer atendê-los da melhor forma possível!⏎⏎Conheça mais sobre nossos produtos e serviços em nosso site: www.grupomegabox.com.br⏎⏎Atenciosamente,⏎Grupo MegaBox⏎📞 0800 591 0248⏎📱 WhatsApp: (62) 99383-7165⏎⏎Vendedor: {CurrentUser:cpo.NomeModelo}"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("2") → content="Sua empresa utiliza chapatex para proteção e separação de cargas?⏎⏎O Grupo MegaBox oferece soluções em chapatex de alta qualidade, ideais para garantir mais segurança no transporte, melhor organização logística e redução de avarias.⏎⏎Com nossas soluções, sua empresa conquista:⏎⏎✔️ Mais proteção para produtos e embalagens⏎✔️ Melhor estabilidade no armazenamento⏎✔️ Redução de danos e prejuízos logísticos⏎✔️ Excelente custo-benefício⏎✔️ Entrega ágil e atendimento nacional⏎⏎Com mais de 5 anos de experiência, o Grupo MegaBox atende empresas em todo o Brasil com agilidade, qualidade e atendimento consultivo.⏎⏎Solicite seu orçamento sem compromisso.⏎⏎🌐 Grupo MegaBox⏎⏎📞 0800 591 0248⏎📱 WhatsApp: (62) 99383-7165"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("3") → content="{∅}Sua empresa busca uma solução moderna, resistente e eficiente para armazenagem e movimentação de cargas?⏎⏎O Grupo MegaBox oferece paletes de plástico de alta qualidade, ideais para operações que exigem durabilidade, higiene, praticidade e excelente desempenho logístico.⏎⏎Nossos paletes de plástico proporcionam:⏎⏎✔️ Alta resistência e longa vida útil⏎✔️ Fácil higienização e baixa absorção de umidade⏎✔️ Maior segurança no armazenamento e transporte⏎✔️ Resistência a fungos, pragas e corrosão⏎✔️ Excelente custo-benefício a longo prazo⏎⏎São ideais para diversos segmentos, como indústrias, centros de distribuição, alimentos, farmacêutico, varejo e logística em geral.⏎⏎Por que escolher o Grupo MegaBox?⏎⏎✅ Atendimento em todo o Brasil⏎✅ Produtos de alta qualidade⏎✅ Estoque rotativo⏎✅ Entrega ágil⏎✅ Atendimento consultivo especializado⏎⏎Com mais de 5 anos de experiência, entregamos soluções logísticas que geram mais eficiência, segurança e economia para sua operação.⏎⏎Solicite seu orçamento sem compromisso e encontre a solução ideal para sua empresa.⏎⏎🌐 Grupo MegaBox⏎⏎📞 0800 591 0248⏎📱 WhatsApp: (62) 99383-7165⏎⏎Vendedor: {CurrentUser:cpo.NomeModelo}"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("4") → content="Sua empresa busca mais organização, segurança e melhor aproveitamento do espaço no estoque?⏎⏎O Grupo MegaBox oferece soluções em porta-paletes industriais, desenvolvidas para otimizar a armazenagem, aumentar a produtividade e garantir mais eficiência logística para sua operação.⏎⏎Nossos sistemas proporcionam:⏎⏎✔️ Melhor aproveitamento vertical do espaço⏎✔️ Organização estratégica do estoque⏎✔️ Facilidade de acesso e movimentação de cargas⏎✔️ Mais segurança operacional⏎✔️ Redução de perdas e aumento da eficiência logística⏎⏎Trabalhamos com soluções personalizadas para atender às necessidades da sua operação, sempre com qualidade, agilidade e atendimento consultivo especializado.⏎⏎Por que escolher o Grupo MegaBox?⏎⏎✅ Atendimento em todo o Brasil⏎✅ Projetos sob medida⏎✅ Estruturas resistentes e de alta durabilidade⏎✅ Entrega ágil⏎✅ Excelente custo-benefício⏎⏎Com mais de 5 anos de experiência, ajudamos empresas a transformar seus espaços logísticos em operações mais organizadas, produtivas e rentáveis.⏎⏎Solicite um orçamento sem compromisso e descubra a melhor solução para o seu armazém.⏎⏎🌐 Grupo MegaBox⏎⏎📞 0800 591 0248⏎📱 WhatsApp: (62) 99383-7165⏎⏎Vendedor: {CurrentUser:cpo.NomeModelo}"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("5") → content="Sua empresa busca reduzir custos, otimizar recursos e adotar práticas mais sustentáveis na gestão logística?⏎⏎O Grupo MegaBox oferece soluções completas em logística reversa, proporcionando reaproveitamento inteligente de materiais, redução de desperdícios e maior eficiência operacional.⏎⏎Nossos serviços incluem:⏎⏎✔️ Coleta e retorno de materiais logísticos⏎✔️ Recuperação e reaproveitamento de paletes⏎✔️ Reforma e recondicionamento⏎✔️ Destinação correta de materiais⏎✔️ Gestão eficiente de ativos logísticos⏎⏎Com a logística reversa, sua empresa conquista:⏎⏎✔️ Redução de custos operacionais⏎✔️ Mais sustentabilidade e responsabilidade ambiental⏎✔️ Melhor aproveitamento de recursos⏎✔️ Otimização da cadeia logística⏎✔️ Maior controle patrimonial⏎⏎Por que escolher o Grupo MegaBox?⏎⏎✅ Atendimento em todo o Brasil⏎✅ Operação ágil e eficiente⏎✅ Soluções personalizadas⏎✅ Atendimento consultivo especializado⏎✅ Excelente custo-benefício⏎⏎Com mais de 5 anos de experiência, ajudamos empresas a transformar desperdícios em economia e eficiência logística.⏎⏎Solicite uma proposta sem compromisso e descubra como a logística reversa pode gerar resultados para sua operação.⏎⏎🌐 Grupo MegaBox⏎⏎📞 0800 591 0248⏎📱 WhatsApp: (62) 99383-7165⏎⏎Vendedor: {CurrentUser:cpo.NomeModelo}"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("6") → content="Sua empresa precisa de uma solução robusta e durável para armazenagem e movimentação de cargas pesadas?⏎⏎O Grupo MegaBox oferece paletes metálicos de alta resistência, desenvolvidos para operações que exigem segurança, durabilidade e máxima performance logística.⏎⏎Nossos paletes metálicos proporcionam:⏎⏎✔️ Alta capacidade de carga⏎✔️ Excelente resistência a impactos e deformações⏎✔️ Maior durabilidade e vida útil prolongada⏎✔️ Segurança no armazenamento e movimentação⏎✔️ Melhor aproveitamento do espaço logístico⏎⏎São ideais para indústrias, centros de distribuição, operações de grande porte e ambientes que demandam estruturas reforçadas e de alto desempenho.⏎⏎Vantagens para sua operação⏎⏎✔️ Redução de custos com reposição⏎✔️ Mais estabilidade para cargas pesadas⏎✔️ Estrutura robusta e confiável⏎✔️ Melhor organização do estoque⏎✔️ Excelente retorno sobre investimento⏎⏎Por que escolher o Grupo MegaBox?⏎⏎✅ Atendimento em todo o Brasil⏎✅ Estruturas de alta qualidade⏎✅ Soluções sob medida⏎✅ Entrega ágil⏎✅ Atendimento consultivo especializado⏎⏎⏎Solicite seu orçamento sem compromisso e encontre a solução ideal para sua operação.⏎⏎🌐 Grupo MegaBox⏎⏎📞 0800 591 0248⏎📱 WhatsApp: (62) 99383-7165⏎⏎Vendedor: {CurrentUser:cpo.NomeModelo}"
        - ⟂ quando El[Reusable tool.Historico]:custom.var_modeloemail_:equals("7") → content="Olá, tudo bem?⏎⏎Passando para dar continuidade ao nosso contato sobre as soluções do Grupo MegaBox.⏎⏎Seguimos à disposição para atender sua empresa com paletes, chapatex, porta-paletes e soluções logísticas completas, sempre com agilidade, qualidade e excelente custo-benefício.⏎⏎Conseguimos avançar com sua necessidade no momento ou existe alguma demanda em que possamos te auxiliar?⏎⏎Fico à disposição.⏎📞 0800 591 0248⏎📱 WhatsApp: (62) 99383-7165⏎⏎Vendedor: {CurrentUser:cpo.NomeModelo}"
    - **Button** `Button D` (bUEfL0) — text: "Enviar email" · props: icon="material outlined star_border", vertical_centering=True
- **Group** `Group Historico` (bUEgC0) — props: vertical_centering=True
  - **Button** `Button A` (bUEUr) — text: "Histórico " · props: icon="feather external-link", vertical_centering=True, button_type="label_icon"
    - ⟂ quando Page.Current Page Name:equals("historico_full"):or_(Page.Current Page Name:not_equals("vendas")) → is_visible=False
  - **Group** `Group V` (bTjml) — props: vertical_centering=True
    - **RadioButtons** `rad tipoclifor` (bTjmf) — data_source: All(opt.TipoCliFor) · props: mandatory=True, default=opt.TipoCliFor.Cliente, dynamic_type="option.opt_tipoclifor", choices_style="dynamic", option_display_expression="{InjectedValue:display}"
      - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) → font_color="var(--color_bTHGl_default)", disabled=True
    - **Group** `gp vendedor` (bTjLV) — props: vertical_centering=True
      - **Text** `Text K` (bTjLP) — text: "Selecione carteira: "
      - **Dropdown** `dd vendedor` (bTeEO) — data_source: Search(User; sort cpo.NomeModelo) · placeholder: "Carteira de clientes" · props: mandatory=True, vertical_centering=True, dynamic_type="user", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeModelo:to_uppercase}"
        - ⟂ quando CurrentUser:cpo.QualPerfil:hierarquia:greater_than(2) → bgcolor="var(--color_bTHGh_default)", disabled=True
        - ⟂ quando El[rad tipoclifor]:get_data:equals(opt.TipoCliFor.Cliente) → default=CurrentUser
        - ⟂ quando El[rad tipoclifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → bgcolor="var(--color_bTHGh_default)", disabled=True
  - **Group** `Group R` (bTjCJ) — props: vertical_centering=True
    - **Text** `Text D` (bTdwu) — text: "Por {El[rad tipoclifor]:get_data:display}"
      - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:equals(1) → border_color_bottom="var(--color_bTHGs_default)", border_width_bottom=5
    - **Text** `Text E` (bTdxA) — text: "Individual"
      - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:equals(2) → border_color_bottom="var(--color_bTHGs_default)", border_width_bottom=5
    - **Text** `Text C` (bTjCD) — text: "Sem interação [size=2]({El[rpg clientes sem interação]:get_list_data:count})[/size]"
      - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:equals(3) → border_color_bottom="var(--color_bTHGs_default)", border_width_bottom=5
      - ⟂ quando El[rpg clientes sem interação]:get_list_data:count:greater_or_equal_than(1) → font_color="var(--color_bTHHJ_default)"
      - ⟂ quando El[rad tipoclifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → font_color="var(--color_bTHGl_default)", button_disabled=True
  - **Table** `rpg clientes historico` (bTdrx) — data_source: Search(Tbl.GrupoCliFor: cpo.QualCarteira equals El[dd vendedor]:get_data AND cpo.NomeCliFor equals "{El[src busca clifor agrupad]:get_data:cpo.NomeCliFor}" AND cpo.Ativo equals True; ignore empty) · props: group_type="custom.tbl_clientes", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
    - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:equals(1) → is_visible=True
    - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:not_equals(1) → is_visible=False
    - ⟂ quando El[rad tipoclifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → data_source=Search(Tbl.GrupoCliFor: cpo.NomeCliFor equals "{El[src busca clifor agrupad]:get_data:cpo.NomeCliFor}" AND cpo.QualTipoCliFor equals opt.TipoCliFor.Fornecedor; ignore empty)
    - **TableMainAxis** `TableMainAxis A` (bTdst) — props: axis_index=0
    - **TableCrossAxis** `TableCrossAxis A` (bTdsz) — props: axis_index=0
      - **TableCell** `Cell A` (bTdtD) — props: cell_main_axis_id="bTdst"
        - **Group** `gp buscaclientehistorico` (bTiqg) — props: vertical_centering=True
          - **Icon** `Icon G` (bTiqU) — props: icon="material outlined search", vertical_centering=True
          - **AutocompleteDropdown** `src busca clifor agrupad` (bTiqO) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[rad tipoclifor]:get_data AND cpo.QualCarteira equals El[dd vendedor]:get_data; sort cpo.NomeCliFor, ignore empty) · placeholder: "Busca {El[rad tipoclifor]:get_data:display}" · props: mandatory=False, vertical_centering=True, field_to_search="cpo_nomecliente_text"
          - **Icon** `Icon H` (bTiqa) — props: icon="material outlined close", vertical_centering=True
    - **TableCrossAxis** `TableCrossAxis A` (bTdtJ) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell A` (bTdtK) — props: cell_main_axis_id="bTdst"
        - **Group** `gp cliente` (bTdwK) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Group** `gp nome cliente` (bTdth) — props: vertical_centering=True
            - **Image** `Image A` (bTdtR) — props: src="{Ancestor[TableCrossAxis]:cpo.Foto}"
            - **Group** `Group I` (bTeED) — props: vertical_centering=True
              - **Text** `Text A` (bTdtb) — text: "{Ancestor[TableCrossAxis]:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text J` (bTeDx) — text: "Último Histórico: {Page.Current Date/Time:minus(Ancestor[TableCrossAxis]:cpo.UltimoHistoricoData):to_days:round(0)} dias"
                - ⟂ quando Ancestor[TableCrossAxis]:Created Date:less_than(Page.Current Date/Time:plus_days(15)):and_(Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]):count:equals(0)) → text="{∅}Cliente/Forncedor criado recentemente!"
            - **Icon** `Icon material outlined ke` (bTdvn) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
              - ⟂ quando El[rpg historico]:is_visible → icon="material outlined keyboard_arrow_up"
          - **Table** `rpg historico` (bTdtp) — oculto ao carregar · data_source: Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]; sort Created Date desc) · props: group_type="custom.tbl_historico", vertical_centering=True, unique_id="remodela"
            - **TableMainAxis** `TableMainAxis B` (bTdul) — props: axis_index=0
            - **TableMainAxis** `TableMainAxis B` (bTdup) — props: axis_index=2
            - **TableCrossAxis** `TableCrossAxis B` (bTdur) — props: axis_index=0, make_sticky=True
              - **TableCell** `Cell B` (bTduv) — props: cell_main_axis_id="bTdul"
                - **Group** `gp edita historico por cliente` (bTdwc) — props: group_type="custom.tbl_historico", vertical_centering=True
                  - **MultiLineInput** `ipt descricao historico cli` (bTdvJ) — placeholder: "Descrição do atendimento" · content: "{Parent:cpo.Descricao}" · props: vertical_centering=True
                  - **Dropdown** `dd unidade agrupado` (bTlOA) — data_source: El[gp cliente]:get_group_data:cpo.QuaisEnderecos · placeholder: "Selecione a unidade" · props: mandatory=True, default=Parent:cpo.QualUnidade, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.CnpjCpf}"
              - **TableCell** `Cell B` (bTduw) — props: cell_main_axis_id="bTdup"
                - **Icon** `btn grava historico por cliente` (bTdvP) — props: icon="material outlined save", vertical_centering=True
              - **TableCell** `Cell F` (bTeCF) — props: cell_main_axis_id="bTeBz"
            - **TableCrossAxis** `TableCrossAxis B` (bTdvB) — props: axis_index=1, cross_axis_repeat=True
              - **TableCell** `Cell B` (bTdvC) — props: cell_main_axis_id="bTdul"
                - **Image** `Image C` (bTiGl1) — props: src="{Ancestor[TableCrossAxis]:Created By:cpo.Foto}"
                - **Group** `Group F` (bTiId) — props: vertical_centering=True
                  - **Group** `Group F` (bTiIv) — props: vertical_centering=True
                    - **Group** `Group F` (bTiIw) — props: vertical_centering=True
                      - **Text** `Text B` (bTiIx) — text: "Cliente:  "
                      - **Text** `Text B` (bTiJB) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
                    - **Group** `Group F` (bTiJC) — props: vertical_centering=True
                      - **Text** `Text B` (bTiJD) — text: "Vendedor:  "
                      - **Text** `Text B` (bTiJH) — text: "{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}"
                  - **Group** `Group F` (bTiIf) — props: vertical_centering=True
                    - **Group** `Group F` (bTiIj) — props: vertical_centering=True
                      - **Text** `Text B` (bTiIk) — text: "Criado:  "
                      - **Text** `Text B` (bTiIl) — text: "{Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
                    - **Group** `Group BZ` (bTlYU) — oculto ao carregar · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:Modified Date:equals_rounded_down(Ancestor[TableCrossAxis]:Created Date, component_to_extract="minute") → is_visible=True
                      - **Text** `Text T` (bTlYZ) — text: "Modificado:  "
                      - **Text** `Text T` (bTlYa) — text: "{Ancestor[TableCrossAxis]:Modified Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
                  - **Group** `Group Z` (bTlPN) — props: vertical_centering=True
                    - **Text** `Text R` (bTlPP) — text: "Unidade: "
                    - **Text** `Text R` (bTlPT) — text: "{Ancestor[TableCrossAxis]:cpo.QualUnidade:cpo.NomeEndereco:to_capitalized_words}"
                  - **Group** `Group F` (bTiJI) — props: vertical_centering=True
                    - **Text** `Text B` (bTiJJ) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao}"
              - **TableCell** `Cell B` (bTdvD) — props: cell_main_axis_id="bTdup"
                - **Icon** `btn edita historico individual copy` (bTeCd) — props: icon="material outlined delete", vertical_centering=True
                  - ⟂ quando Ancestor[TableCrossAxis]:Created By:not_equals(CurrentUser) → icon_color="var(--color_bTHGl_default)", button_disabled=True
              - **TableCell** `Cell G` (bTeCL) — props: cell_main_axis_id="bTeBz"
                - **Icon** `btn edita historico por cliente` (bTdvh) — props: icon="material outlined mode_edit", vertical_centering=True
                  - ⟂ quando Ancestor[TableCrossAxis]:Created By:not_equals(CurrentUser) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **TableMainAxis** `TableMainAxis E` (bTeBz) — props: axis_index=-1
  - **Table** `rpg historico` (bTdyZ) — data_source: Search(Tbl.Historico: cpo.QualVendedor equals El[dd vendedor]:get_data AND cpo.QualCliente equals El[src busca clifor individual]:get_data; sort Created Date desc, ignore empty) · props: group_type="custom.tbl_historico", vertical_centering=True, unique_id="remodela"
    - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:equals(2) → is_visible=True
    - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:not_equals(2) → is_visible=False
    - ⟂ quando El[rad tipoclifor]:get_data:equals(opt.TipoCliFor.Fornecedor) → data_source=Search(Tbl.Historico: cpo.QualVendedor equals El[dd vendedor]:get_data AND cpo.QualCliente equals El[src busca clifor individual]:get_data; sort Created Date desc, ignore empty):filtered(constraints={0={key="_advanced_search_constraint", value=InjectedValue:cpo.QualCliente:cpo.QualTipoCliFor:equals(opt.TipoCliFor.Fornecedor), constraint_type=∅}})
    - **TableMainAxis** `TableMainAxis C` (bTdyb) — props: axis_index=0
    - **TableMainAxis** `TableMainAxis C` (bTdyf) — props: axis_index=2
    - **TableCrossAxis** `TableCrossAxis C` (bTdyg) — props: axis_index=0, make_sticky=True
      - **TableCell** `Cell C` (bTdyh) — props: cell_main_axis_id="bTdyb"
        - **Group** `gp edita historico indi` (bTdyl) — props: group_type="custom.tbl_historico", vertical_centering=True
          - **Group** `gp buscaclienteindividual` (bTirX) — data_source: Parent · props: group_type="custom.tbl_historico", vertical_centering=True
            - **Icon** `Icon I` (bTirL) — props: icon="material outlined search", vertical_centering=True
            - **AutocompleteDropdown** `src busca clifor individual` (bTdzF) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[rad tipoclifor]:get_data AND cpo.QualCarteira equals El[dd vendedor]:get_data; sort cpo.NomeCliFor, ignore empty) · placeholder: "Busca {El[rad tipoclifor]:get_data:display}" · props: mandatory=True, default=Parent:cpo.QualCliente, vertical_centering=True, field_to_search="cpo_nomecliente_text"
            - **Icon** `Icon J` (bTirR) — props: icon="material outlined close", vertical_centering=True
          - **MultiLineInput** `ipt descricao historico ind` (bTdym) — placeholder: "Descrição do atendimento" · content: "{Parent:cpo.Descricao}" · props: mandatory=True, vertical_centering=True
          - **Dropdown** `dd unidade individual` (bTlOG) — data_source: El[src busca clifor individual]:get_data:cpo.QuaisEnderecos · placeholder: "Selecione a unidade" · props: mandatory=True, default=Parent:cpo.QualUnidade, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.CnpjCpf}"
      - **TableCell** `Cell C` (bTdyn) — props: cell_main_axis_id="bTdyf"
        - **Icon** `btn grava historico individual` (bTdyr) — props: icon="material outlined save", vertical_centering=True
      - **TableCell** `Cell D` (bTeBT) — props: cell_main_axis_id="bTeBN"
    - **TableCrossAxis** `TableCrossAxis C` (bTdys) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell C` (bTdyt) — props: cell_main_axis_id="bTdyb"
        - **Image** `Image B` (bTiGT1) — props: src="{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.Foto}"
        - **Group** `Group K` (bTiGZ1) — props: vertical_centering=True
          - **Group** `Group H` (bTeDp) — props: vertical_centering=True
            - **Group** `Group J` (bTiHV) — props: vertical_centering=True
              - **Text** `Text I` (bTeDr) — text: "Cliente:  "
              - **Text** `Text L` (bTiHJ) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
            - **Group** `Group M` (bTiHd) — props: vertical_centering=True
              - **Text** `Text I` (bTeDv) — text: "Vendedor:  "
              - **Text** `Text M` (bTiHP) — text: "{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}"
          - **Group** `Group G` (bTeDe) — props: vertical_centering=True
            - **Group** `Group N` (bTiHu) — props: vertical_centering=True
              - **Text** `Text H` (bTeDj) — text: "Criado:  "
              - **Text** `Text N` (bTiHo) — text: "{Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
            - **Group** `Group O` (bTiIL) — oculto ao carregar · props: vertical_centering=True
              - ⟂ quando Ancestor[TableCrossAxis]:Modified Date:equals_rounded_down(Ancestor[TableCrossAxis]:Created Date, component_to_extract="minute") → is_visible=True
              - **Text** `Text H` (bTeDk) — text: "Modificado:  "
              - **Text** `Text O` (bTiIF) — text: "{Ancestor[TableCrossAxis]:Modified Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
          - **Group** `Group Y` (bTlPC) — props: vertical_centering=True
            - **Text** `Text Q` (bTlPH) — text: "Unidade: "
            - **Text** `Text Q` (bTlPI) — text: "{Ancestor[TableCrossAxis]:cpo.QualUnidade:cpo.NomeEndereco:to_capitalized_words}"
          - **Group** `Group P` (bTiIT) — props: vertical_centering=True
            - **Text** `Text F` (bTdyy) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao}"
      - **TableCell** `Cell C` (bTdyz) — props: cell_main_axis_id="bTdyf"
        - **Icon** `btn edita historico individual copy` (bTeBH) — props: icon="material outlined delete", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:Created By:not_equals(CurrentUser) → icon_color="var(--color_bTHGl_default)", button_disabled=True
      - **TableCell** `Cell E` (bTeBZ) — props: cell_main_axis_id="bTeBN"
        - **Icon** `btn edita historico individual` (bTdzD) — props: icon="material outlined mode_edit", vertical_centering=True
          - ⟂ quando Ancestor[TableCrossAxis]:Created By:not_equals(CurrentUser) → icon_color="var(--color_bTHGl_default)", button_disabled=True
    - **TableMainAxis** `TableMainAxis D` (bTeBN) — props: axis_index=-1
  - **Table** `rpg clientes sem interação` (bTjIH) — data_source: Search(Tbl.GrupoCliFor: cpo.QualCarteira equals El[dd vendedor]:get_data AND cpo.UltimoHistoricoData lte Page.Current Date/Time:plus_days(-15) AND cpo.NomeCliFor equals "{El[src busca cliente seminteracao]:get_data:cpo.NomeCliFor}"; sort cpo.NomeCliFor, ignore empty) · props: group_type="custom.tbl_clientes", vertical_centering=True, unique_id="remodela", vertical_separator_style="none", horizontal_separator_style="none"
    - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:equals(3) → is_visible=True
    - ⟂ quando El[Reusable tool.Historico]:custom.var_tabhistorico_:not_equals(3) → is_visible=False
    - **TableMainAxis** `TableMainAxis F` (bTjIJ) — props: axis_index=0
    - **TableCrossAxis** `TableCrossAxis D` (bTjIN) — props: axis_index=0
      - **TableCell** `Cell H` (bTjIO) — props: cell_main_axis_id="bTjIJ"
        - **Group** `gp buscaclientehistorico` (bTkBT) — props: vertical_centering=True
          - **Icon** `Icon L` (bTkBV) — props: icon="material outlined search", vertical_centering=True
          - **AutocompleteDropdown** `src busca cliente seminteracao` (bTkBa) — data_source: Search(Tbl.GrupoCliFor: cpo.QualTipoCliFor equals El[rad tipoclifor]:get_data AND cpo.QualCarteira equals El[dd vendedor]:get_data; sort cpo.NomeCliFor, ignore empty) · placeholder: "Busca {El[rad tipoclifor]:get_data:display}" · props: mandatory=True, vertical_centering=True, field_to_search="cpo_nomecliente_text"
          - **Icon** `Icon L` (bTkBZ) — props: icon="material outlined close", vertical_centering=True
    - **TableCrossAxis** `TableCrossAxis D` (bTjIZ) — props: axis_index=1, cross_axis_repeat=True
      - **TableCell** `Cell H` (bTjIa) — props: cell_main_axis_id="bTjIJ"
        - **Group** `gp cliente` (bTjIb) — data_source: Ancestor[TableCrossAxis] · props: group_type="custom.tbl_clientes", vertical_centering=True
          - **Group** `gp nome cliente` (bTjIf) — props: vertical_centering=True
            - **Image** `Image D` (bTjIg) — props: src="{Ancestor[TableCrossAxis]:cpo.Foto}"
            - **Group** `Group T` (bTjIl) — props: vertical_centering=True
              - **Text** `Text G` (bTjIm) — text: "{Ancestor[TableCrossAxis]:cpo.NomeCliFor:to_uppercase}"
              - **Text** `Text G` (bTjIn) — text: "Último Histórico: {Page.Current Date/Time:minus(Ancestor[TableCrossAxis]:cpo.UltimoHistoricoData):to_days:round(0)} dias"
            - **Icon** `Icon material outlined ke` (bTjIh) — props: icon="material outlined keyboard_arrow_down", vertical_centering=True
              - ⟂ quando El[rpg historico]:is_visible → icon="material outlined keyboard_arrow_up"
          - **Table** `rpg historico` (bTjIr) — oculto ao carregar · data_source: Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]; sort Created Date desc) · props: group_type="custom.tbl_historico", vertical_centering=True, unique_id="remodela"
            - **TableMainAxis** `TableMainAxis F` (bTjIs) — props: axis_index=0
            - **TableMainAxis** `TableMainAxis F` (bTjIt) — props: axis_index=2
            - **TableCrossAxis** `TableCrossAxis D` (bTjIx) — props: axis_index=0, make_sticky=True
              - **TableCell** `Cell H` (bTjIy) — props: cell_main_axis_id="bTjIs"
                - **Group** `gp edita historico por cliente` (bTjIz) — props: group_type="custom.tbl_historico", vertical_centering=True
                  - **MultiLineInput** `ipt descricao historico cli` (bTjJD) — placeholder: "Descrição do atendimento" · content: "{Parent:cpo.Descricao}" · props: vertical_centering=True
                  - **Dropdown** `dd unidade seminteracao` (bTlOM) — data_source: El[gp cliente]:get_group_data:cpo.QuaisEnderecos · placeholder: "Selecione a unidade" · props: mandatory=True, default=Parent:cpo.QualUnidade, vertical_centering=True, dynamic_type="custom.tbl_enderecosclifor", choices_style="dynamic", option_display_expression="{InjectedValue:cpo.NomeEndereco:to_capitalized_words} - {InjectedValue:cpo.Endereco:to_capitalized_words} - {InjectedValue:cpo.CnpjCpf}"
              - **TableCell** `Cell H` (bTjJE) — props: cell_main_axis_id="bTjIt"
                - **Icon** `btn grava historico interação` (bTjJF) — props: icon="material outlined save", vertical_centering=True
              - **TableCell** `Cell H` (bTjJJ) — props: cell_main_axis_id="bTjKG"
            - **TableCrossAxis** `TableCrossAxis D` (bTjJK) — props: axis_index=1, cross_axis_repeat=True
              - **TableCell** `Cell H` (bTjJL) — props: cell_main_axis_id="bTjIs"
                - **Image** `Image D` (bTjJv) — props: src="{Ancestor[TableCrossAxis]:Created By:cpo.Foto}"
                - **Group** `Group T` (bTjJP) — props: vertical_centering=True
                  - **Group** `Group T` (bTjJi) — props: vertical_centering=True
                    - **Group** `Group T` (bTjJj) — props: vertical_centering=True
                      - **Text** `Text G` (bTjJn) — text: "Cliente:  "
                      - **Text** `Text G` (bTjJo) — text: "{Ancestor[TableCrossAxis]:cpo.QualCliente:cpo.NomeCliFor:to_uppercase}"
                    - **Group** `Group T` (bTjJp) — props: vertical_centering=True
                      - **Text** `Text G` (bTjJt) — text: "Vendedor:  "
                      - **Text** `Text G` (bTjJu) — text: "{Ancestor[TableCrossAxis]:cpo.QualVendedor:cpo.NomeModelo:to_uppercase}"
                  - **Group** `Group T` (bTjJV) — props: vertical_centering=True
                    - **Group** `Group T` (bTjJW) — props: vertical_centering=True
                      - **Text** `Text G` (bTjJX) — text: "Criado:  "
                      - **Text** `Text G` (bTjJb) — text: "{Ancestor[TableCrossAxis]:Created Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
                    - **Group** `Group AZ` (bTlWv) — oculto ao carregar · props: vertical_centering=True
                      - ⟂ quando Ancestor[TableCrossAxis]:Modified Date:equals_rounded_down(Ancestor[TableCrossAxis]:Created Date, component_to_extract="minute") → is_visible=True
                      - **Text** `Text S` (bTlYO) — text: "Modificado:  "
                      - **Text** `Text S` (bTlYP) — text: "{Ancestor[TableCrossAxis]:Modified Date:format_date(formatting_type="custom", custom_format="dd/mm/yy - HH:MM")}"
                  - **Group** `Group X` (bTlOS) — props: vertical_centering=True
                    - **Group** `Group X` (bTlOX) — props: vertical_centering=True
                      - **Text** `Text P` (bTlOY) — text: "Unidade: "
                      - **Text** `Text P` (bTlOZ) — text: "{Ancestor[TableCrossAxis]:cpo.QualUnidade:cpo.NomeEndereco:to_capitalized_words}"
                  - **Group** `Group T` (bTjJQ) — props: vertical_centering=True
                    - **Text** `Text G` (bTjJR) — text: "{Ancestor[TableCrossAxis]:cpo.Descricao}"
              - **TableCell** `Cell H` (bTjJz) — props: cell_main_axis_id="bTjIt"
                - **Icon** `btn edita historico individual copy` (bTjKA) — props: icon="material outlined delete", vertical_centering=True
                  - ⟂ quando Ancestor[TableCrossAxis]:Created By:not_equals(CurrentUser) → icon_color="var(--color_bTHGl_default)", button_disabled=True
              - **TableCell** `Cell H` (bTjKB) — props: cell_main_axis_id="bTjKG"
                - **Icon** `btn edita historico por cliente` (bTjKF) — props: icon="material outlined mode_edit", vertical_centering=True
                  - ⟂ quando Ancestor[TableCrossAxis]:Created By:not_equals(CurrentUser) → icon_color="var(--color_bTHGl_default)", button_disabled=True
            - **TableMainAxis** `TableMainAxis F` (bTjKG) — props: axis_index=-1

## Workflows

#### WF bTdvt — ButtonClicked em El[gp nome cliente]
- props: event_color="grey"
1. **ToggleElement** [bTdvz] alvo El[rpg historico]

#### WF bTdwD — ButtonClicked em El[btn grava historico por cliente]
- condição: El[gp edita historico por cliente]:get_group_data:is_empty
- props: event_color="blue"
1. **NewThing** [bTdwJ] tipo Tbl.Historico · campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[gp cliente]:get_group_data; cpo.QualVendedor = CurrentUser; cpo.QualUnidade = El[dd unidade agrupado]:get_data
2. **ResetGroup** [bTdzn] alvo El[gp edita historico indi]
3. **ResetInputs** [bTeDB] 
4. **ChangeThing** [bTjIC] campos: cpo.UltimoHistoricoData = Page.Current Date/Time; cpo.UltimoHistoricoMsg = ResultOfStep[bTdwJ] · to_change=ResultOfStep[bTdwJ]:cpo.QualCliente

#### WF bTdwV — ButtonClicked em El[btn edita historico por cliente]
1. **DisplayGroupData** [bTdwb] alvo El[gp edita historico por cliente] · data_source=Ancestor[TableCrossAxis]

#### WF bTdwj — ButtonClicked em El[btn grava historico por cliente]
- condição: El[gp edita historico por cliente]:get_group_data:is_not_empty
- props: event_color="blue"
1. **ChangeThing** [bTdwt] campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[gp cliente]:get_group_data; cpo.QualVendedor = CurrentUser · to_change=El[gp edita historico por cliente]:get_group_data
2. **ResetGroup** [bTeDH] alvo El[gp edita historico por cliente]
3. **ResetInputs** [bTeDF] 

#### WF bTdzL — ButtonClicked em El[btn grava historico individual]
- condição: El[gp edita historico indi]:get_group_data:is_empty
- props: event_color="green"
1. **NewThing** [bTdzR] tipo Tbl.Historico · campos: cpo.Descricao = "{El[ipt descricao historico ind]:get_data}"; cpo.QualCliente = El[src busca clifor individual]:get_data; cpo.QualVendedor = CurrentUser; cpo.QualUnidade = El[dd unidade individual]:get_data
2. **ResetGroup** [bTdzV] alvo El[gp edita historico indi]
3. **ResetInputs** [bTeDM] 
4. **ChangeThing** [bTjIB] campos: cpo.UltimoHistoricoData = Page.Current Date/Time; cpo.UltimoHistoricoMsg = ResultOfStep[bTdzR] · to_change=ResultOfStep[bTdzR]:cpo.QualCliente

#### WF bTdzW — ButtonClicked em El[btn grava historico individual]
- condição: El[gp edita historico indi]:get_group_data:is_not_empty
- props: event_color="green"
1. **ChangeThing** [bTdzi] campos: cpo.Descricao = "{El[ipt descricao historico ind]:get_data}"; cpo.QualCliente = El[src busca clifor individual]:get_data; cpo.QualVendedor = CurrentUser; cpo.QualUnidade = El[dd unidade individual]:get_data · to_change=El[gp edita historico indi]:get_group_data
2. **ResetGroup** [bTdzc] alvo El[gp edita historico indi]

#### WF bTdzo — ButtonClicked em El[btn edita historico individual]
1. **DisplayGroupData** [bTdzu] alvo El[gp edita historico indi] · data_source=Ancestor[TableCrossAxis]

#### WF bTdzv — ButtonClicked em El[Text D]
1. **SetCustomState** [bTeAB] alvo El[Reusable tool.Historico] · value=1, custom_state="custom.var_tabhistorico_"

#### WF bTeAF — ButtonClicked em El[Text E]
1. **SetCustomState** [bTeAL] alvo El[Reusable tool.Historico] · value=2, custom_state="custom.var_tabhistorico_"

#### WF bTeBs — ButtonClicked em El[btn edita historico individual copy]
1. **DeleteThing** [bTeBy] to_delete=Ancestor[TableCrossAxis]
2. **ChangeThing** [bTlEQ] campos: cpo.UltimoHistoricoData = Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]:cpo.QualCliente):last_element:Created Date; cpo.UltimoHistoricoMsg = Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]:cpo.QualCliente):last_element · to_change=Ancestor[TableCrossAxis]:cpo.QualCliente

#### WF bTeCj — ButtonClicked em El[btn edita historico individual copy]
1. **DeleteThing** [bTeCo] to_delete=Ancestor[TableCrossAxis]
2. **ChangeThing** [bTlEV] campos: cpo.UltimoHistoricoData = Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]:cpo.QualCliente):last_element:Created Date; cpo.UltimoHistoricoMsg = Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]:cpo.QualCliente):last_element · to_change=Ancestor[TableCrossAxis]:cpo.QualCliente

#### WF bTiqs — ButtonClicked em El[Icon H]
1. **ResetGroup** [bTiqy] alvo El[gp buscaclientehistorico]

#### WF bTirj — ButtonClicked em El[Icon J]
1. **ResetGroup** [bTirt] alvo El[gp buscaclienteindividual]

#### WF bTjCf — ButtonClicked em El[Text C]
1. **SetCustomState** [bTjCl] alvo El[Reusable tool.Historico] · value=3, custom_state="custom.var_tabhistorico_"

#### WF bTjKS — ButtonClicked em El[gp nome cliente]
1. **ToggleElement** [bTjKX] alvo El[rpg historico]

#### WF bTjKZ — ButtonClicked em El[btn grava historico interação]
- condição: El[gp edita historico por cliente]:get_group_data:is_empty
- props: event_color="purple"
1. **NewThing** [bTjKe] tipo Tbl.Historico · campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[gp cliente]:get_group_data; cpo.QualVendedor = CurrentUser; cpo.QualUnidade = El[dd unidade seminteracao]:get_data
2. **ResetGroup** [bTjKf] alvo El[gp edita historico indi]
3. **ResetInputs** [bTjKj] 
4. **ChangeThing** [bTjKk] campos: cpo.UltimoHistoricoData = Page.Current Date/Time; cpo.UltimoHistoricoMsg = ResultOfStep[bTjKe] · to_change=ResultOfStep[bTjKe]:cpo.QualCliente

#### WF bTjKp — ButtonClicked em El[btn grava historico interação]
- condição: El[gp edita historico por cliente]:get_group_data:is_not_empty
- props: event_color="purple"
1. **ChangeThing** [bTjKr] campos: cpo.Descricao = "{El[ipt descricao historico cli]:get_data}"; cpo.QualCliente = El[gp cliente]:get_group_data; cpo.QualVendedor = CurrentUser; cpo.QualUnidade = El[dd unidade seminteracao]:get_data · to_change=El[gp edita historico por cliente]:get_group_data
2. **ResetGroup** [bTjKv] alvo El[gp edita historico por cliente]
3. **ResetInputs** [bTjKw] 

#### WF bTjLB — ButtonClicked em El[btn edita historico individual copy]
1. **DeleteThing** [bTjLD] to_delete=Ancestor[TableCrossAxis]
2. **ChangeThing** [bTlEP] campos: cpo.UltimoHistoricoData = Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]:cpo.QualCliente):last_element:Created Date; cpo.UltimoHistoricoMsg = Search(Tbl.Historico: cpo.QualCliente equals Ancestor[TableCrossAxis]:cpo.QualCliente):last_element · to_change=Ancestor[TableCrossAxis]:cpo.QualCliente

#### WF bTjLI — ButtonClicked em El[btn edita historico por cliente]
1. **DisplayGroupData** [bTjLN] alvo El[gp edita historico por cliente] · data_source=Ancestor[TableCrossAxis]

#### WF bTjmt — InputChanged em El[rad tipoclifor]
1. **SetCustomState** [bTjmz] alvo El[Reusable tool.Historico] · value=1, custom_state="custom.var_tabhistorico_"
2. **ResetGroup** [bTkBf] alvo El[gp vendedor] · SÓ SE This:get_data:equals(opt.TipoCliFor.Fornecedor)

#### WF bUEmJ — ButtonClicked em El[Group S]
1. **SetCustomState** [bUEmP] alvo El[Reusable tool.Historico] · value="1", custom_state="custom.var_modeloemail_"

#### WF bUEmU — ButtonClicked em El[Group UZ]
1. **SetCustomState** [bUEma] alvo El[Reusable tool.Historico] · value="2", custom_state="custom.var_modeloemail_"

#### WF bUEmf — ButtonClicked em El[Group BZZ]
1. **SetCustomState** [bUEml] alvo El[Reusable tool.Historico] · value="4", custom_state="custom.var_modeloemail_"

#### WF bUEmn — ButtonClicked em El[Group CZZ]
1. **SetCustomState** [bUEmt] alvo El[Reusable tool.Historico] · value="5", custom_state="custom.var_modeloemail_"

#### WF bUEmy — ButtonClicked em El[Group AZZ]
1. **SetCustomState** [bUEnE] alvo El[Reusable tool.Historico] · value="3", custom_state="custom.var_modeloemail_"

#### WF bUEnJ — ButtonClicked em El[Group DZZ]
1. **SetCustomState** [bUEnP] alvo El[Reusable tool.Historico] · value="6", custom_state="custom.var_modeloemail_"

#### WF bUEnR — ButtonClicked em El[Group GZZ]
1. **SetCustomState** [bUEnX] alvo El[Reusable tool.Historico] · value="7", custom_state="custom.var_modeloemail_"

#### WF bUEnc — PageLoaded
1. **SetCustomState** [bUEni] alvo El[Reusable tool.Historico] · value="1", custom_state="custom.var_modeloemail_"

#### WF bUErd — InputChanged em El[Dropdown H]
1. **ChangeThing** [bUErj] campos: cpo.EmailPrincipal = "{This:get_data}" · to_change=Search(Tbl.ContatoCliFor: cpo.QualGrupoCliFor equals Ancestor[TableCrossAxis]):first_element
2. **Plugin[1658328157117x953686184769617900]/AAT** [bUErl] AAF="Email principal para contato salvo com sucesso"

#### WF bUEcf0 — ButtonClicked em El[Icon T]
1. **ResetGroup** [bUEck0] alvo El[gp buscaclientehistorico]

#### WF bUEcp0 — ButtonClicked em El[gp nome cliente]
- props: event_color="grey"

#### WF bUEgZ0 — ButtonClicked em El[Button B]
1. **ToggleElement** [bUEgf0] alvo El[Group Historico]
2. **ToggleElement** [bUEgh0] alvo El[Group Email]

#### WF bUEgm0 — ButtonClicked em El[Button Email]
1. **ToggleElement** [bUEgs0] alvo El[Group Historico]
2. **ToggleElement** [bUEgx0] alvo El[Group Email]

#### WF bUEgz0 — ButtonClicked em El[Button D]
1. **ScheduleAPIEvent** [bUEhF0] date=Page.Current Date/Time, api_event="bTnvb0", _wf_param_to="{El[ipt qual email]:get_data:cpo.Email}", _wf_param_body="{El[ipt email]:get_data}", _wf_param_reply="{CurrentUser:cpo.EmailContato}", _wf_param_sender="[Megabox] {Text("{CurrentUser:cpo.NomeModelo:split_by(separator=" "):first_element:to_uppercase}")}", _wf_param_subject="{El[ipt assunto]:get_data}"
2. **NewThing** [bUEjC0] tipo Tbl.Historico · campos: cpo.QualCliente = El[Reusable tool.Historico]:custom.id_clifor_; cpo.Descricao = "{El[ipt email]:get_data}"; cpo.QualVendedor = El[dd carteira 2 copy]:get_data
3. **ChangeThing** [bUEjH0] campos: cpo.UltimoHistoricoData = Page.Current Date/Time · to_change=El[Reusable tool.Historico]:custom.id_clifor_
4. **Plugin[1658328157117x953686184769617900]/AAT** [bUEhu0] AAF="Enviado com sucesso"

#### WF bUEhK0 — ButtonClicked em El[icon email]
1. **SetCustomState** [bUEip0] alvo El[Reusable tool.Historico] · value=Ancestor[TableCrossAxis], custom_state="custom.id_clifor_"

#### WF bUEhb0 — ButtonClicked em El[Button E]
1. **ChangePage** [bUEhh0] alvo El[Página vendas]

#### WF bUEiY0 — ButtonClicked em El[Button A]
1. **ChangePage** [bUEie0] alvo El[Página historico_full] · data_to_send=Text("{∅}")

#### WF bUEir0 — ButtonClicked em El[gp cliente]
1. **SetCustomState** [bUEix0] alvo El[Reusable tool.Historico] · value=Ancestor[TableCrossAxis], custom_state="custom.id_clifor_"
