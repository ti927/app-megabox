import { describe, expect, it } from 'vitest'

import {
  caminhoPesquisa,
  camposEditaveis,
  ehDia,
  FILTROS_PADRAO,
  formatarDataHora,
  formatarDuracao,
  formatarMedia,
  formatarNps,
  lerFiltros,
  limitesPeriodo,
  numeroProtocoloBuscado,
  paraQuery,
  podeAlterarProtocolo,
  podeExcluir,
  recortarParaResponsavel,
  rotuloEntrega,
  situacaoConvite,
  temFiltro,
  validarInteracao,
  validarMotivo,
  validarNomePesquisa,
  validarProtocoloEdicao,
  validarProtocoloNovo,
} from './sac'

const U1 = '11111111-1111-4111-8111-111111111111'
const U2 = '22222222-2222-4222-8222-222222222222'
const U3 = '33333333-3333-4333-8333-333333333333'

function form(campos: Record<string, string | string[]>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) {
    for (const x of Array.isArray(v) ? v : [v]) f.append(k, x)
  }
  return f
}

describe('lerFiltros / paraQuery', () => {
  it('URL vazia dá o padrão', () => {
    expect(lerFiltros({})).toEqual(FILTROS_PADRAO)
  })

  it('lê e combina todos os filtros (no Bubble cada um substituía a busca)', () => {
    const f = lerFiltros({
      q: '  mega ',
      status: '2',
      prioridade: '3',
      tipo: '5',
      responsavel: U1.toUpperCase(),
      de: '2026-01-01',
      ate: '2026-01-31',
      excluidos: '1',
      pagina: '3',
      sel: U2,
    })
    expect(f).toMatchObject({
      q: 'mega',
      status: 2,
      prioridade: 3,
      tipo: 5,
      responsavel: U1,
      de: '2026-01-01',
      ate: '2026-01-31',
      excluidos: true,
      pagina: 3,
      sel: U2,
    })
  })

  it('descarta lixo da URL', () => {
    const f = lerFiltros({
      status: 'x',
      prioridade: '-1',
      tipo: '1.5',
      responsavel: 'nao-uuid',
      de: '2026-02-30',
      pagina: '0',
      sel: "1' or 1=1",
      aba: 'outra',
    })
    expect(f).toEqual(FILTROS_PADRAO)
  })

  it('período invertido é destrocado', () => {
    const f = lerFiltros({ de: '2026-03-10', ate: '2026-03-01' })
    expect([f.de, f.ate]).toEqual(['2026-03-01', '2026-03-10'])
  })

  it('ida e volta pela URL preserva os filtros', () => {
    const f = lerFiltros({ aba: 'nps', pesquisa: U3, de: '2026-01-01' })
    const q = paraQuery(f)
    expect(q).toBe(`?aba=nps&de=2026-01-01&pesquisa=${U3}`)
    const volta = lerFiltros(Object.fromEntries(new URLSearchParams(q.slice(1))))
    expect(volta).toEqual(f)
  })

  it('padrão não polui a URL; mudanças sobrescrevem', () => {
    expect(paraQuery(FILTROS_PADRAO)).toBe('')
    expect(paraQuery(FILTROS_PADRAO, { status: 4, pagina: 2 })).toBe('?status=4&pagina=2')
  })

  it('temFiltro', () => {
    expect(temFiltro(FILTROS_PADRAO)).toBe(false)
    expect(temFiltro({ ...FILTROS_PADRAO, tipo: 1 })).toBe(true)
    expect(temFiltro({ ...FILTROS_PADRAO, excluidos: true })).toBe(true)
    // aba, página e ficha não são filtro
    expect(temFiltro({ ...FILTROS_PADRAO, aba: 'nps', pagina: 2, sel: U1 })).toBe(false)
  })
})

