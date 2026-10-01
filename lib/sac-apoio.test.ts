import { describe, expect, it } from 'vitest'

import {
  formatarDecimal,
  fracaoNota,
  nomeArquivoRelatorio,
  type Ocorrencia,
  ordenarOcorrencias,
  pendencias,
  formatarPct,
  type IndicadoresApoio,
  lerFiltrosApoio,
  lerTrimestre,
  limitesTrimestre,
  linhasRelatorio,
  paraCentesimos,
  paraCsv,
  planilhaRelatorio,
  queryApoio,
  rotuloTrimestre,
  textoDaAcao,
  trimestreDe,
  trimestresRecentes,
  validarAcompanhamento,
  validarOportunidade,
  validarParametros,
} from './sac-apoio'

const UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const UUID2 = '9b2c1a55-1111-4222-8333-444455556666'

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.append(k, v)
  return f
}

describe('trimestre', () => {
  it('dia → trimestre', () => {
    expect(trimestreDe('2026-01-01')).toEqual({ ano: 2026, trimestre: 1 })
    expect(trimestreDe('2026-09-30')).toEqual({ ano: 2026, trimestre: 3 })
    expect(trimestreDe('2026-10-01')).toEqual({ ano: 2026, trimestre: 4 })
  })
  it('limites: último dia certo em cada trimestre', () => {
    expect(limitesTrimestre({ ano: 2026, trimestre: 1 })).toEqual({ de: '2026-01-01', ate: '2026-03-31' })
    expect(limitesTrimestre({ ano: 2026, trimestre: 3 })).toEqual({ de: '2026-07-01', ate: '2026-09-30' })
    expect(limitesTrimestre({ ano: 2024, trimestre: 4 })).toEqual({ de: '2024-10-01', ate: '2024-12-31' })
  })
  it('URL inválida cai no trimestre de hoje', () => {
    expect(lerTrimestre('2025-2', '2026-09-30')).toEqual({ ano: 2025, trimestre: 2 })
    expect(lerTrimestre('2025-5', '2026-09-30')).toEqual({ ano: 2026, trimestre: 3 })
    expect(lerTrimestre('1999-1', '2026-09-30')).toEqual({ ano: 2026, trimestre: 3 })
    expect(lerTrimestre('', '2026-09-30')).toEqual({ ano: 2026, trimestre: 3 })
  })
  it('rótulo e lista dos recentes atravessando o ano', () => {
    expect(rotuloTrimestre({ ano: 2026, trimestre: 3 })).toBe('3º tri/2026 (jul–set)')
    expect(rotuloTrimestre({ ano: 2026, trimestre: 1 }, true)).toBe('1º tri/2026')
    expect(trimestresRecentes('2026-02-10', 3)).toEqual([
      { ano: 2026, trimestre: 1 },
      { ano: 2025, trimestre: 4 },
      { ano: 2025, trimestre: 3 },
    ])
  })
  it('filtros e query', () => {
    const f = lerFiltrosApoio({ t: '2026-2', responsavel: UUID.toUpperCase() }, '2026-09-30')
    expect(f).toEqual({ t: { ano: 2026, trimestre: 2 }, responsavel: UUID })
    expect(queryApoio('apoio', f)).toBe(`?aba=apoio&t=2026-2&responsavel=${UUID}`)
    expect(queryApoio('oportunidades', f, { responsavel: null })).toBe('?aba=oportunidades&t=2026-2')
    expect(lerFiltrosApoio({ responsavel: 'x' }, '2026-09-30').responsavel).toBeNull()
  })
})

