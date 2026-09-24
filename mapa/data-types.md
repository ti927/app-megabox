# Data types (todos, inclusive os não expostos na Data API)


## Tbl.Anexos (`tbl_anexos`) — 5 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Anexo | `cpo_anexo_file` | `file` |  |
| cpo.QualUsuario | `cpo_qualusuario_user` | `user` |  |
| cpo.QualClifor | `cpo_qualclifor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualEndereco | `cpo_qualendereco_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.TipoAnexo | `cpo_tipoanexoclifor_option_opt_anexosclifor` | `option.opt_anexosclifor` |  |

## Tbl.BugReport (`cpo_bugreport`) — 6 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.AnexoUnico | `cpo_anexo_file` | `file` |  |
| cpo.Titulo | `cpo_titulo_text` | `text` |  |
| cpo.Descricao | `cpo_descricao_text` | `text` |  |
| cpo.AnexosLista | `cpo_anexoslista_list_file` | `list.file` |  |
| cpo.StatusBug | `cpo_statusbug_option_opt_statusbug` | `option.opt_statusbug` |  |
| cpo.ParteDoSistema | `cpo_partedosistema_option_opt_localdosistema` | `option.opt_localdosistema` |  |

## Tbl.Chamado (`tbl_chamado`) — 7 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| QualResponsável | `qualrespons_vel_user` | `user` |  |
| cpo.numeroprotocolo | `cpo_numeroprotocolo_text` | `text` |  |
| QualPedido | `qualpedido_custom_tbl_pedidos` | `custom.tbl_pedidos` |  |
| cpo.prioridade | `cpo_prioridade_option_opt_prioridade` | `option.opt_prioridade` |  |
| cpo.statuschamado | `cpo_statuschamado_option_opt_statuslure` | `option.opt_statuslure` |  |
| cpo.tipoocorrencia | `cpo_tipoocorrencia_option_opt_tipoocorrencia` | `option.opt_tipoocorrencia` |  |
| QualEndereçoCliFor | `qualendere_oclifor_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |

## Tbl.cnpjformatado (`tbl_cnpjformatado`) — 2 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cnpj formatado | `cnpj_formatado_text` | `text` |  |
| qual grupoclifor | `qual_grupoclifor_custom_tbl_clientes` | `custom.tbl_clientes` |  |

## Tbl.Cobrancas (`tbl_cobrancas`) — 6 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.AnexoFile | `cpo_anexofile_file` | `file` |  |
| cpo.AnexoLink | `cpo_anexolink_text` | `text` |  |
| cpo.NumeroCobranca | `cpo_numerocobranca_number` | `number` |  |
| cpo.QualFornecedor | `cpo_qualfornecedor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QuaisEntregas - deleted | `cpo_quaisentregas_list_custom_tbl_entregas` | `list.custom.tbl_entregas` | sim |
| cpo.QuaisContasReceber | `cpo_quaiscontasreceber_list_custom_tbl_contasreceber` | `list.custom.tbl_contasreceber` |  |

## Tbl.ConfigSistema (`cpo_configsistema`) — 15 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.ValorBoolean1 | `cpo_bolean_boolean` | `boolean` |  |
| cpo.NomeConfig | `cpo_nomeconfig_text` | `text` |  |
| cpo.ValorTexto1 | `cpo_valortexto_text` | `text` |  |
| cpo.ValorTexto2 | `cpo_valortexto2_text` | `text` |  |
| cpo.ValorDataHora1 | `cpo_valordatahora_date` | `date` |  |
| cpo.CodigoConfig | `cpo_codigoconfig_number` | `number` |  |
| cpo.ValorDataHora2 | `cpo_valordatahora2_date` | `date` |  |
| cpo.ValorBoolean2 | `cpo_valorboolean2_boolean` | `boolean` |  |
| cpo.QuaisUsuarios | `cpo_quaisusuarios_list_user` | `list.user` |  |
| cpo.QualPagina | `cpo_qualpagina_option_opt_menu` | `option.opt_menu` |  |
| cpo.ValorNumero | `cpo_contadorrecibosrecebimento_number` | `number` |  |
| cpo.QualMenuConfig | `cpo_qualmenuconfig_option_opt_submenu` | `option.opt_submenu` |  |
| cpo.QuaisDeptos | `cpo_quaisdeptos_list_option_opt_deptousuario` | `list.option.opt_deptousuario` |  |
| cpo.QuaisPerfis | `cpo_quaisperfis_list_option_opt_perfilusuario` | `list.option.opt_perfilusuario` |  |
| cpo.QualGrupoConfig | `cpo_qualgrupoconfig_option_cpo_grupodeconfigssistema` | `option.cpo_grupodeconfigssistema` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_bolean_boolean", "1": "cpo_codigoconfig_text", "2": "cpo_nomeconfig_text", "3": "cpo_quaisdeptos_list_option_opt_deptousuario", "4": "cpo_quaisperfis_list_option_opt_perfilusuario", "5": "cpo_quaisusuarios_list

