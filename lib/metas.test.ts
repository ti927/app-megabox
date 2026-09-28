import { describe, expect, it } from 'vitest'

import {
  compararReais,
  deEscala,
  ehDataIso,
  faixaAtingimento,
  formatarPercentual,
  larguraBarra,
  lerFiltrosMetas,
  lerPercentualDigitado,
  limitesDoMes,
  mesAtual,
  metaColetiva,
  nomeDoMes,
  paraEscala,
  paraQueryMetas,
  reguaNivel,
  somarMeses,
  somarReais,
  validarMeta,
} from './metas'

describe('decimal exato', () => {
  it('lê e arredonda meio para longe do zero, como round() do Postgres', () => {
    expect(paraEscala('14.500725', 2)).toBe(1450n)
    expect(paraEscala('6.665', 2)).toBe(667n)
    expect(paraEscala('-6.665', 2)).toBe(-667n)
    expect(paraEscala('12', 2)).toBe(1200n)
    expect(paraEscala('abc', 2)).toBeNull()
    expect(paraEscala(null, 2)).toBeNull()
  })
  it('escreve no formato do banco', () => {
    expect(deEscala(1450n, 2)).toBe('14.50')
    expect(deEscala(5n, 2)).toBe('0.05')
    expect(deEscala(-5n, 2)).toBe('-0.05')
    expect(deEscala(725n, 4)).toBe('0.0725')
  })
  it('soma sem erro de float (0,1 + 0,2)', () => {
    expect(somarReais(['0.10', '0.20'])).toBe('0.30')
    expect(somarReais(['123.46', '76.55', null])).toBe('200.01')
    expect(somarReais([])).toBe('0.00')
  })
  it('compara', () => {
    expect(compararReais('200.01', '200.00')).toBe(1)
    expect(compararReais('200.00', '200')).toBe(0)
  })
})

describe('formatarPercentual (razão 1 = 100%)', () => {
  it('formata a razão da view', () => {
    expect(formatarPercentual('0.8000')).toBe('80,0%')
    expect(formatarPercentual('1.0000')).toBe('100,0%')
    expect(formatarPercentual('1.2500')).toBe('125,0%')
    expect(formatarPercentual('12.3456', 2)).toBe('1.234,56%')
    expect(formatarPercentual('0.0725', 2)).toBe('7,25%')
    expect(formatarPercentual('0.99995', 1)).toBe('100,0%')
  })
  it('meta zero (percentual nulo) não divide por zero', () => {
    expect(formatarPercentual(null)).toBe('—')
  })
})

describe('barra e faixa (Progress-Bar A, bTvpx)', () => {
  it('floor e satura em 100', () => {
    expect(larguraBarra('0.8099')).toBe(80)
    expect(larguraBarra('1.7000')).toBe(100)
    expect(larguraBarra(null)).toBe(0)
    expect(larguraBarra('0')).toBe(0)
  })
  it('exatamente 100% é meta batida (o ≥ de bTvqD)', () => {
    expect(faixaAtingimento('1.0000')).toBe('batida')
    expect(faixaAtingimento('0.9999')).toBe('media')
    expect(faixaAtingimento('0.5000')).toBe('media')
    expect(faixaAtingimento('0.4999')).toBe('baixa')
    expect(faixaAtingimento(null)).toBe('sem-meta')
  })
})

describe('metaColetiva (bTzgt0: média de 3 meses × 1,25 com piso)', () => {
  it('acima do piso: M', () => {
    // (90.000 + 100.000 + 110.000) / 3 × 1,25 = 125.000
    expect(metaColetiva(['90000.00', '100000.00', '110000.00'])).toBe('125000.00')
  })
  it('abaixo do piso: piso', () => {
    expect(metaColetiva(['10000.00', '20000.00', '30000.00'])).toBe('80000.00')
  })
  it('empate exato com o piso dá o piso (no Bubble ficava vazio)', () => {
    // 64.000 × 3 / 3 × 1,25 = 80.000
    expect(metaColetiva(['64000.00', '64000.00', '64000.00'])).toBe('80000.00')
  })
  it('mês sem fechamento entra como zero', () => {
    expect(metaColetiva(['200000.00', null, null])).toBe('83333.33')
    expect(metaColetiva([])).toBe('80000.00')
  })
  it('arredonda ao centavo numa conta só', () => {
    // 100.000,01 / 3 × 1,25 = 41.666,670833… ; piso 0 para ver o M
    expect(metaColetiva(['100000.01'], { piso: '0', multiplicador: '1.25' })).toBe('41666.67')
    expect(metaColetiva(['0.02'], { piso: '0', multiplicador: '1.25' })).toBe('0.01')
  })
})

