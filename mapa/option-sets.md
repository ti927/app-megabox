# Option sets


## Opt.AçãoCliFor (`opt_a__oclifor`) — 6 opções
Atributos: Text Titulo (text)
- Novo Cliente (`criar_cliente`) — {"text_titulo": "Novo "}
- Novo Fornecedor (`novo_fornecedor0`)
- Novo Endereço CliFor (`novo_endere_o`) — {"text_titulo": "Novo Endereço "}
- Edita Endereço CliFor (`edita_endere_o`) — {"text_titulo": "Edita Endereço "}
- Novo Contato Cliente (`novo_contato`) — {"text_titulo": "Novo Contato "}
- Edita Contato Cliente (`edita_contato`) — {"text_titulo": "Edita Contato "}

## Opt.Ações (`opt_a__oor_amento`) — 11 opções
- Nova Proposta (`novaproposta`)
- Edita Proposta (`editaproposta`)
- Exibe Proposta (`exibe_proposta`)
- Novo Produto (`novo_produto`)
- Edita Produto (`edita_produto`)
- Nova Cotação (`nova_cota__o`)
- Edita Cotação (`edita_cota__o`)
- Novo Pedido (`novo_pedido`)
- Edita Pedido (`edita_pedido`)
- Cancela Pedido (`cancela_pedido`)
- Cancela Entrega (`cancela_entrega`)

## Opt.CaptacaoCliente (`opt_captacaocliente`) — 5 opções
- Rd (`rd`)
- Telefone (`telefone`)
- Email (`email`)
- Digisac (`digisac`)
- N/A (`n_a`)

## Opt.CotacaoStatus (`opt_orcamentostatus`) — 3 opções
- Em andamento (`aberto`)
- Parado (`or_ando`)
- Cancelado (`negociando`)

## Opt.DeptoUsuario (`opt_deptousuario`) — 4 opções
Atributos: Descrição (text)
- Administrativo (`diretoria`) — {"descri__o": "RH, Compras, TI, Jurídico, Processos, etc."}
- Financeiro (`financeiro`) — {"descri__o": "Finanças, Contábil, Op. de Caixa, Contas Pagar/Receber, Cobrança, etc."}
- Comercial (`licita__o`) — {"descri__o": "Vendas, Marketing, Publicidade, P&D, Qualidade e Satisfação, etc."}
- Operação (`geral`) — {"descri__o": "Estoque, Logistica, Conferência, Balanço, Carga/Descarga, Frota, etc."}