## Tbl.ContasPagar (`tbl_contasreceber1`) — 41 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.QualVendedor | `cpo_vendedor_user` | `user` |  |
| cpo.DataBaixaSistema | `cpo_databaixa_date` | `date` |  |
| cpo.DataPedido | `cpo_datapedido_date` | `date` |  |
| cpo.QuemBaixou | `cpo_quembaixou_user` | `user` |  |
| cpo.DataEntrega | `cpo_dataentrega_date` | `date` |  |
| cpo.DataEstorno | `cpo_dataestorno_date` | `date` |  |
| cpo.Importado | `cpo_importado_boolean` | `boolean` |  |
| cpo.NumeroPedido | `cpo_numeropedido_text` | `text` |  |
| cpo.QuemEstornou | `cpo_quemestornou_user` | `user` |  |
| cpo.CobrancaNum | `cpo_cobrancanum_number` | `number` |  |
| cpo.ValorUnit | `cpo_valoraberto_number` | `number` |  |
| cpo.AnexoNfMegabox | `cpo_anexonfmegabox_file` | `file` |  |
| cpo.DataVencimento | `cpo_datavencimento_date` | `date` |  |
| cpo.ValorTotal | `cpo_valorreceber_number` | `number` |  |
| cpo.DataPrevEntrega | `cpo_datapreventrega_date` | `date` |  |
| cpo.NumNfFornecedor | `cpo_numnffornecedor_text` | `text` |  |
| cpo.ValorComissao | `cpo_valorcomissao_number` | `number` |  |
| cpo.Qtd | `cpo_valorrecebido_number` | `number` |  |
| cpo.DataNfMegabox | `cpo_datanfrecebimento_date` | `date` |  |
| cpo.NumNfMegabox | `cpo_numnotarecebimento_text` | `text` |  |
| cpo.MotivoAlteraComissao | `cpo_motivoalteracomissao_text` | `text` |  |
| cpo.ValorComissaoUnitario | `cpo_valorcomissaounitario_number` | `number` |  |
| cpo.QualPedido | `cpo_qualpedido_custom_tbl_pedidos` | `custom.tbl_pedidos` |  |
| cpo.DataRecebimentoBancocaixa | `cpo_datarecebimentobancocaixa_date` | `date` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualEntrega | `cpo_qualentrega_custom_tbl_entregas` | `custom.tbl_entregas` |  |
| opt.MotivoAlterarComissao - deleted | `opt_motivoalterarcomissao_list_text` | `list.text` |  |
| cpo.QualCotacao | `cpo_qualcotacao_custom_tbl_orcamento` | `custom.tbl_orcamento` |  |
| cpo.QualCobranca | `cpo_qualcobranca_custom_tbl_cobrancas` | `custom.tbl_cobrancas` |  |
| cpo.QualProposta | `cpo_qualproposta_custom_tbl_propostas` | `custom.tbl_propostas` |  |
| cpo.QualFornecedor | `cpo_qualfornecedor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualPrazo | `cpo_qualprazo_option_opt_parcelasreceber` | `option.opt_parcelasreceber` |  |
| cpo.QualOrigem | `cpo_qualorigem_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QdtParcelas | `cpo_qdtparcelas_option_opt_parcelasreceber` | `option.opt_parcelasreceber` |  |
| cpo.QuaisEntregas | `cpo_quaisentregas_list_custom_tbl_entregas` | `list.custom.tbl_entregas` |  |
| cpo.QualDestino | `cpo_qualdestino_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QuaisCobrancas | `cpo_quaiscobrancas_list_custom_tbl_cobrancas` | `list.custom.tbl_cobrancas` |  |
| cpo.QuaisHistoricos | `cpo_quaishistoricos_list_custom_tbl_historico` | `list.custom.tbl_historico` |  |
| cpo.StatusFinanceiro | `cpo_statusfinanceiro_option_opt_statusfinanceiro` | `option.opt_statusfinanceiro` |  |
| cpo.QualMetaFechada | `cpo_qualmetafechada_custom_tbl_orcfornecedorescotacao` | `custom.tbl_orcfornecedorescotacao` |  |
| cpo.QualOrcamentoFornecedor | `cpo_qualorcamentofornecedor_custom_tbl_orcamentfornecedores` | `custom.tbl_orcamentfornecedores` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_datavencimento_date"}, "view_attachments": true}

## Tbl.ContasReceber (`tbl_contasreceber`) — 40 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.QualVendedor | `cpo_vendedor_user` | `user` |  |
| cpo.DataBaixaSistema | `cpo_databaixa_date` | `date` |  |
| cpo.DataPedido | `cpo_datapedido_date` | `date` |  |
| cpo.QuemBaixou | `cpo_quembaixou_user` | `user` |  |
| cpo.DataEntrega | `cpo_dataentrega_date` | `date` |  |
| cpo.DataEstorno | `cpo_dataestorno_date` | `date` |  |
| cpo.Arquivado | `cpo_arquivado_boolean` | `boolean` |  |
| cpo.Importado | `cpo_importado_boolean` | `boolean` |  |
| cpo.NumeroPedido | `cpo_numeropedido_text` | `text` |  |
| cpo.QuemEstornou | `cpo_quemestornou_user` | `user` |  |
| cpo.CobrancaNum | `cpo_cobrancanum_number` | `number` |  |
| cpo.ValorUnit | `cpo_valoraberto_number` | `number` |  |
| cpo.AnexoNfMegabox | `cpo_anexonfmegabox_file` | `file` |  |
| cpo.DataVencimento | `cpo_datavencimento_date` | `date` |  |
| cpo.ValorTotal | `cpo_valorreceber_number` | `number` |  |
| cpo.DataPrevEntrega | `cpo_datapreventrega_date` | `date` |  |
| cpo.NumNfFornecedor | `cpo_numnffornecedor_text` | `text` |  |
| cpo.ValorComissao | `cpo_valorcomissao_number` | `number` |  |
| cpo.Qtd | `cpo_valorrecebido_number` | `number` |  |
| cpo.DataNfMegabox | `cpo_datanfrecebimento_date` | `date` |  |
| cpo.NumNfMegabox | `cpo_numnotarecebimento_text` | `text` |  |
| cpo.MotivoAlteraComissao | `cpo_motivoalteracomissao_text` | `text` |  |
| cpo.ValorComissaoUnitario | `cpo_valorcomissaounitario_number` | `number` |  |
| cpo.QualPedido | `cpo_qualpedido_custom_tbl_pedidos` | `custom.tbl_pedidos` |  |
| cpo.DataRecebimentoBancocaixa | `cpo_datarecebimentobancocaixa_date` | `date` |  |
| cpo.GerouReciboRecebimento | `cpo_geroureciborecebimento_boolean` | `boolean` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualEntrega | `cpo_qualentrega_custom_tbl_entregas` | `custom.tbl_entregas` |  |
| cpo.QualCotacao | `cpo_qualcotacao_custom_tbl_orcamento` | `custom.tbl_orcamento` |  |
| cpo.QualCobranca | `cpo_qualcobranca_custom_tbl_cobrancas` | `custom.tbl_cobrancas` |  |
| cpo.QualProposta | `cpo_qualproposta_custom_tbl_propostas` | `custom.tbl_propostas` |  |
| cpo.QualFornecedor | `cpo_qualfornecedor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualPrazo | `cpo_qualprazo_option_opt_parcelasreceber` | `option.opt_parcelasreceber` |  |
| cpo.QualOrigem | `cpo_qualorigem_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QdtParcelas | `cpo_qdtparcelas_option_opt_parcelasreceber` | `option.opt_parcelasreceber` |  |
| cpo.QualDestino | `cpo_qualdestino_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QuaisCobrancas | `cpo_quaiscobrancas_list_custom_tbl_cobrancas` | `list.custom.tbl_cobrancas` |  |
| cpo.QuaisHistoricos | `cpo_quaishistoricos_list_custom_tbl_historico` | `list.custom.tbl_historico` |  |
| cpo.StatusFinanceiro | `cpo_statusfinanceiro_option_opt_statusfinanceiro` | `option.opt_statusfinanceiro` |  |
| cpo.QualOrcamentoFornecedor | `cpo_qualorcamentofornecedor_custom_tbl_orcamentfornecedores` | `custom.tbl_orcamentfornecedores` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_qualprazo_option_opt_parcelasreceber", "1": "cpo_datavencimento_date", "2": "cpo_valorcomissao_number"}, "view_attachments": true}