describe('datas', () => {
  it('ehDia confere o calendário', () => {
    expect(ehDia('2024-02-29')).toBe(true)
    expect(ehDia('2025-02-29')).toBe(false)
    expect(ehDia('2025-13-01')).toBe(false)
    expect(ehDia('25-01-01')).toBe(false)
  })

  it('limitesPeriodo: meio-aberto, fuso de São Paulo, vira mês e ano', () => {
    expect(limitesPeriodo('2026-01-01', '2026-01-31')).toEqual({
      desde: '2026-01-01T00:00:00-03:00',
      antes: '2026-02-01T00:00:00-03:00',
    })
    expect(limitesPeriodo(null, '2025-12-31').antes).toBe('2026-01-01T00:00:00-03:00')
    expect(limitesPeriodo(null, null)).toEqual({ desde: null, antes: null })
  })

  it('formatarDataHora no fuso de São Paulo', () => {
    expect(formatarDataHora('2026-01-15T13:05:00Z')).toBe('15/01/26 10:05')
    expect(formatarDataHora('2026-01-01T02:00:00Z')).toBe('31/12/25 23:00')
    expect(formatarDataHora(null)).toBe('—')
    expect(formatarDataHora('lixo')).toBe('—')
  })

  it('formatarDuracao lê o interval do Postgres', () => {
    expect(formatarDuracao(null)).toBe('—')
    expect(formatarDuracao('00:00:20')).toBe('menos de 1 min')
    expect(formatarDuracao('00:42:10.5')).toBe('42 min')
    expect(formatarDuracao('05:42:10')).toBe('5 h 42 min')
    expect(formatarDuracao('1 day')).toBe('1 dia')
    expect(formatarDuracao('3 days 04:05:06.123')).toBe('3 dias 4 h')
    expect(formatarDuracao('27:00:00')).toBe('1 dia 3 h')
    expect(formatarDuracao('lixo')).toBe('—')
  })
})

describe('busca', () => {
  it('número do protocolo x nome do cliente', () => {
    expect(numeroProtocoloBuscado('123')).toBe(123)
    expect(numeroProtocoloBuscado('#45')).toBe(45)
    expect(numeroProtocoloBuscado('mega 12')).toBeNull()
    expect(numeroProtocoloBuscado('')).toBeNull()
  })
})

describe('permissões (D1/D4 da 013, sac [DÚVIDA 5])', () => {
  const diretor = { id: U1, ehDiretor: true }
  const analista = { id: U2, ehDiretor: false }

  it('Diretor altera tudo; responsável só status e descrição; os outros nada', () => {
    expect(camposEditaveis(diretor, { responsavel_id: U3, excluido_em: null })).toBe('todos')
    expect(camposEditaveis(analista, { responsavel_id: U2, excluido_em: null })).toBe('status_descricao')
    expect(camposEditaveis(analista, { responsavel_id: U3, excluido_em: null })).toBe('nenhum')
    expect(camposEditaveis(analista, { responsavel_id: null, excluido_em: null })).toBe('nenhum')
  })

  it('excluído não se edita, nem pelo Diretor', () => {
    expect(camposEditaveis(diretor, { responsavel_id: U1, excluido_em: '2026-01-01' })).toBe('nenhum')
  })

  it('podeAlterarProtocolo e podeExcluir', () => {
    expect(podeAlterarProtocolo(analista, { responsavel_id: U2 })).toBe(true)
    expect(podeAlterarProtocolo(analista, { responsavel_id: null })).toBe(false)
    expect(podeExcluir(diretor)).toBe(true)
    expect(podeExcluir(analista)).toBe(false)
  })
})

describe('validação do protocolo', () => {
  const base = {
    grupo_clifor_id: U1,
    tipo_ocorrencia_id: '1',
    prioridade_id: '3',
    status_id: '1',
    descricao: '  caixa chegou amassada ',
  }

  it('novo: aceita o mínimo e normaliza', () => {
    const r = validarProtocoloNovo(form(base))
    expect(r).toEqual({
      ok: true,
      dados: {
        grupo_clifor_id: U1,
        filial_id: null,
        pedido_id: null,
        responsavel_id: null,
        tipo_ocorrencia_id: 1,
        prioridade_id: 3,
        status_id: 1,
        descricao: 'caixa chegou amassada',
        entregas: [],
      },
    })
  })

  it('novo: exige cliente, tipo, prioridade, status e descrição', () => {
    expect(validarProtocoloNovo(form({ ...base, grupo_clifor_id: '' })).ok).toBe(false)
    expect(validarProtocoloNovo(form({ ...base, tipo_ocorrencia_id: '' })).ok).toBe(false)
    expect(validarProtocoloNovo(form({ ...base, prioridade_id: '0' })).ok).toBe(false)
    expect(validarProtocoloNovo(form({ ...base, status_id: 'x' })).ok).toBe(false)
    expect(validarProtocoloNovo(form({ ...base, descricao: '   ' })).ok).toBe(false)
  })

  it('novo: entrega só com pedido; ids repetidos viram um', () => {
    expect(validarProtocoloNovo(form({ ...base, entregas: [U2] })).ok).toBe(false)
    const r = validarProtocoloNovo(form({ ...base, pedido_id: U3, entregas: [U2, U2.toUpperCase()] }))
    expect(r.ok && r.dados.entregas).toEqual([U2])
  })

  it('recusa uuid malformado em vez de ignorar', () => {
    expect(validarProtocoloNovo(form({ ...base, responsavel_id: 'abc' })).ok).toBe(false)
    expect(validarProtocoloNovo(form({ ...base, pedido_id: 'abc' })).ok).toBe(false)
    expect(validarProtocoloEdicao(form({ ...base, entregas: ['abc'] })).ok).toBe(false)
  })

  it('edição: o responsável só leva status e descrição', () => {
    const r = validarProtocoloEdicao(form({ ...base, responsavel_id: U2, filial_id: U3 }))
    expect(r.ok).toBe(true)
    if (r.ok) expect(recortarParaResponsavel(r.dados)).toEqual({ status_id: 1, descricao: 'caixa chegou amassada' })
  })
})

