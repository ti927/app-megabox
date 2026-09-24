# MegaBox — inventário de dados do Bubble (Data API, live)

Fonte: `https://grupomegabox.bubbleapps.io/api/1.1/meta`, lido em 24/09/2026 pelo conector Zapier. Só esquema — nenhum registro de cliente.

## Resumo

| Item | Quantidade |
|---|---|
| Data types expostos na Data API (live) | 29 |
| Campos (fora os de sistema) | 444 |
| Option sets referenciados por campos | 26 |
| Backend workflows expostos (Workflow API) | 24 |
| Páginas, elementos e workflows de página | **não vêm pela API** — mapeamento pelo editor (Claude in Chrome) |
| Contagem de registros por tabela | pendente — a extração ainda não tem caminho de rede (ver plano) |

## Data types

| Data type | Nome interno | Campos | Referências | Listas | Option sets | Arquivos/imagens |
|---|---|---|---|---|---|---|
| Tbl.ContasPagar | `tbl.contaspagar` | 41 | 17 | 4 | 3 | 1 |
| Tbl.Entregas | `tbl.entregas` | 41 | 11 | 3 | 2 | 4 |
| User | `user` | 41 | 8 | 7 | 8 | 1 |
| Tbl.ContasReceber | `tbl.contasreceber` | 40 | 15 | 2 | 3 | 1 |
| Tbl.EnderecosCliFor | `tbl.enderecosclifor` | 32 | 3 | 2 | 5 | 0 |
| Tbl.OrcFornecedoresCotacao | `tbl.orcfornecedorescotacao` | 31 | 10 | 1 | 3 | 0 |
| Tbl.Pedido | `tbl.pedido` | 28 | 9 | 3 | 3 | 2 |
| Tbl.GrupoCliFor | `tbl.grupoclifor` | 24 | 6 | 3 | 3 | 1 |
| Tbl.ContasReceberImportado | `tbl.contasreceberimportado` | 19 | 6 | 0 | 1 | 0 |
| Tbl.ConfigSistema | `tbl.configsistema` | 15 | 1 | 3 | 5 | 0 |
| Tbl.Propostas | `tbl.propostas` | 15 | 6 | 2 | 0 | 2 |
| Tbl.ProdutosModelo | `tbl.produtosmodelo` | 14 | 5 | 5 | 2 | 4 |
| Tbl.Cotacao | `tbl.cotacao` | 13 | 5 | 2 | 4 | 0 |
| Tbl.MetasFechadas | `tbl.metasfechadas` | 11 | 4 | 3 | 0 | 0 |
| Tbl.ContatoCliFor | `tbl.contatoclifor` | 10 | 2 | 0 | 2 | 0 |
| Tbl.MetasMensais | `tbl.metasmensais` | 10 | 3 | 0 | 1 | 0 |
| Tbl.CotacaoProdutos | `tbl.cotacaoprodutos` | 10 | 6 | 1 | 2 | 0 |
| Tbl.NiveisVendedores | `tbl.niveisvendedores` | 8 | 1 | 1 | 0 | 0 |
| Tbl.Historico | `tbl.historico` | 7 | 3 | 0 | 1 | 1 |
| Tbl.BugReport | `tbl.bugreport` | 6 | 0 | 1 | 2 | 2 |
| Tbl.Anexos | `tbl.anexos` | 5 | 3 | 0 | 1 | 1 |
| Tbl.Cobrancas | `tbl.cobrancas` | 5 | 2 | 1 | 0 | 1 |
| Tbl.MetaAdicional | `tbl.metaadicional` | 5 | 2 | 0 | 0 | 0 |
| Tbl.IcmsEstados | `tbl.icmsestados` | 3 | 0 | 0 | 2 | 0 |
| Tbl.ProdutoVersao | `tbl.produtoversao` | 3 | 1 | 0 | 0 | 0 |
| Tbl.cnpjformatado | `tbl.cnpjformatado` | 2 | 1 | 0 | 0 | 0 |
| Tbl.ProdutosTipo | `tbl.produtostipo` | 2 | 0 | 0 | 0 | 1 |
| Tbl.ProdutosGrupo | `tbl.produtosgrupo` | 2 | 1 | 0 | 0 | 0 |
| Tbl.PerfilUsuario | `tbl.perfilusuario` | 1 | 0 | 0 | 1 | 0 |

## Option sets referenciados

Os valores de cada option set não vêm pela Data API — levantar no editor.