## Tbl.ContasReceberImportado (`tbl_contasreceberimportado`) — 19 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.dtnf | `cpo_dtnf_date` | `date` |  |
| cpo.numNF | `cpo_numnf_text` | `text` |  |
| cpo.qtd | `cpo_qtd_number` | `number` |  |
| cpo.dtvcto | `cpo_dtvcto_date` | `date` |  |
| cpo.cliente | `cpo_cliente_text` | `text` |  |
| cpo.dtvenda | `cpo_dtvenda_date` | `date` |  |
| cpo.produto | `cpo_produto_text` | `text` |  |
| cpo.vendedor | `cpo_vendedor_text` | `text` |  |
| cpo.dtentrega | `cpo_dtentrega_date` | `date` |  |
| cpo.fornecedor | `cpo_fornecedor_text` | `text` |  |
| cpo.valornota | `cpo_valornota_number` | `number` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.uf | `cpo_uf_option_opt_ufs` | `option.opt_ufs` |  |
| cpo.valorcomissao | `cpo_valorcomissao_number` | `number` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualProduto | `cpo_qualproduto_custom_tbl_produtos` | `custom.tbl_produtos` |  |
| cpo.QualFornecedor | `cpo_qualfornecedor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualDestino | `cpo_qualdestino_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QualOrigem | `cpo_qualendereco_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |

## Tbl.ContatoCliFor (`tbl_contatoclifor`) — 10 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Cargo | `cpo_cargo_text` | `text` |  |
| cpo.Email | `cpo_email_text` | `text` |  |
| cpo.ativo | `cpo_ativo_boolean` | `boolean` |  |
| cpo.Telefone | `cpo_telefone_text` | `text` |  |
| cpo.NomeContato | `cpo_nomecontato_text` | `text` |  |
| cpo.EmailPrincipal | `cpo_emailprincipal_text` | `text` |  |
| cpoTipoClifor | `cpotipoclifor_option_opt_tipoclifor` | `option.opt_tipoclifor` |  |
| cpo.QualGrupoCliFor | `cpo_qualgrupoclifor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.TipoTelefone | `cpo_tipotelefone_option_opt_tipotelefone` | `option.opt_tipotelefone` |  |
| cpo.QualEndereço | `cpo_qualendere_o_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_ativo_boolean"}, "view_attachments": true}

## Tbl.Cotacao (`tbl_orcamento`) — 13 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| Cpo.Amostra | `cpo_amostra_boolean` | `boolean` |  |
| cpo.Arquivado | `cpo_arquivado_boolean` | `boolean` |  |
| cpo.DataValidade | `cpo_datavalidade_date` | `date` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.CotacaoNum | `cpo_orcamentonum_number` | `number` |  |
| cpo.CotacaoEtapa | `cpo_etapa_option_opt_etapas` | `option.opt_etapas` |  |
| cpo.QualPedido | `cpo_qualpedido_custom_tbl_pedidos` | `custom.tbl_pedidos` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.EmpresaMegabox | `cpo_empresamegabox_option_opt_empresamegabox` | `option.opt_empresamegabox` |  |
| cpo.QuaisPropostas | `cpo_quaispropostas_list_custom_tbl_propostas` | `list.custom.tbl_propostas` |  |
| cpo.CotacaoStatus | `cpo_orcamentostatus_option_opt_orcamentostatus` | `option.opt_orcamentostatus` |  |
| cpo.QuaisProdutos | `cpo_quaisprodutos_list_custom_tbl_orcamentoprodutos` | `list.custom.tbl_orcamentoprodutos` |  |
| cpo.MotivoArquivamento | `cpo_motivoarquivamento_option_opt_motivoarquivamento` | `option.opt_motivoarquivamento` |  |

## Tbl.CotacaoProdutos (`tbl_orcamentoprodutos`) — 10 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Qtd | `cpo_qtd_number` | `number` |  |
| cpo.Medida | `cpo_medida_text` | `text` |  |
| cpo.Linha | `cpo_linha_option_opt_produtoslinhas` | `option.opt_produtoslinhas` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualProdutoModelo | `cpo_qualproduto_custom_tbl_produtos` | `custom.tbl_produtos` |  |
| cpo.QualCotacao | `cpo_qualor_amento_custom_tbl_orcamento` | `custom.tbl_orcamento` |  |
| cpo.Condicao | `cpo_condicao_option_opt_produtoscondicao` | `option.opt_produtoscondicao` |  |
| cpo.QualProdutoGrupo | `cpo_qualprodutogrupo_custom_tbl_produtossubgrupo` | `custom.tbl_produtossubgrupo` |  |
| cpo.QualEnderecoDestino | `cpo_qualenderecodestino_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QuaisOrcamentosForncededores | `cpo_quaisorcamentosforncededores_list_custom_tbl_orcamentfornecedores` | `list.custom.tbl_orcamentfornecedores` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": false, "auto_binding": false, "view_attachments": false}
- `auto binding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_condicao_option_opt_produtoscondicao", "1": "cpo_linha_option_opt_produtoslinhas", "2": "cpo_medida_text", "3": "cpo_qtd_number", "4": "cpo_quaisorcamentosforncededores_list_custom_tbl_orcamentfornecedores", "5

## Tbl.EnderecosCliFor (`tbl_enderecosclifor`) — 32 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.UF | `cpo_uf_text` | `text` |  |
| cpo.Cep | `cpo_cep_text` | `text` |  |
| cpo.Razao | `cpo_razao_text` | `text` |  |
| cpo.Bairro | `cpo_bairro_text` | `text` |  |
| cpo.CnpjCpf | `cpo_cnpjcpf_text` | `text` |  |
| cpo.Demanda | `cpo_demanda_text` | `text` |  |
| cpo.Ativo | `cpo_ativo_boolean` | `boolean` |  |
| cpo.Endereco | `cpo_endereco_text` | `text` |  |
| cpo.Fantasia | `cpo_fantasia_text` | `text` |  |
| cpo.Municipio | `cpo_municipio_text` | `text` |  |
| cpo.Complemento | `cpo_complemento_text` | `text` |  |
| cpo.Observacoes | `cpo_observacoes_text` | `text` |  |
| cpo.Liberado | `cpo_bloqueado_boolean` | `boolean` |  |
| cpo.InscEstadual | `cpo_inscestadual_text` | `text` |  |
| cpo.NomeEndereco | `cpo_nomeendere_o_text` | `text` |  |
| cpo.Principal | `cpo_principal_boolean` | `boolean` |  |
| cpo.InscMunicipal | `cpo_instmunicipal_text` | `text` |  |
| cpo.NomeComprador | `cpo_nomecomprador_text` | `text` |  |
| cpo.Corporativo | `cpo_corporativo_boolean` | `boolean` |  |
| cpo.LiberadoMotivo | `cpo_bloqueadomotivo_text` | `text` |  |
| cpo.CapacidadeCompra | `cpo_capacidadecompra_text` | `text` |  |
| cpo.IdCliforAntigo | `cpo_idcliforantigo_number` | `number` |  |
| cpo.QualNomeGrupoCliFor | `cpo_qualnomegrupoclifor_text` | `text` |  |
| cpo.QualUfOpt | `cpo_qualufopt_option_opt_ufs` | `option.opt_ufs` |  |
| cpo.Frete | `cpo_frete_option_opt_tipofrete` | `option.opt_tipofrete` |  |
| cpo.Localizacaoo | `cpo_localiza__o_geographic_address` | `geographic_address` |  |
| cpo.TipoClifor | `cpo_tipoclifor_option_opt_tipoclifor` | `option.opt_tipoclifor` |  |
| cpo.TipoPessoa | `cpo_tipopessoa_option_opt_tipopessoa` | `option.opt_tipopessoa` |  |
| cpo.QuaisAnexos | `cpo_quaisanexos_list_custom_tbl_anexos` | `list.custom.tbl_anexos` |  |
| cpo.QualGrupoCliFor | `cpo_qualgrupoclifor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QuaisProdutos | `cpo_quaisprodutos_list_custom_tbl_produtos` | `list.custom.tbl_produtos` |  |
| cpo.QualRegimeTributario | `cpo_qualregimetributario_option_opt_regimetributario` | `option.opt_regimetributario` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_ativo_boolean", "1": "cpo_qualregimetributario_option_opt_regimetributario", "2": "cpo_qualgrupoclifor_custom_tbl_clientes", "3": "cpo_bloqueado_boolean", "4": "cpo_bloqueadomotivo_text"}, "view_attachments": t