## Opt.EmpresaMegabox (`opt_empresamegabox`) — 2 opções
Atributos: email (text), cnpj (text), razão (text), endereço (text), telefone (text), LogoImagem (image), logo horizontal (text)
- Megabox (`megabox`) — {"email": "contato@megabox.com.br", "cnpj": "39.667.615/0001-01", "raz_o": "Mega Box Logistica Ltda", "endere_o": "Rua Waldomiro Correia Neto, 814, Sala 102, Jd. Alexandrina\nAnápolis/GO\n75060-473", "telefone": "(62) 3509-4670", "logoimagem": "//fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f17429
- Paletes Brasil (`paletes_brasil`) — {"email": "contato@paletesbrasil.com.br", "cnpj": "000.000.000/0000-00", "raz_o": "Paletes Brasil Logística Ltda", "endere_o": "Logradouro, 000, Bairro\nAnápolis/GO\n00000-000", "telefone": "(62) 3509-4670", "logo_horizontal": "https://fa5a797a4babb48fa713bd6f88501a84.cdn.bubble.io/f1717533256789x25

## Opt.Etapas (`opt_etapas`) — 7 opções
Atributos: EntregaConcluida (boolean)
- Cotação (`cota__o`) — {"concluido": false}
- Pedir (`pedido`) — {"concluido": false}
- Pedido (`pedido0`) — {"concluido": false}
- Em Entrega (`entrega`) — {"concluido": false}
- Financeiro (`financeiro`) — {"concluido": true}
- Concluído (`conclu_do`) — {"concluido": true}
- Cancelado (`cancelado`) — {"concluido": true}

## Opt.FiltrosGmail (`opt_filtrosgmail`) — 9 opções
Atributos: Labels (text)
- Caixa de saída (`is_sent`) — {"labels": "is:sent"}
- Caixa de entrada (`is_inbox`) — {"labels": "is:inbox"}
- Lixeira (`is_trash`) — {"labels": "is:trash"}
- Caixa de Spam (`is_spam`) — {"labels": "is:spam"}
- Só não lidos (`is_unread`) — {"labels": "is:unread"}
- Só lidos (`is_read`) — {"labels": "is:read"}
- Mais recentes (1dia) (`newer_than_1d`) — {"labels": "newer_than:1d"}
- Mais velhos (1ano) (`older_than_1y`) — {"labels": "older_than:1y"}
- Erros de envio (`from_mailer_daemon`) — {"labels": "from:mailer-daemon"}

## Opt.FormaPgto (`opt_formapgto`) — 4 opções
- Pix (`pix`)
- Boleto (`boleto`)
- Transferencia (`transferencia`)
- Antecipação (`antecipa__o`)

## Opt.GrupoDeConfigsSistema (`cpo_grupodeconfigssistema`) — 2 opções
- Permissões de Acesso (`permiss_es_de_acesso`)
- Cópia de emails (`c_pia_de_emails`)

## Opt.MenuConfig (`opt_submenu`) — 6 opções
Atributos: Ordem (number), Headline (text), Hierarquia (number)
- Configurações de Usuário (`sub_dashboard_2`) — {"ordem": 1, "headline": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ", "qualmenu": "configura__es", "opt_hierarquia": 4}
- Configurações de Sistema (`configura__es_sistema`) — {"ordem": 2, "qualmenu": "configura__es", "opt_hierarquia": 1}
- Cadastro Usuários (`cadastro_usu_rios`) — {"ordem": 3, "qualmenu": "configura__es", "opt_hierarquia": 2, "perfilmenorigual": "diretoria"}
- Cadastro Produtos (`cadastro_produtos`) — {"ordem": 4, "qualmenu": "configura__es", "opt_hierarquia": 3}
- Cliente / Fornecedor (`cadastro_clientes`) — {"ordem": 5, "qualmenu": "configura__es", "opt_hierarquia": 3}
- FollowUp de Pedidos (`followup_de_pedidos`) — {"ordem": 6, "opt_hierarquia": 2}

## Opt.MenuPaginas (`opt_menu`) — 7 opções
Atributos: ordem (number), página (text), hierarquia (number), DepartamentosAcessiveis (list.option.opt_deptousuario)
- Inicio (`inicio`) — {"ordem": 1, "p_gina": "inicio", "headline": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ", "hierarquia": 4, "departamentosacessiveis": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Fluxo de Vendas (`licita__o`) — {"ordem": 2, "p_gina": "vendas", "headline": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ", "hierarquia": 4, "departamentosacessiveis": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Fluxo Financeiro (`financeiro`) — {"ordem": 3, "p_gina": "financeiro", "headline": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ", "hierarquia": 2, "departamentosacessiveis": {"0": "financeiro", "1": "diretoria"}}
- Metas & Vendas (`dashboard`) — {"ordem": 5, "p_gina": "metas", "headline": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ", "hierarquia": 2, "departamentosacessiveis": {"0": "diretoria"}}
- Relatórios (`relat_rios`) — {"p_gina": "relatorios"}
- Manutenção (`manuten__o`) — {"ordem": 6, "p_gina": "rotinas", "hierarquia": 1}
- Suporte de Vendas & Nps (`sac___nps`) — {"p_gina": "sac"}

## Opt.MotivoArquivamento (`opt_motivoarquivamento`) — 7 opções
- Preço alto (`pre_o_alto`)
- Pesquisa de preço (`pesquisa_de_pre_o`)
- Demora no atendimento (`demora_no_atendimento`)
- Não aprovado pelo financeiro (`n_o_aprovado_pelo_financeiro`)
- Fechou com outro fornecedor (`fechou_com_outro_fornecedor`)
- Sem demanda (`sem_demanda`)
- Erro ou mudança de dados (`erro_ou_mudan_a_de_dados`)

## Opt.OrdenarCampos (`opt_ordenarcampos`) — 2 opções
Atributos: Descending (boolean), Local (text), IconFill (text), IconName (text), IconColor (text), IconStyle (text), NomeCampo (text)
- Recente (`local`) — {"descending": true, "local": "CadastroClifor", "iconfill": "yes", "iconname": "today", "iconcolor": "#444746", "iconstyle": "outlined", "nomecampo": "Created Date"}
- Alfabética (`nomecampo`) — {"descending": false, "local": "CadastroClifor", "iconfill": "yes", "iconname": "sort", "iconcolor": "#444746", "iconstyle": "outlined", "nomecampo": "cpo.NomeCliFor"}

## Opt.ParcelasReceber (`opt_parcelasreceber`) — 22 opções
Atributos: DiasPrazoNumero (number)
- 0dd (`0x`) — {"ordem": 0, "dd___dd": "0dd", "diasprazotexto": "0dd", "diasprazonumero": 0, "qtdparcelasnumero": 0}
- 7dd (`7_`) — {"diasprazonumero": 7}
- 10dd (`1x`) — {"ordem": 1, "dd___dd": "10 dd", "diasprazotexto": "10dd", "diasprazonumero": 10, "qtdparcelasnumero": 1}
- 12dd (`12dd`) — {"diasprazonumero": 12}
- 14dd (`14_`) — {"diasprazonumero": 14}
- 15dd (`2x`) — {"dd___dd": "10 / 15 dd", "diasprazotexto": "15dd", "diasprazonumero": 15, "qtdparcelasnumero": 2}
- 20dd (`20dd`) — {"diasprazonumero": 20}
- 21dd (`3x`) — {"dd___dd": "10 / 15 / 21 dd", "diasprazotexto": "21dd", "diasprazonumero": 21, "qtdparcelasnumero": 3}
- 25dd (`25dd`) — {"diasprazonumero": 25}
- 28dd (`5x`) — {"diasprazotexto": "28dd", "diasprazonumero": 28, "qtdparcelasnumero": 4}
- 30dd (`4x`) — {"dd___dd": "10 / 15 / 21 / 30 dd", "diasprazotexto": "30dd", "diasprazonumero": 30, "qtdparcelasnumero": 5}
- 35dd (`35_`) — {"diasprazonumero": 35}
- 40dd (`40_`) — {"diasprazonumero": 40}
- 42dd (`42_`) — {"diasprazonumero": 42}
- 45dd (`45_`) — {"diasprazonumero": 45}
- 49dd (`49dd`)
- 50dd (`50dd`) — {"diasprazonumero": 50}
- 60dd (`60_`) — {"diasprazonumero": 60}
- 70dd (`70dd`) — {"diasprazonumero": 70}
- 90dd (`90_`) — {"diasprazonumero": 90}
- 12dd (`12dd`) — {"deleted": true} **(excluída)**
- 120dd (`120_`) — {"diasprazonumero": 120}

## Opt.PartesDoSistema (`opt_localdosistema`) — 10 opções
- Cadastro de clientes (`cadastro_de_clientes`)
- Cadastro de usuário (`cadastro_de_usu_rio`)
- Cadastro de produto (`cadastro_de_produto`)
- Etapa de Cotação (`cota__o`)
- Etapa de Proposta (`proposta`)
- Etapa de Pedido (`pedido`)
- Etapa de Entrega (`entrega`)
- Etapa de Financeiro (`financeiro`)
- Kanban de vendas (`kanban_de_vendas`)
- Histórico de clientes (`hist_rico_de_clientes`)

## Opt.PerfilUsuario (`opt_perfilusuario`) — 4 opções
Atributos: Hierarquia (number)
- Diretor (`diretoria`) — {"hierarquia": 1}
- Gerente (`gerencia`) — {"hierarquia": 2}
- Analista (`colaborador`) — {"hierarquia": 3}
- Operador (`operador`) — {"hierarquia": 4}

## opt.prioridade (`opt_prioridade`) — 3 opções
Atributos: alta - deleted (text), baixa - deleted (text), média - deleted (text)
- Baixa (`baixa`)
- Média (`m_dia`)
- Alta (`alta`)

## Opt.ProdutosCondicao (`opt_produtoscondicao`) — 3 opções
- Novo (`novo`)
- Usado (`usado`)
- Seminovo (`seminovo`)

## Opt.ProdutosLinhas (`opt_produtoslinhas`) — 4 opções
- Primeira Linha (`primeira_linha`)
- Segunda Linha (`segunda_linha`)
- Terceira Linha (`terceira_linha`)
- Usado (`usado`)

## opt.RegimeTributario (`opt_regimetributario`) — 3 opções
- Lucro Real/Presumido (`lucro_real`)
- Simples Nacional (`simples_nacional`)
- Mei/Autonomo (`mei___autonomo`)

## Opt.SimNão (`opt_simn_o`) — 3 opções
Atributos: icon_color (text), Boolean (boolean), icon_fill (text), icon_mode (text), icon_name (text), icon_state (text), Ativo/Inativo (text)
- Ativos (`sim`) — {"icon_color": "#444746", "boolean": true, "icon_fill": "yes", "icon_mode": "outlined", "icon_name": "thumb_up", "icon_state": "yes", "ativo_inativo": "Ativos"}
- Inativos (`n_o`) — {"icon_color": "#444746", "boolean": false, "icon_fill": "yes", "icon_mode": "outlined", "icon_name": "thumb_down", "icon_state": "no", "ativo_inativo": "Inativos"}
- Todos (`todos`) — {"icon_color": "#444746", "icon_fill": "yes", "icon_mode": "outlined", "icon_name": "thumbs_up_down", "icon_state": "null", "ativo_inativo": "Todos"}

## Opt.Smtp (`opt_smtp`) — 3 opções
Atributos: smtp (text), user (text), porta - deleted (text), senha (text), porta (number), security (text)
- smtp (`smtp`) — {"deleted": true} **(excluída)**
- port (`port`) — {"deleted": true} **(excluída)**
- GmailMegabox (`gmail`) — {"smtp": "smtp.gmail.com", "user": "noreply.megabox@gmail.com", "porta": "587", "senha": "qzgc qaql veid eehv", "porta0": 587, "security": "TSL"}

## Opt.StatusBug (`opt_statusbug`) — 4 opções
Atributos: Ordem (number)
- Enviado (`enviado`) — {"ordem": 1}
- Analisado (`analisado`) — {"ordem": 2}
- Corrigido (`corrigido`) — {"ordem": 3}
- Respondido (`respondido`) — {"ordem": 4}

## opt.StatusChamado (`opt_statuslure`) — 4 opções
Atributos: em aberto - deleted (text), resolvido - deleted (text), em análise - deleted (text), aguardando fornecedor - deleted (text)
- Em aberto (`em_aberto`)
- Em análise (`em_an_lise`)
- Pendente de informações (`aguardando_fornecedor`)
- Resolvido (`resolvido`)

## Opt.StatusFinanceiro (`opt_statusfinanceiro`) — 4 opções
- A receber (`em_aberto`)
- Recebido (`recebido`)
- A pagar (`a_pagar`)
- Pago (`pago`)

## Opt.TipoAnexo (`opt_anexosclifor`) — 26 opções
Atributos: QualCadastro (text), DeptosVisualizam (list.option.opt_deptousuario)
- Alvará de Funcionamento (`alvar__de_funcionamento`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Cartão CNPJ (`cart_o_cnpj`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Certificação IBAMA (`certificado_ibama`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Certificação Bombeiros (`certifica__o_bombeiros`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Contrato Social (`contrato_social`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Dados Bancários (`dados_banc_rios`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Inscrição Estadual (`inscri__o_estadual`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Inscrição Municipal (`inscri__o_municipal`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Contrato de parceria (`contrato_de_parceria`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "financeiro", "1": "diretoria"}}
- Dados cadastrais (`dados_cadastrais`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Dispensa (`dispensa`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Sintegra (`sintegra`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Regime tributário (`regime_tribut_rio`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- RG (`documento_pessoal`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Contracheque (`contracheque`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Contratos (`contratos`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Outros Documentos (`outros`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- CPF (`cpf`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Comprovante Endereço (`comprovante_endere_o`) — {"qualcadastro": "Usuário"}
- Título de Eleitor (`t_tulo_de_eleitor`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Exames (`exames`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Carteira de Trabalho (`carteira_de_trabalho`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- PIS (`pis`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Conta Bancária (`conta_banc_ria`) — {"qualcadastro": "Usuário", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- Fotos de Produtos (`fotos_de_produtos`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}
- CND (`cnd`) — {"qualcadastro": "Cliente/Fornecedor", "deptosvisualizam": {"0": "licita__o", "1": "financeiro", "2": "geral", "3": "diretoria"}}

## opt.TipoCliFor (`opt_tipoclifor`) — 2 opções
- Cliente (`cliente`)
- Fornecedor (`fornecedor`)

## Opt.TipoFrete (`opt_tipofrete`) — 3 opções
- FOB (`fob`)
- CIF Informado (`cif`)
- CIF Incluso (`cif_incluso`)

## Opt.TipoMeta (`opt_tipometa`) — 2 opções
- Regular (`regular`)
- Substituição (`substitui__o`)

## Opt.TipoOcorrencia (`opt_tipoocorrencia`) — 6 opções
- Atraso (`atraso`)
- Divergência de Pedido (`diverg_ncia_de_pedido`)
- Pedido incompleto (`falta_de_material`)
- Financeiro (`financeiro`)
- Qualidade (`qualidade`)
- Outro (`outro`)

## Opt.TipoPesquisa (`opt_tipopesquisa`) — 3 opções
- SAC (`sac`)
- NPS (`nps`)
- Pós-Venda (`p_s_venda`)

## Opt.TipoPessoa (`opt_tipopessoa`) — 2 opções
- cpf (`cpf`)
- cnpj (`cnpj`)

## Opt.TiposData (`opt_entregavcto`) — 6 opções
- Data entrega (`data_entrega`)
- Data vencimento (`data_vencimento`)
- Data pedido (`data_pedido`)
- Data NF Megabox (`data_baixa`)
- Data recebto banco (`data_recebimento`)
- Data baixa sistema (`data_baixa0`)

## Opt.TipoTelefone (`opt_tipotelefone`) — 3 opções
- Sac (`sac`)
- Fixo (`fixo`)
- Celular (`celular`)

## Opt.UFs (`opt_ufs`) — 27 opções
Atributos: UF Texto (text)
- AC (`ac`) — {"uf_texto": "AC"}
- AL (`al`) — {"uf_texto": "AL"}
- AM (`am`) — {"uf_texto": "AM"}
- AP (`ap`) — {"uf_texto": "AP"}
- BA (`ba`) — {"uf_texto": "BA"}
- CE (`ce`) — {"uf_texto": "CE"}
- DF (`df`) — {"uf_texto": "DF"}
- ES (`es`) — {"uf_texto": "ES"}
- GO (`go`) — {"uf_texto": "GO"}
- MA (`ma`) — {"uf_texto": "MA"}
- MT (`mt`) — {"uf_texto": "MT"}
- MS (`ms`) — {"uf_texto": "MS"}
- MG (`mg`) — {"uf_texto": "MG"}
- PA (`pa`) — {"uf_texto": "PA"}
- PB (`pb`) — {"uf_texto": "PB"}
- PR (`pf`) — {"uf_texto": "PR"}
- PE (`pe`) — {"uf_texto": "PE"}
- PI (`pi`) — {"uf_texto": "PI"}
- RN (`rn`) — {"uf_texto": "RN"}
- RS (`rs`) — {"uf_texto": "RS"}
- RJ (`rj`) — {"uf_texto": "RJ"}
- RO (`ro`) — {"uf_texto": "RO"}
- RR (`rr`) — {"uf_texto": "RR"}
- SC (`sc`) — {"uf_texto": "SC"}
- SP (`sp`) — {"uf_texto": "SP"}
- SE (`se`) — {"uf_texto": "SE"}
- TO (`to`) — {"uf_texto": "TO"}