describe('acompanhamento do chamado', () => {
  it('prazo, fornecedor e motivo', () => {
    expect(validarAcompanhamento(form({ prazo_em: '2026-10-05', depende_fornecedor: 'on', motivo_pendencia: ' fornecedor atrasou ' }))).toEqual({
      ok: true,
      dados: { prazo_em: '2026-10-05', depende_fornecedor: true, motivo_pendencia: 'fornecedor atrasou' },
    })
    expect(validarAcompanhamento(form({}))).toEqual({
      ok: true,
      dados: { prazo_em: null, depende_fornecedor: false, motivo_pendencia: null },
    })
    expect(validarAcompanhamento(form({ prazo_em: '2026-02-30' })).ok).toBe(false)
  })
  it('ação em 1 clique: texto vazio vira a frase do tipo', () => {
    expect(textoDaAcao('cobranca_fornecedor', '  ')).toBe('Cobrança feita ao fornecedor.')
    expect(textoDaAcao('retorno_cliente', 'Liguei e expliquei')).toBe('Liguei e expliquei')
  })
})

describe('oportunidade', () => {
  const HOJE = '2026-09-30'
  it('cliente do cadastro: o prospect é ignorado', () => {
    const r = validarOportunidade(form({ grupo_clifor_id: UUID, prospect_nome: 'x', categoria: 'novo_cliente' }), HOJE)
    expect(r).toEqual({
      ok: true,
      dados: {
        grupo_clifor_id: UUID,
        prospect_nome: null,
        prospect_contato: null,
        vendedor_id: null,
        identificada_em: HOJE,
        apresentacao_em: null,
        categoria: 'novo_cliente',
        resultado: 'em_andamento',
        observacao: null,
      },
    })
  })
  it('prospect sem cadastro', () => {
    const r = validarOportunidade(
      form({ prospect_nome: '  Padaria   Boa ', categoria: 'interesse', apresentacao_em: '2026-09-20', identificada_em: '2026-09-18' }),
      HOJE,
    )
    expect(r.ok && r.dados.prospect_nome).toBe('Padaria Boa')
    expect(r.ok && r.dados.apresentacao_em).toBe('2026-09-20')
  })
  it('recusas', () => {
    expect(validarOportunidade(form({ categoria: 'novo_cliente' }), HOJE).ok).toBe(false)
    expect(validarOportunidade(form({ grupo_clifor_id: UUID, categoria: 'venda' }), HOJE).ok).toBe(false)
    expect(validarOportunidade(form({ grupo_clifor_id: UUID, categoria: 'qualificada', resultado: 'encaminhada' }), HOJE).ok).toBe(false)
    expect(
      validarOportunidade(form({ grupo_clifor_id: UUID, categoria: 'qualificada', resultado: 'encaminhada', vendedor_id: UUID2 }), HOJE).ok,
    ).toBe(true)
    expect(validarOportunidade(form({ grupo_clifor_id: UUID, categoria: 'interesse', identificada_em: '2026-10-01' }), HOJE).ok).toBe(false)
    expect(validarOportunidade(form({ grupo_clifor_id: UUID, categoria: 'interesse', apresentacao_em: '2026-10-01' }), HOJE).ok).toBe(false)
  })
})