| Option set | Campos que usam |
|---|---|
| `cpo_grupodeconfigssistema` | 1 |
| `opt_anexosclifor` | 1 |
| `opt_captacaocliente` | 1 |
| `opt_deptousuario` | 3 |
| `opt_empresamegabox` | 1 |
| `opt_etapas` | 3 |
| `opt_formapgto` | 1 |
| `opt_localdosistema` | 1 |
| `opt_menu` | 3 |
| `opt_motivoarquivamento` | 1 |
| `opt_orcamentostatus` | 1 |
| `opt_ordenarcampos` | 1 |
| `opt_parcelasreceber` | 5 |
| `opt_perfilusuario` | 3 |
| `opt_produtoscondicao` | 3 |
| `opt_produtoslinhas` | 3 |
| `opt_regimetributario` | 1 |
| `opt_statusbug` | 1 |
| `opt_statusfinanceiro` | 3 |
| `opt_submenu` | 2 |
| `opt_tipoclifor` | 4 |
| `opt_tipofrete` | 3 |
| `opt_tipometa` | 1 |
| `opt_tipopessoa` | 1 |
| `opt_tipotelefone` | 1 |
| `opt_ufs` | 5 |

## Backend workflows (Workflow API)

| Endpoint | Parâmetros | Sem autenticação |
|---|---|---|
| `CriarContasReceberImportadas` | contasreceber: `list.custom.tbl.contasreceberimportado`, fila: `number`, qtd: `number` | não |
| `EnviarEmailPedido(velho)` | pedido: `custom.tbl.pedido` | não |
| `EnviarEmailPedido(novo)` | pedido: `custom.tbl.pedido` | não |
| `AdicionarProdutos` | qualproduto: `custom.tbl.produtosmodelo`, qtdproduto: `number`, condicao: `option.opt_produtoscondicao`, linha: `option.opt_produtoslinhas`, medida: `text`, qtd laço: `number`, fila laço: `number`, qualorçamento: `custom.tbl.cotacao`, endentrega: `custom.tbl.enderecosclifor` | não |
| `AdicionarFornecedores` | linha: `option.opt_produtoslinhas`, medida: `text`, condicao: `option.opt_produtoscondicao`, destino: `custom.tbl.enderecosclifor`, origens: `list.custom.tbl.enderecosclifor`, orcamentoproduto: `custom.tbl.cotacaoprodutos`, qtd laco: `number`, fila laco: `number`, vendedor: `user` | não |
| `CalculaFornecedoresLista` | par.OrcamentosFornecedores: `list.custom.tbl.orcfornecedorescotacao` | não |
| `CalcularValoresEntregas` | par.QualEntrega: `custom.tbl.entregas` | não |
| `CriarContasReceber` | QualEntrega: `custom.tbl.entregas`, Qtd: `number`, Fila: `number`, Prazos: `list.option.opt_parcelasreceber`, DtEntrega: `date` | não |
| `AttReceberImportado` | — | não |
| `copiainfoaddparafilial` | — | não |
| `CopiarDataNfmegaboxParaDataRecebimentoBanco` | — | não |
| `CriarContasPagar` | QualEntrega: `custom.tbl.entregas`, DtEntrega: `date` | não |
| `CriarComissoesPassadas` | fila: `number`, qtd: `number`, quaisentregas: `list.custom.tbl.entregas` | não |
| `CorrigirValorComissaoPagar` | quaiscomissoes: `list.custom.tbl.contaspagar` | não |
| `LImparNota1102ContasReceber` | — | não |
| `CalcularValoresListaEntregas` | par.QuaisEntregas: `list.custom.tbl.entregas`, par.Fila: `number`, par.Qtd: `number` | não |
| `VicularOcamentoCopiaAoProdutoCopia` | qtd: `number`, fila: `number`, orcamentos: `list.custom.tbl.orcfornecedorescotacao`, produtos: `list.custom.tbl.cotacaoprodutos`, currentuser: `user`, dtvalidade: `date`, empresamega: `option.opt_empresamegabox` | **sim** |
| `RefreshTokenGoogle` | — | não |
| `EnviarEmailUsuario` | — | não |
| `BugReport` | — | não |
| `DeletarReceberImportado` | — | não |
| `EnviarEmailsGeral` | to: `text`, cc: `text`, sender: `text`, bcc: `text`, subject: `text`, body: `text`, anexo1: `text`, reply: `text`, mailpessoal: `boolean`, anexo2: `text`, anexo3: `text`, anexo4: `text`, anexo5: `text`, anexo6: `text`, anexo7: `text`, anexo8: `text`, anexo9: `text`, anexo10: `text` | não |
| `copiainfoaddparafilial_copy` | — | não |
| `CopiarEndereçosOrcamentoParaContasReceber` | — | não |

## Campos por data type

### Tbl.Anexos (`tbl.anexos`) — 5 campos

| Campo | Tipo |
|---|---|
| cpo.Anexo | `file` |
| cpo.QualClifor | `custom.tbl.grupoclifor` |
| cpo.QualEndereco | `custom.tbl.enderecosclifor` |
| cpo.QualUsuario | `user` |
| cpo.TipoAnexo | `option.opt_anexosclifor` |