## Tbl.Entregas (`tbl_entregas`) — 41 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.NumNfFornecedor | `cpo_nftexto_text` | `text` |  |
| cpo.DtPedido | `cpo_dtpedido_date` | `date` |  |
| cpo.QualVendedor | `cpo_vendedor_user` | `user` |  |
| cpo.DtEntrega | `cpo_dtentrega_date` | `date` |  |
| cpo.ArquivoNfFornecedor | `cpo_nfarquivo_file` | `file` |  |
| cpo.BoletoFile | `bpo_boletofile_file` | `file` |  |
| cpo.DtPrevEntrega | `cpo_dataentrega_date` | `date` |  |
| cpo.DtEmissaoNf | `cpo_dtemissaonf_date` | `date` |  |
| cpo.Importado | `cpo_importado_boolean` | `boolean` |  |
| cpo.NumeroEntrega | `cpo_numeropedido_text` | `text` |  |
| cpo.QtdEntrega | `cpo_qtdentrega_number` | `number` |  |
| cpo.ValorVendaBruto | `cpo_valorbruto_number` | `number` |  |
| cpo.NaoEmiteNF | `cpo_naoemitenf_boolean` | `boolean` |  |
| cpo.NumNfMegabox | `cpo_nfrecebimento_text` | `text` |  |
| cpo.SaiuEntrega | `cpo_saiuentrega_boolean` | `boolean` |  |
| cpo.ValorVendaLiquido | `cpo_valorliquido_number` | `number` |  |
| cpo.DtNfRecebimento | `cpo_datarecebimento_date` | `date` |  |
| cpo.ValorComissaoBruto | `cpo_valorcomissao_number` | `number` |  |
| cpo.QualClienteTexto | `cpo_qualclientetexto_text` | `text` |  |
| cpo.QualFornecedTexto | `cpo_qualfornecedtexto_text` | `text` |  |
| cpo.ComprovanteEntrega | `cpo_comprovanteentrega_file` | `file` |  |
| cpo.MotivoCancelamento | `cpo_motivocancelamento_text` | `text` |  |
| cpo.BoletoArquivos | `cpo_arquivoboletos_list_file` | `list.file` |  |
| cpo.PedidoFinalizado | `cpo_pedidofinalizado_boolean` | `boolean` |  |
| cpo.NotaBoletoEnviada | `cpo_notaboletoenviada_boolean` | `boolean` |  |
| cpo.ValorVendaBrutoUnitario | `cpo_valorvendaunitario_number` | `number` |  |
| cpo.MotivoAlteracaoValores | `cpo_motivoalteracaovalores_text` | `text` |  |
| cpo.QualVendedorSubstituto | `cpo_qualvendedorsubstituto_user` | `user` |  |
| cpo.ValorComissaoUnitario | `cpo_valorcomissaounitario_number` | `number` |  |
| cpo.QualPedido | `cpo_qualpedido_custom_tbl_pedidos` | `custom.tbl_pedidos` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.StatusEntrega | `cpo_statusentrega_option_opt_etapas` | `option.opt_etapas` |  |
| cpo.QualCotacao | `cpo_qualcotacao_custom_tbl_orcamento` | `custom.tbl_orcamento` |  |
| cpo.ValorVendaLiquidoUnitario | `cpo_valorvendaliquidounitario_number` | `number` |  |
| cpo.QualProposta | `cpo_qualproposta_custom_tbl_propostas` | `custom.tbl_propostas` |  |
| cpo.QualFornecedor | `cpo_qualfornecedor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.StatusFinanceiro | `cpo_statusfinanceiro_option_opt_statusfinanceiro` | `option.opt_statusfinanceiro` |  |
| cpo.QuaisContasPagar | `cpo_quaiscontaspagar_list_custom_tbl_contasreceber1` | `list.custom.tbl_contasreceber1` |  |
| cpo.QuaisContasReceber | `cpo_quaiscontasreceber_list_custom_tbl_contasreceber` | `list.custom.tbl_contasreceber` |  |
| cpo.QualMetaFechada | `cpo_qualmetafechada_custom_tbl_orcfornecedorescotacao` | `custom.tbl_orcfornecedorescotacao` |  |
| cpo.QualOrcamentoFornecedor | `cpo_qualorcamentofornecedor_custom_tbl_orcamentfornecedores` | `custom.tbl_orcamentfornecedores` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `auto binding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_qtdentrega_number", "1": "cpo_dataentrega_date", "2": "cpo_nfarquivo_file", "3": "cpo_nftexto_text", "4": "cpo_notaboletoenviada_boolean", "5": "cpo_dtentrega_date", "6": "cpo_comprovanteentrega_file", "7": "cp

## Tbl.GrupoCliFor (`tbl_clientes`) — 24 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Foto | `cpo_foto_image` | `image` |  |
| cpo.Demanda | `cpo_demanda_text` | `text` |  |
| cpo.Ativo | `cpo_ativo_boolean` | `boolean` |  |
| cpo.Observacoes | `cpo_codcliente_text` | `text` |  |
| cpo.NomeCliFor | `cpo_nomecliente_text` | `text` |  |
| cpo.QualProduto | `cpo_qualproduto_text` | `text` |  |
| cpo.Liberado | `cpo_bloqueado_boolean` | `boolean` |  |
| cpo.QualCarteira | `cpo_qualcarteira_user` | `user` |  |
| cpo.NomeComprador | `cpo_nomecomprador_text` | `text` |  |
| cpo.Corporativo | `cpo_corporativo_boolean` | `boolean` |  |
| cpo.EmailPrincipal | `cpo_emailprincipal_text` | `text` |  |
| cpo.LiberadoMotivo | `cpo_bloqueadomotivo_text` | `text` |  |
| cpo.UltimoHistoricoData | `cpo_ultimohistorico_date` | `date` |  |
| cpo.CapacidadeCompra | `cpo_capacidadecompra_text` | `text` |  |
| cpo.PossuiFiliais | `cpo_possuifiliais_boolean` | `boolean` |  |
| cpo.UltimoQue(Des)ativou | `cpo_ultimoquedesativou_user` | `user` |  |
| cpo.Frete | `cpo_frete_option_opt_tipofrete` | `option.opt_tipofrete` |  |
| cpo.NãoFazContratoParceria | `cpo_fazcontratoparceria_boolean` | `boolean` |  |
| cpo.QuaisAnexos | `cpo_quaisanexos_list_custom_tbl_anexos` | `list.custom.tbl_anexos` |  |
| cpo.Captacao | `cpo_captacao_option_opt_captacaocliente` | `option.opt_captacaocliente` |  |
| cpo.QualTipoCliFor | `cpo_qualtipoclifor_option_opt_tipoclifor` | `option.opt_tipoclifor` |  |
| cpo.UltimoHistoricoMsg | `cpo_ultimohistoricomsg_custom_tbl_historico` | `custom.tbl_historico` |  |
| cpo.QuaisContatos | `cpo_quaiscontatos_list_custom_tbl_contatoclifor` | `list.custom.tbl_contatoclifor` |  |
| cpo.QuaisEnderecos | `cpo_quaisendere_os_list_custom_tbl_enderecosclifor` | `list.custom.tbl_enderecosclifor` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "binding_fields": {"0": "cpo_ativo_boolean"}, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_ativo_boolean", "1": "cpo_qualcarteira_user", "2": "cpo_fazcontratoparceria_boolean"}, "view_attachments": true}

