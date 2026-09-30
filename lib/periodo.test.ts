import { describe, expect, it } from 'vitest'

import {
  atalhoDoIntervalo,
  diaDaSemana,
  diasNoMes,
  escolherDia,
  formatarPeriodo,
  gradeDoMes,
  hojeEmSaoPaulo,
  intervaloDoAtalho,
  isoValida,
  nomeDoMes,
  somarDias,
  somarMeses,
} from './periodo'

describe('hojeEmSaoPaulo', () => {
  it('usa o fuso de São Paulo, não o UTC', () => {
    // 01/10 às 01:30 UTC ainda é 30/09 às 22:30 em São Paulo
    expect(hojeEmSaoPaulo(new Date('2026-10-01T01:30:00Z'))).toBe('2026-09-30')
    expect(hojeEmSaoPaulo(new Date('2026-10-01T03:00:00Z'))).toBe('2026-10-01')
  })
})

describe('diasNoMes', () => {
  it('conhece meses de 28, 29, 30 e 31 dias', () => {
    expect(diasNoMes(2026, 2)).toBe(28)
    expect(diasNoMes(2028, 2)).toBe(29)
    expect(diasNoMes(2100, 2)).toBe(28)
    expect(diasNoMes(2000, 2)).toBe(29)
    expect(diasNoMes(2026, 9)).toBe(30)
    expect(diasNoMes(2026, 12)).toBe(31)
  })
})

describe('somarDias / somarMeses', () => {
  it('vira mês e ano', () => {
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01')
    expect(somarDias('2027-01-01', -1)).toBe('2026-12-31')
    expect(somarDias('2028-02-28', 1)).toBe('2028-02-29')
    expect(somarDias('2026-02-28', 1)).toBe('2026-03-01')
  })
  it('anda meses com virada de ano', () => {
    expect(somarMeses({ ano: 2026, mes: 12 }, 1)).toEqual({ ano: 2027, mes: 1 })
    expect(somarMeses({ ano: 2026, mes: 1 }, -1)).toEqual({ ano: 2025, mes: 12 })
    expect(somarMeses({ ano: 2026, mes: 9 }, 15)).toEqual({ ano: 2027, mes: 12 })
  })
})

describe('diaDaSemana e grade', () => {
  it('conta a semana a partir da segunda (0 = seg, 6 = dom)', () => {
    expect(diaDaSemana('2026-09-28')).toBe(0) // segunda
    expect(diaDaSemana('2026-09-01')).toBe(1) // terça
    expect(diaDaSemana('2026-10-04')).toBe(6) // domingo
  })
  it('monta a grade começando na segunda, com vazios antes do dia 1', () => {
    const g = gradeDoMes({ ano: 2026, mes: 9 })
    expect(g[0]).toEqual([null, '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06'])
    expect(g.flat().filter(Boolean)).toHaveLength(30)
    expect(g.at(-1)!.filter(Boolean).at(-1)).toBe('2026-09-30')
    g.forEach((semana) => expect(semana).toHaveLength(7))
  })
  it('mês que começa no domingo tem seis vazios antes', () => {
    // 01/02/2026 é domingo
    const g = gradeDoMes({ ano: 2026, mes: 2 })
    expect(g[0]!.slice(0, 6)).toEqual([null, null, null, null, null, null])
    expect(g[0]![6]).toBe('2026-02-01')
    expect(g.flat().filter(Boolean)).toHaveLength(28)
  })
})

