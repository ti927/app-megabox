import { describe, expect, it, vi } from 'vitest'

import { atrasoAposFalha, decidirAposFalha, ATRASOS_SEGUNDOS } from './backoff'
import {
  ErroEndereco,
  MAX_DESTINATARIOS,
  juntarEnderecos,
  montarDestinatarios,
  separarEnderecos,
} from './enderecos'
import {
  processarFilaCom,
  type AnexoFila,
  type Gravacao,
  type LinhaFila,
  type RepositorioFila,
} from './fila-nucleo'
import {
  ErroModelo,
  escaparHtml,
  formatarRemetente,
  limparCabecalho,
  renderizarModelo,
  textoParaHtml,
  variaveisDoModelo,
} from './modelo'
import {
  ErroConfiguracaoEmail,
  escolherProvedor,
  payloadResend,
  provedorRegistro,
  provedorResend,
  type MensagemPronta,
  type Provedor,
} from './provedor'
import { SEGREDO_MIN, segredoConfere, tokenBearer } from './segredo'

// ------------------------------------------------------------------------------ escape
describe('escaparHtml / textoParaHtml', () => {
  it('escapa os 5 caracteres de HTML', () => {
    expect(escaparHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    )
  })
  it('texto livre vira HTML seguro e preserva linhas', () => {
    expect(textoParaHtml('Olá <b>\r\nfim')).toEqual({ html: 'Olá &lt;b&gt;<br>\nfim' })
  })
  it('limparCabecalho tira CR/LF (injeção de cabeçalho) e controles', () => {
    expect(limparCabecalho('Pedido 1\r\nBcc: x@y.com\u0000 ')).toBe('Pedido 1 Bcc: x@y.com')
  })
})

// ------------------------------------------------------------------------------ modelo
describe('renderizarModelo', () => {
  const modelo = {
    assunto: 'Pedido {{numero}} - {{cliente}}',
    corpo: '<p>Olá <b>{{ contato }}</b></p><div>{{mensagem}}</div>',
  }

  it('substitui e escapa no corpo, não no assunto', () => {
    const r = renderizarModelo(modelo, {
      numero: 1234,
      cliente: 'A & B <Ltda>',
      contato: '<script>alert(1)</script>',
      mensagem: textoParaHtml('linha 1\nlinha 2'),
    })
    expect(r.assunto).toBe('Pedido 1234 - A & B <Ltda>')
    expect(r.html).toBe(
      '<p>Olá <b>&lt;script&gt;alert(1)&lt;/script&gt;</b></p><div>linha 1<br>\nlinha 2</div>',
    )
  })

  it('variável faltando → erro (não manda "{{x}}" ao cliente)', () => {
    expect(() => renderizarModelo(modelo, { numero: 1, cliente: 'x' })).toThrow(ErroModelo)
    expect(() => renderizarModelo(modelo, { numero: 1, cliente: 'x' })).toThrow(/contato, mensagem/)
  })

  it('valor nulo conta como faltando; string vazia é valor', () => {
    expect(() =>
      renderizarModelo({ assunto: 'A {{x}}', corpo: 'c' }, { x: null }),
    ).toThrow(ErroModelo)
    expect(renderizarModelo({ assunto: 'A{{x}}', corpo: 'c' }, { x: '' }).assunto).toBe('A')
  })

  it('HTML pronto no assunto é recusado', () => {
    expect(() =>
      renderizarModelo({ assunto: '{{x}}', corpo: 'c' }, { x: { html: '<b>' } }),
    ).toThrow(/assunto/)
  })

  it('quebra de linha vinda de variável não entra no assunto', () => {
    const r = renderizarModelo(
      { assunto: 'Pedido {{n}}', corpo: 'c' },
      { n: '1\r\nBcc: ataque@x.com' },
    )
    expect(r.assunto).toBe('Pedido 1 Bcc: ataque@x.com')
    expect(r.assunto).not.toMatch(/[\r\n]/)
  })

  it('assunto vazio ou longo demais é recusado', () => {
    expect(() => renderizarModelo({ assunto: '{{x}}', corpo: 'c' }, { x: ' ' })).toThrow(/vazio/)
    expect(() =>
      renderizarModelo({ assunto: '{{x}}', corpo: 'c' }, { x: 'a'.repeat(251) }),
    ).toThrow(/250/)
  })

  it('variaveisDoModelo lista sem repetição', () => {
    expect(variaveisDoModelo('{{a}} {{ b }} {{a}} {{C}}')).toEqual(['a', 'b'])
  })

  it('formatarRemetente saneia o nome', () => {
    expect(formatarRemetente('Grupo "Mega"\r\nBox', 'v@x.com')).toBe('"Grupo Mega Box" <v@x.com>')
    expect(formatarRemetente(null, 'v@x.com')).toBe('v@x.com')
  })
})