## Tbl.Historico (`tbl_historico`) — 7 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.AnexoFile | `cpo_anexo_file` | `file` |  |
| cpo.AnexoLink | `cpo_anexolink_text` | `text` |  |
| cpo.Descricao | `cpo_descricao_text` | `text` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.QualClifor | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualDepto | `cpo_qualdepto_option_opt_deptousuario` | `option.opt_deptousuario` |  |
| cpo.QualUnidade | `cpo_qualunidade_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |

## Tbl.IcmsEstados (`tbl_icmsestados`) — 3 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.AliquotaIcms | `cpo_aliquotaicms_number` | `number` |  |
| cpo.Origem | `cpo_origem_option_opt_ufs` | `option.opt_ufs` |  |
| cpo.Destino | `cpo_destino_option_opt_ufs` | `option.opt_ufs` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_aliquotaicms_number"}, "view_attachments": true}

## Tbl.MetaAdicional (`tbl_metaadicional`) — 5 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.DataFim | `cpo_datafim_date` | `date` |  |
| cpo.Valor | `cpo_valor_number` | `number` |  |
| cpo.DataInicio | `cpo_datainicio_date` | `date` |  |
| cpo.QualUsuario | `cpo_qualusuario_user` | `user` |  |
| cpo.QualNivel | `cpo_qualnivel_custom_tbl_niveisvendedores` | `custom.tbl_niveisvendedores` |  |

## Tbl.MetasFechadas (`tbl_orcfornecedorescotacao`) — 16 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.DataFim | `cpo_datafim_date` | `date` |  |
| cpo.MesNome | `cpo_mesnome_text` | `text` |  |
| cpo.DataInicio | `cpo_datainicio_date` | `date` |  |
| cpo.TotalBonusExtra - deleted | `cpo_tributos_number` | `number` | sim |
| cpo.AnoNumero | `cpo_anonumero_number` | `number` |  |
| cpo.MesNumero | `cpo_mesnumero_number` | `number` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.TotalComissaoMegabox | `cpo_tributoipi_number` | `number` |  |
| cpo.TotalComissaoVendedor | `cpo_tributopiscofinsb_number` | `number` |  |
| cpo.QuaisClientes - deleted | `cpo_quaisclientes_list_custom_tbl_clientes` | `list.custom.tbl_clientes` | sim |
| cpo.QuaisEntregas | `cpo_quaisentregas_list_custom_tbl_entregas` | `list.custom.tbl_entregas` |  |
| cpo.QuaisFornecedores - deleted | `cpo_quaisfornecedores_list_custom_tbl_clientes` | `list.custom.tbl_clientes` | sim |
| cpo.QuaisContasPagar | `cpo_quaiscontaspagar_list_custom_tbl_contasreceber1` | `list.custom.tbl_contasreceber1` |  |
| cpo.QuaisContasReceber | `cpo_quaiscontasreceber_list_custom_tbl_contasreceber` | `list.custom.tbl_contasreceber` |  |
| cpo.QuaisEnderecosOrigem - deleted | `cpo_quaisenderecosorigem_list_custom_tbl_enderecosclifor` | `list.custom.tbl_enderecosclifor` | sim |
| cpo.QuaisEnderecosDestino - deleted | `cpo_quaisenderecosdestino_list_custom_tbl_enderecosclifor` | `list.custom.tbl_enderecosclifor` | sim |

## Tbl.MetasMensais (`tbl_metasmensais`) — 10 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.DataFim | `cpo_datafim_date` | `date` |  |
| cpo.DataInicio | `cpo_datainicio_date` | `date` |  |
| cpo.Observacao | `cpo_observacao_text` | `text` |  |
| cpo.ValorMeta | `cpo_valormeta_number` | `number` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.RankingVendas | `cpo_rankingvendas_number` | `number` |  |
| cpo.DataPeriodo | `cpo_dataperiodo_date_range` | `date_range` |  |
| cpo.TipoMeta | `cpo_tipometa_option_opt_tipometa` | `option.opt_tipometa` |  |
| cpo.QualNivel | `cpo_qualnivel_custom_tbl_niveisvendedores` | `custom.tbl_niveisvendedores` |  |
| cpo.QualMetaFechada | `cpo_qualmetafechada_custom_tbl_orcfornecedorescotacao` | `custom.tbl_orcfornecedorescotacao` |  |

## Tbl.NiveisVendedores (`tbl_niveisvendedores`) — 8 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Ordem | `cpo_ordem_number` | `number` |  |
| cpo.NomeNivel | `cpo_nomenivel_text` | `text` |  |
| cpo.ComissaoMetaBatida | `cpo_metabonus_number` | `number` |  |
| cpo.MetaVenda | `cpo_metavenda_number` | `number` |  |
| cpo.old_ValorBonus | `cpo_valorbonus_number` | `number` |  |
| cpo.ComissaoPadrao | `cpo_fatorpremiacao_number` | `number` |  |
| cpo.QtdMetaBatida | `cpo_mediasobenivel_number` | `number` |  |
| cpo.QuaisVendedores | `cpo_quaisvendedores_list_user` | `list.user` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobindig` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_mediasobenivel_number", "1": "cpo_metabonus_number", "2": "cpo_metavenda_number", "3": "cpo_nomenivel_text", "4": "cpo_ordem_number", "5": "cpo_quaisvendedores_list_user", "6": "cpo_valorbonus_number", "7": "cp