### Tbl.BugReport (`tbl.bugreport`) — 6 campos

| Campo | Tipo |
|---|---|
| cpo.AnexoUnico | `file` |
| cpo.AnexosLista | `list.file` |
| cpo.Descricao | `text` |
| cpo.ParteDoSistema | `option.opt_localdosistema` |
| cpo.StatusBug | `option.opt_statusbug` |
| cpo.Titulo | `text` |

### Tbl.cnpjformatado (`tbl.cnpjformatado`) — 2 campos

| Campo | Tipo |
|---|---|
| cnpj formatado | `text` |
| qual grupoclifor | `custom.tbl.grupoclifor` |

### Tbl.Cobrancas (`tbl.cobrancas`) — 5 campos

| Campo | Tipo |
|---|---|
| cpo.AnexoFile | `file` |
| cpo.AnexoLink | `text` |
| cpo.NumeroCobranca | `number` |
| cpo.QuaisContasReceber | `list.custom.tbl.contasreceber` |
| cpo.QualFornecedor | `custom.tbl.grupoclifor` |

### Tbl.ConfigSistema (`tbl.configsistema`) — 15 campos

| Campo | Tipo |
|---|---|
| cpo.ValorBoolean1 | `boolean` |
| cpo.CodigoConfig | `number` |
| cpo.ValorNumero | `number` |
| cpo.NomeConfig | `text` |
| cpo.QuaisDeptos | `list.option.opt_deptousuario` |
| cpo.QuaisPerfis | `list.option.opt_perfilusuario` |
| cpo.QuaisUsuarios | `list.user` |
| cpo.QualGrupoConfig | `option.cpo_grupodeconfigssistema` |
| cpo.QualMenuConfig | `option.opt_submenu` |
| cpo.QualPagina | `option.opt_menu` |
| cpo.ValorBoolean2 | `boolean` |
| cpo.ValorDataHora2 | `date` |
| cpo.ValorDataHora1 | `date` |
| cpo.ValorTexto2 | `text` |
| cpo.ValorTexto1 | `text` |

### Tbl.ContasPagar (`tbl.contaspagar`) — 41 campos

| Campo | Tipo |
|---|---|
| cpo.AnexoNfMegabox | `file` |
| cpo.CobrancaNum | `number` |
| cpo.DataBaixaSistema | `date` |
| cpo.DataEntrega | `date` |
| cpo.DataEstorno | `date` |
| cpo.DataNfMegabox | `date` |
| cpo.DataPedido | `date` |
| cpo.DataPrevEntrega | `date` |
| cpo.DataRecebimentoBancocaixa | `date` |
| cpo.DataVencimento | `date` |
| cpo.Importado | `boolean` |
| cpo.MotivoAlteraComissao | `text` |
| cpo.NumeroPedido | `text` |
| cpo.NumNfFornecedor | `text` |
| cpo.NumNfMegabox | `text` |
| cpo.QdtParcelas | `option.opt_parcelasreceber` |
| cpo.QuaisCobrancas | `list.custom.tbl.cobrancas` |
| cpo.QuaisEntregas | `list.custom.tbl.entregas` |
| cpo.QuaisHistoricos | `list.custom.tbl.historico` |
| cpo.QualCliente | `custom.tbl.grupoclifor` |
| cpo.QualCobranca | `custom.tbl.cobrancas` |
| cpo.QualCotacao | `custom.tbl.cotacao` |
| cpo.QualDestino | `custom.tbl.enderecosclifor` |
| cpo.QualEntrega | `custom.tbl.entregas` |
| cpo.QualFornecedor | `custom.tbl.grupoclifor` |
| cpo.QualMetaFechada | `custom.tbl.metasfechadas` |
| cpo.QualOrcamentoFornecedor | `custom.tbl.orcfornecedorescotacao` |
| cpo.QualOrigem | `custom.tbl.enderecosclifor` |
| cpo.QualPedido | `custom.tbl.pedido` |
| cpo.QualPrazo | `option.opt_parcelasreceber` |
| cpo.QualProposta | `custom.tbl.propostas` |
| cpo.QuemBaixou | `user` |
| cpo.QuemEstornou | `user` |
| cpo.StatusFinanceiro | `option.opt_statusfinanceiro` |
| cpo.ValorUnit | `number` |
| cpo.ValorComissao | `number` |
| cpo.ValorComissaoUnitario | `number` |
| cpo.ValorTotal | `number` |
| cpo.Qtd | `number` |
| cpo.QualVendedor | `user` |
| opt.MotivoAlterarComissao - deleted | `list.text` |