describe('reguaNivel (rpg metasfechadas + Text L)', () => {
  it('sobe quando há exatamente N fechamentos e média > meta do nível', () => {
    const r = reguaNivel(['300.00', '250.00', '200.00', '50.00'], 3, '240.00')
    expect(r.consideradas).toEqual(['300.00', '250.00', '200.00'])
    expect(r.media).toBe('250.00')
    expect(r.subir).toBe(true)
  })
  it('média igual à meta mantém (> estrito)', () => {
    expect(reguaNivel(['250.00', '250.00'], 2, '250.00').subir).toBe(false)
  })
  it('menos fechamentos que N mantém', () => {
    const r = reguaNivel(['900.00'], 3, '100.00')
    expect(r.media).toBe('900.00')
    expect(r.subir).toBe(false)
  })
  it('média ao centavo', () => {
    expect(reguaNivel(['0.01', '0.02', '0.02'], 3, null).media).toBe('0.02')
  })
  it('sem fechamentos', () => {
    expect(reguaNivel([], 3, '1.00')).toEqual({ consideradas: [], media: null, subir: false })
  })
})

describe('período', () => {
  it('limites do mês, inclusive fevereiro bissexto', () => {
    expect(limitesDoMes('2026-09')).toEqual({ inicio: '2026-09-01', fim: '2026-09-30' })
    expect(limitesDoMes('2028-02')).toEqual({ inicio: '2028-02-01', fim: '2028-02-29' })
    expect(limitesDoMes('2026-13')).toBeNull()
  })
  it('soma meses atravessando o ano', () => {
    expect(somarMeses('2026-01', -1)).toBe('2025-12')
    expect(somarMeses('2026-12', 1)).toBe('2027-01')
    expect(somarMeses('2026-03', -3)).toBe('2025-12')
  })
  it('mês corrente no fuso de São Paulo', () => {
    // 1º/10 02:00 UTC ainda é 30/09 em São Paulo
    expect(mesAtual(new Date('2026-10-01T02:00:00Z'))).toBe('2026-09')
  })
  it('valida data de calendário', () => {
    expect(ehDataIso('2026-02-28')).toBe(true)
    expect(ehDataIso('2026-02-30')).toBe(false)
    expect(ehDataIso('ontem')).toBe(false)
  })
  it('nome do mês derivado', () => {
    expect(nomeDoMes('2026-09-01')).toBe('setembro/2026')
  })
})

describe('filtros da URL', () => {
  const agora = new Date('2026-09-28T12:00:00Z')
  it('sem período: mês corrente (metas [DÚVIDA 2])', () => {
    expect(lerFiltrosMetas({}, agora)).toEqual({ inicio: '2026-09-01', fim: '2026-09-30', vendedor: null })
  })
  it('período invertido ou inválido cai no padrão', () => {
    expect(lerFiltrosMetas({ datainicio: '2026-09-30', datafim: '2026-09-01' }, agora).inicio).toBe('2026-09-01')
    expect(lerFiltrosMetas({ datainicio: 'x', datafim: '2026-09-01' }, agora).fim).toBe('2026-09-30')
  })
  it('vendedor só uuid', () => {
    const id = '8F5657C7-22E3-41F0-915A-9425A2CDB810'
    expect(lerFiltrosMetas({ vendedor: id }, agora).vendedor).toBe(id.toLowerCase())
    expect(lerFiltrosMetas({ vendedor: 'drop' }, agora).vendedor).toBeNull()
  })
  it('ida e volta', () => {
    const f = lerFiltrosMetas({ datainicio: '2026-08-01', datafim: '2026-08-31' }, agora)
    expect(paraQueryMetas(f)).toBe('?datainicio=2026-08-01&datafim=2026-08-31')
  })
})

describe('validarMeta', () => {
  const base = () => {
    const f = new FormData()
    f.set('vendedor_id', '8f5657c7-22e3-41f0-915a-9425a2cdb810')
    f.set('nivel_id', '11594746-f9ec-4f65-b8d1-deb48acee386')
    f.set('tipo_meta_id', '1')
    f.set('mes', '2026-09')
    f.set('valor_meta', '1.234,56')
    return f
  }
  it('aceita e alinha o período ao mês', () => {
    const r = validarMeta(base())
    expect(r).toEqual({
      ok: true,
      dados: expect.objectContaining({
        valor_meta: '1234.56',
        periodo_inicio: '2026-09-01',
        periodo_fim: '2026-09-30',
        tipo_meta_id: 1,
      }),
    })
  })
  it('valor tem de ser > 0 (011 D9)', () => {
    const f = base()
    f.set('valor_meta', '0,00')
    expect(validarMeta(f)).toEqual({ ok: false, erro: 'O valor da meta tem de ser maior que zero.' })
  })
  it('recusa tipo, mês e vendedor inválidos', () => {
    for (const [c, v] of [['tipo_meta_id', '3'], ['mes', '2026-9'], ['vendedor_id', 'x']] as const) {
      const f = base()
      f.set(c, v)
      expect(validarMeta(f).ok).toBe(false)
    }
  })
})

describe('lerPercentualDigitado (fator do nível, fração)', () => {
  it('7,25 → 0.0725', () => {
    expect(lerPercentualDigitado('7,25')).toBe('0.0725')
    expect(lerPercentualDigitado('3,33 %')).toBe('0.0333')
    expect(lerPercentualDigitado('100')).toBe('1.0000')
  })
  it('fora de 0..100 ou lixo → null', () => {
    expect(lerPercentualDigitado('100,01')).toBeNull()
    expect(lerPercentualDigitado('-1')).toBeNull()
    expect(lerPercentualDigitado('abc')).toBeNull()
  })
})