## Tbl.OrcFornecedoresCotacao (`tbl_orcamentfornecedores`) — 31 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Medida | `cpo_medida_text` | `text` |  |
| cpo.QtdVenda | `cpo_qtdvenda_number` | `number` |  |
| cpo.TributosICMS | `cpo_tributos_number` | `number` |  |
| cpo.ValorIPI | `cpo_valoripi_number` | `number` |  |
| cpo.ValorICMS | `cpo_valoricms_number` | `number` |  |
| cpo.Vencedor | `cpo_vencedor_boolean` | `boolean` |  |
| cpo.Importado | `cpo_importado_boolean` | `boolean` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.TributoIPI | `cpo_tributoipi_number` | `number` |  |
| cpo.ValorFrete | `cpo_valorfrete_number` | `number` |  |
| cpo.ValorVendaUnit | `cpo_valorvenda_number` | `number` |  |
| cpo.ValorComissaoUnit | `cpo_valorcomissao_number` | `number` |  |
| cpo.ValorPISCOFINS | `cpo_valortributos_number` | `number` |  |
| cpo.ValorVendaBruto | `cpo_valorvendabruto_number` | `number` |  |
| cpo.FreteFracionado | `cpo_fretefracionado_boolean` | `boolean` |  |
| cpo.ValorUnitLiquido | `cpo_valorunitliquido_number` | `number` |  |
| cpo.TributoPISCOFINS | `cpo_tributopiscofinsb_number` | `number` |  |
| cpo.ValorVendaLiquido | `cpo_valorvendaliquido_number` | `number` |  |
| cpo.ValorComissaoBruto | `cpo_valorcomissaobruto_number` | `number` |  |
| cpo.TipoFrete | `cpo_tipofrete_option_opt_tipofrete` | `option.opt_tipofrete` |  |
| cpo.Linha | `cpo_linha_option_opt_produtoslinhas` | `option.opt_produtoslinhas` |  |
| cpo.QualProposta | `cpo_qualproposta_custom_tbl_propostas` | `custom.tbl_propostas` |  |
| cpo.QualFornecedor | `cpo_qualfornecedor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualCotacao | `cpo_qualorcamento_custom_tbl_orcamento` | `custom.tbl_orcamento` |  |
| cpo.Condicao | `cpo_condicao_option_opt_produtoscondicao` | `option.opt_produtoscondicao` |  |
| cpo.QualProdutoModelo | `cpo_qualprodutomodelo_custom_tbl_produtos` | `custom.tbl_produtos` |  |
| cpo.QuaisEntregas | `cpo_quaisentregas_list_custom_tbl_entregas` | `list.custom.tbl_entregas` |  |
| cpo.QualEnderecoOrigem | `cpo_qualenderecoorigem_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QualEnderecoDestino | `cpo_qualenderecodestino_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QualEndereçoCobrança | `cpo_qualendere_ocobran_a_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QualCotacaoProduto | `cpoqualorcamentoproduto_custom_tbl_orcamentoprodutos` | `custom.tbl_orcamentoprodutos` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `auto binding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_condicao_option_opt_produtoscondicao", "1": "cpo_tributos_number", "2": "cpo_linha_option_opt_produtoslinhas", "3": "cpo_valorcomissao_number", "4": "cpo_medida_text", "5": "cpo_valortributos_number", "6": "cpo

## Tbl.Pedido (`tbl_pedidos`) — 28 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.CorpoEmailFornecedor | `cpo_corpoemail_text` | `text` |  |
| cpo.EmailClienteCC | `cpo_emailscopia_text` | `text` |  |
| cpo.ContaEmail | `cpo_contaemail_number` | `number` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.NumeroPedido | `cpo_numerocotacao_text` | `text` |  |
| cpo.PedidoArquivo | `cpo_pedidoarquivo_file` | `file` |  |
| cpo.InformacoesAdd | `cpo_informacoesadd_text` | `text` |  |
| cpo.OrdemComrpaNum | `cpo_ordemcomrpanum_text` | `text` |  |
| cpo.Importado | `cpo_pedidoenviado_boolean` | `boolean` |  |
| cpo.QualClienteTexto | `cpo_qualclientetexto_text` | `text` |  |
| cpo.CorpoEmailCliente | `cpo_corpoemailcliente_text` | `text` |  |
| cpo.EmailFornecedorCC | `cpo_emailfornecedorcc_text` | `text` |  |
| cpo.MotivoCancelamento | `cpo_motivocancelamento_text` | `text` |  |
| cpo.OrdemCompraArquivo | `cpo_ordemcompraarquivo_file` | `file` |  |
| cpo.MotivoAlteraValores | `cpo_motivoalteravalores_text` | `text` |  |
| cpo.PedidoFormalizado | `cpo_pedidoformalizado_boolean` | `boolean` |  |
| cpo.PedidoFinalizado | `cpo_entregasdespachadas_boolean` | `boolean` |  |
| cpo.QualEtapa | `cpo_qualetapa_option_opt_etapas` | `option.opt_etapas` |  |
| cpo.FormaPagto | `cpo_formapagto_option_opt_formapgto` | `option.opt_formapgto` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualCotacao | `cpo_qualcotacao_custom_tbl_orcamento` | `custom.tbl_orcamento` |  |
| cpo.QualProposta | `cpo_qualproposta_custom_tbl_propostas` | `custom.tbl_propostas` |  |
| cpo.EmailFornecedor | `cpo_emailpara_custom_tbl_contatoclifor` | `custom.tbl_contatoclifor` |  |
| cpo.EmailCliente | `cpo_emailcliente_custom_tbl_contatoclifor` | `custom.tbl_contatoclifor` |  |
| cpo.QuaisEntregas | `cpo_quaisentregas_list_custom_tbl_entregas` | `list.custom.tbl_entregas` |  |
| cpo.QualPrimeiroFornecedor | `cpo_qualprimeirofornecedor_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.PrazoRecebComissoes | `cpo_prazorecebcomissoes_list_option_opt_parcelasreceber` | `list.option.opt_parcelasreceber` |  |
| cpo.QuaisOrcamentosFonecedores | `cpo_quaisorcamentosfonecedores_list_custom_tbl_orcamentfornecedores` | `list.custom.tbl_orcamentfornecedores` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_ordemcompraarquivo_file", "1": "cpo_ordemcomrpanum_text", "2": "cpo_emailpara_custom_tbl_contatoclifor", "3": "cpo_emailscopia_text", "4": "cpo_informacoesadd_text", "5": "cpo_entregasdespachadas_boolean", "6":

## Tbl.PerfilUsuario (`tbl_perfilusuario2`) — 1 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.QualOptPerfil | `cpo_qualoptperfil_option_opt_perfilusuario` | `option.opt_perfilusuario` |  |

## Tbl.PesquisaNps (`tbl_pesquisanps`) — 2 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.NomePesquisa | `cpo_nomepesquisa_text` | `text` |  |
| cpo.QuaisRespostas | `cpo_quaisrespostas_custom_tbl_pesquisaposvenda` | `custom.tbl_pesquisaposvenda` |  |