// --------------------------------------------------------------------------- endereços
describe('endereços e cópias', () => {
  it('separa por ; , e espaço, normaliza e tira repetidos', () => {
    expect(separarEnderecos(' A@x.com; b@y.com,a@X.com\nc@z.com.br ')).toEqual([
      'a@x.com', 'b@y.com', 'c@z.com.br',
    ])
    expect(separarEnderecos(null)).toEqual([])
    expect(separarEnderecos(' ; , ')).toEqual([])
  })

  it('recusa endereço inválido', () => {
    expect(() => separarEnderecos('fulano')).toThrow(ErroEndereco)
    expect(() => separarEnderecos('a@b')).toThrow(ErroEndereco)
    expect(() => separarEnderecos('"x"<a@b.com>')).toThrow(ErroEndereco)
  })

  it('soma cópias do evento e deixa cada endereço no campo mais visível', () => {
    const d = montarDestinatarios({
      para: 'cliente@x.com',
      cc: 'vendedor@mb.com; cliente@x.com',
      copias: [
        { email: 'contato@mb.com', tipo: 'bcc' },
        { email: 'financeiro@mb.com', tipo: 'bcc' },
        { email: 'VENDEDOR@mb.com', tipo: 'bcc' }, // já está em cc
        { email: 'gerente@mb.com', tipo: 'cc' },
      ],
    })
    expect(d).toEqual({
      para: ['cliente@x.com'],
      cc: ['vendedor@mb.com', 'gerente@mb.com'],
      bcc: ['contato@mb.com', 'financeiro@mb.com'],
    })
  })

  it('sem destinatário principal → erro, mesmo com cópias', () => {
    expect(() =>
      montarDestinatarios({ para: '', copias: [{ email: 'a@b.com', tipo: 'cc' }] }),
    ).toThrow(ErroEndereco)
  })

  it(`mais de ${MAX_DESTINATARIOS} destinatários → erro`, () => {
    const muitos = Array.from({ length: MAX_DESTINATARIOS }, (_, i) => `u${i}@x.com`)
    expect(() => montarDestinatarios({ para: 'a@x.com', cc: muitos })).toThrow(/demais/)
    expect(montarDestinatarios({ para: muitos }).para).toHaveLength(MAX_DESTINATARIOS)
  })

  it('juntarEnderecos', () => {
    expect(juntarEnderecos([])).toBeNull()
    expect(juntarEnderecos(['a@x.com', 'b@x.com'])).toBe('a@x.com; b@x.com')
  })
})

// ------------------------------------------------------------------------------ backoff
describe('backoff', () => {
  const agora = new Date('2026-09-28T12:00:00Z')

  it('atrasos crescentes e teto na última posição', () => {
    expect([1, 2, 3, 4, 5, 9].map(atrasoAposFalha)).toEqual([
      60, 300, 900, 3600, 21600, 21600,
    ])
    expect(atrasoAposFalha(0)).toBe(ATRASOS_SEGUNDOS[0])
  })

  it('transitória abaixo do limite → reagenda', () => {
    expect(decidirAposFalha({ tentativas: 2, maxTentativas: 5, definitivo: false, agora })).toEqual({
      status: 'pendente',
      proximoEnvioEm: new Date('2026-09-28T12:05:00Z'),
    })
  })

  it('limite atingido ou falha definitiva → falhou', () => {
    expect(decidirAposFalha({ tentativas: 5, maxTentativas: 5, definitivo: false, agora }).status).toBe('falhou')
    expect(decidirAposFalha({ tentativas: 1, maxTentativas: 5, definitivo: true, agora }).status).toBe('falhou')
  })
})