### Tbl.ContasReceber (`tbl.contasreceber`) — 40 campos

| Campo | Tipo |
|---|---|
| cpo.AnexoNfMegabox | `file` |
| cpo.Arquivado | `boolean` |
| cpo.CobrancaNum | `number` |
| cpo.DataBaixaSistema | `date` |
| cpo.DataEntrega | `date` |
| cpo.DataEstorno | `date` |
| cpo.DataNfMegabox | `date` |
| cpo.DataPedido | `date` |
| cpo.DataPrevEntrega | `date` |
| cpo.DataRecebimentoBancocaixa | `date` |
| cpo.DataVencimento | `date` |
| cpo.GerouReciboRecebimento | `boolean` |
| cpo.Importado | `boolean` |
| cpo.MotivoAlteraComissao | `text` |
| cpo.NumeroPedido | `text` |
| cpo.NumNfFornecedor | `text` |
| cpo.NumNfMegabox | `text` |
| cpo.QdtParcelas | `option.opt_parcelasreceber` |
| cpo.QuaisCobrancas | `list.custom.tbl.cobrancas` |
| cpo.QuaisHistoricos | `list.custom.tbl.historico` |
| cpo.QualCliente | `custom.tbl.grupoclifor` |
| cpo.QualCobranca | `custom.tbl.cobrancas` |
| cpo.QualCotacao | `custom.tbl.cotacao` |
| cpo.QualDestino | `custom.tbl.enderecosclifor` |
| cpo.QualEntrega | `custom.tbl.entregas` |
| cpo.QualFornecedor | `custom.tbl.grupoclifor` |
| cpo.QualOrcamentoFornecedor | `custom.tbl.orcfornecedorescotacao` |
| cpo.QualOrigem | `custom.tbl.enderecosclifor` |
| cpo.QualPedido | `custom.tbl.pedido` |
| cpo.QualPrazo | `option.opt_parcelasreceber` |
| cpo.QualProposta | `custom.tbl.propostas` |
| cpo.QuemBaixou | `user` |
| cpo.QuemEstornou | `user` |
| cpo.StatusFinanceiro | `option.opt_statusfinanceiro` |
| cpo.ValorUnit | `number` |
| cpo.ValorComissao | `number` |
| cpo.ValorComissaoUnitario | `number` |
| cpo.ValorTotal | `number` |
| cpo.Qtd | `number` |
| cpo.QualVendedor | `user` |

### Tbl.ContasReceberImportado (`tbl.contasreceberimportado`) — 19 campos

| Campo | Tipo |
|---|---|
| cpo.cliente | `text` |
| cpo.dtentrega | `date` |
| cpo.dtnf | `date` |
| cpo.dtvcto | `date` |
| cpo.dtvenda | `date` |
| cpo.fornecedor | `text` |
| cpo.numNF | `text` |
| cpo.produto | `text` |
| cpo.qtd | `number` |
| cpo.QualCliente | `custom.tbl.grupoclifor` |
| cpo.QualDestino | `custom.tbl.enderecosclifor` |
| cpo.QualOrigem | `custom.tbl.enderecosclifor` |
| cpo.QualFornecedor | `custom.tbl.grupoclifor` |
| cpo.QualProduto | `custom.tbl.produtosmodelo` |
| cpo.QualVendedor | `user` |
| cpo.uf | `option.opt_ufs` |
| cpo.valorcomissao | `number` |
| cpo.valornota | `number` |
| cpo.vendedor | `text` |

### Tbl.ContatoCliFor (`tbl.contatoclifor`) — 10 campos

| Campo | Tipo |
|---|---|
| cpo.ativo | `boolean` |
| cpo.Cargo | `text` |
| cpo.Email | `text` |
| cpo.EmailPrincipal | `text` |
| cpo.NomeContato | `text` |
| cpo.QualEndereço | `custom.tbl.enderecosclifor` |
| cpo.QualGrupoCliFor | `custom.tbl.grupoclifor` |
| cpo.Telefone | `text` |
| cpo.TipoTelefone | `option.opt_tipotelefone` |
| cpoTipoClifor | `option.opt_tipoclifor` |

### Tbl.Cotacao (`tbl.cotacao`) — 13 campos

| Campo | Tipo |
|---|---|
| Cpo.Amostra | `boolean` |
| cpo.Arquivado | `boolean` |
| cpo.DataValidade | `date` |
| cpo.EmpresaMegabox | `option.opt_empresamegabox` |
| cpo.CotacaoEtapa | `option.opt_etapas` |
| cpo.MotivoArquivamento | `option.opt_motivoarquivamento` |
| cpo.CotacaoNum | `number` |
| cpo.CotacaoStatus | `option.opt_orcamentostatus` |
| cpo.QuaisProdutos | `list.custom.tbl.cotacaoprodutos` |
| cpo.QuaisPropostas | `list.custom.tbl.propostas` |
| cpo.QualCliente | `custom.tbl.grupoclifor` |
| cpo.QualPedido | `custom.tbl.pedido` |
| cpo.QualVendedor | `user` |