## Tbl.PesquisaRespostas (`tbl_pesquisaposvenda`) — 14 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.NotaNps | `cpo_notanps_number` | `number` |  |
| cpo.QualVendedor | `cpo_qualvendedor_text` | `text` |  |
| cpo.NotaEntrega | `cpo_notaentrega_number` | `number` |  |
| cpo.NotaProduto | `cpo_notaproduto_number` | `number` |  |
| cpo.Respondida | `cpo_respondida_boolean` | `boolean` |  |
| cpo.CriticasSugestoes | `cpo_criticassugestoes_text` | `text` |  |
| cpo.NotaAtendimento | `cpo_notaatendimento_number` | `number` |  |
| cpo.QualPedido | `cpo_qualpedido_custom_tbl_pedidos` | `custom.tbl_pedidos` |  |
| cpo.QualCliente | `cpo_qualcliente_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualFornecedor | `cpo_qualfornecedor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| cpo.QualPesquisa | `cpo_qualpesquisa_custom_tbl_pesquisanps` | `custom.tbl_pesquisanps` |  |
| cpo.TipoResposta | `cpo_tiporesposta_option_opt_tipopesquisa` | `option.opt_tipopesquisa` |  |
| cpo.QualFilialFornecedor | `cpo_qualfilialorigem_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QualFilialCliente | `cpo_qualfilialdestino_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |

## Tbl.ProdutosGrupo (`tbl_produtossubgrupo`) — 2 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.NomeGrupo | `cpo_nomesubgrupo_text` | `text` |  |
| cpo.QualTipoProduto | `cpo_qualgrupo_custom_tbl_produtosgrupo` | `custom.tbl_produtosgrupo` |  |

## Tbl.ProdutosModelo (`tbl_produtos`) — 14 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.NomeModelo | `cpo_nome_text` | `text` |  |
| cpo.Ativo | `cpo_ativo_boolean` | `boolean` |  |
| cpo.Descricao | `cpo_descri__o_text` | `text` |  |
| cpo.FotoSuperior | `cpo_superior_image` | `image` |  |
| cpo.FotoFrontal | `cpo_fotofrontal_image` | `image` |  |
| cpo.FotoLateral | `cpo_fotolateral_image` | `image` |  |
| cpo.FotoInferior | `cpo_fotoinferior_image` | `image` |  |
| cpo.QualTipoProduto | `cpo_qualgrupo_custom_tbl_produtosgrupo` | `custom.tbl_produtosgrupo` |  |
| cpo.QualGrupoProduto | `cpo_qualsubgrupo_custom_tbl_produtossubgrupo` | `custom.tbl_produtossubgrupo` |  |
| cpo.QuaisFornecedores | `cpo_quaisfornecedores_list_custom_tbl_clientes` | `list.custom.tbl_clientes` |  |
| cpo.QuaisLinhas | `cpo_quaislinhas_list_option_opt_produtoslinhas` | `list.option.opt_produtoslinhas` |  |
| cpo.QuaisVersoesProduto | `cpo_quaisvers_es_list_custom_tbl_produtovers_o` | `list.custom.tbl_produtovers_o` |  |
| cpo.QuaisCondicoes | `cpo_quaiscondi__es_list_option_opt_produtoscondicao` | `list.option.opt_produtoscondicao` |  |
| cpo.QuaisFornecedoresFiliais | `cpo_quaisfornecedoresfiliais_list_custom_tbl_enderecosclifor` | `list.custom.tbl_enderecosclifor` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_ativo_boolean"}, "view_attachments": true}

## Tbl.ProdutosTipo (`tbl_produtosgrupo`) — 2 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Icon | `cpo_icon_image` | `image` |  |
| cpo.NomeTipo | `cpo_nomegrupo_text` | `text` |  |

## Tbl.ProdutoVersao (`tbl_produtovers_o`) — 3 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Ativo | `cpo_ativo_boolean` | `boolean` |  |
| cpo.NomeVersao | `cpo_nomevers_o_text` | `text` |  |
| cpo.QualModeloProduto | `cpo_qualprodutomodelo_custom_tbl_produtos` | `custom.tbl_produtos` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": false, "view_attachments": true}
- `autobinding` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_nomevers_o_text", "1": "cpo_ativo_boolean"}, "view_attachments": true}

## Tbl.Propostas (`tbl_propostas`) — 16 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.CondicaoPgto | `cpo_condicao_text` | `text` |  |
| cpo.CorpoEmail | `cpo_corpoemail_text` | `text` |  |
| cpo.EmailsCopia | `cpo_emailstexto_text` | `text` |  |
| cpo.AnexoDiverso - deleted | `cpo_anexodiverso_file` | `file` | sim |
| cpo.DtPrevEntrega | `cpo_dataprevista_date` | `date` |  |
| cpo.QualVendedor | `cpo_qualvendedor_user` | `user` |  |
| cpo.InfoAdicional | `cpo_infoadicional_text` | `text` |  |
| cpo.PropostaNum | `cpo_propostanum_number` | `number` |  |
| cpo.AquivoProposta | `cpo_aquivoproposta_file` | `file` |  |
| cpo.PropostaEnviada | `cpo_propostaenviada_boolean` | `boolean` |  |
| cpo.AnexosDiversos | `cpo_anexosdiversos_list_file` | `list.file` |  |
| cpo.QualCotacao | `cpo_qualcotacao_custom_tbl_orcamento` | `custom.tbl_orcamento` |  |
| cpo.EnviarPara | `cpo_enviarpara_custom_tbl_contatoclifor` | `custom.tbl_contatoclifor` |  |
| cpo.FaturarPara | `cpo_faturarpara_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QualCnpjFornecedor | `cpo_qualcnpjfornecedor_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QuaisOrcamentosFornecedores | `cpo_quaisorcamentosfornecedores_list_custom_tbl_orcamentfornecedores` | `list.custom.tbl_orcamentfornecedores` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": false, "create_api": false, "delete_api": false, "modify_api": false, "search_for": false, "auto_binding": false, "view_attachments": false, "non_filterable_fields": {"Slug": true, "Created By": true, "Created Date": true, "Modified Date": true, "cpo_condicao_text": true, "cpo_corpoemai
- `New rule` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "create_api": false, "delete_api": false, "modify_api": false, "search_for": true, "auto_binding": false, "view_attachments": true}

## Tbl.SacHistorico (`tbl_sachistorico`) — 3 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.VisivelCliente | `cpo_visivelcliente_boolean` | `boolean` |  |
| cpo.DescricaoHistorico | `cpo_descricaohistorico_text` | `text` |  |
| cpo.QualProtocolo | `cpo_qualprotocolo_custom_tbl_sac` | `custom.tbl_sac` |  |