describe('validação de interação, motivo e pesquisa', () => {
  it('visível ao cliente exige contato (sac.md §4.5)', () => {
    expect(validarInteracao(form({ descricao: 'x', visivel_cliente: 'on' }))).toEqual({
      ok: false,
      erro: 'Escolha o contato do cliente que deve ver esta interação.',
    })
    expect(validarInteracao(form({ descricao: 'x', visivel_cliente: 'on', contato_id: U1 }))).toEqual({
      ok: true,
      dados: { descricao: 'x', visivel_cliente: true, contato_id: U1 },
    })
  })

  it('interna descarta o contato; texto vazio não passa', () => {
    expect(validarInteracao(form({ descricao: 'x', contato_id: U1 }))).toEqual({
      ok: true,
      dados: { descricao: 'x', visivel_cliente: false, contato_id: null },
    })
    expect(validarInteracao(form({ descricao: '  ' })).ok).toBe(false)
  })

  it('motivo e título', () => {
    expect(validarMotivo('  ab ').ok).toBe(false)
    expect(validarMotivo(' duplicado   do 12 ')).toEqual({ ok: true, dados: 'duplicado do 12' })
    expect(validarNomePesquisa('a').ok).toBe(false)
    expect(validarNomePesquisa('NPS  1º tri')).toEqual({ ok: true, dados: 'NPS 1º tri' })
  })
})

describe('apresentação', () => {
  it('rotuloEntrega no formato Dt Prev / Qtd / Nf', () => {
    expect(
      rotuloEntrega({ numero_entrega: '2', dt_prev_entrega: '2026-03-05', qtd: '100.000', nf_fornecedor_numero: '881' }),
    ).toBe('Entrega 2 · 05/03/2026 / 100 / NF 881')
    expect(
      rotuloEntrega({ numero_entrega: null, dt_prev_entrega: null, qtd: '12.500', nf_fornecedor_numero: null }),
    ).toBe('sem previsão / 12,5 / sem NF')
    expect(rotuloEntrega({ numero_entrega: null, dt_prev_entrega: null, qtd: '100', nf_fornecedor_numero: null })).toBe(
      'sem previsão / 100 / sem NF',
    )
  })

  it('NPS com sinal e média sem zeros', () => {
    expect(formatarNps(40)).toBe('+40')
    expect(formatarNps(-15)).toBe('-15')
    expect(formatarNps(0)).toBe('0')
    expect(formatarNps(null)).toBe('—')
    expect(formatarMedia('8.50')).toBe('8,5')
    expect(formatarMedia('10.00')).toBe('10')
    expect(formatarMedia('7.25')).toBe('7,25')
    expect(formatarMedia(null)).toBe('—')
  })
})

describe('convite', () => {
  it('caminhoPesquisa só monta link com token bem formado', () => {
    const token = 'A'.repeat(40) + '-_9'
    expect(caminhoPesquisa(token)).toBe(`/formulario/${token}`)
    expect(caminhoPesquisa('curto')).toBeNull()
    expect(caminhoPesquisa(`${token}/../x`)).toBeNull()
    expect(caminhoPesquisa(null)).toBeNull()
  })

  it('situacaoConvite', () => {
    const agora = new Date('2026-05-10T12:00:00Z')
    const c = { usado_em: null, cancelado_em: null, enviado_em: null, expira_em: '2026-06-01T00:00:00Z' }
    expect(situacaoConvite(c, agora)).toBe('nao_enviado')
    expect(situacaoConvite({ ...c, enviado_em: '2026-05-01T00:00:00Z' }, agora)).toBe('enviado')
    expect(
      situacaoConvite({ ...c, enviado_em: '2026-05-01T00:00:00Z', expira_em: '2026-05-09T00:00:00Z' }, agora),
    ).toBe('expirado')
    expect(situacaoConvite({ ...c, cancelado_em: '2026-05-02T00:00:00Z' }, agora)).toBe('cancelado')
    expect(situacaoConvite({ ...c, usado_em: '2026-05-02T00:00:00Z' }, agora)).toBe('respondido')
  })
})
