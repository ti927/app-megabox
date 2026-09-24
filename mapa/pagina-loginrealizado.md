# Pagina: `loginrealizado` (bUCSX)


Resumo: 4 elementos · 1 workflows · 4 ações · 0 condicionais · 0 estados customizados
Elementos por tipo: Text 2, Group 1, Image 1

## Árvore de elementos

- **Group** `Group text content` (bUCSY)
  - **Image** `Image A` (bUCSj) — props: src="https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1742928066113x626363767410796700/megabox.png", use_aspect_ratio=False
  - **Text** `Text A` (bUCSd) — text: "Login Realizado" · props: font_alignment="center", responsive_alignment="left"
  - **Text** `Text B` (bUCSZ) — text: "Essa página fechará em alguns segundos" · props: font_alignment="center", responsive_alignment="left"

## Workflows

#### WF bUCSv — ConditionTrue
- condição: UrlParam("code" as None):is_not_empty
- props: workflow_disabled=False
1. **apiconnector2-bUCHx.bUCQn** [bUCSx] params_code="{UrlParam("code" as None)}", params_redirect_uri="{Page.Website Home:contains("test"):format_boolean(formatting_for_true="https://grupomegabox.bubbleapps.io/version-test/{Page.Current Page Name}", formatting_for_false="https://grupomegabox.bubbleapps.io/{Page.Current Page Name}")}"
2. **ChangeThing** [bUCTB] campos: cpo.ValorTexto1 = "{ResultOfStep[bUCSx]:_api_c2_body.access_token}"; cpo.ValorDataHora1 = Page.Current Date/Time; cpo.ValorNumero = ResultOfStep[bUCSx]:_api_c2_body.expires_in; cpo.ValorTexto2 = "{ResultOfStep[bUCSx]:_api_c2_body.token_type}"; cpo.ValorDataHora2 = Page.Current Date/Time:plus_seconds(ResultOfStep[bUCSx]:_api_c2_body.expires_in) · to_change=Search(Tbl.ConfigSistema: cpo.CodigoConfig equals 21):first_element
3. **ScheduleAPIEvent** [bUCTD] date=Page.Current Date/Time:plus_seconds(ResultOfStep[bUCSx]:_api_c2_body.expires_in), api_event="bUCKC"
4. **Plugin[1488796042609x768734193128308700]/AAg** [bUCTC] AAh="if (window.opener) {⏎    // Aguarda 2000 milissegundos (2 segundos) antes de executar a função⏎    setTimeout(function() {⏎        window.close();⏎    }, 2000);⏎}"