// ------------------------------------------------------------------------------ segredo
describe('segredo da rota', () => {
  const esperado = 'x'.repeat(SEGREDO_MIN)
  it('confere só o igual', () => {
    expect(segredoConfere(esperado, esperado)).toBe(true)
    expect(segredoConfere(esperado + 'y', esperado)).toBe(false)
    expect(segredoConfere('curto', esperado)).toBe(false)
    expect(segredoConfere(null, esperado)).toBe(false)
  })
  it('segredo configurado curto demais → nunca confere (falha fechada)', () => {
    expect(segredoConfere('abc', 'abc')).toBe(false)
    expect(segredoConfere('', '')).toBe(false)
  })
  it('tokenBearer', () => {
    expect(tokenBearer('Bearer abc')).toBe('abc')
    expect(tokenBearer('bearer abc ')).toBe('abc')
    expect(tokenBearer('Basic abc')).toBeNull()
    expect(tokenBearer(null)).toBeNull()
  })
})

// ---------------------------------------------------------------------------- provedores
const msg: MensagemPronta = {
  id: '11111111-1111-1111-1111-111111111111',
  remetenteNome: 'Grupo MegaBox',
  para: ['cliente@example.com'],
  cc: [],
  bcc: ['copia@example.com'],
  responderPara: 'vendedor@example.com',
  assunto: 'Pedido 1',
  html: '<p>corpo secreto</p>',
  anexos: [{ nome: 'p.pdf', conteudo: new TextEncoder().encode('PDF') }],
}

describe('escolherProvedor', () => {
  it('padrão é registro (sem EMAIL_MODO, ou qualquer valor ≠ envio)', () => {
    expect(escolherProvedor({}).nome).toBe('registro')
    expect(escolherProvedor({ EMAIL_MODO: 'registro', RESEND_API_KEY: 'k', EMAIL_REMETENTE: 'a@b.com' }).nome).toBe('registro')
    expect(escolherProvedor({ EMAIL_MODO: 'ENVIO', RESEND_API_KEY: 'k', EMAIL_REMETENTE: 'a@b.com' }).nome).toBe('registro')
  })
  it('envio sem chave ou remetente → erro, não cai para registro', () => {
    expect(() => escolherProvedor({ EMAIL_MODO: 'envio' })).toThrow(ErroConfiguracaoEmail)
    expect(() => escolherProvedor({ EMAIL_MODO: 'envio', RESEND_API_KEY: 'k' })).toThrow(ErroConfiguracaoEmail)
  })
  it('envio com tudo → resend', () => {
    const p = escolherProvedor({ EMAIL_MODO: 'envio', RESEND_API_KEY: 'k', EMAIL_REMETENTE: 'a@b.com' })
    expect(p.nome).toBe('resend')
    expect(p.enviaDeVerdade).toBe(true)
  })
})

describe('provedor registro', () => {
  it('não envia e loga sem corpo, assunto nem endereços', async () => {
    const linhas: string[] = []
    const p = provedorRegistro((l) => linhas.push(l))
    expect(p.enviaDeVerdade).toBe(false)
    expect(await p.enviar(msg)).toEqual({ ok: true, provedorId: `registro:${msg.id}` })
    expect(linhas).toHaveLength(1)
    const log = linhas[0]!
    expect(log).not.toContain('corpo secreto')
    expect(log).not.toContain('example.com')
    expect(log).not.toContain('Pedido 1')
    expect(JSON.parse(log)).toMatchObject({ evento: 'email.registro', id: msg.id, destinatarios: 2, anexos: 1 })
  })
})

describe('provedor resend (fetch falso — nada sai para a rede)', () => {
  it('payload', () => {
    expect(payloadResend(msg, 'nao-responda@mb.com')).toEqual({
      from: '"Grupo MegaBox" <nao-responda@mb.com>',
      to: ['cliente@example.com'],
      bcc: ['copia@example.com'],
      reply_to: 'vendedor@example.com',
      subject: 'Pedido 1',
      html: '<p>corpo secreto</p>',
      attachments: [{ filename: 'p.pdf', content: Buffer.from('PDF').toString('base64') }],
    })
  })

  it('manda a chave de idempotência = id da linha', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ id: 're_1' }), { status: 200 }))
    const p = provedorResend({ chave: 'k', remetente: 'a@mb.com', fetch: f as unknown as typeof fetch })
    expect(await p.enviar(msg)).toEqual({ ok: true, provedorId: 're_1' })
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe(`email_outbox/${msg.id}`)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer k')
  })

  it.each([
    [422, true],
    [403, true],
    [400, true],
    [429, false],
    [409, false],
    [500, false],
    [503, false],
  ])('HTTP %i → definitivo=%s', async (status, definitivo) => {
    const f = async () => new Response(JSON.stringify({ name: 'x', message: 'y' }), { status })
    const r = await provedorResend({ chave: 'k', remetente: 'a@mb.com', fetch: f as typeof fetch }).enviar(msg)
    expect(r).toMatchObject({ ok: false, definitivo })
  })

  it('erro de rede é transitório', async () => {
    const f = async () => { throw new Error('ECONNRESET') }
    const r = await provedorResend({ chave: 'k', remetente: 'a@mb.com', fetch: f as typeof fetch }).enviar(msg)
    expect(r).toMatchObject({ ok: false, definitivo: false })
  })
})