### Tbl.CotacaoProdutos (`tbl.cotacaoprodutos`) — 10 campos

| Campo | Tipo |
|---|---|
| cpo.Condicao | `option.opt_produtoscondicao` |
| cpo.Linha | `option.opt_produtoslinhas` |
| cpo.Medida | `text` |
| cpo.Qtd | `number` |
| cpo.QuaisOrcamentosForncededores | `list.custom.tbl.orcfornecedorescotacao` |
| cpo.QualCliente | `custom.tbl.grupoclifor` |
| cpo.QualEnderecoDestino | `custom.tbl.enderecosclifor` |
| cpo.QualCotacao | `custom.tbl.cotacao` |
| cpo.QualProdutoModelo | `custom.tbl.produtosmodelo` |
| cpo.QualProdutoGrupo | `custom.tbl.produtosgrupo` |

### Tbl.EnderecosCliFor (`tbl.enderecosclifor`) — 32 campos

| Campo | Tipo |
|---|---|
| cpo.Ativo | `boolean` |
| cpo.Bairro | `text` |
| cpo.Liberado | `boolean` |
| cpo.LiberadoMotivo | `text` |
| cpo.CapacidadeCompra | `text` |
| cpo.Cep | `text` |
| cpo.CnpjCpf | `text` |
| cpo.Complemento | `text` |
| cpo.Corporativo | `boolean` |
| cpo.Demanda | `text` |
| cpo.Endereco | `text` |
| cpo.Fantasia | `text` |
| cpo.Frete | `option.opt_tipofrete` |
| cpo.IdCliforAntigo | `number` |
| cpo.InscEstadual | `text` |
| cpo.InscMunicipal | `text` |
| cpo.Localizacaoo | `geographic_address` |
| cpo.Municipio | `text` |
| cpo.NomeComprador | `text` |
| cpo.NomeEndereco | `text` |
| cpo.Observacoes | `text` |
| cpo.Principal | `boolean` |
| cpo.QuaisAnexos | `list.custom.tbl.anexos` |
| cpo.QuaisProdutos | `list.custom.tbl.produtosmodelo` |
| cpo.QualGrupoCliFor | `custom.tbl.grupoclifor` |
| cpo.QualNomeGrupoCliFor | `text` |
| cpo.QualRegimeTributario | `option.opt_regimetributario` |
| cpo.QualUfOpt | `option.opt_ufs` |
| cpo.Razao | `text` |
| cpo.TipoClifor | `option.opt_tipoclifor` |
| cpo.TipoPessoa | `option.opt_tipopessoa` |
| cpo.UF | `text` |

### Tbl.Entregas (`tbl.entregas`) — 41 campos

| Campo | Tipo |
|---|---|
| cpo.BoletoFile | `file` |
| cpo.BoletoArquivos | `list.file` |
| cpo.ComprovanteEntrega | `file` |
| cpo.DtPrevEntrega | `date` |
| cpo.DtNfRecebimento | `date` |
| cpo.DtEmissaoNf | `date` |
| cpo.DtEntrega | `date` |
| cpo.DtPedido | `date` |
| cpo.Importado | `boolean` |
| cpo.MotivoAlteracaoValores | `text` |
| cpo.MotivoCancelamento | `text` |
| cpo.NaoEmiteNF | `boolean` |
| cpo.ArquivoNfFornecedor | `file` |
| cpo.NumNfMegabox | `text` |
| cpo.NumNfFornecedor | `text` |
| cpo.NotaBoletoEnviada | `boolean` |
| cpo.NumeroEntrega | `text` |
| cpo.PedidoFinalizado | `boolean` |
| cpo.QtdEntrega | `number` |
| cpo.QuaisContasPagar | `list.custom.tbl.contaspagar` |
| cpo.QuaisContasReceber | `list.custom.tbl.contasreceber` |
| cpo.QualCliente | `custom.tbl.grupoclifor` |
| cpo.QualClienteTexto | `text` |
| cpo.QualCotacao | `custom.tbl.cotacao` |
| cpo.QualFornecedor | `custom.tbl.grupoclifor` |
| cpo.QualFornecedTexto | `text` |
| cpo.QualMetaFechada | `custom.tbl.metasfechadas` |
| cpo.QualOrcamentoFornecedor | `custom.tbl.orcfornecedorescotacao` |
| cpo.QualPedido | `custom.tbl.pedido` |
| cpo.QualProposta | `custom.tbl.propostas` |
| cpo.QualVendedorSubstituto | `user` |
| cpo.SaiuEntrega | `boolean` |
| cpo.StatusEntrega | `option.opt_etapas` |
| cpo.StatusFinanceiro | `option.opt_statusfinanceiro` |
| cpo.ValorVendaBruto | `number` |
| cpo.ValorComissaoBruto | `number` |
| cpo.ValorComissaoUnitario | `number` |
| cpo.ValorVendaLiquido | `number` |
| cpo.ValorVendaLiquidoUnitario | `number` |
| cpo.ValorVendaBrutoUnitario | `number` |
| cpo.QualVendedor | `user` |

