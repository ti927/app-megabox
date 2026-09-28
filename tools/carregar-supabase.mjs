/**
 * Carga do Bubble para o Postgres (Fase C de specs/03-plano-de-construcao.md).
 *
 * Lê o JSON de `bruto/` (ou baixa na hora, com `--baixar`) e grava no Supabase com
 * `service_role`, que é o único jeito de escrever antes de existir usuário.
 *
 * Três coisas fazem esta carga ser retomável e conferível:
 *
 *  1. **Idempotente por `bubble_id`.** Toda tabela tem a coluna (`02` §1.2) com índice
 *     único, e a gravação é `upsert` por ela. Rodar duas vezes não duplica; rodar depois
 *     de uma queda continua de onde parou.
 *  2. **Duas passadas.** A primeira grava só as colunas escalares; a segunda resolve as
 *     referências, traduzindo `bubble_id` → `uuid` já gravado. Sem isso, a ordem de
 *     inserção viraria um problema de grafo.
 *  3. **Modo relatório.** `--relatorio` não escreve nada: conta, valida e lista o que
 *     falharia. É obrigatório antes da primeira aplicação (§5.4).
 *
 * ARMADILHA que custou caro e está resolvida aqui: a Data API devolve os campos pelo
 * **nome de exibição** (`cpo.CnpjCpf`), não pelo id interno (`cpo_cnpjcpf_text`) que
 * `mapa/data-types.md` e o de-para de `02` §10 usam. Ler pelo id devolve `undefined` em
 * silêncio, e uma carga que lê nada grava nulo sem reclamar. O MAPA abaixo usa nome de
 * exibição, e `conferirMapa()` reclama de campo que não existir na amostra.
 *
 * Uso:
 *   node tools/carregar-supabase.mjs --relatorio            # confere, não grava
 *   node tools/carregar-supabase.mjs --tipos tbl.grupoclifor
 *   node tools/carregar-supabase.mjs --relatorio --baixar --tipos tbl.produtostipo,tbl.produtosgrupo,tbl.produtosmodelo,tbl.produtoversao
 *   node tools/carregar-supabase.mjs                        # carrega tudo que o MAPA cobre
 *
 * Os nomes de tipo são os da Data API (`/api/1.1/meta`), que seguem o NOME do data type
 * (`Tbl.ProdutosTipo` → `tbl.produtostipo`), e não a tabela física trocada do mapa.
 */