// ------------------------------------------------------------------ processador (memória)
type Estado = LinhaFila & {
  status: string
  provedor_id?: string
  erro?: string | null
  proximo?: Date
  enviado_em?: Date
}

/** Repositório em memória que imita fn_email_pegar_lote + o update condicionado ao lote. */
function repoMemoria(linhas: Estado[], anexos: AnexoFila[] = []) {
  let n = 0
  const repo: RepositorioFila = {
    async pegarLote({ limite, maxTentativas, ids }) {
      const lote = `lote-${++n}`
      const alvo = linhas
        .filter((l) => l.status === 'pendente' && l.tentativas < maxTentativas)
        .filter((l) => !ids || ids.includes(l.id))
        .slice(0, limite)
      for (const l of alvo) {
        l.status = 'enviando'
        l.lote_id = lote
        l.tentativas++
      }
      return alvo.map((l) => ({ ...l }))
    },
    async anexos(ids) {
      return anexos.filter((a) => ids.includes(a.email_id))
    },
    async gravar(id, loteId, g: Gravacao) {
      const l = linhas.find((x) => x.id === id)!
      if (l.status !== 'enviando' || l.lote_id !== loteId) return false
      l.status = g.status
      if (g.status === 'enviado' || g.status === 'registrado') l.provedor_id = g.provedorId
      if (g.status === 'enviado') l.enviado_em = g.agora
      if (g.status === 'pendente') l.proximo = g.proximoEnvioEm
      if (g.status === 'pendente' || g.status === 'falhou') l.erro = g.erro
      return true
    },
  }
  return repo
}

function linha(id: string, extra: Partial<Estado> = {}): Estado {
  return {
    id, lote_id: '', tentativas: 0, status: 'pendente',
    para: 'teste@example.com', cc: null, bcc: null, assunto: 'a', corpo: '<p>c</p>',
    responder_para: null, remetente_nome: null, ...extra,
  }
}

function provedorFalso(resultados: Awaited<ReturnType<Provedor['enviar']>>[], deVerdade = true) {
  const enviados: MensagemPronta[] = []
  const p: Provedor = {
    nome: deVerdade ? 'resend' : 'registro',
    enviaDeVerdade: deVerdade,
    async enviar(m) {
      enviados.push(m)
      return resultados.shift() ?? { ok: true, provedorId: `p-${m.id}` }
    },
  }
  return { p, enviados }
}

const semAnexo = async () => new Uint8Array()
const silencio = () => {}