### Tbl.GrupoCliFor (`tbl.grupoclifor`) — 24 campos

| Campo | Tipo |
|---|---|
| cpo.Ativo | `boolean` |
| cpo.Liberado | `boolean` |
| cpo.LiberadoMotivo | `text` |
| cpo.CapacidadeCompra | `text` |
| cpo.Captacao | `option.opt_captacaocliente` |
| cpo.Observacoes | `text` |
| cpo.Corporativo | `boolean` |
| cpo.Demanda | `text` |
| cpo.EmailPrincipal | `text` |
| cpo.NãoFazContratoParceria | `boolean` |
| cpo.Foto | `image` |
| cpo.Frete | `option.opt_tipofrete` |
| cpo.NomeCliFor | `text` |
| cpo.NomeComprador | `text` |
| cpo.PossuiFiliais | `boolean` |
| cpo.QuaisAnexos | `list.custom.tbl.anexos` |
| cpo.QuaisContatos | `list.custom.tbl.contatoclifor` |
| cpo.QuaisEnderecos | `list.custom.tbl.enderecosclifor` |
| cpo.QualCarteira | `user` |
| cpo.QualProduto | `text` |
| cpo.QualTipoCliFor | `option.opt_tipoclifor` |
| cpo.UltimoHistoricoData | `date` |
| cpo.UltimoHistoricoMsg | `custom.tbl.historico` |
| cpo.UltimoQue(Des)ativou | `user` |

### Tbl.Historico (`tbl.historico`) — 7 campos

| Campo | Tipo |
|---|---|
| cpo.AnexoFile | `file` |
| cpo.AnexoLink | `text` |
| cpo.Descricao | `text` |
| cpo.QualClifor | `custom.tbl.grupoclifor` |
| cpo.QualDepto | `option.opt_deptousuario` |
| cpo.QualUnidade | `custom.tbl.enderecosclifor` |
| cpo.QualVendedor | `user` |

### Tbl.IcmsEstados (`tbl.icmsestados`) — 3 campos

| Campo | Tipo |
|---|---|
| cpo.AliquotaIcms | `number` |
| cpo.Destino | `option.opt_ufs` |
| cpo.Origem | `option.opt_ufs` |

### Tbl.MetaAdicional (`tbl.metaadicional`) — 5 campos

| Campo | Tipo |
|---|---|
| cpo.DataFim | `date` |
| cpo.DataInicio | `date` |
| cpo.QualNivel | `custom.tbl.niveisvendedores` |
| cpo.QualUsuario | `user` |
| cpo.Valor | `number` |

### Tbl.MetasFechadas (`tbl.metasfechadas`) — 11 campos

| Campo | Tipo |
|---|---|
| cpo.AnoNumero | `number` |
| cpo.DataFim | `date` |
| cpo.DataInicio | `date` |
| cpo.MesNome | `text` |
| cpo.MesNumero | `number` |
| cpo.QuaisContasPagar | `list.custom.tbl.contaspagar` |
| cpo.QuaisContasReceber | `list.custom.tbl.contasreceber` |
| cpo.QuaisEntregas | `list.custom.tbl.entregas` |
| cpo.QualVendedor | `user` |
| cpo.TotalComissaoMegabox | `number` |
| cpo.TotalComissaoVendedor | `number` |

### Tbl.MetasMensais (`tbl.metasmensais`) — 10 campos

| Campo | Tipo |
|---|---|
| cpo.DataFim | `date` |
| cpo.DataInicio | `date` |
| cpo.DataPeriodo | `date_range` |
| cpo.Observacao | `text` |
| cpo.QualMetaFechada | `custom.tbl.metasfechadas` |
| cpo.QualNivel | `custom.tbl.niveisvendedores` |
| cpo.QualVendedor | `user` |
| cpo.RankingVendas | `number` |
| cpo.TipoMeta | `option.opt_tipometa` |
| cpo.ValorMeta | `number` |

### Tbl.NiveisVendedores (`tbl.niveisvendedores`) — 8 campos