describe('parâmetros', () => {
  const base = {
    peso_pesquisa: '25',
    meta_pesquisa_pct: '25',
    peso_avaliacao: '25',
    meta_avaliacao_media: '9,0',
    min_avaliacoes: '10',
    peso_oportunidades: '30',
    meta_oportunidades: '30',
    peso_prazo: '10',
    meta_prazo_pct: '95',
    peso_parados: '5',
    meta_parados: '0',
    peso_retorno: '5',
    meta_retorno_pct: '95',
    dias_sem_atualizacao: '3',
    prazo_padrao_dias: '5',
  }
  it('centésimos exatos, sem float', () => {
    expect(paraCentesimos('9,5')).toBe(950)
    expect(paraCentesimos('33.33')).toBe(3333)
    expect(paraCentesimos('0,1')).toBe(10)
    expect(paraCentesimos('1,234')).toBeNull()
    expect(paraCentesimos('-1')).toBeNull()
  })
  it('os números do dono passam', () => {
    const r = validarParametros(form(base))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.dados.meta_avaliacao_media).toBe('9.00')
      expect(r.dados.peso_oportunidades).toBe('30.00')
      expect(r.dados.nota_proporcional).toBe(false)
    }
  })
  it('pesos com centavos que somam 100 exatos (33,33 + 33,33 + 33,34)', () => {
    const r = validarParametros(
      form({ ...base, peso_pesquisa: '33,33', peso_avaliacao: '33,33', peso_oportunidades: '33,34', peso_prazo: '0', peso_parados: '0', peso_retorno: '0' }),
    )
    expect(r.ok).toBe(true)
  })
  it('pesos que não somam 100 são recusados', () => {
    const r = validarParametros(form({ ...base, peso_oportunidades: '29,99' }))
    expect(r).toEqual({ ok: false, erro: 'Os pesos somam 99,99%: precisam somar 100%.' })
  })
  it('faixas', () => {
    expect(validarParametros(form({ ...base, meta_avaliacao_media: '11' })).ok).toBe(false)
    expect(validarParametros(form({ ...base, dias_sem_atualizacao: '0' })).ok).toBe(false)
    expect(validarParametros(form({ ...base, prazo_padrao_dias: '91' })).ok).toBe(false)
  })
})

/** O cenário do teste de banco (scripts/testar-rls-sac-apoio.mjs), no formato do jsonb. */
const PAINEL: IndicadoresApoio = {
  periodo: { ano: 2019, trimestre: 3, de: '2019-07-01', ate: '2019-09-30', referencia: '2019-10-01T03:00:00+00:00', encerrado: true, responsavel: null },
  parametros: { dias_sem_atualizacao: 5, nota_proporcional: false },
  pesquisa: { peso: 25, meta: 25, realizado: 37.5, nota: 25, atingida: true, enviadas: 8, respondidas: 3, media: 9 },
  avaliacao: {
    peso: 25,
    meta: 9,
    realizado: 9.23,
    nota: 25,
    atingida: true,
    minimo: 15,
    validas: 20,
    suficiente: true,
    mensal: [
      { mes: '2019-07-01', avaliacoes: 5, media: 9.2 },
      { mes: '2019-08-01', avaliacoes: 10, media: 9.1 },
      { mes: '2019-09-01', avaliacoes: 5, media: 9.4 },
    ],
  },
  oportunidades: {
    peso: 30,
    meta: 30,
    realizado: 28,
    nota: 0,
    atingida: false,
    por_categoria: { novo_cliente: 10, inativo_recuperado: 5, interesse: 7, qualificada: 6 },
    por_resultado: { em_andamento: 20, encaminhada: 6, venda_fechada: 1, sem_interesse: 1 },
  },
  acompanhamento: {
    peso: 20,
    nota: 0,
    atingida: false,
    dias_sem_atualizacao: 5,
    total: 8,
    resolvidas: 4,
    abertas: 4,
    parados: 2,
    com_retorno: 5,
    com_acoes_completas: 3,
    no_prazo: 2,
    acompanhadas: 2,
    fora_prazo: 3,
    em_andamento: 1,
    prazo: { peso: 10, meta: 95, realizado: 57.14, nota: 0, atingida: false },
    parados_ind: { peso: 5, meta: 0, realizado: 2, nota: 0, atingida: false },
    retorno: { peso: 5, meta: 95, realizado: 75, nota: 0, atingida: false },
  },
  total: 50,
}