describe('atalhos', () => {
  const hoje = '2026-09-30'
  it('calcula cada atalho', () => {
    expect(intervaloDoAtalho('hoje', hoje)).toEqual({ de: '2026-09-30', ate: '2026-09-30' })
    expect(intervaloDoAtalho('ontem', hoje)).toEqual({ de: '2026-09-29', ate: '2026-09-29' })
    expect(intervaloDoAtalho('7dias', hoje)).toEqual({ de: '2026-09-24', ate: '2026-09-30' })
    expect(intervaloDoAtalho('30dias', hoje)).toEqual({ de: '2026-09-01', ate: '2026-09-30' })
    expect(intervaloDoAtalho('mes', hoje)).toEqual({ de: '2026-09-01', ate: '2026-09-30' })
    expect(intervaloDoAtalho('mesPassado', hoje)).toEqual({ de: '2026-08-01', ate: '2026-08-31' })
    expect(intervaloDoAtalho('ano', hoje)).toEqual({ de: '2026-01-01', ate: '2026-12-31' })
  })
  it('vira o ano em janeiro e respeita fevereiro bissexto', () => {
    expect(intervaloDoAtalho('mesPassado', '2027-01-10')).toEqual({ de: '2026-12-01', ate: '2026-12-31' })
    expect(intervaloDoAtalho('ontem', '2027-01-01')).toEqual({ de: '2026-12-31', ate: '2026-12-31' })
    expect(intervaloDoAtalho('mesPassado', '2028-03-05')).toEqual({ de: '2028-02-01', ate: '2028-02-29' })
    expect(intervaloDoAtalho('7dias', '2027-01-03')).toEqual({ de: '2026-12-28', ate: '2027-01-03' })
  })
  it('reconhece o atalho de um intervalo; o resto é personalizado', () => {
    // setembro tem 30 dias: "Este mês" e "Últimos 30 dias" coincidem; o mês ganha
    expect(atalhoDoIntervalo('2026-09-01', '2026-09-30', hoje)).toBe('mes')
    expect(atalhoDoIntervalo('2026-09-24', '2026-09-30', hoje)).toBe('7dias')
    expect(atalhoDoIntervalo('2026-08-01', '2026-08-31', hoje)).toBe('mesPassado')
    expect(atalhoDoIntervalo('2026-09-30', '2026-09-30', hoje)).toBe('hoje')
    expect(atalhoDoIntervalo('2026-09-03', '2026-09-12', hoje)).toBe('personalizado')
    expect(atalhoDoIntervalo('', '', hoje)).toBe('personalizado')
  })
})

describe('escolherDia', () => {
  it('primeiro clique abre, segundo fecha; ordem invertida é corrigida', () => {
    let s = escolherDia({ de: '2026-09-01', ate: '2026-09-30', esperandoFim: false }, '2026-09-10')
    expect(s).toEqual({ de: '2026-09-10', ate: '', esperandoFim: true })
    s = escolherDia(s, '2026-10-05')
    expect(s).toEqual({ de: '2026-09-10', ate: '2026-10-05', esperandoFim: false })
    s = escolherDia(escolherDia(s, '2026-09-20'), '2026-09-15')
    expect(s).toEqual({ de: '2026-09-15', ate: '2026-09-20', esperandoFim: false })
  })
  it('mesmo dia duas vezes é intervalo de um dia', () => {
    const s = escolherDia(escolherDia({ de: '', ate: '', esperandoFim: false }, '2026-09-10'), '2026-09-10')
    expect(s).toEqual({ de: '2026-09-10', ate: '2026-09-10', esperandoFim: false })
  })
})

describe('formatação', () => {
  it('mostra dd/mm/aaaa - dd/mm/aaaa', () => {
    expect(formatarPeriodo('2026-09-01', '2026-09-30')).toBe('01/09/2026 - 30/09/2026')
    expect(formatarPeriodo('2026-09-01', '')).toBe('01/09/2026 - …')
    expect(formatarPeriodo('', '2026-09-30')).toBe('… - 30/09/2026')
    expect(formatarPeriodo('', '')).toBe('')
  })
  it('nomeia o mês em português, minúsculo', () => {
    expect(nomeDoMes({ ano: 2026, mes: 9 })).toBe('setembro 2026')
    expect(nomeDoMes({ ano: 2027, mes: 3 })).toBe('março 2027')
  })
  it('valida AAAA-MM-DD de verdade', () => {
    expect(isoValida('2026-09-30')).toBe(true)
    expect(isoValida('2026-02-30')).toBe(false)
    expect(isoValida('2026-9-3')).toBe(false)
    expect(isoValida('')).toBe(false)
  })
})
