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
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

/** 200, não 500: a instância é Micro e caiu por carga (lote grande = transação longa). */
const LOTE = 200
/** Tabela com mais linhas que isto é "grande": entre um lote e outro dela, `pausaMs` de respiro. */
const GRANDE = 1000
/** Pausa entre lotes de tabela grande; `--pausa <segundos>` troca (padrão 60 s). */
let pausaMs = 60_000
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

  // ------------------------------------------------------ alíquotas de ICMS (§3.8 de 02)
  // Privacidade aberta a "everyone" (mapa/data-types.md), então a Data API anônima devolve tudo.
  // ESCALA conferida na origem: `cpo.AliquotaIcms` já é FRAÇÃO (valores 0.12, 0.18, 0.19, 0.2),
  // a mesma unidade da coluna — NÃO dividir por 100. O check `aliquota_e_fracao` (003) recusaria
  // 12 no lugar de 0.12. Origem/Destino chegam pelo RÓTULO ("PR"), resolvido pela sigla (a chave
  // `pf` de Paraná não é usada). O par (origem, destino) é a pk: repetição sai por `unicos`.
  'tbl.icmsestados': {
    tabela: 'icms_aliquotas',
    obrigatorias: ['uf_origem', 'uf_destino', 'aliquota'],
    unicos: [['uf_origem', 'uf_destino']],
    col: {
      aliquota: (r) => {
        const v = num(r['cpo.AliquotaIcms'])
        return v !== null && v >= 0 && v < 1 ? v : null // fora da escala: descartada e contada
      },
    },
    dom: {
      uf_origem: { de: 'cpo.Origem', tabela: 'ufs' },
      uf_destino: { de: 'cpo.Destino', tabela: 'ufs' },
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
    antesDeGravar: liberarNumerosLegados,
    posCarga: ajustarSequenciaCotacao,
  },

  'tbl.cotacaoprodutos': {
    tabela: 'cotacao_itens',
    obrigatorias: ['cotacao_id', 'produto_id', 'qtd', 'endereco_destino_id'],
    // Acrescenta os itens COMPARTILHADOS entre cotações (ver `planejarClones`).
    preparar: async (linhas, { bruto }) => {
      const { novos, msg } = await planejarClones(bruto)
      linhas.push(...novos.values())
      return msg
    },
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
    preparar: async (linhas, ctx) => {
      const { orcItem, novos } = await planejarClones(ctx.bruto)
      for (const r of linhas) if (orcItem.has(r._id)) r['cpo.QualCotacaoProduto'] = orcItem.get(r._id)
      const msg = await lerItensECotacoes(ctx)
      for (const [id, it] of novos) itemBubble.set(id, it)
      return `${orcItem.size} orçamento(s) apontados para item clonado; ${msg}; ${escolherVencedores(linhas)}`
    },
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
      // Reservas (29/09, medido com a chave de admin): 558 orçamentos sem `QualProdutoModelo` (20
      // com item que tem produto, 17 deles com entrega), 27 sem destino e 8 sem vendedor. O
      // orçamento é DO item (AdicionarFornecedores copia produto e destino do item), e o vendedor
      // é o da cotação — mesma reserva de `tbl.pedido`.
      endereco_destino_id: {
        de: 'cpo.QualEnderecoDestino',
        tabela: 'enderecos_clifor',
        reserva: (r) => itemBubble.get(r['cpo.QualCotacaoProduto'])?.['cpo.QualEnderecoDestino'],
      },
      endereco_cobranca_id: { de: 'cpo.QualEndereçoCobrança', tabela: 'enderecos_clifor' },
      produto_id: {
        de: 'cpo.QualProdutoModelo',
        tabela: 'produtos',
        reserva: (r) => itemBubble.get(r['cpo.QualCotacaoProduto'])?.['cpo.QualProdutoModelo'],
      },
      vendedor_id: {
        de: 'cpo.QualVendedor',
        tabela: 'usuarios',
        reserva: (r) =>
          vendedorDaCotacao.get(
            r['cpo.QualCotacao'] ?? itemBubble.get(r['cpo.QualCotacaoProduto'])?.['cpo.QualCotacao'],
          ),
      },
    },
  },

  'tbl.propostas': {
    tabela: 'propostas',
    obrigatorias: ['cotacao_id', 'numero', 'vendedor_id'],
    unicos: [['cotacao_id', 'numero']],
    // 883 propostas sem número: rascunhos abandonados (nenhuma enviada, sem pedido, sem entrega,
    // sem corpo de e-mail — medido em 29/09) → descartadas pelo `not null`. As repetidas em
    // (cotação, número) NÃO são descartadas: há enviadas e com pedido entre elas. Ver
    // `numerarPropostasRepetidas`; `unicos` fica como rede de segurança.
    preparar: numerarPropostasRepetidas,
    col: {
      numero: (r) => propostaNumero.get(r._id) ?? num(r['cpo.PropostaNum']),
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

  // ------------------------------------------------------ fatias 7–8: metas e financeiro
  // Ordem de dependência: níveis → metas mensais → metas fechadas → CR → CP → cobranças.
  //
  // MODO RÉPLICA (`replica: true`): a gravação vai por SQL direto (`pg`), em transação com
  // `session_replication_role = replica`, como o `preservarSubstituto` das entregas. Motivo: são
  // valores HISTÓRICOS que os triggers recalculariam ou recusariam — o rateio da CR (D4 da 010
  // manda exatamente isto: "carregar com replica e medir a divergência pela view"), o status
  // derivado das baixas (D5), a CR/CP de entrega hoje cancelada (recusada no INSERT), o
  // `fechada_em = now()` da meta fechada. CUSTO, assumido e compensado aqui:
  //   - FK também não é conferida em réplica (é trigger interno). Por isso toda FK destas tabelas
  //     é uuid lido do BANCO (tradução por bubble_id ou `entregaDb`), nunca montado à mão;
  //   - o que os triggers derivariam é derivado aqui, com a mesma regra (identidade da entrega,
  //     competência, status das baixas, retrato da meta);
  //   - `auditoria` não recebe linha da carga, e `alterado_em` fica o do Bubble;
  //   - check e unique continuam valendo (não são trigger).
  // Documentado em specs/04-duvidas.md ("Carga de financeiro e metas").

  'tbl.niveisvendedores': {
    tabela: 'niveis_vendedor',
    obrigatorias: ['nome', 'ordem', 'meta_venda', 'comissao_padrao', 'comissao_meta_batida'],
    unicos: [['nome'], ['ordem']],
    col: {
      nome: (r) => texto(r['cpo.NomeNivel']),
      ordem: (r) => num(r['cpo.Ordem']),
      meta_venda: (r) => num(r['cpo.MetaVenda']),
      // B3 MEDIDA (29/09): FRAÇÃO. ComissaoPadrao = 0.03 nos 10 níveis (os mesmos 3% fixos da CP de
      // entrega) e ComissaoMetaBatida 0.05–0.10; e 70 de 72 metas fechadas com realizado reproduzem
      // TotalComissaoVendedor = round(TotalComissaoMegabox × fator, 2) com o valor CRU. Nada de ÷ 100.
      // Fora de 0..1 → nulo → descartada e contada (o check recusaria).
      comissao_padrao: (r) => fracao(r['cpo.ComissaoPadrao']),
      comissao_meta_batida: (r) => fracao(r['cpo.ComissaoMetaBatida']),
      qtd_meta_batida: (r) => numOu0(r['cpo.QtdMetaBatida']),
    },
    // `QuaisVendedores` não vem na API (e a FK é o lado do usuário); `old_ValorBonus` não migra.
    posCarga: nivelDosUsuarios,
  },

  'tbl.metasmensais': {
    tabela: 'metas_mensais',
    obrigatorias: ['vendedor_id', 'competencia', 'tipo_meta_id', 'valor_meta', 'periodo_inicio', 'periodo_fim'],
    // unique (vendedor, competência, tipo) com PREFERÊNCIA (não "a mais antiga"): ver metaRepetida.
    preparar: prepararMetasMensais,
    validar: metaRepetida,
    col: {
      valor_meta: (r) => num(r['cpo.ValorMeta']),
      periodo_inicio: (r) => data(r['cpo.DataInicio']),
      periodo_fim: (r) => data(r['cpo.DataFim']),
      // O trigger deriva igual (dia 1 do mês do início); vai aqui porque é `not null`.
      competencia: (r) => primeiroDoMes(data(r['cpo.DataInicio'])),
      observacao: (r) => texto(r['cpo.Observacao']),
    },
    dom: {
      // 6 metas sem TipoMeta (as primeiras, de 07/2025): Regular, que é o tipo de todas as outras
      // daquele mês e o default de bTwBh.
      tipo_meta_id: { de: 'cpo.TipoMeta', tabela: 'tipos_meta', padrao: 1 },
    },
    ref: {
      vendedor_id: { de: 'cpo.QualVendedor', tabela: 'usuarios' },
      nivel_id: { de: 'cpo.QualNivel', tabela: 'niveis_vendedor' },
    },
    // `RankingVendas` vira view (D2 da 011); `QualMetaFechada` é o lado N de metas_fechadas (D6).
    posCarga: historicoDeNivel,
  },

  'tbl.metasfechadas': {
    tabela: 'metas_fechadas',
    replica: true, // fechada_em/fechada_por históricos; o trigger poria now() e auth.uid()
    obrigatorias: [
      'meta_mensal_id',
      'vendedor_id',
      'tipo_meta_id',
      'competencia',
      'periodo_inicio',
      'periodo_fim',
      'nivel_id',
      'valor_meta',
      'total_comissao_megabox',
      'fator_comissao',
      'total_comissao_vendedor',
      'fechada_por',
    ],
    // Liga a fechada à meta (o ponteiro do Bubble é o CONTRÁRIO: MetasMensais.QualMetaFechada) e
    // copia o retrato da META, como o trigger fn_meta_fechada_derivados faria (campos `_mm.*`).
    preparar: prepararMetasFechadas,
    col: {
      competencia: (r) => primeiroDoMes(data(r['_mm.DataInicio'])),
      periodo_inicio: (r) => data(r['_mm.DataInicio']),
      periodo_fim: (r) => data(r['_mm.DataFim']),
      valor_meta: (r) => num(r['_mm.ValorMeta']),
      total_comissao_megabox: (r) => fatoMeta(r, (f) => reais(f.realizado)),
      percentual_atingido: (r) => fatoMeta(r, (f) => f.percentual),
      fator_comissao: (r) => fatoMeta(r, (f) => f.fator),
      total_comissao_vendedor: (r) => fatoMeta(r, (f) => reais(f.comissao)),
      fechada_em: (r) => texto(r['Created Date']),
    },
    dom: {
      tipo_meta_id: { de: '_mm.TipoMeta', tabela: 'tipos_meta', padrao: 1 },
    },
    ref: {
      meta_mensal_id: { de: '_mm', tabela: 'metas_mensais' },
      vendedor_id: { de: '_mm.QualVendedor', tabela: 'usuarios' },
      nivel_id: { de: '_mm.QualNivel', tabela: 'niveis_vendedor' },
      fechada_por: { de: 'Created By', tabela: 'usuarios' },
    },
    // MesNome/MesNumero/AnoNumero derivam da competência (D7); QuaisContasPagar é o lado N;
    // QuaisContasReceber não tem destino no modelo novo (a fechada liga ENTREGAS).
    posCarga: ligarEntregasDaMeta,
  },

  'tbl.contasreceber': {
    tabela: 'contas_receber',
    replica: true, // rateio histórico ≠ entrega (D4) e CR de entrega hoje cancelada
    obrigatorias: [
      'entrega_id',
      'pedido_id',
      'cotacao_id',
      'orcamento_fornecedor_id',
      'cliente_id',
      'fornecedor_id',
      'vendedor_id',
      'parcela',
      'parcelas_total',
      'valor_total',
      'valor_comissao',
      'dt_vencimento',
    ],
    preparar: prepararContasReceber,
    col: {
      // D7: identidade SEMPRE da entrega (o trigger sobrescreveria do mesmo jeito).
      ...identidadeDaEntrega(['pedido_id', 'cotacao_id', 'proposta_id', 'orcamento_fornecedor_id', 'cliente_id', 'fornecedor_id', 'vendedor_id']),
      parcela: (r) => parcelaCR.get(r._id)?.i ?? null,
      parcelas_total: (r) => parcelaCR.get(r._id)?.n ?? null,
      // D3: VENDA RATEADA (o Bubble grava a venda cheia em cada parcela — [DÚVIDA 3]).
      valor_total: (r) => parcelaCR.get(r._id)?.valor_total ?? null,
      // Comissão: a do Bubble, por parcela (é o dinheiro que foi cobrado e recebido).
      valor_comissao: (r) => dinheiro(r['cpo.ValorComissao']),
      motivo_altera_comissao: (r) => texto(r['cpo.MotivoAlteraComissao']),
      dt_vencimento: (r) => data(r['cpo.DataVencimento']),
      // D5: espelho das baixas — 2 só se a carga grava a baixa implícita (ver gravarBaixasCR).
      status_id: (r) => (baixaImplicitaCR(r) && (num(r['cpo.ValorComissao']) ?? 0) > 0 ? 2 : 1),
      arquivado: (r) => bool(r['cpo.Arquivado']),
    },
    dom: {
      prazo_id: { de: 'cpo.QualPrazo', tabela: 'prazos_recebimento' },
    },
    ref: {
      entrega_id: { de: 'cpo.QualEntrega', tabela: 'entregas' },
    },
    // Não migram (D7 da 010: vêm por join da entrega): datas, NF do fornecedor, qtd, unitários,
    // origem/destino, NumeroPedido. `QualCobranca`/`CobrancaNum`/`QuaisCobrancas` = cobranca_contas.
    // `Importado`/`QdtParcelas` (flag e resto da rotina antiga, 02 §9). `QuaisHistoricos`: fatia 9.
    posCarga: gravarBaixasCR,
  },

  'tbl.contaspagar': {
    tabela: 'contas_pagar',
    replica: true, // CP de entrega hoje cancelada seria recusada no INSERT; valores históricos
    obrigatorias: ['origem', 'vendedor_id', 'valor_base', 'percentual', 'dt_vencimento'],
    preparar: prepararContasPagar,
    col: {
      origem: (r) => cpInfo.get(r._id)?.origem ?? null,
      ...identidadeDaEntrega(['pedido_id', 'cotacao_id', 'orcamento_fornecedor_id', 'cliente_id', 'fornecedor_id'], (r) =>
        cpInfo.get(r._id)?.origem === 'entrega' ? r['cpo.QualEntrega'] : null,
      ),
      // Reserva: o vendedor da entrega (3 CPs sem QualVendedor). O `ref` abaixo sobrescreve quando
      // o ponteiro do Bubble resolve — é a quem o Bubble paga.
      vendedor_id: (r) => (cpInfo.get(r._id)?.origem === 'entrega' ? (entregaDb.get(r['cpo.QualEntrega'])?.vendedor_id ?? null) : null),
      valor_base: (r) => cpInfo.get(r._id)?.base ?? null,
      percentual: (r) => cpInfo.get(r._id)?.pct ?? null,
      motivo_altera_comissao: (r) => texto(r['cpo.MotivoAlteraComissao']),
      dt_vencimento: (r) =>
        data(r['cpo.DataVencimento']) ??
        (cpInfo.get(r._id)?.origem === 'entrega' ? dia5MesSeguinte(entregaDb.get(r['cpo.QualEntrega'])?.dt_entrega) : null),
      // Nenhuma CP do Bubble está "Pago" (medido: 3.261 "A pagar", 194 vazias, 2 "A receber"):
      // nenhuma baixa implícita, todas 3 "A pagar".
      status_id: () => 3,
      // Preenchidos por `cancelarRepetidasCP` (sempre presentes: a recarga desfaz o que mudou).
      cancelada_em: () => null,
      motivo_cancelamento: () => null,
    },
    ref: {
      entrega_id: { de: 'cpo.QualEntrega', tabela: 'entregas', se: (l) => l.origem === 'entrega' },
      meta_fechada_id: { de: 'cpo.QualMetaFechada', tabela: 'metas_fechadas', se: (l) => l.origem === 'meta' },
      vendedor_id: { de: 'cpo.QualVendedor', tabela: 'usuarios' },
    },
    validar: origemCoerenteCP,
    antesDeGravar: cancelarRepetidasCP,
    posCarga: ligarEntregasDaCP,
  },

  'tbl.cobrancas': {
    tabela: 'cobrancas',
    obrigatorias: ['numero', 'fornecedor_id'],
    preparar: prepararCobrancas,
    col: {
      numero: (r) => num(r['cpo.NumeroCobranca']),
      fornecedor_id: (r) => fornecedorCobranca.get(r._id) ?? null,
      // bTpUa cria a cobrança e manda o e-mail no mesmo workflow: criada = enviada.
      enviada_em: (r) => texto(r['Created Date']),
    },
    // `AnexoLink`/`AnexoFile` são URL do CDN → passo de arquivos (contados no posCarga).
    posCarga: ligarContasDaCobranca,
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
 * ITEM COMPARTILHADO ENTRE COTAÇÕES. No Bubble a cotação tem a LISTA `QuaisProdutos`, e editar a
 * cotação grava `QuaisProdutos = CurrentUser:TempOrcamentoProdutos` (bTOjb0) — a lista temporária
 * do usuário, que pode trazer itens de OUTRA cotação. O item fica com `QualCotacao` da cotação
 * original, mas passa a morar também na lista da nova; a proposta da nova copia os vencedores da
 * lista dela (bThFu: `Parent:QuaisProdutos:QuaisOrcamentos…`), e a cópia aponta para o item da
 * cotação antiga. Medido em 29/09: 428 cópias de proposta e 247 orçamentos originais assim, e ~700
 * entregas em cima delas — o trigger D6 da 009 (orçamento da cotação do pedido) as recusaria.
 *
 * No modelo novo o item é de UMA cotação. Então o item compartilhado é CLONADO na cotação que o
 * usa, com bubble_id sintético `<item>@<cotação>` (idempotente na recarga), e o orçamento passa a
 * apontar para o clone. A cotação que usa é a da PROPOSTA, para cópia (`QualProposta`), e a
 * `QualCotacao` do próprio orçamento, para original. Nada é inventado: produto, quantidade e
 * destino são os do item do Bubble.
 */
let clones = null
async function planejarClones(bruto) {
  if (clones) return clones
  const itens = new Map(((await bruto('tbl.cotacaoprodutos')) ?? []).map((i) => [i._id, i]))
  const props = new Map(((await bruto('tbl.propostas')) ?? []).map((p) => [p._id, p]))
  const listas = new Map(((await bruto('tbl.cotacao')) ?? []).map((c) => [c._id, new Set(c['cpo.QuaisProdutos'] ?? [])]))
  const orcItem = new Map()
  const novos = new Map()
  let naLista = 0
  for (const o of (await bruto('tbl.orcfornecedorescotacao')) ?? []) {
    const it = itens.get(o['cpo.QualCotacaoProduto'])
    if (!it) continue
    const k = o['cpo.QualProposta'] ? props.get(o['cpo.QualProposta'])?.['cpo.QualCotacao'] : o['cpo.QualCotacao']
    if (!k || k === it['cpo.QualCotacao']) continue
    const id = `${it._id}@${k}`
    orcItem.set(o._id, id)
    if (!novos.has(id)) {
      novos.set(id, { ...it, _id: id, 'cpo.QualCotacao': k })
      if (listas.get(k)?.has(it._id)) naLista++
    }
  }
  clones = {
    orcItem,
    novos,
    msg:
      `${novos.size} item(ns) compartilhado(s) entre cotações clonado(s) na cotação que os usa ` +
      `(${naLista} confirmados na lista QuaisProdutos dela) para ${orcItem.size} orçamento(s)`,
  }
  return clones
}

/** Preenchido por `lerItensECotacoes`: bubble_id do item → registro cru do item. */
const itemBubble = new Map()
async function lerItensECotacoes({ bruto }) {
  for (const i of (await bruto('tbl.cotacaoprodutos')) ?? []) itemBubble.set(i._id, i)
  await lerVendedoresDaCotacao(null, { bruto })
  return `reserva de produto/destino pelo item (${itemBubble.size}) e de vendedor pela cotação (${vendedorDaCotacao.size})`
}

/**
 * Propostas com o mesmo número na mesma cotação (`unique (cotacao_id, numero)`, 008). O número é
 * digitado (sugestão "propostas da cotação + 1", editável — vendas.md §5.2), então o Bubble tem
 * repetição, e ENTRE as repetidas há proposta enviada e proposta com pedido. Descartar perderia o
 * documento enviado e o `pedidos.proposta_id`. Então: fica com o número quem tem pedido, depois
 * quem foi enviada, depois a mais antiga; as outras recebem o próximo número livre DA COTAÇÃO
 * (maior número dela + 1), em ordem de criação. Determinístico: a recarga dá o mesmo resultado.
 */
const propostaNumero = new Map()
async function numerarPropostasRepetidas(linhas, { bruto }) {
  propostaNumero.clear()
  const comPedido = new Set(((await bruto('tbl.pedido')) ?? []).map((p) => p['cpo.QualProposta']).filter(Boolean))
  const maior = new Map()
  const grupos = new Map()
  for (const r of linhas) {
    const n = num(r['cpo.PropostaNum'])
    const c = r['cpo.QualCotacao']
    if (n === null || !c) continue
    maior.set(c, Math.max(maior.get(c) ?? n, n))
    const k = `${c}|${n}`
    grupos.set(k, [...(grupos.get(k) ?? []), r])
  }
  const peso = (r) => (comPedido.has(r._id) ? 0 : r['cpo.PropostaEnviada'] ? 1 : 2)
  const porCriacao = (a, b) =>
    String(a['Created Date']).localeCompare(String(b['Created Date'])) || String(a._id).localeCompare(String(b._id))
  const mover = []
  for (const g of grupos.values()) {
    if (g.length > 1) mover.push(...[...g].sort((a, b) => peso(a) - peso(b) || porCriacao(a, b)).slice(1))
  }
  mover.sort(porCriacao)
  let enviadas = 0
  let pedidos = 0
  for (const r of mover) {
    const c = r['cpo.QualCotacao']
    const novo = maior.get(c) + 1
    maior.set(c, novo)
    propostaNumero.set(r._id, novo)
    if (r['cpo.PropostaEnviada']) enviadas++
    if (comPedido.has(r._id)) pedidos++
  }
  return (
    `${mover.length} proposta(s) com número repetido na cotação ganham o próximo número livre dela ` +
    `(${enviadas} enviada(s), ${pedidos} com pedido)`
  )
}

/**
 * O `renumerar` da carga anterior deu às 7 cotações repetidas os números 5961–5967, e depois o
 * Bubble criou cotações NOVAS com esses mesmos números legados. O legado é do dono no Bubble; a
 * renumerada é que muda. Antes do upsert: toda linha do banco que ocupa o número legado de OUTRA
 * cotação do Bubble recebe número novo da sequence, ajustada acima do maior legado. Idempotente:
 * sem colisão, não faz nada.
 */
async function liberarNumerosLegados(_db, { relatorio, sql, gravar }) {
  const b = gravar.map((l) => l.bubble_id)
  const n = gravar.map((l) => l.numero)
  const ocupados = await sql(
    `with legado(b, n) as (select * from unnest($1::text[], $2::int[]))
     select c.id from public.cotacoes c join legado l on l.n = c.numero
      where c.bubble_id is distinct from l.b`,
    [b, n],
  )
  const ids = ocupados.rows.map((r) => r.id)
  if (relatorio || ids.length === 0) {
    return `${ids.length} cotação(ões) do banco ocupam número legado de outra e ${relatorio ? 'seriam' : 'foram'} renumeradas`
  }
  const maxLegado = Math.max(...n.filter((x) => x != null))
  await sql(
    `select setval(pg_get_serial_sequence('public.cotacoes', 'numero'),
                   greatest((select max(numero) from public.cotacoes), $1::int))`,
    [maxLegado],
  )
  const r = await sql(
    `update public.cotacoes set numero = nextval(pg_get_serial_sequence('public.cotacoes', 'numero'))
      where id = any($1::uuid[]) returning numero`,
    [ids],
  )
  return `${r.rowCount} cotação(ões) renumerada(s) para liberar o número legado (novos: ${r.rows.map((x) => x.numero).join(', ')})`
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

// ------------------------------------------------------------- apoio das fatias 7–8
// DINHEIRO: tudo em CENTAVOS INTEIROS e gravado como TEXTO numeric ("1234.50"), que o Postgres
// converte sem passar por float (CLAUDE.md regra 10). Só a leitura do Bubble é float (é o que ele
// guarda); ela é arredondada ao centavo uma vez, na entrada.

/** Número do Bubble em FRAÇÃO 0..1, ou null (o check `between 0 and 1` recusaria). */
const fracao = (v) => {
  const x = num(v)
  return x !== null && x >= 0 && x <= 1 ? x : null
}
/** Float do Bubble → centavos inteiros. */
const centavosDe = (v) => (num(v) === null ? null : Math.round(num(v) * 100))
/** Texto numeric do banco ("1234.50") → centavos inteiros, exato. */
function centavosDoBanco(t) {
  if (t === null || t === undefined) return null
  const s = String(t)
  const [i, d = ''] = s.replace('-', '').split('.')
  const c = Number(i) * 100 + Number(`${d}00`.slice(0, 2))
  return s.startsWith('-') ? -c : c
}
/** Centavos → texto numeric exato. */
const reais = (c) => (c === null || c === undefined ? null : (c / 100).toFixed(2))
/** Dinheiro do Bubble → texto com 2 casas; negativo → null (checks `>= 0`). */
const dinheiro = (v) => {
  const c = centavosDe(v)
  return c === null || c < 0 ? null : reais(c)
}
/** `round(centavos/100 × fator, 2)` do Postgres, em centavos e exato (fator com 4 casas). */
const comissaoDe = (centavos, fator) => Math.round((centavos * Math.round(fator * 10000)) / 10000)
/**
 * fn_valor_parcela (D3 da 010) em centavos: round(total/n) nas i < n, a sobra na última; com a
 * mesma guarda (trunc) para a última nunca ficar negativa.
 */
function valorParcela(total, n, i) {
  let base = Math.round(total / n)
  if (base * (n - 1) > total) base = Math.trunc(total / n)
  return i < n ? base : total - base * (n - 1)
}
const primeiroDoMes = (d) => (d ? `${d.slice(0, 8)}01` : null)
/** fn_vencimento_conta_pagar (D10 da 010): dia 5 do mês seguinte. */
function dia5MesSeguinte(d) {
  if (!d) return null
  const [a, m] = d.split('-').map(Number)
  return m === 12 ? `${a + 1}-01-05` : `${a}-${String(m + 1).padStart(2, '0')}-05`
}
function diaSeguinte(d) {
  const x = new Date(`${d}T12:00:00Z`)
  x.setUTCDate(x.getUTCDate() + 1)
  return x.toISOString().slice(0, 10)
}
const porAntiguidade = (a, b) =>
  String(a.criado_em).localeCompare(String(b.criado_em)) || String(a.bubble_id).localeCompare(String(b.bubble_id))
const porCriacaoBubble = (a, b) =>
  String(a['Created Date']).localeCompare(String(b['Created Date'])) || String(a._id).localeCompare(String(b._id))

/**
 * Grava `linhas` em `tabela` por SQL, com os triggers de usuário DESLIGADOS (modo réplica; ver o
 * comentário das fatias 7–8 no MAPA). Upsert por bubble_id: a recarga regrava a mesma linha.
 * Toda linha do lote leva todas as colunas (chave ausente = null), então a lista de colunas é a
 * união das chaves.
 */
async function upsertReplica(sql, tabela, linhas) {
  const cols = [...new Set(linhas.flatMap((l) => Object.keys(l)))]
  const lista = cols.map((c) => `"${c}"`).join(', ')
  const set = cols
    .filter((c) => c !== 'bubble_id')
    .map((c) => `"${c}" = excluded."${c}"`)
    .join(', ')
  return sql(
    `insert into public.${tabela} (${lista})
     select ${lista} from jsonb_populate_recordset(null::public.${tabela}, $1::jsonb)
     on conflict (bubble_id) do update set ${set}`,
    [JSON.stringify(linhas)],
    { replica: true },
  )
}

/** Lotes de LOTE, com a mesma espera única de `comEspera` e pausa entre lotes de tabela grande. */
async function gravarEmLotes(rotulo, itens, gravar) {
  let n = 0
  for (let i = 0; i < itens.length; i += LOTE) {
    if (i > 0 && itens.length > GRANDE) await dormir(pausaMs)
    const fatia = itens.slice(i, i + LOTE)
    await comEspera(`${rotulo} lote ${i / LOTE + 1}`, async () => {
      try {
        n += (await gravar(fatia))?.rowCount ?? 0
        return {}
      } catch (error) {
        return { error }
      }
    })
    process.stdout.write(`\r  ${rotulo}: ${Math.min(i + LOTE, itens.length)}/${itens.length}`)
  }
  if (itens.length) process.stdout.write('\n')
  return n
}

/** Entregas JÁ gravadas, por bubble_id: identidade (D7), valores e data real. Lidas uma vez. */
const entregaDb = new Map()
async function lerEntregasDoBanco(sql) {
  if (entregaDb.size) return
  const r = await sql(
    `select bubble_id, id, pedido_id, cotacao_id, proposta_id, orcamento_fornecedor_id, cliente_id,
            fornecedor_id, vendedor_id, status_id, dt_entrega::text as dt_entrega,
            valor_comissao::text as vc, valor_venda_bruto::text as vb
       from public.entregas where bubble_id is not null`,
  )
  for (const e of r.rows) entregaDb.set(e.bubble_id, e)
}
/** Colunas `col` que copiam a identidade da entrega do registro (a regra dos triggers, D7). */
function identidadeDaEntrega(colunas, ponteiro = (r) => r['cpo.QualEntrega']) {
  return Object.fromEntries(colunas.map((c) => [c, (r) => entregaDb.get(ponteiro(r))?.[c] ?? null]))
}

// ---------------------------------------------------------------------- níveis e metas

/**
 * METAS REPETIDAS (7 no Bubble, 07–08/2025): as primeiras metas nasceram sem TipoMeta e foram
 * RECRIADAS depois como "Regular" para o mesmo mês — e o fechamento está na recriada. "Fica a mais
 * antiga" (o `unicos`) descartaria justo a que tem fechamento. Preferência: a que tem meta
 * fechada; depois a que tem TipoMeta explícito; depois a mais recente (a correção). As outras
 * são descartadas e contadas.
 */
const metaComFechada = new Set()
const metaComTipo = new Set()
const metaGravada = new Set()
async function prepararMetasMensais(linhas) {
  metaComFechada.clear()
  metaComTipo.clear()
  for (const r of linhas) {
    if (r['cpo.QualMetaFechada']) metaComFechada.add(r._id)
    if (r['cpo.TipoMeta']) metaComTipo.add(r._id)
  }
  return null
}
async function metaRepetida(_db, linhas) {
  const peso = (l) => (metaComFechada.has(l.bubble_id) ? 0 : 2) + (metaComTipo.has(l.bubble_id) ? 0 : 1)
  const grupos = new Map()
  for (const l of linhas) {
    const k = `${l.vendedor_id}|${l.competencia}|${l.tipo_meta_id}`
    grupos.set(k, [...(grupos.get(k) ?? []), l])
  }
  const motivo = new Map()
  metaGravada.clear()
  for (const g of grupos.values()) {
    g.sort((a, b) => peso(a) - peso(b) || -porAntiguidade(a, b))
    metaGravada.add(g[0].bubble_id)
    for (const l of g.slice(1)) {
      motivo.set(l.bubble_id, 'repetida em (vendedor, competência, tipo): fica a com fechamento/TipoMeta/mais recente')
    }
  }
  return motivo
}

/** `usuarios.nivel_vendedor_id` ← `User.QualNivelVendedor` (o nível ATUAL; a história é abaixo). */
async function nivelDosUsuarios(_db, { relatorio, sql, bruto, traduzir }) {
  const users = (await bruto('user')) ?? []
  if (!users.length) return 'usuarios.nivel_vendedor_id: tipo `user` não disponível (use --baixar) — nada feito'
  const pares = users.filter((u) => u['cpo.QualNivelVendedor']).map((u) => [u._id, u['cpo.QualNivelVendedor']])
  const us = await traduzir('usuarios', new Set(pares.map((p) => p[0])))
  const nv = await traduzir('niveis_vendedor', new Set(pares.map((p) => p[1])))
  const ok = pares.map(([u, n]) => [us.get(u), nv.get(n)]).filter(([u, n]) => u && n)
  const resumo = `usuarios.nivel_vendedor_id: ${pares.length} usuário(s) com nível no Bubble, ${ok.length} resolvido(s)`
  if (relatorio) return resumo
  const r = await sql(
    `with v(u, n) as (select * from unnest($1::uuid[], $2::uuid[]))
     update public.usuarios x set nivel_vendedor_id = v.n from v
      where x.id = v.u and x.nivel_vendedor_id is distinct from v.n`,
    [ok.map((p) => p[0]), ok.map((p) => p[1])],
  )
  return `${resumo}; ${r.rowCount} atualizado(s)`
}

/**
 * `vendedor_nivel_historico` NÃO existe no Bubble (o nível é um ponteiro no User, sem história).
 * A evidência de história que há é o nível CONGELADO em cada meta mensal (`QualNivel`). Então:
 * por vendedor, as metas Regulares em ordem de início; cada sequência de meses com o mesmo nível
 * vira uma vigência [início da 1ª, início da próxima troca). A última fica aberta se é o nível
 * atual do usuário; se não é, fecha no dia seguinte ao fim da última meta e o atual abre ali.
 * Vendedor com nível e sem meta: uma vigência aberta desde a criação do usuário (é tudo o que o
 * Bubble sabe). Sem sobreposição por construção (o exclude da 011 recusaria).
 */
async function historicoDeNivel(_db, { relatorio, sql, bruto, linhas, traduzir }) {
  const users = new Map(((await bruto('user')) ?? []).map((u) => [u._id, u]))
  const porVend = new Map()
  for (const m of linhas) {
    if (!metaGravada.has(m._id)) continue // a repetida descartada não conta como história
    if (normalizar(m['cpo.TipoMeta']) === 'substituicao') continue
    const ini = data(m['cpo.DataInicio'])
    if (!ini || !m['cpo.QualNivel'] || !m['cpo.QualVendedor']) continue
    const l = porVend.get(m['cpo.QualVendedor']) ?? []
    if (!l.some((x) => x.ini === ini)) l.push({ ini, fim: data(m['cpo.DataFim']) ?? ini, nivel: m['cpo.QualNivel'] })
    porVend.set(m['cpo.QualVendedor'], l)
  }
  const faixas = []
  const MOTIVO_METAS = 'Carga: nível congelado nas metas mensais do Bubble'
  for (const [u, lista] of porVend) {
    lista.sort((a, b) => a.ini.localeCompare(b.ini))
    let atual = null
    for (const x of lista) {
      if (atual?.nivel === x.nivel) {
        if (x.fim > atual.ultimoFim) atual.ultimoFim = x.fim
        continue
      }
      if (atual) atual.fim = x.ini
      atual = { u, nivel: x.nivel, ini: x.ini, ultimoFim: x.fim, fim: null, motivo: MOTIVO_METAS }
      faixas.push(atual)
    }
    const hoje = users.get(u)?.['cpo.QualNivelVendedor']
    if (hoje && hoje !== atual.nivel) {
      atual.fim = diaSeguinte(atual.ultimoFim)
      faixas.push({ u, nivel: hoje, ini: atual.fim, fim: null, motivo: 'Carga: nível atual do usuário no Bubble' })
    }
  }
  for (const [u, x] of users) {
    if (porVend.has(u) || !x['cpo.QualNivelVendedor']) continue
    const ini = data(x['Created Date'])
    if (ini) faixas.push({ u, nivel: x['cpo.QualNivelVendedor'], ini, fim: null, motivo: 'Carga: nível atual do usuário no Bubble (sem histórico)' })
  }
  const us = await traduzir('usuarios', new Set(faixas.map((f) => f.u)))
  const nv = await traduzir('niveis_vendedor', new Set(faixas.map((f) => f.nivel)))
  const linhasH = faixas
    .map((f) => ({
      bubble_id: `nivel:${f.u}:${f.ini}`,
      usuario_id: us.get(f.u),
      nivel_id: nv.get(f.nivel),
      vigencia_inicio: f.ini,
      vigencia_fim: f.fim,
      motivo: f.motivo,
    }))
    .filter((l) => l.usuario_id && l.nivel_id)
  const resumo =
    `vendedor_nivel_historico: ${linhasH.length} vigência(s) de ${new Set(linhasH.map((l) => l.usuario_id)).size} ` +
    `vendedor(es) (${faixas.length - linhasH.length} sem usuário/nível no banco)`
  if (relatorio) return resumo
  const n = await gravarEmLotes('vendedor_nivel_historico', linhasH, (fatia) =>
    sql(
      `insert into public.vendedor_nivel_historico (bubble_id, usuario_id, nivel_id, vigencia_inicio, vigencia_fim, motivo)
       select * from jsonb_to_recordset($1::jsonb)
         as x(bubble_id text, usuario_id uuid, nivel_id uuid, vigencia_inicio date, vigencia_fim date, motivo text)
       on conflict (bubble_id) do update
         set nivel_id = excluded.nivel_id, vigencia_fim = excluded.vigencia_fim, motivo = excluded.motivo`,
      [JSON.stringify(fatia)],
    ),
  )
  return `${resumo}; ${n} gravada(s)`
}

/**
 * Fatos de cada meta fechada: a meta mensal dela, o realizado, o fator e a comissão.
 *
 * LIGAÇÃO: o Bubble guarda `MetasMensais.QualMetaFechada` (93 ponteiros, todos coerentes em
 * vendedor/período salvo 2); a fechada não aponta para a meta. Fechada sem meta que a aponte
 * (26, quase todas de 05–07/2025, antes da primeira meta mensal existente) é DESCARTADA: sem meta
 * não há nível, valor da meta nem fator — inventar seria pior (e metas_fechadas é 1:1, D6).
 *
 * FATOR (não existe campo no Bubble; a comissão veio do DOM, metas §7.5): o da faixa do nível da
 * meta (batida se realizado ≥ meta > 0) quando ele REPRODUZ TotalComissaoVendedor ao centavo; senão
 * o da outra faixa do mesmo nível; senão a razão vendedor/realizado com 4 casas, se reproduzir.
 * Nada disso fechando → descartada (o check comissao_coerente recusaria).
 * REALIZADO VAZIO (21 fechadas, todas com comissão do vendedor = 0): realizado 0.
 */
let fatosMeta = null
async function calcularFatosMeta(bruto) {
  if (fatosMeta) return fatosMeta
  const niveis = new Map(((await bruto('tbl.niveisvendedores')) ?? []).map((n) => [n._id, n]))
  const metas = (await bruto('tbl.metasmensais')) ?? []
  const fechadas = (await bruto('tbl.metasfechadas')) ?? []
  const metaDe = new Map()
  for (const m of metas) if (m['cpo.QualMetaFechada']) metaDe.set(m['cpo.QualMetaFechada'], m)
  const fato = new Map()
  const c = { semMeta: 0, realizadoVazio: 0, faixa: 0, outraFaixa: 0, razao: 0, centavo: 0, naoFecha: 0 }
  for (const f of fechadas) {
    const m = metaDe.get(f._id)
    if (!m) {
      c.semMeta++
      continue
    }
    const n = niveis.get(m['cpo.QualNivel'])
    const vend = centavosDe(f['cpo.TotalComissaoVendedor'])
    let real = centavosDe(f['cpo.TotalComissaoMegabox'])
    if (real === null && vend === 0) {
      real = 0
      c.realizadoVazio++
    }
    const valorMeta = num(m['cpo.ValorMeta']) ?? 0
    const batida = real !== null && valorMeta > 0 && real >= Math.round(valorMeta * 100)
    const fecha = (fr) => fr != null && fr >= 0 && fr <= 1 && real !== null && vend !== null && comissaoDe(real, fr) === vend
    const faixa = batida ? n?.['cpo.ComissaoMetaBatida'] : n?.['cpo.ComissaoPadrao']
    const outra = batida ? n?.['cpo.ComissaoPadrao'] : n?.['cpo.ComissaoMetaBatida']
    let fator = null
    if (fecha(faixa)) {
      fator = faixa
      c.faixa++
    } else if (fecha(outra)) {
      fator = outra
      c.outraFaixa++
    } else if (real > 0 && fecha(arred(vend / real, 4))) {
      fator = arred(vend / real, 4)
      c.razao++
    } else if (faixa != null && real !== null && vend !== null && Math.abs(comissaoDe(real, faixa) - vend) === 1) {
      // O Bubble calculou em float e truncou um ...,xx5; o numeric arredonda para cima. O check
      // comissao_coerente exige o arredondamento do banco: entra a comissão do banco (+/− 0,01),
      // contada — e não a fechada inteira (com a CP dela) descartada por um centavo.
      fator = faixa
      c.centavo++
    } else c.naoFecha++
    fato.set(f._id, {
      meta: m._id,
      realizado: real,
      comissao: fator === null ? vend : comissaoDe(real, fator),
      fator: fator === null ? null : fator.toFixed(4),
      fatorNum: fator,
      percentual: real !== null && valorMeta > 0 ? arred(real / 100 / valorMeta, 4) : null,
    })
  }
  fatosMeta = { fato, c }
  return fatosMeta
}
function fatoMeta(r, f) {
  const x = fatosMeta?.fato.get(r._id)
  return x && x.fator !== null ? f(x) : null
}

async function prepararMetasFechadas(linhas, { bruto }) {
  const { fato, c } = await calcularFatosMeta(bruto)
  const metas = new Map(((await bruto('tbl.metasmensais')) ?? []).map((m) => [m._id, m]))
  let outroVendedor = 0
  for (const r of linhas) {
    const m = metas.get(fato.get(r._id)?.meta)
    if (!m) continue
    r._mm = m._id
    for (const k of ['QualVendedor', 'QualNivel', 'TipoMeta', 'DataInicio', 'DataFim', 'ValorMeta']) {
      if (m[`cpo.${k}`] !== undefined) r[`_mm.${k}`] = m[`cpo.${k}`]
    }
    if (r['cpo.QualVendedor'] !== m['cpo.QualVendedor']) outroVendedor++
  }
  return (
    `${c.semMeta} fechada(s) SEM meta mensal que a aponte (descartadas); fator: ${c.faixa} pela faixa do nível, ` +
    `${c.outraFaixa} pela outra faixa do nível, ${c.razao} pela razão vendedor/realizado, ${c.centavo} pela faixa com ajuste de 1 centavo (float do Bubble), ${c.naoFecha} não fecham ` +
    `(descartadas); ${c.realizadoVazio} com realizado vazio e comissão 0 → realizado 0; ` +
    `${outroVendedor} com vendedor ≠ o da meta (vale o da meta: retrato, D6/D7)`
  )
}

/**
 * `meta_fechada_entregas` ← `MetasFechadas.QuaisEntregas`. A mesma entrega em duas fechadas
 * (índice entrega_em_uma_meta_so, D8 da 011): fica na fechada MAIS ANTIGA; as outras, contadas.
 */
async function ligarEntregasDaMeta(_db, { relatorio, sql, linhas, gravar, traduzir }) {
  await lerEntregasDoBanco(sql)
  const cru = new Map(linhas.map((r) => [r._id, r]))
  const usada = new Set()
  const pares = []
  let repetida = 0
  let fora = 0
  for (const l of [...gravar].sort(porAntiguidade)) {
    for (const eb of cru.get(l.bubble_id)?.['cpo.QuaisEntregas'] ?? []) {
      const e = entregaDb.get(eb)
      if (!e) {
        fora++
        continue
      }
      if (usada.has(e.id)) {
        repetida++
        continue
      }
      usada.add(e.id)
      pares.push({ b: l.bubble_id, entrega_id: e.id, criado_em: l.criado_em })
    }
  }
  const resumo =
    `meta_fechada_entregas: ${pares.length} ligação(ões); ${repetida} entrega(s) já em fechada mais antiga ` +
    `(descartadas, D8 da 011); ${fora} ponteiro(s) para entrega fora da carga`
  if (relatorio) return resumo
  const ids = await traduzir('metas_fechadas', new Set(pares.map((p) => p.b)))
  const rows = pares.map((p) => ({ meta_fechada_id: ids.get(p.b), entrega_id: p.entrega_id, criado_em: p.criado_em }))
  const n = await gravarEmLotes(
    'meta_fechada_entregas',
    rows.filter((x) => x.meta_fechada_id),
    (fatia) =>
      sql(
        `insert into public.meta_fechada_entregas (meta_fechada_id, entrega_id, criado_em)
         select * from jsonb_to_recordset($1::jsonb) as x(meta_fechada_id uuid, entrega_id uuid, criado_em timestamptz)
         on conflict do nothing`,
        [JSON.stringify(fatia)],
      ),
  )
  return `${resumo}; ${n} gravada(s)`
}

// ------------------------------------------------------------------- contas a receber

/**
 * BAIXA IMPLÍCITA (D5/D6 da 010: a baixa é a verdade). O Bubble não tem baixa: carimba na conta
 * DataBaixaSistema/QuemBaixou/DataRecebimentoBancocaixa/NumNfMegabox/DataNfMegabox e põe o status
 * "Recebido". Regra da carga: há baixa quando o status é "Recebido", ou quando o status está VAZIO
 * mas a conta tem DataBaixaSistema. "A receber" NÃO tem baixa mesmo com carimbo (4 casos: o status
 * é o que a tela do Bubble mostra). A baixa leva o valor INTEIRO da comissão (o Bubble não baixa
 * parcial), dt_baixa = DataBaixaSistema, dt_credito = DataRecebimentoBancocaixa, e a NF MegaBox.
 */
const baixaImplicitaCR = (r) => {
  const s = normalizar(r['cpo.StatusFinanceiro'])
  return s === 'recebido' || (s === '' && Boolean(r['cpo.DataBaixaSistema']))
}

/**
 * PARCELAS: o Bubble não numera. Parcela = ordem por vencimento (depois criação) entre as CRs da
 * mesma entrega; parcelas_total = quantas são. VENDA RATEADA pela regra de fn_valor_parcela.
 */
const parcelaCR = new Map()
async function prepararContasReceber(linhas, { sql }) {
  await lerEntregasDoBanco(sql)
  parcelaCR.clear()
  const grupos = new Map()
  let semEntrega = 0
  let fora = 0
  let canceladas = 0
  for (const r of linhas) {
    const b = r['cpo.QualEntrega']
    const e = b ? entregaDb.get(b) : null
    if (!e) {
      if (b) fora++
      else semEntrega++
      continue
    }
    if (e.status_id === 7) canceladas++
    grupos.set(b, [...(grupos.get(b) ?? []), r])
  }
  let divergentes = 0
  let dif = 0
  let semVenda = 0
  for (const [b, ps] of grupos) {
    const e = entregaDb.get(b)
    ps.sort(
      (x, y) => String(x['cpo.DataVencimento'] ?? '').localeCompare(String(y['cpo.DataVencimento'] ?? '')) || porCriacaoBubble(x, y),
    )
    const total = centavosDoBanco(e.vb)
    if (total === null) semVenda++
    ps.forEach((r, k) =>
      parcelaCR.set(r._id, {
        i: k + 1,
        n: ps.length,
        valor_total: total === null ? null : reais(valorParcela(total, ps.length, k + 1)),
      }),
    )
    const soma = ps.reduce((s, r) => s + (centavosDe(r['cpo.ValorComissao']) ?? 0), 0)
    const alvo = centavosDoBanco(e.vc) ?? 0
    if (soma !== alvo) {
      divergentes++
      dif += soma - alvo
    }
  }
  return (
    `${grupos.size} entrega(s) com CR; ${semEntrega} CR sem entrega e ${fora} com entrega fora da carga ` +
    `(descartadas); ${canceladas} CR de entrega hoje cancelada (entram: histórico); ${semVenda} entrega(s) sem venda; ` +
    `RATEIO (D4): em ${divergentes} entrega(s) Σ comissão das parcelas ≠ comissão da entrega ` +
    `(diferença líquida ${reais(dif)}) — entram como o Bubble tem; ver v_conferencia_comissao_entrega`
  )
}

async function gravarBaixasCR(_db, { relatorio, sql, linhas, traduzir }) {
  const alvo = linhas.filter(baixaImplicitaCR)
  const comValor = alvo.filter((r) => (num(r['cpo.ValorComissao']) ?? 0) > 0)
  const contas = await traduzir('contas_receber', new Set(comValor.map((r) => r._id)))
  const usuarios = await traduzir(
    'usuarios',
    new Set(comValor.flatMap((r) => [r['cpo.QuemBaixou'], r['Created By']]).filter(Boolean).map(String)),
  )
  let semConta = 0
  let semUsuario = 0
  let reserva = 0
  let soma = 0
  const baixas = []
  for (const r of comValor) {
    const conta = contas.get(r._id)
    if (!conta) {
      semConta++
      continue
    }
    let u = usuarios.get(String(r['cpo.QuemBaixou'] ?? ''))
    if (!u) {
      u = usuarios.get(String(r['Created By'] ?? ''))
      if (u) reserva++
    }
    if (!u) {
      semUsuario++
      continue
    }
    const quando = r['cpo.DataBaixaSistema'] ?? r['Modified Date']
    soma += centavosDe(r['cpo.ValorComissao'])
    baixas.push({
      bubble_id: `${r._id}#baixa`,
      conta_receber_id: conta,
      valor: dinheiro(r['cpo.ValorComissao']),
      dt_baixa: data(quando),
      dt_credito: data(r['cpo.DataRecebimentoBancocaixa']),
      nf_megabox_numero: texto(r['cpo.NumNfMegabox']),
      dt_nf_megabox: data(r['cpo.DataNfMegabox']),
      usuario_id: u,
      // Estorno ANTERIOR (bTrtf não apaga a baixa; a seguinte a sobrescreveu — financeiro-reusables
      // §4.7, "irrecuperável"): a baixa estornada não é inventada (data e NF perdidas); o fato do
      // estorno fica registrado aqui, com a data que o Bubble guardou.
      observacao: r['cpo.DataEstorno']
        ? `Carga: baixa implícita da conta "Recebido" no Bubble; houve estorno anterior em ${data(r['cpo.DataEstorno'])} (a baixa estornada não existe mais no Bubble)`
        : 'Carga: baixa implícita da conta "Recebido" no Bubble',
      criado_em: texto(quando),
      criado_por: u,
    })
  }
  const estornadas = linhas.filter((r) => r['cpo.DataEstorno']).length
  const aReceberCarimbadas = linhas.filter((r) => !baixaImplicitaCR(r) && r['cpo.DataBaixaSistema']).length
  const anexos = alvo.filter((r) => r['cpo.AnexoNfMegabox']).length
  const resumo =
    `baixas: ${baixas.length} implícita(s) (Σ ${reais(soma)}); ${alvo.length - comValor.length} "Recebido" com comissão 0 ` +
    `(sem baixa: valor > 0; ficam A receber pelo D5); ${semConta} de CR não gravada; ${semUsuario} sem usuário ` +
    `(${reserva} pelo criador da CR na falta de QuemBaixou); ${aReceberCarimbadas} "A receber" com carimbo de baixa ` +
    `(sem baixa: vale o status); ${estornadas} com estorno ANTERIOR no Bubble (a baixa estornada foi sobrescrita lá: ` +
    `não há o que reconstruir, entra só a baixa atual); ${anexos} anexo(s) de NF MegaBox (URL do CDN → passo de arquivos)`
  if (relatorio) return resumo
  const n = await gravarEmLotes('baixas', baixas, (fatia) => upsertReplica(sql, 'baixas', fatia))
  return `${resumo}; ${n} gravada(s)`
}

// --------------------------------------------------------------------- contas a pagar

/**
 * Origem e valor de cada CP.
 *  - META (`QualMetaFechada`): valor_base = realizado da fechada, percentual = o fator dela; a
 *    coluna gerada dá exatamente TotalComissaoVendedor (= ValorComissao da CP nas 94).
 *  - ENTREGA (`QualEntrega` carregada): percentual 0.0300 (B4) e valor_base que REPRODUZ a
 *    ValorComissao do Bubble ao centavo: a comissão da entrega, se 3% dela fecha; senão
 *    `ValorTotal` da CP, se fecha; senão a base implícita round(ValorComissao ÷ 0,03) — comissão
 *    alterada à mão (70 com motivo) ou entrega alterada depois. O dinheiro é o do Bubble.
 *  - Nenhuma das duas (17): descartada — `origem_coerente` da 010 recusaria.
 */
const cpInfo = new Map()
async function prepararContasPagar(linhas, { bruto, sql }) {
  await lerEntregasDoBanco(sql)
  const { fato } = await calcularFatosMeta(bruto)
  const fechadas = new Map(((await bruto('tbl.metasfechadas')) ?? []).map((f) => [f._id, f]))
  cpInfo.clear()
  const c = { meta: 0, metaSem: 0, metaDiverge: 0, entrega: 0, pelaEntrega: 0, peloTotal: 0, implicita: 0, fixada: 0 }
  const d = { semOrigem: 0, fora: 0, semValor: 0, canceladas: 0, pago: 0, statusAnomalo: 0 }
  for (const r of linhas) {
    const st = normalizar(r['cpo.StatusFinanceiro'])
    if (st === 'pago') d.pago++
    if (st && st !== 'apagar' && st !== 'pago') d.statusAnomalo++
    const vc = centavosDe(r['cpo.ValorComissao'])
    if (r['cpo.QualMetaFechada']) {
      c.meta++
      const f = fato.get(r['cpo.QualMetaFechada'])
      if (!f || f.fator === null) {
        c.metaSem++
        continue
      }
      if (comissaoDe(f.realizado, f.fatorNum) !== vc) c.metaDiverge++
      cpInfo.set(r._id, {
        origem: 'meta',
        base: reais(f.realizado),
        pct: f.fator,
        entregas: fechadas.get(r['cpo.QualMetaFechada'])?.['cpo.QuaisEntregas'] ?? r['cpo.QuaisEntregas'] ?? [],
      })
      continue
    }
    const b = r['cpo.QualEntrega']
    const e = b ? entregaDb.get(b) : null
    if (!e) {
      if (b) d.fora++
      else d.semOrigem++
      continue
    }
    if (vc === null || vc < 0) {
      d.semValor++
      continue
    }
    c.entrega++
    if (e.status_id === 7) d.canceladas++
    const daEntrega = centavosDoBanco(e.vc)
    const doTotal = centavosDe(r['cpo.ValorTotal'])
    let base
    let pct = 0.03
    if (daEntrega !== null && daEntrega >= 0 && comissaoDe(daEntrega, pct) === vc) {
      base = daEntrega
      c.pelaEntrega++
    } else if (doTotal !== null && doTotal >= 0 && comissaoDe(doTotal, pct) === vc) {
      base = doTotal
      c.peloTotal++
    } else {
      base = Math.round(vc / pct)
      c.implicita++
      if (comissaoDe(base, pct) !== vc) {
        base = vc // nunca aconteceu na medição; guarda para não gravar valor errado
        pct = 1
        c.fixada++
      }
    }
    cpInfo.set(r._id, { origem: 'entrega', base: reais(base), pct: pct.toFixed(4) })
  }
  return (
    `origem meta: ${c.meta} (${c.metaSem} sem fechada carregável → descartadas; ${c.metaDiverge} com valor ≠ fechada); ` +
    `origem entrega: ${c.entrega} (base: ${c.pelaEntrega} = comissão da entrega, ${c.peloTotal} = ValorTotal da CP, ` +
    `${c.implicita} base implícita ValorComissao÷0,03, ${c.fixada} fixada a 100%; ${d.canceladas} de entrega hoje cancelada); ` +
    `descartadas: ${d.semOrigem} sem entrega nem meta, ${d.fora} com entrega fora da carga, ${d.semValor} sem valor; ` +
    `status: ${d.pago} "Pago" no Bubble (nenhuma baixa de CP), ${d.statusAnomalo} com status de CR ("A receber") → A pagar`
  )
}

async function origemCoerenteCP(_db, linhas) {
  const motivo = new Map()
  for (const l of linhas) {
    if (l.origem === 'entrega' && !l.entrega_id) motivo.set(l.bubble_id, 'origem entrega sem entrega gravada (origem_coerente)')
    if (l.origem === 'meta' && !l.meta_fechada_id) motivo.set(l.bubble_id, 'origem meta sem meta fechada gravada (origem_coerente)')
  }
  return motivo
}

/**
 * CP de entrega REPETIDA no Bubble (mesma entrega e mesmo vendedor, as duas ativas): o índice
 * contas_pagar_entrega_uidx recusaria. Fica a mais antiga; as outras entram CANCELADAS (lógico,
 * D8 da 010), com o motivo — o registro não some e não paga duas vezes.
 */
const MOTIVO_REPETIDA = 'Carga: conta a pagar repetida no Bubble para a mesma entrega e vendedor (fica a mais antiga)'
async function cancelarRepetidasCP(_db, { gravar }) {
  const vistos = new Set()
  let n = 0
  let soma = 0
  for (const l of [...gravar].sort(porAntiguidade)) {
    if (l.origem !== 'entrega') continue
    const k = `${l.entrega_id}|${l.vendedor_id}`
    if (!vistos.has(k)) {
      vistos.add(k)
      continue
    }
    l.cancelada_em = l.criado_em
    l.motivo_cancelamento = MOTIVO_REPETIDA
    soma += comissaoDe(centavosDoBanco(l.valor_base), Number(l.percentual))
    n++
  }
  return `${n} CP de entrega REPETIDA(s) (mesma entrega e vendedor) entram CANCELADAS (Σ comissão ${reais(soma)})`
}

/**
 * `conta_pagar_entregas` — AS DUAS ORIGENS (D1 da 010, D8 da 011). A CP de entrega declara a sua
 * entrega; a CP de meta declara as entregas da fechada. Único por (entrega, vendedor): quando a
 * entrega já é paga ao vendedor pela CP de ENTREGA, a ligação da META é a que sai (a CP de
 * entrega é o ponteiro 1:1 que o Bubble tem na conta, `QualEntrega`; a lista da meta é derivada),
 * contada como aviso. AS DUAS CONTAS ENTRAM (é dinheiro que o Bubble registra); a duplicidade de
 * pagamento fica medida aqui para o negócio decidir (specs/04-duvidas.md).
 */
async function ligarEntregasDaCP(_db, { relatorio, sql, gravar, traduzir }) {
  await lerEntregasDoBanco(sql)
  const pares = []
  const pagoEntrega = new Set()
  const pagoMeta = new Set()
  for (const l of gravar) {
    if (l.origem !== 'entrega' || l.cancelada_em) continue
    pagoEntrega.add(`${l.entrega_id}|${l.vendedor_id}`)
    pares.push({ b: l.bubble_id, vendedor_id: l.vendedor_id, entrega_id: l.entrega_id, criado_em: l.criado_em })
  }
  const porId = new Map([...entregaDb.values()].map((e) => [e.id, e]))
  let colisao = 0
  let colisaoValor = 0
  const metasComColisao = new Set()
  let repetidaMeta = 0
  let fora = 0
  for (const l of gravar.filter((x) => x.origem === 'meta').sort(porAntiguidade)) {
    for (const eb of cpInfo.get(l.bubble_id)?.entregas ?? []) {
      const e = entregaDb.get(eb)
      if (!e) {
        fora++
        continue
      }
      const k = `${e.id}|${l.vendedor_id}`
      if (pagoEntrega.has(k)) {
        colisao++
        colisaoValor += centavosDoBanco(porId.get(e.id)?.vc) ?? 0
        metasComColisao.add(l.bubble_id)
        continue
      }
      if (pagoMeta.has(k)) {
        repetidaMeta++
        continue
      }
      pagoMeta.add(k)
      pares.push({ b: l.bubble_id, vendedor_id: l.vendedor_id, entrega_id: e.id, criado_em: l.criado_em })
    }
  }
  const resumo =
    `conta_pagar_entregas: ${pares.length} ligação(ões) (${pagoEntrega.size} de CP de entrega, ${pagoMeta.size} de CP de meta); ` +
    `COLISÃO DAS DUAS ORIGENS: ${colisao} entrega(s) de ${metasComColisao.size} CP(s) de meta já pagas ao mesmo ` +
    `vendedor por CP de entrega (Σ comissão MegaBox dessas entregas ${reais(colisaoValor)}) — ligação da meta omitida; ` +
    `${repetidaMeta} entrega(s) em mais de uma CP de meta; ${fora} ponteiro(s) para entrega fora da carga`
  if (relatorio) return resumo
  const ids = await traduzir('contas_pagar', new Set(pares.map((p) => p.b)))
  const rows = pares
    .map((p) => ({ conta_pagar_id: ids.get(p.b), vendedor_id: p.vendedor_id, entrega_id: p.entrega_id, criado_em: p.criado_em }))
    .filter((x) => x.conta_pagar_id)
  const n = await gravarEmLotes('conta_pagar_entregas', rows, (fatia) =>
    sql(
      `insert into public.conta_pagar_entregas (conta_pagar_id, vendedor_id, entrega_id, criado_em)
       select * from jsonb_to_recordset($1::jsonb)
         as x(conta_pagar_id uuid, vendedor_id uuid, entrega_id uuid, criado_em timestamptz)
       on conflict do nothing`,
      [JSON.stringify(fatia)],
    ),
  )
  return `${resumo}; ${n} gravada(s) (${rows.length - n} já existiam)`
}

// ---------------------------------------------------------------------------- cobranças

/**
 * FORNECEDOR DA COBRANÇA (D14: derivado, não o filtro da tela). bTpUa grava `QualFornecedor` =
 * filtro Grupo Fornecedor, que pode estar vazio (240 de 565). Regra: o fornecedor ÚNICO das
 * contas da cobrança (o da entrega, D7) — é o que o trigger de cobranca_contas exige; na falta, o
 * `QualFornecedor`. Sem nenhum dos dois (ou com contas de 2 fornecedores e sem o campo): descartada.
 */
const fornecedorCobranca = new Map()
async function prepararCobrancas(linhas, { bruto, sql }) {
  await lerEntregasDoBanco(sql)
  const crs = new Map(((await bruto('tbl.contasreceber')) ?? []).map((r) => [r._id, r]))
  const ids = [...new Set(linhas.map((r) => r['cpo.QualFornecedor']).filter(Boolean))]
  const grupos = new Map(
    (await sql('select bubble_id, id from public.grupos_clifor where bubble_id = any($1::text[])', [ids])).rows.map((g) => [
      g.bubble_id,
      g.id,
    ]),
  )
  fornecedorCobranca.clear()
  const c = { contas: 0, campo: 0, diverge: 0, sem: 0 }
  for (const r of linhas) {
    const fs = new Set()
    for (const id of r['cpo.QuaisContasReceber'] ?? []) {
      const e = entregaDb.get(crs.get(id)?.['cpo.QualEntrega'])
      if (e) fs.add(e.fornecedor_id)
    }
    const direto = grupos.get(r['cpo.QualFornecedor'])
    if (fs.size === 1) {
      fornecedorCobranca.set(r._id, [...fs][0])
      c.contas++
      if (direto && direto !== [...fs][0]) c.diverge++
    } else if (direto) {
      fornecedorCobranca.set(r._id, direto)
      c.campo++
    } else c.sem++
  }
  return (
    `fornecedor: ${c.contas} pelas contas (${c.diverge} ≠ QualFornecedor), ${c.campo} pelo QualFornecedor, ` +
    `${c.sem} sem fornecedor determinável (descartadas)`
  )
}

async function ligarContasDaCobranca(_db, { relatorio, sql, linhas, gravar, traduzir }) {
  const porB = new Map(gravar.map((l) => [l.bubble_id, l]))
  const crs = [...new Set(linhas.filter((r) => porB.has(r._id)).flatMap((r) => r['cpo.QuaisContasReceber'] ?? []))]
  const anexos = linhas.filter((r) => r['cpo.AnexoLink'] || r['cpo.AnexoFile']).length
  // As CR só são conferidas contra o BANCO (fornecedor derivado da entrega); no relatório, contagem.
  const fornCR = relatorio
    ? new Map()
    : new Map(
        (await sql('select bubble_id, id, fornecedor_id from public.contas_receber where bubble_id = any($1::text[])', [crs])).rows.map(
          (x) => [x.bubble_id, x],
        ),
      )
  const pares = []
  let fora = 0
  let outroFornecedor = 0
  for (const r of linhas) {
    const l = porB.get(r._id)
    if (!l) continue
    for (const id of r['cpo.QuaisContasReceber'] ?? []) {
      if (relatorio) {
        pares.push(id)
        continue
      }
      const cr = fornCR.get(id)
      if (!cr) {
        fora++
        continue
      }
      if (cr.fornecedor_id !== l.fornecedor_id) {
        outroFornecedor++
        continue
      }
      pares.push({ b: r._id, conta_receber_id: cr.id, criado_em: l.criado_em })
    }
  }
  if (relatorio) {
    return `cobranca_contas: até ${pares.length} ligação(ões) (conferidas contra as CR gravadas só na carga real); ${anexos} PDF(s) de cobrança (URL do CDN → passo de arquivos); seq_cobranca_numero seria ajustada`
  }
  const ids = await traduzir('cobrancas', new Set(pares.map((p) => p.b)))
  const rows = pares.map((p) => ({ cobranca_id: ids.get(p.b), conta_receber_id: p.conta_receber_id, criado_em: p.criado_em }))
  const n = await gravarEmLotes(
    'cobranca_contas',
    rows.filter((x) => x.cobranca_id),
    (fatia) =>
      sql(
        `insert into public.cobranca_contas (cobranca_id, conta_receber_id, criado_em)
         select * from jsonb_to_recordset($1::jsonb) as x(cobranca_id uuid, conta_receber_id uuid, criado_em timestamptz)
         on conflict do nothing`,
        [JSON.stringify(fatia)],
      ),
  )
  const s = await sql(
    `select setval('public.seq_cobranca_numero', greatest((select max(numero) from public.cobrancas), 1)) as v`,
  )
  return (
    `cobranca_contas: ${n} gravada(s) de ${pares.length}; ${fora} ponteiro(s) para CR não gravada; ` +
    `${outroFornecedor} CR de outro fornecedor (recusada pelo trigger, D14); ${anexos} PDF(s) → passo de arquivos; ` +
    `seq_cobranca_numero: próximo = ${Number(s.rows[0].v) + 1}`
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
    if (c === '--relatorio' || c === '--baixar' || c === '--rebaixar') out[c.slice(2)] = true
    else if (c?.startsWith('--') && a[i + 1] !== undefined) out[c.slice(2)] = a[i++ + 1]
  }
  return out
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Grava um lote com UMA espera em caso de sobrecarga. A instância é Micro e já caiu por carga:
 * timeout (57014), 522 do gateway ou conexão derrubada → espera 2 min e tenta o MESMO lote uma
 * única vez; se falhar de novo, PARA (a carga é idempotente, a próxima rodada continua). Nunca
 * repete em laço. Entre lotes, 300 ms de respiro para não disputar a CPU com quem usa o banco.
 */
const SOBRECARGA =
  /57014|statement timeout|522|ECONNRESET|fetch failed|socket hang up|timed? ?out|Connection terminated|not queryable/i
async function comEspera(rotulo, gravar) {
  let { error } = await gravar()
  if (error && SOBRECARGA.test(`${error.code ?? ''} ${error.message ?? ''}`)) {
    console.warn(`\n  ${rotulo}: sobrecarga (${error.code ?? error.message}); esperando 2 min e tentando UMA vez…`)
    await dormir(120_000)
    ;({ error } = await gravar())
  }
  if (error) throw new Error(`${rotulo}: ${error.code ?? ''} ${error.message}`)
  await dormir(300)
}

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

  // Campo começando com `_` é SINTÉTICO (posto pelo `preparar`, que roda depois desta conferência).
  for (const [destino, d] of Object.entries(config.dom ?? {})) if (!d.de.startsWith('_')) conferir(destino, d.de, d.reserva)
  for (const [destino, d] of Object.entries(config.ref ?? {})) if (!d.de.startsWith('_')) conferir(destino, d.de)
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
  if (arg.pausa !== undefined) pausaMs = Math.max(0, Number(arg.pausa)) * 1000
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
      // query_timeout + keepAlive: conexão derrubada em silêncio pelo pooler vira erro "timeout"
      // (espera única de comEspera) em vez de pendurar a carga para sempre (visto em 30/09).
      conexao = new pg.Client({
        connectionString: env.DATABASE_URL.trim(),
        ssl: { rejectUnauthorized: false },
        keepAlive: true,
        query_timeout: 180_000,
      })
      await conexao.connect()
    }
    try {
      if (!replica) return await conexao.query(texto, params)
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
    } catch (erro) {
      // Conexão caída não se reaproveita: a próxima chamada (a UMA nova tentativa de comEspera)
      // abre outra. Erro de SQL comum mantém a conexão.
      if (/Connection terminated|ECONNRESET|not queryable|terminat|timeout/i.test(String(erro?.message))) {
        await conexao?.end().catch(() => {})
        conexao = null
      }
      throw erro
    }
  }

  /** Linhas cruas de um tipo: `bruto/`, ou a Data API com `--baixar`. Guardadas para reuso. */
  const cacheBruto = {}
  async function bruto(tipo) {
    if (cacheBruto[tipo]) return cacheBruto[tipo]
    // `--rebaixar` ignora o `bruto/` e o SOBRESCREVE: o que foi baixado sem a chave de admin
    // (privacidade "everyone") está incompleto e velho — medido em 29/09: 11 cotações, 49
    // orçamentos, 6 pedidos e 7 entregas a menos que a API com chave. Baixar sem gravar faria
    // cada rodada (relatório, carga, recarga) pagar 450 páginas da API de novo.
    let linhas = arg.rebaixar ? null : await lerBruto(tipo)
    if (!linhas && (arg.baixar || arg.rebaixar)) {
      console.log(`  ${tipo}: baixando…`)
      linhas = await baixar((env.BUBBLE_APP_URL ?? '').replace(/\/+$/, ''), env.BUBBLE_API_KEY || null, tipo)
      if (arg.rebaixar) {
        await mkdir(join('bruto', tipo), { recursive: true })
        await writeFile(join('bruto', tipo, 'tudo.json'), JSON.stringify({ tipo, baixado_em: new Date().toISOString(), linhas }))
      }
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
      const msg = await config.preparar(linhas, { bruto, sql, relatorio: !!arg.relatorio })
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
    // `gravar` é a MESMA lista que vai ao banco: o `antesDeGravar` pode ajustar linhas nela.
    const contexto = { relatorio: !!arg.relatorio, sql, linhas, traduzir, bruto, gravar: [...gravar, ...adiados] }

    if (arg.relatorio) {
      if (config.antesDeGravar) {
        relatorio.push(`${tipo} (antes de gravar) ${await config.antesDeGravar(db, { ...contexto, gravar })}`)
      }
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
      if (config.antesDeGravar) {
        console.log(`  ${config.tabela}: ${await config.antesDeGravar(db, { ...contexto, gravar })}`)
      }

      for (let i = 0; i < gravar.length; i += LOTE) {
        if (i > 0 && gravar.length > GRANDE) await dormir(pausaMs)
        const fatia = gravar.slice(i, i + LOTE)
        await comEspera(`${config.tabela} lote ${i / LOTE + 1}`, async () => {
          if (!config.replica) {
            return db.from(config.tabela).upsert(fatia, { onConflict: 'bubble_id', ignoreDuplicates: false })
          }
          try {
            await upsertReplica(sql, config.tabela, fatia)
            return {}
          } catch (error) {
            return { error }
          }
        })
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
        const fatia = ligar.slice(i, i + LOTE)
        await comEspera(`${tabela} lote ${i / LOTE + 1}`, () =>
          db.from(tabela).upsert(fatia, { onConflict: `${lig.dono},${lig.alvo}`, ignoreDuplicates: true }),
        )
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