| Campo | Tipo |
|---|---|
| cpo.ComissaoPadrao | `number` |
| cpo.QtdMetaBatida | `number` |
| cpo.ComissaoMetaBatida | `number` |
| cpo.MetaVenda | `number` |
| cpo.NomeNivel | `text` |
| cpo.Ordem | `number` |
| cpo.QuaisVendedores | `list.user` |
| cpo.old_ValorBonus | `number` |

### Tbl.OrcFornecedoresCotacao (`tbl.orcfornecedorescotacao`) — 31 campos

| Campo | Tipo |
|---|---|
| cpo.Condicao | `option.opt_produtoscondicao` |
| cpo.FreteFracionado | `boolean` |
| cpo.Importado | `boolean` |
| cpo.Linha | `option.opt_produtoslinhas` |
| cpo.Medida | `text` |
| cpo.QtdVenda | `number` |
| cpo.QuaisEntregas | `list.custom.tbl.entregas` |
| cpo.QualEndereçoCobrança | `custom.tbl.enderecosclifor` |
| cpo.QualEnderecoDestino | `custom.tbl.enderecosclifor` |
| cpo.QualEnderecoOrigem | `custom.tbl.enderecosclifor` |
| cpo.QualFornecedor | `custom.tbl.grupoclifor` |
| cpo.QualCotacao | `custom.tbl.cotacao` |
| cpo.QualProdutoModelo | `custom.tbl.produtosmodelo` |
| cpo.QualProposta | `custom.tbl.propostas` |
| cpo.QualVendedor | `user` |
| cpo.TipoFrete | `option.opt_tipofrete` |
| cpo.TributoIPI | `number` |
| cpo.TributoPISCOFINS | `number` |
| cpo.TributosICMS | `number` |
| cpo.ValorComissaoUnit | `number` |
| cpo.ValorComissaoBruto | `number` |
| cpo.ValorFrete | `number` |
| cpo.ValorICMS | `number` |
| cpo.ValorIPI | `number` |
| cpo.ValorPISCOFINS | `number` |
| cpo.ValorUnitLiquido | `number` |
| cpo.ValorVendaUnit | `number` |
| cpo.ValorVendaBruto | `number` |
| cpo.ValorVendaLiquido | `number` |
| cpo.Vencedor | `boolean` |
| cpo.QualCotacaoProduto | `custom.tbl.cotacaoprodutos` |

### Tbl.Pedido (`tbl.pedido`) — 28 campos

| Campo | Tipo |
|---|---|
| cpo.ContaEmail | `number` |
| cpo.CorpoEmailFornecedor | `text` |
| cpo.CorpoEmailCliente | `text` |
| cpo.EmailCliente | `custom.tbl.contatoclifor` |
| cpo.EmailFornecedorCC | `text` |
| cpo.EmailFornecedor | `custom.tbl.contatoclifor` |
| cpo.EmailClienteCC | `text` |
| cpo.PedidoFinalizado | `boolean` |
| cpo.FormaPagto | `option.opt_formapgto` |
| cpo.InformacoesAdd | `text` |
| cpo.MotivoAlteraValores | `text` |
| cpo.MotivoCancelamento | `text` |
| cpo.NumeroPedido | `text` |
| cpo.OrdemCompraArquivo | `file` |
| cpo.OrdemComrpaNum | `text` |
| cpo.PedidoArquivo | `file` |
| cpo.Importado | `boolean` |
| cpo.PedidoFormalizado | `boolean` |
| cpo.PrazoRecebComissoes | `list.option.opt_parcelasreceber` |
| cpo.QuaisEntregas | `list.custom.tbl.entregas` |
| cpo.QuaisOrcamentosFonecedores | `list.custom.tbl.orcfornecedorescotacao` |
| cpo.QualCliente | `custom.tbl.grupoclifor` |
| cpo.QualClienteTexto | `text` |
| cpo.QualCotacao | `custom.tbl.cotacao` |
| cpo.QualEtapa | `option.opt_etapas` |
| cpo.QualPrimeiroFornecedor | `custom.tbl.enderecosclifor` |
| cpo.QualProposta | `custom.tbl.propostas` |
| cpo.QualVendedor | `user` |

### Tbl.PerfilUsuario (`tbl.perfilusuario`) — 1 campos

| Campo | Tipo |
|---|---|
| cpo.QualOptPerfil | `option.opt_perfilusuario` |

### Tbl.ProdutosGrupo (`tbl.produtosgrupo`) — 2 campos

| Campo | Tipo |
|---|---|
| cpo.NomeGrupo | `text` |
| cpo.QualTipoProduto | `custom.tbl.produtostipo` |

### Tbl.ProdutosModelo (`tbl.produtosmodelo`) — 14 campos