import { existsSync, readFileSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const LOTE = 500
/** Marca, no modo relatório, o bubble_id que ESTA rodada gravaria (ver `traduzir` em `main`). */
const PREVISTO = '(previsto)'

// ---------------------------------------------------------------------------------
// De-para. Cresce a cada fatia; hoje cobre a 2 (cadastro), a 3 (produtos) e as 4–6 (ciclo comercial).
// `col`  = colunas escalares, destino ← nome de exibição do Bubble (ou função)
// `ref`  = colunas de FK, traduzidas de bubble_id para uuid ANTES do insert
// `dom`  = colunas que apontam para lista fixa, resolvidas por chave_bubble
// `ligacoes` = LISTA dentro do registro que vira N linhas numa tabela de ligação pura
//          (pk composta, sem bubble_id — 02 §1.5). Cada item: `de` (campo lista), `dono`
//          (coluna que recebe o uuid do próprio registro), `alvo` (coluna do item) e `dom`
//          (lista fixa) OU `ref` (tabela com bubble_id). Grava com `on conflict do nothing`.
// `posCarga` = passo que roda depois da gravação do tipo (e, no relatório, só conta).
// Todo tipo ganha `criado_em` ← `Created Date` e `alterado_em` ← `Modified Date`.
//
// Acrescentados na fatia 4–6 (os tipos anteriores não usam nenhum, e nada muda para eles):
// `dom.padrao`  = id gravado quando o Bubble manda vazio. É o DEFAULT da coluna na migration
//                 repetido aqui: o supabase-js manda chave ausente como NULL, não como default.
// `ref.reserva` = função (r, contexto) → bubble_id alternativo quando `de` vem vazio.
// `preparar`    = roda antes do de-para, com acesso ao bruto de OUTROS tipos (`contexto.bruto`).
// `unicos`      = listas de colunas que o banco exige únicas; a linha repetida mais nova é
//                 descartada e contada (a mais antiga fica).
// `renumerar`   = coluna identity única em que a repetição NÃO pode ser descartada (cotação com
//                 pedido): a mais antiga fica com o número legado, e as outras são gravadas SEM a
//                 coluna, depois do `posCarga`, e ganham número novo da sequence.
// `validar`     = regra que um trigger do banco recusaria (e derrubaria o lote inteiro);
//                 devolve Map bubble_id → motivo, e a linha é descartada e contada.
// ---------------------------------------------------------------------------------
const soDigitos = (v) => String(v ?? '').replace(/\D/g, '') || null
const texto = (v) => (v === undefined || v === null || v === '' ? null : String(v))
const bool = (v) => v === true
/** Número do Bubble, ou null. Nunca NaN: `numeric` recusaria o lote. */
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
/** Para coluna `not null default 0`: vazio vira 0, que é o default da migration. */
const numOu0 = (v) => num(v) ?? 0
/**
 * Data do Bubble (instante UTC) → `date` no fuso de São Paulo. O Bubble grava a data do
 * seletor como meia-noite LOCAL (`...T03:00:00Z`); cortar a string em UTC acertaria essa, mas
 * erraria toda data gravada à noite (`DtPedido` tem horário real: 21h de SP já é o dia seguinte
 * em UTC).
 */
const FUSO = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const data = (v) => {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : FUSO.format(d)
}
const arred = (v, casas) => Number(v.toFixed(casas))
/** Compara chave e rótulo de option set sem depender de acento, caixa ou espaço. */
const normalizar = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')

const MAPA = {
  'tbl.grupoclifor': {
    tabela: 'grupos_clifor',
    obrigatorias: ['nome', 'tipo'],
    col: {
      nome: (r) => texto(r['cpo.NomeCliFor']),
      ativo: (r) => r['cpo.Ativo'] !== false,
      // ARMADILHA: cpo.Liberado tem id cpo_bloqueado_boolean — o NOME é que vale.
      liberado: (r) => r['cpo.Liberado'] !== false,
      liberado_motivo: (r) => texto(r['cpo.LiberadoMotivo']),
      // ARMADILHA: cpo.Observacoes tem id cpo_codcliente_text e NÃO é código de cliente.
      observacoes: (r) => texto(r['cpo.Observacoes']),
      nome_comprador: (r) => texto(r['cpo.NomeComprador']),
      capacidade_compra: (r) => texto(r['cpo.CapacidadeCompra']),
      demanda: (r) => texto(r['cpo.Demanda']),
      email_principal: (r) => texto(r['cpo.EmailPrincipal']),
      corporativo: (r) => bool(r['cpo.Corporativo']),
      possui_filiais: (r) => bool(r['cpo.PossuiFiliais']),
      nao_faz_contrato_parceria: (r) => bool(r['cpo.NãoFazContratoParceria']),
      codigo_legado: (r) => (r['cpo.IdCliforAntigo'] ?? null),
    },
    dom: {
      tipo: { de: 'cpo.QualTipoCliFor', enum: ['cliente', 'fornecedor'] }, // public.tipo_clifor
      captacao_id: { de: 'cpo.Captacao', tabela: 'captacoes' },
      frete_id: { de: 'cpo.Frete', tabela: 'tipos_frete' },
    },
    ref: {
      // Só cliente tem carteira: o check `carteira_so_cliente` (006) recusa em fornecedor, e o
      // Bubble tem 5 fornecedores com vendedor. O ponteiro deles é ignorado, não traduzido.
      carteira_id: { de: 'cpo.QualCarteira', tabela: 'usuarios', se: (linha) => linha.tipo === 'cliente' },
    },
  },

  'tbl.enderecosclifor': {
    tabela: 'enderecos_clifor',
    obrigatorias: ['grupo_id', 'nome_endereco', 'tipo_pessoa', 'regime_tributario_id', 'uf'],
    col: {
      nome_endereco: (r) => texto(r['cpo.NomeEndereco']),
      razao: (r) => texto(r['cpo.Razao']),
      fantasia: (r) => texto(r['cpo.Fantasia']),
      documento: (r) => soDigitos(r['cpo.CnpjCpf']),
      insc_estadual: (r) => texto(r['cpo.InscEstadual']),
      insc_municipal: (r) => texto(r['cpo.InscMunicipal']),
      cep: (r) => soDigitos(r['cpo.Cep']),
      logradouro: (r) => texto(r['cpo.Endereco']),
      complemento: (r) => texto(r['cpo.Complemento']),
      bairro: (r) => texto(r['cpo.Bairro']),
      municipio: (r) => texto(r['cpo.Municipio']),
      ativo: (r) => r['cpo.Ativo'] !== false,
      liberado: (r) => r['cpo.Liberado'] !== false,
      liberado_motivo: (r) => texto(r['cpo.LiberadoMotivo']),
      corporativo: (r) => bool(r['cpo.Corporativo']),
      nome_comprador: (r) => texto(r['cpo.NomeComprador']),
      capacidade_compra: (r) => texto(r['cpo.CapacidadeCompra']),
      demanda: (r) => texto(r['cpo.Demanda']),
      observacoes: (r) => texto(r['cpo.Observacoes']),
      // `principal` NÃO vem do Bubble: lá é true em toda filial e nunca lido
      // (02 §2.1.8). A escolha de um por grupo é o `posCarga` abaixo. A coluna fica FORA
      // do upsert de propósito: gravar `false` aqui apagaria a escolha a cada recarga.
      // tipo_pessoa é derivado do tamanho, porque o campo do Bubble é texto livre.
      tipo_pessoa: (r) => {
        const d = soDigitos(r['cpo.CnpjCpf'])
        return d?.length === 11 ? 'cpf' : d?.length === 14 ? 'cnpj' : null
      },
    },
    dom: {
      // Duas fontes de UF; a option set vence e o texto é reserva (02 §3.2).
      uf: { de: 'cpo.QualUfOpt', reserva: 'cpo.UF', tabela: 'ufs', porSigla: true },
      regime_tributario_id: { de: 'cpo.QualRegimeTributario', tabela: 'regimes_tributarios' },
      frete_id: { de: 'cpo.Frete', tabela: 'tipos_frete' },
    },
    ref: {
      grupo_id: { de: 'cpo.QualGrupoCliFor', tabela: 'grupos_clifor', obrigatorio: true },
    },
    posCarga: escolherPrincipal,
  },

  'tbl.contatoclifor': {
    tabela: 'contatos_clifor',
    obrigatorias: ['grupo_id', 'nome'],
    col: {
      nome: (r) => texto(r['cpo.NomeContato']),
      cargo: (r) => texto(r['cpo.Cargo']),
      email: (r) => texto(r['cpo.Email']),
      telefone: (r) => texto(r['cpo.Telefone']),
      // No Bubble nasce vazio e a lista não filtra por ele (02 §3.2): nulo vira true.
      ativo: (r) => r['cpo.ativo'] !== false,
    },
    dom: {
      tipo_telefone_id: { de: 'cpo.TipoTelefone', tabela: 'tipos_telefone' },
    },
    ref: {
      grupo_id: { de: 'cpo.QualGrupoCliFor', tabela: 'grupos_clifor', obrigatorio: true },
      endereco_id: { de: 'cpo.QualEndereço', tabela: 'enderecos_clifor' },
    },
  },

  // ------------------------------------------------------------------ fatia 3: produtos
  // ARMADILHA do mapa, que NÃO se aplica aqui: Tbl.ProdutosTipo mora na tabela física
  // tbl_produtosgrupo e Tbl.ProdutosGrupo em tbl_produtossubgrupo (trocadas). A Data API fala
  // pelo NOME do data type, então `tbl.produtostipo` é o tipo mesmo. Não "corrija" invertendo.
  // Fotos e ícone (`*_path`) ficam de fora: o Bubble manda URL do CDN, e a coluna é caminho no
  // Storage privado. Entram no passo de arquivos (o mesmo de `anexos`), não aqui.
  'tbl.produtostipo': {
    tabela: 'produto_tipos',
    obrigatorias: ['nome'],
    col: {
      nome: (r) => texto(r['cpo.NomeTipo']),
    },
  },

  'tbl.produtosgrupo': {
    tabela: 'produto_grupos',
    obrigatorias: ['tipo_id', 'nome'],
    col: {
      nome: (r) => texto(r['cpo.NomeGrupo']),
    },
    ref: {
      tipo_id: { de: 'cpo.QualTipoProduto', tabela: 'produto_tipos', obrigatorio: true },
    },
  },

  'tbl.produtosmodelo': {
    tabela: 'produtos',
    obrigatorias: ['nome'],
    col: {
      nome: (r) => texto(r['cpo.NomeModelo']),
      descricao: (r) => texto(r['cpo.Descricao']),
      ativo: (r) => r['cpo.Ativo'] !== false,
    },
    ref: {
      tipo_id: { de: 'cpo.QualTipoProduto', tabela: 'produto_tipos' },
      grupo_id: { de: 'cpo.QualGrupoProduto', tabela: 'produto_grupos' },
    },
    // `cpo.QuaisVersoesProduto` NÃO entra: espelha `ProdutoVersao.QualModeloProduto` (conferido
    // na base: as duas batem 100%), e a FK do lado N já diz tudo (02 §1.5).
    // `cpo.QuaisFornecedores` (lista por GRUPO) é DESCARTADA: vale a da filial (02 §3.2).
    ligacoes: {
      produto_linhas: { de: 'cpo.QuaisLinhas', dono: 'produto_id', alvo: 'linha_id', dom: 'linhas_produto' },
      produto_condicoes: {
        de: 'cpo.QuaisCondicoes',
        dono: 'produto_id',
        alvo: 'condicao_id',
        dom: 'condicoes_produto',
      },
      fornecedor_produtos: {
        de: 'cpo.QuaisFornecedoresFiliais',
        dono: 'produto_id',
        alvo: 'endereco_fornecedor_id',
        ref: 'enderecos_clifor',
      },
    },
  },

  'tbl.produtoversao': {
    tabela: 'produto_versoes',
    obrigatorias: ['produto_id', 'nome'],
    col: {
      nome: (r) => texto(r['cpo.NomeVersao']),
      ativo: (r) => r['cpo.Ativo'] !== false,
    },
    ref: {
      produto_id: { de: 'cpo.QualModeloProduto', tabela: 'produtos', obrigatorio: true },
    },
  },

  // ------------------------------------------------------ fatias 4–6: ciclo comercial
  // A ORDEM das chaves é a ordem da carga sem `--tipos`: cada tipo aponta só para os anteriores
  // (item → cotação; orçamento → item; proposta_itens → orçamento; entrega → pedido e orçamento).
  //
  // BLOQUEIO CONHECIDO: com a Data API anônima (BUBBLE_API_KEY vazia), `tbl.cotacaoprodutos` e
  // `tbl.propostas` devolvem ZERO linhas — as regras de privacidade negam busca a "everyone" nesses
  // dois tipos. Sem item não entra orçamento (`cotacao_item_id` é not null), e sem orçamento não
  // entra entrega nem proposta_itens. O de-para abaixo está pronto para quando a chave de admin
  // estiver no .env; os nomes de `tbl.cotacaoprodutos` e `tbl.propostas` saíram de
  // `mapa/data-types.md` e NÃO foram conferidos contra a API (não há linha para conferir).
  //
  // Arquivos (`*Arquivo`, `BoletoArquivos`, `ComprovanteEntrega`, `AquivoProposta`) ficam de fora
  // pelo mesmo motivo das fotos de produto: o Bubble manda URL do CDN, a coluna é caminho no
  // Storage privado. Entram no passo de arquivos. `entrega_arquivos` nasce desse passo.

  'tbl.cotacao': {
    tabela: 'cotacoes',
    obrigatorias: ['numero', 'cliente_id', 'vendedor_id', 'empresa_emissora_id', 'etapa_id', 'status_id'],
    col: {
      // Número legado gravado explicitamente (D7 da 007). 7 números repetidos na base (corrida do
      // "último + 1", vendas.md §5.7): ver `renumerar`.
      numero: (r) => num(r['cpo.CotacaoNum']),
      data_validade: (r) => data(r['cpo.DataValidade']),
      // ARMADILHA: `Cpo.Amostra` com C MAIÚSCULO — é o único campo do tipo assim.
      amostra: (r) => bool(r['Cpo.Amostra']),
      arquivado: (r) => bool(r['cpo.Arquivado']),
      rascunho: () => false,
    },
    dom: {
      empresa_emissora_id: { de: 'cpo.EmpresaMegabox', tabela: 'empresas_emissoras' },
      etapa_id: { de: 'cpo.CotacaoEtapa', tabela: 'etapas', padrao: 1 },
      status_id: { de: 'cpo.CotacaoStatus', tabela: 'cotacao_status', padrao: 1 },
      motivo_arquivamento_id: { de: 'cpo.MotivoArquivamento', tabela: 'motivos_arquivamento' },
    },
    ref: {
      cliente_id: { de: 'cpo.QualCliente', tabela: 'grupos_clifor' },
      vendedor_id: { de: 'cpo.QualVendedor', tabela: 'usuarios' },
    },
    // `QuaisProdutos`/`QuaisPropostas` não migram (FK do lado N); `QualPedido` também não:
    // `pedidos.cotacao_id` diz tudo.
    renumerar: 'numero',
    posCarga: ajustarSequenciaCotacao,
  },

  'tbl.cotacaoprodutos': {
    tabela: 'cotacao_itens',
    obrigatorias: ['cotacao_id', 'produto_id', 'qtd', 'endereco_destino_id'],
    col: {
      qtd: (r) => (num(r['cpo.Qtd']) > 0 ? num(r['cpo.Qtd']) : null), // check qtd > 0
      medida: (r) => texto(r['cpo.Medida']),
    },
    dom: {
      linha_id: { de: 'cpo.Linha', tabela: 'linhas_produto' },
      condicao_id: { de: 'cpo.Condicao', tabela: 'condicoes_produto' },
    },
    ref: {
      cotacao_id: { de: 'cpo.QualCotacao', tabela: 'cotacoes' },
      produto_id: { de: 'cpo.QualProdutoModelo', tabela: 'produtos' },
      grupo_produto_id: { de: 'cpo.QualProdutoGrupo', tabela: 'produto_grupos' },
      endereco_destino_id: { de: 'cpo.QualEnderecoDestino', tabela: 'enderecos_clifor' },
    },
    // `QualCliente` sai (vem por join da cotação); `QuaisOrcamentosForncededores` sai (FK do lado N).
  },

  'tbl.orcfornecedorescotacao': {
    tabela: 'orcamentos_fornecedor',
    obrigatorias: [
      'cotacao_item_id',
      'fornecedor_id',
      'endereco_origem_id',
      'endereco_destino_id',
      'produto_id',
      'vendedor_id',
      'qtd_venda',
    ],
    preparar: escolherVencedores,
    col: {
      qtd_venda: (r) => (num(r['cpo.QtdVenda']) > 0 ? num(r['cpo.QtdVenda']) : null), // check > 0
      medida: (r) => texto(r['cpo.Medida']),
      valor_venda_unit: (r) => numOu0(r['cpo.ValorVendaUnit']),
      valor_comissao_unit: (r) => numOu0(r['cpo.ValorComissaoUnit']),
      valor_frete: (r) => numOu0(r['cpo.ValorFrete']),
      frete_fracionado: (r) => bool(r['cpo.FreteFracionado']),
      // Alíquotas EXPLÍCITAS, vazio → 0 (comentário de fn_orcamento_derivados, 007): com nulo o
      // trigger consultaria a tabela de ICMS de HOJE para uma linha histórica. Já são fração no
      // Bubble (0.12), que é a unidade da coluna.
      aliquota_icms: (r) => numOu0(r['cpo.TributosICMS']),
      aliquota_pis_cofins: (r) => numOu0(r['cpo.TributoPISCOFINS']),
      aliquota_ipi: (r) => numOu0(r['cpo.TributoIPI']),
      vencedor: (r) => bool(r['cpo.Vencedor']) && !vencedorRebaixado.has(r._id),
    },
    // Os valores calculados do Bubble (ValorVendaBruto, ValorICMS, ValorPISCOFINS, líquido,
    // unitário líquido, comissão bruta) NÃO são lidos: aqui são colunas GERADAS e a view
    // v_orcamento_valores. O orçamento é cálculo em aberto, não dinheiro fechado — o fechado
    // está na entrega, que preserva o valor do Bubble (ver `tbl.entregas`).
    // `cotacao_id` também não: o trigger fn_orcamento_derivados o deriva do item (D6).
    dom: {
      tipo_frete_id: { de: 'cpo.TipoFrete', tabela: 'tipos_frete', padrao: 1 },
      linha_id: { de: 'cpo.Linha', tabela: 'linhas_produto' },
      condicao_id: { de: 'cpo.Condicao', tabela: 'condicoes_produto' },
    },
    ref: {
      cotacao_item_id: { de: 'cpo.QualCotacaoProduto', tabela: 'cotacao_itens' },
      fornecedor_id: { de: 'cpo.QualFornecedor', tabela: 'grupos_clifor' },
      endereco_origem_id: { de: 'cpo.QualEnderecoOrigem', tabela: 'enderecos_clifor' },
      endereco_destino_id: { de: 'cpo.QualEnderecoDestino', tabela: 'enderecos_clifor' },
      endereco_cobranca_id: { de: 'cpo.QualEndereçoCobrança', tabela: 'enderecos_clifor' },
      produto_id: { de: 'cpo.QualProdutoModelo', tabela: 'produtos' },
      vendedor_id: { de: 'cpo.QualVendedor', tabela: 'usuarios' },
    },
  },

  'tbl.propostas': {
    tabela: 'propostas',
    obrigatorias: ['cotacao_id', 'numero', 'vendedor_id'],
    unicos: [['cotacao_id', 'numero']],
    col: {
      numero: (r) => num(r['cpo.PropostaNum']),
      condicao_pagamento: (r) => texto(r['cpo.CondicaoPgto']),
      info_adicional: (r) => texto(r['cpo.InfoAdicional']),
      corpo_email: (r) => texto(r['cpo.CorpoEmail']),
      emails_copia: (r) => texto(r['cpo.EmailsCopia']),
      data_prev_entrega: (r) => data(r['cpo.DtPrevEntrega']),
      enviada: (r) => bool(r['cpo.PropostaEnviada']),
    },
    ref: {
      cotacao_id: { de: 'cpo.QualCotacao', tabela: 'cotacoes' },
      vendedor_id: { de: 'cpo.QualVendedor', tabela: 'usuarios' },
      enviar_para_contato_id: { de: 'cpo.EnviarPara', tabela: 'contatos_clifor' },
      faturar_para_endereco_id: { de: 'cpo.FaturarPara', tabela: 'enderecos_clifor' },
      cnpj_fornecedor_endereco_id: { de: 'cpo.QualCnpjFornecedor', tabela: 'enderecos_clifor' },
    },
    // Cada ponteiro de QuaisOrcamentosFornecedores é uma CÓPIA do orçamento (bThFu), então o
    // snapshot que o trigger fn_proposta_item_snapshot tira dela (valores NULOS na chegada) é
    // exatamente o que a proposta mostrava no Bubble. `validar` tira o par que o trigger recusaria
    // (orçamento de outra cotação, D3 da 008) em vez de deixar o lote inteiro cair.
    ligacoes: {
      proposta_itens: {
        de: 'cpo.QuaisOrcamentosFornecedores',
        dono: 'proposta_id',
        alvo: 'orcamento_fornecedor_id',
        ref: 'orcamentos_fornecedor',
        validar: mesmaCotacao('propostas', 'proposta_id'),
      },
    },
  },

  'tbl.pedido': {
    tabela: 'pedidos',
    obrigatorias: ['numero', 'cotacao_id', 'vendedor_id', 'etapa_id'],
    preparar: lerVendedoresDaCotacao,
    col: {
      numero: (r) => texto(r['cpo.NumeroPedido']),
      ordem_compra_numero: (r) => texto(r['cpo.OrdemComrpaNum']),
      emails_copia_cliente: (r) => texto(r['cpo.EmailClienteCC']),
      emails_copia_fornecedor: (r) => texto(r['cpo.EmailFornecedorCC']),
      corpo_email_cliente: (r) => texto(r['cpo.CorpoEmailCliente']),
      corpo_email_fornecedor: (r) => texto(r['cpo.CorpoEmailFornecedor']),
      info_adicional: (r) => texto(r['cpo.InformacoesAdd']),
      formalizado: (r) => bool(r['cpo.PedidoFormalizado']),
      // ARMADILHA: PedidoFinalizado tem id cpo_entregasdespachadas_boolean.
      finalizado: (r) => bool(r['cpo.PedidoFinalizado']),
      motivo_cancelamento: (r) => texto(r['cpo.MotivoCancelamento']),
      motivo_altera_valores: (r) => texto(r['cpo.MotivoAlteraValores']),
    },
    dom: {
      etapa_id: { de: 'cpo.QualEtapa', tabela: 'etapas', padrao: 3 },
      forma_pagamento_id: { de: 'cpo.FormaPagto', tabela: 'formas_pagamento' },
    },
    ref: {
      cotacao_id: { de: 'cpo.QualCotacao', tabela: 'cotacoes' },
      // Enquanto `tbl.propostas` vier vazio, todo ponteiro aqui é órfão e o pedido entra sem
      // proposta; a recarga depois preenche (e o trigger passa a derivar cotacao_id dela).
      proposta_id: { de: 'cpo.QualProposta', tabela: 'propostas' },
      // Nulo (ou órfão) → o trigger fn_pedido_derivados usa o cliente da cotação.
      cliente_id: { de: 'cpo.QualCliente', tabela: 'grupos_clifor' },
      // 2 pedidos sem QualVendedor nem Created By: vale o vendedor da cotação, que é quem o
      // pedido tem na tela (bTbNB grava o usuário corrente, que é o dono da cotação no caso comum).
      vendedor_id: {
        de: 'cpo.QualVendedor',
        tabela: 'usuarios',
        reserva: (r) => vendedorDaCotacao.get(r['cpo.QualCotacao']),
      },
      contato_cliente_id: { de: 'cpo.EmailCliente', tabela: 'contatos_clifor' },
      contato_fornecedor_id: { de: 'cpo.EmailFornecedor', tabela: 'contatos_clifor' },
      primeiro_fornecedor_endereco_id: { de: 'cpo.QualPrimeiroFornecedor', tabela: 'enderecos_clifor' },
    },
    // `Importado` (cpo_pedidoenviado_boolean, reaproveitado), `ContaEmail`, `QualClienteTexto`,
    // `QuaisEntregas` e `QuaisOrcamentosFonecedores` não migram (02 §3.3).
    ligacoes: {
      pedido_prazos: { de: 'cpo.PrazoRecebComissoes', dono: 'pedido_id', alvo: 'prazo_id', dom: 'prazos_recebimento' },
    },
  },

  'tbl.entregas': {
    tabela: 'entregas',
    // cotacao_id, proposta_id, cliente_id e fornecedor_id NÃO são lidos: o trigger
    // fn_entrega_derivados os sobrescreve a partir do pedido e do orçamento (D6 da 009).
    // vendedor_id nulo → o trigger usa o vendedor da cotação.
    obrigatorias: ['pedido_id', 'orcamento_fornecedor_id'],
    col: {
      numero_entrega: (r) => texto(r['cpo.NumeroEntrega']),
      qtd: (r) => numOu0(r['cpo.QtdEntrega']),
      // ARMADILHA (02 §3.3): DtPrevEntrega tem id cpo_dataentrega_date e DtEntrega tem
      // cpo_dtentrega_date. O de-para segue o NOME, que é o significado.
      dt_prev_entrega: (r) => data(r['cpo.DtPrevEntrega']),
      dt_entrega: (r) => data(r['cpo.DtEntrega']),
      dt_pedido: (r) => data(r['cpo.DtPedido']),
      saiu_entrega: (r) => bool(r['cpo.SaiuEntrega']),
      nao_emite_nf: (r) => bool(r['cpo.NaoEmiteNF']),
      nf_fornecedor_numero: (r) => texto(r['cpo.NumNfFornecedor']),
      dt_emissao_nf: (r) => data(r['cpo.DtEmissaoNf']),
      // Vazios em toda a base hoje; ficam mapeados pelo nome do mapa.
      nf_megabox_numero: (r) => texto(r['cpo.NumNfMegabox']),
      dt_nf_megabox: (r) => data(r['cpo.DtNfRecebimento']),
      nota_boleto_enviada: (r) => bool(r['cpo.NotaBoletoEnviada']),
      // Check entrega_cancelada_tem_motivo (D3 da 009): cancelada sem motivo recebe o motivo de
      // carga, em vez de derrubar o lote.
      motivo_cancelamento: (r) =>
        texto(r['cpo.MotivoCancelamento']) ??
        (normalizar(r['cpo.StatusEntrega']) === 'cancelado' ? '(sem motivo no Bubble)' : null),
      motivo_alteracao_valores: (r) => texto(r['cpo.MotivoAlteracaoValores']),
      // DINHEIRO FECHADO: preserva o TOTAL do Bubble (é ele que virou conta a receber e comissão).
      // Ver `unitarioQueFecha`.
      valor_venda_bruto_unit: (r) => unitarioQueFecha(r, 'cpo.ValorVendaBruto', 'cpo.ValorVendaBrutoUnitario', 6),
      valor_venda_liquido_unit: (r) =>
        unitarioQueFecha(r, 'cpo.ValorVendaLiquido', 'cpo.ValorVendaLiquidoUnitario', 6),
      valor_comissao_unit: (r) => unitarioQueFecha(r, 'cpo.ValorComissaoBruto', 'cpo.ValorComissaoUnitario', 2),
    },
    dom: {
      // Vazio → 2 "Pedir" (D2 da 009). ARMADILHA: o rótulo "Pedido" é o id 3 (chave `pedido0`) e
      // "Pedir" é o id 2 (chave `pedido`) — por isso o índice de lista fixa dá precedência ao NOME.
      status_id: { de: 'cpo.StatusEntrega', tabela: 'etapas', padrao: 2 },
    },
    ref: {
      pedido_id: { de: 'cpo.QualPedido', tabela: 'pedidos' },
      orcamento_fornecedor_id: { de: 'cpo.QualOrcamentoFornecedor', tabela: 'orcamentos_fornecedor' },
      vendedor_id: { de: 'cpo.QualVendedor', tabela: 'usuarios' },
    },
    // `StatusFinanceiro`, `PedidoFinalizado`, `Importado`, `QualClienteTexto`/`QualFornecedTexto`,
    // `QuaisContasPagar`/`QuaisContasReceber` e `QualMetaFechada` não entram aqui (fatia 7 ou §9).
    validar: entregaDaMesmaCotacao,
    posCarga: preservarSubstituto,
  },
}

// ------------------------------------------------------------- apoio das fatias 4–6

/** Preenchido por `lerVendedoresDaCotacao`: bubble_id da cotação → bubble_id do vendedor. */
const vendedorDaCotacao = new Map()
async function lerVendedoresDaCotacao(_linhas, { bruto }) {
  for (const c of (await bruto('tbl.cotacao')) ?? []) {
    if (c['cpo.QualVendedor']) vendedorDaCotacao.set(c._id, c['cpo.QualVendedor'])
  }
  return `vendedor da cotação disponível como reserva para ${vendedorDaCotacao.size} cotação(ões)`
}

/**
 * Um vencedor por item (`um_vencedor_por_item`, 007). O Bubble tem duas fontes de repetição:
 *
 *  1. As CÓPIAS que a proposta faz dos vencedores (bThFu) nascem com `Vencedor = true` e apontam
 *     para o MESMO item. No modelo novo o vencedor é o orçamento original; a cópia vira
 *     `proposta_itens`. Cópia (tem `QualProposta`) entra com vencedor = false.
 *  2. Itens com mais de um original marcado (a troca de troféu do Bubble é em dois passos, sem
 *     transação — bTOUa0/bTOUU0). Fica o alterado mais recentemente; os outros entram false.
 *
 * Sem isto o índice único derruba o lote. A escolha fica contada no relatório.
 */
const vencedorRebaixado = new Set()
function escolherVencedores(linhas) {
  vencedorRebaixado.clear()
  let copias = 0
  const porItem = new Map()
  for (const r of linhas) {
    if (!r['cpo.Vencedor']) continue
    if (r['cpo.QualProposta']) {
      vencedorRebaixado.add(r._id)
      copias++
      continue
    }
    const item = r['cpo.QualCotacaoProduto']
    if (item) porItem.set(item, [...(porItem.get(item) ?? []), r])
  }
  let repetidos = 0
  for (const grupo of porItem.values()) {
    if (grupo.length < 2) continue
    grupo.sort((a, b) => String(b['Modified Date']).localeCompare(String(a['Modified Date'])))
    for (const r of grupo.slice(1)) vencedorRebaixado.add(r._id)
    repetidos++
  }
  return (
    `vencedor: ${copias} cópia(s) de proposta entram como não vencedoras; ` +
    `${repetidos} item(ns) com mais de um original vencedor ficam só com o mais recente`
  )
}

/**
 * Unitário da entrega que REPRODUZ o total do Bubble.
 *
 * O total (`ValorVendaBruto`, `ValorVendaLiquido`, `ValorComissaoBruto`) é o dinheiro fechado:
 * virou conta a receber, comissão e meta. O unitário do Bubble nem sempre fecha com ele (medido:
 * ~440 entregas com `qtd × unitário ≠ total`, unitário velho depois de mudar a quantidade), e a
 * coluna nova é `round(qtd × unit, 2)`. Então:
 *   - qtd > 0 e o unitário do Bubble fecha o total → o unitário do Bubble;
 *   - qtd > 0 e não fecha (ou falta)               → total ÷ qtd, nas casas da coluna;
 *   - qtd = 0 (cancelada)                          → o unitário do Bubble, ou nulo para o trigger
 *                                                    tirar do orçamento. O total é 0 de todo jeito.
 * A comissão tem 2 casas (é valor digitado, D4 da 009), então total ÷ qtd pode não fechar no
 * centavo: a diferença residual aparece na conferência agregada.
 */
function unitarioQueFecha(r, campoTotal, campoUnit, casas) {
  const qtd = num(r['cpo.QtdEntrega']) ?? 0
  const total = num(r[campoTotal])
  const unit = num(r[campoUnit])
  if (qtd <= 0 || total === null) return unit === null ? null : arred(unit, casas)
  if (unit !== null && Math.abs(arred(qtd * arred(unit, casas), 2) - arred(total, 2)) < 0.005) {
    return arred(unit, casas)
  }
  return arred(total / qtd, casas)
}

/** Lê `select id, cotacao_id` de uma tabela, em lotes, para os ids pedidos. */
async function cotacaoDe(db, tabela, ids) {
  const mapa = new Map()
  const lista = [...ids].filter((id) => id && id !== PREVISTO)
  for (let i = 0; i < lista.length; i += 150) {
    const { data: linhas, error } = await db.from(tabela).select('id, cotacao_id').in('id', lista.slice(i, i + 150))
    if (error) throw new Error(`lendo ${tabela}: ${error.message}`)
    for (const l of linhas) mapa.set(l.id, l.cotacao_id)
  }
  return mapa
}

/**
 * Validação de ligação: o orçamento tem de ser da cotação do dono (proposta). É a regra D3 do
 * trigger fn_proposta_item_snapshot (008), conferida ANTES para descartar o par, e não o lote.
 */
function mesmaCotacao(tabelaDono, colunaDono) {
  return async (db, pares) => {
    const donos = await cotacaoDe(db, tabelaDono, pares.map((p) => p[colunaDono]))
    const orcs = await cotacaoDe(db, 'orcamentos_fornecedor', pares.map((p) => p.orcamento_fornecedor_id))
    const motivo = new Map()
    pares.forEach((p, i) => {
      const a = donos.get(p[colunaDono])
      const b = orcs.get(p.orcamento_fornecedor_id)
      if (a === undefined || b === undefined) return // previsto no relatório: não dá para conferir
      if (a !== b) motivo.set(i, 'orçamento de outra cotação (D3 da 008)')
    })
    return motivo
  }
}

/** Regra D6 do trigger fn_entrega_derivados (009): o orçamento tem de ser da cotação do pedido. */
async function entregaDaMesmaCotacao(db, linhas) {
  const pedidos = await cotacaoDe(db, 'pedidos', linhas.map((l) => l.pedido_id))
  const orcs = await cotacaoDe(db, 'orcamentos_fornecedor', linhas.map((l) => l.orcamento_fornecedor_id))
  const motivo = new Map()
  for (const l of linhas) {
    const a = pedidos.get(l.pedido_id)
    const b = orcs.get(l.orcamento_fornecedor_id)
    if (a === undefined || b === undefined) continue
    if (a !== b) motivo.set(l.bubble_id, 'orçamento de outra cotação que a do pedido (D6 da 009)')
  }
  return motivo
}

/**
 * D7 da 007: `numero` é identity e a carga grava o número legado; a sequence tem de começar
 * DEPOIS do maior. Roda também no fim da carga das cotações renumeradas (que usam a sequence).
 */
async function ajustarSequenciaCotacao(_db, { relatorio, sql }) {
  if (relatorio) return 'sequence: seria ajustada para o maior número carregado (setval)'
  const r = await sql(
    `select setval(pg_get_serial_sequence('public.cotacoes', 'numero'), coalesce(max(numero), 1)) as valor
       from public.cotacoes`,
  )
  return `sequence de cotacoes.numero ajustada: próximo número = ${Number(r.rows[0].valor) + 1}`
}

/**
 * D7 da 009: o trigger recalcula o substituto pelas férias de HOJE, e o histórico (que entra em
 * comissão e meta) se perderia. Este passo regrava o substituto do Bubble com
 * `session_replication_role = replica` — os triggers não disparam, então nem o recálculo, nem a
 * auditoria, nem o `alterado_em`. Exige conexão direta (`pg` + DATABASE_URL): o supabase-js não
 * tem como mudar o papel de replicação. O check `substituto_nao_e_o_vendedor` continua valendo
 * (check não é trigger), então substituto igual ao vendedor vira nulo aqui.
 *
 * Grava TODAS as entregas do lote, inclusive as sem substituto no Bubble: se o trigger inventou
 * um substituto (férias atuais cobrindo data antiga), ele é desfeito.
 */
async function preservarSubstituto(_db, { relatorio, sql, linhas, traduzir }) {
  const comSub = linhas.filter((r) => r['cpo.QualVendedorSubstituto'])
  const usuarios = await traduzir('usuarios', new Set(comSub.map((r) => String(r['cpo.QualVendedorSubstituto']))))
  const pares = linhas.map((r) => {
    const s = r['cpo.QualVendedorSubstituto'] ? usuarios.get(String(r['cpo.QualVendedorSubstituto'])) : null
    return [r._id, s && s !== PREVISTO ? s : null]
  })
  const orfaos = comSub.filter((r) => !usuarios.get(String(r['cpo.QualVendedorSubstituto']))).length
  const arquivos = contarArquivos(linhas)
  if (relatorio) {
    return (
      `substituto: ${comSub.length} entrega(s) com substituto no Bubble seriam preservadas` +
      ` (${orfaos} sem usuário correspondente); ${arquivos}`
    )
  }
  const r = await sql(
    `with v(b, s) as (select * from unnest($1::text[], $2::uuid[]))
     update public.entregas e
        set vendedor_substituto_id = case when v.s = e.vendedor_id then null else v.s end
       from v
      where e.bubble_id = v.b
        and e.vendedor_substituto_id is distinct from (case when v.s = e.vendedor_id then null else v.s end)`,
    [pares.map((p) => p[0]), pares.map((p) => p[1])],
    { replica: true },
  )
  return `substituto: ${r.rowCount} entrega(s) corrigida(s) para o valor do Bubble (${orfaos} órfão(s)); ${arquivos}`
}

function contarArquivos(linhas) {
  const n = { nf_fornecedor: 0, boleto: 0, comprovante: 0 }
  for (const r of linhas) {
    if (r['cpo.ArquivoNfFornecedor']) n.nf_fornecedor++
    if (r['cpo.BoletoFile']) n.boleto++
    n.boleto += (r['cpo.BoletoArquivos'] ?? []).length
    if (r['cpo.ComprovanteEntrega']) n.comprovante++
  }
  return (
    `entrega_arquivos NÃO carregados (URL do CDN → passo de arquivos): ` +
    `${n.nf_fornecedor} NF de fornecedor, ${n.boleto} boleto(s), ${n.comprovante} comprovante(s)`
  )
}

/**
 * Um endereço principal por grupo (02 §2.1.8; índice único parcial `um_principal_por_grupo`).
 *
 * Só mexe em grupo que AINDA NÃO TEM principal — é isso que o torna idempotente e deixa em paz a
 * escolha feita depois na tela. Critério: filial ativa primeiro, depois a mais antiga pelo
 * prefixo do bubble_id (`<epoch_ms>x<aleatório>`); filial sem bubble_id (nascida no app) vai
 * para o fim. Lê o BANCO, não o JSON: o que decide é o que foi gravado.
 */
async function escolherPrincipal(db, { relatorio }) {
  const filiais = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await db
      .from('enderecos_clifor')
      .select('id, grupo_id, ativo, bubble_id, principal')
      .order('id')
      .range(i, i + 999)
    if (error) throw new Error(`lendo enderecos_clifor: ${error.message}`)
    filiais.push(...data)
    if (data.length < 1000) break
  }
  const jaTem = new Set(filiais.filter((f) => f.principal).map((f) => f.grupo_id))
  const idade = (f) => (f.bubble_id ? Number(String(f.bubble_id).split('x')[0]) : Infinity)
  const melhor = new Map()
  for (const f of filiais) {
    if (jaTem.has(f.grupo_id)) continue
    const atual = melhor.get(f.grupo_id)
    const antes =
      !atual ||
      (f.ativo && !atual.ativo) ||
      (f.ativo === atual.ativo &&
        (idade(f) < idade(atual) || (idade(f) === idade(atual) && String(f.bubble_id) < String(atual.bubble_id))))
    if (antes) melhor.set(f.grupo_id, f)
  }
  const ids = [...melhor.values()].map((f) => f.id)
  const resumo = `principal: ${jaTem.size} grupo(s) já têm, ${ids.length} receberiam agora`
  if (relatorio) return resumo
  for (let i = 0; i < ids.length; i += 200) {
    const { error } = await db.from('enderecos_clifor').update({ principal: true }).in('id', ids.slice(i, i + 200))
    if (error) throw new Error(`principal lote ${i / 200 + 1}: ${error.message}`)
  }
  return `principal: ${ids.length} grupo(s) receberam principal (${jaTem.size} já tinham)`
}

