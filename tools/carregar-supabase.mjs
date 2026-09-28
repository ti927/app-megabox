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

const LOTE = 500

// ---------------------------------------------------------------------------------
// De-para. Cresce a cada fatia; hoje cobre a fatia 2 (cadastro) e a 3 (produtos).
// `col`  = colunas escalares, destino ← nome de exibição do Bubble (ou função)
// `ref`  = colunas de FK, traduzidas de bubble_id para uuid ANTES do insert
// `dom`  = colunas que apontam para lista fixa, resolvidas por chave_bubble
// `ligacoes` = LISTA dentro do registro que vira N linhas numa tabela de ligação pura
//          (pk composta, sem bubble_id — 02 §1.5). Cada item: `de` (campo lista), `dono`
//          (coluna que recebe o uuid do próprio registro), `alvo` (coluna do item) e `dom`
//          (lista fixa) OU `ref` (tabela com bubble_id). Grava com `on conflict do nothing`.
// `posCarga` = passo que roda depois da gravação do tipo (e, no relatório, só conta).
// Todo tipo ganha `criado_em` ← `Created Date` e `alterado_em` ← `Modified Date`.
// ---------------------------------------------------------------------------------
const soDigitos = (v) => String(v ?? '').replace(/\D/g, '') || null
const texto = (v) => (v === undefined || v === null || v === '' ? null : String(v))
const bool = (v) => v === true
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
    for (const l of data) {
      // A PRÓPRIA CHAVE entra no índice quando ela é texto, e não é preciosismo: em `ufs` a
      // chave_bubble de Paraná é `pf`, não `pr` — erro de digitação que está no option set do
      // Bubble desde sempre. A Data API manda o rótulo "PR", que não bate nem com a chave `pf`
      // nem com o nome "Paraná", e 401 endereços ficavam sem UF. A sigla é a identidade real da
      // linha, então é ela que fecha o caso. Quarta variação da mesma armadilha: a API fala por
      // nome, o mapa decompilado fala por id, e às vezes o id do Bubble está simplesmente errado.
      for (const forma of [l.chave_bubble, l.nome, typeof l[chave] === 'string' ? l[chave] : null]) {
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
  const PREVISTO = '(previsto)'
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

  for (const tipo of tipos) {
    const config = MAPA[tipo]
    if (!config) {
      console.error(`  ${tipo}: sem de-para no MAPA — pulado`)
      continue
    }

    let linhas = await lerBruto(tipo)
    if (!linhas) {
      if (!arg.baixar) {
        console.error(`  ${tipo}: nada em bruto/${tipo}/. Rode a extração, ou use --baixar.`)
        continue
      }
      console.log(`  ${tipo}: baixando…`)
      linhas = await baixar(
        (env.BUBBLE_APP_URL ?? '').replace(/\/+$/, ''),
        env.BUBBLE_API_KEY || null,
        tipo,
      )
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
          linha[destino] = null
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
        const alvo = r[d.de]
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
    const gravar = registros.filter((linha) => {
      const faltando = (config.obrigatorias ?? []).filter((c) => linha[c] == null)
      if (faltando.length === 0) return true
      descartados++
      for (const c of faltando) faltaPorColuna[c] = (faltaPorColuna[c] ?? 0) + 1
      return false
    })

    const resumoAvisos = [...new Set(avisos)].slice(0, 10)
    const resumoDescarte = descartados
      ? `${descartados} linha(s) DESCARTADA(s) por coluna not null vazia — ` +
        Object.entries(faltaPorColuna)
          .map(([c, n]) => `${c}: ${n}`)
          .join(', ')
      : ''

    if (arg.relatorio) {
      previstos[config.tabela] = new Set(gravar.map((l) => l.bubble_id))
      relatorio.push(
        `${tipo} → ${config.tabela}: ${gravar.length} linha(s) grava, ` +
          `${descartados} descarta, ${avisos.length} aviso(s) de tradução` +
          (resumoDescarte ? `\n      ${resumoDescarte}` : '') +
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
    }

    // --------------------------------------------- ligações puras (listas dentro do registro)
    // Roda DEPOIS da gravação do dono, porque precisa do uuid dele; no relatório o dono conta
    // como `previsto`. Registro descartado não liga nada (o dono não existe).
    const gravados = new Set(gravar.map((l) => l.bubble_id))
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
      const ligar = [...unicas.values()]
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
      const msg = await config.posCarga(db, { relatorio: !!arg.relatorio })
      if (arg.relatorio) relatorio.push(`${tipo} (pós-carga) ${msg}`)
      else console.log(`  ${config.tabela}: ${msg}`)
    }
  }
  if (arg.relatorio) {
    console.log('\nModo relatório — nada foi gravado.\n')
    for (const l of relatorio) console.log(`  ${l}`)
    console.log('\nConfira os avisos antes de rodar sem --relatorio.')
  }
}

await main()