| Campo | Tipo |
|---|---|
| cpo.Ativo | `boolean` |
| cpo.Descricao | `text` |
| cpo.FotoFrontal | `image` |
| cpo.FotoInferior | `image` |
| cpo.FotoLateral | `image` |
| cpo.NomeModelo | `text` |
| cpo.QuaisCondicoes | `list.option.opt_produtoscondicao` |
| cpo.QuaisFornecedores | `list.custom.tbl.grupoclifor` |
| cpo.QuaisFornecedoresFiliais | `list.custom.tbl.enderecosclifor` |
| cpo.QuaisLinhas | `list.option.opt_produtoslinhas` |
| cpo.QuaisVersoesProduto | `list.custom.tbl.produtoversao` |
| cpo.QualTipoProduto | `custom.tbl.produtostipo` |
| cpo.QualGrupoProduto | `custom.tbl.produtosgrupo` |
| cpo.FotoSuperior | `image` |

### Tbl.ProdutosTipo (`tbl.produtostipo`) — 2 campos

| Campo | Tipo |
|---|---|
| cpo.Icon | `image` |
| cpo.NomeTipo | `text` |

### Tbl.ProdutoVersao (`tbl.produtoversao`) — 3 campos

| Campo | Tipo |
|---|---|
| cpo.Ativo | `boolean` |
| cpo.NomeVersao | `text` |
| cpo.QualModeloProduto | `custom.tbl.produtosmodelo` |

### Tbl.Propostas (`tbl.propostas`) — 15 campos

| Campo | Tipo |
|---|---|
| cpo.AnexosDiversos | `list.file` |
| cpo.AquivoProposta | `file` |
| cpo.CondicaoPgto | `text` |
| cpo.CorpoEmail | `text` |
| cpo.DtPrevEntrega | `date` |
| cpo.EmailsCopia | `text` |
| cpo.EnviarPara | `custom.tbl.contatoclifor` |
| cpo.FaturarPara | `custom.tbl.enderecosclifor` |
| cpo.InfoAdicional | `text` |
| cpo.PropostaEnviada | `boolean` |
| cpo.PropostaNum | `number` |
| cpo.QuaisOrcamentosFornecedores | `list.custom.tbl.orcfornecedorescotacao` |
| cpo.QualCnpjFornecedor | `custom.tbl.enderecosclifor` |
| cpo.QualCotacao | `custom.tbl.cotacao` |
| cpo.QualVendedor | `user` |

### User (`user`) — 41 campos

| Campo | Tipo |
|---|---|
| cpo.Ativo | `boolean` |
| cpo.BuscaExataProxima | `text` |
| cpo.CarteiraClientes | `list.custom.tbl.grupoclifor` |
| cpo.Cidade | `text` |
| cpo.ContatosPessoais | `list.text` |
| cpo.CopiaPedido | `text` |
| cpo.CopiaCancelamentos | `text` |
| cpo.CopiaProposta | `text` |
| cpo.Cpf | `text` |
| cpo.EmailContato | `text` |
| cpo.EmailLoginTexto | `text` |
| cpo.Endereço | `text` |
| cpo.ExpandirCadastroClifor | `boolean` |
| cpo.FeriasFim | `date` |
| cpo.FeriasInicio | `date` |
| cpo.FeriasPeriod | `date_range` |
| cpo.FiltraTipoClifor | `option.opt_tipoclifor` |
| cpo.Foto | `image` |
| cpo.IsDev | `boolean` |
| cpo.Menu | `option.opt_menu` |
| cpo.Nome | `text` |
| cpo.OrdenarCampos | `option.opt_ordenarcampos` |
| cpo.SelecionadosPagar | `list.custom.tbl.contaspagar` |
| cpo.PassTexto | `text` |
| cpo.QuaisAnexos | `list.custom.tbl.anexos` |
| cpo.QuaisMetasFechadas | `list.custom.tbl.metasfechadas` |
| cpo.QualDepto | `option.opt_deptousuario` |
| cpo.QualNivelVendedor | `custom.tbl.niveisvendedores` |
| cpo.QualPaginaInicial | `option.opt_menu` |
| cpo.QualPerfil | `option.opt_perfilusuario` |
| cpo.QualVendedorSubstituto | `user` |
| cpo.RankingVendaMedia | `number` |
| cpo.RankingVendaSubstituto | `number` |
| cpo.Rg | `text` |
| cpo.SubMenuConfig | `option.opt_submenu` |
| cpo.Telefone | `text` |
| cpo.SelecionadosReceber | `list.custom.tbl.contasreceber` |
| cpo.TempOrcamentoProdutos | `list.custom.tbl.cotacaoprodutos` |
| cpo.RankingVendaRegular | `number` |
| cpo.Uf | `option.opt_ufs` |
| cpo.UltimoDateRange | `date_range` |