## Tbl.SacProtocolo (`tbl_sac`) — 18 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Ativo | `cpo_ativo_boolean` | `boolean` |  |
| cpo.Descricao | `cpo_descricao_text` | `text` |  |
| cpo.DataAberto | `cpo_dataaberto_date` | `date` |  |
| cpo.Anexos | `cpo_anexos_list_file` | `list.file` |  |
| cpo.DataFechado | `cpo_datafechado_date` | `date` |  |
| cpo.TempoResolução - deleted | `cpo_temporesolu__o_date` | `date` | sim |
| cpo.NumeroProtocoloText - deleted | `cpo_numeroprotocolo_text` | `text` | sim |
| cpo.QualResponsável | `cpo_qualrespons_vel_user` | `user` |  |
| cpo.NumeroProtocoloNum | `cpo_numeroprotocolonum_number` | `number` |  |
| Cpo.TempoResolução | `cpo_temporesolu__o_dateinterval` | `dateinterval` |  |
| cpo.QualPedido | `cpo_qualpedido_custom_tbl_pedidos` | `custom.tbl_pedidos` |  |
| cpo.QualEntrega - deleted | `cpo_qualentrega_custom_tbl_entregas` | `custom.tbl_entregas` | sim |
| cpo.QualGrupoClifor | `cpo_qualgrupoclifor_custom_tbl_clientes` | `custom.tbl_clientes` |  |
| Cpo.QualPrioridade | `cpo_qualprioridade_option_opt_prioridade` | `option.opt_prioridade` |  |
| cpo.QualFilial | `cpo_qualfilial_custom_tbl_enderecosclifor` | `custom.tbl_enderecosclifor` |  |
| cpo.QuaisEntregas | `cpo_quaisentregas_list_custom_tbl_entregas` | `list.custom.tbl_entregas` |  |
| cpo.QualStatusChamado | `cpo_qualstatuschamado_option_opt_statuslure` | `option.opt_statuslure` |  |
| cpo.QualTipoOcorrencia | `cpo_qualtipoocorrencia_option_opt_tipoocorrencia` | `option.opt_tipoocorrencia` |  |

## User (`user`) — 46 campos · exposto na API
| Campo | id | Tipo | Excluído |
|---|---|---|---|
| cpo.Rg | `cpo_rg_text` | `text` |  |
| cpo.Cpf | `cpo_cpf_text` | `text` |  |
| cpo.Nome | `cpo_nome_text` | `text` |  |
| cpo.SmtpEndereco - deleted | `cpo_smtp_text` | `text` | sim |
| cpo.Foto | `cpo_foto_image` | `image` |  |
| cpo.Cidade | `cpo_cidade_text` | `text` |  |
| cpo.Endereço | `cpo_endere_o_text` | `text` |  |
| cpo.IsDev | `cpo_isdev_boolean` | `boolean` |  |
| cpo.Telefone | `cpo_telefone_text` | `text` |  |
| cpo.Ativo | `cpo_ativo1_boolean` | `boolean` |  |
| cpo.FeriasFim | `cpo_feriasfim_date` | `date` |  |
| cpo.PassTexto | `cpo_passtexto_text` | `text` |  |
| cpo.SmtpPorta - deleted | `cpo_smtpporta_text` | `text` | sim |
| cpo.SmtpSenha - deleted | `cpo_smtpsenha_text` | `text` | sim |
| cpo.StmpLogin - deleted | `cpo_stmplogin_text` | `text` | sim |
| cpo.EmailLoginTexto | `cpo_emailtexto_text` | `text` |  |
| cpo.CopiaPedido | `cpo_copiaoculta_text` | `text` |  |
| cpo.EmailContato | `cpo_emailcontato_text` | `text` |  |
| cpo.FeriasInicio | `cpo_feriasinicio_date` | `date` |  |
| cpo.Uf | `cpo_uf_option_opt_ufs` | `option.opt_ufs` |  |
| cpo.BuscaExataProxima | `cpo_buscaexataproxima_text` | `text` |  |
| cpo.FeriasPeriod | `cpo_feriasperiod_date_range` | `date_range` |  |
| cpo.UsaEmailPessoal - deleted | `cpo_usaemailpessoal_boolean` | `boolean` | sim |
| cpo.CopiaProposta | `cpo_copiaocultaproposta_text` | `text` |  |
| cpo.RankingVendaMedia | `cpo_rankingvendamedia_number` | `number` |  |
| cpo.RankingVendaRegular | `cpo_temprankingvendas_number` | `number` |  |
| cpo.ContatosPessoais | `cpo_contatospessoais_list_text` | `list.text` |  |
| cpo.Menu | `cpo_menuconfig_option_opt_menu` | `option.opt_menu` |  |
| cpo.UltimoDateRange | `cpo_ultimodaterange_date_range` | `date_range` |  |
| cpo.QualVendedorSubstituto | `cpo_qualvendedorsubstituto_user` | `user` |  |
| cpo.CopiaCancelamentos | `cpo_copiaocultacancelamentos_text` | `text` |  |
| cpo.RankingVendaSubstituto | `cpo_rankingvendasubstituto_number` | `number` |  |
| cpo.ExpandirCadastroClifor | `cpo_expandircadastroclifor_boolean` | `boolean` |  |
| cpo.QualDepto | `cpo_qualdpto_option_opt_deptousuario` | `option.opt_deptousuario` |  |
| cpo.SubMenuConfig | `cpo_submenuconfig_option_opt_submenu` | `option.opt_submenu` |  |
| cpo.QualPaginaInicial | `cpo_qualpaginainicial_option_opt_menu` | `option.opt_menu` |  |
| cpo.QuaisAnexos | `cpo_quaisanexos_list_custom_tbl_anexos` | `list.custom.tbl_anexos` |  |
| cpo.QualPerfil | `cpo_qualperfil_option_opt_perfilusuario` | `option.opt_perfilusuario` |  |
| cpo.FiltraTipoClifor | `cpo_filtratipoclifor_option_opt_tipoclifor` | `option.opt_tipoclifor` |  |
| cpo.OrdenarCampos | `cpo_ordenarcampos_option_opt_ordenarcampos` | `option.opt_ordenarcampos` |  |
| cpo.CarteiraClientes | `cpo_carteiraclientes_list_custom_tbl_clientes` | `list.custom.tbl_clientes` |  |
| cpo.QualNivelVendedor | `cpo_qualnivelvendedor_custom_tbl_niveisvendedores` | `custom.tbl_niveisvendedores` |  |
| cpo.TempOrcamentoProdutos | `cpo_tempprodutos_list_custom_tbl_orcamentoprodutos` | `list.custom.tbl_orcamentoprodutos` |  |
| cpo.SelecionadosPagar | `cpo_pagarselecionados_list_custom_tbl_contasreceber1` | `list.custom.tbl_contasreceber1` |  |
| cpo.SelecionadosReceber | `cpo_tempcobrarentregas_list_custom_tbl_contasreceber` | `list.custom.tbl_contasreceber` |  |
| cpo.QuaisMetasFechadas | `cpo_quaismetasfechadas_list_custom_tbl_orcfornecedorescotacao` | `list.custom.tbl_orcfornecedorescotacao` |  |

Privacy rules:
- `everyone` — condição: todos · permissões: {"view_all": true, "search_for": true, "auto_binding": true, "binding_fields": {"0": "cpo_ativo1_boolean"}, "view_attachments": true}
- `User's own data` — condição: CurrentUser:logged_in · permissões: {"view_all": true, "search_for": true, "view_fields": {"0": "cpo_ativo1_boolean", "1": "cpo_buscaexataproxima_text", "2": "cpo_carteiraclientes_list_custom_tbl_clientes", "3": "cpo_cidade_text", "4": "cpo_contatospessoais_list_text", "5": "cpo_copiaoculta_text", "6": "cpo_copiaocultacancelamentos_te