describe('processarFilaCom', () => {
  it('envia, grava enviado e não reenvia na segunda passada (idempotência)', async () => {
    const linhas = [linha('a'), linha('b')]
    const { p, enviados } = provedorFalso([])
    const repo = repoMemoria(linhas)
    const r1 = await processarFilaCom({ repo, provedor: p, lerAnexo: semAnexo, log: silencio })
    const r2 = await processarFilaCom({ repo, provedor: p, lerAnexo: semAnexo, log: silencio })
    expect(r1).toMatchObject({ pegos: 2, enviados: 2 })
    expect(r2.pegos).toBe(0)
    expect(enviados.map((m) => m.id)).toEqual(['a', 'b'])
    expect(linhas.every((l) => l.status === 'enviado' && l.enviado_em)).toBe(true)
  })

  it('modo registro grava `registrado`, nunca `enviado`', async () => {
    const linhas = [linha('a')]
    const { p } = provedorFalso([], false)
    const r = await processarFilaCom({ repo: repoMemoria(linhas), provedor: p, lerAnexo: semAnexo, log: silencio })
    expect(r.registrados).toBe(1)
    expect(linhas[0]!.status).toBe('registrado')
    expect(linhas[0]!.enviado_em).toBeUndefined()
  })

  it('falha transitória reagenda com backoff; definitiva falha de vez', async () => {
    const agora = new Date('2026-09-28T12:00:00Z')
    const linhas = [linha('t'), linha('d')]
    const { p } = provedorFalso([
      { ok: false, erro: 'resend 503', definitivo: false },
      { ok: false, erro: 'resend 422', definitivo: true },
    ])
    const r = await processarFilaCom({
      repo: repoMemoria(linhas), provedor: p, lerAnexo: semAnexo, agora: () => agora, log: silencio,
    })
    expect(r).toMatchObject({ reagendados: 1, falhos: 1 })
    expect(linhas[0]).toMatchObject({ status: 'pendente', erro: 'resend 503', proximo: new Date('2026-09-28T12:01:00Z') })
    expect(linhas[1]).toMatchObject({ status: 'falhou', erro: 'resend 422' })
  })

  it('para no limite de tentativas', async () => {
    const linhas = [linha('x', { tentativas: 2 })]
    const { p } = provedorFalso([{ ok: false, erro: 'rede', definitivo: false }])
    await processarFilaCom({ repo: repoMemoria(linhas), provedor: p, lerAnexo: semAnexo, maxTentativas: 3, log: silencio })
    expect(linhas[0]).toMatchObject({ status: 'falhou', tentativas: 3 })
  })

  it('endereço inválido gravado na linha → falha definitiva sem chamar o provedor', async () => {
    const linhas = [linha('e', { para: 'lixo' })]
    const { p, enviados } = provedorFalso([])
    await processarFilaCom({ repo: repoMemoria(linhas), provedor: p, lerAnexo: semAnexo, log: silencio })
    expect(enviados).toHaveLength(0)
    expect(linhas[0]!.status).toBe('falhou')
  })

  it('anexo que não baixa → reagenda sem enviar sem o anexo', async () => {
    const linhas = [linha('a')]
    const { p, enviados } = provedorFalso([])
    await processarFilaCom({
      repo: repoMemoria(linhas, [{ email_id: 'a', nome_arquivo: 'p.pdf', path: 'propostas/p.pdf' }]),
      provedor: p,
      lerAnexo: async () => { throw new Error('storage fora') },
      log: silencio,
    })
    expect(enviados).toHaveLength(0)
    expect(linhas[0]).toMatchObject({ status: 'pendente', erro: 'storage fora' })
  })

  it('anexos chegam ao provedor, só os da própria mensagem', async () => {
    const linhas = [linha('a'), linha('b')]
    const { p, enviados } = provedorFalso([])
    await processarFilaCom({
      repo: repoMemoria(linhas, [{ email_id: 'a', nome_arquivo: 'p.pdf', path: 'propostas/p.pdf' }]),
      provedor: p,
      lerAnexo: async (path) => new TextEncoder().encode(path),
      log: silencio,
    })
    expect(enviados[0]!.anexos.map((x) => x.nome)).toEqual(['p.pdf'])
    expect(enviados[1]!.anexos).toEqual([])
  })

  it('quem perdeu a trava não grava por cima', async () => {
    const linhas = [linha('a')]
    const repo = repoMemoria(linhas)
    const p: Provedor = {
      nome: 'resend', enviaDeVerdade: true,
      async enviar() {
        // enquanto este lote envia, a linha é "roubada" por outro lote (trava vencida)
        linhas[0]!.lote_id = 'outro'
        return { ok: true, provedorId: 'x' }
      },
    }
    const r = await processarFilaCom({ repo, provedor: p, lerAnexo: semAnexo, log: silencio })
    expect(r.perdidos).toBe(1)
    expect(linhas[0]!.status).toBe('enviando')
  })

  it('ids restringe o lote', async () => {
    const linhas = [linha('a'), linha('b')]
    const { p, enviados } = provedorFalso([])
    await processarFilaCom({ repo: repoMemoria(linhas), provedor: p, lerAnexo: semAnexo, ids: ['b'], log: silencio })
    expect(enviados.map((m) => m.id)).toEqual(['b'])
    expect(linhas[0]!.status).toBe('pendente')
  })
})