describe('relatório', () => {
  it('formatação decimal sem float', () => {
    expect(formatarDecimal(9.2333)).toBe('9,23')
    expect(formatarDecimal('57.14')).toBe('57,14')
    expect(formatarDecimal(37.5)).toBe('37,50')
    expect(formatarDecimal(1234, 0)).toBe('1.234')
    expect(formatarDecimal(null)).toBe('—')
    expect(formatarPct(75)).toBe('75,00%')
  })
  it('sete linhas: quatro indicadores e três sub-indicadores', () => {
    const l = linhasRelatorio(PAINEL)
    expect(l.map((x) => x.chave)).toEqual(['pesquisa', 'avaliacao', 'oportunidades', 'acompanhamento', 'prazo', 'parados', 'retorno'])
    expect(l.filter((x) => x.sub).length).toBe(3)
    expect(l[1]!.realizado).toBe('9,23')
    expect(l[4]!.detalhe).toContain('2 atrasadas mas acompanhadas')
    expect(l[5]!.indicador).toBe('Sem atualização há mais de 5 dias')
  })
  it('planilha e CSV', () => {
    const p = planilhaRelatorio(PAINEL, 'Fulana')
    expect(p[1]).toEqual(['Trimestre', '3º tri/2019 (jul–set)'])
    expect(p.at(-1)).toEqual(['Total', { numero: '100' }, '', '', { numero: '50' }, '', ''])
    const csv = paraCsv([['a;b', { numero: '9.23' }, null]])
    expect(csv).toBe('﻿"a;b";9,23;')
  })
})

describe('ocorrências', () => {
  const base: Ocorrencia = {
    protocolo_id: UUID,
    responsavel_id: UUID2,
    aberto_em: '2026-07-01T10:00:00-03:00',
    fechado_em: null,
    prazo: '2026-07-06',
    prazo_definido: false,
    ultima_acao_em: '2026-07-01T10:00:00-03:00',
    dias_sem_acao: 0,
    acoes: 0,
    cliente_informado: false,
    fornecedor_cobrado: false,
    aplica_fornecedor: false,
    motivo_registrado: false,
    atrasado: false,
    parado: false,
    situacao: 'em_andamento',
    acoes_completas: false,
  }
  it('ordena: parados, fora do prazo, acompanhadas, em andamento, no prazo', () => {
    const l = ordenarOcorrencias([
      { ...base, protocolo_id: 'np', situacao: 'no_prazo' },
      { ...base, protocolo_id: 'ea', situacao: 'em_andamento' },
      { ...base, protocolo_id: 'ac', situacao: 'acompanhada' },
      { ...base, protocolo_id: 'fp', situacao: 'fora_prazo' },
      { ...base, protocolo_id: 'pa', situacao: 'em_andamento', parado: true, dias_sem_acao: 4 },
      { ...base, protocolo_id: 'pb', situacao: 'fora_prazo', parado: true, dias_sem_acao: 9 },
    ])
    expect(l.map((o) => o.protocolo_id)).toEqual(['pb', 'pa', 'fp', 'ac', 'ea', 'np'])
  })
  it('pendências dizem o que falta registrar', () => {
    expect(pendencias({ ...base, situacao: 'no_prazo' }, 3)).toEqual([])
    expect(
      pendencias({ ...base, situacao: 'fora_prazo', atrasado: true, parado: true, dias_sem_acao: 8, aplica_fornecedor: true }, 3),
    ).toEqual([
      'sem ação há 8 dias (limite 3)',
      'nenhuma ação registrada',
      'cliente não informado',
      'fornecedor não cobrado',
      'sem motivo da pendência',
    ])
    expect(
      pendencias({ ...base, situacao: 'acompanhada', atrasado: true, acoes: 2, cliente_informado: true, motivo_registrado: true }, 3),
    ).toEqual([])
  })
  it('fração da nota para a barra', () => {
    expect(fracaoNota('12.5', '25')).toBe(0.5)
    expect(fracaoNota(30, 25)).toBe(1)
    expect(fracaoNota(null, 25)).toBe(0)
    expect(fracaoNota(5, 0)).toBe(0)
  })
  it('nome do arquivo sem acento', () => {
    expect(nomeArquivoRelatorio({ ano: 2026, trimestre: 3 }, 'Ana Conceição')).toBe('apoio-comercial-2026-t3-ana-conceicao')
    expect(nomeArquivoRelatorio({ ano: 2026, trimestre: 1 }, '')).toBe('apoio-comercial-2026-t1')
  })
})