// ---------------------------------------------------------------------------------

function lerEnv() {
  const env = {}
  for (const linha of readFileSync('.env', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

function argumentos() {
  const a = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < a.length; i++) {
    const c = a[i]
    if (c === '--relatorio' || c === '--baixar') out[c.slice(2)] = true
    else if (c?.startsWith('--') && a[i + 1] !== undefined) out[c.slice(2)] = a[i++ + 1]
  }
  return out
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

async function baixar(base, chave, tipo) {
  const linhas = []
  let cursor = 0
  for (;;) {
    const url = `${base}/api/1.1/obj/${tipo}?limit=100&cursor=${cursor}`
    // O Bubble derruba conexão longa (ECONNRESET) e às vezes responde 5xx/429 no meio de
    // 80 páginas. Sem nova tentativa, uma queda na página 70 jogava fora as 69 anteriores.
    // Tenta de novo a MESMA página, com espera crescente; erro 4xx (fora 429) não se repete,
    // porque é pedido errado e insistir só esconde.
    let r
    for (let tentativa = 1; ; tentativa++) {
      try {
        const resposta = await fetch(url, {
          headers: chave ? { Authorization: `Bearer ${chave}` } : {},
        })
        if (resposta.ok) {
          r = (await resposta.json()).response ?? {}
          break
        }
        const definitivo = resposta.status < 500 && resposta.status !== 429
        if (definitivo || tentativa >= 5) throw new Error(`${resposta.status} em ${tipo}`)
      } catch (erro) {
        if (tentativa >= 5 || /^\d{3} em /.test(erro.message)) throw erro
      }
      await dormir(1000 * 2 ** (tentativa - 1))
    }
    linhas.push(...(r.results ?? []))
    if (!r.remaining || r.remaining <= 0) break
    cursor += 100
    await dormir(100)
  }
  return linhas
}

async function lerBruto(tipo) {
  const pasta = join('bruto', tipo)
  if (!existsSync(pasta)) return null
  const linhas = []
  for (const f of (await readdir(pasta)).filter((x) => x.endsWith('.json'))) {
    const j = JSON.parse(await readFile(join(pasta, f), 'utf8'))
    linhas.push(...(j.linhas ?? []))
  }
  return linhas
}

/**
 * Reclama de campo do MAPA que não aparece em registro nenhum — pega erro de nome cedo.
 *
 * Confere contra **todas** as linhas, não contra a primeira: o Bubble **omite o campo**
 * quando o valor é vazio, então um registro só não prova nada. Acusar pela amostra dá
 * falso positivo em campo pouco preenchido, que é o caso de quase todo campo opcional.
 * Só some do relatório o que não existe em lugar nenhum.
 */
function conferirMapa(tipo, config, linhas) {
  if (!linhas?.length) return { ausentes: [], raros: [] }

  const presenca = new Map()
  for (const r of linhas) {
    for (const k of Object.keys(r)) presenca.set(k, (presenca.get(k) ?? 0) + 1)
  }

  const ausentes = []
  const raros = []
  const conferir = (destino, campo, reserva) => {
    const n = (presenca.get(campo) ?? 0) + (reserva ? (presenca.get(reserva) ?? 0) : 0)
    if (n === 0) ausentes.push(`${tipo}.${destino} ← ${campo}`)
    else if (n / linhas.length < 0.01) {
      raros.push(`${destino} ← ${campo}: preenchido em ${n} de ${linhas.length}`)
    }
  }

  for (const [destino, d] of Object.entries(config.dom ?? {})) conferir(destino, d.de, d.reserva)
  for (const [destino, d] of Object.entries(config.ref ?? {})) conferir(destino, d.de)
  for (const [destino, d] of Object.entries(config.ligacoes ?? {})) conferir(destino, d.de)
  conferir('criado_em', 'Created Date')
  for (const destino of Object.keys(config.col ?? {})) {
    // As colunas escalares são funções; não dá para inspecionar o nome sem executá-las.
    void destino
  }
  return { ausentes, raros }
}

async function main() {
  const env = lerEnv()
  const arg = argumentos()
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const tipos = arg.tipos ? arg.tipos.split(',').map((s) => s.trim()) : Object.keys(MAPA)
  const relatorio = []

  // Listas fixas, para traduzir chave_bubble → id, uma vez só.
  const dominios = {}
  /**
   * Traduz o valor de option set que vem do Bubble para o id da lista fixa.
   *
   * A Data API devolve option set pelo RÓTULO ("CIF Incluso"), não pela chave
   * (`cif_incluso`) — é a mesma armadilha dos nomes de campo. Por isso o índice aceita
   * as duas formas, sem acento e sem caixa, e o de-para não depende de qual delas a
   * origem resolveu mandar.
   */
  async function dominio(tabela) {
    if (dominios[tabela]) return dominios[tabela]
    const chave = tabela === 'ufs' ? 'sigla' : 'id'
    const { data, error } = await db.from(tabela).select(`${chave}, chave_bubble, nome`)
    if (error) throw new Error(`lendo ${tabela}: ${error.message}`)
    const mapa = new Map()
    // DUAS passadas: primeiro a chave_bubble, depois nome e chave própria POR CIMA. Motivo: em
    // `etapas` a chave `pedido` é o id 2 ("Pedir") e o NOME "Pedido" é o id 3 (chave `pedido0`) —
    // normalizados, os dois viram "pedido". A Data API manda o rótulo, então o rótulo tem de
    // vencer; com uma passada só, quem vencia era a ordem em que o banco devolvia as linhas.
    // Conferido: nas listas fixas das fatias 2 e 3 não há colisão nenhuma, então nada muda nelas.
    for (const l of data) if (l.chave_bubble) mapa.set(normalizar(l.chave_bubble), l[chave])
    for (const l of data) {
      // A PRÓPRIA CHAVE entra no índice quando ela é texto, e não é preciosismo: em `ufs` a
      // chave_bubble de Paraná é `pf`, não `pr` — erro de digitação que está no option set do
      // Bubble desde sempre. A Data API manda o rótulo "PR", que não bate nem com a chave `pf`
      // nem com o nome "Paraná", e 401 endereços ficavam sem UF. A sigla é a identidade real da
      // linha, então é ela que fecha o caso. Quarta variação da mesma armadilha: a API fala por
      // nome, o mapa decompilado fala por id, e às vezes o id do Bubble está simplesmente errado.
      for (const forma of [l.nome, typeof l[chave] === 'string' ? l[chave] : null]) {
        if (forma) mapa.set(normalizar(forma), l[chave])
      }
    }
    dominios[tabela] = mapa
    return mapa
  }

  /**
   * bubble_id → uuid já gravado, em lote. Lê o BANCO, então a ordem dos tipos não importa: o pai
   * pode ter sido carregado numa rodada anterior.
   *
   * No relatório nada é gravado, então um pai que ESTA MESMA rodada gravaria (tipo anterior na
   * lista) apareceria como órfão e o relatório de produtos seria só ruído. `previstos` guarda os
   * bubble_id que cada tabela gravaria, e o ponteiro para eles conta como resolvido.
   */
  const previstos = {}
  async function traduzir(tabela, conjunto) {
    const mapa = new Map()
    const ids = [...conjunto]
    // 200 por vez, e não 1000: o `in` do PostgREST vai na URL, e 1000 bubble_id de 30
    // caracteres estouram o limite do servidor — o erro que volta é só "Bad Request",
    // sem dizer que o problema é tamanho.
    for (let i = 0; i < ids.length; i += 200) {
      const { data, error } = await db
        .from(tabela)
        .select('id, bubble_id')
        .in('bubble_id', ids.slice(i, i + 200))
      if (error) throw new Error(`traduzindo ${tabela}: ${error.message}`)
      for (const l of data) mapa.set(l.bubble_id, l.id)
    }
    for (const b of previstos[tabela] ?? []) if (!mapa.has(b)) mapa.set(b, PREVISTO)
    return mapa
  }

  /**
   * SQL direto (`pg` + DATABASE_URL), só para o que o supabase-js não faz: `setval` e o
   * `session_replication_role = replica` (D7 da 009). Conexão aberta sob demanda, uma só.
   * `replica: true` roda o comando numa transação com o papel de replicação LOCAL — os triggers
   * de usuário não disparam, e o papel volta ao normal no commit.
   */
  let conexao = null
  async function sql(texto, params = [], { replica = false } = {}) {
    if (!conexao) {
      if (!env.DATABASE_URL) throw new Error('DATABASE_URL não está no .env (precisa para setval/replica)')
      conexao = new pg.Client({ connectionString: env.DATABASE_URL.trim(), ssl: { rejectUnauthorized: false } })
      await conexao.connect()
    }
    if (!replica) return conexao.query(texto, params)
    try {
      await conexao.query('begin')
      await conexao.query('set local session_replication_role = replica')
      const r = await conexao.query(texto, params)
      await conexao.query('commit')
      return r
    } catch (erro) {
      await conexao.query('rollback').catch(() => {})
      throw erro
    }
  }

  /** Linhas cruas de um tipo: `bruto/`, ou a Data API com `--baixar`. Guardadas para reuso. */
  const cacheBruto = {}
  async function bruto(tipo) {
    if (cacheBruto[tipo]) return cacheBruto[tipo]
    let linhas = await lerBruto(tipo)
    if (!linhas && arg.baixar) {
      console.log(`  ${tipo}: baixando…`)
      linhas = await baixar((env.BUBBLE_APP_URL ?? '').replace(/\/+$/, ''), env.BUBBLE_API_KEY || null, tipo)
    }
    if (linhas) cacheBruto[tipo] = linhas
    return linhas
  }

  for (const tipo of tipos) {
    const config = MAPA[tipo]
    if (!config) {
      console.error(`  ${tipo}: sem de-para no MAPA — pulado`)
      continue
    }

    const linhas = await bruto(tipo)
    if (!linhas) {
      console.error(`  ${tipo}: nada em bruto/${tipo}/. Rode a extração, ou use --baixar.`)
      continue
    }
    // Zero linhas não é "tipo vazio" até prova em contrário: com a Data API sem chave de admin,
    // tipo com privacidade fechada para "everyone" devolve 0 sem erro nenhum (tbl.cotacaoprodutos,
    // tbl.propostas). Grava nada, e diz por quê — o silêncio aqui esconderia a carga inteira dos
    // tipos que dependem dele.
    if (linhas.length === 0) {
      const msg =
        `${tipo}: 0 registros na Data API — BLOQUEIO provável por regra de privacidade ` +
        `(sem BUBBLE_API_KEY de admin, a API responde como "everyone"). Nada gravado.`
      console.error(`  ${msg}`)
      relatorio.push(msg)
      continue
    }

    const { ausentes, raros } = conferirMapa(tipo, config, linhas)
    if (ausentes.length > 0) {
      console.error(`  ${tipo}: campo do MAPA em NENHUM registro — ${ausentes.join(', ')}`)
      console.error('  (nome de exibição mudou? o de-para lê por NOME, não por id)')
      process.exitCode = 1
      continue
    }
    if (raros.length > 0) {
      console.warn(`  ${tipo}: campos quase sempre vazios (confira se o nome está certo):`)
      for (const r of raros) console.warn(`      ${r}`)
    }

    if (config.preparar) {
      const msg = await config.preparar(linhas, { bruto })
      if (msg) {
        if (arg.relatorio) relatorio.push(`${tipo} (preparo) ${msg}`)
        else console.log(`  ${config.tabela}: ${msg}`)
      }
    }

    // ----------------------------------------------------- 1ª passada: escalares
    const avisos = []
    const registros = []
    for (const r of linhas) {
      const linha = { bubble_id: r._id }
      for (const [destino, fn] of Object.entries(config.col)) linha[destino] = fn(r)
      // Datas do Bubble (nomes de EXIBIÇÃO, com espaço: `Created Date`, `Modified Date`). Sem
      // isto criado_em vira a hora da carga, e "o mais antigo" e toda ordenação por data mentem.
      // A chave vai SEMPRE no objeto: o supabase-js manda ausente como NULL, não como default,
      // e criado_em é not null. Registro sem `Created Date` fica com a hora da carga e um aviso.
      linha.criado_em = texto(r['Created Date']) ?? new Date().toISOString()
      if (!r['Created Date']) avisos.push('criado_em: registro sem Created Date — ficou a hora da carga')
      // ARMADILHA: vale só no INSERT. Numa recarga o upsert vira UPDATE, e o trigger
      // fn_set_alterado sobrescreve alterado_em com now() — não há como evitar sem mexer no banco.
      linha.alterado_em = texto(r['Modified Date'])

      for (const [destino, d] of Object.entries(config.dom ?? {})) {
        const bruto = r[d.de] ?? (d.reserva ? r[d.reserva] : null)
        if (bruto == null || bruto === '') {
          linha[destino] = d.padrao ?? null
          continue
        }
        // ENUM do Postgres. O valor NÃO pode passar cru: a Data API manda o rótulo ("Cliente")
        // e o enum aceita só o rótulo em minúscula ('cliente'). Passando cru, o modo relatório
        // dizia "0 avisos" e a carga de verdade morria no primeiro lote com
        // `invalid input value for enum`. Por isso `enum` é a LISTA de valores válidos, e a
        // conferência acontece aqui, onde o relatório enxerga.
        if (d.enum) {
          const achado = d.enum.find((v) => normalizar(v) === normalizar(bruto))
          if (achado === undefined) {
            avisos.push(`${destino}: "${bruto}" não é valor do enum (${d.enum.join(' | ')})`)
            linha[destino] = null
          } else {
            linha[destino] = achado
          }
          continue
        }
        const mapa = await dominio(d.tabela)
        const traduzido = mapa.get(normalizar(bruto))
        if (traduzido === undefined) {
          avisos.push(`${destino}: chave "${bruto}" não existe em ${d.tabela}`)
          linha[destino] = null
        } else {
          linha[destino] = traduzido
        }
      }
      // Guarda o ponteiro cru de cada FK para resolver em lote, logo abaixo.
      for (const [destino, d] of Object.entries(config.ref ?? {})) {
        const alvo = r[d.de] || d.reserva?.(r)
        if (alvo && (!d.se || d.se(linha))) (linha.__ref ??= {})[destino] = String(alvo)
      }
      registros.push(linha)
    }

    // ------------------------------------------------------ FKs, resolvidas ANTES do insert
    // Isto era uma 2ª passada, com um UPDATE por linha depois do insert — 14 mil idas ao banco
    // só nas três tabelas desta fatia. Não dava para continuar assim por dois motivos, e o
    // segundo é o que obriga: `enderecos_clifor.grupo_id` e `contatos_clifor.grupo_id` são
    // `not null`, então a linha não ENTRA sem a FK resolvida. Resolver depois é impossível.
    const alvos = {}
    for (const linha of registros) {
      for (const [destino, bubble] of Object.entries(linha.__ref ?? {})) {
        ;(alvos[config.ref[destino].tabela] ??= new Set()).add(bubble)
      }
    }
    const traducao = {}
    for (const [tabela, conjunto] of Object.entries(alvos)) traducao[tabela] = await traduzir(tabela, conjunto)

    let orfas = 0
    for (const linha of registros) {
      for (const [destino, bubble] of Object.entries(linha.__ref ?? {})) {
        const d = config.ref[destino]
        const uuid = traducao[d.tabela].get(bubble)
        if (uuid) {
          linha[destino] = uuid
        } else {
          orfas++
          avisos.push(`${destino}: ponteiro para ${d.tabela} sem linha correspondente`)
        }
      }
      delete linha.__ref
    }
    if (orfas) console.warn(`  ${config.tabela}: ${orfas} referência(s) órfã(s).`)

    // ------------------------------------------------- linhas que o `not null` recusaria
    // O modo relatório existe para não descobrir problema com a carga rodando, e mesmo assim
    // ele deixou passar DUAS vezes: primeiro o enum, depois o `not null`. Motivo comum — ele
    // conferia a TRADUÇÃO e nada mais, então "0 avisos" só queria dizer "todo ponteiro achou
    // destino". O Bubble não tem campo obrigatório, e o esquema novo tem; a diferença aparece
    // aqui ou aparece no meio da gravação, com 500 linhas já dentro.
    // Linha sem valor no que é `not null` é PULADA, não corrigida: inventar nome de cliente é
    // pior do que deixar de fora e dizer quantos ficaram.
    // Contagem POR COLUNA: uma linha pode faltar em mais de uma, e cada uma conta.
    let descartados = 0
    const faltaPorColuna = {}
    let gravar = registros.filter((linha) => {
      const faltando = (config.obrigatorias ?? []).filter((c) => linha[c] == null)
      if (faltando.length === 0) return true
      descartados++
      for (const c of faltando) faltaPorColuna[c] = (faltaPorColuna[c] ?? 0) + 1
      return false
    })

    // ------------------------------------ unique do banco e regras de trigger (fatias 4–6)
    // Mesma lógica do not null: o que o banco recusaria derruba o LOTE de 500, então sai antes,
    // contado por motivo. Ordem de antiguidade = criado_em, depois bubble_id (determinística, para
    // a recarga escolher sempre a mesma linha).
    const antiguidade = (a, b) =>
      String(a.criado_em).localeCompare(String(b.criado_em)) || String(a.bubble_id).localeCompare(String(b.bubble_id))
    for (const colunas of config.unicos ?? []) {
      const vistos = new Set()
      gravar = [...gravar].sort(antiguidade).filter((linha) => {
        const k = colunas.map((c) => linha[c]).join('|')
        if (!vistos.has(k)) return vistos.add(k)
        descartados++
        const rotulo = `repetida em (${colunas.join(', ')})`
        faltaPorColuna[rotulo] = (faltaPorColuna[rotulo] ?? 0) + 1
        return false
      })
    }
    if (config.validar) {
      const motivos = await config.validar(db, gravar)
      gravar = gravar.filter((linha) => {
        const m = motivos.get(linha.bubble_id)
        if (!m) return true
        descartados++
        faltaPorColuna[m] = (faltaPorColuna[m] ?? 0) + 1
        return false
      })
    }
    // `renumerar`: a repetição NÃO é descartada. A mais antiga fica com o valor legado; as outras
    // vão para `adiados`, SEM a coluna, e são gravadas depois do `posCarga` (que ajusta a sequence).
    const adiados = []
    if (config.renumerar) {
      const vistos = new Set()
      gravar = [...gravar].sort(antiguidade).filter((linha) => {
        if (!vistos.has(linha[config.renumerar])) return vistos.add(linha[config.renumerar])
        delete linha[config.renumerar]
        adiados.push(linha)
        return false
      })
    }

    const resumoAvisos = [...new Set(avisos)].slice(0, 10)
    const resumoDescarte = descartados
      ? `${descartados} linha(s) DESCARTADA(s) (coluna not null vazia, repetição ou regra de trigger) — ` +
        Object.entries(faltaPorColuna)
          .map(([c, n]) => `${c}: ${n}`)
          .join(', ')
      : ''

    const resumoAdiados = adiados.length
      ? `${adiados.length} linha(s) com ${config.renumerar} REPETIDO: a mais antiga fica com o valor legado, ` +
        `estas ganham valor novo da sequence`
      : ''
    const contexto = { relatorio: !!arg.relatorio, sql, linhas, traduzir }

    if (arg.relatorio) {
      previstos[config.tabela] = new Set([...gravar, ...adiados].map((l) => l.bubble_id))
      relatorio.push(
        `${tipo} → ${config.tabela}: ${gravar.length + adiados.length} linha(s) grava, ` +
          `${descartados} descarta, ${avisos.length} aviso(s) de tradução` +
          (resumoDescarte ? `\n      ${resumoDescarte}` : '') +
          (resumoAdiados ? `\n      ${resumoAdiados}` : '') +
          (resumoAvisos.length ? `\n      ${resumoAvisos.join('\n      ')}` : ''),
      )
    } else {
      if (descartados) console.warn(`  ${config.tabela}: ${resumoDescarte}`)

      for (let i = 0; i < gravar.length; i += LOTE) {
        const fatia = gravar.slice(i, i + LOTE)
        const { error } = await db
          .from(config.tabela)
          .upsert(fatia, { onConflict: 'bubble_id', ignoreDuplicates: false })
        if (error) throw new Error(`${config.tabela} lote ${i / LOTE + 1}: ${error.message}`)
        process.stdout.write(`\r  ${config.tabela}: ${Math.min(i + LOTE, gravar.length)}/${gravar.length}`)
      }
      console.log(`\r  ${config.tabela}: ${gravar.length} linha(s) gravada(s).           `)
      if (avisos.length) console.warn(`    ${avisos.length} aviso(s); primeiros: ${resumoAvisos.join('; ')}`)

      // Adiados: sequence ajustada ANTES (posCarga), senão o número novo colidiria com o legado.
      // Sem a coluna no objeto, o upsert não a menciona: no INSERT vale o default (identity), e
      // na recarga o UPDATE não mexe no número que a linha já ganhou — idempotente.
      if (adiados.length) {
        console.log(`  ${config.tabela}: ${await config.posCarga(db, contexto)}`)
        const { error } = await db.from(config.tabela).upsert(adiados, { onConflict: 'bubble_id' })
        if (error) throw new Error(`${config.tabela} (renumeradas): ${error.message}`)
        console.log(`  ${config.tabela}: ${resumoAdiados}`)
      }
    }

    // --------------------------------------------- ligações puras (listas dentro do registro)
    // Roda DEPOIS da gravação do dono, porque precisa do uuid dele; no relatório o dono conta
    // como `previsto`. Registro descartado não liga nada (o dono não existe).
    const gravados = new Set([...gravar, ...adiados].map((l) => l.bubble_id))
    for (const [tabela, lig] of Object.entries(config.ligacoes ?? {})) {
      const pares = []
      let semDono = 0
      for (const r of linhas) {
        const lista = r[lig.de] ?? []
        if (!gravados.has(r._id)) {
          semDono += lista.length
          continue
        }
        for (const item of lista) pares.push([r._id, item])
      }

      const avisosLig = []
      const donos = await traduzir(config.tabela, new Set(pares.map(([d]) => d)))
      const itens = lig.dom
        ? await dominio(lig.dom)
        : await traduzir(lig.ref, new Set(pares.map(([, i]) => String(i))))
      const chave = (i) => (lig.dom ? normalizar(i) : String(i))

      const unicas = new Map()
      for (const [dono, item] of pares) {
        const uuidDono = donos.get(dono)
        const idItem = itens.get(chave(item))
        if (uuidDono === undefined) {
          avisosLig.push(`${lig.dono}: dono sem linha em ${config.tabela}`)
          continue
        }
        if (idItem === undefined) {
          avisosLig.push(
            lig.dom
              ? `${lig.alvo}: chave "${item}" não existe em ${lig.dom}`
              : `${lig.alvo}: ponteiro para ${lig.ref} sem linha correspondente`,
          )
          continue
        }
        unicas.set(`${dono}|${idItem}`, { [lig.dono]: uuidDono, [lig.alvo]: idItem })
      }
      let ligar = [...unicas.values()]
      if (lig.validar) {
        const motivos = await lig.validar(db, ligar)
        for (const m of motivos.values()) avisosLig.push(`${lig.alvo}: ${m} — par descartado`)
        ligar = ligar.filter((_, i) => !motivos.has(i))
      }
      const resumo =
        `${tipo}.${lig.de} → ${tabela}: ${ligar.length} par(es) grava, ${avisosLig.length} aviso(s)` +
        (semDono ? `, ${semDono} item(ns) de registro descartado` : '') +
        (avisosLig.length ? `\n      ${[...new Set(avisosLig)].slice(0, 10).join('\n      ')}` : '')

      if (arg.relatorio) {
        relatorio.push(resumo)
        continue
      }
      for (let i = 0; i < ligar.length; i += LOTE) {
        const { error } = await db
          .from(tabela)
          .upsert(ligar.slice(i, i + LOTE), { onConflict: `${lig.dono},${lig.alvo}`, ignoreDuplicates: true })
        if (error) throw new Error(`${tabela} lote ${i / LOTE + 1}: ${error.message}`)
      }
      console.log(`  ${resumo}`)
    }

    if (config.posCarga) {
      const msg = await config.posCarga(db, contexto)
      if (arg.relatorio) relatorio.push(`${tipo} (pós-carga) ${msg}`)
      else console.log(`  ${config.tabela}: ${msg}`)
    }
  }
  await conexao?.end()
  if (arg.relatorio) {
    console.log('\nModo relatório — nada foi gravado.\n')
    for (const l of relatorio) console.log(`  ${l}`)
    console.log('\nConfira os avisos antes de rodar sem --relatorio.')
  }
}

await main()
